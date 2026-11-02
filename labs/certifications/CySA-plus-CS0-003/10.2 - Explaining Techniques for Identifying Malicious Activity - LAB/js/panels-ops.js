// ── SIGNALWATCH · OPS modules (js/panels-ops.js) ────────────────────────────
// RULE BENCH · ACTION BOARD · ATT&CK BOARD · ALERT QUEUE
// 1:1 static port of panels-ops.tsx.

const ATTACK_NAMES = {
  'T1566.002': 'T1566.002 — Phishing: Spearphishing Link',
  'T1566.001': 'T1566.001 — Phishing: Spearphishing Attachment',
  'T1059.001': 'T1059.001 — PowerShell',
  'T1059.003': 'T1059.003 — Windows Command Shell',
  'T1105': 'T1105 — Ingress Tool Transfer',
  'T1071.001': 'T1071.001 — Application Layer Protocol: Web Protocols',
  'T1071.004': 'T1071.004 — Application Layer Protocol: DNS',
  'T1048.003': 'T1048.003 — Exfiltration Over Unencrypted Non-C2 Protocol',
}

// ═══ RULE BENCH ══════════════════════════════════════════════════════════════
function RuleBenchPanel() {
  const mode = lab.mode
  const interval = lab.env.ruleInterval
  const min = lab.env.ruleMin
  const host = lab.env.ruleHost
  const objId = mode === 'medium' ? 'm8' : 'h3'
  const obj = lab.obj[objId]
  const result = ui.results['rulebench']
  const test = ui.ruleTest

  const intervalLabel = interval === 'any' ? '[ANY]' : interval === '60-5' ? '[55..65]' : interval === '60-30' ? '[30..90]' : interval === '300-5' ? '[295..305]' : ''
  const hostClause = host === 'wsfin' ? ' AND group.src = WS-FIN-11' : host === 'srvseg' ? ' AND group.src IN [SRV-*]' : ''
  const signature = interval && min
    ? `ALERT WHEN group.interval IN ${intervalLabel}s AND group.sessions >= ${min} AND group.direction = out${hostClause}`
    : '— configure all three fields to compile a rule —'

  const runTest = () => {
    ui.ruleTest = evaluateRule(interval, min, host)
    ui.results['rulebench'] = actions.check(objId)
    renderStage()
  }

  const matchedDetail = (ids) => ids.length === 0
    ? 'no groups satisfied the predicate'
    : ids.map((id) => id === 'g05' ? 'g05 (beacon, 60s±2s, 34 sess, WS-FIN-11)'
      : id === 'g07' ? 'g07 (NTP, 300s, 97 sess, WS-OPS-07 — benign)'
      : id === 'g08' ? 'g08 (health-check, 90s, 26 sess, WS-WEB-01 — benign)' : id).join(' · ')

  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 06', title: 'RULE BENCH — detection engineering', icon: icon('SlidersHorizontal'),
      desc: 'compose · replay against the watch window · prove zero false positives',
      right: obj?.solved ? TagBadge('CLEARED', true) : TagBadge('OPEN', false),
    }, [
      h('div', { class: 'grid gap-3 md:grid-cols-3' },
        SwSelect({
          label: 'Interval window', value: interval,
          onChange: (v) => { actions.setRule('ruleInterval', v); renderStage() },
          options: [
            { id: '60-5', label: '60 s ±5 s' },
            { id: '60-30', label: '60 s ±30 s' },
            { id: '300-5', label: '300 s ±5 s' },
            { id: 'any', label: 'ANY (no interval filter)' },
          ], fid: 'rule-interval',
        }),
        SwSelect({
          label: 'Minimum sessions', value: min,
          onChange: (v) => { actions.setRule('ruleMin', v); renderStage() },
          options: [
            { id: '3', label: '3 sessions' },
            { id: '5', label: '5 sessions' },
            { id: '10', label: '10 sessions' },
            { id: '20', label: '20 sessions' },
          ], fid: 'rule-min',
        }),
        SwSelect({
          label: 'Host scope', value: host,
          onChange: (v) => { actions.setRule('ruleHost', v); renderStage() },
          options: [
            { id: 'any', label: 'ANY host (generic)' },
            { id: 'wsfin', label: 'Pin: WS-FIN-11' },
            { id: 'srvseg', label: 'Pin: SRV-* segment' },
          ], fid: 'rule-host',
        }),
      ),

      h('div', { class: 'rule-signature mt-3' }, signature),

      h('div', { class: 'mt-3 flex flex-wrap items-center gap-2' },
        h('button', { type: 'button', class: 'btn btn-primary', 'data-fid': 'rule-test', onclick: runTest },
          icon('Zap', 'ic-4'), ' Test against replay'),
        h('span', { class: 'text-[10px] c-zinc-500' }, 'replay = all FLOWSCOPE groups, 17:00 → 06:00'),
      ),

      test
        ? h('div', { class: 'replay-box mt-3' },
            h('div', { class: 'section-label mb-2' }, 'Replay result'),
            h('div', { class: 'flex flex-wrap gap-2' },
              StatChip('MATCHED GROUPS', test.matched.length ? test.matched.join(', ') : 'none', test.matched.length ? 'warn' : 'neutral'),
              StatChip('BENIGN FIRES', String(test.benignMatched.length), test.benignMatched.length ? 'bad' : 'ok'),
              test.targetMatched ? StatChip('FIRST FIRE', `${test.latencyMin} min into beacon`) : null,
            ),
            h('p', { class: 'mt-2 text-[11px] c-zinc-400' }, test.note),
            h('p', { class: 'mt-1 font-mono text-[10px] c-zinc-600' }, matchedDetail(test.matched)),
          )
        : null,

      result ? ResultBox(result.pass, result.feedback) : null,
    ]),

    PanelFrame({
      code: 'MOD 06-B', title: 'Tuning notes', icon: icon('SlidersHorizontal'),
    },
      h('ul', { class: 'list-disc space-y-1.5 pl-5 text-xs leading-relaxed c-zinc-300' },
        h('li', {}, h('b', { class: 'c-emerald-200' }, 'Precision:'), ' widening the interval tolerance admits other periodic traffic — the floor contains a 90 s partner health-checker and a 300 s NTP client.'),
        h('li', {}, h('b', { class: 'c-emerald-200' }, 'Latency:'), ' the session minimum decides how early the rule fires — 3 sessions = 3 minutes into the beacon.'),
        h('li', {}, h('b', { class: 'c-emerald-200' }, 'Generality:'), ' host-pinned rules die with the next host; generic rules survive infrastructure churn.'),
      ),
    ),
  )
}

// ═══ ACTION BOARD ════════════════════════════════════════════════════════════
function ActionBoardPanel() {
  const mode = lab.mode
  const actionsOn = lab.env.actionsOn
  const objId = mode === 'medium' ? 'm9' : 'h5'
  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 07', title: 'ACTION BOARD — containment console', icon: icon('Zap'),
      desc: 'enable the actions the evidence supports — every action costs the business something',
      right: StatChip('ENABLED', `${actionsOn.length}/8`, actionsOn.length ? 'warn' : 'neutral'),
    },
      WorksetFrame(objId,
        mode === 'hard'
          ? h('p', { class: 'seq-note mt-2' }, 'Enable order = sequence of execution. Disable/re-enable to re-order.')
          : null,
        h('div', { class: 'mt-2 grid gap-2 md:grid-cols-2' },
          ACTIONS.map((a, i) => {
            const on = actionsOn.includes(a.id)
            const seq = actionsOn.indexOf(a.id) + 1
            return h('button', {
              type: 'button', class: 'action-btn ' + (on ? 'action-on' : ''),
              'aria-pressed': on ? 'true' : 'false', 'data-fid': 'act-' + a.id,
              onclick: () => { actions.toggleAction(a.id); renderStage() },
            },
              h('span', { class: 'action-no ' + (on ? 'action-no-on' : ''), 'aria-hidden': true }, on ? String(seq) : String(i + 1)),
              h('span', { class: 'text-xs leading-snug c-zinc-200' }, a.label),
            )
          }),
        ),
      ),
    ),

    PanelFrame({
      code: 'MOD 07-B', title: 'Control mapping — stage vs control', icon: icon('Zap'),
      desc: 'preventive layering: which control starves which chain stage',
    },
      WorksetFrame('m12',
        h('div', { class: 'mt-2 space-y-3' },
          CONTROLS.map((c) =>
            h('div', { class: 'grid items-end gap-2 md:grid-cols-[1fr_240px]' },
              h('p', { class: 'def-quote not-italic' }, c.control),
              ControlSelect(c.id, CONTROL_OPTS_PER_ROW[c.id] ?? []),
            )),
        ),
      ),
    ),
  )
}

function ControlSelect(cid, opts) {
  const v = lab.env.selects['m12.' + cid] ?? ''
  return SwSelect({
    label: 'Primarily disrupts', value: v,
    onChange: (val) => actions.setSelect('m12.' + cid, val, true),
    options: opts, fid: 'sel-m12-' + cid,
  })
}

// ═══ ATT&CK BOARD ════════════════════════════════════════════════════════════
function AttackMapPanel() {
  const mode = lab.mode
  const selects = lab.env.selects
  const atkTyped = lab.env.atkTyped
  const objId = mode === 'medium' ? 'm10' : 'h6'
  return PanelFrame({
    code: 'MOD 08', title: 'ATT&CK BOARD — technique mapping', icon: icon('Crosshair'),
    desc: "turn tonight's observations into shared language",
    right: h('a', {
      href: 'https://attack.mitre.org/', target: '_blank', rel: 'noopener noreferrer',
      class: 'mitre-link mitre-link-lg',
    }, 'attack.mitre.org ↗'),
  },
    WorksetFrame(objId,
      h('div', { class: 'mt-2 space-y-3' },
        ATTACK_CHIPS.map((c) =>
          h('div', { class: 'attack-chip' },
            h('div', { class: 'flex flex-wrap items-baseline gap-2' },
              h('span', { class: 'attack-chip-no' }, 'CHIP ' + c.key.toUpperCase()),
              h('b', { class: 'text-xs c-zinc-100' }, c.label),
            ),
            h('p', { class: 'mt-1 text-[11px] c-zinc-500' }, c.detail),
            mode === 'medium'
              ? h('div', { class: 'mt-2' },
                  SwSelect({
                    value: selects['m10.' + c.key] ?? '',
                    onChange: (v) => actions.setSelect('m10.' + c.key, v, true),
                    options: ATTACK_OPTIONS.map((o) => ({ id: o, label: ATTACK_NAMES[o] ?? o })),
                    label: 'Technique', fid: 'sel-m10-' + c.key,
                  }),
                )
              : h('div', { class: 'mt-2 max-w-[220px]' },
                  SwInput({
                    value: atkTyped[c.key] ?? '', onChange: (v) => actions.setAtkTyped(c.key, v, true),
                    placeholder: 'T####.###', label: 'Exact technique ID', fid: 'in-h6-' + c.key,
                  }),
                ),
          )),
      ),
    ),
  )
}

// ═══ ALERT QUEUE (Hard) ══════════════════════════════════════════════════════
function ClsToggle(id) {
  const v = lab.env.alertCls[id]
  const mk = (k, lbl, cls) =>
    h('button', {
      type: 'button', class: 'cls-btn ' + (v === k ? cls : 'cls-off'),
      'aria-pressed': v === k ? 'true' : 'false', 'data-fid': `cls-${id}-${k}`,
      onclick: () => { actions.setAlertCls(id, k); renderStage() },
    }, lbl)
  return h('span', { class: 'triage-group', role: 'group', 'aria-label': `Verdict for ${id}` },
    mk('tp', 'TRUE POSITIVE', 'cls-tp'),
    mk('fp', 'FALSE POSITIVE', 'cls-fp'),
  )
}

function AlertQueuePanel() {
  const chainOrder = lab.env.chainOrder
  const summarySel = lab.env.summarySel
  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 09', title: 'ALERT QUEUE — watch-floor triage', icon: icon('Siren'),
      desc: 'six alerts fired during your shift · adjudicate every one',
      right: StatChip('QUEUE', String(ALERTS.length), 'warn'),
    }, [
      h('div', { class: 'space-y-2' },
        ALERTS.map((a) =>
          h('article', { class: 'alert-card' },
            h('div', { class: 'flex flex-wrap items-center gap-2' },
              h('span', { class: 'font-mono text-[10px] c-emerald-600' }, a.id.toUpperCase()),
              h('b', { class: 'font-mono text-[11px] tracking-wider c-zinc-100' }, a.title),
            ),
            h('p', { class: 'mt-1 font-mono text-[10px] leading-relaxed c-zinc-400' }, a.detail),
            h('div', { class: 'mt-2' }, ClsToggle(a.id)),
          )),
      ),
      WorksetFrame('h7'),
    ]),

    PanelFrame({
      code: 'MOD 09-B', title: 'CHAIN RECONSTRUCTION', icon: icon('Siren'),
      desc: 'order the six events earliest → latest',
    },
      h('ol', { class: 'space-y-1.5' },
        chainOrder.map((id, i) => {
          const item = CHAIN_ITEMS.find((c) => c.id === id)
          if (!item) return null
          return h('li', { class: 'chain-row' },
            h('span', { class: 'chain-no' }, String(i + 1)),
            h('span', { class: 'chain-label' }, item.label),
            h('span', { class: 'chain-btns' },
              h('button', {
                type: 'button', class: 'chain-btn', 'data-fid': `chain-${id}-up`,
                disabled: i === 0, 'aria-label': `Move "${item.label}" up`,
                onclick: () => { actions.moveChain(id, -1); renderStage() },
              }, icon('ArrowUp', 'ic-4')),
              h('button', {
                type: 'button', class: 'chain-btn', 'data-fid': `chain-${id}-down`,
                disabled: i === chainOrder.length - 1, 'aria-label': `Move "${item.label}" down`,
                onclick: () => { actions.moveChain(id, 1); renderStage() },
              }, icon('ArrowDown', 'ic-4')),
            ),
          )
        }),
      ),
      WorksetFrame('h2'),
    ),

    PanelFrame({
      code: 'MOD 09-C', title: 'INCIDENT SUMMARY — sign-off', icon: icon('Siren'),
      desc: 'select every true statement (and only the true ones)',
    },
      h('div', { class: 'grid gap-1 md:grid-cols-2' },
        SUMMARY_STMTS.map((s) =>
          SwCheck({
            checked: summarySel.includes(s.id),
            onChange: () => { actions.toggleIn('summarySel', s.id); renderStage() },
            fid: 'chk-h8-' + s.id,
          }, s.label)),
      ),
      WorksetFrame('h8'),
    ),
  )
}
