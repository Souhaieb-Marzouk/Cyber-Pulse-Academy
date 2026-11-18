// ============================================================================
// THE FABRIC BENCH — views: ModeSelect · WorkOrder (C1) · Manual (C2) ·
// ExamBench quiz (C5) · ShiftHandover debrief (C6) · Completion (C7) ·
// Ticket deck · Reset dialog. Copy is 1:1 from Overlays.tsx.
// ============================================================================

'use strict'

// ---------------------------------------------------------------------------
// ModeSelect
// ---------------------------------------------------------------------------
function renderModeSelect() {
  return `
  <div class="mode-select">
    <div class="mode-select-inner">
      <div class="mode-select-head">
        <p class="eyebrow">The Fabric Bench</p>
        <h1 class="mode-title">N10-009 · 2.2 Switching Technologies</h1>
        <p class="mode-tag">VLANs · interface configuration · spanning tree · MTU · jumbo frames — configured on a live, animated fabric for fictional Meridian College. Pick your shift:</p>
      </div>
      <div class="mode-cards">
        <button type="button" class="mode-card" data-testid="mode-medium" data-set-mode="medium">
          <p class="mode-kicker amber">${icon('HardHat', 'ic-16')}Guided wiring</p>
          <p class="mode-name">Medium · learn the craft</p>
          <ul class="mode-list">
            <li>· 12 ordered tasks, each a small win</li>
            <li>· 3-tier hints anywhere, “where to look” guidance</li>
            <li>· Tolerant checking with teaching feedback</li>
            <li>· Knowledge check after practice</li>
          </ul>
          <p class="mode-cta amber">Start the cutover ${icon('ArrowRight', 'ic-14')}</p>
        </button>
        <button type="button" class="mode-card mode-card-hard" data-testid="mode-hard" data-set-mode="hard">
          <p class="mode-kicker red">${icon('ShieldAlert', 'ic-16')}On-call engineer</p>
          <p class="mode-name">Hard · prove the craft</p>
          <ul class="mode-list">
            <li>· 9 tickets, free order, noisy evidence</li>
            <li>· Red herrings included — trust nothing</li>
            <li>· Hints cost stars, strict checks</li>
            <li>· Scenario exam: justify every call</li>
          </ul>
          <p class="mode-cta red">Take the pager ${icon('ArrowRight', 'ic-14')}</p>
        </button>
      </div>
      <p class="mode-note">Progress auto-saves per mode in this browser (localStorage). Synthetic training data only — Meridian College is fictional.</p>
    </div>
  </div>`
}

// ---------------------------------------------------------------------------
// shared manual section block
// ---------------------------------------------------------------------------
const manSection = (title, body) => `
  <div class="man-section">
    <h3 class="man-title">${title}</h3>
    <div class="man-body">${body}</div>
  </div>`

// ---------------------------------------------------------------------------
// WorkOrder (C1) — auto-opens until briefingSeen; every close marks it seen
// ---------------------------------------------------------------------------
function buildWorkOrderDialog(mode) {
  const tableRows = DESIGN.vlans.map(v => `
    <tr>
      <td class="dt-id">${v.id}</td><td>${esc(v.name)}</td><td class="dt-members">${esc(v.members)}</td>
    </tr>`).join('')
  const hardVariant = mode === 'hard'
    ? 'The previous contractor left mid-job: half-configured trunks, shut ports, and a “note”. The ticket deck is on the bench — red herrings included.'
    : 'Everything is factory-default: one flat VLAN 1. You build the segmented network from the work-order table below.'
  return {
    maxWidth: '42rem',
    testid: 'workorder-dialog',
    title: 'Work order MB-2214 — Building B cutover',
    titleIcon: 'ClipboardList',
    description: `<span class="block">Meridian College converted Building B from hubs-and-hope to a switched campus. The hardware is racked: <strong class="t-hi">CORE-1</strong> (main IDF), <strong class="t-hi">ACCESS-B1</strong> (2nd floor, staff wing), <strong class="t-hi">ACCESS-B2</strong> (3rd floor, labs). ${hardVariant}</span>
      <span class="block mt3">This maps to <strong class="t-hi">CompTIA N10-009 objective 2.2 — “Given a scenario, configure switching technologies and features”</strong>: VLANs, interface configuration, spanning tree, MTU, jumbo frames. Configure on the bench; watch every consequence on the fabric.</span>`,
    content: `
      <div class="design-table">
        <p class="dt-cap">Design table (the spec you implement &amp; are audited against)</p>
        <table class="w-full">
          <thead><tr><th>VLAN</th><th>Name</th><th>Members</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <ul class="wo-specs">
        <li>· All switch-to-switch links: 802.1Q trunks, allowed ${TRUNK_ALLOWED_SPEC.join(', ')}, native VLAN ${DESIGN.trunkNative} on both ends.</li>
        <li>· SAN path NAS↔SRV-VMI: MTU 9000 end-to-end. Everything else: 1500.</li>
        <li>· CORE-1: root bridge (priority 4096) + interVLAN routing. Edge ports: PortFast + BPDU Guard. Unused ports: disabled.</li>
      </ul>
      <button type="button" class="btn btn-accent btn-block min44" data-testid="accept-workorder" data-overlay-accept="workorder">Accept work order — open the bench</button>
      <p class="dialog-footnote">Synthetic training environment · all names, MACs and hosts are fictional · simplified STP/autonegotiation</p>`,
  }
}

// ---------------------------------------------------------------------------
// Ticket deck (hard only) — auto-opens until ticketsRead
// ---------------------------------------------------------------------------
function buildTicketDeckDialog() {
  return {
    maxWidth: '36rem',
    testid: 'tickets-dialog',
    title: 'The overnight queue',
    titleIcon: 'Eye',
    description: 'Nine tickets, free order, straight from the NOC queue. The previous contractor left a note taped to the rack — treat it as one opinion, not evidence. DIAG, TESTS and the event feed are your instruments; validation is strict and hints cost.',
    content: `
      <div class="contractor-note">
        <p class="cn-head">${icon('Skull', 'ic-16')}Note from the previous contractor</p>
        <p class="cn-body">“Trunks are clean, I checked them myself. The camera on 3F is hardware-dead — order an RMA. The slowness is a DNS problem, not us. I raised B1's STP priority as a fix. Also disabled the crosslink &amp; STP on B2 after the storm, you're welcome.”</p>
        <p class="cn-foot">— every claim above is a hypothesis. At least two are wrong.</p>
      </div>
      <button type="button" class="btn btn-danger btn-block min44" data-overlay-accept="tickets">Open the ticket board</button>`,
  }
}

// ---------------------------------------------------------------------------
// Manual (C2) — 5 tabs
// ---------------------------------------------------------------------------
const MANUAL_TABS = [
  { id: 'vlan', label: 'VLANs', body: () => `
    ${manSection('Why VLANs exist', `
      <p>A switch ships as one broadcast domain (VLAN 1): every broadcast tickles every host. A <strong class="t-hi">VLAN</strong> partitions a switch into logical Layer-2 segments — each VLAN is its own broadcast domain. Departments, floors, device classes (voice! cameras! servers!) get their own segment without new cabling.</p>
      <p>Attacker value (defensive lens): a flat network gives intruders everything in one segment. Segmentation is the cheapest containment you will ever deploy.</p>`)}
    ${manSection('Access ports, trunks &amp; 802.1Q', `
      <p>An <strong class="t-hi">access port</strong> serves one data VLAN and sends frames untagged. A <strong class="t-hi">trunk</strong> carries many VLANs over one link: the switch inserts a <strong class="t-hi">4-byte 802.1Q tag</strong> after the Source MAC field (TPID 0x8100 · 3 priority bits · 12-bit VLAN ID, 1–4094).</p>
      <p>The <strong class="t-hi">native VLAN</strong> crosses a trunk untagged — both ends must agree, and it should NOT be VLAN 1 (untagged-frames-in-user-space is the classic double-tag hopping foothold).</p>`)}
    ${manSection('Voice VLAN &amp; interVLAN routing', `
      <p>An access port can carry one data VLAN <em>plus</em> a <strong class="t-hi">voice (auxiliary) VLAN</strong> — the phone tags its own frames with VLAN 150 while the PC stays untagged in the data VLAN.</p>
      <p>VLANs never route by themselves. <strong class="t-hi">InterVLAN routing</strong> needs a router: either a Layer-3 switch with one <strong class="t-hi">SVI</strong> per VLAN (modern campus) or a "router-on-a-stick" (one trunked router interface).</p>`)}`,
  },
  { id: 'iface', label: 'IFACES', body: () => `
    ${manSection('Speed, duplex &amp; autonegotiation', `
      <p>Each copper link negotiates speed and duplex. Golden rule: <strong class="t-hi">auto on both ends</strong>, or the SAME forced values on both ends.</p>
      <p>A <strong class="t-hi">duplex mismatch</strong> (one side full, the other half — usually from forcing one end) "works" but produces late collisions, CRC/input errors and miserable throughput. It is the most common silent killer on real networks.</p>`)}
    ${manSection('Port states &amp; hygiene', `
      <p>Administratively down ports report <strong class="t-hi">notconnected/disabled</strong>; a live port shows its negotiated speed/duplex. Describe every port — future-you at 2 a.m. will thank present-you.</p>
      <p>Disable every unused port: a live wall socket is an unguarded door (and a rogue-switch invitation).</p>`)}`,
  },
  { id: 'stp', label: 'STP', body: () => `
    ${manSection('Why spanning tree exists', `
      <p>Ethernet frames have no TTL. Redundant Layer-2 paths loop broadcasts forever — a <strong class="t-hi">broadcast storm</strong> that melts every link it touches. <strong class="t-hi">STP</strong> elects a root bridge and blocks redundant ports, keeping a standby path that unblocks on failure.</p>`)}
    ${manSection('Root election', `
      <p>Every switch advertises a <strong class="t-hi">bridge ID = priority + MAC</strong> in BPDUs (hello every 2 s). <strong class="t-hi">Lowest bridge ID wins</strong> — priority first (default 32768, steps of 4096), lowest MAC breaks ties. Set your distribution switch to 4096 so the crown lands where the topology wants it; a rogue bridge with priority 0 steals the root (and your traffic).</p>`)}
    ${manSection('Variants (memorize the pairs)', `
      <table class="stp-variants">
        <thead><tr><th>Name</th><th>Std</th><th>Convergence</th></tr></thead>
        <tbody>
          ${STP_VARIANTS.map(v => `<tr><td class="v-name">${esc(v.name)}</td><td>${esc(v.std)}</td><td>${esc(v.conv)}</td></tr>`).join('')}
        </tbody>
      </table>
      <p class="mt1">Port roles: root / designated / alternate(blocked). Classic states: blocking→listening→learning→forwarding; RSTP: discarding→learning→forwarding.</p>`)}
    ${manSection('Edge protections', `
      <p><strong class="t-hi">PortFast</strong>: skip listening/learning on edge ports (workstations come up instantly). <strong class="t-hi">BPDU Guard</strong>: if a BPDU appears on such a port, err-disable it — that BPDU is a rogue switch trying to capture your root. Trunks never get these features.</p>`)}`,
  },
  { id: 'mtu', label: 'MTU', body: () => `
    ${manSection('MTU &amp; jumbo frames', `
      <p>Standard Ethernet MTU = <strong class="t-hi">1500 bytes</strong> of IP payload. <strong class="t-hi">Jumbo frames</strong> raise it to ~9000 (vendor max ≈ 9216) — fewer, larger frames means less per-frame overhead for storage traffic (SAN / iSCSI / NAS / backup).</p>
      <p>The catch: <strong class="t-hi">every hop must agree</strong>. The first 1500-MTU hop silently drops an oversized frame and answers <span class="t-amber-mono">ICMP Type 3 Code 4 — "Fragmentation needed"</span>, which is how Path MTU Discovery (PMTUD) learns the path limit. Scope jumbo to the storage path; leave 1500 everywhere else.</p>`)}`,
  },
  { id: 'glos', label: 'GLOSSARY', body: () => `
    <div class="glossary">
      ${GLOSSARY.map(g => `<p class="gloss"><strong class="t-hi-mono">${esc(g.term)}</strong> — ${esc(g.def)}</p>`).join('')}
    </div>`,
  },
]

function buildManualDialog() {
  return {
    maxWidth: '42rem',
    testid: 'manual-dialog',
    title: 'Reference manual — switching technologies',
    titleIcon: 'BookOpenText',
    srDescription: 'Knowledge core: VLANs, interfaces, spanning tree, MTU and jumbo frames, plus the glossary.',
    tabs: MANUAL_TABS,
  }
}

// ---------------------------------------------------------------------------
// Exam bench quiz (C5)
// ---------------------------------------------------------------------------
function buildQuizContent(mode, md) {
  const items = QUIZ[mode]
  const S = Session
  const q = S.quiz
  if (!q.finished) {
    const item = items[q.idx]
    const answeredCount = Object.keys(md.quiz.answers).length
    const options = item.options.map((o, i) => {
      const isPicked = q.picked === i
      const revealState = q.submitted && isPicked ? (q.picked === item.answer ? 'green' : 'red') : 'neutral'
      const cls = q.submitted
        ? (revealState === 'green' ? 'quiz-opt reveal-green' : revealState === 'red' ? 'quiz-opt reveal-red' : 'quiz-opt reveal-neutral')
        : isPicked ? 'quiz-opt picked' : 'quiz-opt'
      return `<button type="button" role="radio" aria-checked="${isPicked}" data-quiz-pick="${i}" data-fk="quiz-${item.id}-${i}" ${q.submitted ? 'disabled' : ''} class="${cls}">
        <span class="quiz-letter">${String.fromCharCode(65 + i)}</span>${esc(o)}
      </button>`
    }).join('')
    const explain = q.submitted ? `
      <div class="${q.picked === item.answer ? 'explain explain-ok' : 'explain explain-bad'}" aria-live="polite">
        <p class="explain-head">${q.picked === item.answer ? '✓ CORRECT' : '✗ NOT QUITE — the explanation below tells you why'}</p>
        <p class="explain-body">${esc(item.explain)}</p>
      </div>` : ''
    const btn = !q.submitted
      ? `<button type="button" class="btn btn-accent btn-flex min44" data-quiz-submit ${q.picked === null ? 'disabled' : ''}>Submit answer</button>`
      : `<button type="button" class="btn btn-accent btn-flex min44" data-quiz-next>${q.idx + 1 >= items.length ? 'See my score' : 'Next question'}</button>`
    return `
      <div class="quiz-flow">
        <p class="quiz-q">${esc(item.q)}</p>
        <div class="quiz-options" role="radiogroup" aria-label="Answer options">${options}</div>
        ${explain}
        <div class="quiz-actions">${btn}</div>
      </div>`
  }
  const pass = md.quiz.score >= 86
  return `
    <div class="quiz-done">
      <p class="quiz-done-cap">Knowledge check complete</p>
      <p class="quiz-score" data-testid="quiz-score">${md.quiz.score}%</p>
      <p class="quiz-done-note">${pass ? 'Exam-ready. Keep this mental model and N10-009 2.2 is yours.' : 'Reread the explanations in the manual, then retake — the fabric remembers nothing and judges no one.'}</p>
      <div class="quiz-actions center">
        <button type="button" class="btn btn-outline min44" data-quiz-restart>Retake</button>
        <button type="button" class="btn btn-accent min44" data-overlay-close>Back to the bench</button>
      </div>
    </div>`
}

function quizHeader(mode, md) {
  const items = QUIZ[mode]
  return `Exam bench — ${mode === 'medium' ? 'concepts' : 'scenarios'} (${Object.keys(md.quiz.answers).length}/${items.length} answered)`
}

// ---------------------------------------------------------------------------
// Debrief (C6)
// ---------------------------------------------------------------------------
function buildDebriefDialog() {
  return {
    maxWidth: '42rem',
    testid: 'debrief-dialog',
    title: 'Shift handover — field notes',
    titleIcon: 'ClipboardList',
    srDescription: 'Synthesis: detections, mitigations, blue-team and red-team takeaways, references.',
    scroll: true,
    content: `
      ${manSection('Detection opportunities (what to monitor)', `
        <ul class="disc">
          <li><strong class="t-hi">Syslog</strong>: native-VLAN mismatch complaints, STP topology changes (a storm of TCNs = trouble), err-disabled ports (BPDU Guard trips), link flaps.</li>
          <li><strong class="t-hi">Interface counters</strong>: rising CRC/late-collisions on one link = duplex mismatch; utilization pegged at 100% on all links = storm.</li>
          <li><strong class="t-hi">Config drift</strong>: periodic diff of running-config vs work order (allowed lists, natives, MTU, priority).</li>
          <li><strong class="t-hi">ICMP</strong>: Type 3 Code 4 surges after an MTU change — someone missed a hop.</li>
        </ul>`)}
      ${manSection('Mitigation recommendations (with references)', `
        <ul class="disc">
          <li>Native VLAN ≠ 1 and consistent on both ends; disable unused ports; PortFast+BPDU Guard on every edge — closes the double-tag hopping and rogue-root doors (related adversary technique, simplified: MITRE <span class="t-amber-mono">T1557 Adversary-in-the-Middle</span>).</li>
          <li>Root priority plan (distribution = 4096, access ≥ 24576) so no one can win the crown with a rogue bridge.</li>
          <li>RSTP everywhere for fast loop recovery; loop prevention is your availability control (flood-style meltdown, simplified: <span class="t-amber-mono">T1498 Network Denial of Service</span>).</li>
          <li>Jumbo MTU scoped to storage paths only; document every port; auto/auto speed-duplex unless forced deliberately on both ends.</li>
        </ul>`)}
      ${manSection('Blue-team takeaways', `
        <ul class="disc">
          <li>Most "mystery slowness" is duplex mismatch or a forgotten trunk VLAN — counters before theology.</li>
          <li>Segmentation you cannot verify is segmentation you do not have: prove isolation with test floods, not vibes.</li>
          <li>STP changes are events: alert on them, know who should be root, and treat any new BPDU speaker as hostile.</li>
        </ul>`)}
      ${manSection('Red-team mindset (know the play, defend the play)', `
        <ul class="disc">
          <li>Double-tag hopping: craft frames with the native VLAN as the outer tag to slip into another VLAN — defeated by native hygiene.</li>
          <li>Rogue root: advertise priority 0, become the center of the topology, see what flows — defeated by BPDU Guard + priority plan.</li>
          <li>One patch cable into two live wall sockets = free denial of service — defeated by disabled spares + loop prevention.</li>
        </ul>`)}
      ${manSection('References (open in new tab)', `
        <ul class="refs">
          <li><a href="https://attack.mitre.org/techniques/T1557/" target="_blank" rel="noopener noreferrer" class="ref-link">MITRE ATT&amp;CK T1557 — Adversary-in-the-Middle${icon('ExternalLink', 'ic-12')}</a></li>
          <li><a href="https://attack.mitre.org/techniques/T1498/" target="_blank" rel="noopener noreferrer" class="ref-link">MITRE ATT&amp;CK T1498 — Network Denial of Service${icon('ExternalLink', 'ic-12')}</a></li>
          <li><a href="https://www.comptia.org/training/by-certification/network/network-plus" target="_blank" rel="noopener noreferrer" class="ref-link">CompTIA Network+ (N10-009) official page${icon('ExternalLink', 'ic-12')}</a></li>
        </ul>
        <p class="dialog-footnote pl">MITRE cross-references are technique-level simplifications for orientation; the CompTIA chapter remains the exam source of truth.</p>`)}`,
  }
}

// ---------------------------------------------------------------------------
// Completion (C7)
// ---------------------------------------------------------------------------
function buildCompletionDialog(mode, md) {
  const defs = OBJECTIVES[mode]
  const rating = starRating(md, defs)
  const complete = allPassed(md, defs)
  const byPillar = ['P1', 'P2', 'P3', 'P4'].map(p => ({
    p, total: defs.filter(d => d.pillar === p).length, passed: defs.filter(d => md.objs[d.id]?.passed).length,
  }))

  // R8 — focus areas derived from THIS run's evidence, never generic filler
  const focus = []
  const failed = defs.filter(d => md.objs[d.id]?.attempts && !md.objs[d.id]?.passed)
  const untried = defs.filter(d => !md.objs[d.id])
  if (failed.length) focus.push({ title: `Retry ${failed.length} checked-but-open objective${failed.length === 1 ? '' : 's'}`, detail: failed.map(d => `${d.title} (${d.anchor})`).join(' · ') })
  if (untried.length) focus.push({ title: `${untried.length} objective${untried.length === 1 ? '' : 's'} not started`, detail: untried.map(d => `${d.title} (${d.anchor})`).join(' · ') })
  const weakest = [...byPillar].filter(p => p.total > 0 && p.passed < p.total).sort((a, b) => a.passed / a.total - b.passed / b.total)[0]
  if (weakest) focus.push({ title: `Weakest pillar: ${weakest.p} ${PILLAR_LABEL[weakest.p].label}`, detail: `${weakest.passed}/${weakest.total} passed — reread the matching manual section, then work the ${weakest.p} objectives again.` })
  const wrongQuiz = md.quiz.done ? QUIZ[mode].filter(q => md.quiz.answers[q.id] !== q.answer) : []
  if (wrongQuiz.length) focus.push({ title: `Exam bench: ${wrongQuiz.length}/${QUIZ[mode].length} missed`, detail: wrongQuiz.map(q => q.focus).join(' · ') })
  if (!md.quiz.done) focus.push({ title: 'Exam bench untouched', detail: 'The knowledge check is part of the sign-off — open it from the mast (GraduationCap icon).' })
  if (!focus.length) focus.push({ title: 'Clean sweep — no weak spots detected', detail: `Push for 3★ next run: ${Math.round(rating.firstTryRatio * 100)}% first-try accuracy and ${rating.hints} hint${rating.hints === 1 ? '' : 's'} used this run.` })

  return {
    maxWidth: '32rem',
    testid: 'completion-dialog',
    title: complete ? 'Shift complete — Building B signed off' : 'Shift progress',
    titleIcon: 'HardHat',
    srDescription: 'Completion summary with stars and pillar recap.',
    content: `
      <div class="completion">
        <div class="comp-stats">
          <div class="text-center">
            <p class="comp-big amber" data-testid="star-rating">${'★'.repeat(rating.stars)}<span class="t-dim">${'★'.repeat(3 - rating.stars)}</span></p>
            <p class="comp-cap">star rating</p>
          </div>
          <div class="text-center">
            <p class="comp-big" data-testid="completion-score">${rating.passed}/${rating.total}</p>
            <p class="comp-cap">objectives</p>
          </div>
          <div class="text-center">
            <p class="comp-big">${md.quiz.done ? `${md.quiz.score}%` : '—'}</p>
            <p class="comp-cap">exam bench</p>
          </div>
        </div>
        <div class="pillars">
          <p class="cap">Mastery pillars</p>
          <div class="pillar-rows">
            ${byPillar.map(({ p, total, passed }) => `
              <div class="pillar-row">
                ${icon('CheckCircle2', `ic-14 ${passed === total ? 't-green' : 't-dim2'}`)}
                <span class="pillar-id">${p}</span>
                <div class="pillar-track"><div class="pillar-fill" style="width:${total ? (passed / total) * 100 : 0}%"></div></div>
                <span class="pillar-count">${passed}/${total}</span>
              </div>`).join('')}
          </div>
          <p class="dialog-footnote">Stars = first-attempt accuracy (${Math.round(rating.firstTryRatio * 100)}% of passed were first-try) + hint use (${rating.hints}). 3★: ≥80% first-try &amp; ≤4 hints · 2★: ≥50% first-try or ≤8 hints.</p>
        </div>
        ${complete
          ? `<div class="comp-banner ok">You can now explain, recognize, detect and mitigate every technology in N10-009 2.2 — on a fabric you built and broke yourself. Next stops: <strong class="t-hi">2.3 configure networking devices</strong>, then Domain 5 troubleshooting drills.</div>`
          : `<div class="comp-banner warn">${rating.total - rating.passed} objective${rating.total - rating.passed === 1 ? '' : 's'} still open${!md.quiz.done ? ' and the exam bench is untouched' : ''}. The bench is not going anywhere.</div>`}
        <div class="focus-box">
          <p class="cap amber-cap">Focus areas — derived from this run</p>
          <ul class="disc focus-list">
            ${focus.map(f => `<li><strong class="t-hi">${esc(f.title)}</strong> — ${esc(f.detail)}</li>`).join('')}
          </ul>
        </div>
        <div class="quiz-actions">
          <button type="button" class="btn btn-accent btn-flex min44" data-overlay-close-completion>Back to the bench</button>
        </div>
      </div>`,
  }
}

// ---------------------------------------------------------------------------
// Reset dialog
// ---------------------------------------------------------------------------
function buildResetDialog() {
  return {
    maxWidth: '24rem',
    testid: 'reset-dialog',
    title: 'Reset the bench?',
    titleIcon: 'RefreshCcw',
    danger: true,
    description: 'This wipes progress in BOTH modes (objectives, answers, quiz, environment, log) and restores the pristine fabric. There is no undo — by design, like production.',
    content: `
      <div class="quiz-actions">
        <button type="button" class="btn btn-outline btn-flex min44" data-overlay-close>Keep my work</button>
        <button type="button" class="btn btn-destructive btn-flex min44" data-testid="confirm-reset" data-reset-confirm>Wipe &amp; restart</button>
      </div>`,
  }
}
