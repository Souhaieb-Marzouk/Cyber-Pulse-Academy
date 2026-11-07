// ---------------------------------------------------------------------------
// quiz.js — Q-900 Sign-off sheet: the Hard-mode memo, the sequential
// knowledge check (fix #2: one question at a time, enforced progression,
// locked answers, resume pointer) and the completion gate + modal trigger.
// 1:1 port of SignoffSheet.tsx.
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-undef
var SheetsQuiz = (function () {
  'use strict';

  var U = LabUI;
  var icon = U.icon;
  var esc = U.esc;

  function store() {
    return LabStore.getState();
  }

  function firstUnanswered() {
    var submitted = store().quiz.submitted;
    for (var i = 0; i < submitted.length; i++) {
      if (!submitted[i]) return Math.max(0, i);
    }
    return 0;
  }

  function SignoffSheet() {
    var root = U.el('article');
    var state0 = store();
    var mode0 = state0.mode;
    var bank = mode0 === 'medium' ? QUIZ_MEDIUM : QUIZ_HARD;
    var current = firstUnanswered();
    var lastSubmittedCount = state0.quiz.submitted.filter(Boolean).length;

    var review = mode0 === 'hard' ? U.reviewItemCard('OBJ-H10') : null;

    root.innerHTML =
      U.sheetIntro(
        'Q-900',
        'Sign-off — knowledge check, field notes, memo',
        '<p>The review closes here: ' +
          bank.length +
          ' knowledge-check items, the field notes your team keeps, and' +
          (mode0 === 'hard'
            ? ' the lead architect’s memo with five exact values from your sheets.'
            : ' then the completion rating.') +
          '</p>',
      ) +
      '<section class="sheet-card rounded-md p-4" aria-label="Knowledge check" data-role="quiz-section"></section>' +
      '<section class="sheet-card rounded-md p-4" aria-label="Field notes">' +
      '<h3 class="inner-title">Field notes — what the team keeps</h3>' +
      '<h4 class="inner-title-sm" style="margin-top:0.75rem">Detection opportunities (data source → signal)</h4>' +
      '<div style="margin-top:0.375rem;overflow-x:auto"><table class="data-table plain"><thead><tr>' +
      '<th>Data source</th><th>Signal</th><th>First response</th></tr></thead><tbody>' +
      '<tr><td class="log-mono" style="font-weight:600">Slow-query log</td><td>Seq Scan on a large table; rows examined ≫ rows returned</td><td>Add/repair the index the plan names</td></tr>' +
      '<tr><td class="log-mono" style="font-weight:600">Connection metrics</td><td>Primary connection saturation; pool wait queues</td><td>Pooling + route reporting to replicas/warehouse</td></tr>' +
      '<tr><td class="log-mono" style="font-weight:600">Replication lag metric</td><td>Lag alert after failover or load spike</td><td>Route must-be-current reads to primary</td></tr>' +
      '<tr><td class="log-mono" style="font-weight:600">Cache hit ratio</td><td>Falling ratio or cold start after restart</td><td>Pre-warm hot keys; review TTL/invalidation</td></tr>' +
      '<tr><td class="log-mono" style="font-weight:600">Backup posture audit</td><td>PITR off, retention &lt; requirement, no out-of-account copy</td><td>Re-enable + schedule copies + rehearse restore</td></tr>' +
      '<tr><td class="log-mono" style="font-weight:600">Audit log</td><td>Unusual bulk reads of PII (T1213) or snapshot downloads (T1530)</td><td>Revoke credentials, investigate, rotate secrets</td></tr>' +
      '</tbody></table></div>' +
      '<h4 class="inner-title-sm" style="margin-top:1rem">Mitigation recommendations</h4>' +
      '<ul class="takeaways">' +
      '<li><strong>Choose by access pattern</strong>: ACID + interrelated → relational; known key lookups → key-value; flexible records → document; traversal → graph; append-only scale → wide-column; repeats → cache.</li>' +
      '<li><strong>Replication triangle</strong>: read scaling → read replicas (accept lag); availability → synchronous multi-AZ standby (accept write latency); global writes → multi-primary (accept conflicts).</li>' +
      '<li><strong>Backups</strong>: PITR for RPO minutes; your own snapshot schedule (automated backups can die with the instance); copies outside region <em>and</em> account; rehearse the restore — it creates a new instance.</li>' +
      '<li><strong>Performance</strong>: index to the access pattern, pool connections, cache repeats, warehouse OLAP — and measure before and after.</li>' +
      '<li><strong>Security</strong>: encryption at rest/in transit, identity-based access (no static credentials), private endpoints, audit logging; keep snapshots as private as the database (T1530).</li>' +
      '</ul>' +
      '<div class="grid-2" style="margin-top:1rem">' +
      '<div class="takeaway-blue"><h4>Blue-team takeaways</h4><ul class="takeaways" style="margin-top:0.375rem">' +
      '<li>Alert on slow-query plans, not just latency — the plan names the fix.</li>' +
      '<li>Read-after-write misses are a consistency-model bug, not a caching bug.</li>' +
      '<li>Test failover and restore on a schedule; measure RTO, don’t estimate it.</li>' +
      '<li>Audit logs answer “who read what” — without them, T1213 is invisible.</li>' +
      '</ul></div>' +
      '<div class="takeaway-red"><h4>Red-team mindset (defensive use only)</h4><ul class="takeaways" style="margin-top:0.375rem">' +
      '<li>Static DB credentials in app config are the classic first step → valid accounts (T1078) → collection.</li>' +
      '<li>Backups and snapshots inherit their storage bucket’s exposure — as attack surface they are the database (T1530).</li>' +
      '<li>A publicly reachable database endpoint is the cheapest find an attacker will ever make.</li>' +
      '<li>Think in guarantees: every toggle on the Resilience Desk is also a detection opportunity.</li>' +
      '</ul></div>' +
      '</div>' +
      '<p class="body-xs" style="margin-top:0.75rem">References: ' +
      MITRE_LINKS.map(function (m) {
        return (
          '<a class="log-mono" style="color:var(--wax);text-decoration:underline;text-decoration-color:rgba(179,64,42,0.4)" href="' +
          esc(m.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          esc(m.id) +
          '</a>'
        );
      }).join(' ') +
      ' (official ATT&amp;CK records, new tab) · <a class="log-mono" style="color:var(--wax);text-decoration:underline;text-decoration-color:rgba(179,64,42,0.4)" href="' +
      esc(COMPTIA_REF.url) +
      '" target="_blank" rel="noopener noreferrer">CompTIA CV0-004 objectives ↗</a></p>' +
      '</section>' +
      '<section class="sheet-card rounded-md p-4 complete-card" style="margin-top:1rem" aria-label="Complete the review">' +
      '<h3 class="inner-title">Complete the design review</h3>' +
      '<p class="body-xs" data-role="complete-note" style="margin-top:0.25rem"></p>' +
      '<button type="button" class="btn btn-verified" data-testid="complete-review" style="margin-top:0.75rem"></button>' +
      '<p class="complete-note" data-role="gate-note" style="display:none">Finish every review item and the knowledge check to unlock sign-off.</p>' +
      '</section>';

    var quizSection = root.querySelector('[data-role="quiz-section"]');

    // ---------- memo (Hard) ----------
    if (mode0 === 'hard') {
      root.insertBefore(review.el, quizSection);
      var memo = U.el('section', 'sheet-card rounded-md p-4');
      memo.setAttribute('aria-label', 'Sign-off memo');
      memo.innerHTML =
        '<h3 class="inner-title">Lead architect’s memo</h3><div class="grid-2" style="margin-top:0.75rem" data-role="memo"></div>';
      var memoWrap = memo.querySelector('[data-role="memo"]');
      var memoInputs = {};
      MEMO_FIELDS.forEach(function (f) {
        var label = U.el('label', 'field-label', esc(f.label));
        var input = U.el('input', 'text-input log-mono');
        input.type = 'text';
        input.setAttribute('data-testid', 'memo-' + f.id);
        input.placeholder = f.placeholder;
        input.addEventListener('input', function () {
          var v = input.value;
          LabStore.actions.updateEnv(function (e) {
            var m = Object.assign({}, e.signoffMemo);
            m[f.id] = v;
            return Object.assign({}, e, { signoffMemo: m });
          });
        });
        label.appendChild(input);
        memoWrap.appendChild(label);
        memoInputs[f.id] = input;
      });
      root.insertBefore(memo, quizSection);
    }

    var completeNote = root.querySelector('[data-role="complete-note"]');
    var completeBtn = root.querySelector('[data-testid="complete-review"]');
    var gateNote = root.querySelector('[data-role="gate-note"]');
    completeBtn.addEventListener('click', function () {
      var st = store();
      if (!st.quiz.finished) return;
      var approved = LabStore.approvalsCount(st.results, st.mode);
      var defs = objectivesForMode(st.mode);
      if (approved !== defs.length) return;
      LabStore.actions.completeLab();
      U.openCompletionModal(LabStore.computeScore(st.results, st.quiz, st.mode));
    });

    // ---------- sequential quiz ----------
    function renderQuiz(state) {
      // Preserve keyboard focus across the rebuild, like React reconciliation.
      var activeTid =
        document.activeElement && quizSection.contains(document.activeElement)
          ? document.activeElement.getAttribute('data-testid')
          : null;
      var active = document.activeElement;
      var activeCaret = null;
      if (active && active.tagName === 'INPUT') activeCaret = active.selectionStart;
      var quiz = state.quiz;
      var submittedCount = quiz.submitted.filter(Boolean).length;
      var head =
        '<div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:0.5rem">' +
        '<h3 class="inner-title">Knowledge check — ' +
        (mode0 === 'medium' ? 'concepts (7 items)' : 'scenario triage (7 items)') +
        '</h3>' +
        '<span class="log-mono body-xs" data-testid="quiz-progress">' +
        submittedCount +
        '/' +
        bank.length +
        ' submitted</span>' +
        '</div>';
      var body = '';

      if (!quiz.finished) {
        // progress chips
        body +=
          '<ol class="quiz-chips" aria-label="Question progress">' +
          bank
            .map(function (qq, qi) {
              var cls = 'quiz-chip' + (quiz.submitted[qi] ? ' done' : qi === current ? ' current' : '');
              return (
                '<li' +
                (qi === current ? ' aria-current="step"' : '') +
                '><span class="' +
                cls +
                '">' +
                (qi + 1) +
                '</span></li>'
              );
            })
            .join('') +
          '</ol>';

        var q = bank[current];
        var submitted = quiz.submitted[current] || false;
        var chosen = quiz.answers[current] == null ? null : quiz.answers[current];
        var isLast = current === bank.length - 1;

        body +=
          '<div class="quiz-card" tabindex="-1" data-testid="quiz-' +
          current +
          '">' +
          '<p class="quiz-q"><span class="qnum">Q' +
          (current + 1) +
          '.</span>' +
          esc(q.scenario) +
          '</p>' +
          '<div class="quiz-options">' +
          q.options
            .map(function (opt, oi) {
              var isChosen = chosen === oi;
              // R3: after submission ONLY the selected answer is highlighted —
              // green when correct, red when wrong. The correct answer is never
              // revealed on a wrong submission.
              var showState = submitted && isChosen;
              var cls = 'quiz-opt';
              if (showState && oi === q.correct) cls += ' chosen-correct';
              else if (showState && oi !== q.correct) cls += ' chosen-wrong';
              else if (isChosen) cls += ' chosen';
              var lead = showState
                ? oi === q.correct
                  ? icon('CheckCircle2', '', 'correct answer')
                  : icon('XCircle', '', 'incorrect answer')
                : '<span class="quiz-radio' + (isChosen ? ' chosen' : '') + '" aria-hidden="true"></span>';
              return (
                '<button type="button" class="' +
                cls +
                '" data-testid="quiz-' +
                current +
                '-opt-' +
                oi +
                '"' +
                (submitted ? ' disabled' : '') +
                ' aria-pressed="' +
                String(isChosen) +
                '">' +
                lead +
                '<span>' +
                esc(opt) +
                '</span></button>'
              );
            })
            .join('') +
          '</div>';

        if (submitted) {
          var ok = chosen === q.correct;
          body +=
            '<div class="quiz-feedback ' +
            (ok ? 'correct' : 'wrong') +
            '" aria-live="polite"><strong class="' +
            (ok ? 'verdict-correct' : 'verdict-wrong') +
            '">' +
            (ok ? 'Correct. ' : 'Not this time. ') +
            '</strong>' +
            esc(q.explanation) +
            '</div>';
        } else {
          body +=
            '<button type="button" class="btn btn-sm btn-default" style="margin-top:0.5rem;min-height:44px" data-testid="quiz-submit-' +
            current +
            '"' +
            (chosen === null ? ' disabled' : '') +
            '>Submit answer</button>';
        }
        body += '</div>';

        // R2: progression is enforced — after submission the only way forward is Next.
        if (submitted) {
          body +=
            '<div class="quiz-nextrow">' +
            '<p class="quiz-locked-note">Answer locked. ' +
            (isLast ? 'This is the final item.' : 'Continue to the next question.') +
            '</p>' +
            '<button type="button" class="btn btn-sm btn-wax" data-testid="' +
            (isLast ? 'quiz-finish' : 'quiz-next-' + current) +
            '">' +
            (isLast ? 'Complete the knowledge check' : 'Next question') +
            ' ' +
            icon('ChevronRight') +
            '</button>' +
            '</div>';
        }
      } else {
        var correctSoFar = bank.reduce(function (a, qq, i) {
          return a + (quiz.submitted[i] && quiz.answers[i] === qq.correct ? 1 : 0);
        }, 0);
        body +=
          '<p class="quiz-result-line" data-testid="quiz-result-line">Knowledge check complete — ' +
          correctSoFar +
          '/' +
          bank.length +
          ' correct.</p>';
      }

      quizSection.innerHTML = head + body;

      // restore focus to the same control after the rebuild
      if (activeTid) {
        var again = quizSection.querySelector('[data-testid="' + activeTid + '"]');
        if (again) {
          again.focus({ preventScroll: true });
          if (activeCaret != null && again.tagName === 'INPUT') {
            try {
              again.setSelectionRange(activeCaret, activeCaret);
            } catch (e) {
              /* not a text input */
            }
          }
        }
      }

      // wire events
      if (!quiz.finished) {
        var q = bank[current];
        var submitted = quiz.submitted[current] || false;
        if (!submitted) {
          Array.prototype.forEach.call(
            quizSection.querySelectorAll('[data-testid^="quiz-' + current + '-opt-"]'),
            function (btn) {
              btn.addEventListener('click', function () {
                var oi = Number(btn.getAttribute('data-testid').slice(-1));
                LabStore.actions.answerQuiz(current, oi);
              });
            },
          );
          var submitBtn = quizSection.querySelector('[data-testid="quiz-submit-' + current + '"]');
          if (submitBtn)
            submitBtn.addEventListener('click', function () {
              LabStore.actions.submitQuizItem(current);
            });
        } else {
          var isLast2 = current === bank.length - 1;
          var nextBtn = quizSection.querySelector(
            isLast2 ? '[data-testid="quiz-finish"]' : '[data-testid="quiz-next-' + current + '"]',
          );
          if (nextBtn) {
            nextBtn.addEventListener('click', function () {
              if (isLast2) {
                LabStore.actions.finishQuiz();
              } else {
                current = Math.min(bank.length - 1, current + 1);
                renderQuiz(store());
                var card = quizSection.querySelector('[data-testid="quiz-' + current + '"]');
                if (card)
                  requestAnimationFrame(function () {
                    card.focus();
                  });
              }
            });
            // the original mounts this button with autoFocus after submission
            if (submittedCount !== lastSubmittedCount) {
              lastSubmittedCount = submittedCount;
              requestAnimationFrame(function () {
                nextBtn.focus();
              });
            }
          }
        }
      }
    }

    function update(state) {
      var quiz = state.quiz;
      // Re-render the quiz card on every store change (mirrors the React render);
      // focus is preserved by renderQuiz, and a fresh submission focuses Next.
      renderQuiz(state);
      if (review) review.update(state);
      // memo values (only when not focused, to avoid fighting the typist)
      if (mode0 === 'hard') {
        MEMO_FIELDS.forEach(function (f) {
          var input = memoInputs[f.id];
          if (document.activeElement !== input) {
            input.value = state.env.signoffMemo[f.id] || '';
          }
        });
      }
      // completion gate
      var defs = objectivesForMode(state.mode);
      var approved = LabStore.approvalsCount(state.results, state.mode);
      var allApproved = approved === defs.length;
      var quizDone = quiz.finished;
      var canComplete = allApproved && quizDone;
      var score = LabStore.computeScore(state.results, quiz, state.mode);
      completeNote.textContent =
        (allApproved ? 'All review items approved.' : approved + '/' + defs.length + ' review items approved.') +
        ' ' +
        (quizDone ? 'Knowledge check complete.' : 'Knowledge check pending.');
      completeBtn.disabled = !canComplete;
      completeBtn.innerHTML = 'Sign off the estate (' + score.overall + '% · ' + score.stars + '★)';
      gateNote.style.display = canComplete ? 'none' : '';
    }

    renderQuiz(store());
    update(store());
    return { el: root, update: update };
  }

  return { SignoffSheet: SignoffSheet };
})();
