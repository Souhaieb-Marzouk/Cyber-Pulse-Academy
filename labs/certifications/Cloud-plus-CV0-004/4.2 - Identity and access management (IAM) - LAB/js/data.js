// ============================================================================
// Synthetic training data — Cloud+ CV0-004 Lesson 4.2 IAM lab.
// ALL ORGANIZATIONS, IDENTITIES, IPS AND EVENTS ARE FICTIONAL TRAINING DATA.
// 1:1 content port of src/lib/lab/data.ts — text, answers and hints are
// byte-identical to the original lab. Data only; logic lives in engine.js.
// ============================================================================
'use strict';

window.LAB_DATA = (function () {

  const GLOSSARY = [
    { term: 'IAM', def: 'Identity and access management — the framework of policies and technologies that ensures the right identities get the right access to the right resources at the right time.' },
    { term: 'Identification', def: 'Claiming an identity (e.g., a username). Who you say you are — not yet proven.' },
    { term: 'Authentication', def: 'Proving the claimed identity using factors such as passwords, tokens or biometrics.' },
    { term: 'Authorization', def: 'Deciding what an authenticated identity may do, via permissions and policies.' },
    { term: 'Accounting (auditing)', def: 'Recording who did what, when and from where, so activity can be reviewed, alerted on and audited for compliance.' },
    { term: 'MFA', def: 'Multi-factor authentication — requiring two or more DIFFERENT factor categories: something you know, have, or are.' },
    { term: 'Federation & SSO', def: 'Trusting an external identity provider so users sign in once and reach many systems (single sign-on).' },
    { term: 'Identity provider (IdP)', def: 'The service that authenticates users and issues assertions or tokens to relying systems (service providers).' },
    { term: 'SAML', def: 'XML-based federation standard for exchanging authentication/authorization assertions — the classic enterprise SSO protocol.' },
    { term: 'OAuth 2.0 / OpenID Connect', def: 'OAuth 2.0 delegates authorization via scoped tokens; OpenID Connect adds an authentication identity layer on top of OAuth 2.0.' },
    { term: 'RBAC / GBAC / DAC', def: 'Access granted by assigned role (RBAC), group membership (GBAC), or resource-owner discretion (DAC).' },
    { term: 'Least privilege', def: 'Granting only the permissions an identity needs to do its job — nothing more.' },
    { term: 'Service account & API key', def: 'A non-human identity used by applications, with programmatic credentials that must be scoped, rotated and vaulted.' },
    { term: 'Conditional access', def: 'Rules that evaluate signals (group, IP range, MFA state, protocol) before access is granted.' },
    { term: 'Explicit vs implicit deny', def: 'An explicit Deny statement always wins; when no Allow matches a request, access is denied by default (implicit deny).' },
  ];

  const ORG = {
    company: 'Larkspur Retail Group',
    cloud: 'StratusForge Cloud',
    cidr: '10.0.0.0/16',
    consoleDomain: 'console.stratusforge.example',
  };

  const IDENTITIES = [
    { id: 'alex.kim', name: 'Alex Kim', type: 'user', groups: ['Admins'], dept: 'Platform', lastSignIn: '2026-11-05 09:00', note: 'Primary cloud administrator.' },
    { id: 'priya.nair', name: 'Priya Nair', type: 'user', groups: ['DevOps'], dept: 'Engineering', lastSignIn: '2026-11-05 12:12', note: 'Infrastructure & CI/CD engineer; assumes role-devops.' },
    { id: 'dana.wells', name: 'Dana Wells', type: 'user', groups: ['Finance'], dept: 'Finance', lastSignIn: '2026-11-04 09:15', hrFlag: 'departed', note: 'HR flag: employment ended 2026-10-31. Assumes role-finops.' },
    { id: 'carlos.mendes', name: 'Carlos Mendes', type: 'user', groups: ['Contractors'], dept: 'Vendor: Novacore', lastSignIn: '2026-11-05 08:40', hrFlag: 'external', note: 'Contractor for a 2-week engagement in July; still assumes role-platform-admin 4 months later.' },
    { id: 'minnie.alvarez', name: 'Minnie Alvarez', type: 'user', groups: ['QA'], dept: 'Quality', lastSignIn: '2026-04-05', note: 'No sign-in for 214 days; key never rotated. Assumes role-qa.' },
    { id: 'svc-reporting', name: 'Reporting jobs', type: 'service', groups: [], dept: 'Analytics', lastSignIn: '2026-11-05 05:00', note: 'Runs nightly reports from 10.0.8.5. Its static key was committed to a public code repository on 2026-10-30.' },
    { id: 'svc-nightly-ci', name: 'Nightly CI', type: 'service', groups: [], dept: 'Engineering', lastSignIn: '2026-11-04 03:10', note: 'Deployment pipeline identity; jobs at 03:10 are scheduled and expected.' },
    { id: 'svc-test', name: 'Scanner probe', type: 'service', groups: [], dept: 'Security', lastSignIn: '2026-11-05 10:05', note: 'Corporate vulnerability-scanner identity; its failed sign-in attempts from 10.0.14.9 are expected noise.' },
  ];

  const ROLES = [
    { id: 'role-platform-admin', name: 'Platform Admin', desc: 'Full administrative access. Held by alex.kim and (problematically) contractor carlos.mendes.' },
    { id: 'role-devops', name: 'DevOps', desc: 'Engineering automation. Held by priya.nair.' },
    { id: 'role-finops', name: 'Finance Ops', desc: 'Payroll & analytics reads. Held by dana.wells.' },
    { id: 'role-qa', name: 'QA', desc: 'Analytics read-only. Held by minnie.alvarez.' },
  ];

  const SIM_PRINCIPALS = ['role-platform-admin', 'role-devops', 'role-finops', 'role-qa', 'svc-reporting', 'svc-nightly-ci'];

  const ACTIONS = ['store:object:Get', 'store:object:List', 'store:object:Put', 'store:object:Delete', 'vault:secret:Read', 'iam:policy:Attach', 'iam:user:Disable'];

  const RESOURCES = [
    'payroll-export/summary.csv',
    'customer-analytics/events.json',
    'dev-sandbox/build.log',
    'dev-ml-experiments/model.pkl',
    'prod-orders-db/dump.sql',
    'vault/prod-db-credentials',
    'iam/pol-iam-full-access',
  ];

  const IP_CORP = '10.0.4.12 (corporate HQ)';
  const IP_UNKNOWN = '198.51.100.23 (unrecognized geo)';
  const IP_CONTRACTOR = '203.0.113.44 (vendor office)';
  const SIM_IPS = [IP_CORP, IP_UNKNOWN, IP_CONTRACTOR];

  const P = (o) => JSON.stringify(o, null, 2);

  const POLICIES = [
    {
      id: 'pol-admin-full', name: 'platform-admin-full', editable: false,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'AdminFullAccess', Effect: 'Allow', Action: ['*'], Resource: ['*'] }] }),
      attachedTo: ['role-platform-admin'], desc: 'Full administrative wildcard. Intended ONLY for the platform admin role.',
    },
    {
      id: 'pol-devops-wildcard', name: 'devops-wide', editable: true,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'DevOpsWide', Effect: 'Allow', Action: ['store:*'], Resource: ['*'] }] }),
      attachedTo: ['role-devops'], desc: 'AUDIT FINDING #2: store:* on * lets DevOps read payroll and delete anything. Repair with least privilege.',
    },
    {
      id: 'pol-finance-ro', name: 'finance-read', editable: false,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'FinanceRead', Effect: 'Allow', Action: ['store:object:Get'], Resource: ['payroll-export/*', 'customer-analytics/*'] }] }),
      attachedTo: ['role-finops'], desc: 'Legitimate Finance read access.',
    },
    {
      id: 'pol-payroll-guard', name: 'payroll-guard', editable: false,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'PayrollGuard', Effect: 'Deny', Action: ['store:object:Get'], Resource: ['payroll-export/*'] }] }),
      attachedTo: ['role-finops'], desc: 'Temporary guardrail DENYING payroll reads while identity hardening is in progress. Deny beats Allow.',
    },
    {
      id: 'pol-qa-ro', name: 'qa-read', editable: false,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'QARead', Effect: 'Allow', Action: ['store:object:Get'], Resource: ['customer-analytics/*'] }] }),
      attachedTo: ['role-qa'], desc: 'QA read-only on analytics.',
    },
    {
      id: 'pol-iam-full-access', name: 'iam-full-access', editable: false,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'IAMFull', Effect: 'Allow', Action: ['iam:*'], Resource: ['*'] }] }),
      attachedTo: ['svc-reporting'], desc: 'Full IAM control. Audit trail shows svc-reporting attached this to ITSELF on Nov 4 — privilege escalation.',
    },
    {
      id: 'pol-ml-experiment', name: 'ml-experiment', editable: false,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'MLDev', Effect: 'Allow', Action: ['store:object:Get', 'store:object:Put'], Resource: ['dev-ml-experiments/*'] }] }),
      attachedTo: [], desc: 'Unused ML sandbox policy.',
    },
    {
      id: 'pol-legacy-reporting', name: 'legacy-reporting-broad', editable: false, hardOnly: true,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'ReportReadAll', Effect: 'Allow', Action: ['store:object:Get'], Resource: ['*'] }] }),
      attachedTo: ['svc-reporting'], desc: 'AUDIT FINDING (hard mode): service key can read EVERY bucket. Should be scoped to its data sets.',
    },
    {
      id: 'pol-ci-export', name: 'nightly-ci-export', editable: false, hardOnly: true,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'CIExport', Effect: 'Allow', Action: ['store:object:Put'], Resource: ['prod-orders-db/*'] }] }),
      attachedTo: ['svc-nightly-ci'], desc: 'Scheduled export writes for the nightly pipeline.',
    },
    {
      id: 'pol-finops-guarded', name: 'finops-guarded (NEW)', editable: true, hardOnly: true,
      json: P({ Version: '2026-11-01', Statement: [{ Sid: 'EditMe', Effect: 'Allow', Action: [], Resource: [] }] }),
      attachedTo: [], desc: 'You author this one: condition-gated payroll read + explicit deny for writes.',
    },
  ];

  const KEY_SEEDS = [
    { id: 'key-alex-1', owner: 'alex.kim', created: '2024-04-12', lastRotated: '2026-08-02', initial: 'active' },
    { id: 'key-carlos-1', owner: 'carlos.mendes', created: '2026-07-14', lastRotated: '2026-07-14', initial: 'active' },
    { id: 'key-dana-1', owner: 'dana.wells', created: '2022-09-19', lastRotated: '2025-03-04', initial: 'active' },
    { id: 'key-minnie-1', owner: 'minnie.alvarez', created: '2024-06-03', lastRotated: 'never', initial: 'active' },
    { id: 'key-svc-reporting-1', owner: 'svc-reporting', created: '2025-01-10', lastRotated: '2025-01-10', initial: 'active', leaked: true },
    { id: 'key-svc-ci-1', owner: 'svc-nightly-ci', created: '2025-05-20', lastRotated: '2026-06-15', initial: 'active' },
  ];

  const EVENTS = [
    { id: 'ev01', ts: '2026-11-03 08:55', actor: 'alex.kim', kind: 'signin', action: 'console:SignIn', resource: '-', ip: '10.0.4.12', geo: 'Larkspur HQ', agent: 'Chrome/141 macOS', noise: true, mfa: true },
    { id: 'ev02', ts: '2026-11-03 09:02', actor: 'priya.nair', kind: 'signin', action: 'console:SignIn', resource: '-', ip: '10.0.4.31', geo: 'Larkspur HQ', agent: 'Chrome/141 Windows', noise: true, mfa: true },
    { id: 'ev03', ts: '2026-11-03 14:20', actor: 'carlos.mendes', kind: 'signin', action: 'console:SignIn', resource: '-', ip: '203.0.113.44', geo: 'Lisbon, PT (vendor)', agent: 'Firefox/140', noise: true, mfa: true, note: 'Contractor sign-in from vendor office — expected for this account.' },
    { id: 'ev04', ts: '2026-11-03 16:00', actor: 'svc-reporting', kind: 'object', action: 'store:object:Get', resource: 'customer-analytics/*', ip: '10.0.8.5', geo: 'DC-east', agent: 'stratus-sdk-py/3.9', noise: true, note: 'Normal scheduled job from its usual address.' },
    { id: 'ev05', ts: '2026-11-04 02:41', actor: 'svc-reporting', kind: 'key', action: 'store:object:List', resource: 'payroll-export/*', ip: '198.51.100.23', geo: 'UNRECOGNIZED (first seen)', agent: 'stratus-sdk-py/3.9', noise: false, note: 'Static API key used from a never-seen network at 02:41. Key was committed to a public repo on Oct 30.' },
    { id: 'ev06', ts: '2026-11-04 02:43', actor: 'svc-reporting', kind: 'policy', action: 'iam:policy:Attach', resource: 'pol-iam-full-access → svc-reporting', ip: '198.51.100.23', geo: 'UNRECOGNIZED (first seen)', agent: 'stratus-sdk-py/3.9', noise: false, note: 'The compromised identity granted ITSELF full IAM control — privilege escalation.' },
    { id: 'ev07', ts: '2026-11-04 02:44', actor: 'svc-reporting', kind: 'object', action: 'store:object:Get', resource: 'payroll-export/summary.csv', ip: '198.51.100.23', geo: 'UNRECOGNIZED (first seen)', agent: 'stratus-sdk-py/3.9', noise: false },
    { id: 'ev08', ts: '2026-11-04 03:10', actor: 'svc-nightly-ci', kind: 'compute', action: 'compute:instance:Start', resource: 'ci-runner-04', ip: '10.0.8.7', geo: 'DC-east', agent: 'stratus-sdk-py/3.9', noise: true, note: 'Scheduled nightly pipeline — expected at 03:10.' },
    { id: 'ev09', ts: '2026-11-04 09:15', actor: 'dana.wells', kind: 'signin', action: 'console:SignIn', resource: '-', ip: '10.0.2.18', geo: 'Larkspur HQ', agent: 'Edge/141 Windows', noise: false, mfa: true, note: 'HR flag says employment ended 2026-10-31 — yet the account signed in.' },
    { id: 'ev10', ts: '2026-11-04 09:16', actor: 'dana.wells', kind: 'secret', action: 'vault:secret:Read', resource: 'vault/prod-db-credentials', ip: '10.0.2.18', geo: 'Larkspur HQ', agent: 'Edge/141 Windows', noise: false },
    { id: 'ev11', ts: '2026-11-04 17:45', actor: 'alex.kim', kind: 'policy', action: 'iam:policy:Update', resource: 'pol-finance-ro', ip: '10.0.4.12', geo: 'Larkspur HQ', agent: 'Chrome/141 macOS', noise: true },
    { id: 'ev12', ts: '2026-11-05 02:07', actor: 'minnie.alvarez', kind: 'signin', action: 'console:SignIn (FAILED ×217)', resource: '-', ip: '45.33.32.156', geo: 'Internet scanner', agent: 'curl/8.9', noise: true, note: 'Failed credential-stuffing noise from the internet — no successful sign-in.' },
    { id: 'ev13', ts: '2026-11-05 08:40', actor: 'carlos.mendes', kind: 'object', action: 'store:object:Get', resource: 'dev-sandbox/build.log', ip: '203.0.113.44', geo: 'Lisbon, PT (vendor)', agent: 'Firefox/140', noise: true },
    { id: 'ev14', ts: '2026-11-05 10:05', actor: 'svc-test', kind: 'signin', action: 'console:SignIn (FAILED ×3)', resource: '-', ip: '10.0.14.9', geo: 'DC-east (vuln scanner)', agent: 'nessus-probe', noise: true, note: 'Corporate vulnerability scanner — expected noise.' },
    { id: 'ev15', ts: '2026-11-05 12:12', actor: 'priya.nair', kind: 'object', action: 'store:object:Get', resource: 'dev-sandbox/*', ip: '10.0.4.31', geo: 'Larkspur HQ', agent: 'Chrome/141 Windows', noise: true },
    // Hard-mode noise pack
    { id: 'ev16', ts: '2026-11-04 02:45', actor: 'svc-reporting', kind: 'object', action: 'store:object:Get', resource: 'customer-analytics/events.json', ip: '198.51.100.23', geo: 'UNRECOGNIZED (first seen)', agent: 'stratus-sdk-py/3.9', noise: false, hardOnly: true },
    { id: 'ev17', ts: '2026-11-04 02:46', actor: 'svc-reporting', kind: 'secret', action: 'vault:secret:Read', resource: 'vault/prod-db-credentials', ip: '198.51.100.23', geo: 'UNRECOGNIZED (first seen)', agent: 'stratus-sdk-py/3.9', noise: false, hardOnly: true },
    { id: 'ev18', ts: '2026-11-04 05:00', actor: 'svc-reporting', kind: 'object', action: 'store:object:Get', resource: 'customer-analytics/*', ip: '10.0.8.5', geo: 'DC-east', agent: 'stratus-sdk-py/3.9', noise: true, hardOnly: true, note: 'Legitimate job resumed from its usual address — baseline, not the attacker.' },
    { id: 'ev19', ts: '2026-11-03 22:15', actor: 'priya.nair', kind: 'object', action: 'store:object:Put', resource: 'dev-sandbox/*', ip: '10.0.4.31', geo: 'Larkspur HQ', agent: 'stratus-cli/2.4', noise: true, hardOnly: true, note: 'Late deploy of build artifacts — normal for release week.' },
    { id: 'ev20', ts: '2026-11-04 12:00', actor: 'carlos.mendes', kind: 'policy', action: 'iam:policy:Attach', resource: 'pol-ml-experiment → role-qa', ip: '203.0.113.44', geo: 'Lisbon, PT (vendor)', agent: 'Firefox/140', noise: true, hardOnly: true, note: 'Untidy, but a sandbox policy — a red herring, not the intrusion.' },
    { id: 'ev21', ts: '2026-11-04 03:11', actor: 'svc-nightly-ci', kind: 'object', action: 'store:object:Put', resource: 'prod-orders-db/exports/*', ip: '10.0.8.7', geo: 'DC-east', agent: 'stratus-sdk-py/3.9', noise: true, hardOnly: true },
    { id: 'ev22', ts: '2026-11-05 14:22', actor: 'alex.kim', kind: 'secret', action: 'vault:secret:Read', resource: 'vault/prod-db-credentials', ip: '10.0.4.12', geo: 'Larkspur HQ', agent: 'Chrome/141 macOS', noise: true, hardOnly: true },
  ];

  const AAA_STAGES = [
    { id: 'identification', name: 'Identification', desc: 'Claim an identity: the request presents a principal (username / key ID).' },
    { id: 'authentication', name: 'Authentication', desc: 'Prove the claim: password, API key, token or MFA code is verified.' },
    { id: 'authorization', name: 'Authorization', desc: 'Decide what the proven identity may do: policies are evaluated → Allow/Deny.' },
    { id: 'accounting', name: 'Accounting', desc: 'Record what happened: who, what, when, from where — the audit trail.' },
  ];

  const FACTOR_ITEMS = [
    { id: 'password', label: 'Password', correct: 'know' },
    { id: 'securityq', label: 'Security questions', correct: 'know' },
    { id: 'totp', label: 'Authenticator app code', correct: 'have' },
    { id: 'hkey', label: 'Hardware security key', correct: 'have' },
    { id: 'fingerprint', label: 'Fingerprint', correct: 'are' },
    { id: 'face', label: 'Facial recognition', correct: 'are' },
  ];

  const AUTHZ_SCENARIOS = [
    { id: 'az1', text: 'Priya is assigned the "DevOps" role; the role carries a bundle of permissions granted centrally.', correct: 'RBAC' },
    { id: 'az2', text: 'Users inherit read access to analytics because they are members of the "QA" group.', correct: 'GBAC' },
    { id: 'az3', text: 'A bucket owner personally sets share permissions on her objects for a teammate.', correct: 'DAC' },
  ];

  const SAML_STEPS = [
    'User opens the StratusForge console (service provider) and is redirected to sign in',
    'Console sends a SAML authentication request to the corporate identity provider',
    'IdP authenticates the user (directory credentials + MFA)',
    'IdP returns a signed SAML assertion asserting who the user is and their group/role attributes',
    'Console validates the assertion signature and audience, then grants a federated console session',
  ];

  const PROTOCOL_MATCH = [
    { id: 'pm1', text: 'Delegates authorization — lets a third-party app act on a user’s resources with scoped tokens.', correct: 'OAuth 2.0' },
    { id: 'pm2', text: 'Authentication layer on top of OAuth 2.0 — issues ID tokens about WHO signed in.', correct: 'OIDC' },
    { id: 'pm3', text: 'XML-assertion federation standard used for enterprise SSO between IdP and cloud console.', correct: 'SAML' },
  ];

  const RISK_CONTROLS = [
    { id: 'rc1', risk: 'A static API key was committed to a public repository.', correct: 'Rotate/revoke keys; vault future secrets', options: ['Enforce password history and length rules', 'Rotate/revoke keys; vault future secrets', 'Add biometric sign-in to the console', 'Increase log retention and alerting'] },
    { id: 'rc2', risk: 'The whole platform team shares one admin login.', correct: 'Individual accounts + privileged access mgmt', options: ['Lengthen the shared password', 'Whitelist the office IP for everyone', 'Individual accounts + privileged access mgmt', 'Disable audit logging for admins'] },
    { id: 'rc3', risk: 'Console sign-in is protected by a password only.', correct: 'Require multi-factor authentication (M1032)', options: ['Rename the console URL', 'Require multi-factor authentication (M1032)', 'Allow sign-in from any network, trust the VPN', 'Grant the group admin rights'] },
    { id: 'rc4', risk: 'A role policy allows store:* on every resource (*).', correct: 'Least privilege: narrow actions and scope', options: ['Duplicate the policy as a backup copy', 'Split the wildcard policy into separate copies', 'Rotate the role access keys quarterly', 'Least privilege: narrow actions and scope'] },
  ];

  const REVIEW_QUEUE = [
    { id: 'dana.wells', why: 'HR flag: employment ended 2026-10-31; still active.' },
    { id: 'minnie.alvarez', why: 'No sign-ins for 214 days; key never rotated.' },
    { id: 'carlos.mendes', why: 'Contractor from a 2-week July engagement still holding platform-admin.' },
    { id: 'alex.kim', why: 'Active administrator; recent activity; MFA enrolled.' },
    { id: 'svc-reporting', why: 'Compromised — but remediation is handled in the containment plan; business need remains.' },
  ];

  const H8_GAPS = [
    { id: 'q1', gap: 'Console sign-ins were protected by passwords only.', correct: 'M1032', options: ['M1036', 'M1032', 'M1017', 'M1027'] },
    { id: 'q2', gap: 'Departed and dormant accounts stayed active for months.', correct: 'M1018', options: ['M1047', 'M1032', 'M1036', 'M1018'] },
    { id: 'q3', gap: 'Nobody was alerted when a policy was attached to a privileged identity.', correct: 'M1047', options: ['M1027', 'M1018', 'M1047', 'M1036'] },
  ];

  // ---------------------------------------------------------------------------
  // Objectives
  // ---------------------------------------------------------------------------
  const OBJECTIVES_MEDIUM = [
    {
      id: 'OBJ-M1', title: 'Order the AAA pipeline', pillar: 'Understand', coverage: 'CI-01', anchor: 'AAA: identification → authentication → authorization → accounting',
      student: 'Arrange the four AAA stages in the order a request experiences them, then say which stage produces the audit-trail record.',
      context: 'Every cloud request walks a pipeline. Cloud+ 4.3 expects you to know each stage and what it contributes.',
      goTo: { concepts: true }, hints: [
        'Think about what happens first: you must CLAIM to be someone before anything else can happen.',
        'The claim is proven, THEN a decision about permissions is made, and only afterwards is the event written down.',
        'Order: Identification → Authentication → Authorization → Accounting. The audit trail is produced by Accounting.',
      ],
    },
    {
      id: 'OBJ-M2', title: 'Classify authentication factors', pillar: 'Understand', coverage: 'CI-02', anchor: 'MFA factors: something you know / have / are',
      student: 'Sort all six credential types into their factor categories in the Concepts deck.',
      context: 'MFA only counts when categories differ — two "know" factors are still single-factor in spirit.',
      goTo: { concepts: true }, hints: [
        'Ask for each: is it memorized (know), physically possessed (have), or a body measurement (are)?',
        'Authenticator apps and hardware keys are things you HAVE — even though they live in your pocket.',
        'Password & security questions = know; TOTP & hardware key = have; fingerprint & face = are.',
      ],
    },
    {
      id: 'OBJ-M3', title: 'Meet the implicit deny', pillar: 'Recognize', coverage: 'CI-09/10', anchor: 'Policy evaluation: no matching Allow → implicit deny',
      student: 'In the Simulator, run role-qa attempting store:object:Put on customer-analytics/events.json and observe the verdict type.',
      context: 'QA has read-only rights. There is no Deny statement involved — see what the engine does when nothing allows an action.',
      goTo: { tab: 'policies', sim: true }, hints: [
        'Pick principal role-qa, action store:object:Put, resource customer-analytics/events.json, then Evaluate.',
        'Read the evaluation trace: which statements matched? Any Allow at all?',
        'Expected: deny-implicit — nothing matched, and cloud IAM denies by default when no Allow matches.',
      ],
    },
    {
      id: 'OBJ-M4', title: 'Explicit deny beats allow', pillar: 'Understand', coverage: 'CI-10', anchor: 'Evaluation order: explicit Deny > Allow',
      student: 'In the Simulator, run role-finops attempting store:object:Get on payroll-export/summary.csv and observe which verdict type wins.',
      context: 'Finance has an Allow for payroll reads, but the temporary payroll-guard Deny is attached to the same role.',
      goTo: { tab: 'policies', sim: true }, hints: [
        'Principal role-finops, action store:object:Get, resource payroll-export/summary.csv.',
        'Two statements match: one Allow (finance-read) and one Deny (payroll-guard). Which one does the engine obey?',
        'Expected: deny-explicit — an explicit Deny always overrides any Allow.',
      ],
    },
    {
      id: 'OBJ-M5', title: 'Repair the wildcard policy', pillar: 'Recognize', coverage: 'CI-11/09', anchor: 'Least privilege; policy anatomy Effect/Action/Resource',
      student: 'Edit the devops-wide policy in the Policies tab so DevOps can only Get and List objects in the dev-sandbox and dev-ml-experiments buckets — nothing else.',
      context: 'Audit finding #2: store:* on * is why DevOps could read payroll. Rewrite it with least privilege, then run CHECK RESULTS.',
      goTo: { tab: 'policies' }, hints: [
        'Replace Action ["store:*"] with only the two Get/List actions; replace Resource ["*"] with the two dev buckets using dev-*/* style patterns.',
        'Keep Effect "Allow" and use patterns like "dev-sandbox/*" and "dev-ml-experiments/*" (a leading dev-* also works).',
        'Expected actions: ["store:object:Get","store:object:List"]; resources limited to the two dev buckets. The checker runs three probe requests automatically.',
      ],
    },
    {
      id: 'OBJ-M6', title: 'Name the authorization models', pillar: 'Recognize', coverage: 'CI-08', anchor: 'RBAC / GBAC / DAC',
      student: 'Match each of the three scenarios in the Concepts deck to its authorization model.',
      context: 'Cloud+ 4.3 names RBAC, group-based and discretionary access — being able to tell them apart is exam core.',
      goTo: { concepts: true }, hints: [
        'Role assigned to a person = RBAC. Membership in a group granting access = GBAC. Owner decides = DAC.',
        'The bucket-owner scenario is the owner’s discretion — that is DAC.',
        'Answers: RBAC, GBAC, DAC in that order.',
      ],
    },
    {
      id: 'OBJ-M7', title: 'Walk the SAML handshake', pillar: 'Recognize', coverage: 'CI-05/06/07', anchor: 'Federation & SSO: SAML flow, OAuth vs OIDC roles',
      student: 'In the Federation tab, put the five SSO steps in order and match the three protocol statements to SAML, OAuth 2.0 and OIDC.',
      context: 'Larkspur is moving console sign-in to federated SSO. You must be able to explain the handshake and pick the right protocol vocabulary.',
      goTo: { tab: 'federation' }, hints: [
        'The user always starts by trying to open the console; the IdP never initiates.',
        'Order: console redirect → SAML request → IdP authenticates → signed assertion returns → console validates & grants session.',
        'Delegated authorization = OAuth 2.0; identity layer on OAuth = OIDC; XML enterprise SSO = SAML.',
      ],
    },
    {
      id: 'OBJ-M8', title: 'Triage the audit trail', pillar: 'Detect', coverage: 'CI-15/12', anchor: 'Accounting: audit logs reveal the leaked-key intrusion',
      student: 'In the Audit Trail, find which identity was compromised and select the FIRST malicious event (by its timestamp).',
      context: 'Something happened on the night of Nov 4. The accounting stage exists precisely so you can catch this.',
      goTo: { tab: 'audit' }, hints: [
        'Look for activity outside an identity’s baseline: service keys normally run from 10.0.8.x, not from a new country.',
        'The first malicious line is the earliest event from 198.51.100.23.',
        'Compromised identity: svc-reporting; first malicious event: 2026-11-04 02:41 (store:object:List on payroll-export).',
      ],
    },
    {
      id: 'OBJ-M9', title: 'Tune the anomaly watchlist', pillar: 'Detect', coverage: 'CI-15', anchor: 'Detection tuning: true positives vs benign noise',
      student: 'Flag EVERY event in the Audit Trail that deserves an IAM alert, and leave benign noise unflagged.',
      context: 'Detection is tuning: alert on the true positives, ignore expected activity like scheduled jobs and scanner noise.',
      goTo: { tab: 'audit' }, hints: [
        'Expected noise: scheduled CI at 03:10, contractor sign-ins from the vendor office, failed internet scanner attempts.',
        'A departed employee signing in IS an alert — HR said she left.',
        'Flag the five: three svc-reporting events from 198.51.100.23 (02:41–02:44) and the two dana.wells events on Nov 4 morning.',
      ],
    },
    {
      id: 'OBJ-M10', title: 'Implement MFA & conditional access', pillar: 'Mitigate', coverage: 'CI-16/02', anchor: 'Mitigations M1032/M1036: MFA + conditional access, verified',
      student: 'In the Gatekeeper tab, enforce MFA for the Admins and Finance groups and block legacy authentication protocols; then prove it by running the test sign-in (alex.kim, unrecognized IP, no MFA, modern protocol) and getting Blocked.',
      context: 'Mitigations only count when they are verified. M1032 (MFA) and M1036 (account use policies) map directly to these switches.',
      goTo: { tab: 'gatekeeper' }, hints: [
        'Two switches: "Require MFA — Admins" and "Require MFA — Finance", plus "Block legacy protocols".',
        'Then use the test panel: user alex.kim (Admins group), IP unrecognized, MFA off, modern protocol → Run test.',
        'The verdict must be Blocked (outside MFA-enforced policy). Check state AND the recorded test.',
      ],
    },
    {
      id: 'OBJ-M11', title: 'Offboard & rotate', pillar: 'Mitigate', coverage: 'CI-13/12', anchor: 'Lifecycle: deprovisioning; key rotation (M1018)',
      student: 'Disable dana.wells and revoke her API key in the Directory and Vault; then rotate the over-aged svc-reporting key.',
      context: 'Deprovisioning failures are the classic lifecycle gap — credentials outlive their owner. Rotation kills the leaked credential.',
      goTo: { tab: 'secrets' }, hints: [
        'dana.wells: Directory → Disable. Her key key-dana-1: Vault → Revoke.',
        'svc-reporting’s key key-svc-reporting-1 is 664 days old — press Rotate (a fresh replacement key is issued).',
        'Three state changes: dana disabled, key-dana-1 revoked, key-svc-reporting-1 rotated (replaced).',
      ],
    },
    {
      id: 'OBJ-M12', title: 'Map risks to controls', pillar: 'Mitigate', coverage: 'CI-17', anchor: 'Risk→control mapping incl. MITRE mitigation IDs',
      student: 'In the Field Notes tab, match each of the four audit risks to its correct control.',
      context: 'Choosing the RIGHT control for the risk is exactly what Cloud+ scenario items test.',
      goTo: { tab: 'notes' }, hints: [
        'Leaked static key → rotation/vaulting. Shared admin login → individual identities + PAM.',
        'Password-only console → MFA. Wildcard policy → least privilege.',
        'One control per risk — the wrong controls are plausible but do not address the root cause.',
      ],
    },
  ];

  const OBJECTIVES_HARD = [
    {
      id: 'OBJ-H1', title: 'Full incident triage', pillar: 'Detect', coverage: 'CI-15/13', anchor: 'Accounting evidence with red herrings',
      student: 'Identify the compromised identity, its first malicious event, and the entry vector — exact values, no pointers.',
      context: 'The noisy trail includes scheduled jobs, scanner failures and untidy contractor activity. Find what actually matters.',
      goTo: { tab: 'audit' }, hints: ['Only one identity acted from a network it had never used before.'],
    },
    {
      id: 'OBJ-H2', title: 'Reconstruct the attack chain', pillar: 'Detect', coverage: 'CI-15/17', anchor: 'Attack chain ↔ MITRE T1528 / T1078 / T1098',
      student: 'Order the four attacker events chronologically, then map the theft, the use, and the escalation to their MITRE ATT&CK technique IDs.',
      context: 'A chain: obtain credential → use it → persist/escalate → reach data. Map each phase to the technique that names it.',
      goTo: { tab: 'audit' }, hints: ['The chain starts at 02:41 with a List from the unrecognized IP; escalation precedes the deeper reads.'],
    },
    {
      id: 'OBJ-H3', title: 'Author the guarded policy', pillar: 'Recognize', coverage: 'CI-09/11/04', anchor: 'Policy authoring with Conditions (IP + MFA), explicit deny, least privilege',
      student: 'Write pol-finops-guarded from scratch: Allow store:object:Get on payroll-export/* ONLY from 10.0.0.0/16 with MFA; Allow store:object:Get on customer-analytics/* unconditioned; explicitly Deny store:object:Put on payroll-export/*; attach it to role-finops and detach BOTH payroll-guard and finance-read. All four checker probes must pass.',
      context: 'Replace the blunt guard with a condition-gated policy — implementing IAM, not just reading about it.',
      goTo: { tab: 'policies' }, hints: ['Two Allow statements (payroll with a Condition block: IpAddress stratus:SourceIp 10.0.0.0/16 + Bool stratus:MFA true; analytics plain) plus one Deny statement for Put. Detach finance-read too — its unconditioned payroll Allow defeats the condition gate.'],
    },
    {
      id: 'OBJ-H4', title: 'Predict the engine', pillar: 'Understand', coverage: 'CI-10/09', anchor: 'Evaluation order under explicit deny / conditions / default deny',
      student: 'Without running them, predict the verdict type for all three probe requests in the Field Notes tab.',
      context: 'You must reason like the policy engine: explicit deny wins; conditions gate Allows; unmatched requests fall to default deny.',
      goTo: { tab: 'notes' }, hints: ['Probe 1 hits the payroll-guard Deny; probe 2 has no matching Allow; probe 3 is a normal dev operation.'],
    },
    {
      id: 'OBJ-H5', title: 'Contain in the right order', pillar: 'Mitigate', coverage: 'CI-12/13', anchor: 'Containment sequencing & trade-offs',
      student: 'Perform containment in the correct sequence: revoke the leaked key, rotate a replacement, detach the escalated admin policy, then verify with a simulator probe that svc-reporting can no longer Put to payroll-export. Justify why revoke precedes rotate.',
      context: 'Order matters: killing the stolen credential comes before restoring service, and persistence is removed before verification.',
      goTo: { tab: 'secrets' }, hints: ['The Vault, the Policies tab (detach chip) and the Simulator all participate; the verifier probe is svc-reporting / store:object:Put / payroll-export.'],
    },
    {
      id: 'OBJ-H6', title: 'Harden & prove sign-in', pillar: 'Mitigate', coverage: 'CI-16/03', anchor: 'Conditional access design + verification tests',
      student: 'Configure the Gatekeeper for maximum interactive hardening (MFA for ALL groups, legacy protocols blocked, sign-in restricted to corporate range) and record BOTH verification tests: alex from corporate IP with MFA must be Allowed; alex from the unrecognized IP must be Blocked.',
      context: 'Zero trust: verify every request regardless of origin — and prove the control works.',
      goTo: { tab: 'gatekeeper' }, hints: ['Three switches on; then two test runs with alex.kim — vary only the IP.'],
    },
    {
      id: 'OBJ-H7', title: 'Recertify every identity', pillar: 'Mitigate', coverage: 'CI-14/13', anchor: 'Access review: keep / disable / scope-down decisions',
      student: 'In the Directory’s Access Review queue, record the correct decision for all five identities.',
      context: 'Quarterly recertification: every identity must justify its access — including the compromised one, whose containment is planned separately.',
      goTo: { directory: true }, hints: ['Departed/dormant → disable; over-permissioned contractor → scope-down; active admin and business-needed service → keep.'],
    },
    {
      id: 'OBJ-H8', title: 'Map gaps to MITRE mitigations', pillar: 'Mitigate', coverage: 'CI-17', anchor: 'Official mitigation IDs M1032 / M1018 / M1047',
      student: 'Match each post-incident gap to its official MITRE ATT&CK mitigation ID in the Field Notes tab.',
      context: 'Speaking in M-IDs is how defenders reference controls precisely.',
      goTo: { tab: 'notes' }, hints: ['MFA = M1032. Account lifecycle management = M1018. Audit/alerting = M1047.'],
    },
    {
      id: 'OBJ-H9', title: 'Own the residual risk', pillar: 'Understand', coverage: 'CI-17', anchor: 'Residual risk: programmatic keys bypass interactive MFA',
      student: 'Pick the ONE true residual-risk statement after all remediation in the Field Notes tab.',
      context: 'Hardened ≠ risk-free. Knowing what remains is the mark of a senior operator.',
      goTo: { tab: 'notes' }, hints: ['Ask: does an interactive MFA challenge happen when a service uses a static API key?'],
    },
  ];

  // ---------------------------------------------------------------------------
  // Quiz banks
  // ---------------------------------------------------------------------------
  const QUIZ_MEDIUM = [
    { id: 'qm1', q: 'Which AAA stage DECIDES what an authenticated identity is allowed to do?', options: ['Identification', 'Authentication', 'Authorization', 'Accounting'], correct: 2, expl: 'Authorization evaluates policies and produces the Allow/Deny decision. Identification claims, Authentication proves, Accounting records.' },
    { id: 'qm2', q: 'Which combination qualifies as TRUE multi-factor authentication?', options: ['Password + PIN', 'Password + authenticator app', 'Fingerprint + face scan', 'Security questions + birthdate'], correct: 1, expl: 'MFA requires different factor CATEGORIES. Password + authenticator app = know + have. Password + PIN is know + know; fingerprint + face scan is are + are; security questions + birthdate is know + know.' },
    { id: 'qm3', q: 'A request matches both an Allow statement and an explicit Deny statement. What happens?', options: ['Depends on statement order in the JSON', 'Random — the engine picks one', 'Allowed — an explicit Allow wins', 'Denied — an explicit Deny always wins'], correct: 3, expl: 'Evaluation order: explicit Deny overrides any Allow. Only with no Deny does a matching Allow grant access; with neither, access is implicitly denied.' },
    { id: 'qm4', q: 'Users can read analytics because they are members of the "Finance" group. Which authorization model is this?', options: ['GBAC (group-based)', 'RBAC', 'DAC (discretionary)', 'Mandatory access control'], correct: 0, expl: 'GBAC grants through group membership managed centrally. RBAC assigns roles to individuals; DAC lets the resource owner decide.' },
    { id: 'qm5', q: 'What is OAuth 2.0’s primary role in an identity architecture?', options: ['Authenticating users with signed XML assertions', 'Delegating authorization via scoped tokens', 'Storing directory passwords', 'Encrypting data at rest'], correct: 1, expl: 'OAuth 2.0 delegates AUTHORIZATION with scoped tokens. XML assertions are SAML’s job; OIDC adds authentication on top of OAuth 2.0; neither stores passwords or encrypts data.' },
    { id: 'qm6', q: 'Which statement best expresses least privilege?', options: ['Give every developer admin rights to avoid blockers', 'Use * in policies so code never breaks', 'Grant only the permissions an identity needs', 'Give read access to everyone by default'], correct: 2, expl: 'Least privilege bounds blast radius: only what the job needs. Admin-for-all and read-for-everyone over-grant; wildcards are why the DevOps role could read payroll in this lab’s audit finding #2.' },
  ];

  const QUIZ_HARD = [
    { id: 'qh1', q: 'Audit line: 02:41, static API key of svc-reporting used from a never-seen network; the key was committed to a public repo on Oct 30. What happened?', options: ['A scheduled job relocated data centers', 'A stolen key was replayed as a valid identity', 'A brute-force password attack against the service account', 'SAML assertion forgery against the IdP'], correct: 1, expl: 'The adversary STEALS the application access token/key (T1528) and then uses it as a VALID ACCOUNT (T1078). It was not a scheduled relocation, no password brute force occurred, and no SAML was involved.' },
    { id: 'qh2', q: 'A leaked static service key must be remediated. Best control?', options: ['Lengthen the key string', 'Add MFA to the service account console profile', 'Rotate/revoke and vault the secret', 'Rename the service account'], correct: 2, expl: 'Static secrets must be rotated/revoked and ideally replaced with vaulted, short-lived or managed credentials. A longer or renamed key stays exposed, and MFA does not apply to non-interactive API-key use.' },
    { id: 'qh3', q: 'role-finops has Allow (finance-read: Get payroll) AND an explicit Deny (payroll-guard: Get payroll). Result of Get payroll-export/summary.csv?', options: ['Allowed', 'Denied — implicit deny', 'Allowed, because Allow was attached first', 'Denied — explicit deny wins'], correct: 3, expl: 'Explicit Deny always wins over Allow. Attachment order never matters; only Deny > Allow > implicit-deny does.' },
    { id: 'qh4', q: 'After an IdP signing-certificate rotation, all SAML SSO logins fail with "invalid assertion". Most likely cause?', options: ['The SP trusts the old IdP signing certificate', 'Every user password expired at the same time', 'All the OAuth scopes were revoked at the provider', 'MFA codes started failing checksum'], correct: 0, expl: 'The SP validates the assertion signature against the IdP’s certificate — a stale trust anchor breaks SSO. Password expiry and OAuth scope revocation live in different protocols, and MFA failures surface differently.' },
    { id: 'qh5', q: 'A dormant-for-214-days account still has an ACTIVE API key. Best action?', options: ['Leave it — dormant accounts are safe', 'Only lower its role, keep the key', 'Change its password, keep the key', 'Disable it and revoke/rotate keys'], correct: 3, expl: 'Disabling alone leaves programmatic keys usable; lowering a role or changing a password leaves the key live. Lifecycle hygiene = disable + kill credentials (M1018). This lab’s minnie.alvarez is the case study.' },
    { id: 'qh6', q: 'How should interactive SSH access to cloud VMs be secured per Cloud+ guidance?', options: ['Bastion host, SSH keys, IP restrictions', 'Longer passwords for SSH sessions', 'Share one admin key across the whole team', 'Disable logging on the jump host'], correct: 0, expl: 'Management-plane access: route through a bastion, authenticate with keys (never passwords), and restrict source ranges. Shared keys, longer passwords and silenced logging all widen exposure.' },
    { id: 'qh7', q: 'Which statement captures the zero-trust principle relevant to IAM?', options: ['Trust everything inside the corporate network', 'Trust the VPN, distrust the internet', 'Verify every request, regardless of origin', 'Authenticate once per year during audits'], correct: 2, expl: 'Zero trust = never trust, always verify — identity is checked on every request regardless of where it comes from (which is exactly what conditional access models).' },
  ];

  // ---------------------------------------------------------------------------
  // Field notes content (C6)
  // ---------------------------------------------------------------------------
  const DETECTION_PLAYBOOK = [
    { source: 'Audit trail (accounting logs)', look: 'Non-human identities using keys from IPs outside 10.0.0.0/16, activity outside scheduled windows, policy-attach events on privileged principals', logic: 'alert when actor startswith "svc-" and SourceIp not in 10.0.0.0/16' },
    { source: 'IdP / sign-in logs', look: 'Legacy-protocol attempts, MFA challenge failures, sign-ins from departed/dormant accounts', logic: 'alert when protocol = "legacy" or account.hrFlag = "departed"' },
    { source: 'Configuration / vault', look: 'Key age beyond 90 days, secrets committed to repositories, unattached admin policies', logic: 'alert when key.lastRotated > 90 days or secret.repo_visibility = "public"' },
  ];

  const MITIGATION_RECS = [
    { mid: 'M1032', name: 'Multi-factor Authentication', how: 'Gatekeeper: require MFA for Admins/Finance (Medium) or all groups (Hard).' },
    { mid: 'M1036', name: 'Account Use Policies', how: 'Conditional access: block legacy protocols, restrict sign-in to the corporate range.' },
    { mid: 'M1018', name: 'User Account Management', how: 'Offboard dana.wells, recertify identities, scope-down the contractor, rotate keys.' },
    { mid: 'M1027', name: 'Password Policies', how: 'Interactive credentials stay strong and unique; keys are not passwords — rotate them on schedule.' },
    { mid: 'M1047', name: 'Audit', how: 'Keep the audit trail and alert on anomaly patterns you tuned in OBJ-M9.' },
    { mid: 'M1017', name: 'User Training', how: 'Debrief the team: how leaked keys happen and why least privilege contains blast radius.' },
  ];

  const H4_PROBES = [
    { id: 'q1', probe: 'role-finops → store:object:Get → payroll-export/summary.csv (corporate IP, MFA on)', options: ['allow', 'deny-explicit', 'deny-implicit'], why: 'payroll-guard has an explicit Deny on exactly this — it beats finance-read’s Allow.' },
    { id: 'q2', probe: 'role-qa → store:object:Put → customer-analytics/events.json', options: ['allow', 'deny-explicit', 'deny-implicit'], why: 'QA has no Deny to hit — but also no Allow for Put. Default deny = deny-implicit.' },
    { id: 'q3', probe: 'role-devops → store:object:Get → dev-sandbox/build.log (corporate IP)', options: ['allow', 'deny-explicit', 'deny-implicit'], why: 'devops-wide allows store:* on * — an unconditioned Allow matches → allow.' },
  ];

  const NEXT_STEPS = [
    'Cloud+ CV0-004 objective 4.4 — apply security best practices (zero trust, privileged account management).',
    'Cloud+ CV0-004 objective 4.6 — monitor suspicious activities to identify common attacks.',
    'Cloud+ CV0-004 objective 6.3 — troubleshoot security issues (identity & permission problems).',
    'Deepen detection: read MITRE ATT&CK Valid Accounts (T1078) and its cloud sub-technique T1078.004.',
  ];

  return {
    GLOSSARY, ORG, IDENTITIES, ROLES, SIM_PRINCIPALS, ACTIONS, RESOURCES,
    IP_CORP, IP_UNKNOWN, IP_CONTRACTOR, SIM_IPS, POLICIES, KEY_SEEDS, EVENTS,
    AAA_STAGES, FACTOR_ITEMS, AUTHZ_SCENARIOS, SAML_STEPS, PROTOCOL_MATCH,
    RISK_CONTROLS, REVIEW_QUEUE, H8_GAPS, OBJECTIVES_MEDIUM, OBJECTIVES_HARD,
    QUIZ_MEDIUM, QUIZ_HARD, DETECTION_PLAYBOOK, MITIGATION_RECS, H4_PROBES, NEXT_STEPS,
  };
})();
