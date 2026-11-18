// ═══════════════════════════════════════════════════════════════════════════
// Gateway Operations Center — Lab 001 · js/objectives.js
// CHECK RESULTS engine (F2): every objective validator for both modes.
// Ported 1:1 from src/lib/lab/engine.ts — decisions AND feedback messages
// are identical to the original.
// ═══════════════════════════════════════════════════════════════════════════

(function (root) {
  "use strict";
  var D = root.GocData;
  var E = root.GocEngine;

  function arrEq(a, b) {
    return Array.isArray(a) && a.length === b.length && a.every(function (v, i) { return v === b[i]; });
  }
  function setEq(sel, correct) {
    return (
      Array.isArray(sel) &&
      sel.length === correct.length &&
      correct.every(function (c) { return sel.indexOf(c) !== -1; })
    );
  }
  function norm(s) {
    return String(s == null ? "" : s).trim().toLowerCase().replace(/\s+/g, " ");
  }
  function isRoute(a, id) {
    return norm(a) === norm(id);
  }

  function validateObjective(id, env, answers, mode) {
    switch (id) {
      case "M1": {
        var a = answers.M1 || {};
        var expect = { "r1-c1": "connected", "r1-d1": "eigrp", "r1-d2": "eigrp", "r1-o1": "ospf" };
        var wrong = Object.keys(expect).filter(function (k) { return norm(a[k]) !== expect[k]; });
        if (wrong.length === 0)
          return { ok: true, msg: "Census complete — sources read correctly." };
        return {
          ok: false,
          msg: "Not yet: " + wrong.length + " of 4 rows misclassified. The letter chip leads each row: C connected · S static · O OSPF · D EIGRP · B BGP.",
        };
      }

      case "M2": {
        var a2 = answers.M2 || {};
        var ran = {};
        env.packetRuns.forEach(function (r) { ran[r.dst] = true; });
        var need = ["10.10.10.55", "10.30.0.77", "198.51.100.23"];
        var missing = need.filter(function (d) { return !ran[d]; });
        if (missing.length)
          return {
            ok: false,
            msg: "Run the simulator for all three destinations first (missing: " + missing.join(", ") + ").",
          };
        var wrong2 =
          !isRoute(a2.d1, "r1-c1") || !isRoute(a2.d2, "r1-o1") || !isRoute(a2.d3, "r1-d2");
        if (!wrong2) return { ok: true, msg: "Three for three — prefix length chose every winner." };
        if (!isRoute(a2.d2, "r1-o1") && env.ospfStage !== "full")
          return {
            ok: false,
            msg: "The branch /24 isn't even in the table yet — the OSPF adjacency is down (Order 5). Fix that, then re-run.",
          };
        return {
          ok: false,
          msg: "One or more winners are off. For each destination, pick the MOST SPECIFIC match: .55 → connected 10.10.10.0/24; .77 → OSPF 10.30.0.0/24; 198.51.100.23 → the EIGRP default 0.0.0.0/0.",
        };
      }

      case "M3": {
        var a3 = answers.M3 || {};
        if (!arrEq(a3.order, D.AD_CORRECT_ORDER))
          return {
            ok: false,
            msg: "Ranking off. Trust order: Connected 0 → Static 1 → eBGP 20 → EIGRP 90 → OSPF 110 → iBGP 200.",
          };
        if (!isRoute(a3.tiebreak, "r3-b1"))
          return {
            ok: false,
            msg: "Tiebreak wrong: on R3 the eBGP default (AD 20) beats the floating static (AD 240) while it exists.",
          };
        return {
          ok: true,
          msg: "AD hierarchy locked in — and you predicted a real tiebreak on R3.",
        };
      }

      case "M4": {
        var a4 = answers.M4 || {};
        var float = null;
        for (var i = 0; i < env.staticRoutes.length; i++) {
          var s = env.staticRoutes[i];
          if (
            s.router === "R2" && s.prefix === "0.0.0.0/0" &&
            s.nextHop === "10.0.12.1" && s.ad === 200
          ) { float = s; break; }
        }
        if (!float)
          return {
            ok: false,
            msg: "The floating static isn't in place: on R2 add prefix 0.0.0.0/0 via 10.0.12.1 with AD 200.",
          };
        if (norm(a4.winner) !== "ospf")
          return {
            ok: false,
            msg: "Route installed, but pick the CURRENT winner: R2's OSPF default has AD 110 — lower than 200 — so OSPF still carries traffic today.",
          };
        return {
          ok: true,
          msg: "Floating static armed. OSPF (110) leads now; if it dies, your AD-200 default takes over automatically.",
        };
      }

      case "M5": {
        var a5 = answers.M5 || {};
        var correctFacts5 = ["linkstate", "spf", "cost", "ad110", "area0"];
        if (!setEq(a5.facts, correctFacts5))
          return {
            ok: false,
            msg: "Fact set incomplete. True: link-state, Dijkstra SPF, cost metric, AD 110, backbone area 0. The others describe RIP-style hop counts, DUAL (EIGRP), TCP 179 (BGP) or path-vectors (BGP).",
          };
        if (env.ospfStage !== "full")
          return {
            ok: false,
            msg: "Adjacency still down — in the OSPF panel, set R2's interface area back to 0 to match R1.",
          };
        if (norm(a5.fix) !== "area0")
          return {
            ok: false,
            msg: "Adjacency is Full, but name the fix: the area mismatch was repaired (R2 → area 0).",
          };
        return {
          ok: true,
          msg: "Adjacency Full, branch route flowing. Neighbors must agree on area, timers and MTU before a single LSA is exchanged.",
        };
      }

      case "M6": {
        var a6 = answers.M6 || {};
        var correctFacts6 = ["cisco", "hybrid", "dual", "composite", "ad90"];
        if (!setEq(a6.facts, correctFacts6))
          return {
            ok: false,
            msg: "Fact set off. True: Cisco-originated, advanced distance-vector (hybrid), DUAL, composite metric (bandwidth+delay), AD 90 internal. Link-state/SPF = OSPF; hop count = RIP; AS-path = BGP.",
          };
        if (norm(a6.successor) !== "a")
          return {
            ok: false,
            msg: "Successor wrong: compare composite metrics — Path A (3072) beats Path B (28416). Lower composite wins.",
          };
        return {
          ok: true,
          msg: "Successor identified. DUAL keeps Path B validated as feasible successor — instant failover if A dies.",
        };
      }

      case "M7": {
        var a7 = answers.M7 || {};
        var okSess = norm(a7.s1) === "ebgp" && norm(a7.s2) === "ebgp" && norm(a7.s3) === "ibgp";
        var okBest = isRoute(a7.best, "203.0.113.9") || norm(a7.best) === "via 203.0.113.9" || norm(a7.best) === "isp1";
        var okPort = Number(a7.port) === 179;
        if (!okSess)
          return {
            ok: false,
            msg: "Session types off: R3 (AS 65001) vs the ISPs (100/200) = eBGP ×2. R3↔R1 share AS 65001 = iBGP.",
          };
        if (!okBest)
          return {
            ok: false,
            msg: "Best path wrong: '100 65020' (two ASNs, via 203.0.113.9) is shorter than '200 100 65020' (three).",
          };
        if (!okPort)
          return { ok: false, msg: "Port wrong — BGP peers over TCP port 179." };
        return {
          ok: true,
          msg: "Sessions classified, best path justified by AS-path length, port 179. That's the ISP view of the world.",
        };
      }

      case "M8": {
        var a8 = answers.M8 || {};
        var rows = { "nat-1": "static", "nat-2": "pat", "nat-3": "pat", "nat-4": "pat" };
        var wrongRows = Object.keys(rows).filter(function (k) { return norm(a8[k]) !== rows[k]; });
        if (wrongRows.length)
          return {
            ok: false,
            msg: "Row classification off. If ports are rewritten (40xxx ≠ original), it's PAT. Identical ports, 1:1 pair = static NAT.",
          };
        var terms = { il: "10.10.20.5", ig: "203.0.113.70", og: "198.51.100.23", ol: "same" };
        var wrongTerms = Object.keys(terms).filter(function (k) {
          return k === "ol"
            ? norm(a8[k]) !== "same" && norm(a8[k]) !== terms[k]
            : norm(a8[k]) !== terms[k];
        });
        if (wrongTerms.length)
          return {
            ok: false,
            msg: "Term mapping off. Inside local = private host (10.10.20.5); inside global = public form (203.0.113.70); outside global = the remote server (198.51.100.23); outside local = same as outside global here (simplified).",
          };
        return {
          ok: true,
          msg: "Rows classified and terms mapped — you can now read any NAT table on sight.",
        };
      }

      case "M9": {
        var built = {};
        env.natBuilt.forEach(function (e) { built[e.id] = e; });
        for (var f = 0; f < D.PAT_FLOWS.length; f++) {
          var flow = D.PAT_FLOWS[f];
          var e = built[flow.id];
          if (!e)
            return { ok: false, msg: "Flow " + flow.insideLocal + " has no translation built yet." };
          if (e.insideGlobalIp !== "203.0.113.66")
            return { ok: false, msg: "Flow " + flow.insideLocal + ": the edge uses the shared IP 203.0.113.66." };
          if (e.insideGlobalPort !== flow.expectedPort)
            return {
              ok: false,
              msg: "Flow " + flow.insideLocal + ": port off — assignments run sequentially from 40125 in flow order (expected " + flow.expectedPort + ").",
            };
        }
        return {
          ok: true,
          msg: "Four flows, one public IP, four distinct ports — PAT's multiplexing in action.",
        };
      }

      case "M10": {
        var a10 = answers.M10 || {};
        if (env.fhrp.r1.up)
          return {
            ok: false,
            msg: "R1 is still running — trip its power switch in the FHRP bench to observe the takeover first.",
          };
        if (E.fhrpCompute(env.fhrp).active !== "R1B")
          return { ok: false, msg: "R1B should hold the VIP now — check the status lamps." };
        var okVip = norm(a10.vip) === D.FHRP_VIP;
        var okOwner = norm(a10.owner) === "r1b";
        var okUnchanged = ["vip", "yes", "unchanged", "the vip", "vip 10.10.10.1"].indexOf(norm(a10.unchanged)) !== -1;
        var okFactor = norm(a10.factor) === "priority";
        var map = { hsrp: "cisco-active", vrrp: "open-master", glbp: "cisco-lb" };
        var okMap = Object.keys(map).every(function (k) { return norm(a10[k]) === map[k]; });
        if (!okVip || !okOwner)
          return { ok: false, msg: "Record the VIP (10.10.10.1) and its new owner (R1B)." };
        if (!okUnchanged)
          return { ok: false, msg: "Hosts never reconfigure — they keep pointing at the VIP; only the pair's ownership changes." };
        if (!okFactor)
          return { ok: false, msg: "Election factor: highest PRIORITY wins (preempt governs takeback)." };
        if (!okMap)
          return { ok: false, msg: "Protocol map: HSRP = Cisco active/standby · VRRP = open standard master/backup · GLBP = Cisco AVG load-balancing." };
        return {
          ok: true,
          msg: "Failover observed and explained. Hosts never noticed: same VIP, same virtual MAC.",
        };
      }

      case "M11":
      case "H7": {
        var ok10 = E.vlanGatewayReady(env.subifs, 10);
        var ok20 = E.vlanGatewayReady(env.subifs, 20);
        if (!ok10 || !ok20) {
          var miss = [];
          if (!ok10) miss.push("G0/0.10 needs tag 10 + ip 10.10.10.2/24");
          if (!ok20) miss.push("G0/0.20 needs tag 20 + ip 10.10.20.1/24");
          return { ok: false, msg: "Trunk still broken — " + miss.join("; ") + "." };
        }
        if (id === "M11")
          return { ok: true, msg: "Inter-VLAN routing live: both subinterfaces tagged and addressed correctly." };
        var aH7 = answers.H7 || {};
        var okC1 = norm(aH7.c1) === "tag";
        var okC2 = norm(aH7.c2) === "ip";
        if (!okC1 || !okC2)
          return {
            ok: false,
            msg: "Fixed and verified — now name BOTH root causes: one subinterface listened on the wrong VLAN (tag defect); the other's gateway IP lived in the wrong subnet (IP defect).",
          };
        return {
          ok: true,
          msg: "Repaired and proven. Tag selects the VLAN, IP serves the gateway — both were lies before you fixed them.",
        };
      }

      case "M12": {
        var a12 = answers.M12 || {};
        if (!isRoute(a12.winner, "t3"))
          return {
            ok: false,
            msg: "Winner wrong: 10.40.0.32/28 (covers .32–.47) contains 10.40.0.35 and is the MOST SPECIFIC match — it beats the /16 static despite AD 110 vs 1.",
          };
        if (!arrEq(a12.rules, ["prefix", "ad", "metric"]))
          return {
            ok: false,
            msg: "Rule order: (1) longest prefix, (2) administrative distance, (3) metric. Prefix length outranks everything.",
          };
        return {
          ok: true,
          msg: "Tribunal mastered — the most specific route wins even when it comes from a 'less trusted' protocol.",
        };
      }

      // ── HARD ──
      case "H1": {
        var aH1 = answers.H1 || {};
        if (env.removedRouteIds.indexOf("r1-s-null") === -1)
          return {
            ok: false,
            msg: "The poison is still in the table: find the route that out-matches the OSPF /24 for the lower half and withdraw it (route table, row action).",
          };
        if (!isRoute(aH1.culprit, "r1-s-null"))
          return {
            ok: false,
            msg: "Wrong culprit. The legacy 172.16.99.0/24 static never matches depot traffic — the killer is 10.30.0.0/25 → Null0.",
          };
        if (norm(aH1.rule) !== "prefix")
          return {
            ok: false,
            msg: "Rule wrong: the /25 wins on PREFIX LENGTH — a /25 covers .0–.127, which is exactly the failing half.",
          };
        var last = null;
        for (var ri = env.packetRuns.length - 1; ri >= 0; ri--) {
          if (env.packetRuns[ri].dst === "10.30.0.77") { last = env.packetRuns[ri]; break; }
        }
        if (!last || last.verdict !== "delivered-branch")
          return {
            ok: false,
            msg: "Route withdrawn but delivery unproven — run a fresh trace to 10.30.0.77. (Note: it needs the OSPF adjacency from CASE 02 to be Full.)",
          };
        return {
          ok: true,
          msg: "Autopsy complete: stale /25 Null0 out-matched the /24 for half the subnet. 'Some IPs work' = think prefix length.",
        };
      }

      case "H2": {
        var aH2 = answers.H2 || {};
        if (env.ospfStage !== "full")
          return {
            ok: false,
            msg:
              env.ospfStage === "timers"
                ? "Stage 1 unresolved: neighbors stuck INIT — compare hello/dead timers and fix the mismatch in the OSPF panel."
                : "Stage 2 unresolved: stuck EXSTART/EXCHANGE — compare interface MTUs and fix.",
          };
        var okI = norm(aH2.init) === "timers";
        var okE = norm(aH2.exstart) === "mtu";
        if (!okI || !okE)
          return {
            ok: false,
            msg: "Diagnoses swapped: INIT = hello/dead timer mismatch; EXSTART/EXCHANGE = MTU mismatch.",
          };
        return {
          ok: true,
          msg: "Two drifts, one link, neighbor Full. The stuck-state map (INIT → parameters, EXSTART → MTU) just saved you a night.",
        };
      }

      case "H3": {
        var aH3 = answers.H3 || {};
        var okH3 =
          norm(aH3.r1) === "static" &&
          norm(aH3.r2) === "eigrp" &&
          norm(aH3.r3) === "ospf" &&
          norm(aH3.role) === "within-protocol";
        if (!okH3)
          return {
            ok: false,
            msg: "Re-derive each round: R1 static (AD 1) · R2 EIGRP internal (90 < 110) · R3 OSPF (110 < external EIGRP 170). Metric only ranks paths WITHIN one protocol.",
          };
        return {
          ok: true,
          msg: "Three rounds resolved. AD is the inter-protocol referee; metric never leaves its own protocol.",
        };
      }

      case "H4": {
        var aH4 = answers.H4 || {};
        var okSessH4 =
          norm(aH4.s1) === "ebgp" && norm(aH4.s2) === "ebgp" && norm(aH4.s3) === "ibgp";
        var okBestH4 = norm(aH4.best) === "via 203.0.113.9" || norm(aH4.best) === "203.0.113.9" || norm(aH4.best) === "isp1";
        var okIsp = norm(aH4.isp) === "isp1";
        var okAttr = norm(aH4.attr) === "aspath";
        if (!okSessH4)
          return { ok: false, msg: "Sessions: R3↔ISP1 eBGP · R3↔ISP2 eBGP · R3↔R1 iBGP (shared AS 65001)." };
        if (!okBestH4 || !okIsp)
          return { ok: false, msg: "Best path: via 203.0.113.9 — '100 65020' (2 ASNs) beats '200 100 65020' (3). That handoff is ISP-1." };
        if (!okAttr)
          return { ok: false, msg: "Deciding attribute at exam depth: shortest AS-PATH. AD can't help here — both candidates are eBGP (20)." };
        return {
          ok: true,
          msg: "Session engineering justified: eBGP to each provider, iBGP inside, egress by shortest AS-path.",
        };
      }

      case "H5": {
        var aH5 = answers.H5 || {};
        var okTypes =
          norm(aH5.t1) === "static" && norm(aH5.t2) === "pat" && norm(aH5.t3) === "dyn";
        if (!okTypes)
          return {
            ok: false,
            msg: "Type assignments: server reachable from outside = static NAT · 300 staff = PAT · cameras with spare IPs = dynamic NAT pool.",
          };
        var st = null;
        var pat = null;
        env.natBuilt.forEach(function (e) {
          if (e.id === "h5-static") st = e;
          if (e.id === "h5-pat") pat = e;
        });
        if (
          !st || st.insideLocal !== "10.10.20.5" ||
          st.insideGlobalIp !== "203.0.113.70" || st.insideGlobalPort !== null
        )
          return {
            ok: false,
            msg: "Static entry wrong: 10.10.20.5 ↔ 203.0.113.70, no port (static NAT is 1:1).",
          };
        if (
          !pat || pat.insideLocal !== D.H5_FLOW.insideLocal ||
          pat.insideGlobalIp !== D.H5_FLOW.assignedIp ||
          pat.insideGlobalPort !== D.H5_FLOW.assignedPort
        )
          return {
            ok: false,
            msg: "PAT entry wrong: read the edge capture — " + D.H5_FLOW.insideLocal + " was assigned " + D.H5_FLOW.assignedIp + ":" + D.H5_FLOW.assignedPort + ".",
          };
        return {
          ok: true,
          msg: "Policy designed and entries built to evidence. Inbound buys static; scale buys PAT; pools fill the middle.",
        };
      }

      case "H6": {
        var view = E.fhrpCompute(env.fhrp);
        var aH6 = answers.H6 || {};
        var okDesign =
          env.fhrp.r1b.priority === 150 &&
          env.fhrp.preempt === true &&
          env.fhrp.r1.up === true &&
          view.active === "R1B";
        if (!okDesign)
          return {
            ok: false,
            msg: "Design state not proven: R1B priority 150, preempt ON, R1 restored AND active — that combination must hold simultaneously.",
          };
        var vmacOk = /^0{4}[.:]?0c07[.:]?ac0a$/i.test(norm(aH6.vmac).replace(/\s/g, ""));
        var okH6 =
          norm(aH6.who) === "r1b" &&
          norm(aH6.why) === "preempt" &&
          norm(aH6.multi) === "vrrp" &&
          norm(aH6.lb) === "glbp" &&
          vmacOk;
        if (!okH6)
          return {
            ok: false,
            msg: "Answers off: who = R1B · why = preempt + higher priority · multi-vendor = VRRP · load-sharing = GLBP · vMAC = 0000.0C07.AC0A (HSRP group 10).",
          };
        return {
          ok: true,
          msg: "Failover engineered to spec: leadership transfers by priority and RETURNS by preempt. Hosts keep VIP + vMAC untouched.",
        };
      }

      case "H8": {
        if (!arrEq(env.h8order, D.H8_CORRECT))
          return {
            ok: false,
            msg: "Sequence wrong. Host side first (ARP for the VIP), then tagged ingress, then R1's default lookup, then PAT, then eBGP egress, then return translation.",
          };
        return {
          ok: true,
          msg: "Full transit narrated: FHRP → 802.1Q → longest-prefix default → PAT → eBGP → PAT reversal. The whole lesson in one packet.",
        };
      }

      case "H9": {
        var aH9 = answers.H9 || {};
        var okH9 =
          norm(aH9.isp) === "bgp" &&
          norm(aH9.multivendor) === "ospf" &&
          norm(aH9.cisco) === "eigrp" &&
          norm(aH9.stub) === "static" &&
          norm(aH9.egp) === "bgp";
        if (!okH9)
          return {
            ok: false,
            msg: "Matrix off: ISP peering = BGP · multi-vendor hierarchy = OSPF · Cisco-only speed = EIGRP · single stub = static. Only BGP is an EGP.",
          };
        return {
          ok: true,
          msg: "Selection matrix justified — requirement first, protocol second. That's the design exam's favorite question.",
        };
      }

      default:
        return { ok: false, msg: "Unknown objective." };
    }
  }

  root.GocObjectives = { validateObjective: validateObjective };
})(typeof window !== "undefined" ? window : globalThis);
