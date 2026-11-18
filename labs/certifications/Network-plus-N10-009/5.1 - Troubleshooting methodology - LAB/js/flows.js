// ── Fault Isolation Line — flows (js/flows.js) ──
// Mode select, debrief board and completion modal, ported 1:1 from
// src/components/lab/flows.tsx (framer-motion transitions become CSS).

/* ══════════ MODE SELECT ══════════ */
function ModeSelect() {
  return '<div class="mode-wrap">' +
    '<div class="mode-intro">' +
    '<p class="eyebrow eyebrow-center">CompTIA Network+ N10-009 \u00b7 Objective 5.1 \u00b7 Training simulation</p>' +
    '<h1 class="mode-title">FAULT ISOLATION LINE</h1>' +
    '<p class="mode-sub">One live ticket. Seven stops. The CompTIA troubleshooting methodology — from \u201cthe internet is down\u201d to a documented root cause. Choose your shift:</p>' +
    '</div>' +
    '<div class="grid grid-sm2 mode-cards">' +
    '<button type="button" data-mode="medium" aria-label="Choose Medium mode" class="mode-card">' +
    '<span class="hazard mode-stripe" aria-hidden="true"></span>' +
    '<h2 class="mode-card-title">MEDIUM \u00b7 Learn the line</h2>' +
    '<ul class="mode-list">' +
    '<li>\u00b7 12 guided objectives, introduced stop by stop</li>' +
    '<li>\u00b7 \u201cWhere to look\u201d cues + 3-tier hints (cost stars, never block)</li>' +
    '<li>\u00b7 Tolerant checking — wrong answers teach, never punish</li>' +
    '<li>\u00b7 Clean evidence, concept quiz after the run</li>' +
    '</ul>' +
    '<p class="mode-cta mode-cta-medium">Best for first pass \u2192</p>' +
    '</button>' +
    '<button type="button" data-mode="hard" aria-label="Choose Hard mode" class="mode-card mode-card-hard">' +
    '<span class="hazard mode-stripe" aria-hidden="true"></span>' +
    '<h2 class="mode-card-title mode-card-title-hard">HARD \u00b7 Run the floor</h2>' +
    '<ul class="mode-list mode-list-hard">' +
    '<li>\u00b7 10 broad, multi-step challenges — no hand-holding</li>' +
    '<li>\u00b7 Noisy feed with red herrings; hints mostly off (1 costly nudge)</li>' +
    '<li>\u00b7 Strict validation: exact sets, exact sequences, near-misses rejected</li>' +
    '<li>\u00b7 Scenario quiz that demands judgment</li>' +
    '</ul>' +
    '<p class="mode-cta mode-cta-hard">Best after you have read \u2192</p>' +
    '</button>' +
    '</div>' +
    '<p class="mode-foot">Both shifts run the same incident (synthetic data, fictional org). Progress auto-saves in your browser; a labeled RESET restores pristine state.</p>' +
    '</div>';
}

/* ══════════ DEBRIEF ══════════ */
function DebriefBoard(s) {
  const objIds = s.mode === 'hard'
    ? Object.keys(STATION_OBJECTIVES).reduce(function (acc, k) { return acc.concat(STATION_OBJECTIVES[k].hard); }, [])
    : Object.keys(STATION_OBJECTIVES).reduce(function (acc, k) { return acc.concat(STATION_OBJECTIVES[k].medium); }, []);
  const pillars = ['P1', 'P2', 'P3', 'P4'];

  let html = '<div class="debrief-wrap">';

  html += '<div><p class="eyebrow">Stop 08 \u00b7 Shift debrief</p>' +
    '<h2 class="debrief-title">Field notes — what the line taught you</h2></div>';

  // Detection opportunities
  html += '<section aria-label="Process detection opportunities" class="debrief-card">';
  html += '<h3 class="debrief-h">Detection opportunities — when the methodology is being skipped</h3>';
  html += '<div class="grid gap-2 mt-3">';
  DEBRIEF_SIGNALS.forEach(function (d) {
    html += '<div class="signal-card">' +
      '<p class="signal-source">' + esc(d.source) + '</p>' +
      '<p class="signal-reveals">' + esc(d.reveals) + '</p>' +
      '<p class="signal-logic">detect: ' + esc(d.logic) + '</p>' +
      '</div>';
  });
  html += '</div></section>';

  // Controls
  html += '<section aria-label="Control recommendations" class="debrief-card">';
  html += '<h3 class="debrief-h">Control recommendations (N10-009-aligned)</h3>';
  html += '<ul class="mt-2 controls-list">';
  DEBRIEF_CONTROLS.forEach(function (c) {
    html += '<li><strong>' + esc(c.title) + '.</strong> ' + esc(c.body) + '</li>';
  });
  html += '</ul></section>';

  // Blue / red takeaways
  html += '<div class="grid grid-sm2">';
  html += '<section aria-label="Blue-team takeaways" class="takeaway takeaway-blue">';
  html += '<h3 class="takeaway-title-blue">Blue-team takeaways</h3>';
  html += '<ul class="takeaway-list takeaway-list-blue">';
  DEBRIEF_BLUE.forEach(function (t) { html += '<li>\u25b8 ' + esc(t) + '</li>'; });
  html += '</ul></section>';
  html += '<section aria-label="Red-team mindset" class="takeaway takeaway-red">';
  html += '<h3 class="takeaway-title-red">Red-team mindset</h3>';
  html += '<ul class="takeaway-list takeaway-list-red">';
  DEBRIEF_RED.forEach(function (t) { html += '<li>\u25b8 ' + esc(t) + '</li>'; });
  html += '</ul></section>';
  html += '</div>';

  // References
  html += '<section aria-label="References" class="refs-card">';
  html += '<h3 class="debrief-h">Official references</h3>';
  html += '<ul class="mt-2 refs-list">';
  DEBRIEF_LINKS.forEach(function (l) {
    html += '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" class="ref-link">' + esc(l.label) + ' \u2197</a></li>';
  });
  html += '<li class="refs-note">CompTIA N10-009 exam objectives PDF — available from CompTIA after a free account login. Domain 5.0 = 24%; objective 5.1 = this methodology.</li>';
  html += '</ul></section>';

  // Score recap
  html += '<section aria-label="Score recap" class="recap-card">';
  html += '<h3 class="debrief-h">Your line report</h3>';
  html += '<div class="grid grid-2 mt-2">';
  pillars.forEach(function (p) {
    const list = objIds.filter(function (id) { return OBJECTIVES[id] && OBJECTIVES[id].pillar === p; });
    const done = list.filter(function (id) { return s.objectives[id] && s.objectives[id].done; }).length;
    html += '<p class="recap-pill"><strong class="mono">' + p + ' \u00b7 ' + esc(PILLAR_LABEL[p]) + '</strong> — ' + done + '/' + list.length + ' objectives passed</p>';
  });
  html += '</div>';
  html += '<div class="mt-3 recap-btns">' +
    '<button type="button" data-jump="line" data-fk="review-stations" class="btn btn-white">Review stations</button>' +
    '<button type="button" data-jump="quiz" data-fk="review-audit" class="btn btn-white">Review audit</button>' +
    '</div></section>';

  html += '<button type="button" data-finish="1" data-fk="end-shift" class="btn btn-orange btn-finish">End of shift \u2192 completion report</button>';

  html += '</div>';
  return html;
}

/* ══════════ COMPLETION MODAL ══════════ */
function CompletionModal(props) {
  const pillars = ['P1', 'P2', 'P3', 'P4'];
  const starStr = '\u2605'.repeat(props.stars) + '\u2606'.repeat(5 - props.stars);

  let html = '<div class="modal-root" role="dialog" aria-modal="true" aria-label="Completion report">';
  html += '<div class="modal-overlay" aria-hidden="true"></div>';
  html += '<div class="modal-card completion-in">';
  html += '<div class="hazard modal-stripe" aria-hidden="true"></div>';
  html += '<div class="modal-body stack-sm">';

  html += '<p class="eyebrow eyebrow-center">Shift complete \u00b7 case MERID-0417 closed</p>';
  html += '<h2 class="modal-title">You ran the whole line.</h2>';

  html += '<div class="stars-block" aria-label="Star rating: ' + props.stars + ' of 5">' +
    '<p class="stars" aria-hidden="true">' + starStr + '</p>' +
    '<p class="stars-meta">' + props.stars + '/5 stars — deductions: ' + props.deductions + ' (re-attempts + hint usage). Flawless first-pass run with zero hints = 5\u2605.</p>' +
    '</div>';

  html += '<div class="grid score-tiles">' +
    '<div class="score-tile"><p class="score-big">' + props.passed + '/' + props.total + '</p><p class="score-label">objectives (' + esc(props.mode) + ')</p></div>' +
    '<div class="score-tile"><p class="score-big">' + props.quizCorrect + '/' + props.quizTotal + '</p><p class="score-label">quality audit</p></div>' +
    '</div>';

  html += '<div class="pillar-recap"><p class="recap-label">Recap by pillar</p><ul class="pillar-list">';
  pillars.forEach(function (p) {
    html += '<li><strong class="mono">' + p + ' ' + esc(PILLAR_LABEL[p]) + ':</strong> ' + props.pillarsDone[p].done + '/' + props.pillarsDone[p].total + ' objectives passed</li>';
  });
  html += '</ul></div>';

  html += '<div class="focus-box">';
  html += '<p class="recap-label">Focus areas for next shift — from your run</p>';
  if (props.focusAreas.length === 0) {
    html += '<p class="focus-line">Flawless run — no weak areas detected. Keep the momentum with the list below.</p>';
  } else {
    html += '<ul class="focus-list">';
    props.focusAreas.forEach(function (f) { html += '<li>\u25b8 ' + esc(f) + '</li>'; });
    html += '</ul>';
  }
  html += '</div>';

  html += '<div class="next-box"><p class="recap-label">What to learn next</p><ul class="focus-list">';
  NEXT_STEPS.forEach(function (n) { html += '<li>\u25b8 ' + esc(n) + '</li>'; });
  html += '</ul></div>';

  html += '<div class="modal-btns">' +
    '<button type="button" data-review="1" data-fk="modal-review" class="btn btn-white">Review debrief</button>' +
    '<button type="button" data-modal-reset="1" data-fk="modal-reset" class="btn btn-red-outline">Reset lab (fresh shift)</button>' +
    '</div>';

  html += '</div></div></div>';
  return html;
}
