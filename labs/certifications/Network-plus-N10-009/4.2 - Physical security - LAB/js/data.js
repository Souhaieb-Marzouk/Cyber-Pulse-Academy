/* ── data.js ─────────────────────────────────────────────────────────
   ALL lab content, carried over 1:1 from the original framework lab
   (src/lib/lab/data.ts): objectives' evidence data, quiz banks, hints,
   feedback wording, glossary, debrief. Data only — no logic here.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
/* ────────────────────────────────────────────────────────────────────────
   SYNTHETIC TRAINING DATA — Meridian Distribution, Harborview DC.
   All people, events, devices and logs are fictional.
   ──────────────────────────────────────────────────────────────────────── */

var FACILITY = {
  name: "Meridian Distribution — Harborview DC",
  org: "Meridian Distribution Co. (fictional)",
  night: "Night of Nov 9 → Nov 10, 2026",
  shift: "Morning review shift — 06:00",
};

var CAMERAS = [
  {
    id: "LOB-01",
    zone: "Reception / Lobby",
    type: "Dome",
    res: "1080p",
    ir: true,
    status: "ONLINE",
    scene: "Dimmed lobby, turnstile idle, no motion",
  },
  {
    id: "COR-02",
    zone: "Office corridor",
    type: "Dome",
    res: "1080p",
    ir: true,
    status: "ONLINE",
    scene: "Empty corridor, emergency lighting on",
    motion: [{ time: "02:14:37", detail: "MOTION — person detected (12 s)" }],
  },
  {
    id: "SRV-03",
    zone: "Server room",
    type: "Dome",
    res: "1080p",
    ir: true,
    status: "ONLINE",
    scene: "Rack aisle A, LEDs steady, no motion",
  },
  {
    id: "IDF-N-04",
    zone: "North corridor (IDF side)",
    type: "Bullet",
    res: "1080p",
    ir: true,
    status: "SIGNAL LOST",
    since: "02:05:12",
    scene: "— NO SIGNAL —",
  },
  {
    id: "STG-05",
    zone: "Storage cage",
    type: "Bullet",
    res: "720p",
    ir: true,
    status: "ONLINE",
    scene: "Cage shelving, pallets stacked, no motion",
  },
  {
    id: "DCK-06",
    zone: "Loading dock",
    type: "PTZ",
    res: "4K",
    ir: true,
    status: "ONLINE",
    scene: "Patrol preset 2: dock bay, trailer doors closed",
  },
  {
    id: "PRK-07",
    zone: "Parking lot (fence line)",
    type: "Bullet",
    res: "1080p",
    ir: true,
    status: "ONLINE",
    scene: "IR grayscale view of fence and lot B",
    motion: [{ time: "01:58:21", detail: "MOTION — person walking toward building" }],
  },
  {
    id: "ELE-08",
    zone: "Electrical room",
    type: "Fixed",
    res: "720p",
    ir: false,
    status: "ONLINE",
    scene: "Panels lit by indicator LEDs",
  },
];

var ZONES = [
  { id: "reception", name: "Reception / Lobby", coveredBy: "LOB-01", exterior: false },
  { id: "corridor", name: "Office corridor", coveredBy: "COR-02", exterior: false },
  { id: "server", name: "Server room", coveredBy: "SRV-03", exterior: false },
  { id: "idf", name: "IDF closet (network equipment)", coveredBy: null, exterior: false },
  { id: "storage", name: "Storage cage", coveredBy: "STG-05", exterior: false },
  { id: "electrical", name: "Electrical room", coveredBy: "ELE-08", exterior: false },
  { id: "dock", name: "Loading dock", coveredBy: "DCK-06", exterior: true },
  { id: "parking", name: "Parking lot", coveredBy: "PRK-07", exterior: true },
];

/* Spare cameras for coverage assignments (M4) and design exercise (H3) */
var SPARE_CAMERAS = [
  { id: "FISH-01", label: "FISH-01 — fisheye 360°, 720p, IR", ir: true },
  { id: "DOME-02", label: "DOME-02 — dome, 720p, no IR", ir: false },
  { id: "BULL-02", label: "BULL-02 — bullet, 4K, IR, long-range", ir: true },
];

var DESIGN_CAMERAS = [
  { id: "PTZ-01", label: "PTZ-01 — PTZ, 4K, IR, patrol", tag: "PTZ" },
  { id: "DOME-01", label: "DOME-01 — dome, 1080p, IR", tag: "DOME" },
  { id: "BULL-01", label: "BULL-01 — bullet, 1080p, IR, long-range", tag: "BULL" },
  { id: "FISH-01", label: "FISH-01 — fisheye 360°, 720p", tag: "FISH" },
  { id: "THER-01", label: "THER-01 — thermal, low-res", tag: "THER" },
  { id: "DOME-02", label: "DOME-02 — dome, 720p, no IR", tag: "DOME2" },
];

var DOORS = [
  { id: "DR-FRONT", name: "Main entrance", lock: "Smart card reader", zone: "Reception / Lobby" },
  { id: "DR-SIDE", name: "Side employee entrance", lock: "Deadbolt (hardware)", zone: "Perimeter" },
  { id: "DR-03", name: "Corridor staff door", lock: "Badge reader", zone: "Office corridor" },
  { id: "DR-IDF-01", name: "IDF closet door", lock: "Electronic keypad", zone: "IDF closet" },
  { id: "DR-SRV-02", name: "Server room door", lock: "Electronic keypad", zone: "Server room" },
  { id: "DR-STG", name: "Storage cage gate", lock: "Padlock", zone: "Storage cage" },
  { id: "DR-DCK", name: "Loading dock door", lock: "Electronic keypad", zone: "Loading dock" },
];

var BADGE_LOG = [
  { time: "22:00:03", door: "DR-FRONT", kind: "badge", who: "CLEANING CREW (2)" },
  { time: "01:44:55", door: "DR-DCK", kind: "badge", who: "HVAC TECH" },
  { time: "02:09:44", door: "DR-03", kind: "badge", who: "J. ROCHA" },
  { time: "02:09:51", door: "DR-03", kind: "door-open", who: "unidentified" },
  { time: "02:15:12", door: "DR-03", kind: "held", who: "held 41 s" },
  { time: "02:23:07", door: "DR-DCK", kind: "badge", who: "J. ROCHA" },
];

var BADGE_SUMMARY = [
  { door: "DR-FRONT", swipes: 2, opens: 2, held: 0 },
  { door: "DR-DCK", swipes: 2, opens: 2, held: 0 },
  { door: "DR-03", swipes: 6, opens: 7, held: 1 },
  { door: "DR-IDF-01", swipes: 0, opens: 1, held: 0 },
  { door: "DR-SRV-02", swipes: 0, opens: 0, held: 0 },
  { door: "DR-STG", swipes: 0, opens: 0, held: 0 },
];

var KEYPAD_LOG = [
  { time: "02:06:02", door: "DR-IDF-01", kind: "failed", detail: "attempt 1" },
  { time: "02:07:31", door: "DR-IDF-01", kind: "failed", detail: "attempts 2–4" },
  { time: "02:09:02", door: "DR-IDF-01", kind: "failed", detail: "attempts 5–9" },
  { time: "02:10:44", door: "DR-IDF-01", kind: "failed", detail: "attempts 10–14" },
  { time: "02:12:40", door: "DR-IDF-01", kind: "failed", detail: "attempts 15–17" },
  { time: "02:12:58", door: "DR-IDF-01", kind: "granted", detail: "code accepted" },
  { time: "02:13:20", door: "DR-SRV-02", kind: "failed", detail: "attempt 1" },
  { time: "02:14:02", door: "DR-SRV-02", kind: "failed", detail: "attempts 2–3" },
];

var KEYPAD_SUMMARY = [
  { door: "DR-IDF-01", fails: 17, granted: "02:12:58" },
  { door: "DR-SRV-02", fails: 3, granted: "—" },
  { door: "DR-DCK", fails: 0, granted: "—" },
];

var MOTION_EVENTS = [
  {
    id: "EV-01",
    time: "01:30:10",
    cam: "PRK-07",
    detail: "Small shape moving along fence line (later seen exiting under gate)",
    truth: "false",
  },
  {
    id: "EV-02",
    time: "01:41:52",
    cam: "PRK-07",
    detail: "Sweeping light pattern across lot B, no person visible",
    truth: "false",
  },
  {
    id: "EV-03",
    time: "02:14:37",
    cam: "COR-02",
    detail: "Person detected in office corridor, moving toward IDF",
    truth: "real",
  },
];

var ALERTS = [
  {
    id: "AL-01",
    time: "22:00",
    title: "Badge-in — cleaning crew",
    detail: "Scheduled night clean (work order WO-8841). Two badges, DR-FRONT.",
    truth: "redherring",
  },
  {
    id: "AL-02",
    time: "01:30",
    title: "Motion — parking fence line",
    detail: "PRK-07 small shape along fence; exits under gate. No person enters.",
    truth: "false",
  },
  {
    id: "AL-03",
    time: "02:05",
    title: "Camera IDF-N-04 signal lost",
    detail: "Feed went dark at 02:05:12. No maintenance window was scheduled.",
    truth: "real",
  },
  {
    id: "AL-04",
    time: "02:09",
    title: "DR-03 entries exceed swipes",
    detail: "6 badge events but 7 door-open events — one person entered without badging.",
    truth: "real",
  },
  {
    id: "AL-05",
    time: "02:06–02:12",
    title: "DR-IDF-01 keypad failures",
    detail: "17 failed attempts, then accepted code at 02:12:58. No lockout configured.",
    truth: "real",
  },
  {
    id: "AL-06",
    time: "23:30",
    title: "HVAC maintenance visit",
    detail: "Scheduled quarterly service (WO-8855). Tech badged at dock, left 01:44.",
    truth: "redherring",
  },
  {
    id: "AL-07",
    time: "01:41",
    title: "Light sweep — parking lot",
    detail: "Headlight-style sweep across PRK-07 view. Vehicle passes outside fence.",
    truth: "false",
  },
  {
    id: "AL-08",
    time: "02:15",
    title: "DR-03 door held open 41 s",
    detail: "Door contact held past allowed 10 s at 02:15:12.",
    truth: "real",
  },
];

var KEY_LEDGER = [
  { id: "K1", text: "Master key M-12 (storage cage) — returned 96 h after due date", violation: true },
  { id: "K2", text: "Contractor badge C-114 — returned on schedule, logged", violation: false },
  {
    id: "K3",
    text: "Key F-7 stamped DO NOT DUPLICATE — blank copy found cut at kiosk, original unaccounted",
    violation: true,
  },
  { id: "K4", text: "Quarterly key-custody audit signed by facilities lead", violation: false },
  {
    id: "K5",
    text: "Guard note 22:40: storage gate held open with tape 'for deliveries', re-locked 23:05",
    violation: true,
  },
  { id: "K6", text: "Re-key of IDF cylinder completed after contractor exit", violation: false },
];

var CHAIN_ITEMS = [
  {
    id: "B",
    time: "02:05",
    text: "IDF-N camera lost signal — monitoring went blind, no tamper alert existed",
  },
  {
    id: "A",
    time: "02:09",
    text: "DR-03 tailgating — door policy let an unbadged stranger inside",
  },
  {
    id: "C",
    time: "02:12",
    text: "DR-IDF-01 keypad had no lockout — 17 guesses succeeded",
  },
];

var LOCK_OPTIONS = [
  "Padlock",
  "Cable lock",
  "Keypad",
  "Smart card",
  "Biometric",
  "Key fob",
];

var LOCK_TRADEOFFS = {
  Padlock: "Cheap, portable hardware lock. Good for cages/gates; weakest against bolts cutters.",
  "Cable lock": "Secures portable gear (laptops) to furniture. Theft-deterrent only.",
  Keypad: "Code entry, no cards to lose; codes are rotatable. MUST have an attempt lockout.",
  "Smart card": "Fast for high-traffic staff; produces access logs. Low-end cards can be cloned.",
  Biometric: "Strongest binding to a person (fingerprint/iris); slowest and costliest per door.",
  "Key fob": "Pocket fob that unlocks on tap; convenient, but fobs are shareable/loss-prone.",
  Maglock: "Electromagnetic lock, very strong; often fail-safe (releases on fire alarm).",
};

var GLOSSARY = [
  { term: "CCTV", def: "Closed-circuit television — camera system whose feeds go to a limited, private set of monitors." },
  { term: "IP camera", def: "Network camera sending digital video over the LAN; integrates with alerting and VMS software." },
  { term: "PTZ", def: "Pan-Tilt-Zoom camera that can be re-aimed and zoomed remotely or on a patrol pattern." },
  { term: "Field of view (FOV)", def: "The area a camera actually sees; determines coverage and blind spots." },
  { term: "Blind spot", def: "A zone with no camera coverage — raw physical attack surface." },
  { term: "Retention", def: "How long recorded footage is kept before overwrite; decides whether evidence survives." },
  { term: "Motion detection", def: "Camera/VMS feature that triggers recording and alerts when movement is detected." },
  { term: "IR / night mode", def: "Infrared illumination that lets cameras capture usable images with the lights off." },
  { term: "Tamper alert", def: "Notification raised when a camera loses signal, is moved, or is covered." },
  { term: "Padlock", def: "Portable hardware lock for hasps, cages and gates." },
  { term: "Cable lock", def: "Locked cable that secures portable equipment (e.g., laptops) to furniture." },
  { term: "Keypad lock", def: "Electronic lock opened by a PIN; needs an attempt lockout to resist guessing." },
  { term: "Smart card / badge reader", def: "Electronic lock opened by a credential card; produces access logs." },
  { term: "Biometric lock", def: "Lock opened by a unique biological trait (fingerprint, iris, face)." },
  { term: "Tailgating", def: "Following an authorized person through a controlled door without badging." },
  { term: "Mantrap", def: "Vestibule with two interlocked doors; only one opens at a time to stop tailgating." },
  { term: "Maglock (fail-safe)", def: "Electromagnetic lock that releases when power is cut — including fire alarms — for safe egress." },
  { term: "Anti-passback", def: "Access-control rule requiring the same credential to badge out before it can badge in again." },
  { term: "Key custody", def: "Logged control of who holds which key, with due dates and audits." },
  { term: "Defense in depth", def: "Layering multiple controls so a single failure does not expose the asset." },
];

var QUIZ_MEDIUM = [
  {
    id: "QM1",
    prompt: "In a surveillance system, what does “retention” determine?",
    options: [
      "How many cameras feed one recorder",
      "How far the camera sees in low light",
      "How fast motion alerts reach the operator",
      "How long footage is kept before overwrite",
    ],
    answer: 3,
    explain:
      "Retention is the storage window. If a breach is discovered after footage has been overwritten, the evidence simply no longer exists — which is why policy sets retention (e.g., 30 days) before anything else.",
  },
  {
    id: "QM2",
    prompt: "Which camera type can be re-aimed and zoomed remotely during a live incident?",
    options: ["PTZ camera", "Dome camera", "Bullet camera", "Thermal camera"],
    answer: 0,
    explain:
      "PTZ = Pan/Tilt/Zoom. An operator can follow a suspect across a lot or load a patrol preset. Domes and bullets cover a fixed view; thermal shows heat but cannot zoom optically in this context.",
  },
  {
    id: "QM3",
    prompt: "Why does the curriculum pair cameras with motion detection?",
    options: [
      "It raises the resolution of recorded footage",
      "It is required for IR night mode to work",
      "It turns passive recording into active alerting",
      "It removes the need for physical locks",
    ],
    answer: 2,
    explain:
      "A camera that merely records is reviewed after the fact — if anyone reviews it at all. Motion detection makes the camera a detection source: it pushes a notification so a human reacts in minutes, not days.",
  },
  {
    id: "QM4",
    prompt: "“Tailgating” is best described as…",
    options: [
      "Copying a colleague's badge to get in",
      "Slipping through a door behind a badged person",
      "Holding a door open with tape for later",
      "Guessing keypad codes until one works",
    ],
    answer: 1,
    explain:
      "Tailgating (piggybacking) defeats even a strong lock because the door is opened legitimately — the attacker just slips through behind the authorized person. Mantraps and anti-passback are the classic countermeasures.",
  },
  {
    id: "QM5",
    prompt: "Which lock type grants access based on a unique biological characteristic?",
    options: ["Biometric lock", "Key fob", "Keypad lock", "Smart card reader"],
    answer: 0,
    explain:
      "Biometrics bind the credential to the person (fingerprint, iris, face) — it cannot be lent or forgotten like a card or code. Trade-offs: cost, speed, and privacy handling.",
  },
  {
    id: "QM6",
    prompt: "What is the core reason to deploy locks AND cameras rather than only one?",
    options: [
      "Insurance audits require both to be installed",
      "Cameras physically reinforce the door locks",
      "Either control alone can fail or be bypassed",
      "Outdoor zones need cameras instead of locks",
    ],
    answer: 2,
    explain:
      "This is defense in depth: a lock can be picked or tailgated, a camera can be unplugged or merely unwatched. Together, one control catches what the other misses — exactly what this incident demonstrated.",
  },
];

var QUIZ_HARD = [
  {
    id: "QH1",
    prompt:
      "The server-room maglock is fail-safe and releases during a fire alarm. What is the correct security response?",
    scenario:
      "Fire code requires egress doors to release. You cannot simply ignore the alarm-integration requirement.",
    options: [
      "Swap the maglock for a padlock-and-hasp kit",
      "Keep it; add door contact, camera, mantrap cover",
      "Disable the fire alarm loop on that door only",
      "Treat it as harmless; fail-safe locks self-resolve",
    ],
    answer: 1,
    explain:
      "Fail-safe maglocks trade security for life safety — that trade-off is mandatory, so you compensate: detect the unexpected unlock (door contact + camera) and slow attackers (mantrap) rather than fight the fire code.",
  },
  {
    id: "QH2",
    prompt: "Door activity shows 7 door-open events but 6 badge swipes. What is your conclusion?",
    options: [
      "The reader double-counted one badge swipe",
      "One swipe failed to reach the controller",
      "The event log corrupted during the night",
      "Someone entered without badging — tailgating",
    ],
    answer: 3,
    explain:
      "More door-open events than credential events means someone passed without presenting a credential. Correlating badge logs with door-contact events is a core physical detection technique.",
  },
  {
    id: "QH3",
    prompt: "Camera retention is 7 days; the breach is discovered on day 10. What happened?",
    options: [
      "The camera had been tampered with overnight",
      "Footage was overwritten before anyone saw it",
      "Retention does not affect investigations",
      "The VMS deleted only the intruder clips",
    ],
    answer: 0,
    explain:
      "Retention must cover your worst realistic detection-to-investigation window. Seven days destroyed the exact footage you now need — set retention by policy (e.g., 30–90 days for sensitive areas).",
  },
  {
    id: "QH4",
    prompt: "A key stamped DO NOT DUPLICATE was copied at a kiosk by an ex-contractor. First response?",
    options: [
      "Trust the stamp; it is legally enforceable",
      "Request the contractor return the copy",
      "Re-key the cylinders; audit all key custody",
      "Stamp the remaining keys twice as firmly",
    ],
    answer: 2,
    explain:
      "A stamp is a deterrent, not a control. Once a restricted key is out of your control, the lock itself is compromised: re-key (change the cylinder) and audit custody to find every other gap.",
  },
  {
    id: "QH5",
    prompt: "Which control best counters a keypad brute-force attack (17 guesses in 7 minutes)?",
    options: [
      "An attempt lockout with alerting (5 fails)",
      "Longer screws on the door's hinge side",
      "A second keypad wired to the same door",
      "A louder keypad that beeps on each try",
    ],
    answer: 0,
    explain:
      "A keypad without a lockout accepts unlimited guesses — it is an offline password policy with no rate limit. Lockout thresholds plus alerting turn brute force into an immediate alarm.",
  },
  {
    id: "QH6",
    prompt: "Why choose a dome camera over a bullet camera for a lobby ceiling?",
    options: [
      "Domes always record at higher resolution",
      "Domes work with no lighting at all",
      "Bullets cannot be mounted on a ceiling",
      "Domes hide their aim and resist vandalism",
    ],
    answer: 3,
    explain:
      "The dome's tinted cover conceals its aim (an observer cannot tell where it looks), it resists tampering, and its wide lens suits a room. Bullets excel at long, fixed, visible-deterrent views instead.",
  },
  {
    id: "QH7",
    prompt:
      "An intruder plugged an unregistered device into the IDF switch (MITRE T1200 — Hardware Additions). Which two controls would have helped most?",
    options: [
      "Longer switch passwords and idle screensavers",
      "A locked IDF door plus asset-management alerting",
      "A larger UPS and tidier cable management",
      "Faster Wi-Fi plus one firewall rule",
    ],
    answer: 1,
    explain:
      "T1200 starts with physical access. Layer 1: keep hands out (locks). Layer 2: if hands get in, asset management / endpoint policy blocks and flags unknown devices — exactly MITRE's M1034 mitigation logic.",
  },
];

/* Short topic labels per quiz item — used by the completion report's focus areas */
var QUIZ_TOPICS = {
  QM1: "retention windows",
  QM2: "camera types",
  QM3: "motion detection",
  QM4: "tailgating",
  QM5: "biometric locks",
  QM6: "defense in depth",
  QH1: "fail-safe maglock trade-offs",
  QH2: "badge/door correlation",
  QH3: "retention policy",
  QH4: "key-custody response",
  QH5: "keypad lockout",
  QH6: "camera selection",
  QH7: "T1200 — Hardware Additions mitigations",
};

var KNOWLEDGE = {
  briefing: [
    "You are the overnight security tech at Meridian Distribution's Harborview DC (fictional). At 06:00 the night log is full: a camera went dark, a keypad caved in, and a stranger walked out of the IDF closet — where the morning check just found an unidentified mini-device plugged into the switch.",
    "Your shift has two jobs: read the night's evidence precisely (cameras + logs), then harden the site so this never replays. Everything you see is SYNTHETIC training data.",
  ],
  cameras: [
    "Cameras are your detection layer: they don't stop an intruder, they surface one. What makes a camera useful is its field of view (no blind spots over sensitive zones), its night capability (IR — most real intrusions happen with lights off), its resolution (enough to identify a person), and above all motion detection — the feature that pushes an alert while the intrusion is happening instead of waiting for a human to scrub footage.",
    "Two curriculum traps: retention (footage overwritten before anyone looks = evidence that never existed) and tampering (a camera going dark right before an incident is itself a detection signal — cross-check its neighbors).",
  ],
  locks: [
    "Locks are your prevention layer. Hardware locks (padlock, chain, cable lock, door hardware) are cheap and mechanical; electronic locks (keypad, key fob, smart card/badge reader, biometric) add identity and logs. Match the lock to the asset: a padlock secures a cage, a keypad with a lockout protects an IDF closet, a smart card handles high-traffic staff flow, biometrics bind access to a person.",
    "Every lock type has a known failure mode: keypads get brute-forced without lockout thresholds, badges get tailgated past, keys get copied, maglocks release on fire alarms (fail-safe). Physical security is the art of layering so one failure isn't fatal — and logging so failures become visible.",
  ],
  chain: [
    "Why a network+ exam cares: physical access is the shortcut past every logical control. MITRE ATT&CK T1200 (Hardware Additions, Initial Access) covers exactly what happened here — adversaries 'physically introduce computer accessories, networking hardware, or other computing devices into a system or network'. With hands on the IDF switch, config theft to USB is T1052.001 (Exfiltration over USB, Exfiltration tactic).",
    "MITRE's mitigation for T1200 is M1034 — Limit Hardware Installation ('Block unknown devices and accessories…'); asset management is its detection logic: flag devices that should not exist on the network. For T1052.001 it is M1057 — Data Loss Prevention. Your locks and cameras are the layer that keeps those techniques from ever starting.",
  ],
  variants: [
    "Tailgating → mantrap / anti-passback / guard",
    "Keypad brute force → lockout threshold + alerting",
    "Badge cloning → high-frequency credentials + multi-factor doors",
    "Key copying → restricted keyways, custody audits, re-keying",
    "Camera tampering → tamper alerts + overlapping coverage",
    "Propped doors → door-held-open contacts with escalating alerts",
  ],
};

var DEBRIEF = {
  detections: [
    {
      title: "Tailgating via badge/door correlation",
      logic:
        "IF door_open_events > badge_events for the same door in a 5-min window → raise 'unbadged entry' (severity: high). Data sources: badge reader events + door contact sensors.",
    },
    {
      title: "Keypad brute force",
      logic:
        "IF keypad_failed_attempts >= 5 within 10 min → lock the keypad and notify. Data source: access controller keypad events.",
    },
    {
      title: "Camera tampering",
      logic:
        "IF camera feed lost OR scene change without scheduled maintenance → tamper alert + auto-panic to neighboring cameras. Data source: VMS health + tamper detection.",
    },
    {
      title: "Unknown device on switch (MITRE T1200 detection)",
      logic:
        "IF new MAC appears on an access-layer switch port AND is not in the asset register → block + alert (M1034 logic: asset management finds devices that shouldn't exist).",
    },
  ],
  mitigations: [
    { id: "Locks (prevention)", detail: "Padlock / cable lock / door hardware; keypad, key fob, smart card, biometric — matched to zone sensitivity, with lockout thresholds." },
    { id: "Anti-tailgating", detail: "Mantrap vestibules, anti-passback rules, guard procedure on DR-03." },
    { id: "Cameras (detection)", detail: "FOV covering every sensitive zone, IR for lights-off areas, motion alerts, tamper alerts, retention ≥ policy window." },
    { id: "Key management", detail: "Custody log, restricted keyways, audits, re-key on personnel change." },
    { id: "M1034 — Limit Hardware Installation", detail: "Block unknown devices/accessories via endpoint configuration and monitoring agents." },
    { id: "M1057 — Data Loss Prevention", detail: "Detect and block sensitive data copied to USB devices." },
  ],
  blue: [
    "Correlate credentials with door contacts — the badge log told the whole story before anyone watched a frame.",
    "A camera going dark is an event, not an outage ticket: 02:05 signal loss preceded 02:14 motion by nine minutes.",
    "Retention is part of the detection design: 7 days would have erased this incident.",
    "Every electronic lock needs a failure policy: lockout thresholds, held-open alarms, fire-alarm behavior.",
    "Audit for config, not just hardware: 'no lockout on IDF keypad' was visible in a settings page all along.",
  ],
  red: [
    "The easiest route past a firewall is a door handle: 40 seconds inside an IDF beats weeks of phishing.",
    "Blind the watcher first — one unplugged camera bought a nine-minute window.",
    "Keypads without lockouts are just slow passwords; watch for retry patterns.",
    "Shift changes and tailgating windows are gold: authorized people create legitimate noise.",
  ],
  links: [
    { label: "MITRE ATT&CK T1200 — Hardware Additions", url: "https://attack.mitre.org/techniques/T1200/" },
    { label: "MITRE ATT&CK T1052.001 — Exfiltration over USB", url: "https://attack.mitre.org/techniques/T1052/001/" },
    { label: "MITRE ATT&CK M1034 — Limit Hardware Installation", url: "https://attack.mitre.org/mitigations/M1034/" },
    { label: "MITRE ATT&CK M1057 — Data Loss Prevention", url: "https://attack.mitre.org/mitigations/M1057/" },
    { label: "CompTIA Network+ N10-009 (official)", url: "https://www.comptia.org/en-us/certifications/network" },
  ],
};

  window.LabData = { FACILITY, CAMERAS, ZONES, SPARE_CAMERAS, DESIGN_CAMERAS, DOORS, BADGE_LOG, BADGE_SUMMARY, KEYPAD_LOG, KEYPAD_SUMMARY, MOTION_EVENTS, ALERTS, KEY_LEDGER, CHAIN_ITEMS, LOCK_OPTIONS, LOCK_TRADEOFFS, GLOSSARY, QUIZ_MEDIUM, QUIZ_HARD, QUIZ_TOPICS, KNOWLEDGE, DEBRIEF };
})();
