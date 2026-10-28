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

  /* Transient engine state (never persisted — same as React component state).
     `checked` marks the "just ran the check" visit: R2 one-shot freezes the
     answer from the check press until the student leaves the objective. */
  var engineUi = { selTile: null, selLeft: null, forObj: null, checked: false };

  function ensureEngineUi(objId) {
    if (engineUi.forObj !== objId) {
      engineUi = { selTile: null, selLeft: null, forObj: objId, checked: false };
    }
    return engineUi;
  }

  /** R2 one-shot: mark the objective as checked-this-visit (freezes it). */
  function markChecked(objId) {
    ensureEngineUi(objId);
    engineUi.checked = true;
  }

  /** True when the answer must not change: objective passed, or the check was
      run during this visit (failed checks freeze too — revisit to retry). */
  function isFrozen(objId) {
    var s = CG.state.getState();
    var prog = s.progress[objId];
    if (prog && prog.done) return true;
    return engineUi.forObj === objId && engineUi.checked;
  }

  /* R6 pairing shuffle: Fisher-Yates over the right-column display order.
     Answers are stored by id, so shuffling is purely presentational. A
     mount-time shuffle re-applies every time the engine remounts (objective
     switch / revisit) — engineUi is the static-port analog of component state. */
  function shuffled(items) {
    var arr = items.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  /** Mount-time display order for the match right column, with a guard that
      re-shuffles if the shuffle happens to reproduce a sequential reveal. */
  function shuffledRights(p, ui) {
    if (ui.rightsOrder) return ui.rightsOrder;
    var out = p.rights;
    for (var tries = 0; tries < 10; tries++) {
      out = shuffled(p.rights);
      var sequential = p.lefts.every(function (l, i) {
        return out[i] && p.correct[l.id] === out[i].id;
      });
      if (!sequential || p.rights.length < 3) break;
    }
    ui.rightsOrder = out;
    return out;
  }

  /* ─── Shared option list (evidence + register sub-items) ───────────────── */

  function itemOptionList(options, selected, outcomeItem, action, argPrefix, locked) {
    return (
      '<div class="stack-sm">' +
      options
        .map(function (o) {
          var isSel = selected === o.id;
          // R3 color contract: only the SELECTED option receives a verdict
          // color (green if correct, red if wrong). Unselected options stay
          // neutral — no green on unselected wrong options, no reveal of the
          // correct option on a wrong submission, no false highlight on an
          // empty check.
          var revealed = !!outcomeItem && isSel;
          var ok = isSel && !!outcomeItem ? outcomeItem.ok : null;
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
            '"' +
            (locked ? ' aria-disabled="true"' : "") +
            ' class="opt-row ' +
            verdictCls(revealed, ok, isSel) +
            (locked ? " is-locked" : "") +
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

  function chooseEngine(obj, answer, outcome, passed) {
    var p = obj.payload;
    var sel = answer || [];
    // R2: a checked (passed) answer is locked — no control may edit it afterwards.
    var locked = !!passed;
    return (
      "<div>" +
      (p.multi ? '<div class="mb2">' + consoleLabel("multi-select — pick the exact set") + "</div>" : "") +
      '<div class="stack-sm">' +
      p.options
        .map(function (o) {
          var selected = sel.includes(o.id);
          // R3 color contract: only the SELECTED option receives a verdict color
          // (green if it is correct, red if it is wrong). Unselected options stay
          // neutral — no green on unselected wrong options, no reveal of the
          // correct option on a wrong submission, no false highlight on an empty
          // check.
          var revealed = !!outcome && selected;
          var ok = selected && !!outcome ? !!o.correct : null;
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
            '"' +
            (locked ? ' aria-disabled="true"' : "") +
            ' class="opt-row opt-row-lg ' +
            verdictCls(revealed, ok, selected) +
            (locked ? " is-locked" : "") +
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
            (revealed && selected ? '<p class="opt-why">' + esc(o.why) + "</p>" : "") +
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

    var rightsOrder = shuffledRights(p, ui);
    var rights = rightsOrder
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

  function classifyEngine(obj, answer, outcome, passed) {
    var p = obj.payload;
    var cls = answer || {};
    // R2: freeze a passed classification — no chip or NOT-A-CONTROL edit afterwards.
    var locked = !!passed;
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
            '"' +
            (locked ? ' aria-disabled="true"' : "") +
            ' class="seg-btn ' +
            segmentedCls(revealed && !!got.cat && !!got.type, okCls, sel) +
            (locked ? " is-locked" : "") +
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
            '"' +
            (locked ? ' aria-disabled="true"' : "") +
            ' class="seg-btn ' +
            segmentedCls(revealed && !!got.cat && !!got.type, okCls, sel) +
            (locked ? " is-locked" : "") +
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
              '"' +
              (locked ? ' aria-disabled="true"' : "") +
              ' class="not-btn' +
              (not ? " on" : "") +
              (locked ? " is-locked" : "") +
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

  function evidenceEngine(obj, answer, outcome, passed) {
    var p = obj.payload;
    var sel = answer || {};
    var locked = !!passed; // R2: passed objectives are frozen
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
            itemOptionList(it.options, sel[it.id] || null, outcomeItem, "ev-pick", it.id, locked) +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function registerEngine(obj, answer, outcome, passed) {
    var p = obj.payload;
    var sel = answer || {};
    var locked = !!passed; // R2: passed objectives are frozen
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
            itemOptionList(f.options, sel[f.id] || null, outcomeItem, "reg-pick", f.id, locked) +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  /* ─── DEPTH ──────────────────────────────────────────────────────────────── */

  function depthEngine(obj, answer, outcome, passed) {
    var p = obj.payload;
    var picks = answer || [];
    var locked = !!passed; // R2: freeze a passed plan
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
          '"' +
          (locked ? ' aria-disabled="true"' : "") +
          ' class="depth-card ' +
          (badDistractor ? "v-bad" : isDistractor ? "is-distractor" : verdictCls(revealed, on ? true : null, on)) +
          (locked ? " is-locked" : "") +
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

  function orderEngine(obj, answer, outcome, passed) {
    var p = obj.payload;
    var seq = answer && answer.length ? answer : p.presented.slice();
    var locked = !!passed; // R2: freeze a validated sequence
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
          (i === 0 || locked ? " disabled" : "") +
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
          (i === seq.length - 1 || locked ? " disabled" : "") +
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

  function workSurface(obj, mode, state, answer, setAnswer, outcome, onCheck, onNext) {
    var station = null;
    CG.STATIONS.forEach(function (s) { if (s.id === obj.station) station = s; });
    var prog = state.progress[obj.id];
    var passed = !!(prog && prog.done);
    // R2 one-shot mechanics: bind transient state to THIS objective (resets on
    // objective switch / reload), then freeze from the check press — pass OR
    // fail. A failed objective becomes editable again when revisited from the
    // Case Rail, so the lab stays winnable while honoring the lock.
    ensureEngineUi(obj.id);
    var justChecked = engineUi.checked;
    var frozen = passed || justChecked;

    var engineHtml = "";
    switch (obj.payload.kind) {
      case "choose": engineHtml = chooseEngine(obj, answer, outcome, frozen); break;
      case "sort": engineHtml = sortEngine(obj, answer, outcome, frozen); break;
      case "match": engineHtml = matchEngine(obj, answer, outcome, frozen); break;
      case "classify": engineHtml = classifyEngine(obj, answer, outcome, frozen); break;
      case "evidence": engineHtml = evidenceEngine(obj, answer, outcome, frozen); break;
      case "register": engineHtml = registerEngine(obj, answer, outcome, frozen); break;
      case "depth": engineHtml = depthEngine(obj, answer, outcome, frozen); break;
      case "order": engineHtml = orderEngine(obj, answer, outcome, frozen); break;
    }

    // Another objective later in Case Rail order?
    var objectives = CG.state.objectivesForMode(mode);
    var myIdx = -1;
    for (var ri = 0; ri < objectives.length; ri++) if (objectives[ri].id === obj.id) { myIdx = ri; break; }
    var hasLater = myIdx > -1 && myIdx < objectives.length - 1;

    var actionBar = "";
    if (!passed) {
      if (justChecked) {
        // Checked this visit (failed): answer locked, teaching feedback below.
        actionBar +=
          '<span class="check-counter">check #' + prog.attempts + " · answer locked — revisit this objective from the Case Rail to retry</span>";
        if (hasLater) {
          actionBar +=
            '<button type="button" data-action="advance-objective" class="btn btn-primary">Next objective ' +
            icon("chevron-right", "icon-xs") +
            "</button>";
        }
      } else {
        actionBar +=
          '<button type="button" data-action="run-check" class="btn btn-primary btn-run">' +
          icon("scan-search", "icon-sm") +
          " Run check</button>";
        if (outcome && prog && prog.attempts > 0) {
          actionBar +=
            '<span class="check-counter">check #' + prog.attempts + " · wrong answers teach, they never block</span>";
        }
      }
    } else {
      actionBar +=
        '<span class="complete-chip">' +
        icon("check", "icon-xs") +
        " Objective complete" +
        (prog && prog.attempts > 1 ? " · " + prog.attempts + " checks" : " · first attempt") +
        "</span>";
      if (hasLater) {
        actionBar +=
          '<button type="button" data-action="next-objective" class="btn btn-primary">Next objective ' +
          icon("chevron-right", "icon-xs") +
          "</button>";
      }
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
    markChecked: markChecked,
    isFrozen: isFrozen,
    workSurface: workSurface,
  };
})();
