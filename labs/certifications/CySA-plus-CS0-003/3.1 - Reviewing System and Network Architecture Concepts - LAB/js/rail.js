// ─── CyberLab "Drafting Room" — survey checklist rail + sign-off modal ───────
// Vanilla port of ObjectivesRail.tsx (objective tracker, C4) and
// CompletionModal.tsx (C7). Subscriptions here live for the whole lab session;
// app.js clears them on reset.

const PULSE_MAP = {
  M1: 'zone-map', M2: 'stack', M3: 'rack', M4: 'rack', M5: 'hosts-win',
  M6: 'hosts-linux', M7: 'snippets', M8: 'behaviors', M9: 'access', M10: 'trust',
  M11: 'seg-panel', M12: 'ref-shelf', H1: 'zone-map', H2: 'rack', H3: 'hosts-win',
  H4: 'hosts-linux', H5: 'rule-editor', H6: 'chain', H7: 'stack', H8: 'access', H9: 'access',
}
const HINT_LABELS = ['Nudge', 'Direction', 'Demonstration']

function ObjectivesRail() {
  const s = LabStore.state
  const mode = s.mode ?? 'medium'
  const objs = objectivesFor(mode)

  const counter = h('span', { class: 'rail-count' })
  const progress = ProgressBar(0, true)
  const list = h('ol', { class: 'rail-list' })
  const cards = objs.map((o, i) => ObjectiveCard(o, i + 1))
  list.append(...cards.map((c) => c.el))

  const rail = h(
    'aside',
    { 'aria-label': 'Survey checklist — lab objectives', class: 'rail' },
    h(
      'div',
      { class: 'rail-panel' },
      h('div', { class: 'rail-head' },
        h('span', { class: 'chip-icon', html: labIcon('target') }),
        h('h2', { class: 'rail-title' }, 'Survey Checklist'),
        counter,
      ),
      progress.el,
      mode === 'hard'
        ? h('p', { class: 'rail-banner rose' }, 'Audit rules: one optional nudge per objective (costs score). Strict validation — near-misses are rejected with a rationale.')
        : h('p', { class: 'rail-banner green' }, 'Guided mode: hints are free (they cost stars, never progress). Wrong checks teach — they never penalize.'),
      list,
    ),
  )

  const sync = (s) => {
    const done = objs.filter((o) => s.obj[o.id]?.done ?? false).length
    counter.textContent = `${done}/${objs.length}`
    progress.set((done / objs.length) * 100)
    cards.forEach((c) => c.sync(s))
  }
  sync(LabStore.state)
  LabStore.subscribe(sync)
  return rail
}

function ObjectiveCard(def, index) {
  let expanded = index <= 1
  const run0 = LabStore.state.obj[def.id] ?? { done: false, attempts: 0, hintsUsed: 0, firstAttemptPass: false }

  // head
  const iconSlot = h('span', { class: 'obj-icon' })
  const attempts = h('span', { class: 'obj-attempts' })
  const title = h('span', { class: 'obj-title' })
  const chev = h('span', { class: 'obj-chev', html: labIcon('chevronRight') })
  const headBtn = h(
    'button',
    { type: 'button', 'aria-expanded': 'false', class: 'obj-head' },
    iconSlot,
    h('span', { class: 'obj-head-main' },
      h('span', { class: 'obj-head-meta' },
        h('span', { class: 'obj-id' }, `${def.id}·${String(index).padStart(2, '0')}`),
        PillarBadge(def.pillar),
        attempts,
      ),
      title,
    ),
    chev,
  )
  headBtn.addEventListener('click', () => {
    expanded = !expanded
    body.hidden = !expanded
    headBtn.setAttribute('aria-expanded', String(expanded))
    chev.classList.toggle('is-open', expanded)
  })

  // body
  const choicesRefs = []
  const multiRefs = []
  const body = h('div', { class: 'obj-body' })
  body.append(
    h('p', { class: 'obj-task' }, def.task),
    h('p', { class: 'obj-anchor' }, 'Anchors: ', def.anchor),
  )
  def.choices?.forEach((grp) =>
    grp.items.forEach((item) => {
      const ac = AnswerChoice({
        prompt: item.prompt,
        options: item.options,
        value: LabStore.state.answers[item.key] ?? null,
        onChange: (v) => LabStore.setAnswer(item.key, v),
      })
      choicesRefs.push({ ac, key: item.key })
      body.append(ac.el)
    }),
  )
  if (def.multi) {
    const count = h('span', { class: 'multi-count' })
    const legend = h('legend', { class: 'multi-legend' }, def.multi.prompt + ' ', count)
    const boxes = def.multi.options.map((opt) => {
      const input = h('input', { type: 'checkbox', class: 'lab-check', 'aria-label': opt.label })
      input.addEventListener('change', () => {
        const cur = LabStore.state.multi[def.multi.key] ?? []
        LabStore.setMulti(def.multi.key, input.checked ? [...cur, opt.id] : cur.filter((x) => x !== opt.id))
      })
      const row = h('label', { class: 'multi-row' }, input, h('span', null, opt.label))
      multiRefs.push({ input, opt, row })
      return row
    })
    body.append(h('fieldset', { class: 'multi-set' }, legend, h('div', { class: 'multi-rows' }, boxes)))
  }

  // actions
  const checkBtn = h('button', { type: 'button', class: 'btn-primary obj-btn' }, 'Check results')
  checkBtn.addEventListener('click', () => LabStore.checkObjective(def.id))
  const whereBtn = h(
    'button',
    { type: 'button', class: 'btn-ghost obj-btn', title: 'Jump to the relevant environment panel' },
    h('span', { class: 'chip-icon', html: labIcon('mapPin') }), 'Where to look',
  )
  whereBtn.addEventListener('click', () => {
    LabStore.setSheet(def.sheet)
    LabStore.pulseTarget(PULSE_MAP[def.id] ?? def.sheet)
    expanded = true
    body.hidden = false
    headBtn.setAttribute('aria-expanded', 'true')
    chev.classList.add('is-open')
  })
  const hintBtn = h('button', { type: 'button', class: 'btn-ghost obj-btn' }, h('span', { class: 'chip-icon', html: labIcon('lightbulb') }), 'Hint')
  hintBtn.addEventListener('click', () => LabStore.revealHint(def.id))
  body.append(h('div', { class: 'obj-actions' }, checkBtn, whereBtn, hintBtn))

  // hints + result + feedback
  const hintsBox = h('div', { class: 'obj-hints' })
  const resultBox = h('div', { class: 'obj-result', role: 'status' })
  const feedback = h('p', { class: 'obj-feedback' })
  body.append(hintsBox, resultBox, feedback)

  const sync = (s) => {
    const run = s.obj[def.id] ?? { done: false, attempts: 0, hintsUsed: 0, firstAttemptPass: false }

    iconSlot.innerHTML = labIcon(run.done ? 'checkCircle2' : 'circle')
    iconSlot.className = 'obj-icon ' + (run.done ? 'txt-done' : '')
    attempts.textContent = run.attempts > 0 && !run.done ? `×${run.attempts} tried` : ''
    title.textContent = def.title
    title.className = 'obj-title ' + (run.done ? 'txt-done' : '')

    choicesRefs.forEach(({ ac, key }) => ac.refresh(s.answers[key] ?? null))
    multiRefs.forEach(({ input, opt }) => {
      input.checked = (s.multi[def.multi.key] ?? []).includes(opt.id)
    })
    if (def.multi) {
      const cnt = (s.multi[def.multi.key] ?? []).length
      body.querySelector('.multi-count').textContent = `(${cnt}/${def.multi.pick})`
    }

    const cap = s.mode === 'hard' ? 1 : 3
    hintBtn.querySelector('span + *') // noop guard
    hintBtn.innerHTML = ''
    hintBtn.append(h('span', { class: 'chip-icon', html: labIcon('lightbulb') }), `Hint ${run.hintsUsed}/${cap}`)
    hintBtn.disabled = run.hintsUsed >= cap

    hintsBox.replaceChildren()
    if (run.hintsUsed > 0) {
      const tiers = [def.hints.nudge, def.hints.direction, def.hints.demo].slice(0, run.hintsUsed)
      tiers.forEach((htxt, i) => {
        hintsBox.append(
          h('p', { class: 'hint-tier' }, h('span', { class: 'hint-label' }, `${HINT_LABELS[i]}:`), ' ', htxt),
        )
      })
    }

    const result = LabStore.results[def.id]
    resultBox.replaceChildren()
    if (result) {
      resultBox.className = 'obj-result ' + (result.pass ? 'is-pass' : 'is-fail')
      resultBox.append(PassFailIcon(result.pass), h('span', null, result.msg))
    }
    feedback.textContent = run.done ? `✔ ${def.feedback}` : ''
    feedback.classList.toggle('is-visible', run.done)
  }
  sync(LabStore.state)

  return {
    el: h('li', { class: 'obj-card' + (run0.done ? ' is-done' : '') }, headBtn, body),
    sync(s) {
      sync(s)
      const done = !!(LabStore.state.obj[def.id]?.done)
      this.el.classList.toggle('is-done', done)
    },
  }
}

// ─── Completion modal (C7) — Survey sign-off ─────────────────────────────────
function CompletionModal() {
  let modal = null
  LabStore.subscribe(() => {
    if (LabStore.completionOpen && !modal) modal = openCompletion()
    else if (!LabStore.completionOpen && modal) {
      modal.close()
      modal = null
    }
  })

  function openCompletion() {
    const s = LabStore.state
    const mode = s.mode ?? 'medium'
    const sum = scoreSummary(s)
    const objs = objectivesFor(mode)
    const quiz = quizFor(mode)
    const allDone = sum.objectivesDone === sum.objectivesTotal

    const stars = h('div', { class: 'stars-row', 'aria-label': `${sum.stars} of 5 stars` })
    for (let i = 1; i <= 5; i++) {
      stars.append(h('span', { class: 'star' + (i <= sum.stars ? ' is-on' : ''), html: labIcon('star') }))
    }

    const pillarRecap = ['P1', 'P2', 'P3', 'P4'].map((p) => {
      const listP = objs.filter((o) => o.pillar === p)
      const doneP = listP.filter((o) => s.obj[o.id]?.done).length
      const label = PILLAR_META[p].label
      return h(
        'div',
        { class: 'pillar-recap-row' },
        h('span', { class: 'pillar-recap-label ' + PILLAR_CLASS[p] }, `${p} ${label}`),
        h('div', { class: 'pillar-recap-track' }, h('div', { class: 'pillar-recap-fill', style: { width: `${listP.length ? (doneP / listP.length) * 100 : 0}%` } })),
        h('span', { class: 'pillar-recap-count' }, `${doneP}/${listP.length}`),
      )
    })

    const ledger = h('ul', { class: 'ledger-list' },
      objs.map((o) => {
        const r = s.obj[o.id]
        return h('li', { class: 'ledger-row' },
          h('span', { class: 'ledger-dot' + (r?.done ? ' is-done' : ''), 'aria-hidden': 'true' }),
          h('span', { class: 'ledger-id' }, o.id),
          h('span', { class: 'ledger-title' + (r?.done ? '' : ' txt-dim') }, o.title),
          r?.done && !r.firstAttemptPass ? h('span', { class: 'ledger-attempts' }, `×${r.attempts}`) : null,
        )
      }),
    )

    const box = Modal({
      onClose: () => { modal = null },
      boxClass: 'completion-box',
    })
    box.box.append(
      h('div', { class: 'completion-head' },
        h('div', { class: 'completion-award' }, h('span', { class: 'award-icon', html: labIcon('award') })),
        h('h2', { class: 'completion-title' }, allDone ? 'Survey Certified' : 'Progress Report'),
        h('p', { class: 'completion-sub' }, `${LAB_META.org} · ${LAB_META.drawingNo} · `, allDone ? 'Architecture survey signed off.' : 'Sign-off available when every objective passes.'),
      ),
      h('div', { class: 'completion-stats' },
        stars,
        h('p', { class: 'completion-mastery' },
          'mastery ', h('span', { class: 'mastery-num' }, `${Math.round(sum.mastery * 100)}%`),
          h('span', { class: 'mastery-side' }, `first-attempt passes ${Math.round(sum.firstPassRatio * 100)}%`),
          h('span', { class: 'mastery-side' }, `quiz ${sum.quizCorrect}/${sum.quizTotal}`),
          sum.hintsUsed > 0 ? h('span', { class: 'mastery-side' }, `hints ${sum.hintsUsed}`) : null,
        ),
        mode === 'hard' && sum.hintsUsed > 0
          ? h('p', { class: 'completion-warn' }, 'Nudges used cost score — auditors travel light.')
          : null,
      ),
      h('div', { class: 'completion-pillars' },
        h('p', { class: 'completion-kicker' }, 'Mastery pillars recap'),
        h('div', { class: 'pillar-recap' }, pillarRecap),
      ),
      h('div', { class: 'completion-ledger' },
        h('p', { class: 'completion-kicker' }, 'Objective ledger'),
        ledger,
      ),
      h('div', { class: 'completion-next' },
        h('p', { class: 'completion-kicker amber' }, h('span', { class: 'chip-icon', html: labIcon('bookMarked') }), 'Where to go next'),
        h('ul', { class: 'disc-list next-list' },
          h('li', null, 'Re-run the other difficulty mode — the environment holds surprises in each (Hard re-wires the rack against you).'),
          h('li', null, 'Continue Domain 1 of CS0-003: attack methodology frameworks and the indicators they produce.'),
          h('li', null, 'Explain the Meridian design out loud, zone by zone, from memory — the true self-test.'),
          h('li', null, 'Review any objective below 100% first-attempt in the ledger above; re-check teaches better than re-reading.'),
        ),
      ),
      h('div', { class: 'completion-actions' },
        h('button', { type: 'button', class: 'btn-primary', 'data-autofocus': true }, allDone ? 'Back to the lab' : 'Keep working'),
      ),
    )
    box.box.querySelector('.completion-actions .btn-primary').addEventListener('click', () => LabStore.setCompletionOpen(false))
    return box
  }
}

Object.assign(globalThis, { ObjectivesRail, CompletionModal, PULSE_MAP, HINT_LABELS })
