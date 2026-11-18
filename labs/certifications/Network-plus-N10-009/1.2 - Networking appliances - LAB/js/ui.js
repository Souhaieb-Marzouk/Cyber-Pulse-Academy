// ── The Staging Bay · shared UI kit (vanilla) ───────────────────────────────
// Re-implements the shadcn/Radix primitives the original lab used, as small
// readable components: switch, select, slider, tabs, accordion, hover-card
// (Term), dialog / sheet overlays with focus trap, sonner-style toasts, plus
// the lab's shared bits (Panel, SectionHead, LogBox, StatusChip, Ring, Stars).
(function () {
'use strict';

// ── tiny DOM helper ──
window.h = function h(tag, attrs) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
  }
  for (let i = 2; i < arguments.length; i++) append(el, arguments[i]);
  return el;
};
function append(el, child) {
  if (child === null || child === undefined || child === false) return;
  if (Array.isArray(child)) { child.forEach((c) => append(el, c)); return; }
  el.appendChild(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child);
}

// ── design tokens (mirror of the original's C palette) ──
window.C = {
  bg: '#0f1115', panel: '#161a22', panel2: '#1c2230', line: '#2a3140', line2: '#39415a',
  amber: '#ffb020', amberDim: '#c98f1b', lime: '#a3e635', green: '#4ade80', red: '#f87171',
  text: '#e8ebf2', mute: '#96a0b5', dim: '#6b7488',
};
window.PILLAR_META = {
  understand: { label: 'UNDERSTAND', color: '#ffb020' },
  recognize: { label: 'RECOGNIZE', color: '#a3e635' },
  detect: { label: 'DETECT', color: '#38d9a9' },
  mitigate: { label: 'MITIGATE', color: '#f4978e' },
};

// ── body scroll lock (Radix does this for open overlays) ──
let scrollLocks = 0;
function lockScroll() { if (++scrollLocks === 1) document.body.style.overflow = 'hidden'; }
function unlockScroll() { if (--scrollLocks <= 0) { scrollLocks = 0; document.body.style.overflow = ''; } }

// ── overlay manager (dialog / right sheet / bottom sheet) ──
// Faithful to Radix behavior: focus moved in + trapped, ESC closes, focus restored,
// overlay click closes dialogs & sheets (EXCEPT the destructive reset confirm,
// which the original intentionally keeps overlay-strict — pass overlayCloses:false).
let openOverlays = [];
window.openOverlay = function openOverlay(opts) {
  const { content, kind = 'dialog', labelId, descId, overlayCloses = true, onClose, label, closeX } = opts;
  // Radix/shadcn parity: Dialog panels carry a built-in X (top-right); AlertDialog panels do not.
  const withCloseX = closeX !== undefined ? closeX : kind === 'dialog';
  lockScroll();
  const lastFocus = document.activeElement;
  const overlay = h('div', { class: 'ovl-overlay ' + kind + '-overlay' });
  const wrap = kind === 'dialog'
    ? h('div', { class: 'ovl-center' })
    : kind === 'sheet-right' ? h('div', { class: 'sheet-right-wrap' })
    : h('div', { class: 'sheet-bottom-wrap' });
  const panel = h('div', {
    class: 'ovl-panel ' + kind + '-panel',
    role: kind === 'dialog' ? 'dialog' : 'dialog',
    'aria-modal': 'true',
    'aria-label': label || undefined,
    'aria-labelledby': labelId || undefined,
    'aria-describedby': descId || undefined,
  });
  panel.appendChild(content);
  if (withCloseX) {
    const x = h('button', {
      type: 'button', class: 'ovl-close', 'aria-label': 'Close',
      html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    });
    x.addEventListener('click', () => close());
    panel.appendChild(x);
  }
  wrap.appendChild(panel);
  overlay.appendChild(wrap);
  document.body.appendChild(overlay);

  let closed = false;
  const api = { close, panel, overlay };

  // Radix-parity dismiss/trap: listeners live on DOCUMENT (capture) so ESC and
  // focus-trapping keep working even when focus lands outside the panel
  // (e.g. after the intentional no-op outside click on the destructive confirm).
  // Only the TOP-most overlay reacts.
  function focusables() {
    return Array.from(panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((f) => !f.disabled && f.offsetParent !== null);
  }
  function onDocKey(e) {
    if (openOverlays[openOverlays.length - 1] !== api) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'Tab') {
      const list = focusables();
      if (!list.length) return;
      const first = list[0], lastItem = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); lastItem.focus(); }
      else if (!e.shiftKey && (document.activeElement === lastItem || !panel.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
  }
  function onFocusIn(e) {
    if (openOverlays[openOverlays.length - 1] !== api) return;
    if (!panel.contains(e.target)) {
      const list = focusables();
      (list[0] || panel).focus({ preventScroll: true });
    }
  }

  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onDocKey, true);
    document.removeEventListener('focusin', onFocusIn, true);
    overlay.classList.add('closing');
    const ms = kind === 'dialog' ? 150 : 300;
    setTimeout(() => {
      overlay.remove();
      unlockScroll();
      openOverlays = openOverlays.filter((o) => o !== api);
      if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
    }, ms);
    if (onClose) onClose();
  }

  overlay.addEventListener('mousedown', (e) => {
    if (overlayCloses && e.target === overlay) close();
  });
  document.addEventListener('keydown', onDocKey, true);
  document.addEventListener('focusin', onFocusIn, true);
  openOverlays.push(api);
  // open animations
  requestAnimationFrame(() => {
    overlay.classList.add('open');
    const target = panel.querySelector('[data-autofocus]') || panel.querySelector('button, input, select');
    if (target) target.focus({ preventScroll: true });
  });
  return api;
};

// ── toasts (sonner-style, dark, bottom-right, close button) ──
(function initToaster() {
  const viewport = h('div', { class: 'toast-viewport', 'aria-live': 'polite', 'aria-label': 'Notifications' });
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(viewport));
  // script runs before DOMContentLoaded only if defer-less and in head; we are at body end — safe to append now
  document.body.appendChild(viewport);

  window.toast = function toast(msg, opts) {
    opts = opts || {};
    const duration = opts.duration === undefined ? 4000 : opts.duration;
    const t = h('div', { class: 'toast' + (opts.success ? ' toast-success' : ''), role: 'status' });
    const content = h('div', { class: 'toast-content' });
    if (opts.success) {
      content.appendChild(h('span', { class: 'toast-icon', html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>' }));
    }
    const textWrap = h('div', { class: 'toast-text' });
    textWrap.appendChild(h('div', { class: 'toast-title', text: msg }));
    if (opts.description) textWrap.appendChild(h('div', { class: 'toast-desc', text: opts.description }));
    content.appendChild(textWrap);
    t.appendChild(content);
    const closeBtn = h('button', { type: 'button', class: 'toast-close', 'aria-label': 'Close notification', html: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' });
    t.appendChild(closeBtn);
    viewport.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    let timer = null;
    if (duration !== Infinity) timer = setTimeout(dismiss, duration);
    function dismiss() {
      if (timer) clearTimeout(timer);
      t.classList.remove('show');
      t.classList.add('hide');
      setTimeout(() => t.remove(), 250);
    }
    closeBtn.addEventListener('click', dismiss);
    return { dismiss };
  };
  window.toast.success = function (msg, opts) { return window.toast(msg, Object.assign({}, opts, { success: true })); };
})();

// ── Term: glossary hover/tap tooltip (HoverCard equivalent) ──
let termCard = null, termTimer = null, termOpenFor = null;
window.Term = function Term(t) {
  const g = window.LAB.GLOSSARY.find((x) => x.term.toLowerCase() === t.toLowerCase());
  if (!g) return h('span', { text: t });
  const btn = h('button', {
    type: 'button', class: 'term', text: g.term,
    'aria-label': `${g.term}: ${g.def}`,
  });
  function show() {
    clearTimeout(termTimer);
    if (termOpenFor === btn) return;
    hideCard();
    termOpenFor = btn;
    termCard = h('div', { class: 'hovercard', role: 'tooltip' },
      h('div', { class: 'hovercard-term', text: g.term }),
      h('div', { class: 'hovercard-def', text: g.def }));
    document.body.appendChild(termCard);
    const r = btn.getBoundingClientRect();
    const cw = 288, ch = termCard.offsetHeight;
    let top = r.top - ch - 8;
    if (top < 8) top = r.bottom + 8;
    let left = Math.min(Math.max(8, r.left), window.innerWidth - cw - 8);
    termCard.style.top = top + 'px';
    termCard.style.left = left + 'px';
    termCard.classList.add('show');
  }
  function scheduleHide() {
    clearTimeout(termTimer);
    termTimer = setTimeout(hideCard, 140);
  }
  function hideCard() {
    if (termCard) { termCard.remove(); termCard = null; }
    termOpenFor = null;
  }
  btn.addEventListener('mouseenter', show);
  btn.addEventListener('mouseleave', scheduleHide);
  btn.addEventListener('focus', show);
  btn.addEventListener('blur', scheduleHide);
  btn.addEventListener('click', (e) => { e.stopPropagation(); if (termOpenFor === btn) hideCard(); else show(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && termOpenFor === btn) { hideCard(); btn.focus(); } });
  return btn;
};

// ── Switch (shadcn switch: 32×18 track, 16px thumb, native button) ──
window.Switch = function Switch(checked, label, onChange) {
  const btn = h('button', {
    type: 'button', class: 'lab-switch', role: 'switch', 'aria-checked': checked ? 'true' : 'false',
    'aria-label': label,
  }, h('span', { class: 'lab-switch-thumb' }));
  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-checked') !== 'true';
    btn.setAttribute('aria-checked', next ? 'true' : 'false');
    onChange(next);
  });
  btn._setChecked = (v) => btn.setAttribute('aria-checked', v ? 'true' : 'false');
  return btn;
};

// ── Select (native, styled like the Radix trigger; keyboard-accessible) ──
window.LabSelect = function LabSelect(options, value, label, onChange) {
  // options: [{v, t}], value: current or '' (shows placeholder), label: aria-label
  const sel = h('select', { class: 'lab-select', 'aria-label': label });
  for (const o of options) {
    const opt = h('option', { value: o.v, text: o.t });
    if (o.disabled) opt.disabled = true;
    sel.appendChild(opt);
  }
  sel.value = value;
  if (!value) sel.classList.add('empty');
  sel.addEventListener('change', () => {
    sel.classList.toggle('empty', sel.value === '');
    onChange(sel.value);
  });
  sel._setValue = (v) => { if (sel.value !== v) sel.value = v; sel.classList.toggle('empty', v === ''); };
  return sel;
};

// ── Slider (native range, shadcn look: 6px track, 16px thumb) ──
window.LabSlider = function LabSlider(min, max, step, value, label, onChange) {
  const input = h('input', { type: 'range', class: 'lab-slider', min, max, step, value, 'aria-label': label });
  function paint() {
    const pct = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.background = `linear-gradient(to right, #262626 0% ${pct}%, #f4f4f5 ${pct}% 100%)`;
  }
  paint();
  input.addEventListener('input', () => { paint(); onChange(Number(input.value)); });
  input._setValue = (v) => { if (input.value !== String(v)) { input.value = String(v); paint(); } };
  return input;
};

// ── Tabs (ARIA tabs with arrow-key activation, like Radix) ──
window.Tabs = function Tabs(names, initial) {
  const root = h('div', { class: 'lab-tabs' });
  const list = h('div', { class: 'tabs-list', role: 'tablist' });
  const panels = {};
  const triggers = [];
  let current = initial;
  names.forEach((name, i) => {
    const trig = h('button', {
      type: 'button', role: 'tab', id: `tab-${name}`, class: 'tab-trigger',
      'aria-selected': name === current ? 'true' : 'false', 'aria-controls': `panel-${name}`, tabindex: name === current ? '0' : '-1', text: name,
    });
    trig.addEventListener('click', () => select(name));
    trig.addEventListener('keydown', (e) => {
      let idx = names.indexOf(current);
      if (e.key === 'ArrowRight') idx = (idx + 1) % names.length;
      else if (e.key === 'ArrowLeft') idx = (idx - 1 + names.length) % names.length;
      else if (e.key === 'Home') idx = 0;
      else if (e.key === 'End') idx = names.length - 1;
      else return;
      e.preventDefault();
      select(names[idx]);
      triggers[idx].focus();
    });
    triggers.push(trig);
    list.appendChild(trig);
    const panel = h('div', { class: 'tab-panel', role: 'tabpanel', id: `panel-${name}`, 'aria-labelledby': `tab-${name}`, tabindex: '0' });
    panels[name] = panel;
    root.appendChild(list);
  });
  names.forEach((n) => root.appendChild(panels[n]));
  function select(name) {
    current = name;
    triggers.forEach((t) => {
      const on = t.textContent === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    for (const [n, p] of Object.entries(panels)) p.style.display = n === name ? '' : 'none';
  }
  select(initial);
  root._panel = (n) => panels[n];
  return root;
};

// ── Accordion item (Radix: animated open/close, chevron flip) ──
window.AccordionItem = function AccordionItem(open, headContent, bodyContent) {
  const contentId = 'acc-' + Math.random().toString(36).slice(2, 8);
  const item = h('div', { class: 'acc-item' + (open ? ' open' : '') });
  const trig = h('button', {
    type: 'button', class: 'acc-trigger', 'aria-expanded': open ? 'true' : 'false', 'aria-controls': contentId,
  }, headContent, window.icon('chevron-down', 'acc-chevron'));
  const region = h('div', { class: 'acc-content', id: contentId, role: 'region' });
  const inner = h('div', { class: 'acc-inner' });
  inner.appendChild(bodyContent);
  region.appendChild(inner);
  trig.addEventListener('click', () => {
    const openNow = item.classList.toggle('open');
    trig.setAttribute('aria-expanded', openNow ? 'true' : 'false');
  });
  item.appendChild(trig);
  item.appendChild(region);
  return item;
};

// ── shared bits ──
window.Panel = function Panel(attrs) {
  attrs = attrs || {};
  return h('div', Object.assign({ class: 'panel ' + (attrs.class || '') }, attrs));
};
window.SectionHead = function SectionHead(kicker, title, sub) {
  const head = h('div', { class: 'section-head' },
    h('div', { class: 'kicker', text: kicker }),
    h('h2', { class: 'section-title', text: title }));
  // always present so regions can update it later (e.g. the floor's n/17 counter)
  const subP = h('p', { class: 'section-sub' });
  if (sub) subP.textContent = sub;
  head.appendChild(subP);
  head.appendChild(h('div', { class: 'hatch', 'aria-hidden': 'true' }));
  return head;
};
window.LogBox = function LogBox(title, lines, tone) {
  return h('div', { class: 'logbox' },
    h('div', { class: 'logbox-head' },
      h('span', { class: 'logbox-title' + (tone === 'alarm' ? ' alarm' : ''), text: title }),
      h('span', { class: 'logbox-tag', text: 'training data · synthetic' })),
    h('pre', { class: 'logbox-pre', 'aria-label': `${title} log contents`, text: lines.join('\n') }));
};
window.StatusChip = function StatusChip(pass, text) {
  return h('span', { class: 'status-chip ' + (pass ? 'chip-pass' : 'chip-fail'), text });
};
window.ProgressRing = function ProgressRing(pct, size, label) {
  size = size || 44;
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, pct));
  const wrap = h('div', { class: 'ring-wrap', role: 'img', 'aria-label': `Progress ${filled}%` });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size); svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.style.transform = 'rotate(-90deg)';
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bg.setAttribute('cx', size / 2); bg.setAttribute('cy', size / 2); bg.setAttribute('r', r);
  bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', '#2a3140'); bg.setAttribute('stroke-width', 4);
  const fg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  fg.setAttribute('cx', size / 2); fg.setAttribute('cy', size / 2); fg.setAttribute('r', r);
  fg.setAttribute('fill', 'none'); fg.setAttribute('stroke', '#ffb020'); fg.setAttribute('stroke-width', 4);
  fg.setAttribute('stroke-dasharray', c); fg.setAttribute('stroke-dashoffset', c * (1 - filled / 100));
  fg.setAttribute('stroke-linecap', 'round');
  fg.style.transition = 'stroke-dashoffset 0.5s ease';
  svg.appendChild(bg); svg.appendChild(fg);
  wrap.appendChild(svg);
  wrap.appendChild(h('span', { class: 'ring-label', text: label !== undefined ? label : `${filled}%` }));
  wrap._update = (p2, label2) => {
    const f = Math.max(0, Math.min(100, p2));
    fg.setAttribute('stroke-dashoffset', c * (1 - f / 100));
    wrap.querySelector('.ring-label').textContent = label2 !== undefined ? label2 : `${f}%`;
    wrap.setAttribute('aria-label', `Progress ${f}%`);
  };
  return wrap;
};
window.Stars = function Stars(n, size) {
  size = size || 16;
  const wrap = h('span', { class: 'stars', 'aria-label': `${n} of 3 stars` });
  for (let i = 1; i <= 3; i++) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size); svg.setAttribute('height', size); svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
    path.setAttribute('fill', i <= n ? '#ffb020' : 'none');
    path.setAttribute('stroke', i <= n ? '#ffb020' : '#4a5266');
    path.setAttribute('stroke-width', 2);
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('aria-hidden', 'true');
    svg.appendChild(path);
    wrap.appendChild(svg);
  }
  wrap._update = (n2) => {
    wrap.setAttribute('aria-label', `${n2} of 3 stars`);
    wrap.querySelectorAll('svg').forEach((svg, i) => {
      const pathEl = svg.querySelector('path');
      pathEl.setAttribute('fill', i < n2 ? '#ffb020' : 'none');
      pathEl.setAttribute('stroke', i < n2 ? '#ffb020' : '#4a5266');
    });
  };
  return wrap;
};
// linear progress (shadcn Progress: h-1.5, track bg-primary/20, fill bg-primary)
window.ProgressBar = function ProgressBar(cls) {
  const track = h('div', { class: 'lab-progress ' + (cls || ''), role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' });
  const fill = h('div', { class: 'lab-progress-fill' });
  track.appendChild(fill);
  track._update = (pct, ariaLabel) => {
    fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
    track.setAttribute('aria-valuenow', String(Math.round(pct)));
    if (ariaLabel) track.setAttribute('aria-label', ariaLabel);
  };
  return track;
};
// toggle row (label + caption + switch) used across consoles
window.ToggleRow = function ToggleRow(label, caption, checked, onChange) {
  const row = h('div', { class: 'toggle-row' });
  const sw = window.Switch(checked, label, onChange);
  row.appendChild(h('div', { class: 'toggle-copy' },
    h('div', { class: 'toggle-label', text: label }),
    h('div', { class: 'toggle-caption', text: caption })));
  row.appendChild(sw);
  row._sw = sw;
  return row;
};
// MCQ fieldset with native radios (44px targets)
window.McField = function McField(opts) {
  // opts: {legend, question, options:[{v,t}], value, name, onChange}
  const fs = h('fieldset', { class: 'mc-field' });
  fs.appendChild(h('legend', { class: 'mc-legend', text: opts.legend || 'question' }));
  fs.appendChild(h('div', { class: 'mc-question', text: opts.question }));
  const group = h('div', { class: 'mc-group', role: 'radiogroup', 'aria-label': opts.question });
  opts.options.forEach((o, i) => {
    const id = `${opts.name}-${o.v}`;
    const lab = h('label', { class: 'mc-option', for: id });
    const radio = h('input', { type: 'radio', id, name: opts.name, value: o.v });
    radio.checked = opts.value === o.v;
    radio.addEventListener('change', () => { if (radio.checked) opts.onChange(o.v); });
    lab.appendChild(radio);
    lab.appendChild(h('span', { text: o.t }));
    group.appendChild(lab);
  });
  fs.appendChild(group);
  fs._setValue = (v) => {
    group.querySelectorAll('input[type=radio]').forEach((r) => { r.checked = r.value === v; });
  };
  fs._group = group;
  return fs;
};
})();
