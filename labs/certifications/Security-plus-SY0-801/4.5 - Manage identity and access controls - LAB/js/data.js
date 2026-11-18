// ── The Access Bureau — synthetic training content (data) ─────────────────
// Ported 1:1 from the original lab's src/lib/lab/data.ts (same constants,
// same wording, same correct answers, same hint tiers, same feedback).
// ALL data below is fictional and labeled for training use only.
// Exposed as the global ABData object (classic script, no bundler).
'use strict';
(function (global) {
const ORG = 'Meridian Freight Co.';
const CASE_NO = 'IAM-2026-114';
const ACCOUNT_TYPES = [
    { id: 'user', label: 'User', desc: 'One named human doing ordinary work; no standing admin rights.' },
    { id: 'priv-global', label: 'Privileged — Global', desc: 'Authority across the whole directory or cloud tenant.' },
    { id: 'priv-local', label: 'Privileged — Local', desc: 'Administrator of a single machine only.' },
    { id: 'service', label: 'Service', desc: 'Non-human identity running apps, jobs and integrations.' },
    { id: 'thirdparty', label: 'Third-party', desc: 'Vendor, contractor or partner identity.' },
    { id: 'breakglass', label: 'Emergency (break-glass)', desc: 'Sealed account used only when normal administration has failed.' },
];
// ── Intake dossiers ──
const DOSSIERS_MEDIUM = [
    { id: 'd-jmoreau', name: 'Julien Moreau', login: 'j.moreau', correct: 'user',
        attrs: ['Human — finance analyst (GL reconciliation)', 'Standard workstation, no admin rights', 'One account, one person'] },
    { id: 'd-svcrw', name: 'svc_reportwriter', login: 'svc_reportwriter', correct: 'service',
        attrs: ['Runs the nightly BI extract at 02:00', 'Non-human identity; owner: BI platform team', 'No interactive logon expected'] },
    { id: 'd-kb', name: 'corp-admin-kb', login: 'corp-admin-kb', correct: 'priv-global',
        attrs: ['Can reset any account in the MeridianID tenant', 'Tenant-wide authority, CISO-approved', 'Held by K. Bello (identity team)'] },
    { id: 'd-wks07', name: 'desk-wks-07\\admin', login: 'desk-wks-07\\admin', correct: 'priv-local',
        attrs: ['Full control of one warehouse workstation', 'Cannot touch the domain or other machines', 'Used for local maintenance only'] },
    { id: 'd-track', name: 'vendor_trackright', login: 'vendor_trackright', correct: 'thirdparty',
        attrs: ['Belongs to TrackRight Systems (contractor)', 'Dock-scheduling portal integration', 'Access must be limited and time-bound'] },
    { id: 'd-emerg', name: 'emergency-root', login: 'emergency-root', correct: 'breakglass',
        attrs: ['Sealed in the vault; envelope signed across the seam', 'Two-person integrity to open', 'Use only when normal administration has failed'] },
];
const DOSSIERS_HARD = [
    ...DOSSIERS_MEDIUM,
    { id: 'd-mchen', name: 'Mia Chen', login: 'm.chen', correct: 'user',
        attrs: ['Human — helpdesk technician', 'Elevates via Helpdesk-Admins group on approved request (JIT)', 'No standing admin rights of her own'] },
    { id: 'd-pipe', name: 'ci-deploy-bot', login: 'ci-deploy-bot', correct: 'service',
        attrs: ['Pipeline identity in CI/CD', 'Scoped, short-lived tokens only', 'Non-human identity'] },
    { id: 'd-owens', name: 'Ada Owens', login: 'a.owens', correct: 'user',
        attrs: ['Human — CFO', 'Standard daily account; separate vaulted admin account never used in 180 days', 'Admin account is held in the PAM vault, not hers interactively'] },
];
const RISKY_EXPECTED = ['d-kb', 'd-svcrw', 'd-track'];
// ── Identity lifecycle (M2 / shared) ──
const LIFECYCLE_STEPS = [
    // Pool display order is intentionally shuffled (audit QA-4): it must not reveal
    // the canonical sequence — the correct order lives in LIFECYCLE_CANON below.
    { id: 'grant-new', label: 'Grant the permissions the new role actually requires', phase: 'Mover' },
    { id: 'proof', label: 'Identity proofing — verify the joiner\'s identity documents before any account exists', phase: 'Joiner' },
    { id: 'disable', label: 'Leaver: disable the account the day the departure takes effect', phase: 'Leaver' },
    { id: 'roles', label: 'Assign role-based permissions from the job template — never copied from a colleague', phase: 'Joiner' },
    { id: 'deprovision', label: 'Deprovision — remove entitlements and archive, so no orphaned account remains', phase: 'Leaver' },
    { id: 'move-review', label: 'Mover: a transfer triggers an access review of all existing entitlements', phase: 'Mover' },
    { id: 'revoke-old', label: 'Revoke permissions tied to the old role (revoke, don\'t accumulate)', phase: 'Mover' },
    { id: 'provision', label: 'Provision the account from the HR record via SCIM automation', phase: 'Joiner' },
];
const LIFECYCLE_CANON = ['proof', 'provision', 'roles', 'move-review', 'revoke-old', 'grant-new', 'disable', 'deprovision'];
// ── Authentication factors (M3) ──
const FACTOR_METHODS = [
    { id: 'password', label: 'Password', hint: 'Typed secret' },
    { id: 'pin', label: 'PIN', hint: 'Short local secret' },
    { id: 'totp', label: 'Authenticator app (TOTP)', hint: '6-digit rolling code' },
    { id: 'push', label: 'Push notification', hint: 'Approve on enrolled device' },
    { id: 'smartcard', label: 'Smart card', hint: 'Physical chip card' },
    { id: 'fido2', label: 'FIDO2 security key / passkey', hint: 'Hardware-bound credential' },
    { id: 'fingerprint', label: 'Fingerprint', hint: 'Something you are' },
    { id: 'face', label: 'Face recognition', hint: 'Something you are' },
    { id: 'iris', label: 'Iris scan', hint: 'Something you are' },
];
const FACTOR_EXPECT = {
    password: 'know', pin: 'know', totp: 'have', push: 'have', smartcard: 'have',
    fido2: 'have', fingerprint: 'are', face: 'are', iris: 'are',
};
const MFA_PAIRS = [
    { id: 'pw-totp', label: 'Password + authenticator app (TOTP)', correct: true },
    { id: 'pw-pin', label: 'Password + PIN', correct: false },
    { id: 'fp-face', label: 'Fingerprint + face recognition', correct: false },
    { id: 'sc-pin', label: 'Smart card + PIN', correct: true },
    { id: 'pw-fido', label: 'Password + FIDO2 security key', correct: true },
];
const MFA_PAIRS_EXPECT = ['pw-totp', 'sc-pin', 'pw-fido'];
// ── SAML sequence (M4) ──
const SAML_STEPS = [
    // Pool display order intentionally shuffled (audit QA-4); canon = SAML_CANON.
    { id: 's4', label: 'IdP issues a signed SAML assertion (subject, time, audience)' },
    { id: 's1', label: 'User asks the service provider (vendor portal) for access' },
    { id: 's6', label: 'SP validates signature, audience and time window — session opens' },
    { id: 's2', label: 'SP redirects the browser to the IdP with a SAML AuthnRequest' },
    { id: 's5', label: 'Browser POSTs the assertion to the SP\'s Assertion Consumer Service' },
    { id: 's3', label: 'User authenticates at MeridianID (password + MFA)' },
];
const SAML_CANON = ['s1', 's2', 's3', 's4', 's5', 's6'];
// ── Evidence locker ──
const ARTIFACTS = [
    { id: 'a-authlog', title: 'auth.log — corp-dc01 (excerpt)', tag: 'AUTH LOG', lines: [
            '2026-11-09T02:14:07Z  svc_reportwriter   KRB5 TGS to db01        SUCCESS',
            '2026-11-09T03:02:41Z  j.moreau           LDAPS bind :636 (TLS)   SUCCESS',
            '2026-11-09T03:11:52Z  svc_backup         LDAP bind :389 (NO TLS) SUCCESS',
            '2026-11-09T09:00:03Z  k.osei             TOTP second factor      SUCCESS',
            '2026-11-09T23:58:44Z  r.tanaka           VPN from 198.51.100.44  SUCCESS',
            '2026-11-10T01:30:12Z  svc_backup         INTERACTIVE logon WKSTN-114 SUCCESS',
            '2026-11-10T02:59:19Z  svc_ftpbridge      LDAP bind :389 (NO TLS) SUCCESS',
        ] },
    { id: 'a-script', title: 'backup-job.ps1 (excerpt)', tag: 'SCRIPT', lines: [
            '# nightly backup job (runs as svc_backup)',
            '$user = "svc_backup"',
            '$pass = "S3cureBackup#2024"   # Scenario note: rotate someday',
            'net use \\\\fs01\\backups /user:$user $pass',
        ] },
    { id: 'a-consent', title: 'OAuth consent request — InvoiceMailPro', tag: 'CONSENT', lines: [
            'InvoiceMailPro (unverified publisher) wants to:',
            '  • Read and write your entire mailbox  (mail.readwrite)',
            '  • Read all organizational directories',
            '"Sign in with OAuth — no password needed!"',
            'Token requested: never expires',
            '[ Accept ]   [ Decline ]',
        ] },
    { id: 'a-email', title: 'Email — vendor access request', tag: 'EMAIL', lines: [
            'From: integrations@trackright.example',
            'Subject: Permanent admin for our dock scheduler',
            '',
            'Please grant vendor_trackright GLOBAL ADMIN permanently,',
            'so we never have to bother you again. Thanks!',
        ] },
    { id: 'a-trace', title: 'SAML trace — vendor portal SSO', tag: 'TRACE', lines: [
            'GET /sso?SAMLRequest=…  →  idp.meridianfreight.example',
            '<Assertion Issuer="https://idp.meridianfreight.example">',
            '  <Audience>https://portal.trackright.example</Audience>',
            '  <Conditions NotOnOrAfter="2026-11-10T09:07:00Z"/>',
            'SP expects audience: https://vendor.trackright.example',
            '→ SP denies: Requester / audience mismatch',
        ] },
    { id: 'a-hr', title: 'HR memo — night audit rota', tag: 'HR', lines: [
            'Night audit team (incl. r.tanaka) works 22:00–06:00.',
            'VPN sessions around 03:00 are expected and approved.',
        ] },
    { id: 'a-credage', title: 'Credential age report (Hard)', tag: 'REPORT', lines: [
            'svc_backup      password age: 412 days   (policy: 90)',
            'svc_ftpbridge   password age: 400 days   (policy: 90)',
            'j.moreau        password age: 38 days    OK',
        ] },
    { id: 'a-scan', title: 'Legacy scanner console banner (Hard)', tag: 'CONSOLE', lines: [
            'NOTICE: management console uses deprecated TLS 1.0.',
            'Vendor EOL notice 2027-04. Replacement on asset plan.',
            '(Network team ticket #8841 — not an identity issue)',
        ] },
];
// ── Violation hunt (M5) ──
const VIOLATION_CLAIMS = [
    // Order intentionally interleaved (audit QA-4): true findings must not cluster first.
    { id: 'v-ldap', label: 'An inventory server binds to corp-dc01 over port 389 with no TLS (plain LDAP).', correct: true },
    { id: 'v-vpn', label: 'r.tanaka\'s VPN sessions occur around 03:00 and should be flagged as suspicious.', correct: false },
    { id: 'v-script', label: 'The nightly backup script embeds the service account password in cleartext.', correct: true },
    { id: 'v-banner', label: 'The legacy scanner\'s deprecated-TLS banner is an identity and access finding.', correct: false },
    { id: 'v-interactive', label: 'svc_backup, a service account, was seen logging in interactively on a desktop.', correct: true },
    { id: 'v-goodpw', label: 'j.moreau\'s 14-character password, rotated quarterly and stored in the password manager, is a violation.', correct: false },
    { id: 'v-oauth', label: 'InvoiceMailPro advertises "Sign in with OAuth" to authenticate users.', correct: true },
    { id: 'v-backup', label: 'k.osei using a backup code once and TOTP normally the next day proves account compromise.', correct: false },
];
const VIOLATIONS_EXPECT = ['v-ldap', 'v-script', 'v-interactive', 'v-oauth'];
// ── OAuth repair (M6) ──
const OAUTH_QUESTIONS = [
    { key: 'protocol', prompt: 'Which protocol should InvoiceMailPro actually use to sign users in?',
        options: [
            { id: 'oauth2', label: 'OAuth 2.0 as-is' },
            { id: 'oidc', label: 'OpenID Connect on top of OAuth 2.0' },
            { id: 'saml', label: 'SAML' },
            { id: 'ldap', label: 'LDAP' }
        ] },
    { key: 'scope', prompt: 'Which scope request follows least privilege?',
        options: [
            { id: 'rw-all', label: 'Read and write entire mailbox (mail.readwrite)' },
            { id: 'r-mail', label: 'Read current mail only (mail.read, narrowly scoped)' },
            { id: 'dir-all', label: 'Read all organizational directories' }
        ] },
    { key: 'token', prompt: 'What is correct token behavior?',
        options: [
            { id: 'never', label: 'Token never expires' },
            { id: 'short', label: 'Short-lived token that expires and can be revoked' },
            { id: 'until-pw', label: 'Valid until the user changes password' }
        ] },
];
const OAUTH_EXPECT = { protocol: 'oidc', scope: 'r-mail', token: 'short' };
// ── Access review (M7 / H6) ──
const REVIEW_ROWS_MEDIUM = [
    { id: 'r-diallo', who: 'e.diallo', ent: 'VPN + ERP access', why: 'Departed 90 days ago; account still active (orphaned)', expect: 'revoke' },
    { id: 'r-tanaka', who: 'r.tanaka', ent: 'Sales CRM — full export', why: 'Transferred Sales → Finance in March; old entitlement never revoked (privilege creep)', expect: 'revoke' },
    { id: 'r-track', who: 'vendor_trackright', ent: 'Dock scheduler — admin', why: 'Third-party; last used 120 days ago', expect: 'revoke' },
    { id: 'r-svc', who: 'svc_reportwriter', ent: 'BI database — read-only', why: 'Current, scoped, matches nightly job', expect: 'keep' },
    { id: 'r-moreau', who: 'j.moreau', ent: 'Finance GL folder', why: 'Matches current role', expect: 'keep' },
    { id: 'r-hd', who: 'Helpdesk-Admins group', ent: 'Elevated support role', why: '2 members, both active helpdesk staff, JIT elevation', expect: 'keep' },
    { id: 'r-chen', who: 'm.chen', ent: 'Domain Admin — standing membership', why: 'Helpdesk tech; elevation needed only occasionally', expect: 'jit' },
];
const REVIEW_ROWS_HARD = [
    { id: 'h1', who: 'e.diallo', ent: 'VPN + ERP access', why: 'Orphaned — departed 90 days ago', expect: 'revoke' },
    { id: 'h2', who: 'r.tanaka', ent: 'Sales CRM — full export', why: 'Privilege creep from March transfer', expect: 'revoke' },
    { id: 'h3', who: 'vendor_trackright', ent: 'Dock scheduler — admin', why: 'Unused 120 days, third-party', expect: 'revoke' },
    { id: 'h4', who: 'svc_ftpbridge', ent: 'All file shares — read/write', why: 'File-transfer service; needs 2 folders, has everything + interactive logons', expect: 'revoke' },
    { id: 'h5', who: 'm.chen', ent: 'Domain Admin — standing', why: 'Needed occasionally → convert', expect: 'jit' },
    { id: 'h6', who: 'svc_reportwriter', ent: 'BI database — read-only', why: 'Scoped to the nightly job', expect: 'keep' },
    { id: 'h7', who: 'j.moreau', ent: 'Finance GL folder', why: 'Matches current role', expect: 'keep' },
    { id: 'h8', who: 'Helpdesk-Admins group', ent: 'JIT elevated support role', why: '2 active members, approvals logged', expect: 'keep' },
    { id: 'h9', who: 'k.osei', ent: 'TOTP + offline backup codes', why: 'Healthy recovery configuration', expect: 'keep' },
    { id: 'h10', who: 'a.owens', ent: 'Vaulted local-admin credential (180d unused)', why: 'Sealed in PAM vault, CISO-approved emergency use', expect: 'keep' },
];
// ── Access control models (M8) ──
const MODEL_SCENARIOS = [
    { id: 'mo-hosp', text: 'Research files carry classification labels; a user\'s clearance decides access, and users cannot change it.', expect: 'mac', opts: ['dac', 'mac', 'rbac'] },
    { id: 'mo-team', text: 'A team folder\'s owner personally adds and removes collaborators.', expect: 'dac', opts: ['time', 'mac', 'dac'] },
    { id: 'mo-onboard', text: 'New accountants automatically get ledger access because it is attached to the "Accountant" role.', expect: 'rbac', opts: ['rbac', 'rule', 'dac'] },
    { id: 'mo-firewall', text: 'Admins wrote explicit allow/deny rules that the system evaluates in order.', expect: 'rule', opts: ['rbac', 'jit', 'rule'] },
    { id: 'mo-night', text: 'Stockroom door access works only between 05:00 and 19:00.', expect: 'time', opts: ['mac', 'time', 'rule'] },
    { id: 'mo-inc', text: 'During an incident, an on-call engineer requests production access for 2 hours; it is approved and auto-expires.', expect: 'jit', opts: ['jit', 'dac', 'time'] },
];
const MODEL_LABELS = {
    dac: 'Discretionary (DAC)', mac: 'Mandatory (MAC)', rbac: 'Role-based (RBAC)',
    rule: 'Rule-based', time: 'Time-based', jit: 'Just-in-time (JIT)',
};
// ── MFA policy (M9) ──
const MFA_POLICY_OPTS = [
    // Order intentionally interleaved (audit QA-4).
    { id: 'mf-totp', label: 'Standardize TOTP authenticator apps (offline, time-synced)', correct: true },
    { id: 'mf-sms', label: 'Use SMS codes as the primary factor for everyone', correct: false },
    { id: 'mf-backup', label: 'Issue one-time backup codes, stored offline, for recovery', correct: true },
    { id: 'mf-hotp', label: 'Use HOTP counters as the organization-wide standard', correct: false },
    { id: 'mf-passkey', label: 'Require FIDO2 passkeys / security keys for privileged accounts', correct: true },
    { id: 'mf-bio', label: 'Allow biometrics with a PIN fallback on shared devices', correct: true },
];
const MFA_POLICY_EXPECT = ['mf-totp', 'mf-backup', 'mf-passkey', 'mf-bio'];
// ── PAM vault (M10 / H7) ──
const LAPS_OPTIONS = [
    { id: 'never', label: 'Never rotate' }, { id: '30', label: 'Every 30 days' },
    { id: '90', label: 'Every 90 days' }, { id: '7', label: 'Every 7 days' },
];
// ── Review board requests (M11) ──
const REQUESTS = [
    { id: 'q-vendor', from: 'TrackRight Systems', asks: 'Permanent GLOBAL ADMIN on MeridianID for their dock-scheduler integration',
        expect: 'deny', why: 'Third-party least privilege: grant a scoped role JIT, never standing global admin.' },
    { id: 'q-dev', from: 'Finance ERP', asks: 'Developer request: both "initiate payments" and "approve payments" permissions',
        expect: 'deny', why: 'Separation of duties — no single identity may complete both halves of a payment.' },
    { id: 'q-audit', from: 'External audit firm', asks: 'Read-only access to identity records, for two weeks',
        expect: 'approve', why: 'Time-boxed, scoped, auditable — a correct time-based grant.' },
    { id: 'q-new', from: 'HR onboarding', asks: 'New payroll clerk needs the standard Payroll role package',
        expect: 'approve', why: 'RBAC joiner flow: access from the role template, not copied from a colleague.' },
    { id: 'q-chat', from: 'Platform team', asks: 'Keep the shared svc_backup password pinned in the team chat "for convenience"',
        expect: 'deny', why: 'Shared static credentials must be vaulted and rotated — chat pins are unsecured credentials.' },
];
// ── HARD extras ──
const FINDING_OPTIONS = [
    // Order intentionally interleaved (audit QA-4).
    { id: 'PLAIN_LDAP', label: 'svc_ftpbridge authenticates with plain LDAP, no TLS (:389)' },
    { id: 'TLS_SCANNER', label: 'The legacy scanner console uses deprecated TLS 1.0' },
    { id: 'HARDCODED_SECRET', label: 'A cleartext password is embedded in the deploy script for svc_ftpbridge' },
    { id: 'NIGHT_VPN', label: 'r.tanaka\'s VPN sessions occur around 03:00' },
    { id: 'INTERACTIVE_SERVICE_LOGON', label: 'svc_ftpbridge logs in interactively on a jump host' },
    { id: 'TOTP_NORMAL', label: 'k.osei\'s TOTP logins succeed normally' },
    { id: 'NO_ROTATION', label: 'svc_ftpbridge\'s credential is ~400 days old, far past the 90-day policy' },
    { id: 'BROAD_SCOPE', label: 'svc_ftpbridge has read/write on ALL file shares though it needs two folders' },
];
const FINDINGS_EXPECT = ['PLAIN_LDAP', 'HARDCODED_SECRET', 'INTERACTIVE_SERVICE_LOGON', 'NO_ROTATION', 'BROAD_SCOPE'];
const FED_SAML_OPTS = [
    { id: 'SIGNATURE_INVALID', label: 'The assertion signature is invalid' },
    { id: 'AUDIENCE_MISMATCH', label: 'The assertion audience does not match the SP\'s expected entity ID' },
    { id: 'CLOCK_SKEW', label: 'The clocks between IdP and SP are skewed' },
    { id: 'USER_LOCKED', label: 'The user account is locked' },
];
const FED_OAUTH_OPTS = [
    { id: 'ok', label: 'Nothing is wrong — OAuth can authenticate users' },
    { id: 'fix-oidc', label: 'OAuth authorizes but cannot authenticate; the app must use OIDC for sign-in' },
    { id: 'fix-saml', label: 'The app must switch to SAML browser profiles' },
    { id: 'fix-ldap', label: 'The app must bind over LDAPS' },
];
const PROTOCOL_SCENARIOS = [
    { id: 'p-partner', text: 'Browser-based SSO with a partner organization that runs its own IdP', expect: 'saml',
        opts: [{ id: 'oidc', label: 'OIDC' }, { id: 'saml', label: 'SAML' }, { id: 'ldaps', label: 'LDAPS' }] },
    { id: 'p-mobile', text: 'A mobile app talking to a cloud API — modern token-based sign-in', expect: 'oidc',
        opts: [{ id: 'kerberos', label: 'Kerberos' }, { id: 'ldaps', label: 'LDAP (plain)' }, { id: 'oidc', label: 'OIDC' }] },
    { id: 'p-inventory', text: 'Legacy inventory server doing server-to-server directory lookups', expect: 'ldaps',
        opts: [{ id: 'plain-ldap', label: 'Plain LDAP :389' }, { id: 'ldaps', label: 'LDAPS / StartTLS' }, { id: 'saml', label: 'SAML' }] },
    { id: 'p-share', text: 'Domain-joined workstation accessing an internal file server (Active Directory)', expect: 'kerberos',
        opts: [{ id: 'kerberos', label: 'Kerberos' }, { id: 'oidc', label: 'OIDC' }, { id: 'saml', label: 'SAML' }] },
];
const ROLLOUT_STEPS = [
    // Pool display order intentionally shuffled (audit QA-4); canon = ROLLOUT_CANON.
    { id: 'rl-backup', label: 'Issue offline one-time backup codes to every account' },
    { id: 'rl-admin', label: 'Enroll privileged users first, with phishing-resistant passkeys / FIDO2 keys' },
    { id: 'rl-enforce', label: 'Enforce org-wide; monitor the exemption list and review monthly' },
    { id: 'rl-totp', label: 'Roll out TOTP authenticator apps as the workforce baseline' },
    { id: 'rl-pilot', label: 'Pilot with one department; measure lockouts and exceptions' },
    { id: 'rl-inventory', label: 'Inventory applications and authentication flows; find legacy/basic-auth gaps' },
];
const ROLLOUT_CANON = ['rl-inventory', 'rl-admin', 'rl-totp', 'rl-backup', 'rl-pilot', 'rl-enforce'];
const CHAIN_ROWS = [
    { id: 'c1', step: 'Password spraying succeeds on two accounts', expect: 'no-mfa-weak' },
    { id: 'c2', step: 'A user grants OAuth consent to "MailStats Pro" (unvetted app)', expect: 'broad-consent' },
    { id: 'c3', step: 'svc_ftpbridge\'s script password is reused from a jump host', expect: 'shared-static' },
    { id: 'c4', step: 'The attacker uses corp-admin-kb to reset other users\' passwords', expect: 'standing-priv' },
];
const CHAIN_WEAKNESSES = [
    // Order intentionally shuffled (audit QA-4/R6): must not mirror the c1–c4 canon.
    { id: 'standing-priv', label: 'Standing global admin privilege' },
    { id: 'broad-consent', label: 'Broad OAuth consent, no admin review of scopes' },
    { id: 'plain-ldap', label: 'Plain LDAP binds' },
    { id: 'no-mfa-weak', label: 'No MFA + weak password policy' },
    { id: 'orphaned', label: 'Orphaned accounts' },
    { id: 'shared-static', label: 'Shared, non-rotating service credential outside the vault' },
];
const BEST_QS = [
    { id: 'b1', text: 'Attackers keep phishing one-time codes. BEST control?',
        opts: [{ id: 'sms', label: 'Move SMS codes to a second channel' }, { id: 'fido', label: 'FIDO2 passkeys / security keys' }, { id: 'train', label: 'More awareness training' }], expect: 'fido' },
    { id: 'b2', text: 'Too many standing administrators. BEST control?',
        opts: [{ id: 'jit', label: 'JIT elevation with approval and auto-expiry' }, { id: 'vault', label: 'Vault the passwords but keep sessions standing' }, { id: 'audit', label: 'Audit the admins more often' }], expect: 'jit' },
    { id: 'b3', text: 'A vendor needs access only during a 6-week project. BEST grant?',
        opts: [{ id: 'perm', label: 'Permanent named account' }, { id: 'shared', label: 'A shared login the whole vendor team knows' }, { id: 'time', label: 'Time-based, scoped role that expires with the project' }], expect: 'time' },
    { id: 'b4', text: 'Partner SSO broke after the partner rotated their IdP signing certificate. BEST response?',
        opts: [{ id: 'sso-off', label: 'Disable federation permanently' }, { id: 'meta', label: 'Update the federation metadata/trust with the new certificate and monitor' }, { id: 'pw', label: 'Reset everyone\'s passwords' }], expect: 'meta' },
];
const POST_BG_OPTS = [
    { id: 'rotate-review', label: 'Rotate the credential and review the usage logs' },
    { id: 'nothing', label: 'Nothing — the envelope reseals itself' },
    { id: 'leave', label: 'Leave the password as-is for the next incident' },
];
// ── Quizzes ──
const QUIZ_MEDIUM = [
    { id: 'qm1', prompt: 'A vendor app says: "Sign in with OAuth — no password needed!" What is the correct assessment?',
        options: ['Acceptable — OAuth handles sign-in fully', 'OAuth authorizes; sign-in needs OIDC', 'Swap OAuth for LDAP binds over port 389', 'OAuth works only for on-premises servers'],
        correct: 1, topic: 'OAuth 2.0 vs OIDC (authorization vs authentication)', explanation: 'OAuth 2.0 issues scoped, consented, expiring tokens to authorize access — it proves nothing about who the user is. OpenID Connect adds the authentication (ID token) layer on top.' },
    { id: 'qm2', prompt: 'Which authentication method is phishing-resistant?',
        options: ['SMS one-time codes', 'Email magic links', 'FIDO2 passkey or hardware key', 'Password with security questions'],
        correct: 2, topic: 'Phishing-resistant authentication (FIDO2/passkeys)', explanation: 'Passkeys and FIDO2 keys sign a challenge bound to the legitimate site origin — a phisher cannot relay them. SMS, magic links and passwords are trivially phished or intercepted.' },
    { id: 'qm3', prompt: 'A partner company wants its employees to reach your vendor portal using their own company credentials. What do you deploy?',
        options: ['SAML federation between SP and partner IdP', 'One shared portal account for the partner', 'Copy partner employees into your directory', 'Plain LDAP :389 to the partner directory'],
        correct: 0, topic: 'Federation with SAML (IdP/SP trust)', explanation: 'Federation extends trust across organizational boundaries: the partner IdP authenticates, it issues a signed SAML assertion, and your service provider consumes it — no shared accounts, no password copies.' },
    { id: 'qm4', prompt: 'What is the difference between TOTP and HOTP?',
        options: ['HOTP is time-based; TOTP uses a counter', 'They are the same protocol, rebranded', 'TOTP is stronger than certificates', 'TOTP is time-based; HOTP uses a counter'],
        correct: 3, topic: 'OTP mechanics (TOTP vs HOTP)', explanation: 'HOTP increments a counter per use; TOTP derives the code from the current time window. Time-synced TOTP is the standard for authenticator apps; counters can drift out of sync.' },
    { id: 'qm5', prompt: 'During an audit you find an account that is still active although its owner left 90 days ago. This is…',
        options: ['An orphaned account — disable it', 'Normal — accounts may stay a year', 'A break-glass account in use', 'A service account gone rogue'],
        correct: 0, topic: 'Deprovisioning & orphaned accounts', explanation: 'Leaver deprovisioning must happen at departure, not "eventually". Orphaned accounts are unmonitored doors: no one notices their logins, so disable and deprovision immediately.' },
    { id: 'qm6', prompt: 'One developer holds BOTH "initiate payments" and "approve payments" in the ERP. Which principle does this break?',
        options: ['Least privilege', 'Separation of duties', 'Identity proofing', 'Time-based access'],
        correct: 1, topic: 'Separation of duties', explanation: 'Separation of duties splits a sensitive action so no single identity can complete both halves — the classic fraud-prevention control. Least privilege is about the amount of access; SoD is about splitting it.' },
];
const QUIZ_HARD = [
    { id: 'qh1', prompt: 'svc_ftpbridge is compromised and you see active LDAP binds from it. FIRST action?',
        options: ['Wait for the next change window', 'Delete the account with no record kept', 'Disable it, rotate credentials, check logs', 'Nothing — service accounts resist takeover'],
        correct: 2, topic: 'Compromised service-account response', explanation: 'Contain first: kill the identity, rotate the credential everywhere it is embedded (scripts!), then scope the blast radius from logs. Deleting without record destroys evidence.' },
    { id: 'qh2', prompt: 'Your new mobile app needs single sign-on against the cloud IdP. Protocol choice?',
        options: ['NTLM passthrough from the device', 'Plain LDAP binds from the phone', 'SAML web-browser profile', 'OIDC (authorization code + PKCE)'],
        correct: 3, topic: 'Protocol selection for mobile apps', explanation: 'OIDC is built for modern app/API token flows (ID tokens, PKCE). SAML is browser-SSO oriented; LDAP/NTLM from a phone is unmanageable and unencrypted on open networks.' },
    { id: 'qh3', prompt: 'Partner SSO fails: the SP logs "Requester denied — audience mismatch" right after the partner changed their entity ID. Root cause?',
        options: ['The user\'s password expired', 'The clocks between IdP and SP have drifted apart', 'The assertion audience mismatches the entity ID', 'The partner signing certificate has just expired'],
        correct: 2, topic: 'SAML audience/entity-ID validation', explanation: 'The SP validates that the assertion\'s <Audience> matches its own entity ID. When a partner renames it, every assertion fails until the relying-party trust is updated.' },
    { id: 'qh4', prompt: 'Which log line is the strongest indicator of OAuth consent phishing?',
        options: ['A Kerberos TGS request for a file server share', 'A TOTP second-factor success for a finance user', 'A LDAPS bind recorded on secure port 636', 'Consent: "MailStats Pro" granted mail.readwrite'],
        correct: 3, topic: 'OAuth consent-phishing detection', explanation: 'An unverified app asking for write-scope over mail is the classic consent-phishing fingerprint: the attacker never needs a password, only one consent click with too-broad scopes.' },
    { id: 'qh5', prompt: 'Rolling out PAM in a company full of standing admins. BEST sequence?',
        options: ['Vault + JIT the privileged accounts first', 'Enable JIT for every admin at once on Monday', 'Start with interns to build rollout confidence', 'Buy a credential vault and call it complete'],
        correct: 0, topic: 'PAM rollout sequencing', explanation: 'Privileged accounts carry the most risk and the smallest population — pilot there, prove the workflow (checkout, approval, auto-expiry), then expand and keep watching the exception list.' },
    { id: 'qh6', prompt: 'Recertification: a third-party admin entitlement has been unused for 120 days. Decision?',
        options: ['Keep it — vendors are implicitly trusted', 'Revoke now; re-grant JIT when needed', 'Move it onto a shared vendor account', 'Pin the password in chat for convenience'],
        correct: 1, topic: 'Recertification of vendor access', explanation: 'Unused access is pure risk with zero benefit. Revocation plus a JIT re-grant path keeps the vendor productive without a standing door.' },
    { id: 'qh7', prompt: 'The break-glass account was used during last night\'s outage. Correct follow-up?',
        options: ['Leave it — break-glass resets itself', 'Rotate it, review the logs, report why', 'Delete the account so it cannot be misused', 'Share the new password with the whole ops team'],
        correct: 1, topic: 'Break-glass close-out procedure', explanation: 'Every break-glass use is an audit event: rotate immediately (the seal is broken), review logs for what was changed, and fix whatever made normal admin impossible — then re-seal.' },
];
// ── Glossary ──
const GLOSSARY = {
    'Identity proofing': 'Verifying a person is who they claim to be BEFORE an account is created.',
    'Provisioning': 'Creating an identity and granting its first access.',
    'Deprovisioning': 'Removing access and archiving the identity when it leaves.',
    'SCIM': 'System for Cross-domain Identity Management — automates provisioning between systems.',
    'Orphaned account': 'An account left active with no valid owner after a departure or transfer.',
    'Privilege creep': 'Access accumulated across role changes that is never revoked.',
    'MFA': 'Multi-factor authentication — two or more DIFFERENT factors: know / have / are.',
    'TOTP': 'Time-based one-time password — a code derived from the current time window.',
    'HOTP': 'HMAC-based one-time password — a code derived from a usage counter.',
    'Passkey': 'Phishing-resistant, passwordless credential bound to a device (FIDO2).',
    'IdP': 'Identity provider — authenticates the user and issues assertions or tokens.',
    'Service provider': 'The relying party — consumes assertions/tokens and grants access.',
    'SAML': 'XML federation standard for browser SSO assertions between organizations.',
    'OAuth 2.0': 'Authorization framework: scoped, expiring, consented tokens. NOT authentication.',
    'OIDC': 'OpenID Connect — the authentication layer on top of OAuth 2.0.',
    'LDAP / LDAPS': 'Directory protocol; LDAPS or StartTLS is the encrypted form.',
    'Kerberos': 'Ticket-based authentication protocol used by Active Directory.',
    'RBAC': 'Role-based access control — permissions attach to roles, people get roles.',
    'MAC': 'Mandatory access control — the system enforces access from labels and clearances.',
    'DAC': 'Discretionary access control — the resource owner decides who gets access.',
    'JIT': 'Just-in-time access — requested, approved, granted briefly, then removed.',
    'PAM': 'Privileged access management — vaulting, brokering and monitoring privileged accounts.',
    'LAPS': 'Windows Local Administrator Password Solution — auto-rotates each machine\'s local admin password.',
    'Break-glass': 'Sealed emergency account, used only when normal administration has failed.',
    'Least privilege': 'Every identity holds the minimum access it needs — nothing more.',
    'Separation of duties': 'Splitting a sensitive action so no single identity completes it alone.',
    'Access review': 'Periodic recertification that each identity still needs each permission.',
    'Vault': 'Encrypted store that brokers credentials so humans never see standing passwords.',
};
// ── Knowledge core sections ──
const KNOWLEDGE = [
    { id: 'k1', title: 'Identity & its lifecycle', body: 'Every right to access starts with an identity. Identity proofing establishes that a person is real before any account exists; provisioning creates the account (ideally automated with SCIM from the HR record); deprovisioning removes it the day it is no longer needed.', points: ['Joiners get access from their role template — never copied from a colleague', 'Movers trigger a review: revoke the old, grant the new', 'Leavers are disabled at departure — otherwise you breed orphaned accounts', 'Privilege creep = old entitlements that survived a move'] },
    { id: 'k2', title: 'Account types', body: 'Not all identities are equal. The account type determines how strictly it must be controlled.', points: ['User: one named human, no standing admin', 'Privileged: global (whole tenant) or local (one machine)', 'Service: non-human — no interactive logons, vaulted credentials', 'Third-party: vendors/contractors — scoped and time-bound', 'Break-glass: sealed emergency account, two-person integrity, alerting on use'] },
    { id: 'k3', title: 'Authentication: factors & methods', body: 'Authentication proves an identity holds a credential. Factors: something you KNOW (password, PIN), HAVE (OTP app, smart card, FIDO2 key, push), ARE (fingerprint, face, iris). MFA means two different factors.', points: ['TOTP (time-based) beats HOTP (counter) for authenticator apps', 'Passkeys / FIDO2 keys are phishing-resistant', 'Backup codes: offline recovery, one-time use', 'Password managers defend against reuse; identity proofing happens before all of this', 'Kerberos issues tickets inside an Active Directory domain'] },
    { id: 'k4', title: 'SSO & federation', body: 'Single sign-on authenticates once and reaches many apps. Federation extends that trust across organizations.', points: ['IdP authenticates and issues the assertion/token; the service provider (relying party) consumes it', 'SAML: signed XML assertions, browser SSO between enterprises', 'OAuth 2.0: AUTHORIZATION — scopes, consent, expiring tokens', 'OIDC: authentication layer on top of OAuth (ID tokens)', 'LDAP queries directories; always LDAPS/StartTLS — plain :389 is a finding'] },
    { id: 'k5', title: 'Authorization models', body: 'Authorization decides what an authenticated identity may do. Know which model fits which scenario.', points: ['DAC: the owner decides (team folders)', 'MAC: labels and clearances (research/classified systems)', 'RBAC: permissions attach to roles (onboarding at scale)', 'Rule-based: explicit ordered allow/deny rules', 'Time-based: access only in defined windows', 'JIT: request → approve → brief grant → auto-remove'] },
    { id: 'k6', title: 'Policies, reviews & PAM', body: 'Controls decay without maintenance. Access reviews recertify permissions; least privilege caps them; separation of duties splits them; PAM contains the powerful ones.', points: ['Access review = periodic "do you still need this?"', 'Privileged access: vault + JIT + no standing sessions', 'Windows LAPS rotates every local admin password automatically', 'Break-glass: sealed, two-person, alerted on use — and rotated after use', 'Administrative policy (written) vs logical policy (enforced) must match'] },
];
// ── MITRE references (context only) ──
const MITREF = [
    { id: 'T1078', name: 'Valid Accounts', url: 'https://attack.mitre.org/techniques/T1078/' },
    { id: 'T1550', name: 'Use Alternate Authentication Material', url: 'https://attack.mitre.org/techniques/T1550/' },
    { id: 'T1552.001', name: 'Unsecured Credentials: Credentials In Files', url: 'https://attack.mitre.org/techniques/T1552/001/' },
    { id: 'T1556', name: 'Modify Authentication Process', url: 'https://attack.mitre.org/techniques/T1556/' },
    { id: 'T1098', name: 'Account Manipulation', url: 'https://attack.mitre.org/techniques/T1098/' },
];
const MITREM = [
    { id: 'M1026', name: 'Privileged Account Management', url: 'https://attack.mitre.org/mitigations/M1026/' },
    { id: 'M1032', name: 'Multi-factor Authentication', url: 'https://attack.mitre.org/mitigations/M1032/' },
    { id: 'M1036', name: 'Account Use Policies', url: 'https://attack.mitre.org/mitigations/M1036/' },
    { id: 'M1027', name: 'Password Policies', url: 'https://attack.mitre.org/mitigations/M1027/' },
    { id: 'M1047', name: 'Audit', url: 'https://attack.mitre.org/mitigations/M1047/' },
];
function emptyEnv() {
    return {
        dossier: {}, dossierRisky: [], lifecycle: [], factors: {}, mfaPairs: [], saml: [],
        violations: [], oauth: { protocol: '', scope: '', token: '' }, review: {}, models: {},
        mfaPolicy: [],
        vault: { vaulted: false, jit: true, laps: 'never', bgSealed: false, bgAlert: false, standing: true },
        requests: {}, findings: [], fed: { samlCause: '', oauthFix: '' }, protocolPicks: {},
        rollout: [], chain: {}, best: {}, postBg: '',
    };
}
  global.ABData = { ORG, CASE_NO, ACCOUNT_TYPES, DOSSIERS_MEDIUM, DOSSIERS_HARD, RISKY_EXPECTED, LIFECYCLE_STEPS, LIFECYCLE_CANON, FACTOR_METHODS, FACTOR_EXPECT, MFA_PAIRS, MFA_PAIRS_EXPECT, SAML_STEPS, SAML_CANON, ARTIFACTS, VIOLATION_CLAIMS, VIOLATIONS_EXPECT, OAUTH_QUESTIONS, OAUTH_EXPECT, REVIEW_ROWS_MEDIUM, REVIEW_ROWS_HARD, MODEL_SCENARIOS, MODEL_LABELS, MFA_POLICY_OPTS, MFA_POLICY_EXPECT, LAPS_OPTIONS, REQUESTS, FINDING_OPTIONS, FINDINGS_EXPECT, FED_SAML_OPTS, FED_OAUTH_OPTS, PROTOCOL_SCENARIOS, ROLLOUT_STEPS, ROLLOUT_CANON, CHAIN_ROWS, CHAIN_WEAKNESSES, BEST_QS, POST_BG_OPTS, QUIZ_MEDIUM, QUIZ_HARD, GLOSSARY, KNOWLEDGE, MITREF, MITREM, emptyEnv };
})(typeof window !== 'undefined' ? window : globalThis);
