/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab static port — UI KIT (js/ui.js)
   Inline Lucide icons (exact SVG paths — no icon fonts, no CDNs) and the
   shared widgets: ObjectiveCard, SequenceBuilder, ToggleCard, MatchSelect,
   StationHeader, PaperTag, InfoNote. Pure string templating; all
   interactivity is wired via data-action attributes in app.js.
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  /* ───────────────────────────── escaping ───────────────────────────────── */

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ───────────────────── Lucide icons (inline SVG paths) ────────────────── */

  const ICON_PATHS = {
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'bell-ring': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/><path d="M22 8c0-2.3-.8-4.3-2-6"/>',
    microscope: '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    eraser: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
    'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    'check-circle-2': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    circle: '<circle cx="12" cy="12" r="10"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    'clipboard-check': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
    radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91"/><path d="M12 18h.01"/><path d="M17.99 11.66a6 6 0 0 1-2.22 4.75"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  };

  /** Inline SVG icon, Lucide-faithful: 24×24, stroke 2, currentColor. */
  function icon(name, cls) {
    const paths = ICON_PATHS[name] || ICON_PATHS['file-text'];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + (cls || 'ic') + '" aria-hidden="true">' + paths + '</svg>';
  }

  /* ───────────────────────── shared small pieces ────────────────────────── */

  /** <option> list; adds a placeholder row when value is empty. */
  function selectHtml(opts) {
    const value = opts.value || '';
    const options = opts.options || [];
    let h = '<select class="sel" aria-label="' + esc(opts.ariaLabel || '') + '" data-change="' + esc(opts.change || '') + '" ' + opts.extraAttrs + '>';
    if (opts.placeholder) {
      h += '<option value="" disabled' + (value === '' ? ' selected' : '') + '>' + esc(opts.placeholder) + '</option>';
    }
    options.forEach(function (o) {
      h += '<option value="' + esc(o.id) + '"' + (value === o.id ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    });
    h += '</select>';
    return h;
  }

  /**
   * Objective card — parity port of widgets.tsx ObjectiveCard.
   * twin=true renders the header + exercise without the duplicated
   * CHECK/hint footer and feedback (audit QA-8).
   */
  function objectiveCard(opts) {
    const def = opts.def;
    const st = opts.state; // ObjState | undefined
    const pillar = global.LAB.PILLAR_META[def.pillar];
    const maxHints = def.mode === 'hard' ? 1 : def.hints.length;
    const hintLevel = st ? st.hintLevel : 0;
    const hintsExhausted = hintLevel >= maxHints;
    const passed = !!(st && st.passed);
    const nextHint = Math.min(hintLevel + 1, maxHints);

    let h = '<section class="obj' + (passed ? ' obj-passed' : '') + '" aria-label="Objective ' + esc(def.id) + ': ' + esc(def.title) + '">';
    h += '<div class="obj-headwrap">';
    h += '<div class="obj-badges">';
    h += '<span class="chip-id">' + esc(def.id) + '</span>';
    h += '<span class="badge ' + pillar.cls + '">' + esc(pillar.label) + '</span>';
    if (passed) h += '<span class="badge badge-pass">' + icon('check-circle-2', 'ic ic-12') + ' PASSED</span>';
    h += '</div>';
    h += '<h4 class="obj-title">' + esc(def.title) + '</h4>';
    h += '<p class="obj-anchor">anchor: ' + esc(def.anchor) + '</p>';
    h += '</div>';

    /*
     * QA-14 (R2): once verified, the exercise inputs lock — disabled fieldset
     * removes descendants from the tab order; pointer-events:none stops
     * pointer-driven widgets (native selects, buttons) from firing.
     */
    if (passed) {
      h += '<div class="obj-body"><fieldset disabled class="obj-lock" aria-label="Objective verified — inputs locked"><legend class="sr-only">Objective verified — inputs locked</legend>' + opts.body + '</fieldset></div>';
    } else {
      h += '<div class="obj-body">' + opts.body + '</div>';
    }

    if (!opts.twin) {
      h += '<div class="obj-actions">';
      h += '<button type="button" class="btn btn-sm ' + (passed ? 'btn-verified' : 'btn-amber') + '" data-action="check" data-obj="' + esc(def.id) + '"' + (passed ? ' disabled' : '') + ' data-fk="check-' + esc(def.id) + '" aria-label="Check results for objective ' + esc(def.id) + '">';
      h += passed ? icon('check-circle-2', 'ic ic-btn') + ' Verified' : 'CHECK RESULTS';
      h += '</button>';
      if (maxHints > 1) {
        h += '<button type="button" class="btn btn-sm btn-outline" data-action="hint" data-obj="' + esc(def.id) + '"' + (passed || hintsExhausted ? ' disabled' : '') + ' data-fk="hint-' + esc(def.id) + '" aria-label="Reveal hint for objective ' + esc(def.id) + ' (level ' + nextHint + ' of ' + maxHints + ')">';
        h += icon('lightbulb', 'ic ic-btn') + ' Hint ' + nextHint + '/' + maxHints + '</button>';
      } else {
        h += '<button type="button" class="btn btn-sm btn-outline" data-action="hint" data-obj="' + esc(def.id) + '"' + (passed || hintsExhausted ? ' disabled' : '') + ' data-fk="hint-' + esc(def.id) + '" aria-label="Reveal hint for objective ' + esc(def.id) + ' (level ' + nextHint + ' of ' + maxHints + ')">';
        h += icon('lock', 'ic ic-btn') + ' Scored nudge</button>';
      }
      if (st && st.attempts > 0 && !passed) {
        h += '<span class="obj-attempts">attempts: ' + st.attempts + '</span>';
      }
      h += '</div>';

      if (st && hintLevel > 0) {
        h += '<div class="hints" aria-live="polite">';
        def.hints.slice(0, hintLevel).forEach(function (hintText, i) {
          h += '<p class="hint"><span class="hint-label">hint ' + (i + 1) + ':</span>' + esc(hintText) + '</p>';
        });
        h += '</div>';
      }

      if (st && st.lastResult) {
        const r = st.lastResult;
        h += '<div class="feedback ' + (r.pass ? 'fb-pass' : 'fb-fail') + '" aria-live="polite" role="status">';
        h += '<p class="fb-line">' + icon(r.pass ? 'check-circle-2' : 'x-circle', 'ic ic-btn fb-ic') + '<span>' + esc(r.summary) + '</span></p>';
        if (r.detail && r.detail.length > 0) {
          h += '<ul class="fb-detail">';
          r.detail.forEach(function (d) { h += '<li>' + esc(d) + '</li>'; });
          h += '</ul>';
        }
        h += '</div>';
      }
    } else if (passed) {
      h += '<p class="twin-note">' + icon('check-circle-2', 'ic ic-12') + ' verified in the first panel</p>';
    }

    h += '</section>';
    return h;
  }

  /**
   * Sequence builder — up/down reorderer, parity port of widgets.tsx
   * SequenceBuilder (same reset targets, same aria labels).
   */
  function sequenceBuilder(opts) {
    const items = opts.items;
    const ordered = opts.ordered;
    const key = opts.key;
    let h = '<div>';
    h += '<ol class="seq" aria-label="Ordered list — use the up and down buttons to reorder">';
    ordered.forEach(function (id, idx) {
      const item = null;
      let found = null;
      for (const it of items) if (it.id === id) { found = it; break; }
      if (!found) return;
      h += '<li class="seq-item">';
      h += '<span class="seq-num">' + (idx + 1) + '</span>';
      h += '<div class="seq-card"><p class="seq-label">' + esc(found.label) + '</p>';
      if (found.sub) h += '<p class="seq-sub">' + esc(found.sub) + '</p>';
      h += '</div>';
      h += '<div class="seq-btns">';
      h += '<button type="button" class="btn btn-outline btn-icon" data-action="seq-move" data-key="' + esc(key) + '" data-idx="' + idx + '" data-dir="-1"' + (idx === 0 ? ' disabled' : '') + ' data-fk="seq-' + esc(key) + '-' + idx + '-up" aria-label="Move item ' + (idx + 1) + ' (' + esc(found.label) + ') up">' + icon('arrow-up', 'ic ic-16') + '</button>';
      h += '<button type="button" class="btn btn-outline btn-icon" data-action="seq-move" data-key="' + esc(key) + '" data-idx="' + idx + '" data-dir="1"' + (idx === ordered.length - 1 ? ' disabled' : '') + ' data-fk="seq-' + esc(key) + '-' + idx + '-down" aria-label="Move item ' + (idx + 1) + ' (' + esc(found.label) + ') down">' + icon('arrow-down', 'ic ic-16') + '</button>';
      h += '</div></li>';
    });
    h += '</ol>';
    if (opts.resetOrder) {
      h += '<div class="seq-footer"><button type="button" class="btn btn-ghost btn-sm" data-action="seq-reset" data-key="' + esc(key) + '" data-order="' + esc(opts.resetOrder.join(',')) + '" data-fk="seq-reset-' + esc(key) + '">' + icon('rotate-ccw', 'ic ic-14') + ' ' + esc(opts.resetLabel || 'Shuffle back') + '</button></div>';
    }
    h += '</div>';
    return h;
  }

  /**
   * Toggle card — parity port of widgets.tsx ToggleCard (multi-select and
   * radio-style usage; aria-pressed; amber when selected, rose border tone
   * for "danger" options).
   */
  function toggleCard(opts) {
    const cls = ['tg'];
    if (opts.selected) cls.push('tg-selected');
    if (opts.tone === 'danger') cls.push('tg-danger');
    if (opts.disabled) cls.push('tg-disabled');
    let h = '<button type="button" class="' + cls.join(' ') + '" aria-pressed="' + (opts.selected ? 'true' : 'false') + '"' + (opts.disabled ? ' disabled' : '') + ' data-action="' + esc(opts.action || 'toggle-item') + '" data-key="' + esc(opts.key) + '" data-id="' + esc(opts.id) + '" data-fk="tg-' + esc(opts.key) + '-' + esc(opts.id) + '">';
    h += '<span class="tg-row"><span class="tg-box' + (opts.selected ? ' tg-box-on' : '') + '">' + (opts.selected ? icon('check-circle-2', 'ic ic-14 tg-check') : '') + '</span>';
    h += '<span class="tg-text"><span class="tg-label">' + esc(opts.label) + '</span>';
    if (opts.sub) h += '<span class="tg-sub">' + esc(opts.sub) + '</span>';
    h += '</span></span></button>';
    return h;
  }

  /** Station header — parity port of widgets.tsx StationHeader. */
  function stationHeader(n, title, tagline, rightHtml) {
    return '<div class="station-header">'
      + '<div><p class="sh-eyebrow">station ' + esc(n) + '</p>'
      + '<h2 class="sh-title">' + title + '</h2>'
      + '<p class="sh-tagline">' + esc(tagline) + '</p></div>'
      + (rightHtml || '')
      + '</div>';
  }

  /** "Next station" outline button used in station headers. */
  function nextStationBtn(label, station) {
    return '<button type="button" class="btn btn-outline btn-sm" data-action="goto" data-station="' + esc(station) + '" data-fk="next-' + esc(station) + '">' + esc(label) + ' ' + icon('arrow-right', 'ic ic-btn') + '</button>';
  }

  /** Paper evidence tag — parity port of widgets.tsx PaperTag. */
  function paperTag(title, meta, bodyHtml) {
    return '<div class="paper">'
      + '<div class="paper-head"><p class="paper-title">' + esc(title) + '</p>'
      + (meta ? '<p class="paper-meta">' + esc(meta) + '</p>' : '')
      + '</div><div class="paper-body">' + bodyHtml + '</div></div>';
  }

  /** Info note — parity port of widgets.tsx InfoNote. */
  function infoNote(bodyHtml, tone) {
    return '<div class="' + (tone === 'warn' ? 'note note-warn' : 'note') + '">'
      + icon('chevron-down', 'ic ic-14 note-ic') + '<div>' + bodyHtml + '</div></div>';
  }

  global.LabUI = {
    esc: esc,
    icon: icon,
    selectHtml: selectHtml,
    objectiveCard: objectiveCard,
    sequenceBuilder: sequenceBuilder,
    toggleCard: toggleCard,
    stationHeader: stationHeader,
    nextStationBtn: nextStationBtn,
    paperTag: paperTag,
    infoNote: infoNote,
  };
})(window);
