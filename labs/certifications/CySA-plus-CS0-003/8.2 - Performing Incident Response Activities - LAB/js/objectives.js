// ─── CyberLab · js/objectives.js ──────────────────────────────────────────
// CHECK RESULTS validation engine + progression + scoring — a faithful port
// of src/lib/lab/engine.ts. Every validator keeps the EXACT pass condition
// and the EXACT feedback copy of the original (teaching quality is content).
//
// Structure:
//   · parseDuration        — tolerant metric input parsing (7h05m / 7:05 / 425m)
//   · validateObjective    — the 21 machine-checkable validators (OBJ-M1..M12, OBJ-H1..H9)
//   · gates / progression  — phase locks (Medium lifecycle order), free-roam (Hard)
//   · scoring              — star rating + pillar progress for the completion modal

window.LAB = window.LAB || {};
(function (LAB) {
  'use strict';

  var STATION_ORDER = ['identify', 'analyze', 'contain', 'eradicate', 'recover', 'learn', 'aar'];
  var PHASE_ORDER_IDS = ['identify', 'analyze', 'contain', 'eradicate', 'recover', 'learn'];

  // Derived correct-answer sets (same computations as engine.ts imports)
  var ERADICATION_CORRECT = LAB.ERADICATION_POOL.filter(function (a) { return a.correct; }).map(function (a) { return a.id; });
  var ERADICATION_RUNBOOK_ORDER = ERADICATION_CORRECT.slice().sort(function (a, b) {
    return poolOrder(a) - poolOrder(b);
  });
  function poolOrder(id) {
    for (var i = 0; i < LAB.ERADICATION_POOL.length; i++) if (LAB.ERADICATION_POOL[i].id === id) return LAB.ERADICATION_POOL[i].order;
    return 99;
  }
  var CORRECTIVES_CORRECT = LAB.CORRECTIVES.filter(function (c) { return c.correct; }).map(function (c) { return c.id; });
  var PLAN_UPDATES_CORRECT = LAB.PLAN_UPDATES.filter(function (c) { return c.correct; }).map(function (c) { return c.id; });
  var RECOVERY_CHECKS_CORRECT = LAB.RECOVERY_CHECKS.filter(function (c) { return c.correct; }).map(function (c) { return c.id; });

  // ── metrics parsing (tolerant formats, exact values) ─────────────────────
  function parseDuration(s) {
    var t = (s || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!t) return null;
    var m;
    if ((m = t.match(/^(\d+)h(\d{1,2})m?$/))) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    if ((m = t.match(/^(\d{1,2}):(\d{2})$/))) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    if ((m = t.match(/^(\d+)h$/))) return parseInt(m[1], 10) * 60;
    if ((m = t.match(/^(\d+)m(in)?s?$/))) return parseInt(m[1], 10);
    if ((m = t.match(/^(\d+)$/))) return parseInt(m[1], 10);
    return null;
  }

  // ── helpers ───────────────────────────────────────────────────────────────
  function sameSet(a, b) {
    return a.length === b.length && a.every(function (x) { return b.indexOf(x) !== -1; });
  }
  /** Order-sensitive sequence equality — REQUIRED where the arrangement itself
   *  is the skill (lifecycle order, attack chain, runbook). */
  function sameSeq(a, b) {
    return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
  }
  function inList(list, x) { return list.indexOf(x) !== -1; }

  // ── validators ────────────────────────────────────────────────────────────
  function validateObjective(id, s) {
    switch (id) {
      // ── MEDIUM ──
      case 'OBJ-M1': {
        var okM1 = sameSeq(s.phaseOrder, PHASE_ORDER_IDS);
        return {
          pass: okM1,
          feedback: okM1
            ? 'Lifecycle locked in. This order is doctrine: every CompTIA IR question assumes it. Notice how the deck itself refuses to let you break it in Medium mode.'
            : 'Not quite the lifecycle order. Think operationally: you cannot clean (eradicate) what you have not stopped (contained), and learning closes the loop after recovery. Use the warm-up chips to rebuild the sequence.',
        };
      }
      case 'OBJ-M2': {
        var okM2 = sameSet(s.evidenceFlagged.slice().sort(), LAB.CONSTITUENTS_M.slice().sort());
        if (!okM2) {
          var missed = LAB.CONSTITUENTS_M.filter(function (x) { return !inList(s.evidenceFlagged, x); });
          var extra = s.evidenceFlagged.filter(function (x) { return !inList(LAB.CONSTITUENTS_M, x); });
          return {
            pass: false,
            feedback: 'Triage review: ' + (missed.length ? 'you missed ' + missed.join(', ') + ' — check events that share the same host/account/C2 IP story. ' : '') + (extra.length ? extra.join(', ') + ' are routine operations (WSUS, backups, self-service resets), not attacker behavior — flagging them inflates the incident and misdirects the response.' : '') + 'Defenders triage by correlation: one incident = one coherent chain of hosts, accounts and indicators.',
          };
        }
        return {
          pass: true,
          feedback:
            'Clean triage: 11 correlated events, zero noise. Notice the story arc — delivery (E-03), execution (E-04), C2 (E-06), persistence (E-07), lateral movement (E-08), impact (E-10). Now DECLARE it: an undeclared incident has no commander, no clock, and no bridge.',
        };
      }
      case 'OBJ-M3':
        return s.severity === 'SEV-2'
          ? {
              pass: true,
              feedback:
                'SEV-2 is right: confirmed multi-asset compromise with an active threat, but impact scoped to one department. SEV-1 is for organization-wide outage — declaring it would hijack every team in the company for an incident containment can hold.',
            }
          : {
              pass: false,
              feedback:
                'Re-read the criteria: is the whole organization down (SEV-1)? One workstation with malware removed (SEV-3)? Confirmed compromise on multiple assets with an ACTIVE threat and department-level business impact is SEV-2 — it demands the full IR process without declaring company-wide catastrophe.',
            };
      case 'OBJ-M4': {
        var expectedM4 = ['CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CH6', 'CH7', 'CH8'];
        var okM4 = sameSeq(s.chainOrder, expectedM4);
        if (okM4)
          return {
            pass: true,
            feedback:
              'Chain reconstructed. Each stage maps to ATT&CK: T1566.001→T1204.002→T1059.001→T1071.001→T1547.001→T1078/T1021.001→T1003.001→T1486/T1490. This is the skeleton of your incident report — and the map containment used to cut the attacker off.',
          };
        var wrong = s.chainOrder.filter(function (c, i) { return expectedM4[i] !== c; });
        return {
          pass: false,
          feedback: 'Chain order off at position ' + (wrong.length ? s.chainOrder.indexOf(wrong[0]) + 1 : '?') + ' onward. Operational logic: execution → C2 → persistence → movement with stolen credentials → credential theft → impact. Rebuild it as the attacker experienced it, not as the logs happened to arrive.',
        };
      }
      case 'OBJ-M11':
        return s.earliest === 'ED-GW' && s.earliestSource === 'SRC-GW'
          ? {
              pass: true,
              feedback:
                '01:57 at the mail gateway. The org already owned the telemetry — the control was switched off (a budget decision, March). "Earliest detectable point" is how after-action reviews turn one incident into earlier detection of the next one.',
            }
          : {
              pass: false,
              feedback:
                'Check E-03 once more: what arrived at 01:57, and what was DISABLED in the attachment policy? The earliest point assumes controls configured correctly — endpoint EDR at 01:58 was the earliest with today\'s (broken) config, but the gateway had the answer first. Also pick the matching data source.',
            };
      case 'OBJ-M5':
        return s.firstAction === 'F-ISO'
          ? {
              pass: true,
              feedback:
                'Isolate FIN-WS-04 first: it is the active C2 source, the action is reversible, and it preserves evidence. Wiping would have destroyed the root-cause record; VPN shutdown would punish 300 uninvolved staff. Containment trade-offs are always: stop the threat × preserve evidence × minimize collateral.',
            }
          : {
              pass: false,
              feedback:
                'First action must stop ACTIVE attacker access without destroying anything. Re-check: where is the attacker operating from right now (E-06 beacons), and which option is reversible and evidence-preserving?',
            };
      case 'OBJ-M6': {
        var onWrongM6 = LAB.CONTAIN_REQUIRED_OFF.filter(function (c) { return s.controls[c]; });
        var missingM6 = LAB.CONTAIN_REQUIRED_ON_M.filter(function (c) { return !s.controls[c]; });
        if (!missingM6.length && !onWrongM6.length)
          return {
            pass: true,
            feedback:
              'Surgical containment: both compromised assets isolated, C2 blocked, abused accounts dead, delivery vector purged — and the organization still standing. This is the "minimum effective containment" examiners want to see.',
          };
        return {
          pass: false,
          feedback: (missingM6.length ? 'Missing: ' + missingM6.join(', ') + '. ' : '') + (onWrongM6.length ? 'Over-containment / premature: ' + onWrongM6.join(', ') + ' — ' + (inList(onWrongM6, 'C-ISO-DC') ? 'DC-01 isolation fails authentication for 2,400 staff with NO confirmed DC compromise; ' : '') + (inList(onWrongM6, 'C-VPN') ? 'no evidence the VPN path was used; ' : '') + (inList(onWrongM6, 'C-WIPE') ? 'wiping during containment destroys volatile evidence — that is an eradication-phase action after capture; ' : '') : '') + 'Every control is a trade-off: stop THIS attacker with the smallest business cost.',
        };
      }
      case 'OBJ-M7': {
        var okM7 = sameSet(s.eradicationSelected.slice().sort(), ERADICATION_CORRECT.slice().sort());
        return okM7
          ? {
              pass: true,
              feedback:
                'Full eradication set: artifacts + persistence removed, credentials invalidated, host rebuilt, vulnerability patched, signatures pushed, estate swept. Restore-from-backup belongs to the NEXT phase — eradicating "in parallel" with restoring is how latent malware survives a restore.',
            }
          : {
              pass: false,
              feedback: (ERADICATION_CORRECT.filter(function (c) { return !inList(s.eradicationSelected, c); }).length ? 'Missing: ' + ERADICATION_CORRECT.filter(function (c) { return !inList(s.eradicationSelected, c); }).join(', ') + '. ' : '') + (s.eradicationSelected.filter(function (c) { return !inList(ERADICATION_CORRECT, c); }).length ? 'Remove: ' + s.eradicationSelected.filter(function (c) { return !inList(ERADICATION_CORRECT, c); }).join(', ') + ' — ' + (inList(s.eradicationSelected, 'EA-RESTORE') ? 'restore is recovery, and doing it before eradication is verified risks resurrecting the incident. ' : '') + (inList(s.eradicationSelected, 'EA-RESETALL') ? 'blanket-resetting 2,400 accounts is disruption without evidence; reset the accounts the attacker actually touched. ' : '') : ''),
            };
      }
      case 'OBJ-M8': {
        var checksOkM8 = sameSet(s.recoveryChecks.slice().sort(), RECOVERY_CHECKS_CORRECT.slice().sort());
        var okM8 = s.recoveryStrategy === 'R-BKP' && checksOkM8 && s.monitorEnhanced;
        return okM8
          ? {
              pass: true,
              feedback:
                'Textbook recovery: known-good backup → validated data → healthy defenses → monitoring still hot. The 30-day watch matters: C2 infrastructure often gets re-used, and round two loves a recovered host that nobody watches.',
            }
          : {
              pass: false,
              feedback: (s.recoveryStrategy !== 'R-BKP' ? 'Strategy: use the VERIFIED 02:00 backup — decryption gambles and ransom payments are not recovery plans. ' : '') + (!checksOkM8 ? 'Validation: scan restored data, verify files open, confirm EDR healthy, confirm backups resumed — and never disable notifications during recovery. ' : '') + (!s.monitorEnhanced ? 'Enhanced monitoring must be ON for the watch window. ' : ''),
            };
      }
      case 'OBJ-M9':
        return s.rootCause === 'RCA-SAND'
          ? {
              pass: true,
              feedback:
                'Root cause found: a budget decision (sandboxing off) + no training backstop let the whole chain start. Fixing "users click" fixes nothing; fixing the gateway control and the human backstop prevents recurrence.',
            }
          : {
              pass: false,
              feedback:
                'Go upstream: the click, the encryption and the stolen account are events. Ask "what systemic condition made this possible?" — check E-03\'s policy note and the March change.',
            };
      case 'OBJ-M10': {
        var okM10 = sameSet(s.corrective.slice().sort(), CORRECTIVES_CORRECT.slice().sort());
        return okM10
          ? {
              pass: true,
              feedback:
                'Corrective actions that bite: two technical controls (gateway sandboxing, MFA), one human control (training), two policy/tooling controls (EDR auto-isolate + escalation, service-account lock-down). Each is owned, verifiable, and maps to a root cause or contributing factor — that is the exam answer and the real answer.',
            }
          : {
              pass: false,
              feedback: (CORRECTIVES_CORRECT.filter(function (c) { return !inList(s.corrective, c); }).length ? 'Missing: ' + CORRECTIVES_CORRECT.filter(function (c) { return !inList(s.corrective, c); }).join(', ') + '. ' : '') + (s.corrective.filter(function (c) { return !inList(CORRECTIVES_CORRECT, c); }).length ? 'Cut: ' + s.corrective.filter(function (c) { return !inList(CORRECTIVES_CORRECT, c); }).join(', ') + ' — memos without behavior change, hardware that never sees the email path, blame, and insurance are theater, not corrective action.' : ''),
            };
      }
      case 'OBJ-M12': {
        var mttdM12 = parseDuration(s.mttd);
        var mttrM12 = parseDuration(s.mttr);
        var okM12 = mttdM12 === 425 && mttrM12 === 497 && s.exercise === 'EX-SIM';
        return okM12
          ? {
              pass: true,
              feedback:
                'MTTD 7h05m · MTTR 8h17m. The MTTD is the scandal: a correct HIGH alert sat 5.5 hours. And that is exactly why the exercise choice matters — only a hands-on simulation rehearses 03:00 alert triage and restore drills.',
            }
          : {
              pass: false,
              feedback: 'Metrics: MTTD = first malicious event (01:58) → analyst detection (09:03) = 7h05m; MTTR = detection (09:03) → service restored (17:20) = 8h17m. Accept formats like 7h05m, 7:05 or 425m. ' + (s.exercise !== 'EX-SIM' ? 'For the exercise: the failures were EXECUTION failures (untriaged alert, first-ever restore) — discussions do not rehearse hands.' : ''),
            };
      }
      // ── HARD ──
      case 'OBJ-H1': {
        var items = LAB.HARD_EVIDENCE;
        var untriaged = items.filter(function (e) { return !s.triage[e.id]; });
        var wrongH1 = items.filter(function (e) {
          return s.triage[e.id] && ((e.kind === 'constituent' && s.triage[e.id] !== 'incident') || (e.kind !== 'constituent' && s.triage[e.id] !== 'not'));
        });
        if (!untriaged.length && !wrongH1.length)
          return {
            pass: true,
            feedback:
              'Perfect 17-event triage, including both herrings and the Sunday wave. The HR-WS-11 beacons belong: same C2 IP (203.0.113.47), same delivery wave — correlation across TIME is what separates an incident record from a morning report.',
          };
        var wrongHerrings = wrongH1.filter(function (e) { return e.kind === 'herring'; });
        return {
          pass: false,
          feedback: (untriaged.length ? 'Untriaged: ' + untriaged.map(function (e) { return e.id; }).join(', ') + '. ' : '') + (wrongH1.length ? 'Miscalled: ' + wrongH1.map(function (e) { return e.id; }).join(', ') + '. ' : '') + (wrongHerrings.length ? 'Red herrings are DESIGNED to be rejected: check whether their indicators overlap the incident chain (hosts, C2 IP, timing). ' : '') + 'Every miscall corrupts the record downstream — scope, containment and the report all inherit it.',
        };
      }
      case 'OBJ-H2': {
        var expectedH2 = ['CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CH6', 'CH7', 'CH8'];
        var extras = s.chainOrder.filter(function (c) { return c === 'CHX1' || c === 'CHX2'; });
        var okH2 = sameSeq(s.chainOrder, expectedH2);
        if (okH2)
          return {
            pass: true,
            feedback:
              'Eight steps, eight exhibits, zero speculation. Legal and the insurer will read this chain — "no phantom steps" is the discipline that makes IR findings defensible.',
          };
        return {
          pass: false,
          feedback: (extras.length ? 'Phantom steps detected: ' + extras.join(', ') + ' — no exhibit supports them; IR reports evidence, not plausibility. ' : '') + 'Order logic: execution → C2 → persistence → lateral movement → credential theft → impact. Check positions against the exhibits.',
        };
      }
      case 'OBJ-H3': {
        var missingH3 = LAB.CONTAIN_REQUIRED_ON_H.filter(function (c) { return !s.controls[c]; });
        var onWrongH3 = LAB.CONTAIN_REQUIRED_OFF.filter(function (c) { return s.controls[c]; });
        var dc = s.dcDecision !== 'DC-MON';
        if (!missingH3.length && !onWrongH3.length && !dc)
          return {
            pass: true,
            feedback:
              'Full containment plan executed: both compromised assets cut off, C2 dead, accounts burned, mail vector purged, MEMORY CAPTURED before anything destructive, and DC-01 watched instead of isolated. This is the containment judgment call, exam-grade.',
          };
        return {
          pass: false,
          feedback: (missingH3.length ? 'Enable: ' + missingH3.join(', ') + (inList(missingH3, 'C-MEM-FIN') ? ' (volatile evidence dies at reimage — capture it in containment)' : '') + '. ' : '') + (onWrongH3.length ? 'Disable: ' + onWrongH3.join(', ') + ' — over-containment/premature destruction. ' : '') + (dc ? 'DC-01 decision: no confirmed compromise → monitor + harden, do NOT isolate the domain controller; doing nothing leaves the identity plane open. ' : ''),
        };
      }
      case 'OBJ-H4': {
        if (!s.controls['C-MEM-FIN'] && inList(s.eradicationOrder, 'EA-WIPE'))
          return {
            pass: false,
            feedback:
              'EVIDENCE GATE: you are about to reimage FIN-WS-04 with no memory capture from containment. Volatile evidence (injected code, keys, live connections) does not survive a wipe. Go back to CONTAIN, enable C-MEM-FIN, then rebuild the sequence.',
          };
        var okH4 = sameSeq(s.eradicationOrder, ERADICATION_RUNBOOK_ORDER);
        return okH4
          ? {
              pass: true,
              feedback:
                'Runbook-perfect sequencing: evidence removed artifacts first, scan confirmed cleanliness, credentials invalidated (attacker locked out even from clean systems), THEN reimage, patch, push signatures, and sweep last as the proof of cleanliness. Near-miss orders (e.g., sweeping before signatures exist, resetting after reimage while stolen credentials stay live) are exactly what this discipline prevents.',
            }
          : {
              pass: false,
              feedback: 'Sequence mismatch at: ' + (s.eradicationOrder.filter(function (c, i) { return ERADICATION_RUNBOOK_ORDER[i] !== c; }).join(', ') || 'order incomplete') + '. Reference: REMOVE → SCAN → RESET → WIPE → PATCH → SIG → SWEEP. Rationale: persistence must die before scans trust results; credentials must be invalidated while malware could still re-steal them; the sweep depends on pushed signatures.',
            };
      }
      case 'OBJ-H5': {
        var checksOkH5 = sameSet(s.recoveryChecks.slice().sort(), RECOVERY_CHECKS_CORRECT.slice().sort());
        var okH5 = s.recoveryStrategy === 'R-BKP' && s.backupReconcile === 'BR-DIFF' && checksOkH5 && s.monitorEnhanced;
        return okH5
          ? {
              pass: true,
              feedback:
                'Recovery under ambiguity, handled: fresh backup restored, the 2-file delta reconciled against Friday\'s full + the audit log, all validation gates green, watch window armed. "Read the footnote" is a real IR skill.',
            }
          : {
              pass: false,
              feedback: (s.recoveryStrategy !== 'R-BKP' ? 'Strategy: the 02:00 backup (R-BKP). ' : '') + (s.backupReconcile !== 'BR-DIFF' ? 'Reconciliation: the job log skipped 2 locked files — BR-DIFF restores 02:00 and reconciles the delta from Friday + audit log; older backups discard days of data. ' : '') + (!checksOkH5 ? 'Run ALL four validation tests (and never dim the sensors). ' : '') + (!s.monitorEnhanced ? 'Enhanced monitoring ON. ' : ''),
            };
      }
      case 'OBJ-H6': {
        var wrongH6 = LAB.STAKEHOLDERS.filter(function (st) { return (s.notifMap[st.id] || '') !== st.answer; });
        if (!wrongH6.length)
          return {
            pass: true,
            feedback:
              'Notification matrix correct: ownership & privilege at declaration (CISO, Legal, Insurer), the contractual clock honored with facts-as-known (Granite), staff briefed once facts are stable (closure), and media never contacted by IR. Notification timing breaches are how technical incidents become legal ones.',
          };
        return {
          pass: false,
          feedback: 'Review: ' + wrongH6.map(function (w) { return w.label + ' → ' + w.why; }).join(' | ') + ' The 72-hour clock is contractual and starts at CONFIRMED incident — attribution completeness is not a prerequisite for notice.',
        };
      }
      case 'OBJ-H7': {
        var wrongH7 = LAB.FINDINGS.filter(function (f) { return (s.findingsClass[f.id] || '') !== f.answer; });
        if (!wrongH7.length)
          return {
            pass: true,
            feedback:
              'Taxonomy clean: one root cause (the disabled control), three contributing factors (identity, patching, the click), one symptom (the encryption), one unrelated item correctly kept out of the report. This classification is what makes corrective actions land on causes instead of victims.',
          };
        return {
          pass: false,
          feedback: 'Recheck: ' + wrongH7.map(function (w) { return w.id; }).join(', ') + '. Model: root cause = the systemic gap that, fixed, prevents recurrence; contributing = enabled or amplified it; symptom = observable impact; unrelated = not part of this chain at all.',
        };
      }
      case 'OBJ-H8': {
        var mttdH8 = parseDuration(s.mttd);
        var mttcH8 = parseDuration(s.mttc);
        var mttrH8 = parseDuration(s.mttr);
        var okH8 = mttdH8 === 425 && mttcH8 === 131 && mttrH8 === 497 && s.maturityMetric === 'MM-MTTD';
        return okH8
          ? {
              pass: true,
              feedback:
                'MTTD 7h05m · MTTC 2h11m · MTTR 8h17m — and the diagnosis is right: once humans engaged, containment was fast (2h11m). The pipeline failure was escalation of a 03:31 HIGH alert, and that is a detection-gap metric: MTTD.',
            }
          : {
              pass: false,
              feedback: 'Timers: MTTD 01:58→09:03 = 7h05m (425m) · MTTC 09:41→11:52 = 2h11m (131m) · MTTR 09:03→17:20 = 8h17m (497m). Formats: 7h05m / 7:05 / 425m. ' + (s.maturityMetric !== 'MM-MTTD' ? 'Which metric isolates "correct alert existed, nobody looked for 5.5 hours"? That is a time-to-DETECT question.' : ''),
            };
      }
      case 'OBJ-H9': {
        var okH9 = s.exercise === 'EX-SIM' && sameSet(s.planUpdates.slice().sort(), PLAN_UPDATES_CORRECT.slice().sort());
        return okH9
          ? {
              pass: true,
              feedback:
                'Loop closed: a simulation/functional exercise because BOTH failures were execution failures (03:00 alert triage, restore runbook), and three plan updates targeting exactly what the incident stressed. That is "regularly tested and practiced" operationalized.',
            }
          : {
              pass: false,
              feedback: (s.exercise !== 'EX-SIM' ? 'Exercise: the failures were hands-on execution — choose the format where people actually triage alerts and run restores. ' : '') + (!sameSet(s.planUpdates.slice().sort(), PLAN_UPDATES_CORRECT.slice().sort()) ? 'Plan updates: target the artifacts the incident stressed — containment trigger, recovery reconciliation, comms clock. Rewriting everything or adding praise are not updates.' : ''),
            };
      }
      default:
        return { pass: false, feedback: 'Unknown objective.' };
    }
  }

  // ── gates / progression ───────────────────────────────────────────────────
  function objectivesForStation(station, mode) {
    var list = mode === 'medium' ? LAB.OBJECTIVES_M : LAB.OBJECTIVES_H;
    return station === 'aar' ? [] : list.filter(function (o) { return o.phase === station; });
  }

  function phaseGateSatisfied(station, s) {
    if (s.mode === 'hard') return true;
    var objs = objectivesForStation(station, 'medium');
    var allPassed = objs.length > 0 && objs.every(function (o) { return s.objectives[o.id] && s.objectives[o.id].status === 'passed'; });
    if (station === 'identify') return allPassed && s.declared;
    return allPassed;
  }

  function nextStation(station) {
    var i = STATION_ORDER.indexOf(station);
    return i >= 0 && i < STATION_ORDER.length - 1 ? STATION_ORDER[i + 1] : null;
  }

  function allObjectivesPassed(s) {
    var list = s.mode === 'medium' ? LAB.OBJECTIVES_M : LAB.OBJECTIVES_H;
    return list.every(function (o) { return s.objectives[o.id] && s.objectives[o.id].status === 'passed'; });
  }

  // ── scoring ───────────────────────────────────────────────────────────────
  function computeStars(s) {
    var list = s.mode === 'medium' ? LAB.OBJECTIVES_M : LAB.OBJECTIVES_H;
    var hints = 0;
    var fails = 0;
    for (var i = 0; i < list.length; i++) {
      var p = s.objectives[list[i].id];
      if (p) {
        hints += p.hintsUsed;
        fails += p.fails;
      }
    }
    var raw = 5 - hints * 0.5 - fails * 0.25;
    // No half-star rounding: every fail/hint must visibly cost (5 - 0.25 → 4.8, not a rounded 5.0)
    return Math.max(1, Math.min(5, raw));
  }

  function pillarProgress(s) {
    var list = s.mode === 'medium' ? LAB.OBJECTIVES_M : LAB.OBJECTIVES_H;
    var by = { P1: [0, 0], P2: [0, 0], P3: [0, 0], P4: [0, 0] };
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      by[o.pillar][1] += 1;
      if (s.objectives[o.id] && s.objectives[o.id].status === 'passed') by[o.pillar][0] += 1;
    }
    return by;
  }

  LAB.STATION_ORDER = STATION_ORDER;
  LAB.PHASE_ORDER_IDS = PHASE_ORDER_IDS;
  LAB.ERADICATION_RUNBOOK_ORDER = ERADICATION_RUNBOOK_ORDER;
  LAB.parseDuration = parseDuration;
  LAB.validateObjective = validateObjective;
  LAB.objectivesForStation = objectivesForStation;
  LAB.phaseGateSatisfied = phaseGateSatisfied;
  LAB.nextStation = nextStation;
  LAB.allObjectivesPassed = allObjectivesPassed;
  LAB.computeStars = computeStars;
  LAB.pillarProgress = pillarProgress;
})(window.LAB);
