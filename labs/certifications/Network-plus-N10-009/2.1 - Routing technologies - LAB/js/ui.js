// ═══════════════════════════════════════════════════════════════════════════
// Gateway Operations Center — Lab 001 · js/ui.js
// Shared rendering primitives: icons, badges, chips, lamps, buttons,
// feedback panels, route tables, order pickers and the live Atlas SVG.
// Ported from src/components/lab/primitives.tsx, RouteTable.tsx and
// AtlasCanvas.tsx.
// ═══════════════════════════════════════════════════════════════════════════

(function (root) {
  "use strict";
  var D = root.GocData;

  // ── escaping (user-entered strings are echoed in a few places) ────────────
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ── inline lucide icons ────────────────────────────────────────────────────
  function icon(name, cls) {
    var inner = (root.LucidePaths && root.LucidePaths[name]) || "";
    return (
      '<svg class="icon' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" fill="none"' +
      ' stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      inner +
      "</svg>"
    );
  }

  // ── badges / chips / lamps ─────────────────────────────────────────────────
  function pillarBadge(pillar, small) {
    var m = D.PILLAR_META[pillar];
    return (
      '<span class="pillar-badge' + (small ? " small" : "") + '" style="color:' + m.color +
      ";border-color:" + m.color + "55;background:" + m.color + '14" title="' + esc(m.hint) + '">' +
      pillar + " · " + m.label + "</span>"
    );
  }

  function protoChip(p, label) {
    var c = D.PROTO_COLOR[p];
    return (
      '<span class="proto-chip" style="color:' + c + ";border-color:" + c + "66;background:" + c +
      '16" title="' + esc(label || p) + '" aria-label="source ' + esc(label || p) + '">' +
      D.PROTO_LETTER[p] + "</span>"
    );
  }

  function lamp(on, color, label, pulse) {
    return (
      '<span class="lamp" aria-label="' + esc(label) + ": " + (on ? "on" : "off") + '">' +
      '<span class="dot' + (pulse && on ? " goc-pulse" : "") + '" style="background:' +
      (on ? color : "#1c2620") + ";border-color:" + (on ? color : "#3a463e") + ";" +
      (on ? "box-shadow:0 0 8px " + color + "88;" : "") + '"></span>' +
      '<span class="label">' + esc(label) + "</span></span>"
    );
  }

  function board(text, cls) {
    return '<div class="board-label' + (cls ? " " + cls : "") + '">' + text + "</div>";
  }

  function feedbackPanel(ok, msg) {
    return (
      '<div class="feedback ' + (ok ? "ok" : "notyet") + '" role="status" aria-live="polite">' +
      '<span class="tag">' + (ok ? "✓ verified" : "· not yet") + "</span>" + esc(msg) + "</div>"
    );
  }

  function verdictBlock(r) {
    if (!r || !r.lastMsg) return "";
    var ok = r.done && r.lastOk !== false;
    return (
      '<div class="verdict-block ' + (ok ? "ok" : "notyet") + '" role="status" aria-live="polite">' +
      (ok ? "✓ " : "· ") + esc(r.lastMsg) + "</div>"
    );
  }

  function callout(title, body, tone) {
    return (
      '<div class="callout ' + (tone || "info") + '"><div class="callout-title">' + title +
      "</div><div class=\"callout-body\">" + body + "</div></div>"
    );
  }

  // ── form controls ──────────────────────────────────────────────────────────
  function selectHTML(attrs, value, options, ariaLabel) {
    // options: [{v, l}] — attrs: {id, cls}
    var h =
      '<select id="' + attrs.id + '" class="select' + (attrs.cls ? " " + attrs.cls : "") +
      '" data-select="' + attrs.id + '"' + (ariaLabel ? ' aria-label="' + esc(ariaLabel) + '"' : "") + ">";
    for (var i = 0; i < options.length; i++) {
      var o = options[i];
      h += '<option value="' + esc(o.v) + '"' + (value === o.v ? " selected" : "") + ">" + esc(o.l) + "</option>";
    }
    return h + "</select>";
  }

  function plainSelect(id, value, options, ariaLabel, cls) {
    return selectHTML({ id: id, cls: cls }, value, options, ariaLabel);
  }

  function switchHTML(id, checked, ariaLabel) {
    return (
      '<button type="button" role="switch" id="' + id + '" class="switch" aria-checked="' +
      (checked ? "true" : "false") + '" aria-label="' + esc(ariaLabel) + '" data-switch="' + id + '">' +
      '<span class="thumb"></span></button>'
    );
  }

  // ── route table (RouteTable.tsx) ───────────────────────────────────────────
  function routeTable(routes, opts) {
    opts = opts || {};
    var h =
      '<div class="table-card"><div class="table-head"><span class="table-title">' + esc(opts.title) + "</span>" +
      (opts.subtitle ? '<span class="table-sub">' + esc(opts.subtitle) + "</span>" : "") +
      "</div>" +
      '<div class="table-scroll' + (opts.compact ? " compact" : "") + '"><table class="goc-table">' +
      "<thead><tr>" +
      '<th style="padding-left:8px">Src</th><th>Prefix</th><th>[AD/M]</th><th>Next hop</th>' +
      (opts.onWithdraw ? '<th><span class="sr-only">actions</span></th>' : "") +
      "</tr></thead><tbody>";
    routes.forEach(function (r) {
      var hl = opts.highlightIds && opts.highlightIds.indexOf(r.id) !== -1;
      h += '<tr class="' + (hl ? "hl" : "") + '">';
      h += '<td style="padding-left:8px">' + protoChip(r.protocol) + "</td>";
      h +=
        '<td class="prefix-cell">' + esc(r.prefix) +
        (r.seed ? '<span class="audit-badge">audit</span>' : "") +
        "</td>";
      h += '<td class="adm-cell">[' + r.ad + "/" + r.metric + "]</td>";
      h +=
        '<td class="nexthop-cell">' + esc(r.nextHop) +
        (r.note ? '<div class="route-note">' + esc(r.note) + "</div>" : "") +
        "</td>";
      if (opts.onWithdraw) {
        h += "<td>";
        if (r.removable || r.seed) {
          h +=
            '<button type="button" class="btn btn-danger btn-icon-sm" data-withdraw="' + esc(r.id) +
            '" aria-label="Withdraw route ' + esc(r.prefix) + '" title="Withdraw this route">' +
            icon("x") + "</button>";
        }
        h += "</td>";
      }
      h += "</tr>";
    });
    if (routes.length === 0) {
      h += '<tr><td class="empty-cell" colspan="5">no routes — table empty</td></tr>';
    }
    return h + "</tbody></table></div></div>";
  }

  // ── order picker (M3 AD ranking · M12 rules · H8 transit) ──────────────────
  function orderPicker(o) {
    var h = '<div id="' + o.id + '"><div class="op-picks">';
    o.items.forEach(function (it) {
      var disabled = o.picked.indexOf(it.id) !== -1;
      h +=
        '<button type="button" class="op-btn" data-op-pick="' + o.id + ":" + esc(it.id) + '"' +
        (disabled ? " disabled" : "") + ' aria-label="' + esc(o.pickLabel) + ": " + esc(it.label) + '">' +
        esc(it.label) + "</button>";
    });
    h += "</div>";
    h += '<ol class="op-list">';
    if (o.picked.length === 0) {
      h += '<li class="placeholder">click the entries in the correct order…</li>';
    } else {
      o.picked.forEach(function (id, i) {
        var item = null;
        o.items.forEach(function (x) { if (x.id === id) item = x; });
        h += "<li><span class=\"n\">" + (i + 1) + '.</span><span>' + esc(item ? item.label : id) + "</span></li>";
      });
    }
    h += "</ol>";
    h += '<div class="op-actions">';
    h +=
      '<button type="button" class="btn btn-ghost btn-sm" data-op-undo="' + o.id + '"' +
      (o.picked.length === 0 ? " disabled" : "") + ">" + icon("undo-2") + " Undo</button>";
    h +=
      '<button type="button" class="btn btn-ghost btn-sm" data-op-clear="' + o.id + '"' +
      (o.picked.length === 0 ? " disabled" : "") + ">" + icon("rotate-ccw") + " Clear</button>";
    h += "</div></div>";
    return h;
  }

  // ── R6 — deterministic display shuffle for ordered-pick exercises ──────────
  // The picked order lives in the store and is validated by the engine; only
  // the BUTTON ORDER is shuffled (seeded, stable across reloads) so the
  // correct sequence is never displayed top-to-bottom.
  function shuffledFor(key, ids) {
    var h = 2166136261;
    for (var i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    var s = (h >>> 0) || 1;
    var rnd = function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / Math.pow(2, 32);
    };
    var out = ids.slice();
    for (var j = out.length - 1; j > 0; j--) {
      var k = Math.floor(rnd() * (j + 1));
      var tmp = out[j];
      out[j] = out[k];
      out[k] = tmp;
    }
    var identity = true;
    for (var m = 0; m < out.length; m++) if (out[m] !== ids[m]) { identity = false; break; }
    if (out.length > 1 && identity) out.reverse();
    return out;
  }

  // ── the Atlas (AtlasCanvas.tsx) ────────────────────────────────────────────
  var KIND_ACCENT = {
    router: "#F2A93B",
    isp: "#E8834A",
    cloud: "#9FB0A5",
    switch: "#3FBF9F",
    host: "#7BC47F",
    server: "#A78BFA",
  };

  function nodeById(id) {
    for (var i = 0; i < D.ATLAS_NODES.length; i++) {
      if (D.ATLAS_NODES[i].id === id) return D.ATLAS_NODES[i];
    }
    return null;
  }

  function atlasHTML(env, mode) {
    var E = root.GocEngine;
    var lastRun = env.packetRuns[0] || null;
    var fhrp = E.fhrpCompute(env.fhrp);
    var ospfUp = env.ospfStage === "full";
    var trunkOk10 = E.vlanGatewayReady(env.subifs, 10);
    var trunkOk20 = E.vlanGatewayReady(env.subifs, 20);

    var animPath = null;
    if (lastRun && lastRun.hops.length >= 2) {
      var pts = [];
      lastRun.hops.forEach(function (id) {
        var n = nodeById(id);
        if (n) pts.push(n);
      });
      if (pts.length >= 2) {
        animPath = "M " + pts[0].x + " " + pts[0].y;
        for (var pi = 1; pi < pts.length; pi++) animPath += " L " + pts[pi].x + " " + pts[pi].y;
      }
    }

    var badVerdict =
      lastRun &&
      (lastRun.verdict === "blackholed" || lastRun.verdict === "no-route" || lastRun.verdict === "blocked");
    var goodVerdict =
      lastRun &&
      (lastRun.verdict === "delivered-internet" || lastRun.verdict === "delivered-branch" ||
        lastRun.verdict === "delivered-dc" || lastRun.verdict === "delivered-local");
    var verdictColor = badVerdict ? "#E05252" : goodVerdict ? "#7BC47F" : "#F2A93B";

    var winnerNow = mode && lastRun
      ? E.selectRoute(E.effectiveR1Routes(env, mode), lastRun.dst).winner
      : null;

    var s = '<div class="atlas-wrap" data-testid="atlas">';
    s += '<svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
      esc(
        "Network atlas. FHRP " + (fhrp.active || "none") + " owns gateway VIP " + D.FHRP_VIP +
        ". OSPF link to branch is " + (ospfUp ? "up" : "down") + ". " +
        (lastRun
          ? "Last trace to " + lastRun.dst + ": " + lastRun.verdict.replace("-", " ") + "."
          : "")
      ) + '">';
    s += '<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">' +
      '<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#16211a" stroke-width="1"/></pattern></defs>';
    s += '<rect width="1000" height="620" fill="url(#grid)"/>';

    // links
    D.ATLAS_LINKS.forEach(function (l) {
      var a = nodeById(l.a);
      var b = nodeById(l.b);
      var down = l.id === "L-R2R1" && !ospfUp;
      var color = down ? "#E05252" : l.style === "transit" ? "#5a6a5f" : l.style === "trunk" ? "#3FBF9F" : "#3a463e";
      var dash = down || l.style === "transit" ? "6 5" : undefined;
      var width = l.style === "trunk" ? 3.5 : l.style === "wan" ? 2.5 : 1.8;
      s += '<g><line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y +
        '" stroke="' + color + '" stroke-width="' + width + '"' +
        (dash ? ' stroke-dasharray="' + dash + '"' : "") + ' opacity="0.9"/>';
      if (l.subnet && !down) {
        s += '<text x="' + (a.x + b.x) / 2 + '" y="' + ((a.y + b.y) / 2 - 6) +
          '" text-anchor="middle" class="goc-mono" font-size="9.5" fill="#7d8f82">' + esc(l.subnet) + "</text>";
      }
      if (down) {
        s += '<text x="' + (a.x + b.x) / 2 + '" y="' + ((a.y + b.y) / 2 - 8) +
          '" text-anchor="middle" class="goc-mono" font-size="10" font-weight="700" fill="#E05252">ADJ DOWN</text>';
      }
      s += "</g>";
    });

    // trunk VLAN tags
    s += '<g>';
    s += '<rect x="430" y="508" width="30" height="16" rx="3" fill="' + (trunkOk10 ? "#3FBF9F22" : "#E0525222") +
      '" stroke="' + (trunkOk10 ? "#3FBF9F" : "#E05252") + '"/>';
    s += '<text x="445" y="520" text-anchor="middle" class="goc-mono" font-size="10" fill="' +
      (trunkOk10 ? "#3FBF9F" : "#E05252") + '">10</text>';
    s += '<rect x="540" y="508" width="30" height="16" rx="3" fill="' + (trunkOk20 ? "#3FBF9F22" : "#E0525222") +
      '" stroke="' + (trunkOk20 ? "#3FBF9F" : "#E05252") + '"/>';
    s += '<text x="555" y="520" text-anchor="middle" class="goc-mono" font-size="10" fill="' +
      (trunkOk20 ? "#3FBF9F" : "#E05252") + '">20</text>';
    s += "</g>";

    // VIP halo on active owner
    if (fhrp.active) {
      var n = nodeById(fhrp.active);
      s += '<g><circle cx="' + n.x + '" cy="' + n.y + '" r="40" fill="none" stroke="#F2A93B" stroke-width="1.6"' +
        ' stroke-dasharray="4 6" class="goc-spin-slow" style="transform-origin:' + n.x + "px " + n.y + 'px"/>';
      s += '<text x="' + n.x + '" y="' + (n.y - 46) + '" text-anchor="middle" class="goc-mono" font-size="10" font-weight="700" fill="#F2A93B">holds ' + D.FHRP_VIP + "</text></g>";
    }

    // packet animation
    if (animPath && lastRun) {
      s += '<g data-run="' + lastRun.id + '">';
      s += '<path d="' + animPath + '" fill="none" stroke="' + verdictColor + '" stroke-width="1.4" stroke-dasharray="2 6" opacity="0.55"/>';
      s += '<circle r="6" fill="' + verdictColor + '" stroke="#0B100D" stroke-width="2">' +
        '<animateMotion dur="' + Math.max(1.6, lastRun.hops.length * 0.55) +
        's" repeatCount="1" fill="freeze" path="' + animPath + '"/></circle></g>';
    }

    // nodes
    D.ATLAS_NODES.forEach(function (nd) {
      var accent = nd.vip ? "#F2A93B" : KIND_ACCENT[nd.kind];
      var w = nd.kind === "host" ? 118 : 132;
      var h = nd.kind === "host" ? 40 : 48;
      s += '<g opacity="' + (nd.id === "VIP" ? 0.95 : 1) + '">';
      s += '<rect x="' + (nd.x - w / 2) + '" y="' + (nd.y - h / 2) + '" width="' + w + '" height="' + h +
        '" rx="9" fill="#121A15" stroke="' + accent + '55" stroke-width="1.4"/>';
      s += '<rect x="' + (nd.x - w / 2) + '" y="' + (nd.y - h / 2) + '" width="5" height="' + h + '" rx="2.5" fill="' + accent + '"/>';
      s += '<text x="' + (nd.x - w / 2 + 14) + '" y="' + (nd.y - 2) + '" class="goc-mono" font-size="11.5" font-weight="700" fill="#E7EFE9">' + esc(nd.label) + "</text>";
      if (nd.sub) {
        s += '<text x="' + (nd.x - w / 2 + 14) + '" y="' + (nd.y + 13) + '" class="goc-mono" font-size="9" fill="#9FB0A5">' + esc(nd.sub) + "</text>";
      }
      s += "</g>";
    });

    s += "</svg>";

    // trace overlay
    if (lastRun) {
      var winnerTxt = winnerNow
        ? " · winner " + winnerNow.prefix + " (" + winnerNow.protocol.toUpperCase() + ", AD " + winnerNow.ad + ")"
        : " · no matching route";
      s += '<div class="trace-overlay"><div class="trace-chip" style="border-color:' + verdictColor +
        "66;background:#0b100dcc;color:" + verdictColor + '">TRACE #' + lastRun.id + " → " +
        esc(lastRun.dst) + " · " + esc(lastRun.verdict.toUpperCase().replace("-", " ")) + esc(winnerTxt) + "</div></div>";
    }

    s += "</div>";
    return s;
  }

  function edgeLogHTML(env) {
    var h = "";
    env.edgeLog.forEach(function (l) {
      var cls = l.level === "crit" ? "crit" : l.level === "warn" ? "warn" : "info";
      h += '<div class="row"><span class="t">' + esc(l.t) + '</span><span class="' + cls + '">[' +
        l.level.toUpperCase() + "] " + esc(l.text) + "</span></div>";
    });
    return h;
  }

  root.GocUI = {
    esc: esc,
    icon: icon,
    pillarBadge: pillarBadge,
    protoChip: protoChip,
    lamp: lamp,
    board: board,
    feedbackPanel: feedbackPanel,
    verdictBlock: verdictBlock,
    callout: callout,
    selectHTML: selectHTML,
    plainSelect: plainSelect,
    switchHTML: switchHTML,
    routeTable: routeTable,
    orderPicker: orderPicker,
    shuffledFor: shuffledFor,
    atlasHTML: atlasHTML,
    edgeLogHTML: edgeLogHTML,
  };
})(typeof window !== "undefined" ? window : globalThis);
