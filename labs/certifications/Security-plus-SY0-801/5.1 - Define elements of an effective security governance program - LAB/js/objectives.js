// ─── The Registry — js/objectives.js ──────────────────────────────────────
// Mastery blueprint: objective definitions + CHECK RESULTS validation
// engine. Carried over 1:1 from the framework lab
// (src/data/govlab/objectives.ts) — same objectives, same wording,
// same correct answers, same hint tiers, same feedback messages.

window.LAB_OBJECTIVES = (function () {
  'use strict';

  /**
   * A docket ticket only counts for an objective once it was FILED
   * (locked) via its own "Stamp & file" button (rule R2).
   */
  function dockOk(s, id, cite, stamp) {
    var d = s.dockets[id];
    return !!d && !!d.filed && d.cited === cite && d.stamp === stamp;
  }

  // ───────────────────────────── MEDIUM (12) ──────────────────────────────
  var MEDIUM = [
    {
      id: 'OBJ-M1',
      pillar: 'Understand',
      text: 'Sort the four governance document classes: match each description to Policy, Standard, Procedure or Guideline.',
      topic: 'document class definitions',
      context:
        'Everything in this lab hangs on one ladder: Policy → Standard → Procedure, with Guidelines as advisory support. Nail the definitions first.',
      whereToLook: 'Use the Authority Spectrum rail at the top of the page.',
      anchor: 'C-1, C-3, C-5, C-7 — document class definitions',
      hints: [
        'Two classes are mandatory, one is advisory. Which ones?',
        'Policy = intent (what & why). Standard = measurable rule (what exactly). Procedure = ordered steps (how).',
        'The advisory class uses words like "should" and "consider" — that is the Guideline.',
      ],
      check: function (s) {
        var m = s.matchings['m1'] || {};
        var want = { A: 'policy', B: 'standard', C: 'procedure', D: 'guideline' };
        var bad = Object.keys(want).filter(function (k) { return m[k] !== want[k]; });
        if (bad.length === 0)
          return {
            pass: true,
            feedback:
              'Correct ladder: Policy states intent, Standards make it measurable, Procedures make it executable, Guidelines advise. Every citation you make in this lab depends on this distinction.',
          };
        return {
          pass: false,
          feedback:
            'Some cards are on the wrong rung. Remember: "intent" → Policy; "measurable number/rule" → Standard; "ordered steps" → Procedure; "recommended/should" → Guideline.',
        };
      },
    },
    {
      id: 'OBJ-M2',
      pillar: 'Understand',
      text: 'Anatomy drill: assign each quoted line from the registry to the document class it actually belongs to.',
      topic: 'classifying registry language',
      context:
        'Real registries contain lines of every kind. Being able to say "that sentence is a policy line / standard line / procedure step" is the core analyst skill.',
      whereToLook: 'Open GOV-POL-02 in the Registry and compare its language with GOV-STD-03 and GOV-PRC-01.',
      anchor: 'C-1, C-3, C-5, C-8 — language anatomy across the chain',
      hints: [
        'Look at the verbs: "shall protect…" states direction, not numbers.',
        'A line with an exact figure ("AES-256") is a measurable requirement.',
        'A line beginning with "STEP 1" is executable — that is a procedure.',
      ],
      check: function (s) {
        var m = s.matchings['m2'] || {};
        var ok = m['X'] === 'policy' && m['Y'] === 'standard' && m['Z'] === 'procedure';
        if (ok)
          return {
            pass: true,
            feedback:
              'Exactly. X is management intent (policy), Y carries a measurable threshold (standard), Z is an executable ordered step (procedure). Language anatomy tells you the class even when the label is missing.',
          };
        return {
          pass: false,
          feedback:
            "Re-read each line's language: direction without numbers = policy; exact figures/technologies = standard; \"STEP n\" ordering = procedure.",
        };
      },
    },
    {
      id: 'OBJ-M3',
      pillar: 'Recognize',
      text: 'Classify four registry documents by type: GOV-STD-04, GOV-GLD-01, GOV-PRC-03, GOV-POL-05.',
      topic: 'classifying real registry documents',
      context:
        'The registry is organized by document code, but codes are only trustworthy if you can verify the class yourself.',
      whereToLook: 'Open each document in the Registry pane and read its excerpt language.',
      anchor: 'C-2, C-4, C-6, C-7 — policy/standard/procedure/guideline types in the wild',
      hints: [
        'The code prefix is a hint (STD/PRC/GLD/POL) — but verify against the text.',
        'GOV-PRC-03 gives numbered response steps for ransomware.',
        'GOV-POL-05 states management intent for recovery capability — no numbers, no steps.',
      ],
      check: function (s) {
        var m = s.matchings['m3'] || {};
        var want = {
          'GOV-STD-04': 'standard',
          'GOV-GLD-01': 'guideline',
          'GOV-PRC-03': 'procedure',
          'GOV-POL-05': 'policy',
        };
        var bad = Object.keys(want).filter(function (k) { return m[k] !== want[k]; });
        if (bad.length === 0)
          return {
            pass: true,
            feedback:
              'All four correct. Note how the language confirms the code: the physical security text is measurable (standard), the travel text advises (guideline), the playbook sequences (procedure), the DR text declares intent (policy).',
          };
        return {
          pass: false,
          feedback: 'One or more classes are wrong. Match the excerpt language to the class definitions from OBJ-M1.',
        };
      },
    },
    {
      id: 'OBJ-M4',
      pillar: 'Apply',
      text: 'Adjudicate docket set 1: R-101 (personal USB stick), R-104 (laptop encryption), R-102 (service-account passphrase).',
      topic: 'AUP vs standards citations',
      context:
        'Three live requests, three different document classes. For each: cite the governing document code and stamp the disposition.',
      whereToLook: 'Docket window — open each ticket, then search the Registry for the governing document.',
      anchor: 'C-2 (AUP), C-3/C-4 (encryption & password standards), C-9 (apply)',
      hints: [
        'R-101 concerns everyday use of company systems — which document rules on personal media?',
        'R-104 asks for an exact algorithm — intent documents never carry algorithms.',
        'R-102 wants a number (minimum length). Numbers live in standards.',
      ],
      check: function (s) {
        var a = dockOk(s, 'R-101', 'GOV-POL-01', 'comply');
        var b = dockOk(s, 'R-104', 'GOV-STD-03', 'comply');
        var c = dockOk(s, 'R-102', 'GOV-STD-01', 'comply');
        if (a && b && c)
          return {
            pass: true,
            feedback:
              'AUP for use of systems (personal media banned), Encryption Standard for the exact algorithm (AES-256), Password Standard for the exact length (20 chars for service accounts). Three situations, three correct citations.',
          };
        return {
          pass: false,
          feedback:
            'Not all three are cited and filed correctly. Ask per ticket: is it about USE (AUP) or an exact measurable rule (a standard)? And remember to press "Stamp & file" on each ticket — a correct draft is not a filed ticket.',
        };
      },
    },
    {
      id: 'OBJ-M5',
      pillar: 'Apply',
      text: 'Adjudicate docket set 2: R-103 (emergency production change), R-105 (new starter), R-106 (data-room visitor).',
      topic: 'procedures vs physical standards',
      context:
        'When someone asks "what exactly must we do, in what order?", you are being pointed at a procedure — or a standard for the physical rules.',
      whereToLook: 'Docket window. GOV-PRC-01 has a special path for emergencies.',
      anchor: 'C-5/C-6 (procedures: change mgmt, onboarding), C-4 (physical security standard), C-9',
      hints: [
        'R-103: production changes are never "just do it" — find the emergency path inside the change procedure.',
        'R-105: day-one readiness is an ordered checklist — onboarding procedure.',
        'R-106: visitor badge rules are measurable requirements — a standard, not a procedure.',
      ],
      check: function (s) {
        var r103 = s.dockets['R-103'];
        var a = !!r103 && !!r103.filed && ['GOV-PRC-01', 'GOV-POL-06'].indexOf(r103.cited || '') !== -1 && r103.stamp === 'comply';
        var b = dockOk(s, 'R-105', 'GOV-PRC-02', 'comply');
        var c = dockOk(s, 'R-106', 'GOV-STD-04', 'comply');
        if (a && b && c)
          return {
            pass: true,
            feedback:
              "Emergency change goes through the Change Management Procedure's emergency path (verbal on-call approval → ticket in 24 h → CAB retrospective). New-starter readiness is the Onboarding Procedure. Visitor rules are the Physical Security Standard.",
          };
        return {
          pass: false,
          feedback:
            'Incomplete. Check each ticket again: "how do we do X, in order?" → procedure; "what are the exact rules for X?" → standard. And press "Stamp & file" on each ticket — drafts do not count.',
        };
      },
    },
    {
      id: 'OBJ-M6',
      pillar: 'Decide',
      text: 'Adjudicate R-107 (hotel Wi-Fi advice) — and correctly stamp it as advisory, not mandatory.',
      topic: 'advisory dispositions',
      context:
        'Not every governance answer is a rule. Recognizing when the governing document is a guideline — and saying so out loud — prevents over-enforcement.',
      whereToLook: 'Docket window. Search the registry for travel guidance.',
      anchor: 'C-7, C-10 — guideline class and advisory language',
      hints: [
        'The requester explicitly asks "am I breaking a rule?" — check whether the governing document actually contains rules.',
        "Look at GOV-GLD-01's verbs: encouraged, consider, wise.",
        'Advisory documents get the ADVISORY ONLY stamp — there is nothing to enforce.',
      ],
      check: function (s) {
        if (dockOk(s, 'R-107', 'GOV-GLD-01', 'advisory'))
          return {
            pass: true,
            feedback:
              'Correct. GOV-GLD-01 is a guideline: following it is recommended, ignoring it violates nothing. Over-enforcing guidelines is as damaging as under-enforcing standards — it erodes trust in the whole register.',
          };
        return {
          pass: false,
          feedback:
            'The governing document is GOV-GLD-01 — but check its class. Does its language ("should", "consider") bind anyone, or advise them?',
        };
      },
    },
    {
      id: 'OBJ-M7',
      pillar: 'Detect',
      text: 'Audit the registry: identify the governance gap a policy leaves behind (a policy with no supporting execution layer).',
      topic: 'delegation-chain gap detection',
      context:
        'Auditors hunt for intent that can never be executed. A policy demanding a capability with no standard or procedure behind it is a finding.',
      whereToLook: 'Audit Desk — verify each claim against the cited registry document.',
      anchor: 'C-12, C-8 — gap detection via the delegation chain',
      hints: [
        'For each policy, ask: which standard or procedure operationalizes it?',
        'Check GOV-POL-05. It demands a documented recovery capability and recovery tests.',
        'Search the registry for any disaster-recovery PROCEDURE. What do you find?',
      ],
      check: function (s) {
        if (s.auditChecks['F2'])
          return {
            pass: true,
            feedback:
              'Finding confirmed: GOV-POL-05 (DR Policy) requires documented recovery capability and recovery tests, yet no DR procedure exists anywhere in the registry. Intent without an execution layer is the classic governance gap auditors write up.',
          };
        return {
          pass: false,
          feedback:
            'Not the real gap. Walk the delegation chain: policy → (which standard?) → (which procedure?). One policy has no children.',
        };
      },
    },
    {
      id: 'OBJ-M8',
      pillar: 'Detect',
      text: 'Find the misclassified document: one "standard" in the registry is written as advice. Flag it and state what class it really is.',
      topic: 'misclassification detection',
      context:
        'A standard filed as mandatory but written in advisory language ("should consider", "encouraged") cannot be enforced or audited — a quiet but real defect.',
      whereToLook: "Audit Desk finding F5, then read the cited document's language.",
      anchor: 'C-10, C-13, C-3, C-7 — mandatory vs advisory language',
      hints: [
        'Scan the standards for verbs: "must" binds, "should consider" advises.',
        'GOV-STD-05 never contains a single mandatory verb.',
        'Advisory content filed under a standard code should be a guideline.',
      ],
      check: function (s) {
        if (s.auditChecks['F5'] && s.misfileAnswer === 'guideline')
          return {
            pass: true,
            feedback:
              'Confirmed. GOV-STD-05 uses "should consider" and "encouraged" — advisory language in a mandatory code. It is really a guideline; as filed, auditors would demand evidence of enforcement that was never intended.',
          };
        return {
          pass: false,
          feedback:
            'Flag finding F5 on the Audit Desk, then answer its follow-up: which class uses "should"/"consider" language?',
        };
      },
    },
    {
      id: 'OBJ-M9',
      pillar: 'Decide',
      text: 'Adjudicate R-109 (prop-open door): recognize the conflict with a mandatory standard and route it to the formal exception process.',
      topic: 'exception routing',
      context:
        'Operations will always push against rules. The governed answer is never "sure" and never silent tolerance — it is the exception process.',
      whereToLook: 'Docket window. Then read the exception rule inside GOV-POL-02.',
      anchor: 'C-11, C-4, C-9 — exception handling',
      hints: [
        'Which document forbids propping security doors open?',
        'The request directly conflicts with a mandatory standard — "comply" is impossible.',
        'GOV-POL-02 defines the exception rule: CISO approval, exception register, written acceptance with an expiry date.',
      ],
      check: function (s) {
        if (dockOk(s, 'R-109', 'GOV-STD-04', 'exception'))
          return {
            pass: true,
            feedback:
              'Right call. GOV-STD-04 forbids propping doors; the request is routed to the formal exception process instead of being tolerated informally. Informal exceptions are invisible to auditors and unmanaged risk.',
          };
        return {
          pass: false,
          feedback:
            'The physical rules live in GOV-STD-04, and propping a security door is prohibited — this cannot be stamped COMPLY. Which disposition handles justified deviations?',
        };
      },
    },
    {
      id: 'OBJ-M10',
      pillar: 'Recognize',
      text: 'Match the four data governance roles — data owner, controller, processor, custodian/steward — to their responsibilities.',
      topic: 'data governance roles',
      context:
        'Documents decide WHAT must happen; roles decide WHO is accountable. The registry names owners on every document card.',
      whereToLook: 'Registry document cards list an owner for every document.',
      anchor: 'C-16 — roles and responsibilities',
      hints: [
        'One role approves access and classification; one implements safeguards; one decides purposes of processing; one executes processing under instruction.',
        'The role that APPROVES access is accountable for the data — the data owner.',
        'A vendor doing payroll processing for MFL is a processor; MFL itself is the controller.',
      ],
      check: function (s) {
        var m = s.matchings['m10'] || {};
        var want = { RO: 'owner', RC: 'controller', RP: 'processor', RS: 'custodian' };
        var bad = Object.keys(want).filter(function (k) { return m[k] !== want[k]; });
        if (bad.length === 0)
          return {
            pass: true,
            feedback:
              'Owner decides and approves, controller determines purposes/means, processor executes under instruction, custodian maintains safeguards daily. Notice every registry card names its owner — accountability is embedded in the register.',
          };
        return {
          pass: false,
          feedback:
            'Re-read each responsibility: "approves access/classification" = owner; "decides purposes and means" = controller; "processes on behalf of" = processor; "implements/maintains safeguards" = custodian.',
        };
      },
    },
    {
      id: 'OBJ-M11',
      pillar: 'Recognize',
      text: 'External drivers: match each outside obligation — regulation, industry scheme, customer contract — to the internal document that must absorb it.',
      topic: 'external driver mapping',
      context:
        'Governance documents do not float free: external governance (law, industry schemes, contracts) must be traceable into the internal register.',
      whereToLook: 'Briefing tab → External governance section.',
      anchor: 'C-15 — external considerations mapped inward',
      hints: [
        'Regulatory privacy duties are organizational — they land in the top-level information security policy.',
        'A technical industry scheme about encryption lands in the encryption standard.',
        'A contractual notification deadline is an incident obligation — it lands in the incident response policy.',
      ],
      check: function (s) {
        var m = s.matchings['m11'] || {};
        var want = { D1: 'GOV-POL-02', D2: 'GOV-STD-03', D3: 'GOV-POL-03' };
        var bad = Object.keys(want).filter(function (k) { return m[k] !== want[k]; });
        if (bad.length === 0)
          return {
            pass: true,
            feedback:
              'Traceable: regulation → GOV-POL-02, industry scheme → GOV-STD-03, customer contract → GOV-POL-03. When an external obligation changes, you now know exactly which internal documents to open.',
          };
        return {
          pass: false,
          feedback:
            'Match each obligation to where its SUBJECT lives: privacy duties → information security policy; technical cipher rules → encryption standard; breach notification deadlines → incident response policy.',
        };
      },
    },
    {
      id: 'OBJ-M12',
      pillar: 'Understand',
      text: 'Build the delegation chain: arrange the four elements in the order governance flows from intent to advice.',
      topic: 'delegation chain order',
      context:
        'The chain explains how one sentence of intent becomes daily behavior — and it is the order in which documents are written and audited.',
      whereToLook: 'Briefing tab → the hierarchy diagram.',
      anchor: 'C-8 — hierarchy / delegation chain',
      hints: [
        'Start with the document that management approves first.',
        'Intent is followed by the measurable rule that operationalizes it.',
        'Executable steps come next; recommended tips are the last layer.',
      ],
      check: function (s) {
        var o = s.orders['m12'] || [];
        var ok = o.length === 4 && o[0] === 'p' && o[1] === 's' && o[2] === 'r' && o[3] === 'g';
        if (ok)
          return {
            pass: true,
            feedback:
              'Policy → Standard → Procedure, with Guideline as advisory support. When OBJ-M7 found a policy with no procedure, it was a broken link in exactly this chain.',
          };
        return {
          pass: false,
          feedback:
            'Order: (1) management intent, (2) measurable requirement, (3) executable steps, (4) recommended advice.',
        };
      },
    },
  ];

  // ───────────────────────────── HARD (9) ─────────────────────────────────
  var HARD = [
    {
      id: 'OBJ-H1',
      pillar: 'Apply',
      text: 'Docket storm: adjudicate all six open tickets (R-201…R-206) with exact citations and correct stamps — the queue contains noise and one red herring.',
      topic: 'adjudicating noisy tickets',
      context:
        'Six tickets arrive at once. Some contain irrelevant noise; one is not a governance matter at all. Cite exactly, stamp exactly.',
      whereToLook: '',
      anchor: 'C-2, C-4, C-6, C-9 — application under noise',
      hints: [
        'Five tickets are real governance work; one is not a governance matter at all.',
        'Privileged access, backup ciphers, ransomware first steps, departures — four classes, four documents.',
        'The parking lottery ticket must be stamped NO GOVERNING DOCUMENT — inventing a citation pollutes the register.',
      ],
      check: function (s) {
        var want = [
          ['R-201', 'GOV-STD-02', 'comply'],
          ['R-202', 'GOV-STD-03', 'comply'],
          ['R-203', '', 'none'],
          ['R-204', '', 'exception'],
          ['R-205', 'GOV-PRC-03', 'comply'],
          ['R-206', 'GOV-PRC-02', 'comply'],
        ];
        var bad = want.filter(function (w) {
          var id = w[0], cite = w[1], st = w[2];
          var d = s.dockets[id];
          if (!d || !d.filed || d.stamp !== st) return true;
          var cited = d.cited || '';
          if (id === 'R-204') return !(cited === 'GOV-STD-02');
          return cited !== cite;
        });
        if (bad.length === 0)
          return {
            pass: true,
            feedback:
              'Perfect storm handling: access rules for the contractor (GOV-STD-02), AES-256 for backups (GOV-STD-03), the red herring correctly refused, the VIP MFA request routed to exception, the playbook cited for ransomware, and offboarding cited for the departure. Note R-204 and R-201 share a document — one ticket complies, one conflicts.',
          };
        return {
          pass: false,
          feedback:
            'One or more tickets are wrong or not filed. Filter the noise; ask per ticket: use-rule, measurable rule, ordered steps, or no governance matter at all? Then press "Stamp & file" on every ticket.',
        };
      },
    },
    {
      id: 'OBJ-H2',
      pillar: 'Detect',
      text: 'Full registry audit: exactly three planted defects exist (a gap, a misclassification, a stale review). Confirm exactly those three findings — confirming distractors or missing one fails the audit.',
      topic: 'exact-scope auditing',
      context:
        'A real audit is all-or-nothing: a report that misses a defect or cries wolf over non-defects is rejected.',
      whereToLook: '',
      anchor: 'C-12, C-13, C-14, C-8 — gap, misfile, staleness',
      hints: [
        'One defect is a policy with no supporting procedure; one is advisory language under a standard code.',
        "Check every document card's lastReview date against its reviewCycle.",
        'GOV-STD-01 was last reviewed 2019-03-10 with an "Annual" cycle — seven years stale.',
      ],
      check: function (s) {
        var need = ['F2', 'F5', 'F7'];
        var allTrue = need.every(function (f) { return s.auditChecks[f] === true; });
        var extras = Object.keys(s.auditChecks).filter(function (f) { return s.auditChecks[f] && need.indexOf(f) === -1; });
        if (allTrue && extras.length === 0)
          return {
            pass: true,
            feedback:
              'Clean audit: (1) GOV-POL-05 has no recovery procedure — broken delegation chain; (2) GOV-STD-05 is advisory text filed as a standard — misclassification; (3) GOV-STD-01 last reviewed 2019 against an annual cycle — stale. Three defects, zero false positives.',
          };
        if (allTrue && extras.length > 0)
          return { pass: false, feedback: 'You found all three real defects but also confirmed claims that are false. Verify EVERY finding against its cited document before reporting.' };
        return { pass: false, feedback: 'Incomplete audit — at least one planted defect is unconfirmed. Check gaps (chain), language (misfile) and dates (staleness).' };
      },
    },
    {
      id: 'OBJ-H3',
      pillar: 'Decide',
      text: 'VIP exception adjudication (R-204): complete the full sequence — stamp it, cite the standard, name the approver, and select the required artifact. Steps unlock in order; the sequence itself is graded.',
      topic: 'exception workflow sequence',
      context:
        'This is the exception process end-to-end. Any shortcut (verbal OK, no expiry, wrong approver) is how unmanaged risk enters an organization.',
      whereToLook: '',
      anchor: "C-11, C-4, C-9 — exception workflow under GOV-POL-02's rule",
      hints: [
        'GOV-STD-02 explicitly states: no exemptions for executives or VIPs.',
        'The exception rule in GOV-POL-02 names the approver: the CISO.',
        'The artifact is a written, time-boxed risk acceptance recorded in the exception register.',
      ],
      check: function (s) {
        var h = s.h3;
        var ok =
          h.step >= 4 && h.stamp === 'exception' && h.cited === 'GOV-STD-02' && h.approver === 'ciso' && h.artifact === 'riskaccept';
        if (ok)
          return {
            pass: true,
            feedback:
              'Full sequence executed: exception disposition → GOV-STD-02 cited (which itself forbids VIP exemptions) → CISO as approver per GOV-POL-02 → written risk acceptance with expiry, recorded in the exception register. That is a governed deviation.',
          };
        return {
          pass: false,
          feedback:
            "The sequence is incomplete or wrong. Work the gated steps: stamp → citation → approver → artifact, using GOV-POL-02's exception rule.",
        };
      },
    },
    {
      id: 'OBJ-H4',
      pillar: 'Recognize',
      text: 'Language triage: sort six verbatim registry statements into MANDATORY and ADVISORY bins.',
      topic: 'mandatory vs advisory language',
      context:
        'Enforcement follows verbs, not titles. "Must/shall/required" binds; "should/consider/encouraged/generally a good idea" advises.',
      whereToLook: '',
      anchor: 'C-10, C-1, C-3, C-5, C-7 — mandatory vs advisory language',
      hints: [
        'Two of the six come from guidelines — they are all advisory.',
        'Numbers and approval requirements bind regardless of which document they sit in.',
        '"Must be at least 14 characters" and "badges expire at close of business" are requirements.',
      ],
      check: function (s) {
        var m = s.matchings['h4'] || {};
        var want = { L1: 'mandatory', L2: 'advisory', L3: 'mandatory', L4: 'advisory', L5: 'mandatory', L6: 'advisory' };
        var bad = Object.keys(want).filter(function (k) { return m[k] !== want[k]; });
        if (bad.length === 0)
          return {
            pass: true,
            feedback:
              'All six sorted by language. Note L6 ("generally a good idea") — it lives in GOV-STD-05, the misfiled document from the audit: a whole standard written in guideline verbs is exactly why misclassification matters.',
          };
        return {
          pass: false,
          feedback:
            'Some statements are binned wrongly. Test each: could you discipline someone for ignoring it? If not, it is advisory.',
        };
      },
    },
    {
      id: 'OBJ-H5',
      pillar: 'Understand',
      text: 'Chain trace — laptop encryption: identify the exact policy that intends it, the standard that makes it measurable, and the procedure step that executes it.',
      topic: 'chain tracing a control',
      context:
        'One control, three layers. Being able to walk a control up and down the chain is how auditors and engineers communicate.',
      whereToLook: '',
      anchor: 'C-8, C-4, C-6 — full delegation chain for one control',
      hints: [
        'The intent lives in the policy that declares encryption "at rest and in transit".',
        'The measurable clause names the algorithm and the key vault.',
        'The execution step is inside onboarding: encryption enabled before handover.',
      ],
      check: function (s) {
        var m = s.matchings['h5'] || {};
        var ok = m['policy'] === 'GOV-POL-02' && m['clause'] === 'aes256' && m['step'] === 'provision';
        if (ok)
          return {
            pass: true,
            feedback:
              'GOV-POL-02 intends it, GOV-STD-03 makes it measurable (AES-256, keys in the HSM vault), GOV-PRC-02 executes it (encryption enabled before laptop handover). A complete chain is what turns intent into verifiable behavior.',
          };
        return {
          pass: false,
          feedback:
            'Match each layer: intent (policy) → measurable clause with algorithm + key storage (standard) → ordered execution step (procedure).',
        };
      },
    },
    {
      id: 'OBJ-H6',
      pillar: 'Apply',
      text: 'Offboarding under pressure: sequence the five GOV-PRC-02 offboarding steps in order, then identify which standard the sequence enforces.',
      topic: 'offboarding sequence',
      context:
        'A departure is a live access event. Wrong order (e.g., recovering the badge before disabling accounts) leaves windows of exposure.',
      whereToLook: '',
      anchor: 'C-6, C-4 — offboarding procedure and its enforcing standard',
      hints: [
        'First the manager reports the departure; access removal comes before asset recovery.',
        'Certificates and vault keys are revoked before the data-owner recertification.',
        'The 24-hour revocation rule that the sequence enforces lives in the access control standard.',
      ],
      check: function (s) {
        var o = s.orders['h6'] || [];
        var okOrder =
          o.length === 5 && o[0] === 'notify' && o[1] === 'disable' && o[2] === 'recover' && o[3] === 'revoke' && o[4] === 'recert';
        var okStd = (s.matchings['h6s'] || {})['std'] === 'GOV-STD-02';
        if (okOrder && okStd)
          return {
            pass: true,
            feedback:
              "Correct: notify → disable accounts/tokens → recover badges & assets → revoke certificates & vault keys → data-owner recertification within 30 days. The sequence executes GOV-STD-02's 24-hour revocation rule.",
          };
        if (!okOrder)
          return { pass: false, feedback: 'Order is wrong. Access dies FIRST (disable accounts), assets and keys follow, recertification closes the loop.' };
        return { pass: false, feedback: 'The order is right but the enforcing standard is misidentified — which standard states the revocation deadline?' };
      },
    },
    {
      id: 'OBJ-H7',
      pillar: 'Understand',
      text: 'External governance mapping: route all four outside drivers — privacy regulation, industry telemetry scheme, contractual breach notice, regional labor rules — into the internal documents that must absorb them.',
      topic: 'external governance mapping',
      context:
        'Every external obligation must be traceable to an internal owner document, or compliance becomes unmanageable.',
      whereToLook: '',
      anchor: 'C-15, C-2 — external considerations mapped inward',
      hints: [
        'Organizational privacy duties land in the umbrella information security policy.',
        'Technical cipher requirements for telemetry land in the encryption standard.',
        'Notification deadlines are incident-response business; labor rules shape onboarding.',
      ],
      check: function (s) {
        var m = s.matchings['h7'] || {};
        var want = { E1: 'GOV-POL-02', E2: 'GOV-STD-03', E3: 'GOV-POL-03', E4: 'GOV-PRC-02' };
        var bad = Object.keys(want).filter(function (k) { return m[k] !== want[k]; });
        if (bad.length === 0)
          return {
            pass: true,
            feedback:
              "Four drivers, four traceable landing spots. When the next regulation lands, this map is your first-hour checklist — and it is exactly how OBJ-H9's change memo was built.",
          };
        return {
          pass: false,
          feedback:
            'Match by subject: privacy → security policy; ciphers → encryption standard; breach-notice deadline → incident response policy; new-hire labor rules → onboarding procedure.',
        };
      },
    },
    {
      id: 'OBJ-H8',
      pillar: 'Detect',
      text: 'Incident drill: from the ransomware playbook, select the correct FIRST THREE containment actions in order — then name who GOV-POL-03 requires MFL to escalate to for cargo-system incidents.',
      topic: 'playbook execution under pressure',
      context:
        'Playbooks fail under stress unless the order is muscle memory. Wrong first action (e.g., reimaging before preserving evidence) destroys the case.',
      whereToLook: '',
      anchor: 'C-6 (playbooks), C-2 (IR policy) — procedure execution + policy escalation rule',
      hints: [
        'STEP 1 protects everything else from being destroyed.',
        "Reporting comes before evidence handling; reimagining is never in the first three.",
        'GOV-POL-03 names the escalation body for incidents touching dispatch or cargo systems.',
      ],
      check: function (s) {
        var o = s.orders['h8'] || [];
        var okOrder = o.length === 3 && o[0] === 'isolate' && o[1] === 'report' && o[2] === 'preserve';
        var okWho = (s.matchings['h8n'] || {})['who'] === 'committee';
        if (okOrder && okWho)
          return {
            pass: true,
            feedback:
              "Isolate → report to CISO (1-hour rule) → preserve volatile evidence, then escalate cargo-system incidents to the Security Governance Committee. Procedure executes the policy's escalation intent — chain intact under fire.",
          };
        if (!okOrder)
          return { pass: false, feedback: "The order is wrong. Isolation first, then the policy's reporting duty, then evidence preservation — reimage is never first." };
        return { pass: false, feedback: 'Sequence right, escalation wrong: GOV-POL-03 names the body for cargo/dispatch incidents.' };
      },
    },
    {
      id: 'OBJ-H9',
      pillar: 'Decide',
      text: 'Change memo triage: a new regulation requires breach notification within 48 hours; GOV-POL-03 currently allows 72. Select the two documents that must change — in the correct amendment order — and leave everything else untouched.',
      topic: 'regulatory change amendment order',
      context:
        'External change propagates through the chain: intent first (policy), then the executable layer that references it (playbook). Touching only the playbook would leave the register internally contradictory.',
      whereToLook: '',
      anchor: 'C-18, C-8, C-15 — regulatory change propagating down the chain',
      hints: [
        'The obligation itself is stated in the policy — that document changes first.',
        'Then every procedure that operationalizes the old deadline must follow.',
        'Guidelines and unrelated policies are untouched — do not over-amend.',
      ],
      check: function (s) {
        var m = s.matchings['h9'] || {};
        var ok = m['first'] === 'GOV-POL-03' && m['second'] === 'GOV-PRC-03';
        if (ok)
          return {
            pass: true,
            feedback:
              'GOV-POL-03 first (the 72-hour clause is the policy commitment), then GOV-PRC-03 (the playbook that executes notification). Amendment order keeps the register coherent: intent updated before execution.',
          };
        return {
          pass: false,
          feedback:
            'Select exactly two documents, in order: the policy carrying the old deadline, then the procedure that operationalizes it. Anything else is over-amendment.',
        };
      },
    },
  ];

  return { MEDIUM: MEDIUM, HARD: HARD };
})();

// Objectives whose inline answers lock after CHECK RESULTS (rule R2).
var LOCKING_OBJECTIVES = new Set([
  'OBJ-M1', 'OBJ-M2', 'OBJ-M3', 'OBJ-M7', 'OBJ-M8', 'OBJ-M10', 'OBJ-M11', 'OBJ-M12',
  'OBJ-H2', 'OBJ-H3', 'OBJ-H4', 'OBJ-H5', 'OBJ-H6', 'OBJ-H7', 'OBJ-H8', 'OBJ-H9',
]);

// Same rule as the original: medium → 12 objectives, hard → 9.
function objectivesForMode(mode) {
  return mode === 'medium' ? window.LAB_OBJECTIVES.MEDIUM : window.LAB_OBJECTIVES.HARD;
}
