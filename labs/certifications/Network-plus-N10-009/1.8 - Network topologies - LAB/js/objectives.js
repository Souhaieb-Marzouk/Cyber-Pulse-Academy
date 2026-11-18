/* ============================================================================
   The Blueprint Room — js/objectives.js
   Objective definitions + machine-checkable validators, ported 1:1 from
   objectives.ts (12 Medium + 10 Hard). Every check receives a context
   { s, graph, downHosts, metroEdges, annexGraph } — same contract as the
   original makeCheckCtx.
   ============================================================================ */

"use strict";

window.LAB_OBJECTIVES = (function () {

  const E = window.LAB_ENGINE;

  function ans(s, id, key) {
    return ((s.answers[id] || {})[key] || "").trim().toLowerCase();
  }

  const LAYER_OPTS = [
    { value: "core", label: "Core layer" },
    { value: "distribution", label: "Distribution layer" },
    { value: "access", label: "Access layer" },
    { value: "collapsed", label: "Collapsed core (merged)" },
  ];
  const TOPO_STAR_OPTS = [
    { value: "star", label: "Star / hub-and-spoke" },
    { value: "bus", label: "Bus" },
    { value: "ring", label: "Ring" },
    { value: "full-mesh", label: "Full mesh" },
  ];
  const TOPO_DC_OPTS = [
    { value: "spine-and-leaf", label: "Spine-and-leaf" },
    { value: "three-tier", label: "Three-tier" },
    { value: "star", label: "Star / hub-and-spoke" },
    { value: "full-mesh", label: "Full mesh" },
  ];

  function num(v) {
    const n = Number(String(v).replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : null;
  }

  function countField(key, label, placeholder) {
    return { key: key, label: label, type: "number", placeholder: placeholder };
  }

  /* ------------------------------- MEDIUM (12) ------------------------------- */

  const MEDIUM_OBJECTIVES = [
    {
      id: "M1",
      mode: "medium",
      pillar: "P2",
      title: "Identify the Branch Store LAN topology",
      detail: "Open SHT-01 (Branch Store #12). Inspect how the 7 endpoints are wired to SW-B1 — no other links exist between endpoints — then classify the drawing.",
      anchor: "CI-03",
      site: "branch",
      fields: [{ key: "topo", label: "Topology in SHT-01", type: "select", options: TOPO_STAR_OPTS }],
      hints: [
        "Trace the links: from POS-1 to POS-2, how many devices do you cross?",
        "Every endpoint connects to exactly ONE device, and endpoints never connect to each other.",
        "SW-B1 sits in the middle with 7 endpoint links plus 1 uplink — that one-center pattern is the signature you're after.",
      ],
      check: function (ctx) { const s = ctx.s; return ans(s, "M1", "topo") === "star" ? { pass: true } : { pass: false }; },
      success: "Correct — this is a star (hub-and-spoke): every endpoint hangs off SW-B1 and spokes never interconnect. It's the most common LAN topology because adding a node is one cable. Note the switch at the center, not a legacy hub — hubs repeat bits to every port; switches forward intelligently. Next: break the center and watch what dies.",
      fail: "Not quite. Compare your pick with the drawing: endpoints have no links among themselves (rules out mesh), there's no daisy-chain (rules out bus/ring). One central device with spokes = star.",
    },
    {
      id: "M2",
      mode: "medium",
      pillar: "P3",
      title: "Reproduce the Branch single-point-of-failure",
      detail: "Arm the Failure Rig on SHT-01 and fail SW-B1 only (no links). Watch the impact readout, then record how many endpoints lose their path to the HQ/WAN anchor.",
      anchor: "CI-03, CI-08",
      site: "branch",
      fields: [countField("count", "Endpoints cut off from HQ/WAN")],
      hints: [
        "The Failure Rig tab arms your cursor — then click a device on the drawing to fail it.",
        "Fail the device every endpoint depends on, then read the 'endpoints offline' counter.",
        "With SW-B1 dead, count every endpoint that can no longer reach the cloud anchor: all 7.",
      ],
      check: function (c) {
        const okRig = c.s.failedNodes.length === 1 && c.s.failedNodes[0] === "sw-b1" && c.s.failedEdges.length === 0;
        const down = c.downHosts("branch").length;
        const n = num(ans(c.s, "M2", "count"));
        if (!okRig) return { pass: false, msg: "Rig state: fail SW-B1 and clear everything else (Clear failures resets the rig)." };
        if (n === null) return { pass: false, msg: "Enter the number of offline endpoints shown by the rig." };
        return { pass: n === down, msg: "Rig reports " + down + " endpoint(s) offline." };
      },
      success: "All 7 endpoints gone with one failure — you just proved the center of a star is a single point of failure (SPOF). Defenders answer this before attackers ask it: quantify what one device loss costs, then add redundancy where the math hurts (dual switches, dual uplinks).",
      fail: "Re-check: with SW-B1 failed, which endpoints can still reach the HQ/WAN cloud? The rig's offline list is the source of truth.",
    },
    {
      id: "M3",
      mode: "medium",
      pillar: "P1",
      title: "Sort the HQ devices into their three-tier layers",
      detail: "SHT-02 is a three-tier campus. Assign each of the six devices below to its layer — core, distribution, or access — based on its role in the drawing.",
      anchor: "CI-06",
      site: "hq",
      fields: [
        { key: "core-a", label: "CORE-A", type: "select", options: LAYER_OPTS },
        { key: "core-b", label: "CORE-B", type: "select", options: LAYER_OPTS },
        { key: "dist-2", label: "DIST-2", type: "select", options: LAYER_OPTS },
        { key: "dist-3", label: "DIST-3", type: "select", options: LAYER_OPTS },
        { key: "acc-1a", label: "ACC-1A", type: "select", options: LAYER_OPTS },
        { key: "acc-2b", label: "ACC-2B", type: "select", options: LAYER_OPTS },
      ],
      hints: [
        "Follow the wires upward: PCs attach to access switches; access switches attach to distribution; distribution attaches to core.",
        "Core devices touch the WAN cloud; access devices touch PCs; distribution sits between — aggregating buildings and policy.",
        "CORE-A/B → core; DIST-2/3 → distribution; ACC-1A/2B → access.",
      ],
      check: function (ctx) {
        const s = ctx.s;
        const want = { "core-a": "core", "core-b": "core", "dist-2": "distribution", "dist-3": "distribution", "acc-1a": "access", "acc-2b": "access" };
        for (const k in want) if (ans(s, "M3", k) !== want[k]) return { pass: false, msg: "Check the layer for " + k.toUpperCase() + "." };
        return { pass: true };
      },
      success: "Layered correctly. Three-tier hierarchy: ACCESS connects endpoints; DISTRIBUTION aggregates access groups and enforces policy; CORE moves traffic fast between distribution blocks and out to the WAN. Traffic flowing up/down this stack (PC → server elsewhere) is north-south. Keep the layer pictures in your head — the next objective breaks one.",
      fail: "One or more layers are off. Follow the links in SHT-02: the device touching PCs is access; the device touching the WAN cloud is core; the middle tier that aggregates one building is distribution.",
    },
    {
      id: "M4",
      mode: "medium",
      pillar: "P3",
      title: "Find HQ's most damaging single-device failure",
      detail: "In the Failure Rig on SHT-02, fail CORE-A first and read the impact. Then fail DIST-2 (clear between tests). Which single-device failure cuts off the MOST endpoints, and how many?",
      anchor: "CI-06, CI-08",
      site: "hq",
      fields: [
        {
          key: "device",
          label: "Worst single device to lose",
          type: "select",
          options: [
            { value: "dist-1", label: "DIST-1" },
            { value: "dist-2", label: "DIST-2" },
            { value: "dist-3", label: "DIST-3" },
            { value: "core-a", label: "CORE-A" },
            { value: "acc-2a", label: "ACC-2A" },
          ],
        },
        countField("count", "Endpoints cut off by that failure"),
      ],
      hints: [
        "Fail each candidate one at a time and compare the offline counts — the rig computes impact for you.",
        "CORE-A has a twin (CORE-B) carrying on. DIST-2 does not — ACC-2A and ACC-2B have no second path.",
        "Each distribution switch aggregates 2 access switches × 2 PCs: 4 endpoints drop when a DIST dies.",
      ],
      check: function (c) {
        if (c.s.failureTried.indexOf("core-a") === -1) return { pass: false, msg: "Test CORE-A in the rig first — the comparison is the whole lesson." };
        const d = ans(c.s, "M4", "device");
        const n = num(ans(c.s, "M4", "count"));
        if (!d) return { pass: false, msg: "Pick the worst device." };
        if (d.indexOf("dist") !== 0) return { pass: false, msg: "Rig check: failing " + d.toUpperCase() + " actually cuts " + (c.downHosts("hq").length === 0 && d.indexOf("core") === 0 ? 0 : "…") + " — try it and compare with DIST-2." };
        if (n === null) return { pass: false, msg: "Enter the offline count for that device." };
        return { pass: n === 4, msg: "DIST-2 failure = 4 offline endpoints (ACC-2A + ACC-2B islands)." };
      },
      success: "A distribution switch is HQ's worst single loss: 4 endpoints isolated at once. Counter-intuitive but explainable — the core is redundant (CORE-B simply takes over, 0 endpoints lost), while access uplinks are single-homed, so whatever DIST-2 aggregated goes dark. Diagnosis lesson: aggregation layers concentrate risk. Mitigation next: dual-home the access uplinks (R-01).",
      fail: "Run the tests: CORE-A dies → 0 endpoints (its twin carries on). DIST-2 dies → its two access switches' PCs (4) lose the only path up. The worst single loss is any distribution switch with 4 endpoints.",
    },
    {
      id: "M5",
      mode: "medium",
      pillar: "P4",
      title: "Design the Annex as a collapsed core",
      detail: "SHT-07 (Annex, 45 users) can't justify full three-tier hardware. Which two layers merge in a collapsed-core design, and how many layers remain?",
      anchor: "CI-07",
      site: "annex",
      fields: [
        {
          key: "merge",
          label: "Layers that merge",
          type: "select",
          options: [
            { value: "core-distribution", label: "Core + Distribution" },
            { value: "core-access", label: "Core + Access" },
            { value: "distribution-access", label: "Distribution + Access" },
          ],
        },
        countField("remaining", "Layers remaining after the merge"),
      ],
      hints: [
        "Collapsed core removes one tier by merging the two upper layers.",
        "Access always stays — endpoints need their entry layer.",
        "Core + Distribution merge into one collapsed-core tier: 3 − 1 = 2 layers remain.",
      ],
      check: function (ctx) {
        const s = ctx.s;
        const m = ans(s, "M5", "merge");
        const n = num(ans(s, "M5", "remaining"));
        if (m && m !== "core-distribution") return { pass: false, msg: "The merge is between the two UPPER layers — access always stays close to the endpoints." };
        if (n !== null && n !== 2) return { pass: false, msg: "Count again: three tiers minus one merged tier = ?" };
        return { pass: m === "core-distribution" && n === 2, msg: "" };
      },
      success: "Collapsed core = core + distribution merged into one tier, leaving a two-tier network (collapsed core + access). ANNEX-CORE-1 in SHT-07 is exactly that device. You save switches, space and ops overhead — the trade-off is less scaling headroom than full three-tier. Perfect for the annex today; revisit if it grows into a campus.",
      fail: "Not the right pair. In a collapsed core the ACCESS layer is untouched; the merge happens above it — the backbone tier and the aggregation tier become one device tier.",
    },
    {
      id: "M6",
      mode: "medium",
      pillar: "P2",
      title: "Identify the DC fabric and count its tiers",
      detail: "Open SHT-03 (Data Center pod). Name the topology, then count the spine switches and the leaf switches on the drawing.",
      anchor: "CI-04",
      site: "dc",
      fields: [
        { key: "topo", label: "Topology in SHT-03", type: "select", options: TOPO_DC_OPTS },
        countField("spines", "Spine switches"),
        countField("leaves", "Leaf switches"),
      ],
      hints: [
        "Notice which switches servers attach to, and which switch class the servers never touch.",
        "The upper tier (SP-x) links to every lower-tier switch; the lower tier (LF-x) links to the servers.",
        "2 devices on the top row = spines; 4 switches attaching the 8 VMs = leaves.",
      ],
      check: function (ctx) {
        const s = ctx.s;
        const t = ans(s, "M6", "topo");
        const sp = num(ans(s, "M6", "spines"));
        const lf = num(ans(s, "M6", "leaves"));
        if (t && t !== "spine-and-leaf") return { pass: false, msg: "Three-tier has THREE switch tiers — here servers reach the border through exactly two switch tiers, and the upper tier never touches servers." };
        return { pass: t === "spine-and-leaf" && sp === 2 && lf === 4, msg: "" };
      },
      success: "Spine-and-leaf with 2 spines × 4 leaves. Signature: servers attach ONLY to leaves; every leaf connects to EVERY spine; spines carry no servers. This is a (simplified) Clos fabric — the modern data-center pattern. Next, prove why it's built this way.",
      fail: "Re-inspect SHT-03: count the switches on the upper row and the switches that attach servers. If you picked three-tier, look for a middle aggregation tier — there isn't one between leaf and border.",
    },
    {
      id: "M7",
      mode: "medium",
      pillar: "P3",
      title: "Test spine resilience in the Failure Rig",
      detail: "On SHT-03, fail SP-1 only. Count how many leaf switches lose ALL connectivity to the rest of the fabric.",
      anchor: "CI-04, CI-08",
      site: "dc",
      fields: [countField("leaves", "Leaves fully isolated")],
      hints: [
        "After failing SP-1, pick any leaf and look at its remaining links.",
        "Every leaf has a second uplink — to SP-2.",
        "Isolated leaves: zero. The fabric absorbed the failure.",
      ],
      check: function (c) {
        const okRig = c.s.failedNodes.length === 1 && c.s.failedNodes[0] === "sp-1" && c.s.failedEdges.length === 0;
        const n = num(ans(c.s, "M7", "leaves"));
        if (!okRig) return { pass: false, msg: "Rig state: fail SP-1 and nothing else (Clear failures resets the rig)." };
        if (n === null) return { pass: false, msg: "Enter the number of fully isolated leaves." };
        return { pass: n === 0, msg: "Fabric check: " + c.downHosts("dc").length + " endpoints offline with SP-1 dead." };
      },
      success: "Zero isolated leaves — every leaf survived via its SP-2 uplink. That's the design intent of spine-and-leaf: no leaf ever depends on a single spine, so any one spine can fail (or be taken down for maintenance) with no server isolation. Compare this with the single-homed HQ access layer from M4.",
      fail: "Look again at each leaf's links after failing SP-1: how many still reach SP-2? Count leaves with NO working uplink at all.",
    },
    {
      id: "M8",
      mode: "medium",
      pillar: "P2",
      title: "Compare DC paths — find the fabric's promise",
      detail: "In the Path Tester on SHT-03, trace at least THREE different server pairs on different leaves. Then answer: what do all three paths have in common?",
      anchor: "CI-04",
      site: "dc",
      fields: [
        {
          key: "pattern",
          label: "What every path shares",
          type: "select",
          options: [
            { value: "same-hops", label: "The same number of hops, every time" },
            { value: "same-path", label: "The exact same physical path" },
            { value: "varies", label: "Hop counts vary by pair" },
          ],
        },
      ],
      hints: [
        "The Path Tester prints the full hop list and hop count for each run — compare the numbers.",
        "Pick pairs like VM-A1→VM-C2, VM-B1→VM-D2, VM-A2→VM-C1.",
        "Every cross-leaf path is leaf → spine → leaf: the same length regardless of which two servers you pick.",
      ],
      check: function (c) {
        const runs = c.s.pathRuns.filter(function (r) { return r.site === "dc"; });
        const pairs = new Set(runs.map(function (r) { return r.pair; }));
        const hops = new Set(runs.map(function (r) { return r.hops; }));
        if (pairs.size < 3) return { pass: false, msg: "Run the Path Tester for " + (3 - pairs.size) + " more distinct pair(s) — any server pair on different leaves counts." };
        if (hops.size !== 1) return { pass: false, msg: "Odd — your recorded runs show different hop counts. Make sure all three pairs are servers on DIFFERENT leaves." };
        return { pass: ans(c.s, "M8", "pattern") === "same-hops", msg: "All runs: same hop count." };
      },
      success: "Identical hop counts on every path — the spine-and-leaf promise. Any server reaches any other in a fixed number of fabric stages, so latency is predictable no matter where a VM lands (great for east-west server-to-server traffic). A same-path answer would mean traffic always takes one route; in reality the fabric can pick either spine — the length is what stays constant.",
      fail: "Either the runs aren't recorded (use the Path Tester, not mental math) or the answer needs another look: same physical path would be surprising — check whether SP-1 vs SP-2 changes between runs while the hop COUNT stays fixed.",
    },
    {
      id: "M9",
      mode: "medium",
      pillar: "P1",
      title: "Full-mesh math for the metro ring",
      detail: "Trellis considers upgrading the metro network so every one of the 6 warehouses connects directly to every other. How many links would a FULL mesh need?",
      anchor: "CI-01",
      site: "metro",
      fields: [countField("links", "Links in a full mesh of 6 sites")],
      hints: [
        "Each of the 6 sites would need 5 direct links — but that counts every link twice.",
        "Formula: n × (n − 1) ÷ 2.",
        "6 × 5 ÷ 2 = 15.",
      ],
      check: function (ctx) {
        const n = num(ans(ctx.s, "M9", "links"));
        if (n === 30) return { pass: false, msg: "30 = 6 × 5 — that double-counts every link (A→B and B→A are the same circuit). Divide by 2." };
        return { pass: n === E.fullMeshLinks(6), msg: "" };
      },
      success: "15 links — n(n−1)/2. Full mesh maximizes fault tolerance (a dozen ways around any failure) but the link count explodes quadratically: 10 sites would need 45 circuits. That's why real WANs are usually PARTIAL meshes: keep the redundancy you need on the links that matter. That's your design job in the build board next.",
      fail: "Wrong count. Anchor on the formula: each site needs a direct link to the other 5 (that's 6 × 5), then divide by 2 so each link counts once.",
    },
    {
      id: "M10",
      mode: "medium",
      pillar: "P4",
      title: "Budget the partial mesh on the Build Board",
      detail: "WH-6 is stranded. On the metro Build Board, add links (click a site, then click another) until EVERY site has at least 2 links and all 6 are connected — using at most 9 total links.",
      anchor: "CI-01",
      site: "build-metro",
      fields: [],
      hints: [
        "Open the Build tool: select site A, then site B, then 'Add link'. The counter tracks your budget.",
        "Connect WH-6 with two links (it needs degree ≥ 2), e.g., WH-6–WH-1 and WH-6–WH-5.",
        "The existing 5-link ring already gives WH-1..5 two links each — so 2 new links fit the ≤9 budget easily.",
      ],
      check: function (c) {
        const g = c.graph("metro");
        if (g.edges.length > 9) return { pass: false, msg: "Budget: " + g.edges.length + " links > 9. Remove links (select the link, press Remove) until you fit 9." };
        if (!E.isConnected(g.nodes, g.edges)) return { pass: false, msg: "WH-6 is still cut off — every site must be reachable from every other." };
        const md = E.minDegree(g.nodes, g.edges);
        if (md < 2) return { pass: false, msg: "A site has only " + md + " link(s) — every site needs at least 2, or that site is one failure away from isolation." };
        return { pass: true, msg: g.edges.length + "/9 links, all sites connected, min degree " + md + "." };
      },
      success: "Design verified: connected, every site ≥ 2 links, within budget — a textbook partial mesh. You kept ring redundancy and pulled WH-6 in with just two circuits. Notice the trade you made against the 15-link full mesh: far cheaper, slightly less tolerance. Hard mode will raise the bar: survive ANY single link cut.",
      fail: "The board isn't there yet: check the three rules — all 6 sites connected, no site below 2 links, at most 9 links total.",
    },
    {
      id: "M11",
      mode: "medium",
      pillar: "P2",
      title: "Find the dedicated point-to-point circuit",
      detail: "On SHT-05 (Partner circuit), click each link and read the Link Inspector. Select the ONE link that is a true private point-to-point circuit — no intermediary devices.",
      anchor: "CI-05",
      site: "wan",
      fields: [],
      hints: [
        "A point-to-point link joins exactly two endpoints with nothing between them.",
        "Paths through the Internet cloud involve an intermediary — that's a VPN overlay, not a private circuit.",
        "Click the direct fiber between TRELLIS-EDGE-R1 and PARTNER-EDGE-R1.",
      ],
      check: function (ctx) { return ctx.s.selEdge === "e-p2p" ? { pass: true } : { pass: false }; },
      success: "Correct: TRELLIS-EDGE-R1 ↔ PARTNER-EDGE-R1 is a genuine point-to-point link — two nodes, one dedicated private fiber, guaranteed bandwidth, no intermediaries. The internet path is the classic distractor: two separate broadband legs plus a shared cloud. Exam trap to remember: a point-to-point link is defined by having exactly two endpoints — its weakness is that the link itself is a SPOF.",
      fail: "Inspect the candidates again: links that pass through the Internet cloud have a third party involved (public network = VPN overlay, not dedicated). The private circuit joins exactly two edge routers directly.",
    },
    {
      id: "M12",
      mode: "medium",
      pillar: "P1",
      title: "Classify the Riverside campus composition",
      detail: "SHT-06 mixes patterns. Label what you see INSIDE each building, BETWEEN the building switches, and what the campus as a whole is called.",
      anchor: "CI-02",
      site: "campus",
      fields: [
        {
          key: "interior",
          label: "Inside each building",
          type: "select",
          options: [
            { value: "star", label: "Star" },
            { value: "mesh", label: "Mesh" },
            { value: "point-to-point", label: "Point-to-point" },
            { value: "three-tier", label: "Three-tier" },
          ],
        },
        {
          key: "inter",
          label: "Between building switches",
          type: "select",
          options: [
            { value: "mesh", label: "Mesh" },
            { value: "star", label: "Star" },
            { value: "ring", label: "Ring" },
            { value: "point-to-point", label: "Point-to-point" },
          ],
        },
        {
          key: "overall",
          label: "The campus as a whole",
          type: "select",
          options: [
            { value: "hybrid", label: "Hybrid" },
            { value: "three-tier", label: "Three-tier" },
            { value: "spine-and-leaf", label: "Spine-and-leaf" },
          ],
        },
      ],
      hints: [
        "Inside a building: endpoints connect to one switch and not to each other.",
        "Between buildings: three switches, three fiber links — every switch reaches every other directly.",
        "Two or more topology types combined = hybrid.",
      ],
      check: function (ctx) {
        const s = ctx.s;
        const a = ans(s, "M12", "interior");
        const b = ans(s, "M12", "inter");
        const o = ans(s, "M12", "overall");
        if (a && a !== "star") return { pass: false, msg: "Inside a building, endpoints hang off one switch in spokes — re-examine." };
        if (b && b !== "mesh") return { pass: false, msg: "Between buildings count the fibers: 3 switches, 3 links, fully interconnected — that pattern has a name." };
        if (o && o !== "hybrid") return { pass: false, msg: "A network combining two or more topology types is called…" };
        return { pass: a === "star" && b === "mesh" && o === "hybrid", msg: "" };
      },
      success: "Stars inside buildings + a mesh between building switches = a HYBRID topology. Almost every real network is hybrid at some scale — the exam tests whether you can decompose a big drawing into its constituent patterns. You now hold all seven N10-009 topologies; the quiz (Plan Review) will drill the decision-making.",
      fail: "Decompose layer by layer: what pattern do A-1/A-2 → BLDG-A SW make? What do the three building switches make among themselves? Then name a network made of combined patterns.",
    },
  ];

  /* -------------------------------- HARD (10) -------------------------------- */

  const HARD_OBJECTIVES = [
    {
      id: "H1",
      mode: "hard",
      pillar: "P2",
      title: "Triage the Branch outage report",
      detail: "SHT-01's Evidence tab has tickets + monitoring from the 09:12 incident. Cross-examine the claims: name the topology, the failed component, and how many endpoints were ACTUALLY isolated.",
      anchor: "CI-03, CI-08",
      site: "branch",
      fields: [
        { key: "topo", label: "Site topology", type: "select", options: TOPO_STAR_OPTS },
        {
          key: "device",
          label: "Failed component",
          type: "select",
          options: [
            { value: "sw-b1", label: "SW-B1 (access switch)" },
            { value: "br-wan", label: "HQ / WAN uplink" },
            { value: "pos-1", label: "POS-1 terminal" },
            { value: "prn-1", label: "PRN-1 printer" },
          ],
        },
        countField("count", "Endpoints actually isolated"),
      ],
      hints: ["Trust instruments over adjectives: the monitoring block says which device was unreachable and what stayed healthy.", "The manager said 'internet company' — but the uplink e-br-up was healthy at 62% utilization.", "SW-B1 dead + 7 healthy-but-orphaned endpoints = the star's SPOF."],
      check: function (ctx) {
        const s = ctx.s;
        const t = ans(s, "H1", "topo");
        const d = ans(s, "H1", "device");
        const n = num(ans(s, "H1", "count"));
        if (t && t !== "star") return { pass: false, msg: "Topologies don't change overnight — one central switch with seven spokes." };
        if (d && d !== "sw-b1") return { pass: false, msg: "Monitoring contradicts that: e-br-up (uplink) and HQ/WAN were healthy; the dead device is the one every endpoint depends on." };
        return { pass: t === "star" && d === "sw-b1" && n === 7, msg: "" };
      },
      success: "Clean triage: star topology; SW-B1 failed; 7 endpoints isolated. You sided with instrumentation over the loudest ticket — exactly right, since 'the internet is down' is the most common false claim in helpdesk history. In star topologies the center is BOTH the performance bottleneck and the SPOF; your fix list now writes itself (redundant switch pair or dual-homed critical endpoints).",
      fail: "Re-read the Evidence tab: T-1044 (auto-monitor) is authoritative — SW-B1 unreachable, uplink healthy. Topology: every endpoint connects only to SW-B1. Count the endpoints again: POS×3, PC, PRN, AP, CAM = ?",
    },
    {
      id: "H2",
      mode: "hard",
      pillar: "P2",
      title: "Infer the DC fabric from raw evidence",
      detail: "No labels, no narrative — only the SHT-03 Evidence tab: traceroutes, discovery notes and drill results. Deduce the topology, the count of upper-tier devices, and the latency behavior.",
      anchor: "CI-04",
      site: "dc",
      fields: [
        { key: "topo", label: "Fabric topology", type: "select", options: TOPO_DC_OPTS },
        { key: "spines", label: "Upper-tier devices", type: "select", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
        {
          key: "behavior",
          label: "Latency between ANY two servers",
          type: "select",
          options: [
            { value: "consistent", label: "Consistent — same fabric stages every time" },
            { value: "varies", label: "Varies by server pair" },
          ],
        },
      ],
      hints: ["Count the switch tiers a packet crosses between two servers, then count the devices discovered on the upper tier.", "'Every lower-tier switch has uplinks to BOTH upper-tier units' is the structural fingerprint you're looking for.", "2 tiers + every-leaf-to-every-spine + uniform 2-stage latency = one specific fabric pattern."],
      check: function (ctx) {
        const s = ctx.s;
        const t = ans(s, "H2", "topo");
        const sp = ans(s, "H2", "spines");
        const b = ans(s, "H2", "behavior");
        if (t === "three-tier") return { pass: false, msg: "Three-tier means THREE switch tiers — the discovery notes found exactly 2 tiers between servers and border, with no aggregation layer." };
        if (t === "star") return { pass: false, msg: "A star has ONE central device — notes say the upper tier has 2 units and every leaf uplinks to both." };
        if (t === "full-mesh") return { pass: false, msg: "A full mesh interconnects ALL switches pairwise — notes explicitly say no lower-to-lower links exist." };
        return { pass: t === "spine-and-leaf" && sp === "2" && b === "consistent", msg: "" };
      },
      success: "Spine-and-leaf, 2 upper-tier (spine) units, consistent latency. You reconstructed the fabric from evidence alone: 2 tiers (leaf + spine), every leaf uplinked to both spines, no leaf-leaf links, no servers on spines, and identical 2-stage latency for every server pair. Near-misses rejected: three-tier needs a middle aggregation tier; star needs a single center; full mesh forbids the two-tier split. This is the analytical skill the exam's 'given a scenario' items reward.",
      fail: "Work the evidence line by line: how many tiers between server and border? How many units on the upper tier, and does EVERY lower-tier switch reach ALL of them? Do lower-tier switches link each other? The answers uniquely determine one pattern.",
    },
    {
      id: "H3",
      mode: "hard",
      pillar: "P4",
      title: "Make the metro ring cut-proof",
      detail: "On the metro Build Board, add links (≤ 9 total) so the network survives ANY single link cut — the validator will physically cut every link, one at a time, and require connectivity each time.",
      anchor: "CI-01",
      site: "build-metro",
      fields: [],
      hints: ["A graph survives every single-edge cut exactly when every link sits on a cycle — no link may be a bridge.", "The 5-link ring among WH-1..5 already passes; WH-6 is the problem — give it TWO links, not one.", "WH-6–WH-1 + WH-6–WH-5 closes the ring through WH-6: 7 links total, all on cycles."],
      check: function (c) {
        const g = c.graph("metro");
        if (g.edges.length > 9) return { pass: false, msg: "Over budget: " + g.edges.length + " > 9 links." };
        if (!E.isConnected(g.nodes, g.edges)) return { pass: false, msg: "WH-6 (or another site) is disconnected — start by connecting everything." };
        return { pass: E.survivesSingleEdgeCut(g.nodes, g.edges), msg: "Cut-test: every link severed one at a time — connectivity held." };
      },
      success: "Cut-proof by construction: your graph is connected with every link resting on a cycle, so no single cut partitions the warehouses. This is edge-connectivity ≥ 2 — the real engineering criterion behind 'partial mesh' WAN design, and cheaper than the 15-link full mesh (n(n−1)/2) that would buy tolerance you don't need. Validation-before-rollout (R-07) just saved you a change-window incident.",
      fail: "The validator found a cut that partitions the network. Any site with a single link fails instantly (cut that link = site gone). Sites with two links survive one cut. Re-run the cut-test mentally per link: WH-6 needs two links; the ring itself is safe.",
    },
    {
      id: "H4",
      mode: "hard",
      pillar: "P3",
      title: "Diagnose the HQ inter-building outage",
      detail: "SHT-02's Evidence tab: Building B can't reach Building A servers; Building B works internally; A and C are fine; DIST-2 shows amber. Name the failed LAYER, the device, and the isolated endpoint count.",
      anchor: "CI-06, CI-08",
      site: "hq",
      fields: [
        { key: "layer", label: "Failed layer", type: "select", options: LAYER_OPTS.slice(0, 3) },
        {
          key: "device",
          label: "Failed device",
          type: "select",
          options: [
            { value: "dist-1", label: "DIST-1" },
            { value: "dist-2", label: "DIST-2" },
            { value: "dist-3", label: "DIST-3" },
            { value: "core-a", label: "CORE-A" },
            { value: "acc-2a", label: "ACC-2A" },
          ],
        },
        countField("count", "Endpoints isolated"),
      ],
      hints: ["'Building B works internally' means the access switches under DIST-2 are alive — the break is above them.", "'A and C are fine' rules out both cores; the amber device serves exactly the broken building.", "A distribution switch aggregates its building's access layer: 2 access switches × 2 PCs = 4 isolated endpoints."],
      check: function (ctx) {
        const s = ctx.s;
        const l = ans(s, "H4", "layer");
        const d = ans(s, "H4", "device");
        const n = num(ans(s, "H4", "count"));
        if (l === "access") return { pass: false, msg: "Access failure would break Building B's INTERNAL traffic too — tickets say internal sharing works." };
        if (l === "core") return { pass: false, msg: "A core failure hits ALL buildings (and there are two redundant cores) — A and C are fine." };
        if (d === "core-a") return { pass: false, msg: "CORE-A is healthy per monitoring, and losing it wouldn't single out Building B." };
        if (d === "acc-2a") return { pass: false, msg: "ACC-2A failing would strand only its own two PCs — half of Building B still couldn't share internally." };
        return { pass: l === "distribution" && d === "dist-2" && n === 4, msg: "" };
      },
      success: "Distribution layer, DIST-2, 4 endpoints isolated. Your reasoning chain is the real product: internal-OK ⇒ access alive; other-buildings-OK ⇒ cores alive; single-building isolation ⇒ its aggregation point. Distribution-layer failures are the classic 'one building dark, others fine' signature in three-tier designs — made worse here by the single-homed access uplinks (R-01: dual-home them).",
      fail: "Narrow it by symptoms: internal works ⇒ not access; multiple buildings fine ⇒ not core; exactly Building B dark ⇒ the device aggregating Building B. Then count the PCs hanging under ACC-2A + ACC-2B.",
    },
    {
      id: "H5",
      mode: "hard",
      pillar: "P4",
      title: "Justify the collapsed-core decision",
      detail: "The CIO asks why the 45-user annex should be two-tier instead of full three-tier. Select EVERY valid reason (and only valid ones) from the six candidates.",
      anchor: "CI-07",
      site: "annex",
      fields: [
        {
          key: "reasons",
          label: "Valid reasons",
          type: "multi",
          options: [
            { value: "cost", label: "Lower equipment and cabling cost" },
            { value: "fewer", label: "Fewer devices to power, cool and manage" },
            { value: "scale", label: "Two tiers adequately serve a 45-user site" },
            { value: "throughput", label: "It increases east-west throughput between server racks" },
            { value: "wifi", label: "Wireless access points require a collapsed core" },
            { value: "noaccess", label: "It removes the need for access switches entirely" },
          ],
        },
      ],
      hints: ["Two answers are marketing fiction, one is a scope error — read each option against what a collapsed core actually is.", "Collapsed core saves hardware/ops overhead; it says nothing about server-rack throughput.", "Access switches stay in a collapsed-core design — endpoints still need their layer."],
      check: function (ctx) {
        const got = ((ctx.s.answers["H5"] || {}).reasons || "").split(",").filter(Boolean).sort();
        const want = ["cost", "fewer", "scale"].sort();
        return { pass: JSON.stringify(got) === JSON.stringify(want), msg: got.length === 0 ? "Select the valid reasons." : "Selected " + got.length + "/3 valid reasons" + (got.some(function (g) { return ["throughput", "wifi", "noaccess"].indexOf(g) !== -1; }) ? " — at least one distractor slipped in" : "") + "." };
      },
      success: "Exactly the three honest reasons: lower cost, fewer devices to operate, and two tiers being sufficient at 45 users. The distractors die on contact with fact: collapsed cores don't accelerate east-west rack traffic (that's a spine-and-leaf argument), APs attach to access switches under ANY tiered design, and access switches remain — removing them would bolt endpoints onto the core. Justifying a control choice while rejecting plausible-sounding errors is precisely the exam's evaluate-level skill.",
      fail: "Some picks don't survive scrutiny: throughput-between-racks is a data-center fabric benefit, not a collapsed-core one; APs don't require a collapsed core; and access switches are NOT removed — the merge happens above them. Keep exactly: cost, fewer devices, adequate for 45 users.",
    },
    {
      id: "H6",
      mode: "hard",
      pillar: "P1",
      title: "Run the full-mesh cost model",
      detail: "Metro Engineering wants a FULL mesh of all 8 Trellis sites. Leased circuits cost $2,300 per link per month; the budget ceiling is $40,000/month. Compute the numbers, then make the call.",
      anchor: "CI-01",
      site: "metro",
      fields: [
        countField("links", "Links in a full mesh of 8 sites"),
        countField("cost", "Full-mesh monthly cost (USD)"),
        {
          key: "rec",
          label: "Your recommendation",
          type: "select",
          options: [
            { value: "full", label: "Full mesh — find more budget" },
            { value: "partial", label: "Partial mesh within budget" },
            { value: "star", label: "Star around WH-1" },
            { value: "p2p", label: "Point-to-point pairs" },
          ],
        },
        countField("maxlinks", "Max links affordable at $40k/month"),
      ],
      hints: ["n(n−1)/2 with n = 8.", "Links × $2,300; then divide the budget by the per-link price and floor it.", "28 links cost $64,400 — over budget. 40,000 ÷ 2,300 = 17.39 → 17 links affordable → partial mesh."],
      check: function (ctx) {
        const s = ctx.s;
        const l = num(ans(s, "H6", "links"));
        const c = num(ans(s, "H6", "cost"));
        const r = ans(s, "H6", "rec");
        const m = num(ans(s, "H6", "maxlinks"));
        if (l !== null && l !== 28) return { pass: false, msg: "8 × 7 ÷ 2 = ? Recheck the mesh math." };
        if (c !== null && c !== 64400) return { pass: false, msg: (l === null ? "?" : l) + " links × $2,300 = ? Multiply it out." };
        if (m !== null && m !== 17) return { pass: false, msg: "$40,000 ÷ $2,300 = 17.39… — budget buys whole circuits only." };
        if (r === "full") return { pass: false, msg: "With the numbers in front of you? $64,400 against a $40,000 ceiling isn't a negotiation — pick the design that fits." };
        return { pass: l === 28 && c === 64400 && r === "partial" && m === 17, msg: "" };
      },
      success: "28 links, $64,400/month — 61% over the $40k ceiling; only 17 circuits are affordable. Recommendation: partial mesh. This is the mesh trade-off in dollar form: quadratic link growth vs linear budget. A defensible next step is spending those 17 links where cut-analysis says they matter most (keep every site ≥ 2 links, prioritize high-traffic pairs) — exactly the H3 discipline.",
      fail: "Recompute each field: 8 × 7 ÷ 2 = 28 links; 28 × $2,300 = $64,400; $40,000 ÷ $2,300 = 17.39 → 17 whole circuits; recommendation follows from budget vs need.",
    },
    {
      id: "H7",
      mode: "hard",
      pillar: "P4",
      title: "Build the redundant collapsed core",
      detail: "On the annex Build Board, construct the v2 design: 2 collapsed-core switches, 2 access switches, 4 hosts. Rules: each host attaches to exactly ONE access switch; each access switch links to BOTH collapsed-core switches; no access↔access or host↔core links. The validator then kills each core in turn.",
      anchor: "CI-07, CI-08",
      site: "build-annex",
      fields: [],
      hints: ["Place parts from the palette first, then link: click node A, then node B, 'Add link'.", "The redundancy lives BETWEEN access and core: each access switch needs uplinks to both cores.", "If killing one core strands hosts, an access switch is missing its second uplink."],
      check: function (c) {
        const g = c.annexGraph();
        const cores = g.nodes.filter(function (n) { return n.layer === "collapsed"; });
        const accs = g.nodes.filter(function (n) { return n.layer === "access"; });
        const hosts = g.nodes.filter(function (n) { return n.isHost; });
        if (cores.length !== 2 || accs.length !== 2 || hosts.length !== 4)
          return { pass: false, msg: "Parts placed: " + cores.length + "/2 collapsed-core, " + accs.length + "/2 access, " + hosts.length + "/4 hosts — place the rest from the palette." };
        for (const e of g.edges) {
          const na = g.nodes.find(function (n) { return n.id === e.a; });
          const nb = g.nodes.find(function (n) { return n.id === e.b; });
          if (na.layer === "access" && nb.layer === "access") return { pass: false, msg: "Access↔access links violate the hierarchy." };
          if ((na.isHost && nb.layer === "collapsed") || (nb.isHost && na.layer === "collapsed")) return { pass: false, msg: "Hosts attach to access switches, never directly to the core tier." };
          if (na.isHost && nb.isHost) return { pass: false, msg: "Endpoints never link to each other." };
        }
        for (const h of hosts) {
          const links = g.edges.filter(function (e) { return e.a === h.id || e.b === h.id; });
          if (links.length !== 1) return { pass: false, msg: h.label + " has " + links.length + " links — endpoints attach to exactly one access switch." };
        }
        for (const a of accs) {
          const nbIds = g.edges.filter(function (e) { return e.a === a.id || e.b === a.id; }).map(function (e) { return e.a === a.id ? e.b : e.a; });
          if (!cores.every(function (core) { return nbIds.indexOf(core.id) !== -1; })) return { pass: false, msg: a.label + " must link to BOTH collapsed-core switches — that pair of uplinks IS the redundancy." };
        }
        if (!E.isConnected(g.nodes, g.edges)) return { pass: false, msg: "The design isn't fully connected — every host must reach both cores." };
        for (const core of cores) {
          const edges2 = g.edges.filter(function (e) { return e.a !== core.id && e.b !== core.id; });
          const dead = new Set([core.id]);
          const otherCore = cores.find(function (x) { return x.id !== core.id; });
          const ok = hosts.every(function (h) { return E.reachable(g.nodes, edges2, h.id, dead, new Set()).has(otherCore.id); });
          if (!ok) return { pass: false, msg: "Cut test failed: with " + core.label + " dead, some hosts can't reach " + otherCore.label + ". Check every access switch has both uplinks." };
        }
        return { pass: true, msg: "Layering correct; both single-core cut tests passed." };
      },
      success: "Built and verified: correct hierarchy (hosts → access → collapsed core), dual-homed access layer, zero violations — and both cores passed the kill test with hosts still reaching the survivor. You've essentially deployed R-01/R-03 together: collapsed-core economics with three-tier-grade redundancy. This 'build, then break' loop is how professional designs get signed off.",
      fail: "The validator's message points at the broken rule — fix that specific one (parts count, host degree, dual uplinks, hierarchy violations, or the cut test) and re-check.",
    },
    {
      id: "H8",
      mode: "hard",
      pillar: "P2",
      title: "Label the campus zones and the partner link",
      detail: "Decompose SHT-06 (Riverside campus) zone by zone, and classify the dedicated link from SHT-05. Four labels, all evidence-based.",
      anchor: "CI-02, CI-05",
      site: "campus",
      fields: [
        { key: "interior", label: "Inside each building", type: "select", options: [{ value: "star", label: "Star" }, { value: "mesh", label: "Mesh" }, { value: "ring", label: "Ring" }, { value: "point-to-point", label: "Point-to-point" }] },
        { key: "inter", label: "Between the 3 building switches", type: "select", options: [{ value: "mesh", label: "Mesh" }, { value: "star", label: "Star" }, { value: "hybrid", label: "Hybrid" }, { value: "collapsed", label: "Collapsed core" }] },
        { key: "partner", label: "Trellis↔Partner direct link (SHT-05)", type: "select", options: [{ value: "point-to-point", label: "Point-to-point" }, { value: "star", label: "Star spoke" }, { value: "mesh", label: "Mesh member" }, { value: "vpn", label: "VPN overlay" }] },
        { key: "overall", label: "Campus as a whole", type: "select", options: [{ value: "hybrid", label: "Hybrid" }, { value: "three-tier", label: "Three-tier" }, { value: "spine-and-leaf", label: "Spine-and-leaf" }] },
      ],
      hints: ["Zone by zone: endpoints-to-switch, switch-to-switch, site-to-site, whole-drawing.", "3 building switches with 3 direct fibers: every switch reaches every other — no intermediaries between them.", "The partner link has exactly two endpoints and a private medium — say what that is."],
      check: function (ctx) {
        const s = ctx.s;
        const a = ans(s, "H8", "interior");
        const b = ans(s, "H8", "inter");
        const p = ans(s, "H8", "partner");
        const o = ans(s, "H8", "overall");
        if (p === "vpn") return { pass: false, msg: "A VPN overlay runs across the public internet — the direct Trellis↔Partner fiber is a private two-endpoint circuit." };
        return { pass: a === "star" && b === "mesh" && p === "point-to-point" && o === "hybrid", msg: "" };
      },
      success: "All four labels correct: building interiors are stars; the three building switches form a (full, 3-node) mesh; the Trellis↔Partner fiber is a dedicated point-to-point circuit; and the combination makes the campus hybrid. Multi-zone labeling is exactly how the exam phrases it — 'given a scenario, identify the topology' — and how real network documentation gets written.",
      fail: "Four independent labels — recheck each against its zone: single-center spokes inside buildings; fully-interconnected building switches; exactly-two-endpoint private fiber to the partner; and the overall name for a network mixing patterns.",
    },
    {
      id: "H9",
      mode: "hard",
      pillar: "P3",
      title: "Plan the analytics pod from the traffic report",
      detail: "The SHT-03 evidence includes a traffic mix (78% server-to-server) and a latency matrix. Classify the dominant traffic direction, pick the topology for a NEW analytics pod, justify it, and name the existing drawing that already models it.",
      anchor: "CI-04, CI-08",
      site: "dc",
      fields: [
        { key: "traffic", label: "Dominant traffic class", type: "select", options: [{ value: "east-west", label: "East-west (server-to-server)" }, { value: "north-south", label: "North-south (to/from outside)" }] },
        { key: "topo", label: "Topology for the new pod", type: "select", options: [{ value: "spine-and-leaf", label: "Spine-and-leaf" }, { value: "three-tier", label: "Three-tier" }, { value: "star", label: "Star / hub-and-spoke" }, { value: "collapsed", label: "Collapsed core" }] },
        { key: "reason", label: "Decisive reason", type: "select", options: [{ value: "consistent", label: "Uniform, low, predictable latency between any two servers" }, { value: "cheaper", label: "Cheapest cabling" }, { value: "fewer", label: "Fewest devices" }, { value: "legacy", label: "Best support for legacy protocols" }] },
        { key: "source", label: "Existing drawing already modeling it", type: "select", options: [{ value: "dc", label: "SHT-03" }, { value: "hq", label: "SHT-02" }, { value: "branch", label: "SHT-01" }, { value: "metro", label: "SHT-04" }] },
      ],
      hints: ["Server-to-server inside one site has a compass name — and it dictates the fabric, not the budget line.", "The decisive property you measured in M8 applies here.", "Which sheet already shows every leaf paired with every spine?"],
      check: function (ctx) {
        const s = ctx.s;
        const t = ans(s, "H9", "traffic");
        const topo = ans(s, "H9", "topo");
        const r = ans(s, "H9", "reason");
        const src = ans(s, "H9", "source");
        if (t === "north-south") return { pass: false, msg: "North-south crosses the site boundary — the report says 78% of traffic stays server-to-server INSIDE the pod." };
        if (topo === "three-tier") return { pass: false, msg: "Three-tier adds a distribution hop between racks — extra stages for east-west flows; measure it in the Path Tester." };
        return { pass: t === "east-west" && topo === "spine-and-leaf" && r === "consistent" && src === "dc", msg: "" };
      },
      success: "East-west dominates → spine-and-leaf, justified by uniform 2-stage latency between ANY two servers, modeled already in SHT-03. This is the canonical data-center decision path: measure the traffic direction, match the fabric to it. A three-tier pod would push east-west flows through an extra aggregation stage — the very thing spine-and-leaf was invented to remove (simplified).",
      fail: "Anchor on the report: 78% server-to-server = east-west. For the topology, weigh latency predictability between any two servers against each candidate — then recall which drawing you already path-tested in M8.",
    },
    {
      id: "H10",
      mode: "hard",
      pillar: "P3",
      title: "Challenge the 'network is down' claim",
      detail: "SHT-01's Evidence tab now holds the 14:03 incident: the manager says the whole network is down; instruments disagree. Rule on the claim, count the truly isolated endpoints, and name the failed component.",
      anchor: "CI-03, CI-08",
      site: "branch",
      fields: [
        { key: "verdict", label: "Verdict on 'whole network down'", type: "select", options: [{ value: "overstated", label: "Overstated — not the whole network" }, { value: "accurate", label: "Accurate — full outage" }] },
        countField("count", "Endpoints truly offline"),
        { key: "cause", label: "Root cause component", type: "select", options: [{ value: "sw-b1", label: "SW-B1 switch" }, { value: "pos2-uplink", label: "POS-2 uplink cable/port" }, { value: "ap-1", label: "AP-1 radio" }, { value: "br-wan", label: "HQ/WAN uplink" }] },
      ],
      hints: ["Compare this monitoring block with the 09:12 incident — is the center healthy this time?", "One interface shows link DOWN; every other interface is up with normal traffic.", "'As planned' scheduled maintenance in a ticket is scenery — check whether it explains the symptom it claims to."],
      check: function (ctx) {
        const s = ctx.s;
        const v = ans(s, "H10", "verdict");
        const n = num(ans(s, "H10", "cause") ? ans(s, "H10", "count") : "");
        const cause = ans(s, "H10", "cause");
        if (v === "accurate") return { pass: false, msg: "Monitoring contradicts 'whole network': SW-B1 healthy, uplink healthy, all other interfaces up with normal traffic." };
        if (cause === "sw-b1") return { pass: false, msg: "SW-B1 is reachable at CPU 9% this time — compare with incident 09:12 where it was unreachable." };
        if (cause === "ap-1") return { pass: false, msg: "The AP maintenance was scheduled and completed — it's a red herring, and the downed interface is wired, not radio." };
        if (cause === "br-wan") return { pass: false, msg: "The uplink shows healthy — the dead interface is local to the store floor." };
        return { pass: v === "overstated" && n === 1 && cause === "pos2-uplink", msg: "" };
      },
      success: "Overstated: exactly 1 endpoint (POS-2) offline, root cause its uplink cable/port — while SW-B1, the other endpoints and the WAN uplink were all healthy. Contrast with M2: same 'network is down' words, opposite facts, and only instrumentation tells them apart. Defensive takeaway: respond to scope claims with per-interface evidence; the red herrings (scheduled AP maintenance, panicked phrasing) are there because real tickets are too.",
      fail: "Let the instruments testify: SW-B1 reachable, uplink healthy, ONE interface down (Gig0/7 → POS-2), everything else normal. So the outage scope is a single endpoint, and the failed component is that endpoint's link — not the switch, not the AP story, not the WAN.",
    },
  ];

  const OBJECTIVES = MEDIUM_OBJECTIVES.concat(HARD_OBJECTIVES);

  function objectivesFor(mode) {
    return OBJECTIVES.filter(function (o) { return o.mode === mode; });
  }

  return {
    MEDIUM_OBJECTIVES: MEDIUM_OBJECTIVES,
    HARD_OBJECTIVES: HARD_OBJECTIVES,
    OBJECTIVES: OBJECTIVES,
    objectivesFor: objectivesFor,
  };
})();
