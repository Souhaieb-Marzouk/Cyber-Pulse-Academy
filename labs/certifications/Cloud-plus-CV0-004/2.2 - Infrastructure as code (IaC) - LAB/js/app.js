// ─── Blueprint Studio · root shell + controller (static port) ───────────────
// Vanilla-JS translation of IacLab.tsx. One render loop re-renders #root on
// every store change; all interactions go through delegated data-act /
// data-env handlers below. Transient UI state (selected term, topology
// highlight, open dialogs, per-objective feedback) mirrors the React
// useState hooks in the original and is never persisted.

(function () {
  'use strict';

  var Store = window.LabStore;
  var Sheets = window.BSheets;
  var Panels = window.BPanels;
  var Quiz = window.BQuiz;
  var Modal = window.BModal;
  var P = window.BP;
  var icon = P.icon;
  var esc = P.esc;

  var SHEETS = [
    { no: '01', short: 'BRIEF' },
    { no: '02', short: 'FUNDAMENTALS' },
    { no: '03', short: 'WORKBENCH' },
    { no: '04', short: 'SPEC CHECKLIST' },
    { no: '05', short: 'INSPECTION' },
    { no: '06', short: 'FIELD NOTES' },
  ];

  // Transient UI state — mirrors component-local useState in the original.
  var ui = {
    selectedTerm: null,      // Fundamentals M1: term awaiting a description click
    draftHighlight: null,    // DraftingBoard [a, b] line range
    draftNode: null,         // DraftingBoard active topology node id
    scanning: false,         // ScanBench 600 ms "SCANNING…" window
    checkFeedback: {},       // objectiveId → {pass, msg} (tracker card, transient)
    resetOpen: false,        // reset confirm dialog (Radix AlertDialog in original)
    lastFid: null,           // last interacted [data-fid] for focus restore
    focusFidOnce: null,      // one-shot focus target (dialog open/close)
  };

  var prev = { screen: null, mode: null, sheet: null, drawer: null };
  var firstRender = true;

  function root() { return document.getElementById('root'); }

  function findObjective(id) {
    return OBJECTIVES.find(function (o) { return o.id === id; }) || null;
  }

  // ── HTML builders ──────────────────────────────────────────────────────────

  function renderTitlebar(s, prog) {
    return (
      '<header class="titlebar" role="banner">' +
      '<div class="titlebar-inner">' +
      '<p class="titlebar-title">BLUEPRINT STUDIO <span class="amber">· CV0-004 L2.2 IaC</span></p>' +
      '<p class="titlebar-meta">REV R8 · ' + (s.mode === 'hard' ? 'LEAD ENGINEER' : 'DRAFTSMAN') +
      ' MODE · SPEC ' + prog.done + '/' + prog.total + '</p>' +
      '<div class="titlebar-actions">' +
      '<button type="button" class="btn btn-strip" data-act="toggle-legend" data-fid="legend-btn"' +
      ' aria-expanded="' + s.legendOpen + '" aria-controls="legend-drawer">' +
      icon('book-open', 'ic-14') + ' LEGEND</button>' +
      '<button type="button" class="btn btn-strip is-red" data-act="open-reset" data-fid="reset-btn">' +
      icon('rotate-ccw', 'ic-14') + ' RESET</button>' +
      '</div></div>' +
      '<div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:' + prog.pct + '%"></div></div>' +
      '</header>'
    );
  }

  function renderSpine(sheet) {
    return (
      '<nav class="spine" aria-label="Drawing sheet navigator">' +
      SHEETS.map(function (sh, i) {
        var active = sheet === i;
        return (
          '<button type="button" data-act="set-sheet" data-n="' + i + '"' +
          (active ? ' aria-current="page"' : '') +
          ' class="' + (active ? 'active' : '') + '">' +
          '<span class="no">' + sh.no + '</span>' +
          '<span class="short">' + sh.short + '</span>' +
          '</button>'
        );
      }).join('') +
      '</nav>'
    );
  }

  function renderMobileTabs(sheet) {
    return (
      '<div class="mobile-tabs" role="tablist" aria-label="Drawing sheets">' +
      SHEETS.map(function (sh, i) {
        var active = sheet === i;
        return (
          '<button type="button" role="tab" aria-selected="' + active + '"' +
          ' data-act="set-sheet" data-n="' + i + '"' +
          ' class="' + (active ? 'active' : '') + '">' + sh.no + ' ' + sh.short + '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  function renderTurner(sheet) {
    return (
      '<div class="turner">' +
      '<button type="button" class="btn btn-turn" data-act="prev-sheet" data-fid="prev-sheet"' +
      (sheet === 0 ? ' disabled' : '') + '>◀ PREV SHEET</button>' +
      '<span class="turner-status">SHEET ' + SHEETS[sheet].no + ' / 06</span>' +
      '<button type="button" class="btn btn-turn is-next" data-act="next-sheet" data-fid="next-sheet"' +
      (sheet === SHEETS.length - 1 ? ' disabled' : '') + '>NEXT SHEET ▶</button>' +
      '</div>'
    );
  }

  function renderLegend(s) {
    if (!s.legendOpen) return '';
    var terms = GLOSSARY.map(function (g) {
      return '<div class="term"><dt>' + esc(g.term) + '</dt><dd>' + esc(g.def) + '</dd></div>';
    }).join('');
    return (
      '<aside id="legend-drawer" class="legend anim" role="complementary" aria-label="Legend: glossary of terms" tabindex="-1">' +
      '<div class="legend-head">' +
      '<p class="legend-title">LEGEND · 15 TERMS</p>' +
      '<button type="button" class="btn legend-close" data-act="close-legend" data-fid="legend-close" aria-label="Close legend">CLOSE ✕</button>' +
      '</div>' +
      '<dl>' + terms + '</dl>' +
      '</aside>'
    );
  }

  function sheetHtml(s, ui, anim) {
    switch (s.sheet) {
      case 0: return Sheets.renderBrief(anim);
      case 1: return Sheets.renderFundamentals(ui);
      case 2: return Sheets.renderWorkbench(anim, ui);
      case 3: return Sheets.renderTracker(anim, ui);
      case 4: return Quiz.renderQuiz(anim);
      default: return Sheets.renderDebrief();
    }
  }

  function renderLab(s, anim) {
    var prog = Store.progressFor(s.mode, s.objectives);
    var animCls = anim ? ' anim-sheet' : '';
    return (
      '<div class="paper min-h-screen">' +
      renderTitlebar(s, prog) +
      '<div class="shell" id="sheet-anchor">' +
      renderSpine(s.sheet) +
      '<div class="sheet-col">' +
      renderMobileTabs(s.sheet) +
      '<div class="' + animCls.trim() + '">' + sheetHtml(s, ui, anim) + '</div>' +
      renderTurner(s.sheet) +
      '</div>' +
      '</div>' +
      renderLegend(s) +
      Modal.renderCompletion() +
      (ui.resetOpen ? Modal.renderResetDialog() : '') +
      '</div>'
    );
  }

  function renderModeSelect(s) {
    return (
      '<div class="paper min-h-screen">' +
      Sheets.renderModeSelect() +
      Modal.renderCompletion() +
      (ui.resetOpen ? Modal.renderResetDialog() : '') +
      '</div>'
    );
  }

  // ── Render loop ────────────────────────────────────────────────────────────

  function render() {
    var r = root();
    if (!r) return;
    var s = Store.getState();

    // Animation gate: entrance animations replay only when the sheet,
    // drawer or mode actually changed (mirrors React remount semantics).
    var anim =
      firstRender ||
      s.screen !== prev.screen ||
      s.mode !== prev.mode ||
      s.sheet !== prev.sheet ||
      s.drawer !== prev.drawer;

    // Leaving a sheet unmounts its transient feedback (component-local state).
    if (s.sheet !== prev.sheet) ui.checkFeedback = {};

    // Preserve code-pane scroll position across data-only re-renders.
    var pane = document.getElementById('code-pane');
    var paneScroll = pane ? pane.scrollTop : 0;
    var paneStable =
      pane && s.screen === 'lab' && s.sheet === prev.sheet && s.drawer === prev.drawer;

    r.innerHTML = s.screen === 'lab' && s.mode ? renderLab(s, anim) : renderModeSelect(s);

    if (paneStable) {
      var pane2 = document.getElementById('code-pane');
      if (pane2) pane2.scrollTop = paneScroll;
    }

    // Focus management: one-shot target wins, then restore last interacted.
    if (ui.focusFidOnce) {
      var f = document.querySelector('[data-fid="' + ui.focusFidOnce + '"]');
      if (f) f.focus({ preventScroll: true });
      ui.focusFidOnce = null;
      ui.lastFid = null;
    } else if (ui.lastFid) {
      var f2 = document.querySelector('[data-fid="' + ui.lastFid + '"]');
      if (f2) f2.focus({ preventScroll: true });
    }

    // Body scroll lock while a dialog is open (Radix behavior).
    var dialogOpen = !!document.querySelector('[data-dialog]');
    document.body.classList.toggle('modal-open', dialogOpen);

    prev = { screen: s.screen, mode: s.mode, sheet: s.sheet, drawer: s.drawer };
    firstRender = false;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  function applyEnvPath(path, value) {
    // object names may contain digits (h7, h9) — hence 0-9 in the class
    var m = /^([A-Za-z0-9]+)[:.#](.+)$/.exec(path);
    var env = Store.getState().env;
    if (m) {
      var obj = m[1], key = m[2];
      if (obj === 'planAnswers') {
        if (key === 'add' || key === 'change' || key === 'destroy') Store.setPlanAnswer(key, Number(value));
        else Store.setPlanText(key, value);
      } else if (obj === 'toolAssign') {
        Store.setTool(key, value);
      } else if (obj === 'ruleA' || obj === 'ruleB') {
        var patch = {};
        patch[key] = value;
        Store.setRule(obj, patch);
      } else {
        // h7 / h9 / driftClass — nested maps on env
        var cur = Object.assign({}, env[obj]);
        cur[key] = value;
        var p = {};
        p[obj] = cur;
        Store.patchEnv(p);
      }
    } else {
      var bp = {};
      bp[path] = value;
      Store.patchEnv(bp);
    }
  }

  function doTopoNode(id) {
    var nd = TOPOLOGY.find(function (x) { return x.id === id; });
    if (!nd) return;
    ui.draftNode = nd.id;
    ui.draftHighlight = [nd.lines[0], nd.lines[1]];
    render();
    var first = document.querySelector('#code-pane [data-line="' + nd.lines[0] + '"]');
    if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function openCompletion() {
    ui.focusFidOnce = 'close-completion';
    Store.setShowCompletion(true);
  }

  function closeCompletion() {
    ui.focusFidOnce = 'final-inspection';
    Store.setShowCompletion(false);
  }

  function openReset() {
    ui.focusFidOnce = 'reset-cancel';
    ui.resetOpen = true;
    render();
  }

  function closeReset() {
    ui.focusFidOnce = 'reset-btn';
    ui.resetOpen = false;
    render();
  }

  function confirmReset() {
    Store.resetAll();
    ui.resetOpen = false;
    ui.checkFeedback = {};
    ui.selectedTerm = null;
    ui.draftHighlight = null;
    ui.draftNode = null;
    ui.scanning = false;
    ui.lastFid = null;
    ui.focusFidOnce = null;
    render();
    window.scrollTo(0, 0);
  }

  // ── Delegated events ───────────────────────────────────────────────────────

  function onClick(e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) return;
    var act = el.getAttribute('data-act');
    var fidEl = el.closest('[data-fid]') || el;
    if (fidEl && fidEl.getAttribute) ui.lastFid = fidEl.getAttribute('data-fid');

    var s = Store.getState();

    switch (act) {
      // shell
      case 'toggle-legend': Store.setLegendOpen(!s.legendOpen); break;
      case 'close-legend': Store.setLegendOpen(false); ui.focusFidOnce = 'legend-btn'; render(); break;
      case 'open-reset': openReset(); break;
      case 'close-reset': closeReset(); break;
      case 'confirm-reset': confirmReset(); break;
      case 'overlay-reset': closeReset(); break;
      case 'set-sheet': Store.setSheet(Number(el.getAttribute('data-n'))); break;
      case 'prev-sheet': Store.setSheet(Math.max(0, s.sheet - 1)); break;
      case 'next-sheet': Store.setSheet(Math.min(SHEETS.length - 1, s.sheet + 1)); break;

      // mode select
      case 'enter-mode':
        Store.enterLab(el.getAttribute('data-mode'));
        window.scrollTo(0, 0);
        break;

      // completion modal
      case 'open-completion': openCompletion(); break;
      case 'close-completion': closeCompletion(); break;
      case 'overlay-completion': closeCompletion(); break;
      case 'goto-notes':
        ui.focusFidOnce = null;
        Store.setShowCompletion(false);
        Store.setSheet(5);
        break;

      // fundamentals M1 pairing
      case 'term-select': {
        var t = el.getAttribute('data-term');
        ui.selectedTerm = ui.selectedTerm === t ? null : t;
        render();
        break;
      }
      case 'desc-pick':
        if (ui.selectedTerm) {
          Store.setBenefitPair(ui.selectedTerm, el.getAttribute('data-key'));
          ui.selectedTerm = null;
        }
        break;

      // fundamentals M2 stamps
      case 'di-stamp': Store.setDi(el.getAttribute('data-id'), el.getAttribute('data-v')); break;

      // workbench
      case 'set-drawer': Store.setDrawer(Number(el.getAttribute('data-n'))); break;
      case 'line-click': {
        var n = Number(el.getAttribute('data-line'));
        if (n === SECRET_LINE) Store.patchEnv({ secretLineFound: true });
        else Store.toggleLineClick(n);
        break;
      }
      case 'flag-line': Store.toggleFlag(Number(el.getAttribute('data-line'))); break;
      case 'topo-node': doTopoNode(el.getAttribute('data-node')); break;
      case 'order-toggle':
        Store.orderToggle(
          el.getAttribute('data-key'),
          el.getAttribute('data-id'),
          el.getAttribute('data-decoy') === '1',
          Number(el.getAttribute('data-max'))
        );
        break;
      case 'set-run': Store.setPipelineRun(el.getAttribute('data-run')); break;
      case 'run-scan': {
        ui.scanning = true;
        render();
        window.setTimeout(function () {
          ui.scanning = false;
          Store.patchEnv({ scanRun: true }); // notify() re-renders
        }, 600);
        break;
      }
      case 'triage': Store.setScanClass(el.getAttribute('data-finding'), el.getAttribute('data-v')); break;
      case 'drift-mark': Store.toggleDriftMark(Number(el.getAttribute('data-row'))); break;
      case 'switch': {
        var key = el.getAttribute('data-switch');
        var cur = !!Store.getState().env[key];
        Store.patchEnv(one(key, !cur));
        break;
      }

      // tracker / objectives
      case 'check-obj': {
        var id = el.getAttribute('data-id');
        var o = findObjective(id);
        if (!o) break;
        var out = Store.checkObjective(id, o.validate, o.success, o.fail);
        ui.checkFeedback[id] = { pass: out.pass, msg: out.message };
        render();
        break;
      }
      case 'use-hint': Store.useHint(el.getAttribute('data-id')); break;
      case 'goto-tool': {
        var ob = findObjective(el.getAttribute('data-id'));
        if (!ob || !ob.goTo) break;
        ui.focusFidOnce = null;
        Store.setSheet(ob.goTo.sheet);
        if (ob.goTo.drawer !== undefined) Store.setDrawer(ob.goTo.drawer);
        window.setTimeout(function () {
          var anchor = document.getElementById('sheet-anchor');
          if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
        break;
      }

      // quiz
      case 'quiz-pick': Store.setQuizAnswer(Number(el.getAttribute('data-q')), Number(el.getAttribute('data-opt'))); break;
      case 'quiz-stamp': Store.checkQuizAnswer(Number(el.getAttribute('data-q'))); break;
      case 'quiz-submit': Store.submitQuiz(); break;
    }
  }

  function one(k, v) { var p = {}; p[k] = v; return p; }

  function onChange(e) {
    var t = e.target;

    // select.env paths (field selects across all drawers)
    if (t.matches && t.matches('select.sel[data-env]')) {
      applyEnvPath(t.getAttribute('data-env'), t.value);
      var fidEl = t.closest('[data-fid]') || t;
      if (fidEl && fidEl.getAttribute) ui.lastFid = fidEl.getAttribute('data-fid');
      return;
    }
    // M5 remedy radios
    if (t.name === 'secret-fix') {
      Store.patchEnv({ secretFixChoice: t.value });
      return;
    }
    // M10 remediation checkboxes
    if (t.matches && t.matches('input[type="checkbox"][data-check]')) {
      Store.toggleF1Action(t.getAttribute('data-check'));
      return;
    }
  }

  function onKeyDown(e) {
    var s = Store.getState();

    // Radix-parity: ESC closes legend → reset dialog → completion modal.
    if (e.key === 'Escape') {
      if (s.legendOpen) {
        Store.setLegendOpen(false);
        ui.focusFidOnce = 'legend-btn';
        render();
        return;
      }
      if (ui.resetOpen) { closeReset(); return; }
      if (s.showCompletion) { closeCompletion(); return; }
    }

    // Keyboard activation for the SVG topology nodes (role="button").
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest) {
      var g = e.target.closest('[data-act="topo-node"]');
      if (g) {
        e.preventDefault();
        doTopoNode(g.getAttribute('data-node'));
        return;
      }
    }

    // Focus trap while a dialog is open (Radix parity).
    if (e.key === 'Tab') {
      var dialog = document.querySelector('[data-dialog]');
      if (!dialog) return;
      var focusables = dialog.querySelectorAll('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────

  Store.subscribe(render);
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', onKeyDown);
  render();
})();
