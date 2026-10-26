// ── THE VULN BULLETIN ── quiz logic ──────────────────────────────────────────
// Static 1:1 port of the quiz behavior in Quiz.tsx + content banks in data.js.
// One question at a time; answer locks the question (same as the original);
// color contract enforced in the renderer (see ui.js — green only on a
// picked-correct; wrong pick shows red ONLY, the correct option is annotated
// neutrally and never tinted green in the same submission).

function quizBank(mode) {
  return mode === 'medium' ? QUIZ_MEDIUM : QUIZ_HARD
}

function quizCorrectCount(state, mode) {
  const bank = quizBank(mode)
  return bank.filter(x => state.quizAnswers[x.id] === x.correct).length
}

function quizIsAnswered(state) {
  if (!state.mode) return false
  const bank = quizBank(state.mode)
  const q = bank[state.quizIndex]
  return !!q && state.quizAnswers[q.id] !== undefined
}

// ARIA radio pattern: arrow keys move focus between options; Enter/Space activate
// (native button behavior). Mirrors handleOptionKeys() in Quiz.tsx.
function quizOptionKeyHandler(e) {
  if (!e.target.closest('[data-quiz-options]')) return
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  const container = e.target.closest('[data-quiz-options]')
  if (container.dataset.answered === 'true') return
  const opts = Array.from(container.querySelectorAll('[data-quiz-option]'))
  if (!opts.length) return
  e.preventDefault()
  const idx = opts.indexOf(document.activeElement)
  const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1
  const next = opts[(idx + dir + opts.length) % opts.length] || opts[0]
  next.focus()
}
