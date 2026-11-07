// ─── Blueprint Studio · shared drafting-room UI primitives (static port) ────
// Vanilla-JS translation of ui-bits.tsx + small dialog helpers.
// All builders return HTML strings; dynamic values are escaped.
// Icons come from window.BlueprintIcons (inline Lucide SVG).

(function () {
  'use strict';

  var BI = window.BlueprintIcons;
  var Store = window.LabStore;

  /** Escape a string for safe HTML interpolation. */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  /** Escape for use inside a double-quoted attribute. */
  function attr(s) {
    return esc(s).replace(/\n/g, ' ');
  }

  function icon(name, cls, filled) {
    return BI.icon(name, cls, filled);
  }

  // ── Small components ───────────────────────────────────────────────────────

  function pillarBadge(pillar) {
    var label = Store.PILLAR_LABEL[pillar];
    return (
      '<span class="pillar-badge pillar-' + pillar.toLowerCase() + '" title="' + attr(label) + '">' +
      esc(pillar) + '·' + esc(label) +
      '</span>'
    );
  }

  function draftStamp(kind, label) {
    var cls = kind === 'pass' ? 'stamp-pass' : kind === 'fail' ? 'stamp-fail' : 'stamp-muted';
    return '<span class="draft-stamp ' + cls + '">' + esc(label) + '</span>';
  }

  function blockHead(kicker, title) {
    return (
      '<div class="blockhead">' +
      '<p class="kicker">' + esc(kicker) + '</p>' +
      '<h3>' + esc(title) + '</h3>' +
      '</div>'
    );
  }

  function sheetFrame(no, title, sub, inner) {
    return (
      '<section class="sheet-frame" aria-label="Sheet ' + esc(no) + ': ' + esc(title) + '">' +
      '<div class="crop-marks" aria-hidden="true">┐ ┌</div>' +
      '<div class="sheet-head">' +
      '<div>' +
      '<p class="no">SHEET ' + esc(no) + '</p>' +
      '<h2>' + esc(title) + '</h2>' +
      '</div>' +
      (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') +
      '</div>' +
      inner +
      '</section>'
    );
  }

  /**
   * Labeled select (FieldSelect).
   * @param {object} o {label, value, options:[{value,label}], envPath, ariaLabel}
   *   envPath — store path applied on change, e.g. "h3Cause" or "planAnswers.add#num"
   */
  function fieldSelect(o) {
    var opts = '';
    opts += '<option value="" disabled' + (o.value === null || o.value === undefined || o.value === '' ? ' selected' : '') + '>— select —</option>';
    for (var i = 0; i < o.options.length; i++) {
      var op = o.options[i];
      var sel = String(o.value) === String(op.value) ? ' selected' : '';
      opts += '<option value="' + attr(op.value) + '"' + sel + '>' + esc(op.label) + '</option>';
    }
    return (
      '<label class="field">' +
      '<span>' + esc(o.label) + '</span>' +
      '<select class="sel" data-env="' + attr(o.envPath) + '" aria-label="' + attr(o.ariaLabel || o.label) + '">' +
      opts +
      '</select>' +
      '</label>'
    );
  }

  /** Radix-style switch as a real button (role="switch"). */
  function switchEl(checked, envKey, ariaLabel, extraCls) {
    return (
      '<button type="button" class="switch ' + (extraCls || '') + '" role="switch" data-fid="sw-' + attr(envKey) + '"' +
      ' aria-checked="' + (checked ? 'true' : 'false') + '" aria-label="' + attr(ariaLabel) + '"' +
      ' data-act="switch" data-switch="' + attr(envKey) + '">' +
      '<span class="thumb"></span>' +
      '</button>'
    );
  }

  // ── Hint stack (medium 3 tiers · hard 1 paid nudge) ────────────────────────

  function hintStack(obj, st) {
    var s = Store.getState();
    var used = st ? st.hintsUsed : 0;
    var max = s.mode === 'hard' ? 1 : obj.hints.length; // hard contract: ONE paid nudge
    var spent = st ? st.hintsUsed : 0;
    var html = '<div class="mt-2 hint-area">';
    if (used < max) {
      html +=
        '<button type="button" class="btn btn-hint" data-act="use-hint" data-id="' + attr(obj.id) + '"' +
        ' data-fid="hint-' + attr(obj.id) + '" aria-label="Reveal hint for ' + attr(obj.id) + '">' +
        icon('lightbulb', 'ic-14') +
        (s.mode === 'hard' ? 'TAKE NUDGE (−5 SCORE)' : 'HINT ' + (spent + 1) + '/' + max) +
        '</button>';
    }
    if (spent > 0) {
      html += '<ul class="hint-list" aria-live="polite">';
      for (var i = 0; i < spent && i < obj.hints.length; i++) {
        html += '<li>TIER ' + (i + 1) + ' ▸ ' + esc(obj.hints[i]) + '</li>';
      }
      html += '</ul>';
    }
    html += '</div>';
    return html;
  }

  // ── Objective card with CHECK RESULTS engine ───────────────────────────────
  // feedbackFor: per-objective transient feedback captured by the renderer
  // (mirrors the original's local `feedback` state + non-persisted lastCheck).

  function objectiveCard(obj, compact, uiFeedback) {
    var s = Store.getState();
    var st = s.objectives[obj.id];
    var pass = st && st.done;
    var myLast = s.lastCheck && s.lastCheck.id === obj.id ? s.lastCheck.outcome : null;
    var fb = uiFeedback || null;

    var cls = 'obj-card' + (pass ? ' passed' : '') + (compact ? ' obj-card-compact' : '');
    var html = '<article class="' + cls + '" aria-label="' + attr(obj.id + ': ' + obj.title) + '">';

    html += '<div class="obj-card-top">';
    html += '<span class="obj-id">' + esc(obj.id) + '</span>';
    html += pillarBadge(obj.pillar);
    if (pass) html += draftStamp('pass', 'PASSED');
    if (!pass && st && st.lastResult === 'fail') html += draftStamp('fail', 'REJECTED');
    html += '</div>';

    html += '<h3 class="obj-title">' + esc(obj.title) + '</h3>';
    html += '<p class="obj-text">' + esc(obj.text) + '</p>';
    if (!compact) html += '<p class="obj-anchor">ANCHOR ▸ ' + esc(obj.anchor) + '</p>';
    if (s.mode === 'medium' && obj.where && !pass) {
      html += '<p class="obj-where">WHERE TO LOOK ▸ ' + esc(obj.where) + '</p>';
    }

    html += '<div class="obj-actions">';
    html +=
      '<button type="button" class="btn btn-check" data-act="check-obj" data-id="' + attr(obj.id) + '"' +
      ' data-fid="check-' + attr(obj.id) + '"' + (pass ? ' disabled' : '') + '>' +
      icon('stamp', 'ic-14') + (pass ? 'STAMPED' : 'CHECK RESULTS') +
      '</button>';
    if (obj.goTo && !pass) {
      html +=
        '<button type="button" class="btn btn-goto" data-act="goto-tool" data-id="' + attr(obj.id) + '"' +
        ' data-fid="goto-' + attr(obj.id) + '">GO TO TOOL ' + icon('chevron-right', 'ic-14') + '</button>';
    }
    if (st && st.attempts > 0) {
      html += '<span class="obj-counters">ATTEMPTS ' + st.attempts +
        (st.hintsUsed > 0 ? ' · HINTS ' + st.hintsUsed : '') + '</span>';
    }
    html += '</div>';

    var showFb = fb || myLast;
    if (showFb) {
      var isPass = pass || (myLast && myLast.pass);
      var msg = (fb && fb.msg) || (myLast && myLast.message) || (pass ? obj.success : '');
      html +=
        '<div class="obj-feedback ' + (isPass ? 'pass' : 'fail') + '" aria-live="polite">' +
        icon(isPass ? 'check' : 'x', 'ic-14 inline-ic') + ' ' + esc(msg) +
        '</div>';
    }

    if (!pass) html += hintStack(obj, st);
    html += '</article>';
    return html;
  }

  // ── Progress ring (Sheet 04) ───────────────────────────────────────────────

  function progressRing(pct) {
    var r = 26;
    var c = 2 * Math.PI * r;
    var offset = c - (c * pct) / 100;
    var stroke = pct === 100 ? '#7BC796' : '#E9B44C';
    return (
      '<svg width="72" height="72" viewBox="0 0 72 72" role="img" aria-label="Progress: ' + pct + '%">' +
      '<circle cx="36" cy="36" r="' + r + '" fill="none" stroke="#A7C7E8" stroke-opacity="0.2" stroke-width="6"></circle>' +
      '<circle cx="36" cy="36" r="' + r + '" fill="none" stroke="' + stroke + '" stroke-width="6"' +
      ' stroke-dasharray="' + c + '" stroke-dashoffset="' + offset + '" transform="rotate(-90 36 36)" stroke-linecap="butt"></circle>' +
      '<text x="36" y="40" text-anchor="middle" font-size="14" font-family="monospace" fill="#D8E9FA">' + pct + '%</text>' +
      '</svg>'
    );
  }

  window.BP = {
    esc: esc,
    attr: attr,
    icon: icon,
    pillarBadge: pillarBadge,
    draftStamp: draftStamp,
    blockHead: blockHead,
    sheetFrame: sheetFrame,
    fieldSelect: fieldSelect,
    switchEl: switchEl,
    hintStack: hintStack,
    objectiveCard: objectiveCard,
    progressRing: progressRing,
  };
})();
