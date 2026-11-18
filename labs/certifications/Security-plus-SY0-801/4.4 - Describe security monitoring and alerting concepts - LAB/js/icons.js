// ============================================================================
// CyberLab Architect — Static Port — Inline SVG Icons
// ----------------------------------------------------------------------------
// Each icon function returns an inline SVG string. The icons are drawn from
// the Lucide icon library (https://the Lucide project) — 24x24 viewBox, stroke-based.
// No external fonts, no CDN, no fetch — pure inline SVG.
//
// Every function takes an optional `cls` className string and returns HTML.
//   e.g.  Icons.terminal('w-4 h-4 text-amber-300')
//         Icons.check('w-3.5 h-3.5')
//
// Exposed globally as `window.Icons`.
// ============================================================================

(function () {
  'use strict';

  // SVG wrapper. `paths` is the inner markup (paths + circles + etc.).
  // We default to width/height 24, stroke=currentColor, stroke-width=2,
  // fill=none, round line caps/joins — Lucide's standard presentation.
  function svg(paths, cls) {
    cls = cls || '';
    return ''
      + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '
      + 'class="' + cls + '" aria-hidden="true" focusable="false">'
      + paths
      + '</svg>';
  }

  // ----- Icon definitions ----------------------------------------------------
  // Each entry mirrors the Lucide icon used in the React source.
  // Path data is the official Lucide v0.x geometry.

  function terminal(cls) {
    // Lucide `terminal`
    return svg('<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>', cls);
  }

  function rotateCcw(cls) {
    // Lucide `rotate-ccw`
    return svg('<polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>', cls);
  }

  function activity(cls) {
    // Lucide `activity`
    return svg('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>', cls);
  }

  function eye(cls) {
    // Lucide `eye`
    return svg('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>', cls);
  }

  function trophy(cls) {
    // Lucide `trophy`
    return svg(
      '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>'
      + '<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>'
      + '<path d="M4 22h16"></path>'
      + '<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>'
      + '<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>'
      + '<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>',
      cls
    );
  }

  function x(cls) {
    // Lucide `x`
    return svg('<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>', cls);
  }

  function alertCircle(cls) {
    // Lucide `alert-circle`
    return svg('<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>', cls);
  }

  function layoutDashboard(cls) {
    // Lucide `layout-dashboard`
    return svg(
      '<rect x="3" y="3" width="7" height="9" rx="1"></rect>'
      + '<rect x="14" y="3" width="7" height="5" rx="1"></rect>'
      + '<rect x="14" y="12" width="7" height="9" rx="1"></rect>'
      + '<rect x="3" y="16" width="7" height="5" rx="1"></rect>',
      cls
    );
  }

  function bookOpen(cls) {
    // Lucide `book-open`
    return svg(
      '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>'
      + '<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>',
      cls
    );
  }

  function building2(cls) {
    // Lucide `building-2`
    return svg(
      '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>'
      + '<path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>'
      + '<path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>'
      + '<path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path>'
      + '<path d="M10 18h4"></path>',
      cls
    );
  }

  function clock(cls) {
    // Lucide `clock`
    return svg('<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>', cls);
  }

  function user(cls) {
    // Lucide `user`
    return svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>', cls);
  }

  function network(cls) {
    // Lucide `network`
    return svg(
      '<rect x="16" y="16" width="6" height="6" rx="1"></rect>'
      + '<rect x="2" y="16" width="6" height="6" rx="1"></rect>'
      + '<rect x="9" y="2" width="6" height="6" rx="1"></rect>'
      + '<path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path>'
      + '<path d="M12 12V8"></path>',
      cls
    );
  }

  function scrollText(cls) {
    // Lucide `scroll-text`
    return svg(
      '<path d="M19 17V5a2 2 0 0 0-2-2H4"></path>'
      + '<path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 0 0-2-2"></path>'
      + '<path d="M15 8h-5"></path>'
      + '<path d="M15 12h-5"></path>',
      cls
    );
  }

  function lightbulb(cls) {
    // Lucide `lightbulb`
    return svg(
      '<path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.6 10.2 18 9 18 7.5a6 6 0 0 0-12 0c0 1.5.4 2.7 1.5 3.9.8.8 1.3 1.5 1.5 2.5"></path>'
      + '<path d="M9 18h6"></path>'
      + '<path d="M10 22h4"></path>',
      cls
    );
  }

  function chevronDown(cls) {
    // Lucide `chevron-down`
    return svg('<polyline points="6 9 12 15 18 9"></polyline>', cls);
  }

  function search(cls) {
    // Lucide `search`
    return svg('<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>', cls);
  }

  function filter(cls) {
    // Lucide `filter`
    return svg('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>', cls);
  }

  function database(cls) {
    // Lucide `database`
    return svg(
      '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>'
      + '<path d="M3 5v14a9 3 0 0 0 18 0V5"></path>'
      + '<path d="M3 12a9 3 0 0 0 18 0"></path>',
      cls
    );
  }

  function bell(cls) {
    // Lucide `bell`
    return svg(
      '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>'
      + '<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>',
      cls
    );
  }

  function chevronRight(cls) {
    // Lucide `chevron-right`
    return svg('<polyline points="9 18 15 12 9 6"></polyline>', cls);
  }

  function tag(cls) {
    // Lucide `tag`
    return svg(
      '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path>'
      + '<circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle>',
      cls
    );
  }

  function shieldAlert(cls) {
    // Lucide `shield-alert`
    return svg(
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>'
      + '<line x1="12" y1="8" x2="12" y2="12"></line>'
      + '<line x1="12" y1="16" x2="12.01" y2="16"></line>',
      cls
    );
  }

  function fileText(cls) {
    // Lucide `file-text`
    return svg(
      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>'
      + '<path d="M14 2v4a2 2 0 0 0 2 2h4"></path>'
      + '<path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>',
      cls
    );
  }

  function barChart3(cls) {
    // Lucide `bar-chart-3`
    return svg('<path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>', cls);
  }

  function trendingUp(cls) {
    // Lucide `trending-up`
    return svg('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>', cls);
  }

  function trendingDown(cls) {
    // Lucide `trending-down`
    return svg('<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline>', cls);
  }

  function minus(cls) {
    // Lucide `minus`
    return svg('<line x1="5" y1="12" x2="19" y2="12"></line>', cls);
  }

  function wrench(cls) {
    // Lucide `wrench`
    return svg(
      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
      cls
    );
  }

  function checkCircle2(cls) {
    // Lucide `check-circle-2`
    return svg('<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>', cls);
  }

  function xCircle(cls) {
    // Lucide `x-circle`
    return svg('<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>', cls);
  }

  function externalLink(cls) {
    // Lucide `external-link`
    return svg('<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>', cls);
  }

  function brain(cls) {
    // Lucide `brain`
    return svg(
      '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>'
      + '<path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>'
      + '<path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>',
      cls
    );
  }

  function graduationCap(cls) {
    // Lucide `graduation-cap`
    return svg(
      '<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>'
      + '<path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>',
      cls
    );
  }

  function swords(cls) {
    // Lucide `swords`
    return svg(
      '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>'
      + '<line x1="13" y1="19" x2="19" y2="13"></line>'
      + '<line x1="16" y1="16" x2="20" y2="20"></line>'
      + '<line x1="19" y1="21" x2="21" y2="19"></line>'
      + '<polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline>'
      + '<line x1="5" y1="14" x2="9" y2="18"></line>'
      + '<line x1="7" y1="17" x2="4" y2="20"></line>'
      + '<line x1="3" y1="19" x2="5" y2="21"></line>',
      cls
    );
  }

  function shieldCheck(cls) {
    // Lucide `shield-check`
    return svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path>', cls);
  }

  function star(cls) {
    // Lucide `star`
    return svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>', cls);
  }

  function crosshair(cls) {
    // Lucide `crosshair`
    return svg(
      '<circle cx="12" cy="12" r="10"></circle>'
      + '<line x1="22" y1="12" x2="18" y2="12"></line>'
      + '<line x1="6" y1="12" x2="2" y2="12"></line>'
      + '<line x1="12" y1="6" x2="12" y2="2"></line>'
      + '<line x1="12" y1="22" x2="12" y2="18"></line>',
      cls
    );
  }

  function arrowRight(cls) {
    // Lucide `arrow-right`
    return svg('<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>', cls);
  }

  function alertTriangle(cls) {
    // Lucide `alert-triangle` (aka triangle-alert)
    return svg(
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>'
      + '<line x1="12" y1="9" x2="12" y2="13"></line>'
      + '<line x1="12" y1="17" x2="12.01" y2="17"></line>',
      cls
    );
  }

  function target(cls) {
    // Lucide `target`
    return svg(
      '<circle cx="12" cy="12" r="10"></circle>'
      + '<circle cx="12" cy="12" r="6"></circle>'
      + '<circle cx="12" cy="12" r="2"></circle>',
      cls
    );
  }

  // Expose -----------------------------------------------------------------
  window.Icons = {
    terminal: terminal,
    rotateCcw: rotateCcw,
    activity: activity,
    eye: eye,
    trophy: trophy,
    x: x,
    alertCircle: alertCircle,
    layoutDashboard: layoutDashboard,
    bookOpen: bookOpen,
    building2: building2,
    clock: clock,
    user: user,
    network: network,
    scrollText: scrollText,
    lightbulb: lightbulb,
    chevronDown: chevronDown,
    search: search,
    filter: filter,
    database: database,
    bell: bell,
    chevronRight: chevronRight,
    tag: tag,
    shieldAlert: shieldAlert,
    fileText: fileText,
    barChart3: barChart3,
    trendingUp: trendingUp,
    trendingDown: trendingDown,
    minus: minus,
    wrench: wrench,
    checkCircle2: checkCircle2,
    xCircle: xCircle,
    externalLink: externalLink,
    brain: brain,
    graduationCap: graduationCap,
    swords: swords,
    shieldCheck: shieldCheck,
    star: star,
    crosshair: crosshair,
    arrowRight: arrowRight,
    alertTriangle: alertTriangle,
    target: target,

    // Aliases for backward-compatibility / convenience
    check: checkCircle2,         // alias used elsewhere in the codebase
    close: x,                    // alias
    shield: shieldCheck,         // alias (React code used `Shield` for mitigate pillar)
  };
})();
