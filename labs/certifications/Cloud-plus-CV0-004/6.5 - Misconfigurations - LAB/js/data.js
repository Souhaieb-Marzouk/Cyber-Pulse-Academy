// ─── Ledgerline · synthetic environment data (ALL TRAINING DATA) ────────────
// Fictional provider "Stratonaut Cloud" (sc), fictional customer "Nimbus Logistics".
// Static port of src/lib/lab/data.ts — content carried over 1:1.
'use strict';

const ACCOUNT_NAME = 'nimbus-prod';
const CUSTOMER = 'Nimbus Logistics';

// ── Resource catalog ────────────────────────────────────────────────────────
const RESOURCES = [
  {
    id: 'st-nl-exports', kind: 'bucket', family: 'storage', name: 'nl-customer-db-exports',
    refId: 's3://nl-customer-db-exports', region: 'eu-south-1',
    summary: 'Nightly exports of the customer database (PII, billing rows).',
  },
  {
    id: 'st-nl-logs', kind: 'bucket', family: 'storage', name: 'nl-logs-archive',
    refId: 's3://nl-logs-archive', region: 'eu-south-1',
    summary: 'Rotating application and web-server logs, archived nightly.',
  },
  {
    id: 'st-nl-site', kind: 'bucket', family: 'storage', name: 'nl-static-website',
    refId: 's3://nl-static-website', region: 'eu-south-1',
    summary: 'Public marketing site assets (images, CSS) behind the CDN.',
    publicByDesign: true,
    exception: {
      title: 'Public by design',
      why: 'Policy is scoped to s3:GetObject on assets/* only, the bucket is CDN-fronted, and the team documented the exception. Not every public exposure is a misconfiguration — judge the policy, not the prefix.',
    },
  },
  {
    id: 'st-nl-dev', kind: 'bucket', family: 'storage', name: 'nl-dev-scratch',
    refId: 's3://nl-dev-scratch', region: 'eu-south-1',
    summary: 'Developer sandbox for synthetic test fixtures (no real data).',
  },
  {
    id: 'iam-svc-deploy', kind: 'identity', family: 'identity', name: 'svc-deploy',
    refId: 'sc:iam::nimbus-prod:user/svc-deploy', region: 'global',
    summary: 'Service account used by the deployment pipeline.',
  },
  {
    id: 'iam-analytics-ro', kind: 'identity', family: 'identity', name: 'analytics-readonly',
    refId: 'sc:iam::nimbus-prod:user/analytics-readonly', region: 'global',
    summary: 'Read-only analyst account (contractor, project ended 2025-04).',
  },
  {
    id: 'sg-web-tier', kind: 'sg', family: 'network', name: 'sg-web-tier',
    refId: 'sg-0aa11bb22cc33dd44', region: 'eu-south-1',
    summary: 'Attached to the public web tier behind the load balancer.',
    publicByDesign: true,
    exception: {
      title: 'Public listener by design',
      why: 'A public web tier must accept 443 from anywhere. It terminates TLS at the load balancer and holds no stateful data. Restricting it would break the site — accept and move on.',
    },
  },
  {
    id: 'sg-db-tier', kind: 'sg', family: 'network', name: 'sg-db-tier',
    refId: 'sg-1bb22cc33dd44ee55', region: 'eu-south-1',
    summary: 'Attached to the managed database nodes.',
  },
  {
    id: 'sg-ops-bastion', kind: 'sg', family: 'network', name: 'sg-ops-bastion',
    refId: 'sg-2cc33dd44ee55ff66', region: 'eu-south-1',
    summary: 'SSH jump host used by the ops team.',
  },
  {
    id: 'in-web01', kind: 'instance', family: 'compute', name: 'i-web01',
    refId: 'i-0web01nimbus44', region: 'eu-south-1a',
    summary: 'Web front-end VM behind the load balancer.',
  },
  {
    id: 'in-app01', kind: 'instance', family: 'compute', name: 'i-app01',
    refId: 'i-1app01nimbus77', region: 'eu-south-1a',
    summary: 'Application server processing customer orders.',
  },
  {
    id: 'in-analytics01', kind: 'instance', family: 'compute', name: 'i-analytics01',
    refId: 'i-2analytics01nim11', region: 'eu-south-1a',
    summary: 'Batch analytics collector, provisioned by a legacy script.',
  },
  {
    id: 'db-customer', kind: 'db', family: 'data', name: 'rds-customer-db',
    refId: 'sc:rds:eu-south-1:nimbus-prod:db-customer', region: 'eu-south-1',
    summary: 'Managed PostgreSQL holding all customer records.',
  },
  {
    id: 'acct-nimbus', kind: 'account', family: 'account', name: 'Landing-zone settings',
    refId: 'sc:account::nimbus-prod', region: 'global',
    summary: 'Account-wide logging, monitoring and guardrail settings.',
  },
];

const RESOURCE_BY_ID = Object.fromEntries(RESOURCES.map(function (r) { return [r.id, r]; }));

const FAMILY_LABEL = {
  storage: 'Object Storage',
  identity: 'Identity & Access',
  network: 'Network',
  compute: 'Compute',
  data: 'Data & Databases',
  account: 'Account Guardrails',
};

const FAMILY_ORDER = ['storage', 'identity', 'network', 'compute', 'data', 'account'];

// ── Bucket policies (display, simplified) ───────────────────────────────────
const BUCKET_POLICIES = {
  'st-nl-exports': [
    { id: 'stmt-a', effect: 'Allow', principal: 'sc:iam::nimbus-prod:role/backup-writer', action: 's3:PutObject', resource: 'arn:sc:s3:::nl-customer-db-exports/exports/*' },
    { id: 'stmt-b', effect: 'Allow', principal: 'sc:iam::nimbus-prod:role/reporting-ro', action: 's3:GetObject', resource: 'arn:sc:s3:::nl-customer-db-exports/exports/*' },
    { id: 'stmt-anon-read', effect: 'Allow', principal: '"*"', action: 's3:GetObject', resource: 'arn:sc:s3:::nl-customer-db-exports/*', markable: true, note: 'added 2025-11-19 by "quick-fix" script' },
  ],
  'st-nl-logs': [
    { id: 'stmt-c', effect: 'Allow', principal: 'sc:iam::nimbus-prod:role/log-shipper', action: 's3:PutObject', resource: 'arn:sc:s3:::nl-logs-archive/raw/*' },
    { id: 'stmt-anon-read', effect: 'Allow', principal: '"*"', action: 's3:GetObject', resource: 'arn:sc:s3:::nl-logs-archive/*', markable: true, note: 'granted for a "support debug" request, never removed' },
  ],
  'st-nl-site': [
    { id: 'stmt-d', effect: 'Allow', principal: '"*"', action: 's3:GetObject', resource: 'arn:sc:s3:::nl-static-website/assets/*', note: 'scoped to public asset prefix only' },
    { id: 'stmt-e', effect: 'Deny', principal: '"*"', action: 's3:PutObject', resource: 'arn:sc:s3:::nl-static-website/*' },
  ],
  'st-nl-dev': [
    { id: 'stmt-f', effect: 'Allow', principal: 'sc:iam::nimbus-prod:group/devs', action: 's3:*', resource: 'arn:sc:s3:::nl-dev-scratch/*' },
  ],
};

// Objects visible in the logs bucket (evidence for the breach story)
const LOG_OBJECTS = [
  { key: 'raw/2026/11/06/web-access.log', size: '412 MB', note: 'standard access log' },
  { key: '2026/11/app-debug.log', size: '88 MB', note: '⚠ contains line: DEBUG aws credential SKNS7F4K9Q2MEXAMPLE printed by analytics job' },
  { key: '2026/11/cron-summary.log', size: '6 MB', note: 'cron output' },
];

// Objects in the non-log buckets (read-only evidence listings)
const GENERIC_OBJECTS = {
  'st-nl-exports': [
    { key: 'exports/2026-11-05.csv', size: '712 MB', note: 'PII: customer name, address, invoice total' },
    { key: 'exports/2026-11-06.csv', size: '738 MB', note: 'PII: customer name, address, invoice total' },
  ],
  'st-nl-site': [
    { key: 'assets/logo.svg', size: '14 KB', note: 'public asset' },
    { key: 'assets/hero.jpg', size: '1.8 MB', note: 'public asset' },
    { key: 'assets/main.css', size: '86 KB', note: 'public asset' },
  ],
  'st-nl-dev': [
    { key: 'fixtures/synthetic-users.json', size: '22 KB', note: 'generated fake data' },
    { key: 'fixtures/README.txt', size: '1 KB', note: 'scratch notes' },
  ],
};

const USER_DATA = {
  'in-web01': {
    removed: true,
    script: ['#!/bin/bash', 'apt-get update && apt-get install -y nginx', 'systemctl enable nginx'],
  },
  'in-app01': {
    removed: true,
    script: ['#!/bin/bash', 'echo "order-service v2.4.1"', 'systemctl start order-service'],
  },
  'in-analytics01': {
    removed: false,
    script: [
      '#!/bin/bash',
      '# analytics bootstrap — legacy provisioning script (TRAINING DATA)',
      'export AWS_ACCESS_KEY_ID=SKNS7F4K9Q2MEXAMPLE',
      'export AWS_SECRET_ACCESS_KEY=********(redacted-in-view)********',
      'python3 /opt/analytics/collector.py --schedule 15m',
    ],
  },
};

// ── Identity policy catalog (candidates for least-privilege rewrite) ───────
const POLICIES = [
  { id: 'pol-wildcard-all', name: 'DeployAll (current)', actions: ['*'], resources: ['*'], quality: 'wildcard-all' },
  { id: 'pol-s3-all', name: 'S3FullAccess', actions: ['s3:*'], resources: ['*'], quality: 'near-miss' },
  { id: 'pol-deploy-wide', name: 'DeployWide', actions: ['s3:*'], resources: ['arn:sc:s3:::nl-deploy-artifacts/*'], quality: 'near-miss' },
  { id: 'pol-least-deploy', name: 'DeployArtefactsLeast', actions: ['s3:GetObject', 's3:PutObject'], resources: ['arn:sc:s3:::nl-deploy-artifacts/*'], quality: 'least' },
  { id: 'pol-readonly-correct', name: 'AnalyticsReadOnly (current)', actions: ['s3:GetObject', 's3:ListObjectsV2'], resources: ['arn:sc:s3:::nl-analytics-curated/*'], quality: 'ok' },
];

// ── CIDR options for security-group remediation ────────────────────────────
const CIDR_OPTIONS = [
  { value: '0.0.0.0/0', label: '0.0.0.0/0 — every IPv4 address on the internet' },
  { value: '10.20.3.0/24', label: '10.20.3.0/24 — private app-tier subnet' },
  { value: '198.51.100.0/24', label: '198.51.100.0/24 — corporate VPN egress' },
  { value: '172.16.0.0/12', label: '172.16.0.0/12 — legacy office range (unused)' },
];

// ── Initial (misconfigured) configs ────────────────────────────────────────
const INITIAL_CONFIGS = {
  buckets: {
    'st-nl-exports': { publicRead: true, blockPublicAccess: false, encryption: 'none', versioning: false, accessLogging: false, markedStatements: [] },
    'st-nl-logs': { publicRead: true, blockPublicAccess: false, encryption: 'sse-s3', versioning: true, accessLogging: false, markedStatements: [] },
    'st-nl-site': { publicRead: true, blockPublicAccess: false, encryption: 'sse-kms', versioning: true, accessLogging: true, markedStatements: [] },
    'st-nl-dev': { publicRead: false, blockPublicAccess: true, encryption: 'none', versioning: false, accessLogging: false, markedStatements: [] },
  },
  identities: {
    'iam-svc-deploy': {
      mfa: false, policyId: 'pol-wildcard-all',
      keys: [{ id: 'SKNS7F4K9Q2MEXAMPLE', status: 'active', lastUsedDays: 2, exposure: 'exposed' }],
    },
    'iam-analytics-ro': {
      mfa: true, policyId: 'pol-readonly-correct',
      keys: [{ id: 'SKNS2A8B6DEXAMPLE', status: 'active', lastUsedDays: 214, exposure: 'stale' }],
    },
  },
  sgs: {
    'sg-web-tier': { rules: [{ id: 'r-443', label: 'HTTPS listener', port: '443', source: '0.0.0.0/0', byDesign: true }] },
    'sg-db-tier': { rules: [{ id: 'r-5432', label: 'PostgreSQL', port: '5432', source: '0.0.0.0/0' }] },
    'sg-ops-bastion': { rules: [{ id: 'r-22', label: 'SSH', port: '22', source: '0.0.0.0/0' }] },
  },
  instances: {
    'in-web01': { publicIp: true, imds: 'v1v2', volumeEncrypted: true, userDataSecretRemoved: true },
    'in-app01': { publicIp: false, imds: 'v2', volumeEncrypted: false, userDataSecretRemoved: true },
    'in-analytics01': { publicIp: false, imds: 'v1', volumeEncrypted: true, userDataSecretRemoved: false },
  },
  db: {
    'db-customer': { publicAccess: true, encryptionAtRest: false, backups: false },
  },
  account: {
    'acct-nimbus': { auditTrail: false, driftAlerts: false },
  },
};

// ── Breach evidence (Hard mode) — synthetic audit event log ────────────────
const BREACH_EVENTS = [
  { id: 'E-01', time: '02:07', actor: 'unauthenticated', source: '203.0.113.77', event: 'GetObject ×14', target: 's3://nl-logs-archive/*', note: 'No credential presented — anonymous reads against the log archive.' },
  { id: 'E-02', time: '02:12', actor: 'unauthenticated', source: '203.0.113.77', event: 'GetObject', target: 's3://nl-logs-archive/2026/11/app-debug.log', note: 'The one log object containing an embedded access key was downloaded.' },
  { id: 'E-03', time: '02:19', actor: 'svc-deploy / SKNS7F4K9Q2MEXAMPLE', source: '198.51.100.7', event: 'ListBuckets', target: 'sc:account::nimbus-prod', note: 'First use of the stolen key, from a network never seen in this account.' },
  { id: 'E-04', time: '02:22', actor: 'svc-deploy / SKNS7F4K9Q2MEXAMPLE', source: '198.51.100.7', event: 'ListObjectsV2', target: 's3://nl-customer-db-exports', note: 'Customer export bucket enumerated to pick the largest prefix.' },
  { id: 'E-05', time: '02:31', actor: 'svc-deploy / SKNS7F4K9Q2MEXAMPLE', source: '198.51.100.7', event: 'GetObject ×412 (4.2 GB)', target: 's3://nl-customer-db-exports/exports/*', note: 'The full exports prefix was downloaded.' },
  { id: 'E-06', time: '02:47', actor: 'svc-deploy / SKNS7F4K9Q2MEXAMPLE', source: '198.51.100.7', event: 'PutObject (4.2 GB)', target: 'attacker bucket "joltbreak-relay" (external)', note: 'Dataset staged into attacker-controlled cloud storage.' },
  { id: 'E-07', time: '03:03', actor: 'extortion note', source: '—', event: 'ALERT', target: 'NimbusSec shared inbox', note: 'Leak site claims 4.2 GB of Nimbus customer records.' },
];

// ── Doctrine content (Knowledge Core) ──────────────────────────────────────
const DOCTRINE_SECTIONS = [
  {
    title: 'What a misconfiguration is',
    body: 'A misconfiguration is an unintended, customer-controlled setting that weakens a cloud resource: an anonymous-readable object store, a policy with Action:["*"], a database reachable from the internet, a disabled audit trail. Unlike a software vulnerability, it is not a defect in the provider\'s platform — it is a wrong choice in a control the customer owns. That is why misconfiguration is consistently ranked the leading cause of cloud data exposure, and why the Cloud+ exam gives it the final word: identify it, then fix it.',
  },
  {
    title: 'Shared responsibility decides who fixes it',
    body: 'The provider is responsible for the security OF the cloud — facilities, hardware, hypervisor patching, the storage service itself. The customer is responsible for security IN the cloud — bucket policies, IAM policies, security-group rules, encryption choices, logging enablement. When an auditor asks "whose bug is this?", the answer decides which team gets paged. A CSPM finding you ignore because "the platform team owns it" is still your breach.',
  },
  {
    title: 'Why attackers love misconfigurations',
    body: 'No exploit is required. An anonymous-readable bucket or a leaked static key is a valid, working access path — the attacker logs in, they do not break in. In ATT&CK terms the chain is short: find the exposed surface (T1619), read the objects (T1530), harvest credentials left in files or the instance metadata API (T1552.001 / T1552.005), use the stolen cloud account (T1078.004), and exfiltrate to their own storage (T1567.002). Every step is "normal API usage" — which is also why detection depends on posture scanning, not just threat signatures.',
  },
  {
    title: 'Real incidents driven by misconfiguration',
    body: 'Capitol One (2019): an SSRF request hit the instance metadata API (IMDSv1) and returned role credentials, which were used to copy ~100M records from object storage. Verizon / NICE Systems (2017): a vendor\'s misconfigured object store exposed ~14M customer records. Deep Root Analytics (2017): ~1.1 TB of voter files sat on an anonymous-readable object store, discoverable by scanning. In every case the platform worked as configured — the configuration was the vulnerability.',
  },
  {
    title: 'The audit loop this lab drills',
    body: 'Scan posture → triage findings (true issue vs accepted exception) → remediate in priority order (containment before hardening: revoke exposed keys first) → verify by re-scanning. Skipping the verify step is how teams "fix" a bucket in one account while its copy drifts back in another.',
  },
];

const GLOSSARY = [
  { term: 'Misconfiguration', def: 'An unintended, customer-controlled setting that weakens a cloud resource\'s security.' },
  { term: 'Shared responsibility model', def: 'Contract that splits duties: provider secures the platform (of the cloud); customer secures what they build in it (in the cloud).' },
  { term: 'Least privilege', def: 'Grant only the permissions an identity needs, on only the resources it needs, for only as long as it needs them.' },
  { term: 'Wildcard policy', def: 'An IAM policy using "*" for actions or resources — it overrides the purpose of scoping and makes every compromise a full compromise.' },
  { term: 'IAM / principal', def: 'Identity and Access Management; a principal is the user, group, or role a policy statement applies to.' },
  { term: 'Access key', def: 'A static credential pair (key ID + secret) for API access. Long-lived keys must be inventoried, rotated, and revoked when exposed or unused.' },
  { term: 'MFA', def: 'Multi-factor authentication — a second factor beyond the password; it hardens console logins but does not protect static API keys.' },
  { term: 'Security group', def: 'Stateful virtual firewall attached to instances; rules reference ports and source CIDRs (or other security groups).' },
  { term: 'CIDR / 0.0.0.0/0', def: 'CIDR notation describes an IP range; 0.0.0.0/0 means "every IPv4 address" — the entire internet.' },
  { term: 'Block Public Access', def: 'Account/bucket guardrail that overrides any policy or ACL granting anonymous access.' },
  { term: 'IMDS (v1 vs v2)', def: 'Instance Metadata Service. v1 answers any request from the host (SSRF-abusable); v2 requires a session token obtained first ("token required").' },
  { term: 'Encryption at rest / in transit', def: 'At rest: stored data is encrypted by the service (SSE-S3/SSE-KMS). In transit: TLS on the wire. Misconfigs usually disable or skip the former.' },
  { term: 'Audit trail', def: 'Account-level recording of every control-plane API call; without it, neither detection nor forensics can see what happened.' },
  { term: 'CSPM', def: 'Cloud Security Posture Management — tooling that continuously evaluates resource configuration against rules and surfaces findings.' },
  { term: 'Configuration drift', def: 'When live resource state diverges from its approved baseline (IaC template) — drift alerts catch new misconfigurations as they appear.' },
];

const REAL_INCIDENTS = [
  { org: 'Capitol One (2019)', detail: 'SSRF → IMDSv1 → role credentials → ~100M records copied from object storage.', mapping: 'T1552.005 → T1078.004 → T1530' },
  { org: 'Verizon / NICE Systems (2017)', detail: 'Vendor\'s misconfigured object store exposed ~14M customer records.', mapping: 'T1530' },
  { org: 'Deep Root Analytics (2017)', detail: '~1.1 TB of voter files on an anonymous-readable object store, found by scanning.', mapping: 'T1619 → T1530' },
];

// ── Doctrine drawer extras (chain + links) ─────────────────────────────────
const DOCTRINE_CHAIN = [
  { id: 'T1619', label: 'Cloud Storage Object Discovery', tactic: 'Discovery' },
  { id: 'T1530', label: 'Data from Cloud Storage', tactic: 'Collection' },
  { id: 'T1552.001', label: 'Credentials In Files', tactic: 'Credential Access' },
  { id: 'T1552.005', label: 'Cloud Instance Metadata API', tactic: 'Credential Access' },
  { id: 'T1078.004', label: 'Valid Accounts: Cloud Accounts', tactic: 'Initial Access / Persistence / Escalation / Evasion' },
  { id: 'T1567.002', label: 'Exfiltration to Cloud Storage', tactic: 'Exfiltration' },
];

const DOCTRINE_LINKS = [
  { href: 'https://attack.mitre.org/techniques/T1530/', label: 'ATT&CK T1530 — Data from Cloud Storage' },
  { href: 'https://attack.mitre.org/techniques/T1552/001/', label: 'ATT&CK T1552.001 — Credentials In Files' },
  { href: 'https://attack.mitre.org/techniques/T1552/005/', label: 'ATT&CK T1552.005 — Cloud Instance Metadata API' },
  { href: 'https://attack.mitre.org/techniques/T1619/', label: 'ATT&CK T1619 — Cloud Storage Object Discovery' },
  { href: 'https://attack.mitre.org/techniques/T1078/004/', label: 'ATT&CK T1078.004 — Valid Accounts: Cloud Accounts' },
  { href: 'https://attack.mitre.org/techniques/T1567/002/', label: 'ATT&CK T1567.002 — Exfiltration to Cloud Storage' },
  { href: 'https://d3fend.mitre.org/', label: 'MITRE D3FEND — defensive countermeasure knowledge graph' },
  { href: 'https://www.comptia.org/en-us/certifications/cloud/', label: 'CompTIA Cloud+ (CV0-004) — official exam page' },
];

// ── Posture report (debrief) content ───────────────────────────────────────
const DETECTION_ROWS = [
  { signal: 'Bucket grants anonymous access', source: 'CSPM config snapshot (bucket policy + BPA setting)', logic: 'alert if bucket.blockPublicAccess == false AND any statement.Principal == "*"' },
  { signal: 'Wildcard IAM policy', source: 'IAM policy document evaluation', logic: 'alert if policy.Action contains "*" OR policy.Resource contains "*"' },
  { signal: 'Management/DB port open to world', source: 'VPC / security-group config', logic: 'alert if rule.port in {22, 3389, 5432, 3306} AND rule.source == "0.0.0.0/0"' },
  { signal: 'IMDSv1 still answerable', source: 'Instance metadata options', logic: 'alert if instance.metadataOptions.httpTokens != "required"' },
  { signal: 'Static key exposed or stale', source: 'IAM key inventory + secret scanning', logic: 'alert if key.lastUsed > 90d OR key.id appears in user-data/logs/repos' },
  { signal: 'Audit trail disabled', source: 'Account-level guardrail config', logic: 'alert if account.auditTrail == false (critical, account-wide)' },
  { signal: 'Config drift on guarded resources', source: 'Drift detection vs approved baseline (IaC)', logic: 'page on any diff between live state and baseline for flagged resources' },
];

const MITIGATIONS = [
  { id: 'M1032', name: 'Multi-factor Authentication', covers: 'Privileged console access (svc-deploy, admins)' },
  { id: 'M1026', name: 'Privileged Account Management', covers: 'Least-privilege rewrite, key lifecycle, service-account scoping' },
  { id: 'M1030', name: 'Network Segmentation', covers: 'Tier CIDR rules, bastion restriction, DB isolation' },
  { id: 'M1035', name: 'Limit Access to Resource Over Network', covers: 'Public-access guardrails, scoped object policies' },
  { id: 'M1047', name: 'Audit', covers: 'Audit trail, access logging, drift alerts, periodic posture scans' },
  { id: 'M1027', name: 'Password Policies', covers: 'Baseline for any console-facing identity' },
];

const BLUE_TAKEAWAYS = [
  'Severity is opinion, causality is fact — triage by "would fixing this have broken the attack chain?", not by stamp colour.',
  'Posture work is a loop, not a project: scan → triage → fix → verify, then automate the scan (drift alerts) so it runs without you.',
  'Secrets never leak once. The hardcoded key lived in user-data AND archived logs — hunt every copy, revoke first, rotate second.',
  'Document exceptions. An undocumented "public by design" bucket is indistinguishable from a breach waiting to happen.',
  'The audit trail is both a detective control and your forensic record — disabling it blinds you exactly when you will need it most.',
];

const RED_TAKEAWAYS = [
  'No exploit needed: anonymous reads and static keys are valid, working access — defenders rarely watch for "normal API usage".',
  'Logs and metadata are treasure: app logs hold credentials, IMDSv1 hands them over — recon the estate\'s leftovers (T1552.001/.005).',
  'One wildcard policy converts any stolen service credential into an account takeover (T1078.004) — least privilege is blast-radius control.',
  'Exfiltration looks like backup: a PutObject to an external bucket is indistinguishable from an export job without baselining (T1567.002).',
  'The quiet estate is the target: dev sandboxes and "only logs" buckets are where quick-fix statements go to be forgotten.',
];

const REPORT_LINKS = [
  { href: 'https://attack.mitre.org/techniques/T1530/', label: 'T1530 — Data from Cloud Storage' },
  { href: 'https://attack.mitre.org/techniques/T1619/', label: 'T1619 — Cloud Storage Object Discovery' },
  { href: 'https://attack.mitre.org/techniques/T1552/001/', label: 'T1552.001 — Credentials In Files' },
  { href: 'https://attack.mitre.org/techniques/T1552/005/', label: 'T1552.005 — Cloud Instance Metadata API' },
  { href: 'https://attack.mitre.org/techniques/T1078/004/', label: 'T1078.004 — Valid Accounts: Cloud Accounts' },
  { href: 'https://attack.mitre.org/techniques/T1567/002/', label: 'T1567.002 — Exfiltration to Cloud Storage' },
  { href: 'https://d3fend.mitre.org/', label: 'MITRE D3FEND — defensive countermeasures' },
  { href: 'https://www.comptia.org/en-us/certifications/cloud/', label: 'CompTIA Cloud+ CV0-004 — official objectives' },
];

// ── Mode-select card content ───────────────────────────────────────────────
const MODE_CARDS = [
  {
    id: 'medium',
    name: 'Guided Audit',
    tag: 'MEDIUM · day shift',
    icon: 'clipboard-list',
    card: 'light',
    blurb: 'A proactive quarterly posture review of Nimbus Logistics\' cloud account.',
    points: [
      '12 guided objectives, introduced in order',
      'Tiered hints (up to 3) — cost stars, never block',
      '"Where to look" jump links for every step',
      'Tolerant checking — wrong answers teach, never punish',
    ],
  },
  {
    id: 'hard',
    name: 'Breach Aftermath',
    tag: 'HARD · night shift',
    icon: 'moon-star',
    card: 'night',
    blurb: '4.2 GB of customer records just surfaced on a leak site. You are on call.',
    points: [
      '10 broad, multi-step challenges driven by incident evidence',
      'Noisy estate with real distractors and accepted exceptions',
      'Strict validation — exact values, exact ATT&CK IDs, exact sets',
      'One optional nudge, and it visibly costs score',
    ],
  },
];

// ── Briefing audit-loop content ────────────────────────────────────────────
const BRIEF_LOOP = [
  { icon: 'scan-search', t: 'Scan posture — sweep every service family for misconfigurations.' },
  { icon: 'file-warning', t: 'Triage findings — true issue vs accepted exception; severity vs causality.' },
  { icon: 'wrench', t: 'Remediate in priority order — containment before hardening.' },
  { icon: 'repeat-2', t: 'Verify by re-scanning — a fix is not a fix until the ledger agrees.' },
];
