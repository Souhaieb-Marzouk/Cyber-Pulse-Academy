// ============================================================================
// Meridian Atelier — UI helpers (shared)
// Small rendering utilities + inline SVG icons (no icon CDN).
// ============================================================================

(function (global) {
  'use strict';

  // ---- HTML escape + template helper ----
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Build an HTML string from a template literal. We expose `h` as the
  // template tag; interpolated values are escaped automatically unless
  // wrapped in raw().
  function raw(s) { return { __raw: true, s: String(s) }; }
  function isRaw(v) { return v && typeof v === 'object' && v.__raw === true; }

  function h(strings, ...vals) {
    let out = '';
    for (let i = 0; i < strings.length; i++) {
      out += strings[i];
      if (i < vals.length) {
        const v = vals[i];
        if (v == null || v === false) continue;
        if (isRaw(v)) out += v.s;
        else if (Array.isArray(v)) out += v.map((x) => (isRaw(x) ? x.s : esc(x))).join('');
        else out += esc(v);
      }
    }
    return out;
  }

  // ---- Inline SVG icons (Lucide-style, copied paths) ----
  // Each icon is a function returning an SVG string sized 16px by default.
  function svg(paths, size) {
    size = size || 16;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  const ICONS = {
    scale:       (s) => svg('<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>', s),
    bookOpen:    (s) => svg('<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>', s),
    shield:      (s) => svg('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.5 6.05-2.5a1 1 0 0 1 .9 0C13.5 3.5 16 5 18 5a1 1 0 0 1 1 1z"/>', s),
    scrollText:  (s) => svg('<path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/><path d="M19 17v2a2 2 0 0 1-2 2H8"/><path d="M9 12h6"/><path d="M9 8h6"/>', s),
    map:         (s) => svg('<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v13"/><path d="M9 3.236v13"/>', s),
    library:     (s) => svg('<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>', s),
    boxes:       (s) => svg('<path d="M2.97 12.92A2 2 0 0 0 2 14.63a3.87 3.87 0 0 0 .26.91 4 4 0 0 0 6.18.83A4 4 0 0 0 12 11.5a4 4 0 0 0 3.56 4.87 4 4 0 0 0 6.18-.83 3.87 3.87 0 0 0 .26-.91 2 2 0 0 0-.97-1.71c-1.96-1.1-3.62-2.35-4.78-3.36C15.84 5.18 14.5 4 12 4s-3.84 1.18-5.25 2.57c-1.16 1.01-2.82 2.26-4.78 3.35z"/><path d="M6 12.5V16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3.5"/>', s),
    mail:        (s) => svg('<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>', s),
    users:       (s) => svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', s),
    building2:   (s) => svg('<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>', s),
    fileSearch:  (s) => svg('<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m16 12-3.5 3.5"/><path d="M14 22a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/><path d="M14 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M14 7v3"/><path d="M14 14v3"/><path d="M14 21H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8l4 4"/>', s),
    gavel:       (s) => svg('<path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>', s),
    clock:       (s) => svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', s),
    brain:       (s) => svg('<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>', s),
    check:       (s) => svg('<polyline points="20 6 9 17 4 12"/>', s),
    x:           (s) => svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', s),
    alert:       (s) => svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', s),
    lightbulb:   (s) => svg('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>', s),
    checkCircle: (s) => svg('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>', s),
    xCircle:     (s) => svg('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>', s),
    star:        (s) => svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', s),
    trophy:      (s) => svg('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>', s),
    sparkles:    (s) => svg('<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>', s),
    target:      (s) => svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', s),
    menu:        (s) => svg('<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>', s),
    notebookPen: (s) => svg('<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M18.4 2.6a2.1 2.1 0 1 1 3 3L16 11l-4 1 1-4Z"/>', s),
    swordAlert:  (s) => svg('<path d="m14.5 17.5-3.5 3.5-3.5-3.5"/><path d="M11 21V11"/><path d="M3 7h18"/><path d="M9 3h6l4 4-4 4H9L5 7l4-4Z"/>', s),
    bookMarked:  (s) => svg('<path d="M19 21V5a2 2 0 0 0-2-2H4"/><path d="M8 3h6v18"/><path d="m19 21-3.5-3.5-3.5 3.5"/>', s),
    externalLink:(s) => svg('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>', s),
    loader:      (s) => svg('<line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/>', s),
  };

  // ---- Pillar badges ----
  const PILLAR_LABEL = { P1: 'Understand', P2: 'Recognize', P3: 'Detect', P4: 'Mitigate' };

  function pillarBadge(pillar) {
    return `<span class="atelier-pill atelier-pill-${pillar.toLowerCase()}"><span aria-hidden="true">●</span><span>${esc(pillar)} · ${esc(PILLAR_LABEL[pillar])}</span></span>`;
  }

  // ---- Glossary tooltip ----
  function glossaryTerm(id, label) {
    const term = global.AtelierData.GLOSSARY.find((g) => g.id === id);
    if (!term) return `<span class="underline-decoration-dotted">${esc(label)}</span>`;
    // tooltip is rendered on hover/focus via CSS + a small JS popover; for static
    // simplicity, we render a <details> element that toggles the definition.
    return `<details class="glossary-tooltip"><summary class="glossary-trigger" tabindex="0" role="button" aria-expanded="false">${esc(label)}</summary><div class="glossary-popover" role="tooltip"><div class="glossary-term-name">${esc(term.term)}</div><div class="glossary-term-def">${esc(term.long)}</div></div></details>`;
  }

  global.AtelierUI = { h, raw, esc, ICONS, PILLAR_LABEL, pillarBadge, glossaryTerm };
})(window);
