// ===================================================================
// Building B — Service Riser · validation + scoring engine
// (js/objectives.js — 1:1 port of src/lib/lab/engine.ts validators)
// ===================================================================
(function () {
  'use strict'

  const D = window.LabData

  // ---------------- normalizers (identical to the original) ----------------
  const norm = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, '')
  const normHost = (s) => norm(s).replace(/\.$/, '')

  function isIp(s) {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec((s || '').trim())
    if (!m) return false
    return m.slice(1).every((p) => Number(p) >= 0 && Number(p) <= 255)
  }
  const lastOctet = (s) => (isIp(s) ? Number(s.trim().split('.')[3]) : -1)
  const inVlan40 = (s) => isIp(s) && /^10\.20\.40\./.test(s.trim())
  const inVlan10 = (s) => isIp(s) && /^10\.20\.10\./.test(s.trim())
  const sameIp = (a, b) => isIp(a) && isIp(b) && norm(a) === norm(b)

  function arrayEquals(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i])
  }

  // ---------------- validators (21 objectives, byte-equivalent rules) ----------------
  function checkObjective(id, env) {
    switch (id) {
      case 'OBJ-M1':
        return {
          pass:
            arrayEquals(env.dhcp.order, ['discover', 'offer', 'request', 'ack']) &&
            env.dhcp.serverPort === '67' &&
            env.dhcp.clientPort === '68',
        }
      case 'OBJ-M2': {
        const c = { dhcp: 'address', slaac: 'address', dns: 'name', ntp: 'time', ptp: 'time', nts: 'time' }
        return { pass: ['dhcp', 'slaac', 'dns', 'ntp', 'ptp', 'nts'].every((k) => env.map[k] === c[k]) }
      }
      case 'OBJ-M3':
        return {
          pass:
            env.recordTasks.t1 === 'MX' &&
            env.recordTasks.t2 === 'CNAME' &&
            env.recordTasks.t3 === 'AAAA' &&
            env.recordTasks.t4 === 'PTR',
        }
      case 'OBJ-M4':
        return { pass: env.symptoms.s1 === 'dhcp' && env.symptoms.s2 === 'dns' && env.symptoms.s3 === 'ntp' }
      case 'OBJ-M5':
        return {
          pass:
            norm(env.slaac.ifaceId).replace(/[:.\-]/g, '') === '9eb6d0fffe112233' &&
            env.slaac.linkLocal === 'fe80' &&
            env.slaac.privacy === 'no',
        }
      case 'OBJ-M6': {
        const d = env.dhcp
        const okPool =
          inVlan40(d.poolStart) && inVlan40(d.poolEnd) &&
          lastOctet(d.poolStart) >= 2 && lastOctet(d.poolStart) <= 254 &&
          lastOctet(d.poolEnd) >= 2 && lastOctet(d.poolEnd) <= 254 &&
          Number(d.poolStart.split('.')[3]) <= Number(d.poolEnd.split('.')[3]) &&
          !sameIp(d.poolStart, '10.20.40.1') && !sameIp(d.poolEnd, '10.20.40.1')
        return {
          pass:
            okPool && sameIp(d.gateway, '10.20.40.1') && sameIp(d.dnsServer, '10.20.40.53') &&
            norm(d.domain) === 'meridian.local' && d.leaseIssued,
        }
      }
      case 'OBJ-M7':
        return {
          pass:
            arrayEquals(env.dns.walk, ['stub', 'rec', 'root', 'tld', 'auth']) &&
            env.dns.walkMode1 === 'recursive' &&
            env.dns.walkMode2 === 'iterative',
        }
      case 'OBJ-M8':
        return {
          pass:
            sameIp(env.ntp.server, '10.20.50.10') &&
            env.ntp.aclOpen &&
            env.ntp.stratum === '3' &&
            env.ntp.restarted,
        }
      case 'OBJ-M9':
        return {
          pass:
            sameIp(env.dhcp.rogueIp, '10.20.40.233') &&
            env.dhcp.snooping &&
            env.dhcp.trustedPort === 'gi1',
        }
      case 'OBJ-M10':
        return {
          pass:
            arrayEquals(env.nts.order, ['ke', 'cookies', 'ef', 'verify']) &&
            env.nts.enabled,
        }
      case 'OBJ-M11': {
        const r = env.ptp.roles
        return {
          pass:
            r.gnss === 'grandmaster' && r.agg === 'boundary' && r.access === 'transparent' && r.workstations === 'ordinary' && env.ptp.hwts,
        }
      }
      case 'OBJ-M12':
        return {
          pass:
            env.dns.hardMatch.poison === 'dnssec' &&
            env.dns.hardMatch.snoop === 'enc' &&
            env.dns.hardMatch.rogue === 'egress' &&
            env.dns.tDnssec && env.dns.tDot && env.dns.tEgress,
        }
      case 'OBJ-H1': {
        const t = env.night.triage
        return {
          pass:
            t.A === 'real-dhcp' && t.B === 'real-dns' && t.C === 'real-ntp' &&
            t.D === 'noise' && t.E === 'noise' && t.F === 'noise',
        }
      }
      case 'OBJ-H2':
        return {
          pass:
            env.slaac.raOutcomes.dump1 === 'slaac' &&
            env.slaac.raOutcomes.dump2 === 'slaac_stateless' &&
            env.slaac.raOutcomes.dump3 === 'stateful' &&
            env.slaac.brokenRa === 'dump3',
        }
      case 'OBJ-H3': {
        const p = env.dhcp.plan
        return {
          pass:
            sameIp(p.v10start, '10.20.10.100') && sameIp(p.v10end, '10.20.10.199') &&
            sameIp(p.v40start, '10.20.40.100') && sameIp(p.v40end, '10.20.40.199') &&
            sameIp(p.v10gw, '10.20.10.1') && sameIp(p.v40gw, '10.20.40.1') &&
            p.relayOn && sameIp(p.relayServer, '10.20.50.5') &&
            norm(p.resvMac).replace(/[:.\-]/g, '') === '9cb6d0112233' && sameIp(p.resvIp, '10.20.40.50') &&
            sameIp(p.exclStart, '10.20.40.240') && sameIp(p.exclEnd, '10.20.40.254'),
        }
      }
      case 'OBJ-H4': {
        const recs = env.dns.records
        const has = (name, type, values, priority) =>
          recs.some(
            (r) =>
              norm(r.name).replace(/\.$/, '') === name &&
              r.type === type &&
              values.includes(normHost(r.value)) &&
              (priority === undefined || (r.priority || '').trim() === priority),
          )
        const apexCname = recs.some((r) => norm(r.name).replace(/\.$/, '') === '@' && r.type === 'CNAME')
        return {
          pass:
            has('@', 'A', ['203.0.113.44']) &&
            has('www', 'CNAME', ['@', 'meridian.gov']) &&
            has('mail', 'A', ['203.0.113.60']) &&
            has('@', 'MX', ['mail.meridian.gov'], '10') &&
            has('@', 'TXT', ['v=spf1mx-all']) &&
            has('203.0.113.60', 'PTR', ['mail.meridian.gov']) &&
            !apexCname,
        }
      }
      case 'OBJ-H5':
        return {
          pass:
            arrayEquals(env.dns.walk, ['stub', 'rec', 'root', 'tld', 'auth']) &&
            env.dns.walkMode1 === 'recursive' &&
            env.dns.walkMode2 === 'iterative' &&
            norm(env.dns.ttl) === '3600',
        }
      case 'OBJ-H6': {
        const s = env.ntp.strata
        const t = env.ntp.tech
        return {
          pass:
            s.appliance === '1' && s.core === '2' && s.annex === '3' &&
            t.ledger === 'ptp' && t.files === 'ntp' && t.notSub === 'ntp',
        }
      }
      case 'OBJ-H7':
        return {
          pass:
            norm(env.nts.kePort) === '4460' && env.nts.keProto === 'TCP' &&
            norm(env.nts.ntpPort) === '123' &&
            env.nts.protects.includes('spoof') && env.nts.protects.includes('replay') && !env.nts.protects.includes('conf') &&
            env.nts.notProtects === 'noconf',
        }
      case 'OBJ-H8': {
        const s = env.night.attackSel
        const c = env.night.attackCtrl
        return {
          pass:
            s['1'] === 'real' && s['2'] === 'real' && s['3'] === 'real' && s['4'] === 'decoy' &&
            c['1'] === 'snooping' && c['2'] === 'dnsenc' && c['3'] === 'ntprestrict',
        }
      }
      case 'OBJ-H9':
        return {
          pass:
            arrayEquals(env.night.order, ['snoop', 'trust', 'ntp2', 'nts', 'dnssec']) &&
            env.night.reason === 'lockout',
        }
      default:
        return { pass: false }
    }
  }

  // ---------------- scoring (identical formulas) ----------------
  function objectivesFor(mode) {
    return D.OBJECTIVES.filter((o) => o.mode === mode)
  }

  function objectivePoints(result) {
    if (!result || !result.done) return 0
    let pts = 1
    if (!result.firstAttempt) pts -= 0.2 * (result.attempts - 1)
    pts -= 0.1 * result.hints
    return Math.max(0.3, pts)
  }

  function quizAllAnswered(mode, quiz) {
    if (!mode) return false
    return D.QUIZ.filter((q) => q.mode === mode).every((q) => quiz[q.id] !== undefined)
  }

  const QUIZ_IDS = {
    medium: D.QUIZ.filter((q) => q.mode === 'medium').map((q) => q.id),
    hard: D.QUIZ.filter((q) => q.mode === 'hard').map((q) => q.id),
  }
  const QUIZ_ANSWERS = {
    medium: fromEntries(D.QUIZ.filter((q) => q.mode === 'medium').map((q) => [q.id, q.answer])),
    hard: fromEntries(D.QUIZ.filter((q) => q.mode === 'hard').map((q) => [q.id, q.answer])),
  }
  function fromEntries(pairs) {
    const o = {}
    pairs.forEach(([k, v]) => { o[k] = v })
    return o
  }

  function computeScore(state) {
    const mode = state.mode
    if (!mode) return { objAvg: 0, quizPct: 0, overall: 0, stars: 1 }
    const objs = objectivesFor(mode)
    const done = objs.filter((o) => state.results[o.id] && state.results[o.id].done)
    const objAvg = objs.length === 0 ? 0 : done.reduce((s, o) => s + objectivePoints(state.results[o.id]), 0) / objs.length
    const quizItems = QUIZ_IDS[mode]
    const answers = QUIZ_ANSWERS[mode]
    const quizCorrect = quizItems.filter((q) => state.quiz[q] !== undefined && answers[q] === state.quiz[q]).length
    const quizPct = quizItems.length === 0 ? 0 : quizCorrect / quizItems.length
    const answeredAll = quizItems.every((q) => state.quiz[q] !== undefined)
    const overall = answeredAll ? 0.7 * objAvg + 0.3 * quizPct : objAvg * 0.7
    const stars = Math.max(1, Math.min(5, Math.round(overall * 5)))
    return { objAvg, quizPct, overall, stars }
  }

  window.LabEngine = {
    norm, normHost, isIp, sameIp, arrayEquals,
    checkObjective, objectivesFor, objectivePoints, computeScore, quizAllAnswered,
  }
})()
