// ── SIGNALWATCH · QUIZ · DEBRIEF · COMPLETION (js/panels-wrap.js) ───────────
// C5 · C6 · C7 — 1:1 static port of panels-wrap.tsx.

// ═══ QUIZ ════════════════════════════════════════════════════════════════════
function QuizPanel() {
  const mode = lab.mode
  if (!mode) return null
  const answers = lab.quizAnswers
  const checked = lab.quizChecked
  const step = lab.quizStep
  const done = lab.quizDone
  const questions = QUIZ[mode]
  const score = questions.filter((q) => answers[q.id] === q.answer).length
  const gate = quizGateOpen(mode, lab.obj)

  if (!gate) {
    const need = mode === 'medium' ? 7 : 5
    const have = Object.values(lab.obj).filter((o) => o?.solved).length
    return PanelFrame({
      code: 'MOD 10', title: 'KNOWLEDGE CHECK', icon: icon('GraduationCap'),
    },
      h('div', { class: 'gate-box' },
        icon('Lock', 'ic-5 gate-lock'),
        h('p', {}, 'The knowledge check opens after you have cleared ', h('b', {}, `${need} dispatches`), ` (you have ${have}). Work the queue first — the quiz is designed to certify what the dispatches taught.`),
      ),
    )
  }

  // ── submitted state: score + retake ──
  if (done) {
    return PanelFrame({
      code: 'MOD 10', title: 'KNOWLEDGE CHECK', icon: icon('GraduationCap'),
      desc: 'submitted — retake restarts the whole check with fresh answers',
      right: h('span', { class: 'progress-chip' }, `${score}/${questions.length}`),
    }, [
      h('div', { class: 'flex flex-wrap items-center gap-3' },
        h('span', { class: 'score-chip' }, `SCORE: ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%)`),
        h('button', { type: 'button', class: 'btn btn-ghost', 'data-fid': 'quiz-retake', onclick: () => actions.resetQuiz() },
          icon('RotateCcw', 'ic-35'), ' Retake (restarts the check)'),
      ),
      h('p', { class: 'mt-3 text-[11px] leading-relaxed c-zinc-500' },
        'Your answers are locked in this attempt. Retaking resets every question and the score — the per-question feedback above the score remains available in the completion report focus areas.'),
    ])
  }

  // ── active flow: one question at a time, check → lock → mandatory next ──
  const q = questions[Math.min(step, questions.length - 1)]
  const sel = answers[q.id]
  const isChecked = !!checked[q.id]
  const isLast = step >= questions.length - 1
  const correct = isChecked && sel === q.answer

  return PanelFrame({
    code: 'MOD 10', title: 'KNOWLEDGE CHECK', icon: icon('GraduationCap'),
    desc: mode === 'hard' ? 'scenario adjudication — application, not recall' : 'concept check — one question at a time, answer locks on check',
    right: h('span', { class: 'progress-chip' }, `Q${step + 1}/${questions.length}`),
  }, [
    h('ol', { class: 'quiz-pips mb-3', 'aria-label': 'Quiz progress' },
      questions.map((qq, i) =>
        h('li', { 'aria-current': i === step ? 'step' : null },
          h('span', { class: 'pip ' + (checked[qq.id] ? 'pip-checked' : i === step ? 'pip-current' : '') }),
          h('span', { class: 'sr-only' }, checked[qq.id] ? `Question ${i + 1} checked` : i === step ? `Question ${i + 1}, current` : `Question ${i + 1} pending`),
        )),
    ),

    h('div', { class: 'quiz-card' },
      h('div', { class: 'flex items-start gap-2' },
        h('span', { class: 'quiz-qno' }, `Q${step + 1}`),
        h('div', { class: 'min-w-0 flex-1' },
          h('p', { class: 'text-sm leading-snug c-zinc-100' }, q.prompt),
          q.artifact ? h('p', { class: 'mt-0.5 font-mono text-[10px] c-zinc-500' }, 'ARTIFACT: ' + q.artifact) : null,
        ),
      ),
      h('div', { class: 'mt-2 grid gap-1.5 md:grid-cols-2' },
        q.options.map((opt, oi) => {
          const chosen = sel === oi
          // R3 color contract: after validation ONLY the selected option is colored —
          // green when it is correct, red when it is wrong. The correct option is
          // never revealed in green on a wrong submission.
          const state = !isChecked
            ? (chosen ? 'sel' : 'idle')
            : (chosen ? (sel === q.answer ? 'good' : 'bad') : 'idle')
          return h('button', {
            type: 'button', class: 'quiz-opt quiz-opt-' + state + (isChecked ? ' quiz-opt-locked' : ''),
            'data-fid': `opt-${q.id}-${oi}`,
            onclick: () => actions.setQuizAnswer(q.id, oi),
            disabled: isChecked, 'aria-pressed': chosen ? 'true' : 'false',
          },
            h('span', { class: 'font-mono text-[10px] c-zinc-500' }, String.fromCharCode(65 + oi)),
            h('span', { class: 'min-w-0' }, opt),
            state === 'good' ? icon('CheckCircle2', 'ic-4 ml-auto opt-icon c-emerald-400') : null,
            state === 'bad' ? icon('XCircle', 'ic-4 ml-auto opt-icon c-rose-400') : null,
          )
        }),
      ),
      isChecked
        ? h('p', {
            class: 'quiz-explain mt-2 ' + (correct ? 'quiz-explain-good' : 'quiz-explain-warn'),
            role: 'note', 'aria-live': 'polite',
          },
            h('b', { class: 'font-mono' }, correct ? 'CORRECT — ' : 'NOT QUITE — '), q.explain)
        : null,
    ),

    h('div', { class: 'mt-4 flex flex-wrap items-center gap-2' },
      !isChecked
        ? h('button', {
            type: 'button', class: 'btn btn-primary', 'data-fid': 'quiz-check',
            disabled: sel === undefined, onclick: () => actions.checkQuiz(q.id),
          }, icon('ClipboardCheck', 'ic-4'), ' Check answer')
        : isLast
          ? h('button', { type: 'button', class: 'btn btn-primary', 'data-fid': 'quiz-finish', onclick: () => actions.finishQuiz() },
              icon('ClipboardCheck', 'ic-4'), ' Finish knowledge check')
          : h('button', { type: 'button', class: 'btn btn-primary', 'data-fid': 'quiz-next', onclick: () => actions.nextQuiz() },
              'Next question ', icon('ChevronRight', 'ic-4')),
      !isChecked && sel === undefined ? h('span', { class: 'text-[10px] c-zinc-500' }, 'select an option to enable the check') : null,
      isChecked && !isLast ? h('span', { class: 'text-[10px] c-zinc-500' }, 'answer locked — continue to the next question') : null,
    ),
  ])
}

// ═══ DEBRIEF ═════════════════════════════════════════════════════════════════
function DebriefPanel() {
  const mode = lab.mode
  if (!debriefOpen(mode, lab.obj, lab.quizDone) || !mode) {
    return PanelFrame({
      code: 'MOD 11', title: 'DEBRIEF — field notes', icon: icon('BookOpenCheck'),
    },
      h('div', { class: 'gate-box' },
        icon('Lock', 'ic-5 gate-lock'),
        h('p', {}, 'The debrief unlocks when all dispatches are cleared (or the knowledge check is submitted). Finish the watch first.')),
    )
  }
  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 11', title: 'DEBRIEF — field notes', icon: icon('BookOpenCheck'),
      desc: 'what tonight taught your console',
    }, [
      h('div', { class: 'grid gap-3 md:grid-cols-2' },
        h('div', { class: 'kv-card' },
          h('div', { class: 'section-label mb-2 flex items-center gap-1.5' }, icon('Database', 'ic-35'), ' Detection opportunities'),
          h('ul', { class: 'space-y-2 text-[11px] leading-relaxed c-zinc-300' },
            h('li', {}, h('b', { class: 'c-emerald-300' }, 'NetFlow:'), ' ', h('code', { class: 'code-inline' }, 'group.interval ≈ 60s AND sessions ≥ 3 AND dst.owner = unregistered'), ' — generic beacon hunt.'),
            h('li', {}, h('b', { class: 'c-emerald-300' }, 'DNS logs:'), ' ', h('code', { class: 'code-inline' }, 'count(TXT by client, 15m) > 20 AND avg(label_len) > 30 AND single-domain concentration'), '.'),
            h('li', {}, h('b', { class: 'c-emerald-300' }, 'EDR / process:'), ' ', h('code', { class: 'code-inline' }, 'parent = winword.exe AND child = powershell.exe'), '; unsigned binary executed from %TEMP% writing Run keys.'),
            h('li', {}, h('b', { class: 'c-emerald-300' }, 'Mail gateway:'), ' ', h('code', { class: 'code-inline' }, 'spf=fail OR (return-path domain ≠ header.from domain) OR link_text.host ≠ href.host'), '.'),
          ),
        ),
        h('div', { class: 'kv-card' },
          h('div', { class: 'section-label mb-2 flex items-center gap-1.5' }, icon('ShieldCheck', 'ic-35'), ' Mitigation recommendations (official IDs)'),
          h('ul', { class: 'space-y-1.5 text-[11px] leading-relaxed c-zinc-300' },
            MITRE_MITIGATIONS.map((m) =>
              h('li', {}, h('b', { class: 'c-emerald-300' }, m.stage + ':'), ' ' + m.mids)),
          ),
          h('p', { class: 'mt-2 text-[10px] c-zinc-500' }, 'Residual risk after tonight\'s containment: unknown second-stage tooling on WS-FIN-11 (forensics pending) and other recipients of the same lure.'),
        ),
      ),

      h('div', { class: 'mt-3 grid gap-3 md:grid-cols-2' },
        h('div', { class: 'takeaway-blue' },
          h('div', { class: 'section-label mb-2' }, 'Blue-team takeaways'),
          h('ul', { class: 'list-disc space-y-1 pl-4 text-[11px] leading-relaxed c-zinc-300' },
            h('li', {}, 'Baselines convert scary numbers into false positives — and quiet anomalies into true ones.'),
            h('li', {}, 'Correlate across streams: email → endpoint → flow is a 25-minute story no single log tells.'),
            h('li', {}, 'Parent–child lineage beats indicator lists: winword → powershell is the lesson in one line.'),
            h('li', {}, 'Tune detections against the whole floor (NTP, health-checks, backups) before deploying.'),
          ),
        ),
        h('div', { class: 'takeaway-red' },
          h('div', { class: 'section-label mb-2 flex items-center gap-1.5' }, icon('Swords', 'ic-35'), ' Red-team mindset (defensive use)'),
          h('ul', { class: 'list-disc space-y-1 pl-4 text-[11px] leading-relaxed c-zinc-300' },
            h('li', {}, 'The attacker\'s cost was one lure and one unregistered IP — their cover was monitoring gaps.'),
            h('li', {}, 'Beacon regularity is convenience; jitter and DoH are the easy evasions you will meet next.'),
            h('li', {}, 'Admin CLI abuse hides in plain sight: it is legitimate tooling on a hostile schedule.'),
            h('li', {}, 'Exfil rode a boring protocol on an odd port — protocol allowlists matter as much as blocklists.'),
          ),
        ),
      ),

      h('div', { class: 'mt-3 flex flex-wrap gap-1.5' },
        MITRE_LINKS.map((l) =>
          h('a', {
            href: l.url, target: '_blank', rel: 'noopener noreferrer', class: 'mitre-link mitre-link-lg',
          }, l.id + ' ' + l.name + ' ', icon('ExternalLink', 'ic-3'))),
      ),
    ]),
  )
}

// ═══ COMPLETION MODAL ════════════════════════════════════════════════════════
function Stars(n) {
  const full = Math.floor(n)
  const half = n - full >= 0.5
  const stars = []
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(icon('Star', 'ic-5 star-fill-amber'))
    else if (half && i === full) stars.push(icon('StarHalf', 'ic-5 star-fill-amber'))
    else stars.push(icon('Star', 'ic-5 star-empty'))
  }
  return h('span', { class: 'stars-row', role: 'img', 'aria-label': `${n} out of 5 stars` }, ...stars)
}

function CompletionModalContent({ onClose }) {
  const mode = lab.mode
  const list = mode ? OBJECTIVES[mode] : []
  const allSolved = list.length > 0 && list.every((d) => lab.obj[d.id]?.solved)
  const eligible = allSolved && lab.quizDone && !!mode
  if (!eligible) return null
  const { stars, note } = starRating(mode, lab.obj)
  const quiz = QUIZ[mode]
  const quizScore = quiz.filter((q) => lab.quizAnswers[q.id] === q.answer).length
  const pillars = ['understand', 'recognize', 'detect', 'mitigate']
  const areas = focusAreas(mode, lab.obj, lab.quizAnswers)
  const confirmRestart = ui.confirmRestart

  return h('div', { class: 'modal-panel sw-scan' },
    h('button', {
      type: 'button', class: 'modal-close', 'data-fid': 'modal-close',
      'aria-label': 'Close completion report',
      onclick: () => dismissCompletion(),
    }, icon('X', 'ic-5')),
    h('div', { class: 'text-center' },
      icon('Trophy', 'ic-10 c-amber-400 modal-trophy'),
      h('h2', { class: 'modal-title' }, 'WATCH COMPLETE'),
      h('p', { class: 'mt-1 text-xs c-zinc-400' }, `${LAB_META.cert} · ${LAB_META.lesson}`),
      h('div', { class: 'mt-3 flex flex-col items-center gap-1' },
        Stars(stars),
        h('p', { class: 'text-[11px] c-zinc-500' }, note),
      ),
    ),

    h('div', { class: 'mt-5 grid gap-3 md:grid-cols-2' },
      h('div', { class: 'kv-card' },
        h('div', { class: 'section-label mb-2' }, 'Dispatches'),
        h('p', { class: 'modal-score' }, `${list.length}/${list.length}`),
        h('p', { class: 'mt-1 text-[11px] c-zinc-500' }, 'all cleared'),
      ),
      h('div', { class: 'kv-card' },
        h('div', { class: 'section-label mb-2' }, 'Knowledge check'),
        h('p', { class: 'modal-score' }, `${quizScore}/${quiz.length}`),
        h('p', { class: 'mt-1 text-[11px] c-zinc-500' }, `${Math.round((quizScore / Math.max(1, quiz.length)) * 100)}% — retake any time in the quiz channel`),
      ),
    ),

    // R8 — focus areas derived from THIS student's actual evidence
    h('div', { class: 'modal-focus mt-4' },
      h('div', { class: 'section-label mb-2 flex items-center gap-1.5' }, icon('Crosshair', 'ic-35'), ' Focus areas — where to tighten up'),
      areas.length === 0
        ? h('p', { class: 'text-[11px] leading-relaxed modal-focus-none' },
            'None. Every dispatch cleared on the first cross-check without hints and every knowledge-check item correct — re-verify your fluency later by writing the SIEM queries from the debrief from memory.')
        : h('ul', { class: 'space-y-2' },
            areas.map((a, i) =>
              h('li', { class: 'focus-item' },
                icon('Crosshair', 'ic-3 focus-x'),
                h('span', { class: 'modal-focus-text' },
                  h('b', { class: 'c-amber-200' }, a.label + '.'), ' ' + a.detail),
              )),
          ),
    ),

    h('div', { class: 'mt-4' },
      h('div', { class: 'section-label mb-2' }, 'Objective recap by pillar'),
      h('div', { class: 'grid gap-2 md:grid-cols-2' },
        pillars.map((p) =>
          h('div', { class: 'pillar-recap' },
            PillarBadge(p),
            h('ul', { class: 'mt-1.5 space-y-0.5' },
              list.filter((d) => d.pillar === p).map((d) =>
                h('li', { class: 'recap-item' },
                  icon('Star', 'ic-3 star-fill-emerald recap-star'),
                  d.title,
                )),
            ),
          )),
      ),
    ),

    h('div', { class: 'modal-next mt-4' },
      h('b', { class: 'font-mono tracking-widest' }, 'WHERE NEXT —'),
      ` you can now explain, recognize, detect and mitigate this lesson's full scope. Push further: hunt the evasions (beacon jitter, DoH tunneling), practice writing SIEM queries from the detection logic in the `,
      h('b', {}, 'DEBRIEF'), ', and continue toward CySA+ Domain 1.4 (threat hunting) and 1.3 tool drills.',
    ),

    h('div', { class: 'mt-4 flex flex-wrap justify-center gap-2' },
      h('button', {
        type: 'button', class: 'btn btn-primary', 'data-fid': 'modal-debrief',
        onclick: () => { dismissCompletion(); actions.setChannel('debrief') },
      }, icon('BookOpenCheck', 'ic-4'), ' Review debrief'),
      h('button', {
        type: 'button', class: 'btn btn-ghost', 'data-fid': 'modal-keep',
        onclick: () => dismissCompletion(),
      }, ' Keep exploring'),
      h('button', {
        type: 'button',
        class: 'btn ' + (confirmRestart ? 'btn-danger-on' : 'btn-ghost'),
        'data-fid': 'modal-restart',
        onclick: () => {
          if (ui.confirmRestart) actions.resetAll()
          else ui.confirmRestart = true
          renderCompletion()
        },
        onblur: () => { if (ui.confirmRestart) { ui.confirmRestart = false; renderCompletion() } },
      }, icon('RotateCcw', 'ic-35'), ' ', confirmRestart ? 'Confirm — wipe progress' : 'Restart lab'),
    ),
  )
}
