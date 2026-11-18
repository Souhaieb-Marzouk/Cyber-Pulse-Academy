/* ===================================================================
   app.js — Bootstrap, event wiring, rendering orchestration
   ===================================================================
   Uses event delegation on #app. Full re-render on most state
   changes (with scroll preservation). Text inputs update state
   silently (no re-render, preserves focus).
   =================================================================== */

(function() {
  'use strict';

  var app = document.getElementById('app');

  /* ----- Render with scroll preservation ----- */
  function render() {
    var scrollY = window.scrollY;
    var focused = document.activeElement;
    var focusedAction = focused ? focused.getAttribute('data-action') : null;
    var focusedId = focused ? focused.id : null;

    app.innerHTML = renderPage();

    // Restore scroll
    window.scrollTo(0, scrollY);

    // If there's a completion modal, trap focus to it
    var modal = app.querySelector('.modal-overlay');
    if (modal) {
      var closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    }
  }

  /* ----- Initial render ----- */
  render();

  /* ===========================================================
     EVENT DELEGATION
     =========================================================== */

  /* ----- Click handler ----- */
  app.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    switch (action) {

      /* --- Mode selection --- */
      case 'select-mode':
        setMode(el.getAttribute('data-mode'));
        render();
        break;

      /* --- Reset --- */
      case 'reset':
        uiState.confirmReset = true;
        render();
        break;
      case 'confirm-reset':
        uiState.confirmReset = false;
        resetLab();
        render();
        break;
      case 'cancel-reset':
        uiState.confirmReset = false;
        render();
        break;

      /* --- Glossary toggle --- */
      case 'toggle-glossary':
        uiState.glossaryOpen = !uiState.glossaryOpen;
        render();
        break;

      /* --- Tab switch --- */
      case 'switch-tab':
        uiState.activeTab = el.getAttribute('data-tab');
        render();
        break;

      /* --- Objective toggle/check/hint --- */
      case 'toggle-objective':
        var oid = el.getAttribute('data-id');
        uiState.expandedObjective = uiState.expandedObjective === oid ? null : oid;
        render();
        break;
      case 'check-objective':
        var oid = el.getAttribute('data-id');
        var passed = checkObjective(oid);
        // Find the objective to get its feedback
        var allObjs = MEDIUM_OBJECTIVES.concat(HARD_OBJECTIVES);
        var obj = null;
        for (var i = 0; i < allObjs.length; i++) { if (allObjs[i].id === oid) { obj = allObjs[i]; break; } }
        uiState.feedback[oid] = { ok: passed, msg: passed ? obj.feedback : 'Not yet — re-read the prompt, work the station, and try again. (Wrong attempts do not reduce stars — only hints do.)' };
        if (passed) uiState.expandedObjective = null;
        render();
        break;
      case 'use-hint':
        var oid = el.getAttribute('data-id');
        // Find the objective
        var allObjs2 = MEDIUM_OBJECTIVES.concat(HARD_OBJECTIVES);
        var obj2 = null;
        for (var j = 0; j < allObjs2.length; j++) { if (allObjs2[j].id === oid) { obj2 = allObjs2[j]; break; } }
        if (obj2 && (uiState.hintLevels[oid] || 0) < obj2.hints.length) {
          useHint(oid);
          uiState.hintLevels[oid] = (uiState.hintLevels[oid] || 0) + 1;
        }
        render();
        break;

      /* --- Quiz answer --- */
      case 'answer-quiz':
        var mode = state.selectedMode;
        var qr = state.quizRecords[mode];
        if (qr.submitted) return; // locked
        var qid = el.getAttribute('data-qid');
        var oi = parseInt(el.getAttribute('data-oid'), 10);
        // Find the question
        var questions = mode === 'medium' ? MEDIUM_QUIZ : HARD_QUIZ;
        var q = null;
        for (var k = 0; k < questions.length; k++) { if (questions[k].id === qid) { q = questions[k]; break; } }
        if (!q) return;
        // Single-choice (mc): replace; multi-select (ms): toggle
        var cur = qr.answers[qid] || [];
        var next;
        if (q.type === 'ms') {
          next = cur.indexOf(oi) !== -1 ? cur.filter(function(i) { return i !== oi; }) : cur.concat([oi]);
        } else {
          next = [oi];
        }
        setQuizAnswer(mode, qid, next);
        render();
        break;

      /* --- Quiz submit --- */
      case 'submit-quiz':
        var mode = state.selectedMode;
        var questions = mode === 'medium' ? MEDIUM_QUIZ : HARD_QUIZ;
        var qr = state.quizRecords[mode];
        var score = 0;
        questions.forEach(function(q) {
          var ans = qr.answers[q.id] || [];
          if (ans.length === q.correct.length && ans.every(function(i) { return q.correct.indexOf(i) !== -1; })) score++;
        });
        submitQuiz(mode, score);
        render();
        // Scroll to quiz results
        var quizEl = document.getElementById('quiz');
        if (quizEl) quizEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;

      /* --- Completion modal --- */
      case 'dismiss-completion':
        dismissCompletion();
        render();
        break;
      case 'overlay-click':
        // Only close if clicking the overlay itself, not the modal content
        if (e.target === el) {
          dismissCompletion();
          render();
        }
        break;

      /* --- Sequencer: process steps --- */
      case 'add-process':
        addToSequencer('processOrder', el.getAttribute('data-id'));
        break;
      case 'remove-process':
        removeFromSequencer('processOrder', el.getAttribute('data-id'));
        break;
      case 'move-process':
        moveInSequencer('processOrder', el.getAttribute('data-id'), parseInt(el.getAttribute('data-dir'), 10));
        break;

      /* --- Sequencer: rollback steps --- */
      case 'add-rollback':
        addToSequencer('rollbackOrder', el.getAttribute('data-id'));
        break;
      case 'remove-rollback':
        removeFromSequencer('rollbackOrder', el.getAttribute('data-id'));
        break;
      case 'move-rollback':
        moveInSequencer('rollbackOrder', el.getAttribute('data-id'), parseInt(el.getAttribute('data-dir'), 10));
        break;

      /* --- Sequencer: audit trail reconstruction --- */
      case 'add-order':
        addToSequencer('reconstructedOrder', el.getAttribute('data-id'));
        break;
      case 'remove-order':
        removeFromSequencer('reconstructedOrder', el.getAttribute('data-id'));
        break;
      case 'move-order':
        moveInSequencer('reconstructedOrder', el.getAttribute('data-id'), parseInt(el.getAttribute('data-dir'), 10));
        break;

      /* --- Drift toggle --- */
      case 'toggle-drift':
        toggleArrayItem('identifiedDrifts', el.getAttribute('data-id'));
        render();
        break;

      /* --- Violation toggles --- */
      case 'toggle-violation-event':
        toggleArrayItem('identifiedViolations', el.getAttribute('data-violation'));
        render();
        break;
      case 'toggle-violation':
        toggleArrayItem('identifiedViolations', el.getAttribute('data-id'));
        render();
        break;

      /* --- Checkbox-style toggles (labels) --- */
      case 'toggle-incident':
        toggleArrayItem('incidentFailures', el.getAttribute('data-id'));
        render();
        break;
      case 'toggle-decision':
        toggleArrayItem('incidentFailures', el.getAttribute('data-id'));
        render();
        break;
      case 'toggle-doc':
        var did = el.getAttribute('data-id');
        state.env.docChecks[did] = !state.env.docChecks[did];
        notify();
        render();
        break;
      case 'toggle-m1':
        state.env.docChecks['__m1_read'] = !state.env.docChecks['__m1_read'];
        notify();
        render();
        break;
    }
  });

  /* ----- Change handler (for select elements) ----- */
  app.addEventListener('change', function(e) {
    var el = e.target;
    if (el.tagName !== 'SELECT') return;
    var action = el.getAttribute('data-action');
    if (!action) return;
    var val = el.value;

    switch (action) {
      case 'set-classification':
        state.env.rfcClassifications[el.getAttribute('data-rfc')] = val;
        notify();
        break;
      case 'set-approval':
        state.env.rfcApprovals[el.getAttribute('data-rfc')] = val;
        notify();
        break;
      case 'set-missing-field':
        state.env.rfcMissingFields[el.getAttribute('data-rfc')] = val;
        notify();
        break;
      case 'set-match':
        state.env.failureMatches[el.getAttribute('data-failure')] = val;
        notify();
        break;
    }
    // No re-render needed for selects — they reflect their own state
  });

  /* ----- Input handler (for text/textarea — silent state update, no re-render) ----- */
  app.addEventListener('input', function(e) {
    var el = e.target;
    if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return;
    var action = el.getAttribute('data-action');
    if (!action) return;

    switch (action) {
      case 'set-impact':
        state.env.impactAnswers[el.getAttribute('data-field')] = el.value;
        saveState();
        break;
      case 'set-h3-control':
        state.env.impactAnswers['h3_control'] = el.value;
        saveState();
        break;
      case 'set-h6-break':
        state.env.impactAnswers['h6_break'] = el.value;
        saveState();
        break;
      case 'set-justification':
        state.env.justificationText = el.value;
        saveState();
        break;
    }
    // No re-render — preserves focus and cursor position
  });

  /* ===========================================================
     SEQUENCER HELPERS
     =========================================================== */
  function addToSequencer(orderKey, id) {
    if (state.env[orderKey].indexOf(id) !== -1) return;
    state.env[orderKey].push(id);
    notify();
    render();
  }

  function removeFromSequencer(orderKey, id) {
    state.env[orderKey] = state.env[orderKey].filter(function(x) { return x !== id; });
    notify();
    render();
  }

  function moveInSequencer(orderKey, id, dir) {
    var arr = state.env[orderKey];
    var idx = arr.indexOf(id);
    if (idx === -1) return;
    var ni = idx + dir;
    if (ni < 0 || ni >= arr.length) return;
    var tmp = arr[idx]; arr[idx] = arr[ni]; arr[ni] = tmp;
    notify();
    render();
  }

  function toggleArrayItem(envKey, id) {
    var arr = state.env[envKey];
    var idx = arr.indexOf(id);
    if (idx !== -1) arr.splice(idx, 1);
    else arr.push(id);
    notify();
  }

  /* ===========================================================
     KEYBOARD: ESC to close modal
     =========================================================== */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var modal = app.querySelector('.modal-overlay');
      if (modal) {
        dismissCompletion();
        render();
      } else if (uiState.confirmReset) {
        uiState.confirmReset = false;
        render();
      }
    }
  });

  /* ===========================================================
     RESIZE: re-render to update responsive layout if needed
     =========================================================== */
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // CSS handles responsiveness; no re-render needed
    }, 150);
  });

})();
