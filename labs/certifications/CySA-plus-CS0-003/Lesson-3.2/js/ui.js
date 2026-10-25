// ─── The Access Bureau — shared UI primitives & controls (vanilla) ───────────
// Vanilla re-creation of the shadcn/Radix pieces the lab uses, with the same
// look, the same ARIA wiring and the same keyboard behavior:
//   Dialog / AlertDialog (focus trap, Esc, overlay click for Dialog only)
//   Sheet (left drawer) · Select (listbox + typeahead) · Slider (pointer+keys)
//   Switch · Checkbox · RadioGroup (roving tabindex) · Button variants
//   BureauCard · PillarBadge · VerifiedChip · CheckStamp · ChoiceRow ·
//   FlagToggle · LedgerViewer · Term

(function () {
  'use strict'

  // ── tiny DOM helper ──────────────────────────────────────────────────────────
  function el(tag, attrs) {
    var node = document.createElement(tag)
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k]
        if (v === null || v === undefined || v === false) return
        if (k === 'class') node.className = v
        else if (k === 'html') node.innerHTML = v
        else if (k === 'text') node.textContent = v
        else if (k === 'value') node.value = v
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v)
        else node.setAttribute(k, v === true ? '' : v)
      })
    }
    for (var i = 2; i < arguments.length; i++) appendChild(node, arguments[i])
    return node
  }
  function appendChild(parent, child) {
    if (child === null || child === undefined || child === false) return
    if (Array.isArray(child)) { child.forEach(function (c) { appendChild(parent, c) }); return }
    parent.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
  }

  // ── icons (exact Lucide path data, see js/icons.js) ─────────────────────────
  function icon(name, size, cls) {
    size = size || 16
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + size +
      '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" class="' + (cls || '') + '" aria-hidden="true" focusable="false">' +
      (ICONS[name] || '') + '</svg>'
  }

  // ── buttons ─────────────────────────────────────────────────────────────────
  function btn(variant, size, className, html, attrs) {
    var cls = 'btn btn-' + (variant || 'default')
    if (size) cls += ' btn-' + size
    if (className) cls += ' ' + className
    var a = Object.assign({ type: 'button', class: cls, html: html }, attrs || {})
    return el('button', a)
  }

  // ── paper card ───────────────────────────────────────────────────────────────
  function BureauCard(opts, children) {
    var head = el('header', { class: 'bureau-card-head' })
    if (opts.icon) head.appendChild(el('span', { class: 'bureau-card-icon', html: opts.icon }))
    head.appendChild(el('h3', { class: 'bureau-card-title', text: opts.title }))
    if (opts.ref_) head.appendChild(el('span', { class: 'badge badge-outline bureau-card-ref', text: opts.ref_ }))
    if (opts.subtitle) head.appendChild(el('p', { class: 'bureau-card-subtitle', text: opts.subtitle }))
    var body = el('div', { class: 'bureau-card-body' }, children)
    return el('section', { class: 'bureau-card' + (opts.className ? ' ' + opts.className : ''), 'aria-label': opts.title }, head, body)
  }

  // ── pillar badge / verified chip / term ─────────────────────────────────────
  var PILLAR_LABEL = { U: 'Understand', R: 'Recognize', D: 'Detect', M: 'Mitigate' }
  var PILLAR_CLASS = { U: 'pillar-U', R: 'pillar-R', D: 'pillar-D', M: 'pillar-M' }
  function PillarBadge(pillar) {
    return el('span', {
      class: 'pillar-badge ' + PILLAR_CLASS[pillar],
      title: 'Mastery pillar: ' + PILLAR_LABEL[pillar],
      text: pillar + ' · ' + PILLAR_LABEL[pillar],
    })
  }
  function VerifiedChip() {
    return el('span', { class: 'verified-chip', html: icon('Check', 12) + ' stamped' })
  }
  function Term(text, def) {
    return el('abbr', { class: 'term', title: def, text: text, tabindex: '0' })
  }

  // ── the stamp engine (CHECK RESULTS) ────────────────────────────────────────
  function CheckStamp(objectiveId) {
    var obj = objectiveById(objectiveId)
    var check = BureauChecks.CHECKS[objectiveId]
    var live = el('div', { class: 'sr-only', 'aria-live': 'assertive' })
    var stampArea = el('div', {})
    var noteArea = el('div', {})
    var attempts = el('span', { class: 'stamp-attempts font-mono' })

    var stampBtn = btn('default', null, 'btn-stamp',
      icon('Stamp', 16, 'mr-icon') + '<span class="stamp-label">STAMP THIS TICKET</span>',
      { 'aria-label': 'Stamp ticket ' + objectiveId })

    var row = el('div', { class: 'stamp-row' }, stampBtn, attempts)
    var root = el('div', { class: 'check-stamp', 'data-testid': 'check-' + objectiveId }, row, live, stampArea, noteArea)

    function paint(result) {
      var s = LabStore.getState()
      var mode = s.mode
      var ticket = s.tickets[objectiveId]
      var completed = !!(ticket && ticket.completed)
      var stamp = completed || (result && result.pass)

      stampBtn.disabled = completed
      stampBtn.querySelector('.stamp-label').textContent = completed ? 'TICKET STAMPED' : 'STAMP THIS TICKET'
      attempts.className = 'stamp-attempts font-mono' + (mode === 'medium' ? '' : ' hidden')
      attempts.textContent = mode === 'medium' ? 'attempts: ' + (ticket ? ticket.attempts : 0) : ''

      stampArea.innerHTML = ''
      if (stamp) {
        stampArea.appendChild(el('div', {
          class: 'stamp-anim stamp-verified',
          text: 'Verified',
          key: completed ? 'done' : 'r',
        }))
      } else if (result && !result.pass) {
        stampArea.appendChild(el('div', { class: 'stamp-anim stamp-denied', text: 'Denied' }))
      }

      live.textContent = result ? (result.pass ? 'Ticket ' + objectiveId + ' verified' : 'Ticket ' + objectiveId + ' returned for revision') : ''

      noteArea.innerHTML = ''
      if (completed || result) {
        var feedback = completed ? obj.passFeedback : (result && result.pass ? obj.passFeedback : obj.failFeedback)
        noteArea.appendChild(el('p', { class: 'bureau-note' },
          el('strong', { class: 'font-serif', text: 'Bureau note — ' }),
          feedback))
      }
    }

    stampBtn.addEventListener('click', function () {
      var r = check(LabStore.getState())
      LabStore.recordCheck(objectiveId, r.pass)
      paint(r)
    })

    paint(null)
    return root
  }

  // ── Select (listbox w/ keyboard + typeahead) ────────────────────────────────
  var selectSeq = 0
  function Select(opts) {
    // opts: value, options[{id,text}], onChange(v), ariaLabel, placeholder, triggerClass, contentClass
    var uid = 'sel-' + (++selectSeq)
    var value = opts.value || ''
    var placeholder = opts.placeholder || '— select —'
    var current = null
    opts.options.forEach(function (o) { if (o.id === value) current = o })

    var valueEl = el('span', { class: 'select-value' + (current ? '' : ' is-placeholder'), text: current ? current.text : placeholder })
    var trigger = el('button', {
      type: 'button', class: 'select-trigger ' + (opts.triggerClass || ''),
      'aria-haspopup': 'listbox', 'aria-expanded': 'false',
    }, valueEl, el('span', { class: 'select-chevron', html: icon('ChevronDown', 16) }))
    if (opts.ariaLabel) trigger.setAttribute('aria-label', opts.ariaLabel)
    if (opts.id) trigger.id = opts.id

    var listbox = el('div', { class: 'select-content ' + (opts.contentClass || ''), role: 'listbox', hidden: true })
    var activeId = null
    var typeBuf = ''
    var typeTimer = null
    var optionEls = []

    function buildOptions() {
      listbox.innerHTML = ''
      optionEls = []
      opts.options.forEach(function (o) {
        var item = el('div', {
          class: 'select-item' + (o.id === value ? ' selected' : ''),
          role: 'option', id: uid + '-opt-' + o.id,
          'aria-selected': o.id === value ? 'true' : 'false',
          text: o.text,
        })
        item.__opt = o
        item.addEventListener('click', function () { commit(o.id) })
        item.addEventListener('mousemove', function () { setActive(o.id) })
        optionEls.push(item)
        listbox.appendChild(item)
      })
    }

    function setActive(id) {
      activeId = id
      optionEls.forEach(function (n) { n.classList.toggle('focused', n.__opt.id === id) })
      trigger.setAttribute('aria-activedescendant', uid + '-opt-' + id)
      var node = optionEls.find(function (n) { return n.__opt.id === id })
      if (node) node.scrollIntoView({ block: 'nearest' })
    }
    function step(delta) {
      var idx = optionEls.findIndex(function (n) { return n.__opt.id === activeId })
      var next = Math.min(optionEls.length - 1, Math.max(0, (idx < 0 ? (delta > 0 ? -1 : 0) : idx) + delta))
      if (optionEls[next]) setActive(optionEls[next].__opt.id)
    }
    function typeahead(ch) {
      typeBuf += ch.toLowerCase()
      clearTimeout(typeTimer)
      typeTimer = setTimeout(function () { typeBuf = '' }, 350)
      var hit = optionEls.find(function (n) { return n.__opt.text.toLowerCase().indexOf(typeBuf) === 0 })
      if (hit) setActive(hit.__opt.id)
    }
    function open() {
      buildOptions()
      listbox.hidden = false
      trigger.setAttribute('aria-expanded', 'true')
      // width >= trigger, placed under it
      listbox.style.minWidth = Math.max(trigger.offsetWidth, 128) + 'px'
      setActive(value || (optionEls[0] && optionEls[0].__opt.id))
      var sel = optionEls.find(function (n) { return n.__opt.id === value })
      if (sel) sel.scrollIntoView({ block: 'nearest' })
      setTimeout(function () {
        document.addEventListener('pointerdown', outside, true)
      }, 0)
    }
    function close() {
      listbox.hidden = true
      trigger.setAttribute('aria-expanded', 'false')
      document.removeEventListener('pointerdown', outside, true)
    }
    function outside(e) {
      if (!root.contains(e.target)) close()
    }
    function commit(id) {
      var changed = id !== value
      value = id
      current = opts.options.find(function (o) { return o.id === id }) || null
      valueEl.textContent = current ? current.text : placeholder
      valueEl.classList.toggle('is-placeholder', !current)
      close()
      trigger.focus()
      if (changed && opts.onChange) opts.onChange(id)
    }

    trigger.addEventListener('click', function () {
      if (listbox.hidden) open(); else close()
    })
    trigger.addEventListener('keydown', function (e) {
      if (listbox.hidden) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); open()
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // closed-state typeahead: select directly without opening
          var buf = (typeBuf + e.key).toLowerCase()
          typeBuf = buf
          clearTimeout(typeTimer)
          typeTimer = setTimeout(function () { typeBuf = '' }, 350)
          var hit = opts.options.find(function (o) { return o.text.toLowerCase().indexOf(buf) === 0 })
          if (hit) commit(hit.id)
        }
        return
      }
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); step(1); break
        case 'ArrowUp': e.preventDefault(); step(-1); break
        case 'Home': e.preventDefault(); if (optionEls[0]) setActive(optionEls[0].__opt.id); break
        case 'End': e.preventDefault(); if (optionEls.length) setActive(optionEls[optionEls.length - 1].__opt.id); break
        case 'Enter': case ' ': e.preventDefault(); if (activeId) commit(activeId); break
        case 'Escape': e.preventDefault(); close(); break
        case 'Tab': close(); break
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeahead(e.key)
      }
    })

    var root = el('div', { class: 'select-root' }, trigger, listbox)
    root.setValue = function (v) {
      value = v
      current = opts.options.find(function (o) { return o.id === v }) || null
      valueEl.textContent = current ? current.text : placeholder
      valueEl.classList.toggle('is-placeholder', !current)
    }
    return root
  }

  // ── ChoiceRow (label + select) ───────────────────────────────────────────────
  function ChoiceRow(opts) {
    var label = el('label', { class: 'choice-label' + (opts.labelClass ? ' ' + opts.labelClass : ''), for: 'sel-' + opts.id }, opts.label)
    var select = Select({
      value: opts.value,
      options: opts.options,
      onChange: opts.onChange,
      placeholder: opts.placeholder,
      id: 'sel-' + opts.id,
    })
    select.classList.add('choice-select')
    var row = el('div', { class: 'choice-row' + (opts.compact ? ' compact' : '') }, label, select)
    row.__select = select
    return row
  }

  // ── FlagToggle (config audits) ───────────────────────────────────────────────
  function FlagToggle(on, onToggle, label) {
    var b = btn(on ? 'default' : 'outline', 'sm', 'flag-toggle ' + (on ? 'is-flagged' : ''),
      icon('Flag', 14) + '<span>' + (on ? 'FLAGGED' : label) + '</span>',
      { 'aria-pressed': on ? 'true' : 'false' })
    b.__setOn = function (next) {
      b.classList.toggle('is-flagged', next)
      b.classList.toggle('btn-outline', !next)
      b.setAttribute('aria-pressed', next ? 'true' : 'false')
      b.innerHTML = icon('Flag', 14) + '<span>' + (next ? 'FLAGGED' : label) + '</span>'
    }
    b.addEventListener('click', onToggle)
    return b
  }

  // ── Switch ───────────────────────────────────────────────────────────────────
  function Switch(opts) {
    var b = el('button', {
      type: 'button', class: 'switch', role: 'switch',
      'aria-checked': opts.checked ? 'true' : 'false',
      id: opts.id, 'aria-label': opts.ariaLabel,
    }, el('span', { class: 'switch-thumb' }))
    if (opts.labelledby) b.setAttribute('aria-labelledby', opts.labelledby)
    b.addEventListener('click', function () {
      var next = b.getAttribute('aria-checked') !== 'true'
      b.setAttribute('aria-checked', next ? 'true' : 'false')
      if (opts.onCheckedChange) opts.onCheckedChange(next)
    })
    return b
  }

  // ── Checkbox ─────────────────────────────────────────────────────────────────
  function Checkbox(opts) {
    var b = el('button', {
      type: 'button', class: 'checkbox', role: 'checkbox',
      'aria-checked': opts.checked ? 'true' : 'false',
      id: opts.id, 'aria-label': opts.ariaLabel,
    }, el('span', { class: 'checkbox-indicator', html: icon('Check', 14) }))
    if (opts.labelledby) b.setAttribute('aria-labelledby', opts.labelledby)
    b.addEventListener('click', function () {
      var next = b.getAttribute('aria-checked') !== 'true'
      b.setAttribute('aria-checked', next ? 'true' : 'false')
      if (opts.onCheckedChange) opts.onCheckedChange(next)
    })
    return b
  }

  // ── RadioGroup (roving tabindex, arrows select like Radix) ──────────────────
  function RadioGroup(opts) {
    // opts: value, onValueChange(v), ariaLabel, items: [{value, id, node(label el or html)}]
    var root = el('div', { class: 'radio-group ' + (opts.className || ''), role: 'radiogroup' })
    if (opts.ariaLabel) root.setAttribute('aria-label', opts.ariaLabel)
    var value = opts.value || ''
    var radios = []

    function paint() {
      radios.forEach(function (r) {
        var checked = r.value === value
        r.el.setAttribute('aria-checked', checked ? 'true' : 'false')
        r.el.tabIndex = checked ? 0 : -1
      })
      if (!radios.some(function (r) { return r.value === value }) && radios[0]) radios[0].el.tabIndex = 0
    }
    function select(v) {
      value = v
      paint()
      if (opts.onValueChange) opts.onValueChange(v)
    }

    opts.items.forEach(function (it) {
      var r = el('button', {
        type: 'button', class: 'radio', role: 'radio',
        id: it.id, 'aria-checked': 'false', tabindex: '-1',
      }, el('span', { class: 'radio-dot' }))
      r.addEventListener('click', function () { select(it.value) })
      r.__value = it.value
      radios.push({ value: it.value, el: r })
      root.appendChild(el('span', { class: 'radio-line' }, r, it.node))
    })

    root.addEventListener('keydown', function (e) {
      var idx = radios.findIndex(function (r) { return r.el === document.activeElement })
      if (idx < 0) return
      var handled = true
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') select(radios[(idx + 1) % radios.length].value)
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') select(radios[(idx - 1 + radios.length) % radios.length].value)
      else if (e.key === 'Home') select(radios[0].value)
      else if (e.key === 'End') select(radios[radios.length - 1].value)
      else if (e.key === ' ') { e.preventDefault(); select(radios[idx].value) }
      else handled = false
      if (handled) {
        e.preventDefault()
        var cur = radios.find(function (r) { return r.value === value })
        if (cur) cur.el.focus()
      }
    })

    paint()
    return root
  }

  // ── Slider (pointer + keyboard, Radix semantics) ────────────────────────────
  function Slider(opts) {
    var min = opts.min
    var max = opts.max
    var value = opts.value
    var pct = function () { return ((value - min) / (max - min)) * 100 }

    var range = el('div', { class: 'slider-range' })
    var track = el('div', { class: 'slider-track' }, range)
    var thumb = el('span', {
      class: 'slider-thumb', role: 'slider', tabindex: '0',
      'aria-valuemin': String(min), 'aria-valuemax': String(max), 'aria-valuenow': String(value),
    })
    if (opts.ariaLabel) thumb.setAttribute('aria-label', opts.ariaLabel)
    var root = el('div', { class: 'slider' }, track, thumb)

    function paint() {
      range.style.width = pct() + '%'
      thumb.style.left = pct() + '%'
      thumb.setAttribute('aria-valuenow', String(value))
    }
    function set(v) {
      v = Math.min(max, Math.max(min, Math.round(v)))
      if (v !== value) {
        value = v
        paint()
        if (opts.onValueChange) opts.onValueChange(value)
      }
    }
    function fromPointer(e) {
      var rect = track.getBoundingClientRect()
      var ratio = (e.clientX - rect.left) / rect.width
      set(min + ratio * (max - min))
    }

    thumb.addEventListener('pointerdown', function (e) {
      e.preventDefault()
      thumb.focus() // pointerdown preventDefault blocks native focus — set it explicitly
      if (root.setPointerCapture) {
        try { root.setPointerCapture(e.pointerId) } catch (err) { /* noop */ }
      }
      var move = function (ev) { fromPointer(ev) }
      var up = function () {
        root.removeEventListener('pointermove', move)
        root.removeEventListener('pointerup', up)
        root.removeEventListener('pointercancel', up)
      }
      root.addEventListener('pointermove', move)
      root.addEventListener('pointerup', up)
      root.addEventListener('pointercancel', up)
    })
    track.addEventListener('pointerdown', function (e) {
      fromPointer(e)
      thumb.focus()
    })
    thumb.addEventListener('keydown', function (e) {
      var stepMove = {
        ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1,
        PageDown: -10, PageUp: 10,
      }[e.key]
      if (stepMove !== undefined) {
        e.preventDefault()
        set(value + stepMove)
      } else if (e.key === 'Home') { e.preventDefault(); set(min) }
      else if (e.key === 'End') { e.preventDefault(); set(max) }
    })

    paint()
    return root
  }

  // ── Ledger viewer (the night book) ───────────────────────────────────────────
  var KIND_CLASS = {
    failure: 'kind-failure', success: 'kind-success', mfa: 'kind-mfa',
    change: 'kind-change', service: 'kind-service',
  }
  function LedgerViewer() {
    var stateA = { actor: 'all', kind: 'all', origin: 'all' }
    var actors = Array.from(new Set(LOGS.map(function (l) { return l.actor }))).sort()

    var body = el('tbody', {})
    var count = el('p', { class: 'ledger-count font-mono', 'aria-live': 'polite' })

    function render() {
      var rows = LOGS.slice()
        .sort(function (a, b) { return a.ts.localeCompare(b.ts) })
        .filter(function (l) { return stateA.actor === 'all' ? true : l.actor === stateA.actor })
        .filter(function (l) { return stateA.kind === 'all' ? true : l.kind === stateA.kind })
        .filter(function (l) {
          if (stateA.origin === 'all') return true
          return stateA.origin === 'external' ? !l.source.startsWith('10.') : l.source.startsWith('10.')
        })
      body.innerHTML = ''
      rows.forEach(function (l) {
        body.appendChild(el('tr', { class: 'ledger-row' },
          el('td', { class: 'ledger-td ledger-ts', text: l.ts }),
          el('td', { class: 'ledger-td ledger-actor', text: l.actor }),
          el('td', { class: 'ledger-td ledger-src' },
            l.source,
            l.geo ? el('span', { class: 'ledger-geo', text: l.geo }) : null),
          el('td', { class: 'ledger-td ledger-event ' + (KIND_CLASS[l.kind] || ''), text: l.event }),
          el('td', { class: 'ledger-td ledger-detail', text: l.detail })))
      })
      if (rows.length === 0) {
        body.appendChild(el('tr', {}, el('td', { colspan: '5', class: 'ledger-empty', text: 'No rows match the current filters.' })))
      }
      count.textContent = 'showing ' + rows.length + ' of ' + LOGS.length +
        ' ledger rows · synthetic training data · timestamps 14 May 2025'
    }

    var selActor = Select({
      value: 'all',
      options: [{ id: 'all', text: 'account: all' }].concat(actors.map(function (a) { return { id: a, text: a } })),
      onChange: function (v) { stateA.actor = v; render() },
      ariaLabel: 'Filter ledger by account',
      triggerClass: 'ledger-filter',
    })
    var selKind = Select({
      value: 'all',
      options: [
        { id: 'all', text: 'event: all' },
        { id: 'failure', text: 'logon failures' },
        { id: 'success', text: 'sign-in successes' },
        { id: 'mfa', text: 'MFA pushes' },
        { id: 'change', text: 'privilege / permission changes' },
        { id: 'service', text: 'service / scheduled' },
      ],
      onChange: function (v) { stateA.kind = v; render() },
      ariaLabel: 'Filter ledger by event kind',
      triggerClass: 'ledger-filter',
    })
    var selOrigin = Select({
      value: 'all',
      options: [
        { id: 'all', text: 'source: all' },
        { id: 'external', text: 'source: external IPs' },
        { id: 'internal', text: 'source: internal 10.x' },
      ],
      onChange: function (v) { stateA.origin = v; render() },
      ariaLabel: 'Filter ledger by source origin',
      triggerClass: 'ledger-filter',
    })

    render()
    return el('div', {},
      el('div', { class: 'ledger-filters' }, selActor, selKind, selOrigin),
      count,
      el('div', { class: 'ledger-scroll ledger-box', role: 'region', 'aria-label': 'Audit ledger rows', tabindex: '0' },
        el('table', { class: 'ledger-table' },
          el('thead', { class: 'ledger-thead' }, el('tr', {},
            el('th', { text: 'time' }), el('th', { text: 'account' }), el('th', { text: 'source' }),
            el('th', { text: 'event' }), el('th', { text: 'detail' }))),
          body)))
  }

  // ── Modal (Dialog & AlertDialog behavior) + focus management ────────────────
  function openModal(opts) {
    // opts: variant 'dialog'|'alert', title(node), description(node), content(node),
    //        onClose(), contentClass
    var opener = document.activeElement
    var labelId = 'modal-title-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
    var descId = labelId + '-desc'

    var overlay = el('div', { class: 'modal-overlay open' })
    var content = el('div', {
      class: 'modal-content open ' + (opts.contentClass || ''),
      role: opts.variant === 'alert' ? 'alertdialog' : 'dialog',
      'aria-modal': 'true', 'aria-labelledby': labelId, 'aria-describedby': descId,
    })
    var title = el('div', { id: labelId }, opts.title)
    content.appendChild(title)
    if (opts.description) content.appendChild(el('div', { id: descId }, opts.description))
    if (opts.content) content.appendChild(opts.content)

    if (opts.variant !== 'alert') {
      var x = el('button', {
        type: 'button', class: 'modal-close', html: icon('X', 16) + '<span class="sr-only">Close</span>',
        'aria-label': 'Close',
      })
      x.addEventListener('click', function () { requestClose() })
      content.appendChild(x)
    }

    function focusables() {
      return Array.prototype.filter.call(
        content.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        function (n) { return !n.disabled && n.offsetParent !== null }
      )
    }
    function trap(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        requestClose()
        return
      }
      if (e.key !== 'Tab') return
      var f = focusables()
      if (f.length === 0) return
      var first = f[0]
      var last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      else if (!content.contains(document.activeElement)) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trap, true)

    function requestClose() {
      document.removeEventListener('keydown', trap, true)
      overlay.classList.remove('open')
      overlay.classList.add('closing')
      content.classList.remove('open')
      content.classList.add('closing')
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
        document.body.classList.remove('modal-open')
        if (opener && document.contains(opener)) opener.focus()
        if (opts.onClose) opts.onClose()
      }, 170)
    }
    overlay.appendChild(content)
    overlay.addEventListener('pointerdown', function (e) {
      if (e.target === overlay && opts.variant !== 'alert') requestClose()
    })
    document.body.appendChild(overlay)
    document.body.classList.add('modal-open')

    var f = focusables()
    if (f.length) f[0].focus()

    return { close: requestClose }
  }

  // ── Sheet (left drawer) ──────────────────────────────────────────────────────
  function openSheet(opts) {
    // opts: title(node), description(node), content(node), onClose()
    var opener = document.activeElement
    var overlay = el('div', { class: 'modal-overlay open sheet-overlay' })
    var panel = el('aside', {
      class: 'sheet open', role: 'dialog', 'aria-modal': 'true',
      'aria-label': 'Ticket queue',
    })
    var x = el('button', {
      type: 'button', class: 'modal-close sheet-close', html: icon('X', 16) + '<span class="sr-only">Close</span>',
      'aria-label': 'Close',
    })
    var inner = el('div', { class: 'sheet-inner' }, opts.title, opts.description, opts.content)
    panel.appendChild(inner)
    panel.appendChild(x)

    function focusables() {
      return Array.prototype.filter.call(
        panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        function (n) { return !n.disabled && n.offsetParent !== null }
      )
    }
    function trap(e) {
      if (e.key === 'Escape') { e.preventDefault(); requestClose(); return }
      if (e.key !== 'Tab') return
      var f = focusables()
      if (!f.length) return
      var first = f[0]
      var last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      else if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trap, true)

    function requestClose() {
      document.removeEventListener('keydown', trap, true)
      overlay.classList.remove('open')
      panel.classList.remove('open')
      panel.classList.add('closing')
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
        document.body.classList.remove('modal-open')
        if (opener && document.contains(opener)) opener.focus()
        if (opts.onClose) opts.onClose()
      }, 280)
    }
    x.addEventListener('click', function () { requestClose() })
    overlay.addEventListener('pointerdown', function (e) {
      if (e.target === overlay) requestClose()
    })
    overlay.appendChild(panel)
    document.body.appendChild(overlay)
    document.body.classList.add('modal-open')

    var f = focusables()
    if (f.length) f[0].focus()

    return { close: requestClose }
  }

  // ── export ───────────────────────────────────────────────────────────────────
  // Structural re-renders (mode set / RESET) must sweep away any overlay that
  // lives outside #root — the original's React tree unmounted dialogs with it.
  function closeAllOverlays() {
    document.querySelectorAll('.modal-overlay').forEach(function (n) { n.remove() })
    document.body.classList.remove('modal-open')
  }

  window.Bureau = {
    el: el,
    icon: icon,
    btn: btn,
    BureauCard: BureauCard,
    PillarBadge: PillarBadge,
    PILLAR_LABEL: PILLAR_LABEL,
    VerifiedChip: VerifiedChip,
    Term: Term,
    CheckStamp: CheckStamp,
    Select: Select,
    ChoiceRow: ChoiceRow,
    FlagToggle: FlagToggle,
    Switch: Switch,
    Checkbox: Checkbox,
    RadioGroup: RadioGroup,
    Slider: Slider,
    LedgerViewer: LedgerViewer,
    openModal: openModal,
    closeAllOverlays: closeAllOverlays,
    openSheet: openSheet,
  }
})()
