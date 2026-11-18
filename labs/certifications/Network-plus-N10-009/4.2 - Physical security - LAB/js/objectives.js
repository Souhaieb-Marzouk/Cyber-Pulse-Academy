/* ── objectives.js ───────────────────────────────────────────────────
   The CHECK RESULTS validation engine, carried over 1:1 from the
   original framework lab (src/lib/lab/objectives.ts): 12 Medium +
   8 Hard objective definitions with their exact validate() rules,
   feedback wording, hint tiers, and the per-mode Site Audit items.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
/* ── normalization helpers ─────────────────────────────────────────── */
const norm = (s) => (s || "").trim().toLowerCase().replace(/[\s\-_.]/g, "");
const isDoor03 = (s) => norm(s) === "dr03" || norm(s) === "door03" || norm(s) === "03";
const isIdfDoor = (s) => norm(s).includes("idf");

function initialEnv() {
  return {
    matchCam: {},
    matchLock: {},
    report: { cam: "", time: "" },
    zoneCam: {},
    tailgate: { door: "", count: "" },
    brute: { door: "", count: "" },
    lockout: {},
    lockAssign: {},
    settings: { retention: 7, resolution: "", motionAlerts: false, tamperAlerts: false },
    sensitivity: {},
    eventClass: {},
    principle: "",
    tamper: { cam: "", cause: "" },
    recon: { door: "", method: "", target: "", window: "" },
    alertClass: {},
    keyMarks: {},
    chain: [],
    rule: { door: "", start: "", end: "", threshold: "" },
    antiPassback: {},
    mountNote: null,
    auditRun: 0,
    auditResult: null,
  };
}

/* ── MEDIUM objectives (12, guided) ────────────────────────────────── */
var OBJ_MEDIUM = [
  {
    id: "OBJ-M1",
    title: "Camera types in the rack",
    task: "Match each patrol role on the Coverage Worksheet to the correct camera type (PTZ, dome, bullet, thermal).",
    pillar: "U",
    panels: ["worksheet"],
    hints: [
      "Each role maps to one camera type — think about what the operator needs to DO.",
      "Track a moving vehicle = pan/tilt/zoom. A lobby ceiling unit that hides its aim = dome.",
      "Fence line = long fixed view = bullet. Seeing body heat in total darkness = thermal.",
    ],
    validate: (e) => {
      const ok =
        e.matchCam.r1 === "PTZ" && e.matchCam.r2 === "Dome" && e.matchCam.r3 === "Bullet" && e.matchCam.r4 === "Thermal";
      return {
        ok,
        feedback: ok
          ? "Correct: PTZ follows, domes hide their aim in public spaces, bullets hold long fixed views, thermal reads heat when there is no light at all. Choosing a type starts from what the operator must see, not from the box on the shelf."
          : "Not yet. Each role has one best type: remote tracking → PTZ; discreet, vandal-resistant indoor → dome; long fixed fence/dock view → bullet; heat through darkness → thermal. Check the Coverage Worksheet dropdowns.",
      };
    },
  },
  {
    id: "OBJ-M2",
    title: "Locks for four assets",
    task: "On the Coverage Worksheet, match each protected asset to the lock type that fits it best.",
    pillar: "U",
    panels: ["worksheet"],
    hints: [
      "Match hardware to context: portability, traffic, and how people enter.",
      "A sliding cage gate takes a padlock. A laptop in a meeting room takes a cable lock.",
      "A closet with code-only entry takes a keypad; the main staff entrance takes a smart card reader.",
    ],
    validate: (e) => {
      const ok =
        e.matchLock.l1 === "Padlock" && e.matchLock.l2 === "Cable lock" && e.matchLock.l3 === "Keypad" && e.matchLock.l4 === "Smart card";
      return {
        ok,
        feedback: ok
          ? "Correct: padlocks secure cages and gates, cable locks tether portable gear, keypads fit code-only service doors (with a lockout!), and smart card readers handle high-traffic entrances with full logs."
          : "Not yet. Think: cage gate → padlock; laptop → cable lock; code-only closet → keypad; high-traffic staff entrance → smart card reader. See the worksheet dropdowns.",
      };
    },
  },
  {
    id: "OBJ-M3",
    title: "Flag the person event",
    task: "Open the Incident Report and record which camera saw the person in the corridor — and at what time.",
    pillar: "R",
    panels: ["camerawall", "report"],
    hints: [
      "The camera wall shows motion flags on feeds; metadata is evidence.",
      "Look for the feed with a 'person detected' event — note its camera ID and the timestamp.",
      "COR-02 saw a person at 02:14:37. Enter the camera ID and 02:14 in the report.",
    ],
    validate: (e) => {
      const ok = e.report.cam === "COR-02" && e.report.time.includes("02:14");
      return {
        ok,
        feedback: ok
          ? "Logged: COR-02 at 02:14:37. Camera ID + timestamp is the minimal evidence record — it anchors every later correlation (badge log, keypad log) to the same timeline."
          : "Check the camera wall: one feed has a person-detection event. Record its camera ID (e.g., COR-02) and the time (02:14). Metadata like this is what investigators cite first.",
      };
    },
  },
  {
    id: "OBJ-M4",
    title: "Find the blind spot",
    task: "On the facility schematic, identify the sensitive zone with NO camera coverage and assign it a spare camera from the shelf.",
    pillar: "R",
    panels: ["schematic"],
    hints: [
      "Compare the zone list against the FOV cones on the schematic.",
      "Every zone has a feed except one — the network equipment closet.",
      "The IDF closet is uncovered. Assign any spare from the dropdown — FISH-01 or BULL-02 (both IR-capable) fit a lights-off room.",
    ],
    validate: (e) => {
      const ok = !!e.zoneCam["idf"];
      return {
        ok,
        feedback: ok
          ? "Blind spot closed: the IDF closet — the exact room the intruder used — now has coverage. Note the lesson: pick an IR-capable camera for a lights-off equipment room, and aim a second view at it (defense in depth)."
          : "One zone on the schematic has no FOV cone and no feed: the IDF closet (network equipment). Assign one of the spare cameras to it in the Schematic panel — prefer IR-capable (FISH-01 or BULL-02) since equipment rooms run lights-off.",
      };
    },
  },
  {
    id: "OBJ-M5",
    title: "Tailgating in the badge log",
    task: "In the Access Log Terminal, find the door where door-open events exceed badge swipes overnight — enter the door and the number of door-open events.",
    pillar: "D",
    panels: ["accesslog"],
    hints: [
      "Compare the two counts per door: credentials presented vs times the door actually opened.",
      "A door that opened more times than people badged means someone walked through unbadged.",
      "DR-03 shows 7 door-open events but only 6 swipes — the answer is DR-03 and 7.",
    ],
    validate: (e) => {
      const ok = isDoor03(e.tailgate.door) && e.tailgate.count.trim() === "7";
      return {
        ok,
        feedback:
          ok
            ? "Exactly: DR-03 opened 7 times on 6 swipes — one unbadged entry at 02:09:51, seconds after J. Rocha badged through. Correlating credentials with door contacts is the highest-yield physical detection you have."
            : "Compare swipes vs door-open events per door in the terminal. One door opened more times than people badged — that's tailgating. (It's DR-03 with 7 door-open events.)",
      };
    },
  },
  {
    id: "OBJ-M6",
    title: "Brute force + lockout",
    task: "Find the door whose keypad was brute-forced, enter its failure count, and set that door's lockout threshold to 5 attempts.",
    pillar: "D",
    panels: ["accesslog", "doors"],
    hints: [
      "The keypad log lists failed attempts per door, then a final 'granted'.",
      "One door ate 17 guesses before accepting a code — and nothing stopped the attacker.",
      "DR-IDF-01 failed 17 times. Enter that, then set its lockout threshold to 5 in the Door panel.",
    ],
    validate: (e) => {
      const ok = isIdfDoor(e.brute.door) && e.brute.count.trim() === "17" && (e.lockout["DR-IDF-01"] ?? 0) === 5;
      return {
        ok,
        feedback: ok
          ? "DR-IDF-01: 17 failures from 02:06 to 02:12, then success — and your lockout at 5 would have stopped it at attempt six and alerted you. A keypad without a lockout is just a slow password with no rate limit."
          : "Read the keypad log: one door shows 17 failed attempts then 'granted'. Enter that door + count, then set that door's lockout threshold to 5 in the Door Console (it's DR-IDF-01).",
      };
    },
  },
  {
    id: "OBJ-M7",
    title: "Match locks to zones",
    task: "In the Door Console, assign the right lock type to each zone: server room, IDF closet, storage cage, loading dock interior.",
    pillar: "M",
    panels: ["doors"],
    hints: [
      "Sensitivity drives strength: the server room holds the crown jewels.",
      "Server room → the lock that binds access to a person. Loading dock interior has heavy staff traffic → the loggable card.",
      "Server room → Biometric; IDF closet → Keypad; storage cage → Padlock; dock interior → Smart card.",
    ],
    validate: (e) => {
      const ok =
        e.lockAssign["server"] === "Biometric" &&
        e.lockAssign["idf"] === "Keypad" &&
        e.lockAssign["storage"] === "Padlock" &&
        e.lockAssign["dock"] === "Smart card";
      return {
        ok,
        feedback: ok
          ? "Layered correctly: biometric on the server room (strongest binding), keypad+lockout on the IDF (rotatable codes), padlock on the cage (physical goods), smart card at the dock (traffic + logs). Control strength should track asset sensitivity and flow."
          : "Assign per sensitivity and traffic: server room → Biometric; IDF closet → Keypad; storage cage → Padlock; loading dock interior → Smart card. Each dropdown is in the Door Console.",
      };
    },
  },
  {
    id: "OBJ-M8",
    title: "Meet policy PS-7",
    task: "In Camera Settings, make the recorder compliant with policy PS-7: retain at least 30 days, record at evidence quality (1080p), and enable motion alerts.",
    pillar: "M",
    panels: ["settings"],
    hints: [
      "Three settings, one card: retention slider, resolution dropdown, alerts toggle.",
      "PS-7 asks for a MINIMUM — 30 days, 1080p, alerts ON.",
      "Set retention ≥ 30, resolution to 1080p, and switch motion alerts on.",
    ],
    validate: (e) => {
      const ok = e.settings.retention >= 30 && e.settings.resolution === "1080p" && e.settings.motionAlerts;
      return {
        ok,
        feedback: ok
          ? "Policy met: 30-day retention means evidence survives the investigation window, 1080p can identify a person, and motion alerts surface incidents in minutes instead of at the morning review."
          : "PS-7 needs: retention ≥ 30 days, resolution 1080p, motion alerts ON. Set all three in the Camera Settings panel.",
      };
    },
  },
  {
    id: "OBJ-M9",
    title: "Name the principle",
    task: "On the Coverage Worksheet, choose the security principle that explains why locks alone (or cameras alone) would have failed here.",
    pillar: "U",
    panels: ["worksheet"],
    hints: [
      "The intruder defeated the door control AND the monitoring — one after another.",
      "No single control covered every failure. That's the point of stacking independent layers.",
      "It's defense in depth.",
    ],
    validate: (e) => {
      const ok = e.principle === "defense in depth";
      return {
        ok,
        feedback: ok
          ? "Defense in depth: the lock was tailgated, the camera was unplugged, the keypad had no lockout — each layer must assume the previous one failed. That's the design rule for every zone you hardened today."
          : "The principle is defense in depth — layer independent controls so one failure isn't fatal. Select it on the worksheet.",
      };
    },
  },
  {
    id: "OBJ-M10",
    title: "Tune the motion queue",
    task: "Classify last night's three motion events (real / false) in the Motion Queue, and set both exterior zones' sensitivity to medium.",
    pillar: "D",
    panels: ["motion"],
    hints: [
      "Ask for each event: was a PERSON actually entering, or was something else tripping the sensor?",
      "A shape that exits under the gate and a light sweep with no person = false positives. The corridor person = real.",
      "EV-01 false, EV-02 false, EV-03 real — then set dock + parking sensitivity to medium.",
    ],
    validate: (e) => {
      const ok =
        e.eventClass["EV-01"] === "false" &&
        e.eventClass["EV-02"] === "false" &&
        e.eventClass["EV-03"] === "real" &&
        e.sensitivity["dock"] === "medium" &&
        e.sensitivity["parking"] === "medium";
      return {
        ok,
        feedback: ok
          ? "Queue tuned: the raccoon and the headlights are noise, the corridor person is signal — and medium exterior sensitivity cuts most animal/headlight trips without losing people. Untuned detection drowns operators in false positives until they stop reading alerts."
          : "Classify each event in the Motion Queue (EV-01 false, EV-02 false, EV-03 real), then set sensitivity to medium for both exterior zones (dock, parking).",
      };
    },
  },
  {
    id: "OBJ-M11",
    title: "The dark camera",
    task: "Identify which camera lost signal overnight, and select the most likely cause.",
    pillar: "R",
    panels: ["camerawall"],
    hints: [
      "One feed on the wall isn't showing a scene at all.",
      "Check its 'since' timestamp — it went dark BEFORE the corridor motion.",
      "IDF-N-04, dark since 02:05 — no maintenance was scheduled, so 'camera tampering likely' is the read.",
    ],
    validate: (e) => {
      const ok = e.tamper.cam === "IDF-N-04" && e.tamper.cause === "tamper";
      return {
        ok,
        feedback: ok
          ? "IDF-N-04 went dark at 02:05 — nine minutes before the person appeared. With no maintenance window, tampering is the professional read: blind the watcher first, then work. A tamper alert would have paged you at 02:05, not 06:00."
          : "Find the feed showing NO SIGNAL on the camera wall (IDF-N-04, since 02:05), then pick 'Camera tampering likely' — no maintenance was scheduled, and the outage preceded the intrusion events.",
      };
    },
  },
  {
    id: "OBJ-M12",
    title: "Run the site audit",
    task: "Run the Site Audit and close it out green — it verifies every hardening setting you've made so far.",
    pillar: "M",
    panels: ["audit"],
    hints: [
      "The audit checks your actual configuration state, not your intentions.",
      "It needs the blind spot closed, locks assigned, PS-7 met, and the motion queue tuned.",
      "Finish OBJ-M4, M7, M8 and M10 first, then hit RUN AUDIT — it should pass.",
    ],
    validate: (e) => {
      const ok = e.auditRun > 0 && e.auditResult === true;
      return {
        ok,
        feedback: ok
          ? "Audit green: coverage restored, locks matched to sensitivity, PS-7 met, queue tuned. Verification is the step teams skip — a control you configured but never tested is a hope, not a control."
          : "The audit verifies state: blind spot closed (M4), locks assigned (M7), PS-7 met (M8), queue tuned (M10). Finish those, then RUN AUDIT in the Site Audit panel.",
      };
    },
  },
];

/* ── HARD objectives (8, broad / strict) ───────────────────────────── */
var OBJ_HARD = [
  {
    id: "OBJ-H1",
    title: "Reconstruct the intrusion",
    task: "Complete the Incident Reconstruction: entry door, entry method, the door into the IDF, and the window in which the device was most likely installed.",
    pillar: "R",
    panels: ["recon", "camerawall", "accesslog"],
    hints: [
      "Chain the timeline: person at fence 01:58 → door events → keypad grant → motion → held-open → exit.",
      "The tailgate is the door with more opens than swipes; the IDF door is the one that ate 17 guesses then granted.",
      "DR-03, tailgating, DR-IDF-01, window 02:12–02:15 (grant 02:12:58, motion 02:14:37, held-open 02:15:12).",
    ],
    validate: (e) => {
      const ok =
        isDoor03(e.recon.door) &&
        e.recon.method === "tailgating" &&
        isIdfDoor(e.recon.target) &&
        e.recon.window === "02120215";
      return {
        ok,
        feedback: ok
          ? "Reconstruction accepted: tailgated DR-03 at 02:09, brute-forced DR-IDF-01 (grant 02:12:58), installed the device while COR-02 watched at 02:14 and the door hung open at 02:15. MITRE calls the implant step T1200 — Hardware Additions."
          : "Incomplete or wrong. The evidence gives: entry door = the one with 7 opens / 6 swipes; method = following an authorized person; IDF door = 17 keypad failures then grant; install window = between the keypad grant (02:12:58) and the held-open alarm (02:15:12) → 02:12–02:15.",
      };
    },
  },
  {
    id: "OBJ-H2",
    title: "Triage the alert queue",
    task: "Classify all 8 overnight alerts as REAL (attack evidence), FALSE (benign trigger), or RED HERRING (legit scheduled activity).",
    pillar: "D",
    panels: ["alerts"],
    hints: [
      "Two alerts come from scheduled work orders — verify before you chase.",
      "Animals and headlights are classic motion false positives.",
      "Real: AL-03, AL-04, AL-05, AL-08. False: AL-02, AL-07. Red herrings: AL-01, AL-06.",
    ],
    validate: (e) => {
      const ok = ["AL-01", "AL-06"].every((k) => e.alertClass[k] === "redherring") &&
        ["AL-02", "AL-07"].every((k) => e.alertClass[k] === "false") &&
        ["AL-03", "AL-04", "AL-05", "AL-08"].every((k) => e.alertClass[k] === "real");
      return {
        ok,
        feedback: ok
          ? "Clean triage: 4 real, 2 false, 2 red herrings — and the four real ones form one intrusion chain. The discipline here is verifying work orders and witnesses before chasing noise; alert fatigue is how real alerts die in a queue."
          : "Not quite. Scheduled cleaning (AL-01) and HVAC work (AL-06) are red herrings — logged activity with work orders. Animal + headlights (AL-02, AL-07) are false. Camera loss, tailgating, keypad failures, held-open (AL-03/04/05/08) are the real chain.",
      };
    },
  },
  {
    id: "OBJ-H3",
    title: "Design the camera coverage",
    task: "Rebuild coverage under a 4-camera budget: loading dock (follow vehicles), parking fence line (long fixed view), office corridor (one 360° unit), server room (lights-off at night).",
    pillar: "D",
    panels: ["coverage"],
    hints: [
      "The budget forces exactly one unit per named zone — pick by constraint, not preference.",
      "Thermal can't identify faces and DOME-02 has no IR for a lights-off room.",
      "Dock → PTZ-01, parking → BULL-01, corridor → FISH-01, server room → DOME-01.",
    ],
    validate: (e) => {
      const ok =
        e.zoneCam["dock"] === "PTZ-01" &&
        e.zoneCam["parking"] === "BULL-01" &&
        e.zoneCam["corridor"] === "FISH-01" &&
        e.zoneCam["server"] === "DOME-01";
      return {
        ok,
        feedback: ok
          ? "Coverage design accepted: PTZ where targets move, long-range bullet on the fence line, 360° fisheye where one unit must see the whole corridor, IR dome for the lights-off server room. THER-01 (can't identify) and DOME-02 (no IR) were the traps."
          : "Check each constraint: dock needs the only PTZ (PTZ-01); parking needs long-range IR (BULL-01); corridor needs the single-unit 360° (FISH-01); server room runs lights-off so it needs IR (DOME-01 — DOME-02 has none, THER-01 can't identify a person).",
      };
    },
  },
  {
    id: "OBJ-H4",
    title: "Write the escalation rule",
    task: "In the Rule Builder, write the after-hours escalation rule for the IDF door: 24h format window 20:00–06:00, and the failure threshold that should fire before the 17-guess attacker got in.",
    pillar: "D",
    panels: ["rulebuilder"],
    hints: [
      "The threshold is a number you already decided in the hardening discussion.",
      "After-hours means the window when no staff should be at the IDF door.",
      "Door DR-IDF-01, start 20:00, end 06:00, threshold 5.",
    ],
    validate: (e) => {
      const startOk = /^(20|8):00(:00)?$/.test(e.rule.start.trim());
      const endOk = /^(06|6):00(:00)?$/.test(e.rule.end.trim());
      const ok = e.rule.door === "DR-IDF-01" && startOk && endOk && e.rule.threshold.trim() === "5";
      return {
        ok,
        feedback: ok
          ? "Rule armed: ≥5 keypad failures on DR-IDF-01 between 20:00 and 06:00 pages the on-call instantly. The attacker died at attempt 6 in this rule — 11 guesses earlier than reality."
          : "The rule needs all four fields: door DR-IDF-01, window 20:00–06:00 (24h), threshold 5 failures. Exact values — near-misses (threshold 10, window 22:00) leave the attacker free guesses.",
      };
    },
  },
  {
    id: "OBJ-H5",
    title: "Hardening plan under trade-offs",
    task: "Using the trade-off cards, commit a lock choice for the three priority zones: server room (assurance over speed), IDF closet (no cards issued to vendors), loading dock interior (heavy staff traffic).",
    pillar: "M",
    panels: ["doors"],
    hints: [
      "Read the constraint in each parenthesis — it eliminates an option.",
      "'No cards issued' rules out card systems for the IDF; 'heavy traffic' rewards logging + speed.",
      "Server room → Biometric; IDF closet → Keypad (with lockout); dock interior → Smart card.",
    ],
    validate: (e) => {
      const ok =
        e.lockAssign["server"] === "Biometric" &&
        e.lockAssign["idf"] === "Keypad" &&
        e.lockAssign["dock"] === "Smart card";
      return {
        ok,
        feedback: ok
          ? "Plan committed: biometric binds the server room to a person, a lockout-keypad keeps vendor-free codes rotatable at the IDF, smart cards absorb dock traffic while logging every pass. Trade-offs are explicit and acceptable — that's the skill."
          : "Constraints decide: assurance-over-speed → Biometric (server room); no-issued-cards → Keypad + lockout (IDF); heavy traffic with logs → Smart card (dock). Set them in the Door Console.",
      };
    },
  },
  {
    id: "OBJ-H6",
    title: "Key custody audit",
    task: "In the Key Ledger, mark the three custody violations among the six entries. Marking non-violations fails the check.",
    pillar: "R",
    panels: ["keys"],
    hints: [
      "A violation means a key was outside policy control — late, copied, or an open door.",
      "On-time returns and signed audits are the healthy entries.",
      "Violations: K1 (96 h late), K3 (DO-NOT-DUPLICATE copied), K5 (gate taped open).",
    ],
    validate: (e) => {
      const ok =
        e.keyMarks["K1"] === true && e.keyMarks["K3"] === true && e.keyMarks["K5"] === true &&
        !e.keyMarks["K2"] && !e.keyMarks["K4"] && !e.keyMarks["K6"];
      return {
        ok,
        feedback: ok
          ? "All three found: a 96-hour-late master key, a copied restricted key, and a taped-open gate. The response is re-key the affected cylinders and tighten custody — a stamp is a deterrent, custody is the control."
          : "Exactly three entries break custody: a master key returned 96 h late (K1), a restricted key copied at a kiosk (K3), and a gate held open with tape (K5). Marking healthy entries (K2/K4/K6) fails the audit.",
      };
    },
  },
  {
    id: "OBJ-H7",
    title: "Failure chain + principle",
    task: "Order the three control failures by timestamp (first → last) in the Failure Chain, then name the design principle this chain proves.",
    pillar: "U",
    panels: ["chain"],
    hints: [
      "Each chain card carries the time its control failed. Order them chronologically.",
      "02:05 came before 02:09 came before 02:12.",
      "B (camera dark 02:05) → A (tailgate 02:09) → C (keypad 02:12); principle = defense in depth.",
    ],
    validate: (e) => {
      const ok =
        e.chain.length === 3 && e.chain[0] === "B" && e.chain[1] === "A" && e.chain[2] === "C" &&
        e.principle === "defense in depth";
      return {
        ok,
        feedback: ok
          ? "Chain read correctly: monitoring blinded (02:05), door policy beaten (02:09), lockout policy absent (02:12) — three independent layers failing in sequence, which is exactly why they must be independent. That's defense in depth, proven by an 02:00 timeline."
          : "Order by the timestamps on the cards: the camera died at 02:05 (B), the tailgate was 02:09 (A), the keypad caved at 02:12 (C). The principle that this sequence proves is defense in depth.",
      };
    },
  },
  {
    id: "OBJ-H8",
    title: "Close the gaps, verify",
    task: "Close all four gaps — anti-passback on DR-03, lockout ≥ 5 on DR-IDF-01, retention ≥ 90 days, tamper alerts ON — then run the verification audit until it passes.",
    pillar: "M",
    panels: ["doors", "settings", "audit"],
    hints: [
      "Four switches/numbers across two panels, then the audit button.",
      "Retention lives in Camera Settings; anti-passback on the DR-03 card.",
      "Set all four, then RUN AUDIT — it must end green for the objective to clear.",
    ],
    validate: (e) => {
      const ok =
        e.antiPassback["DR-03"] === true &&
        (e.lockout["DR-IDF-01"] ?? 0) >= 5 &&
        e.settings.retention >= 90 &&
        e.settings.tamperAlerts &&
        e.auditRun > 0 &&
        e.auditResult === true;
      return {
        ok,
        feedback: ok
          ? "Verified closed: anti-passback breaks the next tailgate, the lockout kills the next brute force, 90-day retention outlives any investigation, and tamper alerts page you the next time a camera dies. Configure → verify is the loop that makes hardening real."
          : "Gaps remain. Required: anti-passback ON (DR-03 card), lockout ≥ 5 (DR-IDF-01), retention ≥ 90 (Camera Settings), tamper alerts ON — then RUN AUDIT until it reports PASS.",
      };
    },
  },
];

var OBJECTIVES = {
  medium: OBJ_MEDIUM,
  hard: OBJ_HARD,
};

/* ── Site audit items per mode ─────────────────────────────────────── */

var AUDIT_ITEMS = {
  medium: [
    { label: "Every sensitive zone has camera coverage", pass: (e) => !!e.zoneCam["idf"], fix: "Assign a spare camera to the IDF closet (Schematic)." },
    { label: "Locks assigned to all four zones", pass: (e) => ["server", "idf", "storage", "dock"].every((z) => !!e.lockAssign[z]), fix: "Assign lock types in the Door Console." },
    { label: "Policy PS-7 (30 d / 1080p / motion alerts)", pass: (e) => e.settings.retention >= 30 && e.settings.resolution === "1080p" && e.settings.motionAlerts, fix: "Fix Camera Settings." },
    { label: "Motion queue tuned + real event classified", pass: (e) => e.sensitivity["dock"] === "medium" && e.sensitivity["parking"] === "medium" && e.eventClass["EV-03"] === "real", fix: "Classify events and set exterior sensitivity in the Motion Queue." },
  ],
  hard: [
    { label: "Anti-passback armed on DR-03", pass: (e) => e.antiPassback["DR-03"] === true, fix: "Enable anti-passback on the DR-03 card." },
    { label: "IDF keypad lockout ≥ 5", pass: (e) => (e.lockout["DR-IDF-01"] ?? 0) >= 5, fix: "Set the DR-IDF-01 lockout threshold." },
    { label: "Retention ≥ 90 days", pass: (e) => e.settings.retention >= 90, fix: "Raise retention in Camera Settings." },
    { label: "Tamper alerts enabled", pass: (e) => e.settings.tamperAlerts, fix: "Enable tamper alerts in Camera Settings." },
  ],
};

function runAudit(mode, e) {
  return AUDIT_ITEMS[mode].every((i) => i.pass(e));
}

  window.LabObjectives = { initialEnv: initialEnv, OBJECTIVES: OBJECTIVES, AUDIT_ITEMS: AUDIT_ITEMS, runAudit: runAudit };
})();
