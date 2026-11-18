// ── The Staging Bay · inline SVG icons ──────────────────────────────────────
// Exact Lucide icon geometry (lucide-react v0.525.0, ISC license — see README).
// All icons render 24×24, stroke = currentColor, stroke-width 2, no fill.
(function () {
'use strict';
  const NODES = {
    'clipboard-list': [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      }
  ],
  ["path", { d: "M12 11h4", }],
  ["path", { d: "M12 16h4", }],
  ["path", { d: "M8 11h.01", }],
  ["path", { d: "M8 16h.01", }]
],
    'compass': [
  [
    "path",
    {
      d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",
      }
  ],
  ["circle", { cx: "12", cy: "12", r: "10", }]
],
    'skull': [
  ["path", { d: "m12.5 17-.5-1-.5 1h1z", }],
  [
    "path",
    {
      d: "M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z",
      }
  ],
  ["circle", { cx: "15", cy: "12", r: "1", }],
  ["circle", { cx: "9", cy: "12", r: "1", }]
],
    'rotate-ccw': [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", }],
  ["path", { d: "M3 3v5h5", }]
],
    'book-open-text': [
  ["path", { d: "M12 7v14", }],
  ["path", { d: "M16 12h2", }],
  ["path", { d: "M16 8h2", }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      }
  ],
  ["path", { d: "M6 12h2", }],
  ["path", { d: "M6 8h2", }]
],
    'package-open': [
  ["path", { d: "M12 22v-9", }],
  [
    "path",
    {
      d: "M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z",
      }
  ],
  [
    "path",
    {
      d: "M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13",
      }
  ],
  [
    "path",
    {
      d: "M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z",
      }
  ]
],
    'radio': [
  ["path", { d: "M16.247 7.761a6 6 0 0 1 0 8.478", }],
  ["path", { d: "M19.075 4.933a10 10 0 0 1 0 14.134", }],
  ["path", { d: "M4.925 19.067a10 10 0 0 1 0-14.134", }],
  ["path", { d: "M7.753 16.239a6 6 0 0 1 0-8.478", }],
  ["circle", { cx: "12", cy: "12", r: "2", }]
],
    'server': [
  ["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2", }],
  ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2", }],
  ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6", }],
  ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18", }]
],
    'hard-drive': [
  ["line", { x1: "22", x2: "2", y1: "12", y2: "12", }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      }
  ],
  ["line", { x1: "6", x2: "6.01", y1: "16", y2: "16", }],
  ["line", { x1: "10", x2: "10.01", y1: "16", y2: "16", }]
],
    'network': [
  ["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1", }],
  ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1", }],
  ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1", }],
  ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", }],
  ["path", { d: "M12 12V8", }]
],
    'lock': [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", }]
],
    'globe': [
  ["circle", { cx: "12", cy: "12", r: "10", }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", }],
  ["path", { d: "M2 12h20", }]
],
    'chevron-right': [["path", { d: "m9 18 6-6-6-6", }]],
    'chevron-down': [["path", { d: "m6 9 6 6 6-6", }]],
    'arrow-up': [
  ["path", { d: "m5 12 7-7 7 7", }],
  ["path", { d: "M12 19V5", }]
],
    'arrow-down': [
  ["path", { d: "M12 5v14", }],
  ["path", { d: "m19 12-7 7-7-7", }]
],
    'x': [
  ["path", { d: "M18 6 6 18", }],
  ["path", { d: "m6 6 12 12", }]
],
    'power': [
  ["path", { d: "M12 2v10", }],
  ["path", { d: "M18.4 6.6a9 9 0 1 1-12.77.04", }]
],
    'badge-check': [
  [
    "path",
    {
      d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
      }
  ],
  ["path", { d: "m9 12 2 2 4-4", }]
],
    'circle-dashed': [
  ["path", { d: "M10.1 2.182a10 10 0 0 1 3.8 0", }],
  ["path", { d: "M13.9 21.818a10 10 0 0 1-3.8 0", }],
  ["path", { d: "M17.609 3.721a10 10 0 0 1 2.69 2.7", }],
  ["path", { d: "M2.182 13.9a10 10 0 0 1 0-3.8", }],
  ["path", { d: "M20.279 17.609a10 10 0 0 1-2.7 2.69", }],
  ["path", { d: "M21.818 10.1a10 10 0 0 1 0 3.8", }],
  ["path", { d: "M3.721 6.391a10 10 0 0 1 2.7-2.69", }],
  ["path", { d: "M6.391 20.279a10 10 0 0 1-2.69-2.7", }]
],
    'lightbulb': [
  [
    "path",
    {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      }
  ],
  ["path", { d: "M9 18h6", }],
  ["path", { d: "M10 22h4", }]
],
    'target': [
  ["circle", { cx: "12", cy: "12", r: "10", }],
  ["circle", { cx: "12", cy: "12", r: "6", }],
  ["circle", { cx: "12", cy: "12", r: "2", }]
],
    'pen-line': [
  ["path", { d: "M12 20h9", }],
  [
    "path",
    {
      d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",
      }
  ]
],
    'external-link': [
  ["path", { d: "M15 3h6v6", }],
  ["path", { d: "M10 14 21 3", }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", }]
],
    'shield-check': [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      }
  ],
  ["path", { d: "m9 12 2 2 4-4", }]
],
    'triangle-alert': [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      }
  ],
  ["path", { d: "M12 9v4", }],
  ["path", { d: "M12 17h.01", }]
],
    'graduation-cap': [
  [
    "path",
    {
      d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
      }
  ],
  ["path", { d: "M22 10v6", }],
  ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5", }]
],
    'shield-alert': [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      }
  ],
  ["path", { d: "M12 8v4", }],
  ["path", { d: "M12 16h.01", }]
],
    'hard-hat': [
  ["path", { d: "M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5", }],
  ["path", { d: "M14 6a6 6 0 0 1 6 6v3", }],
  ["path", { d: "M4 15v-3a6 6 0 0 1 6-6", }],
  ["rect", { x: "2", y: "15", width: "20", height: "4", rx: "1", }]
],
    'swords': [
  ["polyline", { points: "14.5 17.5 3 6 3 3 6 3 17.5 14.5", }],
  ["line", { x1: "13", x2: "19", y1: "19", y2: "13", }],
  ["line", { x1: "16", x2: "20", y1: "16", y2: "20", }],
  ["line", { x1: "19", x2: "21", y1: "21", y2: "19", }],
  ["polyline", { points: "14.5 6.5 18 3 21 3 21 6 17.5 9.5", }],
  ["line", { x1: "5", x2: "9", y1: "14", y2: "18", }],
  ["line", { x1: "7", x2: "4", y1: "17", y2: "20", }],
  ["line", { x1: "3", x2: "5", y1: "19", y2: "21", }]
],
    'crosshair': [
  ["circle", { cx: "12", cy: "12", r: "10", }],
  ["line", { x1: "22", x2: "18", y1: "12", y2: "12", }],
  ["line", { x1: "6", x2: "2", y1: "12", y2: "12", }],
  ["line", { x1: "12", x2: "12", y1: "6", y2: "2", }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "18", }]
],
    'trophy': [
  ["path", { d: "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978", }],
  ["path", { d: "M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978", }],
  ["path", { d: "M18 9h1.5a1 1 0 0 0 0-5H18", }],
  ["path", { d: "M4 22h16", }],
  ["path", { d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z", }],
  ["path", { d: "M6 9H4.5a1 1 0 0 1 0-5H6", }]
],
    'arrow-right': [
  ["path", { d: "M5 12h14", }],
  ["path", { d: "m12 5 7 7-7 7", }]
],
    'x-circle': [
  ["circle", { cx: "12", cy: "12", r: "10", }],
  ["path", { d: "m15 9-6 6", }],
  ["path", { d: "m9 9 6 6", }]
],
  };

  function h(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k.replace(/([A-Z])/g, '-$1').toLowerCase(), v);
    return el;
  }

  /** Build an icon <svg> element. name: kebab-case icon name; cls: className string. */
  window.icon = function (name, cls) {
    const node = NODES[name];
    if (!node) throw new Error('unknown icon: ' + name);
    const svg = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    if (cls) svg.setAttribute('class', cls);
    if (cls && /\bw-4\b/.test(cls)) { /* size classes control size via CSS */ }
    for (const [tag, attrs] of node) svg.appendChild(h(tag, attrs));
    svg.setAttribute('aria-hidden', 'true');
    return svg;
  };
})();
