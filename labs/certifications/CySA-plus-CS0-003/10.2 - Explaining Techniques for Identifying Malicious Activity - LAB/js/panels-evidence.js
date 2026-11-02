// ── SIGNALWATCH · EVIDENCE modules (js/panels-evidence.js) ──────────────────
// FLOWSCOPE · DNS WIRE · MAIL GATE · ENDPOINT TRACE
// 1:1 static port of panels-evidence.tsx.

// ═══ FLOWSCOPE ═══════════════════════════════════════════════════════════════
function TriageToggle(id) {
  const v = lab.env.flowTriage[id]
  const mk = (k, lbl, cls) =>
    h('button', {
      type: 'button', class: 'triage-btn ' + (v === k ? cls : 'triage-off'),
      'aria-pressed': v === k ? 'true' : 'false', 'data-fid': `triage-${id}-${k}`,
      onclick: () => { actions.setFlowTriage(id, k); renderStage() },
    }, lbl)
  return h('span', { class: 'triage-group', role: 'group', 'aria-label': `Triage ${id}` },
    mk('mal', 'MAL', 'triage-mal'),
    mk('ben', 'BEN', 'triage-ben'),
  )
}

function FlowscopePanel() {
  const mode = lab.mode
  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 02', title: 'FLOWSCOPE — connection telemetry', icon: icon('Network'),
      desc: 'NetFlow-style session groups · 17:00 → 06:00 · enrichment labels are simulated',
      right: StatChip('GROUPS', String(FLOWS.length)),
    }, [
      h('div', { class: 'mb-4 kv-card' },
        h('div', { class: 'section-label mb-1 px-1' }, 'Volume strip · hourly (simulated)'),
        TrafficStrip(),
      ),

      // desktop table
      h('div', { class: 'sw-scroll flow-table-wrap' },
        h('table', { class: 'data-table' },
          h('thead', { class: 'table-head' },
            h('tr', {},
              ['ID', 'WINDOW', 'SRC', 'DST', 'DST IP', 'PORT', 'SESS', 'RHYTHM', 'UP/DOWN', 'OWNER (SIM)'].map((t) =>
                h('th', { class: 'th' }, t)),
            ),
          ),
          h('tbody', { class: 'c-zinc-300' },
            FLOWS.map((f) =>
              h('tr', { class: 'tr' },
                h('td', { class: 'td c-emerald-600' }, f.id),
                h('td', { class: 'td' }, `${f.start}→${f.end}`),
                h('td', { class: 'td c-zinc-100' }, f.src),
                h('td', { class: 'td td-trunc', title: f.dst }, f.dst),
                h('td', { class: 'td' }, f.dstIp),
                h('td', { class: 'td' }, `${f.port}/${f.proto}`),
                h('td', { class: 'td' }, String(f.sessions)),
                h('td', { class: 'td' },
                  SparkDots(f.sessions, f.intervalSec),
                  h('div', { class: 'mt-0.5 text-[9px] c-zinc-500' }, f.intervalNote),
                ),
                h('td', { class: 'td' }, `↑${f.bytesUp} ↓${f.bytesDown}`),
                h('td', { class: 'td ' + (f.owner.startsWith('UNREGISTERED') ? 'c-amber-400' : 'c-zinc-500') }, f.owner),
              )),
          ),
        ),
      ),

      // mobile cards
      h('div', { class: 'sw-scroll flow-cards' },
        FLOWS.map((f) =>
          h('div', { class: 'flow-card' },
            h('div', { class: 'flex items-center justify-between' },
              h('span', { class: 'c-emerald-600' }, f.id),
              h('span', {}, `${f.start}→${f.end}`),
            ),
            h('div', { class: 'mt-1 c-zinc-100' }, `${f.src} → ${f.dst} `, h('span', { class: 'c-zinc-500' }, `(${f.dstIp})`)),
            h('div', { class: 'mt-1' }, `:${f.port}/${f.proto} · ${f.sessions} sess · `, SparkDots(f.sessions, f.intervalSec)),
            h('div', { class: 'mt-1 text-[10px] c-zinc-500' }, `↑${f.bytesUp} ↓${f.bytesDown} · ${f.intervalNote} · ${f.owner}`),
          )),
      ),

      mode === 'hard'
        ? WorksetFrame('h1',
            h('p', { class: 'mb-2 text-[11px] c-zinc-400' }, 'Give every highlighted group a verdict. Red herrings from the baseline are on the floor — check owner, window, payload and cadence before you judge.'),
            h('div', { class: 'grid gap-1.5 sm:grid-cols-2' },
              TRIAGE_GROUPS.map((id) =>
                h('div', { class: 'triage-row' },
                  h('span', { class: 'font-mono text-[11px] c-emerald-500' }, id),
                  TriageToggle(id),
                )),
            ),
          )
        : null,
    ]),

    mode === 'medium'
      ? PanelFrame({
          code: 'MOD 02-A', title: 'Dispatch worksets — traffic patterns', icon: icon('ShieldQuestion'),
        },
          WorksetFrame('m3',
            h('div', { class: 'mt-2 grid gap-2 sm:grid-cols-2' },
              SwInput({ value: lab.env.answers['m3.ip'] ?? '', onChange: (val) => actions.setAnswer('m3.ip', val, true), label: 'Beacon destination IP', placeholder: 'e.g. 203.0.113.1', fid: 'in-m3-ip' }),
              SwInput({ value: lab.env.answers['m3.interval'] ?? '', onChange: (val) => actions.setAnswer('m3.interval', val, true), label: 'Repeat interval (seconds)', placeholder: 'e.g. 120', fid: 'in-m3-interval' }),
            ),
          ),
        )
      : null,
  )
}

// ═══ DNS WIRE ════════════════════════════════════════════════════════════════
function DnsPropCheck(id, label) {
  const sel = lab.env.dnsProps
  return SwCheck({ checked: sel.includes(id), onChange: () => { actions.toggleIn('dnsProps', id); renderStage() }, fid: 'chk-m4-' + id }, label)
}

function DnsWirePanel() {
  const filter = ui.dnsFilter
  const tunnelDomain = lab.env.answers['m4.domain'] ?? ''
  const rows = DNS_ROWS.filter((r) => (filter === 'txt' ? r.qtype === 'TXT' : filter === 'fin' ? r.client === 'WS-FIN-11' : true))
  const tunnelCount = DNS_ROWS.filter((r) => r.domain.includes('cdn-metrics')).length
  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 03', title: 'DNS WIRE — resolver log', icon: icon('Binary'),
      desc: 'query log excerpt · a burst has been aggregated for readability',
      right: StatChip('CDN-METRICS LINES', String(tunnelCount), 'warn'),
    }, [
      h('div', { class: 'mb-3 flex flex-wrap gap-2' },
        [['all', 'ALL QUERIES'], ['txt', 'TXT ONLY'], ['fin', 'CLIENT: WS-FIN-11']].map(([k, lbl]) =>
          h('button', {
            type: 'button', class: 'filter-btn ' + (filter === k ? 'filter-on' : ''),
            'aria-pressed': filter === k ? 'true' : 'false', 'data-fid': 'dnsf-' + k,
            onclick: () => { ui.dnsFilter = k; renderStage() },
          }, lbl)),
      ),

      h('div', { class: 'sw-scroll dns-table-wrap' },
        h('table', { class: 'data-table' },
          h('thead', { class: 'table-head' },
            h('tr', {},
              ['TIME', 'CLIENT', 'TYPE', 'DOMAIN / LABEL', 'LEN', 'NOTE'].map((t) => h('th', { class: 'th' }, t))),
          ),
          h('tbody', { class: 'c-zinc-300' },
            rows.map((r) =>
              h('tr', { class: 'tr' },
                h('td', { class: 'td td-tight' }, r.time),
                h('td', { class: 'td td-tight c-zinc-100' }, r.client),
                h('td', { class: 'td td-tight' }, r.qtype),
                h('td', { class: 'td td-tight td-trunc-w', title: r.domain }, r.domain),
                h('td', { class: 'td td-tight' }, r.labelLen !== undefined && r.labelLen > 0 ? String(r.labelLen) : '—'),
                h('td', { class: 'td td-tight text-[10px] c-zinc-500' }, r.note),
              )),
          ),
        ),
      ),
      h('p', { class: 'mt-2 text-[11px] c-zinc-500' },
        'Baseline notes: mail gateways legitimately fetch ', h('b', { class: 'c-zinc-300' }, 'TXT'), ' records for your own domain (SPF checks) — record type alone is not a verdict. Label length + volume + concentration on one domain is the tunneling triad.'),
    ]),

    WorksetFrame('m4',
      h('div', { class: 'mt-2 grid gap-3 md:grid-cols-2' },
        SwInput({ label: 'Tunneling domain (type it exactly)', value: tunnelDomain, onChange: (v) => actions.setAnswer('m4.domain', v, true), placeholder: 'the one domain that owns the burst', fid: 'in-m4-domain' }),
        h('div', { class: 'grid gap-1' },
          [
            { id: 'plabel', label: 'Long, random-looking subdomain labels (32–52 chars)' },
            { id: 'ptxt', label: 'TXT record type dominates the burst' },
            { id: 'pburst', label: 'Burst volume — 41 queries in 14 minutes from one client' },
            { id: 'pa', label: 'A-record lookups only' },
            { id: 'pshort', label: 'Short, predictable labels' },
            { id: 'psingle', label: 'A single isolated query' },
          ].map((p) => DnsPropCheck(p.id, p.label)),
        ),
      ),
    ),
  )
}

// ═══ MAIL GATE ═══════════════════════════════════════════════════════════════
function mailHeaderText(msg) {
  const rpDom = msg.returnPath.split('@')[1] || 'unknown'
  const fromDom = msg.fromAddr.split('@')[1] || '?'
  return `Received: from mail-out.${rpDom} (HELO relay) by mx.kestrelfreight.example with ESMTPS id k47m2;
        ${msg.time} +0000
Authentication-Results: mx.kestrelfreight.example; spf=${msg.spf} smtp.mailfrom=${rpDom}; dkim=${msg.dkim}; dmarc=${msg.dmarc} header.from=${fromDom}
Return-Path: <${msg.returnPath}>
Reply-To: ${msg.replyTo}
From: "${msg.fromDisplay}" <${msg.fromAddr}>
To: ${msg.to}
Subject: ${msg.subject}
Date: Fri, 17 Oct 2025 ${msg.time} +0000
X-Mailer: Simulated-Gateway-Export (training sample)`
}

function MailGatePanel() {
  const opened = lab.openedMail
  const msg = MAILS.find((m) => m.id === opened) ?? null
  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 04', title: 'MAIL GATE — gateway queue', icon: icon('Mail'),
      desc: 'messages received since 16:50 · select a row for full headers',
      right: StatChip('QUEUE', String(MAILS.length)),
    }, [
      h('div', { class: 'sw-scroll mail-queue-wrap' },
        h('ul', { class: 'mail-queue' },
          MAILS.map((m) =>
            h('li', {},
              h('button', {
                type: 'button', class: 'mail-row' + (opened === m.id ? ' mail-row-open' : ''),
                'aria-expanded': opened === m.id ? 'true' : 'false', 'data-fid': 'mail-' + m.id,
                onclick: () => { actions.openMail(opened === m.id ? null : m.id); renderStage() },
              },
                h('span', { class: 'flex flex-wrap items-center gap-2' },
                  h('span', { class: 'font-mono text-[10px] c-emerald-600' }, m.time),
                  h('span', { class: 'text-xs font-semibold c-zinc-100' }, m.fromDisplay),
                  h('span', { class: 'font-mono text-[10px] c-zinc-500' }, `<${m.fromAddr}>`),
                  TagBadge(m.tag, m.benign),
                ),
                h('span', { class: 'text-xs c-zinc-300' }, m.subject),
                h('span', { class: 'flex flex-wrap gap-1' },
                  AuthBadge('SPF', m.spf),
                  AuthBadge('DKIM', m.dkim),
                  AuthBadge('DMARC', m.dmarc),
                  h('span', { class: 'font-mono text-[9px] c-zinc-600' }, `rcpts:${m.recipients}`),
                ),
              ),
            )),
        ),
      ),

      msg
        ? h('div', { class: 'mail-detail mt-3' },
            h('div', { class: 'mail-detail-head' },
              SectionLabel('Full headers — ' + msg.id),
              h('button', {
                type: 'button', class: 'btn btn-ghost text-[10px]', 'data-fid': 'mail-close',
                onclick: () => { actions.openMail(null); renderStage() },
              }, 'CLOSE'),
            ),
            h('pre', { class: 'sw-scroll mail-headers' }, mailHeaderText(msg)),
            h('div', { class: 'mail-detail-body' },
              h('div', { class: 'section-label mb-1' }, 'Body (verbatim)'),
              h('p', { class: 'mail-body-text' }, msg.body),
              msg.linkDisplay && msg.linkActual
                ? h('div', { class: 'mail-link-box' },
                    h('div', { class: 'c-zinc-400' }, 'DISPLAYED TEXT: ', h('span', { class: 'c-emerald-300' }, msg.linkDisplay)),
                    h('div', { class: 'mt-1 c-zinc-400' }, 'ACTUAL HREF: ', h('span', { class: 'c-rose-300' }, msg.linkActual)),
                  )
                : null,
            ),
          )
        : h('p', { class: 'mt-3 text-[11px] c-zinc-500', role: 'note' }, 'Select a message to inspect its full headers, body and any link mismatch.'),
    ]),

    WorksetFrame('m5',
      h('div', { class: 'mt-2 grid gap-1 md:grid-cols-2' },
        MAIL_FLAGS.map((f) =>
          SwCheck({
            checked: lab.env.mailFlags.includes(f.id),
            onChange: () => { actions.toggleIn('mailFlags', f.id); renderStage() },
            fid: 'chk-m5-' + f.id,
          }, f.label)),
      ),
    ),

    WorksetFrame('m6',
      h('div', { class: 'mt-2 grid gap-2 sm:grid-cols-2' },
        SwInput({ value: lab.env.answers['m6.tmail'] ?? '', onChange: (val) => actions.setAnswer('m6.tmail', val, true), label: 'Email delivered at (HH:MM)', fid: 'in-m6-tmail', placeholder: 'HH:MM' }),
        SwInput({ value: lab.env.answers['m6.topen'] ?? '', onChange: (val) => actions.setAnswer('m6.topen', val, true), label: 'Document opened on WS-FIN-11 (HH:MM)', fid: 'in-m6-topen', placeholder: 'HH:MM' }),
      ),
    ),
  )
}

// ═══ ENDPOINT TRACE ══════════════════════════════════════════════════════════
function EndpointPanel() {
  const mode = lab.mode
  const host = ui.epHost
  const rows = ENDPOINT.filter((e) => (host === 'all' ? true : e.host === host))
  return h('div', { class: 'space-y-6' },
    PanelFrame({
      code: 'MOD 05', title: 'ENDPOINT TRACE — process telemetry', icon: icon('Terminal'),
      desc: 'EDR-style event feed · command lines are truncated training samples',
      right: h('div', { class: 'flex gap-2' },
        [['all', 'ALL HOSTS'], ['WS-FIN-11', 'WS-FIN-11']].map(([k, lbl]) =>
          h('button', {
            type: 'button', class: 'filter-btn ' + (host === k ? 'filter-on' : ''),
            'aria-pressed': host === k ? 'true' : 'false', 'data-fid': 'epf-' + k,
            onclick: () => { ui.epHost = k; renderStage() },
          }, lbl)),
      ),
    },
      h('div', { class: 'sw-scroll ep-feed-wrap' },
        rows.map((e) =>
          h('article', { class: 'ep-card' },
            h('div', { class: 'flex flex-wrap items-center gap-2' },
              h('span', { class: 'font-mono text-[10px] c-emerald-600' }, e.time),
              h('span', { class: 'host-chip' }, e.host),
              h('span', { class: 'font-mono text-[11px] c-zinc-100' },
                e.parent, ' ', h('span', { class: 'c-emerald-500' }, '→'), ' ', e.child),
              h('span', { class: 'sig-chip ' + ((e.sig.includes('UNSIGNED') || e.sig.includes('UNUSUAL')) ? 'sig-warn' : '') }, e.sig),
            ),
            h('p', { class: 'mt-1 ep-cmdline' }, e.cmdline),
            h('div', { class: 'mt-1 flex flex-wrap items-center gap-1.5' },
              e.flags.map((f) => h('span', { class: 'flag-chip' }, f)),
              h('span', { class: 'ml-auto font-mono text-[9px] c-zinc-600' }, e.path),
            ),
          )),
      ),
    ),

    mode === 'medium'
      ? WorksetFrame('m11',
          h('div', { class: 'mt-2 grid gap-2 sm:grid-cols-3' },
            EpInput('m11.parent', 'Parent of powershell.exe'),
            EpInput('m11.flag', 'Suspicious flag in its command line'),
            EpInput('m11.recon', 'One account-recon command run later'),
          ),
        )
      : WorksetFrame('h4',
          h('div', { class: 'mt-2 grid gap-2 sm:grid-cols-2' },
            EpInput('h4.host', 'Compromised host'),
            EpInput('h4.parent', 'Parent of powershell.exe'),
            EpInput('h4.flag', 'Suspicious flag'),
            EpInput('h4.runkey', 'Run-key value name (persistence)'),
          ),
        ),
  )
}

function EpInput(aKey, label) {
  return SwInput({ value: lab.env.answers[aKey] ?? '', onChange: (val) => actions.setAnswer(aKey, val, true), label, fid: 'in-' + aKey })
}
