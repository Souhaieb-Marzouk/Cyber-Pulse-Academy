/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab static port — OBJECTIVES ENGINE (js/objectives.js)
   1:1 recreation of the 21 validators, scoring and stars from
   src/lib/irlab/engine.ts. Golden answers and feedback strings are
   byte-identical; failure feedback stays Socratic (audit QA-2 — never leaks
   answers).
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const LAB = global.LAB;

  /* ───────────────────────────── helpers ────────────────────────────────── */

  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    const sa = a.slice().sort();
    const sb = b.slice().sort();
    for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
    return true;
  }

  function sameSeq(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  /* phase-activity map used by M2 (kept local to avoid import cycle noise) */
  const PHASE_ACTIVITY = {
    prepare: 'Establish playbooks, tooling and training before anything happens',
    detect: 'Validate the alert and declare an incident',
    analyze: 'Reconstruct the attack chain and determine scope and root cause',
    contain: 'Isolate affected systems to stop the spread',
    eradicate: 'Remove persistence and attacker access',
    recover: 'Restore from verified clean backups and monitor',
    rehearse: 'Run tabletop exercises and update the playbook',
  };

  /* artifact sets for H1 */
  const ARTIFACT_CORE_IDS = ['A-PHISH', 'A-VPN', 'A-DUMP', 'A-TASK', 'A-SMB', 'A-ACCT', 'A-CLR', 'A-ENC'];
  const ARTIFACT_NOISE_IDS = ['A-MKTG', 'A-SCAN', 'A-PIP', 'A-PRT'];

  /* ───────────────────────── validators (F2) ────────────────────────────── */

  const validators = {

    /* ── MEDIUM ── */

    M1: function (env) {
      const pass = sameSeq(env.phaseOrder, LAB.PHASE_ORDER_CANONICAL);
      return {
        pass: pass,
        summary: pass
          ? 'Correct — Preparation → Detection → Analysis → Containment → Eradication → Recovery → Rehearsal. Notice the logic: build capability, notice, understand, stop, remove, restore, improve. CompTIA CS0-003 closes the loop with Rehearsal (tabletops, updated playbooks); NIST SP 800-61 groups the middle differently but teaches the same rhythm.'
          : 'Not yet. Anchor on what each step DOES: one step builds capability before anything happens; one validates and declares; one reconstructs; one stops the bleeding; one removes; one restores; one rehearses. Order the verbs and the order follows.',
      };
    },

    M2: function (env) {
      const pass = LAB.PHASE_ORDER_CANONICAL.every(function (p) {
        const target = PHASE_ACTIVITY[p];
        return env.phaseMatch[p] === target;
      });
      return {
        pass: pass,
        summary: pass
          ? 'Correct. On the exam, phase names are easy — the marks are in knowing WHICH ACTIVITIES belong to WHICH phase, especially the Containment/Eradication/Recovery split: limit damage, remove access, then restore business.'
          : 'Not yet. Containment limits damage but leaves footholds; Eradication removes them; Recovery brings systems back. Preparation builds BEFORE anything happens; Rehearsal bakes the lessons back in.',
      };
    },

    M5: function (env) {
      const gapsOk = sameSet(env.gapsSelected, LAB.GAP_CORRECT);
      const fpOk = env.fpSelected === LAB.FP_CORRECT;
      const pass = gapsOk && fpOk;
      return {
        pass: pass,
        summary: pass
          ? 'Correct — a detection is only as good as its data coverage. The VPN login and the rogue account were invisible because their data never reached the SIEM (no VPN log ingestion; 4720 not forwarded). And AL2 (the AV licensing alert) was the false positive: benign tool, wrong host, wrong morning. Data-source coverage (CS0-003 4.2) is where detection programs are won or lost.'
          : gapsOk
            ? 'Gaps are right, but re-examine the alert queue: which alert is actually a benign tool on an untouched host? True positives here match the kill chain; the false positive does not.'
            : fpOk
              ? 'False positive is right, but reconsider the gaps: the org DOES run NDR (it produced share-access evidence) and EDR IS on servers (it alerted on JH-01). Look for data that never reached the SIEM.'
              : 'Re-examine both parts. The gaps are about data that never reached the SIEM — not tools the org lacks (it HAS NDR and server EDR). The false positive is an alert that fired on something benign: check which queue item touched neither a compromised host nor the incident window.',
        detail: [
          gapsOk ? '\u2713 Gaps correct' : '\u2717 Gaps — one or both selections are off',
          fpOk ? '\u2713 False positive correct' : '\u2717 False positive — wrong alert picked',
        ],
      };
    },

    M6: function (env) {
      const s1 = env.ruleSlots[0];
      const s2 = env.ruleSlots[1];
      const s3 = env.ruleSlots[2];
      const s1ok = s1.f === 'event.type' && s1.o === 'is' && s1.v === 'vpn_login_success';
      const s2ok = s2.f === 'source.asn' && s2.o === 'is_not' && s2.v === 'corporate_asn_64500';
      const s3empty = s3.f === '—' && s3.o === '—' && s3.v === '—';
      const pass = s1ok && s2ok && s3empty;
      return {
        pass: pass,
        summary: pass
          ? 'Correct — and notice what you did NOT do: you did not pin the rule to the finance department. Over-tuned rules miss the next campaign (which may hit HR); under-tuned rules drown analysts. "VPN success from a non-corporate ASN" is specific to the behavior, not the victim.'
          : s1ok && s2ok
            ? 'Close — the two conditions are right, but slot 3 must stay EMPTY. Scoping to one department over-tunes the rule and blinds you to the same attack against any other user.'
            : 'Not yet. You are writing a rule for a BEHAVIOR, not a person: a VPN login that succeeded, from an origin that is not one of ours. Pick the field that records the event type, then the field that records where the login came from — "is" for the success, "is not" for our own ASN. Leave slot 3 for later; make the two conditions true first.',
        detail: [
          s1ok ? '\u2713 Condition 1' : '\u2717 Condition 1 — does not capture the successful VPN login',
          s2ok ? '\u2713 Condition 2' : '\u2717 Condition 2 — does not exclude our own origin',
          s3empty ? '\u2713 Slot 3 left empty' : '\u2717 Slot 3 should stay empty (over-tuning)',
        ],
      };
    },

    M3: function (env) {
      const pass = sameSeq(env.volOrder, LAB.VOL_CANONICAL);
      return {
        pass: pass,
        summary: pass
          ? 'Correct — that is the RFC 3227 order of volatility. RAM dies in seconds on power loss; the pagefile goes with it; temp/cache files churn; the disk image survives shutdown; off-box logs and tapes are the most durable. Collect in this order or lose the top of the pyramid forever.'
          : 'Not yet. Ask of each item: "how fast does this vanish if I do nothing?" Memory and swap die with power; temp files churn in minutes; the disk image survives shutdown; already-centralized logs and offsite tapes are the most stable things you have.',
      };
    },

    M4: function (env) {
      const approachOk = env.acqApproach === 'ACQ-LIVE';
      const holdOk = env.legalHold === true;
      const c = env.custody;
      const collectorOk = c.collector === 'you';
      const tagOk = c.tag === 'IR-2317-RAM-01';
      const integrityOk = c.integrity === 'HASH';
      const whyOk = c.why === 'WHY-IDENTICAL';
      const pass = approachOk && holdOk && collectorOk && tagOk && integrityOk && whyOk;
      return {
        pass: pass,
        summary: pass
          ? 'Correct — a defensible acquisition: live RAM first (keys and malware state exist only in memory), then a bit-level image taken through a write blocker; legal hold applied because insurers/counsel may need this; custody ledger records WHO (you, IR-77), the evidence tag, and the SHA-256 digest that proves the copy is bit-identical. That hash is what survives a challenge in court.'
          : 'Not yet — argue each decision from the state of the host: it is still RUNNING, so ask what exists only in memory and what a shutdown destroys. A defensible copy is bit-level and taken in a way that cannot change the source. The ledger must name the person who touched the evidence, the case- and item-scoped tag, and an integrity proof that can be re-checked after transfer — that proof is what lets anyone later verify the copy equals the original. And the hold: what do insurers and counsel need you NOT to destroy?',
        detail: [
          approachOk ? '\u2713 Acquisition approach' : '\u2717 Approach — not the defensible sequence for a live host',
          holdOk ? '\u2713 Legal hold applied' : '\u2717 Legal hold — revisit it against who may need this evidence later',
          collectorOk ? '\u2713 Collector' : '\u2717 Collector — pick the person actually hands-on-keyboard',
          tagOk ? '\u2713 Evidence tag' : '\u2717 Tag — use the case- and item-scoped tag from the briefing',
          integrityOk ? '\u2713 Integrity method' : '\u2717 Integrity — trusting the tool or renaming files is not a proof',
          whyOk ? '\u2713 Purpose of hashing' : '\u2717 Purpose — pick the reason tied to provable integrity',
        ],
      };
    },

    M7: function (env) {
      const pass = sameSeq(env.timeOrder, LAB.TIMELINE_MEDIUM_CANONICAL);
      return {
        pass: pass,
        summary: pass
          ? 'Correct — two sources lied by an hour (EDR agent on UTC\u22121) and you normalized before ordering. True chain: 09:47 phish → 10:04 VPN abuse → 10:22 LSASS dump → 10:26 persistence → 11:38 lateral movement → 02:13 detonation. Notice how the uncorrected stamps would have put the dump BEFORE the login — inverting cause and effect. Sync to NTP, note offsets, correlate in UTC.'
          : 'Not yet. Two of these sources lie about time — their stamps are raw local clocks running one hour behind UTC (the clock legend says which). Convert the affected stamps to true UTC FIRST, then order; the raw order is bait.',
      };
    },

    M8: function (env) {
      const pass = Object.keys(LAB.CHAIN_CORRECT).every(function (a) {
        return env.chain[a] === LAB.CHAIN_CORRECT[a];
      });
      return {
        pass: pass,
        summary: pass
          ? 'Correct — you just walked the ATT&CK chain: T1566.002 (Initial Access) → T1078 (Valid Accounts) → T1003.001 (Credential Access) → T1053.005 (Persistence) → T1021.002 (Lateral Movement) → T1486 (Impact). Reading evidence as techniques is how analysts turn a pile of logs into a story — and how detections get written for the NEXT campaign.'
          : 'Not yet. Map the BEHAVIOR each artifact proves, not its tool name: how did the attacker get in, whose credentials moved them, what was scraped from memory, what survives reboots, what moved between hosts, what caused the business impact? Two of the eight options describe ways in that never happened in this case — test every option against the evidence before committing.',
      };
    },

    M9: function (env) {
      const selOk = sameSet(env.containSel, LAB.CONTAIN_CORRECT);
      const tradeOk = env.tradeoff === 'T-PAY';
      const pass = selOk && tradeOk;
      return {
        pass: pass,
        summary: pass
          ? 'Correct — contain without destroying: EDR network isolation keeps hosts powered (RAM intact) while cutting C2 and lateral movement; disabling the two compromised identities closes re-authentication; blocking C2 blinds the operator; east–west SMB blocking slows spread. And the trade-off you MUST flag: FSV-01 runs payment processing — isolation takes it offline, so the business owner agrees to the timing.'
          : selOk
            ? 'Actions are right, but the trade-off matters: what business service dies when you isolate FSV-01? That is the call the business owner must be in on.'
            : 'Re-examine the four rejected actions against two tests: does the action actually stop the attacker from moving, and does it preserve the evidence and systems you still need? Anything that destroys memory, rewards crime, or surrenders hours fails one of the tests. Choose the set that passes both.',
        detail: [
          selOk ? '\u2713 Containment actions' : '\u2717 Containment actions — not the four that pass both tests',
          tradeOk ? '\u2713 Trade-off flagged' : '\u2717 Trade-off — name the business service that isolation takes down',
        ],
      };
    },

    M10: function (env) {
      const pass = sameSet(env.eradSel, LAB.ERAD_CORRECT);
      return {
        pass: pass,
        summary: pass
          ? 'Correct — eradication is completeness work: remove the scheduled task, delete the rogue admin, rotate EVERY credential the attacker could have seen (dana.w, svc_backup, anything exposed on JH-01), close the entry vector (purge + block the lookalike domain), and rebuild from known-good media. Anything less is how day-36 re-infections happen.'
          : 'Not yet — you need exactly five. Test each action with one question: does it REMOVE an attacker capability (persistence, an account, a credential, an entry vector) or REBUILD trust in a compromised system? Housekeeping — scanning for comfort, tidying artifacts, declaring victory — removes nothing.',
      };
    },

    M11: function (env) {
      const srcOk = env.restoreSrc === 'R-OFF';
      const stepsOk = sameSeq(env.recSteps, LAB.RECOVERY_STEPS_CANONICAL);
      const pass = srcOk && stepsOk;
      return {
        pass: pass,
        summary: pass
          ? 'Correct — trust is earned: the offline vault backup is the only source that was out of attacker reach AND has a recorded hash. Verify the hash, restore onto rebuilt (patched) systems, scan and functionally validate, return to production under enhanced monitoring, and keep watching for 14 days. The NAS snapshot and the local folder were inside attacker reach — treat as poisoned.'
          : srcOk
            ? 'Source is right. Now order the ladder by trust: prove the copy before you use it, rebuild the platform before you put data on it, validate before production — and keep watching after.'
            : 'Re-examine the sources with two questions: could the attacker reach this copy with the credentials they held? And can its integrity be proven from a record made before the incident? Convenience and recency are not trust properties.',
        detail: [
          srcOk ? '\u2713 Restore source' : '\u2717 Source — not the provably clean copy',
          stepsOk ? '\u2713 Recovery sequence' : '\u2717 Order — verification must precede restoration; validation must precede production',
        ],
      };
    },

    M12: function (env) {
      const pass = Object.keys(LAB.LESSON_CORRECT).every(function (rc) {
        return env.lessonMap[rc] === LAB.LESSON_CORRECT[rc];
      });
      return {
        pass: pass,
        summary: pass
          ? 'Correct — root cause to control, by mechanism: human susceptibility → M1017 User Training; single-factor VPN → M1032 Multi-factor Authentication; flat network → M1030 Network Segmentation; production-reachable backups → M1053 Data Backup. The decoys (M1049 antivirus — was already present and did not stop this; M1041 encryption at rest — does not block a live session) teach the key skill: match control to cause.'
          : 'Not yet. Match by mechanism: what weakness let each root cause happen? AV (M1049) was already installed and failed to stop a valid-account chain; encrypting data at rest (M1041) does nothing once an authorized session is running. Training, MFA, segmentation, and offline backups are the mechanism matches.',
      };
    },

    /* ── HARD ── */

    H1: function (env) {
      const kept = [];
      const discarded = [];
      for (const k in env.hardTriage) {
        if (env.hardTriage[k] === 'keep') kept.push(k);
        if (env.hardTriage[k] === 'discard') discarded.push(k);
      }
      const keepOk = sameSet(kept, ARTIFACT_CORE_IDS);
      const discardOk = sameSet(discarded, ARTIFACT_NOISE_IDS);
      const pass = keepOk && discardOk;
      return {
        pass: pass,
        summary: pass
          ? 'Clean triage. The eight keepers form the chain: phish → VPN abuse → LSASS dump → scheduled task → SMB movement → rogue account → log clearing → encryption burst. The four discards share a signature: no connection to any compromised host, identity, or timeframe (a marketing box with a licensing PUP and broken email images, a scheduled scanner, a build-VM gripe, a printer). Triage discipline = chain-first relevance.'
          : 'Not yet. Test each artifact against the case spine: does it touch a compromised host, a compromised identity, or the incident window? Artifacts whose only connection is coincidence — wrong host, wrong owner, scheduled by design — are noise, however real they look.',
        detail: [
          keepOk ? '\u2713 Kept set correct' : '\u2717 Kept set — not the eight chain artifacts',
          discardOk ? '\u2713 Discard set correct' : '\u2717 Discard set — not the four noise artifacts',
        ],
      };
    },

    H8: function (env) {
      const pass = sameSet(env.hardRetro, LAB.RETRO_CORRECT);
      return {
        pass: pass,
        summary: pass
          ? 'Correct — the four real gains: ingest VPN auth logs and alert on first-seen ASNs (D1), alert on 4720/4726 account changes on servers (D2), correlate mail+VPN+EDR into one timeline (D3), and alert on 1102 audit-log-clears (D4 — it fired at 02:05, eight minutes before impact). The rejects are the classic non-answers: more licenses, breaking the business to feel safe, and retention that nobody alerts on.'
          : 'Not yet — exactly four. A real improvement adds COVERAGE (data that was never collected) or CORRELATION (evidence that was never joined). An improvement that adds neither — more of what already failed, less access for everyone, or deeper archives nobody alerts on — is spending, not detection.',
      };
    },

    H2: function (env) {
      const orderOk = sameSeq(env.volOrder, LAB.VOL_CANONICAL);
      const firstOk = env.h2First === 'H2F-RAM';
      const shortcutOk = env.h2Shortcut === 'H2S-LUN';
      const c = env.custody;
      const custodyOk =
        c.collector === 'you' && c.tag === 'IR-2317-RAM-01' && c.integrity === 'HASH' && c.why === 'WHY-IDENTICAL';
      const pass = orderOk && firstOk && shortcutOk && custodyOk;
      return {
        pass: pass,
        summary: pass
          ? 'Defensible under pressure — exactly what an incident report needs. You kept the volatility order, named RAM as the first capture (ransomware state and any keys live only in memory on a running host), refused the un-write-blocked LUN clone (a mutating acquisition is indefensible regardless of the vendor\'s reputation), and completed the custody ledger with hash-verified integrity.'
          : 'Not yet — argue all four parts from first principles: (1) order the evidence by how fast each kind disappears; (2) on a live host, what exists only in memory? (3) a shortcut that mutates the source is indefensible no matter who offers it — which offer mutates? (4) the ledger needs the person, the tag, the integrity proof, and why that proof matters. Build each answer; do not guess.',
        detail: [
          orderOk ? '\u2713 Volatility order' : '\u2717 Volatility order — not fastest-vanishing first',
          firstOk ? '\u2713 First capture' : '\u2717 First capture — not the artifact that dies with power loss',
          shortcutOk ? '\u2713 Shortcut rejection' : '\u2717 Shortcut — you accepted the one that mutates the source',
          custodyOk ? '\u2713 Custody ledger' : '\u2717 Custody ledger — one or more fields are wrong',
        ],
      };
    },

    H3: function (env) {
      const orderOk = sameSeq(env.h3Order, LAB.TIMELINE_HARD_CANONICAL);
      const a = env.h3Answers;
      const patientOk = a.patient === 'WS-FIN-14';
      const vectorOk = a.vector === 'phish';
      const dwellOk = a.dwell === 'd2';
      const clearedOk = a.cleared === 'c1';
      const pass = orderOk && patientOk && vectorOk && dwellOk && clearedOk;
      return {
        pass: pass,
        summary: pass
          ? 'Full reconstruction accepted. Normalized chain: 09:47 phish → 10:04 VPN → 10:22 LSASS (EDR UTC\u22121 corrected) → 10:26 task → 11:38 SMB → 13:09 C2 (NDR +3 min corrected) → 02:05 log-clear → 02:13 encryption. Patient zero is WS-FIN-14 — Dana\'s workstation opened the door; everything after rode valid accounts. Dwell: 16h 26m (09:47 → 02:13). The cleared log: FSV-01\'s Security audit log at 02:05 — anti-forensics eight minutes before impact.'
          : 'Not yet. Work it in order: normalize every stamp to true UTC (two sources lie — see the clock legend), sequence all eight, then let the finished timeline answer the four questions. The patient zero is the host where the first malicious event lands; the vector is what the earliest record shows; dwell spans first access to detonation; and the 1102 record itself names what was cleared.',
        detail: [
          orderOk ? '\u2713 Sequence (8 events, offsets corrected)' : '\u2717 Sequence — normalize the two lying clocks, then order all 8',
          patientOk ? '\u2713 Patient zero' : '\u2717 Patient zero — the host where the phish landed',
          vectorOk ? '\u2713 Initial access vector' : '\u2717 Vector — what the mail gateway record shows',
          dwellOk ? '\u2713 Dwell time' : '\u2717 Dwell — recompute from first access to detonation',
          clearedOk ? '\u2713 Cleared log' : '\u2717 Cleared log — let the 1102 record name it',
        ],
      };
    },

    H4: function (env) {
      const seqOk = sameSeq(env.containSeq, LAB.CONTAIN_SEQ_CANONICAL);
      const rejOk = sameSet(env.containReject, LAB.CONTAIN_REJECTS.map(function (r) { return r.id; }));
      const pass = seqOk && rejOk;
      return {
        pass: pass,
        summary: pass
          ? 'Sequencing accepted — this is what containment looks like under a business constraint: zero-impact firewall block first, then the identity kill-switch, isolate the non-critical jump host immediately, honor the agreed 17:30 window for the payment host (no active encryption observed — the window exists for exactly this), and capture RAM/disk only AFTER isolation makes it safe. Your two rejections were the right near-misses: breaching the window without cause burns IR credibility; powering off burns the evidence.'
          : 'Not yet. Order by impact and by promise: what can you do that nobody will notice? What cuts the attacker\'s return path? Which host can be isolated without touching the batch? The payment host waits for the agreed window unless the situation changes — and volatile evidence is captured only once isolation has made it safe. Of the two proposals, one breaks a promise without cause and one destroys memory to look decisive; formally reject both.',
        detail: [
          seqOk ? '\u2713 Sequence' : '\u2717 Sequence — zero-impact actions first; evidence capture only after isolation',
          rejOk ? '\u2713 Near-misses rejected' : '\u2717 Rejections — both near-miss proposals must be formally rejected',
        ],
      };
    },

    H5: function (env) {
      const missedTargets = LAB.H5_MISSED
        .filter(function (m) { return m.id === 'H5-M1' || m.id === 'H5-M2'; })
        .map(function (m) { return m.id; });
      const missedOk = sameSet(env.h5Missed, missedTargets);
      const stepOk = env.h5Step === 'H5-S1';
      const pass = missedOk && stepOk;
      return {
        pass: pass,
        summary: pass
          ? 'Root-caused like an incident lead. The re-infection used svc_backup — an account that was NEVER reset and still authenticates everywhere — and "svc_patch", the rogue admin that survived eradication. The skipped step was rotation scope: eradication must reset every credential the attacker could have read (from LSASS dumps on JH-01) and sweep EVERY host for persistence, not just the two that visibly burned. (H5-M3/M4 were actually handled — JH-01 rebuilt, Dana\'s box reimaged.)'
          : 'Not yet. Follow the identity: which ACCOUNT created the new task on FSV-02, and was it ever rotated? Which rogue PRIVILEGE still exists? The rebuild of JH-01 and the reimaged workstation were done — find what was NOT done.',
        detail: [
          missedOk ? '\u2713 Missed footholds' : '\u2717 Missed footholds — one identity was never rotated; one rogue privilege survived',
          stepOk ? '\u2713 Skipped step' : '\u2717 Skipped step — the one about the SCOPE of rotation',
        ],
      };
    },

    H6: function (env) {
      const srcOk = env.h6Src === 'R-OFF';
      const stepsOk = sameSeq(env.h6Steps, LAB.H6_STEPS_CANONICAL);
      const rejOk = env.h6Reject === 'HR-SKIP';
      const pass = srcOk && stepsOk && rejOk;
      return {
        pass: pass,
        summary: pass
          ? 'Defensible restoration plan. Only the offline vault copy is offline + pre-incident + hash-verified; the NAS snapshot was reachable during the compromise, the local folder lives on the encrypted host, and the vendor\'s "looks fine" comes with no integrity proof. Your validation chain (hash → catalog compare → rebuilt hosts → scan/samples → payment dry-run → monitoring, then production) is exactly the trust ladder — and you refused the hash-skip, which is where restorations go to die.'
          : 'Not yet. Source first: which copy was unreachable by the attacker AND carries an integrity record made before the incident? Then order the trust ladder — prove the copy, compare it against what should be inside it, put it on rebuilt hosts, test it for real, watch it — and refuse any shortcut that skips the proof just because someone vouched for it.',
        detail: [
          srcOk ? '\u2713 Source' : '\u2717 Source — not the provably clean copy',
          stepsOk ? '\u2713 Validation sequence' : '\u2717 Order — proof before restore; tests before production',
          rejOk ? '\u2713 Near-miss rejected' : '\u2717 Near-miss — the shortcut that skips verification is the one to reject',
        ],
      };
    },

    H7: function (env) {
      const mapOk = LAB.H7_ROOT_CAUSES.every(function (rc) { return env.h7Map[rc.id] === rc.ctrl; });
      const rankOk = sameSeq(env.h7Rank, LAB.H7_RANK_CANONICAL);
      const pass = mapOk && rankOk;
      return {
        pass: pass,
        summary: pass
          ? 'Roadmap accepted. Mapping by mechanism: people → M1017; single-factor → M1032; flat network → M1030; unfiltered web → M1021; reachable backups → M1053. Ranking by time-to-protect: block the lookalike domains TODAY (minutes), roll MFA on remote access (days), stand up the offline backup copy (days–weeks), run the segmentation project (weeks), and run training as a continuous program. Sequencing prevention by speed is how you close the biggest door before the next phish lands.'
          : 'Not yet. Map by mechanism first: which weakness does each control actually remove? Then rank by time-to-protect — how long until each control is genuinely shielding users? A proxy rule beats a procurement; a procurement beats a culture change. Order the five accordingly.',
        detail: [
          mapOk ? '\u2713 Root-cause mapping' : '\u2717 Mapping — each root cause must pair with the control that removes its weakness',
          rankOk ? '\u2713 Time-to-protect ranking' : '\u2717 Ranking — fastest protection first; slowest culture change last',
        ],
      };
    },

    H9: function (env) {
      const phaseOk = Object.keys(LAB.H9_PHASE_CORRECT).every(function (a) {
        return env.h9Phases[a] === LAB.H9_PHASE_CORRECT[a];
      });
      const rootOk = env.h9Root === 'H9-R2';
      const riskOk = env.h9Risk === 'H9-K1';
      const pass = phaseOk && rootOk && riskOk;
      return {
        pass: pass,
        summary: pass
          ? 'Report accepted — lifecycle-fluent and honest. Six actions, six phases, no wobble. Root cause stated as the CHAIN of weaknesses (one phished credential + no MFA + flat network + reachable backups), not a scapegoat exploit. And the residual-risk stance is the professional one: reduced, not eliminated — controls verified, risk documented, rehearsal scheduled, lookalike registrations monitored. That is a report leadership can act on.'
          : 'Not yet. Read each action for its VERB: what did the responder actually do — notice and declare, capture and reconstruct, isolate, remove, restore and watch, or rehearse? Those verbs map one-to-one onto the lifecycle. For the narrative: a root cause is the CHAIN of weaknesses that made the incident possible, not one exotic culprit. And residual risk is never "eliminated" — the honest stance documents what shrank the risk and what still remains.',
        detail: [
          phaseOk ? '\u2713 Phase classification' : '\u2717 Phase classification — match each action\'s verb to its phase',
          rootOk ? '\u2713 Root cause' : '\u2717 Root cause — the chain of weaknesses, not a scapegoat exploit',
          riskOk ? '\u2713 Residual-risk stance' : '\u2717 Residual-risk stance — document what shrank the risk and what remains',
        ],
      };
    },
  };

  function validateObjective(id, env) {
    const fn = validators[id];
    if (!fn) return { pass: false, summary: 'No validator for this objective.' };
    return fn(env);
  }

  /* ───────────────────────────── scoring ────────────────────────────────── */

  function computeScore(state) {
    const objs = LAB.OBJECTIVES.filter(function (o) { return o.mode === state.mode; });
    let points = 0;
    const maxObjPoints = objs.length * 10;
    let passedCount = 0;
    let firstTryCount = 0;
    let hintTiers = 0;

    objs.forEach(function (o) {
      const s = state.obj[o.id];
      hintTiers += s ? s.hintLevel : 0;
      if (s && s.passed) {
        passedCount += 1;
        if (s.firstTry) firstTryCount += 1;
        const base = s.firstTry ? 10 : 6;
        const hintPenalty = state.mode === 'hard' ? 4 : 2;
        points += Math.max(base - s.hintLevel * hintPenalty, s.firstTry ? 4 : 2);
      }
    });

    const quiz = state.mode === 'hard' ? LAB.QUIZ_HARD : LAB.QUIZ_MEDIUM;
    let quizCorrect = 0;
    quiz.forEach(function (q) {
      if (state.quiz.answers[q.id] === q.correct) quizCorrect += 1;
    });
    const maxQuizPoints = quiz.length * 6;
    points += quizCorrect * 6;

    const maxPoints = maxObjPoints + maxQuizPoints;
    const pct = maxPoints === 0 ? 0 : Math.round((points / maxPoints) * 100);
    const stars = pct >= 85 ? 3 : pct >= 65 ? 2 : 1;
    return {
      passedCount: passedCount,
      totalCount: objs.length,
      firstTryCount: firstTryCount,
      hintTiers: hintTiers,
      quizCorrect: quizCorrect,
      quizTotal: quiz.length,
      points: points,
      maxPoints: maxPoints,
      pct: pct,
      stars: stars,
    };
  }

  global.LabObjectives = {
    validateObjective: validateObjective,
    computeScore: computeScore,
    PHASE_ACTIVITY: PHASE_ACTIVITY,
    ARTIFACT_CORE_IDS: ARTIFACT_CORE_IDS,
    ARTIFACT_NOISE_IDS: ARTIFACT_NOISE_IDS,
    sameSet: sameSet,
    sameSeq: sameSeq,
  };
})(window);
