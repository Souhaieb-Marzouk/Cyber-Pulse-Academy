// ── Cloud Ward · assessment surfaces: quiz (C5), debrief (C6), completion (C7) ──
// Faithful port of src/components/lab/assess.tsx.
// Quiz mechanics (fixes-ledger QA-4/QA-14 + color contract R3):
//   one question at a time; the chosen answer locks on “Lock answer”; the student
//   MUST advance with “Next question”; after locking, ONLY the selected option is
//   colored (green if right, red if wrong) — the correct option is never revealed
//   by color; the feedback text states it.
(function (global) {
  'use strict';

  const D = global.CW_DATA;
  const U = global.CW_UI;
  const store = global.CW_store;
  const act = global.CW_actions;
  const derived = global.CW_derived;
  const el = U.el;
  const icon = U.icon;

  function card(attrs, children) {
    return el('section', Object.assign({ class: 'card' }, attrs || {}), children);
  }
  function label(text, cls) { return U.wardLabel(text, cls); }

  // ══ BOARD CERTIFICATION QUIZ ══════════════════════════════════════════════
  function openQuizDrawer() {
    U.openDrawer({
      title: 'Board certification quiz',
      wide: true,
      onClose: function () { /* pinned dies with this drawer instance (QA-14 parity) */ },
      build: function (body) {
        let pinned = null; // stays on the locked item until the drawer closes

        function render() {
          const s = store.get();
          const mode = s.mode || 'medium';
          const quiz = mode === 'hard' ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
          const submittedCount = Object.keys(s.quizSubmitted).length;
          const correct = quiz.filter(function (q) { return s.quizSubmitted[q.id] && s.quizAnswers[q.id] === q.answer; }).length;
          const firstUnanswered = quiz.findIndex(function (q) { return !s.quizSubmitted[q.id]; });
          const step = pinned !== null ? pinned : (firstUnanswered === -1 ? quiz.length - 1 : Math.max(0, firstUnanswered));
          const qi = Math.min(step, quiz.length - 1);
          const q = quiz[qi];
          const chosen = s.quizAnswers[q.id];
          const done = !!s.quizSubmitted[q.id];
          const isRight = chosen === q.answer;
          const allAnswered = firstUnanswered === -1;
          const nextUnanswered = quiz.findIndex(function (item, i) { return i > qi && !s.quizSubmitted[item.id]; });
          const canJumpTo = function (i) { return !!s.quizSubmitted[quiz[i].id] || i === firstUnanswered; };

          body.innerHTML = '';

          body.appendChild(el('p', { class: 'drawer-intro', text: mode === 'hard'
            ? 'Scenario-based items: apply the ward’s lessons, do not recite them. Each answer locks on submit, then Next question is mandatory.'
            : 'Concept questions with a teaching explanation after every answer. Each answer locks on submit, then Next question is mandatory.' }));

          body.appendChild(el('div', { class: 'quiz-status' }, [
            el('span', { class: 'quiz-status-l', html: icon('ClipboardCheck', 15, 'teal-text') + ' Question ' + (qi + 1) + ' of ' + quiz.length }),
            el('span', { text: 'Score: ' + correct + '/' + submittedCount + ' correct · ' + submittedCount + '/' + quiz.length + ' answered' }),
          ]));

          // progress pips — answered items are review-only; future items are locked
          const pips = el('div', { class: 'pips', role: 'tablist', 'aria-label': 'Quiz progress' });
          quiz.forEach(function (item, i) {
            const answered = !!s.quizSubmitted[item.id];
            const active = i === qi;
            const right = answered && s.quizAnswers[item.id] === item.answer;
            const pip = el('button', {
              type: 'button',
              role: 'tab',
              'aria-selected': active ? 'true' : 'false',
              'aria-label': 'Question ' + (i + 1) + (answered ? ' (answered)' : ''),
              disabled: !canJumpTo(i) ? true : null,
              class: 'pip' + (active ? ' pip-active' : answered ? (right ? ' pip-right' : ' pip-wrong') : ' pip-future') + (!canJumpTo(i) ? ' pip-locked' : ''),
              text: (i + 1) + (answered ? (right ? ' ✓' : ' ×') : ''),
              onclick: function () { pinned = i; render(); },
            });
            pips.appendChild(pip);
          });
          body.appendChild(pips);

          // question card
          const qCard = card(null, [
            el('div', { class: 'q-prompt-row' }, [
              el('span', { class: 'q-num mono', text: String(qi + 1) }),
              el('p', { class: 'q-prompt', text: q.prompt }),
            ]),
            (function () {
              const group = el('div', { class: 'q-options', role: 'radiogroup', 'aria-label': 'Question ' + (qi + 1) + ' options' });
              q.options.forEach(function (opt, oi) {
                const selected = chosen === oi;
                // R3 contract: color only the selected option, only after locking.
                let cls = 'q-opt';
                if (done && selected) cls += isRight ? ' q-opt-right' : ' q-opt-wrong';
                const btn = el('button', {
                  type: 'button',
                  role: 'radio',
                  'aria-checked': selected ? 'true' : 'false',
                  disabled: done ? true : null,
                  class: cls + (done ? ' q-opt-done' : ''),
                  onclick: function () { act.answerQuiz(q.id, oi); render(); },
                }, [
                  el('span', { class: 'q-letter' + (selected ? ' q-letter-on' : ''), text: String.fromCharCode(65 + oi) }),
                  el('span', { class: 'q-opt-text', text: opt }),
                  done && selected ? el('span', { class: 'q-mark', html: isRight ? icon('CheckCircle2', 15, 'green') : icon('XCircle', 15, 'crimson') }) : null,
                ]);
                group.appendChild(btn);
              });
              return group;
            })(),
            !done
              ? el('button', {
                  type: 'button',
                  disabled: chosen === undefined ? true : null,
                  class: 'lock-btn' + (chosen === undefined ? ' btn-dead' : ''),
                  text: 'Lock answer',
                  onclick: function () {
                    act.submitQuiz(q.id);
                    pinned = qi; // stay on the answered item so the teaching feedback is read before advancing
                    render();
                  },
                })
              : (function () {
                  const wrap = el('div', {});
                  wrap.appendChild(el('div', { class: 'quiz-feedback ' + (isRight ? 'fb-right' : 'fb-wrong'), html: '<strong>' + (isRight ? 'Correct. ' : 'Not this time. ') + '</strong>' + (!isRight ? 'The correct answer is <strong>“' + U.esc(q.options[q.answer]) + '”</strong>. ' : '') + U.esc(q.why) }));
                  if (nextUnanswered !== -1) {
                    wrap.appendChild(el('button', {
                      type: 'button',
                      class: 'next-btn',
                      text: 'Next question → (' + (nextUnanswered + 1) + ')',
                      onclick: function () { pinned = nextUnanswered; render(); },
                    }));
                  } else {
                    wrap.appendChild(el('div', { class: 'quiz-end-box', html: icon('CheckCircle2', 15) + ' ' + (allAnswered ? 'All questions answered — review any item with the pips above, then close.' : 'Later items still locked — answer them in order.') }));
                  }
                  return wrap;
                })(),
          ]);
          body.appendChild(qCard);
        }
        render();
      },
    });
  }

  // ══ DISCHARGE SUMMARY (debrief / C6) ══════════════════════════════════════
  function openDebriefDrawer() {
    U.openDrawer({
      title: 'Discharge summary — field notes',
      wide: true,
      build: function (body) {
        const deb = D.DEBRIEF;
        const wrap = el('div', { class: 'debrief-wrap' });
        body.appendChild(wrap);

        // 1. detection table
        const sec1 = el('section', {}, [
          el('h3', { class: 'serif sec-title', text: 'Detection opportunities (what to watch, and the logic you’d write)' }),
        ]);
        const table = el('div', { class: 'table-scroll' });
        let rowsHtml = deb.detectionRows.map(function (r) {
          return '<tr><td>' + U.esc(r[0]) + '</td><td>' + U.esc(r[1]) + '</td><td>' + U.esc(r[2]) + '</td></tr>';
        }).join('');
        table.innerHTML =
          '<table class="detect-table"><thead><tr>' +
          '<th>Signal</th><th>Example detection logic</th><th>Data source</th></tr></thead>' +
          '<tbody class="mono">' + rowsHtml + '</tbody></table>';
        sec1.appendChild(table);
        sec1.appendChild(el('p', { class: 'mt2', html: U.rich(deb.attackHtml) }));
        wrap.appendChild(sec1);

        // 2. response playbook
        wrap.appendChild(el('section', {}, [
          el('h3', { class: 'serif sec-title', text: 'Response playbook (the reflex to build)' }),
          el('ol', { class: 'ol-list' }, deb.playbook.map(function (t) { return el('li', { html: t }); })),
        ]));

        // 3. blue-team takeaways
        wrap.appendChild(el('section', {}, [
          el('h3', { class: 'serif sec-title', text: 'Blue-team takeaways (CV0-004 cross-links)' }),
          el('ul', { class: 'ul-list' }, deb.blueTeam.map(function (t) { return el('li', { text: t }); })),
        ]));

        // 4. red-team mindset
        wrap.appendChild(el('section', {}, [
          el('h3', { class: 'serif sec-title', text: 'Red-team mindset (know what the other side values)' }),
          el('ul', { class: 'ul-list' }, deb.redTeam.map(function (t) { return el('li', { text: t }); })),
        ]));

        // 5. official references
        wrap.appendChild(el('section', {}, [
          el('h3', { class: 'serif sec-title', text: 'Official references (open in new tab)' }),
          el('div', { class: 'ref-links' }, deb.references.map(function (r) {
            return el('a', { class: 'link ref-link', href: r.href, target: '_blank', rel: 'noopener noreferrer', html: r.label + icon('ExternalLink', 12) });
          })),
        ]));

        act.markSeen('seenDebrief');
      },
    });
  }

  // ══ COMPLETION MODAL (C7) ═════════════════════════════════════════════════
  function openCompletionModal() {
    const s = store.get();
    const mode = s.mode || 'medium';
    const objs = D.ALL_OBJECTIVES[mode];
    const prog = derived.progressOf(s);
    const score = derived.scoreOf(s);
    const stars = derived.starsOf(s);
    const focusAreas = derived.focusAreasOf(s);
    const quiz = mode === 'hard' ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
    const quizCorrect = quiz.filter(function (q) { return s.quizSubmitted[q.id] && s.quizAnswers[q.id] === q.answer; }).length;
    const pillars = ['P1', 'P2', 'P3', 'P4'].map(function (p) {
      return {
        p: p,
        total: objs.filter(function (o) { return o.pillar === p; }).length,
        done: objs.filter(function (o) { return o.pillar === p && s.checks[o.id] && s.checks[o.id].everPassed; }).length,
      };
    });

    U.openModal({
      label: 'Lab completion',
      onClose: function () { /* backdrop/ESC/back-button all just close (parity) */ },
      build: function (cardEl, close) {
        cardEl.appendChild(el('div', { class: 'finish-top' }, [
          el('div', { class: 'finish-icon', html: icon('GraduationCap', 26) }),
          el('div', {}, [U.wardLabel(mode === 'hard' ? 'Night shift complete' : 'Day rounds complete', 'mt3')]),
          el('h2', { class: 'serif finish-title', text: 'Patient discharged — you ran the ward' }),
          el('p', { class: 'finish-recap', text: D.COMPLETION_COPY.recap.replace('{alerts}', mode === 'hard' ? 'ten' : 'six') }),
          el('div', { class: 'finish-tiles' }, [
            el('div', { class: 'finish-tile' }, [
              el('div', { class: 'mono finish-score', text: score + '%' }),
              el('div', { class: 'tile-caption', text: 'score' }),
            ]),
            el('div', { class: 'finish-tile' }, [
              el('div', { html: U.stars(stars) }),
              el('div', { class: 'tile-caption', text: stars + '/5 stars · first-try & hints' }),
            ]),
          ]),
        ]));

        // mastery recap by pillar
        const recap = el('div', { class: 'mt5' }, [
          el('div', {}, [U.wardLabel('Mastery recap by pillar — ' + prog.passed + '/' + objs.length + ' objectives', 'mb2')]),
        ]);
        pillars.forEach(function (p) {
          recap.appendChild(el('div', { class: 'pillar-row' }, [
            el('span', { class: 'pillar-name', text: D.PILLAR_LABEL[p.p] }),
            el('div', { class: 'pillar-track' }, [el('div', { class: 'pillar-fill', style: 'width:' + (p.total ? (p.done / p.total) * 100 : 0) + '%' })]),
            el('span', { class: 'mono pillar-count', text: p.done + '/' + p.total }),
          ]));
        });
        recap.appendChild(el('div', { class: 'quiz-line', html: 'Board quiz: <strong>' + quizCorrect + '/' + quiz.length + '</strong> correct' }));
        cardEl.appendChild(recap);

        // R8: focus areas derived from this run's actual evidence
        const focus = el('div', { class: 'focus-box mt5' }, [
          el('div', { class: 'focus-title serif', html: icon('Target', 14) + ' Focus areas before your next shift' }),
        ]);
        if (focusAreas.length === 0) {
          focus.appendChild(el('p', { class: 'focus-clean', text: D.COMPLETION_COPY.noWeakAreas }));
        } else {
          focus.appendChild(el('ul', { class: 'focus-list' }, focusAreas.map(function (f) {
            return el('li', { class: 'focus-item', html: '<strong>' + U.esc(f.title) + '.</strong> <span class="muted">' + U.esc(f.action) + '</span>' });
          })));
        }
        cardEl.appendChild(focus);

        // what to study next
        cardEl.appendChild(el('div', { class: 'next-box mt5' }, [
          el('div', { class: 'next-title serif', html: icon('BookMarked', 14) + ' What to study next' }),
          el('ul', { class: 'next-list' }, D.COMPLETION_COPY.nextStudy.map(function (t) {
            return el('li', { html: icon('ArrowRight', 13, 'arrow-icon') + '<span>' + t + '</span>' });
          })),
        ]));

        const backBtn = el('button', { type: 'button', class: 'back-btn', text: 'Back to the ward', onclick: close });
        cardEl.appendChild(backBtn);
        setTimeout(function () { backBtn.focus(); }, 0); // focus moves into the modal on open (R7)
      },
    });
  }

  global.CW_ASSESS = {
    openQuizDrawer: openQuizDrawer,
    openDebriefDrawer: openDebriefDrawer,
    openCompletionModal: openCompletionModal,
  };
})(this);
