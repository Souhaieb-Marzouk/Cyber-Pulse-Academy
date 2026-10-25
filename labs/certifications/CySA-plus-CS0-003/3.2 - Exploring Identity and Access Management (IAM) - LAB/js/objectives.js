// ─── CHECK RESULTS engine: machine-checkable rules per objective ─────────────
// Ported 1:1 from the original framework lab (src/lib/iam-lab/checks.ts) and
// the store selectors. Same functions, same strictness (strict numeric parse,
// sorted-set comparison, ordered sequences, threshold bands, MFA fallback).

(function () {
  'use strict'

  var sorted = function (arr) { return arr.slice().sort() }
  var parseCount = function (v) {
    return /^\d+$/.test(String(v).trim()) ? parseInt(String(v).trim(), 10) : NaN
  }

  var CHECKS = {
    // ── MEDIUM ──
    'OBJ-M1': function (s) {
      var need = { identification: 'claim', authentication: 'prove', authorization: 'decide', accounting: 'record' }
      var pass = Object.keys(need).every(function (k) { return s.env.terms[k] === need[k] })
      return { pass: pass, message: pass ? 'pass' : 'fail' } // message replaced by objective feedback
    },
    'OBJ-M2': function (s) {
      var need = { password: 'knowledge', totp: 'possession', fingerprint: 'inherence', hkey: 'possession', secq: 'knowledge', face: 'inherence' }
      var pass = Object.keys(need).every(function (k) { return s.env.factors[k] === need[k] })
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-M3': function (s) {
      var pass =
        s.env.ssoStatement === 'b' && s.env.ssoRoles['bureau-idp'] === 'idp' && s.env.ssoRoles['payroll-app'] === 'sp'
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-M4': function (s) {
      var need = {
        'j.okafor': 'human', 'backup-svc': 'service', 'front-desk-01': 'shared',
        'LT-CAM-114': 'device', 'r.delgado': 'human', 'mkt-test-01': 'shared',
      }
      var pass = Object.keys(need).every(function (k) { return s.env.accountTypes[k] === need[k] })
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-M5': function (s) {
      var setOk = sorted(s.env.clerkPerms).join(',') === 'create-invoice-draft,view-invoices'
      var sodOk = s.env.sodFlag === 'finance-admin.requisition-approve'
      return { pass: setOk && sodOk, message: setOk && sodOk ? 'pass' : 'fail' }
    },
    'OBJ-M6': function (s) {
      var n = parseCount(s.env.pushCount)
      var countOk = !isNaN(n) && n >= 7 && n <= 9
      var outcomeOk = s.env.pushOutcome === 'approved-then-success'
      return { pass: countOk && outcomeOk, message: countOk && outcomeOk ? 'pass' : 'fail' }
    },
    'OBJ-M7': function (s) {
      var n = parseCount(s.env.sprayCount)
      var pass = s.env.sprayPattern === 'spraying' && s.env.sprayIp === SPRAY_IP && !isNaN(n) && n >= 8 && n <= 10
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-M8': function (s) {
      var need = { A: 'spraying', B: 'stuffing', C: 'mfa-fatigue', D: 'kerberoasting' }
      var pass = Object.keys(need).every(function (k) { return s.env.patternMatch[k] === need[k] })
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-M9': function (s) {
      var p = s.env.policy
      var pass = p.minLength >= 12 && p.complexity && p.lockout <= 5 && p.history >= 5
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-M10': function (s) {
      var requiredOn = ['s.hayes', 't.reyes', 'b.talbot', 'l.chen', 'p.novak', 'r.delgado']
      var mustStayOff = ['j.okafor', 'm.grant', 'e.graves', 'backup-svc', 'svc-invoice-mgr', 'front-desk-01', 'mkt-test-01', 'LT-CAM-114', 'shared-temp-2019']
      var isOn = function (u) {
        return s.env.mfa[u] !== undefined ? s.env.mfa[u] : (ACCOUNTS.find(function (a) { return a.username === u }) || { mfa: false }).mfa
      }
      var allOn = requiredOn.every(function (u) { return isOn(u) === true })
      var noneOn = mustStayOff.every(function (u) { return isOn(u) === false })
      return { pass: allOn && noneOn, message: allOn && noneOn ? 'pass' : 'fail' }
    },
    'OBJ-M11': function (s) {
      var need = { 'm.grant': 'disable', 'e.graves': 'disable', 'svc-invoice-mgr': 'reassign', 'mkt-test-01': 'retain' }
      var pass = Object.keys(need).every(function (k) { return s.env.lifecycle[k] === need[k] })
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    // ── HARD ──
    'OBJ-H1': function (s) {
      var need = { e1: 'identification', e2: 'authentication', e3: 'authorization', e4: 'accounting' }
      var pass = Object.keys(need).every(function (k) { return s.env.aaaTags[k] === need[k] })
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-H2': function (s) {
      var i = s.env.intrusion
      var pass = i.account === 'r.delgado' && i.entry === 'T1621' && i.inside === 'T1078'
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-H3': function (s) {
      var r = s.env.rule
      var threshold = parseCount(r.threshold)
      var window = parseCount(r.window)
      var pass =
        r.source === 'signin' &&
        r.aggregation === 'distinct-users' &&
        !isNaN(threshold) && threshold >= 5 && threshold <= 10 &&
        !isNaN(window) && window <= 10 &&
        sorted(r.exclusions).join(',') === 'mkt-test-01'
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-H4': function (s) {
      var need = { t1: true, t2: false, t3: true, t4: false, t5: true, t6: false }
      var pass = Object.keys(need).every(function (k) { return s.env.tpfp[k] === need[k] })
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-H5': function (s) {
      var c = s.env.containment
      var pass = c.length === 5 && c.every(function (v, i) { return v === CONTAINMENT_CORRECT[i] })
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-H6': function (s) {
      var need = { f1: 'M1036', f2: 'M1032', f3: 'M1026' }
      var pass = Object.keys(need).every(function (k) { return s.env.mitreMap[k] === need[k] })
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-H7': function (s) {
      var pass = sorted(s.env.fedFlags).join(',') === 'all-users-assignment,mfa-off'
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-H8': function (s) {
      var p = s.env.pam
      var pass = p.jit && sorted(p.removed).join(',') === 'j.okafor,m.grant' && !p.addSvc && p.removed.length === 2
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
    'OBJ-H9': function (s) {
      var r = s.env.review
      var pass = sorted(r.disabled).join(',') === 'e.graves,shared-temp-2019,svc-invoice-mgr' && r.scheduled
      return { pass: pass, message: pass ? 'pass' : 'fail' }
    },
  }

  // ── selectors / helpers (from store.ts) ─────────────────────────────────────
  var MEDIUM_IDS = ['OBJ-M1', 'OBJ-M2', 'OBJ-M3', 'OBJ-M4', 'OBJ-M5', 'OBJ-M6', 'OBJ-M7', 'OBJ-M8', 'OBJ-M9', 'OBJ-M10', 'OBJ-M11']
  var HARD_IDS = ['OBJ-H1', 'OBJ-H2', 'OBJ-H3', 'OBJ-H4', 'OBJ-H5', 'OBJ-H6', 'OBJ-H7', 'OBJ-H8', 'OBJ-H9']

  function ticketsDone(mode, tickets) {
    if (!mode) return { done: 0, total: 0 }
    var ids = mode === 'medium' ? MEDIUM_IDS : HARD_IDS
    var done = ids.filter(function (id) { return tickets[id] && tickets[id].completed }).length
    return { done: done, total: ids.length }
  }

  function ticketCredit(t) {
    if (!t) return 0
    var raw = 1 - 0.2 * Math.max(0, t.attempts - 1) - 0.2 * t.hintsUsed
    return Math.max(0.2, raw)
  }

  window.BureauChecks = { CHECKS: CHECKS, ticketsDone: ticketsDone, ticketCredit: ticketCredit }
})()
