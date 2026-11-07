/**
 * The Deployment Factory — static port.
 * Machine-transpiled 1:1 from the framework lab source: src/lib/lab/types.ts + src/lib/lab/data.ts + PINNED_1042 from ConveyorLine.tsx
 * Do not edit content here without mirroring the change upstream.
 */
// ---- Stage/pillar constants (runtime consts from types.ts; interfaces erased) ----
/** The Deployment Factory — Lab types (CompTIA Cloud+ CV0-004 L5.3 CI/CD pipelines) */
const STAGE_ORDER = [
    "source",
    "build",
    "test",
    "scan",
    "package",
    "release",
    "production",
];
const STAGE_LABELS = {
    source: "SOURCE",
    build: "BUILD",
    test: "TEST",
    scan: "SCAN",
    package: "PACKAGE",
    release: "RELEASE",
    production: "PRODUCTION",
};
const STAGE_SUBTITLES = {
    source: "Code integration",
    build: "Build",
    test: "Testing",
    scan: "Security",
    package: "Artifacts",
    release: "Workflow",
    production: "Code deployment",
};
const PILLAR_LABELS = {
    P1: "Understand",
    P2: "Recognize",
    P3: "Detect",
    P4: "Mitigate",
};

// ---- Lab content (data.ts, unchanged) ----
/* ------------------------------------------------------------------ */
/* Fictional surface                                                   */
/* ------------------------------------------------------------------ */
const ORG = {
    name: "NimbusPay",
    service: "ledger-api",
    repo: "git.nimbuspay.example/nimbuspay/ledger-api",
    registry: "registry.nimbuspay.example",
    vault: "vault.nimbuspay.example",
    engineer: "D. Okafor", // the departing engineer who left the line misconfigured
    you: "the newly hired platform engineer",
};
const TRAINING_NOTE = "SYNTHETIC TRAINING DATA — every domain, host, credential and log line on this floor is fictional and safe.";
/* Commit stream evidence (SOURCE station) */
const COMMITS = [
    { hash: "9c41f2e", author: ORG.engineer, msg: "ci: leave trigger on feature/* while debugging docs-site", branch: "feature/docs" },
    { hash: "b7d0a13", author: "M. Silva", msg: "feat(payments): add dispute endpoints (BREAKING API CHANGE)", branch: "main" },
    { hash: "e5a2b99", author: "R. Chen", msg: "fix: settlement job timezone drift", branch: "main" },
    { hash: "2f8ce11", author: ORG.engineer, msg: "chore: bump ledger-parser to ^2.4.1 (floating range)", branch: "main" },
    { hash: "1d94fa0", author: "M. Silva", msg: "docs: on-call handbook for release night", branch: "main" },
];
/* Secret-scan findings (SCAN station) */
const SECRET_FINDINGS = [
    {
        id: "SEC-001",
        secretKey: "secretDb",
        label: "NIMBUS_DB_PASSWORD",
        snippet: 'NIMBUS_DB_PASSWORD: "SUP3R-S3CRET-DO-NOT-USE"',
        severity: "CRITICAL",
        where: "nimbus-pipeline.yaml · line 41",
        why: "A production database password committed as plaintext in pipeline configuration.",
    },
    {
        id: "SEC-002",
        secretKey: "secretApi",
        label: "NIMBUS_CARD_API_KEY",
        snippet: 'NIMBUS_CARD_API_KEY: "sk_live_dont_SCAN_me_0f4c"',
        severity: "CRITICAL",
        where: "nimbus-pipeline.yaml · line 42",
        why: "A live payments-partner API key readable by every runner, fork and log scraper.",
    },
];
/* Registry listing (PACKAGE station) */
const REGISTRY_ITEMS = [
    { name: "ledger-api", version: "v2.9.2", signed: true, digest: "sha256:9f2c4a…e81b", pushed: "6 days ago", by: "M. Silva" },
    { name: "ledger-api", version: "v3.0.0-rc4", signed: true, digest: "sha256:c07d93…44af", pushed: "30 hours ago", by: "R. Chen" },
    { name: "ledger-api", version: "v3.0.0", signed: false, digest: "— (unsigned) —", pushed: "2 hours ago", by: "unknown runner" },
    { name: "ops-base", version: "1.8", signed: true, digest: "sha256:71ab6f…09cd", pushed: "3 weeks ago", by: "platform-bot" },
    { name: "docs-site", version: "0.4", signed: true, digest: "sha256:2d5e88…7731", pushed: "5 days ago", by: "docs-bot" },
];
/* Canary case file — shared by OBJ-M10 and OBJ-H5 (framed as a teammate's canary run) */
const CANARY_METRICS = [
    { metric: "Error rate (5xx + failed txn)", baseline: "0.3%", canary: "7.1%", verdict: "fail" },
    { metric: "p95 latency", baseline: "184 ms", canary: "291 ms (+58%)", verdict: "fail" },
    { metric: "Successful checkouts", baseline: "41.2k/h", canary: "40.9k/h (−0.7%)", verdict: "pass" },
    { metric: "CPU per pod", baseline: "41%", canary: "44%", verdict: "pass" },
];
const CANARY_CONTEXT = "Case file REL-118 (a teammate's canary): ledger-api v3.0.0 at 25% traffic exposure for 20 minutes. Previous stable release is v2.9.2.";
/* Rollback drill steps (OBJ-H9, PRODUCTION station) */
const ROLLBACK_SCENARIO = "DRILL (labeled training scenario): 14 minutes after you promote v3.0.0, error rate hits 12% and the dispute endpoint times out. You are on the line alone. Restore service in the correct order.";
const GLOSSARY = [
    { term: "CI/CD pipeline", def: "An automated assembly line that takes code from commit to production through build, test, scan and deploy stages." },
    { term: "Continuous integration (CI)", def: "Merging small changes often, with every merge automatically built and tested." },
    { term: "Continuous delivery", def: "Every passing change is kept release-ready, but a human approves the final push to production." },
    { term: "Continuous deployment", def: "Every change that passes all stages goes to production automatically, with no manual gate." },
    { term: "Build", def: "The stage that compiles code and resolves dependencies into a runnable output." },
    { term: "Artifact", def: "A versioned build output: container or VM image, RPM/Debian/ZIP/tar package, or flat file." },
    { term: "Artifact registry", def: "Storage (public or private) where versioned artifacts are published and pulled from." },
    { term: "Trigger / webhook", def: "An SCM event notification that starts the pipeline automatically (e.g., a push to main)." },
    { term: "Quality gate", def: "A rule that blocks promotion unless criteria pass: tests, coverage, vulnerability limits, approval." },
    { term: "SAST / SCA", def: "Static application security testing / software composition analysis: scanning first-party code and third-party dependencies." },
    { term: "Secret detection", def: "Automated scanning that finds credentials accidentally committed in code or configuration." },
    { term: "Semantic versioning", def: "MAJOR.MINOR.PATCH numbering: MAJOR for breaking changes, MINOR for features, PATCH for fixes." },
    { term: "Blue-green deployment", def: "Two identical environments; traffic switches atomically between them, enabling instant rollback." },
    { term: "Canary deployment", def: "A new release is exposed to a small traffic slice first and watched before full promotion." },
    { term: "Rollback", def: "Reverting production to the previous known-good version after a bad release." },
];
/* ------------------------------------------------------------------ */
/* Objectives — Medium (11)                                            */
/* ------------------------------------------------------------------ */
const OBJECTIVES_MEDIUM = [
    {
        id: "OBJ-M1",
        mode: "medium",
        order: 1,
        title: "Lay out the line",
        task: "The station plaques fell off the conveyor. Order the seven stations the way a pipeline executes them — from the developer's commit to the customer.",
        pillar: "P1",
        anchor: "§5.2 Code deployment → Workflow (stage order)",
        stage: "core",
        answerType: "form",
        form: [
            { key: "s1", label: "Station 1", kind: "select", options: ["source", "build", "test", "scan", "package", "release", "production"] },
            { key: "s2", label: "Station 2", kind: "select", options: ["source", "build", "test", "scan", "package", "release", "production"] },
            { key: "s3", label: "Station 3", kind: "select", options: ["source", "build", "test", "scan", "package", "release", "production"] },
            { key: "s4", label: "Station 4", kind: "select", options: ["source", "build", "test", "scan", "package", "release", "production"] },
            { key: "s5", label: "Station 5", kind: "select", options: ["source", "build", "test", "scan", "package", "release", "production"] },
            { key: "s6", label: "Station 6", kind: "select", options: ["source", "build", "test", "scan", "package", "release", "production"] },
            { key: "s7", label: "Station 7", kind: "select", options: ["source", "build", "test", "scan", "package", "release", "production"] },
        ],
        hints: [
            "The pipeline starts where the code starts: the source-control station receives the commit.",
            "Tests must run before you can trust the output; security scans before you package; packaging before any deploy.",
            "Correct order: source → build → test → scan → package → release → production.",
        ],
        feedbackPass: "Every change flows commit → build → test → scan → package → release → production. Order matters because each station consumes the previous one's output: you can't scan what didn't build, and you never deploy what wasn't packaged.",
        feedbackFail: "Not quite the plant layout. Think about what each station needs as input: building needs integrated code, testing needs a build, scanning needs code and dependencies, packaging needs a clean bill of health, releasing needs an artifact, production needs a released, approved version.",
    },
    {
        id: "OBJ-M2",
        mode: "medium",
        order: 2,
        title: "CI, delivery or deployment?",
        task: "Three teams describe their release flow. Match each description to the practice it names — continuous integration, continuous delivery, or continuous deployment.",
        pillar: "P1",
        anchor: "§5.2 Automation (CI vs delivery vs deployment distinction)",
        stage: "core",
        answerType: "form",
        form: [
            { key: "a", label: "Team Alpha — 'We merge small changes several times a day and every merge is automatically built and tested.'", kind: "select", options: ["continuous integration", "continuous delivery", "continuous deployment"] },
            { key: "b", label: "Team Bravo — 'Everything that passes the pipeline is release-ready, but a release manager clicks approval before it ships.'", kind: "select", options: ["continuous integration", "continuous delivery", "continuous deployment"] },
            { key: "c", label: "Team Charlie — 'If the line is green, customers have it. Nobody stops the release.'", kind: "select", options: ["continuous integration", "continuous delivery", "continuous deployment"] },
        ],
        hints: [
            "Alpha is talking about the moment code lands in the shared branch — integration.",
            "Bravo mentions a human approval before production; Charlie mentions nothing stopping the release.",
            "Alpha = continuous integration, Bravo = continuous delivery, Charlie = continuous deployment.",
        ],
        feedbackPass: "The exam's favorite trap: continuous delivery keeps a human approval gate before production; continuous deployment removes it; continuous integration is the frequent merge + automated build/test discipline underneath both.",
        feedbackFail: "Look for the decisive signal: does the description mention frequent merges and automated builds (integration), a manual approval before production (delivery), or an unattended path to production (deployment)?",
    },
    {
        id: "OBJ-M3",
        mode: "medium",
        order: 3,
        title: "Wake the SOURCE station",
        task: "Merges to main haven't started the line since D. Okafor left. At the SOURCE station, enable the push trigger and point the webhook at the branch the team actually merges to.",
        pillar: "P2",
        anchor: "§5.2 Code integration + Workflow (triggers/webhooks)",
        stage: "source",
        answerType: "state",
        hints: [
            "Open the SOURCE station inspector and compare the webhook config with the commit stream's branch names.",
            "The team merges to main; the webhook is watching feature/*.",
            "Set 'Watch branch' to main and switch the push trigger ON.",
        ],
        feedbackPass: "Code integration only works if the pipeline hears about it: a webhook trigger on the shared branch starts the line on every push. Watching the wrong branch means integration is happening with no automated build or test at all.",
        feedbackFail: "Check two things: the push trigger must be ON, and the watched branch must be the one the team merges to — read the commit stream to see which branch that is.",
    },
    {
        id: "OBJ-M4",
        mode: "medium",
        order: 4,
        title: "Repair the BUILD station",
        task: "The BUILD station fails on every run. Read its log, then fix both faults: the runner's runtime and the floating dependency range on ledger-parser.",
        pillar: "P2",
        anchor: "§5.2 Code deployment → Build",
        stage: "build",
        answerType: "state",
        hints: [
            "The build log says which Node version the app requires; compare it with the runner image config.",
            "ledger-parser is pinned as ^2.4.1 — a floating range that can silently resolve to a different published version.",
            "Set runner Node to 20, then pin ledger-parser to exact 2.4.1.",
        ],
        feedbackPass: "A build must run on the runtime the app targets, and dependencies should be pinned to exact versions: a floating range like ^2.4.1 lets the registry hand you a different build than the one you tested — a classic supply-chain opening.",
        feedbackFail: "Two independent faults live at BUILD. Run the line, read the failing log lines, and fix the runner version AND the dependency pinning in the station config.",
    },
    {
        id: "OBJ-M5",
        mode: "medium",
        order: 5,
        title: "Re-arm the TEST station",
        task: "The line has been shipping unverified code. Turn both test suites back on, and give the integration suite a working database credential by wiring the Vault reference instead of the plaintext one.",
        pillar: "P2",
        anchor: "§5.2 Code deployment → Testing + secrets management",
        stage: "test",
        answerType: "state",
        hints: [
            "Three switches live at the TEST station: unit suite, integration suite, and the credential source.",
            "The integration DB auth failed because the credential was never wired to the Vault.",
            "Enable unit tests, enable integration tests, then click 'Wire DB credential via Vault'.",
        ],
        feedbackPass: "Tests are the quality gate of the pipeline: disabled suites certify nothing. Credentials belong in a vault, referenced from config — the runner pulls them at runtime and nothing secret ever sits in the YAML.",
        feedbackFail: "Three things to set at the TEST station: unit suite ON, integration suite ON, and the DB credential wired through the Vault reference (the plaintext copy in YAML is not a credential source).",
    },
    {
        id: "OBJ-M6",
        mode: "medium",
        order: 6,
        title: "Clear the secret-scan report",
        task: "SCAN flagged two plaintext credentials in nimbus-pipeline.yaml. Extract both into the Vault so the report comes back clean.",
        pillar: "P3",
        anchor: "§5.2 Code deployment → Security (secret detection)",
        stage: "scan",
        answerType: "state",
        hints: [
            "The findings cards at the SCAN station each have an extraction action.",
            "SEC-001 and SEC-002 both need to be moved out of the YAML.",
            "Use 'Extract to Vault' on both finding cards, then re-run the line.",
        ],
        feedbackPass: "Secret detection exists because plaintext credentials in repos are the most common pipeline breach. Once scanned, the fix is extraction to a vault + rotation (you'll rotate in Hard mode) — deleting the file alone never removes it from git history.",
        feedbackFail: "Both CRITICAL findings (SEC-001 and SEC-002) still have plaintext copies in the YAML. Each finding card has an 'Extract to Vault' action.",
    },
    {
        id: "OBJ-M7",
        mode: "medium",
        order: 7,
        title: "Choose the artifact and its home",
        task: "NimbusPay is a regulated fintech. For ledger-api, select the artifact type with the fastest startup and smallest footprint, and the repository class that keeps proprietary images off public infrastructure.",
        pillar: "P1",
        anchor: "§5.2 Artifacts (VM & container images, package types) + public/private repositories",
        stage: "package",
        answerType: "state",
        hints: [
            "The station lists artifact types: container image, VM image, RPM/Debian/ZIP/tar, flat files.",
            "Microservices with fast cold-start needs point to one artifact type; 'regulated fintech' rules out public hosting.",
            "Container image + private registry.",
        ],
        feedbackPass: "Container images start in milliseconds and ship the whole runtime — the default artifact for microservices. A private registry keeps proprietary, possibly regulated, artifacts under your own access control instead of public infrastructure.",
        feedbackFail: "Reread the two constraints: 'fastest startup, smallest footprint' picks the artifact type, and 'regulated fintech' picks the repository class. RPM/ZIP packages or VM images don't match the first; public doesn't match the second.",
    },
    {
        id: "OBJ-M8",
        mode: "medium",
        order: 8,
        title: "Version the breaking release",
        task: "M. Silva's merge added dispute endpoints and broke the old API contract (see the commit stream at SOURCE). In the PACKAGE station's artifact configuration, type the semantic version ledger-api's next release must carry.",
        pillar: "P1",
        anchor: "§5.2 Artifacts → versioning (semantic versioning)",
        stage: "package",
        answerType: "state",
        hints: [
            "Semantic versioning: MAJOR for breaking API changes, MINOR for features, PATCH for fixes.",
            "The last stable release is v2.9.2 and the change breaks the API contract.",
            "A breaking change on top of 2.9.2 → 3.0.0.",
        ],
        feedbackPass: "v3.0.0 — a breaking change bumps MAJOR. Version discipline is what makes rollback possible: 'roll back' means switching traffic to the previous versioned artifact, not rebuilding from last Friday's memory.",
        feedbackFail: "The change breaks the API contract on top of a 2.9.2 baseline. Which segment of MAJOR.MINOR.PATCH does a breaking change bump?",
    },
    {
        id: "OBJ-M9",
        mode: "medium",
        order: 9,
        title: "Pick the launch strategy",
        task: "Marketing launches tonight. The requirements: zero downtime, instant rollback if anything slips, and the cloud budget covers a duplicate stack. Configure the PRODUCTION station accordingly.",
        pillar: "P4",
        anchor: "Companion concept: deployment strategies (blue-green / canary / rolling / in-place)",
        stage: "production",
        answerType: "state",
        hints: [
            "'Instant rollback' + 'duplicate stack' + 'zero downtime' is one specific strategy's definition.",
            "Canary exposes a slice gradually; rolling replaces pods in batches; in-place has downtime.",
            "Blue-green: provision the standby (green) environment and select the blue-green strategy.",
        ],
        feedbackPass: "Blue-green keeps two identical stacks; traffic switches atomically and rollback is a switch back — instant, zero-downtime, at the cost of running duplicate infrastructure. That is exactly the constraint set.",
        feedbackFail: "Match requirements to mechanics: instant rollback + full duplicate stack + zero downtime = one strategy. Canary is gradual exposure; rolling is batch replacement; in-place is downtime.",
    },
    {
        id: "OBJ-M10",
        mode: "medium",
        order: 10,
        title: "Rule on the canary case file",
        task: "Before your own launch, review case file REL-118 (a teammate's canary of v3.0.0). Decide: promote, or abort and roll back — and to which version.",
        pillar: "P4",
        anchor: "Companion concept: canary verdict + rollback",
        stage: "production",
        answerType: "form",
        form: [
            { key: "decision", label: "Verdict on REL-118", kind: "select", options: ["promote to 100%", "abort and roll back"] },
            { key: "target", label: "If aborting, roll back to", kind: "select", options: ["v2.9.2 (last stable)", "v3.0.0-rc4 (release candidate)", "v3.0.0 (the failing build)"] },
        ],
        hints: [
            "Read every metric row in REL-118, not just the one that looks fine.",
            "A 7.1% error rate on a payments API is not a gray area; rollback candidates are versioned artifacts.",
            "Abort, and roll back to v2.9.2 — the last stable release, not a release candidate.",
        ],
        feedbackPass: "Correct: abort, roll back to v2.9.2. Canary monitoring exists to catch exactly this — a failing metric at low exposure costs almost nothing; at 100% it costs customers. Rollback targets are known-good versioned artifacts, never a failing build or an unproven RC.",
        feedbackFail: "Check REL-118 again: error rate 7.1% and p95 latency +58% at 25% exposure. What does a canary gate exist to do when metrics breach baseline? And which artifact is the last known-good one?",
    },
    {
        id: "OBJ-M11",
        mode: "medium",
        order: 11,
        title: "Wire the feedback loop",
        task: "The line must learn from production. At the PRODUCTION station, enable the alerts that detect a bad release after it ships: error-rate and p95 latency.",
        pillar: "P3",
        anchor: "Companion concept: monitoring / feedback loop into the pipeline",
        stage: "production",
        answerType: "state",
        hints: [
            "The 'Feedback loop' card at the PRODUCTION station has two alert switches.",
            "A bad release shows up first as errors and latency, not as CPU usage.",
            "Enable both the error-rate alert and the p95 latency alert.",
        ],
        feedbackPass: "Deployment is not the end of the pipeline: error-rate and latency signals feed back as the production gate that can trigger automatic or manual rollback. Without the loop, the first detector of a bad release is the customer.",
        feedbackFail: "Two switches in the Feedback loop card are still off. Which two signals changed dramatically in case file REL-118? Enable those.",
    },
];
/* ------------------------------------------------------------------ */
/* Objectives — Hard (9)                                               */
/* ------------------------------------------------------------------ */
const OBJECTIVES_HARD = [
    {
        id: "OBJ-H1",
        mode: "hard",
        order: 1,
        title: "Triage run #1042",
        task: "Last night's diagnostic sweep (#1042) is pinned in the RUN CONSOLE. It is noisy: a docs-lint flake, a perf warning and a stale feature-branch job are in there. Name the station that actually blocks the release line, and the root cause of its failure.",
        pillar: "P2",
        anchor: "§5.2 Code deployment → Build (diagnosis) + Workflow",
        stage: "core",
        answerType: "form",
        form: [
            { key: "stage", label: "Blocking station", kind: "select", options: ["source", "build", "test", "scan", "package", "release", "production"] },
            { key: "cause", label: "Root cause", kind: "select", options: ["docs lint flake on feature branch", "perf test warning on cold start", "runner runtime mismatch (Node 14 vs required 20)", "missing approval gate", "stale webhook watching feature/*"] },
        ],
        hints: [
            "Ask of each red herring: does this fault stop ledger-api's release path?",
            "The docs lint job runs on feature/docs; the perf warning has no threshold breach; the webhook is a real fault but at another station.",
            "BUILD blocks the line: runner Node 14 vs the app's required Node ≥ 20 (the floating dependency is the second BUILD fault you still have to fix).",
        ],
        feedbackPass: "Triage is subtraction: three findings don't touch the release path (docs job runs on a side branch, perf is informational, the stale webhook is real but lives at SOURCE and isn't what #1042 flagged as fatal). The line stops at BUILD — runtime mismatch. Root-causing the station before touching configs is what keeps a night shift short.",
        feedbackFail: "Separate the three red herrings from the fatal fault. Which station does the sweep mark as failing on ledger-api's release path, and what does its log line say about the runtime?",
    },
    {
        id: "OBJ-H2",
        mode: "hard",
        order: 2,
        title: "Credential incident response",
        task: "Two credentials leaked into nimbus-pipeline.yaml and its git history. Execute the incident sequence at the VAULT and SCAN stations in the correct order: rotate the exposed keys, remove the plaintext from the YAML, purge the git history.",
        pillar: "P4",
        anchor: "§5.2 Code deployment → Security (secret remediation)",
        stage: "scan",
        answerType: "state",
        hints: [
            "All three actions live around the SCAN station: two 'Extract to Vault' buttons, plus Rotate keys and Purge history in the Vault card.",
            "Rotation and extraction must BOTH precede the history purge.",
            "Ideal order: rotate first, extract second, purge last. Purge without rotation re-leaks a working key.",
        ],
        feedbackPass: "Incident closed in the right order: rotation kills the value attackers already have, extraction stops new commits, and the history purge (only AFTER rotation and extraction) removes the old copies — purge first would re-serve a live secret to every future clone.",
        feedbackFail: "The sequence is incomplete or unsafe. Remember what each step protects: rotation invalidates the exposed value, extraction stops new commits, history purge removes old ones. Rotation AND extraction must both happen BEFORE the purge — and purge must never come first.",
    },
    {
        id: "OBJ-H3",
        mode: "hard",
        order: 3,
        title: "Draft the quality-gate policy",
        task: "NimbusPay's security baseline for ledger-api: minimum 80% test coverage, block releases on high or critical vulnerabilities, a human approval before production, and signed artifacts only. Encode all four rules in the PRODUCTION station's policy editor, then check.",
        pillar: "P4",
        anchor: "§5.2 Code deployment → Testing + Security + Workflow (gates)",
        stage: "production",
        answerType: "state",
        hints: [
            "The coverage number comes straight from the security baseline in the task.",
            "Blocking on ALL findings would stop the line on a known medium CVE in the base image — pick the policy that matches the baseline wording.",
            "80 · block on high or critical · human approval required · signed artifacts only.",
        ],
        feedbackPass: "Policy encoded: 80% coverage floor, block on high/critical, human approval before production, signed artifacts only. These four gates are the exam's model of 'security in the pipeline' — automated checks that fail the build instead of tickets nobody reads.",
        feedbackFail: "Each rule maps 1:1 from the baseline sentence. Careful with the vulnerability policy: the baseline says high or critical — no more, no less.",
    },
    {
        id: "OBJ-H4",
        mode: "hard",
        order: 4,
        title: "Strategy decision matrix",
        task: "Two teams, two constraint sets. Scenario A (checkout service): expose gradually to real customer traffic with a fast abort. Scenario B (session store): duplicate stack exists, launch deadline tonight, rollback must be atomic. Choose and justify the strategy for each.",
        pillar: "P4",
        anchor: "Companion concept: deployment strategies (canary / blue-green / rolling / in-place)",
        stage: "production",
        answerType: "form",
        form: [
            { key: "a", label: "Scenario A — gradual real-traffic exposure", kind: "select", options: ["canary", "blue-green", "rolling", "in-place"] },
            { key: "aWhy", label: "Because…", kind: "select", options: ["it switches traffic atomically", "it exposes a small traffic slice with a fast abort", "it replaces instances in batches", "it needs no extra infrastructure"] },
            { key: "b", label: "Scenario B — atomic switch, duplicate stack", kind: "select", options: ["canary", "blue-green", "rolling", "in-place"] },
            { key: "bWhy", label: "Because…", kind: "select", options: ["it exposes a small traffic slice with a fast abort", "it switches traffic atomically between two identical stacks", "it replaces instances in batches", "it reuses the same instances"] },
        ],
        hints: [
            "Match the key phrase: A says 'gradually… fast abort'; B says 'atomic switch… duplicate stack'.",
            "Each justification option is a one-line mechanic — pick the mechanic that IS the strategy.",
            "A = canary (small slice, fast abort); B = blue-green (atomic switch between identical stacks).",
        ],
        feedbackPass: "A = canary: real traffic on a small slice, abort is cheap. B = blue-green: two identical stacks and an atomic traffic switch give an instant rollback under a deadline. 'Given a scenario, choose the deployment strategy' is exactly this matching skill.",
        feedbackFail: "For each scenario, find the decisive constraint: gradual exposure with abort (A) vs atomic switch with a pre-provisioned twin (B). Then pick the strategy whose mechanic matches.",
    },
    {
        id: "OBJ-H5",
        mode: "hard",
        order: 5,
        title: "Canary verdict, under pressure",
        task: "Case file REL-118: v3.0.0 at 25% exposure. Make the call — promote, or abort with rollback — name the metric that decides it, and pick the artifact to restore.",
        pillar: "P3",
        anchor: "Companion concept: canary verdict + rollback + monitoring signals",
        stage: "production",
        answerType: "form",
        form: [
            { key: "decision", label: "Verdict", kind: "select", options: ["promote to 100%", "abort and roll back"] },
            { key: "metric", label: "Deciding metric", kind: "select", options: ["CPU per pod", "successful checkouts", "error rate", "p95 latency"] },
            { key: "target", label: "Restore", kind: "select", options: ["v2.9.2 (last stable)", "v3.0.0-rc4 (release candidate)", "v3.0.0 (the failing build)"] },
        ],
        hints: [
            "One metric is failing catastrophically; one is degraded; two are fine. Which failure class does a canary gate exist to catch?",
            "The deciding metric is the one that measures whether customers can complete payments successfully.",
            "Abort · error rate (7.1%) · v2.9.2.",
        ],
        feedbackPass: "Abort on the error rate — 7.1% means roughly 1 in 14 payment requests failing; that is the signal a canary gate exists to catch, while checkout volume barely moved (a classic lagging indicator). Restore v2.9.2: rollback means the last versioned, known-good artifact.",
        feedbackFail: "Re-read the metric table. Which single metric, at 7.1% vs 0.3% baseline, tells you customers are failing right now? And which artifact in the registry is the last known-good one?",
    },
    {
        id: "OBJ-H6",
        mode: "hard",
        order: 6,
        title: "Registry integrity check",
        task: "Audit the registry listing at the PACKAGE station. One artifact doesn't belong. Identify it, and flip on the promotion policy that would have kept it out.",
        pillar: "P2",
        anchor: "§5.2 Artifacts + public/private repositories (integrity, signatures)",
        stage: "package",
        answerType: "form",
        form: [
            { key: "unsigned", label: "Artifact that fails the audit", kind: "select", options: ["ledger-api:v2.9.2", "ledger-api:v3.0.0-rc4", "ledger-api:v3.0.0 (unsigned)", "ops-base:1.8", "docs-site:0.4"] },
        ],
        hints: [
            "Compare the signature column across all five rows.",
            "The suspicious row also names an odd publisher.",
            "ledger-api:v3.0.0 is unsigned and pushed by an 'unknown runner'; enable 'Verify checksums & signatures before promotion'.",
        ],
        feedbackPass: "ledger-api:v3.0.0 — unsigned, pushed by an unknown runner. Signature + checksum verification before promotion is the control that stops tampered or substituted artifacts from ever reaching a deploy target; this is the defensive counterpart of software supply-chain attacks.",
        feedbackFail: "One row has no SHA-256 digest and an unusual publisher. Which policy toggle at the PACKAGE station blocks unsigned artifacts from being promoted?",
    },
    {
        id: "OBJ-H7",
        mode: "hard",
        order: 7,
        title: "Triage the scan report",
        task: "Four findings from SCAN need a verdict each: true positive (real security issue) or false positive (noise). Classify them — a wrong call either ships a breach or buries a real one.",
        pillar: "P3",
        anchor: "§5.2 Code deployment → Security (detection tuning, TP vs FP)",
        stage: "scan",
        answerType: "form",
        form: [
            { key: "f1", label: "1 · plaintext DB password in pipeline YAML", kind: "select", options: ["true positive", "false positive"] },
            { key: "f2", label: "2 · credential-shaped string inside a test fixture (fixtures/creds.example.json)", kind: "select", options: ["true positive", "false positive"] },
            { key: "f3", label: "3 · critical CVE in the base container image layer", kind: "select", options: ["true positive", "false positive"] },
            { key: "f4", label: "4 · 'deprecated API usage' warning on an unused helper function", kind: "select", options: ["true positive", "false positive"] },
        ],
        hints: [
            "The file path and extension are evidence: what does .example in fixtures/creds.example.json suggest?",
            "A CVE in a base image ships inside every container built from it.",
            "1 = TP, 2 = FP (fixture, non-functional example data), 3 = TP, 4 = FP (code-quality warning, not security).",
        ],
        feedbackPass: "1 TP (plaintext prod credential), 2 FP (fixture data is non-functional by convention), 3 TP (a base-image CVE is inside every built image), 4 FP (deprecation is code quality, not security). Tuning detections is a defender's daily job: accepting FPs explicitly keeps alarms trusted; acting on TPs fast keeps breaches short.",
        feedbackFail: "Weigh each finding's evidence: is the flagged data functional (a real credential, a real vulnerable layer) or illustrative (.example fixture, unused helper)? A CVE in a base image is never noise.",
    },
    {
        id: "OBJ-H8",
        mode: "hard",
        order: 8,
        title: "Bring the line green",
        task: "Capstone: repair every station — trigger, runner, dependency pin, suites, Vault wiring, secrets, scanning, artifact, version, approval gate, strategy — and run a full diagnostic sweep with all seven lamps green.",
        pillar: "P1",
        anchor: "§5.2 full pipeline (all sub-bullets integrated)",
        stage: "core",
        answerType: "state",
        hints: [
            "Work station by station down the conveyor; each lamp tells you what it still needs.",
            "The sweep evaluates every station even if upstream fails — use one sweep to see all remaining faults.",
            "Green requires: trigger on main, Node 20, pinned dep, both suites + Vault wiring, scans on + no plaintext secrets, container artifact in the private registry, a valid semver, approval gate, and a configured strategy (blue-green with standby is tonight's plan).",
        ],
        feedbackPass: "All seven lamps green — the full pipeline now exercises every 5.2 sub-bullet: automation, integration, build, testing, security, workflow, artifacts and repositories. This is 'building and managing a CI/CD pipeline' end to end.",
        feedbackFail: "Not all lamps are green yet. Run a sweep and read each failing station's log — it names exactly what it is missing.",
    },
    {
        id: "OBJ-H9",
        mode: "hard",
        order: 9,
        title: "Rollback drill",
        task: "PRODUCTION is live on v3.0.0 and the drill alarm fires. Perform the response in the correct order: switch traffic back to the previous stable, quarantine the bad artifact, file the incident note.",
        pillar: "P4",
        anchor: "Companion concept: rollback + incident handling",
        stage: "production",
        answerType: "state",
        hints: [
            "The drill card at the PRODUCTION station has three actions; only their order is graded.",
            "Stop the bleeding first: customers are failing on every request.",
            "Order: switch traffic → quarantine artifact → incident note.",
        ],
        feedbackPass: "Correct order: restore service first (traffic switch is the fastest lever), then quarantine the artifact so no runner can redeploy it, then write the incident note while memory is fresh. Mitigation order is triage order: customer impact → spread → record.",
        feedbackFail: "The drill grades sequence. Ask of each action: does it stop customer impact, stop re-deploys, or preserve the record — and in that order, what comes first?",
    },
];
/* ------------------------------------------------------------------ */
/* Quizzes                                                             */
/* ------------------------------------------------------------------ */
const QUIZ_MEDIUM = [
    {
        id: "M1",
        stem: "What distinguishes continuous delivery from continuous deployment?",
        options: [
            "Delivery uses faster runners; deployment uses slower, safer runners",
            "Delivery publishes to private registries; deployment publishes to public ones",
            "Delivery keeps a human approval gate; deployment automates it",
            "Delivery and deployment are two interchangeable names, one practice",
        ],
        correct: 2,
        explanation: "The decisive difference is the manual approval before production: delivery keeps it, deployment removes it. Runner speed has nothing to do with the distinction (A), and neither does registry visibility (B). The exam treats them as two different practices — 'release manager approves' signals delivery, 'nobody stops the release' signals deployment — so D's 'interchangeable' reading is the trap.",
        topic: "CI vs delivery vs deployment",
    },
    {
        id: "M2",
        stem: "A team merges small changes into main several times a day, and each merge is automatically built and tested. Which practice is this?",
        options: ["Continuous integration", "Canary release", "Continuous deployment", "Infrastructure as code"],
        correct: 0,
        explanation: "Frequent small merges into the shared branch, each automatically built and tested, is the textbook definition of continuous integration. Canary release is a production-rollout strategy, not a merge discipline (B). Continuous deployment would additionally push every green change to production automatically (C). Infrastructure as code manages provisioning of infrastructure, not integration of source changes (D).",
        topic: "Continuous integration",
    },
    {
        id: "M3",
        stem: "In this plant, what made the line start automatically on a code change?",
        options: [
            "A cron schedule on the runner firing at midnight",
            "A monitoring alert escalating to the release manager",
            "An engineer clicking the RUN button after every code review",
            "A webhook trigger notifying the pipeline of a push",
        ],
        correct: 3,
        explanation: "Webhook triggers are how source-control events start a pipeline: a push fires a notification and the line moves without a human. A cron schedule is a timer, blind to when code actually lands (A). Monitoring alerts react to incidents after the fact — they don't start builds (B). A person clicking RUN is precisely the manual step automation removes (C). Note the plant's real fault: the webhook was armed but watching the wrong branch, which silently disabled integration.",
        topic: "Triggers & webhooks",
    },
    {
        id: "M4",
        stem: "Where does the pipeline store the versioned outputs it builds — container images, VM images, RPM/Debian/ZIP/tar packages?",
        options: [
            "The git repository, alongside the source",
            "An artifact registry, public or private",
            "The monitoring dashboard, next to the metrics",
            "The runner's memory until the job finishes",
        ],
        correct: 1,
        explanation: "Artifacts live in artifact registries — public or private — where each build output is stored with a version and digest, which is what makes rollback a version switch instead of a rebuild. Git stores source code, not build outputs (A). Dashboards display telemetry; they don't hold deployable binaries (C). Runner memory is ephemeral — it evaporates when the job ends (D).",
        topic: "Artifact registry",
    },
    {
        id: "M5",
        stem: "Zero downtime, instant rollback, and a duplicate stack already provisioned. Which deployment strategy fits?",
        options: [
            "In-place rebuild during a maintenance window",
            "Canary slice watched against baseline metrics",
            "Rolling replacement executed in small batches",
            "Blue-green switch between two identical stacks",
        ],
        correct: 3,
        explanation: "Two identical stacks with an atomic traffic switch is the blue-green definition — and rollback is just switching back, which is why 'instant rollback + duplicate stack' points straight at it. An in-place rebuild has a downtime window and rollback means rebuilding (A). A canary exposes a small slice gradually rather than switching atomically (B). Rolling replaces instances batch by batch, mixing versions with slower rollback (C).",
        topic: "Deployment strategies",
    },
    {
        id: "M6",
        stem: "The pipeline's integration tests need a production-grade database credential. Best practice?",
        options: [
            "Reference it from a secrets vault, injected at run time",
            "Paste it in the pipeline YAML next to the job",
            "Commit it to the repository in a reversible encoded form",
            "Share it in a pinned team chat message for reliability",
        ],
        correct: 0,
        explanation: "The credential belongs in a vault, referenced from config and injected only at runtime — nothing secret ever sits in committed text. Pasting it into the YAML is precisely the leak this plant suffered (B). Encoding is not encryption: scanners and git history still see the value (C). Team chat has no access control, no rotation and no audit trail (D).",
        topic: "Secrets management",
    },
];
const QUIZ_HARD = [
    {
        id: "H1",
        stem: "BUILD log: \"ledger-parser: range ^2.4.1 resolved to 2.4.7 — published 2 days ago, maintainer unverified.\" What is the risk class and the first corrective action?",
        options: [
            "Config drift; rerun the build unchanged",
            "Supply-chain exposure; pin a verified exact version",
            "Test coverage gap; add tests around the dependency",
            "Runtime mismatch; upgrade the runner image now",
        ],
        correct: 1,
        explanation: "A floating range silently pulling a brand-new, unverified version is software supply-chain exposure — the defensive counterpart of MITRE ATT&CK T1195.001, Compromise Software Dependencies and Development Tools. Pinning to a verified exact version (with checksum verification) is the first corrective action. Config drift describes environment state changes, not dependency identity (A). Coverage is orthogonal to which code version got resolved (C). The runner runtime is the build station's OTHER fault, not what this log line reports (D).",
        topic: "Dependency pinning & supply chain",
    },
    {
        id: "H2",
        stem: "A regulated payments service must expose a new release to a small slice of real customer traffic with the ability to abort in seconds. Which strategy?",
        options: ["In-place", "Rolling", "Blue-green", "Canary"],
        correct: 3,
        explanation: "Canary exists for exactly this: a small live-traffic slice (5–25%) watched against baseline metrics, with a cheap abort. Blue-green switches atomically but exposes 100% of customers at the moment of switch (C). Rolling replaces instances in batches with mixed versions and no gradual ramp (B). In-place rebuilds the same instance and takes downtime (A).",
        topic: "Deployment strategies",
    },
    {
        id: "H3",
        stem: "A secret was rotated in the Vault, but the secret scanner still flags the repository. Most likely cause?",
        options: [
            "Plaintext remains in the YAML or git history",
            "The scanner is misconfigured and should be disabled entirely",
            "The vault reference is invalid or has expired",
            "The scanner only runs after a deploy finishes",
        ],
        correct: 0,
        explanation: "Rotation invalidates the value; it does not erase the text. As long as the plaintext copy survives in the YAML or git history, scanners keep firing — complete remediation is rotate, remove from files, then purge history (the exact OBJ-H2 sequence). Disabling the scanner hides the signal instead of fixing the leak (B). The vault reference concerns runtime injection, not repository contents (C). Secret scanners run against repos and configs, not only after deploys (D).",
        topic: "Secret rotation & history purge",
    },
    {
        id: "H4",
        stem: "Which stage should run dependency composition analysis (SCA) so vulnerable third-party code never gets packaged?",
        options: [
            "After production deployment has finished, watching live incidents",
            "In the source stage, before code is integrated",
            "In the scan stage, on the dependency tree",
            "A manual audit outside the pipeline, once a year",
        ],
        correct: 2,
        explanation: "SCA belongs in the pipeline's security stage, where it analyzes the built code and its resolved dependency tree — early enough to block packaging, late enough to see the actual versions. Running it after deployment only detects vulnerable software already in production (A). The source stage cannot analyze what hasn't been resolved or built yet (B). A manual annual audit gates nothing and lets every build ship in between (D).",
        topic: "SCA / scanning stage",
    },
    {
        id: "H5",
        stem: "Canary at 25%: error rate 8.4% (baseline 0.3%), p95 latency +65%, successful checkouts flat. The gate's verdict?",
        options: [
            "Promote it — checkout volume stays stable",
            "Promote it — CPU remains within limits",
            "Extend the canary window another cycle",
            "Abort and roll back — baseline breached",
        ],
        correct: 3,
        explanation: "The error rate is the deciding metric: it counts failed customer requests, and 8.4% against a 0.3% baseline is a ~28× breach — exactly what a canary gate exists to catch. Stable checkout volume is a lagging indicator; promoting on it ships an 8% failure rate to everyone (A). CPU was never the customer-impact signal (B). Extending the window doesn't cure a breached gate — the breach IS the abort condition (C). Restore the last known-good versioned artifact.",
        topic: "Canary gates & rollback",
    },
    {
        id: "H6",
        stem: "For a microservice that must start in milliseconds and scale per-request, which artifact type does the pipeline package?",
        options: ["VM image", "Container image", "Debian package", "Flat file bundle"],
        correct: 1,
        explanation: "Container images package the runtime with the app and start in milliseconds — the default microservice artifact. VM images boot a whole machine in tens of seconds (A). RPM/Debian packages install into a pre-provisioned host OS (C). Flat file bundles assume scripts or static hosting rather than a managed runtime (D).",
        topic: "Artifact types",
    },
    {
        id: "H7",
        stem: "Why does the promotion policy require signed artifacts with verified checksums?",
        options: [
            "To speed up the package stage overall",
            "To satisfy the pipeline's monitoring alert rules",
            "To prove each artifact's integrity and origin",
            "To compress the artifact for faster pulls",
        ],
        correct: 2,
        explanation: "Signatures plus checksum verification give the deploy target a cryptographic guarantee that the artifact is exactly what the pipeline built — the control that blocks tampered or substituted builds (like the unsigned v3.0.0 row in the registry). Build speed is unrelated to signing (A). Monitoring alerts consume metrics, not signatures (B). Compression happens at publish time regardless of signing (D).",
        topic: "Artifact signing & integrity",
    },
];
/* Knowledge-core content                                              */
/* ------------------------------------------------------------------ */
const STRATEGY_MATRIX = [
    { name: "Blue-green", mechanic: "Two identical stacks; traffic switches atomically between them.", strength: "Instant rollback, zero downtime", cost: "Runs duplicate infrastructure", pick: "Launch deadlines, instant-rollback requirements" },
    { name: "Canary", mechanic: "New release serves a small traffic slice (5–25%) watched against baseline.", strength: "Real-traffic validation, cheap abort", cost: "Slower full rollout, needs good metrics", pick: "High-traffic services, risky changes" },
    { name: "Rolling", mechanic: "Instances are replaced batch by batch.", strength: "No duplicate stack needed", cost: "Mixed versions during rollout, slower rollback", pick: "Stateless fleets, cost-sensitive shops" },
    { name: "In-place", mechanic: "The same instance is torn down and rebuilt.", strength: "Cheapest, simplest", cost: "Downtime window; rollback is a rebuild", pick: "Dev/test or maintenance windows" },
];
const ARTIFACT_MATRIX = [
    { type: "Container image", example: "ledger-api:v3.0.0", note: "Runtime + app packaged; millisecond startup; the microservice default." },
    { type: "VM image", example: "ledger-api-ami.v3", note: "Whole machine; boots in tens of seconds; legacy or heavyweight workloads." },
    { type: "RPM / Debian package", example: "ledger-api-3.0.0.x86_64.rpm", note: "Installed into a pre-provisioned OS host." },
    { type: "ZIP / tar / flat files", example: "ledger-api-dist.zip", note: "Loose bundles for scripts, static sites, config packs." },
];
const REAL_WORLD_TOOLS = "Real plants assemble this same line from tools like Jenkins, GitLab CI, GitHub Actions, CircleCI or cloud-native services (AWS CodePipeline, Azure DevOps), with Git for source control, Terraform/CloudFormation/Ansible for provisioning, Docker/OCI for containers, and registries such as Harbor, Artifactory, GHCR or cloud provider registries. Concepts identical, logos different.";
const BLUE_TEAM_TAKEAWAYS = [
    "Order the line first: build → test → scan → package → release → production is the gate ladder; every rung you skip becomes an outage later.",
    "Treat every pipeline stage as a blocking gate, not a report generator: failing coverage, failing scans or unsigned artifacts must stop promotion.",
    "Keep secrets out of YAML and history: vault references at runtime, rotation on exposure, history purge after leaks.",
    "Pin dependencies and verify checksums/signatures — floating ranges let the registry choose what ships.",
    "Watch the release: error-rate and latency alerts wired back into the pipeline are what turn rollback from memory into a one-switch action.",
];
const RED_TEAM_TAKEAWAYS = [
    "Pipelines concentrate power: runners hold secrets, so a leaked YAML or a poisoned dependency propagates everywhere the pipeline deploys.",
    "Floating dependency ranges are an invitation: whoever publishes the next version decides what your build runs.",
    "Unsigned artifacts and permissive registries make substitution cheap — as the unknown-runner v3.0.0 row demonstrated.",
    "Disabling stages 'temporarily' (as the departing engineer did) is the quietest way to remove every gate at once.",
    "Defenders reading the same logs catch these: secret scanners, SCA, signature checks and canary metrics are the tripwires.",
];
const DETECTION_ROWS = [
    { signal: "Secret-scan findings in pipeline config", source: "Secret detection on SCM + pipeline YAML", logic: "alert on credential-shaped strings outside vault references" },
    { signal: "Unexpected dependency resolution", source: "Build logs + dependency manifest", logic: "alert when a floating range resolves to a version newer than the pinned baseline" },
    { signal: "Unsigned / unverified artifact", source: "Registry events + signatures", logic: "block promotion of artifacts without signature + checksum match" },
    { signal: "Test/scan stage disabled or skipped", source: "Pipeline config audit", logic: "alert when quality gates are toggled off outside a change request" },
    { signal: "Bad release in production", source: "Error-rate & latency metrics", logic: "alert on error rate > baseline ×3 or p95 latency > +50% within 15 min of deploy" },
];

// ---- Pinned console evidence for Hard mode (moved from ConveyorLine.tsx — it is data, not logic) ----
const PINNED_1042 = [
  "── pinned · last night's sweep #1042 (from the previous shift) ──",
  "[source] WARN: webhook still watching 'feature/*' — 0 main pushes captured (stale)",
  "[docs]    lint job OK on feature/docs (docs-site:0.4) — informational",
  "[build]   FATAL: runtime mismatch — service requires Node >= 20, runner is Node 14",
  "[build]   WARN: ledger-parser range ^2.4.1 resolved to 2.4.7 (published 2 days ago, maintainer unverified)",
  "[perf]    cold-start p95 980 ms — no threshold breach, informational",
  "[test]    unit suite DISABLED — 0 tests executed",
  "[ci-bot]  stale job ledger-api@feature/auth-refactor skipped (branch deleted)",
  "── end of pinned sweep #1042 ──",
];
