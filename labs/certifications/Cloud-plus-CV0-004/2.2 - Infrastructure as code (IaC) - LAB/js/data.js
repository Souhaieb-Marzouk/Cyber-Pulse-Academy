// ─── Blueprint Studio · content data (ALL SYNTHETIC / TRAINING DATA) ────────
// Lab: CompTIA Cloud+ CV0-004 · Lesson 2.2 — Infrastructure as Code (IaC)
// Fictional organization: Meridian Retail Group. No real PII, no real secrets.
// ── Drafting board: the predecessor's template ──────────────────────────────
const TEMPLATE_LINES = [
    { n: 1, code: '# ════════════════════════════════════════════════════════════' },
    { n: 2, code: '#  main.tf — Meridian Retail Group · "kestrel-staging" stack' },
    { n: 3, code: '#  TRAINING DATA — fictional company · synthetic values only' },
    { n: 4, code: '# ════════════════════════════════════════════════════════════' },
    { n: 5, code: '' },
    { n: 6, code: 'terraform {' },
    { n: 7, code: '  required_providers {' },
    { n: 8, code: '    aws = { source = "hashicorp/aws", version = "~> 5.0" }' },
    { n: 9, code: '  }' },
    { n: 10, code: '}' },
    { n: 11, code: '' },
    { n: 12, code: 'provider "aws" {', blockId: 'provider' },
    { n: 13, code: '  region = var.region' },
    { n: 14, code: '}' },
    { n: 15, code: '' },
    { n: 16, code: 'variable "region" {' },
    { n: 17, code: '  type    = string' },
    { n: 18, code: '  default = "us-east-1"' },
    { n: 19, code: '}' },
    { n: 20, code: '' },
    { n: 21, code: 'variable "environment" {', blockId: 'variable' },
    { n: 22, code: '  type    = string' },
    { n: 23, code: '  default = "staging"' },
    { n: 24, code: '}' },
    { n: 25, code: '' },
    { n: 26, code: '# ── compute ─────────────────────────────────────────────' },
    { n: 27, code: 'resource "aws_instance" "web" {', blockId: 'web' },
    { n: 28, code: '  ami           = "ami-0f4kl2meridian9"' },
    { n: 29, code: '  instance_type = "t3.micro"' },
    { n: 30, code: '  subnet_id     = "subnet-0aa91kestrel"' },
    { n: 31, code: '' },
    { n: 32, code: '  root_block_device {' },
    { n: 33, code: '    volume_size = 20' },
    { n: 34, code: '    encrypted   = false', note: 'flaw-unencrypted' },
    { n: 35, code: '  }' },
    { n: 36, code: '' },
    { n: 37, code: '  tags = { Name = "kestrel-web-01", Env = var.environment }' },
    { n: 38, code: '}' },
    { n: 39, code: '' },
    { n: 40, code: '# ── log storage ─────────────────────────────────────────' },
    { n: 41, code: 'resource "aws_s3_bucket" "audit_logs" {', blockId: 'bucket' },
    { n: 42, code: '  bucket = "meridian-kestrel-audit-logs"' },
    { n: 43, code: '  acl    = "public-read"', note: 'flaw-public' },
    { n: 44, code: '}' },
    { n: 45, code: '' },
    { n: 46, code: '# ── edge security ───────────────────────────────────────' },
    { n: 47, code: 'resource "aws_security_group" "web_sg" {', blockId: 'sg' },
    { n: 48, code: '  name = "kestrel-web-sg"' },
    { n: 49, code: '' },
    { n: 50, code: '  ingress {' },
    { n: 51, code: '    from_port   = 443' },
    { n: 52, code: '    to_port     = 443' },
    { n: 53, code: '    protocol    = "tcp"' },
    { n: 54, code: '    cidr_blocks = ["0.0.0.0/0"]  # HTTPS front door', note: 'accepted-443' },
    { n: 55, code: '  }' },
    { n: 56, code: '' },
    { n: 57, code: '  ingress {' },
    { n: 58, code: '    from_port   = 22' },
    { n: 59, code: '    to_port     = 22' },
    { n: 60, code: '    protocol    = "tcp"' },
    { n: 61, code: '    cidr_blocks = ["0.0.0.0/0"]  # SSH', note: 'flaw-ssh' },
    { n: 62, code: '  }' },
    { n: 63, code: '}' },
    { n: 64, code: '' },
    { n: 65, code: '# ── database ────────────────────────────────────────────' },
    { n: 66, code: 'resource "aws_db_instance" "orders_db" {', blockId: 'db' },
    { n: 67, code: '  identifier     = "kestrel-orders-db"' },
    { n: 68, code: '  engine         = "postgres"' },
    { n: 69, code: '  instance_class = "db.t3.small"' },
    { n: 70, code: '  allocated_storage = 50' },
    { n: 71, code: '  username       = "orders_admin"' },
    { n: 72, code: '  password       = "K3strel-Stg-2024!"', note: 'flaw-secret' },
    { n: 73, code: '  skip_final_snapshot = true', note: 'flaw-snapshot' },
    { n: 74, code: '}' },
    { n: 75, code: '' },
    { n: 76, code: 'output "web_public_ip" {', blockId: 'output' },
    { n: 77, code: '  value = aws_instance.web.public_ip' },
    { n: 78, code: '}' },
];
const ANATOMY_TARGETS = [
    { line: 12, label: 'provider "aws" {', kind: 'PROVIDER — pins the cloud plugin & region' },
    { line: 21, label: 'variable "environment" {', kind: 'VARIABLE — parameterized input (reuse)' },
    { line: 41, label: 'resource "aws_s3_bucket" "audit_logs" {', kind: 'RESOURCE — a thing to create & track' },
    { line: 76, label: 'output "web_public_ip" {', kind: 'OUTPUT — value exported after apply' },
];
const SECRET_LINE = 72;
// ── Topology (SVG drafting canvas) ──────────────────────────────────────────
const TOPOLOGY = [
    { id: 'provider', label: 'PROVIDER', sub: 'aws · us-east-1', x: 20, y: 14, w: 118, h: 40, lines: [12, 14] },
    { id: 'variable', label: 'VARIABLES', sub: 'region · environment', x: 20, y: 64, w: 118, h: 40, lines: [16, 24] },
    { id: 'web', label: 'aws_instance', sub: 'web · t3.micro', x: 190, y: 30, w: 132, h: 48, lines: [27, 38] },
    { id: 'sg', label: 'aws_security_group', sub: 'web_sg · :443 :22', x: 190, y: 92, w: 132, h: 48, lines: [47, 63] },
    { id: 'bucket', label: 'aws_s3_bucket', sub: 'audit_logs', x: 356, y: 30, w: 132, h: 48, lines: [41, 44] },
    { id: 'db', label: 'aws_db_instance', sub: 'orders_db', x: 356, y: 92, w: 132, h: 48, lines: [66, 74] },
    { id: 'output', label: 'OUTPUT', sub: 'web_public_ip', x: 20, y: 114, w: 118, h: 40, lines: [76, 78] },
];
// ── Plan studio ─────────────────────────────────────────────────────────────
const PLAN_ROWS = [
    {
        symbol: '-/+',
        resource: 'aws_instance.web',
        action: 'must be replaced',
        detail: [
            '~ ami:  "ami-0f4kl2meridian9" → "ami-0b77meridian42"   # forces replacement',
            '~ instance_type:  "t3.large" → "t3.micro"              # drift correction',
            '   tags: {"Name" = "kestrel-web-01", "Env" = "staging"}',
        ],
        accent: 'replace',
    },
    {
        symbol: '~',
        resource: 'aws_security_group.web_sg',
        action: 'updated in-place',
        detail: [
            '- ingress { from_port = 3389, cidr_blocks = ["0.0.0.0/0"] }   # removed — not in code',
        ],
        accent: 'change',
    },
    {
        symbol: '~',
        resource: 'aws_s3_bucket.audit_logs',
        action: 'updated in-place',
        detail: [
            '~ versioning: enabled false → true   # adopt manual change (R8 draft)',
        ],
        accent: 'change',
    },
    {
        symbol: '+',
        resource: 'aws_db_instance.orders_db',
        action: 'will be created',
        detail: [
            '+ identifier = "kestrel-orders-db"   # refresh found it deleted outside the pipeline',
            '+ instance_class = "db.t3.small"',
            '+ password = (sensitive value)',
        ],
        accent: 'add',
    },
];
const PLAN_SUMMARY = 'Plan: 2 to add, 2 to change, 1 to destroy.';
// ── Drift board: desired vs as-built ────────────────────────────────────────
const DRIFT_ROWS = [
    {
        id: 1, resource: 'aws_instance.web', attribute: 'instance_type',
        desired: 't3.micro', asBuilt: 't3.large',
        changeLog: 'No change record. Console session 03:14, unattributed.',
        truth: 'revert',
    },
    {
        id: 2, resource: 'aws_security_group.web_sg', attribute: 'ingress :3389 (RDP)',
        desired: 'not present in code', asBuilt: 'open to 0.0.0.0/0',
        changeLog: 'Added during the "quick fix" at 03:14, never documented.',
        truth: 'revert',
    },
    {
        id: 3, resource: 'aws_s3_bucket.audit_logs', attribute: 'versioning',
        desired: 'not set in code', asBuilt: 'Enabled',
        changeLog: 'Enabled by J. Okafor via console — a protection the code lacks.',
        truth: 'codify',
    },
    {
        id: 4, resource: 'aws_db_instance.orders_db', attribute: 'existence',
        desired: 'tracked in state (R7)', asBuilt: 'missing — deleted in console',
        changeLog: 'Deleted by R. Silva ("thought it was unused"). Engine reports it gone.',
        truth: 'ghost',
    },
    {
        id: 5, resource: 'aws_sns_topic.alerts', attribute: 'existence',
        desired: 'not in code, not in state', asBuilt: 'exists in the account',
        changeLog: 'Created by hand during an on-call incident, never added to the drawing set.',
        truth: 'untracked',
    },
];
const DRIFT_CLASSES = [
    { id: 'revert', label: 'VIOLATION — revert to code' },
    { id: 'codify', label: 'IMPROVEMENT — adopt into code' },
    { id: 'ghost', label: 'GHOST — in state, gone from reality' },
    { id: 'untracked', label: 'UNTRACKED — exists, never drawn' },
];
// ── Scan bench findings ─────────────────────────────────────────────────────
const FINDINGS = [
    {
        id: 'F1', severity: 'CRITICAL', rule: 'SECRET_HARDCODED',
        title: 'Hardcoded database credential',
        detail: 'main.tf:72 — password literal "K3strel-Stg-2024!" committed in version control. MITRE T1552.001.',
        truth: 'tp',
    },
    {
        id: 'F2', severity: 'HIGH', rule: 'S3_PUBLIC_ACL',
        title: 'Audit-log bucket world-readable',
        detail: 'aws_s3_bucket.audit_logs acl = "public-read" — audit logs exposed to the internet. MITRE T1530.',
        truth: 'tp',
    },
    {
        id: 'F3', severity: 'HIGH', rule: 'MGMT_PORT_WORLD',
        title: 'SSH open to the entire internet',
        detail: 'aws_security_group.web_sg ingress :22 from 0.0.0.0/0 — management port, world-open.',
        truth: 'tp',
    },
    {
        id: 'F4', severity: 'MEDIUM', rule: 'EBS_UNENCRYPTED',
        title: 'Root volume not encrypted',
        detail: 'aws_instance.web root_block_device encrypted = false — data at rest unprotected.',
        truth: 'tp',
    },
    {
        id: 'F5', severity: 'HIGH', rule: 'MGMT_PORT_WORLD',
        title: 'Ingress :443 open to 0.0.0.0/0',
        detail: 'aws_security_group.web_sg ingress :443 world-open. Policy note: :443 is the accepted public front door for this tier; the rule intends management ports only.',
        truth: 'fp',
        fpWhy: 'True by the regex, false by policy — the rule over-matches. Tuning targets management ports (22, 3389), not the public front door.',
    },
    {
        id: 'F6', severity: 'MEDIUM', rule: 'AMI_NOT_GOLDEN',
        title: 'AMI not in trusted golden list',
        detail: 'ami-0f4kl2meridian9 is not on the production golden-AMI allowlist.',
        truth: 'fp',
        fpWhy: 'The golden-AMI allowlist governs production; this stack is staging. Scope mismatch — the rule needs an environment condition.',
        hardOnly: true,
    },
];
// ── Pipeline console ────────────────────────────────────────────────────────
const PIPELINE_RUNS = [
    {
        id: 'run412',
        title: 'PIPELINE RUN #412 — kestrel-staging',
        meta: 'branch feature/rev8 · commit 9f2ec41 · "R8: new AMI + adopt bucket versioning" · J. Okafor',
        stages: [
            { id: 'checkout', name: '01 checkout', status: 'ok', lines: ['Cloning repository meridian/kestrel-infra', 'HEAD is at 9f2ec41 (feature/rev8)'] },
            { id: 'lint', name: '02 lint (fmt)', status: 'ok', lines: ['terraform fmt -check … OK'] },
            { id: 'validate', name: '03 validate', status: 'ok', lines: ['terraform validate … success', '5 resources, 2 variables, 1 output'] },
            {
                id: 'secret-scan', name: '04 secret-scan', status: 'fail', lines: [
                    'Scanning 1 file(s) against policy SECRET_HARDCODED…',
                    'CRITICAL main.tf:72 — hardcoded credential literal (rule: hardcoded-password)',
                    'Gate: BLOCK — pipeline halted. Fix: reference a secrets manager & rotate the exposed value.',
                ],
            },
            { id: 'plan', name: '05 plan', status: 'n/a', lines: ['— not reached (halted at secret-scan gate)'] },
            { id: 'approval', name: '06 approval gate', status: 'n/a', lines: ['— not reached'] },
            { id: 'apply', name: '07 apply', status: 'n/a', lines: ['— not reached'] },
        ],
    },
    {
        id: 'run415',
        title: 'PIPELINE RUN #415 — kestrel-staging (hard mode)',
        meta: 'branch main · commit c81aa92 · "hotfix: bump instance size [skip-scan]" · R. Silva',
        stages: [
            { id: 'checkout', name: '01 checkout', status: 'ok', lines: ['Cloning meridian/kestrel-infra', 'HEAD is at c81aa92 (main) — commit tag detected: [skip-scan]'] },
            { id: 'lint', name: '02 lint (fmt)', status: 'ok', lines: ['terraform fmt -check … OK'] },
            { id: 'validate', name: '03 validate', status: 'warn', lines: ['terraform validate … success', 'WARNING: provider version ~> 5.0 announced deprecation window (advisory only)'] },
            {
                id: 'secret-scan', name: '04 secret-scan', status: 'skip', lines: [
                    'SKIPPED — commit tag [skip-scan] matched bypass rule',
                    'No scan performed on c81aa92.',
                ],
            },
            {
                id: 'unit', name: '05 unit-test', status: 'retry', lines: [
                    'checkout-service quota test — FAILED (attempt 1)',
                    'Retrying flaky test per policy… PASSED (attempt 2)',
                ],
            },
            { id: 'plan', name: '06 plan', status: 'ok', lines: ['terraform plan … 1 replacement flagged for review'] },
            {
                id: 'approval', name: '07 approval gate', status: 'ok', lines: [
                    'Approved by R. Silva — NOTE: approver is commit author (self-approval)',
                ],
            },
            {
                id: 'apply', name: '08 apply', status: 'warn', lines: [
                    'EXECUTION PROVENANCE: applied from workstation "ENG-LAP-17" — outside the pipeline',
                    'Credential used: PIPELINE_STATIC_KEY (AKIA••••78FQ) — long-lived static access key',
                    'DEBUG: key fingerprint AKIA••••78FQ validated against account 1111-2222 (partial echo in log)',
                    'Apply complete: 1 added, 1 changed.',
                ],
            },
            { id: 'drift', name: '09 drift-scan', status: 'ok', lines: ['Next scheduled drift check: nightly 02:00'] },
        ],
    },
];
// ── Fundamentals: benefits matching (M1) ────────────────────────────────────
const BENEFIT_TERMS = ['CONSISTENCY', 'SPEED', 'AUDITABILITY', 'DISASTER RECOVERY'];
const BENEFIT_DEFS = {
    CONSISTENCY: 'Every environment built from the same code gets the same result — staging and prod stop diverging by accident.',
    SPEED: 'A full stack is provisioned by pipeline in minutes instead of hours of console clicking.',
    AUDITABILITY: 'Git history shows who changed what, when, and who reviewed it — the code is the record.',
    'DISASTER RECOVERY': 'After an outage, the environment is rebuilt from code plus state — not from memory.',
};
// ── Fundamentals: declarative vs imperative snippets (M2) ───────────────────
const DI_SNIPPETS = [
    {
        id: 's1', answer: 'declarative',
        code: 'resource "aws_s3_bucket" "audit_logs" {\n  bucket = "meridian-kestrel-audit-logs"\n}',
        hint: 'Describes the bucket that should exist — not the commands to create it.',
    },
    {
        id: 's2', answer: 'imperative',
        code: 'sudo apt-get install -y nginx\nsudo systemctl start nginx\nsudo ufw allow 443',
        hint: 'A sequence of commands executed in order, top to bottom.',
    },
    {
        id: 's3', answer: 'declarative',
        code: 'Resources:\n  AuditLogsBucket:\n    Type: AWS::S3::Bucket\n    Properties: {BucketName: meridian-kestrel-audit-logs}',
        hint: 'A CloudFormation template — the engine computes the steps.',
    },
    {
        id: 's4', answer: 'imperative',
        code: 'client = boto3.client("s3")\nclient.create_bucket(Bucket="meridian-kestrel-audit-logs")',
        hint: 'Direct API calls — one instruction per action.',
    },
];
// ── Fundamentals: tool taxonomy (M3) ────────────────────────────────────────
const TOOL_CATEGORIES = [
    { id: 'terraform', label: 'Multi-cloud declarative provisioning (HCL)' },
    { id: 'cloudformation', label: 'AWS-native template service (stacks, change sets)' },
    { id: 'ansible', label: 'Agentless configuration management (YAML, push)' },
    { id: 'bicep', label: 'Azure-native templates, compiles to ARM' },
    { id: 'pulumi', label: 'IaC in general-purpose languages (TS/Py/Go)' },
];
const TOOLS = ['Terraform', 'CloudFormation', 'Ansible', 'Bicep', 'Pulumi'];
const TOOL_TRUTH = {
    Terraform: 'terraform', CloudFormation: 'cloudformation', Ansible: 'ansible',
    Bicep: 'bicep', Pulumi: 'pulumi',
};
// ── Knowledge core: real-world (simplified) incidents ───────────────────────
const INCIDENTS = [
    {
        title: 'Uber · 2016 (simplified)',
        body: 'Attackers found credentials for Uber\u2019s cloud stored in scripts pushed to a code repository — exactly the "credential in a file" failure this lab drills. Millions of records were exposed and the company paid to keep it quiet, which turned a security failure into a governance one.',
    },
    {
        title: 'Toyota · 2023 (simplified)',
        body: 'A cloud access key was hard-coded in a public code repository and reportedly remained exposed for years, letting anyone who read the code reach customer data. The flaw lived in code that had long since been "done" — code is an artifact that persists.',
    },
    {
        title: 'CircleCI · 2023 (simplified)',
        body: 'A build-system compromise exposed customer secrets held in CI variables, forcing mass credential rotation. Pipelines concentrate production credentials — the reason this lab hardens the pipeline, not just the template.',
    },
];
// ── Hard-only evidence pairing (H9, Sheet 06) — display order is shuffled per session
const H9_EVIDENCE = [
    { id: 'ev1', text: 'A cloud access key hard-coded in a committed template file' },
    { id: 'ev2', text: 'Someone signed into the cloud account with that key and looked around' },
    { id: 'ev3', text: 'Compute instances created and modified through the cloud API, outside the pipeline' },
];
const H9_CARDS = [
    { id: 'T1552.001', name: 'Credentials In Files' },
    { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts' },
    { id: 'T1578', name: 'Modify Cloud Compute Infrastructure' },
    { id: 'T1580', name: 'Cloud Infrastructure Discovery' },
    { id: 'T1530', name: 'Data from Cloud Storage' },
];
// ── Hard-only ordering drills (display order shuffled per session)
const H4_STEPS = [
    { id: 'revoke', t: 'Revoke / rotate the exposed static key immediately' },
    { id: 'oidc', t: 'Switch the pipeline to OIDC short-lived federated credentials' },
    { id: 'branch', t: 'Close the bypass: branch protection, no [skip-scan], no self-approval' },
    { id: 'rescan', t: 'Re-run the full scan + keep apply pipeline-only, then verify' },
    { id: 'allow', t: 'Allowlist the key fingerprint in the logging filter' },
    { id: 'provider', t: 'Bump the provider version to clear the deprecation warning' },
];
const H6_STEPS = [
    { id: 'revert', t: 'git revert the R9 commit on main — fix the source of truth' },
    { id: 'reapply', t: 'Pipeline re-applies the known-good revision (R8) to converge reality' },
    { id: 'verify', t: 'Verify service health, then run a drift check to prove convergence' },
    { id: 'console', t: 'Recreate the missing resources by hand in the console (fast!)' },
    { id: 'statewipe', t: 'Delete terraform.tfstate so the next plan starts clean' },
    { id: 'snapflag', t: 'Enable skip_final_snapshot on the DB first' },
];
// ── LEGEND glossary (15 terms) ──────────────────────────────────────────────
const GLOSSARY = [
    { term: 'IaC', def: 'Managing infrastructure through versioned code files instead of manual console work.' },
    { term: 'DECLARATIVE', def: 'You describe the desired end state; the engine works out the steps (Terraform, CloudFormation, Bicep).' },
    { term: 'IMPERATIVE', def: 'You write the exact commands, in order, to reach the state (shell scripts, direct API calls).' },
    { term: 'IDEMPOTENCY', def: 'Applying the same code twice yields the same result; the second run changes nothing.' },
    { term: 'STATE FILE', def: "The engine's record of what it manages in the real world — can contain sensitive values in plaintext." },
    { term: 'REMOTE STATE', def: 'Storing state in a shared backend (object storage + lock table/lease) instead of a laptop.' },
    { term: 'STATE LOCKING', def: 'Blocking concurrent applies so two engineers cannot corrupt the state at once.' },
    { term: 'DRIFT', def: 'Real infrastructure diverging from the code because someone changed things outside the pipeline.' },
    { term: 'SNOWFLAKE SERVER', def: 'A hand-built, unreproducible machine that everyone is afraid to touch.' },
    { term: 'MODULE', def: 'A reusable, parameterized package of IaC code — the standardized detail sheet of a drawing set.' },
    { term: 'POLICY AS CODE', def: 'Codified guardrails that automatically reject non-compliant templates before resources exist.' },
    { term: 'CONFIGURATION MANAGEMENT', def: 'Keeping already-running servers at the desired state (Ansible, Chef, Puppet).' },
    { term: 'ORCHESTRATION', def: 'Coordinating many automated steps and systems into one workflow.' },
    { term: 'MUTABLE / IMMUTABLE', def: 'Editing servers in place vs replacing them wholesale from a freshly built image.' },
    { term: 'GITOPS', def: 'Git as the single source of truth; the pipeline is the only path to production.' },
];
// ── Quiz banks ──────────────────────────────────────────────────────────────
// B3/B7 authoring contract: correct positions rotate across all four slots
// (Medium 2,0,3,1,0,2 · Hard 3,1,0,2,3,1,0); the correct answer is never the
// longest option; every item explains the tempting distractors in `why`;
// `focus` feeds the completion report's focus areas (R8).
const QUIZ_MEDIUM = [
    {
        q: 'Which statement best defines Infrastructure as Code?',
        options: [
            'Writing polished documentation about your cloud architecture',
            'Clicking in the console faster by memorizing shortcuts',
            'Defining infrastructure in code files an engine applies',
            'Outsourcing server builds to the provider support team',
        ],
        correct: 2,
        why: 'IaC = infrastructure described in code files, stored in version control, and applied by an automation engine. Documentation (A) describes work; faster clicking (B) is still click-ops — the thing IaC replaces.',
        focus: 'Re-read the IaC definition at the top of Sheet 02 — code files + automation engine, not documentation or faster console work.',
    },
    {
        q: 'A template says: "there should be a bucket named meridian-kestrel-audit-logs, private, versioned." The engine decides the API calls. This style is…',
        options: ['Declarative', 'Prescriptive', 'Recursive', 'Imperative'],
        correct: 0,
        why: 'Declarative = you declare the desired end state; the engine works out HOW (Terraform, CloudFormation, Bicep). Imperative (D) would list the API calls in order. Memory hook: Declarative = Destination.',
        focus: 'Sheet 02 "Two ways to say it" — run the end-state-vs-steps test on the four snippets again.',
    },
    {
        q: 'You run "apply" twice with no code change. What does a well-behaved IaC tool do the second time?',
        options: [
            'Every resource is duplicated a second time',
            'It halts with a "resources already exist" error',
            'It asks for confirmation, then rolls everything back',
            'Nothing — it converges to the same result again',
        ],
        correct: 3,
        why: 'Idempotency: same input, same result. The second run compares desired state to real state and concludes "nothing to do" — which is why re-runs and pipelines are safe.',
        focus: 'Re-read the idempotency paragraph under the Sheet 02 snippets — apply-twice-changes-nothing is a guaranteed exam angle.',
    },
    {
        q: 'Why must a Terraform-style state file be protected even though it is "just a bookkeeping file"?',
        options: [
            'It stores the team roadmap and sprint notes',
            'It maps real resources and often holds secrets',
            'It is required by object-storage licensing rules',
            'It caches provider plugins to speed up the CLI',
        ],
        correct: 1,
        why: 'State maps code to real resources and can hold secrets (passwords, keys) in plaintext. Leaked state = leaked credentials plus a map of everything the engine manages. Store it remotely, lock it, encrypt it.',
        focus: 'Drawing Register drawer — the "state can hold plaintext secrets" warning and the three hardening toggles are exactly this objective.',
    },
    {
        q: 'Nightly checks find the web instance is t3.large, but the code says t3.micro. Nobody can find a change record. This is…',
        options: ['Configuration drift', 'A rolling deployment', 'An idempotency bug', 'A canary release'],
        correct: 0,
        why: 'Drift = reality diverging from the code, usually via console changes. The IaC answer is to detect it continuously, review it, then reconcile: revert to code, or codify the change deliberately.',
        focus: 'Drift Board — walk the five rows again and classify each as revert / codify / ghost / untracked before checking.',
    },
    {
        q: 'The strongest reason a hardcoded password must never appear in a template is:',
        options: [
            'It makes the template harder to format and read',
            'Linters reject any file that assigns a literal',
            'Git history keeps it alive even after deletion',
            'Cloud providers bill extra for stored literals',
        ],
        correct: 2,
        why: 'Git history preserves secrets even after you delete the line — repo copies, forks and clones spread it further. Fix = reference a secrets manager + rotate + purge history. (MITRE T1552.001 is exactly this.)',
        focus: 'Scan Bench finding F1 — redo the M10 remediation trio (vault + rotate + purge) and say why deleting the line alone fails.',
    },
];
const QUIZ_HARD = [
    {
        q: 'A plan shows: aws_db_instance.orders_db → "-/+ destroy and then create", and the template sets skip_final_snapshot = true. What MUST happen before anyone types "yes"?',
        options: [
            'Nothing — a destroy/create cycle is routine',
            'Reboot the instance so the flag clears itself',
            'Delete the state entry to silence the plan',
            'A final snapshot or migration path first',
        ],
        correct: 3,
        why: 'Replacement + skip_final_snapshot = permanent data loss on apply — the instance is destroyed with no snapshot. The safe pattern: disable the flag, take the final snapshot or plan the migration, schedule a window, then apply.',
        focus: 'Plan Studio H3 panel — redo the replacement triage: cause → immediate risk → the snapshot-first safe path.',
    },
    {
        q: 'A 12-engineer team keeps corrupting a state file that lives on a shared drive. The IaC-native fix is:',
        options: [
            'Email the state file to whoever applies next',
            'Move state to a remote backend with locking',
            'Keep a private local copy on every laptop',
            'Stop tracking state for this stack entirely',
        ],
        correct: 1,
        why: 'Remote state + locking is the designed answer: one authoritative copy, and concurrent applies are blocked while one engineer holds the lock. Local copies (C) multiply the corruption problem.',
        focus: 'Drawing Register — flip remote backend + locking on again and read why each toggle exists.',
    },
    {
        q: 'Drift scan flags: bucket versioning was enabled by hand — and it is a protection your code SHOULD have. Correct reconciliation?',
        options: [
            'Codify it — adopt versioning through review',
            'Revert the bucket in the console to match code',
            'Ignore bucket drift alerts from now on',
            'Delete the bucket and rebuild it from code',
        ],
        correct: 0,
        why: 'Not all drift is bad — but leaving it uncodified recreates click-ops with extra steps. Review, adopt into code through a PR, apply from the pipeline. Reverting a good control (B) would be self-sabotage.',
        focus: 'Drift Board row 3 — the improvement row. Drill the rule: violations revert, improvements codify.',
    },
    {
        q: 'An auditor asks: "Prove staging matched the code for the last quarter." Your strongest evidence set is:',
        options: [
            'A screenshot of the console dashboard page',
            'The written assurance of the team lead',
            'Git history + pipeline runs + drift scans',
            'The state file last-modified timestamp',
        ],
        correct: 2,
        why: 'Auditability is a headline IaC benefit precisely because it produces this trail: what changed (git), what was applied by which run (pipeline records), whether reality matched (drift reports). A screenshot or an assurance proves nothing.',
        focus: 'Sheet 01 "Why the exam cares" + the auditability benefit on Sheet 02 — name the three-part evidence trail from memory.',
    },
    {
        q: 'An attacker finds your repo and reads acl = "public-read" on an audit-logs bucket. In ATT&CK terms, the direct next step this enables is closest to:',
        options: [
            'T1557 — Adversary-in-the-Middle',
            'T1486 — Data Encrypted for Impact',
            'T1071 — Application Layer Protocol',
            'T1530 — Data from Cloud Storage',
        ],
        correct: 3,
        why: 'A public bucket removes the "breach" step entirely — the data is already reachable (T1530, Collection). The others need a foothold or an attack path that a public ACL does not provide.',
        focus: 'Sheet 06 red-team list — link each MITRE ID (T1530, T1552.001, T1078.004, T1578) to the flaw that enables it.',
    },
    {
        q: 'Why do hardened pipelines prefer OIDC/short-lived federated credentials over static access keys?',
        options: [
            'OIDC tokens are cheaper to generate',
            'Static keys never expire; tokens do',
            'OIDC skips the approval gate entirely',
            'Short-lived tokens make the CLI faster',
        ],
        correct: 1,
        why: 'Expiration is the whole point: a stolen token is worthless minutes later, while a static key (like run #415\u2019s PIPELINE_STATIC_KEY) sits in variables until a debug line echoes it.',
        focus: 'Pipeline Console run #415 — re-read the apply stage provenance lines, then redo the H4 remediation order.',
    },
    {
        q: 'Your team adopts: "no server is ever patched in place — instances are replaced from a freshly built image." This model is:',
        options: ['Immutable infrastructure', 'Mutable infrastructure', 'Hand-built snowflake servers', 'Vertical scaling'],
        correct: 0,
        why: 'Immutable = replace, don\u2019t edit. It kills snowflakes and drift at the root because every instance is born identical from code, and "fixing" means a new image — through the pipeline.',
        focus: 'Sheet 02 idempotency / mutable-vs-immutable paragraph — define immutable and say why it prevents snowflakes.',
    },
];
