// ─── The Registry — js/ui.js ──────────────────────────────────────────────
// Rendering helpers: escaping, Lucide-style inline SVG icons (exact icon
// names/paths copied from the lucide icon set the original used) and the
// shared "atom" components (badges, chips, match rows, order trays,
// sequence picker, stamp picker, quiz card).

window.UI = (function () {
  'use strict';

  // ── Escaping ─────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Icons (lucide, 24×24, stroke = currentColor) ─────────────────────────
  var ICON_PATHS = {
    'check-circle-2':
      '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'circle-dashed':
      '<path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0"/><path d="M17.06 2.9a9.93 9.93 0 0 1 2.63 2.75"/><path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8"/><path d="M19.1 17.06a9.93 9.93 0 0 1-2.75 2.63"/><path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0"/><path d="M6.94 19.1a9.94 9.94 0 0 1-2.63-2.75"/><path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8"/><path d="M4.9 6.94a9.93 9.93 0 0 1 2.75-2.63"/>',
    'refresh-cw':
      '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    star:
      '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.123 2.123 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'file-text':
      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'folder-open':
      '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
    'scroll-text':
      '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1h1v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1h-1"/><path d="M8 8h.01"/><path d="M8 12h.01"/><path d="M8 16h.01"/>',
    search:
      '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    landmark:
      '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    lightbulb:
      '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    'book-open-check':
      '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="m9 10 2 2 4-4"/>',
    'external-link':
      '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'graduation-cap':
      '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    'shield-check':
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'x-circle':
      '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  };

  /**
   * icon('search', 'h-4 w-4') → inline SVG string.
   * aria-hidden by default (matches the original's usage), optionally labelled.
   */
  function icon(name, className, label) {
    var body = ICON_PATHS[name];
    if (!body) return '';
    var cls = className || '';
    var aria = label
      ? ' role="img" aria-label="' + esc(label) + '"'
      : ' aria-hidden="true"';
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon ' + esc(cls) + '"' + aria + '>' +
      body + '</svg>'
    );
  }

  // ── Pillar badge ─────────────────────────────────────────────────────────
  var PILLAR_CLASS = {
    Understand: 'pillar-understand',
    Recognize: 'pillar-recognize',
    Apply: 'pillar-apply',
    Detect: 'pillar-detect',
    Decide: 'pillar-decide',
  };
  function pillarBadge(pillar) {
    return (
      '<span class="pillar-badge ' + (PILLAR_CLASS[pillar] || 'pillar-fallback') + '">' +
      esc(pillar) +
      '</span>'
    );
  }

  // ── Document code chip (button when clickable) ───────────────────────────
  function docChip(code, onClick) {
    if (onClick) {
      return (
        '<button type="button" class="doc-chip doc-chip-btn" ' + onClick + '>' + esc(code) + '</button>'
      );
    }
    return '<span class="doc-chip">' + esc(code) + '</span>';
  }

  // ── Match row (label + <select>) ─────────────────────────────────────────
  // options: [{value, label}]; onChange: inline handler body with {v} placeholder.
  function matchRow(opts) {
    var name = opts.name;
    var labelHtml = opts.labelHtml;       // pre-escaped HTML
    var note = opts.note;
    var options = opts.options;
    var value = opts.value || '';
    var onChange = opts.onChange;          // e.g. "App.setMatch('m1','B',this.value)"
    var disabled = !!opts.disabled;
    var ariaLabel = opts.ariaLabel != null ? opts.ariaLabel : name;

    var h = '<div class="match-row">';
    h += '<div class="match-label">' + labelHtml + (note ? '<span class="match-note">' + esc(note) + '</span>' : '') + '</div>';
    h +=
      '<select data-fid="' + esc(name) + '" aria-label="' + esc('Answer for: ' + ariaLabel) + '"' +
      (disabled ? ' disabled' : '') +
      ' onchange="' + esc(onChange) + '">';
    h += '<option value="">Select…</option>';
    options.forEach(function (o) {
      h += '<option value="' + esc(o.value) + '"' + (value === o.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    });
    h += '</select>';
    h += '</div>';
    return h;
  }

  // ── Order tray (numbered sequence with move up/down) ─────────────────────
  function orderTray(opts) {
    var items = opts.items;               // [{id, label}]
    var value = opts.value;               // [id, ...]
    var onChange = opts.onChange;         // e.g. "App.moveOrder('m12', INDEX, -1)"
    var label = opts.label;
    var disabled = !!opts.disabled;
    var byId = {};
    items.forEach(function (i) { byId[i.id] = i; });

    var h = '<ol class="order-tray" aria-label="' + esc(label) + '">';
    value.forEach(function (id, idx) {
      var upDisabled = idx === 0 || disabled;
      var downDisabled = idx === value.length - 1 || disabled;
      h += '<li class="order-item">';
      h += '<span class="order-num">' + (idx + 1) + '.</span>';
      h += '<span class="order-label">' + esc(byId[id] ? byId[id].label : id) + '</span>';
      h += '<span class="order-btns">';
      h +=
        '<button type="button" aria-label="' + esc('Move item ' + (idx + 1) + ' up') + '"' +
        (upDisabled ? ' disabled' : '') +
        ' onclick="' + esc(onChange.replace('{i}', String(idx)).replace('{d}', '-1')) + '">' +
        icon('arrow-up') + '</button>';
      h +=
        '<button type="button" aria-label="' + esc('Move item ' + (idx + 1) + ' down') + '"' +
        (downDisabled ? ' disabled' : '') +
        ' onclick="' + esc(onChange.replace('{i}', String(idx)).replace('{d}', '1')) + '">' +
        icon('arrow-down') + '</button>';
      h += '</span>';
      h += '</li>';
    });
    h += '</ol>';
    return h;
  }

  // ── Sequence picker (choose up to N options, in order) ───────────────────
  function sequencePicker(opts) {
    var options = opts.options;           // [{id, label}]
    var seq = opts.seq;                   // [id, ...]
    var max = opts.max;
    var onToggle = opts.onToggle;         // "App.toggleSequence('h8', 'isolate')"
    var label = opts.label;
    var disabled = !!opts.disabled;
    var byId = {};
    options.forEach(function (o) { byId[o.id] = o; });

    var h = '<div aria-label="' + esc(label) + '">';
    h += '<div class="seq-tray">';
    h += '<span class="seq-tray-title">Your sequence</span>';
    h += '<div class="seq-chips">';
    if (seq.length === 0) {
      h += '<span class="seq-empty">Empty — pick options below in order.</span>';
    }
    seq.forEach(function (id, i) {
      h +=
        '<span class="seq-chip"><span class="seq-chip-num">' + (i + 1) + '.</span> ' +
        esc(byId[id] ? byId[id].label : id) + '</span>';
    });
    h += '</div></div>';
    h += '<div class="seq-options">';
    options.forEach(function (o) {
      var chosen = seq.indexOf(o.id) !== -1;
      var dis = disabled || (!chosen && seq.length >= max);
      h +=
        '<button type="button"' + (dis ? ' disabled' : '') +
        ' aria-pressed="' + (chosen ? 'true' : 'false') + '"' +
        ' class="seq-option' + (chosen ? ' seq-option-chosen' : dis ? ' seq-option-muted' : '') + '"' +
        ' onclick="' + esc(onToggle.replace('{id}', "'" + o.id + "'")) + '">' +
        (chosen ? icon('x', 'seq-x') : '') +
        esc(o.label) + '</button>';
    });
    h += '</div></div>';
    return h;
  }

  // ── Stamp picker (docket disposition radio group) ─────────────────────────
  function stampPicker(opts) {
    var STAMPS = window.LAB_DATA.STAMPS;
    var value = opts.value;
    var onChange = opts.onChange;          // "App.setDocketStamp('R-101', 'comply')"
    var disabled = !!opts.disabled;

    var h = '<div role="radiogroup" aria-label="Disposition stamp" class="stamp-picker">';
    Object.keys(STAMPS).forEach(function (k) {
      var s = STAMPS[k];
      var active = value === k;
      h +=
        '<button type="button" role="radio" aria-checked="' + (active ? 'true' : 'false') + '"' +
        (disabled ? ' disabled' : '') +
        ' class="stamp-option' + (active ? ' stamp-option-active' : '') + '"' +
        ' onclick="' + esc(onChange.replace('{stamp}', "'" + k + "'")) + '">' +
        '<span class="stamp-option-label">' + esc(s.label) + '</span>' +
        '<span class="stamp-option-desc">' + esc(s.desc) + '</span>' +
        '</button>';
    });
    h += '</div>';
    return h;
  }

  // ── Quiz card (used interactively and read-only) ─────────────────────────
  // R3 color contract preserved: ONLY the selected answer is highlighted.
  function quizCard(opts) {
    var q = opts.q;
    var index = opts.index;
    var quizState = opts.quizState;       // state.quiz
    var drafts = opts.drafts;             // undefined in review mode
    var onLock = opts.onLock;             // "App.lockQuiz('QM1')"
    var onDraft = opts.onDraft;           // "App.setQuizDraft('QM1', 0)"

    var chosen = quizState[q.id];
    var isLocked = chosen !== undefined;
    var ok = chosen === String(q.answer);

    var h = '<fieldset class="quiz-card"' + (isLocked ? ' disabled' : '') + '>';
    h += '<legend class="quiz-legend">' + (index + 1) + '. ' + esc(q.q) + '</legend>';
    h += '<div class="quiz-options">';
    q.options.forEach(function (opt, oi) {
      var isSelected = isLocked && chosen === String(oi);
      var isDraft = !isLocked && drafts && drafts[q.id] === String(oi);
      var cls = 'quiz-option';
      if (isSelected) cls += ok ? ' quiz-option-right' : ' quiz-option-wrong';
      else if (isDraft) cls += ' quiz-option-draft';
      h += '<label class="' + cls + '">';
      h +=
        '<input type="radio" name="' + esc(q.id) + '" value="' + oi + '" data-fid="' + esc(q.id + ':' + oi) + '"' +
        (isSelected || isDraft ? ' checked' : '') +
        (isLocked ? ' disabled' : '') +
        (onDraft && !isLocked ? ' onchange="' + esc(onDraft.replace('{oi}', String(oi))) + '"' : '') +
        ' />';
      if (isSelected) {
        h += ok ? icon('check-circle-2', 'quiz-mark', 'correct answer') : icon('x-circle', 'quiz-mark', 'incorrect answer');
      }
      h += '<span class="' + (isSelected ? (ok ? 'quiz-text quiz-text-right' : 'quiz-text quiz-text-wrong') : '') + '">' + esc(opt) + '</span>';
      h += '</label>';
    });
    h += '</div>';
    if (!isLocked && onLock && drafts) {
      h +=
        '<button type="button" class="btn btn-primary btn-quiz-lock"' +
        (drafts[q.id] === undefined ? ' disabled' : '') +
        ' onclick="' + esc(onLock) + '">Lock answer</button>';
    }
    if (isLocked) {
      h +=
        '<p role="status" class="quiz-explain ' + (ok ? 'quiz-explain-ok' : 'quiz-explain-bad') + '">' +
        '<strong>' + (ok ? 'Correct — ' : 'Locked as incorrect — ') + '</strong>' + esc(q.explain) + '</p>';
    }
    h += '</fieldset>';
    return h;
  }

  return {
    esc: esc,
    icon: icon,
    pillarBadge: pillarBadge,
    docChip: docChip,
    matchRow: matchRow,
    orderTray: orderTray,
    sequencePicker: sequencePicker,
    stampPicker: stampPicker,
    quizCard: quizCard,
  };
})();
