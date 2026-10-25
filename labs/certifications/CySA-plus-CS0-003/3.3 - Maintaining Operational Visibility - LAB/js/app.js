// ── App bootstrap: rendering loop, event wiring, dialogs, toasts ─────────────
// Event delegation over data-action attributes; a single subscribe → render
// loop mirrors the original reactive store. Focus and scroll positions are
// preserved across re-renders so keyboard users and long feeds behave exactly
// as in the original.
(function () {
  'use strict';

  var S = window.LAB_STATE;
  var UI = window.LAB_UI;
  var OBJ = window.LAB_OBJECTIVES;
  var D = window.LAB_DATA;

  var appEl = document.getElementById('app');
  var dialogRoot = document.getElementById('dialog-root');
  var toastRoot = document.getElementById('toast-root');
  var liveRegion = document.getElementById('live-region');

  var openDialog = null;      // 'completion' | 'purge' | null
  var lastFocused = null;     // element to restore focus to when a dialog closes

  // ── focus + scroll preservation across re-renders ───────────────────────────
  function activeFocusKey() {
    var el = document.activeElement;
    if (!el || el === document.body) return null;
    return el.getAttribute('data-fk');
  }

  function restoreFocus(key) {
    if (!key) return;
    var el = appEl.querySelector('[data-fk="' + key + '"]') || dialogRoot.querySelector('[data-fk="' + key + '"]');
    if (el) {
      try { el.focus({ preventScroll: true }); } catch (e) { /* older engines */ }
    }
  }

  function captureScrolls() {
    var map = [];
    var boxes = appEl.querySelectorAll('.scroll-box, .tab-strip, [data-fk="log-scroll"], .obj-body, main');
    boxes.forEach(function (box) {
      if (box.scrollTop || box.scrollLeft) {
        map.push({ el: box, top: box.scrollTop, left: box.scrollLeft, fk: box.getAttribute('data-fk') });
      }
    });
    return map;
  }

  function restoreScrolls(map) {
    // Match by index among the same selector set (order is deterministic)
    var boxes = appEl.querySelectorAll('.scroll-box, .tab-strip, [data-fk="log-scroll"], .obj-body, main');
    map.forEach(function (entry) {
      for (var i = 0; i < boxes.length; i++) {
        if (boxes[i] === entry.el) {
          entry.el.scrollTop = entry.top;
          entry.el.scrollLeft = entry.left;
          return;
        }
      }
      // Element was replaced by re-render: fall back to matching fk within same index position
      for (var j = 0; j < boxes.length; j++) {
        var fk = boxes[j].getAttribute('data-fk');
        if (entry.fk && fk === entry.fk) {
          boxes[j].scrollTop = entry.top;
          boxes[j].scrollLeft = entry.left;
          return;
        }
      }
    });
  }

  // ── render loop ─────────────────────────────────────────────────────────────
  function render() {
    var s = S.get();
    var fk = activeFocusKey();
    var scrolls = captureScrolls();
    appEl.innerHTML = UI.renderAppHtml(s);
    restoreScrolls(scrolls);
    if (openDialog === null) restoreFocus(fk);
    liveRegion.textContent = s.announce || '';
    if (openDialog === 'completion') renderCompletionLive();
    maybeAutoOpenCompletion(s);
  }

  // The clearance modal is a live view in the original (it re-renders from the
  // store while open — e.g. after a quiz retake). Mirror that behavior.
  function renderCompletionLive() {
    var active = document.activeElement;
    var act = active && active.getAttribute ? active.getAttribute('data-action') : null;
    dialogRoot.innerHTML = UI.completionDialogHtml(S.get());
    if (act) {
      var b = dialogRoot.querySelector('[data-action="' + act + '"]');
      if (b) { try { b.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
  }

  // Derived auto-open: once eligible and on the Check phase, the clearance modal
  // opens by itself — exactly once (completionSeen), as in the original.
  function maybeAutoOpenCompletion(s) {
    if (openDialog) return;
    if (!s.mode) return;
    var objectives = OBJ.OBJECTIVES[s.mode];
    var allDone = objectives.length > 0 && objectives.every(function (o) { return s.progress[o.id] && s.progress[o.id].done; });
    var eligible = allDone && s.quizSubmitted;
    if (eligible && s.phase === 'check' && !s.completionSeen) {
      showCompletion();
    }
  }

  // ── dialogs ─────────────────────────────────────────────────────────────────
  function showCompletion() {
    openDialog = 'completion';
    lastFocused = document.activeElement;
    S.actions.markCompletionSeen(); // any open marks it seen (original semantics)
    dialogRoot.innerHTML = UI.completionDialogHtml(S.get());
    focusFirst();
  }

  function showPurge() {
    openDialog = 'purge';
    lastFocused = document.activeElement;
    dialogRoot.innerHTML = UI.purgeDialogHtml();
    focusFirst();
  }

  function closeDialog() {
    openDialog = null;
    dialogRoot.innerHTML = '';
    if (lastFocused && lastFocused.isConnected) {
      try { lastFocused.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    lastFocused = null;
  }

  function focusFirst() {
    var target = dialogRoot.querySelector('[data-autofocus]') || dialogRoot.querySelector('button');
    if (target) {
      try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
  }

  // Keep Tab inside an open dialog (light focus trap, like the original modal)
  function trapTab(e) {
    if (!openDialog || e.key !== 'Tab') return;
    var focusables = dialogRoot.querySelectorAll('button, a[href], input, select, textarea');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  // ── toasts (sonner-equivalent: bottom-right, close button, auto-dismiss) ────
  function toast(msg) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span class="toast-icon">' + window.icon('check-circle-2', 16) + '</span><span class="toast-msg">' + UI.esc(msg) + '</span>' +
      '<button type="button" class="toast-close" aria-label="Close notification">' + window.icon('x', 14) + '</button>';
    toastRoot.appendChild(el);
    var close = function () {
      if (!el.parentNode) return;
      el.classList.add('leaving');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
    };
    el.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, 5000);
  }

  // ── actions ─────────────────────────────────────────────────────────────────
  var A = S.actions;

  function runAction(el, action) {
    var s = S.get();
    switch (action) {
      case 'mode-set': A.setMode(el.getAttribute('data-mode')); break;
      case 'phase-set': A.setPhase(el.getAttribute('data-phase')); break;
      case 'take-floor': A.setPhase('floor'); A.say('You are on the observation floor. Light the zones.'); break;

      case 'toggle-sensor': A.toggleSensor(el.getAttribute('data-id')); break;
      case 'relay-level': A.setRelayLevel(el.value); break;

      case 'pop':
        UI.openPopover = UI.openPopover === el.getAttribute('data-key') ? null : el.getAttribute('data-key');
        render();
        break;

      case 'group-set':
        window.LAB_UI_setGroup(el.getAttribute('data-group'));
        render();
        break;
      case 'ev-tab':
        window.LAB_UI_setTab('evidence', el.getAttribute('data-tab'));
        render();
        break;
      case 'wb-tab':
        window.LAB_UI_setTab('workbench', el.getAttribute('data-tab'));
        render();
        break;
      case 'kc-tab':
        window.LAB_UI_setTab('kc', el.getAttribute('data-tab'));
        render();
        break;

      case 'log-filter': window.LAB_UI_setLogFilter(el.getAttribute('data-f'), el.value); break;
      case 'classify':
        if (el.value) A.setClassification(el.getAttribute('data-asset'), el.value);
        render();
        break;

      case 'pin-toggle': A.togglePin(el.getAttribute('data-id')); break;
      case 'pin-move': A.movePin(el.getAttribute('data-id'), Number(el.getAttribute('data-dir'))); break;
      case 'pin-clear': A.clearTimeline(); break;
      case 'widget-toggle': A.toggleWidget(el.getAttribute('data-id')); break;

      case 'triage-set': A.setTriage(el.getAttribute('data-id'), el.value); break;
      case 'counter-assign': A.assignCounter(el.getAttribute('data-id')); break;
      case 'counter-remove': A.removeCounter(Number(el.getAttribute('data-slot'))); break;
      case 'rule-set': A.setRule(pair(el), { silent: true }); break;
      case 'retention-set': A.setRetention(Number(el.value), { silent: true }); break;
      case 'export': A.addExport(el.getAttribute('data-id')); toast(el.getAttribute('data-msg')); break;

      case 'field-set': A.setAnswer(el.getAttribute('data-obj'), el.getAttribute('data-field'), el.value); break;

      case 'obj-open':
        window.LAB_UI_toggleObjective(el.getAttribute('data-obj'));
        render();
        break;

      case 'check': {
        var objectives = OBJ.OBJECTIVES[s.mode];
        var index = -1;
        objectives.forEach(function (o, i) { if (o.id === el.getAttribute('data-obj')) index = i; });
        var obj = objectives[index];
        var r = obj.validate(S.get());
        A.recordAttempt(obj.id, r.pass);
        var msg = r.pass ? obj.passMsg : obj.failMsg + (r.detail ? ' (' + r.detail + ')' : '');
        window.LAB_UI_setResult(obj.id, { pass: r.pass, msg: msg });
        A.say(r.pass ? 'Task ' + (index + 1) + ' passed: ' + obj.title : 'Task ' + (index + 1) + ' not yet complete: ' + obj.title);
        render();
        break;
      }

      case 'hint': A.revealHint(el.getAttribute('data-obj')); break;

      case 'quiz-submit': {
        var items = window.LAB_QUIZ.QUIZ[s.mode];
        var correct = items.filter(function (q) { return s.quiz[q.id] === q.answer; }).length;
        A.submitQuiz({ correct: correct, total: items.length });
        break;
      }
      case 'quiz-retake': A.resetQuiz(); break;

      case 'open-clearance': showCompletion(); break;
      case 'completion-review': closeDialog(); A.setPhase('debrief'); break;
      case 'completion-purge': A.reset(); closeDialog(); break;

      case 'purge-open': showPurge(); break;
      case 'purge-cancel': closeDialog(); break;
      case 'purge-confirm': A.reset(); closeDialog(); break;
    }
  }

  function pair(el) {
    var patch = {};
    patch[el.getAttribute('data-f')] = el.value;
    return patch;
  }

  // ── global listeners ────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    // Popover dismissal: any click outside a popover and not on its trigger
    var pop = e.target.closest ? e.target.closest('.popover') : null;
    var trigger = e.target.closest ? e.target.closest('[data-action="pop"]') : null;
    if (!pop && !trigger && UI.openPopover) {
      UI.openPopover = null;
      render();
      return;
    }
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (el && !el.disabled) {
      runAction(el, el.getAttribute('data-action'));
      return;
    }
    // Overlay click closes the dialog (cancel semantics)
    if (openDialog && e.target.getAttribute && e.target.getAttribute('data-overlay')) {
      closeDialog();
    }
  });

  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var action = el.getAttribute('data-action');
    if (action === 'relay-level') { runAction(el, action); return; }
    if (action === 'classify') { runAction(el, action); return; }
    if (action === 'log-filter') { runAction(el, action); return; }
    if (action === 'triage-set') { runAction(el, action); return; }
    if (action === 'rule-set') { runAction(el, action); return; }
    if (action === 'retention-set') { runAction(el, action); return; }
    if (action === 'field-set') { runAction(el, action); return; }
    if (el.hasAttribute('data-quiz')) {
      // notify (not silent): the submit button's enabled state depends on picks
      A.setQuizPick(el.getAttribute('data-quiz'), el.value, true);
    }
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    if (el.hasAttribute('data-log-search')) {
      window.LAB_UI_setLogFilter('q', el.value);
      return;
    }
    var fieldSpec = el.getAttribute('data-field-input');
    if (fieldSpec) {
      var parts = fieldSpec.split('|');
      A.setAnswer(parts[0], parts[1], el.value);
      return;
    }
    var ruleSpec = el.getAttribute('data-rule-input');
    if (ruleSpec) {
      var patch = {};
      patch[ruleSpec] = el.value;
      A.setRule(patch);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (openDialog) { closeDialog(); return; }
      if (UI.openPopover) { UI.openPopover = null; render(); return; }
    }
    trapTab(e);
    // Arrow-key activation for tab lists (Radix-equivalent roving focus)
    var tab = e.target && e.target.closest ? e.target.closest('[role="tab"]') : null;
    if (tab && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      var list = tab.closest('[role="tablist"]');
      var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
      var i = tabs.indexOf(tab);
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      next.click();
      e.preventDefault();
    }
  });

  // ── bridges into ui.js transient state (kept out of the render templates) ──
  window.LAB_UI_setGroup = function (g) {
    // implemented via ui.js closure accessors below
    if (window.__labSetGroup) window.__labSetGroup(g);
  };
  window.LAB_UI_setTab = function (kind, id) {
    if (window.__labSetTab) window.__labSetTab(kind, id);
  };
  window.LAB_UI_setLogFilter = function (f, v) {
    if (window.__labSetLogFilter) {
      window.__labSetLogFilter(f, v);
      if (f !== 'q') render(); else renderLogTarget();
    }
  };
  window.LAB_UI_toggleObjective = function (id) {
    if (window.__labToggleObjective) window.__labToggleObjective(id);
  };
  window.LAB_UI_setResult = function (id, res) {
    if (window.__labSetResult) window.__labSetResult(id, res);
  };

  /** Targeted re-render of only the log stream body (keeps search input focus). */
  function renderLogTarget() {
    var root = document.getElementById('log-stream-root');
    if (root) root.innerHTML = UI.logStreamBody(S.get());
  }

  // ── boot ────────────────────────────────────────────────────────────────────
  S.subscribe(render);
  render();
})();
