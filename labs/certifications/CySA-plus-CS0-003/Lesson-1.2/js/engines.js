/* ═══════════════════════════════════════════════════════════════════════════
   THE CONTROL GRID — js/engines.js
   The eight interaction engines (choose/sort/match/classify/evidence/
   register/depth/order) and the WorkSurface wrapper. Rendered as template
   functions; interactions dispatch through app.js event delegation using
   data-action attributes. Transient per-objective UI state (selected tile /
   selected term) lives in CG.engineUi and resets when the objective changes.
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {
  var esc = CG.ui.esc;
  var icon = CG.ui.icon;
  var verdictCls = CG.ui.verdictCls;
  var segmentedCls = CG.ui.segmentedCls;
  var consoleLabel = CG.ui.consoleLabel;

  /* Transient engine state (never persisted — same as React component state) */
  var engineUi = { selTile: null, selLeft: null, forObj: null };

  function ensureEngineUi(objId) {
    if (engineUi.forObj !== objId) {
      engineUi = { selTile: null, selLeft: null, forObj: objId };
    }
    return engineUi;
  }

  /* ─── Shared option list (evidence + register sub-items) ───────────────── */

  function itemOptionList(options, selected, outcomeItem, action, argPrefix) {
    return (
      '<div class="stack-sm">' +
      options
        .map(function (o) {
          var isSel = selected === o.id;
          var revealed = !!outcomeItem;
          var ok = revealed ? (o.correct ? isSel : !isSel) : null;
          return (
            '<div>' +
            '<button type="button" data-action="' +
            action +
            '" data-arg="' +
            esc(argPrefix + ":" + o.id) +
            '" data-fk="opt:' +
            action +
            ":" +
            esc(argPrefix) +
            ":" +
            esc(o.id) +
            '" aria-pressed="' +
            (isSel ? "true" : "false") +
            '" class="opt-row ' +
            verdictCls(revealed, ok, isSel) +
            '">' +
            '<span class="radio-dot' +
            (isSel ? " on" : "") +
            '" aria-hidden="true">' +
            (isSel ? '<span class="radio-dot-inner"></span>' : "") +
            "</span>" +
            "<span>" +
            esc(o.label) +
            "</span>" +
            (o.note ? '<span class="note-badge">' + esc(o.note) + "</span>" : "") +
            "</button>" +
            /* Attempt-gated rationale: only the picked option explains itself.
               Unanswered sub-items never reveal the correct artifact. */
            (revealed && isSel ? '<p class="opt-why">' + esc(o.why) + "</p>" : "") +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  /* ─── CHOOSE ─────────────────────────────────────────────────────────────── */

  function chooseEngine(obj, answer, outcome) {
    var p = obj.payload;
    var sel = answer || [];
    return (
      "<div>" +
      (p.multi ? '<div class="mb2">' + consoleLabel("multi-select — pick the exact set") + "</div>" : "") +
      '<div class="stack-sm">' +
      p.options
        .map(function (o) {
          var selected = sel.includes(o.id);
          var revealed = !!outcome;
          var ok = revealed ? (o.correct ? selected : !selected) : null;
          return (
            "<div>" +
            '<button type="button" data-action="choose-toggle" data-arg="' +
            esc(o.id) +
            '" data-fk="choose:' +
            esc(obj.id) +
            ":" +
            esc(o.id) +
            '" aria-pressed="' +
            (selected ? "true" : "false") +
            '" class="opt-row opt-row-lg ' +
            verdictCls(revealed, ok, selected) +
            '">' +
            '<span class="check-box' +
            (selected ? " on" : "") +
            '" aria-hidden="true">' +
            (selected ? (p.multi ? "✓" : "●") : "") +
            "</span>" +
            "<span>" +
            esc(o.label) +
            "</span>" +
            (o.note ? '<span class="note-badge">' + esc(o.note) + "</span>" : "") +
            "</button>" +
            (revealed && (selected || o.correct) ? '<p class="opt-why">' + esc(o.why) + "</p>" : "") +
            "</div>"
          );
        })
        .join("") +
      "</div></div>"
    );
  }

  /* ─── SORT ───────────────────────────────────────────────────────────────── */

  function sortEngine(obj, answer, outcome, passed) {
    var p = obj.payload;
    var ui = ensureEngineUi(obj.id);
    var assign = answer || {};
    var locked = !!passed; // board stays editable until pass — wrong answers teach, never block
    var unfiled = p.tiles.filter(function (t) { return !assign[t.id]; });
    var revealFor = function (tileId) {
      if (!outcome) return null;
      var idx = -1;
      for (var i = 0; i < p.tiles.length; i++) if (p.tiles[i].id === tileId) idx = i;
      return outcome.items[idx] ? outcome.items[idx].ok : null;
    };

    var tray =
      '<div class="sort-tray">' +
      (unfiled.length === 0
        ? '<span class="tray-empty">All tiles filed — run the check.</span>'
        : "") +
      unfiled
        .map(function (t) {
          var isSel = ui.selTile === t.id;
          return (
            '<button type="button" data-action="sort-tile" data-arg="' +
            esc(t.id) +
            '" data-fk="tile:' +
            esc(obj.id) +
            ":" +
            esc(t.id) +
            '" aria-pressed="' +
            (isSel ? "true" : "false") +
            '" class="sort-tile ' +
            verdictCls(false, null, isSel) +
            '">' +
            esc(t.label) +
            "</button>"
          );
        })
        .join("") +
      "</div>";

    var bins = p.bins
      .map(function (b) {
        var inside = p.tiles.filter(function (t) { return assign[t.id] === b.id; });
        var tilesHtml = inside
          .map(function (t) {
            var ok = revealFor(t.id);
            return (
              '<span class="bin-tile ' +
              verdictCls(!!outcome, ok, true) +
              '">' +
              "<span>" +
              esc(t.label) +
              "</span>" +
              (!locked
                ? '<button type="button" data-action="sort-remove" data-arg="' +
                  esc(t.id) +
                  '" data-fk="rm:' +
                  esc(obj.id) +
                  ":" +
                  esc(t.id) +
                  '" aria-label="Remove ' +
                  esc(t.label) +
                  ' from bin" class="bin-remove">' +
                  icon("x", "icon-xs") +
                  "</button>"
                : "") +
              "</span>"
            );
          })
          .join("");
        return (
          '<div class="sort-bin' +
          (ui.selTile ? " armed" : "") +
          '">' +
          '<button type="button" data-action="sort-place" data-arg="' +
          esc(b.id) +
          '" data-fk="bin:' +
          esc(obj.id) +
          ":" +
          esc(b.id) +
          '" aria-label="File selected tile into ' +
          esc(b.label) +
          '"' +
          (ui.selTile ? "" : ' aria-disabled="true" tabindex="-1"') +
          ' class="bin-overlay"></button>' +
          '<span class="bin-label">' +
          esc(b.label) +
          "</span>" +
          '<span class="bin-desc">' +
          esc(b.desc) +
          "</span>" +
          '<span class="bin-tiles">' +
          tilesHtml +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    return (
      "<div>" +
      '<div class="mb2">' +
      consoleLabel("1 · tap a tile — 2 · tap a bin to file it") +
      "</div>" +
      tray +
      '<div class="sort-bins">' +
      bins +
      "</div></div>"
    );
  }

  /* ─── MATCH ──────────────────────────────────────────────────────────────── */

  function matchEngine(obj, answer, outcome, passed) {
    var p = obj.payload;
    var ui = ensureEngineUi(obj.id);
    var pairs = answer || {};
    var locked = !!passed;
    var usedRights = {};
    Object.keys(pairs).forEach(function (k) {
      if (pairs[k]) usedRights[pairs[k]] = true;
    });
    var revealFor = function (leftId) {
      if (!outcome) return null;
      var idx = -1;
      for (var i = 0; i < p.lefts.length; i++) if (p.lefts[i].id === leftId) idx = i;
      return outcome.items[idx] ? outcome.items[idx].ok : null;
    };

    var lefts = p.lefts
      .map(function (l) {
        var rightId = pairs[l.id];
        var right = null;
        for (var i = 0; i < p.rights.length; i++) if (p.rights[i].id === rightId) right = p.rights[i];
        var revealed = !!outcome;
        var ok = revealFor(l.id);
        return (
          '<div class="match-left">' +
          '<button type="button" data-action="match-left" data-arg="' +
          esc(l.id) +
          '" data-fk="ml:' +
          esc(obj.id) +
          ":" +
          esc(l.id) +
          '" aria-pressed="' +
          (ui.selLeft === l.id ? "true" : "false") +
          '" aria-label="Select term ' +
          esc(l.label) +
          '" class="match-left-overlay"></button>' +
          '<span class="match-left-label ' +
          verdictCls(false, null, ui.selLeft === l.id) +
          '">' +
          esc(l.label) +
          "</span>" +
          (right && !locked
            ? '<button type="button" data-action="match-unlink" data-arg="' +
              esc(l.id) +
              '" data-fk="mu:' +
              esc(obj.id) +
              ":" +
              esc(l.id) +
              '" aria-label="Unpair ' +
              esc(l.label) +
              '" class="match-unpair">' +
              icon("x", "icon-xs") +
              "</button>"
            : "") +
          (right
            ? '<p class="match-paired ' + segmentedCls(revealed, ok, true) + '">→ ' + esc(right.label) + "</p>"
            : "") +
          "</div>"
        );
      })
      .join("");

    var rights = p.rights
      .map(function (r) {
        var used = usedRights[r.id];
        return (
          '<button type="button" data-action="match-right" data-arg="' +
          esc(r.id) +
          '" data-fk="mr:' +
          esc(obj.id) +
          ":" +
          esc(r.id) +
          '"' +
          (used || !ui.selLeft ? " disabled" : "") +
          ' class="match-right ' +
          (used ? "is-used" : ui.selLeft ? "is-live" : "is-dim") +
          '">' +
          esc(r.label) +
          "</button>"
        );
      })
      .join("");

    return (
      "<div>" +
      '<div class="mb2">' +
      consoleLabel("1 · tap a term — 2 · tap its definition") +
      "</div>" +
      '<div class="match-grid"><div class="stack-sm">' +
      lefts +
      '</div><div class="stack-sm">' +
      rights +
      "</div></div>" +
      (!ui.selLeft ? '<p class="match-hint">Select a term on the left first, then tap a definition.</p>' : "") +
      "</div>"
    );
  }

  /* ─── CLASSIFY ───────────────────────────────────────────────────────────── */

  function classifyEngine(obj, answer, outcome) {
    var p = obj.payload;
    var cls = answer || {};
    // Board fills only from CHECK results — a live board would leak which items are controls (Hard mode)
    var filled = {};
    if (outcome) {
      p.cards.forEach(function (c, i) {
        if (outcome.items[i] && outcome.items[i].ok && c.control && c.cat && c.type) {
          filled[c.cat + "|" + c.type] = true;
        }
      });
    }
    var revealFor = function (cardId) {
      if (!outcome) return null;
      var idx = -1;
      for (var i = 0; i < p.cards.length; i++) if (p.cards[i].id === cardId) idx = i;
      return outcome.items[idx] ? outcome.items[idx].ok : null;
    };

    var cards = p.cards
      .map(function (c) {
        var got = cls[c.id] || { cat: "", type: "" };
        var not = got.cat === "X";
        var attemptedCard = got.cat !== "";
        var revealed = !!outcome && attemptedCard; // unattempted cards stay sealed — no key from renders
        var ok = revealFor(c.id);
        var catBtns = CG.CATEGORIES.map(function (cat) {
          var sel = got.cat === cat;
          var okCls = revealed && got.cat === cat && got.type !== "" ? ok : null;
          return (
            '<button type="button" data-action="cls-cat" data-arg="' +
            esc(c.id) +
            ":" +
            esc(cat) +
            '" data-fk="cc:' +
            esc(obj.id) +
            ":" +
            esc(c.id) +
            ":" +
            esc(cat) +
            '" aria-pressed="' +
            (sel ? "true" : "false") +
            '" class="seg-btn ' +
            segmentedCls(revealed && !!got.cat && !!got.type, okCls, sel) +
            '">' +
            esc(cat) +
            "</button>"
          );
        }).join("");
        var typeBtns = CG.CONTROL_TYPES.map(function (t) {
          var sel = got.type === t;
          var okCls = revealed && got.type === t && got.cat !== "" ? ok : null;
          return (
            '<button type="button" data-action="cls-type" data-arg="' +
            esc(c.id) +
            ":" +
            esc(t) +
            '" data-fk="ct:' +
            esc(obj.id) +
            ":" +
            esc(c.id) +
            ":" +
            esc(t) +
            '" aria-pressed="' +
            (sel ? "true" : "false") +
            '" class="seg-btn ' +
            segmentedCls(revealed && !!got.cat && !!got.type, okCls, sel) +
            '">' +
            esc(t) +
            "</button>"
          );
        }).join("");
        return (
          '<div class="cls-card ' +
          (revealed ? verdictCls(true, ok, true) : "v-idle") +
          '">' +
          '<div class="cls-card-head">' +
          '<p class="cls-text">' +
          esc(c.text) +
          "</p>" +
          (p.allowNotControl
            ? '<button type="button" data-action="cls-not" data-arg="' +
              esc(c.id) +
              '" data-fk="cn:' +
              esc(obj.id) +
              ":" +
              esc(c.id) +
              '" aria-pressed="' +
              (not ? "true" : "false") +
              '" class="not-btn' +
              (not ? " on" : "") +
              '">not a control</button>'
            : "") +
          "</div>" +
          (!not
            ? '<div class="cls-controls"><div class="seg-row">' +
              catBtns +
              '</div><div class="seg-row">' +
              typeBtns +
              "</div></div>"
            : "") +
          (revealed ? '<p class="cls-why">' + esc(c.why) + "</p>" : "") +
          "</div>"
        );
      })
      .join("");

    return (
      '<div class="cls-layout"><div class="stack">' +
      (p.intro ? consoleLabel(p.intro) : "") +
      cards +
      "</div>" +
      '<div class="cls-side">' +
      '<div class="cls-side-box">' +
      consoleLabel("the grid · live") +
      CG.ui.matrixBoard(filled) +
      '<p class="cls-side-note">Cells light up as you pin cards correctly. ' +
      (p.allowNotControl ? "Red herrings belong outside the grid." : "") +
      "</p></div></div></div>"
    );
  }

  /* ─── EVIDENCE & REGISTER ────────────────────────────────────────────────── */

  function evidenceEngine(obj, answer, outcome) {
    var p = obj.payload;
    var sel = answer || {};
    return (
      '<div class="stack">' +
      p.items
        .map(function (it, idx) {
          var outcomeItem = outcome ? { ok: outcome.items[idx] ? outcome.items[idx].ok : false } : null;
          return (
            '<div class="subitem-card">' +
            '<div class="mb2">' +
            consoleLabel("control " + (idx + 1) + " / " + p.items.length, "text-[9px]") +
            '<p class="subitem-control">' +
            esc(it.control) +
            "</p>" +
            '<p class="subitem-question">' +
            esc(it.question) +
            "</p></div>" +
            itemOptionList(it.options, sel[it.id] || null, outcomeItem, "ev-pick", it.id) +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function registerEngine(obj, answer, outcome) {
    var p = obj.payload;
    var sel = answer || {};
    return (
      '<div class="stack">' +
      p.findings
        .map(function (f, idx) {
          var outcomeItem = outcome ? { ok: outcome.items[idx] ? outcome.items[idx].ok : false } : null;
          return (
            '<div class="subitem-card">' +
            '<div class="subitem-head">' +
            "<p>" +
            esc(f.text) +
            "</p>" +
            (f.tag ? '<span class="tag-badge">' + esc(f.tag) + "</span>" : "") +
            "</div>" +
            itemOptionList(f.options, sel[f.id] || null, outcomeItem, "reg-pick", f.id) +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  /* ─── DEPTH ──────────────────────────────────────────────────────────────── */

  function depthEngine(obj, answer, outcome) {
    var p = obj.payload;
    var picks = answer || [];
    var covered = new Set(
      // live display counts every pick (no pre-check leak); validation excludes distractors
      p.pool.filter(function (o) { return picks.includes(o.id); }).map(function (o) { return o.type; })
    );
    var distractorIds = {};
    p.pool.forEach(function (o) { if (o.distractor) distractorIds[o.id] = true; });

    var chips = CG.CONTROL_TYPES.map(function (t) {
      var on = covered.has(t);
      var required = p.requiredTypes.includes(t);
      return (
        '<span class="type-chip ' +
        (on ? "on" : required ? "req" : "idle") +
        '">' +
        (on ? "◆ " : required ? "◇ " : "· ") +
        esc(t) +
        "</span>"
      );
    }).join("");

    var pool = p.pool
      .map(function (o) {
        var on = picks.includes(o.id);
        var isDistractor = !!distractorIds[o.id];
        var revealed = !!outcome;
        var badDistractor = revealed && on && isDistractor;
        return (
          '<button type="button" data-action="depth-toggle" data-arg="' +
          esc(o.id) +
          '" data-fk="dp:' +
          esc(obj.id) +
          ":" +
          esc(o.id) +
          '" aria-pressed="' +
          (on ? "true" : "false") +
          '" class="depth-card ' +
          (badDistractor ? "v-bad" : isDistractor ? "is-distractor" : verdictCls(revealed, on ? true : null, on)) +
          '"><span class="depth-label">' +
          esc(o.label) +
          '</span><span class="depth-type">' +
          esc(o.type) +
          "</span></button>"
        );
      })
      .join("");

    var distractorMsgs = "";
    if (outcome) {
      distractorMsgs = picks
        .filter(function (id) { return distractorIds[id]; })
        .map(function (id) {
          var o = null;
          p.pool.forEach(function (x) { if (x.id === id) o = x; });
          return (
            '<p class="distractor-msg">Off-asset: ' +
            esc(o.label) +
            " — " +
            esc(o.distractorWhy) +
            "</p>"
          );
        })
        .join("");
    }

    return (
      "<div>" +
      '<div class="asset-card">' +
      consoleLabel("asset under defense", "text-[9px]") +
      '<p class="asset-name">' +
      esc(p.asset) +
      "</p>" +
      '<p class="asset-intro">' +
      esc(p.intro) +
      "</p></div>" +
      '<div class="chips-row" aria-label="Types covered so far">' +
      chips +
      '<span class="picks-count">' +
      picks.length +
      " picked · min " +
      p.minPicks +
      " · ◇ = required</span></div>" +
      '<div class="depth-grid">' +
      pool +
      "</div>" +
      distractorMsgs +
      "</div>"
    );
  }

  /* ─── ORDER ──────────────────────────────────────────────────────────────── */

  function orderEngine(obj, answer, outcome) {
    var p = obj.payload;
    var seq = answer && answer.length ? answer : p.presented.slice();
    var rows = seq
      .map(function (id, i) {
        var step = null;
        p.steps.forEach(function (s) { if (s.id === id) step = s; });
        var revealed = !!outcome;
        var ok = revealed ? p.correct[i] === id : null;
        return (
          '<div class="order-row ' +
          verdictCls(revealed, ok, true) +
          '">' +
          '<div class="order-inner">' +
          '<span class="order-num">' +
          (i + 1) +
          "</span>" +
          '<span class="order-label">' +
          esc(step.label) +
          "</span>" +
          '<span class="order-arrows">' +
          '<button type="button" data-action="order-move" data-arg="' +
          i +
          ":-1" +
          '" data-fk="ou:' +
          esc(obj.id) +
          ":" +
          i +
          '" aria-label="Move ' +
          esc(step.label) +
          ' up"' +
          (i === 0 ? " disabled" : "") +
          ' class="arrow-btn">' +
          icon("chevron-up", "icon-xs") +
          "</button>" +
          '<button type="button" data-action="order-move" data-arg="' +
          i +
          ":1" +
          '" data-fk="od:' +
          esc(obj.id) +
          ":" +
          i +
          '" aria-label="Move ' +
          esc(step.label) +
          ' down"' +
          (i === seq.length - 1 ? " disabled" : "") +
          ' class="arrow-btn">' +
          icon("chevron-down", "icon-xs") +
          "</button>" +
          "</span></div></div>"
        );
      })
      .join("");
    return (
      '<div class="stack-sm">' +
      consoleLabel("arrange top → bottom · use the arrows") +
      rows +
      "</div>"
    );
  }

  /* ─── WorkSurface wrapper ────────────────────────────────────────────────── */

  function workSurface(obj, mode, state, answer, setAnswer, outcome, onCheck, onNext, hasNext) {
    var station = null;
    CG.STATIONS.forEach(function (s) { if (s.id === obj.station) station = s; });
    var prog = state.progress[obj.id];
    var passed = !!(prog && prog.done);

    var engineHtml = "";
    switch (obj.payload.kind) {
      case "choose": engineHtml = chooseEngine(obj, answer, outcome); break;
      case "sort": engineHtml = sortEngine(obj, answer, outcome, passed); break;
      case "match": engineHtml = matchEngine(obj, answer, outcome, passed); break;
      case "classify": engineHtml = classifyEngine(obj, answer, outcome); break;
      case "evidence": engineHtml = evidenceEngine(obj, answer, outcome); break;
      case "register": engineHtml = registerEngine(obj, answer, outcome); break;
      case "depth": engineHtml = depthEngine(obj, answer, outcome); break;
      case "order": engineHtml = orderEngine(obj, answer, outcome); break;
    }

    var actionBar = "";
    if (!passed) {
      actionBar +=
        '<button type="button" data-action="run-check" class="btn btn-primary btn-run">' +
        icon("scan-search", "icon-sm") +
        " Run check</button>";
    } else {
      actionBar +=
        '<span class="complete-chip">' +
        icon("check", "icon-xs") +
        " Objective complete" +
        (prog && prog.attempts > 1 ? " · " + prog.attempts + " checks" : " · first attempt") +
        "</span>";
      if (mode === "medium" && hasNext) {
        actionBar +=
          '<button type="button" data-action="next-objective" class="btn btn-primary">Next objective ' +
          icon("chevron-right", "icon-xs") +
          "</button>";
      }
    }
    if (outcome && !passed && prog && prog.attempts > 0) {
      actionBar +=
        '<span class="check-counter">check #' + prog.attempts + " · wrong answers teach, they never block</span>";
    }

    return (
      "<div>" +
      '<div class="ws-meta">' +
      CG.ui.stationBadge(station) +
      consoleLabel("obj " + obj.id) +
      CG.ui.pillarBadge(obj.pillar) +
      (passed
        ? '<span class="done-chip">' + icon("check", "icon-xs") + " complete</span>"
        : "") +
      "</div>" +
      '<h2 class="ws-title">' +
      esc(obj.title) +
      "</h2>" +
      '<p class="ws-prompt">' +
      esc(obj.prompt) +
      "</p>" +
      '<div class="ws-engine">' +
      engineHtml +
      "</div>" +
      '<div class="ws-actions">' +
      actionBar +
      "</div>" +
      (outcome ? CG.ui.feedbackBlock(outcome) : "") +
      "</div>"
    );
  }

  /* ─── Export ─────────────────────────────────────────────────────────────── */

  CG.engines = {
    ensureEngineUi: ensureEngineUi,
    workSurface: workSurface,
  };
})();
