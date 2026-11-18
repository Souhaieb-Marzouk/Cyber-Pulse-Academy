// ─── The Registry — js/app.js ─────────────────────────────────────────────
// Bootstrap, top-level event wiring and the app shell (mode selection,
// header rail, authority spectrum, tab strip, dialogs, completion modal,
// floating chip). Carried over 1:1 from the framework lab
// (src/components/govlab/GovernanceLab.tsx).

(function () {
  'use strict';

  var esc = UI.esc;
  var icon = UI.icon;
  var DATA = window.LAB_DATA;
  var TYPE_ORDER = ['policy', 'standard', 'procedure', 'guideline'];

  // Top-level ephemeral UI state (React useState of the original shell).
  var UI_STATE = {
    spectrumOpen: null,   // DocType | null
    resetOpen: false,     // reset confirm dialog
    modalOpen: false,     // completion modal
  };

  // ── Rendering with focus restoration ─────────────────────────────────────
  // A full re-render must not strand keyboard users: remember the focused
  // element's data-fid and restore it after the DOM is replaced.
  function renderPreservingFocus(root, build) {
    var active = document.activeElement;
    var fid = active && active.getAttribute ? active.getAttribute('data-fid') : null;
    root.innerHTML = build();
    if (fid) {
      var el = root.querySelector('[data-fid="' + fid.replace(/"/g, '\\"') + '"]');
      if (el) {
        try { el.focus(); } catch (e) { /* not focusable anymore — fine */ }
      }
    }
  }

  // ── Shared computations ──────────────────────────────────────────────────
  function computeProgress(state) {
    var objectives = objectivesForMode(state.mode);
    var quizItems = state.mode === 'hard' ? DATA.QUIZ_HARD : DATA.QUIZ_MEDIUM;
    var solvedCount = objectives.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].solved; }).length;
    var quizLocked = Object.keys(state.quiz).length;
    var total = objectives.length;
    var pct = Math.round(((solvedCount + quizLocked) / (total + quizItems.length)) * 100);
    return { objectives: objectives, quizItems: quizItems, solvedCount: solvedCount, quizLocked: quizLocked, total: total, pct: pct };
  }

  // ── Mode selection screen ────────────────────────────────────────────────
  function modeSelectHtml() {
    var h = '<div class="screen mode-screen">';
    h += '<div class="mode-container">';
    h += '<header class="mode-header">';
    h += '<p class="eyebrow eyebrow-lg">CompTIA Security+ · SY0-801 · 5.1</p>';
    h += '<h1 class="mode-title">THE REGISTRY</h1>';
    h += '<p class="mode-subtitle">A governance practice lab — apply policies, standards, procedures &amp; security guidance</p>';
    h += '<p class="mode-blurb">Meridian Freight &amp; Logistics lost an argument with an auditor last quarter. You have been hired as the governance clerk. Everything you need is in the filing room — if you can cite it.</p>';
    h += '<p class="mode-training">Training simulation · synthetic data</p>';
    h += '</header>';
    h += '<div class="mode-cards">';
    h += '<button type="button" onclick="App.startMode(\'medium\')" class="mode-card mode-card-green">';
    h += '<span class="mode-stamp mode-stamp-green">Apprentice Clerk</span>';
    h += '<h2 class="mode-card-title">Medium — learn &amp; understand</h2>';
    h += '<ul class="mode-list"><li>• 12 guided objectives, in order, with context</li><li>• 3-tier hints, tolerant validation, teaching feedback</li><li>• Concept quiz · star rating · full explanations</li></ul>';
    h += '<p class="mode-best">Best for: first contact with governance documents.</p>';
    h += '</button>';
    h += '<button type="button" onclick="App.startMode(\'hard\')" class="mode-card mode-card-red">';
    h += '<span class="mode-stamp mode-stamp-red">Chief Auditor</span>';
    h += '<h2 class="mode-card-title">Hard — test &amp; stretch</h2>';
    h += '<ul class="mode-list"><li>• 9 broad challenges over noisy evidence</li><li>• 6-ticket storm, one red herring, 3 planted defects</li><li>• Strict validation · 1 nudge for the whole lab · it costs score</li></ul>';
    h += '<p class="mode-best">Best for: exam rehearsal under pressure.</p>';
    h += '</button>';
    h += '</div>';
    h += '<p class="mode-foot">Progress auto-saves in your browser. You can reset everything at any time.</p>';
    h += '</div></div>';
    return h;
  }

  // ── Header rail + tab strip ──────────────────────────────────────────────
  function tabsHtml(state, prog) {
    var docketCount = Object.values(state.dockets).filter(function (d) { return d.attempts; }).length;
    var auditCount = Object.values(state.auditChecks).filter(Boolean).length;
    var TABS = [
      { id: 'briefing', label: 'Briefing' },
      { id: 'registry', label: 'Registry' },
      { id: 'docket', label: 'Docket', count: String(docketCount) },
      { id: 'audit', label: 'Audit Desk', count: auditCount + '/8' },
      { id: 'objectives', label: 'Objectives', count: prog.solvedCount + '/' + prog.total },
      { id: 'quiz', label: 'Quiz', count: prog.quizLocked + '/' + prog.quizItems.length },
      { id: 'debrief', label: 'Debrief' },
    ];
    var h = '<nav aria-label="Registry desk sections" class="tab-strip"><div class="tab-strip-inner">';
    TABS.forEach(function (t) {
      var active = state.tab === t.id;
      h +=
        '<button type="button" onclick="App.setTab(\'' + t.id + '\')"' +
        (active ? ' aria-current="page"' : '') +
        ' class="tab' + (active ? ' tab-active' : '') + '">' +
        esc(t.label) +
        (t.count ? '<span class="tab-count">' + esc(t.count) + '</span>' : '') +
        '</button>';
    });
    h += '</div></nav>';
    return h;
  }

  function spectrumHtml(state) {
    var h = '<div>';
    h += '<div role="group" aria-label="Authority spectrum — the four document classes" class="spectrum-row">';
    TYPE_ORDER.forEach(function (t, i) {
      var info = DATA.DOC_TYPE_INFO[t];
      var open = UI_STATE.spectrumOpen === t;
      h += '<span class="spectrum-item">';
      h +=
        '<button type="button" onclick="App.toggleSpectrum(\'' + t + '\')" aria-expanded="' + (open ? 'true' : 'false') + '"' +
        ' class="spectrum-chip ' + (t === 'guideline' ? 'spectrum-chip-gold' : 'spectrum-chip-green') + '">' +
        esc(info.label) + '<span class="spectrum-says">' + esc(info.says) + '</span></button>';
      if (i < TYPE_ORDER.length - 1) h += '<span class="spectrum-arrow" aria-hidden="true">→</span>';
      h += '</span>';
    });
    h += '</div>';
    if (UI_STATE.spectrumOpen) {
      var info = DATA.DOC_TYPE_INFO[UI_STATE.spectrumOpen];
      h += '<p class="spectrum-blurb"><strong>' + esc(info.label) + ' — ' + esc(info.authority) + '.</strong> ' +
        esc(info.blurb) + ' Typical verbs: ' + esc(info.verbs) + '.</p>';
    }
    h += '</div>';
    return h;
  }

  // ── Completion math (score / stars / focus areas) ────────────────────────
  function completion(state) {
    var prog = computeProgress(state);
    var mode = state.mode;
    var objectives = prog.objectives;
    var quizItems = prog.quizItems;

    var hintsUsed = objectives.reduce(function (acc, o) {
      return acc + ((state.objectives[o.id] && state.objectives[o.id].hints) || 0);
    }, 0);
    var retried = objectives.filter(function (o) {
      var s = state.objectives[o.id];
      return s && s.solved && (s.attempts || 0) > 0;
    }).length;
    var quizWrong = quizItems.filter(function (q) {
      return state.quiz[q.id] !== undefined && state.quiz[q.id] !== String(q.answer);
    }).length;
    var score = Math.max(
      0,
      mode === 'medium'
        ? 100 - hintsUsed * 4 - retried * 6 - quizWrong * 2
        : 100 - hintsUsed * 8 - retried * 5 - quizWrong * 3
    );
    var stars = score >= 95 ? 5 : score >= 85 ? 4 : score >= 70 ? 3 : score >= 55 ? 2 : 1;

    var byPillar = ['Understand', 'Recognize', 'Apply', 'Detect', 'Decide'].map(function (p) {
      return {
        pillar: p,
        objectives: objectives.filter(function (o) { return o.pillar === p; }),
      };
    });

    // R8: focus areas derived from ACTUAL performance evidence — never generic.
    var focusAreas = [];
    quizItems.forEach(function (q) {
      if (state.quiz[q.id] !== undefined && state.quiz[q.id] !== String(q.answer)) {
        focusAreas.push({ topic: q.topic, detail: 'quiz miss — re-read ' + q.ref });
      }
    });
    objectives.forEach(function (o) {
      var s = state.objectives[o.id];
      if (s && (s.attempts || 0) > 0) {
        focusAreas.push({
          topic: o.topic,
          detail: 'took ' + s.attempts + ' check' + (s.attempts > 1 ? 's' : '') + ' to pass — revisit ' + (o.whereToLook || 'the Registry desk'),
        });
      }
    });
    objectives.forEach(function (o) {
      var s = state.objectives[o.id];
      if (s && (s.hints || 0) > 0 && !(s.attempts)) {
        focusAreas.push({ topic: o.topic, detail: 'needed a hint — revisit ' + (o.whereToLook || 'the Registry desk') });
      }
    });

    return {
      prog: prog, hintsUsed: hintsUsed, retried: retried, quizWrong: quizWrong,
      score: score, stars: stars, byPillar: byPillar, focusAreas: focusAreas,
    };
  }

  // ── Completion modal (C7) ────────────────────────────────────────────────
  function completionModalHtml(state) {
    var c = completion(state);
    var mode = state.mode;
    var h = '<div class="overlay" role="dialog" aria-modal="true" aria-label="Lab completion report" onmousedown="App.overlayDown(event, \'modal\')">';
    h += '<div class="modal modal-green">';
    h += '<div class="flex-between-start">';
    h += '<div><p class="eyebrow">Meridian Freight &amp; Logistics</p><h2 class="modal-title">Final report — filed &amp; stamped</h2></div>';
    h += '<button type="button" onclick="App.setModalOpen(false)" aria-label="Close final report" class="icon-btn">' + icon('x', 'icon-md') + '</button>';
    h += '</div>';
    h += '<p class="modal-sub">You walked in as a clerk; you leave able to answer the auditor’s question: <em>“which document governs this?”</em></p>';
    h += '<div class="score-box">';
    h += '<div><div class="stars" aria-label="' + c.stars + ' of 5 stars">';
    for (var s = 1; s <= 5; s++) {
      h += icon('star', 'star-icon' + (s <= c.stars ? ' star-filled' : ''));
    }
    h += '</div>';
    h += '<p class="score-formula">' + (mode === 'medium' ? 'hints −4 · retries −6 · quiz miss −2' : 'nudge −8 · retries −5 · quiz miss −3') + '</p></div>';
    h += '<div class="score-right"><div class="score-value">' + c.score + '</div><div class="score-label">final score</div></div>';
    h += '</div>';
    h += '<dl class="stat-grid">';
    h += '<div class="stat-cell"><dt>Objectives</dt><dd>' + c.prog.solvedCount + '/' + c.prog.total + '</dd></div>';
    h += '<div class="stat-cell"><dt>Hints used</dt><dd>' + c.hintsUsed + '</dd></div>';
    h += '<div class="stat-cell"><dt>Quiz misses</dt><dd>' + c.quizWrong + '/' + c.prog.quizItems.length + '</dd></div>';
    h += '</dl>';
    h += '<h3 class="modal-h3">Mastery recap by pillar</h3>';
    h += '<div class="stack-1-5">';
    c.byPillar.forEach(function (g) {
      if (g.objectives.length === 0) return;
      h += '<div class="pillar-recap">' + UI.pillarBadge(g.pillar) +
        '<span class="pillar-ids">' + icon('check-circle-2', 'icon-xs icon-green') + ' ' +
        esc(g.objectives.map(function (o) { return o.id.replace('OBJ-', ''); }).join(', ')) + '</span></div>';
    });
    h += '</div>';
    h += '<h3 class="modal-h3">Focus areas for your next pass</h3>';
    if (c.focusAreas.length > 0) {
      h += '<ul class="stack-1-5 list-plain">';
      c.focusAreas.forEach(function (f) {
        h += '<li class="focus-area"><strong class="focus-topic">' + esc(f.topic) + '</strong> — ' + esc(f.detail) + '</li>';
      });
      h += '</ul>';
    } else {
      h += '<p class="focus-clean">Clean first-pass run — no retries, no hints, no quiz misses recorded. Reinforce it by re-running the other mode.</p>';
    }
    h += '<h3 class="modal-h3">Where to go next</h3>';
    h += '<ul class="next-steps">';
    h += '<li>• <strong>5.2</strong> — security risk management processes and concepts</li>';
    h += '<li>• <strong>5.3</strong> — third-party risk management</li>';
    h += '<li>• <strong>5.4</strong> — compliance &amp; privacy considerations</li>';
    h += '<li>• <strong>5.5</strong> — audits &amp; assessments (you have already practiced the audit reflex)</li>';
    h += '<li>• Re-run the other mode — the Registry looks different from the auditor’s chair.</li>';
    h += '</ul>';
    h += '<div class="flex-end-wrap mt-4">';
    h += '<button type="button" onclick="App.readFieldNotes()" class="btn btn-outline-green">Read the field notes</button>';
    h += '<button type="button" onclick="App.setModalOpen(false)" class="btn btn-green">Close</button>';
    h += '</div>';
    h += '</div></div>';
    return h;
  }

  // ── Reset dialog ─────────────────────────────────────────────────────────
  function resetDialogHtml() {
    var h = '<div class="overlay" role="dialog" aria-modal="true" aria-label="Confirm reset" onmousedown="App.overlayDown(event, \'reset\')">';
    h += '<div class="modal modal-red">';
    h += '<div class="flex-between-start">';
    h += '<h2 class="modal-title-sm">Purge all records?</h2>';
    h += '<button type="button" onclick="App.setResetOpen(false)" aria-label="Close reset dialog" class="icon-btn">' + icon('x', 'icon-md') + '</button>';
    h += '</div>';
    h += '<p class="modal-sub">This erases your mode, every objective, docket stamp, audit check and quiz answer — the registry returns to its pristine 2026 state.</p>';
    h += '<div class="flex-end mt-3">';
    h += '<button type="button" onclick="App.setResetOpen(false)" class="btn btn-ghost">Keep my records</button>';
    h += '<button type="button" onclick="App.confirmReset()" class="btn btn-red">Purge &amp; reset</button>';
    h += '</div>';
    h += '</div></div>';
    return h;
  }

  // ── Lab shell ────────────────────────────────────────────────────────────
  function labHtml(state) {
    var mode = state.mode;
    var prog = computeProgress(state);
    var canFile = prog.solvedCount === prog.total && prog.quizLocked === prog.quizItems.length;

    var h = '<div class="screen lab-screen">';
    // Top rail
    h += '<header class="top-rail"><div class="rail-inner">';
    h += '<div class="rail-row">';
    h += '<div class="rail-title">';
    h += '<p class="eyebrow">CompTIA Security+ SY0-801 · Objective 5.1 · ' + (mode === 'medium' ? 'Apprentice Clerk' : 'Chief Auditor') + '</p>';
    h += '<h1 class="lab-title">The Registry</h1>';
    h += '</div>';
    h += '<div class="rail-side">';
    h += '<div class="rail-progress">';
    h += '<div class="progress-text" aria-live="polite">' + prog.solvedCount + '/' + prog.total + ' objectives · quiz ' + prog.quizLocked + '/' + prog.quizItems.length + '</div>';
    h += '<div class="progressbar" role="progressbar" aria-valuenow="' + prog.pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Overall lab progress"><div class="progressbar-fill" style="width:' + prog.pct + '%"></div></div>';
    h += '</div>';
    h += '<button type="button" onclick="App.setResetOpen(true)" class="btn btn-outline-red btn-reset">' + icon('refresh-cw', 'icon-sm') + ' Reset</button>';
    h += '</div>';
    h += '</div>';
    h += spectrumHtml(state);
    h += '</div>';
    h += tabsHtml(state, prog);
    h += '</header>';

    // Content
    h += '<main class="lab-main">';
    if (state.tab === 'briefing') h += PANELS.briefing(mode);
    else if (state.tab === 'registry') h += PANELS.registry(state);
    else if (state.tab === 'docket') h += PANELS.docket(mode, state);
    else if (state.tab === 'audit') h += PANELS.audit(state);
    else if (state.tab === 'objectives') h += PANELS.objectives(state, canFile);
    else if (state.tab === 'quiz') h += PANELS.quiz(state);
    else if (state.tab === 'debrief') h += PANELS.debrief();

    if (canFile && !state.completed) {
      h += '<p class="file-banner">Everything is stamped and the quiz is done — go to the Objectives ledger and file your final report.</p>';
    }
    h += '</main>';

    // Reset dialog
    if (UI_STATE.resetOpen) h += resetDialogHtml();
    // Completion modal
    if (UI_STATE.modalOpen && state.completed) h += completionModalHtml(state);
    // In-lab completion hint chip
    if (state.completed && !UI_STATE.modalOpen) {
      var stars = completion(state).stars;
      h += '<button type="button" onclick="App.setModalOpen(true)" class="report-chip">' +
        icon('circle-dashed', 'icon-sm') + ' Final report (' + stars + '★)</button>';
    }
    h += '</div>';
    return h;
  }

  // ── Root render ──────────────────────────────────────────────────────────
  var root = null;
  function render() {
    var state = LabStore.getState();
    renderPreservingFocus(root, function () {
      return state ? labHtml(state) : modeSelectHtml();
    });
  }

  // ── Public handlers (wired from the HTML) ────────────────────────────────
  window.App = {
    // Mode selection
    startMode: function (mode) {
      UI_STATE.spectrumOpen = null;
      UI_STATE.resetOpen = false;
      UI_STATE.modalOpen = false;
      resetPanelUi();
      LabStore.startMode(mode);
    },

    // Tabs (leaving a tab discards its ephemeral state, like unmounting did)
    setTab: function (tab) {
      LabStore.patch(function (d) { d.tab = tab; });
    },

    // Authority spectrum
    toggleSpectrum: function (t) {
      UI_STATE.spectrumOpen = UI_STATE.spectrumOpen === t ? null : t;
      render();
    },

    // Registry desk
    openRegistryDoc: function (code) {
      LabStore.patch(function (d) {
        d.openDoc = code;
        d.tab = 'registry';
      });
    },
    setRegistryQuery: function (v) {
      PANEL_UI.registryQuery = v;
      // Targeted update: only the filtered list re-renders; the input keeps
      // focus and the caret position (same UX as the controlled React input).
      var list = document.getElementById('registry-index-list');
      if (list) list.innerHTML = PANELS.registryListHtml(LabStore.getState());
    },
    toggleGlossary: function () {
      PANEL_UI.registryGlossaryOpen = !PANEL_UI.registryGlossaryOpen;
      render();
    },

    // Docket desk
    setDocketActive: function (id) {
      PANEL_UI.docketActiveId = id;
      render();
    },
    setDocketCite: function (id, v) {
      LabStore.patch(function (d) {
        var rec = d.dockets[id] || { attempts: 0 };
        d.dockets[id] = Object.assign({}, rec, { cited: v || undefined });
      });
    },
    setDocketStamp: function (id, v) {
      LabStore.patch(function (d) {
        var rec = d.dockets[id] || { attempts: 0 };
        var next = Object.assign({}, rec, { stamp: v });
        if (v === 'none') next.cited = undefined;
        d.dockets[id] = next;
      });
    },
    fileDocket: function (id) {
      // R2: filing locks the chosen answer.
      LabStore.patch(function (d) {
        var rec = d.dockets[id] || { attempts: 0 };
        d.dockets[id] = Object.assign({}, rec, { attempts: rec.attempts + 1, filed: true });
      });
    },
    clearDocketRetry: function (id) {
      LabStore.patch(function (d) {
        var rec = d.dockets[id];
        if (!rec) return;
        // R2-compliant retry: the checked answer is discarded wholesale, never edited.
        d.dockets[id] = Object.assign({}, rec, { cited: undefined, stamp: undefined, filed: false });
      });
    },

    // Audit desk
    toggleAudit: function (id) {
      LabStore.patch(function (d) {
        d.auditChecks[id] = !d.auditChecks[id];
      });
    },
    setMisfile: function (v) {
      LabStore.patch(function (d) { d.misfileAnswer = v; });
    },

    // Objective exercises
    setMatch: function (key, item, v) {
      LabStore.patch(function (d) {
        d.matchings[key] = Object.assign({}, d.matchings[key] || {}, (function () { var o = {}; o[item] = v; return o; })());
      });
    },
    moveOrder: function (key, idx, dir) {
      LabStore.patch(function (d) {
        var next = (d.orders[key] || []).slice();
        var j = idx + dir;
        if (j < 0 || j >= next.length) return;
        var tmp = next[idx];
        next[idx] = next[j];
        next[j] = tmp;
        d.orders[key] = next;
      });
    },
    toggleSequence: function (key, id) {
      LabStore.patch(function (d) {
        var seq = d.orders[key] || [];
        d.orders[key] = seq.indexOf(id) !== -1 ? seq.filter(function (x) { return x !== id; }) : seq.concat([id]);
      });
    },
    setException: function (field, value) {
      LabStore.patch(function (d) {
        d.h3[field] = value;
        if (field === 'stamp') d.h3.step = Math.max(d.h3.step, 2);
        if (field === 'cited') d.h3.step = Math.max(d.h3.step, 3);
        if (field === 'approver') d.h3.step = Math.max(d.h3.step, 4);
      });
    },
    resetExceptionSequence: function () {
      LabStore.patch(function (d) { d.h3 = { step: 1 }; });
    },

    // Objectives ledger
    checkObjective: function (id) {
      var state = LabStore.getState();
      var obj = objectivesForMode(state.mode).filter(function (o) { return o.id === id; })[0];
      if (!obj) return;
      var result = obj.check(state);
      PANEL_UI.objFeedback[id] = result;
      LabStore.patch(function (d) {
        var o = d.objectives[id] || { solved: false, attempts: 0, hints: 0 };
        if (result.pass) {
          o.solved = true;
          o.locked = true; // R2: validated answer locks
        } else {
          o.attempts += 1;
          if (LOCKING_OBJECTIVES.has(id)) o.locked = true; // R2: checked answer locks; Clear & retry re-opens
        }
        d.objectives[id] = o;
      });
    },
    clearRetryObjective: function (id) {
      // R2-compliant retry: the checked answer is discarded wholesale, never edited in place.
      LabStore.patch(function (d) {
        PANELS.resetAnswersIn(d, id);
        var o = d.objectives[id];
        if (o) o.locked = false;
      });
      delete PANEL_UI.objFeedback[id];
      render();
    },
    revealHint: function (id) {
      var state = LabStore.getState();
      var obj = objectivesForMode(state.mode).filter(function (o) { return o.id === id; })[0];
      if (!obj) return;
      LabStore.patch(function (d) {
        var o = d.objectives[id] || { solved: false, attempts: 0, hints: 0 };
        if (o.hints < obj.hints.length) o.hints += 1;
        d.objectives[id] = o;
      });
    },
    fileReport: function () {
      LabStore.patch(function (d) { d.completed = true; });
      UI_STATE.modalOpen = true;
      render();
    },
    readFieldNotes: function () {
      UI_STATE.modalOpen = false;
      LabStore.patch(function (d) { d.tab = 'debrief'; });
    },

    // Quiz
    setQuizDraft: function (id, oi) {
      PANEL_UI.quizDrafts[id] = String(oi);
      render();
    },
    lockQuiz: function (id) {
      var choice = PANEL_UI.quizDrafts[id];
      if (choice === undefined) return;
      LabStore.patch(function (d) {
        d.quiz[id] = choice; // R2: locking is final — the answer cannot be changed
        var items = d.mode === 'hard' ? DATA.QUIZ_HARD : DATA.QUIZ_MEDIUM;
        if (items.every(function (x) { return d.quiz[x.id] !== undefined; })) d.quizDone = true;
      });
    },
    quizNext: function () {
      var state = LabStore.getState();
      var items = state.mode === 'hard' ? DATA.QUIZ_HARD : DATA.QUIZ_MEDIUM;
      PANEL_UI.quizCursor = Math.min(PANEL_UI.quizCursor + 1, items.length);
      render();
    },

    // Dialogs
    setResetOpen: function (v) {
      UI_STATE.resetOpen = v;
      render();
    },
    setModalOpen: function (v) {
      UI_STATE.modalOpen = v;
      render();
    },
    confirmReset: function () {
      UI_STATE.resetOpen = false;
      UI_STATE.modalOpen = false;
      resetPanelUi();
      LabStore.reset();
    },
    overlayDown: function (e, which) {
      if (e.target === e.currentTarget) {
        if (which === 'reset') UI_STATE.resetOpen = false;
        if (which === 'modal') UI_STATE.modalOpen = false;
        render();
      }
    },
  };

  // Tab-local ephemeral state reset (mirrors React unmount of the panel).
  function resetPanelUi() {
    PANEL_UI.registryQuery = '';
    PANEL_UI.registryGlossaryOpen = false;
    PANEL_UI.docketActiveId = null;
    PANEL_UI.objFeedback = {};
    PANEL_UI.quizDrafts = {};
    var state = LabStore.getState();
    PANEL_UI.quizCursor = 0;
    if (state) {
      var items = state.mode === 'hard' ? DATA.QUIZ_HARD : DATA.QUIZ_MEDIUM;
      for (var i = 0; i < items.length; i++) {
        if (state.quiz[items[i].id] === undefined) { PANEL_UI.quizCursor = i; break; }
        PANEL_UI.quizCursor = items.length;
      }
    }
  }

  // Wrap the tab switch so ephemeral panel state resets on every change.
  var origSetTab = window.App.setTab;
  window.App.setTab = function (tab) {
    if (LabStore.getState() && LabStore.getState().tab !== tab) resetPanelUi();
    origSetTab(tab);
  };

  // ── Bootstrap ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    root = document.getElementById('app');
    LabStore.init();
    resetPanelUi();
    LabStore.subscribe(function () { render(); });
    render();

    // R7: every dialog closes via ESC.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && (UI_STATE.resetOpen || UI_STATE.modalOpen)) {
        UI_STATE.resetOpen = false;
        UI_STATE.modalOpen = false;
        render();
      }
    });
  });
})();
