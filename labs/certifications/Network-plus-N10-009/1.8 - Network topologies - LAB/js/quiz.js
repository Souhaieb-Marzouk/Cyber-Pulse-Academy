/* ============================================================================
   The Blueprint Room — js/quiz.js
   Plan Review quiz bank + scoring helpers. Ported 1:1 from quiz.ts:
   R4 — correct-answer position rotates across items (no fixed index);
   R5 — correct answer is never the longest option; all options comparable.
   ============================================================================ */

"use strict";

window.LAB_QUIZ = (function () {

  const MEDIUM_QUIZ = [
    {
      id: "QM1",
      mode: "medium",
      prompt: "Which topology connects every node directly to every other node?",
      type: "single",
      topic: "Mesh",
      options: [
        { value: "star", label: "Star / hub-and-spoke" },
        { value: "collapsed", label: "Collapsed core" },
        { value: "mesh", label: "Full mesh" },
        { value: "p2p", label: "Point-to-point" },
      ],
      correct: ["mesh"],
      why: "A FULL mesh gives every node a direct link to every other node — maximum fault tolerance, n(n−1)/2 links, maximum cost. Partial meshes connect only selected pairs, and a star uses one center instead of direct links.",
    },
    {
      id: "QM2",
      mode: "medium",
      prompt: "In a star topology, the central switch fails. What happens?",
      type: "single",
      topic: "Star / hub-and-spoke",
      options: [
        { value: "some", label: "Only half of the spokes go down" },
        { value: "all", label: "All spokes lose connectivity" },
        { value: "none", label: "Nothing — spokes reroute around it" },
        { value: "slow", label: "The network just gets slower" },
      ],
      correct: ["all"],
      why: "The center of a star is a single point of failure: every spoke's only path runs through it, so ALL spokes drop — not half. No reroute exists because spokes never interconnect, and a dead center is more than a slowdown.",
    },
    {
      id: "QM3",
      mode: "medium",
      prompt: "What is the signature BENEFIT of a spine-and-leaf fabric?",
      type: "single",
      topic: "Spine-and-leaf",
      options: [
        { value: "cable", label: "The least cabling of any topology" },
        { value: "legacy", label: "It is required for legacy hubs" },
        { value: "wan", label: "It optimizes north-south WAN traffic" },
        { value: "latency", label: "Uniform, predictable latency" },
      ],
      correct: ["latency"],
      why: "Any server reaches any other in the same fixed number of fabric stages (leaf → spine → leaf), wherever it's placed — ideal for east-west server-to-server traffic. It is not minimal cabling (every leaf links to every spine), hubs need no fabric, and north-south is the border gateway's job. (Clos-based, simplified.)",
    },
    {
      id: "QM4",
      mode: "medium",
      prompt: "In a three-tier design, which layer do end devices (PCs, printers, APs) attach to?",
      type: "single",
      topic: "Three-tier",
      options: [
        { value: "access", label: "Access layer" },
        { value: "distribution", label: "Distribution layer" },
        { value: "core", label: "Core layer" },
        { value: "any", label: "Any layer, by policy" },
      ],
      correct: ["access"],
      why: "Access = endpoint entry; distribution aggregates access groups and enforces policy; core interconnects distribution blocks and WAN at high speed. Endpoints never land on the upper tiers by design.",
    },
    {
      id: "QM5",
      mode: "medium",
      prompt: "A collapsed core merges which two layers?",
      type: "single",
      topic: "Collapsed core",
      options: [
        { value: "dist-access", label: "Distribution and access" },
        { value: "core-access", label: "Core and access" },
        { value: "core-dist", label: "Core and distribution" },
        { value: "none", label: "It removes a redundant power supply instead" },
      ],
      correct: ["core-dist"],
      why: "Collapsed core = two-tier: the merged core/distribution tier plus the access tier. Access always survives the merge, and the design is about layers, not power supplies. Trade-off: cost/simplicity for less scaling headroom.",
    },
    {
      id: "QM6",
      mode: "medium",
      prompt: "How many links does a full mesh of 5 nodes need?",
      type: "single",
      topic: "Mesh math",
      options: [
        { value: "20", label: "20" },
        { value: "10", label: "10" },
        { value: "8", label: "8" },
        { value: "25", label: "25" },
      ],
      correct: ["10"],
      why: "n(n−1)/2 = 5×4/2 = 10. The double-count trap (20) forgets that A→B and B→A are one link; 8 and 25 aren't 5×4/2 under any common slip.",
    },
    {
      id: "QM7",
      mode: "medium",
      prompt: "A campus has building stars hanging off a mesh between the building switches. The campus as a whole is…",
      type: "single",
      topic: "Hybrid",
      options: [
        { value: "star", label: "A star topology" },
        { value: "mesh", label: "A mesh topology" },
        { value: "ring", label: "A ring topology" },
        { value: "hybrid", label: "A hybrid topology" },
      ],
      correct: ["hybrid"],
      why: "Any combination of two or more topology types is hybrid — and that describes most real networks at scale; it is neither a pure star (stars are only inside buildings) nor a pure mesh (endpoints never interconnect). Exam tip: N10-009 dropped bus/ring from the list; the seven to know are mesh, hybrid, star/hub-and-spoke, spine-and-leaf, point-to-point, three-tier, collapsed core.",
    },
  ];

  const HARD_QUIZ = [
    {
      id: "QH1",
      mode: "hard",
      prompt: "A new data-center pod will run 78% server-to-server (east-west) traffic. Which topology fits best?",
      scenario: "Analytics cluster: 30 VMs replicated across 6 racks, replication traffic dominates.",
      type: "single",
      topic: "Spine-and-leaf",
      options: [
        { value: "tt", label: "Three-tier with distribution aggregation" },
        { value: "sl", label: "Spine-and-leaf" },
        { value: "star", label: "Star off one large switch" },
        { value: "cc", label: "Collapsed core" },
      ],
      correct: ["sl"],
      why: "East-west flows want uniform, minimal fabric stages between ANY two servers — spine-and-leaf's leaf→spine→leaf path delivers it. Three-tier inserts an aggregation hop between racks; a single-switch star concentrates both SPOF and bandwidth risk; collapsed core is a campus cost play, not an east-west one.",
    },
    {
      id: "QH2",
      mode: "hard",
      prompt: "Two sites need a private, guaranteed-bandwidth link with NO intermediary devices. What do you deploy?",
      type: "single",
      topic: "Point-to-point",
      options: [
        { value: "vpn", label: "A VPN tunnel over the public internet" },
        { value: "mesh", label: "A partial mesh to other sites" },
        { value: "star", label: "A star centered on site A" },
        { value: "p2p", label: "A point-to-point dedicated circuit" },
      ],
      correct: ["p2p"],
      why: "Point-to-point = exactly two endpoints, dedicated medium, no intermediaries. A VPN rides shared public infrastructure — not dedicated; a partial mesh or star fans out through other sites. Remember: the link itself is a SPOF, so plan a backup path.",
    },
    {
      id: "QH3",
      mode: "hard",
      prompt: "A 25-user branch office in a single wiring closet, budget-sensitive, one uplink needed. Core LAN design?",
      type: "single",
      topic: "Star / hub-and-spoke",
      options: [
        { value: "star", label: "A star around one access switch" },
        { value: "mesh", label: "A full mesh of small switches" },
        { value: "tt", label: "A full three-tier with redundant cores" },
        { value: "sl", label: "A spine-and-leaf fabric" },
      ],
      correct: ["star"],
      why: "25 users, one closet, one budget: a switch-centered star is the standard, cheapest-to-operate design (its SPOF is accepted or covered by a spare). A mesh wastes links between desks, and three-tier/spine-leaf scale economics only pay off at larger sizes.",
    },
    {
      id: "QH4",
      mode: "hard",
      prompt: "Your company will FULL-mesh 8 sites. How many leased links is that?",
      type: "single",
      topic: "Mesh math",
      options: [
        { value: "56", label: "56" },
        { value: "16", label: "16" },
        { value: "28", label: "28" },
        { value: "64", label: "64" },
      ],
      correct: ["28"],
      why: "n(n−1)/2 = 8×7/2 = 28 — not 8×7 (the double-count trap, 56). At, say, $2,300/link/month that's $64,400/month — the quadratic cost wall that pushes real WANs to partial meshes.",
    },
    {
      id: "QH5",
      mode: "hard",
      prompt: "In a three-tier campus where access switches are single-homed, which SINGLE device class failure isolates the most endpoints?",
      type: "single",
      topic: "Three-tier",
      options: [
        { value: "core", label: "A core switch (redundant pair)" },
        { value: "dist", label: "A distribution switch" },
        { value: "acc", label: "One access switch" },
        { value: "none", label: "No single failure isolates anything" },
      ],
      correct: ["dist"],
      why: "A distribution switch aggregates its whole building's access layer (4+ endpoints), while a redundant core is bypassed by its twin and one access switch carries only its own endpoints. Aggregation layers concentrate SPOF risk when uplinks are single-homed.",
    },
    {
      id: "QH6",
      mode: "hard",
      prompt: "Four warehouses need fault tolerance against any single circuit cut, but the budget only covers 5 links. Best design?",
      type: "single",
      topic: "Partial mesh",
      options: [
        { value: "full", label: "A 6-link full mesh — ask for one more" },
        { value: "star", label: "A 3-link star around WH-1" },
        { value: "p2p", label: "Two point-to-point pairs" },
        { value: "partial", label: "A 5-link partial mesh (a ring)" },
      ],
      correct: ["partial"],
      why: "A ring is a partial mesh where every link lies on a cycle: cut any one circuit and traffic reroutes — with 2 links to spare. Full mesh (6 links) is over budget and buys tolerance you didn't ask for; a star leaves the center as a SPOF; two disjoint p2p pairs leave half the sites stranded on a one-cut link.",
    },
    {
      id: "QH7",
      mode: "hard",
      prompt: "Which statement about a collapsed core is TRUE?",
      type: "single",
      topic: "Collapsed core",
      options: [
        { value: "headroom", label: "It trades scaling headroom for cost and simplicity" },
        { value: "throughput", label: "It increases east-west throughput between server racks" },
        { value: "noaccess", label: "It eliminates access switches" },
        { value: "required", label: "It is required for wireless networks" },
      ],
      correct: ["headroom"],
      why: "Collapsing core+distribution lowers device count and cost but removes a tier of aggregation you'd want back when the site grows. It does nothing for rack-to-rack east-west throughput (that's a spine-and-leaf story), access switches stay, and wireless runs on any tiered design.",
    },
    {
      id: "QH8",
      mode: "hard",
      prompt: "Monitoring shows: every server pair always crosses exactly 2 fabric stages; 4 switches attach all servers; 2 upper-tier switches uplink from every one of those 4. Topology?",
      type: "single",
      topic: "Spine-and-leaf",
      options: [
        { value: "tt", label: "Three-tier" },
        { value: "mesh", label: "A full mesh of all 6 switches" },
        { value: "sl", label: "Spine-and-leaf" },
        { value: "star", label: "A star centered on one switch" },
      ],
      correct: ["sl"],
      why: "The fingerprint is unmistakable: two tiers, servers only on the lower tier, every lower-tier switch uplinked to both upper-tier switches, uniform 2-stage latency — that's spine-and-leaf. Three-tier would show three tiers; full mesh would show switch-to-switch links among ALL six; a star would have a single center.",
    },
  ];

  const QUIZ = MEDIUM_QUIZ.concat(HARD_QUIZ);

  function quizFor(mode) {
    return QUIZ.filter(function (q) { return q.mode === mode; });
  }

  function isCorrect(q, got) {
    return got.length === q.correct.length && got.slice().sort().join(",") === q.correct.slice().sort().join(",");
  }

  return {
    MEDIUM_QUIZ: MEDIUM_QUIZ,
    HARD_QUIZ: HARD_QUIZ,
    QUIZ: QUIZ,
    quizFor: quizFor,
    isCorrect: isCorrect,
  };
})();
