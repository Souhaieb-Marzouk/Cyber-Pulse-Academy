// ─────────────────────────────────────────────────────────────────────────────
// js/objectives.js — objective definitions + the CHECK RESULTS validation
// engine. 1:1 port of `src/lib/lab/objectives.ts` (data halves live in
// js/data.js as MEDIUM_OBJECTIVE_DATA / HARD_OBJECTIVE_DATA; validators are
// attached here, byte-identical semantics).
// ─────────────────────────────────────────────────────────────────────────────

// Tolerant Medium-mode strategy check: accept rearchitect/refactor swap with note.
function strategyMatches(mode, chosen, expected) {
  if (!chosen) return false;
  if (chosen === expected) return true;
  if (mode === "medium") {
    const pair = new Set(["rearchitect", "refactor"]);
    return pair.has(chosen) && pair.has(expected);
  }
  return false;
}

function strMapCheck(s, mode, ids, field) {
  const wrong = [];
  const swapped = [];
  for (const id of ids) {
    const def = WORKLOAD_MAP[id];
    const ws = s.workloads[id];
    const chosen = ws ? ws[field] : undefined;
    const expected = def.expected[field];
    if (field === "strategy") {
      if (!strategyMatches(mode, chosen, expected)) wrong.push(id);
      else if (chosen !== expected) swapped.push(id);
    } else if (chosen !== expected) {
      wrong.push(id);
    }
  }
  return { ok: wrong.length === 0, wrong, swapped };
}

const nameOf = (id) => `${id} ${(WORKLOAD_MAP[id] || {}).name ?? ""}`;

// ─── MEDIUM validators ──────────────────────────────────────────────────────

const MEDIUM_VALIDATORS = {
  "OBJ-M1": (s) => {
    const ids = ["WL-01", "WL-03", "WL-04", "WL-05", "WL-06", "WL-07"];
    const r = strMapCheck(s, "medium", ids, "strategy");
    if (r.ok && r.swapped.length === 0)
      return makeResult(true, "All six strategies correct", "You mapped the whole strategy set — this is the exam's core vocabulary for 2.3.");
    if (r.ok)
      return makeResult(
        true,
        "Correct (with a nuance)",
        `Accepted: ${r.swapped.map((id) => nameOf(id)).join(", ")} — in CompTIA's material Refactor ("rip and replace") and Re-architect overlap. Here the crisp split is: Re-architect = redesign the architecture (WL-01 monolith → services); Refactor = full in-house rewrite for the cloud platform (WL-07). On the exam, prefer the term the question's wording points to.`,
      );
    return makeResult(
      false,
      "Not yet",
      `Check the story for: ${r.wrong.map((id) => nameOf(id)).join(", ")}. Each workload's narrative states what the business decided — the strategy name follows from that decision.`,
    );
  },
  "OBJ-M2": (s) => {
    const r = strMapCheck(s, "medium", ["WL-08", "WL-09", "WL-02"], "migrationType");
    if (r.ok)
      return makeResult(true, "All three routes correct", "Objective 2.3 names exactly these three migration types — you have now exercised all of them.");
    return makeResult(
      false,
      "Not yet",
      `Re-check: ${r.wrong.map((id) => nameOf(id)).join(", ")}. Ask 'where does it run TODAY, and where must it run?' — the direction of that arrow IS the migration type.`,
    );
  },
  "OBJ-M3": (s) => {
    const a = s.triage.changes;
    const ok1 = a["M3-WAVE"] === "WL-12";
    const ok2 = a["M3-TYPE"] === "hardip";
    const ok3 = a["M3-BOOK"] === "firewall";
    if (ok1 && ok2 && ok3)
      return makeResult(true, "Dependency analysis correct", "Dependency mapping before sequencing is what separates a planned migration from a promise.");
    const misses = [
      !ok1 && "Q1 (same wave)",
      !ok2 && "Q2 (binding type)",
      !ok3 && "Q3 (partner slot)",
    ].filter(Boolean);
    return makeResult(false, "Not yet", `Re-read DEPMAP and revisit: ${misses.join(", ")}.`);
  },
  "OBJ-M4": (s) => {
    const days = (s.triage.changes["M4-DAYS"] ?? "") + "";
    const choice = s.triage.changes["M4-CHOICE"] ?? "";
    const daysOk = numericClose(days, 52, 1.5);
    const choiceOk = choice === "appliance";
    if (daysOk && choiceOk)
      return makeResult(true, "Math checks out", "52 days ≫ 30-day window: the appliance wins for bulk, online stays for hot data with delta sync at cutover.");
    if (!daysOk && choice === "online")
      return makeResult(
        false,
        "Check the arithmetic",
        "At 25 Mbps the copy needs ≈ 52 days — far past the 30-day exit. Re-do: 14 TB × 8 = 112 Tb ÷ 25 Mbps = 4.48M s ≈ 52 days. Then reconsider the conclusion.",
      );
    return makeResult(
      false,
      "Not yet",
      `${!daysOk ? "The day figure is off (hint: 112 Tb ÷ 25 Mbps → seconds → days). " : ""}${!choiceOk ? "Pick the conclusion that fits a 30-day window." : ""}`,
    );
  },
  "OBJ-M5": (s) => {
    const r = strMapCheck(s, "medium", ["WL-02", "WL-05", "WL-10", "WL-03"], "transfer");
    if (r.ok)
      return makeResult(true, "Transfer plan coherent", "Each constraint (volume, latency sensitivity, cost, SaaS boundary) now has a fitting transport.");
    return makeResult(
      false,
      "Not yet",
      `Re-consider: ${r.wrong.map((id) => nameOf(id)).join(", ")}. Read each story's constraint line: volume, timing, and whether the target is IaaS or SaaS.`,
    );
  },
  "OBJ-M6": (s) => {
    const checks = [
      ["WL-05", s.workloads["WL-05"]?.sizing === "s2"],
      ["WL-10", s.workloads["WL-10"]?.sizing === "s2"],
      ["WL-01", s.workloads["WL-01"]?.sizing === "s2"],
    ];
    const wrong = checks.filter(([, ok]) => !ok).map(([label]) => label);
    if (wrong.length === 0)
      return makeResult(true, "Landing zone right-sized", "Resource allocation is an explicit 2.3 bullet: right-sizing at migration time converts lift-and-shift savings from theoretical to real.");
    return makeResult(false, "Not yet", `Re-consider the allocation for: ${wrong.join(", ")}. The utilisation numbers in each story tell you what the target size should be.`);
  },
  "OBJ-M7": (s) => {
    const c = s.triage.changes;
    const keys = ["M7-WL04", "M7-WL05", "M7-WL06", "M7-WL09", "M7-WL10", "M7-WL11"];
    const ticked = keys.filter((k) => c[k] === "1");
    if (eqSet(ticked, ["M7-WL04", "M7-WL06", "M7-WL11"]))
      return makeResult(true, "All three blockers found", "License mobility, license cost model, and litigation holds — three different 'considerations' from 2.3, found in evidence before they became incidents.");
    const label = (k) => k.replace("M7-WL", "WL-");
    return makeResult(
      false,
      "Not yet",
      `Your selection (${ticked.length ? ticked.map(label).join(", ") : "empty"}) doesn't match the evidence. Re-read LIC-INV (license rows) and COMP-REG (hold + scope rows). Warning ≠ blocker: an egress fee is a cost note, not a stop.`,
    );
  },
  "OBJ-M8": (s) => {
    const w5 = s.workloads["WL-05"];
    const ranIntegrity = Object.values(s.workloads).some((w) => w.integrityRun);
    const ranPerf = Object.values(s.workloads).some((w) => w.perfRun);
    const d1 = w5?.dispositions["F1"];
    const d2 = w5?.dispositions["F2"];
    if (ranIntegrity && ranPerf && d1 === "resync" && d2 === "resync")
      return makeResult(true, "Validation executed, defects dispositioned", "You did what a migration engineer does on arrival night: measure, compare to baseline, and refuse to accept silent divergence.");
    if (!ranIntegrity || !ranPerf)
      return makeResult(false, "Run both sweeps first", "Radar → 'Run integrity sweep' and 'Run performance comparison'. You cannot disposition findings you haven't produced.");
    return makeResult(
      false,
      "Disposition review",
      `F1 (checksum): ${d1 ?? "—"} · F2 (latency): ${d2 ?? "—"}. A divergent copy must be re-synced and re-verified; a regression traced to a dependency gets a targeted fix. Neither is 'accept', and rollback is for when forward fixes can't hold the RTO.`,
    );
  },
  "OBJ-M9": (s) => {
    const seqOk = cutoverSeqCorrect(s.cutover.seq);
    const ttlOk = s.cutover.ttl === 300;
    if (seqOk && ttlOk)
      return makeResult(true, "Runbook sequenced, TTL armed", "Short TTL pre-lowered at T-24h is what makes the final switch fast AND reversible — the heart of a controlled cutover.");
    if (!seqOk)
      return makeResult(false, "Order review", `Current order: ${s.cutover.seq.join(", ") || "empty"}. Think: announce → lower TTL → delta sync → freeze writes → verify lag/checksums → switch → smoke test/UAT → hypercare.`);
    return makeResult(false, "TTL", "POLICY requires ≤ 300 s, set 24 h in advance so the short TTL propagates before the switch.");
  },
  "OBJ-M10": (s) => {
    const trigOk = eqSet(s.cutover.rollbackTriggers, ["T1", "T2", "T3"]);
    const firstOk = s.cutover.rollbackFirst === "A";
    if (trigOk && firstOk)
      return makeResult(true, "Rollback armed", "Quantified triggers + a rehearsed first action = a rollback that takes minutes, not a war-room improvisation. The 300 s TTL you set is what makes 'flip back' viable.");
    return makeResult(
      false,
      "Not armed yet",
      `Triggers: ${s.cutover.rollbackTriggers.join(", ") || "none"} · First: ${s.cutover.rollbackFirst ?? "none"}. Valid triggers are numeric thresholds defined BEFORE the cutover. The first action must be the fastest safe reversal — DNS back-flip.`,
    );
  },
  "OBJ-M11": (s) => {
    if (waveOrderCorrect(s.waveOrder))
      return makeResult(true, "Waves sequenced", "Risk-graded waves: each wave de-risks the next. WL-05 and WL-12 share a wave because EDI depends on the shop cutover — dependencies constrain sequencing.");
    return makeResult(
      false,
      "Order review",
      `Current: ${s.waveOrder.join(" → ")}. Principles: pilot before prod; dependents ride with (or right after) their dependency; the re-architecture lands last, when tooling is proven.`,
    );
  },
  "OBJ-M12": (s) => {
    const c = s.triage.changes;
    const sel = ["M12-P1", "M12-P2", "M12-P3", "M12-P4", "M12-D1", "M12-D2"].filter((k) => c[k] === "1");
    const expected = ["M12-P1", "M12-P2", "M12-P3", "M12-P4"];
    if (!s.cutover.executed)
      return makeResult(false, "Run the cutover first", "Clearance → 'Begin live cutover (simulation)'. Post-migration tasks only make sense after the traffic has moved.");
    if (eqSet(sel, expected))
      return makeResult(true, "Migration closed out properly", "Decommission-after-hypercare, documentation truth, spend reconciliation, scheduled rightsizing — the quiet work that makes wave 2 easier than wave 1.");
    return makeResult(
      false,
      "Checklist review",
      `Selected: ${sel.join(", ") || "none"}. Remember: baselines are your comparison point for the next wave; on-prem firewall rules stay during the 14-day rollback window.`,
    );
  },
};

// ─── HARD validators ────────────────────────────────────────────────────────

const HARD_VALIDATORS = {
  "OBJ-H1": (s) => {
    const docsOk = eqSet(s.triage.docs, TRIAGE_EXPECTED_DOCS);
    const changesOk = TRIAGE_EXPECTED_DOCS.every((d) => s.triage.changes[d] === TRIAGE_EXPECTED_CHANGES[d]);
    if (docsOk && changesOk)
      return makeResult(true, "Triage clean", "You separated signal from noise under time pressure — the exact skill the performance-based exam items and the real job both demand.");
    if (!docsOk) {
      const noise = s.triage.docs.filter((d) => ["ARCHIVE-2019", "PRINT-QUOTE"].includes(d));
      return makeResult(
        false,
        "Selection review",
        `${noise.length ? `You included planted noise (${noise.join(", ")}). ` : ""}Ask of each doc: does it change WHAT moves, HOW it transfers, or WHEN it may move? The 2019 draft predates the current estate; the print quote is facilities noise.`,
      );
    }
    return makeResult(false, "Change mapping review", "Each of the three documents forces exactly one plan change — re-read each and match the dropdown to the concrete consequence.");
  },
  "OBJ-H2": (s) => {
    const ids = Object.keys(WORKLOAD_MAP);
    const r = strMapCheck(s, "hard", ids, "strategy");
    if (r.ok)
      return makeResult(true, "Strategy board complete — 12/12 exact", "A full-estate strategy map is the deliverable management actually signs off. You produced one.");
    return makeResult(
      false,
      `${ids.length - r.wrong.length}/12 exact — keep going`,
      `Incorrect or unset: ${r.wrong.map((id) => nameOf(id)).join(", ")}. Hard mode wants the precise term: architecture redesign = Re-architect; full in-house rewrite = Refactor; SaaS replacement of an EOL product = Retire (+ replace).`,
    );
  },
  "OBJ-H3": (s) => {
    const planOk = s.transferPlan.plan === "serial";
    const hoursOk = numericClose(s.transferPlan.totalHours, 45.3, 1);
    const firstOk = s.transferPlan.first === "WL-05";
    if (planOk && hoursOk && firstOk)
      return makeResult(true, "Schedule engineered", "45.3 h serial beats 85.3 h parallel-equal because dedication eliminates the straggler stream. Priority order puts WebShop first — revenue first, then its dependent EDI.");
    return makeResult(
      false,
      "Re-derive the schedule",
      `Plan: ${s.transferPlan.plan ?? "—"} · Total: ${s.transferPlan.totalHours || "—"} h · First: ${s.transferPlan.first ?? "—"}. Compute each workload alone at 250 Mbps: 3.2 TB→28.4 h, 0.8 TB→7.1 h, 1.1 TB→9.8 h. Serial total = 45.3 h; parallel-equal makes all three wait 85.3 h for the slowest.`,
    );
  },
  "OBJ-H4": (s) => {
    const depsOk = eqSet(s.audit.deps, AUDIT_EXPECTED_DEPS);
    const fixesOk = AUDIT_EXPECTED_DEPS.every((d) => s.audit.fixes[d] === AUDIT_EXPECTED_FIXES[d]);
    if (depsOk && fixesOk)
      return makeResult(true, "Dependency audit complete", "Every break has a named fix: re-IP + partner window, egress rule update, relay co-migration/managed SMTP, DNS cutover with short TTL. Nothing discovered at 02:00 on cutover night.");
    if (!depsOk)
      return makeResult(
        false,
        "Selection review",
        `Selected: ${s.audit.deps.join(", ") || "none"}. Break = the endpoint reference dies when one side moves. D5's ends move together; D6 is standalone; D7's target (WL-04) stays put.`,
      );
    return makeResult(false, "Remediation review", "Each break has exactly one sane fix among the options — the one that a change window and a rollback plan can actually cover.");
  },
  "OBJ-H5": (s) => {
    const seqOk = cutoverSeqCorrect(s.cutover.seq);
    const ttlOk = s.cutover.ttl === 300;
    const freezeOk = s.cutover.freeze === FREEZE_OPTIONS[1];
    const dayOk = s.cutover.cutoverDay === CUTOVER_DAY_OPTIONS[2];
    if (seqOk && ttlOk && freezeOk && dayOk)
      return makeResult(true, "Cutover plan locked", "Constraints reconciled: policy freeze + the only partner-available slot → Sunday early morning, inside the freeze, TTL pre-lowered, rollback point before the switch.");
    const misses = [
      !seqOk && "step order",
      !ttlOk && "TTL (300)",
      !freezeOk && "freeze window (policy)",
      !dayOk && "cutover day (freeze ∩ EDI slot)",
    ].filter(Boolean);
    return makeResult(false, "Constraints not yet reconciled", `Off: ${misses.join(" · ")}. POLICY lists the freeze and TTL; the EDI slot is Sundays 02:00–14:00 — the feasible cutover is inside BOTH.`);
  },
  "OBJ-H6": (s) => {
    const ranBoth =
      Object.values(s.workloads).some((w) => w.integrityRun) &&
      Object.values(s.workloads).some((w) => w.perfRun);
    const cause = s.triage.changes["H6-CAUSE"];
    const acts = (s.triage.changes["H6-ACTIONS"]?.split(",").filter(Boolean)) ?? [];
    const causeOk = cause === "freeze";
    const actsOk = acts.join(",") === "H6A1,H6A2,H6A3,H6A4";
    if (!ranBoth)
      return makeResult(false, "Run the sweeps first", "Radar → run integrity sweep and performance comparison; evidence before verdict.");
    if (causeOk && actsOk)
      return makeResult(true, "Root cause nailed", "The checksum told you WHAT diverged; the process told you WHY: the freeze step wasn't enforced. Re-sync under a real freeze, then re-verify — never accept or hand-wave divergence.");
    return makeResult(
      false,
      "Verdict review",
      `Cause: ${cause ?? "—"} · Actions: ${acts.join(" → ") || "—"}. Match the failure to the skipped control (freeze), then fix in dependency order: stop writes, re-sync, re-verify checksums, confirm performance.`,
    );
  },
  "OBJ-H7": (s) => {
    const decOk = s.cutover.incidentDecision === "fixforward";
    const rtoOk = s.cutover.rto === 15;
    const rpoOk = s.cutover.rpo === 5;
    const acts = s.cutover.incidentActions;
    const actsOk = acts.length === 4 && acts.every((a, i) => a === INCIDENT_CORRECT_ACTIONS[i]);
    if (decOk && rtoOk && rpoOk && actsOk)
      return makeResult(true, "Incident resolved in-scope", "Fix-forward protected the RTO and avoided re-diverging data; the ordered actions closed the loop from config to monitoring. That's incident command, not heroics.");
    return makeResult(
      false,
      "Decision review",
      `Decision: ${s.cutover.incidentDecision ?? "—"} · RTO: ${s.cutover.rto ?? "—"} · RPO: ${s.cutover.rpo ?? "—"} · Actions: ${acts.join(" → ") || "—"}. POLICY: Tier-1 = RTO 15 min / RPO 5 min. A 2-minute config fix beats a rollback that re-imports divergence risk and would breach the RTO.`,
    );
  },
  "OBJ-H8": (s) => {
    if (eqSet(s.audit.violations, VIOLATIONS_EXPECTED))
      return makeResult(true, "Audit complete — 4/4 found", "License mobility, litigation hold, data residency, PCI segmentation: the four compliance dimensions of this estate, each caught before an auditor caught them.");
    return makeResult(
      false,
      "Audit review",
      `Selected ${s.audit.violations.length} of 4. Cross-check each statement against LIC-INV (mobility), COMP-REG (hold + residency) and POLICY/PCI scope. Items V5–V7 are good practice, not violations.`,
    );
  },
  "OBJ-H9": (s) => {
    const propOk = s.audit.proposal === "A";
    const exitOk = eqSet(s.audit.exitCosts, EXIT_COSTS_EXPECTED);
    if (propOk && exitOk)
      return makeResult(true, "Decision justified", "A wins on 3-year TCO (€648k vs €711k) AND on feasibility (B demands 1.5 FTE; 0.5 FTE exist). Lock-in was priced in, not ignored: exit costs = decoupling re-work + egress.");
    return makeResult(
      false,
      "Re-compute",
      `Proposal: ${s.audit.proposal ?? "—"} · Exit costs: ${s.audit.exitCosts.join(", ") || "—"}. A: 18k×36 = 648k. B: 11k×36 = 396k + 1.5×70k×3 = 315k → 711k, and staffing is infeasible. True exit costs are decoupling re-work and scale egress.`,
    );
  },
};

// Attach validators to the emitted objective data (content stays in data.js).
const MEDIUM_OBJECTIVES = MEDIUM_OBJECTIVE_DATA.map((o) => ({ ...o, validate: MEDIUM_VALIDATORS[o.id] }));
const HARD_OBJECTIVES = HARD_OBJECTIVE_DATA.map((o) => ({ ...o, validate: HARD_VALIDATORS[o.id] }));
const ALL_OBJECTIVES = [...MEDIUM_OBJECTIVES, ...HARD_OBJECTIVES];
const OBJECTIVES_BY_ID = Object.fromEntries(ALL_OBJECTIVES.map((o) => [o.id, o]));
const CHECKBOX_FIELDS = new Set(CHECKBOX_FIELD_KEYS);

function objectivesForMode(mode) {
  return mode === "medium" ? MEDIUM_OBJECTIVES : HARD_OBJECTIVES;
}
