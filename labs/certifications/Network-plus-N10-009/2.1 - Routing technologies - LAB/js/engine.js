// ═══════════════════════════════════════════════════════════════════════════
// Gateway Operations Center — Lab 001 · js/engine.js
// Simulation engine: IPv4 math, the route-selection tribunal, packet runs,
// FHRP election, OSPF neighbor view, star scoring and focus-area derivation.
// Ported 1:1 from src/lib/lab/engine.ts (validation lives in objectives.js).
// ═══════════════════════════════════════════════════════════════════════════

(function (root) {
  "use strict";
  var D = root.GocData;

  // ── IPv4 helpers ───────────────────────────────────────────────────────────
  function cidrMatch(ipNum, net, bits) {
    if (bits === 0) return true;
    var shift = 32 - bits;
    return (ipNum >>> shift) === (net >>> shift);
  }

  function inSubnet(ip, base, bits) {
    var n = D.ipToNum(ip);
    var b = D.ipToNum(base);
    if (isNaN(n) || isNaN(b)) return false;
    return cidrMatch(n, b, bits);
  }

  function validIp(ip) {
    return !isNaN(D.ipToNum(ip));
  }

  // ── Route selection tribunal: prefix → AD → metric ─────────────────────────
  function selectRoute(routes, dst) {
    var ipNum = D.ipToNum(dst);
    if (isNaN(ipNum)) return { winner: null, candidates: [] };
    var candidates = routes
      .filter(function (r) { return cidrMatch(ipNum, r.net, r.maskBits); })
      .sort(function (a, b) {
        return b.maskBits - a.maskBits || a.ad - b.ad || a.metric - b.metric;
      });
    return { winner: candidates[0] || null, candidates: candidates };
  }

  // ── Effective R1 table (seed − removed + student statics + conditionals) ──
  function subifOk(subifs, name) {
    for (var i = 0; i < subifs.length; i++) if (subifs[i].name === name) return subifs[i];
    return undefined;
  }

  function vlanGatewayReady(subifs, vlan) {
    var s = vlan === 10 ? subifOk(subifs, "G0/0.10") : subifOk(subifs, "G0/0.20");
    if (!s || s.tag !== vlan) return false;
    var expect = vlan === 10 ? "10.10.10.2" : "10.10.20.1";
    return s.ip.indexOf(expect + "/") === 0;
  }

  function effectiveR1Routes(env, mode) {
    var seeds = D.r1SeedRoutes(mode).filter(function (r) {
      return env.removedRouteIds.indexOf(r.id) === -1;
    });
    var out = [];
    seeds.forEach(function (r) {
      if (r.id === "r1-c1" && !vlanGatewayReady(env.subifs, 10)) return;
      if (r.id === "r1-c2" && !vlanGatewayReady(env.subifs, 20)) return;
      if (r.conditionalOspf && env.ospfStage !== "full") return;
      out.push(r);
    });
    var student = env.staticRoutes
      .filter(function (s) { return s.router === "R1"; })
      .map(staticToRoute);
    return student.concat(out);
  }

  function staticToRoute(s) {
    var p = D.parsePrefix(s.prefix) || { net: 0, bits: 0 };
    return {
      id: "usr-" + s.id,
      protocol: "static",
      prefix: s.prefix,
      net: p.net,
      maskBits: p.bits,
      ad: s.ad,
      metric: 0,
      nextHop: "via " + s.nextHop,
    };
  }

  function effectiveR2Routes(env) {
    var seeds = D.r2SeedRoutes().filter(function (r) {
      return env.removedRouteIds.indexOf(r.id) === -1;
    });
    var out = [];
    seeds.forEach(function (r) {
      if (r.conditionalOspf && env.ospfStage !== "full") return;
      out.push(r);
    });
    var student = env.staticRoutes
      .filter(function (s) { return s.router === "R2"; })
      .map(staticToRoute);
    return student.concat(out);
  }

  // ── Packet simulation ──────────────────────────────────────────────────────
  var LOCAL_LANS = [
    { prefix: "10.10.10.0", bits: 24 },
    { prefix: "10.10.20.0", bits: 24 },
  ];

  function verdictFor(winner, dst) {
    if (!winner) return "no-route";
    if (winner.nextHop.indexOf("Null0") !== -1) return "blackholed";
    var n = D.ipToNum(dst);
    // The winner route must actually SERVE the destination's LAN for a local
    // delivery. If a LAN address is caught by a less-specific route (e.g. the
    // default, because the serving subinterface is missing/broken), the packet
    // is misrouted — it leaves toward the default next hop instead of the host.
    for (var i = 0; i < LOCAL_LANS.length; i++) {
      var lan = LOCAL_LANS[i];
      if (!cidrMatch(n, D.ipToNum(lan.prefix), lan.bits)) continue;
      return winner.prefix === lan.prefix + "/" + lan.bits
        ? "delivered-local"
        : "blocked";
    }
    if (cidrMatch(n, D.ipToNum("10.30.0.0"), 24)) {
      return winner.prefix === "10.30.0.0/24" ? "delivered-branch" : "blocked";
    }
    if (cidrMatch(n, D.ipToNum("10.40.0.0"), 24)) {
      return winner.prefix === "10.40.0.0/24" ? "delivered-dc" : "blocked";
    }
    return "delivered-internet";
  }

  function pathKeyFor(winner, verdict, dst) {
    switch (verdict) {
      case "delivered-local":
        return cidrMatch(D.ipToNum(dst), D.ipToNum("10.10.20.0"), 24) ? "vlan20" : "vlan10";
      case "blocked":
      case "blackholed":
        return "blackhole";
      case "delivered-branch":
        return "branch";
      case "delivered-dc":
        return "dc";
      case "delivered-internet":
        return winner && winner.nextHop.indexOf("203.0.113.13") !== -1 ? "internet2" : "internet";
      default:
        return "noroute";
    }
  }

  function makePacketRun(env, mode, dst) {
    var ipNum = D.ipToNum(dst);
    if (isNaN(ipNum)) return { error: dst + " is not a valid IPv4 address" };
    var routes = effectiveR1Routes(env, mode);
    var sel = selectRoute(routes, dst);
    var winner = sel.winner;
    var candidates = sel.candidates;
    var verdict = verdictFor(winner, dst);
    return {
      id: env.runCounter + 1,
      dst: dst,
      src: "10.10.10.44",
      winnerRouteId: winner ? winner.id : null,
      winnerPrefix: winner ? winner.prefix : null,
      protocol: winner ? winner.protocol : null,
      nextHop: winner ? winner.nextHop : null,
      verdict: verdict,
      hops: D.HOP_PATHS[pathKeyFor(winner, verdict, dst)] || D.HOP_PATHS.noroute,
      candidates: candidates.map(function (c) {
        return {
          id: c.id,
          prefix: c.prefix,
          protocol: c.protocol,
          ad: c.ad,
          metric: c.metric,
          bits: c.maskBits,
          winner: c.id === (winner && winner.id),
        };
      }),
      ts: Date.now(),
    };
  }

  // ── FHRP election ──────────────────────────────────────────────────────────
  function fhrpCompute(f) {
    var active;
    if (!f.r1.up && !f.r1b.up) active = null;
    else if (!f.r1b.up) active = "R1";
    else if (!f.r1.up) active = "R1B";
    else if (f.r1b.priority > f.r1.priority && f.preempt) active = "R1B";
    else active = "R1";
    var standby = active === null ? null : active === "R1" ? "R1B" : "R1";
    var names = {
      HSRP: ["ACTIVE", "STANDBY"],
      VRRP: ["MASTER", "BACKUP"],
      GLBP: ["AVG", "AVF"],
    };
    var role = names[f.protocol];
    var vmacs = {
      HSRP: { v: D.HSRP_VMAC, n: "0000.0C07.ACxx (group in last byte — AC0A for group 10)" },
      VRRP: { v: "0000.5E00.010A", n: "0000.5E00.01xx (VRRP format, simplified)" },
      GLBP: { v: "0007.B400.0A01", n: "0007.B400.xxyy (AVF virtual MAC, simplified)" },
    };
    return {
      active: active,
      standby: standby,
      roleActive: role[0],
      roleStandby: role[1],
      vmac: vmacs[f.protocol].v,
      vmacNote: vmacs[f.protocol].n,
    };
  }

  // ── OSPF neighbor view ─────────────────────────────────────────────────────
  function ospfNeighborView(env) {
    switch (env.ospfStage) {
      case "area":
        return {
          state: "INIT",
          detail:
            "Hellos seen, but parameter mismatch — area differs (R1: area 0, R2: area 1). No routes exchange.",
        };
      case "timers":
        return {
          state: "INIT",
          detail:
            "Hellos seen but hello/dead intervals disagree (R1: 10/40, R2: 10/20). Neighbor never forms.",
        };
      case "mtu":
        return {
          state: "EXSTART/EXCHANGE",
          detail:
            "Timers now agree, but DB descriptor exchange stalls — interface MTU mismatch (R1: 1500, R2: 1400).",
        };
      case "full":
        return { state: "FULL", detail: "Adjacent. LSDB synchronized; routes are flowing." };
    }
  }

  // ── Scoring / stars ────────────────────────────────────────────────────────
  function computeStars(objectives, results, quizCorrect, quizTotal, mode) {
    var earned = 0;
    var max = 0;
    objectives.forEach(function (o) {
      max += o.points;
      var r = results[o.id];
      if (r && r.done) {
        var p = r.firstTry ? o.points : o.points * 0.5;
        p -= r.hintsUsed * (mode === "hard" ? 1.5 : 0.5);
        earned += Math.max(p, o.points * 0.25);
      }
    });
    var objRatio = max ? earned / max : 0;
    var quizRatio = quizTotal ? quizCorrect / quizTotal : 0;
    var score = objRatio * 0.65 + quizRatio * 0.35;
    var stars = Math.max(1, Math.min(5, Math.round(score * 5)));
    return { stars: stars, objRatio: objRatio, quizRatio: quizRatio, score: score };
  }

  // ── Focus areas derived from actual student evidence ───────────────────────
  function computeFocusAreas(objectives, results, quiz, quizAnswers, quizChecked) {
    var areas = [];

    // 1 · Objectives attempted but still open — the strongest gap signal.
    objectives.forEach(function (o) {
      var r = results[o.id];
      if (r && !r.done && (r.attempts || 0) > 0) {
        var tried = r.attempts;
        areas.push({
          title: o.id + " · " + o.title + " — still open",
          detail:
            "Attempted " + tried + "× without closing. Re-read the last check message on the " +
            o.bench.toUpperCase() + " bench, then work it once more.",
          weight: 3 + Math.min(tried, 3),
        });
      }
    });

    // 2 · Objectives passed only after misses or hints — shaky mastery.
    objectives.forEach(function (o) {
      var r = results[o.id];
      if (r && r.done && (r.attempts > 1 || r.hintsUsed > 0)) {
        areas.push({
          title: o.id + " · " + o.title + " — passed with help",
          detail:
            "Closed after " + r.attempts + " check" + (r.attempts > 1 ? "s" : "") +
            (r.hintsUsed ? " and " + r.hintsUsed + " hint" + (r.hintsUsed > 1 ? "s" : "") : "") +
            ". Re-read its verdict: " + o.feedback,
          weight: 3,
        });
      }
    });

    // 3 · Missed quiz items — name the exact question and the correct reasoning.
    quiz.forEach(function (q) {
      if (quizChecked[q.id] && quizAnswers[q.id] !== q.correct) {
        areas.push({
          title: 'Comms check · "' + (q.q.length > 58 ? q.q.slice(0, 55) + "…" : q.q) + '" — missed',
          detail: q.explanation,
          weight: 4,
        });
      }
    });

    // 4 · Never-attempted orders — listed last, plain "not done yet" signal.
    objectives.forEach(function (o) {
      if (!results[o.id]) {
        areas.push({
          title: o.id + " · " + o.title + " — not started",
          detail:
            "Work it on the " + o.bench.toUpperCase() +
            " bench — it covers exam-critical ground the quiz assumes.",
          weight: 1,
        });
      }
    });

    return areas
      .sort(function (a, b) { return b.weight - a.weight; })
      .slice(0, 6)
      .map(function (a) { return { title: a.title, detail: a.detail }; });
  }

  root.GocEngine = {
    cidrMatch: cidrMatch,
    inSubnet: inSubnet,
    validIp: validIp,
    selectRoute: selectRoute,
    subifOk: subifOk,
    vlanGatewayReady: vlanGatewayReady,
    effectiveR1Routes: effectiveR1Routes,
    staticToRoute: staticToRoute,
    effectiveR2Routes: effectiveR2Routes,
    verdictFor: verdictFor,
    pathKeyFor: pathKeyFor,
    makePacketRun: makePacketRun,
    fhrpCompute: fhrpCompute,
    ospfNeighborView: ospfNeighborView,
    computeStars: computeStars,
    computeFocusAreas: computeFocusAreas,
  };
})(typeof window !== "undefined" ? window : globalThis);
