// ── Fault Isolation Line — validation engine (js/objectives.js) ──
// Machine-checkable rules per objective + star rating + focus areas.
// Ported 1:1 from the original framework lab (src/lib/lab/engine.ts).
// Every rule, precedence order and feedback string is identical.

function sameSet(a, b) {
  return a.length === b.length && a.every(function (x) { return b.indexOf(x) !== -1; });
}

function subSet(required, actual) {
  return required.every(function (r) { return actual.indexOf(r) !== -1; });
}

function factIdsForMode(mode) {
  return FACTS.filter(function (f) { return mode === 'hard' ? true : !f.hardOnly; });
}
function triageForMode(mode) {
  return TRIAGE.filter(function (t) { return mode === 'hard' ? true : !t.hardOnly; });
}
function chatsForMode(mode) {
  return CHATS
    .filter(function (c) { return mode === 'hard' ? true : !c.hardOnly; })
    .map(function (c) { return c.id; });
}

// ── Per-objective validators ──
function evaluateObjective(id, s) {
  const mode = s.mode || 'medium';

  switch (id) {
    // ── Dispatch drills ──
    case 'M1': {
      const ok = sameSet(s.dispatch.stepOrder, CANONICAL_STEP_ORDER) &&
        s.dispatch.stepOrder.every(function (v, i) { return v === CANONICAL_STEP_ORDER[i]; });
      return ok
        ? { pass: true, feedback: 'The line is sequenced: Identify \u2192 Theory \u2192 Test \u2192 Plan \u2192 Implement \u2192 Verify \u2192 Document. This order is the exam\u2019s favorite scramble — lock it in. Next: the sub-step sort.' }
        : { pass: false, feedback: 'Not the canonical order yet. Remember the pairs: theory comes BEFORE testing, planning BEFORE implementing, verifying BEFORE documenting. Information gathering always opens, documentation always closes.' };
    }
    case 'M2': {
      const wrong = SUBSTEP_CHIPS.filter(function (c) { return (s.dispatch.subMatches[c.id] || '') !== c.step; });
      return wrong.length === 0
        ? { pass: true, feedback: 'Every sub-step landed on its parent step. Notice how Steps 1–3 are about learning and proving, 4–5 about acting safely, 6–7 about proving it stuck and keeping the memory.' }
        : { pass: false, feedback: wrong.length + ' sub-step' + (wrong.length > 1 ? 's are' : ' is') + ' on the wrong stop. Test each chip against its verb: "determine/duplicate/question users" = learning (Step 1); "question the obvious" = deciding a cause (Step 2); "identify potential effects" = planning (Step 4).' };
    }

    // ── Intake ──
    case 'M3':
    case 'H1': {
      const pool = factIdsForMode(mode).filter(function (f) { return mode === 'hard' ? true : !f.hardOnly; });
      const correctIds = pool.filter(function (f) { return f.correct; }).map(function (f) { return f.id; });
      const wrongPicked = s.intake.facts.filter(function (f) { return correctIds.indexOf(f) === -1; });
      const missed = correctIds.filter(function (c) { return s.intake.facts.indexOf(c) === -1; });
      const chatsOk = subSet(chatsForMode(mode), s.intake.chats);
      const dupOk = s.intake.duplicated;

      if (wrongPicked.length > 0) {
        return { pass: false, feedback: 'The statement still contains non-scope or unconfirmed items (' + wrongPicked.join(', ') + '). Finance\u2019s email, CORE-1\u2019s CPU tile, AP-3F-07, and Owen\u2019s "internet is down" are different problems or different devices — compound problems get split, red herrings get excluded. This distinction is exactly what a NOC shift review checks.' };
      }
      if (missed.length > 0) {
        return { pass: false, feedback: 'Missing confirmed facts: ' + missed.join(', ') + '. A problem statement is complete when scope, start time, affected service, and duplication are all in it.' };
      }
      if (!chatsOk) {
        return { pass: false, feedback: 'Question the users first — open every interview in the intake console. "Question users" is an official sub-step of Identify, and each chat adds a fact you cannot get from panels.' };
      }
      if (!dupOk) {
        return { pass: false, feedback: 'Duplicate the problem before theorizing: run the reproduce bench from CLIENT-SHIP-03. "Duplicate the problem, if possible" confirms the failure is real and hands you evidence.' };
      }
      if (id === 'H1') {
        const items = triageForMode('hard');
        const wrongRoutes = items.filter(function (t) { return (s.intake.triage[t.id] || '') !== t.answer; });
        if (wrongRoutes.length > 0) {
          return { pass: false, feedback: wrongRoutes.length + ' report' + (wrongRoutes.length > 1 ? 's are' : ' is') + ' mis-routed or left unrouted. Approach multiple problems individually: only Building C shipping failures stay in MERID-0417; CORE-1\u2019s CPU tile, AP-3F-07, Owen\u2019s Salesforce slowdown and the chair request each go their own way.' };
        }
      }
      return { pass: true, feedback: 'Problem statement locked: scope (Building C shipping, wired + Wi-Fi), onset (~07:30), failing service (LABELSVR01), context (night IDF-2 work), and duplication (CLIENT-SHIP-03). This is what "Identify the problem" produces. A defender\u2019s next move: correlate with the change log.' };
    }
    case 'M4':
    case 'H2': {
      if (s.intake.changeId === 'CHG-2291') {
        return { pass: true, feedback: 'CHG-2291 — the IDF-2 fiber panel replacement in the SAME building, re-patching the SAME switch\u2019s uplink, with post-change verification still pending. Correlating change location to failure location is the highest-value question in Step 1.' };
      }
      return { pass: false, feedback: 'Not that one. CHG-2288 touched CORE-1\u2019s Building A WAN path and CHG-2285 only expanded a DHCP scope on a server — neither sits on the failing path. Match change SCOPE to failure SCOPE.' };
    }
    case 'M5': {
      const items = triageForMode('medium');
      const wrong = items.filter(function (t) { return (s.intake.triage[t.id] || '') !== t.answer; });
      return wrong.length === 0
        ? { pass: true, feedback: 'Compound problem handled correctly: one problem per ticket. The slow single website and the email slowness get their own tickets; the chair request leaves the network queue entirely. Mixing problems is how outages hide inside other outages.' }
        : { pass: false, feedback: wrong.length + ' report' + (wrong.length > 1 ? 's are' : ' is') + ' mis-routed or left unrouted. Rule: if it shares the affected service AND scope with MERID-0417, it stays here; otherwise it becomes a separate ticket (or leaves the network queue).' };
    }

    // ── Theory ──
    case 'M6':
    case 'H3': {
      const obviousOk = sameSet(s.theory.obvious, ['o1', 'o2', 'o3']);
      if (!obviousOk) {
        return { pass: false, feedback: 'Re-check the obvious questions. Corrupted databases and reimaging are deep, late moves — the obvious questions after a night of physical work are: what changed, is the physical link good, and what is the scope?' };
      }
      if (s.theory.causeId !== 'c2') {
        return { pass: false, feedback: s.theory.causeId === 'c1'
          ? 'DHCP is a plausible theory — but "question the obvious" first: a physical panel replacement happened overnight in THIS closet. Keep DHCP as the rival theory; the test bench will disprove it for you if you commit it.'
          : 'Commit the cause the obvious facts point to: the re-patched fiber uplink in IDF-2 (CHG-2291). Server crashes, AP failures, and BGP issues contradict the evidence you already have (one area, wired + wireless).' };
      }
      if (s.theory.approach !== 'bottom-up') {
        return { pass: false, feedback: 'Wrong approach for THIS incident. Many users, one area, physical work last night \u2192 start at Layer 1. That is the bottom-up layered approach.' };
      }
      return { pass: true, feedback: 'Theory committed: uplink fiber patch damaged/unseated during CHG-2291, tested bottom-up. Notice what you did NOT do — you kept rival theories alive for the bench to disprove. That is Step 2 done properly.' };
    }
    case 'M7': {
      // NOTE: replicated 1:1 from the original — counts only entries that are
      // actually set in s.theory.minis (an original quirk, reported in the
      // Conversion Notes, intentionally NOT "fixed" here per SC-D1).
      const answers = { s1: 'top-down', s2: 'bottom-up', s3: 'divide' };
      const wrong = Object.keys(s.theory.minis).filter(function (k) { return s.theory.minis[k] !== answers[k]; });
      return wrong.length === 0
        ? { pass: true, feedback: 'All three matched: one user + app \u2192 top-down; everyone + physical change \u2192 bottom-up; company-wide + unknown midpoint \u2192 divide and conquer. On the exam, "who is affected?" and "what just changed?" pick the approach for you.' }
        : { pass: false, feedback: wrong.length + ' of 3 mis-picked. Cues: affected population (one vs. many vs. all) and recent physical work. A single user\u2019s browser is an application problem; a building dying after a router swap starts at Layer 1; a vague company-wide slowdown gets split at a middle point.' };
    }
    case 'H4': {
      if (s.theory.approach !== 'bottom-up') {
        return { pass: false, feedback: 'Strategy needs the right approach first: for this incident it is bottom-up (physical change + one area + many users).' };
      }
      const expected = ['po1', 'po2', 'po3', 'po4', 'po5'];
      const ok = s.theory.probeOrder.every(function (v, i) { return v === expected[i]; });
      return ok
        ? { pass: true, feedback: 'Probe plan sequenced least\u2192most intrusive: read-only, then active pings, then hands-on. Real change-review boards reject plans that poke hardware before reading state — this ordering is the operational half of Step 2.' }
        : { pass: false, feedback: 'Sequence rejected. Order by cost and intrusiveness: show commands and ipconfig (read-only) first, pings (active but harmless) next, cable test after, and physically touching the cable LAST.' };
    }

    // ── Test bench ──
    case 'M8': {
      const t = s.test;
      const sufficient = t.probes.indexOf('p3') !== -1 && t.probes.indexOf('p5') !== -1 && (t.probes.indexOf('p1') !== -1 || t.probes.indexOf('p2') !== -1);
      if (!sufficient) {
        return { pass: false, feedback: 'Probe set insufficient. A sufficient set rules out rival causes: client config (p3 — kills the DHCP theory), a control probe from HQ (p5 — clears the server), and a physical check (p1 or p2). Each probe should DELETE a suspect.' };
      }
      if (s.theory.causeId !== 'c2') {
        if (!t.discarded) return { pass: false, feedback: 'Your committed theory was disproven — p3 shows a healthy lease, p5 shows a healthy server. Formally DISCARD it and establish a new theory (that is Step 3\u2019s not-confirmed branch), then re-verdict.' };
        if (t.newCause !== 'c2') return { pass: false, feedback: 'Re-establish the theory: the only cause consistent with ALL results is the fiber patch on the re-patched uplink. Pick it and adopt it.' };
        if (t.verdict !== 'confirmed' || t.branch !== 'next-steps') return { pass: false, feedback: 'With the new theory adopted and confirmed, the branch is "determine next steps \u2192 proceed to plan." Closing or implementing without a plan skips Steps 4\u2019s effect analysis.' };
        return { pass: true, feedback: 'Textbook loop: theory disproven \u2192 discarded \u2192 new theory established \u2192 confirmed by converging evidence (flapping uplink + failed fiber test + healthy control). The methodology\u2019s not-confirmed branch just saved you from implementing a DHCP "fix".' };
      }
      if (t.verdict === 'not-confirmed') {
        return { pass: false, feedback: 'Re-read the evidence: flapping uplink, 8.4 dB insertion loss, healthy control probe. The physical theory IS confirmed — re-check your verdict before choosing a branch.' };
      }
      if (t.verdict !== 'confirmed' || t.branch !== 'next-steps') {
        return { pass: false, feedback: 'Verdict and branch must be set: CONFIRMED, then "determine next steps \u2192 proceed to plan." Implementing now would skip the potential-effects analysis Step 4 exists for.' };
      }
      return { pass: true, feedback: 'Confirmed with a sufficient probe set. Note the evidence pattern: the failing segment is isolated below the uplink, the server is cleared by a control probe, and DHCP is cleared by the lease. Next stop: plan the fix and name its effects.' };
    }
    case 'H5': {
      const t = s.test;
      const required = ['p1', 'p2', 'p3', 'p4', 'p5'];
      const missing = required.filter(function (r) { return t.probes.indexOf(r) === -1; });
      if (missing.length > 0) {
        return { pass: false, feedback: 'Hard battery incomplete — missing: ' + missing.join(', ') + '. Hard mode expects the full evidence chain: interface state, cable test, client config, gateway ping, and the HQ control probe.' };
      }
      if (s.theory.causeId !== 'c2') {
        if (!t.discarded) return { pass: false, feedback: 'The probes disproved your committed theory. Hard discipline: formally discard it, establish the new theory (fiber patch on Gi1/0/48), and re-verdict. Silent switching leaves no audit trail.' };
        if (t.newCause !== 'c2') return { pass: false, feedback: 'Adopt the cause the evidence actually supports: the re-patched fiber uplink.' };
      }
      if (t.verdict !== 'confirmed' || t.branch !== 'next-steps') {
        return { pass: false, feedback: 'Final state required: verdict CONFIRMED (the evidence is unambiguous) and branch "determine next steps \u2192 proceed to plan."' };
      }
      return { pass: true, feedback: 'Full battery, formal theory update, clean verdict. This is the Step 3 loop working: probe \u2192 interpret \u2192 confirm or re-establish. The ticket now carries an evidence-backed cause.' };
    }

    // ── Plan ──
    case 'M9':
    case 'H7': {
      const expected = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];
      const orderOk = s.plan.order.every(function (v, i) { return v === expected[i]; });
      const needEffects = mode === 'hard' ? ['e1', 'e2', 'e3', 'e6'] : ['e1', 'e2', 'e3'];
      const wrongEffects = s.plan.effects.filter(function (e) { return ['e4', 'e5'].indexOf(e) !== -1; });
      const missedEffects = needEffects.filter(function (e) { return s.plan.effects.indexOf(e) === -1; });
      if (!orderOk) {
        return { pass: false, feedback: 'Plan order rejected. Communication comes first (notify), then preparation (spare + access), then window confirmation — only then does anyone touch hardware. Post-change confirmation and client checks close the plan.' };
      }
      if (wrongEffects.length > 0) {
        return { pass: false, feedback: '"Whole company offline" contradicts the architecture (single building uplink), and "risk-free" is never a real effect. Potential effects are things users or teams will FEEL.' };
      }
      if (missedEffects.length > 0) {
        return { pass: false, feedback: 'Missing effects: ' + missedEffects.join(', ') + '. ' + (mode === 'hard' ? 'Hard mode also wants the vendor contingency — a plan without a plan B is a hope.' : 'Think blip, deadline, and access.') };
      }
      return { pass: true, feedback: 'Plan approved: ' + s.plan.order.length + ' ordered steps, effects named' + (mode === 'hard' ? ' including the vendor fallback' : '') + ". Step 4\u2019s second half — identifying potential effects — is what turns a fix into a managed change." };
    }

    // ── Implement ──
    case 'M10': {
      if (s.implement.decision !== 'implement') {
        return { pass: false, feedback: s.implement.decision === 'escalate'
          ? 'Escalation does not fit: the theory is confirmed, the fix is within NOC skill and access, and the plan is approved. Escalate is for fixes outside your access, skill, or scope — here that would be fiber-splicing or vendor-only damage.'
          : 'Make the call at the gate first: implement or escalate.' };
      }
      const ok = sameSet(s.implement.actions, CORRECT_ACTION_SEQUENCE) &&
        s.implement.actions.every(function (v, i) { return v === CORRECT_ACTION_SEQUENCE[i]; });
      if (!ok) {
        return { pass: false, feedback: 'Execution sequence rejected. Change discipline: communicate (notify) \u2192 prepare (spare) \u2192 confirm the window \u2192 touch hardware (replace) \u2192 confirm the link. Use UNDO if a stray action slipped in.' };
      }
      return { pass: true, feedback: 'Implemented in the approved order — communication preceded every physical action. On the floor, this sequence is what change auditors check after every window.' };
    }
    case 'H6': {
      if (s.implement.decision !== 'implement') {
        return { pass: false, feedback: 'Wrong call. Judge by access, skill, and scope: the fix is a patch-cable swap, the tech has IDF-2 access, and the plan is approved — implement. Ticket age is never an escalation criterion.' };
      }
      const okR = sameSet(s.implement.reasons, ['r1', 'r2', 'r3']);
      return okR
        ? { pass: true, feedback: 'Decision justified on the three real criteria: confirmed evidence, in-scope skill/access, approved plan. That justification is what makes an implementation auditable.' }
        : { pass: false, feedback: 'Justification incomplete or includes a fake reason. The valid grounds: evidence confirmed the theory, the fix is within skill and access, and the plan/effects were communicated and approved.' };
    }
    case 'H8': {
      if (s.implement.mistakes.length > 0) {
        return { pass: false, feedback: 'Wrong-device action recorded: ' + s.implement.mistakes.join(', ') + '. Rebooting CORE-1, rolling back CHG-2291, swapping SW2, or "clearing counters and closing" would each create a NEW outage or destroy evidence. In hard mode every mistake counts, even undone ones.' };
      }
      const ok = s.implement.actions.every(function (v, i) { return v === CORRECT_ACTION_SEQUENCE[i]; }) && sameSet(s.implement.actions, CORRECT_ACTION_SEQUENCE);
      return ok
        ? { pass: true, feedback: 'Flawless execution: correct order, zero wrong-device actions. This is the standard a real change window demands.' }
        : { pass: false, feedback: 'Sequence incomplete or out of order: notify \u2192 spare \u2192 window \u2192 replace \u2192 confirm link. Discipline IS the deliverable.' };
    }

    // ── Verify ──
    case 'M11': {
      const needCore = ['v1', 'v2', 'v3'];
      const wrongPv = s.verify.preventive.filter(function (p) { return ['pv4', 'pv5'].indexOf(p) !== -1; });
      const missingPv = ['pv1', 'pv2', 'pv3'].filter(function (p) { return s.verify.preventive.indexOf(p) === -1; });
      if (!subSet(needCore, s.verify.checks)) {
        return { pass: false, feedback: 'Battery incomplete. Full functionality = connectivity (ping), the actual business function (test label), AND a human confirming (Dana & Priya). "It should work now" is not verification.' };
      }
      if (!s.verify.checks.some(function (c) { return ['v4', 'v5'].indexOf(c) !== -1; })) {
        return { pass: false, feedback: 'Add stability evidence: watch the counters (v4) or confirm the Wi-Fi tablets (v5) — verification covers every channel the users touched.' };
      }
      if (wrongPv.length > 0) {
        return { pass: false, feedback: 'Those preventive measures don\u2019t match the fault: DHCP scope and building-wide fiber replacement are unrelated or disproportionate. Preventive measures should target the ROOT cause path.' };
      }
      if (missingPv.length > 0) {
        return { pass: false, feedback: 'Preventive set incomplete: ' + missingPv.join(', ') + '. Labeling, alerting, and the checklist change each kill one way this incident could repeat.' };
      }
      return { pass: true, feedback: 'Full functionality proven — by the users, not just the pings — and three preventive measures selected. Step 6\u2019s "if applicable" branch is now applied: this failure was avoidable, so prevention is mandatory.' };
    }
    case 'H9': {
      const all = ['v1', 'v2', 'v3', 'v4', 'v5'];
      const missing = all.filter(function (v) { return s.verify.checks.indexOf(v) === -1; });
      const wrongPv = s.verify.preventive.filter(function (p) { return ['pv4', 'pv5'].indexOf(p) !== -1; });
      const missingPv = ['pv1', 'pv2', 'pv3'].filter(function (p) { return s.verify.preventive.indexOf(p) === -1; });
      if (missing.length > 0) {
        return { pass: false, feedback: '"Full" system functionality — missing: ' + missing.join(', ') + '. Wired, Wi-Fi, the business app, counter stability, and human confirmation all belong in the battery.' };
      }
      if (wrongPv.length > 0 || missingPv.length > 0) {
        return { pass: false, feedback: 'Preventive set must be exactly the three root-cause-targeted measures (labeling, uplink alerting, checklist change) — nothing unrelated, nothing disproportionate.' };
      }
      return { pass: true, feedback: 'Complete battery + root-cause preventive set. Functionality was proven on every channel users touched — this is what makes closure defensible.' };
    }

    // ── Document ──
    case 'M12':
    case 'H10': {
      const d = s.doc;
      const changeOk = d.changeId.trim().toUpperCase() === 'CHG-2291';
      if (d.device !== 'SW2-BC' || d.port !== 'Gi1/0/48 (uplink to CORE-1)' || d.cause !== DOC_CAUSES[1] || !changeOk) {
        return { pass: false, feedback: 'Findings not audit-ready. The next tech must see exactly what broke and why: device SW2-BC, uplink Gi1/0/48, the fiber-patch cause, and change ID CHG-2291.' };
      }
      const wrongA = d.actions.filter(function (a) { return ['da4', 'da5'].indexOf(a) !== -1; });
      if (wrongA.length > 0) {
        return { pass: false, feedback: 'Documentation records what HAPPENED — no escalation and no CORE-1 reboot occurred. Fabricated actions poison incident history.' };
      }
      if (!sameSet(d.actions, ['da1', 'da2', 'da3'])) {
        return { pass: false, feedback: 'Actions incomplete: the notification, the cable replacement, and the verification all belong in the record.' };
      }
      if (d.outcome !== DOC_OUTCOMES[1]) {
        return { pass: false, feedback: 'Outcome: resolved, full functionality restored, users confirmed — exactly what the verification battery proved.' };
      }
      const wrongL = d.lessons.filter(function (l) { return l === 'dl4'; });
      const missingL = ['dl1', 'dl2', 'dl3'].filter(function (l) { return d.lessons.indexOf(l) === -1; });
      if (wrongL.length > 0 || missingL.length > 0) {
        return { pass: false, feedback: 'Lessons learned must be real and actionable (missing: ' + (missingL.length ? missingL.join(', ') : 'none') + (wrongL.length ? '; "reboot everything" is not a lesson' : '') + ').' };
      }
      if (!d.closed) {
        return { pass: false, feedback: 'Everything is filled in — press CLOSE TICKET to finish the lifecycle.' };
      }
      return { pass: true, feedback: 'Ticket closed with an audit-ready record: findings (device, port, cause, change), real actions, verified outcome, and lessons that change future behavior. The 7-step line is complete — from vague report to organizational memory.' };
    }

    default:
      return { pass: false, feedback: 'Unknown objective.' };
  }
}

// ── Star rating (transparent rubric) ──
function computeStars(objectives) {
  let deductions = 0;
  for (const o of Object.values(objectives)) {
    deductions += Math.max(0, o.attempts - 1);
    deductions += o.hints;
  }
  let stars = 5;
  if (deductions > 12) stars = 1;
  else if (deductions > 7) stars = 2;
  else if (deductions > 3) stars = 3;
  else if (deductions > 0) stars = 4;
  return { stars: stars, deductions: deductions };
}

// ── Audit QA-8 fix (R8): completion-report focus areas derived from the
// student's ACTUAL run evidence (quiz misses, re-attempted objectives, hint
// usage, per-pillar re-work load) — never generic filler.
function computeFocusAreas(s, questions) {
  const mode = s.mode || 'medium';
  const ids = OBJECTIVE_ORDER[mode];
  const areas = [];

  const missed = questions.filter(function (q) { return s.quiz.answers[q.id] !== undefined && s.quiz.answers[q.id] !== q.answer; });
  for (const q of missed) {
    const topic = QUIZ_TOPICS[q.id] || ('\u201c' + q.prompt.slice(0, 48) + '\u2026\u201d');
    areas.push('Quality audit miss: review ' + topic + '.');
  }

  const redo = ids.filter(function (id) { return (s.objectives[id] ? s.objectives[id].attempts : 0) > 1; });
  for (const id of redo) {
    const a = s.objectives[id];
    areas.push(id + ' needed ' + a.attempts + ' checks \u2014 re-run \u201c' + OBJECTIVES[id].title + '\u201d once more and read the feedback panel.');
  }

  const hinted = ids.filter(function (id) { return (s.objectives[id] ? s.objectives[id].hints : 0) > 0; });
  if (hinted.length > 0) {
    areas.push('Hints used on ' + hinted.join(', ') + ' \u2014 drill ' + (hinted.length === 1 ? 'that step' : 'those steps') + ' until the nudge is unnecessary.');
  }

  const load = { P1: 0, P2: 0, P3: 0, P4: 0 };
  for (const id of ids) {
    const o = s.objectives[id];
    if (!o) continue;
    load[OBJECTIVES[id].pillar] += Math.max(0, o.attempts - 1) + o.hints;
  }
  const entries = Object.keys(load).map(function (k) { return [k, load[k]]; });
  entries.sort(function (a, b) { return b[1] - a[1]; });
  const worst = entries[0];
  if (worst && worst[1] > 0) {
    areas.push('Pillar focus: ' + worst[0] + ' (' + PILLAR_LABEL[worst[0]] + ') absorbed the most re-work (' + worst[1] + ' extra check' + (worst[1] === 1 ? '' : 's') + '/hints) \u2014 start your next review there.');
  }

  return areas.slice(0, 5);
}

function quizScore(quiz, questions) {
  return questions.reduce(function (acc, q) { return acc + (quiz.answers[q.id] === q.answer ? 1 : 0); }, 0);
}
