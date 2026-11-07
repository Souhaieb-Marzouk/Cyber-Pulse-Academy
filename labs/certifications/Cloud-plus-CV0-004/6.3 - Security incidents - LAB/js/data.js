// ── Exercise CLOUDBURST · synthetic data core (verbatim) ─
// Ported 1:1 from the framework lab (src/lib/lab). Content, wording, answers,
// hints and validation logic are unchanged. Plain classic script (no modules)
// so the lab also runs from file:// after extraction.

// ── Exercise CLOUDBURST · synthetic data core ────────────────────────────────
// TRAINING DATA: every org, person, account, key, IP and event below is
// fictional. IPs use RFC 5737 documentation ranges. Event names are AWS-style,
// used because MITRE's own analytics for these techniques cite them; the
// behaviors apply to any IaaS provider (simplified).
const INCIDENT = {
    callSign: "CLOUDBURST",
    record: "IR-114 “Leaky Pipeline”",
    org: "Stratus Ledger Inc.",
    orgDesc: "fintech SaaS — payments reconciliation platform",
    date: "2026-11-03",
    declaredAt: "16:02 UTC",
    actor: "ZEPHYR COLLECTIVE (fictional training actor)",
    leakedKey: "SFAPG7K3Q9M2XZ41B6TD",
    backupKey: "SFBKP9M2QX4T8VLN7CED",
    attackerUser: "deploy-helper-2",
    attackerUserKey: "SFOBS4LV8QPN2T6EA3KJ",
    attackerIp: "203.0.113.87",
    policy: "BillingFullAccess",
    bucket: "sl-financial-exports-prod",
    supportBot: "support-bot", // only appears if Hard-mode clock outruns you
};
const USERS = [
    {
        id: "svc-billing-ci",
        label: "svc-billing-ci",
        kind: "service",
        policies: ["BillingDeployPolicy"],
        mfa: false,
    },
    {
        id: "dana.whitfield",
        label: "Dana Whitfield · billing engineer",
        kind: "human",
        policies: ["BillingEngineer"],
        mfa: true,
    },
    {
        id: "marcus.osei",
        label: "Marcus Osei · platform admin",
        kind: "human",
        policies: ["PlatformAdmin"],
        mfa: true,
    },
    {
        id: "ci-runner-ops",
        label: "ci-runner-ops",
        kind: "service",
        policies: ["OpsBuildPolicy"],
        mfa: false,
    },
    {
        id: INCIDENT.attackerUser,
        label: "deploy-helper-2",
        kind: "attacker-created",
        policies: ["BillingFullAccess"],
        mfa: false,
        createdByAttacker: true,
    },
];
const KEYS = [
    { id: INCIDENT.leakedKey, of: "svc-billing-ci", created: "2026-08-14", lastUsed: "2026-11-03 15:58 (new)" },
    { id: INCIDENT.backupKey, of: "svc-billing-ci", created: "2026-11-03 15:03 (new)", lastUsed: "2026-11-03 15:03", createdByAttacker: true },
    { id: "SFDNW5C2K8RQ1M7XT3VB", of: "dana.whitfield", created: "2026-09-02", lastUsed: "2026-11-03 13:40" },
    { id: "SFMOS1Z7Q4NV6K2X8PLD", of: "marcus.osei", created: "2026-06-11", lastUsed: "2026-11-03 17:05" },
    { id: INCIDENT.attackerUserKey, of: INCIDENT.attackerUser, created: "2026-11-03 15:11 (new)", lastUsed: "2026-11-03 15:58", createdByAttacker: true },
];
const POLICIES = {
    BillingDeployPolicy: {
        name: "BillingDeployPolicy",
        permissions: [
            "deploy:UpdateService (billing-service)",
            "objectstorage:PutObject on sl-billing-exports-dev/*",
            "iam:CreateUser",
            "iam:CreateAccessKey",
            "iam:AttachUserPolicy",
        ],
        note: "⚠ OVER-PRIVILEGED: the three iam: permissions let this CI account mint users, keys and grant policies — far beyond a deployment job (least-privilege violation).",
    },
    BillingEngineer: {
        name: "BillingEngineer",
        permissions: ["objectstorage:GetObject/PutObject on sl-billing-exports-dev/*", "deploy:ReadStatus"],
    },
    PlatformAdmin: {
        name: "PlatformAdmin",
        permissions: ["iam:* (tenant-wide)", "objectstorage:*", "audit:Read"],
        note: "Break-glass admin role — 2 holders, MFA enforced.",
    },
    OpsBuildPolicy: {
        name: "OpsBuildPolicy",
        permissions: ["build:StartBuild", "artifact:Push"],
    },
    [INCIDENT.policy]: {
        name: INCIDENT.policy,
        permissions: [
            "objectstorage:GetObject on sl-financial-exports-prod/*",
            "objectstorage:ListObjects on sl-financial-exports-prod",
            "sts:AssumeRole on PayrollExportRole",
        ],
        note: "Broad financial-exports read access + payroll role assumption — intended for a retired reporting pipeline, never cleaned up.",
    },
};
const E = (id, t, event, principal, ip, resource, tag, note) => ({ id, t, event, principal, ip, resource, tag, note });
const EVENTS = [
    E("ev-01", "09:41:12", "GitEvent: commit 9f31c2a pushed", "dana.whitfield", "198.51.100.14", "repo stratus-ledger/billing-service · PUBLIC · file config/billing-service.env", "attack", "Commit added config/billing-service.env containing access key SFAPG7K3Q9M2XZ41B6TD — the leak (T1552.001). Captured by repo webhook, not an audit-trail action."),
    E("ev-02", "11:58:40", "StartBuild", "ci-runner-ops", "10.24.8.11", "billing-service #2271", "benign"),
    E("ev-03", "12:07:03", "SECRET_SCAN_MATCH raised", "repo-guard", "—", "stratus-ledger/billing-service · commit 9f31c2a", "attack", "RepoGuard matched an access-key pattern; ticket auto-filed to the low-priority queue and never triaged (missed signal)."),
    E("ev-04", "14:52:19", "ListBuckets", "svc-billing-ci (key SFAPG7K3…)", INCIDENT.attackerIp, "16 buckets listed", "attack", "FIRST use of the leaked key. New source IP, user-agent “sf-curl/8.4” — never seen for this principal."),
    E("ev-05", "14:53:02", "DescribeInstances", "svc-billing-ci (key SFAPG7K3…)", INCIDENT.attackerIp, "billing VPC · 23 instances", "attack", "Reconnaissance with a valid account (T1078.004)."),
    E("ev-06", "15:03:47", "CreateAccessKey", "svc-billing-ci (key SFAPG7K3…)", INCIDENT.attackerIp, "for svc-billing-ci → SFBKP9M2QX4T8VLN7CED", "attack", "Backup credential in case the leaked key is deactivated (T1098.001)."),
    E("ev-07", "15:11:08", "CreateUser", "svc-billing-ci (key SFAPG7K3…)", INCIDENT.attackerIp, "user deploy-helper-2", "attack", "New cloud account for persistence (T1136.003)."),
    E("ev-08", "15:11:09", "CreateAccessKey", "svc-billing-ci (key SFAPG7K3…)", INCIDENT.attackerIp, "for deploy-helper-2 → SFOBS4LV8QPN2T6EA3KJ", "attack"),
    E("ev-09", "15:14:31", "AttachUserPolicy", "svc-billing-ci (key SFAPG7K3…)", INCIDENT.attackerIp, "policy BillingFullAccess → deploy-helper-2", "attack", "Privilege escalation via IAM policy attachment (T1098.003)."),
    E("ev-10", "15:22:44", "ListObjects", "deploy-helper-2 (key SFOBS4…)", INCIDENT.attackerIp, "sl-financial-exports-prod · 1,904 objects", "attack"),
    E("ev-11", "15:26:10", "GetObject ×412 (aggregate)", "deploy-helper-2 (key SFOBS4…)", INCIDENT.attackerIp, "sl-financial-exports-prod/* · 6.1 GB read", "attack", "Collection from cloud storage with the escalated account (T1530). Last event 15:58:52."),
    E("ev-12", "16:02:15", "ANOMALY object-access-spike", "skysentry", "—", "new principal deploy-helper-2 · 412 reads in 36 min", "attack", "Behavior analytics fired; incident IR-114 declared. You take over here."),
    E("ev-13", "13:40:26", "RotateSSHKey", "dana.whitfield", "198.51.100.14", "self · routine rotation", "benign"),
    E("ev-14", "14:10:55", "UpdatePolicy", "marcus.osei", "198.51.100.31", "docs-readme-policy · typo fix", "benign"),
    E("ev-15", "16:40:03", "StartBuild", "ci-runner-ops", "10.24.8.11", "billing-service #2272", "benign"),
    E("ev-16", "16:44:37", "GetObject", "dana.whitfield", "198.51.100.14", "sl-billing-exports-dev/recon-2026-11.csv", "benign"),
];
const EVENTS_HARD_EXTRA = [
    E("ev-H1", "11:30:04", "VpnAuthFail ×218 (aggregate)", "vpn-gw", "198.51.100.23", "no account locked; all attempts failed", "noise", "Brute-force burst against the VPN gateway — unrelated to the cloud identity plane; rate-blocked at 11:41."),
    E("ev-H2", "08:15:39", "TlsHandshakeReject ×44 (aggregate)", "dev-lb-02", "—", "legacy TLS_RSA ciphers rejected", "noise", "Cipher-suite deprecation hygiene issue on a dev load balancer (exam sub-bullet — but not this incident)."),
    E("ev-H3", "15:59:30", "EgressMetric Δ", "billing-vpc", "—", "+6.1 GB outbound to 203.0.113.87", "noise", "Corroborates the GetObject burst."),
    E("ev-H4", "17:05:12", "ConsoleLogin (MFA ok)", "marcus.osei", "198.51.100.31", "console sign-in", "benign"),
    E("ev-H5", "17:12:00", "StartBuild", "ci-runner-ops", "10.24.8.11", "payments-api #815", "benign"),
];
/** Hard mode “live” events — revealed one per clock advance until contained. */
const EVENTS_LIVE = [
    E("ev-L1", "16:14:40", "ListObjects", "deploy-helper-2 (key SFOBS4…)", INCIDENT.attackerIp, "sl-hr-docs · 512 objects", "live", "The attacker is still active — scoping the next bucket. Containment is overdue."),
    E("ev-L2", "16:24:02", "CreateUser", "svc-billing-ci (key SFAPG7K3…)", INCIDENT.attackerIp, "user support-bot", "live", "A SECOND persistence account was planted because containment did not happen. Eradication now must clean this too."),
];
const ALERTS = {
    medium: [
        {
            id: "A-4471",
            sev: "HIGH",
            title: "Secret detected in PUBLIC repository",
            body: "RepoGuard matched an access-key pattern in stratus-ledger/billing-service, file config/billing-service.env, commit 9f31c2a (pushed 09:41 UTC). Key material: SFAPG7K3…XZ41B6TD. Repo is world-readable. Auto-ticket was filed 12:07 UTC and remains untriaged.",
            source: "RepoGuard secret scanning",
            related: true,
        },
        {
            id: "A-4472",
            sev: "MEDIUM",
            title: "Object access spike from new principal",
            body: "Principal deploy-helper-2 (created 15:11 UTC) read 412 objects / 6.1 GB from sl-financial-exports-prod in 36 minutes. Baseline for this principal: none. Source IP 203.0.113.87 is outside corporate ranges.",
            source: "SkySentry behavior analytics",
            related: true,
        },
        {
            id: "A-4473",
            sev: "LOW",
            title: "TLS cipher suite deprecation — dev-lb-02",
            body: "dev load balancer still offers TLS_RSA_WITH_3DES_EDE_CBC_SHA. Hygiene backlog item; no exploitation observed.",
            source: "Edge posture scanner",
            related: false,
        },
        {
            id: "A-4474",
            sev: "MEDIUM",
            title: "VPN authentication burst — 218 failures",
            body: "218 failed logins against vpn-gw from 198.51.100.23 between 11:30–11:41 UTC. Zero successes; source rate-blocked. No cloud audit-trail events from this IP.",
            source: "VPN gateway IDS",
            related: false,
        },
    ],
    hard: [
        {
            id: "A-4471",
            sev: "HIGH",
            title: "Secret detected in PUBLIC repository",
            body: "RepoGuard matched an access-key pattern in stratus-ledger/billing-service, file config/billing-service.env, commit 9f31c2a (pushed 09:41 UTC). Key material: SFAPG7K3…XZ41B6TD. Repo is world-readable. Auto-ticket was filed 12:07 UTC and remains untriaged.",
            source: "RepoGuard secret scanning",
            related: true,
        },
        {
            id: "A-4472",
            sev: "MEDIUM",
            title: "Object access spike from new principal",
            body: "Principal deploy-helper-2 (created 15:11 UTC) read 412 objects / 6.1 GB from sl-financial-exports-prod in 36 minutes. Baseline for this principal: none. Source IP 203.0.113.87 is outside corporate ranges.",
            source: "SkySentry behavior analytics",
            related: true,
        },
        {
            id: "A-4473",
            sev: "LOW",
            title: "TLS cipher suite deprecation — dev-lb-02",
            body: "dev load balancer still offers TLS_RSA_WITH_3DES_EDE_CBC_SHA. Hygiene backlog item; no exploitation observed.",
            source: "Edge posture scanner",
            related: false,
        },
        {
            id: "A-4474",
            sev: "MEDIUM",
            title: "VPN authentication burst — 218 failures",
            body: "218 failed logins against vpn-gw from 198.51.100.23 between 11:30–11:41 UTC. Zero successes; source rate-blocked. No cloud audit-trail events from this IP.",
            source: "VPN gateway IDS",
            related: false,
        },
        {
            id: "A-4475",
            sev: "LOW",
            title: "Nightly CI build 14% over baseline",
            body: "ci-runner-ops billing-service #2272 took 21 min vs 18 min baseline. No policy changes observed.",
            source: "Build monitor",
            related: false,
        },
        {
            id: "A-4476",
            sev: "INFO",
            title: "Egress uptick on billing VPC",
            body: "+6.1 GB outbound between 15:26–15:58 UTC, single external destination 203.0.113.87. Informational until correlated.",
            source: "VPC flow analytics",
            related: true,
        },
    ],
};
const REPO_DIFF = {
    repo: "stratus-ledger/billing-service (PUBLIC)",
    commit: "9f31c2a",
    author: "dana.whitfield",
    time: "2026-11-03 09:41 UTC",
    message: "add billing env config",
    lines: [
        { k: "ctx", v: "# billing-service runtime config" },
        { k: "add", v: "SKYFORGE_ACCESS_KEY_ID=SFAPG7K3Q9M2XZ41B6TD" },
        { k: "add", v: "SKYFORGE_SESSION_TOKEN=(none — long-lived key)" },
        { k: "add", v: "BILLING_ENV=production" },
        { k: "ctx", v: "# Scenario note: rotate before Friday's partner demo" },
    ],
    scan: "RepoGuard verdict: ACCESS_KEY_PATTERN · severity HIGH · repo visibility PUBLIC",
};
const GLOSSARY = [
    { term: "Access key", def: "A long-lived cloud API credential (key ID + secret). Works from anywhere, no MFA prompt — highest-value leak." },
    { term: "Secret scanning", def: "Automated repo/commit inspection that flags credential patterns before or right after they are pushed (mitigation M1047/M1043)." },
    { term: "Least privilege", def: "Granting only the permissions an identity needs for its job — the control whose absence enabled this escalation (M1018/M1026)." },
    { term: "Privilege escalation", def: "Gaining permissions beyond an identity's intended scope, e.g. by attaching an IAM policy it shouldn't be able to attach (T1098.003)." },
    { term: "IAM policy", def: "A document of allow/deny rules binding actions to resources. Attaching a broad one to a principal is a classic cloud escalation." },
    { term: "Role assumption", def: "Temporarily taking on another identity's permissions (sts:AssumeRole). Chaining assumptions can silently widen access (T1548.005)." },
    { term: "Temporary credentials", def: "Short-lived session tokens instead of permanent keys; a leaked one dies on its own (guidance cited by MITRE for T1530)." },
    { term: "Audit trail", def: "Chronological record of every API call — who, what, when, from which IP. The primary data source for this incident." },
    { term: "Containment", def: "Stopping ongoing damage while preserving evidence: deactivate credentials, quarantine principals. Do NOT delete artifacts yet." },
    { term: "Eradication", def: "Removing attacker artifacts: created users, additional keys, attached policies — after evidence is captured." },
    { term: "Blast radius", def: "Everything one credential or account can touch. Shrinking it is the point of least privilege." },
    { term: "MTTD / MTTR", def: "Mean time to detect / respond. Every minute a leaked key stays active is attacker working time." },
    { term: "Attack chain / tactics", def: "MITRE ATT&CK stages. Here: Credential Access → Initial Access → Persistence → Privilege Escalation → Collection." },
    { term: "Red herring", def: "Evidence that looks alarming but is unrelated to the incident — a triage skill as important as spotting the real thing." },
    { term: "IoC", def: "Indicator of compromise: a concrete observable (key ID, IP, username) you hunt for and block." },
];
const HARDENING = [
    {
        id: "h-scan",
        title: "RepoGuard everywhere",
        body: "Secret scanning + pre-commit blocking hooks on ALL repositories; auto-revoke matched keys within minutes.",
        refs: "M1047 Audit · M1043 Credential Access Protection",
        stance: "good",
    },
    {
        id: "h-leastpriv",
        title: "Strip IAM-write from CI",
        body: "Only PlatformAdmin may iam:CreateUser / iam:AttachUserPolicy. Service accounts get deploy-only scopes.",
        refs: "M1018 User Account Management · M1026 Privileged Account Management",
        stance: "good",
    },
    {
        id: "h-temptokens",
        title: "Temporary CI credentials",
        body: "Replace svc-billing-ci's permanent key with short-lived role-session tokens scoped per job.",
        refs: "MITRE T1530 guidance: prefer temporary tokens over permanent credentials",
        stance: "good",
    },
    {
        id: "h-storage-logs",
        title: "Storage access logging + retention",
        body: "Object-storage access logs with 90-day retention; keeps GetObject evidence queryable for forensics.",
        refs: "M1047 Audit — enables detection analytic AN1328-style alerts",
        stance: "good",
    },
    {
        id: "h-mfa",
        title: "MFA on human console sign-in",
        body: "Phishing-resistant MFA for all human identities. (Does NOT protect API key calls — that's why keys must die.)",
        refs: "M1032 Multi-factor Authentication",
        stance: "neutral",
    },
    {
        id: "h-public",
        title: "Public-read export buckets",
        body: "Unblock the partner integration by making export buckets publicly readable.",
        refs: "— recreates the exact exposure T1530 warns about",
        stance: "trap",
    },
    {
        id: "h-quiet",
        title: "Quiet the audit trail",
        body: "Downgrade audit-trail logging to ERROR-only in the CI account to reduce alert noise.",
        refs: "— blinds the analytics that caught this incident",
        stance: "trap",
    },
];
const QUIZ = {
    medium: [
        {
            // QA fix (R4): correct index 2. QA fix (R5): lengths balanced.
            id: "qm1",
            stem: "Which credential type leaked here is the most dangerous to leave active, and why?",
            options: [
                "An SSH host fingerprint, it identifies a server but grants no access",
                "A TLS certificate, it encrypts traffic but never authenticates a caller",
                "A long-lived access key, it works from anywhere with no MFA prompt",
                "A session token, it expires within minutes so its value dies fast",
            ],
            correct: 2,
            why: "Long-lived access keys authenticate API calls without interactive MFA, so a leaked one keeps working until someone deactivates it. Temporary tokens self-expire by design; certificates and host fingerprints are not cloud API credentials at all. This is why the response playbook starts with deactivation.",
        },
        {
            // QA fix (R4): correct index 0.
            id: "qm2",
            stem: "Why do attackers prize VALID cloud credentials like this leaked key?",
            options: [
                "They blend into normal telemetry and often bypass MFA entirely",
                "They must exploit a fresh vulnerability before every single API call",
                "They automatically grant root on every instance in the account",
                "Providers log valid-account activity only once per day",
            ],
            correct: 0,
            why: "MITRE lists Valid Accounts (T1078.004) under Initial Access, Persistence, Privilege Escalation AND Stealth: the attacker logs in instead of breaking in, so events look like ordinary automation — and API-key authentication never triggers an MFA prompt. The distractors invert reality: no exploit is needed per call, no automatic root exists, and every API call IS logged in the audit trail.",
        },
        {
            // QA fix (R4): correct index 3.
            id: "qm3",
            stem: "The audit trail shows CreateUser → CreateAccessKey → AttachUserPolicy from an unknown IP. That pattern best represents…",
            options: [
                "Routine CI deployment activity",
                "Data exfiltration in progress",
                "A cipher-suite negotiation failure",
                "Persistence + privilege escalation",
            ],
            correct: 3,
            why: "Creating an account (T1136.003) and giving it keys (T1098.001) is persistence; attaching a powerful policy (T1098.003) escalates it. Collection (GetObject bursts) typically comes after, so exfiltration is the wrong stage here — and legitimate CI never chains these three calls from an unknown IP. MITRE's own analytic for T1136.003 (DET0319/AN0900) watches exactly this temporal chain.",
        },
        {
            // QA fix (R4): correct index 1.
            id: "qm4",
            stem: "Containment of a confirmed leaked access key should begin with…",
            options: [
                "Deleting the compromised service account",
                "Deactivating the key and quarantining attacker principals",
                "Deleting every audit-trail entry from the attacker session",
                "Waiting for the attacker's sessions to expire",
            ],
            correct: 1,
            why: "Stop the bleeding first: deactivate the credential and quarantine (deny-all) attacker principals so nothing they hold can authenticate. Never destroy audit evidence — it is the forensic and legal record; and deleting the whole service account breaks production before the attacker is even cut off. Waiting is how a spill becomes a breach.",
        },
        {
            // QA fix (R4): correct index 0.
            id: "qm5",
            stem: "Which data source proves WHICH objects the attacker actually read?",
            options: [
                "Object-storage access logs recording GetObject",
                "The marketing CRM analytics dashboard",
                "VPN gateway intrusion-detection telemetry",
                "NTP drift and time-synchronization telemetry sources",
            ],
            correct: 0,
            why: "GetObject calls and storage access logs record the exact resources and volumes read — MITRE's T1530 detection (DET0484/AN1328) keys on a spike in object access from a new principal. CRM, VPN and NTP telemetry never observe object reads: a detection is only as good as its data source.",
        },
        {
            // QA fix (R4): correct index 2.
            id: "qm6",
            stem: "A colleague says: 'the alert inbox also had a TLS cipher-suite deprecation — that must be part of this attack.' Best response?",
            options: [
                "Yes, deprecated ciphers prove the attacker decrypted traffic",
                "Yes, every LOW severity alert belongs to the active incident",
                "No, it is a TLS hygiene finding; route to engineering",
                "Ignore it permanently, cipher findings never matter",
            ],
            correct: 2,
            why: "CV0-004's 'troubleshoot security issues' objective bundles cipher-suite deprecations, authorization issues and authentication issues under one family — related vocabulary, different failure modes. Triage discipline means classifying by evidence, not by inbox adjacency: no downgrade or decryption happened here. It is still worth fixing, on its own track — never 'ignored permanently'.",
        },
    ],
    hard: [
        {
            // QA fix (R4): correct index 1.
            id: "qh1",
            stem: "You've just confirmed the leak. Finance demands the export bucket stay online. Your FIRST move?",
            options: [
                "Delete deploy-helper-2 and its keys immediately so nothing looks wrong",
                "Deactivate the leaked key, quarantine deploy-helper-2, keep all logs",
                "Make the bucket private and delete audit entries mentioning it",
                "Wait for a maintenance window so nothing is disrupted",
            ],
            correct: 1,
            why: "Containment = cut the attacker's access (deactivate credential, deny-all quarantine) without destroying evidence or breaking the platform. Deleting principals before evidence capture destroys attribution; audit entries are the forensic and compliance record; and the bucket staying online is fully compatible with deactivating one key. Waiting just funds the attacker's session.",
        },
        {
            // QA fix (R4): correct index 3.
            id: "qh2",
            stem: "An engineer offers to 'clean up' the audit trail by removing the attacker's events. Why is that wrong?",
            options: [
                "It would hide the incident from the attacker watching too",
                "The append-only audit trail cannot be modified anyway",
                "It only matters if regulators ask within 48 hours",
                "Audit entries are the evidentiary record for forensics",
            ],
            correct: 3,
            why: "The audit trail is evidence: it defines blast radius (which keys, which objects), supports legal and regulatory duties, and feeds the lessons-learned review. Editing it is evidence tampering — its own incident. The trail is in fact modifiable by privileged users, which is exactly why tampering is possible and forbidden; and scope duties do not expire in 48 hours.",
        },
        {
            // QA fix (R4): correct index 0.
            id: "qh3",
            stem: "Your new rule 'alert on any CreateAccessKey' fires 30× nightly for legitimate CI. Best tuning?",
            options: [
                "Allowlist known automation and alert on the full chain",
                "Disable the rule; the noise proves detection is impossible",
                "Alert only on weekends, when CI activity is quiet",
                "Raise it to page-on for every event, including benign ones",
            ],
            correct: 0,
            why: "False-positive control keeps detectors trusted: scope them to unusual context (unknown principals, foreign IPs, dangerous chains) rather than benign automation. That mirrors MITRE's AN0900 chain analytic with allowlisting, and it is what this lab's rule-builder teaches. Disabling hands the attacker a blind spot; paging on everything guarantees the rule gets switched off in a week.",
        },
        {
            // QA fix (R4): correct index 2.
            id: "qh4",
            stem: "After deactivating the leaked key, the attacker STILL ran ListObjects once. Most likely explanation?",
            options: [
                "The attacker guessed the bucket contents without credentials",
                "GetObject events replay automatically after deactivation",
                "The attacker-created backup key (SFBKP9…) was still active",
                "The audit trail double-logs every single read",
            ],
            correct: 2,
            why: "At 15:03 the attacker minted a SECOND key (T1098.001 Additional Cloud Credentials) exactly to survive the first key's deactivation. Complete containment kills every credential the attacker could hold — which is why eradication also inventories attacker-created keys. Bucket listing is impossible without valid credentials, events never replay, and the audit trail records what actually happened.",
        },
        {
            // QA fix (R4): correct index 0.
            id: "qh5",
            stem: "Which single change prevents the ESCALATION step itself (attaching BillingFullAccess to a new user)?",
            options: [
                "Restrict IAM-write actions to the PlatformAdmin role",
                "Requiring MFA on the CI service account's API-key calls",
                "Encrypting the export bucket with stronger keys at rest",
                "Deprecating the legacy cipher suites on the load balancer",
            ],
            correct: 0,
            why: "The escalation needed IAM-write permissions that svc-billing-ci should never have had (M1018 User Account Management / M1026 Privileged Account Management). MFA cannot protect an API-key call; encryption and TLS hygiene don't constrain who can attach policies. Remove the escalation primitive and the leaked key stays a deploy key instead of becoming a tenant-admin key.",
        },
        {
            // QA fix (R4): correct index 3.
            id: "qh6",
            stem: "Post-incident, which change most reduces the chance of a REPEAT leak?",
            options: [
                "Rename the service account so attackers cannot find it",
                "Increase the bucket quota so reads look smaller",
                "Publish the key internally so developers need not commit it",
                "Pre-commit scanning hooks and short-lived CI session tokens",
            ],
            correct: 3,
            why: "Attack the two root causes: detection-before-exposure (secret scanning, M1047/M1043) and blast-radius limiting (temporary tokens, per MITRE's T1530 guidance). Renaming is security by obscurity; quota changes make reads smaller, not less likely; and publishing keys multiplies the leak. Quota and renaming cost little and change nothing that mattered here.",
        },
        {
            // QA fix (R4): correct index 1.
            id: "qh7",
            stem: "Classify this incident using the exam's vocabulary: the key AUTHENTICATED fine; the account could then read a payroll bucket it had no business reading.",
            options: [
                "An authentication issue, the credential should have been rejected",
                "An authorization issue, valid identity, excessive permissions",
                "A cipher-suite deprecation affecting the export service",
                "Both a leak and a cipher failure, nothing else at all",
            ],
            correct: 1,
            why: "Authentication succeeded — the credential was valid. The failure was authorization: permissions far beyond the job role, i.e. privilege escalation (T1098.003) leading to unauthorized access. CV0-004's security-troubleshooting objective explicitly separates these families, and your incident report should too. Calling it an authentication failure would send the remediation in the wrong direction.",
        },
    ],
};
;
const KNOWLEDGE = {
    what: "A long-lived access key for a CI service account was committed to a public repository (T1552.001 Credentials In Files). Anyone who found it could authenticate as the service account — no MFA gate exists for API keys (T1078.004 Valid Accounts: Cloud Accounts). The attacker minted a backup key (T1098.001), created a new account (T1136.003), attached an over-privileged policy to it (T1098.003 — escalation), and read production financial exports (T1530).",
    why: "Valid cloud credentials are attacker gold: they log in instead of breaking in. Events look like ordinary automation, they sidestep exploit defenses entirely, and API-key authentication has no MFA prompt to stop them. That is why 'immediately rotate/deactivate compromised keys' is the exam — and real-world — first move, followed by finding everything the key did.",
    leaks: [
        "Source repositories & commits — the vector used here (config files, .env, Terraform state)",
        "Shell history & notebooks — commands with inline credentials (T1552.003)",
        "Chat & email threads — keys pasted for 'convenience' (T1552.008)",
        "Instance metadata endpoints abused from workloads (T1552.005)",
        "Logs, ticketing systems and build output that echo secrets",
        "Public object storage that itself stores credential files",
    ],
    escalation: [
        "Over-privileged service accounts: a deploy credential that may iam:CreateUser, iam:AttachUserPolicy can mint its own admin — exactly what happened here",
        "Policy attachment / version override: AttachUserPolicy or CreatePolicyVersion rewrite what an identity may do (T1098.003)",
        "Role-assumption chains: sts:AssumeRole paths that compound into unintended power (T1548.005 Temporary Elevated Cloud Access)",
        "Permission creep: policies that outlive their pipeline ('BillingFullAccess — for a retired reporting job')",
    ],
    lifecycle: [
        ["Identify", "Triage alerts, prove scope: what leaked, who used it, from where, touching what."],
        ["Contain", "Stop ongoing damage WITHOUT destroying evidence: deactivate keys, quarantine principals."],
        ["Eradicate", "Remove attacker artifacts: created users, extra keys, attached policies, backup access."],
        ["Recover", "Re-issue credentials, restore clean service, validate integrity, watch for re-entry."],
        ["Learn", "Post-incident review: root causes, control gaps, owners and deadlines — then verify closure."],
    ],
    attribution: [
        ["ShinyHunters", "Used valid credentials from public repositories — including access keys — to access a victim AWS environment; collected data from insecure buckets. (T1078.004, T1530)"],
        ["LAPSUS$", "Used compromised credentials against cloud assets; created global-admin accounts for persistence and added admin roles to them. (T1078.004, T1136.003, T1098.003)"],
        ["Scattered Spider", "Authenticated to Azure tenants with compromised credentials; used IAM manipulation to persist and elevate. (T1078.004, T1098.003)"],
        ["Storm-0501", "Abused storage account access keys; elevated to Owner via role-assignment writes; exploited a Global Admin with NO MFA registered. (T1078.004, T1098.003)"],
        ["APT28 / APT29", "Abused compromised O365/Azure AD administrator accounts; created service principals and new users for persistence. (T1078.004, T1136.003)"],
        ["Pacu / TruffleHog", "Tooling that hunts CodeBuild variables, EC2 user data, CloudFormation templates and buckets for exposed credentials. (T1552, T1530)"],
    ],
};
const MITRE_LINKS = [
    ["T1552 Unsecured Credentials", "https://attack.mitre.org/techniques/T1552/"],
    ["T1552.001 Credentials In Files", "https://attack.mitre.org/techniques/T1552/001/"],
    ["T1078.004 Valid Accounts: Cloud Accounts", "https://attack.mitre.org/techniques/T1078/004/"],
    ["T1098.003 Additional Cloud Roles", "https://attack.mitre.org/techniques/T1098/003/"],
    ["T1136.003 Create Account: Cloud Account", "https://attack.mitre.org/techniques/T1136/003/"],
    ["T1530 Data from Cloud Storage", "https://attack.mitre.org/techniques/T1530/"],
    ["T1548.005 Temporary Elevated Cloud Access", "https://attack.mitre.org/techniques/T1548/005/"],
    ["ATT&CK Enterprise Mitigations", "https://attack.mitre.org/mitigations/enterprise/"],
    ["CompTIA Cloud+ (CV0-004)", "https://www.comptia.org/en-us/certifications/cloud"],
];
const DEBRIEF = {
    detections: [
        {
            name: "Escalation chain analytic",
            logic: "CreateUser AND CreateAccessKey AND AttachUserPolicy by the same source within 30 min, principal NOT in automation allowlist, source IP NOT in corporate ranges",
            anchor: "MITRE analytic AN0900 (DET0319) — watches exactly this temporal chain",
        },
        {
            name: "Role/permission addition watch",
            logic: "Alert on new policy attachments outside normal change windows or hours, following suspicious logins",
            anchor: "MITRE analytic AN0771 (DET0277) for T1098.003",
        },
        {
            name: "Collection spike analytic",
            logic: "Spike in object access from a NEW principal, correlated with outbound egress to external IPs",
            anchor: "MITRE analytic AN1328 (DET0484) for T1530 — this is the alert that declared IR-114",
        },
        {
            name: "Secret scanning (pre-incident)",
            logic: "Match credential patterns on every commit; block push, auto-revoke matched keys, page a human queue — not a low-priority ticket",
            anchor: "M1047 Audit / M1043 Credential Access Protection",
        },
    ],
    mitigations: [
        ["M1018 User Account Management", "Low-privileged accounts must not be able to attach policies or create users — removes the escalation primitive."],
        ["M1026 Privileged Account Management", "Least privilege for service accounts; inventory and audit every policy, kill permission creep."],
        ["M1047 Audit", "Secret scanning, credential-storage audits, storage access logging with retention."],
        ["M1043 / M1041", "Central secrets management + encryption; keys leave repos and config files entirely."],
        ["Temporary tokens (T1530 guidance)", "Short-lived, job-scoped session credentials instead of permanent access keys."],
        ["M1032 Multi-factor Authentication", "Phishing-resistant MFA for all human sign-ins (console/admin), acknowledging API keys bypass it."],
        ["M1037 / M1057", "IP allowlisting on sensitive APIs; egress monitoring/DLP to catch bulk reads leaving."],
        ["M1017 User Training", "Developers learn WHY keys never belong in code — the human root cause here."],
    ],
    blue: [
        "Treat every secret-scan hit as an incident, not a ticket: the window between commit and abuse is hours, not weeks.",
        "Containment order matters: kill credentials first, quarantine second, delete artifacts last — after evidence export.",
        "Hunt the persistence, not just the key: assume additional keys and accounts exist until the audit trail proves otherwise.",
        "Allowlist known automation, alert on the chain — that keeps detectors trusted enough to keep enabled.",
        "Recovery is a control checkpoint too: new credentials are the moment to right-size permissions.",
    ],
    red: [
        "One committed key bought: valid-account cover, persistence (×2 mechanisms), escalation and collection — no exploit needed.",
        "API keys have no MFA moment; anything a service account may do, a leaked key does quietly.",
        "Creating a boringly-named account ('deploy-helper-2') with an existing broad policy hides in plain sight.",
        "Backup credentials (T1098.001) are the standard hedge against your first deactivation — defenders who miss them re-contain twice.",
    ],
    recovery: [
        "Export & hash the audit trail and storage access logs for the full incident window before any cleanup.",
        "Issue new, correctly-scoped credentials; re-onboard the CI pipeline with temporary tokens.",
        "Validate: no active attacker-held credentials, artifacts gone, alerting confirmed working (test with a canary).",
        "Brief stakeholders: what leaked, blast radius, what changed; open dated action items for every control gap.",
    ],
};
