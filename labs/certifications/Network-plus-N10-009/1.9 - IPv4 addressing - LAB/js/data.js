// ── Static lab content — ALL data is synthetic training data ───────────────
// Faithful port of src/lib/lab/data.ts — wording, ordering, truth tables and
// answers are carried over 1:1 from the original lab.

// Fictional org: "Meridian Industrial Co." — every IP/host below is invented
// and marked as TRAINING DATA in the UI. Public-looking addresses use
// RFC 5737 documentation ranges (198.51.100.0/24, 203.0.113.0/24, 192.0.2.0/24).
"use strict";

var TICKETS = [
  {
    id: "T-101",
    host: "WS-RECEP-01",
    role: "Reception PC",
    blurb: "User says webmail feels slow this morning.",
    report: [
      "Ethernet adapter Ethernet0:",
      "   IPv4 Address. . . . : 192.168.10.24",
      "   Subnet Mask . . . . : 255.255.255.0",
      "   Default Gateway . . : 192.168.10.1",
      "   DHCP Enabled. . . . : Yes",
    ],
    faultyHard: false,
    note: "Healthy lease on the correct /24 — the slowness is not an addressing fault.",
  },
  {
    id: "T-102",
    host: "WS-WH-SCN-07",
    role: "Warehouse scanner",
    blurb: "Scanner cannot reach the inventory server at all.",
    report: [
      "Ethernet adapter Ethernet0:",
      "   Autoconfiguration IPv4 Address. . : 169.254.197.88",
      "   Subnet Mask . . . . . . . . . . . : 255.255.0.0",
      "   Default Gateway . . . . . . . . . : (none)",
      "   DHCP Enabled. . . . . . . . . . . : Yes  (no lease received)",
    ],
    faultyHard: true,
    note: "APIPA: the host asked DHCP, got no answer, and self-assigned a link-local address.",
  },
  {
    id: "T-103",
    host: "DSPL-LBY-01",
    role: "Lobby display",
    blurb: "Receives the 239.10.10.5 info-video feed; user wonders if that address is an attack.",
    report: [
      "Ethernet adapter Ethernet0:",
      "   IPv4 Address. . . . : 192.168.10.60",
      "   Subnet Mask . . . . : 255.255.255.0",
      "   Default Gateway . . : 192.168.10.1",
      "   Subscribed group. . : 239.10.10.5 (multicast video)",
    ],
    faultyHard: false,
    note: "239.10.10.5 is Class D multicast (224.0.0.0/4) — normal for a video feed, not a fault.",
  },
  {
    id: "T-104",
    host: "WS-HR-014",
    role: "HR workstation",
    blurb: "Cannot reach the print server 192.168.11.20; everything on 192.168.10.x works.",
    report: [
      "Ethernet adapter Ethernet0:",
      "   IPv4 Address. . . . : 192.168.10.77",
      "   Subnet Mask . . . . : 255.255.0.0",
      "   Default Gateway . . : 192.168.10.1",
      "   DHCP Enabled. . . . : No (static)",
    ],
    faultyHard: true,
    note: "Mask too broad: /16 makes the host treat 192.168.11.x as local and ARP instead of routing.",
  },
  {
    id: "T-105",
    host: "SRV-FILE-01",
    role: "File server",
    blurb: "Event log shows an address-conflict warning; shares drop intermittently.",
    report: [
      "Ethernet adapter Ethernet0:",
      "   IPv4 Address. . . . : 192.168.10.20  (static)",
      "   Subnet Mask . . . . : 255.255.255.0",
      "   Default Gateway . . : 192.168.10.1",
      "System event: The system detected an address conflict",
      "for IP address 192.168.10.20 with another system.",
    ],
    faultyHard: true,
    note: "Duplicate static IP — another device was imaged with the same address (see T-107).",
  },
  {
    id: "T-106",
    host: "WS-DSN-003",
    role: "Designer laptop",
    blurb: "Wi-Fi feels slow when rendering in the studio.",
    report: [
      "Wireless adapter Wi-Fi0:",
      "   IPv4 Address. . . . : 192.168.10.85",
      "   Subnet Mask . . . . : 255.255.255.0",
      "   Default Gateway . . : 192.168.10.1",
      "   Signal . . . . . .  : Excellent",
    ],
    faultyHard: false,
    note: "Healthy addressing — pure decoy ticket.",
  },
  {
    id: "T-107",
    host: "WS-FIN-021",
    role: "Newly imaged finance PC",
    blurb: "Tech hard-coded an address during imaging; network drops in and out.",
    report: [
      "Ethernet adapter Ethernet0:",
      "   IPv4 Address. . . . : 192.168.10.20  (static)",
      "   Subnet Mask . . . . : 255.255.255.0",
      "   Default Gateway . . : 192.168.10.1",
      "System event: The system detected an address conflict",
      "for IP address 192.168.10.20 with another system.",
    ],
    faultyHard: true,
    note: "Second half of the duplicate-IP collision with SRV-FILE-01.",
  },
  {
    id: "T-108",
    host: "WS-DEV-009",
    role: "Developer laptop",
    blurb: "User read that 172.x.x.x is 'private' and wants to know why it shows as public in the scanner.",
    report: [
      "Ethernet adapter Ethernet0:",
      "   IPv4 Address. . . . : 172.32.14.7  (static)",
      "   Subnet Mask . . . . : 255.255.0.0",
      "   Default Gateway . . : 192.168.10.1",
    ],
    faultyHard: true,
    note: "172.32.14.7 is OUTSIDE RFC1918 (172.16.0.0–172.31.255.255) — it is a public-range address on an internal NIC.",
  },
  {
    id: "T-109",
    host: "PRN-WH-01",
    role: "Warehouse printer",
    blurb: "Nobody on the floor can print since the re-cabling.",
    report: [
      "Ethernet adapter Ethernet0:",
      "   IPv4 Address. . . . : 192.168.11.50  (static)",
      "   Subnet Mask . . . . : 255.255.255.0",
      "   Default Gateway . . : 192.168.10.1",
    ],
    faultyHard: true,
    note: "Static address on the wrong subnet — this floor is 192.168.10.0/24.",
  },
  {
    id: "T-110",
    host: "SRV-WEB-EDGE",
    role: "DMZ web host",
    blurb: "New tech flagged 'suspicious public IP 198.51.100.44' — is it an attacker?",
    report: [
      "Ethernet adapter Ethernet0 (DMZ):",
      "   IPv4 Address. . . . : 198.51.100.44",
      "   Subnet Mask . . . . : 255.255.255.240",
      "   Default Gateway . . : 198.51.100.33",
    ],
    faultyHard: false,
    note: "198.51.100.0/24 is an RFC 5737 documentation/public-style range — expected for a DMZ edge host. Red herring.",
  },
];

// ── Machining Floor: press sets ──────────────────────────────────────────────
var M1_ADDRS = ["10.20.30.40", "130.15.9.2", "198.51.100.7", "225.4.4.9", "248.9.1.1", "114.7.7.7"];
var M1_TRUTH = {
  "10.20.30.40": "A",
  "130.15.9.2": "B",
  "198.51.100.7": "C",
  "225.4.4.9": "D",
  "248.9.1.1": "E",
  "114.7.7.7": "A",
};

var M2_ADDRS = [
  "172.16.4.99",
  "172.31.200.1",
  "172.32.7.7",
  "192.168.50.1",
  "192.169.5.5",
  "10.140.9.9",
  "8.8.8.8",
  "172.15.1.1",
];
var M2_TRUTH = {
  "172.16.4.99": true,
  "172.31.200.1": true,
  "172.32.7.7": false,
  "192.168.50.1": true,
  "192.169.5.5": false,
  "10.140.9.9": true,
  "8.8.8.8": false,
  "172.15.1.1": false,
};

var M4_ADDRS = ["127.0.0.1", "203.0.113.44", "172.20.1.5", "169.254.88.2", "239.255.255.250", "192.168.1.50"];
var M4_TYPES = ["private", "public", "loopback", "apipa", "multicast"];
var M4_TRUTH = {
  "127.0.0.1": "loopback",
  "203.0.113.44": "public",
  "172.20.1.5": "private",
  "169.254.88.2": "apipa",
  "239.255.255.250": "multicast",
  "192.168.1.50": "private",
};

var M11_ADDRS = [
  "192.168.10.0",
  "192.168.10.255",
  "240.5.5.5",
  "0.0.0.0",
  "255.255.255.255",
  "224.0.0.5",
  "192.168.10.1",
  "172.16.9.9",
  "198.51.100.25",
];
var M11_TRUTH = {
  "192.168.10.0": true,
  "192.168.10.255": true,
  "240.5.5.5": true,
  "0.0.0.0": true,
  "255.255.255.255": true,
  "224.0.0.5": true,
  "192.168.10.1": false,
  "172.16.9.9": false,
  "198.51.100.25": false,
};

var H5_ADDRS = [
  "172.31.255.9",
  "172.32.1.9",
  "192.169.1.1",
  "169.254.100.5",
  "127.8.8.8",
  "240.1.1.1",
  "224.0.0.251",
  "8.8.8.8",
  "255.255.255.255",
  "198.51.100.9",
];
var H5_CATS = ["rfc1918", "public", "apipa", "loopback", "multicast", "experimental", "limited-broadcast"];
var H5_TRUTH = {
  "172.31.255.9": "rfc1918",
  "172.32.1.9": "public",
  "192.169.1.1": "public",
  "169.254.100.5": "apipa",
  "127.8.8.8": "loopback",
  "240.1.1.1": "experimental",
  "224.0.0.251": "multicast",
  "8.8.8.8": "public",
  "255.255.255.255": "limited-broadcast",
  "198.51.100.9": "public",
};

// ── Solver bench tasks ───────────────────────────────────────────────────────
var M7_TO_MASK = ["/26", "/20", "/29"];
var M7_TO_PREFIX = ["255.0.0.0", "255.255.255.0", "255.255.0.0"];
var M8_IP = "192.168.40.117";
var M8_PREFIX = 26;
var M9_NEEDS = [
  { key: "50", label: "Sales share — 50 hosts" },
  { key: "300", label: "Warehouse VLAN — 300 hosts" },
  { key: "2", label: "Router-to-router link — 2 hosts" },
];
var M9_TRUTH = { "50": "/26", "300": "/23", "2": "/30" };

var H4A_IP = "172.20.100.77";
var H4A_PREFIX = 22;
var H4B_IP = "10.77.203.14";
var H4B_PREFIX = 13;

// ── Loadout: VLSM plans ─────────────────────────────────────────────────────
var M12_BASE = "192.168.50.0";
var M12_BASE_PREFIX = 24;
var M12_DEPTS = [
  { key: "sales", name: "Sales floor", hosts: 100 },
  { key: "eng", name: "Engineering", hosts: 50 },
  { key: "fin", name: "Finance", hosts: 25 },
  { key: "it", name: "IT management", hosts: 10 },
];
var M12_TRUTH = {
  sales: { prefix: "/25", network: "192.168.50.0" },
  eng: { prefix: "/26", network: "192.168.50.128" },
  fin: { prefix: "/27", network: "192.168.50.192" },
  it: { prefix: "/28", network: "192.168.50.224" },
};
var M12_SUM = "192.168.50.0/24";

var H2_BASE = "10.20.0.0";
var H2_BASE_PREFIX = 24;
var H2_DEPTS = [
  { key: "ops", name: "Operations", hosts: 120 },
  { key: "lab", name: "Secure lab", hosts: 60 },
  { key: "guests", name: "Guest Wi-Fi", hosts: 30 },
  { key: "cams", name: "Camera VLAN", hosts: 12 },
  { key: "ups", name: "UPS/PDU mgmt", hosts: 6 },
];
var H2_TRUTH = {
  ops: { prefix: "/25", network: "10.20.0.0" },
  lab: { prefix: "/26", network: "10.20.0.128" },
  guests: { prefix: "/27", network: "10.20.0.192" },
  cams: { prefix: "/28", network: "10.20.0.224" },
  ups: { prefix: "/29", network: "10.20.0.240" },
};

var H3_ROUTES = [
  { dest: "172.16.8.0/24", via: "10.255.0.1", note: "Plant-A VLAN 8" },
  { dest: "172.16.9.0/24", via: "10.255.0.1", note: "Plant-A VLAN 9" },
  { dest: "172.16.10.0/24", via: "10.255.0.1", note: "Plant-A VLAN 10" },
  { dest: "172.16.11.0/24", via: "10.255.0.1", note: "Plant-A VLAN 11" },
  { dest: "0.0.0.0/0", via: "203.0.113.1", note: "Default route → ISP (distractor)" },
];
var H3_SUM = "172.16.8.0/22";

// ── Dock: M3 / M6 option sets ───────────────────────────────────────────────
var M3_CAUSES = [
  { key: "dhcp", label: "No DHCP answer — the host self-assigned a link-local (APIPA) address" },
  { key: "dns", label: "DNS server failure" },
  { key: "mask", label: "Subnet mask set too broad" },
  { key: "cable", label: "Cable unplugged — link is down" },
];
var M3_FIXES = [
  { key: "renew", label: "Restore DHCP service / renew the lease, then verify a real 192.168.x lease" },
  { key: "leave", label: "Leave it — APIPA is fine for daily work" },
  { key: "static169", label: "Assign a static 169.254.x address permanently" },
  { key: "nic", label: "Replace the network card" },
];

var M6_FAULTS = [
  { key: "broad", label: "Subnet mask too broad — the host thinks remote subnets are local" },
  { key: "narrow", label: "Subnet mask too narrow" },
  { key: "gw", label: "Wrong default gateway" },
  { key: "dup", label: "Duplicate IP conflict" },
];

// ── Test bench: M5 interpretation + H6 sequence ─────────────────────────────
var M5_OPTIONS = [
  { key: "ok_beyond", label: "Local TCP/IP stack is healthy — the fault is beyond the host (network / DHCP)" },
  { key: "stack_dead", label: "The host's TCP/IP stack is broken" },
  { key: "dns", label: "DNS is down" },
  { key: "fine", label: "Everything is fine — tell the user to wait" },
];

var H6_STEPS = [
  { id: "s1", label: "Confirm the symptom: ping 127.0.0.1 to verify the local stack" },
  { id: "s2", label: "Read the config: ipconfig shows 169.254.44.10 with no gateway" },
  { id: "s3", label: "Check the path: verify the switchport is up and in the right VLAN" },
  { id: "s4", label: "Restore DHCP service on the server (fix the root cause)" },
  { id: "s5", label: "Renew: ipconfig /release then /renew" },
  { id: "s6", label: "Verify the new lease is a real 192.168.10.x address with a gateway" },
  { id: "s7", label: "Confirm end-to-end: ping the gateway, then a public host" },
  { id: "sT", label: "Assign a static 169.254.10.5 address to silence the warnings" },
];
var H6_ORDER = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];

// ── Dock: rogue DHCP log (Hard) ──────────────────────────────────────────────
var H8_LOG = [
  "12:01:11  DHCP-SRV-01 (192.168.10.5)  OFFER 192.168.10.121 → WS-FIN-021",
  "12:03:42  UNKNOWN   (192.168.99.1)  OFFER 192.168.99.101 → WS-07",
  "12:03:44  UNKNOWN   (192.168.99.1)  ACK   192.168.99.101 → WS-07",
  "12:05:09  UNKNOWN   (192.168.99.1)  OFFER 192.168.99.102 → WS-12",
  "12:05:10  UNKNOWN   (192.168.99.1)  ACK   192.168.99.102 → WS-12",
  "12:07:55  DHCP-SRV-01 (192.168.10.5)  OFFER 192.168.10.122 → WS-22",
  "12:09:31  UNKNOWN   (192.168.99.1)  OFFER 192.168.99.103 → WS-15",
  "12:09:32  UNKNOWN   (192.168.99.1)  ACK   192.168.99.103 → WS-15",
];
var H8_HOSTS = ["WS-07", "WS-12", "WS-15", "WS-22", "WS-FIN-021"];
var H8_HOSTS_TRUTH = ["WS-07", "WS-12", "WS-15"];
var H8_IP = "192.168.99.1";
var H8_ACTIONS = [
  { key: "snooping", label: "Enable DHCP snooping, shut the rogue's access port, keep only authorized 192.168.10.5" },
  { key: "ignore", label: "Ignore it — extra DHCP servers add redundancy" },
  { key: "blocklegit", label: "Block 192.168.10.5 — it answers too slowly" },
];

// ── Plan desk: M10, H7, H9 ──────────────────────────────────────────────────
var M10_DEVICES = [
  { key: "wan", label: "Router WAN interface, facing the ISP" },
  { key: "srv", label: "File server SRV-01 (stable, must always be found)" },
  { key: "ws", label: "40 office workstations (zero admin effort)" },
  { key: "prn", label: "Network printer PRN-01 (must keep one fixed address)" },
  { key: "qa", label: "QA bench PC that only ever tests its own TCP/IP stack" },
];
var M10_TYPES = ["public", "private-static", "private-dhcp", "loopback", "apipa"];
var M10_TRUTH = {
  wan: "public",
  srv: "private-static",
  ws: "private-dhcp",
  prn: "private-static",
  qa: "loopback",
};

var H7_PLANS = [
  { key: "A", label: "WAN 198.51.100.10/29 (public) · LAN 192.168.4.0/24 (private) · NAT/PAT at the edge" },
  { key: "B", label: "WAN 192.168.4.1/24 (private) · LAN 192.168.4.0/24 · no NAT" },
  { key: "C", label: "WAN 169.254.9.9 (APIPA) · LAN 192.168.4.0/24 (private)" },
  { key: "D", label: "WAN 198.51.100.10/29 (public) · LAN 198.51.100.16/29 (public, no NAT)" },
];
var H7_TRUTH = "A";

var H9_PLANS = [
  { key: "A", label: "Split the floor into routed subnets (a /25 plus /26s per area) — smaller broadcast domains" },
  { key: "B", label: "Stretch one mask to /23 for everyone — 510 addresses, still one broadcast domain" },
  { key: "C", label: "Re-IP every device with public addresses" },
  { key: "D", label: "Let exhausted devices fall back to APIPA" },
];
var H9_TRUTH = "A";
var H9_FIGURE = "510";

// ── Glossary ─────────────────────────────────────────────────────────────────
var GLOSSARY = [
  { term: "IPv4 address", def: "32-bit number identifying a device on an IP network, written as four dotted octets." },
  { term: "Octet", def: "One of the four 8-bit groups of an IPv4 address (0–255 each)." },
  { term: "Subnet mask", def: "Bit pattern separating the network portion of an address from the host portion." },
  { term: "CIDR prefix", def: "Slash notation (/n) giving the number of network bits in the mask." },
  { term: "Network address", def: "First address of a subnet; identifies the subnet itself; not assignable to a host." },
  { term: "Broadcast address", def: "Last address of a subnet; reaches all hosts on it; not assignable to a host." },
  { term: "Usable host range", def: "Addresses between network and broadcast (2^h − 2 of them)." },
  { term: "RFC 1918", def: "The RFC reserving three private blocks: 10/8, 172.16/12, 192.168/16." },
  { term: "Public address", def: "Internet-routable address, globally unique, obtained from an ISP/registry." },
  { term: "Private address", def: "An address inside one of the three RFC 1918 blocks (10/8, 172.16/12, 192.168/16) — routed inside a company, never on the public internet." },
  { term: "NAT / PAT", def: "Edge translation of many private addresses onto few public ones (PAT = port-based)." },
  { term: "APIPA", def: "Automatic Private IP Addressing: 169.254.0.0/16 self-assigned when DHCP fails." },
  { term: "Link-local", def: "Valid only on the local segment; never forwarded by routers." },
  { term: "Loopback", def: "127.0.0.0/8 — traffic to yourself; tests the local TCP/IP stack (127.0.0.1 = localhost)." },
  { term: "VLSM", def: "Variable-Length Subnet Masks: different prefix lengths inside one network, sized to need." },
  { term: "Route summarization", def: "Advertising one CIDR block that covers several contiguous subnets." },
];

// ── Knowledge checks (quizzes) ───────────────────────────────────────────────
// R4 discipline: correct-answer positions rotate across items
// (Medium: 2,0,3,1,2,0 · Hard: 2,0,3,1,3,0,2).
// R5 discipline: all options leveled — correct answer never the longest.
var QUIZ_MEDIUM = [
  {
    id: "q1",
    q: "Which block is one of the three RFC 1918 private ranges?",
    options: ["169.254.0.0/16", "224.0.0.0/4", "172.16.0.0/12", "127.0.0.0/8"],
    answer: 2,
    explain: "RFC 1918 reserves 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0–172.31.255.255) and 192.168.0.0/16. 169.254/16 is APIPA link-local, 224/4 is multicast, 127/8 is loopback.",
    topic: "RFC 1918 private blocks",
    wall: "Public vs private (RFC 1918) + NAT",
  },
  {
    id: "q2",
    q: "A workstation shows IPv4 address 169.254.10.5 with mask 255.255.0.0 and no gateway. What does this tell you?",
    options: [
      "DHCP never answered, so the host self-assigned",
      "The DHCP client renewed its lease early",
      "The host reached the internet without a router",
      "The address came from the ISP lease pool",
    ],
    answer: 0,
    explain: "169.254.0.0/16 with no gateway is the signature of APIPA: the host asked DHCP, nobody answered, and it picked a link-local address. Fix the DHCP path, then renew.",
    topic: "APIPA & DHCP failure",
    wall: "APIPA — the self-assigned address",
  },
  {
    id: "q3",
    q: "ping 127.0.0.1 succeeds but nothing else on the network is reachable. What have you proven?",
    options: [
      "The network path is healthy end to end",
      "The default gateway is answering",
      "DNS resolution is working",
      "The host's own TCP/IP stack is healthy",
    ],
    answer: 3,
    explain: "The loopback test only exercises the host's own stack. If it passes but the network fails, look at cabling, switchport, DHCP, and gateway — not the NIC driver.",
    topic: "Loopback triage",
    wall: "Loopback — the stack test",
  },
  {
    id: "q4",
    q: "How many usable host addresses does a /26 subnet provide?",
    options: ["30", "62", "64", "126"],
    answer: 1,
    explain: "A /26 leaves 6 host bits → 2^6 = 64 total addresses, minus the network and broadcast addresses = 62 usable. (64 counts every address including the two reserved ends.)",
    topic: "Usable-host math (2^h − 2)",
    wall: "Subnetting & CIDR — the math that matters",
  },
  {
    id: "q5",
    q: "Class D addresses (224.0.0.0 – 239.255.255.255) are used for…",
    options: ["Loopback testing", "Host assignment", "Multicast groups", "Experimental research"],
    answer: 2,
    explain: "Class D (first octet 224–239) is reserved for multicast — one sender, many subscribers (e.g., 239.10.10.5 video feeds). It is never assigned to a host interface.",
    topic: "Address classes A–E",
    wall: "Address classes A–E (legacy)",
  },
  {
    id: "q6",
    q: "Which of these is a PUBLIC address?",
    options: ["192.169.1.1", "172.31.9.9", "10.200.1.1", "169.254.9.9"],
    answer: 0,
    explain: "192.169.1.1 sits just OUTSIDE 192.168.0.0/16 — the classic off-by-one trap. 172.31.x is inside 172.16/12 (private), 10.x is private, 169.254.x is APIPA.",
    topic: "RFC 1918 boundaries",
    wall: "Public vs private (RFC 1918) + NAT",
  },
];

var QUIZ_HARD = [
  {
    id: "hq1",
    q: "Work order: host configured with 172.32.9.9/16. The tech insists it is private because 'it starts with 172'. Verdict?",
    options: [
      "Private — every 172.x.x.x is RFC 1918 space",
      "APIPA — the address is link-local space",
      "Public — RFC 1918 stops at 172.31.255.255",
      "Reserved — 172.32 is a special-use block",
    ],
    answer: 2,
    explain: "The RFC 1918 block is 172.16.0.0–172.31.255.255 (/12). 172.32.x.x is outside it and is internet-routable public space.",
    topic: "RFC 1918 boundaries",
    wall: "Public vs private (RFC 1918) + NAT",
  },
  {
    id: "hq2",
    q: "You must give a new department room for 78 hosts with the smallest waste. Which prefix?",
    options: ["/25 (126 usable)", "/26 (62 usable)", "/27 (30 usable)", "/24 (254 usable)"],
    answer: 0,
    explain: "/26 offers only 62 usable hosts (2^6−2) — too small. /25 gives 126 usable: the smallest prefix that fits 78.",
    topic: "Smallest fitting prefix",
    wall: "Subnetting & CIDR — the math that matters",
  },
  {
    id: "hq3",
    q: "Host 192.168.44.131/26. What is the broadcast address of its subnet?",
    options: ["192.168.44.159", "192.168.44.255", "192.168.44.143", "192.168.44.191"],
    answer: 3,
    explain: "/26 blocks are 64 wide: 0–63, 64–127, 128–191, 192–255. 131 lives in the 128 block, so broadcast = 192.168.44.191.",
    topic: "Block math: broadcast address",
    wall: "Subnetting & CIDR — the math that matters",
  },
  {
    id: "hq4",
    q: "Your routing table holds 10.20.16.0/24 and 10.20.17.0/24 behind the same router. The tightest summary is…",
    options: ["10.20.0.0/16", "10.20.16.0/23", "10.0.0.0/8", "10.20.17.0/23"],
    answer: 1,
    explain: "The two /24s are contiguous and start on an even boundary → one /23 (10.20.16.0–10.20.17.255). 10.20.0.0/16 and 10.0.0.0/8 also 'work' but over-summarize.",
    topic: "Route summarization",
    wall: "Summarization — advertise less",
  },
  {
    id: "hq5",
    q: "Server: ping 127.0.0.1 OK, ping own address OK, ping 192.168.4.1 (gateway) times out. Next check?",
    options: [
      "Reinstall the network driver and reboot the host",
      "Renew the DHCP lease and re-register the host DNS",
      "Flush the DNS cache and retry the same ping",
      "Check the gateway setting and the gateway's link",
    ],
    answer: 3,
    explain: "Local stack and local address are proven good. With the gateway unreachable, suspect the gateway IP setting, the gateway itself, or the path (VLAN/switchport).",
    topic: "Loopback triage",
    wall: "Loopback — the stack test",
  },
  {
    id: "hq6",
    q: "Several PCs suddenly hold 192.168.99.101–103 leases while your DHCP server is 192.168.10.5. Strongest hypothesis?",
    options: [
      "A rogue DHCP server is answering on the segment",
      "An authorized secondary DHCP server answered first",
      "The clients migrated to a new VLAN by design",
      "The DNS scavenging job failed overnight",
    ],
    answer: 0,
    explain: "Leases from an address outside your known scopes mean a second, unauthorized DHCP server is answering first — contain it (port shutdown + DHCP snooping/authorization). An authorized secondary would lease from YOUR scope, not 192.168.99.x.",
    topic: "Rogue DHCP",
    wall: "Shift Debrief — detection & troubleshooting table",
  },
  {
    id: "hq7",
    q: "A warehouse runs 300 devices on one 192.168.60.0/24 and suffers congestion and exhaustion. Best fix?",
    options: [
      "Stretch the mask to /23 and keep one flat segment",
      "Assign public addresses to every device",
      "Split into several routed subnets sized per area",
      "Let devices self-assign with APIPA",
    ],
    answer: 2,
    explain: "A /23 only adds addresses; the single huge broadcast domain stays. Routing the floor into right-sized subnets (VLSM) fixes both capacity and broadcast load.",
    topic: "Broadcast domains & VLSM",
    wall: "VLSM — right-size every subnet",
  },
];

// ── Official reference links (open in new tab) ──────────────────────────────
var REF_LINKS = [
  { label: "RFC 1918 — Address Allocation for Private Internets", url: "https://datatracker.ietf.org/doc/html/rfc1918" },
  { label: "RFC 3927 — Dynamic Configuration of IPv4 Link-Local Addresses (APIPA)", url: "https://datatracker.ietf.org/doc/html/rfc3927" },
  { label: "IANA IPv4 Special-Purpose Address Registry", url: "https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml" },
  { label: "CompTIA Network+ N10-009 exam objectives (official page)", url: "https://www.comptia.org/certifications/network" },
];
