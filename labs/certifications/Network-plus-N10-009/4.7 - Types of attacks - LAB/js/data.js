/*!
 * Harborview Port Watch - N10-009 Lesson 4.7 (static port v4)
 * js/data.js - shared constants + tiny utilities + ALL lab content:
 * attack families, glossary, ticker lines, console evidence, objective
 * definitions (with their per-mission validation rules) and quiz banks.
 * Content is carried over 1:1 from the source lab.
 * Load order: data.js -> state.js -> ui.js -> objectives.js -> quiz.js -> app.js
 */
'use strict';
/* ============ Harborview Port Watch — data ============ */
const LS_KEY = 'hccf-portwatch-v1';
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = t => String(t == null ? '' : t).trim().toLowerCase().replace(/\s+/g,' ');
const macnorm = t => norm(t).replace(/[^0-9a-f]/g,'');

/* --- Attack families (Field Manual chapters; ids are stable answer keys) --- */
const ATTACKS = [
 {id:'dos', name:'DoS / DDoS', aka:'Denial of Service / Distributed DoS', layer:'Network / Transport (L3–L4)',
  cia:'Availability',
  def:'Flooding a target with more traffic than it can serve — from one source (DoS) or many compromised hosts, a botnet (DDoS) — until legitimate users are locked out.',
  how:'Flood-based variants exhaust bandwidth or connection state. A classic example is the SYN flood: the attacker sends thousands of TCP SYNs (often with spoofed source IPs) and never completes the handshakes, so the target’s connection backlog fills.',
  why:'Cheap to rent (booter/stressor services), hard to attribute, and effective as either extortion or — as in this incident — a diversion that occupies the response team while quieter attacks land.',
  chain:'Usually launched from many compromised endpoints; in this campaign it runs <em>during</em> the credential-harvest phase to distract defenders.',
  detect:'Traffic baselines and NetFlow alerts (Gbps/pps spikes), SYN backlog growth, high share of half-open connections, many unique source IPs.',
  mitigate:'Rate limiting, upstream scrubbing/filtering by the ISP or DDoS service, CDN/anycast distribution to absorb volume, SYN cookies on endpoints.',
  real:'Mirai botnet, 2016 — hundreds of thousands of hijacked IoT devices flooded DNS provider Dyn and disrupted major sites; documented publicly by multiple vendors.',
  lab:'NETCORE console → Traffic Meter.'},
 {id:'vlan', name:'VLAN hopping', aka:'Switch spoofing / 802.1Q double-tagging', layer:'Data link (L2)',
  cia:'Confidentiality & Integrity (of segmentation)',
  def:'Crafting frames so a host on one VLAN reaches another VLAN without authorization, bypassing segmentation.',
  how:'Two variants. <strong>Switch spoofing:</strong> the attacker speaks trunk negotiation (DTP) so the switch makes their port a trunk and carries all VLANs. <strong>Double-tagging:</strong> the attacker sends a frame with two 802.1Q tags — the outer tag must match the native VLAN, so the first switch strips it and forwards the inner tag into the target VLAN. <span class="term" title="Simplified: modern switches mitigate most double-tagging; native-VLAN hygiene is still exam-relevant.">simplified</span>',
  why:'VLANs are how campuses separate staff, voice, warehouse and guest traffic; hopping across that boundary defeats the segmentation control itself.',
  chain:'Layer-2 step that enables rogue services elsewhere in the network — in this campaign it lets the planted device reach the VoIP VLAN.',
  detect:'Unexpected trunk negotiation on access ports, DTP events, double-tagged frame counters, unexpected VLAN IDs on access ports.',
  mitigate:'Disable auto-trunking/DTP on access ports, set the native VLAN to an unused ID, disable unused ports, explicit trunk configuration.',
  real:'Double-tagging weaknesses were demonstrated publicly in early-2000s switch-security research (e.g., Arista/Cisco whitepapers and DEF CON talks); mitigations became standard hardening practice.',
  lab:'SWITCH console → Ports & Trunks (native VLAN 1, DTP auto).'},
 {id:'mac', name:'MAC flooding', aka:'CAM-table overflow', layer:'Data link (L2)',
  cia:'Availability first, then Confidentiality',
  def:'Blasting the switch with frames carrying thousands of fake source MAC addresses until the CAM (MAC address) table is full.',
  how:'A switch learns source MACs per port. When the table is full, new unknown destinations cannot be learned, so the switch <strong>fails open</strong>: it floods frames out of every port — exactly what a hub does — letting the attacker sniff traffic meant for others.',
  why:'It is a one-command route to traffic visibility on a switched network; it also degrades the switch for everyone (availability).',
  chain:'Often the first L2 move after gaining physical access, because it needs nothing but a cable into a live port.',
  detect:'Port-security violation traps, abnormal CAM growth rate per port, CAM utilization alarms, port flapping.',
  mitigate:'Port security (limit MACs per port, violation shutdown/restrict), CAM utilization monitoring, disable unused ports.',
  real:'The dsniff suite (macof, late 1990s) demonstrated CAM-overflow flooding publicly and drove the adoption of port security.',
  lab:'SWITCH console → CAM Table snapshot; evidence port Gi1/0/7.'},
 {id:'arp', name:'ARP poisoning / spoofing', aka:'ARP cache poisoning', layer:'Data link (L2)',
  cia:'Integrity first, enabling Confidentiality loss',
  def:'Sending forged ARP replies so hosts and gateways cache wrong IP→MAC pairs and send traffic to the attacker.',
  how:'ARP has no authentication: any host can announce “10.20.30.1 is at my MAC” — including <strong>gratuitous ARP</strong> announcements that update everyone’s cache. Victims then send their gateway traffic to the attacker, who relays it (and can read or alter it).',
  why:'It silently converts a switched network into an interceptable one, and it is the standard on-ramp to an <strong>on-path attack</strong>.',
  chain:'Enabled by local network access (planted device, malware, or a spoofed host); leads directly to on-path interception.',
  detect:'Dynamic ARP Inspection (DAI) violation logs, duplicate IP→MAC bindings, gateway MAC changes, gratuitous-ARP rate alarms.',
  mitigate:'Dynamic ARP Inspection fed by DHCP snooping binding tables; static ARP entries for critical hosts where practical.',
  real:'arpspoof (dsniff suite, late 1990s) popularized ARP cache poisoning; the technique is a standing fixture of switch-hardening guidance.',
  lab:'HOSTDESK console → ARP Table (gateway conflict) and Packet Capture.'},
 {id:'dns', name:'DNS poisoning / spoofing', aka:'Cache poisoning, forged responses', layer:'Application (L7, resolver)',
  cia:'Integrity first, enabling Confidentiality loss',
  def:'Corrupting name resolution so a hostname returns an attacker-controlled IP — via a forged response (spoofing) or a poisoned resolver cache.',
  how:'The resolver trusts replies matching query ID/port. Forged or injected responses that match those values — or vulnerable resolvers accepting additional records — install a wrong A record, often with a short TTL so clients refresh into the lie.',
  why:'One poisoned record silently redirects every user of that hostname to the attacker’s server: perfect pairing with a phishing page.',
  chain:'In this campaign the poisoned portal record sends staff to the same IP that the phishing mail and rogue DHCP already pointed at.',
  detect:'DNSSEC validation failures, TTL anomalies, out-of-bailiwick answers, monitoring of critical A records.',
  mitigate:'DNSSEC (signed, validated records), authoritative-data-only resolvers, patching resolver randomization, monitoring critical records.',
  real:'The 2008 “Kaminsky” cache-poisoning flaw affected resolvers industry-wide and forced an emergency worldwide patch cycle.',
  lab:'NETCORE console → DNS Cache (portal record).'},
 {id:'dhcp', name:'Rogue devices & services', aka:'Rogue DHCP, rogue AP, unauthorized device', layer:'L2/L3 services',
  cia:'Varies — usually Integrity, enabling Confidentiality loss',
  def:'Any device or service attached to the network without authorization: a rogue DHCP server, a rogue access point, an unplugged switch.',
  how:'A <strong>rogue DHCP server</strong> answers lease requests faster than the real one and hands out a false gateway and DNS — pointing victims through the attacker. A <strong>rogue AP</strong> offers an unauthorized wireless way in. The device in this campaign was planted after a tailgating entry.',
  why:'The service is the attack: clients never chose it, they simply accepted the fastest answer.',
  chain:'Usually the pivot that enables on-path traffic redirection; planted devices persist after the attacker leaves the building.',
  detect:'DHCP snooping blocked-request logs, unauthorized server identifiers in leases, 802.1X/NAC failures, wireless spectrum surveys, port-security traps.',
  mitigate:'DHCP snooping (trust only the real uplink), NAC/802.1X, port security, disable unused ports, WIPS/spectrum surveys.',
  real:'Rogue-DHCP incidents are a recurring theme in campus audits; the mitigations (snooping + NAC) are standard in CompTIA guidance.',
  lab:'NETCORE → DHCP Leases; WAPCTL → AP list (TP-LINK_9F2C).'},
 {id:'twin', name:'Evil twin', aka:'AP cloning / rogue twin', layer:'Wireless (L1–L2)',
  cia:'Confidentiality',
  def:'An attacker-controlled AP that clones a legitimate SSID (and often a captive portal) so clients connect to it instead of the real network.',
  how:'Clients pick the <strong>stronger signal</strong> of a matching SSID. The twin uses higher transmit power, open or weakly-secured association, and a captive portal (or just passive sniffing) to harvest credentials and traffic.',
  why:'It needs no cable and no credentials — just the SSID string, which broadcasts itself all day.',
  chain:'Complements phishing: harvested credentials arrive on the attacker’s infrastructure, as in this campaign’s fake portal.',
  detect:'WIPS (wireless IPS) rogue/clone detection, spectrum survey, client-join reports listing unexpected BSSIDs.',
  mitigate:'WPA3-Enterprise/802.1X so clients demand server-certificate validation, disable legacy open/PSK for staff, WIPS containment, guest isolation.',
  real:'Evil-twin incidents at airports and hotels are repeatedly documented in law-enforcement advisories; 802.1X is the standard structural defense.',
  lab:'WAPCTL console → AP list (BSSID …A0:F5).'},
 {id:'onpath', name:'On-path attack', aka:'formerly man-in-the-middle', layer:'Any, typically L2/L3 pivot',
  cia:'Confidentiality & Integrity',
  def:'The attacker silently intercepts — and may relay or alter — traffic between two endpoints that believe they are talking directly.',
  how:'Position first (ARP/DHCP poisoning, evil twin, rogue device), then relay. Victims see normal service; the attacker reads (and optionally modifies) the stream. Encryption in transit is what keeps an on-path position from becoming a breach. <span class="term" title="Evidence simplified for training: TTL decrement is used as the relay hint.">simplified</span>',
  why:'It is the payoff step of the L2 attacks in this lesson — poisoning gets you the position, on-path gets you the data.',
  chain:'Follows ARP/DHCP/evil-twin positioning almost mechanically.',
  detect:'Asymmetric paths, unexpected relay MACs in captures, TLS-certificate warnings reported by users.',
  mitigate:'Encryption in transit (TLS/VPN/IPsec), DAI + DHCP snooping to remove the L2 position, certificate validation (no user overrides).',
  real:'On-path interception against unencrypted traffic is a core CERT/CC advisory theme; the mitigation set (DAI, VPN, HSTS) is standard.',
  lab:'HOSTDESK console → Packet Capture.'},
 {id:'phish', name:'Phishing', aka:'credential harvesting mail', layer:'Social / Application',
  cia:'Confidentiality (credentials) → Integrity',
  def:'Fraudulent messages that impersonate a trusted sender to make the recipient click, log in, or open something harmful.',
  how:'Tells to look for: <strong>sender-domain mismatch</strong> (lookalike domain), <strong>link text ≠ real URL</strong>, <strong>urgency/pressure</strong> (“expires tonight”), <strong>generic greeting</strong>, requests to enter credentials on an unfamiliar page, and failing SPF/DMARC in the headers.',
  why:'It converts the technical campaign into stolen credentials — and it works from outside the network perimeter.',
  chain:'In this campaign it harvests the credentials the evil twin and fake portal captured.',
  detect:'Header analysis (SPF/DKIM/DMARC results), link/URL mismatch scanners, user reports.',
  mitigate:'Security-awareness training, mail filtering/quarantine, FIDO/MFA so stolen passwords alone are not enough, report-and-block workflow.',
  real:'FBI IC3 annual reports document business email compromise losses in the billions of US dollars per year.',
  lab:'MAILGATE console → “Password expires tonight” message.'},
 {id:'social', name:'Dumpster diving · Shoulder surfing · Tailgating', aka:'physical social engineering', layer:'Physical / Human',
  cia:'Confidentiality',
  def:'Human-vector attacks: harvesting discarded sensitive print (dumpster diving), watching screens or keypads (shoulder surfing), and slipping through a badge-controlled door behind someone else (tailgating/piggybacking).',
  how:'All three exploit convenience: bins without shredding, screens facing public space, doors that close slowly and politely hold. Tailgating usually needs only one distracted employee — and it is how the planted device in this campaign entered the building.',
  why:'No exploit is needed; the cheapest attack surface in any organization is a habit.',
  chain:'Frequently step one of an otherwise technical intrusion — here, the planted rogue device depends on it.',
  detect:'Badge-log anomalies (one swipe, several people), visitor-registry reconciliation, shredding audits, camera review.',
  mitigate:'Mantrap/turnstile at sensitive doors, escort policy and visitor badges, shred-all with locked bins, privacy film/screens, security-awareness training.',
  real:'Physical-entry social engineering is a standard red-team opening, documented across published penetration-test reports.',
  lab:'ACCESS-CTRL console → Badge Log, Visitor Registry, Facility Notes.'}
];
const ATK_BY_ID = Object.fromEntries(ATTACKS.map(a => [a.id, a]));

/* --- Glossary --- */
const GLOSSARY = [
 ['CAM table','A switch’s MAC address table: which source MAC was learned on which port. Full table = flooding.'],
 ['Fail-open','Breaking into a permissive state when overwhelmed — a flooded switch floods frames like a hub.'],
 ['Gratuitous ARP','An unsolicited ARP announcement used to update other hosts’ caches; attackers abuse it to poison.'],
 ['DHCP snooping','Switch feature that filters DHCP messages, trusting only designated (uplink) ports.'],
 ['Dynamic ARP Inspection (DAI)','Switch feature that drops ARP replies not matching the DHCP-snooping binding table.'],
 ['Native VLAN','The VLAN that carries untagged frames on a trunk; must not be VLAN 1, ideally an unused ID.'],
 ['802.1Q double-tagging','Attacker frames with two VLAN tags; the first switch strips the outer (native) tag and forwards the inner into the target VLAN.'],
 ['DTP / auto-trunking','Dynamic Trunking Protocol — lets a port negotiate into a trunk; must be disabled on access ports.'],
 ['BSSID','The MAC address of a specific AP (vs SSID, the network name). Clones share the SSID but not the BSSID.'],
 ['WIPS','Wireless IPS — detects and contains rogue/clone APs.'],
 ['WPA3-Enterprise / 802.1X','Per-user port-based access control; clients validate the network’s server certificate.'],
 ['DNSSEC','Signed DNS records giving origin authenticity and integrity — not confidentiality.'],
 ['SYN backlog','Queue of half-open TCP connections; a SYN flood fills it.'],
 ['Mantrap','A two-door vestibule that admits one badged person at a time; defeats tailgating.']
];

/* --- Ticker --- */
const TICKS = [
 'Feed: SYN backlog on portal edge 203.0.113.10 at 94% — upstream provider engaged.',
 'Feed: CAM utilization 97% on HCCF-ACC-SW1 — port Gi1/0/7 learning hundreds of MACs per second.',
 'Feed: gateway 10.20.30.1 answering at MAC C4:71:54:2E:99:0A — investigate before touching the ARP cache.',
 'Feed: portal.harborview.example A record changed 19:20 — TTL now 30 s.',
 'Feed: unauthorized DHCP server identifier seen on VoIP VLAN 20.',
 'Feed: client L-Torres-TP joined BSSID 8A:1F:9E:44:A0:F5 — that is NOT our CORP-SECURE radio.',
 'Feed: badge #4211 opened IDF-2 corridor 18:42 — camera shows two persons.',
 'Feed: recycling audit — unshredded freight manifests recovered Nov 6.',
 'Remember: ARP has no authentication — verify with DAI logs, not with ping.',
 'Remember: DNSSEC gives origin authenticity, not confidentiality.',
 'Remember: a stronger signal of the same SSID is a reason to verify the BSSID, not to join it.',
 'Remember: one badge swipe, two people — that is tailgating, however polite the second person was.',
 'Training note: exam objective 4.2 asks for each attack AND its impact on the network.',
 'Training note: objective 4.3 hardening — disable what you do not use, authenticate what you do.'
];
/* ============ Simulated evidence (all synthetic) ============ */
const EVID = {
 camNormal:[
  {p:'Gi1/0/2', m:'a4:5e:60:c1:02:11', d:'Dispatcher PC-02'},
  {p:'Gi1/0/3', m:'00:1b:63:9f:22:7a', d:'Label printer PR-2'},
  {p:'Gi1/0/12', m:'00:04:f2:aa:31:05', d:'VoIP phone WH-114'},
  {p:'Gi1/0/14', m:'3c:2a:f4:08:77:e2', d:'Warehouse scanner W-9'},
  {p:'Gi1/0/19', m:'84:7b:57:22:19:0d', d:'WH-PC-31 (your desk)'},
  {p:'Gi1/0/21', m:'d8:0d:17:6c:44:31', d:'AP-FLOOR2'},
  {p:'Gi1/0/24', m:'00:23:ea:c7:10:88', d:'Uplink → core'},
  {p:'Gi1/0/7', m:'—', d:'(spare port, no learning)'}
 ],
 camFloodFakes:[
  '00:11:8f:2c:44:9a','54:b2:03:7f:11:02','9e:31:cc:04:77:1b','a2:44:17:90:33:e5','07:6a:9d:14:02:88','3f:90:1b:6c:55:21','c1:04:77:2e:99:3d','8b:2f:04:11:90:7c'
 ],
 ports:[
  {p:'Gi1/0/1', role:'Uplink trunk → core', vlan:'trunk: 10,20,30,992', st:'up'},
  {p:'Gi1/0/2', role:'Dispatcher PC-02', vlan:'30 (warehouse)', st:'up'},
  {p:'Gi1/0/3', role:'Label printer PR-2', vlan:'30', st:'up · input errors (NIC aging)', bad:true},
  {p:'Gi1/0/7', role:'Dock office spare — 3,217 MACs learned', vlan:'30', st:'up · CAM storm source', bad:true},
  {p:'Gi1/0/9', role:'Unused', vlan:'—', st:'administratively down', ok:true},
  {p:'Gi1/0/12', role:'VoIP phone WH-114', vlan:'20 voice / 30 data', st:'up'},
  {p:'Gi1/0/15', role:'Unused', vlan:'—', st:'administratively down', ok:true},
  {p:'Gi1/0/19', role:'WH-PC-31', vlan:'30', st:'up'},
  {p:'Gi1/0/24', role:'Trunk → core switch', vlan:'trunk: 10,20,30,992', st:'up'}
 ],
 arp:[
  {ip:'10.20.30.1', mac:'c4:71:54:2e:99:0a', typ:'dynamic (gateway conflict)', bad:true},
  {ip:'10.20.30.100', mac:'c4:71:54:2e:99:0a', typ:'dynamic (APEX-5, dock office)', bad:true},
  {ip:'10.20.30.44', mac:'a4:5e:60:c1:02:11', typ:'dynamic', ok:true},
  {ip:'10.20.30.5', mac:'00:23:ea:c7:10:88', typ:'dynamic (gateway VLAN interface)', ok:true},
  {ip:'10.20.30.31', mac:'84:7b:57:22:19:0d', typ:'this host', ok:true}
 ],
 arpNote:'Last-known-good binding on record: 10.20.30.1 → aa:bb:cc:04:10:01 (from the Oct validation export).',
 pcap:[
  {t:'19:12:04', line:'10.20.30.31 → 10.20.30.1 · ICMP echo — reply path shows next-hop MAC C4:71:54:2E:99:0A (not the gateway MAC)', bad:true},
  {t:'19:12:07', line:'10.20.30.31 → 198.51.100.24 :443 · TLS — duplicate ACKs observed sourced from 10.20.30.100; server-side TTL reduced by 2 (relay hint, simplified)', bad:true},
  {t:'19:12:11', line:'10.20.30.100 → broadcast · gratuitous ARP “10.20.30.1 is at c4:71:54:2e:99:0a” ×46/min', bad:true},
  {t:'19:14:55', line:'10.20.30.240 → multiple · TCP SYN sweep, ports 22/443/3389 — IT vulnerability scanner, change ticket #8841', ok:true},
  {t:'19:15:02', line:'10.20.30.31 → 10.20.30.255 · ARP request “who has 10.20.30.1” — reply from c4:71:54:2e:99:0a in 0.4 ms', bad:true}
 ],
 dns:[
  {h:'portal.harborview.example', t:'A', v:'185[.]22[.]3[.]207', ttl:'30', flag:'changed 19:20 — legit value 198.51.100.24 / TTL 3600', bad:true},
  {h:'booking.harborview.example', t:'A', v:'198.51.100.24', ttl:'3600', flag:'—'},
  {h:'www.harborview.example', t:'A', v:'198.51.100.25', ttl:'3600', flag:'—'},
  {h:'mail.harborview.example', t:'A', v:'198.51.100.30', ttl:'3600', flag:'—'},
  {h:'time-sync.harborview.example', t:'A', v:'198.51.100.40', ttl:'3600', flag:'—'},
  {h:'api.pacificcarriers.example', t:'A', v:'203.0.113.77', ttl:'1800', flag:'external carrier'}
 ],
 leases:[
  {c:'WH-Phone-114', srv:'10.20.20.100 (MAC C4:71:54:2E:99:0A)', gw:'10.20.20.100', dns:'185[.]22[.]3[.]207', bad:true},
  {c:'WH-Phone-117', srv:'10.20.20.100 (MAC C4:71:54:2E:99:0A)', gw:'10.20.20.100', dns:'185[.]22[.]3[.]207', bad:true},
  {c:'WH-Phone-121', srv:'10.20.20.5 (HCCF-CORE-DHCP — authorized)', gw:'10.20.20.1', dns:'10.20.20.5', ok:true}
 ],
 leaseNote:'Authorized DHCP server is HCCF-CORE-DHCP (10.20.20.5) on VoIP VLAN 20. No second server is authorized. DHCP snooping is currently OFF.',
 aps:[
  {ssid:'CORP-SECURE', b:'8a:1f:9e:44:a0:11', ch:'36 (5 GHz)', sig:'−52 dBm', auth:'WPA3-Enterprise (802.1X)', flag:'legitimate — HCCF radio'},
  {ssid:'HV-GUEST', b:'8a:1f:9e:44:a0:12', ch:'44 (5 GHz)', sig:'−55 dBm', auth:'WPA2-PSK portal', flag:'legitimate — guest'},
  {ssid:'CORP-SECURE', b:'8a:1f:9e:44:a0:f5', ch:'6 (2.4 GHz)', sig:'−38 dBm (stronger)', auth:'Open (captive portal)', flag:'SSID clone — NOT our radio', bad:true},
  {ssid:'TP-LINK_9F2C', b:'4c:5b:11:7c:9f:2c', ch:'11 (2.4 GHz)', sig:'−64 dBm', auth:'Open', flag:'rogue device — unknown vendor radio', bad:true}
 ],
 wcli:[
  {c:'L-Torres-TP', ip:'10.20.10.51', j:'CORP-SECURE @ 8a:1f:9e:44:a0:f5', bad:true},
  {c:'R-Patel-TP', ip:'10.20.10.52', j:'CORP-SECURE @ 8a:1f:9e:44:a0:f5', bad:true},
  {c:'Dispatcher-02', ip:'10.20.10.44', j:'CORP-SECURE @ 8a:1f:9e:44:a0:f5', bad:true}
 ],
 emails:[
  {id:'e1', from:'“HCCF IT Service Desk” <helpdesk@harborview-support.com>', subj:'Action required: Portal password expires tonight', dt:'Fri 21:04', phish:true,
   body:'<p>Dear User,</p><p>Your <strong>Harborview portal</strong> password expires in <strong>2 hours</strong>. Reset it now to avoid losing dock-scheduling access:</p><p><a href="#" data-href="http://185[.]22[.]3[.]207/portal/verify" class="phlink">https://portal.harborview.example/reset</a></p><p>Sign in with your current credentials to validate your account.</p><p>HCCF IT Service Desk</p>',
   headers:'From: "HCCF IT Service Desk" <helpdesk@harborview-support.com>\nReply-To: secure-portal.verify@fastmbox.example\nAuthentication-Results: harborview-mx; spf=fail (sender IP 185[.]22[.]3[.]207; domain owner: harborview.example); dmarc=fail\nReceived: from unknown (HELO mail.fastmbox.example) (185[.]22[.]3[.]207) by harborview-mx with ESMTP; Fri, 6 Nov 2026 21:04:11 +0000\nSubject: Action required: Portal password expires tonight\nX-Mailer: FastMblast 3.2 (bulk)',
   linktext:'Display text: https://portal.harborview.example/reset', linkhref:'Real target: http://185[.]22[.]3[.]207/portal/verify'},
  {id:'e2', from:'IT Notices <it-notices@harborview.example>', subj:'Scheduled maintenance — Sat 22:00 to Sun 02:00', dt:'Thu 09:15',
   body:'<p>Team,</p><p>The booking portal will be unavailable Saturday 22:00–Sunday 02:00 for patching. No action is needed. We will never ask for your password by email.</p><p>IT Notices</p>',
   headers:'From: IT Notices <it-notices@harborview.example>\nAuthentication-Results: harborview-mx; spf=pass; dmarc=pass\nReceived: from mail.harborview.example (198.51.100.30) by harborview-mx; Thu, 5 Nov 2026 09:15:02 +0000'},
  {id:'e3', from:'Pacific Carriers Billing <billing@pacificcarriers.example>', subj:'Invoice PC-88231 posted — terminal 9 drayage', dt:'Thu 14:40',
   body:'<p>Invoice PC-88231 for November drayage is posted to the carrier portal. Amount: $41,180.50. Reference your PO numbers in the portal.</p>',
   headers:'From: Pacific Carriers Billing <billing@pacificcarriers.example>\nAuthentication-Results: harborview-mx; spf=pass (pacificcarriers.example)\nReceived: from mx.pacificcarriers.example (203.0.113.77); Thu, 5 Nov 2026 14:40:55 +0000'},
  {id:'e4', from:'Facilities <facilities@harborview.example>', subj:'Dock gate code rotation — monthly', dt:'Wed 08:00',
   body:'<p>The dock gate code rotates on the 1st. The new code is available to supervisors at the security office (badge required). Do not share codes over email or phone.</p>',
   headers:'From: Facilities <facilities@harborview.example>\nAuthentication-Results: harborview-mx; spf=pass; dmarc=pass\nReceived: from mail.harborview.example (198.51.100.30); Wed, 4 Nov 2026 08:00:11 +0000'},
  {id:'e5', from:'Port District Events <events@portdistrict-b2b.example>', subj:'Vendor fair — early-bird tables', dt:'Thu 11:02', hard:true,
   body:'<p>Exhibitor tables for the spring port vendor fair are open. Early-bird pricing ends Dec 1.</p>',
   headers:'From: Port District Events <events@portdistrict-b2b.example>\nAuthentication-Results: harborview-mx; spf=pass (portdistrict-b2b.example)\nReceived: from mx.portdistrict-b2b.example; Thu, 5 Nov 2026 11:02:19 +0000'}
 ],
 badge:[
  {t:'Wed Nov 4 · 08:03', line:'Badge #4217 (visitor D. Okafor) — Lobby turnstile, accompanied by escort M. Reyes (#4150) — both badged', ok:true},
  {t:'Wed Nov 4 · 04:31', line:'Badge #0102 (contract cleaner) — Lobby, scheduled 04:00–06:00 window', ok:true},
  {t:'Thu Nov 5 · 18:41:58', line:'Badge #4211 (J. Alvarez, dispatcher) — Lobby turnstile', ok:true},
  {t:'Thu Nov 5 · 18:42:11', line:'Badge #4211 — IDF-2 corridor door (single swipe) — camera note: TWO persons pass; second carries tool bag', bad:true},
  {t:'Fri Nov 6 · 07:58', line:'Badge #4211 — dispatcher desk, normal start', ok:true},
  {t:'Fri Nov 6 · 22:10', line:'Night guard log: “IDF-2 door closes ~8 s after release; no mantrap; complaint filed.”', ok:true}
 ],
 visitors:[
  {line:'D. Okafor — vendor, Pacific Carriers · Wed Nov 4 · host M. Reyes · badge #4217 issued, returned 16:20', ok:true}
 ],
 notes:[
  {t:'Nov 6 · recycling audit', line:'Locked-document bins are EMPTY; the unlocked recycling cart holds full freight manifests — customer names, addresses, PO values. Unshredded.', bad:true},
  {t:'Nov 5 · dispatch floor', line:'Booking-desk monitors face the lobby glass wall. Queue line is ~7 m away; screens readable from outside.', bad:true},
  {t:'Nov 5 · IDF-2', line:'Corridor door has no mantrap/turnstile; badge reader opens latch 8 s. Night guard reports tailgating complaints.', bad:true},
  {t:'Nov 3 · dock office', line:'Spare port Gi1/0/7 wall-plate was found unmapped in last audit — “spare, believed unused”.', bad:true}
 ],
 dos:{edge:'203.0.113.10', base:'0.4 Gbps / 12k pps', cur:'11.8 Gbps / 1.9M pps', syn:'94% (480k half-open)', src:'40,118 unique source IPs, randomized/spoofed', window:'attack window 21:30 → ongoing', talkers:[
  {s:'randomized 40.1k sources', note:'SYN, no ACK completion — spoofed/non-completing clients'},
  {s:'30.1k sources', note:'ICMP echo flood, low payload (secondary noise)'}
 ]}
};
/* ============ Objectives ============ */
const ATK_OPTS = [
 {v:'dos',l:'DoS / DDoS'},{v:'vlan',l:'VLAN hopping'},{v:'mac',l:'MAC flooding'},
 {v:'arp',l:'ARP poisoning / spoofing'},{v:'dns',l:'DNS poisoning / spoofing'},
 {v:'dhcp',l:'Rogue devices & services'},{v:'twin',l:'Evil twin'},
 {v:'onpath',l:'On-path attack'},{v:'phish',l:'Phishing'},{v:'tail',l:'Tailgating (social engineering)'}
];
const CIA_OPTS = [
 {v:'C',l:'Confidentiality'},{v:'I',l:'Integrity'},{v:'A',l:'Availability'}
];
const CONS_OPTS = [
 {v:'switch',l:'SWITCH-01'},{v:'netcore',l:'NETCORE'},{v:'wireless',l:'WAPCTL'},
 {v:'hostdesk',l:'HOSTDESK'},{v:'mail',l:'MAILGATE'},{v:'access',l:'ACCESS-CTRL'}
];
const DET_OPTS = [
 {v:'cam',l:'Port-security traps & CAM utilization alerting'},
 {v:'dai',l:'Dynamic ARP Inspection violation logs'},
 {v:'flow',l:'NetFlow / traffic-rate baseline alarms'},
 {v:'wips',l:'WIPS spectrum survey & client-join reports'},
 {v:'dnsval',l:'DNSSEC validation failures & TTL anomalies'},
 {v:'turn',l:'Mantrap interlocks & camera review'}
];
const CTRL_OPTS = [
 {v:'rate',l:'Rate limiting on the edge / upstream',c:1},
 {v:'scrub',l:'Upstream scrubbing & filtering (ISP or DDoS service)',c:1},
 {v:'cdn',l:'CDN / anycast distribution to absorb volume',c:1},
 {v:'syn',l:'SYN cookies on the endpoint',c:1},
 {v:'router',l:'Shut the edge router down until it stops',c:0},
 {v:'block',l:'Block ALL inbound traffic at the firewall',c:0},
 {v:'dnsoff',l:'Turn off public DNS resolution',c:0}
];
const ATTR_OPTS = [
 {v:'mac',l:'MAC flooding'},{v:'arp',l:'ARP poisoning'},{v:'dhcp',l:'Rogue DHCP server'},
 {v:'dns',l:'DNS poisoning'},{v:'twin',l:'Evil twin'},{v:'dos',l:'DoS / DDoS'},
 {v:'legit-nic',l:'Not an attack — failing NIC (legitimate fault)'},{v:'legit-visitor',l:'Not an attack — authorized visitor'}
];
const TF_OPTS = [{v:'tp',l:'True positive — attack evidence'},{v:'fp',l:'False positive — legitimate / benign'}];

function atkRow(desc){ return {t:'select',label:desc,opts:ATK_OPTS}; }
const port7ok = v => /^g(i)?\s*1\s*\/\s*0\s*\/\s*7$/i.test(norm(v));

const OBJ_DEFS = [
/* ---------------- MEDIUM ---------------- */
{id:'M1', modes:['medium'], pillar:'P1', anchor:'Objective 4.2 — attack definitions',
 title:'Match the eight attack families to their definitions',
 brief:'Open the Field Manual (ribbon), read the ten families, then set each dropdown to the attack it describes. This is the vocabulary the exam tests.',
 cons:null,
 hints:['The Field Manual “What/How” lines are written from these same definitions — paraphrase, same idea.',
        'Two rows describe layer-2 tricks (a full CAM table; two VLAN tags). Two rows are services pretending to be someone else (DHCP; the AP).',
        'Row order: MAC flooding · DNS poisoning · DoS/DDoS · Evil twin · ARP poisoning · Rogue DHCP · VLAN hopping · On-path.'],
 fields:[
  Object.assign({k:'a1'}, atkRow('“Fills the switch’s CAM table so it floods frames out of every port.”')),
  Object.assign({k:'a2'}, atkRow('“Corrupts name-resolution records so users land on a false IP.”')),
  Object.assign({k:'a3'}, atkRow('“Overwhelms a target with traffic until legitimate users are locked out.”')),
  Object.assign({k:'a4'}, atkRow('“A look-alike wireless AP that captures traffic and credentials.”')),
  Object.assign({k:'a5'}, atkRow('“Sends forged ARP replies so hosts send their traffic to the attacker.”')),
  Object.assign({k:'a6'}, atkRow('“An unauthorized DHCP server hands out a false gateway and DNS.”')),
  Object.assign({k:'a7'}, atkRow('“Crafted 802.1Q frames reach another VLAN without authorization.”')),
  Object.assign({k:'a8'}, atkRow('“Silently intercepts (and may relay) traffic between two endpoints.”'))
 ],
 check(v){ const exp=['mac','dns','dos','twin','arp','dhcp','vlan','onpath'];
   const bad=[]; exp.forEach((e,i)=>{ if(v['a'+(i+1)]!==e) bad.push('row '+(i+1)); });
   return bad.length? {ok:false,msg:'Not yet — check '+bad.join(', ')+'. Read the Field Manual chapter for each row you missed; the definitions mirror the exam wording.'}
   : {ok:true,msg:'All eight match. You now have the vocabulary of objective 4.2 — next, know what each attack actually damages (CIA triad).'}; },
 pass:'Vocabulary locked in.',
 fail:''},
{id:'M2', modes:['medium'], pillar:'P1', anchor:'Objective 4.2 — “and their impact to the network”',
 title:'Choose the PRIMARY impact of each attack (CIA triad)',
 brief:'The exam asks for impact, not just names. Pick the primary element each attack damages first; the feedback explains the secondary effects.',
 cons:null,
 hints:['DoS is the only one whose headline damage is Availability.',
        'MAC flooding first breaks the switch itself (Availability), then enables sniffing (Confidentiality).',
        'Order: Evil twin · MAC flooding · ARP poisoning · DoS/DDoS · On-path · DNS poisoning · VLAN hopping · Rogue DHCP.'],
 fields:[
  {k:'c1',t:'select',label:'Evil twin — primary impact:',opts:CIA_OPTS},
  {k:'c2',t:'select',label:'MAC flooding — primary impact:',opts:CIA_OPTS},
  {k:'c3',t:'select',label:'ARP poisoning — primary impact:',opts:CIA_OPTS},
  {k:'c4',t:'select',label:'DoS / DDoS — primary impact:',opts:CIA_OPTS},
  {k:'c5',t:'select',label:'On-path attack — primary impact:',opts:CIA_OPTS},
  {k:'c6',t:'select',label:'DNS poisoning — primary impact:',opts:CIA_OPTS},
  {k:'c7',t:'select',label:'VLAN hopping — primary impact:',opts:CIA_OPTS},
  {k:'c8',t:'select',label:'Rogue DHCP — primary impact:',opts:CIA_OPTS}
 ],
 check(v){ const exp={c1:'C',c2:'A',c3:'I',c4:'A',c5:'C',c6:'I',c7:'C',c8:'I'};
   const bad=Object.keys(exp).filter(k=>v[k]!==exp[k]);
   return bad.length? {ok:false,msg:'Check '+bad.length+' row(s). Ask: “what breaks first?” — a flooded switch stops switching (Availability); a forged ARP/DNS answer corrupts data (Integrity); clones and interception steal data (Confidentiality).'}
   : {ok:true,msg:'Correct. Nuance worth knowing: ARP/DNS poisoning start as Integrity attacks and become Confidentiality losses; MAC flooding is the reverse — it breaks the switch first, then enables sniffing. “Impact on the network” is exactly what objective 4.2 tests.'}; },
 pass:'', fail:''},
{id:'M3', modes:['medium'], pillar:'P2', anchor:'CI-3 · SWITCH-01 → CAM Table',
 title:'Analyze the CAM-table evidence on SWITCH-01',
 brief:'Open SWITCH-01 and press “Snapshot CAM table now”. Identify the storming port, name the attack, and say what the switch does when its CAM table is full.',
 cons:'switch',
 hints:['In the snapshot, one port appears dozens of times with MACs that belong to nothing.',
        'The port is the dock-office spare from the audit note: Gi1/0/7.',
        'A full CAM table means new unknown destinations can’t be learned — the switch floods frames everywhere, hub-style (fail-open).'],
 fields:[
  {k:'p',t:'text',label:'Which switch port is learning thousands of MACs?',ph:'e.g. Gi1/0/9'},
  {k:'atk',t:'select',label:'Which attack is this?',opts:ATK_OPTS},
  {k:'eff',t:'select',label:'When the CAM table is full, the switch…',opts:[
    {v:'hub',l:'floods frames out all ports — hub-like (fail-open)'},
    {v:'drop',l:'drops all frames until rebooted'},
    {v:'route',l:'switches to layer-3 routing'},
    {v:'shut',l:'automatically shuts the offending port'}]}
 ],
 check(v){ const miss=[];
   if(!port7ok(v.p)) miss.push('the port (it’s the dock-office spare, Gi1/0/7)');
   if(v.atk!=='mac') miss.push('the attack name (CAM overflow = MAC flooding)');
   if(v.eff!=='hub') miss.push('the failure mode (fail-open flooding — hub-like)');
   return miss.length? {ok:false,msg:'Re-check '+miss.join('; ')+'. Related control: port security limits MACs per port and would have stopped this.'}
   : {ok:true,msg:'Gi1/0/7 is storming the CAM table → the switch fails open and floods frames, enabling sniffing. That’s why port security (MAC limiting per port) exists — you’ll configure it in a later mission.'}; },
 pass:'', fail:''},
{id:'M4', modes:['medium'], pillar:'P2', anchor:'CI-4 + CI-8 · HOSTDESK → ARP Table & Packet Capture',
 title:'Read the ARP table and name the enabled follow-on attack',
 brief:'HOSTDESK shows your workstation’s ARP cache and a packet capture. Find which host is impersonating the gateway, note its MAC, name the poisoning attack — and name the attack it enables.',
 cons:'hostdesk',
 hints:['Two lines in the ARP table share one MAC — that MAC belongs to APEX-5, the dock-office device.',
        'The gateway line changed: 10.20.30.1 now answers at APEX-5’s MAC instead of aa:bb:cc:04:10:01.',
        'With traffic flowing through APEX-5, it sits “on the path” — that is the follow-on attack’s name.'],
 fields:[
  {k:'ip',t:'text',label:'Which host is impersonating the gateway (IP)?',ph:'x.x.x.x'},
  {k:'mac',t:'text',label:'What MAC does it use?',ph:'xx:xx:xx:xx:xx:xx'},
  {k:'atk',t:'select',label:'The poisoning attack is:',opts:ATK_OPTS},
  {k:'en',t:'select',label:'The attack it enables is:',opts:ATK_OPTS}
 ],
 check(v){ const miss=[];
   if(norm(v.ip)!=='10.20.30.100') miss.push('the IP (APEX-5 is 10.20.30.100)');
   if(macnorm(v.mac)!=='c471542e990a') miss.push('the MAC (C4:71:54:2E:99:0A)');
   if(v.atk!=='arp') miss.push('the poisoning name (ARP poisoning)');
   if(v.en!=='onpath') miss.push('the enabled attack (on-path)');
   return miss.length? {ok:false,msg:'Not yet: '+miss.join('; ')+'. The capture even shows gratuitous ARP from that host — ARP has no authentication, so forged replies just work.'}
   : {ok:true,msg:'Exactly: forged ARP replies bind the gateway IP to APEX-5’s MAC, and the relayed flows (duplicate ACKs, TTL drop) prove an on-path position. Defenses: Dynamic ARP Inspection + encryption in transit.'}; },
 pass:'', fail:''},
{id:'M5', modes:['medium'], pillar:'P2', anchor:'CI-9 · MAILGATE',
 title:'Triage the suspicious email in MAILGATE',
 brief:'Open the message “Action required: Portal password expires tonight”. Name the attack and tick every indicator you can evidence from the message and its headers (at least 3).',
 cons:'mail',
 hints:['Compare the sender domain with our real domain, and the display link with the real target shown under it.',
        'The headers say spf=fail for a domain that is not ours — harborview-support.com vs harborview.example.',
        'Valid indicators: sender mismatch · link-text ≠ URL · urgency · generic greeting · credential request. There is NO attachment.'],
 fields:[
  {k:'atk',t:'select',label:'The attack is:',opts:ATK_OPTS},
  {k:'ind',t:'multi',label:'Indicators you can evidence (tick at least 3):',opts:[
   {v:'sender',l:'Sender-domain mismatch — harborview-support.com is not our domain',c:1},
   {v:'link',l:'Link text differs from the real URL target',c:1},
   {v:'urgency',l:'Urgency pressure — “expires tonight / 2 hours”',c:1},
   {v:'greet',l:'Generic greeting — “Dear User”',c:1},
   {v:'creds',l:'Asks to sign in with current credentials',c:1},
   {v:'attach',l:'Carries a malicious .exe attachment',c:0}
  ]}
 ],
 check(v){ const sel=v.ind||[]; const miss=[];
   if(v.atk!=='phish') miss.push('the attack name');
   if(!sel.includes('sender')||!sel.includes('link')) miss.push('the two hard indicators (sender mismatch, link mismatch)');
   const good=sel.filter(x=>['sender','link','urgency','greet','creds'].includes(x)).length;
   if(good<3) miss.push('at least 3 evidenced indicators');
   if(sel.includes('attach')) miss.push('remove the attachment claim — this mail has none');
   return miss.length? {ok:false,msg:'Re-check '+miss.join('; ')+'. Header analysis (SPF/DMARC results) is a detection you can do in seconds.'}
   : {ok:true,msg:'Phishing, evidenced. The link lands on 185[.]22[.]3[.]207 — the same host as the poisoned DNS record and the fake DHCP gateway. Report-and-block workflow next; and note MFA would blunt the stolen password.'}; },
 pass:'', fail:''},
{id:'M6', modes:['medium'], pillar:'P2', anchor:'CI-5 · NETCORE → DNS Cache',
 title:'Find the poisoned DNS record and pick the structural fix',
 brief:'In NETCORE → DNS Cache, one record changed at 19:20 with a suspiciously low TTL. Identify the hostname and the fake IP, then choose the control that fixes the class of problem, not just this record.',
 cons:'netcore',
 hints:['Compare every record’s TTL — one is 30 seconds, the rest are hours.',
        'portal.harborview.example should resolve to 198.51.100.24 like booking.* does.',
        'Flushing helps once; signing the records (DNSSEC) fixes the class of attack.'],
 fields:[
  {k:'h',t:'text',label:'Which hostname is poisoned?',ph:'host.harborview.example'},
  {k:'ip',t:'text',label:'To which false IP?',ph:'x.x.x.x'},
  {k:'ctl',t:'select',label:'The structural control is:',opts:[
   {v:'dnssec',l:'Deploy DNSSEC (signed, validated records)'},
   {v:'ttl',l:'Raise the minimum TTL to 3600'},
   {v:'flush',l:'Flush the cache and move on'},
   {v:'acl',l:'ACL the resolver to staff subnets only'}]}
 ],
 check(v){ const miss=[];
   if(norm(v.h)!=='portal.harborview.example') miss.push('the hostname (portal.harborview.example)');
   if(norm(v.ip)!=='185[.]22[.]3[.]207') miss.push('the false IP (185[.]22[.]3[.]207 — the attacker host again)');
   if(v.ctl!=='dnssec') miss.push('the structural control (DNSSEC)');
   return miss.length? {ok:false,msg:'Re-check '+miss.join('; ')+'. The short TTL is the tell — the attacker wants clients to keep refreshing into the lie.'}
   : {ok:true,msg:'Correct: portal.* → 185[.]22[.]3[.]207 with TTL 30 is the poison, and DNSSEC gives records origin authenticity + integrity (not confidentiality) so forged answers fail validation.'}; },
 pass:'', fail:''},
{id:'M7', modes:['medium'], pillar:'P2', anchor:'CI-6 + CI-7 · WAPCTL',
 title:'Identify the evil twin and the rogue devices, then harden the air',
 brief:'In WAPCTL, compare SSIDs, BSSIDs, channels and signal. Pick the evil twin’s BSSID, the unknown rogue AP, and the rogue service exposed in NETCORE → DHCP Leases — then activate the wireless hardening controls in WAPCTL so the clone loses its entry.',
 cons:'wireless', envPanel:'wireless',
 hints:['The clone has the same SSID as a legit AP but a different BSSID — and a stronger signal.',
        'The strongest CORP-SECURE entry (−38 dBm, channel 6, Open) is not one of ours; the TP-LINK is unknown to inventory.',
        'The DHCP lease audit names a server that is not HCCF-CORE-DHCP. Then set all three wireless controls: WPA3-Enterprise, no legacy PSK/open, WIPS containment.'],
 fields:[
  {k:'bss',t:'select',label:'Evil twin BSSID (the cloned SSID):',opts:[
   {v:'a011',l:'8a:1f:9e:44:a0:11 — CORP-SECURE, WPA3-Enterprise, −52 dBm'},
   {v:'a012',l:'8a:1f:9e:44:a0:12 — HV-GUEST, PSK, −55 dBm'},
   {v:'a0f5',l:'8a:1f:9e:44:a0:f5 — “CORP-SECURE”, Open/captive, −38 dBm'},
   {v:'tp',l:'4c:5b:11:7c:9f:2c — TP-LINK_9F2C, Open, −64 dBm'}]},
  {k:'rog',t:'select',label:'The unknown rogue AP is:',opts:[
   {v:'a011',l:'8a:1f:9e:44:a0:11 (CORP-SECURE)'},{v:'a012',l:'8a:1f:9e:44:a0:12 (HV-GUEST)'},
   {v:'a0f5',l:'8a:1f:9e:44:a0:f5 (“CORP-SECURE” clone)'},{v:'tp',l:'4c:5b:11:7c:9f:2c (TP-LINK_9F2C)'}]},
  {k:'svc',t:'select',label:'The rogue service exposed in NETCORE → DHCP Leases is:',opts:[
   {v:'dhcpsrv',l:'Rogue DHCP server'},{v:'rogueap',l:'Rogue AP'},{v:'sw',l:'Unauthorized switch'},{v:'nic',l:'Failing printer NIC'}]}
 ],
 check(v,S){ const sel=(S.env&&S.env.wifi)||{}; const miss=[];
   if(v.bss!=='a0f5') miss.push('the evil twin (…:a0:f5 — SSID clone, stronger signal, Open)');
   if(v.rog!=='tp') miss.push('the rogue AP (TP-LINK_9F2C — unknown vendor radio)');
   if(v.svc!=='dhcpsrv') miss.push('the rogue service (unauthorized DHCP server on VLAN 20)');
   if(!sel.wpa3) miss.push('WPA3-Enterprise on the staff SSID (clients then demand the network’s certificate)');
   if(!sel.noLegacy) miss.push('legacy PSK / open association disabled (the clone’s easiest entry)');
   if(!sel.wips) miss.push('WIPS rogue/clone containment');
   return miss.length? {ok:false,msg:'Re-check '+miss.join('; ')+'. Same SSID + different BSSID + stronger signal = evil twin; three clients already joined it.'}
   : {ok:true,msg:'All three found and the air is hardened: 802.1X makes clients demand a server certificate, no open/PSK fallback remains, and WIPS de-authenticates clones. The rogue DHCP still needs snooping — that is mission M9/M10 territory.'}; },
 pass:'', fail:''},
{id:'M8', modes:['medium'], pillar:'P2', anchor:'CI-10/11/12 · ACCESS-CTRL',
 title:'Pin down the tailgating incident and close the physical findings',
 brief:'In ACCESS-CTRL, reconcile the badge log, visitor registry and facility notes. Enter the badge number and the attack below — then activate the physical controls in the console so all three findings are closed.',
 cons:'access', envPanel:'access',
 hints:['The camera note says “two persons” on one swipe at 18:42 — that badge belongs to a dispatcher who arrived alone. The authorized-visitor pattern (#4217 + escort, both badged) is the decoy.',
        'The badge is #4211 (J. Alvarez); the attack is tailgating.',
        'Five controls in ACCESS-CTRL, one per finding plus the habit: mantrap/turnstile · escort policy + visitor badges · shred-all with locked bins (dumpster diving) · privacy film / monitor repositioning (shoulder surfing) · awareness training.'],
 fields:[
  {k:'badge',t:'text',label:'Badge number used for the single swipe?',ph:'e.g. 4000'},
  {k:'atk',t:'select',label:'The attack is:',opts:ATK_OPTS}
 ],
 check(v,S){ const sel=(S.env&&S.env.phys)||{}; const miss=[];
   if(norm(v.badge).replace('#','')!=='4211') miss.push('the badge (#4211)');
   if(v.atk!=='tail') miss.push('the attack name (tailgating)');
   if(!sel.mantrap) miss.push('the mantrap/turnstile (tailgating finding)');
   if(!sel.escort) miss.push('the escort policy + visitor badges');
   if(!sel.shred) miss.push('shred-all + locked bins (dumpster-diving finding)');
   if(!sel.film) miss.push('privacy film / monitor repositioning (shoulder-surfing finding)');
   if(!sel.aware) miss.push('awareness training (the habit that enables all three)');
   return miss.length? {ok:false,msg:'Re-check '+miss.join('; ')+'. This entry is the campaign’s first step — the tool bag became APEX-5 on Gi1/0/7.'}
   : {ok:true,msg:'Chain understood: tailgating at 18:42 → planted device. Mantraps stop the entry, escorts + awareness stop the habit, shredding and privacy film close the other two findings.'}; },
 pass:'', fail:''},
{id:'M9', modes:['medium'], pillar:'P4', anchor:'CI-14 · SWITCH-01 → Hardening (state check)',
 title:'Harden SWITCH-01 against the layer-2 attacks',
 brief:'In SWITCH-01 → Hardening, apply the controls that stop MAC flooding, ARP poisoning, VLAN hopping and rogue devices on this switch. Check when every required control is active.',
 cons:'switch', envPanel:'switch',
 hints:['Two controls stop spoofed ARP/DHCP: DAI needs DHCP snooping with its binding table.',
        'Trunk safety: disable auto-trunking (DTP) and move the native VLAN off 1 (use the unused VLAN 992).',
        'Required ON: port security · DHCP snooping · Dynamic ARP Inspection · no auto-trunking · unused ports shut. Native VLAN ≠ 1.'],
 fields:[],
 check(v,S){ const e=S.env.switch; const miss=[];
   if(!e.portSec) miss.push('port security (stops MAC flooding)');
   if(!e.snooping) miss.push('DHCP snooping (blocks rogue DHCP)');
   if(!e.dai) miss.push('Dynamic ARP Inspection (stops ARP poisoning)');
   if(!e.noDtp) miss.push('disable auto-trunking/DTP (stops switch spoofing)');
   if(e.nativeVlan==='1') miss.push('native VLAN moved off 1 (stops double-tagging)');
   if(!e.shutUnused) miss.push('unused ports shut (Gi1/0/7 was a spare!)');
   return miss.length? {ok:false,msg:'Still missing: '+miss.join('; ')+'. Note Gi1/0/7 was an unused live port — “disable what you don’t use” is half of layer-2 hardening.'}
   : {ok:true,msg:'Hardened: MAC limiting, snooping-fed DAI, no DTP, native VLAN moved, spares dark. This exact set answers a dozen N10-009 scenario items.'}; },
 pass:'', fail:''},
{id:'M10', modes:['medium'], pillar:'P3', anchor:'CI-14 · detection/data-source pairing',
 title:'Pair each attack with its best detection source',
 brief:'You cannot alert on what you do not collect. Set the best detection source for each attack — these pairings are exam-favorite scenario answers.',
 cons:null,
 hints:['One pairing is wireless-only (spectrum + client joins), one is door hardware.',
        'MAC floods trip port security; ARP forgeries trip DAI logs.',
        'DoS is volume — flows/baselines; DNS poisoning shows up as validation failures and TTL anomalies.'],
 fields:[
  {k:'d1',t:'select',label:'MAC flooding →',opts:DET_OPTS},
  {k:'d2',t:'select',label:'ARP poisoning →',opts:DET_OPTS},
  {k:'d3',t:'select',label:'DoS / DDoS →',opts:DET_OPTS},
  {k:'d4',t:'select',label:'Evil twin →',opts:DET_OPTS},
  {k:'d5',t:'select',label:'DNS poisoning →',opts:DET_OPTS},
  {k:'d6',t:'select',label:'Tailgating →',opts:DET_OPTS}
 ],
 check(v){ const exp={d1:'cam',d2:'dai',d3:'flow',d4:'wips',d5:'dnsval',d6:'turn'};
   const bad=Object.keys(exp).filter(k=>v[k]!==exp[k]);
   return bad.length? {ok:false,msg:bad.length+' pairing(s) off. Think about where each attack physically leaves traces: the switch table, ARP replies, traffic volume, RF space, resolver answers, door hardware.'}
   : {ok:true,msg:'All six paired. If you can say “what data source proves it”, you can both detect an attack and answer any scenario item that asks which control would have caught it.'}; },
 pass:'', fail:''},
{id:'M11', modes:['medium'], pillar:'P4', anchor:'CI-1 · NETCORE → Traffic Meter',
 title:'Select the DDoS mitigations that actually work',
 brief:'The portal edge is at 1.9M pps. In NETCORE → Traffic Meter, tick every effective mitigation (and only those) — volume attacks are absorbed upstream, not fixed at one box.',
 cons:'netcore',
 hints:['Three of the correct controls act upstream of your firewall; one acts on the endpoint’s TCP stack.',
        'Shutting boxes down or blocking everything “works” only by doing the attacker’s job for them.',
        'Correct set: rate limiting · upstream scrubbing · CDN/anycast · SYN cookies.'],
 fields:[
  {k:'ctl',t:'multi',label:'Effective mitigations (tick all that apply):',opts:CTRL_OPTS}
 ],
 check(v){ const sel=v.ctl||[];
   const need=['rate','scrub','cdn','syn']; const wrong=['router','block','dnsoff'];
   const miss=[]; need.forEach(k=>{ if(!sel.includes(k)) miss.push(k); });
   wrong.forEach(k=>{ if(sel.includes(k)) miss.push('remove “'+(CTRL_OPTS.find(o=>o.v===k)||{}).l+'”'); });
   return miss.length? {ok:false,msg:'Adjust the set: '+miss.join('; ')+'. Volume must be absorbed/dropped upstream (rate limits, scrubbing, anycast) and half-open state defended (SYN cookies).'}
   : {ok:true,msg:'That is the working set: limit, scrub, distribute, and protect the SYN backlog. You cannot out-shout a botnet from one appliance.'}; },
 pass:'', fail:''},
{id:'M12', modes:['medium'], pillar:'P3', anchor:'CI-15 · containment sequence',
 title:'Order the response to the live incident',
 brief:'Several attacks are live at once. Put the four actions in the order a defender executes them: contain first, then clean, then document.',
 cons:null,
 hints:['First remove the attacker’s foothold — the device and the ports it uses.',
        'Only after containment do you flush, rotate and re-secure.',
        'Documentation and monitoring come last — but they are what makes the next incident shorter.'],
 fields:[
  {k:'ord',t:'order',label:'Drag the steps into order (rank 1–4):',items:[
   'Flush DNS cache and rotate exposed credentials',
   'Document, report, and monitor for repeats',
   'Isolate APEX-5 — shut down port Gi1/0/7',
   'Contain the rogue APs and the unauthorized DHCP server'
  ],exp:[3,4,1,2]}
 ],
 check(v){ const r=v.ord||[]; const bad=[];
   if(!r.every((x,i)=>Number(x)===[3,4,1,2][i])) bad.push('the sequence');
   return bad.length? {ok:false,msg:'Order matters: contain (isolate the host, then the rogue services) → clean (cache + credentials) → document & monitor. Containment before eradication is the standard order.'}
   : {ok:true,msg:'Correct order — contain, clean, document. You just walked the same containment ladder the exam’s scenario questions expect.'}; },
 pass:'', fail:''},
/* ---------------- HARD ---------------- */
{id:'H1', modes:['hard'], pillar:'P2', anchor:'CI-3/4/5/6/7 · all consoles, silent sweep',
 title:'Silent sweep — log the five live attacks with their consoles',
 brief:'No labels this time. Sweep every console, find the five distinct attacks that are live this week, and log each as console + attack. Strict check.',
 cons:null,
 nudge:'One finding per console family: switch table, host cache, resolver cache, radio space, DHCP leases.',
 fields:[0,1,2,3,4].map(i=>({k:'f'+i,t:'duo',label:'Finding '+(i+1)+': console + attack',optsC:CONS_OPTS,optsA:ATK_OPTS})),
 check(v){ const exp=[['switch','mac'],['hostdesk','arp'],['netcore','dns'],['wireless','twin'],['netcore','dhcp']];
   const bad=[];
   exp.forEach((e,i)=>{ if(v['fc'+i]!==e[0]||v['fa'+i]!==e[1]) bad.push('finding '+(i+1)); });
   return bad.length? {ok:false,msg:'Rejected: '+bad.join(', ')+' wrong. Five live attacks, five consoles’ worth of evidence — near-misses (the printer flap, the escorted visitor) are not attacks.'}
   : {ok:true,msg:'Sweep complete: MAC flooding (switch), ARP poisoning (host desk), DNS poisoning (resolver), evil twin (radio), rogue DHCP (leases). That is the whole layer-2-to-application chain, found on your own.'}; },
 pass:'', fail:''},
{id:'H2', modes:['hard'], pillar:'P1', anchor:'CI-15 · chain reconstruction',
 title:'Reconstruct the attack chain from timestamps',
 brief:'Order the six dated events into the campaign’s actual sequence — from physical entry to diversion. Strict order.',
 cons:null,
 nudge:'Human access first; the flood that distracts everyone comes last.',
 fields:[
  {k:'ord',t:'order',label:'Order the events (rank 1–6):',items:[
   '21:30 — Evil-twin joins observed; portal SYN flood begins',
   '19:05 — Unknown host “APEX-5” appears on Gi1/0/7',
   '18:42 — One badge swipe, two people at IDF-2',
   '19:20 — Unauthorized DHCP on VLAN 20; portal A record changes',
   '19:07 — CAM table jumps to 3,217 MACs',
   '19:12 — Gateway 10.20.30.1 answers at APEX-5’s MAC'
  ],exp:[6,2,1,5,3,4]}
 ],
 check(v){ const r=v.ord||[];
   const okk=r.every((x,i)=>Number(x)===[6,2,1,5,3,4][i]);
   return okk? {ok:true,msg:'The chain is exactly how N10-009 teaches it: physical/social → rogue device → L2 (flood, ARP) → rogue services (DHCP, DNS) → harvest + diversion. Break any earlier link and the later ones die.'}
   : {ok:false,msg:'Rejected. Sequence the timestamps literally: 18:42 entry → 19:05 device → 19:07 flood → 19:12 ARP → 19:20 DHCP/DNS → 21:30 evil twin + DDoS.'}; },
 pass:'', fail:''},
{id:'H3', modes:['hard'], pillar:'P3', anchor:'CI-1..12 + red herrings · attribution',
 title:'Attribute eight log lines — including the red herrings',
 brief:'Eight lines from this week’s logs. Two are NOT attacks. Attribute each line precisely; near-misses are rejected.',
 cons:null,
 nudge:'Two lines describe equipment faults and authorized humans — that is exactly why “not an attack” exists.',
 fields:[
  '40 s window: 3,217 new source MACs, all on Gi1/0/7',
  'Gateway 10.20.30.1 now resolves to c4:71:54:2e:99:0a',
  'DHCPACK to WH-Phone-114 from server 10.20.20.100 — not the authorized server',
  'portal A record → 185[.]22[.]3[.]207, TTL 30 (was 198.51.100.24)',
  'L-Torres-TP associated to BSSID 8a:1f:9e:44:a0:f5 (“CORP-SECURE”)',
  'Printer PR-2 (Gi1/0/3) MAC flap ×14 in 30 min — input errors rising',
  'Badge #4217 (visitor) + escort both badged at 08:03 — Lobby',
  '1.9M pps SYN at portal edge, 40,118 unique sources'
 ].map((l,i)=>({k:'a'+i,t:'select',label:'Line '+(i+1)+' — '+l,opts:ATTR_OPTS})),
 check(v){ const exp=['mac','arp','dhcp','dns','twin','legit-nic','legit-visitor','dos'];
   const bad=[]; exp.forEach((e,i)=>{ if(v['a'+i]!==e) bad.push('line '+(i+1)); });
   return bad.length? {ok:false,msg:'Rejected on '+bad.join(', ')+'. The printer flap is a failing NIC; the escorted visitor is the authorized pattern (two badges, not one). Everything else maps one-to-one.'}
   : {ok:true,msg:'Perfect attribution — including the two decoys. “Not an attack” is a real analyst answer: port flaps and authorized visitors are exactly what false positives look like.'}; },
 pass:'', fail:''},
{id:'H4', modes:['hard'], pillar:'P4', anchor:'CI-2/3/4/6/14 · hardening under constraints',
 title:'Hardening under constraints — full layer-2 lockdown',
 brief:'Apply the complete hardening set on SWITCH-01. This time DHCP snooping must have its trusted uplink (or it breaks legitimate DHCP), and the native VLAN must be the unused VLAN 992. Strict state check.',
 cons:'switch', envPanel:'switch',
 nudge:'Seven switches total: five toggles ON, native VLAN = 992, and the uplink must be the ONLY trusted port.',
 fields:[],
 check(v,S){ const e=S.env.switch; const miss=[];
   if(!e.portSec) miss.push('port security');
   if(!e.snooping) miss.push('DHCP snooping');
   if(!e.trustUplink) miss.push('snooping trust on the uplink only (Gi1/0/1)');
   if(!e.dai) miss.push('Dynamic ARP Inspection');
   if(!e.noDtp) miss.push('auto-trunking disabled');
   if(e.nativeVlan!=='992') miss.push('native VLAN = 992');
   if(!e.shutUnused) miss.push('unused ports shut');
   return miss.length? {ok:false,msg:'Incomplete: '+miss.join('; ')+'. Snooping without a trusted uplink drops real DHCP — the constraint exists because misconfigured controls cause outages.'}
   : {ok:true,msg:'Full lockdown, constraints honored: MAC limits, snooping + trusted uplink, DAI, no DTP, native VLAN 992, spares dark. This is the whole 4.3 playbook for one switch.'}; },
 pass:'', fail:''},
{id:'H5', modes:['hard'], pillar:'P3', anchor:'CI-5 · DNS defense justification',
 title:'Justify the DNS defense — and its residual gap',
 brief:'Name the structural control, say what property it restores, and state honestly what it does NOT fix. Keyword-checked.',
 cons:null,
 nudge:'The control is in the Field Manual’s DNS chapter. What it does NOT give you starts with “c…” and registrar hijacking is real.',
 fields:[
  {k:'c1',t:'text',label:'The structural control:',ph:'name the standard'},
  {k:'c2',t:'text',label:'What property does it restore for records?',ph:'one or two words'},
  {k:'c3',t:'text',label:'What does it NOT fix? (name at least one residual gap)',ph:'e.g. it does not …'}
 ],
 check(v){ const c1=norm(v.c1), c2=norm(v.c2), c3=norm(v.c3); const miss=[];
   if(!/dnssec/.test(c1)) miss.push('the control (DNSSEC)');
   if(!/(authentic|origin|sign|integrity|tamper)/.test(c2)) miss.push('the property (origin authenticity / integrity)');
   if(!/(encrypt|confidential|registrar|hijack|key|deploy|validation|trusted)/.test(c3)) miss.push('a residual gap (no confidentiality; needs deployment/validation/keys; registrar hijack)');
   return miss.length? {ok:false,msg:'Missing: '+miss.join('; ')+'. Answering “what it does not fix” is what separates a checkbox answer from an engineer’s answer.'}
   : {ok:true,msg:'DNSSEC restores origin authenticity and integrity; it does not encrypt anything, and it depends on deployment, key management and validation — and it will not save you from registrar hijacking.'}; },
 pass:'', fail:''},
{id:'H6', modes:['hard'], pillar:'P2', anchor:'CI-7 · evil-twin containment sequence',
 title:'Sequence the evil-twin containment — then lock the air down',
 brief:'Users are joined to the clone. Order the five containment steps — survey before you re-key, re-key before you re-auth. Strict order. Then set the three wireless controls in WAPCTL so the clone cannot simply come back.',
 cons:null, envPanel:'wireless',
 nudge:'Verify → harden → rotate → re-auth → document. Then the three wireless controls in WAPCTL.',
 fields:[
  {k:'ord',t:'order',label:'Order the steps (rank 1–5):',items:[
   'Revoke & rotate exposed credentials and active sessions',
   'Confirm the clone with WIPS / spectrum survey (BSSID …:a0:f5)',
   'Document the incident and monitor WIPS for repeats',
   'Move staff SSID to WPA3-Enterprise (802.1X) with server-cert validation',
   'Force affected clients to re-authenticate; contain the clone BSSID'
  ],exp:[3,1,5,2,4]}
 ],
 check(v,S){ const r=v.ord||[]; const sel=(S.env&&S.env.wifi)||{};
   const okk=r.every((x,i)=>Number(x)===[3,1,5,2,4][i]);
   if(!okk) return {ok:false,msg:'Rejected. The safe ladder: WIPS confirmation first, then WPA3-Enterprise/802.1X, then credential rotation, then forced re-auth, then documentation.'};
   const miss=[];
   if(!sel.wpa3) miss.push('WPA3-Enterprise/802.1X on the staff SSID');
   if(!sel.noLegacy) miss.push('legacy PSK / open association disabled');
   if(!sel.wips) miss.push('WIPS rogue/clone containment');
   return miss.length? {ok:false,msg:'Order accepted, but the hardening is missing: '+miss.join('; ')+' — set the three wireless controls in WAPCTL.'}
   : {ok:true,msg:'Correct sequence and the air is locked: verify → harden → rotate → re-auth → document, with 802.1X, no legacy PSK and WIPS standing guard. Re-keying before 802.1X just means the clone steals the new PSK too.'}; },
 pass:'', fail:''},
{id:'H7', modes:['hard'], pillar:'P2', anchor:'CI-12 · insider/physical root cause',
 title:'Root-cause the physical entry — badge, door, consequence, then close it',
 brief:'From ACCESS-CTRL evidence, give the badge number, the time, the door, the attack name — and what the entry made possible. Then activate the physical controls in the console to close all three findings. Strict values.',
 cons:'access', envPanel:'access',
 nudge:'18:42 is the minute. The door is not the lobby turnstile. What did the tool bag contain? Then five controls close the findings.',
 fields:[
  {k:'b',t:'text',label:'Badge number:',ph:'#'},
  {k:'t',t:'text',label:'Time of the single swipe:',ph:'hh:mm'},
  {k:'d',t:'select',label:'Door:',opts:[{v:'idf2',l:'IDF-2 corridor door'},{v:'lobby',l:'Lobby turnstile'},{v:'dock',l:'Dock gate'}]},
  {k:'atk',t:'select',label:'Attack:',opts:ATK_OPTS},
  {k:'con',t:'select',label:'What the entry made possible:',opts:[
   {v:'rogue',l:'A rogue device was planted (APEX-5 on Gi1/0/7)'},
   {v:'theft',l:'Equipment was stolen from IDF-2'},
   {v:'none',l:'Nothing — patrol found no change'},
   {v:'wire',l:'Cabling was upgraded'}]}
 ],
 check(v,S){ const sel=(S.env&&S.env.phys)||{}; const miss=[];
   if(norm(v.b).replace('#','')!=='4211') miss.push('the badge (#4211)');
   if(!/^(18:42|18:42:11|6:42\s*pm)$/.test(norm(v.t))) miss.push('the time (18:42)');
   if(v.d!=='idf2') miss.push('the door (IDF-2 corridor)');
   if(v.atk!=='tail') miss.push('the attack (tailgating)');
   if(v.con!=='rogue') miss.push('the consequence (the planted device)');
   if(!sel.mantrap||!sel.escort||!sel.shred||!sel.film||!sel.aware) miss.push('the physical controls — all five active in ACCESS-CTRL (mantrap, escort, shred-all, privacy film, awareness)');
   return miss.length? {ok:false,msg:'Rejected: '+miss.join('; ')+'. Camera notes carry the specifics — “two persons, second with tool bag”.'}
   : {ok:true,msg:'#4211, 18:42, IDF-2, tailgating → APEX-5 planted — and the findings are now closed at the door, the bins, the glass and the habit. Every technical control in this lab exists because someone once held a door open.'}; },
 pass:'', fail:''},
{id:'H8', modes:['hard'], pillar:'P3', anchor:'CI-1 · DDoS classification and response',
 title:'Classify the flood and justify the response',
 brief:'From the Traffic Meter values, classify the attack, select the effective mitigations, and write one line of justification using the evidence. Keyword-checked.',
 cons:'netcore',
 nudge:'Half-open connections + tens of thousands of never-completing sources = one specific flood name.',
 fields:[
  {k:'cls',t:'select',label:'Classification:',opts:[
   {v:'syn',l:'Direct volumetric DDoS — SYN flood from a botnet'},
   {v:'amp',l:'Reflection/amplification attack (DNS/NTP)'},
   {v:'dos',l:'Single-source DoS from one host'},
   {v:'slow',l:'Slow-loris application-layer DoS'}]},
  {k:'ctl',t:'multi',label:'Effective mitigations:',opts:CTRL_OPTS},
  {k:'why',t:'text',label:'Justification (one line, use the evidence):',ph:'e.g. backlog … sources …'}
 ],
 check(v){ const sel=v.ctl||[]; const miss=[];
   if(v.cls!=='syn') miss.push('the classification (direct SYN flood from a botnet)');
   ['rate','scrub','cdn','syn'].forEach(k=>{ if(!sel.includes(k)) miss.push('+'+k); });
   ['router','block','dnsoff'].forEach(k=>{ if(sel.includes(k)) miss.push('−'+k); });
   if(!/(spoof|random|botnet|backlog|upstream|scrub|volume|half-open)/.test(norm(v.why))) miss.push('evidence-based justification');
   return miss.length? {ok:false,msg:'Rejected: '+miss.join('; ')+'. 40k non-completing sources and a 94% SYN backlog say “SYN flood, volumetric, distributed”.'}
   : {ok:true,msg:'Direct volumetric SYN flood; absorb upstream (rate limit, scrub, anycast) and defend state (SYN cookies). Your justification cites the backlog and the randomized sources — that is analyst-grade reasoning.'}; },
 pass:'', fail:''},
{id:'H9', modes:['hard'], pillar:'P3', anchor:'CI-14 + red herrings · alert adjudication',
 title:'Adjudicate four alerts — true or false positive?',
 brief:'Four alerts reached the queue. For each, decide true positive or false positive. Two of each. Strict.',
 cons:null,
 nudge:'Cross-check each alert against the evidence: who, which port, which server, which record.',
 fields:[
  {k:'a1',t:'select',label:'DAI violation on Gi1/0/7 — ARP reply for 10.20.30.1 from c4:71:54:2e:99:0a',opts:TF_OPTS},
  {k:'a2',t:'select',label:'CAM flap: printer PR-2 (Gi1/0/3) re-learned ×14 in 30 min, input errors rising',opts:TF_OPTS},
  {k:'a3',t:'select',label:'802.1X EAP failure: visitor phone on HV-GUEST — wrong cert profile',opts:TF_OPTS},
  {k:'a4',t:'select',label:'portal A record changed 19:20 → 185[.]22[.]3[.]207, TTL 30',opts:TF_OPTS}
 ],
 check(v){ const exp={a1:'tp',a2:'fp',a3:'fp',a4:'tp'}; const bad=Object.keys(exp).filter(k=>v[k]!==exp[k]);
   return bad.length? {ok:false,msg:'Wrong on '+bad.join(', ')+'. The printer flap and the visitor phone are benign faults; DAI and the DNS change are the campaign.'}
   : {ok:true,msg:'2×true, 2×false — and that is a good night. Adjudication (true vs false positive) is the day job; every false positive you can explain makes the true ones louder.'}; },
 pass:'', fail:''}
];
const OBJS_BY_MODE = m => OBJ_DEFS.filter(o => o.modes.includes(m));

/* ============ Quiz banks ============ */
const QUIZ = {
 medium:[
  {q:'MAC flooding attacks which structure?', topic:'MAC flooding mechanism',
   opts:['The router’s routing table','The switch’s CAM table','The DNS resolver cache','The DHCP lease scope'],
   ans:1, exp:'Fake source MACs fill the switch’s CAM table. The routing table holds L3 paths, the resolver cache holds name records, and the lease scope is the DHCP pool — none of them is what a MAC flood fills.'},
  {q:'When a switch’s CAM table is full, the switch…', topic:'CAM fail-open behavior',
   opts:['drops every frame it receives','switches the port to routing','floods unknown-destination frames everywhere, hub-like','shuts all ports until rebooted'],
   ans:2, exp:'Fail-open flooding is the point of the attack: unknown destinations cannot be learned, so frames go out every port like a hub. It does not route, does not silently drop, and does not shut anything by itself.'},
  {q:'What makes ARP poisoning possible?', topic:'ARP lack of authentication',
   opts:['ARP replies carry no authentication','ARP uses outdated weak encryption','ARP caches expire too quickly','ARP packets bypass firewall ACLs'],
   ans:0, exp:'ARP has no authentication, so forged replies (even gratuitous ones) are accepted. There is no ARP encryption to be weak, cache timeouts do not stop forgery, and ACLs are not the check ARP defeats.'},
  {q:'DNSSEC provides records with…', topic:'DNSSEC properties',
   opts:['end-to-end encrypted query payloads','protection against registrar hijack','origin authenticity and integrity','faster lookups at resolvers'],
   ans:2, exp:'DNSSEC signs records — origin authenticity and integrity. It does not encrypt queries (that is DoT/DoH), does not stop registrar hijack, and adds signing work rather than speed.'},
  {q:'Best structural defense against an evil twin on the staff SSID?', topic:'Evil-twin structural defense',
   opts:['WPA3-Enterprise with server-certificate validation','A longer PSK rotated monthly','Hiding the SSID from beacons','MAC filtering on the controllers'],
   ans:0, exp:'802.1X makes clients validate the network’s server certificate, so a clone without it fails association. A longer or rotated PSK is still a shared secret, a hidden SSID still broadcasts on association, and MACs are trivially cloned.'},
  {q:'The control purpose-built to stop tailgating is…', topic:'Tailgating control',
   opts:['A taller perimeter fence','A monthly awareness email','A warning sign at doors','A mantrap or turnstile'],
   ans:3, exp:'A mantrap admits one badged person at a time — it enforces one-person-one-door. Fences, signs and emails ask or deter; none of them physically blocks a second person.'}
 ],
 hard:[
  {q:'WH-PC-31’s ARP cache shows 10.20.30.1 → C4:71:54:2E:99:0A (APEX-5). Best immediate pair of actions?', topic:'ARP incident response',
   opts:['Reboot the switch and the host','Change every client IP address','Enable port security on access ports','Isolate the port and enable DAI'],
   ans:3, exp:'Remove the position (isolate the port) and restore authenticated ARP (DAI fed by snooping). Reboots repopulate the same poisoned cache, re-IPing hides the symptom, and port security alone does not validate ARP.'},
  {q:'VoIP phones receive leases with gateway 10.20.20.100 from an unknown server. First control?', topic:'Rogue DHCP first control',
   opts:['Assign static IPs to every phone','Enable snooping; trust only the uplink','Block UDP 67 at the core','Disable DHCP entirely on VLAN 20'],
   ans:1, exp:'Snooping with a trusted-uplink-only design drops offers from any other port — the rogue dies without breaking real DHCP. Statics are unmanageable at scale, blocking UDP 67 also blocks the real server, and disabling DHCP is the same self-inflicted outage.'},
  {q:'Double-tagged frames appear on the trunk; native VLAN is 1. Which pair stops the hop?', topic:'VLAN-hopping controls',
   opts:['Unused native VLAN and DTP disabled','Longer passwords on every access port','WPA2 enabled across the trunk links','The whole trunk shut during business'],
   ans:0, exp:'Double-tagging needs a usable native VLAN and a negotiable trunk; an unused native VLAN plus DTP disabled removes both preconditions. Passwords are irrelevant at L2, WPA2 is wireless, and shutting the trunk is a self-inflicted outage.'},
  {q:'WIPS flags an SSID clone with stronger signal; three users joined. Sequence?', topic:'Evil-twin containment sequence',
   opts:['Change the guest PSK → reconnect everyone → consider it done','Confirm clone → enable 802.1X → rotate credentials → force re-auth','Ignore it → stronger signal means it is ours','Buy a stronger legitimate AP → signal problem solved'],
   ans:1, exp:'Verify first (BSSID), harden so clients demand a certificate, rotate what was exposed, then re-auth. The guest PSK is the wrong network, “stronger signal” is exactly the clone’s trick, and a louder legitimate AP does not un-join anyone.'},
  {q:'Portal edge: 1.9M pps SYN, 40,118 randomized sources, backlog 94%. Classify + first response?', topic:'DDoS classification and response',
   opts:['Application-layer DoS — just restart the web server','Reflected NTP amplification — close UDP 123 outbound','Insider bandwidth abuse — find the one heavy host','Direct volumetric SYN flood — engage upstream scrubbing'],
   ans:3, exp:'Distributed, never-completing handshakes at volume = direct volumetric SYN flood; absorb it upstream (scrubbing, rate limits). It is not application-layer (no HTTP), not reflection (no amplifier protocol), and 40k sources are not one insider.'},
  {q:'Headers: From harborview-support.com, spf=fail, Reply-To fastmbox.example, link text ≠ target. Verdict?', topic:'Phishing verdict workflow',
   opts:['Legitimate but misconfigured mail','Harmless spam, ignore it','Phishing — report and block','Newsletter with tracking bug'],
   ans:2, exp:'Domain mismatch + failing SPF/DMARC + link mismatch + credential request = phishing; report and block. “Misconfigured” does not survive the lookalike domain, spam filters do not un-harvest credentials, and this is no newsletter.'},
  {q:'Which detection pairing is correct?', topic:'Detection-source pairing',
   opts:['ARP poisoning ↔ DAI violation logs','ARP poisoning ↔ NetFlow baselines','MAC flooding ↔ WIPS spectrum surveys','Evil twin ↔ CAM utilization alerts'],
   ans:0, exp:'DAI logs are the native evidence of ARP forgeries. NetFlow suits volume attacks, WIPS suits RF space, and CAM utilization is the MAC-flood tell — each crossed pairing points at the wrong data source.'}
 ]
};
