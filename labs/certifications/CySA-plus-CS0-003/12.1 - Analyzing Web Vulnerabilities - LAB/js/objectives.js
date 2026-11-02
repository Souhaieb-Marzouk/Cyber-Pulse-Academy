// CyberLab 12.1 — objective definitions + validators
// Static port of src/lib/cyberlab/objectives.ts — identical tasks, hints,
// feedback texts and check functions (1:1 content parity, audit fixes included).
window.CyberLab = window.CyberLab || {};
(function (CL) {
  'use strict';

  // ---------- validation helpers (ported from types.ts) ----------
  const norm = (s) => String(s ?? '').trim().toLowerCase();
  const isStrEqual = (a, expected) => norm(a) === expected.toLowerCase();
  const isSetEqual = (a, expected) => {
    if (!Array.isArray(a)) return false;
    const set = new Set(a.map((x) => String(x)));
    return set.size === expected.length && expected.every((e) => set.has(e));
  };
  /** Medium-tolerant set check: all `must` present, nothing outside `allowed`. */
  const isSubsetWithin = (a, must, allowed) => {
    if (!Array.isArray(a)) return false;
    const set = new Set(a.map((x) => String(x)));
    return must.every((m) => set.has(m)) && [...set].every((s) => allowed.includes(s));
  };
  const isMapEqual = (a, expected) => {
    if (typeof a !== 'object' || a === null) return false;
    return Object.entries(expected).every(([k, v]) => a[k] === v);
  };
  const isBoolMap = (a, expected) => {
    if (typeof a !== 'object' || a === null) return false;
    return Object.entries(expected).every(([k, v]) => Boolean(a[k] ?? false) === v);
  };

  const D = CL.DATA;

  const triageExpected = (mode) => {
    const out = {};
    D.ALERTS.filter((a) => a.modes.includes(mode)).forEach((a) => { out[a.id] = a.truth; });
    return out;
  };
  const mapOf = (arr, keyFn, valFn) => {
    const out = {};
    arr.forEach((x) => { out[keyFn(x)] = valFn(x); });
    return out;
  };

  // ---------- Medium — 12 objectives (P1×3, P2×4, P3×3, P4×2) ----------
  const medium = [
    {
      id: 'OBJ-M1',
      instrument: 'toolrack',
      title: 'Sort the tool rack',
      task: 'Assign each of the 8 instruments on the Tool Rack to its correct category (SAST, DAST, fuzzer, debugger/RE, or generalized network scanner).',
      pillar: 'P1',
      anchor: 'Lesson: "web application scanners… static and dynamic code analysis, fuzzing, reverse engineering… debuggers"',
      hints: [
        'Ask two questions: does it read source, or does it talk to a running target? And does it target the network, the web app, or a binary?',
        'Nessus is the only one that scans hosts and services rather than application logic.',
        'Nikto talks to web servers (dynamic). Ghidra disassembles binaries — it belongs with gdb.',
      ],
      success:
        'Correct. SAST reads source, DAST attacks the running web app, fuzzers feed malformed input, debuggers/RE tools open binaries, and generalized scanners map hosts and services. Knowing which lane each tool drives in is the core skill of this lesson.',
      fail: 'Not yet — reconsider each tool by what it actually touches: source code, the running web app, malformed input, the binary, or the network. Nothing is deleted; adjust and re-check.',
      check: (ans) => isMapEqual(ans, D.M1_EXPECT),
    },
    {
      id: 'OBJ-M2',
      instrument: 'toolrack',
      title: 'General vs specialized coverage',
      task: 'Six findings came from this week. Mark the three that the generalized network scanner already reported — the others are the ones ONLY the web application scanner could surface.',
      pillar: 'P1',
      anchor: 'Lesson: "vulnerabilities that generalized vulnerability scanning tools often miss"',
      hints: [
        'Which findings require understanding of parameters, credentials, or application behavior?',
        'A port scanner can read banners and negotiate TLS — but it cannot change an id parameter.',
        'g4, g5 and g6 all require interacting with the application itself.',
      ],
      success:
        'Exactly. The general scanner mapped the host (ports, banner, TLS). The parameter manipulation, payload reflection and default credentials are invisible without app-layer testing — that is the scanner gap the lesson is about.',
      fail: 'Look again: a network scanner can fingerprint services and protocols, but it never fills in a form, flips a record id, or tries factory credentials. Adjust your three picks.',
      check: (ans) => isSetEqual(ans, D.M2_FINDINGS.filter((f) => f.byGeneral).map((f) => f.id)),
    },
    {
      id: 'OBJ-M3',
      instrument: 'sast',
      title: 'Static analysis pass',
      task: 'In the SAST unit, open src/db/records.js, click the exact line where untrusted input is concatenated into a SQL statement, and classify the flaw.',
      pillar: 'P2',
      anchor: 'Lesson: "static … code analysis" to identify vulnerabilities within web applications',
      hints: [
        'Follow the data: req.query.id travels from the request into… what?',
        'The dangerous line builds the SQL string by gluing user input between quotes.',
        'Line 12: SELECT * FROM patients WHERE id = \'" + id + "\' — classic injection sink.',
      ],
      success:
        'Line 12 is a textbook SQL injection sink: the id parameter is concatenated straight into the query. Parameterized queries (see billing.js) would make injection structurally impossible. This is what static analysis catches before the code ever ships.',
      fail: 'Trace the untrusted value from req.query.id to where it changes the meaning of a SQL statement. Click the exact line, then pick the flaw class.',
      check: (ans) => {
        const rec = ans;
        return !!rec && typeof rec === 'object' && rec.file === D.M3_SINK.file && Number(rec.line) === D.M3_SINK.line && rec.flaw === 'sqli';
      },
    },
    {
      id: 'OBJ-M4',
      instrument: 'dast',
      title: 'Dynamic scan pass',
      task: 'Run the DAST crawl, then the active scan, and identify the single highest-severity confirmed application flaw in the alert table.',
      pillar: 'P2',
      anchor: 'Lesson: "dynamic … analysis" against the running web application',
      hints: [
        'Crawl first: the active scan only attacks URLs the crawler discovered.',
        'Several alerts are high; only one is a confirmed app flaw with data exposure.',
        'The SQL injection in /records?id= returned 214 patient rows — that is the one.',
      ],
      success:
        'The SQL injection is the top finding: pre-auth reachable, exposes the whole patient table, and chains with the verbose errors. Ranking findings by exploitability (precondition × impact) is exactly the triage judgment the exam and the SOC expect.',
      fail: 'Run the crawl and active scan first, then read the alert table. You are looking for the flaw an attacker could use from the internet without credentials.',
      check: (ans, env) => isStrEqual(ans, D.M4_ANSWER) && env.scanDone,
    },
    {
      id: 'OBJ-M5',
      instrument: 'triage',
      title: 'Triage the queue',
      task: 'On the Triage board, mark every alert as TP (true positive) or FP (false positive). You will be judged on all ten rows.',
      pillar: 'P3',
      anchor: 'Lesson: identify vulnerabilities; detection includes rejecting what the tool got wrong',
      hints: [
        'For each FP the detail line already names the evidence that disproves it — match it against the source you saw in the SAST unit.',
        '/search uses a bound parameter (search.js line 7) — its injection alert is false.',
        'The User-Agent value only lands in server logs; nothing renders it.',
      ],
      success:
        'Clean triage. True positives get tickets with evidence; false positives get closed with a justification. Both directions need proof — that is what makes a scanner actionable instead of noisy.',
      fail: 'Re-read each detail line and cross-check against the SAST unit: parameterized query = the /search SQLi is false; log-only reflection = the User-Agent XSS is false.',
      check: (ans) => isMapEqual(ans, triageExpected('medium')),
    },
    {
      id: 'OBJ-M6',
      instrument: 'fuzz',
      title: 'Fuzz the parameter',
      task: 'Run the fuzzer against GET /api/records?id= with the injection payload set, then pick the one payload whose response proves the endpoint is returning data it should not.',
      pillar: 'P2',
      anchor: 'Lesson: "fuzzing" to identify vulnerabilities',
      hints: [
        'Compare every row against the baseline: status, length, and row count.',
        'One payload returns an HTTP 200 that is ~4× larger than baseline.',
        "' OR '1'='1 turns the WHERE clause into “always true” — 214 rows.",
      ],
      success:
        "' OR '1'='1 returned the entire table — in-band evidence of injection. Note the pair 1001 AND 1=1 vs 1 AND 1=2: a boolean differential that would prove blind injection even with errors suppressed. One parameter, three proof techniques.",
      fail: 'Run the fuzzer first, then compare each response to the 1187-byte baseline. You are hunting for the row that returns far more data than one record.',
      check: (ans, env) => isStrEqual(ans, D.M6_ANSWER) && env.fuzzRuns > 0,
    },
    {
      id: 'OBJ-M7',
      instrument: 'debug',
      title: 'Debug the binary',
      task: 'In the Debug unit: attach to portal-agent, set a breakpoint on auth_check, run, inspect the locals, step into the maintenance handler, and enter the hidden route the debugger reveals.',
      pillar: 'P2',
      anchor: 'Lesson: "debuggers allow analysts to … reveal details regarding how a piece of software operates"',
      hints: [
        'The state machine walks you through: attach → breakpoint → run → step.',
        'After stepping, read the strings panel — one starred entry is a path.',
        'The route starts with /internal/.',
      ],
      success:
        'The breakpoint froze auth_check mid-flight and stepping exposed /internal/migrate — a maintenance route that only exists while DBG_MODE=1. This is the lesson’s point about debuggers: they reveal how the software *actually* operates, including behavior its authors hoped you would not notice.',
      fail: 'The route is revealed only after the debugger reaches the “revealed” state. Work the state machine: attach, breakpoint on auth_check, run, inspect locals, step.',
      check: (ans, env) => isStrEqual(ans, D.M7_ANSWER) && env.debugState === 'revealed',
    },
    {
      id: 'OBJ-M8',
      instrument: 'toolrack',
      title: 'Right technique for the job',
      task: 'On the Tool Rack, match each of the three scenarios to the analysis technique you would deploy first.',
      pillar: 'P1',
      anchor: 'Lesson: choose among static, dynamic, fuzzing, reverse engineering/debugging',
      hints: [
        'No source code but a live URL → dynamic.',
        'Crash on malformed input → fuzzing.',
        'Suspect hidden runtime behavior in a binary → debugger.',
      ],
      success:
        'Correct. No source → DAST; crashes on weird input → fuzzing; hidden behavior in a stripped binary → debugger. Note the pattern: the constraint (source? live? binary?) picks the technique.',
      fail: 'Anchor on each scenario’s constraint: is source available, is the target running, does the fault need malformed input, or must you observe the binary at runtime?',
      check: (ans) => isMapEqual(ans, mapOf(D.M8_SCENARIOS, (s) => s.id, (s) => s.answer)),
    },
    {
      id: 'OBJ-M9',
      instrument: 'config',
      title: 'Configuration sweep',
      task: 'In the Config probe (headers / nginx / admin tabs), select every configuration issue that is actually present. Distractors are deliberate — only flag real ones.',
      pillar: 'P3',
      anchor: 'Lesson: "detect configuration issues and exploitable security misconfigurations"',
      hints: [
        'Cross-check each statement against the three evidence tabs before flagging it.',
        '“X-Frame-Options present”, “TLS 1.2/1.3 offered”, “HTTP→HTTPS redirect” describe healthy settings.',
        'The six real issues span all three tabs: creds, debug route, cookie flags, stack traces, autoindex, TLS 1.0/1.1.',
      ],
      success:
        'All six confirmed. (The absent security headers are a valid extra finding — a Low.) Each one is exploitable or chains into something bigger, which is why misconfiguration review is part of vulnerability analysis, not an afterthought.',
      fail: 'Verify each candidate against the evidence tabs. Flag what IS present and wrong; leave what is present and fine, and what is not present at all.',
      check: (ans) => {
        const rec = ans;
        return isSubsetWithin(
          rec && typeof rec === 'object' ? rec.configs : null,
          D.CONFIG_ITEMS.filter((c) => c.misconfig && !c.hard).map((c) => c.id),
          D.CONFIG_ITEMS.filter((c) => c.misconfig).map((c) => c.id),
        );
      },
    },
    {
      id: 'OBJ-M10',
      instrument: 'triage',
      title: 'Map findings to fixes',
      task: 'On the Triage board’s Remediation tab, map each of the five confirmed findings to its correct fix.',
      pillar: 'P4',
      anchor: 'Lesson outcome: mitigation planning for identified web vulnerabilities',
      hints: [
        'Injection dies at the query structure, not at the network edge.',
        'XSS dies at output encoding; IDOR dies at an ownership check.',
        'Default credentials → rotate + MFA; verbose errors → generic pages.',
      ],
      success:
        'Every fix targets the flaw’s root cause. WAF-only or input-length tricks would leave the structural weakness in place — defenders fix classes of bugs, not instances.',
      fail: 'Ask for each finding: what would make this impossible rather than merely harder? Adjust the mappings.',
      check: (ans) => isMapEqual(ans, mapOf(D.M10_ITEMS, (i) => i.id, (i) => i.fix)),
    },
    {
      id: 'OBJ-M11',
      instrument: 'triage',
      title: 'Assign remediation ownership',
      task: 'In the Remediation tab, classify all six actions by who owns them: Dev (code change), Infra (config change), or Process (security program).',
      pillar: 'P4',
      anchor: 'Lesson outcome: turning findings into an executed remediation plan',
      hints: [
        'If it changes code, it is Dev. If it changes a setting, it is Infra.',
        'Scanning schedules and intake channels are program activities.',
      ],
      success:
        'Correct ownership is what makes findings actually close: a SQLi assigned to infra dies in ticket ping-pong. Note the split — code fixes, config fixes, and program controls each move at different speeds.',
      fail: 'Sort by the nature of the change: source code → Dev; server/protocol settings → Infra; recurring program activities → Process.',
      check: (ans) => isMapEqual(ans, mapOf(D.M11_ITEMS, (i) => i.id, (i) => i.owner)),
    },
    {
      id: 'OBJ-M12',
      instrument: 'dast',
      title: 'Plan a safe scan',
      task: 'In the DAST unit’s Pre-flight card, configure the quarterly scan plan: enable the four safe practices and leave the three unsafe ones off.',
      pillar: 'P3',
      anchor: 'Operationalizing "web application scanners… allow organizations to search for" vulnerabilities responsibly',
      hints: [
        'Authorized, scheduled, staged, read-only — those are the safe words.',
        'Production + business hours + real patient data + data-changing exploits are never part of a plan.',
      ],
      success:
        'A scanner is a loaded tool: scope documents, staging targets, test accounts, maintenance windows and synthetic data are what keep it a defensive instrument. This is exactly how professional assessments are run.',
      fail: 'Reconsider any toggle that scans production aggressively, uses real patient data, or allows data-changing exploits without authorization.',
      check: (ans) => isBoolMap(ans, mapOf(D.SCAN_PLAN, (s) => s.id, (s) => s.ok)),
    },
  ];

  // ---------- Hard — 9 objectives (P1×1, P2×2, P3×4, P4×2) ----------
  const hard = [
    {
      id: 'OBJ-H1',
      instrument: 'triage',
      title: 'Signal from noise — full queue',
      task: 'The triage queue holds 14 alerts, including imported scan reports and deliberate red herrings. Mark every row TP or FP; all 14 judgments must be correct.',
      pillar: 'P3',
      anchor: 'Lesson: identify vulnerabilities *within web applications* — and reject out-of-scope noise',
      hints: [
        'Scope first: dev-old.staging…, the build agent 10.30.7.44, and the mail host are not the in-scope application.',
        'The /records XSS red herring fails on execution context: comment + integer cast.',
        'Stale scanner cache on /assets/ — the April hardening already fixed it.',
      ],
      success:
        '14/14. You kept the six actionable truths and killed eight false alarms — out-of-scope hosts, stale caches, and context errors. A queue defended like this is one a launch board can actually act on.',
      fail: 'Not all 14 correct yet. Scope: only staging.meridiancare.example is in scope. Then re-check each claim against evidence (source, response cache, execution context).',
      check: (ans) => isMapEqual(ans, triageExpected('hard')),
    },
    {
      id: 'OBJ-H2',
      instrument: 'fuzz',
      title: 'Prove the injection',
      task: 'From the fuzz table, select: (1) the error-based payload, (2) the boolean-true probe, (3) the boolean-false probe, (4) the data-exposure payload — then pick the fix that removes the flaw class.',
      pillar: 'P2',
      anchor: 'Fuzzing + static remediation: identify, prove, and fix',
      hints: [
        'Error-based = a 500 with a SQL syntax message.',
        'Boolean pair = identical requests one bit apart, different response shapes.',
        'The fix must make injection structurally impossible — placeholders, not filtering.',
      ],
      success:
        'Four proof techniques from one parameter: error-based (p2), boolean differential (p4/p5), in-band exposure (p3) — and the only fix that removes the class: parameterized queries. This is the full analytical arc of dynamic testing.',
      fail: 'Re-read the table row by row: a 500 with SQL text; two same-length-but-different-shape responses; one 4× oversized 200. The fix options contain two convincing near-misses — pick the structural one.',
      check: (ans) =>
        isMapEqual(ans, {
          error: 'p2',
          pairTrue: 'p4',
          pairFalse: 'p5',
          exposure: 'p3',
          fix: 'fix_param',
        }),
    },
    {
      id: 'OBJ-H3',
      instrument: 'target',
      title: 'The silent logic flaw',
      task: 'Open the Target browser’s API page, exercise the id sequence, then decide: (1) the control that actually stops IDOR, (2) why scanners only flag it heuristically, (3) the verification a human must run.',
      pillar: 'P3',
      anchor: 'Business-logic vulnerabilities that generalized tooling misses — the lesson’s boundary case',
      hints: [
        'UUIDs and WAF patterns obscure the identifier; they do not check ownership.',
        'The scanner saw the symptom (sequential ids work) but cannot know who SHOULD access what.',
        'Two accounts, one request: A must not read B.',
      ],
      success:
        'Object-level authorization is the only real fix; scanners surface the pattern but exploitability is a human judgment; the two-account test is the verification. This is the hard boundary of automated analysis — exactly what your lesson says specialized tools still need analysts for.',
      fail: 'Reconsider: which control verifies *permission*, not *obfuscation*? Which answer explains why a tool cannot know intended access? Which test produces that knowledge?',
      check: (ans) =>
        isMapEqual(ans, { control: 'ctl_authz', missed: 'miss_logic', verify: 'ver_twoacct' }),
    },
    {
      id: 'OBJ-H4',
      instrument: 'debug',
      title: 'Break it open',
      task: 'Drive the debugger to the revealed state, then report all three extracted artifacts: the embedded service credential, the hidden route, and the operational impact of DBG_MODE=1.',
      pillar: 'P2',
      anchor: 'Debuggers revealing "details regarding how a piece of software operates"',
      hints: [
        'The credential is in the strings table in user:pass form.',
        'The route is the starred path — the same one from Medium, but now with its blast radius.',
        'Impact option 1 describes the destructive maintenance capability.',
      ],
      success:
        'svc_admin:M3r1dian#1972 + /internal/migrate + a schema-dropping maintenance route: a complete unauthenticated compromise chain found by reading a binary at runtime. This is why debug artifacts never belong in release builds — and why RE is a defensive skill worth having.',
      fail: 'Drive the debug state machine to “revealed”, then read the strings panel. All three answers are on the bench — exact values required.',
      check: (ans, env) => {
        if (env.debugState !== 'revealed' || typeof ans !== 'object' || ans === null) return false;
        return (
          isStrEqual(ans.cred, 'svc_admin:M3r1dian#1972') &&
          isStrEqual(ans.route, D.M7_ANSWER) &&
          ans.impact === 'impact_migrate'
        );
      },
    },
    {
      id: 'OBJ-H5',
      instrument: 'config',
      title: 'Hardening plan',
      task: 'Select ALL seven real misconfigurations (the Medium six plus one), then rank the top three by exploitability: pre-auth remote control first, unauthenticated destructive capability second, information disclosure that feeds further attacks third.',
      pillar: 'P3',
      anchor: '"configuration issues and exploitable security misconfigurations" — prioritized',
      hints: [
        'The seventh item hides in the HTTP headers tab — three absent headers, one finding.',
        'Exploitability = precondition × impact. What can an unauthenticated stranger do from the internet?',
        'Ranking: factory admin creds → unauth maintenance route → stack traces.',
      ],
      success:
        'Seven confirmed, ranked by how directly a remote attacker can exploit them. Priority = precondition (pre-auth?) × impact (full control?). The headers omission is Low on its own but belongs on the ticket — defense in depth is cumulative.',
      fail: 'Seven items are real (six plus the headers finding). For the ranking, ask for each: does it need credentials? what does it grant? what does it enable next?',
      check: (ans) => {
        if (typeof ans !== 'object' || ans === null) return false;
        const all = D.CONFIG_ITEMS.filter((c) => c.misconfig).map((c) => c.id);
        // ranking is order-sensitive: the task says RANK by exploitability, so position must match
        const ranked =
          Array.isArray(ans.top3) && ans.top3.length === 3 && ans.top3.every((t, i) => t === D.H5_TOP3[i]);
        return isSetEqual(ans.configs, all) && ranked;
      },
    },
    {
      id: 'OBJ-H6',
      instrument: 'triage',
      title: 'Contain, then fix',
      task: 'The SQLi code fix is two sprints out. Sequence the four containment steps correctly, then pick the only acceptable compensating-control arrangement.',
      pillar: 'P4',
      anchor: 'Mitigation with trade-offs: interim control vs permanent fix',
      hints: [
        'Contain outward-in: network-level virtual patch first, then blast-radius reduction, then detection, then the permanent fix.',
        'A compensating control without an owner and an expiry date is just an excuse.',
        'Taking a patient portal fully offline is a business decision no analyst makes unilaterally.',
      ],
      success:
        'Virtual patch → least privilege → detection → permanent fix, with a WAF rule that has an owner and an expiry: containment that shrinks risk without pretending the flaw is gone. The near-misses fail exactly the way real programs fail — “accept and forget” and “break the business”.',
      fail: 'Order the steps by what they buy you: stop the exploit, shrink the blast radius, see further attempts, then remove the flaw. Then reject any compensating control that is unowned, unbounded, or business-disproportionate.',
      check: (ans) =>
        isMapEqual(ans, {
          s1: 'st1',
          s2: 'st2',
          s3: 'st3',
          s4: 'st4',
          compensating: 'comp_waflog',
        }),
    },
    {
      id: 'OBJ-H7',
      instrument: 'toolrack',
      title: 'Coverage gap analysis',
      task: 'Mark which three areas this scan campaign did NOT cover, and choose the follow-up technique that closes the most gaps at once.',
      pillar: 'P1',
      anchor: 'Understanding what each analysis technique can and cannot see',
      hints: [
        'The campaign was an unauthenticated DAST pass plus a host scan.',
        'What did it never log into? What logic could it not judge? What client code never got parsed?',
        'More threads on the same blind scan is still blind.',
      ],
      success:
        'Authenticated flows, business logic, and client-side/DOM are the classic blind spots of an unauthenticated scanner — and an authenticated scan plus manual logic testing closes all three. Knowing the edges of your own coverage is what separates an analyst from a report-forwarder.',
      fail: 'Ports and TLS were covered (by the generalized scanner and the config probe). What was NOT: anything behind the login, any ownership judgment, anything running in the browser.',
      check: (ans) => {
        if (typeof ans !== 'object' || ans === null) return false;
        return (
          isSetEqual(ans.gaps, D.COVERAGE_ITEMS.filter((c) => c.gap).map((c) => c.id)) &&
          ans.next === 'next_authmanual'
        );
      },
    },
    {
      id: 'OBJ-H8',
      instrument: 'triage',
      title: 'Defensible triage',
      task: 'For each of five contested alerts, choose the verdict (TP/FP) AND the single piece of evidence on the bench that proves it. Verdicts and proofs must both be right.',
      pillar: 'P3',
      anchor: 'Detection judgment: true vs false positives with verification evidence',
      hints: [
        'Evidence types: source line, code path, fuzz differential, two-account test, raw HTTP response.',
        'Banner evidence proves nothing — that option is the trap.',
        'The /search SQLi dies by placeholder; the UA XSS dies by code path.',
      ],
      success:
        'Five verdicts, five proofs. This is what “defensible” means in a SOC: when the app owner challenges your ticket, you hand them a source line or an HTTP diff, not an opinion. Banner-only evidence is the classic shortcut that collapses under challenge.',
      fail: 'Pair each verdict with bench evidence: billing/search source for parameterization, code path for the UA header, fuzz table for /records, two-account test for IDOR, raw response for listing.',
      check: (ans) => {
        if (typeof ans !== 'object' || ans === null) return false;
        return D.H8_ITEMS.every((i) => ans[i.id] && ans[i.id].v === i.verdict && ans[i.id].p === i.proof);
      },
    },
    {
      id: 'OBJ-H9',
      instrument: 'triage',
      title: 'Go / no-go call',
      task: 'The launch board wants your recommendation. Mark the findings that block the launch, choose the verdict, and pick the one rationale that will survive scrutiny.',
      pillar: 'P4',
      anchor: '"exploitable security misconfigurations" driving a risk decision',
      hints: [
        'Blocking = unauthenticated + critical impact + no realistic compensation by launch day.',
        'A Low header finding does not stop a launch; a pre-auth table dump does.',
        'Waivers need the risk to be compensable — check whether it is.',
      ],
      success:
        'NO-GO with the three pre-auth blockers — and the chain rationale is the one that holds: a waiver cannot compensate what an attacker can do from the internet with zero credentials. Delivering this call is the moment the bench was built for.',
      fail: 'Blockers are the findings an unauthenticated attacker can weaponize immediately. The correct verdict has exactly one rationale that addresses severity, precondition, and the failure of compensation.',
      check: (ans) => {
        if (typeof ans !== 'object' || ans === null) return false;
        return (
          isSetEqual(ans.blocked, D.GO_CANDIDATES.filter((g) => g.blocking).map((g) => g.id)) &&
          ans.verdict === 'nogo' &&
          ans.rationale === 'r_chain'
        );
      },
    },
  ];

  const OBJECTIVES = { medium, hard };
  const OBJ_BY_ID = {};
  medium.concat(hard).forEach((o) => { OBJ_BY_ID[o.id] = o; });

  function objectivesFor(mode) {
    return OBJECTIVES[mode] || [];
  }

  function envSnapshotOf(s) {
    return { crawlDone: s.crawlDone, scanDone: s.scanDone, fuzzRuns: s.fuzzRuns, debugState: s.debugState };
  }

  CL.OBJECTIVES = OBJECTIVES;
  CL.OBJ_BY_ID = OBJ_BY_ID;
  CL.objectivesFor = objectivesFor;
  CL.envSnapshotOf = envSnapshotOf;
  CL.PILLAR_META = {
    P1: { label: 'Understand', short: 'U' },
    P2: { label: 'Recognize / Analyze', short: 'R' },
    P3: { label: 'Detect / Triage', short: 'D' },
    P4: { label: 'Mitigate', short: 'M' },
  };
})(window.CyberLab);
