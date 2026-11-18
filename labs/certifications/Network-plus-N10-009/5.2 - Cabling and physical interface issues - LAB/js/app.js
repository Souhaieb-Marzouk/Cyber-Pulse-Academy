// ── App bootstrap, event wiring, render orchestration ────────────────────────
// Replaces React/zustand/Radix with: one render pass per state change (rAF
// batched), event delegation via data-action attributes, and manual focus/scroll
// preservation so refreshes never steal focus or scroll position.
'use strict';

(function () {
  let lastFocusKey = null;      // focus key of the element focused before an overlay opened

  // ── Focus / scroll preservation across full re-renders ──
  function fkOf(el) {
    if (!el || el === document.body) return null;
    if (el.dataset && el.dataset.fk) return el.dataset.fk;
    const tag = el.tagName;
    if (tag === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
      return 'i:' + el.type + ':' + el.getAttribute('aria-label');
    }
    if (el.dataset && el.dataset.num) return 'n:' + el.dataset.num;
    if (tag === 'SELECT') return 's:' + (el.dataset.k || el.getAttribute('aria-label'));
    if (el.dataset && el.dataset.action) return 'b:' + el.dataset.action + ':' + (el.dataset.arg || '') + ':' + (el.dataset.id || '');
    return null;
  }

  function findByFk(root, key) {
    if (!key) return null;
    const parts = key.split(':');
    let sel = null;
    if (parts[0] === 'i') sel = 'input[type="' + parts[1] + '"][aria-label="' + parts.slice(2).join(':').replace(/"/g, '\\"') + '"]';
    else if (parts[0] === 'n') sel = '[data-num="' + parts[1] + '"]';
    else if (parts[0] === 's') sel = 'select[data-k="' + parts[1] + '"]';
    else if (parts[0] === 'b') sel = '[data-action="' + parts[1] + '"]';
    if (!sel) return null;
    const list = root.querySelectorAll(sel);
    for (let i = 0; i < list.length; i++) {
      if (fkOf(list[i]) === key) return list[i];
    }
    return null;
  }

  function renderApp() {
    const app = document.getElementById('app');
    const active = document.activeElement;
    const fk = fkOf(active);
    const winY = window.scrollY;
    const scrollables = Array.prototype.slice.call(document.querySelectorAll('.sheet-body, .modal'));
    const tops = scrollables.map(function (s) { return s.scrollTop; });

    let html = '';
    if (!state.mode) {
      html = '<div class="page">' + renderModeSelect() + '</div>';
    } else {
      html = '<div class="page">' + renderHeader() + '<main class="main">';
      if (state.phase === 'brief') {
        html += '<div class="col-3xl">' + renderBriefing(false) + '</div>';
      } else if (state.phase === 'quiz') {
        html += '<div class="col-3xl">' + renderQuiz()
          + '<p class="back-row"><button type="button" data-action="set-phase" data-arg="bench" class="btn btn-back">← back to the bench</button></p></div>';
      } else if (state.phase === 'debrief') {
        html += '<div class="col-4xl">' + renderDebrief()
          + '<p class="back-row"><button type="button" data-action="set-phase" data-arg="bench" class="btn btn-back">← back to the bench</button></p></div>';
      } else if (state.phase === 'bench') {
        const objectives = OBJECTIVES[state.mode];
        const stats = objectiveStats(state.obj, objectives.map(function (o) { return o.id; }));
        html += renderBayTabs()
          + '<div class="bench-grid">'
          + '<div class="stack-md">' + renderTicketRail() + renderPatchBay() + renderTermination() + '</div>'
          + '<div class="stack-md">' + renderSwitchFace() + '</div>'
          + '<div class="stack-md">' + renderTestBench() + renderPowerBay() + '</div>'
          + '</div>'
          + '<div class="bench-foot">' + icon('cable', 'ic ic-14 t-z600')
          + readoutHTML('objectives auto-save · re-check any objective after changing the bench · sign-off unlocks when all ' + stats.total + ' pass', 'default', 'text-10')
          + '</div>';
      }
      // Overlays (top-most decision mirrors LabRoot's finishOpen logic)
      if (uiState.objectivesOpen) html += objectivesSheetHTML();
      if (uiState.manualOpen) html += renderManualDialog();
      if (state.completionOpen) html += renderCompletionModal();
      if (uiState.confirmResetOpen) html += renderResetDialog();
      html += '</main></div>';
    }

    app.innerHTML = html;

    // restore focus + scroll positions
    if (fk) {
      const el = findByFk(app, fk);
      if (el) el.focus();
    }
    const newScrollables = document.querySelectorAll('.sheet-body, .modal');
    for (let i = 0; i < newScrollables.length && i < tops.length; i++) newScrollables[i].scrollTop = tops[i];
    window.scrollTo(0, winY);

    // body scroll lock while an overlay is open (Radix behavior)
    const anyOverlay = uiState.objectivesOpen || uiState.manualOpen || state.completionOpen || uiState.confirmResetOpen;
    document.body.classList.toggle('no-scroll', anyOverlay);

    // first paint of a freshly opened overlay gets focus inside it
    const overlay = app.querySelector('[data-overlay]');
    if (overlay && lastFocusKey === null) {
      lastFocusKey = fk;
      const first = overlay.querySelector('button, select, input, a[href]');
      if (first) first.focus();
    }
  }

  // ── Overlay open/close with focus restore ──
  function openOverlay(kind) {
    if (kind === 'objectives') uiState.objectivesOpen = true;
    if (kind === 'manual') uiState.manualOpen = true;
    if (kind === 'reset') uiState.confirmResetOpen = true;
    if (kind === 'completion') state.completionOpen = true;
    lastFocusKey = null; // renderApp will capture the opener via [data-overlay] logic
    renderApp();
  }

  function closeOverlays(opts) {
    let wasOpen = false;
    if (uiState.objectivesOpen) { uiState.objectivesOpen = false; wasOpen = true; }
    if (uiState.manualOpen) { uiState.manualOpen = false; wasOpen = true; }
    if (state.completionOpen && !(opts && opts.keepCompletion)) { state.completionOpen = false; wasOpen = true; }
    if (uiState.confirmResetOpen) { uiState.confirmResetOpen = false; wasOpen = true; }
    if (wasOpen) {
      const fk = lastFocusKey;
      lastFocusKey = null;
      renderApp();
      const el = findByFk(document, fk); // re-find after re-render (old node was replaced)
      if (el) el.focus();
    }
  }

  // ── Objective CHECK RESULTS (+ auto sign-off when the last one passes) ──
  function runCheck(objId) {
    const obj = OBJECTIVES[state.mode].find(function (o) { return o.id === objId; });
    if (!obj) return;
    const pass = obj.check(state.env, derive(state.env));
    actions.checkObjective(objId, pass);
    if (state.mode) {
      const objs = OBJECTIVES[state.mode];
      const done = objs.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
      if (done === objs.length && !state.completedSeen) {
        actions.markCompletedSeen();
        state.completionOpen = true; // auto sign-off modal
      }
    }
    commit();
  }

  // persist + render (for state mutations that don't run through notify())
  function commit() {
    persist();
    renderApp();
  }

  // ── Action dispatch ──
  function handleAction(el, action, arg, dataset) {
    const env = state.env;
    switch (action) {
      // navigation & shell
      case 'set-mode': actions.setMode(arg); break;
      case 'set-phase': actions.setPhase(arg); break;
      case 'enter-bench': actions.setPhase('bench'); break;
      case 'jump': { const t = document.getElementById(arg); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); break; }
      case 'brief-tab': uiState.briefTab = arg; renderApp(); break;

      // overlays
      case 'open-objectives': openOverlay('objectives'); break;
      case 'close-objectives': closeOverlays(); break;
      case 'open-manual': openOverlay('manual'); break;
      case 'close-manual': closeOverlays(); break;
      case 'sign-off': openOverlay('completion'); break;
      case 'close-completion': closeOverlays(); break;
      case 'ask-reset': openOverlay('reset'); break;
      case 'close-reset': closeOverlays(); break;
      case 'do-reset': actions.reset(); uiState.confirmResetOpen = false; uiState.objectivesOpen = false; uiState.manualOpen = false; state.completionOpen = false; renderApp(); break;
      case 'reset-from-modal': actions.reset(); uiState.confirmResetOpen = false; uiState.objectivesOpen = false; uiState.manualOpen = false; state.completionOpen = false; renderApp(); break;

      // objectives
      case 'toggle-card': {
        const cur = uiState.openCards[arg];
        uiState.openCards[arg] = cur !== undefined ? !cur : !(state.mode === 'medium');
        renderApp(); break;
      }
      case 'hint': actions.useHint(arg); commit(); break;

      // multi-select picks (objectives / jack audit)
      case 'multi-toggle': {
        const mk = dataset.k, mv = dataset.v;
        actions.patchEnv(function (e) {
          const curNow = e.multi[mk] || [];
          const next = curNow.includes(mv) ? curNow.filter(function (x) { return x !== mv; }) : curNow.concat([mv]);
          const multi = Object.assign({}, e.multi);
          multi[mk] = next;
          return { multi: multi };
        });
        break;
      }
      case 'check': runCheck(arg); break;

      // ticket rail
      case 'doc-toggle': {
        const id = dataset.id;
        const has = env.docDone.includes(id);
        actions.patchEnv(function (e) {
          const next = has
            ? e.docDone.filter(function (x) { return x !== id; })
            : Array.from(new Set(e.docDone.concat([id])));
          return { docDone: next };
        });
        break;
      }

      // patch bay
      case 'install-cable':
        actions.patchEnv(function (e) {
          const jobCables = Object.assign({}, e.jobCables);
          jobCables[dataset.job] = dataset.cable;
          return { jobCables: jobCables };
        });
        break;
      case 'cr2-toggle': actions.patchEnv({ cr2Reroute: arg === 'cr2Reroute' ? !env.cr2Reroute : env.cr2Reroute, cr2Recert: arg === 'cr2Recert' ? !env.cr2Recert : env.cr2Recert }); break;

      // switch face
      case 'select-port': uiState.selPort = arg; renderApp(); break;
      case 'recover-p9': actions.patchEnv({ port9Recovered: true }); break;
      case 'enable-p21': actions.patchEnv({ p21Enabled: true }); break;

      // test bench
      case 'select-test-run': uiState.testRun = arg; renderApp(); break;
      case 'select-meter-run': uiState.meterRun = arg; renderApp(); break;
      case 'run-test': actions.patchEnv(function (e) { const tested = Object.assign({}, e.tested); tested[uiState.testRun] = true; return { tested: tested }; }); break;
      case 'run-meter': actions.patchEnv(function (e) { const metered = Object.assign({}, e.metered); metered[uiState.meterRun] = true; return { metered: metered }; }); break;
      case 'a2-clean': actions.patchEnv({ a2Cleaned: true }); break;
      case 'lib2-replace': actions.patchEnv({ lib2Replaced: true }); break;

      // power bay
      case 'toggle-p14': actions.patchEnv({ poeP14Moved: !env.poeP14Moved }); break;
      case 'set-p16-std': actions.patchEnv({ poeP16Standard: arg }); break;
      case 'set-sfp': actions.patchEnv(dataset.side === 'sfpA1' ? { sfpA1: arg } : { sfpCore: arg }); break;
      case 'set-cord': actions.patchEnv({ cordA1: arg }); break;

      // LACP sequencer
      case 'lacp-enqueue':
        if (!env.lacpOrder.includes(arg) && !env.lacpApplied) actions.patchEnv({ lacpOrder: env.lacpOrder.concat([arg]) });
        break;
      case 'lacp-apply': {
        const seq = env.lacpOrder;
        const correct = seq.length === 4 && seq[0] === 'confirm' && seq[1] === 'add' && seq[2] === 'verify' && seq[3] === 'document';
        actions.patchEnv({ lacpApplied: correct, lacpOrder: correct ? seq : [] });
        break;
      }
      case 'lacp-clear': actions.patchEnv({ lacpOrder: [], lacpApplied: false }); break;

      // termination
      case 'punch':
        if (derive(env).pinOk) break;
        actions.patchEnv(function (e) { return e.pins.length >= 8 ? {} : { pins: e.pins.concat([arg]) }; });
        break;
      case 'punch-undo': actions.patchEnv(function (e) { return { pins: e.pins.slice(0, -1) }; }); break;
      case 'punch-reset': actions.patchEnv({ pins: [] }); break;
      case 'untwist-toggle': actions.patchEnv({ untwist: !env.untwist }); break;

      // quiz
      case 'quiz-next': uiState.quizIdx = Math.min(uiState.quizIdx + 1, quizFor(state.mode).length - 1); renderApp(); break;
      case 'quiz-submit': {
        const draft = uiState.quizDrafts[arg];
        if (draft !== undefined) actions.answerQuiz(arg, draft);
        break;
      }

      default: break;
    }
    renderApp();
  }

  // ── Event delegation ──
  document.addEventListener('click', function (ev) {
    const el = ev.target instanceof Element ? ev.target.closest('[data-action]') : null;
    if (!el) return;
    // checkboxes/radios are handled by the change event (label clicks would double-fire)
    if (ev.target instanceof HTMLInputElement && (ev.target.type === 'checkbox' || ev.target.type === 'radio')) return;
    if (el instanceof HTMLButtonElement && el.disabled) return;
    handleAction(el, el.dataset.action, el.dataset.arg, el.dataset);
  });

  document.addEventListener('change', function (ev) {
    const t = ev.target;
    if (!(t instanceof Element)) return;
    // native selects → diag / match fields
    if (t.matches('select[data-action="diag"]')) {
      actions.patchEnv(function (e) { const diag = Object.assign({}, e.diag); diag[t.dataset.k] = t.value; return { diag: diag }; });
      return;
    }
    if (t.matches('select[data-action="match"]')) {
      actions.patchEnv(function (e) { const match = Object.assign({}, e.match); match[t.dataset.k] = t.value; return { match: match }; });
      return;
    }
    // radios → quiz drafts (UI-only state; the store only records on SUBMIT)
    if (t.matches('input[type="radio"][data-action="quiz-draft"]')) {
      uiState.quizDrafts[t.dataset.id] = parseInt(t.dataset.arg, 10);
      const btn = document.querySelector('[data-action="quiz-submit"][data-arg="' + t.dataset.id + '"]');
      if (btn) btn.disabled = false;
      return;
    }
    // checkboxes → label data-action handlers (multi-toggle / doc-toggle / untwist)
    const label = t.closest('[data-action]');
    if (t instanceof HTMLInputElement && t.type === 'checkbox' && label) {
      handleAction(label, label.dataset.action, label.dataset.arg, label.dataset);
    }
  });

  // numeric inputs: silent writes so typing never loses focus
  document.addEventListener('input', function (ev) {
    const t = ev.target;
    if (t instanceof HTMLInputElement && t.dataset.num) {
      const k = t.dataset.num;
      actions.patchEnvSilent(function (e) { const num = Object.assign({}, e.num); num[k] = t.value; return { num: num }; });
    }
  });

  // keyboard: ESC closes the top overlay; Tab stays trapped inside it
  document.addEventListener('keydown', function (ev) {
    const anyOverlay = uiState.objectivesOpen || uiState.manualOpen || state.completionOpen || uiState.confirmResetOpen;
    if (ev.key === 'Escape' && anyOverlay) {
      ev.preventDefault();
      closeOverlays();
      return;
    }
    if (ev.key === 'Tab' && anyOverlay) {
      const overlays = document.querySelectorAll('[data-overlay]');
      const top = overlays[overlays.length - 1];
      if (!top) return;
      const focusables = top.querySelectorAll('button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  });

  // ── Boot: hydrate from localStorage (same key/shape as the original), then render ──
  loadPersisted();
  const boot = document.getElementById('boot');
  if (boot) boot.remove();
  subscribe(renderApp);
  renderApp();
})();
