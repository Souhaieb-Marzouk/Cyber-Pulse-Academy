// ── Objectives engine ────────────────────────────────────────────────────────
// Ported 1:1 from src/lib/lab52/engine.ts + the DIAG_OPTS table of
// ObjectivesDock.tsx. Check functions receive (env, derived) and return boolean.
'use strict';

const approx = function (v, target, tol) {
  const n = parseFloat(v);
  return Number.isFinite(n) && Math.abs(n - target) <= tol;
};

const setEq = function (a, b) {
  return !!a && a.length === b.length && b.every(function (x) { return a.includes(x); });
};

// ─────────────────────────────────────────────────────────────────────
// MEDIUM — 12 objectives (Bloom: Understand / Apply)
// ─────────────────────────────────────────────────────────────────────
const MEDIUM_OBJECTIVES = [
  {
    id: 'M1', pillar: 'P1',
    title: 'Stock the copper spool rack: pick the right cable for the 10 G server link, the legacy switch-to-switch link, and the plenum camera run.',
    guide: 'Three jobs are waiting in the Patch Bay. Match each to a cable from the rack — category rating, wiring style and fire-code jacket all matter.',
    check: function (e) { return e.jobCables['job-10g'] === 'c-cat6a-str' && e.jobCables['job-xover'] === 'c-cat6-xover' && e.jobCables['job-plenum'] === 'c-cat6-plenum'; },
    passMsg: 'Correct: 10 Gb/s over 80 m needs Cat6a (Cat6 caps at 55 m for 10G, Cat8 at 30 m); like devices with auto-MDIX off need a crossover; plenum spaces legally require plenum-rated jackets.',
    failMsg: 'Re-check each job\'s constraints: distance vs. category bandwidth (Cat6 = 10 G only to 55 m, Cat8 = 30 m max), like-vs-unlike devices when auto-MDIX is off, and fire code for air-handling spaces.',
    hints: [
      'Open the Patch Bay and read each job plate — the distance and device types are printed there.',
      'Job 1 is a distance problem (80 m at 10 Gb/s), job 2 is a wiring-style problem, job 3 is a jacket/fire-code problem.',
      'Answers: Cat6a STP for the 10 G run · Cat6 crossover for the legacy switch link · Cat6 plenum-rated for the ceiling run.',
    ],
  },
  {
    id: 'M2', pillar: 'P1',
    title: 'Pick the fiber patch cord for the 3 km annex link.',
    guide: 'The Annex building is 3 km away on a 1 Gb/s link. One cord in the rack reaches that far.',
    check: function (e) { return e.jobCables['job-fiber'] === 'f-os2-lc'; },
    passMsg: 'OS2 single-mode it is. Multimode (OM3/OM4) tops out around 550 m at 1 Gb/s — single-mode\'s small 9 µm core carries light much farther with less dispersion.',
    failMsg: 'Check the reach column: multimode cords top out in the hundreds of meters. Also mind the connector — the switch ports are LC, not SC.',
    hints: [
      'The decisive spec is maximum distance, not bandwidth.',
      'Multimode (OM3/OM4) ≈ 550 m at 1 Gb/s — nowhere near 3 km.',
      'Answer: OS2 single-mode LC-LC.',
    ],
  },
  {
    id: 'M3', pillar: 'P2',
    title: 'Clip the tester onto the WS-07 run, read the wire map, and name the termination fault.',
    guide: 'WS-07 is slow but linked. The tester will draw the pin map end-to-end — read it like a wiring diagram.',
    check: function (e) { return !!e.tested['ws07'] && e.diag['ws07'] === 'split'; },
    passMsg: 'Split pair confirmed: pins 5/6 swapped puts one conductor of the green pair next to the orange pair. The link still comes up, but crosstalk (NEXT) wrecks throughput — and gigabit needs all four pairs wired correctly, hence the 100 Mb/s downshift.',
    failMsg: 'Look at pins 5 and 6 in the wire map: a white/blue lands where a green belongs. That is not an open or a short — the link works, just over the wrong pairs.',
    hints: [
      'Select run WS-07 in the tester and press TEST — the wire map prints both ends.',
      'The link is UP, so rules out open/short. Compare pin 5 and pin 6 against the T568B pattern.',
      'Pins 5 and 6 are swapped → split pair (improper termination).',
    ],
  },
  {
    id: 'M4', pillar: 'P2',
    title: 'Test the WS-12 run and diagnose why the link never comes up.',
    guide: 'WS-12 shows nothing at all. The wire map here tells a different story than WS-07\'s.',
    check: function (e) { return !!e.tested['ws12'] && e.diag['ws12'] === 'txrx'; },
    passMsg: 'TX/RX transposed: the hand-crimped patch swaps pairs 1,2 with 3,6 — both ends end up transmitting on the same pair, so neither ever hears the other. Normally auto-MDIX would silently fix this; this legacy switch has it disabled, which is why the link is dead.',
    failMsg: 'The map shows pairs 1,2 crossed onto 3,6 — that is a crossover pattern where a straight-through belongs. Both devices transmit on 1,2 → no link, not slow link.',
    hints: [
      'Test run WS-12 and compare the two ends of the wire map pin by pin.',
      'Pins 1,2 at end B land where 3,6 should be — the transmit and receive pairs trade places.',
      'Diagnosis: TX/RX transposed (crossover-style pairs in a straight-through position).',
    ],
  },
  {
    id: 'M5', pillar: 'P2',
    title: 'Meter the CR-2 run and identify the signal-degradation verdict.',
    guide: 'The meter measures channel length and insertion loss against the standard. One number here will be over the limit.',
    check: function (e) { return !!e.metered['cr2'] && e.diag['cr2'] === 'overlength'; },
    passMsg: 'The channel measures 112.4 m with 23.8 dB insertion loss against a 21.3 dB limit — attenuation out of spec. Every extra meter adds loss; past 100 m a 1000BASE-T channel is no longer guaranteed.',
    failMsg: 'The wire map is fine here — the meter is the evidence. Channel length over 100 m means attenuation beyond the standard\'s budget.',
    hints: [
      'Put the meter on run CR-2 and read both rows: length and insertion loss.',
      'Compare 112.4 m and 23.8 dB to the printed limits (100 m / 21.3 dB).',
      'Verdict: attenuation / over-length channel.',
    ],
  },
  {
    id: 'M6', pillar: 'P2',
    title: 'Explain CR-2\'s degradation mechanisms: which apply, and which medium is immune to EMI?',
    guide: 'The ticket notes the run was bundled with the power conduit. Select every mechanism that applies — and the medium that EMI cannot touch.',
    check: function (e) { return setEq(e.multi['cr2-mech'], ['emi', 'attenuation']) && e.diag['fiber-emi'] === 'fiber'; },
    passMsg: 'Two mechanisms stack here: EMI induction from the power conduit plus attenuation from the over-length channel. Fiber carries light, not current — EMI/RFI cannot induce noise into it; that is why backbone fiber runs happily sit next to electrical services.',
    failMsg: 'Crosstalk is a within-cable effect (adjacent pairs bleeding into each other), not a conduit problem. Here EMI + attenuation both apply — and fiber is the EMI-immune medium.',
    hints: [
      'Re-read the CR-2 evidence plate in the Patch Bay: what does the run share its path with?',
      'One mechanism comes from the power conduit, the other from the length you measured in M5.',
      'Select EMI + attenuation; the immune medium is fiber.',
    ],
  },
  {
    id: 'M7', pillar: 'P2',
    title: 'Port-status triage: match P21, P9, A3 and P16 to their correct port states.',
    guide: 'Click each port on the switch wall (LED + interface panel), then match all four to their state\'s meaning.',
    check: function (e) { return e.match['st-p21'] === 'admin' && e.match['st-p9'] === 'errdisable' && e.match['st-a3'] === 'suspended' && e.match['st-p16'] === 'power'; },
    passMsg: 'P21 = administratively down (intentional), P9 = error-disabled (protection tripped), A3 = suspended (LACP waiting for its partner), P16 = down with PoE denied. Four different dark ports, four different root causes — LED color alone never tells the whole story.',
    failMsg: 'Inspect each port\'s interface panel: P21 says shutdown (admin), P9 says err-disable (link-flap), A3 says suspended (LACP), P16 says PoE denied. These four states look similar on a monitor but demand opposite responses.',
    hints: [
      'Click each of the four ports on the switch wall — the interface panel prints the exact state.',
      'Admin-down = someone typed "shutdown". Err-disabled = the switch protected itself. Suspended = waiting for a protocol partner.',
      'P21→admin down · P9→error disabled · A3→suspended · P16→no power (PoE denied).',
    ],
  },
  {
    id: 'M8', pillar: 'P3',
    title: 'Counter forensics on WS-07: which counters confirm a physical-layer fault on P5?',
    guide: 'Open P5\'s interface panel and read the counters — including the rate arrows — before answering.',
    check: function (e) { return setEq(e.multi['p5-counters'], ['crc', 'input']); },
    passMsg: 'CRC errors (checksum failures) plus rising input errors are the physical-fault signature — the bits are being corrupted between the NIC and the switch. Runts/giants belong to other failure modes entirely, and P5 has none.',
    failMsg: 'On P5 only the CRC and input-error counters are climbing (see the rate arrows). Runts = collisions/faulty NIC; giants = MTU/jumbo mismatch — neither is present here.',
    hints: [
      'Click port P5 on the switch wall and watch the rate arrows, not just totals.',
      'Which counters point at corrupted bits arriving over the wire?',
      'CRC errors + input errors. Everything else on P5 is flat.',
    ],
  },
  {
    id: 'M9', pillar: 'P3',
    title: 'Counter signatures: match CRC, runts, giants and drops to their most likely causes.',
    guide: 'Each counter family has a signature. P11, P19 and the congestion case elsewhere on this switch are live examples if you want to look.',
    check: function (e) { return e.match['sig-crc'] === 'physical' && e.match['sig-runts'] === 'collision' && e.match['sig-giants'] === 'mtu' && e.match['sig-drops'] === 'congestion'; },
    passMsg: 'CRC → physical corruption (bad cable/termination/interference); runts → collisions or a faulty NIC; giants → jumbo/MTU mismatch; drops → buffer congestion. Rising counters are your detection data source for Layer-1 faults.',
    failMsg: 'Re-read the live examples: P11 (duplex mismatch → collisions+CRC), P19 (jumbo → giants), a healthy port (stable, near-zero). Match each counter to the failure that produces it.',
    hints: [
      'CRC is a checksum failure — what corrupts frames in flight?',
      'Runts are undersized frames (collisions); giants are oversized (MTU); drops mean a buffer gave up.',
      'CRC→physical fault · runts→collisions/NIC · giants→MTU/jumbo · drops→congestion.',
    ],
  },
  {
    id: 'M10', pillar: 'P4',
    title: 'PoE math: how many watts over budget is AP-3, and what is the cheapest same-day fix?',
    guide: 'Open the Power bay. Add the committed draws, add AP-3\'s class-4 requirement, and compare against the 95 W budget.',
    check: function (e) { return approx(e.num['poe-exceed'], 8.85, 0.35) && (e.diag['poe-fix'] === 'move-camera' || e.diag['poe-fix'] === 'new-psu'); },
    passMsg: '78.35 W committed + 25.5 W for AP-3 = 103.85 W on a 95 W budget → 8.85 W over. Relocating the new camera to SW-OFFICE-2 frees exactly 12.95 W; a bigger PSU is the valid (but costlier) alternative. AP-3 needs 802.3at class 4 — 25.5 W is normal for that standard.',
    failMsg: 'Sum the per-port draw column: 7.0 + 7.0 + 12.95 + 25.5 + 12.95 + 12.95 = 78.35 W without AP-3. Add the AP\'s 25.5 W and subtract the 95 W budget. Then pick the fix that releases the most watts for the least cost.',
    hints: [
      'The Power bay lists every powered port\'s draw. Sum them, then add 25.5 W.',
      'Committed = 78.35 W. Required with AP-3 = 103.85 W. Budget = 95 W.',
      'Over by 8.85 W → relocate camera C-9 (12.95 W) to the office switch.',
    ],
  },
  {
    id: 'M11', pillar: 'P4',
    title: 'Fix the dark uplink: swap in a matched transceiver pair and the correct fiber cord.',
    guide: 'A1 holds 1000Base-SX (850 nm, MMF); the core side is documented as 1000Base-LX10 (1310 nm, SMF). Make both ends match — and the cord with them.',
    check: function (e) { return derive(e).a1Up; },
    passMsg: 'Matched pair, matched cord — the uplink is up. Optics must agree on speed (1 Gb/s SFP, not SFP+), fiber mode (MMF vs SMF) and wavelength (850 vs 1310 nm). Note the efficient fix: keep the LX10 pair and the OS2 cord already in place.',
    failMsg: 'Two valid combos exist: two 1000Base-SX + an OM3/OM4 cord, or two 1000Base-LX10 + the OS2 cord. 10GBase-SR/LR are SFP+ (10 Gb/s) — wrong slot. An SX talking to an LX10 is 850 nm light hunting for a 1310 nm receiver: never meets.',
    hints: [
      'Both ends must agree on three things: speed, fiber mode, wavelength.',
      'The cord must match the optics\' fiber type — MMF cord for SX, OS2 for LX10.',
      'Either pair two SX modules with an OM3/OM4 cord, or pair two LX10 modules with the OS2 cord.',
    ],
  },
  {
    id: 'M12', pillar: 'P4',
    title: 'Close out the bench: re-terminate WS-07 (T568B, minimal untwist), replace the WS-12 and P9 patches, recover P9, and fix CR-2\'s path.',
    guide: 'The capstone. Apply every fix in the correct order — cause first, recovery second — then watch the LED wall go green.',
    check: function (e) { const d = derive(e); return d.ws07Fixed && d.ws12Link && d.p9Recovered && d.cr2Fixed; },
    passMsg: 'Bench closed out: T568B with untwist under 13 mm kills the split pair; factory straight-through patches replace both bad cords; P9 recovered only after its cause was fixed; CR-2 re-routed and re-certified. This is the verify-and-document habit that N10-009\'s methodology demands.',
    failMsg: 'Work the checklist: punch-down in T568B order (white/orange first) with the untwist rule ticked · straight-through patches on WS-12 and P9 · Recover P9 only after its cable is replaced · both CR-2 fix buttons. The interface panel and LED wall verify each step.',
    hints: [
      'The Termination station is where WS-07 gets fixed; the Patch Bay holds the patch swaps and CR-2 fixes.',
      'P9\'s RECOVER button stays locked until a good patch cord is installed — cause before cure.',
      'Green LED wall = all five fixes live: WS-07 (pins+untwist), WS-12 patch, P9 patch+recover, CR-2 reroute+recert.',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// HARD — 9 objectives (Bloom: Analyze / Evaluate / Create)
// ─────────────────────────────────────────────────────────────────────
const HARD_OBJECTIVES = [
  {
    id: 'H1', pillar: 'P2',
    title: 'TK-1042 · Dead lab PC: prove the root cause with the tester, reject the tempting "fix", repair it, and verify.',
    guide: 'Evidence → diagnosis → remediation → verification. A near-miss fix exists; reject it with a reason.',
    check: function (e, d) { return !!e.tested['ws12'] && e.diag['ws12'] === 'txrx' && e.diag['ws12-fix'] === 'replace-patch' && d.ws12Link; },
    passMsg: 'Full chain: wire map shows 1,2⟷3,6 transposed → TX/RX fault; replace-patch chosen (re-enabling auto-MDIX would also mask it, but the org pins MDIX off and the cord itself is faulty — replacing removes the fault instead of hiding it); link verified up.',
    failMsg: 'You need all four parts: tester evidence (ws12), diagnosis = TX/RX transposed, fix = replace the patch (enabling MDIX only hides the fault), and the port actually up after the swap.',
    hints: ['Test the run, then choose the fix that removes the faulty component rather than configuring around it.', 'All four parts must be true at once: tested + txrx + replace-patch + link up.'],
  },
  {
    id: 'H2', pillar: 'P3',
    title: 'TK-1045 · PoE crisis: compute the exact over-budget watts, release the budget, set the port standard, and bring AP-3 up.',
    guide: 'Two independent power faults hide in this ticket. Numbers to two decimals.',
    check: function (e, d) { return approx(e.num['poe-exceed'], 8.85, 0.15) && e.poeP14Moved && e.poeP16Standard === 'auto' && d.p16PowerOk; },
    passMsg: '103.85 W required vs 95 W budget = 8.85 W over → relocating C-9 (12.95 W) clears it; AND the port was clamped to 802.3af (15.4 W) while the AP needs 802.3at class 4 (25.5 W) — an incorrect-standard fault that would have kept it boot-looping even with a clean budget.',
    failMsg: 'All four parts: the wattage (to ±0.15), the camera relocation, the standard knob set to auto (802.3at), and the port actually powered. Check the Power bay — the budget and the standard are two separate controls.',
    hints: ['Required draw minus budget = the number. Then find the second fault: what standard does the AP need vs what is the port set to?', 'Relocate C-9, set P16 to auto, and the amber blink becomes a steady green.'],
  },
  {
    id: 'H3', pillar: 'P1',
    title: 'TK-1046 · Dark uplink: build a valid optics pair, justify the choice, and reject the SFP+ trap.',
    guide: 'Speed, mode and wavelength must all agree across both ends and the cord. Then justify why YOUR working pair works — the physics differs by optic.',
    check: function (e, d) {
      if (!d.a1Up) return false;
      const viaSx = e.sfpA1 === 't-sx' && e.sfpCore === 't-sx';
      const viaLx = e.sfpA1 === 't-lx10' && e.sfpCore === 't-lx10';
      if (viaSx) return e.diag['sfp-why'] === 'mmf-850';
      if (viaLx) return e.diag['sfp-why'] === 'smf-1310';
      return false;
    },
    passMsg: 'Valid pair + justification that matches the optics you installed: 1000Base-SX emits 850 nm light for multimode fiber (OM3/OM4), while 1000Base-LX10 emits 1310 nm for single-mode (OS2) — and SFP+ 10G modules do not belong in a 1 Gb/s SFP slot. Three agreements: speed, mode, wavelength.',
    failMsg: 'Two parts: the link must be up with a matched pair, AND the justification must match the optic actually installed — SX works because 850 nm light travels multimode fiber; LX10 works because 1310 nm light travels single-mode. Picking SR/LR (SFP+) fails the 1 Gb/s slot regardless of fiber.',
    hints: ['Either two SX + MMF cord, or two LX10 + OS2 cord. Then answer WHY the working pair works.', 'The justification must match the optic you installed: 850 nm multimode for SX, 1310 nm single-mode for LX10.'],
  },
  {
    id: 'H4', pillar: 'P2',
    title: 'TK-1044 · Conference room: separate the real mechanisms from the decoy theory, then plan both physical fixes.',
    guide: 'The submitter already has a theory. Meter the run, weigh the evidence, and reject what does not fit.',
    check: function (e, d) { return setEq(e.multi['cr2-root'], ['emi', 'attenuation']) && e.diag['cr2-decoy'] === 'duplex' && d.cr2Fixed; },
    passMsg: 'Evidence says EMI (bundled with power conduit) + attenuation (112 m channel), and duplex mismatch is rejected: the interface shows 100/full on both ends, and a duplex fault does not care about ceiling routing. Both fixes applied: re-route away from the conduit, re-terminate to a ≤100 m certified channel.',
    failMsg: 'Three parts: mechanisms = EMI + attenuation; the rejected decoy theory = duplex mismatch (both ends are 100/full — no mismatch); and both physical fix buttons pressed in the Patch Bay.',
    hints: ['The interface panel for P7 settles the duplex question — read the speed/duplex line.', 'Root causes: conduit EMI + over-length attenuation; decoy: duplex; fixes: re-route + re-certify.'],
  },
  {
    id: 'H5', pillar: 'P3',
    title: 'Counter forensics grid: assign each port its exact cause — duplex mismatch, damaged cable, jumbo mismatch, or healthy.',
    guide: 'Four ports, four counter snapshots, one correct assignment each. Rates matter more than totals.',
    check: function (e) { return e.match['g-p11'] === 'duplex' && e.match['g-p9'] === 'damaged' && e.match['g-p19'] === 'jumbo' && e.match['g-p13'] === 'healthy'; },
    passMsg: 'P11: half-duplex + collisions + runts = duplex mismatch. P9: link flaps then err-disable = damaged cable. P19: giants only = jumbo/MTU mismatch. P13: zero-with-zero-rate = healthy. This grid is the exam\'s favorite "given a scenario" pattern.',
    failMsg: 'Read each port\'s interface panel again: P11 shows HALF duplex with collisions; P9 shows 27 flaps and an err-disable; P19 shows giants with zero CRC; P13 shows nothing at all moving.',
    hints: ['Half + collisions = duplex. Flaps + err-disable = physical damage. Giants = MTU. Flat zero = healthy.', 'Match by the strongest signature, not by which port sounds broken.'],
  },
  {
    id: 'H6', pillar: 'P3',
    title: 'Certification math: give the LIB-2 copper verdict with its dB excess, the A2 fiber shortfall in dB, and fix both.',
    guide: 'Two meters, two verdicts, two numbers. The A2 fix is a connector-level one.',
    check: function (e, d) { return e.diag['lib2-verdict'] === 'fail' && approx(e.num['lib2-db'], 2.2, 0.15) && approx(e.num['a2-db'], 7.8, 0.15) && d.a2Fixed && d.lib2Fixed; },
    passMsg: 'LIB-2: 26.2 dB against a 24.0 dB Cat5e channel limit = 2.2 dB over → FAIL (crushed under staples) → replace. A2: −24.8 dBm against a −17.0 dBm floor = 7.8 dB short → dirty/loose connector → clean & reseat. Optical power budgets are the fiber world\'s channel-certification math.',
    failMsg: 'You need: LIB-2 verdict FAIL with 2.2 dB excess (26.2 − 24.0), A2 shortfall of 7.8 dB (−24.8 vs −17.0), the LIB-2 replacement, and the A2 connector clean. All five parts.',
    hints: ['Excess = measured − limit. Shortfall = |measured − floor|. Both are subtractions.', 'LIB-2: replace the crushed cable. A2: clean/reseat the connector — the meter\'s note points there.'],
  },
  {
    id: 'H7', pillar: 'P2',
    title: 'Termination audit: find the two non-compliant jacks of the four, then punch a replacement to T568B with minimal untwist.',
    guide: 'Plant standard: T568B end-to-end, no split pairs. A jack can work and still be non-compliant.',
    check: function (e) { return setEq(e.multi['jack-audit'], ['J-B', 'J-C']) && pinOrderCorrect(e.pins) && e.untwist; },
    passMsg: 'J-B is T568A (functional but off-standard — mixing 568A/568B in one plant invites pair-confusion audits) and J-C is a split pair (5/6 swapped → NEXT). Your replacement jack is punched to T568B with untwist ≤ 13 mm — the standard that keeps NEXT down.',
    failMsg: 'Two jacks violate the plant standard: one is a full T568A order (all pairs rotated), one has pins 5/6 swapped (split pair). Then complete the punch-down in exact T568B order and tick the untwist rule.',
    hints: ['Compare each jack against T568B: W-O, O, W-G, BL, W-BL, G, W-BR, BR.', 'J-B is completely rotated to T568A; J-C swaps pins 5/6.'],
  },
  {
    id: 'H8', pillar: 'P4',
    title: 'LACP suspended member: order the four remediation steps correctly, then apply the sequence.',
    guide: 'Diagnosis precedes change; verification precedes documentation. Order matters.',
    check: function (e) { return e.lacpApplied && e.lacpOrder.length === 4 && e.lacpOrder[0] === 'confirm' && e.lacpOrder[1] === 'add' && e.lacpOrder[2] === 'verify' && e.lacpOrder[3] === 'document'; },
    passMsg: 'Confirm → add → verify → document, applied. A3 bundled into Po2. This mirrors N10-009\'s methodology tail: never document what you have not verified, and never change what you have not confirmed.',
    failMsg: 'The sequence must be exactly: confirm the misconfiguration on both switches, add the member, verify "(bu) bundled", then document. Applying without confirming risks changing the wrong switch.',
    hints: ['Which step proves the diagnosis before any change?', 'confirm → add → verify → document.'],
  },
  {
    id: 'H9', pillar: 'P3',
    title: 'Final line check: every real fault fixed, every red herring left untouched, all five real tickets documented.',
    guide: 'The bench-wide audit. Fixing a decoy is a failure; so is leaving a real fault.',
    check: function (e, d) { return d.allRealFixed && d.decoysUntouched && d.docOk; },
    passMsg: 'Line check passed: WS-12, WS-07, P9, CR-2, A1, PoE (budget + standard), LACP, LIB-2, A2 — all fixed; P21 left as the intentional spare it is; five tickets documented. You verified full functionality and left intentional states alone — the discipline 5.2 is really testing.',
    failMsg: 'Walk the bench: WS-12 patch · WS-07 termination · P9 cable+recover · CR-2 both fixes · A1 optics pair · PoE (C-9 moved + P16 standard) · LACP sequence · LIB-2 replaced · A2 cleaned · documents ticked on the five real tickets · P21 NOT enabled.',
    hints: ['The interface panel and LED wall are your verification data source — nothing green should still be amber.', 'Decoys: enabling the admin-down spare counts as a fault you created.'],
  },
];

const OBJECTIVES = { medium: MEDIUM_OBJECTIVES, hard: HARD_OBJECTIVES };

// Dev-only instructor answer key (F5) — kept for parity; not surfaced in the UI.
const ANSWER_KEY = [
  { id: 'M1', answer: 'job-10g=Cat6a · job-xover=crossover · job-plenum=plenum Cat6' },
  { id: 'M2', answer: 'job-fiber=OS2 LC' },
  { id: 'M3', answer: 'test ws07 → diag=split' },
  { id: 'M4', answer: 'test ws12 → diag=txrx' },
  { id: 'M5', answer: 'meter cr2 → diag=overlength' },
  { id: 'M6', answer: 'multi[cr2-mech]=[emi,attenuation] · diag[fiber-emi]=fiber' },
  { id: 'M7', answer: 'p21=admin · p9=errdisable · a3=suspended · p16=power' },
  { id: 'M8', answer: 'multi[p5-counters]=[crc,input]' },
  { id: 'M9', answer: 'crc=physical · runts=collision · giants=mtu · drops=congestion' },
  { id: 'M10', answer: 'poe-exceed=8.85 (±0.35) · poe-fix=move-camera|new-psu' },
  { id: 'M11', answer: 'SX+SX+OM3/OM4 or LX10+LX10+OS2' },
  { id: 'M12', answer: 'T568B pins+untwist · ws12 straight patch · p9 straight patch+recover · cr2 reroute+recert' },
  { id: 'H1', answer: 'tested ws12 · txrx · replace-patch · link up' },
  { id: 'H2', answer: '8.85±0.15 · C-9 moved · P16 auto · port up' },
  { id: 'H3', answer: 'valid pair up · why=mmf-850 (SX pair) | smf-1310 (LX10 pair)' },
  { id: 'H4', answer: 'cr2-root=[emi,attenuation] · cr2-decoy=duplex · both fixes' },
  { id: 'H5', answer: 'p11=duplex · p9=damaged · p19=jumbo · p13=healthy' },
  { id: 'H6', answer: 'lib2 fail 2.2 · a2 7.8 · both fixed' },
  { id: 'H7', answer: 'jacks=[J-B,J-C] · T568B pins · untwist' },
  { id: 'H8', answer: 'confirm→add→verify→document applied' },
  { id: 'H9', answer: 'all real fixed · P21 untouched · 5 docs' },
];

// ── Answer-field option tables (from ObjectivesDock.tsx DIAG_OPTS) ──
const DIAG_OPTS = {
  fault: [
    { v: 'split', label: 'Split pair — improper termination' },
    { v: 'txrx', label: 'TX/RX transposed' },
    { v: 'open', label: 'Open circuit' },
    { v: 'short', label: 'Short circuit' },
  ],
  cr2: [
    { v: 'overlength', label: 'Attenuation — channel over 100 m' },
    { v: 'emi-only', label: 'EMI only — length is in spec' },
    { v: 'bad-sfp', label: 'Bad transceiver' },
    { v: 'duplex', label: 'Duplex mismatch' },
  ],
  fiberEmi: [
    { v: 'fiber', label: 'Fiber' },
    { v: 'copper', label: 'Copper' },
    { v: 'both', label: 'Both equally' },
  ],
  status: [
    { v: 'admin', label: 'Administratively down — intentional' },
    { v: 'errdisable', label: 'Error disabled — protection tripped' },
    { v: 'suspended', label: 'Suspended — protocol waiting' },
    { v: 'power', label: 'Down — PoE denied' },
    { v: 'downdown', label: 'Down/down — nothing plugged in' },
    { v: 'up', label: 'Up — normal operation' },
  ],
  sig: [
    { v: 'physical', label: 'Physical fault — damaged cable / interference / bad termination' },
    { v: 'collision', label: 'Collisions or faulty NIC' },
    { v: 'mtu', label: 'Jumbo / MTU mismatch' },
    { v: 'congestion', label: 'Buffer congestion / overloaded link' },
  ],
  poeFix: [
    { v: 'move-camera', label: 'Relocate camera C-9 → SW-OFFICE-2 (frees 12.95 W)' },
    { v: 'new-psu', label: 'Order a larger PSU (budget → 150 W)' },
    { v: 'lower-ap', label: 'Reduce the AP transmit power' },
    { v: 'nothing', label: 'Leave the switch as configured' },
  ],
  ws12Fix: [
    { v: 'replace-patch', label: 'Replace the faulty patch cord (factory straight-through)' },
    { v: 'enable-mdix', label: 'Enable auto-MDIX on the port' },
    { v: 'recrimp', label: 'Re-crimp the same cord' },
    { v: 'new-nic', label: 'Replace the PC network card' },
  ],
  sfpWhy: [
    { v: 'mmf-850', label: 'It is an SX pair — 1000Base-SX sends 850 nm light over multimode fiber (OM3/OM4)' },
    { v: 'smf-1310', label: 'It is an LX10 pair — 1000Base-LX10 sends 1310 nm light over single-mode fiber (OS2)' },
    { v: 'speed-only', label: 'Any pair works as long as both ends agree on the data rate' },
    { v: 'connector', label: 'It works because both ends happen to use LC connectors' },
  ],
  verdict: [
    { v: 'pass', label: 'PASS — within budget' },
    { v: 'fail', label: 'FAIL — over budget' },
  ],
};

// Answer fields per objective id (which controls each objective card shows)
// Ported from the AnswerFields switch in ObjectivesDock.tsx.
const ANSWER_FIELDS = {
  M3: [{ type: 'diag', k: 'ws07', placeholder: 'name the termination fault…', opts: 'fault' }],
  M4: [{ type: 'diag', k: 'ws12', placeholder: 'name the fault…', opts: 'fault' }],
  M5: [{ type: 'diag', k: 'cr2', placeholder: 'signal-meter verdict…', opts: 'cr2' }],
  M6: [
    { type: 'note', text: 'Mechanisms degrading CR-2 (select all that apply):' },
    { type: 'multi', k: 'cr2-mech', opts: [
      { v: 'emi', label: 'EMI / RFI induction' },
      { v: 'attenuation', label: 'Attenuation (over-length)' },
      { v: 'crosstalk', label: 'Crosstalk from adjacent pairs' },
      { v: 'bad-sfp', label: 'Faulty transceiver' },
    ] },
    { type: 'note', text: 'Which medium is immune to EMI?' },
    { type: 'diag', k: 'fiber-emi', placeholder: 'choose the medium…', opts: 'fiberEmi' },
  ],
  M7: [
    { type: 'match', k: 'st-p21', label: 'P21', opts: 'status' },
    { type: 'match', k: 'st-p9', label: 'P9', opts: 'status' },
    { type: 'match', k: 'st-a3', label: 'A3', opts: 'status' },
    { type: 'match', k: 'st-p16', label: 'P16', opts: 'status' },
  ],
  M8: [
    { type: 'note', text: 'Counters climbing on P5 (select all that apply):' },
    { type: 'multi', k: 'p5-counters', opts: [
      { v: 'crc', label: 'CRC errors' },
      { v: 'input', label: 'Input errors' },
      { v: 'runts', label: 'Runts' },
      { v: 'giants', label: 'Giants' },
      { v: 'drops', label: 'Drops' },
      { v: 'collisions', label: 'Collisions' },
    ] },
  ],
  M9: [
    { type: 'match', k: 'sig-crc', label: 'CRC →', opts: 'sig' },
    { type: 'match', k: 'sig-runts', label: 'Runts →', opts: 'sig' },
    { type: 'match', k: 'sig-giants', label: 'Giants →', opts: 'sig' },
    { type: 'match', k: 'sig-drops', label: 'Drops →', opts: 'sig' },
  ],
  M10: [
    { type: 'num', k: 'poe-exceed', label: 'Over budget by', unit: 'W', placeholder: '0.00' },
    { type: 'note', text: 'Cheapest same-day fix:' },
    { type: 'diag', k: 'poe-fix', placeholder: 'choose the resolution…', opts: 'poeFix' },
  ],
  H1: [
    { type: 'note', text: 'Diagnosis from the tester evidence:' },
    { type: 'diag', k: 'ws12', placeholder: 'name the fault…', opts: 'fault' },
    { type: 'note', text: 'Chosen remediation:' },
    { type: 'diag', k: 'ws12-fix', placeholder: 'choose the fix…', opts: 'ws12Fix' },
  ],
  H2: [{ type: 'num', k: 'poe-exceed', label: 'Over budget by (2 decimals)', unit: 'W', placeholder: '0.00' }],
  H3: [
    { type: 'note', text: 'Why does the working pair work?' },
    { type: 'diag', k: 'sfp-why', placeholder: 'justify the optics…', opts: 'sfpWhy' },
  ],
  H4: [
    { type: 'note', text: 'Real mechanisms (select all):' },
    { type: 'multi', k: 'cr2-root', opts: [
      { v: 'emi', label: 'EMI / RFI induction' },
      { v: 'attenuation', label: 'Attenuation (over-length)' },
      { v: 'crosstalk', label: 'Crosstalk from adjacent pairs' },
      { v: 'bad-sfp', label: 'Faulty transceiver' },
    ] },
    { type: 'note', text: 'Which theory do you REJECT?' },
    { type: 'diag', k: 'cr2-decoy', placeholder: 'reject one theory…', opts: [
      { v: 'duplex', label: 'Duplex mismatch (submitter\'s theory)' },
      { v: 'emi', label: 'EMI from the conduit' },
      { v: 'overlength', label: 'Over-length channel' },
    ] },
  ],
  H6: [
    { type: 'note', text: 'LIB-2 copper verdict:' },
    { type: 'diag', k: 'lib2-verdict', placeholder: 'pass or fail…', opts: 'verdict' },
    { type: 'num', k: 'lib2-db', label: 'LIB-2 excess over limit', unit: 'dB', placeholder: '0.0' },
    { type: 'num', k: 'a2-db', label: 'A2 shortfall below floor', unit: 'dB', placeholder: '0.0' },
  ],
};
