// ── The Access Bureau — app shell, routing of actions, boot ───────────────
// Vanilla re-implementation of the original lab shell (lab.tsx, nav.tsx,
// tracker.tsx, quiz.tsx, debrief.tsx): same layout flow, same interactions,
// same persistence and reset semantics. No framework, no build step.
'use strict';
(function (global) {
  const D = global.ABData;
  const OBJ = global.ABObjectives;
  const ui = global.ABUI;
  const store = global.ABStore;
  const H = global.ABStoreHelpers;
  const S = global.ABStations;

  const STATION_LABELS = {
    intake: 'Intake Desk', evidence: 'Evidence Locker', protocol: 'Protocol Desk',
    vault: 'Vault Room', board: 'Review Board',
  };
  const STATION_NO = { intake: '01', evidence: '02', protocol: '03', vault: '04', board: '05' };
  const STATION_SUBS = {
    intake: 'dossiers, account types & the lifecycle ledger',
    evidence: 'raw logs, scripts, consent screens — TRAINING DATA',
    protocol: 'SAML · OAuth · OIDC · LDAP traces',
    vault: 'MFA policy & privileged access controls',
    board: 'recertification, models & rulings',
  };
  const STATION_ICONS = {
    intake: 'FolderSearch', evidence: 'ScrollText', protocol: 'Landmark',
    vault: 'Vault', board: 'Gavel',
  };
  const SHELL_ICONS = { intake: 'Landmark', evidence: 'ScanFace', protocol: 'ShieldCheck', vault: 'Vault', board: 'Lock' };
  const ORDER = ['intake', 'evidence', 'protocol', 'vault', 'board'];

  // transient UI state (never persisted — mirrors React local state)
  let resetConfirmOpen = false;
  let drawerOpen = false;
  let hintForTracker = null;
  let modalOpen = false;
  let pendingModalTimer = null;
  let pinnedTerm = null;   // term tooltip opened by click (sticky)

  // ────────────────────────── rendering: shell regions ──────────────────────────

  function renderModeSelect() {
    const cards = [
      { id: 'medium', icon: 'ClipboardList', title: 'Standard Audit', tag: 'Medium',
        desc: 'Guided audit: 11 granular work orders in order, tiered hints (3 levels, free), tolerant validation and a concept examination. The desk teaches you.',
        tone: 'mode-card--medium' },
      { id: 'hard', icon: 'FileBadge', title: 'Critical Audit', tag: 'Hard',
        desc: 'Incident-grade: 9 deep, multi-step work orders over noisy evidence with red herrings, one costly nudge, exact-value validation and scenario papers. The desk tests you.',
        tone: 'mode-card--hard' },
    ];
    return '<div class="mode-grid">' + cards.map(function (c) {
      return '<button type="button" data-action="mode-select" data-id="' + c.id + '" aria-label="Select ' + c.title + ' mode (' + c.tag + ')" class="mode-card ' + c.tone + '">' +
        ui.icon(c.icon, 'ic-32 amber') +
        '<span class="mode-eyebrow">Report for: ' + c.tag + '</span>' +
        '<span class="mode-title">' + c.title + '</span>' +
        '<span class="mode-desc">' + c.desc + '</span>' +
        '<span class="mode-cta">Take the badge →</span></button>';
    }).join('') + '</div>';
  }

  function renderBriefing() {
    return '<section aria-labelledby="briefing-h" class="paper-card">' +
      '<div class="briefing-head"><div class="briefing-head-row">' +
      '<h2 id="briefing-h" class="h2">' + ui.icon('Building2', 'ic-20 amber') + ' Scenario briefing</h2>' +
      '<span class="memo-cap">Memorandum · Case ' + D.CASE_NO + '</span></div></div>' +
      '<div class="briefing-body">' +
      '<p class="memo-from">From: Office of the Identity Auditor · To: you, IAM analyst (day one)</p>' +
      '<p><strong>' + D.ORG + '</strong> — a 2,400-person freight company — faces its first full identity &amp; access audit. The estate is in trouble: a service account password is pinned in a team chat, a departed analyst&#39;s VPN account still works, a vendor wants permanent global admin, and the legacy inventory server still speaks unencrypted LDAP. Yesterday, someone logged into<span class="mono-inline"> svc_backup</span> from a desktop.</p>' +
      '<p>Your desk has five stations: <strong>Intake</strong> (dossiers &amp; lifecycle), <strong>Evidence Locker</strong>, <strong> Protocol Desk</strong> (SAML · OAuth · OIDC · LDAP), the <strong>Vault Room</strong> (MFA policy &amp; PAM) and the <strong> Review Board</strong> (recertification &amp; rulings). Close every work order and the certification file is yours. All evidence is <span class="chip-synthetic">TRAINING DATA — SYNTHETIC</span>.</p>' +
      '<p class="cert-note">Certification relevance: objective 4.5 of the SY0-801 exam (Domain 4.0, Security Operations) is a &quot;given a scenario, apply concepts&quot; objective — exactly what this desk drills. Terminology and protocol behavior follow the published V8 exam objectives.</p>' +
      '</div></section>';
  }

  function renderKnowledge() {
    return '<section aria-labelledby="knowledge-h" class="paper-card">' +
      '<div class="knowledge-head"><h2 id="knowledge-h" class="h2 h2--dark">' + ui.icon('BookOpen', 'ic-20 gold') + ' Training folio</h2>' +
      '<span class="folio-cap">The exam concepts behind every desk action</span>' +
      '<button type="button" data-action="knowledge-toggle-all" id="folio-toggle" class="btn-folio">Unfold all</button></div>' +
      '<div class="knowledge-body"><div class="grid-knowledge">' +
      D.KNOWLEDGE.map(function (k) {
        return '<details class="folio-item"><summary class="folio-summary"><span class="gold">&#9656;</span> ' + ui.esc(k.title) + '</summary>' +
          '<div class="folio-body"><p class="folio-text">' + ui.esc(k.body) + '</p>' +
          '<ul class="folio-points">' + k.points.map(function (p) { return '<li><span aria-hidden="true">&bull;</span><span>' + ui.esc(p) + '</span></li>'; }).join('') + '</ul></div></details>';
      }).join('') +
      '<details class="folio-item folio-item--glossary"><summary class="folio-summary folio-summary--glossary">' + ui.icon('Fingerprint', 'ic-16') + ' Glossary drawer — tap any underlined term in the lab for its definition</summary>' +
      '<dl class="glossary-list">' + Object.keys(D.GLOSSARY).map(function (t) {
        return '<div class="glossary-entry"><dt>' + ui.esc(t) + '</dt><dd>' + ui.esc(D.GLOSSARY[t]) + '</dd></div>';
      }).join('') + '</dl></details>' +
      '</div></div></section>';
  }

  function renderStationShell(id) {
    return '<section aria-labelledby="sh-' + id + '" class="station-shell">' +
      '<header class="station-head"><span class="station-no">STATION ' + STATION_NO[id] + '</span>' +
      '<h2 id="sh-' + id + '" class="h2 h2--dark station-h2">' + ui.icon(SHELL_ICONS[id], 'ic-20 gold') + ' ' + STATION_LABELS[id] + '</h2>' +
      '<span class="station-sub">' + STATION_SUBS[id] + '</span></header>' +
      '<div class="station-body" data-station-body="' + id + '">' + S.renderStation(id) + '</div></section>';
  }

  function renderLab() {
    let html = renderBriefing() + renderKnowledge();
    html += '<div class="layout-grid"><div class="stations-col">';
    for (const id of ORDER) {
      html += '<div id="station-' + id + '" class="station-anchor"><div class="station-ring" data-ring="' + id + '">' + renderStationShell(id) + '</div></div>';
    }
    html += '</div><aside id="tracker-rail" aria-label="Objectives tracker" class="tracker-rail"><div id="tracker-rail-body" class="tracker-sticky"></div></aside></div>';
    html += '<div id="examination"></div>';
    html += '<div id="findings"></div>';
    return html;
  }

  // ────────────────────────── desk rail (sticky nav) ──────────────────────────

  function renderDeskRail() {
    return '<div id="desk-rail" class="desk-rail">' +
      '<div class="desk-rail-inner">' +
      '<div class="brand"><span class="brand-name">The Access Bureau</span><span class="brand-case">CASE ' + D.CASE_NO + '</span></div>' +
      '<nav aria-label="Bureau stations" class="station-nav">' + ORDER.map(function (st) {
        return '<button type="button" data-action="jump" data-id="' + st + '" aria-label="Go to ' + STATION_LABELS[st] + '" class="nav-btn" data-station="' + st + '">' +
          ui.icon(STATION_ICONS[st], 'ic-14') + '<span>' + STATION_LABELS[st] + '</span></button>';
      }).join('') + '</nav>' +
      '<div class="rail-actions">' +
      '<span id="rail-count" class="rail-count" aria-live="polite"></span>' +
      '<button type="button" data-action="scroll-exam" class="nav-btn nav-btn--ghost">' + ui.icon('ScrollText', 'ic-14') + '<span class="hide-sm">Examination</span></button>' +
      '<button type="button" data-action="scroll-findings" class="nav-btn nav-btn--ghost">' + ui.icon('Gavel', 'ic-14') + '<span class="hide-sm">Findings</span></button>' +
      '<button type="button" data-action="reset-open" aria-label="Reset the lab to pristine state" class="btn-reset">' + ui.icon('Eraser', 'ic-16') + '</button>' +
      '</div></div>' +
      '<div id="reset-confirm" role="alertdialog" aria-label="Confirm reset" class="reset-confirm' + (resetConfirmOpen ? '' : ' hidden') + '">' +
      '<div class="reset-confirm-inner"><p class="reset-text">This stamps the whole case file CLOSED and wipes all progress — mode, work orders, examination, vault. Irreversible.</p>' +
      '<div class="reset-btns"><button type="button" data-action="reset-cancel" class="btn-ghost-sm">Keep working</button>' +
      '<button type="button" data-action="reset-confirm" class="btn-danger-sm">Wipe the case file</button></div></div></div>' +
      '</div>';
  }

  function updateDeskCount() {
    const state = store.state;
    const p = H.progress(state.mode, state.objState);
    const el = document.getElementById('rail-count');
    if (el) el.textContent = p.done + '/' + p.total + ' closed';
  }

  function updateHighlight() {
    const hl = store.state.highlight;
    document.querySelectorAll('.station-ring').forEach(function (el) {
      el.classList.toggle('ring-on', el.getAttribute('data-ring') === hl);
    });
    document.querySelectorAll('.nav-btn[data-station]').forEach(function (el) {
      el.classList.toggle('nav-btn--active', el.getAttribute('data-station') === hl);
    });
  }

  function jumpTo(station) {
    store.setHighlight(station);
    const target = document.getElementById('station-' + station);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () {
      if (store.state.highlight === station) store.setHighlight(null);
    }, 1600);
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ────────────────────────── objectives tracker ──────────────────────────

  const PILLAR_DOT = { understand: 'dot--amber', recognize: 'dot--red', detect: 'dot--olive', mitigate: 'dot--green' };

  function renderTrackerList() {
    const state = store.state;
    const mode = state.mode;
    if (!mode) return '';
    const objs = OBJ.objectivesFor(mode);
    const p = H.progress(mode, state.objState);
    let html = '<div class="tracker-progress">' +
      '<p class="rail-cap-mono">Work orders closed</p>' +
      '<p class="tracker-big">' + p.done + '<span class="tracker-total">/' + p.total + '</span></p>' +
      '<div class="progressbar" role="progressbar" aria-valuenow="' + p.done + '" aria-valuemin="0" aria-valuemax="' + p.total + '"><div class="progressbar-fill" style="width:' + p.pct + '%"></div></div>' +
      '<div class="pillar-row" aria-label="Pillar coverage">' + ['understand', 'recognize', 'detect', 'mitigate'].map(function (pl) {
        const tot = objs.filter(function (o) { return o.pillar === pl; }).length;
        const done = objs.filter(function (o) { return o.pillar === pl && state.objState[o.id] && state.objState[o.id].passed; }).length;
        const full = done === tot && tot > 0;
        return '<span class="pillar-chip ' + (full ? 'pillar-chip--done' : '') + '">' + pl.slice(0, 4) + ' ' + done + '/' + tot + '</span>';
      }).join('') + '</div></div>';
    html += '<ol class="tracker-list">' + objs.map(function (o, i) {
      const st = state.objState[o.id];
      const passed = !!(st && st.passed);
      const hints = st ? st.hints : 0;
      let li = '<li class="tracker-item ' + (passed ? 'tracker-item--passed' : '') + '">';
      li += '<div class="tracker-row"><span class="tracker-no">' + String(i + 1).padStart(2, '0') + '</span>';
      li += '<div class="flex1">';
      li += '<button type="button" data-action="tracker-jump" data-id="' + o.station + '" class="tracker-jump">' +
        '<span class="dot ' + PILLAR_DOT[o.pillar] + '" aria-hidden="true"></span>' + ui.esc(o.title) +
        ui.icon('ChevronRight', 'ic-14 amber ml-auto') + '</button>';
      li += '<p class="tracker-meta">' + o.id + ' · ' + o.station + '</p>';
      if (passed) {
        li += '<p class="tracker-done">' + ui.icon('CircleCheck', 'ic-14') + ' Closed' +
          (st.attempts > 1 ? ' <span class="tracker-sub">· ' + st.attempts + ' attempts</span>' : '') +
          (hints > 0 ? ' <span class="tracker-sub">· ' + hints + ' hint' + (hints > 1 ? 's' : '') + '</span>' : '') + '</p>';
      } else if (hints > 0) {
        li += '<p class="tracker-hints-used">' + hints + ' hint' + (hints > 1 ? 's' : '') + ' used</p>';
      }
      li += '</div>';
      if (!passed) {
        li += '<button type="button" data-action="tracker-hint" data-id="' + o.id + '" aria-label="Reveal hint for ' + ui.esc(o.title) + '" class="btn-hint-sm">' + ui.icon('Lightbulb', 'ic-16') + '</button>';
      }
      li += '</div>';
      if (hintForTracker === o.id && !passed) {
        const obj = OBJ.objectivesFor(mode).find(function (x) { return x.id === o.id; });
        const hintText = obj && st && st.hints > 0 ? obj.hints[st.hints - 1] : null;
        if (hintText) li += '<p class="tracker-hint-text">' + ui.esc(hintText) + '</p>';
      }
      li += '</li>';
      return li;
    }).join('') + '</ol>';
    return html;
  }

  function updateTrackers() {
    const railBody = document.getElementById('tracker-rail-body');
    if (railBody) railBody.innerHTML = renderTrackerList();
    const drawerBody = document.getElementById('tracker-drawer-body');
    if (drawerBody) drawerBody.innerHTML = renderTrackerList();
    updateDeskCount();
  }

  function renderTrackerSheet() {
    if (!store.state.mode) return '';
    const p = H.progress(store.state.mode, store.state.objState);
    let html = '<div class="tracker-fab-wrap">';
    html += '<button type="button" data-action="drawer-open" aria-expanded="' + drawerOpen + '" aria-controls="tracker-drawer" class="tracker-fab">Work orders <span class="fab-count">' + p.done + '/' + p.total + '</span></button>';
    if (drawerOpen) {
      html += '<div class="drawer-overlay" data-action="drawer-backdrop"></div>' +
        '<div id="tracker-drawer" role="dialog" aria-label="Objectives tracker" class="drawer">' +
        '<div class="drawer-head"><h2 class="drawer-title">Work orders</h2>' +
        '<button type="button" data-action="drawer-close" aria-label="Close tracker" class="btn-close">' + ui.icon('X', 'ic-20') + '</button></div>' +
        '<div id="tracker-drawer-body">' + renderTrackerList() + '</div></div>';
    }
    html += '</div>';
    return html;
  }

  function rerenderTrackerSheet() {
    const slot = document.getElementById('tracker-sheet-slot');
    if (slot) slot.innerHTML = renderTrackerSheet();
  }

  // ────────────────────────── examination (quiz) ──────────────────────────

  function renderExamination() {
    const state = store.state;
    const mode = state.mode;
    if (!mode) return '';
    const items = H.quizItems(mode);
    const answered = items.filter(function (q) { return state.quizAnswers[q.id] !== undefined; }).length;
    const correct = items.filter(function (q) { return state.quizAnswers[q.id] === q.correct; }).length;

    let html = '<section id="examination" aria-labelledby="exam-h" class="paper-card exam-anchor">' +
      '<header class="station-head"><span class="station-no">STATION 06</span>' +
      '<h2 id="exam-h" class="h2 h2--dark">Examination papers</h2>' +
      '<span class="station-sub">' + (mode === 'medium' ? 'Concept papers — answer, submit, learn' : 'Scenario papers — application only') + '</span></header>';
    html += '<div class="paper-body">';
    html += '<p class="station-intro">' + items.length + ' questions for the certification file. Answer every paper, then submit for marking — each returned paper carries an examiner&#39;s explanation.</p>';
    html += '<ol class="quiz-list">' + items.map(function (q, i) {
      const chosen = state.quizAnswers[q.id];
      const isDone = state.quizDone;
      const right = chosen === q.correct;
      let li = '<li class="quiz-item"><div class="quiz-head">' +
        '<span class="quiz-no">' + (i + 1) + '</span>' +
        '<p class="quiz-prompt">' + ui.esc(q.prompt) + '</p>';
      if (isDone) {
        li += right ? ui.icon('CircleCheck', 'ic-24 green') : ui.icon('XCircle', 'ic-24 red');
      }
      li += '</div><div class="quiz-options">';
      q.options.forEach(function (opt, oi) {
        const chosenThis = chosen === oi;
        // R3 color contract (parity): after marking, ONLY the selected answer is
        // colored — green when correct, red when wrong. The correct option is
        // never revealed in green on a wrong submission.
        let cls = 'quiz-opt';
        if (isDone) {
          if (chosenThis && right) cls = 'quiz-opt quiz-opt--marked-right';
          else if (chosenThis) cls = 'quiz-opt quiz-opt--marked-wrong';
          else cls = 'quiz-opt quiz-opt--marked-out';
        } else if (chosenThis) {
          cls = 'quiz-opt quiz-opt--chosen';
        }
        li += '<button type="button" data-action="quiz-answer" data-qid="' + q.id + '" data-idx="' + oi + '"' +
          (isDone ? ' disabled' : '') + ' aria-pressed="' + chosenThis + '"' +
          ' data-focus-key="q-' + q.id + '-' + oi + '" class="' + cls + '">' + ui.esc(opt) + '</button>';
      });
      li += '</div>';
      if (isDone) {
        li += '<p class="examiner-note ' + (right ? 'examiner-note--right' : '') + '"><strong class="examiner-cap">Examiner&#39;s note — </strong>' + ui.esc(q.explanation) + '</p>';
      }
      li += '</li>';
      return li;
    }).join('') + '</ol>';

    if (!state.quizDone) {
      html += '<div class="quiz-submit-row"><button type="button" data-action="quiz-submit"' +
        (answered < items.length ? ' disabled' : '') + ' class="btn-stamp btn-submit' + (answered < items.length ? ' btn-stamp--disabled' : '') + '">' +
        ui.icon('PenLine', 'ic-16') + '<span>Submit for marking (' + answered + '/' + items.length + ')</span></button></div>';
    } else {
      html += '<p role="status" class="quiz-marked">' + ui.icon('ScrollText', 'ic-20') + ' Marked: ' + correct + '/' + items.length + ' correct</p>';
    }
    html += '</div></section>';
    return html;
  }

  function rerenderExamination() {
    const slot = document.getElementById('examination');
    if (!slot) return;
    const hadFocusKey = slot.contains(document.activeElement)
      ? (document.activeElement.getAttribute('data-focus-key') || null) : null;
    slot.innerHTML = renderExamination();
    if (hadFocusKey) {
      const again = slot.querySelector('[data-focus-key="' + hadFocusKey + '"]');
      if (again) again.focus();
    }
  }

  // ────────────────────────── debrief / field notes ──────────────────────────

  const DETECTION = [
    { src: 'Authentication / IdP logs', logic: 'Alert on interactive logons by non-human identities (service accounts) and on LDAP binds to ports 389/3268 without TLS — both should simply never occur.' },
    { src: 'OAuth/OIDC consent records', logic: 'Alert on consent grants to unverified publishers or scopes beyond mail.read (write scope, directory-wide). Trend new-consent volume per app.' },
    { src: 'Entitlement / HR feed diff', logic: 'Nightly joiner-mover-leaver diff: any entitlement surviving 30 days past a role change or departure = orphan/creep candidate for the review queue.' },
    { src: 'Credential metadata', logic: 'Age, reuse and vault-outside sightings of privileged and service credentials; LAPS rotation failures and dormant-but-enabled admin accounts.' },
  ];
  const MITIGATIONS = [
    'MFA with phishing-resistant passkeys/FIDO2 for privileged users; TOTP baseline for the workforce (M1032).',
    'Vault + JIT elevation; eliminate standing admin sessions; rotate local admin passwords with Windows LAPS (M1026).',
    'Account use policies: no interactive logon for service identities, block legacy auth, LDAPS/StartTLS only (M1036).',
    'Password managers + rotation policy for shared service credentials; secrets belong in the vault, never in scripts (M1027).',
    'Quarterly access reviews / recertification with joiner-mover-leaver automation via SCIM (M1047).',
  ];

  function renderDebrief() {
    let html = '<section id="findings" aria-labelledby="debrief-h" class="paper-card findings-anchor">' +
      '<header class="station-head"><span class="station-no">STATION 07</span>' +
      '<h2 id="debrief-h" class="h2 h2--dark">Audit findings &amp; field notes</h2>' +
      '<span class="station-sub">What the bureau stamps into your notebook</span></header>';
    html += '<div class="debrief-grid">';

    html += '<div class="panel-card"><h3 class="h3">' + ui.icon('ScanEye', 'ic-20 amber') + ' Detection opportunities</h3><ul class="detect-list">' +
      DETECTION.map(function (d) {
        return '<li class="detect-item"><p class="detect-src">' + ui.esc(d.src) + '</p><p class="detect-logic">' + ui.esc(d.logic) + '</p></li>';
      }).join('') + '</ul></div>';

    html += '<div class="panel-card"><h3 class="h3">' + ui.icon('ShieldAlert', 'ic-20 amber') + ' Mitigation recommendations</h3><ul class="mit-list">' +
      MITIGATIONS.map(function (m) { return '<li>' + ui.icon('Eye', 'ic-16 amber') + '<span>' + ui.esc(m) + '</span></li>'; }).join('') + '</ul>' +
      '<h4 class="refs-cap">Official mitigation references (opens in new tab)</h4><ul class="refs-row">' +
      D.MITREM.map(function (m) {
        return '<li><a href="' + m.url + '" target="_blank" rel="noopener noreferrer" class="ref-chip">' + m.id + ' ' + ui.esc(m.name) + ' ' + ui.icon('ExternalLink', 'ic-12') + '</a></li>';
      }).join('') + '</ul></div>';

    html += '<div class="panel-card panel-card--dark"><h3 class="h3">' + ui.icon('Gavel', 'ic-20 gold') + ' Blue-team takeaways</h3>' +
      '<ul class="takeaway-list">' +
      '<li>&bull; Inventory every identity type first — user, service, third-party, break-glass — because controls only make sense per type.</li>' +
      '<li>&bull; The lifecycle is a control chain: proof → provision → move-revoke → deprovision. One broken link orphans an account.</li>' +
      '<li>&bull; OAuth is authorization: treat consent screens, scopes and unverified publishers as first-class telemetry.</li>' +
      '<li>&bull; Recertify ruthlessly; unused privileged access is a standing door you forgot you owned.</li></ul></div>';

    html += '<div class="panel-card panel-card--dark"><h3 class="h3">' + ui.icon('Swords', 'ic-20 gold') + ' Red-team mindset (defensive awareness)</h3>' +
      '<ul class="takeaway-list">' +
      '<li>&bull; Why attackers love this area: no exploit needed — a valid account is a valid seat at the table (related: <a class="plain-link" target="_blank" rel="noopener noreferrer" href="https://attack.mitre.org/techniques/T1078/">T1078</a>).</li>' +
      '<li>&bull; One consent click with over-broad scopes = mailbox access without touching a password ( OAuth consent phishing).</li>' +
      '<li>&bull; Cleartext secrets in scripts are the quietest persistence there is — rotate and they come back on next deploy unless vaulted.</li>' +
      '<li>&bull; Standing global admin turns any single foothold into tenant takeover; ' + ui.term('JIT', 'JIT') + ' shrinks the window they plan around.</li></ul>' +
      '<h4 class="refs-cap refs-cap--dark">Related technique references</h4><ul class="refs-row">' +
      D.MITREF.map(function (m) {
        return '<li><a href="' + m.url + '" target="_blank" rel="noopener noreferrer" class="ref-chip ref-chip--dark">' + m.id + ' ' + ui.esc(m.name) + ' ' + ui.icon('ExternalLink', 'ic-12') + '</a></li>';
      }).join('') + '</ul></div>';

    html += '</div>';
    html += '<div class="debrief-foot"><p class="debrief-sources">Official sources: <a class="source-link" target="_blank" rel="noopener noreferrer" href="https://www.comptia.org/en-us/certifications/security/">CompTIA Security+ certification page</a> — the lab&#39;s SY0-801 objective 4.5 scope follows the published V8 exam objectives. All MITRE links open the official ATT&amp;CK pages.</p>' +
      '<button type="button" data-action="reopen-review" class="btn-ghost-amber">Re-open case review</button></div>';
    html += '</section>';
    return html;
  }

  // ────────────────────────── completion modal ──────────────────────────

  function renderFocusAreas() {
    const state = store.state;
    const mode = state.mode;
    if (!mode) return '';
    const retryTopics = OBJ.objectivesFor(mode)
      .filter(function (o) {
        const st = state.objState[o.id];
        return st && st.passed && (st.attempts > 1 || st.hints > 0);
      })
      .map(function (o) { return o.title + ' — re-stamp it from memory in the other mode (' + o.station + ' desk)'; });
    const items = H.quizItems(mode);
    const missed = state.quizDone
      ? items.filter(function (it) { return state.quizAnswers[it.id] !== it.correct; }) : [];
    const quizTopics = Array.from(new Set(missed.map(function (it) { return it.topic; })));

    if (retryTopics.length === 0 && quizTopics.length === 0) {
      return '<div class="focus-clean"><p class="focus-cap">Focus areas — from your case evidence</p>' +
        '<p>Clean first pass: every work order closed on the first stamp, no hints taken, examination fully correct. Keep it sharp by re-running the desk in the other mode and explaining each decision aloud before stamping.</p></div>';
    }
    return '<div class="focus-warn"><p class="focus-cap focus-cap--warn">Focus areas — from your case evidence (retries, hints, missed exam items)</p>' +
      '<ul class="focus-list">' +
      retryTopics.map(function (t) { return '<li>' + ui.icon('FileBadge', 'ic-16') + ' ' + ui.esc(t) + '</li>'; }).join('') +
      quizTopics.map(function (t) { return '<li>' + ui.icon('BookOpen', 'ic-16') + ' ' + ui.esc(t) + ' — re-read the Training folio section and redo the matching work order</li>'; }).join('') +
      '</ul></div>';
  }

  function renderCompletionModal() {
    const state = store.state;
    const mode = state.mode;
    if (!mode || !modalOpen) return '';
    const s = H.stars(mode, state.objState, state.quizAnswers, true);
    const p = H.progress(mode, state.objState);
    const q = H.quizItems(mode);
    const qCorrect = q.filter(function (item) { return state.quizAnswers[item.id] === item.correct; }).length;

    let html = '<div class="modal-overlay" data-action="modal-backdrop">' +
      '<div role="dialog" aria-modal="true" aria-label="Case completion review" class="modal">' +
      '<div class="modal-head"><div class="modal-title-row">' +
      '<span class="closed-seal">closed</span><div>' +
      '<h2 class="modal-title">Case ' + D.CASE_NO + ' cleared</h2>' +
      '<p class="modal-sub">The identity audit file is ready for the certification binder.</p></div></div>' +
      '<button type="button" data-action="modal-close" aria-label="Close completion review" class="btn-close">' + ui.icon('X', 'ic-20') + '</button></div>';

    html += '<div class="stars-row" aria-label="Star rating: ' + s + ' of 5">' +
      [1, 2, 3, 4, 5].map(function (i) {
        return '<span class="star ' + (i <= s ? 'star--on' : '') + '">' + ui.icon('Star', 'ic-28') + '</span>';
      }).join('') +
      '<span class="stars-cap">' + s + '/5 stars · first-attempt accuracy &amp; hint discipline</span></div>';

    html += '<div class="stat-grid">' +
      '<div class="stat-card"><p class="rail-cap-mono">Work orders</p><p class="stat-big">' + p.done + '/' + p.total + '</p></div>' +
      '<div class="stat-card"><p class="rail-cap-mono">Examination</p><p class="stat-big">' + qCorrect + '/' + q.length + '</p></div></div>';

    html += '<div class="recap-card"><p class="rail-cap-mono">Mastery recap by pillar</p><ul class="recap-list">' +
      '<li>' + ui.icon('CircleCheck', 'ic-16 amber') + ' Understand — account types, lifecycle, factors, SAML mechanics</li>' +
      '<li>' + ui.icon('CircleCheck', 'ic-16 amber') + ' Recognize — real violations in logs, scripts and consent screens</li>' +
      '<li>' + ui.icon('CircleCheck', 'ic-16 amber') + ' Detect/Apply — recertification, access models, protocol choice</li>' +
      '<li>' + ui.icon('CircleCheck', 'ic-16 amber') + ' Mitigate — MFA policy, PAM vault, least privilege &amp; SoD rulings</li></ul></div>';

    html += renderFocusAreas();

    html += '<div class="syllabus-note"><strong class="syllabus-cap">Next on the syllabus:</strong> Zero Trust architecture &amp; network access control (SY0-801 Domain 3/4), then incident response (4.7). Re-run the desk in the other mode — the evidence will not be the same experience.</div>';

    html += '<button type="button" data-action="modal-close" class="btn-stamp btn-submit btn-block">' +
      ui.icon('Award', 'ic-16') + '<span>Back to the file</span></button>';

    html += '</div></div>';
    return html;
  }

  function rerenderModal() {
    const slot = document.getElementById('completion-slot');
    if (slot) slot.innerHTML = renderCompletionModal();
    if (modalOpen) {
      const btn = slot.querySelector('[data-action="modal-close"]');
      if (btn) btn.focus();
    }
  }

  function checkCompletion() {
    const state = store.state;
    if (!state.mode) return;
    const complete = H.allPassed(state.mode, state.objState) && state.quizDone;
    if (complete && !state.completedShown && !pendingModalTimer && !modalOpen) {
      pendingModalTimer = setTimeout(function () {
        pendingModalTimer = null;
        if (!store.state.completedShown) { modalOpen = true; rerenderModal(); }
      }, 600);
    }
  }

  function closeDone() {
    modalOpen = false;
    rerenderModal();
    store.markCompletedShown();
  }

  // ────────────────────────── full render / re-render ──────────────────────────

  function renderAll() {
    const state = store.state;
    const railSlot = document.getElementById('desk-rail-slot');
    railSlot.innerHTML = state.mode ? renderDeskRail() : '';
    const main = document.getElementById('main-area');
    if (!state.mode) {
      main.innerHTML = renderModeSelect();
    } else {
      main.innerHTML = renderLab();
      for (const id of ORDER) {
        const body = main.querySelector('[data-station-body="' + id + '"]');
        body.innerHTML = S.renderStation(id);
      }
      document.getElementById('tracker-rail-body').innerHTML = renderTrackerList();
      document.getElementById('examination').innerHTML = renderExamination();
      document.getElementById('findings').innerHTML = renderDebrief();
      updateDeskCount();
    }
    rerenderTrackerSheet();
    rerenderModal();
    updateHighlight();
  }

  // ────────────────────────── delegated event handling ──────────────────────────

  function setNested(obj, key, val) { obj[key] = val; return obj; }

  function handleAction(el, ev) {
    const action = el.getAttribute('data-action');
    const id = el.getAttribute('data-id');
    const state = store.state;

    switch (action) {
      // shell
      case 'mode-select': store.setMode(id); return;
      case 'jump': jumpTo(id); return;
      case 'scroll-exam': scrollToSection('examination'); return;
      case 'scroll-findings': scrollToSection('findings'); return;
      case 'reset-open': resetConfirmOpen = true;
        document.getElementById('reset-confirm').classList.remove('hidden'); return;
      case 'reset-cancel': resetConfirmOpen = false;
        document.getElementById('reset-confirm').classList.add('hidden'); return;
      case 'reset-confirm':
        resetConfirmOpen = false;
        modalOpen = false;
        hintForTracker = null;
        drawerOpen = false;
        store.hardReset();
        return;

      // knowledge folio
      case 'knowledge-toggle-all': {
        const items = document.querySelectorAll('.folio-item');
        const anyClosed = Array.prototype.some.call(items, function (d) { return !d.open; });
        items.forEach(function (d) { d.open = anyClosed; });
        el.textContent = anyClosed ? 'Fold all' : 'Unfold all';
        return;
      }

      // intake
      case 'dossier-toggle': {
        S.openDossierId = S.openDossierId === id ? null : id;
        const body = document.querySelector('[data-station-body="intake"]');
        body.innerHTML = S.renderStation('intake');
        const head = body.querySelector('[data-dossier="' + id + '"] .dossier-head');
        if (head) head.focus();
        return;
      }
      case 'dossier-class':
        store.patchEnv(function (e) { return { dossier: setNested(Object.assign({}, e.dossier), id, el.value) }; });
        return;
      case 'dossier-risk':
        store.patchEnv(function (e) { return { dossierRisky: toggleInArr(e.dossierRisky, id) }; });
        return;

      // order rails are handled directly in the click dispatcher above

      // objective blocks
      case 'stamp': store.checkObjective(id); return;
      case 'hint': store.revealHint(id); return;
      case 'tracker-hint': hintForTracker = id; store.revealHint(id); return;
      case 'tracker-jump': {
        drawerOpen = false;
        rerenderTrackerSheet();
        jumpTo(id);
        return;
      }

      // vault
      case 'vault-switch': {
        const key = id;
        store.patchEnv(function (e) {
          const v = Object.assign({}, e.vault); v[key] = !v[key];
          return { vault: v };
        });
        S.refreshVaultSwitch(el);
        return;
      }
      case 'laps-select':
        store.patchEnv(function (e) { return { vault: Object.assign({}, e.vault, { laps: el.value }) }; });
        return;
      case 'postbg-select': store.patchEnv({ postBg: el.value }); return;
      case 'factor': {
        const parts = id.split(':');
        store.patchEnv(function (e) { return { factors: setNested(Object.assign({}, e.factors), parts[0], parts[1]) }; });
        S.refreshFactorGroup(el);
        return;
      }
      case 'mfa-pair':
        store.patchEnv(function (e) { return { mfaPairs: toggleInArr(e.mfaPairs, id) }; });
        S.refreshTickRow(el, true);
        return;
      case 'mfa-policy':
        store.patchEnv(function (e) { return { mfaPolicy: toggleInArr(e.mfaPolicy, id) }; });
        S.refreshTickRow(el, true);
        return;

      // evidence
      case 'violation':
        store.patchEnv(function (e) { return { violations: toggleInArr(e.violations, id) }; });
        S.refreshTickRow(el, false);
        return;
      case 'finding':
        store.patchEnv(function (e) { return { findings: toggleInArr(e.findings, id) }; });
        S.refreshTickRow(el, false);
        return;

      // protocol desk
      case 'oauth-select':
        store.patchEnv(function (e) { return { oauth: setNested(Object.assign({}, e.oauth), id, el.value) }; });
        return;
      case 'fed-select':
        store.patchEnv(function (e) { return { fed: setNested(Object.assign({}, e.fed), id, el.value) }; });
        return;
      case 'protocol-pick': {
        const parts = id.split(':');
        store.patchEnv(function (e) { return { protocolPicks: setNested(Object.assign({}, e.protocolPicks), parts[0], parts[1]) }; });
        S.refreshChoiceGroup(el);
        return;
      }

      // review board
      case 'review-verdict':
        store.patchEnv(function (e) { return { review: setNested(Object.assign({}, e.review), id, el.value) }; });
        return;
      case 'model-pick': {
        const parts = id.split(':');
        store.patchEnv(function (e) { return { models: setNested(Object.assign({}, e.models), parts[0], parts[1]) }; });
        S.refreshChoiceGroup(el);
        return;
      }
      case 'request-pick': {
        const parts = id.split(':');
        store.patchEnv(function (e) { return { requests: setNested(Object.assign({}, e.requests), parts[0], parts[1]) }; });
        S.refreshChoiceGroup(el);
        return;
      }
      case 'chain-select':
        store.patchEnv(function (e) { return { chain: setNested(Object.assign({}, e.chain), id, el.value) }; });
        return;
      case 'best-pick': {
        const parts = id.split(':');
        store.patchEnv(function (e) { return { best: setNested(Object.assign({}, e.best), parts[0], parts[1]) }; });
        S.refreshChoiceGroup(el);
        return;
      }

      // quiz
      case 'quiz-answer': store.answerQuiz(el.getAttribute('data-qid'), Number(el.getAttribute('data-idx'))); return;
      case 'quiz-submit': store.finishQuiz(); return;

      // modal / debrief / drawer
      case 'modal-close': closeDone(); return;
      case 'modal-backdrop': closeDone(); return;
      case 'reopen-review': modalOpen = true; rerenderModal(); return;
      case 'drawer-open': drawerOpen = true; rerenderTrackerSheet();
        { const c = document.getElementById('tracker-drawer').querySelector('[data-action="drawer-close"]'); if (c) c.focus(); }
        return;
      case 'drawer-close': drawerOpen = false; rerenderTrackerSheet(); return;
      case 'drawer-backdrop': drawerOpen = false; rerenderTrackerSheet(); return;
    }
  }

  function toggleInArr(arr, id) {
    return arr.includes(id) ? arr.filter(function (x) { return x !== id; }) : arr.concat([id]);
  }

  // order rails share one generic pair of actions with the id on a data attr
  document.addEventListener('click', function (ev) {
    const el = ev.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const action = el.getAttribute('data-action');

    // order rails: pick / remove
    if (action === 'order-pick' || action === 'order-remove') {
      const kind = el.getAttribute('data-kind');
      const item = el.getAttribute('data-id');
      if (action === 'order-pick') {
        store.patchEnv(function (e) {
          if (kind === 'lifecycle') return { lifecycle: e.lifecycle.concat([item]) };
          if (kind === 'saml') return { saml: e.saml.concat([item]) };
          return { rollout: e.rollout.concat([item]) };
        });
      } else {
        store.patchEnv(function (e) {
          if (kind === 'lifecycle') return { lifecycle: e.lifecycle.filter(function (x) { return x !== item; }) };
          if (kind === 'saml') return { saml: e.saml.filter(function (x) { return x !== item; }) };
          return { rollout: e.rollout.filter(function (x) { return x !== item; }) };
        });
      }
      S.updateRail(kind);
      return;
    }

    handleAction(el, ev);
  });

  // change events (selects, checkboxes)
  document.addEventListener('change', function (ev) {
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    handleAction(el, ev);
  });

  // glossary term tooltips: hover opens, leave closes, click pins, ESC/outside closes
  function openTerm(termEl) {
    if (termEl.querySelector('.term-tip')) return;
    const def = D.GLOSSARY[termEl.getAttribute('data-term')];
    if (!def) return;
    termEl.insertAdjacentHTML('beforeend', ui.termTooltipHtml(def));
    termEl.querySelector('.term-btn').setAttribute('aria-expanded', 'true');
  }
  function closeTerm(termEl) {
    const tip = termEl.querySelector('.term-tip');
    if (tip) tip.remove();
    termEl.querySelector('.term-btn').setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('mouseover', function (ev) {
    const termEl = ev.target.closest('[data-term-root]');
    if (termEl) openTerm(termEl);
  });
  document.addEventListener('mouseout', function (ev) {
    const termEl = ev.target.closest('[data-term-root]');
    if (termEl && !(ev.relatedTarget && termEl.contains(ev.relatedTarget))) closeTerm(termEl);
  });
  document.addEventListener('click', function (ev) {
    const termEl = ev.target.closest('[data-term-root]');
    if (termEl) {
      // click toggles a pinned tooltip; hover tooltip already present is kept
      if (pinnedTerm === termEl) { pinnedTerm = null; closeTerm(termEl); }
      else { pinnedTerm = termEl; openTerm(termEl); }
    } else if (pinnedTerm) {
      closeTerm(pinnedTerm);
      pinnedTerm = null;
    }
  }, true); // capture: runs before the action dispatcher

  // ESC behavior: modal > reset confirm > drawer > pinned terms (parity with R7)
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    if (modalOpen) { closeDone(); return; }
    if (resetConfirmOpen) { resetConfirmOpen = false; document.getElementById('reset-confirm').classList.add('hidden'); return; }
    if (drawerOpen) { drawerOpen = false; rerenderTrackerSheet(); return; }
    document.querySelectorAll('[data-term-root]').forEach(closeTerm);
    pinnedTerm = null;
  });

  // ────────────────────────── store subscription ──────────────────────────

  store.subscribe(function (state, keys) {
    if (keys.includes('mode')) { renderAll(); return; }
    if (keys.includes('objState') || keys.includes('feedback')) {
      S.updateAllObjBlocks();
      updateTrackers();
      checkCompletion();
    }
    if (keys.includes('quizAnswers') || keys.includes('quizDone')) {
      rerenderExamination();
      checkCompletion();
    }
    if (keys.includes('highlight')) updateHighlight();
  });

  // ────────────────────────── boot ──────────────────────────

  store.restore();
  renderAll();
})(typeof window !== 'undefined' ? window : globalThis);
