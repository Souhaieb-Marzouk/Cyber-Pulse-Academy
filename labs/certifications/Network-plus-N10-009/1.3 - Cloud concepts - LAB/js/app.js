// ── LZ-MERIDIAN static · app.js (part 2: review/handover views, dialogs, controller) ──
// Ports LabShell.tsx (phase machine + header wiring), QuizPanel.tsx, ClearedModal.tsx,
// HandoverPack.tsx and GlossaryDrawer.tsx. All student-facing wording is 1:1.
'use strict';

/* ── Global lab state (S) + UI-only state (UI) ──────────────────────────── */
var S = null;
var UI = null;

/* Quiz topic → the Ground School unit that teaches it (ClearedModal R8 pointer). */
var TOPIC_UNIT = {
  'Deployment models': 'Ground School Unit 1 (deployment models)',
  'IaaS shared responsibility': 'Ground School Unit 2 (responsibility stack)',
  'NAT gateway egress': 'Ground School Unit 5 (gateways & connectivity)',
  'Stateful NSGs': 'Ground School Unit 4 (VPC, subnets & screening)',
  'NFV': 'Ground School Unit 3 (network function virtualization)',
  'VPN vs Direct Connect': 'Ground School Unit 5 (gateways & connectivity)',
  'NSG first-match evaluation': 'Ground School Unit 4 (VPC, subnets & screening)',
  'Stateless security lists': 'Ground School Unit 4 (VPC, subnets & screening)',
  'Public-subnet exposure': 'Ground School Unit 4 (VPC, subnets & screening)',
  'Commissioning order': 'Ground School Units 4–5 (VPC & gateways)',
  'Transit gateway': 'Ground School Unit 5 (gateways & connectivity)',
  'Hybrid cloud': 'Ground School Unit 1 (deployment models)',
  'NFV concentration risk': 'Ground School Unit 3 (network function virtualization)',
};

/* ── F-18 · Certification review (QuizPanel.tsx) ──────────────────────────
   Flow per item: pick → CONFIRM ANSWER (validating press) → choice locks,
   only the picked option is highlighted (green/red), NEXT QUESTION is
   mandatory. Reload resumes at the first unanswered question. */
function quizItems() { return QUIZ.filter(function (q) { return q.mode === S.mode; }); }

function viewQuiz() {
  var items = quizItems();
  var submitted = S.quiz.submitted;
  if (!UI.quiz.started) {
    return '<div class="wrap">' +
      secTitle('Section 04 · Certification review',
        S.mode === 'medium' ? 'Six concepts, explained as you go' : 'Seven scenarios — justify every call',
        'clipboard-check') +
      '<section class="card" style="margin-top:1.5rem;"><div class="card-pad">' +
        '<p>' + (S.mode === 'medium'
          ? 'Concept questions in the exam’s own style. Pick an answer, confirm it, and the explanation appears immediately — the explanation is the point, not the score.'
          : 'Scenario questions: triage the artifact, pick the call, own the reasoning. Explanations appear after you confirm each answer.') + '</p>' +
        '<p class="quiz-note" style="margin-top:0.75rem;font-size:0.875rem;">' + items.length +
          ' questions · one attempt each · answers lock once confirmed · counts 35% of your final score.</p>' +
        '<div style="margin-top:0.75rem;"><button type="button" class="btn btn-lg btn-dark" data-act="quiz-start">Begin the review</button></div>' +
      '</div></section></div>';
  }

  var firstUnanswered = -1;
  for (var i = 0; i < items.length; i++) { if (!S.quiz.answers[items[i].id]) { firstUnanswered = i; break; } }
  var allAnswered = firstUnanswered === -1;

  /* All items confirmed → submission card */
  if (allAnswered) {
    return '<div class="wrap">' +
      secTitle('Section 04 · Certification review', 'Ready to file', 'clipboard-check') +
      '<section class="card" style="margin-top:1.5rem;"><div class="card-pad clearance-card">' +
        '<p style="font-size:0.875rem;color:var(--muted-fg);">' + (submitted
          ? 'Submitted · scored ' + S.quiz.correct + '/' + items.length + '. Your clearance record is open.'
          : 'All ' + items.length + ' answers are locked in. Submitting scores the review — it counts toward clearance.') + '</p>' +
        '<button type="button" class="btn btn-lg btn-teal" data-act="quiz-submit"' + (submitted ? ' disabled' : '') + '>' +
          (submitted ? 'Submitted ✓' : 'Submit review') + '</button>' +
      '</div></section></div>';
  }

  /* One question at a time */
  var current = UI.quiz.override !== null && UI.quiz.override !== undefined ? UI.quiz.override : Math.max(0, firstUnanswered);
  var item = items[current];
  var picked = S.quiz.answers[item.id] || UI.quiz.draft || null;
  var confirmed = !!S.quiz.answers[item.id];
  var answeredCount = items.filter(function (q) { return S.quiz.answers[q.id]; }).length;
  var pickedIsCorrect = confirmed && S.quiz.answers[item.id] === item.answerKey;

  var dots = items.map(function (q, di) {
    return '<span class="' + (di < current ? 'done' : di === current ? 'cur' : '') + '"></span>';
  }).join('');
  var options = item.options.map(function (o, oi) {
    var isPicked = picked === o.key;
    var showGreen = confirmed && isPicked && pickedIsCorrect;
    var showRed = confirmed && isPicked && !pickedIsCorrect;
    var cls = 'quiz-option' + (isPicked && !confirmed ? ' picked' : '') +
      (showGreen ? ' correct' : '') + (showRed ? ' wrong' : '') +
      (confirmed && !isPicked ? ' locked-dim' : '');
    var mark = showGreen ? ic('check', 'sz-16') : showRed ? ic('x', 'sz-16')
      : '<span class="key">' + String.fromCharCode(97 + oi) + '</span>';
    return '<button type="button" role="radio" aria-checked="' + (isPicked ? 'true' : 'false') + '"' +
      (confirmed ? ' disabled' : '') + ' class="' + cls + '" data-act="quiz-pick" data-key="' + esc(o.key) + '">' +
      mark + '<span>' + esc(o.label) + '</span></button>';
  }).join('');

  var feedback = confirmed
    ? '<div aria-live="polite" class="fb ' + (pickedIsCorrect ? 'ok' : 'no') + '">' +
        '<p class="t">' + (pickedIsCorrect ? 'Correct.' : 'Not quite.') + '</p>' +
        '<p class="b">' + esc(item.explanation) + '</p></div>'
    : '<p class="quiz-note">Confirm to lock your answer — choices cannot be changed after confirming.</p>';

  var action = confirmed
    ? '<button type="button" class="btn btn-lg btn-dark" data-act="quiz-next">' +
        (current + 1 < items.length ? 'Next question' : 'Review submission') + ' ' + ic('arrow-right', 'sz-16') + '</button>'
    : '<button type="button" class="btn btn-lg btn-teal" data-act="quiz-confirm"' + (!UI.quiz.draft ? ' disabled' : '') + '>Confirm answer</button>';

  return '<div class="wrap">' +
    secTitle('Section 04 · Certification review', 'Answer, confirm, read, continue', 'clipboard-check') +
    '<div class="quiz-meta" aria-live="polite" style="margin-top:1.25rem;">' +
      '<span class="badge badge-outline lz-mono" style="font-size:0.625rem;">Q' + (current + 1) + ' / ' + items.length + '</span>' +
      '<div class="quiz-dots" aria-hidden="true">' + dots + '</div>' +
      '<span class="quiz-locked">' + answeredCount + ' locked</span>' +
    '</div>' +
    '<section class="card" style="margin-top:1.25rem;"><div class="card-pad">' +
      '<p style="font-weight:500;line-height:1.35;">' + esc(item.prompt) + '</p>' +
      '<div role="group" aria-label="Question ' + (current + 1) + ' — choose one answer" style="margin-top:0.75rem;">' + options + '</div>' +
      '<div style="margin-top:0.75rem;">' + feedback + '</div>' +
      '<div class="btn-row" style="justify-content:flex-end;margin-top:1rem;">' + action + '</div>' +
    '</div></section></div>';
}

/* ── F-20 · Handover pack (HandoverPack.tsx) ────────────────────────────── */
function viewHandover() {
  var ready = allObjectivesDone(S) && S.quiz.submitted;
  var detections = DEBRIEF.detections.map(function (d) {
    return '<li><strong>' + esc(d.title) + '</strong>' +
      '<code class="detection-code lz-mono">' + esc(d.logic) + '</code></li>';
  }).join('');
  var mitigations = DEBRIEF.mitigations.map(function (m) {
    return '<li><span class="badge badge-outline lz-mono" style="font-size:0.625rem;border-color:rgba(194,65,12,0.5);color:var(--orange);margin-right:0.375rem;">' +
      esc(m.id) + '</span><strong>' + esc(m.label) + '</strong> — <span style="color:var(--muted-fg);">' + esc(m.how) + '</span></li>';
  }).join('');
  var blue = DEBRIEF.blue.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
  var red = DEBRIEF.red.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
  var links = DEBRIEF.links.map(function (l) {
    return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
      ic('external-link', 'sz-14') + ' ' + esc(l.label) + '</a></li>';
  }).join('');
  return '<div class="wrap" style="max-width:56rem;">' +
    secTitle('Section 05 · Handover pack', 'Field notes for the blue team — and the red mindset', 'handshake') +
    '<div class="handover-grid" style="margin-top:1.5rem;">' +
      '<section class="card card-teal"><div class="card-pad">' +
        '<p class="hv-cap teal">' + ic('radar', 'sz-16') + ' Detection playbook (data sources + example logic)</p>' +
        '<ul>' + detections + '</ul>' +
        '<p class="pillar-note">Simulated against VPC flow logs, NSG change events and config snapshots — the cloud equivalents of the classic N10-009 data sources.</p>' +
      '</div></section>' +
      '<section class="card card-orange"><div class="card-pad">' +
        '<p class="hv-cap orange">' + ic('shield-off', 'sz-16') + ' Mitigation recommendations (official IDs)</p>' +
        '<ul>' + mitigations + '</ul>' +
      '</div></section>' +
      '<section class="card"><div class="card-pad">' +
        '<p class="hv-cap teal">' + ic('users', 'sz-16') + ' Blue-team takeaways</p>' +
        '<ul style="list-style:disc;padding-left:1rem;">' + blue + '</ul>' +
      '</div></section>' +
      '<section class="card"><div class="card-pad">' +
        '<p class="hv-cap red">' + ic('sword', 'sz-16') + ' Red-team mindset (know the adversary)</p>' +
        '<ul style="list-style:disc;padding-left:1rem;">' + red + '</ul>' +
        '<p class="pillar-note">Defensive framing: knowing how exposure is found helps you remove it. Nothing here is offensive tooling.</p>' +
      '</div></section>' +
    '</div>' +
    '<section class="card" style="margin-top:1rem;"><div class="card-pad">' +
      '<p class="hv-cap ink">' + ic('file-check-2', 'sz-16') + ' Official references (open in a new tab)</p>' +
      '<ul class="links-grid" style="margin-top:0.5rem;">' + links + '</ul>' +
    '</div></section>' +
    '<section class="card' + (ready ? ' card-teal' : '') + '" style="margin-top:1rem;"><div class="card-pad clearance-card">' +
      '<div class="pad">' + (ready ? ic('check-circle-2', 'sz-20 teal-ico') : ic('circle', 'sz-20')) +
        '<p>' + (ready
          ? 'All objectives complete and review submitted — the tower is ready to clear you.'
          : 'Clearance requires all ' + (S.mode === 'medium' ? '12' : '9') + ' objectives complete and the review submitted. Current status: objectives ' +
            (allObjectivesDone(S) ? '✓' : '…') + ' · review ' + (S.quiz.submitted ? '✓' : '…') + '.') + '</p></div>' +
      '<button type="button" class="btn btn-lg btn-orange" data-act="file-clearance"' + (ready ? '' : ' disabled') + '>File for clearance</button>' +
    '</div></section>' +
    '<p style="display:flex;justify-content:center;margin-top:1.5rem;">' + trainingNote() + '</p>' +
  '</div>';
}

/* ── F-19 · Cleared modal (ClearedModal.tsx) ────────────────────────────── */
function starRow(n) {
  var out = '';
  for (var i = 1; i <= 5; i++) out += '<span class="' + (i <= n ? 'on' : 'off') + '">' + ic('star', 'sz-16') + '</span>';
  return out;
}

function clearedFocusAreas(mode) {
  var objs = objectivesFor(mode);
  var focus = [];
  for (var i = 0; i < objs.length; i++) {
    var o = objs[i];
    var st = S.objectives[o.id];
    if (!st) continue;
    if (!st.firstAttempt || st.hintsUsed > 0) {
      var bits = [];
      if (!st.firstAttempt) bits.push('needed ' + st.attempts + ' checks');
      if (st.hintsUsed > 0) bits.push('used ' + st.hintsUsed + ' hint' + (st.hintsUsed > 1 ? 's' : ''));
      focus.push({
        label: o.anchor,
        why: o.id + ' ' + bits.join(' and '),
        action: 'Re-fly ' + o.id + ' in the other mode without hints — the target state is described in the checklist brief.',
      });
    }
  }
  for (var j = 0; j < QUIZ.length; j++) {
    var q = QUIZ[j];
    if (q.mode !== mode) continue;
    if (S.quiz.answers[q.id] && S.quiz.answers[q.id] !== q.answerKey) {
      focus.push({
        label: q.topic,
        why: 'review answer was wrong (' + q.id + ')',
        action: 'Reread ' + (TOPIC_UNIT[q.topic] || 'the Ground School units') + ' and the ' + q.id +
          ' explanation, then re-test yourself in the other mode.',
      });
    }
  }
  return focus;
}

function viewClearedBody() {
  var mode = S.mode;
  var completion = S.completion;
  var objs = objectivesFor(mode);
  var quizTotal = quizItems().length;
  var pillars = ['P1', 'P2', 'P3', 'P4'];
  var focus = clearedFocusAreas(mode);

  var focusHtml;
  if (focus.length === 0) {
    focusHtml = '<p class="clean-run">Clean run: every objective on the first check, no hints, and a perfect review. Consolidate it by re-flying the other mode.</p>';
  } else {
    focusHtml = '<ul style="list-style:none;padding:0;">' + focus.map(function (f) {
      return '<li class="focus-item"><p class="t">' + esc(f.label) + '</p>' +
        '<p class="w">Evidence: ' + esc(f.why) + '.</p>' +
        '<p class="a"><strong>Do this:</strong> ' + esc(f.action) + '</p></li>';
    }).join('') + '</ul>';
  }

  var recap = pillars.map(function (p) {
    var items = objs.filter(function (o) { return o.pillar === p; });
    var done = items.filter(function (o) { return S.objectives[o.id] && S.objectives[o.id].done; }).length;
    var lis = items.map(function (o) {
      var ok = S.objectives[o.id] && S.objectives[o.id].done;
      var title = o.title.length > 72 ? o.title.slice(0, 72) + '…' : o.title;
      return '<li><span class="' + (ok ? 'mark-ok' : 'mark-no') + '">' + (ok ? '✓' : '✗') + '</span>' +
        '<span class="oid">' + esc(o.id) + '</span><span>' + esc(title) + '</span></li>';
    }).join('');
    return '<div class="pillar-recap"><p class="head">' +
      '<span class="badge badge-pillar ' + p.toLowerCase() + '">' + p + ' · ' + esc(PILLAR_META[p].label) + '</span>' +
      '<span class="n">' + done + '/' + items.length + '</span></p><ul>' + lis + '</ul></div>';
  }).join('');

  var nextLast = mode === 'medium'
    ? 'Other mode: the Type Rating (hard) adds red herrings and strict validation'
    : 'Other mode: the Line Check (medium) is a fast guided recap';

  return '<div class="dlg-head-row">' +
      '<p class="t">' + ic('trophy', 'sz-16') + ' LZ-Meridian · commissioning record</p>' +
      '<button type="button" class="btn-icon dlg-close" data-act="close-cleared" aria-label="Close completion report">' + ic('x', 'sz-16') + '</button>' +
    '</div>' +
    '<h2 class="dlg-title">Cleared for departure</h2>' +
    '<p class="dlg-sub">The landing zone is commissioned, the screening table is least-privilege, and every flow has its front door.</p>' +
    '<div class="score-box"><div>' +
        '<p class="pct">' + completion.scorePct + '%</p>' +
        '<p class="expl">objectives 65% (first-attempt) · review 35% · hint deductions applied</p></div>' +
      '<div class="stars" role="img" aria-label="' + completion.stars + ' of 5 stars">' + starRow(completion.stars) + '</div></div>' +
    '<div class="focus-block">' +
      '<p class="cap">' + ic('crosshair', 'sz-14') + ' Focus areas — where to push next</p>' + focusHtml + '</div>' +
    '<div style="margin:1rem 0;">' +
      '<p class="hv-cap teal" style="margin-bottom:0.375rem;">Mastery recap by pillar</p>' + recap + '</div>' +
    '<p class="review-line">Review: <strong>' + S.quiz.correct + '/' + quizTotal + '</strong> correct. ' +
      (completion.stars >= 4
        ? 'Strong commissioning — you can explain, recognize, diagnose and harden this objective area.'
        : 'Solid work — work the focus areas above, revisit the Handover Pack field notes, then re-fly the other mode to lock it in.') + '</p>' +
    '<div style="margin-top:1rem;">' +
      '<p class="hv-cap orange" style="margin-bottom:0.375rem;">What to learn next</p>' +
      '<ul class="nextlist">' +
        '<li>N10-009 1.4 — routing &amp; switching concepts (your VPC route tables just got deeper).</li>' +
        '<li>N10-009 4.x — network security: NSG least-privilege was a preview.</li>' +
        '<li>Hands-on: stand up a free-tier VPC with public/private subnets and read its flow logs.</li>' +
        '<li>' + esc(nextLast) + '.</li>' +
      '</ul></div>' +
    '<div class="modal-actions">' +
      '<button type="button" class="btn btn-dark" data-act="debrief">Revisit handover pack ' + ic('arrow-right', 'sz-16') + '</button>' +
      '<button type="button" class="btn btn-outline-orange" data-act="fly-again">' + ic('rotate-ccw', 'sz-16') + ' Fly another mode</button>' +
    '</div>';
}

/* ── Controller ─────────────────────────────────────────────────────────── */
function commit() {
  if (S.mode) saveLabState(S);
  else clearLabState();
}

function sealCompletion(next) {
  if (next.mode && allObjectivesDone(next) && next.quiz.submitted && !next.completion) {
    next.completion = computeScore(next);
  }
  return next;
}

function resetTransientUi() {
  UI.feedback = {};
  UI.focusedId = null;
  UI.activeTool = 'sorting';
  UI.mobileChecklist = false;
  UI.ruleDraft = null;
  UI.ruleError = null;
  UI.animatedRunKey = null;
  UI.quiz = { started: false, draft: null, override: null };
}

/* ── Objective engine (LabShell.tsx F2) ─────────────────────────────────── */
function checkObjective(id) {
  var fb = validateObjective(id, S.env);
  var prev = S.objectives[id] || { done: false, attempts: 0, firstAttempt: false, hintsUsed: 0 };
  var attempts = prev.attempts + 1;
  var firstAttempt = prev.attempts === 0 && fb.ok ? true : prev.firstAttempt;
  S.objectives[id] = Object.assign({}, prev, { attempts: attempts, firstAttempt: firstAttempt, done: fb.ok });
  UI.feedback[id] = fb;
  sealCompletion(S);
  commit();
  render('[data-act="check"][data-id="' + id + '"]');
}

function revealHint(id) {
  var def = objectivesFor(S.mode).find(function (o) { return o.id === id; });
  var maxHints = def ? def.hints.length : 0;
  var prev = S.objectives[id] || { done: false, attempts: 0, firstAttempt: false, hintsUsed: 0 };
  S.objectives[id] = Object.assign({}, prev, { hintsUsed: Math.min(maxHints, prev.hintsUsed + 1) });
  commit();
  render('[data-act="hint"][data-id="' + id + '"]');
}

function whereTo(id) {
  var obj = objectivesFor(S.mode).find(function (o) { return o.id === id; });
  if (!obj) return;
  UI.activeTool = obj.toolKey;
  UI.focusedId = id;
  render();
  window.setTimeout(function () {
    var el = document.getElementById('rack-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

/* ── Mode / phase machine ───────────────────────────────────────────────── */
function pickMode(m) {
  S = initialLabState(m);
  S.phase = 'brief';
  S.visited = { brief: true };
  resetTransientUi();
  invalidateShuffles();
  commit();
  render();
}

function gotoPhase(phase) {
  S.phase = phase;
  S.visited[phase] = true;
  commit();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetLab() {
  clearLabState();
  S = initialLabState(null);
  resetTransientUi();
  invalidateShuffles();
  closeAllDialogs();
  render();
}

/* ── NSG rule editor (ScreeningBench.tsx validation 1:1) ────────────────── */
function ruleEditorEmpty() {
  return { id: null, priority: '', direction: 'in', action: 'allow', protocol: 'TCP', port: '', source: '', tag: '' };
}

function openRuleEditor(rule) {
  UI.ruleError = null;
  UI.ruleDraft = rule
    ? { id: rule.id, priority: String(rule.priority), direction: rule.direction, action: rule.action,
        protocol: rule.protocol, port: String(rule.port), source: rule.source, tag: rule.tag }
    : ruleEditorEmpty();
}

function saveRuleDraft() {
  if (!UI.ruleDraft) return;
  var d = UI.ruleDraft;
  var prio = Number(d.priority);
  var port = Number(d.port);
  if (!Number.isInteger(prio) || prio < 10 || prio > 4095) {
    UI.ruleError = 'Priority must be an integer from 10 to 4095 (lower = evaluated first).';
    render(); return;
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    UI.ruleError = 'Port must be an integer from 1 to 65535.';
    render(); return;
  }
  if (!d.source.trim()) {
    UI.ruleError = 'Source CIDR is required (0.0.0.0/0 for “any”).';
    render(); return;
  }
  var rule = {
    id: d.id || 'r-user-' + Date.now(),
    priority: prio,
    direction: d.direction,
    action: d.action,
    protocol: d.protocol,
    port: port,
    source: d.source.trim(),
    tag: d.tag.trim() || 'crew-authored rule',
  };
  if (d.id) {
    S.env.nsgRules = S.env.nsgRules.map(function (r) { return r.id === d.id ? rule : r; });
  } else {
    S.env.nsgRules = S.env.nsgRules.concat([rule]);
  }
  UI.ruleDraft = null;
  UI.ruleError = null;
  commit();
  render();
}

/* ── Packet probe + schematic flight animation (LzSchematic.tsx F-26) ───── */
function runProbe(presetId) {
  var preset = PROBE_PRESETS.find(function (p) { return p.id === presetId; });
  if (!preset) return;
  var res = simulate(S.env, preset);
  S.env.packetRuns.push({
    flowId: presetId, result: res.result, reason: res.reason, matchedRule: res.matchedRule,
    order: S.env.packetRuns.length + 1, at: Date.now(),
  });
  commit();
  render();
  animateProbe(S.env.packetRuns[S.env.packetRuns.length - 1]);
}

function animateProbe(run) {
  if (!run) return;
  var runKey = String(run.order);
  var dot = document.getElementById('probe-dot');
  var from = SCH_ANCHORS[schZoneOfRun(run.flowId, 'from')] || SCH_ANCHORS.internet;
  var to = SCH_ANCHORS[schZoneOfRun(run.flowId, 'to')] || SCH_ANCHORS.internet;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!dot || !dot.animate || reduced) {
    finishProbeAnimation(runKey);
    return;
  }
  var anim = dot.animate(
    [{ transform: 'translate(0px, 0px)' },
     { transform: 'translate(' + (to.x - from.x) + 'px, ' + (to.y - from.y) + 'px)' }],
    { duration: 900, easing: 'ease-in-out', fill: 'forwards' }
  );
  anim.onfinish = function () { finishProbeAnimation(runKey); };
}

function finishProbeAnimation(runKey) {
  var last = S.env.packetRuns.length ? S.env.packetRuns[S.env.packetRuns.length - 1] : null;
  if (last && String(last.order) === runKey && UI.animatedRunKey !== runKey) {
    UI.animatedRunKey = runKey;
    render();
  }
}

/* ── Quiz actions ───────────────────────────────────────────────────────── */
function quizConfirm() {
  var items = quizItems();
  var firstUnanswered = -1;
  for (var i = 0; i < items.length; i++) { if (!S.quiz.answers[items[i].id]) { firstUnanswered = i; break; } }
  var current = UI.quiz.override !== null && UI.quiz.override !== undefined ? UI.quiz.override : Math.max(0, firstUnanswered);
  var item = items[current];
  if (!item || !UI.quiz.draft) return;
  S.quiz.answers[item.id] = UI.quiz.draft;
  UI.quiz.override = current; /* stay on the confirmed question until NEXT is pressed */
  commit();
  render();
}

function quizNext() {
  var items = quizItems();
  var firstUnanswered = -1;
  for (var i = 0; i < items.length; i++) { if (!S.quiz.answers[items[i].id]) { firstUnanswered = i; break; } }
  var current = UI.quiz.override !== null && UI.quiz.override !== undefined ? UI.quiz.override : Math.max(0, firstUnanswered);
  UI.quiz.draft = null;
  UI.quiz.override = current + 1;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function quizSubmit() {
  if (S.quiz.submitted) return;
  var items = quizItems();
  var correct = items.filter(function (q) { return S.quiz.answers[q.id] === q.answerKey; }).length;
  S.quiz.submitted = true;
  S.quiz.correct = correct;
  sealCompletion(S);
  commit();
  render(); /* syncDialogs() opens the cleared modal when the lab is fully cleared */
}

/* ── Completion modal helpers ───────────────────────────────────────────── */
function dismissCompletion() {
  if (S.completion && !S.completion.dismissed) {
    S.completion.dismissed = true;
    commit();
  }
}

/* ── Dialog plumbing (native <dialog>: focus containment + ESC for free) ── */
function openDialog(id) {
  var d = document.getElementById(id);
  if (!d || d.open) return;
  UI.lastFocus = document.activeElement;
  d.showModal();
}

function closeDialog(id) {
  var d = document.getElementById(id);
  if (d && d.open) d.close();
}

function closeAllDialogs() {
  ['dlg-reset', 'sheet-glossary', 'dlg-cleared'].forEach(closeDialog);
}

function syncDialogs() {
  var cleared = document.getElementById('dlg-cleared');
  if (!cleared) return;
  var want = !!(S.completion && !S.completion.dismissed);
  if (want && !cleared.open) {
    document.getElementById('cleared-body').innerHTML = viewClearedBody();
    UI.lastFocus = document.activeElement;
    cleared.showModal();
  } else if (!want && cleared.open) {
    cleared.close();
  }
}

/* ── Glossary hover-card (shared.tsx G / HoverCard) ─────────────────────── */
var gpop = null;
var gpopTimer = null;

function showGlossaryPop(btn) {
  var term = btn.getAttribute('data-glossary');
  var entry = GLOSSARY.find(function (g) { return g.term.toLowerCase() === term.toLowerCase(); });
  if (!entry) return;
  hideGlossaryPopNow();
  gpop = document.createElement('div');
  gpop.className = 'g-pop';
  gpop.setAttribute('role', 'tooltip');
  gpop.innerHTML = '<span class="g-kicker">Glossary</span>' +
    '<p class="g-term-name">' + esc(entry.term) + '</p>' +
    '<p class="g-def">' + esc(entry.def) + '</p>';
  document.body.appendChild(gpop);
  var r = btn.getBoundingClientRect();
  var top = r.bottom + window.scrollY + 6;
  var left = Math.max(8, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - 288 - 8));
  gpop.style.top = top + 'px';
  gpop.style.left = left + 'px';
}

function hideGlossaryPopNow() {
  if (gpopTimer) { window.clearTimeout(gpopTimer); gpopTimer = null; }
  if (gpop) { gpop.remove(); gpop = null; }
}

function hideGlossaryPopSoon() {
  if (gpopTimer) window.clearTimeout(gpopTimer);
  gpopTimer = window.setTimeout(function () { hideGlossaryPopNow(); }, 60);
}

/* ── Render ─────────────────────────────────────────────────────────────── */
function render(focusSel) {
  var app = document.getElementById('app');
  if (!S.mode || S.phase === 'mode') {
    app.innerHTML = viewModeApron();
    return;
  }
  var body = '';
  if (S.phase === 'brief') body = viewBriefing();
  else if (S.phase === 'ground') body = viewGroundSchool();
  else if (S.phase === 'floor') body = viewFloor();
  else if (S.phase === 'review') body = viewQuiz();
  else if (S.phase === 'handover') body = viewHandover();

  var foot = S.phase !== 'floor'
    ? '<p class="foot-hint">' + esc(LAB_TAG) + ' · progress saved locally · use the phase strip above to move between sections</p>'
    : '';
  app.innerHTML = viewHeader() + body + foot;
  syncDialogs();
  if (focusSel) {
    var el = document.querySelector(focusSel);
    if (el && el.focus) { try { el.focus(); } catch (e) { /* not focusable */ } }
  }
}

/* Live-refresh only the schematic while text inputs are being typed in
   (matches the original's live SVG labels without stealing input focus). */
function refreshSchematic() {
  var sch = document.querySelector('.schematic');
  if (!sch) return;
  var holder = document.createElement('div');
  holder.innerHTML = viewSchematic();
  if (holder.firstChild) sch.replaceWith(holder.firstChild);
}

/* After a full re-render, restore focus to the same control (a11y parity
   with React's reconciliation, which preserved focus across updates). */
function refocusAnalog(prev) {
  if (!prev || !prev.getAttribute) return;
  var act = prev.getAttribute('data-act');
  if (!act) return;
  var sel = '[data-act="' + act + '"]';
  var refiners = ['data-id', 'data-flow', 'data-idx', 'data-field', 'data-tool', 'data-phase', 'data-key'];
  for (var i = 0; i < refiners.length; i++) {
    var v = prev.getAttribute(refiners[i]);
    if (v !== null && v !== undefined) sel += '[' + refiners[i] + '="' + v + '"]';
  }
  var el = document.querySelector(sel);
  if (el && el.focus) { try { el.focus(); } catch (e) { /* noop */ } }
}

/* ── Static dialog shells (reset confirm + glossary drawer) ─────────────── */
function buildStaticDialogs() {
  var reset = document.getElementById('dlg-reset');
  reset.innerHTML = '<div class="dlg-inner">' +
    '<h2 class="dlg-title" id="dlg-reset-title">Reset LZ-MERIDIAN?</h2>' +
    '<p class="dlg-sub">This clears saved progress — mode, objectives, environment state and review results — and returns the lab to its pristine apron. This cannot be undone.</p>' +
    '<div class="dlg-actions">' +
      '<button type="button" class="btn btn-outline" data-act="close-reset">Keep flying</button>' +
      '<button type="button" class="btn btn-danger" data-act="do-reset">Reset to pristine</button>' +
    '</div></div>';

  var entries = GLOSSARY.map(function (g) {
    return '<div class="g-entry"><dt>' + esc(g.term) + '</dt><dd>' + esc(g.def) + '</dd></div>';
  }).join('');
  var sheet = document.getElementById('sheet-glossary');
  sheet.innerHTML = '<div class="sheet-head">' +
      '<p class="t">LZ-MERIDIAN · Glossary (' + GLOSSARY.length + ' terms)</p>' +
      '<p class="s">N10-009 1.3 vocabulary, one line each.</p>' +
      '<button type="button" class="btn-icon sheet-close" data-act="close-glossary" aria-label="Close glossary">' + ic('x', 'sz-16') + '</button></div>' +
    '<div class="sheet-body lz-scroll"><dl>' + entries + '</dl></div>';
}

/* ── Event delegation ───────────────────────────────────────────────────── */
function bindGlobalEvents() {
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var act = el.getAttribute('data-act');
    var id = el.getAttribute('data-id');
    var val = el.getAttribute('data-val');
    var flow = el.getAttribute('data-flow');
    var step = el.getAttribute('data-step');
    var mode = el.getAttribute('data-mode');
    var phase = el.getAttribute('data-phase');
    var tool = el.getAttribute('data-tool');

    if (act === 'pick-mode') { pickMode(mode); return; }
    if (act === 'goto') { gotoPhase(phase); return; }
    if (act === 'open-glossary') { openDialog('sheet-glossary'); return; }
    if (act === 'close-glossary') { closeDialog('sheet-glossary'); return; }
    if (act === 'open-reset') { openDialog('dlg-reset'); return; }
    if (act === 'close-reset') { closeDialog('dlg-reset'); return; }
    if (act === 'do-reset') { resetLab(); return; }
    if (act === 'close-cleared') { dismissCompletion(); closeDialog('dlg-cleared'); return; }
    if (act === 'file-clearance') {
      if (allObjectivesDone(S) && S.quiz.submitted && S.completion) {
        S.completion.dismissed = false;
        commit();
        render();
      }
      return;
    }
    if (act === 'debrief') {
      if (S.completion) S.completion.dismissed = false; /* original: dismissed:false + goto handover */
      gotoPhase('handover');
      return;
    }
    if (act === 'fly-again') { resetLab(); return; }

    if (act === 'focus-obj') { UI.focusedId = id; render('[data-act="focus-obj"][data-id="' + id + '"]'); return; }
    if (act === 'check') { checkObjective(id); return; }
    if (act === 'hint') { revealHint(id); return; }
    if (act === 'where') { whereTo(id); return; }
    if (act === 'tool') { UI.activeTool = tool; render('[data-act="tool"][data-tool="' + tool + '"]'); return; }
    if (act === 'toggle-mobile-checklist') { UI.mobileChecklist = !UI.mobileChecklist; render('[data-act="toggle-mobile-checklist"]'); return; }

    if (act === 'add-subnet') {
      S.env.vpc.subnets.push({ id: 'sn-' + (S.env.vpc.subnets.length + 1), name: '', cidr: '', type: 'public' });
      commit(); render(); return;
    }
    if (act === 'set-cidr') { S.env.vpc.cidr = val; commit(); render(); return; }
    if (act === 'set-workload') { S.env.workloadAssign[id] = val; commit(); render(); return; }
    if (act === 'set-resp') { S.env.respBoard[id] = val; commit(); render(); return; }
    if (act === 'set-dep') { S.env.depMatch[id] = val; commit(); render(); return; }
    if (act === 'set-concept') { S.env.conceptSort[id] = val; commit(); render(); return; }
    if (act === 'set-nfv') { S.env.nfvBoard[id] = val; commit(); render(); return; }
    if (act === 'set-nfv-reason') { S.env.nfvReasons[id] = val; commit(); render(); return; }
    if (act === 'set-conn-choice') {
      var cur = S.env.connChoice[flow] || { choice: null, factor: null };
      S.env.connChoice[flow] = { choice: val, factor: cur.factor };
      commit(); render(); return;
    }
    if (act === 'set-not-encrypted') { S.env.notEncrypted = val; commit(); render(); return; }
    if (act === 'set-h7') { S.env.h7Answer = val; commit(); render(); return; }
    if (act === 'seq-add') { S.env.seqOrder.push(step); commit(); render(); return; }
    if (act === 'seq-remove') {
      S.env.seqOrder = S.env.seqOrder.filter(function (s) { return s !== step; });
      commit(); render(); return;
    }
    if (act === 'probe') { runProbe(id); return; }

    if (act === 'rule-new') { openRuleEditor(null); render(); return; }
    if (act === 'rule-edit') {
      var rule = S.env.nsgRules.find(function (r) { return r.id === id; });
      if (rule) { openRuleEditor(rule); render(); }
      return;
    }
    if (act === 'rule-close') { UI.ruleDraft = null; UI.ruleError = null; render(); return; }
    if (act === 'rule-save') { saveRuleDraft(); return; }
    if (act === 'rule-del') {
      S.env.nsgRules = S.env.nsgRules.filter(function (r) { return r.id !== id; });
      commit(); render(); return;
    }

    if (act === 'quiz-start') { UI.quiz.started = true; render(); return; }
    if (act === 'quiz-pick') {
      var key = el.getAttribute('data-key'); /* quiz options carry data-key, not data-val */
      if (key && !S.quiz.answers[currentQuizId()]) { UI.quiz.draft = key; render(); }
      return;
    }
    if (act === 'quiz-confirm') { quizConfirm(); return; }
    if (act === 'quiz-next') { quizNext(); return; }
    if (act === 'quiz-submit') { quizSubmit(); return; }
  });

  /* Selects: values arrive via the change event */
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!(el instanceof HTMLSelectElement)) return;
    var act = el.getAttribute('data-act');
    if (!act) return;
    var id = el.getAttribute('data-id');
    var flow = el.getAttribute('data-flow');
    var idx = el.getAttribute('data-idx');
    var field = el.getAttribute('data-field');

    if (act === 'set-manifest') { S.env.manifestAssign[id] = el.value; commit(); }
    else if (act === 'set-subnet-type') { S.env.vpc.subnets[Number(idx)].type = el.value; commit(); }
    else if (act === 'set-route-target') { S.env.vpc.routeTarget = el.value || null; commit(); }
    else if (act === 'set-gateway') { S.env.gatewayPlan[flow] = el.value || null; commit(); }
    else if (act === 'set-m9') { S.env.m9[field] = el.value || null; commit(); }
    else if (act === 'set-triage') { S.env.flowTriage[field] = el.value || null; commit(); }
    else if (act === 'set-conn-factor') {
      var cur = S.env.connChoice[flow] || { choice: null, factor: null };
      S.env.connChoice[flow] = { choice: cur.choice, factor: el.value || null };
      commit();
    }
    else if (act === 'set-nfv-reason') { S.env.nfvReasons[id] = el.value || null; commit(); } else if (el.getAttribute('data-draft')) {
      UI.ruleDraft[el.getAttribute('data-draft')] = el.value; /* editor UI state only — no save, no re-render */
      return;
    } else {
      return;
    }
    render();
    refocusAnalog(el);
  });

  /* Text inputs: update env live WITHOUT re-rendering (keeps caret/focus),
     except the rule-editor draft which is pure UI state. */
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    var envIn = el.getAttribute('data-env-input');
    if (envIn === 'subnet') {
      var i = Number(el.getAttribute('data-idx'));
      var field = el.getAttribute('data-field');
      if (S.env.vpc.subnets[i]) {
        S.env.vpc.subnets[i][field] = el.value;
        commit();
        refreshSchematic();
      }
    } else if (envIn === 'triage') {
      S.env.flowTriage[el.getAttribute('data-field')] = el.value;
      commit();
    } else if (el.getAttribute('data-draft')) {
      UI.ruleDraft[el.getAttribute('data-draft')] = el.value;
    }
  });

  /* Glossary hover-card: open on hover/focus (120 ms delay), close on
     leave/blur/scroll/ESC (60 ms) — HoverCard semantics from shared.tsx. */
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest('.g-term');
    if (t) {
      if (gpopTimer) { window.clearTimeout(gpopTimer); gpopTimer = null; }
      if (!gpopTimer) showGlossaryPop(t);
    } else if (gpop && !e.target.closest('.g-pop')) {
      hideGlossaryPopSoon();
    }
  });
  document.addEventListener('focusin', function (e) {
    var t = e.target.closest('.g-term');
    if (t) showGlossaryPop(t);
  });
  document.addEventListener('focusout', function (e) {
    if (e.target && e.target.closest && e.target.closest('.g-term')) hideGlossaryPopSoon();
  });
  window.addEventListener('scroll', function () { hideGlossaryPopNow(); }, { passive: true });

  /* Dialog close events: restore focus; ESC on cleared modal = dismiss. */
  ['dlg-reset', 'sheet-glossary', 'dlg-cleared'].forEach(function (did) {
    var d = document.getElementById(did);
    d.addEventListener('close', function () {
      if (document.activeElement === document.body && UI.lastFocus && document.contains(UI.lastFocus)) {
        try { UI.lastFocus.focus(); } catch (err) { /* noop */ }
      }
    });
    d.addEventListener('click', function (e) {
      if (e.target === d) { /* backdrop press */
        if (did === 'dlg-cleared') dismissCompletion();
        d.close();
      }
    });
  });
  document.getElementById('dlg-cleared').addEventListener('cancel', function () { dismissCompletion(); });

  /* ESC also closes the glossary hover-card */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && gpop) hideGlossaryPopNow();
  });
}

/* Current quiz item id for pick-guards (mirrors QuizPanel's derived current). */
function currentQuizId() {
  var items = quizItems();
  var firstUnanswered = -1;
  for (var i = 0; i < items.length; i++) { if (!S.quiz.answers[items[i].id]) { firstUnanswered = i; break; } }
  var current = UI.quiz.override !== null && UI.quiz.override !== undefined ? UI.quiz.override : Math.max(0, firstUnanswered);
  return items[current] ? items[current].id : null;
}

/* ── Boot ───────────────────────────────────────────────────────────────── */
(function boot() {
  S = loadLabState() || initialLabState(null);
  UI = {
    activeTool: 'sorting', focusedId: null, feedback: {}, mobileChecklist: false,
    ruleDraft: null, ruleError: null, animatedRunKey: null,
    quiz: { started: false, draft: null, override: null },
    lastFocus: null,
  };
  invalidateShuffles();
  buildStaticDialogs();
  if (S.mode) saveLabState(S);
  else clearLabState(); /* pristine apron = no saved session */
  render();
  bindGlobalEvents();
})();
