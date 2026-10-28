// ─── The Access Bureau — lab content (data) ──────────────────────────────────
// Ported 1:1 from the original framework lab data layer (src/lib/iam-lab/data.ts).
// EVERY artifact below is synthetic training data. All IPs use RFC 5737
// documentation ranges or RFC 1918 private space. All domains are .example.
// "Meridian Credit Union" is fictional.

// ../src/lib/iam-lab/data.ts
var ORG = {
  name: "Meridian Credit Union",
  staff: 450,
  date: "Wednesday 14 May 2025",
  storageKey: "access-bureau-v1"
};
var SCENARIO = {
  headline: "CASE 2025-0514 — “Odd noise on the night ledger”",
  body: [
    `It is 08:55, ${ORG.date}. You are the on-duty IAM analyst at the Access Bureau of ${ORG.name}, a fictional regional credit union with ${ORG.staff} staff. Overnight, the identity provider logged authentication noise from outside the network, and this morning the payroll team reports “strange push notifications on one phone”.`,
    "The Chief of the Bureau hands you a ticket queue: sort the identity records, tune the authentication controls, read the night ledger (audit log), audit the wire room (SSO federation), and lock the place down. Everything is simulated training data — your job is to learn the craft of Identity and Access Management end to end.",
    "Certification relevance: this case exercises CompTIA CySA+ CS0-003, Domain 3 (Security Operations), Lesson 3.2 — Exploring Identity and Access Management. The same skills map to MITRE ATT&CK Valid Accounts (T1078), Brute Force (T1110) and MFA Request Generation (T1621), and to mitigations M1032, M1027, M1036 and M1026."
  ]
};
var ACCOUNTS = [
  { id: "a1", username: "j.okafor", displayName: "Jamila Okafor", type: "human", dept: "Finance", role: "AP-clerk", status: "active", mfa: false, lastLogon: "2 days ago", location: "On-site HQ" },
  { id: "a2", username: "r.delgado", displayName: "Rosa Delgado", type: "human", dept: "Finance", role: "payroll-officer", status: "active", mfa: true, lastLogon: "today", location: "Hybrid (remote Mon–Tue)", remote: true },
  { id: "a3", username: "s.hayes", displayName: "Samuel Hayes", type: "human", dept: "IT Security", role: "security-admin", status: "active", mfa: false, lastLogon: "today", location: "On-site HQ", privileged: true },
  { id: "a4", username: "t.reyes", displayName: "Tania Reyes", type: "human", dept: "IT Operations", role: "sysadmin", status: "active", mfa: false, lastLogon: "today", location: "Remote", privileged: true, remote: true },
  { id: "a5", username: "l.chen", displayName: "Lin Chen", type: "human", dept: "Sales", role: "sales-user", status: "active", mfa: false, lastLogon: "today", location: "Remote", remote: true },
  { id: "a6", username: "p.novak", displayName: "Petr Novák", type: "human", dept: "Legal", role: "legal-user", status: "active", mfa: false, lastLogon: "yesterday", location: "Remote", remote: true },
  { id: "a7", username: "b.talbot", displayName: "Boris Talbot", type: "human", dept: "Finance", role: "finance-admin", status: "active", mfa: false, lastLogon: "today", location: "On-site HQ", privileged: true },
  { id: "a8", username: "m.grant", displayName: "Marcus Grant", type: "human", dept: "HR", role: "hr-user", status: "active", mfa: false, lastLogon: "3 days ago", location: "On-site HQ", note: "Resignation notice on file — last day Friday" },
  { id: "a9", username: "e.graves", displayName: "Edith Graves", type: "human", dept: "Facilities", role: "facilities-user", status: "dormant", mfa: false, lastLogon: "240 days ago", location: "—", note: "No logon for 240 days" },
  { id: "a10", username: "backup-svc", displayName: "Nightly backup job", type: "service", dept: "IT Operations", role: "backup", status: "active", mfa: false, lastLogon: "today 02:00", location: "Server 10.0.4.19", owner: "IT Operations" },
  { id: "a11", username: "svc-invoice-mgr", displayName: "Invoicing application", type: "service", dept: "Finance", role: "invoicing-app", status: "active", mfa: false, lastLogon: "yesterday", location: "App node", owner: "D. Beck (LEFT the company)", note: "Owner departed — no successor named" },
  { id: "a12", username: "front-desk-01", displayName: "Reception kiosk", type: "shared", dept: "Reception", role: "kiosk", status: "active", mfa: false, lastLogon: "4 hours ago", location: "Lobby terminal" },
  { id: "a13", username: "mkt-test-01", displayName: "Campaign demo", type: "shared", dept: "Marketing", role: "vendor-demo", status: "active", mfa: false, lastLogon: "1 hour ago", location: "Vendor demo laptop", note: "Known-noisy: vendor demo causes recurring benign failures" },
  { id: "a14", username: "LT-CAM-114", displayName: "Lobby camera", type: "device", dept: "Facilities", role: "cctv", status: "active", mfa: false, lastLogon: "streaming now", location: "Lobby ceiling" },
  { id: "a15", username: "shared-temp-2019", displayName: "Temp agency contract", type: "shared", dept: "Procurement", role: "temp-contract", status: "dormant", mfa: false, lastLogon: "500 days ago", location: "—", note: "Contract ended 2019 — never deprovisioned" }
];
var LOGS = [
  { id: "L01", ts: "01:58:12", actor: "backup-svc", source: "10.0.4.19", event: "logon.success", detail: "Scheduled nightly backup job sign-in (expected pattern)", kind: "service" },
  { id: "L02", ts: "08:41:02", actor: "l.chen", source: "10.1.7.44", event: "logon.failure", detail: "Bad password (typo, usual device)", kind: "failure" },
  { id: "L03", ts: "08:41:20", actor: "l.chen", source: "10.1.7.44", event: "logon.failure", detail: "Bad password (typo, usual device)", kind: "failure" },
  { id: "L04", ts: "08:42:05", actor: "l.chen", source: "10.1.7.44", event: "logon.success", detail: "Sign-in after two typos, usual device", kind: "success" },
  { id: "L05", ts: "04:10:02", actor: "j.okafor", source: "203.0.113.77", geo: "Amsterdam, NL", event: "logon.failure", detail: "Bad password — attempt 1 against this username", kind: "failure" },
  { id: "L06", ts: "04:10:09", actor: "l.chen", source: "203.0.113.77", geo: "Amsterdam, NL", event: "logon.failure", detail: "Bad password — attempt 1 against this username", kind: "failure" },
  { id: "L07", ts: "04:11:31", actor: "m.grant", source: "203.0.113.77", geo: "Amsterdam, NL", event: "logon.failure", detail: "Bad password — attempt 1 against this username", kind: "failure" },
  { id: "L08", ts: "04:12:00", actor: "p.novak", source: "203.0.113.77", geo: "Amsterdam, NL", event: "logon.failure", detail: "Bad password — attempt 1 against this username", kind: "failure" },
  { id: "L09", ts: "04:13:17", actor: "s.hayes", source: "203.0.113.77", geo: "Amsterdam, NL", event: "logon.failure", detail: "Bad password — attempt 1 against this username", kind: "failure" },
  { id: "L10", ts: "04:14:02", actor: "t.reyes", source: "203.0.113.77", geo: "Amsterdam, NL", event: "logon.failure", detail: "Bad password — attempt 1 against this username", kind: "failure" },
  { id: "L11", ts: "04:16:40", actor: "b.talbot", source: "203.0.113.77", geo: "Amsterdam, NL", event: "logon.failure", detail: "Bad password — attempt 1 against this username", kind: "failure" },
  { id: "L12", ts: "04:18:55", actor: "e.graves", source: "203.0.113.77", geo: "Amsterdam, NL", event: "logon.failure", detail: "Bad password — attempt 1 against this username", kind: "failure" },
  { id: "L13", ts: "04:20:10", actor: "mkt-test-01", source: "203.0.113.77", geo: "Amsterdam, NL", event: "logon.failure", detail: "Bad password — attempt 1 against this username", kind: "failure" },
  { id: "L14", ts: "09:03:11", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.sent", detail: "Push #1 — sign-in attempt from NEW location, new device fingerprint", kind: "mfa" },
  { id: "L15", ts: "09:03:29", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.denied", detail: "User denied push #1", kind: "mfa" },
  { id: "L16", ts: "09:05:44", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.sent", detail: "Push #2", kind: "mfa" },
  { id: "L17", ts: "09:05:51", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.denied", detail: "User denied push #2", kind: "mfa" },
  { id: "L18", ts: "09:07:02", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.sent", detail: "Push #3", kind: "mfa" },
  { id: "L19", ts: "09:07:10", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.denied", detail: "User denied push #3", kind: "mfa" },
  { id: "L20", ts: "09:09:14", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.sent", detail: "Push #4", kind: "mfa" },
  { id: "L21", ts: "09:09:22", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.denied", detail: "User denied push #4", kind: "mfa" },
  { id: "L22", ts: "09:11:20", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.sent", detail: "Push #5 — user phones helpdesk: “I keep getting prompts I did not start”", kind: "mfa" },
  { id: "L23", ts: "09:11:28", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.denied", detail: "User denied push #5", kind: "mfa" },
  { id: "L24", ts: "09:13:03", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.sent", detail: "Push #6", kind: "mfa" },
  { id: "L25", ts: "09:13:11", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.denied", detail: "User denied push #6", kind: "mfa" },
  { id: "L26", ts: "09:14:47", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.sent", detail: "Push #7", kind: "mfa" },
  { id: "L27", ts: "09:14:55", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.denied", detail: "User denied push #7", kind: "mfa" },
  { id: "L28", ts: "09:16:10", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.sent", detail: "Push #8", kind: "mfa" },
  { id: "L29", ts: "09:16:41", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "mfa.push.approved", detail: "Push #8 APPROVED (fatigued user — she later states she meant to silence the phone)", kind: "mfa" },
  { id: "L30", ts: "09:16:55", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "logon.success", detail: "Sign-in succeeded from new location + new device fingerprint", kind: "success" },
  { id: "L31", ts: "09:31:08", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "privilege.granted", detail: "Session added finance-admin role to r.delgado (self-service role request approved by… r.delgado)", kind: "change" },
  { id: "L32", ts: "09:44:52", actor: "r.delgado", source: "198.51.100.23", geo: "Riga, LV", event: "permission.changed", detail: "Created payment-export rule on the payroll vault", kind: "change" },
  { id: "L33", ts: "14:05:33", actor: "mkt-test-01", source: "10.9.2.15", event: "logon.failure", detail: "Vendor demo laptop — known recurring benign failures", kind: "failure" },
  { id: "L34", ts: "14:06:01", actor: "mkt-test-01", source: "10.9.2.15", event: "logon.failure", detail: "Vendor demo laptop — known recurring benign failures", kind: "failure" },
  { id: "L35", ts: "14:09:47", actor: "mkt-test-01", source: "10.9.2.15", event: "logon.success", detail: "Vendor demo sign-in (marketing confirms demo in progress)", kind: "service" }
];
var SPRAY_USERNAMES_HIT = 9;
var SPRAY_IP = "203.0.113.77";
var PUSHES_SENT = 8;
var PERMISSIONS = [
  { id: "view-invoices", label: "view-invoices" },
  { id: "create-invoice-draft", label: "create-invoice-draft" },
  { id: "approve-payments", label: "approve-payments" },
  { id: "requisition-approve", label: "requisition-approve" },
  { id: "manage-users", label: "manage-users" },
  { id: "view-payroll", label: "view-payroll" }
];
var ROLES = [
  { role: "AP-clerk", perms: ["view-invoices"], members: ["j.okafor"] },
  { role: "payroll-officer", perms: ["view-payroll"], members: ["r.delgado"] },
  { role: "finance-admin", perms: ["view-invoices", "approve-payments", "requisition-approve"], members: ["b.talbot", "j.okafor", "m.grant"] },
  { role: "security-admin", perms: ["manage-users"], members: ["s.hayes"] },
  { role: "sysadmin", perms: ["manage-users"], members: ["t.reyes"] },
  { role: "sales-user", perms: [], members: ["l.chen"] },
  { role: "legal-user", perms: [], members: ["p.novak"] },
  { role: "facilities-user", perms: [], members: ["e.graves"] }
];
var CLERK_PERM_OPTIONS = PERMISSIONS.map((p) => p.id);
var PAM_MEMBERSHIP_NOTE = {
  "b.talbot": "Documented need: month-end payment close, approved by CISO (2025-04).",
  "j.okafor": "No documented need for standing approve-payments. AP-clerk duties only.",
  "m.grant": "Departing (HR notice on file). No documented need."
};
var FED_CONFIG = [
  { id: "protocol", label: "Protocol", value: "SAML 2.0", isFlag: false },
  { id: "metadata", label: "Signed metadata certificate", value: "ON", isFlag: false },
  { id: "token-life", label: "Assertion token lifetime", value: "60 minutes", isFlag: false },
  { id: "clock-skew", label: "Allowed clock skew", value: "2 minutes", isFlag: false },
  { id: "mfa-off", label: "Enforce MFA at the IdP before issuing assertions", value: "OFF", isFlag: true },
  { id: "all-users-assignment", label: "Payroll Suite app assignment", value: "ALL 450 users (no least-privilege group)", isFlag: true }
];
var OBJECTIVES = [
  {
    id: "OBJ-M1",
    mode: "medium",
    pillar: "U",
    desk: "manual",
    title: "Sort the four A’s of IAM",
    task: "In the Field Manual, match each term — Identification, Authentication, Authorization, Accounting — to its one-line definition.",
    hints: [
      "The four A’s run in the order a visitor experiences them at a door.",
      "First you claim a name, then you prove it, then access is decided, and every step leaves a record.",
      "Identification = claim who you are · Authentication = prove it · Authorization = what you may touch · Accounting = what was recorded."
    ],
    passFeedback: "You mapped the AAA chain. Every sign-in event in the ledger walks this chain — recognizing which “A” an event belongs to is how analysts read authentication logs.",
    failFeedback: "Not yet. Think of a door: claiming a name, proving it, being allowed through, and the CCTV recording. Re-order your matches."
  },
  {
    id: "OBJ-M2",
    mode: "medium",
    pillar: "U",
    desk: "auth",
    title: "Classify the authentication factors",
    task: "At the Authentication Desk, classify six methods by factor type: knowledge, possession, or inherence.",
    hints: [
      "Ask: does the method depend on something you know, something you hold, or something you are?",
      "Password and security questions live in the head. Keys, cards and phone-generated codes live in the hand.",
      "knowledge: password, security questions · possession: TOTP app code, hardware security key · inherence: fingerprint, face scan."
    ],
    passFeedback: "Factor classification is the grammar of MFA: strong MFA combines factor TYPES, not two examples of the same type.",
    failFeedback: "Close, but re-check the split: codes generated by an app are “something you have” (the device), not something you know."
  },
  {
    id: "OBJ-M3",
    mode: "medium",
    pillar: "U",
    desk: "federation",
    title: "Trace one login through SSO",
    task: "At the Wire Room, pick the statement that correctly describes single sign-on, then label the two nodes: identity provider vs service provider.",
    hints: [
      "In SSO the password is typed in exactly one place. Who is that place, and who trusts it?",
      "The IdP authenticates the user; the application (service provider) consumes the signed assertion.",
      "Correct statement: “The user authenticates once to the identity provider; applications trust its assertion.” IdP = Bureau IdP, SP = Payroll Suite."
    ],
    passFeedback: "You traced the trust flow. Federation is why attackers love phishing the IdP: one credential unlocks every wired application.",
    failFeedback: "Not yet. One node does the authenticating; the other node trusts the result. Re-label and re-read the three statements."
  },
  {
    id: "OBJ-M4",
    mode: "medium",
    pillar: "R",
    desk: "identity",
    title: "Sort the directory by identity type",
    task: "At the Identity Desk, classify six directory records as human, service, shared, or device accounts.",
    hints: [
      "Ask who — or what — actually uses each account day to day.",
      "Backup jobs and applications log in on their own; kiosks and cameras are not people either.",
      "j.okafor and r.delgado are human · backup-svc and svc-invoice-mgr are service · front-desk-01 and mkt-test-01 are shared · LT-CAM-114 is a device account."
    ],
    passFeedback: "Identity typing drives policy: service accounts get vaulted credentials, shared accounts are policy violations waiting to happen, devices use certificates. You cannot protect what you have not typed.",
    failFeedback: "Re-check the non-humans: a scheduled job, an application, a lobby kiosk, and a camera each deserve a different type."
  },
  {
    id: "OBJ-M5",
    mode: "medium",
    pillar: "R",
    desk: "access",
    title: "Enforce least privilege for the new clerk",
    task: "At the Access Desk, build the minimum permission set for the new AP-clerk, then flag the separation-of-duties violation hiding in the finance-admin role.",
    hints: [
      "Least privilege: the clerk drafts invoices but does not approve payments.",
      "SoD rule: nobody should both raise a requisition AND approve the payment.",
      "Select view-invoices + create-invoice-draft only; flag finance-admin holding requisition-approve + approve-payments together."
    ],
    passFeedback: "Two classic IAM lessons in one ticket: roles start minimal (privilege creep is added later, never removed by itself), and SoD conflicts are fraud insurance. Flagging the pair was the senior-analyst move.",
    failFeedback: "Re-read the SoD rule: one person raising and approving the same payment is the violation. And the clerk needs no approval rights."
  },
  {
    id: "OBJ-M6",
    mode: "medium",
    pillar: "R",
    desk: "audit",
    title: "Count the push flood",
    task: "In the ledger, filter to r.delgado’s morning: how many MFA push requests were sent before one was approved, and what happened immediately after?",
    hints: [
      "Filter the ledger to actor r.delgado and event kind “MFA”.",
      "Count every mfa.push.sent row, then look at the very next event after the approval.",
      "8 pushes were sent; the 8th was approved, and sign-in then succeeded from the unusual location (Riga, LV)."
    ],
    passFeedback: "This is an MFA-fatigue attack (MITRE T1621): the attacker already has the password and spams pushes hoping one lands on a tired thumb. The log shape — pushes, denial, denial, approval — is the signature.",
    failFeedback: "Re-filter and recount: each mfa.push.sent is one push. Then read what the ledger says right after mfa.push.approved."
  },
  {
    id: "OBJ-M7",
    mode: "medium",
    pillar: "D",
    desk: "audit",
    title: "Name the overnight spray",
    task: "In the ledger’s overnight block: name the attack pattern, the source IP, and how many distinct usernames were tried.",
    hints: [
      "Overnight rows share one outside IP. How many passwords does each username get?",
      "One or two attempts per username across many usernames is the definition of spraying — stuffing would replay known password pairs.",
      "Pattern: password spraying (T1110.003) · IP: 203.0.113.77 · distinct usernames: 9."
    ],
    passFeedback: "You read the spray correctly. Detection logic for this shape: count distinct usernames with failures per source IP in a short window — that is exactly the rule you would build next.",
    failFeedback: "Look again: every overnight failure is attempt #1 against a different username, all from one external IP. What do we call that?"
  },
  {
    id: "OBJ-M8",
    mode: "medium",
    pillar: "D",
    desk: "audit",
    title: "Match the four pattern cards",
    task: "In the ledger’s pattern cards, match each log excerpt to its attack name: password spraying, credential stuffing, MFA fatigue, kerberoasting.",
    hints: [
      "Spraying = few passwords, many usernames. Stuffing = replayed breached username:password pairs.",
      "MFA fatigue = push spam. Kerberoasting = offline cracking of service-account Kerberos tickets (T1558.003).",
      "A → spraying · B → stuffing · C → MFA fatigue (T1621) · D → kerberoasting."
    ],
    passFeedback: "Four shapes, four names — this vocabulary is how SOC tickets get routed to the right responder in seconds.",
    failFeedback: "Re-read the differentiators: how many passwords per username, where the pairs came from, whether pushes or Kerberos tickets are involved."
  },
  {
    id: "OBJ-M9",
    mode: "medium",
    pillar: "M",
    desk: "auth",
    title: "Write the password policy",
    task: "At the Authentication Desk’s policy console, set: minimum length ≥ 12, complexity ON, lockout after ≤ 5 failures, password history ≥ 5.",
    hints: [
      "Move each slider to the ticket’s target; the console shows the target again in the stamp area.",
      "Length 12+, lockout 5 or fewer attempts, remember at least 5 old passwords so they cannot be reused.",
      "minLength 12 · complexity ON · lockout 5 · history 5."
    ],
    passFeedback: "This console is MITRE M1027 (Password Policies) + M1036 (Account Use Policies) in miniature — it directly blunts T1110.003 spraying, as the overnight block showed.",
    failFeedback: "The ticket names exact thresholds. Match each control to the number on the ticket, then re-stamp."
  },
  {
    id: "OBJ-M10",
    mode: "medium",
    pillar: "M",
    desk: "auth",
    title: "Turn on the right MFA",
    task: "On the MFA enrollment board, enable MFA for every administrator, every privileged approver, and every remote or hybrid worker. Leave service, shared, device and on-site standard accounts alone.",
    hints: [
      "The board shows each account’s flags (privileged, remote). Toggle the ones that match the ticket’s three categories.",
      "r.delgado already has MFA (that is why the attacker had to fatigue it) — leave her on.",
      "Enable: s.hayes, t.reyes, b.talbot, l.chen, p.novak (r.delgado stays on). Everyone else stays off for this rollout."
    ],
    passFeedback: "This is MITRE M1032 (Multi-factor Authentication) aimed at exactly the accounts the overnight spray targeted. Blocking T1110 is nice; forcing MFA on privileged and remote identities is where T1078 bleeds.",
    failFeedback: "Two failure modes: forgetting a remote worker, or switching on a service account that cannot even answer a push. Re-check both lists."
  },
  {
    id: "OBJ-M11",
    mode: "medium",
    pillar: "M",
    desk: "identity",
    title: "Run the lifecycle review",
    task: "On the Identity Desk’s lifecycle worksheet, choose the right action for four flagged records: departing employee, dormant account, orphaned service account, active shared demo.",
    hints: [
      "Deprovisioning = disable on exit. Dormant = disable pending re-approval. Orphaned = re-own it. Active = retain (documented).",
      "m.grant is leaving Friday — that account must not survive the week.",
      "m.grant → disable · e.graves → disable · svc-invoice-mgr → reassign owner · mkt-test-01 → retain (active, documented)."
    ],
    passFeedback: "You executed M1018 (User Account Management): the joiner-mover-leaver lifecycle is where most privilege creep and orphaned access is born — and where it dies.",
    failFeedback: "Match action to evidence: an exit notice, a 240-day sleep, a departed owner, and an active demo each call for a different line on the form."
  },
  {
    id: "OBJ-H1",
    mode: "hard",
    pillar: "U",
    desk: "audit",
    title: "Tag the AAA sequence",
    task: "In the ledger’s incident timeline, tag each of the four events with its “A”: Identification, Authentication, Authorization, or Accounting.",
    hints: [
      "Tag by what the system was doing at that instant, not by what the user intended.",
      "A submitted OTP proves something; a role check decides something; a written row records something.",
      "username → Identification · password+OTP → Authentication · role check → Authorization · log row written → Accounting."
    ],
    passFeedback: "Tagging the chain under pressure is how you explain an incident timeline to an auditor or a court — each “A” has different evidence and different failure modes.",
    failFeedback: "Re-tag: the ledger row being written is Accounting even if it describes an authentication. Tag the event itself, not its subject."
  },
  {
    id: "OBJ-H2",
    mode: "hard",
    pillar: "R",
    desk: "audit",
    title: "Find the intruder",
    task: "Read the whole night ledger (it contains noise and red herrings). Name the compromised account, the MITRE technique used to get in (exact ID), and the technique demonstrated once inside (exact ID).",
    hints: [
      "One use this costs a star — start from the successful sign-ins and work backwards.",
      "Ignore backup-svc (scheduled), mkt-test-01 (demo) and l.chen’s two typos. One account shows pushes it denied, then approved.",
      "Account: r.delgado · entry technique: T1621 (MFA request generation / fatigue) · inside: T1078 (Valid Accounts — self-granted finance-admin, payment-export rule)."
    ],
    passFeedback: "You separated signal from noise and produced the two IDs an incident ticket needs. Entry = T1621, impact path = T1078; note how the self-approved role grant is ALSO an account-manipulation tell (T1098 family).",
    failFeedback: "Not quite. Which sign-in succeeded from a location the account had never used, and what did that session DO afterwards? IDs must be exact (T-number)."
  },
  {
    id: "OBJ-H3",
    mode: "hard",
    pillar: "D",
    desk: "audit",
    title: "Build the spray detector",
    task: "In the ledger’s detection rule editor, build a password-spraying rule: correct data source, correct aggregation, threshold 5–10 distinct usernames, window ≤ 10 minutes, and exclude exactly one known-noisy account.",
    hints: [
      "Spraying is spread across usernames, so aggregate distinct usernames with failures — not total failures.",
      "Exclude narrowly: excluding “all service accounts” would blind you the day an attacker wears a service-account costume.",
      "source: Sign-in logs · aggregation: distinct usernames · threshold 5–10 · window 5–10 min · exclusions: mkt-test-01 only."
    ],
    passFeedback: "This rule would have caught the 04:10 block in under two minutes. Narrow exclusions keep precision without sacrificing coverage — a detection engineering lesson in itself.",
    failFeedback: "Re-check four things: aggregation (distinct usernames, not total failures), the threshold band, the window, and whether your exclusion list is too wide."
  },
  {
    id: "OBJ-H4",
    mode: "hard",
    pillar: "D",
    desk: "audit",
    title: "True positive or false positive?",
    task: "Verdict six ledger excerpts: TP or FP, all six must be correct.",
    hints: [
      "Judge by shape: who, how many, from where, and does the pattern match a known attack?",
      "Scheduled jobs, typos and approved demos are noise; single-source multi-username failures, push floods and ticket-request spikes are signal.",
      "1 TP · 2 FP · 3 TP · 4 FP · 5 TP · 6 FP."
    ],
    passFeedback: "Perfect verdict sheet. The hardest skill in detection engineering is not writing rules — it is adjudicating their output without burning out on noise.",
    failFeedback: "One or more verdicts are off. Re-ask for each: is this pattern explained by scheduled, human or demo behavior — or only by an attacker?"
  },
  {
    id: "OBJ-H5",
    mode: "hard",
    pillar: "M",
    desk: "identity",
    title: "Sequence the containment",
    task: "On the Identity Desk’s response board, order the five containment steps for the r.delgado intrusion. One tray step must NOT be used.",
    hints: [
      "Cut access before you rotate anything, or the attacker’s live session will simply re-login.",
      "Sessions and tokens outlive the password: revoke them explicitly, then rotate.",
      "Disable account → revoke sessions & tokens → reset credentials + re-enroll MFA → review activity & adjust entitlements → restore with monitoring. “Delete mailbox and files” stays in the tray."
    ],
    passFeedback: "Correct sequence: access cut, sessions dead, credentials rotated, blast radius measured, then a monitored return. Deleting evidence (the distractor) would have destroyed the very ledger you used to convict the session.",
    failFeedback: "Re-order: what must be true before a password reset actually locks the attacker out? And which tray step destroys evidence instead of access?"
  },
  {
    id: "OBJ-H6",
    mode: "hard",
    pillar: "M",
    desk: "access",
    title: "Map findings to MITRE mitigations",
    task: "On the Access Desk’s control board, map each of the three audit findings to its official MITRE mitigation ID. All three must be exact.",
    hints: [
      "Lockout behavior lives under Account Use Policies; second factors under MFA; vaulted admin checkout under Privileged Account Management.",
      "Distractors M1027 (Password Policies) and M1030 (Access Control) are real controls — but they are not the best fit here.",
      "Finding 1 → M1036 · Finding 2 → M1032 · Finding 3 → M1026."
    ],
    passFeedback: "Speaking in M-IDs lets you defend a control budget to management with ATT&CK as the shared language: each mapping carries documented technique coverage.",
    failFeedback: "Two M-IDs are close cousins (M1027 vs M1036). Lockout after repeated failures is account-use policy; password construction rules are password policy."
  },
  {
    id: "OBJ-H7",
    mode: "hard",
    pillar: "R",
    desk: "federation",
    title: "Audit the wire room config",
    task: "At the Wire Room, review the SAML federation configuration and flag exactly the two configuration errors. Everything else is correct and must not be flagged.",
    hints: [
      "Ask two questions: does EVERY assertion require a fresh MFA proof, and does every app assignment follow least privilege?",
      "Token lifetime, clock skew, signed metadata and the protocol choice are all fine.",
      "Flag: “Enforce MFA at the IdP = OFF” and “Payroll Suite assigned to ALL 450 users”."
    ],
    passFeedback: "Both flags are identity-chain failures: without IdP-side MFA, a phished password mints assertions for every wired app; without least-privilege assignment, the blast radius of the IdP is all 450 staff.",
    failFeedback: "Exactly two lines are wrong. Over-flagging is its own failure mode — a config audit must be precise."
  },
  {
    id: "OBJ-H8",
    mode: "hard",
    pillar: "M",
    desk: "access",
    title: "Right-size finance-admin",
    task: "On the Access Desk’s PAM board: enable just-in-time elevation for finance-admin, remove standing approve-payments from every member without documented need, keep the documented one, and reject the service-account shortcut.",
    hints: [
      "The justification column decides. Documented month-end need = keep; everyone else loses standing approval.",
      "JIT turns “always admin” into “admin for 4 hours, with approval” — that is M1026 in practice.",
      "JIT ON · remove j.okafor and m.grant · keep b.talbot · do NOT add backup-svc to the role."
    ],
    passFeedback: "You replaced standing privilege with time-boxed privilege and used the justification record as the decision surface — that is privileged access management as designed.",
    failFeedback: "Re-read the justification column, and think about what adding a backup service account to a payment role would do to your SoD story."
  },
  {
    id: "OBJ-H9",
    mode: "hard",
    pillar: "M",
    desk: "identity",
    title: "Quarterly access review",
    task: "On the Identity Desk’s review worksheet, disable exactly the accounts the quarterly review must remove, and schedule the next review. Flag nothing else.",
    hints: [
      "Criteria: dormant far beyond policy, orphaned ownership, expired contract. Active-but-noisy is not a criterion.",
      "mkt-test-01 is active and documented; LT-CAM-114 is a working device. Neither leaves the directory today.",
      "Disable: e.graves, shared-temp-2019, svc-invoice-mgr · schedule quarterly review ON."
    ],
    passFeedback: "A defensible review: three removals, each with a policy basis, and a recurring schedule so the next round is a formality instead of an archaeology dig.",
    failFeedback: "Your set is off. Apply the three criteria strictly — dormant, orphaned, expired — and resist disabling accounts merely because they are unusual."
  }
];
var objectiveById = (id) => OBJECTIVES.find((o) => o.id === id);
var objectivesFor = (mode) => OBJECTIVES.filter((o) => o.mode === mode);

// ── R6 (QA-103): per-row option layouts for the matching desks ──────────────
// Every matching dropdown used to list its options in the SAME canonical order,
// so the correct choice sat on the array diagonal (row 1 → option 1, …).
// Each row now lists the FULL option set in a different, deterministic order
// (no Math.random — keeps persistence, checks and file:// runs stable), and
// the correct option's index varies row to row so position gives nothing away.
var byIds = (order, options) => order.map((id) => options.find((o) => o.id === id));
var TERM_OPTION_ORDER = {
  identification: ["prove", "claim", "decide", "record"],
  authentication: ["claim", "decide", "record", "prove"],
  authorization: ["decide", "record", "prove", "claim"],
  accounting: ["claim", "prove", "record", "decide"],
};
var FACTOR_OPTION_ORDER = {
  password: ["possession", "knowledge", "inherence"],
  totp: ["knowledge", "inherence", "possession"],
  fingerprint: ["inherence", "knowledge", "possession"],
  hkey: ["knowledge", "possession", "inherence"],
  secq: ["possession", "inherence", "knowledge"],
  face: ["inherence", "possession", "knowledge"],
};
var ACCOUNT_TYPE_OPTION_ORDER = {
  "j.okafor": ["service", "human", "shared", "device"],
  "backup-svc": ["human", "shared", "service", "device"],
  "front-desk-01": ["shared", "human", "device", "service"],
  "LT-CAM-114": ["human", "service", "device", "shared"],
  "r.delgado": ["device", "human", "service", "shared"],
  "mkt-test-01": ["service", "device", "shared", "human"],
};
var PATTERN_OPTION_ORDER = {
  A: ["stuffing", "kerberoasting", "spraying", "mfa-fatigue"],
  B: ["mfa-fatigue", "spraying", "kerberoasting", "stuffing"],
  C: ["kerberoasting", "mfa-fatigue", "stuffing", "spraying"],
  D: ["mfa-fatigue", "stuffing", "kerberoasting", "spraying"],
};
var AAA_OPTION_ORDER = {
  e1: ["authentication", "identification", "accounting", "authorization"],
  e2: ["authorization", "accounting", "authentication", "identification"],
  e3: ["authorization", "identification", "accounting", "authentication"],
  e4: ["identification", "accounting", "authorization", "authentication"],
};
var TERM_OPTIONS = [
  { id: "claim", text: "Claiming who you are — presenting a username or badge number" },
  { id: "prove", text: "Proving that claim — password, OTP, biometric, key" },
  { id: "decide", text: "Deciding what the proven identity may access and do" },
  { id: "record", text: "Recording what the identity did — audit logs, reviews" }
];
var TERM_ITEMS = [
  { id: "identification", label: "Identification", answer: "claim" },
  { id: "authentication", label: "Authentication", answer: "prove" },
  { id: "authorization", label: "Authorization", answer: "decide" },
  { id: "accounting", label: "Accounting", answer: "record" }
];
var FACTOR_ITEMS = [
  { id: "password", label: "Password", answer: "knowledge" },
  { id: "totp", label: "TOTP app code (30-second number)", answer: "possession" },
  { id: "fingerprint", label: "Fingerprint scan", answer: "inherence" },
  { id: "hkey", label: "Hardware security key (FIDO2)", answer: "possession" },
  { id: "secq", label: "Security questions", answer: "knowledge" },
  { id: "face", label: "Face scan", answer: "inherence" }
];
var FACTOR_OPTIONS = [
  { id: "knowledge", text: "Knowledge — something you know" },
  { id: "possession", text: "Possession — something you have" },
  { id: "inherence", text: "Inherence — something you are" }
];
var SSO_STATEMENT_OPTIONS = [
  { id: "a", text: "Users must re-enter the same password at every application for safety." },
  { id: "b", text: "The user authenticates once to the identity provider; applications trust its signed assertion." },
  { id: "c", text: "One shared password is stored by each application and given to all users." }
];
var ACCOUNT_TYPE_ITEMS = ["j.okafor", "backup-svc", "front-desk-01", "LT-CAM-114", "r.delgado", "mkt-test-01"];
var ACCOUNT_TYPE_OPTIONS = [
  { id: "human", text: "Human account" },
  { id: "service", text: "Service account" },
  { id: "shared", text: "Shared account" },
  { id: "device", text: "Device account" }
];
var LIFECYCLE_ITEMS = [
  { id: "m.grant", label: "m.grant (HR) — resignation notice on file, last day Friday" },
  { id: "e.graves", label: "e.graves (Facilities) — no logon for 240 days" },
  { id: "svc-invoice-mgr", label: "svc-invoice-mgr — owner D. Beck left the company" },
  { id: "mkt-test-01", label: "mkt-test-01 (Marketing) — active vendor demo, documented" }
];
var LIFECYCLE_OPTIONS = [
  { id: "disable", text: "Disable / deprovision" },
  { id: "reassign", text: "Reassign owner (keep running)" },
  { id: "retain", text: "Retain — active and documented" }
];
var AAA_ITEMS = [
  { id: "e1", label: "09:16:40 — r.delgado’s username is submitted at the sign-in page" },
  { id: "e2", label: "09:16:41 — password + approved MFA push are verified" },
  { id: "e3", label: "09:31:08 — system checks the finance-admin role before opening the payments screen" },
  { id: "e4", label: "09:44:52 — the payment-export event is written to the audit ledger" }
];
var AAA_OPTIONS = [
  { id: "identification", text: "Identification" },
  { id: "authentication", text: "Authentication" },
  { id: "authorization", text: "Authorization" },
  { id: "accounting", text: "Accounting" }
];
var PATTERN_CARDS = [
  { id: "A", label: "Card A", text: "40 failed sign-ins · 3 different passwords tried · 60 different usernames · all from one external IP in 15 minutes." },
  { id: "B", label: "Card B", text: "Failures across 15 usernames · every attempt uses a DIFFERENT, plausible password · attempts arrive from 12 unrelated IPs · matches a known breach dump’s format." },
  { id: "C", label: "Card C", text: "9 MFA push requests to one user in 6 minutes · user denies 8 · approves the 9th “to make it stop” · sign-in then succeeds from a new country." },
  { id: "D", label: "Card D", text: "200 Kerberos TGS ticket requests for service accounts from one workstation · requests ask for RC4-encrypted tickets · no interactive logons involved." }
];
var PATTERN_OPTIONS = [
  { id: "spraying", text: "Password spraying (T1110.003)" },
  { id: "stuffing", text: "Credential stuffing (T1110.004)" },
  { id: "mfa-fatigue", text: "MFA request generation / fatigue (T1621)" },
  { id: "kerberoasting", text: "Kerberoasting (T1558.003)" }
];
var TPFP_ITEMS = [
  { id: "t1", text: "60 failed sign-ins across 40 usernames from one external IP in 15 minutes.", answer: true, why: "Single source, many usernames, no legit explanation → spraying (T1110.003)." },
  { id: "t2", text: "backup-svc signs in successfully at 02:00 every night from 10.0.4.19.", answer: false, why: "Scheduled job, fixed internal host, fixed time — baseline it, don’t page on it." },
  { id: "t3", text: "5 MFA pushes denied in 3 minutes, then one approved, all from a new country.", answer: true, why: "Push flood then acceptance is the T1621 fatigue signature." },
  { id: "t4", text: "l.chen fails twice, then signs in from her usual device and usual desk.", answer: false, why: "Two typos followed by success on the baseline device — human behavior." },
  { id: "t5", text: "200 Kerberos TGS requests for service accounts from one workstation within minutes.", answer: true, why: "Ticket-request spike = Kerberoasting (T1558.003)." },
  { id: "t6", text: "One MFA push denied by the user; 3 minutes later they sign in normally from their usual device.", answer: false, why: "A single denied push with normal follow-on behavior — likely a stray prompt." }
];
var CONTAINMENT_STEPS = [
  { id: "S1", text: "Disable the compromised account (r.delgado)" },
  { id: "S2", text: "Revoke all active sessions and refresh tokens" },
  { id: "S3", text: "Reset credentials and re-enroll MFA" },
  { id: "S4", text: "Review recent activity and adjust entitlements" },
  { id: "S5", text: "Restore access with new credentials and heightened monitoring" },
  { id: "DX", text: "Delete the user’s mailbox and files" }
];
var CONTAINMENT_DISPLAY_ORDER = ["S3", "S5", "DX", "S1", "S4", "S2"];
var CONTAINMENT_CORRECT = ["S1", "S2", "S3", "S4", "S5"];
var MITRE_FINDINGS = [
  { id: "f1", text: "Finding 1 — Accounts are never locked out after repeated failed sign-ins.", answer: "M1036" },
  { id: "f2", text: "Finding 2 — Remote sign-ins require only a password (no second factor).", answer: "M1032" },
  { id: "f3", text: "Finding 3 — Admin credentials are shared in a team chat instead of a vault with just-in-time checkout.", answer: "M1026" }
];
var MITRE_OPTIONS = ["M1032", "M1026", "M1036", "M1027", "M1030", "M1047"];
var RULE_SOURCES = [
  { id: "signin", text: "Sign-in / authentication logs (IdP · AD — DS0002 User Account, DS0028 Logon Session)" },
  { id: "netflow", text: "Network flow records" },
  { id: "edr", text: "EDR process events" }
];
var RULE_AGGREGATIONS = [
  { id: "total-failures", text: "Total failed sign-ins per source" },
  { id: "distinct-users", text: "Distinct usernames with failures per source" }
];
var RULE_EXCLUSION_OPTIONS = [
  { id: "backup-svc", text: "backup-svc (scheduled job — succeeds, never fails)" },
  { id: "mkt-test-01", text: "mkt-test-01 (documented demo account — recurring benign failures)" },
  { id: "all-service", text: "All service accounts, wholesale" },
  { id: "front-desk-01", text: "front-desk-01 (reception kiosk)" }
];
var QUIZ = [
  {
    id: "qz-m1",
    mode: "medium",
    topic: "AAA chain order",
    prompt: "Put the AAA chain in the order a sign-in experiences it.",
    options: [
      { id: "a", text: "Authentication → Identification → Accounting → Authorization" },
      { id: "b", text: "Identification → Authentication → Authorization → Accounting" },
      { id: "c", text: "Authorization → Authentication → Identification → Accounting" }
    ],
    answer: "b",
    explanation: "You claim (identification), prove (authentication), get decided on (authorization), and everything is written down (accounting). Auditors read the ledger backwards."
  },
  {
    id: "qz-m2",
    mode: "medium",
    topic: "Authentication factor types",
    prompt: "Which of these is a POSSESSION factor?",
    options: [
      { id: "a", text: "A fingerprint biometric scan" },
      { id: "b", text: "A personal security question" },
      { id: "c", text: "A hardware security key" }
    ],
    answer: "c",
    explanation: "A hardware key is something you HAVE — unphishable possession. The scan is inherence (something you are) and the question is knowledge (something you know). Strong MFA mixes factor TYPES: password + key works, password + security question does not."
  },
  {
    id: "qz-m3",
    mode: "medium",
    topic: "SSO trade-offs",
    prompt: "What is the main security trade-off of single sign-on?",
    options: [
      { id: "a", text: "One phished password unlocks every wired application" },
      { id: "b", text: "SSO replaces the need for separate MFA" },
      { id: "c", text: "Administrators can no longer review sign-in logs" }
    ],
    answer: "a",
    explanation: "SSO concentrates risk at the IdP: one phished password mints assertions for every wired app — which is why SSO must sit ON TOP of MFA (M1032), never instead of it. The distractors are real misconceptions: SSO does not replace MFA (b), and it centralizes rather than blocks sign-in logging (c)."
  },
  {
    id: "qz-m4",
    mode: "medium",
    topic: "RBAC vs ABAC",
    prompt: "RBAC grants access based on ______; ABAC grants access based on ______.",
    options: [
      { id: "a", text: "the manager’s approval / the employee’s years of service" },
      { id: "b", text: "job roles / user, resource and context attributes" },
      { id: "c", text: "strength of the password / classification of the data" }
    ],
    answer: "b",
    explanation: "RBAC attaches permissions to job roles; ABAC evaluates attributes of the user, resource and context on every request. Approval chains and tenure (a) are HR concepts, not access models, and neither model keys on password strength or data labels (c)."
  },
  {
    id: "qz-m5",
    mode: "medium",
    topic: "Least privilege",
    prompt: "“Least privilege” means:",
    options: [
      { id: "a", text: "Every identity holds the minimum access its task requires" },
      { id: "b", text: "Access is stripped from all accounts once a year" },
      { id: "c", text: "Admins share one powerful account for daily work" }
    ],
    answer: "a",
    explanation: "Least privilege caps the blast radius of any single credential: exactly what the job needs, nothing more. Annual strip-everything reviews (b) break the business without targeting actual excess, and a shared admin account (c) is the opposite of privileged account management (M1026)."
  },
  {
    id: "qz-m6",
    mode: "medium",
    topic: "MFA-fatigue defenses",
    prompt: "The best defense against MFA-fatigue push spam (T1621) is:",
    options: [
      { id: "a", text: "Longer and more complex passwords" },
      { id: "b", text: "Number matching on push approvals" },
      { id: "c", text: "Push notifications disabled at night" }
    ],
    answer: "b",
    explanation: "Number matching forces the user to type the code shown on the sign-in screen, so a blind “approve” stops working — T1621 blunted. Longer passwords (a) do not help: the attacker already HAS the password. And a night-time push curfew (c) just moves the attack to 9 a.m."
  },
  {
    id: "qz-m7",
    mode: "medium",
    topic: "Federation protocols",
    prompt: "Which pairing of federation protocol and its job is correct?",
    options: [
      { id: "a", text: "OAuth 2.0 — verifies the user’s password at every application" },
      { id: "b", text: "OIDC — carries authorization grants instead of identity claims" },
      { id: "c", text: "SAML — carries signed XML identity assertions to service providers" }
    ],
    answer: "c",
    explanation: "SAML 2.0 moves signed XML assertions from IdP to service provider. The distractors swap the jobs: OAuth 2.0 delegates authorization with tokens (it never passes your password to apps), and OIDC is the identity layer ON TOP of OAuth 2.0 — it exists to carry identity claims."
  },
  {
    id: "qz-h1",
    mode: "hard",
    topic: "Kerberoasting response",
    evidence: "Ledger: 200 Kerberos TGS requests for service accounts from one workstation within minutes, RC4-encrypted tickets requested.",
    prompt: "What is happening, and what is the FIRST corrective control?",
    options: [
      { id: "a", text: "Password spraying — lock out the workstation user" },
      { id: "b", text: "Kerberoasting — rotate the service account passwords" },
      { id: "c", text: "MFA fatigue — turn off push notifications" }
    ],
    answer: "b",
    explanation: "A spike of TGS ticket requests for service accounts, RC4 requested, one host — that is Kerberoasting (T1558.003): the tickets are cracked offline at leisure. Rotation (or gMSA) destroys the cracked secret’s value. Locking out the workstation user (a) misreads the spray shape, and push notifications (c) play no role in Kerberos."
  },
  {
    id: "qz-h2",
    mode: "hard",
    topic: "Separation of duties",
    evidence: "The finance-admin role holds both requisition-approve and approve-payments.",
    prompt: "Why does the analyst flag this configuration?",
    options: [
      { id: "a", text: "It makes role membership impossible to revoke cleanly" },
      { id: "b", text: "It breaks the password history rule for finance" },
      { id: "c", text: "It lets one person raise and approve payments" }
    ],
    answer: "c",
    explanation: "Separation of duties: whoever raises a payment must never be able to approve it — that one pairing (c) is a fraud path. Role memberships are revoked at will (a), and password history (b) governs credential reuse, not role design."
  },
  {
    id: "qz-h3",
    mode: "hard",
    topic: "Legacy-auth MFA gaps",
    evidence: "The IdP enforces MFA everywhere except one legacy protocol path used by a single old application. Spraying is now hitting that path.",
    prompt: "Best fix?",
    options: [
      { id: "a", text: "Add the old application’s users to a stricter password group" },
      { id: "b", text: "Disable legacy authentication / enforce MFA on every protocol path" },
      { id: "c", text: "Reduce the token lifetime to 15 minutes" }
    ],
    answer: "b",
    explanation: "Attackers probe for the weakest path, not the average one. A single MFA-exempt protocol defeats the control (and is T1556.009 territory)."
  },
  {
    id: "qz-h4",
    mode: "hard",
    topic: "MFA-fatigue triage",
    evidence: "A user reports six MFA pushes at 03:00, all denied. Next morning they sign in normally with no anomalies.",
    prompt: "Correct classification and response?",
    options: [
      { id: "a", text: "Attempted MFA-fatigue — rotate credentials, review grants, monitor" },
      { id: "b", text: "Confirmed takeover — disable the account immediately" },
      { id: "c", text: "False positive — close the ticket with no action" }
    ],
    answer: "a",
    explanation: "Six denied pushes mean the attacker already held the password; only the denials held them off. So rotate the credential, review role grants, keep monitoring (a). “Confirmed takeover” (b) overstates the log — no session was won — and “false positive” (c) ignores that the password itself is burned even though the sign-in succeeded normally."
  },
  {
    id: "qz-h5",
    mode: "hard",
    topic: "Lifecycle deprovisioning",
    evidence: "A contractor’s account is still active 30 days after contract end, with zero logons since.",
    prompt: "Which IAM lifecycle control failed?",
    options: [
      { id: "a", text: "Password complexity enforcement" },
      { id: "b", text: "Kerberos ticket lifetime tuning" },
      { id: "c", text: "Deprovisioning at contract end" }
    ],
    answer: "c",
    explanation: "Thirty idle days past contract end means deprovisioning (the joiner-mover-leaver process) never fired (c) — every day the unowned account lives is free persistence for anyone holding its credentials (T1078.001 default/stale accounts). Password complexity (a) is irrelevant to an account nobody logs into, and ticket lifetime (b) only shortens active sessions."
  },
  {
    id: "qz-h6",
    mode: "hard",
    topic: "Spraying detection evidence",
    evidence: "You must detect password spraying across an IdP and on-prem AD.",
    prompt: "Which evidence pair gives the best coverage?",
    options: [
      { id: "a", text: "Sign-in failures per source + lockout events" },
      { id: "b", text: "Process launches from EDR + DNS queries" },
      { id: "c", text: "Badge-reader entries + VPN bandwidth charts" }
    ],
    answer: "a",
    explanation: "Spraying lives in authentication telemetry: failures aggregated per source IP plus account lockouts (DS0002 / DS0028) catch it across IdP and AD. Process and DNS data (b) show the attacker’s toolkit, not the identity abuse; badges and bandwidth (c) never record a password guess."
  },
  {
    id: "qz-h7",
    mode: "hard",
    topic: "OAuth app consent",
    evidence: "OAuth app “PDF Converter” requests Mail.ReadWrite + Mail.Send for ALL users; consent screen approved by end users.",
    prompt: "Risk and control?",
    options: [
      { id: "a", text: "Fine — converters need full mailbox control" },
      { id: "b", text: "Over-privileged third-party app — enforce admin consent" },
      { id: "c", text: "Fix by shortening user password lifetime" }
    ],
    answer: "b",
    explanation: "Mail.ReadWrite + Mail.Send for ALL users, consented by end users — that is an over-privileged third-party app (b): route it through the admin consent workflow with least-privilege scopes (T1550.001 territory). A converter needs read, not rewrite-and-send (a), and password lifetime (c) never touches OAuth grants."
  }
];
var GLOSSARY = [
  { term: "IAM", def: "Identity and Access Management — the framework for managing identities, their authentication, and what they may access." },
  { term: "Identification", def: "Claiming an identity (username, badge). The first “A” — proves nothing by itself." },
  { term: "Authentication", def: "Proving the claimed identity via factors: knowledge, possession, inherence." },
  { term: "Authorization", def: "Deciding what an authenticated identity may access and do." },
  { term: "Accounting (auditing)", def: "Recording identity activity — sign-ins, role changes, exports — for review and detection." },
  { term: "MFA / 2FA", def: "Multi-factor authentication: two or more DIFFERENT factor types for one sign-in." },
  { term: "TOTP", def: "Time-based one-time password: 30-second codes from a shared secret (an app in your possession)." },
  { term: "SSO", def: "Single sign-on: authenticate once to the IdP; applications trust its assertion." },
  { term: "IdP", def: "Identity provider — the service that authenticates users and issues assertions/tokens (e.g., the Bureau IdP)." },
  { term: "SAML / OIDC / OAuth 2.0", def: "Federation protocols: SAML = XML assertions; OAuth 2.0 = delegated authorization; OIDC = identity layer on OAuth 2.0." },
  { term: "RBAC / ABAC", def: "Role-based access control (permissions by job role) vs attribute-based (per-request attributes and context)." },
  { term: "Least privilege", def: "Every identity holds the minimum access its task requires — no more." },
  { term: "Separation of duties (SoD)", def: "Splitting sensitive workflows (raise vs approve a payment) across identities to prevent fraud." },
  { term: "Privilege creep", def: "Access accumulating across role changes and never removed. Killed by reviews and lifecycle management." },
  { term: "Password spraying / Credential stuffing", def: "Spraying: few passwords against many usernames (T1110.003). Stuffing: replaying breached username:password pairs (T1110.004)." }
];
var FIELD_CASES = [
  {
    actor: "APT28 (Fancy Bear)",
    technique: "T1110.003 — Password Spraying",
    text: "Per MITRE’s procedure examples, APT28 has used brute-force/password-spray tooling: in password-spraying mode it made roughly four authentication attempts per hour per targeted account, stretched over days or weeks — deliberately staying under lockout thresholds."
  },
  {
    actor: "Scattered Spider (LUCR-3)",
    technique: "T1621 — MFA Request Generation",
    text: "Per MITRE’s procedure examples, Scattered Spider attempted to gain access by continuously sending MFA messages to a victim until they accepted the push challenge; MITRE’s T1621 description notes adversaries may bombard users via push notifications, SMS and phone calls until one lands."
  },
  {
    actor: "Wizard Spider",
    technique: "T1078 — Valid Accounts",
    text: "Per MITRE’s procedure examples, Wizard Spider has used valid credentials for privileged accounts with the goal of accessing domain controllers — working from inside the network like an ordinary user."
  },
  {
    actor: "Post-compromise pattern (simplified)",
    technique: "T1078 → T1098",
    text: "Simplified: after entry with a valid account, adversaries frequently add or modify accounts and roles (Account Manipulation, T1098) to persist — which is why role-grant events belong in your alerts."
  }
];
var DEBRIEF = {
  detections: [
    {
      title: "Password spraying (T1110.003)",
      source: "DS0002 User Account · DS0028 Logon Session",
      logic: "count(distinct user) where event = logon.failure, group by source_ip, window 10 min → alert when ≥ 5 (exclude narrowly-documented noisy accounts)."
    },
    {
      title: "MFA request generation (T1621)",
      source: "DS0002 User Account (User Account Authentication)",
      logic: "count(mfa.push.sent) per user, 30 min → alert when ≥ 3 denials; critical when any push.approved follows within the window."
    },
    {
      title: "Suspicious entitlement change (T1098 / T1078)",
      source: "DS0002 User Account (User Account Modification)",
      logic: "alert on role-grant events where grantor == grantee, or where a privilege grant is followed within 60 min by a sensitive-data rule change."
    },
    {
      title: "Impossible travel / new-fingerprint sign-in",
      source: "DS0028 Logon Session (Logon Session Metadata)",
      logic: "alert on sign-in where geo changes from baseline AND device fingerprint is new AND prior push denials exist in the last hour."
    }
  ],
  mitigations: [
    { id: "M1032", name: "Multi-factor Authentication", note: "Especially phishing-resistant (FIDO2) for admins; number matching for push." },
    { id: "M1027", name: "Password Policies", note: "Length ≥ 12, complexity, history — blunts T1110 guessing." },
    { id: "M1036", name: "Account Use Policies", note: "Lockout thresholds, retry limits — blunts spraying directly." },
    { id: "M1026", name: "Privileged Account Management", note: "Vaulted, just-in-time admin access; kills standing privilege." },
    { id: "M1018", name: "User Account Management", note: "Joiner-mover-leaver lifecycle; quarterly access reviews; kill orphaned accounts." },
    { id: "M1047", name: "Audit", note: "The ledger is the control: review role grants and MFA-denial streaks." }
  ],
  blueTeam: [
    "Baseline the noise (scheduled jobs, demos, typos) so your exclusions are narrow and documented — wholesale exclusions blind you.",
    "Alert on the sequence, not the event: push denials → approval → new geo → role grant is a story, not four lines.",
    "Access reviews are detection too: dormant, orphaned and over-privileged accounts are pre-installed attacker infrastructure.",
    "SoD checks belong in the role model, not the audit findout."
  ],
  redTeam: [
    "Valid accounts (T1078) beat exploits: they cross Initial Access, Persistence, Privilege Escalation and Defense Evasion at once.",
    "A password spray that stays under lockout thresholds looks like background noise — which is why thresholds and per-source aggregation matter.",
    "MFA is not a wall, it is a gate with a tired human next to it: fatigue and helpdesk-reset attacks target the process, not the math.",
    "After entry, self-service role approvals are gold: one click turns a payroll officer into a finance admin."
  ],
  links: [
    { label: "ATT&CK T1078 — Valid Accounts", href: "https://attack.mitre.org/techniques/T1078/" },
    { label: "ATT&CK T1110 — Brute Force", href: "https://attack.mitre.org/techniques/T1110/" },
    { label: "ATT&CK T1621 — MFA Request Generation", href: "https://attack.mitre.org/techniques/T1621/" },
    { label: "ATT&CK T1558.003 — Kerberoasting", href: "https://attack.mitre.org/techniques/T1558/003/" },
    { label: "ATT&CK M1032 — Multi-factor Authentication", href: "https://attack.mitre.org/mitigations/M1032/" },
    { label: "ATT&CK M1026 — Privileged Account Management", href: "https://attack.mitre.org/mitigations/M1026/" },
    { label: "CompTIA CySA+ CS0-003 exam objectives", href: "https://www.comptia.org/certifications/cybersecurity-analyst" }
  ]
};
