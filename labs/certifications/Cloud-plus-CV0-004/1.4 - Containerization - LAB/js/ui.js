/**
 * HarborOps Lab — shared UI primitives (static port).
 * Translates the original shared.tsx + shadcn primitives into small named
 * template functions. Design language: daylight-harbor operations board
 * (stone paper, crane-amber, container-orange, berth-teal, stamp-red).
 */
(function (global) {
  "use strict";

  var ICONS = global.HarborIcons;
  var D = global.HarborData;

  /** HTML-escape a string for safe interpolation into template markup. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function icon(name, cls) {
    return ICONS.svg(name, cls || "icon");
  }

  /** Lucide-style pillar badge with tooltip (shared.tsx PillarBadge). */
  var PILLAR_TIPS = {
    P1: "UNDERSTAND — mechanics and attacker/cloud value",
    P2: "RECOGNIZE / ANALYZE — spot and dissect real artifacts",
    P3: "OBSERVE & VERIFY — adapted Detect pillar: read signals, catch misconfig",
    P4: "PLAN & CONTROL — adapted Mitigate pillar: choose controls, name residual risk",
  };
  function pillarBadge(pillar) {
    return '<span class="tip-wrap"><span class="badge pillar-' + pillar + '">' + pillar + "</span>" +
      '<span class="tip" role="tooltip">' + esc(PILLAR_TIPS[pillar]) + "</span></span>";
  }

  /** Zone header with index plate, tick ruler and per-zone task count. */
  function zoneHeader(index, title, subtitle, objectiveIds, solvedIds) {
    var done = objectiveIds.filter(function (id) { return solvedIds.indexOf(id) !== -1; }).length;
    var ticks = "";
    for (var i = 0; i < 14; i++) ticks += '<span class="tick"></span>';
    return '<div class="zone-header">' +
      '<div class="ticks" aria-hidden="true">' + ticks + "</div>" +
      '<div class="zone-header-row">' +
        '<div class="zone-header-left">' +
          '<span aria-hidden="true" class="zone-plate">' + String(index).padStart(2, "0") + "</span>" +
          "<div><h2>" + esc(title) + '</h2><p class="zone-sub">' + esc(subtitle) + "</p></div>" +
        "</div>" +
        (objectiveIds.length > 0
          ? '<span class="badge outline mono sm">' + done + "/" + objectiveIds.length + " tasks here</span>"
          : "") +
      "</div></div>";
  }

  /** Bordered panel with mono kicker title (shared.tsx Panel). */
  function panel(title, body, tone) {
    return '<div class="panel ' + (tone === "tint" ? "panel-tint" : "") + '">' +
      '<h3 class="panel-title">' + esc(title) + "</h3>" + body + "</div>";
  }

  /** Check banner (shared.tsx CheckBanner) — role=status, animated in. */
  function checkBanner(result) {
    if (!result) return "";
    return '<div class="check-banner ' + (result.pass ? "pass" : "fail") + '" role="status" aria-live="polite">' +
      '<div class="check-banner-head">' + icon(result.pass ? "checkCircle2" : "xCircle", "icon sm") +
      "<strong>" + esc(result.title) + "</strong></div>" +
      "<p>" + esc(result.body) + "</p></div>";
  }

  /** Hint list + reveal button (shared.tsx HintBox / rail hint rows). */
  function hintBlock(hints, revealed, maxShown, objId) {
    var cap = Math.min(hints.length, maxShown);
    var out = "";
    if (revealed > 0) {
      out += '<ul class="hint-list">';
      hints.slice(0, revealed).forEach(function (h) {
        out += '<li>' + icon("lightbulb", "icon xs") + "<span>" + esc(h) + "</span></li>";
      });
      out += "</ul>";
    }
    if (revealed < cap) {
      out += '<button type="button" class="btn ghost sm hint-btn" data-action="hint" data-obj="' + objId + '">' +
        icon("lightbulb", "icon sm") + " Reveal hint (" + revealed + "/" + cap + ") — costs stars</button>";
    }
    return out;
  }

  /** Glossary chip — dotted-underline term with definition tooltip (shared.tsx G). */
  function gchip(term) {
    var entry = D.GLOSSARY.find(function (g) { return g.term.toLowerCase() === term.toLowerCase(); });
    if (!entry) return esc(term);
    return '<span class="tip-wrap inline"><button type="button" class="gchip" aria-label="Definition: ' + esc(entry.term) + '">' +
      esc(entry.term) + icon("helpCircle", "icon xs") + "</button>" +
      '<span class="tip" role="tooltip">' + esc(entry.def) + "</span></span>";
  }

  /** Rubber-stamp CHECK button (shared.tsx StampCheck). */
  function stampCheck(objId, label, disabled) {
    return '<button type="button" class="btn stamp" data-action="check" data-obj="' + objId + '"' +
      (disabled ? " disabled" : "") + ">" + esc(label || "CHECK RESULTS") + "</button>";
  }

  /** Progress bar (shadcn Progress). */
  function progress(value, label, cls) {
    return '<div class="progress ' + (cls || "") + '" role="progressbar" aria-label="' + esc(label || "progress") + '"' +
      ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(value) + '">' +
      '<div class="progress-fill" style="width:' + Math.max(0, Math.min(100, value)) + '%"></div></div>';
  }

  /** Switch control — native checkbox styled as a switch. */
  function switchEl(checked, attrs) {
    return '<label class="switch"><input type="checkbox" role="switch" ' + (checked ? "checked" : "") + " " + (attrs || "") + ">" +
      '<span class="switch-track" aria-hidden="true"></span></label>';
  }

  /* Cheap string hash for change detection. */
  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return String(h);
  }

  /**
   * Keyed list patcher with focus preservation.
   * renderHtml(item) -> full HTML of the child element. Elements whose HTML is
   * unchanged are reused as-is (focus survives); changed ones are replaced;
   * keyboard focus is restored onto an equivalent [data-fr] node after a swap.
   */
  function patchList(container, items, keyFn, renderHtml) {
    if (!container) return;
    var doc = container.ownerDocument;
    var active = doc.activeElement;
    var focusK = null, focusRef = null;
    if (active && container.contains(active)) {
      var kNode = active.closest("[data-k]");
      var frNode = active.closest("[data-fr]");
      if (kNode) focusK = kNode.getAttribute("data-k");
      if (frNode) focusRef = frNode.getAttribute("data-fr");
    }

    var existing = {};
    Array.prototype.forEach.call(container.children, function (child) {
      existing[child.getAttribute("data-k")] = child;
    });

    items.forEach(function (item) {
      var k = String(keyFn(item));
      var html = renderHtml(item);
      var node = existing[k];
      if (!node) {
        var t = doc.createElement("template");
        t.innerHTML = html.trim();
        var el = t.content.firstElementChild;
        el.setAttribute("data-k", k);
        el.__h = hash(html);
        existing[k] = el;
        container.appendChild(el);
      } else if (node.__h !== hash(html)) {
        var t2 = doc.createElement("template");
        t2.innerHTML = html.trim();
        var rep = t2.content.firstElementChild;
        rep.setAttribute("data-k", k);
        rep.__h = hash(html);
        container.replaceChild(rep, node);
        existing[k] = rep;
      }
    });

    // Remove nodes no longer present.
    Array.prototype.slice.call(container.children).forEach(function (child) {
      if (!items.some(function (item) { return String(keyFn(item)) === child.getAttribute("data-k"); })) {
        container.removeChild(child);
      }
    });
    // Reorder ONLY when the order actually differs. Unconditionally re-appending
    // would MOVE (disconnect + reconnect) unchanged nodes — which cancels an
    // in-flight click gesture (mousedown target removed before mouseup).
    var currentKeys = Array.prototype.map.call(container.children, function (c) {
      return c.getAttribute("data-k");
    });
    var targetKeys = items.map(function (item) { return String(keyFn(item)); });
    if (currentKeys.join("|") !== targetKeys.join("|")) {
      items.forEach(function (item) {
        var k = String(keyFn(item));
        container.appendChild(existing[k]);
      });
    }

    // Restore keyboard focus if it lived inside a replaced node.
    if (focusK && doc.activeElement === doc.body) {
      var target = container.querySelector('[data-k="' + focusK + '"]');
      var el2 = target && (focusRef ? target.querySelector('[data-fr="' + focusRef + '"]') : null);
      if (el2) el2.focus();
      else if (target && target.matches("[data-fr], button, input, select, textarea")) target.focus();
    }
  }

  /** Radio group markup — native inputs for keyboard operability. */
  function radioGroup(name, options, selected, opts) {
    opts = opts || {};
    return options.map(function (o) {
      var sel = selected === o.id;
      var correct = opts.solved && o.id === opts.correctId;
      var cls = "btn radio" + (correct ? " correct" : sel ? " selected" : "");
      var dis = opts.disabled ? " disabled" : "";
      return '<label class="' + cls + '" ' + (opts.hint ? 'title="' + esc(opts.hint) + '"' : "") + ">" +
        '<input type="radio" name="' + name + '" value="' + esc(o.id) + '"' + (sel ? " checked" : "") + dis + ">" +
        "<span>" + esc(o.label) + "</span></label>";
    }).join("");
  }

  global.HarborUI = {
    esc: esc,
    icon: icon,
    pillarBadge: pillarBadge,
    zoneHeader: zoneHeader,
    panel: panel,
    checkBanner: checkBanner,
    hintBlock: hintBlock,
    gchip: gchip,
    stampCheck: stampCheck,
    progress: progress,
    switchEl: switchEl,
    patchList: patchList,
    radioGroup: radioGroup,
    hash: hash,
    /** Hash helper for small-block change detection (inner swap without focus loss). */
    hashHtml: function (html) { return hash(html); },
  };
})(window);
