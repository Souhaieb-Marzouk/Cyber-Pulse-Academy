/* ============================================================================
 * Indicator Bay 02 - application bootstrap (js/app.js)
 * ----------------------------------------------------------------------------
 * Ported from src/components/lab/Lab.tsx: mode gate, briefing gate, the world
 * (header + board + dock + deskwork + guide + quiz + report), mobile channel
 * navigation, the reset confirmation and the completion modal.
 * ========================================================================== */

'use strict';

(function () {
  var UI = window.LAB_UI;
  var h = UI.h;
  var icon = UI.icon;
  var STORE = window.LAB_STATE;
  var ENGINE = window.LAB_ENGINE;
  var DATA = window.LAB_DATA;

  /* UI-only state (never persisted) - the direct equivalents of the original
     component-level React useState hooks. */
  var ui = {
    channel: 'dock', // 'board' | 'dock' | 'desk' | 'guide' | 'quiz' | 'report'
    selectedId: null,
    feedback: {}, // objectiveId -> { pass, detail }
    expanded: {}, // objectiveId -> bool (default: first objective open)
    openTerm: null,
    briefingOpen: false,
    completionOpen: false,
    resetOpen: false,
    matchShuffles: {}, // panelId -> shuffled pairs (stable per session)
    isMobile: null, // (max-width: 1023px) - matches the original breakpoint
    modalCleanup: null, // ESC-listener cleanup for the dialog currently open
    loupeScrollPending: false,
  };

  var root;

  /* ----------------------------- derived ------------------------------ */

  function computeRevealed(state, mode) {
    var map = {};
    if (!mode) return map;
    var objs = ENGINE.objectivesFor(mode);
    for (var i = 0; i < objs.length; i++) {
      var obj = objs[i];
      var res = state.results[obj.id];
      var checked = res && res.attempts > 0;
      if (!checked) continue;
      for (var j = 0; j < obj.items.length; j++) {
        var id = obj.items[j];
        var item = ENGINE.evidenceById(id);
        if (!item) continue; // beacon-board scenario ids are not evidence items
        var s = state.stamps[id];
        if (item.benign) {
          if (s && s.disposition === 'Cleared - benign, tune the alert' && state.benignRationale[id] === item.benign.rationale) {
            map[id] = true;
          }
        } else if (s && s.family === item.family && s.type === item.type) {
          map[id] = true;
        }
      }
    }
    return map;
  }

  function computeFlagged(state, mode) {
    var map = {};
    if (!mode) return map;
    var objs = ENGINE.objectivesFor(mode);
    for (var i = 0; i < objs.length; i++) {
      var obj = objs[i];
      if (obj.kind !== 'stamps') continue;
      var r = state.results[obj.id];
      if (!r || r.passed) continue;
      for (var j = 0; j < obj.items.length; j++) {
        var id = obj.items[j];
        var item = ENGINE.evidenceById(id);
        if (!item) continue;
        var s = state.stamps[id];
        if (s && s.family && s.type && (s.family !== item.family || s.type !== item.type)) {
          map[id] = true;
        }
      }
    }
    return map;
  }

  function activeObjective(state) {
    if (state.mode !== 'medium') return null;
    var objs = DATA.MEDIUM_OBJECTIVES;
    for (var i = 0; i < objs.length; i++) {
      var r = state.results[objs[i].id];
      if (!r || !r.passed) return objs[i];
    }
    return null;
  }

  /* ------------------------------ actions ----------------------------- */

  var actions = {
    onSelect: function (id) {
      ui.selectedId = id;
      if (ui.isMobile && ui.channel !== 'dock') ui.channel = 'dock';
      ui.loupeScrollPending = ui.isMobile;
      render();
    },
    onStamp: function (id, patch) {
      STORE.update(function (prev) {
        var cur = prev.stamps[id] || {};
        var next = {};
        for (var k in cur) next[k] = cur[k];
        for (var k2 in patch) {
          if (patch[k2] === undefined) delete next[k2];
          else next[k2] = patch[k2];
        }
        var stamps = shallowCopy(prev.stamps);
        stamps[id] = next;
        return Object.assign({}, prev, { stamps: stamps });
      });
    },
    onRationale: function (id, val) {
      STORE.update(function (prev) {
        var r = shallowCopy(prev.benignRationale);
        r[id] = val;
        return Object.assign({}, prev, { benignRationale: r });
      });
    },
    onMatch: function (pid, leftId, val) {
      STORE.update(function (prev) {
        var m = shallowCopy(prev.match);
        m[pid + ':' + leftId] = val;
        return Object.assign({}, prev, { match: m });
      });
    },
    onBeacon: function (sid, val) {
      STORE.update(function (prev) {
        var b = shallowCopy(prev.beacon);
        b[sid] = val;
        return Object.assign({}, prev, { beacon: b });
      });
    },
    onIocPick: function (itemId, val) {
      STORE.update(function (prev) {
        var p = shallowCopy(prev.iocPick);
        p[itemId] = val;
        return Object.assign({}, prev, { iocPick: p });
      });
    },
    onRouteSelect: function (itemId, val) {
      STORE.update(function (prev) {
        var stamps = shallowCopy(prev.stamps);
        var cur = stamps[itemId] || {};
        var next = shallowCopy(cur);
        next.disposition = val;
        stamps[itemId] = next;
        return Object.assign({}, prev, { stamps: stamps });
      });
    },
    onSequenceAppend: function (sid) {
      STORE.update(function (prev) {
        return Object.assign({}, prev, { sequence: prev.sequence.concat([sid]) });
      });
    },
    onSequenceMove: function (idx, dir) {
      STORE.update(function (prev) {
        var seq = prev.sequence.slice();
        var j = idx + dir;
        if (j < 0 || j >= seq.length) return prev;
        var tmp = seq[idx];
        seq[idx] = seq[j];
        seq[j] = tmp;
        return Object.assign({}, prev, { sequence: seq });
      });
    },
    onSequenceRemove: function (idx) {
      STORE.update(function (prev) {
        var seq = prev.sequence.slice();
        seq.splice(idx, 1);
        return Object.assign({}, prev, { sequence: seq });
      });
    },
    onCheck: function (obj) {
      var state = STORE.getState();
      var v = ENGINE.validateObjective(state, obj);
      ui.feedback[obj.id] = v;
      STORE.update(function (prev) {
        var pv = ENGINE.validateObjective(prev, obj);
        var prevRes = prev.results[obj.id];
        var attempts = ((prevRes && prevRes.attempts) || 0) + 1;
        var firstTry = prevRes ? prevRes.firstTry : pv.pass;
        var results = shallowCopy(prev.results);
        results[obj.id] = { attempts: attempts, passed: pv.pass, firstTry: firstTry };
        return Object.assign({}, prev, { results: results });
      });
      render(); // feedback lives in ui state - reflect it immediately
    },
    onHint: function (obj) {
      STORE.update(function (prev) {
        var hints = shallowCopy(prev.hints);
        hints[obj.id] = Math.min((prev.hints[obj.id] || 0) + 1, 3);
        var nudge = shallowCopy(prev.nudgeUsed);
        nudge[obj.id] = true;
        return Object.assign({}, prev, { hints: hints, nudgeUsed: nudge });
      });
    },
    onAnswer: function (qid, idx) {
      var mode = STORE.getState().mode;
      STORE.update(function (prev) {
        var quiz = shallowCopy(prev.quiz);
        quiz[qid] = idx;
        var total = mode === 'medium' ? 6 : 7;
        var quizDone = Object.keys(quiz).length >= total;
        return Object.assign({}, prev, { quiz: quiz, quizDone: quizDone });
      });
    },
    selectMode: function (m) {
      STORE.update(function (prev) {
        return Object.assign({}, prev, { mode: m });
      });
      ui.channel = 'dock';
    },
    acceptBriefing: function (what) {
      if (what === 'accept') {
        STORE.update(function (prev) {
          return Object.assign({}, prev, { acceptedBriefing: true });
        });
      } else {
        render();
      }
    },
    setChannel: function (c) {
      ui.channel = c;
      render();
    },
    scrollDock: function () {
      var dock = document.getElementById('dock');
      if (dock) dock.scrollIntoView({ behavior: 'smooth' });
    },
    endShift: function () {
      STORE.update(function (prev) {
        return Object.assign({}, prev, { completedAt: prev.completedAt || Date.now() });
      });
      ui.completionOpen = true;
      render();
    },
    closeCompletion: function () {
      if (ui.modalCleanup) {
        ui.modalCleanup();
        ui.modalCleanup = null;
      }
      ui.completionOpen = false;
      render();
    },
    openReset: function () {
      ui.resetOpen = true;
      render();
      window.setTimeout(function () {
        var cancel = document.querySelector('.reset-dialog .btn-ghost');
        if (cancel) cancel.focus();
      }, 0);
    },
    closeReset: function () {
      ui.resetOpen = false;
      render();
    },
    wipeBoard: function () {
      ui.feedback = {};
      ui.selectedId = null;
      ui.completionOpen = false;
      cleanupModal();
      STORE.reset(); // triggers render via subscribe
    },
  };

  function shallowCopy(obj) {
    var out = {};
    for (var k in obj) out[k] = obj[k];
    return out;
  }

  function cleanupModal() {
    if (ui.modalCleanup) {
      ui.modalCleanup();
      ui.modalCleanup = null;
    }
    if (ui.resetEscCleanup) {
      ui.resetEscCleanup();
      ui.resetEscCleanup = null;
    }
  }

  /* ------------------------------ screens ----------------------------- */

  function ModeGate() {
    return h(
      'div',
      { class: 'gate-screen' },
      h(
        'div',
        { class: 'gate-card animate-rise' },
        h(
          'div',
          { class: 'gate-head' },
          h('div', { class: 'gate-emblem', html: window.ICONS.icon('Ship', 'gate-ship') }),
          h('p', { class: 'kicker kicker-wide' }, 'Meridian Freight & Haulage · security operations'),
          h('h1', { class: 'gate-title' }, 'Indicator Bay 02'),
          h(
            'p',
            { class: 'gate-sub' },
            'Interactive practice lab · CompTIA Security+ SY0-801 · Lesson: Analyze indicators of malicious activity',
          ),
          h(
            'p',
            { class: 'gate-note' },
            'All data is synthetic training data. Choose your shift to begin - the same evidence racks, two very different experiences.',
          ),
        ),
        h(
          'div',
          { class: 'mode-grid' },
          h(
            'button',
            {
              type: 'button',
              class: 'mode-card mode-card-medium',
              onClick: function () { actions.selectMode('medium'); },
            },
            h(
              'p',
              { class: 'mode-kicker kicker-medium' },
              icon('Anchor', 'i-base'),
              ' Day shift',
            ),
            h('h2', { class: 'mode-name' }, 'Guided training'),
            h(
              'ul',
              { class: 'mode-list' },
              h('li', null, '· 12 guided objectives, introduced one by one'),
              h('li', null, '· Where-to-look highlights and free 3-tier hints'),
              h('li', null, '· Tolerant checks: wrong answers teach, not punish'),
              h('li', null, '· Concept quiz after practice'),
            ),
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'mode-card mode-card-hard',
              onClick: function () { actions.selectMode('hard'); },
            },
            h(
              'p',
              { class: 'mode-kicker kicker-hard' },
              icon('Flag', 'i-base'),
              ' Night shift',
            ),
            h('h2', { class: 'mode-name' }, 'Solo screening'),
            h(
              'ul',
              { class: 'mode-list' },
              h('li', null, '· 9 broad objectives - full racks, no pointers'),
              h('li', null, '· Noisy evidence with planted false positives'),
              h('li', null, '· Strict validation: exact types, exact calls'),
              h('li', null, '· One optional nudge, and it costs stars'),
            ),
          ),
        ),
      ),
    );
  }

  function Header(state, eligible) {
    var mode = state.mode;
    var objs = ENGINE.objectivesFor(mode);
    var passedCount = objs.filter(function (o) { return state.results[o.id] && state.results[o.id].passed; }).length;

    return h(
      'header',
      { class: 'lab-header' },
      h(
        'div',
        { class: 'lab-header-inner' },
        h(
          'div',
          { class: 'brand' },
          icon('Ship', 'i-lg i-amber'),
          h(
            'div',
            null,
            h('p', { class: 'brand-title' }, 'Indicator Bay 02'),
            h('p', { class: 'brand-sub' }, 'SY0-801 · indicators of malicious activity'),
          ),
        ),
        h(
          'div',
          { class: 'header-actions' },
          h(
            'span',
            { class: 'mode-badge ' + (mode === 'medium' ? 'mode-badge-medium' : 'mode-badge-hard') },
            mode === 'medium' ? 'Day shift · guided' : 'Night shift · strict',
          ),
          h(
            'span',
            { class: 'obj-counter' },
            icon('Gauge', 'i-sm i-amber'),
            ' ' + passedCount + '/' + objs.length + ' objectives',
          ),
          eligible
            ? h(
                'button',
                { type: 'button', class: 'btn btn-end', onClick: actions.endShift },
                icon('Trophy', 'i-sm'),
                'End shift',
              )
            : null,
          h(
            'button',
            { type: 'button', class: 'btn btn-outline btn-reset', onClick: actions.openReset },
            icon('Eraser', 'i-sm'),
            'Reset',
          ),
        ),
      ),
    );
  }

  function World(state) {
    var mode = state.mode;
    var isMobile = ui.isMobile;
    var eligible = ENGINE.allObjectivesPassed(state, mode) && state.quizDone;
    var show = function (c) { return !isMobile || ui.channel === c; };

    var deps = {
      state: state,
      mode: mode,
      ui: ui,
      actions: actions,
      render: render,
      activeObj: activeObjective(state),
      flagged: computeFlagged(state, mode),
      revealed: computeRevealed(state, mode),
      locateIds: (function () {
        var m = {};
        var ao = activeObjective(state);
        if (ao) for (var i = 0; i < ao.items.length; i++) m[ao.items[i]] = true;
        return m;
      })(),
    };

    var boardCol = h(
      'div',
      { class: show('board') ? 'board-col' : 'board-col hidden-col' },
      window.LAB_BOARD.Board(deps),
      isMobile
        ? h(
            'button',
            { type: 'button', class: 'btn btn-to-dock', onClick: function () { actions.setChannel('dock'); } },
            'To the screening dock',
          )
        : null,
    );

    var rightCol = h(
      'div',
      { class: 'right-col' },
      show('dock') ? window.LAB_DOCK.Dock(deps) : null,
      show('desk') ? window.LAB_DESK.Deskwork(deps) : null,
      show('guide') ? window.LAB_SECTIONS.FieldGuide(ui, render) : null,
      show('quiz') ? window.LAB_QUIZ.QuizSection(deps) : null,
      show('report') ? window.LAB_SECTIONS.Debrief() : null,
      !isMobile
        ? window.LAB_SECTIONS.Briefing(mode, actions.scrollDock, true, ui)
        : null,
    );

    var channels = [
      ['board', 'Board'],
      ['dock', 'Dock'],
      ['desk', 'Desk'],
      ['guide', 'Guide'],
      ['quiz', 'Quiz'],
      ['report', 'Report'],
    ];

    var mobileNav = isMobile
      ? h(
          'nav',
          { class: 'channel-nav', 'aria-label': 'Lab channels' },
          h(
            'div',
            { class: 'channel-grid' },
            channels.map(function (pair) {
              var c = pair[0];
              return h(
                'button',
                {
                  type: 'button',
                  class: 'channel-btn' + (ui.channel === c ? ' channel-active' : ''),
                  'aria-current': ui.channel === c ? 'true' : undefined,
                  onClick: function () { actions.setChannel(c); },
                },
                pair[1],
              );
            }),
          ),
        )
      : null;

    var floatingEnd =
      eligible && isMobile && !ui.completionOpen
        ? h(
            'button',
            { type: 'button', class: 'floating-end', onClick: actions.endShift },
            icon('Trophy', 'i-sm'),
            'End shift',
          )
        : null;

    return h(
      'div',
      { class: 'lab-world' },
      Header(state, eligible),
      h('main', { class: 'lab-main' }, boardCol, rightCol),
      mobileNav,
      floatingEnd,
    );
  }

  /* ------------------------------- dialogs ----------------------------- */

  function ResetDialog() {
    var overlay = h(
      'div',
      {
        class: 'modal-overlay',
        role: 'alertdialog',
        'aria-modal': 'true',
        'aria-labelledby': 'reset-title',
        'aria-describedby': 'reset-desc',
      },
      h(
        'div',
        { class: 'modal-box reset-dialog modal-box-sm' },
        h(
          'div',
          { class: 'reset-body' },
          h('h2', { id: 'reset-title', class: 'reset-title' }, 'Wipe the board and restart the shift?'),
          h(
            'p',
            { id: 'reset-desc', class: 'reset-desc' },
            'This clears every stamp, check, hint and quiz answer, returning the lab to a pristine shift. This cannot be undone.',
          ),
          h(
            'div',
            { class: 'reset-actions' },
            h('button', { type: 'button', class: 'btn btn-ghost', onClick: actions.closeReset }, 'Keep my shift'),
            h('button', { type: 'button', class: 'btn btn-danger', onClick: actions.wipeBoard }, 'Wipe board'),
          ),
        ),
      ),
    );
    // Radix AlertDialog parity: ESC dismisses; outside click does NOT.
    var onKey = function (e) {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', onKey);
        actions.closeReset();
      }
    };
    window.addEventListener('keydown', onKey);
    overlay._cleanupKey = function () {
      window.removeEventListener('keydown', onKey);
    };
    return overlay;
  }

  /* ------------------------------ rendering ---------------------------- */

  function render() {
    var snap = UI.snapshot();
    cleanupModal();
    var state = STORE.getState();

    root.innerHTML = '';

    if (!state.mode) {
      root.appendChild(ModeGate());
    } else if (!state.acceptedBriefing) {
      root.appendChild(
        h(
          'div',
          { class: 'gate-screen' },
          h('div', { class: 'gate-card animate-rise' }, window.LAB_SECTIONS.Briefing(state.mode, actions.acceptBriefing, false, ui)),
        ),
      );
    } else {
      var world = World(state);
      root.appendChild(world);
      if (ui.completionOpen) {
        var modal = window.LAB_MODAL.CompletionModal(state, state.mode, actions.closeCompletion, function () {
          actions.wipeBoard();
        });
        ui.modalCleanup = modal._cleanupKey || null;
        root.appendChild(modal);
      } else if (ui.resetOpen) {
        var resetDialog = ResetDialog();
        ui.modalCleanup = resetDialog._cleanupKey || null;
        root.appendChild(resetDialog);
      }
    }

    UI.restore(snap);

    if (ui.loupeScrollPending) {
      ui.loupeScrollPending = false;
      var loupe = root.querySelector('.loupe');
      if (loupe) loupe.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* -------------------------------- boot ------------------------------- */

  function boot() {
    root = document.getElementById('app-root');

    // Responsive channel detection - same breakpoint as the original.
    var mq = window.matchMedia('(max-width: 1023px)');
    var applyMq = function () {
      ui.isMobile = mq.matches;
      render();
    };
    if (mq.addEventListener) mq.addEventListener('change', applyMq);
    else mq.addListener(applyMq);
    ui.isMobile = mq.matches;

    // Load persisted shift, then save on every subsequent state change
    // (same save/restore semantics as the original useLabState).
    STORE.update(function () {
      return STORE.loadState();
    });
    STORE.subscribe(function () {
      render();
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
