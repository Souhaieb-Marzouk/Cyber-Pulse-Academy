// ─── RELEASE TRACK · app bootstrap (static port of app/page.tsx + panels.tsx) ─
// One page world: no nav bar, no footer, no external navigation. Renders the
// mode gate, the HUD + tabs shell, the control room, the briefing / knowledge
// core / debrief panels, the glossary drawer and the completion dialog.
(function () {
  'use strict';

  const LAB = window.LAB;
  const D = window.LAB_DATA;
  const el = LAB.el;

  const TABS = [
    ['room', 'CONTROL ROOM'],
    ['brief', 'BRIEFING'],
    ['core', 'KNOWLEDGE CORE'],
    ['check', 'KNOWLEDGE CHECK'],
    ['debrief', 'DEBRIEF'],
  ];

  // ── derived helpers ──────────────────────────────────────────────────────────
  function modeOf() {
    return LAB.state.mode === 'hard' ? 'hard' : 'medium';
  }
  function objectivesFor(mode) {
    return mode === 'hard' ? D.HARD_OBJECTIVES : D.MEDIUM_OBJECTIVES;
  }
  function quizFor(mode) {
    return mode === 'hard' ? D.HARD_QUIZ : D.MEDIUM_QUIZ;
  }
  function progress() {
    return LAB.state.mode === 'hard' ? LAB.state.hard : LAB.state.medium;
  }
  function canonical() {
    const list = objectivesFor(LAB.state.mode).slice();
    list.sort(function (a, b) {
      const sa = D.STATIONS.findIndex(function (s) {
        return s.id === a.stationId;
      });
      const sb = D.STATIONS.findIndex(function (s) {
        return s.id === b.stationId;
      });
      return sa - sb;
    });
    return list;
  }
  function objectiveInit() {
    return LAB.objectiveInitState();
  }

  let announcer = null;

  function announce(msg) {
    if (announcer) announcer.textContent = msg;
  }

  // ── root ─────────────────────────────────────────────────────────────────────
  const app = document.getElementById('app');

  function renderApp() {
    app.replaceChildren();
    if (!LAB.state.mode) renderModeGate();
    else renderMain();
  }

  // ── mode gate (C0) ───────────────────────────────────────────────────────────
  function renderModeGate() {
    const main = el('main', { class: 'mode-gate' });

    const intro = el('div', { class: 'fade-up-slow' });
    const badge = el('p', { class: 'gate-badge mono' });
    badge.appendChild(LAB.icon('git-branch'));
    badge.appendChild(document.createTextNode(' NORTHWIND CLINICS · RELEASE CONTROL'));
    intro.appendChild(badge);
    intro.appendChild(el('h1', { class: 'gate-title mono', text: D.LAB_TITLE }));
    intro.appendChild(el('p', { class: 'gate-sub', text: D.LAB_SUBTITLE }));
    intro.appendChild(
      el('p', {
        class: 'gate-desc',
        text:
          'One release, one track, eight stations. Choose how you want to work it — both modes share the same control room and evidence, and progress is saved per mode in this browser.',
      })
    );
    main.appendChild(intro);

    const cards = el('div', { class: 'mode-cards' });

    const medium = el('button', {
      class: 'mode-card medium fade-up-delay-1',
      attrs: { type: 'button', 'data-testid': 'mode-medium', 'aria-label': 'Select Medium mode: Guided Dispatch' },
      events: {
        click: function () {
          selectMode('medium');
        },
      },
    });
    medium.appendChild(
      el('p', { class: 'mode-card-title mono' }, [
        LAB.icon('headphones'),
        document.createTextNode(' MEDIUM — GUIDED DISPATCH'),
      ])
    );
    const mList = el('ul', null, [
      '· 12 granular objectives, introduced in order along the track',
      '· Where-to-look nudges and a 3-tier hint system (hints cost stars, never progress)',
      '· Tolerant validation — near-misses get teaching feedback, not penalties',
      '· Knowledge check with an explanation after every answer',
    ].map(function (t) {
      return el('li', { text: t });
    }));
    medium.appendChild(mList);
    medium.appendChild(el('p', { class: 'mode-card-cta mono', text: 'learn the system →' }));
    cards.appendChild(medium);

    const hard = el('button', {
      class: 'mode-card hard fade-up-delay-2',
      attrs: { type: 'button', 'data-testid': 'mode-hard', 'aria-label': 'Select Hard mode: Live Release' },
      events: {
        click: function () {
          selectMode('hard');
        },
      },
    });
    hard.appendChild(
      el('p', { class: 'mode-card-title mono' }, [LAB.icon('rocket'), document.createTextNode(' HARD — LIVE RELEASE')])
    );
    const hList = el('ul', null, [
      '· 9 deep, multi-step challenges on a release that is already broken',
      '· Noisy evidence with distractors and red herrings — find what matters',
      '· Strict validation: exact sequences, exact IDs; one optional nudge per objective, and it costs score',
      '· Scenario-based knowledge check; efficiency and accuracy drive the rating',
    ].map(function (t) {
      return el('li', { text: t });
    }));
    hard.appendChild(hList);
    hard.appendChild(el('p', { class: 'mode-card-cta mono', text: 'prove the system →' }));
    cards.appendChild(hard);

    main.appendChild(cards);
    main.appendChild(el('p', { class: 'gate-synthetic mono', text: D.SYNTHETIC_BANNER }));
    app.appendChild(main);
  }

  function selectMode(m) {
    LAB.update(function (s) {
      s.mode = m;
      s.stationId = 'stn-01';
      s.tab = 'room';
    });
    announce(
      m === 'hard'
        ? 'Hard mode engaged. Live release — find what is broken.'
        : 'Medium mode engaged. Guided dispatch along the release track.'
    );
    renderApp();
  }

  // ── main shell: HUD header + tabbed content ─────────────────────────────────
  let refs = null; // chrome element refs

  function renderMain() {
    refs = {};
    const main = el('main');

    const header = el('header', { class: 'site-header' });
    const inner = el('div', { class: 'header-inner' });

    const brand = el('div', { class: 'brand' });
    brand.appendChild(LAB.icon('git-branch', 'brand-icon'));
    const brandText = el('div', { class: 'brand-text' });
    brandText.appendChild(el('h1', { class: 'brand-title mono', text: D.LAB_TITLE }));
    brandText.appendChild(el('p', { class: 'brand-sub mono', text: D.LAB_SUBTITLE }));
    brand.appendChild(brandText);
    inner.appendChild(brand);

    const hardMode = LAB.state.mode === 'hard';
    const hud = el('div', { class: 'hud' });

    const modeBadge = el('span', {
      class: 'mode-badge mono ' + (hardMode ? 'hard' : 'medium'),
      text: hardMode ? 'HARD · LIVE RELEASE' : 'MEDIUM · GUIDED',
    });
    hud.appendChild(modeBadge);
    refs.modeBadge = modeBadge;

    const ringWrap = el('div', {
      class: 'progress-wrap',
      attrs: { role: 'status', 'aria-label': 'Objectives progress' },
    });
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '34');
    svg.setAttribute('height', '34');
    svg.setAttribute('viewBox', '0 0 34 34');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'progress-ring ' + (hardMode ? 'hard' : 'medium'));
    const R = 13;
    const C = 2 * Math.PI * R;
    const track = document.createElementNS(NS, 'circle');
    track.setAttribute('cx', '17');
    track.setAttribute('cy', '17');
    track.setAttribute('r', String(R));
    track.setAttribute('fill', 'none');
    track.setAttribute('stroke-width', '3');
    track.setAttribute('class', 'track');
    const fill = document.createElementNS(NS, 'circle');
    fill.setAttribute('cx', '17');
    fill.setAttribute('cy', '17');
    fill.setAttribute('r', String(R));
    fill.setAttribute('fill', 'none');
    fill.setAttribute('stroke-width', '3');
    fill.setAttribute('stroke-linecap', 'round');
    fill.setAttribute('stroke-dasharray', String(C));
    fill.setAttribute('class', 'fill');
    svg.appendChild(track);
    svg.appendChild(fill);
    refs.ringSvg = svg;
    refs.ringFill = fill;
    refs.ringC = C;
    const count = el('span', { class: 'progress-count mono', text: '0/0', attrs: { 'data-testid': 'progress-count' } });
    refs.count = count;
    ringWrap.appendChild(svg);
    ringWrap.appendChild(count);
    hud.appendChild(ringWrap);

    const glossBtn = el('button', { class: 'btn btn-outline', attrs: { type: 'button' } });
    glossBtn.appendChild(LAB.icon('book-open'));
    glossBtn.appendChild(document.createTextNode(' GLOSSARY'));
    glossBtn.addEventListener('click', openGlossary);
    hud.appendChild(glossBtn);

    const finishBtn = el('button', {
      class: 'btn ' + (hardMode ? 'btn-amber' : 'btn-emerald'),
      attrs: { type: 'button' },
    });
    finishBtn.appendChild(LAB.icon('flag'));
    finishBtn.appendChild(document.createTextNode(' FINISH'));
    finishBtn.addEventListener('click', function () {
      openCompletion();
    });
    refs.finishBtn = finishBtn;
    hud.appendChild(finishBtn);

    const modeBtn = el('button', {
      class: 'btn btn-outline',
      attrs: { type: 'button', 'aria-label': 'Switch difficulty mode' },
    });
    modeBtn.appendChild(LAB.icon('switch-camera'));
    modeBtn.appendChild(document.createTextNode(' MODE'));
    modeBtn.addEventListener('click', function () {
      // progress is kept per mode — switching only returns to the mode gate
      LAB.update(function (s) {
        s.mode = null;
      });
      renderApp();
    });
    hud.appendChild(modeBtn);

    const resetBtn = el('button', { class: 'btn btn-rose-outline', attrs: { type: 'button' } });
    resetBtn.appendChild(LAB.icon('rotate-ccw'));
    resetBtn.appendChild(document.createTextNode(' RESET'));
    resetBtn.addEventListener('click', openResetDialog);
    hud.appendChild(resetBtn);

    inner.appendChild(hud);
    header.appendChild(inner);

    // tabs (second header row)
    const tabsWrap = el('div', { class: 'tabs-wrap' });
    tabsWrap.style.maxWidth = 'var(--max-w)';
    tabsWrap.style.margin = '0 auto';
    tabsWrap.style.padding = '0 0.75rem';
    const tabsList = el('div', { class: 'tabs-list', attrs: { role: 'tablist', 'aria-label': 'Lab sections' } });
    refs.tabButtons = {};
    TABS.forEach(function (pair) {
      const b = el('button', {
        class: 'tab mono' + (LAB.state.tab === pair[0] ? ' active' : ''),
        attrs: { type: 'button', role: 'tab', 'aria-selected': LAB.state.tab === pair[0] ? 'true' : 'false', 'data-tab': pair[0] },
        events: {
          click: function () {
            if (LAB.state.tab === pair[0]) return;
            LAB.update(function (s) {
              s.tab = pair[0];
            });
            paintTabs();
            contentRender();
          },
        },
      });
      b.appendChild(el('span', { class: 'tab-label', text: pair[1] }));
      tabsList.appendChild(b);
      refs.tabButtons[pair[0]] = b;
    });
    tabsWrap.appendChild(tabsList);
    header.appendChild(tabsWrap);
    main.appendChild(header);

    const content = el('div', { class: 'content' });
    refs.content = content;
    main.appendChild(content);

    announcer = el('div', { class: 'sr-only', attrs: { 'aria-live': 'polite', role: 'status' } });
    main.appendChild(announcer);

    app.appendChild(main);
    refreshChrome();
    contentRender();
  }

  function paintTabs() {
    TABS.forEach(function (pair) {
      const b = refs.tabButtons[pair[0]];
      const active = LAB.state.tab === pair[0];
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    // dynamic label for the check tab
    const mode = LAB.state.mode;
    const quiz = quizFor(mode);
    const p = progress();
    const quizCorrect = quiz.filter(function (q) {
      return p.quiz[q.id] === q.correct;
    }).length;
    refs.tabButtons.check.firstChild.textContent = 'KNOWLEDGE CHECK (' + quizCorrect + '/' + quiz.length + ')';
  }

  /** HUD + board chrome refresh (never touches widget DOM). */
  function refreshChrome() {
    if (!refs || !refs.content) return;
    const mode = LAB.state.mode;
    const hardMode = mode === 'hard';
    const objs = canonical();
    const p = progress();
    const passedCount = objs.filter(function (o) {
      return p.objectives[o.id] && p.objectives[o.id].result === 'pass';
    }).length;
    const quiz = quizFor(mode);
    const quizCorrect = quiz.filter(function (q) {
      return p.quiz[q.id] === q.correct;
    }).length;
    const allPassed = passedCount === objs.length;
    const canFinish = allPassed && p.quizDone;

    refs.count.textContent = passedCount + '/' + objs.length;
    const frac = objs.length ? passedCount / objs.length : 0;
    refs.ringFill.setAttribute('stroke-dashoffset', String(refs.ringC * (1 - frac)));
    refs.finishBtn.disabled = !canFinish;
    refs.modeBadge.textContent = hardMode ? 'HARD · LIVE RELEASE' : 'MEDIUM · GUIDED';
    refs.modeBadge.className = 'mode-badge mono ' + (hardMode ? 'hard' : 'medium');
    refs.ringSvg.setAttribute('class', 'progress-ring ' + (hardMode ? 'hard' : 'medium'));
    paintTabs();
    if (LAB.state.tab === 'room') refreshRoomSide();
  }

  // ── content router ───────────────────────────────────────────────────────────
  function contentRender() {
    if (!refs || !refs.content) return;
    refs.content.replaceChildren();
    switch (LAB.state.tab) {
      case 'room':
        refs.content.appendChild(renderRoom());
        break;
      case 'brief':
        refs.content.appendChild(briefingPanel());
        break;
      case 'core':
        refs.content.appendChild(corePanel());
        break;
      case 'check': {
        const quizBox = el('div');
        refs.content.appendChild(quizBox);
        LAB.QuizEngine.mount(quizBox, quizFor(LAB.state.mode), progress(), LAB.state.mode === 'hard', handleQuizAnswer);
        break;
      }
      case 'debrief':
        refs.content.appendChild(debriefPanel());
        break;
    }
  }

  // ── control room (tab 1) ─────────────────────────────────────────────────────
  let roomSideRef = null;

  function objectivesByStation(objs, p) {
    const map = {};
    objs.forEach(function (o) {
      map[o.stationId] = map[o.stationId] || [];
      map[o.stationId].push({
        id: o.id,
        title: o.title,
        result: p.objectives[o.id] ? p.objectives[o.id].result : null,
      });
    });
    return map;
  }

  function renderRoom() {
    const mode = LAB.state.mode;
    const hardMode = mode === 'hard';
    const objs = canonical();
    const p = progress();

    const grid = el('div', { class: 'room-grid' });
    const side = el('aside', { class: 'room-side' });
    roomSideRef = { side: side, hardMode: hardMode };
    refreshRoomSideInto(side);
    grid.appendChild(side);

    const bench = el('section', { class: 'workbench', attrs: { 'aria-label': 'Workbench' } });

    const activeStationId = LAB.state.stationId || objs[0].stationId;
    const activeStation = D.STATIONS.find(function (s) {
      return s.id === activeStationId;
    });
    const activeObjectives = objs.filter(function (o) {
      return o.stationId === activeStationId;
    });

    if (activeStation) {
      bench.appendChild(
        el('div', { class: 'station-head' }, [
          el('span', { class: 'stn-code mono', text: activeStation.code }),
          el('h2', { class: 'station-title mono', text: activeStation.name }),
          el('p', { class: 'station-tagline', text: activeStation.tagline }),
        ])
      );
    }

    const stack = el('div', { class: 'obj-stack fade-up' });
    if (activeObjectives.length === 0) {
      const empty = el('div', { class: 'empty-station' });
      empty.appendChild(LAB.icon('shield-check'));
      empty.appendChild(
        el('p', {
          text: 'No direct task at this station — its security work is exercised from other stations on the track.',
        })
      );
      empty.appendChild(
        el('p', {
          class: 'sub',
          text: 'Check the dispatcher note on the left for the next unworked objective.',
        })
      );
      stack.appendChild(empty);
    } else {
      const nextObj = objs.find(function (o) {
        return !p.objectives[o.id] || p.objectives[o.id].result !== 'pass';
      });
      const allPassed = !nextObj;
      activeObjectives.forEach(function (o) {
        const st = p.objectives[o.id] || objectiveInit();
        const nextLabel =
          nextObj && nextObj.id !== o.id
            ? 'NEXT: ' + nextObj.id
            : allPassed
              ? p.quizDone
                ? 'FINISH RELEASE'
                : 'GO TO CHECK'
              : null;
        stack.appendChild(
          LAB.objectiveCard(o, st, hardMode, objectiveHandlers, nextLabel)
        );
      });
    }
    bench.appendChild(stack);
    grid.appendChild(bench);
    return grid;
  }

  function refreshRoomSideInto(side) {
    const hardMode = LAB.state.mode === 'hard';
    const objs = canonical();
    const p = progress();
    const byStation = objectivesByStation(objs, p);
    const activeStationId = LAB.state.stationId || objs[0].stationId;
    const nextObj = objs.find(function (o) {
      return !p.objectives[o.id] || p.objectives[o.id].result !== 'pass';
    });
    const nextStationId = nextObj ? nextObj.stationId : null;

    side.replaceChildren();
    side.appendChild(
      LAB.trackBoard(D.STATIONS, byStation, p, activeStationId, nextStationId, LAB.state.mode, function (sid) {
        if (LAB.state.stationId === sid) return;
        LAB.update(function (s) {
          s.stationId = sid;
        });
        contentRender();
      })
    );
    side.appendChild(
      LAB.trackRail(D.STATIONS, activeStationId, nextStationId, function (sid) {
        if (LAB.state.stationId === sid) return;
        LAB.update(function (s) {
          s.stationId = sid;
        });
        contentRender();
      })
    );
    const note = el('p', {
      class: 'dispatcher mono',
      text: nextObj
        ? 'DISPATCHER: next unworked objective is ' + nextObj.id + ' at ' + nextObj.stationId.replace('stn-', 'STN-') + '.'
        : 'DISPATCHER: all stations cleared. Finish the release.',
    });
    side.appendChild(note);
  }

  function refreshRoomSide() {
    if (roomSideRef && roomSideRef.side.isConnected) refreshRoomSideInto(roomSideRef.side);
  }

  // ── objective handlers (page.tsx semantics) ─────────────────────────────────
  const objectiveHandlers = {
    // Widgets submit a patch function; it is applied to the LATEST stored
    // answer so consecutive edits always merge (same semantics as the
    // framework lab, where React re-renders with fresh props each change).
    onAnswerPatch: function (id, patch) {
      LAB.update(function (s) {
        const p = s.mode === 'hard' ? s.hard : s.medium;
        const cur = p.objectives[id] || objectiveInit();
        p.objectives[id] = Object.assign({}, cur, { answer: patch(cur.answer) });
      });
    },

    onCheck: function (id) {
      const objs = canonical();
      const obj = objs.find(function (o) {
        return o.id === id;
      });
      if (!obj) return;
      const p = progress();
      const cur = p.objectives[id] || objectiveInit();
      const ok = LAB.validateTask(obj.task, cur.answer || LAB.emptyAnswer(obj.task));
      let allPassedAfter = false;
      LAB.update(function (s) {
        const pp = s.mode === 'hard' ? s.hard : s.medium;
        pp.objectives[id] = Object.assign({}, cur, {
          result: ok ? 'pass' : 'fail',
          attempts: cur.attempts + 1,
          firstTry: ok && cur.attempts === 0,
        });
        allPassedAfter = objs.every(function (o) {
          return pp.objectives[o.id] && pp.objectives[o.id].result === 'pass';
        });
      });
      rerenderObjective(id);
      if (ok && allPassedAfter && p.quizDone && !LAB.state.completionSeen) {
        LAB.update(function (s) {
          s.completionSeen = true;
        });
        openCompletion();
      }
      announce(
        ok
          ? 'Objective ' + id + ' passed. ' + obj.feedbackPass
          : 'Objective ' + id + ' not passed. ' + obj.feedbackFail
      );
    },

    onHint: function (id) {
      const objs = canonical();
      const obj = objs.find(function (o) {
        return o.id === id;
      });
      if (!obj) return;
      const hardMode = LAB.state.mode === 'hard';
      const max = hardMode ? 1 : obj.hints.length;
      let used = 0;
      LAB.update(function (s) {
        const p = s.mode === 'hard' ? s.hard : s.medium;
        const cur = p.objectives[id] || objectiveInit();
        if (cur.hintsUsed >= max) return;
        p.objectives[id] = Object.assign({}, cur, { hintsUsed: cur.hintsUsed + 1 });
        used = cur.hintsUsed + 1;
      });
      if (used > 0) rerenderObjective(id, '[aria-label^="Reveal hint"], .btn-hint');
      announce('Hint revealed for ' + id + '. Hints affect the star rating, never progress.');
    },

    onRetry: function (id) {
      // R2: RETRY starts a fresh attempt — the checked answer is discarded,
      // never edited. Attempts, hints and firstTry history stay intact.
      LAB.update(function (s) {
        const p = s.mode === 'hard' ? s.hard : s.medium;
        const cur = p.objectives[id] || objectiveInit();
        p.objectives[id] = Object.assign({}, cur, { answer: null, result: null });
      });
      rerenderObjective(id);
      announce('Retry started for ' + id + '. The previous answer was cleared; give it a fresh pass.');
    },

    onNext: function () {
      const objs = canonical();
      const p = progress();
      const nextObj = objs.find(function (o) {
        return !p.objectives[o.id] || p.objectives[o.id].result !== 'pass';
      });
      if (!nextObj) {
        // All objectives passed: the card's forward button must never be dead.
        if (p.quizDone) {
          openCompletion();
        } else {
          LAB.update(function (s) {
            s.tab = 'check';
          });
          paintTabs();
          contentRender();
          announce('All objectives cleared. Moving to the knowledge check.');
        }
        return;
      }
      LAB.update(function (s) {
        s.stationId = nextObj.stationId;
        s.tab = 'room';
      });
      paintTabs();
      contentRender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  };

  function rerenderObjective(id, focusSelector) {
    const cardEl = document.querySelector('[data-objective="' + id + '"]');
    if (!cardEl) return;
    const objs = canonical();
    const obj = objs.find(function (o) {
      return o.id === id;
    });
    const p = progress();
    const st = p.objectives[id] || objectiveInit();
    const nextObj = objs.find(function (o) {
      return !p.objectives[o.id] || p.objectives[o.id].result !== 'pass';
    });
    const allPassed = !nextObj;
    const nextLabel =
      nextObj && nextObj.id !== id
        ? 'NEXT: ' + nextObj.id
        : allPassed
          ? p.quizDone
            ? 'FINISH RELEASE'
            : 'GO TO CHECK'
          : null;
    const fresh = LAB.objectiveCard(obj, st, LAB.state.mode === 'hard', objectiveHandlers, nextLabel);
    cardEl.replaceWith(fresh);
    if (focusSelector) {
      const target = fresh.querySelector(focusSelector);
      if (target) target.focus();
    } else if (st.result === 'fail') {
      const retry = fresh.querySelector('.btn-rose-outline');
      if (retry) retry.focus();
    } else if (st.result === 'pass') {
      const ghost = fresh.querySelector('.btn-emerald-ghost');
      if (ghost) ghost.focus();
    }
  }

  // ── quiz handler ─────────────────────────────────────────────────────────────
  function handleQuizAnswer(qid, optionId) {
    const quiz = quizFor(LAB.state.mode);
    const p = progress();
    if (p.quiz[qid]) return;
    const q = quiz.find(function (x) {
      return x.id === qid;
    });
    let done = false;
    let allPassed = false;
    LAB.update(function (s) {
      const pp = s.mode === 'hard' ? s.hard : s.medium;
      pp.quiz[qid] = optionId;
      done = quiz.every(function (x) {
        return !!pp.quiz[x.id];
      });
      pp.quizDone = done;
      allPassed = canonical().every(function (o) {
        return pp.objectives[o.id] && pp.objectives[o.id].result === 'pass';
      });
    });
    LAB.QuizEngine.refresh(progress());
    if (done && allPassed && !LAB.state.completionSeen) {
      LAB.update(function (s) {
        s.completionSeen = true;
      });
      openCompletion();
    }
    if (q) {
      announce(
        optionId === q.correct
          ? 'Correct answer.'
          : 'Incorrect answer — read the explanation below the question.'
      );
    }
  }

  function resetLab() {
    LAB.resetAll();
    closeDialog();
    announce('Lab reset to pristine state.');
    renderApp();
  }

  // ── dialogs (alert-style confirm, completion, glossary sheet) ────────────────
  let dialogRoot = null;
  let dialogOpener = null;

  function ensureDialogRoot() {
    if (!dialogRoot || !dialogRoot.isConnected) {
      dialogRoot = el('div', { attrs: { id: 'dialog-root' } });
      document.body.appendChild(dialogRoot);
    }
  }

  function closeDialog() {
    if (dialogRoot) {
      dialogRoot.replaceChildren();
    }
    if (dialogOpener && dialogOpener.isConnected) {
      dialogOpener.focus();
    }
    dialogOpener = null;
    document.removeEventListener('keydown', dialogKeydown);
  }

  function dialogKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDialog();
      return;
    }
    if (e.key === 'Tab' && dialogRoot) {
      // light focus trap
      const focusables = dialogRoot.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openDialog(build) {
    ensureDialogRoot();
    dialogOpener = document.activeElement;
    dialogRoot.replaceChildren();
    const built = build();
    dialogRoot.appendChild(built.overlay);
    dialogRoot.appendChild(built.panel);
    document.addEventListener('keydown', dialogKeydown);
    const focusables = built.panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length) focusables[0].focus();
    return built;
  }

  // RESET — confirmed wipe (mirrors the original AlertDialog)
  function openResetDialog() {
    openDialog(function () {
      const overlay = el('div', { class: 'overlay', attrs: { 'aria-hidden': 'true' } });
      overlay.addEventListener('click', closeDialog);
      const panel = el('div', { class: 'modal', attrs: { role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'reset-title', 'aria-describedby': 'reset-desc' } });
      panel.appendChild(el('h2', { class: 'modal-title mono', text: 'Reset the lab?', attrs: { id: 'reset-title' } }));
      panel.appendChild(
        el('p', {
          class: 'modal-desc',
          text:
            'This wipes all progress for both modes — objectives, answers, hints and quiz — and returns you to mode selection. This cannot be undone.',
          attrs: { id: 'reset-desc' },
        })
      );
      const actions = el('div', { class: 'dlg-actions' });
      actions.appendChild(
        el('button', {
          class: 'btn btn-outline',
          text: 'Keep my progress',
          attrs: { type: 'button' },
          events: { click: closeDialog },
        })
      );
      actions.appendChild(
        el('button', {
          class: 'btn btn-rose-solid',
          text: 'Reset everything',
          attrs: { type: 'button' },
          events: { click: resetLab },
        })
      );
      panel.appendChild(actions);
      return { overlay: overlay, panel: panel };
    });
  }

  // GLOSSARY — right drawer (mirrors the original Sheet)
  function openGlossary() {
    openDialog(function () {
      const overlay = el('div', { class: 'overlay', attrs: { 'aria-hidden': 'true' } });
      overlay.addEventListener('click', closeDialog);
      const sheet = el('div', { class: 'sheet', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gloss-title' } });
      const head = el('div', { class: 'sheet-head' }, [
        el('h2', { class: 'sheet-title mono', text: 'FIELD GLOSSARY — 15 TERMS', attrs: { id: 'gloss-title' } }),
        el('p', { class: 'sheet-desc', text: 'One-line definitions. Terms used by the objectives and checks.' }),
      ]);
      const closeBtn = el('button', { class: 'sheet-close', attrs: { type: 'button', 'aria-label': 'Close glossary' } });
      closeBtn.appendChild(LAB.icon('x'));
      closeBtn.addEventListener('click', closeDialog);
      head.appendChild(closeBtn);
      sheet.appendChild(head);
      const body = el('dl', { class: 'sheet-body' });
      D.GLOSSARY.forEach(function (g) {
        body.appendChild(
          el('div', { class: 'gloss-item' }, [
            el('dt', { class: 'gloss-term mono', text: g.term }),
            el('dd', { class: 'gloss-def', text: g.def }),
          ])
        );
      });
      sheet.appendChild(body);
      return { overlay: overlay, panel: sheet };
    });
  }

  // COMPLETION (C7) — scorecard dialog driven by ACTUAL performance evidence
  function buildFocusAreas(objs, objStates, quiz, quizChoices) {
    const areas = [];
    objs.forEach(function (o) {
      const st = objStates[o.id];
      if (!st || st.result !== 'pass') return;
      const bits = [];
      if (st.attempts > 1) bits.push('took ' + st.attempts + ' attempts');
      if (st.hintsUsed > 0) bits.push('used ' + st.hintsUsed + ' hint' + (st.hintsUsed > 1 ? 's' : ''));
      if (bits.length > 0) {
        const station = o.stationId.replace('stn-', 'STN-');
        areas.push({
          weight: st.attempts * 2 + st.hintsUsed,
          text:
            o.id +
            ' · ' +
            o.title +
            ' (' +
            station +
            ') — ' +
            bits.join(' and ') +
            '. Re-read the Knowledge Core phase that covers it, then re-run the objective mentally from scratch.',
        });
      }
    });
    quiz.forEach(function (q) {
      if (quizChoices[q.id] && quizChoices[q.id] !== q.correct) {
        areas.push({
          weight: 3,
          text:
            'Knowledge check: ' +
            (q.topic || q.q.slice(0, 60)) +
            ' — answered incorrectly. Review: ' +
            (q.review || 'the Knowledge Core section on this topic') +
            '.',
        });
      }
    });
    areas.sort(function (a, b) {
      return b.weight - a.weight;
    });
    return areas.map(function (a) {
      return a.text;
    });
  }

  function openCompletion() {
    openDialog(function () {
      const mode = LAB.state.mode;
      const hardMode = mode === 'hard';
      const objs = canonical();
      const p = progress();
      const quiz = quizFor(mode);
      const total = objs.length;
      const firstTry = objs.filter(function (o) {
        return p.objectives[o.id] && p.objectives[o.id].firstTry;
      }).length;
      const hints = objs.reduce(function (acc, o) {
        return acc + (p.objectives[o.id] ? p.objectives[o.id].hintsUsed : 0);
      }, 0);
      const quizCorrect = quiz.filter(function (q) {
        return p.quiz[q.id] === q.correct;
      }).length;
      const stars = LAB.computeStars(total, firstTry, hints);
      const scorePct = Math.round(((total + quizCorrect) / (total + quiz.length)) * 100);
      const focusAreas = buildFocusAreas(objs, p.objectives, quiz, p.quiz);

      const overlay = el('div', { class: 'overlay', attrs: { 'aria-hidden': 'true' } });
      overlay.addEventListener('click', function () {
        closeDialog();
      });

      const panel = el('div', {
        class: 'modal',
        attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'comp-title', 'data-testid': 'completion-modal' },
      });
      const closeBtn = el('button', { class: 'modal-close', attrs: { type: 'button', 'aria-label': 'Close completion dialog' } });
      closeBtn.appendChild(LAB.icon('x'));
      closeBtn.addEventListener('click', closeDialog);
      panel.appendChild(closeBtn);

      const title = el('h2', { class: 'modal-title mono', attrs: { id: 'comp-title' } });
      title.appendChild(el('span', { class: 'accent' + (hardMode ? ' hard' : ''), text: 'RELEASE CERTIFIED' }));
      title.appendChild(document.createTextNode(' — ' + (hardMode ? 'LIVE RELEASE' : 'GUIDED DISPATCH') + ' COMPLETE'));
      panel.appendChild(title);
      panel.appendChild(
        el('p', {
          class: 'modal-desc',
          text: 'VitalsPortal 2.5 is signed off. Here is your scorecard — it stays on this page.',
        })
      );

      // score card + stars
      const scoreCard = el('div', { class: 'score-card' });
      const scoreLeft = el('div');
      scoreLeft.appendChild(el('p', { class: 'score-label mono', text: 'FINAL SCORE' }));
      scoreLeft.appendChild(
        el('p', {
          class: 'final-score mono' + (hardMode ? ' hard' : ''),
          text: scorePct + '%',
          attrs: { 'data-testid': 'final-score' },
        })
      );
      scoreLeft.appendChild(
        el('p', {
          class: 'score-line',
          text:
            total + '/' + total + ' objectives · first-attempt passes ' + firstTry + '/' + total + ' · hints used ' + hints + ' · quiz ' + quizCorrect + '/' + quiz.length,
        })
      );
      scoreCard.appendChild(scoreLeft);
      const starsCol = el('div', { class: 'stars-col', attrs: { role: 'img', 'aria-label': stars + ' of 5 stars' } });
      const starsRow = el('div', { class: 'stars', attrs: { 'data-testid': 'star-rating' } });
      [1, 2, 3, 4, 5].forEach(function (s) {
        starsRow.appendChild(LAB.icon('star', s <= stars ? 'lit' : ''));
      });
      starsCol.appendChild(starsRow);
      starsCol.appendChild(el('p', { class: 'stars-label mono', text: stars + '/5 STARS' }));
      scoreCard.appendChild(starsCol);
      panel.appendChild(scoreCard);

      // pillar recap
      const recap = el('div', { class: 'recap-block' });
      recap.appendChild(el('p', { class: 'recap-head mono', text: 'OBJECTIVE RECAP BY MASTERY PILLAR' }));
      ['P1', 'P2', 'P3', 'P4'].forEach(function (pillar) {
        const items = objs.filter(function (o) {
          return o.pillar === pillar;
        });
        if (!items.length) return;
        const names = { P1: 'UNDERSTAND', P2: 'RECOGNIZE', P3: 'DETECT', P4: 'MITIGATE' };
        const box = el('div', { class: 'pillar-box' });
        box.appendChild(
          el('p', {
            class: 'pillar-line ' + pillar,
            text: pillar + ' · ' + names[pillar] + ' — ' + items.length + ' objective' + (items.length === 1 ? '' : 's'),
          })
        );
        const ul = el('ul', { class: 'pillar-objs' });
        items.forEach(function (o) {
          const li = el('li', { class: 'pillar-obj' });
          li.appendChild(LAB.icon('star'));
          li.appendChild(document.createTextNode(' ' + o.id + ' ' + o.title));
          ul.appendChild(li);
        });
        box.appendChild(ul);
        recap.appendChild(box);
      });
      panel.appendChild(recap);

      // focus areas (R8)
      const focus = el('div', { class: 'focus-box', attrs: { 'data-testid': 'focus-areas' } });
      focus.appendChild(el('p', { class: 'focus-title mono', text: 'FOCUS AREAS — WHERE TO DOUBLE DOWN' }));
      if (focusAreas.length === 0) {
        focus.appendChild(
          el('p', {
            class: 'result-text',
            text:
              'No weak spots detected: every objective cleared first-try without hints and the knowledge check came back perfect. To sharpen further, replay this lab in the other difficulty mode.',
          })
        );
      } else {
        const ul = el('ul');
        focusAreas.forEach(function (f) {
          ul.appendChild(el('li', null, [el('span', { class: 'focus-arrow', text: '→' }), el('span', { text: f })]));
        });
        focus.appendChild(ul);
      }
      panel.appendChild(focus);

      // next steps
      const nextBox = el('div', { class: 'next-box' });
      nextBox.appendChild(el('p', { class: 'next-title mono', text: 'WHAT TO LEARN NEXT' }));
      const nextUl = el('ul');
      D.NEXT_STEPS.forEach(function (n) {
        nextUl.appendChild(el('li', { text: '→ ' + n }));
      });
      nextBox.appendChild(nextUl);
      panel.appendChild(nextBox);

      return { overlay: overlay, panel: panel };
    });
  }

  // ── C1 briefing panel ────────────────────────────────────────────────────────
  function briefingPanel() {
    const wrap = el('div', { class: 'panel-wrap fade-up' });
    const chip = el('p', { class: 'panel-chip mono' });
    chip.appendChild(LAB.icon('flask-conical'));
    chip.appendChild(document.createTextNode(' SCENARIO BRIEFING · C1'));
    wrap.appendChild(chip);
    wrap.appendChild(el('h2', { class: 'panel-h2 mono', text: D.BRIEFING.headline }));
    D.BRIEFING.paragraphs.forEach(function (p) {
      wrap.appendChild(el('p', { class: 'panel-lead', text: p }));
    });
    const cards = el('div', { class: 'brief-cards' });
    [
      { icon: 'target', label: 'CERT ALIGNMENT', text: 'CySA+ CS0-003 · Domain 4 · objectives 4.1 / 4.2 / 4.3' },
      { icon: 'gauge', label: 'YOUR ROLE', text: 'DevSecOps release engineer, day one' },
      { icon: 'shield-check', label: 'MISSION', text: 'Certify or stop VitalsPortal v2.5' },
    ].forEach(function (c) {
      const card = el('div', { class: 'brief-card' });
      card.appendChild(LAB.icon(c.icon));
      card.appendChild(el('p', { class: 'brief-label mono', text: c.label }));
      card.appendChild(el('p', { class: 'brief-text', text: c.text }));
      cards.appendChild(card);
    });
    wrap.appendChild(cards);
    return wrap;
  }

  // ── C2 knowledge core panel ──────────────────────────────────────────────────
  function corePanel() {
    const wrap = el('div', { class: 'panel-wrap wide fade-up' });

    const chip = el('p', { class: 'panel-chip mono' });
    chip.appendChild(LAB.icon('book-open'));
    chip.appendChild(document.createTextNode(' KNOWLEDGE CORE · C2'));
    wrap.appendChild(chip);
    wrap.appendChild(el('h2', { class: 'panel-h2 mono', text: 'Security throughout the SDLC' }));
    wrap.appendChild(
      el('p', {
        class: 'panel-lead',
        text:
          'Secure software development means building security in — controls in the architecture, testing at every stage, secure coding practices, and security requirements treated as first-class requirements. The lifecycle below is the track you are operating.',
      })
    );
    const phaseGrid = el('div', { class: 'phase-grid' });
    D.CORE_PHASES.forEach(function (ph, i) {
      phaseGrid.appendChild(
        el('div', { class: 'phase-card' }, [
          el('span', { class: 'phase-num mono', text: String(i + 1) }),
          el('div', null, [
            el('p', { class: 'phase-name mono', text: ph.name.toUpperCase() }),
            el('p', { class: 'phase-text', text: ph.text }),
          ]),
        ])
      );
    });
    wrap.appendChild(phaseGrid);

    wrap.appendChild(el('h3', { class: 'panel-h3 mono', text: 'Three ways to build — and the shift-left story' }));
    const modelGrid = el('div', { class: 'model-grid' });
    D.CORE_MODELS.forEach(function (m) {
      modelGrid.appendChild(
        el('div', { class: 'model-card' }, [
          el('p', { class: 'model-name mono', text: m.name.toUpperCase() }),
          el('p', { class: 'model-tag mono', text: m.tag }),
          el('p', { class: 'model-text', text: m.text }),
        ])
      );
    });
    wrap.appendChild(modelGrid);
    const shift = el('p', { class: 'shiftleft' });
    shift.appendChild(el('span', { class: 'tag mono', text: 'SHIFT-LEFT — ' }));
    shift.appendChild(
      document.createTextNode(
        'Every security activity moved earlier costs less and prevents more: a threat model at design costs a workshop; the same flaw found in production costs an incident. Shift-left is the reason DevSecOps wires SAST/SCA into the pipeline on day one.'
      )
    );
    wrap.appendChild(shift);

    wrap.appendChild(el('h3', { class: 'panel-h3 mono', text: 'The testing arsenal (C3 toolbelt)' }));
    const table = el('table', { class: 'tests-table' });
    const thead = el('thead', null, [
      el('tr', null, [
        el('th', { class: 'mono', text: 'Technique' }),
        el('th', { class: 'mono', text: 'Class' }),
        el('th', { class: 'mono t-col', text: 'What it does' }),
      ]),
    ]);
    table.appendChild(thead);
    const tbody = el('tbody');
    D.CORE_TESTS.forEach(function (t) {
      tbody.appendChild(
        el('tr', null, [
          el('td', { class: 't-name mono', text: t.name }),
          el('td', { class: 't-kind mono', text: t.kind }),
          el('td', { class: 't-text t-col', text: t.text }),
        ])
      );
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    const runtimeGrid = el('div', { class: 'runtime-grid' });
    D.CORE_RUNTIME.forEach(function (r) {
      runtimeGrid.appendChild(
        el('div', { class: 'runtime-card' }, [
          el('p', { class: 'runtime-name mono', text: r.name.toUpperCase() }),
          el('p', { class: 'runtime-text', text: r.text }),
        ])
      );
    });
    wrap.appendChild(runtimeGrid);
    wrap.appendChild(
      el('p', {
        class: 'runtime-note',
        text:
          'Remember the split: SAST/SCA/DAST/IAST/fuzzing run at TEST-TIME in your pipeline; signing/obfuscation/encryption/RASP protect the artifact at RUN-TIME and in distribution.',
      })
    );

    const warHead = el('h3', { class: 'panel-h3 mono' });
    warHead.appendChild(LAB.icon('trending-up'));
    warHead.appendChild(document.createTextNode(' Why it pays — three incidents that rewrote the rulebook'));
    wrap.appendChild(warHead);
    const warList = el('div', { class: 'war-list' });
    D.CORE_WARSTORIES.forEach(function (w) {
      warList.appendChild(
        el('details', { class: 'doc' }, [
          el('summary', { class: 'war-summary', text: w.title }),
          el('p', { class: 'doc-body', text: w.text }),
        ])
      );
    });
    wrap.appendChild(warList);

    wrap.appendChild(el('h3', { class: 'panel-h3 mono', text: 'MITRE view of this lesson' }));
    const chips = el('div', { class: 'mitre-chips' });
    D.CORE_MITRE.forEach(function (m) {
      chips.appendChild(el('span', { class: 'mitre-chip mono', text: m.label, attrs: { title: m.note } }));
    });
    wrap.appendChild(chips);
    return wrap;
  }

  // ── C6 debrief panel ─────────────────────────────────────────────────────────
  function debriefPanel() {
    const wrap = el('div', { class: 'panel-wrap wide fade-up' });
    const chip = el('p', { class: 'panel-chip mono' });
    chip.appendChild(LAB.icon('wrench'));
    chip.appendChild(document.createTextNode(' DEBRIEF · FIELD NOTES · C6'));
    wrap.appendChild(chip);
    wrap.appendChild(el('h2', { class: 'panel-h2 mono', text: 'Verification signals & audit detection' }));
    wrap.appendChild(
      el('p', {
        class: 'panel-lead',
        text:
          'In a secure-SDLC lab, the SOC question becomes: how would I DETECT that the process is being bypassed? These are the data sources and example logic a defender wires up.',
      })
    );
    D.DEBRIEF_SIGNALS.forEach(function (s) {
      wrap.appendChild(
        el('div', { class: 'signal-card' }, [
          el('p', { class: 'signal-source mono', text: s.source }),
          el('p', { class: 'signal-text', text: s.signal }),
          el('p', { class: 'signal-rule mono', text: 'RULE: ' + s.logic }),
        ])
      );
    });

    wrap.appendChild(el('h3', { class: 'panel-h3 mono', text: 'Mitigation recommendations (with official IDs)' }));
    D.DEBRIEF_MITIGATIONS.forEach(function (m) {
      wrap.appendChild(
        el('div', { class: 'mitig-card' }, [
          el('p', { class: 'mitig-control', text: m.control }),
          el('p', { class: 'mitig-ids mono', text: m.ids }),
        ])
      );
    });

    const grid = el('div', { class: 'takeaways-grid' });
    const blue = el('div', { class: 'takeaway-box blue' });
    blue.appendChild(el('p', { class: 'takeaway-title mono', text: 'BLUE-TEAM TAKEAWAYS' }));
    const blueUl = el('ul');
    D.DEBRIEF_BLUE.forEach(function (b) {
      blueUl.appendChild(el('li', { text: '· ' + b }));
    });
    blue.appendChild(blueUl);
    grid.appendChild(blue);
    const red = el('div', { class: 'takeaway-box red' });
    red.appendChild(el('p', { class: 'takeaway-title mono', text: 'RED-TEAM MINDSET' }));
    const redUl = el('ul');
    D.DEBRIEF_RED.forEach(function (b) {
      redUl.appendChild(el('li', { text: '· ' + b }));
    });
    red.appendChild(redUl);
    grid.appendChild(red);
    wrap.appendChild(grid);

    wrap.appendChild(el('h3', { class: 'panel-h3 mono', text: 'Official references' }));
    const refList = el('ul', { class: 'ref-list' });
    D.DEBRIEF_LINKS.forEach(function (l) {
      const a = el('a', { class: 'ref-link', attrs: { href: l.href, target: '_blank', rel: 'noopener noreferrer' } });
      a.appendChild(LAB.icon('external-link'));
      a.appendChild(el('span', { text: l.label }));
      a.appendChild(el('span', { class: 'ref-note mono', text: l.note }));
      refList.appendChild(el('li', null, [a]));
    });
    wrap.appendChild(refList);
    return wrap;
  }

  // ── boot ─────────────────────────────────────────────────────────────────────
  document.title = 'RELEASE TRACK — Secure SDLC Lab · CySA+ CS0-003 14.1';
  LAB.restore();
  LAB.subscribe(refreshChrome);
  renderApp();
})();
