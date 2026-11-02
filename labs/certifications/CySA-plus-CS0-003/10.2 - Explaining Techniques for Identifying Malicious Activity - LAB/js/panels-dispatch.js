// ── SIGNALWATCH · DISPATCH channel — objectives tracker (C4) ────────────────
// 1:1 static port of panels-dispatch.tsx.

function DispatchCard(def, order, isNext) {
  const mode = lab.mode
  const obj = lab.obj[def.id]
  const result = ui.results['card-' + def.id]
  const solved = obj?.solved ?? false
  const hints = obj?.hints ?? 0
  const hard = mode === 'hard'
  const maxHints = hard ? 1 : 3

  return h('article', {
    class: 'sw-teletype dispatch-card ' + (solved ? 'card-cleared' : isNext && !hard ? 'card-next' : ''),
  },
    h('div', { class: 'flex flex-wrap items-center gap-2' },
      h('span', { class: 'dispatch-no' }, 'DISPATCH ' + String(order).padStart(2, '0')),
      PillarBadge(def.pillar),
      h('h3', { class: 'text-sm font-bold c-emerald-100' }, def.title),
      h('span', { class: 'ml-auto flex items-center gap-1.5' },
        hints > 0 ? h('span', { class: 'hint-pill' }, `HINT×${hints}`) : null,
        h('span', { class: 'state-pill ' + (solved ? 'state-cleared' : 'state-open') },
          h('span', { class: 'state-dot ' + (solved ? 'bg-emerald-400' : 'bg-zinc-600'), 'aria-hidden': true }),
          solved ? 'CLEARED' : 'OPEN',
        ),
      ),
    ),
    h('p', { class: 'mt-2 text-sm leading-snug c-zinc-200' }, def.brief),
    !hard && def.context && !solved ? h('p', { class: 'mt-1 text-xs italic leading-snug c-zinc-500' }, def.context) : null,
    h('div', { class: 'mt-2 font-mono text-[10px] c-zinc-600' }, 'ANCHOR: ' + def.anchor),
    hints > 0
      ? h('div', { class: 'mt-2 space-y-1' },
          def.hints.slice(0, hints).map((hint, i) =>
            h('p', { class: 'hint-tier' }, h('b', { class: 'font-mono' }, `TIER ${i + 1}:`), ' ' + hint)),
        )
      : null,
    h('div', { class: 'mt-3 flex flex-wrap items-center gap-2' },
      h('button', {
        type: 'button', class: 'btn btn-soft', 'data-fid': 'dc-open-' + def.id,
        onclick: () => actions.setChannel(def.pointTo),
      }, icon('ExternalLink', 'ic-35'), ' Open module'),
      h('button', {
        type: 'button', class: 'btn btn-primary', 'data-fid': 'dc-check-' + def.id,
        onclick: () => { ui.results['card-' + def.id] = actions.check(def.id); renderStage() },
      }, icon('ChevronRight', 'ic-4'), ' Run cross-check'),
      !solved && hints < maxHints
        ? h('button', {
            type: 'button', class: 'btn btn-hint', 'data-fid': 'dc-hint-' + def.id,
            onclick: () => { actions.requestHint(def.id); renderStage() },
          }, icon('Lightbulb', 'ic-35'), ' ', hard ? `Burn nudge (costs score · ${hints}/1)` : `Hint (${hints}/${maxHints})`)
        : null,
      obj && obj.attempts > 0 ? h('span', { class: 'font-mono text-[9px] c-zinc-600' }, 'checks: ' + obj.attempts) : null,
    ),
    result ? ResultBox(result.pass, result.feedback) : null,
  )
}

function M7Workset() {
  const selects = lab.env.selects
  return WorksetFrame('m7',
    h('div', { class: 'mt-2 space-y-2' },
      DS_ROWS.map((r) =>
        h('div', { class: 'grid items-end gap-2 md:grid-cols-[1fr_240px]' },
          h('p', { class: 'def-quote not-italic' }, r.signal),
          SwSelect({
            label: 'Data source',
            value: selects['m7.' + r.id.slice(2)] ?? '',
            onChange: (v) => actions.setSelect('m7.' + r.id.slice(2), v, true),
            options: DS_OPTS_PER_ROW[r.id] ?? [], fid: 'sel-m7-' + r.id,
          }),
        )),
    ),
  )
}

function DispatchPanel() {
  const mode = lab.mode
  const obj = lab.obj
  const list = mode ? OBJECTIVES[mode] : []
  const p = progress(mode, obj)
  const nextIdx = list.findIndex((d) => !obj[d.id]?.solved)
  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 00', title: 'DISPATCH DESK — watch queue', icon: icon('ClipboardList'),
      desc: mode === 'hard'
        ? 'free-roam: eight deep dispatches · minimal guidance · one paid nudge each'
        : 'guided watch: twelve dispatches in order · hints free · wrong answers only teach',
      right: h('span', { class: 'progress-chip' }, `${p.solved}/${p.total} CLEARED`),
    },
      h('div', { class: 'flex flex-wrap items-center gap-3' },
        h('div', {
          class: 'progress-track', role: 'progressbar',
          'aria-valuenow': p.solved, 'aria-valuemin': 0, 'aria-valuemax': p.total, 'aria-label': 'Dispatches cleared',
        },
          h('div', { class: 'progress-fill', style: `width:${(p.solved / Math.max(1, p.total)) * 100}%` }),
        ),
        SectionLabel(`first-attempt accuracy ${p.accuracy}% · hints ${p.hintsUsed}`),
      ),
    ),

    h('div', { class: 'grid gap-4 ' + (mode === 'hard' ? 'xl:grid-cols-2' : '') },
      list.map((d, i) => DispatchCard(d, i + 1, i === nextIdx)),
    ),

    M7Workset(),

    p.solved === p.total && p.total > 0
      ? h('div', { class: 'all-cleared-banner' },
          h('b', { class: 'font-mono tracking-widest' }, 'ALL DISPATCHES CLEARED.'),
          ' The watch commander nods. Head to the ', h('b', {}, 'QUIZ channel'), ' to certify the knowledge, then the ',
          h('b', {}, 'DEBRIEF'), ' — your completion review unlocks after the quiz.')
      : null,
  )
}
