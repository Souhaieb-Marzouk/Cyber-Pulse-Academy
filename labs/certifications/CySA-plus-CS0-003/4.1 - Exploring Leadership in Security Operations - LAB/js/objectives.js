/* ======================================================================
   js/objectives.js — CHECK RESULTS validation engine
   Machine-checkable rules for all 21 objectives. Semantics identical to the original engine.
   Ported 1:1 from the original CyberLab "SOC Modernization Sprint" (Next.js) —
   content, wording, answers, hints and feedback are byte-identical (SC-D4).
   ====================================================================== */

(function () {
"use strict";
const { ALERTS, BENEFITS, BUDGET_CORRECT, BUDGET_CITES, CLASSIFY, CONNECTORS, CRED_CORRECT, CRED_BRANCHES, EVIDENCE, FP_ALERTS, FP_ESC_CORRECT, FAIL_CONTROL, FAIL_HOST, HANDOVER, HANDOVER_CORRECT, KPI_CORRECT, PAINS, PHISH_CORRECT, RUN_CORRECT_COUNT, RUN_FIRST_CLOSE, SLA_CORRECT_ORDER, SLA_TICKETS, STRATEGY_CORRECT, STRATEGY_CITES, TERM_OPTIONS, TICKET_PRIORITY_CORRECT, TIMELINE_QS, TUNE_FIX_CORRECT, TUNE_PREDICT_CORRECT, ANOMALY_ROUTE_CORRECT, TRIGGER_CORRECT } = window.LAB_DATA;


const arrEq = (a, b) => !!a && a.length === b.length && a.every((x, i) => x === b[i]);
const setEq = (a, b) => !!a && a.length === b.length && b.every((x) => a.includes(x));
const pick = (v, correct) => v === correct;
const allPairs = (m, list) => !!m && list.every((p) => m[p.id] === p.correct);
function parseCount(s) {
  if (!s)
    return null;
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}
function timeMatches(s, target) {
  if (!s)
    return false;
  const norm = s.replace(/\s/g, "").replace(/^0/, "");
  const t = target.replace(/^0/, "");
  return norm === t;
}
function validateObjective(id, env, _mode) {
  switch (id) {
    case "OBJ-M1":
      return { pass: TERM_OPTIONS.some((t) => t.id === "orchestration") && pick(env.termPick, "orchestration") };
    case "OBJ-M2": {
      const pass = allPairs(env.painPairs, PAINS);
      const wrong = pass ? [] : PAINS.filter((p) => env.painPairs?.[p.id] !== p.correct).map((p) => p.id);
      return { pass, note: pass ? undefined : `Off target: ${wrong.join(", ")}` };
    }
    case "OBJ-M3": {
      const pass = allPairs(env.classify, CLASSIFY.map((c) => ({ id: c.id, correct: c.correct })));
      return { pass, note: pass ? undefined : "Statements 1/3/5 are engine-executed; 2/4 are human-followed." };
    }
    case "OBJ-M4": {
      const pass = arrEq(env.phishOrder, PHISH_CORRECT);
      if (pass)
        return { pass };
      if (env.phishOrder && env.phishOrder[0] !== "S1")
        return { pass, note: "Every playbook starts with its TRIGGER — S1 must be first." };
      return { pass, note: "Facts before decisions: ENRICH and DETONATE must precede SCORE and DECIDE; RECORD is last." };
    }
    case "OBJ-M5": {
      const t = pick(env.triggerPick, TRIGGER_CORRECT);
      const conns = env.connectors ?? {};
      const reqOn = CONNECTORS.filter((c) => c.need).every((c) => conns[c.id]);
      const noiseOn = CONNECTORS.filter((c) => !c.need).some((c) => conns[c.id]);
      if (t && !reqOn)
        return { pass: false, note: "Workflow tools need connectors: gateway (reports), sandbox (verdicts), ticketing (cases + evidence)." };
      if (t && reqOn && noiseOn)
        return { pass: false, note: "HR payroll and building access touch no step — every extra connector is extra surface and noise." };
      return { pass: t && reqOn && !noiseOn };
    }
    case "OBJ-M6": {
      const pass = ALERTS.every((a) => env.dispositions?.[a.id] === a.correct);
      const wrong = pass ? [] : ALERTS.filter((a) => env.dispositions?.[a.id] !== a.correct).map((a) => a.id);
      return { pass, note: pass ? undefined : `Re-examine ${wrong.join(", ")}` };
    }
    case "OBJ-M7": {
      const c = parseCount(env.autoCount);
      const t = timeMatches(env.autoTime, RUN_FIRST_CLOSE);
      if (c !== null && c !== RUN_CORRECT_COUNT)
        return { pass: false, note: `Count the ✓ AUTO-CLOSE lines — you logged ${c}.` };
      return { pass: c === RUN_CORRECT_COUNT && t, note: pass2(c, t) };
    }
    case "OBJ-M8": {
      const e1 = pick(env.esc1, "e1b");
      const e2 = pick(env.esc2, "e2c");
      if (!e1 && e2)
        return { pass: false, note: "E1 is genuinely ambiguous (5/10, unknown reputation) — investigate deeper, do not close." };
      if (e1 && !e2)
        return { pass: false, note: "E2 is confirmed malicious with clickers — contain the identities (IR + resets), not the mail server." };
      return { pass: e1 && e2 };
    }
    case "OBJ-M9": {
      const h = pick(env.compHost, FAIL_HOST);
      const ctl = pick(env.compControl, FAIL_CONTROL);
      const p = pick(env.compPriority, TICKET_PRIORITY_CORRECT);
      const opened = !!env.ticketOpened;
      if (h && ctl && !p)
        return { pass: false, note: "Wrong priority: no active incident, but the endpoint lost detection coverage → P2 (24 h), not P1, not P3." };
      return { pass: h && ctl && p && opened, note: h && ctl && p && !opened ? "Selection looks right — click OPEN REMEDIATION TICKET to file it." : undefined };
    }
    case "OBJ-M10": {
      const ack = !!env.anomalyAck;
      const route = pick(env.anomalyRoute, ANOMALY_ROUTE_CORRECT);
      if (!ack && route)
        return { pass: false, note: "Real-time alerting only counts when a human acknowledges it — click ACKNOWLEDGE on the banner." };
      return { pass: ack && route, note: ack && !route ? "Now route it: an overnight 4.2 GB transfer to a first-seen ASN needs the on-call analyst paged, not a digest." : undefined };
    }
    case "OBJ-M11": {
      const mttd = !!env.mttdIn && /^\s*58\s*(m|min|mins|minutes?)?\s*$/i.test(env.mttdIn);
      const mttr = !!env.mttrIn && /^\s*9\s*(h|hr|hours?)?\s*40\s*(m|min|mins|minutes?)?\s*$|^\s*9:40\s*$/i.test(env.mttrIn);
      const kpi = setEq(env.kpiPicks, KPI_CORRECT);
      return { pass: mttd && mttr && kpi, note: mttd && mttr && !kpi ? "KPI set: only MTTD, MTTR and SLA-met answer “are we responding faster?”." : undefined };
    }
    case "OBJ-M12": {
      const b = pick(env.budgetPick, BUDGET_CORRECT);
      const cites = setEq(env.budgetCites, BUDGET_CITES.filter((c) => c.ok).map((c) => c.id));
      if (b && !cites)
        return { pass: false, note: "Citations must come from the dashboard trend: ×6.3 volume absorbed and 40 % coverage headroom." };
      return { pass: b && cites };
    }
    case "OBJ-H1": {
      const picks = setEq(env.handoverPicks, HANDOVER_CORRECT);
      const benefits = HANDOVER.filter((h) => h.systemic).every((h) => env.handoverBenefits?.[h.id] === h.benefit);
      if (!picks) {
        const wrong = (env.handoverPicks ?? []).filter((p) => !HANDOVER.find((h) => h.id === p)?.systemic);
        if (wrong.length)
          return { pass: false, note: `${wrong.join(", ")} are one-off noise items with owners — not systemic process gaps.` };
        return { pass: false, note: "Exactly three items are systemic. Look for recurring hours-lost, the overnight blind spot, and the audit scramble." };
      }
      return { pass: benefits, note: benefits ? undefined : "Benefits: duplicates→B1, overnight→B3, audit evidence→B5." };
    }
    case "OBJ-H2": {
      const order = arrEq(env.credOrder, CRED_CORRECT);
      const b1 = env.branchIntel === CRED_BRANCHES[0].options[CRED_BRANCHES[0].correct];
      const b2 = env.branchAccounts === CRED_BRANCHES[1].options[CRED_BRANCHES[1].correct];
      if (!order)
        return { pass: false, note: "Pipeline: measure (trigger) → correlate → enrich → branch → ticket → record. Nothing acts before enrichment." };
      if (order && (!b1 || !b2))
        return { pass: false, note: "Branches must be proportional: intel ≥2 hits → block at edge; affected accounts → MFA re-challenge." };
      return { pass: true };
    }
    case "OBJ-H3": {
      const a = env.timelineA === TIMELINE_QS[0].correct;
      const b = env.timelineB === TIMELINE_QS[1].correct;
      const c = env.timelineC === TIMELINE_QS[2].correct;
      if (a && !b)
        return { pass: false, note: "Root cause: it acted (quarantine) before any verdict existed — the SCORE gate is missing." };
      return { pass: a && b && c, note: a && b && !c ? "The fix is surgical: one SCORE gate before quarantine/auto-close — not more people, not fewer reports." : undefined };
    }
    case "OBJ-H4": {
      const fix = pick(env.tuneFix, TUNE_FIX_CORRECT);
      const pred = pick(env.tunePredict, TUNE_PREDICT_CORRECT);
      if (fix && !pred)
        return { pass: false, note: "A verdict gate adds seconds per item, not hours: FP falls sharply, close time rises slightly, SLA holds." };
      return { pass: fix && pred, note: !fix ? "Disabling auto-close or raising global thresholds destroys the speed benefit or blinds the SIEM — gate the consequential action instead." : undefined };
    }
    case "OBJ-H5": {
      const labels = FP_ALERTS.every((a) => env.fpLabels?.[a.id] === a.correct);
      const esc = pick(env.escPick, FP_ESC_CORRECT);
      const wrongL = labels ? [] : FP_ALERTS.filter((a) => env.fpLabels?.[a.id] !== a.correct).map((a) => a.id);
      if (!labels)
        return { pass: false, note: `Re-examine ${wrongL.join(", ")} — check for verified context (MFA + travel, mass mail).` };
      return { pass: esc, note: esc ? undefined : "The one that must ALWAYS reach a human: the exfil-sized overnight transfer (F6)." };
    }
    case "OBJ-H6": {
      const pass = setEq(env.evidencePicks, EVIDENCE.filter((e) => e.valid).map((e) => e.id));
      return { pass, note: pass ? undefined : "Valid evidence = continuous, machine-generated, timestamped, covering the whole period. Screenshots/verbal/single scans fail." };
    }
    case "OBJ-H7": {
      const order = arrEq(env.slaOrder, SLA_CORRECT_ORDER);
      const assignOk = SLA_TICKETS.every((t) => (env.slaAssign?.[t.id] ?? "") === (t.manual ? "manual" : "auto"));
      if (!order && assignOk)
        return { pass: false, note: "Order: T2 (active P1) first, then T1 — it breaches in 2 h despite being P3 — then the phish pair." };
      if (order && !assignOk)
        return { pass: false, note: "Assignments: T1 and T2 need humans (patch batch, active intrusion). T3/T4 are playbook-covered phishing → automation." };
      return { pass: order && assignOk };
    }
    case "OBJ-H8": {
      const s = pick(env.strategyPick, STRATEGY_CORRECT);
      const cites = setEq(env.strategyCites, STRATEGY_CITES.filter((c) => c.ok).map((c) => c.id));
      if (s && !cites)
        return { pass: false, note: "Justify with: 40 % coverage headroom, KRI +31 % demanding tuning, MTTR −69 % ROI." };
      return { pass: s && cites, note: !s ? "B ignores the rising over-alerting KRI; C wastes a proven ROI; D ignores all trends." : undefined };
    }
    case "OBJ-H9": {
      const pass = setEq(env.counterPicks, ["x-baseline", "x-hunt"]);
      return { pass, note: pass ? undefined : "Counters must break predictability without over-automating: baseline tuning + human sampling, randomized review + scheduled hunts." };
    }
    default:
      return { pass: false, note: "Unknown objective." };
  }
}
function pass2(c, t) {
  if (c === RUN_CORRECT_COUNT && !t)
    return "Count is right — now take the timestamp of the FIRST ✓ AUTO-CLOSE line.";
  return;
}

window.LAB_CHECKS = { validateObjective };
})();
