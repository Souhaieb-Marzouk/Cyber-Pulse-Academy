/* ======================================================================
   js/app.js — bootstrap, event wiring, incremental rendering, timers
   Behavior port of the original React shell (lab-root + store effects):
     * hydrate → splash → mode select OR sprint board
     * one delegated event layer (data-* attributes from ui.js templates)
     * deterministic SOAR run loop (480 ms/line) + night-watch anomaly
       reveal (2600 ms) — same timing as the original useEffect timers
     * completion modal auto-opens 600 ms after the last objective passes
     * glossary popover, mobile sheet, reset confirm, focus + Escape
   ====================================================================== */
(function () {
  'use strict';

  var store = window.LAB_STORE;
  var UI = window.LAB_UI;
  var D = window.LAB_DATA;

  var app = document.getElementById('app');
  var view = 'splash'; // 'splash' | 'mode' | 'board'
  var renderedMode = null;

  /* timers (single-flight, like the original effects) */
  var runTimer = null;
  var watchTimer = null;
  var completionTimer = null;

  /* focus bookkeeping for dialogs */
  var lastFocused = null;

  /* signatures for cheap "did it change" checks */
  var sig = {
    finish: '', quizBadge: '', railList: '', compTable: null,
    phishOrder: '', credOrder: '', slaOrder: '', feedCount: -1, watchCount: -1,
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function env() { return store.getState().env; }
  function objState(id) { return store.getState().obj[id] || { done: false, attempts: 0, hints: 0 }; }
  function objDef(id) {
    for (var i = 0; i < D.OBJECTIVES.length; i++) if (D.OBJECTIVES[i].id === id) return D.OBJECTIVES[i];
    throw new Error('Missing objective def: ' + id);
  }

  /* ======================================================================
     VIEW SWAP
     ====================================================================== */
  function renderView() {
    var st = store.getState();
    if (!st.mode) {
      if (view !== 'mode') {
        app.innerHTML = UI.renderModeSelect();
        view = 'mode';
        renderedMode = null;
      }
      return;
    }
    if (view !== 'board' || renderedMode !== st.mode) {
      closeGlossary(); closeSheet(); closeModal(); closeReset();
      app.innerHTML = UI.renderBoard();
      view = 'board';
      renderedMode = st.mode;
      sig.finish = ''; sig.railList = ''; sig.compTable = null;
      sig.phishOrder = sig.credOrder = sig.slaOrder = '';
      sig.feedCount = -1; sig.watchCount = -1;
    }
  }

  /* ======================================================================
     INCREMENTAL UPDATES (run on every store notification while on board)
     ====================================================================== */
  function setHidden(el, hidden) { if (el) el.hidden = hidden; }
  function setText(el, txt) { if (el && el.textContent !== txt) el.textContent = txt; }

  function updateHeader() {
    var der = store.get();
    var st = store.getState();
    setHeaderResults(der.allDone);
    setText($('[data-score]'), String(der.score));
    var scoreWrap = $('[data-score-wrap]');
    if (scoreWrap) scoreWrap.setAttribute('aria-label', 'Score ' + der.score + ' percent');
    var pct = der.totalCount === 0 ? 0 : Math.round((der.doneCount / der.totalCount) * 100);
    var ring = $('[data-ring]');
    if (ring) {
      var c = 2 * Math.PI * 15;
      ring.setAttribute('stroke-dashoffset', String(c * (1 - pct / 100)));
    }
    setText($('[data-ring-label]'), pct + '%');
    var ringWrap = $('[data-ring-wrap]');
    if (ringWrap) ringWrap.setAttribute('aria-label', 'Sprint progress ' + pct + ' percent');

    /* day rail counts */
    var items = UI.dayRailItems();
    $all('[data-railbtn]').forEach(function (btn) {
      var id = btn.getAttribute('data-railbtn');
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          var countEl = btn.querySelector('.railbtn-count');
          if (items[i].count) {
            if (!countEl) { countEl = document.createElement('span'); countEl.className = 'railbtn-count'; btn.appendChild(countEl); }
            setText(countEl, items[i].count);
          } else if (countEl) countEl.remove();
          btn.classList.toggle('railbtn-on', items[i].active);
          break;
        }
      }
    });
    void st;
  }

  function setHeaderResults(allDone) {
    var btn = $('[data-results-btn]');
    if (btn) btn.hidden = !allDone;
  }

  function updateRail() {
    var der = store.get();
    setText($('[data-rail-done]'), String(der.doneCount));
    setText($('[data-rail-score]'), String(der.score));
    setHidden($('[data-rail-alldone]'), !der.allDone);
    var listSig = der.doneCount + '/' + der.totalCount + ':' + der.objectives.map(function (o) {
      return objState(o.id).done ? 1 : 0;
    }).join('');
    if (listSig !== sig.railList) {
      sig.railList = listSig;
      var list = $('[data-rail-list]');
      if (list) list.innerHTML = UI.ObjectiveList('');
    }
    /* mobile fab + sheet */
    setText($('[data-fab-count]'), der.doneCount + '/' + der.totalCount);
    var fab = $('[data-fab]');
    if (fab) fab.setAttribute('aria-label', 'Open objectives tracker, ' + der.doneCount + ' of ' + der.totalCount + ' done');
    setText($('[data-sheet-count]'), der.doneCount + '/' + der.totalCount);
    var sheetList = $('[data-sheet-list]');
    if (sheetList) sheetList.innerHTML = UI.ObjectiveList(' data-close-sheet');
  }

  function updateFinish() {
    var box = $('[data-finish]');
    if (!box) return;
    var der = store.get();
    box.classList.toggle('finish-done', der.allDone);
    var next = null;
    var st = store.getState();
    for (var i = 0; i < der.objectives.length; i++) {
      if (!(st.obj[der.objectives[i].id] && st.obj[der.objectives[i].id].done)) { next = der.objectives[i].id; break; }
    }
    var s = (der.allDone ? 'D' : 'P') + ':' + (der.totalCount - der.doneCount) + ':' + next;
    if (s !== sig.finish) {
      sig.finish = s;
      box.innerHTML = UI.finishInner();
    }
  }

  /* -------- objective cards (badges, hints, feedback, buttons) -------- */
  function cardDisabled(id) {
    var e = env();
    if (id === 'OBJ-M7' || id === 'OBJ-M8') return e.runDone !== true;
    if (id === 'OBJ-M9') return e.compRun !== true;
    return false;
  }

  function updateObjectiveCards() {
    $all('[data-obj-card]').forEach(function (card) {
      var id = card.getAttribute('data-obj-card');
      var def = objDef(id);
      var stt = objState(id);
      var done = !!stt.done;
      var medium = def.mode === 'medium';

      card.classList.toggle('obj-done', done);
      setHidden($('[data-obj-passed]', card), !done);
      var look = $('[data-obj-look]', card);
      if (look) look.hidden = !(medium && def.look && !done);

      var checkBtn = $('button[data-action="check"]', card);
      if (checkBtn) { checkBtn.hidden = done; checkBtn.disabled = cardDisabled(id); }
      var hintBtn = $('button[data-action="hint"]', card);
      if (hintBtn) {
        hintBtn.hidden = done;
        hintBtn.disabled = done || stt.hints >= def.hints.length;
        setText($('[data-hint-label]', hintBtn), medium
          ? 'Hint (' + stt.hints + '/' + def.hints.length + ')'
          : 'Reveal nudge (costs stars)');
      }
      var att = $('[data-obj-attempts]', card);
      if (att) {
        var show = stt && stt.attempts > 0;
        att.hidden = !show;
        if (show) setText(att, 'attempts ' + stt.attempts + (stt.hints > 0 ? ' · hints ' + stt.hints : ''));
      }
      var dis = cardDisabled(id);
      var disNote = $('[data-obj-disabled-note]', card);
      if (disNote) disNote.hidden = !(dis && !done && def.disabledNote);
      if (disNote && dis && !done) setText(disNote, disNoteText(id));

      var hintBox = $('[data-obj-hints]', card);
      if (hintBox) {
        hintBox.hidden = !(stt.hints > 0);
        if (stt.hints > 0) {
          var html = def.hints.slice(0, stt.hints).map(function (h, i) {
            return '<p class="hint-line"><span class="hint-strong">Hint ' + (i + 1) + ':</span> ' + UI.esc(h) + '</p>';
          }).join('');
          if (hintBox.getAttribute('data-n') !== String(stt.hints)) {
            hintBox.setAttribute('data-n', String(stt.hints));
            hintBox.innerHTML = html;
          }
        }
      }

      /* fail box — re-render when attempts changes so the animation replays */
      var failBox = $('[data-obj-fail]', card);
      if (failBox) {
        var showFail = stt.attempts > 0 && !done;
        var attSig = String(stt.attempts);
        if (showFail && failBox.getAttribute('data-att') !== attSig) {
          failBox.setAttribute('data-att', attSig);
          failBox.innerHTML =
            '<p class="fail-t">' + UI.icon('rotate-ccw', 16) + ' NOT YET — teaching moment</p>' +
            '<p class="fail-d">' + UI.esc(def.feedbackFail) + '</p>' +
            (stt.note ? '<p class="fail-note">Validator: ' + UI.esc(stt.note) + '</p>' : '');
          failBox.hidden = false;
          failBox.classList.remove('res-in');
          void failBox.offsetWidth; /* restart CSS animation */
          failBox.classList.add('res-in');
        } else if (!showFail) {
          failBox.hidden = true;
        }
      }
      var passBox = $('[data-obj-passbox]', card);
      if (passBox) passBox.hidden = !done;
    });
  }

  function disNoteText(id) {
    if (id === 'OBJ-M7') return 'The receipt prints after the automation run completes.';
    if (id === 'OBJ-M8') return 'Escalations appear once the automation has run.';
    if (id === 'OBJ-M9') return 'Run the automated control checks first — the gap will surface itself.';
    return '';
  }

  /* -------- radios / selects / checkboxes / duo toggles -------- */
  function syncRadios() {
    var e = env();
    $all('input[type="radio"][data-key]').forEach(function (input) {
      var key = input.getAttribute('data-key');
      var val;
      if (key.indexOf('map:') === 0) {
        var parts = key.split(':');
        val = e[parts[1]] ? (e[parts[1]][parts[2]] || '') : '';
      } else {
        val = e[key] === undefined ? '' : String(e[key]);
      }
      input.checked = input.value === val;
      var label = input.closest('.radio-card');
      if (label) label.classList.toggle('is-checked', input.checked);
    });
    /* quiz radios are locked after first answer — visual state handled in updateQuiz */
  }

  function syncSelects() {
    var e = env();
    $all('select[data-key], select[data-map]').forEach(function (sel) {
      if (document.activeElement === sel) return; /* don't fight the open dropdown */
      var val;
      if (sel.hasAttribute('data-map')) {
        val = e[sel.getAttribute('data-map')] ? (e[sel.getAttribute('data-map')][sel.getAttribute('data-k')] || '') : '';
      } else {
        var k = sel.getAttribute('data-key');
        val = e[k] === undefined ? '' : String(e[k]);
      }
      if (sel.value !== val) sel.value = val;
    });
    /* H1 benefit selects enable only when their row is picked */
    $all('[data-horow]').forEach(function (row) {
      var picked = (e.handoverPicks || []).indexOf(row.getAttribute('data-horow')) !== -1;
      var sel = row.querySelector('select');
      if (sel) sel.disabled = !picked;
    });
  }

  function syncChecks() {
    var e = env();
    $all('input[type="checkbox"][data-arr]').forEach(function (cb) {
      var list = e[cb.getAttribute('data-arr')] || [];
      var on = list.indexOf(cb.getAttribute('data-k')) !== -1;
      if (cb.checked !== on) cb.checked = on;
      var row = cb.closest('.check-row');
      if (row) row.classList.toggle('check-row-on', on);
    });
    $all('input[type="checkbox"][data-map]').forEach(function (cb) {
      var m = e[cb.getAttribute('data-map')];
      var on = !!(m && m[cb.getAttribute('data-k')] === true);
      if (cb.checked !== on) cb.checked = on;
    });
  }

  function syncDuos() {
    var e = env();
    $all('button[data-duo]').forEach(function (btn) {
      var m = e[btn.getAttribute('data-duo')];
      var val = m ? (m[btn.getAttribute('data-k')] || '') : '';
      var on = val === btn.getAttribute('data-val');
      if (btn.getAttribute('aria-pressed') !== String(on)) btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('duo-on', on);
    });
  }

  function syncKpis() {
    var e = env();
    $all('button[data-action="kpi"]').forEach(function (btn) {
      var on = (e.kpiPicks || []).indexOf(btn.getAttribute('data-k')) !== -1;
      btn.classList.toggle('kpi-on', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  function syncReorders() {
    var e = env();
    syncOneReorder('phishOrder', e.phishOrder || D.PHISH_INIT, D.PHISH_STEPS);
    syncOneReorder('credOrder', e.credOrder || D.CRED_INIT, D.CRED_STEPS);
    syncOneReorder('slaOrder', e.slaOrder || D.SLA_TICKETS.map(function (t) { return t.id; }),
      D.SLA_TICKETS.map(function (t) { return { id: t.id, text: t.text }; }));
  }

  function syncOneReorder(key, order, items) {
    var s = order.join(',');
    if (sig[key] === s) return;
    sig[key] = s;
    var btn = document.querySelector('[data-order="' + key + '"]');
    if (!btn) return;
    var ol = btn.closest('ol');
    if (ol) ol.innerHTML = renderReorderInner(key, items, order);
  }

  function renderReorderInner(key, items, order) {
    /* mirrors ui.js ReorderList — duplicated here to avoid template churn */
    var byId = {};
    items.forEach(function (it) { byId[it.id] = it; });
    return order.map(function (id, idx) {
      var item = byId[id];
      if (!item) return '';
      var short = item.text.slice(0, 24);
      return '<li class="reorder-item">' +
        '<span class="reorder-n">' + String(idx + 1).padStart(2, '0') + '</span>' +
        '<span class="reorder-txt">' + UI.esc(item.text) + '</span>' +
        '<span class="reorder-btns">' +
        '<button type="button" class="btn btn-icon" data-order="' + key + '" data-idx="' + idx + '" data-dir="-1"' +
        ' aria-label="Move &quot;' + UI.esc(short) + '…" up"' + (idx === 0 ? ' disabled' : '') + '>' + UI.icon('chevron-up', 16) + '</button>' +
        '<button type="button" class="btn btn-icon" data-order="' + key + '" data-idx="' + idx + '" data-dir="1"' +
        ' aria-label="Move &quot;' + UI.esc(short) + '…" down"' + (idx === order.length - 1 ? ' disabled' : '') + '>' + UI.icon('chevron-down', 16) + '</button>' +
        '</span></li>';
    }).join('');
  }

  /* -------- day 3: SOAR control + live feed -------- */
  function updateSoar() {
    var e = env();
    var on = e.soarOn === true;
    var done = e.runDone === true;
    var armed = UI.canEnable();

    var sw = $('#soar-switch');
    if (sw) {
      sw.setAttribute('aria-checked', String(on));
      sw.classList.toggle('switch-on', on);
      sw.disabled = done || (!on && !armed);
    }
    setText($('[data-soar-status]'), on ? (done ? 'RUN COMPLETE' : 'RUNNING…') : 'OFF');
    setHidden($('[data-soar-flag="ok"]'), !armed);
    setHidden($('[data-soar-flag="lock"]'), armed);

    var visible = on ? D.RUN_SCRIPT.slice(0, (e.runStep === undefined ? -1 : e.runStep) + 1) : [];
    updateFeed($('#soar-feed'), visible,
      armed ? 'Automation armed. Flip the switch to run 12 queued reports through the playbook.'
            : 'Offline. Work the manual shift above — then the floor is yours to automate.',
      'soar');

    var receipt = $('[data-receipt]');
    if (receipt) setHidden(receipt, !done);

    /* M7 receipt inputs unlock when the run completes (parity with disabled={!runDone}) */
    ['auto-count', 'auto-time'].forEach(function (id) {
      var input = document.getElementById(id);
      if (input) input.disabled = !done;
    });
  }

  function updateFeed(feed, lines, emptyText, key) {
    if (!feed) return;
    var body = $('.terminal-body', feed);
    var counter = key === 'watch' ? 'watchCount' : 'feedCount';
    var empty = $('.term-empty', body);
    if (lines.length === 0) {
      if (!empty) { body.innerHTML = '<p class="term-empty">' + UI.esc(emptyText) + '</p>'; }
      else setText(empty, emptyText);
      sig[counter] = 0;
      $('[data-live]', feed).textContent = '';
      return;
    }
    if (empty) empty.remove();
    var n = sig[counter];
    if (n < 0) {
      /* first sync after a (re)render — the template may already contain lines */
      sig[counter] = $all('.log-line', body).length;
      n = sig[counter];
    }
    if (n > lines.length) { /* rewind (switch off/on) — redraw all */
      $all('.log-line', body).forEach(function (p) { p.remove(); });
      n = 0;
    }
    for (var i = n; i < lines.length; i++) {
      body.insertAdjacentHTML('beforeend', logLineHtml(lines[i]));
    }
    sig[counter] = lines.length;
    $('[data-live]', feed).textContent = lines[lines.length - 1].t + ' — ' + lines[lines.length - 1].msg;
  }

  function logLineHtml(l) {
    return '<p class="log-line tone-' + l.t + '"><span class="term-t">' + UI.esc(l.t) + '</span> ' + UI.esc(l.msg) + '</p>';
  }

  /* -------- day 4 -------- */
  function updateDay4() {
    var e = env();
    /* compliance */
    var ran = e.compRun === true;
    var runBtn = $('button[data-action="comp-run"]');
    if (runBtn) {
      runBtn.disabled = ran;
      setText($('[data-comp-run-label]', runBtn), ran ? 'CHECKS COMPLETE' : 'RUN AUTOMATED CONTROL CHECKS');
    }
    if (sig.compTable !== String(ran)) {
      sig.compTable = String(ran);
      var holder = $('[data-comp-table]');
      if (holder) holder.innerHTML = compTableHtml(ran);
    }

    var ticketOpen = e.ticketOpened === true;
    var openBtn = $('button[data-action="open-ticket"]');
    if (openBtn) {
      openBtn.disabled = ticketOpen || !(e.compHost && e.compControl && e.compPriority);
      setText($('[data-ticket-label]', openBtn), ticketOpen ? 'TICKET OPENED ✓' : 'OPEN REMEDIATION TICKET');
    }
    setHidden($('[data-ticket-badge]'), !ticketOpen);

    /* night watch */
    var live = e.watchStarted === true;
    var anomaly = e.anomalyVisible === true;
    var watchBtn = $('button[data-action="start-watch"]');
    if (watchBtn) {
      watchBtn.disabled = live;
      setText($('[data-watch-label]', watchBtn), live ? 'WATCH LIVE — 22:00 → 06:00' : 'START SIMULATED 22:00 WATCH');
    }
    var wrapEl = $('[data-watch-feed]');
    if (wrapEl) {
      var feed = $('#watch-feed');
      if (!live) {
        if (feed) { feed.remove(); sig.watchCount = -1; }
      } else if (!feed) {
        wrapEl.innerHTML = terminalShell('watch-feed', 'continuous monitoring feed — overnight');
        sig.watchCount = 0;
      }
      if (live) {
        updateFeed($('#watch-feed'), D.WATCH_LINES.slice(0, anomaly ? 4 : 3), '—', 'watch');
      }
    }
    var an = $('[data-anomaly]');
    if (an) {
      if (anomaly && an.hidden) { an.hidden = false; } /* .pop-in animation plays on first reveal */
      if (!anomaly && !an.hidden) an.hidden = true;
    }
    var ackBtn = $('button[data-action="ack"]');
    if (ackBtn) {
      var acked = e.anomalyAck === true;
      ackBtn.disabled = acked;
      setText($('[data-ack-label]', ackBtn), acked ? 'ACKNOWLEDGED ✓' : 'ACKNOWLEDGE');
    }
  }

  function compTableHtml(ran) {
    if (!ran) return '';
    var head = D.CONTROLS.map(function (c) { return '<th scope="col">' + UI.esc(c) + '</th>'; }).join('');
    var rows = D.HOSTS.map(function (h) {
      var tds = h.checks.map(function (ok, i) {
        return ok
          ? '<td>' + UI.icon('check-circle-2', 16, 'ic-emerald-600') + '<span class="sr-only">' + UI.esc(D.CONTROLS[i] + ' pass') + '</span></td>'
          : '<td>' + UI.icon('x-circle', 16, 'ic-rose-600') + '<span class="sr-only">' + UI.esc(D.CONTROLS[i] + ' FAIL') + '</span></td>';
      }).join('');
      return '<tr class="' + (h.host === 'WH-KS-07' ? 'row-fail' : '') + '">' +
        '<th scope="row" class="mono-cell">' + UI.esc(h.host) + '</th>' + tds + '</tr>';
    }).join('');
    return '<div class="table-wrap comp-table fade-in"><table class="table"><caption class="sr-only">Automated control check results per host</caption>' +
      '<thead><tr class="table-head"><th scope="col">Host</th>' + head + '</tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<p class="table-foot">machine evidence saved · next scheduled check in 60 min · this scan is what auditors receive</p>';
  }

  function terminalShell(id, label) {
    return '<div class="terminal" id="' + id + '">' +
      '<div class="terminal-head">' + UI.esc(label) + '</div>' +
      '<div class="terminal-body lab-scroll" role="log"></div>' +
      '<div class="sr-only" aria-live="polite" data-live></div></div>';
  }

  /* -------- quiz -------- */
  function updateQuiz() {
    var st = store.getState();
    var der = store.get();
    var answered = der.quiz.filter(function (q) { return st.quiz[q.id]; }).length;
    var correct = der.quiz.filter(function (q) { return st.quiz[q.id] && st.quiz[q.id].correct; }).length;
    setText($('[data-quiz-badge]'), answered + '/' + der.quiz.length + ' answered · ' + correct + ' correct · score ' + der.score + '/100');

    der.quiz.forEach(function (q) {
      var card = $('[data-quiz-card="' + q.id + '"]');
      if (!card) return;
      var ans = st.quiz[q.id];
      var locked = !!ans;
      card.classList.toggle('quiz-card-ok', locked && ans.correct);
      card.classList.toggle('quiz-card-miss', locked && !ans.correct);
      $all('input[type="radio"][data-quiz="' + q.id + '"]', card).forEach(function (input) {
        var oi = parseInt(input.getAttribute('data-pick'), 10);
        input.disabled = locked;
        input.checked = locked && ans.pick === oi;
        var label = input.closest('.radio-card');
        if (label) {
          label.classList.toggle('quiz-correct', locked && oi === q.correct);
          label.classList.toggle('quiz-wrong', locked && ans.pick === oi && oi !== q.correct);
          label.classList.toggle('quiz-dim', locked && ans.pick !== oi && oi !== q.correct);
          var hasIcon = label.querySelector('.ic-emerald-600, .ic-rose-600');
          if (locked && !hasIcon) {
            label.insertAdjacentHTML('beforeend',
              oi === q.correct ? UI.icon('check-circle-2', 16, 'ic-emerald-600')
                               : (ans.pick === oi ? UI.icon('x-circle', 16, 'ic-rose-600') : ''));
          }
        }
      });
      var expl = $('[data-quiz-expl]', card);
      if (expl) {
        expl.hidden = !locked;
        if (locked) {
          expl.className = ans.correct ? 'quiz-expl quiz-expl-ok' : 'quiz-expl quiz-expl-no';
          var t = $('.quiz-expl-t-ok, .quiz-expl-t-no', expl);
          if (t) {
            t.className = ans.correct ? 'quiz-expl-t-ok' : 'quiz-expl-t-no';
            t.textContent = ans.correct ? 'Correct — here is why it matters' : 'Not this one — here is the lesson';
          }
          var d = $('.quiz-expl-d', expl);
          if (d) d.textContent = q.expl;
        }
      }
    });
  }

  /* -------- master update -------- */
  function updateAll() {
    if (view !== 'board') return;
    updateHeader();
    updateRail();
    updateObjectiveCards();
    syncRadios();
    syncSelects();
    syncChecks();
    syncDuos();
    syncKpis();
    syncReorders();
    updateSoar();
    updateDay4();
    updateQuiz();
    updateFinish();
  }

  /* ======================================================================
     TIMERS (original useEffect semantics)
     ====================================================================== */
  function scheduleRun() {
    if (runTimer) { clearTimeout(runTimer); runTimer = null; }
    var e = env();
    if (e.soarOn === true && e.runDone !== true && view === 'board') {
      runTimer = setTimeout(function () {
        runTimer = null;
        var s = store.getState().env;
        if (s.soarOn !== true || s.runDone === true) return;
        var step = s.runStep === undefined ? -1 : s.runStep;
        if (step >= D.RUN_SCRIPT.length - 1) store.setEnv({ runDone: true });
        else store.setEnv({ runStep: step + 1 });
      }, 480);
    }
  }

  function scheduleWatch() {
    if (watchTimer) { clearTimeout(watchTimer); watchTimer = null; }
    var e = env();
    if (e.watchStarted === true && e.anomalyVisible !== true && view === 'board') {
      watchTimer = setTimeout(function () {
        watchTimer = null;
        var s = store.getState().env;
        if (s.watchStarted === true && s.anomalyVisible !== true) store.setEnv({ anomalyVisible: true });
      }, 2600);
    }
  }

  function scheduleCompletion() {
    if (completionTimer) { clearTimeout(completionTimer); completionTimer = null; }
    var st = store.getState();
    var der = store.get();
    if (store.isHydrated() && der.allDone && !st.completedSeen && view === 'board') {
      completionTimer = setTimeout(function () {
        completionTimer = null;
        var s2 = store.getState();
        var d2 = store.get();
        if (store.isHydrated() && d2.allDone && !s2.completedSeen) openModal();
      }, 600);
    }
  }

  /* ======================================================================
     STORE SUBSCRIPTION
     ====================================================================== */
  store.subscribe(function () {
    renderView();
    updateAll();
    scheduleRun();
    scheduleWatch();
    scheduleCompletion();
  });

  /* ======================================================================
     DIALOGS / POPOVER / SHEET
     ====================================================================== */
  function lockBody(on) {
    document.body.classList.toggle('modal-open', on);
  }

  function openModal() {
    var st = store.getState();
    var der = store.get();
    lastFocused = document.activeElement;
    var mode = st.mode;
    var quizIds = mode === 'medium'
      ? ['qm1', 'qm2', 'qm3', 'qm4', 'qm5', 'qm6']
      : ['qh1', 'qh2', 'qh3', 'qh4', 'qh5', 'qh6', 'qh7'];
    var quizCorrect = quizIds.filter(function (id) { return st.quiz[id] && st.quiz[id].correct; }).length;

    setText($('[data-cm-title]'), 'Sprint complete — ' + (mode === 'medium' ? 'Deputy Lead' : 'Acting Lead'));
    setText($('[data-cm-sub]'), der.doneCount + '/' + der.totalCount + ' objectives passed · quiz ' + quizCorrect + ' correct · every check taught you the “why”.');
    setText($('[data-cm-score]'), String(der.score));
    $('[data-cm-stars]').innerHTML = UI.Stars(der.stars);
    setText($('[data-cm-caption]'),
      der.stars === 5 ? 'Flawless run — first-attempt passes, near-zero hints.'
        : der.stars >= 4 ? 'Strong command — a couple of retries along the way.'
        : der.stars >= 3 ? 'Solid work — revisit the teaching notes on retried objectives.'
        : 'The lab is yours to re-run — the reset button rebuilds the floor.');

    var order = ['P1', 'P2', 'P3', 'P4'];
    var PILLAR = { P1: 'pill pill-violet', P2: 'pill pill-amber', P3: 'pill pill-emerald', P4: 'pill pill-teal' };
    var LABEL = { P1: 'P1 · Understand', P2: 'P2 · Recognize', P3: 'P3 · Detect', P4: 'P4 · Lead &amp; Mitigate' };
    var recap = order.map(function (p) {
      var list = der.objectives.filter(function (o) { return o.pillar === p; });
      var done = list.filter(function (o) { return objState(o.id).done; }).length;
      return list.length === 0 ? '' :
        '<div class="cm-recap-row"><span class="' + PILLAR[p] + '">' + LABEL[p] + '</span>' +
        '<span class="cm-recap-count">' + done + '/' + list.length + '</span></div>';
    }).join('');
    $('[data-cm-recap]').innerHTML = recap;

    $('[data-modal-overlay]').hidden = false;
    $('[data-modal]').hidden = false;
    lockBody(true);
    var closeBtn = $('.cm-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    var overlay = $('[data-modal-overlay]');
    var dialog = $('[data-modal]');
    if (!dialog || dialog.hidden) return;
    overlay.hidden = true;
    dialog.hidden = true;
    lockBody(false);
    store.seeCompletion();
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function openReset() {
    lastFocused = document.activeElement;
    $('[data-reset-overlay]').hidden = false;
    $('[data-reset-dialog]').hidden = false;
    lockBody(true);
    var cancel = $('button[data-action="reset-cancel"]');
    if (cancel) cancel.focus();
  }

  function closeReset() {
    var dialog = $('[data-reset-dialog]');
    if (!dialog || dialog.hidden) return;
    $('[data-reset-overlay]').hidden = true;
    dialog.hidden = true;
    lockBody(false);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function openSheet() {
    lastFocused = document.activeElement;
    $('[data-sheet-overlay]').hidden = false;
    $('[data-sheet]').hidden = false;
    var fab = $('[data-fab]');
    if (fab) fab.setAttribute('aria-expanded', 'true');
  }

  function closeSheet() {
    var sheet = $('[data-sheet]');
    if (!sheet || sheet.hidden) return;
    $('[data-sheet-overlay]').hidden = true;
    sheet.hidden = true;
    var fab = $('[data-fab]');
    if (fab) fab.setAttribute('aria-expanded', 'false');
  }

  function openGlossary() {
    var pop = $('[data-glossary-pop]');
    if (!pop) return;
    pop.hidden = false;
    $('[data-glossary-btn]').setAttribute('aria-expanded', 'true');
  }

  function closeGlossary() {
    var pop = $('[data-glossary-pop]');
    if (!pop || pop.hidden) return;
    pop.hidden = true;
    var btn = $('[data-glossary-btn]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  /* Header Results button uses the same CustomEvent channel as the original */
  window.addEventListener('cyberlab:open-results', function () { openModal(); });

  /* ======================================================================
     EVENT DELEGATION
     ====================================================================== */
  function toggleArr(key, id, on) {
    store.setEnv(function (prev) {
      var cur = prev[key] || [];
      var next = on ? cur.concat([id]) : cur.filter(function (x) { return x !== id; });
      var patch = {};
      patch[key] = next;
      return patch;
    });
  }

  function toggleMapBool(key, id, on) {
    store.setEnv(function (prev) {
      var patch = {};
      patch[key] = Object.assign({}, prev[key]);
      patch[key][id] = on;
      return patch;
    });
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!(t instanceof Element)) return;

    /* glossary outside click */
    if (!t.closest('.glossary')) closeGlossary();

    var el;
    if ((el = t.closest('[data-action]'))) {
      var action = el.getAttribute('data-action');
      switch (action) {
        case 'choose-mode': {
          var m = el.getAttribute('data-mode');
          store.setMode(m);
          window.scrollTo({ top: 0 });
          break;
        }
        case 'check': store.check(el.getAttribute('data-obj')); break;
        case 'hint': {
          var id = el.getAttribute('data-obj');
          store.hint(id, objDef(id).hints.length);
          break;
        }
        case 'run-toggle': {
          var sw = el.closest('.switch') || el;
          var on = sw.getAttribute('aria-checked') !== 'true';
          store.setEnv(on ? { soarOn: true, runStep: 0 } : { soarOn: false, runStep: undefined });
          break;
        }
        case 'comp-run': store.setEnv({ compRun: true }); break;
        case 'open-ticket': store.setEnv({ ticketOpened: true }); break;
        case 'start-watch': store.setEnv({ watchStarted: true }); break;
        case 'ack': store.setEnv({ anomalyAck: true }); break;
        case 'kpi': {
          var k = el.getAttribute('data-k');
          var cur = env().kpiPicks || [];
          toggleArr('kpiPicks', k, cur.indexOf(k) === -1);
          break;
        }
        case 'jump': {
          var target = document.getElementById('obj-' + el.getAttribute('data-obj'));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          closeSheet();
          break;
        }
        case 'scroll': {
          var sec = document.getElementById(el.getAttribute('data-target'));
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
        case 'glossary': {
          var pop = $('[data-glossary-pop]');
          if (pop && pop.hidden) openGlossary(); else closeGlossary();
          break;
        }
        case 'open-results':
          window.dispatchEvent(new CustomEvent('cyberlab:open-results'));
          break;
        case 'close-results': closeModal(); break;
        case 'reset-ask': openReset(); break;
        case 'reset-confirm':
          closeReset();
          store.reset();
          window.scrollTo({ top: 0 });
          break;
        case 'reset-cancel': closeReset(); break;
        case 'toggle-sheet': openSheet(); break;
        case 'close-sheet': closeSheet(); break;
      }
      return;
    }

    if ((el = t.closest('[data-duo]'))) {
      store.setEnv(function (prev) {
        var patch = {};
        var key = el.getAttribute('data-duo');
        patch[key] = Object.assign({}, prev[key]);
        patch[key][el.getAttribute('data-k')] = el.getAttribute('data-val');
        return patch;
      });
      return;
    }

    if ((el = t.closest('button[data-order]'))) {
      var key2 = el.getAttribute('data-order');
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      var dir = parseInt(el.getAttribute('data-dir'), 10);
      store.setEnv(function (prev) {
        var cur = (prev[key2] || defaultOrder(key2)).slice();
        var j = idx + dir;
        if (j < 0 || j >= cur.length) return {};
        var tmp = cur[idx]; cur[idx] = cur[j]; cur[j] = tmp;
        var patch = {};
        patch[key2] = cur;
        return patch;
      });
      return;
    }
  });

  function defaultOrder(key) {
    if (key === 'phishOrder') return D.PHISH_INIT;
    if (key === 'credOrder') return D.CRED_INIT;
    if (key === 'slaOrder') return D.SLA_TICKETS.map(function (t) { return t.id; });
    return [];
  }

  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (!(t instanceof Element)) return;

    if (t.matches('input[type="radio"][data-quiz]')) {
      var qid = t.getAttribute('data-quiz');
      if (!store.getState().quiz[qid]) {
        var pick = parseInt(t.getAttribute('data-pick'), 10);
        var q = null;
        store.get().quiz.forEach(function (qq) { if (qq.id === qid) q = qq; });
        if (q) store.answerQuiz(qid, pick, pick === q.correct);
      }
      return;
    }

    if (t.matches('input[type="radio"][data-key]')) {
      var key = t.getAttribute('data-key');
      if (key.indexOf('map:') === 0) {
        var parts = key.split(':');
        store.setEnv(function (prev) {
          var patch = {};
          patch[parts[1]] = Object.assign({}, prev[parts[1]]);
          patch[parts[1]][parts[2]] = t.value;
          return patch;
        });
      } else {
        var patch = {};
        patch[key] = /^timeline[ABC]$/.test(key) ? parseInt(t.value, 10) : t.value;
        store.setEnv(patch);
      }
      return;
    }

    if (t.matches('input[type="checkbox"][data-arr]')) {
      toggleArr(t.getAttribute('data-arr'), t.getAttribute('data-k'), t.checked);
      return;
    }

    if (t.matches('input[type="checkbox"][data-map]')) {
      toggleMapBool(t.getAttribute('data-map'), t.getAttribute('data-k'), t.checked);
      return;
    }

    if (t.matches('select[data-key]')) {
      var k2 = t.getAttribute('data-key');
      var patch2 = {};
      patch2[k2] = /^timeline[ABC]$/.test(k2) ? parseInt(t.value, 10) : t.value;
      store.setEnv(patch2);
      return;
    }

    if (t.matches('select[data-map]')) {
      store.setEnv(function (prev) {
        var patch3 = {};
        var mk = t.getAttribute('data-map');
        patch3[mk] = Object.assign({}, prev[mk]);
        patch3[mk][t.getAttribute('data-k')] = t.value;
        return patch3;
      });
      return;
    }
  });

  document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t instanceof Element && t.matches('input.input[data-key]')) {
      var key = t.getAttribute('data-key');
      if (!key) return;
      var patch = {};
      patch[key] = t.value;
      store.setEnv(patch);
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      var resetD = $('[data-reset-dialog]');
      if (resetD && !resetD.hidden) { closeReset(); return; }
      var modal = $('[data-modal]');
      if (modal && !modal.hidden) { closeModal(); return; }
      var sheet = $('[data-sheet]');
      if (sheet && !sheet.hidden) { closeSheet(); return; }
      closeGlossary();
    }
  });

  /* ======================================================================
     BOOT
     ====================================================================== */
  store.subscribe(function () {
    /* splash removal happens through renderView on first notify */
  });
  store.hydrate(); /* triggers notify → renderView */
})();
