// ── Exercise CLOUDBURST · objective blueprint + CHECK RESULTS validators (verbatim) ─
// Ported 1:1 from the framework lab (src/lib/lab). Content, wording, answers,
// hints and validation logic are unchanged. Plain classic script (no modules)
// so the lab also runs from file:// after extraction.

// ── Exercise CLOUDBURST · mastery blueprint (objectives + validators) ────────
// Medium: 12 granular guided objectives. Hard: 9 broad multi-step challenges.
// Every validator is machine-checkable against environment state and/or the
// student's recorded answers (F2). Feedback is educational on pass AND fail.
const A = (s, k) => typeof s.answers[k] === "string" ? s.answers[k].trim() : "";
const L = (s, k) => Array.isArray(s.answers[k]) ? s.answers[k] : [];
const norm = (v) => v.trim().toLowerCase().replace(/\s+/g, " ");
const eq = (v, want) => norm(v) === norm(want);
const oneOf = (v, wants) => wants.some((w) => eq(v, w));
const KEY_LEAKED = INCIDENT.leakedKey; // SFAPG7K3Q9M2XZ41B6TD
const KEY_BACKUP = INCIDENT.backupKey; // SFBKP9M2QX4T8VLN7CED
const KEY_NEW = INCIDENT.attackerUserKey; // SFOBS4LV8QPN2T6EA3KJ
const USER_EVIL = INCIDENT.attackerUser; // deploy-helper-2
const KEY_BOT = "SFBOT7N2QX8V4K1M9PZR";
const actionIndex = (env, action) => env.actionLog.indexOf(action);
const done = (env, action) => env.actionLog.includes(action);
// ── shared control option sets ───────────────────────────────────────────────
const CHAIN = {
    options: ["chain-use", "chain-persist", "chain-escalate", "chain-collect"],
    labels: {
        "chain-use": "Authenticate with the leaked key (valid account)",
        "chain-persist": "Mint backup keys and a new account",
        "chain-escalate": "Attach a powerful IAM policy to the new account",
        "chain-collect": "Read objects from the financial-exports bucket",
    },
};
const EVENT_POOL = [
    ["ev-02", "11:58 StartBuild · ci-runner-ops"],
    ["ev-04", "14:52 ListBuckets · svc-billing-ci key SFAPG7K3… from 203.0.113.87"],
    ["ev-05", "14:53 DescribeInstances · svc-billing-ci key SFAPG7K3…"],
    ["ev-06", "15:03 CreateAccessKey · for svc-billing-ci (backup key)"],
    ["ev-07", "15:11 CreateUser · deploy-helper-2"],
    ["ev-08", "15:11 CreateAccessKey · for deploy-helper-2"],
    ["ev-09", "15:14 AttachUserPolicy · BillingFullAccess → deploy-helper-2"],
    ["ev-10", "15:22 ListObjects · deploy-helper-2 on sl-financial-exports-prod"],
    ["ev-11", "15:26 GetObject ×412 (aggregate) · deploy-helper-2"],
    ["ev-13", "13:40 RotateSSHKey · dana.whitfield (self)"],
    ["ev-14", "14:10 UpdatePolicy · marcus.osei (typo fix)"],
    ["ev-16", "16:44 GetObject · dana.whitfield (dev exports)"],
];
const TECH_POOL = ["T1078.004", "T1098.001", "T1136.003", "T1098.003", "T1530", "T1552.001", "T1548.005"];
// ── machine-checkable validators (F2) ───────────────────────────────────────
const sortedEq = (a, b) => [...a].sort().join("\u0000") === [...b].sort().join("\u0000");
const seqEq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const VALIDATORS = {
    // ── MEDIUM ──
    "OBJ-M1": (s) => eq(A(s, "m1_alert"), "A-4471")
        ? { pass: true, title: "Correct — and you spotted a missed signal", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-M2": (s) => eq(A(s, "m2_type"), "access-key") && eq(A(s, "m2_key"), KEY_LEAKED)
        ? { pass: true, title: "The artifact is pinned down", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-M3": (s) => {
        const id = A(s, "m3_id").replace(/[\s`]/g, "");
        const name = norm(A(s, "m3_name"));
        const idOk = /^(t)?1552(\.001)?$/i.test(id);
        const nameOk = /unsecured credentials|credentials in files/.test(name);
        return idOk && nameOk
            ? { pass: true, title: "Mapped — T1552, the credential-leak family", body: "" }
            : { pass: false, title: "", body: "" };
    },
    "OBJ-M4": (s) => seqEq(L(s, "m4_order"), ["chain-use", "chain-persist", "chain-escalate", "chain-collect"])
        ? { pass: true, title: "Chain reconstructed", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-M5": (s) => {
        const ip = eq(A(s, "m5_ip"), INCIDENT.attackerIp);
        const time = /^14:52(:\d+)?( utc)?$/.test(A(s, "m5_time").trim().toLowerCase());
        return ip && time
            ? { pass: true, title: "Ground zero located", body: "" }
            : { pass: false, title: "", body: "" };
    },
    "OBJ-M6": (s) => eq(A(s, "m6_user"), USER_EVIL) && eq(A(s, "m6_key"), KEY_NEW)
        ? { pass: true, title: "Persistence exposed", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-M7": (s) => eq(A(s, "m7_policy"), INCIDENT.policy) &&
        eq(A(s, "m7_user"), USER_EVIL) &&
        ["obj-get", "iam-attach", "sts-assume"].includes(A(s, "m7_perm"))
        ? { pass: true, title: "Escalation identified — T1098.003", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-M8": (s) => sortedEq(L(s, "m8_sources"), ["audit-trail", "repo-scan", "storage-logs"])
        ? { pass: true, title: "Telemetry stack selected", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-M9": (s) => eq(A(s, "m9_e1"), "CreateUser") &&
        eq(A(s, "m9_e2"), "AttachUserPolicy") &&
        eq(A(s, "m9_window"), "within 30 minutes") &&
        eq(A(s, "m9_src"), "from non-allowlisted IPs")
        ? { pass: true, title: "Rule assembled — this is AN0900's shape", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-M10": (s) => {
        const k = s.env.keys[KEY_LEAKED];
        const u = s.env.users[USER_EVIL];
        // Removal implies containment (delete is gated behind quarantine in the UI).
        const ok = !!k && !k.active && !!u && (u.quarantined || !u.exists);
        return ok
            ? { pass: true, title: "Contained — the attacker is locked out", body: "" }
            : { pass: false, title: "", body: "" };
    },
    "OBJ-M11": (s) => {
        const leaked = s.env.keys[KEY_LEAKED];
        const backup = s.env.keys[KEY_BACKUP];
        const newKey = s.env.keys[KEY_NEW];
        const u = s.env.users[USER_EVIL];
        const ok = !!leaked && !leaked.active &&
            !!backup && backup.deleted &&
            !!newKey && newKey.deleted &&
            !s.env.policyAttached &&
            !!u && !u.exists;
        return ok
            ? { pass: true, title: "Eradicated — zero attacker artifacts remain", body: "" }
            : { pass: false, title: "", body: "" };
    },
    "OBJ-M12": (s) => {
        const h = s.env.hardening;
        const ok = h["h-scan"] === true && h["h-leastpriv"] === true && h["h-temptokens"] === true && h["h-public"] === false && h["h-quiet"] === false;
        return ok
            ? { pass: true, title: "Hardened — recurrence paths closed", body: "" }
            : { pass: false, title: "", body: "" };
    },
    // ── HARD ──
    "OBJ-H1": (s) => seqEq(L(s, "h1_seq"), ["ev-04", "ev-06", "ev-07", "ev-08", "ev-09", "ev-11"])
        ? { pass: true, title: "Spine confirmed — six actions, one afternoon", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-H2": (s) => {
        const want = { a: "T1078.004", b: "T1098.001", c: "T1136.003", d: "T1098.001", e: "T1098.003", f: "T1530" };
        const ok = Object.keys(want).every((k) => eq(A(s, `h2_${k}`), want[k]));
        return ok
            ? { pass: true, title: "Full technique attribution", body: "" }
            : { pass: false, title: "", body: "" };
    },
    "OBJ-H3": (s) => eq(A(s, "h3_key"), KEY_LEAKED) &&
        eq(A(s, "h3_ip"), INCIDENT.attackerIp) &&
        eq(A(s, "h3_user"), USER_EVIL) &&
        eq(A(s, "h3_newkey"), KEY_NEW) &&
        eq(A(s, "h3_policy"), INCIDENT.policy) &&
        eq(A(s, "h3_bucket"), INCIDENT.bucket)
        ? { pass: true, title: "IOC set complete and exact", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-H4": (s) => eq(A(s, "h4_root"), "root-iamwrite") &&
        sortedEq(L(s, "h4_apis"), ["AttachUserPolicy", "CreateUser"]) &&
        eq(A(s, "h4_fix"), "fix-leastpriv")
        ? { pass: true, title: "Mechanism explained — the 'why it was allowed'", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-H5": (s) => {
        const a1 = actionIndex(s.env, `deact:${KEY_LEAKED}`);
        const a2 = actionIndex(s.env, `deact:${KEY_BACKUP}`);
        const a3 = actionIndex(s.env, `quarantine:${USER_EVIL}`);
        const ok = a1 !== -1 && a2 !== -1 && a3 !== -1 && a1 < a2 && a2 < a3;
        return ok
            ? { pass: true, title: "Contained, in defensible order", body: "" }
            : { pass: false, title: "", body: "" };
    },
    "OBJ-H6": (s) => {
        const leaked = s.env.keys[KEY_LEAKED];
        const backup = s.env.keys[KEY_BACKUP];
        const newKey = s.env.keys[KEY_NEW];
        const botKey = s.env.keys[KEY_BOT];
        const evil = s.env.users[USER_EVIL];
        const bot = s.env.users[INCIDENT.supportBot];
        const keysClean = !!leaked && !leaked.active &&
            !!backup && backup.deleted &&
            !!newKey && newKey.deleted &&
            (!botKey || botKey.deleted);
        const usersClean = !!evil && !evil.exists && !bot?.exists;
        return keysClean && usersClean && !s.env.policyAttached
            ? { pass: true, title: "Sweep clean — eradication verified", body: "" }
            : { pass: false, title: "", body: "" };
    },
    "OBJ-H7": (s) => sortedEq(L(s, "h7_events"), ["CreateUser", "CreateAccessKey", "AttachUserPolicy"]) &&
        eq(A(s, "h7_window"), "within 30 minutes") &&
        eq(A(s, "h7_src"), "principals/IPs outside the automation allowlist") &&
        eq(A(s, "h7_variant"), "v2") &&
        eq(A(s, "h7_justify"), "j1")
        ? { pass: true, title: "Deployable detection with defensible tuning", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-H8": (s) => sortedEq(L(s, "h8_controls"), ["c-m1018", "c-m1026", "c-m1047", "c-temptokens"]) &&
        eq(A(s, "h8_residual"), "res-token")
        ? { pass: true, title: "Control set justified — and honestly scoped", body: "" }
        : { pass: false, title: "", body: "" },
    "OBJ-H9": (s) => sortedEq(L(s, "h9_alerts"), ["A-4473", "A-4474"]) &&
        eq(A(s, "h9_cipher_why"), "hygiene") &&
        eq(A(s, "h9_vpn_why"), "nofail")
        ? { pass: true, title: "Two red herrings correctly excluded — with evidence", body: "" }
        : { pass: false, title: "", body: "" },
};
function checkObjective(o, s) {
    const r = o.validate?.(s) ?? VALIDATORS[o.id]?.(s);
    if (!r)
        return { pass: false, title: "", body: "" };
    return r;
}
// ── MEDIUM ────────────────────────────────────────────────────────────────────
const OBJECTIVES_MEDIUM = [
    {
        id: "OBJ-M1",
        mode: "medium",
        pillar: "UNDERSTAND",
        phase: "IDENTIFY",
        title: "Triage the alert inbox: record the ID of the alert that proves a credential was leaked.",
        context: "Four alerts are waiting. Severity ratings are cues, not proof — read what each alert actually asserts about credentials and access.",
        controls: [
            {
                key: "m1_alert",
                label: "Leaked-credential alert",
                type: "select",
                options: ["A-4471", "A-4472", "A-4473", "A-4474"],
                optionLabels: { "A-4471": "A-4471 · Secret detected in PUBLIC repository", "A-4472": "A-4472 · Object access spike from new principal", "A-4473": "A-4473 · TLS cipher suite deprecation", "A-4474": "A-4474 · VPN authentication burst — 218 failures" },
            },
        ],
        hints: [
            "Severity is a hint, not evidence. Which alert describes credential MATERIAL being exposed?",
            "One alert is from a secret-scanning service that matched an access-key pattern in a public repo.",
            "It's A-4471 — RepoGuard's secret-scan match on config/billing-service.env.",
        ],
        pass: {
            title: "Correct — and you spotted a missed signal",
            body: "A-4471 is direct proof of exposure: credential material in a world-readable repo since 09:41, ticketed to a dead queue at 12:07. A-4472 is a downstream CONSEQUENCE you'll verify next; A-4473/A-4474 are unrelated (you'll justify that later). Detecting leaks before abuse is exactly what secret scanning exists for — its alert being untriaged is a process finding for the lessons-learned review.",
        },
        fail: "Not yet. Re-read the alerts: one proves a credential was EXPOSED (before any abuse), one reports suspicious USE, and two are unrelated findings. The leak is the exposure alert.",
    },
    {
        id: "OBJ-M2",
        mode: "medium",
        pillar: "UNDERSTAND",
        phase: "IDENTIFY",
        title: "Open the repository evidence and record WHAT leaked: the credential type and the full key ID.",
        context: "The repo diff shows the exact lines pushed to the public repository. Not every credential is equal — the type decides how urgent deactivation is.",
        controls: [
            {
                key: "m2_type",
                label: "Credential type",
                type: "select",
                options: ["access-key", "api-token", "password", "ssh-key"],
                optionLabels: { "access-key": "Cloud access key (long-lived, no MFA gate)", "api-token": "Temporary API session token", "password": "User password", "ssh-key": "SSH private key" },
            },
            { key: "m2_key", label: "Full key ID as committed", type: "text", placeholder: "e.g. SF…", helper: "Copy it exactly from the diff." },
        ],
        hints: [
            "The diff adds SKYFORGE_ACCESS_KEY_ID with no session token — what does that combination tell you?",
            "A long-lived access key authenticates API calls from anywhere and never triggers MFA.",
            "Type: cloud access key. Key ID: SFAPG7K3Q9M2XZ41B6TD.",
        ],
        pass: {
            title: "The artifact is pinned down",
            body: "A long-lived cloud access key (T1552.001 — Credentials In Files, stored in a source file) with no session token means unlimited-duration API access until someone revokes it. This is why the response playbook's first line is always deactivation, and why teams replace permanent keys with short-lived session tokens.",
        },
        fail: "Check the diff again: the committed line is an ACCESS KEY ID with no session token (a temporary token would say so), and the key ID must match the one in the evidence exactly.",
    },
    {
        id: "OBJ-M3",
        mode: "medium",
        pillar: "UNDERSTAND",
        phase: "IDENTIFY",
        title: "Map the leak to its MITRE technique: enter the technique ID and its name (Knowledge Core →).",
        context: "The leak itself — credentials stored insecurely in a file — has a precise place in MITRE ATT&CK. Naming it makes the finding communicable and hunt-able.",
        controls: [
            { key: "m3_id", label: "Technique ID", type: "text", placeholder: "T…" },
            { key: "m3_name", label: "Technique name", type: "text", placeholder: "e.g. … Credentials" },
        ],
        hints: [
            "Open the Knowledge Core drawer and find the leak section — which technique family covers insecurely stored credentials?",
            "The family is T1552 'Unsecured Credentials' (Credential Access). The repo commit specifically matches sub-technique .001.",
            "ID: T1552 (T1552.001 is equally correct). Name: Unsecured Credentials.",
        ],
        pass: {
            title: "Mapped — T1552, the credential-leak family",
            body: "T1552 Unsecured Credentials (Credential Access) with sub-technique T1552.001 Credentials In Files ('source code/binary files containing embedded passwords'). Knowing the ID links you to MITRE's full detection guidance and lets your SOC tag, hunt and report consistently.",
        },
        fail: "Close. Check the Knowledge Core: the leak maps to the T1552 family (Unsecured Credentials — or its .001 sub-technique for credentials in files). Watch the exact spelling of the name.",
    },
    {
        id: "OBJ-M4",
        mode: "medium",
        pillar: "UNDERSTAND",
        phase: "IDENTIFY",
        title: "Arrange the attacker's four moves in attack-chain order (1 → 4) to see the incident's shape.",
        context: "The chain runs from credential access through persistence and privilege escalation to collection. Order is the difference between a timeline and a guess.",
        controls: [
            {
                key: "m4_order",
                label: "Chain order (choose step for each position)",
                type: "order",
                options: CHAIN.options,
                optionLabels: CHAIN.labels,
                helper: "Position 1 happened first. Each step used once.",
            },
        ],
        hints: [
            "Ask of each move: did it OPEN access, KEEP access, WIDEN access, or TAKE data?",
            "Opening = authenticating with the leaked key; keeping = backup key + new account; widening = policy attachment; taking = object reads.",
            "Order: use → persist → escalate → collect.",
        ],
        pass: {
            title: "Chain reconstructed",
            body: "Credential Access → Initial Access (T1078.004) → Persistence (T1098.001 + T1136.003) → Privilege Escalation (T1098.003) → Collection (T1530). Notice the escalation: the new account was useless until a policy made it powerful — and the permissions to do that came from the over-privileged CI account. Chain position tells you which control breaks the chain at each link.",
        },
        fail: "Re-order: the chain flows open-access → keep-access → widen-access → take-data. Persisting before escalating is deliberate — the attacker wanted the new account to survive first.",
    },
    {
        id: "OBJ-M5",
        mode: "medium",
        pillar: "RECOGNIZE",
        phase: "IDENTIFY",
        title: "In the audit trail, find the FIRST event made with the leaked key. Record the source IP and time (UTC).",
        context: "Filter the audit trail for the compromised key. The first misuse defines when the incident really began — hours before the alert fired.",
        controls: [
            { key: "m5_ip", label: "Source IP of first misuse", type: "text", placeholder: "e.g. 203.x.x.x" },
            { key: "m5_time", label: "Time (UTC)", type: "text", placeholder: "HH:MM" },
        ],
        hints: [
            "Search the audit trail for the leaked key ID and sort by time — which event is oldest?",
            "The first event is a ListBuckets from an IP that appears nowhere else in normal traffic.",
            "IP 203.0.113.87 · time 14:52 (14:52:19).",
        ],
        pass: {
            title: "Ground zero located",
            body: "14:52:19, ListBuckets from 203.0.113.87 with user-agent 'sf-curl/8.4' — three hours after the commit, 70 minutes before the spike alert. Blast radius math starts here: everything the key could touch after this moment is in scope. Note how a valid account made discovery look ordinary.",
        },
        fail: "Search the audit trail for the leaked key (SFAPG7K3…) and find its OLDEST event. The IP is new to this account and the time is mid-afternoon UTC — check the exact row.",
    },
    {
        id: "OBJ-M6",
        mode: "medium",
        pillar: "RECOGNIZE",
        phase: "IDENTIFY",
        title: "Identify the persistence the attacker planted: the account name they created AND the key ID minted for it.",
        context: "Deactivating the leaked key is never enough — assume backup access exists until the audit trail proves otherwise.",
        controls: [
            { key: "m6_user", label: "Attacker-created account", type: "text", placeholder: "username" },
            { key: "m6_key", label: "Its access key ID", type: "text", placeholder: "SF…" },
        ],
        hints: [
            "Look for CreateUser in the audit trail, then a CreateAccessKey immediately after.",
            "The account name imitates a deployment helper; its key was created one second later.",
            "Account: deploy-helper-2 · key: SFOBS4LV8QPN2T6EA3KJ.",
        ],
        pass: {
            title: "Persistence exposed",
            body: "CreateUser deploy-helper-2 (T1136.003 Create Account: Cloud Account) plus its own key (T1098.001 Additional Cloud Credentials) — two independent persistence mechanisms in one minute. The attacker also minted a backup key for svc-billing-ci itself at 15:03; flag it, because 'delete the new user' alone leaves that one alive.",
        },
        fail: "Search the audit trail for CreateUser and CreateAccessKey between 15:03 and 15:15. The new account is deploy-helper-2; find the key created FOR that account.",
    },
    {
        id: "OBJ-M7",
        mode: "medium",
        pillar: "RECOGNIZE",
        phase: "IDENTIFY",
        title: "Identify the privilege escalation: which policy was attached to the new account, and ONE dangerous permission it grants.",
        context: "The new account was empty of power until a policy arrived. The policy's permissions are the real blast radius.",
        controls: [
            { key: "m7_policy", label: "Attached policy name", type: "text", placeholder: "e.g. …Access" },
            { key: "m7_user", label: "Attached to", type: "text", placeholder: "username" },
            {
                key: "m7_perm",
                label: "One dangerous permission inside it",
                type: "select",
                options: ["obj-get", "iam-attach", "sts-assume", "ec2-start"],
                optionLabels: {
                    "obj-get": "objectstorage:GetObject on sl-financial-exports-prod/*",
                    "iam-attach": "iam:AttachUserPolicy",
                    "sts-assume": "sts:AssumeRole on PayrollExportRole",
                    "ec2-start": "ec2:StartInstances",
                },
            },
        ],
        hints: [
            "Search the audit trail for AttachUserPolicy at 15:14, then read that policy in the Identity console.",
            "The policy grants reads on the production financial-exports bucket — and permission to assume a payroll role.",
            "Policy: BillingFullAccess → deploy-helper-2; any of GetObject / AttachUserPolicy / AssumeRole counts.",
        ],
        pass: {
            title: "Escalation identified — T1098.003",
            body: "AttachUserPolicy (BillingFullAccess → deploy-helper-2) is Account Manipulation: Additional Cloud Roles — Persistence AND Privilege Escalation in one call. GetObject on the exports bucket is the unauthorized access; AssumeRole on PayrollExportRole was the next pivot waiting. The policy even says it was for a retired pipeline — permission creep made this possible.",
        },
        fail: "Find the AttachUserPolicy event (15:14) in the audit trail; the policy name and target are in its resource column. Then open BillingFullAccess in the Identity console and read its permissions.",
    },
    {
        id: "OBJ-M8",
        mode: "medium",
        pillar: "DETECT",
        phase: "IDENTIFY",
        title: "Choose EVERY data source that could have caught this chain early — and none that couldn't.",
        context: "Good detections start from the right telemetry. Each correct source maps to a moment in the chain where detection was possible.",
        controls: [
            {
                key: "m8_sources",
                label: "Data sources",
                type: "multi",
                options: ["audit-trail", "repo-scan", "storage-logs", "ntp-logs", "crm-analytics"],
                optionLabels: {
                    "audit-trail": "Cloud audit trail (API events: who/what/when/from where)",
                    "repo-scan": "Repository secret scanning",
                    "storage-logs": "Object-storage access logs",
                    "ntp-logs": "NTP drift logs",
                    "crm-analytics": "Marketing CRM analytics",
                },
                helper: "Select all that apply.",
            },
        ],
        hints: [
            "Walk the chain: which sources saw the COMMIT? The API CALLS? The OBJECT READS?",
            "NTP drift and CRM analytics never observe credentials or object access.",
            "Correct: audit trail + repo secret scanning + storage access logs.",
        ],
        pass: {
            title: "Telemetry stack selected",
            body: "Secret scanning catches the leak BEFORE abuse; the audit trail exposes valid-account misuse and the escalation chain (MITRE analytic AN0900); storage access logs prove what was read (AN1328-style spike detection). Together they cover commit → API → data. NTP and CRM telemetry see none of this — a detection is only as good as its data source.",
        },
        fail: "Include every source that observed some stage (commit / API calls / object reads) and drop the ones that observe none of them. Re-check the two unrelated options.",
    },
    {
        id: "OBJ-M9",
        mode: "medium",
        pillar: "DETECT",
        phase: "IDENTIFY",
        title: "Build the detection: complete the rule that catches account-creation escalation chains like this one.",
        context: "MITRE's analytic for T1136.003 keys on the temporal chain CreateUser → AttachUserPolicy with credential generation, from unexpected sources. Assemble it.",
        controls: [
            {
                key: "m9_e1",
                label: "Event A",
                type: "select",
                options: ["CreateUser", "CreateAccessKey", "AttachUserPolicy", "GetObject", "ListBuckets"],
            },
            {
                key: "m9_e2",
                label: "Event B (the escalation act)",
                type: "select",
                options: ["CreateUser", "CreateAccessKey", "AttachUserPolicy", "GetObject", "ListBuckets"],
            },
            {
                key: "m9_window",
                label: "Correlation window",
                type: "select",
                options: ["within 5 minutes", "within 30 minutes", "within 24 hours"],
            },
            {
                key: "m9_src",
                label: "Source condition",
                type: "select",
                options: ["from any IP", "from non-allowlisted IPs", "only from corporate IPs"],
            },
        ],
        hints: [
            "Which two events, close in time, turn 'a key existed' into 'an account got powerful'?",
            "The pair is CreateUser followed by AttachUserPolicy; legitimate CI never chains those.",
            "A: CreateUser · B: AttachUserPolicy · window: 30 minutes · source: non-allowlisted IPs.",
        ],
        pass: {
            title: "Rule assembled — this is AN0900's shape",
            body: "CreateUser AND AttachUserPolicy within 30 minutes from non-allowlisted IPs is exactly the temporal chain MITRE documents for cloud account creation (DET0319/AN0900). The allowlist condition is what keeps nightly CI from paging you — tight enough to catch the attack, quiet enough to stay enabled. You'll defend that tuning again in the quiz.",
        },
        fail: "Re-read the audit chain: the escalation pair is CreateUser → AttachUserPolicy. The window must be tight enough to be a chain (not a day), and the source condition must exclude known automation without ignoring outside IPs.",
    },
    {
        id: "OBJ-M10",
        mode: "medium",
        pillar: "MITIGATE",
        phase: "CONTAIN",
        title: "CONTAIN: make it impossible for the attacker to keep using what they have — without destroying evidence.",
        context: "Work in the Identity console. Containment stops the bleeding; it deliberately does NOT delete anything yet.",
        controls: [],
        stateCheck: true,
        hints: [
            "Two things grant the attacker access right now: the leaked key and the new account. Neutralize both.",
            "'Deactivate' the leaked key (don't delete — evidence), and set deploy-helper-2 to quarantine (deny-all).",
            "Deactivate key SFAPG7K3… AND quarantine deploy-helper-2. Deleting is for the next phase.",
        ],
        pass: {
            title: "Contained — the attacker is locked out",
            body: "Deactivating the leaked key revokes the original access; quarantining deploy-helper-2 (deny-all) neutralizes the account AND any key attached to it. Nothing was deleted: the audit trail and artifacts remain intact for scope assessment. This ordering — deactivate → quarantine → (later) delete — is the containment discipline CV0-004 and real IR both demand.",
        },
        fail: "Not contained yet: the leaked key must be DEACTIVATED (not deleted) and deploy-helper-2 must be QUARANTINED. Both are needed — either one alone leaves a working path.",
    },
    {
        id: "OBJ-M11",
        mode: "medium",
        pillar: "MITIGATE",
        phase: "ERADICATE",
        title: "ERADICATE: remove every artifact the attacker created — all of them.",
        context: "With access cut and evidence safe, remove persistence: the attacker's keys, the policy attachment, the account itself. Check the 15:03 event before you call it done.",
        controls: [],
        stateCheck: true,
        hints: [
            "Inventory attacker artifacts: two created keys, one policy attachment, one created account.",
            "The backup key SFBKP9… on svc-billing-ci was created by the attacker too — it counts.",
            "Delete SFBKP9…, delete SFOBS4…, detach BillingFullAccess, delete deploy-helper-2.",
        ],
        pass: {
            title: "Eradicated — zero attacker artifacts remain",
            body: "Both attacker-minted keys deleted, BillingFullAccess detached, deploy-helper-2 removed, leaked key still deactivated. The persistence web (T1098.001 + T1136.003 + T1098.003) is dismantled. In a live response you'd next re-issue clean credentials and re-validate alerting — that's the recovery step you'll harden in the next objective.",
        },
        fail: "Something the attacker created still exists. Cross-check every Create* event from 203.0.113.87: the backup key on svc-billing-ci, the deploy-helper-2 key, the policy attachment, and the account itself.",
    },
    {
        id: "OBJ-M12",
        mode: "medium",
        pillar: "MITIGATE",
        phase: "RECOVER",
        title: "RECOVER & HARDEN: switch ON the controls that remove this incident's root causes — and leave the tempting traps OFF.",
        context: "Three cards remove what made this possible (leak-able permanent keys, IAM-write in CI, no scanning). Two cards recreate the problem. Two are good hygiene but optional here.",
        controls: [],
        stateCheck: true,
        hints: [
            "Which cards attack the LEAK (secrets in repos, permanent keys) and the ESCALATION (IAM-write in CI)?",
            "The public-bucket and quiet-logging cards recreate or blind the very controls that worked.",
            "ON: RepoGuard everywhere, Strip IAM-write from CI, Temporary CI credentials. OFF: Public-read export buckets, Quiet the audit trail.",
        ],
        pass: {
            title: "Hardened — recurrence paths closed",
            body: "Secret scanning + pre-commit hooks (M1047/M1043), least-privilege IAM (M1018/M1026) and temporary tokens (T1530 guidance) close all three root causes. The traps would have re-exposed the bucket and blinded the analytics that caught this. MFA on human sign-ins (M1032) is great hygiene but cannot guard an API-key call — that's why the key itself had to die. Storage logging stays on as your detective control.",
        },
        fail: "Check the board: the three root-cause cards must be ON, and the public-bucket / quiet-logging cards must be OFF. MFA and storage-logging are your call — they're not required here.",
    },
];
// ── HARD ──────────────────────────────────────────────────────────────────────
const OBJECTIVES_HARD = [
    {
        id: "OBJ-H1",
        mode: "hard",
        pillar: "RECOGNIZE",
        phase: "IDENTIFY",
        title: "Reconstruct the attacker's six KEY actions in exact order from the audit trail (first misuse → collection burst).",
        context: "The trail is noisy: CI builds, an engineer's routine rotation and admin housekeeping share it with the intrusion. Build the attack's spine: first misuse, backup-credential creation, account creation, its key creation, policy attachment, collection burst.",
        controls: [
            {
                key: "h1_seq",
                label: "Attack spine (in order)",
                type: "sequence",
                options: EVENT_POOL.map(([id]) => id),
                optionLabels: Object.fromEntries(EVENT_POOL),
                helper: "Add exactly six events, in chronological attack order. Benign and noise events must NOT appear.",
            },
        ],
        hints: [
            "Filter out everything from corporate IPs and every event whose principal did something routine that day.",
            "The spine: 14:52 ListBuckets → 15:03 backup key → 15:11 CreateUser → 15:11 its key → 15:14 AttachUserPolicy → 15:26 GetObject burst.",
            "Order: ev-04, ev-06, ev-07, ev-08, ev-09, ev-11.",
        ],
        pass: {
            title: "Spine confirmed — six actions, one afternoon",
            body: "14:52 valid-account entry (T1078.004) → 15:03 backup key (T1098.001) → 15:11 account + key (T1136.003) → 15:14 escalation (T1098.003) → 15:26 collection (T1530). Six minutes of persistence work, eleven minutes to data. Everything from corporate IPs (builds, rotations, typo fixes) was noise — and DescribeInstances, while suspicious, was recon, not one of the six structural moves.",
        },
        fail: "The sequence is off. Required: the 14:52 first misuse, the 15:03 backup key, both 15:11 actions, the 15:14 policy attachment and the 15:26 collection burst — nothing else. Check for stray benign events or a missing step.",
    },
    {
        id: "OBJ-H2",
        mode: "hard",
        pillar: "UNDERSTAND",
        phase: "IDENTIFY",
        title: "Attribute every step of the spine to its exact MITRE technique ID — the precise sub-technique, not the family.",
        context: "Six steps, six IDs, one pool of seven. Precision matters: two adjacent IDs differ by one sub-technique and mean completely different attacker goals.",
        controls: [
            { key: "h2_a", label: "Step 1 · first misuse (valid account)", type: "select", options: TECH_POOL },
            { key: "h2_b", label: "Step 2 · backup key on svc-billing-ci", type: "select", options: TECH_POOL },
            { key: "h2_c", label: "Step 3 · CreateUser deploy-helper-2", type: "select", options: TECH_POOL },
            { key: "h2_d", label: "Step 4 · key for deploy-helper-2", type: "select", options: TECH_POOL },
            { key: "h2_e", label: "Step 5 · AttachUserPolicy", type: "select", options: TECH_POOL },
            { key: "h2_f", label: "Step 6 · GetObject ×412", type: "select", options: TECH_POOL },
        ],
        hints: [
            "T1552.001 is the LEAK (commit time) — none of the six post-compromise steps are it.",
            "Two different steps are both 'additional credentials on a compromised identity' (T1098.001): the backup key AND the new user's key.",
            "a T1078.004 · b T1098.001 · c T1136.003 · d T1098.001 · e T1098.003 · f T1530.",
        ],
        pass: {
            title: "Full technique attribution",
            body: "T1078.004 (Valid Accounts: Cloud Accounts) → T1098.001 (Additional Cloud Credentials) → T1136.003 (Create Account: Cloud Account) → T1098.001 again → T1098.003 (Additional Cloud Roles — the escalation) → T1530 (Data from Cloud Storage). T1548.005 (Temporary Elevated Cloud Access) stayed unused: role ASSUMPTION never happened — the attacker escalated by policy attachment instead. That distinction is what makes your report technically exact.",
        },
        fail: "Re-attribute: entry-by-valid-account is T1078.004; both key-minting moves are T1098.001; the created ACCOUNT is T1136.003; the POLICY ATTACHMENT is T1098.003; the object reads are T1530. The leak's T1552.001 predates all six.",
    },
    {
        id: "OBJ-H3",
        mode: "hard",
        pillar: "RECOGNIZE",
        phase: "IDENTIFY",
        title: "Extract the full IOC set into the incident record — all six indicators, exact values.",
        context: "These six strings are what you block, hunt and report. Exact values, from evidence, not from memory of the alerts.",
        controls: [
            { key: "h3_key", label: "Leaked key ID", type: "text", placeholder: "SF…" },
            { key: "h3_ip", label: "Attacker source IP", type: "text", placeholder: "e.g. 203.x.x.x" },
            { key: "h3_user", label: "Attacker-created account", type: "text", placeholder: "username" },
            { key: "h3_newkey", label: "Key minted for that account", type: "text", placeholder: "SF…" },
            { key: "h3_policy", label: "Escalation policy attached", type: "text", placeholder: "policy name" },
            { key: "h3_bucket", label: "Bucket read", type: "text", placeholder: "sl-…" },
        ],
        hints: [
            "Every value appears in the audit trail resource columns; the alerts only give you partials.",
            "Bucket name ends in -prod; the escalation policy name appears verbatim in ev-09.",
            "SFAPG7K3Q9M2XZ41B6TD · 203.0.113.87 · deploy-helper-2 · SFOBS4LV8QPN2T6EA3KJ · BillingFullAccess · sl-financial-exports-prod.",
        ],
        pass: {
            title: "IOC set complete and exact",
            body: "Leaked key, attacker IP, malicious principal, its key, the escalation policy and the targeted bucket — the full hunting set. These go straight into blocklists, audit-trail queries for the 72h lookback, and the incident report. Note the IP sits in an RFC-5737 documentation range in this exercise; in production you'd also geo/enrich it before blocking anything shared.",
        },
        fail: "One or more IOCs are missing or imprecise. Verify against evidence rows: the leaked key (ev-01), attacker IP (ev-04), account + its key (ev-07/08), policy (ev-09), bucket (ev-10/11).",
    },
    {
        id: "OBJ-H4",
        mode: "hard",
        pillar: "UNDERSTAND",
        phase: "IDENTIFY",
        title: "Explain HOW the escalation was possible: the root enabler, the exact APIs used, and the control that removes it.",
        context: "Anyone can read that a policy was attached. An engineer can say WHY it was allowed to happen — that's the difference this objective tests.",
        controls: [
            {
                key: "h4_root",
                label: "Root enabler",
                type: "select",
                options: ["root-iamwrite", "root-public", "root-mfa", "root-tls"],
                optionLabels: {
                    "root-iamwrite": "svc-billing-ci's deploy policy included iam:CreateUser/AttachUserPolicy it never needed",
                    "root-public": "The export bucket was publicly readable",
                    "root-mfa": "The CI service account had no MFA",
                    "root-tls": "Deprecated TLS cipher suites on the load balancer",
                },
            },
            {
                key: "h4_apis",
                label: "APIs the attacker actually used to escalate",
                type: "multi",
                options: ["AttachUserPolicy", "CreateUser", "CreatePolicyVersion", "PutRolePolicy"],
                helper: "Select every API that appears in the attack spine — and no API that merely COULD have been used.",
            },
            {
                key: "h4_fix",
                label: "The control that removes this enabler",
                type: "select",
                options: ["fix-leastpriv", "fix-firewall", "fix-tls"],
                optionLabels: {
                    "fix-leastpriv": "Restrict IAM-write to PlatformAdmin; audit service-account policies (M1018/M1026)",
                    "fix-firewall": "Add a WAF in front of the API",
                    "fix-tls": "Deprecate legacy cipher suites",
                },
            },
        ],
        hints: [
            "Read BillingDeployPolicy's permission list in the Identity console — what has nothing to do with deploying?",
            "The spine shows CreateUser + AttachUserPolicy. CreatePolicyVersion is real (MITRE cites it) but was NOT used here.",
            "Root: over-privileged CI policy · APIs: CreateUser + AttachUserPolicy · Fix: least privilege (M1018/M1026).",
        ],
        pass: {
            title: "Mechanism explained — the 'why it was allowed'",
            body: "A deployment service account held IAM-write (iam:CreateUser, iam:CreateAccessKey, iam:AttachUserPolicy) — a least-privilege violation that turned any leaked key into a tenant-admin key. The attacker used CreateUser + AttachUserPolicy; CreatePolicyVersion (which MITRE's T1098.003 page documents as another escalation API) was available-but-unused. The fix is M1018/M1026: IAM-write only for PlatformAdmin, policies audited for creep.",
        },
        fail: "Not quite. The bucket was never public and TLS never entered this chain. Re-read BillingDeployPolicy for the enabler, the audit spine for the exact APIs (beware the plausible-but-unused CreatePolicyVersion), and pick the control that removes IAM-write from CI.",
    },
    {
        id: "OBJ-H5",
        mode: "hard",
        pillar: "MITIGATE",
        phase: "CONTAIN",
        title: "CONTAIN under a running clock — in the correct order: leaked key, then backup key, then quarantine. Justify the order by doing it.",
        context: "The clock is live: while the attacker still holds an active credential, every advance risks another move. Order matters: deactivate the leaked key, deactivate the attacker's backup key, then quarantine deploy-helper-2.",
        controls: [],
        stateCheck: true,
        hints: [
            "Kill credentials first — deactivation is instant and doesn't tip off cleanup; deletion can wait for eradication.",
            "The 15:03 backup key (SFBKP9…) keeps working even after the leaked key dies.",
            "Order: deactivate SFAPG7K3… → deactivate SFBKP9… → quarantine deploy-helper-2.",
        ],
        pass: {
            title: "Contained, in defensible order",
            body: "Both live credentials deactivated before anything was deleted, then a deny-all quarantine on the malicious principal — the attacker now holds nothing that authenticates. Deletion waits for eradication so evidence stays intact, and the order you performed is the order you can defend in the review: no window existed where the attacker kept a fallback while artifacts were already being destroyed.",
        },
        fail: "Sequence rejected. Near-miss explanation: deleting artifacts before deactivating BOTH attacker-held keys (leaked SFAPG7K3… AND backup SFBKP9…) leaves a live credential during cleanup — deactivate leaked key → deactivate backup key → quarantine, in that order.",
    },
    {
        id: "OBJ-H6",
        mode: "hard",
        pillar: "MITIGATE",
        phase: "ERADICATE",
        title: "ERADICATE completely: zero attacker artifacts may survive — including anything planted while the clock ran.",
        context: "Sweep the Identity console against every Create* event. If the attacker planted anything else while containment was pending, it goes too.",
        controls: [],
        stateCheck: true,
        hints: [
            "Re-scan the audit trail for Create events after 16:02 — did anything new appear while you worked?",
            "Attacker artifacts: SFBKP9…, SFOBS4…, BillingFullAccess attachment, deploy-helper-2 — plus anything newer.",
            "Delete both attacker keys, detach the policy, delete deploy-helper-2 (and any late-planted account with its key).",
        ],
        pass: {
            title: "Sweep clean — eradication verified",
            body: "Every attacker-created credential deleted, the escalation policy detached, every planted account removed (including anything planted while the clock was running), and the leaked key stays deactivated. This is the completeness discipline of T1098.001/T1136.003 response: persistence mechanisms come in sets, and sets are removed all at once or not at all.",
        },
        fail: "Artifacts remain. Re-run the Create* sweep: both attacker keys (SFBKP9…, SFOBS4…), the BillingFullAccess attachment, deploy-helper-2 itself — and anything the attacker planted while containment was pending (check the newest audit rows).",
    },
    {
        id: "OBJ-H7",
        mode: "hard",
        pillar: "DETECT",
        phase: "IDENTIFY",
        title: "Detection engineering: assemble the chain rule, then pick the false-positive-safe variant and justify it.",
        context: "A rule that pages on benign CI is a rule that gets switched off in a week. Assemble the event chain, then choose the variant a SOC can live with.",
        controls: [
            {
                key: "h7_events",
                label: "Chain events (multi-select)",
                type: "multi",
                options: ["ListBuckets", "DescribeInstances", "CreateUser", "CreateAccessKey", "AttachUserPolicy", "ListObjects", "GetObject"],
                helper: "The events that together mean 'an account is being created and empowered'.",
            },
            { key: "h7_window", label: "Correlation window", type: "select", options: ["within 5 minutes", "within 30 minutes", "within 24 hours"] },
            { key: "h7_src", label: "Source condition", type: "select", options: ["any source", "principals/IPs outside the automation allowlist", "only corporate IPs"] },
            {
                key: "h7_variant",
                label: "Variant to deploy",
                type: "select",
                options: ["v1", "v2", "v3"],
                optionLabels: {
                    v1: "V1 — Alert on ANY CreateUser in the tenant",
                    v2: "V2 — Alert on the CreateUser/CreateAccessKey/AttachUserPolicy chain by principals NOT on the automation allowlist, from non-corporate IPs, within 30 min",
                    v3: "V3 — Alert only when GetObject count from one principal exceeds 400",
                },
            },
            {
                key: "h7_justify",
                label: "Justification",
                type: "select",
                options: ["j1", "j2", "j3"],
                optionLabels: {
                    j1: "Allowlisting known automation keeps true positives while eliminating the scheduled-CI false positives that would erode trust",
                    j2: "Broader rules catch more, and alert fatigue is an acceptable trade-off",
                    j3: "Collection alerts matter more than escalation alerts",
                },
            },
        ],
        hints: [
            "Which three events, chained, are the fingerprint of 'persistence becoming power'? Recon and reads are too common to anchor on.",
            "V3 fires only AFTER exfiltration-scale reads — that's detection post-impact. V1 pages nightly on CI.",
            "Events: CreateUser + CreateAccessKey + AttachUserPolicy · 30 min · outside allowlist · deploy V2 with justification j1.",
        ],
        pass: {
            title: "Deployable detection with defensible tuning",
            body: "The CreateUser + CreateAccessKey + AttachUserPolicy chain inside 30 minutes from non-allowlisted sources is MITRE's AN0900 shape — it catches this attack at the escalation step, BEFORE collection. V2's allowlist is the tuning that makes it survivable: benign automation never pages, so real chains get attention. V1 would cry wolf nightly; V3 only fires after the data is already gone.",
        },
        fail: "Re-assemble: the chain is the three Create/Attach events (not recon, not reads), the window is tight (30 min), and the deployable variant is the one scoped outside the automation allowlist — chosen because it keeps true positives while killing the nightly-CI false positives.",
    },
    {
        id: "OBJ-H8",
        mode: "hard",
        pillar: "MITIGATE",
        phase: "RECOVER",
        title: "Control selection: pick the FOUR mitigations that address this incident, reject the impostors, and name the residual risk.",
        context: "Options mix real MITRE mitigation IDs applied correctly with real IDs applied wrongly. Match each to the failure mode you actually saw.",
        controls: [
            {
                key: "h8_controls",
                label: "Select exactly four",
                type: "multi",
                options: ["c-m1018", "c-m1026", "c-m1047", "c-temptokens", "x-m1032api", "x-m1027pwd", "x-m1055", "x-m1050"],
                optionLabels: {
                    "c-m1018": "M1018 User Account Management — low-privileged accounts cannot attach policies or create users",
                    "c-m1026": "M1026 Privileged Account Management — least-privilege reviews for all service accounts",
                    "c-m1047": "M1047 Audit — secret scanning, credential-storage audits, storage access logging",
                    "c-temptokens": "Replace permanent CI keys with short-lived session tokens (MITRE's T1530 guidance)",
                    "x-m1032api": "M1032 — require MFA on the CI service account's API-key calls",
                    "x-m1027pwd": "M1027 — enforce monthly password expiry for the CI service account",
                    "x-m1055": "M1055 — Do Not Mitigate: accept and monitor the risk",
                    "x-m1050": "M1050 — Exploit Protection on developer laptops",
                },
            },
            {
                key: "h8_residual",
                label: "Residual risk that remains after all four",
                type: "select",
                options: ["res-none", "res-token", "res-bucket"],
                optionLabels: {
                    "res-none": "None — the controls make recurrence impossible",
                    "res-token": "A leaked short-lived token can still be abused until expiry, and social engineering of people bypasses technical controls",
                    "res-bucket": "Public buckets remain the top risk",
                },
            },
        ],
        hints: [
            "Two traps misuse real mitigation IDs: ask 'does this control even apply to an API key?' and 'does it address a leak, an escalation, or nothing?'",
            "MFA can't guard an API-key call; password expiry governs passwords, not keys; 'Do Not Mitigate' and laptop exploit protection don't touch either failure mode.",
            "Correct four: M1018, M1026, M1047, temporary tokens. Residual: res-token.",
        ],
        pass: {
            title: "Control set justified — and honestly scoped",
            body: "M1018 removes the escalation primitive, M1026 stops privilege creep at the source, M1047 detects leaks and preserves evidence, temporary tokens shrink blast radius to minutes. The impostors fail on mechanism: M1032/MFA can't intercept an API-key call, M1027/password expiry governs passwords, M1055 accepts risk this org just experienced, M1050 targets a different attack class. And the honest residual: even good controls leave a token-abuse window and humans who can be talked into things — security is risk reduction, not risk elimination.",
        },
        fail: "Re-check each option against the failure mode you witnessed: leak (commit), escalation (IAM-write), collection (object reads). Exactly four options map to those — the other four either don't apply to API keys or don't apply at all.",
    },
    {
        id: "OBJ-H9",
        mode: "hard",
        pillar: "RECOGNIZE",
        phase: "IDENTIFY",
        title: "Triage discipline: identify the two UNRELATED alerts and pick the correct justification for each.",
        context: "Six alerts, two red herrings. Dismissing evidence for weak reasons is as dangerous as chasing everything — justify exclusions from the data.",
        controls: [
            { key: "h9_alerts", label: "Unrelated to this incident", type: "multi", options: ["A-4471", "A-4472", "A-4473", "A-4474", "A-4475", "A-4476"], helper: "Select the two." },
            {
                key: "h9_cipher_why",
                label: "Cipher-suite alert justification",
                type: "select",
                options: ["hygiene", "exploit", "leak"],
                optionLabels: {
                    hygiene: "TLS hygiene finding on a dev load balancer — no exploitation observed; route to engineering backlog",
                    exploit: "It proves the attacker downgraded TLS to sniff traffic",
                    leak: "It indicates a credential was leaked in transit",
                },
            },
            {
                key: "h9_vpn_why",
                label: "VPN burst justification",
                type: "select",
                options: ["nofail", "success", "related"],
                optionLabels: {
                    nofail: "All 218 attempts FAILED and were rate-blocked; the audit trail shows zero events from that IP",
                    success: "One attempt succeeded — begin account lockdown",
                    related: "The source IP matches the attacker's cloud activity",
                },
            },
        ],
        hints: [
            "Cross-check each alert against audit-trail evidence. Which two have NO supporting events in the identity plane?",
            "The VPN source IP (198.51.100.23) and the attacker's IP (203.0.113.87) are different; nothing succeeded from either alert.",
            "Unrelated: A-4473 (cipher hygiene) and A-4474 (failed VPN burst) — justifications 'hygiene' and 'nofail'.",
        ],
        pass: {
            title: "Two red herrings correctly excluded — with evidence",
            body: "A-4473 is a TLS hygiene backlog item (same exam objective family, different failure mode — cipher deprecation ≠ credential incident). A-4474 is a failed brute-force burst: 218 rejections, rate-blocked, zero audit-trail footprint. Note what you did NOT do: you didn't ignore them — you routed them with justification. And A-4476 (egress) turned out to corroborate the collection burst: correlation across alerts is how single signals become proof.",
        },
        fail: "Re-check the evidence: one herring is a TLS posture finding on a dev device, the other is a burst of FAILED logins from an IP that never appears in the cloud audit trail. Justify each from data, not from alert severity.",
    },
];
const ALL_OBJECTIVES = [...OBJECTIVES_MEDIUM, ...OBJECTIVES_HARD];
const objectivesFor = (mode) => mode === "medium" ? OBJECTIVES_MEDIUM : OBJECTIVES_HARD;
/** The single allowed nudge text for Hard mode (per objective). */
const HARD_NUDGES = Object.fromEntries(OBJECTIVES_HARD.map((o) => [o.id, o.hints[o.hints.length - 1]]));
