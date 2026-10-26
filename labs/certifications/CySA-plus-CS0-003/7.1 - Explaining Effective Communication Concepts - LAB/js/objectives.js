// ── THE VULN BULLETIN ── machine-checkable validation engine ─────────────────
// Static 1:1 port of src/lib/lab/checks.ts. Same rules, same thresholds,
// same scoring math. Do not "improve" the rules here — parity is the contract.

const eq = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')

const cycleOrderCorrect = s => s.cycleOrder.join(',') === 'identify,assess,communicate,review'

const STORY_BY_ID = id => STORIES.find(st => st.id === id)

function CONTENT_CARDS_ROUTE(s) {
  const cards = ['C-01', 'C-02', 'C-03', 'C-04', 'C-05', 'C-06', 'C-07', 'C-08', 'C-09', 'C-10']
  const expect = {
    'C-01': ['ST-EXEC'], 'C-02': ['ST-EXEC'], 'C-03': ['ST-EXEC'],
    'C-04': ['ST-OPS'], 'C-05': ['ST-OPS'],
    'C-06': ['ST-SOC'],
    'C-07': ['ST-LEGAL'], 'C-08': ['ST-LEGAL'],
    'C-09': ['ST-MGR'],
    'C-10': ['ST-ALL'],
  }
  return cards.every(c => s.cardAssign[c] && expect[c].includes(s.cardAssign[c]))
}

function METRICS_CORRECT(s) {
  const quant = ['Q1', 'Q2', 'Q3', 'Q4']
  const qual = ['L1', 'L2', 'L3', 'L4']
  return eq(s.metricSort.quantitative, quant) && eq(s.metricSort.qualitative, qual)
}

function SEVERITY_TIERS_CHECK(t) {
  const c = t.critical, h = t.high, m = t.medium, l = t.low
  return !!c && !!h && !!m && !!l
    && c >= 1 && c <= 7 && h >= 8 && h <= 30 && m >= 31 && m <= 90 && l >= 91 && l <= 180
}

function REPORT_TYPES_CORRECT(s) {
  return s.reportTypeMatch['P-SCAN'] === 'RT-SCAN'
    && s.reportTypeMatch['P-REM'] === 'RT-REM'
    && s.reportTypeMatch['P-REG'] === 'RT-REG'
    && s.reportTypeMatch['P-MET'] === 'RT-MET'
}

function COMMS_CORRECT(s, hard) {
  const rows = hard ? COMMS : COMMS.filter(c => !c.hardOnly)
  return rows.every(c => {
    const st = s.comms[c.id]
    return !!st && st.audience === c.audience && st.cadence === c.cadence && st.method === c.method
  })
}

function REVIEW_CORRECT(s, hard) {
  const rows = hard ? CONTROLS : CONTROLS.filter(c => !c.hardOnly)
  const classOk = rows.every(c => s.reviewClass[c.id] === c.verdict)
  const updRows = rows.filter(c => c.verdict === 'update')
  const updOk = updRows.every(c => s.reviewUpdates[c.id] === c.correctUpdate)
  return classOk && updOk && (!hard || s.reviewVerified)
}

function PARTICIPATION_CORRECT(s) {
  return s.participation['ST-ALL'] === 'PT-1'
    && s.participation['ST-OPS'] === 'PT-2'
    && s.participation['ST-MGR'] === 'PT-3'
}

function RISK_REGISTER_CORRECT(s) {
  const expect = { 'R-01': 'Critical', 'R-02': 'High', 'R-03': 'Medium', 'R-04': 'Low', 'R-05': 'Medium' }
  return Object.entries(expect).every(([k, v]) => s.register[k] === v)
}

function MILESTONES_CORRECT(s) {
  const okOrder = s.milestoneOrder.join(',') === 'MS-CONTAIN,MS-MITIGATE,MS-PATCH,MS-VERIFY'
  const okDays = s.milestoneDays['MS-CONTAIN'] === 1 && s.milestoneDays['MS-MITIGATE'] === 3
    && s.milestoneDays['MS-PATCH'] === 7 && s.milestoneDays['MS-VERIFY'] === 14
  return okOrder && okDays
}

function objectiveValid(o, s) {
  switch (o.id) {
    case 'OBJ-M1': return cycleOrderCorrect(s)
    case 'OBJ-M2': {
      const t = s.triage['W-01']
      return !!t && t.severity === 'Critical' && t.likelihood === 'Very likely' && t.impact === 'Severe'
    }
    case 'OBJ-M3': return CONTENT_CARDS_ROUTE(s)
    case 'OBJ-M4': return eq(s.execCards, ['C-01', 'C-02', 'C-03'])
    case 'OBJ-M5': return METRICS_CORRECT(s)
    case 'OBJ-M6': return SEVERITY_TIERS_CHECK(s.sla)
    case 'OBJ-M7': return REPORT_TYPES_CORRECT(s)
    case 'OBJ-M8': return COMMS_CORRECT(s, false)
    case 'OBJ-M9': return eq(s.staleFlags, ['W-07'])
    case 'OBJ-M10': return REVIEW_CORRECT(s, false)
    case 'OBJ-M11': return PARTICIPATION_CORRECT(s)
    case 'OBJ-M12': return eq(s.buyIn, ['B1', 'B2', 'B3'])
    case 'OBJ-H1': return eq(s.queue, ['W-01', 'W-02', 'W-05']) && eq(s.queueReasons, QUEUE_CORRECT_REASONS)
    case 'OBJ-H2': return eq(s.critique, CRITIQUE_CORRECT)
    case 'OBJ-H3': return COMMS_CORRECT(s, true)
    case 'OBJ-H4': return s.escalation.join(',') === ESCALATION_CORRECT.join(',')
    case 'OBJ-H5': return RISK_REGISTER_CORRECT(s)
    case 'OBJ-H6': return REVIEW_CORRECT(s, true)
    case 'OBJ-H7': return MILESTONES_CORRECT(s)
    case 'OBJ-H8': return eq(s.buyIn, ['B1', 'B2', 'B3']) && s.framing === 'F1'
    case 'OBJ-H9': return eq(s.staleFlags, ['W-07', 'W-03', 'W-08']) && s.staleOrder.join(',') === 'W-07,W-03,W-08'
    case 'OBJ-H10': {
      const slaOk = SEVERITY_TIERS_CHECK(s.sla)
      const execOk = eq(s.execCards, ['C-01', 'C-02', 'C-03'])
      const reviewOk = REVIEW_CORRECT(s, false)
      return slaOk && execOk && reviewOk && s.capstonePublished
    }
    default: return false
  }
}

// star & score computation — same math as the original (60% first-try / 40% quiz)
function computeStars(s, mode) {
  const objs = OBJECTIVES.filter(o => o.mode === mode)
  const passed = objs.filter(o => s.checks[o.id] && s.checks[o.id].passed)
  const firstTry = passed.filter(o => s.checks[o.id].firstTry).length
  const hints = passed.reduce((a, o) => a + (s.checks[o.id].hintsUsed || 0), 0)
  const pct = objs.length ? firstTry / objs.length : 0
  let stars = pct >= 0.9 ? 5 : pct >= 0.75 ? 4 : pct >= 0.6 ? 3 : pct >= 0.4 ? 2 : 1
  const hintCap = mode === 'medium' ? 8 : 2
  if (hints > hintCap) stars = Math.max(1, stars - 1)
  const bank = mode === 'medium' ? QUIZ_MEDIUM : QUIZ_HARD
  const quizTotal = bank.length
  const quizCorrect = Object.entries(s.quizAnswers).filter(([qid, ans]) => {
    if (ans < 0) return false
    const q = bank.find(x => x.id === qid)
    return q && ans === q.correct
  }).length
  const quizPct = quizTotal ? quizCorrect / quizTotal : 0
  const score = Math.round((pct * 0.6 + quizPct * 0.4) * 100)
  return { stars, score, firstTryPct: Math.round(pct * 100), hints, quizCorrect, quizTotal }
}

// capstone readiness (OBJ-H10 status dots)
function capstoneStatus(s) {
  return {
    execOk: eq(s.execCards, ['C-01', 'C-02', 'C-03']),
    slaOk: SEVERITY_TIERS_CHECK(s.sla),
    reviewOk: REVIEW_CORRECT(s, false),
  }
}
