// ── Knowledge-check quiz bank ────────────────────────────────────────────────
// Ported 1:1 from src/lib/lab52/quiz.ts (same items, same order, same correct
// positions, same explanations and study topics).
'use strict';

// Correct-answer positions are rotated on purpose (R4): medium = [2,0,3,1,2,0,3], hard = [1,3,0,2,3,1,0,2].
// Option lengths are kept within ±1 word of each other so length never gives the answer away (R5).
const QUIZ = [
  // ── Medium: concept questions (5–7) ──
  {
    id: 'mq1', mode: 'medium',
    q: 'A tech needs to connect two legacy switches whose ports have auto-MDIX disabled. Which patch cord is required?',
    options: ['A straight-through cord', 'A rollover console cord', 'A crossover cord', 'A crossover-plus attenuator'],
    correct: 2,
    explain: 'Like devices (switch↔switch) transmit on the same pins, so the cord must cross the TX pair (1,2) onto the RX pair (3,6). With auto-MDIX disabled nothing self-corrects a straight-through; rollover is for console ports.',
    topic: 'straight-through vs crossover wiring and the auto-MDIX caveat',
  },
  {
    id: 'mq2', mode: 'medium',
    q: 'A link comes up at 100 Mb/s on a gigabit drop and the CRC counter climbs steadily. What is the most likely cause?',
    options: ['Split pair at the patch panel', 'Jammed buffer on the egress port', 'Mismatched optics on the uplink', 'PoE budget shortfall on the switch'],
    correct: 0,
    explain: 'A split pair still passes the link-test pairs, so the link trains — but gigabit needs all four pairs correct, so it downshifts to 100 Mb/s while crosstalk corrupts frames (rising CRC). Buffers produce drops, optics mismatches keep the link dark, PoE denies power.',
    topic: 'reading the 100 Mb/s downshift + climbing CRC as an improper-termination signature',
  },
  {
    id: 'mq3', mode: 'medium',
    q: 'Which statement about Cat ratings is correct?',
    options: ['Cat6 carries 10 Gb/s to 100 m', 'Cat5e carries 10 Gb/s to 55 m', 'Cat7 uses unshielded RJ45 ends', 'Cat8 channels may not exceed 30 m'],
    correct: 3,
    explain: 'Cat8\'s 25/40 Gb/s only works in ≤30 m channels. Cat6 does 10 G only to 55 m (Cat6a reaches 100 m); Cat5e is 1 Gb/s at 100 m; Cat7 is shielded S/FTP with GG45/TERA connectors (simplified here).',
    topic: 'category bandwidth–distance limits (Cat5e/6/6a/7/8)',
  },
  {
    id: 'mq4', mode: 'medium',
    q: 'An access point draws 25.5 W (802.3at class 4). Which PoE standard must the switch port support?',
    options: ['802.3af', '802.3at (PoE+)', '802.3bt only', 'No PoE — external PSU'],
    correct: 1,
    explain: '802.3at (PoE+) delivers up to 30 W at the port / 25.5 W at the device — exactly class 4. 802.3af tops out at 15.4 W port / 12.95 W device; 802.3bt (60–90 W) also works but is not required.',
    topic: 'PoE standards af/at/bt and their device-class wattages',
  },
  {
    id: 'mq5', mode: 'medium',
    q: 'Which medium is immune to EMI/RFI — and why?',
    options: ['STP copper, via its foil shield', 'Plenum copper, via its jacket', 'Fiber optic, it carries light', 'Cat8 copper, via its 2 GHz'],
    correct: 2,
    explain: 'EMI induces current into conductors; fiber carries modulated light through glass, so there is nothing to induce into. STP reduces (not eliminates) pickup; plenum is a fire-code rating; bandwidth ratings are not immunity.',
    topic: 'EMI/RFI coupling into copper vs fiber immunity',
  },
  {
    id: 'mq6', mode: 'medium',
    q: 'A port shows "err-disabled". What is the correct first move?',
    options: ['Fix the cause, then re-enable', 'Re-enable the port right away', 'Replace the entire switch', 'Set it administratively down'],
    correct: 0,
    explain: 'Err-disable means protection tripped (bad cable, link-flap, security violation). Re-enabling without fixing the cause just re-trips it — cause first, cure second; admin-down is a deliberate state, not a repair.',
    topic: 'err-disable recovery order: cause before cure',
  },
  {
    id: 'mq7', mode: 'medium',
    q: 'A 1 Gb/s uplink pairs a 1000Base-SX SFP (850 nm, MMF) with a 1000Base-LX10 SFP (1310 nm, SMF). What happens?',
    options: ['Link trains at reduced speed', 'Link trains with CRC errors', 'Only one side logs errors', 'Link stays dark — mismatch'],
    correct: 3,
    explain: 'The SX emits 850 nm light aimed at a receiver tuned for 1310 nm — over the wrong fiber mode entirely, so no light is ever received. Optics must match on speed, fiber mode AND wavelength.',
    topic: 'transceiver matching: speed, fiber mode and wavelength',
  },

  // ── Hard: scenario items (6–8) ──
  {
    id: 'hq1', mode: 'hard',
    q: 'Tester on run B: pins 1,2 at end A land on 3,6 at end B; the rest map straight. The connected legacy port (auto-MDIX off) shows down/down. Root cause?',
    options: ['An open circuit', 'TX/RX transposed', 'A split pair', 'Excessive untwist'],
    correct: 1,
    explain: 'The transmit pair of one end lands on the transmit pair of the other — both ends "speak" on the same pair and neither listens there. That is TX/RX transposition; a split pair would still train at reduced speed, an open fails the wire map outright.',
    topic: 'wire-map interpretation: TX/RX transposition vs split pair vs open',
  },
  {
    id: 'hq2', mode: 'hard',
    q: 'PoE budget 95 W; committed draws 7.0 + 7.0 + 12.95 + 25.5 + 12.95 + 12.95 W. An 802.3at class-4 AP (25.5 W) requests power. How much is the request over budget?',
    options: ['3.85 W', '12.95 W', '25.5 W', '8.85 W'],
    correct: 3,
    explain: 'Committed = 78.35 W. 78.35 + 25.5 = 103.85 W required; 103.85 − 95 = 8.85 W over. Relocating a class-3 device (12.95 W) releases enough headroom.',
    topic: 'PoE budget arithmetic and headroom planning',
  },
  {
    id: 'hq3', mode: 'hard',
    q: 'A1 (1 Gb/s SFP slot) holds 10GBase-SR (SFP+). The link is dark. Best diagnosis?',
    options: ['SFP+ module in a 1 Gb/s slot', 'A dirty LC connector on the cord', 'An exhausted PoE budget on P14', 'A transposed pair on the cord'],
    correct: 0,
    explain: '10GBase-SR is an SFP+ (10 Gb/s) module; the 1 Gb/s SFP slot neither powers nor negotiates it. Match form factor and speed first, then fiber mode and wavelength. The other options are real faults — just not this one.',
    topic: 'SFP vs SFP+ form-factor and speed matching',
  },
  {
    id: 'hq4', mode: 'hard',
    q: 'Port: 100 Mb/s HALF, collisions climbing with runts and CRC errors. Partner NIC is forced 100/full. Diagnosis?',
    options: ['A damaged patch cord', 'A jumbo/MTU mismatch', 'A duplex mismatch', 'PoE under-delivery'],
    correct: 2,
    explain: 'One side autonegotiates to half while the other is forced full — the classic duplex mismatch: late collisions, runts and CRC errors all climbing together. Damaged cords trip err-disable, jumbo frames show giants, PoE shows power denials.',
    topic: 'duplex-mismatch counter signature (half + collisions + runts)',
  },
  {
    id: 'hq5', mode: 'hard',
    q: 'Optical meter on a 1 G link: RX = −24.8 dBm, receiver spec floor = −17.0 dBm, link is up with light CRC climb. Best next action?',
    options: ['Swap the switch', 'Boost the transmit power', 'Ignore — the link is up', 'Clean and reseat the connector'],
    correct: 3,
    explain: '7.8 dB below the floor means the receiver is starved: dirty/loose connectors are the most common cause. "Up" is not "healthy" — marginal optical power shows up later as CRC errors and flaps. There is no user-facing transmit-power knob on fixed SFPs.',
    topic: 'optical RX power vs spec floor (dB budgets, dirty connectors)',
  },
  {
    id: 'hq6', mode: 'hard',
    q: 'Which finding does NOT justify re-routing a cable run away from an electrical conduit?',
    options: ['A steady CRC climb that stops when gear powers down', 'Three lifetime CRC errors on a printer', 'A 112 m channel failing insertion loss', 'Bundling with 277 V lighting circuits'],
    correct: 1,
    explain: 'Three lifetime errors with zero rate is noise, not a trend — re-routing decisions need a rate-based signal (or a certification FAIL), not a total seen once. The other three are classic EMI/attenuation evidence.',
    topic: 'rate vs lifetime totals when judging counter evidence',
  },
  {
    id: 'hq7', mode: 'hard',
    q: 'An uplink member shows "suspended" in an LACP port-channel. Correct remediation order?',
    options: ['Confirm → add → verify → document', 'Re-enable → confirm → document → close', 'Replace optic → verify → re-enable → document', 'Delete channel → re-create → verify → document'],
    correct: 0,
    explain: 'Suspended = LACP waiting for a partner that is not configured. Confirm the diagnosis on both switches, make the change, verify "(bu) bundled", then document — never document what you have not verified, never change what you have not confirmed.',
    topic: 'remediation ordering for suspended LACP members',
  },
  {
    id: 'hq8', mode: 'hard',
    q: 'During a walk-through you find a dark port that monitoring flags. It is administratively down with a "planned spare" label. What do you do?',
    options: ['Enable it to clear the alert', 'Re-cable and retest the drop', 'Document it as intentional and leave it', 'Log it as err-disabled'],
    correct: 2,
    explain: 'Admin-down is a deliberate configuration, not a fault. "Fixing" intentional states creates change risk (and in this lab, loses points). Verify the intent, document, move on.',
    topic: 'red-herring discipline: leave intentional admin-down states alone',
  },
];

const quizFor = function (mode) {
  return QUIZ.filter(function (q) { return q.mode === mode; });
};
