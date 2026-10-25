// ─── The Access Bureau — ModeSelect (C1) · TicketQueue (C4) · Debrief (C6) ───
// Ported from ModeSelect.tsx, TicketQueue.tsx and Debrief.tsx.

(function () {
  'use strict'

  var el = Bureau.el
  var icon = Bureau.icon

  var DESK_LABELS = {
    manual: 'Field Manual',
    identity: 'Identity Desk',
    auth: 'Authentication Desk',
    access: 'Access Desk',
    audit: 'Audit Desk',
    federation: 'Wire Room',
  }

  // ── Mode select: “Personnel intake — choose your posting” ────────────────────
  var POSTINGS = [
    {
      mode: 'medium',
      rank: 'MEDIUM',
      title: 'Analyst — Guided Audit',
      icon: 'FileSearch2',
      points: [
        '11 short tickets, worked desk by desk in order',
        '3-tier hint ledger — free to open, small star cost',
        'Forgiving checks: near-misses get teaching notes, never penalties',
        'Concept quiz after practice; supportive debrief',
      ],
      tone: 'posting-medium',
    },
    {
      mode: 'hard',
      rank: 'HARD',
      title: 'Lead Investigator — Live Incident',
      icon: 'ShieldAlert',
      points: [
        '9 broad mandates spanning the whole bureau at once',
        'Noisy evidence with at least two red herrings planted',
        'Strict checks: exact MITRE IDs, sequences, and precise sets',
        'At most ONE nudge — it visibly costs score; efficiency is graded',
      ],
      tone: 'posting-hard',
    },
  ]

  function ModeSelect() {
    var root = el('div', { class: 'intake' })
    var inner = el('div', { class: 'intake-inner' })

    var header = el('header', { class: 'intake-header anim-fade-up' },
      el('div', { class: 'intake-seal', html: icon('Landmark', 32) }),
      el('h1', { class: 'intake-h1 font-serif', text: 'THE ACCESS BUREAU' }),
      el('p', { class: 'intake-tagline font-serif', html: 'Records &amp; Trust Administration for Digital Identities — Interactive Practice Lab' }),
      el('p', { class: 'intake-cert font-mono', html: 'CompTIA CySA+ CS0-003 · Lesson 3.2 · Identity &amp; Access Management' }))

    var brief = el('section', { class: 'intake-brief bureau-card anim-fade-up anim-delay-1', 'aria-labelledby': 'briefing-title' },
      el('h2', { id: 'briefing-title', class: 'intake-brief-title font-serif', html: icon('Fingerprint', 20) + ' <span>' + SCENARIO.headline + '</span>' }))
    SCENARIO.body.forEach(function (p) {
      brief.appendChild(el('p', { class: 'intake-brief-p', text: p }))
    })
    // brief is a bureau-card; move children into its body for consistent padding
    var briefBody = el('div', { class: 'bureau-card-body' })
    Array.prototype.slice.call(brief.querySelectorAll(':scope > :not(.bureau-card-body)')).forEach(function (n) { briefBody.appendChild(n) })
    brief.appendChild(briefBody)

    var postings = el('section', { class: 'intake-postings anim-fade-up anim-delay-2', 'aria-labelledby': 'posting-title' },
      el('h2', { id: 'posting-title', class: 'intake-postings-head font-mono', text: '— Personnel intake · choose your posting —' }))
    var grid = el('div', { class: 'posting-grid' })
    POSTINGS.forEach(function (p) {
      var list = el('ul', { class: 'posting-points' })
      p.points.forEach(function (pt) {
        list.appendChild(el('li', {}, el('span', { class: 'posting-dot', 'aria-hidden': 'true' }), pt))
      })
      var card = el('button', {
        type: 'button',
        class: 'posting-card ' + p.tone,
        'aria-label': p.rank + ' — ' + p.title,
      },
        el('div', { class: 'posting-head' },
          el('span', { class: 'posting-icon', html: icon(p.icon, 24) }),
          el('div', {},
            el('p', { class: 'posting-rank font-mono', text: p.rank }),
            el('p', { class: 'posting-title font-serif', text: p.title }))),
        list,
        el('span', { class: 'posting-cta font-mono', text: 'Take this posting' }))
      card.addEventListener('click', function () {
        LabStore.setMode(p.mode)
      })
      grid.appendChild(card)
    })
    postings.appendChild(grid)

    var fineprint = el('p', {
      class: 'intake-fineprint font-mono',
      html: 'TRAINING SIMULATION · All organizations, accounts, IP addresses (RFC 5737 / RFC 1918) and events are synthetic. ' +
        ORG.name + ' is fictional.<br>Progress auto-saves to this browser. A clearly-labeled RESET is available inside the lab.',
    })

    inner.appendChild(header)
    inner.appendChild(brief)
    inner.appendChild(postings)
    inner.appendChild(fineprint)
    root.appendChild(inner)
    return root
  }

  // ── TicketQueue (objective tracker) ──────────────────────────────────────────
  function TicketQueue(onGoto) {
    var nav = el('nav', { class: 'ticket-queue', 'aria-label': 'Ticket queue — learning objectives' })
    var openId = null

    nav.render = function () {
      var s = LabStore.getState()
      var mode = s.mode
      if (!mode) { nav.innerHTML = ''; return }
      var objectives = objectivesFor(mode)
      var scrollTop = nav.scrollTop
      nav.innerHTML = ''
      openId = objectives.some(function (o) { return o.id === openId }) ? openId : null

      objectives.forEach(function (o, idx) {
        var t = s.tickets[o.id]
        var done = !!(t && t.completed)
        var isOpen = openId === o.id
        var hints = mode === 'hard' ? o.hints.slice(0, 1) : o.hints
        var hintsUsed = t ? t.hintsUsed : 0

        var num = el('span', {
          class: 'ticket-num' + (done ? ' is-done' : ''),
          'aria-hidden': 'true',
          html: done ? icon('Check', 12) : String(idx + 1),
        })
        var badges = el('span', { class: 'ticket-badges' }, Bureau.PillarBadge(o.pillar))
        if (done) badges.appendChild(Bureau.VerifiedChip())
        var title = el('span', { class: 'ticket-title font-serif' + (done ? ' is-done' : ''), text: o.title })
        var caption = el('span', { class: 'ticket-caption font-mono', text: o.id + ' · ' + DESK_LABELS[o.desk] })

        var chevron = el('span', { class: 'ticket-chevron' + (isOpen ? ' is-open' : ''), html: icon('ChevronDown', 16) })
        var btn = el('button', {
          type: 'button', class: 'ticket-btn', 'aria-expanded': isOpen ? 'true' : 'false',
        }, num, el('span', { class: 'ticket-main' }, badges, title, caption), chevron)

        var card = el('article', { class: 'ticket' + (done ? ' is-done' : '') + (isOpen ? ' is-open' : '') }, btn)

        if (isOpen) {
          var panelBody = el('div', { class: 'ticket-body' },
            el('p', { class: 'ticket-task', text: o.task }))

          if (!done) {
            var hintHead = el('div', { class: 'hint-head' },
              el('p', { class: 'hint-label font-mono', html: icon('Lightbulb', 14) + ' hint ledger ' + (mode === 'hard' ? '(one nudge — costs credit)' : '(tier ' + hintsUsed + '/3)') }))
            if (hintsUsed < hints.length) {
              var openTier = Bureau.btn('outline', 'sm', 'hint-open',
                'open tier ' + (hintsUsed + 1))
              openTier.addEventListener('click', function () {
                LabStore.openHint(o.id)
                nav.render()
              })
              hintHead.appendChild(openTier)
            } else {
              hintHead.appendChild(el('span', { class: 'hint-done font-mono', text: 'all tiers open' }))
            }
            var hintBox = el('div', { class: 'hint-box' }, hintHead)
            if (hintsUsed > 0) {
              var ol = el('ol', { class: 'hint-list' })
              hints.slice(0, hintsUsed).forEach(function (h, i) {
                ol.appendChild(el('li', {}, el('span', { class: 'hint-mark font-mono', text: (i + 1) + '→' }), h))
              })
              hintBox.appendChild(ol)
            }
            panelBody.appendChild(hintBox)
          }

          var foot = el('div', { class: 'ticket-foot' })
          var gotoBtn = Bureau.btn('default', 'sm', 'ticket-goto',
            'go to desk ' + icon('ArrowRight', 14, 'ml-icon'))
          gotoBtn.addEventListener('click', function () {
            openId = null
            onGoto(o.desk)
          })
          foot.appendChild(gotoBtn)
          if (t && t.attempts > 0 && !done) {
            foot.appendChild(el('span', { class: 'ticket-returned font-mono', text: 'returned ' + t.attempts + '×' }))
          }
          panelBody.appendChild(foot)

          var wrap = el('div', { class: 'ticket-collapse' }, panelBody)
          card.appendChild(wrap)
          // enter animation (matches the original 0.18s height reveal)
          requestAnimationFrame(function () {
            var target = wrap.scrollHeight
            wrap.animate(
              [{ height: '0px', opacity: 0 }, { height: target + 'px', opacity: 1 }],
              { duration: 180, easing: 'ease' }
            )
          })
        }

        btn.addEventListener('click', function () {
          openId = isOpen ? null : o.id
          nav.render()
        })

        nav.appendChild(card)
      })

      nav.appendChild(el('p', { class: 'queue-note font-mono', html: icon('Lock', 12, 'queue-lock') + '<span>Stamp every ticket to unlock the Final Exam. Progress auto-saves.</span>' }))
      nav.scrollTop = scrollTop
    }

    nav.render()
    return nav
  }

  // ── Debrief / Field Notes (C6) ───────────────────────────────────────────────
  function Debrief() {
    var root = el('div', { class: 'desk-stack' })

    var detGrid = el('div', { class: 'det-grid' })
    DEBRIEF.detections.forEach(function (d) {
      detGrid.appendChild(el('div', { class: 'det-card' },
        el('p', { class: 'det-title font-serif', text: d.title }),
        el('p', { class: 'det-source font-mono', text: d.source }),
        el('p', { class: 'det-logic font-mono', text: d.logic })))
    })
    root.appendChild(Bureau.BureauCard({
      icon: icon('Crosshair', 20),
      title: 'Detection opportunities — what the Bureau should watch',
      subtitle: 'Data sources first, logic second. Every rule below is tuned to a shape you saw in the ledger.',
    }, detGrid))

    var mitTable = el('table', { class: 'mit-table' },
      el('thead', { class: 'mit-thead' }, el('tr', {},
        el('th', { text: 'M-ID' }), el('th', { text: 'Control' }), el('th', { text: 'Bureau note' }))))
    var mitBody = el('tbody', {})
    DEBRIEF.mitigations.forEach(function (m) {
      mitBody.appendChild(el('tr', { class: 'mit-row' },
        el('td', { class: 'mit-id', text: m.id }),
        el('td', { class: 'mit-name', text: m.name }),
        el('td', { class: 'mit-note', text: m.note })))
    })
    mitTable.appendChild(mitBody)
    root.appendChild(Bureau.BureauCard({
      icon: icon('ShieldCheck', 20),
      title: 'Mitigation recommendations — official MITRE M-IDs',
      subtitle: 'Controls mapped the way an incident report would map them.',
    }, el('div', { class: 'ledger-scroll mit-box' }, mitTable)))

    var blueList = el('ul', { class: 'takeaway-list' })
    DEBRIEF.blueTeam.forEach(function (t) { blueList.appendChild(el('li', { text: t })) })
    var redList = el('ul', { class: 'takeaway-list' })
    DEBRIEF.redTeam.forEach(function (t) { redList.appendChild(el('li', { text: t })) })
    root.appendChild(el('div', { class: 'takeaways-grid' },
      Bureau.BureauCard({ icon: icon('ShieldCheck', 20), title: 'Blue-team takeaways' }, blueList),
      Bureau.BureauCard({ icon: icon('Crosshair', 20), title: 'Red-team mindset (know the adversary)' }, redList)))

    var refList = el('ul', { class: 'ref-grid' })
    DEBRIEF.links.forEach(function (l) {
      refList.appendChild(el('li', {},
        el('a', {
          href: l.href, target: '_blank', rel: 'noopener noreferrer', class: 'ref-link',
        }, icon('ExternalLink', 14, 'ref-icon'), l.label)))
    })
    root.appendChild(Bureau.BureauCard({
      icon: icon('ClipboardCheck', 20),
      title: 'Official references (open in a new tab)',
      subtitle: 'Verify every ID in this lab against the source of truth.',
    }, refList))

    return root
  }

  window.BureauSections = { ModeSelect: ModeSelect, TicketQueue: TicketQueue, Debrief: Debrief, DESK_LABELS: DESK_LABELS }
})()
