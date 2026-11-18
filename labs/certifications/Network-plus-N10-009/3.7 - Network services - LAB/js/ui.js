// ===================================================================
// Building B — Service Riser · UI kit
// (js/ui.js — vanilla equivalents of primitives.tsx + Radix dialogs)
//
// Every component mirrors the original lab's primitives: same markup
// roles, same ARIA, same colors, same 44px touch targets.
// ===================================================================
(function () {
  'use strict'

  const D = window.LabData

  // ---------------- tiny element builder ----------------
  function el(tag, attrs) {
    const node = document.createElement(tag)
    if (attrs) {
      for (const k of Object.keys(attrs)) {
        const v = attrs[k]
        if (v === null || v === undefined || v === false) continue
        if (k === 'class') node.className = v
        else if (k === 'value') node.value = v
        else if (k === 'checked') node.checked = true
        else if (k === 'disabled') node.disabled = true
        else if (k === 'style' && typeof v === 'object') {
          for (const p of Object.keys(v)) node.style.setProperty(p, v[p])
        } else node.setAttribute(k, v === true ? '' : v)
      }
    }
    for (let i = 2; i < arguments.length; i++) append(node, arguments[i])
    return node
  }
  function append(node, child) {
    if (child === null || child === undefined || child === false) return
    if (Array.isArray(child)) { child.forEach((c) => append(node, c)); return }
    node.appendChild(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child)
  }

  // ---------------- icons (inline SVG — lucide paths, no CDNs) ----------------
  function iconX() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '2')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('stroke-linejoin', 'round')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('width', '16')
    svg.setAttribute('height', '16')
    const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p1.setAttribute('d', 'M18 6 6 18')
    const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p2.setAttribute('d', 'm6 6 12 12')
    svg.appendChild(p1); svg.appendChild(p2)
    return svg
  }

  // ---------------- tiny atoms ----------------
  function led(hue, state) {
    const span = el('span', { class: 'led', 'aria-hidden': 'true' })
    if (state === 'done') {
      span.style.backgroundColor = '#2F5D3A'
      span.style.boxShadow = '0 0 6px 1px rgba(47,93,58,.8)'
    } else if (state === 'open') {
      span.style.backgroundColor = hue
      span.style.boxShadow = '0 0 8px 2px ' + hue + '55'
      span.style.animation = 'labPulse 2.2s ease-in-out infinite'
    } else {
      span.style.backgroundColor = '#4b463c'
    }
    return span
  }

  function pillarBadge(pillar) {
    const m = D.PILLAR_META[pillar]
    return el('span', { title: m.label, class: 'pillar-badge' },
      m.letter,
      el('span', { class: 'sr-only' }, m.label))
  }

  function stars(n, of) {
    of = of || 5
    return el('span', { class: 'stars', 'aria-label': n + ' of ' + of + ' stars' },
      '★'.repeat(n),
      el('span', { class: 'stars-dim' }, '★'.repeat(Math.max(0, of - n))))
  }

  function progressRing(done, total) {
    const pct = total === 0 ? 0 : done / total
    const r = 13
    const c = 2 * Math.PI * r
    const dash = (c * pct).toFixed(4)
    const span = el('span', { class: 'ring', role: 'img', 'aria-label': 'Punch list ' + done + ' of ' + total + ' complete' })
    span.innerHTML =
      '<svg viewBox="0 0 32 32" class="ring-svg" aria-hidden="true">' +
      '<circle cx="16" cy="16" r="' + r + '" fill="none" stroke="#4b463c" stroke-width="3"></circle>' +
      '<circle cx="16" cy="16" r="' + r + '" fill="none" stroke="#C89B3C" stroke-width="3" stroke-dasharray="' + dash + ' ' + c + '" stroke-linecap="round"></circle>' +
      '</svg>' +
      '<span class="ring-count">' + (total === 0 ? '—' : String(done)) + '</span>'
    return span
  }

  // ---------------- primitives ----------------
  function bench(opts) {
    const section = el('section', { id: 'bench-' + opts.id, class: 'bench', 'aria-labelledby': 'bench-' + opts.id + '-h' })
    const head = el('div', { class: 'bench-head' },
      el('span', { class: 'bench-swatch', 'aria-hidden': 'true' }),
      el('h3', { id: 'bench-' + opts.id + '-h', class: 'bench-title' }, opts.title),
      opts.kicker ? el('span', { class: 'bench-kicker' }, opts.kicker) : null)
    head.querySelector('.bench-swatch').style.background = opts.hue
    section.appendChild(head)
    const body = el('div', { class: 'bench-body' })
    append(body, opts.children)
    section.appendChild(body)
    return section
  }

  function field(opts) {
    const input = el('input', {
      type: 'text',
      class: 'control-input' + (opts.mono === false ? '' : ' is-mono'),
      value: opts.value || '',
      placeholder: opts.placeholder || null,
      disabled: opts.disabled === true,
      'data-fkey': opts.fkey || null,
      autocomplete: 'off',
      spellcheck: 'false',
    })
    input.addEventListener('input', () => { if (opts.onInput) opts.onInput(input.value) })
    return el('label', { class: 'control-field' },
      el('span', { class: 'control-label' }, opts.label),
      input)
  }

  function selectField(opts) {
    const select = el('select', {
      class: 'control-input control-select',
      disabled: opts.disabled === true,
      'data-fkey': opts.fkey || null,
    })
    select.appendChild(el('option', { value: '' }, opts.placeholder || '— select —'))
    ;(opts.options || []).forEach((o) => {
      const opt = el('option', { value: o.id }, o.label)
      if (opts.value === o.id) opt.selected = true
      select.appendChild(opt)
    })
    select.addEventListener('change', () => { if (opts.onChange) opts.onChange(select.value) })
    return el('label', { class: 'control-field' },
      el('span', { class: 'control-label' }, opts.label),
      select)
  }

  function toggle(opts) {
    const knob = el('span', { class: 'toggle-knob', 'aria-hidden': 'true' })
    const track = el('span', { class: 'toggle-track', 'aria-hidden': 'true' }, knob)
    const btn = el('button', {
      type: 'button',
      role: 'switch',
      'aria-checked': opts.checked === true ? 'true' : 'false',
      class: 'toggle',
      'data-k': opts.k || null,
    },
      el('span', null,
        opts.label,
        opts.hint ? el('span', { class: 'toggle-hint' }, opts.hint) : null),
      track)
    function paint() {
      const on = btn.getAttribute('aria-checked') === 'true'
      btn.style.borderColor = on ? '#2F5D3A' : 'rgba(38,34,25,0.2)'
      track.style.background = on ? '#2F5D3A' : '#D8D0BC'
      knob.style.left = on ? '22px' : '3px'
    }
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-checked') !== 'true'
      btn.setAttribute('aria-checked', on ? 'true' : 'false')
      paint()
      opts.onChange(on)
    })
    paint()
    return btn
  }

  function monoLog(opts) {
    const wrap = el('div', { class: 'mono-log', 'aria-label': opts.title || 'console output' })
    if (opts.title) wrap.appendChild(el('div', { class: 'mono-log-title' }, 'TRAINING DATA · ' + opts.title))
    const pre = el('pre', { class: 'mono-log-pre' }, (opts.lines || []).join('\n'))
    wrap.appendChild(pre)
    return wrap
  }

  function seqTray(opts) {
    const wrap = el('div', { role: 'group', 'aria-label': opts.ariaLabel, class: 'seq-tray' })
    const ol = el('ol', { class: 'seq-list', 'aria-label': 'Ordered steps' })
    ;(opts.order || []).forEach((oid, idx) => {
      const it = opts.items.find((i) => i.id === oid)
      if (!it) return
      const li = el('li', { class: 'seq-row' },
        el('span', { class: 'seq-num', 'aria-hidden': 'true' }, String(idx + 1)),
        el('div', { class: 'seq-card' },
          el('div', { class: 'seq-label' }, it.label),
          it.note ? el('div', { class: 'seq-note' }, it.note) : null))
      const rm = el('button', {
        type: 'button', class: 'btn-remove',
        'aria-label': 'Remove step ' + (idx + 1) + ': ' + it.label,
        'data-k': (opts.k || 'seq') + '-rm-' + oid,
      }, '✕')
      rm.addEventListener('click', () => opts.onOrder(opts.order.filter((x) => x !== oid)))
      li.appendChild(rm)
      ol.appendChild(li)
    })
    if (!opts.order || opts.order.length === 0) {
      ol.appendChild(el('li', { class: 'seq-empty' }, 'Empty — add steps from the tray below in the right order.'))
    }
    wrap.appendChild(ol)
    const remaining = opts.items.filter((i) => !(opts.order || []).includes(i.id))
    if (remaining.length > 0) {
      const pool = el('div', { class: 'seq-pool' })
      remaining.forEach((it) => {
        const b = el('button', { type: 'button', class: 'btn-chip', 'data-k': (opts.k || 'seq') + '-add-' + it.id }, it.label)
        b.addEventListener('click', () => opts.onOrder(opts.order.concat([it.id])))
        pool.appendChild(b)
      })
      wrap.appendChild(pool)
    }
    return wrap
  }

  function statusLine(tone) {
    const color = tone === 'ok' ? '#2F5D3A' : tone === 'bad' ? '#8C2F2F' : 'rgba(38,34,25,0.6)'
    const p = el('p', { role: 'status', 'aria-live': 'polite', class: 'status-line' })
    for (let i = 1; i < arguments.length; i++) append(p, arguments[i])
    p.style.borderColor = color
    return p
  }

  // ---------------- objective check block ----------------
  function objectiveCheck(lab, id) {
    let def = null
    for (const o of D.OBJECTIVES) if (o.id === id) { def = o; break }
    if (!def || !lab.state().mode) return el('div')
    const res = lab.state().results[id]
    const hintsShown = res ? res.hints : 0
    const maxHints = def.hints.length
    const hard = def.mode === 'hard'

    const wrap = el('div', { class: 'obj-check' })

    const head = el('div', { class: 'obj-check-head' },
      pillarBadge(def.pillar),
      el('p', { class: 'obj-check-title' }, def.title))
    if (res && res.done) head.appendChild(el('span', { class: 'obj-passed-chip' }, 'passed'))
    wrap.appendChild(head)

    if (hard && !res) {
      wrap.appendChild(el('p', { class: 'obj-night-note' },
        'Night shift: re-read the evidence before you check — near-misses are rejected with a rationale.'))
    }
    if ((!res || !res.done) && !hard) {
      wrap.appendChild(el('p', { class: 'obj-context' }, def.context))
    }

    if (hintsShown > 0) {
      const hints = el('div', { class: 'obj-hints', 'aria-label': 'hints' })
      def.hints.slice(0, hintsShown).forEach((h, i) => {
        hints.appendChild(el('p', { class: 'obj-hint' },
          el('span', { class: 'obj-hint-label' }, 'Hint ' + (i + 1) + ': '), h))
      })
      wrap.appendChild(hints)
    }

    const actions = el('div', { class: 'obj-actions' })
    const checkBtn = el('button', {
      type: 'button',
      class: 'btn btn-primary obj-check-btn' + (res && res.done ? ' is-done' : ''),
      'data-k': 'check-' + id,
    }, res && res.done ? 'Re-check' : 'Check result')
    checkBtn.addEventListener('click', () => lab.check(id))
    actions.appendChild(checkBtn)
    if (!(res && res.done) && hintsShown < maxHints) {
      const hintBtn = el('button', { type: 'button', class: 'btn-hint', 'data-k': 'hint-' + id },
        hard ? 'Use nudge (−score)' : 'Reveal hint ' + (hintsShown + 1) + '/' + maxHints)
      hintBtn.addEventListener('click', () => lab.hint(id))
      actions.appendChild(hintBtn)
    }
    if (hard && hintsShown >= maxHints && !(res && res.done)) {
      actions.appendChild(el('span', { class: 'obj-nudge-used' }, 'nudge used — it costs score'))
    }
    wrap.appendChild(actions)

    if (res && (res.attempts > 0 || res.done)) {
      const fb = el('div', { role: 'status', 'aria-live': 'polite', class: 'obj-feedback ' + (res.done ? 'is-ok' : 'is-bad') },
        el('span', { class: 'obj-feedback-lead' }, res.done ? 'Check passed. ' : 'Not yet. '),
        res.done ? def.success : def.failure)
      wrap.appendChild(fb)
    }
    return wrap
  }

  // ---------------- focus capture / restore across re-renders ----------------
  function captureFocus() {
    const ae = document.activeElement
    if (!ae || !ae.getAttribute) return null
    const fkey = ae.getAttribute('data-fkey') || ae.getAttribute('data-k')
    if (!fkey) return null
    const isText = ae.tagName === 'INPUT' && ae.type === 'text'
    return {
      fkey,
      isText,
      start: isText ? ae.selectionStart : null,
      end: isText ? ae.selectionEnd : null,
    }
  }
  function restoreFocus(cap) {
    if (!cap) return
    const nu = document.querySelector('[data-fkey="' + cap.fkey + '"], [data-k="' + cap.fkey + '"]')
    if (!nu) return
    try { nu.focus({ preventScroll: true }) } catch (err) { /* older engines */ }
    if (cap.isText && nu.setSelectionRange && cap.start !== null && cap.start !== undefined) {
      try { nu.setSelectionRange(cap.start, cap.end) } catch (err) { /* non-text */ }
    }
  }

  // ---------------- accessible dialog (Radix replacement) ----------------
  let dlg = null // { overlay, panel, opener, onClose, keyHandler }

  function isDialogOpen() { return dlg !== null }

  function openDialog(opts) {
    if (dlg) closeDialog()
    const opener = document.activeElement

    const overlay = el('div', { class: 'dlg-overlay' })
    const panel = el('div', {
      class: 'dlg-panel' + (opts.width ? ' dlg-' + opts.width : '') + (opts.scrollable ? ' dlg-scrollable' : ''),
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'dlg-title',
    })

    const closeBtn = el('button', { type: 'button', class: 'dlg-close', 'aria-label': 'Close' })
    closeBtn.appendChild(iconX())
    panel.appendChild(closeBtn)

    const header = el('div', { class: 'dlg-header' },
      el('h2', { id: 'dlg-title', class: 'dlg-title' }, opts.title),
      opts.description ? el('p', { class: 'dlg-desc' }, opts.description) : null)
    panel.appendChild(header)

    opts.build(panel)

    function close() {
      if (!dlg) return
      document.removeEventListener('keydown', dlg.keyHandler)
      overlay.remove()
      panel.remove()
      document.body.classList.remove('modal-open')
      const cb = dlg.onClose
      const op = dlg.opener
      dlg = null
      if (op && op.isConnected) { try { op.focus({ preventScroll: true }) } catch (err) { /* noop */ } }
      if (cb) cb()
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'Tab') {
        const focusables = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        const list = []
        focusables.forEach((f) => { if (!f.disabled) list.push(f) })
        if (list.length === 0) return
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    closeBtn.addEventListener('click', close)
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close() })
    document.addEventListener('keydown', onKey)

    document.body.appendChild(overlay)
    document.body.appendChild(panel)
    document.body.classList.add('modal-open')

    dlg = { overlay, panel, opener, onClose: opts.onClose, keyHandler: onKey, close }

    // initial focus: first focusable control, else the panel itself
    const focusables = panel.querySelectorAll('button, [href], input, select, textarea')
    let target = null
    focusables.forEach((f) => { if (!target && !f.disabled && !f.classList.contains('dlg-close')) target = f })
    if (target) target.focus({ preventScroll: true })
    else { panel.setAttribute('tabindex', '-1'); panel.focus({ preventScroll: true }) }
  }

  function closeDialog() { if (dlg) dlg.close() }

  // export
  window.LabUI = {
    el, append, iconX,
    led, pillarBadge, stars, progressRing,
    bench, field, selectField, toggle, monoLog, seqTray, statusLine,
    objectiveCheck,
    captureFocus, restoreFocus,
    openDialog, closeDialog, isDialogOpen,
  }
})()
