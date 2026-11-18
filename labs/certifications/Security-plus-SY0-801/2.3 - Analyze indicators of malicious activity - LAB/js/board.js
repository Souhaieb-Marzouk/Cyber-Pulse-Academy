/* ============================================================================
 * Indicator Bay 02 - objectives board (js/board.js)
 * ----------------------------------------------------------------------------
 * The shift-log objectives tracker with hints, the response-plan editor and
 * CHECK RESULTS feedback, ported from src/components/lab/Board.tsx.
 * UI-only bits (which row is expanded) live in the app's ui state, exactly
 * like the original React useState - they are not persisted.
 * ========================================================================== */

'use strict';

window.LAB_BOARD = (function () {
  var UI = window.LAB_UI;
  var h = UI.h;
  var icon = UI.icon;
  var ENGINE = window.LAB_ENGINE;
  var DATA = window.LAB_DATA;
  var CONST = ENGINE.CONST;

  /**
   * Render the objectives board.
   * deps: { state, mode, ui (expanded/feedback), actions }
   */
  function Board(deps) {
    var state = deps.state;
    var mode = deps.mode;
    var objs = ENGINE.objectivesFor(mode);
    var passed = objs.filter(function (o) { return state.results[o.id] && state.results[o.id].passed; }).length;
    // hard mode: the promised single nudge - once spent anywhere, it is gone
    var nudgeSpent = Object.keys(state.nudgeUsed).some(function (k) { return state.nudgeUsed[k]; });

    var rows = objs.map(function (obj, i) {
      return objectiveRow(obj, i, objs, deps, nudgeSpent);
    });

    return h(
      'aside',
      { class: 'board', 'aria-label': 'Shift log - objectives tracker' },
      h(
        'div',
        { class: 'board-head' },
        h('p', { class: 'kicker' }, 'Shift log'),
        h('h2', { class: 'board-title' }, 'Objectives ' + passed + '/' + objs.length),
        h(
          'div',
          {
            class: 'progress-track',
            role: 'progressbar',
            'aria-valuenow': passed,
            'aria-valuemin': 0,
            'aria-valuemax': objs.length,
            'aria-label': 'Objectives completed: ' + passed + ' of ' + objs.length,
          },
          h('div', { class: 'progress-fill', style: 'width:' + (passed / objs.length) * 100 + '%' }),
        ),
      ),
      h('ol', { class: 'board-list' }, rows),
      h(
        'div',
        { class: 'board-foot' },
        h(
          'p',
          { class: 'board-foot-note' },
          icon('BookMarked', 'i-sm'),
          mode === 'medium'
            ? 'Guided day shift: hints are free, checks are tolerant'
            : 'Night shift alone: one nudge allowed, validation is strict',
        ),
      ),
    );
  }

  function objectiveRow(obj, i, objs, deps, nudgeSpent) {
    var state = deps.state;
    var mode = deps.mode;
    var ui = deps.ui;
    var actions = deps.actions;
    var res = state.results[obj.id];
    var unlocked = ENGINE.isObjectiveUnlocked(state, obj, mode);
    var fb = ui.feedback[obj.id];
    var isOpen = unlocked && (ui.expanded[obj.id] !== undefined ? ui.expanded[obj.id] : i === 0);

    var statusIcon;
    if (res && res.passed) {
      statusIcon = icon('Check', 'i-base i-emerald', 'Passed');
    } else if (!unlocked) {
      statusIcon = icon('Lock', 'i-base i-stone-600', 'Locked - finish previous objectives');
    } else {
      var earlierPassed = i === 0 || objs.slice(0, i).every(function (o) { return state.results[o.id] && state.results[o.id].passed; });
      statusIcon = icon('CircleDot', 'i-base ' + (earlierPassed ? 'i-amber' : 'i-stone-600'), 'Open');
    }

    var body = null;
    if (isOpen) {
      var parts = [
        h(
          'div',
          { class: 'obj-meta' },
          UI.PillarBadge(obj.pillar),
          h('span', { class: 'obj-id' }, obj.id),
        ),
        h('p', { class: 'obj-brief' }, obj.brief),
      ];
      if (obj.extraIocPick) {
        parts.push(
          h(
            'div',
            { class: 'obj-panel' },
            h('label', { class: 'panel-label', 'for': 'iocpick-' + obj.extraIocPick.itemId }, obj.extraIocPick.question),
            UI.Select({
              id: 'iocpick-' + obj.extraIocPick.itemId,
              value: state.iocPick[obj.extraIocPick.itemId] || '',
              disabled: !unlocked,
              placeholder: '- name the IoC -',
              options: CONST.IOC_NAMES.map(function (n) { return { value: n, label: n }; }),
              onChange: function (val) { actions.onIocPick(obj.extraIocPick.itemId, val); },
            }),
          ),
        );
      }
      if (obj.kind === 'plan') parts.push(PlanEditor(state, obj, actions));
      parts.push(actionsRow(obj, res, unlocked, mode, deps, nudgeSpent));
      if (fb) parts.push(feedbackBox(fb, res));
      body = h('div', { class: 'obj-body' }, parts);
    }

    return h(
      'li',
      { id: 'obj-' + obj.id, class: res && res.passed ? 'obj-row obj-passed' : 'obj-row' },
      h(
        'button',
        {
          type: 'button',
          class: 'obj-toggle',
          'data-key': 'toggle-' + obj.id,
          'aria-expanded': isOpen ? 'true' : 'false',
          disabled: !unlocked,
          onClick: function () {
            if (unlocked) {
              ui.expanded[obj.id] = !isOpen;
              deps.render();
            }
          },
        },
        h('span', { class: 'obj-status' }, statusIcon),
        h('span', { class: 'obj-label' }, obj.id.slice(4) + ' · ' + obj.title),
        h('span', { class: 'chevron' + (isOpen ? ' chevron-open' : ''), html: window.ICONS.icon('ChevronDown') }),
      ),
      body,
    );
  }

  function actionsRow(obj, res, unlocked, mode, deps, nudgeSpent) {
    var state = deps.state;
    var actions = deps.actions;
    var ui = deps.ui;
    var children = [];

    if (res && res.passed) {
      // QA-11 fix carried over: a passed objective shows a PASSED badge, not a
      // re-checkable button, so attempts can no longer be inflated.
      children.push(
        h(
          'span',
          { class: 'passed-badge' },
          icon('Check', 'i-sm'),
          'Passed',
        ),
      );
    } else {
      children.push(
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-primary',
            disabled: !unlocked,
            onClick: function () { actions.onCheck(obj); },
          },
          icon('Send', 'i-sm'),
          'Check results',
        ),
      );
    }

    if (mode === 'medium' && obj.hints && !(res && res.passed) && unlocked) {
      children.push(
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-ghost',
            onClick: function () { actions.onHint(obj); },
          },
          icon('Lightbulb', 'i-sm'),
          'Hint (' + (state.hints[obj.id] || 0) + '/3)',
        ),
      );
    }

    if (mode === 'hard' && !(res && res.passed) && !nudgeSpent) {
      children.push(
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-ghost btn-nudge',
            'aria-label': 'Spend the one shift nudge - costs star rating',
            onClick: function () { actions.onHint(obj); },
          },
          icon('Lightbulb', 'i-sm'),
          'Spend nudge (costs stars)',
        ),
      );
    }

    var hintCount = state.hints[obj.id] || 0;
    if (hintCount > 0) {
      var hintList = (obj.hints || ['Sweep the racks for items that contradict their own story.']).slice(0, hintCount);
      children.push(
        h(
          'div',
          { class: 'hint-stack', 'aria-live': 'polite' },
          hintList.map(function (hintText, hi) {
            return h('p', { class: 'hint-line' }, 'hint ' + (hi + 1) + ': ' + hintText);
          }),
        ),
      );
    }

    if (state.nudgeUsed[obj.id]) {
      children.push(
        h(
          'p',
          { class: 'nudge-line' },
          'nudge: re-read the objective brief, then sweep the racks lane by lane - the evidence is self-describing.',
        ),
      );
    }

    return h('div', { class: 'obj-actions' }, children);
  }

  function feedbackBox(fb, res) {
    return h(
      'div',
      { class: 'feedback ' + (fb.pass ? 'feedback-pass' : 'feedback-fail'), 'aria-live': 'polite' },
      h(
        'p',
        { class: 'feedback-title ' + (fb.pass ? 'text-emerald' : 'text-red') },
        fb.pass
          ? 'Check passed - ' + (res && res.attempts === 1 ? 'first attempt' : 'after ' + res.attempts + ' attempts')
          : 'Check failed',
      ),
      fb.detail.map(function (d) {
        return h('p', { class: 'feedback-detail' }, d);
      }),
      fb.pass
        ? h(
            'p',
            { class: 'feedback-note' },
            'A defender logs this objective in the shift report and carries the pattern forward - you can now recognize it in the remaining evidence.',
          )
        : null,
    );
  }

  /* ----------------------------- PlanEditor --------------------------- */

  function PlanEditor(state, obj, actions) {
    var remaining = DATA.RESPONSE_STEPS.filter(function (s) { return state.sequence.indexOf(s.id) === -1; });

    var seqItems = state.sequence.map(function (sid, idx) {
      var step = null;
      for (var i = 0; i < DATA.RESPONSE_STEPS.length; i++) {
        if (DATA.RESPONSE_STEPS[i].id === sid) step = DATA.RESPONSE_STEPS[i];
      }
      return h(
        'li',
        { class: 'seq-item' },
        h('span', { class: 'seq-num' }, idx + 1 + '.'),
        h('span', { class: 'seq-text' }, step ? step.text : sid),
        h('button', {
          type: 'button',
          class: 'icon-btn',
          'aria-label': 'Move step ' + (idx + 1) + ' up',
          html: window.ICONS.icon('ArrowUp'),
          onClick: function () { actions.onSequenceMove(idx, -1); },
        }),
        h('button', {
          type: 'button',
          class: 'icon-btn',
          'aria-label': 'Move step ' + (idx + 1) + ' down',
          html: window.ICONS.icon('ArrowDown'),
          onClick: function () { actions.onSequenceMove(idx, 1); },
        }),
        h('button', {
          type: 'button',
          class: 'icon-btn',
          'aria-label': 'Remove step ' + (idx + 1),
          html: window.ICONS.icon('X'),
          onClick: function () { actions.onSequenceRemove(idx); },
        }),
      );
    });

    var remainingBtns = remaining.map(function (s) {
      return h(
        'button',
        {
          type: 'button',
          class: 'seq-add',
          onClick: function () { actions.onSequenceAppend(s.id); },
        },
        '+ ' + (s.text.length > 34 ? s.text.slice(0, 34) + '...' : s.text),
      );
    });

    var routeSelects = (obj.routeItems || []).map(function (r) {
      return h(
        'div',
        null,
        h('label', { class: 'route-label', 'for': 'route-' + r.itemId }, r.itemId + ' - route as:'),
        UI.Select({
          id: 'route-' + r.itemId,
          value: (state.stamps[r.itemId] && state.stamps[r.itemId].disposition) || '',
          placeholder: '- choose disposition -',
          options: CONST.DISPOSITIONS
            .filter(function (d) { return d !== 'Cleared - benign, tune the alert'; })
            .map(function (d) { return { value: d, label: d }; }),
          onChange: function (val) { actions.onRouteSelect(r.itemId, val); },
        }),
      );
    });

    return h(
      'div',
      { class: 'obj-panel plan-editor' },
      obj.sequenceTitle ? h('p', { class: 'seq-title' }, obj.sequenceTitle) : null,
      h(
        'div',
        null,
        h('p', { class: 'panel-label' }, 'Response sequence - build it in order'),
        h('ol', { class: 'seq-list', 'aria-label': 'Ordered response sequence' }, seqItems),
        remainingBtns.length > 0 ? h('div', { class: 'seq-remaining' }, remainingBtns) : null,
      ),
      h('div', { class: 'routes' }, [h('p', { class: 'panel-label' }, 'Disposition calls')].concat(routeSelects)),
    );
  }

  return { Board: Board };
})();
