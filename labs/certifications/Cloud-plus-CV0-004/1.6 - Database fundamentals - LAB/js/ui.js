// ---------------------------------------------------------------------------
// ui.js — shared view layer for the static lab.
// Vanilla re-creations of the framework lab's shared components
// (src/components/lab/atoms.tsx, CompletionModal.tsx, dialogs):
//   icon rendering, PillarBadge, SheetIntro, NextSheetButton, StampMark,
//   ReviewItemCard (CHECK + hint ladder + educational feedback),
//   DraftSelect (native <select>), Gauge, accordion, dialog/drawer manager
//   and the completion modal.
// Views patch in place on store changes — no framework, no re-render storms.
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-undef
var LabUI = (function () {
  'use strict';

  // ---------- tiny DOM + string helpers ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function qs(root, selector) {
    return root.querySelector(selector);
  }

  // ---------- Icons (exact Lucide path data — see js/icons.js) ----------
  function icon(name, cls, label) {
    var node = LAB_ICONS[name];
    if (!node) return '';
    var body = node
      .map(function (part) {
        var tag = part[0];
        var attrs = part[1];
        var s = '';
        for (var k in attrs) {
          if (Object.prototype.hasOwnProperty.call(attrs, k)) s += ' ' + k + '="' + attrs[k] + '"';
        }
        return '<' + tag + s + '></' + tag + '>';
      })
      .join('');
    var aria = label ? ' aria-label="' + esc(label) + '" role="img"' : ' aria-hidden="true"';
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
      aria +
      (cls ? ' class="' + cls + '"' : '') +
      '>' +
      body +
      '</svg>'
    );
  }

  // ---------- Pillar badge ----------
  var PILLAR_META = {
    P1: { label: 'Understand', color: '#7A5514', bg: '#F2E4C8' },
    P2: { label: 'Recognize', color: '#8F3222', bg: '#F4DAD2' },
    P3: { label: 'Detect', color: '#5C4A22', bg: '#EAE0C4' },
    P4: { label: 'Mitigate', color: '#1F4D38', bg: '#D7E4DA' },
  };

  function pillarBadge(pillar) {
    var m = PILLAR_META[pillar];
    return (
      '<span class="badge badge-pillar" style="color:' +
      m.color +
      ';background-color:' +
      m.bg +
      ';border-color:currentColor">' +
      esc(pillar) +
      ' · ' +
      esc(m.label) +
      '</span>'
    );
  }

  // ---------- Sheet header ----------
  function sheetIntro(code, title, textHtml) {
    return (
      '<header class="sheet-intro">' +
      '<p class="sheet-intro-code">Sheet ' +
      esc(code) +
      '</p>' +
      '<h2 class="sheet-intro-title">' +
      esc(title) +
      '</h2>' +
      (textHtml ? '<div class="sheet-intro-text">' + textHtml + '</div>' : '') +
      '</header>'
    );
  }

  function nextSheetButton(to, label) {
    var btn = el(
      'button',
      'btn btn-outline-ink next-sheet',
      esc(label) + ' ' + icon('ChevronRight'),
    );
    btn.type = 'button';
    btn.addEventListener('click', function () {
      LabStore.actions.setActiveSheet(to);
    });
    return btn;
  }

  // ---------- The signature stamp ----------
  function stampMarkHtml(result, small, animate) {
    return (
      '<span class="stamp-text stamp-mark ' +
      result +
      (small ? ' small' : '') +
      (animate === false ? '' : ' anim-stamp') +
      '">' +
      icon('Stamp') +
      (result === 'pass' ? 'Approved' : 'Revise') +
      '</span>'
    );
  }

  // ---------- DraftSelect (native select, as in the original) ----------
  function draftSelect(opts) {
    // opts: { label, value, options:[{value,label}], testid, placeholder, disabled, onChange }
    var wrap = el('label', 'field-label');
    wrap.innerHTML =
      esc(opts.label) +
      '<select class="draft-select"' +
      (opts.testid ? ' data-testid="' + esc(opts.testid) + '"' : '') +
      (opts.disabled ? ' disabled' : '') +
      '></select>';
    var select = qs(wrap, 'select');
    var placeholder = opts.placeholder || '— select —';
    function render(value) {
      var html = '<option value="" disabled' + (value ? '' : ' selected') + '>' + esc(placeholder) + '</option>';
      opts.options.forEach(function (o) {
        html +=
          '<option value="' +
          esc(o.value) +
          '"' +
          (o.value === value ? ' selected' : '') +
          '>' +
          esc(o.label) +
          '</option>';
      });
      select.innerHTML = html;
    }
    render(opts.value);
    select.addEventListener('change', function () {
      if (opts.onChange) opts.onChange(select.value);
    });
    wrap.update = function (value, disabled) {
      render(value);
      if (disabled != null) select.disabled = disabled;
    };
    return wrap;
  }

  // ---------- Gauge (X-400 live readouts) ----------
  function gauge(label, value, unit, ok, detail) {
    var box = el(
      'div',
      'gauge ' + (ok ? 'ok' : 'bad'),
      '<div style="display:flex;align-items:baseline;justify-content:space-between">' +
        '<span class="gauge-label">' +
        esc(label) +
        '</span>' +
        (ok ? icon('Check', '', 'healthy') : icon('X', '', 'saturated')) +
        '</div>' +
        '<p class="gauge-value ' +
        (ok ? 'ok' : 'bad') +
        '">' +
        esc(value) +
        '<span class="gauge-unit">' +
        esc(unit) +
        '</span></p>' +
        '<p class="gauge-detail">' +
        esc(detail) +
        '</p>',
    );
    box.setAttribute('data-testid', 'gauge-' + label);
    return box;
  }

  // ---------- Accordion (single collapsible, as the Radix one) ----------
  function accordion(itemsHtml) {
    var root = el('div');
    root.innerHTML = itemsHtml;
    root.addEventListener('click', function (e) {
      var trigger = e.target.closest('.acc-trigger');
      if (!trigger || !root.contains(trigger)) return;
      var item = trigger.parentElement;
      var isOpen = item.classList.contains('open');
      Array.prototype.forEach.call(root.querySelectorAll('.acc-item.open'), function (other) {
        other.classList.remove('open');
      });
      if (!isOpen) item.classList.add('open');
    });
    return root;
  }

  function glossaryAccordionHtml(prefix) {
    return GLOSSARY.map(function (g, i) {
      return (
        '<div class="acc-item">' +
        '<button type="button" class="acc-trigger">' +
        esc(g.term) +
        icon('ChevronRight') +
        '</button>' +
        '<div class="acc-content">' +
        esc(g.def) +
        '</div>' +
        '</div>'
      );
    }).join('');
  }

  // ---------- ReviewItemCard: CHECK + hints + educational feedback ----------
  function reviewItemCard(id) {
    var def = getObjective(id);
    var lastHintsShown = -1;
    var lastStampAt = null;

    var section = el(
      'section',
      'sheet-card review-item',
    );
    section.setAttribute('aria-label', 'Review item ' + def.title);
    section.setAttribute('data-testid', 'review-' + id);

    section.innerHTML =
      '<div class="review-head">' +
      '<div style="min-width:0">' +
      '<div class="review-meta">' +
      '<span class="review-id">' +
      esc(def.id) +
      '</span>' +
      pillarBadge(def.pillar) +
      '<span class="review-anchor">anchors: ' +
      esc(def.anchor) +
      '</span>' +
      '</div>' +
      '<h3 class="review-title">' +
      esc(def.title) +
      '</h3>' +
      '<p class="review-task">' +
      esc(def.task) +
      '</p>' +
      '</div>' +
      '<div class="titleblock-actions" data-role="stamps"></div>' +
      '</div>' +
      '<p class="review-context">' +
      esc(def.context) +
      '</p>' +
      '<p class="review-look" data-role="look" style="display:none">Where to look: <span class="where">' +
      esc(def.whereToLook) +
      '</span></p>' +
      '<div class="review-actions">' +
      '<button type="button" class="btn btn-sm btn-wax" data-testid="check-' +
      esc(id) +
      '">' +
      icon('Stamp') +
      ' Submit for review</button>' +
      '<button type="button" class="btn btn-sm btn-hint" data-testid="hint-' +
      esc(id) +
      '">' +
      icon('Lightbulb') +
      ' <span data-role="hintlabel"></span></button>' +
      '<span class="review-attempts" data-role="attempts"></span>' +
      '</div>' +
      '<div data-role="hints"></div>' +
      '<div aria-live="polite" data-role="feedback"></div>';

    var stampsArea = qs(section, '[data-role="stamps"]');
    var look = qs(section, '[data-role="look"]');
    var checkBtn = qs(section, '[data-testid="check-' + id + '"]');
    var hintBtn = qs(section, '[data-testid="hint-' + id + '"]');
    var hintLabel = qs(section, '[data-role="hintlabel"]');
    var attemptsEl = qs(section, '[data-role="attempts"]');
    var hintsEl = qs(section, '[data-role="hints"]');
    var feedbackEl = qs(section, '[data-role="feedback"]');

    checkBtn.addEventListener('click', function () {
      LabStore.actions.checkObjective(id);
    });
    hintBtn.addEventListener('click', function () {
      LabStore.actions.revealHint(id);
    });

    function update(state) {
      var result = state.results[id];
      var stamp = state.stamp && state.stamp.objectiveId === id ? state.stamp : null;
      var hintsShown = result ? result.hintsUsed : 0;
      var passed = result ? !!result.passed : false;

      section.classList.toggle('passed', passed);
      look.style.display = state.mode === 'medium' ? '' : 'none';

      // Header stamps: fail small while un-passed after an attempt; pass small once passed.
      var stampHtml = '';
      if (result && result.lastResult && !passed) stampHtml += stampMarkHtml('fail', true, false);
      if (passed) stampHtml += stampMarkHtml('pass', true, false);
      stampsArea.innerHTML = stampHtml;

      // Hint button state/label.
      hintBtn.disabled = passed || hintsShown >= def.hints.length;
      hintLabel.textContent =
        state.mode === 'medium'
          ? 'Hint ' + Math.min(hintsShown + 1, def.hints.length) + '/3'
          : hintsShown === 0
            ? 'One nudge (costs rating)'
            : 'Nudge used';

      attemptsEl.textContent = result
        ? 'attempts: ' + result.attempts + (result.hintsUsed ? ' · hints: ' + result.hintsUsed : '')
        : '';

      // Revealed hints — rebuild only when the count changes (keeps the fade
      // from replaying on every CHECK, like AnimatePresence in the original).
      if (hintsShown !== lastHintsShown) {
        if (hintsShown > 0) {
          var list = el('ul', 'hint-list anim-hints');
          list.setAttribute('aria-label', 'Revealed hints');
          list.innerHTML = def.hints
            .slice(0, hintsShown)
            .map(function (h, i) {
              return '<li><span style="font-weight:700">Hint ' + (i + 1) + ':</span> ' + esc(h) + '</li>';
            })
            .join('');
          hintsEl.innerHTML = '';
          hintsEl.appendChild(list);
        } else {
          hintsEl.innerHTML = '';
        }
        lastHintsShown = hintsShown;
      }

      // Feedback box: current stamp (re-animates per submission) or the
      // "approved earlier" note. Mirrors the original render exactly.
      if (stamp && stamp.at !== lastStampAt) {
        lastStampAt = stamp.at;
        feedbackEl.innerHTML =
          '<div class="stamp-feedback ' +
          stamp.result +
          ' anim-feedback">' +
          '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem">' +
          stampMarkHtml(stamp.result, false) +
          '<span class="stamp-feedback-title ' +
          stamp.result +
          '">' +
          esc(stamp.title) +
          '</span>' +
          '</div>' +
          '<p class="stamp-feedback-teaching">' +
          esc(stamp.teaching) +
          '</p>' +
          (stamp.nearMiss ? '<p class="stamp-nearmiss">' + esc(stamp.nearMiss) + '</p>' : '') +
          '</div>';
      } else if (!stamp && result && !result.lastResult) {
        // NOTE: this branch is reachable only before the first CHECK of the
        // item (revealing a hint creates a result with lastResult === null).
        // It reproduces the framework lab's behaviour 1:1 — see the porting
        // report, "Known original quirks carried over".
        feedbackEl.innerHTML =
          '<div class="approved-earlier anim-fade">' +
          '<div class="approved-earlier-title">' +
          icon('Check') +
          ' Approved earlier in this session</div>' +
          '</div>';
      } else if (!stamp) {
        feedbackEl.innerHTML = '';
        lastStampAt = null;
      }
    }

    return { el: section, update: update };
  }

  // Renders every review item of a sheet in order. Returns { el, update }.
  function reviewItemsFor(sheetId) {
    var state = LabStore.getState();
    var defs = objectivesForMode(state.mode).filter(function (o) {
      return o.sheet === sheetId;
    });
    var cards = defs.map(function (d) {
      return reviewItemCard(d.id);
    });
    var wrapper = el('div');
    cards.forEach(function (c) {
      wrapper.appendChild(c.el);
    });
    function update(state2) {
      cards.forEach(function (c) {
        c.update(state2);
      });
    }
    return { el: wrapper, update: update };
  }

  // ---------- Dialog / drawer / alert layer manager ----------
  // Replaces the Radix Dialog/Sheet/AlertDialog behaviours: overlay + ESC +
  // overlay-click close, X button with the 44px hit area (fix #7), focus
  // moved into the layer and restored on close, and a minimal focus trap.
  function openLayer(opts) {
    var prevFocus = document.activeElement;
    var overlay = el('div', 'overlay');
    var panel = el('div', opts.kind === 'drawer' ? 'drawer-panel' : 'dialog-panel' + (opts.wide ? ' wide' : ''));
    if (opts.testid) panel.setAttribute('data-testid', opts.testid);
    panel.setAttribute('role', opts.kind === 'alert' ? 'alertdialog' : 'dialog');
    panel.setAttribute('aria-modal', 'true');
    if (opts.labelledBy) panel.setAttribute('aria-labelledby', opts.labelledBy);

    var titleId = 'layer-title-' + Math.random().toString(36).slice(2, 8);
    var html = '';
    if (opts.title) {
      html +=
        '<h2 class="' +
        (opts.titleClass || 'dialog-title') +
        '" id="' +
        titleId +
        '">' +
        esc(opts.title) +
        '</h2>';
    }
    if (opts.desc) {
      html += '<p class="' + (opts.descClass || 'dialog-desc') + '">' + opts.desc + '</p>';
    }
    panel.innerHTML = html;
    panel.setAttribute('aria-labelledby', titleId);
    if (opts.kind !== 'alert') {
      var x = el('button', 'dialog-close', icon('X'));
      x.type = 'button';
      x.setAttribute('aria-label', 'Close');
      panel.appendChild(x);
      x.addEventListener('click', function () {
        close();
      });
    }

    var body = el('div', 'dialog-body');
    panel.appendChild(body);

    function close() {
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      panel.remove();
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      if (opts.onClose) opts.onClose();
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key === 'Tab') {
        // minimal focus trap
        var focusables = panel.querySelectorAll(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    overlay.addEventListener('mousedown', function () {
      close();
    });
    document.addEventListener('keydown', onKey, true);

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    if (opts.build) opts.build(body, close);

    // focus the first focusable, else the panel itself
    var auto = panel.querySelector('button:not(:disabled), input:not(:disabled), select:not(:disabled)');
    if (opts.initialFocus && opts.initialFocus(panel)) {
      /* caller focused something */
    } else if (auto) {
      auto.focus();
    } else {
      panel.setAttribute('tabindex', '-1');
      panel.focus();
    }

    return { close: close, panel: panel, body: body };
  }

  // ---------- Completion modal ----------
  var NEXT_STEPS = [
    'CV0-004 Objective 1.7 — storage technologies: the same choose-by-access-pattern logic, applied to object, block and file storage.',
    'Domain 4.0 — Security: encryption choices and key management (objective 4.5) continue exactly where the Security Desk ended.',
    'Objective 3.2 — provisioning and 6.0 — Troubleshooting: the ops-journal habit (evidence → diagnosis → minimal fix) is the tested skill.',
    'Re-run the other difficulty mode: the same estate, different review. Medium teaches it; Hard proves it.',
  ];

  function openCompletionModal(score) {
    var state = LabStore.getState();
    var mode = state.mode;
    var results = state.results;
    var quiz = state.quiz;
    var defs = objectivesForMode(mode);
    var pillars = ['P1', 'P2', 'P3', 'P4'];
    var bank = mode === 'medium' ? QUIZ_MEDIUM : QUIZ_HARD;

    // Focus areas derived from THIS student's evidence (fix #5).
    var focusAreas = [];
    defs.forEach(function (d) {
      var r = results[d.id];
      if (!r || !r.passed) return;
      if (!r.passedFirstTry || r.hintsUsed > 0) {
        var bits = ['needed ' + r.attempts + (r.attempts === 1 ? ' attempt' : ' attempts')];
        if (r.hintsUsed > 0) bits.push(r.hintsUsed + (r.hintsUsed === 1 ? ' hint' : ' hints'));
        focusAreas.push({
          label: d.title,
          detail:
            'You approved it, but only after ' +
            bits.join(' and ') +
            '. Re-run the item on sheet ' +
            d.whereToLook.split('—')[0].trim() +
            ' and read the APPROVED note once more.',
        });
      }
    });
    bank.forEach(function (q, i) {
      if (quiz.submitted[i] && quiz.answers[i] !== q.correct) {
        focusAreas.push({
          label: q.topic,
          detail:
            'Knowledge check Q' +
            (i + 1) +
            ' was answered wrong. Re-read that part of the Knowledge Core (K-100) and re-run the sheet named in the topic.',
        });
      }
    });

    openLayer({
      kind: 'dialog',
      wide: true,
      testid: 'completion-modal',
      title: 'Estate signed off',
      titleClass: 'dialog-title xl',
      desc:
        '<span class="dialog-desc sm">Every drawing stamped, the memo signed. Here is what the review says about your mastery of CV0-004 Objective 1.6.</span>',
      build: function (body, close) {
        var starsHtml = [1, 2, 3]
          .map(function (i) {
            var lit = i <= score.stars;
            return icon(
              'Star',
              'star star-pop' + (lit ? ' lit' : ''),
              null,
            ).replace(
              '<svg ',
              '<svg style="animation-delay:' + (0.15 * i).toFixed(2) + 's" ',
            );
          })
          .join('');

        var focusHtml;
        if (focusAreas.length > 0) {
          focusHtml =
            '<ul class="focus-list">' +
            focusAreas
              .map(function (f) {
                return (
                  '<li class="focus-item">' +
                  '<p class="focus-label">' +
                  esc(f.label) +
                  '</p>' +
                  '<p class="focus-detail">' +
                  esc(f.detail) +
                  '</p>' +
                  '</li>'
                );
              })
              .join('') +
            '</ul>';
        } else {
          focusHtml =
            '<p class="focus-none" data-testid="focus-areas-none">No weak spots in this run: every review item was approved first attempt without hints, and every knowledge-check answer was correct. For the next study block, go one level deeper on the residual risks named in the APPROVED notes (async copy loss, restore cutover time, cache invalidation).</p>';
        }

        var pillarHtml = pillars
          .map(function (p) {
            var items = defs.filter(function (d) {
              return d.pillar === p;
            });
            var done = items.filter(function (d) {
              return results[d.id] && results[d.id].passed;
            }).length;
            var m = PILLAR_META[p];
            return (
              '<div class="pillar-tile">' +
              '<p class="pillar-tile-name" style="color:' +
              m.color +
              '">' +
              p +
              ' · ' +
              m.label +
              ' — ' +
              done +
              '/' +
              items.length +
              '</p>' +
              '<ul>' +
              items
                .map(function (d) {
                  var passed = results[d.id] && results[d.id].passed;
                  return '<li class="' + (passed ? 'passed' : '') + '">' + esc(d.title) + '</li>';
                })
                .join('') +
              '</ul>' +
              '</div>'
            );
          })
          .join('');

        body.innerHTML =
          '<div class="rating-box">' +
          '<p class="rating-caption">Design review rating</p>' +
          '<p class="rating-score" data-testid="final-score">' +
          score.overall +
          '%</p>' +
          '<div class="stars-row" role="img" aria-label="' +
          score.stars +
          ' of 3 stars">' +
          starsHtml +
          '</div>' +
          '<p class="rating-breakdown">Review items ' +
          score.objScore +
          '% (first-attempt accuracy &amp; hint use) · knowledge check ' +
          score.quizScore +
          '% (' +
          score.correct +
          '/' +
          score.total +
          ')</p>' +
          '<p class="rating-verdict">' +
          (score.stars === 3
            ? 'Lead-architect material: you defended every decision, mostly on the first attempt.'
            : score.stars === 2
              ? 'Solid sign-off. A second pass — fewer hints, more first-attempt stamps — reaches three stars.'
              : 'Signed, with notes. Re-run the sheets where the stamps said REVISE; the explanations are the lesson.') +
          '</p>' +
          '</div>' +
          '<div style="margin-top:0.75rem" data-testid="focus-areas">' +
          '<h3 class="inner-title-sm" style="display:flex;align-items:center;gap:0.375rem">' +
          icon('Crosshair', 'modal-head-icon') +
          ' Focus areas — where to spend your next study block</h3>' +
          focusHtml +
          '</div>' +
          '<div style="margin-top:0.75rem">' +
          '<h3 class="inner-title-sm">Recap by mastery pillar</h3>' +
          '<div class="pillar-grid">' +
          pillarHtml +
          '</div>' +
          '</div>' +
          '<div style="margin-top:0.75rem">' +
          '<h3 class="inner-title-sm" style="display:flex;align-items:center;gap:0.375rem">' +
          icon('GraduationCap', 'modal-head-icon') +
          ' What to learn next</h3>' +
          '<ul class="nextstep-list">' +
          NEXT_STEPS.map(function (s) {
            return '<li>' + icon('BookOpen') + '<span>' + esc(s) + '</span></li>';
          }).join('') +
          '</ul>' +
          '</div>' +
          '<div class="modal-actions">' +
          '<button type="button" class="btn btn-outline-ink" data-role="review-notes">Review field notes</button>' +
          '<button type="button" class="btn btn-wax" data-testid="restart-from-modal">' +
          icon('RotateCcw') +
          ' Restart the lab</button>' +
          '</div>';

        qs(body, '[data-role="review-notes"]').addEventListener('click', close);
        qs(body, '[data-testid="restart-from-modal"]').addEventListener('click', function () {
          close();
          LabStore.actions.resetAll();
        });
      },
    });
  }

  return {
    esc: esc,
    el: el,
    qs: qs,
    icon: icon,
    PILLAR_META: PILLAR_META,
    pillarBadge: pillarBadge,
    sheetIntro: sheetIntro,
    nextSheetButton: nextSheetButton,
    stampMarkHtml: stampMarkHtml,
    draftSelect: draftSelect,
    gauge: gauge,
    accordion: accordion,
    glossaryAccordionHtml: glossaryAccordionHtml,
    reviewItemCard: reviewItemCard,
    reviewItemsFor: reviewItemsFor,
    openLayer: openLayer,
    openCompletionModal: openCompletionModal,
  };
})();
