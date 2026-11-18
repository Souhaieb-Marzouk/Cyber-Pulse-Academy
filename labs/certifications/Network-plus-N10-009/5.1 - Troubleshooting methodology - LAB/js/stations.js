// ── Fault Isolation Line — station workbenches (js/stations.js) ──
// The eight stop renderers, ported 1:1 from src/components/lab/stations.tsx.
// Each renderer returns an HTML string; all interactions are delegated.

function attOf(s, id) {
  return s.objectives[id] || { done: false, attempts: 0, firstTry: false, hints: 0 };
}
function forMode(list, mode) {
  return list.filter(function (x) { return mode === 'hard' ? true : !x.hardOnly; });
}

/* ══════════ STOP 00 — DISPATCH ══════════ */
function DispatchBoard(s, mode) {
  const stepsForOrder = s.dispatch.stepOrder.map(function (id) {
    let text = id;
    for (const st of STEPS) if (st.id === id) text = st.name;
    return { id: id, text: text };
  });

  let html = '<div class="stack-lg">';
  html += StationHeader('00', 'Dispatch Office', 'Case briefing & methodology orientation');

  // C1 — Scenario briefing
  html += '<section aria-label="Scenario briefing" class="brief-card">' +
    '<div class="hazard brief-stripe" aria-hidden="true"></div>' +
    '<div class="brief-body">' +
    '<p class="eyebrow">Training simulation \u00b7 all data synthetic \u00b7 fictional organization</p>' +
    '<h2 class="brief-title">Case MERID-0417 — Building C shipping wing, Northwind Logistics</h2>' +
    '<p class="brief-text">You are the on-call NOC technician for Northwind Logistics, a regional distribution company. At 07:38 the Building C shipping wing reports it cannot reach the label server — pallets are queuing at the pack stations. Everything in this lab is synthetic training data. Your job: walk ticket <span class="mono-bold">' + esc(CASE_ID) + '</span> through all seven stops of the Fault Isolation Line and apply the CompTIA troubleshooting methodology from intake to documentation.</p>' +
    '<p class="callout-orange"><strong>Why this matters:</strong> Domain 5.0 Network Troubleshooting is the heaviest-weighted domain of the N10-009 exam (24%), and objective 5.1 — this methodology — is the process backbone every troubleshooting scenario assumes.</p>' +
    '</div></section>';

  // C2 — Knowledge core
  html += '<section aria-label="Knowledge core: the seven steps" class="stack-sm">';
  html += '<h3 class="section-h">The seven stops — what each step produces</h3>';
  html += '<div class="grid grid-4">';
  STEPS.forEach(function (st) {
    html += '<article class="step-card">' +
      '<p class="eyebrow">' + esc(st.short) + '</p>' +
      '<h4 class="step-name">' + esc(st.name) + '</h4>' +
      '<ul class="step-subs">' + st.subs.map(function (sub) { return '<li>\u00b7 ' + esc(sub) + '</li>'; }).join('') + '</ul>' +
      '<p class="step-why">' + esc(st.why) + '</p>' +
      '</article>';
  });
  html += '</div>';
  html += '<div class="approach-note"><strong>Layered approaches (Step 2):</strong> <em>top-down</em> starts at the application — best for one user, app-only symptoms. <em>Bottom-up</em> starts at the physical layer — best after physical work or for many affected users. <em> Divide and conquer</em> tests a middle layer first — fastest when the midpoint is informative. And step 3 has an explicit loop: theory not confirmed \u2192 establish a <strong>new theory or escalate</strong>.</div>';
  html += '</section>';

  // Drills (Medium) / hard note
  if (mode === 'medium') {
    html += '<div class="stack-lg">';
    html += TaskCard(OBJECTIVES.M1, attOf(s, 'M1'), s.results['M1'], mode, 'M1',
      '<p class="task-prompt">Sequence the line: use \u25b2\u25bc to put the seven steps in canonical order. The rail above will fill as the case moves.</p>' +
      OrderList(stepsForOrder, '{"type":"MOVE_STEP","id":":id","dir"::dir}', 'Methodology step order drill', 'm1'));
    html += TaskCard(OBJECTIVES.M2, attOf(s, 'M2'), s.results['M2'], mode, 'M2',
      '<p class="task-prompt">Assign each sub-task to the stop (step number) where it belongs.</p>' +
      '<div class="grid gap-2">' +
      SUBSTEP_CHIPS.map(function (c) {
        return '<div class="submatch-row">' +
          '<span class="submatch-text">' + esc(c.text) + '</span>' +
          '<select aria-label="Assign sub-task: ' + esc(c.text) + '"' +
          ' data-act-change="' + actAttr('{"type":"SET_SUBMATCH","id":"' + c.id + '","value":":value"}') + '"' +
          ' data-fk="submatch-' + c.id + '" class="select select-inline">' +
          '<option value="">\u2014 stop \u2014</option>' +
          STEPS.map(function (st) { return '<option value="' + st.id + '"' + ((s.dispatch.subMatches[c.id] || '') === st.id ? ' selected' : '') + '>' + st.id + '</option>'; }).join('') +
          '</select></div>';
      }).join('') +
      '</div>');
    html += '</div>';
  } else {
    html += '<p class="hard-note"><strong>Hard mode:</strong> the seven stops above are your only map — the line expects you already know the order. Evidence is noisier, validation is stricter, and hints are off. Good luck, tech.</p>';
  }
  html += '</div>';
  return html;
}

/* ══════════ STOP 01 — INTAKE ══════════ */
function IntakeStop(s, mode) {
  const chats = forMode(CHATS, mode);
  const tiles = forMode(MONITOR_TILES, mode);
  const changes = forMode(CHANGE_LOG, mode);
  const facts = forMode(FACTS, mode);
  const triage = forMode(TRIAGE, mode);

  let html = '<div class="stack-lg">';
  html += StationHeader('01', 'Intake', 'Step 1 — Identify the problem', 'Methodology Step 1 of 7');

  html += '<div class="grid grid-2">';
  html += Panel('Ticket MERID-0417 \u00b7 P2 \u00b7 opened 07:38',
    '<p class="panel-text">\u201cShipping can\u2019t print labels. Maybe the whole network is down? People are also saying weird stuff.\u201d — P. Nair, floor supervisor</p>' +
    '<p class="panel-meta">Impact: Building C pack stations \u00b7 requester available by chat</p>');

  html += Panel('Reproduce bench — duplicate the problem, if possible',
    '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'RUN_DUPLICATE' })) + '" data-fk="dup-bench"' + (s.intake.duplicated ? ' disabled' : '') +
    ' class="btn btn-white">' + (s.intake.duplicated ? '\u2713 Failure duplicated' : 'Duplicate from CLIENT-SHIP-03') + '</button>' +
    '<div class="mt-3">' + Terminal(s.intake.duplicated ? DUPLICATE_OUTPUT : [], 'reproduce bench') + '</div>');

  // User interviews
  let chatHtml = '<div class="stack-sm">';
  chats.forEach(function (c) {
    // Marker reflects STATE (once a chat was opened it stays ☑ — original
    // semantics: rendered from s.intake.chats); the open ATTRIBUTE mirrors the
    // uncontrolled <details> DOM state (chatOpenUI, resets on reload).
    const everOpened = s.intake.chats.indexOf(c.id) !== -1;
    const uiOpen = chatIsOpen(c.id);
    chatHtml += '<details class="chat" data-chat-id="' + esc(c.id) + '"' + (uiOpen ? ' open' : '') + '>' +
      '<summary class="chat-summary"><span class="chat-marker" data-chat-marker="' + esc(c.id) + '">' + (everOpened ? '\u2611' : '\u2610') + '</span> ' + esc(c.name) +
      ' <span class="chat-role">\u00b7 ' + esc(c.role) + '</span></summary>' +
      '<div class="chat-lines">' +
      c.lines.map(function (l) {
        return '<p class="bubble ' + (l.from === 'you' ? 'bubble-you' : 'bubble-user') + '">' + esc(l.text) + '</p>';
      }).join('') +
      '</div></details>';
  });
  chatHtml += '</div>';
  html += Panel('User interviews — question users', chatHtml);

  // NOC feed
  let tileHtml = '<div class="stack-sm">';
  tiles.forEach(function (t) {
    const tone = t.status === 'crit' ? 'tile-crit' : t.status === 'warn' ? 'tile-warn' : 'tile-ok';
    tileHtml += '<div class="tile ' + tone + '">' +
      '<span aria-hidden="true" class="tile-dot" style="background:' + (t.status === 'crit' ? '#C92A2A' : t.status === 'warn' ? '#E8890C' : '#2B8A3E') + '"></span>' +
      '<span class="tile-device">' + esc(t.device) + '</span>' +
      '<span class="tile-line">' + esc(t.line) + '</span>' +
      '</div>';
  });
  tileHtml += '</div>';
  html += Panel('NOC monitoring feed', tileHtml);

  // Change log
  let chgHtml = RadioRow('Relevant change', changes.map(function (c) { return { id: c.id, text: c.id + ' — ' + c.scope }; }), s.intake.changeId, '{"type":"SET_CHANGE","id":":id"}', true);
  chgHtml += '<div class="stack-sm mt-3">';
  changes.forEach(function (c) {
    chgHtml += '<div class="chg-entry"><span class="mono-bold">' + esc(c.id) + '</span> \u00b7 ' + esc(c.window) + ' — ' + esc(c.desc) +
      '<span class="chg-status">status: ' + esc(c.status) + '</span></div>';
  });
  chgHtml += '</div>';
  html += Panel('Last night\u2019s change log — determine if anything has changed', chgHtml);
  html += '</div>'; // grid

  if (mode === 'medium') {
    html += TaskCard(OBJECTIVES.M3, attOf(s, 'M3'), s.results['M3'], mode, 'M3',
      '<p class="task-prompt">Build the problem statement: select every <strong>in-scope, confirmed</strong> fact for MERID-0417. Question the users and duplicate the failure first — the statement needs them.</p>' +
      ChipGroup(facts, s.intake.facts, '{"type":"TOGGLE_FACT","id":":id"}'));
    html += TaskCard(OBJECTIVES.M4, attOf(s, 'M4'), s.results['M4'], mode, 'M4',
      '<p class="task-prompt">Pick the relevant change in the change-log panel above (the radio row), then check.</p>');
    html += TaskCard(OBJECTIVES.M5, attOf(s, 'M5'), s.results['M5'], mode, 'M5',
      '<p class="task-prompt">Route every incoming report: does it belong to THIS ticket, become a SEPARATE ticket, or leave the network queue entirely?</p>' +
      triageHtml(triage, s, mode));
  } else {
    html += TaskCard(OBJECTIVES.H1, attOf(s, 'H1'), s.results['H1'], mode, 'H1',
      '<p class="task-prompt">The feed is noisy. Produce a clean intake: select ONLY the confirmed, in-scope facts (red herrings must stay out), open every interview, duplicate the failure, and route ALL reports below.</p>' +
      ChipGroup(facts, s.intake.facts, '{"type":"TOGGLE_FACT","id":":id"}') +
      '<div class="mt-4">' + triageHtml(triage, s, mode) + '</div>');
    html += TaskCard(OBJECTIVES.H2, attOf(s, 'H2'), s.results['H2'], mode, 'H2',
      '<p class="task-prompt">Correlate the change log (radio row above): which single change matters for this failure?</p>');
  }
  html += '</div>';
  return html;
}

function triageHtml(triage, s, mode) {
  let html = '<div class="stack-sm">';
  triage.forEach(function (t) {
    html += '<div class="triage-card"><p class="triage-text">' + esc(t.text) + '</p>' +
      '<div class="mt-2">' +
      RadioRow('Route: ' + t.text, [
        { id: 'this', text: 'This ticket' },
        { id: 'separate', text: 'Separate ticket' },
        { id: 'not-network', text: 'Not a network problem' },
      ], s.intake.triage[t.id] || null, '{"type":"SET_TRIAGE","id":"' + t.id + '","value":":id"}', false) +
      '</div></div>';
  });
  html += '</div>';
  return html;
}

/* ══════════ STOP 02 — THEORY ══════════ */
function TheoryStop(s, mode) {
  let html = '<div class="stack-lg">';
  html += StationHeader('02', 'Theory Whiteboard', 'Step 2 — Establish a theory of probable cause', 'Methodology Step 2 of 7');

  html += '<div class="grid grid-2">';
  html += Panel('Question the obvious — first pass',
    ChipGroup(OBVIOUS_OPTIONS, s.theory.obvious, '{"type":"TOGGLE_OBVIOUS","id":":id"}') +
    '<p class="panel-meta">Select every obvious question worth asking FIRST. The obvious is obvious surprisingly often.</p>');
  html += Panel('Cause board — commit ONE probable cause',
    RadioRow('Probable cause', CAUSES, s.theory.causeId, '{"type":"SET_CAUSE","id":":id"}', true));
  let approachHtml = RadioRow('OSI approach', APPROACHES.map(function (a) { return { id: a.id, text: a.text }; }), s.theory.approach, '{"type":"SET_APPROACH","id":":id"}', true);
  if (s.theory.approach) {
    let blurb = '';
    APPROACHES.forEach(function (a) { if (a.id === s.theory.approach) blurb = a.blurb; });
    approachHtml += '<p class="panel-meta em">' + esc(blurb) + '</p>';
  }
  html += Panel('Layered approach — pick the strategy for THIS incident', approachHtml);
  if (mode === 'hard') {
    html += Panel('Probe plan — order least \u2192 most intrusive',
      OrderList(s.theory.probeOrder.map(function (id) {
        let text = id;
        PROBE_ORDER_ITEMS.forEach(function (p) { if (p.id === id) text = p.text; });
        return { id: id, text: text };
      }), '{"type":"MOVE_PROBE_ORDER","id":":id","dir"::dir}', 'Probe plan order', 'po'));
  }
  html += '</div>'; // grid

  // Approach drill
  let drillHtml = '<div class="grid grid-3">';
  MINI_CASES.forEach(function (m) {
    drillHtml += '<div class="mini-case"><p class="mini-text">' + esc(m.text) + '</p>' +
      '<div class="mt-2">' +
      RadioRow('Approach: ' + m.id, APPROACHES.map(function (a) { return { id: a.id, text: a.text }; }), s.theory.minis[m.id] || null, '{"type":"SET_MINI","id":"' + m.id + '","value":":id"}', true) +
      '</div></div>';
  });
  drillHtml += '</div>';
  html += Panel('Approach drill — top-down / bottom-up / divide and conquer', drillHtml);

  if (mode === 'medium') {
    html += TaskCard(OBJECTIVES.M6, attOf(s, 'M6'), s.results['M6'], mode, 'M6',
      '<p class="task-prompt">Commit on the boards above: obvious questions, probable cause, and the layered approach for MERID-0417.</p>');
    html += TaskCard(OBJECTIVES.M7, attOf(s, 'M7'), s.results['M7'], mode, 'M7',
      '<p class="task-prompt">Pick the best approach for each of the three mini-cases in the drill panel.</p>');
  } else {
    html += TaskCard(OBJECTIVES.H3, attOf(s, 'H3'), s.results['H3'], mode, 'H3',
      '<p class="task-prompt">Commit all three boards: obvious checks, probable cause, approach. No partial credit.</p>');
    html += TaskCard(OBJECTIVES.H4, attOf(s, 'H4'), s.results['H4'], mode, 'H4',
      '<p class="task-prompt">Strategy: the approach (board above) AND the probe plan ordered least \u2192 most intrusive.</p>');
  }
  html += '</div>';
  return html;
}

/* ══════════ STOP 03 — TEST BENCH ══════════ */
function TestStop(s, mode) {
  const probes = forMode(PROBES, mode);
  const termLines = s.test.probes.reduce(function (acc, pid) {
    let p = null;
    PROBES.forEach(function (x) { if (x.id === pid) p = x; });
    if (!p) return acc;
    return acc.concat(['$ ' + p.cmd], p.output, ['']);
  }, []);
  let causeLabel = 'none committed';
  CAUSES.forEach(function (c) { if (c.id === s.theory.causeId) causeLabel = c.text; });

  let html = '<div class="stack-lg">';
  html += StationHeader('03', 'Test Bench', 'Step 3 — Test the theory to determine the cause', 'Methodology Step 3 of 7');

  html += '<div class="grid grid-5">';
  html += '<div class="stack-sm col-2">';
  html += Panel('Committed theory under test',
    '<p class="theory-line">' + esc(causeLabel) + (s.test.discarded ? '<span class="discarded-badge">DISCARDED</span>' : '') + '</p>');
  let probeHtml = '<div class="grid gap-2">';
  probes.forEach(function (p) {
    const run = s.test.probes.indexOf(p.id) !== -1;
    probeHtml += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'RUN_PROBE', id: p.id })) + '" data-fk="probe-' + p.id + '"' +
      (run ? ' disabled' : '') + ' aria-label="Run probe: ' + esc(p.label) + '"' +
      ' class="run-btn' + (run ? ' is-done' : '') + '">' +
      '<span aria-hidden="true" class="run-mark">' + (run ? '\u2713' : '\u25b8') + '</span>' + esc(p.label) + '</button>';
  });
  probeHtml += '</div>';
  html += Panel('Probes — run what you need (each deletes a suspect)', probeHtml);
  html += '</div>';

  html += '<div class="stack-sm col-3">';
  html += Terminal(termLines, 'test bench — live output');
  html += Panel('Verdict', RadioRow('Verdict', [
    { id: 'confirmed', text: 'Theory CONFIRMED — cause identified' },
    { id: 'not-confirmed', text: 'Theory NOT confirmed' },
  ], s.test.verdict, '{"type":"SET_VERDICT","value":":id"}', true));
  if (s.test.verdict === 'confirmed') {
    html += Panel('Branch — theory confirmed',
      RadioRow('Branch (confirmed)', BRANCH_CONFIRMED.map(function (b) { return { id: b.id, text: b.text }; }), s.test.branch, '{"type":"SET_BRANCH","value":":id"}', true));
  }
  if (s.test.verdict === 'not-confirmed') {
    let branchHtml = RadioRow('Branch (not confirmed)', BRANCH_NOTCONFIRMED.map(function (b) { return { id: b.id, text: b.text }; }), s.test.branch, '{"type":"SET_BRANCH","value":":id"}', true);
    if (s.test.branch === 'new-theory') {
      branchHtml += '<div class="retheorize">' +
        '<p class="panel-text">Re-establish: which cause do ALL results actually support?</p>' +
        RadioRow('New probable cause', CAUSES, s.test.newCause, '{"type":"SET_NEW_CAUSE","id":":id"}', true) +
        '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'ADOPT_NEW_THEORY' })) + '" data-fk="adopt-theory" class="btn btn-ink mt-2">Discard old theory &amp; adopt new one</button>' +
        '</div>';
    }
    html += Panel('Branch — theory not confirmed', branchHtml);
  }
  html += '</div>';
  html += '</div>'; // grid-5

  html += mode === 'medium'
    ? TaskCard(OBJECTIVES.M8, attOf(s, 'M8'), s.results['M8'], mode, 'M8',
      '<p class="task-prompt">Run a sufficient probe set, set the verdict, and take the branch. If your committed theory dies on the bench, handle it the Step 3 way.</p>')
    : TaskCard(OBJECTIVES.H5, attOf(s, 'H5'), s.results['H5'], mode, 'H5',
      '<p class="task-prompt">Full battery, formal theory handling (discard \u2192 re-establish if disproven), final verdict + branch.</p>');
  html += '</div>';
  return html;
}

/* ══════════ STOP 04 — PLAN BOARD ══════════ */
function PlanStop(s, mode) {
  const effects = forMode(PLAN_EFFECTS, mode);
  let html = '<div class="stack-lg">';
  html += StationHeader('04', 'Plan Board', 'Step 4 — Plan of action & potential effects', 'Methodology Step 4 of 7');
  html += '<div class="grid grid-2">';
  html += Panel('Plan of action — order it',
    OrderList(s.plan.order.map(function (id) {
      let text = id;
      PLAN_ITEMS.forEach(function (p) { if (p.id === id) text = p.text; });
      return { id: id, text: text };
    }), '{"type":"MOVE_PLAN","id":":id","dir"::dir}', 'Plan of action order', 'plan'));
  html += Panel('Potential effects — flag everything users or teams will feel',
    ChipGroup(effects, s.plan.effects, '{"type":"TOGGLE_EFFECT","id":":id"}'));
  html += '</div>';
  html += mode === 'medium'
    ? TaskCard(OBJECTIVES.M9, attOf(s, 'M9'), s.results['M9'], mode, 'M9',
      '<p class="task-prompt">Order the plan above and select every real potential effect.</p>')
    : TaskCard(OBJECTIVES.H7, attOf(s, 'H7'), s.results['H7'], mode, 'H7',
      '<p class="task-prompt">Exact order, exact effect set — including the fallback contingency.</p>');
  html += '</div>';
  return html;
}

/* ══════════ STOP 05 — CHANGE WINDOW ══════════ */
function ImplementStop(s, mode) {
  const actionLog = s.implement.actions.map(function (id, i) {
    let text = id;
    IMPLEMENT_ACTIONS.forEach(function (a) { if (a.id === id) text = a.text; });
    return (i + 1) + '. ' + text;
  });

  let gateHtml = RadioRow('Decision', [
    { id: 'implement', text: 'Implement the solution' },
    { id: 'escalate', text: 'Escalate as necessary' },
  ], s.implement.decision, '{"type":"SET_DECISION","value":":id"}', true);
  if (s.implement.decision === 'escalate') {
    gateHtml += '<div class="escalate-callout">' + ESCALATE_INFO.map(function (t) { return '<p class="mb-1">' + esc(t) + '</p>'; }).join('') + '</div>';
  }
  if (mode === 'hard' && s.implement.decision === 'implement') {
    gateHtml += '<div class="mt-3"><p class="task-prompt mb-2">Justify the call — select every valid ground:</p>' +
      ChipGroup(IMPLEMENT_REASONS, s.implement.reasons, '{"type":"TOGGLE_REASON","id":":id"}') + '</div>';
  }

  let execHtml = '<div class="grid grid-2">';
  IMPLEMENT_ACTIONS.forEach(function (a) {
    execHtml += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'DO_ACTION', id: a.id })) + '" data-fk="act-' + a.id + '"' +
      ' aria-label="Action: ' + esc(a.text) + '" class="exec-btn">' + esc(a.text) + '</button>';
  });
  execHtml += '</div>';
  execHtml += '<div class="exec-bar"><p class="exec-label">executed sequence</p><div class="exec-btns">';
  if (mode === 'hard') {
    execHtml += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'ABORT_WINDOW' })) + '" data-fk="abort-window"' +
      (s.implement.actions.length === 0 && s.implement.mistakes.length === 0 ? ' disabled' : '') +
      ' aria-label="Abort and restart the change window (mistakes cleared, attempt already recorded)" class="btn btn-amber btn-sm">\u27f2 Abort &amp; restart window</button>';
  }
  execHtml += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'UNDO_ACTION' })) + '" data-fk="undo-action"' +
    (s.implement.actions.length === 0 ? ' disabled' : '') + ' class="btn btn-white btn-sm">\u21a9 Undo last</button>';
  execHtml += '</div></div>';
  execHtml += '<div class="mt-1">' + Terminal(actionLog, 'action log') + '</div>';

  let html = '<div class="stack-lg">';
  html += StationHeader('05', 'Change Window', 'Step 5 — Implement the solution or escalate as necessary', 'Methodology Step 5 of 7');
  html += '<div class="grid grid-2">';
  html += Panel('Decision gate — implement or escalate?', gateHtml);
  html += Panel('Executor — click actions in the order you would do them', execHtml);
  html += '</div>';
  html += mode === 'medium'
    ? TaskCard(OBJECTIVES.M10, attOf(s, 'M10'), s.results['M10'], mode, 'M10',
      '<p class="task-prompt">Make the gate decision, then execute the plan in the executor panel (undo is allowed).</p>')
    : TaskCard(OBJECTIVES.H6, attOf(s, 'H6'), s.results['H6'], mode, 'H6',
      '<p class="task-prompt">Gate decision + full justification (panel above).</p>') +
      TaskCard(OBJECTIVES.H8, attOf(s, 'H8'), s.results['H8'], mode, 'H8',
      '<p class="task-prompt">Execute flawlessly. Wrong-device actions are recorded permanently within the window — undo will not save you. If the window is compromised, use Abort &amp; restart: the failed attempt stays in your record and costs stars, but you get a clean bench.</p>');
  html += '</div>';
  return html;
}

/* ══════════ STOP 06 — VERIFICATION DECK ══════════ */
function VerifyStop(s, mode) {
  const results = s.verify.checks.reduce(function (acc, id) {
    let v = null;
    VERIFY_CHECKS.forEach(function (x) { if (x.id === id) v = x; });
    return v ? acc.concat(['$ ' + v.label], [v.output], ['']) : acc;
  }, []);

  let batteryHtml = '<div class="grid gap-2">';
  VERIFY_CHECKS.forEach(function (v) {
    const run = s.verify.checks.indexOf(v.id) !== -1;
    batteryHtml += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'RUN_VERIFY', id: v.id })) + '" data-fk="verify-' + v.id + '"' +
      (run ? ' disabled' : '') + ' aria-label="Run check: ' + esc(v.label) + '"' +
      ' class="run-btn' + (run ? ' is-done' : '') + '">' +
      '<span aria-hidden="true" class="run-mark">' + (run ? '\u2713' : '\u25b8') + '</span>' + esc(v.label) + '</button>';
  });
  batteryHtml += '</div>';
  batteryHtml += '<div class="mt-3">' + Terminal(results, 'verification results') + '</div>';

  let preventiveHtml = ChipGroup(PREVENTIVE, s.verify.preventive, '{"type":"TOGGLE_PREVENTIVE","id":":id"}') +
    '<p class="panel-meta">\u201cIf applicable\u201d — this failure was avoidable and had already recurred once, so prevention is mandatory, not optional.</p>';

  let html = '<div class="stack-lg">';
  html += StationHeader('06', 'Verification Deck', 'Step 6 — Verify full functionality & prevent recurrence', 'Methodology Step 6 of 7');
  html += '<div class="grid grid-2">';
  html += Panel('Verification battery — prove it on every channel', batteryHtml);
  html += Panel('Preventive measures — if applicable (here: applicable)', preventiveHtml);
  html += '</div>';
  html += mode === 'medium'
    ? TaskCard(OBJECTIVES.M11, attOf(s, 'M11'), s.results['M11'], mode, 'M11',
      '<p class="task-prompt">Run the battery and select the preventive set.</p>')
    : TaskCard(OBJECTIVES.H9, attOf(s, 'H9'), s.results['H9'], mode, 'H9',
      '<p class="task-prompt">Full battery — every channel the users touched — plus the exact preventive set.</p>');
  html += '</div>';
  return html;
}

/* ══════════ STOP 07 — KB DESK ══════════ */
function DocumentStop(s, mode) {
  const d = s.doc;
  const sel = function (labelText, ariaLabel, field, options) {
    return '<label class="doc-label">' + esc(labelText) +
      '<select aria-label="' + esc(ariaLabel) + '" data-act-change="' + actAttr('{"type":"SET_DOC","field":"' + field + '","value":":value"}') + '"' +
      ' data-fk="doc-' + field + '" class="select select-block mt-1">' +
      options.map(function (v) { return '<option value="' + esc(v) + '"' + (d[field] === v ? ' selected' : '') + '>' + esc(v) + '</option>'; }).join('') +
      '</select></label>';
  };

  let findingsHtml = '<div class="stack-sm">';
  findingsHtml += sel('Device', 'Findings: device', 'device', DOC_DEVICES);
  findingsHtml += sel('Port / interface', 'Findings: port', 'port', DOC_PORTS);
  findingsHtml += sel('Root cause', 'Findings: root cause', 'cause', DOC_CAUSES);
  findingsHtml += '<label class="doc-label">Linked change ID' +
    '<input aria-label="Findings: change ID" data-doc-input data-fk="doc-changeId" class="select select-block mt-1" value="' + esc(d.changeId) + '" placeholder="CHG-XXXX">' +
    '</label>';
  findingsHtml += '</div>';

  let sideHtml = Panel('Actions taken — only what actually happened',
    ChipGroup(DOC_ACTIONS, d.actions, '{"type":"TOGGLE_DOC_ACTION","id":":id"}'));
  sideHtml += Panel('Outcome', RadioRow('Outcome', DOC_OUTCOMES.slice(1).map(function (o) { return { id: o, text: o }; }), d.outcome, '{"type":"SET_DOC","field":"outcome","value":":id"}', true));
  sideHtml += Panel('Lessons learned — change future behavior',
    ChipGroup(DOC_LESSONS, d.lessons, '{"type":"TOGGLE_LESSON","id":":id"}'));
  sideHtml += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'CLOSE_TICKET' })) + '" data-fk="close-ticket"' + (d.closed ? ' disabled' : '') +
    ' class="btn btn-green btn-block">' + (d.closed ? '\u2713 Ticket MERID-0417 closed' : 'Close ticket MERID-0417') + '</button>';

  let html = '<div class="stack-lg">';
  html += StationHeader('07', 'KB Desk', 'Step 7 — Document findings, actions, outcomes, lessons', 'Methodology Step 7 of 7');
  html += '<div class="grid grid-2">';
  html += Panel('Findings — what broke, where, why', findingsHtml);
  html += '<div class="stack-lg">' + sideHtml + '</div>';
  html += '</div>';
  html += mode === 'medium'
    ? TaskCard(OBJECTIVES.M12, attOf(s, 'M12'), s.results['M12'], mode, 'M12',
      '<p class="task-prompt">Complete the record above, then close the ticket.</p>')
    : TaskCard(OBJECTIVES.H10, attOf(s, 'H10'), s.results['H10'], mode, 'H10',
      '<p class="task-prompt">An audit-ready close-out: findings, real actions only, outcome, real lessons — then close.</p>');
  html += '</div>';
  return html;
}
