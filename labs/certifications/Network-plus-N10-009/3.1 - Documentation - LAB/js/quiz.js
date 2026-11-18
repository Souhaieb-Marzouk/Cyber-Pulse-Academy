/* ============================================================================
 * CyberLab — The Documentation Drafting Room (STATIC PORT)
 * js/quiz.js — Knowledge Check quiz bank + grading.
 *   1:1 port of src/lib/lab/quiz.ts (data) + the quiz slice of store.ts (logic).
 *
 * QA contracts enforced here (audited in the original):
 *   R4 — correct-answer position ROTATES across items (medium [1,2,2,1,0,1,3],
 *        hard [3,1,0,2,1,3,0]; every index used in hard, no fixed/weak pattern).
 *   R5 — the correct option is never the uniquely longest; all options share
 *        length band, structure and tone; no formatting giveaways.
 *   B3 — one defensibly correct answer; distractors are plausible, on-topic
 *        misconceptions.
 * ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- data */
  var QUIZ = {
    medium: [
      {
        id: "q1",
        prompt: "Which detail belongs on a LOGICAL diagram?",
        options: [
          "The room each switch is mounted in",
          "VLANs, IP subnets and gateway addresses",
          "The cable type between two buildings",
          "Which rack unit the UPS occupies",
        ],
        answer: 1,
        explain:
          "Logical diagrams show how traffic is organized — VLANs, subnets, gateways, policy zones. Rooms, racks and cable types are the physical diagram's job.",
        topic: "Physical vs. logical diagrams",
      },
      {
        id: "q2",
        prompt: "How much vertical space is one rack unit (1U)?",
        options: ["1.0 inch", "1.25 inches", "1.75 inches", "2.0 inches"],
        answer: 2,
        explain: "One U = 1.75 inches in a 19-inch rack. A '2U' device therefore occupies 3.5 inches of rail space.",
        topic: "Rack diagrams",
      },
      {
        id: "q3",
        prompt:
          "A user says their desk jack is dead. Which document lets you trace their drop end-to-end WITHOUT a toner kit?",
        options: ["The SLA contract", "The wireless heat map", "The cable map", "The logical diagram"],
        answer: 2,
        explain:
          "A cable map records the full chain — wall port → patch panel port → switch port — with matching labels, which is exactly a dead-jack investigation.",
        topic: "Cable maps",
      },
      {
        id: "q4",
        prompt: "What is IPAM primarily for?",
        options: [
          "Scanning managed hosts for malware threats",
          "Planning and tracking IP address space",
          "Blocking unwanted addresses at firewalls",
          "Measuring latency between two subnets",
        ],
        answer: 1,
        explain:
          "IPAM = plan + track + manage address space, integrated with DHCP/DNS, flagging conflicts, shortages and drift. It is management, not security scanning or monitoring.",
        topic: "IPAM",
      },
      {
        id: "q5",
        prompt: "An SLA promises 99.9% uptime. Roughly how much downtime does that permit per YEAR?",
        options: ["8.77 hours", "52.6 minutes", "3.65 days", "5.26 minutes"],
        answer: 0,
        explain:
          "A year has 525,960 minutes; 0.1% of that ≈ 526 min ≈ 8.77 hours. 52.6 min is 99.99%, 3.65 days is 99%, 5.26 min is 99.999%.",
        topic: "SLA",
      },
      {
        id: "q6",
        prompt: "What is the purpose of a wireless heat map from a site survey?",
        options: [
          "Listing AP serials for asset audits",
          "Mapping Wi-Fi signal strength floor-wide",
          "Measuring cable attenuation in ceilings",
          "Tracking AP warranties and licenses",
        ],
        answer: 1,
        explain:
          "Heat maps render measured signal (dBm) on the floor plan: cold spots = dead zones, co-channel overlap = interference. AP serials and warranties belong in the inventory.",
        topic: "Wireless surveys",
      },
      {
        id: "q7",
        prompt: "Which is NOT normally tracked in an asset inventory record?",
        options: ["Serial number", "Warranty end date", "Assigned user and location", "Employee review scores"],
        answer: 3,
        explain:
          "Inventory fields: asset tag, serial, model, location, assigned user, purchase/warranty, licenses. Employee review scores are HR data — out of scope for the register (and a privacy problem).",
        topic: "Asset inventory",
      },
    ],
    hard: [
      {
        id: "q1",
        prompt:
          "SCENARIO — Static block .20–.49, DHCP pool .50–.149. A workstation is documented 'PC-7 · static 10.20.10.92'. What is wrong?",
        options: ["Nothing — statics may live anywhere", "The device must switch to IPv6", "The workstation address should be .1", "A lease will collide with it"],
        answer: 3,
        explain:
          "A static device parked inside a DHCP range is a collision waiting for the next lease. Move it to a static block and record it in IPAM.",
        topic: "IPAM",
      },
      {
        id: "q2",
        prompt: "SCENARIO — Your cloud vendor's SLA is 99.99% on a 30-day month (43,200 min). Maximum allowed downtime?",
        options: ["43.2 minutes", "4.32 minutes", "432 minutes", "52.6 minutes"],
        answer: 1,
        explain: "43,200 × 0.0001 = 4.32 minutes. Four nines are 10× stricter than three nines (43.2 min) — the price jumps accordingly.",
        topic: "SLA",
      },
      {
        id: "q3",
        prompt: "SCENARIO — An employee moves from desk 204 to desk 309 (new drop, new cable ID). Which sheets must be updated?",
        options: ["Cable map and asset inventory", "Only the cable map entry", "Only the inventory location", "No documentation changes needed"],
        answer: 0,
        explain:
          "The move creates a new patch chain (cable map) and changes the device's recorded location (inventory). Two sheets, one change — the drift habit starts with missed pairs like this.",
        topic: "Keeping documents current",
      },
      {
        id: "q4",
        prompt:
          "SCENARIO — The diagram says VLAN 40's gateway is 10.20.40.254; the switch's 'show ip interface brief' says Vlan40 is 10.20.40.1. What do you do?",
        options: [
          "Trust the diagram — it was made by the old admin",
          "Reconfigure the switch to .254 to match the drawing",
          "Update the diagram to 10.20.40.1 and bump the revision",
          "Delete the VLAN from the diagram",
        ],
        answer: 2,
        explain:
          "Device configuration is ground truth; the sheet is the copy that drifted. Redraw, bump the revision, and note the source. (Why the switch answers on .1 is a separate question — verify, don't assume.)",
        topic: "Network diagrams",
      },
      {
        id: "q5",
        prompt: "SCENARIO — The heat map shows two APs with overlapping coverage, both on channel 6, and users report lag. Best fix?",
        options: [
          "Raise both APs' transmit power",
          "Move one AP to channel 1 or 11",
          "Add a third AP also on channel 6",
          "Switch both APs to channel 9",
        ],
        answer: 1,
        explain:
          "Overlapping co-channel APs contend for airtime. 2.4 GHz offers exactly three non-overlapping channels — 1, 6, 11 — so separate the pair onto different ones. More power or a third AP on 6 makes it worse; channel 9 overlaps both.",
        topic: "Wireless surveys",
      },
      {
        id: "q6",
        prompt:
          "SCENARIO — September had 3 outages totaling 27 minutes. The SLA is 99.9% on a 30-day month (43.2 min allowed). Result?",
        options: ["Breach — credits owed", "Exactly at the limit", "Cannot be computed without hourly data", "Within SLA — no breach"],
        answer: 3,
        explain:
          "27 ≤ 43.2, so availability (99.938%) beats the 99.9% commitment. The math, not the outage count, decides breach — three small outages can pass where one long one fails.",
        topic: "SLA",
      },
      {
        id: "q7",
        prompt: "SCENARIO — A new IDF closet is being built on floor 4. Which documentation set must be created (not just updated)?",
        options: ["Physical, rack and cable documentation", "Only the logical diagram", "Only the asset inventory", "Nothing until the closet is live"],
        answer: 0,
        explain:
          "A new closet changes the physical topology, adds a rack elevation, and adds dozens of new cable runs; its addressing also lands in IPAM. Documenting at creation is the cheapest moment you will ever get.",
        topic: "New documentation sets",
      },
    ],
  };

  /* --------------------------------------------------------------- logic */
  var QUIZ_PASS = 0.7;

  function itemsFor(mode) {
    return QUIZ[mode] || [];
  }

  /** Grade the recorded answers against the bank (same rule as the original). */
  function grade(state, mode) {
    var items = itemsFor(mode);
    var correct = items.filter(function (it) {
      return state.quiz.answers[it.id] === it.answer;
    }).length;
    return { correct: correct, total: items.length };
  }

  function isPassed(quiz) {
    return quiz.submitted && quiz.total > 0 && quiz.correct / quiz.total >= QUIZ_PASS;
  }

  window.LabQuiz = { QUIZ: QUIZ, QUIZ_PASS: QUIZ_PASS, itemsFor: itemsFor, grade: grade, isPassed: isPassed };
})();
