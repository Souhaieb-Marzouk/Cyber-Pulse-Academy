// ── Fault Isolation Line — content layer (js/data.js) ──
// ALL student-facing copy, evidence, objectives, quiz and debrief data.
// Ported 1:1 from the original framework lab (src/lib/lab/content.ts).
// Every fact is synthetic training data; the methodology maps to
// CompTIA Network+ N10-009, Domain 5.0 (24%) Objective 5.1.

const LAB_ID = 'N10-009-5.1-FAULTLINE';
const LS_KEY = 'n1009-51-faultline-v1';

const CASE_ID = 'MERID-0417';

const PILLAR_LABEL = {
  P1: 'Understand',
  P2: 'Recognize',
  P3: 'Detect',
  P4: 'Mitigate',
};

// ── The seven steps ──
const STEPS = [
  {
    id: '1',
    name: 'Identify the problem',
    short: 'Identify',
    subs: ['Gather information', 'Question users', 'Identify symptoms', 'Determine if anything has changed', 'Duplicate the problem, if possible', 'Approach multiple problems individually'],
    why: 'A fix without a defined problem is a guess. Information first prevents wasted work.',
  },
  {
    id: '2',
    name: 'Establish a theory of probable cause',
    short: 'Theory',
    subs: ['Question the obvious', 'Consider multiple approaches — top-to-bottom / bottom-up OSI layered approach, divide and conquer'],
    why: 'A testable theory focuses your probes. The obvious answer is obvious surprisingly often.',
  },
  {
    id: '3',
    name: 'Test the theory to determine the cause',
    short: 'Test',
    subs: ['If the theory is confirmed, determine the next steps to resolve the problem', 'If the theory is not confirmed, establish a new theory or escalate'],
    why: 'Testing separates belief from fact. Loop here until something is confirmed.',
  },
  {
    id: '4',
    name: 'Establish a plan of action to resolve the problem and identify potential effects',
    short: 'Plan',
    subs: ['Order the steps', 'Identify potential effects of the fix'],
    why: 'Planning catches consequences before the users feel them.',
  },
  {
    id: '5',
    name: 'Implement the solution or escalate as necessary',
    short: 'Implement',
    subs: ['Execute the plan', 'Escalate when the fix exceeds your access, skill, or scope'],
    why: 'Do the work — or hand it off cleanly when it is beyond you.',
  },
  {
    id: '6',
    name: 'Verify full system functionality and, if applicable, implement preventive measures',
    short: 'Verify',
    subs: ['Have the user run through typical functions', 'If applicable, implement preventive measures'],
    why: '"It should work now" is not verification. The user proves it.',
  },
  {
    id: '7',
    name: 'Document findings, actions, outcomes, and lessons learned',
    short: 'Document',
    subs: ['Record findings, actions, and outcome', 'Record lessons learned'],
    why: 'Documentation is the organization\u2019s memory. It makes the next incident faster.',
  },
];

const CANONICAL_STEP_ORDER = STEPS.map(function (s) { return s.id; });
const DRILL_INITIAL_ORDER = ['3', '1', '6', '2', '7', '4', '5'];

// ── Sub-step sort drill (M2) ──
// Display order deliberately scrambled (audit QA-5/R6): the sequence must not
// mirror the correct step numbers (ss1→1 … ss7→7 was a positional giveaway).
const SUBSTEP_CHIPS = [
  { id: 'ss4', text: 'Identify potential effects of the fix', step: '4' },
  { id: 'ss2', text: 'Question the obvious', step: '2' },
  { id: 'ss7', text: 'Record lessons learned', step: '7' },
  { id: 'ss1', text: 'Determine if anything has changed', step: '1' },
  { id: 'ss6', text: 'If applicable, implement preventive measures', step: '6' },
  { id: 'ss3', text: 'If the theory is not confirmed, establish a new theory or escalate', step: '3' },
  { id: 'ss5', text: 'Escalate as necessary', step: '5' },
];

// ── Station metadata ──
const STATIONS = [
  { id: 'dispatch', num: '00', name: 'Dispatch', tagline: 'Briefing & methodology orientation' },
  { id: 'intake', num: '01', name: 'Intake', tagline: 'Identify the problem' },
  { id: 'theory', num: '02', name: 'Theory', tagline: 'Establish a theory of probable cause' },
  { id: 'test', num: '03', name: 'Test Bench', tagline: 'Test the theory to determine the cause' },
  { id: 'plan', num: '04', name: 'Plan Board', tagline: 'Plan of action & potential effects' },
  { id: 'implement', num: '05', name: 'Change Window', tagline: 'Implement the solution or escalate' },
  { id: 'verify', num: '06', name: 'Verification Deck', tagline: 'Verify full functionality & prevent recurrence' },
  { id: 'document', num: '07', name: 'KB Desk', tagline: 'Document findings, actions, outcomes, lessons' },
];

// objectives bound to each stop (gating)
const STATION_OBJECTIVES = {
  dispatch: { medium: ['M1', 'M2'], hard: [] },
  intake: { medium: ['M3', 'M4', 'M5'], hard: ['H1', 'H2'] },
  theory: { medium: ['M6', 'M7'], hard: ['H3', 'H4'] },
  test: { medium: ['M8'], hard: ['H5'] },
  plan: { medium: ['M9'], hard: ['H7'] },
  implement: { medium: ['M10'], hard: ['H6', 'H8'] },
  verify: { medium: ['M11'], hard: ['H9'] },
  document: { medium: ['M12'], hard: ['H10'] },
};

const OBJECTIVE_ORDER = {
  medium: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
  hard: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10'],
};

// ── Objective definitions ──
const OBJECTIVES = {
  M1: {
    id: 'M1', title: 'Sequence the line: order the seven methodology steps', pillar: 'P1',
    anchors: 'N10-009 5.1 — step order', look: 'Dispatch board — the sequenced line rack',
    hints: [
      'The line starts with learning about the problem and ends with writing it down.',
      'Fix steps come in pairs: theory before test, plan before implement, verify before document.',
      'Demonstration: 1 Identify \u00b7 2 Theory \u00b7 3 Test \u00b7 4 Plan \u00b7 5 Implement \u00b7 6 Verify \u00b7 7 Document.',
    ],
  },
  M2: {
    id: 'M2', title: 'Sub-step sort: assign each sub-task to its methodology step', pillar: 'P1',
    anchors: 'N10-009 5.1 — sub-steps of each step', look: 'Dispatch board — the sub-step rack below the line',
    hints: [
      'Ask: does the sub-step describe learning about the problem, deciding what to do, acting, or recording?',
      '"Question the obvious" happens before any testing — it belongs with forming the theory.',
      'Demonstration: changed\u21921, obvious\u21922, new-theory/escalate\u21923, effects\u21924, escalate-as-necessary\u21925, preventive\u21926, lessons\u21927.',
    ],
  },
  M3: {
    id: 'M3', title: 'Build the problem statement and duplicate the failure', pillar: 'P2',
    anchors: '5.1 Step 1 — gather info, question users, identify symptoms, duplicate the problem', look: 'Intake: user chats, NOC feed, then the reproduce bench',
    hints: [
      'A problem statement contains confirmed, in-scope facts — not guesses or other teams\u2019 problems.',
      'Select the facts from the three shipping users and the NOC feed; then press the reproduce bench button so the failure is duplicated from a test client.',
      'Demonstration: select all five shipping-scope facts plus the IDF night-work fact, run the duplicate test, and open every chat.',
    ],
  },
  M4: {
    id: 'M4', title: 'Spot the change: which change from last night matters here?', pillar: 'P2',
    anchors: '5.1 Step 1 — determine if anything has changed', look: 'Intake: last night\u2019s change log panel',
    hints: [
      'The outage is in Building C. Which change touched Building C hardware?',
      'CHG-2288 was WAN-only on CORE-1 and CHG-2285 was DHCP on a server — neither touched the failing path.',
      'Demonstration: CHG-2291 — the IDF-2 fiber panel replacement that re-patched the SW2 uplink.',
    ],
  },
  M5: {
    id: 'M5', title: 'Split the queue: approach multiple problems individually', pillar: 'P2',
    anchors: '5.1 Step 1 — approach multiple problems individually', look: 'Intake: the triage rack at the bottom',
    hints: [
      'One ticket, one problem. Unrelated reports become their own tickets; non-network requests go elsewhere.',
      '"Only one website is slow" is a different problem from a wing that cannot reach a server.',
      'Demonstration: labels \u2192 this ticket; email \u2192 separate; slow single site \u2192 separate; chair \u2192 not a network problem.',
    ],
  },
  M6: {
    id: 'M6', title: 'Whiteboard: question the obvious, commit a probable cause and an OSI approach', pillar: 'P2',
    anchors: '5.1 Step 2 — question the obvious; bottom-up OSI approach', look: 'Theory stop: obvious-check, cause board, approach picker',
    hints: [
      'A physical change happened last night in the affected closet — what does that make "the obvious"?',
      'Many users, one area, physical change: start at the physical layer. That approach is called bottom-up.',
      'Demonstration: obvious = change/physical/scope questions; cause = the re-patched fiber uplink; approach = bottom-up.',
    ],
  },
  M7: {
    id: 'M7', title: 'Approach picker: choose top-down / bottom-up / divide-and-conquer for three mini-cases', pillar: 'P3',
    anchors: '5.1 Step 2 — consider multiple approaches (OSI layered, divide and conquer)', look: 'Theory stop: the three scenario cards',
    hints: [
      'Top-down starts at the application; bottom-up at the physical layer; divide-and-conquer tests a middle point first.',
      'Who is affected and what just changed are your best clues: one user + app \u2192 top-down; everyone + physical change \u2192 bottom-up; company-wide + unknown midpoint \u2192 divide and conquer.',
      'Demonstration: S1 top-down \u00b7 S2 bottom-up \u00b7 S3 divide and conquer.',
    ],
  },
  M8: {
    id: 'M8', title: 'Test bench: run a sufficient probe set, give the verdict, take the right branch', pillar: 'P3',
    anchors: '5.1 Step 3 — test the theory; not confirmed \u2192 new theory or escalate', look: 'Test bench: probe buttons, then verdict + branch',
    hints: [
      'A sufficient set rules out the rival causes: client config (DHCP), a control probe from HQ, and a physical check.',
      'The flapping uplink + failed fiber test + healthy control probe confirm the physical theory — the branch is "determine next steps".',
      'Demonstration: run SHOW INTERFACE (or the fiber test) + IPCONFIG + the HQ control ping; verdict CONFIRMED; branch next-steps.',
    ],
  },
  M9: {
    id: 'M9', title: 'Plan board: order the plan and flag every potential effect', pillar: 'P4',
    anchors: '5.1 Step 4 — plan of action + identify potential effects', look: 'Plan board: sequenced cards + effects rack',
    hints: [
      'Communication precedes action; preparation and window confirmation precede touching hardware.',
      'An effect is anything users or teams will feel: a blip, a deadline, an access need.',
      'Demonstration: notify \u2192 spare \u2192 window \u2192 replace \u2192 confirm link \u2192 client checks; effects = blip, 09:00 deadline, IDF-2 access.',
    ],
  },
  M10: {
    id: 'M10', title: 'Change window: make the implement-or-escalate call, then execute in order', pillar: 'P4',
    anchors: '5.1 Step 5 — implement the solution or escalate as necessary', look: 'Change window: decision gate, then the action buttons',
    hints: [
      'Escalation is for fixes outside your access, skill, or scope — a patch-cable swap is none of those.',
      'Change discipline: communicate first, prepare second, confirm the window third — only then touch hardware.',
      'Demonstration: implement; then notify \u2192 spare \u2192 window \u2192 replace \u2192 confirm link.',
    ],
  },
  M11: {
    id: 'M11', title: 'Verification deck: prove full functionality and select preventive measures', pillar: 'P4',
    anchors: '5.1 Step 6 — verify full system functionality; preventive measures if applicable', look: 'Verification deck: battery buttons + preventive rack',
    hints: [
      'Full functionality = connectivity, the actual business function, and a human confirming it.',
      'Preventive measures stop a repeat: labeling, alerting, and a checklist change.',
      'Demonstration: run all five battery checks; select labeling + uplink alerting + checklist change.',
    ],
  },
  M12: {
    id: 'M12', title: 'KB desk: document findings, actions, outcome, lessons — then close', pillar: 'P4',
    anchors: '5.1 Step 7 — document findings, actions, outcomes, and lessons learned', look: 'KB desk: findings builder + close ticket',
    hints: [
      'Findings must let the next tech see what broke, where, and why — device, port, cause, change ID.',
      'Never document what did not happen; do not record escalations or reboots that never occurred.',
      'Demonstration: SW2-BC \u00b7 Gi1/0/48 \u00b7 fiber patch cause \u00b7 CHG-2291; three real actions; resolved; three lessons; close.',
    ],
  },

  // ── HARD ──
  H1: {
    id: 'H1', title: 'Intake under noise: problem statement, duplicate, chats, and queue split', pillar: 'P2',
    anchors: '5.1 Step 1 — all six sub-steps, with red herrings present',
    look: '', hints: [
      'Some tiles and reports are loud but irrelevant: different device, different building, different problem.',
      'The statement wants confirmed Building C shipping facts only — and every report still needs a routing decision.',
    ],
  },
  H2: {
    id: 'H2', title: 'Change correlation: name the one change that matters', pillar: 'P2',
    anchors: '5.1 Step 1 — determine if anything has changed', look: '', hints: [
      'Match the change location to the failure location.',
    ],
  },
  H3: {
    id: 'H3', title: 'Commit: obvious checks, probable cause, and OSI approach', pillar: 'P1',
    anchors: '5.1 Step 2 — question the obvious; layered approach', look: '', hints: [
      'One area, many users, a physical change overnight — the layered approach writes itself.',
    ],
  },
  H4: {
    id: 'H4', title: 'Probe strategy: approach choice + least-to-most intrusive ordering', pillar: 'P3',
    anchors: '5.1 Step 2 — consider multiple approaches; operational discipline',
    look: '', hints: [
      'Order by cost and intrusiveness: read-only first, active tests next, hands-on last.',
    ],
  },
  H5: {
    id: 'H5', title: 'Execute and update: full battery, formal theory update, verdict', pillar: 'P3',
    anchors: '5.1 Step 3 — confirm / re-establish new theory', look: '', hints: [
      'If a probe disproves your committed theory, discard it formally — do not silently switch.',
    ],
  },
  H6: {
    id: 'H6', title: 'Escalation gate: decide and justify', pillar: 'P4',
    anchors: '5.1 Step 5 — escalate as necessary (criteria)', look: '', hints: [
      'Judge by access, skill, and scope — not by ticket age.',
    ],
  },
  H7: {
    id: 'H7', title: 'Plan under pressure: exact order + effects incl. plan B', pillar: 'P4',
    anchors: '5.1 Step 4 — plan of action + potential effects', look: '', hints: [
      'A plan without a fallback is a hope. The vendor contingency belongs on the board.',
    ],
  },
  H8: {
    id: 'H8', title: 'Change window: flawless sequence, zero wrong-device actions', pillar: 'P4',
    anchors: '5.1 Step 5 — implement the solution', look: '', hints: [
      'Every wrong action is recorded even if you undo it — discipline is the skill being tested.',
    ],
  },
  H9: {
    id: 'H9', title: 'Full verification battery + preventive set', pillar: 'P4',
    anchors: '5.1 Step 6 — verify full functionality; preventive measures', look: '', hints: [
      '"Full" means every channel the users touched: wired, Wi-Fi, the app, and the humans.',
    ],
  },
  H10: {
    id: 'H10', title: 'Close-out: airtight documentation', pillar: 'P4',
    anchors: '5.1 Step 7 — findings, actions, outcomes, lessons learned', look: '', hints: [
      'Device, port, cause, change ID — a finding that cannot be audited is not a finding.',
    ],
  },
};

// ── Intake evidence ──
const CHATS = [
  {
    id: 'dana', name: 'Dana Reyes', role: 'Shipping lead \u00b7 Building C',
    lines: [
      { from: 'you', text: 'Dana — what exactly are you seeing, and since when?' },
      { from: 'user', text: 'All five pack stations stopped printing labels around 07:30, right at shift start.' },
      { from: 'user', text: 'The Wi-Fi scan tablets can\u2019t reach the label server either. Everything in shipping — wired and wireless.' },
    ],
  },
  {
    id: 'marcus', name: 'Marcus Webb', role: 'Packer \u00b7 Building C',
    lines: [
      { from: 'user', text: 'My computer turns on fine and I can see my desktop. The label app icon just spins forever.' },
      { from: 'you', text: 'Anything else odd — email, other apps?' },
      { from: 'user', text: 'Not on my side. Just the labels.' },
    ],
  },
  {
    id: 'priya', name: 'Priya Nair', role: 'Floor supervisor \u00b7 Building C',
    lines: [
      { from: 'user', text: 'It\u2019s just our wing. I asked Building B — they\u2019re completely fine.' },
      { from: 'user', text: 'Started when we came in this morning. Night shift did "some work" in the IDF closet upstairs, no idea what.' },
    ],
  },
  {
    id: 'owen', name: 'Owen Blake', role: 'Sales \u00b7 Building A', hardOnly: true,
    lines: [
      { from: 'user', text: 'The internet is DOWN for me too!! Salesforce has been loading forever. Are we hacked??' },
      { from: 'you', text: 'Is it only Salesforce, or every site?' },
      { from: 'user', text: 'Hmm… only Salesforce actually. Email works.' },
    ],
  },
];

const MONITOR_TILES = [
  { id: 'm1', device: 'SW2-BC \u00b7 Building C access', status: 'crit', line: 'Uplink Gi1/0/48 — FLAPPING \u00b7 CRC errors 4,182 and climbing' },
  { id: 'm2', device: 'LABELSVR01 \u00b7 label server', status: 'ok', line: 'Healthy \u00b7 reachable from CORE-1 (control probe)' },
  { id: 'm3', device: 'DHCP-SRV-02', status: 'ok', line: 'Healthy \u00b7 leases within scope' },
  { id: 'm4', device: 'CORE-1', status: 'warn', line: 'CPU 91% during scheduled BGP maintenance window (CHG-2288)', hardOnly: true },
  { id: 'm5', device: 'AP-3F-07 \u00b7 Building A, 3rd floor', status: 'crit', line: 'Offline — separate IDF, separate uplink', hardOnly: true },
];

// Display order scrambled (audit QA-5): the relevant change must not always be the
// first radio option. Each entry keeps its window so chronology stays readable.
const CHANGE_LOG = [
  { id: 'CHG-2288', window: '23:30–02:10', scope: 'CORE-1 \u00b7 Building A WAN', desc: 'Scheduled BGP maintenance.', status: 'Completed & verified — Building A WAN path only' },
  { id: 'CHG-2285', window: '22:00–22:30', scope: 'DHCP-SRV-02', desc: 'Scope expansion for guest Wi-Fi.', status: 'Completed & verified' },
  { id: 'CHG-2291', window: '23:00–01:00', scope: 'IDF-2 \u00b7 Building C', desc: 'Replace aging fiber patch panel; re-patch SW2 uplink to new panel port P14.', status: 'Completed — post-change verification PENDING' },
  { id: 'CHG-2290', window: '01:00–03:00', scope: 'BLDG-D storage array', desc: 'Firmware upgrade.', status: 'Completed & verified', hardOnly: true },
];

const DUPLICATE_OUTPUT = [
  'reproduce> run from CLIENT-SHIP-03 (Shipping VLAN 20)',
  'ping LABELSVR01 (10.10.30.25) …',
  'Request timed out — 4/4 lost',
  '\u2713 Failure reproduced at 07:52 — problem duplicated, evidence captured',
];

const FACTS = [
  { id: 'fm1', text: 'Five shipping pack stations affected — wired terminals and Wi-Fi tablets', correct: true },
  { id: 'fm7', text: 'Finance also reports slow email this morning', correct: false },
  { id: 'fm2', text: 'Started around 07:30, right at shift start', correct: true },
  { id: 'fh8', text: 'CORE-1 CPU is at 91% during its scheduled BGP maintenance', correct: false, hardOnly: true },
  { id: 'fm3', text: 'Failures are specific to reaching LABELSVR01 — labels won\u2019t print', correct: true },
  { id: 'fm8', text: 'The entire company network is down', correct: false },
  { id: 'fm4', text: 'Only Building C shipping is affected; other departments report normal service', correct: true },
  { id: 'fh9', text: 'AP-3F-07 (Building A, 3rd floor) is offline', correct: false, hardOnly: true },
  { id: 'fm5', text: 'Night shift performed work in the IDF-2 closet (per the floor supervisor)', correct: true },
  { id: 'fm6', text: 'Failure duplicated from test client CLIENT-SHIP-03 at 07:52', correct: true },
  { id: 'fh10', text: 'Building A user Owen Blake reports "the internet is down" — only Salesforce is slow for him', correct: false, hardOnly: true },
];

const TRIAGE = [
  { id: 'mt1', text: 'Shipping pack stations can\u2019t print labels', answer: 'this' },
  { id: 'mt2', text: 'Finance: email slow since this morning', answer: 'separate' },
  { id: 'mt3', text: 'A user reports "the internet is down" — but only one website is slow', answer: 'separate' },
  { id: 'mt4', text: 'Request: a new chair for the packing bench', answer: 'not-network' },
  { id: 'mt5', text: 'Wi-Fi scan tablets in shipping also fail', answer: 'this', hardOnly: true },
  { id: 'mt6', text: 'AP-3F-07 offline alarm (Building A, 3rd floor)', answer: 'separate', hardOnly: true },
];

// ── Theory stop ──
const OBVIOUS_OPTIONS = [
  { id: 'o4', text: 'Did the label server\u2019s database get corrupted?', correct: false },
  { id: 'o2', text: 'Is the uplink physically connected and clean?', correct: true },
  { id: 'o5', text: 'Should we reimage all pack-station PCs?', correct: false },
  { id: 'o1', text: 'Did anything physically change here last night?', correct: true },
  { id: 'o3', text: 'Is the outage scoped to one area or to everyone?', correct: true },
];

const CAUSES = [
  { id: 'c1', text: 'DHCP scope exhausted on VLAN 20' },
  { id: 'c2', text: 'Uplink fiber patch damaged or unseated during CHG-2291 (IDF-2 panel replacement)' },
  { id: 'c3', text: 'LABELSVR01 application crashed' },
  { id: 'c4', text: 'Building C Wi-Fi APs failed' },
  { id: 'c5', text: 'CORE-1 routing failure (BGP issue)' },
];

const APPROACHES = [
  { id: 'top-down', text: 'Top-down', blurb: 'Start at L7 (application) and work down — best for one user, app-only symptoms.' },
  { id: 'bottom-up', text: 'Bottom-up', blurb: 'Start at L1 (physical) and work up — best when many users fail and physical work just happened.' },
  { id: 'divide', text: 'Divide and conquer', blurb: 'Test a middle layer first, then pivot up or down — fastest when the midpoint is informative.' },
];

const MINI_CASES = [
  { id: 's2', text: 'An entire building lost connectivity minutes after the border router was replaced.', answer: 'bottom-up' },
  { id: 's3', text: 'The whole company says the ERP app is slow. You don\u2019t know if the fault is the WAN link, the data center, or the app servers — and you want the fastest split.', answer: 'divide' },
  { id: 's1', text: 'One accounting user can\u2019t open any web page. Everyone else on the floor is fine, and the user says "nothing loads".', answer: 'top-down' },
];

const PROBE_ORDER_ITEMS = [
  { id: 'po1', text: 'Read-only interface status check (show interface)' },
  { id: 'po2', text: 'Read-only client config check (ipconfig)' },
  { id: 'po3', text: 'Active pings — client to gateway/server, incl. a control probe' },
  { id: 'po4', text: 'Fiber cable test (requires panel/port access)' },
  { id: 'po5', text: 'Physically re-seat or replace the patch cable' },
];

// ── Test bench ──
const PROBES = [
  {
    id: 'p1', label: 'Interface status (SW2)', cmd: 'SW2-BC# show interface status | include Gi1/0/48',
    output: ['Port        Name                Status       Vlan',
      'Gi1/0/48    uplink->CORE-1      down (flap)  trunk',
      'Last link flap 07:51:12 \u00b7 CRC errors 4,182 and climbing'],
  },
  {
    id: 'p2', label: 'Fiber cable test', cmd: 'fiber-test panel=IDF-2 port=P14 \u2192 SW2 Gi1/0/48',
    output: ['Wavelength 1310nm \u00b7 limit 1.5 dB',
      'RESULT: FAIL — insertion loss 8.4 dB on TX pair',
      'Interpretation: cable damaged OR connector not fully seated'],
  },
  {
    id: 'p3', label: 'Client config (CLIENT-SHIP-03)', cmd: 'CLIENT-SHIP-03> ipconfig /all',
    output: ['IPv4 Address . . : 10.20.5.42/24  (VLAN 20 SHIPPING)',
      'Default Gateway . : 10.20.5.1',
      'Lease . . . . . . : valid until 19:38, issued by DHCP-SRV-02',
      'Verdict: DHCP is NOT the problem — the lease is healthy'],
  },
  {
    id: 'p4', label: 'Ping gateway from CLIENT-SHIP-03', cmd: 'CLIENT-SHIP-03> ping 10.20.5.1',
    output: ['Request timed out. Request timed out.',
      'Request timed out. Request timed out.',
      'Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)',
      'The client cannot even reach its own gateway'],
  },
  {
    id: 'p5', label: 'Control ping from HQ (CLIENT-HQ-01)', cmd: 'CLIENT-HQ-01> ping LABELSVR01',
    output: ['Reply from 10.10.30.25: bytes=32 time=2ms TTL=126',
      'Reply from 10.10.30.25: bytes=32 time=2ms TTL=126',
      'Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
      'Control result: LABELSVR01 itself is healthy'],
  },
  {
    id: 'p6', label: 'Ping LABELSVR01 from CLIENT-SHIP-03', cmd: 'CLIENT-SHIP-03> ping LABELSVR01',
    output: ['Request timed out — 4/4 lost',
      'Consistent with the user reports'],
  },
  {
    id: 'p7', label: 'VLAN / trunk config (SW2)', cmd: 'SW2-BC# show vlan brief | include 20 ; show run int Gi1/0/48',
    output: ['20   SHIPPING   active',
      'Gi1/0/48: switchport mode trunk \u2014 configuration intact',
      'The config is fine; the link itself is failing'],
  },
  {
    id: 'p8', label: 'CORE-1 process check', cmd: 'CORE-1# show processes cpu | include BGP',
    output: ['BGP Router process \u2014 88% (matches CHG-2288 maintenance)',
      'Affected path: Building A WAN only \u2014 not on Building C traffic path',
      'Confirms the CPU tile is a red herring for this incident'],
    hardOnly: true,
  },
];

const VERDICTS = [
  { id: 'confirmed', text: 'Theory CONFIRMED — cause identified' },
  { id: 'not-confirmed', text: 'Theory NOT confirmed' },
];

const BRANCH_CONFIRMED = [
  { id: 'next-steps', text: 'Determine next steps \u2192 proceed to the plan of action', correct: true },
  { id: 'implement-now', text: 'Implement the fix right now — skip the plan', correct: false },
  { id: 'close', text: 'Close the ticket — the user will retry later', correct: false },
];

const BRANCH_NOTCONFIRMED = [
  { id: 'new-theory', text: 'Establish a new theory and re-test', correct: true },
  { id: 'escalate', text: 'Escalate to a higher tier', correct: true },
];

// ── Plan stop ──
const PLAN_ITEMS = [
  { id: 'a1', text: 'Notify shipping supervisor + post in the ops bridge (what / when / impact)' },
  { id: 'a2', text: 'Pull a spare fiber patch cable + connector cleaner; badge to IDF-2' },
  { id: 'a3', text: 'Confirm timing: finish before the 09:00 shipping rush; get the supervisor\u2019s go-ahead' },
  { id: 'a4', text: 'Re-seat / replace the fiber patch cable P14 \u2192 Gi1/0/48' },
  { id: 'a5', text: 'Confirm the link is stable: flapping stops, CRC counter stops climbing' },
  { id: 'a6', text: 'Re-run client checks (ping + test print) from the shipping VLAN' },
];

const PLAN_EFFECTS = [
  { id: 'e4', text: 'The whole company will go offline during the re-seat', correct: false },
  { id: 'e1', text: 'Shipping uplink blips ~1 min while the patch is re-seated', correct: true },
  { id: 'e5', text: 'No potential effects — this fix is risk-free', correct: false },
  { id: 'e2', text: 'Work must finish before the 09:00 shipping rush', correct: true },
  { id: 'e6', text: 'If panel port P14 itself is damaged, escalate to the fiber vendor (plan B)', correct: true, hardOnly: true },
  { id: 'e3', text: 'Tech needs IDF-2 badge access — arrange escort if required', correct: true },
];

// ── Implement stop ──
const IMPLEMENT_ACTIONS = [
  { id: 'act-clear', text: 'Just clear the CRC counters and close the ticket', distractor: true },
  { id: 'act-notify', text: 'Post in ops bridge + notify shipping supervisor' },
  { id: 'act-reboot-core', text: 'Reboot CORE-1 (the router with the CPU alert)', distractor: true },
  { id: 'act-spare', text: 'Pull spare fiber patch cable + cleaner to IDF-2' },
  { id: 'act-rollback', text: 'Roll back CHG-2291 entirely', distractor: true },
  { id: 'act-window', text: 'Confirm window go-ahead with the supervisor' },
  { id: 'act-swap-switch', text: 'Replace SW2-BC with a spare switch', distractor: true },
  { id: 'act-replace', text: 'Re-seat / replace fiber patch cable P14 \u2192 Gi1/0/48' },
  { id: 'act-confirm-link', text: 'Confirm link up — flapping stopped, CRC stable' },
];

const CORRECT_ACTION_SEQUENCE = ['act-notify', 'act-spare', 'act-window', 'act-replace', 'act-confirm-link'];

const IMPLEMENT_REASONS = [
  { id: 'r4', text: 'The ticket is old, so someone must act now', correct: false },
  { id: 'r1', text: 'The theory was confirmed by direct evidence (failed fiber test)', correct: true },
  { id: 'r3', text: 'The plan and its effects were communicated and approved', correct: true },
  { id: 'r2', text: 'The fix is within NOC tech skill and access (patch-cable swap)', correct: true },
];

const ESCALATE_INFO = [
  'Escalation is the RIGHT call when: the fix needs access you don\u2019t have (locked IDF, vendor-only parts), the skill (fiber splicing, BGP surgery), or the scope (policy requires senior approval).',
  'Here: the theory is confirmed, the fix is a patch-cable swap, IDF-2 access is arranged — so the methodology says implement.',
  'A clean escalation includes: what you know (evidence), what you tried, and what you need — that is Steps 1–7 feeding forward.',
];

// ── Verify stop ──
const VERIFY_CHECKS = [
  { id: 'v1', label: 'Ping LABELSVR01 from CLIENT-SHIP-03', output: 'Reply from 10.10.30.25 \u2014 4/4 success \u00b7 latency back to 2 ms baseline' },
  { id: 'v2', label: 'Print a test label from pack station 3', output: 'Label printed \u2014 barcode legible, job completed in 1.2 s' },
  { id: 'v3', label: 'Ask Dana & Priya to run their usual tasks', output: 'Both confirm: printing + scanner flows are normal. User verification \u2713' },
  { id: 'v4', label: 'Watch Gi1/0/48 counters for 30 minutes', output: '0 new CRC errors \u2014 link stable across the watch window' },
  { id: 'v5', label: 'Confirm Wi-Fi tablets reconnect (scan-to-pack)', output: 'All 5 tablets scanning again on VLAN 20' },
];

const PREVENTIVE = [
  { id: 'pv4', text: 'Expand the DHCP scope again', correct: false },
  { id: 'pv1', text: 'Label + document every IDF-2 panel port (as-built map)', correct: true },
  { id: 'pv5', text: 'Replace all fiber in Building C', correct: false },
  { id: 'pv2', text: 'Add uplink flap / CRC alerting on all access-switch uplinks', correct: true },
  { id: 'pv3', text: 'Add a mandatory "post-change link verification" step to the change checklist', correct: true },
];

// ── Document stop ──
const DOC_DEVICES = ['— select —', 'SW2-BC', 'CORE-1', 'DHCP-SRV-02', 'LABELSVR01'];
const DOC_PORTS = ['— select —', 'Gi1/0/48 (uplink to CORE-1)', 'Gi1/0/1', 'Fa0/7', 'n/a'];
const DOC_CAUSES = [
  '— select —',
  'Fiber patch cable damaged / not fully seated at panel port P14 after the CHG-2291 re-patch',
  'DHCP scope exhaustion on VLAN 20',
  'BGP route flap on CORE-1',
  'LABELSVR01 application crash',
];
const DOC_ACTIONS = [
  { id: 'da4', text: 'Escalated to the fiber vendor', correct: false },
  { id: 'da1', text: 'Notified shipping supervisor & ops bridge; executed in agreed window', correct: true },
  { id: 'da5', text: 'Rebooted CORE-1', correct: false },
  { id: 'da2', text: 'Replaced fiber patch cable P14 \u2192 Gi1/0/48', correct: true },
  { id: 'da3', text: 'Verified connectivity, printing, and 30-min counter stability with users', correct: true },
];
const DOC_OUTCOMES = ['— select —', 'Resolved — full functionality restored, users confirmed', 'Partially resolved', 'Unresolved — escalated'];
const DOC_LESSONS = [
  { id: 'dl4', text: 'Next time, reboot everything first', correct: false },
  { id: 'dl1', text: 'CHG-2291 lacked a post-change link verification step — checklist updated', correct: true },
  { id: 'dl3', text: 'Labeling and monitoring panel ports will speed every future isolation', correct: true },
  { id: 'dl2', text: 'After physical work, start at the physical layer (bottom-up) — it isolated the fault in minutes', correct: true },
];

// ── Quiz ──
const QUIZ_MEDIUM = [
  {
    id: 'mq1', prompt: 'Which sequence is the CompTIA troubleshooting methodology?',
    options: ['Identify \u2192 Theory \u2192 Test \u2192 Plan \u2192 Implement \u2192 Verify \u2192 Document', 'Identify \u2192 Theory \u2192 Plan \u2192 Test \u2192 Implement \u2192 Verify \u2192 Document', 'Identify \u2192 Test \u2192 Theory \u2192 Plan \u2192 Implement \u2192 Document \u2192 Verify', 'Theory \u2192 Identify \u2192 Test \u2192 Plan \u2192 Implement \u2192 Verify \u2192 Document'],
    answer: 0,
    explanation: 'The order is fixed: information, then theory, then testing; planning precedes implementation, and verification precedes documentation. Plan-before-implement and verify-before-document are the pairs exams love to scramble.',
  },
  {
    id: 'mq2', prompt: '"Determine if anything has changed" belongs to which step?',
    options: ['Establish a plan of action', 'Verify functionality', 'Identify the problem', 'Establish a theory'],
    answer: 2,
    explanation: 'Change detection is part of IDENTIFYING the problem \u2014 recent changes are the single richest clue a troubleshooter has, which is why the change log sits on the intake desk.',
  },
  {
    id: 'mq3', prompt: 'One user can\u2019t open any website. The rest of the floor is fine. Where do you start?',
    options: ['Bottom-up \u2014 at the core router', 'Top-down \u2014 at the user\u2019s apps', 'Reimage the user\u2019s PC', 'Divide and conquer at the switch'],
    answer: 1,
    explanation: 'Working peers rule out the shared layers (switch, router, WAN). With symptoms confined to one user\u2019s apps, start at the application layer and work down \u2014 the top-down approach.',
  },
  {
    id: 'mq4', prompt: 'An entire building is down right after a router replacement. Best approach?',
    options: ['Top-down \u2014 begin with the user\u2019s apps', 'Divide and conquer \u2014 start mid-stack', 'Document the outage before acting', 'Bottom-up \u2014 start at the physical layer'],
    answer: 3,
    explanation: 'Many users + a physical change moments ago = check the physical layer first. Bottom-up turns the recent change into your first suspect instead of your last.',
  },
  {
    id: 'mq5', prompt: 'You test your theory and it is NOT confirmed. What does the methodology say now?',
    options: ['Establish a new theory or escalate', 'Implement the plan anyway', 'Close the ticket as unfixable', 'Re-run the same test until it passes'],
    answer: 0,
    explanation: 'Step 3 has an explicit exit: not-confirmed \u2192 NEW theory or escalate. Jumping to implementation with an unproven cause is how outages get longer.',
  },
  {
    id: 'mq6', prompt: 'Which activity belongs in Step 6 (verify) rather than Step 7 (document)?',
    options: ['Recording lessons learned', 'Writing down the outcome', 'Users run typical functions', 'Logging the actions taken'],
    answer: 2,
    explanation: 'Verification is active: the user exercises the actual business function while you watch. Writing things down is real \u2014 but it is Step 7.',
  },
];

const QUIZ_HARD = [
  {
    id: 'hq1', prompt: 'Scenario: an overnight storage-array upgrade finishes at 03:00. At 08:15, two departments are unreachable. What do you do FIRST?',
    options: ['Reboot the core switch to clear state', 'Check the change log and identify symptoms', 'Open a vendor support case', 'Start writing the incident documentation'],
    answer: 1,
    explanation: 'Step 1 before everything: identify symptoms and determine what changed. A completed overnight change is the highest-prior-probability clue in the whole incident.',
  },
  {
    id: 'hq2', prompt: 'Scenario: one user can\u2019t reach the intranet; colleagues on the same VLAN are fine. Most efficient next probe?',
    options: ['Run a traceroute toward an internet host', 'Replace the upstream access switch', 'Expand the DHCP scope on the VLAN', 'Compare the failing user to a peer'],
    answer: 3,
    explanation: 'When peers work and one user fails, the delta IS the diagnosis: compare IP config, cables, permissions, and profile between working and broken. Shared-path probes waste time.',
  },
  {
    id: 'hq3', prompt: 'Scenario: theory confirmed \u2014 a failed SFP on an uplink. No spare on site; vendor RMA takes 3 days. Next step?',
    options: ['Plan the workaround, communicate, escalate per policy', 'Implement immediately: reboot the switch and hope', 'Close as resolved \u2014 the RMA is placed', 'Verify functionality \u2014 no plan needed'],
    answer: 0,
    explanation: 'Confirmed theory \u2192 determine next steps \u2192 plan of action with potential effects (3 days of reduced redundancy), communication, and escalation where the fix exceeds your access. Implementation without a plan is a second outage waiting to happen.',
  },
  {
    id: 'hq4', prompt: 'Scenario: mid-implementation you discover the plan\u2019s assumption was wrong \u2014 the port was fine. What now?',
    options: ['Continue the plan anyway to finish the window', 'Skip to documentation to save time', 'Return to Steps 2\u20133 and re-theorize', 'Escalate immediately \u2014 someone else\u2019s turn'],
    answer: 2,
    explanation: 'The methodology is a loop, not a ladder: new evidence invalidates the theory \u2192 back to Step 2. Improvising inside a change window is how planned maintenance becomes an unplanned outage.',
  },
  {
    id: 'hq5', prompt: 'Which of these is NOT part of verifying full system functionality?',
    options: ['Having users run their typical functions', 'Marking resolved after 24 h silent', 'Watching counters for stability', 'Adding preventive measures where applicable'],
    answer: 1,
    explanation: 'Silence is not verification. Functionality is proven actively \u2014 user exercises, counters, tests \u2014 and Step 6 explicitly includes preventive measures when applicable.',
  },
  {
    id: 'hq6', prompt: 'A plan of action must ALWAYS include:',
    options: ['Identified potential effects', 'A full packet capture', 'A vendor purchase order', 'A root-cause analysis document'],
    answer: 0,
    explanation: 'Step 4 literally says "\u2026and identify potential effects." Every fix can bite \u2014 a blip, a deadline, an access need \u2014 and the plan must name them before users feel them.',
  },
  {
    id: 'hq7', prompt: 'Scenario: the same label-printer failure has now happened twice this quarter. What does the methodology demand?',
    options: ['Faster implementation next time', 'More escalations to senior staff', 'Nothing \u2014 it was resolved twice', 'Preventive measures and lessons learned'],
    answer: 3,
    explanation: 'Repeats are the signal that Step 6\u2019s preventive branch and Step 7\u2019s lessons-learned were skipped. The methodology\u2019s whole point is to stop paying for the same incident twice.',
  },
];

// ── Glossary ──
const GLOSSARY = [
  { term: 'Symptom', def: 'An observable deviation from normal behavior, as reported or measured.' },
  { term: 'Probable cause', def: 'The most likely explanation for the symptoms, chosen before testing.' },
  { term: 'Theory', def: 'A specific, testable statement of the probable cause.' },
  { term: 'Duplicate the problem', def: 'Reproduce the failure yourself (e.g., from a test client) to confirm it is real and capture evidence.' },
  { term: 'Question the obvious', def: 'Check the simplest, most likely things first — Is it plugged in? What changed?' },
  { term: 'Top-down (OSI)', def: 'Start at L7/application and work down the layers.' },
  { term: 'Bottom-up (OSI)', def: 'Start at L1/physical and work up the layers.' },
  { term: 'Divide and conquer', def: 'Test a middle OSI layer first, then pivot up or down based on the result.' },
  { term: 'Escalation', def: 'Handing the issue to a higher tier when it exceeds your access, skill, or scope.' },
  { term: 'Plan of action', def: 'The ordered, communicated steps that will implement the fix.' },
  { term: 'Potential effect', def: 'A foreseeable consequence of the fix — risk to users, timing, or access.' },
  { term: 'Change window', def: 'An approved time slot during which changes may be made.' },
  { term: 'Preventive measure', def: 'An action that stops the same problem from recurring.' },
  { term: 'Root cause', def: 'The underlying fault that the fix actually removed.' },
  { term: 'Compound problem', def: 'Several independent problems reported together; each must be approached individually.' },
  { term: 'Lessons learned', def: 'Documented insight from an incident that changes future behavior.' },
];

// ── Debrief ──
const DEBRIEF_SIGNALS = [
  {
    source: 'Change log vs. incident feed',
    reveals: 'Skipped post-change verification — the root cause of MERID-0417',
    logic: 'alert when incident_count(area, 24h AFTER a change) > 0 for changes marked "Completed"',
  },
  {
    source: 'Repeat-incident counter',
    reveals: 'Preventive measures / lessons learned never applied',
    logic: 'alert when the same service+device pair opens \u2265 2 tickets in 90 days',
  },
  {
    source: 'Closure audit trail',
    reveals: 'Tickets closed without verification evidence',
    logic: 'flag closures with no user-confirmation artifact and no counter/telemetry reference',
  },
  {
    source: 'Uplink flap / CRC telemetry',
    reveals: 'Physical-layer faults brewing before users notice',
    logic: 'alert when uplink flap count \u2265 3 in 10 min OR new_CRC > 100/min',
  },
];

const DEBRIEF_CONTROLS = [
  { title: 'Change management with mandatory post-implementation verification', body: 'Every change closes only after a functional check from the affected area — the exact gap behind CHG-2291.' },
  { title: 'Labeling & as-built documentation', body: 'Panel ports labeled and mapped, so "what changed" is answerable in minutes, not hours.' },
  { title: 'Uplink monitoring & alerting', body: 'Flap and CRC alerting on every access uplink catches physical faults before the phone rings.' },
  { title: 'Escalation policy with clear criteria', body: 'Written access/skill/scope criteria make Step 5\u2019s "escalate as necessary" a decision, not a mood.' },
  { title: 'Knowledge-base discipline', body: 'Findings, actions, outcomes, and lessons learned turn one technician\u2019s incident into everyone\u2019s baseline.' },
];

const DEBRIEF_BLUE = [
  'Run the steps in order, every time — the order is what makes the process fast under pressure.',
  '"What changed?" is usually worth three probes; read the change log before touching anything.',
  'Duplicate the problem from a test client: it confirms scope and gives you a safe test bed.',
  'A disproven theory is progress — it deletes half the search space. Discard it formally and re-establish.',
  'Verify with the user, then document for the next shift; closure quality is a team asset.',
];

const DEBRIEF_RED = [
  'Attackers and social engineers exploit skipped steps: manufactured urgency ("ship deadline NOW!") pushes techs to implement without identifying or planning.',
  'An unverified "helpful" caller requesting an emergency change is a social-engineering vector — the methodology (identify \u2192 theory \u2192 test) is also an authentication discipline.',
  'Thin documentation and unlabeled panels are reconnaissance gifts: they make change-log correlation — your best detection — harder for defenders and easier for intruders.',
];

const DEBRIEF_LINKS = [
  { label: 'CompTIA Network+ (official certification page)', url: 'https://www.comptia.org/en-us/certifications/network' },
];

const NEXT_STEPS = [
  'Apply the line to Domain 5\u2019s subject labs: cable connectivity (5.2), tools like ping / traceroute / packet capture, then wireless and performance troubleshooting.',
  'Re-drill the step order until it is reflexive — ordering and "what do you do FIRST/NEXT" items are heavily tested.',
  'Practice narrating potential effects out loud before any fix; it is the most-skipped half of Step 4.',
];

// Audit QA-8: per-quiz-item topic tags used by computeFocusAreas() to derive
// the completion report's focus areas from the student's actual quiz evidence.
const QUIZ_TOPICS = {
  mq1: 'the seven-step order (it is the most-scrambled fact on the exam)',
  mq2: 'which activities belong to Step 1 — identify the problem',
  mq3: 'approach selection for a single-user, app-only failure (top-down)',
  mq4: 'approach selection right after physical work (bottom-up)',
  mq5: 'the not-confirmed branch of Step 3 (new theory or escalate)',
  mq6: 'what belongs to Step 6 verify vs Step 7 document',
  hq1: 'first action in a fresh incident: identify symptoms + what changed',
  hq2: 'single-user failures: compare the failing user against a working peer',
  hq3: 'planning and escalating when the fix exceeds access or spare parts',
  hq4: 'looping back to Steps 2–3 when evidence disproves the plan',
  hq5: 'what "verify full functionality" does and does not include',
  hq6: 'a plan of action must always name potential effects',
  hq7: 'recurrence demands preventive measures and lessons learned',
};
