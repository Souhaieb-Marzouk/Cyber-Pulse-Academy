// ── Cloud Ward · CHECK RESULTS engine ─────────────────────────────────────────
// Faithful port of the `validate()` switch in src/lib/lab/store.ts (all 20 rules,
// identical conditions and identical feedback strings) + the fix-feedback map.
(function (global) {
  'use strict';

  const D = global.CW_DATA;

  function norm(s) {
    return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, '');
  }

  function nums(s) {
    const m = String(s == null ? '' : s).match(/\d+/g) || [];
    return m.map(Number);
  }

  function answerOf(s, k) {
    const a = s.answers[k];
    return a && typeof a === 'object' && !Array.isArray(a) ? a : {};
  }

  function wrongEntries(key, m) {
    return Object.keys(key).filter(function (k) { return m[k] !== key[k]; });
  }

  // fix feedback strings that begin with lowercase artifacts (store.ts passFix)
  const passFix = {
    'OBJ-M10-batch': 'Root cause chosen but not yet verified — press “Verify recovery” and confirm p95 falls under the 800 ms SLO on the ward board. Response (3.1) is done when telemetry confirms recovery, not when the patch lands.',
  };

  function validate(mode, id, s) {
    switch (id) {
      // ── MEDIUM ────────────────────────────────────────────────────────────
      case 'OBJ-M1': {
        const m = answerOf(s, 'm1');
        const key = { m1a: 'monitoring', m1b: 'observability', m1c: 'monitoring', m1d: 'observability', m1e: 'monitoring', m1f: 'observability' };
        const wrong = wrongEntries(key, m);
        if (!Object.keys(m).length) return { pass: false, msg: 'Classify all six statements first.' };
        if (wrong.length === 0)
          return { pass: true, msg: 'Exactly. Monitoring = predetermined checks and thresholds (the “known-unknowns”). Observability = interrogating telemetry to explain what nobody predicted. The ward needs both — the exam does too. (3.1 scope)' };
        return { pass: false, msg: 'Not yet — ' + wrong.length + ' of 6 are misclassified. Remember: fixed, pre-decided checks and pages are monitoring; asking new, unscripted questions of metrics+logs+traces is observability.' };
      }
      case 'OBJ-M2': {
        const m = answerOf(s, 'm2');
        const key = { m2a: 'metrics', m2b: 'metrics', m2c: 'logs', m2d: 'traces' };
        const wrong = wrongEntries(key, m);
        if (!Object.keys(m).length) return { pass: false, msg: 'Sort all four samples first.' };
        if (wrong.length === 0)
          return { pass: true, msg: 'Correct. Note that p99 latency is still a *metric* — a numeric series point — even though it sounds exotic. Percentiles power SLOs; logs give detail; spans give request context.' };
        return { pass: false, msg: 'Close — recheck the tricky ones. A percentile value (p99) is a metric. A timestamped record with a level and message is a log. Anything carrying a trace id plus a duration is a trace span.' };
      }
      case 'OBJ-M3': {
        const m = answerOf(s, 'm3');
        if (!m.svc) return { pass: false, msg: 'Select a patient from the ward map.' };
        if (m.svc === 'payment-svc')
          return { pass: true, msg: 'payment-svc: p95 1930 ms against a 160–260 ms baseline — the largest deviation on the ward. Baseline-relative thinking is what turns a wall of charts into a diagnosis (and it is exactly how 4.6 spots suspicious activity).' };
        return { pass: false, msg: 'That patient is elevated but still inside its own baseline band. Compare each strip against its grey band — the outlier is ~9× above its own normal range.' };
      }
      case 'OBJ-M4': {
        const m = answerOf(s, 'm4');
        const code = norm(m.code).replace(/^err[-_]?/, '');
        const n = nums(m.pool);
        if (!code && !n.length) return { pass: false, msg: 'Filter the stream (payment-svc + ERROR) and read the structured fields.' };
        if (code === 'pay-5033' && n[0] === 10 && n[1] === 10)
          return { pass: true, msg: 'PAY-5033, pool 10/10 — found in seconds because the logs aggregate into one searchable, structured stream. Before aggregation this meant SSH + grep across 8 hosts. That is the “aggregation” bullet of 3.1 made tangible.' };
        if (code !== 'pay-5033')
          return { pass: false, msg: 'The code is not matching. Filter to payment-svc + ERROR around 09:06 — the structured field reads err_code=PAY-5033.' };
        return { pass: false, msg: 'Right code, wrong occupancy. The same log line says “pool exhausted (10/10 in use)”.' };
      }
      case 'OBJ-M5': {
        const m = answerOf(s, 'm5');
        const dur = Number(m.dur);
        if (!m.span && !dur) return { pass: false, msg: 'Open the imaging suite, click the longest bar, report span + duration.' };
        if (m.span === 'payment' && dur >= 1850 && dur <= 2000)
          return { pass: true, msg: 'payment-svc/charge = 1930 ms — 80% of the whole 2400 ms request. Averages hid this; the waterfall shows the mechanism. Next question for the ward: what is *inside* that span?' };
        if (m.span !== 'payment')
          return { pass: false, msg: 'That span is fast. The slowest one stretches across most of the trace — it lives in payment-svc. Click the longest bar to read its duration.' };
        return { pass: false, msg: 'Right span — now read its duration label: 1930 ms (accept 1850–2000).' };
      }
      case 'OBJ-M6': {
        const m = answerOf(s, 'm6');
        if (!m.metric && !m.kind) return { pass: false, msg: 'Name the deviating metric and classify the deviation.' };
        if (m.metric === 'diskio' && m.kind === 'scheduled')
          return { pass: true, msg: 'Disk I/O, and it is *scheduled*: CHG-1187 runs nightly at 02:00 and the logs admit it. Golden rule: a deviation is only a signal when it is unexplained — reconcile with the change calendar before paging anyone.' };
        if (m.metric !== 'diskio')
          return { pass: false, msg: 'CPU and memory on orders-db stay near baseline. The dramatic nightly deviation is in disk I/O — look at the series in Chart review.' };
        return { pass: false, msg: 'Right metric — but check what happens at 02:00 in the logs before calling it an incident. Scheduled changes produce “deviations” too.' };
      }
      case 'OBJ-M7': {
        const t = s.env.triage;
        const wrong = D.MEDIUM_ALERTS.filter(function (x) { return t[x.id] !== x.correct; });
        if (!Object.keys(t).length) return { pass: false, msg: 'Assign a disposition to all six alerts.' };
        if (wrong.length === 0)
          return { pass: true, msg: 'Flawless triage: own the primary (ack), dedupe (merge), silence noise (suppress), route to specialists (escalate), and close what matches schedule or self-recovered. Triage order is severity × actionability — the exam calls this out under Alerting.' };
        return { pass: false, msg: 'Not yet — ' + wrong.length + ' of 6 mis-dispositioned, starting with ' + wrong[0].id + '. Cues: “secondary region rule” = merge; “flapping, zero user impact” = suppress; “matches CHG-1187” = close; “needs DBA” = escalate.' };
      }
      case 'OBJ-M8': {
        const r = s.env.alertRule;
        if (r.dur === 0) return { pass: false, msg: 'Set threshold, duration and severity — a rule with no duration pages on every blip.' };
        const okTh = r.threshold >= 1000 && r.threshold <= 2000;
        const okDur = r.dur >= 4 && r.dur <= 10;
        if (okTh && okDur && r.sev === 'P2')
          return { pass: true, msg: 'Tuned: p95 > ' + r.threshold + ' ms for ' + r.dur + ' min → P2. Above the 800 ms SLO so minor blips don’t page, below the 2400 ms disaster so you hear it early, duration kills flapping, and P2 is honest — P1 means full outage. This is alert tuning in one rule.' };
        if (!okTh)
          return { pass: false, msg: r.threshold <= 800 ? 'At 800 ms you page on every sale wobble — the SLO line is not an alert line. Put the threshold between SLO (800) and disaster (2400): 1000–2000 ms.' : 'That threshold is above the incident level (2400) or too high to be useful — choose 1000–2000 ms.' };
        if (!okDur)
          return { pass: false, msg: 'Duration 4–10 min (ward standard 5). A 30-second flap should never reach a pager.' };
        return { pass: false, msg: 'Severity: reserve P1 for full outage. An SLO breach with partial degradation is a P2 — honest severities are what keep pages credible.' };
      }
      case 'OBJ-M9': {
        const e = s.env;
        const okHot = e.retentionHot >= 14 && e.retentionHot <= 45;
        const okArc = e.retentionArchive >= 60 && e.retentionArchive <= 180;
        const issues = [];
        if (!e.agentPayment) issues.push('payment-svc agent must be ON (collection)');
        if (e.aggregation !== 'central') issues.push('ship logs to the central platform (aggregation)');
        if (e.logLevelPayment !== 'INFO') issues.push('payment-svc level: INFO (context without the DEBUG firehose)');
        if (e.logLevelTracker !== 'WARN') issues.push('marketing-tracker level: WARN (stop the flood at the source)');
        if (!okHot || !okArc) issues.push('retention: 14–45 d hot, 60–180 d archive (standard 30/90)');
        if (!issues.length)
          return { pass: true, msg: 'Pipeline configured: agents collect, the central platform aggregates, levels match value, and retention balances triage speed against storage cost. Every bullet of “Logging — Collection/Aggregation/Retention” (3.1) is now set deliberately, not by default.' };
        return { pass: false, msg: 'Not there yet: ' + issues[0] + (issues.length > 1 ? ' (+' + (issues.length - 1) + ' more)' : '') + '.' };
      }
      case 'OBJ-M10': {
        const e = s.env;
        if (e.scaleFix && !e.batchFix)
          return { pass: false, msg: 'Scaling treated the symptom: p95 improved but still breaches — the 47 repeated spans are still there. Scale is capacity; the disease is the N+1 access pattern.' };
        if (e.poolFix && !e.batchFix)
          return { pass: false, msg: 'A bigger pool is a stopgap: waiters got connections, but 1.46 s of redundant INSERTs remains and p95 still breaches. Treat the pattern, not the queue.' };
        if (e.batchFix && !e.verified)
          return { pass: false, msg: passFix['OBJ-M10-batch'] };
        if (e.batchFix && e.verified)
          return { pass: true, msg: 'Root cause treated and verified: 47 spans → 1 batch, p95 back under the 800 ms SLO. “Response” (3.1) is not done at apply — it is done when telemetry *confirms* recovery. That verification habit is what MTTR actually measures.' };
        return { pass: false, msg: 'Pick a treatment on the Treatment board and apply it. Let the trace guide you: 47 × 31 ms of identical INSERTs ≈ 1.46 s — the database is fast, the pattern is sick.' };
      }
      case 'OBJ-M11': {
        const m = answerOf(s, 'm11');
        const w = Number(m.weeks);
        if (!w && !m.trigger) return { pass: false, msg: 'Forecast the breach weeks and configure the scaling response.' };
        const okW = w >= 9 && w <= 12;
        const okTr = m.trigger === 'trending';
        const okTy = m.type === 'vertical';
        if (okW && okTr && okTy)
          return { pass: true, msg: '≈' + w + ' weeks (true value 10.7) with a trending-triggered vertical scale — textbook capacity planning: compound growth ln(1.5/1.24)/ln(1.08) ≈ 2.47 months, act *before* the ceiling, and let the trend itself be the trigger.' };
        if (!okW) return { pass: false, msg: 'Recompute: growth compounds monthly — 1.5/1.24 gives the headroom ratio, 8%/month compounding gives ≈ 2.5 months ≈ 10–11 weeks (accept 9–12).' };
        if (!okTr) return { pass: false, msg: 'A *forecast* is a trend. CV0-004’s triggered types are trending / load / event — you are reacting to a trajectory, not to live load or an event feed.' };
        return { pass: false, msg: 'Adding storage to the same instance is vertical scaling; horizontal means more instances behind the service. The db needs a bigger disk, not siblings.' };
      }

      // ── HARD ──────────────────────────────────────────────────────────────
      case 'OBJ-H1': {
        const m = answerOf(s, 'h1');
        const ev = Array.isArray(m.evidence) ? m.evidence : [];
        const okEv = ev.indexOf('runbook') !== -1 && ev.indexOf('calendar') !== -1;
        if (!m.verdict && !ev.length) return { pass: false, msg: 'Classify the spike — but only after grounding it in the evidence folder.' };
        if (m.verdict === 'benign' && okEv && m.action === 'close')
          return { pass: true, msg: 'Evidence-grounded verdict: benign. The 02:00 window matches CHG-1187 (documented nightly snapshot), the logs name the job, and the recurrence is metronomic. You closed a P2 without a page — that is baseline discipline (3.1) protecting the security monitoring budget (4.6).' };
        if (m.verdict === 'incident')
          return { pass: false, msg: 'Rejected: an 8-minute, metronomic, 14-night-recurring spike that the logs attribute to “snapshot job started (CHG-1187, nightly 02:00)” is not an incident. Check the evidence folder.' };
        if (!okEv)
          return { pass: false, msg: 'A verdict without evidence is a guess. Open BOTH the runbook entry and the change calendar in the records desk before filing — the check requires them.' };
        return { pass: false, msg: 'Right verdict, wrong follow-through: a benign known-change alert gets closed, and its dashboard window annotated.' };
      }
      case 'OBJ-H2': {
        const m = answerOf(s, 'h2');
        const tid = norm(m.traceId).replace(/^trace[=:]?/, '');
        const cnt = Number(m.count);
        if (!m.service && !cnt && !tid) return { pass: false, msg: 'Deliver the four-part diagnosis from the evidence.' };
        const okSvc = m.service === 'payment';
        const okCnt = cnt === 47;
        const okTid = tid === '9f2ca71d44e08b31';
        const okCause = m.cause === 'n1';
        if (okSvc && okCnt && okTid && okCause)
          return { pass: true, msg: 'Full diagnosis accepted: payment-svc/charge spans 1930 ms of the 2400 ms request; 47 identical INSERT loyalty_points spans (~31 ms each ≈ 1.46 s) prove the N+1 access pattern; exhibit trace 9f2ca71d44e08b31. That is a defensible, evidence-chained root cause.' };
        const parts = [];
        if (!okSvc) parts.push('culprit service (follow the longest bar)');
        if (!okCnt) parts.push('repeated-span count (the N+1 signature — count the repeated spans)');
        if (!okTid) parts.push('trace id of the exhibit (trace header, or err fields in Chart review)');
        if (!okCause) parts.push('root-cause class (access pattern, not hardware)');
        return { pass: false, msg: 'Near-miss — fix: ' + parts.join('; ') + '.' };
      }
      case 'OBJ-H3': {
        const t = s.env.hardTriage;
        const wrong = D.HARD_ALERTS.filter(function (x) { return t[x.id] !== x.correct; });
        if (!Object.keys(t).length) return { pass: false, msg: 'Disposition all ten alerts. Distractors are present.' };
        if (wrong.length === 0)
          return { pass: true, msg: 'Storm handled: 2 ack, 2 merge, 1 escalate, 2 suppress, 3 close — including the finance alert that wandered in and the scheduled-change lookalike. Under noise, triage quality *is* MTTD.' };
        return { pass: false, msg: wrong.length + ' of 10 wrong, first: ' + wrong[0].id + ' — ' + wrong[0].title + '. Reread its detail: “billing projection” is finance; “nightly, matches CHG-1187” is scheduled; “auto-resolved” and “secondary region rule” close/merge themselves.' };
      }
      case 'OBJ-H4': {
        const m = answerOf(s, 'h4');
        const th = Number(m.threshold);
        const dur = Number(m.dur);
        if (m.source === undefined && !th) return { pass: false, msg: 'Configure the rule: source scope, threshold, duration, severity — and cut the flood at the source.' };
        const okSrc = m.source === 'checkout';
        const okTh = th >= 3;
        const okDur = dur >= 5;
        const okSev = m.sev === 'P3';
        const okDbg = m.debug === true;
        if (okSrc && okTh && okDur && okSev && okDbg)
          return { pass: true, msg: 'Rule tuned: checkout-only, ≥' + th + '% for ' + dur + ' min at P3, DEBUG collection off for the tracker. Pages drop from 46/shift to ~0 without losing a real signal — alert-fatigue tuning that a doctor would call “treat the cause, not the symptom”.' };
        const parts = [];
        if (!okSrc) parts.push('scope the rule to checkout (ALL inherits tracker noise)');
        if (!okTh) parts.push('threshold ≥ 3% (real 5xx storms start there)');
        if (!okDur) parts.push('duration ≥ 5 min (kills sub-minute flapping)');
        if (!okSev) parts.push('severity P3 (no user impact — a page is not justified)');
        if (!okDbg) parts.push('stop DEBUG collection on marketing-tracker at the source');
        return { pass: false, msg: 'Rejected — ' + parts.join('; ') + '.' };
      }
      case 'OBJ-H5': {
        const h = s.env.h5;
        const okCol = h.collect === 'agent';
        const okLvl = h.level === 'INFO';
        const okSmp = h.sampling >= 10 && h.sampling <= 50;
        const okRet = h.retention === 'tiered';
        const okW = h.widgets.indexOf('latency_p99') !== -1 && h.widgets.indexOf('error_rate') !== -1;
        if (okCol && okLvl && okSmp && okRet && okW)
          return { pass: true, msg: 'Design approved: agent for span-level attribution, INFO + 25%-style sampling to respect the budget, tiered retention, and a dashboard that shows the p99 SLO and error rate directly. This is 3.1’s imperative — *configure appropriate resources* — executed as a deliberate trade-off.' };
        const parts = [];
        if (!okCol) parts.push('collection: agent (agentless cannot see app-internal spans)');
        if (!okLvl) parts.push('level: INFO (DEBUG breaches the budget, ERROR loses context)');
        if (!okSmp) parts.push('sampling 10–50% on high-volume signals');
        if (!okRet) parts.push('retention: tiered (unbounded “long” breaches the budget, “short” loses forensics)');
        if (!okW) parts.push('dashboard must include p99 latency AND error-rate widgets');
        return { pass: false, msg: 'Design rejected — ' + parts.join('; ') + '.' };
      }
      case 'OBJ-H6': {
        const o = s.env.h6;
        const key = ['h6a', 'h6b', 'h6c', 'h6d', 'h6e'];
        if (o.length === 0) return { pass: false, msg: 'Order the five runbook actions from the eight cards.' };
        if (o.length === key.length && o.every(function (v, i) { return v === key[i]; }))
          return { pass: true, msg: 'Sequence accepted: stopgap → root-cause hotfix → verify the mechanism (spans collapse) → verify the symptom (p95 under SLO) → document & close. Hardware resizing, alert-silencing and feature removal are all rejected as runbook steps — that is response discipline.' };
        if (o.some(function (v) { return key.indexOf(v) === -1; }))
          return { pass: false, msg: 'One or more selected cards do not belong in the runbook at all. A step that contradicts the trace evidence (resizing the healthy db) or that silences alerting is not a response step.' };
        return { pass: false, msg: 'Right five cards, wrong order. The discipline is: stopgap, root cause, verify mechanism (trace), verify symptom (metrics), then documentation & closure.' };
      }
      case 'OBJ-H7': {
        const m = answerOf(s, 'h7');
        const c = Number(m.cohort);
        if (!m.metric && !c) return { pass: false, msg: 'Compute the tail impact and choose the SLO-grade metric.' };
        const okC = c >= 400 && c <= 440;
        if (m.metric === 'p99' && okC)
          return { pass: true, msg: '420 requests/hour — a full ward of patients the average never shows. p99 is the metric that guards them, which is why user-facing SLOs are written in percentiles.' };
        if (m.metric !== 'p99')
          return { pass: false, msg: 'The average is precisely the metric that hides these users. Which percentile names the worst 1% of requests?' };
        return { pass: false, msg: 'Right metric — now the math: 1% of 42,000 requests/hour (accept 400–440).' };
      }
      case 'OBJ-H8': {
        const m = answerOf(s, 'h8');
        const b = Number(m.budget);
        if (!b && !m.decision) return { pass: false, msg: 'Compute the monthly error budget and make the deploy call.' };
        const okB = b >= 42 && b <= 44;
        if (okB && m.decision === 'freeze')
          return { pass: true, msg: '43.2 min budget (0.1% × 43,200 min), 38.2 burned → 5.0 min left. Freezing risky deploys until the window resets is the error-budget contract — reliability as an engineering currency.' };
        if (!okB)
          return { pass: false, msg: 'Recompute: 30 days × 24 h × 60 min = 43,200 minutes; 99.9% allows 0.1% down → 43.2 min (accept 42–44).' };
        return { pass: false, msg: 'With 5.0 budget-minutes left in the window, shipping a risky release burns the budget instantly. What does the error-budget contract say to do?' };
      }
      case 'OBJ-H9': {
        const h = s.env.h9;
        if (h.debug === 'keep' && h.info === 'hot' && h.error === '30' && !h.sampling)
          return { pass: false, msg: 'That is the current over-budget config. Rank the classes by forensic value before re-tiering.' };
        if (h.debug === 'drop' && h.info === 'cold' && h.error === '90' && h.sampling)
          return { pass: true, msg: 'Policy accepted: DEBUG dropped at source (cheapest value, highest volume), INFO demoted to cold storage, ERROR held hot for 90 days, sampling on. Ingestion lands back under budget with zero forensic loss — retention as risk economics.' };
        const parts = [];
        if (h.debug !== 'drop') parts.push('drop DEBUG at source (biggest saving, lowest value)');
        if (h.info !== 'cold') parts.push('demote INFO to cold/archive tier');
        if (h.error !== '90') parts.push('hold ERROR hot for 90 days (forensic core)');
        if (!h.sampling) parts.push('enable sampling on high-volume signals');
        return { pass: false, msg: 'Not yet — ' + parts.join('; ') + '.' };
      }
      default:
        return { pass: false, msg: 'Unknown objective.' };
    }
  }

  global.CW_ENGINE = { validate: validate, norm: norm, nums: nums };
})(this);
