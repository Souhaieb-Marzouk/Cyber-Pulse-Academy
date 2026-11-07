// ─── Ledgerline · bootstrap + event wiring ──────────────────────────────────
// Static port of the React event layer. All interactivity is handled with a
// single delegated click listener plus a change listener, dispatching the same
// actions the original reducer knows.
'use strict';

(function () {
  var app = document.getElementById('app');
  var srLive = document.getElementById('sr-live');

  // painted-entrance-animation bookkeeping (framer-motion parity: entrance
  // animations play on mount, not on every re-render)
  var paintedKeys = new Set();
  var lastDirty = false;

  // gauges preserved across unrelated re-renders so the stroke animation
  // only plays when the score actually changes (framer-motion parity)
  var liveGauges = {}; // id -> { el, score, ran }

  // ── announce to screen readers (aria-live) ────────────────────────────────
  function announce(text) {
    if (!srLive) return;
    srLive.textContent = '';
    window.setTimeout(function () { srLive.textContent = text; }, 30);
  }

  // ── focus restore across re-render ────────────────────────────────────────
  var lastFocusFid = null;
  function captureFocus() {
    var active = document.activeElement;
    lastFocusFid = null;
    if (active && active.closest && active.closest('[data-fid]')) {
      lastFocusFid = active.closest('[data-fid]').getAttribute('data-fid');
    }
  }
  function restoreFocus() {
    if (!lastFocusFid) return;
    var el = app.querySelector('[data-fid="' + CSS.escape(lastFocusFid) + '"]');
    if (el && typeof el.focus === 'function') {
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    }
  }

  // ── render cycle ──────────────────────────────────────────────────────────
  function completionOpenFor(state) {
    var defs = OBJECTIVES_BY_MODE[state.mode || 'medium'];
    var allPassed = state.mode && defs.every(function (o) {
      return state.objectives[o.id] && state.objectives[o.id].status === 'passed';
    });
    // derived: opens automatically once, reopenable via trophy (original parity)
    return !!(allPassed && !UIState.completionDismissed);
  }

  function animationKeysFor(state) {
    var keys = [];
    if (state.stage === 'mode' || state.stage === 'loading') {
      keys.push('mode:wrap', 'mode:0', 'mode:1');
    } else if (state.stage === 'briefing') {
      keys.push('briefing');
    } else if (state.stage === 'workbench') {
      keys.push('findings:' + state.scanCount);
      if (state.dirty && !lastDirty) keys.push('dirty');
    }
    return keys;
  }

  function render() {
    var state = LabStore.state;

    // derived local states (mirror of React local useState semantics)
    UIState.completionOpen = completionOpenFor(state);

    // completion modal auto-show bookkeeping (original useEffect)
    var defs = OBJECTIVES_BY_MODE[state.mode || 'medium'];
    var allPassed = !!state.mode && defs.every(function (o) {
      return state.objectives[o.id] && state.objectives[o.id].status === 'passed';
    });
    if (allPassed && !state.completedShown) {
      LabStore.dispatch({ type: 'SHOW_COMPLETION', shown: true });
      return; // dispatch triggers a fresh render
    }

    UIState.anim = new Set(animationKeysFor(state).filter(function (k) { return !paintedKeys.has(k); }));

    captureFocus();

    // preserve unchanged gauges so their stroke animation doesn't replay
    var preserved = {};
    Object.keys(liveGauges).forEach(function (id) {
      var g = liveGauges[id];
      if (g && g.el && g.el.isConnected) preserved[id] = g;
    });
    liveGauges = preserved;

    app.innerHTML = renderApp(state);

    // re-insert preserved gauges
    Object.keys(liveGauges).forEach(function (id) {
      var g = liveGauges[id];
      var fresh = app.querySelector('[data-gauge-id="' + id + '"]');
      if (fresh && fresh.parentNode) {
        var same = g.score === postureScore(LabStore.state.configs) && g.ran === (LabStore.state.scanCount > 0);
        if (same) {
          // move the new wrapper's svg out and splice the old one in
          var oldSvg = g.el;
          fresh.parentNode.replaceChild(oldSvg, fresh);
        } else {
          delete liveGauges[id];
        }
      } else {
        delete liveGauges[id];
      }
    });

    // animate any new/changed gauge from 0 → pct
    app.querySelectorAll('[data-gauge-id]').forEach(function (svg) {
      var id = svg.getAttribute('data-gauge-id');
      var c = parseFloat(svg.getAttribute('data-c'));
      var pct = parseFloat(svg.getAttribute('data-pct'));
      var circle = svg.querySelector('.gauge-circle');
      if (!circle) return;
      liveGauges[id] = { el: svg, score: postureScore(LabStore.state.configs), ran: LabStore.state.scanCount > 0 };
      var target = c - (c * pct) / 100;
      if (circle.__animated) {
        circle.setAttribute('stroke-dashoffset', target);
        return;
      }
      circle.__animated = true;
      // force layout at start offset, then transition to target
      circle.setAttribute('stroke-dashoffset', c);
      void circle.getBoundingClientRect();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          circle.setAttribute('stroke-dashoffset', target);
        });
      });
    });

    // mark painted animation keys
    animationKeysFor(state).forEach(function (k) { paintedKeys.add(k); });
    lastDirty = state.dirty;

    restoreFocus();
    if (UIState.completionOpen || UIState.resetOpen || UIState.siemOpen || state.doctrineOpen) {
      focusFirstInOverlay();
    }
  }

  function focusFirstInOverlay() {
    var overlay = app.querySelector('.modal, .drawer');
    if (!overlay) return;
    var focusables = overlay.querySelectorAll('button, [href], select, [tabindex]:not([tabindex="-1"])');
    if (focusables.length) focusables[0].focus({ preventScroll: true });
  }

  // ── action helpers (exact original semantics) ─────────────────────────────
  function validationCtx(state) {
    return { configs: state.configs, answers: state.answers, actions: state.actions, scanCount: state.scanCount };
  }

  function selectResource(resource) {
    LabStore.dispatch({ type: 'SELECT', resource: resource });
    LabStore.dispatch({ type: 'SET_PANE', pane: 'dossier' });
  }

  function runScan() {
    if (UIState.scanning) return;
    UIState.scanning = true;
    render();
    var chips = app.querySelectorAll('.sweep-chip');
    FAMILY_ORDER.forEach(function (_, i) {
      window.setTimeout(function () {
        chips.forEach(function (c, j) { c.classList.toggle('lit', j === i); });
      }, i * 300);
    });
    window.setTimeout(function () {
      LabStore.dispatch({ type: 'SCAN' });
      UIState.scanning = false;
      announce('Posture scan complete. ' + activeFindings(LabStore.state.configs).length + ' open findings.');
    }, FAMILY_ORDER.length * 300 + 320);
  }

  // ── delegated events ──────────────────────────────────────────────────────
  function onClick(ev) {
    var target = ev.target instanceof Element ? ev.target : null;
    if (!target) return;
    var el = target.closest('[data-action]');

    // overlay click-to-close (radix parity): clicking the overlay itself
    if (!el && target.classList && target.classList.contains('overlay')) {
      var act = target.getAttribute('data-action');
      if (act) el = target;
    }
    if (!el) return;
    var a = el.getAttribute('data-action');
    var state = LabStore.state;

    switch (a) {
      case 'SET_MODE':
        paintedKeys.clear();
        LabStore.dispatch({ type: 'SET_MODE', mode: el.getAttribute('data-mode') });
        break;
      case 'GOTO':
        paintedKeys.clear();
        LabStore.dispatch({ type: 'GOTO', stage: el.getAttribute('data-stage') });
        break;
      case 'SET_PANE':
        LabStore.dispatch({ type: 'SET_PANE', pane: el.getAttribute('data-pane') });
        break;
      case 'DOSSIER_TAB_SET':
        LabStore.dispatch({ type: 'DOSSIER_TAB', tab: el.getAttribute('data-tab') });
        break;
      case 'DESK_TAB_SET':
        LabStore.dispatch({ type: 'DESK_TAB', tab: el.getAttribute('data-tab') });
        break;
      case 'DOCTRINE_OPEN':
        LabStore.dispatch({ type: 'DOCTRINE', open: true });
        break;
      case 'DOCTRINE_CLOSE':
        LabStore.dispatch({ type: 'DOCTRINE', open: false });
        break;
      case 'SELECT_RESOURCE':
      case 'JUMP_RESOURCE':
        selectResource(el.getAttribute('data-resource'));
        break;
      case 'TOGGLE_BPA': {
        // Block Public Access also syncs publicRead (original onCheckedChange)
        var idB = el.getAttribute('data-id');
        var vB = state.configs.buckets[idB].blockPublicAccess;
        LabStore.dispatch({ type: 'PATCH_BUCKET', id: idB, patch: { blockPublicAccess: !vB, publicRead: vB } });
        break;
      }
      case 'TOGGLE_MFA': {
        var idM = el.getAttribute('data-id');
        var vM = state.configs.identities[idM].mfa;
        LabStore.dispatch({ type: 'PATCH_IDENTITY', id: idM, patch: { mfa: !vM } });
        if (!vM) LabStore.dispatch({ type: 'LOG_ACTION', actionId: idM + ':enforce-mfa' });
        break;
      }
      case 'TOGGLE_PLAIN': {
        var kind = el.getAttribute('data-kind');
        var idT = el.getAttribute('data-id');
        var field = el.getAttribute('data-field');
        var cur;
        if (kind === 'bucket') cur = state.configs.buckets[idT][field];
        else if (kind === 'instance') cur = state.configs.instances[idT][field];
        else if (kind === 'db') cur = state.configs.db[idT][field];
        else if (kind === 'account') cur = state.configs.account[idT][field];
        var patch = {}; patch[field] = !cur;
        if (kind === 'bucket') LabStore.dispatch({ type: 'PATCH_BUCKET', id: idT, patch: patch });
        else if (kind === 'instance') LabStore.dispatch({ type: 'PATCH_INSTANCE', id: idT, patch: patch });
        else if (kind === 'db') LabStore.dispatch({ type: 'PATCH_DB', id: idT, patch: patch });
        else if (kind === 'account') LabStore.dispatch({ type: 'PATCH_ACCOUNT', id: idT, patch: patch });
        break;
      }
      case 'REVOKE_KEY': {
        var idR = el.getAttribute('data-identity');
        var keyId = el.getAttribute('data-key');
        var ident = state.configs.identities[idR];
        LabStore.dispatch({
          type: 'PATCH_IDENTITY', id: idR,
          patch: { keys: ident.keys.map(function (k) { return k.id === keyId ? Object.assign({}, k, { status: 'revoked' }) : k; }) },
        });
        LabStore.dispatch({ type: 'LOG_ACTION', actionId: idR + ':revoke-key' });
        break;
      }
      case 'ROTATE_KEY': {
        var idRot = el.getAttribute('data-identity');
        var curIdent = state.configs.identities[idRot];
        if (curIdent.keys.some(function (k) { return k.exposure === 'clean' && k.status === 'active'; })) break; // original guard
        LabStore.dispatch({
          type: 'PATCH_IDENTITY', id: idRot,
          patch: { keys: curIdent.keys.concat([{ id: 'SKNS4R8T6W2YEXAMPLE', status: 'active', lastUsedDays: 0, exposure: 'clean' }]) },
        });
        LabStore.dispatch({ type: 'LOG_ACTION', actionId: idRot + ':rotate-key' });
        break;
      }
      case 'APPLY_POLICY': {
        var idP = el.getAttribute('data-identity');
        var pid = el.getAttribute('data-policy');
        LabStore.dispatch({ type: 'PATCH_IDENTITY', id: idP, patch: { policyId: pid } });
        LabStore.dispatch({ type: 'LOG_ACTION', actionId: idP + ':apply-policy:' + pid });
        break;
      }
      case 'REMOVE_SECRET': {
        var idS = el.getAttribute('data-instance');
        LabStore.dispatch({ type: 'PATCH_INSTANCE', id: idS, patch: { userDataSecretRemoved: true } });
        LabStore.dispatch({ type: 'LOG_ACTION', actionId: idS + ':remove-secret' });
        break;
      }
      case 'MARK_STATEMENT':
        LabStore.dispatch({ type: 'MARK_STATEMENT', bucketId: el.getAttribute('data-bucket'), stmtId: el.getAttribute('data-stmt') });
        break;
      case 'CHECK_OBJ': {
        var objId = el.getAttribute('data-obj');
        var def = OBJECTIVES_BY_MODE[state.mode || 'medium'].find(function (o) { return o.id === objId; });
        if (!def) break;
        var res = def.validate(validationCtx(state));
        LabStore.dispatch({ type: 'CHECK', obj: objId, pass: res.pass, detail: res.detail });
        announce((res.pass ? 'Passed. ' : 'Not yet. ') + res.detail);
        break;
      }
      case 'HINT_OBJ':
        LabStore.dispatch({ type: 'HINT', obj: el.getAttribute('data-obj') });
        break;
      case 'ORDER_MOVE': {
        var oObj = el.getAttribute('data-obj');
        var oField = el.getAttribute('data-field');
        var i = parseInt(el.getAttribute('data-index'), 10);
        var dir = parseInt(el.getAttribute('data-dir'), 10);
        var curAns = state.answers[oObj] ? state.answers[oObj][oField] : undefined;
        var ord = Array.isArray(curAns) ? curAns.slice() : SCRAMBLED_ORDER.slice();
        var j = i + dir;
        if (j < 0 || j >= ord.length) break;
        var tmp = ord[i]; ord[i] = ord[j]; ord[j] = tmp;
        LabStore.dispatch({ type: 'SET_ANSWER', obj: oObj, field: oField, value: ord });
        break;
      }
      case 'SET_ANSWER_CARD': {
        var cObj = el.getAttribute('data-obj');
        var cField = el.getAttribute('data-field');
        var cItem = el.getAttribute('data-item');
        var cVal = el.getAttribute('data-value');
        var rec = (state.answers[cObj] && state.answers[cObj][cField]) || {};
        var next = Object.assign({}, rec);
        next[cItem] = cVal;
        LabStore.dispatch({ type: 'SET_ANSWER', obj: cObj, field: cField, value: next });
        break;
      }
      case 'QUIZ_ANSWER': {
        var qid = el.getAttribute('data-qid');
        if (state.quiz.checked[qid]) break; // locked after check (original)
        LabStore.dispatch({ type: 'QUIZ_ANSWER', qid: qid, choice: el.getAttribute('data-oid') });
        break;
      }
      case 'QUIZ_CHECK': {
        var qidC = el.getAttribute('data-qid');
        var questions = QUIZ_BY_MODE[state.mode || 'medium'];
        var q = questions.find(function (x) { return x.id === qidC; });
        LabStore.dispatch({ type: 'QUIZ_CHECK', qid: qidC });
        if (q) {
          var picked = state.quiz.answers[qidC];
          announce(picked === q.correct ? 'Correct. ' + q.explanation : 'Not quite — the correct answer is ' + q.correct.toUpperCase() + '. ' + q.explanation);
        }
        break;
      }
      case 'SCAN':
        runScan();
        break;
      case 'SIEM_OPEN':
        UIState.siemOpen = true;
        render();
        break;
      case 'SIEM_CLOSE':
        UIState.siemOpen = false;
        render();
        break;
      case 'RESET_OPEN':
        UIState.resetOpen = true;
        render();
        break;
      case 'RESET_CANCEL':
        UIState.resetOpen = false;
        render();
        break;
      case 'RESET_CONFIRM':
        clearState();
        UIState.resetOpen = false;
        UIState.completionDismissed = false;
        UIState.siemOpen = false;
        paintedKeys.clear();
        LabStore.dispatch({ type: 'RESET' });
        break;
      case 'COMPLETION_CLOSE':
        UIState.completionDismissed = true; // original: onOpenChange(false)
        render();
        break;
      case 'COMPLETION_REOPEN':
        UIState.completionDismissed = false;
        render();
        break;
      default:
        break;
    }
  }

  function onChange(ev) {
    var target = ev.target instanceof Element ? ev.target : null;
    if (!target || !target.matches('select')) return;
    var state = LabStore.state;
    var kind = target.getAttribute('data-change');
    if (!kind) return;
    var value = target.value;

    switch (kind) {
      case 'PATCH_BUCKET_ENC':
        LabStore.dispatch({ type: 'PATCH_BUCKET', id: target.getAttribute('data-id'), patch: { encryption: value } });
        break;
      case 'PATCH_INSTANCE_IMDS':
        LabStore.dispatch({ type: 'PATCH_INSTANCE', id: target.getAttribute('data-id'), patch: { imds: value } });
        break;
      case 'PATCH_SG_SOURCE':
        LabStore.dispatch({ type: 'PATCH_SG_RULE', sgId: target.getAttribute('data-sg'), ruleId: target.getAttribute('data-rule'), source: value });
        break;
      case 'SET_ANSWER_SELECT':
        LabStore.dispatch({ type: 'SET_ANSWER', obj: target.getAttribute('data-obj'), field: target.getAttribute('data-field'), value: value });
        break;
      case 'SET_ANSWER_CARD_SELECT': {
        var obj = target.getAttribute('data-obj');
        var field = target.getAttribute('data-field');
        var item = target.getAttribute('data-item');
        var rec = (state.answers[obj] && state.answers[obj][field]) || {};
        var next = Object.assign({}, rec);
        next[item] = value;
        LabStore.dispatch({ type: 'SET_ANSWER', obj: obj, field: field, value: next });
        break;
      }
      default:
        break;
    }
  }

  // ── keyboard: Escape closes topmost overlay; Tab trapped inside it ────────
  function topOverlay() {
    if (UIState.resetOpen) return 'reset';
    if (UIState.siemOpen) return 'siem';
    if (UIState.completionOpen) return 'completion';
    if (LabStore.state.doctrineOpen) return 'doctrine';
    return null;
  }

  function onKeydown(ev) {
    var top = topOverlay();
    if (!top) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (top === 'reset') { UIState.resetOpen = false; render(); }
      else if (top === 'siem') { UIState.siemOpen = false; render(); }
      else if (top === 'completion') { UIState.completionDismissed = true; render(); }
      else if (top === 'doctrine') { LabStore.dispatch({ type: 'DOCTRINE', open: false }); }
      return;
    }
    if (ev.key === 'Tab') {
      var modal = app.querySelector('.modal, .drawer');
      if (!modal) return;
      var focusables = Array.prototype.slice.call(
        modal.querySelectorAll('button, [href], select, [tabindex]:not([tabindex="-1"])')
      ).filter(function (n) { return !n.disabled; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault(); last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault(); first.focus();
      } else if (!modal.contains(document.activeElement)) {
        ev.preventDefault(); first.focus();
      }
    }
  }

  // ── boot ──────────────────────────────────────────────────────────────────
  LabStore.boot();
  LabStore.subscribe(render);
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', onKeydown);
  render();
})();
