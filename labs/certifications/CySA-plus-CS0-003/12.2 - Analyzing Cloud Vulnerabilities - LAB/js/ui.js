// ─── SKYSCAN ui: rendering helpers, components as template functions ─────────
// Visual port of the original framework lab's React components
// (src/components/lab/*). Class names are SKYSCAN-specific (sk-*) and map 1:1
// to the Tailwind/shadcn patterns used by the original — see css/styles.css.

(function (SKY) {
  'use strict';

  // ── escape helper ──

  SKY.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // ── inline Lucide icons (exact SVG path data from lucide-react v0.525.0) ──

  var ICON_PATHS = {
    'key-round': '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    'server': '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
    'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    'network': '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    'radar': '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
    'app-window': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/>',
    'layers': '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    'cpu': '<path d="M12 20v2"/><path d="M12 2v2"/><path d="M17 20v2"/><path d="M17 2v2"/><path d="M2 12h2"/><path d="M2 17h2"/><path d="M2 7h2"/><path d="M20 12h2"/><path d="M20 17h2"/><path d="M20 7h2"/><path d="M7 20v2"/><path d="M7 2v2"/><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'scroll-text': '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    'scan-search': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'rotate-cw': '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    'crosshair': '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    'book-marked': '<path d="M10 2v8l3-3 3 3V2"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'play': '<polygon points="6 3 20 12 6 21 6 3"/>',
    'fast-forward': '<polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'circle-check-big': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    'circle-dashed': '<path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/>',
    'flag': '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
    'flag-off': '<path d="M16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/><path d="m2 2 20 20"/><path d="M4 22V4"/><path d="M7.656 2H8c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10.347"/>',
    'file-search': '<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="m9 18-1.5-1.5"/><circle cx="5" cy="14" r="3"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'circle-x': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    'map': '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'swords': '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>',
    'trophy': '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'star': '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    'star-half': '<path d="M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  };

  // size classes mirror the original's h-N w-N utilities
  SKY.icon = function (name, size) {
    var s = size || 4; // default h-4 w-4 = 16px
    return '<svg class="sk-icon sk-i' + String(s).replace('.', '_') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON_PATHS[name] || '') + '</svg>';
  };

  var DOMAIN_ICON = { identity: 'key-round', compute: 'server', storage: 'database', network: 'network', observability: 'radar', application: 'app-window' };
  var SOURCE_ICON = { 'config-check': 'layers', 'agent-scan': 'cpu', 'dast': 'globe', 'api-audit': 'scroll-text' };

  SKY.domainIcon = function (domain, size) { return SKY.icon(DOMAIN_ICON[domain] || 'server', size); };
  SKY.sourceIcon = function (source, size) { return SKY.icon(SOURCE_ICON[source] || 'layers', size); };

  // ── badges (colors mirror bits.tsx SEVERITY_CLASS / STATUS_DEF / PILLAR_DEF) ──

  SKY.severityBadge = function (severity) {
    return '<span class="sk-badge sk-sev-' + severity + '">' + SKY.esc(severity) + '</span>';
  };

  var STATUS_DEF = {
    open: { label: 'OPEN', cls: 'sk-status-open' },
    applied: { label: 'APPLIED — PENDING VERIFY', cls: 'sk-status-applied' },
    verified: { label: 'VERIFIED PASS', cls: 'sk-status-verified' },
    tracked: { label: 'TRACKED (PROVIDER)', cls: 'sk-status-tracked' },
    invalid: { label: 'INVALID (FP)', cls: 'sk-status-invalid' },
    reviewed: { label: 'REVIEWED', cls: 'sk-status-reviewed' },
  };

  SKY.statusBadge = function (status) {
    var d = STATUS_DEF[status] || STATUS_DEF.open;
    return '<span class="sk-badge ' + d.cls + '">' + d.label + '</span>';
  };

  var PILLAR_DEF = {
    P1: { label: 'P1 UNDERSTAND', cls: 'sk-pillar-p1' },
    P2: { label: 'P2 RECOGNIZE', cls: 'sk-pillar-p2' },
    P3: { label: 'P3 DETECT', cls: 'sk-pillar-p3' },
    P4: { label: 'P4 MITIGATE', cls: 'sk-pillar-p4' },
  };

  SKY.pillarBadge = function (pillar) {
    var d = PILLAR_DEF[pillar];
    return '<span class="sk-badge sk-badge-bold ' + d.cls + '">' + d.label + '</span>';
  };

  // ── posture dial (PostureDial from bits.tsx) ──

  SKY.postureDial = function (value) {
    var size = 44;
    var r = (size - 8) / 2;
    var c = 2 * Math.PI * r;
    var off = c * (1 - value / 100);
    var color = value >= 75 ? '#34d399' : value >= 50 ? '#fbbf24' : '#fb7185';
    return '<div class="sk-dial-wrap" title="Posture score: ' + value + '/100">' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Posture score ' + value + ' out of 100">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#27272a" stroke-width="5"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="5" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" stroke-linecap="round" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')" class="sk-dial-arc"/>' +
      '<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="' + color + '" font-size="' + size * 0.3 + '" font-family="monospace" font-weight="bold">' + value + '</text>' +
      '</svg></div>';
  };

  // ── modal / sheet manager (Radix Dialog & Sheet behavior) ──────────────────

  var lastFocus = null;
  var modalRoot = null;

  function ensureModalRoot() {
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'sk-modal-root';
      document.body.appendChild(modalRoot);
    }
    return modalRoot;
  }

  function focusables(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return !el.disabled && el.getAttribute('aria-hidden') !== 'true'; });
  }

  // opts: { kind: 'dialog'|'sheet-left'|'sheet-right'|'alert', labelledBy, describedBy, dismissable (overlay click), onClose }
  SKY.openModal = function (html, opts) {
    opts = opts || {};
    var root = ensureModalRoot();
    lastFocus = document.activeElement;
    var overlay = document.createElement('div');
    overlay.className = 'sk-overlay ' + (opts.kind === 'sheet-left' || opts.kind === 'sheet-right' ? 'sk-overlay-sheet' : '');
    overlay.innerHTML =
      '<div class="' + (opts.kind === 'sheet-left' || opts.kind === 'sheet-right' ? 'sk-sheet sk-sheet-' + (opts.kind === 'sheet-left' ? 'left' : 'right') : 'sk-dialog' + (opts.dialogClass ? ' ' + opts.dialogClass : '')) + '" role="dialog" aria-modal="true"' +
      (opts.labelledBy ? ' aria-labelledby="' + opts.labelledBy + '"' : '') +
      (opts.describedBy ? ' aria-describedby="' + opts.describedBy + '"' : '') +
      ' tabindex="-1">' + html + '</div>';
    root.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        SKY.closeModal();
      } else if (e.key === 'Tab') {
        var f = focusables(overlay);
        if (!f.length) return;
        var first = f[0];
        var last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    overlay.addEventListener('keydown', onKey);
    if (opts.dismissable !== false) {
      overlay.addEventListener('mousedown', function (e) {
        if (e.target === overlay) SKY.closeModal();
      });
    }
    overlay._onClose = opts.onClose;
    var focusTarget = overlay.querySelector('[data-autofocus]') || overlay.querySelector('.sk-dialog, .sk-sheet');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
    return overlay;
  };

  SKY.closeModal = function () {
    var root = ensureModalRoot();
    var overlay = root.firstElementChild;
    if (!overlay) return;
    var onClose = overlay._onClose;
    root.removeChild(overlay);
    if (root.childElementCount === 0) document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) {
      try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* detached */ }
    }
    if (onClose) onClose();
  };

  SKY.modalIsOpen = function () {
    var root = ensureModalRoot();
    return root.childElementCount > 0;
  };

  SKY.refreshModalContent = function (html, opts) {
    var root = ensureModalRoot();
    var overlay = root.firstElementChild;
    if (!overlay) return;
    var box = overlay.querySelector('.sk-dialog, .sk-sheet');
    if (box) {
      var active = document.activeElement;
      var activeId = active && active.id;
      box.innerHTML = html;
      var next = activeId ? box.querySelector('#' + activeId.replace(/([:.[])/g, '\\$1')) : null;
      if (next) next.focus({ preventScroll: true });
      else if (opts && opts.refocus) { var t = box.querySelector('[data-autofocus]') || box; t.focus({ preventScroll: true }); }
    }
  };

  // ── shared small renderers ─────────────────────────────────────────────────

  SKY.btn = function (attrs, cls, html) {
    return '<button type="button" ' + attrs + ' class="' + cls + '">' + html + '</button>';
  };

  // select with placeholder — native <select> styled like the shadcn SelectTrigger
  SKY.select = function (id, label, value, options, attrs, placeholder) {
    var ph = placeholder || 'select\u2026';
    var opts = '<option value="" disabled' + (value ? '' : ' selected') + ' hidden>' + ph + '</option>';
    options.forEach(function (op) {
      opts += '<option value="' + SKY.esc(op) + '"' + (value === op ? ' selected' : '') + '>' + SKY.esc(op) + '</option>';
    });
    return '<select id="' + id + '" aria-label="' + SKY.esc(label) + '" class="sk-select" ' + (attrs || '') + '>' + opts + '</select>';
  };
})(window.SKY);
