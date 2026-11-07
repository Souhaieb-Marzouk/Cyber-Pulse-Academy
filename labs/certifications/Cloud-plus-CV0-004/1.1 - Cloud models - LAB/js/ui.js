/* =========================================================================
   The Engagement Desk — static port (js/ui.js)
   -------------------------------------------------------------------------
   Rendering helpers + shared components (ports of ui-bits.tsx and
   instrument-bits.tsx). Pure template functions: they return HTML strings.
   Interactivity is delegated through data-act attributes (wired in js/app.js).
   ========================================================================= */

(function () {
  "use strict";

  var D = window.LabData;

  // ---------- esc: HTML-escape untrusted-ish content (all lab text) ----------

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---------- seeded shuffle (port of src/lib/lab/shuffle.ts, audit R6) ----
  // Same seed always yields the same order, so the shuffle is stable across
  // renders, reloads and persisted sessions, and needs no extra state.

  function hashSeed(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(items, seed) {
    var rand = mulberry32(hashSeed(seed));
    var out = items.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  // ---------- icons ----------

  function icon(name, cls) {
    return '<svg class="icon ' + (cls || "") + '" aria-hidden="true" focusable="false"><use href="#' + name + '"></use></svg>';
  }

  // ---------- small shared bits (ui-bits.tsx) ----------

  function term(text, glossaryTerm) {
    var entry = null;
    for (var i = 0; i < D.GLOSSARY.length; i++) {
      if (D.GLOSSARY[i].term.toLowerCase() === glossaryTerm.toLowerCase()) {
        entry = D.GLOSSARY[i];
        break;
      }
    }
    if (!entry) return text; // trusted lab-authored content (same as React children)
    return (
      '<span class="glossary-term" tabindex="0" role="doc-tip" aria-label="' +
      esc(entry.term + ": " + entry.def) +
      '" data-tip="' +
      esc(entry.term + ". " + entry.def) +
      '">' +
      text + // lab-authored HTML/plain text (never user input)
      "</span>"
    );
  }

  var PILLAR_VAR = { P1: "model-private", P2: "model-hybrid", P3: "model-community", P4: "model-multi" };

  function pillarBadge(pillar, cls) {
    return (
      '<span class="pillar-badge pillar-' +
      pillar +
      (cls ? " " + cls : "") +
      '">' +
      pillar +
      " · " +
      esc(D.PILLAR_LABEL[pillar]) +
      "</span>"
    );
  }

  function modelDot(model, cls) {
    return '<span class="model-dot' + (cls ? " " + cls : "") + '" style="background-color:var(--model-' + model + ')" aria-hidden="true"></span>';
  }

  function stampVerdict(pass, label) {
    return (
      '<span role="img" aria-label="' +
      (pass ? "Approved" : "Rejected") +
      '" class="stamp-anim stamp ' +
      (pass ? "stamp-green" : "stamp-red") +
      '">' +
      (label || (pass ? "Approved" : "Rejected")) +
      "</span>"
    );
  }

  function syntheticTag(cls) {
    return '<span class="synthetic-tag' + (cls ? " " + cls : "") + '">Training data · synthetic</span>';
  }

  function progressDial(pct) {
    var size = 44;
    var stroke = 4;
    var r = (size - stroke) / 2;
    var c = 2 * Math.PI * r;
    var filled = (Math.min(100, Math.max(0, pct)) / 100) * c;
    return (
      '<div class="dial" role="img" aria-label="Progress ' + pct + '%">' +
      '<svg width="' + size + '" height="' + size + '" class="dial-svg" aria-hidden="true">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--secondary)" stroke-width="' + stroke + '"></circle>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--primary)" stroke-width="' + stroke +
      '" stroke-dasharray="' + filled + " " + (c - filled) + '" stroke-linecap="round" class="dial-arc"></circle>' +
      "</svg>" +
      '<span class="dial-num">' + pct + "%</span>" +
      "</div>"
    );
  }

  function stars(n, cls) {
    var out = "";
    for (var i = 1; i <= 3; i++) {
      out +=
        '<svg class="icon star' +
        (i <= n ? " star-on" : "") +
        (cls ? " " + cls : "") +
        '" aria-hidden="true"><use href="#ic-star"></use></svg>';
    }
    return out;
  }

  function sectionTitle(kicker, title, sub) {
    return (
      '<div class="section-title">' +
      (kicker ? '<p class="kicker">' + esc(kicker) + "</p>" : "") +
      '<h2 class="section-h">' + esc(title) + "</h2>" +
      (sub ? '<p class="section-sub">' + esc(sub) + "</p>" : "") +
      "</div>"
    );
  }

  // ---------- workbench components (instrument-bits.tsx) ----------

  /** Single-select chip group. `envField` + `envKey` identify the state slot. */
  function optionChips(opts) {
    var shown = opts.shuffleKey ? seededShuffle(opts.options, opts.shuffleKey) : opts.options;
    var html = '<div role="radiogroup" aria-label="' + esc(opts.label) + '" class="chips' + (opts.columns ? " chips-col" : "") + '">';
    for (var i = 0; i < shown.length; i++) {
      var o = shown[i];
      var active = opts.value === o.id;
      html +=
        '<button type="button" role="radio" aria-checked="' + active + '" data-act="env-chip" data-env="' + esc(opts.envField) +
        '" data-key="' + esc(opts.envKey) + '" data-val="' + esc(o.id) +
        '" class="chip' + (active ? " chip-on" : "") + '">' + esc(o.text) + "</button>";
    }
    return html + "</div>";
  }

  function multiChips(opts) {
    var html = '<div role="group" aria-label="' + esc(opts.label) + '" class="chips chips-col">';
    for (var i = 0; i < opts.options.length; i++) {
      var o = opts.options[i];
      var active = opts.values.indexOf(o.id) >= 0;
      html +=
        '<button type="button" aria-pressed="' + active + '" data-act="' + opts.act + '" data-arg="' + esc(o.id) +
        '" class="chip chip-multi' + (active ? " chip-on" : "") + '">' +
        '<span class="chip-box' + (active ? " chip-box-on" : "") + '" aria-hidden="true">' + (active ? "✓" : "") + "</span>" +
        "<span>" + esc(o.text) + "</span></button>";
    }
    return html + "</div>";
  }

  function panelQs(qs, values, envField, shufflePrefix) {
    var html = '<div class="stack-4">';
    for (var i = 0; i < qs.length; i++) {
      var q = qs[i];
      html +=
        '<div class="panel-card"><p class="panel-q">' + esc(q.prompt) + "</p>" +
        optionChips({
          options: q.options,
          value: values[q.id],
          onChange: null,
          label: q.prompt,
          envField: envField,
          envKey: q.id,
          shuffleKey: shufflePrefix ? shufflePrefix + "-" + q.id : null,
        }) +
        "</div>";
    }
    return html + "</div>";
  }

  function modelStampRow(value, act, extraArg) {
    var html = '<div role="radiogroup" aria-label="Recommended model" class="chips">';
    for (var i = 0; i < D.MODELS.length; i++) {
      var m = D.MODELS[i];
      var active = value === m.id;
      html +=
        '<button type="button" role="radio" aria-checked="' + active + '" data-act="' + act + '" data-val="' + m.id + '"' +
        (extraArg ? " " + extraArg : "") +
        ' class="chip chip-stamp' + (active ? " chip-on" : "") + '"' +
        (active ? ' style="box-shadow:inset 0 0 0 1.5px var(--model-' + m.id + ')"' : "") +
        '><span class="model-dot" style="background-color:var(--model-' + m.id + ')" aria-hidden="true"></span>' +
        esc(D.MODEL_LABELS[m.id]) + "</button>";
    }
    return html + "</div>";
  }

  function placementBoard(workloads, targets, value, envField) {
    var html =
      '<div class="stack-3">' +
      '<div class="note-box">Assign each workload a home. Attribute chips are your evidence; hover a target for its description.</div>';
    for (var i = 0; i < workloads.length; i++) {
      var w = workloads[i];
      html += '<div class="panel-card"><div class="placement-head"><div>' +
        '<p class="workload-name"><span class="workload-id">' + esc(w.id.toUpperCase()) + "</span>" + esc(w.name) + "</p>" +
        '<p class="workload-note">' + esc(w.note) + "</p></div>" +
        '<div class="attr-chips">';
      for (var a = 0; a < w.attrs.length; a++) html += '<span class="attr-chip">' + esc(w.attrs[a]) + "</span>";
      html += "</div></div>";
      html += '<div role="radiogroup" aria-label="Placement for ' + esc(w.name) + '" class="chips">';
      var shuffled = seededShuffle(targets, "place-" + w.id);
      for (var t = 0; t < shuffled.length; t++) {
        var tg = shuffled[t];
        var active = value[w.id] === tg.id;
        html +=
          '<button type="button" role="radio" aria-checked="' + active + '" aria-label="' + esc(tg.name + ". " + tg.desc) +
          '" title="' + esc(tg.desc) + '" data-act="env-chip" data-env="' + envField + '" data-key="' + esc(w.id) +
          '" data-val="' + esc(tg.id) + '" class="chip chip-target' + (active ? " chip-on chip-target-on" : "") + '">' +
          esc(tg.name) + "</button>";
      }
      html += "</div></div>";
    }
    return html + "</div>";
  }

  function miniModelStrip() {
    var html = '<div class="model-strip">';
    for (var i = 0; i < D.MODELS.length; i++) {
      var m = D.MODELS[i];
      html += term(
        '<span class="model-strip-chip"><span class="model-dot model-dot-xs" style="background-color:var(--model-' +
          m.id +
          ')" aria-hidden="true"></span>' +
          esc(D.MODEL_LABELS[m.id]) +
          "</span>",
        m.name
      );
    }
    return html + "</div>";
  }

  /** Document viewer (DocViewer.tsx) — optional per-line tagging. */
  function docViewer(doc, taggable, tagged, toggleAct) {
    var tagCount = 0;
    for (var i = 0; i < doc.lines.length; i++) if (doc.lines[i].id) tagCount++;
    var html =
      '<article class="doc-paper doc-viewer" aria-label="Document ' + esc(doc.code) + ": " + esc(doc.title) + '">' +
      '<header class="doc-head"><div class="doc-head-l">' +
      '<span class="doc-code">' + esc(doc.code) + "</span>" +
      '<h4 class="doc-title">' + esc(doc.title) + "</h4></div>" +
      '<div class="doc-head-r">' + syntheticTag() +
      (taggable
        ? '<span class="doc-tagged" aria-live="polite">tagged ' + (tagged ? tagged.length : 0) + "/" + tagCount + "</span>"
        : "") +
      "</div></header>" +
      '<div class="doc-body">' +
      (doc.from
        ? '<p class="doc-from">' + esc(doc.from) + " · " + esc(doc.date) + "</p>"
        : "") +
      '<ul class="doc-lines">';
    for (var j = 0; j < doc.lines.length; j++) {
      var line = doc.lines[j];
      var isTag = taggable && !!line.id;
      var isOn = !!line.id && tagged && tagged.indexOf(line.id) >= 0;
      if (isTag) {
        html +=
          '<li><button type="button" class="tag-line' + (isOn ? " tag-on" : "") + '" data-tagged="' + isOn +
          '" aria-pressed="' + isOn + '" data-act="' + toggleAct + '" data-arg="' + esc(line.id) + '">' +
          esc(line.text) + "</button></li>";
      } else {
        html += '<li class="doc-muted">' + esc(line.text) + "</li>";
      }
    }
    return html + "</ul></div></article>";
  }

  // Export
  window.LabUI = {
    esc: esc,
    seededShuffle: seededShuffle,
    icon: icon,
    term: term,
    pillarBadge: pillarBadge,
    modelDot: modelDot,
    stampVerdict: stampVerdict,
    syntheticTag: syntheticTag,
    progressDial: progressDial,
    stars: stars,
    sectionTitle: sectionTitle,
    optionChips: optionChips,
    multiChips: multiChips,
    panelQs: panelQs,
    modelStampRow: modelStampRow,
    placementBoard: placementBoard,
    miniModelStrip: miniModelStrip,
    docViewer: docViewer,
  };
})();
