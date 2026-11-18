// ============================================================================
// CyberLab Architect — Static Port — App Bootstrap
// ----------------------------------------------------------------------------
// This is the entry point. It:
//   - reads the persisted state from localStorage (already loaded by state.js)
//   - renders either the Mode Selection screen (no mode) or the Lab Floor
//   - wires all events (click, input, keydown for ESC)
//   - manages the sticky header + console grid + modals layout
//   - handles responsive behavior (handled by Tailwind classes in the markup)
//   - auto-shows the Debrief when all objectives are done + quiz submitted
//
// SCRIPT LOAD ORDER (required — each file depends on the previous):
//   1. data.js       — window.LAB_DATA
//   2. state.js      — window.LabStore
//   3. icons.js      — window.Icons
//   4. objectives.js — window.Objectives
//   5. quiz.js       — window.Quiz
//   6. debrief.js    — window.Debrief
//   7. ui.js         — window.UI
//   8. app.js        — window.App  (this file)
//
// Public API (window.App):
//   init(rootEl?) — boot the lab into the given root (or document.body)
// ============================================================================

(function () {
  'use strict';

  var LAB_DATA = window.LAB_DATA;
  var LabStore = window.LabStore;
  var Icons = window.Icons;
  var UI = window.UI;
  var Objectives = window.Objectives;
  var Quiz = window.Quiz;
  var Debrief = window.Debrief;

  // -------------------------------------------------------------------------
  // Local UI state (mirrors the React LabFloor's useState)
  // -------------------------------------------------------------------------
  var _root = null;
  var _showReset = false;
  var _showQuiz = false;
  var _showDebrief = false;
  var _quizScore = 0;
  var _quizTotal = 0;
  var _resetEscHandler = null;
  var _subscribed = false;
  var _lastMode = null;

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
  // init(rootEl) — entry point
  // -------------------------------------------------------------------------
  function init(rootEl) {
    _root = rootEl || document.body;
    draw();

    if (!_subscribed) {
      _subscribed = true;
      LabStore.subscribe(function () { onStoreChange(); });
    }

    // Auto-boot on DOMContentLoaded if loaded via a script tag in <head>.
    // If the DOM is already ready (script at end of body), draw() above ran.
  }

  function onStoreChange() {
    var state = LabStore.getState();
    // If the mode changed (e.g., user picked a mode, or reset cleared it),
    // fully redraw the view.
    if (state.mode !== _lastMode) {
      draw();
      return;
    }
    // Otherwise, just update the header progress + check auto-debrief.
    updateProgressPill();
    maybeAutoShowDebrief();
  }

  // -------------------------------------------------------------------------
  // Top-level draw — picks mode selection vs. lab floor
  // -------------------------------------------------------------------------
  function draw() {
    if (!_root) return;
    var state = LabStore.getState();
    _lastMode = state.mode;
    // Close any open modals when the view switches.
    closeResetDialog();
    if (_showQuiz) { Quiz.close(); _showQuiz = false; }
    if (_showDebrief) { Debrief.close(); _showDebrief = false; }

    if (!state.mode) {
      UI.renderModeSelection(_root);
    } else {
      drawLabFloor();
      maybeAutoShowDebrief();
    }
  }

  // =========================================================================
  // LAB FLOOR
  // =========================================================================
  function drawLabFloor() {
    var state = LabStore.getState();
    var mode = state.mode;
    var objectives = mode === 'medium' ? LAB_DATA.MEDIUM_OBJECTIVES
                   : mode === 'hard' ? LAB_DATA.HARD_OBJECTIVES
                   : [];
    var completed = LabStore.getProgressCount(objectives);
    var total = objectives.length;

    var html = ''
      + '<div class="min-h-screen bg-[#070b14] text-slate-100 lab-floor">'
      // Sticky header
      +   '<header class="sticky top-0 z-30 bg-[#070b14]/95 backdrop-blur-sm border-b border-slate-800">'
      +     '<div class="max-w-[1600px] mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">'
      +       '<div class="flex items-center gap-3 min-w-0">'
      +         '<div class="w-8 h-8 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">'
      +           Icons.terminal('w-4 h-4 text-amber-300')
      +         '</div>'
      +         '<div class="min-w-0">'
      +           '<h1 class="text-sm sm:text-base font-mono font-semibold text-slate-100 truncate">'
      +             'SOC Watch Floor<span class="ml-2 text-amber-400">·</span><span class="ml-2 text-xs sm:text-sm font-normal text-slate-400">Sec+ SY0-801 · L4.4 Monitoring &amp; Alerting</span>'
      +           '</h1>'
      +           '<p class="text-[10px] text-slate-500 font-mono hidden sm:block">Northwind CU · Tier-1 Analyst · Shift B</p>'
      +         '</div>'
      +       '</div>'
      +       '<div class="flex items-center gap-2">'
      +         modeBadge(mode)
      +         progressPill(completed, total)
      +         '<button data-action="open-reset" class="p-2 rounded-md bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors" aria-label="Reset lab" title="Reset lab">'
      +           Icons.rotateCcw('w-4 h-4')
      +         '</button>'
      +       '</div>'
      +     '</div>'
      +   '</header>'
      // Main content
      +   '<main class="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 space-y-4">'
      +     '<div id="briefing-slot"></div>'
      +     '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4">'
      +       '<div class="lg:col-span-5 space-y-4">'
      +         panelHeader('activity', 'Logs', 'multi-source stream')
      +         '<div id="logs-slot"></div>'
      +       '</div>'
      +       '<div class="lg:col-span-4 space-y-4">'
      +         '<div>'
      +           panelHeader('eye', 'Alerts', 'triage queue')
      +           '<div id="alerts-slot"></div>'
      +         '</div>'
      +         '<div>'
      +           panelHeader('layoutDashboard', 'Dashboards', 'live widgets')
      +           '<div id="dashboards-slot"></div>'
      +         '</div>'
      +       '</div>'
      +       '<div class="lg:col-span-3">'
      +         panelHeader('trophy', 'Objectives', completed + '/' + total + ' cleared')
      +         '<div id="objectives-slot"></div>'
      +       '</div>'
      +     '</div>'
      +     '<div>'
      +       panelHeader('eye', 'Alert Detail', 'triage context for the selected alert')
      +       '<div id="alert-detail-slot"></div>'
      +     '</div>'
      +     '<div>'
      +       panelHeader('layoutDashboard', 'Security Tools', "inspect each tool's role")
      +       '<div id="tools-slot"></div>'
      +     '</div>'
      +     '<p class="text-center text-[10px] text-slate-700 font-mono pt-2">'
      +       'All data synthetic · defensive educational use · MITRE ATT&amp;CK IDs verified against the official source'
      +     '</p>'
      +   '</main>'
      + '</div>';

    _root.innerHTML = html;

    // Render each panel into its slot.
    UI.renderBriefing(document.getElementById('briefing-slot'));
    UI.renderLogStream(document.getElementById('logs-slot'));
    UI.renderAlertQueue(document.getElementById('alerts-slot'));
    UI.renderDashboards(document.getElementById('dashboards-slot'));
    UI.renderAlertDetail(document.getElementById('alert-detail-slot'));
    UI.renderToolDock(document.getElementById('tools-slot'));
    Objectives.render(document.getElementById('objectives-slot'), openQuiz);

    // Wire the reset button (header)
    var resetBtn = _root.querySelector('[data-action="open-reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () { openResetDialog(); });
    }
  }

  function panelHeader(iconName, label, hint) {
    return ''
      + '<div class="flex items-center gap-2 mb-2 px-1 panel-header">'
      +   Icons[iconName]('w-3.5 h-3.5 text-slate-500')
      +   '<h2 class="text-xs font-mono uppercase tracking-wider text-slate-400">' + esc(label) + '</h2>'
      +   '<span class="text-[10px] font-mono text-slate-600 hidden sm:inline">· ' + esc(hint) + '</span>'
      + '</div>';
  }

  function modeBadge(mode) {
    var cfg = mode === 'medium'
      ? { label: 'Foundations', color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' }
      : { label: 'Triage Under Fire', color: 'bg-amber-500/15 border-amber-500/40 text-amber-300' };
    return '<span class="hidden sm:inline-block px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border ' + cfg.color + '">' + esc(cfg.label) + '</span>';
  }

  function progressPill(completed, total) {
    var pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return ''
      + '<div class="flex items-center gap-2" id="progress-pill">'
      +   '<div class="hidden sm:block w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">'
      +     '<div class="h-full bg-gradient-to-r from-amber-500 to-emerald-400" style="width:' + pct + '%"></div>'
      +   '</div>'
      +   '<span class="text-xs font-mono text-slate-300">'
      +     '<span class="text-amber-300">' + completed + '</span>'
      +     '<span class="text-slate-600">/</span>'
      +     '<span class="text-slate-400">' + total + '</span>'
      +   '</span>'
      + '</div>';
  }

  // Update the progress pill's width + numbers after a store change
  // (without re-rendering the whole lab floor).
  function updateProgressPill() {
    if (!_root) return;
    var state = LabStore.getState();
    var objectives = state.mode === 'medium' ? LAB_DATA.MEDIUM_OBJECTIVES
                   : state.mode === 'hard' ? LAB_DATA.HARD_OBJECTIVES
                   : [];
    var completed = LabStore.getProgressCount(objectives);
    var total = objectives.length;
    var pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    var pill = _root.querySelector('#progress-pill');
    if (!pill) return;
    var bar = pill.querySelector('div > div'); // the inner fill div
    if (bar) bar.style.width = pct + '%';
    var span = pill.querySelector('span.text-xs');
    if (span) {
      span.innerHTML = ''
        + '<span class="text-amber-300">' + completed + '</span>'
        + '<span class="text-slate-600">/</span>'
        + '<span class="text-slate-400">' + total + '</span>';
    }
    // Also update the "Objectives" panel-header hint
    var objHeader = _root.querySelectorAll('.panel-header');
    objHeader.forEach(function (h) {
      var h2 = h.querySelector('h2');
      if (h2 && h2.textContent === 'Objectives') {
        var hint = h.querySelector('span.text-\\[10px\\]');
        if (hint) hint.textContent = '· ' + completed + '/' + total + ' cleared';
      }
    });
  }

  // =========================================================================
  // RESET CONFIRMATION DIALOG
  // =========================================================================
  function openResetDialog() {
    if (_showReset) return;
    _showReset = true;
    var root = document.createElement('div');
    root.className = 'reset-modal-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Reset lab?');
    root.innerHTML = ''
      + '<div class="reset-backdrop" data-action="reset-cancel"></div>'
      + '<div class="reset-panel max-w-md w-full rounded-xl border border-slate-700 bg-[#0c1322] p-5">'
      +   '<div class="flex items-start gap-3 mb-3">'
      +     '<div class="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">'
      +       Icons.alertCircle('w-5 h-5 text-amber-300')
      +     '</div>'
      +     '<div class="flex-1">'
      +       '<h3 class="text-base font-semibold text-slate-100 mb-1">Reset lab?</h3>'
      +       '<p class="text-xs text-slate-400 leading-relaxed">All objective progress, alert verdicts, log filters, and quiz answers will be cleared. The lab returns to its pristine state.</p>'
      +     '</div>'
      +   '</div>'
      +   '<div class="flex items-center justify-end gap-2 mt-4">'
      +     '<button data-action="reset-cancel" class="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5">'
      +       Icons.x('w-3.5 h-3.5') + ' Cancel'
      +     '</button>'
      +     '<button data-action="reset-confirm" class="px-4 py-1.5 rounded-md text-xs font-medium bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-colors">Reset</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(root);

    root.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-action]') : null;
      if (!el) return;
      var action = el.getAttribute('data-action');
      if (action === 'reset-cancel') closeResetDialog();
      else if (action === 'reset-confirm') handleReset();
    });

    // R7: ESC closes (= Cancel)
    _resetEscHandler = function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        closeResetDialog();
      }
    };
    window.addEventListener('keydown', _resetEscHandler, true);
  }

  function closeResetDialog() {
    if (_resetEscHandler) {
      window.removeEventListener('keydown', _resetEscHandler, true);
      _resetEscHandler = null;
    }
    var root = document.querySelector('.reset-modal-root');
    if (root) root.remove();
    _showReset = false;
  }

  function handleReset() {
    LabStore.reset();
    if (Objectives && Objectives.reset) Objectives.reset();
    closeResetDialog();
    if (_showQuiz) { Quiz.close(); _showQuiz = false; }
    if (_showDebrief) { Debrief.close(); _showDebrief = false; }
    _quizScore = 0;
    _quizTotal = 0;
    // draw() will re-render based on the new (cleared) state — which sends
    // the user back to mode selection.
    draw();
  }

  // =========================================================================
  // QUIZ
  // =========================================================================
  function openQuiz() {
    if (_showQuiz) return;
    _showQuiz = true;
    Quiz.open(function (score, total) {
      _quizScore = score;
      _quizTotal = total;
      // Auto-open the debrief now that the quiz is submitted.
      maybeAutoShowDebrief();
    });
  }

  // =========================================================================
  // DEBRIEF — auto-show when allDone + quizSubmitted + !completionDismissed
  // =========================================================================
  function maybeAutoShowDebrief() {
    if (_showDebrief) return;
    var state = LabStore.getState();
    if (!state.mode) return;
    var objectives = state.mode === 'medium' ? LAB_DATA.MEDIUM_OBJECTIVES
                   : state.mode === 'hard' ? LAB_DATA.HARD_OBJECTIVES
                   : [];
    var allDone = objectives.every(function (o) { return LabStore.objectiveComplete(o.id); });
    if (!allDone) return;
    if (!state.quizSubmitted) return;
    if (state.completionDismissed) return;
    openDebrief();
  }

  function openDebrief() {
    if (_showDebrief) return;
    _showDebrief = true;
    // Recompute the quiz score from persisted answers so the debrief is
    // correct even after a page reload (the React app used useState which
    // was lost on reload; we improve on that here).
    var computed = computeQuizScore();
    var score = _quizScore || computed.score;
    var total = _quizTotal || computed.total;
    Debrief.open({
      quizScore: score,
      quizTotal: total,
      onReset: function () {
        handleReset();
      },
      onClose: function () {
        // The user dismissed the debrief (X / ESC / Done / click-outside).
        // Mark completion dismissed so it doesn't immediately re-open on the
        // next store change.
        _showDebrief = false;
        LabStore.dismissCompletion();
      },
    });
  }

  function computeQuizScore() {
    var state = LabStore.getState();
    var mode = state.mode;
    var questions = LAB_DATA.QUIZ_QUESTIONS.filter(function (q) {
      return q.mode === 'both' || q.mode === mode;
    });
    var correct = questions.filter(function (q) {
      return state.quizAnswers[q.id] === q.correctIndex;
    }).length;
    return { score: correct, total: questions.length };
  }

  // -------------------------------------------------------------------------
  // Auto-boot when the script loads (if DOM is ready) or on DOMContentLoaded.
  // The page's <body> must contain an element with id="app-root" OR we append
  // our own root into body.
  // -------------------------------------------------------------------------
  function boot() {
    var root = document.getElementById('app-root') || document.body;
    init(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  window.App = {
    init: init,
    draw: draw,
    openResetDialog: openResetDialog,
    closeResetDialog: closeResetDialog,
    openQuiz: openQuiz,
    openDebrief: openDebrief,
    handleReset: handleReset,
  };
})();
