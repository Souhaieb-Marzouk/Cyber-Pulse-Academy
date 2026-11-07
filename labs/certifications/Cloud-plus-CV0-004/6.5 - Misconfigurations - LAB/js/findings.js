// ─── Ledgerline · posture scan engine (finding rules) ───────────────────────
// Static port of src/lib/lab/findings.ts — rules and helpers identical.
'use strict';

const FINDINGS = [
  // ── Object storage ──
  {
    id: 'F-EXPORTS-PUBLIC', code: 'ST-01', severity: 'critical', family: 'storage', resource: 'st-nl-exports',
    title: 'Customer database exports are anonymous-readable',
    evidence: 'policy statement "stmt-anon-read": Principal "*" → s3:GetObject on arn:sc:s3:::nl-customer-db-exports/*',
    why: 'Anyone on the internet can list-and-read nightly exports of customer PII. This single statement converts a private backup into a public leak, and it cannot be detected from inside the network — only from posture scanning.',
    mitre: 'T1530', responsibility: 'customer',
    active: function (c) { return c.buckets['st-nl-exports'].publicRead; },
  },
  {
    id: 'F-EXPORTS-ENC', code: 'ST-02', severity: 'high', family: 'storage', resource: 'st-nl-exports',
    title: 'Export bucket has no encryption at rest',
    evidence: 'encryption: none',
    why: 'Objects are stored in plaintext on the backing disks. Whoever obtains the physical media or a volume snapshot reads everything — encryption at rest is the last line of defense and it is missing.',
    responsibility: 'customer',
    active: function (c) { return c.buckets['st-nl-exports'].encryption === 'none'; },
  },
  {
    id: 'F-EXPORTS-LOG', code: 'ST-03', severity: 'medium', family: 'storage', resource: 'st-nl-exports',
    title: 'No server access logging on the exports bucket',
    evidence: 'accessLogging: false',
    why: 'If someone reads the bucket, nothing records it. Access logs are how you answer "what did the attacker take?" after an incident.',
    responsibility: 'customer',
    active: function (c) { return !c.buckets['st-nl-exports'].accessLogging; },
  },
  {
    id: 'F-EXPORTS-VER', code: 'ST-04', severity: 'low', family: 'storage', resource: 'st-nl-exports',
    title: 'Versioning disabled on the exports bucket',
    evidence: 'versioning: false',
    why: 'Without versioning, an overwrite (or a hostile PutObject) silently destroys the only copy. Versioning turns deletion into recoverable history.',
    responsibility: 'customer',
    active: function (c) { return !c.buckets['st-nl-exports'].versioning; },
  },
  {
    id: 'F-LOGS-PUBLIC', code: 'ST-05', severity: 'high', family: 'storage', resource: 'st-nl-logs',
    title: 'Application log archive is anonymous-readable',
    evidence: 'policy statement "stmt-anon-read": Principal "*" → s3:GetObject on arn:sc:s3:::nl-logs-archive/*',
    why: '"Only logs" is a dangerous discount: logs routinely contain tokens, keys, and internal hostnames. In this account the archived debug log actually contains a live access key — this finding is the breach entry point.',
    mitre: 'T1530', responsibility: 'customer',
    active: function (c) { return c.buckets['st-nl-logs'].publicRead; },
  },
  {
    id: 'F-LOGS-LOG', code: 'ST-06', severity: 'medium', family: 'storage', resource: 'st-nl-logs',
    title: 'No access logging on the log archive',
    evidence: 'accessLogging: false',
    why: 'The bucket nobody thought was sensitive is the one you will need forensics on first.',
    responsibility: 'customer',
    active: function (c) { return !c.buckets['st-nl-logs'].accessLogging; },
  },
  {
    id: 'F-DEV-ENC', code: 'ST-07', severity: 'medium', family: 'storage', resource: 'st-nl-dev',
    title: 'Dev sandbox bucket unencrypted',
    evidence: 'encryption: none',
    why: 'It holds only synthetic fixtures today, but sandbox buckets are repurposed constantly. Encryption at rest costs nothing and survives scope creep.',
    responsibility: 'customer',
    active: function (c) { return c.buckets['st-nl-dev'].encryption === 'none'; },
  },

  // ── Identity & access ──
  {
    id: 'F-SVC-WILDCARD', code: 'IAM-01', severity: 'critical', family: 'identity', resource: 'iam-svc-deploy',
    title: 'svc-deploy policy uses Action "*" and Resource "*"',
    evidence: 'policy "DeployAll": { Action: ["*"], Resource: ["*"] }',
    why: 'The pipeline needs to put and get objects from one artifacts bucket; instead it holds every permission on everything. Least privilege exists so that a stolen service credential is a small blast radius, not the whole account.',
    mitre: 'T1078.004', responsibility: 'customer',
    active: function (c) { return c.identities['iam-svc-deploy'].policyId === 'pol-wildcard-all'; },
  },
  {
    id: 'F-SVC-EXPOSED', code: 'IAM-02', severity: 'high', family: 'identity', resource: 'iam-svc-deploy',
    title: 'Long-lived access key exposed and actively used',
    evidence: 'key SKNS7F4K9Q2MEXAMPLE — embedded in i-analytics01 user-data and printed into archived debug logs; last used 2 days ago',
    why: 'A static key that exists in two retrievable places is a working, valid credential for anyone who finds it. Exposure means the key is already a hostile asset: revoke first, rotate second, investigate third.',
    mitre: 'T1552.001', responsibility: 'customer',
    active: function (c) { return c.identities['iam-svc-deploy'].keys.some(function (k) { return k.exposure === 'exposed' && k.status === 'active'; }); },
  },
  {
    id: 'F-SVC-MFA', code: 'IAM-03', severity: 'medium', family: 'identity', resource: 'iam-svc-deploy',
    title: 'MFA not enforced on privileged identity',
    evidence: 'mfa: false on svc-deploy (has console access for break-glass use)',
    why: 'MFA does not protect API key calls, but svc-deploy also has console access for break-glass. Any password leak then becomes a login. Enforce MFA on every identity that can touch production.',
    responsibility: 'customer',
    active: function (c) { return !c.identities['iam-svc-deploy'].mfa; },
  },
  {
    id: 'F-ANALYTICS-STALE', code: 'IAM-04', severity: 'medium', family: 'identity', resource: 'iam-analytics-ro',
    title: 'Access key unused for 214 days still active',
    evidence: 'key SKNS2A8B6DEXAMPLE — last used 214 days ago, owner left the project in 2025-04',
    why: 'Unused is not harmless: it is an unwatched credential with no owner noticing if it starts being used. Key hygiene = revoke what is unused, rotate what must live.',
    responsibility: 'customer',
    active: function (c) { return c.identities['iam-analytics-ro'].keys.some(function (k) { return k.exposure === 'stale' && k.status === 'active'; }); },
  },

  // ── Network ──
  {
    id: 'F-BASTION-22', code: 'NET-01', severity: 'critical', family: 'network', resource: 'sg-ops-bastion',
    title: 'SSH (22) open to 0.0.0.0/0 on the bastion',
    evidence: 'ingress rule r-22: port 22/tcp from 0.0.0.0/0',
    why: 'The bastion is the management doorway. Open SSH is brute-force and credential-stuffing surface every minute of every day; administration should enter from the corporate VPN range only.',
    mitre: 'T1078.004', responsibility: 'customer',
    active: function (c) { return c.sgs['sg-ops-bastion'].rules.some(function (r) { return r.id === 'r-22' && r.source === '0.0.0.0/0'; }); },
  },
  {
    id: 'F-DBTIER-5432', code: 'NET-02', severity: 'critical', family: 'network', resource: 'sg-db-tier',
    title: 'PostgreSQL (5432) reachable from the internet',
    evidence: 'ingress rule r-5432: port 5432/tcp from 0.0.0.0/0',
    why: 'A database port must never be world-listening. Tier segmentation means the DB accepts connections from the app tier only — from anywhere is an invitation to direct credential attacks.',
    responsibility: 'customer',
    active: function (c) { return c.sgs['sg-db-tier'].rules.some(function (r) { return r.id === 'r-5432' && r.source === '0.0.0.0/0'; }); },
  },

  // ── Compute ──
  {
    id: 'F-WEB01-IP', code: 'CMP-01', severity: 'medium', family: 'compute', resource: 'in-web01',
    title: 'Web instance holds an unneeded public IP',
    evidence: 'publicIp: true — traffic is supposed to arrive via the load balancer',
    why: 'Direct-to-instance paths bypass the load balancer\'s TLS termination and rate controls. If the instance does not need a public address, removing it deletes a whole class of exposure.',
    responsibility: 'customer',
    active: function (c) { return c.instances['in-web01'].publicIp; },
  },
  {
    id: 'F-WEB01-IMDS', code: 'CMP-02', severity: 'high', family: 'compute', resource: 'in-web01',
    title: 'Metadata service allows v1 (token not required)',
    evidence: 'imds: v1+v2 — requests without a token are still answered',
    why: 'IMDSv1 answers any request that originates from the host — exactly what a SSRF payload needs to walk away with instance role credentials. Requiring the v2 token (obtained via a deliberate PUT first) breaks that class of theft.',
    mitre: 'T1552.005', responsibility: 'customer',
    active: function (c) { return c.instances['in-web01'].imds !== 'v2'; },
  },
  {
    id: 'F-APP01-ENC', code: 'CMP-03', severity: 'medium', family: 'compute', resource: 'in-app01',
    title: 'Order-processing VM volume unencrypted',
    evidence: 'volumeEncrypted: false on i-app01',
    why: 'The instance that touches customer orders writes plaintext to its disk. Snapshot, clone, or hardware access then reads the data directly. (Lab remediation is simplified — real workflows re-encrypt via snapshot copy.)',
    responsibility: 'customer',
    active: function (c) { return !c.instances['in-app01'].volumeEncrypted; },
  },
  {
    id: 'F-ANALYTICS01-IMDS', code: 'CMP-04', severity: 'high', family: 'compute', resource: 'in-analytics01',
    title: 'Legacy instance runs metadata service in v1 mode',
    evidence: 'imds: v1 on i-analytics01',
    why: 'Same SSRF-to-credential path as the web tier, on the box that also carries the hardcoded key. Fixing one without the other leaves the same theft route half-open.',
    mitre: 'T1552.005', responsibility: 'customer',
    active: function (c) { return c.instances['in-analytics01'].imds !== 'v2'; },
  },
  {
    id: 'F-ANALYTICS01-SECRET', code: 'CMP-05', severity: 'high', family: 'compute', resource: 'in-analytics01',
    title: 'Access key hardcoded in instance user-data',
    evidence: 'user-data of i-analytics01 contains AWS_ACCESS_KEY_ID=SKNS7F4K9Q2MEXAMPLE',
    why: 'user-data is readable by anything on the instance (and, unencrypted, by whoever can describe it). The same key also got printed into logs — one secret, two leak paths. Credentials belong in a secret store or instance profile.',
    mitre: 'T1552.001', responsibility: 'customer',
    active: function (c) { return !c.instances['in-analytics01'].userDataSecretRemoved; },
  },

  // ── Data & databases ──
  {
    id: 'F-DB-OPEN', code: 'DAT-01', severity: 'critical', family: 'data', resource: 'db-customer',
    title: 'Managed database is publicly accessible',
    evidence: 'publicAccess: true on rds-customer-db (combined with DB-tier SG open to 0.0.0.0/0)',
    why: 'The database holding every customer record can be reached without touching the app tier. Public accessibility plus an open SG is the textbook cloud data-breach recipe.',
    responsibility: 'customer',
    active: function (c) { return c.db['db-customer'].publicAccess; },
  },
  {
    id: 'F-DB-ENC', code: 'DAT-02', severity: 'high', family: 'data', resource: 'db-customer',
    title: 'Database has no encryption at rest',
    evidence: 'encryptionAtRest: false on rds-customer-db',
    why: 'Backups, snapshots, and the underlying storage are all plaintext. Encryption at rest is a checkbox the customer must tick at the provider — a classic "in the cloud" duty.',
    responsibility: 'customer',
    active: function (c) { return !c.db['db-customer'].encryptionAtRest; },
  },
  {
    id: 'F-DB-BACKUP', code: 'DAT-03', severity: 'medium', family: 'data', resource: 'db-customer',
    title: 'No automated backups configured',
    evidence: 'backups: false — RPO unbounded',
    why: 'A misconfiguration is not only about confidentiality: with no backups, a destructive PutObject/Delete or ransomware event becomes unrecoverable.',
    responsibility: 'customer',
    active: function (c) { return !c.db['db-customer'].backups; },
  },

  // ── Account guardrails ──
  {
    id: 'F-ACCT-TRAIL', code: 'ACC-01', severity: 'critical', family: 'account', resource: 'acct-nimbus',
    title: 'Account audit trail is disabled',
    evidence: 'auditTrail: false — no control-plane events recorded',
    why: 'Without the audit trail you cannot detect the stolen key being used, and afterwards you cannot reconstruct scope. It is both a detection control and the incident record.',
    mitre: 'T1078.004', responsibility: 'customer',
    active: function (c) { return !c.account['acct-nimbus'].auditTrail; },
  },
  {
    id: 'F-ACCT-DRIFT', code: 'ACC-02', severity: 'high', family: 'account', resource: 'acct-nimbus',
    title: 'No configuration-drift alerts',
    evidence: 'driftAlerts: false — new misconfigurations appear silently',
    why: 'Posture scanning is a snapshot; drift alerts make it continuous. Without them, the next anonymous-read bucket appears today and is found at the next quarterly audit — or at the next breach.',
    responsibility: 'customer',
    active: function (c) { return !c.account['acct-nimbus'].driftAlerts; },
  },
];

const EXCEPTIONS = [
  {
    id: 'X-SITE-PUBLIC', code: 'ST-X1', family: 'storage', resource: 'st-nl-site',
    title: 'Public static-website bucket (scoped to assets/*)',
    why: 'Public GetObject on the asset prefix is required for the marketing site; the policy is scoped, writes are denied, and the exception is documented. Accepted — do not "fix" it.',
  },
  {
    id: 'X-WEB-443', code: 'NET-X1', family: 'network', resource: 'sg-web-tier',
    title: 'Web tier accepts 443 from 0.0.0.0/0',
    why: 'A public HTTPS listener is the product working as intended. Restricting it would break the site; the control boundary is the load balancer, not the SG.',
  },
];

const SEVERITY_WEIGHT = { critical: 8, high: 4, medium: 1, low: 1 };
const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function activeFindings(configs) {
  return FINDINGS.filter(function (f) { return f.active(configs); });
}

function postureScore(configs) {
  var deduction = activeFindings(configs).reduce(function (sum, f) {
    return sum + (SEVERITY_WEIGHT[f.severity] != null ? SEVERITY_WEIGHT[f.severity] : 1);
  }, 0);
  return Math.max(0, 100 - deduction);
}

function criticalCount(configs) {
  return activeFindings(configs).filter(function (f) { return f.severity === 'critical'; }).length;
}
