// ─── Threat Hunt Expedition — objective definitions & CHECK RESULTS engine ───
// Verbatim static port of src/lib/hunt-lab/objectives.ts.
// Medium: OBJ-M1..M12 (10–12 granular, guided, ≥2 per pillar)
// Hard:   OBJ-H1..H9  (8–10 broad, strict, ≥1 per pillar)
/* eslint-disable */

window.HuntObjectives = (function () {
  "use strict";

  const D = window.HuntData;

  const norm = function (s) { return s.trim().toLowerCase(); };
  const sameSet = function (a, b) {
    const x = a.slice().map(norm).sort();
    const y = b.slice().map(norm).sort();
    return x.length === y.length && x.every(function (v, i) { return v === y[i]; });
  };

  const goodPackage = D.packageItems.filter(function (i) { return i.good; }).map(function (i) { return i.id; });
  const goodFeedback = D.feedbackActionItems.filter(function (i) { return i.good; }).map(function (i) { return i.id; });
  const goodShare = D.shareObjectItems.filter(function (i) { return i.good; }).map(function (i) { return i.id; });
  const goodPriority = D.priorityHuntOptions.filter(function (i) { return i.good; })[0].id;
  const goodMetric = D.programMetricOptions.filter(function (i) { return i.good; })[0].id;
  const goodNextHypo = D.nextHypothesisOptions.filter(function (i) { return i.good; })[0].id;

  const mediumTriageCheck = function (env) {
    const events = D.telemetryEvents.filter(function (e) { return D.mediumTriageIds.indexOf(e.id) !== -1; });
    const wrong = events.filter(function (e) {
      return norm((env.triage[e.id] || "")) !== e.verdict;
    });
    if (wrong.length === 0) {
      return {
        pass: true,
        feedback:
          "Clean sweep of the day's contacts. Notice the pattern: every known-good carried documentation (a change record, a routine), every unknown lacked context — and unknown is the work queue that feeds tomorrow's hunts. Defenders keep classification discipline because trust in the ledger is what lets a real anomaly stand out.",
      };
    }
    const names = wrong.map(function (e) { return e.id; }).join(", ");
    return {
      pass: false,
      feedback: "Re-check: " + names + ". Known-good needs documentation (change records, authorizations); known-bad is confirmed malicious behavior; unknown means “no context yet” — it is neither good nor bad. Ask: is there a record that makes this normal? Is there proof it's hostile? If both answers are no, it's unknown.",
    };
  };

  const objectives = [
    // ───────────────────────────── MEDIUM ─────────────────────────────
    {
      id: "OBJ-M1",
      mode: "medium",
      pillar: "P1",
      station: "slate",
      title: "Call it: hunting or monitoring?",
      detail:
        "Five SOC activities are listed on the Tracker's Slate. Tag each one as threat hunting or monitoring — the line between them is the chapter's first big idea.",
      anchor: "Lesson 2.2 — definition of threat hunting vs reactive monitoring",
      hints: [
        "Ask: does this activity wait for something to happen, or does it go looking?",
        "Two statements are about waiting for alerts/signatures to fire.",
        "s2 and s4 wait; s1, s3 and s5 go looking.",
      ],
      check: function (env) {
        const answers = { s1: "hunt", s2: "monitor", s3: "hunt", s4: "monitor", s5: "hunt" };
        const wrong = Object.keys(answers).filter(function (k) {
          return norm(env.huntOrNot[k] || "") !== answers[k];
        });
        if (wrong.length === 0) {
          return {
            pass: true,
            feedback:
              "Exactly. Hunting goes looking before anything fires; monitoring reacts to what sensors were taught to catch. Hold on to this distinction — the rest of the expedition is one long “go looking”.",
          };
        }
        return {
          pass: false,
          feedback:
            "Some tags are off. Test each statement with one question: would this still happen if NO alert ever fired? If yes, it's hunting. Working tickets and waiting for signatures only happen after something fires — that's monitoring.",
        };
      },
    },
    {
      id: "OBJ-M2",
      mode: "medium",
      pillar: "P1",
      station: "ledger",
      title: "Sort the actors: internal vs external",
      detail:
        "The Specimen Ledger holds four actor dossiers. Tag each as an internal or external threat, then match each to its driving motivation.",
      anchor: "Lesson 2.2 — internal actors (a single employee) vs external actors (criminal organizations); actor motivations",
      hints: [
        "Origin is about where the access comes from, not where the person sits.",
        "Only one dossier has legitimate access to Aldervale systems by employment.",
        "Jon R. is internal; match motivations to each dossier's blurb.",
      ],
      check: function (env) {
        const originsWrong = ["a-cinder", "a-glitter", "a-bassline", "a-insider"].filter(function (id) {
          return norm(env.originTags[id] || "") !== (id === "a-insider" ? "internal" : "external");
        });
        const motWrong = ["a-cinder", "a-glitter", "a-bassline", "a-insider"].filter(function (id) {
          const truth = { "a-cinder": "espionage", "a-glitter": "ideology", "a-bassline": "financial", "a-insider": "grievance" }[id];
          return norm(env.motivations[id] || "") !== truth;
        });
        if (originsWrong.length === 0 && motWrong.length === 0) {
          return {
            pass: true,
            feedback:
              "Sorted. Internal actors bring legitimate access and personal motive; external actors bring capability but must fight their way in. The lesson's point lands: hunts must watch for BOTH — an org chart is an attack surface too.",
          };
        }
        return {
          pass: false,
          feedback:
            "Not quite. Origin = where the initial access comes from: employees hold it already (internal); everyone else must acquire it (external). For motivations, read each blurb's verbs: defacing = ideology, extorting = financial, mapping quietly = espionage, copying lists out of resentment = grievance.",
        };
      },
    },
    {
      id: "OBJ-M3",
      mode: "medium",
      pillar: "P1",
      station: "slate",
      title: "Match hunts to their approaches",
      detail:
        "Three hunt scenarios are pinned to the Slate. Match each to its approach: structured, unstructured, or entity-driven.",
      anchor: "Lesson 2.2 — hunting approaches: structured / unstructured / entity-driven",
      hints: [
        "Structured starts from a named intel report; entity-driven starts from an asset you must protect.",
        "The scenario following “a hunter notices an odd process tree” is intuition at work.",
        "sc1 = structured, sc2 = unstructured, sc3 = entity-driven.",
      ],
      check: function (env) {
        const truth = { sc1: "structured", sc2: "unstructured", sc3: "entity" };
        const wrong = Object.keys(truth).filter(function (k) {
          return norm(env.huntScenarios[k] || "") !== truth[k];
        });
        if (wrong.length === 0) {
          return {
            pass: true,
            feedback:
              "All three matched. In the field they blend — today's expedition runs structured (intel-triggered) but you'll feel the unstructured pull when something odd crosses the Scanner.",
          };
        }
        return {
          pass: false,
          feedback:
            "Re-read each scenario's starting point: structured = the TTPs come from intel; unstructured = the starting point is a hunch; entity-driven = the starting point is a crown-jewel asset and its baseline. Name the trigger and the type names itself.",
        };
      },
    },
    {
      id: "OBJ-M4",
      mode: "medium",
      pillar: "P1",
      station: "satchel",
      title: "Assemble the intelligence cycle",
      detail:
        "Six phase tiles are loose in the Satchel. Slot them into the correct order of the intelligence cycle — the pipeline every bulletin you read has just traveled.",
      anchor: "Lesson 2.2 — the intelligence cycle phases and their order",
      hints: [
        "The cycle starts with someone setting priorities and ends with those priorities being tuned.",
        "After data is collected it must be cleaned before anyone judges it.",
        "Direction → Collection → Processing → Analysis → Dissemination → Feedback.",
      ],
      check: function (env) {
        const truth = ["direction", "collection", "processing", "analysis", "dissemination", "feedback"];
        const ok = truth.every(function (id, i) { return env.cycleOrder[i] === id; });
        if (ok) {
          return {
            pass: true,
            feedback:
              "The pipeline is whole. Notice how the expedition itself mirrors the cycle: your director set Direction, the Satchel is Collection, the Scanner normalizes + correlates, and Dispatch will be Dissemination and Feedback.",
          };
        }
        return {
          pass: false,
          feedback:
            "Order matters here. Reason it through as a story: someone must ask a question (Direction) before anyone gathers (Collection); the gathering is raw, so it gets processed; only then does analysis judge it; the answer goes out (Dissemination) and the consumer's comments loop back (Feedback).",
        };
      },
    },
    {
      id: "OBJ-M5",
      mode: "medium",
      pillar: "P1",
      station: "satchel",
      title: "Route intel products to their consumers",
      detail:
        "Three intel excerpts are in the Satchel. Label each as strategic, operational, or tactical intelligence — the altitude determines who can use it.",
      anchor: "Lesson 2.2 — strategic / operational / tactical intelligence products",
      hints: [
        "Ask who consumes it: boards consume trends, hunters consume campaigns, controls consume IoCs.",
        "“Machine-readable list of IPs and domains” is built to be deployed today.",
        "Trends = strategic, campaign dossier = operational, IoC list = tactical.",
      ],
      check: function (env) {
        const wrong = Object.keys(D.intelProductAnswers).filter(function (k) {
          return norm(env.intelProducts[k] || "") !== D.intelProductAnswers[k];
        });
        if (wrong.length === 0) {
          return {
            pass: true,
            feedback:
              "Three altitudes, three consumers. Dissemination only works when the product matches the consumer — a board has no use for IPs, and a firewall has no use for trend forecasts.",
          };
        }
        return {
          pass: false,
          feedback:
            "Re-sort by consumer: leadership needs long-horizon trends (strategic); hunt planners need adversary campaigns, TTPs and infrastructure (operational); controls need machine-readable, deployable indicators (tactical).",
        };
      },
    },
    {
      id: "OBJ-M6",
      mode: "medium",
      pillar: "P2",
      station: "scanner",
      title: "Triage the day's contacts",
      detail:
        "The Scanner's triage bench holds six contacts from a quiet watch. Classify each: known-good, known-bad, or unknown. Cite-worthy evidence is in each contact's detail.",
      anchor: "Lesson 2.2 — threat classification: known-good / known-bad / unknown",
      hints: [
        "Known-good always has paperwork somewhere: a change record, an authorization, a documented pattern.",
        "Office applications never legitimately spawn hidden encoded script interpreters.",
        "If you cannot document it good or prove it bad — it is unknown. Two of each await.",
      ],
      check: mediumTriageCheck,
    },
    {
      id: "OBJ-M7",
      mode: "medium",
      pillar: "P2",
      station: "ledger",
      title: "Profile the portal vandal",
      detail:
        "Overnight, water-utility portals were defaced with ideological slogans by crashing, sloppy scripts. Read the case card in the Ledger and profile the actor type, then pick the matching dossier.",
      anchor: "Lesson 2.2 — threat actor types and attributes (sophistication, resources, intent)",
      hints: [
        "The tooling quality and motive matter more than the target's fame.",
        "No data was taken; noise was made. Who performs for an audience?",
        "Ideology + low sophistication + publicity = hacktivist (GLITTER MOTH).",
      ],
      check: function (env) {
        const okT = norm(env.profilerType) === D.profilerAnswers.type;
        const okD = norm(env.profilerDossier) === D.profilerAnswers.dossier;
        if (okT && okD) {
          return {
            pass: true,
            feedback:
              "Profiled. Sloppy tooling + ideology + appetite for witnesses = hacktivist. Contrast with CINDER EMBER in the same ledger: silent, custom tooling, no audience. Attributes (sophistication, resources, intent) are how hunters predict what an actor will do next.",
          };
        }
        return {
          pass: false,
          feedback:
            "Re-read the clues: crashing scripts and ideological slogans point to low sophistication and an audience-seeking motive. Criminals monetize, nation-states stay quiet, insiders already have access. Which dossier brags loudest?",
        };
      },
    },
    {
      id: "OBJ-M8",
      mode: "medium",
      pillar: "P3",
      station: "slate",
      title: "Build the hunt hypothesis",
      detail:
        "Advisory B1 is your trigger. On the Slate, choose the hunt type, the trigger, the two datasets that would surface the chain FIRST, and the hypothesis worth testing.",
      anchor: "Lesson 2.2 — hunts rely on intelligence; hypothesis-driven method (structured hunt from ISAC TTPs)",
      hints: [
        "A trigger that names specific TTPs makes this a specific kind of hunt.",
        "The chain starts in someone's inbox and lands on a workstation — which datasets see those moments?",
        "Structured · trigger = ISAC 2025-114 · sources = email gateway + EDR process events · the CINDER EMBER hypothesis.",
      ],
      check: function (env) {
        const okType = norm(env.huntType) === "structured";
        const okTrig = norm(env.trigger) === "trg-isac";
        const okSrc = sameSet(env.huntSources, ["q-email", "q-proc"]);
        const okHyp = norm(env.hypothesis) === "h-apt";
        if (okType && okTrig && okSrc && okHyp) {
          return {
            pass: true,
            feedback:
              "A huntable hypothesis: specific TTPs, named data sources, falsifiable in one sweep. This is the engine room of hunting — intel in, testable sentence out. Run it.",
          };
        }
        const gaps = [];
        if (!okType) gaps.push("the trigger names specific TTPs from intel — which approach is defined by that?");
        if (!okTrig) gaps.push("the trigger should be the thing that started the hunt (the advisory), not a report request or user complaint");
        if (!okSrc) gaps.push("first-contact sources: the attachment is visible in email records, its execution in EDR process events");
        if (!okHyp) gaps.push("the hypothesis must state the CINDER EMBER chain, not a different threat");
        return { pass: false, feedback: "Close, but: " + gaps.join("; ") + "." };
      },
    },
    {
      id: "OBJ-M9",
      mode: "medium",
      pillar: "P3",
      station: "scanner",
      title: "Run the persistence sweep",
      detail:
        "Run TASK-LATHE in the Track Scanner, open the suspicious task-creation contact, and tag it with the correct ATT&CK sub-technique ID — precision is the shared language of hunts.",
      anchor: "MITRE ATT&CK T1053.005 (Scheduled Task) — technique tagging; structured hunt execution",
      hints: [
        "TASK-LATHE is the scheduled-task dataset in the Scanner.",
        "One task name mimics software you'd expect on any workstation.",
        "The browser-lookalike task is T1053.005 — Scheduled Task/Job: Scheduled Task.",
      ],
      check: function (env) {
        const ran = env.queriesRun.indexOf("q-sched") !== -1;
        const tag = norm(env.techTag);
        if (!ran) {
          return { pass: false, feedback: "No TASK-LATHE query yet — the sweep has to actually run before anything can be tagged. Open the Scanner and fire the scheduled-task query." };
        }
        if (tag === "t1053") {
          return { pass: false, feedback: "T1053 is the parent technique — correct family, imprecise aim. The intel and the event both describe a Windows scheduled task: cite the sub-technique T1053.005 so this hunt, the detection and future intel all link up." };
        }
        if (tag === "t1053.005") {
          return {
            pass: true,
            feedback:
              "Tagged true: T1053.005, Scheduled Task. Precise IDs turn a finding into infrastructure — detections, intel reports and hunt reports can now all reference exactly this behavior.",
          };
        }
        return {
          pass: false,
          feedback:
            "Wrong technique for this artifact. Ask what the event literally shows: a scheduled task being created for persistence. Match the behavior, not the overall campaign.",
        };
      },
    },
    {
      id: "OBJ-M10",
      mode: "medium",
      pillar: "P3",
      station: "instruments",
      title: "Pin the intrusion to the Diamond",
      detail:
        "Four evidence items from the hunt are on the Instruments bench. Assign each to its Diamond Model vertex — adversary, capability, infrastructure, or victim.",
      anchor: "Diamond Model — Adversary / Capability / Infrastructure / Victim vertices",
      hints: [
        "Capability = what they attack WITH; infrastructure = what they attack OVER.",
        "The loader and document are capability; the IP/domain are infrastructure.",
        "The group is the adversary; the workstation is the victim.",
      ],
      check: function (env) {
        const wrong = Object.keys(D.diamondAnswers).filter(function (k) {
          return norm(env.diamond[k] || "") !== D.diamondAnswers[k];
        });
        if (wrong.length === 0) {
          return {
            pass: true,
            feedback:
              "The Diamond is complete — and now it works for you: pivot from the infrastructure vertex to hunt for other victims of 198.51.100.77, or from capability to other campaigns using the same loader. Every vertex is a doorway.",
          };
        }
        return {
          pass: false,
          feedback:
            "Some pins are off. Test with the classic questions: WHO (adversary), attacking WITH what tools/techniques (capability), OVER what networks/domains/hosts (infrastructure), AGAINST what (victim).",
        };
      },
    },
    {
      id: "OBJ-M11",
      mode: "medium",
      pillar: "P4",
      station: "instruments",
      title: "Order the Kill Chain",
      detail:
        "The seven Kill Chain phases are loose on the bench. Slot them in order — then notice where this expedition's hunt actually intercepted the chain.",
      anchor: "Cyber Kill Chain — seven phases in order; interception points",
      hints: [
        "It begins before any packet touches you, and ends with the adversary's goal.",
        "Delivery comes before Exploitation; Installation precedes Command and Control.",
        "Recon → Weaponization → Delivery → Exploitation → Installation → C2 → Actions on Objectives.",
      ],
      check: function (env) {
        const truth = ["recon", "weaponization", "delivery", "exploitation", "installation", "c2", "actions"];
        const ok = truth.every(function (id, i) { return env.killChain[i] === id; });
        if (ok) {
          return {
            pass: true,
            feedback:
              "Seven phases, seven chances to break a chain. Your hunt caught it at Installation and C2 — but the huntable delivery artifact (EV-EMAIL-01) means next quarter's gateway rules can break this chain at phase three, before anything executes. Defenders always want the earliest practical interception.",
          };
        }
        return {
          pass: false,
          feedback:
            "Think chronologically from the adversary's seat: first they study you, then build the weapon, then send it, then it runs, then it holds on (persistence), then it phones home, then it does the mission.",
        };
      },
    },
    {
      id: "OBJ-M12",
      mode: "medium",
      pillar: "P4",
      station: "dispatch",
      title: "Dispatch intel & close the loop",
      detail:
        "Time to transmit. Choose the sharing format and transport, select what belongs in an external package (and what stays home), and pick the feedback actions that turn this hunt into permanent improvement.",
      anchor: "Lesson 2.2 — intelligence group communications: STIX/TAXII sharing; feedback into detections & runbooks",
      hints: [
        "Format is the language, transport is the vehicle — the machine-readable pairing.",
        "Indicators and technique references help peers; hostnames, mailboxes and excuses do not leave the building.",
        "Feedback actions = write the detection, watch the task-creation event, brief the SOC.",
      ],
      check: function (env) {
        const okFmt = norm(env.intelFormat) === "stix";
        const okTrn = norm(env.intelTransport) === "taxii";
        const okPkg = sameSet(env.packageItems, goodPackage);
        const okAct = sameSet(env.feedbackActions, goodFeedback);
        if (okFmt && okTrn && okPkg && okAct) {
          return {
            pass: true,
            feedback:
              "Transmitted, and the loop is closed: intel consumed → hunt run → indicators shared → detections written → SOC briefed. That last mile is what the lesson means by hunt teams “reacting swiftly”: next week the same TTP meets an alert instead of a hunter.",
          };
        }
        const gaps = [];
        if (!okFmt) gaps.push("the machine-readable intel format is STIX");
        if (!okTrn) gaps.push("the transport built to move it is TAXII");
        if (!okPkg) gaps.push("package = indicators + technique references + sanitized timeline only (hostnames and mailboxes never leave)");
        if (!okAct) gaps.push("feedback = author the detection, alert on task creation, update the runbook — archiving or closing the ticket teaches nothing");
        return { pass: false, feedback: "Not yet transmitting: " + gaps.join("; ") + "." };
      },
    },

    // ───────────────────────────── HARD ─────────────────────────────
    {
      id: "OBJ-H1",
      mode: "hard",
      pillar: "P2",
      station: "scanner",
      title: "The quiet-week sweep",
      detail:
        "Run every dataset in the Scanner. Exactly four contacts share one story — delivery → execution → persistence → C2 — and form the active intrusion. Flag those four (Known-bad), classify the 03:11 bulk upload (Unknown), and leave the documented noise alone.",
      anchor: "Threat classification under noise; red herrings (PT-2025-11, CHG-2317, INC-8771)",
      hints: [
        "Documented noise has paperwork: the pen-test authorization (B6), the maintenance window (B7), the blocked-and-ticketed email (INC-8771).",
        "The four chain contacts span four different datasets — MAIL-TRACE, PROC-SCOPE, TASK-LATHE, FLOW-RADAR.",
      ],
      check: function (env) {
        const want = ["EV-EMAIL-01", "EV-PROC-01", "EV-SCHED-01", "EV-NET-01"];
        const flaggedOk = sameSet(env.contactFlags, want);
        const badOk = want.every(function (id) { return norm(env.triage[id] || "") === "bad"; });
        const unknownOk = norm(env.triage["EV-NET-03"] || "") === "unknown";
        const falsePos = env.contactFlags.filter(function (id) {
          return want.indexOf(id) === -1 && D.telemetryEvents.filter(function (e) { return e.id === id; }).map(function (e) { return e.verdict; })[0] === "good";
        });
        if (flaggedOk && badOk && unknownOk) {
          return {
            pass: true,
            feedback:
              "Quiet week, loud ledger. Four contacts, four datasets, one story — and the noise (scanner, maintenance window, blocked mail) stayed noise because you checked the paperwork. This is classification discipline under pressure.",
          };
        }
        if (falsePos.length > 0) {
          const ev = D.telemetryEvents.filter(function (e) { return e.id === falsePos[0]; })[0];
          return {
            pass: false,
            feedback: "False positive: " + falsePos[0] + " is documented noise — " + (ev && ev.redHerringWhy ? ev.redHerringWhy : "it has paperwork") + " Check the satchel (B6, B7) and ticket references before flagging.",
          };
        }
        return {
          pass: false,
          feedback:
            "The flag set is off. The active chain is exactly four contacts across four datasets (delivery, execution, persistence, C2 — all on the finance workstation and its email). The 03:11 upload is unknown, not part of this chain. Everything with a change record, authorization or open ticket stays unflagged.",
        };
      },
    },
    {
      id: "OBJ-H2",
      mode: "hard",
      pillar: "P3",
      station: "slate",
      title: "Forge the hypothesis",
      detail:
        "From advisory B1 alone, forge the complete structured hunt: hunt type, trigger, EVERY dataset needed to sweep the full chain, and the testable hypothesis.",
      anchor: "Hypothesis-driven hunting; structured hunt construction from ISAC TTPs",
      hints: [
        "“Full chain” means every stage the advisory names — there are four datasets, not two.",
      ],
      check: function (env) {
        const okType = norm(env.huntType) === "structured";
        const okTrig = norm(env.trigger) === "trg-isac";
        const okSrc = sameSet(env.huntSources, ["q-email", "q-proc", "q-sched", "q-net"]);
        const okHyp = norm(env.hypothesis) === "h-apt";
        if (okType && okTrig && okSrc && okHyp) {
          return {
            pass: true,
            feedback:
              "Forged correctly — and note the difference from the guided version: a full-chain hypothesis demands every dataset the chain touches. Email for delivery, EDR for execution, TASK-LATHE for persistence, FLOW-RADAR for C2. Partial hypotheses find partial intrusions.",
          };
        }
        if (!okSrc && okType && okTrig && okHyp) {
          return {
            pass: false,
            feedback:
              "Rejected as a near-miss: your dataset set is incomplete. The advisory names FOUR stages (attachment, PowerShell, scheduled task, beaconing) — a structured sweep covers every stage it names, or the actor simply wins in the gap.",
          };
        }
        return {
          pass: false,
          feedback:
            "Incomplete forge. Required: structured type (intel names TTPs) · trigger = ISAC 2025-114 · all four datasets the chain touches · a hypothesis that states the CINDER EMBER chain specifically.",
        };
      },
    },
    {
      id: "OBJ-H3",
      mode: "hard",
      pillar: "P3",
      station: "scanner",
      title: "Run the chain hunt — in order",
      detail:
        "Execute the hunt so the story reads forward: MAIL-TRACE, then PROC-SCOPE, then TASK-LATHE, then FLOW-RADAR. Then, in the Scanner's chain-ident panel, name the C2 infrastructure and patient-zero host.",
      anchor: "Sequence-based hunt execution; Kill Chain chronology (Delivery → Exploitation → Installation → C2)",
      hints: [
        "The order of a hunt should mirror the order of the adversary's story.",
        "Patient zero is the workstation where the email landed and Word executed.",
      ],
      check: function (env) {
        const order = ["q-email", "q-proc", "q-sched", "q-net"];
        const idx = order.map(function (q) { return env.queriesRun.indexOf(q); });
        const inOrder = idx.every(function (i) { return i >= 0; }) && idx.every(function (v, i) { return i === 0 || v > idx[i - 1]; });
        const ipOk = norm(env.chainIp) === "198.51.100.77";
        const hostOk = norm(env.chainHost) === "ald-wks-0142";
        if (inOrder && ipOk && hostOk) {
          return {
            pass: true,
            feedback:
              "Chain reconstructed in the adversary's own chronology: delivery 08:14, execution 08:19, persistence 08:21, C2 08:22 — ALD-WKS-0142 reaching 198.51.100.77. Sequenced evidence is evidence a responder can act on without re-deriving it.",
          };
        }
        if (!inOrder) {
          return {
            pass: false,
            feedback:
              "Near-miss on sequence: the four datasets ran, but not in chain order. Re-execute the sweeps in chain order — MAIL-TRACE, then PROC-SCOPE, then TASK-LATHE, then FLOW-RADAR — the console keeps your latest run order. A hunt that reads delivery → execution → persistence → C2 reconstructs the intrusion; a hunt that reads backwards risks narrating the ending before the beginning.",
          };
        }
        return {
          pass: false,
          feedback:
            "Sequence is right but the ident panel is off. C2 infrastructure = the beacon destination IP (FLOW-RADAR, 90-second cadence). Patient zero = the host where the attachment executed (PROC-SCOPE), not the mail server that received it.",
        };
      },
    },
    {
      id: "OBJ-H4",
      mode: "hard",
      pillar: "P3",
      station: "instruments",
      title: "Map the campaign with precision",
      detail:
        "On the Instruments bench, tag all four chain artifacts with their exact ATT&CK sub-technique IDs and pick the tactic that covers the campaign's first observed stage.",
      anchor: "MITRE ATT&CK precision: T1566.001 / T1059.001 / T1053.005 / T1071.001; tactic TA0001",
      hints: [
        "Sub-technique, not parent. The parent is the family; the sub-technique is the fingerprint.",
      ],
      check: function (env) {
        const truth = {
          "EV-EMAIL-01": "T1566.001",
          "EV-PROC-01": "T1059.001",
          "EV-SCHED-01": "T1053.005",
          "EV-NET-01": "T1071.001",
        };
        const wrong = Object.keys(truth).filter(function (k) {
          return norm(env.attck[k] || "") !== norm(truth[k]);
        });
        const tacticOk = norm(env.tactic) === "ta0001";
        const parentHits = wrong.filter(function (k) {
          return norm(env.attck[k] || "") === norm(truth[k].split(".")[0]);
        });
        if (wrong.length === 0 && tacticOk) {
          return {
            pass: true,
            feedback:
              "Surgical. Four artifacts, four sub-techniques, first stage = Initial Access (TA0001). This mapping is now a shared object: your detection engineering, your ISAC submission and your coverage matrix all point at the same coordinates.",
          };
        }
        if (parentHits.length > 0) {
          return {
            pass: false,
            feedback:
              "Rejected as a near-miss: parent techniques chosen (e.g. T1566 instead of T1566.001). The parent names the family; the sub-technique is the hunt instruction. The intel cites the attachment variant — match its precision.",
          };
        }
        return {
          pass: false,
          feedback: "Re-tag: " + wrong.join(", ") + ". Match each artifact to what it literally does — email with macro attachment, PowerShell execution, task creation, periodic HTTPS beaconing — and pick the tactic for the FIRST stage you observed.",
        };
      },
    },
    {
      id: "OBJ-H5",
      mode: "hard",
      pillar: "P2",
      station: "ledger",
      title: "Attribute the intrusion",
      detail:
        "Cross-reference the dossiers, bulletins B1/B2 and your sweep. Name the actor behind the chain and select every attribute the evidence actually supports — nothing more.",
      anchor: "Threat-actor attributes: sophistication, resources/funding, intent; evidence-based attribution",
      hints: [
        "Attribution is subtraction as much as selection: rule out the crews the evidence rules out.",
        "No ransom, no noise, custom loader, sector-targeted dwell — whose profile is that?",
      ],
      check: function (env) {
        const actorOk = norm(env.attribution) === D.attributionAnswers.actor;
        const traitsOk = sameSet(env.attributionTraits, D.attributionAnswers.traits);
        if (actorOk && traitsOk) {
          return {
            pass: true,
            feedback:
              "Attribution stands: CINDER EMBER — nation-state, espionage, high sophistication. Each trait maps to evidence (sector fit, custom loader, silent long-dwell behavior, no monetization). Defensible attribution is a chain of citations, not a vibe.",
          };
        }
        if (actorOk && !traitsOk) {
          return {
            pass: false,
            feedback:
              "Right actor, overstated dossier: only keep attributes the evidence supports. State sponsorship + espionage + high sophistication are cited (B2, custom tooling, patience). Financial motive and low sophistication are contradicted; insider access is contradicted by the external delivery.",
          };
        }
        return {
          pass: false,
          feedback:
            "Attribution fails on the actor fit: BASSLINE monetizes (ransom demands), GLITTER MOTH performs (defacements, noise), Jon R. never needed a phishing email. The chain is quiet, custom and utility-targeted — read B2 again.",
        };
      },
    },
    {
      id: "OBJ-H6",
      mode: "hard",
      pillar: "P1",
      station: "satchel",
      title: "Route the intel through the cycle",
      detail:
        "Six operational statements are loose in the Satchel. Assign each to the intelligence-cycle phase it belongs to — the cycle is the org chart of how this team thinks.",
      anchor: "Intelligence cycle phases applied to concrete SOC actions",
      hints: [
        "Statements about setting priorities are the first phase; statements about being heard are near the end.",
        "Cleaning and structuring data precedes judging it.",
      ],
      check: function (env) {
        const wrong = Object.keys(D.routeItemAnswers).filter(function (k) {
          return norm(env.routeItems[k] || "") !== D.routeItemAnswers[k];
        });
        if (wrong.length === 0) {
          return {
            pass: true,
            feedback:
              "Routed cleanly. Watch phase six: the SOC said “too noisy” and priorities got tuned — that Feedback step is where most programs die quietly. Teams that institutionalize it compound; teams that skip it re-hunt the same ground forever.",
          };
        }
        return {
          pass: false,
          feedback:
            "Mis-routed. Re-trace the journey of one intel item: a sponsor asks (Direction), analysts gather (Collection), data gets normalized (Processing), relevance is judged (Analysis), products go out (Dissemination), and the consumer's critique tunes the next round (Feedback).",
        };
      },
    },
    {
      id: "OBJ-H7",
      mode: "hard",
      pillar: "P4",
      station: "dispatch",
      title: "Close the loop",
      detail:
        "The C2 host is blocked and the endpoint is being rebuilt — which is exactly when complacency wins. Choose the feedback actions that convert this hunt into permanent improvement, and the follow-up hypothesis that tests whether containment actually held.",
      anchor: "Feedback phase: hunts improve detections/runbooks; residual risk drives the next hypothesis",
      hints: [
        "Improvement = something that outlives this ticket: detections, runbooks, briefings.",
        "“Contained” is a claim until you test for lateral movement and further beacons.",
      ],
      check: function (env) {
        const okAct = sameSet(env.feedbackActions, goodFeedback);
        const okHyp = norm(env.nextHypothesis) === goodNextHypo;
        if (okAct && okHyp) {
          return {
            pass: true,
            feedback:
              "Loop closed the hard way: detections that outlive the ticket, a briefed SOC, and a follow-up hunt that tests containment instead of trusting it. This is the difference between an incident that happened and a program that learned.",
          };
        }
        if (!okAct && okHyp) {
          return {
            pass: false,
            feedback:
              "Right follow-up hunt, but the feedback set teaches nothing permanent: archive-and-move-on and close-the-ticket leave no detection, no runbook, no briefing. The actor reuses TTPs — the defense must outlive the ticket.",
          };
        }
        return {
          pass: false,
          feedback:
            "Two jobs here: (1) permanent improvements — author the office-spawns-script detection, alert on script-parent task creation, update the runbook/brief the SOC; (2) a follow-up hypothesis that tests containment — sweeping for lateral movement and additional beacons before declaring victory.",
        };
      },
    },
    {
      id: "OBJ-H8",
      mode: "hard",
      pillar: "P4",
      station: "dispatch",
      title: "Decide what leaves the building",
      detail:
        "Assemble the machine-readable ISAC package: choose format and transport, then select exactly the STIX objects that help peers detect — and nothing that identifies you.",
      anchor: "STIX object types (Indicator, Attack Pattern, Relationship) over TAXII; responsible sharing",
      hints: [
        "Peers need coordinates to hunt with: what was seen (indicators), what it means (attack pattern), how they connect.",
      ],
      check: function (env) {
        const okFmt = norm(env.intelFormat) === "stix";
        const okTrn = norm(env.intelTransport) === "taxii";
        const okObj = sameSet(env.shareObjects, goodShare);
        if (okFmt && okTrn && okObj) {
          return {
            pass: true,
            feedback:
              "Package sealed: two Indicators, one Attack Pattern, the Relationship binding them — over TAXII. Peers can now pivot on your infrastructure without ever learning Aldervale's name. That is what responsible sharing looks like in practice.",
          };
        }
        if (okObj && (!okFmt || !okTrn)) {
          return {
            pass: false,
            feedback:
              "Object selection is right; the plumbing is wrong. STIX is the object format, TAXII is the transport built to move it — a PDF or mailing-list attachment is not machine-speed sharing.",
          };
        }
        return {
          pass: false,
          feedback:
            "The package leaks or starves: include both indicators (IP + domain), the Attack Pattern (T1053.005) and the Relationship linking them; exclude victim identity and working notes entirely. Ship it as STIX over TAXII.",
        };
      },
    },
    {
      id: "OBJ-H9",
      mode: "hard",
      pillar: "P4",
      station: "dispatch",
      title: "Steer the hunt program",
      detail:
        "The debrief reaches leadership: choose the next hunt priority given residual risk, and the single metric that tells leadership whether the hunt program is actually maturing.",
      anchor: "Hunt program management: prioritization by residual risk; coverage-based maturity metrics",
      hints: [
        "One blocked host is not a closed case — what did you NOT rule out?",
        "Maturity is measured in darkness removed, not tickets moved.",
      ],
      check: function (env) {
        const okHunt = norm(env.priorityHunt) === goodPriority;
        const okMetric = norm(env.programMetric) === goodMetric;
        if (okHunt && okMetric) {
          return {
            pass: true,
            feedback:
              "Steered true. Priority follows residual risk — lateral movement and additional beacons are unruled-out, everything else is wishful closure. And coverage of ATT&CK techniques is the one metric that measures darkness removed rather than busyness. The program compounds from here.",
          };
        }
        return {
          pass: false,
          feedback:
            "Steer by residual risk: the C2 host is blocked and the endpoint rebuilt, but lateral movement and other beacons were never ruled out — that is the next hunt. For the metric, ignore throughput theater (tickets, alert volume): maturing programs measure how much of ATT&CK they can now see.",
        };
      },
    },
  ];

  function objectivesForMode(mode) {
    return objectives.filter(function (o) { return o.mode === mode; });
  }

  return {
    objectives: objectives,
    objectivesForMode: objectivesForMode,
  };
})();
