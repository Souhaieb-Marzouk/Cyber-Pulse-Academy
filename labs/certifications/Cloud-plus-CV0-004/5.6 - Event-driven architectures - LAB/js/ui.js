// ─── Shared lab UI bits ──────────────────────────────────────────────────────
// Ported from the original ui-bits.tsx + the shadcn primitives the lab uses.
// Classic-script global functions (no modules) so the lab also runs via file://.
'use strict';

/* ── tiny DOM builder ── */
// h('div', { class: 'card', onclick: fn, aria_label: 'x' }, child, child, ...)
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v; // trusted markup only (inline icons)
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k.replace(/_/g, '-'), String(v));
    }
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Inline Lucide icon (bundled markup in icons.js — no CDN). */
function icon(name, cls) {
  const wrap = h('span', {
    class: 'icon ' + (cls || ''),
    'aria-hidden': 'true',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ''}</svg>`,
  });
  return wrap;
}

/* ── design tokens as JS constants for inline styles ── */
const TYPE_COLOR = { queue: '#2dd4bf', topic: '#fbbf24', stream: '#a3e635' };
const TYPE_LABEL = { queue: 'queue', topic: 'pub/sub topic', stream: 'stream' };
const KIND_COLOR = { producer: 'text-teal-300', broker: 'text-amber-300', consumer: 'text-emerald-300' };

const PILLAR_META = {
  P1: { label: 'UNDERSTAND', color: 'chip-pillar-p1', ring: 'bg-teal-400' },
  P2: { label: 'RECOGNIZE', color: 'chip-pillar-p2', ring: 'bg-amber-400' },
  P3: { label: 'OBSERVE', color: 'chip-pillar-p3', ring: 'bg-rose-400' },
  P4: { label: 'HARDEN', color: 'chip-pillar-p4', ring: 'bg-emerald-400' },
};

function pillarBadge(pillar) {
  const m = PILLAR_META[pillar];
  return h('span', { class: 'badge badge-outline ' + m.color + ' badge-pillar' }, m.label);
}

/* ── ChipSelect (ui-bits.tsx) — toggle chips; append mode for the path builder ── */
function chipSelect({ options, value, onChange, multi = false, exactN, ariaLabel, size = 'md', append = false }) {
  const group = h('div', { role: 'group', 'aria-label': ariaLabel, class: 'chip-row' + (size === 'sm' ? ' chip-row-sm' : '') });
  const toggle = (id) => {
    if (append) {
      if (!value.includes(id)) onChange([...value, id]);
      return;
    }
    if (!multi) { onChange([id]); return; }
    if (value.includes(id)) { onChange(value.filter((v) => v !== id)); return; }
    if (exactN && value.length >= exactN) { onChange([...value.slice(1), id]); return; }
    onChange([...value, id]);
  };
  for (const o of options) {
    const on = value.includes(o.id);
    group.append(h('button', {
      type: 'button',
      'aria-pressed': String(on),
      'data-fk': 'chip:' + ariaLabel + ':' + o.id,
      class: 'btn btn-chip' + (size === 'sm' ? ' btn-chip-sm' : '') + (on ? ' chip-on' : ''),
      onclick: () => toggle(o.id),
    }, o.label));
  }
  return group;
}

/* ── Select (Radix Select → native select, styled like the trigger) ── */
function sel({ value, onChange, options, label }) {
  const s = h('select', {
    'aria-label': label,
    class: 'select min-h-11' + (value ? '' : ' is-placeholder'),
    'data-fk': 'sel:' + label,
    onchange: (e) => onChange(e.target.value),
  });
  const ph = h('option', { value: '', disabled: true, selected: !value }, 'choose…');
  s.append(ph);
  for (const o of options) {
    s.append(h('option', { value: o.id, selected: value === o.id }, o.label));
  }
  return s;
}

/* ── Switch (Radix Switch → role="switch" button) ── */
function switchEl({ id, checked, onChange }) {
  const btn = h('button', {
    type: 'button',
    role: 'switch',
    id,
    'aria-checked': String(!!checked),
    'data-state': checked ? 'checked' : 'unchecked',
    class: 'switch',
    'data-fk': 'sw:' + id,
    onclick: () => onChange(!checked),
  }, h('span', { class: 'switch-thumb' }));
  return btn;
}

/* ── Checkbox (Radix Checkbox → native input, styled) ── */
function checkboxEl({ checked, onChange, ariaLabel, fk }) {
  return h('input', {
    type: 'checkbox',
    class: 'checkbox',
    'aria-label': ariaLabel,
    'data-fk': fk || 'cb:' + ariaLabel,
    ...(checked ? { checked: true } : {}),
    onchange: (e) => onChange(e.target.checked),
  });
}

/* ── StatusMirror (ObjectivesRail) ── */
function statusMirror(ok, label) {
  return h('p', { class: 'status-mirror' + (ok ? ' ok' : '') },
    icon(ok ? 'CheckCircle2' : 'CircleHelp', 'ic-12 shrink'),
    h('span', null, (ok ? '✓ ' : '○ ') + label));
}

/* ── Progress (Radix Progress) ── */
function progressBar(pct, ariaLabel) {
  return h('div', { class: 'progress', role: 'progressbar', 'aria-label': ariaLabel || 'progress', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(pct)) },
    h('div', { class: 'progress-ind', style: `transform:translateX(-${100 - (pct || 0)}%)` }));
}

/* ── Accordion item (Radix Accordion → button + collapsible panel) ── */
function accordionItem({ value, open, onToggle, triggerClass, children, contentClass }) {
  const panel = h('div', { class: 'acc-content' + (open ? ' open' : ''), 'data-value': value }, children);
  const btn = h('button', {
    type: 'button',
    'aria-expanded': String(open),
    'data-state': open ? 'open' : 'closed',
    'data-fk': 'acc:' + value,
    class: 'acc-trigger ' + (triggerClass || ''),
    onclick: onToggle,
  }, h('span', { class: 'acc-trigger-label' }), icon('ChevronDown', 'acc-chevron'));
  const item = h('div', { class: 'acc-item', 'data-state': open ? 'open' : 'closed' }, btn, panel);
  item._panel = panel;
  item._btn = btn;
  return item;
}

/* ── Dialog / AlertDialog (Radix → overlay + centered panel + focus trap) ── */
let activeDialog = null;

function openDialog({ content, onClose, alertMode = false, labelId, descId }) {
  closeDialog(false);
  const overlay = h('div', { class: 'dlg-overlay' });
  const panel = h('div', {
    class: 'dlg-panel' + (alertMode ? '' : ' completion-panel'),
    role: 'dialog',
    'aria-modal': 'true',
    ...(labelId ? { 'aria-labelledby': labelId } : {}),
    ...(descId ? { 'aria-describedby': descId } : {}),
    tabindex: '-1',
  }, content);
  // Dialog (not AlertDialog) carries a 44×44 px X close button (original QA-11 fix)
  if (!alertMode) {
    panel.append(h('button', {
      class: 'dlg-close',
      'aria-label': 'Close',
      type: 'button',
      onclick: () => userCloseDialog(),
    }, icon('X', 'ic-16'), h('span', { class: 'sr-only' }, 'Close')));
  }
  const root = h('div', { class: 'dlg-root' }, overlay, panel);
  root._prevFocus = document.activeElement;
  document.body.append(root);
  document.body.classList.add('dlg-open');
  activeDialog = { root, onClose, alertMode };

  overlay.addEventListener('mousedown', () => { if (!alertMode) userCloseDialog(); });

  function trap(e) {
    if (e.key === 'Escape') { e.preventDefault(); userCloseDialog(); return; }
    if (e.key !== 'Tab') return;
    const focusables = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', trap, true);
  root._trap = trap;
  // initial focus: first focusable, else panel
  const f = panel.querySelector('button, input, select');
  (f || panel).focus();
  return root;
}

function closeDialog(restore = true) {
  if (!activeDialog) return;
  const { root, onClose, alertMode } = activeDialog;
  document.removeEventListener('keydown', root._trap, true);
  root.remove();
  document.body.classList.remove('dlg-open');
  activeDialog = null;
  if (restore && root._prevFocus && root._prevFocus.focus) root._prevFocus.focus();
}

/** user-initiated close (X / Esc / overlay click): remove DOM, then run onClose
 *  (mirrors Radix: onOpenChange(false) fires, dialog unmounts) */
function userCloseDialog() {
  if (!activeDialog) return;
  const { onClose } = activeDialog;
  closeDialog();
  if (onClose) onClose();
}

/** Simple focus restoration: call before a rerender, re-focus after. */
function withFocusRestore(fn) {
  const prev = document.activeElement;
  const fk = prev && prev.getAttribute ? prev.getAttribute('data-fk') : null;
  fn();
  if (fk) {
    const el = document.querySelector(`[data-fk="${CSS.escape(fk)}"]`);
    if (el && el.focus) el.focus();
  } else if (prev && prev.tagName === 'BODY') {
    // nothing to restore
  }
}
