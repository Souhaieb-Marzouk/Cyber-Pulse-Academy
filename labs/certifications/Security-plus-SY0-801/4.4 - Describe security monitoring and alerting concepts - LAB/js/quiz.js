// ============================================================================
// CyberLab Architect — Static Port — Knowledge Check (Quiz Modal)
// ----------------------------------------------------------------------------
// Vanilla-JS port of src/components/lab/QuizModal.tsx.
//
// AUDIT-FIX COMPLIANCE:
//   R3 — only the SELECTED answer gets green (if correct) or red (if wrong);
//        the correct answer is NOT revealed green on a wrong submission.
//   R4 — correctIndex values are rotated (A/B/C/D spread) — handled in data.js.
//   R5 — option lengths balanced — handled in data.js.
//   R7 — ESC closes the modal (and click-outside, and the X button).
//
// Public API (window.Quiz):
//   open(onComplete) — open the quiz; `onComplete(score, total)` fires on submit
//   close()          — dismiss the modal
//   render()         — internal; re-renders from current store state
// ============================================================================

(function () {
  'use strict';

  var LAB_DATA = window.LAB_DATA;
  var LabStore = window.LabStore;
  var Icons = window.Icons;

  var QUIZ_QUESTIONS = LAB_DATA.QUIZ_QUESTIONS;

  var _root = null;       // the modal root element appended to <body>
  var _onComplete = null; // callback invoked with (score, total) on submit
  var _escHandler = null; // global ESC keydown handler (R7)

  // -------------------------------------------------------------------------
  // Open the quiz modal. `onComplete(score, total)` is invoked once when the
  // user submits.
  // -------------------------------------------------------------------------
  function open(onComplete) {
    if (_root) close();
    _onComplete = onComplete || function () {};
    _root = document.createElement('div');
    _root.className = 'quiz-modal-root';
    _root.setAttribute('role', 'dialog');
    _root.setAttribute('aria-modal', 'true');
    _root.setAttribute('aria-label', 'Knowledge Check');
    document.body.appendChild(_root);
    render();

    // R7: ESC closes the modal (capture-phase; stop propagation so the
    // backdrop handler doesn't also fire).
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
    _onComplete = null;
  }

  // -------------------------------------------------------------------------
  // Render the modal contents from current store state.
  // -------------------------------------------------------------------------
  function render() {
    if (!_root) return;
    var state = LabStore.getState();
    var mode = state.mode;
    var submitted = state.quizSubmitted;
    var answers = state.quizAnswers;

    var questions = QUIZ_QUESTIONS.filter(function (q) {
      return q.mode === 'both' || q.mode === mode;
    });

    var answeredCount = questions.filter(function (q) {
      return answers[q.id] !== undefined && answers[q.id] !== null;
    }).length;
    var allAnswered = questions.every(function (q) {
      return answers[q.id] !== undefined && answers[q.id] !== null;
    });

    var questionCards = questions.map(function (q, idx) {
      var sel = answers[q.id];
      // R3: only the SELECTED option is colored after submit.
      //   - Selected & correct  → green (showCorrect)
      //   - Selected & wrong    → red   (showWrong)
      //   - Not selected        → no highlight (even if it's the correct answer)
      var isCorrectSel = submitted && sel === q.correctIndex;
      var isWrongSel = submitted && sel !== undefined && sel !== null && sel !== q.correctIndex;
      var cardCls = submitted
        ? (isCorrectSel
            ? 'bg-emerald-950/15 border-emerald-700/40'
            : isWrongSel
              ? 'bg-rose-950/15 border-rose-700/40'
              : 'bg-slate-900/40 border-slate-800')
        : 'bg-slate-900/40 border-slate-800';

      var scenarioHtml = q.scenario
        ? '<p class="text-[11px] text-amber-300 font-mono mb-1.5 italic border-l-2 border-amber-500/40 pl-2">'
          + esc(q.scenario) + '</p>'
        : '';

      var options = q.options.map(function (opt, oi) {
        var isSel = sel === oi;
        // R3 coloring — only the SELECTED option is colored after submit
        var showCorrect = submitted && isSel && oi === q.correctIndex;
        var showWrong = submitted && isSel && oi !== q.correctIndex;
        var cls;
        if (showCorrect) {
          cls = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100';
        } else if (showWrong) {
          cls = 'bg-rose-500/20 border-rose-500/50 text-rose-100';
        } else if (isSel && !submitted) {
          cls = 'bg-amber-500/20 border-amber-500/50 text-amber-100';
        } else {
          cls = 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700';
        }
        var cursorCls = submitted ? 'cursor-default' : 'cursor-pointer';
        var letter = String.fromCharCode(65 + oi);
        var iconHtml = showCorrect
          ? Icons.checkCircle2('w-3.5 h-3.5 text-emerald-300 flex-shrink-0')
          : showWrong
            ? Icons.xCircle('w-3.5 h-3.5 text-rose-300 flex-shrink-0')
            : '';
        return ''
          + '<button data-action="answer" data-qid="' + esc(q.id) + '" data-idx="' + oi + '" '
          +   (submitted ? 'disabled ' : '') + 'aria-pressed="' + isSel + '" '
          +   'class="flex items-start gap-2 text-left px-3 py-2 rounded-md text-xs transition-all border w-full ' + cls + ' ' + cursorCls + '">'
          +   '<span class="font-mono text-[10px] mt-0.5 flex-shrink-0">' + letter + '.</span>'
          +   '<span class="flex-1">' + esc(opt) + '</span>'
          +   iconHtml
          + '</button>';
      }).join('');

      var explanation = submitted
        ? '<div class="overflow-hidden mt-3 pl-6">'
          +   '<p class="text-[11px] text-slate-400 leading-relaxed">'
          +     '<span class="font-mono text-amber-300 uppercase tracking-wider mr-1.5">Why:</span>'
          +     esc(q.explanation)
          +   '</p>'
          + '</div>'
        : '';

      return ''
        + '<div class="rounded-lg border p-4 ' + cardCls + '">'
        +   '<div class="flex items-start gap-2 mb-3">'
        +     '<span class="text-xs font-mono text-slate-500 mt-0.5">Q' + (idx + 1) + '.</span>'
        +     '<div class="flex-1">'
        +       scenarioHtml
        +       '<p class="text-sm text-slate-100 leading-relaxed">' + esc(q.question) + '</p>'
        +     '</div>'
        +   '</div>'
        +   '<div class="grid gap-1.5 pl-6">' + options + '</div>'
        +   explanation
        + '</div>';
    }).join('');

    var footer = !submitted
      ? '<button data-action="submit" ' + (allAnswered ? '' : 'disabled ')
          + 'class="px-4 py-2 rounded-md text-sm font-medium bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">'
          + 'Submit Quiz ' + Icons.chevronRight('w-4 h-4')
          + '</button>'
      : '<div class="flex items-center gap-3">'
          + '<span class="text-sm font-mono text-emerald-300">'
          +   questions.filter(function (q) { return answers[q.id] === q.correctIndex; }).length
          + ' / ' + questions.length + ' correct'
          + '</span>'
          + '<button data-action="close-results" class="px-4 py-2 rounded-md text-sm font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all flex items-center gap-2">'
          + Icons.trophy('w-4 h-4') + ' View Results'
          + '</button>'
        + '</div>';

    var html = ''
      + '<div class="quiz-backdrop" data-action="backdrop"></div>'
      + '<div class="quiz-panel max-w-2xl w-full max-h-[90vh] rounded-xl border border-slate-700 bg-[#0c1322] overflow-hidden flex flex-col">'
      +   '<div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">'
      +     '<div class="flex items-center gap-2">'
      +       Icons.brain('w-5 h-5 text-amber-400')
      +       '<h2 class="text-base font-semibold text-slate-100">Knowledge Check</h2>'
      +       '<span class="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">'
      +         (mode === 'medium' ? 'Medium · concepts' : 'Hard · scenarios')
      +       '</span>'
      +     '</div>'
      +     '<button data-action="close-x" class="p-1.5 rounded hover:bg-slate-800 transition-colors" aria-label="Close quiz">'
      +       Icons.x('w-4 h-4 text-slate-400')
      +     '</button>'
      +   '</div>'
      +   '<div class="overflow-y-auto flex-1 p-5 space-y-5">'
      +     questionCards
      +   '</div>'
      +   '<div class="px-5 py-4 border-t border-slate-800 flex items-center justify-between gap-3">'
      +     '<p class="text-xs text-slate-500 font-mono">' + answeredCount + ' / ' + questions.length + ' answered</p>'
      +     footer
      +   '</div>'
      + '</div>';

    _root.innerHTML = html;
    wireEvents();
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

    if (action === 'backdrop') { close(); return; }
    if (action === 'close-x' || action === 'close-results') { close(); return; }
    if (action === 'submit') { doSubmit(); return; }
    if (action === 'answer') {
      var qid = el.getAttribute('data-qid');
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      LabStore.setQuizAnswer(qid, idx);
      render();
      return;
    }
  }

  function doSubmit() {
    var state = LabStore.getState();
    var mode = state.mode;
    var answers = state.quizAnswers;
    var questions = QUIZ_QUESTIONS.filter(function (q) {
      return q.mode === 'both' || q.mode === mode;
    });
    var correct = questions.filter(function (q) { return answers[q.id] === q.correctIndex; }).length;
    LabStore.submitQuiz();
    if (_onComplete) _onComplete(correct, questions.length);
    render();
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
  window.Quiz = {
    open: open,
    close: close,
    render: render,
  };
})();
