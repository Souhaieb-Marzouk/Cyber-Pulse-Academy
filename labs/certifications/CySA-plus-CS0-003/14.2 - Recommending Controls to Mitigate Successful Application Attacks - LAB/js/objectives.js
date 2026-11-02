/* ==========================================================================
   GATEHOUSE lab — js/objectives.js
   Objective definitions and machine-checkable validation rules.
   Ported 1:1 from the original framework lab (src/components/cyberlab/objectives.ts)
   plus the stage-mapping and pillar metadata from ui-bits.tsx.
   Each objective anchors to a specific detail of the single input:
   CompTIA CySA+ CS0-003 · Lesson 14.2 — Recommending Controls to Mitigate
   Successful Application Attacks (exam objectives 2.4 + 3.2).
   ========================================================================== */
(function () {
  "use strict";
  var GH = (window.GH = window.GH || {});
  var D = GH.DATA;

  function ok(message) {
    return { pass: true, message: message };
  }
  function no(message) {
    return { pass: false, message: message };
  }

  /* ------------------------------- MEDIUM ---------------------------------- */

  var MEDIUM = [
    {
      id: "OBJ-M1",
      pillar: "understand",
      title: "Match each application attack to its mechanism.",
      context:
        "You cannot recommend a control for an attack you cannot describe. Anchor the four classics first.",
      anchor: "2.4 attack vocabulary: injection, XSS, CSRF, overflow",
      hints: [
        "Ask what the attacker changes: a query? the DOM? a request? memory?",
        "CSRF is the only one that abuses the victim's own authentication rather than application code.",
        "Correct pairs: SQLi→query rewriting; XSS→code in the victim's browser; CSRF→unintended authenticated request; overflow→memory overwritten past a buffer.",
      ],
      check: function (s) {
        var allSet = D.MATCH_ATTACKS.every(function (a) {
          return !!s.matchPairs[a.id];
        });
        if (!allSet) return no("Link all four attacks to a mechanism first.");
        var wrong = D.MATCH_ATTACKS.filter(function (a) {
          return s.matchPairs[a.id] !== a.id.replace("a-", "m-");
        });
        if (wrong.length > 0)
          return no(
            wrong.length + " of 4 pairings are off — reread the mechanism text; each describes exactly one attack."
          );
        return ok("All four mechanisms correctly mapped.");
      },
      passFeedback:
        "These four drive most web breaches. Each maps to a gate you will configure later: validation (SQLi), encoding (XSS), session policy (CSRF), memory protections (overflow).",
    },
    {
      id: "OBJ-M2",
      pillar: "understand",
      title: "Sort six controls into Prevent / Detect / Respond.",
      context:
        "The lesson's spine: controls prevent, detect, and respond. A recommendation that names the wrong function will be funded and deployed wrong.",
      anchor: "Lesson 14.2: application controls prevent, detect, respond",
      hints: [
        "Prevention stops the request before or during processing; detection only observes; response recovers after impact.",
        "Anything wired to the SIEM that raises an alert is detecting — even if the tool could also block.",
        "Validation, encoding and TLS prevent. WAF alerting and audit logging detect. The playbook responds.",
      ],
      check: function (s) {
        var missing = D.BUCKET_CHIPS.filter(function (c) {
          return !s.buckets[c.id];
        });
        if (missing.length) return no("Assign all six controls to a bucket first.");
        var wrong = D.BUCKET_CHIPS.filter(function (c) {
          return s.buckets[c.id] !== c.correct;
        });
        if (wrong.length)
          return no(
            wrong.length + " of 6 misfiled — reconsider what each control actually does to a request."
          );
        return ok("Taxonomy correct: prevent / detect / respond.");
      },
      passFeedback:
        "Defense-in-depth means all three functions present. In the GATES stage you will configure preventives; in TRIAGE you will exercise detection and response.",
    },
    {
      id: "OBJ-M3",
      pillar: "recognize",
      title: "Find the SQL injection campaign in the access log: name the targeted parameter and a hallmark snippet.",
      context: "Open EVIDENCE → Access log. Two probes from 203.0.113.51 stand out from traffic.",
      anchor: "2.4 injection flaws; evidence AL-006/AL-007",
      hints: [
        "Look for requests where a parameter value contains SQL keywords or quotes.",
        "Both malicious lines target the same parameter on /api/refills.",
        "Parameter: patientId. Snippet: anything like OR '1'='1 or UNION SELECT.",
      ],
      check: function (s) {
        var p = (s.matchPairs.__param || "").trim().toLowerCase();
        var snippet = (s.matchPairs.__snippet || "").trim();
        if (!p || !snippet)
          return no("Enter both the parameter name and a snippet from the log.");
        if (p !== "patientid")
          return no(
            "That is not the parameter the probes abused — check which query parameter carries attacker text in AL-006/AL-007."
          );
        if (!/(or\s+'?1'?\s*=\s*'?1|union\s+select)/i.test(snippet))
          return no(
            "That text is not a SQLi hallmark. Copy a distinctive fragment straight from the malicious requests."
          );
        return ok("Injection campaign located: patientId parameter, classic tautology + UNION probes.");
      },
      passFeedback:
        "Note what the logs prove: 400/500 errors — the probes failed only because of SQL syntax errors, not because any control blocked them. That distinction is triage gold.",
    },
    {
      id: "OBJ-M4",
      pillar: "recognize",
      title: "Identify the XSS probe and the control whose absence made it dangerous.",
      context: "Still in the access log: the search endpoint served something no formulary search should.",
      anchor: "2.4 XSS (reflected); evidence AL-008 + config snapshot",
      hints: [
        "Which response executed attacker content in a browser? Look at the q parameter.",
        "The config snapshot lists what the portal never set on output.",
        "Attack: XSS. Missing control: output encoding (no CSP either).",
      ],
      check: function (s) {
        var atk = s.matchPairs.__attack || "";
        var ctl = s.matchPairs.__missing || "";
        if (!atk || !ctl) return no("Select both the attack type and the missing control.");
        if (atk !== "xss")
          return no("Reread AL-008: attacker script delivered through a URL parameter is this attack's signature.");
        if (ctl !== "output-encoding")
          return no("Close — but the direct fix is rendering-side. Which control turns a payload into inert text at render time?");
        return ok("Reflected XSS identified; missing output encoding (and CSP) named.");
      },
      passFeedback:
        "Output encoding at render time would have displayed that payload as text. CSP would have limited blast radius. You will configure both later.",
    },
    {
      id: "OBJ-M5",
      pillar: "mitigate",
      title: "Configure server-side numeric validation for the refill lookup — then prove it in the simulator.",
      context:
        "GATES stage: set patientId validation to numeric-strict, then run both SQLi requests — both must die at the Validation gate.",
      anchor: "Lesson 14.2: input validation & sanitization",
      hints: [
        "The control lives under the Validation gate in the controls board.",
        "After configuring, press Run on both SQLi requests in the simulator.",
        "Numeric-strict rejects everything that is not 1–6 digits — both payloads contain quotes and spaces.",
      ],
      check: function (s) {
        if (s.controls.patientIdValidation !== "numeric-strict")
          return no("The server-side validation control is not set to numeric-strict yet.");
        var t = s.sim["sqli-taut"];
        var u = s.sim["sqli-union"];
        if (!t || !u)
          return no("Run both SQLi requests through the simulator to verify the gate.");
        if (t.blockedAt !== "validation" || u.blockedAt !== "validation")
          return no(
            "Both SQLi requests must be stopped at the VALIDATION gate. If they were caught further down, another layer did the work — tune the front gate."
          );
        return ok("Both SQLi payloads blocked at the Validation gate — verified in the simulator.");
      },
      passFeedback:
        "Server-side allow-list validation is the primary injection control: it rejects the class of input, not one signature. Note the simulator shows the WAF alone would also catch these — as a compensating layer.",
    },
    {
      id: "OBJ-M6",
      pillar: "mitigate",
      title: "Pick the correct output encoding for each render context, then enable context-aware encoding.",
      context:
        "Encoding is context-specific: what is safe in an HTML body is unsafe in an attribute or a JS string.",
      anchor: "Lesson 14.2: sanitization & output encoding",
      hints: [
        "Body text → entity encoding; attribute values → attribute encoding; inside <script> → JS escaping/JSON.",
        "The master switch is on the Encoding & CSP card in the controls board.",
        "Correct picks: entity / attribute / JavaScript.",
      ],
      check: function (s) {
        var wrong = D.ENC_CONTEXTS.filter(function (c) {
          return s.encChoices[c.id] !== c.answer;
        });
        if (Object.keys(s.encChoices).length < D.ENC_CONTEXTS.length)
          return no("Choose an encoding for all three contexts first.");
        if (wrong.length)
          return no(
            wrong.length + " of 3 contexts get the wrong encoder — matching the encoding to the sink is the whole skill."
          );
        if (s.controls.outputEncoding !== "context-aware")
          return no("Now enable context-aware encoding on the Encoding & CSP card.");
        return ok("All three contexts encoded correctly; context-aware encoding enabled.");
      },
      passFeedback:
        "Context-aware encoding is why one global 'strip dangerous characters' filter fails: the browser interprets each sink differently. This single control neutralizes the XSS probe you found in AL-008.",
    },
    {
      id: "OBJ-M7",
      pillar: "mitigate",
      title: "Fix the data layer: parameterized queries + least-privilege DB account, then re-verify the SQLi pair.",
      context:
        "Two controls here: one stops the injection, one caps the damage if anything else fails.",
      anchor: "Lesson 14.2: parameterized queries/stored procedures; least privilege",
      hints: [
        "Data layer card on the controls board has both settings.",
        "The DB account should have exactly what the app needs — not DBA rights.",
        "Re-run both SQLi requests after configuring; validation or the data gate may catch them — both are acceptable.",
      ],
      check: function (s) {
        if (s.controls.dbQueryStyle !== "parameterized")
          return no("Switch the query construction to parameterized statements.");
        if (s.controls.dbAccount !== "app-least-priv")
          return no("The database account still has DBA-equivalent rights — downgrade it to least privilege.");
        var t = s.sim["sqli-taut"];
        var u = s.sim["sqli-union"];
        if (!t || !u) return no("Re-run both SQLi requests to verify the layer.");
        var caught = function (o) {
          return o.blockedAt === "validation" || o.blockedAt === "data";
        };
        if (!caught(t) || !caught(u))
          return no("Both SQLi requests must die at Validation or the Data gate.");
        return ok("Parameterized statements + least-privilege DB account active; SQLi neutralized.");
      },
      passFeedback:
        "Prepared statements remove the injection mechanism itself; the least-privilege account (M1026 thinking) is your blast-radius cap — even a perfect payload reads almost nothing.",
    },
    {
      id: "OBJ-M8",
      pillar: "mitigate",
      title: "Harden identity & session: least-privilege roles, admin MFA, the full cookie triple, 30-minute timeout.",
      context:
        "Access control = authentication (MFA) + authorization (roles) + session hygiene (flags, timeout).",
      anchor: "Lesson 14.2: access control; 2.4 broken access control / authn failures",
      hints: [
        "svc_veriweb is a service account — it needs to run the app, not administer it.",
        "s.lim works the helpdesk; a pharmacist role for helpdesk is privilege creep.",
        "Set: svc_veriweb→app-runtime, s.lim→support-tier1, MFA on, all three cookie flags, 30 min.",
      ],
      check: function (s) {
        var c = s.controls;
        if (c.roleSvcWeb !== "app-runtime")
          return no("svc_veriweb should run least-privilege (app-runtime), not superadmin.");
        if (c.roleSLim !== "support-tier1")
          return no("s.lim is helpdesk — the pharmacist role is privilege creep; assign support-tier1.");
        if (!c.mfaAdmin) return no("Enable MFA for the privileged rx-admin account.");
        if (!c.cookieHttpOnly || !c.cookieSecure || !c.cookieSameSite)
          return no("All three cookie flags are required: HttpOnly, Secure, SameSite.");
        if (c.sessionTimeout !== "30")
          return no("Cut the session timeout from 12 hours to 30 minutes.");
        return ok("Roles least-privileged, MFA on, cookie triple set, session lifetime cut.");
      },
      passFeedback:
        "This is the access-control pillar in one pass: authentication (MFA), authorization (least privilege, RBAC) and session management (flags + timeout). It would have contained the IR-2417 chain at stage 3.",
    },
    {
      id: "OBJ-M9",
      pillar: "mitigate",
      title: "Enforce cryptography: TLS 1.2+ only, AES-256 at rest, bcrypt with salt for passwords.",
      context: "Three cryptographic failures, three fixes — all on the Cryptography card.",
      anchor: "Lesson 14.2: encryption in transit / at rest; 2.4 cryptographic failures",
      hints: [
        "One radio per layer: transport, storage, credentials.",
        "TLS 'any version' still leaves obsolete protocols negotiable.",
        "Correct set: tls12 / aes-256 / bcrypt-salt.",
      ],
      check: function (s) {
        var c = s.controls;
        if (c.tlsMode !== "tls12") return no("Pin TLS 1.2+ and kill the obsolete protocol versions.");
        if (c.atRest !== "aes-256") return no("Patient records need encryption at rest — enable AES-256.");
        if (c.passwordHash !== "bcrypt-salt")
          return no("Unsalted MD5 must go — use a slow, salted KDF (bcrypt).");
        return ok("Transport, storage and credential layers all cryptographically sound.");
      },
      passFeedback:
        "Cryptographic failures are quiet: no exploit shows in a log. A stolen backup with AES-256 is an incident; without it, it is a disclosure of 2,300 records.",
    },
    {
      id: "OBJ-M10",
      pillar: "detect",
      title: "Select the four data sources with the best coverage for these web attacks.",
      context: "Detection is only as good as the telemetry feeding it. Choose 4 of 8 in TRIAGE.",
      anchor: "Lesson 14.2 detection content; ATT&CK v20 detection strategies DET0080/DET0394",
      hints: [
        "Follow the attack path: the HTTP edge, the web server, the application, the database.",
        "Badge readers and HVAC do not see SQL strings.",
        "WAF/proxy logs, web access logs, application auth/audit logs, DB query logs.",
      ],
      check: function (s) {
        if (s.dataSources.length !== 4)
          return no("Select exactly 4 sources (currently " + s.dataSources.length + ").");
        var missing = D.DATA_SOURCE_ANSWER.filter(function (d) {
          return !s.dataSources.includes(d);
        });
        if (missing.length) return no("Not the strongest set — follow the attack path end to end.");
        return ok("Coverage set confirmed: edge, web server, application, database.");
      },
      passFeedback:
        "These four reconstruct the full IR-2417 story: edge signature (WAF), upload+shell GETs (access log), role abuse (authz log), query anomalies (DB log).",
    },
    {
      id: "OBJ-M11",
      pillar: "detect",
      title: "Triage the four alerts: true positive or false positive.",
      context: "Triage = artifact + context. Two memos hold the context you need.",
      anchor: "3.2 IR investigation; evidence AL + memos MM-2/MM-3",
      hints: [
        "The scanner has a vendor ticket; the failed logins have a helpdesk ticket.",
        "TPs here: the injection signature alert and the .php upload.",
        "FPs here: the AcmeScan scan and the j.doe password-reset typos.",
      ],
      check: function (s) {
        var four = D.ALERTS.slice(0, 4);
        var missing = four.filter(function (a) {
          return !s.triage[a.id];
        });
        if (missing.length) return no("Classify all four alerts first.");
        var wrong = four.filter(function (a) {
          return s.triage[a.id] !== a.answer;
        });
        if (wrong.length)
          return no(
            wrong.length + " of 4 misclassified — check memos MM-2 and MM-3 for authorized-activity context."
          );
        return ok("All four alerts triaged correctly.");
      },
      passFeedback:
        "Notice the pattern: both TPs are attacker behavior; both FPs are authorized activity with paper trails. Documented context is what makes triage defensible.",
    },
    {
      id: "OBJ-M12",
      pillar: "mitigate",
      title: "Sequence the incident response: preserve → contain → eradicate → recover → learn.",
      context: "Order the five phases in TRIAGE. The canonical CySA+ flow applies.",
      anchor: "3.2 incident response activities (containment, eradication, recovery)",
      hints: [
        "Volatile evidence is captured before anything changes.",
        "Eradication (patching) happens while systems are still contained, not after recovery.",
        "The review closes the loop and feeds the re-test.",
      ],
      check: function (s) {
        if (s.seq.length !== D.SEQ_MEDIUM.length)
          return no("Order all " + D.SEQ_MEDIUM.length + " phases.");
        var snap = s.seq.indexOf("m-snap");
        var contain = s.seq.indexOf("m-contain");
        if (snap === -1 || contain === -1) return no("Sequence incomplete.");
        var snapFirst = snap < contain;
        var tail = ["m-erad", "m-recover", "m-review"];
        var tailOk = tail.every(function (id, i) {
          var idx = s.seq.indexOf(id);
          var prev = i === 0 ? contain : s.seq.indexOf(tail[i - 1]);
          return idx > prev;
        });
        if (!tailOk)
          return no(
            "Eradicate → Recover → Learn is the strict tail order; patch before you restore, review after you resume."
          );
        if (!snapFirst)
          return no(
            "Snapshot (preserve) comes before containment here: pulling the host destroys volatile evidence. (In live IR they can run in parallel — capture first is the defensible default.)"
          );
        return ok("Response sequence correct: preserve → contain → eradicate → recover → learn.");
      },
      passFeedback:
        "3.2 in action: containment scope, eradication, recovery with validation, and a lessons-learned loop that updates the control baseline before the red team returns.",
    },
  ];

  /* -------------------------------- HARD ----------------------------------- */

  var HARD = [
    {
      id: "OBJ-H1",
      pillar: "recognize",
      title: "Reconstruct the successful chain: entry endpoint, planted file, abused account.",
      context:
        "The noise hides the breach. Find the one chain that succeeded and state it precisely.",
      anchor: "2.4 RCE via insecure upload; evidence AL-010..AL-013, AP-104..107, UR-331",
      hints: [
        "One POST got a 200 and was followed by GETs that answered commands.",
        "The web shell ran under an application identity that had too much power.",
        "Endpoint /upload/documents; file pharmacy_audit_2025.php; account svc_veriweb.",
      ],
      check: function (s) {
        var ep = (s.h1.endpoint || "").trim().toLowerCase().replace(/^\/+/, "");
        var f = (s.h1.file || "").trim().toLowerCase();
        var a = (s.h1.account || "").trim().toLowerCase();
        var out = [];
        if (ep !== "upload/documents")
          out.push("entry endpoint (the POST that delivered the payload)");
        if (f !== "pharmacy_audit_2025.php") out.push("planted file name");
        if (a !== "svc_veriweb") out.push("abused service account");
        if (!out.length)
          return ok("Chain reconstructed exactly: /upload/documents → pharmacy_audit_2025.php → svc_veriweb.");
        return no("Not exact: check the " + out.join(", ") + ". Near-misses are rejected — this goes in the incident record.");
      },
      passFeedback:
        "This is T1190 (exploit public-facing app) feeding T1505.003 (web shell) in one chain. Exact artifacts matter: containment, legal, and the re-test all key off these three strings.",
    },
    {
      id: "OBJ-H2",
      pillar: "recognize",
      title: "Dismiss the noise: classify the SQLi campaign and the AcmeScan activity.",
      context: "Both look alarming. Both must be dispositioned with evidence, not vibes.",
      anchor: "3.2 investigation; AL-006/007 (failed) vs MM-2 (authorized scanner)",
      hints: [
        "Check the HTTP status codes on the SQLi lines — did anything actually come back?",
        "Who owns the AcmeScan user-agent? Which memo answers it?",
        "SQLi probes FAILED (400/500, no data). AcmeScan is the contracted scanner (SC-88).",
      ],
      check: function (s) {
        var issues = [];
        if (s.h2.sqli !== "failed")
          issues.push("the SQLi campaign — its 400/500s returned no data; it failed on its own, not to a control");
        if (s.h2.scan !== "authorized")
          issues.push("the AcmeScan activity — memo MM-2 ties it to vendor ticket SC-88");
        if (!issues.length)
          return ok("Noise correctly dispositioned: failed probes + authorized scan.");
        return no("Rethink " + issues.join(" and ") + ".");
      },
      passFeedback:
        "Red herrings handled: the probes are evidence of intent (keep them in the report) but not impact; the scan is authorized noise. Attribution of impact to the wrong artifact is how incidents get mis-scoped.",
    },
    {
      id: "OBJ-H3",
      pillar: "mitigate",
      title: "Name the three control failures that ENABLED this breach.",
      context: "Real config has a dozen gaps. Exactly three are causal for this chain — pick those.",
      anchor: "2.4 insecure upload + broken access control; AP-104/105/107",
      hints: [
        "Follow the chain: what let the file in, what let it run, what let the account matter.",
        "TLS and MD5 are real weaknesses — but did the web shell need them?",
        "The three: client-side-only upload validation, executable webroot storage, superadmin service account.",
      ],
      check: function (s) {
        var sel = s.h3.slice().sort();
        var ans = D.H3_ANSWER.slice().sort();
        var same = sel.length === ans.length && sel.every(function (v, i) {
          return v === ans[i];
        });
        if (same) return ok("Causal set exact: validation, storage, privilege.");
        if (sel.includes("f-tls") || sel.includes("f-md5") || sel.includes("f-log"))
          return no(
            "Those are genuine config weaknesses — but the web shell chain did not depend on them. Attribute causally: what admitted the file, what executed it, what amplified it."
          );
        return no("Not the exact causal set. Three failures — admission, execution, amplification.");
      },
      passFeedback:
        "Failure attribution drives funding: the fix list is exactly these three (server-side allow-list+magic bytes, non-executable storage outside webroot, least-privilege account) — the rest is hardening, not breach response.",
    },
    {
      id: "OBJ-H4",
      pillar: "mitigate",
      title: "Engineer upload hardening, then prove the shell upload dies at the File gate.",
      context:
        "Configure the full server-side set — then run the simulator and confirm both the malicious upload is blocked and the genuine PDF flows.",
      anchor: "Lesson 14.2 input validation/sanitization applied to file handling; M1042/M1018",
      hints: [
        "Three settings on the File handling card; the scanner toggle is the third.",
        "Storage must be outside the webroot and non-executable.",
        "Verify with mal-upload (blocked at 'upload') AND ben-upload (must pass).",
      ],
      check: function (s) {
        var c = s.controls;
        if (c.uploadValidation !== "allowlist-magic")
          return no(
            "Use the server-side allow-list + magic-byte mode. A deny-list would also stop THIS file — but it is the wrong class of control; near-miss rejected."
          );
        if (c.uploadStorage !== "outside-nonexec")
          return no("Uploads must land outside the webroot, non-executable.");
        if (!c.uploadScan) return no("Enable the anti-malware scan on arrival.");
        var mal = s.sim["mal-upload"];
        var ben = s.sim["ben-upload"];
        if (!mal || !ben) return no("Run both upload requests through the simulator.");
        if (mal.blockedAt !== "upload")
          return no("The shell upload must be stopped at the File handling gate itself.");
        if (ben.blocked) return no("The genuine PDF must still flow — controls that break business are controls that get removed.");
        return ok("Upload hardening verified: shell blocked at the gate, legitimate PDF unaffected.");
      },
      passFeedback:
        "Allow-list + magic bytes + non-executable storage is defense-in-depth for uploads: even a bypass of one check hits the next. The benign-PDF check matters — security that breaks the pharmacy audit workflow will be switched off by Monday.",
    },
    {
      id: "OBJ-H5",
      pillar: "mitigate",
      title: "Complete access remediation: roles, MFA, cookie triple, timeout — and kill the attacker's sessions.",
      context: "After credential exposure, configuration alone is not enough: revoke what is live.",
      anchor: "Lesson 14.2 access control; 3.2 containment (session revocation)",
      hints: [
        "Everything from the medium-mode identity pass, PLUS one containment action.",
        "svc_veriweb credentials were exposed — its sessions must not survive remediation.",
        "Set roles + MFA + three flags + 30 min + revoke sessions.",
      ],
      check: function (s) {
        var c = s.controls;
        var flagsOk =
          c.roleSvcWeb === "app-runtime" &&
          c.roleSLim === "support-tier1" &&
          c.mfaAdmin &&
          c.cookieHttpOnly &&
          c.cookieSecure &&
          c.cookieSameSite &&
          c.sessionTimeout === "30";
        if (!flagsOk)
          return no(
            "Base hardening incomplete: roles (app-runtime / support-tier1), admin MFA, HttpOnly+Secure+SameSite, 30-minute timeout."
          );
        if (!c.sessionsRevoked)
          return no(
            "The attacker session tokens are still valid — revoke all sessions as part of containment."
          );
        return ok("Access fully remediated and live attacker sessions revoked.");
      },
      passFeedback:
        "Rotating credentials without revoking sessions leaves the stolen tokens working until timeout — a classic containment miss (3.2). Config + revocation closes it.",
    },
    {
      id: "OBJ-H6",
      pillar: "detect",
      title: "Build the upload-hunting rule set: flag all 3 planted files, zero legitimate ones.",
      context:
        "Two rule slots, fields on filename or content. Extension rules are brittle; content rules see the truth.",
      anchor: "Lesson 14.2 detection; magic bytes vs extensions; T1505.003 hunting",
      hints: [
        "All three planted files contain PHP source regardless of what they are named.",
        "A single content rule can catch the entire class — or combine extension + content rules.",
        "Test with 'Run against sample set' until it reads 3 flagged / 0 legitimate.",
      ],
      check: function (s) {
        if (!s.ruleTest || !s.ruleTest.ran)
          return no("Run the rule set against the upload queue export first.");
        if (s.ruleTest.mal !== 3)
          return no("Only " + s.ruleTest.mal + "/3 planted files flagged — a rule is too narrow (watch the .php5 and the .jpg).");
        if (s.ruleTest.ben !== 0)
          return no(s.ruleTest.ben + " legitimate file(s) flagged — that is a false-positive machine; the business will reject it.");
        return ok("Rule set verified: 3/3 planted, 0/2 legitimate.");
      },
      passFeedback:
        "Content signatures (`<?php`) catch the class; extension rules only catch the instance. This is exactly how web-shell hunting works against T1505.003 — and why deny-lists lose.",
    },
    {
      id: "OBJ-H7",
      pillar: "detect",
      title: "Triage all six alerts under noise — every disposition must hold up.",
      context: "Six alerts, two memos of context, one incident. Score is exact.",
      anchor: "3.2 investigation; ALERTS + MM-2/MM-3/MM-4",
      hints: [
        "The port sweep has a change ticket; the failed logins have a helpdesk ticket.",
        "Shell activity (upload + served .php?cmd=) is always a true positive.",
        "TPs: a1, a3, a5. FPs: a2, a4, a6.",
      ],
      check: function (s) {
        if (Object.keys(s.triage).length < D.ALERTS.length)
          return no("Classify all six alerts.");
        var wrong = D.ALERTS.filter(function (a) {
          return s.triage[a.id] !== a.answer;
        });
        if (wrong.length)
          return no(
            wrong.length + " of 6 wrong: " + wrong.map(function (w) { return w.id; }).join(", ") + ". Re-read the memos — authorized activity leaves paper trails."
          );
        return ok("Six of six dispositions correct under noise.");
      },
      passFeedback:
        "Perfect triage is 60% context management: change calendar, vendor tickets, helpdesk records. The two red herrings were only defensible because paper existed.",
    },
    {
      id: "OBJ-H8",
      pillar: "mitigate",
      title: "Recommend compensating controls for unpatchable BillFlo 7 — and state the residual risk honestly.",
      context:
        "Legacy billing app, known injection flaws, no recompile for 60 days. CISO wants a defensible package.",
      anchor: "2.4 recommend controls under constraints; 3.2 compensating controls",
      hints: [
        "You need to filter traffic, validate at the edge, and watch everything — all without touching the code.",
        "A rewrite cannot happen inside the window; 'wait and see' is not a control.",
        "Select: WAF virtual patching + gateway validation + SIEM logging; residual: signature evasion.",
      ],
      check: function (s) {
        var sel = s.h8.controls.slice().sort();
        var ans = D.H8_ANSWER.slice().sort();
        var same = sel.length === ans.length && sel.every(function (v, i) {
          return v === ans[i];
        });
        if (!same) {
          if (sel.includes("rewrite") || sel.includes("nothing") || sel.includes("warn"))
            return no(
              "A rewrite inside 60 days is fantasy, acceptance is negligence, and an email is not a control. Choose what actually filters, validates and watches."
            );
          return no("Exactly three compensating controls make the package.");
        }
        if (s.h8.residual !== "r-signature")
          return no(
            "Pick the honest residual risk. Absolute claims ('unexploitable') are how credibility dies in review."
          );
        return ok("Compensating-control package approved; residual risk stated honestly.");
      },
      passFeedback:
        "This is 3.2's compensating-controls bullet in practice: reduce exposure without the code fix, monitor for what slips through, and document the accepted risk (signature evasion) so leadership owns it knowingly.",
    },
    {
      id: "OBJ-H9",
      pillar: "mitigate",
      title: "Sequence the full 8-step containment → eradication → recovery run.",
      context: "Granular this time. One canonical order. Volatility first, review last.",
      anchor: "3.2 IR activities in depth",
      hints: [
        "Snapshot before anything touches the host; disable the delivery mechanism before isolating.",
        "Credential revocation follows isolation; shell removal precedes patching.",
        "Snapshot → disable endpoint → isolate → revoke sessions → remove shell(s) → patch → restore → review.",
      ],
      check: function (s) {
        if (s.seq.length !== D.SEQ_HARD.length) return no("Order all " + D.SEQ_HARD.length + " steps.");
        var exact = D.SEQ_HARD.every(function (item, i) {
          return s.seq[i] === item.id;
        });
        if (!exact) {
          var firstBad = D.SEQ_HARD.findIndex(function (item, i) {
            return s.seq[i] !== item.id;
          });
          return no(
            "First divergence at position " + (firstBad + 1) + ". Canonical order: snapshot, disable endpoint, isolate, revoke, remove shell, patch, restore, review."
          );
        }
        return ok("Eight-step sequence exactly right.");
      },
      passFeedback:
        "Notice the logic: stop the delivery mechanism before isolating (or you lose the new-file signal), revoke after isolation, remove before patch (or the shell re-persists), review always.",
    },
    {
      id: "OBJ-H10",
      pillar: "understand",
      title: "Map each attack stage to the control layer that breaks it.",
      context:
        "Defense-in-depth is placement: the right control at the right stage. Assign one defense per stage.",
      anchor: "2.4 defense-in-depth across the attack chain (T1190 → T1505.003 → T1068)",
      hints: [
        "Stage 1 is admission, stage 2 is execution, stage 3 is privilege, stage 4 is the data itself.",
        "TLS and bcrypt are real controls — but they sit on other stages entirely.",
        "upload-validation → storage → least-privilege → DB privilege + at-rest encryption.",
      ],
      check: function (s) {
        var wrong = Object.keys(D.H10_ANSWER).filter(function (k) {
          return s.h10[k] !== D.H10_ANSWER[k];
        });
        if (Object.keys(s.h10).length < 4) return no("Assign a defense to all four stages.");
        if (wrong.length)
          return no(
            wrong.length + " mapping(s) off — ask what each stage actually required of the attacker."
          );
        return ok("Defense-in-depth map exact: each stage has its breaker.");
      },
      passFeedback:
        "Read the map left to right and you have the lab in one line: validate what enters, never execute what you store, lease privilege by the minute, and encrypt what must not leave.",
    },
  ];

  var OBJECTIVES = { medium: MEDIUM, hard: HARD };

  function starRating(objState, total) {
    var ids = Object.keys(objState).filter(function (k) {
      return objState[k] && objState[k].done;
    });
    var n = Math.max(ids.length, 1);
    var firstTry = ids.filter(function (k) {
      return objState[k].firstTry;
    }).length / n;
    var hints = ids.filter(function (k) {
      return objState[k].hints > 0;
    }).length / n;
    var stars = 1;
    if (firstTry >= 0.8 && hints <= 0.25) stars = 3;
    else if (firstTry >= 0.5) stars = 2;
    return {
      stars: stars,
      firstTryPct: Math.round(firstTry * 100),
      hintPct: Math.round(hints * 100),
    };
  }

  function quizPct(state, mode) {
    var items = mode === "medium" ? D.QUIZ_MEDIUM : D.QUIZ_HARD;
    var correct = 0;
    items.forEach(function (item) {
      var chosen = state.quizAnswers[item.id];
      if (chosen !== undefined && chosen === item.answer) correct++;
    });
    return Math.round((correct / items.length) * 100);
  }

  function checkObjective(id, s, mode) {
    var def = null;
    for (var i = 0; i < OBJECTIVES[mode].length; i++) {
      if (OBJECTIVES[mode][i].id === id) {
        def = OBJECTIVES[mode][i];
        break;
      }
    }
    if (!def) return no("Unknown objective.");
    return def.check(s);
  }

  /* Stage mapping (from ui-bits.tsx stageForObjective). */
  function stageForObjective(objId, mode) {
    if (mode === "medium") {
      if (["OBJ-M1", "OBJ-M2"].includes(objId)) return "doctrine";
      if (["OBJ-M3", "OBJ-M4"].includes(objId)) return "evidence";
      if (["OBJ-M5", "OBJ-M6", "OBJ-M7", "OBJ-M8", "OBJ-M9"].includes(objId)) return "gates";
      if (["OBJ-M10", "OBJ-M11", "OBJ-M12"].includes(objId)) return "triage";
    } else {
      if (["OBJ-H1", "OBJ-H2", "OBJ-H3"].includes(objId)) return "evidence";
      if (["OBJ-H4", "OBJ-H5"].includes(objId)) return "gates";
      if (["OBJ-H6", "OBJ-H7", "OBJ-H8", "OBJ-H9"].includes(objId)) return "triage";
      if (objId === "OBJ-H10") return "debrief";
    }
    return null;
  }

  /* Pillar metadata (from ui-bits.tsx PILLAR_META). */
  var PILLAR_META = {
    understand: { label: "UNDERSTAND", cls: "pillar-understand" },
    recognize: { label: "RECOGNIZE", cls: "pillar-recognize" },
    detect: { label: "DETECT", cls: "pillar-detect" },
    mitigate: { label: "MITIGATE", cls: "pillar-mitigate" },
  };

  GH.OBJECTIVES = OBJECTIVES;
  GH.starRating = starRating;
  GH.quizPct = quizPct;
  GH.checkObjective = checkObjective;
  GH.stageForObjective = stageForObjective;
  GH.PILLAR_META = PILLAR_META;
})();
