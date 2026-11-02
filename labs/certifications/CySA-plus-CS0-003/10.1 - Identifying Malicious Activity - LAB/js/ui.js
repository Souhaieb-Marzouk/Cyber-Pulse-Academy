/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab 101 — js/ui.js
   Rendering helpers and shared visual primitives (translated from the
   original ui-bits + shadcn primitives): icon helper, escaping, panel
   builders, badges, synth banner, terminal-line syntax accenting, toast
   system (sonner-equivalent, bottom-right, dark) and the modal system with
   focus trap (Dialog + AlertDialog equivalents).
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const UI = (() => {
  /* ---------------------------------- esc ---------------------------------- */
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* --------------------------------- icons --------------------------------- */
  /** Inline SVG via the sprite embedded in index.html (lucide paths, ISC). */
  function icon(name, cls = '') {
    return `<svg class="icon ${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
  }

  /* ------------------------------ micro label ------------------------------ */
  function micro(text, extraCls = '') {
    return `<div class="micro ${extraCls}">${esc(text)}</div>`;
  }

  /* -------------------------------- badges --------------------------------- */
  function sevBadge(sev) {
    return `<span class="sev ${esc(sev)}">${esc(sev)}</span>`;
  }

  const PILLAR_LABELS = { P1: 'UNDERSTAND', P2: 'RECOGNIZE', P3: 'DETECT', P4: 'MITIGATE' };
  function pillarBadge(pillar) {
    return `<span class="pillar-badge">${esc(pillar)} · ${PILLAR_LABELS[pillar] ?? ''}</span>`;
  }

  function objTag(id) {
    return `<span class="obj-tag">${esc(id)}</span>`;
  }

  function synthBanner(cls = '') {
    return `<div role="note" class="synth-banner ${cls}">SYNTHETIC TRAINING DATA — every artifact in this lab is fabricated for education. Nothing here touches real systems.</div>`;
  }

  /* ------------------------------ panel helpers ---------------------------- */
  function panel(opts, inner) {
    const { id = '', ariaLabel = '', cls = '' } = opts ?? {};
    return `<section ${id ? `id="${esc(id)}"` : ''} ${ariaLabel ? `aria-label="${esc(ariaLabel)}"` : ''} class="panel ${cls}">${inner}</section>`;
  }

  function panelHeader(title, right = '') {
    return `<header class="panel-header">${micro(title, 'bright')}${right}</header>`;
  }

  function panelBody(inner, extraCls = '') {
    return `<div class="panel-body ${extraCls}">${inner}</div>`;
  }

  /* --------------------------- term line rendering -------------------------
     Monospace line with light syntax accenting: IPs amber, 64-hex hashes
     green, echoed commands dimmed. Built with textContent — no HTML
     injection from data. */
  const IP_RE = /\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g;
  const HASH_RE = /\b[0-9a-f]{64}\b/g;

  function termLine(line) {
    const div = document.createElement('div');
    div.className = 'term-line' + (line.startsWith('$ ') ? ' cmd' : '');
    const marks = [];
    for (const m of line.matchAll(IP_RE)) marks.push({ start: m.index, end: m.index + m[0].length, cls: 'hl-ip' });
    for (const m of line.matchAll(HASH_RE)) marks.push({ start: m.index, end: m.index + m[0].length, cls: 'hl-hash' });
    marks.sort((a, b) => a.start - b.start);
    let cursor = 0;
    for (const mk of marks) {
      if (mk.start < cursor) continue;
      if (mk.start > cursor) div.appendChild(document.createTextNode(line.slice(cursor, mk.start)));
      const span = document.createElement('span');
      span.className = mk.cls;
      span.textContent = line.slice(mk.start, mk.end);
      div.appendChild(span);
      cursor = mk.end;
    }
    if (cursor < line.length) div.appendChild(document.createTextNode(line.slice(cursor)));
    return div;
  }

  /* --------------------------------- toasts --------------------------------
     Sonner-equivalent: dark, bottom-right, rich colors, close button,
     auto-dismiss. role="status" region announced politely. */
  const TOAST_MS = 5000;

  function toast(kind, title, description) {
    let region = document.getElementById('toast-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'toast-region';
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    const ic = kind === 'success' ? 'check-circle-2' : 'info';
    el.innerHTML = `
      ${icon(ic, 't-icon')}
      <div class="t-body">
        <div class="t-title">${esc(title)}</div>
        ${description ? `<div class="t-desc">${esc(description)}</div>` : ''}
      </div>
      <button type="button" class="t-close" aria-label="Dismiss notification">${icon('x-circle')}</button>`;
    region.appendChild(el);
    const close = () => {
      if (!el.isConnected) return;
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 220);
    };
    el.querySelector('.t-close').addEventListener('click', close);
    setTimeout(close, TOAST_MS);
    /* keep the stack bounded, like sonner's visible limit */
    while (region.children.length > 4) region.firstElementChild.remove();
  }

  function toastSuccess(title, description) {
    toast('success', title, description);
  }
  function toastMessage(title, description) {
    toast('info', title, description);
  }

  /* --------------------------------- modals --------------------------------
     Single modal root. Focus is trapped inside; Escape closes (and for the
     completion dialog, clicking the overlay closes too — matching the
     Radix Dialog used originally; the reset AlertDialog does not close on
     overlay click, matching Radix AlertDialog). */
  const modalRoot = () => document.getElementById('modal-root');
  let modalOnClose = null;

  function openModal({ role = 'dialog', cls = '', labelledId, build, onClose, closeOnOverlay = true }) {
    closeModal();
    modalOnClose = onClose ?? null;
    const root = modalRoot();
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<div class="modal ${cls}" role="${role}" aria-modal="true" ${labelledId ? `aria-labelledby="${esc(labelledId)}"` : ''}></div>`;
    root.appendChild(overlay);
    const modalEl = overlay.firstElementChild;
    const close = () => closeModal(); /* fires the modal's onClose callback */
    build(modalEl);

    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay && closeOnOverlay) close();
    });

    overlay._trap = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = modalEl.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    overlay.addEventListener('keydown', overlay._trap);

    /* initial focus: first focusable (or the panel itself) */
    const initFocus = modalEl.querySelector('a[href], button:not(:disabled), input, select');
    (initFocus ?? modalEl).focus?.();

    return modalEl;
  }

  function closeModal() {
    const root = modalRoot();
    if (root && root.firstElementChild) {
      root.firstElementChild.remove();
    }
    const cb = modalOnClose;
    modalOnClose = null;
    if (cb) cb();
  }

  /** Drop any open modal WITHOUT firing its close callback (used when the
   * route changes and the modal's lifetime simply ends, like Radix unmount). */
  function clearModals() {
    const root = modalRoot();
    if (root) root.innerHTML = '';
    modalOnClose = null;
  }

  /** Only close if the completion modal is what's open (guard for Escape). */
  function isModalOpen() {
    const root = modalRoot();
    return !!(root && root.firstElementChild);
  }

  /* --------------------- focus-preserving re-render ------------------------ */

  /** Replace a container's HTML while restoring focus + caret position for
   * the focused element (matched by data-fk key). Keeps typing seamless. */
  function rerenderWithFocus(container, renderFn) {
    const active = document.activeElement;
    const key = active instanceof HTMLElement && container.contains(active) ? active.getAttribute('data-fk') : null;
    let selStart = null;
    let selEnd = null;
    if (key && 'selectionStart' in active) {
      try {
        selStart = active.selectionStart;
        selEnd = active.selectionEnd;
      } catch {
        /* non-text element */
      }
    }
    renderFn();
    if (key) {
      const el = container.querySelector(`[data-fk="${CSS.escape(key)}"]`);
      if (el) {
        el.focus({ preventScroll: true });
        if (selStart != null && 'setSelectionRange' in el) {
          try {
            el.setSelectionRange(selStart, selEnd);
          } catch {
            /* not a text input */
          }
        }
      }
    }
  }

  return {
    esc,
    icon,
    micro,
    sevBadge,
    pillarBadge,
    objTag,
    synthBanner,
    panel,
    panelHeader,
    panelBody,
    termLine,
    toast,
    toastSuccess,
    toastMessage,
    openModal,
    closeModal,
    clearModals,
    isModalOpen,
    rerenderWithFocus,
  };
})();
