// CyberLab 12.1 — shared bench chrome (static port of components/cyberlab/bits.tsx)
// Every widget renders to an HTML template string. Events are handled globally
// via data-action attributes (see app.js). Visual classes map 1:1 to styles.css.
window.CyberLab = window.CyberLab || {};
(function (CL) {
  'use strict';

  const { ICONS } = CL;

  /** HTML-escape a dynamic string. */
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function SectionLabel(text, extraClass = '') {
    return `<div class="section-label ${extraClass}">${text}</div>`;
  }

  function LED(state, pulse = false) {
    return `<span class="led led-${state}${pulse && state === 'work' ? ' led-pulse' : ''}" aria-hidden="true"></span>`;
  }

  function Bezel(opts) {
    const sub = opts.sub ? `<div class="bezel-sub">${esc(opts.sub)}</div>` : '';
    const icon = opts.icon || '';
    const actions = opts.actions ? `<div class="bezel-actions">${opts.actions}</div>` : '';
    return `
      <div class="bezel ${opts.className || ''}">
        <div class="bezel-head">
          ${icon ? `<span class="bezel-icon">${icon}</span>` : ''}
          <div class="bezel-title">${esc(opts.title)}</div>
          ${sub}
          ${actions}
        </div>
        <div class="bezel-body">${opts.body}</div>
      </div>`;
  }

  function PillarBadge(pillar) {
    const meta = CL.PILLAR_META[pillar];
    return `<span class="pillar-badge pillar-${pillar}" title="${esc(meta.label)}">${pillar} · ${esc(meta.label)}</span>`;
  }

  function FeedbackBlock(result) {
    return `
      <div class="feedback ${result.pass ? 'feedback-pass' : 'feedback-fail'}" role="status">
        <span class="feedback-head">${result.pass ? ICONS.Check('h-3.5 w-3.5') : ICONS.X('h-3.5 w-3.5')} ${result.pass ? 'Check passed' : 'Not yet — read this'}</span>
        ${esc(result.feedback)}
      </div>`;
  }

  function CheckButton(objId, disabled = false) {
    return `
      <button type="button" class="btn btn-primary btn-check" data-action="check" data-obj="${esc(objId)}"${disabled ? ' disabled' : ''}
        aria-label="Check results for ${esc(objId)}">Check results</button>`;
  }

  // Hints resolved from the objective banks (same lazy pattern as the original).
  const HINTS_BY_ID = {};
  CL.OBJECTIVES.medium.concat(CL.OBJECTIVES.hard).forEach((o) => { HINTS_BY_ID[o.id] = o.hints; });

  function HintBlock(objId, maxHints) {
    const s = CL.store.state;
    const hintsUsed = s.hintsUsed[objId] ?? 0;
    const allHints = HINTS_BY_ID[objId] || [];
    const hints = maxHints ? allHints.slice(0, maxHints) : allHints;
    const shown = allHints.slice(0, hintsUsed);
    const exhausted = hintsUsed >= hints.length;
    let html = '<div class="hintblock">';
    shown.forEach((h, i) => {
      html += `<div class="hint"><span class="hint-tag">Hint ${i + 1}</span>${esc(h)}</div>`;
    });
    if (hints.length > 0 && !exhausted) {
      const label = hintsUsed === 0
        ? (maxHints === 1 ? 'Reveal the nudge (costs stars)' : 'Reveal a hint')
        : `Reveal hint ${hintsUsed + 1}/${hints.length}`;
      html += `
        <button type="button" class="btn btn-ghost btn-hint" data-action="hint" data-obj="${esc(objId)}"
          aria-label="Reveal hint ${hintsUsed + 1} for ${esc(objId)}">
          ${ICONS.Lightbulb('h-3.5 w-3.5')} ${esc(label)}
        </button>`;
    }
    html += '</div>';
    return html;
  }

  function TrainingChip() {
    return `<span class="training-chip">${ICONS.Sparkles('h-3 w-3')} Synthetic training data</span>`;
  }

  function TaskCard(inner) {
    return `<div class="task-card">${SectionLabel('Task')}${inner}</div>`;
  }

  /** Styled native select (visual stand-in for the shadcn/radix Select). */
  function Sel(opts) {
    const value = opts.value ?? '';
    const optsHtml = opts.options
      .map((o) => `<option value="${esc(o.id)}"${String(value) === String(o.id) ? ' selected' : ''}>${esc(o.label)}</option>`)
      .join('');
    const triggerAttrs = opts.objId ? ` data-action="answer" data-obj="${esc(opts.objId)}"${opts.field ? ` data-field="${esc(opts.field)}"` : ''}` : '';
    return `
      <div class="sel ${opts.className || ''}">
        <div class="sel-label">${esc(opts.label)}</div>
        <select class="sel-control" aria-label="${esc(opts.label)}"${triggerAttrs} data-fk="sel-${esc(opts.objId || '')}-${esc(opts.field || opts.label)}">
          <option value="" disabled${value === '' ? ' selected' : ''}>Select…</option>
          ${optsHtml}
        </select>
      </div>`;
  }

  /** Radio list (radiogroup of styled label rows). */
  function RadioList(opts) {
    return `<div role="radiogroup" class="radio-list">${opts.options
      .map(
        (o) => `
        <label class="radio-row${opts.value === o.id ? ' radio-row-active' : ''}">
          <input type="radio" name="${esc(opts.name)}" value="${esc(o.id)}"${opts.value === o.id ? ' checked' : ''} data-fk="radio-${esc(opts.name)}-${esc(o.id)}"
            data-action="answer" data-obj="${esc(opts.objId)}"${opts.field ? ` data-field="${esc(opts.field)}"` : ''} />
          <span class="radio-icon">${ICONS.RadioTower('h-3.5 w-3.5')}</span>
          <span class="radio-text">${esc(o.label)}</span>
        </label>`,
      )
      .join('')}</div>`;
  }

  /** Checkbox row bound to an array-valued answer (answers[obj][field] = string[]). */
  function CheckRow(opts) {
    return `
      <li class="check-row">
        <input type="checkbox" id="${esc(opts.id)}"${opts.checked ? ' checked' : ''} data-fk="${esc(opts.id)}"
          data-action="toggle" data-obj="${esc(opts.objId)}"${opts.field ? ` data-field="${esc(opts.field)}"` : ''} data-item="${esc(opts.item)}" />
        <label for="${esc(opts.id)}">${esc(opts.text)}</label>
      </li>`;
  }

  /** Toggle switch (scan plan / M12). */
  function SwitchRow(opts) {
    return `
      <li class="check-row switch-row">
        <span class="switch-text">${esc(opts.text)}</span>
        <button type="button" role="switch" aria-checked="${!!opts.checked}" aria-label="${esc(opts.text)}"
          class="switch${opts.checked ? ' switch-on' : ''}" data-fk="sw-${esc(opts.objId)}-${esc(opts.item)}"
          data-action="bool" data-obj="${esc(opts.objId)}"${opts.field ? ` data-field="${esc(opts.field)}"` : ''} data-item="${esc(opts.item)}">
          <span class="switch-knob"></span>
        </button>
      </li>`;
  }

  function Stars(value) {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    let html = '<div class="stars" role="img" aria-label="' + value + ' out of 5 stars">';
    for (let i = 0; i < 5; i++) {
      if (i < full) html += `<span class="star star-full">${ICONS.Star('h-6 w-6')}</span>`;
      else if (i === full && half) html += `<span class="star star-full">${ICONS.StarHalf('h-6 w-6')}</span>`;
      else html += `<span class="star">${ICONS.Star('h-6 w-6')}</span>`;
    }
    return html + '</div>';
  }

  // ---------------- glossary tooltips ----------------
  function GlossaryTerm(term) {
    const entry = CL.DATA.GLOSSARY.find((g) => g.term.toLowerCase() === term.toLowerCase());
    if (!entry) return esc(term);
    return `<button type="button" class="gloss" data-term="${esc(entry.term)}" aria-label="Definition of ${esc(term)}">${esc(term)}</button>`;
  }

  /** Wraps known glossary phrases in tooltips (same algorithm as the original). */
  function renderWithGlossary(text) {
    const terms = CL.DATA.GLOSSARY.map((g) => g.term).filter((t) => t.length > 6);
    let segs = [{ text }];
    for (const term of terms) {
      const next = [];
      for (const seg of segs) {
        if (seg.term) { next.push(seg); continue; }
        const parts = seg.text.split(term);
        parts.forEach((p, idx) => {
          if (idx > 0) next.push({ text: term, term });
          if (p) next.push({ text: p });
        });
      }
      segs = next;
    }
    return segs
      .map((seg) => (seg.term ? GlossaryTerm(seg.term) : esc(seg.text)))
      .join('');
  }

  CL.ui = {
    esc, SectionLabel, LED, Bezel, PillarBadge, FeedbackBlock, CheckButton, HintBlock,
    TrainingChip, TaskCard, Sel, RadioList, CheckRow, SwitchRow, Stars, GlossaryTerm,
    renderWithGlossary, HINTS_BY_ID,
  };
})(window.CyberLab);
