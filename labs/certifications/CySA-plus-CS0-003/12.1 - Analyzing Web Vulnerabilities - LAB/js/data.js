// CyberLab 12.1 — synthetic content (ALL DATA IS TRAINING DATA, fictional org)
// Static port: content carried over 1:1 from the original framework lab
// (src/lib/cyberlab/content.ts) — same wording, same values, same structure.
window.CyberLab = window.CyberLab || {};
(function (CL) {
  'use strict';

  const TARGET = {
    org: 'MeridianCare',
    app: 'Patient Portal',
    version: 'v3.0.0-rc2',
    host: 'staging.meridiancare.example',
    ip: '198.51.100.47 (TEST-NET-2, synthetic)',
    binary: 'portal-agent 3.0.0-rc2 — ELF x86-64, stripped — authorized training copy',
  };

  const TRAINING_NOTICE =
    'SYNTHETIC TRAINING ENVIRONMENT — MeridianCare is a fictional organization. Every host, user, credential, log line and finding on this bench is invented for instruction. Nothing here is real.';

  // ---------------------------------------------------------------- Tool rack
  const TOOL_CATS = [
    { id: 'sast', label: 'SAST — static analysis' },
    { id: 'dast', label: 'DAST — dynamic web scanner' },
    { id: 'fuzz', label: 'Fuzzer' },
    { id: 'debug', label: 'Debugger / reverse engineering' },
    { id: 'general', label: 'Generalized (network) scanner' },
  ];
  const TOOLS = [
    { id: 'sonar', name: 'SonarQube', blurb: 'Scans source repositories for code-level weakness patterns.', cat: 'sast' },
    { id: 'zap', name: 'OWASP ZAP', blurb: 'Crawls and attacks a running web app; proxy + active scanner.', cat: 'dast' },
    { id: 'burp', name: 'Burp Suite', blurb: 'Intercepting proxy and web scanner for request manipulation.', cat: 'dast' },
    { id: 'nikto', name: 'Nikto', blurb: 'Web *server* scanner: dangerous files, outdated software, server misconfig.', cat: 'dast' },
    { id: 'nessus', name: 'Nessus', blurb: 'Host / network scanner: ports, services, patch level, known CVEs.', cat: 'general' },
    { id: 'gdb', name: 'gdb / x64dbg', blurb: 'Runtime debugger: breakpoints, registers, memory inspection.', cat: 'debug' },
    { id: 'ghidra', name: 'Ghidra', blurb: 'Disassembler / decompiler for analyzing binaries without source.', cat: 'debug' },
    { id: 'afl', name: 'AFL / boofuzz', blurb: 'Fuzzing frameworks that mutate input to trigger faults.', cat: 'fuzz' },
  ];
  const M1_EXPECT = {
    sonar: 'sast',
    zap: 'dast',
    burp: 'dast',
    nikto: 'dast',
    nessus: 'general',
    gdb: 'debug',
    ghidra: 'debug',
    afl: 'fuzz',
  };

  const M2_FINDINGS = [
    { id: 'g1', text: 'TCP/443 open — TLS service detected on the web host', byGeneral: true },
    { id: 'g2', text: 'nginx/1.14.0 banner — outdated release branch identified', byGeneral: true },
    { id: 'g3', text: 'TLSv1.0 still offered on the staging vhost', byGeneral: true },
    { id: 'g4', text: 'Patient lookup returns other patients’ rows when the id parameter is changed', byGeneral: false },
    { id: 'g5', text: 'Search parameter reflects an HTML payload unencoded into the page', byGeneral: false },
    { id: 'g6', text: 'Admin console accepts the factory credentials admin / admin123', byGeneral: false },
  ];

  const M8_SCENARIOS = [
    {
      id: 's1',
      text: 'Black-box engagement: you have a URL and test credentials, but no source code, and must test the live application.',
      answer: 'dast',
    },
    {
      id: 's2',
      text: 'A file-upload parser crashes whenever it processes a deliberately malformed image; you must characterize the fault.',
      answer: 'fuzz',
    },
    {
      id: 's3',
      text: 'A stripped vendor binary is suspected of containing hidden maintenance behavior; you must observe it at runtime.',
      answer: 'debug',
    },
  ];

  // ---------------------------------------------------------------- SAST files
  const CODE_FILES = [
    {
      id: 'records',
      name: 'src/db/records.js',
      note: 'Patient lookup service — flagged for review.',
      lines: [
        "// records.js — patient lookup service (MeridianCare Portal v3 — training data)",
        "const db = require('../lib/db');",
        '',
        'function getPatientRecord(req, res) {',
        '  if (!req.session || !req.session.user) {',
        "    return res.status(401).json({ error: 'unauthenticated' });",
        '  }',
        '  // scenario note(SEC-118): object-level authorization check still pending',
        '  const id = req.query.id;',
        '',
        '  // fetch the requested patient record',
        "  const sql = \"SELECT * FROM patients WHERE id = '\" + id + \"'\";",
        '  db.query(sql, (err, rows) => {',
        '    if (err) {',
        "      res.status(500).send('DB error: ' + err.message);",
        '      return;',
        '    }',
        '    res.json(rows[0] || {});',
        '  });',
        '}',
      ],
    },
    {
      id: 'search',
      name: 'src/render/search.js',
      note: 'Search service + renderer.',
      lines: [
        '// search.js — search service + renderer (training data)',
        "const db = require('../lib/db');",
        '',
        'function searchNotes(req, res) {',
        '  const q = req.query.q;',
        '  // parameterized: user input is bound, cannot alter query structure',
        "  const hits = db.query('SELECT * FROM notes WHERE body LIKE ? LIMIT 20', ['%' + q + '%']);",
        '  // reflect the query back into the page WITHOUT encoding (XSS sink)',
        "  res.send('<h2>Results for ' + q + '</h2>' + renderList(hits));",
        '}',
      ],
    },
    {
      id: 'billing',
      name: 'src/db/billing.js',
      note: 'Invoice lookup — remediated reference pattern.',
      lines: [
        '// billing.js — invoice lookup (training data, remediated pattern)',
        "const db = require('../lib/db');",
        '',
        'function getInvoice(req, res) {',
        '  const patientId = req.query.patient_id;',
        "  const sql = 'SELECT amount, due FROM invoices WHERE patient_id = ?';",
        '  db.query(sql, [patientId], (err, rows) => {',
        '    if (err) return res.sendStatus(500); // generic error — no detail leak',
        '    res.json(rows);',
        '  });',
        '}',
      ],
    },
  ];
  const M3_SINK = { file: 'records', line: 12 };
  const M3_FLAW_OPTIONS = [
    { id: 'sqli', label: 'SQL injection' },
    { id: 'xss', label: 'Cross-site scripting (XSS)' },
    { id: 'idor', label: 'Insecure direct object reference' },
    { id: 'verbose', label: 'Verbose error message' },
  ];

  // ---------------------------------------------------------------- DAST
  const CRAWL_LOG = [
    'crawler: seed https://staging.meridiancare.example/ (authorized training target)',
    'crawler: GET /login                      → 200 (form: 2 inputs)',
    'crawler: GET /records?id=1001            → 200 (parameter: id)',
    'crawler: GET /search?q=                  → 200 (parameter: q)',
    'crawler: GET /admin                      → 200 (console)',
    'crawler: GET /uploads/                   → 200 (index)',
    'crawler: GET /api/records?id=1001        → 200 (parameter: id)',
    'crawler: GET /robots.txt                 → 200',
    'crawler: GET /definitely-not-a-page      → 500 (stack trace)',
    'crawler: done — 9 URLs, 2 forms, 3 parameterized endpoints',
  ];

  const ALERTS = [
    {
      id: 'a1',
      sev: 'high',
      title: 'SQL injection',
      loc: '/records?id=',
      detail: 'Payload \' OR \'1\'=\'1 returned 214 patient rows; a 500 disclosed raw DB error text.',
      truth: 'TP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'a2',
      sev: 'high',
      title: 'Reflected XSS',
      loc: '/search?q=',
      detail: 'Payload echoed into the HTML body unencoded; executes in the training sandbox marker.',
      truth: 'TP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'a3',
      sev: 'high',
      title: 'Missing object-level authorization (IDOR pattern)',
      loc: '/api/records?id=',
      detail: 'Sequential ids 1001–1003 returned records without an ownership check — verify manually.',
      truth: 'TP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'a4',
      sev: 'medium',
      title: 'Session cookie without Secure / HttpOnly / SameSite',
      loc: 'Set-Cookie: sessionid=…',
      detail: 'Cookie can travel over plain HTTP and be read by scripts.',
      truth: 'TP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'a5',
      sev: 'medium',
      title: 'Verbose error message',
      loc: 'GET /definitely-not-a-page',
      detail: 'Full stack trace with framework name and absolute server paths.',
      truth: 'TP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'a6',
      sev: 'medium',
      title: 'Directory listing enabled',
      loc: '/uploads/',
      detail: 'autoindex renders a browsable file index.',
      truth: 'TP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'a7',
      sev: 'low',
      title: 'Missing Content-Security-Policy',
      loc: 'all pages',
      detail: 'No CSP header observed on any crawled response.',
      truth: 'TP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'a8',
      sev: 'info',
      title: 'Outdated software banner',
      loc: 'Server: nginx/1.14.0',
      detail: 'Banner identifies an EOL release branch.',
      truth: 'TP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'f1',
      sev: 'medium',
      title: 'SQL injection',
      loc: '/search?q=',
      detail: 'Scanner noted boolean-like behavior; source shows a parameterized LIKE query.',
      truth: 'FP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'f2',
      sev: 'low',
      title: 'Cross-site scripting via User-Agent',
      loc: 'header reflection',
      detail: 'Header value is written to server-side logs only; it is never rendered to any client.',
      truth: 'FP',
      origin: 'web-scan',
      modes: ['medium', 'hard'],
    },
    {
      id: 'f3',
      sev: 'medium',
      title: 'Directory listing',
      loc: '/assets/ on dev-old.staging.meridiancare.example',
      detail: 'Listing was disabled there in April — scanner compared against a stale cache.',
      truth: 'FP',
      origin: 'imported',
      modes: ['hard'],
    },
    {
      id: 'f4',
      sev: 'info',
      title: 'Open port 8080',
      loc: '10.30.7.44 (build agent)',
      detail: 'CI infrastructure, not the in-scope web application target.',
      truth: 'FP',
      origin: 'imported',
      modes: ['hard'],
    },
    {
      id: 'f5',
      sev: 'low',
      title: 'TLS POODLE (CVE-2014-3566)',
      loc: 'mail.meridiancare.example',
      detail: 'Mail host tracked by the network team — out of scope for this web assessment.',
      truth: 'FP',
      origin: 'imported',
      modes: ['hard'],
    },
    {
      id: 'f6',
      sev: 'medium',
      title: 'Reflected XSS',
      loc: '/records?id=',
      detail: 'Reflection occurs inside an HTML comment and the id is cast to an integer first — no executable context.',
      truth: 'FP',
      origin: 'imported',
      modes: ['hard'],
    },
  ];
  const M4_ANSWER = 'a1';

  // ---------------------------------------------------------------- Fuzzer
  const FUZZ_TARGET = 'GET /api/records?id=<payload>';
  const FUZZ_ROWS = [
    { id: 'p1', payload: '1001  (baseline)', status: 200, len: 1187, ms: 118, note: '1 row — expected record' },
    { id: 'p2', payload: "'", status: 500, len: 641, ms: 96, note: 'SQL error: syntax error at or near "\'1001\'"' },
    { id: 'p3', payload: "' OR '1'='1", status: 200, len: 4820, ms: 143, note: '214 rows returned — full table exposure' },
    { id: 'p4', payload: '1001 AND 1=1', status: 200, len: 1187, ms: 121, note: '1 row — identical to baseline' },
    { id: 'p5', payload: '1001 AND 1=2', status: 200, len: 601, ms: 119, note: '0 rows — response differs from baseline' },
    { id: 'p6', payload: '1001; DROP TABLE patients--', status: 200, len: 1187, ms: 115, note: '1 row — stacked statements not executed' },
    { id: 'p7', payload: '%zzy%s%d', status: 200, len: 1187, ms: 117, note: 'literal echo, 1 row — no anomaly' },
  ];
  const M6_ANSWER = 'p3';

  // ---------------------------------------------------------------- Debugger
  const DEBUG_FUNCTIONS = ['main', 'load_config', 'handle_request', 'auth_check', 'handle_migrate'];
  const DEBUG_LOCALS = {
    user: 'svc_admin',
    mode: '"debug"',
    DBG_MODE: '1',
    route_hint: '"/internal/migrate"',
  };
  const DEBUG_STRINGS = [
    { text: '/internal/migrate', hit: true },
    { text: 'svc_admin:M3r1dian#1972', hit: true },
    { text: 'DBG_MODE=1 — maintenance endpoints enabled', hit: true },
    { text: 'force=1 triggers schema drop + reload', hit: true },
    { text: 'https://updates.meridiancare.example/v3', hit: false },
    { text: 'nginx-staging-node-04', hit: false },
  ];
  const DEBUG_DISASM = {
    idle: ['(not attached — process portal-agent PID 4171 is waiting)'],
    attached: [
      '0x004015a0  push   rbp',
      '0x004015a1  mov    rbp, rsp',
      '0x004015a4  call   0x401210 <load_config>',
      '0x004015a9  call   0x4012f0 <auth_check>',
      '0x004015ae  test   eax, eax',
      '0x004015b0  je     0x4015d4 <handle_request>',
    ],
    breakpoint: [
      '0x004012f0 <auth_check>   push   rbp',
      '0x004012f1 <auth_check+1> mov    rbp, rsp',
      '  … breakpoint armed — press RUN (F9)',
    ],
    running: ['process running… waiting for breakpoint…'],
    hit: [
      ' Breakpoint 1, auth_check () at portal-agent',
      ' 0x004012f2  cmp    byte ptr [rbp-0x8], 0x0',
      ' — process paused. Inspect locals →',
    ],
    stepped: [
      '0x00401317  call   0x4014b0 <handle_migrate>',
      '  lea    rax, [rip+0x2c1e]   ; "/internal/migrate"',
      '  mov    esi, 0x1            ; DBG_MODE gate',
      ' — stepping into handle_migrate →',
    ],
    revealed: [
      'Strings table filtered by executed paths:',
      '  ★ /internal/migrate',
      '  ★ svc_admin:M3r1dian#1972',
      '  ★ DBG_MODE=1 — maintenance endpoints enabled',
      '  ★ force=1 triggers schema drop + reload',
    ],
  };
  const M7_ANSWER = '/internal/migrate';
  const DEBUG_IMPACT_OPTIONS = [
    {
      id: 'impact_migrate',
      label: 'DBG_MODE=1 exposes an unauthenticated maintenance route that can drop and reload the database schema',
    },
    { id: 'impact_updates', label: 'The binary phones an update server that can be spoofed for remote code execution' },
    { id: 'impact_banner', label: 'The binary leaks the internal host name in a banner string' },
  ];

  // ---------------------------------------------------------------- Config
  const CONFIG_HEADERS = [
    'HTTP/1.1 200 OK',
    'Server: nginx/1.14.0 (MeridianStaging)',
    'Content-Type: text/html; charset=utf-8',
    'Set-Cookie: sessionid=8f3k2m9x; Path=/; Domain=staging.meridiancare.example',
    'X-Frame-Options: SAMEORIGIN',
    'Cache-Control: no-store',
    '',
    '// absent: Strict-Transport-Security, Content-Security-Policy,',
    '//         X-Content-Type-Options',
  ];
  const CONFIG_NGINX = [
    'server {',
    '  listen 443 ssl;',
    '  server_name staging.meridiancare.example;',
    '  ssl_protocols TLSv1.0 TLSv1.1 TLSv1.2 TLSv1.3;',
    '  ssl_certificate /etc/ssl/meridian-staging.pem;',
    '  location /uploads/ {',
    '    autoindex on;',
    '    alias /srv/static/uploads/;',
    '  }',
    '  location / {',
    '    proxy_pass http://127[.]0[.]0[.]1:8080;',
    '    proxy_set_header X-Forwarded-For $remote_addr;',
    '  }',
    '  error_log /var/log/nginx/staging-debug.log debug;',
    '}',
  ];
  const CONFIG_ADMIN = [
    'MeridianCare Admin Console — v3.0.0-rc2',
    'Signed in: site admin (factory password unchanged)',
    '[ Users ]  [ Maintenance ]  [ System ]',
    '',
    'DEBUG MODE: ON',
    '  · internal migration endpoint: /internal/migrate',
    '    (authentication disabled while DEBUG MODE is on)',
    '  · build info exposed at /_health',
  ];
  const CONFIG_ITEMS = [
    { id: 'c1', text: 'Admin console still accepts factory credentials (admin / admin123)', misconfig: true, hard: false },
    { id: 'c2', text: 'DEBUG MODE: ON — unauthenticated internal maintenance route exposed', misconfig: true, hard: false },
    { id: 'c3', text: 'Session cookie lacks Secure, HttpOnly and SameSite attributes', misconfig: true, hard: false },
    { id: 'c4', text: 'Error pages return full stack traces with framework and file paths', misconfig: true, hard: false },
    { id: 'c5', text: 'autoindex (directory listing) enabled on /uploads/', misconfig: true, hard: false },
    { id: 'c6', text: 'TLSv1.0 and TLSv1.1 are still negotiated on the staging vhost', misconfig: true, hard: false },
    { id: 'c7', text: 'Security headers absent: no CSP, HSTS, or X-Content-Type-Options', misconfig: true, hard: true },
    { id: 'd1', text: 'X-Frame-Options: SAMEORIGIN is present on responses', misconfig: false, hard: false },
    { id: 'd2', text: 'TLSv1.2 and TLSv1.3 are offered on the vhost', misconfig: false, hard: false },
    { id: 'd3', text: 'Plain HTTP requests are redirected to HTTPS', misconfig: false, hard: false },
    { id: 'd4', text: 'The nginx worker runs under a dedicated non-root service account', misconfig: false, hard: false },
  ];
  const H5_TOP3 = ['c1', 'c2', 'c4'];

  // ---------------------------------------------------------------- Remediation
  const FIX_OPTIONS = [
    { id: 'fix_param', label: 'Parameterized queries (prepared statements)' },
    { id: 'fix_encode', label: 'Output encoding + Content-Security-Policy' },
    { id: 'fix_authz', label: 'Server-side object-level authorization checks' },
    { id: 'fix_creds', label: 'Rotate default credentials + enforce MFA' },
    { id: 'fix_errors', label: 'Generic error pages; log details server-side' },
    { id: 'fix_waf', label: 'Deploy a WAF rule and accept residual risk' },
    { id: 'fix_escape', label: 'Escape single quotes in input before querying' },
    { id: 'fix_len', label: 'Limit the parameter to 10 characters' },
  ];
  const M10_ITEMS = [
    { id: 'f_sqli', text: 'SQL injection in /records?id=', fix: 'fix_param' },
    { id: 'f_xss', text: 'Reflected XSS in /search?q=', fix: 'fix_encode' },
    { id: 'f_idor', text: 'IDOR in /api/records?id=', fix: 'fix_authz' },
    { id: 'f_creds', text: 'Default admin credentials on the console', fix: 'fix_creds' },
    { id: 'f_err', text: 'Stack traces returned to users', fix: 'fix_errors' },
  ];
  const OWNER_OPTIONS = [
    { id: 'dev', label: 'Dev team (code change)' },
    { id: 'infra', label: 'Platform / infra (config change)' },
    { id: 'process', label: 'Security program (process)' },
  ];
  const M11_ITEMS = [
    { id: 'o1', text: 'Replace concatenated SQL with parameterized queries', owner: 'dev' },
    { id: 'o2', text: 'Encode user input before rendering into HTML templates', owner: 'dev' },
    { id: 'o3', text: 'Disable autoindex on the static file location', owner: 'infra' },
    { id: 'o4', text: 'Enforce a TLS 1.2+ minimum protocol policy', owner: 'infra' },
    { id: 'o5', text: 'Schedule quarterly authenticated scans with test accounts', owner: 'process' },
    { id: 'o6', text: 'Stand up an intake channel for externally reported web flaws', owner: 'process' },
  ];

  // ---------------------------------------------------------------- Scan plan
  const SCAN_PLAN = [
    { id: 'sp1', text: 'Run against the staging instance with synthetic production-like data', ok: true },
    { id: 'sp2', text: 'Use test accounts with a read-only role for the authenticated pass', ok: true },
    { id: 'sp3', text: 'Schedule in a maintenance window and notify the application team', ok: true },
    { id: 'sp4', text: 'Document scope and hold written authorization before scanning', ok: true },
    { id: 'sp5', text: 'Aggressively scan production during business hours for realism', ok: false },
    { id: 'sp6', text: 'Seed the test database with copies of real patient records', ok: false },
    { id: 'sp7', text: 'Enable unrestricted "exploit" plugins that can change data', ok: false },
  ];

  // ---------------------------------------------------------------- IDOR (H3)
  const IDOR_CONTROL_OPTIONS = [
    { id: 'ctl_authz', label: 'Object-level authorization: server-side ownership check on every record access' },
    { id: 'ctl_uuid', label: 'Switch sequential ids to random UUIDs only' },
    { id: 'ctl_waf', label: 'Add a WAF rule that blocks sequential id patterns' },
  ];
  const IDOR_MISSED_OPTIONS = [
    { id: 'miss_logic', label: 'It is a business-logic flaw: scanners surface the symptom, humans must judge exploitability' },
    { id: 'miss_enc', label: 'The scanner payload was URL-encoded incorrectly' },
    { id: 'miss_scope', label: 'The endpoint was outside the crawl scope' },
  ];
  const IDOR_VERIFY_OPTIONS = [
    { id: 'ver_twoacct', label: 'Two-account test: user A must not read user B’s record with the same request' },
    { id: 'ver_nmap', label: 'Re-run the network scanner against the API host' },
    { id: 'ver_header', label: 'Inspect response headers for caching directives' },
  ];

  // ---------------------------------------------------------------- Sequence (H6)
  const SEQ_STEPS = [
    { id: 'st1', text: 'Deploy a WAF virtual patch (injection signatures + rate limit) on the affected route' },
    { id: 'st2', text: 'Verify the application’s DB account is least-privilege to shrink the blast radius' },
    { id: 'st3', text: 'Turn on targeted detection: alert on SQL error patterns and 500 spikes on the route' },
    { id: 'st4', text: 'Ship the permanent code fix with a regression test, then rescan to close out' },
  ];
  const SEQ_COMPENSATING = [
    { id: 'comp_waflog', label: 'WAF virtual patch + enhanced logging + a named owner and an expiry date' },
    { id: 'comp_accept', label: 'Document and accept the risk until the sprint completes' },
    { id: 'comp_block', label: 'Take the patient portal offline until the fix ships' },
  ];

  // ---------------------------------------------------------------- Coverage (H7)
  const COVERAGE_ITEMS = [
    { id: 'cv1', text: 'Authenticated, role-based flows behind the login', gap: true },
    { id: 'cv2', text: 'Business-logic checks (e.g., object ownership between patients)', gap: true },
    { id: 'cv3', text: 'Client-side scripts and DOM sinks loaded in the browser', gap: true },
    { id: 'cv4', text: 'Open TCP ports and service banners on the web host', gap: false },
    { id: 'cv5', text: 'TLS protocol and certificate configuration', gap: false },
  ];
  const COVERAGE_NEXT = [
    { id: 'next_authmanual', label: 'Authenticated scan with test accounts + manual logic testing (two-account, workflow abuse)' },
    { id: 'next_rescan', label: 'Re-run the same unauthenticated scan with more threads' },
    { id: 'next_nessus', label: 'Run a generalized network scanner over the whole /24' },
  ];

  // ---------------------------------------------------------------- Proofs (H8)
  const PROOF_OPTIONS = [
    { id: 'pf_src_param', label: 'Source line: the query uses a bound placeholder — input cannot alter its structure' },
    { id: 'pf_log_only', label: 'App code: the header value is only written to server-side logs, never rendered' },
    { id: 'pf_fuzz_diff', label: 'Fuzz evidence: boolean differential + full-table response on the parameter' },
    { id: 'pf_twoacct', label: 'Two-account evidence: account A retrieved account B’s record via sequential id' },
    { id: 'pf_listing', label: 'HTTP response: GET /uploads/ returns a rendered index of files' },
    { id: 'pf_banner', label: 'HTTP banner alone — no behavioral evidence' },
  ];
  const H8_ITEMS = [
    { id: 'h8a', alert: 'SQL Injection — /search?q=', verdict: 'FP', proof: 'pf_src_param' },
    { id: 'h8b', alert: 'Reflected XSS via User-Agent header', verdict: 'FP', proof: 'pf_log_only' },
    { id: 'h8c', alert: 'SQL Injection — /records?id=', verdict: 'TP', proof: 'pf_fuzz_diff' },
    { id: 'h8d', alert: 'IDOR — /api/records?id=', verdict: 'TP', proof: 'pf_twoacct' },
    { id: 'h8e', alert: 'Directory listing — /uploads/', verdict: 'TP', proof: 'pf_listing' },
  ];

  // ---------------------------------------------------------------- Go/No-go (H9)
  const GO_CANDIDATES = [
    { id: 'g_sqli', text: 'SQL injection in patient lookup (pre-auth variant reachable)', blocking: true },
    { id: 'g_creds', text: 'Default admin credentials accepted on the console', blocking: true },
    { id: 'g_debug', text: 'DEBUG MODE exposes an unauthenticated maintenance route', blocking: true },
    { id: 'g_csp', text: 'Missing Content-Security-Policy header', blocking: false },
    { id: 'g_banner', text: 'Outdated nginx banner on staging', blocking: false },
    { id: 'g_upload', text: 'Directory listing on /uploads/ (static marketing assets only)', blocking: false },
  ];
  const GO_VERDICTS = [
    { id: 'nogo', label: 'NO-GO — fix blockers, then rescan before launch' },
    { id: 'go_waiver', label: 'GO with a signed waiver and monitoring' },
    { id: 'go', label: 'GO — the high findings alone are acceptable' },
  ];
  const GO_RATIONALES = [
    {
      id: 'r_chain',
      label:
        'Two pre-auth criticals plus a destructive debug route form a complete unauthenticated compromise chain; a waiver cannot compensate',
    },
    { id: 'r_speed', label: 'The launch date matters more than scanner noise; findings can be fixed post-launch' },
    { id: 'r_waf', label: 'A WAF in front of the portal fully neutralizes every listed finding' },
  ];

  // ---------------------------------------------------------------- Glossary
  const GLOSSARY = [
    { term: 'Web application scanner', def: 'Specialized tool that tests app-layer flaws (parameters, forms, logic) that network scanners miss.' },
    { term: 'Generalized vulnerability scanner', def: 'Network/service-oriented scanner (ports, banners, known CVEs) with shallow application coverage.' },
    { term: 'SAST (static analysis)', def: 'Reviews source code without executing it; finds unsafe patterns early; can produce false positives.' },
    { term: 'DAST (dynamic analysis)', def: 'Tests the running application from the outside (crawl → attack); no source code needed.' },
    { term: 'Fuzzing', def: 'Feeding malformed or unexpected input to trigger crashes or anomalous behavior.' },
    { term: 'Reverse engineering', def: 'Analyzing a compiled binary to understand hidden behavior or functionality.' },
    { term: 'Debugger', def: 'Runtime tool using breakpoints, stepping and memory inspection to reveal how software operates.' },
    { term: 'Breakpoint', def: 'A pause point set in a debugger to freeze execution and inspect state.' },
    { term: 'Disassembler', def: 'Tool translating machine code into readable assembly (Ghidra, IDA).' },
    { term: 'Security misconfiguration', def: 'An insecure default or forgotten setting: debug on, listing on, default creds, weak TLS.' },
    { term: 'Directory listing (autoindex)', def: 'Web-server feature exposing a file index when no default page exists.' },
    { term: 'Verbose error message', def: 'Error output leaking stack traces, paths or SQL details to the client.' },
    { term: 'Security headers', def: 'Response headers (CSP, HSTS, X-Content-Type-Options…) that enforce client-side protections.' },
    { term: 'Parameterized query', def: 'SQL executed with bound placeholders so input can never change the query structure.' },
    { term: 'IDOR', def: 'Insecure Direct Object Reference — accessing another user’s object by guessing its identifier.' },
    { term: 'False positive', def: 'A scanner alert proven wrong by verification evidence.' },
  ];

  // ---------------------------------------------------------------- Manual (C2)
  const MANUAL_SECTIONS = [
    {
      id: 'why',
      title: 'Why specialized web scanners exist',
      body: [
        'A generalized vulnerability scanner (Nessus-class) is built around hosts: it enumerates ports, fingerprints services, checks patch levels and known CVEs. It is excellent at answering "what is running and how old is it?".',
        'Application flaws live somewhere else — inside parameters, forms, session handling and business logic. "GET /records?id=1001 returns 200" looks perfectly healthy to a port scanner; only a web application scanner probes what happens when id becomes 1002, or \' OR \'1\'=\'1.',
        'That is why the lesson’s first claim matters: web app scanners find the vulnerability class that generalized tools systematically miss.',
      ],
    },
    {
      id: 'sastdast',
      title: 'Static vs dynamic analysis',
      body: [
        'SAST (static application security testing) reads the source (or bytecode) without running it. It sees the dangerous pattern directly — a concatenated SQL string, an unencoded output — and can gate code in CI before release. Weakness: context; SAST flags patterns, so false positives are common and a human must confirm.',
        'DAST (dynamic application security testing) attacks the running application from the outside, exactly like an attacker would: crawl the surface, then send test payloads. It needs no source code and proves behavior. Weakness: it only sees what it can reach — unauthenticated areas and multi-step logic can stay hidden.',
        'Mature programs run both: SAST early in development, DAST against the staged build, plus a human for what neither can judge.',
      ],
    },
    {
      id: 'fuzz',
      title: 'Fuzzing',
      body: [
        'A fuzzer feeds malformed, boundary or mutation payloads into a target and watches for crashes, errors or anomalous responses. It is how you discover what a parser does with input nobody anticipated.',
        'Reading fuzz output is a skill in itself: compare every response against a baseline. A 500 with a SQL error is error-based evidence; a boolean differential (same request, one changed byte, different response shape) is blind-injection evidence; a huge response on a normal status code is data exposure.',
      ],
    },
    {
      id: 'debug',
      title: 'Debuggers & reverse engineering',
      body: [
        'A debugger attaches to a running program: you set breakpoints, freeze execution, and inspect locals, registers and memory. It reveals how the software actually behaves — not what the documentation claims.',
        'Static reverse engineering (disassemblers/decompilers such as Ghidra) and the strings table expose embedded routes, credentials and feature flags that never appear in any UI.',
        'Defensive uses: verify what a third-party binary really does, analyze suspicious files, confirm a vendor’s "no telemetry" claim, recover hardcoded secrets before attackers do. Offsetting control: strip debug symbols and flags from release builds and scan for secrets in CI.',
      ],
    },
    {
      id: 'misconfig',
      title: 'Configuration issues & exploitable misconfigurations',
      body: [
        'Security misconfigurations (OWASP Top 10 2021 — A05) are the flaws you ship by forgetting: debug endpoints left enabled, directory listing on, default credentials unchanged, weak TLS still negotiated, security headers absent, stack traces returned to users.',
        'Individually each may look minor; chained, they are how real breaches happen — a verbose error feeds the injection, the injection feeds the database, default credentials make it admin. Your scanner output is the checklist; configuration review is the confirmation.',
      ],
    },
  ];

  const REAL_CASES = [
    {
      title: 'Equifax (2017)',
      text: 'Attackers exploited an unpatched Apache Struts flaw (CVE-2017-5638) in a web-facing portal — 147M records. Lesson: web-facing components need app-layer testing and rapid patching.',
    },
    {
      title: 'Capital One (2019)',
      text: 'A misconfigured WAF plus SSRF in a web application exposed 100M credit applications. Lesson: configuration review is vulnerability analysis, not paperwork.',
    },
    {
      title: 'MOVEit (2023)',
      text: 'A single SQL injection (CVE-2023-34362) in a web file-transfer app cascaded across thousands of organizations. Lesson: one parameterized-query miss is an enterprise event.',
    },
  ];

  // ---------------------------------------------------------------- Briefing (C1)
  const BRIEFING = {
    org: 'MeridianCare',
    lines: [
      'MeridianCare — a fictional regional healthcare network — ships "Patient Portal v3" in ten days. The external penetration test is booked for after launch, which is exactly backwards, and everyone knows it.',
      'You are the new application security analyst. Last night you received a staging build (v3.0.0-rc2) and written authorization for internal testing. The workbench in front of you carries eight instruments: a mock target browser, a static analyzer, a dynamic scanner, a fuzzer, a debugger, a configuration probe, a triage board and the tool rack itself.',
      'Your mission: run the instruments, collect evidence, triage what is real, and hand the launch board a defensible go / no-go picture. Everything you see is synthetic training data — the skills are the real thing you will reuse on the CySA+ exam (vulnerability-management domain) and in a real SOC.',
    ],
    objectives: [
      'Operate the four analysis techniques: static, dynamic, fuzzing, debugging.',
      'Triage scanner output — keep true findings, kill false positives with evidence.',
      'Enumerate exploitable misconfigurations and map concrete fixes.',
    ],
  };

  // ---------------------------------------------------------------- Debrief (C6)
  const DEBRIEF = {
    detection: [
      'Ingest scanner reports into the vulnerability-management pipeline (risk register, CVSS, owner, due date) so findings are tracked to closure and re-scanned.',
      'Watch exploitation attempts, not just misconfigurations: WAF and app logs with injection signatures, 500-error spikes, and sequential-id access patterns.',
      'Monitor configuration drift: TLS policy, security headers, directory listing and debug flags belong in a hardened baseline that is re-checked on every deploy.',
      'Run secret scanning and SBOM checks in CI so embedded credentials and outdated components (nginx, jQuery) surface before release, not after.',
    ],
    mitigations: [
      'Parameterized queries for every data-bearing statement (OWASP A03: Injection).',
      'Output encoding + Content-Security-Policy for rendered input (A03 / A05).',
      'Server-side object-level authorization on every object access (A01: Broken Access Control).',
      'Secure / HttpOnly / SameSite cookies, TLS 1.2+ policy, HSTS (A02: Cryptographic Failures).',
      'Kill misconfigurations at the baseline: no debug flags in release builds, autoindex off, generic error pages, no default credentials + MFA (A05: Security Misconfiguration).',
      'WAF rules are compensating controls: pair with a named owner and an expiry date, and never let them replace the code fix.',
    ],
    blue: [
      'Tune before trusting: an authenticated scan with test accounts sees a different application than an anonymous crawl.',
      'Verify before reporting: one source line or one HTTP diff turns a noisy alert into a defensible ticket.',
      'Rank by exploitability (precondition × impact), not by scanner severity alone.',
      'Rescan after every fix — closure without verification is a guess.',
    ],
    red: [
      'Chain the small stuff: verbose errors feed injection; injection feeds the database; default credentials make it admin.',
      'Debug artifacts are treasure: build flags, hidden routes and embedded credentials routinely survive into staging-like builds.',
      'Business logic is where scanners go blind — ownership checks and workflow abuse need a human attacker’s patience.',
      'robots.txt, /_health and error pages advertise structure; reconnaissance is mostly reading.',
    ],
    links: [
      { label: 'OWASP Top 10 — 2021', url: 'https://owasp.org/Top10/' },
      { label: 'OWASP Web Security Testing Guide (WSTG)', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
      { label: 'OWASP ZAP — open-source web scanner', url: 'https://www.zaproxy.org/' },
      { label: 'CompTIA CySA+ CS0-003 exam details', url: 'https://www.comptia.org/certifications/cybersecurity-analyst' },
    ],
    next: [
      'Lesson 12.2 — analyzing application logic and API abuse',
      'OWASP WSTG chapters 4.1–4.3 (information gathering → authentication)',
      'Practice: run OWASP ZAP against a deliberately vulnerable training app (e.g., OWASP Juice Shop)',
    ],
  };

  CL.DATA = {
    TARGET, TRAINING_NOTICE, TOOL_CATS, TOOLS, M1_EXPECT, M2_FINDINGS, M8_SCENARIOS,
    CODE_FILES, M3_SINK, M3_FLAW_OPTIONS, CRAWL_LOG, ALERTS, M4_ANSWER,
    FUZZ_TARGET, FUZZ_ROWS, M6_ANSWER,
    DEBUG_FUNCTIONS, DEBUG_LOCALS, DEBUG_STRINGS, DEBUG_DISASM, M7_ANSWER, DEBUG_IMPACT_OPTIONS,
    CONFIG_HEADERS, CONFIG_NGINX, CONFIG_ADMIN, CONFIG_ITEMS, H5_TOP3,
    FIX_OPTIONS, M10_ITEMS, OWNER_OPTIONS, M11_ITEMS, SCAN_PLAN,
    IDOR_CONTROL_OPTIONS, IDOR_MISSED_OPTIONS, IDOR_VERIFY_OPTIONS,
    SEQ_STEPS, SEQ_COMPENSATING, COVERAGE_ITEMS, COVERAGE_NEXT, PROOF_OPTIONS, H8_ITEMS,
    GO_CANDIDATES, GO_VERDICTS, GO_RATIONALES,
    GLOSSARY, MANUAL_SECTIONS, REAL_CASES, BRIEFING, DEBRIEF,
  };
})(window.CyberLab);
