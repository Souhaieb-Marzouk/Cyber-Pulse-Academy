// ============================================================================
// CyberLab Architect — Static Port — Objective Tracker
// ----------------------------------------------------------------------------
// Vanilla-JS port of src/components/lab/ObjectiveTracker.tsx.
//
// Provides:
//   - the CHECK RESULTS validation engine with 8 validation types:
//       matching, multi-correct, sequence, set, numeric, exact, state,
//       threshold-tune
//   - per-objective renderers producing the input controls
//   - the 3-tier hint system for Medium (nudge → direction → demonstration)
//     and the 1-optional-nudge system for Hard
//   - pillar badges, progress tracking, answer-lock (inputs disabled after
//     correct Check), and feedback display
//
// Public API (window.Objectives):
//   render(containerEl, onQuiz)         — render the full tracker
//   rerenderCard(objId)                 — re-render a single objective card
//   reset()                             — clear all local card state
//
// The tracker auto-subscribes to LabStore so external mutations
// (e.g. reset) trigger a full re-render.
// ============================================================================

(function () {
  'use strict';

  var LAB_DATA = window.LAB_DATA;
  var LabStore = window.LabStore;
  var Icons = window.Icons;

  // -------------------------------------------------------------------------
  // Pillar metadata (mirrors PILLAR_META in ObjectiveTracker.tsx)
  // -------------------------------------------------------------------------
  var PILLAR_META = {
    understand: { icon: 'brain', label: 'Understand', color: 'text-sky-300 bg-sky-500/15 border-sky-500/30' },
    recognize: { icon: 'eye', label: 'Recognize', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
    detect: { icon: 'crosshair', label: 'Detect', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
    mitigate: { icon: 'wrench', label: 'Mitigate', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
  };

  // -------------------------------------------------------------------------
  // Per-objective local state (mirrors the React useState in ObjectiveCard)
  // Persisted for the lifetime of the page; cleared on reset().
  // -------------------------------------------------------------------------
  var cardStates = {};

  function getCardState(objId) {
    if (!cardStates[objId]) {
      cardStates[objId] = {
        // answers: matching/multi-correct — Record<key, value>
        answers: {},
        // order: sequence — array of items in current order
        order: null,
        // selected: set — array of selected items
        selected: [],
        // picked: exact — single selected value (string)
        picked: null,
        // state: state/threshold-tune — custom field bag per form
        state: null,
        // numericValue: numeric — string from the input
        numericValue: '',
        // hintLevel: 0..3 (medium) or 0..1 (hard)
        hintLevel: 0,
        showHint: false,
        showFeedback: false,
        // Shuffled permutations (R6 compliance — shuffle once, keep stable)
        shuffledValues: null, // matching: shuffled value list
        shuffledOrder: null,  // sequence: initial shuffled order
        shuffledPool: null,   // set: shuffled candidate pool
        shuffledOptions: null, // exact: shuffled options
      };
    }
    return cardStates[objId];
  }

  // -------------------------------------------------------------------------
  // Tiny Fisher-Yates shuffle (mirrors the `shuffle` helper in the .tsx)
  // -------------------------------------------------------------------------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // -------------------------------------------------------------------------
  // HTML escape helper (objectives render user-facing strings, mostly safe,
  // but defensive escaping keeps the page robust against content tweaks).
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
  // Public: reset all local card state (called when the lab is reset)
  // -------------------------------------------------------------------------
  function reset() {
    cardStates = {};
  }

  // -------------------------------------------------------------------------
  // Render the full tracker into `containerEl`.
  // `onQuiz` is invoked when the user clicks the "Take Knowledge Check" button.
  // -------------------------------------------------------------------------
  var _container = null;
  var _onQuiz = null;

  function render(containerEl, onQuiz) {
    _container = containerEl;
    _onQuiz = onQuiz || function () {};
    drawTracker();
    // Subscribe to store changes (so reset / external mutations re-render)
    if (LabStore && LabStore.subscribe) {
      // Avoid double-subscribing on repeated render() calls.
      if (!_subscribed) {
        _subscribed = true;
        LabStore.subscribe(function () { drawTracker(); });
      }
    }
  }

  var _subscribed = false;

  function drawTracker() {
    if (!_container) return;
    var state = LabStore.getState();
    var mode = state.mode;
    var objectives = mode === 'medium' ? LAB_DATA.MEDIUM_OBJECTIVES
                  : mode === 'hard' ? LAB_DATA.HARD_OBJECTIVES
                  : [];

    var completed = objectives.filter(function (o) {
      return state.objectiveResults[o.id] === 'correct' || state.objectiveResults[o.id] === 'completed';
    }).length;
    var total = objectives.length;
    var pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    var quizDisabledAttrs = completed >= total ? '' : 'disabled aria-disabled="true" ';
    var quizBtnCls = completed >= total
      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
      : 'bg-slate-900/60 border border-slate-800 text-slate-600 cursor-not-allowed';
    var quizBtnTitle = completed < total ? 'Complete all objectives first' : 'Take the knowledge check';

    var html = ''
      + '<div class="rounded-xl border border-slate-800 bg-[#0a0f1c] overflow-hidden flex flex-col h-full">'
      +   '<div class="px-3 py-2.5 border-b border-slate-800 bg-slate-900/40">'
      +     '<div class="flex items-center justify-between gap-2 mb-2">'
      +       '<div class="flex items-center gap-2">'
      +         Icons.trophy('w-4 h-4 text-amber-400')
      +         '<span class="text-sm font-mono text-slate-200">objectives</span>'
      +       '</div>'
      +       '<span class="text-[10px] font-mono text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">'
      +         completed + '/' + total
      +       '</span>'
      +     '</div>'
      +     '<div class="h-1.5 rounded-full bg-slate-800 overflow-hidden">'
      +       '<div class="h-full bg-gradient-to-r from-amber-500 to-emerald-400" style="width:' + pct + '%"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="overflow-y-auto flex-1 max-h-[680px] lg:max-h-[720px]">'
      +     '<ul class="divide-y divide-slate-900">'
      +       objectives.map(function (o, i) { return renderCard(o, i); }).join('')
      +     '</ul>'
      +   '</div>'
      +   '<div class="border-t border-slate-800 p-3">'
      +     '<button data-action="quiz" ' + quizDisabledAttrs
      +       'class="w-full px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 ' + quizBtnCls + '" '
      +       'title="' + esc(quizBtnTitle) + '">'
      +       Icons.trophy('w-3.5 h-3.5')
      +       'Take Knowledge Check (' + completed + '/' + total + ' required)'
      +     '</button>'
      +   '</div>'
      + '</div>';

    _container.innerHTML = html;
    wireEvents();
  }

  // -------------------------------------------------------------------------
  // Re-render a single card (preserves scroll position of the parent <ul>)
  // -------------------------------------------------------------------------
  function rerenderCard(objId) {
    if (!_container) return;
    var state = LabStore.getState();
    var mode = state.mode;
    var objectives = mode === 'medium' ? LAB_DATA.MEDIUM_OBJECTIVES
                  : mode === 'hard' ? LAB_DATA.HARD_OBJECTIVES
                  : [];
    var idx = -1, obj = null;
    for (var i = 0; i < objectives.length; i++) {
      if (objectives[i].id === objId) { idx = i; obj = objectives[i]; break; }
    }
    if (!obj) return;
    var li = _container.querySelector('li[data-id="' + objId + '"]');
    if (!li) { drawTracker(); return; }
    // Replace the LI's outerHTML to keep the list structure clean.
    var wrapper = document.createElement('ul');
    wrapper.innerHTML = renderCard(obj, idx);
    var newLi = wrapper.firstChild;
    if (newLi) li.parentNode.replaceChild(newLi, li);
    wireCard(newLi);
  }

  // -------------------------------------------------------------------------
  // Render one objective card
  // -------------------------------------------------------------------------
  function renderCard(obj, index) {
    var state = LabStore.getState();
    var result = state.objectiveResults[obj.id] || 'pending';
    var attempts = state.objectiveAttempts[obj.id] || 0;
    var hintsUsed = state.hintUsage[obj.id] || 0;
    var isComplete = result === 'correct' || result === 'completed';
    var pillar = PILLAR_META[obj.pillar];

    var badgeInner = isComplete
      ? Icons.checkCircle2('w-3.5 h-3.5')
      : String(index + 1);
    var badgeCls = isComplete
      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
      : result === 'incorrect'
        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
        : 'bg-slate-800 text-slate-400 border border-slate-700';

    var pillarIcon = Icons[pillar.icon]('w-2.5 h-2.5');

    var meta = ''
      + '<span class="text-[9px] font-mono text-slate-500">' + esc(obj.id) + '</span>';
    if (attempts > 0 && !isComplete) {
      meta += '<span class="text-[9px] font-mono text-rose-400/70">'
        + attempts + ' attempt' + (attempts > 1 ? 's' : '') + '</span>';
    }
    if (hintsUsed > 0) {
      meta += '<span class="text-[9px] font-mono text-amber-400/70">'
        + hintsUsed + ' hint' + (hintsUsed > 1 ? 's' : '') + '</span>';
    }

    var rendererHtml = renderObjectiveRenderer(obj, isComplete);
    var hintBtn = renderHintButton(obj, isComplete);
    var hintDisplay = renderHintDisplay(obj);
    var feedbackDisplay = renderFeedbackDisplay(obj, isComplete);

    return ''
      + '<li class="obj-card p-3 transition-colors ' + (isComplete ? 'bg-emerald-950/10' : '') + '" data-id="' + esc(obj.id) + '">'
      +   '<div class="flex items-start gap-2 mb-2">'
      +     '<div class="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono ' + badgeCls + '">'
      +       badgeInner
      +     '</div>'
      +     '<div class="flex-1 min-w-0">'
      +       '<p class="text-xs font-medium text-slate-100 leading-snug mb-1">' + esc(obj.title) + '</p>'
      +       '<div class="flex items-center gap-1.5 flex-wrap">'
      +         '<span class="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ' + pillar.color + ' flex items-center gap-1">'
      +           pillarIcon + pillar.label
      +         '</span>'
      +         meta
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<p class="text-xs text-slate-400 leading-relaxed mb-2 pl-8">' + esc(obj.brief) + '</p>'
      +   '<div class="pl-8">'
      +     rendererHtml
      +     '<div class="mt-2 flex items-center gap-2 flex-wrap">' + hintBtn + '</div>'
      +     hintDisplay
      +     feedbackDisplay
      +   '</div>'
      + '</li>';
  }

  // -------------------------------------------------------------------------
  // Hint button
  // -------------------------------------------------------------------------
  function renderHintButton(obj, isComplete) {
    if (isComplete || !obj.hints || obj.hints.length === 0) return '';
    var cs = getCardState(obj.id);
    var lvl = cs.hintLevel;
    var max = obj.hints.length; // 3 for medium, 1 for hard
    var label;
    if (lvl === 0) label = 'Need a hint?';
    else if (lvl >= max) label = 'All hints shown';
    else label = 'Hint (' + lvl + '/' + max + ') →';
    var disabled = lvl >= max;
    return ''
      + '<button data-action="hint" data-id="' + esc(obj.id) + '" '
      +   (disabled ? 'disabled ' : '')
      +   'class="text-[10px] font-mono text-amber-400/80 hover:text-amber-300 flex items-center gap-1 transition-colors '
      +   (disabled ? 'opacity-50 cursor-not-allowed' : '') + '">'
      +   Icons.lightbulb('w-3 h-3') + label
      + '</button>';
  }

  // -------------------------------------------------------------------------
  // Hint display
  // -------------------------------------------------------------------------
  function renderHintDisplay(obj) {
    var cs = getCardState(obj.id);
    if (!cs.showHint || cs.hintLevel === 0) return '';
    var hints = obj.hints.slice(0, cs.hintLevel);
    var items = hints.map(function (h, i) {
      return ''
        + '<div class="flex items-start gap-2">'
        +   '<span class="text-[10px] font-mono text-amber-400 mt-0.5 flex-shrink-0">H' + (i + 1) + '</span>'
        +   '<p class="text-[11px] text-slate-300 leading-relaxed">' + esc(h) + '</p>'
        + '</div>';
    }).join('');
    return ''
      + '<div class="overflow-hidden mt-2">'
      +   '<div class="rounded-md bg-amber-950/15 border border-amber-700/30 p-2.5 space-y-1.5">'
      +     items
      +   '</div>'
      + '</div>';
  }

  // -------------------------------------------------------------------------
  // Feedback display (correct/incorrect + rationale)
  // -------------------------------------------------------------------------
  function renderFeedbackDisplay(obj, isComplete) {
    var cs = getCardState(obj.id);
    if (!cs.showFeedback) return '';
    var cls = isComplete
      ? 'bg-emerald-950/20 border-emerald-700/40'
      : 'bg-rose-950/20 border-rose-700/40';
    var textCls = isComplete ? 'text-emerald-300' : 'text-rose-300';
    var icon = isComplete ? Icons.checkCircle2('w-3.5 h-3.5') : Icons.xCircle('w-3.5 h-3.5');
    var label = isComplete ? 'Correct' : 'Not quite — read the rationale and try again';
    return ''
      + '<div class="overflow-hidden mt-2">'
      +   '<div class="rounded-md border p-2.5 ' + cls + '">'
      +     '<p class="text-xs font-mono mb-1 flex items-center gap-1.5 ' + textCls + '">'
      +       icon + label
      +     '</p>'
      +     '<p class="text-[11px] text-slate-300 leading-relaxed">' + esc(obj.feedback) + '</p>'
      +   '</div>'
      + '</div>';
  }

  // =========================================================================
  // RENDERER DISPATCHER
  // =========================================================================
  function renderObjectiveRenderer(obj, disabled) {
    switch (obj.validation.kind) {
      case 'matching':       return renderMatching(obj, disabled);
      case 'multi-correct':
      case 'categorize':     return renderMultiCorrect(obj, disabled);
      case 'sequence':       return renderSequence(obj, disabled);
      case 'set':            return renderSet(obj, disabled);
      case 'numeric':        return renderNumeric(obj, disabled);
      case 'exact':          return renderExact(obj, disabled);
      case 'state':
      case 'threshold-tune': return renderState(obj, disabled);
      default:
        return '<p class="text-xs text-slate-500">Unsupported objective type: ' + esc(obj.validation.kind) + '</p>';
    }
  }

  // =========================================================================
  // Matching — pair keys to values
  // =========================================================================
  function renderMatching(obj, disabled) {
    var expected = obj.validation.expected;
    var leftKeys = Object.keys(expected);
    var cs = getCardState(obj.id);
    if (!cs.shuffledValues) {
      var set = {};
      Object.values(expected).forEach(function (v) { set[v] = true; });
      cs.shuffledValues = shuffle(Object.keys(set));
    }
    var optListFor = function (key) {
      var sel = cs.answers[key] || '';
      return cs.shuffledValues.map(function (v) {
        var isSel = v === sel;
        return '<option value="' + esc(v) + '"' + (isSel ? ' selected' : '') + '>' + esc(v) + '</option>';
      }).join('');
    };

    var rows = leftKeys.map(function (key) {
      return ''
        + '<div class="grid grid-cols-2 gap-2 items-center">'
        +   '<div class="text-xs font-mono text-slate-200 truncate" title="' + esc(key) + '">' + esc(key) + '</div>'
        +   '<select data-action="match" data-id="' + esc(obj.id) + '" data-key="' + esc(key) + '" ' + (disabled ? 'disabled' : '')
        +     ' class="text-xs font-mono px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50">'
        +     '<option value="">— pick —</option>' + optListFor(key)
        +   '</select>'
        + '</div>';
    }).join('');

    var allFilled = leftKeys.every(function (k) { return cs.answers[k]; });
    return ''
      + '<div class="space-y-2">' + rows + checkButton(obj.id, disabled || !allFilled) + '</div>';
  }

  // =========================================================================
  // Multi-correct — categorize each item
  // =========================================================================
  var WIDGET_TITLE_MAP = {
    w1: 'Widget: "Alerts last 1h"',
    w2: 'Widget: "Top source IPs (failed auth)"',
    w3: 'Widget: "Alerts by severity (24h)"',
    w4: 'Widget: "Log volume by source/hour"',
    w5: 'Widget: "MTTR"',
    w6: 'Widget: "MITRE tactics observed"',
  };

  function renderMultiCorrect(obj, disabled) {
    var expected = obj.validation.expected;
    var items = Object.keys(expected);
    var categories = Array.from(new Set(Object.values(expected)));
    var cs = getCardState(obj.id);

    var itemLabel = function (i) {
      if (obj.id === 'OBJ-M5') return WIDGET_TITLE_MAP[i] || i;
      return i + ':';
    };

    var rows = items.map(function (item) {
      var buttons = categories.map(function (cat) {
        var sel = cs.answers[item] === cat;
        var cls = sel
          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700';
        var disCls = disabled ? 'opacity-50 cursor-not-allowed' : '';
        var label = cat.length > 50 ? cat.slice(0, 50) + '…' : cat;
        return ''
          + '<button data-action="multi" data-id="' + esc(obj.id) + '" data-item="' + esc(item) + '" data-cat="' + esc(cat) + '" '
          +   (disabled ? 'disabled ' : '') + 'aria-pressed="' + sel + '" '
          +   'title="' + esc(cat) + '" '
          +   'class="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all border ' + cls + ' ' + disCls + '">'
          +   esc(label)
          + '</button>';
      }).join('');
      return ''
        + '<div class="space-y-1">'
        +   '<div class="text-xs text-slate-200 font-mono break-all" title="' + esc(item) + '">'
        +     '<span class="text-slate-500 mr-1">' + esc(itemLabel(item)) + '</span>'
        +   '</div>'
        +   '<div class="flex gap-1 flex-wrap pl-2">' + buttons + '</div>'
        + '</div>';
    }).join('');

    var allFilled = items.every(function (i) { return cs.answers[i]; });
    return ''
      + '<div class="space-y-2">' + rows + checkButton(obj.id, disabled || !allFilled) + '</div>';
  }

  // =========================================================================
  // Sequence — reorder items
  // =========================================================================
  function renderSequence(obj, disabled) {
    var expected = obj.validation.expected;
    var cs = getCardState(obj.id);
    if (!cs.shuffledOrder) cs.shuffledOrder = shuffle(expected);
    if (!cs.order) cs.order = cs.shuffledOrder.slice();

    var rows = cs.order.map(function (item, idx) {
      return ''
        + '<div class="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded p-2">'
        +   '<span class="text-[10px] font-mono text-slate-500 w-5">' + (idx + 1) + '.</span>'
        +   '<span class="text-xs text-slate-200 flex-1 truncate" title="' + esc(item) + '">' + esc(item) + '</span>'
        +   '<div class="flex flex-col">'
        +     '<button data-action="move" data-id="' + esc(obj.id) + '" data-idx="' + idx + '" data-dir="-1" '
        +       (disabled || idx === 0 ? 'disabled ' : '')
        +       'class="text-slate-400 hover:text-slate-200 disabled:opacity-30" aria-label="Move up">▲</button>'
        +     '<button data-action="move" data-id="' + esc(obj.id) + '" data-idx="' + idx + '" data-dir="1" '
        +       (disabled || idx === cs.order.length - 1 ? 'disabled ' : '')
        +       'class="text-slate-400 hover:text-slate-200 disabled:opacity-30" aria-label="Move down">▼</button>'
        +   '</div>'
        + '</div>';
    }).join('');

    return ''
      + '<div class="space-y-1">' + rows + checkButton(obj.id, disabled) + '</div>';
  }

  // =========================================================================
  // Set — pick a subset of items
  // =========================================================================
  function getPoolLabel(objId, item) {
    if (objId === 'OBJ-M11' || objId === 'OBJ-H1') {
      var tool = LAB_DATA.TOOLS.find(function (t) { return t.id === item; });
      if (tool) return tool.acronym;
      var src = LAB_DATA.LOG_SOURCES.find(function (s) { return s.id === item; });
      if (src) return src.label;
    }
    if (objId === 'OBJ-H9') {
      return item.charAt(0).toUpperCase() + item.slice(1);
    }
    return item;
  }

  function renderSet(obj, disabled) {
    var expected = obj.validation.expected;
    var cs = getCardState(obj.id);
    if (!cs.shuffledPool) {
      var distractorsByObj = {
        'OBJ-M11': ['ids_ips', 'xdr'],
        'OBJ-H1': ['web', 'proxy', 'application', 'system', 'security'],
        'OBJ-H9': ['raise threshold', 'add context (TI)'],
      };
      var distractors = distractorsByObj[obj.id] || [];
      cs.shuffledPool = shuffle(expected.concat(distractors));
    }
    var pool = cs.shuffledPool;
    var buttons = pool.map(function (item) {
      var label = getPoolLabel(obj.id, item);
      var sel = cs.selected.indexOf(item) >= 0;
      var cls = sel
        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700';
      var disCls = disabled ? 'opacity-50 cursor-not-allowed' : '';
      return ''
        + '<button data-action="toggle" data-id="' + esc(obj.id) + '" data-value="' + esc(item) + '" '
        +   (disabled ? 'disabled ' : '') + 'aria-pressed="' + sel + '" '
        +   'class="px-2.5 py-1 rounded-md text-xs font-mono transition-all border ' + cls + ' ' + disCls + '">'
        +   esc(label)
        + '</button>';
    }).join('');

    return ''
      + '<div class="space-y-2">'
      +   '<p class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Select the correct set:</p>'
      +   '<div class="flex flex-wrap gap-1.5">' + buttons + '</div>'
      +   checkButton(obj.id, disabled || cs.selected.length === 0)
      + '</div>';
  }

  // =========================================================================
  // Numeric — input a number
  // =========================================================================
  function renderNumeric(obj, disabled) {
    var cs = getCardState(obj.id);
    var label = obj.id === 'OBJ-M7' ? 'failed-login count' : 'value';
    return ''
      + '<div class="space-y-2">'
      +   '<div class="flex items-center gap-2">'
      +     '<input type="number" data-action="numeric" data-id="' + esc(obj.id) + '" value="' + esc(cs.numericValue) + '" '
      +       (disabled ? 'disabled ' : '')
      +       'class="w-20 px-2 py-1 text-sm font-mono bg-slate-950/80 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50" '
      +       'placeholder="?" />'
      +     '<span class="text-xs text-slate-400">' + esc(label) + '</span>'
      +   '</div>'
      +   checkButton(obj.id, disabled || cs.numericValue === '')
      + '</div>';
  }

  // =========================================================================
  // Exact — pick from buttons (verdict / MITRE ID / HTTP status)
  // =========================================================================
  function renderExact(obj, disabled) {
    var expected = obj.validation.expected;
    var nearMisses = obj.validation.nearMisses || [];
    var cs = getCardState(obj.id);
    if (!cs.shuffledOptions) {
      var all = Array.from(new Set([expected].concat(nearMisses)));
      cs.shuffledOptions = shuffle(all);
    }
    var isVerdict = expected.length === 2 && ['tp', 'fp', 'tn', 'fn'].indexOf(expected) >= 0;
    var isMitre = /^T\d{4}(\.\d{3})?$/.test(expected);
    var isHttp = /^\d{3}$/.test(expected);

    var labelPrefix = isVerdict ? 'Verdict:' : isMitre ? 'MITRE ID:' : isHttp ? 'HTTP status:' : 'Answer:';

    var labelMap = {
      tp: 'True Positive (TP)', fp: 'False Positive (FP)',
      tn: 'True Negative (TN)', fn: 'False Negative (FN)',
    };
    function renderLabel(opt) {
      if (isVerdict) return labelMap[opt] || opt;
      return opt;
    }

    var gridCls = cs.shuffledOptions.length <= 4 ? 'grid-cols-2' : 'grid-cols-1';
    var buttons = cs.shuffledOptions.map(function (opt) {
      var sel = cs.picked === opt;
      var cls = sel
        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700';
      var disCls = disabled ? 'opacity-50 cursor-not-allowed' : '';
      return ''
        + '<button data-action="pick" data-id="' + esc(obj.id) + '" data-value="' + esc(opt) + '" '
        +   (disabled ? 'disabled ' : '') + 'aria-pressed="' + sel + '" '
        +   'class="px-2.5 py-1.5 rounded-md text-xs font-mono transition-all border ' + cls + ' ' + disCls + '">'
        +   esc(renderLabel(opt))
        + '</button>';
    }).join('');

    return ''
      + '<div class="space-y-2">'
      +   '<p class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">' + labelPrefix + '</p>'
      +   '<div class="grid gap-1.5 ' + gridCls + '">' + buttons + '</div>'
      +   checkButton(obj.id, disabled || !cs.picked)
      + '</div>';
  }

  // =========================================================================
  // State — multi-field form
  //   Dispatches to: TuningForm (OBJ-M10), CorrelationForm (OBJ-H3),
  //   RuleDesignForm (OBJ-H5), ThresholdTuneForm (OBJ-H7)
  // =========================================================================
  function renderState(obj, disabled) {
    if (obj.id === 'OBJ-M10') return renderTuningForm(obj, disabled);
    if (obj.id === 'OBJ-H3') return renderCorrelationForm(obj, disabled);
    if (obj.id === 'OBJ-H5') return renderRuleDesignForm(obj, disabled);
    if (obj.id === 'OBJ-H7') return renderThresholdTuneForm(obj, disabled);
    return '<p class="text-xs text-slate-500">Unsupported state objective.</p>';
  }

  // OBJ-M10 — tune the internal-scan rule
  function renderTuningForm(obj, disabled) {
    var cs = getCardState(obj.id);
    if (!cs.state) cs.state = { whitelist: '', threshold: 10, enabled: true };
    var s = cs.state;
    return ''
      + '<div class="space-y-3">'
      +   '<p class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Rule: net-internal-scan</p>'
      +   '<div>'
      +     '<label class="text-xs text-slate-300 block mb-1">Whitelist IPs (comma-separated):</label>'
      +     '<input type="text" data-action="state" data-id="' + esc(obj.id) + '" data-field="whitelist" value="' + esc(s.whitelist) + '" '
      +       (disabled ? 'disabled ' : '') + 'placeholder="10.20.0.250" '
      +       'class="w-full px-2 py-1 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50" />'
      +   '</div>'
      +   '<div>'
      +     '<label class="text-xs text-slate-300 block mb-1">Port-count threshold (min ports to fire):</label>'
      +     '<input type="number" data-action="state" data-id="' + esc(obj.id) + '" data-field="threshold" value="' + esc(s.threshold) + '" '
      +       (disabled ? 'disabled ' : '')
      +       'class="w-24 px-2 py-1 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50" />'
      +   '</div>'
      +   '<label class="flex items-center gap-2 text-xs text-slate-300">'
      +     '<input type="checkbox" data-action="state" data-id="' + esc(obj.id) + '" data-field="enabled" ' + (s.enabled ? 'checked' : '') + ' ' + (disabled ? 'disabled' : '') + ' class="accent-amber-500" />'
      +     'Rule enabled'
      +   '</label>'
      +   checkButton(obj.id, disabled)
      + '</div>';
  }

  // OBJ-H3 — pick which alerts are same-incident vs noise
  function renderCorrelationForm(obj, disabled) {
    var cs = getCardState(obj.id);
    if (!cs.state) cs.state = { sameIncident: [], noise: [] };
    var s = cs.state;
    var rows = LAB_DATA.ALERTS.map(function (a) {
      var isSame = s.sameIncident.indexOf(a.id) >= 0;
      var isNoise = s.noise.indexOf(a.id) >= 0;
      var sameCls = isSame
        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700';
      var noiseCls = isNoise
        ? 'bg-slate-700 border-slate-600 text-slate-100'
        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700';
      var disCls = disabled ? 'opacity-50' : '';
      return ''
        + '<div class="grid grid-cols-2 gap-1">'
        +   '<button data-action="corr" data-id="' + esc(obj.id) + '" data-alert="' + esc(a.id) + '" data-bucket="same" '
        +     (disabled ? 'disabled ' : '') + 'class="px-2 py-1 rounded text-xs font-mono transition-all border ' + sameCls + ' ' + disCls + '">' + esc(a.id) + '</button>'
        +   '<button data-action="corr" data-id="' + esc(obj.id) + '" data-alert="' + esc(a.id) + '" data-bucket="noise" '
        +     (disabled ? 'disabled ' : '') + 'class="px-2 py-1 rounded text-xs font-mono transition-all border ' + noiseCls + ' ' + disCls + '">' + esc(a.id) + '</button>'
        + '</div>';
    }).join('');
    return ''
      + '<div class="space-y-2">'
      +   '<p class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Click each alert to assign it:</p>'
      +   '<div class="grid grid-cols-2 gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">'
      +     '<div class="text-amber-300">Same incident</div>'
      +     '<div class="text-slate-500">Noise / unrelated</div>'
      +   '</div>'
      +   '<div class="space-y-1">' + rows + '</div>'
      +   checkButton(obj.id, disabled)
      + '</div>';
  }

  // OBJ-H5 — build a brute-force detection rule
  function renderRuleDesignForm(obj, disabled) {
    var cs = getCardState(obj.id);
    if (!cs.state) cs.state = { logSource: '', threshold: 0, window: 0, action: '' };
    var s = cs.state;
    var srcOpts = LAB_DATA.LOG_SOURCES.map(function (src) {
      return '<option value="' + esc(src.id) + '"' + (s.logSource === src.id ? ' selected' : '') + '>' + esc(src.label) + '</option>';
    }).join('');
    var actionBtns = ['failures-only', 'success-only', 'success'].map(function (opt) {
      var sel = s.action === opt;
      var cls = sel
        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700';
      var disCls = disabled ? 'opacity-50' : '';
      return ''
        + '<button data-action="state" data-id="' + esc(obj.id) + '" data-field="action" data-value="' + esc(opt) + '" '
        +   (disabled ? 'disabled ' : '') + 'aria-pressed="' + sel + '" '
        +   'class="px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all border ' + cls + ' ' + disCls + '">' + esc(opt) + '</button>';
    }).join('');
    return ''
      + '<div class="space-y-2">'
      +   '<div>'
      +     '<label class="text-xs text-slate-300 block mb-1">Log source:</label>'
      +     '<select data-action="state" data-id="' + esc(obj.id) + '" data-field="logSource" ' + (disabled ? 'disabled' : '')
      +       ' class="w-full px-2 py-1 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50">'
      +       '<option value="">— pick —</option>' + srcOpts
      +     '</select>'
      +   '</div>'
      +   '<div class="grid grid-cols-2 gap-2">'
      +     '<div>'
      +       '<label class="text-xs text-slate-300 block mb-1">Failed-login threshold:</label>'
      +       '<input type="number" data-action="state" data-id="' + esc(obj.id) + '" data-field="threshold" value="' + (s.threshold || '') + '" ' + (disabled ? 'disabled ' : '')
      +         'class="w-full px-2 py-1 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50" />'
      +     '</div>'
      +     '<div>'
      +       '<label class="text-xs text-slate-300 block mb-1">Window (seconds):</label>'
      +       '<input type="number" data-action="state" data-id="' + esc(obj.id) + '" data-field="window" value="' + (s.window || '') + '" ' + (disabled ? 'disabled ' : '')
      +         'class="w-full px-2 py-1 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50" />'
      +     '</div>'
      +   '</div>'
      +   '<div>'
      +     '<label class="text-xs text-slate-300 block mb-1">Rule fires on:</label>'
      +     '<div class="flex gap-1.5 flex-wrap">' + actionBtns + '</div>'
      +   '</div>'
      +   checkButton(obj.id, disabled)
      + '</div>';
  }

  // OBJ-H7 — DGA threshold tune
  function renderThresholdTuneForm(obj, disabled) {
    var cs = getCardState(obj.id);
    if (!cs.state) cs.state = { count: 1, window: 60, enabled: true };
    var s = cs.state;
    return ''
      + '<div class="space-y-2">'
      +   '<p class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Rule: dns-dga-ml-v3 (currently: 1 query / 60s)</p>'
      +   '<div class="grid grid-cols-2 gap-2">'
      +     '<div>'
      +       '<label class="text-xs text-slate-300 block mb-1">Min query count:</label>'
      +       '<input type="number" min="1" data-action="state" data-id="' + esc(obj.id) + '" data-field="count" value="' + esc(s.count) + '" ' + (disabled ? 'disabled ' : '')
      +         'class="w-full px-2 py-1 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50" />'
      +     '</div>'
      +     '<div>'
      +       '<label class="text-xs text-slate-300 block mb-1">Window (seconds):</label>'
      +       '<input type="number" data-action="state" data-id="' + esc(obj.id) + '" data-field="window" value="' + esc(s.window) + '" ' + (disabled ? 'disabled ' : '')
      +         'class="w-full px-2 py-1 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50" />'
      +     '</div>'
      +   '</div>'
      +   '<label class="flex items-center gap-2 text-xs text-slate-300">'
      +     '<input type="checkbox" data-action="state" data-id="' + esc(obj.id) + '" data-field="enabled" ' + (s.enabled ? 'checked' : '') + ' ' + (disabled ? 'disabled' : '') + ' class="accent-amber-500" />'
      +     'Rule stays enabled'
      +   '</label>'
      +   checkButton(obj.id, disabled)
      + '</div>';
  }

  // -------------------------------------------------------------------------
  // CheckButton — shared by all renderers
  // -------------------------------------------------------------------------
  function checkButton(objId, disabled) {
    return ''
      + '<button data-action="check" data-id="' + esc(objId) + '" ' + (disabled ? 'disabled ' : '')
      +   'class="mt-2 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5">'
      +   Icons.chevronRight('w-3.5 h-3.5') + 'Check'
      + '</button>';
  }

  // =========================================================================
  // EVENT WIRING
  // =========================================================================
  function wireEvents() {
    if (!_container) return;
    // Click delegation — handles button-style interactions.
    _container.addEventListener('click', handleClick, false);
    // Change delegation — handles <select> and checkbox changes.
    _container.addEventListener('change', handleChange, false);
    // Input delegation — handles free-text/number inputs.
    _container.addEventListener('input', handleInput, false);
  }

  // Wire events on a freshly replaced card (used by rerenderCard)
  function wireCard(li) {
    // Delegation on the container covers newly inserted nodes automatically;
    // no per-card listeners are needed.
  }

  function findObjById(id) {
    var state = LabStore.getState();
    var mode = state.mode;
    var list = mode === 'medium' ? LAB_DATA.MEDIUM_OBJECTIVES
             : mode === 'hard' ? LAB_DATA.HARD_OBJECTIVES
             : [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return { obj: list[i], index: i };
    return null;
  }

  function handleClick(e) {
    var btn = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!btn || !_container.contains(btn)) return;
    var action = btn.getAttribute('data-action');
    var id = btn.getAttribute('data-id');
    if (action === 'quiz') { _onQuiz(); return; }
    if (!id) return;
    var found = findObjById(id);
    if (!found) return;
    var obj = found.obj;
    var cs = getCardState(id);
    var isComplete = LabStore.objectiveComplete(id);
    if (isComplete && action !== 'hint') return; // locked after correct

    switch (action) {
      case 'check':        doCheck(obj); break;
      case 'hint':         doHint(obj); break;
      case 'multi':        doMulti(obj, btn); break;
      case 'move':         doMove(obj, btn); break;
      case 'toggle':       doToggle(obj, btn); break;
      case 'pick':         doPick(obj, btn); break;
      case 'corr':         doCorr(obj, btn); break;
      case 'state':        doStateButton(obj, btn); break;
      // matching & numeric use change/input events, not click
    }
  }

  function handleChange(e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var action = el.getAttribute('data-action');
    if (!action) return;
    var id = el.getAttribute('data-id');
    if (!id) return;
    var found = findObjById(id);
    if (!found) return;
    var obj = found.obj;
    var isComplete = LabStore.objectiveComplete(id);
    if (isComplete) return;
    if (action === 'match') doMatch(obj, el);
    if (action === 'state') doStateChange(obj, el);
  }

  function handleInput(e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var action = el.getAttribute('data-action');
    if (!action) return;
    var id = el.getAttribute('data-id');
    if (!id) return;
    var found = findObjById(id);
    if (!found) return;
    var obj = found.obj;
    var isComplete = LabStore.objectiveComplete(id);
    if (isComplete) return;
    if (action === 'numeric') {
      var cs = getCardState(id);
      cs.numericValue = el.value;
      // Update the Check button's disabled state directly without a full
      // card re-render — re-rendering would destroy input focus mid-typing.
      var card = _container && _container.querySelector('li[data-id="' + id + '"]');
      if (card) {
        var checkBtn = card.querySelector('[data-action="check"]');
        if (checkBtn) {
          var hasValue = cs.numericValue !== '';
          checkBtn.disabled = !hasValue;
        }
      }
    }
    if (action === 'state') doStateChange(obj, el);
  }

  // -------------------------------------------------------------------------
  // Action handlers
  // -------------------------------------------------------------------------
  function doMatch(obj, el) {
    var cs = getCardState(obj.id);
    var key = el.getAttribute('data-key');
    cs.answers[key] = el.value;
    rerenderCard(obj.id);
  }

  function doMulti(obj, btn) {
    var cs = getCardState(obj.id);
    var item = btn.getAttribute('data-item');
    var cat = btn.getAttribute('data-cat');
    cs.answers[item] = cat;
    rerenderCard(obj.id);
  }

  function doMove(obj, btn) {
    var cs = getCardState(obj.id);
    var idx = parseInt(btn.getAttribute('data-idx'), 10);
    var dir = parseInt(btn.getAttribute('data-dir'), 10);
    var target = idx + dir;
    if (target < 0 || target >= cs.order.length) return;
    var t = cs.order[idx]; cs.order[idx] = cs.order[target]; cs.order[target] = t;
    rerenderCard(obj.id);
  }

  function doToggle(obj, btn) {
    var cs = getCardState(obj.id);
    var v = btn.getAttribute('data-value');
    var i = cs.selected.indexOf(v);
    if (i >= 0) cs.selected.splice(i, 1);
    else cs.selected.push(v);
    rerenderCard(obj.id);
  }

  function doPick(obj, btn) {
    var cs = getCardState(obj.id);
    cs.picked = btn.getAttribute('data-value');
    rerenderCard(obj.id);
  }

  function doCorr(obj, btn) {
    var cs = getCardState(obj.id);
    if (!cs.state) cs.state = { sameIncident: [], noise: [] };
    var alertId = btn.getAttribute('data-alert');
    var bucket = btn.getAttribute('data-bucket');
    var other = bucket === 'same' ? 'noise' : 'sameIncident';
    // Remove from the other bucket if present
    cs.state[other] = cs.state[other].filter(function (x) { return x !== alertId; });
    var arr = cs.state[bucket];
    var i = arr.indexOf(alertId);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(alertId);
    rerenderCard(obj.id);
  }

  // State-form button-style interactions (action picker, etc.)
  function doStateButton(obj, btn) {
    var cs = getCardState(obj.id);
    if (!cs.state) cs.state = {};
    var field = btn.getAttribute('data-field');
    var value = btn.getAttribute('data-value');
    if (field === 'action') cs.state.action = value;
    rerenderCard(obj.id);
  }

  // State-form select/checkbox/text/number changes
  function doStateChange(obj, el) {
    var cs = getCardState(obj.id);
    if (!cs.state) cs.state = {};
    var field = el.getAttribute('data-field');
    if (el.type === 'checkbox') cs.state[field] = el.checked;
    else if (el.type === 'number') cs.state[field] = parseInt(el.value || '0', 10);
    else cs.state[field] = el.value;
    // No re-render here for text/number to preserve focus;
    // the Check button reads from state at check time.
  }

  function doHint(obj) {
    var cs = getCardState(obj.id);
    var max = obj.hints.length; // 3 medium, 1 hard
    if (cs.hintLevel >= max) return;
    cs.hintLevel += 1;
    cs.showHint = true;
    LabStore.useHint(obj.id);
    rerenderCard(obj.id);
  }

  // =========================================================================
  // CHECK RESULTS — the validation engine
  // =========================================================================
  function doCheck(obj) {
    var cs = getCardState(obj.id);
    var correct = runValidation(obj);
    LabStore.recordAttempt(obj.id);
    LabStore.setObjectiveResult(obj.id, correct ? 'correct' : 'incorrect');
    cs.showFeedback = true;
    rerenderCard(obj.id);
  }

  function runValidation(obj) {
    var v = obj.validation;
    var cs = getCardState(obj.id);
    switch (v.kind) {
      // ----- matching -----
      case 'matching': {
        var expected = v.expected;
        var keys = Object.keys(expected);
        return keys.every(function (k) { return cs.answers[k] === expected[k]; });
      }
      // ----- multi-correct / categorize -----
      case 'multi-correct':
      case 'categorize': {
        var exp = v.expected;
        return Object.keys(exp).every(function (k) { return cs.answers[k] === exp[k]; });
      }
      // ----- sequence -----
      case 'sequence': {
        var expArr = v.expected;
        if (!cs.order || cs.order.length !== expArr.length) return false;
        return cs.order.every(function (val, i) { return val === expArr[i]; });
      }
      // ----- set -----
      case 'set': {
        var expSet = v.expected;
        if (cs.selected.length !== expSet.length) return false;
        return expSet.every(function (e) { return cs.selected.indexOf(e) >= 0; });
      }
      // ----- numeric -----
      case 'numeric': {
        var n = parseInt(cs.numericValue, 10);
        return n === v.expected;
      }
      // ----- exact -----
      case 'exact': {
        return cs.picked === v.expected;
      }
      // ----- state (multi-field forms) -----
      case 'state': {
        return validateState(obj);
      }
      // ----- threshold-tune -----
      case 'threshold-tune': {
        return validateThresholdTune(obj);
      }
      default:
        return false;
    }
  }

  // Validate the various state-form objectives.
  function validateState(obj) {
    var cs = getCardState(obj.id);
    var expected = obj.validation.expected;
    if (obj.id === 'OBJ-M10') {
      var s = cs.state || {};
      return String(s.whitelist || '').indexOf(expected.whitelistContains) >= 0
        && (parseInt(s.threshold, 10) || 0) >= expected.thresholdAtLeast
        && !!s.enabled === !!expected.enabled;
    }
    if (obj.id === 'OBJ-H3') {
      var st = cs.state || { sameIncident: [], noise: [] };
      var sameOk = st.sameIncident.length === expected.sameIncident.length
        && expected.sameIncident.every(function (id) { return st.sameIncident.indexOf(id) >= 0; });
      var noiseOk = st.noise.length === expected.noise.length
        && expected.noise.every(function (id) { return st.noise.indexOf(id) >= 0; });
      return sameOk && noiseOk;
    }
    if (obj.id === 'OBJ-H5') {
      var st2 = cs.state || {};
      return st2.logSource === expected.logSource
        && parseInt(st2.threshold, 10) === expected.threshold
        && parseInt(st2.window, 10) === expected.windowSeconds
        && st2.action === expected.responseAction;
    }
    return false;
  }

  function validateThresholdTune(obj) {
    var cs = getCardState(obj.id);
    var expected = obj.validation.expected;
    var s = cs.state || {};
    return (parseInt(s.count, 10) || 0) >= expected.minCount
      && (parseInt(s.window, 10) || 0) <= expected.maxWindow
      && !!s.enabled === !!expected.stillEnabled;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  window.Objectives = {
    render: render,
    rerenderCard: rerenderCard,
    reset: reset,
    // Exposed for testing / external re-render triggers
    _runValidation: runValidation,
    _getCardState: getCardState,
  };
})();
