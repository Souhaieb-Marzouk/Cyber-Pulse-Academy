// ─── CyberLab · js/icons.js ───────────────────────────────────────────────
// Inline SVG icon set — exact Lucide (v0.525.0) icon node data, ISC license,
// https://the Lucide project. The original framework lab rendered these via the
// lucide-react package; the static port inlines the same SVG paths so no
// icon font, CDN or npm package is needed (SC-D2).
// Usage: LAB.icon('Siren', 'h-4 w-4') → <svg> element.

window.LAB = window.LAB || {};
(function (LAB) {
  'use strict';

  var ICON_NODES = {
    Siren: [["path",{"d":"M7 18v-6a5 5 0 1 1 10 0v6","key":"pcx96s"}],["path",{"d":"M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z","key":"1b4s83"}],["path",{"d":"M21 12h1","key":"jtio3y"}],["path",{"d":"M18.5 4.5 18 5","key":"g5sp9y"}],["path",{"d":"M2 12h1","key":"1uaihz"}],["path",{"d":"M12 2v1","key":"11qlp1"}],["path",{"d":"m4.929 4.929.707.707","key":"1i51kw"}],["path",{"d":"M12 12v6","key":"3ahymv"}]],
    Lock: [["rect",{"width":"18","height":"11","x":"3","y":"11","rx":"2","ry":"2","key":"1w4ew1"}],["path",{"d":"M7 11V7a5 5 0 0 1 10 0v4","key":"fwvmzm"}]],
    ChevronDown: [["path",{"d":"m6 9 6 6 6-6","key":"qrunsl"}]],
    ChevronRight: [["path",{"d":"m9 18 6-6-6-6","key":"mthhwq"}]],
    CheckCircle2: [["circle",{"cx":"12","cy":"12","r":"10","key":"1mglay"}],["path",{"d":"m9 12 2 2 4-4","key":"dzmm74"}]],
    XCircle: [["circle",{"cx":"12","cy":"12","r":"10","key":"1mglay"}],["path",{"d":"m15 9-6 6","key":"1uzhvr"}],["path",{"d":"m9 9 6 6","key":"z0biqf"}]],
    Circle: [["circle",{"cx":"12","cy":"12","r":"10","key":"1mglay"}]],
    Lightbulb: [["path",{"d":"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5","key":"1gvzjb"}],["path",{"d":"M9 18h6","key":"x1upvd"}],["path",{"d":"M10 22h4","key":"ceow96"}]],
    RotateCcw: [["path",{"d":"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8","key":"1357e3"}],["path",{"d":"M3 3v5h5","key":"1xhq8a"}]],
    ArrowUp: [["path",{"d":"m5 12 7-7 7 7","key":"hav0vg"}],["path",{"d":"M12 19V5","key":"x0mq9r"}]],
    ArrowDown: [["path",{"d":"M12 5v14","key":"s699le"}],["path",{"d":"m19 12-7 7-7-7","key":"1idqje"}]],
    Radar: [["path",{"d":"M19.07 4.93A10 10 0 0 0 6.99 3.34","key":"z3du51"}],["path",{"d":"M4 6h.01","key":"oypzma"}],["path",{"d":"M2.29 9.62A10 10 0 1 0 21.31 8.35","key":"qzzz0"}],["path",{"d":"M16.24 7.76A6 6 0 1 0 8.23 16.67","key":"1yjesh"}],["path",{"d":"M12 18h.01","key":"mhygvu"}],["path",{"d":"M17.99 11.66A6 6 0 0 1 15.77 16.67","key":"1u2y91"}],["circle",{"cx":"12","cy":"12","r":"2","key":"1c9p78"}],["path",{"d":"m13.41 10.59 5.66-5.66","key":"mhq4k0"}]],
    SearchCode: [["path",{"d":"m13 13.5 2-2.5-2-2.5","key":"1rvxrh"}],["path",{"d":"m21 21-4.3-4.3","key":"1qie3q"}],["path",{"d":"M9 8.5 7 11l2 2.5","key":"6ffwbx"}],["circle",{"cx":"11","cy":"11","r":"8","key":"4ej97u"}]],
    ShieldHalf: [["path",{"d":"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z","key":"oel41y"}],["path",{"d":"M12 22V2","key":"zs6s6o"}]],
    Eraser: [["path",{"d":"M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21","key":"g5wo59"}],["path",{"d":"m5.082 11.09 8.828 8.828","key":"1wx5vj"}]],
    HeartPulse: [["path",{"d":"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z","key":"c3ymky"}],["path",{"d":"M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27","key":"1uw2ng"}]],
    ClipboardCheck: [["rect",{"width":"8","height":"4","x":"8","y":"2","rx":"1","ry":"1","key":"tgr4d6"}],["path",{"d":"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2","key":"116196"}],["path",{"d":"m9 14 2 2 4-4","key":"df797q"}]],
    Flag: [["path",{"d":"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528","key":"1jaruq"}]],
    AlertTriangle: [["path",{"d":"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3","key":"wmoenq"}],["path",{"d":"M12 9v4","key":"juzpu7"}],["path",{"d":"M12 17h.01","key":"p32p05"}]],
    ArrowRight: [["path",{"d":"M5 12h14","key":"1ays0h"}],["path",{"d":"m12 5 7 7-7 7","key":"xquz4c"}]],
    ShieldCheck: [["path",{"d":"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z","key":"oel41y"}],["path",{"d":"m9 12 2 2 4-4","key":"dzmm74"}]],
    BookOpen: [["path",{"d":"M12 7v14","key":"1akyts"}],["path",{"d":"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z","key":"ruj8y"}]],
    GraduationCap: [["path",{"d":"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z","key":"j76jl0"}],["path",{"d":"M22 10v6","key":"1lu8f3"}],["path",{"d":"M6 12.5V16a6 3 0 0 0 12 0v-3.5","key":"1r8lef"}]],
    Crosshair: [["circle",{"cx":"12","cy":"12","r":"10","key":"1mglay"}],["line",{"x1":"22","x2":"18","y1":"12","y2":"12","key":"l9bcsi"}],["line",{"x1":"6","x2":"2","y1":"12","y2":"12","key":"13hhkx"}],["line",{"x1":"12","x2":"12","y1":"6","y2":"2","key":"10w3f3"}],["line",{"x1":"12","x2":"12","y1":"22","y2":"18","key":"15g9kq"}]],
    TrendingDown: [["path",{"d":"M16 17h6v-6","key":"t6n2it"}],["path",{"d":"m22 17-8.5-8.5-5 5L2 7","key":"x473p"}]],
    Play: [["polygon",{"points":"6 3 20 12 6 21 6 3","key":"1oa8hb"}]],
    Award: [["path",{"d":"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526","key":"1yiouv"}],["circle",{"cx":"12","cy":"8","r":"6","key":"1vp47v"}]],
    ExternalLink: [["path",{"d":"M15 3h6v6","key":"1q9fwt"}],["path",{"d":"M10 14 21 3","key":"gplh6r"}],["path",{"d":"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6","key":"a6xqqp"}]],
    ListChecks: [["path",{"d":"m3 17 2 2 4-4","key":"1jhpwq"}],["path",{"d":"m3 7 2 2 4-4","key":"1obspn"}],["path",{"d":"M13 6h8","key":"15sg57"}],["path",{"d":"M13 12h8","key":"h98zly"}],["path",{"d":"M13 18h8","key":"oe0vm4"}]],
    Star: [["path",{"d":"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z","key":"r04s7s"}]],
    X: [["path",{"d":"M18 6 6 18","key":"1bl5f8"}],["path",{"d":"m6 6 12 12","key":"d8bk6v"}]],
  };

  /** Build an inline SVG icon element with the same 24×24 stroke rendering
   *  Lucide uses in React (stroke=currentColor, width 2, round caps). */
  function icon(name, className, opts) {
    var nodes = ICON_NODES[name];
    if (!nodes) throw new Error('Unknown icon: ' + name);
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('xmlns', NS);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    if (className) svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < nodes.length; i++) {
      var tag = nodes[i][0];
      var attrs = nodes[i][1];
      var el = document.createElementNS(NS, tag);
      for (var a in attrs) {
        if (a === 'key') continue;
        el.setAttribute(a === 'fill' && attrs[a] === 'none' ? 'fill' : a, attrs[a]);
      }
      svg.appendChild(el);
    }
    if (opts && opts.fill) svg.setAttribute('fill', 'currentColor');
    return svg;
  }

  LAB.ICONS = ICON_NODES;
  LAB.icon = icon;
})(window.LAB);
