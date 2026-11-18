// ===================================================================
// Building B — Service Riser · Inspector (circuit 08 quiz)
// (js/quiz.js — 1:1 port of InspectorModule from modules/desks.tsx)
//
// QA contract carried over from the original: picking an option is
// transient; the per-question "Lock in answer" button is THE
// validating action; after lock ONLY the selected option is colored
// (green if right, red if wrong) and the correct option is never
// revealed on a wrong answer.
// ===================================================================
(function () {
  'use strict'

  const D = window.LabData
  const U = window.LabUI

  function renderInspector(lab) {
    const s = lab.state()
    const mode = s.mode
    if (!mode) return U.el('div')
    const items = D.QUIZ.filter((q) => q.mode === mode)
    const lockedCount = items.filter((q) => s.quiz[q.id] !== undefined).length
    const allLocked = items.length > 0 && lockedCount === items.length
    const submitted = s.quizDone[s.mode || 'medium'] === true
    const correctCount = items.filter((q) => s.quiz[q.id] === q.answer).length

    const children = []

    if (!submitted) {
      children.push(U.el('p', { class: 'bench-intro' },
        mode === 'medium'
          ? 'Answer each question, then press “Lock in answer” — the explanation appears and the answer is final (' + lockedCount + '/7 locked). Submit to the inspector once all seven are locked.'
          : 'Scenario items: pick the best answer and lock it in — near-miss answers are wrong on purpose (' + lockedCount + '/7 locked). Submit when all seven are locked.'))
    } else {
      children.push(U.statusLine(correctCount === items.length ? 'ok' : 'idle',
        'Submitted — ' + correctCount + '/' + items.length + ' correct. Explanations remain open below for review.'))
    }

    const ol = U.el('ol', { class: 'quiz-list' })
    items.forEach((q, qi) => {
      const locked = s.quiz[q.id]
      const pick = s.quizPicks[q.id]
      const isLocked = locked !== undefined
      const shown = isLocked ? locked : pick

      const li = U.el('li', { class: 'quiz-item' })
      li.appendChild(U.el('p', { class: 'quiz-prompt' },
        U.el('span', { class: 'quiz-qnum' }, 'Q' + (qi + 1) + '. '), q.prompt))

      const group = U.el('div', { class: 'quiz-options', role: 'radiogroup', 'aria-label': q.prompt })
      q.options.forEach((opt, oi) => {
        const isShown = shown === oi
        const isRight = oi === q.answer
        let cls = 'quiz-option'
        if (isLocked && isShown) cls += isRight ? ' is-right' : ' is-wrong'
        else if (!isLocked && isShown) cls += ' is-picked'
        const btn = U.el('button', {
          type: 'button',
          role: 'radio',
          'aria-checked': isShown ? 'true' : 'false',
          class: cls + ((isLocked || submitted) ? ' is-locked' : ''),
          'data-k': 'qopt-' + q.id + '-' + oi,
        },
          U.el('span', { class: 'quiz-letter' }, String.fromCharCode(65 + oi) + '. '),
          isLocked && isShown ? U.el('span', { 'aria-hidden': 'true', class: 'quiz-mark' }, isRight ? '✓' : '✗') : null,
          opt,
          isLocked && isShown
            ? U.el('span', { class: 'quiz-yours' + (isRight ? ' is-right' : ' is-wrong') },
                'your answer — ' + (isRight ? 'correct' : 'incorrect'))
            : null)
        btn.addEventListener('click', () => lab.pick(q.id, oi))
        if (isLocked || submitted) btn.disabled = true
        group.appendChild(btn)
      })
      li.appendChild(group)

      if (!isLocked && !submitted && pick !== undefined) {
        const row = U.el('div', { class: 'quiz-lockrow' })
        const lockBtn = U.el('button', { type: 'button', class: 'btn btn-primary btn-inspector', 'data-k': 'qlock-' + q.id }, 'Lock in answer')
        lockBtn.addEventListener('click', () => lab.lock(q.id))
        row.appendChild(lockBtn)
        row.appendChild(U.el('span', { class: 'quiz-locknote' },
          'the explanation appears once locked — the answer is final'))
        li.appendChild(row)
      }

      if (isLocked) {
        li.appendChild(U.el('p', { class: 'quiz-lockedline', role: 'status' },
          U.el('span', { 'aria-hidden': 'true', class: 'quiz-lockeddot' }, '● '),
          'answer locked'))
        li.appendChild(U.el('p', { class: 'quiz-explain ' + (locked === q.answer ? 'is-ok' : 'is-bad') },
          U.el('strong', null, locked === q.answer ? 'Correct. ' : 'Not this one. '),
          q.explain))
      }
      ol.appendChild(li)
    })
    children.push(ol)

    if (!submitted) {
      const submit = U.el('button', {
        type: 'button',
        class: 'btn btn-primary btn-inspector btn-submit',
        'data-k': 'qsubmit',
      }, 'Submit answers to the inspector')
      submit.disabled = !allLocked
      submit.addEventListener('click', () => lab.submitQuiz())
      children.push(submit)
    }

    return U.bench({
      id: 'inspector-desk',
      title: 'Inspector',
      kicker: mode === 'medium' ? 'knowledge check — 7 questions' : 'scenario exam — 7 items',
      hue: '#8A4B2F',
      children,
    })
  }

  window.LabQuiz = { renderInspector }
})()
