// ─────────────────────────────────────────────────────────────────────────────
// THE SWITCH YARD — js/ui.js
// Rendering primitives (icons, panels, buttons, badges), the YARD views
// (dispatch board, workbench, yard map, history, desks) and the master render
// loop. Ported from the framework lab's panels.tsx / DispatchBoard.tsx /
// Workbench.tsx / YardMap.tsx / Desks.tsx / Yard.tsx — same structure, same
// classes of interaction, same ARIA affordances.
// Static port: string templates + full-section re-render on state change,
// with focus restoration (data-fid) to preserve keyboard continuity.
// ─────────────────────────────────────────────────────────────────────────────
(function (LAB) {
  'use strict';

  // ── Lucide icons (inline SVG, exact lucide paths) ────────────────────────────
  var PATHS = {
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'map': '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.2-2.1a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'history': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    'git-branch': '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'scan-search': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'save': '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    'git-commit-horizontal': '<circle cx="12" cy="12" r="3"/><line x1="1" x2="7" y1="12" y2="12"/><line x1="17" x2="23" y1="12" y2="12"/>',
    'package-open': '<path d="M12 22v-9"/><path d="M8.39 8.14 3 10.5l9 4.5 9-4.5-5.39-2.36"/><path d="M3 10.5V17a2 2 0 0 0 1.11 1.79L12 22l7.89-3.21A2 2 0 0 0 21 17v-6.5"/><path d="m7.5 4.27 9 4.5"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'check-circle-2': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    'git-merge': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
    'tag': '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    'git-pull-request-arrow': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="6" y1="9" y2="21"/>',
    'radio-tower': '<path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/><path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"/><circle cx="12" cy="9" r="2"/><path d="M16.2 4.8c2 2 2.26 5.11.8 7.47"/><path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1"/><path d="M9.5 18h5"/><path d="m8 22 4-11 4 11"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'siren': '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="m2 12 1 0"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/>',
    'workflow': '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    'ban': '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    'book-open-text': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="M6 8h2"/><path d="M6 12h2"/><path d="M16 8h2"/><path d="M16 12h2"/>',
    'warehouse': '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
    'clipboard-check': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    'shield-half': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 22V2"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'radio': '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'crosshair': '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };

  LAB.icon = function (name, cls) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icn ' + (cls || '') + '" aria-hidden="true">' + (PATHS[name] || '') + '</svg>';
  };

  // ── helpers ──────────────────────────────────────────────────────────────────
  LAB.esc = function (s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  LAB.hazardStripe = function (cls) {
    return '<div aria-hidden="true" class="hazard-stripe ' + (cls || '') + '"></div>';
  };

  var PILLAR_META = {
    P1: { label: 'P1 · UNDERSTAND', cls: 'pillar-badge pillar-p1' },
    P2: { label: 'P2 · RECOGNIZE', cls: 'pillar-badge pillar-p2' },
    P3: { label: 'P3 · DETECT', cls: 'pillar-badge pillar-p3' },
    P4: { label: 'P4 · MITIGATE', cls: 'pillar-badge pillar-p4' }
  };

  LAB.pillarBadge = function (p) {
    return '<span class="' + PILLAR_META[p].cls + '">' + PILLAR_META[p].label + '</span>';
  };

  LAB.panel = function (title, icon, body, tone, id) {
    var toneCls = tone === 'alert' ? ' panel--alert' : tone === 'ok' ? ' panel--ok' : '';
    return '<section' + (id ? ' id="' + id + '"' : '') + ' aria-label="' + LAB.esc(title) + '" class="panel' + toneCls + '">' +
      '<h3 class="panel-title">' + icon + LAB.esc(title) + '</h3>' +
      '<div class="panel-body">' + body + '</div>' +
      '</section>';
  };

  // yardButton(opts): {action, arg, fid, tone, disabled, ariaLabel, title, label, cls}
  LAB.yardButton = function (o) {
    var tone = o.tone || 'default';
    var attrs = ' type="button" class="btn btn--' + tone + (o.cls ? ' ' + o.cls : '') + '"' +
      (o.action ? ' data-action="' + o.action + '"' : '') +
      (o.arg !== undefined ? ' data-arg="' + LAB.esc(o.arg) + '"' : '') +
      (o.val !== undefined ? ' data-val="' + LAB.esc(o.val) + '"' : '') +
      (o.fid ? ' data-fid="' + LAB.esc(o.fid) + '"' : '') +
      (o.disabled ? ' disabled' : '') +
      (o.ariaLabel ? ' aria-label="' + LAB.esc(o.ariaLabel) + '"' : '') +
      (o.title ? ' title="' + LAB.esc(o.title) + '"' : '');
    return '<button' + attrs + '>' + o.label + '</button>';
  };

  LAB.toggle = function (o) {
    return '<button type="button" role="switch" aria-checked="' + (!!o.checked) + '" data-action="' + o.action + '"' +
      (o.arg !== undefined ? ' data-arg="' + LAB.esc(o.arg) + '"' : '') +
      (o.fid ? ' data-fid="' + LAB.esc(o.fid) + '"' : '') +
      ' class="toggle-row">' +
      '<span><span class="toggle-label">' + LAB.esc(o.label) + '</span>' +
      (o.hint ? '<span class="toggle-hint">' + LAB.esc(o.hint) + '</span>' : '') +
      '</span>' +
      '<span class="toggle-pill' + (o.checked ? ' toggle-pill--on' : '') + '" aria-hidden="true"><span class="toggle-knob' + (o.checked ? ' toggle-knob--on' : '') + '"></span></span>' +
      '</button>';
  };

  LAB.field = function (label, inner) {
    return '<label class="field"><span class="field-label">' + LAB.esc(label) + '</span>' + inner + '</label>';
  };

  LAB.statusDot = function (kind) {
    var label = { modified: 'modified', staged: 'staged', untracked: 'untracked', ignored: 'ignored', clean: 'unchanged' }[kind] || kind;
    return '<span class="dot dot--' + kind + '" role="img" aria-label="' + label + '"></span>';
  };

  LAB.stars = function (n, size) {
    var full = ''; var dim = '';
    for (var i = 0; i < 3; i++) { if (i < n) full += '★'; else dim += '★'; }
    return '<span class="stars ' + (size || '') + '" aria-label="' + n + ' of 3 stars">' + full + '<span class="stars-dim">' + dim + '</span></span>';
  };

  var LOOK = {
    'OBJ-M1': 'RULEBOOK tab → depot cards',
    'OBJ-M2': 'YARD → WORKBENCH file tree + DETECT desk incident board',
    'OBJ-M3': 'YARD → HISTORY panel',
    'OBJ-M4': 'YARD → SWITCH DESK branch desk',
    'OBJ-M5': 'YARD → WORKBENCH (stage buttons)',
    'OBJ-M6': 'YARD → WORKBENCH commit composer',
    'OBJ-M7': 'YARD → SWITCH DESK merge + WORKBENCH conflict + Tag desk',
    'OBJ-M8': 'YARD → SWITCH DESK dispatch desk',
    'OBJ-M9': 'YARD → DETECT desk scanner bench',
    'OBJ-M10': 'YARD → WORKBENCH (.gitignore, untrack)',
    'OBJ-M11': 'YARD → DETECT desk incident board',
    'OBJ-M12': 'YARD → GOVERNANCE desk',
    'OBJ-H1': 'YARD → WORKBENCH + HISTORY, answer in DETECT desk',
    'OBJ-H2': 'YARD → DETECT incident board + WORKBENCH',
    'OBJ-H3': 'YARD → SWITCH DESK doctrine panel',
    'OBJ-H4': 'YARD → SWITCH DESK + WORKBENCH',
    'OBJ-H5': 'YARD → DETECT scanner bench',
    'OBJ-H6': 'YARD → DETECT audit stream',
    'OBJ-H7': 'YARD → DETECT gate builder + GOVERNANCE',
    'OBJ-H8': 'YARD → HISTORY revert + Tag desk',
    'OBJ-H9': 'YARD → GOVERNANCE roles'
  };

  // ── Dispatch board (objectives tracker) ──────────────────────────────────────
  LAB.dispatchBoard = function (st) {
    var mode = st.mode;
    var objectives = mode === 'medium' ? LAB.OBJECTIVES_MEDIUM : LAB.OBJECTIVES_HARD;
    var done = objectives.filter(function (o) { return st.objProgress[o.id] && st.objProgress[o.id].done; }).length;
    var html = '<div class="space-y-2">' +
      '<div class="board-head"><h2 class="panel-heading">Dispatch board · objectives</h2>' +
      '<span class="chip chip-mono" aria-live="polite">' + done + '/' + objectives.length + '</span></div>';

    objectives.forEach(function (o, idx) {
      var p = st.objProgress[o.id] || { done: false, attempts: 0, hintsUsed: 0, stars: 0 };
      html += '<article class="obj-card' + (p.done ? ' obj-card--done' : '') + '" aria-label="Objective ' + o.id + ': ' + LAB.esc(o.title) + '">' +
        '<div class="obj-row">' +
        '<span class="chip chip-mono">' + (mode === 'medium' ? 'M' : 'H') + (idx + 1) + '</span>' +
        '<div class="obj-main">' +
        '<div class="obj-title-row">' + LAB.pillarBadge(o.pillar) +
        '<h3 class="obj-title' + (p.done ? ' obj-title--done' : '') + '">' + LAB.esc(o.title) + '</h3>' +
        (p.done ? LAB.icon('check-circle-2', 'icn-ok') : '') +
        '</div>' +
        '<p class="obj-brief">' + LAB.esc(o.brief) + '</p>' +
        '<p class="obj-anchor">' + LAB.esc(o.anchor) + '</p>';

      // OBJ-M3 inline form
      if (o.id === 'OBJ-M3') {
        var sel = '<select aria-label="Select the introducing commit" data-change="form" data-key="m3-commit" class="input select-m3">' +
          '<option value="">which commit introduced it?</option>';
        Object.keys(st.repo.commits).forEach(function (cid) {
          var c = st.repo.commits[cid];
          sel += '<option value="' + LAB.esc(c.id) + '"' + (st.forms['m3-commit'] === c.id ? ' selected' : '') + '>' + LAB.esc(c.id) + ' — ' + LAB.esc(c.message.slice(0, 44)) + '</option>';
        });
        sel += '</select>';
        html += '<div class="mt-2">' + sel + '</div>';
      }

      // medium: where-to-look chip
      if (mode === 'medium' && !p.done && LOOK[o.id]) {
        html += '<p class="look-chip">' + LAB.icon('map-pin', 'icn-xs') + ' ' + LAB.esc(LOOK[o.id]) + '</p>';
      }

      // revealed hints
      if (p.hintsUsed > 0) {
        html += '<ul class="hint-box">';
        o.hints.slice(0, p.hintsUsed).forEach(function (h) {
          html += '<li>' + LAB.icon('lightbulb', 'icn-xs') + ' <span>' + LAB.esc(h) + '</span></li>';
        });
        html += '</ul>';
      }

      // latest check feedback
      if (p.lastMsg) {
        html += '<div role="status" class="feedback ' + (p.lastPass ? 'feedback--ok' : 'feedback--bad') + '">' + LAB.esc(p.lastMsg) + '</div>';
      }

      // controls
      html += '<div class="obj-actions">';
      if (!p.done) {
        html += LAB.yardButton({ tone: 'primary', action: 'check-obj', arg: o.id, fid: 'check-' + o.id, ariaLabel: 'Check results for ' + o.title, label: 'Check results' });
        if (p.hintsUsed < o.maxHints) {
          html += LAB.yardButton({ tone: 'default', action: 'hint-obj', arg: o.id, fid: 'hint-' + o.id, ariaLabel: 'Reveal hint ' + (p.hintsUsed + 1) + ' for ' + o.title, label: LAB.icon('chevron-down', 'icn-xs') + ' Hint (' + p.hintsUsed + '/' + o.maxHints + ')' });
        }
      }
      if (p.done) {
        html += '<span class="recheck-note">' + LAB.stars(p.stars) + ' ' + LAB.icon('refresh-cw', 'icn-xs') + ' re-check anytime</span>';
        html += LAB.yardButton({ tone: 'default', action: 'check-obj', arg: o.id, fid: 'recheck-' + o.id, cls: 'btn--sm', ariaLabel: 'Re-check ' + o.title, label: 're-check' });
      }
      html += '</div></div></div></article>';
    });
    html += '</div>';
    return html;
  };

  // ── Workbench ────────────────────────────────────────────────────────────────
  LAB.workbench = function (st) {
    var repo = st.repo;
    var ui = LAB.store.ui;
    var status = LAB.gitStatus(repo);
    var tree = LAB.headCommit(repo).tree;
    var tracked = new Set(Object.keys(tree));

    var allPathsSet = new Set(Object.keys(repo.files).concat(Object.keys(tree)));
    var allPaths = Array.from(allPathsSet).sort();

    function kindOf(p) {
      if (p in repo.staged) return 'staged';
      if (!tracked.has(p)) return status.ignored.includes(p) ? 'ignored' : 'untracked';
      if (!(p in repo.files) || repo.files[p] !== tree[p]) return 'modified';
      return 'clean';
    }

    var selected = ui.wbSelected;
    var content = (selected in repo.files) ? repo.files[selected] : '(file exists only in history — not in the working tree)';
    var editing = ui.wbDraft !== null ? ui.wbDraft : content;
    var conflicted = selected !== null && LAB.hasMarkers(repo.files[selected] ?? '');

    var html = '<div class="grid-workbench">';

    // file tree
    var treeBody = '<ul class="file-tree" aria-label="Repository files">';
    allPaths.forEach(function (p) {
      var k = kindOf(p);
      treeBody += '<li class="file-row' + (p === selected ? ' file-row--sel' : '') + '">' +
        '<button type="button" class="file-btn" data-action="wb-select-file" data-arg="' + LAB.esc(p) + '" data-fid="file-' + LAB.esc(p) + '">' +
        LAB.statusDot(k) + '<span class="file-name" title="' + LAB.esc(p) + '">' + LAB.esc(p) + '</span></button>';
      if (k === 'untracked' || k === 'modified') {
        treeBody += LAB.yardButton({ tone: 'ghost', cls: 'btn--tiny', action: 'wb-stage', arg: p, fid: 'stage-' + p, ariaLabel: 'Stage ' + p, label: 'stage' });
      }
      if (tracked.has(p) && !(p in repo.staged) && k !== 'staged') {
        treeBody += LAB.yardButton({ tone: 'ghost', cls: 'btn--tiny', action: 'wb-untrack', arg: p, fid: 'untrack-' + p, ariaLabel: 'Untrack ' + p + ', keep local copy', title: 'Untrack (keep local)', label: 'untrack' });
      }
      if (k === 'staged') {
        treeBody += LAB.yardButton({ tone: 'ghost', cls: 'btn--tiny', action: 'wb-unstage', arg: p, fid: 'unstage-' + p, ariaLabel: 'Unstage ' + p, label: 'unstage' });
      }
      treeBody += '</li>';
    });
    treeBody += '</ul>';
    treeBody += '<p class="legend">● green = staged (on the siding) · ● amber = modified, unstaged · ● grey = untracked · ● dark = ignored/unchanged. Staged removals can be unstaged too.</p>';
    html += LAB.panel('File tree · working tree', LAB.icon('file-text', 'icn-xs'), treeBody);

    // editor + siding + composer
    html += '<div class="space-y-3">';
    if (repo.merging) {
      html += '<div class="clash-banner" role="alert">' +
        '<p class="clash-title">' + LAB.icon('alert-triangle', 'icn-sm') + ' JUNCTION CLASH — merge in progress from <span class="mono">' + LAB.esc(repo.merging.source) + '</span></p>' +
        '<p class="clash-body">Resolve every conflicted file (remove the &lt;&lt;&lt;&lt;&lt;&lt;&lt; / ======= / &gt;&gt;&gt;&gt;&gt;&gt;&gt; markers, keep the right content), <strong>stage</strong> it, then commit — that commit closes the merge with two parents.</p>' +
        '</div>';
    }

    var editorBody = '';
    if (conflicted) {
      editorBody += '<div class="conflict-actions">' +
        LAB.yardButton({ tone: 'primary', action: 'wb-take-theirs', fid: 'take-theirs', label: 'Take theirs (' + LAB.esc(repo.merging ? repo.merging.source : '') + ')' }) +
        LAB.yardButton({ tone: 'default', action: 'wb-keep-ours', fid: 'keep-ours', label: 'Keep ours (HEAD)' }) +
        '<span class="hint-inline">Markers gone? Then stage + commit to close the merge.</span>' +
        '</div>';
    }
    editorBody += '<label class="sr-only" for="file-editor">File content editor for ' + LAB.esc(selected) + '</label>';
    editorBody += '<textarea id="file-editor" data-input="wb-editor" spellcheck="false" ' + ((selected in repo.files) ? '' : 'readOnly ') +
      'class="editor">' + LAB.esc(editing) + '</textarea>';
    editorBody += '<div class="editor-actions">' +
      LAB.yardButton({ tone: 'primary', action: 'wb-save-edit', fid: 'save-edit', disabled: ui.wbDraft === null, label: LAB.icon('save', 'icn-xs') + ' Save working-tree edit' }) +
      LAB.yardButton({ tone: 'default', action: 'wb-stage-selected', fid: 'stage-selected', ariaLabel: 'Stage ' + selected, label: 'Stage this file' }) +
      '<span class="hint-inline">Saving changes the working tree only — staging decides what rides in the next commit.</span>' +
      '</div>';
    html += LAB.panel('File view · ' + selected, LAB.icon('file-text', 'icn-xs'), editorBody, conflicted ? 'alert' : 'default');

    var sidingBody = '<div class="siding-chips">';
    if (status.stagedPaths.length === 0) sidingBody += '<span class="muted-sm">The siding is empty — nothing staged yet.</span>';
    status.stagedPaths.forEach(function (p) {
      sidingBody += '<span class="staged-chip">' + LAB.esc(p) + (repo.staged[p] === null ? ' (removal)' : '') + '</span>';
    });
    sidingBody += '</div>';
    sidingBody += '<label class="sr-only" for="commit-msg">Commit message</label>';
    sidingBody += '<input id="commit-msg" data-input="wb-msg" value="' + LAB.esc(ui.wbMsg) + '" placeholder="e.g. fix: raise trackline-api instance to t3.large (NF-142)" class="input">';
    sidingBody += '<div class="editor-actions">' +
      LAB.yardButton({ tone: 'primary', action: 'wb-commit', fid: 'commit', disabled: status.stagedPaths.length === 0 || ui.wbMsg.trim().length === 0, ariaLabel: 'Commit staged changes', label: LAB.icon('git-commit-horizontal', 'icn-sm') + ' Commit (' + status.stagedPaths.length + ' on siding)' }) +
      '<span class="hint-inline">Commits are authored as “You (yardmaster)”. One logical change per commit — atomic commits.</span>' +
      '</div>';
    html += LAB.panel('Staging siding + Commit composer', LAB.icon('package-open', 'icn-xs'), sidingBody);

    html += '</div></div>';
    return html;
  };

  // ── Yard map (SVG commit graph) ──────────────────────────────────────────────
  LAB.yardMap = function (repo) {
    function topoOrder(commits) {
      var ids = Object.keys(commits);
      var indeg = {};
      var children = {};
      ids.forEach(function (id) { indeg[id] = 0; });
      ids.forEach(function (id) {
        commits[id].parents.forEach(function (p) {
          if (!commits[p]) return;
          (children[p] = children[p] || []).push(id);
          indeg[id] = (indeg[id] || 0) + 1;
        });
      });
      var roots = ids.filter(function (id) { return (indeg[id] || 0) === 0; });
      var out = [];
      var q = roots.slice();
      while (q.length) {
        var c = q.shift();
        out.push(c);
        (children[c] || []).forEach(function (ch) {
          indeg[ch] = (indeg[ch] || 1) - 1;
          if ((indeg[ch] || 0) === 0) q.push(ch);
        });
      }
      return out;
    }

    var commits = repo.commits;
    var order = topoOrder(commits);
    var branchList = ['main'].concat(Object.keys(repo.branches).filter(function (b) { return b !== 'main'; }));
    var unique = Array.from(new Set(branchList));
    var reach = unique.map(function (b) {
      var set = new Set();
      var stack = [repo.branches[b]];
      while (stack.length) {
        var c = stack.pop();
        if (!c || set.has(c)) continue;
        set.add(c);
        var cm = commits[c];
        if (cm) stack.push.apply(stack, cm.parents);
      }
      return set;
    });
    var laneOf = {}; var colOf = {};
    order.forEach(function (id, i) {
      var lane = 0;
      for (var li = 0; li < reach.length; li++) if (reach[li].has(id)) lane = li;
      laneOf[id] = lane;
      colOf[id] = i;
    });
    var W = Math.max(order.length * 54 + 40, 320);
    var laneCount = unique.length;
    var H = 46 + laneCount * 46 + 30;
    var laneColors = ['#fbbf24', '#4ade80', '#38bdf8', '#f472b6', '#a3e635'];
    function X(id) { return 30 + (colOf[id] ?? 0) * 54; }
    function Y(id) { return 30 + (laneOf[id] ?? 0) * 46; }

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" class="map-svg" role="img" aria-label="Yard map: commit graph, one track per branch">';
    // lane guides
    unique.forEach(function (b, i) {
      var y = 30 + i * 46;
      svg += '<line x1="0" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="#27272a" stroke-width="2" stroke-dasharray="' + (i === 0 ? '0' : '3 5') + '" />';
      svg += '<text x="4" y="' + (y - 8) + '" font-size="9" fill="' + laneColors[i % laneColors.length] + '" font-family="monospace">' + LAB.esc(b) + (b === 'main' ? ' (mainline)' : '') + '</text>';
    });
    // edges
    order.forEach(function (id) {
      var cm = commits[id];
      if (!cm) return;
      cm.parents.forEach(function (p) {
        if (!commits[p]) return;
        var x1 = X(id), y1 = Y(id), x2 = X(p), y2 = Y(p);
        var d = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + x2) / 2 + ' ' + y1 + ', ' + (x1 + x2) / 2 + ' ' + y2 + ', ' + x2 + ' ' + y2;
        svg += '<path d="' + d + '" fill="none" stroke="#3f3f46" stroke-width="2" />';
      });
    });
    // nodes
    order.forEach(function (id) {
      var c = commits[id];
      if (!c) return;
      var lane = laneOf[id];
      var color = laneColors[lane % laneColors.length];
      var isHead = repo.branches[repo.head] === id;
      var onOrigin = Object.keys(repo.remote).some(function (k) { return repo.remote[k] === id; });
      var tags = Object.keys(repo.tags).filter(function (t) { return repo.tags[t] === id; });
      if (onOrigin) svg += '<circle cx="' + X(id) + '" cy="' + Y(id) + '" r="11" fill="none" stroke="#22c55e" stroke-width="1.2" opacity="0.7" />';
      svg += '<circle cx="' + X(id) + '" cy="' + Y(id) + '" r="' + (c.parents.length === 2 ? 8 : 6.5) + '" fill="#141519" stroke="' + color + '" stroke-width="2.4" />';
      if (c.parents.length === 2) svg += '<circle cx="' + X(id) + '" cy="' + Y(id) + '" r="3" fill="' + color + '" />';
      svg += '<text x="' + X(id) + '" y="' + (Y(id) + 18) + '" text-anchor="middle" font-size="7.5" fill="#a1a1aa" font-family="monospace">' + LAB.esc(id) + '</text>';
      if (isHead) svg += '<text x="' + X(id) + '" y="' + (Y(id) - 14) + '" text-anchor="middle" font-size="9" fill="#fbbf24" font-family="monospace" font-weight="bold">▶HEAD</text>';
      tags.forEach(function (t) {
        svg += '<rect x="' + (X(id) - 20) + '" y="' + (Y(id) + 22) + '" width="40" height="11" rx="2" fill="#fbbf24" />';
        svg += '<text x="' + X(id) + '" y="' + (Y(id) + 30.5) + '" text-anchor="middle" font-size="7.5" fill="#18181b" font-family="monospace" font-weight="bold">' + LAB.esc(t) + '</text>';
      });
    });
    svg += '</svg>';

    return '<div class="map-wrap" role="img" aria-label="Yard map: commit graph, one track per branch">' + svg +
      '<p class="map-caption">Railcars = commits (diamond = merge commit) · green ring = dispatched to origin · amber plates = release tags · ▶HEAD = the locomotive you are driving.</p></div>';
  };

  // ── History panel + operations log ───────────────────────────────────────────
  LAB.historyPanel = function (repo) {
    var tip = repo.branches[repo.head];
    var seen = new Set();
    var stack = [tip];
    var list = [];
    while (stack.length) {
      var c = stack.pop();
      if (!c || seen.has(c)) continue;
      seen.add(c);
      list.push(c);
      var cm = repo.commits[c];
      if (cm) stack.push.apply(stack, cm.parents);
    }
    list.sort(function (a, b) { return (repo.commits[b]?.time ?? '').localeCompare(repo.commits[a]?.time ?? ''); });

    var html = '<section aria-label="Commit history" class="panel panel--flat">' +
      '<h3 class="panel-title">History · ancestry of ' + LAB.esc(repo.head) + '</h3><ol class="history-list">';
    list.forEach(function (id) {
      var c = repo.commits[id];
      if (!c) return;
      var parent = c.parents[0] ? repo.commits[c.parents[0]] : undefined;
      var changed = [];
      if (parent) {
        var all = new Set(Object.keys(parent.tree).concat(Object.keys(c.tree)));
        all.forEach(function (p) {
          if ((parent.tree[p] ?? null) !== (c.tree[p] ?? null)) changed.push(p);
        });
      } else {
        changed = changed.concat(Object.keys(c.tree));
      }
      var tags = Object.keys(repo.tags).filter(function (t) { return repo.tags[t] === id; });
      var onOrigin = Object.keys(repo.remote).some(function (k) { return repo.remote[k] === id; });
      html += '<li class="commit-card">' +
        '<div class="commit-head"><span class="commit-id">' + LAB.esc(id) + '</span>' +
        '<span class="commit-time">' + LAB.esc(c.time) + '</span>' +
        '<span class="commit-author">' + LAB.esc(c.author) + '</span>' +
        (onOrigin ? '<span class="chip chip-origin">origin</span>' : '') +
        (c.parents.length === 2 ? '<span class="chip chip-merge">merge</span>' : '') +
        tags.map(function (t) { return '<span class="chip chip-tag">' + LAB.esc(t) + '</span>'; }).join('') +
        '</div>' +
        '<p class="commit-msg">' + LAB.esc(c.message) + '</p>' +
        (changed.length > 0 ? '<p class="commit-diff">Δ ' + LAB.esc(changed.join(', ')) + '</p>' : '') +
        (c.parents.length === 1
          ? LAB.yardButton({ tone: 'default', cls: 'btn--revert', action: 'revert', arg: id, fid: 'revert-' + id, ariaLabel: 'Revert commit ' + id, label: 'revert this commit (safe undo)' })
          : '') +
        '</li>';
    });
    html += '</ol></section>';

    html += '<section aria-label="Operations log" role="log" aria-live="polite" class="panel panel--flat panel--log">' +
      '<h3 class="panel-title">Yard operations log</h3><ol class="log-list">';
    repo.log.slice(-40).forEach(function (l) {
      html += '<li class="log-line log--' + l.kind + '"><span class="log-t">' + LAB.esc(l.t) + '</span> ' + LAB.esc(l.msg) + '</li>';
    });
    html += '</ol></section>';
    return html;
  };

  // ── Desks ────────────────────────────────────────────────────────────────────
  var IDENTITIES = [
    { id: 'n.okafor', role: 'Squad lead — governs settings, approves merges' },
    { id: 'l.varga', role: 'Cloud engineer — writes deploy code daily' },
    { id: 't.achebe', role: 'Cloud engineer — writes deploy code daily' },
    { id: 'm.renner', role: 'Contractor — OFFBOARDED 12 days ago' },
    { id: 'j.pipeline', role: 'CI bot — builds and deploys via pipeline' }
  ];

  LAB.switchDesk = function (st) {
    var repo = st.repo;
    var ui = LAB.store.ui;
    var branchNames = Object.keys(repo.branches);
    var mergeable = branchNames.filter(function (b) { return b !== repo.head; });

    var branchBody = '<div class="stack-2">' +
      '<div class="row-2">' +
      '<label class="sr-only" for="new-branch">New branch name</label>' +
      '<input id="new-branch" data-input="sd-branch" value="' + LAB.esc(ui.branchName) + '" placeholder="hotfix/nf-142" class="input">' +
      LAB.yardButton({ tone: 'primary', action: 'sd-create-branch', fid: 'create-branch', disabled: !ui.branchName.trim(), label: 'Create + switch' }) +
      '</div>' +
      '<div class="row-2">' +
      LAB.field('Switch HEAD to track', '<select aria-label="Checkout branch" data-change="sd-checkout" class="input">' +
        branchNames.map(function (b) { return '<option value="' + LAB.esc(b) + '"' + (repo.head === b ? ' selected' : '') + '>' + LAB.esc(b) + '</option>'; }).join('') + '</select>') +
      '</div>' +
      '<div class="row-2">' +
      LAB.field('Merge INTO current track (junction)', '<select aria-label="Branch to merge" data-change="sd-merge-sel" class="input">' +
        '<option value="">select source track…</option>' +
        mergeable.map(function (b) { return '<option value="' + LAB.esc(b) + '"' + (ui.mergeSel === b ? ' selected' : '') + '>' + LAB.esc(b) + '</option>'; }).join('') + '</select>') +
      '<div class="self-end">' +
      LAB.yardButton({ tone: 'primary', action: 'sd-merge', fid: 'merge', disabled: !ui.mergeSel, label: LAB.icon('git-merge', 'icn-xs') + ' Merge ' + LAB.esc(ui.mergeSel || '…') }) +
      '</div></div></div>';

    var tagBody = '<div class="row-2">' +
      '<label class="sr-only" for="tag-name">Tag name</label>' +
      '<input id="tag-name" data-input="sd-tag" value="' + LAB.esc(ui.tagName) + '" placeholder="v1.4.0" class="input">' +
      LAB.yardButton({ tone: 'primary', action: 'sd-stamp-tag', fid: 'stamp-tag', disabled: !ui.tagName.trim(), label: 'Stamp tag on HEAD' }) +
      '</div>' +
      '<p class="hint-inline mt-1">Existing tags: ' + LAB.esc(Object.keys(repo.tags).join(', ') || 'none') + '. Tags pin one commit forever — branches move.</p>';

    var dispatchBody = '<div class="row-wrap">' +
      LAB.yardButton({ tone: 'default', action: 'sd-push-head', fid: 'push-head', label: 'Push ' + LAB.esc(repo.head) + ' → origin' }) +
      LAB.yardButton({ tone: 'primary', action: 'sd-open-pr', fid: 'open-pr', ariaLabel: 'Open pull request into main', label: LAB.icon('git-pull-request-arrow', 'icn-xs') + ' Open PR → main' }) +
      '</div>';
    if (repo.prs.length > 0) {
      dispatchBody += '<ul class="pr-list">';
      repo.prs.forEach(function (pr) {
        dispatchBody += '<li class="pr-row"><span class="mono pr-id">#' + pr.id + '</span>' +
          '<span class="mono">' + LAB.esc(pr.head) + ' → ' + LAB.esc(pr.base) + '</span>' +
          '<span>· approvals: <strong class="' + (pr.approvals > 0 ? 'text-ok' : 'text-bad') + '">' + pr.approvals + '</strong></span>' +
          LAB.yardButton({ tone: 'default', cls: 'btn--sm ml-auto', action: 'sd-approve-pr', arg: pr.id, fid: 'approve-' + pr.id, ariaLabel: 'Record approving review on PR ' + pr.id, label: 'Record approving review' }) +
          '</li>';
      });
      dispatchBody += '</ul>';
    }
    if (st.mode === 'hard') {
      dispatchBody += '<div class="danger-zone"><p class="danger-title">' + LAB.icon('ban', 'icn-xs') + ' DANGER ZONE — history rewrite</p>' +
        LAB.yardButton({ tone: 'danger', action: 'sd-force-push', fid: 'force-push', ariaLabel: 'Force-push main (history rewrite)', label: 'Force-push main (rewrite history)' }) +
        '<p class="danger-note">Rewrites the shared mainline for every crew. Real yards log this as an incident.</p></div>';
    }

    var doctrineBody = '<p class="doctrine-intro">Six engineers, shipping to production <strong>daily</strong>. Pick the doctrine that fits, then demonstrate it: lay track <span class="mono doctrine-code">feat/nf-201</span>.</p>' +
      '<div class="stack-2">' +
      LAB.field('Strategy', '<select aria-label="Branching strategy" data-change="form" data-key="h3-strategy" class="input">' +
        '<option value="">choose…</option>' +
        '<option value="trunk"' + (st.forms['h3-strategy'] === 'trunk' ? ' selected' : '') + '>Trunk-based: main + short-lived branches</option>' +
        '<option value="gitflow"' + (st.forms['h3-strategy'] === 'gitflow' ? ' selected' : '') + '>GitFlow: long-lived develop/release branches</option>' +
        '<option value="week"' + (st.forms['h3-strategy'] === 'week' ? ' selected' : '') + '>Feature branches held ~1–2 weeks</option>' +
        '</select>') +
      LAB.field('Integration cadence', '<select aria-label="Merge cadence" data-change="form" data-key="h3-cadence" class="input">' +
        '<option value="">choose…</option>' +
        '<option value="daily"' + (st.forms['h3-cadence'] === 'daily' ? ' selected' : '') + '>Merge to main daily</option>' +
        '<option value="weekly"' + (st.forms['h3-cadence'] === 'weekly' ? ' selected' : '') + '>Merge weekly</option>' +
        '<option value="sprint"' + (st.forms['h3-cadence'] === 'sprint' ? ' selected' : '') + '>Merge at sprint end</option>' +
        '</select>') +
      LAB.field('Branch lifetime', '<select aria-label="Branch lifetime" data-change="form" data-key="h3-lifetime" class="input">' +
        '<option value="">choose…</option>' +
        '<option value="short"' + (st.forms['h3-lifetime'] === 'short' ? ' selected' : '') + '>Under 2 days</option>' +
        '<option value="long"' + (st.forms['h3-lifetime'] === 'long' ? ' selected' : '') + '>1–2 weeks or more</option>' +
        '</select>') +
      LAB.yardButton({ tone: 'primary', action: 'sd-create-feat', fid: 'create-feat', label: 'Demonstrate: create feat/nf-201' }) +
      '</div>';

    return LAB.panel('Branch desk — lay & switch tracks', LAB.icon('git-branch', 'icn-xs'), branchBody) +
      LAB.panel('Tag desk — stamp a release', LAB.icon('tag', 'icn-xs'), tagBody) +
      LAB.panel('Dispatch desk — push, pull request, review', LAB.icon('upload', 'icn-xs'), dispatchBody) +
      LAB.panel("Yardmaster's doctrine — branching strategy", LAB.icon('list-checks', 'icn-xs'), doctrineBody);
  };

  LAB.governanceDesk = function (st) {
    var repo = st.repo;
    var p = repo.protections;
    var body = LAB.panel('Branch protection — lock the mainline', LAB.icon('shield-check', 'icn-xs'),
      '<div class="stack-2">' +
      LAB.toggle({
        checked: p.directPushBlocked, action: 'gd-toggle-protection', arg: 'directPushBlocked', fid: 'prot-push',
        label: 'Block direct pushes to main', hint: 'Main only accepts changes via pull request.'
      }) +
      LAB.toggle({
        checked: p.requireReview, action: 'gd-toggle-protection', arg: 'requireReview', fid: 'prot-review',
        label: 'Require approving review before merge', hint: 'A second pair of eyes gates every change (supply-chain control).'
      }) +
      (p.requireReview
        ? LAB.field('Required approvals', '<select aria-label="Required approvals count" data-change="gd-approvals" class="input">' +
          [1, 2, 3].map(function (n) { return '<option value="' + n + '"' + (p.approvalsRequired === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select>')
        : '') +
      '</div>') +
      LAB.panel('Credentials — how the yard authenticates', LAB.icon('radio-tower', 'icn-xs'),
        LAB.toggle({
          checked: repo.ciBotToken, action: 'gd-toggle-bot', fid: 'bot-token',
          label: repo.ciBotToken ? 'CI bot: scoped deploy token (least privilege)' : 'CI bot: shared admin password (DANGER)',
          hint: 'Automation gets scoped, revocable credentials — never human passwords.'
        }) +
        '<p class="hint-inline mt-2">Human crews use SSH keys / personal access tokens; the shared password lives in a runbook — a standing invitation.</p>') +
      LAB.panel('Access roles — least privilege per identity', LAB.icon('users', 'icn-xs'),
        '<div class="stack-2">' +
        IDENTITIES.map(function (id) {
          return LAB.field(id.id + ' — ' + id.role,
            '<select aria-label="Role for ' + LAB.esc(id.id) + '" data-change="gd-role" data-arg="' + LAB.esc(id.id) + '" class="input">' +
            ['', 'Owner', 'Maintainer', 'Developer', 'Reader', 'Bot', 'Remove'].map(function (r) {
              return '<option value="' + r + '"' + ((repo.roles[id.id] ?? '') === r ? ' selected' : '') + '>' + (r || 'assign role…') + '</option>';
            }).join('') + '</select>');
        }).join('') +
        '</div>');
    return body;
  };

  LAB.detectDesk = function (st) {
    var repo = st.repo;
    var mode = st.mode;
    var ui = LAB.store.ui;
    var findings = repo.scannerRun || [];

    var scannerBody;
    if (mode === 'medium') {
      scannerBody = '<p class="hint-inline mb-2">Preset yard pattern: <span class="mono scan-preset">(key|secret)[a-z_]*\\s*=</span> — broad on purpose. Triage every finding below.</p>';
    } else {
      scannerBody = '<div class="stack-1 mb-2"><p class="hint-inline">Test each candidate pattern against the corpus, then leave the winner as the final pattern.</p>';
      LAB.SCANNER_OPTIONS.forEach(function (o) {
        scannerBody += '<label class="pattern-row">' +
          '<input type="radio" name="scan-pattern" ' + (ui.scanPattern === o.pattern ? 'checked' : '') + ' data-change="dd-pattern" data-arg="' + LAB.esc(o.pattern) + '" aria-label="Pattern ' + LAB.esc(o.label) + '" />' +
          '<span class="mono scan-pat">' + LAB.esc(o.pattern) + '</span>' +
          '<span class="muted-sm">' + LAB.esc(o.label.split('—')[1]) + '</span>' +
          '</label>';
      });
      scannerBody += '</div>';
    }
    scannerBody += LAB.yardButton({ tone: 'primary', action: 'dd-run-scan', fid: 'run-scan', disabled: mode === 'hard' && !ui.scanPattern, label: 'Run secret sweep' });
    if (findings.length > 0) {
      scannerBody += '<ul class="findings-list" aria-label="Scanner findings">';
      findings.forEach(function (f) {
        var v = repo.scannerVerdicts[f.key];
        scannerBody += '<li class="finding-card">' +
          '<p class="mono finding-path">' + LAB.esc(f.path) + '<span class="finding-line">:' + f.line + '</span></p>' +
          '<p class="mono finding-text">' + LAB.esc(f.text) + '</p>';
        if (mode === 'medium') {
          scannerBody += '<div class="row-2 mt-1">' +
            LAB.yardButton({ tone: v === 'TP' ? 'primary' : 'default', cls: 'btn--sm', action: 'dd-verdict', arg: f.key, val: 'TP', fid: 'tp-' + f.key, ariaLabel: 'Mark ' + f.path + ':' + f.line + ' as true positive', label: 'TP — real credential' }) +
            LAB.yardButton({ tone: v === 'FP' ? 'primary' : 'default', cls: 'btn--sm', action: 'dd-verdict', arg: f.key, val: 'FP', fid: 'fp-' + f.key, ariaLabel: 'Mark ' + f.path + ':' + f.line + ' as false positive', label: 'FP — noise' }) +
            '</div>';
        }
        scannerBody += '</li>';
      });
      scannerBody += '</ul>';
    }

    var incidentBody = '<ul class="stack-2">';
    repo.incidents.forEach(function (inc) {
      var kindText = inc.kind === 'live-credential' ? 'Production cloud credential pair.'
        : inc.kind === 'revoked-test-key' ? 'Test credential, already revoked.'
        : 'Template with placeholders only.';
      incidentBody += '<li class="incident-card">' +
        '<p class="incident-label">' + LAB.esc(inc.label) + ' <span class="mono muted-sm">· ' + LAB.esc(inc.filePath) + '</span></p>' +
        '<p class="muted-sm">' + kindText + '</p>' +
        '<div class="row-wrap mt-1">' +
        LAB.yardButton({
          tone: inc.flagged ? 'primary' : 'default', cls: 'btn--sm', action: 'dd-flag', arg: inc.id, fid: 'flag-' + inc.id,
          ariaLabel: inc.flagged ? 'Remove hazmat flag from ' + inc.filePath : 'Flag ' + inc.filePath + ' as hazmat',
          label: inc.flagged ? '✓ flagged hazmat (click to unflag)' : 'Flag as hazmat'
        });
      if (inc.kind === 'live-credential') {
        incidentBody += LAB.yardButton({
          tone: inc.revoked ? 'primary' : 'danger', cls: 'btn--sm', action: 'dd-revoke', fid: 'revoke',
          ariaLabel: 'Revoke the leaked credential', label: inc.revoked ? '✓ old key revoked' : 'Revoke old key'
        }) +
          LAB.yardButton({
            tone: 'primary', cls: 'btn--sm', action: 'dd-replace', fid: 'replace', disabled: !inc.revoked,
            ariaLabel: 'Issue replacement credential', label: inc.replaced ? '✓ replacement issued' : 'Issue replacement'
          });
      }
      incidentBody += '</div></li>';
    });
    incidentBody += '</ul>';

    var hardPanels = '';
    if (mode === 'hard') {
      var auditBody = '<ol class="audit-list" aria-label="Audit log entries">';
      LAB.AUDIT_ENTRIES.forEach(function (e) {
        auditBody += '<li class="audit-row"><span class="mono audit-time">' + LAB.esc(e.time) + '</span> ' +
          '<span class="mono audit-actor">' + LAB.esc(e.actor) + '</span> ' +
          '<span class="audit-action">' + LAB.esc(e.action) + '</span>' +
          '<span class="audit-detail">' + LAB.esc(e.detail) + ' ' + (e.token ? '<span class="mono audit-token">[' + LAB.esc(e.token) + ']</span>' : '') + '</span></li>';
      });
      auditBody += '</ol><div class="stack-2 mt-2">' +
        LAB.field('Which entry is the history-rewriting force-push?', '<select aria-label="Force-push entry" data-change="dd-audit-push" class="input">' +
          '<option value="">select entry…</option>' +
          LAB.AUDIT_ENTRIES.map(function (en) {
            return '<option value="' + LAB.esc(en.id) + '"' + (repo.auditFindings.forcedPush === en.id ? ' selected' : '') + '>' + LAB.esc(en.id) + ' — ' + LAB.esc(en.time) + ' ' + LAB.esc(en.action) + ' (' + LAB.esc(en.actor) + ')</option>';
          }).join('') + '</select>') +
        LAB.field('Which token must be revoked immediately?', '<select aria-label="Token to revoke" data-change="dd-audit-token" class="input">' +
          '<option value="">select token…</option>' +
          ['deploy_token_ci', 'ssh:l.varga', 'pat_renner_7f3', 'ssh:t.achebe', 'ssh:n.okafor'].map(function (t) {
            return '<option value="' + LAB.esc(t) + '"' + (repo.auditFindings.patToRevoke === t ? ' selected' : '') + '>' + LAB.esc(t) + '</option>';
          }).join('') + '</select>') +
        '<div class="row-wrap">' +
        LAB.yardButton({ tone: 'danger', action: 'dd-revoke-token', fid: 'revoke-token', ariaLabel: 'Revoke the selected token', label: 'Revoke token' }) +
        LAB.yardButton({ tone: 'primary', action: 'dd-restore-protection', fid: 'restore-prot', ariaLabel: 'Restore branch protection on main', label: 'Restore branch protection' }) +
        '</div></div>';

      var gateBody = '<p class="hint-inline mb-2">Click stages in the order they must run. Click a stage in the sequence to remove it.</p>' +
        '<div class="row-wrap mb-2">';
      LAB.CI_STAGE_POOL.filter(function (s) { return !repo.ciStages.includes(s); }).forEach(function (s) {
        gateBody += LAB.yardButton({ tone: 'default', cls: 'btn--sm', action: 'dd-add-stage', arg: s, fid: 'add-' + s, ariaLabel: 'Add stage ' + s, label: '+ ' + LAB.esc(s) });
      });
      gateBody += '</div><div class="gate-seq"><p class="gate-label">Pipeline sequence</p>';
      if (repo.ciStages.length === 0) gateBody += '<p class="muted-sm">empty — add stages in order</p>';
      gateBody += '<ol class="gate-list">';
      repo.ciStages.forEach(function (s, i) {
        gateBody += '<li class="gate-row"><span class="mono gate-num">' + (i + 1) + '.</span>' +
          '<span class="' + (s === 'terraform apply' ? 'gate-apply' : '') + '">' + LAB.esc(s) + '</span>' +
          '<button type="button" data-action="dd-remove-stage" data-arg="' + LAB.esc(s) + '" data-fid="rm-' + LAB.esc(s) + '" class="gate-remove" aria-label="Remove stage ' + LAB.esc(s) + '">✕</button></li>';
      });
      gateBody += '</ol></div>';

      var forensicBody = '<div class="stack-2">' +
        LAB.field('Introducing commit', '<select aria-label="Introducing commit" data-change="form" data-key="h1-commit" class="input">' +
          '<option value="">select commit…</option>' +
          Object.keys(repo.commits).map(function (cid) {
            var c = repo.commits[cid];
            return '<option value="' + LAB.esc(c.id) + '"' + (st.forms['h1-commit'] === c.id ? ' selected' : '') + '>' + LAB.esc(c.id) + ' — ' + LAB.esc(c.message.slice(0, 48)) + '</option>';
          }).join('') + '</select>') +
        LAB.field('Author', '<select aria-label="Author" data-change="form" data-key="h1-author" class="input">' +
          '<option value="">select author…</option>' +
          Array.from(new Set(Object.keys(repo.commits).map(function (cid) { return repo.commits[cid].author; }))).map(function (a) {
            return '<option value="' + LAB.esc(a) + '"' + (st.forms['h1-author'] === a ? ' selected' : '') + '>' + LAB.esc(a) + '</option>';
          }).join('') + '</select>') +
        LAB.field('File carrying the live credential', '<select aria-label="Leaked file" data-change="form" data-key="h1-file" class="input">' +
          '<option value="">select file…</option>' +
          Array.from(new Set(Object.keys(repo.commits).flatMap(function (cid) { return Object.keys(repo.commits[cid].tree); }))).sort().map(function (f) {
            return '<option value="' + LAB.esc(f) + '"' + (st.forms['h1-file'] === f ? ' selected' : '') + '>' + LAB.esc(f) + '</option>';
          }).join('') + '</select>') +
        '</div>';

      hardPanels = LAB.panel('Origin audit stream — triage', LAB.icon('radio-tower', 'icn-xs'), auditBody) +
        LAB.panel('Release gate builder — order the CI stages', LAB.icon('workflow', 'icn-xs'), gateBody) +
        LAB.panel('Forensic sweep — name the leak', LAB.icon('scan-search', 'icn-xs'), forensicBody);
    }

    return LAB.panel('Secret scanner bench', LAB.icon('scan-search', 'icn-xs'), scannerBody) +
      LAB.panel('Incident board — hazmat & rotation', LAB.icon('siren', 'icn-xs'), incidentBody, 'alert') +
      hardPanels;
  };

  // ── Yard (3-zone control desk) ───────────────────────────────────────────────
  LAB.yard = function (st) {
    var ui = LAB.store.ui;
    var centerTabs = [
      { id: 'workbench', label: 'WORKBENCH', icon: 'wrench' },
      { id: 'map', label: 'YARD MAP', icon: 'map' },
      { id: 'history', label: 'HISTORY', icon: 'history' }
    ];
    var deskTabs = [
      { id: 'switch', label: 'SWITCH DESK', icon: 'git-branch' },
      { id: 'governance', label: 'GOVERNANCE', icon: 'shield-check' },
      { id: 'detect', label: 'DETECT', icon: 'scan-search' }
    ];

    var html = '<div class="grid-yard">';
    // left: objectives
    html += '<div class="yard-col yard-col--left">' + LAB.dispatchBoard(st) + '</div>';
    // center
    html += '<div class="yard-col yard-col--center">';
    html += '<div role="tablist" aria-label="Yard center views" class="row-wrap">';
    centerTabs.forEach(function (t) {
      html += '<button type="button" role="tab" aria-selected="' + (ui.center === t.id) + '" data-action="center-tab" data-arg="' + t.id + '" data-fid="ctab-' + t.id + '" class="tab-btn' + (ui.center === t.id ? ' tab-btn--active' : '') + '">' + LAB.icon(t.icon, 'icn-xs') + t.label + '</button>';
    });
    html += '</div>';
    if (ui.center === 'workbench') html += LAB.workbench(st);
    else if (ui.center === 'map') html += LAB.yardMap(st.repo);
    else html += LAB.historyPanel(st.repo);
    html += '</div>';
    // right: desks
    html += '<div class="yard-col yard-col--right">';
    html += '<div role="tablist" aria-label="Yard desks" class="row-wrap">';
    deskTabs.forEach(function (t) {
      html += '<button type="button" role="tab" aria-selected="' + (ui.desk === t.id) + '" data-action="desk-tab" data-arg="' + t.id + '" data-fid="dtab-' + t.id + '" class="tab-btn' + (ui.desk === t.id ? ' tab-btn--active' : '') + '">' + LAB.icon(t.icon, 'icn-xs') + t.label + '</button>';
    });
    html += '</div><div class="yard-desks">';
    if (ui.desk === 'switch') html += LAB.switchDesk(st);
    else if (ui.desk === 'governance') html += LAB.governanceDesk(st);
    else html += LAB.detectDesk(st);
    html += '</div></div>';
    html += '</div>';
    return html;
  };

  // ── Master render ────────────────────────────────────────────────────────────
  // Re-renders the active tab content; the header is built once and updated
  // in place (keeps aria-live regions stable). Focus is restored via data-fid.
  LAB.views = LAB.views || {};
  LAB.views.yard = function (st) { return LAB.yard(st); };
  LAB.render = function () {
    var st = LAB.store.st;
    var tab = LAB.store.tab;
    var shell = document.getElementById('shell');
    var modeSelect = document.getElementById('mode-select-screen');
    var content = document.getElementById('tab-content');

    // remember focus
    var active = document.activeElement;
    var fid = active && active.getAttribute ? active.getAttribute('data-fid') : null;

    if (!st) {
      shell.hidden = true;
      modeSelect.hidden = false;
      modeSelect.innerHTML = LAB.modeSelect();
      content.innerHTML = '';
      return;
    }
    shell.hidden = false;
    modeSelect.hidden = true;
    LAB.updateHeader();
    var view = LAB.views[tab] || LAB.views.briefing;
    content.innerHTML = view(st);

    // restore focus if the element still exists
    if (fid) {
      var el = document.querySelector('[data-fid="' + fid.replace(/"/g, '') + '"]');
      if (el) { try { el.focus({ preventScroll: true }); } catch (e) { /* older engines */ } }
    }
  };

  // header (built once in index.html; refreshed here)
  LAB.updateHeader = function () {
    var st = LAB.store.st;
    if (!st) return;
    var mode = st.mode;
    var head = LAB.headCommit(st.repo);
    var score = LAB.scoreOf(st);
    var allDone = score.objDone === score.objTotal;

    var badge = document.getElementById('mode-badge');
    badge.textContent = mode === 'hard' ? 'DISPATCHER · HARD' : 'YARDMASTER · MEDIUM';
    badge.className = 'mode-badge ' + (mode === 'hard' ? 'mode-badge--hard' : 'mode-badge--medium');

    document.getElementById('head-stat').innerHTML = 'HEAD <span class="text-strong">' + LAB.esc(st.repo.head) + '@' + LAB.esc(head.id) + '</span> · siding ' + Object.keys(st.repo.staged).length + ' · main ' + (st.repo.protections.directPushBlocked ? '<span class="text-ok">🔒</span>' : '<span class="text-bad">unprotected</span>');
    document.getElementById('score-stat').textContent = 'objectives ' + score.objDone + '/' + score.objTotal + ' · exam ' + score.quizCorrect + '/' + score.quizTotal;
    document.getElementById('clearance-btn').hidden = !allDone;
    document.getElementById('dispatcher-note').hidden = !(mode === 'hard' && !allDone);

    // tabs
    var tab = LAB.store.tab;
    LAB.TABS.forEach(function (t) {
      var b = document.getElementById('tabbtn-' + t.id);
      if (!b) return;
      var on = tab === t.id;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.className = 'signage-tab' + (on ? ' signage-tab--active' : '');
    });
  };
})(window.LAB = window.LAB || {});
