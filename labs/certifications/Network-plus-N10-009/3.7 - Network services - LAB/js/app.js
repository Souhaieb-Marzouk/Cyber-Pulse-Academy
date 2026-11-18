// ===================================================================
// Building B — Service Riser · application
// (js/app.js — bootstrap, world chrome, circuit modules, dialogs)
//
// 1:1 port of LabWorld.tsx + modules/{desks,dhcp,slaac,dns,time}.tsx.
// Vanilla DOM building; the store notifies → targeted region updates.
// ===================================================================
(function () {
  'use strict'

  const D = window.LabData
  const U = window.LabUI
  const Engine = window.LabEngine
  const store = window.LabStore

  let currentView = null          // 'modeselect' | 'world'
  let pendingBench = null         // bench slug to scroll to after navigation
  let benchScrollTimer = null
  let wbCircuit = null            // circuit currently mounted in the workbench
  let swapTimer = null            // pending exit-animation swap
  let zoneDraft = { name: '', type: '', value: '', priority: '' } // zone editor local draft (reset on circuit change, like the original's unmount)

  // ---------------- env patch helper ----------------
  function envSet(path, value, silent) {
    store.patchEnv((env) => {
      const next = JSON.parse(JSON.stringify(env))
      const parts = path.split('.')
      let node = next
      for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]]
      node[parts[parts.length - 1]] = value
      return next
    }, silent)
  }

  // ---------------- lab api (context replacement) ----------------
  function isServed(ids) {
    const mode = store.state.mode
    if (!mode) return false
    const modeObjs = Engine.objectivesFor(mode)
    return modeObjs.some((o) => ids.indexOf(o.id) !== -1)
  }

  function navigate(circuit, bench) {
    pendingBench = bench || null
    store.navigate(circuit)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (wbCircuit === circuit) maybeScrollToBench()
  }

  function maybeScrollToBench() {
    if (benchScrollTimer) return
    benchScrollTimer = setTimeout(() => {
      benchScrollTimer = null
      if (!pendingBench) return
      const node = document.getElementById('bench-' + pendingBench)
      pendingBench = null
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  function benchSlug(o) {
    const map = {
      dhcp: { 'Handshake bench': 'dhcp-handshake', 'Service map': 'dhcp-servicemap', 'Scope repair': 'dhcp-scope', 'Rogue capture': 'dhcp-rogue', 'Plan designer': 'dhcp-plan' },
      slaac: { 'EUI-64 builder': 'slaac-eui', 'RA flag lab': 'slaac-ra' },
      dns: { 'Record triage': 'dns-triage', 'Resolver walk': 'dns-walk', 'Zone editor': 'dns-zone', 'Hardening bench': 'dns-harden' },
      ntp: { 'Sync clinic': 'ntp-clinic', 'Architecture board': 'ntp-arch' },
      ptp: { 'Clock-role board': 'ptp-roles' },
      nts: { 'NTS bench': 'nts-bench', 'Incident follow-up': 'nts-followup' },
      nightdesk: { 'Symptom matcher': 'night-symptoms', 'Overnight bundle': 'night-bundle', 'SOC feed': 'night-soc', 'Change order': 'night-change' },
    }
    return (map[o.circuit] && map[o.circuit][o.bench]) || D.circuitOf(o.circuit).id
  }

  // ---------------- details (<details>) open-state preservation ----------------
  function snapshotDetails(region) {
    const open = []
    if (region) region.querySelectorAll('details[data-did][open]').forEach((d) => open.push(d.getAttribute('data-did')))
    return open
  }
  function restoreDetails(region, snap) {
    if (!region) return
    snap.forEach((id) => {
      const d = region.querySelector('details[data-did="' + id + '"]')
      if (d) d.open = true
    })
  }

  // ===================================================================
  // BOOT
  // ===================================================================
  function boot() {
    const app = document.getElementById('app')
    app.appendChild(U.el('div', { class: 'splash' }, U.el('p', { class: 'splash-text' }, 'energizing the riser…')))
    setTimeout(() => {
      store.subscribe(render)
      const saved = store.load()
      if (saved) store.hydrate(saved)
      else { store.markHydrated(); render() }
    }, 0)
  }

  // ---------------- top-level render ----------------
  function render() {
    const app = document.getElementById('app')
    const cap = U.captureFocus()
    if (!store.state.mode) {
      if (currentView !== 'modeselect') {
        app.innerHTML = ''
        buildModeSelect(app)
        currentView = 'modeselect'
      }
    } else {
      if (currentView !== 'world') {
        app.innerHTML = ''
        buildWorld(app)
        currentView = 'world'
        wbCircuit = null
        pendingBench = null
        zoneDraft = { name: '', type: '', value: '', priority: '' }
      }
      updateHeader()
      updateRail()
      updateWorkbench()
      updatePunchList()
      updateFab()
    }
    U.restoreFocus(cap)
    maybeCompletion()
  }

  // ===================================================================
  // MODE SELECT SCREEN
  // ===================================================================
  function buildModeSelect(app) {
    const wrap = U.el('div', { class: 'mode-select' })
    const inner = U.el('div', { class: 'mode-select-inner' })
    const head = U.el('div', { class: 'mode-select-head' },
      U.el('div', { class: 'nameplate' },
        U.el('p', { class: 'nameplate-title' }, 'Meridian Civic Campus'),
        U.el('p', { class: 'nameplate-sub' }, 'Building B · service riser')),
      U.el('h1', { class: 'mode-select-h1' }, 'Network Services — go-live lab'),
      U.el('p', { class: 'mode-select-sub' },
        'CompTIA Network+ N10-009 · Objective 3.7: DHCP, SLAAC, DNS, NTP, PTP and NTS. One room, two shifts. Pick how you work — the room is identical, the pressure is not.'))
    inner.appendChild(head)

    const grid = U.el('div', { class: 'mode-cards' })
    const day = U.el('button', { type: 'button', class: 'mode-card mode-card-day', 'aria-label': 'Choose Day Shift — guided medium mode' },
      U.el('p', { class: 'mode-card-kicker is-day' }, '07:00 · day shift'),
      U.el('h2', { class: 'mode-card-title' }, 'Guided go-live'),
      U.el('p', { class: 'mode-card-body' },
        '12 punch-list items, introduced one by one with context and a “open the bench” pointer. Three-tier hints cost a few stars but never block you. Tolerant checking accepts sensible variants. Inspector quiz: 7 concept questions with explanations.'),
      U.el('p', { class: 'mode-card-foot is-green' }, 'Understand → Apply · beginner-friendly'))
    day.addEventListener('click', () => store.setMode('medium'))
    const night = U.el('button', { type: 'button', class: 'mode-card mode-card-night', 'aria-label': 'Choose Night Shift — hard challenge mode' },
      U.el('p', { class: 'mode-card-kicker is-night' }, '03:00 · night shift'),
      U.el('h2', { class: 'mode-card-title is-light' }, 'Audit under pressure'),
      U.el('p', { class: 'mode-card-body is-light' },
        '9 broad challenges over noisy evidence — red herrings included. No pointers; a single optional nudge that visibly costs score. Exact values, exact IDs, multi-part answers; near-misses are rejected with a rationale. Scenario exam: 7 justification items.'),
      U.el('p', { class: 'mode-card-foot is-gold' }, 'Analyze → Evaluate → Create · stretch mode'))
    night.addEventListener('click', () => store.setMode('hard'))
    grid.appendChild(day)
    grid.appendChild(night)
    inner.appendChild(grid)
    inner.appendChild(U.el('p', { class: 'mode-select-note' },
      'All data in this lab is simulated training data (documentation IP ranges, fictional org). Progress auto-saves in your browser; a labeled reset restores the pristine room.'))
    wrap.appendChild(inner)
    app.appendChild(wrap)
  }

  // ===================================================================
  // WORLD (header + rail + workbench + punch list)
  // ===================================================================
  function buildWorld(app) {
    const world = U.el('div', { class: 'world' })

    // header
    const modeBtn = U.el('button', { type: 'button', class: 'hdr-btn hdr-btn-mode', id: 'hdr-mode' })
    modeBtn.addEventListener('click', openModeDialog)
    const ringSlot = U.el('span', { id: 'ring-slot' })
    const resetBtn = U.el('button', {
      type: 'button', class: 'hdr-btn hdr-btn-reset', id: 'hdr-reset',
      'aria-label': 'Reset the lab to pristine state',
    }, 'reset')
    resetBtn.addEventListener('click', openResetDialog)

    const header = U.el('header', { class: 'site-header' },
      U.el('div', { class: 'header-inner' },
        U.el('div', { class: 'nameplate-min' },
          U.el('p', { class: 'hdr-title' }, 'Building B — service riser'),
          U.el('p', { class: 'hdr-sub' }, 'Meridian Civic Campus · N10-009 3.7 · simulated training data')),
        U.el('div', { class: 'hdr-actions' }, modeBtn, ringSlot, resetBtn)))
    world.appendChild(header)

    // layout
    const layout = U.el('div', { class: 'layout' },
      U.el('nav', { class: 'rail-nav', 'aria-label': 'Service riser board' },
        U.el('div', { class: 'rail-card' }, U.el('div', { id: 'rail', class: 'rail' }))),
      U.el('main', { id: 'workbench', 'aria-label': 'Workbench' },
        U.el('div', { id: 'wb-inner' })),
      U.el('aside', { class: 'punch-aside', 'aria-label': 'Punch list', id: 'punchlist' },
        U.el('div', { id: 'punch-inner' })))
    world.appendChild(layout)

    // mobile punch list shortcut
    const fab = U.el('a', { href: '#punchlist', class: 'punch-fab', id: 'punch-fab' })
    world.appendChild(fab)

    app.appendChild(world)
  }

  function updateHeader() {
    const s = store.state
    const modeBtn = document.getElementById('hdr-mode')
    if (modeBtn) {
      modeBtn.textContent = s.mode === 'medium' ? '☀ day shift' : '☾ night shift'
      modeBtn.setAttribute('aria-label', 'Mode: ' + (s.mode === 'medium' ? 'Day Shift (medium)' : 'Night Shift (hard)') + ' — switch mode')
    }
    const modeObjs = s.mode ? Engine.objectivesFor(s.mode) : []
    const doneCount = modeObjs.filter((o) => s.results[o.id] && s.results[o.id].done).length
    const slot = document.getElementById('ring-slot')
    if (slot) {
      slot.innerHTML = ''
      slot.appendChild(U.progressRing(doneCount, modeObjs.length))
    }
  }

  function updateFab() {
    const fab = document.getElementById('punch-fab')
    if (!fab) return
    const s = store.state
    const modeObjs = s.mode ? Engine.objectivesFor(s.mode) : []
    const doneCount = modeObjs.filter((o) => s.results[o.id] && s.results[o.id].done).length
    fab.textContent = 'punch list ' + doneCount + '/' + modeObjs.length
  }

  // ---------------- riser rail ----------------
  function updateRail() {
    const rail = document.getElementById('rail')
    if (!rail) return
    rail.innerHTML = ''
    const s = store.state
    const modeObjs = s.mode ? Engine.objectivesFor(s.mode) : []
    const sections = [
      { label: 'ops', ids: ['pinboard'] },
      { label: 'service circuits', ids: ['dhcp', 'slaac', 'dns', 'ntp', 'ptp', 'nts'] },
      { label: 'review', ids: ['nightdesk', 'inspector', 'handover'] },
    ]
    sections.forEach((sec) => {
      const secWrap = U.el('div', { class: 'rail-section' },
        U.el('p', { class: 'rail-section-label' }, sec.label))
      const list = U.el('div', { class: 'rail-list' })
      sec.ids.forEach((cid) => {
        const c = D.circuitOf(cid)
        const objs = modeObjs.filter((o) => o.circuit === cid)
        const done = objs.filter((o) => s.results[o.id] && s.results[o.id].done).length
        let ledState
        if (cid === 'inspector') ledState = s.quizDone[s.mode || 'medium'] ? 'done' : 'open'
        else if (cid === 'pinboard' || cid === 'handover') ledState = 'idle'
        else if (objs.length === 0) ledState = 'idle'
        else ledState = done === objs.length ? 'done' : 'open'

        const btn = U.el('button', {
          type: 'button',
          class: 'rail-btn' + (s.activeCircuit === cid ? ' is-active' : ''),
          'aria-current': s.activeCircuit === cid ? 'page' : null,
          'data-k': 'rail-' + cid,
        },
          U.led(c.hue, ledState),
          U.el('span', { class: 'rail-code' }, c.code),
          U.el('span', { class: 'rail-name' }, c.name),
          objs.length > 0
            ? U.el('span', { class: 'rail-count', 'aria-label': done + ' of ' + objs.length + ' objectives done' }, done + '/' + objs.length)
            : null)
        btn.addEventListener('click', () => navigate(cid))
        list.appendChild(btn)
      })
      secWrap.appendChild(list)
      rail.appendChild(secWrap)
    })
  }

  // ---------------- workbench ----------------
  const SERVICE_CIRCUITS = ['dhcp', 'slaac', 'dns', 'ntp', 'ptp', 'nts']

  function updateWorkbench() {
    const host = document.getElementById('wb-inner')
    if (!host) return
    const circuit = store.state.activeCircuit

    if (wbCircuit === circuit) {
      const snap = snapshotDetails(host)
      mountWorkbench(host, circuit)
      restoreDetails(host, snap)
      return
    }
    if (swapTimer) return // an exit is playing; it swaps to the latest circuit

    const doSwap = () => {
      swapTimer = null
      wbCircuit = store.state.activeCircuit
      zoneDraft = { name: '', type: '', value: '', priority: '' }
      host.innerHTML = ''
      mountWorkbench(host, wbCircuit)
      const node = host.firstElementChild
      if (node) {
        node.classList.add('wb-enter')
        requestAnimationFrame(() => requestAnimationFrame(() => node.classList.remove('wb-enter')))
      }
      maybeScrollToBench()
    }

    const prev = host.firstElementChild
    if (prev) {
      prev.classList.add('wb-exit')
      swapTimer = setTimeout(doSwap, 190)
    } else {
      wbCircuit = circuit
      mountWorkbench(host, circuit)
      const node = host.firstElementChild
      if (node) {
        node.classList.add('wb-enter')
        requestAnimationFrame(() => requestAnimationFrame(() => node.classList.remove('wb-enter')))
      }
      maybeScrollToBench()
    }
  }

  function mountWorkbench(host, circuit) {
    host.innerHTML = ''
    host.appendChild(buildWorkbenchContent(circuit))
  }

  function buildWorkbenchContent(circuit) {
    const c = D.circuitOf(circuit)
    const wrap = U.el('div', { class: 'workbench' })

    // title block
    wrap.appendChild(U.el('div', { class: 'wb-title' },
      U.el('span', { class: 'wb-code' }, c.code),
      U.el('h2', { class: 'wb-name' }, c.name),
      U.el('span', { class: 'wb-blurb' }, c.blurb)))

    // knowledge core intro (service circuits only)
    if (SERVICE_CIRCUITS.indexOf(circuit) !== -1) {
      const n = D.SERVICE_NOTES[circuit]
      wrap.appendChild(U.el('aside', { class: 'knowledge-core', 'aria-label': 'Knowledge core' },
        U.el('p', { class: 'kc-line' }, U.el('strong', null, 'What: '), n.what),
        U.el('p', { class: 'kc-line' }, U.el('strong', null, 'How: '), n.how),
        U.el('p', { class: 'kc-line' }, U.el('strong', null, 'Why attackers care: '), n.why)))
    }

    // circuit body
    let body = null
    switch (circuit) {
      case 'pinboard': body = pinboardModule(); break
      case 'dhcp': body = dhcpModule(); break
      case 'slaac': body = slaacModule(); break
      case 'dns': body = dnsModule(); break
      case 'ntp': body = timeModule('ntp'); break
      case 'ptp': body = timeModule('ptp'); break
      case 'nts': body = timeModule('nts'); break
      case 'nightdesk': body = nightDeskModule(); break
      case 'inspector': body = window.LabQuiz.renderInspector(lab); break
      case 'handover': body = handoverModule(); break
    }
    if (body) wrap.appendChild(body)
    return wrap
  }

  // ===================================================================
  // MODULES
  // ===================================================================

  // ---------- 00 Pinboard ----------
  function pinboardModule() {
    const wrap = U.el('div', { class: 'module' })

    const howBox = U.el('div', { class: 'howto-box' },
      U.el('h4', { class: 'howto-title' }, 'How this room works'),
      U.el('ol', { class: 'howto-list' }, D.BRIEFING.howTo.map((t) => U.el('li', null, t))),
      U.el('p', { class: 'howto-note' },
        'Progress auto-saves in this browser (localStorage). Day Shift = guided Medium mode · Night Shift = Hard mode.'))

    wrap.appendChild(U.bench({
      id: 'pinboard-brief', title: D.BRIEFING.header, kicker: D.BRIEFING.date, hue: '#8A6A2F',
      children: [
        U.el('p', { class: 'bench-org' }, D.BRIEFING.org),
        D.BRIEFING.body.map((t) => U.el('p', { class: 'bench-body-text' }, t)),
        howBox,
      ],
    }))

    const noteCards = Object.keys(D.SERVICE_NOTES).map((k) => {
      const n = D.SERVICE_NOTES[k]
      return U.el('article', { class: 'service-note' },
        U.el('h4', { class: 'service-note-title' }, k),
        U.el('p', { class: 'service-note-line' }, U.el('strong', null, 'What: '), n.what),
        U.el('p', { class: 'service-note-line' }, U.el('strong', null, 'How: '), n.how),
        U.el('p', { class: 'service-note-line' }, U.el('strong', null, 'Why attackers care: '), n.why),
        U.el('p', { class: 'service-note-variants' },
          U.el('span', { class: 'variants-label' }, 'Variants: '), n.variants.join(' · ')))
    })
    wrap.appendChild(U.bench({
      id: 'pinboard-map', title: 'The six services at a glance', kicker: 'knowledge core', hue: '#8A6A2F',
      children: [U.el('div', { class: 'service-note-grid' }, noteCards)],
    }))

    wrap.appendChild(U.bench({
      id: 'pinboard-glossary', title: 'Glossary', kicker: '15 terms', hue: '#8A6A2F',
      children: [glossaryDetails('glossary-pinboard', 'Open the glossary (every jargon term, one line each)')],
    }))

    wrap.appendChild(U.el('div', { class: 'sr-only' }, store.state.mode + ' mode active'))
    return wrap
  }

  function glossaryDetails(did, summaryText) {
    return U.el('details', { class: 'glossary-details', 'data-did': did },
      U.el('summary', { class: 'glossary-summary' }, summaryText),
      U.el('dl', { class: 'glossary-list' },
        D.GLOSSARY.map((g) => U.el('div', { class: 'glossary-row' },
          U.el('dt', { class: 'glossary-term' }, g.term),
          U.el('dd', { class: 'glossary-def' }, g.def)))))
  }

  // ---------- 01 DHCP ----------
  function dhcpModule() {
    const wrap = U.el('div', { class: 'module' })
    if (isServed(['OBJ-M1'])) wrap.appendChild(handshakeBench())
    if (isServed(['OBJ-M2'])) wrap.appendChild(serviceMapBench())
    if (isServed(['OBJ-M6'])) wrap.appendChild(scopeRepairBench())
    if (isServed(['OBJ-M9'])) wrap.appendChild(rogueCaptureBench())
    if (isServed(['OBJ-H3'])) wrap.appendChild(planDesignerBench())
    return wrap
  }

  function handshakeBench() {
    const d = store.state.env.dhcp
    return U.bench({
      id: 'dhcp-handshake', title: 'Handshake bench', kicker: 'how a lease is born', hue: '#B0563A',
      children: [
        U.el('p', { class: 'bench-intro' },
          'A fresh client on VLAN 40 has no address. Line up the four DHCP messages in the order they fire, then wire the ports each side listens on. The exchange starts broadcast — a relay agent (IP helper) is what carries it across subnets to the server in VLAN 50.'),
        U.seqTray({
          items: D.DORA_CARDS.map((c) => ({ id: c.id, label: c.label, note: c.text })),
          order: d.order,
          onOrder: (order) => envSet('dhcp.order', order),
          ariaLabel: 'DHCP message sequence',
          k: 'dhcp-order',
        }),
        U.el('div', { class: 'grid sm-2 maxw-xl' },
          U.selectField({ label: 'Server listens on', value: d.serverPort, options: D.PORT_OPTIONS, fkey: 'dhcp.serverPort', onChange: (v) => envSet('dhcp.serverPort', v) }),
          U.selectField({ label: 'Client listens on', value: d.clientPort, options: D.PORT_OPTIONS, fkey: 'dhcp.clientPort', onChange: (v) => envSet('dhcp.clientPort', v) })),
        U.objectiveCheck(lab, 'OBJ-M1'),
      ],
    })
  }

  function serviceMapBench() {
    const map = store.state.env.map
    return U.bench({
      id: 'dhcp-servicemap', title: 'Service map', kicker: 'know your riser', hue: '#B0563A',
      children: [
        U.el('p', { class: 'bench-intro' },
          'Six services, three jobs. Assign each service on this riser to the job it performs — the map you build here is the mental model for everything else in the lab.'),
        U.el('div', { class: 'grid sm-2 lg-3' },
          D.SERVICE_MAP.services.map((sv) =>
            U.selectField({
              label: sv.label, value: map[sv.id] || '', options: D.BIN_OPTIONS, fkey: 'map.' + sv.id,
              onChange: (v) => envSet('map.' + sv.id, v),
            }))),
        U.objectiveCheck(lab, 'OBJ-M2'),
      ],
    })
  }

  function scopeRepairBench() {
    const d = store.state.env.dhcp

    function renew() {
      const dd = store.state.env.dhcp
      const inPool = (ip) => Engine.isIp(ip) && /^10\.20\.40\./.test(ip.trim()) && Number(ip.split('.')[3]) >= 2 && Number(ip.split('.')[3]) <= 254
      const start = Number(dd.poolStart.split('.')[3])
      const end = Number(dd.poolEnd.split('.')[3])
      const okPool = inPool(dd.poolStart) && inPool(dd.poolEnd) && start <= end &&
        !/^10\.20\.40\.1$/.test(dd.poolStart.trim()) && !/^10\.20\.40\.1$/.test(dd.poolEnd.trim())
      const okAll = okPool &&
        dd.gateway.trim() === '10.20.40.1' &&
        dd.dnsServer.trim() === '10.20.40.53' &&
        dd.domain.trim().toLowerCase() === 'meridian.local'
      store.patchEnv((env) => {
        const next = JSON.parse(JSON.stringify(env))
        next.dhcp.leaseIssued = okAll
        next.dhcp.leaseMsg = okAll
          ? 'DORA complete — client leased an address from your repaired scope.'
          : !okPool
            ? 'Renew refused: the pool must sit inside 10.20.40.0/24 (keep .1 free, start ≤ end).'
            : dd.gateway.trim() !== '10.20.40.1'
              ? 'Renew refused: option 3 (router) must point at the VLAN gateway 10.20.40.1.'
              : dd.dnsServer.trim() !== '10.20.40.53'
                ? 'Renew refused: option 6 (DNS) must point at the campus resolver 10.20.40.53.'
                : 'Renew refused: option 15 (domain name) must be meridian.local.'
        return next
      })
    }

    const kids = [
      U.el('p', { class: 'bench-intro' },
        'The left-behind scope is half-commissioned: option 3 (router) points at a foreign subnet, option 6 (DNS) points at the switch itself, and option 15 (domain) is empty. Repair it for VLAN 40 (10.20.40.0/24), then press ',
        U.el('em', null, 'Renew lease'), ' to prove a client can actually lease.'),
      U.el('div', { class: 'grid sm-2 lg-3' },
        U.field({ label: 'Pool start', value: d.poolStart, fkey: 'dhcp.poolStart', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.poolStart', v, true) }),
        U.field({ label: 'Pool end', value: d.poolEnd, fkey: 'dhcp.poolEnd', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.poolEnd', v, true) }),
        U.field({ label: 'Option 3 — router', value: d.gateway, fkey: 'dhcp.gateway', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.gateway', v, true) }),
        U.field({ label: 'Option 6 — DNS servers', value: d.dnsServer, fkey: 'dhcp.dnsServer', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.dnsServer', v, true) }),
        U.field({ label: 'Option 15 — domain name', value: d.domain, fkey: 'dhcp.domain', placeholder: 'meridian.local', mono: false, onInput: (v) => envSet('dhcp.domain', v, true) })),
    ]

    const renewRow = U.el('div', { class: 'renew-row' })
    const renewBtn = U.el('button', { type: 'button', class: 'btn btn-renew', 'data-k': 'dhcp-renew' }, 'Renew lease (run DORA)')
    renewBtn.addEventListener('click', renew)
    renewRow.appendChild(renewBtn)
    if (d.leaseMsg) renewRow.appendChild(U.statusLine(d.leaseIssued ? 'ok' : 'bad', d.leaseMsg))
    kids.push(renewRow)

    if (d.leaseIssued) {
      const table = U.el('div', { class: 'table-scroll' },
        U.el('table', { class: 'data-table is-mono' },
          U.el('caption', { class: 'sr-only' }, 'DHCP lease table'),
          U.el('thead', null, U.el('tr', { class: 'table-head' },
            U.el('th', null, 'MAC'), U.el('th', null, 'Leased IP'), U.el('th', null, 'Gateway (opt 3)'), U.el('th', null, 'DNS (opt 6)'), U.el('th', null, 'Lease'))),
          U.el('tbody', null, U.el('tr', { class: 'table-row' },
            U.el('td', null, '02:1a:4f:10:40:77'), U.el('td', null, d.poolStart), U.el('td', null, d.gateway),
            U.el('td', null, d.dnsServer), U.el('td', null, '8h')))),
        U.el('p', { class: 'table-footnote' }, 'simulated lease table · training data'))
      kids.push(table)
    }
    kids.push(U.objectiveCheck(lab, 'OBJ-M6'))

    return U.bench({ id: 'dhcp-scope', title: 'Scope repair', kicker: 'options 3 · 6 · 15', hue: '#B0563A', children: kids })
  }

  function rogueCaptureBench() {
    const d = store.state.env.dhcp
    const captureRows = D.DHCP_CAPTURE.map((r) => U.el('tr', { class: 'table-row' },
      U.el('td', null, String(r.no)), U.el('td', null, r.time), U.el('td', null, r.srcMac),
      U.el('td', null, r.srcIp),
      U.el('td', { class: r.msg === 'OFFER' ? 'is-offer' : null }, r.msg),
      U.el('td', null, r.yiaddr), U.el('td', null, r.opts), U.el('td', null, r.note)))

    return U.bench({
      id: 'dhcp-rogue', title: 'Rogue capture', kicker: 'who else is offering?', hue: '#B0563A',
      children: [
        U.el('p', { class: 'bench-intro' },
          'Staff report odd gateway errors. This capture shows two sources answering DHCP on VLAN 40 — one of them is not yours. Name the rogue, then shut it out with DHCP snooping (remember: snooping drops DHCP server messages on every port you do ',
          U.el('strong', null, 'not'), ' mark trusted).'),
        U.el('div', { class: 'table-scroll' },
          U.el('table', { class: 'data-table is-mono' },
            U.el('caption', { class: 'table-caption' }, 'simulated packet capture · training data'),
            U.el('thead', null, U.el('tr', { class: 'table-head' },
              U.el('th', null, '#'), U.el('th', null, 'Time'), U.el('th', null, 'Src MAC'), U.el('th', null, 'Src IP'),
              U.el('th', null, 'Msg'), U.el('th', null, 'yiaddr'), U.el('th', null, 'Options'), U.el('th', null, 'Note'))),
            U.el('tbody', null, captureRows))),
        U.el('div', { class: 'grid maxw-xl' },
          U.field({ label: 'Rogue server IP', value: d.rogueIp, fkey: 'dhcp.rogueIp', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.rogueIp', v, true) }),
          U.toggle({
            label: 'Enable DHCP snooping on the VLAN 40 access switches', k: 'dhcp.snooping',
            checked: d.snooping, hint: 'default-deny for DHCP server messages',
            onChange: (v) => envSet('dhcp.snooping', v),
          }),
          U.selectField({
            label: 'Trusted port (the one path legitimate offers may use)', value: d.trustedPort,
            options: D.TRUST_PORTS, fkey: 'dhcp.trustedPort',
            onChange: (v) => envSet('dhcp.trustedPort', v),
          })),
        U.objectiveCheck(lab, 'OBJ-M9'),
      ],
    })
  }

  function planDesignerBench() {
    const p = store.state.env.dhcp.plan
    return U.bench({
      id: 'dhcp-plan', title: 'Plan designer', kicker: 'change-window blueprint', hue: '#B0563A',
      children: [
        U.el('p', { class: 'bench-intro' },
          'Meridian standards for the go-live: pools ', U.el('strong', null, '.100–.199'), ' per VLAN, gateways ', U.el('strong', null, '.1'),
          ', the badge-label printer (MAC ', U.el('code', { class: 'is-mono' }, '9C:B6:D0:11:22:33'), ') pinned at',
          U.el('strong', null, ' 10.20.40.50'), ', camera controllers ', U.el('strong', null, '.240–.254 excluded'),
          ', and VLAN 40 served', U.el('strong', null, ' across subnets'), ' by the server 10.20.50.5. Fill every field exactly.'),
        U.el('div', { class: 'grid sm-2 lg-4' },
          U.field({ label: 'VLAN10 pool start', value: p.v10start, fkey: 'plan.v10start', placeholder: '10.20.10.x', onInput: (v) => envSet('dhcp.plan.v10start', v, true) }),
          U.field({ label: 'VLAN10 pool end', value: p.v10end, fkey: 'plan.v10end', placeholder: '10.20.10.x', onInput: (v) => envSet('dhcp.plan.v10end', v, true) }),
          U.field({ label: 'VLAN10 gateway', value: p.v10gw, fkey: 'plan.v10gw', placeholder: '10.20.10.x', onInput: (v) => envSet('dhcp.plan.v10gw', v, true) }),
          U.el('div', { class: 'spacer-lg' }),
          U.field({ label: 'VLAN40 pool start', value: p.v40start, fkey: 'plan.v40start', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.plan.v40start', v, true) }),
          U.field({ label: 'VLAN40 pool end', value: p.v40end, fkey: 'plan.v40end', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.plan.v40end', v, true) }),
          U.field({ label: 'VLAN40 gateway', value: p.v40gw, fkey: 'plan.v40gw', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.plan.v40gw', v, true) }),
          U.el('div', { class: 'spacer-lg' }),
          U.field({ label: 'Exclusion start', value: p.exclStart, fkey: 'plan.exclStart', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.plan.exclStart', v, true) }),
          U.field({ label: 'Exclusion end', value: p.exclEnd, fkey: 'plan.exclEnd', placeholder: '10.20.40.x', onInput: (v) => envSet('dhcp.plan.exclEnd', v, true) }),
          U.field({ label: 'Reservation MAC', value: p.resvMac, fkey: 'plan.resvMac', placeholder: '9c:b6:d0:11:22:33', onInput: (v) => envSet('dhcp.plan.resvMac', v, true) }),
          U.field({ label: 'Reservation IP', value: p.resvIp, fkey: 'plan.resvIp', placeholder: '10.20.40.50', onInput: (v) => envSet('dhcp.plan.resvIp', v, true) })),
        U.el('div', { class: 'grid maxw-xl' },
          U.toggle({
            label: 'Enable relay (IP helper) on the VLAN 40 SVI', k: 'plan.relayOn', checked: p.relayOn,
            hint: 'broadcasts leave VLAN 40 as unicast', onChange: (v) => envSet('dhcp.plan.relayOn', v),
          }),
          U.field({ label: 'Relay target — DHCP server', value: p.relayServer, fkey: 'plan.relayServer', placeholder: '10.20.50.x', onInput: (v) => envSet('dhcp.plan.relayServer', v, true) })),
        U.objectiveCheck(lab, 'OBJ-H3'),
      ],
    })
  }

  // ---------- 02 SLAAC ----------
  function slaacModule() {
    const wrap = U.el('div', { class: 'module' })
    if (isServed(['OBJ-M5'])) wrap.appendChild(euiBuilderBench())
    if (isServed(['OBJ-H2'])) wrap.appendChild(raFlagLabBench())
    return wrap
  }

  function euiBuilderBench() {
    const s = store.state.env.slaac

    // live-composed SLAAC address line (updates on every keystroke)
    const statusHost = U.el('div')
    function updateComposed() {
      const raw = (store.state.env.slaac.ifaceId || '').replace(/[:.\-\s]/g, '').toLowerCase()
      statusHost.innerHTML = ''
      if (raw.length === 16) {
        const composed = '2001:db8:40::' + raw.slice(0, 4) + ':' + raw.slice(4, 8) + ':' + raw.slice(8, 12) + ':' + raw.slice(12, 16)
        const flipOk = raw.indexOf('9e') === 0
        const line = U.statusLine(flipOk ? 'ok' : 'idle',
          'Composed SLAAC address: ', U.el('code', { class: 'is-mono' }, composed),
          flipOk ? '' : ' — check the U/L flip: 0x9C (1001 110x) becomes 0x9E (1001 111x).')
        statusHost.appendChild(line)
      }
    }
    updateComposed()

    return U.bench({
      id: 'slaac-eui', title: 'EUI-64 builder', kicker: 'self-addressing', hue: '#1F6F64',
      children: [
        U.el('p', { class: 'bench-intro' },
          'The badge-label printer on the renovated floor receives RA prefix ', U.el('code', { class: 'is-mono' }, '2001:db8:40::/64'),
          ' and self-addresses via SLAAC. Build its EUI-64 interface ID from MAC ',
          U.el('code', { class: 'is-mono' }, '9C:B6:D0:11:22:33'), ': insert ', U.el('code', { class: 'is-mono' }, 'ff:fe'), ' in the middle and flip the U/L bit (7th bit of the first octet). Type the full interface ID, then answer the two addressing questions.'),
        U.el('div', { class: 'grid maxw-2xl' },
          U.field({
            label: 'Interface ID (e.g. xx:xx:xx:ff:fe:xx:xx:xx)', value: s.ifaceId, fkey: 'slaac.ifaceId',
            placeholder: '9e:b6:d0:ff:fe:11:22:33',
            onInput: (v) => { envSet('slaac.ifaceId', v, true); updateComposed() },
          }),
          statusHost,
          U.selectField({
            label: 'Which address does the device ALWAYS also form, regardless of RA prefixes?',
            value: s.linkLocal, options: D.SLAAC_LINK_OPTIONS, fkey: 'slaac.linkLocal',
            onChange: (v) => envSet('slaac.linkLocal', v),
          }),
          U.selectField({
            label: 'Badge terminals are allowlisted by stable address — enable temporary (privacy) addresses for them?',
            value: s.privacy, options: D.SLAAC_PRIVACY_OPTIONS, fkey: 'slaac.privacy',
            onChange: (v) => envSet('slaac.privacy', v),
          })),
        U.el('p', { class: 'bench-footnote' },
          'Reminder from the RA standard: duplicate detection (DAD) runs on the candidate address before it may be used — another reason self-assigned devices still show up in switch binding tables.'),
        U.objectiveCheck(lab, 'OBJ-M5'),
      ],
    })
  }

  function raFlagLabBench() {
    const s = store.state.env.slaac
    const cards = D.RA_DUMPS.map((d) => U.el('div', { class: 'ra-card' },
      U.el('div', { class: 'ra-card-head' },
        U.el('span', { class: 'ra-card-vlan' }, d.vlan),
        U.el('span', { class: 'ra-card-flags' }, 'M=' + d.flags.m + ' O=' + d.flags.o)),
      U.el('pre', { class: 'ra-pre' }, 'TRAINING DATA\n' + d.raw),
      U.selectField({
        label: 'Host addressing outcome', value: s.raOutcomes[d.id] || '',
        options: D.RA_OUTCOME_OPTIONS, fkey: 'raOutcomes.' + d.id,
        onChange: (v) => envSet('slaac.raOutcomes.' + d.id, v),
      })))

    return U.bench({
      id: 'slaac-ra', title: 'RA flag lab', kicker: 'M / O outcomes', hue: '#1F6F64',
      children: [
        U.el('p', { class: 'bench-intro' },
          'Three VLANs, three RA configurations, and ', U.el('strong', null, 'no DHCPv6 server anywhere on this campus'),
          '. Read each dump, predict exactly how hosts address themselves, and name the dump that leaves the lab VLAN broken.'),
        U.el('div', { class: 'grid lg-3 gap-16' }, cards),
        U.el('div', { class: 'maxw-2xl' },
          U.selectField({
            label: 'Which dump breaks its VLAN (no DHCPv6 server exists)?', value: s.brokenRa,
            options: D.RA_DUMPS.map((d) => ({ id: d.id, label: d.id + ' — ' + d.vlan + ' (M=' + d.flags.m + ', O=' + d.flags.o + ')' })),
            fkey: 'slaac.brokenRa', onChange: (v) => envSet('slaac.brokenRa', v),
          })),
        U.objectiveCheck(lab, 'OBJ-H2'),
      ],
    })
  }

  // ---------- 03 DNS ----------
  function dnsModule() {
    const wrap = U.el('div', { class: 'module' })
    if (isServed(['OBJ-M3'])) wrap.appendChild(recordTriageBench())
    if (isServed(['OBJ-M7', 'OBJ-H5'])) wrap.appendChild(resolverWalkBench())
    if (isServed(['OBJ-H4'])) wrap.appendChild(zoneEditorBench())
    if (isServed(['OBJ-M12'])) wrap.appendChild(hardeningBench())
    return wrap
  }

  function recordTriageBench() {
    const tasks = store.state.env.recordTasks
    return U.bench({
      id: 'dns-triage', title: 'Record triage', kicker: 'pick the type', hue: '#7D4A63',
      children: [
        U.el('p', { class: 'bench-intro' },
          'The public zone ', U.el('code', { class: 'is-mono' }, 'meridian.gov'),
          ' needs four things. Choose the record type that carries each answer — values come later, in the zone editor.'),
        U.el('div', { class: 'grid lg-2' },
          D.RECORD_TASKS.map((t) =>
            U.selectField({
              label: t.task, value: tasks[t.id] || '', options: D.RECORD_TYPES.map((x) => ({ id: x, label: x })),
              fkey: 'recordTasks.' + t.id, onChange: (v) => envSet('recordTasks.' + t.id, v),
            }))),
        U.objectiveCheck(lab, 'OBJ-M3'),
      ],
    })
  }

  function resolverWalkBench() {
    const d = store.state.env.dns
    const hard = store.state.mode === 'hard'
    const kids = [
      U.el('p', { class: 'bench-intro' },
        hard
          ? 'Prove the full path: order the five steps of a cold resolution of www.meridian.gov, classify both query styles, then read the cached A record’s TTL from the zone data panel.'
          : 'Line up the five steps of a cold (cache-empty) resolution of www.meridian.gov, then classify the query style used on each leg.'),
      U.seqTray({
        items: D.WALK_STEPS.map((st) => ({ id: st.id, label: st.label, note: st.note })),
        order: d.walk, onOrder: (walk) => envSet('dns.walk', walk),
        ariaLabel: 'DNS resolution steps', k: 'dns-walk',
      }),
      U.el('div', { class: 'grid sm-2 maxw-2xl' },
        U.selectField({ label: 'Client → resolver leg', value: d.walkMode1, options: D.WALK_MODES, fkey: 'dns.walkMode1', onChange: (v) => envSet('dns.walkMode1', v) }),
        U.selectField({ label: 'Resolver → root / TLD / authoritative legs', value: d.walkMode2, options: D.WALK_MODES, fkey: 'dns.walkMode2', onChange: (v) => envSet('dns.walkMode2', v) }),
        hard
          ? U.field({ label: 'TTL of the cached www A answer (seconds)', value: d.ttl, fkey: 'dns.ttl', placeholder: '3600', onInput: (v) => envSet('dns.ttl', v, true) })
          : null),
      U.el('div', { class: 'table-scroll' },
        U.el('table', { class: 'data-table is-mono' },
          U.el('caption', { class: 'table-caption' }, 'zone data · training data'),
          U.el('thead', null, U.el('tr', { class: 'table-head' },
            U.el('th', null, 'Name'), U.el('th', null, 'Type'), U.el('th', null, 'Value'), U.el('th', null, 'TTL'))),
          U.el('tbody', null, D.ZONE_ROWS.map((r) => U.el('tr', { class: 'table-row' },
            U.el('td', null, r.name), U.el('td', null, r.type), U.el('td', null, r.value), U.el('td', null, r.ttl)))))),
    ]
    if (isServed(['OBJ-M7'])) kids.push(U.objectiveCheck(lab, 'OBJ-M7'))
    if (isServed(['OBJ-H5'])) kids.push(U.objectiveCheck(lab, 'OBJ-H5'))
    return U.bench({
      id: 'dns-walk', title: 'Resolver walk',
      kicker: hard ? 'cold walk + TTL evidence' : 'cache → root → TLD → authoritative',
      hue: '#7D4A63', children: kids,
    })
  }

  function zoneEditorBench() {
    const d = store.state.env.dns

    function add() {
      if (!zoneDraft.name.trim() || !zoneDraft.type || !zoneDraft.value.trim()) return
      store.patchEnv((env) => {
        const next = JSON.parse(JSON.stringify(env))
        const rec = {
          id: Date.now(),
          name: zoneDraft.name.trim() === '@' ? '@' : zoneDraft.name.trim(),
          type: zoneDraft.type,
          value: zoneDraft.value.trim(),
        }
        if (zoneDraft.type === 'MX' && zoneDraft.priority.trim()) rec.priority = zoneDraft.priority.trim()
        next.dns.records.push(rec)
        return next
      })
      zoneDraft = { name: '', type: '', value: '', priority: '' }
    }

    const records = d.records
    const apexCname = records.some((r) => (r.name === '@' || r.name === 'meridian.gov' || r.name === 'meridian.gov.') && r.type === 'CNAME')

    const kids = [
      U.el('p', { class: 'bench-intro' },
        'Six requirements from the web team: apex at ', U.el('code', { class: 'is-mono' }, '203.0.113.44'),
        ' · www aliased to the apex · mail host at ', U.el('code', { class: 'is-mono' }, '203.0.113.60'),
        ' · apex mail routed to that host (priority 10) · SPF ', U.el('code', { class: 'is-mono' }, 'v=spf1 mx -all'),
        ' at the apex · a reverse entry for the', U.el('strong', null, ' mail server’s'), ' address. Mind the apex rule: CNAME may never sit at ',
        U.el('code', { class: 'is-mono' }, '@'), '.'),
      U.el('div', { class: 'grid sm-2 lg-5' },
        U.field({ label: 'Name (@ = apex)', value: zoneDraft.name, fkey: 'zone.name', placeholder: '@', onInput: (v) => { zoneDraft.name = v } }),
        U.selectField({ label: 'Type', value: zoneDraft.type, options: D.RECORD_TYPES.map((t) => ({ id: t, label: t })), fkey: 'zone.type', onChange: (v) => { zoneDraft.type = v } }),
        U.field({ label: 'Value', value: zoneDraft.value, fkey: 'zone.value', placeholder: '203.0.113.44 · mail.meridian.gov. · v=spf1 mx -all', onInput: (v) => { zoneDraft.value = v } }),
        U.field({ label: 'Priority (MX only)', value: zoneDraft.priority, fkey: 'zone.priority', placeholder: '10', onInput: (v) => { zoneDraft.priority = v } }),
        U.el('div', { class: 'cell-end' },
          U.el('button', { type: 'button', class: 'btn btn-zone-add', 'data-k': 'zone-add' }, 'Add record'))),
    ]

    if (records.length === 0) {
      kids.push(U.el('p', { class: 'zone-empty' },
        'Zone is empty — build it record by record. Wrong entries are allowed; the inspector will reject them with a reason.'))
    } else {
      const rows = records.map((r) => {
        const rm = U.el('button', {
          type: 'button', class: 'btn-remove btn-remove-sm',
          'aria-label': 'Remove record ' + r.name + ' ' + r.type, 'data-k': 'zone-rm-' + r.id,
        }, '✕')
        rm.addEventListener('click', () => {
          store.patchEnv((env) => {
            const next = JSON.parse(JSON.stringify(env))
            next.dns.records = next.dns.records.filter((x) => x.id !== r.id)
            return next
          })
        })
        return U.el('tr', { class: 'table-row' },
          U.el('td', null, r.name), U.el('td', null, r.type), U.el('td', null, r.priority || '—'), U.el('td', null, r.value),
          U.el('td', null, rm))
      })
      kids.push(U.el('div', { class: 'table-scroll' },
        U.el('table', { class: 'data-table is-mono' },
          U.el('caption', { class: 'table-caption' }, 'candidate zone · training data'),
          U.el('thead', null, U.el('tr', { class: 'table-head' },
            U.el('th', null, 'Name'), U.el('th', null, 'Type'), U.el('th', null, 'Priority'), U.el('th', null, 'Value'), U.el('th', null, ' '))),
          U.el('tbody', null, rows))))
    }

    if (apexCname) {
      kids.push(U.statusLine('bad',
        'Zone inspection: a CNAME at the apex (@) conflicts with the SOA/NS that must live there — authoritative servers will refuse this zone.'))
    }
    kids.push(U.objectiveCheck(lab, 'OBJ-H4'))

    const benchNode = U.bench({ id: 'dns-zone', title: 'Zone editor', kicker: 'meridian.gov — sign-off required', hue: '#7D4A63', children: kids })
    benchNode.querySelector('[data-k="zone-add"]').addEventListener('click', add)
    return benchNode
  }

  function hardeningBench() {
    const d = store.state.env.dns
    return U.bench({
      id: 'dns-harden', title: 'Hardening bench', kicker: 'threat → control', hue: '#7D4A63',
      children: [
        U.el('p', { class: 'bench-intro' },
          'Security review flagged three DNS risks. Pair each with the control that actually answers it — signing, encryption, or path control — then switch all three on.'),
        U.el('div', { class: 'grid lg-3' },
          D.HARDEN_TASKS.map((t) =>
            U.selectField({
              label: t.threat, value: d.hardMatch[t.id] || '', options: D.HARDEN_CONTROLS,
              fkey: 'hardMatch.' + t.id, onChange: (v) => envSet('dns.hardMatch.' + t.id, v),
            }))),
        U.el('div', { class: 'grid lg-3' },
          U.toggle({ label: 'Sign internal zones (DNSSEC) + validate upstream', k: 'dns.tDnssec', checked: d.tDnssec, onChange: (v) => envSet('dns.tDnssec', v) }),
          U.toggle({ label: 'Encrypt resolver traffic (DoT 853 / DoH 443)', k: 'dns.tDot', checked: d.tDot, onChange: (v) => envSet('dns.tDot', v) }),
          U.toggle({ label: 'Egress filter: only the campus resolver may send UDP/53', k: 'dns.tEgress', checked: d.tEgress, onChange: (v) => envSet('dns.tEgress', v) })),
        U.objectiveCheck(lab, 'OBJ-M12'),
      ],
    })
  }

  // ---------- 04/05/06 TIME (NTP · PTP · NTS) ----------
  function timeModule(which) {
    const wrap = U.el('div', { class: 'module' })
    if (which === 'ntp') {
      if (isServed(['OBJ-M8'])) wrap.appendChild(syncClinicBench())
      if (isServed(['OBJ-H6'])) wrap.appendChild(architectureBench())
    }
    if (which === 'ptp') {
      if (isServed(['OBJ-M11'])) wrap.appendChild(clockRoleBench())
    }
    if (which === 'nts') {
      if (isServed(['OBJ-M10'])) wrap.appendChild(ntsBench())
      if (isServed(['OBJ-H7'])) wrap.appendChild(ntsFollowupBench())
    }
    return wrap
  }

  function syncClinicBench() {
    const n = store.state.env.ntp

    function restart() {
      const nn = store.state.env.ntp
      const good = nn.server.trim() === '10.20.50.10' && nn.aclOpen
      store.patchEnv((env) => {
        const next = JSON.parse(JSON.stringify(env))
        next.ntp.restarted = good
        next.ntp.syncMsg = good
          ? 'synchronized to 10.20.50.10 — offset +0.384 ms, reach 377'
          : 'ntpd restarted — still unsynchronized (stratum 16). Fix the source and the path first.'
        return next
      })
    }

    const goodNow = n.server.trim() === '10.20.50.10' && n.aclOpen
    const kids = [
      U.el('p', { class: 'bench-intro' },
        'A VLAN 40 server drifts and its logs argue with the rest of the campus. Read the status output: reach 0 and stratum 16 mean it has never heard from its source. Fix the source ',
        U.el('em', null, 'and'), ' the path, then restart the daemon and read the stratum the client will earn.'),
      U.monoLog({ title: 'ntpctl — vlan40-app01', lines: n.restarted && goodNow ? D.NTP_STATUS_FIXED : D.NTP_STATUS_BROKEN }),
      U.el('div', { class: 'grid maxw-xl' },
        U.field({ label: 'NTP server address', value: n.server, fkey: 'ntp.server', placeholder: '10.20.50.x — the campus time appliance', onInput: (v) => envSet('ntp.server', v, true) }),
        U.toggle({ label: 'ACL rule: allow VLAN 40 → core on UDP/123', k: 'ntp.aclOpen', checked: n.aclOpen, hint: 'the appliance answers only if the path lets you ask', onChange: (v) => envSet('ntp.aclOpen', v) }),
        U.selectField({
          label: 'After the fix, what stratum will this client operate at? (appliance = stratum 2)',
          value: n.stratum, options: D.STRATA_OPTIONS.map((x) => ({ id: x, label: 'stratum ' + x })),
          fkey: 'ntp.stratum', onChange: (v) => envSet('ntp.stratum', v),
        })),
    ]

    const row = U.el('div', { class: 'renew-row' })
    const btn = U.el('button', { type: 'button', class: 'btn btn-restart', 'data-k': 'ntp-restart' }, 'Restart ntpd')
    btn.addEventListener('click', restart)
    row.appendChild(btn)
    if (n.syncMsg) row.appendChild(U.statusLine(n.restarted ? 'ok' : 'bad', n.syncMsg))
    kids.push(row)
    kids.push(U.objectiveCheck(lab, 'OBJ-M8'))

    return U.bench({ id: 'ntp-clinic', title: 'Sync clinic', kicker: 'stratum 16 means: no time', hue: '#B4832A', children: kids })
  }

  function architectureBench() {
    const n = store.state.env.ntp
    return U.bench({
      id: 'ntp-arch', title: 'Architecture board', kicker: 'strata & tech classes', hue: '#B4832A',
      children: [
        U.el('p', { class: 'bench-intro' },
          'Stamp the stratum of all three campus time nodes, then assign the right synchronization technology per service class — and name the tech that is ',
          U.el('strong', null, 'disqualified'), ' for sub-microsecond work.'),
        U.el('div', { class: 'grid lg-3' },
          D.STRATA_NODES.map((nd) =>
            U.selectField({
              label: nd.label, value: n.strata[nd.id] || '',
              options: D.STRATA_OPTIONS.map((x) => ({ id: x, label: 'stratum ' + x })),
              fkey: 'strata.' + nd.id, onChange: (v) => envSet('ntp.strata.' + nd.id, v),
            }))),
        U.el('div', { class: 'grid lg-3' },
          D.TECH_TASKS.map((t) =>
            U.selectField({
              label: t.text, value: n.tech[t.id] || '', options: D.TECH_OPTIONS,
              fkey: 'tech.' + t.id, onChange: (v) => envSet('ntp.tech.' + t.id, v),
            }))),
        U.objectiveCheck(lab, 'OBJ-H6'),
      ],
    })
  }

  function clockRoleBench() {
    const p = store.state.env.ptp
    const aligned =
      p.roles.gnss === 'grandmaster' && p.roles.agg === 'boundary' && p.roles.access === 'transparent' && p.roles.workstations === 'ordinary' && p.hwts
    return U.bench({
      id: 'ptp-roles', title: 'Clock-role board', kicker: 'IEEE 1588 · dispatch annex', hue: '#5F6B37',
      children: [
        U.el('p', { class: 'bench-intro' },
          'The dispatch annex records radio traffic and needs its timeline defensible to ',
          U.el('strong', null, 'sub-microsecond'),
          '. Place every device in its PTP role — time enters at the source, switches regenerate or correct it, endpoints consume it — then enable hardware timestamping (software timestamps are too coarse).'),
        U.el('div', { class: 'grid sm-2' },
          D.PTP_DEVICES.map((dev) =>
            U.selectField({
              label: dev.label, value: p.roles[dev.id] || '', options: D.PTP_ROLES,
              fkey: 'ptpRoles.' + dev.id, onChange: (v) => envSet('ptp.roles.' + dev.id, v),
            }))),
        U.toggle({
          label: 'Hardware timestamping on annex NICs and switches', k: 'ptp.hwts', checked: p.hwts,
          hint: 'the difference between ±120 ns and ±2 ms', onChange: (v) => envSet('ptp.hwts', v),
        }),
        U.statusLine(aligned ? 'ok' : 'idle',
          aligned
            ? 'Annex timeline aligned: offset from grandmaster ±120 ns · BMCA stable · residence-time corrections active.'
            : 'Roles incomplete — the annex timeline is not yet trustworthy.'),
        U.objectiveCheck(lab, 'OBJ-M11'),
      ],
    })
  }

  function ntsBench() {
    const n = store.state.env.nts
    return U.bench({
      id: 'nts-bench', title: 'NTS bench', kicker: 'RFC 8915 · secured time', hue: '#2F5D3A',
      children: [
        U.el('p', { class: 'bench-intro' },
          'After last month’s spoofed-time incident, the campus profile moves to NTS. Order the four steps of a protected time transfer — keys before cookies, cookies before time — then switch the profile on.'),
        U.seqTray({
          items: D.NTS_STEPS.map((st) => ({ id: st.id, label: st.label, note: st.note })),
          order: n.order, onOrder: (order) => envSet('nts.order', order),
          ariaLabel: 'NTS handshake steps', k: 'nts-order',
        }),
        U.el('div', { class: 'maxw-xl' },
          U.toggle({
            label: 'Enable NTS on the campus time profile', k: 'nts.enabled', checked: n.enabled,
            hint: 'NTS-KE on TCP 4460 · NTPv4 + AEAD on UDP 123', onChange: (v) => envSet('nts.enabled', v),
          })),
        U.objectiveCheck(lab, 'OBJ-M10'),
      ],
    })
  }

  function ntsFollowupBench() {
    const n = store.state.env.nts
    function toggleProtect(id, on) {
      const set = new Set(store.state.env.nts.protects)
      if (on) set.add(id)
      else set.delete(id)
      envSet('nts.protects', Array.from(set))
    }
    const checks = D.NTS_REVIEW.protects.map((pp) => {
      const cb = U.el('input', { type: 'checkbox', class: 'checkbox', 'data-k': 'nts-protect-' + pp.id })
      cb.checked = n.protects.indexOf(pp.id) !== -1
      cb.addEventListener('change', () => toggleProtect(pp.id, cb.checked))
      return U.el('label', { class: 'checkbox-row' }, cb, pp.label)
    })
    return U.bench({
      id: 'nts-followup', title: 'Incident follow-up', kicker: 'four-part review', hue: '#2F5D3A',
      children: [
        U.el('p', { class: 'bench-intro' },
          'The incident report needs precision. NTS runs two sub-protocols: name both transports exactly, tick every failure mode it actually stops, and pick the honest limitation.'),
        U.el('div', { class: 'grid sm-3 maxw-3xl' },
          U.field({ label: 'NTS-KE port', value: n.kePort, fkey: 'nts.kePort', placeholder: '4460', onInput: (v) => envSet('nts.kePort', v, true) }),
          U.selectField({ label: 'NTS-KE transport', value: n.keProto, options: D.NTS_KE_PROTO, fkey: 'nts.keProto', onChange: (v) => envSet('nts.keProto', v) }),
          U.field({ label: 'Time transfer port (NTPv4 + extension fields)', value: n.ntpPort, fkey: 'nts.ntpPort', placeholder: '123', onInput: (v) => envSet('nts.ntpPort', v, true) })),
        U.el('fieldset', { class: 'checkbox-group' },
          U.el('legend', { class: 'control-label' }, 'NTS stops… (tick all that apply)'),
          checks),
        U.el('div', { class: 'maxw-xl' },
          U.selectField({
            label: 'The honest limitation — pick it', value: n.notProtects,
            options: D.NTS_REVIEW.notProtects, fkey: 'nts.notProtects',
            onChange: (v) => envSet('nts.notProtects', v),
          })),
        U.objectiveCheck(lab, 'OBJ-H7'),
      ],
    })
  }

  // ---------- 07 Night desk ----------
  function nightDeskModule() {
    const wrap = U.el('div', { class: 'module' })
    if (isServed(['OBJ-M4'])) wrap.appendChild(symptomMatcherBench())
    if (isServed(['OBJ-H1'])) wrap.appendChild(overnightBundleBench())
    if (isServed(['OBJ-H8'])) wrap.appendChild(socFeedBench())
    if (isServed(['OBJ-H9'])) wrap.appendChild(changeOrderBench())
    return wrap
  }

  function symptomMatcherBench() {
    const s = store.state.env.symptoms
    return U.bench({
      id: 'night-symptoms', title: 'Symptom matcher', kicker: 'helpdesk tickets', hue: '#5C5470',
      children: [
        U.el('p', { class: 'bench-intro' },
          'Three tickets, three fingerprints. Each symptom is the classic distress call of exactly one service on this riser.'),
        U.el('div', { class: 'grid lg-3' },
          D.SYMPTOMS.map((t) =>
            U.selectField({
              label: t.text, value: s[t.id] || '', options: D.SYMPTOM_ANSWERS, fkey: 'symptoms.' + t.id,
              onChange: (v) => envSet('symptoms.' + t.id, v),
            }))),
        U.objectiveCheck(lab, 'OBJ-M4'),
      ],
    })
  }

  function overnightBundleBench() {
    const t = store.state.env.night.triage
    const rows = D.OVERNIGHT_ALERTS.map((a) => U.el('div', { class: 'alert-card' },
      U.el('div', { class: 'alert-grid-260' },
        U.el('div', null,
          U.el('span', { class: 'alert-chip' }, a.id + ' · ' + a.time),
          U.el('code', { class: 'alert-code' }, a.text)),
        U.selectField({
          label: 'Classify ' + a.id, value: t[a.id] || '', options: D.TRIAGE_OPTIONS,
          fkey: 'triage.' + a.id, onChange: (v) => envSet('night.triage.' + a.id, v),
        }))))
    return U.bench({
      id: 'night-bundle', title: 'Overnight bundle', kicker: '03:00 monitoring dump', hue: '#5C5470',
      children: [
        U.el('p', { class: 'bench-intro' },
          'Six alerts landed overnight. Three are genuine service failures with one root cause each; three are benign noise that merely looks abnormal. Classify every row — misreading the noise is as wrong as missing the failures.'),
        U.el('div', { class: 'stack-8' }, rows),
        U.objectiveCheck(lab, 'OBJ-H1'),
      ],
    })
  }

  function socFeedBench() {
    const n = store.state.env.night
    const rows = D.SOC_FEED.map((a) => U.el('div', { class: 'alert-card' },
      U.el('div', { class: 'alert-grid-500' },
        U.el('div', null,
          U.el('span', { class: 'alert-chip' }, a.id + ' · ' + a.time),
          U.el('span', { class: 'alert-title' }, a.title),
          U.el('p', { class: 'alert-text' }, a.text)),
        U.selectField({
          label: 'Verdict', value: n.attackSel[a.id] || '', options: D.SOC_VERDICTS,
          fkey: 'attackSel.' + a.id, onChange: (v) => envSet('night.attackSel.' + a.id, v),
        }),
        U.selectField({
          label: 'Control (real attacks)', value: n.attackCtrl[a.id] || '',
          options: D.ATTACK_CONTROLS[a.id] || [], fkey: 'attackCtrl.' + a.id,
          onChange: (v) => envSet('night.attackCtrl.' + a.id, v),
          disabled: n.attackSel[a.id] !== 'real',
        }))))
    return U.bench({
      id: 'night-soc', title: 'SOC feed', kicker: 'attack vs decoy', hue: '#5C5470',
      children: [
        U.el('p', { class: 'bench-intro' },
          'Four live alerts. Three are real attacks against services on this riser; one is a decoy. Classify each, then attach the correct control to every real one.'),
        U.el('div', { class: 'stack-8' }, rows),
        U.objectiveCheck(lab, 'OBJ-H8'),
      ],
    })
  }

  function changeOrderBench() {
    const n = store.state.env.night
    return U.bench({
      id: 'night-change', title: 'Change order', kicker: 'hardening sequence', hue: '#5C5470',
      children: [
        U.el('p', { class: 'bench-intro' },
          'The go-live hardening window has five items. Sequence them so no step locks staff out — one wrong order and the helpdesk phones melt. Then pick the true rationale for why step 1 must be followed immediately by step 2.'),
        U.seqTray({
          items: D.CHANGE_ITEMS.map((c) => ({ id: c.id, label: c.label })),
          order: n.order, onOrder: (order) => envSet('night.order', order),
          ariaLabel: 'Hardening change order', k: 'night-order',
        }),
        U.el('div', { class: 'maxw-2xl' },
          U.selectField({
            label: 'Rationale for steps 1 → 2', value: n.reason, options: D.REASONS,
            fkey: 'night.reason', onChange: (v) => envSet('night.reason', v),
          })),
        U.objectiveCheck(lab, 'OBJ-H9'),
      ],
    })
  }

  // ---------- 09 Handover ----------
  function handoverModule() {
    const wrap = U.el('div', { class: 'module' })

    wrap.appendChild(U.bench({
      id: 'handover-detect', title: 'Detection playbook', kicker: 'data sources → detection logic', hue: '#6B6B45',
      children: [
        U.el('div', { class: 'table-scroll' },
          U.el('table', { class: 'data-table detection-table' },
            U.el('caption', { class: 'table-caption' }, 'field notes · training data'),
            U.el('thead', null, U.el('tr', { class: 'table-head' },
              U.el('th', null, 'Service'), U.el('th', null, 'Data sources'), U.el('th', null, 'Example detection logic'))),
            U.el('tbody', null, D.HANDOVER.detection.map((r) => U.el('tr', { class: 'table-row is-top' },
              U.el('td', { class: 'is-bold' }, r.service),
              U.el('td', null, r.data),
              U.el('td', { class: 'is-mono' }, r.logic)))))),
      ],
    }))

    wrap.appendChild(U.el('div', { class: 'grid lg-2 gap-24' },
      U.bench({
        id: 'handover-blue', title: 'Blue-team takeaways', kicker: 'defend the riser', hue: '#6B6B45',
        children: [U.el('ul', { class: 'dot-list' }, D.HANDOVER.blueTeam.map((t) => U.el('li', null, t)))],
      }),
      U.bench({
        id: 'handover-red', title: 'Red-team mindset', kicker: 'know the why', hue: '#6B6B45',
        children: [U.el('ul', { class: 'dot-list' }, D.HANDOVER.redTeam.map((t) => U.el('li', null, t)))],
      })))

    wrap.appendChild(U.bench({
      id: 'handover-links', title: 'Mitigation references & next steps', kicker: 'official sources', hue: '#6B6B45',
      children: [
        U.el('ul', { class: 'link-list' },
          D.HANDOVER.links.map((l) => U.el('li', null,
            U.el('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', class: 'ext-link' }, l.label + ' ↗')))),
        U.el('p', { class: 'bench-footnote' }, D.HANDOVER.simplifiedNote),
        U.el('div', { class: 'howto-box' },
          U.el('h4', { class: 'howto-title' }, 'What to learn next (N10-009)'),
          U.el('p', { class: 'howto-text' },
            '3.8 Access & management (VPN, SSH, GUI, API, console) — the services that let you reach the gear you just hardened. Then loop back: 5.x Troubleshooting puts every symptom you matched here into methodical practice, and 1.x IP addressing deepens the DHCP/SLAAC foundation.')),
        glossaryDetails('glossary-handover', 'Glossary (repeat, for the road)'),
      ],
    }))

    return wrap
  }

  // ===================================================================
  // PUNCH LIST
  // ===================================================================
  function updatePunchList() {
    const host = document.getElementById('punch-inner')
    if (!host) return
    const snap = snapshotDetails(host)
    host.innerHTML = ''
    const s = store.state
    const modeObjs = s.mode ? Engine.objectivesFor(s.mode) : []
    const doneCount = modeObjs.filter((o) => s.results[o.id] && s.results[o.id].done).length
    const eligible = modeObjs.length > 0 && doneCount === modeObjs.length &&
      !!(s.quizDone[s.mode || 'medium']) && Engine.quizAllAnswered(s.mode, s.quiz)
    const score = Engine.computeScore(s)

    const card = U.el('div', { class: 'punch-card' })
    card.appendChild(U.el('div', { class: 'punch-head' },
      U.el('h2', { class: 'punch-title' }, 'Punch list'),
      U.el('span', { class: 'punch-count' }, doneCount + '/' + modeObjs.length + ' signed off')))

    const bar = U.el('div', {
      class: 'punch-bar', role: 'progressbar',
      'aria-valuenow': String(doneCount), 'aria-valuemin': '0', 'aria-valuemax': String(modeObjs.length),
    })
    const fill = U.el('div', { class: 'punch-fill' })
    fill.style.width = (modeObjs.length ? (doneCount / modeObjs.length) * 100 : 0) + '%'
    bar.appendChild(fill)
    card.appendChild(bar)

    const pillarKeys = Object.keys(D.PILLAR_META)
    pillarKeys.forEach((p) => {
      const rows = modeObjs.filter((o) => o.pillar === p)
      if (rows.length === 0) return
      const group = U.el('div', { class: 'punch-group' },
        U.el('p', { class: 'punch-pillar-label' }, D.PILLAR_META[p].letter + ' · ' + D.PILLAR_META[p].label))
      const ul = U.el('ul', { class: 'punch-list' })
      rows.forEach((o) => {
        const r = s.results[o.id]
        const li = U.el('li')
        const item = U.el('button', {
          type: 'button',
          class: 'punch-item' + (r && r.done ? ' is-done' : ''),
          'aria-label': 'Objective: ' + o.title + '. Status: ' + (r && r.done ? 'passed' : 'open') + '. Open the bench.',
          'data-k': 'punch-' + o.id,
        },
          U.pillarBadge(o.pillar),
          U.el('span', { class: 'punch-item-title' }, o.title))
        const mark = U.el('span', { 'aria-hidden': 'true', class: 'punch-mark' }, r && r.done ? '✓' : '○')
        mark.style.color = r && r.done ? '#2F5D3A' : '#B0563A'
        item.appendChild(mark)
        item.addEventListener('click', () => navigate(o.circuit, benchSlug(o)))
        li.appendChild(item)
        if (r && r.done) {
          li.appendChild(U.el('details', { class: 'punch-why', 'data-did': 'why-' + o.id },
            U.el('summary', { class: 'punch-why-summary' }, 'why it matters'),
            U.el('p', { class: 'punch-why-text' }, o.success)))
        }
        ul.appendChild(li)
      })
      group.appendChild(ul)
      card.appendChild(group)
    })

    const inspector = U.el('div', { class: 'punch-inspector' },
      U.el('p', { class: 'punch-inspector-text' },
        s.quizDone[s.mode || 'medium']
          ? 'Inspector: submitted. Review answers any time on circuit 08.'
          : 'Inspector: ' + (s.mode === 'medium' ? '7 concept questions' : '7 scenario items') + ' await on circuit 08 — sign-off needs them.'))
    if (eligible) {
      inspector.appendChild(U.el('p', { class: 'signoff-line' },
        'Sign-off ready — ', U.stars(score.stars), ' ',
        U.el('span', { class: 'signoff-pct' }, Math.round(score.overall * 100) + '%')))
    }
    card.appendChild(inspector)
    host.appendChild(card)
    restoreDetails(host, snap)
  }

  // ===================================================================
  // DIALOGS
  // ===================================================================
  function openModeDialog() {
    U.openDialog({
      title: 'Switch shift?',
      description: 'Both shifts share the same room and data, but track progress separately. Day Shift is guided with hints; Night Shift strips guidance, adds red herrings, and checks strictly.',
      width: '2xl',
      build: (panel) => {
        const grid = U.el('div', { class: 'dlg-grid-2' })
        const day = U.el('button', { type: 'button', class: 'dlg-mode-btn is-day' },
          U.el('span', { class: 'dlg-mode-title' }, 'Day Shift (Medium)'),
          U.el('span', { class: 'dlg-mode-sub' }, '12 guided objectives · 3-tier hints · tolerant checks'))
        day.addEventListener('click', () => { U.closeDialog(); store.setMode('medium') })
        const night = U.el('button', { type: 'button', class: 'dlg-mode-btn is-night' },
          U.el('span', { class: 'dlg-mode-title is-light' }, 'Night Shift (Hard)'),
          U.el('span', { class: 'dlg-mode-sub is-light' }, '9 deep challenges · red herrings · exact checks'))
        night.addEventListener('click', () => { U.closeDialog(); store.setMode('hard') })
        grid.appendChild(day)
        grid.appendChild(night)
        panel.appendChild(grid)
      },
    })
  }

  function openResetDialog() {
    U.openDialog({
      title: 'Reset the room?',
      description: 'This wipes every saved answer, check result and quiz response in this browser and returns the riser to its pristine, half-commissioned state. There is no undo.',
      width: 'md',
      build: (panel) => {
        const footer = U.el('div', { class: 'dlg-footer' })
        const keep = U.el('button', { type: 'button', class: 'btn btn-ghost' }, 'Keep working')
        keep.addEventListener('click', () => U.closeDialog())
        const wipe = U.el('button', { type: 'button', class: 'btn btn-danger' }, 'Reset everything')
        wipe.addEventListener('click', () => { U.closeDialog(); store.reset() })
        footer.appendChild(keep)
        footer.appendChild(wipe)
        panel.appendChild(footer)
      },
    })
  }

  // ===================================================================
  // COMPLETION MODAL
  // ===================================================================
  function computeFocusAreas(mode) {
    const s = store.state
    const areas = []
    const circuitName = (cid) => D.circuitOf(cid).name
    Engine.objectivesFor(mode).forEach((o) => {
      const r = s.results[o.id]
      if (!r || !r.done) return
      if (r.attempts > 1) {
        areas.push({
          topic: circuitName(o.circuit) + ' — ' + o.title,
          evidence: 'needed ' + r.attempts + ' checks before it passed',
          action: 'Re-run the “' + o.bench + '” bench in ' + circuitName(o.circuit) + ' and read the knowledge-core note at the top of the circuit until the first check passes cold.',
        })
      } else if (r.hints > 0) {
        areas.push({
          topic: circuitName(o.circuit) + ' — ' + o.title,
          evidence: 'passed using ' + r.hints + ' hint' + (r.hints > 1 ? 's' : ''),
          action: 'Revisit the “' + o.bench + '” bench tomorrow and redo it with no hints — hint-free recall is the exam skill.',
        })
      }
    })
    D.QUIZ.filter((x) => x.mode === mode).forEach((q) => {
      const given = s.quiz[q.id]
      if (given !== undefined && given !== q.answer) {
        areas.push({
          topic: 'Inspector — ' + (q.tag || 'knowledge check'),
          evidence: 'answered incorrectly',
          action: 'Re-read that topic in the knowledge core (Pinboard, “the six services at a glance”), then retake the ' + (mode === 'medium' ? 'Day' : 'Night') + ' Shift quiz.',
        })
      }
    })
    return areas
  }

  function maybeCompletion() {
    const s = store.state
    if (!s.mode) return
    if (U.isDialogOpen()) return
    const modeObjs = Engine.objectivesFor(s.mode)
    const doneCount = modeObjs.filter((o) => s.results[o.id] && s.results[o.id].done).length
    const eligible = modeObjs.length > 0 && doneCount === modeObjs.length &&
      !!(s.quizDone[s.mode]) && Engine.quizAllAnswered(s.mode, s.quiz)
    if (eligible && !s.completionSeen) openCompletion()
  }

  function openCompletion() {
    const s = store.state
    const mode = s.mode
    if (!mode) return
    const score = Engine.computeScore(s)
    const focusAreas = computeFocusAreas(mode)
    const pillarKeys = Object.keys(D.PILLAR_META)

    U.openDialog({
      title: 'Go-live sign-off — Building B is online',
      description: 'Every circuit energized, every punch-list item verified, inspector satisfied. Here is your scorecard.',
      width: 'xl',
      scrollable: true,
      onClose: () => store.seenCompletion(),
      build: (panel) => {
        // score panel
        const scorePanel = U.el('div', { class: 'score-panel' },
          U.stars(score.stars),
          U.el('p', { class: 'score-pct' }, Math.round(score.overall * 100) + '%'),
          U.el('p', { class: 'score-label' },
            mode === 'medium' ? 'day shift · guided go-live' : 'night shift · audit under pressure'),
          U.el('p', { class: 'score-breakdown' },
            'objectives ' + Math.round(score.objAvg * 100) + '% · inspector ' + Math.round(score.quizPct * 100) + '% ' +
            '(first-attempt accuracy and hint use shape the stars)'))
        panel.appendChild(scorePanel)

        // focus areas
        const focus = U.el('section', { class: 'focus-section', 'aria-label': 'Focus areas for further study' },
          U.el('h3', { class: 'focus-title' }, 'Focus areas for your next study block'),
          U.el('p', { class: 'focus-sub' }, 'Derived from this run: re-checked objectives, hints used, and inspector answers.'))
        if (focusAreas.length === 0) {
          focus.appendChild(U.el('p', { class: 'focus-empty' },
            U.el('strong', null, 'None recorded'),
            ' — every objective passed on the first check without hints and every inspector answer was correct. Next challenge: run the other shift cold.'))
        } else {
          const ul = U.el('ul', { class: 'focus-list' })
          focusAreas.forEach((f) => {
            ul.appendChild(U.el('li', { class: 'focus-item' },
              U.el('p', { class: 'focus-topic' }, f.topic),
              U.el('p', { class: 'focus-evidence' }, 'Evidence: ' + f.evidence + '.'),
              U.el('p', { class: 'focus-action' }, f.action)))
          })
          focus.appendChild(ul)
        }
        panel.appendChild(focus)

        // pillar checklists
        const pillarWrap = U.el('div', { class: 'pillar-recap' })
        pillarKeys.forEach((p) => {
          const rows = Engine.objectivesFor(mode).filter((o) => o.pillar === p)
          const done = rows.filter((o) => s.results[o.id] && s.results[o.id].done).length
          const block = U.el('div', null,
            U.el('p', { class: 'recap-label' },
              D.PILLAR_META[p].letter + ' · ' + D.PILLAR_META[p].label + ' — ' + done + '/' + rows.length))
          const ul = U.el('ul', { class: 'recap-list' })
          rows.forEach((o) => {
            ul.appendChild(U.el('li', { class: 'recap-item' },
              U.el('span', { 'aria-hidden': 'true', class: 'recap-check' }, '✓'),
              U.el('span', null, o.title)))
          })
          block.appendChild(ul)
          pillarWrap.appendChild(block)
        })
        panel.appendChild(pillarWrap)

        // where next
        panel.appendChild(U.el('div', { class: 'where-next' },
          U.el('strong', null, 'Where next: '),
          'Handover (circuit 09) holds your field notes — the detection playbook, the mitigation set and official references. Then tackle the other shift for the harder version of this room, and move on to N10-009 3.8 (access & management).'))

        // footer
        const footer = U.el('div', { class: 'dlg-footer' })
        const review = U.el('button', { type: 'button', class: 'btn btn-ghost' }, 'Review the room')
        review.addEventListener('click', () => U.closeDialog())
        const handover = U.el('button', { type: 'button', class: 'btn btn-olive' }, 'Open handover notes')
        handover.addEventListener('click', () => {
          store.seenCompletion()
          U.closeDialog()
          navigate('handover')
        })
        footer.appendChild(review)
        footer.appendChild(handover)
        panel.appendChild(footer)
      },
    })
  }

  // ---------------- lab api object ----------------
  const lab = {
    state: () => store.state,
    patchEnv: store.patchEnv,
    check: store.check,
    hint: store.hint,
    pick: store.pick,
    lock: store.lock,
    submitQuiz: store.submitQuiz,
    navigate,
    isServed,
  }

  boot()
})()
