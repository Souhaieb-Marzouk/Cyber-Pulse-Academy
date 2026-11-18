// ── The Access Bureau — shared bureau-styled UI atoms ─────────────────────
// Vanilla re-implementation of the original lab's ui.tsx atoms
// (StampButton, Term, OrderRail, Choice, StampMark) plus small render helpers.
// All components emit HTML strings; interactions are wired by delegated
// event handlers in js/app.js through data-action attributes.
'use strict';
(function (global) {
  const ABIcons = global.ABIcons;
  const ABData = global.ABData;

  /** Escape a string for safe interpolation into HTML. */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Lucide icon wrapper (inline SVG, no fonts/CDNs). */
  function icon(name, cls) { return ABIcons.icon(name, cls); }

  /** CTA of every work order — the rubber stamp. */
  function stampButton(opts) {
    const disabled = !!opts.disabled;
    return '<button type="button" data-action="' + esc(opts.action || 'stamp') + '"' +
      (opts.id ? ' data-id="' + esc(opts.id) + '"' : '') +
      (opts.ariaLabel ? ' aria-label="' + esc(opts.ariaLabel) + '"' : ' aria-label="Stamp — check result"') +
      (disabled ? ' disabled' : '') +
      ' class="btn-stamp' + (disabled ? ' btn-stamp--disabled' : '') + '">' +
      icon('Stamp', 'ic-16') + '<span>Stamp</span></button>';
  }

  /** Rotated pass/deny stamp mark. */
  function stampMark(kind) {
    const red = kind === 'no';
    return '<span role="status" class="stamp-mark ' + (red ? 'stamp-mark--no' : 'stamp-mark--ok') + '">' +
      (red ? 'deny' : 'pass') + '</span>';
  }

  /** Pressable single/multi choice chip (aria-pressed). */
  function choice(opts) {
    let toneCls = 'choice--amber';
    if (opts.tone === 'good') toneCls = 'choice--good';
    else if (opts.tone === 'bad') toneCls = 'choice--bad';
    const selected = !!opts.selected;
    return '<button type="button" aria-pressed="' + selected + '"' +
      (opts.action ? ' data-action="' + esc(opts.action) + '"' : '') +
      (opts.dataId ? ' data-id="' + esc(opts.dataId) + '"' : '') +
      (opts.tone ? ' data-tone="choice--' + esc(opts.tone) + '"' : '') +
      ' class="choice ' + (selected ? 'choice--selected ' + toneCls : 'choice--idle') + '">' +
      (opts.label != null ? esc(opts.label) : '') +
      (opts.html || '') + '</button>';
  }

  /** Click-to-order ledger strip: pool of unplaced items + ordered rail.
   *  kind: 'lifecycle' | 'saml' | 'rollout' — handled by the stations module. */
  function orderRail(opts) {
    const poolHtml = opts.pool.length === 0
      ? '<p class="rail-empty">All lines placed on the rail.</p>'
      : '<ul class="pool-list">' + opts.pool.map(function (it) {
          return '<li><button type="button" data-action="order-pick" data-kind="' + esc(opts.kind) + '" data-id="' + esc(it.id) + '" class="pool-item">' + esc(it.label) + '</button></li>';
        }).join('') + '</ul>';
    const railHtml = opts.ordered.length === 0
      ? '<p class="rail-empty rail-empty--dark">Tap lines in order…</p>'
      : '<ol class="rail-list">' + opts.ordered.map(function (it, i) {
          return '<li><button type="button" data-action="order-remove" data-kind="' + esc(opts.kind) + '" data-id="' + esc(it.id) + '" aria-label="Remove step ' + (i + 1) + '" class="rail-item">' +
            '<span class="rail-item-no">' + String(i + 1).padStart(2, '0') + '</span><span class="flex1">' + esc(it.label) + '</span></button></li>';
        }).join('') + '</ol>';
    return '<div class="order-rail">' +
      '<div aria-label="Unordered steps pool" class="order-pool">' +
      '<p class="rail-cap rail-cap--pool">Loose ledger lines</p>' + poolHtml + '</div>' +
      '<div aria-label="Ordered sequence rail" class="order-seq">' +
      '<p class="rail-cap rail-cap--seq">Sequence rail — click to remove</p>' + railHtml + '</div>' +
      '</div>';
  }

  /** Glossary term trigger — underlined dashed; hover or click shows the
   *  definition tooltip. Closes on re-click, ESC and outside click (parity). */
  function term(glossKey, innerHtml) {
    const def = ABData.GLOSSARY[glossKey];
    if (!def) return innerHtml || esc(glossKey);
    return '<span class="term" data-term-root data-term="' + esc(glossKey) + '">' +
      '<button type="button" class="term-btn" aria-label="Definition of ' + esc(glossKey) + ': ' + esc(def) + '" aria-expanded="false">' +
      (innerHtml || esc(glossKey)) + '</button></span>';
  }

  function termTooltipHtml(def) {
    return '<span role="tooltip" class="term-tip">' + esc(def) + '</span>';
  }

  /** Styled <select> with a shared class + optional label. */
  function selectHtml(opts) {
    let out = '';
    if (opts.labelHtml) out += '<label for="' + esc(opts.id) + '" class="' + esc(opts.labelClass || 'lbl') + '">' + opts.labelHtml + '</label>';
    out += '<select id="' + esc(opts.id) + '" class="sel' + (opts.dark ? ' sel--dark' : '') + '" aria-label="' + esc(opts.ariaLabel || '') + '"' +
      (opts.action ? ' data-action="' + esc(opts.action) + '"' : '') +
      (opts.dataId ? ' data-id="' + esc(opts.dataId) + '"' : '') + '>';
    if (opts.placeholder) out += '<option value="">' + esc(opts.placeholder) + '</option>';
    for (const o of opts.options) {
      out += '<option value="' + esc(o.id) + '"' + (opts.value === o.id ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    }
    out += '</select>';
    return out;
  }

  /** Checkbox row used by the findings ledger / MFA tick sheets. */
  function checkboxRow(opts) {
    const selected = opts.selected;
    return '<label class="tick-row ' + (selected ? 'tick-row--on' : '') + '">' +
      '<input type="checkbox" class="tick" data-action="' + esc(opts.action) + '" data-id="' + esc(opts.id) + '"' +
      ' aria-label="' + esc(opts.label) + '"' + (selected ? ' checked' : '') + '>' +
      '<span>' + esc(opts.label) + '</span></label>';
  }

  global.ABUI = {
    esc: esc, icon: icon, stampButton: stampButton, stampMark: stampMark,
    choice: choice, orderRail: orderRail, term: term, termTooltipHtml: termTooltipHtml,
    selectHtml: selectHtml, checkboxRow: checkboxRow,
  };
})(typeof window !== 'undefined' ? window : globalThis);
