// ─────────────────────────────────────────────────────────────────────────────
// THE SWITCH YARD — js/state.js
// State store + persistence + tiny pub/sub.
// Ported 1:1 from the framework lab's Lab.tsx state layer:
//  - SAME localStorage key (cv0004-l52-switchyard-v2)
//  - SAME save/restore semantics (autosave on every change, migrate-on-load,
//    resume on the YARD tab, confirmed RESET to pristine mode select)
//  - SAME immutable-update pattern (structuredClone, then mutate the clone)
// ─────────────────────────────────────────────────────────────────────────────
(function (LAB) {
  'use strict';

  // v2: rebuilt quiz banks (audit pass) — same key as the framework lab.
  LAB.STORAGE_KEY = 'cv0004-l52-switchyard-v2';

  LAB.TABS = [
    { id: 'briefing', label: 'BRIEFING' },
    { id: 'rulebook', label: 'RULEBOOK' },
    { id: 'yard', label: 'YARD' },
    { id: 'exam', label: 'EXAM' },
    { id: 'safety', label: 'SAFETY REVIEW' }
  ];

  LAB.freshState = function (mode) {
    return {
      mode: mode,
      startedAt: 'shift-start',
      repo: LAB.seedRepo(mode),
      objProgress: {},
      quiz: { answers: {}, submitted: {} },
      registryAnswers: {},
      forms: {},
      visitedTabs: ['briefing'],
      completed: false
    };
  };

  var listeners = [];

  LAB.store = {
    st: null, // LabState | null (null = mode-select screen)
    tab: 'briefing',

    // UI-local (non-persisted) state — mirrors the framework's component-local
    // useState values, including their reset-on-unmount behavior.
    ui: {
      center: 'workbench',      // YARD center tab: workbench | map | history
      desk: 'switch',           // YARD desk tab: switch | governance | detect
      wbSelected: 'infra/main.tf',
      wbDraft: null,            // editor draft (null = clean)
      wbMsg: '',                // commit message input
      branchName: '',
      tagName: '',
      mergeSel: '',
      scanPattern: '',          // hard-mode scanner radio
      examView: 0               // exam stepper index (component-local in the original)
    },

    subscribe: function (fn) { listeners.push(fn); },

    notify: function () {
      listeners.forEach(function (fn) { fn(); });
    },

    // React equivalent of `setSt(prev => next)` — clone, mutate, persist, notify.
    update: function (mutator) {
      if (!this.st) return;
      var next = structuredClone(this.st);
      mutator(next);
      this.st = next;
      try { window.localStorage.setItem(LAB.STORAGE_KEY, JSON.stringify(this.st)); } catch (e) { /* degraded: no persistence */ }
      this.notify();
    },

    // Apply a repo action (the framework's `act`): clone state, swap in the new repo.
    act: function (fn) {
      this.update(function (next) {
        next.repo = fn(next.repo);
      });
    },

    setTab: function (t) {
      this.tab = t;
      if (this.st && !this.st.visitedTabs.includes(t)) {
        this.update(function (next) { next.visitedTabs.push(t); });
      } else {
        this.notify();
      }
    },

    // Load persisted progress (migrate stale shapes exactly like the original).
    load: function () {
      try {
        var raw = window.localStorage.getItem(LAB.STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && parsed.mode && parsed.repo && parsed.repo.branches) {
            var fresh = LAB.freshState(parsed.mode);
            var migrated = Object.assign({}, fresh, parsed);
            migrated.quiz = Object.assign({}, fresh.quiz, parsed.quiz);
            migrated.repo = Object.assign({}, fresh.repo, parsed.repo, {
              protections: Object.assign({}, fresh.repo.protections, parsed.repo.protections)
            });
            this.st = migrated;
            this.tab = 'yard';
            return true;
          }
        }
      } catch (e) { /* degraded: no persistence */ }
      return false;
    },

    startMode: function (mode) {
      this.st = LAB.freshState(mode);
      this.tab = 'briefing';
      this.resetUi();
      try { window.localStorage.setItem(LAB.STORAGE_KEY, JSON.stringify(this.st)); } catch (e) { /* ignore */ }
      this.notify();
    },

    // RESET: wipe storage, back to the pristine mode select.
    reset: function () {
      try { window.localStorage.removeItem(LAB.STORAGE_KEY); } catch (e) { /* ignore */ }
      this.st = null;
      this.tab = 'briefing';
      this.resetUi();
      this.notify();
    },

    // Component-local state resets (the framework re-mounts these components on
    // tab switches, so their useState seeds are restored on entry).
    resetUi: function () {
      var ui = this.ui;
      ui.center = 'workbench';
      ui.desk = 'switch';
      ui.wbSelected = 'infra/main.tf';
      ui.wbDraft = null;
      ui.wbMsg = '';
      ui.branchName = '';
      ui.tagName = '';
      ui.mergeSel = '';
      ui.scanPattern = '';
      ui.examView = 0;
    },

    onEnterTab: function (tab) {
      var ui = this.ui;
      if (tab === 'yard') {
        ui.center = 'workbench';
        ui.desk = 'switch';
        ui.wbSelected = 'infra/main.tf';
        ui.wbDraft = null;
        ui.wbMsg = '';
        ui.branchName = '';
        ui.tagName = '';
        ui.mergeSel = '';
        ui.scanPattern = (this.st && this.st.repo.scannerPattern) || '';
      } else if (tab === 'exam') {
        ui.examView = 0;
      }
    }
  };

  // ── derived score (ported 1:1 from Lab.tsx useMemo) ─────────────────────────
  LAB.scoreOf = function (st) {
    if (!st || !st.mode) return { pct: 0, stars: 0, objDone: 0, objTotal: 0, quizCorrect: 0, quizTotal: 0 };
    var objs = st.mode === 'medium' ? LAB.OBJECTIVES_MEDIUM : LAB.OBJECTIVES_HARD;
    var quizItems = st.mode === 'medium' ? LAB.QUIZ_MEDIUM : LAB.QUIZ_HARD;
    var objDone = objs.filter(function (o) { return st.objProgress[o.id] && st.objProgress[o.id].done; }).length;
    var starSum = objs.reduce(function (acc, o) {
      var p = st.objProgress[o.id];
      return acc + (p && p.done ? (p.stars || 0) / 3 : 0);
    }, 0);
    var objRatio = starSum / objs.length;
    var quizCorrect = quizItems.filter(function (q) { return st.quiz.submitted[q.id] && st.quiz.answers[q.id] === q.answer; }).length;
    var quizRatio = quizItems.length ? quizCorrect / quizItems.length : 0;
    var pct = Math.round(objRatio * 70 + quizRatio * 30);
    var stars = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1;
    return { pct: pct, stars: stars, objDone: objDone, objTotal: objs.length, quizCorrect: quizCorrect, quizTotal: quizItems.length };
  };

  // ensure() — the framework's objective progress seeder.
  LAB.ensure = function (s, id) {
    if (!s.objProgress[id]) s.objProgress[id] = { done: false, attempts: 0, hintsUsed: 0, stars: 0 };
    return s.objProgress[id];
  };
})(window.LAB = window.LAB || {});
