// ── Fault Isolation Line — UI primitives (js/ui.js) ──
// Rendering helpers + shared chrome, ported 1:1 from the original
// (src/components/lab/chrome.tsx + the primitives used across stations).
// Builders return HTML strings; interactions use data-act JSON templates
// handled by ONE delegated listener in app.js (event delegation, so handlers
// survive re-renders).

// ── escaping ──
function esc(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// data-act: JSON action template; ':id'/':value'/':dir' are substituted at click time.
function actAttr(template, subs) {
  let t = template;
  for (const k in subs || {}) t = t.split(':' + k).join(subs[k]);
  return esc(t);
}

// ── Pillar badge ──
function PillarBadge(pillar) {
  const tones = {
    P1: 'tone-p1',
    P2: 'tone-p2',
    P3: 'tone-p3',
    P4: 'tone-p4',
  };
  return '<span class="pillar-badge ' + tones[pillar] + '">' + esc(pillar) + ' \u00b7 ' + esc(PILLAR_LABEL[pillar]) + '</span>';
}

// ── Hazard stripe accent ──
function HazardBar(className) {
  return '<div aria-hidden="true" class="hazard hazard-bar ' + (className || '') + '"></div>';
}

// ── Station rail — the conveyor line ──
function StationRail(stops) {
  const doneCount = stops.filter(function (s) { return s.done; }).length;
  let html = '<div class="rail-wrap">';
  html += '<div role="group" aria-label="Fault isolation line stops" class="rail">';
  stops.forEach(function (s) {
    const cls = ['rail-stop'];
    if (s.locked) cls.push('is-locked');
    if (s.active) cls.push('is-active');
    html += '<button type="button" class="' + cls.join(' ') + '" data-nav="' + s.idx + '"' + (s.locked ? ' disabled' : '') +
      (s.active ? ' aria-current="step"' : '') +
      ' aria-label="Stop ' + s.num + ' ' + esc(s.name) + (s.locked ? ' (locked)' : s.done ? ' (completed)' : '') + '"' +
      ' data-fk="rail-' + s.idx + '">' +
      '<span class="rail-num ' + (s.done ? 'rail-num-done' : s.active ? 'rail-num-active' : 'rail-num-idle') + '">' +
      (s.done ? '\u2713' : s.locked ? '\uD83D\uDD12' : s.num) + '</span>' +
      '<span class="rail-label"><span class="rail-eyebrow">Stop ' + s.num + '</span>' +
      '<span class="rail-name' + (s.active ? ' rail-name-active' : '') + '">' + esc(s.name) + '</span></span>' +
      (s.active ? '<span aria-hidden="true" class="hazard rail-active-bar"></span>' : '') +
      '</button>';
  });
  html += '</div>';
  html += '<div aria-hidden="true" class="rail-progress"><div class="hazard rail-fill" style="width:' + ((doneCount / stops.length) * 100) + '%"></div></div>';
  html += '</div>';
  return html;
}

// ── Chip toggle (multi-select) ──
function ChipGroup(options, selected, actTemplate, disabled) {
  let html = '<div class="chip-row">';
  options.forEach(function (o) {
    const on = selected.indexOf(o.id) !== -1;
    html += '<button type="button" aria-pressed="' + on + '"' + (disabled ? ' disabled' : '') +
      ' data-act="' + actAttr(actTemplate, { id: o.id }) + '" data-fk="chip-' + o.id + '"' +
      ' class="chip' + (on ? ' is-on' : '') + '">' +
      '<span aria-hidden="true" class="chip-mark">' + (on ? '[\u00d7]' : '[ ]') + '</span>' + esc(o.text) +
      '</button>';
  });
  html += '</div>';
  return html;
}

// ── Segmented radio row ──
function RadioRow(name, options, value, actTemplate, columns) {
  let html = '<div role="radiogroup" aria-label="' + esc(name) + '" class="' + (columns ? 'radio-grid' : 'radio-row') + '">';
  options.forEach(function (o) {
    const on = value === o.id;
    html += '<button type="button" role="radio" aria-checked="' + on + '"' +
      ' data-act="' + actAttr(actTemplate, { id: o.id }) + '" data-fk="radio-' + name + '-' + o.id + '"' +
      ' class="radio' + (on ? ' is-on' : '') + '">' +
      '<span aria-hidden="true" class="radio-mark">' + (on ? '(\u25cf)' : '( )') + '</span>' + esc(o.text) +
      '</button>';
  });
  html += '</div>';
  return html;
}

// ── Accessible ordered list (move up / move down) ──
function OrderList(items, actTemplate, label, fkPrefix) {
  let html = '<ol aria-label="' + esc(label) + '" class="order-list">';
  items.forEach(function (it, idx) {
    html += '<li class="order-item">' +
      '<span class="order-num">' + (idx + 1) + '</span>' +
      '<span class="order-text">' + esc(it.text) + '</span>' +
      '<span class="order-btns">' +
      '<button type="button" aria-label="Move up: ' + esc(it.text) + '"' + (idx === 0 ? ' disabled' : '') +
      ' data-act="' + actAttr(actTemplate, { id: it.id, dir: '-1' }) + '" data-fk="' + fkPrefix + '-up-' + it.id + '" class="arrow-btn">&uarr;</button>' +
      '<button type="button" aria-label="Move down: ' + esc(it.text) + '"' + (idx === items.length - 1 ? ' disabled' : '') +
      ' data-act="' + actAttr(actTemplate, { id: it.id, dir: '1' }) + '" data-fk="' + fkPrefix + '-down-' + it.id + '" class="arrow-btn">&darr;</button>' +
      '</span></li>';
  });
  html += '</ol>';
  return html;
}

// ── Terminal log ──
function Terminal(lines, title) {
  let body;
  if (!lines.length) {
    body = '<p class="terminal-idle">awaiting operator input\u2026</p>';
  } else {
    body = lines.map(function (l) { return '<p class="terminal-line">' + esc(l) + '</p>'; }).join('');
  }
  return '<div class="terminal">' +
    '<div class="terminal-head"><span class="terminal-title">' + esc(title || 'console') + '</span>' +
    '<span class="terminal-dots" aria-hidden="true"><i class="dot dot-red"></i><i class="dot dot-amber"></i><i class="dot dot-green"></i></span></div>' +
    '<div class="terminal-log" aria-live="polite" aria-atomic="false">' + body + '</div>' +
    '</div>';
}

// ── Task card — the CHECK RESULTS unit ──
function TaskCard(objDef, attempt, result, mode, objId, bodyHtml) {
  // Audit QA-10 fix: hard mode actually offers its ONE costed hint.
  const hintCap = mode === 'hard' ? 1 : objDef.hints.length;
  const showHints = !attempt.done && attempt.hints < hintCap;
  const visibleHints = objDef.hints.slice(0, Math.min(attempt.hints, hintCap));

  let html = '<section aria-label="Objective ' + esc(objDef.id) + ': ' + esc(objDef.title) + '" class="task-card">';
  html += '<header class="task-head">' +
    '<span class="task-id">' + esc(objDef.id) + '</span>' +
    PillarBadge(objDef.pillar) +
    '<h3 class="task-title">' + esc(objDef.title) + '</h3>' +
    (attempt.done
      ? '<span class="badge badge-pass">Passed</span>'
      : '<span class="badge badge-open">Open</span>') +
    '</header>';
  html += '<div class="task-body">';
  if (mode === 'medium' && objDef.look) {
    html += '<p class="task-look"><span aria-hidden="true">\ud83d\udccd</span><span><strong>Where to look:</strong> ' + esc(objDef.look) + '</span></p>';
  }
  html += bodyHtml;
  html += '</div>';
  html += '<footer class="task-foot">';
  html += '<div class="task-actions">';
  html += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'RUN_CHECK', id: objId })) + '" data-fk="check-' + objId + '"' +
    ' aria-label="Check results for ' + esc(objDef.id) + '"' +
    ' class="btn ' + (attempt.done ? 'btn-green' : 'btn-orange btn-lift') + '">' +
    (attempt.done ? '\u2713 Results verified' : 'Check results') +
    '</button>';
  if (showHints) {
    html += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'OPEN_HINT', id: objId })) + '" data-fk="hint-' + objId + '"' +
      (attempt.hints >= hintCap ? ' disabled' : '') +
      ' aria-label="Reveal hint ' + (attempt.hints + 1) + ' of ' + hintCap + ' for ' + esc(objDef.id) + ' (costs star rating)"' +
      ' class="btn btn-amber">Hint ' + attempt.hints + '/' + hintCap + '</button>';
  }
  if (attempt.attempts > 0 && !attempt.done) {
    html += '<span class="task-attempts">attempts: ' + attempt.attempts + '</span>';
  }
  html += '</div>';
  if (visibleHints.length > 0) {
    html += '<div class="hint-box">';
    visibleHints.forEach(function (h, i) {
      html += '<p class="hint-line"><strong class="hint-k">HINT ' + (i + 1) + ':</strong> ' + esc(h) + '</p>';
    });
    html += '</div>';
  }
  if (result) {
    html += '<p role="status" aria-live="polite" class="feedback ' + (result.pass ? 'feedback-pass' : 'feedback-fail') + '">' +
      '<strong class="feedback-k">' + (result.pass ? '\u2713 Correct' : '\u2717 Not yet') + '</strong><br>' + esc(result.feedback) +
      '</p>';
  }
  html += '</footer></section>';
  return html;
}

// ── Slide-over drawer shell (content rendered by app.js) ──
function DrawerShell(open, title, side, bodyHtml) {
  if (!open) return '';
  return '<div class="drawer-root" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
    '<div class="drawer-overlay" data-close-drawer aria-hidden="true"></div>' +
    '<div class="drawer ' + (side === 'left' ? 'drawer-left' : 'drawer-right') + '">' +
    '<header class="drawer-head"><h2 class="drawer-title">' + esc(title) + '</h2>' +
    '<button type="button" data-close-drawer aria-label="Close panel" data-fk="drawer-close" class="drawer-close">\u2715</button>' +
    '</header>' +
    '<div class="drawer-body">' + bodyHtml + '</div>' +
    '</div></div>';
}

// ── Station header ──
function StationHeader(num, name, tagline, stepOf) {
  return '<div class="station-head">' +
    '<div class="station-num">' + esc(num) + '<span aria-hidden="true" class="hazard station-num-bar"></span></div>' +
    '<div class="station-title-wrap">' +
    (stepOf ? '<p class="station-eyebrow">' + esc(stepOf) + '</p>' : '') +
    '<h2 class="station-name">' + esc(name) + '</h2>' +
    '<p class="station-tagline">' + esc(tagline) + '</p>' +
    '</div></div>';
}

// ── Panel (workbench tool) ──
function Panel(title, bodyHtml, tone) {
  const toneCls = tone === 'alert' ? ' panel-alert' : tone === 'good' ? ' panel-good' : '';
  return '<div class="panel' + toneCls + '">' +
    '<p class="panel-title">' + esc(title) + '</p>' +
    '<div class="panel-body">' + bodyHtml + '</div>' +
    '</div>';
}
