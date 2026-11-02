// ── SIGNALWATCH · per-objective workset frame (js/workset.tsx → workset.js) ──
// Inputs + check + result, framed per objective. 1:1 port of workset.tsx.

/**
 * WorksetFrame(objId, ...children)
 * The result box is transient UI state: it survives re-renders within the
 * channel but resets on channel change (same as React unmount semantics).
 */
function WorksetFrame(objId, ...children) {
  const mode = lab.mode
  const obj = lab.obj[objId]
  const def = mode ? OBJECTIVES[mode].find((o) => o.id === objId) : null
  if (!def) return null
  const solved = obj?.solved
  const result = ui.results['ws-' + objId]
  return h('div', { class: 'workset ' + (solved ? 'workset-cleared' : '') },
    h('div', { class: 'workset-head' },
      h('span', { class: 'font-mono text-[10px] tracking-widest c-emerald-500' }, 'DISPATCH ' + def.id.toUpperCase()),
      h('span', { class: 'text-xs font-semibold c-emerald-100' }, def.title),
      solved ? TagBadge('CLEARED', true) : TagBadge('OPEN', false),
    ),
    h('p', { class: 'text-xs c-zinc-300' }, def.brief),
    ...children,
    h('div', { class: 'mt-3' },
      h('button', {
        type: 'button', class: 'btn btn-primary', 'data-fid': 'ws-check-' + objId,
        onclick: () => { ui.results['ws-' + objId] = actions.check(def.id); renderStage() },
      }, icon('ChevronRight', 'ic-4'), ' Run cross-check'),
    ),
    result ? ResultBox(result.pass, result.feedback) : null,
  )
}
