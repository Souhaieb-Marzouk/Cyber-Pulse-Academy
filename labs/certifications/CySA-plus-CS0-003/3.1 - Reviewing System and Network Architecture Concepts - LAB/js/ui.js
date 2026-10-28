// ─── CyberLab "Drafting Room" — shared UI primitives (js/ui.js) ──────────────
// Vanilla reimplementations of the original lab's shadcn/ui + Radix widgets:
// h() DOM builder, accessible LabSelect (listbox), Popover/TermTip,
// AnswerChoice, SectionTitle, PillarBadge, ProgressBar, toasts, modals,
// tabs, switch, checkbox. Behavior, ARIA and styling hooks mirror the
// original 1:1; markup internals are implementation details.

// ── DOM builder ───────────────────────────────────────────────────────────────
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag)
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue
      if (k === 'class') el.className = v
      else if (k === 'html') el.innerHTML = v // trusted: inline icon markup only
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v)
      else if (k === 'dataset') Object.assign(el.dataset, v)
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v)
      else if (v === true) el.setAttribute(k, '')
      else el.setAttribute(k, v)
    }
  }
  appendKids(el, kids)
  return el
}
function appendKids(el, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)))
  }
}

// ── Floating layer (one open popover/menu at a time) ─────────────────────────
const Floating = {
  current: null, // { el, anchor, close }
  open(el, close, anchor) {
    this.close()
    this.current = { el, anchor, close }
    document.body.appendChild(el)
  },
  close() {
    if (this.current) {
      const c = this.current
      this.current = null
      c.close()
    }
  },
}
document.addEventListener(
  'pointerdown',
  (e) => {
    if (!Floating.current) return
    const t = e.target
    if (Floating.current.el.contains(t) || Floating.current.anchor?.contains(t)) return
    Floating.close()
  },
  true,
)
document.addEventListener(
  'keydown',
  (e) => {
    if (e.key === 'Escape' && Floating.current) Floating.close()
  },
  true,
)
window.addEventListener(
  'scroll',
  (e) => {
    if (Floating.current && !Floating.current.el.contains(e.target)) Floating.close()
  },
  true,
)
window.addEventListener('resize', () => Floating.close())

// position a fixed floating card below (or above) its anchor, viewport-clamped
function placeFloating(card, anchor, width) {
  if (!card || !anchor) return
  const r = anchor.getBoundingClientRect()
  card.style.visibility = 'hidden'
  requestAnimationFrame(() => {
    if (!card.isConnected) return
    const w = width ?? card.offsetWidth
    const mh = card.offsetHeight
    let left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8)
    let top = r.bottom + 4
    if (top + mh > window.innerHeight - 8 && r.top - mh - 4 > 8) top = r.top - mh - 4
    card.style.left = left + 'px'
    card.style.top = top + 'px'
    if (width) card.style.width = width + 'px'
    card.style.visibility = ''
  })
}

// ── LabSelect — accessible single select (Radix Select parity) ───────────────
function LabSelect(opts) {
  const placeholder = opts.placeholder ?? 'Select…'
  const NONE = '__none__'
  let value = opts.value ?? NONE
  let open = false
  let menu = null
  let buttons = []

  const valueSpan = h('span', { class: 'lab-select-value' })
  const chev = h('span', { class: 'lab-select-chev', html: labIcon('chevronDown') })
  const trigger = h(
    'button',
    {
      type: 'button',
      class: 'lab-select-trigger ' + (opts.triggerClass || ''),
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false',
      'aria-label': opts.ariaLabel || undefined,
    },
    valueSpan,
    chev,
  )
  if (opts.disabled) trigger.disabled = true

  const labelOf = (v) => {
    if (v === NONE) return placeholder
    return opts.options.find((x) => x.id === v)?.label ?? placeholder
  }
  const syncTrigger = () => {
    valueSpan.textContent = labelOf(value)
    valueSpan.classList.toggle('is-placeholder', value === NONE)
  }
  syncTrigger()

  function setActive(i, focus) {
    buttons.forEach((b, j) => b.classList.toggle('is-active', j === i))
    if (focus && buttons[i]) buttons[i].focus()
  }

  function buildMenu() {
    menu = h('div', {
      class: 'lab-select-menu ' + (opts.contentClass || ''),
      role: 'listbox',
      tabindex: '-1',
    })
    buttons = opts.options.map((o, i) => {
      const b = h(
        'button',
        {
          type: 'button',
          role: 'option',
          class: 'lab-select-item ' + (opts.itemClass || ''),
          'aria-selected': o.id === value ? 'true' : 'false',
          tabindex: '-1',
          dataset: { id: o.id },
        },
        o.label,
      )
      b.addEventListener('click', () => pick(o.id))
      b.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i + 1) % buttons.length, true) }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i - 1 + buttons.length) % buttons.length, true) }
        else if (e.key === 'Home') { e.preventDefault(); setActive(0, true) }
        else if (e.key === 'End') { e.preventDefault(); setActive(buttons.length - 1, true) }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(opts.options[i].id) }
        else if (e.key === 'Tab') { closeMenu(false) }
        else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const from = (i + 1) % buttons.length
          for (let step = 0; step < buttons.length; step++) {
            const j = (from + step) % buttons.length
            if (opts.options[j].label.toLowerCase().startsWith(e.key.toLowerCase())) { setActive(j, true); break }
          }
        }
      })
      return b
    })
    menu.append(...buttons)
    return buttons
  }

  function openMenu() {
    if (open || trigger.disabled) return
    open = true
    trigger.setAttribute('aria-expanded', 'true')
    buttons = buildMenu()
    Floating.open(menu, () => closeMenu(false), trigger)
    placeFloating(menu, trigger)
    const cur = opts.options.findIndex((o) => o.id === value)
    setActive(cur >= 0 ? cur : 0, true)
  }
  function closeMenu(refocus) {
    if (!open) return
    open = false
    trigger.setAttribute('aria-expanded', 'false')
    // release Floating ownership first so a stale close can never null a fresh menu
    if (Floating.current && Floating.current.el === menu) Floating.current = null
    menu?.remove()
    menu = null
    buttons = []
    if (refocus) trigger.focus()
  }
  function pick(id) {
    const changed = id !== value
    value = id
    syncTrigger()
    closeMenu(true)
    if (changed && opts.onChange) opts.onChange(id)
  }

  trigger.addEventListener('click', () => (open ? closeMenu(true) : openMenu()))
  trigger.addEventListener('keydown', (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      openMenu()
    }
  })

  return {
    el: trigger,
    get value() { return value === NONE ? null : value },
    setDisabled(d) {
      trigger.disabled = !!d
      if (open && trigger.disabled) closeMenu(false)
    },
    setValue(v) {
      const nv = v ?? NONE
      if (nv === value) return
      value = nv
      syncTrigger()
      if (menu) {
        buttons.forEach((b, i) =>
          b.setAttribute('aria-selected', opts.options[i]?.id === value ? 'true' : 'false'),
        )
      }
    },
  }
}

// ── Popover (floating card on click; Esc / outside / scroll closes) ──────────
function Popover(opts) {
  const trigger = opts.trigger
  let card = null
  trigger.setAttribute('aria-expanded', 'false')
  trigger.addEventListener('click', () => {
    if (card) { close(); return }
    card = h(
      'div',
      { class: 'lab-popover ' + (opts.cardClass || ''), role: 'dialog', 'aria-label': opts.ariaLabel || 'Details' },
      opts.renderCard(),
    )
    Floating.open(card, close, trigger)
    placeFloating(card, trigger, opts.width ?? 288)
  })
  function close() {
    card?.remove()
    card = null
    trigger.setAttribute('aria-expanded', 'false')
  }
  return trigger
}

function glossaryCard(term) {
  return h(
    'div',
    null,
    h('p', { class: 'glossary-kicker' }, 'Glossary'),
    h('p', { class: 'glossary-term' }, term.term),
    h('p', { class: 'glossary-def' }, term.def),
  )
}

/** Inline glossary term — dotted amber underline, click/focus for definition. */
function TermTip(id, label) {
  const term = GLOSSARY.find((g) => g.id === id)
  if (!term) return document.createTextNode(label ?? id)
  const trigger = h(
    'button',
    { type: 'button', class: 'term-tip', 'aria-label': `${term.term} — definition available` },
    label ?? term.term,
  )
  Popover({ trigger, ariaLabel: `Glossary — ${term.term}`, renderCard: () => glossaryCard(term) })
  return trigger
}

// ── AnswerChoice — labeled select / exact-text input (answers[key]) ──────────
function AnswerChoice(opts) {
  const wrap = h('div', { class: 'answer-choice' })
  wrap.append(h('label', { class: 'answer-choice-prompt' }, opts.prompt))
  if (!opts.options || opts.options.length === 0) {
    const input = h('input', {
      type: 'text',
      class: 'answer-input',
      placeholder: 'Type exactly…',
      'aria-label': opts.prompt,
      spellcheck: 'false',
      autocomplete: 'off',
    })
    if (opts.disabled) input.disabled = true
    input.value = opts.value ?? ''
    input.addEventListener('input', () => opts.onChange(input.value))
    wrap.append(input)
    return {
      el: wrap,
      refresh(v) {
        if (document.activeElement !== input) input.value = v ?? ''
      },
      setDisabled(d) {
        input.disabled = !!d
      },
    }
  }
  const sel = LabSelect({
    value: opts.value,
    onChange: opts.onChange,
    options: opts.options,
    placeholder: opts.placeholder ?? 'Select…',
    ariaLabel: opts.prompt,
    disabled: opts.disabled,
    triggerClass: 'answer-choice-trigger',
    contentClass: 'answer-choice-content',
    itemClass: 'answer-choice-item',
  })
  wrap.append(sel.el)
  return { el: wrap, refresh: (v) => sel.setValue(v), select: sel, setDisabled: (d) => sel.setDisabled(d) }
}

// ── Small shared bits ─────────────────────────────────────────────────────────
function SectionTitle(code, title, desc) {
  return h(
    'div',
    { class: 'section-title' },
    h('p', { class: 'section-code' }, code),
    h('h2', { class: 'section-heading' }, title),
    desc ? h('p', { class: 'section-desc' }, desc) : null,
  )
}

const PILLAR_CLASS = { P1: 'pillar-p1', P2: 'pillar-p2', P3: 'pillar-p3', P4: 'pillar-p4' }
function PillarBadge(pillar) {
  const meta = PILLAR_META[pillar]
  return h(
    'span',
    { class: 'pillar-badge ' + PILLAR_CLASS[pillar], title: `Mastery pillar: ${meta.label}` },
    `${pillar} · ${meta.label}`,
  )
}

function PassFailIcon(pass) {
  return h('span', { class: 'pf-icon ' + (pass ? 'pf-pass' : 'pf-fail'), html: labIcon(pass ? 'checkCircle2' : 'xCircle') })
}

function ProgressBar(value, ariaHidden) {
  const fill = h('div', { class: 'progress-fill' })
  const el = h(
    'div',
    { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100' },
    fill,
  )
  if (ariaHidden) el.setAttribute('aria-hidden', 'true')
  const set = (v) => {
    const w = Math.max(0, Math.min(100, v ?? 0))
    fill.style.width = w + '%'
    if (!ariaHidden) el.setAttribute('aria-valuenow', String(Math.round(w)))
  }
  set(value)
  return { el, set }
}

// ── Tabs (Radix tabs parity: arrows move selection) ──────────────────────────
function TabsNav(opts) {
  // opts: { items: [{id,label}], value, onChange, ariaLabel, listClass, tabClass }
  let value = opts.value
  const list = h('div', { class: 'tabs-list ' + (opts.listClass || ''), role: 'tablist', 'aria-label': opts.ariaLabel })
  const tabs = opts.items.map((it) => {
    const b = h(
      'button',
      { type: 'button', role: 'tab', class: 'tab-trigger ' + (opts.tabClass || ''), dataset: { id: it.id } },
      it.label,
    )
    b.addEventListener('click', () => set(it.id))
    b.addEventListener('keydown', (e) => {
      const ids = opts.items.map((x) => x.id)
      let i = ids.indexOf(value)
      if (e.key === 'ArrowRight') i = (i + 1) % ids.length
      else if (e.key === 'ArrowLeft') i = (i - 1 + ids.length) % ids.length
      else if (e.key === 'Home') i = 0
      else if (e.key === 'End') i = ids.length - 1
      else return
      e.preventDefault()
      set(ids[i])
      tabs[i].focus()
    })
    return b
  })
  list.append(...tabs)
  function set(id) {
    value = id
    tabs.forEach((t) => {
      const on = t.dataset.id === id
      t.setAttribute('aria-selected', on ? 'true' : 'false')
      t.tabIndex = on ? 0 : -1
      t.classList.toggle('is-active', on)
    })
    if (opts.onChange) opts.onChange(id)
  }
  set(value)
  return { el: list, set }
}

// ── Switch (Radix switch parity) ─────────────────────────────────────────────
function LabSwitch(opts) {
  // opts: { checked, onToggle(checked), ariaLabel }
  const thumb = h('span', { class: 'lab-switch-thumb' })
  const el = h(
    'button',
    { type: 'button', class: 'lab-switch', role: 'switch', 'aria-checked': opts.checked ? 'true' : 'false' },
    thumb,
  )
  if (opts.ariaLabel) el.setAttribute('aria-label', opts.ariaLabel)
  el.addEventListener('click', () => {
    const next = el.getAttribute('aria-checked') !== 'true'
    el.setAttribute('aria-checked', next ? 'true' : 'false')
    opts.onToggle(next)
  })
  return {
    el,
    set(on) {
      el.setAttribute('aria-checked', on ? 'true' : 'false')
    },
    setDisabled(d) {
      el.disabled = !!d
    },
  }
}

// ── Toasts (shadcn toaster parity: bottom-right on desktop, top on mobile) ──
let toastViewport = null
function ensureToastViewport() {
  if (!toastViewport) {
    toastViewport = h('div', { class: 'toast-viewport', 'aria-label': 'Notifications' })
    document.body.appendChild(toastViewport)
  }
}
function toast(t) {
  ensureToastViewport()
  const close = h('button', { type: 'button', class: 'toast-close', 'aria-label': 'Dismiss notification', html: labIcon('x') })
  const item = h(
    'div',
    { class: 'toast', role: 'status' },
    h('div', { class: 'toast-body' },
      t.title ? h('p', { class: 'toast-title' }, t.title) : null,
      t.description ? h('p', { class: 'toast-desc' }, t.description) : null,
    ),
    close,
  )
  const kill = () => item.remove()
  close.addEventListener('click', kill)
  item.addEventListener('click', kill)
  toastViewport.prepend(item)
  setTimeout(kill, 5000)
}

// ── Modal dialog (overlay + focus trap; parity of Radix dialog behavior) ────
function Modal(opts) {
  // opts: { onClose, closeOnEsc = true, boxClass }
  const opener = document.activeElement
  const overlay = h('div', { class: 'modal-overlay' })
  const box = h('div', { class: 'modal-box ' + (opts.boxClass || ''), role: 'dialog', 'aria-modal': 'true' })
  overlay.appendChild(box)
  overlay.addEventListener('pointerdown', (e) => {
    if (e.target === overlay && opts.closeOnOverlay !== false) api.close()
  })
  const api = {
    box,
    close() {
      document.removeEventListener('keydown', onKey, true)
      overlay.classList.add('is-closing')
      setTimeout(() => overlay.remove(), 150)
      if (opener && opener.focus) opener.focus()
      opts.onClose && opts.onClose()
    },
  }
  function onKey(e) {
    if (e.key === 'Escape') {
      if (opts.closeOnEsc !== false) { e.preventDefault(); api.close() }
      return
    }
    if (e.key !== 'Tab') return
    const focusables = box.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
  document.addEventListener('keydown', onKey, true)
  document.body.appendChild(overlay)
  requestAnimationFrame(() => {
    const f = box.querySelector('[data-autofocus]') || box.querySelector('button, input, [tabindex]:not([tabindex="-1"])')
    f && f.focus()
  })
  return api
}

Object.assign(globalThis, {
  h, Floating, placeFloating, LabSelect, Popover, glossaryCard, TermTip,
  AnswerChoice, SectionTitle, PILLAR_CLASS, PillarBadge, PassFailIcon,
  ProgressBar, TabsNav, LabSwitch, toast, Modal,
})
