// ============================================================================
// THE FABRIC BENCH — state store (static port of src/lib/lab/store.ts)
// The original used zustand + persist middleware; this port re-implements the
// same store as a tiny plain-JS singleton with subscribe/notify, keeping:
//   · the SAME localStorage key ("fabric-bench-n10-009-v1")
//   · the SAME persisted slice ({ mode, data, log }) and zustand persist
//     wrapper format ({ state, version }) so existing progress migrates 1:1
//   · the SAME validation on load (malformed state → pristine, G5)
//   · identical action bodies, log strings, counters and star rating.
// ============================================================================

'use strict'

// ---------------------------------------------------------------------------
// state container (zustand replacement: get/set/subscribe)
// ---------------------------------------------------------------------------
const listeners = new Set()
let labState = null // assigned below after actions are defined

const notify = () => { for (const fn of listeners) fn() }

function persistSave() {
  try {
    const { mode, data, log } = labState
    localStorage.setItem('fabric-bench-n10-009-v1', JSON.stringify({ state: { mode, data, log }, version: 0 }))
  } catch { /* storage unavailable — lab still works, just no resume */ }
}

// ---------------------------------------------------------------------------
// frame-pulse bus (ephemeral; canvas subscribes) — identical to original
// ---------------------------------------------------------------------------
let pulseSeq = 1
const pulseSinks = new Set()
const pulseBus = {
  emit(j) { const job = { ...j, id: pulseSeq++ }; pulseSinks.forEach(s => s(job)) },
  subscribe(s) { pulseSinks.add(s); return () => pulseSinks.delete(s) },
}

// mismatch-log throttle + clock (shared with tick)
const loggedMismatches = new Set()
let logSeq = 1
const now = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)))

const blankFlags = () => ({
  briefingSeen: false, ticketsRead: false, fragObserved: false, jumboTestPassed: false, stormDrillRan: false, lastBroadcastReceivers: null,
})

const mkMode = (mode) => ({
  env: initialEnv(mode),
  objs: {},
  quiz: { answers: {}, done: false, score: 0 },
  flags: blankFlags(),
})

const PORT_LABEL = (env, portId) => {
  const p = env.ports[portId]
  return `${p.switchId} ${p.name}`
}

// ---------------------------------------------------------------------------
// actions (bodies ported 1:1 from store.ts — only set/get plumbing differs)
// ---------------------------------------------------------------------------
const actions = {
  setMode(m) {
    labState = { ...labState, mode: m, selectedPort: null, selectedEnd: null }
    persistSave(); notify()
  },

  resetAll() {
    loggedMismatches.clear()
    labState = { ...labState, mode: null, data: { medium: mkMode('medium'), hard: mkMode('hard') }, log: [], stormLevel: 0, selectedPort: null, selectedEnd: null }
    persistSave(); notify()
  },

  pushLog(sev, src, msg) {
    labState = { ...labState, log: [...labState.log, { id: logSeq++, t: now(), sev, src, msg }].slice(-80) }
    persistSave(); notify()
  },

  updatePort(portId, patch) {
    const mode = labState.mode
    if (!mode) return
    const d = clone(labState.data)
    const env = d[mode].env
    const before = env.ports[portId]
    const after = { ...before, ...patch }
    env.ports[portId] = after
    const lbl = PORT_LABEL(env, portId)
    // educational logging of meaningful transitions
    if (patch.enabled !== undefined && patch.enabled !== before.enabled) {
      actions.pushLog(patch.enabled ? 'ok' : 'warn', 'LINK', `${lbl}: link ${patch.enabled ? 'enabled — autonegotiation restarting' : 'administratively shut down (port status: notconnected)'}`)
      if (patch.enabled) {
        const neg = portNeg(env, portId)
        if (neg.down) actions.pushLog('err', 'LINK', `${lbl}: neighbor speed mismatch — link stays down (notconnect)`)
        else actions.pushLog('info', 'LINK', `${lbl}: negotiated ${neg.speed}/${neg.duplex}${neg.mismatch ? ' — DUPLEX MISMATCH with neighbor' : ''}`)
      }
    }
    if (patch.mode && patch.mode !== before.mode) {
      actions.pushLog('info', 'CFG', `${lbl}: switchport mode ${patch.mode}${patch.mode === 'trunk' ? ' (802.1Q encapsulation, native VLAN untagged)' : ''}`)
    }
    if (patch.nativeVlan !== undefined && patch.nativeVlan !== before.nativeVlan && after.mode === 'trunk') {
      actions.pushLog('info', 'CFG', `${lbl}: native VLAN → ${patch.nativeVlan}${patch.nativeVlan === 1 ? ' (default — hopping exposure!)' : ' (untagged frames now land in ' + patch.nativeVlan + ')'}`)
    }
    if (patch.allowedVlans && JSON.stringify(patch.allowedVlans) !== JSON.stringify(before.allowedVlans)) {
      actions.pushLog('info', 'CFG', `${lbl}: allowed VLAN list → ${patch.allowedVlans.length ? patch.allowedVlans.join(',') : 'none'}`)
    }
    if (patch.accessVlan !== undefined && patch.accessVlan !== before.accessVlan) {
      actions.pushLog('info', 'CFG', `${lbl}: access VLAN → ${patch.accessVlan}`)
    }
    if (patch.voiceVlan !== undefined && patch.voiceVlan !== before.voiceVlan) {
      actions.pushLog('info', 'CFG', `${lbl}: voice VLAN → ${patch.voiceVlan ?? 'none'}`)
    }
    if (patch.mtu !== undefined && patch.mtu !== before.mtu) {
      actions.pushLog('info', 'CFG', `${lbl}: MTU → ${patch.mtu}${patch.mtu === 9000 ? ' (jumbo — the whole path must agree)' : ''}`)
    }
    if (patch.speed !== undefined || patch.duplex !== undefined) {
      const neg = portNeg(env, portId)
      if (before.enabled) actions.pushLog(neg.mismatch ? 'warn' : 'info', 'DUPLEX', `${lbl}: re-negotiated ${neg.speed}/${neg.duplex}${neg.mismatch ? ' — DUPLEX MISMATCH (late collisions incoming)' : ''}`)
    }
    if (patch.portfast !== undefined && patch.portfast !== before.portfast) actions.pushLog('info', 'CFG', `${lbl}: PortFast ${patch.portfast ? 'enabled (edge: skip listening/learning)' : 'disabled'}`)
    if (patch.bpduguard !== undefined && patch.bpduguard !== before.bpduguard) actions.pushLog('info', 'CFG', `${lbl}: BPDU Guard ${patch.bpduguard ? 'enabled (BPDU ⇒ err-disable)' : 'disabled'}`)
    if (patch.description !== undefined && patch.description !== before.description) actions.pushLog('info', 'CFG', `${lbl}: description → "${patch.description}"`)
    labState = { ...labState, data: { ...labState.data, [mode]: d[mode] } }
    persistSave(); notify()
  },

  updateSwitch(id, patch) {
    const mode = labState.mode
    if (!mode) return
    const d = clone(labState.data)
    const env = d[mode].env
    const before = env.switches[id]
    env.switches[id] = { ...before, ...patch }
    const host = env.switches[id].hostname
    if (patch.stpEnabled !== undefined && patch.stpEnabled !== before.stpEnabled) {
      if (!patch.stpEnabled) actions.pushLog('err', 'STP', `${host}: SPANNING TREE BYPASSED — no loop protection on this bridge`)
      else {
        const fast = env.switches[id].stpMode !== '802.1D'
        actions.pushLog('ok', 'STP', `${host}: STP resumed (${env.switches[id].stpMode}) — topology re-converging ${fast ? 'in seconds (rapid handshakes)' : 'via 30–50 s listening/learning timers'}`)
      }
    }
    if (patch.priority !== undefined && patch.priority !== before.priority) {
      const stp = computeStp(env)
      const newRoot = stp.root
      actions.pushLog('info', 'STP', `${host}: bridge priority → ${patch.priority}${newRoot ? ` — root bridge is now ${env.switches[newRoot].hostname}` : ''}`)
    }
    if (patch.stpMode !== undefined && patch.stpMode !== before.stpMode) {
      actions.pushLog('info', 'STP', `${host}: STP mode → ${patch.stpMode}`)
    }
    if (patch.ipRouting !== undefined && patch.ipRouting !== before.ipRouting) {
      actions.pushLog(patch.ipRouting ? 'ok' : 'warn', 'ROUTING', `${host}: IP routing ${patch.ipRouting ? 'ENABLED — SVIs now route between VLANs' : 'disabled — VLANs are islands again'}`)
    }
    labState = { ...labState, data: { ...labState.data, [mode]: d[mode] } }
    persistSave(); notify()
  },

  updateEnd(id, patch) {
    const mode = labState.mode
    if (!mode) return
    const d = clone(labState.data)
    const env = d[mode].env
    const before = env.ends[id]
    env.ends[id] = { ...before, ...patch }
    if (patch.nicSpeed !== undefined || patch.nicDuplex !== undefined) {
      const neg = portNeg(env, before.portId)
      actions.pushLog(neg.mismatch ? 'warn' : 'info', 'NIC', `${before.name}: link re-negotiated ${neg.speed}/${neg.duplex}${neg.mismatch ? ' — MISMATCH' : ''}`)
    }
    if (patch.nicMtu !== undefined && patch.nicMtu !== before.nicMtu) {
      actions.pushLog('info', 'NIC', `${before.name}: NIC MTU → ${patch.nicMtu}`)
    }
    labState = { ...labState, data: { ...labState.data, [mode]: d[mode] } }
    persistSave(); notify()
  },

  addVlan(id, name) {
    const mode = labState.mode
    if (!mode) return 'No active session'
    if (!Number.isInteger(id) || id < 2 || id > 4094) return 'VLAN ID must be an integer between 2 and 4094 (VLAN 1 is the factory default)'
    const d = clone(labState.data)
    const env = d[mode].env
    if (env.vlans.some(v => v.id === id)) return `VLAN ${id} already exists`
    env.vlans.push({ id, name: name.trim() || `VLAN${id}` })
    env.vlans.sort((a, b) => a.id - b.id)
    actions.pushLog('ok', 'VLAN', `VLAN database: created VLAN ${id} (${name})`)
    labState = { ...labState, data: { ...labState.data, [mode]: d[mode] } }
    persistSave(); notify()
    return null
  },

  fillDescriptions() {
    const mode = labState.mode
    if (!mode) return
    const d = clone(labState.data)
    const env = d[mode].env
    for (const e of Object.values(env.ends)) {
      const p = env.ports[e.portId]
      if (!p.description.trim()) p.description = e.name
    }
    actions.pushLog('ok', 'CFG', 'Applied suggested descriptions to undescribed edge ports (documentation hygiene)')
    labState = { ...labState, data: { ...labState.data, [mode]: d[mode] } }
    persistSave(); notify()
  },

  runFlood(src) {
    const mode = labState.mode
    const env = labState.data[mode].env
    const r = flood(env, src)
    labState = { ...labState, data: { ...labState.data, [mode]: { ...labState.data[mode], flags: { ...labState.data[mode].flags, lastBroadcastReceivers: r.receivers.length } } } }
    const srcEnd = env.ends[src]
    const color = { 10: '#E8A33D', 20: '#4ADE80', 30: '#F472B6', 40: '#22D3EE', 99: '#94A3B8', 150: '#C084FC' }[endVlan(env, src)] ?? '#E8A33D'
    if (r.storm) {
      actions.pushLog('err', 'FLOOD', `Broadcast from ${srcEnd.name}: storm active — frames circulating the loop uncontrolled`)
    } else {
      actions.pushLog(r.receivers.length > 4 ? 'warn' : 'info', 'FLOOD', `Broadcast from ${srcEnd.name}: reached ${r.receivers.length} device(s) in VLAN ${endVlan(env, src)}${r.missed.length ? ` · ${r.missed.length} excluded` : ''}`)
    }
    return { ...r, srcName: srcEnd.name }
  },

  runPing(src, dst, size) {
    const mode = labState.mode
    const env = labState.data[mode].env
    const r = ping(env, src, dst, size)
    const se = env.ends[src], de = env.ends[dst]
    // objective-relevant flags
    if (size > 1500) {
      if (r.ok && !labState.data[mode].flags.jumboTestPassed) {
        labState = { ...labState, data: { ...labState.data, [mode]: { ...labState.data[mode], flags: { ...labState.data[mode].flags, jumboTestPassed: true } } } }
        actions.pushLog('ok', 'PING', `8972-byte jumbo test ${se.name}→${de.name}: PASS — every hop carried it`)
      }
      if (!r.ok && r.icmp && !labState.data[mode].flags.fragObserved) {
        labState = { ...labState, data: { ...labState.data, [mode]: { ...labState.data[mode], flags: { ...labState.data[mode].flags, fragObserved: true } } } }
        actions.pushLog('err', 'ICMP', r.icmp)
      }
    }
    actions.pushLog(r.ok ? (r.mismatchHops.length ? 'warn' : 'ok') : 'err', 'PING', `${size > 1500 ? 'Oversized ' : ''}ping ${se.name}→${de.name} (${size} B): ${r.ok ? `reply in ${r.routed ? 'routed path' : 'Layer-2 path'}${r.minSpeed < 1000 ? ` @ ${r.minSpeed} Mb/s` : ''}` : `FAILED — ${r.reason ?? 'unknown'}`}${r.nativeWarn ? ` · ${r.nativeWarn}` : ''}`)
    return { ...r, srcName: se.name, dstName: de.name, size }
  },

  checkObjective(id) {
    const mode = labState.mode
    const def = OBJECTIVES[mode].find(o => o.id === id)
    const d = clone(labState.data)
    const md = d[mode]
    const st = md.objs[id] ?? { attempts: 0, hintsUsed: 0, passed: false, firstTry: false, answers: {}, result: null }
    st.answers = { ...st.answers }
    const res = def.check({ env: md.env, answers: st.answers, flags: md.flags })
    const wasPassed = st.passed
    st.attempts += 1
    if (!wasPassed && res.pass) {
      st.passed = true
      st.firstTry = st.attempts === 1
    }
    st.result = { pass: res.pass, text: res.feedback, nearMiss: res.nearMiss }
    md.objs[id] = st
    labState = { ...labState, data: { ...labState.data, [mode]: md } }
    if (res.pass && !wasPassed) actions.pushLog('ok', 'CHECK', `Objective ${id} PASSED — ${def.title}`)
    return { ...res, def }
  },

  useHint(id) {
    const mode = labState.mode
    const def = OBJECTIVES[mode].find(o => o.id === id)
    const d = clone(labState.data)
    const st = d[mode].objs[id] ?? { attempts: 0, hintsUsed: 0, passed: false, firstTry: false, answers: {}, result: null }
    if (st.hintsUsed >= def.hints.length) return null
    st.hintsUsed += 1
    d[mode].objs[id] = st
    labState = { ...labState, data: { ...labState.data, [mode]: d[mode] } }
    actions.pushLog('info', 'HINT', `Hint ${st.hintsUsed}/${def.hints.length} used on ${id}`)
    return def.hints[st.hintsUsed - 1]
  },

  setAnswer(id, key, value) {
    const mode = labState.mode
    const md = labState.data[mode]
    const st = md.objs[id] ?? { attempts: 0, hintsUsed: 0, passed: false, firstTry: false, answers: {}, result: null }
    labState = { ...labState, data: { ...labState.data, [mode]: { ...md, objs: { ...md.objs, [id]: { ...st, answers: { ...st.answers, [key]: value } } } } } }
    persistSave(); notify()
  },

  setFlag(key, value) {
    const mode = labState.mode
    if (!mode) return
    labState = { ...labState, data: { ...labState.data, [mode]: { ...labState.data[mode], flags: { ...labState.data[mode].flags, [key]: value } } } }
    persistSave(); notify()
  },

  answerQuiz(qid, idx) {
    const mode = labState.mode
    labState = { ...labState, data: { ...labState.data, [mode]: { ...labState.data[mode], quiz: { ...labState.data[mode].quiz, answers: { ...labState.data[mode].quiz.answers, [qid]: idx } } } } }
    persistSave(); notify()
  },

  finishQuiz() {
    const mode = labState.mode
    const items = QUIZ[mode]
    const answers = labState.data[mode].quiz.answers
    const correct = items.filter(i => answers[i.id] === i.answer).length
    const score = Math.round((correct / items.length) * 100)
    labState = { ...labState, data: { ...labState.data, [mode]: { ...labState.data[mode], quiz: { answers, done: true, score: Math.max(score, labState.data[mode].quiz.score) } } } }
    actions.pushLog('ok', 'EXAM', `Knowledge check submitted: ${correct}/${items.length} (${score}%)`)
  },

  tick() {
    const mode = labState.mode
    if (!mode) return
    const env = labState.data[mode].env
    const stp = computeStp(env)
    const storming = stp.storm
    // counters: mismatched links & half-duplex contention
    const d = clone(labState.data)
    const counters = d[mode].env.counters
    for (const l of env.links) {
      if (!env.ports[l.a].enabled || !env.ports[l.b].enabled) continue
      const na = portNeg(env, l.a)
      if (na.down) continue
      const key = l.id
      if (na.mismatch) {
        counters[l.a].late += 2 + Math.floor(Math.random() * 5)
        counters[l.a].crc += Math.floor(Math.random() * 3)
        counters[l.b].crc += Math.floor(Math.random() * 3)
        if (!loggedMismatches.has(key)) {
          loggedMismatches.add(key)
          const half = env.ports[l.a]
          actions.pushLog('warn', 'DUPLEX', `Duplex mismatch on ${half.switchId} ${half.name} link — late collisions + CRC errors climbing (half side: ${na.speed}/${na.duplex})`)
        }
      } else if (na.duplex === 'half') {
        counters[l.a].coll += 1 + Math.floor(Math.random() * 4)
        counters[l.b].coll += 1 + Math.floor(Math.random() * 4)
      } else if (loggedMismatches.has(key)) {
        loggedMismatches.delete(key)
        actions.pushLog('ok', 'DUPLEX', `Duplex agreement restored on ${env.ports[l.a].switchId} ${env.ports[l.a].name} link — error counters frozen`)
      }
    }
    if (storming) {
      for (const l of env.links) {
        if (env.ports[l.a].enabled && env.ports[l.b].enabled) {
          counters[l.a].crc += Math.floor(Math.random() * 6)
          counters[l.b].coll += Math.floor(Math.random() * 6)
        }
      }
    }
    labState = { ...labState, data: { ...labState.data, [mode]: d[mode] } }
    // storm level + drill flag
    const prev = labState.stormLevel
    const level = storming ? Math.min(100, prev + 14) : Math.max(0, prev - 30)
    const peakReached = level >= 60 || (prev >= 60 && !storming)
    labState = { ...labState, stormLevel: level }
    if (storming && prev === 0) actions.pushLog('err', 'STORM', 'BROADCAST STORM — Layer-2 loop with no loop prevention. Frames multiplying on every link.')
    if (!storming && prev > 60) {
      actions.pushLog('ok', 'STP', 'Loop prevention restored — redundant port blocking again, storm subsiding.')
      if (peakReached) {
        labState = { ...labState, data: { ...labState.data, [mode]: { ...labState.data[mode], flags: { ...labState.data[mode].flags, stormDrillRan: true } } } }
      }
    }
    // native mismatch periodic reminder (once per appearance)
    for (const l of env.links) {
      const a = env.ports[l.a], b = env.ports[l.b]
      if (a.enabled && b.enabled && a.mode === 'trunk' && b.mode === 'trunk' && a.nativeVlan !== b.nativeVlan) {
        const key = `native-${l.id}`
        if (!loggedMismatches.has(key)) {
          loggedMismatches.add(key)
          actions.pushLog('warn', 'STP', `Native VLAN mismatch on ${a.switchId} ${a.name} (${a.nativeVlan}) ↔ ${b.switchId} ${b.name} (${b.nativeVlan}) — untagged frames land in different VLANs`)
        }
      }
    }
    persistSave(); notify()
  },

  selectPort(p) { labState = { ...labState, selectedPort: p }; notify() },
  selectEnd(e) { labState = { ...labState, selectedEnd: e }; notify() },
}

// ---------------------------------------------------------------------------
// initial state — hydrate from localStorage with the SAME validation the
// original persist middleware used in its merge() (G5 robustness)
// ---------------------------------------------------------------------------
function hydrate() {
  let p = null
  try { p = JSON.parse(localStorage.getItem('fabric-bench-n10-009-v1') || 'null') } catch { p = null }
  const s = p && p.state ? p.state : p // accept both wrapped and bare shapes
  const valid = !!s
    && (s.mode === 'medium' || s.mode === 'hard')
    && !!s.data
    && !!s.data.medium?.flags && !!s.data.hard?.flags
    && !!s.data.medium?.env?.ports && !!s.data.hard?.env?.ports
    && !!s.data.medium?.quiz && !!s.data.hard?.quiz
  const base = {
    mode: null,
    data: { medium: mkMode('medium'), hard: mkMode('hard') },
    log: [],
    stormLevel: 0,
    selectedPort: null,
    selectedEnd: null,
  }
  if (valid) {
    const logs = Array.isArray(s.log) ? s.log : []
    const maxId = logs.reduce((m, l) => Math.max(m, l?.id ?? 0), 0)
    if (maxId >= logSeq) logSeq = maxId + 1
    return { ...base, mode: s.mode, data: s.data, log: logs }
  }
  return base
}

labState = hydrate()

// zustand persist writes on every set; the hydrate path also refreshes storage
// (normalizes the wrapper shape) without notifying anything.
persistSave()

const Lab = {
  get: () => labState,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  ...actions,
}

// ---------------------------------------------------------------------------
// star engine (first-attempt accuracy + hint usage → 1..3 stars) — identical
// ---------------------------------------------------------------------------
function starRating(md, defs) {
  const total = defs.length
  let passed = 0, first = 0, hints = 0
  for (const def of defs) {
    const st = md.objs[def.id]
    if (!st) continue
    hints += st.hintsUsed
    if (st.passed) { passed += 1; if (st.firstTry) first += 1 }
  }
  const ratio = passed ? first / passed : 0
  let stars = 1
  if (passed === total && ratio >= 0.8 && hints <= 4) stars = 3
  else if (passed === total && (ratio >= 0.5 || hints <= 8)) stars = 2
  else if (passed === 0) stars = 0
  return { stars, firstTryRatio: ratio, hints, passed, total }
}

const allPassed = (md, defs) => defs.every(def => md.objs[def.id]?.passed)
