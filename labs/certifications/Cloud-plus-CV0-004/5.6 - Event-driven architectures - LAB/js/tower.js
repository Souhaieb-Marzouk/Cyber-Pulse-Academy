// ─── Control Tower workspace: board, launch pad, console, rail, completion ───
// Ported from Board.tsx / Console.tsx / ObjectivesRail.tsx / Completion.tsx /
// Workspace.tsx / ui-bits.tsx of the original framework lab.
'use strict';

/* ══════════ Board geometry (Board.tsx useBoardGeometry) ══════════ */
const CARD_W = 168, CARD_H = 54, PITCH = 70, Y0 = 16;
const X_PROD = 8, X_BRO = 256, X_CONS = 504;
const BOARD_W = 680;
const BOARD_ICON_MAP = {
  cart: 'ShoppingCart', imageup: 'UploadCloud', radar: 'Radar', clock: 'Clock', queue: 'Inbox',
  topic: 'Radio', stream: 'Waves', card: 'CreditCard', boxes: 'Boxes', image: 'Image',
  tags: 'Tags', bell: 'Bell', gauge: 'Gauge', brain: 'BrainCircuit', chart: 'FileBarChart', db: 'Database',
};

function boardGeometry(state) {
  const producers = NODES.filter((n) => n.kind === 'producer');
  const brokers = NODES.filter((n) => n.kind === 'broker' && (!n.hidden || ((state.env.wiring[n.id] ?? []).length > 0)));
  const consumers = NODES.filter((n) => n.kind === 'consumer');
  const pos = new Map();
  producers.forEach((n, i) => pos.set(n.id, { x: X_PROD, y: Y0 + i * PITCH, node: n }));
  brokers.forEach((n, i) => pos.set(n.id, { x: X_BRO, y: Y0 + i * PITCH, node: n }));
  consumers.forEach((n, i) => pos.set(n.id, { x: X_CONS, y: Y0 + i * PITCH, node: n }));
  const height = Y0 + Math.max(consumers.length, brokers.length, producers.length) * PITCH;
  return { pos, height, producers, brokers, consumers };
}

function svgLine(x1, y1, x2, y2, stroke, opts = {}) {
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('x1', x1); l.setAttribute('y1', y1);
  l.setAttribute('x2', x2); l.setAttribute('y2', y2);
  l.setAttribute('stroke', stroke);
  l.setAttribute('stroke-width', opts.width || 1.6);
  l.setAttribute('opacity', opts.opacity ?? 0.55);
  if (opts.dash) l.setAttribute('stroke-dasharray', opts.dash);
  return l;
}

/* ══════════ Board ══════════ */
function renderBoardCenter(center, state) {
  const geo = boardGeometry(state);

  // legend (icon carries the channel color; text stays muted — same as original)
  const legendItem = (color, text, danger) => {
    const item = h('span', { class: 'legend-item' + (danger ? ' legend-danger' : '') });
    const dot = icon('CircleDot', 'ic-12');
    if (color) dot.style.color = color;
    item.append(dot, document.createTextNode(' ' + text));
    return item;
  };
  const legend = h('div', { class: 'board-legend' },
    legendItem(TYPE_COLOR.queue, 'queue (1-to-1)'),
    legendItem(TYPE_COLOR.topic, 'pub/sub topic (fan-out)'),
    legendItem(TYPE_COLOR.stream, 'stream (partitioned)'),
    legendItem(null, 'direct REST (anti-pattern)', true));
  center.append(legend);

  // ── desktop board ──
  const desktop = h('div', { class: 'board-desktop' });
  const inner = h('div', { class: 'board-inner', style: `width:${BOARD_W}px;height:${geo.height}px` });

  const edgesSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  edgesSvg.setAttribute('width', BOARD_W); edgesSvg.setAttribute('height', geo.height);
  edgesSvg.setAttribute('role', 'img');
  edgesSvg.setAttribute('aria-label', 'Event routing board: producers on the left, channels in the middle, consumers on the right');
  edgesSvg.classList.add('board-edges');
  for (const [from, targets] of Object.entries(state.env.wiring)) {
    const f = geo.pos.get(from);
    if (!f) continue;
    for (const t of targets) {
      const to = geo.pos.get(t);
      if (!to) continue;
      const bt = to.node.brokerType;
      const color = bt ? TYPE_COLOR[bt] : '#e4e4e7';
      edgesSvg.append(svgLine(f.x + CARD_W, f.y + CARD_H / 2, to.x, to.y + CARD_H / 2, color));
    }
  }
  if (state.env.directRest) {
    const a = geo.pos.get('checkout-api'), b = geo.pos.get('inventory-service');
    if (a && b) edgesSvg.append(svgLine(a.x + CARD_W, a.y + CARD_H / 2, b.x, b.y + CARD_H / 2, '#fb7185', { width: 1.8, dash: '6 4', opacity: 0.8 }));
  }
  inner.append(edgesSvg);

  const pulseSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  pulseSvg.setAttribute('width', BOARD_W); pulseSvg.setAttribute('height', geo.height);
  pulseSvg.id = 'pulse-svg';
  pulseSvg.classList.add('board-edges');
  inner.append(pulseSvg);

  for (const n of NODES) {
    const p = geo.pos.get(n.id);
    if (!p) continue;
    inner.append(boardNodeButton(n, p, state, geo));
  }
  desktop.append(inner);

  // ── mobile flow list ──
  const mobile = h('div', { class: 'board-mobile', 'aria-label': 'Event flows (mobile view)' });
  for (const b of geo.brokers) {
    const ins = Object.entries(state.env.wiring).filter(([, ts]) => ts.includes(b.id)).map(([f]) => nodeById(f));
    const outs = (state.env.wiring[b.id] ?? []).map(nodeById);
    mobile.append(h('div', { class: 'card bg-90 border-zinc-800' },
      h('div', { class: 'card-pad board-mobile-card' },
        h('button', {
          type: 'button', class: 'board-mobile-head', 'data-fk': 'mnode:' + b.id,
          'aria-label': `Open ${b.label} inspector`,
          onclick: () => selectNode(b.id),
        },
          icon(BOARD_ICON_MAP[b.icon] || 'CircleDot', 'ic-16 ' + KIND_COLOR[b.kind]),
          h('span', { class: 'board-mobile-title' }, b.label),
          h('span', { class: 'badge badge-outline board-mobile-type' }, TYPE_LABEL[b.brokerType ?? 'queue'])),
        h('p', { class: 'board-mobile-refs' },
          `← ${ins.map((n) => n.label).join(', ') || '—'} · → ${outs.map((n) => n.label).join(', ') || '—'}`))));
  }
  mobile.append(h('div', { class: 'card board-mobile-antipattern' },
    h('div', { class: 'card-pad' },
      h('p', { class: 'board-mobile-antipattern-text' },
        state.env.directRest
          ? 'ACTIVE anti-pattern: Checkout API → Inventory Service via direct REST (synchronous coupling).'
          : 'Decoupled: Checkout API → inventory-jobs → Inventory Service (event-driven).'))));
  const grid = h('div', { class: 'board-mobile-grid' });
  for (const n of NODES) {
    if (!(n.kind !== 'broker' || n.hidden)) continue;
    const hiddenAway = n.hidden && !((state.env.wiring[n.id] ?? []).length);
    if (hiddenAway) continue;
    grid.append(h('button', {
      type: 'button', class: 'board-mobile-node' + (ui.selectedNode === n.id ? ' selected' : ''),
      'data-fk': 'mnode:' + n.id,
      'aria-label': `Open ${n.label} inspector`,
      onclick: () => selectNode(n.id),
    },
      icon(BOARD_ICON_MAP[n.icon] || 'CircleDot', 'ic-16 shrink ' + KIND_COLOR[n.kind]),
      h('span', { class: 'board-mobile-node-label' }, n.label)));
  }
  mobile.append(grid);

  center.append(desktop, mobile);
}

function boardNodeButton(n, p, state, geo) {
  const selected = ui.selectedNode === n.id;
  const isFlagged = state.mode === 'medium' && FLAG_NODES.includes(n.id);
  const needsTag = isFlagged && !state.env.roles[n.id];
  const subtitle = (n.brokerType ? TYPE_LABEL[n.brokerType] : (n.kind === 'producer' ? 'producer' : 'consumer'))
    + (n.id === 'payment-service' && !state.env.poisonRouted ? ' · FAILING' : '')
    + (n.id === 'inventory-service' && state.env.directRest ? ' · sync REST' : '');
  const btn = h('button', {
    type: 'button',
    'data-fk': 'bnode:' + n.id,
    'aria-label': `${n.label} — ${TYPE_LABEL[n.brokerType ?? ''] ?? n.kind}. ${needsTag ? 'Untagged — needs classification.' : ''} Open inspector.`,
    class: 'board-node'
      + (selected ? ' selected' : '')
      + (needsTag ? ' needs-tag' : '')
      + (n.kind === 'broker' ? ' is-broker' : ''),
    style: `left:${p.x}px;top:${p.y}px;width:${CARD_W}px;height:${CARD_H}px`,
    onclick: () => selectNode(n.id),
  },
    icon(BOARD_ICON_MAP[n.icon] || 'CircleDot', 'ic-20 shrink ' + KIND_COLOR[n.kind]),
    h('span', { class: 'board-node-text' },
      h('span', { class: 'board-node-label' }, n.label),
      h('span', { class: 'board-node-sub' }, subtitle)));
  if (n.id === 'inventory-service' && state.env.directRest) btn.append(icon('AlertTriangle', 'ic-16 node-flag'));
  if (n.id === 'payment-service' && !state.env.poisonRouted) btn.append(icon('Bug', 'ic-16 node-flag'));
  if (state.env.idempotency[n.id]) btn.append(icon('Zap', 'ic-14 node-flag node-flag-ok'));
  return btn;
}

/* ══════════ Launch Pad ══════════ */
function renderLaunchPad(center, state, dispatch) {
  const sources = NODES.filter((n) => n.kind === 'producer');
  const src = ui.launchSrc;
  const ev = INJECT_EVENTS[src];
  const chips = h('div', { class: 'chip-row launch-chips', role: 'group', 'aria-label': 'Choose event source' });
  for (const s of sources) {
    chips.append(h('button', {
      type: 'button',
      'aria-pressed': String(src === s.id),
      'data-fk': 'launch:' + s.id,
      class: 'btn btn-chip btn-chip-sm' + (src === s.id ? ' chip-on' : ''),
      onclick: () => { ui.launchSrc = s.id; uiChanged(); },
    }, s.label));
  }
  center.append(h('div', { class: 'card bg-80 border-zinc-800 launchpad', 'aria-label': 'Event launch pad' },
    h('div', { class: 'card-pad launchpad-inner' },
      h('div', { class: 'launchpad-label' }, icon('Rocket', 'ic-16'), ' LAUNCH PAD'),
      chips,
      h('div', { class: 'launchpad-right' },
        h('code', { class: 'launchpad-code' }, `${ev?.type ?? ''} ${ev?.payload ?? ''}`),
        h('button', {
          class: 'btn btn-primary min-h-11 font-mono',
          'aria-label': `Inject ${ev?.type ?? 'event'} event from ${nodeById(src)?.label ?? ''}`,
          onclick: () => dispatch({ type: 'INJECT', source: src }),
        }, 'Inject event')),
      h('p', { class: 'sr-only', 'aria-live': 'polite' },
        state.pulse ? `Event routed through ${state.pulse.path.length} hops.` : ''))));
}

/* ══════════ Console (Inspector / Telemetry / Logs / Evidence) ══════════ */
const CONSOLE_TABS = [
  { id: 'inspector', label: 'Inspector', icon: 'Wrench' },
  { id: 'telemetry', label: 'Telemetry', icon: 'Activity' },
  { id: 'logs', label: 'Logs', icon: 'ScrollText' },
  { id: 'evidence', label: 'Evidence', icon: 'FolderOpen' },
];

function renderConsole(slot, state, dispatch) {
  slot.classList.add('console');
  const tablist = h('div', { role: 'tablist', class: 'console-tablist', 'aria-label': 'Telemetry console sections' });
  for (const t of CONSOLE_TABS) {
    const b = h('button', {
      type: 'button',
      role: 'tab',
      id: 'tab-' + t.id,
      'aria-selected': String(ui.tab === t.id),
      'aria-controls': 'panel-' + t.id,
      tabindex: ui.tab === t.id ? '0' : '-1',
      'data-fk': 'ctab:' + t.id,
      class: 'console-tab' + (ui.tab === t.id ? ' active' : ''),
      onclick: () => { ui.tab = t.id; uiChanged(); },
      onkeydown: (e) => consoleTabKeys(e),
    }, icon(t.icon, 'ic-14'), t.label);
    tablist.append(b);
  }
  const panel = h('div', { role: 'tabpanel', id: 'panel-' + ui.tab, 'aria-labelledby': 'tab-' + ui.tab, class: 'console-panel' });
  if (ui.tab === 'inspector') panel.append(inspectorPanel(state, dispatch));
  else if (ui.tab === 'telemetry') panel.append(telemetryPanel(state, dispatch));
  else if (ui.tab === 'logs') panel.append(logsPanel(state));
  else panel.append(evidencePanel(state, dispatch));
  slot.append(tablist, panel);
  // restore the log viewport scroll AFTER insertion (layout needed)
  if (ui.tab === 'logs' && LOGS_SCROLL) {
    const vp = slot.querySelector('.logs-viewport');
    if (vp) vp.scrollTop = LOGS_SCROLL;
  }
}

function consoleTabKeys(e) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  e.preventDefault();
  const ids = CONSOLE_TABS.map((t) => t.id);
  const i = ids.indexOf(ui.tab);
  const next = ids[(i + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
  ui.tab = next;
  uiChanged();
  const tab = document.getElementById('tab-' + next);
  if (tab) tab.focus();
}

/* ── Inspector ── */
function inspectorPanel(state, dispatch) {
  const node = ui.selectedNode ? NODES.find((n) => n.id === ui.selectedNode) : null;
  const wrap = h('div', { class: 'p-4' });
  if (!node) {
    wrap.append(h('p', { class: 'console-empty' }, 'Click any node on the board (or a “where to look” link) to inspect its configuration.'));
    return wrap;
  }
  wrap.append(
    h('header', { class: 'insp-header' },
      h('div', { class: 'min-w-0' },
        h('h3', { class: 'insp-title' }, node.label),
        h('p', { class: 'insp-kind' }, node.brokerType ? `${node.brokerType} channel` : node.kind)),
      h('span', { class: 'badge badge-outline insp-id' }, node.id)),
    h('p', { class: 'insp-desc' }, node.desc));

  // classification (M1, medium only)
  if (state.mode === 'medium' && FLAG_NODES.includes(node.id)) {
    const chips = h('div', { class: 'chip-row', role: 'group', 'aria-label': `Classify ${node.label}` });
    for (const r of ['producer', 'broker', 'consumer']) {
      const on = state.env.roles[node.id] === r;
      chips.append(h('button', {
        type: 'button', 'aria-pressed': String(on), 'data-fk': 'classify:' + node.id + ':' + r,
        class: 'btn btn-chip btn-chip-sm' + (on ? ' chip-on' : ''),
        onclick: () => dispatch({ type: 'CLASSIFY', node: node.id, role: r }),
      }, r));
    }
    const box = h('div', { class: 'panel-teal' },
      h('p', { class: 'panel-teal-title' }, 'CLASSIFY THIS NODE (objective OBJ-M1)'),
      chips);
    if (state.env.roles[node.id]) box.append(h('p', { class: 'tagged-as' }, `tagged as: ${state.env.roles[node.id]}`));
    wrap.append(box);
  }

  // producer controls
  if (node.kind === 'producer') {
    wrap.append(
      h('div', { class: 'row-dark' },
        h('div', null,
          h('label', { class: 'row-label', for: `schema-${node.id}` }, icon('ShieldCheck', 'ic-14 teal'), ' Payload schema validation'),
          h('p', { class: 'row-sub' }, 'Reject malformed/forged events at the edge.')),
        switchEl({
          id: `schema-${node.id}`,
          checked: !!state.env.schemaValidation[node.id],
          onChange: (v) => dispatch({ type: 'SET_SCHEMA', producer: node.id, on: v }),
        })),
      h('button', {
        class: 'btn btn-outline min-h-11 font-mono text-xs insp-inject',
        'data-fk': 'inject:' + node.id,
        onclick: () => dispatch({ type: 'INJECT', source: node.id }),
      }, `Inject ${INJECT_EVENTS[node.id]?.type ?? 'event'}`));
  }

  // rewrite integration (M9)
  if (node.id === 'checkout-api' && state.env.directRest) wrap.append(rewritePanel(dispatch));
  if (node.id === 'checkout-api' && !state.env.directRest) {
    wrap.append(h('p', { class: 'insp-decoupled' }, '✓ integration is event-driven (inventory-jobs queue)'));
  }

  // broker controls
  if (node.kind === 'broker' && node.brokerType === 'queue') {
    wrap.append(h('div', { class: 'row-dark' },
      h('div', null,
        h('label', { class: 'row-label', for: `dlq-${node.id}` }, icon('FileWarning', 'ic-14 amber'), ' Dead-letter queue'),
        h('p', { class: 'row-sub' }, 'Divert messages that exhaust their retry cap.')),
      switchEl({
        id: `dlq-${node.id}`,
        checked: !!state.env.dlqEnabled[node.id],
        onChange: (v) => dispatch({ type: 'TOGGLE_DLQ', broker: node.id, on: v }),
      })));
  }
  if (node.kind === 'broker') {
    wrap.append(h('div', { class: 'subscribers-line' },
      `subscribers: ${(state.env.wiring[node.id] ?? []).map((c) => (nodeById(c)?.label ?? c)).join(', ') || 'none yet'}`));
  }

  // consumer controls
  if (node.kind === 'consumer') {
    wrap.append(
      h('div', { class: 'row-dark' },
        h('div', null,
          h('p', { class: 'row-label-plain' }, 'Trigger'),
          h('p', { class: 'row-sub mono' },
            (state.env.triggers[node.id]?.replace('trigger-', '') ?? 'none')
            + (node.id === 'inventory-service' && state.env.directRest ? ' (synchronous REST — rewrite at checkout-api)' : '')))),
      h('div', { class: 'row-dark' },
        h('div', null,
          h('label', { class: 'row-label', for: `idem-${node.id}` }, icon('Lock', 'ic-14 emerald'), ' Idempotency'),
          h('p', { class: 'row-sub' }, 'Suppress re-processing of duplicate event IDs.')),
        switchEl({
          id: `idem-${node.id}`,
          checked: !!state.env.idempotency[node.id],
          onChange: (v) => dispatch({ type: 'TOGGLE_IDEM', consumer: node.id, on: v }),
        })));
    if (node.id === 'notifier') wrap.append(iamPanel(state, dispatch, 'notifier', PERM_NOTIFIER));
    if (node.id === 'thumbnail-service') wrap.append(iamPanel(state, dispatch, 'thumbnail-service', PERM_THUMB));
  }
  return wrap;
}

function rewritePanel(dispatch) {
  const box = h('div', { class: 'panel-rose' });
  box.append(h('p', { class: 'panel-rose-title' }, icon('AlertTriangle', 'ic-14'), ' REWRITE INTEGRATION — Checkout API → Inventory Service (currently direct REST)'));
  box.append(h('p', { class: 'panel-rose-sub' }, 'Pick the channel this integration should use instead of synchronous REST.'));
  const chips = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Rewrite target channel' });
  for (const o of [
    { id: 'inventory-jobs', label: 'inventory-jobs (queue)' },
    { id: 'media-topic', label: 'media-events (topic)' },
    { id: 'notifications-topic', label: 'notifications-topic (topic)' },
  ]) {
    const on = ui.rewriteChoice === o.id;
    chips.append(h('button', {
      type: 'button', 'aria-pressed': String(on), 'data-fk': 'rewrite:' + o.id,
      class: 'btn btn-chip btn-chip-sm' + (on ? ' chip-on' : ''),
      onclick: () => { ui.rewriteChoice = o.id; ui.rewriteReject = ''; uiChanged(); },
    }, o.label));
  }
  box.append(chips);
  box.append(h('button', {
    type: 'button', class: 'btn btn-rose min-h-11 font-mono', disabled: !ui.rewriteChoice,
    'data-fk': 'rewrite-confirm',
    onclick: () => {
      if (ui.rewriteChoice === 'inventory-jobs') dispatch({ type: 'DECOUPLE', channel: 'inventory-jobs' });
      else {
        ui.rewriteReject = `Rejected before dispatch: ${ui.rewriteChoice} is a pub/sub topic — inventory work is point-to-point (one consumer per job). Topics fan out copies; they don’t distribute work. Choose a queue.`;
        uiChanged();
      }
    },
  }, 'Confirm rewrite'));
  if (ui.rewriteReject) box.append(h('p', { class: 'rewrite-reject' }, ui.rewriteReject));
  return box;
}

function iamPanel(state, dispatch, consumer, perms) {
  const cur = state.env.iam[consumer] ?? [];
  const box = h('div', { class: 'row-dark-col' });
  box.append(h('p', { class: 'panel-teal-title' }, icon('Database', 'ic-14'), ` IAM POLICY — ${nodeById(consumer)?.label ?? consumer}`));
  const list = h('div', { class: 'iam-list' });
  for (const p of perms) {
    list.append(h('label', { class: 'iam-row' },
      checkboxEl({ checked: cur.includes(p.id), ariaLabel: p.label, fk: 'iam:' + consumer + ':' + p.id, onChange: (v) => dispatch({ type: 'SET_IAM', consumer, permId: p.id, on: v }) }),
      h('span', { class: 'iam-row-label' }, p.label)));
  }
  box.append(list);
  return box;
}

/* ── Telemetry ── */
function telemetryPanel(state, dispatch) {
  const m = state.env.metrics;
  const tile = (label, value, bad, unit) => h('div', { class: 'metric' + (bad ? ' bad' : '') },
    h('p', { class: 'metric-label' }, label),
    h('p', { class: 'metric-value' }, String(value), unit ? h('span', { class: 'metric-unit' }, ' ' + unit) : null));
  const wrap = h('div', { class: 'p-4 flex-col-gap-4' });
  const grid = h('div', { class: 'metric-grid' });
  grid.append(
    tile('orders-queue depth', m.ordersDepth, m.ordersDepth > 100),
    tile('oldest msg age', m.oldestMin, m.oldestMin > 10, 'min'),
    tile('payment error rate', m.payErrorPct, m.payErrorPct > 5, '%'),
    tile('duplicate deliveries', m.dupCount, m.dupCount > 0),
    tile('dup suppressed (idem.)', m.dupSuppressed, false),
    tile('telemetry throughput', m.throughputMsgs, false, 'msg/s'),
    tile('thumbnail batch', m.thumbBatch, false, 'evt'),
    tile('cross-region hops', m.crossRegionHops, m.crossRegionHops > 1));
  wrap.append(grid);

  const cat = h('div', { class: 'row-dark-col' });
  cat.append(h('p', { class: 'panel-teal-title' }, 'ALARM CATALOG — arm only what detects event-flow failures'));
  const list = h('div', { class: 'alarm-list' });
  for (const a of ALARM_CATALOG) {
    const on = state.env.alarms.includes(a.id);
    list.append(h('label', { class: 'alarm-row' + (on ? ' on' : '') },
      checkboxEl({
        checked: on, ariaLabel: a.label, fk: 'alarm:' + a.id,
        onChange: (v) => dispatch({ type: 'SET_ALARMS', ids: v ? [...state.env.alarms, a.id] : state.env.alarms.filter((x) => x !== a.id) }),
      }),
      h('span', { class: 'alarm-row-text' },
        h('span', { class: 'alarm-row-label' }, a.label),
        h('span', { class: 'alarm-row-hint' }, a.hint))));
  }
  cat.append(list);
  cat.append(h('p', { class: 'armed-line' }, `armed: ${state.env.alarms.length ? state.env.alarms.join(', ') : 'none'}`));
  wrap.append(cat);
  return wrap;
}

/* ── Logs ── */
const LEVEL_CLASS = { info: 'log-info', warn: 'log-warn', error: 'log-error', ok: 'log-ok' };

/** The original keeps the Radix ScrollArea DOM node across rerenders, so its
 *  scrollTop survives; capture/restore it around region rebuilds. */
let LOGS_SCROLL = 0;
function captureLogsScroll() {
  const vp = document.querySelector('.logs-viewport');
  if (vp) LOGS_SCROLL = vp.scrollTop;
}

function logsPanel(state) {
  const vp = h('div', { class: 'logs-viewport' });
  const ol = h('ol', { 'aria-live': 'polite', 'aria-label': 'Event platform log stream', class: 'logs-list' });
  for (const l of [...state.logs].slice(-80)) {
    ol.append(h('li', { class: 'log-line ' + LEVEL_CLASS[l.level] },
      h('span', { class: 'log-ts' }, l.ts), ' ',
      h('span', { class: 'log-src' }, `[${l.src}]`), ' ',
      h('span', { class: l.level === 'error' ? 'log-msg-bold' : '' }, l.msg)));
  }
  vp.append(ol);
  return vp;
}

/* ── Evidence ── */
function evidencePanel(state, dispatch) {
  const wrap = h('div', { class: 'p-4 flex-col-gap-4' });
  wrap.append(incident4123(state, dispatch));
  if (state.mode === 'hard') {
    wrap.append(silentCheckoutPack(), overFedPack(state), outOfOrderPack());
  }
  return wrap;
}

function incident4123(state, dispatch) {
  const dlqOn = !!state.env.dlqEnabled['orders-queue'];
  const card = h('div', { class: 'card evidence-card-amber' });
  const body = h('div', { class: 'card-pad flex-col-gap-3' });
  body.append(h('header', { class: 'evidence-header' },
    h('span', { class: 'badge badge-solid-amber' }, 'INCIDENT 4123'),
    h('h3', { class: 'evidence-title' }, 'Stuck checkout orders'),
    h('span', { class: 'evidence-meta' }, 'opened 08:12 · Tower Team')));
  body.append(h('p', { class: 'evidence-desc' },
    'Since 08:12 the orders-queue depth climbed from 40 to ', h('span', { class: 'evidence-hl' }, '1,240'),
    ' while Payment Service rejects the same message on every retry. Inspect the queue below, identify the poison message, enable a DLQ (Inspector → orders-queue), then divert it.'));
  const table = h('div', { class: 'queue-table-wrap' });
  const tbl = h('table', { class: 'queue-table' });
  tbl.append(h('thead', null, h('tr', { class: 'queue-thead' },
    h('th', null, 'message'), h('th', { class: 'hide-sm' }, 'payload'), h('th', null, 'action'))));
  const tbody = h('tbody', null);
  for (const msg of QUEUE_MESSAGES) {
    const tr = h('tr', { class: 'queue-row' + (msg.malformed ? ' malformed' : '') });
    const tdId = h('td', { class: 'queue-cell' },
      h('span', { class: msg.malformed ? 'queue-id-malformed' : 'queue-id' }, msg.id),
      msg.malformed ? icon('Bug', 'ic-12 queue-bug') : null,
      h('p', { class: 'queue-preview-sm' }, msg.preview));
    const tdPayload = h('td', { class: 'queue-cell hide-sm' }, msg.preview, h('p', { class: 'queue-note' }, msg.note));
    const tdAction = h('td', { class: 'queue-cell' });
    if (msg.malformed && !state.env.poisonRouted) {
      tdAction.append(h('button', {
        class: 'btn btn-rose-sm', disabled: !dlqOn,
        'aria-label': dlqOn ? `Route ${msg.id} to dead-letter queue` : 'Enable the DLQ first',
        'data-fk': 'route:' + msg.id,
        onclick: () => dispatch({ type: 'ROUTE_POISON' }),
      }, dlqOn ? 'Route to DLQ' : 'DLQ off'));
    }
    if (msg.malformed && state.env.poisonRouted) {
      tdAction.append(h('span', { class: 'diverted' }, 'diverted → orders-dlq ✓'));
    }
    if (msg.id === 'evt-9012') {
      tdAction.append(h('button', {
        class: 'btn btn-outline btn-sm-9', 'aria-label': 'Replay a duplicate delivery of evt-9012',
        'data-fk': 'replay:' + msg.id,
        onclick: () => dispatch({ type: 'REPLAY_DUP' }),
      }, 'Replay duplicate'));
    }
    tr.append(tdId, tdPayload, tdAction);
    tbody.append(tr);
  }
  tbl.append(tbody);
  table.append(tbl);
  body.append(table);
  if (state.env.poisonRouted) body.append(h('p', { class: 'pipeline-recovered' }, 'Pipeline recovered: depth 12 · oldest 0 min · error rate 0.3%.'));
  card.append(body);
  return card;
}

function silentCheckoutPack() {
  const card = h('div', { class: 'card evidence-card-rose' });
  const body = h('div', { class: 'card-pad flex-col-gap-3' });
  body.append(h('header', { class: 'evidence-header' },
    h('span', { class: 'badge badge-solid-rose' }, 'HARD PACK · SILENT CHECKOUT'),
    h('span', { class: 'evidence-meta' }, 'noisy evidence — 2+ red herrings included')));
  body.append(h('p', { class: 'evidence-desc' },
    'Revenue dashboard: orders “accepted” but revenue flat. Support: “double charges”. The on-call exported this log window — not everything in it is relevant to the outage.'));
  const box = h('div', { class: 'log-excerpt' });
  const ol = h('ol', { 'aria-label': 'Silent Checkout evidence log excerpt', class: 'log-excerpt-list' });
  H1_LOG_EXCERPT.forEach((l) => {
    ol.append(h('li', { class: 'log-line ' + LEVEL_CLASS[l.level] },
      h('span', { class: 'log-ts' }, l.ts), ' ',
      h('span', { class: 'log-src' }, `[${l.src}]`), ' ', l.msg));
  });
  box.append(ol);
  body.append(box);
  card.append(body);
  return card;
}

function overFedPack(state) {
  const card = h('div', { class: 'card evidence-card-rose' });
  const body = h('div', { class: 'card-pad flex-col-gap-3' });
  body.append(h('header', { class: 'evidence-header' },
    h('span', { class: 'badge badge-solid-rose' }, 'HARD PACK · OVER-FED FUNCTION'),
    h('span', { class: 'evidence-meta' }, 'captured forged event + live IAM policy')));
  body.append(h('p', { class: 'evidence-desc' },
    'An 812 MB “photo” with suspicious metadata traversed media-events. Thumbnail Generator executed it anyway. Below: the captured event and the function’s current IAM policy.'));
  const iamText = `iam.policy(thumbnail-service) = [\n  ${(state.env.iam['thumbnail-service'] ?? []).map((p) => `"${p}"`).join(',\n  ') ?? ''}\n]`;
  body.append(h('div', { class: 'overfed-grid' },
    h('pre', { class: 'overfed-pre rose', 'aria-label': 'Forged event capture' }, H4_FORGED_EVENT),
    h('pre', { class: 'overfed-pre amber', 'aria-label': 'Current IAM policy of thumbnail-service' }, iamText)));
  body.append(h('p', { class: 'pack-hint' }, icon('Waves', 'ic-14'), ' hint of the trade: validate payloads at the edge; scope credentials to the role (M1018).'));
  card.append(body);
  return card;
}

function outOfOrderPack() {
  const card = h('div', { class: 'card evidence-card-rose' });
  const body = h('div', { class: 'card-pad flex-col-gap-3' });
  body.append(h('header', { class: 'evidence-header' },
    h('span', { class: 'badge badge-solid-rose' }, 'HARD PACK · OUT-OF-ORDER TELEMETRY'),
    h('span', { class: 'evidence-meta' }, 'anomaly-detector input sample')));
  const table = h('div', { class: 'queue-table-wrap' });
  const tbl = h('table', { class: 'queue-table' });
  tbl.append(h('thead', null, h('tr', { class: 'queue-thead' },
    h('th', null, 'arrival time'), h('th', null, 'drone'), h('th', null, 'seq'))));
  const tbody = h('tbody', null);
  H8_READINGS.forEach((r) => {
    tbody.append(h('tr', { class: 'queue-row' },
      h('td', { class: 'queue-cell' }, r.t), h('td', { class: 'queue-cell' }, r.drone), h('td', { class: 'queue-cell' }, String(r.seq))));
  });
  tbl.append(tbody);
  table.append(tbl);
  body.append(table);
  body.append(h('p', { class: 'pack-hint' }, icon('CircleDot', 'ic-14'), ' note the interleaving: same-drone readings (AV-118 seq 990→992) arrive out of order.'));
  card.append(body);
  return card;
}

/* ══════════ Objectives Rail ══════════ */
const JUMPS = {
  'OBJ-M1': [{ tab: 'inspector', node: 'checkout-api', label: 'board → click untagged nodes' }],
  'OBJ-M4': [{ tab: 'inspector', node: 'photo-uploader', label: 'Uploader inspector (Inject)' }],
  'OBJ-M7': [{ tab: 'evidence', node: null, label: 'Evidence → Incident 4123' }],
  'OBJ-M8': [{ tab: 'evidence', node: null, label: 'Incident card → Replay' }, { tab: 'inspector', node: 'payment-service', label: 'Inspector → payment' }],
  'OBJ-M9': [{ tab: 'inspector', node: 'checkout-api', label: 'Inspector → checkout-api' }],
  'OBJ-M10': [{ tab: 'telemetry', node: null, label: 'Telemetry → alarm catalog' }],
  'OBJ-M11': [{ tab: 'inspector', node: 'notifier', label: 'Inspector → notifier IAM' }],
  'OBJ-H1': [{ tab: 'evidence', node: null, label: 'Evidence → Silent Checkout pack' }],
  'OBJ-H4': [{ tab: 'evidence', node: null, label: 'Evidence → Over-fed function' }],
  'OBJ-H8': [{ tab: 'evidence', node: null, label: 'Evidence → out-of-order table' }],
};

const EVENT_CMD_QUERY = [{ id: 'event', label: 'EVENT' }, { id: 'command', label: 'COMMAND' }, { id: 'query', label: 'QUERY' }];

function rowBox(n, label, children) {
  return h('div', { class: 'row-box' },
    h('p', { class: 'row-box-label' },
      n ? h('span', { class: 'row-box-n' }, n) : null,
      label),
    children);
}

/* per-objective widgets (ObjectivesRail.tsx Widget) */
function objectiveWidget(obj, state, dispatch) {
  const s = state;
  const id = obj.id;
  const ans = (o, f) => A(s, o, f);
  const setA = (o, f) => (values) => dispatch({ type: 'ANSWER', obj: o, field: f, values });

  switch (id) {
    case 'OBJ-M2':
      return h('div', { class: 'flex-col-gap-2' }, MESSAGE_CARDS.map((c, i) =>
        rowBox(`#${i + 1}`, h('code', { class: 'row-code' }, c.text),
          chipSelect({ ariaLabel: `Classify message ${i + 1}`, options: EVENT_CMD_QUERY, value: ans(id, c.id), onChange: setA(id, c.id), size: 'sm' }))));
    case 'OBJ-M3':
      return h('div', { class: 'flex-col-gap-2' }, CHANNEL_NEEDS.map((c, i) =>
        rowBox(`#${i + 1}`, c.text,
          chipSelect({
            ariaLabel: `Channel for requirement ${i + 1}`,
            options: [{ id: 'queue', label: 'Queue' }, { id: 'topic', label: 'Topic (pub/sub)' }, { id: 'stream', label: 'Stream' }],
            value: ans(id, c.id), onChange: setA(id, c.id), size: 'sm',
          }))));
    case 'OBJ-M4': {
      const path = ans(id, 'path');
      const injected = s.env.injected.includes('photo-uploader');
      return h('div', { class: 'flex-col-gap-2' },
        h('p', { class: 'widget-note' }, injected ? '✓ photo.uploaded launched — build the path below.' : 'launch the event first (Launch Pad or the Uploader inspector).'),
        h('p', { class: 'widget-path-line' }, `Path (${path.length}/5): `, h('span', { class: 'widget-path' }, path.join(' → ') || '—')),
        chipSelect({
          ariaLabel: 'Build the delivery path in order', append: true, size: 'sm',
          options: PATH_CHIP_POOL.map((p) => ({ id: p, label: p })),
          value: path,
          onChange: (vals) => dispatch({ type: 'ANSWER_APPEND', obj: id, field: 'path', value: vals[vals.length - 1] }),
        }),
        h('div', { class: 'path-actions' },
          h('button', { class: 'btn btn-outline btn-sm-9', 'data-fk': 'path-undo', onclick: () => setA(id, 'path')(path.slice(0, -1)) }, 'Undo last'),
          h('button', { class: 'btn btn-outline btn-sm-9', 'data-fk': 'path-clear', onclick: () => setA(id, 'path')([]) }, 'Clear')));
    }
    case 'OBJ-M5':
      return h('div', { class: 'flex-col-gap-2' }, TRIGGER_USECASES.map((c, i) =>
        rowBox(`#${i + 1}`, c.text,
          sel({ label: `Trigger for workload ${i + 1}`, value: ans(id, c.id)[0] ?? '', onChange: (v) => setA(id, c.id)([v]), options: TRIGGER_OPTIONS }))));
    case 'OBJ-M6':
      return h('div', { class: 'flex-col-gap-2' },
        COORD_SCENARIOS.map((c, i) => rowBox(`#${i + 1}`, c.text,
          chipSelect({
            ariaLabel: `Pattern for scenario ${i + 1}`,
            options: [{ id: 'choreography', label: 'Choreography' }, { id: 'orchestration', label: 'Orchestration' }],
            value: ans(id, c.id), onChange: setA(id, c.id), size: 'sm',
          }))),
        rowBox(null, 'Which statement is TRUE?',
          chipSelect({
            ariaLabel: 'True statement about the patterns',
            options: COORD_TRUTH.options.map((o, i) => ({ id: String(i), label: o })),
            value: ans(id, 'truth'), onChange: setA(id, 'truth'), size: 'sm',
          })));
    case 'OBJ-M7':
      return h('div', { class: 'flex-col-gap-2' },
        rowBox(null, 'Which consumer is failing?',
          sel({
            label: 'Failing consumer', value: ans(id, 'consumer')[0] ?? '', onChange: (v) => setA(id, 'consumer')([v]),
            options: ['payment-service', 'thumbnail-service', 'anomaly-detector', 'notifier'].map((o) => ({ id: o, label: o })),
          })),
        rowBox(null, 'Which message is the poison (never parseable)?',
          sel({
            label: 'Poison message', value: ans(id, 'poison')[0] ?? '', onChange: (v) => setA(id, 'poison')([v]),
            options: QUEUE_MESSAGES.map((msg) => ({ id: msg.id, label: msg.id })),
          })),
        h('div', { class: 'flex-col-gap-1 pt-1' },
          statusMirror(!!s.env.dlqEnabled['orders-queue'], 'DLQ enabled on orders-queue (Inspector → orders-queue)'),
          statusMirror(s.env.poisonRouted, 'poison routed to DLQ (Evidence → queue browser)')));
    case 'OBJ-M8':
      return h('div', { class: 'flex-col-gap-1' },
        statusMirror(!!s.env.idempotency['payment-service'], 'idempotency ON for Payment Service (Inspector)'),
        statusMirror(s.env.replayDone, 'duplicate replay performed (Evidence → Incident 4123 → Replay duplicate)'),
        h('p', { class: 'widget-note mono' }, `duplicates: ${s.env.metrics.dupCount} · suppressed since idempotency: ${s.env.metrics.dupSuppressed}`));
    case 'OBJ-M9':
      return h('div', { class: 'flex-col-gap-1' },
        statusMirror(!s.env.directRest, 'sync REST removed (Inspector → checkout-api → Rewrite integration)'),
        statusMirror((s.env.wiring['checkout-api'] ?? []).includes('inventory-jobs') && (s.env.wiring['inventory-jobs'] ?? []).includes('inventory-service'), 'checkout-api → inventory-jobs → inventory-service wired'),
        statusMirror(s.env.triggers['inventory-service'] === 'trigger-queue', 'Inventory Service consumes via queue trigger'));
    case 'OBJ-M10':
      return h('div', { class: 'flex-col-gap-1' },
        h('p', { class: 'widget-armed' }, `armed: ${s.env.alarms.join(', ') || 'none'}`),
        statusMirror(ALARMS_CORRECT.every((a) => s.env.alarms.includes(a)) && s.env.alarms.length === 3, 'exactly the three flow-failure alarms armed (Telemetry tab)'));
    case 'OBJ-M11':
      return h('div', { class: 'flex-col-gap-1' },
        h('p', { class: 'widget-armed' }, `notifier IAM: ${s.env.iam['notifier']?.join(', ') || 'empty'}`),
        statusMirror(IAM_NOTIFIER_CORRECT.every((p) => (s.env.iam['notifier'] ?? []).includes(p)) && (s.env.iam['notifier'] ?? []).length === IAM_NOTIFIER_CORRECT.length, 'exactly: subscribe media-events + publish notifications-topic (Inspector → notifier)'));
    case 'OBJ-M12':
      return h('div', { class: 'flex-col-gap-2' }, FITNESS_WORKLOADS.map((c, i) =>
        rowBox(`#${i + 1}`, c.text,
          chipSelect({
            ariaLabel: `Architecture for workload ${i + 1}`,
            options: [{ id: 'event-driven', label: 'Event-driven' }, { id: 'batch', label: 'Batch' }],
            value: ans(id, c.id), onChange: setA(id, c.id), size: 'sm',
          }))));
    /* ── HARD ── */
    case 'OBJ-H1':
      return h('div', { class: 'flex-col-gap-2' },
        h('p', { class: 'widget-note' }, `Select EXACTLY the 3 true root causes (${ans(id, 'causes').length}/3):`),
        chipSelect({ ariaLabel: 'Root cause selection', multi: true, exactN: 3, options: H1_CAUSES.map((c) => ({ id: c.id, label: c.label })), value: ans(id, 'causes'), onChange: setA(id, 'causes'), size: 'sm' }),
        h('div', { class: 'flex-col-gap-1 pt-1' },
          statusMirror(!!s.env.dlqEnabled['orders-queue'], 'fix 1 — DLQ enabled on orders-queue'),
          statusMirror(s.env.poisonRouted, 'fix 2 — poison evt-8841 routed (Evidence)'),
          statusMirror(!!s.env.idempotency['payment-service'], 'fix 3 — idempotency ON for Payment Service')));
    case 'OBJ-H2':
      return h('div', { class: 'flex-col-gap-2' }, BLUEPRINT_SLOTS.map((sl, i) =>
        rowBox(`#${i + 1}`, sl.prompt,
          sel({ label: sl.prompt, value: s.env.blueprint[sl.id] ?? '', onChange: (v) => dispatch({ type: 'SET_BLUEPRINT', slot: sl.id, value: v }), options: sl.options }))));
    case 'OBJ-H3':
      return h('div', { class: 'flex-col-gap-2' }, H3_ROWS.map((r, i) =>
        rowBox(`#${i + 1}`, r.text,
          h('div', { class: 'h3-grid' },
            sel({ label: `Delivery model for row ${i + 1}`, value: ans(id, 'm-' + r.id)[0] ?? '', onChange: (v) => setA(id, 'm-' + r.id)([v]), options: H3_MODELS }),
            sel({ label: `Control for row ${i + 1}`, value: ans(id, 'c-' + r.id)[0] ?? '', onChange: (v) => setA(id, 'c-' + r.id)([v]), options: H3_CONTROLS })))));
    case 'OBJ-H4':
      return h('div', { class: 'flex-col-gap-2' },
        rowBox(null, '1 · Attack vector — how did the forged event enter?',
          chipSelect({ ariaLabel: 'Attack vector', options: H4_VECTORS.map((v) => ({ id: v.id, label: v.label })), value: ans(id, 'vector'), onChange: setA(id, 'vector'), size: 'sm' })),
        rowBox(null, '2 · The dangerous over-privilege in thumbnail-service IAM:',
          chipSelect({ ariaLabel: 'Over-privilege', options: H4_OVERPRIV.map((v) => ({ id: v.id, label: v.label })), value: ans(id, 'overpriv'), onChange: setA(id, 'overpriv'), size: 'sm' })),
        h('div', { class: 'flex-col-gap-1' },
          statusMirror(IAM_THUMB_CORRECT.every((p) => (s.env.iam['thumbnail-service'] ?? []).includes(p)) && (s.env.iam['thumbnail-service'] ?? []).length === IAM_THUMB_CORRECT.length, '3a — IAM trimmed (Inspector → thumbnail-service)'),
          statusMirror(!!s.env.schemaValidation['photo-uploader'], '3b — schema validation ON (Inspector → uploader)')));
    case 'OBJ-H5':
      return h('div', { class: 'flex-col-gap-2' },
        h('p', { class: 'widget-note' }, `Select EXACTLY the 3 correct optimizations (${ans(id, 'opts').length}/3):`),
        chipSelect({ ariaLabel: 'Optimization selection', multi: true, exactN: 3, options: H5_OPTS.map((o) => ({ id: o.id, label: o.label })), value: ans(id, 'opts'), onChange: setA(id, 'opts'), size: 'sm' }));
    case 'OBJ-H6': {
      const g = s.env.saga;
      return h('div', { class: 'flex-col-gap-2' },
        rowBox(null, '1 · Coordination pattern:',
          chipSelect({
            ariaLabel: 'Saga pattern', size: 'sm',
            options: [{ id: 'choreography', label: 'Choreography' }, { id: 'orchestration', label: 'Orchestration' }],
            value: g.pattern ? [g.pattern] : [],
            onChange: (v) => dispatch({ type: 'SET_SAGA', patch: { pattern: v[0] ?? '' } }),
          })),
        h('div', { class: 'switch-row' },
          h('label', { class: 'switch-row-label', for: 'saga-co' }, '2 · Central coordinator active'),
          switchEl({ id: 'saga-co', checked: g.coordinator, onChange: (v) => dispatch({ type: 'SET_SAGA', patch: { coordinator: v } }) })),
        rowBox(null, h('span', null, `3 · Wire EXACTLY the three compensation events (${g.comp.length}/3):`),
          chipSelect({ ariaLabel: 'Compensation events', multi: true, exactN: 3, options: H6_COMP_OPTS.map((c) => ({ id: c.id, label: c.label })), value: g.comp, onChange: (v) => dispatch({ type: 'SET_SAGA', patch: { comp: v } }), size: 'sm' })),
        h('div', { class: 'switch-row' },
          h('label', { class: 'switch-row-label', for: 'saga-to' }, '4 · Flow timeout enforced'),
          switchEl({ id: 'saga-to', checked: g.timeout, onChange: (v) => dispatch({ type: 'SET_SAGA', patch: { timeout: v } }) })));
    }
    case 'OBJ-H7': {
      const t = s.env.tracing;
      return h('div', { class: 'flex-col-gap-2' },
        H7_METRICS.map((mkey) => rowBox(null,
          h('span', null, h('span', { class: 'widget-metric-name' }, H7_METRIC_LABELS[mkey]), ' → response:'),
          sel({ label: `Response for ${H7_METRIC_LABELS[mkey]}`, value: t.pairs[mkey] ?? '', onChange: (v) => dispatch({ type: 'SET_TRACING', patch: { pairs: { ...t.pairs, [mkey]: v } } }), options: H7_ACTIONS }))),
        rowBox(null, 'Correlation ID is born at…',
          chipSelect({
            ariaLabel: 'Correlation origin', size: 'sm',
            options: [{ id: 'origin-producer', label: 'the FIRST producer of the flow' }, { id: 'origin-consumer', label: 'each consumer, independently' }],
            value: t.origin ? [t.origin] : [],
            onChange: (v) => dispatch({ type: 'SET_TRACING', patch: { origin: v[0] ?? '' } }),
          })),
        rowBox(null, '…and travels…',
          chipSelect({
            ariaLabel: 'Correlation propagation', size: 'sm',
            options: [{ id: 'prop-headers', label: 'inside the event metadata, on every hop' }, { id: 'prop-db', label: 'via a lookup in a shared database' }],
            value: t.propagation ? [t.propagation] : [],
            onChange: (v) => dispatch({ type: 'SET_TRACING', patch: { propagation: v[0] ?? '' } }),
          })),
        h('div', { class: 'switch-row' },
          h('label', { class: 'switch-row-label', for: 'trace-on' }, 'Distributed tracing'),
          switchEl({ id: 'trace-on', checked: t.enabled, onChange: (v) => dispatch({ type: 'SET_TRACING', patch: { enabled: v } }) })));
    }
    case 'OBJ-H8': {
      const st = s.env.stream;
      return h('div', { class: 'flex-col-gap-2' },
        rowBox(null, '1 · Partition key:',
          chipSelect({ ariaLabel: 'Partition key', size: 'sm', options: H8_KEYS.map((k) => ({ id: k.id, label: k.label })), value: st.partitionKey ? [st.partitionKey] : [], onChange: (v) => dispatch({ type: 'SET_STREAM', patch: { partitionKey: v[0] ?? '' } }) })),
        h('div', { class: 'switch-row' },
          h('label', { class: 'switch-row-label', for: 'stream-ord' }, '2 · Stream ordering enabled'),
          switchEl({ id: 'stream-ord', checked: st.ordering, onChange: (v) => dispatch({ type: 'SET_STREAM', patch: { ordering: v } }) })),
        rowBox(null, '3 · Consumer strategy:',
          chipSelect({ ariaLabel: 'Consumer buffering strategy', size: 'sm', options: H8_BUFFERS.map((b) => ({ id: b.id, label: b.label })), value: st.buffer ? [st.buffer] : [], onChange: (v) => dispatch({ type: 'SET_STREAM', patch: { buffer: v[0] ?? '' } }) })));
    }
    case 'OBJ-H9':
      return h('div', { class: 'flex-col-gap-2' }, H9_PROPOSALS.map((p, i) =>
        rowBox(`#${i + 1}`, p.text,
          h('div', { class: 'flex-col-gap-2' },
            chipSelect({ ariaLabel: `Verdict for proposal ${i + 1}`, options: H9_VERDICTS, value: ans(id, 'v-' + p.id), onChange: setA(id, 'v-' + p.id), size: 'sm' }),
            sel({ label: `Reason for proposal ${i + 1}`, value: ans(id, 'r-' + p.id)[0] ?? '', onChange: (v) => setA(id, 'r-' + p.id)([v]), options: H9_REASONS })))));
    case 'OBJ-H10': {
      const g = s.env.archive;
      return h('div', { class: 'flex-col-gap-2' },
        h('div', { class: 'switch-row' },
          h('label', { class: 'switch-row-label', for: 'arch-on' }, '1 · Event archive enabled'),
          switchEl({ id: 'arch-on', checked: g.enabled, onChange: (v) => dispatch({ type: 'SET_ARCHIVE', patch: { enabled: v } }) })),
        rowBox(null, '2 · Retention:', sel({ label: 'Retention', value: g.retention, onChange: (v) => dispatch({ type: 'SET_ARCHIVE', patch: { retention: v } }), options: H10_RETENTIONS })),
        rowBox(null, '3 · Replay strategy:', sel({ label: 'Replay strategy', value: g.target, onChange: (v) => dispatch({ type: 'SET_ARCHIVE', patch: { target: v } }), options: H10_TARGETS })),
        h('div', { class: 'switch-row' },
          h('label', { class: 'switch-row-label', for: 'es-on' }, '4 · Ledger uses event sourcing'),
          switchEl({ id: 'es-on', checked: g.sourcing, onChange: (v) => dispatch({ type: 'SET_ARCHIVE', patch: { sourcing: v } }) })),
        rowBox(null, '5 · Justification:', sel({ label: 'Justification', value: g.justification, onChange: (v) => dispatch({ type: 'SET_ARCHIVE', patch: { justification: v } }), options: H10_JUST })));
    }
    default:
      return null;
  }
}

function renderRail(slot, state, dispatch) {
  if (!state.mode) return;
  const defs = objectivesFor(state.mode);
  const objs = defs.map((d) => state.objectives[d.id] ?? { passed: false, attempts: 0, hintLevel: 0, firstAttempt: false });
  const passed = objs.filter((o) => o.passed).length;
  const pct = defs.length ? Math.round((passed / defs.length) * 100) : 0;
  const isMedium = state.mode === 'medium';

  const section = h('section', { 'aria-label': 'Objectives', class: 'flex-col-gap-3' });
  section.append(h('div', { class: 'card bg-80 border-zinc-800' },
    h('div', { class: 'card-pad flex-col-gap-2' },
      h('div', { class: 'rail-head' },
        h('h2', { class: 'rail-title' }, 'FLIGHT STRIPS'),
        h('span', { class: 'badge badge-outline rail-count' }, `${passed}/${defs.length} PASSED`)),
      progressBar(pct, `${pct}% of objectives passed`),
      (() => {
        const row = h('div', { class: 'pillar-row', 'aria-label': 'Pillar progress' });
        for (const p of ['P1', 'P2', 'P3', 'P4']) {
          const total = defs.filter((d) => d.pillar === p).length;
          const done = defs.filter((d) => d.pillar === p && state.objectives[d.id]?.passed).length;
          row.append(h('span', {
            class: 'pillar-chip ' + PILLAR_META[p].color,
            title: `${PILLAR_META[p].label}: ${done}/${total}`,
          }, `${p} ${done}/${total}`));
        }
        return row;
      })())));

  defs.forEach((def) => {
    const o = state.objectives[def.id];
    const lc = state.lastCheck && state.lastCheck.objId === def.id ? state.lastCheck : null;
    const open = ui.openObj === def.id;
    const card = h('div', { class: 'card obj-card' + (o?.passed ? ' passed' : open ? ' open' : '') });
    card.append(h('button', {
      type: 'button',
      'data-fk': 'obj:' + def.id,
      'aria-expanded': String(open),
      class: 'obj-strip',
      onclick: () => { ui.openObj = open ? null : def.id; uiChanged(); },
    },
      h('span', { class: 'pillar-chip ' + PILLAR_META[def.pillar].color }, def.id.replace('OBJ-', '')),
      h('span', { class: 'obj-title' + (o?.passed ? ' passed' : '') }, def.title),
      o?.passed ? icon('CheckCircle2', 'ic-16 obj-icon-ok') : null,
      !o?.passed && lc && !lc.pass ? icon('MessageSquareWarning', 'ic-16 obj-icon-feedback') : null));

    if (open) {
      const body = h('div', { class: 'obj-body' });
      body.append(h('p', { class: 'obj-task' }, def.task));

      if (isMedium && JUMPS[def.id]) {
        const jumps = h('div', { class: 'jump-row' });
        for (const j of JUMPS[def.id]) {
          jumps.append(h('button', {
            class: 'btn btn-jump', 'data-fk': 'jump:' + def.id + ':' + j.label,
            onclick: () => onJump(j.tab, j.node),
          }, icon('Crosshair', 'ic-12'), j.label));
        }
        body.append(jumps);
      }

      const w = objectiveWidget(def, state, dispatch);
      if (w) body.append(w);

      // hints
      const hintBox = h('div', { class: 'flex-col-gap-1' });
      const hintLevel = o?.hintLevel ?? 0;
      if (isMedium) {
        if (hintLevel < 3) {
          hintBox.append(h('button', {
            class: 'btn btn-hint-amber', 'data-fk': 'hint:' + def.id,
            onclick: () => dispatch({ type: 'USE_HINT', objId: def.id }),
          }, icon('Lightbulb', 'ic-14'), `Reveal hint ${hintLevel + 1}/3`));
        }
        def.hints.slice(0, hintLevel).forEach((hh, i) => {
          hintBox.append(h('p', { class: 'hint-amber' }, `hint ${i + 1}: ${hh}`));
        });
      } else if (hintLevel < 1) {
        hintBox.append(h('button', {
          class: 'btn btn-hint-rose', 'data-fk': 'hint:' + def.id,
          onclick: () => dispatch({ type: 'USE_HINT', objId: def.id }),
        }, icon('Lightbulb', 'ic-14'), 'Take the one allowed nudge (costs score)'));
      } else {
        hintBox.append(h('p', { class: 'hint-rose' }, def.hints[0]));
      }
      body.append(hintBox);

      // check
      if (!o?.passed) {
        body.append(h('button', {
          class: 'btn btn-check min-h-11 font-mono tracking-wide', 'data-fk': 'check:' + def.id,
          onclick: () => dispatch({ type: 'CHECK', objId: def.id }),
        }, 'CHECK RESULTS'));
      }
      if (lc && !o?.passed && !lc.pass) {
        body.append(h('p', { role: 'status', 'aria-live': 'polite', class: 'check-fail' }, lc.why));
      }
      if (o?.passed) {
        body.append(h('div', { role: 'status', class: 'flex-col-gap-1' },
          h('p', { class: 'passed-line' },
            icon('CheckCircle2', 'ic-14'),
            ' PASSED',
            o.firstAttempt ? ' · first attempt' : ` · after ${o.attempts} attempt${o.attempts > 1 ? 's' : ''}`,
            o.hintLevel > 0 ? ` · ${o.hintLevel} hint${o.hintLevel > 1 ? 's' : ''}` : ''),
          h('p', { class: 'obj-feedback' }, def.feedback)));
      }
      card.append(body);
    }
    section.append(card);
  });

  slot.append(section);
}

/* ══════════ Completion modal (Completion.tsx) ══════════ */
const NEXT_STEPS = [
  'Rebuild this topology from memory on a whiteboard — producer, channels (queue/topic/stream), consumers, DLQs.',
  'Map each Aerolink integration to a real managed service you know (EventBridge/Event Grid/Pub/Sub families) and note the trigger types.',
  'Explain to someone else why at-least-once + idempotency beats hoping for exactly-once.',
  'For Cloud+ exam day: drill Domain 5.0 performance-based questions and revisit Domain 4 security controls (IAM least privilege).',
];

function computeFocusAreas(state) {
  if (!state.mode) return [];
  const defs = objectivesFor(state.mode);
  const bank = state.mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
  const items = [];
  for (const d of defs) {
    const o = state.objectives[d.id];
    const pillar = PILLAR_META[d.pillar].label;
    if (!o?.passed) {
      items.push({ area: `${d.title} (${pillar})`, evidence: 'objective not yet passed', action: 'Re-open it in the tower, follow the hints, and press CHECK RESULTS until it passes.' });
    } else if (o.attempts > 1) {
      items.push({ area: `${d.title} (${pillar})`, evidence: `passed on attempt ${o.attempts}`, action: 'Re-read the objective feedback above the rail, then re-run that task from scratch without hints.' });
    } else if (o.hintLevel > 0) {
      items.push({ area: `${d.title} (${pillar})`, evidence: `passed using ${o.hintLevel} hint${o.hintLevel > 1 ? 's' : ''}`, action: 'Redo the task once with hints closed — the Knowledge Core section covers it end-to-end.' });
    }
  }
  const missedTopics = [];
  bank.forEach((q, i) => {
    const a = state.quiz.answers[q.id];
    if (a !== undefined && a !== q.correct) missedTopics.push(`quiz Q${i + 1} (${q.topic})`);
  });
  if (missedTopics.length) {
    items.push({
      area: missedTopics.join(' · '),
      evidence: 'knowledge-check items missed',
      action: 'Re-read the matching Knowledge Core sections in the Briefing, then retake the quiz after a RESET if you want a clean score.',
    });
  }
  const hintHeavy = defs.reduce((acc, d) => acc + (state.objectives[d.id]?.hintLevel ?? 0), 0);
  const hintThreshold = state.mode === 'medium' ? 6 : 2;
  if (hintHeavy > hintThreshold) {
    items.push({ area: 'Guided navigation of the tower', evidence: `${hintHeavy} hints used (threshold ${hintThreshold})`, action: 'Replay the mode once and find each control (Inspector, Telemetry, Evidence) without nudges.' });
  }
  return items;
}

function buildCompletion(state, dispatch) {
  const score = computeScore(state);
  const defs = state.mode ? objectivesFor(state.mode) : [];
  const focusAreas = computeFocusAreas(state);

  const root = h('div', { class: 'completion', role: 'dialog', 'aria-label': 'Lab completion' });
  root.append(h('div', { class: 'completion-head' },
    icon('Trophy', 'ic-32 amber'),
    h('div', null,
      h('h2', { id: 'completion-title', class: 'completion-title' }, 'TOWER WATCH COMPLETE'),
      h('p', { id: 'completion-desc', class: 'completion-desc' }, 'You can now explain, recognize, observe and harden event-driven architectures — Lesson 5.6 covered.'))));

  const stars = h('div', { class: 'stars-row', 'aria-label': `${score.stars} of 5 stars` });
  for (let n = 1; n <= 5; n++) {
    stars.append(h('span', { class: 'star' + (n <= score.stars ? ' filled' : ''), html: `<svg viewBox="0 0 24 24" fill="${n <= score.stars ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS.Star}</svg>` }));
  }
  stars.append(h('span', { class: 'stars-num' }, `${score.stars}/5`));
  root.append(stars);

  const tiles = h('div', { class: 'stat-tiles' });
  const tile = (cls, v, l) => h('div', { class: 'stat-tile' }, h('p', { class: 'stat-value ' + cls }, v), h('p', { class: 'stat-label' }, l));
  tiles.append(
    tile('teal', `${score.passed}/${score.total}`, 'OBJECTIVES'),
    tile('teal', `${Math.round(score.firstAttemptRate * 100)}%`, 'FIRST-ATTEMPT'),
    tile('amber', `${score.quizCorrect}/${score.quizTotalN}`, 'QUIZ'),
    tile('rose', String(score.hintsUsed), 'HINTS USED'));
  root.append(tiles);

  root.append(h('p', { class: 'star-formula' }, `star formula: 1 + 2×(first-attempt rate) + 2×(quiz rate), −1 if hints exceed ${state.mode === 'medium' ? 6 : 2}.`));
  root.append(h('div', { class: 'separator' }));

  const recap = h('div', { class: 'flex-col-gap-3' }, h('h3', { class: 'section-title' }, 'Objective recap by pillar'));
  for (const p of ['P1', 'P2', 'P3', 'P4']) {
    const list = defs.filter((d) => d.pillar === p);
    const box = h('div', { class: 'flex-col-gap-1' });
    box.append(h('span', { class: `badge badge-outline ${PILLAR_META[p].color} badge-pillar w-fit` },
      `${PILLAR_META[p].label} · ${list.filter((d) => state.objectives[d.id]?.passed).length}/${list.length}`));
    const ul = h('ul', { class: 'recap-list' });
    for (const d of list) {
      const passedD = state.objectives[d.id]?.passed;
      ul.append(h('li', { class: 'recap-item' + (passedD ? ' done' : '') },
        h('span', { class: 'recap-star' + (passedD ? ' filled' : ''), html: `<svg viewBox="0 0 24 24" fill="${passedD ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS.Star}</svg>` }),
        h('span', null, d.title)));
    }
    box.append(ul);
    recap.append(box);
  }
  root.append(recap);
  root.append(h('div', { class: 'separator' }));

  const focus = h('div', { class: 'flex-col-gap-2' },
    h('h3', { class: 'section-title' }, icon('Target', 'ic-16 amber'), ' Focus areas — where to drill more'));
  if (focusAreas.length === 0) {
    focus.append(h('p', { class: 'focus-empty' }, 'Flawless run: every objective passed on the first attempt, no hints, and a perfect knowledge check. There are no weak areas in this attempt — the next level of prep is teaching these patterns back to someone else.'));
  } else {
    const ul = h('ul', { class: 'focus-list' });
    for (const f of focusAreas) {
      ul.append(h('li', { class: 'focus-item' },
        h('p', { class: 'focus-area' }, f.area),
        h('p', { class: 'focus-evidence' }, `evidence: ${f.evidence}`),
        h('p', { class: 'focus-action' }, `→ ${f.action}`)));
    }
    focus.append(ul);
  }
  root.append(focus);
  root.append(h('div', { class: 'separator' }));

  const next = h('div', { class: 'flex-col-gap-2' }, h('h3', { class: 'section-title' }, 'What to learn next'));
  const ul2 = h('ul', { class: 'next-list' });
  NEXT_STEPS.forEach((n) => ul2.append(h('li', { class: 'next-item' }, h('span', { class: 'next-arrow' }, '▸'), n)));
  next.append(ul2);
  root.append(next);

  const actions = h('div', { class: 'completion-actions' });
  actions.append(
    h('button', { class: 'btn btn-dark btn-sm-9 font-mono text-xs', 'data-fk': 'comp-review', onclick: () => dispatch({ type: 'SET_SCREEN', screen: 'tower' }) }, icon('TerminalSquare', 'ic-14'), ' Review the tower'),
    h('button', { class: 'btn btn-dark btn-sm-9 font-mono text-xs', 'data-fk': 'comp-quiz', onclick: () => dispatch({ type: 'SET_SCREEN', screen: 'quiz' }) }, icon('ListChecks', 'ic-14'), ' Quiz'),
    h('button', { class: 'btn btn-rose btn-sm-9 font-mono text-xs', 'data-fk': 'comp-restart', onclick: () => { closeDialog(false); dispatch({ type: 'RESET' }); } }, icon('RotateCcw', 'ic-14'), ' Restart lab'));
  root.append(actions);
  return root;
}

function buildResetDialog() {
  const content = h('div', { class: 'reset-dialog' });
  content.append(
    h('h2', { id: 'reset-title', class: 'reset-title' }, 'Reset the lab?'),
    h('p', { id: 'reset-desc', class: 'reset-desc' }, 'This wipes all progress, answers and environment state, returning the tower to its pristine configuration. This cannot be undone.'));
  const footer = h('div', { class: 'reset-footer' });
  footer.append(
    h('button', {
      class: 'btn btn-cancel font-mono', 'data-fk': 'reset-cancel',
      onclick: () => closeDialog(),
    }, 'Keep my progress'),
    h('button', {
      class: 'btn btn-rose font-mono', 'data-fk': 'reset-confirm',
      onclick: () => { closeDialog(false); dispatch({ type: 'RESET' }); },
    }, 'Full reset'));
  content.append(footer);
  return content;
}
