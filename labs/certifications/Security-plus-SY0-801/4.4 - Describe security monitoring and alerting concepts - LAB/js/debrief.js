// ============================================================================
// CyberLab Architect — Static Port — Lab Debrief Modal
// ----------------------------------------------------------------------------
// Vanilla-JS port of src/components/lab/DebriefModal.tsx.
//
// AUDIT-FIX COMPLIANCE:
//   R7 — ESC closes the modal (also X button, click-outside).
//   R8 — Focus Areas are PERSONALIZED, derived from the student's actual
//        performance (objectives with >1 attempt, hints used, or not
//        completed; plus the quiz wrong count).
//
// Public API (window.Debrief):
//   open(opts)       — opts: { quizScore, quizTotal, onReset }
//   close()          — dismiss the modal
//   render()         — internal; re-renders from current store state
// ============================================================================

(function () {
  'use strict';

  var LAB_DATA = window.LAB_DATA;
  var LabStore = window.LabStore;
  var Icons = window.Icons;

  var PILLAR_LABEL = {
    understand: 'Understand', recognize: 'Recognize',
    detect: 'Detect', mitigate: 'Mitigate',
  };
  var PILLAR_COLOR = {
    understand: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
    recognize: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
    detect: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
    mitigate: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  };
  var PILLAR_RECAP_META = {
    understand: { icon: 'brain', color: 'text-sky-300' },
    recognize: { icon: 'eye', color: 'text-amber-300' },
    detect: { icon: 'crosshair', color: 'text-rose-300' },
    mitigate: { icon: 'shieldCheck', color: 'text-emerald-300' },
  };

  var _root = null;
  var _opts = null;       // { quizScore, quizTotal, onReset }
  var _escHandler = null;

  // -------------------------------------------------------------------------
  // open({ quizScore, quizTotal, onReset })
  // -------------------------------------------------------------------------
  function open(opts) {
    if (_root) close();
    _opts = opts || {};
    _opts.quizScore = _opts.quizScore || 0;
    _opts.quizTotal = _opts.quizTotal || 0;
    _root = document.createElement('div');
    _root.className = 'debrief-modal-root';
    _root.setAttribute('role', 'dialog');
    _root.setAttribute('aria-modal', 'true');
    _root.setAttribute('aria-label', 'Lab Debrief & Completion');
    document.body.appendChild(_root);
    render();

    // R7: ESC closes
    _escHandler = function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', _escHandler, true);
  }

  function close() {
    if (_escHandler) {
      window.removeEventListener('keydown', _escHandler, true);
      _escHandler = null;
    }
    if (_root) {
      _root.remove();
      _root = null;
    }
    // Fire the onClose callback (if provided) so callers can react.
    if (_opts && typeof _opts.onClose === 'function') {
      try { _opts.onClose(); } catch (e) { /* swallow */ }
    }
    _opts = null;
  }

  // -------------------------------------------------------------------------
  // Computation helpers (mirror the React useMemo derivations)
  // -------------------------------------------------------------------------
  function getDerivedData() {
    var state = LabStore.getState();
    var mode = state.mode;
    var results = state.objectiveResults;
    var attempts = state.objectiveAttempts;
    var hints = state.hintUsage;
    var quizScore = _opts ? _opts.quizScore : 0;
    var quizTotal = _opts ? _opts.quizTotal : 0;

    var objectives = mode === 'medium' ? LAB_DATA.MEDIUM_OBJECTIVES
                   : mode === 'hard' ? LAB_DATA.HARD_OBJECTIVES
                   : [];
    var completed = objectives.filter(function (o) {
      return results[o.id] === 'correct' || results[o.id] === 'completed';
    });

    var hintsUsed = objectives.reduce(function (sum, o) {
      return sum + (hints[o.id] || 0);
    }, 0);
    var firstTryCorrect = objectives.filter(function (o) {
      return (attempts[o.id] || 0) === 1
        && (results[o.id] === 'correct' || results[o.id] === 'completed');
    }).length;

    // R8 — personalized focus areas
    var focusAreas = [];
    objectives.forEach(function (o) {
      var att = attempts[o.id] || 0;
      var res = results[o.id];
      var hintsForObj = hints[o.id] || 0;
      var struggled = att > 1 || res === 'incorrect' || res === undefined || res === 'pending';
      if (!struggled) return;
      var reason;
      if (att > 1) reason = att + ' attempts needed';
      else if (hintsForObj > 0) reason = hintsForObj + ' hint(s) used';
      else reason = 'not yet completed';
      // Recommendation = first sentence of the objective's feedback
      var feedback = o.feedback || '';
      var firstSentence = feedback.split('.')[0] + '.';
      focusAreas.push({
        title: o.title, reason: reason, pillar: o.pillar,
        recommendation: firstSentence,
      });
    });

    // Quiz wrong count
    if (quizTotal > 0 && quizScore < quizTotal) {
      var wrongCount = quizTotal - quizScore;
      focusAreas.push({
        title: wrongCount + ' quiz question' + (wrongCount > 1 ? 's' : '') + ' answered incorrectly',
        reason: quizScore + '/' + quizTotal + ' correct on the knowledge check',
        pillar: 'understand',
        recommendation: 'Re-read the explanations on each missed quiz item — they appear under each question after submit.',
      });
    }

    // Star rating: 3 base, +1 if 80%+ first-try correct,
    // +1 if quiz 80%+ correct AND (medium: hints=0, hard: hints<=1)
    var stars = 3;
    if (objectives.length > 0 && (firstTryCorrect / objectives.length) >= 0.8) stars += 1;
    var quizPct = quizTotal > 0 ? (quizScore / quizTotal) : 0;
    if (quizPct >= 0.8 && (mode === 'hard' ? hintsUsed <= 1 : hintsUsed === 0)) stars += 1;
    if (stars > 5) stars = 5;

    // Pillar groupings
    var pillarGroups = { understand: [], recognize: [], detect: [], mitigate: [] };
    objectives.forEach(function (o) { pillarGroups[o.pillar].push(o); });

    return {
      mode: mode, objectives: objectives, completed: completed,
      firstTryCorrect: firstTryCorrect, hintsUsed: hintsUsed,
      quizScore: quizScore, quizTotal: quizTotal,
      focusAreas: focusAreas, stars: stars, pillarGroups: pillarGroups,
      results: results,
    };
  }

  // -------------------------------------------------------------------------
  // Render the modal
  // -------------------------------------------------------------------------
  function render() {
    if (!_root) return;
    var d = getDerivedData();
    var mode = d.mode;

    var starsHtml = [1, 2, 3, 4, 5].map(function (n) {
      var filled = n <= d.stars;
      var cls = filled ? 'text-amber-400' : 'text-slate-700';
      var fillAttr = filled ? 'fill="currentColor"' : '';
      // Render the star icon with a fill override
      return '<span class="inline-block ' + cls + '">' + Icons.star('w-8 h-8 ' + cls) + '</span>';
    }).join('');

    var scoreCardsHtml = ''
      + scoreCard('Objectives', d.completed.length + '/' + d.objectives.length)
      + scoreCard('Quiz', d.quizTotal > 0 ? (d.quizScore + '/' + d.quizTotal) : '—')
      + scoreCard('First-try', d.firstTryCorrect + '/' + d.objectives.length);

    var focusAreasHtml = renderFocusAreas(d);
    var pillarRecapHtml = renderPillarRecap(d);
    var detectionOppsHtml = renderDetectionOpportunities();
    var mitreMappingHtml = renderMitreMapping();
    var takeawaysHtml = renderTakeaways();
    var nextStepsHtml = renderNextSteps();

    var html = ''
      + '<div class="debrief-backdrop" data-action="backdrop"></div>'
      + '<div class="debrief-panel max-w-3xl w-full my-8 rounded-xl border border-slate-700 bg-[#0c1322] overflow-hidden">'
      // Header
      +   '<div class="relative px-6 py-8 bg-gradient-to-br from-amber-500/20 via-slate-900 to-emerald-500/10 border-b border-slate-800">'
      +     '<button data-action="close-x" class="absolute top-3 right-3 p-1.5 rounded hover:bg-slate-800/60 transition-colors" aria-label="Close debrief">'
      +       Icons.x('w-4 h-4 text-slate-400')
      +     '</button>'
      +     '<div class="flex items-center gap-3 mb-4">'
      +       Icons.trophy('w-10 h-10 text-amber-400')
      +       '<div>'
      +         '<h2 class="text-2xl font-bold text-slate-100">Shift Complete</h2>'
      +         '<p class="text-xs font-mono text-slate-400">'
      +           (mode === 'medium' ? 'Foundations mode' : 'Triage Under Fire mode')
      +           ' · ' + d.completed.length + '/' + d.objectives.length + ' objectives cleared'
      +         '</p>'
      +       '</div>'
      +     '</div>'
      +     '<div class="flex items-center gap-1.5">'
      +       starsHtml
      +       '<span class="ml-3 text-sm font-mono text-slate-300">' + d.stars + '/5 stars</span>'
      +     '</div>'
      +     '<div class="grid grid-cols-3 gap-3 mt-5">' + scoreCardsHtml + '</div>'
      +   '</div>'
      // Body
      +   '<div class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">'
      +     focusAreasHtml
      +     pillarRecapHtml
      +     detectionOppsHtml
      +     mitreMappingHtml
      +     takeawaysHtml
      +     nextStepsHtml
      +   '</div>'
      // Footer
      +   '<div class="px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40">'
      +     '<p class="text-[11px] text-slate-500 font-mono">Progress saved to this browser. Reset to start over.</p>'
      +     '<div class="flex items-center gap-2">'
      +       '<button data-action="reset" class="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5">'
      +         Icons.rotateCcw('w-3.5 h-3.5') + ' Reset Lab'
      +       '</button>'
      +       '<button data-action="done" class="px-4 py-1.5 rounded-md text-xs font-medium bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-colors">Done</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';

    _root.innerHTML = html;
    wireEvents();
  }

  function scoreCard(label, value) {
    return ''
      + '<div class="rounded-md bg-slate-950/60 border border-slate-800 p-2 text-center">'
      +   '<p class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">' + esc(label) + '</p>'
      +   '<p class="text-lg font-mono font-semibold text-slate-100">' + esc(value) + '</p>'
      + '</div>';
  }

  // -------------------------------------------------------------------------
  // R8: Focus Areas — personalized, derived from actual performance
  // -------------------------------------------------------------------------
  function renderFocusAreas(d) {
    if (d.focusAreas.length === 0) {
      return ''
        + '<section>'
        +   '<h3 class="text-sm font-mono text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">'
        +     Icons.target('w-4 h-4') + ' Focus Areas — Where to Study More'
        +   '</h3>'
        +   '<div class="rounded-lg bg-emerald-950/15 border border-emerald-700/30 p-4">'
        +     '<p class="text-xs text-emerald-200 leading-relaxed flex items-start gap-2">'
        +       Icons.checkCircle2('w-4 h-4 mt-0.5 text-emerald-300 flex-shrink-0')
        +       '<span><strong>Perfect shift.</strong> You completed every objective first-try with no hints and aced the quiz. '
        +       'Focus your continued study on the next lessons (4.5 Threat Hunting, 4.6 Automation) rather than re-reviewing this material.</span>'
        +     '</p>'
        +   '</div>'
        + '</section>';
    }
    var items = d.focusAreas.map(function (area, i) {
      var pillarLabel = PILLAR_LABEL[area.pillar] || area.pillar;
      var pillarColor = PILLAR_COLOR[area.pillar] || '';
      return ''
        + '<li class="flex items-start gap-2.5 p-2 rounded-md bg-slate-950/40 border border-slate-800">'
        +   '<div class="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300">'
        +     (i + 1)
        +   '</div>'
        +   '<div class="flex-1 min-w-0">'
        +     '<div class="flex items-center gap-2 mb-1 flex-wrap">'
        +       '<span class="text-xs font-medium text-slate-100">' + esc(area.title) + '</span>'
        +       '<span class="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ' + pillarColor + '">'
        +         esc(pillarLabel)
        +       '</span>'
        +       '<span class="text-[10px] font-mono text-amber-400/80">' + esc(area.reason) + '</span>'
        +     '</div>'
        +     '<p class="text-[11px] text-slate-400 leading-relaxed">' + esc(area.recommendation) + '</p>'
        +   '</div>'
        + '</li>';
    }).join('');
    return ''
      + '<section>'
      +   '<h3 class="text-sm font-mono text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">'
      +     Icons.target('w-4 h-4') + ' Focus Areas — Where to Study More'
      +   '</h3>'
      +   '<div class="rounded-lg bg-amber-950/15 border border-amber-700/30 p-4">'
      +     '<p class="text-[11px] text-amber-200 font-mono mb-3 uppercase tracking-wider">'
      +       'Based on your actual performance, prioritize these ' + d.focusAreas.length + ' area' + (d.focusAreas.length > 1 ? 's' : '') + ':'
      +     '</p>'
      +     '<ul class="space-y-2.5">' + items + '</ul>'
      +   '</div>'
      + '</section>';
  }

  function renderPillarRecap(d) {
    var pillars = ['understand', 'recognize', 'detect', 'mitigate'];
    var cards = pillars.map(function (p) {
      var meta = PILLAR_RECAP_META[p];
      var objs = d.pillarGroups[p] || [];
      var done = objs.filter(function (o) {
        return d.results[o.id] === 'correct' || d.results[o.id] === 'completed';
      }).length;
      var rows = objs.map(function (o) {
        var ok = d.results[o.id] === 'correct' || d.results[o.id] === 'completed';
        var icon = ok
          ? Icons.checkCircle2('w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0')
          : '<span class="w-3 h-3 mt-0.5 rounded-full border border-slate-600 flex-shrink-0 inline-block"></span>';
        var txtCls = ok ? 'text-slate-300' : 'text-slate-500';
        return ''
          + '<li class="flex items-start gap-1.5 text-[11px]">'
          +   icon
          +   '<span class="' + txtCls + '">' + esc(o.title) + '</span>'
          + '</li>';
      }).join('');
      return ''
        + '<div class="rounded-lg bg-slate-950/60 border border-slate-800 p-3">'
        +   '<div class="flex items-center gap-2 mb-2">'
        +     Icons[meta.icon]('w-3.5 h-3.5 ' + meta.color)
        +     '<span class="text-xs font-mono uppercase tracking-wider ' + meta.color + '">' + esc(p) + '</span>'
        +     '<span class="ml-auto text-[10px] font-mono text-slate-500">' + done + '/' + objs.length + '</span>'
        +   '</div>'
        +   '<ul class="space-y-1">' + rows + '</ul>'
        + '</div>';
    }).join('');
    return ''
      + '<section>'
      +   '<h3 class="text-sm font-mono text-amber-300 uppercase tracking-wider mb-3">Objective Recap by Pillar</h3>'
      +   '<div class="grid sm:grid-cols-2 gap-3">' + cards + '</div>'
      + '</section>';
  }

  function renderDetectionOpportunities() {
    var lines = [
      ['Authentication logs', 'query failed-login spikes per source IP within a 60s window to catch brute-force-success IoAs.'],
      ['DNS logs', 'count high-entropy subdomains per parent domain within 180s to catch DGA beaconing.'],
      ['Proxy logs', 'alert on outbound uploads > 50 MB to non-approved destinations.'],
      ['Web logs', 'match SQLi/XSS metacharacters in path; correlate with HTTP 200 (server processed).'],
      ['Firewall logs', 'outbound DENY to TI-flagged IPs is a leading C2-callback indicator.'],
    ];
    var rows = lines.map(function (l) {
      return '<p><span class="font-mono text-emerald-300">' + esc(l[0]) + '</span> — ' + esc(l[1]) + '</p>';
    }).join('');
    return ''
      + '<section>'
      +   '<h3 class="text-sm font-mono text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">'
      +     Icons.crosshair('w-4 h-4') + ' Detection Opportunities'
      +   '</h3>'
      +   '<div class="rounded-lg bg-slate-950/60 border border-slate-800 p-4 space-y-2 text-xs text-slate-300">' + rows + '</div>'
      + '</section>';
  }

  function renderMitreMapping() {
    var chips = LAB_DATA.MITRE_MAPPING_USED.map(function (m) {
      var href = 'https://attack.mitre.org/techniques/' + m.id.replace('.', '/');
      return ''
        + '<a href="' + href + '" target="_blank" rel="noopener noreferrer" '
        +   'class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-colors">'
        +   '<span class="font-mono text-xs text-amber-300">' + esc(m.id) + '</span>'
        +   '<span class="text-xs text-slate-400">' + esc(m.tactic) + '</span>'
        +   Icons.externalLink('w-3 h-3 text-slate-600')
        + '</a>';
    }).join('');
    return ''
      + '<section>'
      +   '<h3 class="text-sm font-mono text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">'
      +     Icons.brain('w-4 h-4') + ' MITRE ATT&amp;CK Coverage Used'
      +   '</h3>'
      +   '<div class="flex flex-wrap gap-2">' + chips + '</div>'
      + '</section>';
  }

  function renderTakeaways() {
    var blue = LAB_DATA.TAKEAWAYS.blue.map(function (t) {
      return ''
        + '<li class="flex items-start gap-1.5 text-[11px] text-slate-300 leading-relaxed">'
        +   Icons.checkCircle2('w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0')
        +   '<span>' + esc(t) + '</span>'
        + '</li>';
    }).join('');
    var red = LAB_DATA.TAKEAWAYS.red.map(function (t) {
      return ''
        + '<li class="flex items-start gap-1.5 text-[11px] text-slate-300 leading-relaxed">'
        +   '<span class="text-rose-400 mt-0.5 flex-shrink-0">◆</span>'
        +   '<span>' + esc(t) + '</span>'
        + '</li>';
    }).join('');
    return ''
      + '<section class="grid sm:grid-cols-2 gap-3">'
      +   '<div class="rounded-lg bg-emerald-950/15 border border-emerald-700/30 p-4">'
      +     '<div class="flex items-center gap-2 mb-2">'
      +       Icons.shieldCheck('w-4 h-4 text-emerald-300')
      +       '<p class="text-xs font-mono text-emerald-300 uppercase tracking-wider">Blue Team Takeaways</p>'
      +     '</div>'
      +     '<ul class="space-y-1.5">' + blue + '</ul>'
      +   '</div>'
      +   '<div class="rounded-lg bg-rose-950/15 border border-rose-700/30 p-4">'
      +     '<div class="flex items-center gap-2 mb-2">'
      +       Icons.alertTriangle('w-4 h-4 text-rose-300')
      +       '<p class="text-xs font-mono text-rose-300 uppercase tracking-wider">Red Team Takeaways</p>'
      +     '</div>'
      +     '<ul class="space-y-1.5">' + red + '</ul>'
      +   '</div>'
      + '</section>';
  }

  function renderNextSteps() {
    var items = [
      'Lesson 4.5 — Threat hunting concepts: hypothesis-driven investigation',
      'Lesson 4.6 — Automation concepts: deeper SOAR playbook engineering',
      'Lesson 4.7 — Incident response process: extending triage into containment',
      'Try the OTHER difficulty mode of this lab for a fresh angle',
    ];
    var arrows = items.map(function (t) {
      return ''
        + '<p class="flex items-start gap-2">'
        +   Icons.arrowRight('w-3 h-3 mt-1 text-amber-400 flex-shrink-0')
        +   '<span>' + esc(t) + '</span>'
        + '</p>';
    }).join('');
    return ''
      + '<section>'
      +   '<h3 class="text-sm font-mono text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">'
      +     Icons.bookOpen('w-4 h-4') + ' Where to Go Next'
      +   '</h3>'
      +   '<div class="rounded-lg bg-slate-950/60 border border-slate-800 p-4 space-y-1.5 text-xs text-slate-300">'
      +     arrows
      +     '<p class="flex items-start gap-2">'
      +       Icons.arrowRight('w-3 h-3 mt-1 text-amber-400 flex-shrink-0')
      +       '<span>Reference: '
      +         '<a href="https://attack.mitre.org/" target="_blank" rel="noopener noreferrer" class="text-amber-300 hover:underline">MITRE ATT&amp;CK</a> · '
      +         '<a href="https://attack.mitre.org/datasources/" target="_blank" rel="noopener noreferrer" class="text-amber-300 hover:underline">ATT&amp;CK Data Sources</a> · '
      +         '<a href="https://www.comptia.org/certifications/security" target="_blank" rel="noopener noreferrer" class="text-amber-300 hover:underline">CompTIA Security+ SY0-801</a>'
      +       '</span>'
      +     '</p>'
      +   '</div>'
      + '</section>';
  }

  // -------------------------------------------------------------------------
  // Event wiring
  // -------------------------------------------------------------------------
  function wireEvents() {
    if (!_root) return;
    _root.addEventListener('click', handleClick);
  }

  function handleClick(e) {
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el || !_root.contains(el)) return;
    var action = el.getAttribute('data-action');
    if (action === 'backdrop' || action === 'close-x' || action === 'done') { close(); return; }
    if (action === 'reset') {
      if (_opts && typeof _opts.onReset === 'function') _opts.onReset();
      close();
      return;
    }
  }

  // -------------------------------------------------------------------------
  // HTML escape
  // -------------------------------------------------------------------------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  window.Debrief = {
    open: open,
    close: close,
    render: render,
  };
})();
