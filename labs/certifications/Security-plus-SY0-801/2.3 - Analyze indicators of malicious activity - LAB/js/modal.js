/* ============================================================================
 * Indicator Bay 02 - completion modal (js/modal.js)
 * ----------------------------------------------------------------------------
 * The end-of-shift completion report, ported from the CompletionModal in
 * src/components/lab/Sections.tsx with every audit fix carried over:
 *  - X button (44px, focused on open), ESC-to-close and backdrop
 *    click-outside all dismiss the dialog (R7)
 *  - focus areas are derived from the student's ACTUAL performance evidence,
 *    not generic filler (R8)
 * ========================================================================== */

'use strict';

window.LAB_MODAL = (function () {
  var UI = window.LAB_UI;
  var h = UI.h;
  var icon = UI.icon;
  var ENGINE = window.LAB_ENGINE;
  var DATA = window.LAB_DATA;

  function CompletionModal(state, mode, onClose, onReset) {
    var score = ENGINE.scoreLab(state, mode);
    var allObjs = ENGINE.objectivesFor(mode);
    var quizList = mode === 'medium' ? DATA.MEDIUM_QUIZ : DATA.HARD_QUIZ;
    var quizPct = Math.round((score.quizCorrect / score.quizQuestions) * 100);

    var stars = [1, 2, 3, 4, 5].map(function (s) {
      return h('span', {
        class: 'star' + (s <= score.stars ? ' star-lit' : ''),
        html: window.ICONS.icon('Star'),
      });
    });

    var pillarRows = [
      ['P1', 'Understand'],
      ['P2', 'Recognize'],
      ['P3', 'Detect'],
      ['P4', 'Mitigate'],
    ].map(function (pair) {
      var p = pair[0];
      var label = pair[1];
      var doneIds = allObjs
        .filter(function (o) { return o.pillar.indexOf(p) !== -1; })
        .map(function (o) { return o.id; });
      var allDone = doneIds.every(function (id) { return state.results[id] && state.results[id].passed; });
      return h(
        'div',
        { class: 'pillar-row' },
        h(
          'div',
          null,
          h('p', { class: 'pillar-name' }, p + ' · ' + label),
          h('p', { class: 'pillar-ids' }, doneIds.join(', ')),
        ),
        allDone ? UI.Chip('mastered', 'green') : UI.Chip('partial', 'red'),
      );
    });

    /* R8: focus areas derived from real evidence */
    var missedTopics = quizList
      .filter(function (q) { return state.quiz[q.id] !== undefined && state.quiz[q.id] !== q.correct; })
      .map(function (q) { return q.topic; });
    var retryObjectives = allObjs.filter(function (o) {
      return state.results[o.id] && state.results[o.id].passed && !state.results[o.id].firstTry;
    });
    var hintedObjectives = allObjs.filter(function (o) {
      return (state.hints[o.id] || 0) > 0 || state.nudgeUsed[o.id];
    });
    var hasFocusAreas = missedTopics.length > 0 || retryObjectives.length > 0 || hintedObjectives.length > 0;

    var focusHeading = h('h3', { class: 'modal-heading' }, icon('Crosshair', 'i-sm'), 'Focus areas - where to tighten up');
    var focusChildren = [];
    if (hasFocusAreas) {
      if (missedTopics.length > 0) {
        focusChildren.push(
          h(
            'li',
            { class: 'focus-item' },
            h('strong', { class: 'text-strong' }, 'Quiz misses: '),
            missedTopics.join('; ') + '. Re-read the matching family in the Field guide, then take this quiz again for a clean pass.',
          ),
        );
      }
      if (retryObjectives.length > 0) {
        focusChildren.push(
          h(
            'li',
            { class: 'focus-item' },
            h('strong', { class: 'text-strong' }, 'Needed multiple checks: '),
            retryObjectives.map(function (o) { return o.id.slice(4) + ' (' + o.title + ')'; }).join(', ') +
              '. On your re-run, screen those racks without the feedback loop - stamp first, check once.',
          ),
        );
      }
      if (hintedObjectives.length > 0) {
        focusChildren.push(
          h(
            'li',
            { class: 'focus-item' },
            h('strong', { class: 'text-strong' }, 'Hints or nudges used: '),
            hintedObjectives.map(function (o) { return o.id.slice(4); }).join(', ') +
              '. Study those evidence items in the loupe until the key indicator jumps out on its own.',
          ),
        );
      }
    } else {
      focusChildren.push(
        h(
          'p',
          { class: 'focus-clean' },
          'Clean sheet: every objective first-attempt, no hints, quiz perfect. Keep it sharp - re-run the other shift and spot-check the Field guide families you saw least.',
        ),
      );
    }
    var focusContent = hasFocusAreas
      ? [focusHeading, h('ul', { class: 'focus-list' }, focusChildren)]
      : [focusHeading, focusChildren[0]];

    var nextUp = [
      'SY0-801 objective 2.3 - threat vectors and sources (how each family gets delivered).',
      'Objective 2.4 - vulnerabilities and attack surfaces (why the racks were reachable at all).',
      'Domain 4 - security operations: monitoring, incident response and the mitigation objective that turns tonight\u2019s dispositions into controls.',
      'Re-run this shift in the other difficulty mode - the racks change personality.',
    ].map(function (li) { return h('li', null, li); });

    var closeBtn = h('button', {
      type: 'button',
      class: 'modal-x',
      'aria-label': 'Close completion report',
      html: window.ICONS.icon('X'),
      onClick: onClose,
    });

    var overlay = h(
      'div',
      {
        class: 'modal-overlay',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': 'Shift completion report',
        onClick: function (e) {
          if (e.target === e.currentTarget) onClose();
        },
      },
      h(
        'div',
        { class: 'modal-box', 'data-keep-scroll': 'true' },
        closeBtn,
        h(
          'div',
          { class: 'modal-head' },
          h('p', { class: 'kicker' }, 'End of shift'),
          h('h2', { class: 'modal-title' }, 'Screening complete'),
          h('div', { class: 'star-row', 'aria-label': score.stars + ' of 5 stars' }, stars),
          h(
            'p',
            { class: 'modal-score' },
            score.stars + '/5 stars · ' + score.passed + '/' + score.total + ' objectives · ' +
              score.firstTry + ' first-attempt passes · ' + score.hintsUsed + ' hints',
          ),
          h(
            'p',
            { class: 'modal-score' },
            'Compliance review: ' + score.quizCorrect + '/' + score.quizQuestions + ' (' + quizPct + '%)',
          ),
        ),
        h(
          'div',
          { class: 'modal-body' },
          pillarRows,
          h(
            'div',
            { class: hasFocusAreas ? 'focus-box focus-box-warn' : 'focus-box focus-box-clean' },
            focusContent,
          ),
          h(
            'div',
            { class: 'next-box' },
            h('h3', { class: 'modal-heading' }, icon('Swords', 'i-sm'), 'What to learn next'),
            h('ul', { class: 'bullet-list' }, nextUp),
          ),
          h(
            'p',
            { class: 'modal-note' },
            icon('Lightbulb', 'i-sm i-amber'),
            h(
              'span',
              null,
              'You can now explain each family, recognize its variants in raw evidence, choose a detection approach, and name the mitigations and residual risks. That is the full mastery rubric for this chapter.',
            ),
          ),
          h(
            'div',
            { class: 'modal-actions' },
            h('button', { type: 'button', class: 'btn btn-primary btn-flex', onClick: onClose }, 'Back to lab'),
            h(
              'button',
              { type: 'button', class: 'btn btn-ghost btn-danger-hover', onClick: onReset },
              'Wipe board & re-run',
            ),
          ),
        ),
      ),
    );

    // focus the X button on open, wire ESC (R7) - same as the original effect
    window.setTimeout(function () {
      var x = overlay.querySelector('.modal-x');
      if (x) x.focus();
    }, 0);
    var onKey = function (e) {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', onKey);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    overlay._cleanupKey = function () {
      window.removeEventListener('keydown', onKey);
    };

    return overlay;
  }

  return { CompletionModal: CompletionModal };
})();
