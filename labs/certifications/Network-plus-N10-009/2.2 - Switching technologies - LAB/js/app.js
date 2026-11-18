// ============================================================================
// THE FABRIC BENCH — app shell & wiring (static port of LabRoot/Rail/Console)
// Vanilla re-render architecture:
//   · store notifies → rAF-coalesced update()
//   · region signatures avoid needless DOM churn
//   · focus keys (data-fk) preserve keyboard focus across rebuilds
//   · one delegated listener set — canvas/port/console re-renders never re-bind
// ============================================================================

'use strict'

// ---------------------------------------------------------------------------
// session-local UI state (React useState equivalents; reset on mode switch —
// the original lost these when components unmounted)
// ---------------------------------------------------------------------------
const Session = {
  overlay: null,            // 'workorder'|'manual'|'quiz'|'debrief'|'completion'|'reset'|'tickets'|null
  completionDismissed: false,
  mobilePane: 'fabric',
  logOpen: true,
  lastMode: undefined,
  consoleTab: 'ports',
  lastSelPortConsole: null,
  lastSelPortPorts: null,
  portsSw: 'B1',
  portsOpen: null,
  switchSw: 'CORE',
  nvId: '10',
  nvName: '',
  vlanErr: null,
  testSrc: 'pc-staff1',
  testDst: 'srv-vmi',
  testKind: 'flood',
  testResult: null,
  lastEndSel: null,
  quiz: { idx: 0, picked: null, submitted: false, finished: false },
  hints: {},
  suppressConsole: false,
  suppressRail: false,
  manualTab: 'vlan',
  dialogRefs: {},           // live refs into the open dialog (title/body)
}

function resetSessionForMode() {
  Session.overlay = null
  Session.completionDismissed = false
  Session.consoleTab = 'ports'
  Session.lastSelPortConsole = null
  Session.lastSelPortPorts = null
  Session.portsSw = 'B1'
  Session.portsOpen = null
  Session.switchSw = 'CORE'
  Session.nvId = '10'
  Session.nvName = ''
  Session.vlanErr = null
  Session.testSrc = 'pc-staff1'
  Session.testDst = 'srv-vmi'
  Session.testKind = 'flood'
  Session.testResult = null
  Session.lastEndSel = null
  Session.quiz = { idx: 0, picked: null, submitted: false, finished: false }
  Session.hints = {}
  Session.manualTab = 'vlan'
  Dialog.close(false)
}

// focus-preserving innerHTML swap
function swapHTML(el, html) {
  const fk = document.activeElement?.getAttribute?.('data-fk') || null
  el.innerHTML = html
  if (fk) {
    const again = el.querySelector(`[data-fk="${CSS.escape(fk)}"]`)
    if (again) again.focus({ preventScroll: true })
  }
}

// ---------------------------------------------------------------------------
// region signatures
// ---------------------------------------------------------------------------
let lastRailSig = null
let lastConsoleSig = null
let lastFeedSig = null
let lastQuizSig = null

// ---------------------------------------------------------------------------
// MODE SELECT (full page)
// ---------------------------------------------------------------------------
function renderRoot(s) {
  const app = document.getElementById('app')
  if (!s.mode) {
    Dialog.close(false)
    app.innerHTML = renderModeSelect()
    return
  }
  app.innerHTML = `
  <div class="bench">
    <header class="mast">
      <div class="mast-brand">
        <button type="button" class="fb-back" data-set-mode="" aria-label="Back to mode selection (progress is kept per mode)" title="Back to mode selection — progress is kept per mode">FB</button>
        <div>
          <p class="mast-title">THE FABRIC BENCH</p>
          <p class="mast-sub">N10-009 2.2 · switching technologies · ${s.mode === 'medium' ? 'guided wiring' : 'on-call engineer'}</p>
        </div>
      </div>
      <div class="mast-actions">
        <button type="button" class="mast-btn" data-overlay-open="workorder" data-testid="open-workorder">${icon('ClipboardList', 'ic-14')}Work order</button>
        <button type="button" class="mast-btn" data-overlay-open="manual" data-testid="open-manual">${icon('BookOpenText', 'ic-14')}Manual</button>
        <button type="button" class="mast-btn" data-overlay-open="quiz" data-testid="open-quiz">${icon('GraduationCap', 'ic-14')}Exam bench</button>
        <button type="button" class="mast-btn" data-overlay-open="debrief" data-testid="open-debrief">${icon('Ticket', 'ic-14')}Handover notes</button>
        <button type="button" class="mast-btn mast-accent" data-overlay-open="completion" data-testid="open-completion">${icon('Trophy', 'ic-14')}<span id="trophyCount">0/0</span></button>
        <button type="button" class="mast-btn" data-overlay-open="reset" data-testid="open-reset">${icon('RefreshCcw', 'ic-14')}Reset</button>
      </div>
    </header>

    <div class="pane-switch" role="tablist" aria-label="Bench panes" id="paneSwitch"></div>

    <main class="bench-main">
      <aside id="railPane" class="pane-rail" aria-label="Objectives tracker"><div id="railContent" class="rail-inner"></div></aside>
      <section id="fabricPane" class="pane-fabric" aria-label="Live fabric">
        <div class="fabric-scroll" id="fabricScroll"></div>
        <div id="feedWrap" class="feed-wrap"></div>
      </section>
      <aside id="consolePane" class="pane-console" aria-label="Configuration console"><div id="consoleContent" class="console-inner"></div></aside>
    </main>
  </div>`
  Fabric.init(document.getElementById('fabricScroll'))
  lastRailSig = null
  lastConsoleSig = null
  lastFeedSig = null
  lastQuizSig = null
  updatePanes()
  updateFeed(s)
}

function updatePanes() {
  const sw = document.getElementById('paneSwitch')
  if (!sw) return
  const btn = (id, label) =>
    `<button type="button" role="tab" aria-selected="${Session.mobilePane === id}" data-pane="${id}" class="pane-btn${Session.mobilePane === id ? ' active' : ''}">${label}</button>`
  sw.innerHTML = btn('fabric', 'FABRIC') + btn('console', 'CONSOLE') + btn('tasks', 'TASKS')
  document.getElementById('railPane').classList.toggle('show', Session.mobilePane === 'tasks')
  document.getElementById('fabricPane').classList.toggle('show', Session.mobilePane === 'fabric')
  document.getElementById('consolePane').classList.toggle('show', Session.mobilePane === 'console')
}

function updateMast(s) {
  const defs = OBJECTIVES[s.mode]
  const passed = defs.reduce((acc, d) => acc + (s.data[s.mode].objs[d.id]?.passed ? 1 : 0), 0)
  const el = document.getElementById('trophyCount')
  if (el) el.textContent = `${passed}/${defs.length}`
}

// ---------------------------------------------------------------------------
// EVENT FEED (EventLog)
// ---------------------------------------------------------------------------
function updateFeed(s) {
  const wrap = document.getElementById('feedWrap')
  if (!wrap) return
  const sig = s.log.length + ':' + (s.log.length ? s.log[s.log.length - 1].id : 0) + ':' + Session.logOpen
  if (sig === lastFeedSig) return
  const grew = lastFeedSig !== null && s.log.length > Number(lastFeedSig.split(':')[0])
  lastFeedSig = sig
  const lines = s.log.slice().reverse().map(l => `
    <p class="feed-line"><span class="feed-time">${l.t}</span> <span class="feed-src" style="color:${SEV_COLOR[l.sev]}">${esc(l.src)}</span> <span class="feed-msg">${esc(l.msg)}</span></p>`).join('')
  wrap.innerHTML = `
    <div class="feed">
      <button type="button" class="feed-head" aria-expanded="${Session.logOpen}" data-feed-toggle>
        Event feed — syslog · ICMP · link · STP <span class="feed-count">${s.log.length}</span>
        <span class="feed-chevron lg-hidden">${icon(Session.logOpen ? 'ChevronDown' : 'ChevronUp', 'ic-16')}</span>
      </button>
      ${Session.logOpen ? `
      <div role="log" aria-live="polite" aria-label="Network event feed" class="feed-body">
        ${s.log.length === 0 ? '<p class="feed-empty">Feed quiet. Configure something — the fabric will tell you everything.</p>' : lines}
        <div class="feed-sentinel"></div>
      </div>` : ''}
    </div>`
  // replicate the original's scroll sentinel behavior (scrolls on log growth)
  if (Session.logOpen && grew) {
    const sent = wrap.querySelector('.feed-sentinel')
    if (sent) sent.scrollIntoView({ block: 'nearest' })
  }
}

// ---------------------------------------------------------------------------
// OBJECTIVES RAIL
// ---------------------------------------------------------------------------
function ringSvg(passed, total) {
  const frac = total ? passed / total : 0
  const R = 15, C = 2 * Math.PI * R
  return `<svg width="40" height="40" viewBox="0 0 40 40" role="img" aria-label="${passed} of ${total} objectives passed">
    <circle cx="20" cy="20" r="${R}" fill="none" stroke="#243026" stroke-width="4"></circle>
    <circle cx="20" cy="20" r="${R}" fill="none" stroke="#E8A33D" stroke-width="4" stroke-dasharray="${C * frac} ${C}" stroke-linecap="round" transform="rotate(-90 20 20)" class="ring-arc"></circle>
    <text x="20" y="24" text-anchor="middle" font-size="10" fill="#e7e2d5" font-family="ui-monospace, monospace">${passed}/${total}</text>
  </svg>`
}

function inputControlHtml(def, inp, value, locked) {
  const id = `${def.id}-${inp.key}`
  if (inp.kind === 'number' || inp.kind === 'text') {
    return `<div>
      <label class="lbl" for="${id}">${esc(inp.label)}</label>
      <input id="${id}" type="${inp.kind === 'number' ? 'number' : 'text'}" ${inp.kind === 'number' ? 'inputmode="numeric"' : ''} value="${typeof value === 'string' ? esc(value) : ''}" placeholder="${esc(inp.placeholder ?? '')}" ${locked ? 'disabled' : ''} data-fk="${id}" data-obj="${def.id}" data-key="${inp.key}" data-kind="${inp.kind}" class="fb-input"/>
    </div>`
  }
  if (inp.kind === 'choice') {
    return `<fieldset ${locked ? 'disabled' : ''} class="fb-fieldset">
      <legend class="lbl">${esc(inp.label)}</legend>
      <div class="opt-list">
        ${(inp.options ?? []).map(o => `
          <label class="opt${locked ? ' opt-locked' : String(value) === String(o.value) ? ' opt-sel' : ''}">
            <input type="radio" name="${def.id}-${inp.key}" value="${esc(o.value)}" ${String(value) === String(o.value) ? 'checked' : ''} ${locked ? 'disabled' : ''} data-fk="${id}-${esc(o.value)}" data-obj="${def.id}" data-key="${inp.key}" data-kind="choice" data-value="${esc(o.value)}"/>
            ${esc(o.label)}
          </label>`).join('')}
      </div>
    </fieldset>`
  }
  // multi
  const arr = Array.isArray(value) ? value : []
  return `<fieldset ${locked ? 'disabled' : ''} class="fb-fieldset">
    <legend class="lbl">${esc(inp.label)}</legend>
    <div class="opt-list">
      ${(inp.options ?? []).map(o => {
        const on = arr.includes(o.value)
        return `<label class="opt${locked ? ' opt-locked' : on ? ' opt-sel' : ''}">
          <input type="checkbox" name="${def.id}-${inp.key}" value="${esc(o.value)}" ${on ? 'checked' : ''} ${locked ? 'disabled' : ''} data-fk="${id}-${esc(o.value)}" data-obj="${def.id}" data-key="${inp.key}" data-kind="multi" data-value="${esc(o.value)}"/>
          ${esc(o.label)}
        </label>`
      }).join('')}
    </div>
  </fieldset>`
}

function objectiveCardHtml(def, index, isNext, md) {
  const st = md.objs[def.id]
  const hintsMax = def.hints.length
  const used = st?.hintsUsed ?? 0
  const meta = PILLAR_META[def.pillar]
  const stateIcon = st?.passed
    ? icon('CheckCircle2', 'ic-16 t-green')
    : st?.attempts ? icon('XCircle', 'ic-16 t-red') : icon('Circle', 'ic-16 t-dim2')
  const cls = st?.passed ? 'obj-card passed' : isNext ? 'obj-card next' : 'obj-card'
  return `
  <div class="${cls}" data-testid="objective-${def.id}">
    <div class="obj-top">
      ${stateIcon}
      <div class="obj-main">
        <p class="obj-idline">${index}. ${def.id}</p>
        <p class="obj-title">${esc(def.title)}</p>
        <div class="obj-badges">
          <span class="pillar-badge" style="background-color:${meta.color}1a;color:${meta.color}">${icon(meta.icon, 'ic-12')}${meta.label}</span>
          <span class="anchor-chip">${esc(def.anchor)}</span>
        </div>
        <p class="obj-brief">${esc(def.brief)}</p>
      </div>
    </div>
    ${def.inputs.length > 0 ? `
      <div class="obj-inputs">
        ${def.inputs.map(inp => inputControlHtml(def, inp, st?.answers?.[inp.key], !!st?.passed)).join('')}
      </div>` : ''}
    <div class="obj-actions">
      <button type="button" class="btn btn-accent btn-flex min40" data-check="${def.id}" data-fk="check-${def.id}" data-testid="check-${def.id}">${st?.passed ? 'RE-VERIFY' : 'CHECK RESULTS'}</button>
      <button type="button" class="btn btn-hint min40" data-hint="${def.id}" data-fk="hint-${def.id}" ${st?.passed || used >= hintsMax ? 'disabled' : ''} aria-label="Use hint ${used + 1} of ${hintsMax} (costs stars)">${icon('Lightbulb', 'ic-14')}Hint ${used}/${hintsMax}</button>
    </div>
    ${Session.hints[def.id] ? `<p role="note" class="hint-note">${esc(Session.hints[def.id])}</p>` : ''}
    ${st?.result ? `
      <div aria-live="polite" class="result ${st.result.pass ? 'result-ok' : 'result-bad'}" data-testid="result-${def.id}">
        <p class="result-head">${st.result.pass ? '✓ PASSED' : '✗ NOT YET'}</p>
        <p class="result-text">${esc(st.result.text)}</p>
        ${!st.result.pass && st.result.nearMiss ? `<p class="nearmiss">nudge: ${esc(st.result.nearMiss)}</p>` : ''}
      </div>` : ''}
  </div>`
}

function updateRail(s) {
  const el = document.getElementById('railContent')
  if (!el || Session.suppressRail) { Session.suppressRail = false; return }
  const md = s.data[s.mode]
  const defs = OBJECTIVES[s.mode]
  const sig = JSON.stringify([s.mode, md.objs, Session.hints])
  if (sig === lastRailSig) return
  lastRailSig = sig
  const rating = starRating(md, defs)
  const nextIdx = defs.findIndex(d => !md.objs[d.id]?.passed)
  swapHTML(el, `
    <div class="rail">
      <div class="rail-head">
        ${ringSvg(rating.passed, rating.total)}
        <div class="rail-headtext">
          <p class="rail-mode">${s.mode === 'medium' ? 'Guided wiring' : 'On-call engineer'}</p>
          <p class="rail-progress">${rating.passed}/${rating.total} objectives · hints ${rating.hints}</p>
          <p class="rail-stars" aria-label="Projected rating: ${rating.stars} of 3 stars">${'★'.repeat(rating.stars)}${'☆'.repeat(3 - rating.stars)} <span class="t-dim">(projected)</span></p>
        </div>
      </div>
      <div class="rail-scroll">
        <div class="rail-cards">
          <p class="rail-intro">${s.mode === 'medium'
            ? 'Work top to bottom — each task builds on the last. Hints are free to use; they only cost stars.'
            : 'The ticket board is yours: pick any ticket. Hints cost stars; validation is strict.'}</p>
          ${defs.map((def, i) => objectiveCardHtml(def, i + 1, i === nextIdx, md)).join('')}
        </div>
      </div>
    </div>`)
}

// ---------------------------------------------------------------------------
// CONSOLE
// ---------------------------------------------------------------------------
const ROLE_LABEL = { edge: 'EDGE', uplink: 'UPLINK', crosslink: 'CROSSLINK', spare: 'SPARE' }
const vlanOpts = env => env.vlans.map(v => ({ value: v.id, label: `${v.id} · ${v.name}` }))
const SPEED_OPTS = [{ value: 'auto', label: 'auto' }, { value: '10', label: '10 Mb' }, { value: '100', label: '100 Mb' }, { value: '1000', label: '1 Gb' }]
const DUPLEX_OPTS = [{ value: 'auto', label: 'auto' }, { value: 'half', label: 'half' }, { value: 'full', label: 'full' }]
const MTU_OPTS = [{ value: '1500', label: '1500 (standard)' }, { value: '9000', label: '9000 (jumbo)' }]
const NIC_MTU_OPTS = [{ value: '1500', label: '1500' }, { value: '9000', label: '9000' }]

function chipRow(current, attr, env) {
  return ['CORE', 'B1', 'B2'].map(id =>
    `<button type="button" role="tab" aria-selected="${current === id}" data-${attr}="${id}" class="chip${current === id ? ' active' : ''}">${env.switches[id].hostname}</button>`).join('')
}

function portCardHtml(env, portId) {
  const p = env.ports[portId]
  const end = Object.values(env.ends).find(e => e.portId === portId)
  const neg = portNeg(env, portId)
  const counters = env.counters[portId]
  const dirty = counters.crc + counters.coll + counters.late > 0
  const expanded = Session.portsOpen === portId
  const vlans = vlanOpts(env)
  return `
  <div class="port-card${expanded ? ' open' : ''}">
    <button type="button" class="port-head" aria-expanded="${expanded}" data-port-toggle="${esc(portId)}" data-fk="phead-${esc(portId)}">
      ${icon(expanded ? 'ChevronDown' : 'ChevronRight', 'ic-16 t-mut')}
      <span class="port-name">${esc(p.name)}</span>
      <span class="badge-role">${ROLE_LABEL[p.role]}</span>
      ${p.mode === 'trunk' ? '<span class="badge-trunk">TRUNK</span>' : ''}
      ${!p.enabled ? '<span class="badge-shut">SHUT</span>' : ''}
      ${p.enabled && neg.mismatch ? '<span class="badge-duplex">DUPLEX!</span>' : ''}
      <span class="port-status">${p.enabled ? (neg.down ? 'notconnect' : `${neg.speed}/${neg.duplex}`) : 'disabled'}</span>
    </button>
    ${expanded ? `
    <div class="port-body">
      <div class="row-between">
        <label class="lbl" for="${esc(portId)}-en">Port enabled (no shutdown)</label>
        ${switchHtml(`${portId}-en`, p.enabled, null)}
      </div>
      <div>
        ${capLabel('Description', `${portId}-desc`)}
        <input id="${portId}-desc" class="fb-input" value="${esc(p.description)}" placeholder="e.g. PC-STAFF1" data-fk="${esc(portId)}-desc" data-port-field="description" data-port="${esc(portId)}"/>
      </div>
      ${selectHtml(`${portId}-mode`, 'Switchport mode', p.mode, [
        { value: 'access', label: 'access (one data VLAN, untagged)' },
        { value: 'trunk', label: 'trunk (802.1Q, many VLANs)' },
      ]).replace('data-fk', `data-port="${esc(portId)}" data-port-field="mode" data-fk`)}
      ${p.mode === 'access' ? `
        <div class="grid2">
          ${selectHtml(`${portId}-av`, 'Access VLAN (data)', p.accessVlan, vlans).replace('data-fk', `data-port="${esc(portId)}" data-port-field="accessVlan" data-fk`)}
          ${selectHtml(`${portId}-vv`, 'Voice VLAN (aux)', p.voiceVlan ?? 'none', [{ value: 'none', label: '— none —' }, ...vlans.filter(o => o.value !== p.accessVlan)]).replace('data-fk', `data-port="${esc(portId)}" data-port-field="voiceVlan" data-fk`)}
        </div>` : `
        <div>
          ${capLabel('Allowed VLANs (tagged)')}
          <div class="allowed-box">
            ${env.vlans.map(v => checkHtml(`${portId}-al-${v.id}`, p.allowedVlans.includes(v.id),
              `${v.id} ${v.name !== `VLAN${v.id}` ? v.name : ''}`, `allow VLAN ${v.id}`)
              .replace('data-fk', `data-port="${esc(portId)}" data-port-field="allowedVlans" data-vlan="${v.id}" data-fk`)).join('')}
          </div>
        </div>
        ${selectHtml(`${portId}-nv`, 'Native VLAN (untagged — both ends must match)', p.nativeVlan, vlans).replace('data-fk', `data-port="${esc(portId)}" data-port-field="nativeVlan" data-fk`)}`}
      <div class="grid3">
        ${selectHtml(`${portId}-sp`, 'Speed', String(p.speed), SPEED_OPTS).replace('data-fk', `data-port="${esc(portId)}" data-port-field="speed" data-fk`)}
        ${selectHtml(`${portId}-dx`, 'Duplex', p.duplex, DUPLEX_OPTS).replace('data-fk', `data-port="${esc(portId)}" data-port-field="duplex" data-fk`)}
        ${selectHtml(`${portId}-mtu`, 'MTU', String(p.mtu), MTU_OPTS).replace('data-fk', `data-port="${esc(portId)}" data-port-field="mtu" data-fk`)}
      </div>
      <div class="grid2">
        <div class="toggle-row"><label class="lbl" for="${esc(portId)}-pf">PortFast</label>${switchHtml(`${portId}-pf`, p.portfast, `PortFast on ${p.name}`)}</div>
        <div class="toggle-row"><label class="lbl" for="${esc(portId)}-bg">BPDU Guard</label>${switchHtml(`${portId}-bg`, p.bpduguard, `BPDU Guard on ${p.name}`)}</div>
      </div>
      ${dirty ? `<div class="counters-box">counters · CRC/input err: ${counters.crc} · collisions: ${counters.coll} · late coll: ${counters.late}</div>` : ''}
      ${end ? `<div class="host-line">host: ${esc(end.name)} (${end.kind}) · ${end.ip} · NIC ${String(end.nicSpeed)}/${end.nicDuplex} · MTU ${end.nicMtu}</div>` : ''}
    </div>` : ''}
  </div>`
}

function portsTabHtml(env) {
  const ports = Object.values(env.ports).filter(p => p.switchId === Session.portsSw)
  const host = env.switches[Session.portsSw]
  return `
    <div class="ports-head">
      <div class="chips" role="tablist" aria-label="Select switch">${chipRow(Session.portsSw, 'ports-chip', env)}</div>
      <button type="button" class="btn btn-outline btn-sm" data-fill-desc>Fill descriptions</button>
    </div>
    <p class="floor-line">${esc(host.floor)} · bridge ID ${host.priority}.${host.mac} · ${ports.length} ports</p>
    <div class="console-scroll">
      <div class="port-list">${ports.map(p => portCardHtml(env, p.id)).join('')}</div>
    </div>`
}

function switchTabHtml(env) {
  const s = env.switches[Session.switchSw]
  const stp = computeStp(env)
  return `
    <div class="console-scroll">
      <div class="stack">
        <div class="chips" role="tablist" aria-label="Select switch">${chipRow(Session.switchSw, 'switch-chip', env)}</div>
        <div class="panel">
          <p class="cap">Bridge &amp; STP — ${esc(s.hostname)}</p>
          <div class="grid2">
            ${selectHtml('prio', 'Bridge priority (4096 steps)', String(s.priority), PRIORITIES.map(p => ({ value: p, label: String(p) }))).replace('data-fk', `data-switch="${Session.switchSw}" data-switch-field="priority" data-fk`)}
            ${selectHtml('stpmode', 'STP mode', s.stpMode, STP_VARIANTS.map(v => ({ value: v.name === 'STP' ? '802.1D' : v.name === 'RSTP' ? '802.1w' : v.name === 'MSTP' ? '802.1s' : 'PVST+', label: `${v.name} (${v.std})` }))).replace('data-fk', `data-switch="${Session.switchSw}" data-switch-field="stpMode" data-fk`)}
          </div>
          <div class="toggle-row pad">
            <div>
              <label class="lbl" for="stpen">Spanning tree enabled</label>
              <p class="sub">bypass = maintenance drill, storms love it</p>
            </div>
            ${switchHtml('stpen', s.stpEnabled, null).replace('data-act="switch"', `data-switch="${Session.switchSw}" data-switch-field="stpEnabled" data-act="switch"`)}
          </div>
          ${Session.switchSw === 'CORE' ? `
          <div class="toggle-row pad">
            <div>
              <label class="lbl" for="ipr">IP routing (interVLAN)</label>
              <p class="sub">SVI per VLAN becomes the gateway</p>
            </div>
            ${switchHtml('ipr', s.ipRouting, null).replace('data-act="switch"', `data-switch="${Session.switchSw}" data-switch-field="ipRouting" data-act="switch"`)}
          </div>` : ''}
          <p class="root-line">Current root bridge: <span class="t-amber-b">${stp.root ? esc(env.switches[stp.root].hostname) : 'none — storm'}</span> ${stp.root === Session.switchSw ? icon('Crown', 'ic-12 t-amber') : ''}</p>
        </div>
        <div class="panel">
          <p class="cap">VLAN database</p>
          <div class="vlan-chips">
            ${env.vlans.map(v => `<span class="vlan-chip">${v.id} · ${esc(v.name)}</span>`).join('')}
          </div>
          <div class="vlan-form">
            <div class="w-20">
              ${capLabel('ID', 'nv-id')}
              <input id="nv-id" type="number" min="2" max="4094" class="fb-input" value="${esc(Session.nvId)}" data-fk="nv-id" data-vlan-field="nvId"/>
            </div>
            <div class="grow">
              ${capLabel('Name', 'nv-name')}
              <input id="nv-name" class="fb-input uppercase" value="${esc(Session.nvName)}" placeholder="STUDENTS" data-fk="nv-name" data-vlan-field="nvName"/>
            </div>
            <button type="button" class="btn btn-accent btn-sm" data-vlan-create>Create</button>
          </div>
          ${Session.vlanErr ? `<p role="alert" class="vlan-err">${esc(Session.vlanErr)}</p>` : ''}
        </div>
      </div>
    </div>`
}

function testsTabHtml(env) {
  const ends = Object.values(env.ends)
  const selEnd = ends.find(e => e.id === Session.testSrc)
  const r = Session.testResult
  const jumboCapable = selEnd && isJumboCapable(selEnd)
  let resultHtml = ''
  if (r && Session.testKind === 'flood') {
    resultHtml = `
      <div class="panel flood-result" aria-live="polite">
        <p class="result-title">Broadcast from ${esc(r.srcName)}</p>
        ${r.storm
          ? '<p class="t-red-s">STORM ACTIVE — the loop is circulating everything. Restore spanning tree to measure anything.</p>'
          : `
            <p class="t-green-s">Received by ${r.receivers.length}: ${r.receivers.map(id => esc(env.ends[id].name)).join(', ') || '— nobody —'}</p>
            <p class="t-mut-s">Excluded: ${r.missed.length ? r.missed.map(id => esc(env.ends[id]?.name ?? id)).join(', ') : '—'}</p>
            ${r.blockedHops.length > 0 ? `<p class="t-amber-s">blocked paths: ${r.blockedHops.slice(0, 3).map(esc).join(' · ')}</p>` : ''}`}
      </div>`
  } else if (r) {
    // frame detail: which crossed trunks tag this vlan
    let frame = null
    if (Session.testKind !== 'flood' && r.pathPorts) {
      const vlan = endVlan(env, Session.testSrc)
      const trunks = r.pathPorts.map(id => env.ports[id]).filter(p => p.mode === 'trunk')
      const taggedOn = trunks.filter(p => p.nativeVlan !== vlan)
      frame = { vlan, taggedOn, total: trunks.length }
    }
    resultHtml = `
      <div class="panel ping-result" aria-live="polite">
        <div class="result-row">
          <p class="result-title ${r.ok ? 't-green-b' : 't-red-b'}">${r.ok ? 'REPLY' : 'FAILED'} · ${esc(r.srcName)} → ${esc(r.dstName)} · ${r.size} B</p>
          ${r.routed ? '<span class="routed-badge">ROUTED (L3)</span>' : ''}
        </div>
        ${!r.ok && r.reason ? `<p class="t-red-s">${esc(r.reason)}</p>` : ''}
        ${r.icmp ? `<p class="icmp-box">${esc(r.icmp)}</p>` : ''}
        ${r.nativeWarn ? `<p class="native-warn">${icon('AlertTriangle', 'ic-12 inline')}${esc(r.nativeWarn)}</p>` : ''}
        ${r.ok && r.mismatchHops.length > 0 ? `<p class="t-amber-s">Duplex mismatch at ${esc(r.mismatchHops.join(', '))} — expect retransmissions</p>` : ''}
        ${r.ok && r.minSpeed < 1000 ? `<p class="t-amber-s">Path bottleneck: ${r.minSpeed} Mb/s hop</p>` : ''}
        <div class="hop-walk">
          <p class="hop-head">Hop walk (MTU / negotiated)</p>
          ${r.hops.map(h => `<p class="hop-row${h.mtu < (r.size ?? 64) ? ' hop-bad' : ''}">${esc(h.label)} · MTU ${h.mtu} · ${h.speed || '—'}/${h.duplex}</p>`).join('')}
        </div>
        ${frame ? `
          <div class="frame-detail">
            <p class="cap">Frame detail (simplified)</p>
            ${frame.taggedOn.length > 0
              ? `<p class="frame-line">Tagged <span class="t-amber">VLAN ${frame.vlan}</span> on ${frame.taggedOn.map(p => `${p.switchId} ${esc(p.name)}`).join(', ')} — 4-byte 802.1Q inserted after Source MAC (TPID 0x8100 · PCP 0 · VLAN ID ${frame.vlan}).</p>`
              : `<p class="frame-line">No 802.1Q tag on this path${frame.total > 0 ? ' — the crossed trunk(s) carry this VLAN as their NATIVE VLAN, untagged' : ' — access-to-access switching needs no tag'}.</p>`}
          </div>` : ''}
      </div>`
  }
  return `
    <div class="console-scroll">
      <div class="stack">
        <div class="panel">
          <p class="cap">Packet test bench</p>
          <div class="grid2">
            ${selectHtml('t-src', 'Source host', Session.testSrc, ends.map(e => ({ value: e.id, label: e.name }))).replace('data-fk', 'data-test-sel="src" data-fk')}
            ${selectHtml('t-dst', 'Destination', Session.testDst, ends.filter(e => e.id !== Session.testSrc).map(e => ({ value: e.id, label: e.name }))).replace('data-fk', 'data-test-sel="dst" data-fk')}
          </div>
          <div class="test-btns">
            <button type="button" class="btn btn-ghost-amber" data-test-run="flood">${icon('Radio', 'ic-14')}Broadcast flood</button>
            <button type="button" class="btn btn-ghost-amber" data-test-run="ping">${icon('Zap', 'ic-14')}Ping 64 B</button>
            <button type="button" class="btn btn-ghost-amber" data-test-run="jumbo" ${jumboCapable ? '' : 'disabled'} title="${selEnd && !jumboCapable ? 'Oversized pings are a storage/NAS trick — pick NAS-SAN or SRV-VMI as source' : 'Send an 8972-byte frame'}">${icon('FlaskConical', 'ic-14')}Oversized 8972 B</button>
          </div>
          ${selEnd && !jumboCapable ? '<p class="test-note">Oversized pings make sense from the storage hosts (NAS-SAN, SRV-VMI) — that is where jumbo lives.</p>' : ''}
        </div>
        ${resultHtml}
        ${selEnd ? `
        <div class="panel">
          <p class="cap">End-system editor — ${esc(selEnd.name)}</p>
          <p class="sub">${selEnd.ip} · MAC ${selEnd.mac} · port ${env.ports[selEnd.portId].switchId} ${env.ports[selEnd.portId].name}</p>
          <div class="grid3">
            ${selectHtml('nic-sp', 'NIC speed', String(selEnd.nicSpeed), SPEED_OPTS).replace('data-fk', `data-end="${selEnd.id}" data-end-field="nicSpeed" data-fk`)}
            ${selectHtml('nic-dx', 'NIC duplex', selEnd.nicDuplex, DUPLEX_OPTS).replace('data-fk', `data-end="${selEnd.id}" data-end-field="nicDuplex" data-fk`)}
            ${selectHtml('nic-mtu', 'NIC MTU', String(selEnd.nicMtu), NIC_MTU_OPTS).replace('data-fk', `data-end="${selEnd.id}" data-end-field="nicMtu" data-fk`)}
          </div>
        </div>` : ''}
      </div>
    </div>`
}

function diagTabHtml(env) {
  const stp = computeStp(env)
  const roleLabel = { root: 'ROOT port', designated: 'designated', alternate: 'ALTERNATE (blocking)', disabled: '—' }
  const rows = Object.values(env.ports).filter(p => p.role !== 'spare').flatMap(p => {
    const neg = portNeg(env, p.id)
    const end = Object.values(env.ends).find(e => e.portId === p.id)
    const linkOther = env.links.find(l => l.a === p.id || l.b === p.id)
    if (!end && !linkOther) return []
    const c = env.counters[p.id]
    const other = linkOther ? env.ports[linkOther.a === p.id ? linkOther.b : linkOther.a] : null
    return [`
      <div class="diag-row${neg.mismatch ? ' mismatch' : ''}">
        <p class="diag-target">${p.switchId} ${esc(p.name)} ${other ? `↔ ${other.switchId} ${esc(other.name)}` : end ? `→ ${esc(end.name)}` : ''}</p>
        <p class="diag-neg">cfg ${String(p.speed)}/${p.duplex} → negotiated <span class="${neg.mismatch ? 't-amber-b' : 't-green-s'}">${neg.down ? 'DOWN (speed mismatch)' : `${neg.speed}/${neg.duplex}`}</span>${neg.mismatch ? '<span class="t-amber-b"> DUPLEX MISMATCH</span>' : ''}${stp.blockedPorts.includes(p.id) ? '<span class="t-red-s"> · STP blocking</span>' : ''}</p>
        ${(c.crc + c.coll + c.late > 0) ? `<p class="t-amber-s">CRC ${c.crc} · coll ${c.coll} · late ${c.late}</p>` : ''}
      </div>`]
  }).join('')
  const swBlocks = ['CORE', 'B1', 'B2'].map(id => {
    const s = env.switches[id]
    const ps = Object.values(env.ports).filter(p => p.switchId === id && (p.role === 'uplink' || p.role === 'crosslink'))
    return `
      <div class="sw-block">
        <p class="sw-block-head">${esc(s.hostname)} · BID ${s.priority}.${s.mac} · ${s.stpMode}${s.stpEnabled ? '' : ' (BYPASSED)'}</p>
        ${ps.map(p => {
          const st = stp.ports[p.id]
          return `<p class="${st?.state === 'BLK' ? 't-red-s' : st?.role === 'root' ? 't-green-s' : 't-mut-s'}">${esc(p.name)}: ${roleLabel[st?.role ?? 'disabled']} · ${st?.state === 'BLK' ? 'BLOCKING' : st?.state === 'DOWN' ? 'down' : 'forwarding'}${st?.rootCost ? ` · root path cost ${st.rootCost}` : ''}</p>`
        }).join('')}
      </div>`
  }).join('')
  return `
    <div class="console-scroll">
      <div class="stack">
        <div class="panel">
          <p class="cap">${icon('Activity', 'ic-14')}Link diagnostics — configured vs negotiated</p>
          <div class="diag-rows">${rows}</div>
        </div>
        <div class="panel">
          <p class="cap">${icon('Wrench', 'ic-14')}STP view ${stp.storm ? '<span class="t-red-s">— STORM ACTIVE</span>' : ''}</p>
          <p class="root-line2">Root bridge: <span class="t-amber-b">${stp.root ? `${esc(env.switches[stp.root].hostname)} (${env.switches[stp.root].priority}.${env.switches[stp.root].mac})` : 'none'}</span></p>
          ${stp.stpOffSwitches.length > 0 ? `<p class="t-red-s">STP administratively off: ${stp.stpOffSwitches.map(x => esc(env.switches[x].hostname)).join(', ')}</p>` : ''}
          <div class="sw-blocks">${swBlocks}</div>
          <p class="simplification">Simplified STP: election by lowest bridge ID (priority, then MAC); root paths by cost (1 Gb = 4, 100 Mb = 19); ties by bridge ID.</p>
        </div>
      </div>
    </div>`
}

function updateConsole(s) {
  const el = document.getElementById('consoleContent')
  if (!el) return
  // render-phase diffs (original PortsTab/Console/TestsTab effects)
  if (s.selectedPort !== Session.lastSelPortConsole) {
    Session.lastSelPortConsole = s.selectedPort
    if (s.selectedPort) Session.consoleTab = 'ports'
  }
  if (s.selectedPort !== Session.lastSelPortPorts) {
    Session.lastSelPortPorts = s.selectedPort
    const p = s.selectedPort ? s.data[s.mode].env.ports[s.selectedPort] : null
    if (p) { Session.portsSw = p.switchId; Session.portsOpen = s.selectedPort }
  }
  if (s.selectedEnd !== Session.lastEndSel) {
    Session.lastEndSel = s.selectedEnd
    if (s.selectedEnd) Session.testSrc = s.selectedEnd
  }
  if (Session.suppressConsole) { Session.suppressConsole = false; return }
  const env = s.data[s.mode].env
  const sig = JSON.stringify([s.mode, env, s.selectedPort, s.selectedEnd, Session.consoleTab, Session.portsOpen, Session.portsSw, Session.testSrc, Session.testDst, Session.testKind, Session.testResult, Session.vlanErr, Session.switchSw])
  if (sig === lastConsoleSig) return
  lastConsoleSig = sig
  const tabs = [['ports', 'PORTS'], ['switch', 'SWITCH'], ['tests', 'TESTS'], ['diag', 'DIAG']]
  const tabBar = `
    <div class="console-tabs" role="tablist" aria-label="Console sections">
      ${tabs.map(([id, label]) => `<button type="button" role="tab" aria-selected="${Session.consoleTab === id}" data-console-tab="${id}" class="console-tab${Session.consoleTab === id ? ' active' : ''}">${label}</button>`).join('')}
    </div>`
  const body = Session.consoleTab === 'ports' ? portsTabHtml(env)
    : Session.consoleTab === 'switch' ? switchTabHtml(env)
    : Session.consoleTab === 'tests' ? testsTabHtml(env)
    : diagTabHtml(env)
  swapHTML(el, tabBar + `<div class="console-body">${body}</div>`)
}

// ---------------------------------------------------------------------------
// OVERLAY SYNCHRONIZATION (gating identical to LabRoot's derived state)
// ---------------------------------------------------------------------------
function syncOverlay(s) {
  const md = s.data[s.mode]
  const defs = OBJECTIVES[s.mode]
  const completed = allPassed(md, defs)
  const woOpen = Session.overlay === 'workorder' || !md.flags.briefingSeen
  const ticketsOpen = !woOpen && s.mode === 'hard' && md.flags.briefingSeen && !md.flags.ticketsRead
  const completionOpen = Session.overlay === 'completion' || (!woOpen && !ticketsOpen && completed && !Session.completionDismissed)

  let which = null
  if (woOpen) which = 'workorder'
  else if (ticketsOpen) which = 'tickets'
  else if (Session.overlay) which = Session.overlay
  else if (completionOpen) which = 'completion'

  if (which !== Dialog.openId) {
    if (which) {
      openOverlayDialog(which, s)
      if (which === 'quiz') refreshQuizDialog(s) // quiz body is rendered by the refresher
    } else Dialog.close(false)
    return
  }
  if (which === 'quiz') refreshQuizDialog(s)
  if (which === 'completion') refreshCompletionDialog(s)
}

function attachTabbedDialog(panel, spec, onTab) {
  const body = panel.querySelector('.dialog-body')
  const render = (tabId) => {
    Session.manualTab = tabId
    const tab = spec.tabs.find(t => t.id === tabId)
    body.innerHTML = `
      <div class="manual-tabs" role="tablist">
        ${spec.tabs.map(t => `<button type="button" role="tab" aria-selected="${t.id === tabId}" data-manual-tab="${t.id}" class="manual-tab${t.id === tabId ? ' active' : ''}">${t.label}</button>`).join('')}
      </div>
      <div class="manual-scroll">${tab.body()}</div>`
  }
  render(spec.tabs[0].id)
  body.addEventListener('click', e => {
    const b = e.target.closest('[data-manual-tab]')
    if (b) render(b.dataset.manualTab)
  })
}

function openOverlayDialog(which, s) {
  const md = s.data[s.mode]
  let spec
  if (which === 'workorder') {
    spec = buildWorkOrderDialog(s.mode)
    spec.onClose = () => { Lab.setFlag('briefingSeen', true); Session.overlay = null }
  } else if (which === 'tickets') {
    spec = buildTicketDeckDialog()
    spec.onClose = () => { Lab.setFlag('ticketsRead', true); Session.overlay = null }
  } else if (which === 'manual') {
    spec = buildManualDialog()
    spec.onClose = () => { Session.overlay = null }
  } else if (which === 'debrief') {
    spec = buildDebriefDialog()
    spec.onClose = () => { Session.overlay = null }
  } else if (which === 'reset') {
    spec = buildResetDialog()
    spec.onClose = () => { Session.overlay = null }
  } else if (which === 'quiz') {
    Session.quiz = { idx: 0, picked: null, submitted: false, finished: false } // unmount resets flow (Radix parity)
    lastQuizSig = null
    spec = {
      maxWidth: '36rem', testid: 'quiz-dialog',
      title: quizHeader(s.mode, md), titleIcon: 'GraduationCap',
      srDescription: 'Knowledge check with explanations.',
      onClose: () => { Session.overlay = null },
    }
  } else if (which === 'completion') {
    lastQuizSig = null
    spec = { ...buildCompletionDialog(s.mode, md), onClose: () => { Session.overlay = null; Session.completionDismissed = true } }
  }
  spec.testid = which // overlay identity used by syncOverlay (Dialog.openId)
  // every close path must trigger a re-render, like setOverlay(null) did in React
  const userClose = spec.onClose
  spec.onClose = () => { userClose(); scheduleUpdate() }
  const panel = Dialog.open(spec)
  Session.dialogRefs.panel = panel
  if (spec.tabs) attachTabbedDialog(panel, spec)
}

function refreshQuizDialog(s) {
  const md = s.data[s.mode]
  const sig = JSON.stringify([md.quiz, Session.quiz])
  if (sig === lastQuizSig) return
  lastQuizSig = sig
  const panel = Session.dialogRefs.panel
  if (!panel || !panel.isConnected) return
  panel.querySelector('.dialog-title span').textContent = quizHeader(s.mode, md)
  panel.querySelector('.dialog-body').innerHTML = buildQuizContent(s.mode, md)
}

function refreshCompletionDialog(s) {
  const md = s.data[s.mode]
  const sig = JSON.stringify([md.objs, md.quiz])
  if (sig === lastQuizSig) return
  lastQuizSig = sig
  const panel = Session.dialogRefs.panel
  if (!panel || !panel.isConnected) return
  const spec = buildCompletionDialog(s.mode, md)
  panel.querySelector('.dialog-body').innerHTML = spec.content
}

// ---------------------------------------------------------------------------
// TEST ACTIONS (emit + record, order matches Console.tsx)
// ---------------------------------------------------------------------------
function runTest(kind) {
  const s = Lab.get()
  const env = s.data[s.mode].env
  if (kind === 'flood') {
    const r = Lab.runFlood(Session.testSrc)
    emitFlood(Lab.get().data[s.mode].env, Session.testSrc, r.receivers)
    Session.testKind = 'flood'
    Session.testResult = r
  } else {
    const size = kind === 'jumbo' ? 8972 : 64
    const r = Lab.runPing(Session.testSrc, Session.testDst, size)
    emitPing(Lab.get().data[s.mode].env, Session.testSrc, Session.testDst, r.pathPorts, r.routed, '#E8A33D', r.ok)
    Session.testKind = size > 1500 ? 'jumbo' : 'ping'
    Session.testResult = r
  }
  scheduleUpdate()
}

// ---------------------------------------------------------------------------
// UPDATE LOOP
// ---------------------------------------------------------------------------
let rafPending = false
function scheduleUpdate() {
  if (rafPending) return
  rafPending = true
  requestAnimationFrame(() => { rafPending = false; update() })
}

function update() {
  const s = Lab.get()
  if (s.mode !== Session.lastMode) {
    Session.lastMode = s.mode
    if (s.mode) resetSessionForMode()
    renderRoot(s)
  }
  if (!s.mode) return
  updateMast(s)
  Fabric.update(s.data[s.mode].env, s.stormLevel)
  updateFeed(s)
  updateRail(s)
  updateConsole(s)
  syncOverlay(s)
}

// ---------------------------------------------------------------------------
// GLOBAL EVENT DELEGATION
// ---------------------------------------------------------------------------
function bindEvents(root) {
  root.addEventListener('click', e => {
    const t = e.target
    const btn = t.closest('button, [role="button"], a')
    if (!btn) return

    if (btn.dataset.setMode !== undefined) { Lab.setMode(btn.dataset.setMode || null); return }
    if (btn.dataset.overlayOpen) { Session.overlay = btn.dataset.overlayOpen; scheduleUpdate(); return }
    if (btn.dataset.overlayClose !== undefined || btn.dataset.overlayCloseCompletion !== undefined || btn.dataset.overlayAccept !== undefined) {
      Dialog.close() // onClose handles flags (briefingSeen / ticketsRead / completionDismissed)
      return
    }
    if (btn.dataset.resetConfirm !== undefined) { Lab.resetAll(); window.location.reload(); return }
    if (btn.dataset.feedToggle !== undefined) { Session.logOpen = !Session.logOpen; scheduleUpdate(); return }
    if (btn.dataset.pane) { Session.mobilePane = btn.dataset.pane; updatePanes(); return }
    if (btn.dataset.consoleTab) { Session.consoleTab = btn.dataset.consoleTab; scheduleUpdate(); return }
    if (btn.dataset.portsChip) { Session.portsSw = btn.dataset.portsChip; scheduleUpdate(); return }
    if (btn.dataset.switchChip) { Session.switchSw = btn.dataset.switchChip; scheduleUpdate(); return }
    if (btn.dataset.portToggle) { Session.portsOpen = Session.portsOpen === btn.dataset.portToggle ? null : btn.dataset.portToggle; scheduleUpdate(); return }
    if (btn.dataset.check) { Lab.checkObjective(btn.dataset.check); return }
    if (btn.dataset.hint) {
      const h = Lab.useHint(btn.dataset.hint)
      if (h !== null) Session.hints[btn.dataset.hint] = h
      return
    }
    if (btn.dataset.testRun) { runTest(btn.dataset.testRun); return }
    if (btn.dataset.vlanCreate !== undefined) {
      const err = Lab.addVlan(parseInt(Session.nvId, 10), Session.nvName.toUpperCase())
      Session.vlanErr = err
      if (!err) Session.nvName = ''
      scheduleUpdate()
      return
    }
    if (btn.dataset.fillDesc !== undefined) { Lab.fillDescriptions(); return }
    if (btn.dataset.quizPick !== undefined) {
      Session.quiz.picked = parseInt(btn.dataset.quizPick, 10)
      scheduleUpdate()
      return
    }
    if (btn.dataset.quizSubmit !== undefined) {
      const s = Lab.get()
      const items = QUIZ[s.mode]
      if (Session.quiz.picked === null) return
      Lab.answerQuiz(items[Session.quiz.idx].id, Session.quiz.picked)
      Session.quiz.submitted = true
      return
    }
    if (btn.dataset.quizNext !== undefined) {
      const s = Lab.get()
      const items = QUIZ[s.mode]
      if (Session.quiz.idx + 1 >= items.length) { Lab.finishQuiz(); Session.quiz.finished = true }
      else { Session.quiz.idx += 1; Session.quiz.picked = null; Session.quiz.submitted = false; scheduleUpdate() }
      return
    }
    if (btn.dataset.quizRestart !== undefined) {
      Session.quiz = { idx: 0, picked: null, submitted: false, finished: false }
      scheduleUpdate()
      return
    }
    // switches (role=switch buttons)
    if (btn.getAttribute('role') === 'switch') {
      if (btn.dataset.portField) {
        const checked = btn.getAttribute('aria-checked') !== 'true'
        Session.suppressConsole = true
        Lab.updatePort(btn.dataset.port, { [btn.dataset.portField]: checked })
      } else if (btn.dataset.switchField) {
        const checked = btn.getAttribute('aria-checked') !== 'true'
        Lab.updateSwitch(btn.dataset.switch, { [btn.dataset.switchField]: checked })
      }
      return
    }
  })

  root.addEventListener('change', e => {
    const el = e.target
    if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLSelectElement)) return
    // rail answers
    if (el.dataset.obj) {
      const { obj, key, kind } = el.dataset
      if (kind === 'choice') Lab.setAnswer(obj, key, el.value)
      else if (kind === 'multi') {
        const box = document.querySelectorAll(`input[type="checkbox"][data-obj="${CSS.escape(obj)}"][data-key="${CSS.escape(key)}"]`)
        const arr = Array.from(box).filter(b => b.checked).map(b => b.value)
        Session.suppressRail = true
        Lab.setAnswer(obj, key, arr)
      }
      return
    }
    // port fields
    if (el.dataset.portField) {
      const pid = el.dataset.port
      const f = el.dataset.portField
      let patch
      switch (f) {
        case 'mode': patch = { mode: el.value }; break
        case 'accessVlan': patch = { accessVlan: parseInt(el.value, 10) }; break
        case 'voiceVlan': patch = { voiceVlan: el.value === 'none' ? null : parseInt(el.value, 10) }; break
        case 'nativeVlan': patch = { nativeVlan: parseInt(el.value, 10) }; break
        case 'speed': patch = { speed: el.value === 'auto' ? 'auto' : parseInt(el.value, 10) }; break
        case 'duplex': patch = { duplex: el.value }; break
        case 'mtu': patch = { mtu: parseInt(el.value, 10) }; break
        case 'allowedVlans': {
          const port = Lab.get().data[Lab.get().mode].env.ports[pid]
          const set = new Set(port.allowedVlans)
          const vlan = parseInt(el.dataset.vlan, 10)
          if (el.checked) set.add(vlan); else set.delete(vlan)
          patch = { allowedVlans: [...set].sort((a, b) => a - b) }
          break
        }
        default: return
      }
      Session.suppressConsole = true
      Lab.updatePort(pid, patch)
      return
    }
    // switch fields
    if (el.dataset.switchField) {
      const f = el.dataset.switchField
      const patch = f === 'priority' ? { priority: parseInt(el.value, 10) } : { [f]: el.value }
      Lab.updateSwitch(el.dataset.switch, patch)
      return
    }
    // end fields
    if (el.dataset.endField) {
      const f = el.dataset.endField
      const patch = f === 'nicSpeed'
        ? { nicSpeed: el.value === 'auto' ? 'auto' : parseInt(el.value, 10) }
        : f === 'nicMtu' ? { nicMtu: parseInt(el.value, 10) } : { nicDuplex: el.value }
      Lab.updateEnd(el.dataset.end, patch)
      return
    }
    if (el.dataset.testSel) {
      if (el.dataset.testSel === 'src') Session.testSrc = el.value
      else Session.testDst = el.value
      scheduleUpdate()
    }
  })

  root.addEventListener('input', e => {
    const el = e.target
    if (!(el instanceof HTMLInputElement)) return
    // rail text/number answers (no visual dependency → skip rail rebuild)
    if (el.dataset.obj && (el.dataset.kind === 'text' || el.dataset.kind === 'number')) {
      Session.suppressRail = true
      Lab.setAnswer(el.dataset.obj, el.dataset.key, el.value)
      return
    }
    // port description (keeps caret: skip console rebuild)
    if (el.dataset.portField === 'description') {
      Session.suppressConsole = true
      Lab.updatePort(el.dataset.port, { description: el.value })
      return
    }
    if (el.dataset.vlanField) {
      Session[el.dataset.vlanField] = el.value
    }
  })

  // Radix-style arrow-key support for tablists
  root.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const tab = e.target.closest('[role="tab"]')
    if (!tab) return
    const list = Array.from(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'))
    const i = list.indexOf(tab)
    const next = list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length]
    next.click()
    next.focus()
    e.preventDefault()
  })
}

// ---------------------------------------------------------------------------
// BOOT
// ---------------------------------------------------------------------------
function boot() {
  bindEvents(document.body)
  Lab.subscribe(scheduleUpdate)
  // simulation heartbeat (counters, storm, mismatch logging) — 2500 ms, like the original
  setInterval(() => Lab.tick(), 2500)
  update()
}

boot()
