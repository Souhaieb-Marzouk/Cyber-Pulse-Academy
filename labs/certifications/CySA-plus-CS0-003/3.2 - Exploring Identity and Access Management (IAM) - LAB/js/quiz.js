// ─── The Access Bureau — Final Exam (C5) + completion modal (C7) + scoring ───
// Ported from FinalExam.tsx and the ResultsModal in IAMLab.tsx.

(function () {
  'use strict'

  var el = Bureau.el
  var icon = Bureau.icon

  function quizItems(mode) {
    return QUIZ.filter(function (q) { return q.mode === mode })
  }

  function scoreFor(mode) {
    var s = LabStore.getState()
    var objectives = objectivesFor(mode)
    var items = objectives.map(function (o) { return { o: o, t: s.tickets[o.id] } })
    var ticketAvg = items.reduce(function (acc, it) { return acc + BureauChecks.ticketCredit(it.t) }, 0) / items.length
    var qItems = quizItems(mode)
    var correct = qItems.filter(function (q) { return s.quiz[q.id] === q.answer }).length
    var quizTotal = qItems.length
    var quizPct = quizTotal ? correct / quizTotal : 0
    var scorePct = Math.round(100 * (0.7 * ticketAvg + 0.3 * quizPct))
    var stars = Math.max(1, Math.min(5, Math.round(ticketAvg * 5)))
    return { items: items, correct: correct, quizTotal: quizTotal, scorePct: scorePct, stars: stars }
  }

  // ── FinalExam desk ───────────────────────────────────────────────────────────
  function FinalExam() {
    var s = LabStore.getState()
    var mode = s.mode
    if (!mode) return el('div', {})
    var items = quizItems(mode)
    var isMedium = mode === 'medium'

    var card = Bureau.BureauCard({
      icon: icon('GraduationCap', 20),
      title: isMedium ? 'Final Exam — concept check (6 items)' : 'Final Exam — incident scenarios (7 items)',
      subtitle: isMedium
        ? 'Concept questions. Read carefully — the explanation after each answer is part of the lesson.'
        : 'Scenario triage. Each item needs an applied decision, not a definition.',
    })

    var body = card.querySelector('.bureau-card-body')

    if (!s.quizSubmitted) {
      var meta = el('p', { class: 'exam-meta font-mono', 'aria-live': 'polite' })
      var list = el('div', { class: 'exam-list' })

      function refreshMeta() {
        var answered = items.filter(function (q) { return LabStore.getState().quiz[q.id] }).length
        meta.textContent = 'answered ' + answered + '/' + items.length +
          ' — the stamp unlocks when every question is answered'
        submitBtn.disabled = answered < items.length
      }

      items.forEach(function (q, i) {
        var fs = el('fieldset', { class: 'q-fieldset' },
          el('legend', { text: 'question ' + (i + 1) }))
        if (q.evidence) {
          fs.appendChild(el('p', { class: 'evidence', text: 'EVIDENCE — ' + q.evidence }))
        }
        fs.appendChild(el('p', { class: 'q-prompt', text: q.prompt }))
        var group = Bureau.RadioGroup({
          value: s.quiz[q.id] || '',
          ariaLabel: 'Question ' + (i + 1),
          className: 'as-stack',
          onValueChange: function (v) {
            LabStore.setQuizAnswer(q.id, v)
            refreshMeta()
          },
          items: q.options.map(function (o) {
            return {
              value: o.id,
              id: q.id + '-' + o.id,
              node: el('label', { class: 'radio-label', for: q.id + '-' + o.id, text: o.text }),
            }
          }),
        })
        fs.appendChild(group)
        list.appendChild(fs)
      })

      var submitBtn = Bureau.btn('default', null, 'btn-stamp h44',
        icon('Lock', 16, 'mr-icon') + '<span>SUBMIT EXAM FOR STAMPING</span>')
      submitBtn.addEventListener('click', function () {
        LabStore.submitQuiz() // app subscriber opens the results modal automatically
      })

      var submitRow = el('div', { class: 'submit-row' }, submitBtn)
      body.appendChild(meta)
      body.appendChild(list)
      body.appendChild(submitRow)
      refreshMeta()
      return card
    }

    // ── submitted: score panel + per-item review ──────────────────────────────
    var score = items.filter(function (q) { return s.quiz[q.id] === q.answer }).length
    var pct = Math.round((score / items.length) * 100)

    body.appendChild(el('div', { class: 'exam-result' },
      el('p', { class: 'exam-result-title', text: 'Exam stamped' }),
      el('p', { class: 'exam-result-score font-mono', text: score + '/' + items.length + ' correct (' + pct + '%)' })))

    items.forEach(function (q, i) {
      var chosen = s.quiz[q.id]
      var ok = chosen === q.answer
      var item = el('div', { class: 'review-item ' + (ok ? 'is-ok' : 'is-bad') },
        el('p', { class: 'review-q' },
          el('span', { class: 'review-qnum font-mono', text: 'Q' + (i + 1) + '.' }),
          q.prompt))
      var chosenText = '—'
      q.options.forEach(function (o) { if (o.id === chosen) chosenText = o.text })
      item.appendChild(el('p', { class: 'review-ans font-mono' },
        'your answer: ',
        el('span', { class: ok ? 'ans-ok' : 'ans-bad', text: chosenText })))
      if (!ok) {
        var correctText = ''
        q.options.forEach(function (o) { if (o.id === q.answer) correctText = o.text })
        item.appendChild(el('p', { class: 'review-ans font-mono' },
          'correct: ', el('span', { class: 'ans-ok', text: correctText })))
      }
      item.appendChild(el('p', { class: 'review-why' },
        el('strong', { class: 'font-serif', text: 'Why — ' }),
        q.explanation))
      body.appendChild(item)
    })
    return card
  }

  // ── ResultsModal (C7) ────────────────────────────────────────────────────────
  function openResultsModal() {
    var s = LabStore.getState()
    var mode = s.mode
    var sc = scoreFor(mode)

    var starRow = el('div', {
      class: 'stars', role: 'img',
      'aria-label': sc.stars + ' of 5 stars',
    })
    for (var i = 1; i <= 5; i++) {
      starRow.appendChild(el('span', {
        class: 'star ' + (i <= sc.stars ? 'star-filled' : 'star-empty'),
        html: icon('Star', 24),
      }))
    }

    var scored = el('div', { class: 'results-score-box' },
      el('p', { class: 'results-stamp', text: 'Verified' }),
      el('p', { class: 'results-pct font-mono', text: sc.scorePct + '%' }),
      starRow,
      el('p', { class: 'stars-note', text: 'Stars reflect first-attempt stamps and hint usage. Ticket work counts 70%, the exam 30%.' }))

    var recap = el('div', { class: 'results-recap' },
      el('p', { class: 'recap-label font-mono', text: 'Objective recap by pillar' }))

    var pillars = ['U', 'R', 'D', 'M']
    pillars.forEach(function (p) {
      var rows = sc.items.filter(function (it) { return it.o.pillar === p })
      if (rows.length === 0) return
      var card = el('div', { class: 'pillar-recap' })
      card.appendChild(el('div', { class: 'recap-badge' }, Bureau.PillarBadge(p)))
      var ul = el('ul', { class: 'recap-list' })
      rows.forEach(function (it) {
        var done = !!(it.t && it.t.completed)
        ul.appendChild(el('li', { class: 'recap-row' },
          el('span', { class: 'recap-mark font-mono ' + (done ? 'is-ok' : 'is-bad'), text: done ? '✓' : '✗' }),
          el('span', { class: done ? '' : 'is-dim', text: it.o.title })))
      })
      card.appendChild(ul)
      recap.appendChild(card)
    })

    var stampedCount = sc.items.filter(function (it) { return it.t && it.t.completed }).length
    var otherPosting = mode === 'medium' ? 'Lead Investigator (Hard)' : 'Analyst (Medium)'
    var nextBox = el('div', { class: 'next-box' },
      el('p', { class: 'next-title font-serif', text: 'What to learn next' }),
      el('ul', { class: 'next-list' },
        el('li', {}, 'You stamped ', el('span', { class: 'font-mono next-strong', text: stampedCount + '/' + sc.items.length }), ' tickets and scored ', el('span', { class: 'font-mono next-strong', text: sc.correct + '/' + sc.quizTotal }), ' on the exam.'),
        el('li', { text: 'Read the Debrief desk — the detection logic there is the next step from “recognizing” to “engineering”.' }),
        el('li', { text: 'Verify every MITRE ID against attack.mitre.org (links in the Debrief).' }),
        el('li', { text: 'Next in the course: CySA+ Domain 3 continues with logging, detection and response tooling.' }),
        el('li', {}, 'Try the other posting: use ', el('span', { class: 'font-mono next-strong', text: 'RESET' }), ' and pick the ' + otherPosting + ' card at intake.')))

    var closeBtn = Bureau.btn('default', null, 'results-close h44',
      icon('X', 16, 'mr-icon') + '<span>CLOSE THE CASE FILE</span>')

    var content = el('div', {},
      el('p', { class: 'sr-only', text: 'Your score, star rating and objective recap grouped by mastery pillar.' }),
      scored,
      recap,
      nextBox,
      closeBtn)

    closeBtn.addEventListener('click', function () {
      var overlay = closeBtn.closest('.modal-overlay')
      if (overlay) {
        var x = overlay.querySelector('.modal-close')
        if (x) x.click()
      }
    })

    Bureau.openModal({
      variant: 'dialog',
      contentClass: 'results-modal',
      title: el('p', { class: 'results-title font-serif', text: 'CASE CLOSED' }),
      description: el('p', {
        class: 'results-subtitle font-mono',
        text: mode === 'medium' ? 'Analyst posting — guided audit complete' : 'Lead investigator posting — incident worked end to end',
      }),
      content: content,
      onClose: function () {
        if (!LabStore.getState().resultsSeen) LabStore.markResultsSeen()
      },
    })
  }

  window.BureauQuiz = { FinalExam: FinalExam, openResultsModal: openResultsModal, scoreFor: scoreFor, quizItems: quizItems }
})()
