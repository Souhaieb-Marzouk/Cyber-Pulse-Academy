// ─── Blueprint Studio · completion modal + reset dialog (static port) ───────
// Vanilla-JS translations of CompletionModal.tsx and the RESET AlertDialog.
// Both render into the page flow when open; app.js owns the open/close
// actions, focus trap, ESC handling and body scroll lock (body.modal-open).

(function () {
  'use strict';

  var Store = window.LabStore;
  var P = window.BP;
  var icon = P.icon;
  var esc = P.esc;

  // ── Completion modal — APPROVED FOR CONSTRUCTION (C7) ─────────────────────

  function renderCompletion() {
    var s = Store.getState();
    if (!s.showCompletion || !s.mode) return '';

    var mode = s.mode;
    var objectives = s.objectives;
    var quiz = s.quiz;
    var sc = Store.starScore(mode, objectives);
    var q = Store.quizScore(mode, quiz);
    var prog = Store.progressFor(mode, objectives);
    var list = Store.objectivesForMode(mode);

    var byPillar = ['P1', 'P2', 'P3', 'P4'].map(function (p) {
      var inPillar = list.filter(function (o) { return o.pillar === p; });
      var done = inPillar.filter(function (o) {
        var st = objectives[o.id];
        return st && st.done;
      }).length;
      return { pillar: p, total: inPillar.length, done: done };
    });

    // R8: focus areas derived from THIS student's actual evidence
    var bank = mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
    var focusAreas = [];
    // 1) quiz items answered wrong → the item's study pointer
    bank.forEach(function (item, i) {
      if (quiz.submitted && quiz.answers[i] !== undefined && quiz.answers[i] !== item.correct && item.focus) {
        focusAreas.push('Quiz Q' + (i + 1) + ': ' + item.focus);
      }
    });
    // 2) objectives that needed retries or hints → their syllabus anchor
    list.forEach(function (o) {
      var st = objectives[o.id];
      if (!st || !st.done) return;
      if (st.attempts > 1) focusAreas.push(o.id + ' took ' + st.attempts + ' attempts — revise: ' + o.anchor + '.');
      else if (st.hintsUsed > 0) focusAreas.push(o.id + ' needed ' + (st.hintsUsed === 1 ? 'a hint' : st.hintsUsed + ' hints') + ' — revise: ' + o.anchor + '.');
    });
    var quizPending = !quiz.submitted;

    var stars = '';
    for (var i = 1; i <= 5; i++) {
      stars += icon('star', i <= sc.stars ? 'lit' : '', i <= sc.stars);
    }

    var recapRows = byPillar.map(function (p) {
      return (
        '<li><span class="p-name">' + esc(p.pillar) + ' · ' + esc(Store.PILLAR_LABEL[p.pillar]) + '</span>' +
        '<span class="p-count">' + p.done + '/' + p.total + ' stamped</span></li>'
      );
    }).join('');

    var focusInner;
    if (quizPending) {
      focusInner =
        '<p>You have not run the inspection quiz yet (Sheet 05) — this report is partial. Stamp all objectives, take the quiz, then reopen this report for a complete focus list.</p>';
    } else if (focusAreas.length === 0) {
      focusInner =
        '<p>Clean run — every objective passed first-try with no hints and the quiz was fully approved. No weak areas detected from your evidence. Your next stretch: take the <strong>' +
        (mode === 'hard' ? 'DRAFTSMAN (Medium)' : 'LEAD ENGINEER (Hard)') +
        '</strong> seat and aim for the same first-try record on the strict validation track.</p>';
    } else {
      focusInner =
        '<ul>' +
        focusAreas.map(function (f) {
          return '<li><span class="arrow">▸</span><span>' + esc(f) + '</span></li>';
        }).join('') +
        '</ul>';
    }

    return (
      '<div class="overlay" data-act="overlay-completion"></div>' +
      '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="completion-title" aria-describedby="completion-desc" data-dialog="completion">' +
      '<button type="button" class="dialog-close" data-act="close-completion" data-fid="close-completion" aria-label="Close completion report">' +
      icon('x', 'ic-16') + '</button>' +
      '<div class="approve-stamp"><p class="l1">APPROVED</p><p class="l2">FOR CONSTRUCTION</p></div>' +
      '<h2 class="dialog-title" id="completion-title">SPEC COMPLETE — ' +
      (mode === 'hard' ? 'LEAD ENGINEER' : 'DRAFTSMAN') + ' CERTIFIED</h2>' +
      '<p class="dialog-desc" id="completion-desc">All ' + prog.total + ' spec items stamped. You can now explain IaC, read real evidence, choose detections, and defend the mitigations.</p>' +
      '<div class="star-row" aria-label="Star rating: ' + sc.stars + ' of 5">' + stars + '</div>' +
      '<p class="score-line">SCORE ' + sc.score + '/100 · ' + sc.firstTryPct + '% FIRST-TRY · ' + sc.hints +
      ' HINT' + (sc.hints === 1 ? '' : 'S') + ' USED' +
      (mode === 'hard' ? ' (nudges cost 5 each)' : ' (hints cost 2 each)') + '</p>' +
      '<p class="score-line">INSPECTION QUIZ ▸ <span style="color:var(--green)">' + q.correct + '/' + q.total + '</span>' +
      (!quiz.submitted ? '<span style="color:var(--amber)"> (not yet submitted — Sheet 05)</span>' : '') + '</p>' +
      '<div class="recap-box">' +
      '<p class="k">MASTERY RECAP BY PILLAR</p>' +
      '<ul>' + recapRows + '</ul>' +
      '<p class="recap-next">NEXT ▸ the other difficulty mode (reset to switch), CV0-004 Domain 2.0’s remaining automation topics, and the official references on Sheet 06.</p>' +
      '</div>' +
      '<div class="focus-box">' +
      '<p class="k">' + icon('crosshair', 'ic-14') + ' FOCUS AREAS FOR YOUR NEXT STUDY BLOCK</p>' +
      focusInner +
      '</div>' +
      '<div class="modal-actions">' +
      '<button type="button" class="btn btn-modal" data-act="goto-notes" data-fid="goto-notes">REVIEW FIELD NOTES</button>' +
      '<button type="button" class="btn btn-modal is-ghost" data-act="close-completion" data-fid="keep-exploring">KEEP EXPLORING</button>' +
      '</div>' +
      '<p class="modal-footnote">' + icon('rotate-ccw', 'ic-12') + ' the top-strip RESET restores the pristine lab at any time</p>' +
      '</div>'
    );
  }

  // ── RESET confirm dialog — SHRED THE DRAWING SET? (F-7) ───────────────────

  function renderResetDialog() {
    return (
      '<div class="overlay" data-act="overlay-reset"></div>' +
      '<div class="dialog dialog-alert" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc" data-dialog="reset">' +
      '<h2 class="alert-title" id="reset-title">SHRED THE DRAWING SET?</h2>' +
      '<p class="alert-desc" id="reset-desc">This erases all stamps, answers, quiz results and environment changes, and returns you to mode selection. The lab returns to pristine state.</p>' +
      '<div class="alert-footer">' +
      '<button type="button" class="btn btn-cancel-action" data-act="close-reset" data-fid="reset-cancel">KEEP WORKING</button>' +
      '<button type="button" class="btn btn-danger-action" data-act="confirm-reset" data-fid="reset-confirm">RESET EVERYTHING</button>' +
      '</div>' +
      '</div>'
    );
  }

  window.BModal = {
    renderCompletion: renderCompletion,
    renderResetDialog: renderResetDialog,
  };
})();
