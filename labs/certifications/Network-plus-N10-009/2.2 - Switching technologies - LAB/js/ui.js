// ============================================================================
// THE FABRIC BENCH — UI helpers (static port of the shadcn/Radix primitives)
// Small, readable builders for the component patterns the lab uses:
// buttons, inputs, selects, switches, checkboxes, badges, tabs and the
// modal dialog (backdrop, zoom-in 200 ms, ESC/backdrop/44px-X close, focus
// trap, scroll lock — Radix Dialog parity).
// ============================================================================

'use strict'

// escape helper for template-built HTML (all content here is lab-owned, but
// we stay disciplined: descriptions are user-editable)
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// lucide inline svg (paths live in icons.js, extracted from lucide-react)
function icon(name, cls) { return lucideIcon(name, cls || '') }

// ---------------------------------------------------------------------------
// dialog manager (Radix Dialog parity)
// ---------------------------------------------------------------------------
const Dialog = (() => {
  let active = null        // { id, el, backdrop, onClose, restoreFocus }
  let openSeq = 0

  function close(invokeCb = true) {
    if (!active) return
    const a = active
    active = null
    document.removeEventListener('keydown', onKey, true)
    document.body.classList.remove('dialog-open')
    a.el.classList.add('dialog-closing')
    a.backdrop.classList.add('dialog-closing')
    setTimeout(() => { a.el.remove(); a.backdrop.remove() }, 200)
    if (a.restoreFocus && a.restoreFocus.isConnected) a.restoreFocus.focus({ preventScroll: true })
    if (invokeCb && a.onClose) a.onClose()
  }

  function onKey(e) {
    if (!active) return
    if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'Tab') {
      // focus trap
      const focusables = active.el.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return
      const list = Array.from(focusables).filter(el => el.offsetParent !== null || el === document.activeElement)
      if (!list.length) return
      const first = list[0], last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  /**
   * open({ id, maxWidth, title, titleIcon, description (html|{sr}), content (node|html),
   *        onClose, labelledByDescription })
   * Returns the panel element. Only one dialog at a time (the lab never stacks).
   */
  function open(opt) {
    if (active) { close(false) }
    const restoreFocus = document.activeElement
    const backdrop = document.createElement('div')
    backdrop.className = 'dialog-backdrop'
    backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) close() })

    const panel = document.createElement('div')
    panel.className = 'dialog-panel'
    panel.style.maxWidth = opt.maxWidth || '32rem'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-modal', 'true')
    panel.setAttribute('aria-labelledby', 'dialog-title-' + openSeq)
    if (opt.description) panel.setAttribute('aria-describedby', 'dialog-desc-' + openSeq)
    panel.dataset.testid = opt.testid || ''

    const descHtml = opt.description
      ? (opt.srDescription
          ? `<p id="dialog-desc-${openSeq}" class="sr-only">${opt.description}</p>`
          : `<p id="dialog-desc-${openSeq}" class="dialog-desc">${opt.description}</p>`)
      : ''

    panel.innerHTML = `
      ${opt.title ? `<div class="dialog-header">
        <h2 id="dialog-title-${openSeq}" class="dialog-title">${opt.titleIcon ? icon(opt.titleIcon, 'ic-20') : ''}<span>${opt.title}</span></h2>
        ${descHtml}
      </div>` : ''}
      <div class="dialog-body"></div>
      <button type="button" class="dialog-close" aria-label="Close">${icon('X', 'ic-16')}<span class="sr-only">Close</span></button>
    `
    const body = panel.querySelector('.dialog-body')
    if (opt.content instanceof Node) body.appendChild(opt.content)
    else if (opt.content) body.innerHTML = opt.content

    panel.querySelector('.dialog-close').addEventListener('click', () => close())
    document.body.appendChild(backdrop)
    document.body.appendChild(panel)
    document.body.classList.add('dialog-open')
    document.addEventListener('keydown', onKey, true)
    active = { el: panel, backdrop, onClose: opt.onClose, restoreFocus }
    // initial focus inside (first focusable) for keyboard users
    requestAnimationFrame(() => {
      const f = panel.querySelector('button:not(.dialog-close), [href], input, select, [tabindex="0"]')
      if (f && restoreFocus === document.body) f.focus({ preventScroll: true })
    })
    openSeq++
    return panel
  }

  return { open, close, get openId() { return active ? active.el.dataset.testid : null } }
})()

// ---------------------------------------------------------------------------
// form primitives (Radix/shadcn look in vanilla)
// ---------------------------------------------------------------------------

// shadcn Switch: near-black track when checked, light track unchecked, white knob
function switchHtml(id, checked, ariaLabel) {
  return `<button type="button" role="switch" id="${esc(id)}" aria-checked="${!!checked}" data-act="switch" ${ariaLabel ? `aria-label="${esc(ariaLabel)}"` : ''} class="fb-switch${checked ? ' on' : ''}"><span class="fb-switch-knob"></span></button>`
}

function selectHtml(id, label, value, options) {
  const opts = options.map(o =>
    `<option value="${esc(o.value)}"${String(o.value) === String(value) ? ' selected' : ''}>${esc(o.label)}</option>`).join('')
  return `<div class="field"><label class="lbl lbl-cap" for="${esc(id)}">${esc(label)}</label>
    <select id="${esc(id)}" class="fb-select" data-fk="${esc(id)}">${opts}</select></div>`
}

// label without control (used above checkbox groups)
function capLabel(text, htmlFor) {
  return `<label class="lbl lbl-cap"${htmlFor ? ` for="${esc(htmlFor)}"` : ''}>${esc(text)}</label>`
}

// radial checkbox used in trunk allowed-lists (native input, amber accent)
function checkHtml(id, checked, labelText, ariaLabel) {
  return `<label class="fb-checkline"><input type="checkbox" id="${esc(id)}" data-fk="${esc(id)}" ${checked ? 'checked' : ''} aria-label="${esc(ariaLabel || labelText)}">${esc(labelText)}</label>`
}

const SEV_COLOR = { info: '#7d8f83', ok: '#4ADE80', warn: '#FBBF24', err: '#F87171' }
const PILLAR_META = {
  P1: { label: 'UNDERSTAND', color: '#C084FC', icon: 'Landmark' },
  P2: { label: 'RECOGNIZE / ANALYZE', color: '#22D3EE', icon: 'Search' },
  P3: { label: 'DETECT / TROUBLESHOOT', color: '#E8A33D', icon: 'Activity' },
  P4: { label: 'MITIGATE / CONFIGURE', color: '#4ADE80', icon: 'Shield' },
}
const PILLAR_LABEL = PILLAR_META
