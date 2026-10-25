// ─── CyberLab "Drafting Room" — CHECK RESULTS engine (js/objectives.js) ───
// One machine-checkable rule per objective (21 total), plus mastery scoring:
// 0.6 × first-attempt ratio + 0.4 × quiz ratio − 2%/hint (capped −20%).
// Ported 1:1 from src/components/archlab/state.ts (validation section).

function objRun(s, id) {
  return s.obj[id] ?? { done: false, attempts: 0, hintsUsed: 0, firstAttemptPass: false };
}
function validateObjective(id, s) {
  switch (id) {
    case "M1": {
      const zones = ZONE_IDS;
      const allOpened = zones.every((z) => s.zonesOpened.includes(z));
      if (!allOpened)
        return {
          pass: false,
          msg: `Inspector: ${s.zonesOpened.length}/7 zones visited. Open every zone once — architecture you haven't walked, you don't know.`
        };
      if (s.answers["m1-dmz"] !== "buffer")
        return {
          pass: false,
          msg: "Not quite. Re-read the DMZ inspector: what lives there, and what stands between it and the LAN?"
        };
      return { pass: true, msg: "All seven zones surveyed and the DMZ's containment role confirmed." };
    }
    case "M2": {
      const wrong = STACK_LAYERS.filter((l) => (s.stack[l.id] ?? null) !== l.correctControl);
      if (wrong.length > 0)
        return {
          pass: false,
          msg: `${wrong.length} of 6 layers mismatched. Hint: match the layer's job to the control's job — and beware plausible but off-layer options.`
        };
      return { pass: true, msg: "All six layers correctly armed — defense in depth built from perimeter to data." };
    }
    case "M3": {
      const three = ["firewall", "ips", "network"];
      const wrong = three.filter((t) => s.telemetry[t] !== CANONICAL_TELEMETRY[t]);
      if (wrong.length > 0)
        return {
          pass: false,
          msg: "Check the zone inspectors again: which boxes actually WRITE firewall lines, IPS alerts and flow records?"
        };
      return { pass: true, msg: "Firewall + IPS at the edge, NetFlow on the core — perimeter and interior radar online." };
    }
    case "M4": {
      const six = ["application", "endpoint", "proxy", "dns", "sql", "security"];
      const wrong = six.filter((t) => s.telemetry[t] !== CANONICAL_TELEMETRY[t]);
      if (wrong.length > 0)
        return {
          pass: false,
          msg: "Some modules are in the wrong racks. Follow the writer: the app logs from the DMZ web tier, endpoints log on workstations, DNS01/SQL01 log in the server farm, identity logs from management."
        };
      return { pass: true, msg: "All six interior sources wired to their true homes — together with M3, all nine log types now report from their sources." };
    }
    case "M5": {
      const needSuspicious = ARTIFACTS.filter((a) => a.os === "win" && !a.hardOnly);
      const bad = needSuspicious.filter((a) => (s.judgment[a.id] ?? null) !== (a.suspicious ? "suspicious" : "normal"));
      if (bad.length > 0)
        return {
          pass: false,
          msg: "One or more verdicts don't match the evidence. Check binary location (%TEMP% vs Program Files) and signatures before judging."
        };
      return { pass: true, msg: "Windows triage correct: the %TEMP% run key flagged (T1547.001), the rest confidently cleared as routine." };
    }
    case "M6": {
      if (s.selinux !== "enforcing")
        return { pass: false, msg: "SELinux is still not Enforcing — set the mode on the Linux tab." };
      if (s.moduleFlagged !== "khidnet")
        return { pass: false, msg: "The rogue module is still loaded. Which lsmod entry matches no vendor driver and is used by nothing?" };
      if (s.answers["lin-perms"] !== "600")
        return { pass: false, msg: "deploy.key is still world-readable/writable. What permission set does a private key deserve?" };
      return { pass: true, msg: "Enforcing + rogue module (T1547.006) flagged + key locked to 600 — LNX-BLD1 hardened." };
    }
    case "M7": {
      const wrong = SNIPPETS.filter((sn) => s.answers[`snip-${sn.id}`] !== sn.correct);
      if (wrong.length > 0)
        return {
          pass: false,
          msg: `${SNIPPETS.length - wrong.length}/${SNIPPETS.length} tagged. Let the hostname lead: dns01 writes DNS lines, PXY-01 writes proxy lines, EDR agents write endpoint lines, BRICK-1 writes firewall lines.`
        };
      return { pass: true, msg: "All four samples correctly attributed — you can read raw telemetry and name its source." };
    }
    case "M8": {
      const wrong = BEHAVIORS.filter((b) => {
        const ans = s.answers[`bhv-${b.id}`];
        if (ans === b.correct)
          return false;
        if (b.alt && ans === b.alt)
          return false;
        return true;
      });
      if (wrong.length > 0)
        return {
          pass: false,
          msg: `${BEHAVIORS.length - wrong.length}/${BEHAVIORS.length} correct. Think about WHERE each behavior's evidence is born — name queries, web fetches, process trees, flow summaries.`
        };
      return { pass: true, msg: "Every behavior mapped to its sensor — that mapping is what detection engineering starts from." };
    }
    case "M9": {
      const wrong = ACCESS_DEVICES.filter((d) => (s.answers[`dev-${d.id}`] ?? null) !== d.correct);
      if (wrong.length > 0)
        return {
          pass: false,
          msg: `${ACCESS_DEVICES.length - wrong.length}/${ACCESS_DEVICES.length} correct. Order of questions: is the device KNOWN? is it HEALTHY? is the request SCOPED?`
        };
      return { pass: true, msg: "NAC queue processed correctly — allowed, quarantined and denied with sound reasoning." };
    }
    case "M10": {
      const want = TRUST_STATEMENTS.filter((t) => t.zt).map((t) => t.id).sort();
      const got = (s.multi["trust"] ?? []).slice().sort();
      if (want.join(",") !== got.join(","))
        return {
          pass: false,
          msg: 'Not the right three. Myths grant trust by LOCATION ("inside the castle", "flat is fine", "AV replaces segmentation").'
        };
      return { pass: true, msg: "Verify explicitly · least privilege · assume breach — the three zero-trust principles, separated from myth." };
    }
    case "M11": {
      const want = { r1: true, r2: true, r3: false, r4: false, r5: false };
      const got = s.segmentation;
      const ok = Object.keys(want).every((k) => got[k] === want[k]);
      if (!ok)
        return {
          pass: false,
          msg: "Policy mismatch. Keep the two legitimate client paths (corporate, management); cut DMZ, guest and the lab bridge."
        };
      return { pass: true, msg: "VLAN 30 isolated: crown jewels now reachable only from corporate and management. Blast radius: contained." };
    }
    case "M12": {
      const want = {
        "m12-did": "d-layers",
        "m12-seg": "d-zones",
        "m12-nac": "d-nac",
        "m12-zt": "d-zt"
      };
      const wrong = Object.keys(want).filter((k) => s.answers[k] !== want[k]);
      if (wrong.length > 0)
        return { pass: false, msg: `${4 - wrong.length}/4 matched. Re-read the Reference Shelf definitions on Sheet 1.` };
      return { pass: true, msg: "Vocabulary locked: defense in depth, segmentation, NAC, zero trust." };
    }
    case "H1": {
      if (s.answers["audit-zone"] !== "z-lab")
        return { pass: false, msg: "Part 1 rejected: which zone has NO telemetry, NO controls, AND a path into VLAN 30?" };
      if (s.answers["audit-path"] !== "p-lab-sql")
        return { pass: false, msg: "Part 2 rejected: which single path would make an auditor fail PCI immediately?" };
      if (s.answers["audit-change"] !== "c-microseg")
        return { pass: false, msg: "Part 3 rejected: which change removes the path AND the risk with what you already own?" };
      return { pass: true, msg: "Audit verdict accepted: flat lab → forbidden PCI path → micro-segment and cut the bridge." };
    }
    case "H2": {
      const wrong = LOG_TYPES.filter((l) => s.telemetry[l.id] !== l.canonicalZone);
      if (wrong.length > 0)
        return { pass: false, msg: `${wrong.length} module(s) still mis-wired. Audit every module against its zone inspector — don't trust the existing wiring.` };
      return { pass: true, msg: "Predecessor's errors found and fixed: proxy and security events now report from their true homes." };
    }
    case "H3": {
      const hardWin = ARTIFACTS.filter((a) => a.os === "win");
      const bad = hardWin.filter((a) => (s.judgment[a.id] ?? null) !== (a.suspicious ? "suspicious" : "normal"));
      if (bad.length > 0)
        return { pass: false, msg: 'Verdicts rejected. Two artifacts implement reboot-surviving persistence — and "suspicious-looking" ≠ malicious for the others.' };
      if (s.answers["win-tactic"] !== "ta-persist")
        return { pass: false, msg: "Tactic rejected: which ATT&CK tactic do run keys and WMI subscriptions belong to?" };
      const tech = (s.answers["win-tech"] ?? "").trim().toUpperCase();
      if (tech !== "T1547.001" && tech !== "T1546.003")
        return { pass: false, msg: "Technique ID rejected — exact ATT&CK ID required (T####.###) for run keys or WMI subscriptions." };
      return { pass: true, msg: "Persistence pair identified: T1547.001 run key + T1546.003 WMI subscription, tactic Persistence." };
    }
    case "H4": {
      if ((s.answers["lin-module"] ?? "").trim().toLowerCase() !== "khidnet")
        return { pass: false, msg: "Module name rejected — exact name required, as it appears in lsmod." };
      if (s.answers["lin-tech"] !== "tech-kmod")
        return { pass: false, msg: "Technique rejected — which ATT&CK technique covers loadable kernel modules?" };
      if (s.selinux !== "enforcing" || s.moduleFlagged !== "khidnet" || s.answers["lin-perms"] !== "600")
        return { pass: false, msg: "Host not restored: Enforcing mode, module flagged, key at 600 — all three." };
      if (s.answers["lin-just"] !== "j1")
        return { pass: false, msg: "Justification rejected: what does Enforcing DO that Permissive does not?" };
      return { pass: true, msg: "LNX-BLD1 verdict complete: khidnet (T1547.006), hardened state restored, SELinux rationale correct." };
    }
    case "H5": {
      const r = s.rule;
      const ok = r.dataset === "ds-prx" && r.domain === "do-sync" && r.host === "ho-aw7" && r.cadence === "ca-60" && r.severity === "se-high";
      if (!ok)
        return {
          pass: false,
          msg: "Rule rejected by the tuning board: proxy sees the requests, the odd domain and the flagged workstation narrow it, fixed 60 s cadence makes it a beacon, High earns attention."
        };
      return { pass: true, msg: "Detection accepted: proxy + domain + host + 60 s cadence @ High — high-fidelity beacon rule (T1071.001)." };
    }
    case "H6": {
      if (s.sequence.length !== SEQUENCE_CORRECT.length)
        return { pass: false, msg: `Chain has ${s.sequence.length} of 5 required actions — and the two bad moves must stay OUT.` };
      for (let i = 0;i < SEQUENCE_CORRECT.length; i++) {
        if (s.sequence[i] !== SEQUENCE_CORRECT[i]) {
          const labels = {
            "a-iso": "isolate the host",
            "a-block": "cut C2",
            "a-mem": "capture memory",
            "a-logs": "preserve logs",
            "a-cred": "rotate credentials"
          };
          return { pass: false, msg: `Sequence breaks at step ${i + 1}. Order: contain the host, cut C2, capture volatile evidence, preserve records, then rotate credentials.` };
        }
      }
      return { pass: true, msg: "Containment chain verified: isolate → block → memory → logs → credentials. Evidence preserved, attacker cut off." };
    }
    case "H7": {
      if (s.answers["k1"] !== "k1-micro")
        return { pass: false, msg: "Constraint 1 rejected — which option isolates PCI using only what Meridian already owns?" };
      if (s.answers["k2"] !== "k2-jump")
        return { pass: false, msg: "Constraint 2 rejected — which option grants READ access to ONE database without widening anything?" };
      if (s.answers["k3"] !== "k3-nac")
        return { pass: false, msg: "Constraint 3 rejected — which option authenticates devices without new switches?" };
      return { pass: true, msg: "All three redesigns approved: micro-segmentation, brokered least-privilege access, 802.1X on existing iron." };
    }
    case "H8": {
      if (s.answers["rogue-action"] !== "ra-port")
        return { pass: false, msg: "Immediate action rejected — what stops the device THAT is plugged in, without destroying its trail?" };
      const want = ["pc-nac", "pc-port"].sort();
      const got = (s.multi["roguectl"] ?? []).slice().sort();
      if (want.join(",") !== got.join(","))
        return { pass: false, msg: "Preventive set rejected — pick the two controls that stop the NEXT unknown device at the wall plate." };
      return { pass: true, msg: "Rogue response verified: port disabled with logs preserved; 802.1X + dynamic quarantine prevent the sequel." };
    }
    case "H9": {
      const want = ["zg-mgmt", "zg-vpn"].sort();
      const got = (s.multi["ztgaps"] ?? []).slice().sort();
      if (want.join(",") !== got.join(","))
        return { pass: false, msg: "Selection rejected — violations GRANT trust by location. Two findings stand out: VLAN 99 reachability and posture-free VPN." };
      return { pass: true, msg: "Zero-trust gaps confirmed: flat management reach + posture-free VPN — standing implicit trust, both fixes queued." };
    }
    default:
      return { pass: false, msg: "No validation rule for this objective." };
  }
}
function scoreSummary(s) {
  const mode = s.mode ?? "medium";
  const objs = objectivesFor(mode);
  const quiz = quizFor(mode);
  let done = 0;
  let firstPass = 0;
  let hints = 0;
  for (const o of objs) {
    const r = objRun(s, o.id);
    if (r.done)
      done++;
    if (r.done && r.firstAttemptPass)
      firstPass++;
    hints += r.hintsUsed;
  }
  let quizCorrect = 0;
  for (const q of quiz)
    if (s.quiz[q.id] === q.correct)
      quizCorrect++;
  const firstPassRatio = objs.length ? firstPass / objs.length : 0;
  const quizRatio = quiz.length ? quizCorrect / quiz.length : 0;
  const penalty = Math.min(0.2, hints * 0.02);
  const mastery = Math.max(0, Math.min(1, 0.6 * firstPassRatio + 0.4 * quizRatio - penalty));
  const stars = done === objs.length ? Math.max(1, Math.ceil(mastery * 5)) : 0;
  return {
    objectivesDone: done,
    objectivesTotal: objs.length,
    firstPassRatio,
    quizCorrect,
    quizTotal: quiz.length,
    mastery,
    stars,
    hintsUsed: hints
  };
}

// Expose the validation + scoring engine.
Object.assign(globalThis, { validateObjective, scoreSummary });
