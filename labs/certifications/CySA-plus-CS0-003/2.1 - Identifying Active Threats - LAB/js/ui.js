// ─────────────────────────────────────────────────────────────────────────────
// js/ui.js — rendering primitives ("paper" design system)
// String-based component builders that mirror the original React components in
// src/components/lab/bits.tsx 1:1 (same markup intent, same classes, same
// accessibility attributes). All dynamic text passes through esc().
// Load order: data.js → objectives.js → state.js → icons.js → ui.js → panels.js → app.js
// ─────────────────────────────────────────────────────────────────────────────

/** Escape a dynamic string for safe embedding in HTML markup. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Session-only UI state (mirrors the original component useState values —
 * intentionally NOT persisted; a reload starts these fresh, exactly like the
 * original lab). Mutated by app.js, read by panel renderers.
 */
const UISTATE = {
  centerTab: 'desk',      // desktop workbench tab: desk | grid | records
  mobileTab: 'desk',      // mobile section tab: casefile | desk | grid | records | missions
  aimedStation: null,     // last station targeted with "Aim" (keeps its ring)
  failWhys: {},           // objective id → last failure message (session only)
  recordsTab: 'guide',    // records room tab: guide | quiz | debrief | glossary
  gridTab: 'records',     // ShareGrid tab (falls back to 'records' when unavailable)
  briefingOpen: true,     // case-file briefing fold state
  missionsOpenId: null,   // open accordion card on the mission board
  dismissedFor: null,     // mode whose close-out the user dismissed
  resetOpen: false,       // reset confirmation dialog open
  completionFired: false, // guards the one-shot auto-close-out trigger
  announceCount: 0,       // screen-reader announcement counter
};

// Warm paper palette (no blues/indigos anywhere in the lab) — values from bits.tsx
const PAPER = {
  desk: '#f1ead9',
  sheet: '#fbf7ec',
  deep: '#f3ecdb',
  ink: '#2b2519',
  line: '#d8cdae',
  amber: '#92510e',
  moss: '#4d6b1f',
  red: '#a53a30',
  term: '#181c10',
  termInk: '#c8d99e',
};

/** PaperPanel — bordered sheet with a mono header, optional tape decoration. */
function paperPanel(o) {
  const tape = o.tape
    ? '<span aria-hidden="true" class="panel-tape"></span>'
    : '';
  const icon = o.icon ? '<span class="panel-ic">' + o.icon + '</span>' : '';
  const sub = o.subtitle ? '<p class="panel-sub">' + esc(o.subtitle) + '</p>' : '';
  const ring = o.aimed ? ' ring-aim' : '';
  return (
    '<section id="' + (o.id ? esc(o.id) : '') + '" aria-label="' + esc(o.title) + '" class="panel' + ring + (o.cls ? ' ' + o.cls : '') + '">' +
    tape +
    '<header class="panel-head">' + icon +
    '<div class="panel-headtext"><h2 class="panel-title">' + esc(o.title) + '</h2>' + sub + '</div>' +
    '</header><div class="panel-body">' + (o.body || '') + '</div></section>'
  );
}

/** Note — small tinted callout. tone: info | warn | ok */
function note(tone, label, text) {
  const lab = label
    ? '<strong class="note-k">' + esc(label) + '</strong> '
    : '';
  return '<div class="note note-' + tone + '">' + lab + text + '</div>';
}

/** PillarChip — P1–P4 tag with blurb tooltip. */
function pillarChip(pillar) {
  const meta = PILLAR_META[pillar];
  return (
    '<span class="pchip pchip-' + pillar + '" title="' + esc(meta.blurb) + '">' +
    esc(pillar) + ' ' + esc(meta.name) + '</span>'
  );
}

/** StampResult — rubber-stamp VERIFIED/RETURNED with spring animation. */
function stamp(result) {
  const pass = result === 'pass';
  return (
    '<span aria-hidden="true" class="stamp ' + (pass ? 'stamp-pass' : 'stamp-fail') + '">' +
    (pass ? 'Verified' : 'Returned') + '</span>'
  );
}

/** CheckButton — amber mono "Check results"-style action. */
function checkButton(o) {
  return (
    '<button type="button" data-act="' + o.act + '" data-fid="' + esc(o.fid) + '"' +
    (o.dataId ? ' data-id="' + esc(o.dataId) + '"' : '') +
    ' class="btn btn-check' + (o.cls ? ' ' + o.cls : '') + '">' +
    icon('check', 'ic-14') + ' ' + esc(o.label || 'Check results') + '</button>'
  );
}

/** MiniSelect — paper-styled select with optional optgroups. */
function miniSelect(o) {
  let opts = '';
  if (o.groups) {
    opts = o.groups
      .map(function (g) {
        return '<optgroup label="' + esc(g.label) + '">' +
          g.options.map(function (x) {
            return '<option value="' + esc(x.id) + '"' + (o.value === x.id ? ' selected' : '') + '>' + esc(x.label) + '</option>';
          }).join('') +
          '</optgroup>';
      })
      .join('');
  }
  if (o.options) {
    opts += o.options
      .map(function (x) {
        return '<option value="' + esc(x.id) + '"' + (o.value === x.id ? ' selected' : '') + '>' + esc(x.label) + '</option>';
      })
      .join('');
  }
  return (
    '<select aria-label="' + esc(o.ariaLabel) + '"' +
    (o.disabled ? ' disabled' : '') +
    ' data-fid="' + esc(o.fid) + '"' +
    (o.attrs || '') +
    ' class="sel ' + (o.cls || '') + '">' +
    '<option value="">' + esc(o.placeholder || '— choose —') + '</option>' +
    opts +
    '</select>'
  );
}

/** ChipToggle — aria-pressed toggle chip. tone colors the ACTIVE state. */
function chipToggle(o) {
  const onCls = o.tone === 'red' ? ' chip-on-red' : o.tone === 'moss' ? ' chip-on-moss' : ' chip-on-amber';
  return (
    '<button type="button" aria-pressed="' + (o.active ? 'true' : 'false') + '" aria-label="' + esc(o.ariaLabel) + '"' +
    ' data-act="' + o.act + '"' + (o.dataKey ? ' data-key="' + esc(o.dataKey) + '"' : '') +
    (o.dataId ? ' data-id="' + esc(o.dataId) + '"' : '') +
    (o.dataVal !== undefined && o.dataVal !== null ? ' data-val="' + esc(o.dataVal) + '"' : '') +
    ' data-fid="' + esc(o.fid) + '"' +
    ' class="chip ' + (o.active ? onCls : 'chip-off') + (o.cls ? ' ' + o.cls : '') + '">' +
    (o.inner || '') + '</button>'
  );
}

/** ClipSpan — interactive observable span in an evidence sheet (36px inline). */
function clipSpan(clip, clipped) {
  return (
    '<button type="button" aria-pressed="' + (clipped ? 'true' : 'false') + '"' +
    ' aria-label="' + esc((clipped ? 'Remove from' : 'Add to') + ' evidence basket: ' + clip.label) + '"' +
    ' title="' + esc(clip.benign ? 'Analyst note available — click to toggle clip' : 'Observable — click to clip into the evidence basket') + '"' +
    ' data-act="clip" data-id="' + esc(clip.id) + '"' +
    ' data-fid="clip-' + esc(clip.id) + '"' +
    ' class="clip ' + (clipped ? 'clip-on' : 'clip-off') + '">' +
    icon('paperclip', 'ic-12 ' + (clipped ? 'op90' : 'op40')) + esc(clip.label) + '</button>'
  );
}

/** SeqSlot — numbered row in an ordering exercise, with a remove button. */
function seqSlot(label, index, key, id) {
  return (
    '<li class="seq">' +
    '<span class="seq-num">' + (index + 1) + '</span>' +
    '<span class="seq-label">' + esc(label) + '</span>' +
    '<button type="button" aria-label="Remove ' + esc(label) + ' from sequence"' +
    ' data-act="pull-seq" data-key="' + esc(key) + '" data-id="' + esc(id) + '"' +
    ' data-fid="seqrm-' + esc(key) + '-' + esc(id) + '"' +
    ' class="seq-x">' + icon('x', 'ic-14') + '</button>' +
    '</li>'
  );
}

/** Star — rating star (custom 20×20 glyph from bits.tsx, not Lucide). */
function starMarkup(filled) {
  return (
    '<svg viewBox="0 0 20 20" class="star' + (filled ? ' star-on' : '') + '" fill="currentColor" aria-hidden="true">' +
    '<path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"></path></svg>'
  );
}

/** BureauMark — the round bureau seal. */
function bureauMark(cls) {
  return (
    '<svg viewBox="0 0 48 48" class="' + (cls || 'bmark') + '" aria-hidden="true">' +
    '<circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="3.5 2.5"></circle>' +
    '<circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="1.4"></circle>' +
    '<path d="M14 30V19h6a3.5 3.5 0 010 7h-6m6 0l4 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '<circle cx="33" cy="18" r="2.2" fill="currentColor"></circle>' +
    '<path d="M33 22v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path></svg>'
  );
}
