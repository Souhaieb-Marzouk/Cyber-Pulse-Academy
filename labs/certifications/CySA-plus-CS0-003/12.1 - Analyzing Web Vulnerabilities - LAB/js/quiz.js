// CyberLab 12.1 — knowledge check banks (C5)
// Static port of src/lib/cyberlab/quiz.ts — 1:1 content parity.
// Audit rebuild carried over: correct-answer position rotates (R4), option
// lengths balanced (R5), explanations cover the distractors (R6/QA-7),
// `topic` powers the completion report's focus areas (R8/QA-10).
window.CyberLab = window.CyberLab || {};
(function (CL) {
  'use strict';

  const QUIZ = {
    medium: [
      {
        id: 'q1',
        topic: 'the scanner coverage gap (generalized vs web application scanners)',
        prompt: 'What do web application scanners test that generalized vulnerability scanners typically miss?',
        // correct index 2 — rotation plan M: 2,0,3,1,0,2
        options: [
          'Open ports and running services on a host',
          'Outdated software banners and missing patches',
          'Flaws hidden in parameters, forms and session logic',
          'The physical layout of the data center',
        ],
        correct: 2,
        explain:
          'Correct: the application layer — parameters, forms, sessions and logic — is exactly where web app scanners probe and where host-oriented scanners are blind. Option A and B are host-level recon (ports, banners, patch level) that a generalized scanner already covers; option D is irrelevant to any networked scanner.',
      },
      {
        id: 'q2',
        topic: 'static vs dynamic analysis (SAST / DAST)',
        prompt: 'Which statement about SAST and DAST is correct?',
        options: [
          'SAST reads source unexecuted; DAST attacks the running application',
          'SAST attacks the running application; DAST reads source code',
          'Both techniques demand the full source code be present',
          'Neither technique can ever produce false positives for analysts',
        ],
        correct: 0,
        explain:
          'Correct: static = source without execution, dynamic = the live app from the outside. Option B swaps the two definitions; option C fails because DAST needs no source at all; option D fails because SAST routinely flags patterns that are not exploitable — false positives a human must confirm.',
      },
      {
        id: 'q3',
        topic: 'fuzzing fundamentals',
        prompt: 'Fuzzing is best described as…',
        options: [
          'Scanning repositories for vulnerable open-source libraries',
          'Guessing passwords against the login page repeatedly',
          'Load-testing servers to measure response-time ceilings',
          'Feeding malformed input to trigger unexpected crashes',
        ],
        correct: 3,
        explain:
          'Correct: a fuzzer mutates or generates inputs nobody anticipated and watches for faults. Option A describes SCA (software composition analysis), option B is credential brute-forcing, and option C is performance testing — none of them feed malformed data to a parser to provoke a fault.',
      },
      {
        id: 'q4',
        topic: 'what debuggers reveal about software',
        prompt: 'Why does an analyst attach a debugger to a program?',
        options: [
          'To make the program execute noticeably faster',
          'To inspect runtime state — breakpoints, locals, memory',
          'To patch source-level bugs automatically at runtime',
          'To encrypt the binary against casual reverse engineering',
        ],
        correct: 1,
        explain:
          'Correct: breakpoints freeze execution and expose how the software actually behaves — hidden routes, embedded secrets, feature flags. Option A is backwards — debuggers slow execution down by design; option C is impossible because a debugger observes rather than rewrites source; option D is the opposite of what a debugger does — it opens binaries to inspection instead of protecting them.',
      },
      {
        id: 'q5',
        topic: 'recognizing security misconfigurations',
        prompt: 'Which of these is a security misconfiguration?',
        options: [
          'Directory listing (autoindex) left enabled on /uploads',
          'A strong password policy on the admin console',
          'TLS 1.3 negotiated as the preferred protocol',
          'Generic error pages shown to end users',
        ],
        correct: 0,
        explain:
          'Correct: autoindex publishes the folder index to anyone — a forgotten, insecure default. Options B, C and D are controls working as intended; misconfigurations are usually settings someone forgot to turn off, not hardening someone forgot to apply.',
      },
      {
        id: 'q6',
        topic: 'remediating SQL injection at the root cause',
        prompt: 'A scanner confirms SQL injection in /records?id=. The best remediation is…',
        options: [
          'A WAF rule that blocks quote characters',
          'Hiding database errors behind generic messages',
          'Parameterized queries so input cannot alter structure',
          'Limiting the vulnerable parameter to ten characters',
        ],
        correct: 2,
        explain:
          'Correct: parameterization removes the flaw class — input is bound as data and can never change query structure. Option A is a compensating control that trivial filters evade; option B hides the evidence while the injection keeps working; option D caps one payload length but leaves the structure open.',
      },
    ],
    hard: [
      {
        id: 'h1',
        topic: 'reading fuzz output — boolean blind injection',
        prompt:
          'Fuzz output: "1001 AND 1=1" returns the baseline response; "1001 AND 1=2" returns a short empty response. No error text anywhere. Conclusion?',
        // correct index 3 — rotation plan H: 3,1,2,0,3,1,2
        options: [
          'The endpoint is healthy; caching explains the differences',
          'The fuzzer is misconfigured and sending broken payloads',
          'A denial-of-service condition is building on the endpoint',
          'Boolean-based blind SQL injection in the parameter',
        ],
        correct: 3,
        explain:
          'Correct: one injected byte flips the response between baseline and empty — the signature of boolean blind injection, even with errors suppressed. Option A is the trap: "caching" does not consistently track the truth value of a condition; option B is disproved by the baseline row returning normally; option C contradicts the normal 200 responses.',
      },
      {
        id: 'h2',
        topic: 'responding to verbose error disclosure',
        prompt:
          'An unauthenticated error page returns: "Traceback … sqlalchemy.exc.ProgrammingError". First action?',
        options: [
          'Ignore it — error pages are cosmetic noise',
          'Misconfiguration ticket: generic pages, server-side logs, re-test',
          'Patch the database server first, investigate later',
          'Restart the application server and move on',
        ],
        correct: 1,
        explain:
          'Correct: verbose errors leak framework, paths and SQL shape — ammunition for the next attack — and the fix is configuration plus verification. Option A leaves free reconnaissance for attackers; option C patches the wrong tier (the leak is app config, not the DB engine); option D restarts nothing that matters and the page returns on the next error.',
      },
      {
        id: 'h3',
        topic: 'choosing reverse engineering + debugging',
        prompt:
          'A vendor ships a stripped binary suspected of calling home. No source is available. Which technique applies?',
        options: [
          'Static analysis of the missing source code',
          'An authenticated web scan of the vendor portal',
          'Reverse engineering plus a debugger to observe runtime',
          'A port scan of the vendor’s website',
        ],
        correct: 2,
        explain:
          'Correct: with no source and runtime behavior in question, disassembly/strings plus a live debugger session is the technique pair. Option A is self-contradictory — there is no source to analyze; option B tests the wrong target entirely; option D maps the vendor’s network but never shows what the binary itself does.',
      },
      {
        id: 'h4',
        topic: 'closing scanner false positives with evidence',
        prompt:
          'A scanner flags XSS in /search, but your probe shows the value is HTML-encoded before rendering. Verdict?',
        options: [
          'False positive — close with the encoding evidence',
          'True positive — scanners do not fabricate findings',
          'Escalate to incident response as a compromise',
          'Disable the search endpoint until patched',
        ],
        correct: 0,
        explain:
          'Correct: output encoding breaks the execution context, so the alert is wrong — and closing it WITH the evidence is what makes triage defensible. Option B is the deference trap: scanners flag patterns, humans verify contexts; option C has no compromise indicator; option D breaks the business over a non-issue.',
      },
      {
        id: 'h5',
        topic: 'the launch call on default credentials',
        prompt:
          'Launch is tomorrow. You confirmed the admin console accepts admin/admin123. The defensible call is…',
        options: [
          'Launch — it is only an internal console',
          'Launch and monitor the console for abuse',
          'Rename the admin account, then launch anyway',
          'Block launch: rotate credentials, enforce MFA, re-verify',
        ],
        correct: 3,
        explain:
          'Correct: default credentials are pre-auth full control — rotation + MFA + re-verification is the only sequence that removes the risk before go-live. Option A misjudges exposure (internal consoles are reachable once anything pivots); option B detects the breach after it happens; option C is cosmetic — the password itself is still factory.',
      },
      {
        id: 'h6',
        topic: 'the control that actually stops IDOR',
        prompt: 'Which control actually stops an IDOR on /api/records?id=…?',
        options: [
          'Random UUIDs replacing the sequential identifiers',
          'Server-side ownership checks on object access',
          'A WAF rule blocking sequential id patterns',
          'Rate limiting the endpoint per client',
        ],
        correct: 1,
        explain:
          'Correct: only a server-side check answers "may THIS user access THIS object?" — the actual security question. Options A and C merely obscure the identifier; obfuscation slows a scanner but leaks via any reference (email, log, referrer). Option D throttles volume without ever deciding permission.',
      },
      {
        id: 'h7',
        topic: 'improving scan coverage and trust',
        prompt:
          'Your unauthenticated web scan produced noise and missed half the application. The highest-value improvement is…',
        options: [
          'Re-running the same scan with more threads',
          'Switching to a generalized network scanner',
          'An authenticated scan plus manual logic testing',
          'Scanning only the login page repeatedly',
        ],
        correct: 2,
        explain:
          'Correct: authentication changes what the scanner can see, and a human closes the logic-flaw gap no plugin judges. Option A is the classic trap — more threads on a blind scan is still blind; option B steps backward to the shallower tool; option D shrinks coverage to almost nothing.',
      },
    ],
  };

  CL.QUIZ = QUIZ;
})(window.CyberLab);
