/* ============================================================================
   The Blueprint Room — js/engine.js
   Pure graph functions, ported 1:1 from the original engine.ts.
   No DOM access, no state access — operates on the data in js/data.js.
   ============================================================================ */

"use strict";

window.LAB_ENGINE = (function () {

  function edgeKey(a, b) {
    return [a, b].sort().join("|");
  }

  function neighborsOf(nodes, edges, id, deadNodes, deadEdges) {
    const out = [];
    for (const e of edges) {
      if (deadEdges.has(e.id)) continue;
      if (e.a === id && !deadNodes.has(e.b)) out.push(e.b);
      else if (e.b === id && !deadNodes.has(e.a)) out.push(e.a);
    }
    return out;
  }

  function reachable(nodes, edges, from, deadNodes, deadEdges) {
    const seen = new Set([from]);
    const queue = [from];
    while (queue.length) {
      const cur = queue.shift();
      for (const n of neighborsOf(nodes, edges, cur, deadNodes, deadEdges)) {
        if (!seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
    return seen;
  }

  /** Hosts that can no longer reach the site anchor (failure impact). */
  function downHosts(site, failedNodes, failedEdges) {
    const dead = new Set(failedNodes);
    const deadE = new Set(failedEdges);
    if (dead.has(site.anchor)) return site.hosts.slice(); // anchor itself gone = everything cut
    const ok = reachable(site.nodes, site.edges, site.anchor, dead, deadE);
    return site.hosts.filter(function (h) { return !ok.has(h) && !dead.has(h); });
  }

  /** BFS shortest path (fewest links) between two nodes; null if unreachable. */
  function shortestPath(site, a, b, failedNodes, failedEdges) {
    failedNodes = failedNodes || [];
    failedEdges = failedEdges || [];
    const dead = new Set(failedNodes);
    const deadE = new Set(failedEdges);
    if (dead.has(a) || dead.has(b)) return null;
    const prev = new Map();
    const seen = new Set([a]);
    const queue = [a];
    while (queue.length) {
      const cur = queue.shift();
      if (cur === b) {
        const path = [b];
        let step = b;
        while (step !== a) {
          step = prev.get(step);
          path.unshift(step);
        }
        return path;
      }
      for (const n of neighborsOf(site.nodes, site.edges, cur, dead, deadE)) {
        if (!seen.has(n)) {
          seen.add(n);
          prev.set(n, cur);
          queue.push(n);
        }
      }
    }
    return null;
  }

  function minDegree(nodes, edges) {
    if (nodes.length === 0) return 0;
    const deg = new Map(nodes.map(function (n) { return [n.id, 0]; }));
    for (const e of edges) {
      deg.set(e.a, (deg.get(e.a) || 0) + 1);
      deg.set(e.b, (deg.get(e.b) || 0) + 1);
    }
    return Math.min.apply(null, Array.from(deg.values()));
  }

  function isConnected(nodes, edges) {
    if (nodes.length === 0) return true;
    const seen = reachable(nodes, edges, nodes[0].id, new Set(), new Set());
    return seen.size === nodes.length;
  }

  /** True if the graph stays connected after removing ANY single edge (bridge-less). */
  function survivesSingleEdgeCut(nodes, edges) {
    if (!isConnected(nodes, edges)) return false;
    for (const e of edges) {
      const rest = edges.filter(function (x) { return x.id !== e.id; });
      if (!isConnected(nodes, rest)) return false;
    }
    return true;
  }

  /** True if removing any single node from `groupIds` keeps all hosts connected. */
  function survivesSingleNodeCut(site, groupIds, failedNodes, failedEdges) {
    failedNodes = failedNodes || [];
    failedEdges = failedEdges || [];
    for (const g of groupIds) {
      const down = downHosts(site, failedNodes.concat([g]), failedEdges);
      if (down.length > 0) return false;
    }
    return true;
  }

  function fullMeshLinks(n) {
    return (n * (n - 1)) / 2;
  }

  function degreeOf(site, id) {
    return site.edges.filter(function (e) { return e.a === id || e.b === id; }).length;
  }

  function getBaseSite(id) {
    return window.LAB_DATA.SITES.find(function (s) { return s.id === id; });
  }

  /** Base metro graph + student-added links, as one SiteGraph (for build checks). */
  function metroBuildGraph(addedKeys) {
    const base = window.LAB_DATA.BUILD_METRO_BASE;
    const edges = base.edges.map(function (e) { return Object.assign({}, e); });
    for (const key of addedKeys) {
      const parts = key.split("|");
      edges.push({ id: "add-" + key, a: parts[0], b: parts[1], media: "wan", bw: "1 Gbps (proposed)" });
    }
    return Object.assign({}, base, { edges: edges, truth: base.truth + " + " + addedKeys.length + " proposed link(s)" });
  }

  return {
    edgeKey: edgeKey,
    neighborsOf: neighborsOf,
    reachable: reachable,
    downHosts: downHosts,
    shortestPath: shortestPath,
    minDegree: minDegree,
    isConnected: isConnected,
    survivesSingleEdgeCut: survivesSingleEdgeCut,
    survivesSingleNodeCut: survivesSingleNodeCut,
    fullMeshLinks: fullMeshLinks,
    degreeOf: degreeOf,
    getBaseSite: getBaseSite,
    metroBuildGraph: metroBuildGraph,
  };
})();
