// ─────────────────────────────────────────────────────────────────────────────
// THE SWITCH YARD — js/views.js
// Static-section views: mode select (C0), briefing (C1), rulebook (C2),
// safety review / debrief (C6) and the completion recap (C7 modal body).
// Ported 1:1 from the framework lab's sections.tsx.
// ─────────────────────────────────────────────────────────────────────────────
(function (LAB) {
  'use strict';

  // ── Mode select ──────────────────────────────────────────────────────────────
  LAB.modeSelect = function () {
    return '<div class="mode-select">' +
      LAB.hazardStripe('hazard-stripe--rounded-top') +
      '<div class="mode-card-shell">' +
      '<p class="kicker">CompTIA Cloud+ CV0-004 · Domain 5.0 DevOps Fundamentals (10%)</p>' +
      '<h1 class="mode-title">THE SWITCH YARD</h1>' +
      '<p class="mode-sub">Source control — managing code with source control techniques. A hands-on practice yard for commits, branches, merges, reviews and the hazmat hiding in history.</p>' +
      '<h2 class="choose-heading">Choose your shift</h2>' +
      '<div class="mode-grid">' +
      '<button type="button" data-action="pick-mode" data-arg="medium" data-fid="mode-medium" class="mode-card mode-card--medium">' +
      '<p class="mode-card-title mode-card-title--amber">' + LAB.icon('warehouse', 'icn-sm') + ' YARDMASTER · Medium</p>' +
      '<p class="mode-card-body">Guided learning shift. 12 step-by-step objectives across all four skills pillars, 3-tier hints on tap, tolerant checking, and a concept exam after practice. You will be told where to look.</p>' +
      '<p class="mode-card-meta mode-card-meta--amber">≈ 30–45 min · Understand &amp; Apply (Bloom)</p>' +
      '</button>' +
      '<button type="button" data-action="pick-mode" data-arg="hard" data-fid="mode-hard" class="mode-card mode-card--hard">' +
      '<p class="mode-card-title mode-card-title--rose">' + LAB.icon('triangle-alert', 'icn-sm') + ' DISPATCHER · Hard</p>' +
      '<p class="mode-card-body">Night shift with noisy evidence: decoy keys, red-herring commits, a messy audit trail. 9 broad multi-step challenges, ONE nudge allowed, strict validation, scenario exam. Nobody tells you where to look.</p>' +
      '<p class="mode-card-meta mode-card-meta--rose">≈ 40–60 min · Analyze, Evaluate &amp; Create (Bloom)</p>' +
      '</button>' +
      '</div>' +
      '<p class="mode-disclaimer">FICTIONAL TRAINING SCENARIO — NimbusFreight Logistics, its keys, logs and people are synthetic. Defensive/educational purpose only. Progress auto-saves in your browser; a RESET restores the pristine yard.</p>' +
      '</div></div>';
  };

  // ── Briefing (C1) ────────────────────────────────────────────────────────────
  LAB.views = LAB.views || {};

  LAB.views.briefing = function (st) {
    var B = LAB.BRIEFING;
    var modeNote = st.mode === 'medium'
      ? 'YARDMASTER shift: follow the dispatch board top to bottom — each objective tells you where to look. Hints cost a star, never progress.'
      : 'DISPATCHER shift: the board gives broad challenges only. No where-to-look chips. ONE nudge per objective, and it costs score.';
    return '<div class="narrow-view">' +
      LAB.hazardStripe('hazard-stripe--rounded-top') +
      '<div class="briefing-shell">' +
      '<p class="kicker">Stationmaster’s briefing · ' + LAB.esc(B.org) + '</p>' +
      '<h2 class="briefing-headline">' + LAB.esc(B.headline) + '</h2>' +
      '<div class="briefing-paras">' + B.paragraphs.map(function (p) { return '<p>' + LAB.esc(p) + '</p>'; }).join('') + '</div>' +
      '<div class="how-box">' +
      '<p class="how-title">How this yard works</p>' +
      '<p class="how-line">RULEBOOK = the theory plates. YARD = the live depot: a simulated repository with a file workbench, commit graph, history, desks for branching, governance and detection, and your objective dispatch board on the left. EXAM = the knowledge check. SAFETY REVIEW = debrief and further reading. Everything auto-saves; use RESET (top right) for a pristine yard.</p>' +
      '<p class="how-line">' + LAB.esc(modeNote) + '</p>' +
      '</div>' +
      '<p class="fineprint">' + LAB.esc(B.label) + '</p>' +
      '</div></div>';
  };

  // ── Rulebook / Knowledge Core (C2) with M1 depot registry ───────────────────
  LAB.views.rulebook = function (st) {
    var html = '<div class="narrow-view">';
    LAB.RULEBOOK_SECTIONS.forEach(function (s) {
      html += LAB.panel(s.title, LAB.icon('book-open-text', 'icn-xs'), '<p class="body-text">' + LAB.esc(s.body) + '</p>');
    });

    // depot registry (OBJ-M1)
    var cards = LAB.DEPOT_CARDS.map(function (d, di) {
      var key = di === 0 ? 'northgate' : 'southside';
      var radios = ['centralized', 'distributed'].map(function (opt) {
        return '<label class="radio-row">' +
          '<input type="radio" name="depot-' + LAB.esc(d.name) + '" value="' + opt + '" ' + (st.registryAnswers[key] === opt ? 'checked' : '') + ' data-change="registry" data-arg="' + key + '" />' +
          opt + '</label>';
      }).join('');
      return '<div class="depot-card">' +
        '<p class="depot-name">' + LAB.esc(d.name) + '</p>' +
        '<p class="depot-sub">' + LAB.esc(d.sub) + '</p>' +
        '<ul class="depot-points">' + d.points.map(function (pt) { return '<li>· ' + LAB.esc(pt) + '</li>'; }).join('') + '</ul>' +
        '<fieldset class="depot-fieldset"><legend class="depot-legend">Classification</legend>' +
        '<div class="row-3">' + radios + '</div></fieldset>' +
        '<p class="fineprint mt-1">Answer both, then check OBJ-M1 on the dispatch board.</p>' +
        '</div>';
    }).join('');
    html += LAB.panel('Depot registry — classify the two models (OBJ-M1)', LAB.icon('warehouse', 'icn-xs'), '<div class="grid-2">' + cards + '</div>');

    // incidents in the wild
    html += LAB.panel('The hazmat is real: incidents in the wild (simplified)', LAB.icon('triangle-alert', 'icn-xs'),
      '<ul class="stack-2 body-list">' +
      LAB.INCIDENTS_REAL.map(function (inc) {
        return '<li><strong class="text-bad-strong">' + LAB.esc(inc.title) + '</strong> — ' + LAB.esc(inc.text) + '</li>';
      }).join('') +
      '</ul>' +
      '<p class="fineprint mt-2">Pattern to remember: one credential in one commit → org-wide exposure. Simplified public reports; details intentionally generalized for training.</p>', 'alert');

    // MITRE anchors
    html += LAB.panel('MITRE ATT&CK anchors for this lesson', LAB.icon('shield-half', 'icn-xs'),
      '<ul class="stack-1 body-list">' +
      '<li><span class="mono mitre">T1552.001</span> — Unsecured Credentials: Credentials In Files (Credential Access): secrets committed to repos are credentials sitting in files that every clone copies.</li>' +
      '<li><span class="mono mitre">T1195.002</span> — Compromise Software Supply Chain (Initial Access): whoever corrupts the repo lineage corrupts everything built from it — why reviews + branch protection exist.</li>' +
      '</ul>');

    // glossary
    html += LAB.panel('Glossary — yard vocabulary', LAB.icon('book-open-text', 'icn-xs'),
      '<dl class="stack-2">' +
      LAB.GLOSSARY.map(function (g) {
        return '<div class="gloss-card"><dt class="gloss-term">' + LAB.esc(g.term) + '</dt><dd class="gloss-def">' + LAB.esc(g.def) + '</dd></div>';
      }).join('') +
      '</dl>');

    html += '</div>';
    return html;
  };

  // ── Safety Review / Debrief (C6) ─────────────────────────────────────────────
  LAB.views.safety = function () {
    return '<div class="narrow-view">' +
      LAB.panel('Detection opportunities — where this shows up in telemetry', LAB.icon('radio', 'icn-xs'),
        '<ul class="stack-2 body-list">' +
        LAB.DEBRIEF.detections.map(function (d) {
          return '<li><strong class="text-amber-strong">' + LAB.esc(d.src) + '</strong> — ' + LAB.esc(d.use) + '</li>';
        }).join('') + '</ul>') +
      LAB.panel('Mitigation recommendations', LAB.icon('shield-half', 'icn-xs'),
        '<ul class="stack-2 body-list">' +
        LAB.DEBRIEF.mitigations.map(function (m) {
          return '<li><strong class="text-ok-strong">' + LAB.esc(m.id) + '</strong> — ' + LAB.esc(m.text) + '</li>';
        }).join('') + '</ul>') +
      '<div class="grid-2">' +
      LAB.panel('Blue-team takeaways', LAB.icon('check-circle-2', 'icn-xs'),
        '<ul class="stack-1 body-list">' + LAB.DEBRIEF.blue.map(function (b) { return '<li>· ' + LAB.esc(b) + '</li>'; }).join('') + '</ul>', 'ok') +
      LAB.panel('Red-team mindset (defensive)', LAB.icon('triangle-alert', 'icn-xs'),
        '<ul class="stack-1 body-list">' + LAB.DEBRIEF.red.map(function (b) { return '<li>· ' + LAB.esc(b) + '</li>'; }).join('') + '</ul>', 'alert') +
      '</div>' +
      LAB.panel('What to learn next', LAB.icon('trophy', 'icn-xs'),
        '<ul class="stack-1 body-list">' + LAB.DEBRIEF.next.map(function (n) { return '<li>· ' + LAB.esc(n) + '</li>'; }).join('') + '</ul>') +
      LAB.panel('Official references', LAB.icon('external-link', 'icn-xs'),
        '<ul class="stack-1 body-list">' +
        LAB.LINKS.map(function (l) {
          return '<li><a href="' + LAB.esc(l.url) + '" target="_blank" rel="noopener noreferrer" class="ref-link">' + LAB.esc(l.label) + LAB.icon('external-link', 'icn-xs') + '</a></li>';
        }).join('') + '</ul>') +
      '</div>';
  };

  // ── Completion recap (C7 modal body) ─────────────────────────────────────────
  // Audit R8: focus areas derived from the student's actual performance.
  function computeFocusAreas(state, mode) {
    var objectives = mode === 'medium' ? LAB.OBJECTIVES_MEDIUM : LAB.OBJECTIVES_HARD;
    var items = mode === 'medium' ? LAB.QUIZ_MEDIUM : LAB.QUIZ_HARD;
    var out = [];
    objectives.forEach(function (o) {
      var p = state.objProgress[o.id];
      var anchor = o.anchor.split('—')[0].trim();
      if (!p || !p.done) {
        out.push({ title: o.title, detail: 'Still open — revisit this objective in the YARD (' + anchor + ' of the lesson scope).' });
      } else if (p.attempts > 1 || p.hintsUsed > 0) {
        out.push({ title: o.title, detail: 'Needed ' + p.attempts + ' attempt' + (p.attempts === 1 ? '' : 's') + ' and ' + p.hintsUsed + ' hint' + (p.hintsUsed === 1 ? '' : 's') + ' — re-read ' + anchor + ' in the Rulebook, then redo it mentally without hints.' });
      }
    });
    var wrong = items.filter(function (q) { return state.quiz.submitted[q.id] && state.quiz.answers[q.id] !== q.answer; });
    var unanswered = items.filter(function (q) { return !state.quiz.submitted[q.id]; });
    if (wrong.length) {
      out.push({ title: 'Exam items missed (' + wrong.length + ')', detail: 'Re-read the explanations on the EXAM tab for: ' + wrong.map(function (w) { return w.topic || w.id; }).join('; ') + '.' });
    }
    if (unanswered.length) {
      out.push({ title: 'Exam items not answered (' + unanswered.length + ')', detail: 'Finish them on the EXAM tab — each explanation is part of the lesson.' });
    }
    if (!out.length) {
      out.push({ title: 'No weak spots on record', detail: 'Every objective passed first-try and the exam was clean. For a harder pass, run the other shift mode from the start screen.' });
    }
    return out.slice(0, 6);
  }

  LAB.completionRecap = function (st, score, stars) {
    var mode = st.mode;
    var objectives = mode === 'medium' ? LAB.OBJECTIVES_MEDIUM : LAB.OBJECTIVES_HARD;
    var focusAreas = computeFocusAreas(st, mode);
    var pillars = ['P1', 'P2', 'P3', 'P4'].map(function (p) {
      return { p: p, items: objectives.filter(function (o) { return o.pillar === p; }) };
    });

    var starsLine = '';
    for (var i = 0; i < 5; i++) {
      starsLine += i < stars ? '★' : '<span class="stars-dim">★</span>';
    }

    return '<div class="recap">' +
      '<div class="recap-head">' +
      '<p class="kicker">Dispatch clearance granted</p>' +
      '<p class="recap-score">' + score + '%</p>' +
      '<p class="recap-stars" aria-label="' + stars + ' of 5 stars">' + starsLine + '</p>' +
      '<p class="recap-note">Every objective checked. You can now explain source control, recognize it in evidence, detect what leaks, and mitigate it — the full CV0-004 lesson scope.</p>' +
      '</div>' +
      '<section aria-label="Focus areas" class="focus-box">' +
      '<p class="focus-title">' + LAB.icon('crosshair', 'icn-xs') + ' Focus areas — your next study block</p>' +
      '<p class="fineprint">Derived from your own attempts, hints and exam answers in this shift.</p>' +
      '<ol class="focus-list">' +
      focusAreas.map(function (f, fi) {
        return '<li class="focus-item"><p class="focus-item-title">' + (fi + 1) + '. ' + LAB.esc(f.title) + '</p><p class="focus-item-detail">' + LAB.esc(f.detail) + '</p></li>';
      }).join('') +
      '</ol></section>' +
      '<div class="grid-2">' +
      pillars.map(function (entry) {
        return '<div class="pillar-card">' + LAB.pillarBadge(entry.p) +
          '<ul class="stack-1 pillar-list">' +
          entry.items.map(function (o) {
            var prog = st.objProgress[o.id];
            return '<li class="pillar-row"><span class="' + (prog && prog.done ? 'text-ok' : '') + '">' + LAB.esc(o.title) + '</span>' +
              (prog && prog.done ? LAB.stars(prog.stars, 'stars--tiny') : '<span class="text-dim">—</span>') + '</li>';
          }).join('') +
          '</ul></div>';
      }).join('') +
      '</div>' +
      '<div class="keep-rolling"><p class="text-amber-strong">Keep rolling</p>' +
      '<ul class="stack-1">' + LAB.DEBRIEF.next.map(function (n) { return '<li>· ' + LAB.esc(n) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="recap-reset">' +
      LAB.yardButton({ tone: 'danger', action: 'reset-lab', fid: 'modal-reset', label: 'Reset the yard (wipe progress)' }) +
      '</div></div>';
  };
})(window.LAB = window.LAB || {});
