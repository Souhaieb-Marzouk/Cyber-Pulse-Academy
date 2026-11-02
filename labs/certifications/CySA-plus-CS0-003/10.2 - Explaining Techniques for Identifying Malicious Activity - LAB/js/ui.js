// ── SIGNALWATCH · shared console UI primitives (js/ui.js) ───────────────────
// Static port of ui-bits.tsx + icon handling. DOM is built with the tiny h()
// helper (no framework); icons are inline SVG from js/icons.js.

// ── DOM builder ─────────────────────────────────────────────────────────────
/**
 * h('div', { class: 'x', onclick: fn, 'aria-hidden': true }, child, ...)
 * children may be nested arrays; null/false/'' are skipped.
 */
function h(tag, attrs, ...children) {
  const el = document.createElement(tag)
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue
      if (k === 'class') el.className = v
      else if (k === 'html') el.innerHTML = v // trusted: generated icon markup only
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v)
      else if (v === true) el.setAttribute(k, '')
      else el.setAttribute(k, String(v))
    }
  }
  appendKids(el, children)
  return el
}
function appendKids(el, kids) {
  for (const c of kids) {
    if (c === null || c === undefined || c === false || c === '') continue
    if (Array.isArray(c)) appendKids(el, c)
    else if (c instanceof Node) el.appendChild(c)
    else el.appendChild(document.createTextNode(String(c)))
  }
}

// ── icons (lucide path data from js/icons.js) ───────────────────────────────
function icon(name, sizeClass) {
  const inner = ICONS[name]
  if (!inner) return document.createTextNode('')
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
  // Parse through a wrapper div so the <svg> subtree gets the SVG namespace
  // (createElement('svg') alone would produce inert HTML-namespace elements).
  const wrap = document.createElement('div')
  wrap.innerHTML =
    `<svg xmlns="http://www.w3.org/2000/svg" class="lucide lucide-${kebab} ${sizeClass || 'ic-4'}" ` +
    `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
  return wrap.firstChild
}

// ── LED ─────────────────────────────────────────────────────────────────────
function LED(tone = 'ok', blink = false, className = '') {
  return h('span', {
    class: 'led led-' + tone + (blink ? ' sw-blink' : '') + (className ? ' ' + className : ''),
    'aria-hidden': true,
  })
}

function SectionLabel(...kids) {
  return h('div', { class: 'section-label' }, ...kids)
}

// ── PanelFrame ──────────────────────────────────────────────────────────────
function PanelFrame(props, ...children) {
  const { code, title, icon: iconEl, desc, right, className = '' } = props
  return h('section', { class: 'panel sw-scan ' + className, 'aria-label': title },
    h('header', { class: 'panel-head' },
      h('span', { class: 'panel-icon' }, iconEl),
      h('div', { class: 'panel-heading' },
        h('div', { class: 'panel-title-row' },
          h('span', { class: 'panel-code' }, code),
          h('h2', { class: 'panel-title' }, title),
        ),
        desc ? h('p', { class: 'panel-desc' }, desc) : null,
      ),
      right || null,
    ),
    h('div', { class: 'panel-body' }, children),
  )
}

// ── PillarBadge ─────────────────────────────────────────────────────────────
function PillarBadge(pillar) {
  return h('span', { class: 'pillar pillar-' + pillar }, PILLAR_LABEL[pillar] ?? pillar)
}

// ── ResultBox (role=status · aria-live=polite) ──────────────────────────────
function ResultBox(pass, ...kids) {
  return h('div', { class: 'result ' + (pass ? 'result-pass' : 'result-hold'), role: 'status', 'aria-live': 'polite' },
    h('span', { class: 'result-mark' }, pass ? '✓ CLEARED — ' : '✗ HOLD — '),
    ...kids,
  )
}

// ── inputs ──────────────────────────────────────────────────────────────────
function SwInput({ value, onChange, placeholder, label, mono = true, className = '', fid }) {
  const input = h('input', {
    type: 'text', class: 'input' + (mono ? ' font-mono' : ''),
    value: value || '', placeholder: placeholder || null, 'data-fid': fid || null,
    oninput: (e) => onChange(e.target.value),
  })
  return h('label', { class: 'field ' + className },
    label ? h('span', { class: 'field-label' }, label) : null,
    input,
  )
}

function SwSelect({ value, onChange, options, label, className = '', placeholder = '— select —', fid }) {
  const sel = h('select', { class: 'input select', 'data-fid': fid || null, onchange: (e) => onChange(e.target.value) },
    h('option', { value: '' }, placeholder),
    options.map((o) => {
      const opt = h('option', { value: o.id }, o.label)
      if (value === o.id) opt.selected = true
      return opt
    }),
  )
  return h('label', { class: 'field ' + className },
    label ? h('span', { class: 'field-label' }, label) : null,
    sel,
  )
}

function SwCheck(opts, ...kids) {
  return h('label', { class: 'check' },
    h('input', {
      type: 'checkbox', checked: opts.checked || null, class: 'check-input',
      'data-fid': opts.fid || null, onchange: (e) => opts.onChange(e.target.checked),
    }),
    h('span', { class: 'check-text' }, ...kids),
  )
}

// ── SparkDots — visualizes connection rhythm ────────────────────────────────
function SparkDots(sessions, intervalSec) {
  if (intervalSec === 0)
    return h('span', { class: 'font-mono text-[10px] c-zinc-600' }, 'no repeating interval')
  const n = Math.min(sessions, 36)
  const dots = []
  for (let i = 0; i < n; i++) dots.push(h('span', { class: 'spark-dot' }))
  return h('span', { class: 'spark', 'aria-label': `${sessions} sessions at ${intervalSec} second intervals` },
    ...dots,
    h('span', { class: 'font-mono text-[10px] c-emerald-500 ml-1' }, `Δ${intervalSec}s`),
  )
}

// ── TrafficStrip (svg timeline) ─────────────────────────────────────────────
function TrafficStrip() {
  const H = 46
  const n = TRAFFIC_STRIP.length
  const w = 720 / n
  const fills = { backup: '#3f6212', exfil: '#9f1239', beacon: '#115e59', noise: '#1c3d33' }
  let bars = ''
  TRAFFIC_STRIP.forEach((b, i) => {
    const bh = (b.v / 100) * H
    bars += `<rect x="${i * w + 3}" y="${H - bh + 6}" width="${w - 6}" height="${bh}" fill="${fills[b.k]}" rx="1"></rect>`
  })
  let labels = ''
  for (let i = 0; i < 12; i++) {
    labels += `<text x="${i * (720 / 12) + 8}" y="57" font-size="9" fill="#71717a" font-family="monospace">${TRAFFIC_STRIP[i] ? TRAFFIC_STRIP[i].t : ''}</text>`
  }
  return h('div', {
    class: 'w-full', role: 'img',
    'aria-label': 'Traffic volume timeline 17:00 to 04:00 with anomalies at 02:00 and 03:00',
    html: `<svg viewBox="0 0 720 60" class="w-full" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="720" height="60" fill="transparent"></rect>${bars}${labels}</svg>`,
  })
}

// ── Gloss — dotted term with hover/focus tooltip ────────────────────────────
function Gloss(t, children) {
  const g = GLOSSARY.find((x) => x.term.toLowerCase() === t.toLowerCase())
  if (!g) return document.createTextNode(children ?? t)
  return h('span', {
    class: 'gloss', tabindex: 0, role: 'button',
    'aria-label': `${g.term}: ${g.def}`,
  },
    children ?? g.term,
    h('span', { class: 'gloss-tip', role: 'tooltip' },
      h('b', { class: 'c-emerald-300' }, g.term + ': '), g.def),
  )
}

// ── StatChip · TagBadge · AuthBadge · HintPill ──────────────────────────────
function StatChip(label, value, tone = 'ok') {
  return h('span', { class: 'stat-chip stat-' + tone },
    h('span', { class: 'c-zinc-500' }, label),
    h('b', {}, value),
  )
}

function TagBadge(tag, benign) {
  return h('span', { class: 'tag-badge ' + (benign ? 'tag-ok' : 'tag-bad') }, tag)
}

function AuthBadge(label, v) {
  const good = v === 'pass'
  const meh = v === 'softfail' || v === 'none'
  return h('span', { class: 'auth-badge ' + (good ? 'auth-good' : meh ? 'auth-meh' : 'auth-bad') }, `${label}=${v.toUpperCase()}`)
}

function HintPill(n) {
  return h('span', { class: 'hint-pill' }, `HINT×${n}`)
}

function Divider() {
  return h('div', { class: 'divider', 'aria-hidden': true })
}
