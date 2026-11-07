// ─────────────────────────────────────────────────────────────────────────────
// THE SWITCH YARD — js/app.js
// Bootstrap + event wiring (delegated handlers for every control) + the
// dispatch-clearance modal. Ported from the framework lab's Lab.tsx behavior:
// same actions, same guards, same persistence timing, same RESET semantics.
// ─────────────────────────────────────────────────────────────────────────────
(function (LAB) {
  'use strict';

  var store = LAB.store;

  // ── modal helpers ────────────────────────────────────────────────────────────
  var modalRoot, modalBody, modalDesc, lastFocused = null;

  function openClearance() {
    var st = store.st;
    if (!st) return;
    // mark completed (persisted, like the original's setSt(n.completed = true))
    store.update(function (next) { next.completed = true; });
    var score = LAB.scoreOf(store.st);
    modalDesc.textContent = 'Yard debrief — your mastery recap for ' + (st.mode === 'medium' ? 'Medium (Yardmaster)' : 'Hard (Dispatcher)') + ' shift.';
    modalBody.innerHTML = LAB.completionRecap(store.st, score.pct, score.stars);
    lastFocused = document.activeElement;
    modalRoot.hidden = false;
    var closeBtn = modalRoot.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeClearance() {
    modalRoot.hidden = true;
    modalBody.innerHTML = '';
    if (lastFocused && lastFocused.focus) { try { lastFocused.focus({ preventScroll: true }); } catch (e) { lastFocused.focus(); } }
    lastFocused = null;
  }

  // ── tab navigation (mirrors the framework's unmount-on-switch semantics) ────
  function gotoTab(t) {
    if (!store.st) return;
    if (store.tab === t) return; // clicking the active tab: no unmount, no reset
    store.tab = t;
    store.onEnterTab(t); // reset component-local state, as a re-mount would
    if (!store.st.visitedTabs.includes(t)) {
      store.update(function (next) { next.visitedTabs.push(t); });
    } else {
      store.notify();
    }
  }

  // ── action dispatch ──────────────────────────────────────────────────────────
  function onAction(action, arg, btn) {
    var st = store.st;
    var ui = store.ui;

    // mode picking happens on the mode-select screen — no LabState yet
    if (action === 'pick-mode') { store.startMode(arg); return; }
    if (!st) return;
    var repo = st.repo;

    switch (action) {
      // shell
      case 'goto-tab': gotoTab(arg); break;
      case 'open-clearance': openClearance(); break;
      case 'close-clearance': closeClearance(); break;
      case 'reset-lab':
        if (window.confirm('Reset the yard? All progress will be wiped.')) {
          closeClearance();
          store.reset();
        }
        break;

      // objectives
      case 'check-obj':
        store.update(function (next) {
          var p = LAB.ensure(next, arg);
          var res = LAB.checkObjective(arg, next);
          // audit QA-16: attempts only count while the objective is still open
          if (!p.done) p.attempts += 1;
          p.lastPass = res.pass;
          p.lastMsg = res.pass ? res.ok : res.fail;
          if (res.pass && !p.done) {
            p.done = true;
            p.stars = LAB.starFor(p.attempts, p.hintsUsed);
          }
        });
        break;
      case 'hint-obj':
        store.update(function (next) {
          var p = LAB.ensure(next, arg);
          var objs = next.mode === 'medium' ? LAB.OBJECTIVES_MEDIUM : LAB.OBJECTIVES_HARD;
          var obj = objs.find(function (o) { return o.id === arg; });
          if (obj && p.hintsUsed < obj.maxHints) p.hintsUsed += 1;
        });
        break;

      // yard tabs
      case 'center-tab':
        ui.center = arg;
        ui.wbSelected = 'infra/main.tf'; ui.wbDraft = null; ui.wbMsg = '';
        store.notify();
        break;
      case 'desk-tab':
        ui.desk = arg;
        ui.branchName = ''; ui.tagName = ''; ui.mergeSel = '';
        ui.scanPattern = repo.scannerPattern || '';
        store.notify();
        break;

      // workbench
      case 'wb-select-file': ui.wbSelected = arg; ui.wbDraft = null; store.notify(); break;
      case 'wb-stage': store.act(function (r) { return LAB.stageFile(r, arg); }); break;
      case 'wb-unstage': store.act(function (r) { return LAB.unstageFile(r, arg); }); break;
      case 'wb-untrack': store.act(function (r) { return LAB.untrackFile(r, arg); }); break;
      case 'wb-save-edit':
        if (ui.wbDraft !== null) {
          var draft = ui.wbDraft;
          ui.wbDraft = null;
          store.act(function (r) { return LAB.saveFile(r, ui.wbSelected, draft); });
        }
        break;
      case 'wb-take-theirs': {
        var src = repo.merging ? repo.branches[repo.merging.source] : null;
        var theirs = src ? repo.commits[src].tree[ui.wbSelected] : undefined;
        if (theirs !== undefined) { ui.wbDraft = theirs; store.act(function (r) { return LAB.saveFile(r, ui.wbSelected, theirs); }); }
        break;
      }
      case 'wb-keep-ours': {
        var ours = LAB.headCommit(repo).tree[ui.wbSelected];
        if (ours !== undefined) { ui.wbDraft = ours; store.act(function (r) { return LAB.saveFile(r, ui.wbSelected, ours); }); }
        break;
      }
      case 'wb-stage-selected': store.act(function (r) { return LAB.stageFile(r, ui.wbSelected); }); break;
      case 'wb-commit': {
        var msg = ui.wbMsg.trim();
        ui.wbMsg = '';
        store.act(function (r) { return LAB.commit(r, msg); });
        break;
      }

      // switch desk
      case 'sd-create-branch': {
        var nb = ui.branchName.trim();
        ui.branchName = '';
        store.act(function (r) { return LAB.createBranch(r, nb, true); });
        break;
      }
      case 'sd-merge': store.act(function (r) { return LAB.mergeBranch(r, ui.mergeSel); }); break;
      case 'sd-stamp-tag': {
        var tg = ui.tagName.trim();
        ui.tagName = '';
        store.act(function (r) { return LAB.tagCommit(r, tg); });
        break;
      }
      case 'sd-push-head': store.act(function (r) { return LAB.pushBranch(r, repo.head); }); break;
      case 'sd-open-pr': store.act(function (r) { return LAB.openPR(r, repo.head, 'main', 'hotfix/nf-142 → main'); }); break;
      case 'sd-approve-pr': store.act(function (r) { return LAB.approvePR(r, Number(arg)); }); break;
      case 'sd-force-push': store.act(function (r) { return LAB.forcePushMain(r); }); break;
      case 'sd-create-feat': store.act(function (r) { return LAB.createBranch(r, 'feat/nf-201', true); }); break;

      // governance desk
      case 'gd-toggle-protection':
        store.act(function (r) {
          var v = !r.protections[arg];
          var t = LAB.clockTime(r.nextCommitNum);
          if (arg === 'directPushBlocked') {
            r.protections.directPushBlocked = v;
            r.log = r.log.slice(-120).concat([{ t: t, msg: 'governance: direct pushes to main ' + (v ? 'BLOCKED' : 'allowed again'), kind: v ? 'ok' : 'info' }]);
          } else {
            r.protections.requireReview = v;
            if (v && r.protections.approvalsRequired < 1) r.protections.approvalsRequired = 1;
            r.log = r.log.slice(-120).concat([{ t: t, msg: 'governance: approving review ' + (v ? 'required' : 'no longer required') + ' before merge', kind: v ? 'ok' : 'info' }]);
          }
          return r;
        });
        break;
      case 'gd-toggle-bot':
        store.act(function (r) {
          var v = !r.ciBotToken;
          r.ciBotToken = v;
          r.log = r.log.slice(-120).concat([{ t: LAB.clockTime(r.nextCommitNum), msg: v ? 'governance: CI bot moved to a scoped deploy token' : 'governance: CI bot back on the shared admin password (DANGER)', kind: v ? 'ok' : 'err' }]);
          return r;
        });
        break;

      // detect desk
      case 'dd-run-scan': {
        var pat = st.mode === 'medium' ? '(key|secret)[a-z_]*\\s*=' : ui.scanPattern;
        store.act(function (r) { return LAB.runScanner(Object.assign({}, r, { scannerPattern: pat })).state; });
        break;
      }
      case 'dd-verdict':
        store.act(function (r) { r.scannerVerdicts[arg] = btn.getAttribute('data-val'); return r; });
        break;
      case 'dd-flag':
        store.act(function (r) {
          var i = r.incidents.find(function (x) { return x.id === arg; });
          if (i) i.flagged = !i.flagged;
          return r;
        });
        break;
      case 'dd-revoke':
        store.act(function (r) {
          var i = r.incidents.find(function (x) { return x.id === 'inc-live'; });
          if (i) { i.revoked = true; r.seq['rotate'] = r.nextCommitNum; }
          return r;
        });
        break;
      case 'dd-replace':
        store.act(function (r) {
          var i = r.incidents.find(function (x) { return x.id === 'inc-live'; });
          if (i) i.replaced = true;
          return r;
        });
        break;
      case 'dd-revoke-token': store.act(function (r) { r.auditActions.patRevoked = true; return r; }); break;
      case 'dd-restore-protection': store.act(function (r) { r.auditActions.protectionRestored = true; return r; }); break;
      case 'dd-add-stage': store.act(function (r) { r.ciStages = r.ciStages.concat([arg]); return r; }); break;
      case 'dd-remove-stage': store.act(function (r) { r.ciStages = r.ciStages.filter(function (x) { return x !== arg; }); return r; }); break;

      // history
      case 'revert': store.act(function (r) { return LAB.revertCommit(r, arg); }); break;

      // exam
      case 'quiz-goto': {
        var items = st.mode === 'medium' ? LAB.QUIZ_MEDIUM : LAB.QUIZ_HARD;
        var firstOpenG = -1;
        for (var ig = 0; ig < items.length; ig++) { if (!st.quiz.submitted[items[ig].id]) { firstOpenG = ig; break; } }
        var maxG = firstOpenG === -1 ? items.length - 1 : firstOpenG;
        var target = Number(arg);
        if (target > maxG) return; // enforced progression (audit R2)
        ui.examView = Math.max(0, target);
        store.notify();
        break;
      }
      case 'quiz-next': {
        var itemsN = st.mode === 'medium' ? LAB.QUIZ_MEDIUM : LAB.QUIZ_HARD;
        var firstOpenN = -1;
        for (var iN = 0; iN < itemsN.length; iN++) { if (!st.quiz.submitted[itemsN[iN].id]) { firstOpenN = iN; break; } }
        var maxN = firstOpenN === -1 ? itemsN.length - 1 : firstOpenN;
        var curN = Math.min(ui.examView, maxN);
        ui.examView = Math.min(curN + 1, maxN);
        store.notify();
        break;
      }
      case 'quiz-submit':
        store.update(function (next) { next.quiz.submitted[arg] = true; });
        break;

      default:
        // unknown action: ignore silently (dead controls never render)
        break;
    }
  }

  // ── change dispatch (selects, radios) ────────────────────────────────────────
  function onChange(key, arg, val, el) {
    var st = store.st;
    if (!st) return;

    switch (key) {
      case 'form': store.update(function (next) { next.forms[el.getAttribute('data-key') || arg] = val; }); break;
      case 'registry': store.update(function (next) { next.registryAnswers[arg] = val; }); break;
      case 'sd-checkout': store.act(function (r) { return LAB.checkout(r, val); }); break;
      case 'sd-merge-sel': store.ui.mergeSel = val; store.notify(); break;
      case 'gd-approvals': store.act(function (r) { r.protections.approvalsRequired = Number(val); return r; }); break;
      case 'gd-role': store.act(function (r) { r.roles[arg] = val; return r; }); break;
      case 'dd-pattern': store.ui.scanPattern = arg; store.notify(); break;
      case 'dd-audit-push': store.act(function (r) { r.auditFindings.forcedPush = val; return r; }); break;
      case 'dd-audit-token': store.act(function (r) { r.auditFindings.patToRevoke = val; return r; }); break;
      case 'quiz-pick':
        if (!st.quiz.submitted[arg]) { // answer lock on submit (audit R2)
          store.update(function (next) { next.quiz.answers[arg] = Number(el.getAttribute('data-val')); });
        }
        break;
      default: break;
    }
  }

  // ── input dispatch (text areas/inputs: local UI state, no re-render) ─────────
  function onInput(key, val) {
    var ui = store.ui;
    switch (key) {
      case 'wb-editor':
        ui.wbDraft = val;
        syncDisabled('save-edit', false); // a draft exists → Save enabled (as in React)
        break;
      case 'wb-msg':
        ui.wbMsg = val;
        syncDisabled('commit', val.trim().length === 0);
        break;
      case 'sd-branch':
        ui.branchName = val;
        syncDisabled('create-branch', val.trim().length === 0);
        break;
      case 'sd-tag':
        ui.tagName = val;
        syncDisabled('stamp-tag', val.trim().length === 0);
        break;
      default: break;
    }
  }

  function syncDisabled(fid, disabled) {
    var el = document.querySelector('[data-fid="' + fid + '"]');
    if (el) el.disabled = !!disabled;
  }

  // ── wiring ───────────────────────────────────────────────────────────────────
  function wire() {
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('[data-action]') : null;
      if (!btn) {
        // modal overlay click = dismiss (click-outside), like the Radix dialog
        if (ev.target === modalRoot) closeClearance();
        return;
      }
      if (btn.disabled) return;
      onAction(btn.getAttribute('data-action'), btn.getAttribute('data-arg'), btn);
    });

    document.addEventListener('change', function (ev) {
      var el = ev.target;
      var key = el.getAttribute && el.getAttribute('data-change');
      if (!key) return;
      onChange(key, el.getAttribute('data-arg'), el.value, el);
    });

    document.addEventListener('input', function (ev) {
      var el = ev.target;
      var key = el.getAttribute && el.getAttribute('data-input');
      if (!key) return;
      onInput(key, el.value);
    });

    // modal keyboard: ESC closes, Tab is trapped inside (parity with Radix)
    document.addEventListener('keydown', function (ev) {
      if (modalRoot.hidden) return;
      if (ev.key === 'Escape') { ev.preventDefault(); closeClearance(); return; }
      if (ev.key === 'Tab') {
        var focusables = modalRoot.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        var list = Array.prototype.filter.call(focusables, function (f) { return !f.disabled; });
        if (!list.length) return;
        var first = list[0];
        var last = list[list.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    });
  }

  // ── boot ─────────────────────────────────────────────────────────────────────
  LAB.boot = function () {
    modalRoot = document.getElementById('modal-root');
    modalBody = document.getElementById('modal-body');
    modalDesc = document.getElementById('modal-desc');

    wire();
    store.subscribe(LAB.render);

    if (store.load()) {
      // resumed session: land on the YARD tab with fresh component-local state
      store.onEnterTab('yard');
    }
    LAB.render();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LAB.boot);
  } else {
    LAB.boot();
  }
})(window.LAB = window.LAB || {});
