// ── THE VULN BULLETIN ── inline SVG icons (exact Lucide path data, ISC license) ──
// Extracted verbatim from lucide-react v0.525.0 so the static lab's iconography is identical.
const ICON_PATHS = {
  "radio": "<path d=\"M16.247 7.761a6 6 0 0 1 0 8.478\"></path><path d=\"M19.075 4.933a10 10 0 0 1 0 14.134\"></path><path d=\"M4.925 19.067a10 10 0 0 1 0-14.134\"></path><path d=\"M7.753 16.239a6 6 0 0 1 0-8.478\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>",
  "newspaper": "<path d=\"M15 18h-5\"></path><path d=\"M18 14h-8\"></path><path d=\"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2\"></path><rect width=\"8\" height=\"4\" x=\"10\" y=\"6\" rx=\"1\"></rect>",
  "rss": "<path d=\"M4 11a9 9 0 0 1 9 9\"></path><path d=\"M4 4a16 16 0 0 1 16 16\"></path><circle cx=\"5\" cy=\"19\" r=\"1\"></circle>",
  "pen-tool": "<path d=\"M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z\"></path><path d=\"m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18\"></path><path d=\"m2.3 2.3 7.286 7.286\"></path><circle cx=\"11\" cy=\"11\" r=\"2\"></circle>",
  "calendar-clock": "<path d=\"M16 14v2.2l1.6 1\"></path><path d=\"M16 2v4\"></path><path d=\"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5\"></path><path d=\"M3 10h5\"></path><path d=\"M8 2v4\"></path><circle cx=\"16\" cy=\"16\" r=\"6\"></circle>",
  "landmark": "<path d=\"M10 18v-7\"></path><path d=\"M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z\"></path><path d=\"M14 18v-7\"></path><path d=\"M18 18v-7\"></path><path d=\"M3 22h18\"></path><path d=\"M6 18v-7\"></path>",
  "graduation-cap": "<path d=\"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z\"></path><path d=\"M22 10v6\"></path><path d=\"M6 12.5V16a6 3 0 0 0 12 0v-3.5\"></path>",
  "archive": "<rect width=\"20\" height=\"5\" x=\"2\" y=\"3\" rx=\"1\"></rect><path d=\"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8\"></path><path d=\"M10 12h4\"></path>",
  "clipboard-list": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"></rect><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"></path><path d=\"M12 11h4\"></path><path d=\"M12 16h4\"></path><path d=\"M8 11h.01\"></path><path d=\"M8 16h.01\"></path>",
  "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path>",
  "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v2\"></path><path d=\"M12 20v2\"></path><path d=\"m4.93 4.93 1.41 1.41\"></path><path d=\"m17.66 17.66 1.41 1.41\"></path><path d=\"M2 12h2\"></path><path d=\"M20 12h2\"></path><path d=\"m6.34 17.66-1.41 1.41\"></path><path d=\"m19.07 4.93-1.41 1.41\"></path>",
  "moon-star": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9\"></path><path d=\"M20 3v4\"></path><path d=\"M22 5h-4\"></path>",
  "shield-alert": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path><path d=\"M12 8v4\"></path><path d=\"M12 16h.01\"></path>",
  "feather": "<path d=\"M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z\"></path><path d=\"M16 8 2 22\"></path><path d=\"M17.5 15H9\"></path>",
  "book-open": "<path d=\"M12 7v14\"></path><path d=\"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\"></path>",
  "rotate-ccw": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"></path><path d=\"M3 3v5h5\"></path>",
  "arrow-right": "<path d=\"M5 12h14\"></path><path d=\"m12 5 7 7-7 7\"></path>",
  "chevron-up": "<path d=\"m18 15-6-6-6 6\"></path>",
  "chevron-down": "<path d=\"m6 9 6 6 6-6\"></path>",
  "x": "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>",
  "flag": "<path d=\"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528\"></path>",
  "scan-search": "<path d=\"M3 7V5a2 2 0 0 1 2-2h2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"m16 16-1.9-1.9\"></path>",
  "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>",
  "check": "<path d=\"M20 6 9 17l-5-5\"></path>",
  "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"></path><path d=\"M9 18h6\"></path><path d=\"M10 22h4\"></path>",
  "check-circle-2": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path>",
  "x-circle": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m15 9-6 6\"></path><path d=\"m9 9 6 6\"></path>",
  "crosshair": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"22\" x2=\"18\" y1=\"12\" y2=\"12\"></line><line x1=\"6\" x2=\"2\" y1=\"12\" y2=\"12\"></line><line x1=\"12\" x2=\"12\" y1=\"6\" y2=\"2\"></line><line x1=\"12\" x2=\"12\" y1=\"22\" y2=\"18\"></line>",
  "star": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"></path>",
  "library": "<path d=\"m16 6 4 14\"></path><path d=\"M12 6v14\"></path><path d=\"M8 8v12\"></path><path d=\"M4 4v16\"></path>",
  "phone-call": "<path d=\"M13 2a9 9 0 0 1 9 9\"></path><path d=\"M13 6a5 5 0 0 1 5 5\"></path><path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\"></path>",
  "siren": "<path d=\"M7 18v-6a5 5 0 1 1 10 0v6\"></path><path d=\"M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z\"></path><path d=\"M21 12h1\"></path><path d=\"M18.5 4.5 18 5\"></path><path d=\"M2 12h1\"></path><path d=\"M12 2v1\"></path><path d=\"m4.929 4.929.707.707\"></path><path d=\"M12 12v6\"></path>",
  "megaphone": "<path d=\"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z\"></path><path d=\"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14\"></path><path d=\"M8 6v8\"></path>",
  "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><path d=\"M16 3.128a4 4 0 0 1 0 7.744\"></path><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle>",
  "handshake": "<path d=\"m11 17 2 2a1 1 0 1 0 3-3\"></path><path d=\"m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4\"></path><path d=\"m21 3 1 11h-2\"></path><path d=\"M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3\"></path><path d=\"M3 4h8\"></path>",
  "external-link": "<path d=\"M15 3h6v6\"></path><path d=\"M10 14 21 3\"></path><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path>",
  "shield-check": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path><path d=\"m9 12 2 2 4-4\"></path>",
  "swords": "<polyline points=\"14.5 17.5 3 6 3 3 6 3 17.5 14.5\"></polyline><line x1=\"13\" x2=\"19\" y1=\"19\" y2=\"13\"></line><line x1=\"16\" x2=\"20\" y1=\"16\" y2=\"20\"></line><line x1=\"19\" x2=\"21\" y1=\"21\" y2=\"19\"></line><polyline points=\"14.5 6.5 18 3 21 3 21 6 17.5 9.5\"></polyline><line x1=\"5\" x2=\"9\" y1=\"14\" y2=\"18\"></line><line x1=\"7\" x2=\"4\" y1=\"17\" y2=\"20\"></line><line x1=\"3\" x2=\"5\" y1=\"19\" y2=\"21\"></line>",
  "circle-dashed": "<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\"></path><path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\"></path><path d=\"M17.609 3.721a10 10 0 0 1 2.69 2.7\"></path><path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\"></path><path d=\"M20.279 17.609a10 10 0 0 1-2.7 2.69\"></path><path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\"></path><path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\"></path><path d=\"M6.391 20.279a10 10 0 0 1-2.69-2.7\"></path>",
  "clipboard-check": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"></rect><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"></path><path d=\"m9 14 2 2 4-4\"></path>",
}

function icon(name, cls) {
  const inner = ICON_PATHS[name] || ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ic ${cls || 's4'}" aria-hidden="true">${inner}</svg>`
}
