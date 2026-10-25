// ─────────────────────────────────────────────────────────────────────────────
// js/icons.js — inline SVG icon registry (exact Lucide path data)
// SVG node data copied verbatim from the lucide-react package the original
// lab used, so every glyph is identical. No icon fonts, no CDNs, no build.
// Usage: icon('check', 'h-3.5 w-3.5') → an <svg> markup string.
// ─────────────────────────────────────────────────────────────────────────────

const ICON_NODES = {
  'check': [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]],
  'paperclip': [ [ "path", { d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551", key: "1miecu" } ] ],
  'x': [ ["path", { d: "M18 6 6 18", key: "1bl5f8" }], ["path", { d: "m6 6 12 12", key: "d8bk6v" }] ],
  'compass': [ [ "path", { d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z", key: "9ktpf1" } ], ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }] ],
  'eye': [ [ "path", { d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0", key: "1nclc0" } ], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }] ],
  'fingerprint': [ ["path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4", key: "1nerag" }], ["path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88", key: "o46ks0" }], ["path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02", key: "ptglia" }], ["path", { d: "M2 12a10 10 0 0 1 18-6", key: "ydlgp0" }], ["path", { d: "M2 16h.01", key: "1gqxmh" }], ["path", { d: "M21.8 16c.2-2 .131-5.354 0-6", key: "drycrb" }], ["path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2", key: "1tidbn" }], ["path", { d: "M8.65 22c.21-.66.45-1.32.57-2", key: "13wd9y" }], ["path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2", key: "1fr1j5" }] ],
  'graduation-cap': [ [ "path", { d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z", key: "j76jl0" } ], ["path", { d: "M22 10v6", key: "1lu8f3" }], ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5", key: "1r8lef" }] ],
  'mountain': [["path", { d: "m8 3 4 8 5-5 5 15H2L8 3z", key: "otkl63" }]],
  'scan-search': [ ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }], ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }], ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }], ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }], ["path", { d: "m16 16-1.9-1.9", key: "1dq9hf" }] ],
  'award': [ [ "path", { d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526", key: "1yiouv" } ], ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }] ],
  'clipboard-check': [ ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }], [ "path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2", key: "116196" } ], ["path", { d: "m9 14 2 2 4-4", key: "df797q" }] ],
  'rotate-ccw': [ ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }], ["path", { d: "M3 3v5h5", key: "1xhq8a" }] ],
  'shield-alert': [ [ "path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" } ], ["path", { d: "M12 8v4", key: "1got3b" }], ["path", { d: "M12 16h.01", key: "1drbdi" }] ],
  'briefcase': [ ["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "jecpp" }], ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" }] ],
  'building-2': [ ["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }], ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }], ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }], ["path", { d: "M10 6h4", key: "1itunk" }], ["path", { d: "M10 10h4", key: "tcdvrf" }], ["path", { d: "M10 14h4", key: "kelpxr" }], ["path", { d: "M10 18h4", key: "1ulq68" }] ],
  'calendar-range': [ ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["path", { d: "M3 10h18", key: "8toen8" }], ["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M17 14h-6", key: "bkmgh3" }], ["path", { d: "M13 18H7", key: "bb0bb7" }], ["path", { d: "M7 14h.01", key: "1qa3f1" }], ["path", { d: "M17 18h.01", key: "1bdyru" }] ],
  'folder-open': [ [ "path", { d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2", key: "usdka0" } ] ],
  'landmark': [ ["path", { d: "M10 18v-7", key: "wt116b" }], [ "path", { d: "M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z", key: "1m329m" } ], ["path", { d: "M14 18v-7", key: "vav6t3" }], ["path", { d: "M18 18v-7", key: "aexdmj" }], ["path", { d: "M3 22h18", key: "8prr45" }], ["path", { d: "M6 18v-7", key: "1ivflk" }] ],
  'list-ordered': [ ["path", { d: "M10 12h11", key: "6m4ad9" }], ["path", { d: "M10 18h11", key: "11hvi2" }], ["path", { d: "M10 6h11", key: "c7qv1k" }], ["path", { d: "M4 10h2", key: "16xx2s" }], ["path", { d: "M4 6h1v4", key: "cnovpq" }], ["path", { d: "M6 18H4c0-1 2-2 2-3s-1-1.5-2-1", key: "m9a95d" }] ],
  'radio': [ ["path", { d: "M16.247 7.761a6 6 0 0 1 0 8.478", key: "1fwjs5" }], ["path", { d: "M19.075 4.933a10 10 0 0 1 0 14.134", key: "ehdyv1" }], ["path", { d: "M4.925 19.067a10 10 0 0 1 0-14.134", key: "1q22gi" }], ["path", { d: "M7.753 16.239a6 6 0 0 1 0-8.478", key: "r2q7qm" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }] ],
  'scale': [ ["path", { d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z", key: "7g6ntu" }], ["path", { d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z", key: "ijws7r" }], ["path", { d: "M7 21h10", key: "1b0cd5" }], ["path", { d: "M12 3v18", key: "108xh3" }], ["path", { d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2", key: "3gwbw2" }] ],
  'shield-question': [ [ "path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" } ], ["path", { d: "M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3", key: "mhlwft" }], ["path", { d: "M12 17h.01", key: "p32p05" }] ],
  'target': [ ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }] ],
  'at-sign': [ ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }], ["path", { d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8", key: "7n84p3" }] ],
  'book-open': [ ["path", { d: "M12 7v14", key: "1akyts" }], [ "path", { d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z", key: "ruj8y" } ] ],
  'clipboard-list': [ ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }], [ "path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2", key: "116196" } ], ["path", { d: "M12 11h4", key: "1jrz19" }], ["path", { d: "M12 16h4", key: "n85exb" }], ["path", { d: "M8 11h.01", key: "1dfujw" }], ["path", { d: "M8 16h.01", key: "18s6g9" }] ],
  'file-text': [ ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M10 9H8", key: "b1mrlr" }], ["path", { d: "M16 13H8", key: "t4e002" }], ["path", { d: "M16 17H8", key: "z1uh3a" }] ],
  'github': [ [ "path", { d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4", key: "tonef" } ], ["path", { d: "M9 18c-4.51 2-5-2-7-2", key: "9comsn" }] ],
  'globe': [ ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }], ["path", { d: "M2 12h20", key: "9i4pu4" }] ],
  'messages-square': [ ["path", { d: "M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z", key: "p1xzt8" }], ["path", { d: "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1", key: "1cx29u" }] ],
  'newspaper': [ ["path", { d: "M15 18h-5", key: "95g1m2" }], ["path", { d: "M18 14h-8", key: "sponae" }], [ "path", { d: "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2", key: "39pd36" } ], ["rect", { width: "8", height: "4", x: "10", y: "6", rx: "1", key: "aywv1n" }] ],
  'scan-line': [ ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }], ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }], ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }], ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }], ["path", { d: "M7 12h10", key: "b7w52i" }] ],
  'activity': [ [ "path", { d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2", key: "169zse" } ] ],
  'archive': [ ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }], ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }], ["path", { d: "M10 12h4", key: "a56b0p" }] ],
  'binary': [ ["rect", { x: "14", y: "14", width: "4", height: "6", rx: "2", key: "p02svl" }], ["rect", { x: "6", y: "4", width: "4", height: "6", rx: "2", key: "xm4xkj" }], ["path", { d: "M6 20h4", key: "1i6q5t" }], ["path", { d: "M14 10h4", key: "ru81e7" }], ["path", { d: "M6 14h2v6", key: "16z9wg" }], ["path", { d: "M14 4h2v6", key: "1idq9u" }] ],
  'git-branch': [ ["line", { x1: "6", x2: "6", y1: "3", y2: "15", key: "17qcm7" }], ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }], ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }], ["path", { d: "M18 9a9 9 0 0 1-9 9", key: "n2h4wq" }] ],
  'inbox': [ ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }], [ "path", { d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z", key: "oot6mr" } ] ],
  'radio-tower': [ ["path", { d: "M4.9 16.1C1 12.2 1 5.8 4.9 1.9", key: "s0qx1y" }], ["path", { d: "M7.8 4.7a6.14 6.14 0 0 0-.8 7.5", key: "1idnkw" }], ["circle", { cx: "12", cy: "9", r: "2", key: "1092wv" }], ["path", { d: "M16.2 4.8c2 2 2.26 5.11.8 7.47", key: "ojru2q" }], ["path", { d: "M19.1 1.9a9.96 9.96 0 0 1 0 14.1", key: "rhi7fg" }], ["path", { d: "M9.5 18h5", key: "mfy3pd" }], ["path", { d: "m8 22 4-11 4 11", key: "25yftu" }] ],
  'route': [ ["circle", { cx: "6", cy: "19", r: "3", key: "1kj8tv" }], ["path", { d: "M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15", key: "1d8sl" }], ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }] ],
  'waves': [ [ "path", { d: "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1", key: "knzxuh" } ], [ "path", { d: "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1", key: "2jd2cc" } ], [ "path", { d: "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1", key: "rd2r6e" } ] ],
  'check-circle-2': [ ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }] ],
  'chevron-down': [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]],
  'crosshair': [ ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["line", { x1: "22", x2: "18", y1: "12", y2: "12", key: "l9bcsi" }], ["line", { x1: "6", x2: "2", y1: "12", y2: "12", key: "13hhkx" }], ["line", { x1: "12", x2: "12", y1: "6", y2: "2", key: "10w3f3" }], ["line", { x1: "12", x2: "12", y1: "22", y2: "18", key: "15g9kq" }] ],
  'info': [ ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 16v-4", key: "1dtifu" }], ["path", { d: "M12 8h.01", key: "e9boi3" }] ],
  'lightbulb': [ [ "path", { d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5", key: "1gvzjb" } ], ["path", { d: "M9 18h6", key: "x1upvd" }], ["path", { d: "M10 22h4", key: "ceow96" }] ],
  'lock': [ ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }] ],
  'book-marked': [ ["path", { d: "M10 2v8l3-3 3 3V2", key: "sqw3rj" }], [ "path", { d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20", key: "k3hazp" } ] ],
  'briefcase-business': [ ["path", { d: "M12 12h.01", key: "1mp3jc" }], ["path", { d: "M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2", key: "1ksdt3" }], ["path", { d: "M22 13a18.15 18.15 0 0 1-20 0", key: "12hx5q" }], ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" }] ],
  'external-link': [ ["path", { d: "M15 3h6v6", key: "1q9fwt" }], ["path", { d: "M10 14 21 3", key: "gplh6r" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }] ],
  'list-checks': [ ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }], ["path", { d: "m3 7 2 2 4-4", key: "1obspn" }], ["path", { d: "M13 6h8", key: "15sg57" }], ["path", { d: "M13 12h8", key: "h98zly" }], ["path", { d: "M13 18h8", key: "oe0vm4" }] ],
  'scroll-text': [ ["path", { d: "M15 12h-5", key: "r7krc0" }], ["path", { d: "M15 8h-5", key: "1khuty" }], ["path", { d: "M19 17V5a2 2 0 0 0-2-2H4", key: "zz82l3" }], [ "path", { d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3", key: "1ph1d7" } ] ],
  'send': [ [ "path", { d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z", key: "1ffxy3" } ], ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }] ],
  'shield-check': [ [ "path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" } ], ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }] ],
  'swords': [ ["polyline", { points: "14.5 17.5 3 6 3 3 6 3 17.5 14.5", key: "1hfsw2" }], ["line", { x1: "13", x2: "19", y1: "19", y2: "13", key: "1vrmhu" }], ["line", { x1: "16", x2: "20", y1: "16", y2: "20", key: "1bron3" }], ["line", { x1: "19", x2: "21", y1: "21", y2: "19", key: "13pww6" }], ["polyline", { points: "14.5 6.5 18 3 21 3 21 6 17.5 9.5", key: "hbey2j" }], ["line", { x1: "5", x2: "9", y1: "14", y2: "18", key: "1hf58s" }], ["line", { x1: "7", x2: "4", y1: "17", y2: "20", key: "pidxm4" }], ["line", { x1: "3", x2: "5", y1: "19", y2: "21", key: "1pehsh" }] ],
  'arrow-right': [ ["path", { d: "M5 12h14", key: "1ays0h" }], ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }] ],
};

/**
 * Render a Lucide icon as an inline SVG string (24×24 viewBox, stroke-based,
 * exactly like <Icon /> in the original). `cls` carries sizing classes.
 */
function icon(name, cls) {
  const nodes = ICON_NODES[name];
  if (!nodes) return '';
  const inner = nodes
    .map(function (node) {
      const tag = node[0];
      const attrs = Object.keys(node[1])
        .filter(function (k) { return k !== 'key'; })
        .map(function (k) { return k + '="' + node[1][k] + '"'; })
        .join(' ');
      return '<' + tag + ' ' + attrs + '></' + tag + '>';
    })
    .join('');
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"' +
    ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
    ' class="' + (cls || '') + '" aria-hidden="true">' + inner + '</svg>'
  );
}
