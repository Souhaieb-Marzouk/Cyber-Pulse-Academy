// ============================================================================
// THE FABRIC BENCH — live fabric canvas (static port of layout.ts + FabricCanvas.tsx)
// Positions, geometry, colors and the imperative frame-pulse engine are 1:1.
// The static SVG is re-rendered on env/selection/storm changes; the pulse
// layer (<g id="pulseG">) is created once and never replaced, so frames are
// never interrupted by re-renders (same trick the original used with refs).
// ============================================================================

'use strict'

// ---------------------------------------------------------------------------
// canvas layout & frame-pulse routing (from layout.ts)
// ---------------------------------------------------------------------------
const SWITCH_POS = { CORE: { x: 500, y: 120 }, B1: { x: 240, y: 425 }, B2: { x: 760, y: 425 } }

const B1_SLOTS = {
  'pc-staff1': { x: 70, y: 585 }, 'pc-staff2': { x: 145, y: 585 },
  'phone-1': { x: 220, y: 585 }, 'prn-lib': { x: 295, y: 585 },
}
const B2_SLOTS = {
  'pc-lab1': { x: 590, y: 585 }, 'pc-lab2': { x: 660, y: 585 }, 'pc-lab3': { x: 730, y: 585 },
  'nas-san': { x: 800, y: 585 }, 'cam-3f': { x: 870, y: 585 },
}
const CORE_SLOTS = { 'srv-vmi': { x: 880, y: 120 } }

const END_POS = { ...B1_SLOTS, ...B2_SLOTS, ...CORE_SLOTS }

const SPARE_POS = {
  'B1|Gi0/5': { x: 355, y: 585 }, 'B1|Gi0/6': { x: 385, y: 585 },
  'B2|Gi0/6': { x: 935, y: 585 },
  'CORE|Gi0/4': { x: 340, y: 120 }, 'CORE|Gi0/5': { x: 370, y: 120 }, 'CORE|Gi0/6': { x: 400, y: 120 },
}

/** Link attach points (slightly outside node rect toward peer). */
function toward(from, to, dist) {
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  return { x: from.x + (dx / len) * dist, y: from.y + (dy / len) * dist }
}

function linkEnds(env, a, b) {
  const sa = SWITCH_POS[env.ports[a].switchId], sb = SWITCH_POS[env.ports[b].switchId]
  const p1 = toward(sa, sb, 62), p2 = toward(sb, sa, 62)
  return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
}

function portDotPos(env, portId) {
  const p = env.ports[portId]
  const link = env.links.find(l => l.a === portId || l.b === portId)
  const me = SWITCH_POS[p.switchId]
  if (link) {
    const other = SWITCH_POS[env.ports[link.a === portId ? link.b : link.a].switchId]
    return toward(me, other, 70)
  }
  const end = Object.values(env.ends).find(e => e.portId === portId)
  if (end && END_POS[end.id]) return toward(me, END_POS[end.id], 58)
  return SPARE_POS[portId] ?? me
}

// pulse emitters
let emitSeq = 0
function emit(legs, color, opts = {}) {
  setTimeout(() => pulseBus.emit({ legs, color, label: opts.label, dashed: opts.dashed }), opts.delay ?? 0)
}

const positionsForSeq = (env, seqIds, srcEnd, dstEnd) => {
  const pts = []
  pts.push(END_POS[srcEnd.id])
  for (const id of seqIds) {
    if (id === 'CORE' || id === 'B1' || id === 'B2') pts.push(SWITCH_POS[id])
  }
  pts.push(END_POS[dstEnd.id])
  return pts.filter(Boolean)
}

function legsFromPoints(pts) {
  const legs = []
  for (let i = 0; i < pts.length - 1; i++) legs.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[i + 1].x, y2: pts[i + 1].y })
  return legs
}

/** Animate a broadcast flood from src to every receiver. */
function emitFlood(env, srcId, receivers) {
  const stp = computeStp(env)
  const src = env.ends[srcId]
  const color = vlanColor(endVlan(env, srcId))
  receivers.forEach((rid, i) => {
    const dst = env.ends[rid]
    let seqS
    if (src.switchId === dst.switchId) seqS = [src.switchId]
    else seqS = switchPath(env, stp, src.switchId, dst.switchId, endVlan(env, srcId))
    if (!seqS) return
    const pts = positionsForSeq(env, seqS, src, dst)
    emit(legsFromPoints(pts), color, { delay: i * 70 })
  })
  // storm flare: random red legs on every up link
  if (stp.storm) {
    for (let k = 0; k < 14; k++) {
      const l = env.links[k % env.links.length]
      const ends = linkEnds(env, l.a, l.b)
      emit([ends], '#F87171', { delay: k * 90 })
    }
  }
}

/** Animate a unicast ping along its real path. */
function emitPing(env, srcId, dstId, pathPortIds, routed, color, ok) {
  const src = env.ends[srcId], dst = env.ends[dstId]
  let seqS
  if (pathPortIds.length === 0) seqS = [src.switchId]
  else {
    const via = []
    for (const p of pathPortIds) {
      const sw = env.ports[p].switchId
      if (via.length === 0 || via[via.length - 1] !== sw) via.push(sw)
    }
    seqS = [src.switchId, ...via.filter(s => s !== src.switchId)]
    // routed pings pass through CORE regardless
    if (routed && !seqS.includes('CORE')) seqS.splice(1, 0, 'CORE')
    if (!seqS.includes(dst.switchId)) seqS.push(dst.switchId)
  }
  const pts = positionsForSeq(env, seqS, src, dst)
  emit(legsFromPoints(pts), ok ? color : '#F87171', { label: routed ? 'routed' : undefined, dashed: routed })
}

/** Random storm noise while the meter is high (called from the noise interval). */
function emitStormNoise(env) {
  const up = env.links.filter(l => env.ports[l.a].enabled && env.ports[l.b].enabled)
  for (let k = 0; k < 3; k++) {
    const l = up[Math.floor(Math.random() * up.length)]
    if (!l) continue
    const ends = linkEnds(env, l.a, l.b)
    emit([ends], '#F87171', { delay: Math.random() * 250 })
  }
}

// ---------------------------------------------------------------------------
// FabricCanvas (from FabricCanvas.tsx)
// ---------------------------------------------------------------------------
const END_CODE = { pc: 'PC', phone: 'PH', printer: 'PR', nas: 'NAS', camera: 'CAM', server: 'SRV' }
const LEG_MS = 430

const Fabric = (() => {
  const activeJobs = [] // { job, t0, el, label }
  let pulseG = null
  let staticG = null
  let veilEl = null
  let svgEl = null
  let lastSig = null
  let stormRef = 0
  let envRef = null

  function init(container) {
    lastSig = null // fresh mount → always render (the original remounted the component)
    container.innerHTML = `
      <div class="fabric-wrap" data-testid="fabric-canvas">
        <svg id="fabricSvg" viewBox="0 0 1000 640" role="img">
          <defs>
            <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#131a15" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="1000" height="640" fill="url(#grid)"></rect>
          <rect id="stormVeil" width="1000" height="640" fill="#F87171" opacity="0"></rect>
          <g id="pulseG"></g>
          <g id="fabricStatic"></g>
        </svg>
      </div>`
    svgEl = container.querySelector('#fabricSvg')
    pulseG = container.querySelector('#pulseG')
    staticG = container.querySelector('#fabricStatic')
    veilEl = container.querySelector('#stormVeil')

    // pulse engine: imperative SVG circles, no per-frame framework renders
    const unsub = pulseBus.subscribe(job => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      c.setAttribute('r', '7')
      c.setAttribute('fill', job.color)
      c.setAttribute('stroke', 'rgba(0,0,0,0.55)')
      c.setAttribute('stroke-width', '1.5')
      if (job.dashed) c.setAttribute('stroke-dasharray', '3 2')
      let label
      if (job.label) {
        label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        label.textContent = job.label
        label.setAttribute('font-size', '11')
        label.setAttribute('fill', job.color)
        label.setAttribute('font-family', 'ui-monospace, monospace')
        label.setAttribute('dy', '-12')
        label.setAttribute('text-anchor', 'middle')
        pulseG.appendChild(label)
      }
      pulseG.appendChild(c)
      activeJobs.push({ job, t0: performance.now(), el: c, label })
      if (activeJobs.length > 140) {
        const old = activeJobs.shift()
        old.el.remove()
        if (old.label) old.label.remove()
      }
    })
    let raf = 0
    const loop = () => {
      const nowp = performance.now()
      for (let i = activeJobs.length - 1; i >= 0; i--) {
        const a = activeJobs[i]
        const elapsed = nowp - a.t0
        const idx = Math.floor(elapsed / LEG_MS)
        if (idx >= a.job.legs.length) {
          a.el.remove()
          if (a.label) a.label.remove()
          activeJobs.splice(i, 1)
          continue
        }
        const leg = a.job.legs[Math.min(idx, a.job.legs.length - 1)]
        const t = Math.min(1, (elapsed - idx * LEG_MS) / LEG_MS)
        const x = leg.x1 + (leg.x2 - leg.x1) * t
        const y = leg.y1 + (leg.y2 - leg.y1) * t
        a.el.setAttribute('cx', String(x))
        a.el.setAttribute('cy', String(y))
        a.el.setAttribute('opacity', String(t < 0.08 ? t / 0.08 : t > 0.85 ? (1 - t) / 0.15 : 1))
        if (a.label) {
          a.label.setAttribute('x', String(x))
          a.label.setAttribute('y', String(y - 10))
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // storm noise generator (280 ms, while storm level > 18)
    setInterval(() => {
      if (stormRef > 18 && envRef) emitStormNoise(envRef)
    }, 280)

    // selection clicks — delegated (svg re-renders never re-bind)
    svgEl.addEventListener('click', e => {
      const t = e.target.closest('[data-select-port],[data-select-end]')
      if (!t) return
      if (t.dataset.selectPort) Lab.selectPort(t.dataset.selectPort)
      else if (t.dataset.selectEnd) Lab.selectEnd(t.dataset.selectEnd)
    })
    svgEl.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const t = e.target.closest('[data-select-port],[data-select-end]')
      if (!t) return
      e.preventDefault()
      if (t.dataset.selectPort) Lab.selectPort(t.dataset.selectPort)
      else if (t.dataset.selectEnd) Lab.selectEnd(t.dataset.selectEnd)
    })
    return unsub
  }

  const MONO = 'font-family="ui-monospace, monospace"'

  function renderLink(env, stp, l) {
    const ends = linkEnds(env, l.a, l.b)
    const blockedSet = new Set(stp.blockedPorts)
    const blocked = blockedSet.has(l.a) || blockedSet.has(l.b)
    const down = !env.ports[l.a].enabled || !env.ports[l.b].enabled
    const pa = env.ports[l.a], pb = env.ports[l.b]
    const nativeMismatch = pa.enabled && pb.enabled && pa.mode === 'trunk' && pb.mode === 'trunk' && pa.nativeVlan !== pb.nativeVlan
    const stroke = stp.storm ? '#F87171' : down ? '#2a332c' : blocked ? '#5b5648' : '#3f5347'
    const mid = { x: (ends.x1 + ends.x2) / 2, y: (ends.y1 + ends.y2) / 2 }
    let s = `<g>`
    s += `<line x1="${ends.x1}" y1="${ends.y1}" x2="${ends.x2}" y2="${ends.y2}" stroke="${stroke}" stroke-width="${blocked || down ? 2.5 : 4.5}"${blocked ? ' stroke-dasharray="7 6"' : down ? ' stroke-dasharray="2 5"' : ''} stroke-linecap="round"/>`
    if (stp.storm || (!down && !blocked)) {
      s += `<line x1="${ends.x1}" y1="${ends.y1}" x2="${ends.x2}" y2="${ends.y2}" stroke="${stp.storm ? '#F87171' : '#E8A33D'}" stroke-width="1.2" stroke-opacity="${stp.storm ? 0.8 : 0.25}" stroke-linecap="round"${stp.storm ? '' : ' class="fabric-ember"'}/>`
    }
    if (nativeMismatch && !down) {
      s += `<g aria-hidden="true">
        <rect x="${mid.x - 34}" y="${mid.y - 9}" width="68" height="15" rx="4" fill="#451a03" stroke="#F59E0B" stroke-width="0.8"/>
        <text x="${mid.x}" y="${mid.y + 2}" text-anchor="middle" font-size="9" fill="#FBBF24" ${MONO}>NATIVE≠</text>
      </g>`
    }
    for (const portId of [l.a, l.b]) {
      const isBlocked = blockedSet.has(portId)
      const pos = portDotPos(env, portId)
      const p = env.ports[portId]
      const role = stp.ports[portId]?.role
      const label = `${p.switchId} ${p.name} · ${p.mode}${role && role !== 'disabled' ? ` · STP: ${role}` : ''} · ${p.enabled ? 'up' : 'shut down'} — open in console`
      s += `<g role="button" tabindex="0" aria-label="${esc(label)}" data-select-port="${esc(portId)}" data-fk="port-${esc(portId)}" style="cursor:pointer">
        <title>${esc(label)}</title>
        <circle cx="${pos.x}" cy="${pos.y}" r="9" fill="${p.enabled ? '#121713' : '#191919'}" stroke="${Lab.get().selectedPort === portId ? '#E8A33D' : isBlocked ? '#F87171' : p.enabled ? '#4b5f52' : '#444'}" stroke-width="2"/>
        ${isBlocked ? `<text x="${pos.x}" y="${pos.y + 3.5}" text-anchor="middle" font-size="10" fill="#F87171" ${MONO}>✕</text>` : ''}
        ${!p.enabled ? `<text x="${pos.x}" y="${pos.y + 3.5}" text-anchor="middle" font-size="9" fill="#666" ${MONO}>—</text>` : ''}
        <text x="${pos.x}" y="${pos.y - 12}" text-anchor="middle" font-size="9" fill="#7d8f83" ${MONO}>${esc(p.name)}</text>
      </g>`
    }
    return s + '</g>'
  }

  function renderSwitch(env, stp, id) {
    const sw = env.switches[id]
    const pos = SWITCH_POS[id]
    const isRoot = stp.root === id
    let s = `<g aria-label="${esc(`${sw.hostname} — ${sw.floor} — bridge ID ${sw.priority}.${sw.mac}${isRoot ? ' — ROOT BRIDGE' : ''}`)}">`
    s += `<rect x="${pos.x - 62}" y="${pos.y - 27}" width="124" height="54" rx="10" fill="${isRoot ? '#1c1a10' : '#131a15'}" stroke="${isRoot ? '#E8A33D' : sw.stpEnabled ? '#3f5347' : '#F87171'}" stroke-width="${isRoot ? 2.2 : 1.5}"/>`
    s += `<text x="${pos.x}" y="${pos.y - 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#e7e2d5" ${MONO}>${esc(sw.hostname)}</text>`
    s += `<text x="${pos.x}" y="${pos.y + 13}" text-anchor="middle" font-size="9" fill="#7d8f83" ${MONO}>prio ${sw.priority} · ${sw.stpEnabled ? sw.stpMode : 'STP OFF'}</text>`
    if (isRoot) {
      s += `<g aria-hidden="true"><rect x="${pos.x - 24}" y="${pos.y - 46}" width="48" height="16" rx="8" fill="#E8A33D"/>
        <text x="${pos.x}" y="${pos.y - 34}" text-anchor="middle" font-size="10" font-weight="bold" fill="#1a1206" ${MONO}>ROOT</text></g>`
    }
    if (!sw.stpEnabled) {
      s += `<g aria-hidden="true"><rect x="${pos.x + 30}" y="${pos.y - 44}" width="68" height="16" rx="8" fill="#450a0a" stroke="#F87171" stroke-width="0.8"/>
        <text x="${pos.x + 64}" y="${pos.y - 32}" text-anchor="middle" font-size="9" fill="#FCA5A5" ${MONO}>STP OFF</text></g>`
    }
    if (sw.ipRouting) {
      s += `<g aria-hidden="true"><rect x="${pos.x - 98}" y="${pos.y - 16}" width="30" height="16" rx="4" fill="#14532d" stroke="#4ADE80" stroke-width="0.7"/>
        <text x="${pos.x - 83}" y="${pos.y - 4}" text-anchor="middle" font-size="9" fill="#86EFAC" ${MONO}>L3</text></g>`
    }
    return s + '</g>'
  }

  function renderEnd(env, endId) {
    const e = env.ends[endId]
    const pos = END_POS[endId]
    const p = env.ports[e.portId]
    const off = !p.enabled
    const c = off ? '#3a3f3b' : vlanColor(e.dataVlan)
    const sel = Lab.get().selectedEnd === endId
    const label = `${e.name} · ${e.kind} · data VLAN ${e.dataVlan} · NIC ${e.nicSpeed}/${e.nicDuplex} · MTU ${e.nicMtu} — select for test bench`
    let s = `<g role="button" tabindex="0" aria-label="${esc(label)}" data-select-end="${esc(endId)}" data-fk="end-${esc(endId)}" style="cursor:pointer">`
    s += `<title>${esc(label)}</title>`
    s += `<line x1="${pos.x}" y1="${pos.y - 17}" x2="${SWITCH_POS[e.switchId].x}" y2="${SWITCH_POS[e.switchId].y + 27}" stroke="${off ? '#2a332c' : '#33413a'}" stroke-width="2"/>`
    s += `<circle cx="${pos.x}" cy="${pos.y}" r="17" fill="${c}" stroke="${sel ? '#E8A33D' : '#0b0e0c'}" stroke-width="${sel ? 3 : 2}" opacity="${off ? 0.55 : 1}"/>`
    s += `<text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" font-size="10" font-weight="bold" fill="${off ? '#777' : '#10130f'}" ${MONO}>${END_CODE[e.kind]}</text>`
    s += `<text x="${pos.x}" y="${pos.y + 32}" text-anchor="middle" font-size="9" fill="${off ? '#666' : '#aab5ac'}" ${MONO}>${esc(e.name)}</text>`
    if (!off && e.nicMtu === 9000) {
      s += `<rect x="${pos.x + 12}" y="${pos.y - 26}" width="22" height="12" rx="3" fill="#1c1a10" stroke="#E8A33D" stroke-width="0.7"/>
        <text x="${pos.x + 23}" y="${pos.y - 17}" text-anchor="middle" font-size="8" fill="#E8A33D" ${MONO}>9K</text>`
    }
    if (off) s += `<text x="${pos.x}" y="${pos.y - 22}" text-anchor="middle" font-size="9" fill="#F87171" ${MONO}>shut</text>`
    return s + '</g>'
  }

  function renderSpare(env, portId) {
    const p = env.ports[portId]
    const pos = SPARE_POS[portId]
    const label = `${p.switchId} ${p.name} · spare port · ${p.enabled ? 'ENABLED (an open socket)' : 'disabled'} — open in console`
    return `<g role="button" tabindex="0" aria-label="${esc(label)}" data-select-port="${esc(portId)}" data-fk="port-${esc(portId)}" style="cursor:pointer">
      <title>${esc(label)}</title>
      <rect x="${pos.x - 8}" y="${pos.y - 8}" width="16" height="16" rx="3" fill="${p.enabled ? '#26251c' : '#151815'}" stroke="${p.enabled ? '#E8A33D' : '#333c35'}" stroke-width="1.5"${p.enabled ? '' : ' stroke-dasharray="3 2"'}/>
      ${p.enabled ? `<text x="${pos.x}" y="${pos.y - 13}" text-anchor="middle" font-size="8" fill="#E8A33D" ${MONO}>free</text>` : ''}
    </g>`
  }

  function update(env, stormLevel) {
    if (!svgEl) return
    envRef = env
    stormRef = stormLevel
    const stp = computeStp(env)
    const sig = JSON.stringify([env, stormLevel, Lab.get().selectedPort, Lab.get().selectedEnd])
    if (sig === lastSig) return
    lastSig = sig

    svgEl.setAttribute('aria-label', `Live fabric: root bridge ${stp.root ? env.switches[stp.root].hostname : 'none (storm)'}, ${stp.blockedPorts.length} blocked port(s), ${stp.storm ? 'BROADCAST STORM ACTIVE' : 'stable topology'}`)
    veilEl.setAttribute('opacity', String(stp.storm ? Math.min(0.13, stormLevel / 700) : 0))

    let s = ''
    for (const l of env.links) s += renderLink(env, stp, l)
    for (const endId of Object.keys(END_POS)) s += renderEnd(env, endId)
    for (const portId of Object.keys(SPARE_POS)) s += renderSpare(env, portId)
    for (const id of ['CORE', 'B1', 'B2']) s += renderSwitch(env, stp, id)

    // legend
    s += `<g aria-hidden="true"><rect x="16" y="16" width="210" height="122" rx="8" fill="#0f1411" stroke="#243026"/>
      <text x="28" y="36" font-size="10" fill="#7d8f83" ${MONO}>VLAN LEGEND</text>`
    const legend = [[10, 'STUDENTS'], [20, 'STAFF'], [30, 'SERVERS'], [40, 'CAMERAS'], [99, 'MGMT (native)'], [150, 'VOICE']]
    legend.forEach(([v, n], i) => {
      s += `<g transform="translate(28, ${48 + i * 15})"><rect width="10" height="10" rx="2" fill="${vlanColor(v)}"/>
        <text x="16" y="9" font-size="9.5" fill="#aab5ac" ${MONO}>${v} · ${n}</text></g>`
    })
    s += '</g>'

    // storm meter
    s += `<g aria-hidden="true"><rect x="800" y="16" width="184" height="26" rx="6" fill="#0f1411" stroke="${stormLevel > 60 ? '#F87171' : '#243026'}"/>
      <text x="812" y="33" font-size="10" fill="${stormLevel > 60 ? '#FCA5A5' : '#7d8f83'}" ${MONO}>STORM</text>
      <rect x="856" y="22" width="116" height="13" rx="3" fill="#191f1a"/>
      <rect x="856" y="22" width="${Math.round((stormLevel / 100) * 116)}" height="13" rx="3" fill="${stormLevel > 60 ? '#F87171' : '#b45309'}" data-testid="storm-meter"/></g>`

    s += `<text x="16" y="628" font-size="9" fill="#3f4a42" ${MONO}>SYNTHETIC TRAINING FABRIC · MERIDIAN COLLEGE (fictional) · simplified STP &amp; autonegotiation</text>`

    // focus restoration: rebuild keeps keyboard users on the same node
    const fk = document.activeElement?.getAttribute?.('data-fk') || null
    staticG.innerHTML = s
    if (fk) {
      const again = staticG.querySelector(`[data-fk="${CSS.escape(fk)}"]`)
      if (again) again.focus({ preventScroll: true })
    }
  }

  return { init, update }
})()
