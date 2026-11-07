/* ==========================================================================
   NIMBUS TOWER — js/ui.js
   DOM helpers + shared UI atoms + inline lucide icons + a11y dialog manager.
   Icons are the exact Lucide SVG paths used by the original (no icon CDN).
   ========================================================================== */
(function (root) {
  'use strict';

  var LAB = root.LAB;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---------- tiny DOM builder ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v; // trusted internal markup only
        else if (k === 'text') node.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else node.setAttribute(k, v === true ? '' : String(v));
      });
    }
    var kids;
    if (children === null || children === undefined) kids = [];
    else if (typeof children === 'string') kids = [children];
    else if (children.nodeType) kids = [children]; // single element
    else kids = children;
    kids.forEach(function (c) { if (c !== null && c !== undefined) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  LAB.el = el;

  function svgEl(inner, attrs) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    if (attrs) Object.keys(attrs).forEach(function (k) { svg.setAttribute(k, attrs[k]); });
    svg.innerHTML = inner;
    return svg;
  }

  /* ---------- lucide icons (exact paths) ---------- */
  var ICONS = {
    'radio-tower': '<path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/><path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"/><circle cx="12" cy="9" r="2"/><path d="M16.2 4.8c2 2 2.26 5.1.8 7.47"/><path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1"/><path d="M9.5 18h5"/><path d="m8 22 4-11 4 11"/>',
    'tower-control': '<circle cx="6" cy="5" r="1.5"/><path d="M8.5 8.5 12 12"/><path d="m14 5 6 6"/><path d="M16 21v-6"/><path d="M17.189 9.173 6.95 12.743a1 1 0 0 0-.627 1.266l1.855 5.092a1 1 0 0 0 1.267.626L19.69 16.16a1 1 0 0 0 .626-1.267l-1.855-5.092a1 1 0 0 0-1.272-.628z"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91"/><path d="M12 18h.01"/><path d="M17.99 11.66a6 6 0 0 1-2.22 4.75"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'circle-dollar-sign': '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    tags: '<path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/>',
    'check-circle-2': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'circle-dashed': '<circle cx="12" cy="12" r="10" stroke-dasharray="4 3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'notebook-pen': '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L21 6l-4-4 .7-.7z"/><path d="m9 12 5.5-5.5 4 4L13 16H9z"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  };

  LAB.icon = function (name, cls) {
    var s = svgEl(ICONS[name] || '', cls ? { class: cls } : null);
    return s;
  };

  /* ---------- shared atoms ---------- */

  // Panel: section with header (accent dot + title + sub) and body
  LAB.panel = function (opts, bodyChildren) {
    var accentColor = opts.accent === 'green' ? '#35E08C' : opts.accent === 'amber' ? '#FFB454' : opts.accent === 'coral' ? '#FF6B6B' : opts.accent === 'cyan' ? '#5FD4E8' : '#8FA0B5';
    var head = el('header', { class: 'panel-head' }, [
      el('h3', { class: 'panel-title' }, [
        el('span', { class: 'dot', 'aria-hidden': 'true', style: { backgroundColor: accentColor } }),
        opts.title,
      ]),
      opts.sub ? el('span', { class: 'panel-sub' }, opts.sub) : null,
    ]);
    return el('section', { class: 'panel' + (opts.className ? ' ' + opts.className : ''), 'aria-label': opts.title }, [
      head,
      el('div', { class: 'panel-body' }, bodyChildren),
    ]);
  };

  LAB.chip = function (text, tone) {
    return el('span', { class: 'chip' + (tone && tone !== 'muted' ? ' chip-' + tone : '') }, text);
  };

  var PILLAR_META = {
    P1: { label: 'P1 · Understand', tone: 'cyan' },
    P2: { label: 'P2 · Recognize', tone: 'green' },
    P3: { label: 'P3 · Detect', tone: 'amber' },
    P4: { label: 'P4 · Mitigate', tone: 'coral' },
  };
  LAB.pillarChip = function (pillar) { return LAB.chip(PILLAR_META[pillar].label, PILLAR_META[pillar].tone); };

  // MetricBar: green < 70, amber 70–84, coral ≥ 85
  LAB.metricBar = function (value, label) {
    var color = value >= 85 ? '#FF6B6B' : value >= 70 ? '#FFB454' : '#35E08C';
    var width = Math.min(100, value);
    return el('div', { class: 'metric-bar', title: label + ': ' + value + '%' }, [
      el('span', { class: 'mb-label' }, label),
      el('div', { class: 'mb-track', role: 'img', 'aria-label': label + ' ' + value + ' percent' },
        [el('div', { class: 'mb-fill', style: { width: width + '%', backgroundColor: color } })]),
      el('span', { class: 'mb-value' }, value + '%'),
    ]);
  };

  // Sparkline: cyan polyline (parity with original bits.tsx)
  LAB.sparkline = function (data, budgetRatio) {
    var W = 120, H = 28;
    var avg = data.reduce(function (a, b) { return a + b; }, 0) / data.length;
    var max = Math.max.apply(null, data.concat([budgetRatio ? budgetRatio * avg : 0])) * 1.1;
    var pts = data.map(function (v, i) {
      return (i / (data.length - 1)) * W + ',' + (H - (v / max) * H);
    }).join(' ');
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('aria-hidden', 'true');
    svg.style.overflow = 'visible';
    var poly = document.createElementNS(SVG_NS, 'polyline');
    poly.setAttribute('points', pts); poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', '#5FD4E8'); poly.setAttribute('stroke-width', '1.5');
    svg.appendChild(poly);
    return svg;
  };

  // Donut: clearances progress ring
  LAB.donut = function (value, total, label) {
    var pct = total === 0 ? 0 : value / total;
    var r = 13, circ = 2 * Math.PI * r;
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '34'); svg.setAttribute('height', '34');
    svg.setAttribute('viewBox', '0 0 34 34');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label + ': ' + value + ' of ' + total);
    function circle(stroke, dash) {
      var c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', '17'); c.setAttribute('cy', '17'); c.setAttribute('r', r);
      c.setAttribute('fill', 'none'); c.setAttribute('stroke', stroke); c.setAttribute('stroke-width', '4');
      if (dash) {
        c.setAttribute('stroke-dasharray', dash);
        c.setAttribute('stroke-linecap', 'round');
        c.setAttribute('transform', 'rotate(-90 17 17)');
      }
      return c;
    }
    svg.appendChild(circle('#1C2836', null));
    svg.appendChild(circle('#35E08C', circ * pct + ' ' + circ));
    var t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', '17'); t.setAttribute('y', '20');
    t.setAttribute('textAnchor', 'middle'); t.setAttribute('fill', '#E8EEF6');
    t.setAttribute('fontSize', '9'); t.setAttribute('fontFamily', 'monospace');
    t.textContent = value + '/' + total;
    svg.appendChild(t);
    var wrap = el('div', { title: label }, [svg]);
    return wrap;
  };

  // Switch: role="switch", 56×44 hit area
  LAB.switchBtn = function (checked, label, onChange) {
    var btn = el('button', {
      class: 'switch', role: 'switch', 'aria-checked': checked ? 'true' : 'false',
      'aria-label': label,
      onclick: function () { onChange(btn.getAttribute('aria-checked') !== 'true'); },
    }, [
      el('span', { class: 'switch-track', 'aria-hidden': 'true' }, [
        el('span', { class: 'switch-knob', 'aria-hidden': 'true' }),
      ]),
    ]);
    LAB.switchBtn.sync = function (b, v) { b.setAttribute('aria-checked', v ? 'true' : 'false'); };
    return btn;
  };

  /* ---------- dialog manager (focus trap + restore, ESC handling) ---------- */
  var openDialogs = [];

  LAB.openDialog = function (opts) {
    // opts: { labelId, build(contentEl, close), onClose, alert (true = outside click resisted), opener }
    var overlay = el('div', { class: 'dialog-overlay' });
    var box = el('div', { class: 'dialog' + (opts.signoff ? ' signoff' : ''), role: 'alertdialog' === opts.role ? 'alertdialog' : 'dialog', 'aria-modal': 'true', 'aria-labelledby': opts.labelId });
    var close = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      openDialogs = openDialogs.filter(function (d) { return d.overlay !== overlay; });
      document.removeEventListener('keydown', onKey, true);
      if (opts.onClose) opts.onClose();
      if (opts.opener && !opts.opener.disabled && opts.opener.focus) opts.opener.focus();
    };
    var onKey = function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key === 'Tab') {
        // focus trap
        var focusables = box.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        var list = Array.prototype.filter.call(focusables, function (n) { return !n.disabled && n.offsetParent !== null; });
        if (!list.length) return;
        var first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    opts.build(box, close);
    overlay.appendChild(box);
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay && !opts.alert) close(); // sign-off closes on outside click; reset/switch resist it
    });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(overlay);
    openDialogs.push({ overlay: overlay, close: close });
    var focusables = box.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    var firstGood = Array.prototype.filter.call(focusables, function (n) { return !n.disabled; })[0];
    if (firstGood) firstGood.focus();
    return { close: close, box: box, overlay: overlay };
  };

  LAB.dialogX = function (close) {
    return el('div', { class: 'dialog-close-row' }, [
      el('button', { class: 'dialog-x', 'aria-label': 'close', onclick: close }, [LAB.icon('x')]),
    ]);
  };
})(typeof window !== 'undefined' ? window : globalThis);
