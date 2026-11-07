// ─── Ledgerline · mastery blueprint (objectives Medium 12 / Hard 10) ────────
// Static port of src/lib/lab/objectives.ts — validators, hints, feedback 1:1.
'use strict';

// answer access helpers -------------------------------------------------------
function ansObj(ctx, obj, field) {
  return (ctx.answers[obj] && ctx.answers[obj][field]) || {};
}
function ansStr(ctx, obj, field) {
  var v = ctx.answers[obj] ? ctx.answers[obj][field] : undefined;
  return typeof v === 'string' ? v : '';
}
function ansList(ctx, obj, field) {
  var v = ctx.answers[obj] ? ctx.answers[obj][field] : undefined;
  return Array.isArray(v) ? v : [];
}
function setEq(actual, expected) {
  return actual.length === expected.length && expected.every(function (e) { return actual.includes(e); });
}

// ─── MEDIUM — Guided Audit (12 objectives) ──────────────────────────────────
const MEDIUM_OBJECTIVES = [
  {
    id: 'OBJ-M1', mode: 'medium', pillar: 'P3',
    title: 'Run the baseline posture scan and read the ledger',
    context: 'Every audit starts with a sweep of the whole estate. Run the scan, then use the findings ledger to answer where the estate bleeds most.',
    anchor: 'Lesson 6.5 "identify": posture scanning (CSPM) as the primary misconfiguration detector',
    hints: [
      'The SCAN button is at the top of the Audit Desk. After it finishes, count the CRITICAL stamps per service family in the findings list.',
      'Criticals sit in: Storage (exports bucket), Identity (wildcard policy), Data (public DB), Network (two security groups) and Account (audit trail).',
      'Two critical findings share one family: sg-ops-bastion (port 22) and sg-db-tier (port 5432) — both are Network.',
    ],
    validate: function (ctx) {
      return (ctx.scanCount > 0 && ansStr(ctx, 'OBJ-M1', 'family') === 'network')
        ? { pass: true, detail: 'Correct — Network carries two CRITICAL findings.' }
        : { pass: false, detail: ctx.scanCount === 0 ? 'Run the posture scan first, then count critical findings per family.' : 'Not this family — count the CRITICAL stamps again (bastion SSH and database 5432 sit together).' };
    },
    inputs: [{
      kind: 'select', field: 'family', label: 'Which service family produced the most CRITICAL findings?',
      options: [
        { value: 'storage', label: 'Object Storage' }, { value: 'identity', label: 'Identity & Access' },
        { value: 'network', label: 'Network' }, { value: 'data', label: 'Data & Databases' },
        { value: 'account', label: 'Account Guardrails' },
      ],
    }],
    jump: { resource: 'sg-ops-bastion', note: 'Network family in the ledger' },
    feedback: 'A CSPM answers "where do we bleed most?" in seconds — but severity is the scanner\'s opinion, not a proof of impact. Keep that in mind: the breach in Hard mode will start from a HIGH finding. A defender triages by exploitability × blast radius, then fixes.',
  },
  {
    id: 'OBJ-M2', mode: 'medium', pillar: 'P1',
    title: 'Sort six duties by the shared responsibility model',
    context: 'Before fixing anything, know whose job it is. Assign each duty to Customer (in the cloud) or Provider (of the cloud).',
    anchor: 'Shared responsibility model as the decision rule for "who fixes which misconfiguration"',
    hints: [
      'Think "of the cloud" (platform: hardware, hypervisor, facilities) vs "in the cloud" (anything you configure).',
      'Physical security and hypervisor patching happen inside the provider\'s datacenter.',
      'Every setting that appears in a customer console — SG rules, policies, MFA, encryption choices — is customer duty.',
    ],
    validate: function (ctx) {
      var r = ansObj(ctx, 'OBJ-M2', 'items');
      var exp = { sg: 'customer', policy: 'customer', hypervisor: 'provider', mfa: 'customer', facility: 'provider', enc: 'customer' };
      var ok = Object.keys(exp).every(function (k) { return r[k] === exp[k]; });
      return ok ? { pass: true, detail: 'All six duties assigned correctly.' }
        : { pass: false, detail: 'Some duties are misassigned. Rule of thumb: if the customer configures it in a console, it is customer duty; if it lives under the provider\'s floor tiles or hypervisor, it is provider duty.' };
    },
    inputs: [{
      kind: 'cards', field: 'items', label: 'Customer or provider?',
      items: [
        { id: 'sg', label: 'Writing security-group rules' },
        { id: 'policy', label: 'Setting an S3 bucket policy' },
        { id: 'hypervisor', label: 'Patching the hypervisor host' },
        { id: 'mfa', label: 'Enabling MFA on IAM users' },
        { id: 'facility', label: 'Physical datacenter security' },
        { id: 'enc', label: 'Choosing disk encryption' },
      ].map(function (it) {
        return Object.assign({}, it, { options: [
          { value: 'customer', label: 'Customer' }, { value: 'provider', label: 'Provider' },
        ] });
      }),
    }],
    feedback: 'When a bucket leaks, the provider\'s status page will be green — the misconfiguration was customer-side. This split is also why the provider can truthfully say "no vulnerability on our platform": the working platform misused is still the customer\'s incident.',
  },
  {
    id: 'OBJ-M3', mode: 'medium', pillar: 'P2',
    title: 'Triage the exports bucket: mark the bad statement, then harden it',
    context: 'Open nl-customer-db-exports. In its policy, mark the statement that grants anonymous reads — then apply the full hardening set.',
    anchor: 'Storage misconfiguration: anonymous-read policy, block-public-access, encryption, logging, versioning',
    hints: [
      'The Policy tab lists three statements. Look for Principal "*".',
      'The fix is one switch: Block Public Access (it overrides the anonymous statement), then set encryption to SSE-KMS, turn on access logging and versioning.',
      'All four controls live in the Config tab of the bucket dossier.',
    ],
    jump: { resource: 'st-nl-exports', note: 'nl-customer-db-exports' },
    validate: function (ctx) {
      var b = ctx.configs.buckets['st-nl-exports'];
      var marked = b.markedStatements.includes('stmt-anon-read');
      var hardened = b.blockPublicAccess && !b.publicRead && b.encryption === 'sse-kms' && b.accessLogging && b.versioning;
      if (marked && hardened) return { pass: true, detail: 'Statement identified and the bucket fully hardened.' };
      if (!marked) return { pass: false, detail: 'Open the Policy tab and mark the statement that grants anonymous access (Principal "*").' };
      return { pass: false, detail: 'Statement marked. Bucket state: blockPublic=' + b.blockPublicAccess + ', encryption=' + b.encryption + ', logging=' + b.accessLogging + ', versioning=' + b.versioning + ' — finish the hardening set in the Config tab.' };
    },
    feedback: 'Block Public Access is the belt-and-braces control: even if someone later re-adds a bad statement, the guardrail overrides it. Logging + versioning then give you detection and recoverability. One finding, four controls — that is normal for storage.',
  },
  {
    id: 'OBJ-M4', mode: 'medium', pillar: 'P4',
    title: 'Rewrite svc-deploy to least privilege and enforce MFA',
    context: 'The pipeline only pushes and pulls artifacts from nl-deploy-artifacts. Pick the replacement policy that grants exactly that — and enforce MFA for console use.',
    anchor: 'IAM misconfiguration: wildcard Action/Resource; least-privilege rewrite; MFA enforcement',
    hints: [
      'A correct policy names the two s3 actions the pipeline needs and the one bucket path — no "*" anywhere.',
      'Reject anything with s3:* : "all S3 actions" is still far beyond the need.',
      'The policy switch and the MFA switch both live on the svc-deploy dossier.',
    ],
    jump: { resource: 'iam-svc-deploy', note: 'svc-deploy identity' },
    validate: function (ctx) {
      var id = ctx.configs.identities['iam-svc-deploy'];
      if (id.policyId === 'pol-least-deploy' && id.mfa) return { pass: true, detail: 'Least-privilege policy applied and MFA enforced.' };
      if (id.mfa && id.policyId !== 'pol-least-deploy') return { pass: false, detail: 'MFA done, but the chosen policy still over-grants (look for the option with exactly s3:GetObject + s3:PutObject on the artifacts path).' };
      return { pass: false, detail: 'Pick the policy scoped to s3:GetObject/s3:PutObject on nl-deploy-artifacts/*, and switch MFA on.' };
    },
    feedback: 'Least privilege is blast-radius engineering: with the scoped policy, the stolen key in Hard mode could have touched one bucket, not the whole account. Wildcards are how a pipeline credential becomes an account takeover.',
  },
  {
    id: 'OBJ-M5', mode: 'medium', pillar: 'P4',
    title: 'Revoke the exposed key, then rotate it — in that order',
    context: 'Key SKNS7F4K9Q2MEXAMPLE is embedded in user-data and printed into archived logs. Kill it correctly: revoke first, then issue its replacement.',
    anchor: 'Credential hygiene: revoke→rotate order for exposed static keys (Domain 6.3 move)',
    hints: [
      'Both buttons are on the svc-deploy dossier. Order matters: revoke kills the exposed credential immediately.',
      'Rotating before revoking leaves the exposed key live while you work.',
      'Revoke Key, then Rotate Key — watch the key list update.',
    ],
    jump: { resource: 'iam-svc-deploy', note: 'svc-deploy identity' },
    validate: function (ctx) {
      var id = ctx.configs.identities['iam-svc-deploy'];
      var revokedFirst = ctx.actions.indexOf('iam-svc-deploy:revoke-key') > -1
        && ctx.actions.indexOf('iam-svc-deploy:rotate-key') > -1
        && ctx.actions.indexOf('iam-svc-deploy:revoke-key') < ctx.actions.indexOf('iam-svc-deploy:rotate-key');
      var exposedGone = !id.keys.some(function (k) { return k.exposure === 'exposed' && k.status === 'active'; });
      if (exposedGone && revokedFirst) return { pass: true, detail: 'Exposed key revoked, replacement issued — correct order.' };
      if (exposedGone) return { pass: false, detail: 'Key is dead but the sequence was off — containment (revoke) must precede rotation. Undo is impossible once a key leaks, so order is part of the fix.' };
      return { pass: false, detail: 'The exposed key is still active. Revoke it first, then rotate.' };
    },
    feedback: 'Revoke → rotate → investigate is the Domain 6.3 reflex. Revoking first freezes attacker access; rotating restores service. If you rotate first, you have just issued a new credential while the old one is still working for someone else.',
  },
  {
    id: 'OBJ-M6', mode: 'medium', pillar: 'P4',
    title: 'Close the network doors: bastion SSH and the database port',
    context: 'Two security groups listen to the entire internet. Restrict SSH to the corporate VPN range and PostgreSQL to the app-tier subnet.',
    anchor: 'Network misconfiguration: 0.0.0.0/0 on management/DB ports; tier segmentation by CIDR',
    hints: [
      'Open both SG dossiers; each rule has a source-CIDR selector.',
      'SSH for humans → the VPN egress range. Database → the private app subnet.',
      'Correct pairs: 22 → 198.51.100.0/24, 5432 → 10.20.3.0/24.',
    ],
    jump: { resource: 'sg-ops-bastion', note: 'bastion security group' },
    validate: function (ctx) {
      var bastionRule = ctx.configs.sgs['sg-ops-bastion'].rules.find(function (r) { return r.id === 'r-22'; });
      var dbRule = ctx.configs.sgs['sg-db-tier'].rules.find(function (r) { return r.id === 'r-5432'; });
      var bastion = bastionRule ? bastionRule.source : undefined;
      var db = dbRule ? dbRule.source : undefined;
      if (bastion === '198.51.100.0/24' && db === '10.20.3.0/24') return { pass: true, detail: 'Both doors closed to the internet.' };
      return { pass: false, detail: 'Current: SSH from ' + (bastion != null ? bastion : '?') + ', PostgreSQL from ' + (db != null ? db : '?') + '. Set SSH to the VPN range (198.51.100.0/24) and PostgreSQL to the app subnet (10.20.3.0/24).' };
    },
    feedback: 'Network segmentation (ATT&CK mitigation M1030) is the cheapest containment there is: even a valid stolen credential cannot reach a port its source address cannot route to. "0.0.0.0/0" on a rule is always a decision — make sure it is yours.',
  },
  {
    id: 'OBJ-M7', mode: 'medium', pillar: 'P4',
    title: 'Harden the compute tier: IMDSv2 everywhere, drop the stray public IP',
    context: 'Instance metadata v1 hands credentials to anything that can make the host issue a request. Enforce token-required metadata on both vulnerable instances and remove i-web01\'s unneeded public address.',
    anchor: 'Compute misconfiguration: IMDSv1 enabled; unneeded public IPs',
    hints: [
      'Check the Config tab of each instance dossier for the IMDS selector.',
      'i-web01 (v1+v2) and i-analytics01 (v1) both need v2-only.',
      'The public-IP toggle is on i-web01.',
    ],
    jump: { resource: 'in-web01', note: 'i-web01 dossier' },
    validate: function (ctx) {
      var w = ctx.configs.instances['in-web01'];
      var an = ctx.configs.instances['in-analytics01'];
      if (w.imds === 'v2' && an.imds === 'v2' && !w.publicIp) return { pass: true, detail: 'Metadata hard v2, public IP removed.' };
      return { pass: false, detail: 'Current: i-web01 imds=' + w.imds + ', publicIp=' + w.publicIp + '; i-analytics01 imds=' + an.imds + '. Both instances need imds=v2 and the web node must lose its public IP.' };
    },
    feedback: 'This is the exact control that would have blunted the Capitol One attack: with token-required metadata, an SSRF reply no longer contains credentials. Defense in depth: even a perfect web app is one request-injection bug away from the metadata service.',
  },
  {
    id: 'OBJ-M8', mode: 'medium', pillar: 'P2',
    title: 'Hunt the exposed key: find both leak paths, then scrub the source',
    context: 'Key SKNS7F4K9Q2MEXAMPLE sits in more than one place. Locate every exposure, then remove it from the provisioning script.',
    anchor: 'Credential exposure: secrets in user-data and in archived log objects (T1552.001)',
    hints: [
      'One copy is in the user-data of an instance dossier; the other is inside an object of a storage bucket.',
      'Check the Evidence tab of i-analytics01 and the object list of nl-logs-archive.',
      'Then use the "Remove secret from user-data" action on i-analytics01.',
    ],
    jump: { resource: 'in-analytics01', note: 'i-analytics01 evidence' },
    validate: function (ctx) {
      var p = ansObj(ctx, 'OBJ-M8', 'places');
      var scrubbed = ctx.configs.instances['in-analytics01'].userDataSecretRemoved;
      if (p['user-data'] === 'yes' && p['log-object'] === 'yes' && scrubbed) return { pass: true, detail: 'Both leak paths found and the source scrubbed.' };
      if (!scrubbed) return { pass: false, detail: 'Both places may be marked, but the secret still lives in user-data — remove it.' };
      return { pass: false, detail: 'The key appears in exactly two places: the instance user-data and the archived debug-log object. Confirm both.' };
    },
    inputs: [{ kind: 'cards', field: 'places', label: 'Where does the exposed key live? (mark every place you can prove from the evidence)', items: [
      { id: 'user-data', label: 'i-analytics01 user-data script', options: [{ value: 'yes', label: 'Key is here' }, { value: 'no', label: 'Not here' }] },
      { id: 'log-object', label: 'nl-logs-archive — app-debug.log object', options: [{ value: 'yes', label: 'Key is here' }, { value: 'no', label: 'Not here' }] },
      { id: 'db-user-data', label: 'i-web01 user-data script', options: [{ value: 'yes', label: 'Key is here' }, { value: 'no', label: 'Not here' }] },
    ] }],
    feedback: 'Secrets never leak once. A key hardcoded in user-data got printed by a DEBUG line, archived, and made anonymous-readable — three misconfigurations amplifying each other. After scrubbing, the archived log object still contains the old key: that is why the revoke in OBJ-M5 mattered.',
  },
  {
    id: 'OBJ-M9', mode: 'medium', pillar: 'P3',
    title: 'Turn the lights on: audit trail and drift alerts',
    context: 'The account is blind. Enable the control-plane audit trail and configuration-drift alerting so future misconfigurations announce themselves.',
    anchor: 'Logging/monitoring misconfiguration: disabled audit trail; missing drift alerts (M1047 Audit)',
    hints: [
      'Both switches are on the Landing-zone settings dossier.',
      'Audit trail = detection AND forensics; drift alerts = continuous posture.',
      'Enable both.',
    ],
    jump: { resource: 'acct-nimbus', note: 'landing-zone settings' },
    validate: function (ctx) {
      return (ctx.configs.account['acct-nimbus'].auditTrail && ctx.configs.account['acct-nimbus'].driftAlerts)
        ? { pass: true, detail: 'Audit trail on, drift alerts on — the account can see again.' }
        : { pass: false, detail: 'Both account switches (audit trail, drift alerts) must be enabled.' };
    },
    feedback: 'ATT&CK mitigation M1047 (Audit) in practice: the trail answers "what happened?", drift alerts answer "what just changed?". Everything else you fixed can silently regress — these two controls are how you would know.',
  },
  {
    id: 'OBJ-M10', mode: 'medium', pillar: 'P2',
    title: 'Judge three public exposures: accepted exception or must-fix?',
    context: 'Not every finding deserves a change. Rule on each: accept as documented exception, or fix.',
    anchor: 'Triage judgment: true issue vs accepted exception (distractors in the estate)',
    hints: [
      'Read each resource\'s exception note in its dossier header.',
      'The marketing site bucket is scoped to assets/* with writes denied.',
      'The web tier 443 is the product; the log archive is nobody\'s product.',
    ],
    jump: { resource: 'st-nl-site', note: 'nl-static-website dossier' },
    validate: function (ctx) {
      var v = ansObj(ctx, 'OBJ-M10', 'verdicts');
      var ok = v['st-nl-site'] === 'exception' && v['sg-web-tier'] === 'exception' && v['st-nl-logs'] === 'fix';
      return ok ? { pass: true, detail: 'All three rulings correct.' }
        : { pass: false, detail: 'Rethink: scoped public assets and the public HTTPS listener are documented exceptions; the anonymous log archive is the true issue.' };
    },
    inputs: [{
      kind: 'cards', field: 'verdicts', label: 'Exception or fix?',
      items: [
        { id: 'st-nl-site', label: 'nl-static-website — public GetObject on assets/*, writes denied, CDN-fronted', options: [
          { value: 'exception', label: 'Accepted exception' }, { value: 'fix', label: 'Must fix' }] },
        { id: 'sg-web-tier', label: 'sg-web-tier — 443/tcp from 0.0.0.0/0 on the public web tier', options: [
          { value: 'exception', label: 'Accepted exception' }, { value: 'fix', label: 'Must fix' }] },
        { id: 'st-nl-logs', label: 'nl-logs-archive — anonymous GetObject on the whole bucket', options: [
          { value: 'exception', label: 'Accepted exception' }, { value: 'fix', label: 'Must fix' }] },
      ],
    }],
    feedback: 'This is the CSPM skill the exam implies but never states: a posture tool reports exposure, not intent. You just distinguished "public on purpose, scoped, documented" from "public by accident, unscoped, undocumented" — the exact judgment that keeps change windows sane.',
  },
  {
    id: 'OBJ-M11', mode: 'medium', pillar: 'P1',
    title: 'Map the misconfigurations to their ATT&CK techniques',
    context: 'Connect each misconfiguration to the technique it enables, so the next incident debrief speaks ATT&CK.',
    anchor: 'Attack-chain context: T1530, T1552.001, T1552.005, T1078.004',
    hints: [
      'Anonymous object reads are Collection; metadata theft is a Credential Access sub-technique.',
      'A hardcoded key in a file is "Credentials In Files".',
      'Using the stolen cloud account is Valid Accounts: Cloud Accounts.',
    ],
    validate: function (ctx) {
      var m = ansObj(ctx, 'OBJ-M11', 'map');
      var exp = { 'pub-bucket': 'T1530', 'user-data-key': 'T1552.001', 'imds-v1': 'T1552.005', 'stolen-key': 'T1078.004' };
      var ok = Object.keys(exp).every(function (k) { return m[k] === exp[k]; });
      return ok ? { pass: true, detail: 'All four mappings correct.' }
        : { pass: false, detail: 'Check the pairing: reads=T1530 (Collection), key-in-file=T1552.001, metadata-API=T1552.005, account-use=T1078.004.' };
    },
    inputs: [{
      kind: 'cards', field: 'map', label: 'Assign the technique',
      items: [
        { id: 'pub-bucket', label: 'Anonymous-readable bucket', options: [
          { value: 'T1530', label: 'T1530 Data from Cloud Storage' }, { value: 'T1552.005', label: 'T1552.005 Metadata API' },
          { value: 'T1078.004', label: 'T1078.004 Valid Accounts (Cloud)' }, { value: 'T1552.001', label: 'T1552.001 Credentials In Files' }] },
        { id: 'user-data-key', label: 'Access key hardcoded in user-data', options: [
          { value: 'T1530', label: 'T1530 Data from Cloud Storage' }, { value: 'T1552.005', label: 'T1552.005 Metadata API' },
          { value: 'T1078.004', label: 'T1078.004 Valid Accounts (Cloud)' }, { value: 'T1552.001', label: 'T1552.001 Credentials In Files' }] },
        { id: 'imds-v1', label: 'Metadata service without token requirement', options: [
          { value: 'T1530', label: 'T1530 Data from Cloud Storage' }, { value: 'T1552.005', label: 'T1552.005 Metadata API' },
          { value: 'T1078.004', label: 'T1078.004 Valid Accounts (Cloud)' }, { value: 'T1552.001', label: 'T1552.001 Credentials In Files' }] },
        { id: 'stolen-key', label: 'Stolen cloud access key in active use', options: [
          { value: 'T1530', label: 'T1530 Data from Cloud Storage' }, { value: 'T1552.005', label: 'T1552.005 Metadata API' },
          { value: 'T1078.004', label: 'T1078.004 Valid Accounts (Cloud)' }, { value: 'T1552.001', label: 'T1552.001 Credentials In Files' }] },
      ],
    }],
    feedback: 'Four misconfigurations, four steps of one attack chain — exposure (recon), collection, credential access, account use. Speaking in technique IDs makes the debrief actionable: each ID links to detections and mitigations defenders already track.',
  },
  {
    id: 'OBJ-M12', mode: 'medium', pillar: 'P4',
    title: 'Verify: re-scan to a clean posture and pick the first move',
    context: 'Fix whatever remains, re-scan until only the documented exceptions remain — then answer the one question change-control always asks: what goes first?',
    anchor: 'Verification by re-scan; containment-before-hardening prioritization',
    hints: [
      'The posture gauge reads 100 only when every finding is resolved (exceptions excluded by design).',
      'Still glowing? Check the dev-sandbox encryption, the app volume, database settings and the stale analytics key.',
      'If you could push exactly one change tonight: which one cuts off a working attacker path right now?',
    ],
    validate: function (ctx) {
      var open = FINDINGS.filter(function (f) { return f.active(ctx.configs); });
      var prio = ansStr(ctx, 'OBJ-M12', 'priority') === 'revoke-key';
      if (open.length === 0 && prio) return { pass: true, detail: 'Clean scan — zero open findings, and the first move is right.' };
      if (open.length === 0) return { pass: false, detail: 'Scan is clean, but the first-move answer is off: containment (revoke the exposed key) beats hardening when only one change can ship.' };
      return { pass: false, detail: open.length + ' finding(s) still active: ' + open.slice(0, 4).map(function (f) { return f.code; }).join(', ') + (open.length > 4 ? '…' : '') + '. Clear them all, then re-scan.' };
    },
    inputs: [{
      kind: 'select', field: 'priority', label: 'Change-control asks for ONE fix before the weekend. Which?',
      options: [
        { value: 'revoke-key', label: 'Revoke the exposed, actively-used access key' },
        { value: 'ver', label: 'Enable versioning on the exports bucket' },
        { value: 'dev-enc', label: 'Encrypt the dev sandbox bucket' },
        { value: 'bastion', label: 'Restrict the bastion SSH source' },
      ],
    }],
    feedback: 'Priority = exploitability × blast radius ÷ effort. The exposed key is a working hostile login used this week — containment first. Versioning and dev encryption can wait a sprint. And your posture score moving 12 → 100 is the receipt: fixes are not done until a re-scan proves it.',
  },
];

// ─── HARD — Breach Aftermath (10 objectives) ────────────────────────────────
const HARD_OBJECTIVES = [
  {
    id: 'OBJ-H1', mode: 'hard', pillar: 'P2',
    title: 'Pin the foothold: which misconfiguration started the breach?',
    context: '4.2 GB of customer records are on a leak site. The audit event log is your only timeline. Name the asset whose misconfiguration gave the attacker entry — and the event that proves it.',
    anchor: 'Detection: reconstructing the initial access from audit evidence',
    hints: ['First unauthenticated activity lands at 02:07.'],
    validate: function (ctx) {
      return (ansStr(ctx, 'OBJ-H1', 'resource') === 'st-nl-logs' && ansStr(ctx, 'OBJ-H1', 'event') === 'E-01')
        ? { pass: true, detail: 'Foothold: nl-logs-archive, proven by E-01 (anonymous GetObject ×14).' }
        : { pass: false, detail: 'Follow the timeline strictly: the first unauthenticated, credential-less event names the entry asset.' };
    },
    inputs: [
      { kind: 'select', field: 'resource', label: 'Entry asset', options: [
        { value: 'st-nl-exports', label: 's3://nl-customer-db-exports' },
        { value: 'st-nl-logs', label: 's3://nl-logs-archive' },
        { value: 'st-nl-dev', label: 's3://nl-dev-scratch' },
        { value: 'sg-ops-bastion', label: 'sg-ops-bastion (SSH)' },
      ] },
      { kind: 'select', field: 'event', label: 'Proving event', options: [
        { value: 'E-01', label: 'E-01 — 02:07 unauthenticated GetObject ×14' },
        { value: 'E-02', label: 'E-02 — 02:12 debug-log download' },
        { value: 'E-03', label: 'E-03 — 02:19 ListBuckets with stolen key' },
        { value: 'E-05', label: 'E-05 — 02:31 GetObject ×412' },
      ] },
    ],
    feedback: 'E-01 shows reads with no credential at all — that is an anonymous-read policy, i.e., a customer misconfiguration as initial access. E-02 matters later (the harvest), but the foothold is the bucket, not the key.',
  },
  {
    id: 'OBJ-H2', mode: 'hard', pillar: 'P1',
    title: 'Reconstruct the attack chain and tag every step',
    context: 'Order the five observed steps causally and assign each its ATT&CK technique. No hints, no forgiveness on IDs.',
    anchor: 'Attack-chain mapping: T1530, T1552.001, T1078.004, T1619, T1567.002',
    hints: ['You cannot authenticate before you hold the key, and you cannot exfiltrate what you have not located.'],
    validate: function (ctx) {
      var order = ansList(ctx, 'OBJ-H2', 'order');
      var t = ansObj(ctx, 'OBJ-H2', 'tech');
      var expOrder = ['s1', 's2', 's3', 's4', 's5'];
      var expTech = { s1: 'T1530', s2: 'T1552.001', s3: 'T1078.004', s4: 'T1619', s5: 'T1567.002' };
      var orderOk = order.length === 5 && expOrder.every(function (id, i) { return order[i] === id; });
      var techOk = Object.keys(expTech).every(function (k) { return t[k] === expTech[k]; });
      if (orderOk && techOk) return { pass: true, detail: 'Chain reconstructed and fully tagged.' };
      if (orderOk && !techOk) return { pass: false, detail: 'Order is right — fix the technique tags: read=T1530, harvest=T1552.001, use-account=T1078.004, enumerate=T1619, stage-out=T1567.002.' };
      if (!orderOk && techOk) return { pass: false, detail: 'Tags are right — fix the sequence: acquire data → extract key → use account → locate targets → exfiltrate.' };
      return { pass: false, detail: 'Both the sequence and the tags need work. Think: what must exist before a valid login is possible?' };
    },
    inputs: [
      { kind: 'cards', field: 'tech', label: 'Technique per step', items: [
        { id: 's1', label: 'Step: download the debug log from the anonymous bucket', options: ['T1530', 'T1552.001', 'T1078.004', 'T1619', 'T1567.002'].map(function (v) { return { value: v, label: v }; }) },
        { id: 's2', label: 'Step: extract the embedded access key from that file', options: ['T1530', 'T1552.001', 'T1078.004', 'T1619', 'T1567.002'].map(function (v) { return { value: v, label: v }; }) },
        { id: 's3', label: 'Step: authenticate to the account with the stolen key', options: ['T1530', 'T1552.001', 'T1078.004', 'T1619', 'T1567.002'].map(function (v) { return { value: v, label: v }; }) },
        { id: 's4', label: 'Step: enumerate storage objects to find the exports', options: ['T1530', 'T1552.001', 'T1078.004', 'T1619', 'T1567.002'].map(function (v) { return { value: v, label: v }; }) },
        { id: 's5', label: 'Step: upload the dataset to attacker storage', options: ['T1530', 'T1552.001', 'T1078.004', 'T1619', 'T1567.002'].map(function (v) { return { value: v, label: v }; }) },
      ] },
      { kind: 'order', field: 'order', label: 'Causal order (first → last)' },
    ],
    feedback: 'A five-step chain with zero exploits: read (T1530) → harvest (T1552.001) → valid account (T1078.004) → enumerate (T1619) → exfiltrate (T1567.002). Every step was a permitted API call — the chain is made of misconfigurations, not malware.',
  },
  {
    id: 'OBJ-H3', mode: 'hard', pillar: 'P2',
    title: 'Name the exact three findings that enabled the breach',
    context: 'The estate carries many findings, but causality is narrow. Select the findings that directly made this breach possible — exactly three, no more, no less.',
    anchor: 'Triage: separating causative findings from real-but-irrelevant noise',
    hints: ['The trail being off hid the breach; it did not cause it.'],
    validate: function (ctx) {
      var sel = ansObj(ctx, 'OBJ-H3', 'set');
      var chosen = Object.keys(sel).filter(function (k) { return sel[k] === 'yes'; });
      var exp = ['F-LOGS-PUBLIC', 'F-SVC-EXPOSED', 'F-SVC-WILDCARD'];
      if (setEq(chosen, exp)) return { pass: true, detail: 'Causal triad correct.' };
      if (chosen.includes('F-ACCT-TRAIL')) return { pass: false, detail: 'The disabled audit trail delayed detection but caused nothing — rejection is exact: a finding causes the breach only if removing it breaks the chain.' };
      return { pass: false, detail: 'Not this set (' + chosen.length + '/3 chosen). Test each candidate: if that finding were fixed, would the breach have been impossible? Exactly three pass that test.' };
    },
    inputs: [{ kind: 'cards', field: 'set', label: 'Causal findings (choose exactly 3)', items:
      FINDINGS.map(function (f) {
        return { id: f.id, label: f.code + ' — ' + f.title, options: [
          { value: 'yes', label: 'Causal' }, { value: 'no', label: 'Not causal' },
        ] };
      }),
    }],
    feedback: 'The triad: anonymous log archive (entry), exposed key (the credential), wildcard policy (the reach). Everything else — open bastion, public DB, disabled trail — is real risk, but this breach was fully determined by these three.',
  },
  {
    id: 'OBJ-H4', mode: 'hard', pillar: 'P4',
    title: 'One change window, one change: what ships first?',
    context: 'Freeze ends in an hour. You can push exactly one change now. Choose by containment value, then defend it.',
    anchor: 'Containment-before-hardening prioritization under incident conditions',
    hints: ['Ask which choice ends active attacker access this hour.'],
    validate: function (ctx) {
      return (ansStr(ctx, 'OBJ-H4', 'move') === 'revoke-key')
        ? { pass: true, detail: 'Correct — revoke the exposed key now.' }
        : { pass: false, detail: 'Rejected. Blocking the entry bucket does nothing once the key is harvested; the trail helps tomorrow, not tonight. Containment = kill the credential in use.' };
    },
    inputs: [{ kind: 'select', field: 'move', label: 'The one change', options: [
      { value: 'block-logs', label: 'Block public access on nl-logs-archive' },
      { value: 'revoke-key', label: 'Revoke key SKNS7F4K9Q2MEXAMPLE' },
      { value: 'enable-trail', label: 'Enable the account audit trail' },
      { value: 'restrict-bastion', label: 'Restrict the bastion SSH source' },
    ] }],
    feedback: 'The attacker authenticated with the stolen key at 02:19. Everything else you could ship is hardening or detection; only the revocation is containment. This is Domain 6.3 logic under Domain 6.5 conditions.',
  },
  {
    id: 'OBJ-H5', mode: 'hard', pillar: 'P4',
    title: 'Bring the whole storage family to compliant — simultaneously',
    context: 'All four buckets, one standard: no anonymous reads, encryption at rest, access logging; the exports bucket also needs versioning. All conditions must hold at once.',
    anchor: 'Storage remediation set: block-public, encryption, logging, versioning across the estate',
    hints: ['Three buckets have findings; the site bucket is already compliant.'],
    validate: function (ctx) {
      var e = ctx.configs.buckets['st-nl-exports'];
      var l = ctx.configs.buckets['st-nl-logs'];
      var d = ctx.configs.buckets['st-nl-dev'];
      var ok = e.blockPublicAccess && !e.publicRead && e.encryption !== 'none' && e.accessLogging && e.versioning
        && l.blockPublicAccess && !l.publicRead && l.accessLogging
        && d.encryption !== 'none';
      return ok ? { pass: true, detail: 'Storage family fully compliant.' }
        : { pass: false, detail: 'State check — exports: pub=' + (e.blockPublicAccess ? 'blocked' : 'open') + ', enc=' + e.encryption + ', log=' + e.accessLogging + ', ver=' + e.versioning + '; logs: pub=' + (l.blockPublicAccess ? 'blocked' : 'open') + ', log=' + l.accessLogging + '; dev: enc=' + d.encryption + '.' };
    },
    feedback: 'Partial compliance is how breaches persist: the bucket everyone remembers gets fixed, the sandbox stays plaintext. Estate-wide standards, verified by one re-scan — that is the posture-management habit.',
  },
  {
    id: 'OBJ-H6', mode: 'hard', pillar: 'P4',
    title: 'Rebuild svc-deploy: scoped policy, MFA, key lifecycle — exact',
    context: 'Least privilege or nothing: near-miss policies are explicitly rejected. The exposed key must be revoked before its replacement exists. MFA on.',
    anchor: 'IAM remediation: exact least-privilege policy, revoke→rotate sequence, MFA',
    hints: ['The policy needs exactly s3:GetObject + s3:PutObject on the artifacts path.'],
    validate: function (ctx) {
      var id = ctx.configs.identities['iam-svc-deploy'];
      var policyOk = id.policyId === 'pol-least-deploy';
      var seqOk = ctx.actions.indexOf('iam-svc-deploy:revoke-key') > -1
        && ctx.actions.indexOf('iam-svc-deploy:rotate-key') > -1
        && ctx.actions.indexOf('iam-svc-deploy:revoke-key') < ctx.actions.indexOf('iam-svc-deploy:rotate-key');
      var keysOk = !id.keys.some(function (k) { return k.exposure === 'exposed' && k.status === 'active'; })
        && id.keys.some(function (k) { return k.status === 'active' && k.exposure === 'clean'; });
      if (policyOk && seqOk && keysOk && id.mfa) return { pass: true, detail: 'Identity rebuilt to standard: scoped policy, MFA, clean key lifecycle.' };
      if (!policyOk) return { pass: false, detail: 'Near-miss rejected: the chosen policy still over-grants. s3:* is not least privilege — scope actions AND resources.' };
      if (!seqOk) return { pass: false, detail: 'Key lifecycle out of order or incomplete: revoke the exposed key, then rotate.' };
      return { pass: false, detail: 'Close — verify MFA is enforced and the new key is active while the exposed one is revoked.' };
    },
    feedback: 'Had this identity been scoped from day one, the breach would have been a debug-log read, not an account takeover. Least privilege is not a compliance checkbox — it is the difference between "the attacker reads one bucket" and "the attacker reads the account".',
  },
  {
    id: 'OBJ-H7', mode: 'hard', pillar: 'P4',
    title: 'Harden the network & data boundary — and touch nothing public',
    context: 'SSH to VPN, PostgreSQL to the app subnet, database off the internet with encryption and backups. The web tier 443 listener must remain exactly as it is — it is the product.',
    anchor: 'Network segmentation + data-layer remediation with exception awareness',
    hints: ['Four dossiers: two SGs, the DB card, and the web SG you must not change.'],
    validate: function (ctx) {
      var bRule = ctx.configs.sgs['sg-ops-bastion'].rules.find(function (r) { return r.id === 'r-22'; });
      var dRule = ctx.configs.sgs['sg-db-tier'].rules.find(function (r) { return r.id === 'r-5432'; });
      var wRule = ctx.configs.sgs['sg-web-tier'].rules.find(function (r) { return r.id === 'r-443'; });
      var b = bRule ? bRule.source : undefined;
      var d = dRule ? dRule.source : undefined;
      var w = wRule ? wRule.source : undefined;
      var db = ctx.configs.db['db-customer'];
      var ok = b === '198.51.100.0/24' && d === '10.20.3.0/24' && w === '0.0.0.0/0'
        && !db.publicAccess && db.encryptionAtRest && db.backups;
      if (ok) return { pass: true, detail: 'Boundary hardened; public listener untouched.' };
      if (w !== '0.0.0.0/0') return { pass: false, detail: 'You changed the web-tier listener — near-miss: breaking the public site is not remediation, it is an outage. Restore 443 from 0.0.0.0/0 and fix the rest.' };
      return { pass: false, detail: 'Check state: SSH=' + b + ', PG=' + d + ', DB public=' + db.publicAccess + ', enc=' + db.encryptionAtRest + ', backups=' + db.backups + '.' };
    },
    feedback: 'Segmentation (M1030) plus data-layer controls, with the discipline to leave documented exceptions alone. A fix that breaks the product teaches the org to fear fixes — exception-aware remediation is what makes posture work sustainable.',
  },
  {
    id: 'OBJ-H8', mode: 'hard', pillar: 'P3',
    title: 'Close the detection gap: trail, drift alerts, and the rule that would have caught it',
    context: 'Enable the audit trail and drift alerts, pick the configuration rule that would have flagged the root misconfiguration earliest — and identify the exfiltration event in the log.',
    anchor: 'Detection engineering: choosing the correct config rule; audit trail as forensic record',
    hints: ['The rule should target the entry misconfiguration, not every possible one.'],
    validate: function (ctx) {
      var acct = ctx.configs.account['acct-nimbus'];
      var rule = ansStr(ctx, 'OBJ-H8', 'rule') === 'rule-block-public';
      var ev = ansStr(ctx, 'OBJ-H8', 'event') === 'E-06';
      if (acct.auditTrail && acct.driftAlerts && rule && ev) return { pass: true, detail: 'Detection layer complete.' };
      if (!rule) return { pass: false, detail: 'Rejected rule: the unencrypted-bucket and port-22 rules are real findings, but neither is the root cause. The earliest catch is a bucket-without-block-public-access rule.' };
      if (!ev) return { pass: false, detail: 'Exfiltration is the outbound write to attacker storage — find that PutObject event.' };
      return { pass: false, detail: 'Enable both account switches, pick the root-cause rule, and name the exfiltration event.' };
    },
    inputs: [
      { kind: 'select', field: 'rule', label: 'Configuration rule that catches the root cause earliest', options: [
        { value: 'rule-block-public', label: 'Alert when any bucket has Block Public Access off' },
        { value: 'rule-unenc', label: 'Alert when any bucket lacks encryption at rest' },
        { value: 'rule-22', label: 'Alert when any SG allows 0.0.0.0/0 on port 22' },
      ] },
      { kind: 'select', field: 'event', label: 'The exfiltration event', options: [
        { value: 'E-03', label: 'E-03 — ListBuckets' },
        { value: 'E-05', label: 'E-05 — GetObject ×412' },
        { value: 'E-06', label: 'E-06 — PutObject to external bucket' },
        { value: 'E-07', label: 'E-07 — extortion note' },
      ] },
    ],
    feedback: 'A "block-public-off" rule fires on the *precondition* of the breach, before any key is stolen — that is the earliest possible catch. E-06 is the exfil (T1567.002): the data left the account during a PutObject to a bucket you do not own.',
  },
  {
    id: 'OBJ-H9', mode: 'hard', pillar: 'P4',
    title: 'Run the compute & credential-hygiene sweep',
    context: 'Sweep every remaining compute and identity hygiene item in one pass: metadata v2 on both vulnerable hosts, secret scrubbed from user-data, stray public IP gone, order VM encrypted, stale analytics key dead.',
    anchor: 'Compute + hygiene remediation set (IMDSv2, secrets, public IPs, volume encryption, stale keys)',
    hints: ['Five items, four dossiers — the sweep list matches the CMP and IAM-04 findings.'],
    validate: function (ctx) {
      var w = ctx.configs.instances['in-web01'];
      var app = ctx.configs.instances['in-app01'];
      var an = ctx.configs.instances['in-analytics01'];
      var staleDead = !ctx.configs.identities['iam-analytics-ro'].keys.some(function (k) { return k.exposure === 'stale' && k.status === 'active'; });
      var ok = w.imds === 'v2' && !w.publicIp && app.volumeEncrypted && an.imds === 'v2' && an.userDataSecretRemoved && staleDead;
      if (ok) return { pass: true, detail: 'Sweep complete — compute and credential hygiene fully closed.' };
      return { pass: false, detail: 'Remaining: web01 imds=' + w.imds + '/ip=' + w.publicIp + ', app01 enc=' + app.volumeEncrypted + ', analytics01 imds=' + an.imds + '/secret=' + an.userDataSecretRemoved + ', staleKey=' + (staleDead ? 'dead' : 'alive') + '.' };
    },
    feedback: 'Notice the coupling: the same key is hardcoded on one host and (via DEBUG logs) archived in a public bucket; the same v1 metadata mode is open on two hosts. Hygiene sweeps matter because misconfigurations cluster — where you find one, look for its siblings.',
  },
  {
    id: 'OBJ-H10', mode: 'hard', pillar: 'P1',
    title: 'Close the incident: responsibility rulings and the residual-risk statement',
    context: 'The postmortem needs the shared-responsibility rulings and one true statement about residual risk. Choose carefully — the board reads this.',
    anchor: 'Shared responsibility + residual risk after remediation',
    hints: ['Two of the five rulings belong to the provider; exactly one residual statement is true.'],
    validate: function (ctx) {
      var r = ansObj(ctx, 'OBJ-H10', 'items');
      var exp = { acl: 'customer', sgr: 'customer', hyper: 'provider', trail: 'customer', phys: 'provider' };
      var respOk = Object.keys(exp).every(function (k) { return r[k] === exp[k]; });
      var resOk = ansStr(ctx, 'OBJ-H10', 'residual') === 'b';
      if (respOk && resOk) return { pass: true, detail: 'Postmortem accepted by the board.' };
      if (!respOk) return { pass: false, detail: 'Rulings off: console-configured settings are customer; hypervisor and facility are provider.' };
      return { pass: false, detail: 'Rejected residual statement: risk is reduced, not eliminated — posture work is continuous.' };
    },
    inputs: [
      { kind: 'cards', field: 'items', label: 'Shared responsibility rulings', items: [
        { id: 'acl', label: 'Bucket ACL & public-access settings', options: [{ value: 'customer', label: 'Customer' }, { value: 'provider', label: 'Provider' }] },
        { id: 'sgr', label: 'Security-group rule set', options: [{ value: 'customer', label: 'Customer' }, { value: 'provider', label: 'Provider' }] },
        { id: 'hyper', label: 'Hypervisor host patching', options: [{ value: 'customer', label: 'Customer' }, { value: 'provider', label: 'Provider' }] },
        { id: 'trail', label: 'Audit-trail enablement', options: [{ value: 'customer', label: 'Customer' }, { value: 'provider', label: 'Provider' }] },
        { id: 'phys', label: 'Physical facility security', options: [{ value: 'customer', label: 'Customer' }, { value: 'provider', label: 'Provider' }] },
      ] },
      { kind: 'select', field: 'residual', label: 'The true residual-risk statement', options: [
        { value: 'a', label: 'With these fixes, misconfiguration risk is eliminated.' },
        { value: 'b', label: 'Misconfigurations can reappear with any change — keep posture scanning and drift alerts on, and re-review exceptions quarterly.' },
        { value: 'c', label: 'The provider will correct future bucket settings automatically.' },
      ] },
    ],
    feedback: 'The board line that matters: containment done, detection on, and humility in writing. Residual risk lives in the next deploy, the next "quick-fix" statement, the next expired project — which is exactly why Lesson 6.5 is the exam\'s last word.',
  },
];

const OBJECTIVES_BY_MODE = { medium: MEDIUM_OBJECTIVES, hard: HARD_OBJECTIVES };
