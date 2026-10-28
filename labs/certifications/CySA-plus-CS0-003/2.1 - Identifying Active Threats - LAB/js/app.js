// ─────────────────────────────────────────────────────────────────────────────
// js/app.js — bootstrap, actions, event delegation, render orchestration
// Recreates CyberLab.tsx: external store subscription, granular panel
// re-rendering (with focus + scroll preservation), desktop/mobile visibility,
// screen-reader announcements, completion trigger, dialog a11y (initial focus,
// Escape, focus trap) and RESET semantics identical to the original.
// ─────────────────────────────────────────────────────────────────────────────

/* global labStore, freshState, clearState, objState, runCheck, applyHint,
   progressOf, quizScore, ratingOf, objectivesForMode, icon, esc, UISTATE,
   renderModeSelect, renderHeader, renderMobileNav, renderCaseFile, renderDesk,
   renderGrid, renderMissions, renderRecords, renderCompletion,
   renderResetDialog, LIFECYCLE_PHASES, RESPONSE_ACTIONS, BEHAVIORS, CLIPS */

(function () {
  'use strict';

  var DESKTOP = window.matchMedia('(min-width: 1024px)');

  // ── Tiny DOM helpers ────────────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }

  // ── Screen-reader announcements (counter suffix, 30 ms defer — as original) ─
  function announceMsg(msg) {
    UISTATE.announceCount += 1;
    var n = UISTATE.announceCount;
    window.setTimeout(function () {
      var slot = $('announce-slot');
      if (slot) slot.textContent = n === 1 ? msg : msg + ' (' + n + ')';
    }, 30);
  }

  // ── Store actions (mirror CyberLab handlers) ────────────────────────────────
  function setMap(key, id, val) {
    labStore.set(function (s) {
      var map = s.env[key] ? { ...s.env[key] } : {};
      map[id] = val;
      return { ...s, env: { ...s.env, [key]: map } };
    });
  }
  function toggleArr(key, id) {
    labStore.set(function (s) {
      var arr = s.env[key] || [];
      var next = arr.indexOf(id) !== -1 ? arr.filter(function (x) { return x !== id; }) : arr.concat([id]);
      return { ...s, env: { ...s.env, [key]: next } };
    });
  }
  function pushSeq(key, id) {
    labStore.set(function (s) {
      if (s.env[key].indexOf(id) !== -1) return s;
      return { ...s, env: { ...s.env, [key]: s.env[key].concat([id]) } };
    });
  }
  function pullSeq(key, id) {
    labStore.set(function (s) {
      return { ...s, env: { ...s.env, [key]: s.env[key].filter(function (x) { return x !== id; }) } };
    });
  }
  function setRule(i, part, val) {
    labStore.set(function (s) {
      var rule = s.env.rule.map(function (r, idx) {
        if (idx !== i) return r;
        var copy = { ...r };
        copy[part] = val;
        return copy;
      });
      return { ...s, env: { ...s.env, rule: rule } };
    });
  }
  function setOpenItem(id) {
    labStore.set(function (s) { return { ...s, env: { ...s.env, openItem: id } }; });
  }

  function doClip(clipId) {
    var s = labStore.get();
    var clip = CLIPS[clipId];
    var already = s.env.clips.indexOf(clipId) !== -1;
    toggleArr('clips', clipId);
    if (!already && clip && clip.benign && clip.benignWhy) {
      announceMsg('Analyst note: ' + clip.benignWhy);
    } else if (!already) {
      announceMsg('Clipped observable: ' + (clip && clip.label ? clip.label : clipId));
    }
  }

  function seqLabel(key, id) {
    if (key === 'lifecycle') {
      var p = LIFECYCLE_PHASES.filter(function (x) { return x.id === id; })[0];
      return p ? p.label : id;
    }
    if (key === 'response') {
      var a = RESPONSE_ACTIONS.filter(function (x) { return x.id === id; })[0];
      return a ? a.label : id;
    }
    return id;
  }

  function onCheck(o) {
    var outcome = null;
    labStore.set(function (s) {
      var prev = objState(s, o.id);
      if (prev.done) return s; // already stamped — no penalty for re-checking
      var res = runCheck(s, o);
      outcome = res.outcome;
      return res.state;
    });
    if (!outcome) return;
    announceMsg(outcome.pass
      ? o.id + ' verified. ' + outcome.feedback
      : o.id + ' returned: ' + (outcome.why || 'check failed'));
    // queue the failure message after the store update settles (as original)
    window.setTimeout(function () {
      UISTATE.failWhys[o.id] = outcome.pass ? '' : (outcome.why || '');
      sync();
    }, 0);
  }

  function onHint(o) {
    labStore.set(function (s) { return applyHint(s, o); });
    announceMsg('Hint revealed for ' + o.id + '. Hints cost a few stars — they never block progress.');
  }

  // ── Station focusing ("Aim" / "Show me where") ──────────────────────────────
  function focusStation(station) {
    if (station === 'desk' || station === 'grid' || station === 'records') {
      UISTATE.centerTab = station;
      UISTATE.mobileTab = station;
    } else if (station === 'casefile' || station === 'missions') {
      UISTATE.mobileTab = station;
    }
    UISTATE.aimedStation = station;
    sync();
    window.setTimeout(function () {
      var el = $('station-' + station);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  // ── Completion trigger (one-shot per mode start) ────────────────────────────
  function checkCompletion(s) {
    if (!s || !s.mode) return;
    var p = progressOf(s.mode, s);
    if (p.total > 0 && p.done === p.total && !(s.completedModes && s.completedModes[s.mode]) && !UISTATE.completionFired) {
      UISTATE.completionFired = true;
      labStore.set(function (st) {
        var cm = { ...(st.completedModes || {}) };
        cm[s.mode] = new Date().toISOString();
        return { ...st, completedModes: cm };
      });
      announceMsg('All objectives verified. The case close-out report is ready.');
    }
  }

  function doReset() {
    UISTATE.completionFired = false;
    clearState();
    labStore.set(function () { return freshState(); });
    UISTATE.failWhys = {};
    UISTATE.dismissedFor = null;
    UISTATE.centerTab = 'desk';
    UISTATE.mobileTab = 'desk';
    UISTATE.missionsOpenId = null;
    announceMsg('Lab reset to pristine state.');
    mount(); // back to the mode selection screen
  }

  // ── Signature-based dirty checking (re-render only what changed) ────────────
  var SIGS = {};
  function sig(name, value) {
    var v;
    try { v = JSON.stringify(value); } catch (e) { v = String(Math.random()); }
    var changed = SIGS[name] !== v;
    SIGS[name] = v;
    return changed;
  }

  // ── Panel refresh with focus + scroll preservation ──────────────────────────
  function renderInto(slotId, html) {
    var slot = $(slotId);
    if (!slot) return;
    // preserve scroll positions of keyed scrollable descendants
    var scrolls = {};
    slot.querySelectorAll('[data-scroll]').forEach(function (el) {
      scrolls[el.getAttribute('data-scroll')] = el.scrollTop;
    });
    slot.innerHTML = html;
    Object.keys(scrolls).forEach(function (k) {
      var el = slot.querySelector('[data-scroll="' + k + '"]');
      if (el) el.scrollTop = scrolls[k];
    });
  }

  function refreshPanel(name, html) {
    var active = document.activeElement;
    var fid = active && active.closest && active.closest('[data-fid]')
      ? active.closest('[data-fid]').getAttribute('data-fid')
      : null;
    renderInto(name, html);
    if (fid) {
      var again = document.querySelector('[data-fid="' + fid.replace(/"/g, '\\"') + '"]');
      if (again && again.focus) again.focus();
    }
  }

  var PANEL_RENDERERS = {
    'station-casefile': function (s) { return renderCaseFile(s); },
    'station-desk': function (s) { return renderDesk(s); },
    'station-grid': function (s) { return renderGrid(s); },
    'station-records': function (s) { return renderRecords(s); },
    'station-missions': function (s) { return renderMissions(s); },
  };

  // ── Visibility (mobile single-panel ⇄ desktop 3-zone) ───────────────────────
  function applyVisibility() {
    var desk = DESKTOP.matches;
    var show = function (id, cond) {
      var el = $(id);
      if (el) el.style.display = cond ? '' : 'none';
    };
    show('station-casefile', desk || UISTATE.mobileTab === 'casefile');
    show('station-missions', desk || UISTATE.mobileTab === 'missions');
    show('station-desk', desk ? UISTATE.centerTab === 'desk' : UISTATE.mobileTab === 'desk');
    show('station-grid', desk ? UISTATE.centerTab === 'grid' : UISTATE.mobileTab === 'grid');
    show('station-records', desk ? UISTATE.centerTab === 'records' : UISTATE.mobileTab === 'records');
    show('mnav-slot', !desk);
    show('centertabs', desk);
    // Aim rings — the last station targeted keeps its highlight (as original)
    ['casefile', 'desk', 'grid', 'records', 'missions'].forEach(function (st) {
      var el = $('station-' + st);
      if (el) el.classList.toggle('ring-aim', UISTATE.aimedStation === st);
    });
  }

  // ── Dialog a11y (initial focus, Escape, focus trap) ─────────────────────────
  var dialogKeyHandler = null;
  function attachDialogKeys() {
    if (dialogKeyHandler) window.removeEventListener('keydown', dialogKeyHandler);
    dialogKeyHandler = null;
    var resetOpen = UISTATE.resetOpen;
    var completionOpen = isCompletionOpen();
    if (!resetOpen && !completionOpen) return;
    dialogKeyHandler = function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (resetOpen) { UISTATE.resetOpen = false; sync(); }
        else { UISTATE.dismissedFor = labStore.get().mode; UISTATE.forceReport = false; sync(); }
        return;
      }
      if (e.key !== 'Tab') return;
      var dlg = resetOpen
        ? document.querySelector('[role="alertdialog"]')
        : document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dlg) return;
      var focusables = dlg.querySelectorAll(resetOpen ? 'button, select, a[href]' : 'button, select, a[href], input');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', dialogKeyHandler);
  }

  function isCompletionOpen() {
    var s = labStore.get();
    var completed = Boolean(s && s.mode && s.completedModes && s.completedModes[s.mode]);
    return Boolean(s && s.mode) && ((completed && UISTATE.dismissedFor !== s.mode) || UISTATE.forceReport);
  }

  // ── Sync: reconcile the DOM with the store + UISTATE ────────────────────────
  function sync() {
    var s = labStore.get();
    if (!s || !s.mode) {
      // Mode selection screen — dialogs cannot exist here
      if (!$('app-shell')) mount();
      UISTATE.resetOpen = false;
      attachDialogKeys();
      return;
    }
    if (!$('app-shell')) { mount(); return; }

    // Header
    var mode = s.mode;
    var progress = progressOf(mode, s);
    var rating = ratingOf(mode, s);
    var quiz = quizScore(mode, s);
    if (sig('hdr', [mode, progress.done, progress.total, s.quizSubmitted && s.quizSubmitted[mode], rating.stars, Math.round(rating.pct * 100), quiz.correct])) {
      renderInto('hdr-slot', renderHeader(s));
    }
    // Mobile nav
    if (sig('mnav', [UISTATE.mobileTab, progress.done, progress.total])) {
      renderInto('mnav-slot', renderMobileNav(s));
    }

    // Case file
    var env = s.env;
    if (sig('casefile', [mode, env.intake, env.lifecycle, env.discipline, env.altitudes, env.hardening, env.response, env.h9Brief, env.h9Risks, UISTATE.briefingOpen])) {
      refreshPanel('station-casefile', renderCaseFile(s));
    }
    // Desk (openItem, clips, filing, hard feed sweep)
    if (sig('desk', [mode, env.openItem, env.clips, env.itemTags, env.h1Select, env.h1Tags])) {
      refreshPanel('station-desk', renderDesk(s));
    }
    // ShareGrid (its tab + every board + clips feed the Intake tab)
    if (sig('grid', [mode, UISTATE.gridTab, env.clips, env.typing, env.confidence, env.fpFlag, env.known, env.watch, env.techMap, env.telemetry, env.chain, env.timeline, env.evolve, env.dispatch, env.tlp, env.rule, env.logCalls])) {
      refreshPanel('station-grid', renderGrid(s));
    }
    // Records room (quiz answers/submission + active tab)
    if (sig('records', [mode, UISTATE.recordsTab, env, s.quizAnswers, s.quizSubmitted && s.quizSubmitted[mode]])) {
      refreshPanel('station-records', renderRecords(s));
    }
    // Mission board (objective stamps/hints/open card)
    if (sig('missions', [mode, UISTATE.missionsOpenId, s.objectives, UISTATE.failWhys])) {
      refreshPanel('station-missions', renderMissions(s));
    }

    // Completion dialog
    var completionOpen = isCompletionOpen();
    if (sig('completion', [completionOpen, mode])) {
      var mslot = $('modal-slot');
      var prevCompletion = mslot.querySelector('#completion-dialog');
      if (completionOpen) {
        var wrap = document.createElement('div');
        wrap.innerHTML = renderCompletion(s);
        var dlg = wrap.firstChild;
        // keep the reset dialog (if open) after the completion dialog
        mslot.insertBefore(dlg, mslot.firstChild);
        window.setTimeout(function () {
          var btn = dlg.querySelector('[data-fid="close-completion"]');
          if (btn) btn.focus();
        }, 30);
      } else if (prevCompletion) {
        prevCompletion.remove();
      }
    }
    // Reset dialog
    if (sig('reset', [UISTATE.resetOpen])) {
      var mslot2 = $('modal-slot');
      var prevReset = mslot2.querySelector('#reset-dialog');
      if (UISTATE.resetOpen) {
        var wrap2 = document.createElement('div');
        wrap2.innerHTML = renderResetDialog();
        var dlg2 = wrap2.firstChild;
        mslot2.appendChild(dlg2);
        window.setTimeout(function () {
          var btn = dlg2.querySelector('[data-fid="reset-cancel"]');
          if (btn) btn.focus();
        }, 30);
      } else if (prevReset) {
        prevReset.remove();
      }
    }

    applyVisibility();
    attachDialogKeys();
  }

  // ── Mount: build the whole screen for the current store state ───────────────
  function mount() {
    var s = labStore.get();
    var root = $('root');
    SIGS = {}; // full re-render — reset dirty tracking
    if (!s || !s.mode) {
      root.innerHTML = '<div id="mode-screen">' + renderModeSelect() + '</div>';
      attachDialogKeys();
      return;
    }
    var centerTabs = [
      ['desk', 'Evidence desk'],
      ['grid', 'ShareGrid platform'],
      ['records', 'Records room'],
    ]
      .map(function (t) {
        var on = UISTATE.centerTab === t[0];
        return (
          '<button type="button" role="tab" aria-selected="' + on + '" data-act="set-center-tab" data-val="' + t[0] + '"' +
          ' data-fid="ctab-' + t[0] + '" class="ctab ' + (on ? 'ctab-on' : '') + '">' + t[1] + '</button>'
        );
      })
      .join('');

    root.innerHTML =
      '<div class="lab-paper-bg app-shell" id="app-shell">' +
      '<div aria-live="polite" role="status" class="sr-only" id="announce-slot"></div>' +
      '<div id="hdr-slot"></div>' +
      '<div id="mnav-slot"></div>' +
      '<main class="main"><div class="workbench-grid">' +
      '<div class="station" id="station-casefile"></div>' +
      '<div class="station-center">' +
      '<div class="centertabs" id="centertabs" role="tablist" aria-label="Workbench">' + centerTabs + '</div>' +
      '<div class="station" id="station-desk"></div>' +
      '<div class="station" id="station-grid"></div>' +
      '<div class="station" id="station-records"></div>' +
      '</div>' +
      '<div class="station" id="station-missions"></div>' +
      '</div></main>' +
      '<div id="modal-slot"></div>' +
      '</div>';

    // First paint of every slot
    renderInto('hdr-slot', renderHeader(s));
    renderInto('mnav-slot', renderMobileNav(s));
    Object.keys(PANEL_RENDERERS).forEach(function (id) {
      renderInto(id, PANEL_RENDERERS[id](s));
    });

    // Completion dialog may open straight away on a finished, reloaded save
    if (isCompletionOpen()) {
      var wrap = document.createElement('div');
      wrap.innerHTML = renderCompletion(s);
      var dlg = wrap.firstChild;
      $('modal-slot').appendChild(dlg);
      window.setTimeout(function () {
        var btn = dlg.querySelector('[data-fid="close-completion"]');
        if (btn) btn.focus();
      }, 30);
    }
    if (UISTATE.resetOpen) {
      var wrap2 = document.createElement('div');
      wrap2.innerHTML = renderResetDialog();
      $('modal-slot').appendChild(wrap2.firstChild);
    }

    applyVisibility();
    attachDialogKeys();
  }

  // ── Store subscription ──────────────────────────────────────────────────────
  labStore.subscribe(function () {
    checkCompletion(labStore.get());
    sync();
  });

  // Re-apply visibility when crossing the desktop breakpoint
  if (DESKTOP.addEventListener) {
    DESKTOP.addEventListener('change', function () { applyVisibility(); });
  } else {
    DESKTOP.addListener(function () { applyVisibility(); });
  }

  // ── Event delegation ────────────────────────────────────────────────────────
  function target(e) {
    var t = e.target;
    if (!t || !t.closest) return null;
    var el = t.closest('[data-act]');
    return el && !el.disabled ? el : null;
  }

  document.addEventListener('click', function (e) {
    // R7: click-outside closes the completion report (backdrop only — never the card)
    if (e.target instanceof Element && e.target.id === 'completion-dialog') {
      UISTATE.dismissedFor = labStore.get().mode;
      UISTATE.forceReport = false;
      sync();
      return;
    }
    var el = target(e);
    if (!el) return;
    var act = el.getAttribute('data-act');
    var id = el.getAttribute('data-id');
    var key = el.getAttribute('data-key');
    var val = el.getAttribute('data-val');
    var s = labStore.get();

    switch (act) {
      case 'start-mode': {
        UISTATE.completionFired = false;
        UISTATE.forceReport = false;
        labStore.set(function (st) { return { ...st, mode: val }; });
        UISTATE.centerTab = 'desk';
        UISTATE.mobileTab = 'desk';
        UISTATE.missionsOpenId = null;
        mount();
        break;
      }
      case 'switch-mode': {
        UISTATE.completionFired = false;
        UISTATE.forceReport = false;
        labStore.set(function (st) { return { ...st, mode: val }; });
        UISTATE.missionsOpenId = null; // mission board remounts per mode (as original key={mode})
        break;
      }
      case 'open-completion':
        // B1: the header button always opens the report (progress state) — never a silent no-op
        UISTATE.forceReport = true;
        sync();
        break;
      case 'close-completion':
        UISTATE.dismissedFor = s.mode;
        UISTATE.forceReport = false;
        sync();
        break;
      case 'open-reset':
        UISTATE.resetOpen = true;
        sync();
        break;
      case 'reset-cancel':
        UISTATE.resetOpen = false;
        sync();
        break;
      case 'reset-confirm':
        UISTATE.resetOpen = false;
        UISTATE.forceReport = false;
        doReset();
        break;
      case 'aim-next': {
        if (s.mode !== 'medium') break;
        var list = objectivesForMode('medium');
        var next = list.find(function (o) { return !(s.objectives[o.id] && s.objectives[o.id].done); });
        if (next) focusStation(next.station);
        break;
      }
      case 'aim': {
        var o = objectivesForMode(s.mode).filter(function (x) { return x.id === id; })[0];
        if (o) focusStation(o.station);
        break;
      }
      case 'check': {
        var oc = objectivesForMode(s.mode).filter(function (x) { return x.id === id; })[0];
        if (oc) onCheck(oc);
        break;
      }
      case 'hint': {
        var oh = objectivesForMode(s.mode).filter(function (x) { return x.id === id; })[0];
        if (oh) onHint(oh);
        break;
      }
      case 'toggle-open':
        UISTATE.missionsOpenId = UISTATE.missionsOpenId === id ? null : id;
        sync();
        break;
      case 'toggle-briefing':
        UISTATE.briefingOpen = !UISTATE.briefingOpen;
        sync();
        break;
      case 'set-center-tab':
        UISTATE.centerTab = val;
        sync();
        break;
      case 'set-mobile-tab':
        UISTATE.mobileTab = val;
        sync();
        break;
      case 'set-grid-tab':
        UISTATE.gridTab = val;
        sync();
        break;
      case 'set-records-tab':
        UISTATE.recordsTab = val;
        sync();
        break;
      case 'set-open-item':
        setOpenItem(val);
        break;
      case 'set-map':
        // chips that assign a value (intake classes, altitudes, known/new)
        // B1 toggle round-trip: clicking the active chip un-sets it (back to blank)
        if (key && id != null && val) {
          var cur = s.env[key] ? s.env[key][id] : undefined;
          setMap(key, id, cur === val ? '' : val);
        }
        break;
      case 'clip':
        doClip(id);
        break;
      case 'remove-clip':
        toggleArr('clips', id);
        break;
      case 'toggle-arr':
        toggleArr(key, id);
        break;
      case 'push-seq': {
        var before = s.env[key].length;
        pushSeq(key, id);
        if (key === 'chain') {
          var idx = BEHAVIORS.findIndex(function (x) { return x.id === id; }) + 1;
          announceMsg('Behavior b' + idx + ' placed at chain position ' + (before + 1));
        } else {
          announceMsg(seqLabel(key, id) + ' placed at position ' + (before + 1));
        }
        break;
      }
      case 'pull-seq':
        pullSeq(key, id);
        break;
      case 'log-noise':
        // "noise" is the absence of the true-positive call — click only removes
        if (s.env.logCalls.indexOf(id) !== -1) toggleArr('logCalls', id);
        break;
      case 'quiz-submit': {
        labStore.set(function (st) {
          var qs = { ...(st.quizSubmitted || {}) };
          qs[st.mode] = true;
          return { ...st, quizSubmitted: qs };
        });
        var q = quizScore(s.mode, labStore.get());
        announceMsg('Quiz submitted: ' + q.correct + ' of ' + q.total + ' correct.');
        break;
      }
      default:
        break;
    }
  });

  document.addEventListener('change', function (e) {
    var el = target(e);
    if (!el) return;
    var act = el.getAttribute('data-act');
    var id = el.getAttribute('data-id');
    var key = el.getAttribute('data-key');
    var val = el.value;

    switch (act) {
      case 'set-map':
        if (key && id != null) setMap(key, id, val);
        break;
      case 'set-brief':
        labStore.set(function (s) { return { ...s, env: { ...s.env, h9Brief: el.getAttribute('data-val') || val } }; });
        break;
      case 'set-rule':
        setRule(parseInt(el.getAttribute('data-row'), 10), el.getAttribute('data-part'), val);
        break;
      case 'quiz-answer': {
        var s = labStore.get();
        if (s.quizSubmitted && s.quizSubmitted[s.mode]) break; // submitted quizzes are locked
        var idx = parseInt(val, 10);
        labStore.set(function (st) {
          var qa = { ...st.quizAnswers };
          qa[id] = idx;
          return { ...st, quizAnswers: qa };
        });
        break;
      }
      default:
        break;
    }
  });

  // ── Boot ────────────────────────────────────────────────────────────────────
  mount();
})();
