// Northwind Hardening Yard - bootstrap + event wiring (static port).
// Mirrors src/app/page.tsx action semantics: control invalidation, answer
// locking, event-driven completion trigger, autosave, reset.
'use strict';

(function () {
  var Store = window.LabStore;
  var Engine = window.LabEngine;
  var UI = window.LabUI;

  // ---------- actions (mirror page.tsx) ----------

  function setMode(m) {
    Store.update(function (s) {
      return Object.assign(window.pristineState(), { mode: m, view: 'briefing' });
    });
  }

  function goTo(view, doc) {
    Store.update(function (s) {
      return Object.assign({}, s, {
        view: view,
        highlightDoc: doc || null,
        openDoc: doc || null,
      });
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setControl(assetId, controlId, value) {
    Store.update(function (s) {
      var mode = s.mode || 'medium';
      var env = Object.assign({}, s.env);
      env[assetId] = Object.assign({}, env[assetId], {});
      env[assetId][controlId] = value;
      return Engine.invalidateTogglesChecks(
        Object.assign({}, s, { env: env }),
        mode,
        assetId,
        controlId
      );
    });
  }

  function setAnswer(id, a) {
    Store.update(function (s) {
      // changing an answer while a passed result is showing invalidates the pass
      // (history preserved; the objective must simply be re-checked)
      var checks = Object.assign({}, s.checks);
      if (checks[id] && checks[id].passed) {
        checks[id] = Object.assign({}, checks[id], { passed: false, revealed: false });
      }
      var answers = Object.assign({}, s.answers);
      answers[id] = a;
      return Object.assign({}, s, { answers: answers, checks: checks });
    });
  }

  function check(id) {
    Store.update(function (s) {
      var mode = s.mode;
      if (!mode) return s;
      var objs = Engine.objectivesFor(mode);
      var obj = null;
      objs.forEach(function (o) {
        if (o.id === id) obj = o;
      });
      if (!obj) return s;
      var passed = Engine.exercisePassed(obj.exercise, s.answers[id], s.env);
      var prev = s.checks[id];
      var next = Object.assign({}, s, {
        checks: Object.assign({}, s.checks, {}),
      });
      next.checks[id] = {
        passed: passed,
        attempts: (prev && prev.attempts ? prev.attempts : 0) + 1,
        firstTry: prev ? prev.firstTry : passed,
        revealed: true,
      };
      return triggerCompletion(next);
    });
  }

  function hint(id) {
    Store.update(function (s) {
      var objs = Engine.objectivesFor(s.mode);
      var found = objs.some(function (o) {
        return o.id === id;
      });
      if (!found) return s;
      var max = s.mode === 'hard' ? 1 : 3;
      var hints = Object.assign({}, s.hints);
      hints[id] = Math.min((hints[id] || 0) + 1, max);
      return Object.assign({}, s, { hints: hints });
    });
  }

  // R2 retake: resets the answer and the shown result, keeps attempt history.
  function retake(id) {
    Store.update(function (s) {
      return Engine.retakeObjective(s, id);
    });
  }

  function toggleObjective(id) {
    Store.update(function (s) {
      return Object.assign({}, s, { openObjective: s.openObjective === id ? null : id });
    });
  }

  function focusObjective(id) {
    // Not exposed as a UI affordance in the original ledger (only used by
    // external calls); kept for parity of behavior.
    Store.update(function (s) {
      var objs = Engine.objectivesFor(s.mode);
      var obj = null;
      objs.forEach(function (o) {
        if (o.id === id) obj = o;
      });
      return Object.assign({}, s, { openObjective: id, view: obj && obj.zone ? obj.zone : s.view });
    });
  }

  function setQuizAnswer(qid, opt) {
    Store.update(function (s) {
      var qa = Object.assign({}, s.quizAnswers);
      qa[qid] = opt;
      return Object.assign({}, s, { quizAnswers: qa });
    });
  }

  function submitQuiz() {
    Store.update(function (s) {
      return triggerCompletion(Object.assign({}, s, { quizSubmitted: true }));
    });
  }

  // event-driven completion trigger (mirrors triggerCompletion in page.tsx)
  function triggerCompletion(s) {
    if (
      s.mode &&
      Engine.allObjectivesPassed(s.mode, s) &&
      s.quizSubmitted &&
      !s.completionSeen
    ) {
      var next = Object.assign({}, s, { completionSeen: true, completionOpen: true });
      // persist the completionSeen flag immediately (setCompletionOpen is UI-only)
      window.saveState(next);
      return next;
    }
    return s;
  }

  function showCompletion() {
    Store.update(function (s) {
      return Object.assign({}, s, { completionOpen: true });
    });
  }

  function closeCompletion() {
    Store.update(function (s) {
      return Object.assign({}, s, { completionOpen: false, completionSeen: true });
    });
  }

  function openReset() {
    Store.update(function (s) {
      return Object.assign({}, s, { resetOpen: true });
    });
  }

  function cancelReset() {
    Store.update(function (s) {
      return Object.assign({}, s, { resetOpen: false });
    });
  }

  function reset() {
    window.clearState();
    Store.set(window.pristineState());
  }

  function accToggle(docId) {
    Store.update(function (s) {
      return Object.assign({}, s, { openDoc: s.openDoc === docId ? null : docId, highlightDoc: null });
    });
  }

  // ---------- event delegation ----------

  function closestAction(el) {
    while (el && el !== document.body) {
      if (el.getAttribute && el.getAttribute('data-action')) return el;
      el = el.parentNode;
    }
    return null;
  }

  document.addEventListener('click', function (ev) {
    var el = closestAction(ev.target);
    if (!el) return;
    var action = el.getAttribute('data-action');
    switch (action) {
      case 'set-mode':
        setMode(el.getAttribute('data-mode'));
        break;
      case 'go':
        goTo(el.getAttribute('data-view'), el.getAttribute('data-doc') || null);
        break;
      case 'go-doc':
        goTo(el.getAttribute('data-view') || 'evidence', el.getAttribute('data-doc') || null);
        break;
      case 'toggle': {
        var s = Store.get();
        var asset = el.getAttribute('data-asset');
        var control = el.getAttribute('data-control');
        var cur = s.env[asset] ? s.env[asset][control] : undefined;
        setControl(asset, control, cur === true ? false : true);
        break;
      }
      case 'answer-radio':
        setAnswer(el.getAttribute('data-id'), el.getAttribute('data-opt'));
        break;
      case 'answer-multi':
        // handled on change event for checkboxes; click on label toggles via input
        break;
      case 'seq-add':
        appendSeq(el.getAttribute('data-id'), el.getAttribute('data-item'));
        break;
      case 'seq-remove':
        removeSeq(el.getAttribute('data-id'), parseInt(el.getAttribute('data-index'), 10));
        break;
      case 'toggle-obj':
        toggleObjective(el.getAttribute('data-id'));
        break;
      case 'check':
        check(el.getAttribute('data-id'));
        break;
      case 'retake':
        retake(el.getAttribute('data-id'));
        break;
      case 'hint':
        hint(el.getAttribute('data-id'));
        break;
      case 'acc-toggle':
        accToggle(el.getAttribute('data-doc'));
        break;
      case 'quiz-answer':
        setQuizAnswer(el.getAttribute('data-qid'), el.getAttribute('data-opt'));
        break;
      case 'quiz-submit':
        submitQuiz();
        break;
      case 'show-completion':
        showCompletion();
        break;
      case 'completion-close':
        closeCompletion();
        break;
      case 'completion-debrief':
        closeCompletion();
        goTo('debrief', null);
        break;
      case 'completion-backdrop':
        // clicking the backdrop closes the dialog (parity with Dialog onOpenChange)
        if (ev.target === el) closeCompletion();
        break;
      case 'reset-open':
        openReset();
        break;
      case 'reset-cancel':
        cancelReset();
        break;
      case 'reset-confirm':
        // close any dialog, then reset to pristine
        window.clearState();
        Store.set(window.pristineState());
        break;
      case 'reset-backdrop':
        if (ev.target === el) cancelReset();
        break;
    }
  });

  function appendSeq(id, itemId) {
    Store.update(function (s) {
      var cur = s.answers[id];
      var seq = Array.isArray(cur) ? cur.slice() : [];
      seq.push(itemId);
      return setAnswerRaw(s, id, seq);
    });
  }

  function removeSeq(id, index) {
    Store.update(function (s) {
      var cur = s.answers[id];
      var seq = Array.isArray(cur) ? cur.slice() : [];
      seq.splice(index, 1);
      return setAnswerRaw(s, id, seq);
    });
  }

  // raw answer set without the passed-check invalidation (sequence clicks go
  // through the same setAnswer path in the original via onAnswer)
  function setAnswerRaw(s, id, a) {
    var checks = Object.assign({}, s.checks);
    if (checks[id] && checks[id].passed) {
      checks[id] = Object.assign({}, checks[id], { passed: false, revealed: false });
    }
    var answers = Object.assign({}, s.answers);
    answers[id] = a;
    return Object.assign({}, s, { answers: answers, checks: checks });
  }

  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (!el || !el.getAttribute) return;
    var action = el.getAttribute('data-action');
    if (!action) return;
    switch (action) {
      case 'choice':
        setControl(el.getAttribute('data-asset'), el.getAttribute('data-control'), el.value);
        break;
      case 'answer-match':
        setAnswer(el.getAttribute('data-id'), updatedMatch(Store.get(), el));
        break;
      case 'answer-multi': {
        var s = Store.get();
        var id = el.getAttribute('data-id');
        var opt = el.getAttribute('data-opt');
        var cur = s.answers[id];
        var arr = Array.isArray(cur) ? cur.slice() : [];
        var i = arr.indexOf(opt);
        if (el.checked && i === -1) arr.push(opt);
        if (!el.checked && i !== -1) arr.splice(i, 1);
        setAnswer(id, arr);
        break;
      }
    }
  });

  function updatedMatch(s, el) {
    var id = el.getAttribute('data-id');
    var item = el.getAttribute('data-item');
    var cur = s.answers[id];
    var a = Object.assign({}, cur && typeof cur === 'object' ? cur : {});
    if (el.value) a[item] = el.value;
    else delete a[item];
    return a;
  }

  // Esc closes dialogs (parity with Radix Dialog)
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    var s = Store.get();
    if (s.resetOpen) cancelReset();
    else if (s.completionOpen) closeCompletion();
  });

  // ---------- render loop with focus restoration ----------

  var container = document.getElementById('app');

  function renderPreservingFocus() {
    var active = document.activeElement;
    var fid = active && active.getAttribute ? active.getAttribute('data-fid') : null;
    container.innerHTML = UI.render(Store.get());
    if (fid) {
      var again = container.querySelector('[data-fid="' + fid.replace(/"/g, '\\"') + '"]');
      if (again && typeof again.focus === 'function') {
        try {
          again.focus();
        } catch (e) {
          /* best effort */
        }
      }
    }
  }

  Store.subscribe(function () {
    var s = Store.get();
    window.saveState(s); // autosave (matches the autosave effect)
    renderPreservingFocus();
  });

  // ---------- bootstrap ----------

  var saved = window.loadState();
  if (saved) Store.set(saved);
  renderPreservingFocus();
})();
