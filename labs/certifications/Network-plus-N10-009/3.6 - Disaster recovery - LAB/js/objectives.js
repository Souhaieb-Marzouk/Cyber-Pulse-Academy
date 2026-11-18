// Operation THAWLINE — objective definitions + validators (single source of truth)
// Static port: 1:1 mirror of src/lib/lab/objectives.ts. scripts/port_check.js
// proves both behavioral equality of every validator (correct + empty answer
// fixtures) and structural equality of the definitions.
//
// Classic script — hangs off the global `LabObjectives` and reads content from
// the global `LabData`.

var LabObjectives = (function () {
  "use strict";

  /* ---------------- parse helpers ---------------- */

  function parseMinutes(raw) {
    const s = (raw ?? "").toLowerCase().replace(/,/g, "").replace(/\s+/g, " ").trim();
    if (!s) return null;
    const hm = s.match(/^(\d+)\s*:\s*(\d{1,2})$/);
    if (hm) return parseInt(hm[1], 10) * 60 + parseInt(hm[2], 10);
    const h = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)(?![a-z])/);
    const m = s.match(/(\d+)\s*(?:m|min|mins|minute|minutes)(?![a-z])/);
    if (h || m) {
      const hh = h ? parseFloat(h[1]) : 0;
      const mm = m ? parseInt(m[1], 10) : 0;
      return Math.round(hh * 60 + mm);
    }
    const n = s.replace(/\s*min(ute)?s?\b/g, "").trim();
    if (/^\d+(\.\d+)?$/.test(n)) return parseFloat(n);
    return null;
  }

  function parseHours(raw) {
    const s = (raw ?? "").toLowerCase().replace(/,/g, "").replace(/\s+/g, " ").trim();
    if (!s) return null;
    const hm = s.match(/^(\d+)\s*:\s*(\d{1,2})$/);
    if (hm) return parseInt(hm[1], 10) + parseInt(hm[2], 10) / 60;
    const h = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)(?![a-z])/);
    const m = s.match(/(\d+)\s*(?:m|min|mins|minute|minutes)(?![a-z])/);
    if (h || m) {
      const hh = h ? parseFloat(h[1]) : 0;
      const mm = m ? parseInt(m[1], 10) : 0;
      return hh + mm / 60;
    }
    const n = s.replace(/\s*h(our)?s?\b/g, "").trim();
    if (/^\d+(\.\d+)?$/.test(n)) return parseFloat(n);
    return null;
  }

  const near = (v, target, tol = 0) => v !== null && Math.abs(v - target) <= tol;

  /* ---------------- matrix answers ---------------- */

  // keys: m9.<svc>-<metric> -> met | breach
  const M9_ANSWERS = {
    "m9.frostline-rpo": "met",
    "m9.frostline-rto": "breach",
    "m9.shipgate-rpo": "breach",
    "m9.shipgate-rto": "breach",
    "m9.ledgerroom-rpo": "met",
    "m9.ledgerroom-rto": "met",
  };

  /* ---------------- objective set ---------------- */

  const OBJECTIVES = [
    /* ============== MEDIUM ============== */
    {
      id: "M1",
      title: "On the metric wall, match each of the four DR metrics to the definition that fits it.",
      pillar: "P1",
      board: "manual",
      hints: [
        "Two of these are planning thresholds agreed with the business — their names end in 'Objective'.",
        "MTBF counts the quiet stretches BETWEEN failures; MTTR measures the fixing itself.",
      ],
      check: (a) => {
        const ok =
          a["m1.rpo"] === "d1" &&
          a["m1.rto"] === "d2" &&
          a["m1.mtbf"] === "d3" &&
          a["m1.mttr"] === "d4";
        return ok
          ? { ok: true, text: "Correct. RPO and RTO are the business's tolerance for data loss and downtime; MTBF and MTTR are what the equipment actually delivers. Next, see each number appear in real evidence (Records Room)." }
          : { ok: false, text: "Not yet. Tie each definition to its trigger: data loss → RPO; downtime → RTO; gaps between failures → MTBF; repair duration → MTTR. The two 'Objective' metrics are chosen by the business; the two means are measured from history." };
      },
    },
    {
      id: "M2",
      title: "Match each facility profile from DOC-05 to its site tier (cold, warm, hot).",
      pillar: "P1",
      board: "manual",
      hints: [
        "Ask what is already IN the room: nothing, hardware, or hardware with live data.",
        "The recovery band follows: days → cold, hours → warm, minutes → hot.",
      ],
      check: (a) => {
        const ok = a["m2.c1"] === "cold" && a["m2.c2"] === "warm" && a["m2.c3"] === "hot";
        return ok
          ? { ok: true, text: "Correct. Site tiers are a sliding scale of what is pre-provisioned: shell (cold), hardware (warm), hardware + live data (hot). Cost rises the same way." }
          : { ok: false, text: "Re-read DOC-05. Cold = empty shell; warm = hardware awaiting restore; hot = mirrored live replica. Match the 'what's in the room' phrase in each profile." };
      },
    },
    {
      id: "M3",
      title: "Six statements from the continuity debate — sort each into active-active or active-passive.",
      pillar: "P1",
      board: "manual",
      hints: [
        "'Both sides live' versus 'standby waits' splits all six statements.",
        "Statements about paying for capacity twice and load balancing belong to active-active.",
      ],
      check: (a) => {
        const ok =
          a["m3.s1"] === "aa" &&
          a["m3.s2"] === "ap" &&
          a["m3.s3"] === "aa" &&
          a["m3.s4"] === "ap" &&
          a["m3.s5"] === "aa" &&
          a["m3.s6"] === "ap";
        return ok
          ? { ok: true, text: "Correct. Active-active = everything live at once (seamless, expensive, needs load balancing). Active-passive = standby waits (cheaper, but failover brings it up)." }
          : { ok: false, text: "Sort by the core question: is the second site ALREADY serving traffic, or does it WAIT for failover? Seamless failover, double capacity and load balancing are all active-active traits." };
      },
    },
    {
      id: "M4",
      title: "Match each exercise description to its DR test type.",
      pillar: "P1",
      board: "manual",
      hints: [
        "Order by realism: talk → paper walk-through → isolated execution → alongside production → production down.",
        "Only ONE type interrupts production; only ONE runs recovery systems alongside it without interruption.",
      ],
      check: (a) => {
        const ok =
          a["m4.t1"] === "tabletop" &&
          a["m4.t2"] === "walkthrough" &&
          a["m4.t3"] === "simulation" &&
          a["m4.t4"] === "parallel" &&
          a["m4.t5"] === "full";
        return ok
          ? { ok: true, text: "Correct. That ladder — tabletop, walkthrough, simulation, parallel, full interruption — is also your risk ladder: each step up proves more and endangers more. The Continuity Planner will make you schedule it." }
          : { ok: false, text: "Anchor on the extremes first: 'no systems touched' = tabletop; 'production taken down' = full interruption. Then place the paper walk-through, the isolated run, and the alongside-production run." };
      },
    },
    {
      id: "M5",
      title: "From GT-4's Q4 service log (DOC-02), compute its mean time to repair (MTTR), in hours.",
      pillar: "P2",
      board: "records",
      hints: [
        "Only qualifying OUTAGE tickets count — four of them carry repair times.",
        "MTTR = total repair time ÷ number of repairs = (2.5 + 1.0 + 3.5 + 1.0) ÷ 4.",
      ],
      check: (a) => {
        const v = parseHours(a["m5"] ?? "");
        if (near(v, 2)) return { ok: true, text: "Correct: 8 repair-hours ÷ 4 repairs = 2.0 h MTTR. When GT-4 breaks, it is down about two hours on average — that is your maintainability figure." };
        return { ok: false, text: "Not this time. Filter to the OUTAGE tickets only (perf tickets, the printer and the false alarm don't count), sum their repair times, divide by the number of repairs." };
      },
    },
    {
      id: "M6",
      title: "Now compute GT-4's MTBF in hours, using the quarter's in-service time (2,200 h) and its failure count.",
      pillar: "P2",
      board: "records",
      hints: [
        "MTBF = in-service hours ÷ number of failures (the four outage tickets).",
        "2,200 h ÷ 4 = …",
      ],
      check: (a) => {
        const v = parseHours(a["m6"] ?? "");
        if (near(v, 550)) return { ok: true, text: "Correct: 2,200 ÷ 4 = 550 h MTBF. On average GT-4 runs about 23 days between failures. High MTBF = reliable; low MTTR = quick to fix — both feed availability." };
        return { ok: false, text: "Re-check the inputs: in-service time 2,200 h, failures = the four OUTAGE tickets (not seven tickets). MTBF is in-service time ÷ failure count." };
      },
    },
    {
      id: "M7",
      title: "From IR-2043 (DOC-01): how many MINUTES of FrostLine data were lost? (its achieved RPO)",
      pillar: "P2",
      board: "records",
      hints: [
        "RPO is measured from the LAST RECOVERY POINT to the failure — not to the failover.",
        "Last good replication sync 22:00; writes stopped when the hall went down at 22:03.",
      ],
      check: (a) => {
        const v = parseMinutes(a["m7"] ?? "");
        if (near(v, 3)) return { ok: true, text: "Correct: 3 minutes (22:00 → 22:03). Data loss stops at the failure moment — the 84 minutes that followed were DOWNTIME (RTO territory), not data loss. That distinction is exam gold." };
        return { ok: false, text: "Careful: the loss window runs from the last recovery point (22:00 sync) to the failure (22:03) — NOT to the failover at 23:27. Minutes written after 22:00 were lost." };
      },
    },
    {
      id: "M8",
      title: "From IR-2043: how long was ShipGate down? (its achieved RTO, in hours:minutes)",
      pillar: "P2",
      board: "records",
      hints: [
        "t0 is 22:03 Friday; ShipGate came back at 07:15 Saturday on the warm site.",
        "22:03 → 07:15 crosses midnight: 22:03→24:00 is 1 h 57 min; add 7 h 15 min.",
      ],
      check: (a) => {
        const v = parseMinutes(a["m8"] ?? "");
        if (near(v, 552)) return { ok: true, text: "Correct: 9 h 12 min (552 min). Against its 4-hour objective, ShipGate breached RTO — and you already know its data loss breached RPO too. Two breaches, one service." };
        return { ok: false, text: "Run the clock from t0 (22:03 Friday) to restoration (07:15 Saturday). Cross-midnight sums trip many candidates — 1 h 57 min to midnight, then 7 h 15 min more." };
      },
    },
    {
      id: "M9",
      title: "Fill the compliance grid: MET or BREACHED for each service's RPO and RTO (use IR-2043 + the SLA card).",
      pillar: "P3",
      board: "ledger",
      hints: [
        "Compute achieved first, compare second: FL 3 min & 84 min; SG 20 h 03 min & 9 h 12 min; LR 20 h 03 min & 55 h 57 min.",
        "LR looks alarming (56 h of downtime!) but its objective is 5 days — breaching is a comparison, not a feeling.",
      ],
      check: (a) => {
        for (const k of Object.keys(M9_ANSWERS)) {
          if (a[k] !== M9_ANSWERS[k]) {
            return { ok: false, text: "At least one cell disagrees with the evidence. Achieved vs objective: FrostLine 3 min vs 5 (RPO) and 84 min vs 60 (RTO); ShipGate 20 h 03 min vs 1 h and 9 h 12 min vs 4 h; LedgerRoom 20 h 03 min vs 24 h and 55 h 57 min vs 5 days. Breach = achieved worse than objective." };
          }
        }
        return { ok: true, text: "Exactly the audit's finding: ShipGate double-breach; FrostLine RPO pass / RTO fail (the 62-minute declaration); LedgerRoom passes both — big downtime numbers can still comply. This grid IS the committee's problem statement." };
      },
    },
    {
      id: "M10",
      title: "Run the storm drill exactly as IR-2043 unfolded: pick the response used for each service and the declaration timing, then execute.",
      pillar: "P3",
      board: "drill",
      hints: [
        "Follow the timeline: FrostLine failed over to Beacon Ridge; ShipGate and LedgerRoom restored from the Fri 02:00 backups to Lakeshore.",
        "The IC declared at 23:05 — that is the 'verify first' path.",
      ],
      check: (a) => {
        const ok =
          a["drill.executed"] === "1" &&
          a["drill.frostline"] === "hot" &&
          a["drill.shipgate"] === "warm" &&
          a["drill.ledgerroom"] === "warm" &&
          a["drill.declare"] === "verify";
        if (!a["drill.executed"])
          return { ok: false, text: "Make the three selections and the declaration timing, then press EXECUTE DRILL — the outcome ledger is the evidence." };
        return ok
          ? { ok: true, text: "Replay confirmed. Watch the ledger: FrostLine loses only 3 minutes of data but spends 84 minutes down — because 'verify first' burned 62 minutes before recovery work started. Decision time is RTO you can train away." }
          : { ok: false, text: "Replay the report: telemetry failed over to the hot site; both ShipGate and LedgerRoom were restored from the Friday 02:00 backups on the warm site; the commander declared at 23:05 (verify-first)." };
      },
    },
    {
      id: "M11",
      title: "In the Continuity Planner, assign a DR site tier to each service. Constraint: exactly ONE premium (hot) subscription.",
      pillar: "P4",
      board: "planner",
      hints: [
        "Match tier to RTO: 60 min → hot; 4 h → warm; 5 days → cold.",
        "The single hot subscription belongs to FrostLine — it is the only service with a minutes-scale RTO.",
      ],
      check: (a) => {
        const ok = a["m11.frostline_site"] === "hot" && a["m11.shipgate_site"] === "warm" && a["m11.ledgerroom_site"] === "cold";
        if (ok) return { ok: true, text: "Approved design. FrostLine (RTO 60 min) justifies the premium hot site; ShipGate's 4 h fits the warm site's 4–6 h restore; LedgerRoom's 5 days is satisfied by a cheap cold shell. Tier follows RTO; budget follows tier." };
        if (a["m11.shipgate_site"] === "hot" || a["m11.ledgerroom_site"] === "hot") return { ok: false, text: "Budget check: only ONE premium (hot) subscription exists, and FrostLine's 60-minute RTO is the only one that needs it. Give ShipGate the warm site and LedgerRoom the cold site." };
        return { ok: false, text: "Set tier by RTO: FrostLine ≤ 60 min → hot; ShipGate ≤ 4 h → warm (4–6 h restore); LedgerRoom ≤ 5 days → cold (4–5 business days)." };
      },
    },
    {
      id: "M12",
      title: "Assign a redundancy model to each service. Requirement: FrostLine must keep monitoring through PDC maintenance windows without failing over.",
      pillar: "P4",
      board: "planner",
      hints: [
        "Only active-active serves traffic from BOTH sites simultaneously.",
        "ShipGate and LedgerRoom are classic active-passive workloads: standby activates on failover.",
      ],
      check: (a) => {
        const ok = a["m12.frostline_model"] === "aa" && a["m12.shipgate_model"] === "ap" && a["m12.ledgerroom_model"] === "ap";
        return ok
          ? { ok: true, text: "Correct. Maintenance windows are the tell: if the primary goes down for planned work, an active-active pair keeps serving — an active-passive pair would have to fail over. Portals and ERP accept the slower, cheaper passive model." }
          : { ok: false, text: "Ask per service: must it survive planned downtime of the primary WITHOUT a failover event? That forces active-active. Otherwise active-passive is the cost-efficient default." };
      },
    },

    /* ============== HARD ============== */
    {
      id: "H1",
      title: "Complete the post-mortem ledger for IR-2043: achieved RPO and achieved RTO (minutes) for FrostLine and ShipGate.",
      pillar: "P2",
      board: "ledger",
      hints: [
        "RPO = last recovery point → failure. RTO = failure → service restored.",
        "FL: 22:00→22:03 and 22:03→23:27. SG: Fri 02:00→22:03 and 22:03→Sat 07:15.",
      ],
      check: (a) => {
        const flr = parseMinutes(a["h1.fl_rpo"] ?? "");
        const flt = parseMinutes(a["h1.fl_rto"] ?? "");
        const sgr = parseMinutes(a["h1.sg_rpo"] ?? "");
        const sgt = parseMinutes(a["h1.sg_rto"] ?? "");
        const bad = [];
        if (!near(flr, 3)) bad.push("FrostLine RPO");
        if (!near(flt, 84)) bad.push("FrostLine RTO");
        if (!near(sgr, 1203)) bad.push("ShipGate RPO");
        if (!near(sgt, 552)) bad.push("ShipGate RTO");
        if (bad.length === 0) return { ok: true, text: "Ledger exact: 3 / 84 / 1,203 / 552 minutes. Two breaches (ShipGate ×2) and one process-caused miss (FrostLine RTO). This is the arithmetic the whole audit hangs on." };
        return { ok: false, text: "Re-derive " + bad.join(", ") + ". Windows: FL data 22:00→22:03; FL downtime 22:03→23:27; SG data Fri 02:00→22:03 (1,203 min); SG downtime 22:03→Sat 07:15 (552 min)." };
      },
    },
    {
      id: "H2",
      title: "Drill under CURRENT capability: for each service pick the lowest-cost response that meets BOTH objectives — declare immediately. If nothing complies, say so.",
      pillar: "P4",
      board: "drill",
      hints: [
        "FrostLine with immediate declaration: 10 min decision + 22 min cutover = 32 min ≤ 60. LedgerRoom on the cold site: 110 h ≤ 120 h and $4k retainer.",
        "ShipGate's best current response still loses ~20 h of data against a 1-hour RPO — the correct entry is 'flag for redesign'.",
      ],
      check: (a) => {
        const fl = a["drill.frostline"];
        const sg = a["drill.shipgate"];
        const lr = a["drill.ledgerroom"];
        const dec = a["drill.declare"];
        if (a["drill.executed"] !== "1")
          return { ok: false, text: "Select per lane, set the declaration timing, then press EXECUTE DRILL — audit the outcome ledger before checking." };
        if (fl === "hot" && sg === "none" && lr === "cold" && dec === "immediate") {
          return { ok: true, text: "Approved: hot-site failover declared immediately (32 min RTO), LedgerRoom to the cold site (compliant at retainer cost), ShipGate honestly flagged — no current response meets a 1-hour RPO with nightly backups. Naming an impossible SLA is a defender's win." };
        }
        if (dec !== "immediate") return { ok: false, text: "The drill asks you to DECLARE IMMEDIATELY on alarm criteria — verify-first burns ~62 minutes and pushes FrostLine past its 60-minute RTO (84 min vs 32 min)." };
        if (sg === "warm") return { ok: false, text: "Near miss: warm-site restore is the LEAST BAD ShipGate option, but it still loses ~20 h of data against a 1-hour RPO — it does not comply. The compliant entry is 'No current response complies'." };
        if (lr === "warm") return { ok: false, text: "LedgerRoom on the warm site complies but is not the LOWEST cost that complies — the cold site (RTO 110 h ≤ 5 days, RPO 20 h ≤ 24 h) satisfies both objectives at retainer cost." };
        if (fl !== "hot") return { ok: false, text: "FrostLine's 60-minute RTO leaves exactly one compliant, affordable path: fail over to Beacon Ridge. Waiting (9.5 h) or cold provisioning (3 days) cannot make 60 minutes." };
        return { ok: false, text: "Re-check each lane against BOTH objectives and the cost ranking. Only FrostLine→hot (immediate), ShipGate→flag, LedgerRoom→cold satisfies everything." };
      },
    },
    {
      id: "H3",
      title: "Design the TARGET architecture in the planner: site tier + redundancy model per service under the one-premium cap — then name the single biggest gap in the CURRENT state.",
      pillar: "P4",
      board: "planner",
      hints: [
        "Target: FL hot + active-active; SG warm + active-passive; LR cold + active-passive.",
        "The biggest current gap is data, not speed: which service's ONLY recovery point is a nightly backup while its RPO is one hour?",
      ],
      check: (a) => {
        const sites = a["h3.frostline_site"] === "hot" && a["h3.shipgate_site"] === "warm" && a["h3.ledgerroom_site"] === "cold";
        const models = a["h3.frostline_model"] === "aa" && a["h3.shipgate_model"] === "ap" && a["h3.ledgerroom_model"] === "ap";
        const gap = a["h3.gap"] === "sg-backups";
        if (sites && models && gap) return { ok: true, text: "Architecture approved and the gap named: ShipGate's nightly-only recovery point is 24 h of exposure against a 1-hour RPO — the single largest risk on the estate. Fixes follow in the remediation objective." };
        if (sites && models && !gap) return { ok: false, text: "Architecture is right, but the gap you picked is not the biggest one: FrostLine's cutover is minutes and Beacon's cost is a choice, while ShipGate loses up to a full DAY of data against a 1-hour RPO every night." };
        return { ok: false, text: "Anchor on the Medium design (hot/warm/cold by RTO), add models (active-active only where planned downtime must not fail over), then re-read DOC-04 for the data gap." };
      },
    },
    {
      id: "H4",
      title: "Build the four-quarter test program in the planner, honoring every constraint in DOC-06 (memo).",
      pillar: "P4",
      board: "planner",
      hints: [
        "Progressive ladder: discussion first, environment-proofing second, the live failover third — it must land by Sep 30.",
        "Q1 tabletop → Q2 parallel → Q3 full interruption (FrostLine only) → Q4 simulation. Walkthroughs stay monthly, out of the slots.",
      ],
      check: (a) => {
        const seq = [a["h4.q1"], a["h4.q2"], a["h4.q3"], a["h4.q4"]];
        const target = a["h4.target"];
        if (seq[0] === "tabletop" && seq[1] === "parallel" && seq[2] === "full" && target === "frostline" && seq[3] === "simulation") {
          return { ok: true, text: "Program approved. Tabletop (never drilled) → parallel (prove the environment, zero risk) → full interruption on FrostLine (evidence by Sep 30, scoped small) → simulation (validate restores). Freeze window Nov–Jan untouched; walkthroughs remain monthly." };
        }
        if (seq[3] === "full") return { ok: false, text: "Rejected: a Q4 full interruption lands inside the Nov–Jan peak freeze — DOC-06 forbids production interruption there, and the Sep 30 audit deadline has passed." };
        if (seq[0] === "full") return { ok: false, text: "Rejected: the team has NEVER drilled — opening with a live production takedown is how DR programs lose executive support. Lowest risk first." };
        if (seq[1] === "full" && seq[0] !== "tabletop") return { ok: false, text: "The ladder must start discussion-based (tabletop) and a parallel test must precede the live failover — the committee requires competence before interruption." };
        if (seq.includes("walkthrough")) return { ok: false, text: "Walkthroughs already run monthly inside ops meetings (memo item 4) — they are not quarterly milestones. Use the slots for the escalation ladder." };
        if (seq[2] === "full" && target !== "frostline") return { ok: false, text: "Scope the live failover to FrostLine — the memo's audit evidence names the flagship recovery (FrostLine); interrupting everything is unjustified blast radius." };
        if (seq[0] === "tabletop" && seq[1] === "parallel" && seq[2] === "full" && target === "frostline") return { ok: false, text: "Three quarters are right. Q4 should re-validate quietly: a SIMULATION (isolated restores) keeps the freeze window safe." };
        return { ok: false, text: "Constraints: lowest-risk first; a parallel test immediately before the live failover; full interruption by Sep 30 and never Nov–Jan; walkthroughs are monthly, not quarterly." };
      },
    },
    {
      id: "H5",
      title: "Evaluate the two ShipGate proposals (DOC-07): pick the COMPLIANT one, then name the clause that disqualifies the other.",
      pillar: "P4",
      board: "records",
      hints: [
        "Both proposals meet RPO and RTO on paper — the disqualifier is budgetary, not technical.",
        "DOC-06 item 5: exactly ONE premium (hot-site) subscription across the estate — and Beacon Ridge already wears it for FrostLine.",
      ],
      check: (a) => {
        if (a["h5.choice"] === "a" && a["h5.flaw"] === "budget") {
          return { ok: true, text: "Correct: Proposal A (hourly replication to the warm site, active-passive) meets both objectives inside the existing contract; Proposal B is disqualified by the CFO's one-premium-site cap, not by its SLAs. 'Best solution' always means best UNDER the constraints." };
        }
        if (a["h5.choice"] === "b") return { ok: false, text: "Proposal B's SLAs are excellent — but it adds a SECOND premium subscription while FrostLine already holds the only one (DOC-06 item 5). Rejected on the budget clause." };
        return { ok: false, text: "Choose the proposal, then read DOC-06 item 5 again: one of the two proposals collides with the CFO cap. The flaw is budgetary." };
      },
    },
    {
      id: "H6",
      title: "From the noisy GT-4 log (DOC-02): how many tickets are genuine OUTAGES? Then MTTR (h) and MTBF (h).",
      pillar: "P2",
      board: "records",
      hints: [
        "Qualifying tickets say OUTAGE and carry a repair time — three other tickets are noise.",
        "MTTR = (2.5+1.0+3.5+1.0)/4; MTBF = 2,200/4.",
      ],
      check: (a) => {
        const c = (a["h6.count"] ?? "").trim();
        const mttr = parseHours(a["h6.mttr"] ?? "");
        const mtbf = parseHours(a["h6.mtbf"] ?? "");
        if (c === "4" && near(mttr, 2) && near(mtbf, 550)) return { ok: true, text: "All three exact: 4 outages, MTTR 2 h, MTBF 550 h. You filtered a perf ticket, an unrelated printer and a false alarm out of a seven-ticket log — that filtering IS the metric skill." };
        if (c !== "4") return { ok: false, text: "Count again: only tickets marked OUTAGE with a repair time count (T-101, T-115, T-131, T-140). The PERF ticket, the printer and the dismissed alert are noise." };
        return { ok: false, text: "Recompute with 4 failures: MTTR = 8 repair-hours ÷ 4 = 2 h; MTBF = 2,200 in-service hours ÷ 4 = 550 h." };
      },
    },
    {
      id: "H7",
      title: "Quote the line in DOC-04 (recovery-point schedule) that PROVES ShipGate cannot meet its 1-hour RPO.",
      pillar: "P2",
      board: "records",
      hints: [
        "You need the line that states ShipGate's recovery-point frequency.",
        "Look for the words 'nightly' and '02:00' next to ShipGate.",
      ],
      check: (a) => {
        const q = (a["h7.quote"] ?? "").toLowerCase();
        if (q.includes("nightly") || q.includes("02:00")) return { ok: true, text: "Found it: 'ShipGate: full backup to vault nightly at 02:00 (ONLY recovery point).' A nightly-only recovery point can lose up to ~24 h — that single line proves the 1-hour RPO is unmeetable today. The 2024 'adequate' note is the stale red herring." };
        return { ok: false, text: "Not the disqualifying line. You are looking for the schedule line that gives ShipGate's ONLY recovery point — its frequency (nightly at 02:00) is the proof." };
      },
    },
    {
      id: "H8",
      title: "Reconstruct FrostLine's recovery curve: place 22:00, 22:03, 23:27, 3 min and 84 min in the correct slots.",
      pillar: "P1",
      board: "ledger",
      hints: [
        "The curve reads left to right: recovery point, failure, restoration; the two shaded spans measure loss and downtime.",
        "Loss window = 22:00→22:03 = 3 min. Downtime = 22:03→23:27 = 84 min.",
      ],
      check: (a) => {
        for (const k of Object.keys(LabData.CURVE_ANSWERS)) {
          if ((a["h8." + k] ?? "") !== LabData.CURVE_ANSWERS[k]) {
            return { ok: false, text: "One placement is off. The curve: last recovery point 22:00 → incident start 22:03 → service restored 23:27; the span BEFORE t0 is data loss (3 min), the span AFTER is downtime (84 min)." };
          }
        }
        return { ok: true, text: "Curve reconstructed perfectly. Read it like a defender: everything left of t0 measures RPO; everything right of t0 measures RTO. One incident, two completely different metrics." };
      },
    },
    {
      id: "H9",
      title: "The audit found ShipGate's RPO gap and the 62-minute declaration lag. Apply the three fixes in the order a real program executes them.",
      pillar: "P3",
      board: "planner",
      hints: [
        "Fix data first (it burns every night), then process, then verify.",
        "Replication → rehearsed declaration → re-test. Never verify before you have changed something.",
      ],
      check: (a, remediation) => {
        const expect = LabData.REMEDIATION_ACTIONS.map((x) => x.id);
        const match = remediation.length === expect.length && remediation.every((v, i) => v === expect[i]);
        if (match) return { ok: true, text: "Sequenced like a program: close the data gap (hourly replication), then the human gap (criteria + rehearsal), then RE-TEST to verify. A control is not a control until a test says so — that is why re-test is last, not first." };
        if (remediation[0] === "a3") return { ok: false, text: "Rejected: re-testing BEFORE changing anything just re-documents the breaches. Close a gap first, then verify." };
        if (remediation[0] === "a2" && remediation[1] === "a1") return { ok: false, text: "Close order: ShipGate loses data every night (RPO gap) — the replication fix stops active harm and goes first; the declaration lag follows." };
        return { ok: false, text: "Think in program order: remediate the data loss, remediate the decision lag, then re-run the drill to verify both." };
      },
    },
  ];

  function objectivesForMode(mode) {
    const prefix = mode === "medium" ? "M" : "H";
    return OBJECTIVES.filter((o) => o.id.startsWith(prefix));
  }

  function objectivesForBoard(board, mode) {
    return objectivesForMode(mode).filter((o) => o.board === board);
  }

  return {
    parseMinutes: parseMinutes,
    parseHours: parseHours,
    near: near,
    M9_ANSWERS: M9_ANSWERS,
    OBJECTIVES: OBJECTIVES,
    objectivesForMode: objectivesForMode,
    objectivesForBoard: objectivesForBoard,
  };
})();
