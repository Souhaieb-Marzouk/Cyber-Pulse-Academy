/**
 * ui.js — DOM helpers + shared UI components for the static lab.
 * ---------------------------------------------------------------------------
 * Rebuilds the shadcn/ui primitives used by the original (Select, Checkbox,
 * RadioGroup, Switch, Dialog, AlertDialog, Tooltip, Toast) as small, readable
 * vanilla components with the same look, states and accessibility contract.
 * Event wiring uses data-action delegation in app.js.
 */

/* ================================ tiny DOM helpers ================================ */

/** Escape a string for safe interpolation into HTML. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Lucide icon shortcut. */
function ic(name, cls, filled) {
  return LabIcons.icon(name, cls, filled);
}

/** querySelector shortcuts. */
function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

/**
 * Re-render a region while preserving focus + text selection of the control
 * the user was interacting with (mirrors React's reconciliation behavior).
 */
function withFocusPreserved(renderFn) {
  const active = document.activeElement;
  const fid = active && active.getAttribute ? active.getAttribute('data-fid') : null;
  const selStart = active && typeof active.selectionStart === 'number' ? active.selectionStart : null;
  renderFn();
  if (fid) {
    const next = document.querySelector('[data-fid="' + fid + '"]');
    if (next) {
      try { next.focus({ preventScroll: true }); } catch (e) { next.focus(); }
      if (selStart !== null && typeof next.setSelectionRange === 'function') {
        try { next.setSelectionRange(selStart, selStart); } catch (e) { /* not a text input */ }
      }
    }
  }
}

/** Screen-reader announcement (mirrors the original aria-live feedback blocks). */
function announce(text) {
  const el = $('#sr-live');
  if (!el) return;
  el.textContent = '';
  window.setTimeout(function () { el.textContent = text; }, 30);
}

/* ================================ design-system pieces ================================ */

/** Audit stamp (rotated rubber-stamp look, from bits.tsx). */
function stampHTML(text, tone, size) {
  const tones = { red: 'stamp-red', green: 'stamp-green', amber: 'stamp-amber' };
  const sizes = { sm: 'stamp-sm', md: 'stamp-md', lg: 'stamp-lg' };
  return '<span class="stamp ' + (tones[tone] || 'stamp-red') + ' ' + (sizes[size] || 'stamp-md') +
    '" aria-label="Stamp: ' + esc(text) + '">' + esc(text) + '</span>';
}

/** Pillar badge (Understand/Analyze/Detect/Mitigate). */
function pillarBadge(pillar, cls) {
  return '<span class="pillar-badge pillar-' + pillar.toLowerCase() + (cls ? ' ' + cls : '') + '">' + pillar + '</span>';
}

/** Generic outline badge. */
function badge(text, cls) {
  return '<span class="badge' + (cls ? ' ' + cls : '') + '">' + text + '</span>';
}

/** Score ring (masthead) — SVG circle with animated dash offset. */
function scoreRingHTML(pct, label) {
  const R = 15.5;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct / 100);
  return (
    '<div class="score-ring" role="img" aria-label="' + esc(label) + ': ' + pct + '%">' +
      '<svg width="40" height="40" viewBox="0 0 40 40" class="score-ring-svg">' +
        '<circle cx="20" cy="20" r="' + R + '" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="4" />' +
        '<circle cx="20" cy="20" r="' + R + '" fill="none" stroke="#F2D9A0" stroke-width="4" stroke-linecap="round" ' +
          'stroke-dasharray="' + C + '" stroke-dashoffset="' + offset + '" class="score-ring-fg" data-ring-c="' + C + '" />' +
      '</svg>' +
      '<div class="score-ring-label">' +
        '<div class="score-ring-pct">' + pct + '%</div>' +
        '<div class="score-ring-cap">' + esc(label) + '</div>' +
      '</div>' +
    '</div>'
  );
}

/** Coverage bar (estate). Width animates via CSS transition. */
function coverageBarHTML(pct) {
  const color = pct >= 75 ? 'bar-green' : pct >= 40 ? 'bar-amber' : 'bar-red';
  return (
    '<div class="coverage-bar" role="presentation">' +
      '<div class="coverage-bar-fill ' + color + '" style="width:' + pct + '%"></div>' +
    '</div>'
  );
}

/* ================================ form controls ================================ */

/**
 * Native <select> styled like the shadcn SelectTrigger (44px, chevron).
 * @param {Object} o {fid, value, placeholder, ariaLabel, className, mono, options:[{value,label}]}
 */
function selectHTML(o) {
  const opts = o.options
    .map(function (opt) {
      return '<option value="' + esc(opt.value) + '"' + (String(o.value) === String(opt.value) ? ' selected' : '') + '>' + esc(opt.label) + '</option>';
    })
    .join('');
  const placeholder = o.placeholder
    ? '<option value="" disabled hidden' + (o.value ? '' : ' selected') + '>' + esc(o.placeholder) + '</option>'
    : '';
  return (
    '<span class="select-wrap' + (o.className ? ' ' + o.className : '') + '">' +
      '<select data-fid="' + esc(o.fid || '') + '" class="select' + (o.mono ? ' select-mono' : '') + '"' +
        ' aria-label="' + esc(o.ariaLabel || '') + '"' +
        (o.disabled ? ' disabled' : '') +
        (o.dataAttrs || '') +
      '>' +
        placeholder + opts +
      '</select>' +
      ic('chevron-down', 'select-chevron') +
    '</span>'
  );
}

/**
 * Switch (shadcn Switch equivalent) — a button with role="switch".
 * Renders a <button data-action="estate-toggle"> style control; the click
 * handler is bound by delegation via the caller-supplied dataAttrs.
 */
function switchHTML(checked, ariaLabel, dataAttrs) {
  return (
    '<button type="button" role="switch" aria-checked="' + (checked ? 'true' : 'false') +
      '" class="switch" aria-label="' + esc(ariaLabel) + '" ' + (dataAttrs || '') + '>' +
      '<span class="switch-thumb"></span>' +
    '</button>'
  );
}

/** Native checkbox styled like shadcn Checkbox. */
function checkboxHTML(id, checked, ariaLabel, dataAttrs, disabled) {
  return (
    '<input type="checkbox" id="' + esc(id) + '" class="checkbox" aria-label="' + esc(ariaLabel || '') + '"' +
      (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + ' ' + (dataAttrs || '') + ' />'
  );
}

/** Radio row (shadcn RadioGroupItem + Label). dataAttrs wires the change handler. */
function radioHTML(name, value, current, labelHTML, id, extraCls, dataAttrs) {
  return (
    '<span class="radio-row' + (extraCls ? ' ' + extraCls : '') + '">' +
      '<input type="radio" id="' + esc(id) + '" name="' + esc(name) + '" value="' + esc(value) + '"' +
        ' class="radio"' + (current === value ? ' checked' : '') + ' ' + (dataAttrs || '') + ' />' +
      '<label for="' + esc(id) + '" class="radio-label">' + labelHTML + '</label>' +
    '</span>'
  );
}

/* ================================ tooltip (glossary Term) ================================ */

const Tooltip = {
  el: null,
  hideTimer: null,
  ensure: function () {
    if (!this.el) this.el = $('#tooltip');
    return this.el;
  },
  show: function (trigger) {
    const el = this.ensure();
    if (!el) return;
    window.clearTimeout(this.hideTimer);
    el.innerHTML = '<span class="tooltip-term">' + esc(trigger.getAttribute('data-term')) + ':</span> ' + esc(trigger.getAttribute('data-def'));
    el.hidden = false;
    const r = trigger.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    el.style.left = '0px';
    el.style.top = '0px';
    const tw = el.offsetWidth;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    el.style.left = left + 'px';
    el.style.top = r.top + scrollY - el.offsetHeight - 8 + 'px';
  },
  hide: function () {
    const el = this.ensure();
    if (!el) return;
    this.hideTimer = window.setTimeout(function () { el.hidden = true; }, 80);
  },
};

/** Glossary term button (dotted underline; tooltip on hover/focus). */
function termHTML(term, def, children) {
  return (
    '<button type="button" class="term-btn" data-term="' + esc(term) + '" data-def="' + esc(def) + '" ' +
      'aria-label="' + esc(term + ': ' + def) + '">' + (children || esc(term)) + '</button>'
  );
}

function glossaryTerm(t) {
  const g = GLOSSARY.find(function (x) { return x.term === t; });
  return g;
}

/* ================================ modal (Dialog / AlertDialog) ================================ */

const Modal = {
  current: null,

  /**
   * Open a modal dialog.
   * @param {Object} o {body: string, labelledId: string, dismissable: bool, onClose: fn, cls: string}
   * @returns {function} close()
   */
  open: function (o) {
    this.close(true);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay' + (o.cls ? ' ' + o.cls : '');
    overlay.innerHTML =
      '<div class="modal' + (o.cls ? ' ' + o.cls : '') + '" role="dialog" aria-modal="true" aria-labelledby="' + esc(o.labelledId) + '">' +
        o.body +
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const self = this;
    const modalEl = $('.modal', overlay);

    function onKeydown(e) {
      if (e.key === 'Escape' && o.dismissable !== false) { self.close(); return; }
      if (e.key === 'Tab') {
        // Basic focus trap
        const focusables = $all('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modalEl)
          .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function onOverlayClick(e) {
      if (e.target === overlay && o.dismissable !== false) self.close();
    }
    this.keyHandler = onKeydown;
    this.clickHandler = onOverlayClick;
    document.addEventListener('keydown', onKeydown, true);
    overlay.addEventListener('mousedown', onOverlayClick);
    this.overlayEl = overlay;
    this.onClose = o.onClose || null;
    this.prevFocus = document.activeElement;

    // Move focus into the dialog
    const target = $('.modal [data-autofocus]', overlay) || $('button, [href], input', modalEl);
    if (target) window.setTimeout(function () { try { target.focus(); } catch (e) { /* noop */ } }, 30);

    this.current = overlay;
    return function () { self.close(); };
  },

  close: function (silent) {
    if (!this.current) return;
    const overlay = this.current;
    document.removeEventListener('keydown', this.keyHandler, true);
    overlay.remove();
    document.body.style.overflow = '';
    this.current = null;
    if (this.prevFocus && this.prevFocus.focus && !silent) {
      try { this.prevFocus.focus(); } catch (e) { /* noop */ }
    }
    const cb = this.onClose;
    this.onClose = null;
    if (cb && !silent) cb();
  },
};

/* ================================ toast ================================ */

/** Show a toast (mirrors the shadcn toast used on objective pass; limit 1 like the original). */
function toast(title, description) {
  const viewport = $('#toast-viewport');
  if (!viewport) return;
  // The original lab runs with TOAST_LIMIT = 1 — replace any existing toast.
  $all('.toast', viewport).forEach(function (t) { t.remove(); });
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML =
    '<div class="toast-content">' +
      '<div class="toast-title">' + title + '</div>' +
      (description ? '<div class="toast-desc">' + esc(description) + '</div>' : '') +
    '</div>' +
    '<button type="button" class="toast-close" aria-label="Dismiss notification">' + ic('x', 'h-4 w-4') + '</button>';
  viewport.appendChild(el);
  announce(title + (description ? '. ' + description : ''));
  const dismiss = function () {
    if (!el.parentNode) return;
    el.classList.add('toast-out');
    window.setTimeout(function () { el.remove(); }, 200);
  };
  $('.toast-close', el).addEventListener('click', dismiss);
  window.setTimeout(dismiss, 5000);
}
