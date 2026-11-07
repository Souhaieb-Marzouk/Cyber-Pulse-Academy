// ─── Launch Control lab — DATA BUNDLE (js/data.js) ──────────────────────────
// Compiled 1:1 from the original framework lab's TypeScript content modules
// (content.ts + cases.ts + quiz.ts). Classic scripts, no build step.
// All lab content is synthetic training data: fictional provider "NimbusScale",
// fictional operator "Cobalt Freight". Nothing here touches a real provider.

// Fictional provider: NimbusScale (ns-), fictional operator: Cobalt Freight.
// All data is synthetic training data.
const STAGES = [
    { id: "s1", num: 1, name: "Request & validate", blurb: "Template lint, parameters, IAM and change record checked before anything is created." },
    { id: "s2", num: 2, name: "Capacity & quota", blurb: "Account service limits and regional headroom are checked against the request." },
    { id: "s3", num: 3, name: "Orchestration & dependencies", blurb: "Resource ordering, DNS, waits and provider APIs — where races start." },
    { id: "s4", num: 4, name: "Image & template", blurb: "Golden images, drivers and guest tools — the artifact everyone inherits." },
    { id: "s5", num: 5, name: "Guest customization", blurb: "User-data / cloud-init runs inside the instance; exit codes matter." },
    { id: "s6", num: 6, name: "Validation & handoff", blurb: "Health checks, activation and traffic shift — the last line before users." },
];
const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.id, s]));
// Shuffled for the OBJ-M1 ordering exercise.
const STAGES_SHUFFLED = ["s3", "s5", "s1", "s6", "s2", "s4"];
// The 7 official CV0-004 6.1 sub-bullets + the no-fault escape hatch.
const CATEGORIES = [
    { id: "incompatibility", label: "Incompatibility — drivers / OS / platform mismatch", short: "Incompatibility" },
    { id: "misconfig-template", label: "Misconfiguration — template / IaC error", short: "Misconfig (template)" },
    { id: "misconfig-dependency", label: "Misconfiguration — dependency (DNS, NTP, licensing, network)", short: "Misconfig (dependency)" },
    { id: "misconfig-script", label: "Misconfiguration — post-deployment script", short: "Misconfig (script)" },
    { id: "misconfig-orchestration", label: "Misconfiguration — orchestration ordering", short: "Misconfig (orchestration)" },
    { id: "outdated", label: "Outdated definitions — stale image / old definitions", short: "Outdated definitions" },
    { id: "deprecation", label: "Deprecation — retired family / EOL OS / retired API", short: "Deprecation" },
    { id: "outage", label: "Outage — provider-side incident", short: "Outage" },
    { id: "resource-limits", label: "Resource limits — quota / service limit", short: "Resource limits" },
    { id: "regional", label: "Regional availability — capacity stock-out", short: "Regional availability" },
    { id: "nofault", label: "No fault — healthy / expected / no action needed", short: "No fault" },
];
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
// ─── OBJ-M1 pipeline ordering (correct = STAGES order) ──────────────────────
// ─── OBJ-M2 signature matching drill ────────────────────────────────────────
const MATCH_DRILL = [
    { id: "sigA", snippet: "CREATE_FAILED — QuotaExceeded: vCPU quota 48 exceeded (requested total 80)", answer: "resource-limits" },
    { id: "sigB", snippet: "initramfs panic — no virtio driver for root device (kernel 2.6.32)", answer: "incompatibility" },
    { id: "sigC", snippet: "instance family ns-classic retired in ns-eu-1 on 2026-08-01 — deploy requests rejected", answer: "deprecation" },
    { id: "sigD", snippet: "InsufficientInstanceCapacity — ns-storage.4xlarge unavailable in ns-eu-1b (on-demand)", answer: "regional" },
    { id: "sigE", snippet: "RequestError: metadata endpoint timeout ×10 — provider INC-4471 active in region", answer: "outage" },
];
// Only the official bullets — students map each signature to one of the seven.
const OFFICIAL_BULLETS = [
    { value: "incompatibility", label: "Incompatibility" },
    { value: "misconfigurations", label: "Misconfigurations" },
    { value: "outdated", label: "Outdated definitions" },
    { value: "deprecation", label: "Deprecation" },
    { value: "outage", label: "Outages" },
    { value: "resource-limits", label: "Resource limits" },
    { value: "regional", label: "Regional availability" },
];
// R6 — deterministic display shuffles (same on server and client, no hydration
// mismatch). Drills render in these orders so item position never tracks the
// pedagogical or answer order.
const MATCH_DRILL_ORDER = ["sigC", "sigA", "sigE", "sigD", "sigB"];
const DATASOURCE_ORDER = ["ds3", "ds1", "ds4", "ds2"];
// ─── OBJ-M7 detection drill ─────────────────────────────────────────────────
const DATASOURCE_DRILL = [
    {
        id: "ds1",
        scenario: "Fresh instances boot fine but never report telemetry; monitoring shows an invisible fleet.",
        options: [
            { value: "cpu", label: "CPU utilization charts" },
            { value: "heartbeat", label: "Guest agent heartbeat alerts" },
            { value: "billing", label: "Billing report" },
            { value: "firewall", label: "Firewall counters" },
        ],
        answer: "heartbeat",
    },
    {
        id: "ds2",
        scenario: "A stack creation fails seconds after apply with a provider error code; nothing was created.",
        options: [
            { value: "disk", label: "Disk I/O metrics" },
            { value: "av", label: "Antivirus definition logs" },
            { value: "events", label: "Deployment / orchestration event stream" },
            { value: "ntp", label: "NTP sync logs" },
        ],
        answer: "events",
    },
    {
        id: "ds3",
        scenario: "New Windows VMs sit in a licensing grace period after deploy.",
        options: [
            { value: "lb", label: "Load balancer metrics" },
            { value: "activation", label: "Activation service / KMS logs" },
            { value: "mem", label: "Memory graphs" },
            { value: "cost", label: "Cost explorer" },
        ],
        answer: "activation",
    },
    {
        id: "ds4",
        scenario: "The deploy engine reports SUCCESS, yet users receive 503 responses.",
        options: [
            { value: "count", label: "Instance count" },
            { value: "quota", label: "Quota dashboard" },
            { value: "dns", label: "DNS query logs" },
            { value: "health5xx", label: "Health-check failure metrics with alerting" },
        ],
        answer: "health5xx",
    },
];
// ─── OBJ-M11 prevention gate ────────────────────────────────────────────────
const PREVENTION_OPTIONS = [
    { value: "iac-lint", label: "Template lint + offline validation in CI before apply" },
    { value: "quota-alerts", label: "Quota utilization alerts (80% threshold) with cleanup runbook" },
    { value: "image-pipeline", label: "Golden-image pipeline that verifies agent heartbeat" },
    { value: "preflight-deps", label: "Dependency pre-flight: DNS, NTP, KMS records checked pre-apply" },
    { value: "wait-conditions", label: "Explicit wait/depends-on rules + idempotent scripts" },
    { value: "dep-watch", label: "Deprecation watch: instance families, OS EOL, API versions" },
    { value: "open-sg", label: "Open security groups to 0.0.0.0/0 to avoid connectivity failures" },
    { value: "no-health", label: "Disable health-check gates so deployments always report SUCCESS" },
];
const PREVENTION_CORRECT = ["iac-lint", "quota-alerts", "image-pipeline", "preflight-deps", "wait-conditions", "dep-watch"];
// ─── OBJ-H9 prevention blueprint (control → pipeline stage) ─────────────────
const BLUEPRINT_CONTROLS = [
    { id: "lint-gate", label: "Template lint & static validation", stage: "s1" },
    { id: "quota-gate", label: "Quota headroom check & utilization alerts", stage: "s2" },
    { id: "preflight-gate", label: "Dependency pre-flight (DNS / NTP / KMS)", stage: "s3" },
    { id: "image-gate", label: "Image pipeline with agent-heartbeat verification", stage: "s4" },
    { id: "script-gate", label: "Idempotent user-data with exit-code capture", stage: "s5" },
    { id: "health-gate", label: "Health-check gate before traffic shift", stage: "s6" },
];
// ─── Glossary (15 terms) ────────────────────────────────────────────────────
const GLOSSARY = [
    { term: "IaC (Infrastructure as Code)", def: "Defining infrastructure in machine-readable templates so deployments are repeatable, reviewable and validatable." },
    { term: "Template", def: "An IaC document (parameters, resources, outputs) that the deploy engine consumes; parameter typos fail here first." },
    { term: "Golden image", def: "A pre-built, versioned machine image every instance inherits — a defect in it propagates fleet-wide." },
    { term: "User data / cloud-init", def: "First-boot customization scripts run inside a new instance; a non-zero exit fails post-configuration." },
    { term: "Guest agent", def: "In-guest telemetry/security software; its heartbeat proves the instance is observable." },
    { term: "Quota (service limit)", def: "A per-account/region ceiling on consumable resources such as vCPU; requests beyond it fail pre-creation." },
    { term: "Regional availability", def: "Whether the provider physically has the requested instance capacity in that region/AZ right now — independent of your quota." },
    { term: "Wait condition / depends-on", def: "Orchestration rule forcing step B to start only after step A signals completion." },
    { term: "Idempotency", def: "Script property: re-running it produces the same result instead of breaking the instance." },
    { term: "Race condition", def: "Two pipeline steps racing without ordering; the wrong one wins and the failure is silent." },
    { term: "Health-check gate", def: "Traffic shifts only when checks pass — prevents 'SUCCESS but broken' deployments." },
    { term: "KMS activation", def: "Volume-licensing flow where Windows clients locate a KMS host via a DNS SRV record." },
    { term: "BYOL", def: "Bring your own license — reuse owned licenses; only safe when inventory is confirmed." },
    { term: "Compatibility matrix", def: "The provider/OS/driver support grid you check before any migration or import." },
    { term: "Pre-flight check", def: "Automated validation run before apply — the cheapest place for a deployment to fail." },
];
// ─── Briefing (C1) ──────────────────────────────────────────────────────────
const BRIEFING = {
    org: "Cobalt Freight — fleet-tracking platform",
    event: "Wave 3 migration launch night, Friday 2026-10-30, 21:00–22:30 UTC",
    situation: "Cobalt Freight is moving its fleet-tracking platform to the NimbusScale cloud in region ns-eu-1. Tonight is Wave 3: thirteen deployments are scheduled — application fleets, a P2V migration, Windows ERP nodes and batch workers. You are the Platform Ops on-call engineer.",
    hook: "Eleven of the thirteen deployments will misbehave in thirteen different ways. Every failure is a real Cloud+ CV0-004 6.1 pattern: incompatibility, misconfigurations, outdated definitions, deprecation, outages, resource limits and regional availability.",
    rules: [
        "Open a deployment chip on the pipeline rail, read the evidence tabs, then file a diagnosis at the triage desk.",
        "CHECK RESULTS validates each objective instantly — wrong answers cost stars, never progress.",
        "The Field manual (header) holds the taxonomy, drills and glossary; three of the Medium objectives live there.",
        "Everything is synthetic training data. Nothing here touches a real cloud provider.",
    ],
    cert: "Exam relevance: CV0-004 Domain 6.0 Troubleshooting (12%), objective 6.1 'Given a scenario, troubleshoot deployment issues' — your Lesson 6.1. The quiz mirrors the 'given a scenario' PBQ style.",
};
const MODE_CARDS = {
    medium: {
        name: "Field Technician",
        role: "Medium — learn the shift",
        bullets: [
            "12 guided objectives, introduced in order with a visible 'where to look' affordance",
            "3-tier hints available anywhere (nudge → direction → demonstration)",
            "Tolerant validation: synonyms accepted, wrong answers give teaching feedback",
            "Concept quiz (6 items) with an explanation after every answer",
        ],
    },
    hard: {
        name: "Incident Commander",
        role: "Hard — run the launch night",
        bullets: [
            "9 broad, multi-step challenges across a noisy 13-deployment board",
            "2 red herrings + in-case distractors; no 'where to look', hints cost score",
            "Strict validation: exact values, exact sequences, near-misses rejected with rationale",
            "Scenario quiz (7 items) requiring analysis and justification",
        ],
    },
};
const QUIZ_UNLOCK = { medium: 8, hard: 6 };


const CASES = [
    // ── dep-2201 · RESOURCE LIMITS (quota) ─────────────────────────────────────
    {
        id: "dep-2201",
        service: "edge-frontend",
        spec: "×12 ns-standard.xlarge",
        status: "failed",
        stageId: "s2",
        originStageId: "s2",
        truthCategory: "resource-limits",
        symptom: "CREATE_FAILED — QuotaExceeded before any resource was created",
        log: [
            { id: "L1", t: "21:04:11", text: "[INFO]  wave3/dep-2201 | target: edge-frontend v3.4.1 — 12 × ns-standard.xlarge (4 vCPU / 16 GiB) in ns-eu-1" },
            { id: "L2", t: "21:04:12", text: "[INFO]  capacity | account usage: 32/48 vCPU (family ns-standard, region ns-eu-1)" },
            { id: "L3", t: "21:04:12", text: "[INFO]  capacity | request adds 48 vCPU → projected 80/48 vCPU" },
            { id: "L4", t: "21:04:13", text: "[WARN]  capacity | headroom 16 vCPU is below request (48 vCPU)" },
            { id: "L5", t: "21:04:14", text: "[INFO]  quota | service limit ns-standard vCPU: 48 (hard limit) — increase requires approval" },
            { id: "L6", t: "21:04:15", text: "[ERROR] deploy | CREATE_FAILED — QuotaExceeded: vCPU quota 48 exceeded (requested total 80)" },
            { id: "L7", t: "21:04:16", text: "[INFO]  deploy | rollback: no resources created (pre-flight gate stopped the batch)" },
            { id: "L8", t: "21:04:16", text: "[INFO]  deploy | hint: 16 vCPU idle in sandbox project 'sbx-fleet-sim' (last active 61 days ago)" },
        ],
        metrics: [
            { label: "vCPU in use (ns-standard)", unit: "vCPU", points: [28, 30, 30, 31, 32, 32, 32], bad: true },
            { label: "Elastic IPs in use", unit: "count", points: [13, 14, 14, 14, 14, 14, 14] },
        ],
        config: [
            {
                title: "Service limits — ns-eu-1",
                rows: [
                    { k: "vCPU (family ns-standard)", v: "32 / 48 USED", state: "bad" },
                    { k: "Elastic IPs", v: "14 / 15", state: "warn" },
                    { k: "Snapshots", v: "1,204 / unlimited", state: "ok" },
                    { k: "Object storage", v: "8.1 / 20 TiB", state: "ok" },
                ],
            },
        ],
        detailFields: [
            {
                id: "resource",
                kind: "select",
                label: "Which constrained resource stopped this deployment?",
                options: [
                    { value: "vcpu", label: "vCPU quota (family ns-standard)" },
                    { value: "memory", label: "Memory quota" },
                    { value: "eip", label: "Elastic IP limit" },
                    { value: "disk", label: "Storage quota" },
                ],
            },
        ],
        runbook: [
            { id: "release-idle", label: "Terminate orphaned sandbox capacity — 16 idle vCPU in sbx-fleet-sim", correct: true },
            { id: "quota-increase", label: "Request quota increase for ns-standard family (48 → 96 vCPU)", correct: true },
            { id: "rerun", label: "Re-run the Wave 3 batch once headroom is confirmed", correct: true },
            { id: "downsize", label: "Downsize the whole production fleet to t3-class", correct: false },
            { id: "open-sg", label: "Open egress 0.0.0.0/0 on sg-app-eu1 'just in case'", correct: false },
            { id: "m4-family", label: "Switch the request to retired family ns-classic", correct: false },
        ],
    },
    // ── dep-2202 · MISCONFIGURATION (DNS dependency) ───────────────────────────
    {
        id: "dep-2202",
        service: "tracking-api",
        spec: "×6 ns-standard.large",
        status: "degraded",
        stageId: "s6",
        originStageId: "s3",
        truthCategory: "misconfig-dependency",
        symptom: "Instances running, 6/6 health checks failing — cannot resolve the database name",
        log: [
            { id: "L1", t: "21:07:02", text: "[INFO]  wave3/dep-2202 | tracking-api ×6 (ns-standard.large) → vpc-app-eu1 / subnet-app-a" },
            { id: "L2", t: "21:07:38", text: "[INFO]  deploy | CREATE_COMPLETE — 6/6 instances running" },
            { id: "L3", t: "21:07:41", text: "[WARN]  health | i-0a11 health check 1/3 FAIL — tcp connect db.internal.cobaltfreight.example:5432 unreachable" },
            { id: "L4", t: "21:07:42", text: "[ERROR] guest | i-0a11 runcmd wait-for-db: getaddrinfo db.internal.cobaltfreight.example ENOTFOUND (12/12 retries)" },
            { id: "L5", t: "21:07:43", text: "[ERROR] health | 6/6 instances unhealthy — deployment marked DEGRADED" },
        ],
        events: [
            { id: "E1", t: "21:06:55", text: "dns | private zone internal.cobaltfreight.example created — records: db → 10.20.4.10" },
            { id: "E2", t: "21:06:55", text: "dns | zone association: 0 VPCs attached" },
            { id: "E3", t: "21:07:02", text: "deploy | stack tracking-api attached to vpc-app-eu1" },
        ],
        config: [
            {
                title: "Private DNS zone — internal.cobaltfreight.example",
                rows: [
                    { k: "A record: db.internal...", v: "10.20.4.10", state: "ok" },
                    { k: "VPC associations", v: "NONE — zone is orphaned", state: "bad" },
                    { k: "Resolved from vpc-app-eu1", v: "NXDOMAIN", state: "bad" },
                ],
            },
        ],
        detailFields: [
            {
                id: "issue",
                kind: "select",
                label: "What exactly is broken?",
                options: [
                    { value: "zone-vpc", label: "Private zone is not associated with vpc-app-eu1" },
                    { value: "record-missing", label: "The A record for db.internal is missing" },
                    { value: "db-down", label: "The database instance is stopped" },
                    { value: "port-block", label: "Port 5432 is blocked by a security group" },
                ],
            },
            {
                id: "chain",
                kind: "order",
                hardOnly: true,
                label: "Build the dependency chain — root cause first",
                options: [
                    { value: "chain-zone", label: "Root cause: private DNS zone has no VPC association" },
                    { value: "chain-resolve", label: "Instances cannot resolve db.internal.cobaltfreight.example" },
                    { value: "chain-wait", label: "cloud-init wait-for-db retries exhaust (ENOTFOUND)" },
                    { value: "chain-health", label: "6/6 health checks fail — deployment DEGRADED" },
                ],
            },
        ],
        runbook: [
            { id: "associate-zone", label: "Associate internal.cobaltfreight.example with vpc-app-eu1", correct: true },
            { id: "verify-resolve", label: "Verify db.internal resolves from an app instance", correct: true },
            { id: "rerun-health", label: "Re-run health checks", correct: true },
            { id: "recreate-db", label: "Recreate the database instance", correct: false },
            { id: "expose-db", label: "Open port 5432 to 0.0.0.0/0 to 'fix' reachability", correct: false },
        ],
        runbookOrder: true,
    },
    // ── dep-2203 · MISCONFIGURATION (template / IaC) ───────────────────────────
    {
        id: "dep-2203",
        service: "billing-worker",
        spec: "stack from template.yaml rev #214",
        status: "failed",
        stageId: "s1",
        originStageId: "s1",
        truthCategory: "misconfig-template",
        symptom: "Pre-flight validation rejected the change set — parameter not in AllowedValues",
        log: [
            { id: "L1", t: "21:12:04", text: "[INFO]  wave3/dep-2203 | billing-worker stack from template.yaml (rev #214)" },
            { id: "L2", t: "21:12:05", text: "[ERROR] iac | validation failed — parameter 'InstanceType' value 'ns-standard.xlrage' not in AllowedValues (template.yaml:47)" },
            { id: "L3", t: "21:12:05", text: "[WARN]  iac | cosmetic: yaml indent drift at template.yaml:52 (non-fatal)" },
            { id: "L4", t: "21:12:06", text: "[INFO]  iac | nothing deployed — pre-flight gate rejected the change set" },
        ],
        template: {
            title: "template.yaml (rev #214) — excerpt",
            lines: [
                { n: 44, text: "Parameters:" },
                { n: 45, text: "  InstanceType:" },
                { n: 46, text: "    Type: String" },
                { n: 47, text: "    Default: ns-standard.xlrage" },
                { n: 48, text: "    AllowedValues: [t3.medium, t3.large, ns-standard.xlarge, ns-standard.2xlarge]" },
                { n: 49, text: "  Env:" },
                { n: 50, text: "    Type: String" },
                { n: 51, text: "    Default: prod" },
                { n: 52, text: "      Description: deployment environment" },
                { n: 53, text: "Resources:" },
                { n: 54, text: "  WorkerFleet:" },
                { n: 55, text: "    Type: ns::autoscaling::Fleet" },
                { n: 56, text: "    Properties:" },
                { n: 57, text: "      InstanceType: !Ref InstanceType" },
            ],
        },
        detailFields: [
            {
                id: "line",
                kind: "text",
                label: "Template line number with the fatal error",
                placeholder: "e.g. 52",
            },
            {
                id: "value",
                kind: "select",
                label: "Correct value for that line",
                options: [
                    { value: "ns-standard.xlarge", label: "ns-standard.xlarge" },
                    { value: "t3.medium", label: "t3.medium" },
                    { value: "ns-standard.2xlarge", label: "ns-standard.2xlarge" },
                    { value: "ns-standard.xlrage", label: "ns-standard.xlrage" },
                ],
            },
            {
                id: "control",
                kind: "select",
                hardOnly: true,
                label: "Which control catches this BEFORE apply?",
                options: [
                    { value: "iac-lint", label: "Offline template lint / validation in CI (pre-flight)" },
                    { value: "allowed-any", label: "Widen AllowedValues to accept any string" },
                    { value: "manual-review", label: "Manual eyeball review only" },
                    { value: "post-apply", label: "Fix it after apply in production" },
                ],
            },
        ],
        runbook: [
            { id: "fix-47", label: "Correct line 47 → ns-standard.xlarge", correct: true },
            { id: "lint", label: "Run template validation offline, then re-apply", correct: true },
            { id: "widen", label: "Widen AllowedValues to accept any string", correct: false },
            { id: "delete-stack", label: "Delete the stack and start over", correct: false },
        ],
    },
    // ── dep-2204 · OUTDATED DEFINITIONS (stale golden image) ───────────────────
    {
        id: "dep-2204",
        service: "storefront-web",
        spec: "×8 from ami-gold-web-2025.11",
        status: "degraded",
        stageId: "s4",
        originStageId: "s4",
        truthCategory: "outdated",
        symptom: "Deployed and serving — but invisible: no agent telemetry, no EDR on 8/8",
        log: [
            { id: "L1", t: "21:16:44", text: "[INFO]  wave3/dep-2204 | storefront-web ×8 from image ami-gold-web-2025.11 (built 2025-11-02, pinned)" },
            { id: "L2", t: "21:17:59", text: "[INFO]  deploy | CREATE_COMPLETE — 8/8 instances serving traffic" },
            { id: "L3", t: "21:18:31", text: "[WARN]  agent | telemetry heartbeat absent for 8/8 instances (expected < 60s after boot)" },
            { id: "L4", t: "21:18:32", text: "[WARN]  security | EDR agent not detected on 8/8 instances (policy AGENTS-MANDATORY)" },
            { id: "L5", t: "21:18:40", text: "[INFO]  image | build pipeline log: step 7 'install guest agents' SKIPPED — condition tag missing in ami-gold-web-2025.11" },
            { id: "L6", t: "21:18:41", text: "[WARN]  agent | storefront appears as an offline fleet — on-call cannot see CPU, memory or security state" },
        ],
        userdata: [
            { id: "B1", t: "build", text: "step 5: apt-get install -y fleet-agent edr-sensor" },
            { id: "B2", t: "build", text: "step 6: systemctl enable --now fleet-agent edr-sensor" },
            { id: "B3", t: "build", text: "step 7: install guest agents   # when: build-tag = 2026.x   ← SKIPPED on 2025.11" },
        ],
        detailFields: [
            {
                id: "plan",
                kind: "select",
                label: "Recovery plan for the live fleet",
                options: [
                    { value: "blue-green", label: "Fix forward — rebuild image, canary-verify, blue-green replace" },
                    { value: "bigbang", label: "Terminate all 8 and redeploy at once" },
                    { value: "manual-only", label: "Manually install agents and close the ticket" },
                    { value: "rollback-region", label: "Roll the whole wave back to the previous region" },
                ],
            },
        ],
        runbook: [
            { id: "rebuild-image", label: "Rebuild the golden image with the agent step un-skipped", correct: true },
            { id: "canary-validate", label: "Validate agent heartbeat on a canary instance", correct: true },
            { id: "shift-traffic", label: "Blue-green: shift traffic, then replace old instances", correct: true },
            { id: "terminate-all", label: "Terminate all 8 instances immediately", correct: false },
        ],
    },
    // ── dep-2205 · MISCONFIGURATION (post-deployment script) ───────────────────
    {
        id: "dep-2205",
        service: "batch-etl",
        spec: "×2 ns-standard.large",
        status: "failed",
        stageId: "s5",
        originStageId: "s5",
        truthCategory: "misconfig-script",
        symptom: "user-data exit 1 — nginx never installed, service absent",
        log: [
            { id: "L1", t: "21:21:02", text: "[INFO]  wave3/dep-2205 | batch-etl ×2 (ns-standard.large) → vpc-data-eu1" },
            { id: "L2", t: "21:21:45", text: "[ERROR] deploy | post-configuration failed — user-data exit 1 (nginx not installed; service absent)" },
            { id: "L3", t: "21:21:46", text: "[INFO]  deploy | instances kept for inspection (do-not-terminate flag)" },
        ],
        userdata: [
            { id: "C1", t: "21:21:03", text: "Cloud-init v. 24.1 running 'modules:final' at 2026-10-30 21:21:03Z (up 41s)" },
            { id: "C2", t: "21:21:04", text: "+ export APP_ENV=prod" },
            { id: "C3", t: "21:21:06", text: "+ apt-get update -qq (ok, 3.2s)" },
            { id: "C4", t: "21:21:07", text: "+ apt-get instal -y nginx" },
            { id: "C5", t: "21:21:08", text: "E: Invalid operation instal" },
            { id: "C6", t: "21:21:41", text: "2026-10-30 21:21:41Z [WARN] cc_scripts_user.py: script exit code 1 — deployment marked FAILED-POSTCONFIG" },
        ],
        detailFields: [
            {
                id: "command",
                kind: "text",
                label: "The corrected command line",
                placeholder: "type the fixed command…",
            },
            {
                id: "idem",
                kind: "select",
                hardOnly: true,
                label: "Before re-running, the script must be…",
                options: [
                    { value: "check-first", label: "Idempotent — check before install, tolerate re-runs" },
                    { value: "retry-loop", label: "Wrapped in an infinite retry loop" },
                    { value: "manual", label: "Run manually on each instance from now on" },
                    { value: "ignore", label: "Left as-is — exit codes are informational" },
                ],
            },
        ],
        runbook: [
            { id: "fix-script", label: "Fix the typo in the user-data script", correct: true },
            { id: "idempotent", label: "Make the script idempotent before re-run", correct: true },
            { id: "reprovision", label: "Re-provision from a clean state", correct: true },
            { id: "reboot", label: "Reboot the instances until it works", correct: false },
            { id: "manual-close", label: "Install nginx manually and close the ticket", correct: false },
        ],
    },
    // ── dep-2206 · MISCONFIGURATION (licensing dependency / KMS) ───────────────
    {
        id: "dep-2206",
        service: "erp-app",
        spec: "×4 Windows Server 2022",
        status: "degraded",
        stageId: "s6",
        originStageId: "s3",
        truthCategory: "misconfig-dependency",
        symptom: "Activation failed 0x8007232A — KMS SRV record does not resolve",
        log: [
            { id: "L1", t: "21:26:10", text: "[INFO]  wave3/dep-2206 | erp-app ×4 (Windows Server 2022 image win2022-gold-r2) → vpc-app-eu1" },
            { id: "L2", t: "21:27:55", text: "[WARN]  license | activation failed — 0x8007232A DNS name does not exist" },
            { id: "L3", t: "21:27:56", text: "[INFO]  license | KMS client set to use DNS SRV: _vlmcs._tcp.corp.cobaltfreight.example" },
            { id: "L4", t: "21:27:57", text: "[INFO]  resolver | query _vlmcs._tcp.corp.cobaltfreight.example SRV → NXDOMAIN" },
            { id: "L5", t: "21:30:12", text: "[WARN]  license | grace period remaining: 180 days (activation retried every 120 min)" },
        ],
        config: [
            {
                title: "corp.cobaltfreight.example — SRV records",
                rows: [
                    { k: "_vlmcs._tcp (KMS)", v: "MISSING", state: "bad" },
                    { k: "_ldap._tcp (AD)", v: "dc01 — 10.20.1.10", state: "ok" },
                    { k: "_sipfederationtls._tcp", v: "edge01 — 198.51.100.7", state: "ok" },
                ],
            },
        ],
        detailFields: [
            {
                id: "fix",
                kind: "select",
                label: "Correct fix for the activation failures",
                options: [
                    { value: "srv-record", label: "Publish _vlmcs._tcp SRV → kms01.corp.cobaltfreight.example" },
                    { value: "keys", label: "Type a unique product key on each of the 4 VMs" },
                    { value: "reinstall", label: "Reinstall all four VMs" },
                    { value: "internet", label: "Point activation at internet activation servers" },
                ],
            },
            {
                id: "model",
                kind: "select",
                hardOnly: true,
                label: "Wave 4 planning: 3 Windows VMs, BYOL inventory confirms only 2 licenses, KMS reachable. Licensing model?",
                options: [
                    { value: "hybrid", label: "BYOL for the 2 confirmed licenses; license-included for the third" },
                    { value: "byol-all", label: "BYOL for all three — the inventory will stretch" },
                    { value: "included-all", label: "License-included for all three, ignoring confirmed entitlements" },
                    { value: "defer", label: "Decide after deployment — activation always works out" },
                ],
            },
        ],
        runbook: [
            { id: "publish-srv", label: "Publish _vlmcs._tcp SRV → kms01.corp.cobaltfreight.example", correct: true },
            { id: "activate-retry", label: "Run activation retry (slmgr /ato) on the fleet", correct: true },
            { id: "verify-activated", label: "Verify activation state on all 4 VMs", correct: true },
            { id: "reinstall-os", label: "Reinstall the operating systems", correct: false },
            { id: "key-manual", label: "Enter manual keys on each VM", correct: false },
        ],
    },
    // ── dep-2207 · MISCONFIGURATION (orchestration race) ───────────────────────
    {
        id: "dep-2207",
        service: "notifier-service",
        spec: "stack — app + db-init job",
        status: "success-risk",
        stageId: "s6",
        originStageId: "s3",
        truthCategory: "misconfig-orchestration",
        symptom: "Status SUCCESS — but the app started before the database finished bootstrapping",
        log: [
            { id: "L1", t: "21:31:20", text: "[INFO]  wave3/dep-2207 | notifier-service stack — CREATE_COMPLETE (2m14s) — status: SUCCESS" },
            { id: "L2", t: "21:31:19", text: "[INFO]  job | db-init (schema migration) started" },
            { id: "L3", t: "21:31:22", text: "[INFO]  app | notifier 6/6 instances started — no depends-on rule defined" },
            { id: "L4", t: "21:31:24", text: "[WARN]  app | HTTP 503 — schema tables absent (migrations still running)" },
            { id: "L5", t: "21:36:02", text: "[INFO]  job | db-init COMPLETE — schema ready (app recovered 21:36:40)" },
        ],
        events: [
            { id: "E1", t: "21:31:19.8", text: "job | db-init RUNNING (eta 4 min)" },
            { id: "E2", t: "21:31:20.4", text: "app | 6 instances STARTED — 0.6 s after db-init began" },
            { id: "E3", t: "21:36:02", text: "job | db-init COMPLETE" },
        ],
        metrics: [
            { label: "HTTP 503 responses (per 30 s)", unit: "resp", points: [0, 12, 38, 64, 71, 66, 52, 41, 30, 18, 9, 2, 0], bad: true },
            { label: "App CPU (flat — fleet is idle)", unit: "%", points: [9, 11, 10, 9, 12, 10, 9, 11, 10, 9, 10, 11, 10] },
        ],
        detailFields: [
            {
                id: "cause",
                kind: "select",
                label: "Root cause of the 503 burst",
                options: [
                    { value: "app-before-db", label: "App started before the database bootstrap completed (race)" },
                    { value: "db-misconfig", label: "Database misconfiguration" },
                    { value: "lb", label: "Load balancer misroute" },
                    { value: "app-bug", label: "Application code defect" },
                ],
            },
            {
                id: "metric",
                kind: "select",
                label: "Which signal detects this silent failure?",
                options: [
                    { value: "health-503", label: "Health-check failure count (5xx responses)" },
                    { value: "cpu", label: "CPU utilization" },
                    { value: "mem", label: "Memory utilization" },
                    { value: "cost", label: "Cost deltas" },
                ],
            },
            {
                id: "threshold",
                kind: "select",
                label: "Alert condition on that signal",
                options: [
                    { value: "gt0-5m", label: "> 0 failures sustained 5 minutes" },
                    { value: "gt80cpu", label: "> 80% CPU for 15 minutes" },
                    { value: "daily", label: "Any error in the daily report" },
                ],
            },
            {
                id: "gate",
                kind: "select",
                hardOnly: true,
                label: "Why did status checks pass while users got errors?",
                options: [
                    { value: "health-gate-traffic", label: "No health-check gate before traffic shift — SUCCESS is not health" },
                    { value: "trust-status", label: "The deploy engine SUCCESS status should be trusted" },
                    { value: "longer-timeout", label: "The health-check timeout was simply too short" },
                ],
            },
        ],
        runbook: [
            { id: "wait-condition", label: "Add explicit depends-on: notifier waits for db-init completion signal", correct: true },
            { id: "retry-backoff", label: "Add startup retry with backoff for schema readiness", correct: true },
            { id: "redeploy", label: "Redeploy the stack with the new ordering", correct: true },
            { id: "cpu-double", label: "Double app CPU — the fleet is idle at 9%", correct: false },
            { id: "db-restart", label: "Restart the database repeatedly", correct: false },
        ],
        runbookOrder: true,
    },
    // ── dep-2208 · MISCONFIGURATION (NTP dependency / time skew) ───────────────
    {
        id: "dep-2208",
        service: "auth-proxy",
        spec: "×3 ns-standard.large",
        status: "degraded",
        stageId: "s6",
        originStageId: "s3",
        truthCategory: "misconfig-dependency",
        symptom: "TLS 'certificate is not yet valid' — clock +12m47s because UDP/123 is blocked",
        log: [
            { id: "L1", t: "21:36:50", text: "[INFO]  wave3/dep-2208 | auth-proxy ×3 (ns-standard.large) → vpc-app-eu1" },
            { id: "L2", t: "21:38:12", text: "[ERROR] app | TLS handshake to idp.cobaltfreight.example failed: certificate is not yet valid" },
            { id: "L3", t: "21:38:13", text: "[WARN]  system | clock skew detected: +12m47s vs upstream time source" },
            { id: "L4", t: "21:38:14", text: "[WARN]  ntp | chrony: cannot reach 10.20.0.1:123 — egress sg-app-eu1 has no UDP/123 rule" },
            { id: "L5", t: "21:38:15", text: "[INFO]  cert | idp certificate chain valid (notBefore 2026-01-05, notAfter 2027-01-05)" },
        ],
        config: [
            {
                title: "Security group sg-app-eu1 — egress",
                rows: [
                    { k: "443/tcp → 0.0.0.0/0", v: "ALLOW", state: "ok" },
                    { k: "123/udp → 10.20.0.1 (NTP)", v: "NO RULE — blocked", state: "bad" },
                    { k: "22/tcp from bastion", v: "ALLOW", state: "ok" },
                ],
            },
        ],
        detailFields: [
            {
                id: "cause",
                kind: "select",
                label: "Why is the certificate 'not yet valid'?",
                options: [
                    { value: "skew", label: "Clock skew — NTP unreachable, so the guest clock is wrong" },
                    { value: "expired", label: "The certificate expired" },
                    { value: "ca", label: "The wrong CA chain was deployed" },
                    { value: "idp", label: "The identity provider is having an outage" },
                ],
            },
            {
                id: "port",
                kind: "text",
                label: "Blocked port/protocol (format: port/protocol)",
                placeholder: "e.g. 443/tcp",
            },
            {
                id: "rule",
                kind: "select",
                hardOnly: true,
                label: "Security-group change",
                options: [
                    { value: "egress-ntp", label: "Add egress rule: UDP/123 → 10.20.0.1 (internal NTP only)" },
                    { value: "allow-all", label: "Allow all egress to 0.0.0.0/0" },
                    { value: "disable-tls", label: "Disable TLS certificate verification" },
                ],
            },
            {
                id: "conseq",
                kind: "checks",
                hardOnly: true,
                label: "What else breaks if the skew is left unfixed? (select all that apply)",
                options: [
                    { value: "kerberos", label: "Kerberos/AD authentication breaks beyond ~5 min skew" },
                    { value: "tasks", label: "Scheduled jobs and logs drift; more TLS failures appear" },
                    { value: "replace-cert", label: "The IdP certificate must be replaced" },
                ],
            },
        ],
        runbook: [
            { id: "allow-ntp", label: "Add SG egress rule: UDP/123 → 10.20.0.1 (internal NTP)", correct: true },
            { id: "makestep", label: "Force clock resync (chronyc makestep)", correct: true },
            { id: "retest-tls", label: "Re-test the TLS handshake", correct: true },
            { id: "replace-cert", label: "Replace the IdP certificate", correct: false },
            { id: "no-tls", label: "Disable certificate verification", correct: false },
        ],
    },
    // ── dep-2209 · INCOMPATIBILITY (+ deprecation) ─────────────────────────────
    {
        id: "dep-2209",
        service: "warehouse-scan",
        spec: "P2V import from on-prem ESX",
        status: "failed",
        stageId: "s4",
        originStageId: "s4",
        truthCategory: "incompatibility",
        symptom: "Boot loop — legacy kernel has no virtio driver; secure boot rejects it",
        log: [
            { id: "L1", t: "21:41:05", text: "[INFO]  migrate | warehouse-scan (on-prem ESX import) → ns-eu-1" },
            { id: "L2", t: "21:41:39", text: "[ERROR] boot | guest kernel 2.6.32 (CentOS 6.9) — no virtio driver for root device → initramfs panic / boot loop" },
            { id: "L3", t: "21:41:40", text: "[WARN]  compat | source: raw/vmdk, BIOS boot; target policy: secure boot ON — legacy unsigned kernel rejected" },
            { id: "L4", t: "21:41:41", text: "[WARN]  compat | guest OS CentOS 6.9 — vendor EOL since 2020-11 (deprecated, no security patches)" },
            { id: "L5", t: "21:41:42", text: "[INFO]  migrate | import paused — image preserved for remediation" },
        ],
        detailFields: [
            {
                id: "fix",
                kind: "select",
                label: "Correct remediation path",
                options: [
                    { value: "virtio", label: "Inject virtio drivers into the image, retest boot" },
                    { value: "host", label: "Deploy on a larger host — hardware fixes drivers" },
                    { value: "upgrade", label: "In-place upgrade of CentOS 6.9 within the wave" },
                    { value: "disk", label: "Grow the boot disk" },
                ],
            },
            {
                id: "eol",
                kind: "select",
                hardOnly: true,
                label: "Which element here is DEPRECATED/EOL?",
                options: [
                    { value: "guest-os", label: "The guest OS — CentOS 6.9 (EOL 2020-11, no patches)" },
                    { value: "kernel-only", label: "Only the kernel version is a concern" },
                    { value: "provider", label: "The provider region is deprecated" },
                    { value: "none", label: "Nothing here is deprecated" },
                ],
            },
            {
                id: "bootmode",
                kind: "select",
                hardOnly: true,
                label: "Secure-boot handling for the unsigned legacy kernel",
                options: [
                    { value: "secure-off-or-sign", label: "Disable secure boot for this image, or re-sign the kernel" },
                    { value: "force", label: "Force secure boot with the unsigned kernel" },
                    { value: "ignore", label: "Boot policy is cosmetic — ignore it" },
                ],
            },
            {
                id: "steps",
                kind: "order",
                hardOnly: true,
                label: "Order the migration remediation",
                options: [
                    { value: "step-matrix", label: "Check the provider compatibility matrix & import guide" },
                    { value: "step-drivers", label: "Build the import image with virtio drivers" },
                    { value: "step-boot", label: "Set boot mode (disable secure boot or re-sign kernel)" },
                    { value: "step-sandbox", label: "Test boot in an isolated sandbox" },
                    { value: "step-import", label: "Schedule the production import" },
                ],
            },
        ],
        runbook: [
            { id: "compat-matrix", label: "Check the provider compatibility matrix & import guide", correct: true },
            { id: "inject-drivers", label: "Build import image with virtio drivers injected", correct: true },
            { id: "bootmode-fix", label: "Set boot mode: disable secure boot or re-sign the kernel", correct: true },
            { id: "bigger-host", label: "Move to a bigger instance family", correct: false },
            { id: "in-place", label: "In-place upgrade the EOL OS during the wave", correct: false },
        ],
        runbookOrder: true,
    },
    // ── dep-2210 · REGIONAL AVAILABILITY (AZ stock-out) ────────────────────────
    {
        id: "dep-2210",
        service: "analytics-warehouse",
        spec: "×3 ns-storage.4xlarge",
        status: "failed",
        stageId: "s2",
        originStageId: "s2",
        truthCategory: "regional",
        symptom: "InsufficientInstanceCapacity in ns-eu-1b — quota is NOT the problem",
        log: [
            { id: "L1", t: "21:46:22", text: "[INFO]  wave3/dep-2210 | analytics-warehouse ×3 (ns-storage.4xlarge) → ns-eu-1b" },
            { id: "L2", t: "21:46:30", text: "[ERROR] capacity | InsufficientInstanceCapacity — ns-storage.4xlarge unavailable in ns-eu-1b (on-demand)" },
            { id: "L3", t: "21:46:31", text: "[INFO]  capacity | account quota OK: 12/64 vCPU used for family ns-storage" },
            { id: "L4", t: "21:46:31", text: "[INFO]  capacity | suggestion: alternate AZ (ns-eu-1a/c) or flexible family list" },
        ],
        detailFields: [
            {
                id: "kind",
                kind: "select",
                label: "Classify this failure",
                options: [
                    { value: "stockout", label: "Regional availability — AZ-level stock-out (quota is fine)" },
                    { value: "quota", label: "Quota exceeded" },
                    { value: "deprecated", label: "Deprecated instance family" },
                    { value: "iam", label: "IAM authorization failure" },
                ],
            },
        ],
        runbook: [
            { id: "alt-az", label: "Retry in ns-eu-1a / ns-eu-1c or use a flexible family list", correct: true },
            { id: "reservation", label: "Request a capacity reservation for future waves", correct: true },
            { id: "quota-inc", label: "Request a quota increase — the limit is the blocker", correct: false },
            { id: "wait-blind", label: "Wait indefinitely without changing AZ or family", correct: false },
        ],
    },
    // ── dep-2211 · OUTAGE (provider-side) ──────────────────────────────────────
    {
        id: "dep-2211",
        service: "payments-api",
        spec: "×4 ns-standard.large",
        status: "failed",
        stageId: "s3",
        originStageId: "s3",
        truthCategory: "outage",
        symptom: "Metadata endpoint timeouts — provider incident INC-4471 is active",
        log: [
            { id: "L1", t: "21:51:08", text: "[INFO]  wave3/dep-2211 | payments-api ×4 (ns-standard.large) → vpc-app-eu1" },
            { id: "L2", t: "21:51:20", text: "[ERROR] deploy | RequestError: timeout contacting instance-metadata endpoint (10 tries)" },
            { id: "L3", t: "21:51:21", text: "[ERROR] orchestration | 4/4 CREATE_FAILED — no resources modified" },
            { id: "L4", t: "21:51:24", text: "[INFO]  status | provider status page: INCIDENT INC-4471 — control plane (metadata service) degraded, region ns-eu-1" },
            { id: "L5", t: "21:52:00", text: "[INFO]  runbook | RB-07: freeze non-essential changes until the provider incident resolves" },
        ],
        events: [
            { id: "E1", t: "21:50:47", text: "status | INC-4471 acknowledged — provider engineering is mitigating" },
            { id: "E2", t: "22:05:12", text: "status | INC-4471 mitigated — metadata service recovering" },
        ],
        detailFields: [
            {
                id: "response",
                kind: "select",
                label: "Correct response to this failure",
                options: [
                    { value: "status-retry", label: "Verify INC-4471 on the status page; freeze changes; retry after recovery" },
                    { value: "keys", label: "Rotate access keys immediately" },
                    { value: "vpc", label: "Rebuild the VPC from scratch" },
                    { value: "ignore", label: "Ignore — deployments self-heal" },
                ],
            },
        ],
        runbook: [
            { id: "status-page", label: "Confirm scope on the provider status page (INC-4471)", correct: true },
            { id: "freeze", label: "Freeze non-essential changes during the incident", correct: true },
            { id: "retry", label: "Retry the deployment after provider recovery", correct: true },
            { id: "config-change", label: "Change network config to 'work around' the outage", correct: false },
        ],
    },
    // ── dep-2212 · RED HERRING (healthy) ───────────────────────────────────────
    {
        id: "dep-2212",
        service: "legacy-cron",
        spec: "×1 ns-standard.small",
        status: "healthy",
        stageId: "s6",
        originStageId: "s6",
        truthCategory: "nofault",
        symptom: "CREATE_COMPLETE — 1/1 healthy; a 70% disk warning is informational",
        log: [
            { id: "L1", t: "22:02:10", text: "[INFO]  wave3/dep-2212 | legacy-cron ×1 — CREATE_COMPLETE" },
            { id: "L2", t: "22:02:44", text: "[WARN]  guest | disk usage 70% (threshold 80%) — informational, trend stable" },
            { id: "L3", t: "22:03:01", text: "[INFO]  health | 1/1 healthy — agent reporting normally" },
        ],
        detailFields: [],
        runbook: [],
    },
    // ── dep-2213 · RED HERRING (planned operator stop) ─────────────────────────
    {
        id: "dep-2213",
        service: "reporting-batch",
        spec: "stopped by operator",
        status: "planned",
        stageId: "s6",
        originStageId: "s6",
        truthCategory: "nofault",
        symptom: "Stopped under approved change CHG-8842 — expected state",
        log: [
            { id: "L1", t: "22:11:37", text: "[INFO]  ops | reporting-batch stopped by operator j.rivera (planned maintenance window)" },
            { id: "L2", t: "22:11:38", text: "[INFO]  change | CHG-8842 approved 2026-10-28 — scheduled stop 22:00–23:30 UTC" },
            { id: "L3", t: "22:11:39", text: "[INFO]  health | expected state — no deployment action required" },
        ],
        detailFields: [],
        runbook: [],
    },
];
const CASE_MAP = Object.fromEntries(CASES.map((c) => [c.id, c]));
// Sweep board order (hard mode) — faults first, herrings last.
const SWEEP_ORDER = [
    "dep-2201", "dep-2202", "dep-2203", "dep-2204", "dep-2205", "dep-2206",
    "dep-2207", "dep-2208", "dep-2209", "dep-2210", "dep-2211", "dep-2212", "dep-2213",
];


const QUIZ_MEDIUM = [
    {
        id: "qm1",
        scenario: "A deployment requesting 24 vCPU fails with QuotaExceeded. The family limit is 32 vCPU and 28 are already in use. What is the correct first response?",
        options: [
            { value: "a", label: "Check the limit math, free headroom, or request an increase" },
            { value: "b", label: "Migrate the workload to a different provider region for good" },
            { value: "c", label: "Restart the healthy instances that currently hold the 28 vCPU" },
            { value: "d", label: "Open every security-group egress rule on the fleet and retry" },
        ],
        answer: "a",
        explanation: "Headroom was 32 − 28 = 4 vCPU against a 24 vCPU request — an account-level limit, so the fix is capacity math: reduce the request, free idle capacity, or request an increase. Regions and security groups do not participate in quota failures, and restarting healthy production instances creates an outage to solve a formality.",
        topic: "Resource limits (quota math)",
        focus: { caseId: "dep-2201", tab: "log" },
    },
    {
        id: "qm2",
        scenario: "Which statement best describes the operational risk of a golden image?",
        options: [
            { value: "a", label: "Images always cost more than the instances launched from them" },
            { value: "b", label: "Any defect inside the image is inherited by every instance" },
            { value: "c", label: "Images can never be versioned, pinned or rolled back" },
            { value: "d", label: "Images block user-data scripts from running at all after boot" },
        ],
        answer: "b",
        explanation: "The golden image is an artifact every instance inherits — dep-2204 showed a skipped agent build step producing an entire invisible fleet. That is why 'outdated definitions' is its own 6.1 bullet and why image pipelines verify their output (agent heartbeat) before an image is blessed.",
        topic: "Outdated definitions (golden image)",
        focus: { caseId: "dep-2204", tab: "userdata" },
    },
    {
        id: "qm3",
        scenario: "A deployment reports SUCCESS. Moments later the app returns 503s while the schema-migration job is still running. Most likely cause?",
        options: [
            { value: "a", label: "A DNS propagation delay on the brand-new service record entries" },
            { value: "b", label: "Certificate expiration now hitting the freshly deployed app tier nodes" },
            { value: "c", label: "A race — no wait condition on the migration job" },
            { value: "d", label: "A quota limit on the new database connection pool size" },
        ],
        answer: "c",
        explanation: "SUCCESS describes resource creation, not service health. When a component starts before its dependency signals completion, that is a race condition — the fix is an explicit wait condition plus retry/backoff, and the systemic control is gating traffic on passing health checks (dep-2207 end to end).",
        topic: "Orchestration races & health gating",
        focus: { caseId: "dep-2207", tab: "events" },
    },
    {
        id: "qm4",
        scenario: "A fresh VM fails TLS with 'certificate is not yet valid'. Its clock is 12 minutes ahead; the IdP certificate chain is valid. Root cause?",
        options: [
            { value: "a", label: "The certificate has expired and must be replaced right now" },
            { value: "b", label: "The wrong certificate CA chain was deployed onto the VMs" },
            { value: "c", label: "Clock skew — NTP unreachable; fix time, not the certificate" },
            { value: "d", label: "TLS certificate verification must be disabled for internal traffic" },
        ],
        answer: "c",
        explanation: "Certificates are valid only inside a time window. A guest clock outside that window produces 'not yet valid' against a perfectly good certificate. The dependency is time sync: allow NTP (UDP/123) to the internal time source, resync, re-test. Disabling TLS verification would trade a clock bug for a man-in-the-middle exposure.",
        topic: "Time sync vs certificate expiry",
        focus: { caseId: "dep-2208", tab: "config" },
    },
    {
        id: "qm5",
        scenario: "Why validate IaC templates offline (lint/plan) before apply?",
        options: [
            { value: "a", label: "It encrypts the IaC templates while they sit at rest" },
            { value: "b", label: "It catches schema and allowed-value errors before anything exists" },
            { value: "c", label: "It increases the deployment speed quota for the project" },
            { value: "d", label: "It removes the need for human code review entirely" },
        ],
        answer: "b",
        explanation: "dep-2203's parameter typo died in pre-flight: nothing created, nothing to roll back. Offline validation converts a production incident into a red build in CI. It complements review — it does not replace it.",
        topic: "Pre-flight IaC validation",
        focus: { caseId: "dep-2203", tab: "template" },
    },
    {
        id: "qm6",
        scenario: "New Windows VMs log activation error 0x8007232A ('DNS name does not exist'). First check?",
        options: [
            { value: "a", label: "Whether the KMS SRV record resolves from the VMs' view" },
            { value: "b", label: "Whether the VMs were allocated enough vCPU for activation" },
            { value: "c", label: "Whether unique license keys must be typed on every VM" },
            { value: "d", label: "Whether the operating system needs a full reinstall instead" },
        ],
        answer: "a",
        explanation: "0x8007232A is the activation client saying it cannot resolve its KMS host. KMS clients discover hosts via the _vlmcs._tcp SRV record, so the first check is DNS resolution from the VM's network view — a licensing failure that is really a dependency misconfiguration (dep-2206).",
        topic: "KMS activation dependency",
        focus: { caseId: "dep-2206", tab: "config" },
    },
];
const QUIZ_HARD = [
    {
        id: "qh1",
        scenario: "dep-2201 evidence: family limit 48 vCPU, 32 in use, request +48. How many vCPU short is the request, and what is the account-level ceiling called?",
        options: [
            { value: "a", label: "16 vCPU short — the ceiling is a service limit (quota)" },
            { value: "b", label: "32 vCPU short — the ceiling is a service limit (quota)" },
            { value: "c", label: "48 vCPU short — the ceiling is regional availability" },
            { value: "d", label: "80 vCPU short — the ceiling is an IAM policy" },
        ],
        answer: "b",
        explanation: "Projected 80 against a hard limit of 48 → shortfall = 80 − 48 = 32 vCPU. The ceiling is an account service limit (quota), which is why dep-2201 and dep-2210 are different 6.1 bullets: 2210 had quota headroom (12/64) but no physical stock in the AZ.",
        topic: "Resource limits (quota math)",
        focus: { caseId: "dep-2201", tab: "log" },
    },
    {
        id: "qh2",
        scenario: "Boot log: 'kernel 2.6.32 (CentOS 6.9) — no virtio driver → initramfs panic', 'secure boot ON — unsigned kernel rejected', 'CentOS 6.9 vendor EOL since 2020-11'. Primary 6.1 classification?",
        options: [
            { value: "a", label: "Deprecation — the EOL date is the root cause" },
            { value: "b", label: "Outage — the provider dropped support overnight" },
            { value: "c", label: "Incompatibility — driver/platform mismatch, EOL as contributor" },
            { value: "d", label: "Outdated definitions — the image is stale" },
        ],
        answer: "c",
        explanation: "The proximate cause is the missing virtio driver against the target platform's storage stack — incompatibility. The EOL guest OS is real but is what dep-2209 teaches as a contributing deprecation finding: flag it for replatforming, but the boot loop is a driver/platform problem (plus a boot-policy conflict).",
        topic: "Incompatibility vs deprecation",
        focus: { caseId: "dep-2209", tab: "log" },
    },
    {
        id: "qh3",
        scenario: "Deployment SUCCESS, but agent telemetry is absent on 8/8 instances for 30 minutes. Best detection source + first action pair?",
        options: [
            { value: "a", label: "CPU metrics + terminate and redeploy everything" },
            { value: "b", label: "Agent heartbeat + inspect the image build pipeline" },
            { value: "c", label: "Billing alerts + open a provider incident" },
            { value: "d", label: "DNS query logs + recreate the DNS zone" },
        ],
        answer: "b",
        explanation: "An instance without a guest agent is invisible to instance-level monitoring — the heartbeat is the only signal that can be absent, which makes it the detector. The first action is artifact-side: the build log shows step 7 (install guest agents) skipped on the pinned 2025.11 image. Fixing instances while the image stays broken guarantees a repeat.",
        topic: "Detection (agent heartbeat)",
        focus: { caseId: "dep-2204", tab: "userdata" },
    },
    {
        id: "qh4",
        scenario: "Order the dep-2202 remediation correctly (DNS zone has no VPC association).",
        options: [
            { value: "a", label: "Associate zone → verify resolution → re-run the health checks" },
            { value: "b", label: "Re-run health checks → associate zone → verify the resolution" },
            { value: "c", label: "Verify resolution → associate zone → open 5432 to the world" },
            { value: "d", label: "Recreate the database → associate zone → re-run the checks" },
        ],
        answer: "a",
        explanation: "Fix the misconfiguration, then prove the fix at the layer it targets (resolution), then re-validate service health. Option C sneaks in the classic anti-fix — exposing the database to the internet converts a name-resolution bug into an attack surface (see the Debrief's T1190 note).",
        topic: "Remediation sequencing (DNS)",
        focus: { caseId: "dep-2202", tab: "events" },
    },
    {
        id: "qh5",
        scenario: "The provider status page shows active incident INC-4471 (metadata service degraded). Your deployment is failing with RequestError timeouts. What do you do?",
        options: [
            { value: "a", label: "Rotate every access key now — timeouts mean credential failure" },
            { value: "b", label: "Rebuild the whole VPC and retry the deployment inside it" },
            { value: "c", label: "Freeze changes, wait for recovery, retry — change nothing now" },
            { value: "d", label: "Lower the instance sizes to reduce the metadata call volume" },
        ],
        answer: "c",
        explanation: "An active provider incident is a 6.1 'outages' pattern: your configuration is innocent, and changing it mid-incident (keys, VPC, sizes) creates configuration drift you will have to unwind later. Verify scope on the status page, freeze, retry after recovery (dep-2211 / runbook RB-07).",
        topic: "Outages (provider incidents)",
        focus: { caseId: "dep-2211", tab: "log" },
    },
    {
        id: "qh6",
        scenario: "Wave 4 adds three Windows VMs. BYOL inventory confirms exactly 2 licenses; KMS is reachable. Licensing model?",
        options: [
            { value: "a", label: "BYOL for all three — inventory always stretches" },
            { value: "b", label: "License-included for all three, wasting two entitlements" },
            { value: "c", label: "BYOL for the two confirmed; license-included for the third" },
            { value: "d", label: "Deploy first, decide licensing after activation fails or not" },
        ],
        answer: "c",
        explanation: "BYOL is only safe when inventory is confirmed — deploying on hope is how compliance debt is discovered mid-launch. The hybrid model uses what is proven and pays for coverage where it is not (dep-2206's planning extension).",
        topic: "BYOL licensing planning",
        focus: { caseId: "dep-2206", tab: "config" },
    },
    {
        id: "qh7",
        scenario: "'InsufficientInstanceCapacity — ns-storage.4xlarge unavailable in ns-eu-1b' with quota at 12/64 vCPU. Classification and response?",
        options: [
            { value: "a", label: "Quota exceeded — request an increase and retry the same AZ" },
            { value: "b", label: "Regional availability — retry another AZ; reserve capacity later" },
            { value: "c", label: "Deprecation — the provider retired the instance family overnight" },
            { value: "d", label: "Misconfiguration — the subnet is too small for the fleet" },
        ],
        answer: "b",
        explanation: "Quota is explicitly fine (12/64), so an increase is a waste of an approval. This is a physical stock-out in one AZ: the responses are flexibility (alternate AZ, alternate family) and structural (capacity reservations). The quota-vs-availability distinction is one of the most-tested pairs in 6.1.",
        topic: "Regional availability vs quota",
        focus: { caseId: "dep-2210", tab: "log" },
    },
];


// Convenience namespace (readability + debugging; code below references the
// top-level consts directly, which are shared across classic scripts).
window.LAB = {
  STAGES, STAGE_MAP, STAGES_SHUFFLED, CATEGORIES, CATEGORY_MAP, MATCH_DRILL, OFFICIAL_BULLETS,
  MATCH_DRILL_ORDER, DATASOURCE_ORDER, DATASOURCE_DRILL, PREVENTION_OPTIONS,
  PREVENTION_CORRECT, BLUEPRINT_CONTROLS, GLOSSARY, BRIEFING, MODE_CARDS, QUIZ_UNLOCK,
  CASES, CASE_MAP, SWEEP_ORDER, QUIZ_MEDIUM, QUIZ_HARD,
};
