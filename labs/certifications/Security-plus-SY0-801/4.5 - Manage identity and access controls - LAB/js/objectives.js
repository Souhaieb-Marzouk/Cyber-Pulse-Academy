// ── The Access Bureau — mastery blueprint (objectives + validation) ───────
// Ported 1:1 from the original lab's src/lib/lab/objectives.ts — identical
// objective set, validation rules and educational feedback messages.
// Depends on the ABData global (js/data.js), loaded before this file.
'use strict';
(function (global) {
const { CHAIN_ROWS, DOSSIERS_HARD, DOSSIERS_MEDIUM, FINDINGS_EXPECT, LIFECYCLE_CANON, MFA_PAIRS_EXPECT, MFA_POLICY_EXPECT, MODEL_SCENARIOS, OAUTH_EXPECT, POST_BG_OPTS, PROTOCOL_SCENARIOS, REVIEW_ROWS_HARD, REVIEW_ROWS_MEDIUM, RISKY_EXPECTED, ROLLOUT_CANON, SAML_CANON, VIOLATIONS_EXPECT, } = global.ABData;
const ok = (feedback) => ({ pass: true, feedback });
const no = (feedback) => ({ pass: false, feedback });
function eqSet(selected, expected) {
    return selected.length === expected.length && expected.every((e) => selected.includes(e));
}
// ───────────────────────── MEDIUM (11) ─────────────────────────
const OBJECTIVES_MEDIUM = [
    {
        id: 'OBJ-M1', title: 'Sort the intake dossiers', pillar: 'understand', station: 'intake',
        anchor: 'CI-2 account types: user / privileged global / privileged local / service / third-party / break-glass',
        task: 'Classify all 6 dossiers at the Intake Desk with the correct account type, then press STAMP.',
        context: 'The audit starts at intake. Before you can protect access, you must know what kind of identity holds it — each account type carries different controls.',
        hints: ['Read each dossier\'s attributes: who owns it, what it can touch, whether it is human.',
            'corp-admin-kb spans the whole tenant → global; desk-wks-07 touches one machine only → local.',
            'svc_reportwriter = service; vendor_trackright = third-party; emergency-root = break-glass; j.moreau = user.'],
        validate: (env) => {
            const bad = DOSSIERS_MEDIUM.filter((d) => (env.dossier[d.id] || '') !== d.correct);
            if (bad.length === 0)
                return ok('Correct on all six. Why it matters: service accounts must never log in interactively, third-party accounts must stay time-bound, and break-glass accounts must stay sealed. A defender tags these types the moment accounts are provisioned.');
            return no(`6 dossiers, ${6 - bad.length} stamped correctly. Re-read the attribute lines of the highlighted dossiers — "authority across the tenant" vs "one machine" separates global from local privilege.`);
        },
    },
    {
        id: 'OBJ-M2', title: 'Rebuild the identity lifecycle', pillar: 'understand', station: 'intake',
        anchor: 'CI-1 provisioning/deprovisioning, joiners-movers-leavers, identity proofing, revoke-not-copy, SCIM, orphaned accounts',
        task: 'Order the 8 lifecycle steps at the Intake Desk from first to last, then press STAMP.',
        context: 'One Meridian employee joins, transfers departments, then resigns. Order the controls so access is granted correctly and dies with the identity.',
        hints: ['The story runs Joiner → Mover → Leaver. What must exist before an account can be created?',
            'Provisioning comes right after identity proofing, and role permissions replace copying from colleagues.',
            'Proof → Provision → Roles → Move review → Revoke old → Grant new → Disable → Deprovision.'],
        validate: (env) => {
            if (env.lifecycle.length !== 8)
                return no('All 8 steps must be placed in order before stamping.');
            if (eqSet(env.lifecycle, LIFECYCLE_CANON) && env.lifecycle[0] === 'proof')
                return ok('Exactly right. The sequence is the difference between managed identity and orphaned accounts: proof before provision, revoke before re-grant on a move, disable the day of departure — and SCIM automation makes it stick.');
            return no('The order is off. Remember: you cannot provision an unproven identity, and a mover\'s old permissions must be revoked before new ones are granted.');
        },
    },
    {
        id: 'OBJ-M3', title: 'Map the authentication factors', pillar: 'understand', station: 'vault',
        anchor: 'CI-3 factors know/have/are; MFA composition; TOTP, smart card, FIDO2, biometrics',
        task: 'At the Vault Room, assign each method to know / have / are, tick every combination that is TRUE MFA, then press STAMP.',
        context: 'MFA is not "two credentials" — it is two different factor categories. Miscounting factors is why "password + PIN" rollouts still get breached.',
        hints: ['KNOW = typed secrets. HAVE = something physical or enrolled. ARE = biometrics.',
            'TOTP apps, push prompts, smart cards and FIDO2 keys are all "something you have".',
            'True MFA pairs cross categories: password+TOTP, smart card+PIN, password+FIDO2. Same-category pairs are not MFA.'],
        validate: (env) => {
            const badAssign = Object.entries(env.factors).filter(([k, v]) => v);
            const wrong = Object.keys(env.factors).filter((k) => {
                const exp = { password: 'know', pin: 'know', totp: 'have', push: 'have', smartcard: 'have', fido2: 'have', fingerprint: 'are', face: 'are', iris: 'are' }[k];
                return exp && env.factors[k] !== exp;
            });
            if (wrong.length > 0)
                return no(`${wrong.length} method(s) sit in the wrong factor bucket. Have = device/token in your possession; are = biometrics; know = memorized secrets.`);
            if (badAssign.length < 9)
                return no('Assign all 9 methods to a factor before stamping.');
            if (!eqSet(env.mfaPairs, MFA_PAIRS_EXPECT))
                return no('MFA pairs: tick only combinations that span two DIFFERENT factor categories (e.g., password+PIN is still just "know").');
            return ok('All nine methods correctly bucketed and the three true-MFA pairs identified. A defender designs MFA across categories — and prefers phishing-resistant "have" factors like FIDO2 for privileged users.');
        },
    },
    {
        id: 'OBJ-M4', title: 'Replay the SAML handshake', pillar: 'understand', station: 'protocol',
        anchor: 'CI-4 SAML assertions, IdP vs SP/relying party, browser SSO flow',
        task: 'At the Protocol Desk, rebuild the 6-step SAML federation flow in the correct order and press STAMP.',
        context: 'MeridianID must trust the TrackRight vendor portal. Order the messages so you can see exactly where trust travels — and where it can break.',
        hints: ['Start with the user asking the service provider for access; the SP does not authenticate anyone itself.',
            'The IdP only speaks AFTER the SP has redirected the user there with an AuthnRequest.',
            'User→SP, SP→IdP, user authenticates at IdP, IdP issues signed assertion, POST to ACS, SP validates & opens session.'],
        validate: (env) => {
            if (env.saml.length !== 6)
                return no('Place all 6 steps before stamping.');
            if (eqSet(env.saml, SAML_CANON))
                return ok('Flawless replay. Note the division of trust: the IdP authenticates and signs; the SP only validates audience, signature and time window. Any of those three failing is exactly what OBJ-H3 will make you diagnose.');
            return no('Sequence broken. The service provider never authenticates the user directly — it delegates to the IdP via a redirect, then consumes a signed assertion.');
        },
    },
    {
        id: 'OBJ-M5', title: 'Hunt the IAM violations', pillar: 'recognize', station: 'evidence',
        anchor: 'CI-8 evidence application: plain LDAP, unsecured credentials, service-account misuse, OAuth-as-auth (+ red herrings)',
        task: 'In the Evidence Locker, tick the 4 statements that describe REAL identity & access findings (ignore the red herrings) and press STAMP.',
        context: 'The locker holds auth logs, scripts, a consent screen and memos. Four findings matter for the identity audit; the rest are noise or perfectly normal.',
        hints: ['Read the auth.log lines for svc_backup and the backup script together — they tell one story.',
            'Which claims are actually explained by another artifact (the HR rota memo, the network team ticket)?',
            'Findings: plain LDAP :389, cleartext password in script, interactive logon by a service account, OAuth used for sign-in.'],
        validate: (env) => {
            if (eqSet(env.violations, VIOLATIONS_EXPECT))
                return ok('Four for four. Each finding maps to a fix: force LDAPS/StartTLS, move the secret into the vault, forbid interactive logons for service identities, and replace OAuth-as-login with OIDC. The 03:00 VPN was cleared by the HR rota — a lesson in reading context before judging.');
            return no('Not the right four. Distractors here: the HR memo clears the night-shift VPN, the scanner TLS banner is a network ticket, a managed password is good practice, and one backup-code use is normal recovery. Look again at svc_backup\'s evidence.');
        },
    },
    {
        id: 'OBJ-M6', title: 'Repair the consent flow', pillar: 'recognize', station: 'protocol',
        anchor: 'CI-4 OAuth 2.0 scopes/tokens/consent vs OIDC; least privilege scope; token expiry',
        task: 'At the Protocol Desk, fix all three dials of the InvoiceMailPro flow (protocol, scope, token behavior) and press STAMP.',
        context: 'InvoiceMailPro asks for a never-expiring, write-everything token and calls it "sign-in". Three separate decisions make this a real login instead of a breach.',
        hints: ['OAuth answers "what may this app do?" — which protocol answers "who is the user?"',
            'Least privilege for a mail-summary app: read current mail only — never readwrite over the whole mailbox.',
            'OIDC + narrowly scoped read + short-lived, revocable token.'],
        validate: (env) => {
            const wrong = [];
            if (env.oauth.protocol !== OAUTH_EXPECT.protocol)
                wrong.push('protocol');
            if (env.oauth.scope !== OAUTH_EXPECT.scope)
                wrong.push('scope');
            if (env.oauth.token !== OAUTH_EXPECT.token)
                wrong.push('token');
            if (wrong.length === 0)
                return ok('All three dials correct. OIDC adds the missing authentication layer; the scope now follows least privilege; the token expires and can be revoked. Consent plus least privilege is what stops one click from becoming a mailbox breach.');
            return no(`Near-miss on: ${wrong.join(', ')}. Remember — OAuth authorizes, OIDC authenticates; scopes grant the minimum; tokens must be short-lived and revocable.`);
        },
    },
    {
        id: 'OBJ-M7', title: 'Run the recertification ledger', pillar: 'detect', station: 'board',
        anchor: 'CI-1/CI-6 access review, orphaned accounts, privilege creep, unused third-party access, JIT conversion',
        task: 'At the Review Board, rule keep / revoke / convert-to-JIT on all 7 entitlement rows and press STAMP.',
        context: 'This is the recertification ledger the external auditor will read. Every row needs a defensible decision.',
        hints: ['Three rows hide the classic failures: an orphaned leaver, a mover\'s leftover CRM rights, and a dormant vendor admin.',
            'Entitlements that match the current job and are scoped correctly get KEEP.',
            'm.chen needs elevation only occasionally — that is what JIT is for, not standing Domain Admin.'],
        validate: (env) => {
            const wrong = REVIEW_ROWS_MEDIUM.filter((r) => (env.review[r.id] || '') !== r.expect);
            if (wrong.length === 0)
                return ok('Ledger clean. You caught the orphaned account (deprovisioning failed), the privilege creep (mover\'s leftover rights) and the dormant vendor admin; kept correctly-scoped access; and converted standing privilege to JIT. This is exactly what auditors sample.');
            return no(`${7 - wrong.length}/7 rows correct. Revisit: ${wrong.map((w) => w.who).join(', ')}. Ask per row — is the entitlement still tied to the current role, still used, still scoped?`);
        },
    },
    {
        id: 'OBJ-M8', title: 'Match the access models', pillar: 'detect', station: 'board',
        anchor: 'CI-5 DAC / MAC / RBAC / rule-based / time-based / JIT',
        task: 'At the Review Board, name the correct access-control model for all 6 scenario cards and press STAMP.',
        context: 'Six Meridian teams, six different risks. The model you pick determines who can change access later — and that is the whole point.',
        hints: ['Ask: WHO decides access? The owner (DAC), the system via labels (MAC), a role assignment (RBAC), or ordered rules?',
            'Windows of time point to time-based; short, approved, auto-expiring bursts point to JIT.',
            'Labels→MAC, owner→DAC, job roles→RBAC, ordered allow/deny→rule-based, opening hours→time-based, incident bursts→JIT.'],
        validate: (env) => {
            const wrong = MODEL_SCENARIOS.filter((m) => (env.models[m.id] || '') !== m.expect);
            if (wrong.length === 0)
                return ok('Six for six. You can now justify model choice: MAC when users must never decide, DAC for owner-managed collaboration, RBAC for joiner automation, rules for explicit policy, time windows for physical/partial access, JIT for the highest-risk bursts.');
            return no(`${6 - wrong.length}/6 matched. The giveaway question is "who can change the decision later" — owner (DAC), system labels (MAC), role template (RBAC), admin rules (rule-based).`);
        },
    },
    {
        id: 'OBJ-M9', title: 'Set the MFA policy', pillar: 'mitigate', station: 'vault',
        anchor: 'CI-3 MFA rollout choices: TOTP vs HOTP vs SMS, backup codes, passkeys for privileged users, biometric fallback',
        task: 'At the Vault Room, tick exactly the 4 policy options that belong in a sound MFA rollout and press STAMP.',
        context: 'The CISO wants MFA everywhere without locking out the warehouse. Choose the four options a defender would actually sign.',
        hints: ['Two options are traps: one is the most-phished channel in existence, the other drifts out of sync at scale.',
            'SMS as primary is a classic weakness; HOTP counters drift — TOTP is the app standard.',
            'Keep: TOTP apps, offline backup codes, passkeys for privileged accounts, biometrics with PIN fallback.'],
        validate: (env) => {
            if (eqSet(env.mfaPolicy, MFA_POLICY_EXPECT))
                return ok('Policy signed. TOTP beats HOTP (no counter drift) and SMS (no SIM-swap); backup codes make recovery safe; passkeys give privileged users phishing resistance; biometrics with PIN fallback fit shared devices. Residual risk to log: MFA-fatigue push prompts.');
            return no('Wrong mix. Reject SMS-as-primary and HOTP-as-standard; a defender keeps TOTP apps, offline backup codes, passkeys for the privileged, and biometrics with a PIN fallback.');
        },
    },
    {
        id: 'OBJ-M10', title: 'Harden the PAM vault', pillar: 'mitigate', station: 'vault',
        anchor: 'CI-7 vaulting, JIT elevation, no standing privilege, Windows LAPS rotation, break-glass sealing + alerting',
        task: 'At the Vault Room, configure every PAM control to its correct state and press STAMP.',
        context: 'svc_backup\'s cleartext password and corp-admin-kb\'s standing sessions are on the risk register. Time to configure the vault so neither can happen again.',
        hints: ['Standing privilege is the enemy — the two "on" switches are vaulting and JIT.',
            'Local admin passwords that never rotate is exactly what Windows LAPS fixes — pick the shortest sane rotation.',
            'Vault ON, JIT ON, standing OFF, LAPS 7 days, break-glass sealed AND alerted.'],
        validate: (env) => {
            const v = env.vault;
            const good = v.vaulted && v.jit && !v.standing && v.laps === '7' && v.bgSealed && v.bgAlert;
            if (good)
                return ok('Vault hardened. Credentials are brokered, privilege is just-in-time, local admin passwords rotate every 7 days via LAPS, and the break-glass envelope is sealed with alerting — that turns "who knows the admin password?" into an auditable workflow.');
            return no('The vault is not yet safe. Required state: vaulting ON, JIT ON, standing privilege OFF, LAPS rotating every 7 days, break-glass sealed AND alerted.');
        },
    },
    {
        id: 'OBJ-M11', title: 'Rule on the access requests', pillar: 'mitigate', station: 'board',
        anchor: 'CI-5/CI-6/CI-7 applied: SoD conflict, JIT vendor, time-based auditor, RBAC joiner, shared credential refusal',
        task: 'At the Review Board, approve or deny all 5 pending requests and press STAMP.',
        context: 'Five requests are waiting for the duty officer. Approve what a defender would sign; deny what an attacker would love.',
        hints: ['Two requests are traps: one breaks a fraud-control principle inside the ERP, the other resurrects the svc_backup problem.',
            'The auditor and the new payroll clerk both follow textbook patterns — scoped, time-boxed, role-based.',
            'Vendor wants standing global admin? JIT instead. Payments initiator + approver in one identity? Never.'],
        validate: (env) => {
            const wrong = [{ id: 'q-vendor', e: 'deny' }, { id: 'q-dev', e: 'deny' }, { id: 'q-audit', e: 'approve' }, { id: 'q-new', e: 'approve' }, { id: 'q-chat', e: 'deny' }].filter((r) => (env.requests[r.id] || '') !== r.e);
            if (wrong.length === 0)
                return ok('All five rulings defensible. You enforced separation of duties, replaced a standing vendor grant with JIT, time-boxed the auditor, followed the RBAC joiner path, and refused to let a shared service credential live in chat. Every deny must come with the offer of the safer path.');
            return no(`${5 - wrong.length}/5 correct. Re-check: ${wrong.map((w) => w.id.replace('q-', '')).join(', ')} — deny grants that break SoD or create standing/shared access; approve scoped, time-boxed, role-based ones.`);
        },
    },
];
// ───────────────────────── HARD (9) ─────────────────────────
const OBJECTIVES_HARD = [
    {
        id: 'OBJ-H1', title: 'Triage the noisy intake', pillar: 'recognize', station: 'intake',
        anchor: 'CI-2 account types under noise + risk ranking (CI-1)',
        task: 'Classify all 9 dossiers exactly, and flag the 3 identities that pose the highest audit risk. Stamp when both are exact.',
        context: 'Nine files, no guidance. Three of them will keep the auditor awake; the rest are healthy.',
        hints: ['One nudge: risk concentrates where blast radius is tenant-wide, where credentials live outside the vault, and where access crosses an organizational boundary.'],
        validate: (env) => {
            const badClass = DOSSIERS_HARD.filter((d) => (env.dossier[d.id] || '') !== d.correct);
            const riskyOk = eqSet(env.dossierRisky, RISKY_EXPECTED);
            if (badClass.length === 0 && riskyOk)
                return ok('Exact triage. All nine typed correctly; the global admin, the unvaulted service account and the third-party identity flagged. Near-misses like the JIT helpdesk technician or the CFO\'s sealed vault account are controlled by design — that is the difference between risk and hygiene.');
            if (badClass.length > 0)
                return no(`${badClass.map((b) => b.login).join(', ')} misclassified. Read the attribute lines literally: JIT elevation ≠ standing privilege; a vaulted unused admin account is not a user account of its own.`);
            return no('Classification is right but the riskiest three are not. Rejected near-misses: break-glass is risky but sealed and alerted; ci-deploy-bot is scoped with short-lived tokens; m.chen has no standing rights.');
        },
    },
    {
        id: 'OBJ-H2', title: 'Investigate svc_ftpbridge', pillar: 'recognize', station: 'evidence',
        anchor: 'CI-8: unsecured credentials, plain LDAP, service-account misuse, rotation policy, scope analysis',
        task: 'In the Evidence Locker, select exactly the 5 findings that make svc_ftpbridge a compromised identity. Stamp when the set is exact.',
        context: 'A file-transfer service account was seen on a jump host at 02:00. Assemble the full picture from logs, the deploy script and the credential age report.',
        hints: ['One nudge: two findings live in the log, one in the script, one in the age report, one in the entitlements export.'],
        validate: (env) => {
            if (eqSet(env.findings, FINDINGS_EXPECT))
                return ok('Complete picture: unencrypted binds, an embedded secret, interactive service logons, a 400-day-old credential, and write access to every share. Each finding is a distinct ATT&CK-style foothold — T1552.001 for the file secret alone. Next move: disable, rotate everywhere, scope to two folders, force LDAPS.');
            const sel = env.findings;
            if (sel.includes('TLS_SCANNER') || sel.includes('NIGHT_VPN') || sel.includes('TOTP_NORMAL'))
                return no('Rejected: the scanner TLS banner is a network ticket (#8841), the 03:00 VPN is cleared by the HR rota, and healthy TOTP logins are not findings. svc_ftpbridge\'s own evidence is untouched.');
            return no(`${sel.length}/5 selected. The set must span: bind encryption, embedded secret, interactive logon, credential age, entitlement scope. Check the artifacts again.`);
        },
    },
    {
        id: 'OBJ-H3', title: 'Diagnose the broken federation', pillar: 'detect', station: 'protocol',
        anchor: 'CI-4: SAML audience/entity-ID validation, OAuth-is-not-authentication, OIDC as the fix',
        task: 'At the Protocol Desk: name the exact SAML failure cause and the correct OAuth mis-use verdict. Both answers must be exact to stamp.',
        context: 'Two production incidents in one morning: partner SSO is rejecting assertions, and users are "signing in" through an OAuth consent screen.',
        hints: ['One nudge: read the trace line where the SP states what audience it expects, then compare it to the assertion.'],
        validate: (env) => {
            const samlOk = env.fed.samlCause === 'AUDIENCE_MISMATCH';
            const oauthOk = env.fed.oauthFix === 'fix-oidc';
            if (samlOk && oauthOk)
                return ok('Both diagnosed. The assertion\'s <Audience> no longer matches the SP\'s entity ID (partner renamed it) — so every assertion is denied as Requester. And OAuth was doing authentication work it was never designed for: the app needs OIDC and an ID token.');
            if (!samlOk && oauthOk)
                return no('SAML cause near-miss. Signature and clock skew would show different SP status codes; here the log literally prints the expected vs received audience. It is an audience/entity-ID mismatch.');
            if (samlOk && !oauthOk)
                return no('OAuth verdict near-miss. OAuth tokens authorize scopes — they never assert who the user is. The fix is an authentication layer: OIDC.');
            return no('Both answers are off. The trace names the audience mismatch; the consent screen is OAuth doing authentication it cannot do.');
        },
    },
    {
        id: 'OBJ-H4', title: 'Select protocols like an architect', pillar: 'mitigate', station: 'protocol',
        anchor: 'CI-4/CI-5: SAML vs OIDC vs LDAPS vs Kerberos scenario mapping',
        task: 'Assign the correct protocol to all 4 integration scenarios. All four must be exact to stamp.',
        context: 'Four projects, four trust boundaries. One wrong protocol means an audit finding or a rewrite.',
        hints: ['One nudge: browser + partner IdP is the SAML sweet spot; anything touching a phone wants OIDC; Kerberos never leaves the domain.'],
        validate: (env) => {
            const wrong = PROTOCOL_SCENARIOS.filter((p) => (env.protocolPicks[p.id] || '') !== p.expect);
            if (wrong.length === 0)
                return ok('Architect-grade. SAML for cross-org browser SSO, OIDC for app/API, LDAPS for directory lookups (never plain :389), Kerberos inside the AD domain. The rejected near-misses matter too: plain LDAP is an audit finding, SAML does not fit mobile flows.');
            return no(`${4 - wrong.length}/4 exact. Rejected: plain LDAP is a finding, SAML is browser-SSO not mobile-API, Kerberos does not cross to phones or clouds. Think: browser cross-org → SAML; app/API → OIDC; directory → LDAPS; AD-internal → Kerberos.`);
        },
    },
    {
        id: 'OBJ-H5', title: 'Sequence the MFA rollout', pillar: 'mitigate', station: 'vault',
        anchor: 'CI-3: rollout ordering, phishing-resistant pick for privileged users, exemptions monitoring',
        task: 'Order the 6 rollout steps exactly and stamp. The order encodes risk-first thinking.',
        context: 'The CISO signed your MFA policy (OBJ-M9). Now sequence the rollout so the riskiest identities are covered first and the project survives contact with the warehouse floor.',
        hints: ['One nudge: you cannot enforce what you have not piloted, and you cannot pilot what you have not inventoried.'],
        validate: (env) => {
            if (env.rollout.length !== 6)
                return no('All 6 steps must be sequenced.');
            if (eqSet(env.rollout, ROLLOUT_CANON))
                return ok('Risk-first sequence confirmed: inventory gaps, protect the privileged with passkeys, baseline TOTP, backup codes, pilot, enforce with exemption monitoring. Skipping the pilot is how MFA rollouts get rolled back.');
            return no('Order rejected. Correct shape: inventory → privileged-first (passkeys/FIDO2) → TOTP baseline → backup codes → pilot → enforce & monitor exemptions.');
        },
    },
    {
        id: 'OBJ-H6', title: 'Rule the full recertification', pillar: 'detect', station: 'board',
        anchor: 'CI-1/CI-5/CI-6: orphaned, creep, dormant vendor, over-scoped service identity, JIT conversion',
        task: 'Rule keep / revoke / convert-to-JIT on all 10 ledger rows. The mapping must be exact — near-misses are rejected.',
        context: 'The full estate export. Ten rows, four decisions to revoke, one to convert, five to keep.',
        hints: ['One nudge: the CFO\'s vaulted credential is controlled by design — do not punish good hygiene; and svc_ftpbridge needs two folders, not the estate.'],
        validate: (env) => {
            const wrong = REVIEW_ROWS_HARD.filter((r) => (env.review[r.id] || '') !== r.expect);
            if (wrong.length === 0)
                return ok('Ten exact rulings. You removed the orphan, the creep, the dormant vendor admin and the over-scoped service identity; converted standing Domain Admin to JIT; and kept every scoped, used, or deliberately-sealed entitlement. This ledger would survive an external audit.');
            return no(`${10 - wrong.length}/10 exact. Re-examine ${wrong.map((w) => w.who).join(', ')}. The sealed CFO credential is proper PAM hygiene (keep); the file-transfer account with estate-wide write is not scope (revoke).`);
        },
    },
    {
        id: 'OBJ-H7', title: 'Lock the vault, then the break-glass', pillar: 'mitigate', station: 'vault',
        anchor: 'CI-7: exact PAM state + post-break-glass procedure (rotation + log review)',
        task: 'Set the vault to its exact safe state AND choose the correct post-use procedure for the break-glass account. Stamp when both are exact.',
        context: 'Last night\'s outage forced emergency-root out of its envelope. Configure the vault so standing privilege cannot return, and close out the break-glass use correctly.',
        hints: ['One nudge: the safe state has exactly two switches ON — and one of them must never stay ON is standing privilege.'],
        validate: (env) => {
            const v = env.vault;
            const stateOk = v.vaulted && v.jit && !v.standing && v.laps === '7' && v.bgSealed && v.bgAlert;
            const postOk = env.postBg === POST_BG_OPTS[0].id;
            if (stateOk && postOk)
                return ok('Exact state, exact procedure. Vault + JIT on, standing off, 7-day LAPS, break-glass re-sealed with alerting — and after use: rotate the credential, review the logs, report why normal administration failed. That closes the loop an attacker would otherwise reuse.');
            if (!stateOk)
                return no('Vault state is not the safe one: vaulting ON, JIT ON, standing privilege OFF, LAPS 7 days, break-glass sealed AND alerted.');
            return no('State is right but the close-out is wrong: a used break-glass credential must be rotated and its usage reviewed — "self-resealing" is not a control.');
        },
    },
    {
        id: 'OBJ-H8', title: 'Map the chain to its weaknesses', pillar: 'recognize', station: 'board',
        anchor: 'CI-3/CI-4/CI-7: attack-chain → IAM-weakness mapping (spray, consent phishing, static secrets, standing privilege)',
        task: 'At the Review Board, pair each of the 4 attacker steps with the exact IAM weakness that enabled it. All four must be exact.',
        context: 'The incident report reads top-down. Your job is to read it bottom-up: which identity weakness opened each door?',
        hints: ['One nudge: two distractors (plain LDAP, orphaned accounts) are real findings elsewhere but opened NO door in this chain.'],
        validate: (env) => {
            const wrong = CHAIN_ROWS.filter((r) => (env.chain[r.id] || '') !== r.expect);
            if (wrong.length === 0)
                return ok('Chain fully attributed: no-MFA accounts fell to spraying, broad consent let the app in without a password, a static unvaulted secret surrendered the service identity, and standing global admin turned one account into the tenant. Each weakness has a control: MFA/passkeys, consent governance, vaulting, JIT.');
            return no(`${4 - wrong.length}/4 exact. Plain LDAP and orphaned accounts are findings in this estate but did NOT enable these four steps — resist mapping what you saw elsewhere.`);
        },
    },
    {
        id: 'OBJ-H9', title: 'Argue the best control', pillar: 'mitigate', station: 'board',
        anchor: 'CI-8: BEST-control evaluation under trade-offs (phishing, standing privilege, vendor access, trust rollover)',
        task: 'Choose the BEST control for all 4 evaluation cards. All four must be exact to stamp.',
        context: 'Four closed questions from the audit committee. Only one option per card is defensible; the others are plausible wastes of money.',
        hints: ['One nudge: "BEST" here means removes the weakness class, not patches one instance — training never beats cryptography for phishing.'],
        validate: (env) => {
            const wrong = ['b1', 'b2', 'b3', 'b4'].filter((id) => {
                const q = { b1: 'fido', b2: 'jit', b3: 'time', b4: 'meta' };
                return (env.best[id] || '') !== q[id];
            });
            if (wrong.length === 0)
                return ok('All four defensible: passkeys remove phishing as a class; JIT removes standing privilege; time-boxed scoped roles match vendor reality; and a broken trust is fixed by updating federation metadata — not by resetting the world.');
            return no(`${4 - wrong.length}/4 exact. Remember the committee\'s rule: the BEST control eliminates the weakness class. Awareness training does not stop code phishing; audits do not remove standing privilege; permanent accounts do not fit 6-week projects.`);
        },
    },
    {
        id: 'OBJ-H10', title: 'Sequence the lifecycle under pressure', pillar: 'understand', station: 'intake',
        anchor: 'CI-1 lifecycle ordering under hard conditions: proof, provision, revoke-not-copy, disable, deprovision',
        task: 'At the Intake Desk, order the 8 lifecycle steps exactly — first stamp to last. No partial credit.',
        context: 'Hard mode gives you no phase guidance beyond the labels themselves. The order is the control chain: every misplacement creates an orphan or a privilege leak.',
        hints: ['One nudge: proof precedes provisioning, a mover revokes before re-granting, and a leaver is disabled the day they walk out.'],
        validate: (env) => {
            if (env.lifecycle.length !== 8)
                return no('All 8 steps must be placed in order before stamping.');
            if (eqSet(env.lifecycle, LIFECYCLE_CANON) && env.lifecycle[0] === 'proof')
                return ok('Exact sequence under pressure. Proof → provision → role template → move review → revoke old → grant new → disable → deprovision. In hard mode there is no partial credit because a single broken link is all an attacker needs.');
            return no('Sequence rejected. Anchor on the three phases: nothing is provisioned before proofing, a mover loses the old entitlement before gaining the new one, and a leaver is disabled on departure day.');
        },
    },
];
function objectivesFor(mode) {
    return mode === 'medium' ? OBJECTIVES_MEDIUM : OBJECTIVES_HARD;
}
  global.ABObjectives = { OBJECTIVES_MEDIUM, OBJECTIVES_HARD, objectivesFor };
})(typeof window !== 'undefined' ? window : globalThis);
