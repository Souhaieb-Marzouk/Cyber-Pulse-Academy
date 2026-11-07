// ─────────────────────────────────────────────────────────────────────────────
// js/ui.js — shared UI infrastructure for the static lab port.
//
// Contents:
//   • DOM helpers (escape, element-from-HTML)
//   • Lucide icon registry — exact SVG node paths copied from the project's
//     own lucide-react distribution (visual parity, no icon fonts, no CDNs)
//   • Deterministic seeded shuffle — 1:1 port of the original xorshift helper
//     in widgets.tsx (stable display order, never reveals correct pairs)
//   • Interactive widget renderers for all seven machine-checkable kinds
//   • Tooltip ("Term" jargon definitions) and accessible overlay/dialog manager
// ─────────────────────────────────────────────────────────────────────────────

window.Lab = window.Lab || {};
(function (Lab) {
  'use strict';

  // ── DOM helpers ─────────────────────────────────────────────────────────────
  // All lab content is authored data (no user input), but evidence lines and
  // labels still get escaped before injection so files like YAML/shell listings
  // render literally.
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // ── Lucide icons (exact paths from lucide-react v0.525 dist) ───────────────
  const ICONS = {
    'train-front': [['path', { d: 'M8 3.1V7a4 4 0 0 0 8 0V3.1' }], ['path', { d: 'm9 15-1-1' }], ['path', { d: 'm15 15 1-1' }], ['path', { d: 'M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z' }], ['path', { d: 'm8 19-2 3' }], ['path', { d: 'm16 19 2 3' }]],
    database: [['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }], ['path', { d: 'M3 5V19A9 3 0 0 0 21 19V5' }], ['path', { d: 'M3 12A9 3 0 0 0 21 12' }]],
    sun: [['circle', { cx: '12', cy: '12', r: '4' }], ['path', { d: 'M12 2v2' }], ['path', { d: 'M12 20v2' }], ['path', { d: 'm4.93 4.93 1.41 1.41' }], ['path', { d: 'm17.66 17.66 1.41 1.41' }], ['path', { d: 'M2 12h2' }], ['path', { d: 'M20 12h2' }], ['path', { d: 'm6.34 17.66-1.41 1.41' }], ['path', { d: 'm19.07 4.93-1.41 1.41' }]],
    'moon-star': [['path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9' }], ['path', { d: 'M20 3v4' }], ['path', { d: 'M22 5h-4' }]],
    'rotate-ccw': [['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }], ['path', { d: 'M3 3v5h5' }]],
    'chevron-right': [['path', { d: 'm9 18 6-6-6-6' }]],
    'git-branch': [['line', { x1: '6', x2: '6', y1: '3', y2: '15' }], ['circle', { cx: '18', cy: '6', r: '3' }], ['circle', { cx: '6', cy: '18', r: '3' }], ['path', { d: 'M18 9a9 9 0 0 1-9 9' }]],
    hammer: [['path', { d: 'm15 12-8.373 8.373a1 1 0 1 1-3-3L12 9' }], ['path', { d: 'm18 15 4-4' }], ['path', { d: 'm21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5' }]],
    'file-cog': [['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }], ['path', { d: 'm2.305 15.53.923-.382' }], ['path', { d: 'm3.228 12.852-.924-.383' }], ['path', { d: 'M4.677 21.5a2 2 0 0 0 1.313.5H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2.5' }], ['path', { d: 'm4.852 11.228-.383-.923' }], ['path', { d: 'm4.852 16.772-.383.924' }], ['path', { d: 'm7.148 11.228.383-.923' }], ['path', { d: 'm7.53 17.696-.382-.924' }], ['path', { d: 'm8.772 12.852.923-.383' }], ['path', { d: 'm8.772 15.148.923.383' }], ['circle', { cx: '6', cy: '14', r: '3' }]],
    ship: [['path', { d: 'M12 10.189V14' }], ['path', { d: 'M12 2v3' }], ['path', { d: 'M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6' }], ['path', { d: 'M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76' }], ['path', { d: 'M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }]],
    activity: [['path', { d: 'M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2' }]],
    'check-circle-2': [['circle', { cx: '12', cy: '12', r: '10' }], ['path', { d: 'm9 12 2 2 4-4' }]],
    'circle-dashed': [['path', { d: 'M10.1 2.182a10 10 0 0 1 3.8 0' }], ['path', { d: 'M13.9 21.818a10 10 0 0 1-3.8 0' }], ['path', { d: 'M17.609 3.721a10 10 0 0 1 2.69 2.7' }], ['path', { d: 'M2.182 13.9a10 10 0 0 1 0-3.8' }], ['path', { d: 'M20.279 17.609a10 10 0 0 1-2.7 2.69' }], ['path', { d: 'M21.818 10.1a10 10 0 0 1 0 3.8' }], ['path', { d: 'M3.721 6.391a10 10 0 0 1 2.7-2.69' }], ['path', { d: 'M6.391 20.279a10 10 0 0 1-2.69-2.7' }]],
    lightbulb: [['path', { d: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5' }], ['path', { d: 'M9 18h6' }], ['path', { d: 'M10 22h4' }]],
    'list-checks': [['path', { d: 'm3 17 2 2 4-4' }], ['path', { d: 'm3 7 2 2 4-4' }], ['path', { d: 'M13 6h8' }], ['path', { d: 'M13 12h8' }], ['path', { d: 'M13 18h8' }]],
    'scan-search': [['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }], ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }], ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }], ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }], ['circle', { cx: '12', cy: '12', r: '3' }], ['path', { d: 'm16 16-1.9-1.9' }]],
    'shield-check': [['path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }], ['path', { d: 'm9 12 2 2 4-4' }]],
    brain: [['path', { d: 'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z' }], ['path', { d: 'M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z' }], ['path', { d: 'M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4' }], ['path', { d: 'M17.599 6.5a3 3 0 0 0 .399-1.375' }], ['path', { d: 'M6.003 5.125A3 3 0 0 0 6.401 6.5' }], ['path', { d: 'M3.477 10.896a4 4 0 0 1 .585-.396' }], ['path', { d: 'M19.938 10.5a4 4 0 0 1 .585.396' }], ['path', { d: 'M6 18a4 4 0 0 1-1.967-.516' }], ['path', { d: 'M19.967 17.484A4 4 0 0 1 18 18' }]],
    radar: [['path', { d: 'M19.07 4.93A10 10 0 0 0 6.99 3.34' }], ['path', { d: 'M4 6h.01' }], ['path', { d: 'M2.29 9.62A10 10 0 1 0 21.31 8.35' }], ['path', { d: 'M16.24 7.76A6 6 0 1 0 8.23 16.67' }], ['path', { d: 'M12 18h.01' }], ['path', { d: 'M17.99 11.66A6 6 0 0 1 15.77 16.67' }], ['circle', { cx: '12', cy: '12', r: '2' }], ['path', { d: 'm13.41 10.59 5.66-5.66' }]],
    check: [['path', { d: 'M20 6 9 17l-5-5' }]],
    plus: [['path', { d: 'M5 12h14' }], ['path', { d: 'M12 5v14' }]],
    x: [['path', { d: 'M18 6 6 18' }], ['path', { d: 'm6 6 12 12' }]],
    signal: [['path', { d: 'M2 20h.01' }], ['path', { d: 'M7 20v-4' }], ['path', { d: 'M12 20v-8' }], ['path', { d: 'M17 20V8' }], ['path', { d: 'M22 4v16' }]],
    'circle-check': [['circle', { cx: '12', cy: '12', r: '10' }], ['path', { d: 'm9 12 2 2 4-4' }]],
    'circle-x': [['circle', { cx: '12', cy: '12', r: '10' }], ['path', { d: 'm15 9-6 6' }], ['path', { d: 'm9 9 6 6' }]],
    lock: [['rect', { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' }], ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }]],
    'external-link': [['path', { d: 'M15 3h6v6' }], ['path', { d: 'M10 14 21 3' }], ['path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }]],
    star: [['path', { d: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' }]],
    'star-half': [['path', { d: 'M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2' }]],
    compass: [['path', { d: 'm16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z' }], ['circle', { cx: '12', cy: '12', r: '10' }]],
    target: [['circle', { cx: '12', cy: '12', r: '10' }], ['circle', { cx: '12', cy: '12', r: '6' }], ['circle', { cx: '12', cy: '12', r: '2' }]],
    eye: [['path', { d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' }], ['circle', { cx: '12', cy: '12', r: '3' }]],
  };

  // The book-open icon used by the Field manual button (custom SVG from the
  // original mode-select.tsx — kept verbatim).
  const BOOK_OPEN =
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>';

  function icon(name, cls, opts) {
    opts = opts || {};
    const stroke = opts.strokeWidth || 2;
    const nodes = ICONS[name]
      .map((n) => {
        const attrs = Object.keys(n[1])
          .map((k) => `${k}="${n[1][k]}"`)
          .join(' ');
        return `<${n[0]} ${attrs}/>`;
      })
      .join('');
    const w = opts.width || 24;
    const h = opts.height || 24;
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 24 24"` +
      ` fill="${opts.fill || 'none'}" stroke="currentColor" stroke-width="${stroke}"` +
      ` stroke-linecap="round" stroke-linejoin="round" class="${cls || ''}" aria-hidden="true">${nodes}</svg>`
    );
  }

  function bookIcon(cls) {
    return `<svg viewBox="0 0 24 24" class="${cls || ''}" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${BOOK_OPEN}</svg>`;
  }

  // ── Deterministic shuffle (R6) — exact port of widgets.tsx ─────────────────
  // FNV-1a seed + xorshift32: the same widget key always produces the same
  // display order on every machine and every reload, and it never correlates
  // with the solution.
  function hashSeed(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seededShuffle(items, seed) {
    const out = items.slice();
    let s = hashSeed(seed) || 1;
    const rnd = () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = out[i];
      out[i] = out[j];
      out[j] = t;
    }
    return out;
  }

  // ── Pillar metadata (from theme.tsx) ───────────────────────────────────────
  const PILLAR_META = {
    P1: { label: 'UNDERSTAND', color: '#8FA3B8', icon: 'brain' },
    P2: { label: 'RECOGNIZE', color: '#A78BFA', icon: 'scan-search' },
    P3: { label: 'DETECT', color: '#2DD4BF', icon: 'radar' },
    P4: { label: 'MITIGATE', color: '#4ADE80', icon: 'shield-check' },
  };

  // ── Interactive widgets (F-23) ─────────────────────────────────────────────
  // Every interactive element carries data-* hooks so app.js can route events
  // via delegation and the verification suite can drive the lab like the
  // original framework build.

  const STATION_ICONS = { git: 'git-branch', jenkins: 'hammer', ansible: 'file-cog', kubernetes: 'ship', operate: 'activity' };

  function selectOptions(list, emptyLabel) {
    return `<option value="">${esc(emptyLabel || '— choose —')}</option>` + list.map((o) => `<option value="${esc(o.id)}">${esc(o.label)}</option>`).join('');
  }

  function renderPair(w, env) {
    const map = env[w.key] && typeof env[w.key] === 'object' ? env[w.key] : {};
    const shuffled = seededShuffle(w.right, `${w.key}-right`);
    const rows = w.left
      .map((l) => {
        const hint = l.hint ? `<span class="pair-hint">${esc(l.hint)}</span>` : '';
        return `<div class="pair-row">
          <div class="pair-left">${esc(l.label)}${hint}</div>
          <select aria-label="Assign ${esc(l.label)}" class="select select-widget" data-pair="${esc(l.id)}">
            ${selectOptions(shuffled)}
          </select>
        </div>`;
      })
      .join('');
    return `<div class="widget stack-8" data-widget="${esc(w.key)}">
      <div class="pair-labels"><span>${esc(w.leftLabel)}</span><span>${esc(w.rightLabel)}</span></div>
      ${rows}
    </div>`;
  }

  function renderOrder(w, env) {
    const picked = Array.isArray(env[w.key]) ? env[w.key] : [];
    const remaining = w.items.filter((i) => !picked.includes(i.id));
    const labelOf = (id) => {
      const it = w.items.find((i) => i.id === id);
      return it ? it.label : id;
    };
    const zone = picked.length === 0
      ? '<li class="order-placeholder">Click stages below to place them in order…</li>'
      : picked
          .map((id, idx) => `<li><button type="button" data-opt="${esc(id)}" data-role="ordered"
            class="chip chip-ordered" aria-label="Position ${idx + 1}: ${esc(labelOf(id))} — click to remove">
            <span class="order-num">${String(idx + 1).padStart(2, '0')}</span>
            <span class="order-label">${esc(labelOf(id))}</span>
            ${icon('x', 's12 order-x')}
          </button></li>`)
          .join('');
    const pool = (picked.length > 0
      ? `<button type="button" data-clear="${esc(w.key)}" class="btn-clear-order">Clear order</button>`
      : '') +
      remaining
        .map(
          (i) => `<button type="button" data-opt="${esc(i.id)}" data-role="pool" class="chip chip-pool"
            aria-label="Add ${esc(i.label)} to the order">${icon('plus', 's12 text-amber chip-plus')}${esc(i.label)}</button>`
        )
        .join('');
    return `<div class="widget stack-8" data-widget="${esc(w.key)}">
      <div class="widget-kicker">${esc(w.label)}</div>
      <ol class="order-zone" aria-label="Ordered stages">${zone}</ol>
      <div class="order-pool">${pool}</div>
    </div>`;
  }

  function renderSort(w, env) {
    const map = env[w.key] && typeof env[w.key] === 'object' ? env[w.key] : {};
    const shuffled = seededShuffle(w.categories, `${w.key}-cats`);
    const rows = w.items
      .map(
        (it) => `<div class="sort-row">
          <div class="sort-label">${esc(it.label)}</div>
          <select aria-label="Classify: ${esc(it.label.slice(0, 40))}…" class="select select-widget" data-sort="${esc(it.id)}">
            ${selectOptions(shuffled)}
          </select>
        </div>`
      )
      .join('');
    return `<div class="widget stack-8" data-widget="${esc(w.key)}">${rows}</div>`;
  }

  function renderMulti(w, env, state) {
    const all = Array.isArray(env[w.key]) ? env[w.key] : [];
    const picked = all.filter((id) => w.options.some((o) => o.id === id));
    const counter = w.selectCount
      ? `<div class="multi-counter" aria-live="polite" data-counter="${esc(w.key)}">${picked.length} / ${w.selectCount} selected</div>`
      : '';
    const opts = w.options
      .map((o) => {
        const on = picked.includes(o.id);
        return `<button type="button" data-opt="${esc(o.id)}" aria-pressed="${on}" class="chip chip-multi ${on ? 'is-on' : ''}">
          <span class="multi-box${on ? ' is-on' : ''}" aria-hidden="true">${on ? icon('check', 's12', { strokeWidth: 3 }) : ''}</span>
          <span>${esc(o.label)}${o.hint ? `<span class="pair-hint">${esc(o.hint)}</span>` : ''}</span>
        </button>`;
      })
      .join('');
    return `<div class="widget stack-8" data-widget="${esc(w.key)}">
      ${w.label ? `<div class="widget-kicker">${esc(w.label)}</div>` : ''}
      ${counter}
      <div class="multi-grid">${opts}</div>
    </div>`;
  }

  function renderSingleSelect(w, env) {
    const val = env[w.key] == null ? '' : env[w.key];
    return `<div class="widget stack-4" data-widget="${esc(w.key)}">
      <div class="select-label">${esc(w.label)}</div>
      <select aria-label="${esc(w.label)}" class="select select-widget" data-select="${esc(w.key)}">
        ${selectOptions(w.options)}
      </select>
    </div>`;
  }

  function renderTextInputs(w, env) {
    const vals = env[w.key] && typeof env[w.key] === 'object' ? env[w.key] : {};
    const fields = w.fields
      .map((f) => `<div class="stack-4">
        <label for="${esc(w.key)}-${esc(f.key)}" class="select-label">${esc(f.label)}</label>
        <input id="${esc(w.key)}-${esc(f.key)}" type="text" inputmode="text" autocomplete="off"
          maxlength="${f.maxLength == null ? 60 : f.maxLength}" placeholder="${esc(f.placeholder || '')}"
          value="${esc(vals[f.key] == null ? '' : vals[f.key])}"
          class="input input-text" data-text="${esc(f.key)}" data-textkey="${esc(w.key)}" />
      </div>`)
      .join('');
    return `<div class="widget stack-8" data-widget="${esc(w.key)}">${fields}</div>`;
  }

  function renderToggles(w, env) {
    const map = env[w.key] && typeof env[w.key] === 'object' ? env[w.key] : {};
    const rows = w.options
      .map((o) => {
        const on = Boolean(map[o.id]);
        return `<button type="button" role="switch" data-opt="${esc(o.id)}" aria-checked="${on}"
          aria-label="${esc(o.label)} — enabled or disabled" class="switch-row">
          <span class="switch-label">${esc(o.label)}</span>
          <span class="switch-track${on ? ' is-on' : ''}" aria-hidden="true">
            <span class="switch-knob ${on ? 'is-on' : ''}"></span>
          </span>
        </button>`;
      })
      .join('');
    return `<div class="widget stack-6" data-widget="${esc(w.key)}">
      <div class="widget-kicker">Control board — set each switch to its recommended state</div>
      ${rows}
    </div>`;
  }

  function renderWidget(w, state) {
    const env = state.env;
    switch (w.kind) {
      case 'pair': return renderPair(w, env);
      case 'order': return renderOrder(w, env);
      case 'sort': return renderSort(w, env);
      case 'multi': return renderMulti(w, env, state);
      case 'select': return renderSingleSelect(w, env);
      case 'text': return renderTextInputs(w, env);
      case 'toggles': return renderToggles(w, env);
      default: return '';
    }
  }

  // Re-render one order widget in place (items move between pool and queue).
  function refreshOrderWidget(key) {
    const w = Lab.findWidget(key);
    const host = document.querySelector(`[data-widget="${CSS.escape(key)}"]`);
    if (!w || !host) return;
    const fresh = el(renderOrder(w, Lab.store.getState().env));
    host.replaceWith(fresh);
  }

  // In-place toggle update for multi-select buttons (keeps focus).
  function updateMultiButton(key, id) {
    const btn = document.querySelector(`[data-widget="${CSS.escape(key)}"] button[data-opt="${CSS.escape(id)}"]`);
    if (!btn) return;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.toggle('is-on', on);
    const box = btn.querySelector('.multi-box');
    if (box) {
      box.classList.toggle('is-on', on);
      box.innerHTML = on ? icon('check', 's12', { strokeWidth: 3 }) : '';
    }
    const w = Lab.findWidget(key);
    if (w && w.selectCount) {
      const counter = document.querySelector(`[data-counter="${CSS.escape(key)}"]`);
      if (counter) {
        const env = Lab.store.getState().env;
        const all = Array.isArray(env[key]) ? env[key] : [];
        const picked = all.filter((x) => w.options.some((o) => o.id === x));
        counter.textContent = `${picked.length} / ${w.selectCount} selected`;
      }
    }
  }

  // In-place switch row update.
  function updateSwitchRow(key, id) {
    const btn = document.querySelector(`[data-widget="${CSS.escape(key)}"] button[data-opt="${CSS.escape(id)}"]`);
    if (!btn) return;
    const on = btn.getAttribute('aria-checked') !== 'true';
    btn.setAttribute('aria-checked', String(on));
    const track = btn.querySelector('.switch-track');
    const knob = btn.querySelector('.switch-knob');
    if (track) track.classList.toggle('is-on', on);
    if (knob) knob.classList.toggle('is-on', on);
  }

  // ── Term tooltip (theme.tsx Term component) ────────────────────────────────
  // Hover (120 ms delay, like the original Radix delayDuration) + keyboard
  // focus; Escape and scroll dismiss it.
  function initTooltips() {
    let showTimer = null;
    let lastTarget = null;
    const tip = el('<div id="term-tip" role="tooltip" class="term-tip"></div>');
    document.body.appendChild(tip);

    function show(target) {
      lastTarget = target;
      tip.textContent = target.getAttribute('data-term') || '';
      tip.classList.add('is-visible');
      const r = target.getBoundingClientRect();
      tip.style.left = '0px';
      tip.style.top = '0px';
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      let x = r.left + r.width / 2 - tw / 2;
      x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
      let y = r.top - th - 8;
      if (y < 8) y = r.bottom + 8;
      tip.style.left = `${Math.round(x)}px`;
      tip.style.top = `${Math.round(y)}px`;
    }
    function hide() {
      clearTimeout(showTimer);
      showTimer = null;
      tip.classList.remove('is-visible');
    }

    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-term]');
      if (!t) return;
      clearTimeout(showTimer);
      showTimer = setTimeout(() => show(t), 120);
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('[data-term]')) hide();
    });
    document.addEventListener('focusin', (e) => {
      const t = e.target.closest('[data-term]');
      if (!t) return;
      clearTimeout(showTimer);
      showTimer = setTimeout(() => show(t), 120);
    });
    document.addEventListener('focusout', (e) => {
      if (e.target.closest('[data-term]')) hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hide();
    });
    // While visible, follow the anchor on scroll (focus() may scroll the page
    // to reveal the term — the tooltip must survive that and stay attached).
    window.addEventListener(
      'scroll',
      () => {
        if (tip.classList.contains('is-visible') && lastTarget && document.contains(lastTarget)) show(lastTarget);
      },
      true
    );
  }

  function term(def, text) {
    return `<span class="term" tabindex="0" data-term="${esc(def)}">${text}</span>`;
  }

  // Accessible overlay manager (Sheet / Dialog / AlertDialog parity) ──────
  // Escape and outside-pointerdown close; Tab is trapped inside; focus is
  // restored to the trigger on close. Radix-equivalent behavior: overlays with
  // the same id are idempotent (controlled `open` prop semantics).
  const overlayStack = [];
  const openById = new Map();

  function focusables(container) {
    return Array.from(
      container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((n) => !n.disabled && n.offsetParent !== null);
  }

  function openOverlay(opts) {
    // opts: { id?, content (element), variant: 'sheet'|'dialog'|'alert', label, labelId, onClose }
    if (opts.id && openById.has(opts.id)) return openById.get(opts.id);
    const opener = document.activeElement;
    const root = el(`<div class="overlay-root" data-overlay="${opts.variant}"></div>`);
    const bg = el('<div class="overlay-bg"></div>');
    const frame = el(
      opts.variant === 'sheet'
        ? '<div class="overlay-pos overlay-pos-right"></div>'
        : '<div class="overlay-pos overlay-pos-center"></div>'
    );
    if (opts.labelId) root.setAttribute('aria-labelledby', opts.labelId);
    else if (opts.label) root.setAttribute('aria-label', opts.label);
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    frame.appendChild(opts.content);
    root.appendChild(bg);
    root.appendChild(frame);
    document.getElementById('overlay-root').appendChild(root);

    function close() {
      const idx = overlayStack.indexOf(api);
      if (idx === -1) return; // already closed
      overlayStack.splice(idx, 1);
      if (opts.id) openById.delete(opts.id);
      root.remove();
      if (opener && document.contains(opener)) opener.focus();
      if (opts.onClose) opts.onClose();
    }
    const api = { root, close };

    overlayStack.push(api);
    if (opts.id) openById.set(opts.id, api);
    // Initial focus: first focusable element inside the content.
    const f = focusables(frame);
    (f[0] || frame).focus({ preventScroll: true });

    bg.addEventListener('pointerdown', close);
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const list = focusables(frame);
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    return api;
  }

  function closeTopOverlay() {
    const top = overlayStack[overlayStack.length - 1];
    if (top) top.close();
    return Boolean(top);
  }

  // Escape dismisses the topmost overlay regardless of where focus sits —
  // matching the original Radix dismissable-layer behavior.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlayStack.length > 0) {
      closeTopOverlay();
    }
  });

  Lab.ui = {
    esc,
    el,
    icon,
    bookIcon,
    seededShuffle,
    hashSeed,
    PILLAR_META,
    STATION_ICONS,
    renderWidget,
    refreshOrderWidget,
    updateMultiButton,
    updateSwitchRow,
    initTooltips,
    term,
    openOverlay,
    closeTopOverlay,
    overlayStack,
  };
})(window.Lab);
