/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab 101 — js/quiz.js
   Knowledge Check instrument. Flow per question (identical to the original):
     1. pick ONE option (re-selectable until committed),
     2. press CHECK ANSWER (disabled until a pick exists),
     3. the answer LOCKS; only the picked option is highlighted — green when
        correct, red when wrong; the correct option is never revealed in green
        on a wrong submission; the rationale explains right AND wrong options,
     4. NEXT QUESTION is mandatory; question N+1 stays disabled until N is
        checked; the view auto-advances and the Next control focuses it.
   The set can only be finished after every question is checked. No re-answers.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const Quiz = (() => {
  const SET = () => (Lab.mode === 'hard' ? HARD_QUIZ : MEDIUM_QUIZ);

  function isUnlocked(qi) {
    const set = SET();
    if (Lab.quizSubmitted) return false;
    return qi === 0 || !!Lab.quizChecked[set[qi - 1].id];
  }

  /* ------------------------------- templates ------------------------------- */

  function rationaleHTML(q, picked) {
    const ok = picked === q.answer;
    const label = ok
      ? 'Correct — why'
      : `The defensible answer is ${String.fromCharCode(65 + q.answer)} — why`;
    return `
      <div class="quiz-rationale" role="status">
        ${UI.micro(label, ok ? 'green' : 'orange')}
        <p>${UI.esc(q.explanation)}</p>
      </div>`;
  }

  function questionBody(q, qi) {
    const set = SET();
    const picked = Lab.quizAnswers[q.id];
    const isChecked = !!Lab.quizChecked[q.id];
    const unlocked = isUnlocked(qi);
    const controls = [];

    for (let oi = 0; oi < q.options.length; oi++) {
      const isPicked = picked === oi;
      const showGreen = isChecked && isPicked && oi === q.answer;
      const showRed = isChecked && isPicked && oi !== q.answer;
      const dim = (Lab.quizSubmitted || isChecked || !unlocked) && !isPicked;
      const cls = [
        'quiz-opt',
        showGreen ? 'correct' : showRed ? 'wrong' : isPicked ? 'picked' : '',
        dim ? 'dimmed' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const mark = showGreen
        ? UI.icon('check-circle-2', 'opt-mark ok') + '<span class="sr-only">correct</span>'
        : showRed
          ? UI.icon('x-circle', 'opt-mark bad') + '<span class="sr-only">incorrect</span>'
          : '';
      const disabled = Lab.quizSubmitted || isChecked || !unlocked;
      controls.push(`
        <button type="button" data-qopt="${q.id}" data-oi="${oi}" data-fk="quizopt-${q.id}-${oi}"
          class="${cls}" aria-pressed="${isPicked}" ${disabled ? 'disabled' : ''}>
          <span class="opt-letter">${String.fromCharCode(65 + oi)}</span>${UI.esc(q.options[oi])}${mark}
        </button>`);
    }

    let controlsHTML = '';
    if (!Lab.quizSubmitted) {
      const canCheck = picked !== undefined && !isChecked;
      let c = `<button type="button" id="quiz-check-${q.id}" data-qcheck="${q.id}" data-fk="quizcheck-${q.id}"
                 class="btn-quiz-check" ${canCheck ? '' : 'disabled'}>${isChecked ? 'Answer locked ✓' : 'Check answer'}</button>`;
      if (isChecked && qi < set.length - 1) {
        c += `<button type="button" class="btn-quiz-next" data-qnext="${q.id}">Next question →</button>`;
      }
      if (!unlocked && !isChecked) {
        c += `<span class="locked-note">complete question ${qi} to unlock this one</span>`;
      }
      controlsHTML = `<div class="quiz-controls">${c}</div>`;
    }

    const rationale = isChecked || Lab.quizSubmitted ? rationaleHTML(q, picked) : '';

    return `
      <div id="quiz-q-${q.id}">
        <div class="quiz-q-head">
          <span class="qnum">Q${qi + 1}</span>
          <p class="scenario">${UI.esc(q.scenario)}</p>
        </div>
        <div class="quiz-opts">${controls.join('')}</div>
        ${controlsHTML}
        ${rationale}
      </div>`;
  }

  function render() {
    const set = SET();
    const checkedCount = set.filter((q) => Lab.quizChecked[q.id]).length;
    const score = set.filter((q) => Lab.quizAnswers[q.id] === q.answer).length;
    const allChecked = checkedCount === set.length;
    const stats = computeStats(Lab.objectives, Lab.mode ?? 'medium');
    const isHard = Lab.mode === 'hard';

    const intro = `
      <section class="panel">
        ${UI.panelHeader(
          isHard ? 'Knowledge check · scenario triage (8)' : 'Knowledge check · concepts (7)',
          UI.micro(
            `checked ${checkedCount}/${set.length}` + (Lab.quizSubmitted ? ` · score ${score}/${set.length}` : ''),
            'bright'
          )
        )}
        ${UI.panelBody(
          isHard
            ? `<p class="drills-note">Eight triage calls, taken in order. Pick one option, CHECK ANSWER to commit — the choice locks and the
              next question opens. Each has exactly one defensible answer; the rationale appears the moment you commit.
              ${stats.complete ? ' Objectives are done; this is the last gate of the shift.' : ''}</p>`
            : `<p class="drills-note">Seven concept questions on Lesson 10.1, taken in order. Pick one option, CHECK ANSWER to commit — the
              choice locks and the next question opens. Read every rationale before moving on.</p>`
        )}
      </section>`;

    const questions = set
      .map((q, qi) => {
        const isChecked = !!Lab.quizChecked[q.id];
        const unlocked = isUnlocked(qi);
        return `<section class="panel quiz-q ${!unlocked && !isChecked ? 'locked' : ''}" data-quiz-qid="${q.id}" aria-label="Question ${qi + 1}">
            <div class="panel-body">${questionBody(q, qi)}</div>
          </section>`;
      })
      .join('');

    const footText = Lab.quizSubmitted
      ? `Submitted — ${score}/${set.length}. Your rationale is the takeaway; the completion modal aggregates everything.`
      : allChecked
        ? 'Every question committed — finish to lock in your score.'
        : `Check all ${set.length} questions to finish (${checkedCount} done).`;

    const footer = `
      <section class="panel" id="quiz-footer-panel">
        <div class="quiz-footer">
          <div class="foot-note-text">${footText}</div>
          <button type="button" id="quiz-submit" class="btn-quiz-submit" ${allChecked && !Lab.quizSubmitted ? '' : 'disabled'}>
            ${UI.icon('send')} ${Lab.quizSubmitted ? 'Submitted ✓' : 'Finish knowledge check'}
          </button>
        </div>
      </section>`;

    return `<div class="stack" id="quiz-region">${intro}${questions}${footer}</div>`;
  }

  /* ------------------------- fine-grained updates --------------------------- */

  function updateQuestion(qid) {
    const set = SET();
    const qi = set.findIndex((q) => q.id === qid);
    if (qi === -1) return;
    const q = set[qi];
    const section = document.querySelector(`.quiz-q[data-quiz-qid="${qid}"]`) ||
      document.getElementById(`quiz-q-${qid}`)?.closest('.quiz-q');
    if (!section) return;
    const isCheckedNow = !!Lab.quizChecked[qid];
    const unlocked = isUnlocked(qi);
    section.classList.toggle('locked', !unlocked && !isCheckedNow);
    UI.rerenderWithFocus(section, () => {
      section.querySelector('.panel-body').innerHTML = questionBody(q, qi);
    });
  }

  function refreshHeader() {
    /* re-render the whole quiz region on submit-level changes */
    const region = document.getElementById('quiz-region');
    if (!region) return;
    region.outerHTML = render();
  }

  function updateFooter() {
    const foot = document.getElementById('quiz-footer-panel');
    if (!foot) return;
    const set = SET();
    const checkedCount = set.filter((q) => Lab.quizChecked[q.id]).length;
    const score = set.filter((q) => Lab.quizAnswers[q.id] === q.answer).length;
    const allChecked = checkedCount === set.length;
    const footText = Lab.quizSubmitted
      ? `Submitted — ${score}/${set.length}. Your rationale is the takeaway; the completion modal aggregates everything.`
      : allChecked
        ? 'Every question committed — finish to lock in your score.'
        : `Check all ${set.length} questions to finish (${checkedCount} done).`;
    foot.innerHTML = `
      <div class="quiz-footer">
        <div class="foot-note-text">${footText}</div>
        <button type="button" id="quiz-submit" class="btn-quiz-submit" ${allChecked && !Lab.quizSubmitted ? '' : 'disabled'}>
          ${UI.icon('send')} ${Lab.quizSubmitted ? 'Submitted ✓' : 'Finish knowledge check'}
        </button>
      </div>`;
    /* intro header count too */
    const introMicro = document.querySelector('#quiz-region .panel .panel-header .micro');
    if (introMicro) {
      introMicro.textContent = `checked ${checkedCount}/${set.length}` + (Lab.quizSubmitted ? ` · score ${score}/${set.length}` : '');
    }
  }

  /* ------------------------------ interactions ------------------------------ */

  function onClick(e) {
    const optBtn = e.target.closest('[data-qopt]');
    if (optBtn) {
      if (!optBtn.disabled) {
        const qid = optBtn.getAttribute('data-qopt');
        const oi = Number(optBtn.getAttribute('data-oi'));
        Actions.setQuizAnswer(qid, oi);
        updateQuestion(qid);
      }
      return true;
    }
    const checkBtn = e.target.closest('[data-qcheck]');
    if (checkBtn) {
      if (!checkBtn.disabled) {
        const qid = checkBtn.getAttribute('data-qcheck');
        if (Actions.checkQuizQuestion(qid)) {
          /* re-render every question from here on: unlocking is progressive */
          const set = SET();
          const idx = set.findIndex((x) => x.id === qid);
          for (let i = idx; i < set.length; i++) updateQuestion(set[i].id);
          updateFooter();
          /* auto-advance: bring the first unchecked question into view
             (mirrors the original's checkedCount effect) */
          const next = set.find((q) => !Lab.quizChecked[q.id]);
          if (next) {
            const el = document.getElementById(`quiz-q-${next.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
      return true;
    }
    const nextBtn = e.target.closest('[data-qnext]');
    if (nextBtn) {
      const qid = nextBtn.getAttribute('data-qnext');
      const set = SET();
      const idx = set.findIndex((x) => x.id === qid);
      const next = set[idx + 1];
      if (next) {
        const el = document.getElementById(`quiz-q-${next.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el?.querySelector('button[data-qopt]:not(:disabled)')?.focus();
      }
      return true;
    }
    if (e.target.closest('#quiz-submit')) {
      Actions.submitQuiz();
      return true;
    }
    return false;
  }

  return { render, refreshHeader, updateFooter, onClick };
})();
