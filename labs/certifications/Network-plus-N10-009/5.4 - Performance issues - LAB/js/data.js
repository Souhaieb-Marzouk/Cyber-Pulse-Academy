/* ===== js/data.js — ALL lab content, verbatim from the audited build =====
   Instruments (charts, traceroutes, counters, captures, AP survey), symptom/tool
   banks, objective definitions (Medium + Hard with answers, hints, feedback)
   and the two exam banks. Data only — no logic. */

'use strict';

/* ===== CKCR SIGNAL BENCH — data: glossary, evidence, quizzes (all synthetic) ===== */'use strict';
const GLOSSARY = [
  {t:'Bandwidth', d:'Rated capacity of a link, in bits per second — the spec-sheet number.'},
  {t:'Throughput', d:'Measured data rate actually moving through a link over a period.'},
  {t:'Goodput', d:'Usable application payload per second, after protocol overhead and retransmissions.'},
  {t:'Utilization', d:'Percentage of a link’s capacity in use over an interval; sustained near-100% signals congestion.'},
  {t:'Contention', d:'Multiple devices competing for the same shared medium — most visibly Wi-Fi airtime.'},
  {t:'Congestion', d:'Demand at or above capacity: buffers fill, queuing delay grows, packets get dropped.'},
  {t:'Bottleneck', d:'The slowest segment in a path; it caps end-to-end throughput for everything behind it.'},
  {t:'Queue drop', d:'Packet discarded because an interface’s full buffer had nowhere to put it.'},
  {t:'Latency', d:'Time for a packet to traverse the path; usually measured as round-trip time.'},
  {t:'RTT', d:'Round-trip time — what ping reports; includes all four delay components in both directions.'},
  {t:'Propagation delay', d:'Physics component of latency: distance ÷ signal speed (~5 ms per 1,000 km of fiber, approx.).'},
  {t:'Queuing delay', d:'Time a packet spends waiting in device buffers; congestion inflates it dramatically.'},
  {t:'Jitter', d:'Variation in arrival delay between packets — the enemy of real-time voice and video.'},
  {t:'Packet loss', d:'Packets dropped in transit: from congestion, physical errors, or RF problems.'},
  {t:'Retransmission', d:'TCP resending a segment that was never acknowledged; a loss fingerprint in captures.'},
  {t:'CRC error', d:'Frame discarded at Layer 2 because its integrity check failed — classic bad-cable signature.'},
  {t:'RSSI', d:'Received signal strength indicator for a Wi-Fi radio, in dBm (closer to 0 = stronger).'},
  {t:'SNR & noise floor', d:'Signal strength minus background RF power (dB). The noise floor is the clutter every signal fights.'},
  {t:'Channel overlap (CCI/ACI)', d:'Co-channel neighbors politely share airtime (CCI); overlapping channels corrupt each other’s frames (ACI). 2.4 GHz non-overlapping plan: 1 / 6 / 11 at 20 MHz.'},
];


const LINKS = [
  {id:'HQ-INET',   name:'HQ-INET · HQ internet uplink', rated:'500/500 Mbps', cur:96, peak:'97% @ 09:45–10:15', base:'typical peak 55%', hot:true},
  {id:'WAN-1',     name:'WAN-1 · HQ ↔ roastery fiber',  rated:'1 Gbps',       cur:38, peak:'41% @ 12:30',       base:'typical peak 42%', hot:false},
  {id:'DC-LINK',   name:'DC-LINK · HQ → cloud NAS',     rated:'1 Gbps',       cur:12, peak:'91% @ 01:30–03:00', base:'backup window (baseline)', hot:false},
  {id:'ROAST-INET',name:'ROAST-INET · roastery uplink', rated:'300/300 Mbps', cur:35, peak:'38% @ 12:45',       base:'typical peak 36%', hot:false},
  {id:'KIOSK-LINK',name:'KIOSK-LINK · Harbor Kiosk circuit', rated:'50/50 Mbps', cur:96, peak:'96% @ 09:00–15:00', base:'typical peak 44%', hot:true},
];


const TOP_TALKERS = [
  {h:'MKT-STUDIO-01', d:'Marketing studio workstation — 4K product-loop stream to socials', link:'HQ-INET', rate:'380 Mbps', note:'new since last week'},
  {h:'BAK-JOB-01',    d:'Nightly backup HQ → cloud NAS (01:30–03:00 window)',        link:'DC-LINK', rate:'850 Mbps', note:'in baseline'},
  {h:'VOIP-GW-01',    d:'Voice gateway — SIP trunk to provider',                     link:'HQ-INET', rate:'14 Mbps',  note:'steady'},
  {h:'GUEST-MESH',    d:'Café guest Wi-Fi aggregate',                                link:'HQ-INET', rate:'25 Mbps',  note:'steady'},
  {h:'DASH-POLLER',   d:'Sales dashboard auto-refresh poller',                       link:'HQ-INET', rate:'12 Mbps',  note:'red herring — steady, tiny'},
];


const TRACE_KIOSK = [
  {hop:1, host:'HQ-GW-01',      ip:'10.10.0.1',    rtt:1,   badge:''},
  {hop:2, host:'ISP-METRO-EQ',  ip:'203.0.113.9',  rtt:3,   badge:''},
  {hop:3, host:'MPLS-PE-CORE',  ip:'198.51.100.4', rtt:6,   badge:''},
  {hop:4, host:'KIOSK-EDGE-RT', ip:'10.20.0.1',    rtt:171, badge:'suspect'},
  {hop:5, host:'REGISTER-POS',  ip:'10.20.0.10',   rtt:173, badge:''},
];


const TRACE_ROAST = [
  {hop:1, host:'HQ-GW-01',   ip:'10.10.0.1',   rtt:1},
  {hop:2, host:'WAN-1-PEER', ip:'10.12.0.1',   rtt:3},
  {hop:3, host:'ROAST-CORE', ip:'10.14.0.10',  rtt:3},
];


const COUNTERS = [
  {p:'Gi1/0/14', peer:'FILE-SRV-01', crc:1482, crcd:'+38/hr, climbing', inerr:1507, outd:12,  duplex:'1 Gbps full', flag:'bad'},
  {p:'Te1/1/1',  peer:'CORE uplink', crc:3,    crcd:'stable',           inerr:3,    outd:118, duplex:'10 Gbps full', flag:'warn'},
  {p:'Gi1/0/2',  peer:'VOIP-GW-01',  crc:0,    crcd:'—',                inerr:0,    outd:0,   duplex:'1 Gbps full', flag:'ok'},
  {p:'Gi1/0/9',  peer:'AP-CAFE2',    crc:0,    crcd:'—',                inerr:0,    outd:0,   duplex:'1 Gbps full', flag:'ok'},
];


const CAPTURE_LINES = [
  {c:'',        t:'12:03:41.114  IP 10.10.4.22.49831 > 10.10.7.20.445: Flags [P.], seq 9187:10643, length 1456'},
  {c:'',        t:'12:03:41.118  IP 10.10.7.20.445 > 10.10.4.22.49831: Flags [A], ack 10643 win 64240'},
  {c:'dim',     t:'12:03:41.120  IP 10.10.4.22.49831 > 10.10.7.20.445: Flags [P.], seq 10643:12099, length 1456'},
  {c:'retx',    t:'12:03:41.224  IP 10.10.4.22.49831 > 10.10.7.20.445: Flags [P.], seq 10643:12099, length 1456   [TCP Retransmission]'},
  {c:'dack',    t:'12:03:41.230  IP 10.10.7.20.445 > 10.10.4.22.49831: Flags [A], ack 10643 win 64240   [TCP Dup Ack]'},
  {c:'retx',    t:'12:03:41.419  IP 10.10.4.22.49831 > 10.10.7.20.445: Flags [P.], seq 10643:12099, length 1456   [TCP Retransmission]'},
  {c:'dim',     t:'12:03:41.510  IP 10.10.4.22.49831 > 10.10.7.20.445: Flags [P.], seq 12099:13555, length 1456'},
  {c:'dack',    t:'12:03:41.516  IP 10.10.7.20.445 > 10.10.4.22.49831: Flags [A], ack 10643 win 64240   [TCP Dup Ack]'},
  {c:'',        t:'12:03:42.907  IP 10.10.4.22.49831 > 10.10.7.20.445: Flags [P.], seq 13555:15011, length 1456'},
  {c:'dim',     t:'— capture annotated: frames arriving corrupted on Gi1/0/14 (CRC) — sender re-sends; receiver discards —'},
];


const IPERF = {tcpBefore:'420 Mbps', tcpAfter:'942 Mbps', udpOffered:'1.00 Gbps', udpGot:'611 Mbps', udpLoss:'3.9%', ping:'ping -n 100 10.10.7.20 → 97/100 replies, 3% loss'};


const APS = [
  {n:'AP-CAFE1', loc:'Café main floor',   ch:6,  w:20, rssi:-49, nf:-88, snr:39, cl:14, retx:8,  flag:''},
  {n:'AP-CAFE2', loc:'Kitchen wall',      ch:10, w:20, rssi:-56, nf:-86, snr:30, cl:9,  retx:31, flag:'bad'},
  {n:'AP-ROAST1',loc:'Warehouse north',   ch:1,  w:20, rssi:-60, nf:-84, snr:24, cl:22, retx:18, flag:'warn'},
  {n:'AP-ROAST2',loc:'Warehouse south',   ch:1,  w:20, rssi:-62, nf:-84, snr:22, cl:19, retx:24, flag:'warn'},
  {n:'AP-ROAST3',loc:'Motor-room wall',   ch:11, w:20, rssi:-58, nf:-66, snr:8,  cl:11, retx:38, flag:'bad'},
];


const ALERTS = [
  {id:'a1', ts:'02:01', src:'DC-LINK',             det:'Util 91%, sustained — backup job HQ→cloud NAS running (window 01:30–03:00, in baseline).', ans:'benign'},
  {id:'a2', ts:'09:47', src:'HQ-INET',             det:'Util 94% and climbing; VoIP gateway reporting rising jitter.',                              ans:'congestion'},
  {id:'a3', ts:'11:32', src:'ROAST-WLAN',          det:'Retransmissions 41% on warehouse SSID; scanners roam-looping between AP-ROAST1/2.',        ans:'interference'},
  {id:'a4', ts:'08:12', src:'IDF-B-SW01 Gi1/0/14', det:'CRC delta +38/hr, input errors climbing, output drops flat.',                              ans:'loss'},
  {id:'a5', ts:'08:40', src:'KIOSK-LINK',          det:'RTT to register 168 ms vs 22 ms baseline; 50/50 Mbps circuit at 96% peak.',                ans:'latency'},
  {id:'a6', ts:'07:55', src:'HQ-INET',             det:'DASH-POLLER host: steady 12 Mbps to CRM, no growth, all morning.',                         ans:'benign'},
  {id:'a7', ts:'09:15', src:'3F-PRINTER',          det:'Ticket: printer offline — paper jam, Facilities notified.',                                ans:'unrelated'},
  {id:'a8', ts:'03:00', src:'LTE-BACKUP',          det:'Failover test completed per maintenance doc M-117 (monthly, scheduled).',                  ans:'benign'},
];


const DOMAIN_OPTS = [
  ['congestion','Congestion / contention'],
  ['latency','Latency / jitter'],
  ['loss','Packet loss'],
  ['interference','Wireless interference'],
  ['benign','Benign — normal / in baseline'],
  ['unrelated','Unrelated to performance'],
];


const SYMPTOMS = [
  {id:'s1', sym:'Spreadsheet copies from the file server stall mid-transfer; capture shows TCP retransmissions.', src:'HQ file server path', ans:'loss'},
  {id:'s2', sym:'Ping to Harbor Kiosk shows 178 ms RTT against a 22 ms baseline.', src:'HQ → kiosk', ans:'latency'},
  {id:'s3', sym:'Calls “sound underwater” at 10:00; phone dashboard shows jitter swinging 4 → 38 ms.', src:'HQ VoIP', ans:'latency'},
  {id:'s4', sym:'Uplink graph flat-tops at 97% through the morning; output drops climbing on the uplink port.', src:'HQ-INET', ans:'congestion'},
  {id:'s5', sym:'CRC error counter on one switch port climbs steadily while output drops stay flat.', src:'IDF-B Gi1/0/14', ans:'loss'},
  {id:'s6', sym:'Warehouse scanners drop off Wi-Fi 11:30–13:00 daily, fine the rest of the day.', src:'Roastery WLAN', ans:'interference'},
  {id:'s7', sym:'Guests report slow Wi-Fi only near the kitchen wall; other tables are fine.', src:'Café floor', ans:'interference'},
  {id:'s8', sym:'Whole office reports slow internet only during the 01:30–03:00 backup window.', src:'HQ staff', ans:'congestion'},
];


const TOOL_ROWS = [
  {id:'t1', q:'Which link runs hottest all week (a trend, not a moment)?', a:'snmp',   good:'SNMP / flow monitoring'},
  {id:'t2', q:'How fast can host A actually push to host B?',              a:'iperf',  good:'iperf / speed tester'},
  {id:'t3', q:'What channels are my APs and the neighbors on?',            a:'wifian', good:'Wi-Fi analyzer'},
  {id:'t4', q:'What is transmitting at 2.45 GHz that is not Wi-Fi?',       a:'spectrum',good:'Spectrum analyzer'},
  {id:'t5', q:'Are there TCP retransmissions on this flow?',               a:'proto',  good:'Protocol analyzer (packet capture)'},
  {id:'t6', q:'Which hop starts adding the RTT jump?',                     a:'trace',  good:'traceroute / pathping / mtr'},
];


const TOOL_OPTS = [
  ['','— pick an instrument —'],
  ['snmp','SNMP / flow monitoring'],
  ['iperf','iperf / speed tester'],
  ['wifian','Wi-Fi analyzer'],
  ['spectrum','Spectrum analyzer'],
  ['proto','Protocol analyzer (packet capture)'],
  ['trace','traceroute / pathping / mtr'],
  ['cable','Cable tester'],
  ['toner','Tone generator'],
];


const DELAY_ITEMS = [
  {id:'d1', t:'Processing delay', n:'router reads the header, does the lookup'},
  {id:'d2', t:'Queuing delay',    n:'packet waits its turn in the buffer'},
  {id:'d3', t:'Serialization delay', n:'bits are clocked onto the wire at link speed'},
  {id:'d4', t:'Propagation delay', n:'signal travels the distance (physics)'},
];


const DELAY_SCEN = [
  {id:'sc1', q:'VoIP over a geostationary satellite link — RTT ~600 ms regardless of load.', a:'propagation'},
  {id:'sc2', q:'Core router at 98% utilization — packets arrive fine, then sit.', a:'queuing'},
  {id:'sc3', q:'Transfer across an old 100 Mbps segment — RTT tiny, but the file transfer caps hard.', a:'serialization'},
];


const DELAY_OPTS = [['','— pick a component —'],['processing','Processing delay'],['queuing','Queuing delay'],['serialization','Serialization / transmission delay'],['propagation','Propagation delay']];


const FIX_OPTS_H2 = [
  ['qos','Enable QoS — voice gets the priority queue'],
  ['ratelimit','Rate-limit the marketing 4K loop to 60 Mbps'],
  ['upgrade','Approve uplink upgrade 500 → 1 Gbps'],
  ['backup','Reschedule the nightly backup'],
  ['guest','Shut down guest Wi-Fi'],
];


const PLAN_OPTS = ['1','2','3','4','5','6','7','8','9','10','11','13'];


const QUIZ_MED = [
  {q:'A coworker says: “Our uplink is 1 Gbps bandwidth, so throughput is 1 Gbps.” Best correction?',
   o:['Throughput always equals the rated bandwidth on fiber',
      'Goodput is simply another name for the measured throughput',
      'Throughput is measured; it runs below rated capacity',
      'Bandwidth drops whenever a link becomes congested'],
   a:2, why:'Bandwidth is the rating; throughput is the measured reality (overhead, errors, congestion); goodput is the payload that survives. A healthy 1 Gbps path measures in the mid-900s — the missing slice is overhead, not fault.'},
  {q:'VoIP over a geostationary satellite link shows RTT ≈ 600 ms even at zero load. Which delay component dominates?',
   o:['Queuing delay','Processing delay','Serialization delay','Propagation delay'],
   a:3, why:'Propagation is physics: distance ÷ signal speed. A GEO round trip is tens of thousands of km, so hundreds of ms of RTT exist before any device adds a microsecond. No upgrade removes this floor (approximate figure).'},
  {q:'One access port shows CRC errors and input errors climbing steadily; output drops are flat. Most likely?',
   o:['Congestion on the uplink, dropping frames from output queues',
      'A failing patch cable or connector on that port',
      'A broadcast storm flooding the whole VLAN with traffic',
      'A DNS misconfiguration slowing lookups for that same host'],
   a:1, why:'Corrupted frames discarded on arrival = physical-layer fingerprint (objective 5.2 territory). Congestion would show as output drops climbing on the overloaded interface, not CRC on one port.'},
  {q:'Which 2.4 GHz channel plan avoids overlap at 20 MHz width?',
   o:['Channels 1, 6 and 11','Channels 1, 5, 9, 13','Channels 1 and 7','Any channels, if power is low'],
   a:0, why:'In 2.4 GHz, 20 MHz-wide OFDM channels centered 25 MHz apart (1/6/11) do not overlap; any closer spacing does. (Legacy DSSS channels were 22 MHz wide — figures simplified.) Wider bonded channels only make overlap worse.'},
  {q:'“Jitter” is best described as…',
   o:['Average end-to-end delay measured for packets',
      'Variation in arrival delay between packets',
      'Percentage of packets dropped while in transit',
      'Capacity remaining after overhead is subtracted'],
   a:1, why:'Jitter is delay *variation*. Voice/video receivers smooth it with a de-jitter buffer; when variation is wild, the buffer overflows (drops) or playback stalls — which is why jitter ≲30 ms is the rule of thumb for VoIP.'},
  {q:'Which symptom → fault-domain pairing is WRONG?',
   o:['Uplink pinned at 98% with output drops → congestion',
      'RTT jumps at one traceroute hop → latency (queuing) at that device',
      'CRC errors climbing on one port → congestion',
      'Warehouse Wi-Fi drops at lunchtime daily → interference'],
   a:2, why:'Climbing CRC with flat drops is the physical/RF fingerprint, not congestion. Congestion shows as drops + utilization; errors on one port mean corrupted frames arriving — replace the cable, not the uplink.'},
  {q:'A link graphs 97% utilization at 10:00 daily. Per the troubleshooting methodology, what do you do FIRST?',
   o:['Identify the problem: gather facts, find top talkers',
      'Order a bigger circuit before the next morning peak',
      'Reboot the edge router and see whether it helps',
      'Disable QoS so every traffic class gets equal treatment'],
   a:0, why:'N10-009 5.1: identify the problem (gather information, question users, check what changed) comes before theory and plan. Jumping to “buy capacity” may fix a symptom of one noisy host.'},
];


const QUIZ_HARD = [
  {q:'Gi1/0/14: CRC 1,482 climbing +38/hr, input errors 1,507, output drops 12 (flat). ping shows 3% loss; iperf TCP gives 420 Mbps. Decide.',
   o:['Congestion — upgrade the uplink and watch output drops',
      'MTU black hole — clamp MTU to 1400 end to end',
      'RF interference — re-channel the APs and re-survey',
      'Physical-layer fault — replace the cable, re-verify counters'],
   a:3, why:'CRC-climbing + flat output drops = corrupted arriving frames = cable/connector/NIC/transceiver. The 420 Mbps is TCP collapsing under loss-induced retransmissions. Fix the copper first, then re-measure (this bench: 942 Mbps after).'},
  {q:'Traceroute RTTs: 1 / 3 / 6 / 171 / 173 ms. Where does the delay begin, and what type?',
   o:['Hop 4 (KIOSK-EDGE-RT) — queuing at the saturated edge',
      'Hop 2 (ISP-METRO-EQ) — processing at the metro exchange',
      'Hop 5 (REGISTER-POS) — propagation across the access loop',
      'Hop 3 (MPLS-PE-CORE) — serialization on the WAN leg'],
   a:0, why:'The jump happens AT hop 4’s answer: delay added between entering hop 4 and leaving it. A 50 Mbps circuit at 96% peak means packets queue at the edge router — queuing delay, the congestion component.'},
  {q:'AP-CAFE1 is fixed on channel 6 (kitchen wall neighbor AP-CAFE2 on 10, retrans 31%). Valid café re-plan?',
   o:['Move AP-CAFE2 to channel 8 and keep 20 MHz',
      'Move AP-CAFE2 to channel 11 with 40 MHz bonding',
      'Move AP-CAFE2 to channel 11 and keep 20 MHz',
      'Put both café APs on channel 6 at 20 MHz'],
   a:2, why:'From 6, the next non-overlapping 2.4 GHz channel is 11 (spacing ≥ 25 MHz). Channel 8 still overlaps 6 (ACI), bonding 40 MHz eats the neighbors’ airtime, and same-channel doubles CCI contention for 14+9 clients.'},
  {q:'1 Gbps WAN, iperf TCP 420 Mbps with 3% path loss; after the cable fix, 942 Mbps. Read the before/after correctly.',
   o:['The circuit was rated 420 Mbps and got upgraded',
      'Loss collapsed TCP; 942 Mbps is clean goodput after overhead',
      'Latency caused the loss, so the fix had to be QoS',
      'The provider was throttling, and iperf proved it'],
   a:1, why:'TCP interprets loss as congestion and cuts its rate; a few percent loss can collapse throughput. 942/1000 is the expected goodput (headers, ACKs, control overhead) — matching it proves the path is clean (rule of thumb, simplified).'},
  {q:'DC-LINK alarms nightly 01:30–03:00 at ~91% (backup window, in baseline). Real congestion at 10:00 hits 97%. Best alarm design?',
   o:['Raise the threshold to 98% so the nightly backups never fire',
      'Disable utilization alarms on DC-LINK and rely on tickets',
      'Alarm on instantaneous one-second peaks above 80% utilization',
      'Sustained 75% for 15 min, plus a backup exclusion window'],
   a:3, why:'Threshold 98% would also miss a 97% real event. The durable pattern: sustained (not instantaneous) threshold + time-based exclusion windows for known, documented load. Alarms should fire on deviations from YOUR baseline.'},
  {q:'VoIP dashboard during the 10:00 peak: one-way delay 62 ms, jitter 38 ms, loss 2.5% — calls degrade. Root-cause chain?',
   o:['Uplink congestion — queuing delay varies and buffers drop voice',
      'Propagation floor — the fiber path has reached physics limits',
      'Microwave interference — the kitchen RF is corrupting voice traffic',
      'DNS delays — name lookups are stalling the RTP stream'],
   a:0, why:'Queuing delay is the congestion component: buffers vary, so delay varies (jitter) and full buffers drop packets. QoS puts voice in the priority queue; rate-limiting/upgrade relieves the buffer pressure at the source.'},
  {q:'Warehouse Wi-Fi degrades at lunch (microwave bursts + channel plan problems). Budget: $0. Best decision?',
   o:['Replace all warehouse APs with next-gen models this quarter',
      'RF-shield the motor room and keep the current plan',
      'Re-plan 1/6/11 at 20 MHz and steer to 5 GHz',
      'Raise every AP to maximum transmit power across the whole band'],
   a:2, why:'Channel re-planning removes ACI/CCI; band steering moves capable clients to the cleaner 5 GHz band where microwave bursts don’t reach. Both are free, verifiable, and root-cause oriented. More power worsens overlap; new APs repeat the same plan.'},
];


/* ===== CKCR SIGNAL BENCH — data: objectives (Medium 12, Hard 10) ===== *//* ---------- widget option banks ---------- */
const DOMAIN_OPTS4 = DOMAIN_OPTS.slice(0,4);


const LINK_OPTS  = [['','— pick a link —']].concat(LINKS.map(l=>[l.id, l.name]));


const TALK_OPTS  = [['','— pick a host —']].concat(TOP_TALKERS.map(t=>[t.h, t.h+' — '+t.rate]));


const HOP_OPTS   = [['','— pick a hop —'],['1','Hop 1 · HQ-GW-01'],['2','Hop 2 · ISP-METRO-EQ'],['3','Hop 3 · MPLS-PE-CORE'],['4','Hop 4 · KIOSK-EDGE-RT'],['5','Hop 5 · REGISTER-POS']];


const DEV_OPTS   = [['','— pick a device —'],['hq-gw','HQ-GW-01'],['metro','ISP-METRO-EQ'],['pe','MPLS-PE-CORE'],['kiosk-edge','KIOSK-EDGE-RT'],['pos','REGISTER-POS']];


const CAUSE_OPTS = [['','— pick the cause —'],['thin-video','50 Mbps circuit + video-heavy cloud-register load (choke point)'],['propagation','Propagation floor of the fiber path'],['routing','Suboptimal route adding extra hops'],['dns','Slow DNS at the kiosk']];


const FIXK_OPTS  = [['','— pick the fix —'],['shaping','Enable shaping/QoS on the 50 Mbps circuit only'],['upgrade','Replace the 50 Mbps circuit with a 100 Mbps circuit only'],['both','Shape/QoS now + circuit upgrade scheduled'],['move','Move the kiosk register closer to the router']];


const OBJ_MED = [
  {id:'OBJ-M1', sec:'briefing', pillar:'P2', bloom:'Understand',
   title:'Triage the morning symptoms',
   prompt:'On the <b>triage board</b> below, assign each of the eight morning symptoms to its fault domain: congestion, latency, packet loss, or wireless interference.',
   ctx:'Before touching instruments, pattern-match the complaints to the four fault domains from Lesson 5.4. You will meet each of these symptoms again — with real evidence — on the bench.',
   widget:{type:'selectgrid', rows:SYMPTOMS.map(s=>({id:'m1_'+s.id, label:s.sym, src:s.src, opts:DOMAIN_OPTS4}))},
   check:{fields:{m1_s1:{mode:'exact',v:'loss'}, m1_s2:{mode:'exact',v:'latency'}, m1_s3:{mode:'exact',v:'latency'}, m1_s4:{mode:'exact',v:'congestion'}, m1_s5:{mode:'exact',v:'loss'}, m1_s6:{mode:'exact',v:'interference'}, m1_s7:{mode:'exact',v:'interference'}, m1_s8:{mode:'exact',v:'congestion'}}},
   fbOk:'Clean triage. Notice the fingerprints you just used: time-of-day patterns and “only near the kitchen” point at RF; counters and captures point at loss; RTT numbers point at latency; utilization and backup windows point at congestion. Next on the bench: confirm each with instruments.',
   fbBad:'Re-check the pairs marked red. Two traps: “slow only during the backup window” is still congestion (the backup IS the demand), and “stalling with retransmissions” is packet loss even though the user says “slow”. Jitter rides with latency.',
   hints:['Read each symptom for its fingerprint: a number (RTT), a counter (CRC), a time-of-day pattern, or a graph pinned at 100%.','Jitter belongs with latency; retransmissions and CRC belong with packet loss; “only near the kitchen” and “only at lunch” belong with interference.','Answers: s1 loss · s2 latency · s3 latency · s4 congestion · s5 loss · s6 interference · s7 interference · s8 congestion.'],
   look:'#sec-briefing'},

  {id:'OBJ-M8', sec:'manual', pillar:'P3', bloom:'Understand',
   title:'Rack the right instrument',
   prompt:'In the <b>instrument rack</b> below, match each investigation question to the correct tool from the N+ toolkit.',
   ctx:'Half of objective 5.4 is knowing which data source answers which question. The wrong tool doesn’t just waste time — it can’t see the problem at all (a Wi-Fi analyzer never sees the microwave).',
   widget:{type:'selectgrid', rows:TOOL_ROWS.map(r=>({id:'m8_'+r.id, label:r.q, src:'tool selection', opts:TOOL_OPTS}))},
   check:{fields:{m8_t1:{mode:'exact',v:'snmp'}, m8_t2:{mode:'exact',v:'iperf'}, m8_t3:{mode:'exact',v:'wifian'}, m8_t4:{mode:'exact',v:'spectrum'}, m8_t5:{mode:'exact',v:'proto'}, m8_t6:{mode:'exact',v:'trace'}}},
   fbOk:'Rack is sorted. Rule of thumb: trends → SNMP/flow; capacity → iperf; other Wi-Fi networks → Wi-Fi analyzer; non-Wi-Fi RF → spectrum analyzer; per-packet behavior → capture; per-hop timing → traceroute family. Now every bay will hand you the matching instrument.',
   fbBad:'Re-check the red rows. The classic confusion: Wi-Fi analyzer vs spectrum analyzer — the first lists Wi-Fi networks and channels, the second sees ALL RF energy including microwave ovens and motors. And a cable tester can’t tell you a trend; that’s SNMP’s job.',
   hints:['Two questions are about RF — but one is about Wi-Fi networks and one is about everything else.','Capacity and throughput questions are answered by generating real traffic, not by watching counters.','All six: t1 SNMP/flow · t2 iperf/speed tester · t3 Wi-Fi analyzer · t4 spectrum analyzer · t5 protocol analyzer · t6 traceroute/pathping/mtr.'],
   look:'#sec-manual'},

  {id:'OBJ-M4', sec:'bay1', pillar:'P2', bloom:'Analyze',
   title:'Name the congested link — and the culprit',
   prompt:'From the Bay 1 <b>utilization scope</b> and <b>link inventory</b>: which link is congested this morning, and which top talker is driving it?',
   ctx:'Congestion is a demand problem: find where utilization flat-tops and who is pushing the bytes. The scope shows 24 h at 15-minute resolution; the inventory shows rated capacity vs peak.',
   widget:{type:'selectgrid', rows:[
     {id:'m4link', label:'Which link is congested this morning?', src:'Bay 1 evidence', opts:LINK_OPTS},
     {id:'m4talk', label:'Which host is the top talker behind it?', opts:TALK_OPTS}]},
   check:{fields:{m4link:{mode:'exact',v:'HQ-INET'}, m4talk:{mode:'exact',v:'MKT-STUDIO-01'}}},
   fbOk:'HQ-INET at 97% (baseline peak: 55%) with MKT-STUDIO-01 pushing a 380 Mbps 4K product loop — the marketing stream doubled the link’s normal morning load. First cheap move: stop or rate-limit the top talker before buying capacity.',
   fbBad:'Look again at the scope: which line flat-tops near 97% between 09:45 and 10:15? Match that link in the inventory, then find whose traffic (rate) dominates the top-talker table at the same time. The backup (02:00) and the poller (12 Mbps) are not it.',
   hints:['The congested window is 09:45–10:15 — which link’s curve touches 97% exactly there?','In the top-talker table, find the entry whose rate is large enough to matter on a 500 Mbps link — 380 Mbps is 76% of it by itself.','HQ-INET; MKT-STUDIO-01 (4K product loop, 380 Mbps).'],
   look:'#bay-1'},

  {id:'OBJ-M9', sec:'bay1', pillar:'P3', bloom:'Evaluate',
   title:'Tune the alarm engine (kill the false positive)',
   prompt:'Configure the Bay 1 <b>alarm engine</b> so the 02:00 backup stops paging you, but a 10:00 congestion event still does: set a sustained-utilization threshold, a sustain duration, and the baseline exclusion window — then classify the 02:00 alarm.',
   ctx:'Detection hygiene from the memo’s baseline: the backup legitimately runs ~91% for 90 minutes. A detector must ignore documented load and still fire on real, sustained congestion.',
   widget:{type:'alarmeng',
     sliders:[{id:'alarmTh', label:'Sustained utilization threshold', min:50, max:95, step:1, init:90, unit:'%'},
              {id:'alarmMin', label:'Sustained for at least', min:5, max:60, step:5, init:60, unit:' min'}],
     toggles:[{id:'alarmWin', label:'Exclude documented backup window 01:30–03:00', note:'baseline entry'}],
     radio:{id:'m9dec', label:'So: the 02:00 DC-LINK 91% alarm is…', opts:[['true','A true positive — real congestion to fix'],['false','A false positive — scheduled load inside the baseline']]}},
   check:{state:[{k:'alarmTh', mode:'range', v:[70,80]}, {k:'alarmMin', mode:'range', v:[10,20]}, {k:'alarmWin', mode:'eq', v:true}], fields:{m9dec:{mode:'exact',v:'false'}}},
   fbOk:'That’s a working detector: ~75% sustained for ~15 minutes fires on the 10:00 pattern but not on brief spikes, and the exclusion window re-classifies the documented backup. Classifying the 02:00 page as a false positive is the correct call — it is scheduled, documented load.',
   fbBad:'Re-read the red guidance: a 90% threshold fired at 91% every night (too late and noisy), and 60 minutes of sustain is longer than the entire congestion event. Bring the threshold toward ~75% and the duration toward ~15 min, arm the exclusion window, and classify the backup alarm from the baseline, not from gut feeling.',
   hints:['What threshold would fire on 97% but not sit permanently above normal traffic? The congestion event lasts ~30 minutes — the sustain window must be shorter.','The backup is DOCUMENTED load: exclusion windows exist exactly for it, so the 02:00 page is…','Threshold ≈75% (70–80 accepted), duration ≈15 min (10–20 accepted), exclusion ON, classification: false positive.'],
   look:'#bay-1'},

  {id:'OBJ-M10', sec:'bay1', pillar:'P4', bloom:'Apply',
   title:'Fix the congestion',
   prompt:'On the Bay 1 <b>remediation console</b>, apply the congestion fix set: protect voice with QoS, rate-limit the marketing loop, and approve the uplink upgrade — then press APPLY to see the bench verify it.',
   ctx:'Fix order matters: stop the noisy host (rate-limit), protect the victim (QoS voice priority), then add capacity for growth (upgrade). All three together; each alone leaves the symptom partially alive.',
   widget:{type:'console',
     toggles:[{id:'qosVoip', label:'Enable QoS — voice gets the priority queue', note:'protects VoIP from queue buildup'},
              {id:'rateLimitLoop', label:'Rate-limit MKT-STUDIO-01 loop to 60 Mbps', note:'the 380 Mbps top talker'},
              {id:'uplinkUpgrade', label:'Approve uplink upgrade 500 → 1 Gbps', note:'capacity for growth'},
              {id:'reschedBackup', label:'Reschedule the nightly backup', note:'optional — backup is already in its documented window'}],
     apply:{fn:'fixCongest', label:'Apply & verify on bench'}},
   check:{state:[{k:'qosVoip', mode:'eq', v:true}, {k:'rateLimitLoop', mode:'eq', v:true}, {k:'uplinkUpgrade', mode:'eq', v:true}]},
   fbOk:'Applied and verified: HQ-INET morning peak drops to 62%, one-way delay to voice lands at 28 ms, jitter 6 ms, loss 0.1%. Note what each lever did: rate-limiting removed the excess demand, QoS kept voice ahead of what remains, and the upgrade absorbed growth. Rescheduling the backup was optional — it was already in its baseline window.',
   fbBad:'The console shows which switches are still off. Voice needs the priority queue AND the loop needs the rate limit AND growth needs the upgrade — partial fixes leave the 10:00 window degraded. Flip all three required switches, APPLY, then check again.',
   hints:['Which three levers map to: remove excess demand / protect the victim / add capacity?','The backup reschedule is a decoy — the backup already runs inside its documented window and does not cause the 10:00 problem.','Required ON: QoS voice priority · rate-limit MKT-STUDIO-01 · uplink upgrade. Then APPLY to watch the verification readout.'],
   look:'#bay-1'},

  {id:'OBJ-M2', sec:'bay2', pillar:'P1', bloom:'Understand',
   title:'Order the anatomy of delay',
   prompt:'In Bay 2, build the life of a packet: order the four delay components in the sequence a packet meets them — at the router, then onto the wire, then across the distance.',
   ctx:'Every RTT number is the sum of these four, in both directions. Knowing the order tells you where each fix lives: QoS reshapes queuing; nothing reshapes propagation.',
   widget:{type:'order', items:DELAY_ITEMS, slots:4, field:'m2order', caption:'Click chips in order — ① at the router → ④ across the distance'},
   check:{fields:{m2order:{mode:'seq', v:['d1','d2','d3','d4']}}},
   fbOk:'Correct: processing (lookup) → queuing (wait in buffer) → serialization (clock onto the wire) → propagation (travel). Congestion inflates queuing — the only component a busy network inflates at will — which is why “slow at 10:00, fine at 06:00” smells like queuing delay.',
   fbBad:'Sequence is off. Walk the packet: the router must LOOK UP the route (processing) before it can HOLD the packet (queuing), and it must put bits on the wire (serialization) before they can TRAVEL (propagation).',
   hints:['First the router must decide where to send it — that’s processing.','After deciding, the packet waits in the buffer if the link is busy.','Processing → queuing → serialization → propagation.'],
   look:'#bay-2'},

  {id:'OBJ-M3', sec:'bay2', pillar:'P1', bloom:'Understand',
   title:'Match each scenario to its dominant delay',
   prompt:'Three classic latency scenarios, three different culprits: pick the delay component that dominates each one.',
   ctx:'The dominant component tells you the fix: physics can’t be bought down, queues can be managed, serialization is cured by faster links.',
   widget:{type:'selectgrid', rows:DELAY_SCEN.map(s=>({id:'m3_'+s.id, label:s.q, src:'latency scenario', opts:DELAY_OPTS}))},
   check:{fields:{m3_sc1:{mode:'exact',v:'propagation'}, m3_sc2:{mode:'exact',v:'queuing'}, m3_sc3:{mode:'exact',v:'serialization'}}},
   fbOk:'All three matched. GEO satellite = propagation (physics floor ~hundreds of ms RTT, approx.); a 98%-utilized router = queuing (the congestion component); the 100 Mbps segment = serialization (bits take 1500-byte-packet ~120 µs at 100 Mbps vs ~12 µs at 1 Gbps — approx.). Diagnosis drives the fix, not the other way round.',
   fbBad:'Check the red rows: zero-load RTT that never changes is propagation; delay that appears only under load is queuing; a transfer capped exactly at the slow link’s rate is serialization.',
   hints:['One scenario has no load and no hops to speak of — what remains?','One router is nearly full — packets arrive and then… wait.','All three: sc1 propagation · sc2 queuing · sc3 serialization.'],
   look:'#bay-2'},

  {id:'OBJ-M5', sec:'bay2', pillar:'P2', bloom:'Analyze',
   title:'Read the latency ladder',
   prompt:'From the Bay 2 <b>traceroute ladder</b> to the kiosk: name the hop where the delay begins, and the delay type that dominates there.',
   ctx:'RTT is 178 ms against a 22 ms baseline, loss 0% — pure slowness, no damage. The ladder tells you WHERE the extra ~150 ms appears; the link inventory tells you WHY.',
   widget:{type:'selectgrid', rows:[
     {id:'m5hop', label:'Which hop begins adding the delay?', src:'Bay 2 ladder', opts:HOP_OPTS},
     {id:'m5type', label:'Which delay type dominates there?', opts:DELAY_OPTS}]},
   check:{fields:{m5hop:{mode:'exact',v:'4'}, m5type:{mode:'exact',v:'queuing'}}},
   fbOk:'Hop 4 — KIOSK-EDGE-RT — where RTT leaps 6 → 171 ms, and the circuit behind it (KIOSK-LINK, 50 Mbps) peaks at 96%: queuing delay at a saturated edge router. This is also your bottleneck: the choke point, not the fiber, not the POS. Fix the queue (shape the load) and the circuit (capacity) — nothing else in the path matters.',
   fbBad:'Find the first hop where the RTT column jumps by orders of magnitude — everything AFTER it inherits the delay, so the culprit is the hop where the jump STARTS, not the last hop. Then ask what a 96%-peak 50 Mbps circuit does to waiting packets.',
   hints:['Compare hop-by-hop: 1, 3, 6… then a giant leap. Which hop number owns that leap?','A device at 96% utilization makes packets wait in its buffers before forwarding — which of the four components is “waiting in a buffer”?','Hop 4 (KIOSK-EDGE-RT); queuing delay.'],
   look:'#bay-2'},

  {id:'OBJ-M6', sec:'bay3', pillar:'P2', bloom:'Analyze',
   title:'Diagnose the loss fingerprint',
   prompt:'In Bay 3, read the <b>interface counters</b> and the <b>capture</b>: which element is failing, and what loss mechanism does the evidence show?',
   ctx:'CRC climbing on one port while output drops stay flat is the physical-layer fingerprint (objective 5.2 bleeding into 5.4). The retransmissions in the capture are TCP reacting to the corrupted frames.',
   widget:{type:'selectgrid', rows:[
     {id:'m6elem', label:'Which element is failing?', src:'Bay 3 counters', opts:[['cable','The patch cable / connector on Gi1/0/14 (FILE-SRV-01)'],['uplink','The Te1/1/1 core uplink'],['gw','The VoIP gateway'],['ap','AP-CAFE2 radio']]},
     {id:'m6interp', label:'What is the loss mechanism?', opts:[['physical','Physical-layer frame errors — CRC discards on arrival'],['congestion','Congestion queue drops on a saturated link'],['rf','RF interference over the Wi-Fi segment'],['dns','Name-resolution timeouts']]}]},
   check:{fields:{m6elem:{mode:'exact',v:'cable'}, m6interp:{mode:'exact',v:'physical'}}},
   fbOk:'Correct on both: Gi1/0/14 shows CRC +38/hr with input errors climbing while output drops sit at 12 — frames are arriving DAMAGED and being discarded at Layer 2, then TCP retransmits (visible in the capture). That’s a cable/connector/NIC/transceiver story, and it explains both the stalls and the 420 Mbps iperf number.',
   fbBad:'Re-check the red rows. The fingerprint rules out congestion: congestion lives on the overloaded interface as OUTPUT drops with high utilization; here the drops are flat and the errors are INPUT/CRC on one specific port. Corrupted frames arriving = the wire or the hardware attached to it.',
   hints:['Which row’s CRC column is climbing on a schedule (+38/hr)? What connects to that port?','If utilization were the cause, which counter would climb instead — and what is that counter doing here?','Gi1/0/14 patch cable/connector to FILE-SRV-01; mechanism: physical-layer CRC discards.'],
   look:'#bay-3'},

  {id:'OBJ-M11', sec:'bay3', pillar:'P4', bloom:'Apply',
   title:'Repair the loss path',
   prompt:'On the Bay 3 <b>remediation console</b>: replace the failing patch cable, lock the port at 1 Gbps full-duplex, and re-run the throughput verification.',
   ctx:'Fix the physical layer FIRST — QoS and upgrades do nothing for corrupted frames. Locking speed/duplex prevents renegotiation surprises; re-running iperf proves the fix with numbers, not vibes.',
   widget:{type:'console',
     toggles:[{id:'patchReplaced', label:'Replace Gi1/0/14 patch cable & re-terminate', note:'the failing element'},
              {id:'portLocked', label:'Lock port at 1 Gbps, full-duplex', note:'prevent renegotiation to half-duplex'},
              {id:'verifyRun', label:'Re-run iperf + 100-ping verification', note:'prove it with numbers'},
              {id:'newSwitch', label:'Replace IDF-B-SW01 entirely', note:'decoy — the counters point at one cable, not the switch'}],
     apply:{fn:'fixLoss', label:'Apply & verify on bench'}},
   check:{state:[{k:'patchReplaced', mode:'eq', v:true}, {k:'portLocked', mode:'eq', v:true}, {k:'verifyRun', mode:'eq', v:true}]},
   fbOk:'Verified on the bench: CRC delta now 0/hr, capture shows zero retransmissions, ping loss 0/100, and iperf climbs 420 → 942 Mbps — which is what clean goodput on a 1 Gbps path looks like after overhead. The switch stayed; one cable was the whole story.',
   fbBad:'The console shows what is still off. All three steps matter: replace the cable (remove the corruption), lock 1 Gbps full-duplex (prevent renegotiation errors), and RE-RUN the tests (a fix without verification is a rumor). Replacing the whole switch is the expensive wrong lesson.',
   hints:['Which single element did the counters implicate? Start there.','Why does an admin lock speed/duplex on a known-good port?','Required ON: replace patch cable · lock 1 Gbps full-duplex · re-run verification. The full switch replacement is a decoy.'],
   look:'#bay-3'},

  {id:'OBJ-M7', sec:'bay4', pillar:'P4', bloom:'Apply',
   title:'Re-plan the 2.4 GHz channels',
   prompt:'In Bay 4, fix the channel plan: move AP-CAFE2 off the overlapping channel, move AP-ROAST2 off its co-channel twin, and set the 2.4 GHz band to 20 MHz width. (AP-CAFE1 stays on 6; ROAST1 on 1; ROAST3 on 11.)',
   ctx:'AP-CAFE2 on channel 10 overlaps AP-CAFE1’s channel 6 (adjacent-channel interference — the worse neighbor). AP-ROAST2 doubles AP-ROAST1’s channel 1 (co-channel contention for 41 scanners). And the classic plan: 1 / 6 / 11, 20 MHz.',
   widget:{type:'chanplan', caption:'Valid 2.4 GHz channels: 1–11 (13 exists but is region-dependent — keep 1/6/11 discipline)'},
   check:{state:[{k:'apChan_CAFE2', mode:'oneOf', v:['1','11']}, {k:'apChan_ROAST2', mode:'eq', v:'6'}, {k:'width24', mode:'eq', v:'20'}]},
   fbOk:'Plan is clean: café = 6/1 (or 6/11), warehouse = 1/6/11, width 20 MHz. Retransmissions should fall sharply — CAFE2 31% → single digits, ROAST2 24% → ~6%. Note the discipline: 20 MHz width keeps the non-overlapping promise; 40 MHz bonding would re-eat your neighbors’ channels.',
   fbBad:'The grid shows which assignment still overlaps. Rules: from channel 6, the nearest safe channel is 11 (or jump to 1 — anything ≥5 channels away); two APs on the same channel share airtime (CCI); anything 1–4 channels apart corrupts frames (ACI). And width must be 20 MHz for the 1/6/11 plan to mean anything.',
   hints:['Count spacing: channel N and channel N+4 overlap; N and N+5 don’t. Which café channel is ≥5 away from 6 — and which roastery channel is free now that ROAST1 has 1 and ROAST3 has 11?','Bonding two 20 MHz channels into 40 MHz uses MORE spectrum — what does that do to the non-overlap plan?','CAFE2 → 1 or 11; ROAST2 → 6; width → 20 MHz.'],
   look:'#bay-4'},

  {id:'OBJ-M12', sec:'bay4', pillar:'P4', bloom:'Apply',
   title:'Kill the interference — all of it',
   prompt:'Finish the RF remediation on the Bay 4 console: steer dual-band clients to 5 GHz, pin the 2.4 GHz plan at 20 MHz, and move the kitchen microwave’s use outside the lunch window. Then APPLY to verify SNR and retransmissions. (Requires your channel plan from the previous objective.)',
   ctx:'Channels fix Wi-Fi-vs-Wi-Fi interference; steering moves capable clients to the cleaner 5 GHz band; only a spectrum-visible source like the microwave needs a physical fix. Three layers, one root cause each.',
   widget:{type:'console',
     toggles:[{id:'bandSteer', label:'Band steering — push dual-band clients to 5 GHz', note:'escapes 2.4 GHz noise floor'},
              {id:'width20', label:'Lock 2.4 GHz channel width at 20 MHz', note:'keeps 1/6/11 non-overlapping'},
              {id:'kitchenMoved', label:'Move microwave use outside the 11:30–13:00 packing window', note:'the spectrum-visible interferer'}],
     apply:{fn:'fixRF', label:'Apply & verify on bench'}},
   check:{state:[{k:'bandSteer', mode:'eq', v:true}, {k:'width24', mode:'eq', v:'20'}, {k:'kitchenMoved', mode:'eq', v:true}, {k:'apChan_CAFE2', mode:'oneOf', v:['1','11']}, {k:'apChan_ROAST2', mode:'eq', v:'6'}]},
   fbOk:'Verified: warehouse retransmissions 24% → 6% at lunch, café 31% → 4%. One honest residual: AP-ROAST3 sits on the motor-room wall (SNR 8 dB from the noise floor) — steering helps, but its long-term fix is relocation away from the motors, not another channel. Document that in the handover.',
   fbBad:'Check the console and the red channel rows: the RF fix is a set — channels (previous objective), steering, 20 MHz, and the microwave’s schedule. The microwave is invisible to a Wi-Fi analyzer but obvious to a spectrum analyzer; only moving its USE (or the appliance) removes those bursts.',
   hints:['Which clients can even use 5 GHz? Only dual-band ones — hence steering. What does the microwave attack that steering avoids?','Width: what did MAN 6 say bonded channels do to the 1/6/11 plan?','All three toggles ON, plus CAFE2 on 1 or 11 and ROAST2 on 6 from the previous objective. Then APPLY.'],
   look:'#bay-4'},
];


const EIGHT_STEPS = [
  {id:'e1', t:'Identify symptoms & scope', n:'which sites, which time windows, what changed'},
  {id:'e2', t:'Form a theory of probable cause', n:'thin circuit + video-heavy load → queuing at the edge'},
  {id:'e3', t:'Test the theory', n:'traceroute hop timing + circuit utilization polling'},
  {id:'e4', t:'Establish a plan of action', n:'shape the video sync now; circuit upgrade scheduled'},
  {id:'e5', t:'Implement & verify', n:'RTT back toward 22 ms, output drops stop climbing'},
  {id:'e6', t:'Document & adjust monitoring', n:'baseline entry + alarm notes for the next shift'},
];


const OBJ_HARD = [
  {id:'OBJ-H1', sec:'briefing', pillar:'P3', bloom:'Evaluate',
   title:'Triage the alarm feed under noise',
   prompt:'Eight alarms, three of them noise. Classify each alarm by its fault domain — or mark it benign (documented/normal) or unrelated — using the alert detail lines. No pointer where to look; the feed below IS the evidence.',
   widget:{type:'selectgrid', rows:ALERTS.map(a=>({id:'h1_'+a.id, label:'<span class="alert-ts">'+a.ts+'</span> <span class="alert-name">'+a.src+'</span> — '+a.det, src:'alarm feed', opts:DOMAIN_OPTS, raw:true}))},
   check:{fields:{h1_a1:{mode:'exact',v:'benign'}, h1_a2:{mode:'exact',v:'congestion'}, h1_a3:{mode:'exact',v:'interference'}, h1_a4:{mode:'exact',v:'loss'}, h1_a5:{mode:'exact',v:'latency'}, h1_a6:{mode:'exact',v:'benign'}, h1_a7:{mode:'exact',v:'unrelated'}, h1_a8:{mode:'exact',v:'benign'}}},
   fbOk:'6-of-8 sharp. The noise you rejected: the 02:00 backup and the LTE failover test are documented scheduled load (benign), the steady 12 Mbps poller never grows (benign), and the paper-jam printer is not a performance fault (unrelated). Four real cases remain — they map 1:1 to the four bays.',
   fbBad:'The red rows are where noise fooled the triage. Ask of each alarm: is it scheduled/documented (benign), about a printer (unrelated), or real? A steady 12 Mbps that never grows is not congestion; a backup inside its documented window is the baseline, not an event.',
   hints:['Three alarms are noise: check each against the memo’s baseline and against “is this even a network thing?”.','The 02:01 DC-LINK and 03:00 LTE entries are SCHEDULED — the memo and doc M-117 say so.','Key: a2 congestion · a3 interference · a4 loss · a5 latency · a1/a6/a8 benign · a7 unrelated.'],
   nudge:'Sort by what the DETAIL line says, not by how scary the source name looks.'},

  {id:'OBJ-H2', sec:'bay1', pillar:'P2', bloom:'Analyze',
   title:'Congestion case — link, culprit, exact fix set',
   prompt:'Three-part verdict on the 10:00 congestion: (1) the congested link, (2) the host driving it, (3) the EXACT correct fix set — selecting a wrong lever rejects the whole set.',
   widget:{type:'mixed', fields:[
     {id:'h2link', kind:'select', label:'Congested link', opts:LINK_OPTS},
     {id:'h2talk', kind:'select', label:'Top talker driving it', opts:TALK_OPTS},
     {id:'h2fix', kind:'multi', label:'Fix set (select ALL that belong — none that don’t)', opts:FIX_OPTS_H2}]},
   check:{fields:{h2link:{mode:'exact',v:'HQ-INET'}, h2talk:{mode:'exact',v:'MKT-STUDIO-01'}, h2fix:{mode:'set', v:['qos','ratelimit','upgrade']}}},
   fbOk:'Full verdict accepted. The set logic: rate-limit removes the excess demand (380 → 60 Mbps), QoS protects the victim (voice rides the priority queue through whatever load remains), the upgrade absorbs growth. Rescheduling the backup solves a different window; killing guest Wi-Fi is a symptom-hiding overreaction.',
   fbBad:'Rejected — near-misses count as misses. Re-examine the fix set: which lever answers “who is pushing 380 Mbps?”, which answers “how does voice survive until the link is free?”, and which answers “what happens next quarter?”. If a lever addresses a different time window (the backup) or a different symptom, it is not in this set.',
   hints:['The link flat-tops 97% at 09:45–10:15; whose rate is 380 Mbps?','One lever protects voice, one silences the loop, one buys headroom.','Exact set: QoS voice priority + rate-limit the 4K loop + upgrade 500→1 Gbps. Nothing else.'],
   nudge:'Set-checking is strict: one wrong lever rejects the whole set.'},

  {id:'OBJ-H9', sec:'bay1', pillar:'P3', bloom:'Create',
   title:'Engineer the detector, prove it',
   prompt:'Configure the Bay 1 alarm engine (threshold, sustain duration, exclusion window) so it would NOT fire on the documented backup — then run the SIMULATOR over the synthetic day and require: the 10:00 congestion event FIRES, the 02:00 backup window does NOT.',
   widget:{type:'alarmeng',
     sliders:[{id:'alarmTh', label:'Sustained utilization threshold', min:50, max:95, step:1, init:90, unit:'%'},
              {id:'alarmMin', label:'Sustained for at least', min:5, max:60, step:5, init:60, unit:' min'}],
     toggles:[{id:'alarmWin', label:'Exclude documented backup window 01:30–03:00', note:'baseline entry'}],
     simulate:{btn:'Run 24 h alarm simulation', note:'evaluates the synthetic utilization day against your settings'}},
   check:{state:[{k:'alarmTh', mode:'range', v:[70,75]}, {k:'alarmMin', mode:'range', v:[10,20]}, {k:'alarmWin', mode:'eq', v:true}, {k:'flag_10', mode:'eq', v:true}, {k:'flag_02', mode:'eq', v:false}]},
   fbOk:'Detector certified: it separates sustained real congestion (fires ≥ your threshold for long enough) from documented scheduled load (excluded). This is exactly how production alarm policies are tuned — threshold + duration + exclusion windows, all derived from the baseline, then tested against known days before they page anyone.',
   fbBad:'The simulator result is authoritative: it tells you which alarms fired and which were missed. A threshold above 75% risks missing the real 97% event (or fires only because you got lucky); sustain >20 min is longer than the event; and without the exclusion window the backup page always wins. Adjust, re-run the simulation, and look at the fired/missed table.',
   hints:['The 10:00 event peaks at 97% and lasts ~30 min; the backup sits at ~91% for 90 min. What distinguishes them besides magnitude? (The window.)','Sustain duration must be shorter than the shortest event you must catch.','Threshold ≤75%, duration 10–20 min, window ON, then RUN the simulation — both flags must show.'],
   nudge:'Run the simulation; it prints fired/missed per event.'},

  {id:'OBJ-H3', sec:'bay2', pillar:'P2', bloom:'Analyze',
   title:'Latency case — full four-part verdict',
   prompt:'Five-part verdict on the kiosk slowness: the hop where delay begins, the device at that hop, the delay type, the underlying cause, and the correct fix strategy. Exact values only.',
   widget:{type:'selectgrid', rows:[
     {id:'h3hop', label:'Hop where the delay begins', opts:HOP_OPTS},
     {id:'h3dev', label:'Device at that hop', opts:DEV_OPTS},
     {id:'h3type', label:'Dominant delay type there', opts:DELAY_OPTS},
     {id:'h3cause', label:'Underlying cause', opts:CAUSE_OPTS},
     {id:'h3fix', label:'Fix strategy', opts:FIXK_OPTS}]},
   check:{fields:{h3hop:{mode:'exact',v:'4'}, h3dev:{mode:'exact',v:'kiosk-edge'}, h3type:{mode:'exact',v:'queuing'}, h3cause:{mode:'exact',v:'thin-video'}, h3fix:{mode:'exact',v:'both'}}},
   fbOk:'Full chain accepted: hop 4, KIOSK-EDGE-RT, queuing — because the 50 Mbps circuit behind it peaks at 96% under video-heavy cloud-register load. And the fix strategy is the mature one: shape/QoS now (immediate relief, zero cost), circuit upgrade scheduled (capacity for the growing register traffic). Either half alone leaves the other half broken.',
   fbBad:'Rejected on the red parts. The hop is where the RTT JUMP starts (6 → 171 ms), not where the largest absolute RTT ends up. The device there is the edge router — read the ladder host column. And “move the register closer” is not a network fix at all.',
   hints:['Ladder math: between which two hops does the delay appear?','What does a 96%-peak 50 Mbps circuit make an edge router do to packets?','Hop 4 · KIOSK-EDGE-RT · queuing · thin circuit + video load · shape now + upgrade scheduled.'],
   nudge:'The cause line in the link inventory names the circuit size and the peak window.'},

  {id:'OBJ-H7', sec:'bay2', pillar:'P1', bloom:'Analyze',
   title:'VoIP degradation chain',
   prompt:'The HQ phone dashboard at 10:00: one-way 62 ms, jitter 38 ms, loss 2.5%, MOS 3.1. Build the causal chain: root cause → what the de-jitter buffer does → correct priority order for the QoS policy.',
   widget:{type:'selectgrid', rows:[
     {id:'h7root', label:'Root cause of the 10:00 voice degradation', opts:[['congestion','Uplink congestion → queuing delay varies and buffers drop packets'],['propagation','Propagation floor of the fiber path'],['microwave','Kitchen microwave interference at HQ'],['dns','DNS resolution delays the RTP stream']]},
     {id:'h7buf', label:'What the de-jitter buffer does', opts:[['absorb','Absorbs arrival-time variance so playback stays smooth; wild jitter overflows it'],['compress','Compresses the audio to reduce bandwidth'],['prioritize','Prioritizes voice inside the switch — that is its job'],['retry','Retransmits lost RTP packets like TCP does']]},
     {id:'h7prio', label:'Correct QoS priority order', opts:[['voice-video-backup','Voice → video → bulk backup'],['backup-voice-video','Bulk backup → voice → video'],['equal','Equal queues — fair share for all'],['video-voice-backup','Video → voice → backup']]}]},
   check:{fields:{h7root:{mode:'exact',v:'congestion'}, h7buf:{mode:'exact',v:'absorb'}, h7prio:{mode:'exact',v:'voice-video-backup'}}},
   fbOk:'Chain accepted. Congestion inflates queuing delay and — because buffers fluctuate — turns steady delay into jitter, then drops packets when buffers fill: exactly the 62 ms / 38 ms / 2.5% triple. The de-jitter buffer smooths variance but has finite depth; QoS ordering (voice > video > bulk) keeps the smallest, most delay-sensitive packets at the front of every queue.',
   fbBad:'Red rows: RTP has no retransmission — that is a TCP idea. The buffer absorbs VARIANCE, it does not compress or prioritize. And fairness (“equal queues”) is precisely what degrades voice: delay-sensitive traffic must jump the queue, which is the entire point of QoS.',
   hints:['The dashboard numbers are delay, jitter AND loss together — which single upstream condition produces all three at 10:00?','What does a receiver do with packets that arrive early vs late?','Voice first, video second, bulk last; root = congestion; buffer = absorbs variance.'],
   nudge:'One condition on the uplink explains all three dashboard numbers.'},

  {id:'OBJ-H4', sec:'bay3', pillar:'P2', bloom:'Analyze',
   title:'Loss forensics — interface, error, cause, fingerprint',
   prompt:'Four exact answers on the file-server loss: the interface (type it exactly as printed), the error type, the failing element, and the counter fingerprint that rules out congestion.',
   widget:{type:'mixed', fields:[
     {id:'h4iface', kind:'text', label:'Interface name (exactly as printed in the counters table)', placeholder:'e.g. Gi1/0/1'},
     {id:'h4err', kind:'select', label:'Error type climbing', opts:[['','— pick —'],['crc','CRC errors'],['runts','Runts'],['giants','Giants'],['collisions','Collisions']]},
     {id:'h4cause', kind:'select', label:'Failing element', opts:[['','— pick —'],['cable','Patch cable / connector to FILE-SRV-01'],['uplink','Te1/1/1 core uplink'],['switch','IDF-B-SW01 chassis'],['driver','FILE-SRV-01 NIC driver settings only']]},
     {id:'h4fp', kind:'select', label:'Fingerprint that RULES OUT congestion', opts:[['','— pick —'],['drops-flat','Output drops flat while input CRC climbs on one port'],['drops-high','Output drops climbing with utilization'],['util-high','Link utilization above 90%'],['retx-only','Retransmissions visible in the capture']]},
   ]},
   check:{fields:{h4iface:{mode:'norm', v:'gi1/0/14'}, h4err:{mode:'exact',v:'crc'}, h4cause:{mode:'exact',v:'cable'}, h4fp:{mode:'exact',v:'drops-flat'}}},
   fbOk:'Forensics accepted: Gi1/0/14, CRC climbing (+38/hr) with input errors, failing patch cable/connector, and the decisive fingerprint — output drops FLAT while input CRC climbs on that one port. Congestion would paint the opposite picture (output drops + utilization, spread across the busy interface). This is objective 5.2 evidence doing 5.4 work.',
   fbBad:'Rejected on the red fields. The interface is printed in the counters table’s first column — type it exactly. Retransmissions alone don’t rule out congestion (they appear in both stories); the RULE-OUT fingerprint is the pairing of flat output drops with climbing input CRC on one specific port.',
   hints:['Copy the interface name character-for-character from the table row with the climbing CRC delta.','Congestion leaves its mark on OUTPUT counters of the overloaded link. What is climbing here instead?','Gi1/0/14 · CRC · patch cable/connector · output drops flat + input CRC climbing on one port.'],
   nudge:'Everything you need is in the counters table and its delta column.'},

  {id:'OBJ-H6', sec:'bay3', pillar:'P1', bloom:'Evaluate',
   title:'Throughput mystery — read the iperf evidence',
   prompt:'iperf TCP between HQ and the file server reads 420 Mbps on a 1 Gbps path (3% loss); after the cable fix it reads 942 Mbps. Select the complete correct explanation set — and the correct reading of the “after” number.',
   widget:{type:'mixed', fields:[
     {id:'h6cause', kind:'multi', label:'Why 420 Mbps before the fix? (select ALL correct — none that don’t belong)', opts:[['retx','TCP retransmission collapse — loss interpreted as congestion'],['overhead','Protocol overhead explains part of any sub-1000 reading'],['throttle','The ISP was throttling the link'],['duplex','The path was half-duplex and colliding']]},
     {id:'h6after', kind:'select', label:'The “after” number 942 Mbps means…', opts:[['','— pick —'],['goodput','Clean goodput for 1 Gbps after TCP/IP overhead — the path is healthy'],['stillokay','The link is still broken but less broken'],['rated','The link is actually rated 942 Mbps'],['loss','3% loss still remains']]}]},
   check:{fields:{h6cause:{mode:'set', v:['retx','overhead']}, h6after:{mode:'exact',v:'goodput'}}},
   fbOk:'Both accepted. TCP treats every lost segment as congestion and cuts its window — a few percent loss collapses throughput to a fraction of capacity. And 942 ≈ what a CLEAN 1 Gbps path yields after headers, ACKs and control traffic: matching expected goodput is how you prove a path, and the 420 → 942 delta is the price of one bad patch cable.',
   fbBad:'Rejected. The red selections don’t survive the evidence: “throttling” is contradicted by the fix changing nothing at the ISP; half-duplex collisions would show collision counters (and this port is locked full-duplex); and overhead ALONE cannot explain a 580 Mbps shortfall — only retransmission collapse can. After the fix, loss is 0/100 pings and throughput matches goodput.',
   hints:['What does TCP do when segments never arrive — and how aggressively?','After the fix, compare 942 against the theoretical payload rate of 1 Gbps with TCP/IP overhead.','Set: retransmission collapse + protocol overhead. After: clean goodput — path healthy.'],
   nudge:'Set-checking is strict: “overhead” alone is a distractor — pair it with the collapse mechanism.'},

  {id:'OBJ-H5', sec:'bay4', pillar:'P4', bloom:'Create',
   title:'Build the full RF remediation plan',
   prompt:'Create the complete plan in Bay 4: assign all five APs a valid non-overlapping 2.4 GHz plan (20 MHz), arm band steering, identify the non-Wi-Fi interferer, and name the ACI pair and the CCI pair from the analyzer data.',
   widget:{type:'plan',
     aps:APS,
     fields:[
       {id:'h5src', kind:'select', label:'Non-Wi-Fi interferer (spectrum analyzer finding)', opts:[['','— pick —'],['microwave','Commercial microwave oven — 2.45 GHz bursts during lunch prep'],['bluetooth','Bluetooth headsets in the office'],['motor','HVAC motor — broadband noise, strongest near motor room'],['cam','Wireless camera system on channel 6']]},
       {id:'h5aci', kind:'select', label:'The ACI pair (adjacent channels — the worse neighbor)', opts:[['','— pick —'],['cafe','AP-CAFE1 (6) ↔ AP-CAFE2 (10)'],['roast','AP-ROAST1 (1) ↔ AP-ROAST2 (1)'],['roast3','AP-ROAST3 ↔ the motor room'],['cafe1','AP-CAFE1 ↔ AP-ROAST1']]},
       {id:'h5cci', kind:'select', label:'The CCI pair (same channel — shared airtime)', opts:[['','— pick —'],['cafe','AP-CAFE1 ↔ AP-CAFE2'],['roast','AP-ROAST1 (1) ↔ AP-ROAST2 (1)'],['kitchen','AP-CAFE2 ↔ the microwave'],['none','There is no CCI pair on this network']]},
     ]},
   check:{state:[{k:'__plan24', mode:'plan24'}], fields:{h5src:{mode:'exact',v:'microwave'}, h5aci:{mode:'exact',v:'cafe'}, h5cci:{mode:'exact',v:'roast'}}},
   fbOk:'Plan accepted: café pair ≥5 channels apart, warehouse triple 1/6/11-style, 20 MHz, steering armed, and the three identifications are right — microwave (spectrum-only), CAFE1↔CAFE2 as ACI (10 overlaps 6), ROAST1↔ROAST2 as CCI (shared channel 1, 41 scanners politely taking turns). Residual risk on the record: AP-ROAST3’s noise floor is a placement problem, not a channel problem.',
   fbBad:'Rejected — the plan validator shows the failing constraint (a red row in the AP grid, or a red identification). Rules it checks: every AP on a 1–11 channel, any two APs ≥5 channels apart, width 20 MHz, steering armed. The identifications: same channel = CCI (contention), 1–4 channels apart = ACI (corruption), and only the spectrum analyzer can name the non-Wi-Fi source.',
   hints:['Non-overlap means pairwise spacing ≥5 channels — a 3-AP site on 1/6/11 is the textbook pattern; the café needs its two APs ≥5 apart.','Which tool saw the interferer, and at what frequency do microwave ovens operate?','CCI = same channel (ROAST1/2); ACI = overlapping channels (CAFE1/2); interferer = microwave.'],
   nudge:'The AP grid turns red on any invalid spacing; fix until all rows are green, then run the identifications.'},

  {id:'OBJ-H10', sec:'bay4', pillar:'P4', bloom:'Evaluate',
   title:'The budget decision',
   prompt:'Management authorizes ONE warehouse-Wi-Fi action this quarter. Choose the action and the justification that will survive review.',
   widget:{type:'selectgrid', rows:[
     {id:'h10dec', label:'The authorized action', opts:[['replan','Configuration-only remediation: re-plan channels 1/6/11 @ 20 MHz + band steering ($0)'],['aps','Replace all warehouse APs with next-gen models ($$$$)'],['shield','RF-shield the motor room ($$)'],['power','Raise all AP transmit power to maximum ($0)']]},
     {id:'h10why', label:'The justification line', opts:[['root','It removes the root causes (ACI/CCI) and moves clients off the polluted band — measurable before/after'],['symptom','It hides the symptom until the budget resets'],['capacity','We simply need more radios; interference is unavoidable'],['growth','Stronger signal always fixes Wi-Fi']]}]},
   check:{fields:{h10dec:{mode:'exact',v:'replan'}, h10why:{mode:'exact',v:'root'}}},
   fbOk:'Decision stands. The $0 plan attacks root causes: ACI and CCI disappear with correct spacing, steering relocates capable clients to the 5 GHz band where the microwave can’t reach, and the retransmission counters give you a measurable before/after (24% → ~6%). Residual risk noted for next quarter: AP-ROAST3’s motor-room placement — money eventually well spent, but not this quarter’s emergency.',
   fbBad:'Rejected. Maximum transmit power makes CCI/ACI WORSE (you shout over your neighbors); new APs running the same broken channel plan reproduce the same problem expensively; shielding the motor room addresses one source (and not the channel plan). The configuration-only remediation is root-cause work with a verification metric attached.',
   hints:['Which option changes the CONTENTION geometry rather than the hardware?','What does raising power do to the neighbors you share airtime with?','Re-plan + steering ($0); justification = root-cause removal with measurable before/after.'],
   nudge:'Think: which actions change root causes, and which ones cosmetically hide symptoms?'},

  {id:'OBJ-H8', sec:'briefing', pillar:'P4', bloom:'Create',
   title:'Sequence the remediation plan',
   prompt:'Order the six actions into the correct plan for the kiosk case — the sequence the troubleshooting methodology (5.1) and good engineering both demand. Exact sequence required.',
   widget:{type:'order', items:EIGHT_STEPS, slots:6, field:'h8order', caption:'Click tiles into the plan, ① → ⑥'},
   check:{fields:{h8order:{mode:'seq', v:['e1','e2','e3','e4','e5','e6']}}},
   fbOk:'Sequence accepted — and it is literally the N+ methodology: identify → theory → test → plan → implement+verify → document. Two disciplines matter: the theory is TESTED before the plan is funded (traceroute + utilization data kill wrong theories cheaply), and verification + documentation are part of the fix, not an afterthought — your handover notes are the next engineer’s baseline.',
   fbBad:'Sequence rejected. Anchor points: you cannot TEST a theory you haven’t FORMED, you don’t IMPLEMENT before testing, and the work is not done when the packets move — verification and documentation close the loop. Rebuild from “identify” and ask of each tile: what must be true before this can happen?',
   hints:['Tiles 1–3 are pure diagnosis. What comes before what?','Implementation happens only after a theory has been tested and a plan established.','Identify → theory → test → plan → implement+verify → document.'],
   nudge:'The methodology’s seven steps are printed in the memo — map the six tiles onto them.'},
];
