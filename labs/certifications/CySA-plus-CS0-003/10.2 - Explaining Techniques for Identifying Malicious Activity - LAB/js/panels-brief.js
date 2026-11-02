// ── SIGNALWATCH · BRIEF channel (js/panels-brief.js) ────────────────────────
// Scenario, knowledge core, glossary, m1/m2 worksets.
// 1:1 static port of panels-brief.tsx.

function M1Workset() {
  const sel = (lab.env.answers['m1.sel'] ?? '').split(',').filter(Boolean)
  const toggle = (id) => {
    const next = sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    actions.setAnswer('m1.sel', next.join(','))
  }
  return WorksetFrame('m1',
    h('div', { class: 'mt-2 grid gap-1 md:grid-cols-2' },
      LESSON_OPTS.map((o) =>
        SwCheck({ checked: sel.includes(o.id), onChange: () => toggle(o.id), fid: 'chk-m1-' + o.id }, o.label)),
    ),
  )
}

function M2Workset() {
  const selects = lab.env.selects
  const opts = [
    { id: 'traffic', label: 'Unusual traffic pattern' },
    { id: 'protocol', label: 'Protocol behavior' },
    { id: 'event', label: 'Indicator event' },
  ]
  return WorksetFrame('m2',
    h('div', { class: 'mt-2 space-y-3' },
      CATEGORY_DEFS.map((c) =>
        h('div', { class: 'grid items-end gap-2 md:grid-cols-[1fr_220px]' },
          h('p', { class: 'def-quote' }, '“' + c.def + '”'),
          SwSelect({
            value: selects['m2.' + c.id] ?? '',
            onChange: (v) => actions.setSelect('m2.' + c.id, v, true),
            options: M2_OPTS_PER_ROW[c.id] ?? opts, label: 'Category', fid: 'sel-m2-' + c.id,
          }),
        )),
    ),
  )
}

function BriefPanel() {
  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 01', title: 'Watch Orders — Scenario Briefing', icon: icon('Radio'),
      desc: `${LAB_META.org} · fictional training scenario`,
      right: TagBadge('SYNTHETIC DATA', true),
    }, [
      h('div', { class: 'notice-amber' },
        h('b', { class: 'font-mono tracking-widest' }, 'TRAINING SIMULATION.'), ' ', 'Every org, host, user, domain and IP in this console is fictional (RFC 5737 TEST-NET ranges, .example domains). Command lines are truncated, defanged training samples. Defensive purpose only.',
      ),
      h('div', { class: 'mt-4 space-y-3 text-sm leading-relaxed c-zinc-300' },
        h('p', {}, 'You are the junior analyst on the ', h('b', { class: 'c-emerald-200' }, '22:00–06:00 night watch'), ` at ${LAB_META.org}, a mid-size freight brokerage with 410 staff. Thirty minutes into your shift, the watch commander drops a folder on your console: the mail gateway and the flow collectors have been quietly recording since 17:00, and something in the night's telemetry doesn't sit right.`),
        h('p', {}, 'Lesson 10.2 says the most important identification technique is ', h('b', { class: 'c-emerald-200' }, 'monitoring network and email activity'), ' for suspicious indicators — unusual traffic patterns, abnormal protocol behavior, and events like installing new software or using administrative command-line tools. Tonight you will do exactly that: four instrument modules, one dispatch queue, one incident hiding in the noise.'),
        h('div', { class: 'flex flex-wrap gap-2 pt-1' },
          h('span', { class: 'meta-chip' }, LAB_META.cert),
          h('span', { class: 'meta-chip' }, LAB_META.domain),
          h('span', { class: 'meta-chip' }, LAB_META.lesson),
        ),
      ),
    ]),

    PanelFrame({
      code: 'MOD 01-B', title: 'Knowledge Core — the triad of indicators', icon: icon('BookOpen'),
      desc: 'what · how · why — the theory your dispatches exercise',
    }, [
      h('div', { class: 'grid gap-3 md:grid-cols-3' },
        h('div', { class: 'kv-card' },
          SectionLabel('① Unusual traffic patterns'),
          h('p', { class: 'mt-2 text-xs leading-relaxed c-zinc-300' },
            'Rhythm, volume, timing and destination. A machine-regular 60-second callback is a ', Gloss('Beaconing'), ' heartbeat; a sudden multi-gigabyte upload is staged exfiltration; anything significant at 03:00 is ', Gloss('Baseline'), '-breaking by definition.'),
        ),
        h('div', { class: 'kv-card' },
          SectionLabel('② Protocol behavior'),
          h('p', { class: 'mt-2 text-xs leading-relaxed c-zinc-300' },
            'Protocols used as they were never meant to be: ', Gloss('DNS tunneling'), ' hides data in TXT labels; FTP on port 2121 hides a transfer where nobody watches. The protocol is the tell — misuse is visible even when content is encrypted.'),
        ),
        h('div', { class: 'kv-card' },
          SectionLabel('③ Indicator events'),
          h('p', { class: 'mt-2 text-xs leading-relaxed c-zinc-300' },
            'Discrete host actions: ', h('b', { class: 'c-emerald-200' }, 'new software installed'), ' (unsigned? from %TEMP%?), and ',
            h('b', { class: 'c-emerald-200' }, 'administrative command-line tools'), ' invoked with odd parents, flags or timing. Context makes an admin tool an indicator.'),
        ),
      ),

      h('div', { class: 'mt-4 grid gap-3 md:grid-cols-2' },
        h('div', { class: 'kv-card' },
          SectionLabel("Where tonight's attack chain sits (ATT&CK)"),
          h('ol', { class: 'mt-2 space-y-1 text-xs c-zinc-300' },
            h('li', {}, h('b', { class: 'c-emerald-300' }, 'Initial Access'), ' — phishing email with a lookalike link (T1566.002)'),
            h('li', {}, h('b', { class: 'c-emerald-300' }, 'Execution'), ' — document spawns encoded PowerShell (T1059.001)'),
            h('li', {}, h('b', { class: 'c-emerald-300' }, 'Command & Control'), ' — payload download (T1105), 60 s HTTPS beacon (T1071.001), DNS tunnel (T1071.004)'),
            h('li', {}, h('b', { class: 'c-emerald-300' }, 'Exfiltration'), ' — unencrypted non-C2 protocol, out-of-hours (T1048.003)'),
          ),
          h('p', { class: 'mt-2 text-[11px] c-zinc-500' },
            'Attackers favor these techniques because monitoring gaps are their cover: a beacon is small, DNS is trusted, admin CLIs are legitimate. Identification techniques exist to close exactly those gaps.'),
        ),
        h('div', { class: 'kv-card' },
          SectionLabel('Seen in the wild (per official ATT&CK pages)'),
          h('ul', { class: 'mt-2 space-y-1.5 text-xs c-zinc-300' },
            ATTRIBUTION.map((a) =>
              h('li', {}, h('b', { class: 'c-emerald-200' }, a.actor), ` — ${a.note} (${a.tech}).`)),
          ),
          h('div', { class: 'mt-2 flex flex-wrap gap-1.5' },
            MITRE_LINKS.map((l) =>
              h('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', class: 'mitre-link' }, l.id + ' ↗')),
          ),
          h('p', { class: 'mt-2 flex items-start gap-1.5 text-[11px] c-zinc-500' },
            icon('ShieldAlert', 'ic-3 mt-0.5 c-amber-400 shrink0'), ' ',
            h('span', {}, 'Variants to watch: beacon jitter and DoH replace plain DNS; living-off-the-land swaps binaries but keeps the parent–child anomaly.')),
        ),
      ),

      h('div', { class: 'note-emerald mt-4' },
        h('p', { class: 'flex items-center gap-2 font-semibold' }, icon('GraduationCap', 'ic-4'), ' Your dispatches'),
        'Twelve dispatches (Medium) or eight (Hard) walk this lesson end to end: name the streams → recognize the patterns in evidence → choose instruments and tune detections → plan containment. Clear every dispatch and you can explain, recognize, detect and mitigate this lesson\'s full scope.',
      ),
    ]),

    PanelFrame({
      code: 'MOD 01-C', title: 'First dispatches — lesson core', icon: icon('Lightbulb'),
      desc: 'work directly on the lesson brief',
    },
      M1Workset(),
      M2Workset(),
    ),

    PanelFrame({
      code: 'MOD 01-D', title: 'Glossary', icon: icon('BookOpen'),
      desc: 'hover or focus any dotted term in the console',
    },
      h('dl', { class: 'grid gap-x-6 gap-y-2 md:grid-cols-2' },
        GLOSSARY.map((g) =>
          h('div', { class: 'gloss-entry' },
            h('dt', { class: 'text-xs font-semibold c-emerald-300' }, g.term),
            h('dd', { class: 'text-[11px] leading-snug c-zinc-400' }, g.def),
          )),
      ),
    ),
  )
}
