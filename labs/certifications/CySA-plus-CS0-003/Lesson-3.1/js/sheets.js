// ─── CyberLab "Drafting Room" — the six lab sheets (js/sheets.js) ────────────
// Vanilla ports of the original sheet components. Every sheet returns
// { el, scope }: `scope` collects per-sheet store subscriptions that app.js
// disposes when the sheet changes. Content and interaction semantics are
// 1:1 with the original React components.

function SheetScope() {
  const unsubs = []
  return {
    sub(fn) {
      unsubs.push(LabStore.subscribe(fn))
    },
    dispose() {
      unsubs.forEach((u) => u())
      unsubs.length = 0
    },
  }
}

const logTypeName = (id) => LOG_TYPES.find((l) => l.id === id)?.name ?? id

// ═════════════════════════════════ Sheet 1 — Brief & Ref ═════════════════════
function BriefSheet() {
  const scope = SheetScope()
  const root = h('div', { class: 'sheet-stack' })

  // ── C1 · Scenario briefing ──
  const memo = h(
    'div',
    { class: 'memo-card' },
    h('div', { class: 'memo-tab' }, 'Internal memo · classification: internal'),
    h('p', { class: 'memo-meta' }, 'TO: The new security architect (you) · FROM: R. Okafor, CISO · RE: Pre-audit architecture survey'),
    h(
      'div',
      { class: 'memo-body' },
      h('p', null, 'Meridian Logistics runs a 24/7 freight-booking platform. Our network grew by accretion, not design: a hardened perimeter at the top, a ', TermTip('g-seg', 'flat legacy lab'), " bolted to the core at the bottom, and a decade of \u201Ctemporary\u201D rules in between. Last quarter\u2019s tabletop exercise made one thing painfully clear: ", h('strong', { class: 'txt-bright' }, 'we cannot defend — or monitor — what we cannot describe.')),
      h('p', null, 'Your job before the external audit: walk every zone of the blueprint, verify the right ', TermTip('g-telemetry', 'telemetry'), ' is wired from the right places, triage the two hosts that flagged in our health check, and harden the design with ', TermTip('g-seg', 'segmentation'), ', ', TermTip('g-nac', 'NAC'), ' and layered ', TermTip('g-did', 'defense in depth'), '. Then sign off.'),
      h('p', null, 'This exercise is the hands-on companion to ', h('a', { href: 'https://www.comptia.org/certifications/cysa', target: '_blank', rel: 'noopener noreferrer', class: 'ext-link' }, 'CompTIA CySA+ (CS0-003)'), ' ', h('span', { class: 'txt-dim' }, `${LAB_META.objective} — \u201C${LAB_META.objectiveFull}\u201D.`), ' Master it here and the exam version will feel like a review.'),
    ),
    h('p', { class: 'synthetic-chip' }, h('span', { class: 'chip-icon', html: labIcon('shieldCheck') }), 'Synthetic training data · fictional org · nothing leaves this page'),
  )

  const c1 = h(
    'section',
    { 'aria-labelledby': 'c1-heading' },
    SectionTitle('SHEET 1-A · SCENARIO BRIEFING', 'The Site Survey Brief', 'One incident, one audit date, and a network nobody can fully describe. That is why you were hired.'),
    memo,
  )
  hElHeadings(c1)
  root.append(c1)

  // ── C2 · Knowledge core (accordion; kc-why + kc-logs open by default) ──
  const acc = h('div', { class: 'accordion' })
  acc.append(
    AccordionItem('kc-why', true, h('span', { class: 'acc-title' }, h('span', { class: 'acc-icon', html: labIcon('bookOpen') }), 'Why architecture matters in security operations'), [
      h('p', null, h('strong', { class: 'txt-bright' }, 'Architecture defines your attack surface.'), ' Every zone, VLAN and trust boundary is either a door you chose or a door an attacker will choose for you.'),
      h('p', null, h('strong', { class: 'txt-bright' }, 'Architecture defines containment.'), ' ', TermTip('g-seg', 'Segmentation'), ' is what turns \u201Cone compromised host\u201D into an incident instead of an extinction event. ', TermTip('g-dmz', 'DMZ'), ', VLANs and ', TermTip('g-microseg', 'micro-segmentation'), ' each shrink ', TermTip('g-eastwest', 'east–west'), ' blast radius.'),
      h('p', null, h('strong', { class: 'txt-bright' }, 'Architecture defines where evidence is born.'), ' Every log your SIEM ingests comes from a box standing somewhere in the design. Know the design, and you know where to look — and where you are blind. That is the whole job of an analyst on Day 1.'),
    ]),
    AccordionItem('kc-logs', true, h('span', { class: 'acc-title' }, h('span', { class: 'acc-icon', html: labIcon('fileText') }), 'The nine log types — who writes them, what they catch'), [
      h(
        'div',
        { class: 'logtype-grid' },
        LOG_TYPES.map((l) =>
          h(
            'div',
            { class: 'logtype-card' },
            h('p', { class: 'logtype-name' }, l.name),
            h('p', { class: 'logtype-line' }, h('span', { class: 'txt-dim2' }, 'Records: '), l.records),
            h('p', { class: 'logtype-line' }, h('span', { class: 'txt-dim2' }, 'Catches: '), l.detects),
          ),
        ),
      ),
    ]),
    AccordionItem('kc-os', false, h('span', { class: 'acc-title' }, h('span', { class: 'acc-icon', html: labIcon('bookOpen') }), 'Operating system security concepts — Windows & Linux/macOS'), [
      h(
        'div',
        { class: 'os-grid' },
        h(
          'div',
          null,
          h('p', { class: 'os-kicker' }, 'Windows'),
          h('ul', { class: 'disc-list' },
            h('li', null, h('strong', null, 'Registry'), ' — configuration database; Run keys are a classic persistence spot.'),
            h('li', null, h('strong', null, 'WMI'), ' — management framework; permanent event subscriptions can hide code execution.'),
            h('li', null, h('strong', null, 'Group Policy'), ' — domain-wide enforcement of security ', TermTip('g-baseline', 'baselines'), ' (UAC, logging, LAPS).'),
            h('li', null, h('strong', null, 'PowerShell logging'), ' — script-block + transcript logging turns encoded scripts into evidence.'),
          ),
        ),
        h(
          'div',
          null,
          h('p', { class: 'os-kicker' }, 'Linux / macOS'),
          h('ul', { class: 'disc-list' },
            h('li', null, h('strong', null, 'Filesystem permissions'), ' — ownership + mode bits; private keys want ', h('code', { class: 'inline-code' }, '600'), '.'),
            h('li', null, h('strong', null, 'Kernel modules'), ' — loadable kernel code; rogue modules are rootkit territory.'),
            h('li', null, h('strong', null, 'SELinux'), ' — mandatory access control; ', h('em', null, 'Enforcing'), ' blocks, ', h('em', null, 'Permissive'), ' only logs, ', h('em', null, 'Disabled'), ' is naked.'),
          ),
        ),
      ),
    ]),
    AccordionItem('kc-net', false, h('span', { class: 'acc-title' }, h('span', { class: 'acc-icon', html: labIcon('bookOpen') }), 'Network security concepts — the four pillars of this design'), [
      h('p', null, h('strong', { class: 'txt-bright' }, 'Segmentation'), ' — ', TermTip('g-seg', 'zones'), ' (DMZ, VLANs, ', TermTip('g-microseg', 'micro-segmentation'), ') that isolate workloads and cap blast radius.'),
      h('p', null, h('strong', { class: 'txt-bright' }, 'Network access control'), ' — ', TermTip('g-8021x', '802.1X'), ' + ', TermTip('g-posture', 'posture checks'), ': devices must prove identity and health before the port opens.'),
      h('p', null, h('strong', { class: 'txt-bright' }, 'Zero trust'), ' — ', TermTip('g-zt', 'verify explicitly, least privilege, assume breach'), '; network location grants nothing.'),
      h('p', null, h('strong', { class: 'txt-bright' }, 'Defense in depth'), ' — ', TermTip('g-did', 'independent layers'), ' so one failure is never fatal — the design philosophy this entire survey validates.'),
    ]),
  )

  const c2 = h(
    'section',
    { 'aria-labelledby': 'c2-heading', dataset: { pulse: 'ref-shelf' } },
    SectionTitle('SHEET 1-B · KNOWLEDGE CORE', 'The Reference Shelf', 'Everything objective 1.1 expects you to be able to explain. Re-open it whenever a concept blurs.'),
    acc,
  )
  hElHeadings(c2)
  root.append(c2)

  // ── Glossary ──
  const chips = GLOSSARY.map((g) => {
    const trigger = h(
      'button',
      { type: 'button', class: 'glossary-chip', 'aria-label': `${g.term} — show definition` },
      g.term,
    )
    Popover({ trigger, ariaLabel: `Glossary — ${g.term}`, renderCard: () => glossaryCard(g) })
    return trigger
  })
  const c3 = h(
    'section',
    { 'aria-labelledby': 'glossary-heading' },
    SectionTitle('SHEET 1-C · GLOSSARY', "Fourteen terms you must own", "Tap any term for its one-line definition. These carry much of objective 1.1's vocabulary weight."),
    h('div', { class: 'glossary-cloud' }, chips),
  )
  hElHeadings(c3)
  root.append(c3)

  return { el: root, scope }
}

// wire a section's aria-labelledby to its actual SectionTitle heading id
function hElHeadings(section) {
  const h2 = section.querySelector('.section-heading')
  if (h2) {
    if (!h2.id) h2.id = 'st-' + Math.random().toString(36).slice(2, 8)
    section.setAttribute('aria-labelledby', h2.id)
  }
}

function AccordionItem(id, open, triggerContent, bodyChildren) {
  const content = h('div', { class: 'acc-content' + (open ? ' is-open' : ''), id: 'acc-' + id }, bodyChildren)
  const chev = h('span', { class: 'acc-chev' + (open ? ' is-open' : ''), html: labIcon('chevronDown') })
  const btn = h(
    'button',
    { type: 'button', class: 'acc-trigger', 'aria-expanded': open ? 'true' : 'false', 'aria-controls': 'acc-' + id },
    triggerContent,
    chev,
  )
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true'
    btn.setAttribute('aria-expanded', String(!isOpen))
    content.classList.toggle('is-open', !isOpen)
    chev.classList.toggle('is-open', !isOpen)
  })
  return h('div', { class: 'acc-item' }, btn, content)
}

// ═══════════════════════════ Sheet 2 — Blueprint wall ════════════════════════
const AREA_CLASS = {
  edge: 'area-edge',
  dmz: 'area-dmz',
  core: 'area-core',
  corporate: 'area-corporate',
  servers: 'area-servers',
  mgmt: 'area-mgmt',
  lab: 'area-lab',
}

function BlueprintSheet() {
  const scope = SheetScope()
  const root = h('div', { class: 'sheet-stack' })
  let selected = null

  // ── Zone map + inspector ──
  const zoneGrid = h('div', { class: 'zone-grid' })
  const zoneCards = new Map()
  for (const z of ZONES) {
    const card = ZoneCard(z, () => selectZone(z.id))
    zoneCards.set(z.id, card)
    zoneGrid.append(card.el)
  }
  const inspectorBox = h('div', { class: 'inspector' })
  const inspectorCol = h('div', { class: 'inspector-col' }, inspectorBox)

  function renderInspector() {
    inspectorBox.replaceChildren()
    const zone = ZONES.find((z) => z.id === selected) ?? null
    if (!zone) {
      inspectorBox.append(
        h('div', { class: 'inspector-empty' },
          h('span', { class: 'empty-icon', html: labIcon('eye') }),
          h('p', { class: 'empty-line1' }, 'Select a zone on the blueprint'),
          h('p', { class: 'empty-line2' }, "Its callout shows purpose, devices, telemetry, controls and risks."),
        ),
      )
      return
    }
    inspectorBox.append(ZoneInspector(zone))
  }

  function selectZone(id) {
    selected = id
    LabStore.openZone(id)
    zoneCards.forEach((card, zid) => card.setSelected(zid === id))
    renderInspector()
  }
  // "Where to look" for the segmentation objective auto-opens the servers inspector
  scope.sub(() => {
    if (LabStore.pulse === 'seg-panel') selectZone('servers')
  })

  const mapSection = h(
    'section',
    { 'aria-labelledby': 'map-heading' },
    SectionTitle('SHEET 2-A · NETWORK BLUEPRINT', 'The Meridian topology, as-built', "Click any zone to open its inspection callout. Architecture you haven't walked, you don't know."),
    h(
      'div',
      { class: 'bp-grid', dataset: { pulse: 'zone-map' } },
      h(
        'div',
        { class: 'map-panel' },
        h('div', { class: 'internet-banner' }, h('span', { class: 'chip-icon', html: labIcon('globe') }), 'Internet — untrusted'),
        h('p', { class: 'map-arrow', 'aria-hidden': 'true' }, '▼'),
        zoneGrid,
      ),
      inspectorCol,
    ),
  )
  hElHeadings(mapSection)
  root.append(mapSection)
  renderInspector()

  root.append(TelemetryRack(scope))
  root.append(SnippetTray(scope))
  root.append(BehaviorMap(scope))
  if (LabStore.state.mode === 'hard') root.append(RuleEditor(scope))

  return { el: root, scope }
}

function ZoneCard(zone, onSelect) {
  const nameIcon = h('span', { class: 'zone-icon', html: labIcon(zone.icon) })
  const visitedSlot = h('span', { class: 'zone-visited' })
  const el = h(
    'button',
    {
      type: 'button',
      class: 'zone-card ' + AREA_CLASS[zone.area] + (zone.legacy ? ' zone-legacy' : ''),
      'aria-label': `Open inspector for ${zone.name}`,
      'aria-pressed': 'false',
    },
    h('span', { class: 'zone-card-head' }, nameIcon, h('span', { class: 'zone-name' }, zone.name), h('span', { class: 'zone-visited-slot' }, visitedSlot)),
    h('span', { class: 'zone-tag' }, zone.tag),
    zone.telemetry.length > 0
      ? h('span', { class: 'zone-tel-row' }, zone.telemetry.map((t) => h('span', { class: 'teal-chip' }, logTypeName(t))))
      : h('span', { class: 'zone-tel-row' }, h('span', { class: 'rose-chip' }, 'no telemetry')),
  )
  el.addEventListener('click', onSelect)
  const card = {
    el,
    setSelected(on) {
      el.classList.toggle('is-selected', on)
      el.setAttribute('aria-pressed', on ? 'true' : 'false')
    },
    refresh(s) {
      const visited = s.zonesOpened.includes(zone.id)
      visitedSlot.innerHTML = labIcon(visited ? 'checkCircle2' : 'circleDot')
      visitedSlot.classList.toggle('is-visited', visited)
      visitedSlot.classList.toggle('txt-bright2', visited)
      if (visited) visitedSlot.setAttribute('aria-label', 'inspected')
      else visitedSlot.removeAttribute('aria-label')
    },
  }
  card.refresh(LabStore.state)
  return card
}

function ZoneInspector(zone) {
  const logName = logTypeName
  return h(
    'div',
    null,
    h(
      'div',
      { class: 'inspector-head' },
      h('span', { class: 'zone-icon lg', html: labIcon(zone.icon) }),
      h('div', null,
        h('h3', { class: 'inspector-title' }, 'Callout · ', zone.name),
        h('p', { class: 'inspector-tag' }, zone.tag),
      ),
    ),
    h(
      'div',
      { class: 'inspector-body' },
      h('div', null, h('p', { class: 'insp-kicker' }, 'Purpose'), h('p', { class: 'insp-text' }, zone.purpose)),
      h('div', null, h('p', { class: 'insp-kicker' }, 'Devices'), h('ul', { class: 'disc-list insp-list' }, zone.devices.map((d) => h('li', null, d)))),
      h('div', null,
        h('p', { class: 'insp-kicker' }, 'Telemetry produced here'),
        zone.telemetry.length
          ? h('p', { class: 'insp-chips' }, zone.telemetry.map((t) => h('span', { class: 'teal-chip' }, logName(t))))
          : h('p', { class: 'insp-blind' }, 'Nothing. This zone is a monitoring blind spot.'),
      ),
      h('div', null, h('p', { class: 'insp-kicker' }, 'Controls in place'), h('ul', { class: 'disc-list insp-list green' }, zone.controls.map((c) => h('li', null, c)))),
      h('div', null, h('p', { class: 'insp-kicker rose' }, 'Risks'), h('ul', { class: 'disc-list insp-list rose' }, zone.risks.map((r) => h('li', null, r)))),
    ),
    zone.id === 'servers' ? SegPanel() : null,
  )
}

/** Segmentation policy panel — Medium M11 manipulates this state. */
function SegPanel() {
  const rows = SEG_RULES.map((r) => {
    const stateTxt = h('span', { class: 'seg-state' })
    const sw = LabSwitch({
      checked: !!LabStore.state.segmentation[r.id],
      ariaLabel: '',
      onToggle: (c) => {
        LabStore.update((s) => ({ ...s, segmentation: { ...s.segmentation, [r.id]: c } }))
        LabStore.announce(`${r.label} ${c ? 'enabled' : 'disabled'}.`)
      },
    })
    const row = h(
      'div',
      { class: 'seg-row' },
      h('div', { class: 'seg-row-text' },
        h('p', { class: 'seg-label' }, r.label),
        h('p', { class: 'seg-note' }, r.note),
      ),
      h('div', { class: 'seg-row-ctl' }, stateTxt, sw.el),
    )
    const sync = (s) => {
      const on = !!s.segmentation[r.id]
      stateTxt.textContent = on ? 'on' : 'off'
      stateTxt.className = 'seg-state ' + (on ? 'txt-on' : 'txt-off')
      sw.set(on)
      sw.el.setAttribute('aria-label', `${r.label} — ${on ? 'enabled' : 'disabled'}`)
    }
    sync(LabStore.state)
    return { row, sync }
  })
  return h(
    'div',
    { class: 'seg-panel', dataset: { pulse: 'seg-panel' } },
    h('p', { class: 'seg-title' }, h('span', { class: 'chip-icon', html: labIcon('link2') }), 'Proposed policy — VLAN 30 inbound'),
    h('p', { class: 'seg-sub' }, 'Apply the architecture decision: least privilege between zones.'),
    h('div', { class: 'seg-rows' }, rows.map((r) => r.row)),
  )
}

function TelemetryRack(scope) {
  const modules = LOG_TYPES.map((l) => {
    const prewiredBadge = h('span', { class: 'prewired-badge' }, 'pre-wired · audit')
    const arrow = h('p', { class: 'rack-arrow' })
    const sel = LabSelect({
      ariaLabel: `Assign ${l.name} log source to a zone`,
      placeholder: '— unassigned —',
      options: ZONES.map((z) => ({ id: z.id, label: z.name })),
      value: LabStore.state.telemetry[l.id] ?? null,
      triggerClass: 'rack-select',
      contentClass: 'rack-select-content',
      itemClass: 'rack-select-item',
      onChange: (v) => {
        LabStore.update((s) => ({ ...s, telemetry: { ...s.telemetry, [l.id]: v } }))
        LabStore.announce(`${l.name} module wired to ${ZONES.find((z) => z.id === v)?.name}.`)
      },
    })
    const card = h(
      'div',
      { class: 'rack-mod' },
      h('div', { class: 'rack-mod-head' },
        h('span', { class: 'rack-icon', html: labIcon(l.icon) }),
        h('p', { class: 'rack-name' }, l.name),
        prewiredBadge,
      ),
      h('p', { class: 'rack-records' }, l.records),
      h('div', { class: 'rack-ctl' }, sel.el, arrow),
    )
    const sync = (s) => {
      const assigned = s.telemetry[l.id] ?? null
      sel.setValue(assigned)
      card.classList.toggle('is-assigned', !!assigned)
      const zone = ZONES.find((z) => z.id === assigned)
      arrow.textContent = assigned && zone ? `→ ${zone.name}` : ''
      const prewired = s.hardPrewired && assigned && assigned === (HARD_PREWIRED_ERRORS[l.id] ?? l.canonicalZone)
      prewiredBadge.classList.toggle('is-visible', !!prewired)
    }
    sync(LabStore.state)
    return { card, sync }
  })
  const sec = h(
    'section',
    { 'aria-labelledby': 'rack-heading', dataset: { pulse: 'rack' } },
    SectionTitle('SHEET 2-B · TELEMETRY PATCH-BAY', 'Wire every log source to its home', 'Each module records one of the nine log types from CS0-003 1.1. Plug it into the zone whose boxes actually write it.'),
    h('div', { class: 'rack-grid' }, modules.map((m) => m.card)),
    h('p', { class: 'rack-hint' }, 'Stuck? Every zone callout lists the telemetry it produces — cross-reference before you plug.'),
  )
  hElHeadings(sec)
  scope.sub(() => modules.forEach((m) => m.sync(LabStore.state)))
  return sec
}

function SnippetTray(scope) {
  const cards = SNIPPETS.map((sn) => {
    const msgOk = h('p', { class: 'snip-teach' }, sn.teaching)
    const msgBad = h('p', { class: 'snip-wrong' }, 'That source wouldn\u2019t write this line. Re-read who logs what.')
    const ac = AnswerChoice({
      prompt: 'Log type that produced this line',
      options: LOG_TYPES.map((l) => ({ id: l.id, label: l.name })),
      value: LabStore.state.answers[`snip-${sn.id}`] ?? null,
      onChange: (v) => LabStore.setAnswer(`snip-${sn.id}`, v),
    })
    const card = h(
      'div',
      { class: 'snip-card' },
      h('div', { class: 'snip-head' },
        h('p', { class: 'snip-title' }, sn.title),
        h('span', { class: 'pipeline-chip' }, 'live pipeline'),
      ),
      h('pre', { class: 'snip-body' }, sn.body),
      ac.el,
      msgOk,
      msgBad,
    )
    const sync = (s) => {
      const picked = s.answers[`snip-${sn.id}`] ?? null
      ac.refresh(picked)
      card.classList.toggle('is-correct', picked === sn.correct)
      card.classList.toggle('is-wrong', picked !== null && picked !== sn.correct)
      msgOk.classList.toggle('is-visible', picked === sn.correct)
      msgBad.classList.toggle('is-visible', picked !== null && picked !== sn.correct)
    }
    sync(LabStore.state)
    return { card, sync }
  })
  const sec = h(
    'section',
    { 'aria-labelledby': 'snip-heading', dataset: { pulse: 'snippets' } },
    SectionTitle('SHEET 2-C · SNIPPET TRAY', 'Raw telemetry samples — name the source', 'Four lines arrived from the pipeline. Attribute each to the log type that produced it.'),
    h('div', { class: 'snip-grid' }, cards.map((c) => c.card)),
  )
  hElHeadings(sec)
  scope.sub(() => cards.forEach((c) => c.sync(LabStore.state)))
  return sec
}

function BehaviorMap(scope) {
  const rows = BEHAVIORS.map((b, i) => {
    const why = h('p', { class: 'bhv-why' }, b.why)
    const ac = AnswerChoice({
      prompt: 'Best sensor',
      options: LOG_TYPES.map((l) => ({ id: l.id, label: l.name })),
      value: LabStore.state.answers[`bhv-${b.id}`] ?? null,
      onChange: (v) => LabStore.setAnswer(`bhv-${b.id}`, v),
    })
    const row = h(
      'div',
      { class: 'bhv-row' },
      h('p', { class: 'bhv-text' }, h('span', { class: 'bhv-num' }, String(i + 1)), b.text),
      ac.el,
      why,
    )
    const sync = (s) => {
      const picked = s.answers[`bhv-${b.id}`] ?? null
      ac.refresh(picked)
      const ok = picked === b.correct || (b.alt && picked === b.alt)
      row.classList.toggle('is-correct', ok)
      row.classList.toggle('is-wrong', picked !== null && !ok)
      why.classList.toggle('is-visible', ok)
    }
    sync(LabStore.state)
    return { row, sync }
  })
  const sec = h(
    'section',
    { 'aria-labelledby': 'bhv-heading', dataset: { pulse: 'behaviors' } },
    SectionTitle('SHEET 2-D · BEHAVIOR → SENSOR MAPPING', 'Plan the coverage', 'Detection engineering starts here: every attacker behavior maps to the sensor that records it.'),
    h('div', { class: 'bhv-panel' }, rows.map((r) => r.row)),
  )
  hElHeadings(sec)
  scope.sub(() => rows.forEach((r) => r.sync(LabStore.state)))
  return sec
}

/** Hard-mode pseudo-SIEM rule editor (H5). */
function RuleEditor(scope) {
  const domains = [
    { id: 'do-cdn1', label: 'cdn-updates.example' },
    { id: 'do-sync', label: 'meridian-cdn-sync.example' },
    { id: 'do-orders', label: 'orders.meridianlog.example' },
    { id: 'do-any', label: 'any domain' },
  ]
  const hosts = [
    { id: 'ho-any', label: 'Any workstation' },
    { id: 'ho-aw7', label: 'WIN-AW7 (10.10.4.87)' },
    { id: 'ho-web', label: 'WEB-DMZ-01' },
    { id: 'ho-sql', label: 'SQL01' },
  ]
  const dsShort = [{ id: 'ds-fw', label: 'firewall' }, { id: 'ds-prx', label: 'proxy' }, { id: 'ds-dns', label: 'dns' }, { id: 'ds-flow', label: 'netflow' }, { id: 'ds-edr', label: 'endpoint' }]
  const caShort = [{ id: 'ca-one', label: 'once' }, { id: 'ca-60', label: 'fixed 60 s' }, { id: 'ca-hour', label: 'random hourly' }, { id: 'ca-bulk', label: 'bulk' }]
  const seShort = [{ id: 'se-info', label: 'info' }, { id: 'se-low', label: 'low' }, { id: 'se-med', label: 'medium' }, { id: 'se-high', label: 'high' }]
  const label = (list, id) => list?.find((o) => o.id === id)?.label ?? '—'

  const fields = {}
  const mk = (key, prompt, options) => {
    const ac = AnswerChoice({
      prompt,
      options,
      value: LabStore.state.rule[key],
      onChange: (v) => {
        LabStore.update((s) => ({ ...s, rule: { ...s.rule, [key]: v } }))
        LabStore.announce(`Rule field ${key} set.`)
      },
    })
    fields[key] = ac
    return ac.el
  }
  const compiledSpans = {}
  const compiledLine = h(
    'p',
    { class: 'rule-compiled' },
    'search dataset=', (compiledSpans.dataset = h('span', { class: 'rule-val' })),
    ' | where domain=', (compiledSpans.domain = h('span', { class: 'rule-val' })),
    ' | and host=', (compiledSpans.host = h('span', { class: 'rule-val' })),
    ' | cadence=', (compiledSpans.cadence = h('span', { class: 'rule-val' })),
    ' | severity=', (compiledSpans.severity = h('span', { class: 'rule-val' })),
  )

  scope.sub(() => {
    const r = LabStore.state.rule
    for (const k of Object.keys(fields)) fields[k].refresh(r[k])
    compiledSpans.dataset.textContent = label(dsShort, r.dataset)
    compiledSpans.domain.textContent = label(domains, r.domain)
    compiledSpans.host.textContent = label(hosts, r.host)
    compiledSpans.cadence.textContent = label(caShort, r.cadence)
    compiledSpans.severity.textContent = label(seShort, r.severity)
  })
  const sec = h(
    'section',
    { 'aria-labelledby': 'rule-heading', dataset: { pulse: 'rule-editor' } },
    SectionTitle('SHEET 2-E · DETECTION RULE EDITOR (HARD)', 'Write the beacon detection', 'Compose a high-fidelity rule from a log source and conditions. The tuning board rejects anything too broad or too narrow.'),
    h(
      'div',
      { class: 'rule-panel' },
      h('div', { class: 'rule-grid' },
        mk('dataset', 'Dataset', [
          { id: 'ds-fw', label: 'Firewall deny log' },
          { id: 'ds-prx', label: 'Proxy request log' },
          { id: 'ds-dns', label: 'DNS query log' },
          { id: 'ds-flow', label: 'NetFlow' },
          { id: 'ds-edr', label: 'Endpoint process log' },
        ]),
        mk('domain', 'Domain condition', domains),
        mk('host', 'Host condition', hosts),
        mk('cadence', 'Cadence condition', [
          { id: 'ca-one', label: 'Single request' },
          { id: 'ca-60', label: 'Repeated at fixed 60-second intervals' },
          { id: 'ca-hour', label: 'Random hourly' },
          { id: 'ca-bulk', label: 'One bulk download' },
        ]),
        mk('severity', 'Severity', [
          { id: 'se-info', label: 'Informational' },
          { id: 'se-low', label: 'Low' },
          { id: 'se-med', label: 'Medium' },
          { id: 'se-high', label: 'High' },
        ]),
      ),
      h('div', { class: 'rule-out' },
        h('p', { class: 'rule-out-label' }, h('span', { class: 'chip-icon', html: labIcon('terminal') }), 'Compiled rule'),
        compiledLine,
      ),
    ),
  )
  hElHeadings(sec)
  // initial paint of field values + compiled rule
  ;(() => {
    const r = LabStore.state.rule
    for (const k of Object.keys(fields)) fields[k].refresh(r[k])
    compiledSpans.dataset.textContent = label(dsShort, r.dataset)
    compiledSpans.domain.textContent = label(domains, r.domain)
    compiledSpans.host.textContent = label(hosts, r.host)
    compiledSpans.cadence.textContent = label(caShort, r.cadence)
    compiledSpans.severity.textContent = label(seShort, r.severity)
  })()
  return sec
}

// ═══════════════════════════ Sheet 3 — Host evidence ═════════════════════════
function HostSheet() {
  const scope = SheetScope()
  const mode = LabStore.state.mode
  const root = h('div', { class: 'sheet-stack' })

  const intro = SectionTitle('SHEET 3 · HOST EVIDENCE DRAWERS', 'Two hosts flagged in the health check', 'Judge artifacts by context: location, signer, expectation. Hard mode shows two additional artifacts — more data, more noise, more red herrings.')
  root.append(intro)

  const winPanel = h('div', { class: 'host-panel', dataset: { pulse: 'hosts-win' }, role: 'tabpanel', id: 'host-win' })
  const linuxPanel = h('div', { class: 'host-panel', dataset: { pulse: 'hosts-linux' }, role: 'tabpanel', id: 'host-linux' })

  // ── Windows drawer ──
  winPanel.append(
    h('p', { class: 'host-scope' },
      'Endpoint WIN-AW7 · staff workstation, VLAN 10 · user: a.wilson · EDR agent: healthy · ',
      mode === 'hard' ? 'AUDIT SCOPE: SIX artifacts collected (includes advanced persistence sweep).' : 'Scope: four artifacts from the standard sweep.',
    ),
    h('div', { class: 'artifact-list' },
      ARTIFACTS.filter((a) => a.os === 'win' && (mode === 'hard' || !a.hardOnly)).map((a) => ArtifactCard(a, scope)),
    ),
  )

  // ── Linux drawer ──
  linuxPanel.append(
    h('p', { class: 'host-scope' },
      'LNX-BLD1 · legacy build server, flat lab network · no EDR, no central logging · restore the hardened state below.',
    ),
    h('div', { class: 'artifact-list' },
      SelinuxCard(scope),
      ModulesCard(scope),
      PermsCard(scope),
      mode === 'hard' ? JustificationCard(scope) : null,
      AuthLogCard(),
    ),
  )

  function showTab(id) {
    winPanel.hidden = id !== 'win'
    linuxPanel.hidden = id !== 'linux'
  }
  const tabs = TabsNav({
    items: [
      { id: 'win', label: 'WIN-AW7 · Windows 11' },
      { id: 'linux', label: 'LNX-BLD1 · Ubuntu (build)' },
    ],
    value: 'win',
    onChange: showTab,
    ariaLabel: 'Host evidence drawers',
    listClass: 'host-tabs',
    tabClass: 'host-tab',
  })
  showTab('win')
  scope.sub(() => {
    if (LabStore.pulse === 'hosts-win') { tabs.set('win'); showTab('win') }
    if (LabStore.pulse === 'hosts-linux') { tabs.set('linux'); showTab('linux') }
  })

  root.append(tabs.el, winPanel, linuxPanel)
  return { el: root, scope }
}

function ArtifactCard(artifact, scope) {
  const verdict = LabStore.state.judgment[artifact.id] ?? null
  const btnSusp = h('button', { type: 'button', class: 'verdict-btn susp', 'aria-pressed': 'false' }, h('span', { class: 'chip-icon', html: labIcon('shieldX') }), 'Suspicious')
  const btnNorm = h('button', { type: 'button', class: 'verdict-btn norm', 'aria-pressed': 'false' }, h('span', { class: 'chip-icon', html: labIcon('shieldCheck') }), 'Normal')
  const note = h('p', { class: 'artifact-note' }, h('span', { class: 'note-kicker' }, 'Analyst note: '), artifact.note)

  function judge(v) {
    LabStore.update((s) => ({ ...s, judgment: { ...s.judgment, [artifact.id]: v } }))
    LabStore.announce(`${artifact.title} judged ${v}.`)
  }
  btnSusp.addEventListener('click', () => judge('suspicious'))
  btnNorm.addEventListener('click', () => judge('normal'))

  const sync = (s) => {
    const v = s.judgment[artifact.id] ?? null
    btnSusp.classList.toggle('is-active', v === 'suspicious')
    btnSusp.setAttribute('aria-pressed', v === 'suspicious' ? 'true' : 'false')
    btnNorm.classList.toggle('is-active', v === 'normal')
    btnNorm.setAttribute('aria-pressed', v === 'normal' ? 'true' : 'false')
    note.classList.toggle('is-visible', !!v)
  }
  sync(LabStore.state)
  scope.sub(sync)

  return h(
    'div',
    { class: 'artifact-card' },
    h('div', { class: 'artifact-head' },
      h('span', { class: 'chip-icon', html: labIcon('fileWarning') }),
      h('p', { class: 'artifact-title' }, artifact.title),
      h('span', { class: 'kind-chip' }, artifact.kind),
      artifact.hardOnly ? h('span', { class: 'audit-chip' }, 'audit-scope only') : null,
      h('div', { class: 'verdict-group' }, btnSusp, btnNorm),
    ),
    h('pre', { class: 'artifact-body' }, artifact.body),
    note,
  )
}

function SelinuxCard(scope) {
  const modes = [
    { id: 'enforcing', label: 'Enforcing', warn: '' },
    { id: 'permissive', label: 'Permissive', warn: '' },
    { id: 'disabled', label: 'Disabled', warn: 'No mandatory access control at all — the kernel stops nothing.' },
  ]
  const pre = h('pre', { class: 'mono-out' })
  const boxDis = h('p', { class: 'mode-note rose' }, 'Disabled — the kernel now stops nothing. This is the least defensible state a Linux host can be in.')
  const boxPer = h('p', { class: 'mode-note amber' }, 'Permissive — great for tuning, weak for defense: violations are logged, not blocked.')
  const boxEn = h('p', { class: 'mode-note green' }, 'Enforcing — unauthorized module loads and protected-path writes are now blocked at the kernel.')
  const btns = modes.map((m) =>
    h('button', { type: 'button', class: 'selinux-btn', 'aria-pressed': 'false' }, 'setenforce · ', m.label),
  )
  btns.forEach((b, i) =>
    b.addEventListener('click', () => {
      const m = modes[i]
      LabStore.update((s) => ({ ...s, selinux: m.id }))
      LabStore.announce(`SELinux mode set to ${m.label}. ${m.warn}`)
    }),
  )
  const sync = (s) => {
    pre.textContent = s.selinux.charAt(0).toUpperCase() + s.selinux.slice(1)
    btns.forEach((b, i) => {
      const on = s.selinux === modes[i].id
      b.classList.toggle('is-active', on)
      b.setAttribute('aria-pressed', on ? 'true' : 'false')
    })
    boxDis.hidden = s.selinux !== 'disabled'
    boxPer.hidden = s.selinux !== 'permissive'
    boxEn.hidden = s.selinux !== 'enforcing'
  }
  sync(LabStore.state)
  scope.sub(sync)
  return h(
    'div',
    { class: 'linux-card' },
    h('p', { class: 'linux-kicker' }, 'getenforce — current mode'),
    pre,
    h('p', { class: 'linux-note' }, 'SELinux enforces mandatory access control at the kernel. Enforcing ', h('em', null, 'blocks'), ' violations; Permissive only logs them; Disabled leaves the host naked.'),
    h('div', { class: 'btn-row' }, btns),
    boxDis, boxPer, boxEn,
  )
}

function ModulesCard(scope) {
  const rows = LINUX_MODULES.map((m) => {
    const unknown = h('span', { class: 'unknown-chip' }, 'unknown')
    return h(
      'div',
      { class: 'lsmod-row', dataset: { mod: m.name } },
      h('span', { class: 'lsmod-name' }, m.name),
      h('span', { class: 'lsmod-size' }, m.size),
      h('span', null, m.usedBy),
      unknown,
    )
  })
  const flagBtns = LINUX_MODULES.map((m) =>
    h('button', { type: 'button', class: 'flag-btn', 'aria-pressed': 'false' }, 'flag ', m.name),
  )
  flagBtns.forEach((b, i) =>
    b.addEventListener('click', () => {
      const m = LINUX_MODULES[i]
      const next = LabStore.state.moduleFlagged === m.name ? null : m.name
      LabStore.update((s) => ({ ...s, moduleFlagged: next }))
      LabStore.announce(next ? `${m.name} flagged for removal.` : 'Module flag cleared.')
    }),
  )
  const quarantine = h('p', { class: 'quarantine-line' })
  const sync = (s) => {
    rows.forEach((row, i) => {
      const flagged = s.moduleFlagged === LINUX_MODULES[i].name
      row.classList.toggle('is-flagged', flagged)
      const rogue = LINUX_MODULES[i].rogue
      const unk = rogue && !flagged
      row.lastChild.classList.toggle('is-visible', !!unk)
    })
    flagBtns.forEach((b, i) => {
      const on = s.moduleFlagged === LINUX_MODULES[i].name
      b.classList.toggle('is-active', on)
      b.setAttribute('aria-pressed', on ? 'true' : 'false')
    })
    quarantine.textContent = s.moduleFlagged ? `→ quarantined for removal: ${s.moduleFlagged}` : ''
    quarantine.classList.toggle('is-visible', !!s.moduleFlagged)
  }
  sync(LabStore.state)
  scope.sub(sync)
  return h(
    'div',
    { class: 'linux-card' },
    h('p', { class: 'linux-kicker' }, 'lsmod — loaded kernel modules'),
    h('div', { class: 'lsmod-out' },
      h('pre', { class: 'lsmod-header' }, 'Module                  Size  Used by'),
      rows,
    ),
    h('p', { class: 'linux-note' }, 'Flag the module that matches no vendor driver for quarantine (rmmod + investigation). One click flags; a second click unflags.'),
    h('div', { class: 'btn-row' }, flagBtns),
    quarantine,
  )
}

function PermsCard(scope) {
  const ac = AnswerChoice({
    prompt: 'Correct the mode (chmod …)',
    options: [
      { id: '600', label: '600 — owner read/write only' },
      { id: '640', label: '640 — owner rw, group r' },
      { id: '666', label: '666 — everyone rw (keep)' },
      { id: '777', label: '777 — everyone rwx' },
    ],
    value: LabStore.state.answers['lin-perms'] ?? null,
    onChange: (v) => LabStore.setAnswer('lin-perms', v),
  })
  const ok = h('p', { class: 'mode-note green' }, '-rw------- deploy deploy — least privilege restored. Private keys are never group- or world-readable.')
  const sync = (s) => {
    ac.refresh(s.answers['lin-perms'] ?? null)
    ok.classList.toggle('is-visible', s.answers['lin-perms'] === '600')
  }
  sync(LabStore.state)
  scope.sub(sync)
  return h(
    'div',
    { class: 'linux-card' },
    h('p', { class: 'linux-kicker' }, 'filesystem — build key'),
    h('pre', { class: 'mono-out wrap' }, '-rw-rw-rw- 1 deploy deploy 3243 Nov  2 09:14 /srv/build/deploy.key'),
    h('p', { class: 'linux-note' }, 'Every bit set for everyone: any local account (and anything it runs) can read AND modify this private key.'),
    h('div', { class: 'perms-ctl' }, ac.el),
    ok,
  )
}

/** Hard-only: SELinux justification select (feeds H4 validation). */
function JustificationCard(scope) {
  const ac = AnswerChoice({
    prompt: 'Select the correct justification',
    options: LIN_JUST_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
    value: LabStore.state.answers['lin-just'] ?? null,
    onChange: (v) => LabStore.setAnswer('lin-just', v),
  })
  const sync = (s) => ac.refresh(s.answers['lin-just'] ?? null)
  sync(LabStore.state)
  scope.sub(sync)
  return h(
    'div',
    { class: 'linux-card' },
    h('p', { class: 'linux-kicker' }, 'audit memo — why Enforcing?'),
    h('p', { class: 'linux-note' }, 'Your sign-off memo must state WHY this build server needs SELinux Enforcing, not merely Permissive.'),
    ac.el,
  )
}

function AuthLogCard() {
  return h(
    'div',
    { class: 'linux-card' },
    h('p', { class: 'linux-kicker' }, '/var/log/auth.log — excerpt'),
    h('pre', { class: 'mono-out wrap' }, `Nov  4 02:00:01 lnx-bld1 CRON[4123]: session opened for user root (uid=0) by (uid=0)\nNov  4 02:00:01 lnx-bld1 CRON[4123]: /etc/cron.daily/backup ran OK`),
    h('p', { class: 'linux-note' }, 'Routine 02:00 backup cron. Not every 2 a.m. entry is an incident — judging \u201Cnormal\u201D confidently is the same skill as catching the abnormal.'),
  )
}

// ═══════════════════════════ Sheet 4 — Defense & Access ══════════════════════
const DECISIONS = [
  { id: 'allow', label: 'Allow', icon: 'shieldCheck', tone: 'tone-emerald' },
  { id: 'quarantine', label: 'Quarantine', icon: 'userCheck', tone: 'tone-amber' },
  { id: 'deny', label: 'Deny', icon: 'ban', tone: 'tone-rose' },
]

function DefenseSheet() {
  const scope = SheetScope()
  const mode = LabStore.state.mode
  const root = h('div', { class: 'sheet-stack' })

  // ── Defense stack ──
  const stackRows = STACK_LAYERS.map((l) => {
    const sel = LabSelect({
      ariaLabel: `Control for ${l.label}`,
      placeholder: '— select control —',
      options: STACK_CONTROLS.map((c) => ({ id: c.id, label: c.label })),
      value: LabStore.state.stack[l.id] ?? null,
      triggerClass: 'stack-select',
      contentClass: 'stack-select-content',
      itemClass: 'stack-select-item',
      onChange: (v) => {
        LabStore.update((s) => ({ ...s, stack: { ...s.stack, [l.id]: v } }))
        LabStore.announce(`${l.label} control set.`)
      },
    })
    const row = h(
      'div',
      { class: 'stack-row' },
      h('div', { class: 'stack-row-text' },
        h('p', { class: 'stack-label' }, l.label),
        h('p', { class: 'stack-desc' }, l.desc),
      ),
      sel.el,
    )
    const sync = (s) => sel.setValue(s.stack[l.id] ?? null)
    sync(LabStore.state)
    return { row, sync }
  })
  const stackSec = h(
    'section',
    { 'aria-labelledby': 'stack-heading', dataset: { pulse: 'stack' } },
    SectionTitle('SHEET 4-A · DEFENSE STACK', 'Build defense in depth', 'Six independent layers, perimeter to data. Assign one control per layer from the palette of twelve — plausible impostors included.'),
    h('div', { class: 'stack-panel' }, stackRows.map((r, i) => (i < stackRows.length - 1 ? h('div', { class: 'stack-row-wrap' }, r.row) : r.row))),
  )
  hElHeadings(stackSec)
  scope.sub(() => stackRows.forEach((r) => r.sync(LabStore.state)))
  root.append(stackSec)

  // ── NAC access console ──
  const deviceCards = ACCESS_DEVICES.map((d) => DeviceCard(d))
  const accessSec = h(
    'section',
    { 'aria-labelledby': 'access-heading', dataset: { pulse: 'access' } },
    SectionTitle('SHEET 4-B · ACCESS DECISION CONSOLE', 'Work the NAC queue', '802.1X + posture checks decide who gets in, who gets remediated, and who gets nothing.'),
    h('div', { class: 'device-grid' }, deviceCards.map((d) => d.card)),
  )
  hElHeadings(accessSec)
  scope.sub(() => deviceCards.forEach((d) => d.sync(LabStore.state)))
  root.append(accessSec)

  if (mode === 'medium') root.append(TrustSort(scope))
  if (mode === 'hard') root.append(Sequencer(scope))

  return { el: root, scope }
}

function DeviceCard(device) {
  const picked = LabStore.state.answers[`dev-${device.id}`] ?? null
  const pills = DECISIONS.map((d) => {
    const input = h('input', { type: 'radio', name: `dev-${device.id}`, value: d.id, class: 'sr-only' })
    if (picked === d.id) input.checked = true
    input.addEventListener('change', () => LabStore.setAnswer(`dev-${device.id}`, d.id))
    return h(
      'label',
      { class: 'decision-pill dec-' + d.id },
      input,
      h('span', { class: 'pill-icon', html: labIcon(d.icon) }),
      d.label,
    )
  })
  const group = h('div', { class: 'decision-group', role: 'radiogroup', 'aria-label': `Decision for ${device.name}` }, pills)
  const card = h(
    'div',
    { class: 'device-card' },
    h('p', { class: 'device-name' }, device.name),
    h('ul', { class: 'device-facts' }, device.facts.map((f) => h('li', null, h('span', { class: 'fact-dot', 'aria-hidden': 'true' }), f))),
    group,
  )
  const sync = (s) => {
    const v = s.answers[`dev-${device.id}`] ?? null
    pills.forEach((p, i) => {
      const on = v === DECISIONS[i].id
      p.classList.toggle('is-active', on)
      p.querySelector('input').checked = on
    })
  }
  sync(LabStore.state)
  return { card, sync }
}

function TrustSort(scope) {
  const selected0 = LabStore.state.multi['trust'] ?? []
  const rows = TRUST_STATEMENTS.map((t) => {
    const count = h('span', { class: 'trust-count' })
    const input = h('input', { type: 'checkbox', class: 'lab-check', 'aria-label': t.text })
    input.checked = selected0.includes(t.id)
    input.addEventListener('change', () => {
      const selected = LabStore.state.multi['trust'] ?? []
      LabStore.setMulti('trust', input.checked ? [...selected, t.id] : selected.filter((x) => x !== t.id))
    })
    const row = h('label', { class: 'trust-row' }, input, h('span', { class: 'trust-text' }, t.text), count)
    const sync = (s) => {
      const selected = s.multi['trust'] ?? []
      const checked = selected.includes(t.id)
      input.checked = checked
      count.textContent = checked ? `${selected.length}/3` : ''
    }
    sync(LabStore.state)
    return { row, sync }
  })
  const sec = h(
    'section',
    { 'aria-labelledby': 'trust-heading', dataset: { pulse: 'trust' } },
    SectionTitle('SHEET 4-C · TRUST SORT', 'Zero trust or perimeter myth?', 'Select exactly the three genuine zero-trust principles. Myths grant trust because of where something is.'),
    h('div', { class: 'trust-panel' }, rows.map((r) => r.row)),
  )
  hElHeadings(sec)
  scope.sub(() => rows.forEach((r) => r.sync(LabStore.state)))
  return sec
}

/** Hard-mode containment chain builder (H6). */
function Sequencer(scope) {
  const labelOf = (id) => SEQUENCE_POOL.find((a) => a.id === id)?.label ?? id
  const poolList = h('div', { class: 'seq-pool-list' })
  const chainList = h('ol', { class: 'seq-chain-list' })
  const clearBtn = h('button', { type: 'button', class: 'seq-clear' }, h('span', { class: 'chip-icon sm', html: labIcon('rotateCcw') }), 'clear')
  clearBtn.addEventListener('click', () => {
    LabStore.update((s) => ({ ...s, sequence: [] }))
    LabStore.announce('Chain cleared.')
  })
  const fiveHint = h('p', { class: 'seq-five' }, h('span', { class: 'chip-icon', html: labIcon('checkCircle2') }), 'Five steps staged — run CHECK RESULTS on H6.')
  const chainCol = h('div', { class: 'seq-col', dataset: { pulse: 'chain' } },
    h('div', { class: 'seq-col-head' },
      h('p', { class: 'seq-col-title amber' }, h('span', { class: 'chip-icon', html: labIcon('arrowDownUp') }), 'Response chain'),
      clearBtn,
    ),
    chainList,
    fiveHint,
  )
  const poolCol = h('div', { class: 'seq-col' },
    h('p', { class: 'seq-col-title' }, h('span', { class: 'chip-icon', html: labIcon('playCircle') }), 'Action pool (two must stay out)'),
    poolList,
  )

  function rebuild(s) {
    const chain = s.sequence
    poolList.replaceChildren()
    const remaining = SEQUENCE_POOL.filter((a) => !chain.includes(a.id))
    if (remaining.length === 0) {
      poolList.append(h('p', { class: 'seq-empty' }, 'Pool empty — every action is in the chain.'))
    }
    for (const a of remaining) {
      const b = h('button', { type: 'button', class: 'seq-pool-btn' }, a.label)
      b.addEventListener('click', () => {
        LabStore.update((st) => ({ ...st, sequence: [...st.sequence, a.id] }))
        LabStore.announce(`${a.label} — appended to the response chain.`)
      })
      poolList.append(b)
    }
    chainList.replaceChildren()
    chain.forEach((id, i) => {
      const li = h('li', null)
      const b = h(
        'button',
        { type: 'button', class: 'seq-chain-btn', 'aria-label': `Remove step ${i + 1}: ${labelOf(id)}` },
        h('span', { class: 'seq-step-num' }, String(i + 1)),
        h('span', { class: 'seq-step-label' }, labelOf(id)),
        h('span', { class: 'chip-icon dim', html: labIcon('xCircle') }),
      )
      b.addEventListener('click', () => {
        LabStore.update((st) => ({ ...st, sequence: st.sequence.filter((x) => x !== id) }))
        LabStore.announce('Step removed.')
      })
      li.append(b)
      chainList.append(li)
    })
    if (chain.length === 0) {
      chainList.append(h('li', { class: 'seq-empty-box' }, 'Chain empty — click pool actions in the order you would run them.'))
    }
    clearBtn.hidden = chain.length === 0
    fiveHint.classList.toggle('is-visible', chain.length === 5)
  }
  rebuild(LabStore.state)

  const sec = h(
    'section',
    { 'aria-labelledby': 'chain-heading' },
    SectionTitle('SHEET 4-D · CONTAINMENT SEQUENCER (HARD)', 'Order the AW7 response', 'Click actions to append them to the chain; click a chained step to remove it. Contain first, preserve evidence, clean up last.'),
    h('div', { class: 'seq-grid' }, poolCol, chainCol),
  )
  hElHeadings(sec)
  scope.sub(() => rebuild(LabStore.state))
  return sec
}

// ═══════════════════════════ Sheet 5 — Knowledge check ═══════════════════════
function QuizSheet() {
  const scope = SheetScope()
  const mode = LabStore.state.mode ?? 'medium'
  const quiz = quizFor(mode)
  const root = h('div', { class: 'sheet-stack' })

  root.append(SectionTitle('SHEET 5 · KNOWLEDGE CHECK', mode === 'hard' ? 'Audit scenarios' : 'Cert-prep questions',
    mode === 'hard'
      ? 'Seven scenario calls. First answer locks — analyze before you click.'
      : 'Seven concept questions. First answer locks and shows an explanation — think, then commit.'))

  const counter = h('p', { class: 'quiz-counter' })
  const syncCounter = (s) => {
    const answered = quiz.filter((q) => s.quiz[q.id]).length
    counter.textContent = `answered ${answered}/${quiz.length}`
  }
  syncCounter(LabStore.state)
  scope.sub(syncCounter)
  root.append(counter)

  const items = quiz.map((q, i) => QuizItem(q, i + 1, scope))
  const ol = h('ol', { class: 'quiz-list' }, items.map((it) => it.el))
  scope.sub(() => items.forEach((it) => it.sync(LabStore.state)))
  root.append(ol)
  return { el: root, scope }
}

function QuizItem(item, index, scope) {
  const picked0 = LabStore.state.quiz[item.id] ?? null
  const num = h('span', { class: 'quiz-num' }, String(index))
  const scenario = item.scenario ? h('p', { class: 'quiz-scenario' }, item.scenario) : null
  const opts = item.options.map((o) => {
    const input = h('input', { type: 'radio', name: `quiz-${item.id}`, value: o.id, class: 'quiz-radio' })
    if (picked0 === o.id) input.checked = true
    input.addEventListener('change', () => {
      if (LabStore.state.quiz[item.id]) return
      LabStore.update((s) => ({ ...s, quiz: { ...s.quiz, [item.id]: o.id } }))
      LabStore.announce(o.id === item.correct ? 'Correct answer.' : 'Incorrect answer — explanation shown.')
    })
    const label = h('label', { class: 'quiz-opt' }, input, h('span', { class: 'quiz-opt-text' }, o.text))
    return { input, label }
  })
  const iconSpan = h('span', { class: 'pf-icon pf-fail' })
  const strongEl = h('strong', null, '')
  const textEl = h('span', { class: 'quiz-verdict-text' })
  const verdict = h('div', { class: 'quiz-verdict' }, iconSpan, h('span', null, strongEl, ' ', textEl))
  const sync = (s) => {
    const picked = s.quiz[item.id] ?? null
    const locked = picked !== null
    const isCorrect = picked === item.correct
    opts.forEach(({ input, label }) => {
      const isPicked = picked === input.value
      const showRight = locked && input.value === item.correct
      const showWrong = locked && isPicked && input.value !== item.correct
      input.disabled = locked
      label.classList.toggle('is-right', showRight)
      label.classList.toggle('is-wrong', showWrong)
      label.classList.toggle('is-locked', locked && !showRight && !showWrong)
    })
    verdict.classList.toggle('is-visible', locked)
    verdict.classList.toggle('is-correct', isCorrect)
    verdict.classList.toggle('is-wrong', locked && !isCorrect)
    if (locked) {
      iconSpan.innerHTML = labIcon(isCorrect ? 'checkCircle2' : 'xCircle')
      iconSpan.className = 'pf-icon ' + (isCorrect ? 'pf-pass' : 'pf-fail')
      strongEl.textContent = isCorrect ? 'Correct.' : 'Not quite.'
      textEl.textContent = item.explanation
    }
  }
  sync(LabStore.state)
  scope.sub(sync)
  return {
    el: h('li', { class: 'quiz-item' },
      h('div', { class: 'quiz-head' }, num, h('div', { class: 'quiz-q' }, scenario, h('h3', { class: 'quiz-question' }, item.question))),
      h('div', { class: 'quiz-opts' }, opts.map((o) => o.label)),
      verdict,
    ),
    sync,
  }
}

// ═══════════════════════════ Sheet 6 — Field notes ═══════════════════════════
const DETECTION_ROWS = [
  { source: 'Proxy logs', logic: "count by src_host where domain = '*.meridian-cdn-sync.example' and interval ≈ 60 s → web beacon (T1071.001)" },
  { source: 'DNS logs', logic: 'TXT/NULL queries with high-entropy subdomain labels > 20/min from one client → tunneling (T1071.004)' },
  { source: 'Endpoint / EDR', logic: 'registry write to \\CurrentVersion\\Run\\ where target path contains %TEMP% → persistence (T1547.001)' },
  { source: 'Endpoint / EDR', logic: 'powershell.exe -enc with parent WINWORD.EXE → malicious document chain (T1059.001)' },
  { source: 'Security events', logic: '≥ N × 4625 followed by 4624 from same src in 5 min → brute-force check, then context review' },
  { source: 'NetFlow', logic: 'new src→dst pair with > 25 distinct ports/min inside the LAN → lateral recon (east–west)' },
  { source: 'SQL audit', logic: 'new login + bulk reads (>100k rows) off-hours from unusual subnet → staged exfiltration' },
]
const MITIGATION_ROWS = [
  { mid: 'M1030', name: 'Network Segmentation', use: 'Micro-segment VLAN 30; kill the lab bridge; isolate management.' },
  { mid: 'M1037', name: 'Filter Network Traffic', use: 'Remove legacy DMZ→SQL rule; default-deny east–west ACLs.' },
  { mid: 'M1035', name: 'Limit Access to Resource Over Network', use: '802.1X + dynamic quarantine VLAN (NAC).' },
  { mid: 'M1032', name: 'Multi-factor Authentication', use: 'MFA on VPN, jump host and admin accounts.' },
  { mid: 'M1022', name: 'Restrict File and Directory Permissions', use: 'Private keys and key material at 600; service accounts scoped.' },
  { mid: 'M1024', name: 'Restrict Registry Permissions', use: 'Limit who can write autorun locations.' },
  { mid: 'M1040', name: 'Behavior Prevention on Endpoint', use: 'EDR blocking on encoded PowerShell and module loads.' },
  { mid: 'M1047', name: 'Audit', use: 'Registry auditing, PowerShell transcripts, SQL audit — the evidence layer.' },
]

function NotesSheet() {
  const scope = SheetScope()
  const root = h('div', { class: 'sheet-stack' })
  root.append(SectionTitle('SHEET 6 · FIELD NOTES & SIGN-OFF', 'What this architecture taught you', 'The synthesis your sign-off memo should carry: detections to build, mitigations to ship, and the two mindsets to keep.'))

  root.append(
    h('section', { 'aria-labelledby': 'det-heading' },
      h('h3', { id: 'det-heading', class: 'notes-h3' }, h('span', { class: 'chip-icon teal', html: labIcon('bug') }), 'Detection opportunities (data source → example logic)'),
      h('div', { class: 'table-wrap' },
        h('table', { class: 'det-table' },
          h('thead', null, h('tr', null, h('th', null, 'Data source'), h('th', null, 'Example detection logic'))),
          h('tbody', null, DETECTION_ROWS.map((r, i) =>
            h('tr', { class: i % 2 ? 'row-alt' : '' }, h('td', { class: 'det-src' }, r.source), h('td', { class: 'det-logic' }, r.logic)))),
        ),
      ),
    ),
    h('section', { 'aria-labelledby': 'mit-heading' },
      h('h3', { id: 'mit-heading', class: 'notes-h3' }, h('span', { class: 'chip-icon rose', html: labIcon('wrench') }), 'Mitigation recommendations (official ATT&CK IDs)'),
      h('div', { class: 'mit-grid' }, MITIGATION_ROWS.map((m) =>
        h('div', { class: 'mit-card' },
          h('p', { class: 'mit-id' }, m.mid, ' · ', h('span', { class: 'txt-bright' }, m.name)),
          h('p', { class: 'mit-use' }, m.use)))),
    ),
    h('div', { class: 'takeaway-grid' },
      h('section', { 'aria-labelledby': 'blue-heading', class: 'takeaway blue' },
        h('h3', { id: 'blue-heading', class: 'takeaway-h3 blue' }, h('span', { class: 'chip-icon', html: labIcon('shieldCheck') }), 'Blue-team takeaways'),
        h('ul', { class: 'disc-list takeaway-list' },
          h('li', null, 'Architecture is your evidence map: every zone either produces telemetry or hides an attacker.'),
          h('li', null, 'Wire telemetry before the incident — coverage audits belong in change review, not post-mortems.'),
          h('li', null, 'Judge artifacts by context (location, signer, expectation), never by scariness alone.'),
          h('li', null, 'Segmentation is containment you buy once and use for years; NAC stops the uninvited at the port.'),
          h('li', null, 'Baselines only protect you if drift is detected — one drifted host is a blind spot with your name on it.'),
        ),
      ),
      h('section', { 'aria-labelledby': 'red-heading', class: 'takeaway red' },
        h('h3', { id: 'red-heading', class: 'takeaway-h3 red' }, h('span', { class: 'chip-icon', html: labIcon('graduationCap') }), 'Think like the adversary (defensive study)'),
        h('ul', { class: 'disc-list takeaway-list' },
          h('li', null, 'Flat, unmonitored networks are free real estate — no telemetry means no witnesses.'),
          h('li', null, 'Persistence hides inside \u201Cnormal\u201D: run keys, WMI subscriptions, kernel modules, signed tasks.'),
          h('li', null, '\u201CTemporary\u201D rules from 2021 are doors that never closed — legacy access outlives its reason.'),
          h('li', null, 'Implicit trust (VPN = inside, flat management) is the highest-value target in any design.'),
          h('li', null, 'Understanding these patterns defensively is exactly what CS0-003 expects — never to enable misuse.'),
        ),
      ),
    ),
    h('section', { 'aria-labelledby': 'links-heading' },
      h('h3', { id: 'links-heading', class: 'notes-h3' }, 'Official references'),
      h('div', { class: 'ref-links' },
        extLink('https://attack.mitre.org/', 'MITRE ATT&CK'),
        extLink('https://attack.mitre.org/matrices/enterprise/', 'ATT&CK Enterprise matrix'),
        extLink('https://www.comptia.org/certifications/cysa', 'CompTIA CySA+ (CS0-003)'),
      ),
    ),
  )
  return { el: root, scope }
}

function extLink(href, label) {
  return h('a', { href, target: '_blank', rel: 'noopener noreferrer', class: 'ref-link' }, label, h('span', { class: 'chip-icon', html: labIcon('externalLink') }))
}

Object.assign(globalThis, {
  SheetScope, BriefSheet, BlueprintSheet, HostSheet, DefenseSheet, QuizSheet, NotesSheet,
})
