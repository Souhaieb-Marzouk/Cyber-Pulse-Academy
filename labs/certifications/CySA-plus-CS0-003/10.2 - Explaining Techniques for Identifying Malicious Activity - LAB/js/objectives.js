// ── SIGNALWATCH · objective definitions + validation engine (js/objectives.js)
// 1:1 static port of src/components/signal-watch/objectives.ts.
// Every objective is machine-checkable against EnvState and carries
// educational feedback for both outcomes plus 3-tier hints.

// ── normalization helpers ───────────────────────────────────────────────────
const norm = (s) =>
  (s ?? '').trim().toLowerCase().replace(/[[\]()"']/g, '').replace(/\s+/g, ' ')

const cleanIp = (s) => norm(s).replace(/\s*dot\s*/g, '.').replace(/\.{2,}/g, '.')

const has = (hay, needle) => norm(hay).includes(needle)

const sameSet = (a, b) =>
  a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')

const isSet = (a, b) => b.every((x) => a.includes(x)) && a.every((x) => b.includes(x))

// ── rule bench evaluation ───────────────────────────────────────────────────
const RULE_TOLERANCE = {
  '60-5': [55, 65],
  '60-30': [30, 90],
  '300-5': [295, 305],
}

function evaluateRule(interval, minS, host) {
  const range = RULE_TOLERANCE[interval]
  const min = parseInt(minS || '0', 10)
  const matched = []
  for (const f of FLOWS) {
    if (f.intervalSec === 0) continue
    if (host === 'wsfin' && f.src !== 'WS-FIN-11') continue
    if (host === 'srvseg' && !f.src.startsWith('SRV')) continue
    if (range) {
      const [lo, hi] = range
      if (f.intervalSec < lo || f.intervalSec > hi) continue
    }
    if (f.sessions < min) continue
    matched.push(f.id)
  }
  const targetMatched = matched.includes('g05')
  const benignMatched = matched.filter((id) => id !== 'g05')
  const latency = targetMatched ? Math.min(min, 34) : Infinity
  let note = 'Rule compiled.'
  if (matched.length === 0) note = 'Rule compiled — no sessions in the watch window match.'
  else if (!targetMatched && benignMatched.length > 0) note = 'Rule compiled — matches benign groups only. It never sees the beacon.'
  else if (targetMatched && benignMatched.length > 0) note = 'Rule compiled — beacon caught, but benign groups fire too. Tune before deploying.'
  else if (targetMatched) note = 'Rule compiled — beacon caught, zero benign groups. Clean detection.'
  return { matched, benignMatched, targetMatched, latencyMin: latency, note }
}

// ── objective sets ──────────────────────────────────────────────────────────
const MEDIUM = [
  {
    id: 'm1',
    pillar: 'understand',
    title: 'Name the monitoring streams',
    brief: 'From the lesson brief, select the two activity streams to monitor AND the two example event types it calls out.',
    context: 'The lesson opens with the "where to watch": two streams carry most early indicators, and two host events are named as classic signals.',
    hints: [
      'Re-read the lesson detail: "monitor network and email activity… events, such as installing new software or using administrative command line tools."',
      'The two streams are network traffic and email activity. The two events are about software installs and admin command-line use.',
      'Select: Network traffic · Email activity · Installing new software · Administrative command-line tools. Leave badge logs and CRM stats unchecked.',
    ],
    pointTo: 'brief',
    anchor: 'Lesson detail — "monitor network and email activity" + event examples',
    validate: (env) => {
      const sel = env.answers['m1.sel'] ? env.answers['m1.sel'].split(',').filter(Boolean) : []
      if (sameSet(sel, LESSON_CORRECT))
        return { pass: true, feedback: 'Correct. Network + email are the two primary streams; software installs and admin CLI use are the named event indicators. Everything else in the lesson hangs off these four.' }
      return {
        pass: false,
        feedback:
          sel.length !== 4
            ? 'Four boxes should be checked: two streams and two event examples. Badge and CRM data are monitored elsewhere in security, but they are not what THIS lesson names.'
            : 'Some of the four selections are off. The lesson names the two streams explicitly ("network and email activity") and two events (new software installs, administrative command-line tools).',
      }
    },
  },
  {
    id: 'm2',
    pillar: 'understand',
    title: 'Classify the indicator categories',
    brief: 'Match each definition to its indicator category: unusual traffic pattern, protocol behavior, or indicator event.',
    context: 'The lesson sorts indicators into three buckets. You will re-use these buckets every time you triage.',
    hints: [
      'Rhythm/volume/timing → traffic pattern. Protocol used "wrong" → protocol behavior. Discrete host action → event.',
      'The "regular callbacks" definition is the traffic-pattern one; "DNS carrying encoded data" is protocol behavior.',
      'Pattern = rhythm/volume/timing. Protocol = DNS carrying encoded data / FTP on odd port. Event = software install, admin CLI.',
    ],
    pointTo: 'brief',
    anchor: 'Lesson detail — "unusual traffic patterns, protocol behavior, or events"',
    validate: (env) => {
      const a = env.selects['m2.pattern']
      const b = env.selects['m2.protocol']
      const c = env.selects['m2.event']
      if (a === 'traffic' && b === 'protocol' && c === 'event')
        return { pass: true, feedback: 'Correct. Keep this triad in your head: pattern (rhythm/volume), protocol (misuse), event (host action). The whole lesson is organized around it.' }
      const wrong = [
        a !== 'traffic' && 'the rhythm/volume definition',
        b !== 'protocol' && 'the DNS-carries-data definition',
        c !== 'event' && 'the discrete-host-action definition',
      ].filter(Boolean)
      return { pass: false, feedback: `Re-check ${wrong.join(' and ')}. Rhythm/volume = traffic pattern; a protocol used "wrong" = protocol behavior; a discrete action like an install = event.` }
    },
  },
  {
    id: 'm3',
    pillar: 'recognize',
    title: 'Find the beacon',
    brief: 'In FLOWSCOPE, identify the beaconing connection group: enter its destination IP and its repeat interval (seconds).',
    context: 'Beaconing is a machine-regular rhythm of small outbound sessions — C2 reporting home.',
    hints: [
      'Look for a group with many sessions (30+) and a note like "every 60 s".',
      'The suspicious group repeats every 60 seconds ±2 s to an IP whose owner reads "UNREGISTERED (sim)".',
      'Destination: 203.0.113.77 · interval: 60.',
    ],
    pointTo: 'flow',
    anchor: 'Traffic-pattern indicator — regular-interval callbacks (T1071.001)',
    validate: (env) => {
      const ipOk = cleanIp(env.answers['m3.ip']) === '203.0.113.77'
      const iv = norm(env.answers['m3.interval'])
      const ivOk = /(^|\D)60(\D|$)/.test(iv) && !iv.includes('300') && !iv.includes('90')
      if (ipOk && ivOk) return { pass: true, feedback: 'Beacon confirmed: 34 sessions every 60 s ±2 s to 203.0.113.77 (owner: UNREGISTERED). Regular interval + tiny payloads + unregistered owner = C2 heartbeat (T1071.001).' }
      if (!ipOk && ivOk) return { pass: false, feedback: 'Interval is right, but the destination IP is wrong. The beaconing row runs 18:09→03:58 from WS-FIN-11 — check its destination IP column.' }
      if (ipOk && !ivOk) return { pass: false, feedback: 'IP is right. The interval is shown in the group\'s note field: the same destination is touched once every N seconds — count it.' }
      return { pass: false, feedback: 'Both values are off. Sort for the group with 34 sessions spanning 18:09→03:58 and read its destination + interval note.' }
    },
  },
  {
    id: 'm4',
    pillar: 'recognize',
    title: 'Expose the DNS tunnel',
    brief: 'In DNS WIRE, identify the tunneling domain and check ALL three properties that give it away.',
    context: 'DNS tunneling smuggles data inside queries: bursty TXT lookups, long encoded labels, one dominant domain.',
    hints: [
      'Filter for TXT queries from WS-FIN-11 between 03:00 and 03:14.',
      '41 TXT queries in 14 minutes, labels 32–52 chars, all under one external domain.',
      'Domain: cdn-metrics.example. Properties: long random-looking labels · TXT record type · burst volume (41 queries in 14 min).',
    ],
    pointTo: 'dns',
    anchor: 'Protocol-behavior indicator — DNS abuse (T1071.004)',
    validate: (env) => {
      const domOk = has(env.answers['m4.domain'], 'cdn-metrics')
      const propsOk = isSet(env.dnsProps, ['plabel', 'ptxt', 'pburst'])
      if (domOk && propsOk) return { pass: true, feedback: 'Tunnel exposed: 41 TXT queries in 14 min with 32–52-char encoded labels under cdn-metrics.example — textbook DNS tunneling (T1071.004). Contrast: the MX gateway\'s own-domain TXT lookups are SPF checks — benign TXT traffic exists.' }
      if (!domOk) return { pass: false, feedback: 'Domain missing or wrong. Only ONE external domain receives the 03:00–03:14 burst from WS-FIN-11 — it also got a lone A lookup at 02:59.' }
      return { pass: false, feedback: `Domain is right, but the three giveaway properties aren't all selected. Exactly three: label length/entropy, record type, and burst volume. ${env.dnsProps.length > 3 ? 'You have extras — e.g. "A-record only" and "short names" contradict the evidence.' : 'You are missing some.'}` }
    },
  },
  {
    id: 'm5',
    pillar: 'recognize',
    title: 'Dissect the phishing email',
    brief: 'Open the suspicious message in MAIL GATE and check all five header/body red flags (and nothing else).',
    context: 'Header analysis beats gut feeling: envelope fields and auth results expose what the attacker forged.',
    hints: [
      'One message is tagged PHISH by the gateway heuristics… but verify manually — do not trust the tag alone.',
      'Compare: sender domain vs the real company domain; Return-Path vs From; SPF/DKIM/DMARC results; link text vs href; tone.',
      'The five: lookalike sender domain · Return-Path on a bulk-mailer domain · SPF fail/DMARC fail · displayed link ≠ actual href · urgency+threat language.',
    ],
    pointTo: 'mail',
    anchor: 'Email-activity indicators — header analysis, lookalike domains, social engineering',
    validate: (env) => {
      if (sameSet(env.mailFlags, MAIL_FLAG_CORRECT))
        return { pass: true, feedback: 'All five flags verified against the raw evidence. Note what you did NOT select: logos, HTML and delivery time are not indicators — that discipline (signal vs noise) is the analyst\'s edge.' }
      const extra = env.mailFlags.filter((f) => !MAIL_FLAG_CORRECT.includes(f))
      if (extra.length > 0)
        return { pass: false, feedback: 'You selected at least one non-indicator. Company logos appear in real IT mail; HTML is normal; 17:42 is a normal hour. Stick to spoofing and coercion evidence: sender domain, envelope mismatch, auth results, link mismatch, tone.' }
      return { pass: false, feedback: `You have ${env.mailFlags.length} of 5. Re-examine the full header block (Return-Path, auth results) and the link — hover text vs actual destination.` }
    },
  },
  {
    id: 'm6',
    pillar: 'recognize',
    title: 'Correlate the timeline',
    brief: 'Correlate MAIL GATE with ENDPOINT TRACE: enter when the phishing email was delivered and when the document was opened on WS-FIN-11.',
    context: 'Single-source sightings are weak; correlation across streams is what turns indicators into an incident.',
    hints: [
      'The mail queue shows delivery time; the endpoint trace shows the winword.exe event.',
      'Find message e01\'s timestamp, then the timestamp of the Statement_0417.docm event.',
      'Delivered 17:42 · document opened 18:07 (18:07:32 exactly).',
    ],
    pointTo: 'mail',
    anchor: 'Cross-stream correlation — email → endpoint event',
    validate: (env) => {
      const t1 = norm(env.answers['m6.tmail'])
      const t2 = norm(env.answers['m6.topen'])
      const ok1 = /17[:.]42/.test(t1)
      const ok2 = /18[:.]0[0-9]/.test(t2)
      if (ok1 && ok2) return { pass: true, feedback: 'Chain linked: delivered 17:42 → opened 18:07 — a 25-minute gap between lure and execution. That gap is your detection window: anything that had caught the email earlier would have pre-empted the endpoint event.' }
      if (!ok1) return { pass: false, feedback: 'The delivery time is off. The queue lists each message with its exact delivery timestamp — the phishing one is e01.' }
      return { pass: false, feedback: 'Delivery time is right, but the open time is not. In ENDPOINT TRACE, the first WS-FIN-11 event is explorer.exe → winword.exe with Statement_0417.docm — read its timestamp.' }
    },
  },
  {
    id: 'm7',
    pillar: 'detect',
    title: 'Pick the right instrument',
    brief: 'Match each malicious-activity signal to the data source that exposes it most directly (5 matches).',
    context: 'Lesson objective 1.3 is tool selection: the right source turns a hunt from days to minutes.',
    hints: [
      'Think "where does the evidence physically live?" — rhythm lives in flow records, names live in DNS answers.',
      'Installations and CLI abuse are host-side events: EDR and process audit logs. Email lives at the gateway.',
      'Beaconing→NetFlow · tunneling→DNS logs · installs→EDR telemetry · phishing→mail gateway logs · admin CLI→process audit logs.',
    ],
    pointTo: 'dispatch',
    anchor: 'Objective 1.3 — tool/technique selection per indicator type',
    validate: (env) => {
      const ok = DS_ROWS.every((r, i) => env.selects[`m7.${i}`] === r.answer)
      if (ok) return { pass: true, feedback: 'All five correct. Notice the split: traffic patterns live in NetFlow, protocol abuse in protocol logs, host events in EDR/process logs, email at the gateway — no single instrument sees everything.' }
      const wrong = DS_ROWS.filter((r, i) => env.selects[`m7.${i}`] !== r.answer).map((r) => r.signal)
      return { pass: false, feedback: `${wrong.length} of 5 mismatched. Reconsider: "${wrong[0]}" — where does that evidence physically get recorded?` }
    },
  },
  {
    id: 'm8',
    pillar: 'detect',
    title: 'Tune a beacon detection',
    brief: 'In RULE BENCH, configure a rule that catches the beacon with ZERO benign groups in the replay — then run the test.',
    context: 'Detection engineering: every rule must be proven against the baseline, or it just manufactures noise.',
    hints: [
      'Start from the beacon\'s rhythm: 60 s. A tolerance of ±30 s also admits the 90 s health-checker.',
      'Set interval 60 s ±5 s. Then decide whether you can afford host=ANY (generic) — test it.',
      'Interval 60 s ±5 s · any host · min sessions 10 → test shows exactly g05.',
    ],
    pointTo: 'rules',
    anchor: 'True vs false positives — tuning against the baseline',
    validate: (env) => {
      const r = evaluateRule(env.ruleInterval, env.ruleMin, env.ruleHost)
      if (r.targetMatched && r.benignMatched.length === 0)
        return { pass: true, feedback: `Clean rule: catches g05 only, zero benign fires${env.ruleHost === 'any' ? ', and it is host-generic — it would catch the same pattern on any workstation' : ''}. ${env.ruleInterval === '60-5' ? 'The ±5 s tolerance is the key: widening to ±30 s admits the 90 s health-checker.' : 'Host pinning works, but the attacker only needs one new host to evade it.'}` }
      if (r.benignMatched.length > 0)
        return { pass: false, feedback: `Your rule fires on benign groups: ${r.benignMatched.join(', ')} (${r.benignMatched.includes('g07') ? 'NTP every 300 s' : 'health-checker every 90 s'}). Tighten the interval tolerance — the beacon is machine-regular at 60 s.` }
      return { pass: false, feedback: 'The rule does not see the beacon at all. Check the interval window against g05\'s "every 60 s ±2 s" and make sure the session minimum is below 34.' }
    },
  },
  {
    id: 'm9',
    pillar: 'mitigate',
    title: 'Choose containment actions',
    brief: 'On the ACTION BOARD, enable exactly the four containment actions the evidence supports.',
    context: 'Containment must stop the bleeding without breaking the business — and every action should trace back to evidence.',
    hints: [
      'Four actions: one for the host, one for the network channels, one for the mail, one for the identity.',
      'Reimaging servers and uninstalling PowerShell are overreach; waiting is negligence while exfil runs.',
      'Enable: isolate WS-FIN-11 · block attacker egress + sinkhole domains · purge mailboxes + block sender · force credential reset.',
    ],
    pointTo: 'actions',
    anchor: 'Response to identified malicious activity',
    validate: (env) => {
      if (isSet(env.actionsOn, ACTION_CORRECT))
        return { pass: true, feedback: 'Containment set. Host isolated, channels cut, lure removed, identity rotated — and you rejected overreach (no server reimage) and delay. Sequencing comes later; correctness comes first.' }
      const bad = env.actionsOn.filter((a) => !ACTION_CORRECT.includes(a))
      if (bad.length > 0) return { pass: false, feedback: 'At least one enabled action is not supported by the evidence (or is actively harmful). Ask of each: which indicator does this stop, and what does it cost us?' }
      return { pass: false, feedback: `${env.actionsOn.length} of 4 enabled. Cover all four damage vectors: the compromised host, the C2/exfil channels, the mailbox lure, the captured credentials.` }
    },
  },
  {
    id: 'm10',
    pillar: 'understand',
    title: 'Map to ATT&CK',
    brief: 'On the ATT&CK BOARD, assign the correct technique ID to each observed artifact (6 chips).',
    context: 'ATT&CK mapping turns observations into shared language for detection content and threat intel.',
    hints: [
      'Phishing link → T1566.002; attachment phish is T1566.001 (not ours).',
      'Encoded PowerShell is T1059.001; plain cmd.exe shell would be T1059.003.',
      'T1566.002 · T1059.001 · T1105 · T1071.001 · T1071.004 · T1048.003 — in chip order.',
    ],
    pointTo: 'attack',
    anchor: 'MITRE mapping of every observed indicator',
    validate: (env) => {
      const wrong = ATTACK_CHIPS.filter((c) => env.selects[`m10.${c.key}`] !== c.tid)
      if (wrong.length === 0) return { pass: true, feedback: 'Full map correct: Initial Access → Execution → C2/ingress → C2 → C2(DNS) → Exfiltration. This chain position view is how you communicate scope in one line.' }
      return { pass: false, feedback: `${wrong.length} of 6 chips mis-mapped — first wrong: "${wrong[0].label}". Distractors exist for a reason: T1566.001 is attachment phishing; T1059.003 is the plain Windows command shell. Match the evidence, not the family.` }
    },
  },
  {
    id: 'm11',
    pillar: 'recognize',
    title: 'Read the process chain',
    brief: 'In ENDPOINT TRACE, identify: the parent of powershell.exe, the suspicious flag in its command line, and one account-recon command run later.',
    context: '"Administrative command line tools" is a lesson headline — the parent-child lineage is what separates abuse from administration.',
    hints: [
      'Find the 18:07:58 powershell.exe event on WS-FIN-11.',
      'Office processes never legitimately spawn PowerShell with that flag; and later, cmd.exe runs two recon commands.',
      'Parent: winword.exe · flag: -enc (encoded command) · recon: whoami (or net localgroup).',
    ],
    pointTo: 'endpoint',
    anchor: 'Administrative CLI abuse — parent/child anomaly, encoded command (T1059.001)',
    validate: (env) => {
      const p = has(env.answers['m11.parent'], 'winword')
      const f = has(env.answers['m11.flag'], 'enc') || has(env.answers['m11.flag'], 'encodedcommand')
      const r = has(env.answers['m11.recon'], 'whoami') || has(env.answers['m11.recon'], 'net localgroup')
      const missing = [!p && 'parent', !f && 'flag', !r && 'recon command'].filter(Boolean)
      if (missing.length === 0)
        return { pass: true, feedback: 'Lineage read correctly: winword.exe → powershell.exe -enc, then whoami/net localgroup recon. The parent-child anomaly is the crown jewel here — EDR lineage beats string-matching every time.' }
      return { pass: false, feedback: `Still missing: ${missing.join(', ')}. The powershell.exe row shows parent, full command line and later the cmd.exe recon pair.` }
    },
  },
  {
    id: 'm12',
    pillar: 'mitigate',
    title: 'Map controls to attack stages',
    brief: 'For each preventive control, select which attack stage it primarily disrupts (4 controls).',
    context: 'Mitigation is layered: each control starves a different link of the chain.',
    hints: [
      'Mail filtering acts before anything executes; execution prevention acts at the host; egress and DNS filtering act on the channels.',
      'SPF/DMARC enforcement is about delivery; constrained PowerShell is about execution.',
      'Mail filter→Phishing delivery · Execution prevention→Macro/PowerShell · Egress filtering→C2 beaconing · DNS filtering→DNS tunneling.',
    ],
    pointTo: 'actions',
    anchor: 'Preventive control selection per chain stage (official M-IDs in Debrief)',
    validate: (env) => {
      const ok = CONTROLS.every((c) => env.selects[`m12.${c.id}`] === c.stage)
      if (ok)
        return { pass: true, feedback: 'Layered defense mapped: delivery, execution, C2, tunneling each starved by a different control. No single control would have stopped this intrusion — the chain is only as strong as its weakest link, for both sides.' }
      const wrong = CONTROLS.filter((c) => env.selects[`m12.${c.id}`] !== c.stage)
      return { pass: false, feedback: `${wrong.length} of 4 mis-mapped. "${wrong[0].control}" — at which moment of the chain does this control actually intervene?` }
    },
  },
]

const HARD = [
  {
    id: 'h1',
    pillar: 'recognize',
    title: 'Triage the flow floor',
    brief: 'Classify all seven highlighted connection groups in FLOWSCOPE as MALICIOUS or BENIGN. The floor contains red herrings.',
    context: '',
    hints: [
      'Regular interval alone is not malice — check owner, direction, window and payload size against the baseline.',
      '22 GB at 02:00 internal = backup. 300 s NTP = baseline. 90 s partner health-check = baseline. Small 60 s callbacks to an unregistered owner are not baseline.',
      'MALICIOUS: g03 (first contact), g04 (41 MB payload pull), g05 (60 s beacon), g09 (1.18 GB FTP :2121 at 03:00). BENIGN: g06, g07, g08.',
    ],
    pointTo: 'flow',
    anchor: 'Traffic-pattern indicators incl. volume spikes, out-of-hours, ownership anomalies + FP judgment',
    validate: (env) => {
      const need = FLOWS.filter((f) => ['g03', 'g04', 'g05', 'g09', 'g06', 'g07', 'g08'].includes(f.id))
      const wrong = need.filter((f) => (env.flowTriage[f.id] === 'mal') !== !f.benign)
      const missing = need.filter((f) => !env.flowTriage[f.id])
      if (missing.length > 0) return { pass: false, feedback: `${missing.length} group(s) still unclassified — every highlighted row needs a verdict.` }
      if (wrong.length === 0) return { pass: true, feedback: '7/7. You resisted three baseline traps (backup volume, NTP cadence, partner poller) and caught all four hostile flows — including exfil volume on a misused port. This is the lesson\'s whole discipline in one table.' }
      const w = wrong[0]
      return { pass: false, feedback: `First error at ${w.id} (${w.src} → ${w.dstIp}:${w.port}). Re-judge against the baseline: owner, expected window, payload size and interval regularity together — never one signal alone.` }
    },
  },
  {
    id: 'h2',
    pillar: 'recognize',
    title: 'Reconstruct the attack chain',
    brief: 'Order the six chain events from earliest to latest in the ALERT QUEUE module.',
    context: '',
    hints: [
      'The mail delivers before anything executes; the download precedes the beacon; exfil comes last.',
      'Delivery 17:42 → docm opened 18:07 → encoded PowerShell 18:07:58 → certutil 18:08 → beacon 18:09 → exfil 03:00.',
      'Order: e1, e2, e3, e4, e5, e6.',
    ],
    pointTo: 'alerts',
    anchor: 'Full lifecycle: preconditions → execution → artifacts → detection',
    validate: (env) => {
      const order = env.chainOrder
      if (order.length < CHAIN_ITEMS.length) return { pass: false, feedback: 'All six events must appear in the timeline before it can be committed.' }
      const ok = CHAIN_ITEMS.every((c, i) => order[i] === c.id)
      if (ok) return { pass: true, feedback: 'Chain reconstructed. Note the shape: 25 min lure-to-open, <1 s macro-to-download, then hours of quiet C2 before exfil at 03:00 — quiet periods are where detection should have fired first.' }
      const firstBad = CHAIN_ITEMS.findIndex((c, i) => order[i] !== c.id)
      return { pass: false, feedback: `Position ${firstBad + 1} is wrong. Anchor on hard timestamps: delivery 17:42, winword 18:07:32, powershell 18:07:58, certutil 18:08, beacon from 18:09, exfil 03:00–03:14.` }
    },
  },
  {
    id: 'h3',
    pillar: 'detect',
    title: 'Engineer the optimal rule',
    brief: 'RULE BENCH: author the detection that catches the beacon with ZERO benign fires, host-GENERIC scope, and the EARLIEST possible reliable detection. Test it.',
    context: '',
    hints: [
      'Generic means host=ANY. Zero benign fires constrains the interval tolerance.',
      '±30 s admits the 90 s health-checker; ±5 s excludes it. Earliest detection = lowest session minimum that still only matches the beacon.',
      'Interval 60 s ±5 s · min sessions 3 · host ANY.',
    ],
    pointTo: 'rules',
    anchor: 'Detection engineering: precision, generality and detection latency trade-offs',
    validate: (env) => {
      const r = evaluateRule(env.ruleInterval, env.ruleMin, env.ruleHost)
      const strict = env.ruleInterval === '60-5' && env.ruleMin === '3' && env.ruleHost === 'any'
      if (strict) return { pass: true, feedback: 'Optimal: fires 3 minutes into the beacon, on any host, zero false positives. Every relaxation costs — ±30 s admits the 90 s poller, higher minimums delay detection, host pinning breaks generality. This is the whole trade-space in three fields.' }
      if (r.targetMatched && r.benignMatched.length === 0)
        return { pass: false, feedback: 'Zero benign fires — but not yet optimal. ' + (env.ruleHost !== 'any' ? 'Host-pinning works but is whack-a-mole: require host=ANY. ' : '') + (env.ruleMin !== '3' ? `Minimum ${env.ruleMin} delays first detection to ${env.ruleMin} min — 3 sessions still yields zero FPs. ` : '') + (env.ruleInterval !== '60-5' ? 'Check the tolerance: the widest window that still excludes both the 90 s poller and the 300 s NTP is ±5 s.' : '') }
      if (r.benignMatched.length > 0) return { pass: false, feedback: `Benign fires at ${r.benignMatched.join(', ')} — the tolerance is too wide (±30 s admits the 90 s health-checker) or the interval is wrong.` }
      return { pass: false, feedback: 'The beacon is not detected. It repeats every 60 s ±2 s with 34 sessions — set the interval window and a minimum the beacon can satisfy.' }
    },
  },
  {
    id: 'h4',
    pillar: 'recognize',
    title: 'Deep-dive the compromised host',
    brief: 'ENDPOINT TRACE: report the compromised host, powershell\'s parent, the suspicious flag, and the Run-key value name that gives persistence.',
    context: '',
    hints: [
      'All four answers live on the WS-FIN-11 timeline plus the installer-write event.',
      'The installer event writes a HKCU Run key — its value name is quoted verbatim.',
      'WS-FIN-11 · winword.exe · -enc · PDFOptHelper.',
    ],
    pointTo: 'endpoint',
    anchor: 'New software installation event + persistence artifact',
    validate: (env) => {
      const parts = [
        [has(env.answers['h4.host'], 'ws-fin-11') || has(env.answers['h4.host'], 'wsfin11'), 'host'],
        [has(env.answers['h4.parent'], 'winword'), 'parent process'],
        [has(env.answers['h4.flag'], 'enc'), 'encoded-command flag'],
        [has(env.answers['h4.runkey'], 'pdfopt'), 'Run-key value name'],
      ]
      const missing = parts.filter(([ok]) => !ok).map(([, n]) => n)
      if (missing.length === 0) return { pass: true, feedback: 'Full host story: WS-FIN-11, winword.exe → powershell.exe -enc, payload installs "PDF Optimizer Pro" and persists via HKCU Run key PDFOptHelper. The unsigned installer in %TEMP% plus a Run key is an install-event indicator AND a persistence artifact in one.' }
      return { pass: false, feedback: `Missing or wrong: ${missing.join(', ')}. Walk the WS-FIN-11 events in order; the installer-write row (ep05) carries the Run key verbatim.` }
    },
  },
  {
    id: 'h5',
    pillar: 'mitigate',
    title: 'Sequence the containment',
    brief: 'ACTION BOARD: enable exactly the four evidence-supported actions, in the correct response order (enable order = sequence).',
    context: '',
    hints: [
      'Order by dependency: what stops ongoing damage first? Identity resets before or after channel cuts?',
      'Isolate the host, then cut channels, then remove the lure from mailboxes, then rotate the credential the attacker may hold.',
      'Sequence: a1 isolate → a2 block egress+sinkhole → a3 purge mail → a4 reset credentials.',
    ],
    pointTo: 'actions',
    anchor: 'Trade-offs, sequencing and residual risk in mitigation',
    validate: (env) => {
      const on = env.actionsOn
      if (!isSet(on, ACTION_CORRECT)) {
        const bad = on.filter((a) => !ACTION_CORRECT.includes(a))
        if (bad.length > 0) return { pass: false, feedback: 'An unsupported action is enabled — every action must trace to an indicator and survive a cost check.' }
        return { pass: false, feedback: `${on.length} of 4 required actions enabled.` }
      }
      const ok = ACTION_ORDER.every((id, i) => on[i] === id)
      if (ok) return { pass: true, feedback: 'Sequence committed: isolate → block → purge → reset. Residual risks you should still carry: unknown second-stage tooling on the host (forensics next), and any OTHER user who received the same lure — the mail purge must be org-wide.' }
      const i = on.findIndex((id, idx) => ACTION_ORDER[idx] !== id)
      return { pass: false, feedback: `Position ${i + 1} breaks the dependency order. Isolation precedes channel cuts (stop the bleeding at the source), channels precede mailbox purge, and the credential reset comes last — no point rotating a password while the session can be stolen again.` }
    },
  },
  {
    id: 'h6',
    pillar: 'understand',
    title: 'Type the technique IDs',
    brief: 'ATT&CK BOARD: type the exact six-letter IDs for all six chips — no dropdowns this time.',
    context: '',
    hints: [
      'Format: T####.### — e.g. the web-protocol C2 one is T1071.001.',
      'Six: spearphishing link, PowerShell, ingress tool transfer, web C2, DNS C2, unencrypted non-C2 exfiltration.',
      'T1566.002 · T1059.001 · T1105 · T1071.001 · T1071.004 · T1048.003.',
    ],
    pointTo: 'attack',
    anchor: 'Exact MITRE mapping from memory',
    validate: (env) => {
      const wrong = ATTACK_CHIPS.filter((c) => norm(env.atkTyped[c.key]).replace(/\s+/g, '') !== c.tid.toLowerCase())
      if (wrong.length === 0) return { pass: true, feedback: 'All six IDs exact. You can now write this incident into a report or a SIEM rule without looking anything up — that fluency is the point of the mapping exercise.' }
      return { pass: false, feedback: `${wrong.length} of 6 incorrect — first: "${wrong[0].label}" expected an exact ID. Watch the family traps: .001 vs .002 under T1566, .001 vs .003 under T1059, .001 vs .004 under T1071.` }
    },
  },
  {
    id: 'h7',
    pillar: 'detect',
    title: 'Adjudicate the alert queue',
    brief: 'ALERT QUEUE: mark each of the six alerts TRUE POSITIVE or FALSE POSITIVE. Two triads of three — no partial credit patterns.',
    context: '',
    hints: [
      'Match each alert against the baseline AND the incident evidence collected so far.',
      'NTP baseline, own-domain SPF TXT fetches and the 02:00 backup are all expected behavior.',
      'TP: a4 (TXT burst), a5 (60 s beacon), a6 (unsigned %TEMP% + Run key). FP: a1, a2, a3.',
    ],
    pointTo: 'alerts',
    anchor: 'True vs false positive judgment under realistic noise',
    validate: (env) => {
      const need = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']
      const missing = need.filter((id) => !env.alertCls[id])
      if (missing.length > 0) return { pass: false, feedback: `${missing.length} alert(s) unadjudicated — a queue must be fully worked.` }
      const wrong = need.filter((id) => (env.alertCls[id] === 'tp') !== (id === 'a4' || id === 'a5' || id === 'a6'))
      if (wrong.length === 0) return { pass: true, feedback: '6/6. The trap triad (NTP cadence, SPF TXT fetches, backup volume) all match the baseline; the true triad (TXT burst, 60 s beacon, unsigned %TEMP% persistence) all break it. Verdicts came from context, not volume.' }
      return { pass: false, feedback: `Alert ${wrong[0]} is mis-adjudicated. Test: does it match the documented baseline (NTP 300 s, SPF own-domain TXT, 02:00 backup) — or does it break it (bursty TXT, 60 s unregistered, unsigned persistence)?` }
    },
  },
  {
    id: 'h8',
    pillar: 'understand',
    title: 'Debrief the watch commander',
    brief: 'Select every TRUE statement of the incident summary (and only those) in the ALERT QUEUE module.',
    context: '',
    hints: [
      'Cross-check each statement against the triaged flows and the reconstructed chain.',
      'There was no lateral movement; the workstation was the source; the backup was the baseline.',
      'True: s1, s2, s4, s5, s6 — five of eight.',
    ],
    pointTo: 'alerts',
    anchor: 'Synthesis — incident narrative from indicators',
    validate: (env) => {
      if (sameSet(env.summarySel, SUMMARY_CORRECT)) return { pass: true, feedback: 'Summary accurate. You can defend every claim with an artifact: e01 for access, ep02 for execution, g05 for C2, g09 for exfil, the TXT burst for tunneling. That is what "identify malicious activity" means at watch-change.' }
      const extra = env.summarySel.filter((s) => !SUMMARY_CORRECT.includes(s))
      if (extra.length > 0) return { pass: false, feedback: 'At least one selected statement is unsupported: no lateral movement is evidenced, the workstation — not internal servers — was the source, and the backup session is baseline. The summary must survive the evidence.' }
      return { pass: false, feedback: `${env.summarySel.length} of 5 true statements selected. Re-walk the chain and the triage table before committing.` }
    },
  },
]

const OBJECTIVES = { medium: MEDIUM, hard: HARD }

const PILLAR_LABEL = {
  understand: 'UNDERSTAND',
  recognize: 'RECOGNIZE',
  detect: 'DETECT',
  mitigate: 'MITIGATE',
}
