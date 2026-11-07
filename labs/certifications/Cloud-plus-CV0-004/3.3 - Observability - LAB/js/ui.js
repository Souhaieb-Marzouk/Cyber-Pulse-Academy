// ── Cloud Ward · UI primitives: dom helpers, icons, chips, charts, drawer ────
// Vanilla equivalents of src/components/lab/bits.tsx + shell.tsx Drawer.
(function (global) {
  'use strict';

  const D = global.CW_DATA;

  // ── tiny dom helpers ─────────────────────────────────────────────────────────
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (v === true) node.setAttribute(k, '');
        else node.setAttribute(k, String(v));
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c === null || c === undefined || c === false) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── icons (exact lucide paths from js/icons.js) ─────────────────────────────
  // CW_ICONS is keyed by icon-file (kebab) name; callers use the lucide-react
  // import name, so resolve with kebab-casing + the two deprecated aliases.
  const ICON_ALIASES = {
    checkcircle2: 'circle-check-big',
    xcircle: 'circle-x',
  };
  function resolveIconName(name) {
    const kebab = String(name).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    const lib = global.CW_ICONS || {};
    if (lib[kebab]) return kebab;
    const alias = ICON_ALIASES[String(name).toLowerCase()];
    return alias || kebab;
  }
  function icon(name, size, className) {
    size = size || 16;
    const node = (global.CW_ICONS || {})[resolveIconName(name)];
    if (!node) return '';
    const inner = node.map(function (part) {
      const tag = part[0];
      const attrs = part[1] || {};
      const a = Object.keys(attrs).map(function (k) { return k + '="' + esc(attrs[k]) + '"'; }).join(' ');
      if (tag === 'path') return '<path ' + a + '/>';
      // generic element renderer (circle, rect, line, polyline, polygon…)
      return '<' + tag + ' ' + a + '/>';
    }).join('');
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
      (className ? ' class="' + className + '"' : '') + ' aria-hidden="true">' + inner + '</svg>'
    );
  }

  // ── rich text: [tip]Term[/tip] → glossary tooltip · {{ext}} → external-link icon ──
  function glossaryTip(term) {
    const g = D.GLOSSARY.find(function (x) { return x.term.toLowerCase() === term.toLowerCase(); });
    if (!g) return esc(term);
    return (
      '<span class="tip" tabindex="0" role="button" aria-label="' + esc(g.term) + ': ' + esc(g.def) + '">' + esc(g.term) +
      '<span class="tip-box"><strong>' + esc(g.term) + ':</strong> ' + esc(g.def) + '</span></span>'
    );
  }

  function rich(text) {
    // Data strings are first-party constants (same trust level as this markup):
    // they carry intentional inline HTML (<em>/<strong>/<ul>/<code>) plus the
    // [tip]…[/tip] and {{ext}} tokens. Only tokens are substituted here.
    return String(text)
      .replace(/\[tip\]([\s\S]+?)\[\/tip\]/g, function (m, t) { return glossaryTip(t); })
      .replace(/\{\{ext\}\}/g, icon('ExternalLink', 11));
  }

  // ── chips & badges ───────────────────────────────────────────────────────────
  const SEV_STYLE = {
    P1: 'sev-chip sev-p1',
    P2: 'sev-chip sev-p2',
    P3: 'sev-chip sev-p3',
    P4: 'sev-chip sev-p4',
  };
  function sevChip(sev) {
    return '<span class="' + SEV_STYLE[sev] + '" aria-label="Severity ' + esc(sev) + '">' + esc(sev) + '</span>';
  }

  const STATUS_STYLE = { critical: 'status-critical', watch: 'status-watch', stable: 'status-stable' };
  function statusChip(status) {
    return '<span class="status-chip ' + STATUS_STYLE[status] + '"><span class="status-dot"></span>' + esc(status) + '</span>';
  }

  const PILLAR_STYLE = {
    P1: { t: 'P1 · Understand', c: 'pillar pillar-p1' },
    P2: { t: 'P2 · Analyze', c: 'pillar pillar-p2' },
    P3: { t: 'P3 · Detect', c: 'pillar pillar-p3' },
    P4: { t: 'P4 · Respond', c: 'pillar pillar-p4' },
  };
  function pillarBadge(p) {
    const s = PILLAR_STYLE[p];
    return '<span class="' + s.c + '">' + s.t + '</span>';
  }

  function stars(n, size) {
    size = size || 18;
    // exact lucide star path (CW_ICONS.star), filled/unfilled by index
    const starNode = (global.CW_ICONS || {}).star;
    const inner = starNode ? starNode.map(function (part) {
      const a = Object.keys(part[1] || {}).map(function (k) { return k + '="' + esc(part[1][k]) + '"'; }).join(' ');
      return '<' + part[0] + ' ' + a + '/>';
    }).join('') : '';
    let out = '<span role="img" aria-label="' + n + ' of 5 stars" class="stars-row">';
    for (let i = 1; i <= 5; i++) {
      const on = i <= n;
      out += '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + (on ? '#D9A514' : 'none') + '" stroke="' + (on ? '#D9A514' : '#D8D2C4') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="star">' + inner + '</svg>';
    }
    return out + '</span>';
  }

  function wardLabel(text, className) {
    // returns an ELEMENT (innerHTML allows rich content like glossary tips)
    const d = document.createElement('div');
    d.className = 'ward-label' + (className ? ' ' + className : '');
    d.innerHTML = text;
    return d;
  }

  function docNote(html) {
    return '<div class="doc-note">' + icon('Info', 14, 'dn-icon') + '<div>' + html + '</div></div>';
  }

  // ── segmented buttons (role=radiogroup / role=radio, 44px targets) ───────────
  function segRow(group, ariaLabel, options, value, size) {
    const buttons = options.map(function (o) {
      const active = value === o.value;
      return '<button type="button" role="radio" aria-checked="' + active + '" data-seg data-group="' + esc(group) + '" data-value="' + esc(o.value) + '" class="seg seg-' + (size || 'md') + (active ? ' seg-active' : '') + '">' + esc(o.label) + '</button>';
    });
    return '<div role="radiogroup" aria-label="' + esc(ariaLabel) + '" class="seg-row" data-seg-row="' + esc(group) + '">' + buttons.join('') + '</div>';
  }

  // delegation: call once per bay root — handles every seg group inside
  function wireSegs(root, onChange) {
    root.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-seg]');
      if (!btn || !root.contains(btn)) return;
      const group = btn.getAttribute('data-group');
      const value = btn.getAttribute('data-value');
      const row = root.querySelector('[data-seg-row="' + group + '"]');
      if (row) {
        row.querySelectorAll('[data-seg]').forEach(function (b) {
          const on = b === btn;
          b.classList.toggle('seg-active', on);
          b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
      }
      onChange(group, value);
    });
  }

  function updateSegRow(root, group, value) {
    const row = root.querySelector('[data-seg-row="' + group + '"]');
    if (!row) return;
    row.querySelectorAll('[data-seg]').forEach(function (b) {
      const on = b.getAttribute('data-value') === String(value);
      b.classList.toggle('seg-active', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  // ── Spark (sparkline with baseline band + incident window) ───────────────────
  function spark(data, opts) {
    opts = opts || {};
    const color = opts.color || '#0E7C6B';
    const height = opts.height || 34;
    const w = 120;
    const baseline = opts.baseline;
    const all = baseline ? data.concat(baseline) : data.slice();
    const min = Math.min.apply(null, all);
    const max = Math.max.apply(null, all);
    const span = max - min || 1;
    function x(i) { return (i / (data.length - 1)) * w; }
    function y(v) { return height - ((v - min) / span) * (height - 4) - 2; }
    const pts = data.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join(' ');
    let svg = '<svg viewBox="0 0 ' + w + ' ' + height + '" width="100%" height="' + height + '" preserveAspectRatio="none" aria-hidden="true" class="block">';
    if (baseline) {
      svg += '<rect x="0" y="' + y(baseline[1]).toFixed(1) + '" width="' + w + '" height="' + Math.max(2, y(baseline[0]) - y(baseline[1])).toFixed(1) + '" fill="#5C6B72" opacity="0.12"/>';
    }
    if (opts.incidentFrom !== undefined) {
      svg += '<rect x="' + x(opts.incidentFrom).toFixed(1) + '" y="0" width="' + (w - x(opts.incidentFrom)).toFixed(1) + '" height="' + height + '" fill="#B91C1C" opacity="0.08"/>';
    }
    svg += '<polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>';
    return svg;
  }

  // ── VitalsChart (full chart with hover readout) ──────────────────────────────
  // Mirrors bits.tsx VitalsChart: builds svg, then wires mousemove for the
  // crosshair/dot/tooltip without re-rendering the whole chart.
  function mountVitalsChart(container, series, opts) {
    opts = opts || {};
    const slo = opts.slo;
    const height = opts.height || 170;
    const data = series.data;
    const w = 560;
    const padL = 6;
    const all = series.baseline ? data.concat(series.baseline) : data.concat(slo !== undefined ? [slo] : []);
    const min = Math.min.apply(null, all);
    const max = Math.max.apply(null, all) * 1.05;
    const span = max - min || 1;
    function x(i) { return padL + (i / (data.length - 1)) * (w - padL - 6); }
    function y(v) { return height - 18 - ((v - min) / span) * (height - 30); }
    const pts = data.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join(' ');

    let svg = '<svg viewBox="0 0 ' + w + ' ' + height + '" width="100%" height="' + height + '" role="img" aria-label="' + esc(series.label) + ' chart, ' + esc(series.unit) + ', currently ' + data[data.length - 1] + ' ' + esc(series.unit) + '" class="vitals-svg">';
    if (series.baseline) {
      svg += '<rect x="' + padL + '" y="' + y(series.baseline[1]).toFixed(1) + '" width="' + (w - padL - 6) + '" height="' + Math.max(3, y(series.baseline[0]) - y(series.baseline[1])).toFixed(1) + '" fill="#5C6B72" opacity="0.12"/>';
      svg += '<line x1="' + padL + '" x2="' + (w - 6) + '" y1="' + y(series.baseline[1]).toFixed(1) + '" y2="' + y(series.baseline[1]).toFixed(1) + '" stroke="#5C6B72" stroke-dasharray="3 4" stroke-width="0.8" opacity="0.5"/>';
      svg += '<line x1="' + padL + '" x2="' + (w - 6) + '" y1="' + y(series.baseline[0]).toFixed(1) + '" y2="' + y(series.baseline[0]).toFixed(1) + '" stroke="#5C6B72" stroke-dasharray="3 4" stroke-width="0.8" opacity="0.5"/>';
    }
    if (series.incidentFrom !== undefined) {
      svg += '<rect x="' + x(series.incidentFrom).toFixed(1) + '" y="2" width="' + (w - 6 - x(series.incidentFrom)).toFixed(1) + '" height="' + (height - 20) + '" fill="#B91C1C" opacity="0.07"/>';
    }
    if (slo !== undefined) {
      svg += '<line x1="' + padL + '" x2="' + (w - 6) + '" y1="' + y(slo).toFixed(1) + '" y2="' + y(slo).toFixed(1) + '" stroke="#B45309" stroke-width="1.2" stroke-dasharray="6 4"/>';
      svg += '<text x="' + (padL + 4) + '" y="' + (y(slo) - 4).toFixed(1) + '" font-size="10" fill="#B45309" font-weight="700">SLO ' + slo + (series.unit === '%' ? '%' : ' ms') + '</text>';
    }
    svg += '<polyline points="' + pts + '" fill="none" stroke="' + series.color + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
    // hover layer (updated by mousemove, hidden until first hover)
    svg += '<line class="vc-cross" x1="0" x2="0" y1="4" y2="' + (height - 18) + '" stroke="#24333A" stroke-width="0.7" opacity="0.35" visibility="hidden"/>';
    svg += '<circle class="vc-dot" cx="0" cy="0" r="3.4" fill="' + series.color + '" stroke="#FFFDF8" stroke-width="1.4" visibility="hidden"/>';
    svg += '<line x1="' + padL + '" x2="' + (w - 6) + '" y1="' + (height - 12) + '" y2="' + (height - 12) + '" stroke="#E4DED2" stroke-width="1"/>';
    svg += '<text x="' + padL + '" y="' + (height - 2) + '" font-size="9" fill="#8A8377">−24 h</text>';
    svg += '<text x="' + (w - 6) + '" y="' + (height - 2) + '" font-size="9" fill="#8A8377" text-anchor="end">now</text>';
    svg += '</svg>';
    svg += '<div class="vc-tooltip" hidden><span class="vc-tl"></span>: <span class="vc-tv mono"></span> <span class="vc-tu"></span></div>';

    container.innerHTML = svg;
    const svgEl = container.querySelector('svg');
    const cross = container.querySelector('.vc-cross');
    const dot = container.querySelector('.vc-dot');
    const tip = container.querySelector('.vc-tooltip');

    svgEl.addEventListener('mousemove', function (e) {
      const r = svgEl.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * w;
      const i = Math.round(((px - padL) / (w - padL - 6)) * (data.length - 1));
      const idx = Math.max(0, Math.min(data.length - 1, i));
      cross.setAttribute('x1', x(idx).toFixed(1));
      cross.setAttribute('x2', x(idx).toFixed(1));
      cross.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', x(idx).toFixed(1));
      dot.setAttribute('cy', y(data[idx]).toFixed(1));
      dot.setAttribute('visibility', 'visible');
      tip.hidden = false;
      tip.querySelector('.vc-tl').textContent = series.label;
      tip.querySelector('.vc-tv').textContent = data[idx];
      tip.querySelector('.vc-tu').textContent = series.unit;
    });
    svgEl.addEventListener('mouseleave', function () {
      cross.setAttribute('visibility', 'hidden');
      dot.setAttribute('visibility', 'hidden');
      tip.hidden = true;
    });
  }

  // ── generic right-side drawer (focus trap + ESC + restore, per shell.tsx) ────
  const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function openDrawer(opts) {
    // opts: { title, wide, build(panel, close), onClose }
    const overlay = el('div', { class: 'drawer-overlay' });
    const backdrop = el('button', { type: 'button', class: 'drawer-backdrop', 'aria-label': 'Close panel' });
    const panel = el('aside', { class: 'drawer-panel' + (opts.wide ? ' drawer-wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title });
    const head = el('div', { class: 'drawer-head' });
    head.appendChild(el('div', { class: 'drawer-title serif', text: opts.title }));
    const closeBtn = el('button', { type: 'button', class: 'icon-btn drawer-close', 'aria-label': 'Close', html: icon('X', 18) });
    head.appendChild(closeBtn);
    const body = el('div', { class: 'drawer-body' });
    panel.appendChild(head);
    panel.appendChild(body);
    overlay.appendChild(backdrop);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      document.body.classList.remove('no-scroll');
      if (opts.onClose) opts.onClose();
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }

    const prevFocus = document.activeElement;
    const onKey = function (e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key === 'Tab' && panel) {
        const items = Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE)).filter(function (n) { return n.offsetParent !== null; });
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    if (opts.build) opts.build(body, close);
    closeBtn.focus(); // move focus into the panel (close button first, per original)
    return { close: close, body: body, panel: panel };
  }

  // generic centered modal with ESC + backdrop + focus restore (CompletionModal)
  function openModal(opts) {
    // opts: { label, build(body, close) }
    const overlay = el('div', { class: 'modal-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.label });
    const backdrop = el('div', { class: 'modal-backdrop' });
    const card = el('div', { class: 'modal-card' });
    overlay.appendChild(backdrop);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');

    let closed = false;
    const prevFocus = document.activeElement;
    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      document.body.classList.remove('no-scroll');
      if (opts.onClose) opts.onClose();
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }
    const onKey = function (e) {
      if (e.key === 'Escape') { close(); }
    };
    document.addEventListener('keydown', onKey, true);
    backdrop.addEventListener('click', close);
    if (opts.build) opts.build(card, close);
    return { close: close, card: card };
  }

  function fireEvent(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail }));
  }

  global.CW_UI = {
    el: el, esc: esc, icon: icon, rich: rich, glossaryTip: glossaryTip,
    sevChip: sevChip, statusChip: statusChip, pillarBadge: pillarBadge, stars: stars,
    wardLabel: wardLabel, docNote: docNote,
    segRow: segRow, wireSegs: wireSegs, updateSegRow: updateSegRow,
    spark: spark, mountVitalsChart: mountVitalsChart,
    openDrawer: openDrawer, openModal: openModal,
    FOCUSABLE: FOCUSABLE,
    fireEvent: fireEvent,
  };
})(this);
