// ═══════════════════════════════════════════════════════════════════════════
// Gateway Operations Center — Lab 001 · js/data.js
// ALL LAB CONTENT lives here: topology, route seeds, objectives, quiz bank,
// knowledge core, glossary, debrief. Generated from the original TypeScript
// data modules verbatim (same wording, same correct answers, same hints).
// ALL DATA IS FICTIONAL TRAINING DATA — RFC 1918 + RFC 5737 ranges only.
// ═══════════════════════════════════════════════════════════════════════════

(function (root) {
  "use strict";

  // ── IPv4 helpers ─────────────────────────────────────────────────────────
  function ipToNum(ip) {
  const p = ip.split(".").map((x) => parseInt(x, 10));
  if (p.length !== 4 || p.some((n) => isNaN(n) || n < 0 || n > 255))
    return NaN;
  return (p[0] << 24 | p[1] << 16 | p[2] << 8 | p[3]) >>> 0;
}

  function parsePrefix(prefix) {
  const m = prefix.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d{1,2})$/);
  if (!m)
    return null;
  const bits = parseInt(m[2], 10);
  if (bits < 0 || bits > 32)
    return null;
  const net = ipToNum(m[1]);
  if (isNaN(net))
    return null;
  return { net, bits };
}

  // ── Topology nodes (positions in a 1000×620 viewBox) ───────────────────────
  const ATLAS_NODES = [
  {
    "id": "INTERNET",
    "label": "INTERNET",
    "kind": "cloud",
    "x": 500,
    "y": 52
  },
  {
    "id": "ISP1",
    "label": "ISP-1",
    "sub": "AS 100",
    "kind": "isp",
    "x": 320,
    "y": 140
  },
  {
    "id": "ISP2",
    "label": "ISP-2",
    "sub": "AS 200",
    "kind": "isp",
    "x": 680,
    "y": 140
  },
  {
    "id": "R3",
    "label": "R3 · BORDER",
    "sub": "AS 65001 · NAT/PAT",
    "kind": "router",
    "x": 500,
    "y": 240
  },
  {
    "id": "DCNET",
    "label": "DC MGMT",
    "sub": "10.40.0.0/24",
    "kind": "server",
    "x": 762,
    "y": 316
  },
  {
    "id": "R1",
    "label": "R1 · HQ CORE",
    "sub": "GW pair A",
    "kind": "router",
    "x": 418,
    "y": 386
  },
  {
    "id": "R1B",
    "label": "R1B · HQ CORE",
    "sub": "GW pair B",
    "kind": "router",
    "x": 582,
    "y": 386
  },
  {
    "id": "VIP",
    "label": "VIP 10.10.10.1",
    "sub": "FHRP group 10",
    "kind": "router",
    "x": 500,
    "y": 470,
    "vip": true
  },
  {
    "id": "SWHQ",
    "label": "SW-HQ",
    "sub": "trunk · VLAN 10/20",
    "kind": "switch",
    "x": 500,
    "y": 552
  },
  {
    "id": "PCA",
    "label": "PC-A",
    "sub": "VLAN 10 · .10.44",
    "kind": "host",
    "x": 356,
    "y": 596
  },
  {
    "id": "PCB",
    "label": "PC-B",
    "sub": "VLAN 20 · .20.55",
    "kind": "host",
    "x": 644,
    "y": 596
  },
  {
    "id": "R2",
    "label": "R2 · BRANCH",
    "sub": "depot edge",
    "kind": "router",
    "x": 176,
    "y": 330
  },
  {
    "id": "BRPC",
    "label": "DEPOT PC",
    "sub": "10.30.0.77",
    "kind": "host",
    "x": 84,
    "y": 430
  }
];

  const ATLAS_LINKS = [
  {
    "id": "L-ISP1",
    "a": "ISP1",
    "b": "R3",
    "subnet": "203.0.113.8/30",
    "style": "transit"
  },
  {
    "id": "L-ISP2",
    "a": "ISP2",
    "b": "R3",
    "subnet": "203.0.113.12/30",
    "style": "transit"
  },
  {
    "id": "L-NET",
    "a": "INTERNET",
    "b": "ISP1",
    "style": "transit"
  },
  {
    "id": "L-NET2",
    "a": "INTERNET",
    "b": "ISP2",
    "style": "transit"
  },
  {
    "id": "L-DC",
    "a": "R3",
    "b": "DCNET",
    "subnet": "10.40.0.0/24",
    "style": "lan"
  },
  {
    "id": "L-R1R3",
    "a": "R1",
    "b": "R3",
    "subnet": "10.0.13.0/30",
    "style": "wan"
  },
  {
    "id": "L-R2R1",
    "a": "R2",
    "b": "R1",
    "subnet": "10.0.12.0/30",
    "style": "wan"
  },
  {
    "id": "L-R1SW",
    "a": "R1",
    "b": "SWHQ",
    "subnet": "G0/0 · 802.1Q trunk",
    "style": "trunk"
  },
  {
    "id": "L-R1BSW",
    "a": "R1B",
    "b": "SWHQ",
    "subnet": "G0/0 · 802.1Q trunk",
    "style": "trunk"
  },
  {
    "id": "L-PCA",
    "a": "PCA",
    "b": "SWHQ",
    "subnet": "VLAN 10",
    "style": "lan"
  },
  {
    "id": "L-PCB",
    "a": "PCB",
    "b": "SWHQ",
    "subnet": "VLAN 20",
    "style": "lan"
  },
  {
    "id": "L-BRPC",
    "a": "R2",
    "b": "BRPC",
    "subnet": "10.30.0.0/24",
    "style": "lan"
  }
];

  // hop paths for packet animation (list of node ids)
  const HOP_PATHS = {
  "vlan10": [
    "PCA",
    "SWHQ",
    "VIP"
  ],
  "vlan20": [
    "PCB",
    "SWHQ",
    "R1"
  ],
  "branch": [
    "PCA",
    "SWHQ",
    "VIP",
    "R1",
    "R2",
    "BRPC"
  ],
  "dc": [
    "PCA",
    "SWHQ",
    "VIP",
    "R1",
    "R3",
    "DCNET"
  ],
  "internet": [
    "PCA",
    "SWHQ",
    "VIP",
    "R1",
    "R3",
    "ISP1",
    "INTERNET"
  ],
  "internet2": [
    "PCA",
    "SWHQ",
    "VIP",
    "R1",
    "R3",
    "ISP2",
    "INTERNET"
  ],
  "blackhole": [
    "PCA",
    "SWHQ",
    "VIP",
    "R1"
  ],
  "noroute": [
    "PCA",
    "SWHQ",
    "VIP",
    "R1"
  ]
};

  // ── R1 routing table (HQ core) ─────────────────────────────────────────────
  function r1SeedRoutes(mode) {
  const routes = [
    {
      id: "r1-c1",
      protocol: "connected",
      prefix: "10.10.10.0/24",
      net: ipToNum("10.10.10.0"),
      maskBits: 24,
      ad: 0,
      metric: 0,
      nextHop: "directly connected, G0/0.10 (VLAN 10)"
    },
    {
      id: "r1-c2",
      protocol: "connected",
      prefix: "10.10.20.0/24",
      net: ipToNum("10.10.20.0"),
      maskBits: 24,
      ad: 0,
      metric: 0,
      nextHop: "directly connected, G0/0.20 (VLAN 20)",
      note: "appears once G0/0.20 serves VLAN 20"
    },
    {
      id: "r1-c4",
      protocol: "connected",
      prefix: "10.0.12.0/30",
      net: ipToNum("10.0.12.0"),
      maskBits: 30,
      ad: 0,
      metric: 0,
      nextHop: "directly connected, G0/1"
    },
    {
      id: "r1-c3",
      protocol: "connected",
      prefix: "10.0.13.0/30",
      net: ipToNum("10.0.13.0"),
      maskBits: 30,
      ad: 0,
      metric: 0,
      nextHop: "directly connected, G0/2"
    },
    {
      id: "r1-d1",
      protocol: "eigrp",
      prefix: "10.40.0.0/24",
      net: ipToNum("10.40.0.0"),
      maskBits: 24,
      ad: 90,
      metric: 130816,
      nextHop: "via 10.0.13.2 (R3), G0/2",
      note: "DC mgmt LAN learned by EIGRP"
    },
    {
      id: "r1-d2",
      protocol: "eigrp",
      prefix: "0.0.0.0/0",
      net: ipToNum("0.0.0.0"),
      maskBits: 0,
      ad: 90,
      metric: 130816,
      nextHop: "via 10.0.13.2 (R3), G0/2",
      note: "default candidate from border"
    },
    {
      id: "r1-o1",
      protocol: "ospf",
      prefix: "10.30.0.0/24",
      net: ipToNum("10.30.0.0"),
      maskBits: 24,
      ad: 110,
      metric: 2,
      nextHop: "via 10.0.12.2 (R2), G0/1",
      note: "branch depot LAN via OSPF",
      conditionalOspf: !0
    }
  ];
  if (mode === "hard") {
    routes.push({
      id: "r1-s-null",
      protocol: "static",
      prefix: "10.30.0.0/25",
      net: ipToNum("10.30.0.0"),
      maskBits: 25,
      ad: 1,
      metric: 0,
      nextHop: "Null0",
      note: "legacy quarantine summary (decommission planned)",
      removable: !0,
      seed: "hard"
    });
    routes.push({
      id: "r1-s-legacy",
      protocol: "static",
      prefix: "172.16.99.0/24",
      net: ipToNum("172.16.99.0"),
      maskBits: 24,
      ad: 1,
      metric: 0,
      nextHop: "via 10.0.13.2 (R3), G0/2",
      note: "audit net \u2014 decommissioned 2024",
      removable: !0,
      seed: "hard"
    });
  }
  return routes;
}

  // ── R2 routing table (branch) ──────────────────────────────────────────────
  function r2SeedRoutes() {
  return [
    {
      id: "r2-c1",
      protocol: "connected",
      prefix: "10.0.12.0/30",
      net: ipToNum("10.0.12.0"),
      maskBits: 30,
      ad: 0,
      metric: 0,
      nextHop: "directly connected, G0/1"
    },
    {
      id: "r2-c2",
      protocol: "connected",
      prefix: "10.30.0.0/24",
      net: ipToNum("10.30.0.0"),
      maskBits: 24,
      ad: 0,
      metric: 0,
      nextHop: "directly connected, G0/2"
    },
    {
      id: "r2-o1",
      protocol: "ospf",
      prefix: "10.10.10.0/24",
      net: ipToNum("10.10.10.0"),
      maskBits: 24,
      ad: 110,
      metric: 2,
      nextHop: "via 10.0.12.1 (R1), G0/1",
      conditionalOspf: !0
    },
    {
      id: "r2-o2",
      protocol: "ospf",
      prefix: "0.0.0.0/0",
      net: ipToNum("0.0.0.0"),
      maskBits: 0,
      ad: 110,
      metric: 2,
      nextHop: "via 10.0.12.1 (R1), G0/1",
      note: "default learned via OSPF",
      conditionalOspf: !0
    }
  ];
}

  // ── R3 routing table (border, view-only evidence) ─────────────────────────
  const R3_ROUTES = [
  {
    "id": "r3-c1",
    "protocol": "connected",
    "prefix": "10.0.13.0/30",
    "net": 167775488,
    "maskBits": 30,
    "ad": 0,
    "metric": 0,
    "nextHop": "directly connected, G0/2"
  },
  {
    "id": "r3-c2",
    "protocol": "connected",
    "prefix": "10.40.0.0/24",
    "net": 170393600,
    "maskBits": 24,
    "ad": 0,
    "metric": 0,
    "nextHop": "directly connected, G0/4"
  },
  {
    "id": "r3-b1",
    "protocol": "bgp",
    "prefix": "0.0.0.0/0",
    "net": 0,
    "maskBits": 0,
    "ad": 20,
    "metric": 0,
    "nextHop": "via 203.0.113.9 (ISP-1, AS 100)",
    "note": "eBGP default · AS-path 100"
  },
  {
    "id": "r3-b2",
    "protocol": "bgp",
    "prefix": "198.51.100.0/24",
    "net": 3325256704,
    "maskBits": 24,
    "ad": 20,
    "metric": 0,
    "nextHop": "via 203.0.113.9 (ISP-1, AS 100)",
    "note": "AS-path 100 65020"
  },
  {
    "id": "r3-s1",
    "protocol": "static",
    "prefix": "0.0.0.0/0",
    "net": 0,
    "maskBits": 0,
    "ad": 240,
    "metric": 0,
    "nextHop": "via 203.0.113.13 (ISP-2, AS 200)",
    "note": "floating static backup — only used if the BGP default dies"
  }
];

  // ── BGP table (R3) ─────────────────────────────────────────────────────────
  const BGP_TABLE = [
  {
    "network": "0.0.0.0/0",
    "nextHop": "203.0.113.9",
    "metric": "0",
    "weight": "32768",
    "asPath": "100",
    "origin": "i",
    "best": true
  },
  {
    "network": "0.0.0.0/0",
    "nextHop": "203.0.113.13",
    "metric": "0",
    "weight": "32768",
    "asPath": "200 200",
    "origin": "i",
    "best": false
  },
  {
    "network": "198.51.100.0/24",
    "nextHop": "203.0.113.9",
    "metric": "0",
    "weight": "32768",
    "asPath": "100 65020",
    "origin": "i",
    "best": true
  },
  {
    "network": "198.51.100.0/24",
    "nextHop": "203.0.113.13",
    "metric": "0",
    "weight": "32768",
    "asPath": "200 100 65020",
    "origin": "i",
    "best": false
  }
];

  // ── EIGRP topology table (R1, prefix 10.40.0.0/24) ────────────────────────
  const EIGRP_TOPOLOGY = [
  {
    "id": "A",
    "via": "10.0.13.2 (R3), G0/2",
    "bandwidthMbps": 1000,
    "delayUs": 100,
    "composite": 3072,
    "status": "successor"
  },
  {
    "id": "B",
    "via": "10.0.12.2 (R2 → R3 detour), G0/1",
    "bandwidthMbps": 100,
    "delayUs": 1000,
    "composite": 28416,
    "status": "feasible successor"
  }
];

  // ── NAT/PAT translation table (R3) ────────────────────────────────────────
  const NAT_SEED_ROWS = [
  {
    "id": "nat-1",
    "kind": "static",
    "insideLocal": "10.10.20.5:80",
    "insideGlobal": "203.0.113.70:80",
    "outside": "any",
    "proto": "tcp"
  },
  {
    "id": "nat-2",
    "kind": "pat",
    "insideLocal": "10.10.10.44:51099",
    "insideGlobal": "203.0.113.66:40122",
    "outside": "198.51.100.23:443",
    "proto": "tcp"
  },
  {
    "id": "nat-3",
    "kind": "pat",
    "insideLocal": "10.10.10.51:53200",
    "insideGlobal": "203.0.113.66:40123",
    "outside": "198.51.100.23:80",
    "proto": "tcp"
  },
  {
    "id": "nat-4",
    "kind": "pat",
    "insideLocal": "10.30.0.20:50100",
    "insideGlobal": "203.0.113.66:40124",
    "outside": "198.51.100.10:443",
    "proto": "tcp"
  }
];

  // flows for M9 PAT builder — edge assigns next port sequentially from 40125
  const PAT_FLOWS = [
  {
    "id": "f1",
    "insideLocal": "10.10.10.44:51100",
    "outside": "198.51.100.23:443",
    "expectedPort": 40125
  },
  {
    "id": "f2",
    "insideLocal": "10.10.10.45:51500",
    "outside": "198.51.100.23:80",
    "expectedPort": 40126
  },
  {
    "id": "f3",
    "insideLocal": "10.30.0.77:49200",
    "outside": "198.51.100.10:443",
    "expectedPort": 40127
  },
  {
    "id": "f4",
    "insideLocal": "10.10.10.52:53001",
    "outside": "198.51.100.30:993",
    "expectedPort": 40128
  }
];

  // H5 evidence: edge capture of a new flow
  const H5_FLOW = {
  "insideLocal": "10.30.0.87:49152",
  "outside": "203.0.113.10:80",
  "assignedIp": "203.0.113.66",
  "assignedPort": 40129
};

  // ── M12 tribunal candidates (hypothetical — clearly labeled) ───────────────
  const TRIBUNAL_ROUTES = [
  {
    "id": "t1",
    "prefix": "10.40.0.0/16",
    "protocol": "static",
    "ad": 1,
    "metric": 0,
    "via": "via 10.0.13.2"
  },
  {
    "id": "t2",
    "prefix": "10.40.0.0/24",
    "protocol": "eigrp",
    "ad": 90,
    "metric": 130816,
    "via": "via 10.0.13.2"
  },
  {
    "id": "t3",
    "prefix": "10.40.0.32/28",
    "protocol": "ospf",
    "ad": 110,
    "metric": 31,
    "via": "via 10.0.13.2"
  },
  {
    "id": "t4",
    "prefix": "0.0.0.0/0",
    "protocol": "eigrp",
    "ad": 90,
    "metric": 130816,
    "via": "via 10.0.13.2"
  }
];
  const TRIBUNAL_DST = "10.40.0.35";

  // ── AD reference data ──────────────────────────────────────────────────────
  const AD_ITEMS = [
  {
    "id": "connected",
    "label": "Connected interface",
    "ad": 0
  },
  {
    "id": "static",
    "label": "Static route",
    "ad": 1
  },
  {
    "id": "ebgp",
    "label": "eBGP",
    "ad": 20
  },
  {
    "id": "eigrp",
    "label": "EIGRP (internal)",
    "ad": 90
  },
  {
    "id": "ospf",
    "label": "OSPF",
    "ad": 110
  },
  {
    "id": "ibgp",
    "label": "iBGP",
    "ad": 200
  }
];
  const AD_CORRECT_ORDER = [
  "connected",
  "static",
  "ebgp",
  "eigrp",
  "ospf",
  "ibgp"
];

  // ── H8 transit operations (correct order) ──────────────────────────────────
  const H8_OPS = [
  {
    "id": "op1",
    "text": "PC-A sends an ARP request for its gateway — the FHRP VIP 10.10.10.1"
  },
  {
    "id": "op2",
    "text": "The frame enters R1 on subinterface G0/0.10, carrying the 802.1Q tag for VLAN 10"
  },
  {
    "id": "op3",
    "text": "R1's route lookup: only the default matches 198.51.100.23 → forward to next hop R3"
  },
  {
    "id": "op4",
    "text": "R3 applies PAT: 10.10.10.44:51099 is rewritten to 203.0.113.66:40122"
  },
  {
    "id": "op5",
    "text": "R3's lookup picks the eBGP default (AS-path 100) and forwards toward ISP-1"
  },
  {
    "id": "op6",
    "text": "Return traffic matches the PAT table entry and is translated back to 10.10.10.44"
  }
];
  const H8_CORRECT = [
  "op1",
  "op2",
  "op3",
  "op4",
  "op5",
  "op6"
];

  // ── FHRP facts ─────────────────────────────────────────────────────────────
  const FHRP_GROUP = 10;
  const FHRP_VIP = "10.10.10.1";
  const HSRP_VMAC = "0000.0C07.AC0A"; // 0000.0C07.AC + group(10=0A)

  // ── Mastery blueprint: 21 objectives (Medium 12 · Hard 9) ─────────────────
  const OBJECTIVES = [
  {
    "id": "M1",
    "mode": "medium",
    "order": 1,
    "title": "Route table census",
    "statement": "In the Forwarding bench, open R1's route table and classify each highlighted entry by its source protocol.",
    "pillar": "P2",
    "anchor": "Route selection: connected vs static vs dynamic routes (inventory #8)",
    "bench": "forwarding",
    "context": "Every route table entry carries a source letter: C connected, S static, O OSPF, D EIGRP, B BGP. Reading sources first is how troubleshooters spot an unplanned AD decision.",
    "hints": [
      "Look at the letter chip at the start of each route line.",
      "C = directly connected interface, S = typed in by hand, O and D = learned from OSPF / EIGRP, B = learned from BGP.",
      "R1's rows in order: C, C, C, D, D, O — connected, static is absent here, then dynamic. Match each highlighted row to its protocol name."
    ],
    "feedback": "Source letters are your first triage tool: connected routes come free with an up interface, statics are human intent, dynamic routes are protocol consensus. An entry that surprises you is always the first lead.",
    "points": 8
  },
  {
    "id": "M2",
    "mode": "medium",
    "order": 2,
    "title": "Longest prefix match",
    "statement": "Run the packet simulator for 10.10.10.55, 10.30.0.77 and 198.51.100.23, then name the winning route for each.",
    "pillar": "P3",
    "anchor": "Route selection: longest prefix match + default route (inventory #8, #2)",
    "bench": "forwarding",
    "context": "A router asks exactly one question first: which matching route is MOST specific? Only ties in prefix length move on to administrative distance.",
    "hints": [
      "Count the /n on every candidate that matches the destination.",
      "The most specific match wins outright — AD and metric are never compared across different prefix lengths.",
      "10.10.10.55 → the connected /24. 10.30.0.77 → the OSPF /24 (is the adjacency Full?). 198.51.100.23 → only the default 0.0.0.0/0 matches — EIGRP's default via R3."
    ],
    "feedback": "Prefix length is the sovereign rule of routing. Half of all 'weird' forwarding behavior is a more-specific route quietly outmatching the route everyone expected.",
    "points": 8
  },
  {
    "id": "M3",
    "mode": "medium",
    "order": 3,
    "title": "The AD hierarchy",
    "statement": "Rank the route sources by default administrative distance, then decide an AD tiebreak between two defaults on R3.",
    "pillar": "P1",
    "anchor": "Route selection: administrative distance (inventory #8); floating static (inventory #3)",
    "bench": "forwarding",
    "context": "When TWO different protocols offer the SAME prefix, the router trusts the source with the LOWER administrative distance. These defaults are industry-standard (Cisco convention) values.",
    "hints": [
      "Most trusted first: a connected interface beats everything.",
      "Order: Connected 0, Static 1, eBGP 20, EIGRP 90, OSPF 110, iBGP 200.",
      "On R3 the BGP default has AD 20 and the floating static has AD 240 — the eBGP route wins while it exists."
    ],
    "feedback": "AD is the router's trust hierarchy between protocols. Memorize 0 / 1 / 20 / 90 / 110 / 200 and you can predict every multi-source tiebreak — and design floating statics on purpose.",
    "points": 8
  },
  {
    "id": "M4",
    "mode": "medium",
    "order": 4,
    "title": "Static route planning",
    "statement": "On R2 (Static bench): confirm which default currently wins, then install a floating static default via 10.0.12.1 with AD 200 as the backup.",
    "pillar": "P4",
    "anchor": "Static routing + default route + floating static (inventory #1, #2, #3)",
    "bench": "static",
    "context": "R2 learns its default via OSPF (AD 110). A floating static with AD 200 is worse than OSPF — so it sleeps until OSPF's default disappears, then wakes up automatically. Answer about the CURRENT winner by design intent: the OSPF default is expected even while the adjacency is still down (that repair is order 5) — don't be misled by the R2 table missing it yet.",
    "hints": [
      "The prefix for a default route is 0.0.0.0/0.",
      "Use the planner: prefix 0.0.0.0/0, next hop 10.0.12.1, and set the AD field to 200.",
      "Two checks: the floating static exists with AD 200, and you correctly identified the OSPF default (AD 110) as the current winner."
    ],
    "feedback": "You just engineered failover: today OSPF carries the traffic (110 < 200); the instant that route dies, the static floats up as the only remaining default. That's the floating static pattern ISPs and enterprises use on every uplink.",
    "points": 8
  },
  {
    "id": "M5",
    "mode": "medium",
    "order": 5,
    "title": "OSPF: facts & stuck adjacency",
    "statement": "In the Protocols bench (OSPF tab): mark every true statement about OSPF, then repair the R1–R2 adjacency that is stuck below Full.",
    "pillar": "P1",
    "anchor": "Dynamic routing — OSPF: link-state, SPF, cost, areas, adjacency, AD (inventory #7)",
    "bench": "protocols",
    "context": "OSPF neighbors must agree on area, hello/dead timers and MTU before routes flow. The branch route 10.30.0.0/24 is missing on R1 — the adjacency is the reason.",
    "hints": [
      "Link-state means: build the full map from LSAs, run SPF, cost metric, areas with 0 as backbone.",
      "Compare the area column on both ends of the 10.0.12.0/30 link — one side was renumbered.",
      "R2's interface sits in area 1; set it back to area 0 and watch the neighbor go Full."
    ],
    "feedback": "Adjacency first, routes second: OSPF cannot advertise a single route until neighbors reach Full. Area, timers, MTU — when a neighbor is stuck, compare both ends of the link before touching anything else.",
    "points": 9
  },
  {
    "id": "M6",
    "mode": "medium",
    "order": 6,
    "title": "EIGRP: facts & successor choice",
    "statement": "In the Protocols bench (EIGRP tab): mark every true statement about EIGRP, then pick the successor path to 10.40.0.0/24 from the topology table.",
    "pillar": "P1",
    "anchor": "Dynamic routing — EIGRP: hybrid class, DUAL, composite metric, AD 90 (inventory #6)",
    "bench": "protocols",
    "context": "DUAL keeps a loop-free successor and a standby feasible successor. The composite metric (bandwidth + delay by default) decides who leads — lower wins.",
    "hints": [
      "EIGRP is Cisco-originated, advanced distance-vector (hybrid), runs DUAL, uses bandwidth+delay, AD 90.",
      "Compare the composite numbers in the topology table — no need to compute them yourself.",
      "Path A: composite 3072. Path B: 28416. Lower composite = successor."
    ],
    "feedback": "EIGRP's edge is convergence: with a feasible successor already validated by DUAL, failover needs no full recomputation. The successor/feasible-successor pair is what makes it feel faster than its neighbors.",
    "points": 9
  },
  {
    "id": "M7",
    "mode": "medium",
    "order": 7,
    "title": "BGP: sessions & AS-paths",
    "statement": "In the Protocols bench (BGP tab): classify each of R3's three BGP sessions, name the best path to 198.51.100.0/24, and give BGP's TCP port.",
    "pillar": "P1",
    "anchor": "Dynamic routing — BGP: path-vector EGP, eBGP/iBGP, AS-path, TCP 179 (inventory #5)",
    "bench": "protocols",
    "context": "BGP is the protocol between organizations. eBGP connects different AS numbers; iBGP connects routers inside the SAME AS. Best path at exam depth: shortest AS-path.",
    "hints": [
      "Check the AS number on each side of the session: same AS = iBGP, different = eBGP.",
      "Count the AS numbers in each AS-path for 198.51.100.0/24.",
      "R3 (65001) ↔ ISPs = eBGP ×2, R3 ↔ R1 (both 65001) = iBGP. Best path: via 203.0.113.9, AS-path '100 65020' beats '200 100 65020'. Port: 179."
    ],
    "feedback": "You just read a BGP table the way ISPs do: sessions by AS relationship, best path by AS-path length. Every Internet outage post-mortem starts with exactly this table.",
    "points": 9
  },
  {
    "id": "M8",
    "mode": "medium",
    "order": 8,
    "title": "NAT evidence reading",
    "statement": "In the NAT bench: classify each translation row as static NAT or PAT, then map the four NAT address terms for the web-server flow.",
    "pillar": "P2",
    "anchor": "NAT: static/dynamic, terminology (inventory #9)",
    "bench": "nat",
    "context": "Static rows map one address to one address with no port rewrite. PAT rows always show port multiplexing — many inside locals sharing one inside global.",
    "hints": [
      "Look for ports: same port both sides = static NAT; rewritten port = PAT.",
      "Inside local = the private host. Inside global = the public address it appears as.",
      "Row 1 (10.10.20.5:80 ↔ 203.0.113.70:80) is static; rows 2–4 are PAT. For row 1: inside local 10.10.20.5, inside global 203.0.113.70, outside global 198.51.100.23 (the destination), outside local = same (simplified)."
    ],
    "feedback": "The four NAT terms are just coordinates: which side (inside/outside) and which form (local = as the host sees it, global = as the Internet sees it). Read them off any translation table and the flow tells you its own story.",
    "points": 8
  },
  {
    "id": "M9",
    "mode": "medium",
    "order": 9,
    "title": "PAT bench work",
    "statement": "In the NAT bench: build the four overload translations. The edge uses 203.0.113.66 and assigns outside ports sequentially from 40125.",
    "pillar": "P4",
    "anchor": "PAT: overload, port multiplexing, translation table (inventory #10)",
    "bench": "nat",
    "context": "PAT keeps a session table: each inside flow gets the shared public IP plus a unique outside port. That table is what return traffic matches against.",
    "hints": [
      "The public IP is fixed — only the port changes per flow.",
      "Sequential assignment: first flow gets 40125, second 40126…",
      "Ports: 51100→40125, 51500→40126, 49200→40127, 53001→40128."
    ],
    "feedback": "That's the whole trick of the modern Internet: four hosts, one address, four ports. Scale it up and one public IP carries ~65,000 simultaneous sessions — the edge table is the only thing keeping return traffic straight.",
    "points": 8
  },
  {
    "id": "M10",
    "mode": "medium",
    "order": 10,
    "title": "FHRP failover drill",
    "statement": "In the FHRP bench: fail router R1, record who takes over and which address hosts keep using, then map HSRP/VRRP/GLBP to their traits.",
    "pillar": "P4",
    "anchor": "FHRP: HSRP/VRRP/GLBP, priority, preempt; VIP (inventory #11, #12)",
    "bench": "fhrp",
    "context": "Hosts on VLAN 10 point at the VIP 10.10.10.1 — not at either router. Fail one router and the pair's protocol re-elects an active owner of that VIP.",
    "hints": [
      "Use the power switch on R1 and watch the status lamps + the atlas halo.",
      "Election = highest priority; the hosts never change their gateway setting.",
      "After R1 fails: R1B (priority 100) becomes active; hosts keep pointing at VIP 10.10.10.1. HSRP = Cisco active/standby; VRRP = open standard master/backup; GLBP = Cisco, load-balances across gateways."
    ],
    "feedback": "The VIP is the whole trick: gateway identity is decoupled from router identity, and a virtual MAC means no host ARP churn at failover. Priority + preempt give you deterministic control over who leads.",
    "points": 9
  },
  {
    "id": "M11",
    "mode": "medium",
    "order": 11,
    "title": "Build the router-on-a-stick",
    "statement": "In the Trunk bench: create subinterfaces G0/0.10 (VLAN 10, 10.10.10.2/24) and G0/0.20 (VLAN 20, 10.10.20.1/24), then run the inter-VLAN ping.",
    "pillar": "P4",
    "anchor": "Subinterfaces: 802.1Q, router-on-a-stick, inter-VLAN (inventory #13)",
    "bench": "trunk",
    "context": "One physical trunk, one subinterface per VLAN. The dot1q tag ties a subinterface to its VLAN; the subinterface IP becomes that VLAN's gateway. (R1 also hosts the VIP for VLAN 10 — that's a separate FHRP identity on top of the physical .2.)",
    "hints": [
      "Subinterface number, dot1q tag and VLAN must all match: .10 → tag 10.",
      "Each IP must live in its VLAN's subnet: tag 10 → 10.10.10.x, tag 20 → 10.10.20.x.",
      "G0/0.10: tag 10, ip 10.10.10.2/24. G0/0.20: tag 20, ip 10.10.20.1/24. Then VERIFY."
    ],
    "feedback": "Router-on-a-stick is inter-VLAN routing at its barest: one cable, N tagged subinterfaces. The number-dot-name is cosmetic — the TAG is what actually selects the VLAN, and the IP is what hosts call their gateway.",
    "points": 9
  },
  {
    "id": "M12",
    "mode": "medium",
    "order": 12,
    "title": "The route selection tribunal",
    "statement": "In the Forwarding bench, run the Tribunal: for destination 10.40.0.35 pick the winning route from four candidates, then put the three selection rules in order.",
    "pillar": "P3",
    "anchor": "Route selection synthesis: prefix → AD → metric (inventory #8, #14)",
    "bench": "forwarding",
    "context": "Four hypothetical candidates all match 10.40.0.35 — clearly labeled as a sandbox, not the live table. Answer with the tribunal: prefix length first, then AD, then metric.",
    "hints": [
      "Which candidate's mask is the LONGEST that still contains 10.40.0.35?",
      "A /28 matches only 10.40.0.32–10.40.0.47 — and .35 is inside that range.",
      "Winner: 10.40.0.32/28 (OSPF, AD 110) — it beats the /16 static despite the higher AD. Rule order: prefix length → administrative distance → metric."
    ],
    "feedback": "This is the counter-intuitive crown jewel of route selection: a more-specific OSPF route beats a less-specific static even though static 'wins on trust'. Prefix length outranks everything. Internalize this and you can explain 90% of real forwarding mysteries.",
    "points": 9
  },
  {
    "id": "H1",
    "mode": "hard",
    "order": 1,
    "title": "CASE 01 · The half-subnet blackhole",
    "statement": "Depot hosts in the lower half of 10.30.0.0/25 are unreachable from HQ; upper-half hosts respond fine. Diagnose the winning (bad) route, name the rule that lets it win, withdraw it, and prove delivery with a trace to 10.30.0.77.",
    "pillar": "P3",
    "anchor": "Route selection + static routing + default route (inventory #1, #2, #8)",
    "bench": "forwarding",
    "context": "Noise included: a legacy audit static, a shutdown spare uplink and an ACL counter sit in the evidence. Only one route is the culprit.",
    "hints": [
      "Trace 10.30.0.77 on the Forwarding bench and read which route wins and why — the others don't match the failing range."
    ],
    "feedback": "Textbook longest-prefix blackhole: 10.30.0.0/25 → Null0 out-matches the OSPF /24 for the lower half only. When 'some IPs work, some don't', hunt more-specifics before hardware.",
    "points": 12
  },
  {
    "id": "H2",
    "mode": "hard",
    "order": 2,
    "title": "CASE 02 · Adjacency forensics",
    "statement": "The R1–R2 OSPF adjacency is down in two distinct stages. Diagnose the INIT-stage cause and fix it, diagnose the next-stage cause and fix it, and verify the neighbor reaches Full with the branch route present.",
    "pillar": "P3",
    "anchor": "OSPF adjacency requirements: timers, MTU, area (inventory #7)",
    "bench": "protocols",
    "context": "Two config drifts hit the same link. The neighbor table advances after each fix — read the state column at every step.",
    "hints": [
      "INIT → compare hello/dead timers on both ends. EXSTART/EXCHANGE → compare interface MTUs."
    ],
    "feedback": "Stuck neighbors follow a map: INIT = parameter/hello mismatch, EXSTART/EXCHANGE = MTU mismatch. Two drifts on one link is realistic — fix them in the order the neighbor table reveals.",
    "points": 12
  },
  {
    "id": "H3",
    "mode": "hard",
    "order": 3,
    "title": "CASE 03 · The three-way path duel",
    "statement": "In the Forwarding bench (Duel panel): resolve the winner of 172.16.8.0/22 in three successive rounds (as given, after the static is removed, after the EIGRP route turns external), and answer the AD-vs-metric role question.",
    "pillar": "P2",
    "anchor": "Route selection: AD ordering, metric role, EIGRP 90/170 (inventory #3, #6, #8)",
    "bench": "forwarding",
    "context": "Same prefix, three sources across three rounds. Answers are exact — near-misses are rejected with rationale.",
    "hints": [
      "Round 1: static (1). Round 2: EIGRP internal (90) beats OSPF (110). Round 3: EIGRP external is 170 — OSPF 110 now wins."
    ],
    "feedback": "Three rounds, one hierarchy: AD sorts competing protocols; metric only ever ranks paths inside ONE protocol. The 90→170 flip shows why 'EIGRP' on a report card is never enough — internal or external matters.",
    "points": 12
  },
  {
    "id": "H4",
    "mode": "hard",
    "order": 4,
    "title": "CASE 04 · BGP session engineering",
    "statement": "In the Protocols bench (BGP tab): classify all three sessions, pick the best path to 198.51.100.0/24, name the ISP carrying that prefix, and select the attribute that decides it.",
    "pillar": "P2",
    "anchor": "BGP: eBGP/iBGP, AS-path best path (inventory #5)",
    "bench": "protocols",
    "context": "Two providers, one internal peer. Design decision: which egress carries the customer prefix — and on what grounds do you defend it?",
    "hints": [
      "Same AS on both ends = iBGP. Different = eBGP. Then count ASNs per path."
    ],
    "feedback": "'Via ISP-1, AS-path 100 65020 — three ASNs vs four' is a defensible engineering answer. BGP best-path disputes are settled by attributes, not by gut or by AD (both eBGP routes share AD 20).",
    "points": 12
  },
  {
    "id": "H5",
    "mode": "hard",
    "order": 5,
    "title": "CASE 05 · NAT policy design",
    "statement": "In the NAT bench: assign the right NAT type to each of three requirements, then build the exact web-server static entry and the PAT entry from the edge capture log.",
    "pillar": "P4",
    "anchor": "NAT static/dynamic/PAT design + terminology (inventory #9, #10)",
    "bench": "nat",
    "context": "Requirements: web server must be reachable from the Internet; 300 staff need outbound; 12 cameras share a small public pool. The edge capture log shows the port the router actually assigned for the new flow.",
    "hints": [
      "Reachable-from-outside = static 1:1. Many hosts, one IP = PAT. Several public IPs available = dynamic NAT pool."
    ],
    "feedback": "Design rule settled: inbound reachability buys static NAT, scale buys PAT, pools absorb the middle ground. The edge log line is your ground truth for what the router really assigned.",
    "points": 12
  },
  {
    "id": "H6",
    "mode": "hard",
    "order": 6,
    "title": "CASE 06 · FHRP engineering",
    "statement": "In the FHRP bench: make R1B the permanent preferred gateway (priority 150, preempt ON), fail R1 and prove R1B owns the VIP, then answer the design questions — including the virtual MAC.",
    "pillar": "P4",
    "anchor": "FHRP priority/preempt + VIP + protocol selection (inventory #11, #12)",
    "bench": "fhrp",
    "context": "Maintenance window: R1 must be able to reboot without ever taking the gateway back from R1B. Near-misses (priority without preempt) are rejected.",
    "hints": [
      "Set R1B's priority to 150, switch preempt on, fail R1, check the lamps + halo, then restore R1 — R1B must KEEP the lead."
    ],
    "feedback": "Priority alone does nothing while the current active is healthy — preempt is what re-elects. And hosts never notice any of it: same VIP 10.10.10.1, same virtual MAC 0000.0C07.AC0A.",
    "points": 12
  },
  {
    "id": "H7",
    "mode": "hard",
    "order": 7,
    "title": "CASE 07 · The broken stick",
    "statement": "Inter-VLAN pings between PC-A (VLAN 10) and PC-B (VLAN 20) fail. In the Trunk bench: read the faulty config and pings, repair both defects, verify, and identify both root causes.",
    "pillar": "P3",
    "anchor": "Subinterfaces: dot1q tag + gateway IP correctness (inventory #13)",
    "bench": "trunk",
    "context": "Two defects, one trunk. The bench refuses duplicate tags with an error — that refusal is evidence.",
    "hints": [
      "One subinterface listens on the wrong VLAN; one gateway IP lives in the wrong subnet."
    ],
    "feedback": "G0/0.10 tagged into VLAN 20 severed VLAN 10's gateway; G0/0.20's wrong IP left VLAN 20 hosts pointing at a nonexistent gateway. Tag = which VLAN; IP = which gateway. Both must be deliberate.",
    "points": 12
  },
  {
    "id": "H8",
    "mode": "hard",
    "order": 8,
    "title": "CASE 08 · Full transit autopsy",
    "statement": "In the Forwarding bench (Transit panel): order the six operations a packet takes from PC-A (VLAN 10) to an Internet host, using every technology in this lesson exactly once.",
    "pillar": "P3",
    "anchor": "Synthesis: FHRP + subinterface + route selection + PAT + BGP (inventory #14)",
    "bench": "forwarding",
    "context": "The chain crosses the whole estate: gateway VIP → tagged trunk → default route → NAT → eBGP egress → return translation.",
    "hints": [
      "Host-side first (what does PC-A resolve as gateway?), then ingress, then lookups, then translation, then return."
    ],
    "feedback": "Six hops, six technologies, one packet: ARP for the VIP, 802.1Q-tagged ingress, longest-prefix default lookup, PAT rewrite, eBGP egress, PAT reversal. If you can narrate this, you own Lesson 2.1 end to end.",
    "points": 12
  },
  {
    "id": "H9",
    "mode": "hard",
    "order": 9,
    "title": "CASE 09 · Protocol selection matrix",
    "statement": "In the Protocols bench (Selector panel): assign the correct protocol to each of four requirements, then identify the only EGP among them.",
    "pillar": "P1",
    "anchor": "Dynamic routing classes: BGP/EIGRP/OSPF/static selection (inventory #4, #14)",
    "bench": "protocols",
    "context": "Four real requirements, four technologies. Each has exactly one defensible answer at exam depth.",
    "hints": [
      "Between organizations = BGP. Open standard + areas = OSPF. Cisco-only + fastest convergence = EIGRP. One-way-in stub = static."
    ],
    "feedback": "Protocol selection is requirements engineering: policy across organizations, multi-vendor hierarchy, Cisco convergence speed, or deliberate simplicity. Name the requirement and the protocol picks itself.",
    "points": 12
  }
];

  function objectivesForMode(mode) {
    return OBJECTIVES.filter(function (o) { return o.mode === mode; })
      .sort(function (a, b) { return a.order - b.order; });
  }

  // ── Comms Check quiz bank (Medium 7 · Hard 8) ──────────────────────────────
  const QUIZ_MEDIUM = [
  {
    "id": "qm1",
    "scenario": "R1's table holds three routes that match 10.30.0.77: 10.30.0.0/24 via OSPF (AD 110), 10.30.0.0/16 via static (AD 1), and 0.0.0.0/0 via eBGP (AD 20).",
    "q": "Which route forwards the packet?",
    "options": [
      "The /16 static — lowest AD wins outright",
      "The eBGP default — AD 20 beats 110",
      "The /24 OSPF route — longest prefix wins",
      "Load-share between the /16 and the /24"
    ],
    "correct": 2,
    "explanation": "Prefix length is compared FIRST among routes that match, so the /24 wins and AD is never consulted. 'Lowest AD wins' (the static) and 'AD 20 beats 110' (the default) only apply between routes of EQUAL prefix length."
  },
  {
    "id": "qm2",
    "q": "Your company must exchange routes with its Internet service provider. Which protocol fits?",
    "options": [
      "BGP",
      "OSPF",
      "EIGRP",
      "RIP"
    ],
    "correct": 0,
    "explanation": "Routes between organizations need an exterior gateway protocol — BGP, the path-vector EGP. OSPF, EIGRP and RIP are IGPs: interior to one administrative domain."
  },
  {
    "id": "qm3",
    "q": "What makes OSPF a link-state protocol?",
    "options": [
      "It sends full routing tables on a timer",
      "It counts router hops toward the destination",
      "It carries an AS-path with every route",
      "It builds an LSA map and runs SPF"
    ],
    "correct": 3,
    "explanation": "Link-state routers flood LSAs, sync the LSDB, and each computes shortest paths with Dijkstra SPF. Timed full-table dumps and hop counts are distance-vector habits (RIP); AS-paths belong to BGP."
  },
  {
    "id": "qm4",
    "q": "Which statement correctly separates static NAT from PAT?",
    "options": [
      "Static NAT rewrites the ports; PAT does not touch them",
      "Static NAT maps 1:1; PAT shares one IP using ports",
      "PAT can only handle web and mail traffic flows",
      "Static NAT is only useful for outbound traffic flows"
    ],
    "correct": 1,
    "explanation": "Static NAT is a fixed 1:1 pair with ports untouched — built for servers reachable from outside. PAT (overload) multiplexes many hosts onto one IP by assigning each flow a unique port; it is not protocol-limited, and static NAT is precisely FOR inbound."
  },
  {
    "id": "qm5",
    "q": "The real purpose of an FHRP is to…",
    "options": [
      "Balance web traffic across a server farm",
      "Encrypt traffic flowing between the routers",
      "Replace dynamic routing at the network edge",
      "Share one gateway address between two routers"
    ],
    "correct": 3,
    "explanation": "HSRP/VRRP/GLBP let two routers present ONE virtual IP + virtual MAC as the hosts' gateway — no host ever reconfigures. Server load-balancing, encryption and routing are different jobs entirely."
  },
  {
    "id": "qm6",
    "q": "A router-on-a-stick must route between four VLANs over one physical interface. What does it need?",
    "options": [
      "Four subinterfaces, each tagged for its VLAN",
      "Four physical interfaces, one per VLAN",
      "One subinterface carrying all four tags",
      "One DHCP server scoped for each VLAN"
    ],
    "correct": 0,
    "explanation": "Each VLAN gets its own subinterface with `encapsulation dot1q <vlan>` and an IP in that VLAN's subnet — the tag binds it to the VLAN, the IP serves as gateway. One subinterface cannot hold four tags, and DHCP assigns addresses, not gateways' routing."
  },
  {
    "id": "qm7",
    "scenario": "The same /24 appears twice in the table: once via EIGRP, once via OSPF.",
    "q": "Which route wins, and on what number?",
    "options": [
      "OSPF — its cost metric is far lower",
      "Tie — both install and load-share",
      "EIGRP — AD 90 beats OSPF's 110",
      "Neither — the administrator must decide"
    ],
    "correct": 2,
    "explanation": "Same prefix, different protocols → administrative distance decides: EIGRP internal 90 beats OSPF 110. The metric argument is invalid — OSPF cost and EIGRP composite are different currencies, compared only within one protocol."
  }
];
  const QUIZ_HARD = [
  {
    "id": "qh1",
    "scenario": "Users report: 10.30.0.10 unreachable, 10.30.0.200 fine. R1's table: 10.30.0.0/25 → Null0 (static, AD 1); 10.30.0.0/24 via OSPF (AD 110).",
    "q": "Root cause?",
    "options": [
      "The OSPF route is broken — AD 110 loses to 1",
      "Null0 routes always break the entire subnet",
      "The OSPF metric is too high for these hosts",
      "The /25 static blackholes the lower half only"
    ],
    "correct": 3,
    "explanation": "10.30.0.10 falls inside the /25, so the longer prefix wins and Null0 silently drops it; 10.30.0.200 sits outside and the OSPF /24 serves it. AD never comes into it — the /25 wins on prefix length, not trust, and it only covers half the range."
  },
  {
    "id": "qh2",
    "scenario": "After a vendor swap, `show ip ospf neighbor` shows the new router stuck in EXSTART/EXCHANGE forever. Interfaces are up, area 0 matches, timers match.",
    "q": "Most likely cause?",
    "options": [
      "A hello/dead timer mismatch on the link",
      "A missing network statement on the new router",
      "An MTU mismatch between the two interfaces",
      "An area number mismatch between the peers"
    ],
    "correct": 2,
    "explanation": "EXSTART/EXCHANGE is where database-description packets negotiate — an MTU mismatch stalls it there. Timers, area and network statement failures stop the neighborhood earlier, at INIT or DOWN (and the scenario rules them out)."
  },
  {
    "id": "qh3",
    "scenario": "172.16.8.0/22 is known via EIGRP internal (AD 90, metric 28416) and OSPF (AD 110, metric 30).",
    "q": "Who wins, and why is the metric argument invalid?",
    "options": [
      "EIGRP — AD 90 wins; metrics never cross protocols",
      "OSPF — its metric 30 is lower than 28416",
      "Both install and forward in equal precedence",
      "The static route with AD 1 takes over"
    ],
    "correct": 0,
    "explanation": "AD sorts competing protocols BEFORE any metric is read: 90 < 110 installs EIGRP. The metric argument collapses because OSPF cost and EIGRP composite measure different things — and no static route exists in this scenario at all."
  },
  {
    "id": "qh4",
    "scenario": "Requirements: a web server must be reachable from the Internet; 300 staff hosts need outbound only; 12 cameras may share several spare public IPs.",
    "q": "The correct NAT design is…",
    "options": [
      "PAT for the server, static NAT for staff, a pool for cameras",
      "Static NAT for the server, PAT for staff, a pool for cameras",
      "Dynamic NAT with one big pool for all three requirements",
      "Static NAT with a 1:1 entry for all three groups"
    ],
    "correct": 1,
    "explanation": "Inbound reachability needs the fixed 1:1 mapping (static NAT); 300 outbound hosts are PAT's whole job; a handful of cameras with spare public IPs fits a dynamic pool. The first option inverts the two hardest assignments."
  },
  {
    "id": "qh5",
    "scenario": "HSRP group 10: R1 priority 110 with preempt; R1B priority 150 with preempt. Both routers boot simultaneously.",
    "q": "Who becomes active, and why?",
    "options": [
      "R1 — it booted first and holds the role",
      "Tie — the virtual MAC breaks the deadlock",
      "R1 — the higher physical IP wins by default",
      "R1B — priority 150 wins, preempt keeps it"
    ],
    "correct": 3,
    "explanation": "Priority is the election criterion — 150 beats 110 regardless of boot order — and preempt lets the higher-priority router claim and KEEP leadership instead of deferring to whoever was active first. Neither virtual MAC nor physical IP breaks HSRP ties this way."
  },
  {
    "id": "qh6",
    "scenario": "A packet leaves PC-A (VLAN 10) toward 198.51.100.23 on the Internet.",
    "q": "Which transit order is correct?",
    "options": [
      "DNS lookup → PAT rewrite → default route → VIP ARP",
      "PAT rewrite → VIP ARP → subinterface ingress → default route → ISP",
      "VIP ARP → tagged ingress → default lookup → PAT → eBGP egress",
      "ARP for R1's physical MAC → default route → PAT → subinterface ingress"
    ],
    "correct": 2,
    "explanation": "The host first resolves its GATEWAY (the VIP), the frame enters R1 tagged for VLAN 10, the /0 default matches, the border rewrites with PAT, and the eBGP default steers it out. Every other order translates before addressing, ARPs a physical MAC, or NATs before a route exists."
  },
  {
    "id": "qh7",
    "scenario": "R3 and R1 — both inside AS 65001 — exchange BGP routes between themselves.",
    "q": "This session is classified as…",
    "options": [
      "iBGP — same AS on both ends, AD 200",
      "eBGP — the session crosses a dedicated serial link",
      "eBGP session with AS-path prepending done by R3",
      "VRRP — both routers claim the very same VIP"
    ],
    "correct": 0,
    "explanation": "BGP session type follows AS numbers, not media: same AS = iBGP (default AD 200), different AS = eBGP (AD 20). iBGP announcements carry no AS-path growth, and VRRP is a gateway-redundancy protocol, not a BGP session type."
  },
  {
    "id": "qh8",
    "scenario": "R3 has: BGP default via ISP-1 (AD 20) and a floating static default via ISP-2 (AD 240). The ISP-1 session dies.",
    "q": "What happens, and what happens when ISP-1 returns?",
    "options": [
      "Nothing changes — statics always outrank BGP",
      "The static activates now; BGP resumes on return",
      "The static stays in charge even after ISP-1 returns",
      "Traffic blackholes permanently without ISP-1"
    ],
    "correct": 1,
    "explanation": "With the BGP default gone, the AD-240 static is the only default left, so it activates; the moment BGP re-advertises, 20 < 240 hands leadership straight back. Statics do not outrank BGP (240 > 20), and the router re-evaluates continuously — nothing sticks or blackholes."
  }
];

  // ── Knowledge Core — Reference Locker profiles ────────────────────────────
  const PROTOCOL_PROFILES = [
  {
    "id": "static",
    "name": "Static Routing",
    "tag": "MANUAL",
    "accent": "#D7E0D9",
    "klass": "static",
    "what": "Routes a human types in by hand. Nothing is advertised, nothing converges — if the path dies, the route stays until someone fixes it.",
    "how": "`ip route <prefix> <next-hop>` — plus AD override for floating statics. The default route 0.0.0.0/0 catches everything no specific route matches.",
    "why": "Zero protocol overhead, maximum predictability. Perfect for stub networks (one way in/out), tiny sites, and as deliberate backups.",
    "facts": [
      [
        "Administrative distance",
        "1 (connected = 0)"
      ],
      [
        "Convergence",
        "none — manual changes only"
      ],
      [
        "Signature use",
        "stub networks, default route, floating backup"
      ]
    ],
    "realWorld": "A one-router depot office with a single uplink doesn't need a routing protocol — one static default covers it. ISPs also use statics for customer handoffs.",
    "watchOut": "Every route must be maintained by hand. In larger networks statics silently rot — and a stale more-specific static (or a Null0 route) can blackhole traffic while everything around it looks healthy."
  },
  {
    "id": "ospf",
    "name": "OSPF",
    "tag": "LINK-STATE IGP",
    "accent": "#3FBF9F",
    "klass": "ospf",
    "what": "Open Shortest Path First — the open-standard link-state interior gateway protocol. Every router in an area builds the same topology map and computes shortest paths itself.",
    "how": "Routers flood LSAs (link-state advertisements) to build the LSDB, then run Dijkstra's SPF algorithm. Links are grouped into areas — all areas must touch the backbone, area 0. Hellos form adjacencies; neighbors must agree on area, timers and MTU to reach Full state.",
    "why": "Fast, loop-free convergence in multi-vendor networks; hierarchical areas scale cleanly; cost metric scales with bandwidth.",
    "facts": [
      [
        "Class",
        "link-state IGP (open standard)"
      ],
      [
        "Algorithm",
        "Dijkstra SPF on the LSDB"
      ],
      [
        "Metric",
        "cost (bandwidth-based)"
      ],
      [
        "Administrative distance",
        "110"
      ],
      [
        "Hierarchy",
        "areas — backbone is area 0"
      ]
    ],
    "realWorld": "The default choice for multi-vendor enterprise cores: data centers, campuses, and MPLS WANs run OSPF areas 0, 1, 2… with area 0 as the backbone.",
    "watchOut": "Adjacencies are picky: a one-digit area mismatch or hello/dead timer difference keeps neighbors stuck below Full — and routes simply vanish while every interface looks up."
  },
  {
    "id": "eigrp",
    "name": "EIGRP",
    "tag": "ADVANCED DV IGP",
    "accent": "#A78BFA",
    "klass": "eigrp",
    "what": "Enhanced Interior Gateway Routing Protocol — Cisco-originated advanced distance-vector (often called a hybrid), now an informational RFC (7868, 2016) but still mostly seen on Cisco gear.",
    "how": "Uses DUAL (Diffusing Update Algorithm), which keeps a loop-free successor path and a pre-qualified standby (feasible successor). Default composite metric uses bandwidth and delay.",
    "why": "Extremely fast convergence — when a successor dies, the feasible successor takes over without recomputing from scratch.",
    "facts": [
      [
        "Class",
        "advanced distance-vector / hybrid IGP"
      ],
      [
        "Algorithm",
        "DUAL"
      ],
      [
        "Metric",
        "composite — bandwidth + delay by default"
      ],
      [
        "Administrative distance",
        "90 internal · 170 external"
      ],
      [
        "Lineage",
        "Cisco-originated; informational RFC 7868"
      ]
    ],
    "realWorld": "All-Cisco campuses and legacy enterprise WANs favor EIGRP for its near-instant failover via feasible successors.",
    "watchOut": "It's a hybrid, not pure distance-vector, and not link-state. Exams love the 90 vs OSPF's 110 distinction — lower AD wins when both protocols know the same prefix."
  },
  {
    "id": "bgp",
    "name": "BGP",
    "tag": "PATH-VECTOR EGP",
    "accent": "#F2A93B",
    "klass": "bgp",
    "what": "Border Gateway Protocol — the routing protocol *between* organizations. The only EGP in common use; it runs the global Internet.",
    "how": "Autonomous systems (ASes) exchange reachability over TCP port 179. Routes carry an AS-path; best path selection prefers the shortest AS-path (exam level). eBGP runs between different ASes; iBGP runs inside one AS.",
    "why": "Organizations and ISPs need policy control over the millions of Internet routes — BGP's path attributes provide it. IGPs can't scale to that size.",
    "facts": [
      [
        "Class",
        "path-vector EGP"
      ],
      [
        "Transport",
        "TCP port 179"
      ],
      [
        "Best path",
        "path attributes — shortest AS-path at exam depth"
      ],
      [
        "Administrative distance",
        "20 eBGP · 200 iBGP"
      ],
      [
        "Scope",
        "between autonomous systems"
      ]
    ],
    "realWorld": "Every ISP peering on the planet is eBGP. Enterprises multi-homed to two ISPs run BGP to steer traffic and survive a provider outage.",
    "watchOut": "Don't confuse the ADs: eBGP (20) is trusted far more than iBGP (200). And BGP decides by path attributes — not by AD — between two eBGP offers of the same prefix."
  },
  {
    "id": "nat",
    "name": "NAT & PAT",
    "tag": "EDGE TRANSLATION",
    "accent": "#7BC47F",
    "klass": "nat",
    "what": "Network Address Translation rewrites private RFC 1918 addresses to public ones at the network edge. PAT (Port Address Translation, 'NAT overload') multiplexes many hosts onto one public IP using transport-layer ports.",
    "how": "The edge router keeps a translation table. Static NAT maps one inside-local ↔ one inside-global 1:1 (servers). PAT assigns each flow a unique outside port: 10.10.10.44:51099 → 203.0.113.66:40122.",
    "why": "IPv4 is exhausted; RFC 1918 private space plus PAT lets thousands of hosts share a handful of public IPs. Static NAT gives internal servers stable public reachability.",
    "facts": [
      [
        "Terms",
        "inside local (host) · inside global (public) · outside local/global (remote side)"
      ],
      [
        "Static NAT",
        "1:1 — no ports involved"
      ],
      [
        "PAT",
        "many-to-one, port multiplexing"
      ],
      [
        "Private ranges",
        "10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16"
      ]
    ],
    "realWorld": "Your home router is a PAT device: every device in the house shares one ISP address, distinguished by port. Enterprises add static NAT for public-facing servers.",
    "watchOut": "NAT breaks true end-to-end reachability — inbound flows need explicit static entries, and some protocols misbehave when addresses are rewritten mid-stream."
  },
  {
    "id": "fhrp",
    "name": "FHRP · VIP",
    "tag": "GATEWAY REDUNDANCY",
    "accent": "#E8834A",
    "klass": "fhrp",
    "what": "First Hop Redundancy Protocols let two routers share ONE gateway identity — a virtual IP (VIP) and virtual MAC — so hosts never notice a router dying.",
    "how": "Routers negotiate by priority (higher wins; preempt lets a recovered leader take over). HSRP: Cisco, active/standby. VRRP: open standard, master/backup. GLBP: Cisco, one AVG load-balances hosts across multiple active gateways (AVFs). Hosts simply point at the VIP.",
    "why": "The default gateway is a single point of failure. FHRP removes it without touching a single host setting — failover takes seconds and the virtual MAC doesn't change.",
    "facts": [
      [
        "HSRP",
        "Cisco · active/standby · vMAC 0000.0C07.ACxx"
      ],
      [
        "VRRP",
        "open standard · master/backup"
      ],
      [
        "GLBP",
        "Cisco · AVG + AVFs · built-in load balancing"
      ],
      [
        "Election",
        "highest priority; preempt reclaims after recovery"
      ],
      [
        "VIP",
        "the shared virtual IP — hosts' default gateway"
      ]
    ],
    "realWorld": "Every serious campus pairs its distribution routers with HSRP or VRRP. Data centers use VRRP on multi-vendor gear; GLBP where Cisco-only and load-sharing matters.",
    "watchOut": "Without preempt, a recovered higher-priority router stays standby until the active one fails. And the VIP is *not* a router's physical address — it belongs to the pair."
  },
  {
    "id": "subif",
    "name": "Subinterfaces",
    "tag": "ROUTER-ON-A-STICK",
    "accent": "#9FB0A5",
    "klass": "subif",
    "what": "Logical child interfaces carved out of one physical interface — each carries one 802.1Q VLAN tag and acts as the gateway for that VLAN.",
    "how": "The switch port to the router is a trunk. The router splits G0/0 into G0/0.10, G0/0.20… each with `encapsulation dot1q <vlan>` and its own IP. Traffic between VLANs is routed up the trunk and back down — 'router on a stick'.",
    "why": "Inter-VLAN routing without one physical cable per VLAN. Cheap, clean, and the standard exam scenario for VLANs + routing.",
    "facts": [
      [
        "Naming",
        "G0/0.10 = subinterface, not a VLAN by itself"
      ],
      [
        "Tagging",
        "802.1Q tag must match the VLAN it serves"
      ],
      [
        "Gateway",
        "each subinterface IP = that VLAN's default gateway"
      ],
      [
        "Trade-off",
        "all inter-VLAN traffic shares the one physical link"
      ]
    ],
    "realWorld": "Branch offices with one access switch use router-on-a-stick for two or three VLANs; bigger sites graduate to an L3 switch.",
    "watchOut": "A wrong dot1q tag detaches the gateway from its VLAN (frames arrive tagged 20 but the subinterface listens on 10), and a wrong IP leaves hosts pointing at a gateway that doesn't exist."
  }
];

  const GLOSSARY = [
  {
    "term": "Route",
    "def": "A prefix + directions: which next hop to hand packets to, learned by a specific source."
  },
  {
    "term": "Routing table",
    "def": "The router's list of known prefixes with source protocol, AD, metric and next hop."
  },
  {
    "term": "Next hop",
    "def": "The neighbor address where a packet goes next on its way to the destination prefix."
  },
  {
    "term": "Administrative distance (AD)",
    "def": "Trust score of a route source when different protocols offer the same prefix — lower wins (connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, iBGP 200)."
  },
  {
    "term": "Metric",
    "def": "Cost of a path within ONE protocol (hop count, OSPF cost, EIGRP composite) — lower wins."
  },
  {
    "term": "Longest prefix match",
    "def": "The most specific matching route always wins, before AD or metric are even looked at."
  },
  {
    "term": "Default route",
    "def": "0.0.0.0/0 — matches everything; the route of last resort."
  },
  {
    "term": "Floating static",
    "def": "A static route with raised AD so it only activates if the primary route disappears."
  },
  {
    "term": "IGP / EGP",
    "def": "Interior protocols run inside one organization (OSPF, EIGRP); exterior protocols run between organizations (BGP)."
  },
  {
    "term": "Autonomous system (AS)",
    "def": "A network under one administrative control, numbered by an ASN used in BGP."
  },
  {
    "term": "Convergence",
    "def": "The moment all routers agree on a consistent, loop-free view after a topology change."
  },
  {
    "term": "LSA / LSDB",
    "def": "OSPF's advertisements and the shared database they build; SPF computes paths from it."
  },
  {
    "term": "DUAL",
    "def": "EIGRP's algorithm — keeps a loop-free successor plus a standby feasible successor."
  },
  {
    "term": "Inside local / inside global",
    "def": "NAT terms: the host's private address vs its public translated address."
  },
  {
    "term": "PAT (NAT overload)",
    "def": "Many-to-one NAT that distinguishes flows by port so one public IP serves thousands of hosts."
  },
  {
    "term": "FHRP",
    "def": "First Hop Redundancy Protocol — HSRP/VRRP/GLBP share one gateway identity between routers."
  },
  {
    "term": "VIP / virtual MAC",
    "def": "The shared IP+MAC the FHRP pair presents as 'the gateway'; hosts never re-ARP during failover."
  },
  {
    "term": "Subinterface",
    "def": "A logical child of a physical interface carrying one 802.1Q VLAN tag and its own IP."
  },
  {
    "term": "802.1Q",
    "def": "The standard that inserts a 4-byte VLAN tag into Ethernet frames on trunks."
  },
  {
    "term": "Router-on-a-stick",
    "def": "One router interface, one trunk, one subinterface per VLAN — inter-VLAN routing over a single cable."
  }
];

  // ── Debrief content (detection / mitigation / blue & red team / sources) ──
  const DEBRIEF = {
  "detection": [
    {
      "title": "Route table audit",
      "body": "Read source letters first (C/S/D/O/B). Two sources for one prefix = an AD decision you didn't plan. A static you don't recognize is a lead, not noise."
    },
    {
      "title": "Longest-prefix blackhole test",
      "body": "If only part of a subnet is unreachable, hunt for a MORE-specific route: /25s, /28s, host routes, Null0 targets. Prefix length beats every AD."
    },
    {
      "title": "Neighbor-state forensics",
      "body": "OSPF stuck below Full means missing routes, not broken links: area mismatch (INIT), hello/dead mismatch (INIT), MTU mismatch (EXSTART/EXCHANGE). Compare both ends of the link."
    },
    {
      "title": "NAT table reading",
      "body": "Static rows are 1:1 without ports; PAT rows always show port rewrites. If an internal server is unreachable from outside, check that a static NAT row actually exists."
    },
    {
      "title": "FHRP failover verification",
      "body": "After any gateway change: confirm who holds the VIP, confirm preempt behavior, and confirm hosts still resolve the SAME virtual MAC."
    }
  ],
  "mitigation": [
    {
      "title": "Give every path a plan B",
      "body": "Floating statics (raised AD) back up dynamic defaults; FHRP backs up the gateway; two eBGP defaults back up each other. Resilience is route selection applied deliberately."
    },
    {
      "title": "Engineer the failover you want",
      "body": "Priority decides who leads; preempt decides whether leadership returns. Set both intentionally — defaults silently pick a winner for you."
    },
    {
      "title": "Choose NAT deliberately",
      "body": "Static 1:1 only where inbound reachability matters; PAT everywhere else; dynamic NAT pools when several public IPs are available. Document inside-local ↔ inside-global pairs."
    },
    {
      "title": "Keep adjacencies boring",
      "body": "Match area (0 on the backbone), timers and MTU on both ends. Standardize templates so a renumbering can't strand an area."
    },
    {
      "title": "Tag discipline on trunks",
      "body": "Subinterface number, dot1q tag and VLAN must agree, and the subinterface IP must live in that VLAN's subnet. Audit with an inter-VLAN ping after any change."
    }
  ],
  "blueTeam": [
    "Baseline your routing tables: dump them on a good day, diff on a bad one. Unexpected statics and new more-specifics are incident leads.",
    "Trace first, reboot never: run a lookup for the failing destination before touching configs — the tribunal (prefix → AD → metric) explains most 'mysterious' outages.",
    "Half a subnet failing is a prefix-length problem, not a hardware problem."
  ],
  "redTeam": [
    "Every redundant design has a seam: which router holds the VIP right now, and what happens to sessions on failover?",
    "Legacy statics and quarantine Null0 routes are organizational memory — and great places for traffic to quietly die.",
    "A PAT device is a chokepoint: its translation table is both a bottleneck and an audit trail."
  ],
  "nextSteps": [
    "N10-009 Domain 2 continues with Ethernet switching and VLANs — subinterfaces and trunks connect directly to it.",
    "Domain 3 (Network Operations) deepens availability: SLAs, monitoring and high availability pair naturally with FHRP thinking.",
    "Domain 5 (Troubleshooting) formalizes the trace-first methodology this lab practiced on every incident.",
    "Hands-on next step: lab OSPF or EIGRP between two real or virtual routers and watch an adjacency form and break."
  ],
  "sources": [
    {
      "label": "CompTIA Network+ (N10-009) certification page",
      "url": "https://www.comptia.org/certifications/network"
    },
    {
      "label": "RFC 1918 — Address Allocation for Private Internets",
      "url": "https://datatracker.ietf.org/doc/html/rfc1918"
    },
    {
      "label": "RFC 7868 — EIGRP (informational)",
      "url": "https://datatracker.ietf.org/doc/html/rfc7868"
    },
    {
      "label": "RFC 5737 — IPv4 Address Blocks for Documentation",
      "url": "https://datatracker.ietf.org/doc/html/rfc5737"
    }
  ]
};

  // ── Environment seeds per difficulty mode ──────────────────────────────────
  function seedEnv(mode) {
  return {
    ospfStage: mode === "medium" ? "area" : "timers",
    subifs: mode === "medium" ? [{ id: "si-seed-10", name: "G0/0.10", tag: 10, ip: "10.10.10.2/24" }] : [
      { id: "si-bad-10", name: "G0/0.10", tag: 20, ip: "10.10.10.2/24" },
      { id: "si-bad-20", name: "G0/0.20", tag: 20, ip: "10.10.20.254/24" }
    ],
    staticRoutes: [],
    fhrp: mode === "medium" ? {
      protocol: "HSRP",
      r1: { up: !0, priority: 110 },
      r1b: { up: !0, priority: 100 },
      preempt: !0
    } : {
      protocol: "HSRP",
      r1: { up: !0, priority: 100 },
      r1b: { up: !0, priority: 100 },
      preempt: !1
    },
    removedRouteIds: [],
    natBuilt: [],
    packetRuns: [],
    runCounter: 0,
    edgeLog: mode === "medium" ? [
      { id: "l1", t: "06:00", level: "info", text: "SHIFT START \u2014 Atlas Freight GOC, watch rotation K-2" },
      { id: "l2", t: "06:02", level: "warn", text: "R1: OSPF neighbor 10.0.12.2 stuck INIT \u2014 parameter mismatch flagged by watch" },
      { id: "l3", t: "06:05", level: "info", text: "FHRP group 10: R1 active (prio 110, preempt on) \xB7 R1B standby" }
    ] : [
      { id: "l1", t: "06:00", level: "info", text: "SHIFT START \u2014 Atlas Freight GOC, watch rotation K-2" },
      { id: "l2", t: "06:03", level: "warn", text: "R1 line protocol G0/4 (spare uplink) down \u2014 administratively shut, since 2024" },
      { id: "l3", t: "06:07", level: "crit", text: "Helpdesk: depot lower-half hosts (10.30.0.0/25) unreachable from HQ \u2014 upper half OK" },
      { id: "l4", t: "06:11", level: "info", text: "ACL QUARANTINE-OLD: 3 hits in the last 30 days \u2014 scheduled for audit" },
      { id: "l5", t: "06:14", level: "warn", text: "R1: OSPF neighbor 10.0.12.2 INIT \u2014 parameter mismatch" },
      { id: "l6", t: "06:20", level: "info", text: "Legacy static 172.16.99.0/24 (audit net) queued for decom review" }
    ],
    h8order: []
  };
}

  // ── Pillar + protocol presentation metadata ────────────────────────────────
  const PILLAR_META = {
  "P1": {
    "label": "UNDERSTAND",
    "color": "#3FBF9F",
    "hint": "What it is & why attackers/engineers value it"
  },
  "P2": {
    "label": "RECOGNIZE",
    "color": "#A78BFA",
    "hint": "Read it in real device evidence"
  },
  "P3": {
    "label": "TROUBLESHOOT",
    "color": "#F2A93B",
    "hint": "Diagnose & verify from telemetry"
  },
  "P4": {
    "label": "ENGINEER",
    "color": "#E8834A",
    "hint": "Configure, harden & verify resilience"
  }
};
  const PROTO_COLOR = {
  "connected": "#7BC47F",
  "static": "#D7E0D9",
  "ospf": "#3FBF9F",
  "eigrp": "#A78BFA",
  "bgp": "#F2A93B"
};
  const PROTO_LETTER = {
  "connected": "C",
  "static": "S",
  "ospf": "O",
  "eigrp": "D",
  "bgp": "B"
};

  root.GocData = {
    ipToNum, parsePrefix,
    ATLAS_NODES, ATLAS_LINKS, HOP_PATHS,
    r1SeedRoutes, r2SeedRoutes, R3_ROUTES,
    BGP_TABLE, EIGRP_TOPOLOGY,
    NAT_SEED_ROWS, PAT_FLOWS, H5_FLOW,
    TRIBUNAL_ROUTES, TRIBUNAL_DST,
    AD_ITEMS, AD_CORRECT_ORDER, H8_OPS, H8_CORRECT,
    FHRP_GROUP, FHRP_VIP, HSRP_VMAC,
    OBJECTIVES, objectivesForMode,
    QUIZ_MEDIUM, QUIZ_HARD,
    PROTOCOL_PROFILES, GLOSSARY, DEBRIEF,
    seedEnv,
    PILLAR_META, PROTO_COLOR, PROTO_LETTER,
  };
})(typeof window !== "undefined" ? window : globalThis);
