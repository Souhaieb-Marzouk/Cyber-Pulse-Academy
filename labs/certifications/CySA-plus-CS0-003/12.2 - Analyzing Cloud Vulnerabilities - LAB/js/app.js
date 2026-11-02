// ─── SKYSCAN app: bootstrap, event wiring, scan controller, rendering ────────
// Owns all DOM events via delegation (data-sk-* attributes) and re-renders on
// every store change — mirroring the original framework lab's Page.tsx
// handlers 1:1 (selectMode, handleCheck, handleHint, handleToggleFlag,
// handleApply, handleResetFinding, handleDrillPatch, handleScanComplete,
// handleQuizAnswer, handleQuizCheckItem, handleReset).

(function (SKY) {
  'use strict';

  // ── session UI state (mirrors the original's React local component state) ──
  // NOT persisted — exactly like the original (useState is session-only).

  var app = {
    tab: 'assessment',            // Console Tabs (persists while page is open)
    knowledgeOpen: null,          // Accordion single-open value
    glossaryOpen: false,          // Collapsible glossary
    feedback: {},                 // CheckResult per objective (Page useState)
    filters: { sev: 'all', layer: 'all', status: 'all' }, // report filters (ScanPanel local state)
    inspecting: null,             // resource id in the Inspector dialog
    modalKind: null,              // 'inspector' | 'reset' | 'completion' | 'estate' | 'missions'
    scan: { running: false, which: null, logIdx: 0, timer: null },
  };

  var rootEl = null;

  // ── focus preservation across re-renders (React reconciliation equivalent) ──

  function captureFocus() {
    var a = document.activeElement;
    if (!a || a === document.body || !a.id) return null;
    var caret = null;
    if (a.setSelectionRange && typeof a.selectionStart === 'number') caret = a.selectionStart;
    return { id: a.id, caret: caret };
  }

  function restoreFocus(d) {
    if (!d || !d.id) return;
    var el = document.getElementById(d.id);
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    if (d.caret != null && el.setSelectionRange) {
      try { el.setSelectionRange(d.caret, d.caret); } catch (e) { /* ignore */ }
    }
  }

  // ── rendering ──

  function renderMain(state, env) {
    return '<div class="sk-page">' +
      SKY.renderTopbar(state, env) +
      '<main class="sk-main" aria-label="Lab content"><div class="sk-grid">' +
      '<div class="sk-col-main">' +
      SKY.renderBriefing() +
      SKY.renderKnowledge(app) +
      renderConsole(state, env) +
      SKY.renderQuiz(state) +
      SKY.renderDebrief(state, env) +
      '</div>' +
      '<aside class="sk-col-rail" aria-label="Mission rail"><div class="sk-rail-sticky">' + SKY.renderRail(state, env, app) + '</div></aside>' +
      '</div></main>' +
      '</div>';
  }

  function renderConsole(state, env) {
    var drillsLabel = state.mode === 'hard' ? 'WAR ROOM' : 'DRILLS';
    var panelHtml = app.tab === 'assessment'
      ? SKY.renderScanPanel(state, env, app)
      : app.tab === 'deck'
        ? SKY.renderDeck(state, env)
        : SKY.renderDrills(state, env, app);

    return '<section aria-labelledby="console-h" class="sk-console">' +
      '<div class="sk-console-head">' +
      '<span class="sk-console-title"><span class="sk-pulse-dot" aria-hidden="true"></span> ASSESSMENT CONSOLE</span>' +
      '<span class="sk-console-account">account: nimbus-prod (synthetic)</span>' +
      SKY.btn('data-sk-action="open-estate"', 'sk-btn sk-btn-outline sk-btn-estate-mobile', SKY.icon('network', 3.5) + ' ESTATE').replace('<button ', '<button aria-label="Browse the cloud estate resources" ') +
      '</div>' +
      '<div class="sk-console-body">' +
      '<aside class="sk-estate-rail" aria-label="Estate sidebar">' +
      '<p class="sk-rail-label">cloud estate</p>' +
      SKY.renderEstateTree(state, app) +
      '</aside>' +
      '<div class="sk-console-main">' +
      '<div class="sk-tabs" role="tablist" aria-label="Console sections">' +
      '<button type="button" role="tab" id="sk-tab-assessment" aria-selected="' + (app.tab === 'assessment') + '" data-sk-action="tab" data-tab="assessment" class="sk-tab' + (app.tab === 'assessment' ? ' sk-tab-active' : '') + '">ASSESSMENT</button>' +
      '<button type="button" role="tab" id="sk-tab-deck" aria-selected="' + (app.tab === 'deck') + '" data-sk-action="tab" data-tab="deck" class="sk-tab' + (app.tab === 'deck' ? ' sk-tab-active' : '') + '">REMEDIATION</button>' +
      '<button type="button" role="tab" id="sk-tab-drills" aria-selected="' + (app.tab === 'drills') + '" data-sk-action="tab" data-tab="drills" class="sk-tab' + (app.tab === 'drills' ? ' sk-tab-active' : '') + '">' + drillsLabel + '</button>' +
      '</div>' +
      '<div class="sk-tabpanel" role="tabpanel" aria-labelledby="sk-tab-' + app.tab + '">' + panelHtml + '</div>' +
      '</div></div>' +
      '<div class="sk-console-foot">' + SKY.icon('list-checks', 3) + ' Missions rail (right on desktop) tracks every objective — drills submitted here are checked there too.</div>' +
      '</section>';
  }

  function modalHtml(kind, state, env) {
    if (kind === 'inspector') return SKY.inspectorHtml(app.inspecting, state, env);
    if (kind === 'reset') return SKY.resetDialogHtml();
    if (kind === 'completion') return SKY.completionHtml(state, env);
    if (kind === 'estate') return estateSheetHtml(state, app);
    if (kind === 'missions') return missionsSheetHtml(state, env, app);
    return '';
  }

  function estateSheetHtml(state, a) {
    return '<div class="sk-sheet-head">' +
      '<h2 id="sk-sheet-title" class="sk-sheet-title">CLOUD ESTATE</h2>' +
      SKY.btn('data-sk-action="close-modal"', 'sk-btn sk-btn-ghost sk-btn-icon sk-sheet-close', SKY.icon('x', 4)).replace('<button ', '<button aria-label="Close" ') +
      '</div><div class="sk-sheet-body">' + SKY.renderEstateTree(state, a) + '</div>';
  }

  function missionsSheetHtml(state, env, a) {
    return '<div class="sk-sheet-head">' +
      '<h2 id="sk-sheet-title" class="sk-sheet-title sk-sheet-title-rail">MISSION RAIL</h2>' +
      SKY.btn('data-sk-action="close-modal"', 'sk-btn sk-btn-ghost sk-btn-icon sk-sheet-close', SKY.icon('x', 4)).replace('<button ', '<button aria-label="Close" ') +
      '</div><div class="sk-sheet-body">' + SKY.renderRail(state, env, a) + '</div>';
  }

  function refreshOpenModal(state, env) {
    if (!app.modalKind || !SKY.modalIsOpen()) return;
    if (app.modalKind === 'inspector' || app.modalKind === 'estate' || app.modalKind === 'missions') {
      SKY.refreshModalContent(modalHtml(app.modalKind, state, env), { refocus: false });
    }
  }

  function renderAll() {
    var state = SKY.store.getState();
    var focus = captureFocus();
    if (!state.mode) {
      rootEl.innerHTML = SKY.renderModeSelect();
    } else {
      var env = SKY.deriveEnv(state);
      rootEl.innerHTML = renderMain(state, env);
    }
    restoreFocus(focus);
    // scan log autoscroll (mirrors the logRef effect in scan-panel.tsx)
    if (app.scan.running) {
      var log = document.getElementById('sk-scan-log');
      if (log) log.scrollTop = log.scrollHeight;
    }
    refreshOpenModal(state, SKY.deriveEnv(state));
  }

  // ── state mutation helpers (mirror the original's handlers) ──

  function patchDrill(objId, patch) {
    SKY.store.update(function (s) {
      var drills = Object.assign({}, s.drills);
      drills[objId] = Object.assign({}, drills[objId] || {}, patch);
      return Object.assign({}, s, { drills: drills });
    });
  }

  // ── scan controller (mirrors ScanPanel's interval effect) ──

  function startScan(which) {
    if (app.scan.running) return;
    app.scan = { running: which, which: which, logIdx: 0, timer: null };
    renderAll();
    app.scan.timer = setInterval(function () {
      if (app.scan.logIdx >= SKY.SCAN_SCRIPT.length - 1) {
        clearInterval(app.scan.timer);
        app.scan.timer = null;
        setTimeout(function () {
          // reset the local scan state BEFORE the store update so the
          // store-triggered re-render shows the report view (React batches
          // these two updates into one render)
          app.scan = { running: false, which: null, logIdx: 0, timer: null };
          SKY.store.update(function (s) {
            return Object.assign({}, s, which === 'initial' ? { scanInitial: true } : { scanRescan: true });
          });
        }, 350);
      } else {
        app.scan.logIdx += 1;
        renderAll();
      }
    }, 300);
  }

  function skipScan() {
    if (!app.scan.running) return;
    if (app.scan.timer) clearInterval(app.scan.timer);
    var which = app.scan.which;
    app.scan = { running: false, which: null, logIdx: 0, timer: null };
    SKY.store.update(function (s) {
      return Object.assign({}, s, which === 'initial' ? { scanInitial: true } : { scanRescan: true });
    });
  }

  // ── actions ──

  function selectMode(m) {
    app.feedback = {}; // assign before the store update (React batches these)
    SKY.store.update(function (s) {
      return Object.assign({}, s, {
        mode: m,
        startedAt: Date.now(),
        scanInitial: false,
        scanRescan: false,
        applied: {},
        flags: [],
        drills: {},
        quizAnswers: {},
        quizChecked: {},
        completed: false,
        // NOTE: `objectives` deliberately kept — same as the original
      });
    });
    window.scrollTo({ top: 0 });
  }

  function handleCheck(objId) {
    var current = SKY.store.getState();
    var envNow = SKY.deriveEnv(current);
    var res = SKY.checkObjective(objId, current, envNow);
    app.feedback[objId] = res; // assign before the store update (React batches these)
    SKY.store.update(function (s) {
      var prev = s.objectives[objId] || { done: false, wrong: 0, hints: 0 };
      var objectives = Object.assign({}, s.objectives);
      objectives[objId] = { done: prev.done || res.pass, wrong: res.pass ? prev.wrong : prev.wrong + 1, hints: prev.hints };
      return Object.assign({}, s, { objectives: objectives });
    });
  }

  function handleHint(objId) {
    SKY.store.update(function (s) {
      var prev = s.objectives[objId] || { done: false, wrong: 0, hints: 0 };
      var objectives = Object.assign({}, s.objectives);
      objectives[objId] = Object.assign({}, prev, { hints: Math.min(prev.hints + 1, 3) });
      return Object.assign({}, s, { objectives: objectives });
    });
  }

  function handleToggleFlag(resourceId) {
    SKY.store.update(function (s) {
      var has = s.flags.indexOf(resourceId) !== -1;
      var flags = has ? s.flags.filter(function (f) { return f !== resourceId; }) : s.flags.concat([resourceId]);
      return Object.assign({}, s, { flags: flags });
    });
  }

  function handleApply(findingId, actionId) {
    SKY.store.update(function (s) {
      var applied = Object.assign({}, s.applied);
      applied[findingId] = (applied[findingId] || []).concat([actionId]);
      return Object.assign({}, s, { applied: applied });
    });
  }

  function handleResetFinding(findingId) {
    SKY.store.update(function (s) {
      var applied = Object.assign({}, s.applied);
      delete applied[findingId];
      return Object.assign({}, s, { applied: applied });
    });
  }

  function handleReset() {
    app.feedback = {}; // clear before the reset (React batches these)
    SKY.store.reset();
    app.tab = 'assessment';
    app.filters = { sev: 'all', layer: 'all', status: 'all' };
    app.inspecting = null;
    window.scrollTo({ top: 0 });
  }

  function handleQuizAnswer(qid, idx) {
    var quiz = SKY.QUIZ.filter(function (q) { return q.id === qid; })[0];
    if (!quiz) return;
    SKY.store.update(function (s) {
      var sel = (s.quizAnswers[qid] || []).slice();
      var next;
      if (quiz.correct.length > 1) {
        if (sel.indexOf(idx) !== -1) next = sel.filter(function (x) { return x !== idx; });
        else if (sel.length < quiz.correct.length) next = sel.concat([idx]);
        else next = sel;
      } else {
        next = [idx];
      }
      var qa = Object.assign({}, s.quizAnswers);
      qa[qid] = next;
      return Object.assign({}, s, { quizAnswers: qa });
    });
  }

  function handleQuizCheckItem(qid) {
    SKY.store.update(function (s) {
      var qc = Object.assign({}, s.quizChecked);
      qc[qid] = true;
      return Object.assign({}, s, { quizChecked: qc });
    });
  }

  // ── event wiring (delegation) ──

  function onAction(el) {
    var action = el.getAttribute('data-sk-action');
    switch (action) {
      case 'select-mode':
        selectMode(el.getAttribute('data-mode'));
        break;
      case 'reset-request':
        app.modalKind = 'reset';
        SKY.openModal(SKY.resetDialogHtml(), { kind: 'alert', labelledBy: 'sk-reset-title', describedBy: 'sk-reset-desc', dismissable: false });
        break;
      case 'reset-cancel':
        app.modalKind = null;
        SKY.closeModal();
        break;
      case 'reset-confirm':
        app.modalKind = null;
        SKY.closeModal();
        handleReset();
        break;
      case 'close-modal':
        SKY.closeModal(); // onClose resets modalKind
        break;
      case 'open-resource': {
        var id = el.getAttribute('data-id');
        var wasSheet = app.modalKind === 'estate' || app.modalKind === 'missions';
        if (wasSheet) {
          app.modalKind = null;
          SKY.closeModal();
        }
        app.inspecting = id;
        app.modalKind = 'inspector';
        SKY.openModal(SKY.inspectorHtml(id, SKY.store.getState(), SKY.deriveEnv(SKY.store.getState())), {
          labelledBy: 'sk-inspector-title', describedBy: 'sk-inspector-desc', dialogClass: 'sk-dialog-wide',
          onClose: function () { app.modalKind = null; },
        });
        if (wasSheet) renderAll();
        break;
      }
      case 'toggle-flag':
        handleToggleFlag(el.getAttribute('data-id'));
        break;
      case 'tab':
        app.tab = el.getAttribute('data-tab');
        renderAll();
        break;
      case 'run-scan':
        startScan(el.getAttribute('data-which'));
        break;
      case 'skip-scan':
        skipScan();
        break;
      case 'apply':
        handleApply(el.getAttribute('data-finding'), el.getAttribute('data-action'));
        break;
      case 'reset-finding':
        handleResetFinding(el.getAttribute('data-finding'));
        break;
      case 'check-obj':
        handleCheck(el.getAttribute('data-obj'));
        break;
      case 'hint':
        handleHint(el.getAttribute('data-obj'));
        break;
      case 'drill-toggle': {
        var objId = el.getAttribute('data-obj');
        var kind = el.getAttribute('data-kind');
        var obj = SKY.OBJECTIVES_BY_ID[objId];
        var cfg = obj && obj.drill;
        if (!cfg) break;
        var st = SKY.store.getState();
        var d = SKY.getDrill(st, objId);
        if (kind === 'multi') {
          var sel = (d.sel || []).slice();
          var i = parseInt(el.getAttribute('data-idx'), 10);
          if (sel.indexOf(i) !== -1) patchDrill(objId, { sel: sel.filter(function (x) { return x !== i; }) });
          else if (sel.length < cfg.pick) patchDrill(objId, { sel: sel.concat([i]) });
        } else if (kind === 'pick2') {
          var pick = (d.pick || []).slice();
          var key = el.getAttribute('data-key');
          if (pick.indexOf(key) !== -1) patchDrill(objId, { pick: pick.filter(function (x) { return x !== key; }) });
          else if (pick.length < 2) patchDrill(objId, { pick: pick.concat([key]) });
        }
        break;
      }
      case 'drill-set': {
        var objId2 = el.getAttribute('data-obj');
        var field = el.getAttribute('data-field');
        var row = el.getAttribute('data-row');
        var val = el.getAttribute('data-val');
        var cur = (SKY.getDrill(SKY.store.getState(), objId2)[field] || {});
        var patch = {};
        patch[field] = Object.assign({}, cur, (function () { var o = {}; o[row] = val; return o; })());
        patchDrill(objId2, patch);
        break;
      }
      case 'order-move': {
        var objId3 = el.getAttribute('data-obj');
        var idx = parseInt(el.getAttribute('data-idx'), 10);
        var dir = parseInt(el.getAttribute('data-dir'), 10);
        var obj3 = SKY.OBJECTIVES_BY_ID[objId3];
        var curOrder = (SKY.getDrill(SKY.store.getState(), objId3).order || obj3.drill.items.map(function (i2) { return i2.key; }).slice().reverse()).slice();
        var j = idx + dir;
        if (j < 0 || j >= curOrder.length) break;
        var tmp = curOrder[idx];
        curOrder[idx] = curOrder[j];
        curOrder[j] = tmp;
        patchDrill(objId3, { order: curOrder });
        break;
      }
      case 'quiz-answer':
        handleQuizAnswer(el.getAttribute('data-q'), parseInt(el.getAttribute('data-idx'), 10));
        break;
      case 'quiz-check':
        handleQuizCheckItem(el.getAttribute('data-q'));
        break;
      case 'complete-lab':
        app.modalKind = 'completion';
        SKY.openModal(SKY.completionHtml(SKY.store.getState(), SKY.deriveEnv(SKY.store.getState())), {
          labelledBy: 'sk-completion-title', describedBy: 'sk-completion-desc',
          onClose: function () { app.modalKind = null; },
        });
        break;
      case 'completion-reset':
        app.modalKind = null;
        SKY.closeModal();
        handleReset();
        break;
      case 'open-missions':
        app.modalKind = 'missions';
        SKY.openModal(missionsSheetHtml(SKY.store.getState(), SKY.deriveEnv(SKY.store.getState()), app), {
          kind: 'sheet-right', labelledBy: 'sk-sheet-title',
          onClose: function () { app.modalKind = null; },
        });
        break;
      case 'open-estate':
        app.modalKind = 'estate';
        SKY.openModal(estateSheetHtml(SKY.store.getState(), app), {
          kind: 'sheet-left', labelledBy: 'sk-sheet-title',
          onClose: function () { app.modalKind = null; },
        });
        break;
      case 'accordion': {
        var accId = el.getAttribute('data-id');
        app.knowledgeOpen = app.knowledgeOpen === accId ? null : accId;
        renderAll();
        break;
      }
      case 'glossary':
        app.glossaryOpen = !app.glossaryOpen;
        renderAll();
        break;
    }
  }

  function bindEvents() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-sk-action]') : null;
      if (el) {
        // disabled buttons never dispatch click in browsers — no guard needed
        onAction(el);
        return;
      }
    });

    // text-input drills — value saved to the store on every keystroke; the
    // re-render preserves focus and caret via the capture/restore helpers
    // (same user-visible behavior as React's controlled inputs)
    document.addEventListener('input', function (e) {
      var el = e.target.closest ? e.target.closest('[data-sk-input]') : null;
      if (!el) return;
      var objId = el.getAttribute('data-obj');
      var key = el.getAttribute('data-key');
      var patch = {};
      patch[key] = el.value;
      patchDrill(objId, patch);
    });

    // drill selects + report filters
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.hasAttribute && t.hasAttribute('data-sk-filter')) {
        var map = { 'sk-filter-sev': 'sev', 'sk-filter-layer': 'layer', 'sk-filter-status': 'status' };
        var f = map[t.id];
        if (f) {
          app.filters[f] = t.value;
          renderAll();
        }
        return;
      }
      if (t.hasAttribute && t.hasAttribute('data-sk-select')) {
        var objId = t.getAttribute('data-obj');
        var field = t.getAttribute('data-field');
        var row = t.getAttribute('data-row');
        var sub = t.getAttribute('data-sub');
        var cur = SKY.getDrill(SKY.store.getState(), objId)[field] || {};
        var nextVal;
        if (sub) {
          nextVal = Object.assign({}, cur);
          nextVal[row] = Object.assign({}, nextVal[row] || {}, (function () { var o = {}; o[sub] = t.value; return o; })());
        } else {
          nextVal = Object.assign({}, cur, (function () { var o = {}; o[row] = t.value; return o; })());
        }
        var patch = {};
        patch[field] = nextVal;
        patchDrill(objId, patch);
      }
    });

    // Enter on report rows opens the inspector (mirrors onKeyDown in the original)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target && e.target.matches && e.target.matches('tr[data-sk-action="open-resource"]')) {
        onAction(e.target);
      }
    });

    // arrow-key navigation on the console tablist (Radix Tabs behavior)
    document.addEventListener('keydown', function (e) {
      if (!e.target.matches || !e.target.matches('[role="tab"]')) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
      var i = tabs.indexOf(e.target);
      var dir = e.key === 'ArrowRight' ? 1 : -1;
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      if (next) {
        next.focus();
        onAction(next);
      }
    });
  }

  // ── boot ──

  function boot() {
    rootEl = document.getElementById('sk-root');
    SKY.store.hydrate(); // synchronous resume — saved progress restored before first paint
    SKY.store.subscribe(renderAll);
    bindEvents();
    renderAll();
  }

  boot();
})(window.SKY);
