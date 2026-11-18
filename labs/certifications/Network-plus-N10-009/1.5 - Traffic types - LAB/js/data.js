/* The Packet Dispatch Bureau — N10-009 Lesson 1.5: Traffic Types (static port)
   Extracted verbatim from the audited single-file lab (all audit fixes included).
   Lab content: topology, hosts, frames, quizzes, objective defs, glossary.
   Classic script (no modules) so the lab also runs from file:// after unzip. */

/* ================================================================
   PART 3 — DATA: topology, frames, quizzes, objectives, glossary
   ================================================================ */
"use strict";

const LAB_KEY = "cyberlab.n10009.trafficTypes.v1";

/* ---------- topology ---------- */
const VLANS = {
  VLAN10: { name: "Office LAN", net: "10.10.10.0/24", sw: "SW1" },
  VLAN20: { name: "Studio LAN", net: "10.20.30.0/24", sw: "SW2" }
};
const HOSTS = {
  "WKS-01":  { vlan:"VLAN10", ip:"10.10.10.11",  mac:"02:11:5C:AA:00:11", kind:"host" },
  "WKS-02":  { vlan:"VLAN10", ip:"10.10.10.12",  mac:"02:11:5C:AA:00:12", kind:"host" },
  "LAPT-07": { vlan:"VLAN10", ip:"10.10.10.13",  mac:"02:11:5C:AA:00:13", kind:"host" },
  "SRV-DC01":{ vlan:"VLAN10", ip:"10.10.10.20",  mac:"02:11:5C:AA:00:20", kind:"host" },
  "PRN-01":  { vlan:"VLAN10", ip:"10.10.10.30",  mac:"02:11:5C:AA:00:30", kind:"host" },
  "CAM-01":  { vlan:"VLAN20", ip:"10.20.30.21",  mac:"02:11:5C:BB:00:21", kind:"host" },
  "CAM-02":  { vlan:"VLAN20", ip:"10.20.30.22",  mac:"02:11:5C:BB:00:22", kind:"host" },
  "NVR-01":  { vlan:"VLAN20", ip:"10.20.30.10",  mac:"02:11:5C:BB:00:10", kind:"host" }
};
const VLAN10_HOSTS = ["WKS-01","WKS-02","LAPT-07","SRV-DC01","PRN-01"];
const VLAN20_HOSTS = ["CAM-01","CAM-02","NVR-01"];
const EDGES = ["EDGE-SIN","EDGE-FRA","EDGE-NYC"];
const CDN_IP = "198.51.100.7";
const GROUPS = {
  "G-IPTV": { label:"IPTV channel 4", addr:"239.10.1.10",  joinable:VLAN10_HOSTS, vlan:"VLAN10" },
  "G-TICK": { label:"Market ticker",  addr:"239.20.2.20",  joinable:VLAN20_HOSTS, vlan:"VLAN20" },
  "G-OSPF": { label:"OSPF routers",   addr:"224.0.0.5",    joinable:[],           vlan:null }
};
const BOARD_NODES = [
  { id:"INET",   x:18,  y:16,  w:112, h:44, label:"INTERNET",  nip:"upstream cloud",  kind:"inet" },
  { id:"WEB",    x:18,  y:78,  w:112, h:44, label:"WEB-SRV",   nip:"203.0.113.20",    kind:"host" },
  { id:"R1",     x:290, y:24,  w:150, h:50, label:"R1 (router)",nip:"10.10.10.1 · 10.20.30.1", kind:"router" },
  { id:"SW1",    x:110, y:118, w:130, h:40, label:"SW1 (switch)", nip:"VLAN 10",      kind:"switch" },
  { id:"SW2",    x:508, y:118, w:130, h:40, label:"SW2 (switch)", nip:"VLAN 20",      kind:"switch" },
  { id:"WKS-01", x:20,  y:196, w:118, h:40, label:"WKS-01",   nip:"10.10.10.11",     kind:"host" },
  { id:"WKS-02", x:148, y:196, w:118, h:40, label:"WKS-02",   nip:"10.10.10.12",     kind:"host" },
  { id:"LAPT-07",x:276, y:196, w:118, h:40, label:"LAPT-07",  nip:"10.10.10.13",     kind:"host" },
  { id:"SRV-DC01",x:20, y:246, w:118, h:40, label:"SRV-DC01", nip:"10.10.10.20",     kind:"host" },
  { id:"PRN-01", x:148, y:246, w:118, h:40, label:"PRN-01",   nip:"10.10.10.30",     kind:"host" },
  { id:"CAM-01", x:470, y:196, w:112, h:40, label:"CAM-01",   nip:"10.20.30.21",     kind:"host" },
  { id:"CAM-02", x:594, y:196, w:112, h:40, label:"CAM-02",   nip:"10.20.30.22",     kind:"host" },
  { id:"NVR-01", x:532, y:246, w:112, h:40, label:"NVR-01",   nip:"10.20.30.10",     kind:"host" },
  { id:"EDGE-SIN",x:628,y:20,  w:122, h:36, label:"EDGE-SIN", nip:"Singapore twin",  kind:"edge" },
  { id:"EDGE-FRA",x:628,y:66,  w:122, h:36, label:"EDGE-FRA", nip:"Frankfurt twin",  kind:"edge" },
  { id:"EDGE-NYC",x:628,y:112, w:122, h:36, label:"EDGE-NYC", nip:"New York twin",   kind:"edge" }
];
const BOARD_LINES = [
  [74,60,74,78], [322,74,175,118], [408,74,573,118], [440,46,628,38], [440,56,628,84], [440,66,628,130],
  [175,158,79,196], [175,158,207,196], [175,158,335,196], [175,158,79,246], [175,158,207,246],
  [573,158,526,196], [573,158,650,196], [573,158,588,246]
];

/* ---------- capture binder ---------- */
const FRAMES = [
  { id:"F1", medium:true, proto:"ARP", ethSrc:"02:11:5C:AA:00:11 (WKS-01)", ethDst:"FF:FF:FF:FF:FF:FF", ipSrc:"10.10.10.11", ipDst:"— (ARP has no IP dst)",
    l4:"Who has 10.10.10.20? Tell 10.10.10.11", capture:"VLAN 10 · SW1 port 3", type:"broadcast",
    pattern:"MAC = FF:FF… — the floor-wide shout", why:"ARP asks every NIC in the VLAN at once; only SRV-DC01 answers (that reply is unicast). Broadcast never crosses R1." },
  { id:"F2", medium:true, proto:"DHCP Discover", ethSrc:"02:11:5C:AA:00:13 (LAPT-07)", ethDst:"FF:FF:FF:FF:FF:FF", ipSrc:"0.0.0.0", ipDst:"255.255.255.255",
    l4:"UDP 68 → 67 · DISCOVER", capture:"VLAN 10 · SW1 uplink", type:"broadcast",
    pattern:"Limited broadcast — client has no address yet", why:"An address-less client cannot unicast, so Discover rides 255.255.255.255 / FF:FF… and every VLAN-10 NIC receives it." },
  { id:"F3", medium:true, proto:"HTTPS", ethSrc:"02:11:5C:AA:00:12 (WKS-02)", ethDst:"02:11:5C:AA:00:20 (SRV-DC01)", ipSrc:"10.10.10.12", ipDst:"10.10.10.20 : 443",
    l4:"TCP SYN", capture:"VLAN 10 · SW1 port 5", type:"unicast",
    pattern:"Ordinary host-to-host — the default", why:"One named destination, one copy. The overwhelming majority of LAN traffic looks like this." },
  { id:"F4", medium:true, proto:"DNS query", ethSrc:"02:11:5C:AA:00:12 (WKS-02)", ethDst:"02:11:5C:10:00:01 (R1 — next hop)", ipSrc:"10.10.10.12", ipDst:"198.51.100.53 : 53",
    l4:"UDP 53 (recursive query)", capture:"R1 · VLAN 10 ingress", type:"unicast",
    pattern:"Unicast packet, anycast SERVICE — the trap", why:"198.51.100.53 is announced from three cities (anycast), but the packet itself addresses one unicast IP: this is unicast on the wire. Anycast is a deployment model, not a packet type." },
  { id:"F5", medium:true, proto:"OSPF hello", ethSrc:"02:11:5C:10:00:01 (R1)", ethDst:"01:00:5E:00:00:05", ipSrc:"10.10.10.1", ipDst:"224.0.0.5",
    l4:"proto 89 · hello", capture:"R1 · VLAN 10", type:"multicast",
    pattern:"01:00:5E… + 224.0.0.5 (IANA: OSPF all routers)", why:"Routing hellos go to the all-OSPF-routers group; hosts ignore them, and the 224.0.0.0/24 block is never forwarded off the link." },
  { id:"F6", medium:true, proto:"IPTV stream", ethSrc:"02:11:5C:AA:00:20 (SRV-DC01)", ethDst:"01:00:5E:0A:01:0A", ipSrc:"10.10.10.20", ipDst:"239.10.1.10 : 5004",
    l4:"UDP RTP video", capture:"VLAN 10 · SW1", type:"multicast",
    pattern:"239.x = organization-local scope (RFC 2365)", why:"One stream, sent once; only hosts that joined via IGMP receive copies — provided the switch runs IGMP snooping." },
  { id:"F7", medium:true, proto:"SSDP discover", ethSrc:"02:11:5C:AA:00:13 (LAPT-07)", ethDst:"01:00:5E:7F:FF:FA", ipSrc:"10.10.10.13", ipDst:"239.255.255.250 : 1900",
    l4:"UDP · M-SEARCH", capture:"VLAN 10 · SW1", type:"multicast",
    pattern:"SSDP rides organization-local 239.255.255.250", why:"Device discovery (UPnP) uses multicast so every candidate responder hears the search — without a per-device broadcast." },
  { id:"F8", medium:true, proto:"IPv6 Neighbor Solicitation", ethSrc:"02:11:5C:AA:00:11 (WKS-01)", ethDst:"33:33:FF:00:00:12", ipSrc:"2001:db8:10::11", ipDst:"ff02::1:ff00:0012",
    l4:"ICMPv6 type 135 · who has 2001:db8:10::12?", capture:"VLAN 10 · SW1", type:"multicast",
    pattern:"MAC 33:33… = IPv6 multicast. There is NO broadcast in IPv6", why:"NDP replaces ARP: the question goes to the target's solicited-node group (ff02::1:ff + last 24 bits of the target address), so only the owner answers." },
  { id:"F9", medium:false, proto:"ICMP echo", ethSrc:"02:11:5C:AA:00:11 (WKS-01)", ethDst:"FF:FF:FF:FF:FF:FF", ipSrc:"10.10.10.11", ipDst:"10.20.30.255",
    l4:"ICMP echo request (sweep pattern)", capture:"R1 · VLAN 20 egress (after forwarding!)", type:"broadcast",
    pattern:"Directed broadcast aimed at a REMOTE subnet — anomalous", why:"One echo becomes replies from every studio host (the smurf pattern). Hardened routers refuse directed broadcasts (RFC 2644 default); this one was allowed across — investigate the sender.", anomaly:true },
  { id:"F10", medium:false, proto:"SMB session", ethSrc:"02:11:5C:AA:00:12 (WKS-02)", ethDst:"02:11:5C:AA:00:99 (no such host)", ipSrc:"10.10.10.12", ipDst:"10.10.10.99 : 445",
    l4:"TCP SYN (no answer)", capture:"VLAN 10 · SW1 flood", type:"unicast",
    pattern:"Unicast to an empty seat — still unicast", why:"Addressing defines the type, not delivery: a unicast packet to an unused IP stays unicast. (The switch floods unknown-unicast within the VLAN, but that is a switching behavior, not a traffic type.)" },
  { id:"F11", medium:false, proto:"VRRP hello", ethSrc:"02:11:5C:10:00:02 (R1-B)", ethDst:"01:00:5E:00:00:12", ipSrc:"10.10.10.2", ipDst:"224.0.0.18",
    l4:"proto 112 · advertisement", capture:"R1 · VLAN 10", type:"multicast",
    pattern:"IANA: 224.0.0.18 = VRRP", why:"First-hop redundancy hellos go to a reserved multicast group so every router in the group hears them and no host cares." },
  { id:"F12", medium:false, proto:"DHCP Offer", ethSrc:"02:11:5C:AA:00:20 (SRV-DC01)", ethDst:"FF:FF:FF:FF:FF:FF", ipSrc:"10.10.10.20", ipDst:"255.255.255.255",
    l4:"UDP 67 → 68 · OFFER (broadcast flag set)", capture:"VLAN 10 · SW1", type:"broadcast",
    pattern:"The OFFER itself rides a broadcast", why:"The client still has no address, so the server broadcasts the offer (DORA can run partly broadcast — a favourite exam nuance)." }
];
const TRAFFIC_TYPES = ["unicast","broadcast","multicast","anycast"];

/* ---------- M6 matcher ---------- */
/* display order interleaves the answer types (u/b/m/u/b/m) so adjacent rows never share one */
const MATCHER = [
  { id:"dns",  label:"DNS query to anycast resolver 198.51.100.53",                   ans:"unicast" },
  { id:"arp",  label:"ARP request — “who has 10.10.10.20?”",                          ans:"broadcast" },
  { id:"iptv", label:"IPTV channel stream to 239.10.1.10",                            ans:"multicast" },
  { id:"http", label:"HTTPS page load from WKS-02 to SRV-DC01",                       ans:"unicast" },
  { id:"dhcp", label:"DHCP Discover from an address-less client",                     ans:"broadcast" },
  { id:"ospf", label:"OSPF hello to 224.0.0.5",                                      ans:"multicast" }
];

/* ---------- quizzes ---------- */
const QUIZ = {
  medium: [
    { q:"Which Ethernet destination MAC marks a broadcast frame?", topic:"broadcast MAC / addressing",
      opts:["01:00:5E:00:00:05 (OSPF routers)","02:11:5C:AA:00:11 (one NIC)","FF:FF:FF:FF:FF:FF (all stations)","33:33:00:00:00:01 (IPv6 nodes)"], correct:2,
      exp:"FF:FF:FF:FF:FF:FF is the all-stations address every NIC must process. 01:00:5E… is IPv4 multicast, 33:33… is IPv6 multicast, and the last one is a normal unicast NIC." },
    { q:"IPv4 multicast addresses live in which range?", topic:"Class D range",
      opts:["224.0.0.0 – 239.255.255.255","240.0.0.0 – 255.255.255.255","224.0.0.0 – 224.0.0.255 only","192.168.0.0 – 192.168.255.255"], correct:0,
      exp:"Class D, 224.0.0.0/4, covers 224–239. Within it, 224.0.0.0/24 is link-local control (never forwarded) and 239.0.0.0/8 is organization-local scope. 240/4 is Class E (reserved), and 192.168/16 is private unicast." },
    { q:"A DNS query to public resolver 198.51.100.53 — which anycast twins serve — is, on the wire, a ___ packet delivered by a ___ service.", topic:"anycast is unicast on the wire",
      opts:["broadcast / anycast","multicast / multicast","anycast / unicast","unicast / anycast"], correct:3,
      exp:"The packet addresses one ordinary unicast IP; the anycast trick is that the SAME IP exists in several cities and routing picks the nearest. On the wire: plain unicast. Top exam trap." },
    { q:"IPv6 must reach every node on the link. It uses…", topic:"IPv6 replaces broadcast",
      opts:["Broadcast 255.255.255.255","Multicast ff02::1 (all nodes)","Broadcast ff02::1","Anycast to the nearest node"], correct:1,
      exp:"IPv6 deleted broadcast entirely. The all-nodes multicast group ff02::1 does the “everyone” job; NDP uses solicited-node groups instead of ARP broadcast." },
    { q:"What kind of device defines the edge of a broadcast domain?", topic:"broadcast domain boundary",
      opts:["A hub or switch","A wireless access point","A VLAN trunk port","A router (L3 boundary)"], correct:3,
      exp:"Switches and hubs FLOOD broadcasts inside the domain; routers refuse to forward them. Each VLAN is one broadcast domain; one router between VLANs = two domains." },
    { q:"IGMP's job is…", topic:"IGMP purpose",
      opts:["Encrypting multicast streams","Routing multicast between ASes","Reporting multicast group membership","Assigning multicast MACs"], correct:2,
      exp:"IGMP lets hosts join/leave groups so routers (and snooping switches, via queries) know where to copy the stream. Encryption is IPsec's job; inter-AS routing is MBGP/PIM's job; the MAC mapping is arithmetic, not signalling." },
    { q:"239.10.1.10 falls inside 239.0.0.0/8. That tells you…", topic:"organization-local scope",
      opts:["Organization-local scope (RFC 2365)","Internet-wide global multicast","A routers-only reserved block","An invalid multicast address"], correct:0,
      exp:"239.0.0.0/8 is administratively scoped (organization-local): private multicast space like 10/8 is for unicast. Internet-wide global multicast would be ff0e::/16 in IPv6 or 224.0.1.0+ blocks in IPv4." }
  ],
  hard: [
    { q:"You open a frame: dst MAC 01:00:5E:00:00:05, dst IP 224.0.0.5, protocol 89. What is it and why?", topic:"reading OSPF multicast captures",
      opts:["A broadcast announcing routes to every host","OSPF hellos on a link-local router group","A unicast to the designated router","An anycast probe to the nearest router"], correct:1,
      exp:"01:00:5E + 224.0.0.5 (IANA: OSPF all routers) + protocol 89 = OSPF hellos. The 224.0.0.0/24 block is link-local: switches may flood it in-VLAN, routers never forward it." },
    { q:"R1 receives an ICMP echo aimed at 10.20.30.255 from a remote subnet. With forwarding at modern defaults, R1 will…", topic:"directed-broadcast default (RFC 2644)",
      opts:["Forward it — routers relay broadcasts","Hold it until WoL is requested","Convert it to multicast 224.0.0.1","Refuse it — RFC 2644 default-deny"], correct:3,
      exp:"Since RFC 2644 routers refuse directed broadcasts unless explicitly enabled: one packet would otherwise become replies from every host of the target subnet (smurf amplification)." },
    { q:"A TCP download from 198.51.100.7 resets mid-transfer; routing had shifted to a different anycast twin. Root cause?", topic:"anycast session discontinuity",
      opts:["Routing now delivers to another endpoint","The CDN ran out of bandwidth","A broadcast storm hit the CDN","TTL expired at the twins"], correct:0,
      exp:"Anycast delivers to whichever twin is nearest NOW. TCP sessions expect the same endpoint; a new twin means a broken session. DNS/UDP-style connectionless traffic shrugs this off." },
    { q:"Flat /24, 250 hosts, ARP and DHCP broadcasts eat airtime. Best first move?", topic:"bounding broadcast domains",
      opts:["Enable IGMP snooping","Disable directed-broadcast forwarding","Add VLAN segmentation","Enable storm control"], correct:2,
      exp:"Only an L3 boundary bounds a broadcast domain. Snooping fixes multicast floods, directed-broadcast denial stops amplification, storm control rate-limits symptoms — none shrinks the audience of ARP shouts." },
    { q:"IGMP snooping is ON on every switch, yet the IPTV channel still floods all ports. Most likely miss?", topic:"snooping needs a querier",
      opts:["DHCP snooping is missing too","No querier is sending IGMP queries","The stream TTL is set to 255","IGMP version mismatch on hosts"], correct:1,
      exp:"Snooping builds its forwarding table from IGMP membership reports — which only exist if something queries. Without a querier (router or L3 switch feature), snooping has nothing to learn and floods." },
    { q:"Frame: dst MAC 33:33:00:00:00:01. Interpret it.", topic:"IPv6 multicast MAC mapping",
      opts:["An Ethernet broadcast from ARP","IPv4 multicast to all routers","A corrupted MAC — drop it","The IPv6 all-nodes multicast (ff02::1)"], correct:3,
      exp:"33:33 + low 32 bits of the IPv6 multicast target maps to the NIC. 33:33:00:00:00:01 = ff02::1, the all-nodes group that replaced broadcast's “everyone” job in IPv6." },
    { q:"Which statement about anycast is TRUE?", topic:"anycast deployment model",
      opts:["Same unicast IP announced from many sites","A special Class-E range reserved for it","A distinct IP protocol number (99)","Delivery to every twin at once"], correct:0,
      exp:"Anycast borrows plain unicast addresses and lets routing choose the nearest instance of many. It is a deployment model — which is exactly why it is invisible in a packet header." }
  ]
};

/* ---------- NOC datasets (bcast/mcast pps per minute) ---------- */
const NOC_MEDIUM = {
  VLAN10: { bcast:[12,14,11,15,920,1140,1080,860,240,60],  mcast:[28,30,26,30,30,30,28,26,30,28] },
  VLAN20: { bcast:[8,10,9,11,8,10,9,8,10,9],               mcast:[18,22,20,19,21,20,18,22,19,20] },
  VLAN30: { bcast:[15,17,14,16,15,18,16,14,17,15],         mcast:[4,5,4,5,4,5,4,5,4,5] }
};
const NOC_HARD = {
  VLAN10: { bcast:[18,16,20,1150,1320,1280,1210,980,300,40], mcast:[22,24,20,24,22,20,22,24,20,22] },
  VLAN20: { bcast:[10,9,11,10,9,11,10,9,10,9],               mcast:[22,24,20,410,420,415,405,410,30,24] },
  VLAN30: { bcast:[14,160,175,168,180,14,15,13,16,14],       mcast:[5,4,5,4,5,4,5,4,5,4] }
};
const NOC_CLEAN = {
  VLAN10: { bcast:[12,14,11,13,12,14,11,12,13,12],           mcast:[28,30,26,30,30,30,28,26,30,28] },
  VLAN20: { bcast:[8,10,9,10,8,10,9,8,10,9],                 mcast:[18,22,20,19,21,20,18,22,19,20] },
  VLAN30: { bcast:[15,17,14,16,15,18,16,14,17,15],           mcast:[4,5,4,5,4,5,4,5,4,5] }
};
const NOC_DAYS = {
  A: { VLAN10:{ bcast:[18,16,20,1100,1150,1120,1080,20,18,16], mcast:[22,24,20,22,20,22,24,20,22,20] } },
  B: { VLAN10:{ bcast:[16,18,330,325,18,16,20,15,18,16],       mcast:[22,20,22,20,22,20,22,20,22,20] } },
  C: { VLAN10:{ bcast:[14,16,15,18,16,15,17,16,15,16],         mcast:[22,20,22,20,22,20,22,20,22,20] } }
};

/* ---------- runbook (H9) ---------- */
const RUNBOOK = [
  { id:"stop-loop", t:"Find and break the physical loop — stop the storm at its source" },
  { id:"stormctl",  t:"Enable storm control on access uplinks — buy back CPU and airtime" },
  { id:"segment",   t:"Segment the flat network into VLANs — shrink the broadcast domains" },
  { id:"snooping",  t:"Enable IGMP snooping + querier — stop multicast flooding" },
  { id:"monitor",   t:"Wire counters to tuned alerts — stay aware from now on" }
];
/* display order deliberately breaks the scenario→position diagonal (answers land at 5,2,1,4) */
const H8_OPTIONS = [
  { v:"wol",    t:"Narrow directed-broadcast exception for Wake-on-LAN" },
  { v:"snoop",  t:"IGMP snooping + querier" },
  { v:"dirfwd", t:"Enable directed-broadcast forwarding everywhere" },
  { v:"anymon", t:"Anycast deployment with health monitoring" },
  { v:"vlan",   t:"VLAN segmentation (L3 boundaries)" }
];
const H8_ANSWERS = { s1:"vlan", s2:"snoop", s3:"wol", s4:"anymon" };

/* ---------- glossary ---------- */
const GLOSSARY = [
  ["Unicast","One copy, one addressed recipient — the default IP delivery mode."],
  ["Broadcast","One copy delivered to every node in the local broadcast domain."],
  ["Limited broadcast","255.255.255.255 / MAC FF:FF:FF:FF:FF:FF — never leaves the local segment."],
  ["Directed broadcast","All-ones host address of a remote subnet (e.g. 10.20.30.255) — forwardable but refused by default (RFC 2644)."],
  ["Broadcast domain","The set of nodes a broadcast reaches; routers are its boundary; each VLAN is one domain."],
  ["Collision domain","Segment where frames can collide; a switch port is its own collision domain (a hub shares one)."],
  ["Multicast","One copy delivered only to nodes that joined the group."],
  ["Multicast group (Class D)","IPv4 224.0.0.0/4 group address — never assigned to a host."],
  ["Organization-local scope","239.0.0.0/8 — administratively scoped multicast for inside one organization (RFC 2365)."],
  ["IGMP","The protocol hosts use to tell routers their multicast group membership (v1 join / v2 leave / v3 source filtering)."],
  ["IGMP snooping","Switch feature forwarding multicast only to member ports — it needs a querier's IGMP queries to learn anything."],
  ["Solicited-node multicast","IPv6 ff02::1:ffXX:XXXX per-target group that NDP uses instead of ARP broadcast (MAC 33:33:ff…)."],
  ["Anycast","Same unicast IP served from many sites; the routing metric picks the nearest twin. A deployment model, not an address type."],
  ["Broadcast storm","Runaway broadcast amplification, classically induced by a Layer-2 loop; visible as sustained 1000+ pps on the meters."]
];

/* ---------- stations ---------- */
const STATIONS = [
  { id:"briefing", n:"01", t:"Induction desk" },
  { id:"core",     n:"02", t:"Reference shelf" },
  { id:"dispatch", n:"03", t:"Dispatch floor" },
  { id:"binder",   n:"04", t:"Evidence room" },
  { id:"meter",    n:"05", t:"Meter room" },
  { id:"bench",    n:"06", t:"Control bench" },
  { id:"quiz",     n:"07", t:"Exam hall" },
  { id:"debrief",  n:"08", t:"After-action" }
];

/* ---------- objective definitions (validators live here) ---------- */
const hist = s => s.env.history;
const findD = (s,p) => hist(s).find(p);
const lastD = s => hist(s)[hist(s).length-1];
const sameSet = (a,b) => a.length===b.length && [...a].sort().join(",")===[...b].sort().join(",");
const bcastOK = s => {
  const d = findD(s, d=>d.mode==="broadcast" && d.dest==="limited" && HOSTS[d.src] && HOSTS[d.src].vlan==="VLAN10");
  return { d, ok: !!d && sameSet(d.receivers, VLAN10_HOSTS) };
};
const iptvDispatch = (s, snooping) => findD(s, d=>d.mode==="multicast" && d.dest==="G-IPTV" && d.snoopingSW1===snooping);
const anycastD = (s) => findD(s, d=>d.mode==="anycast" && d.dest==="CDN");
const dirD = (s, fwd) => findD(s, d=>d.mode==="broadcast" && d.dest==="dir-vlan20" && (fwd ? d.forwardedVia==="directedFwd" : d.verdict==="BLOCKED"));
const ndD = s => findD(s, d=>d.dest==="ND-SOLICIT");
const mcastAfter = (s, flag) => {
  const i = s.env.flagIndex[flag] ?? -1;
  return findD(s, d=>d.mode==="multicast" && d.dest==="G-IPTV" && d.n > i && d.snoopingSW1===true);
};

const OBJ_DEFS = [
  /* ===== MEDIUM ===== */
  { id:"OBJ-M1", mode:"medium", pillar:"P1", anchor:"CI-1 unicast mechanics",
    title:"Send a unicast request from WKS-01 to SRV-DC01 and confirm exactly one recipient.",
    where:"Dispatch floor (station ③): source WKS-01, mode Unicast, destination SRV-DC01.",
    hints:["Open the Dispatch floor and fill the form: From = WKS-01, mode = Unicast.","Destination = SRV-DC01 (10.10.10.20). Press DISPATCH.","Success: the delivery report lists only SRV-DC01 and the verdict reads DELIVERED."],
    validate:s=>{ const d=findD(s,d=>d.src==="WKS-01"&&d.mode==="unicast"&&d.dest==="SRV-DC01");
      return { pass: !!d && sameSet(d.receivers,["SRV-DC01"]),
        ok:"One addressed host, one copy — and R1 was never involved because both ends share VLAN 10. Defender's habit: unicast volume is capacity talk; broadcast volume is incident talk. Learn to separate the two on sight.",
        fail:"Not yet. Set source WKS-01, mode Unicast, destination SRV-DC01 on the dispatch form, press DISPATCH, and check the delivery report shows exactly one receiver." } } },
  { id:"OBJ-M2", mode:"medium", pillar:"P1", anchor:"CI-2.1 limited broadcast · CI-2.3 ARP/DHCP",
    title:"Broadcast a DHCP-style shout from VLAN 10 and prove it stops at R1.",
    where:"Dispatch floor: mode Broadcast, destination 255.255.255.255 (limited).",
    hints:["Mode = Broadcast; destination = the limited broadcast 255.255.255.255.","Source can be any office host (WKS-01 works).","Proof: every VLAN-10 host receives, and the ledger shows R1 refusing to forward."],
    validate:s=>{ const r=bcastOK(s);
      return { pass:r.ok, ok:"Every NIC on the floor processed the frame, and the router refused to carry it further — that refusal IS the broadcast-domain boundary. ARP and DHCP Discover live exactly here.",
        fail:"Compose a broadcast: mode Broadcast, destination 255.255.255.255 (limited), from a VLAN-10 host. The delivery report must show all five office hosts and none of VLAN 20." } } },
  { id:"OBJ-M3", mode:"medium", pillar:"P1", anchor:"CI-3.1 Class D · CI-3.4 IGMP/snooping",
    title:"Join WKS-01 and WKS-02 to IPTV 239.10.1.10 and deliver it with snooping ON.",
    where:"Dispatch floor: group manager (join two hosts), snooping plate SW1 = ON, then dispatch Multicast → G-IPTV.",
    hints:["In the Multicast group manager, tick WKS-01 and WKS-02 for IPTV channel 4.","Flip the switchboard plate: IGMP snooping SW1 = ON (a plate is a control, not a form field).","Dispatch mode Multicast → destination IPTV channel 4. Only the two joined hosts may appear in the delivery report."],
    validate:s=>{ const g=s.env.groups["G-IPTV"]||[]; const d=iptvDispatch(s,true);
      return { pass: g.includes("WKS-01")&&g.includes("WKS-02")&&!!d&&sameSet(d.receivers,g),
        ok:"One stream, sent once, copied only to the subscribers — that is multicast economy. The switch honoured IGMP membership because snooping was on. 239.x is your organization-local scope (RFC 2365).",
        fail:"Three things must line up: WKS-01 and WKS-02 joined in the group manager, snooping SW1 ON, and a multicast dispatch to IPTV with exactly the joined hosts as receivers." } } },
  { id:"OBJ-M4", mode:"medium", pillar:"P1", anchor:"CI-4.1 nearest twin · CI-4.3 failover",
    title:"Get served by the nearest CDN edge — then take it down and be served by the next-nearest.",
    where:"Dispatch floor: mode Anycast → CDN 198.51.100.7; then edge status: EDGE-SIN offline; dispatch again.",
    hints:["Mode = Anycast, destination = CDN 198.51.100.7; dispatch once from any office host and note which twin answers.","In the switchboard's edge-status panel, mark EDGE-SIN offline.","Dispatch again — the Frankfurt twin should answer; that is transparent failover."],
    validate:s=>{ const a=anycastD(s); const first=a&&a.receivers[0]==="EDGE-SIN";
      const second=hist(s).find((d,i)=>d.mode==="anycast"&&d.dest==="CDN"&&d.edgeDown&&d.edgeDown["EDGE-SIN"]===true&&d.receivers[0]==="EDGE-FRA"&&a&&d.n>a.n);
      return { pass: !!first&&!!second,
        ok:"Same IP, two different servers: routing simply picks the nearest announcer. Watch what you did NOT see — no new address type, no special header. Anycast is unicast with twins.",
        fail:"Two dispatches are needed: one with all twins alive (EDGE-SIN must answer), then EDGE-SIN marked offline in edge status, and a second dispatch answered by EDGE-FRA." } } },
  { id:"OBJ-M5", mode:"medium", pillar:"P2", anchor:"CI-2.1/3.2/3.6 recognition in captures",
    title:"Classify all 8 Day-shift frames in the capture binder.",
    where:"Evidence room (station ④): use the “Your call” column; open rows for full headers.",
    hints:["Read the Ethernet destination MAC first: FF:FF… broadcast · 01:00:5E… multicast · 33:33… IPv6 multicast · otherwise unicast.","Frame F4 is the trap: the resolver is an anycast SERVICE, but the packet is a plain unicast packet.","F8 is multicast too — IPv6 has no broadcast; solicited-node multicast carries NDP's questions."],
    validate:s=>{ const bad=FRAMES.filter(f=>f.medium).filter(f=>s.ev.cls[f.id]!==f.type);
      return { pass:bad.length===0, ok:"All eight calls correct. You are reading destination addressing the way tools do: MAC first, IP second, and never confusing a service model (anycast) with a packet type.",
        fail:"Not all calls are right yet: "+(bad.map(f=>f.id).join(", ")||"—")+" still need correction. Re-read their headers in the inspector." } } },
  { id:"OBJ-M6", mode:"medium", pillar:"P2", anchor:"CI-2.3 · CI-3.6 · CI-4 protocol mapping",
    title:"Match six real protocols to their traffic type (Evidence room, matcher panel).",
    where:"Evidence room — Work order M6 panel.",
    hints:["ARP request and DHCP Discover ask the whole floor → broadcast.","OSPF hello and the IPTV stream go to groups → multicast.","HTTPS is host-to-host, and the DNS query is unicast even though the service is anycast."],
    validate:s=>{ const bad=MATCHER.filter(m=>s.match[m.id]!==m.ans);
      return { pass:bad.length===0, ok:"Six for six. Notice the pattern: discovery protocols shout or multicast; user sessions unicast; the anycast resolver rides unicast packets.",
        fail:"Some assignments are off"+(bad.length?": "+bad.map(m=>m.label.split(" ")[0]).join(", "):"")+". Ask for each: exactly one host, the whole floor, or a subscribed group?" } } },
  { id:"OBJ-M7", mode:"medium", pillar:"P3", anchor:"CI-6 counters & anomaly reading",
    title:"Run the monitored window in the meter room; name the misbehaving VLAN and the likely cause.",
    where:"Meter room (station ⑤): Run the window, then answer the two questions.",
    hints:["Run the window and compare the three VLAN charts — two look like gentle rhythm, one does not.","The office VLAN's broadcast bars spike to ~1000 pps — that is storm territory.","A sustained broadcast flood on one VLAN with normal multicast elsewhere is the classic Layer-2 loop signature."],
    validate:s=>{ return { pass: !!s.noc.runs.medium && s.bench.m7vlan==="VLAN10" && s.bench.m7cause==="loop",
        ok:"Correct: VLAN 10 broadcasting ~1000+ pps for minutes = a loop-fed broadcast storm, not traffic. Next step on a real floor: find the loop, then storm-control the uplinks while you look.",
        fail:"Run the window first, then answer both questions. Look for the VLAN whose broadcast bars leap far above the others and stay there." } } },
  { id:"OBJ-M8", mode:"medium", pillar:"P3", anchor:"CI-3.4 snooping on/off verification",
    title:"Watch multicast flood with snooping OFF, then flip it ON and watch the flood collapse.",
    where:"Dispatch floor: snooping SW1 OFF → dispatch Multicast → G-IPTV; then snooping ON → dispatch again.",
    hints:["First dispatch with the snooping plate OFF: the delivery report should show FLOODED to every office host.","Flip IGMP snooping SW1 to ON (leave the group memberships alone).","Dispatch again: only joined hosts receive — compare the two reports."],
    validate:s=>{ const g=s.env.groups["G-IPTV"]||[]; const off=iptvDispatch(s,false); const on=mcastAfter(s,"snoopingSW1");
      return { pass: !!off && sameSet(off.receivers,VLAN10_HOSTS) && !!on && sameSet(on.receivers,g) && g.length>0,
        ok:"You just witnessed the classic misconfig: without snooping, switches treat multicast like broadcast — every port pays. With snooping (and a querier in real deployments), only member ports receive.",
        fail:"Sequence matters: dispatch IPTV multicast with snooping OFF (all five office hosts flooded), THEN flip snooping ON and dispatch again (only the joined hosts receive)." } } },
  { id:"OBJ-M9", mode:"medium", pillar:"P4", anchor:"CI-7 control selection",
    title:"Choose the single primary control for the flat-office symptom — and justify it (Control bench).",
    where:"Control bench (station ⑥): Work order M9.",
    hints:["The symptom is broadcast overhead interrupting 250 NICs — ask which control shrinks the AUDIENCE.","Snooping is about multicast; storm control rate-limits symptoms; directed-broadcast denial is about amplification.","The right answer names the thing that bounds a broadcast domain: an L3 boundary — VLANs."],
    validate:s=>{ return { pass: s.bench.m9control==="vlan" && s.bench.m9reason==="b",
        ok:"VLAN segmentation is the only option that shrinks the audience of every ARP and DHCP shout. Residual risk to mention in an interview: more subnets, and you now need inter-VLAN routing.",
        fail:"Pick ONE primary control and its matching reason. The tell: broadcast domains are bounded by routers — which option creates more L3 boundaries?" } } },
  { id:"OBJ-M10", mode:"medium", pillar:"P4", anchor:"CI-2.2 directed broadcast · RFC 2644",
    title:"Prove the directed-broadcast boundary: forward one, then refuse the next.",
    where:"Dispatch floor: plate “R1 forwards directed broadcasts” ON → Broadcast → 10.20.30.255; then OFF → dispatch again.",
    hints:["Turn the directed-broadcast plate ON and dispatch Broadcast → Studio VLAN (10.20.30.255). Read the danger note.","Turn the plate OFF — that is the RFC 2644 default — and dispatch the same thing again.","Proof: one report says FORWARDED (danger), the next says BLOCKED at R1."],
    validate:s=>{ const yes=dirD(s,true); const no=dirD(s,false);
      return { pass: !!yes && !!no && (!no || no.n>yes.n),
        ok:"You have now seen both sides of RFC 2644: forwarding a directed broadcast hands one packet to an entire remote subnet (smurf territory); the default-deny posture is a free, permanent win.",
        fail:"Two dispatches to 10.20.30.255: first with the directed-broadcast plate ON (FORWARDED — danger), then with it OFF (BLOCKED). The second must come after the first." } } },
  { id:"OBJ-M11", mode:"medium", pillar:"P1", anchor:"CI-3.7 IPv6 replaces broadcast",
    title:"Switch to IPv6, dispatch a Neighbor Solicitation, and name what replaced ARP's broadcast.",
    where:"Dispatch floor: address family = IPv6, destination list gains a Neighbor Solicitation; answer the quick question below the switchboard.",
    hints:["Set the address family selector to IPv6 — the destination list gains “Neighbor Solicitation”.","Dispatch it and read the ledger: it rides a solicited-node MULTICAST (33:33…), not a broadcast.","Answer the quick question under the switchboard — the exam loves this fact."],
    validate:s=>{ const d=ndD(s);
      return { pass: !!d && s.bench.m11==="mcast",
        ok:"IPv6 has no broadcast at all: ff02::1 shouts “everyone”, solicited-node groups ask “exactly who has this address”, and only the owner answers. One exam bullet, saved.",
        fail:"Two steps: dispatch the Neighbor Solicitation in IPv6 mode, then answer the quick question under the switchboard (it is not broadcast — IPv6 deleted it)." } } },

  /* ===== HARD ===== */
  { id:"OBJ-H1", mode:"hard", pillar:"P2", anchor:"CI-1/2.2/3.2/3.7 full triage",
    title:"Triage the full binder: classify all 12 frames, flag the one that does not belong, and say why.",
    where:"Evidence room: all 12 rows + the Night-shift duty panel.",
    hints:["One nudge permitted (costs score): judge every frame by destination addressing — MAC first, IP second.","Among the extras: an offer that rides a broadcast, a VRRP hello, a unicast to an empty seat, and an echo aimed at a remote all-ones host.","The anomaly is about PERMISSION, not type: which frame proves a router forwarded something it should refuse?"],
    validate:s=>{ const bad=FRAMES.filter(f=>s.ev.cls[f.id]!==f.type);
      const a=s.ev.anomaly==="F9"&&s.ev.anomalyReason==="sweep";
      return { pass:bad.length===0&&a, ok:"Full triage clean, anomaly flagged with the right rationale: an ICMP echo to 10.20.30.255 is a directed-broadcast sweep — on a hardened floor that frame never crosses R1.",
        fail:"Rejections"+(bad.length?" on "+bad.map(f=>f.id).join(", "):"")+"."+(a?"":" Anomaly call or reason is off — think RFC 2644.") } } },
  { id:"OBJ-H2", mode:"hard", pillar:"P1", anchor:"CI-2.1/2.4/2.5 domain math",
    title:"Audit the floor: broadcast domains, recipients, router behavior, and the reach-VLAN-20 address.",
    where:"Control bench: Work order H2 — all four parts.",
    hints:["One nudge permitted (costs score): count L3 boundaries, not switches.","R1 is the only router: each side of it is one broadcast domain; inside a VLAN, switches flood.","Reaching everyone in a REMOTE subnet by one address requires a directed broadcast — and permission that defaults to denied."],
    validate:s=>{ const b=s.bench;
      const pass=b.h2domains==="2"&&b.h2recipients==="all10"&&b.h2crosses==="no"&&b.h2reach==="dir";
      return { pass, ok:"Audit correct: two domains (R1 divides the floor), the limited broadcast floods all of VLAN 10 but never crosses R1, and only a directed broadcast — granted narrowly — could reach all of VLAN 20.",
        fail:"All four parts must be exact. Recount: how many routers? What do switches do with broadcasts? What does RFC 2644 default to?" } } },
  { id:"OBJ-H3", mode:"hard", pillar:"P3", anchor:"CI-6 three-event diagnosis",
    title:"Diagnose all three VLANs in the monitored window — and read the peak broadcast rate.",
    where:"Meter room: run the window, name each VLAN's event, read VLAN 10's tallest brass bar.",
    hints:["One nudge permitted (costs score): match event shapes — wall-to-wall flood vs burst pattern vs gentle rhythm.","VLAN 10: sustained ~1000+ pps broadcast. VLAN 20: multicast bars leap mid-window. VLAN 30: short broadcast bursts, then silence — sweep-like.","Peak broadcast on VLAN 10 is the tallest brass bar; tolerance ±60 pps."],
    validate:s=>{ const b=s.bench; const okv=b.h3v10==="loop"&&b.h3v20==="mcast"&&b.h3v30==="sweep";
      const peak=parseInt(b.h3peak,10); const okp=!!s.noc.runs.hard&&peak>=1260&&peak<=1380;
      return { pass: okv&&okp, ok:"Triple diagnosis accepted: loop-fed storm (VLAN 10), multicast flood from broken snooping (VLAN 20), ARP sweep bursts (VLAN 30 — someone is scanning the guest net). Peak 1320 pps is your incident number.",
        fail:"Run the window first. All three VLAN calls plus the peak must be right — the peak is the tallest brass bar on the VLAN 10 chart." } } },
  { id:"OBJ-H4", mode:"hard", pillar:"P3", anchor:"CI-6 threshold tuning TP/FP/TN",
    title:"Tune the storm alert: page on the storm, stay silent for the WoL batch and the quiet day.",
    where:"Meter room: set threshold + window, press “Test rule”, run days A/B/C to see their counters.",
    hints:["One nudge permitted (costs score): the WoL batch peaks around 330 pps — your threshold must sit ABOVE legitimate noise.","But the storm must clear the threshold too — it runs 1000+ pps, so you have a wide window between 330 and 1000.","Thresholds 100/250 false-page on Monday; window 5 minutes misses a storm that only lasts 4."],
    validate:s=>{ const thr=parseInt(s.bench.h4thr,10), win=parseInt(s.bench.h4win,10);
      const alert=(day)=>{ const arr=NOC_DAYS[day].VLAN10.bcast; let run=0;
        for(const v of arr){ run = v>thr ? run+1 : 0; if(run>=win) return true; } return false; };
      const ok=!isNaN(thr)&&!isNaN(win)&&s.bench.h4Tested&&alert("A")&&!alert("B")&&!alert("C");
      return { pass:ok, ok:"Tuned rule verified against all three days: true positive on the storm, no false page on the legitimate WoL batch, silent on the quiet day. That is detection engineering, not guessing.",
        fail:"Choose a threshold AND window, press “Test rule”, and make sure all three verdicts line up. Hint in the data: WoL peaks ~330 pps for 2 minutes; the storm runs 1000+ for 4." } } },
  { id:"OBJ-H5", mode:"hard", pillar:"P4", anchor:"CI-3.4/3.5 snooping+querier+sparse",
    title:"Redesign multicast: snooping on both switches + querier, prove subscriber-only delivery, pick sparse mode.",
    where:"Dispatch floor switchboard (snooping SW1, SW2, querier) + Control bench H5 routing choice.",
    hints:["One nudge permitted (costs score): snooping without a querier learns nothing — enable both plates on both switches.","Keep WKS-01 and WKS-02 joined to IPTV and dispatch while snooping is ON: receivers must be exactly the members.","For one-to-many IPTV, receivers pull — sparse mode. Dense mode floods first and prunes later."],
    validate:s=>{ const g=s.env.groups["G-IPTV"]||[]; const d=mcastAfter(s,"querier");
      const pass=s.env.snoopingSW1&&s.env.snoopingSW2&&s.env.querier&&s.bench.h5mode==="sparse"&&!!d&&sameSet(d.receivers,g)&&g.length>0;
      return { pass, ok:"Config verified: snooping on both switches, querier live, subscriber-only delivery proven by dispatch, and sparse mode chosen for IPTV. Residual risk to note: snooping misconfigurations fail silently — monitor the flooding ratio.",
        fail:"Checklist: snooping SW1 ✓? snooping SW2 ✓? querier ✓? routing choice = sparse? and a post-config dispatch to IPTV delivering exactly to the joined hosts?" } } },
  { id:"OBJ-H6", mode:"hard", pillar:"P4", anchor:"CI-2.2 narrow WoL exception",
    title:"Wake the studio narrowly: WoL exception ON, general forwarding OFF, dispatch the WoL broadcast, justify.",
    where:"Dispatch floor switchboard (WoL exception ON, directed-broadcast forwarding OFF) + payload selector “WoL magic packet” + bench H6 reason.",
    hints:["One nudge permitted (costs score): the exception must be scoped — payload WoL, destination VLAN 20, general forwarding OFF.","Set payload to “Wake-on-LAN magic packet” in the dispatch form (Night-shift field).","The justification is the historical attack that made routers refuse directed broadcasts."],
    validate:s=>{ const d=findD(s,x=>x.mode==="broadcast"&&x.dest==="dir-vlan20"&&x.payload==="wol"&&x.forwardedVia==="wol");
      const pass=!!d&&s.env.wolException&&!s.env.directedFwd&&s.bench.h6reason==="smurf";
      return { pass, ok:"Narrow exception proven: the WoL packet crossed R1 while general forwarding stayed off. This is exactly how facilities traffic and amplification defense co-exist: default-deny, scoped exception.",
        fail:"Needs: WoL exception ON, directed-broadcast forwarding OFF, a dispatch to 10.20.30.255 with payload “WoL magic packet” (forwarded via the exception), and the smurf justification." } } },
  { id:"OBJ-H7", mode:"hard", pillar:"P1", anchor:"CI-4.1/4.2/4.3 anycast deep",
    title:"Anycast forensics: trace the failover, then tick every TRUE statement (and only those).",
    where:"Dispatch floor (EDGE-SIN offline → dispatch) + bench H7 statements.",
    hints:["One nudge permitted (costs score): take EDGE-SIN offline on the edge-status panel, then dispatch — FRA answers.","True statements describe the mechanism: same unicast IP, metric-nearest, session-break risk, and the canonical deployment.","False statements invent address classes and protocol numbers — anycast has neither."],
    validate:s=>{ const d=findD(s,x=>x.mode==="anycast"&&x.dest==="CDN"&&x.edgeDown&&x.edgeDown["EDGE-SIN"]===true&&x.receivers[0]==="EDGE-FRA");
      const t=s.bench.h7||{}; const set=["s2","s3","s5"].every(k=>t[k])&&!["s1","s4"].some(k=>t[k]);
      return { pass:!!d&&set, ok:"Forensics accepted. The failover is invisible to the sender — same IP, next-nearest twin — but a TCP session would have felt it. Anycast: unicast packets, twins, metrics; nothing more exotic.",
        fail:"Two parts: the failover dispatch (EDGE-SIN down → EDGE-FRA answers) and the statement set — exactly s2, s3 and s5 true." } } },
  { id:"OBJ-H8", mode:"hard", pillar:"P4", anchor:"CI-7 control matrix",
    title:"Fill the 4-scenario control matrix — one best control each, no repeats.",
    where:"Control bench: Work order H8.",
    hints:["One nudge permitted (costs score): match the control to the DOMINANT traffic problem in each scenario.","Flat guest net = broadcast audience; IPTV flood = multicast membership; WoL = directed-broadcast exception; global site = anycast twins.","“Forwarding everywhere” is the answer to no scenario — it is the RFC 2644 anti-pattern."],
    validate:s=>{ const b=s.bench;
      const pass=b.h8s1===H8_ANSWERS.s1&&b.h8s2===H8_ANSWERS.s2&&b.h8s3===H8_ANSWERS.s3&&b.h8s4===H8_ANSWERS.s4;
      return { pass, ok:"Matrix accepted. Four symptoms, four mechanisms — audience size (VLANs), membership (snooping), scoped exception (WoL), geographic resilience (anycast).",
        fail:"All four cells must be exact. Ask of each scenario: is the pain broadcast audience, multicast flooding, a needed directed broadcast, or global reach?" } } },
  { id:"OBJ-H9", mode:"hard", pillar:"P4", anchor:"CI-6/7 response sequencing",
    title:"Order the day-2 runbook, apply it, re-run the window, and confirm every counter normalized.",
    where:"Control bench H9 (order + apply) → Meter room (re-run).",
    hints:["One nudge permitted (costs score): stop the cause before anything else — the loop is still there.","Then stabilize (storm control), then make structural fixes (segmentation, snooping), and only then instrument (alerts).","“Apply runbook” flips the real switchboard — then the meter room must be re-run to prove it."],
    validate:s=>{ const want=RUNBOOK.map(r=>r.id); const got=s.bench.h9order||[];
      const pass=got.length===5&&want.every((id,i)=>got[i]===id)&&s.noc.hardApplied&&s.noc.runs.hard==="clean";
      return { pass, ok:"Runbook accepted and proven: cause stopped → stabilized → structurally fixed → instrumented, with a clean re-run as evidence. That is the shape of a real incident follow-up.",
        fail:"The order must be exact and the proof completed: apply the runbook, then re-run the monitored window and confirm the clean counters." } } },
  { id:"OBJ-H10", mode:"hard", pillar:"P2", anchor:"CI-3.7 IPv6 migration",
    title:"IPv6 migration: dispatch a Neighbor Solicitation, identify the router group and the solicited-node purpose.",
    where:"Dispatch floor (IPv6 → NS) + Control bench H10.",
    hints:["One nudge permitted (costs score): switch the address family to IPv6 on the dispatch form first.","Routers listen on ff02::2 — all nodes is ff02::1, and IPv6 broadcast does not exist.","Solicited-node multicast is how NDP asks “who has this?” without shouting at the whole floor."],
    validate:s=>{ const d=ndD(s); const b=s.bench;
      return { pass:!!d&&b.h10group==="ff02::2"&&b.h10purpose==="ndp",
        ok:"Migration case closed: NDP questions ride solicited-node multicast, routers listen on ff02::2, and ARP's broadcast is gone forever. IPv6 is the reason “broadcast” is an IPv4 story.",
        fail:"Dispatch the Neighbor Solicitation in IPv6 mode and answer both questions exactly: routers = ff02::2; purpose = NDP replacing ARP." } } }
];
const OBJS_OF = mode => OBJ_DEFS.filter(o=>o.mode===mode);
/* short study topics — power the focus-area section of the completion report (R8) */
const OBJ_TOPICS = {
  "OBJ-M1":"unicast delivery on a LAN","OBJ-M2":"limited broadcast and the router boundary",
  "OBJ-M3":"multicast joins with IGMP snooping","OBJ-M4":"anycast nearest-twin and failover",
  "OBJ-M5":"classifying frames by destination addressing","OBJ-M6":"mapping protocols to traffic types",
  "OBJ-M7":"reading counters for storm detection","OBJ-M8":"snooping off vs on (flood vs subscriber-only)",
  "OBJ-M9":"choosing controls that bound a broadcast domain","OBJ-M10":"directed-broadcast forwarding vs RFC 2644 denial",
  "OBJ-M11":"IPv6 multicast replacing ARP broadcast",
  "OBJ-H1":"full 12-frame capture triage","OBJ-H2":"broadcast-domain math and router behavior",
  "OBJ-H3":"multi-VLAN event diagnosis and peak reading","OBJ-H4":"detection thresholds (TP/FP/TN tuning)",
  "OBJ-H5":"snooping + querier + PIM sparse design","OBJ-H6":"scoped Wake-on-LAN exceptions",
  "OBJ-H7":"anycast forensics and true-statement sets","OBJ-H8":"matching controls to traffic problems",
  "OBJ-H9":"sequencing an incident runbook","OBJ-H10":"IPv6 migration (NDP groups and purpose)"
};
