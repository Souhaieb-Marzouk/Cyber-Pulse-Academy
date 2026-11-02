// ─── SKYSCAN Cloud Posture Lab — synthetic data core (static port) ───────────
// EVERY artifact in this file is fictional training data for defensive,
// educational use. Organizations, resources, CVEs and advisory versions are
// simplified or invented and labeled as such. No real systems are targeted.
//
// This file is a 1:1 content port of the original framework lab's
// src/lib/lab/data.ts (plus presentational constants defined in its UI
// components). Content, wording, correct answers, hint tiers and feedback
// messages are identical to the original.

window.SKY = window.SKY || {};

(function (SKY) {
  'use strict';

  SKY.LAB_TITLE = 'SKYSCAN';
  SKY.LAB_SUBTITLE = 'Cloud Posture Assessment Lab';
  SKY.ORG = 'NimbusStack Retail';
  SKY.STORAGE_KEY = 'skyscan-cloudposture-lab-v1';

  // ─── Estate domains ────────────────────────────────────────────────────────

  SKY.DOMAINS = [
    { id: 'identity', label: 'Identity & Access', icon: 'keyround' },
    { id: 'compute', label: 'Compute', icon: 'server' },
    { id: 'storage', label: 'Storage', icon: 'database' },
    { id: 'network', label: 'Network', icon: 'network' },
    { id: 'observability', label: 'Observability', icon: 'radar' },
    { id: 'application', label: 'Application', icon: 'appwindow' },
  ];

  SKY.DOMAIN_LABEL = {
    identity: 'Identity & Access',
    compute: 'Compute',
    storage: 'Storage',
    network: 'Network',
    observability: 'Observability',
    application: 'Application',
  };

  // ─── ATT&CK techniques referenced (verified against attack.mitre.org) ──────

  SKY.TECHNIQUES = [
    { id: 'T1530', name: 'Data from Cloud Storage', link: 'https://attack.mitre.org/techniques/T1530/' },
    { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts', link: 'https://attack.mitre.org/techniques/T1078/004/' },
    { id: 'T1562.008', name: 'Impair Defenses: Disable Cloud Logs', link: 'https://attack.mitre.org/techniques/T1562/008/' },
    { id: 'T1552.005', name: 'Unsecured Credentials: Cloud Instance Metadata API', link: 'https://attack.mitre.org/techniques/T1552/005/' },
    { id: 'T1552', name: 'Unsecured Credentials', link: 'https://attack.mitre.org/techniques/T1552/' },
    { id: 'T1133', name: 'External Remote Services', link: 'https://attack.mitre.org/techniques/T1133/' },
    { id: 'T1190', name: 'Exploit Public-Facing Application', link: 'https://attack.mitre.org/techniques/T1190/' },
  ];

  // ─── Estate resources (synthetic) ──────────────────────────────────────────

  SKY.RESOURCES = [
    // Identity
    {
      id: 'iam-svc-reporting',
      name: 'iam-svc-reporting',
      domain: 'identity',
      type: 'IAM user (service account)',
      attrs: [
        { key: 'mfa', value: 'DISABLED' },
        { key: 'attached_policy', value: 'AdministratorAccess (full *)' },
        { key: 'access_key_age', value: '420 days (never rotated)' },
        { key: 'console_access', value: 'enabled' },
        { key: 'used_by', value: 'nightly reporting job' },
      ],
      findingIds: ['F-PLT-02'],
    },
    {
      id: 'iam-dev-alvarez',
      name: 'iam-dev-alvarez',
      domain: 'identity',
      type: 'IAM user (human)',
      attrs: [
        { key: 'mfa', value: 'ENABLED (hardware key)' },
        { key: 'attached_policy', value: 'ScopedReadOnly (storage:List*)' },
        { key: 'access_key_age', value: '12 days' },
        { key: 'last_login', value: '2 h ago' },
      ],
      findingIds: [],
    },
    {
      id: 'iam-ops-bot',
      name: 'iam-ops-bot',
      domain: 'identity',
      type: 'IAM user (automation)',
      attrs: [
        { key: 'mfa', value: 'ENABLED' },
        { key: 'attached_policy', value: 'OpsScoped (compute:Restart*, monitoring:Put*)' },
        { key: 'access_key_age', value: '31 days' },
      ],
      findingIds: [],
    },
    // Compute
    {
      id: 'vm-web-prod-01',
      name: 'vm-web-prod-01',
      domain: 'compute',
      type: 'Virtual machine (internet-facing web tier)',
      attrs: [
        { key: 'os', value: 'Ubuntu 20.04 LTS — past standard support (training data)' },
        { key: 'security_patches_missing', value: '14 (incl. 3 flagged high)' },
        { key: 'libcurl_version', value: '7.81.0 — inside CVE-2023-38545 affected range' },
        { key: 'kernel_installed', value: '5.15.0-1032 — includes CVE-2022-0185 fix (fixed in 5.15.0-1029, simplified advisory)' },
        { key: 'metadata_service', value: 'IMDSv1 (token NOT required)' },
        { key: 'agent', value: 'assessment agent v2.4 — last scan 1 h ago' },
      ],
      findingIds: ['F-APP-01', 'F-APP-02', 'F-PLT-06', 'F-FP-02'],
    },
    {
      id: 'vm-web-stg-01',
      name: 'vm-web-stg-01',
      domain: 'compute',
      type: 'Virtual machine (staging)',
      attrs: [
        { key: 'os', value: 'Ubuntu 22.04 LTS — in support' },
        { key: 'security_patches_missing', value: '0' },
        { key: 'agent', value: 'assessment agent v2.4 — last scan 1 h ago' },
      ],
      findingIds: ['F-NOI-01'],
    },
    {
      id: 'rds-nimbus-pg',
      name: 'rds-nimbus-pg',
      domain: 'compute',
      type: 'Managed PostgreSQL instance',
      attrs: [
        { key: 'engine', value: 'PostgreSQL 14.7 — provider-managed engine' },
        { key: 'storage_encryption', value: 'DISABLED' },
        { key: 'engine_cve_status', value: 'provider advisory PSB-2025-0411 open (training data)' },
        { key: 'customer_visible_layers', value: 'database instance + storage config only' },
      ],
      findingIds: ['F-PLT-05', 'F-PRV-01'],
    },
    // Storage
    {
      id: 'bucket-nimbusstack-exports',
      name: 'nimbusstack-exports',
      domain: 'storage',
      type: 'Object storage bucket',
      attrs: [
        { key: 'public_read', value: 'TRUE — readable by anyone on the internet' },
        { key: 'public_access_block', value: 'OFF' },
        { key: 'objects', value: '1,204 nightly customer export files' },
        { key: 'data_classification', value: 'Customer PII exports (names, emails, order history)' },
        { key: 'encryption_at_rest', value: 'enabled' },
      ],
      findingIds: ['F-PLT-01'],
    },
    {
      id: 'bucket-nimbusstack-backups',
      name: 'nimbusstack-backups',
      domain: 'storage',
      type: 'Object storage bucket',
      attrs: [
        { key: 'public_read', value: 'false' },
        { key: 'public_access_block', value: 'ON (account of record)' },
        { key: 'objects', value: '312 encrypted backup archives' },
      ],
      findingIds: ['F-FP-01', 'F-NOI-02'],
    },
    {
      id: 'snapshot-snap-0f42',
      name: 'snap-0f42',
      domain: 'storage',
      type: 'Storage snapshot',
      attrs: [
        { key: 'visibility', value: 'PUBLIC — shareable with any account' },
        { key: 'contains', value: 'Full database dump incl. application credentials (training data)' },
        { key: 'created', value: '38 days ago, never reviewed' },
      ],
      findingIds: ['F-PLT-07'],
    },
    // Network
    {
      id: 'sg-database',
      name: 'sg-database',
      domain: 'network',
      type: 'Security group',
      attrs: [
        { key: 'ingress', value: '3306/tcp from 0.0.0.0/0 (any IPv4)' },
        { key: 'attached_to', value: 'rds-nimbus-pg' },
        { key: 'change_review', value: 'none recorded' },
      ],
      findingIds: ['F-PLT-03'],
    },
    {
      id: 'sg-bastion',
      name: 'sg-bastion',
      domain: 'network',
      type: 'Security group',
      attrs: [
        { key: 'ingress', value: '22/tcp from 203.0.113.0/24 (office range, RFC 5737 doc range)' },
        { key: 'attached_to', value: 'vm-bastion-01' },
      ],
      findingIds: [],
    },
    {
      id: 'sg-frontend',
      name: 'sg-frontend',
      domain: 'network',
      type: 'Security group',
      attrs: [
        { key: 'ingress', value: '443/tcp from 0.0.0.0/0' },
        { key: 'attached_to', value: 'lb-prod-01' },
        { key: 'review', value: 'expected exposure for public web tier' },
      ],
      findingIds: ['F-NOI-03'],
    },
    // Observability
    {
      id: 'cloudtrail-org-trail',
      name: 'cloudtrail-org-trail',
      domain: 'observability',
      type: 'Organization audit trail',
      attrs: [
        { key: 'status', value: 'DISABLED — logging stopped 61 days ago' },
        { key: 'alert_on_change', value: 'not configured' },
        { key: 'retention', value: 'n/a while disabled' },
      ],
      findingIds: ['F-PLT-04'],
    },
    // Application
    {
      id: 'app-storefront',
      name: 'webapp/storefront',
      domain: 'application',
      type: 'Public web application (DAST target)',
      attrs: [
        { key: 'dast_last_run', value: '1 h ago — assessment platform DAST module' },
        { key: 'xss_reflected', value: '/search?q= renders unencoded query → reflected XSS' },
        { key: 'csp', value: 'not set' },
      ],
      findingIds: ['F-APP-03'],
    },
    {
      id: 'lb-prod-01',
      name: 'lb-prod-01',
      domain: 'application',
      type: 'Load balancer',
      attrs: [
        { key: 'tls_policy', value: 'accepts TLS 1.0 / 1.1 (deprecated)' },
        { key: 'listener', value: '443 terminated at LB' },
      ],
      findingIds: ['F-APP-04', 'F-PRV-02'],
    },
  ];

  // ─── Findings (18) ─────────────────────────────────────────────────────────
  // severity → posture penalty weight: critical 12, high 8, medium 5, low 2, informational 0.5

  SKY.FINDINGS = [
    {
      id: 'F-PLT-01',
      title: 'Storage bucket allows public read of customer PII exports',
      resourceId: 'bucket-nimbusstack-exports',
      domain: 'storage',
      layer: 'platform',
      severity: 'critical',
      score: 9.1,
      dataSource: 'config-check',
      evidence: 'bucket_policy grants ALL_USERS read; public_access_block=OFF; 1,204 PII export objects',
      detail:
        'The bucket policy grants read to ALL_USERS and the account-level Public Access Block is off. Anyone on the internet can list and download the 1,204 nightly export files containing customer PII. This is the classic cloud misconfiguration: the application is fine, the platform is not.',
      recommendation:
        'Enable the bucket Public Access Block and set the bucket private, then scrub/rotate the exposed export files and notify the data owner.',
      actions: [
        { id: 'restrict', label: 'Enable Public Access Block + set bucket private', note: 'Correct first move — cut the exposure. This is the report\u2019s primary recommended action.' },
        { id: 'scrub', label: 'Scrub/rotate exposed export files + notify data owner', note: 'Necessary follow-up: data already exposed must be treated as potentially collected, and the data owner informed.' },
        { id: 'rename', label: 'Rename the bucket', note: 'Cosmetic — the policy still grants ALL_USERS read. Obscurity is not access control.' },
        { id: 'versioning', label: 'Enable object versioning', note: 'Useful for rollback, but does nothing about public read access.' },
      ],
      mediumCorrect: 'restrict',
      hardRequired: ['restrict', 'scrub'],
      hardMode: 'sequence',
      attack: 'T1530',
      responsibility: 'customer',
    },
    {
      id: 'F-PLT-02',
      title: 'IAM user without MFA holds AdministratorAccess',
      resourceId: 'iam-svc-reporting',
      domain: 'identity',
      layer: 'platform',
      severity: 'critical',
      score: 8.9,
      dataSource: 'config-check',
      evidence: 'mfa=DISABLED, attached_policy=AdministratorAccess, access_key 420 days old',
      detail:
        'A nightly reporting job\u2019s identity has no MFA and full administrator rights, with an access key untouched for 420 days. A single leaked key gives an attacker full control-plane access — and with audit logging disabled (F-PLT-04) they would be nearly invisible.',
      recommendation:
        'Enforce MFA and replace AdministratorAccess with a least-privilege policy; rotate the stale access key.',
      actions: [
        { id: 'mfa', label: 'Enforce MFA for the identity', note: 'Correct — the report\u2019s first recommendation. MFA blocks the trivial account-takeover path.' },
        { id: 'lpa', label: 'Replace AdministratorAccess with least-privilege policy', note: 'Correct companion fix — a reporting job needs a fraction of these rights. Least privilege caps blast radius.' },
        { id: 'keyrot', label: 'Rotate the 420-day access key', note: 'Good hygiene too — do it after scoping access. Recommended in the report as follow-up.' },
        { id: 'addadmin', label: 'Add a second administrator account as backup', note: 'Wrong direction — it widens the attack surface instead of shrinking it.' },
      ],
      mediumCorrect: 'mfa',
      hardRequired: ['mfa', 'lpa'],
      hardMode: 'all',
      attack: 'T1078.004',
      responsibility: 'customer',
    },
    {
      id: 'F-PLT-03',
      title: 'Database port 3306 reachable from any IP address',
      resourceId: 'sg-database',
      domain: 'network',
      layer: 'platform',
      severity: 'high',
      score: 8.6,
      dataSource: 'config-check',
      evidence: 'sg-database ingress 3306/tcp from 0.0.0.0/0 attached to rds-nimbus-pg',
      detail:
        'The managed database accepts connections from the entire internet. Scanners find exposed database ports within hours; brute-force and exploit attempts typically follow.',
      recommendation:
        'Restrict ingress to the VPC CIDR / bastion host only, then verify application connectivity.',
      actions: [
        { id: 'restrictsg', label: 'Restrict 3306 ingress to VPC CIDR / bastion only', note: 'Correct — the database should only be reachable from inside the network path that needs it.' },
        { id: 'deletevm', label: 'Delete the database instance', note: 'Disproportionate and disruptive — fix the rule, not the workload.' },
        { id: 'openall', label: 'Allow all ports to "fix" connectivity later', note: 'That increases exposure — the opposite of remediation.' },
      ],
      mediumCorrect: 'restrictsg',
      hardRequired: ['restrictsg'],
      hardMode: 'any',
      attack: 'T1133',
      responsibility: 'customer',
    },
    {
      id: 'F-PLT-04',
      title: 'Organization audit trail disabled — no API activity logging',
      resourceId: 'cloudtrail-org-trail',
      domain: 'observability',
      layer: 'platform',
      severity: 'high',
      score: 7.5,
      dataSource: 'config-check',
      evidence: 'org trail status=DISABLED, logging stopped 61 days ago; no alert on logging changes',
      detail:
        'Account-wide API audit logging stopped 61 days ago. Detectives call this "impaired defenses": anything that happened since — including misuse of the overprivileged identity — left no cloud-side record.',
      recommendation:
        'Re-enable the organization trail, alert on any change to logging, and ship logs to immutable storage.',
      actions: [
        { id: 'enabletrail', label: 'Re-enable org trail + alert on logging changes', note: 'Correct — restore the detective control and make its removal noisy.' },
        { id: 'shipmail', label: 'Email logs manually once a week', note: 'Not a control — detection latency of a week is an attacker\u2019s dream.' },
      ],
      mediumCorrect: 'enabletrail',
      hardRequired: ['enabletrail'],
      hardMode: 'any',
      attack: 'T1562.008',
      responsibility: 'customer',
    },
    {
      id: 'F-PLT-05',
      title: 'Database storage encryption at rest disabled',
      resourceId: 'rds-nimbus-pg',
      domain: 'compute',
      layer: 'platform',
      severity: 'medium',
      score: 7.4,
      dataSource: 'config-check',
      evidence: 'storage_encryption=DISABLED on rds-nimbus-pg',
      detail:
        'The managed database\u2019s storage volumes are unencrypted at rest. Snapshots, disks, and backups inherit that state — a data-at-rest exposure if any physical medium or copy leaks.',
      recommendation:
        'Enable encryption via an encrypted snapshot copy and migrate the instance to it.',
      actions: [
        { id: 'encsnap', label: 'Enable encryption via encrypted snapshot copy', note: 'Correct — you cannot flip encryption in place; the snapshot-copy path is the standard procedure.' },
        { id: 'pwchange', label: 'Rotate the database password', note: 'Unrelated to storage-at-rest exposure.' },
      ],
      mediumCorrect: 'encsnap',
      hardRequired: ['encsnap'],
      hardMode: 'any',
      responsibility: 'customer',
    },
    {
      id: 'F-PLT-06',
      title: 'Instance metadata service v1 enabled — SSRF can retrieve credentials',
      resourceId: 'vm-web-prod-01',
      domain: 'compute',
      layer: 'platform',
      severity: 'medium',
      score: 6.5,
      dataSource: 'config-check',
      evidence: 'metadata_service=IMDSv1 (token not required) on vm-web-prod-01',
      detail:
        'With IMDSv1, any server-side request forgery flaw in the web app can read the instance\u2019s temporary credentials from metadata. Real-world intrusions (e.g., the 2019 Capital One breach) abused exactly this path.',
      recommendation:
        'Enforce IMDSv2 (token-required metadata) on the instance.',
      actions: [
        { id: 'imdsv2', label: 'Enforce IMDSv2 (token-required metadata)', note: 'Correct — token-required metadata defeats naive SSRF retrieval of credentials.' },
        { id: 'reboot', label: 'Reboot the instance', note: 'Changes nothing about the metadata service configuration.' },
      ],
      mediumCorrect: 'imdsv2',
      hardRequired: ['imdsv2'],
      hardMode: 'any',
      attack: 'T1552.005',
      responsibility: 'customer',
    },
    {
      id: 'F-PLT-07',
      title: 'Public snapshot contains full database dump with credentials',
      resourceId: 'snapshot-snap-0f42',
      domain: 'storage',
      layer: 'platform',
      severity: 'high',
      score: 8.4,
      dataSource: 'config-check',
      evidence: 'snapshot snap-0f42 visibility=PUBLIC; contains DB dump incl. application credentials',
      detail:
        'A database snapshot was made public 38 days ago and never reviewed. Anyone with an account in the same cloud can copy it and read the dump — including application credentials.',
      recommendation:
        'Set the snapshot private, then rotate every credential contained in the dump.',
      actions: [
        { id: 'privatesnap', label: 'Set snapshot visibility to private', note: 'Correct first step — contain the exposure.' },
        { id: 'rotcreds', label: 'Rotate all credentials contained in the dump', note: 'Required follow-up — credentials that sat in a public artifact must be considered compromised.' },
        { id: 'share', label: 'Share the snapshot to the wider org for review', note: 'Spreads the same sensitive artifact further.' },
      ],
      mediumCorrect: 'privatesnap',
      hardRequired: ['privatesnap', 'rotcreds'],
      hardMode: 'sequence',
      attack: 'T1552',
      responsibility: 'customer',
    },
    // Application / instance layer
    {
      id: 'F-APP-01',
      title: 'Vulnerable library: libcurl 7.81.0 (CVE-2023-38545)',
      resourceId: 'vm-web-prod-01',
      domain: 'compute',
      layer: 'app',
      severity: 'high',
      score: 8.8,
      dataSource: 'agent-scan',
      evidence: 'agent scan: libcurl 7.81.0 within affected range of CVE-2023-38545 (heap buffer overflow)',
      detail:
        'The agent found a vulnerable libcurl version on the internet-facing web instance. Exploitation is complicated in practice, but "complicated" is not "impossible" — patch to a fixed release.',
      recommendation:
        'Patch libcurl to a fixed version and restart the dependent service.',
      actions: [
        { id: 'patchcurl', label: 'Patch libcurl to fixed version + restart service', note: 'Correct — update the software (mitigation M1051 in ATT&CK terms).' },
        { id: 'hidebanner', label: 'Hide the server version banner', note: 'Hides the info from casual scanners but the vulnerability remains.' },
        { id: 'uninstall', label: 'Remove libcurl from the instance', note: 'Would break the application — not a remediation.' },
      ],
      mediumCorrect: 'patchcurl',
      hardRequired: ['patchcurl'],
      hardMode: 'any',
      attack: 'T1190',
      responsibility: 'customer',
    },
    {
      id: 'F-APP-02',
      title: 'Guest OS past standard support — 14 security patches missing',
      resourceId: 'vm-web-prod-01',
      domain: 'compute',
      layer: 'app',
      severity: 'high',
      score: 7.9,
      dataSource: 'agent-scan',
      evidence: 'agent scan: Ubuntu 20.04 past standard support; 14 security patches missing (3 high)',
      detail:
        'The instance\u2019s guest OS is the customer\u2019s responsibility in the shared responsibility model. It is out of standard support and drifting behind its patch baseline.',
      recommendation:
        'Apply the vendor patch baseline, or rebuild the instance from a hardened, supported image.',
      actions: [
        { id: 'patchbase', label: 'Apply patch baseline / rebuild from hardened image', note: 'Correct — get the guest OS back into a supported, patched state.' },
        { id: 'snapshot', label: 'Take a snapshot before doing anything', note: 'Backups do not patch anything — snapshot first is fine process, but it is not the fix.' },
        { id: 'defer', label: 'Defer patching to next quarter\u2019s window', note: 'An internet-facing, out-of-support system is not a deferral candidate.' },
      ],
      mediumCorrect: 'patchbase',
      hardRequired: ['patchbase'],
      hardMode: 'any',
      attack: 'T1190',
      responsibility: 'customer',
    },
    {
      id: 'F-APP-03',
      title: 'Reflected XSS in /search (DAST finding)',
      resourceId: 'app-storefront',
      domain: 'application',
      layer: 'app',
      severity: 'medium',
      score: 6.1,
      dataSource: 'dast',
      evidence: 'DAST: /search?q= reflects unencoded input; response executes injected script',
      detail:
        'The DAST module probed the hosted application itself and found the query parameter rendered without output encoding. This is the "scan and analyze applications hosted in the cloud" half of the tool\u2019s job.',
      recommendation:
        'Output-encode the query rendering and add a Content Security Policy.',
      actions: [
        { id: 'encode', label: 'Output-encode rendering + add CSP', note: 'Correct — fix the code path and add the defense-in-depth header.' },
        { id: 'blocksearch', label: 'Take the /search route offline', note: 'Breaks the feature for users; fix the encoding instead.' },
        { id: 'wafonly', label: 'Buy a WAF and ship as-is', note: 'A WAF helps, but shipping known-bad code with a filter in front is not remediation.' },
      ],
      mediumCorrect: 'encode',
      hardRequired: ['encode'],
      hardMode: 'any',
      attack: 'T1190',
      responsibility: 'customer',
    },
    {
      id: 'F-APP-04',
      title: 'Load balancer still accepts deprecated TLS 1.0',
      resourceId: 'lb-prod-01',
      domain: 'application',
      layer: 'app',
      severity: 'medium',
      score: 5.9,
      dataSource: 'config-check',
      evidence: 'lb-prod-01 tls_policy accepts TLS 1.0 / 1.1',
      detail:
        'The edge still negotiates deprecated TLS versions, weakening transport protection for every customer session.',
      recommendation:
        'Enforce a TLS 1.2+ security policy on the listener.',
      actions: [
        { id: 'tlspolicy', label: 'Enforce TLS 1.2+ security policy', note: 'Correct — modern policy, and verify no legacy client breaks before rolling out.' },
        { id: 'allowall', label: 'Allow all ciphers for compatibility', note: 'Maximum compatibility, minimum security — no.' },
      ],
      mediumCorrect: 'tlspolicy',
      hardRequired: ['tlspolicy'],
      hardMode: 'any',
      responsibility: 'customer',
    },
    // Provider-side
    {
      id: 'F-PRV-01',
      title: 'Managed database engine CVE — no customer remediation path',
      resourceId: 'rds-nimbus-pg',
      domain: 'compute',
      layer: 'platform',
      severity: 'medium',
      score: 6.8,
      dataSource: 'config-check',
      evidence: 'engine layer CVE (provider advisory PSB-2025-0411, training data) — engine is provider-managed',
      detail:
        'The assessment tool reports a CVE inside the provider-managed database engine. The customer cannot patch that layer — this is a scanning limitation in a managed environment: the tool sees the finding, but remediation belongs to the provider. The customer\u2019s job is to verify the provider\u2019s advisory and confirm the upgrade plan.',
      recommendation:
        'Track the provider advisory, confirm the engine minor-upgrade schedule, and verify remediation on the provider status page.',
      actions: [
        { id: 'trackadv', label: 'Track provider advisory + confirm engine upgrade plan', note: 'Correct — in shared responsibility the engine is the provider\u2019s to patch; you verify and follow up.' },
        { id: 'reimage', label: 'Re-image the managed instance', note: 'You cannot — the engine layer is not customer-visible or customer-modifiable.' },
        { id: 'patchengine', label: 'Patch the engine yourself', note: 'Not possible on a managed service — that layer is provider-owned.' },
      ],
      mediumCorrect: 'trackadv',
      hardRequired: ['trackadv'],
      hardMode: 'any',
      responsibility: 'provider',
    },
    {
      id: 'F-PRV-02',
      title: 'Provider-managed edge appliance firmware CVE',
      resourceId: 'lb-prod-01',
      domain: 'application',
      layer: 'platform',
      severity: 'low',
      score: 3.1,
      dataSource: 'config-check',
      evidence: 'firmware CVE inside provider-managed load-balancer appliance (training data)',
      detail:
        'Another managed-layer finding: firmware belongs to the provider. Track the advisory; there is nothing to patch on your side.',
      recommendation: 'Track the provider advisory and verify the firmware fix rollout.',
      actions: [
        { id: 'trackadv2', label: 'Track provider advisory + verify fix rollout', note: 'Correct — same shared-responsibility pattern as F-PRV-01.' },
        { id: 'replace', label: 'Replace the load balancer with a self-managed one', note: 'A big architecture change driven by a low-severity finding — not the right move here.' },
      ],
      mediumCorrect: 'trackadv2',
      hardRequired: ['trackadv2'],
      hardMode: 'any',
      responsibility: 'provider',
    },
    // Noise
    {
      id: 'F-NOI-01',
      title: 'Detailed monitoring not enabled on staging instance',
      resourceId: 'vm-web-stg-01',
      domain: 'compute',
      layer: 'platform',
      severity: 'low',
      score: 2.0,
      dataSource: 'config-check',
      evidence: 'vm-web-stg-01 detailed monitoring = disabled (best-practice suggestion)',
      detail: 'A best-practice suggestion for staging. Low priority — decide based on budget and need, not fear.',
      recommendation: 'Enable detailed monitoring if staging telemetry is needed.',
      actions: [
        { id: 'enablemon', label: 'Enable detailed monitoring', note: 'Fine to enable — but note this is a hygiene item, not an exposure.' },
      ],
      mediumCorrect: 'enablemon',
      hardRequired: ['enablemon'],
      hardMode: 'any',
      responsibility: 'customer',
    },
    {
      id: 'F-NOI-02',
      title: 'Backup bucket has no lifecycle policy',
      resourceId: 'bucket-nimbusstack-backups',
      domain: 'storage',
      layer: 'platform',
      severity: 'low',
      score: 2.0,
      dataSource: 'config-check',
      evidence: 'lifecycle policy not configured on nimbusstack-backups',
      detail: 'Cost/storage hygiene on an otherwise well-locked bucket.',
      recommendation: 'Add a lifecycle policy to expire stale backups.',
      actions: [
        { id: 'lifecycle', label: 'Add lifecycle policy for stale backups', note: 'Good hygiene; unrelated to access exposure.' },
      ],
      mediumCorrect: 'lifecycle',
      hardRequired: ['lifecycle'],
      hardMode: 'any',
      responsibility: 'customer',
    },
    {
      id: 'F-NOI-03',
      title: 'Port 443 open to the internet on the web tier',
      resourceId: 'sg-frontend',
      domain: 'network',
      layer: 'platform',
      severity: 'informational',
      score: 0.5,
      dataSource: 'config-check',
      evidence: 'sg-frontend ingress 443/tcp from 0.0.0.0/0 — expected for a public web tier',
      detail:
        'This one is rated informational on purpose: a public web tier must accept HTTPS from anywhere. Reading severity in context is a core analyst skill — not everything open is wrong.',
      recommendation: 'Acknowledge as expected exposure; keep on the review list.',
      actions: [
        { id: 'acknowledge', label: 'Mark reviewed — expected public exposure', note: 'Correct reading: documented, expected exposure is managed, not feared.' },
        { id: 'close443', label: 'Close port 443 to the internet', note: 'Would take the storefront offline — that is breaking the business, not securing it.' },
      ],
      mediumCorrect: 'acknowledge',
      hardRequired: ['acknowledge'],
      hardMode: 'any',
      responsibility: 'customer',
    },
    // False positives (Hard-mode red herrings)
    {
      id: 'F-FP-01',
      title: 'Backup bucket reported publicly readable',
      resourceId: 'bucket-nimbusstack-backups',
      domain: 'storage',
      layer: 'platform',
      severity: 'high',
      score: 8.2,
      dataSource: 'config-check',
      evidence: 'report claims nimbusstack-backups is publicly readable (verify against resource config)',
      detail:
        'The scanner rule flagged the backups bucket as public — but the resource configuration shows public_read=false and the bucket-level Public Access Block is ON. The rule misread the bucket policy. This is a false positive: the evidence contradicts the claim.',
      recommendation: 'Validate against raw resource configuration; dispute the finding with evidence.',
      actions: [
        { id: 'invalidate1', label: 'Dispute finding — evidence shows Public Access Block ON', note: 'Correct — checking the raw config (public_access_block=ON, public_read=false) disproves the report line.' },
        { id: 'restrictbackups', label: 'Restrict the backups bucket anyway', note: 'There is no defect to fix — the bucket is already private. Fix the report, not the bucket.' },
      ],
      mediumCorrect: 'invalidate1',
      hardRequired: ['invalidate1'],
      hardMode: 'any',
      falsePositive: { why: 'public_access_block=ON and public_read=false in the resource configuration', field: 'public_access_block' },
      responsibility: 'customer',
    },
    {
      id: 'F-FP-02',
      title: 'Kernel CVE-2022-0185 reported unpatched',
      resourceId: 'vm-web-prod-01',
      domain: 'compute',
      layer: 'app',
      severity: 'high',
      score: 7.2,
      dataSource: 'agent-scan',
      evidence: 'report claims kernel vulnerable to CVE-2022-0185 (verify installed version against fixed version)',
      detail:
        'The rule matches the vendor advisory without a version check. Installed kernel is 5.15.0-1032; the fix landed in 5.15.0-1029 (simplified advisory data). Installed ≥ fixed ⇒ not vulnerable. Always compare installed vs fixed versions before acting.',
      recommendation: 'Compare installed vs fixed package version; dispute if the fix is already installed.',
      actions: [
        { id: 'invalidate2', label: 'Dispute finding — installed kernel includes the fix', note: 'Correct — version comparison disproves the finding. Re-patching wastes a change window.' },
        { id: 'patchkernel', label: 'Re-patch / roll back the kernel', note: 'Pointless churn: the fix is already installed. Verify versions, then dispute.' },
      ],
      mediumCorrect: 'invalidate2',
      hardRequired: ['invalidate2'],
      hardMode: 'any',
      falsePositive: { why: 'installed kernel 5.15.0-1032 ≥ fixed-in 5.15.0-1029 (simplified advisory)', field: 'kernel_installed' },
      responsibility: 'customer',
    },
  ];

  SKY.FINDING_BY_ID = SKY.FINDINGS.reduce(function (acc, f) { acc[f.id] = f; return acc; }, {});
  SKY.RESOURCE_BY_ID = SKY.RESOURCES.reduce(function (acc, r) { acc[r.id] = r; return acc; }, {});

  SKY.SEVERITY_WEIGHT = {
    critical: 12,
    high: 8,
    medium: 5,
    low: 2,
    informational: 0.5,
  };

  // ─── Glossary ──────────────────────────────────────────────────────────────

  SKY.GLOSSARY = [
    { term: 'CSPM', def: 'Cloud Security Posture Management — a tool that continuously checks cloud platform configuration against policy and flags misconfigurations.' },
    { term: 'CNAPP', def: 'Cloud-Native Application Protection Platform — a combined suite (posture + workload + app scanning) for cloud estates.' },
    { term: 'DAST', def: 'Dynamic Application Security Testing — probes a running application (like the platform\u2019s DAST module probing /search).' },
    { term: 'Agent scan', def: 'A scanner component installed on an instance that inventories OS packages and versions to detect missing patches and vulnerable libraries.' },
    { term: 'Config check', def: 'A rule that compares a cloud resource\u2019s configuration (bucket policy, security group, IAM) against a secure baseline.' },
    { term: 'Misconfiguration', def: 'A platform setting that diverges from the secure baseline — e.g., a public bucket, no MFA, or an open database port.' },
    { term: 'Shared responsibility model', def: 'Contract that splits security duties: the provider secures the cloud itself; the customer secures what they put in it and how they configure it.' },
    { term: 'Least privilege', def: 'Granting an identity only the permissions it needs — nothing more.' },
    { term: 'MFA', def: 'Multi-factor authentication — a second proof of identity beyond the password or key.' },
    { term: 'Public Access Block', def: 'A storage guardrail that overrides bucket/object settings so public access cannot be granted accidentally.' },
    { term: 'Security group', def: 'A virtual firewall controlling ingress/egress to cloud resources, e.g., which IPs may reach port 3306.' },
    { term: 'Audit trail', def: 'Record of API/control-plane activity (who did what, when). Disabling it impairs detection of abuse.' },
    { term: 'CVSS', def: 'Common Vulnerability Scoring System — a 0–10 severity score for vulnerabilities (values here are simplified training data).' },
    { term: 'Posture score', def: 'A single 0–100 number expressing how healthy the estate\u2019s configuration is; rises as findings are remediated and verified.' },
    { term: 'Managed service', def: 'A service whose lower layers (engine, firmware, hypervisor) are operated by the provider — customers configure, but cannot patch, those layers.' },
    { term: 'False positive', def: 'A finding contradicted by the underlying evidence — e.g., a rule matching an advisory without checking the installed version.' },
  ];

  // ─── Objectives ────────────────────────────────────────────────────────────
  // Medium: 12 granular, guided. Hard: 9 broad, strict.

  SKY.OBJECTIVES = [
    // ── MEDIUM ──
    {
      id: 'OBJ-M1',
      mode: 'medium',
      pillar: 'P1',
      title: 'Run the initial assessment and identify the two layers the platform tool reports on.',
      detail:
        'Open the Assessment tab and press RUN INITIAL ASSESSMENT. Watch which domains it sweeps, then answer what the report covers.',
      anchor: 'Lesson: "scan and analyze applications hosted in the cloud and the configuration of the platform they run on"',
      drill: {
        kind: 'multi',
        question: 'The findings report covers two assessment layers. Select BOTH:',
        options: [
          'End-user device health',
          'Application and instance vulnerabilities (agent scan, DAST)',
          'Email gateway reputation',
          'Platform configuration misconfigurations (config checks)',
        ],
        correct: [1, 3],
        pick: 2,
      },
      feedbackPass:
        'Exactly. Cloud platform assessment tools work BOTH layers: what runs in the cloud (apps, instances) and how the platform itself is configured. A tool that only did one half would miss half the risk.',
      hints: [
        'Run the scan first — the answer is visible once the report exists.',
        'Look at the "Layer" column in the report: two distinct values appear.',
        'Select the app/instance vulnerabilities option and the platform configuration misconfigurations option.',
      ],
    },
    {
      id: 'OBJ-M2',
      mode: 'medium',
      pillar: 'P2',
      title: 'Classify six findings by their assessment layer.',
      detail: 'For each finding in the drill, decide whether it is an application/instance vulnerability or a platform misconfiguration.',
      anchor: 'Lesson: two-layer analysis — applications/instances vs platform configuration',
      drill: {
        kind: 'classify',
        items: [
          { key: 'F-APP-01', label: 'F-APP-01 — libcurl CVE-2023-38545 on web-prod-01' },
          { key: 'F-PLT-01', label: 'F-PLT-01 — bucket readable by ALL_USERS' },
          { key: 'F-APP-03', label: 'F-APP-03 — reflected XSS in /search (DAST)' },
          { key: 'F-PLT-04', label: 'F-PLT-04 — organization audit trail disabled' },
          { key: 'F-PLT-06', label: 'F-PLT-06 — metadata service v1 enabled' },
          { key: 'F-APP-04', label: 'F-APP-04 — LB accepts TLS 1.0' },
        ],
        options: [
          { id: 'app', label: 'Application / instance' },
          { id: 'platform', label: 'Platform configuration' },
        ],
        answer: {
          'F-APP-01': 'app',
          'F-PLT-01': 'platform',
          'F-APP-03': 'app',
          'F-PLT-04': 'platform',
          'F-PLT-06': 'platform',
          'F-APP-04': 'app',
        },
      },
      feedbackPass:
        'The layer tells you WHO and HOW: app/instance findings are patched or coded away by you; platform findings are reconfigured in the cloud console. Triage starts by sorting the pile.',
      hints: [
        'Ask: is this about code/packages on a machine, or about a setting on a cloud resource?',
        'A CVE in a library and an XSS flaw live in the app/instance layer; a bucket policy or audit trail is platform configuration.',
        'libcurl → app · public bucket → platform · XSS → app · trail disabled → platform · IMDSv1 → platform · TLS 1.0 → app.',
      ],
    },
    {
      id: 'OBJ-M3',
      mode: 'medium',
      pillar: 'P2',
      title: 'Locate the storage resource leaking customer data and flag it for triage.',
      detail:
        'Open the Estate tab, inspect the storage resources, find the one exposing data publicly, flag it, and record what kind of data it exposes.',
      anchor: 'Lesson: "identify platform misconfigurations" — storage layer',
      drill: {
        kind: 'ids',
        fields: [
          {
            key: 'dataType',
            label: 'What kind of data does the exposed resource contain?',
            placeholder: 'e.g. customer PII exports',
            type: 'value',
            expected: ['pii', 'customer pii exports', 'personal data', 'personal information', 'customer data', 'ppi', 'personally identifiable information', 'customer records', 'customer information', 'names emails order history'],
          },
        ],
      },
      feedbackPass:
        'nimbusstack-exports grants ALL_USERS read with the Public Access Block OFF, and it holds 1,204 customer PII export files. Storage is the most commonly leaked cloud layer — always check what the bucket contains, not just that it is open.',
      hints: [
        'Two buckets and a snapshot live in the Estate → Storage. Compare their public_read attributes.',
        'The one with public_read=TRUE and public_access_block=OFF is your target.',
        'Flag bucket-nimbusstack-exports; it contains customer PII exports.',
      ],
    },
    {
      id: 'OBJ-M4',
      mode: 'medium',
      pillar: 'P2',
      title: 'Locate the identity misconfiguration that enables full account takeover and flag it.',
      detail: 'Inspect the Identity & Access resources. One identity combines two properties that make it the most dangerous login in the estate. Flag it.',
      anchor: 'Lesson: "identify platform misconfigurations" — identity layer',
      flagOnly: true,
      feedbackPass:
        'iam-svc-reporting has NO MFA and holds AdministratorAccess — an unphishable second factor missing on the most powerful identity, with a 420-day-old key. Defense in depth starts with identity.',
      hints: [
        'Check every identity\u2019s mfa and attached_policy attributes.',
        'You want mfa=DISABLED combined with AdministratorAccess.',
        'Flag iam-svc-reporting.',
      ],
    },
    {
      id: 'OBJ-M5',
      mode: 'medium',
      pillar: 'P2',
      title: 'Find the network rule that exposes the database to the internet; flag the rule and record the port.',
      detail: 'Inspect the Network security groups. One of them lets any IPv4 address reach the database. Flag it and enter the exposed port number.',
      anchor: 'Lesson: "identify platform misconfigurations" — network layer',
      drill: {
        kind: 'ids',
        fields: [
          { key: 'port', label: 'Exposed TCP port', placeholder: 'e.g. 443', type: 'value', expected: ['3306'] },
        ],
      },
      feedbackPass:
        'sg-database allows 3306/tcp from 0.0.0.0/0 — the whole internet can knock on the database. Port 443 on the frontend is open too, but that one is expected exposure. Context turns a port number into a finding.',
      hints: [
        'Look at the ingress attribute of each security group.',
        '0.0.0.0/0 means "any IPv4 address". Find the database port with that source.',
        'Flag sg-database; the port is 3306.',
      ],
    },
    {
      id: 'OBJ-M6',
      mode: 'medium',
      pillar: 'P2',
      title: 'Identify the instance with application/instance-layer vulnerabilities and flag it.',
      detail: 'The agent scan and DAST module found most of their issues on one compute resource. Inspect Compute resources and flag the offending instance.',
      anchor: 'Lesson: "detect vulnerabilities in applications and instances"',
      flagOnly: true,
      feedbackPass:
        'vm-web-prod-01 collects four findings: a vulnerable libcurl, an out-of-support OS missing 14 patches, IMDSv1 enabled — plus a kernel CVE claim that is actually wrong (you will prove that in Hard mode). One noisy box, four different lessons.',
      hints: [
        'Which instance would an internet-facing attacker meet first?',
        'Compare security_patches_missing across the Compute resources.',
        'Flag vm-web-prod-01.',
      ],
    },
    {
      id: 'OBJ-M7',
      mode: 'medium',
      pillar: 'P3',
      title: 'Read the findings report: identify the single highest-scored finding and its score.',
      detail: 'Scan the report\u2019s Score column (simplified CVSS-style, training data). Enter the finding ID and its score.',
      anchor: 'Lesson: "detailed findings reports" — reading severity and evidence',
      drill: {
        kind: 'ids',
        fields: [
          { key: 'findingId', label: 'Finding ID', placeholder: 'e.g. F-PLT-07', type: 'value', expected: ['F-PLT-01', 'FPLT01'] },
          { key: 'score', label: 'Score', placeholder: 'e.g. 8.6', type: 'value', expected: ['9.1'] },
        ],
      },
      feedbackPass:
        'F-PLT-01 (public PII bucket) tops the report at 9.1. Severity is your first triage axis — but remember exposure and data sensitivity matter too, which is why prioritization drills exist.',
      hints: [
        'Sort the report by the Score column — the top row is your answer.',
        'The top score is above 9.0 and sits in the Storage domain.',
        'F-PLT-01, score 9.1.',
      ],
    },
    {
      id: 'OBJ-M8',
      mode: 'medium',
      pillar: 'P1',
      title: 'Map three platform misconfigurations to the MITRE ATT&CK techniques they enable.',
      detail: 'Each misconfiguration is an open door. Match it to the technique an attacker would walk through it with.',
      anchor: 'MITRE mapping of chapter context: T1530, T1078.004, T1562.008',
      drill: {
        kind: 'match',
        rows: [
          { key: 'F-PLT-01', label: 'F-PLT-01 — public PII bucket' },
          { key: 'F-PLT-02', label: 'F-PLT-02 — no-MFA admin identity' },
          { key: 'F-PLT-04', label: 'F-PLT-04 — audit trail disabled' },
        ],
        options: ['T1190', 'T1530', 'T1133', 'T1078.004', 'T1562.008'],
        answer: {
          'F-PLT-01': 'T1530',
          'F-PLT-02': 'T1078.004',
          'F-PLT-04': 'T1562.008',
        },
      },
      feedbackPass:
        'Public bucket → T1530 Data from Cloud Storage. No-MFA admin → T1078.004 Valid Accounts: Cloud Accounts. Disabled cloud logs → T1562.008 Impair Defenses: Disable Cloud Logs. Misconfigurations are pre-positioned attacker infrastructure.',
      hints: [
        'Read each technique\u2019s name in the Debrief — they describe exactly what the misconfig allows.',
        'Bucket = storage access · identity = valid accounts · logging = impairing defenses.',
        'F-PLT-01→T1530 · F-PLT-02→T1078.004 · F-PLT-04→T1562.008.',
      ],
    },
    {
      id: 'OBJ-M9',
      mode: 'medium',
      pillar: 'P4',
      title: 'Apply the report\u2019s recommended remediation for the three highest-priority platform findings.',
      detail: 'Open the Remediation deck. For F-PLT-01, F-PLT-02 and F-PLT-03, apply the report\u2019s first recommended action (the deck marks the report recommendation on each card).',
      anchor: 'Lesson: "findings reports include practical recommendations for vulnerability remediation"',
      deckBased: true,
      feedbackPass:
        'You just converted report recommendations into real posture: exposure cut off, identity hardened, database unexposed. This is the daily loop of a cloud analyst: finding → recommendation → verified change.',
      hints: [
        'Each deck card quotes the report recommendation at the top.',
        'For the bucket: enable the Public Access Block. For the identity: enforce MFA. For the security group: restrict to VPC/bastion.',
        'Apply \u201crestrict\u201d, \u201cmfa\u201d and \u201crestrictsg\u201d respectively.',
      ],
    },
    {
      id: 'OBJ-M10',
      mode: 'medium',
      pillar: 'P4',
      title: 'Assign responsibility for four findings using the shared responsibility model.',
      detail: 'Who fixes it — you (customer) or the provider? Classify the four findings in the drill.',
      anchor: 'Adjunct chapter context: shared responsibility, managed-service scanning limitations',
      drill: {
        kind: 'resp',
        rows: [
          { key: 'F-PLT-01', label: 'F-PLT-01 — public PII bucket' },
          { key: 'F-PRV-01', label: 'F-PRV-01 — managed DB engine CVE' },
          { key: 'F-APP-01', label: 'F-APP-01 — libcurl CVE on your VM' },
          { key: 'F-PRV-02', label: 'F-PRV-02 — provider edge firmware CVE' },
        ],
        answer: {
          'F-PLT-01': 'customer',
          'F-PRV-01': 'provider',
          'F-APP-01': 'customer',
          'F-PRV-02': 'provider',
        },
      },
      feedbackPass:
        'What YOU deploy and configure is yours (buckets, guest OS, libraries); what the provider operates under the hood (managed engine, edge firmware) is theirs. Knowing the boundary stops you from trying to patch layers you cannot touch.',
      hints: [
        'Ask: does the customer operate that layer at all?',
        'Managed engine and provider firmware are inside the provider\u2019s zone.',
        'F-PLT-01 customer · F-PRV-01 provider · F-APP-01 customer · F-PRV-02 provider.',
      ],
    },
    {
      id: 'OBJ-M11',
      mode: 'medium',
      pillar: 'P3',
      title: 'Prioritize three findings for tonight\u2019s change window.',
      detail: 'Order by: public exposure first, identity risk second, internal hygiene last. Use severity, exposure and data sensitivity together.',
      anchor: 'Adjunct chapter context: prioritizing remediation from findings reports',
      drill: {
        kind: 'order',
        items: [
          { key: 'F-PLT-01', label: 'F-PLT-01 — public PII bucket (critical, internet-exposed data)' },
          { key: 'F-APP-02', label: 'F-APP-02 — out-of-support OS on internet-facing VM (high)' },
          { key: 'F-PLT-05', label: 'F-PLT-05 — DB encryption at rest off (medium, internal)' },
        ],
        answer: ['F-PLT-01', 'F-APP-02', 'F-PLT-05'],
      },
      feedbackPass:
        'Critical + internet-exposed + sensitive data beats high on a public box beats medium on an internal store. Prioritization is severity × exposure × data value — not severity alone.',
      hints: [
        'The most public, most sensitive exposure goes first.',
        'An internet-facing VM missing patches outranks an internal encryption-at-rest gap.',
        'F-PLT-01 → F-APP-02 → F-PLT-05.',
      ],
    },
    {
      id: 'OBJ-M12',
      mode: 'medium',
      pillar: 'P4',
      title: 'Re-run the assessment to verify your remediations and watch the posture score climb.',
      detail: 'After applying remediations, return to the Assessment tab and press RUN RE-ASSESSMENT. Cleared findings flip to "verified pass". CHECK when the score has visibly improved.',
      anchor: 'Adjunct chapter context: verifying remediation effectiveness by re-assessment',
      deckBased: true,
      feedbackPass:
        'A remediation is not a remediation until a re-scan proves it. The posture score is the tool\u2019s own verification of your work — this closed loop (find → fix → re-scan) is the whole job.',
      hints: [
        'You need at least five findings remediated before re-scanning.',
        'Press RUN RE-ASSESSMENT in the Assessment tab after remediating.',
        'Target: re-scan done, ≥5 findings cleared, posture score above 60.',
      ],
    },

    // ── HARD ──
    {
      id: 'OBJ-H1',
      mode: 'hard',
      pillar: 'P2',
      title: 'From the noisy report, extract every GENUINE Critical or High finding — IDs only.',
      detail:
        'The full report contains 18 findings including low-value noise and claims contradicted by the evidence. Enter the IDs of every finding that is both severity Critical/High AND actually true. Wrong entries are rejected with rationale.',
      anchor: 'Lesson: "detailed findings reports" + evidence verification',
      drill: {
        kind: 'ids',
        fields: [
          {
            key: 'chSet',
            label: 'Genuine Critical/High finding IDs (comma or space separated)',
            placeholder: 'e.g. F-PLT-01, F-APP-01, ...',
            type: 'set',
            expected: ['F-PLT-01', 'F-PLT-02', 'F-APP-01', 'F-PLT-03', 'F-PLT-07', 'F-APP-02', 'F-PLT-04'],
          },
        ],
      },
      feedbackPass:
        'Seven genuine Critical/High findings — and you excluded the two High-rated claims that the evidence disproves (the "public" backups bucket and the already-patched kernel). Severity is a claim; verification makes it knowledge.',
      hints: [
        'Severity Critical/High gives you nine candidates — two of them are not real.',
        'Check F-FP-01 and F-FP-02 against the raw resource evidence before including them.',
        'The set: F-PLT-01, F-PLT-02, F-APP-01, F-PLT-03, F-PLT-07, F-APP-02, F-PLT-04.',
      ],
    },
    {
      id: 'OBJ-H2',
      mode: 'hard',
      pillar: 'P1',
      title: 'Map five misconfigurations to their exact ATT&CK technique IDs.',
      detail: 'Exact technique IDs required — sub-technique numbers matter. The Debrief\u2019s technique table is fair game; precision is the exercise.',
      anchor: 'MITRE exemplar mapping: T1530, T1078.004, T1562.008, T1552.005, T1133',
      drill: {
        kind: 'match',
        rows: [
          { key: 'F-PLT-01', label: 'F-PLT-01 — public PII bucket' },
          { key: 'F-PLT-02', label: 'F-PLT-02 — no-MFA admin identity' },
          { key: 'F-PLT-03', label: 'F-PLT-03 — database port open to internet' },
          { key: 'F-PLT-04', label: 'F-PLT-04 — audit trail disabled' },
          { key: 'F-PLT-06', label: 'F-PLT-06 — IMDSv1 enabled' },
        ],
        options: ['T1190', 'T1562.008', 'T1530', 'T1552.005', 'T1078.004', 'T1133'],
        answer: {
          'F-PLT-01': 'T1530',
          'F-PLT-02': 'T1078.004',
          'F-PLT-03': 'T1133',
          'F-PLT-04': 'T1562.008',
          'F-PLT-06': 'T1552.005',
        },
      },
      feedbackPass:
        'T1530 cloud storage collection · T1078.004 cloud valid accounts · T1133 external remote services · T1562.008 disabling cloud logs · T1552.005 metadata API credential theft. Five misconfigurations, five doors an attacker already knows how to walk through.',
      hints: [
        'Two of these are sub-techniques — the .004 and .008 suffixes are required.',
        'Metadata service = credential access via instance metadata API; open DB port = reaching a remote service from outside.',
        'T1530 · T1078.004 · T1133 · T1562.008 · T1552.005 in row order.',
      ],
    },
    {
      id: 'OBJ-H3',
      mode: 'hard',
      pillar: 'P2',
      title: 'Incident reconstruction: identify the entry point and the two misconfigurations that leaked data.',
      detail:
        'Simulated trace (training data): an anonymous scanner found a readable artifact listing 1,204 export files, pulled them, and — via a second public artifact — obtained database credentials. Name the entry-point resource and BOTH involved finding IDs.',
      anchor: 'Lesson: platform misconfigurations enabling real impact (T1530 / T1552 pattern)',
      drill: {
        kind: 'ids',
        fields: [
          { key: 'entry', label: 'Entry-point resource', placeholder: 'resource name', type: 'value', expected: ['nimbusstack-exports', 'bucket-nimbusstack-exports'] },
          { key: 'fA', label: 'Finding A (the bucket)', placeholder: 'F-XX-XX', type: 'value', expected: ['F-PLT-01'] },
          { key: 'fB', label: 'Finding B (the credential leak)', placeholder: 'F-XX-XX', type: 'value', expected: ['F-PLT-07'] },
        ],
      },
      feedbackPass:
        'The public export bucket (F-PLT-01) was the door; the public snapshot with the DB dump (F-PLT-07) handed over credentials. Two unrelated "small" misconfigurations chained into one incident — attackers chain, so defenders must too.',
      hints: [
        'What did the scanner read FIRST? One resource held 1,204 export files.',
        'The credentials came from the second public artifact — a snapshot.',
        'Entry: nimbusstack-exports · F-PLT-01 + F-PLT-07.',
      ],
    },
    {
      id: 'OBJ-H4',
      mode: 'hard',
      pillar: 'P4',
      title: 'Execute the full two-stage remediations for the bucket and the identity.',
      detail:
        'In the Remediation deck, remediate F-PLT-01 in the correct ORDER (contain first, then correct the exposed data) and F-PLT-02 with BOTH required actions (MFA and least privilege). Sequence and completeness are checked.',
      anchor: 'Lesson: "practical recommendations for vulnerability remediation" — applied rigorously',
      deckBased: true,
      feedbackPass:
        'Contain-then-correct is the professional order: restricting the bucket first stops NEW collection, scrubbing/rotating handles what was already exposed. And MFA + least privilege together turn a catastrophic identity into a boring one.',
      hints: [
        'The deck card shows both steps for the bucket — apply them in the listed order.',
        'Restrict access before scrubbing data; the identity needs both MFA and the scoped policy.',
        'F-PLT-01: restrict → scrub. F-PLT-02: mfa + lpa.',
      ],
    },
    {
      id: 'OBJ-H5',
      mode: 'hard',
      pillar: 'P4',
      title: 'Clear every customer-owned Critical/High finding, re-scan, and name what legitimately remains.',
      detail:
        'Remediate ALL customer-fixable Critical/High findings, run the re-assessment, then answer: which finding remains open and unfixable by you, who owns it, and what is YOUR correct action?',
      anchor: 'Lesson: shared responsibility + re-assessment verification + managed-service scanning limitations',
      drill: {
        kind: 'select2',
        selects: [
          { key: 'remains', label: 'Finding that remains open after your work', options: ['F-APP-03 — reflected XSS', 'F-PRV-01 — managed DB engine CVE', 'F-NOI-01 — staging monitoring', 'F-PLT-05 — encryption at rest'], expected: ['F-PRV-01 — managed DB engine CVE'] },
          { key: 'party', label: 'Who must remediate it', options: ['customer', 'provider', 'nobody'], expected: ['provider'] },
          { key: 'custAction', label: 'Your correct action', options: ['Re-image the managed instance from the console', 'Track the provider advisory and verify the fix', 'Patch the engine yourself in the next window', 'Ignore it until the next assessment cycle'], expected: ['Track the provider advisory and verify the fix'] },
        ],
      },
      feedbackPass:
        'You cleared all seven customer-owned Critical/High findings and the re-scan verified them. F-PRV-01 remains because the engine is provider-managed — a scanning limitation of managed environments. Your job there: track, verify, follow up.',
      hints: [
        'The customer-owned Critical/High set is the seven genuine findings from OBJ-H1.',
        'After remediation, run RUN RE-ASSESSMENT — the answer section validates only after verification.',
        'What remains: F-PRV-01, owned by the provider; you track the advisory and verify the upgrade.',
      ],
    },
    {
      id: 'OBJ-H6',
      mode: 'hard',
      pillar: 'P3',
      title: 'Disprove both false positives with the exact evidence field that contradicts each.',
      detail: 'Two High-rated report lines are wrong. For each: select the finding and the single resource attribute that disproves it.',
      anchor: 'Adjunct chapter context: tool-output verification, false-positive analysis',
      drill: {
        kind: 'pairs',
        rows: [
          { key: 'fp1', label: 'Claim A: "backup bucket is publicly readable"', findingOptions: ['F-FP-02 — kernel CVE', 'F-FP-01 — backups bucket public', 'F-PLT-01 — exports bucket public'], fieldOptions: ['public_read', 'kernel_installed', 'public_access_block', 'objects', 'encryption_at_rest'] },
          { key: 'fp2', label: 'Claim B: "kernel CVE-2022-0185 unpatched"', findingOptions: ['F-APP-01 — libcurl CVE', 'F-FP-01 — backups bucket public', 'F-FP-02 — kernel CVE'], fieldOptions: ['libcurl_version', 'kernel_installed', 'security_patches_missing', 'public_read'] },
        ],
        answer: {
          fp1: { finding: 'F-FP-01 — backups bucket public', field: 'public_access_block' },
          fp2: { finding: 'F-FP-02 — kernel CVE', field: 'kernel_installed' },
        },
      },
      feedbackPass:
        'Claim A dies on public_access_block=ON; claim B dies on kernel_installed=5.15.0-1032 ≥ fixed 5.15.0-1029. False positives are not tool failures — they are a normal part of assessment output that a competent analyst filters with evidence.',
      hints: [
        'Open both resources in the Inspector and read every attribute line.',
        'One claim is contradicted by a guardrail attribute; the other by a version attribute.',
        'F-FP-01 ← public_access_block · F-FP-02 ← kernel_installed.',
      ],
    },
    {
      id: 'OBJ-H7',
      mode: 'hard',
      pillar: 'P3',
      title: 'Executive debrief: select ALL correct statements about the estate\u2019s risk.',
      detail: 'Three of the six statements are defensible in front of a CISO. Choose exactly those three.',
      anchor: 'Lesson: findings reports driving risk communication',
      drill: {
        kind: 'multi',
        question: 'Select the three defensible statements:',
        options: [
          'The estate is compliant because all instances are fully patched.',
          'Detective controls (audit logging) are impaired, delaying incident detection.',
          'Closing port 3306 will break the public website.',
          'Publicly accessible storage exposes customer PII and must be restricted immediately.',
          'The managed database CVE must be fixed by re-imaging the instance.',
          'Identity is overprivileged and lacks MFA, enabling straightforward account takeover.',
        ],
        correct: [1, 3, 5],
        pick: 3,
      },
      feedbackPass:
        'The three correct statements name exposure, identity and detection — the classic risk tripod. The distractors fail on facts: instances are NOT fully patched, you cannot re-image a managed engine, and 3306 feeds the database, not the website.',
      hints: [
        'Reject any statement contradicted by the report or by the shared responsibility model.',
        '"Fully patched" is false on F-APP-02; the engine is provider-managed; 3306 is not the web port.',
        'The defensible three: impaired logging, public PII storage, and the no-MFA admin identity.',
      ],
    },
    {
      id: 'OBJ-H8',
      mode: 'hard',
      pillar: 'P3',
      title: 'Scoping limitation: explain why the tool cannot assess one layer and what replaces it.',
      detail: 'A managed service hides its internal layers from customer-side assessment. Identify the correct reason and the correct compensating practice.',
      anchor: 'CS0-003 2.4: scanning limitations in managed environments',
      drill: {
        kind: 'select2',
        selects: [
          { key: 'reason', label: 'Why can\u2019t the tool assess that layer?', options: ['The tool\u2019s license tier does not cover managed databases', 'Databases cannot be scanned at all', 'Engine layer is provider-run, not customer-visible', 'The database is encrypted'], expected: ['Engine layer is provider-run, not customer-visible'] },
          { key: 'compensate', label: 'What replaces direct assessment there?', options: ['Manual port scans from your home office', 'Nothing can be done about managed layers', 'Provider advisories and attestations', 'Weekly reboots of the instance'], expected: ['Provider advisories and attestations'] },
        ],
      },
      feedbackPass:
        'Assessment coverage ends where customer visibility ends. In managed environments you substitute direct scanning with provider attestations, advisories and status feeds — and you record that boundary in the assessment plan.',
      hints: [
        'The tool sees your instance and storage config — but not inside the provider\u2019s engine.',
        'You cannot scan what you cannot see; you verify the party that CAN.',
        'Reason: provider-operated layer not customer-visible. Practice: provider advisories/attestations.',
      ],
    },
    {
      id: 'OBJ-H9',
      mode: 'hard',
      pillar: 'P4',
      title: 'One emergency window, two findings: choose the pair that reduces the most risk.',
      detail: 'The board authorized exactly two changes tonight. Pick the pair with the highest combined risk reduction.',
      anchor: 'Adjunct chapter context: prioritizing remediation from findings reports',
      drill: {
        kind: 'pick2',
        question: 'Which two findings do you remediate tonight?',
        options: [
          { key: 'F-PLT-01', label: 'F-PLT-01 — public PII bucket (critical)' },
          { key: 'F-PLT-02', label: 'F-PLT-02 — no-MFA admin identity (critical)' },
          { key: 'F-APP-03', label: 'F-APP-03 — reflected XSS (medium)' },
          { key: 'F-NOI-01', label: 'F-NOI-01 — staging monitoring (low)' },
          { key: 'F-PLT-06', label: 'F-PLT-06 — IMDSv1 enabled (medium)' },
        ],
        answer: ['F-PLT-01', 'F-PLT-02'],
      },
      feedbackPass:
        'The only two Criticals: active data exposure and full-control identity. Both are one-step fixes with disproportionate risk reduction. Mediums and lows wait — triage is a scarce-resource decision.',
      hints: [
        'Severity matters most when the window is tiny.',
        'There are exactly two Critical findings in the report.',
        'F-PLT-01 and F-PLT-02.',
      ],
    },
  ];

  SKY.OBJECTIVES_BY_ID = SKY.OBJECTIVES.reduce(function (acc, o) { acc[o.id] = o; return acc; }, {});
  SKY.MEDIUM_OBJECTIVES = SKY.OBJECTIVES.filter(function (o) { return o.mode === 'medium'; });
  SKY.HARD_OBJECTIVES = SKY.OBJECTIVES.filter(function (o) { return o.mode === 'hard'; });

  // ─── Quiz ──────────────────────────────────────────────────────────────────

  SKY.QUIZ = [
    // Medium — 6 concept items
    {
      id: 'Q-M1',
      mode: 'medium',
      question: 'A cloud platform assessment tool differs from a classic on-prem scanner because it analyzes:',
      options: [
        'Cloud apps, but not the platform they run on',
        'The platform config, but not the hosted apps',
        'Both the hosted apps and the platform config',
        'Only what runs inside the corporate datacenter',
      ],
      correct: [2],
      explanation:
        'The lesson\u2019s core definition: the tool works BOTH layers — what you host (apps, instances) and the platform configuration beneath it. Options that cover only one layer miss half the risk; the datacenter-only option describes the pre-cloud scanner scope.',
    },
    {
      id: 'Q-M2',
      mode: 'medium',
      question: 'Which of these is a PLATFORM misconfiguration rather than an application vulnerability?',
      options: [
        'Reflected XSS in a search parameter',
        'A storage bucket readable by anyone',
        'An outdated libcurl version on a VM',
        'SQL injection in a login form',
      ],
      correct: [1],
      explanation:
        'The bucket is a platform setting (policy/blocks), fixed by reconfiguration. XSS, the old libcurl and SQLi are flaws in code or packages — the app/instance layer, fixed by coding or patching.',
    },
    {
      id: 'Q-M3',
      mode: 'medium',
      question: 'In the shared responsibility model for IaaS, patching the GUEST OS of your virtual machine is:',
      options: [
        'The provider\u2019s responsibility',
        'Nobody\u2019s — it happens automatically by definition',
        'Only required after an incident',
        'The customer\u2019s responsibility',
      ],
      correct: [3],
      explanation:
        'The provider secures the cloud itself (hypervisor, physical plant); the customer secures what they place in it — including the guest OS, exactly as F-APP-02 showed. "Automatic" and "only after an incident" are the myths that leave drift unpatched.',
    },
    {
      id: 'Q-M4',
      mode: 'medium',
      question: 'A report lists a Critical finding: "bucket allows public read of PII exports." The MOST practical first remediation is:',
      options: [
        'Restrict access, then scrub and rotate data',
        'Rename the bucket so outsiders cannot find it',
        'Delete the findings report from the console',
        'Escalate it to the quarterly risk review',
      ],
      correct: [0],
      explanation:
        'Contain the exposure first, then treat already-exposed data as potentially collected (scrub/rotate/notify) — the recommendation text a good report gives you. Renaming is obscurity (the policy still grants access), deleting the report hides risk, and a Critical public-PII exposure cannot wait for a quarterly cycle.',
    },
    {
      id: 'Q-M5',
      mode: 'medium',
      question: 'Why do posture-management tools CONTINUOUSLY re-check platform configuration?',
      options: [
        'To slow attackers down with extra network traffic',
        'Because CVE severity scores are recalculated every hour',
        'Because configuration drift can happen at any moment',
        'To replace the need for backups and recovery plans',
      ],
      correct: [2],
      explanation:
        'Cloud estates change fast: today\u2019s clean bucket policy is tomorrow\u2019s incident — continuous checks catch drift the moment it appears. Traffic noise deters nobody, scores are not recalculated hourly, and backups remain a separate, required control.',
    },
    {
      id: 'Q-M6',
      mode: 'medium',
      question: 'A finding says: "managed database engine has a CVE the tool cannot remediate." The correct reading is:',
      options: [
        'The tool failed — reinstall it and re-scan',
        'Engine is provider-owned; track the advisory',
        'Re-image the managed instance from the console',
        'It is automatically a false positive; ignore it',
      ],
      correct: [1],
      explanation:
        'A deliberate scanning limitation, not a tool failure: the layer is provider-operated and not customer-visible. Your loop is track the advisory → confirm the upgrade plan → verify. Re-imaging a managed engine is impossible, and a real CVE is not a false positive.',
    },
    // Hard — 7 scenario items
    {
      id: 'Q-H1',
      mode: 'hard',
      scenario: 'Report line: "vm-web-prod-01: libcurl CVE-2023-38545, CVSS 8.8, instance is internet-facing." Agent confirms the version is inside the affected range.',
      question: 'Best next action?',
      options: [
        'Suppress the server version banner and re-scan',
        'Accept the risk for the next 12 months',
        'Patch libcurl to a fixed version and restart',
        'Rebuild the VM from the same unpatched image',
      ],
      correct: [2],
      explanation:
        'Confirmed vulnerable library on a public-facing box: update the software (M1051 in ATT&CK terms) and restart the dependent service. Hiding the banner is obscurity, a 12-month acceptance is indefensible on an internet-facing high, and cloning the same image spreads the flaw.',
    },
    {
      id: 'Q-H2',
      mode: 'hard',
      scenario: 'Report line: "sg-database allows 0.0.0.0/0 on 3306/tcp, attached to the managed database."',
      question: 'Which remediation sequence is correct?',
      options: [
        'Restrict to VPC/bastion, verify the app path, monitor',
        'Open every port so connectivity is guaranteed',
        'Delete the database instance and restore it from backup',
        'Leave it open — databases are exposed by design anyway',
      ],
      correct: [0],
      explanation:
        'Restrict → verify → monitor: cut the exposure, confirm the legitimate path still works, watch the rule for drift. Opening every port inverts the fix, deletion is disproportionate, and "exposed by design" confuses the web tier\u2019s 443 with a database port.',
    },
    {
      id: 'Q-H3',
      mode: 'hard',
      scenario: 'A High finding claims the backups bucket is publicly readable. The Inspector shows public_read=false and public_access_block=ON.',
      question: 'What is the correct disposition?',
      options: [
        'Critical — restrict the bucket immediately',
        'Duplicate of the exports finding — merge them',
        'Provider responsibility — escalate to the vendor',
        'False positive — dispute with the raw config',
      ],
      correct: [3],
      explanation:
        'The evidence contradicts the claim: public_read=false and the access block is ON. Triage includes disputing findings with evidence — that is how reports become trustworthy. It is not critical, not a duplicate (different bucket), and the bucket is customer-side, not provider-side.',
    },
    {
      id: 'Q-H4',
      mode: 'hard',
      scenario: 'The assessment platform flags a CVE inside the managed PostgreSQL ENGINE and shows no customer remediation path.',
      question: 'Why can\u2019t the tool offer a fix, and what is your move?',
      options: [
        'The tool lacks permissions; run it as root next time',
        'The layer is provider-operated; track the advisory',
        'Patch the engine during the next maintenance window',
        'Managed services cannot have CVEs; dispute the line',
      ],
      correct: [1],
      explanation:
        'Managed layers are outside customer reach — a deliberate scanning limitation. Running the scanner as root changes nothing, and the maintenance window belongs to the provider. Your loop: advisory → upgrade plan → verification. Managed services absolutely can have CVEs; you simply cannot patch that layer.',
    },
    {
      id: 'Q-H5',
      mode: 'hard',
      scenario: 'You must map the disabled organization audit trail to ATT&CK for the incident report.',
      question: 'Which mapping is correct?',
      options: [
        'Disabled org trail → T1530',
        'Disabled org trail → T1078.004',
        'Disabled org trail → T1562.008',
        'Disabled org trail → T1190',
      ],
      correct: [2],
      explanation:
        'Disabling the org trail impairs defensive capability — T1562.008, Impair Defenses: Disable Cloud Logs (full names in the Debrief table). T1530 collects data from cloud storage, T1078.004 abuses cloud accounts, T1190 exploits a public-facing app. Match what the misconfig lets an attacker DO.',
    },
    {
      id: 'Q-H6',
      mode: 'hard',
      scenario: 'Emergency window tonight — the report shows: F-PLT-01 public PII bucket (critical), F-PLT-02 no-MFA admin (critical), F-APP-03 reflected XSS (medium), F-NOI-01 staging monitoring (low).',
      question: 'Which TWO do you fix tonight?',
      options: [
        'F-PLT-01 and F-PLT-02',
        'F-APP-03 and F-NOI-01',
        'F-PLT-01 and F-NOI-01',
        'F-PLT-02 and F-APP-03',
      ],
      correct: [0],
      explanation:
        'Both Criticals: active data exposure and a full-control identity. Triage under scarcity means severity × impact first — mediums and lows queue behind them.',
    },
    {
      id: 'Q-H7',
      mode: 'hard',
      scenario: 'Your manager asks why the assessment report alone is not enough to act on.',
      question: 'The strongest justification for triangulating tool output is:',
      options: [
        'Reports are written in difficult language',
        'Provider terms of service require a second tool',
        'A second tool doubles findings, which auditors like',
        'Tools err — verify findings against raw evidence',
      ],
      correct: [3],
      explanation:
        'This lab planted a misread bucket rule and an advisory-without-version-check rule — both look real in the report and both die under evidence review (raw config, installed-vs-fixed versions). Verification is the analyst\u2019s value-add; no ToS mandates a second tool and more findings is not better.',
    },
  ];

  SKY.QUIZ_BY_MODE = function (mode) {
    return SKY.QUIZ.filter(function (q) { return q.mode === mode; });
  };

  // ─── Scan script (derived from estate data so it can never drift) ──────────

  var FINDINGS_PER_DOMAIN = SKY.RESOURCES.reduce(function (acc, r) {
    acc[r.domain] = (acc[r.domain] || 0) + r.findingIds.length;
    return acc;
  }, {});
  SKY.FINDINGS_PER_DOMAIN = FINDINGS_PER_DOMAIN;

  SKY.SCAN_SCRIPT = [
    { domain: 'identity', line: 'scope: account nimbus-prod (' + SKY.ORG + ', synthetic) — 6 domains' },
    { domain: 'identity', line: 'identity: 3 identities · 14 policy bindings … ' + FINDINGS_PER_DOMAIN['identity'] + ' finding' + (FINDINGS_PER_DOMAIN['identity'] === 1 ? '' : 's') },
    { domain: 'compute', line: 'compute: 3 instances · agent inventory (2 hosts) … ' + FINDINGS_PER_DOMAIN['compute'] + ' findings' },
    { domain: 'storage', line: 'storage: 2 buckets · 1 snapshot · policy deep-read … ' + FINDINGS_PER_DOMAIN['storage'] + ' findings' },
    { domain: 'network', line: 'network: 3 security groups · ingress analysis … ' + FINDINGS_PER_DOMAIN['network'] + ' findings' },
    { domain: 'observability', line: 'observability: 1 audit trail · health check … ' + FINDINGS_PER_DOMAIN['observability'] + ' finding' + (FINDINGS_PER_DOMAIN['observability'] === 1 ? '' : 's') },
    { domain: 'application', line: 'application: DAST probe (1 app) · edge config … ' + FINDINGS_PER_DOMAIN['application'] + ' findings' },
    { domain: 'application', line: 'compiling detailed findings report (' + SKY.FINDINGS.length + ' lines) — recommendations attached' },
  ];

  // ─── Debrief content ───────────────────────────────────────────────────────

  SKY.DETECTION_OPPS = [
    {
      source: 'Config checks (CSPM rules)',
      logic: 'alert when bucket_policy grants ALL_USERS read, or public_access_block=OFF on a data-classified bucket',
      covers: 'F-PLT-01, F-FP-01 verification',
    },
    {
      source: 'Config checks (IAM rules)',
      logic: 'alert when identity has mfa=DISABLED AND privileged policy attached, or access_key_age > 90 days',
      covers: 'F-PLT-02',
    },
    {
      source: 'Config checks (network rules)',
      logic: 'alert when security group exposes management/data ports (22, 3306, 3389, 5432…) from 0.0.0.0/0',
      covers: 'F-PLT-03 vs expected F-NOI-03',
    },
    {
      source: 'Audit trail health',
      logic: 'alert when org trail is stopped/disabled, or when logging itself is modified (guard the guardrail)',
      covers: 'F-PLT-04 — ATT&CK T1562.008',
    },
    {
      source: 'Agent scans + DAST',
      logic: 'daily inventory diff: vulnerable package versions, EOL OS, reflected-input probes on public endpoints',
      covers: 'F-APP-01…04, F-FP-02 version check',
    },
    {
      source: 'Provider advisories / status',
      logic: 'subscribe and reconcile provider-managed-layer CVEs against your asset inventory',
      covers: 'F-PRV-01, F-PRV-02',
    },
  ];

  SKY.MITIGATION_RECS = [
    { control: 'Enable storage Public Access Blocks; private-by-default bucket policy', fixes: 'F-PLT-01', mitre: 'M1041 / M1047 (against T1530)' },
    { control: 'Enforce MFA on all identities; least-privilege policies; rotate stale keys', fixes: 'F-PLT-02', mitre: 'M1036 / M1027 / M1018 (against T1078.004)' },
    { control: 'Network segmentation: restrict data/management ports to known CIDRs', fixes: 'F-PLT-03', mitre: 'M1030 / M1035 (against T1133)' },
    { control: 'Immutable, always-on org audit trail with tamper alerting', fixes: 'F-PLT-04', mitre: 'M1047 (against T1562.008)' },
    { control: 'Encrypt at rest (snapshot-copy migration); enforce IMDSv2', fixes: 'F-PLT-05, F-PLT-06', mitre: 'M1041 / M1047 (against T1552.005)' },
    { control: 'Patch baseline automation for guest OS and libraries; TLS 1.2+ policy', fixes: 'F-APP-01, F-APP-02, F-APP-04', mitre: 'M1051 (against T1190)' },
    { control: 'Contain-then-correct ordering; rotate credentials found in exposed artifacts', fixes: 'F-PLT-01, F-PLT-07', mitre: 'M1047 (against T1552)' },
  ];

  SKY.BLUE_TAKEAWAYS = [
    'Assess BOTH layers: what runs in the cloud (apps/instances) and how the platform is configured. Most cloud breaches are misconfigurations, not exotic zero-days.',
    'Triage with severity × exposure × data sensitivity — a 9.1 on a public PII bucket is tonight\u2019s problem; a low on staging is not.',
    'Verify before you act: compare installed versions against fixed versions and read the raw resource config. Two of eighteen findings here were false.',
    'Contain first, correct second: restrict the exposure, THEN scrub/rotate what was exposed.',
    'Know the shared-responsibility boundary; for managed layers, track provider advisories and attestations — that IS your remediation path.',
    'Re-assess after changes: a fix is not a fix until a re-scan verifies it and the posture score moves.',
  ];

  SKY.RED_TAKEAWAYS = [
    'Misconfigurations are pre-positioned infrastructure: a public bucket is storage you can use; a disabled trail is darkness you can work in. (Defensive framing: know the doors to close them.)',
    'Attackers chain small findings — a public export list plus a public snapshot became a data incident in this scenario. Think in chains, not single findings.',
    'Public-facing assets are enumerated constantly; assume scanners (human and automated) already know what your posture tools know.',
    'Impairing the audit trail (T1562.008) multiplies the value of every other cloud technique — guard the guardrails first.',
  ];

  // ─── Mode select cards (presentational content from mode-select.tsx) ───────

  SKY.MODES = [
    {
      mode: 'medium',
      icon: 'book-open',
      title: 'GUIDED ANALYSIS TRACK',
      tagline: 'Medium — learn the tool by operating it, step by step',
      accent: 'sk-accent-emerald',
      ring: 'sk-mode-ring-emerald',
      bullets: [
        { good: '12 guided objectives, introduced one at a time', bad: '' },
        { good: '3-tier hints on every objective (costs stars, never blocks)', bad: '' },
        { good: 'Tolerant checking — synonyms accepted, teaching feedback on every miss', bad: '' },
        { good: 'Concept quiz (6 items) with explanations', bad: '' },
      ],
      time: '≈ 45–60 min',
    },
    {
      mode: 'hard',
      icon: 'flame',
      title: 'INCIDENT PRESSURE TRACK',
      tagline: 'Hard — the report is noisy, the checks are strict',
      accent: 'sk-accent-amber',
      ring: 'sk-mode-ring-amber',
      bullets: [
        { good: '9 broad multi-step challenges across the whole estate', bad: '' },
        { good: 'Noisy report with planted false positives — evidence verification required', bad: '' },
        { good: 'Strict validation: exact IDs, exact sequences, near-misses rejected with rationale', bad: '' },
        { good: 'One optional paid nudge per objective; scenario quiz (7 items)', bad: '' },
      ],
      time: '≈ 60–90 min',
    },
  ];

  // ─── C1 — Scenario Briefing (HTML port of ScenarioBriefing.tsx) ────────────

  SKY.BRIEFING_HTML = [
    '<p><strong class="t-strong">' + SKY.ORG + '</strong>, a mid-size online retailer, moved its storefront and nightly reporting to a public cloud platform last year. Adoption was fast. Security tooling was not: the estate is configured by three different engineers and has never been formally assessed.</p>',
    '<p>This morning the CISO unboxed <strong class="t-strong t-mono t-emerald">SKYSCAN</strong> — a cloud platform assessment tool that scans <em>applications hosted in the cloud</em> and the <em>configuration of the platform they run on</em>, detects vulnerabilities in applications and instances, identifies platform misconfigurations, and produces detailed findings reports with practical remediation recommendations. You are the analyst on day one of the rollout.</p>',
    '<p>A peer retailer made the news last week for leaking customer records through a misconfigured storage bucket. The board wants NimbusStack\u2019s posture verified <strong class="t-strong">today</strong>. Run the assessment, read the evidence, prioritize what matters, remediate it, and prove the fix with a re-scan. That is Lesson 12.2 of CySA+ CS0-003 (Domain 2 — Vulnerability Management) performed live, not memorized.</p>',
  ].join('');

  // ─── C2 — Knowledge Core (HTML port of knowledge.tsx CORE) ─────────────────

  SKY.CORE = [
    {
      id: 'why',
      title: 'Why cloud assessment tools exist at all',
      html:
        '<p>As organizations adopted public cloud platforms, the old on-prem scanner model stopped being enough: in the cloud, <strong>configuration is code</strong> and it changes hourly. The popularity and use of cloud platform assessment tools grew in lockstep with public cloud adoption precisely because the platform itself — not just the apps on it — can be misconfigured in ways that leak data.</p>' +
        '<p>These tools continuously compare your estate against secure baselines and policy rules, so a one-time scan becomes a living posture picture (drift detection). The &quot;posture score&quot; in the console header is that picture compressed to a number.</p>',
    },
    {
      id: 'layers',
      title: 'The two assessment layers',
      html:
        '<p><strong class="t-emerald">Layer 1 — applications and instances:</strong> what you host. Agent-based scans inventory OS packages and versions on instances (missing patches, vulnerable libraries like an outdated libcurl); DAST modules probe the running application itself (e.g., reflected XSS in a query parameter).</p>' +
        '<p><strong class="t-amber">Layer 2 — platform configuration:</strong> how the cloud is set up. Config checks compare bucket policies, IAM identities, security groups, encryption settings and audit-trail health against secure baselines. Most catastrophic cloud incidents live here — a perfect application in front of a publicly readable bucket is still a breach.</p>',
    },
    {
      id: 'findings',
      title: 'What they find — and how reports read',
      html:
        '<p>A finding is a claim produced by a data source (config check, agent scan, DAST, provider advisory). Each report line carries: an ID, the affected resource, a severity, a score (simplified CVSS-style in this lab), the evidence observed, and — critically — a <strong>practical remediation recommendation</strong>.</p>' +
        '<p>Two analyst habits separate professionals from button-pushers: <strong>triage in context</strong> (severity × public exposure × data sensitivity — an open port 443 on a web tier is expected; open 3306 is an incident) and <strong>verify before acting</strong> (compare installed versions against fixed versions; read raw resource config — tools produce false positives and cannot see inside provider-managed layers).</p>',
    },
    {
      id: 'resp',
      title: 'Shared responsibility and managed layers',
      html:
        '<p>The provider secures the cloud <em>itself</em> (hypervisor, managed engine internals, edge firmware). You secure what you put in it and how you configure it: guest OS, libraries, bucket policies, security groups, IAM, encryption, logging. When the tool reports a finding inside a provider-managed layer, your remediation path is verification — track the provider advisory, confirm the upgrade plan, re-verify. That boundary is exam objective 2.4 material (&quot;scanning limitations in managed environments&quot;).</p>',
    },
    {
      id: 'mitre',
      title: 'How misconfigurations map to the attack chain (MITRE ATT&CK)',
      html:
        '<p>Misconfigurations are pre-positioned attacker infrastructure. The techniques this lab\u2019s findings enable (defensive mapping):</p>' +
        '<ul class="sk-technique-list">' +
        SKY.TECHNIQUES.map(function (t) {
          return '<li class="sk-technique-item"><a href="' + t.link + '" target="_blank" rel="noopener noreferrer" class="sk-link-emerald">' + t.id + '</a> — ' + t.name + '</li>';
        }).join('') +
        '</ul>',
    },
  ];

  // ─── Completion modal constants (from completion.tsx) ──────────────────────

  SKY.PILLAR_LABEL = {
    P1: 'Understand — what it is, why attackers want it',
    P2: 'Recognize — spot it in realistic evidence',
    P3: 'Detect — read reports, verify, prioritize',
    P4: 'Mitigate — remediate, verify, own the residual risk',
  };

  SKY.FOCUS_TOPIC = {
    'OBJ-M1': 'the two assessment layers (app/instance vs platform config)',
    'OBJ-M2': 'classifying findings by assessment layer',
    'OBJ-M3': 'spotting public-storage exposure in the estate',
    'OBJ-M4': 'identity misconfigurations (MFA / over-privilege)',
    'OBJ-M5': 'network exposure (security-group ingress)',
    'OBJ-M6': 'instance-layer vulnerability detection (agent / DAST)',
    'OBJ-M7': 'reading report severity and scores',
    'OBJ-M8': 'mapping misconfigurations to MITRE ATT&CK',
    'OBJ-M9': 'applying report remediation recommendations',
    'OBJ-M10': 'the shared responsibility boundary',
    'OBJ-M11': 'prioritizing by severity × exposure × data sensitivity',
    'OBJ-M12': 'verifying remediation with a re-assessment',
    'OBJ-H1': 'triaging genuine Critical/High findings out of a noisy report',
    'OBJ-H2': 'exact ATT&CK technique mapping (sub-technique suffixes)',
    'OBJ-H3': 'chaining misconfigurations into an incident narrative',
    'OBJ-H4': 'ordered, complete remediation (contain → correct)',
    'OBJ-H5': 'residual risk owned by the provider',
    'OBJ-H6': 'disproving false positives with raw evidence',
    'OBJ-H7': 'defensible executive risk statements',
    'OBJ-H8': 'scanning limitations of managed environments',
    'OBJ-H9': 'prioritization under a one-window constraint',
  };

  SKY.QUIZ_TOPIC = {
    'Q-M1': 'the two-layer scope of cloud assessment tools',
    'Q-M2': 'platform misconfiguration vs application vulnerability',
    'Q-M3': 'shared responsibility for the guest OS',
    'Q-M4': 'contain-then-correct remediation ordering',
    'Q-M5': 'why posture tools re-check continuously (drift)',
    'Q-M6': 'managed-engine findings and provider tracking',
    'Q-H1': 'remediating a confirmed vulnerable library',
    'Q-H2': 'sequencing network-exposure remediation',
    'Q-H3': 'dispositioning false positives with evidence',
    'Q-H4': 'managed-layer scanning limitations',
    'Q-H5': 'ATT&CK mapping of impaired defenses',
    'Q-H6': 'prioritizing two fixes under scarcity',
    'Q-H7': 'triangulating tool output with evidence',
  };
})(window.SKY);
