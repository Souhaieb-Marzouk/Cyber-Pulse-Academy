// ─────────────────────────────────────────────────────────────────────────────
// THE SWITCH YARD — js/data.js
// All lab content: seed repo, file corpus, objectives, quiz banks, glossary,
// narrative texts. Ported 1:1 from the framework lab's data.ts — same content,
// same wording, same correct answers, same hint tiers, same feedback.
// Static port (no build step): classic script, attaches to window.LAB.
// ─────────────────────────────────────────────────────────────────────────────
(function (LAB) {
  'use strict';

  LAB.REPO_NAME = 'nf-cloud-platform';
  LAB.ORG = 'NimbusFreight Logistics';

  // ── file contents ────────────────────────────────────────────────────────────
  var README = [
    '# TrackLine — NimbusFreight freight-tracking platform',
    '',
    'Cloud platform IaC + manifests for the TrackLine container platform.',
    'Deployed in the EU region. Owned by the Platform Squad (Team Nordlys).',
    '',
    'TRAINING DATA — every file in this repository is synthetic.',
    ''
  ].join('\n');

  var GITIGNORE_SEED = [
    '# build artifacts',
    'node_modules/',
    '*.log',
    '.DS_Store',
    ''
  ].join('\n');

  var ENV_EXAMPLE = [
    '# Template only — copy and fill in REAL values OUTSIDE the repo, then load via secret manager.',
    '# NEVER commit real credentials. This file must always hold placeholders.',
    'NF_CLOUD_API_KEY_PAIR = "<AKIA-REPLACE-ME-0000>"',
    'NF_CLOUD_API_SECRET   = "<your-secret-here>"',
    ''
  ].join('\n');

  var MAIN_TF_BASE = [
    'provider "nfcloud" {',
    '  region = "eu-central-1"',
    '}',
    '',
    'resource "nfcloud_instance" "trackline_api" {',
    '  name          = "trackline-api"',
    '  instance_type = "t3.medium"',
    '  ami           = "nfcloud-alpine-2204"',
    '',
    '  security_groups = ["sg-trackline-api"]',
    '  egress {',
    '    from_port   = 443',
    '    to_port     = 443',
    '    cidr_blocks = ["0.0.0.0/0"]',
    '  }',
    '}',
    ''
  ].join('\n');

  var MAIN_TF_FIXED = MAIN_TF_BASE.replace('t3.medium', 't3.large');
  var MAIN_TF_SG = MAIN_TF_BASE.replace('["0.0.0.0/0"]', '["10.40.7.0/24"]');

  var VARIABLES_TF = [
    'variable "environment" {',
    '  type    = string',
    '  default = "prod"',
    '}',
    '',
    'variable "cluster_size" {',
    '  type    = number',
    '  default = 3',
    '}',
    ''
  ].join('\n');

  function valuesYaml(replicas, region, probes) {
    var lines = [
      'apiVersion: apps/v1',
      'kind: Deployment',
      'metadata:',
      '  name: trackline-api',
      '  labels:',
      '    app: trackline',
      'spec:',
      '  replicas: ' + replicas,
      '  selector:',
      '    matchLabels:',
      '      app: trackline',
      '  template:',
      '    metadata:',
      '      labels:',
      '        app: trackline',
      '    spec:',
      '      containers:',
      '        - name: api',
      '          image: registry.nimbusfreight.example/trackline-api:1.3.9',
      '          ports:',
      '            - containerPort: 8080',
      'deploymentRegion: ' + region
    ];
    if (probes) {
      lines.push(
        'livenessProbe:',
        '  httpGet:',
        '    path: /healthz',
        '    port: 8080',
        '  initialDelaySeconds: 10'
      );
    }
    return lines.join('\n') + '\n';
  }
  LAB.valuesYaml = valuesYaml;

  var DOCKERFILE_BASE = [
    'FROM node:20-alpine',
    'WORKDIR /app',
    'COPY api/ ./api/',
    'RUN npm ci --omit=dev',
    'CMD ["node", "api/server.js"]',
    ''
  ].join('\n');

  var DOCKERFILE_HC = DOCKERFILE_BASE + '\nHEALTHCHECK --interval=30s CMD wget -qO- http://localhost:8080/healthz || exit 1\n';

  var DOCKERFILE_22 = DOCKERFILE_HC.replace('node:20-alpine', 'node:22-alpine');

  // Synthetic key ID (AWS-documentation EXAMPLE-style, deliberately fake training data).
  var SYNTH_KEY_ID = 'A' + 'KIA' + '4NF9XQ2L8M5T3WZX'; // vendor prefix + 16 chars

  var SERVICE_ENV = [
    '# TrackLine production service credentials — DO NOT COMMIT',
    '# (added by M. Renner during CI setup, 2026-09-21 — never rotated)',
    'NF_CLOUD_API_KEY_PAIR = "' + SYNTH_KEY_ID + '"',
    'NF_CLOUD_API_SECRET   = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"',
    ''
  ].join('\n');

  var SANDBOX_KEY = [
    '# Integration-test sandbox credential — REVOKED on 2026-10-02, kept "for reference".',
    'SANDBOX_SECRET   = "TEST-REVOKED-0000-FFFF"',
    ''
  ].join('\n');

  var RUNBOOK_BASE = [
    '# TrackLine runbook',
    '',
    '## Deploy',
    '1. Merge to main via pull request.',
    '2. CI pipeline builds, scans and applies the Terraform plan.',
    '',
    '## Rollback',
    '- Revert the offending commit on main, then re-run the pipeline.',
    ''
  ].join('\n');

  var RUNBOOK_EDITED = RUNBOOK_BASE + '\n## Peak season notes\n- Watch replica counts during the Q4 freight surge.\n';

  var LUNCH_MD = [
    '# Team lunch rotation',
    '',
    'Mon: Nordlys kitchen · Wed: Harbor Deli · Fri: Piñon Grill',
    ''
  ].join('\n');

  var NOTES_TXT = [
    'personal notes — NOT for the repo',
    '- renew parking permit',
    '- ask N.O. about ticket NF-201',
    ''
  ].join('\n');

  var AUTOSCALE_TF = [
    '# Aggressive autoscaling policy (v2.0.0 experiment — REPORTED BROKEN)',
    'resource "nfcloud_autoscale" "api" {',
    '  target     = "trackline-api"',
    '  min        = 1',
    '  max        = 50',
    '  cpu_target = 11   # far too low — thrashes the cluster',
    '}',
    ''
  ].join('\n');

  // ── history builder ──────────────────────────────────────────────────────────
  function buildHistory(steps) {
    var commits = {};
    var worldAt = {};
    var world = {};
    steps.forEach(function (st) {
      Object.keys(st.changes).forEach(function (p) {
        var v = st.changes[p];
        if (v === null) delete world[p]; else world[p] = v;
      });
      worldAt[st.id] = Object.assign({}, world);
      commits[st.id] = {
        id: st.id, message: st.message, author: st.author, time: st.time,
        parents: commits[st.parent] ? [st.parent] : [],
        tree: Object.assign({}, worldAt[st.id])
      };
    });
    return { commits: commits, world: world };
  }

  var MAIN_STEPS = [
    { id: 'a1b2c3d', parent: '', message: 'chore: initial import of nf-cloud-platform', author: 'N. Okafor', time: '2026-09-20 09:14', changes: { 'README.md': README, '.gitignore': GITIGNORE_SEED, '.env.example': ENV_EXAMPLE } },
    { id: 'b2c3d4e', parent: 'a1b2c3d', message: 'feat: Terraform baseline for container cluster', author: 'N. Okafor', time: '2026-09-20 15:40', changes: { 'infra/main.tf': MAIN_TF_BASE, 'infra/variables.tf': VARIABLES_TF } },
    { id: 'c3d4e5f', parent: 'b2c3d4e', message: 'feat: TrackLine deployment manifest + API image', author: 'L. Varga', time: '2026-09-21 10:02', changes: { 'deploy/values.yaml': valuesYaml(3, 'eu-central-1', false), 'app/api/Dockerfile': DOCKERFILE_BASE } },
    { id: 'd4e5f6a', parent: 'c3d4e5f', message: 'chore: add CI service credentials for deploy job', author: 'M. Renner (contractor)', time: '2026-09-21 16:47', changes: { 'config/service.env': SERVICE_ENV } },
    { id: 'e5f6a7b', parent: 'd4e5f6a', message: 'docs: add deploy runbook', author: 'L. Varga', time: '2026-09-24 11:20', changes: { 'docs/runbook.md': RUNBOOK_BASE } },
    { id: 'f6a7b8c', parent: 'e5f6a7b', message: 'feat: enable liveness probe on api pods', author: 'L. Varga', time: '2026-10-01 09:31', changes: { 'deploy/values.yaml': valuesYaml(3, 'eu-central-1', true), 'app/api/Dockerfile': DOCKERFILE_HC } },
    { id: 'a7b8c9d', parent: 'f6a7b8c', message: 'chore: lunch rotation + sandbox key for integration tests', author: 'M. Renner (contractor)', time: '2026-10-02 17:55', changes: { 'docs/lunch.md': LUNCH_MD, 'tests/sandbox-key.txt': SANDBOX_KEY } },
    { id: 'b8c9d0e', parent: 'a7b8c9d', message: 'fix: bump replicas to 4 for weekend surge', author: 'L. Varga', time: '2026-10-03 08:12', changes: { 'deploy/values.yaml': valuesYaml(4, 'eu-central-1', true) } }
  ];

  var HARD_EXTRA_STEPS = [
    { id: 'e1f2a3b', parent: 'b8c9d0e', message: 'feat: aggressive autoscaling experiment (v2.0.0)', author: 'T. Achebe', time: '2026-10-05 14:03', changes: { 'infra/autoscale.tf': AUTOSCALE_TF } },
    { id: 'f2a3b4c', parent: 'e1f2a3b', message: 'chore: bump node base image to 22 (v2.0.0)', author: 'L. Varga', time: '2026-10-05 16:29', changes: { 'app/api/Dockerfile': DOCKERFILE_22 } },
    { id: 'e9f0a1b', parent: 'f2a3b4c', message: 'fix: restrict broker egress to broker CIDR', author: 'N. Okafor', time: '2026-10-06 09:45', changes: { 'infra/main.tf': MAIN_TF_SG } }
  ];

  LAB.seedRepo = function (mode) {
    var main = buildHistory(MAIN_STEPS);
    var commits = Object.assign({}, main.commits);
    var world = Object.assign({}, main.world);

    // feature/replica-scale from f6a7b8c
    var feat1 = Object.assign({}, commits['f6a7b8c'].tree, { 'deploy/values.yaml': valuesYaml(5, 'eu-central-1', true) });
    commits['c9d0e1f'] = { id: 'c9d0e1f', message: 'feat: scale replicas 3→5 for peak season', author: 'T. Achebe', time: '2026-10-02 10:15', parents: ['f6a7b8c'], tree: feat1 };
    var feat2 = Object.assign({}, feat1, { 'deploy/values.yaml': valuesYaml(5, 'eu-west-1', true) });
    commits['d0e1f2a'] = { id: 'd0e1f2a', message: 'feat: move workloads to eu-west-1', author: 'T. Achebe', time: '2026-10-02 11:02', parents: ['c9d0e1f'], tree: feat2 };

    var mainTip = 'b8c9d0e';
    var tags = {};

    if (mode === 'hard') {
      HARD_EXTRA_STEPS.forEach(function (st) {
        var w = Object.assign({}, commits[st.parent].tree);
        Object.keys(st.changes).forEach(function (p) {
          var v = st.changes[p];
          if (v === null) delete w[p]; else w[p] = v;
        });
        commits[st.id] = { id: st.id, message: st.message, author: st.author, time: st.time, parents: [st.parent], tree: w };
        world = w;
      });
      mainTip = 'f2a3b4c';
      tags['v1.4.0'] = 'b8c9d0e';
      tags['v2.0.0'] = 'f2a3b4c';
    }

    // working tree: branch tip + uncommitted noise + untracked notes
    var files = Object.assign({}, (mode === 'hard' ? world : commits[mainTip].tree));
    files['infra/main.tf'] = MAIN_TF_FIXED;    // the real fix (uncommitted)
    files['docs/runbook.md'] = RUNBOOK_EDITED; // noise (uncommitted)
    files['notes.txt'] = NOTES_TXT;            // untracked personal note (red herring)

    return {
      files: files,
      staged: {},
      commits: commits,
      branches: Object.assign({ main: mainTip, 'feature/replica-scale': 'd0e1f2a' }, mode === 'hard' ? { 'hotfix/security-group': 'e9f0a1b' } : {}),
      head: 'main',
      tags: tags,
      remote: { main: mainTip },
      pushedBranches: ['main'],
      prs: [],
      merging: null,
      protections: { directPushBlocked: false, requireReview: false, approvalsRequired: 0 },
      roles: { 'n.okafor': 'Maintainer', 'l.varga': 'Developer', 't.achebe': 'Developer', 'm.renner': 'Developer', 'j.pipeline': 'Developer' },
      ciBotToken: false,
      incidents: [
        { id: 'inc-live', label: 'Cloud API credential pair', filePath: 'config/service.env', kind: 'live-credential', flagged: false },
        { id: 'inc-sandbox', label: 'Sandbox integration key', filePath: 'tests/sandbox-key.txt', kind: 'revoked-test-key', flagged: false },
        { id: 'inc-example', label: 'Environment template', filePath: '.env.example', kind: 'example-placeholder', flagged: false }
      ],
      scannerPattern: null,
      scannerRun: null,
      scannerVerdicts: {},
      ciStages: [],
      forcePushUsed: false,
      auditFindings: { forcedPush: null, patToRevoke: null },
      auditActions: { patRevoked: false, protectionRestored: false },
      seq: {},
      log: [{ t: '08:00', msg: 'Yard office open. Repo ' + LAB.REPO_NAME + ' checked out on main @ ' + mainTip + '.', kind: 'info' }],
      nextCommitNum: 1
    };
  };

  // ── audit log (hard mode, H6) ────────────────────────────────────────────────
  LAB.AUDIT_ENTRIES = [
    { id: 'e1', time: '06:12', actor: 'j.pipeline', action: 'git.pull', detail: 'origin/main fetched via deploy automation', token: 'deploy_token_ci' },
    { id: 'e2', time: '07:03', actor: 'l.varga', action: 'git.push', detail: 'pushed main (fast-forward)', token: 'ssh:l.varga' },
    { id: 'e3', time: '09:47', actor: 'm.renner', action: 'git.clone', detail: 'full clone including all history — contractor offboarded 12 days ago', token: 'pat_renner_7f3' },
    { id: 'e4', time: '11:15', actor: 'm.renner', action: 'git.push --force', detail: 'FORCE-PUSH rewrote main — 2 commits replaced', token: 'pat_renner_7f3' },
    { id: 'e5', time: '13:02', actor: 't.achebe', action: 'pr.approve', detail: 'approved PR #98 (feature/replica-scale)', token: 'ssh:t.achebe' },
    { id: 'e6', time: '21:38', actor: 'm.renner', action: 'git.clone', detail: 'off-hours full clone from unmanaged network', token: 'pat_renner_7f3' },
    { id: 'e7', time: '22:04', actor: 'm.renner', action: 'settings.change', detail: 'branch protection on main DISABLED', token: 'pat_renner_7f3' },
    { id: 'e8', time: '22:10', actor: 'm.renner', action: 'git.push', detail: 'pushed main directly (protection was off)', token: 'pat_renner_7f3' },
    { id: 'e9', time: '06:50', actor: 'j.pipeline', action: 'secret_scan', detail: 'scheduled sweep: 0 findings (pattern: legacy)', token: 'deploy_token_ci' },
    { id: 'e10', time: '08:20', actor: 'n.okafor', action: 'git.pull', detail: 'origin/main fetched', token: 'ssh:n.okafor' }
  ];

  // ── CI stages (hard, H7) ─────────────────────────────────────────────────────
  LAB.CI_STAGE_POOL = ['terraform apply', 'lint', 'secret scan', 'unit tests', 'terraform plan', 'policy check'];
  LAB.CI_STAGE_CORRECT = ['lint', 'secret scan', 'unit tests', 'terraform plan', 'policy check', 'terraform apply'];

  // ── scanner pattern options (hard, H5) ───────────────────────────────────────
  LAB.SCANNER_OPTIONS = [
    { id: 'A', pattern: 'AKIA[A-Z0-9]{16}', label: 'A — vendor key format (AKIA + 16 chars)' },
    { id: 'B', pattern: '(api_?key|secret)\\s*=', label: 'B — anything that looks like key/secret assignment' },
    { id: 'C', pattern: 'key|secret', label: 'C — any line mentioning key or secret' }
  ];

  // ── objectives ───────────────────────────────────────────────────────────────
  LAB.OBJECTIVES_MEDIUM = [
    {
      id: 'OBJ-M1', pillar: 'P1', title: 'Classify the depots',
      brief: 'In the Rulebook, read the two depot cards and classify each repository model as centralized or distributed.',
      anchor: 'V8 — repository types (centralized vs distributed: SVN-style vs Git-style)',
      hints: ['One depot keeps its manifest in a single office; the other gives every crew a full copy of the ledger.', 'Checkout/commit against one central server = centralized. Clone with complete history on every machine = distributed.', 'NORTHGATE = centralized, SOUTHSIDE = distributed.'],
      maxHints: 3
    },
    {
      id: 'OBJ-M2', pillar: 'P2', title: 'Hazmat inspection',
      brief: 'Open the file tree, inspect the tracked files and mark the one holding a LIVE production credential as a hazmat flag in the Incident board.',
      anchor: 'V11 — secrets in source control (recognize a committed live credential)',
      hints: ['One tracked file was added "for the CI deploy job" — check what it contains.', 'config/service.env holds a key pair for the production cloud account.', 'Mark "Cloud API credential pair" (config/service.env) as hazmat in the Incident board.'],
      maxHints: 3
    },
    {
      id: 'OBJ-M3', pillar: 'P3', title: 'Read the ledger',
      brief: 'Use the History panel to find exactly which commit introduced config/service.env, and name its author in the objective form.',
      anchor: 'V15 — history forensics: git log as a detection data source',
      hints: ['The History panel lists every commit with author and changed files.', 'Look for the commit whose message mentions CI credentials (Sept 21).', 'Commit d4e5f6a, author M. Renner (contractor).'],
      maxHints: 3
    },
    {
      id: 'OBJ-M4', pillar: 'P1', title: 'Take the siding',
      brief: 'Create a branch named hotfix/nf-142 from main and switch the HEAD locomotive onto it.',
      anchor: 'V6 — branch management: isolate work from the shared main line',
      hints: ['Use the Branch desk: type the exact track name and choose create + switch.', 'Branches are cheap pointers — creating one does not copy files.', 'Type hotfix/nf-142 and press "Create + switch".'],
      maxHints: 3
    },
    {
      id: 'OBJ-M5', pillar: 'P2', title: 'Stage only the fix',
      brief: 'The working tree holds two uncommitted edits. Stage only infra/main.tf (the t3.large fix) and leave the runbook noise out.',
      anchor: 'V2 — the staging area: atomic commits, one logical change each',
      hints: ['Open the Workbench and compare both changed files first.', 'The siding (staging list) should end up with exactly one railcar: infra/main.tf.', 'Press "Stage" next to infra/main.tf only; leave docs/runbook.md unstaged.'],
      maxHints: 3
    },
    {
      id: 'OBJ-M6', pillar: 'P2', title: 'Compose the commit',
      brief: 'Commit the staged change with a message that references ticket NF-142 and says what changed.',
      anchor: 'V2 — code commit: messages that make history searchable',
      hints: ['The Commit composer ships everything currently on the siding.', 'Include the ticket ID in the message, e.g. starts with "fix: ".', 'Example: "fix: raise trackline-api instance to t3.large (NF-142)".'],
      maxHints: 3
    },
    {
      id: 'OBJ-M7', pillar: 'P2', title: 'Clear the junction clash',
      brief: 'Switch to main, merge feature/replica-scale, resolve the conflict in deploy/values.yaml (peak season needs replicas 5 and region eu-west-1 — keep the probe), then stamp tag v1.4.0 on the merge commit.',
      anchor: 'V4/V14 — code merge + conflict resolution; V12 — tagging releases',
      hints: ['Merge lives on the Branch desk. The conflict lands in the Workbench with <<<<<<< markers.', 'Open deploy/values.yaml, remove the markers, keep replicas: 5 and deploymentRegion: eu-west-1, then stage + commit the merge.', 'Finish with: stage values.yaml → commit → Tag desk: v1.4.0.'],
      maxHints: 3
    },
    {
      id: 'OBJ-M8', pillar: 'P4', title: 'Dispatch for review',
      brief: 'Push hotfix/nf-142 to origin, open a pull request into main, and record one approving review on it.',
      anchor: 'V7/V5/V3 — code push, pull request, code review as the gate to main',
      hints: ['Push from the Branch desk; the PR gate opens from there too.', 'The PR must go from hotfix/nf-142 INTO main, then someone must approve it.', 'Push → Open PR (base main) → "Record approval".'],
      maxHints: 3
    },
    {
      id: 'OBJ-M9', pillar: 'P3', title: 'Sweep the yard',
      brief: 'Run the secret scanner (pattern is preset), then triage every finding: true positive (TP) for real credentials, false positive (FP) for placeholders and dead keys.',
      anchor: 'V15 — secret scanning + true/false-positive triage',
      hints: ['The scanner bench is in the Tools stack on the right.', 'Ask of each finding: could this key open a real door today?', 'config/service.env lines = TP; the .env.example placeholders and the revoked sandbox key = FP.'],
      maxHints: 3
    },
    {
      id: 'OBJ-M10', pillar: 'P4', title: 'Clear the hazmat',
      brief: 'On main: add *.env to .gitignore, untrack config/service.env (keep the local file), and commit the remediation.',
      anchor: 'V11 — .gitignore + untracking; why deleting the file is not enough',
      hints: ['Edit .gitignore in the Workbench, save it, then stage it too.', '"Untrack" stages a removal but keeps the file on disk — the next commit drops it from the repo.', 'gitignore + stage both changes → commit with a message about removing tracked secrets.'],
      maxHints: 3
    },
    {
      id: 'OBJ-M11', pillar: 'P4', title: 'Rotate the key',
      brief: 'A credential that sat in git history must be treated as compromised. Revoke the leaked cloud key pair and issue a replacement in the Incident board.',
      anchor: 'V11 — credential rotation after exposure (pairs with MITRE T1552.001)',
      hints: ['Rotation = revoke the old value AND issue a new one, in that order.', 'Untracking the file did NOT touch history — the key still lives in old commits.', 'Incident board → "Cloud API credential pair": Revoke → Issue replacement.'],
      maxHints: 3
    },
    {
      id: 'OBJ-M12', pillar: 'P4', title: 'Lock the mainline',
      brief: 'In the Governance desk: block direct pushes to main, require 1 approving review, move the CI bot to a scoped deploy token, and set the offboarded contractor to Reader.',
      anchor: 'V10 — access control, least privilege, branch protection',
      hints: ['Every control here answers a different door into the depot.', 'Protection = pushes; token = how the bot authenticates; roles = what humans may do.', 'Four toggles/selects on the Governance desk, then check the objective.'],
      maxHints: 3
    }
  ];

  LAB.OBJECTIVES_HARD = [
    {
      id: 'OBJ-H1', pillar: 'P2', title: 'Forensic sweep',
      brief: 'The yard is noisy: placeholders, a dead test key, an untracked notes file. Identify the ONE live credential tracked in history — name its introducing commit, the author, and the file.',
      anchor: 'V11/V15 — distinguish real secrets from decoys across a noisy repo',
      hints: ['Sweep every tracked file that was ever committed — history counts, not just the working tree.'],
      maxHints: 1
    },
    {
      id: 'OBJ-H2', pillar: 'P4', title: 'Hazmat protocol',
      brief: 'Execute the full remediation in the correct order: rotate the leaked credential FIRST, then add *.env to .gitignore, untrack config/service.env, and commit the remediation on main.',
      anchor: 'V11 — incident ordering: rotation precedes history hygiene',
      hints: ['Order matters: anything in history is already compromised — shrink that window first.'],
      maxHints: 1
    },
    {
      id: 'OBJ-H3', pillar: 'P1', title: 'Choose the strategy',
      brief: 'Six engineers, shipping to production daily. Pick the branching strategy that fits, justify the two follow-up answers, and demonstrate it by creating branch feat/nf-201.',
      anchor: 'V6 — branching strategies (trunk-based vs GitFlow vs long-lived branches)',
      hints: ['Long-lived branches and daily deploys fight each other — integration cost grows with branch age.'],
      maxHints: 1
    },
    {
      id: 'OBJ-H4', pillar: 'P2', title: 'Three-way arbitration',
      brief: 'Bring BOTH remaining tracks into main: merge hotfix/security-group and feature/replica-scale. The egress fix AND the scale-up must both survive; keep probes; no markers left.',
      anchor: 'V4/V14 — multi-branch merges: auto-merge vs conflict, semantic survival',
      hints: ['Merge refuses while main.tf is dirty — commit the t3.large fix to main first.'],
      maxHints: 1
    },
    {
      id: 'OBJ-H5', pillar: 'P3', title: 'Tune the scanner',
      brief: 'Test each candidate pattern against the corpus, then commit to the ONE that flags the live key with zero false positives, and run the final sweep.',
      anchor: 'V15 — detection engineering: precision over recall, FP elimination',
      hints: ['Run all three and compare reports before deciding.'],
      maxHints: 1
    },
    {
      id: 'OBJ-H6', pillar: 'P3', title: 'Audit triage',
      brief: 'Read the origin audit stream. Identify the force-push that rewrote main, decide which token must be revoked, then execute containment: revoke it and restore branch protection.',
      anchor: 'V15 — audit log analysis + immediate containment actions',
      hints: ['The actor shows up repeatedly at the wrong hours with the same token.'],
      maxHints: 1
    },
    {
      id: 'OBJ-H7', pillar: 'P4', title: 'Build the release gate',
      brief: 'Order the six CI stages so nothing unsafe can reach production, then enable both branch protections on main.',
      anchor: 'V13 — CI/CD gate ordering; V10 — protection controls',
      hints: ['The apply stage is the point of no return — everything verify-shaped goes before it.'],
      maxHints: 1
    },
    {
      id: 'OBJ-H8', pillar: 'P1', title: 'Rollback v2.0.0',
      brief: 'Release v2.0.0 is failing in production (bad autoscaling policy + node bump). Revert BOTH offending commits on main, stamp v2.0.1 on the recovered HEAD, and do NOT force-push (the red button is a trap).',
      anchor: 'V1 — version management: revert vs reset on shared history',
      hints: ['Revert = new commit that undoes an old one; history stays intact for every crew.'],
      maxHints: 1
    },
    {
      id: 'OBJ-H9', pillar: 'P4', title: 'Least-privilege refit',
      brief: 'Refit all five identities to least privilege: correct role per person, the CI bot on a scoped deploy token, no shared passwords anywhere.',
      anchor: 'V10 — RBAC, credential hygiene for service accounts',
      hints: ['An offboarded identity holds NO role at all — removal is a privilege decision too.'],
      maxHints: 1
    }
  ];

  // ── quizzes ──────────────────────────────────────────────────────────────────
  // Item discipline (audit B3/R4/R5): correct-answer position rotates across items;
  // all options share a tight length band; the correct answer is never the unique
  // longest option; distractors stay in the same concept family as the question.
  LAB.QUIZ_MEDIUM = [
    {
      id: 'qm1', topic: 'Centralized vs distributed VCS',
      q: 'What makes a distributed VCS like Git different from a centralized one like Subversion?',
      options: [
        'It stores code on a single central server that developers check out',
        'It stops two people from editing the same file at once',
        'Every clone carries the full repository history and commits offline',
        'It writes your commit messages automatically after each save'
      ],
      answer: 2,
      explain: 'In a distributed VCS every clone is a full repository — history, branches and all — so work continues offline; syncing happens later via push/pull. The central-server option describes the CENTRALIZED model (Subversion-style: one manifest office). No VCS truly stops two people editing the same file — conflicts surface at merge time and a human resolves them. And nothing writes commit messages for you: messages are documentation you author.'
    },
    {
      id: 'qm2', topic: 'The staging area & atomic commits',
      q: 'What is the staging area (the siding) for?',
      options: [
        'Choosing exactly which changes ride in the next, atomic commit',
        'Parking files you never intend to commit to the repo',
        'Keeping a backup copy of your most recent commit',
        'Queueing commits that wait for the CI server to run'
      ],
      answer: 0,
      explain: 'The staging area (index) lets you compose the NEXT commit deliberately: one logical change per commit. That is what makes history readable, revertible and bisectable — the "atomic commit" idea from the exam objectives. Files you never want committed belong in .gitignore (or untracked); backups come from the commit history and remotes, not the siding; CI watches branches and pipelines, not your local index.'
    },
    {
      id: 'qm3', topic: 'Merge conflict mechanics',
      q: 'When does a merge conflict happen?',
      options: [
        'Whenever two branches exist in the same shared repository',
        'When a commit message is too short or too vague',
        'When you push to origin without pulling remote commits first',
        'When both branches changed the same region since the ancestor'
      ],
      answer: 3,
      explain: 'Git auto-merges changes in different regions — even different lines of the same file. A conflict arises only when BOTH sides touched the same region since the merge base, so Git cannot decide which version wins. Merely having branches never conflicts; message length is a style matter; push-without-pull is a workflow smell, not a conflict itself.'
    },
    {
      id: 'qm4', topic: '.gitignore vs tracked files',
      q: 'You added *.env to .gitignore, but tracked file config/service.env still appears in git status. Why?',
      options: [
        'The pattern needs a leading slash to match nested files',
        '.gitignore only affects untracked files; tracked ones need explicit untracking',
        'The .gitignore file must be committed before rules take effect',
        'You must rename the file so the pattern can match'
      ],
      answer: 1,
      explain: '.gitignore prevents UNTRACKED files from being added; a file already in history stays tracked until you remove it from the index (git rm --cached / untrack). A leading slash only scopes the pattern to the repo root — it does not change tracking. Committing the .gitignore is good practice but does not re-evaluate tracked files. Renaming is irrelevant — the pattern never touches tracked files.'
    },
    {
      id: 'qm5', topic: 'Credential rotation after exposure',
      q: 'A live production credential was committed and pushed. What is the correct first response?',
      options: [
        'Delete the file in a new commit and move on',
        'Rewrite the whole shared branch history yourself right away',
        'Revoke and rotate the credential; deletion never scrubs history',
        'Rename the file and add its name to .gitignore'
      ],
      answer: 2,
      explain: 'Every clone already holds the history, so the secret stays exposed until the credential itself is revoked/rotated — that shrinks the real exposure window. Deleting the file only changes FUTURE commits; renaming and .gitignore prevent re-adding but leave the key live; an uncoordinated history rewrite on a shared branch demands a force-push that breaks every clone. Hygiene follows rotation (MITRE ATT&CK T1552.001).'
    },
    {
      id: 'qm6', topic: 'Pull requests as review gates',
      q: 'What is a pull request for?',
      options: [
        'Proposing a reviewed merge into main as the integration gate',
        'Downloading the newest committed code from origin to your machine',
        'Archiving old branches that finished their work long ago',
        'Stamping a release tag onto the current tip commit'
      ],
      answer: 0,
      explain: 'A PR is the review gate: it shows the proposed diff, runs CI checks, and requires an approval before the merge lands on main. Downloading code is pull/fetch; archiving branches is cleanup housekeeping; stamping releases is what tags do. Code review + PR are explicit CV0-004 objective bullets.'
    },
    {
      id: 'qm7', topic: 'Tags vs branches',
      q: 'Tag vs branch — which statement is right?',
      options: [
        'They are two names for exactly the same kind of pointer',
        'Tags move as new commits land; branches stay on one commit',
        'Tags are reserved for bug fixes, branches for features',
        'A tag pins one commit; a branch moves with work'
      ],
      answer: 3,
      explain: 'A tag is a fixed name pinned to one commit (v1.4.0) — exactly what release rollbacks need; a branch is a moving pointer that advances as work lands. The other two options swap the roles: branches move, tags do not. Cloud deployments use tags to record exactly which code version went out.'
    }
  ];

  LAB.QUIZ_HARD = [
    {
      id: 'qh1', topic: 'Full leak-response sequence',
      scenario: 'Triage: git log -p shows commit d4e5f6a by an offboarded contractor adding config/service.env with a live cloud key.',
      q: 'Which response sequence is BOTH safe and complete?',
      options: [
        'Delete the file, close the ticket, and watch the access logs',
        'Rotate the key first, untrack the file, then review account access',
        'Force-push a rewrite of main immediately from your laptop',
        'Rename the file, add it to .gitignore, file a report'
      ],
      answer: 1,
      explain: 'Rotation first shrinks the exposure window (the key is already in every clone), then hygiene (untrack + .gitignore), then review of what the account did in the gap. Deletion alone leaves the key live and closing the ticket lies; an immediate uncoordinated force-push breaks every clone and the audit trail; renaming ignores that the credential itself is compromised.'
    },
    {
      id: 'qh2', topic: 'Containment from the audit log',
      scenario: 'The origin audit log shows: "22:04 settings.change — branch protection DISABLED by m.renner via pat_renner_7f3; m.renner offboarded 12 days ago".',
      q: 'Your FIRST containment action?',
      options: [
        'Rotate every credential the company owns before anything else',
        'Delete the whole repository before more history leaks out',
        'Email the contractor and wait for a written reply',
        'Immediately revoke the pat_renner_7f3 token and restore branch protection'
      ],
      answer: 3,
      explain: 'Containment targets the live access path: the unrevoked PAT of an offboarded identity is the door being used right now, and the disabled protection is the open gate it abused. Revoking the token and re-enabling protection closes both immediately; company-wide rotation is a follow-up, not a first move; deleting the repository destroys evidence; emailing and waiting leaves the door open.'
    },
    {
      id: 'qh3', topic: 'Revert vs reset on shared history',
      q: 'Why is revert preferred over reset on a SHARED branch like main?',
      options: [
        'Revert adds an undo commit; clones and tags stay valid',
        'Reset is quicker and keeps the audit trail fully intact',
        'Reset preserves history while revert quietly destroys it',
        'There is no practical difference between the two commands'
      ],
      answer: 0,
      explain: 'Revert appends a new commit that undoes an old one — history is preserved, so every clone, tag and audit reference stays valid. Reset moves the branch pointer and demands a force-push, invalidating every clone built on the old commits — the audit trail is exactly what reset damages. The other two options state the relationship backwards or deny the difference.'
    },
    {
      id: 'qh4', topic: 'Scanner tuning for precision',
      scenario: 'Your secret scanner flags 200 hits: mostly "<AKIA-REPLACE-ME-0000>" placeholders in .env.example files across 40 repos.',
      q: 'Best tuning move?',
      options: [
        'Delete the scanner — the noise has made it useless',
        'Mark every current finding as a permanent false positive',
        'Narrow the pattern to the real key format; allowlist templates',
        'Run the scans only weekly instead of on every push'
      ],
      answer: 2,
      explain: 'Detection engineering = precision without losing true positives: a format-specific pattern (AKIA + 16 chars) plus allowlists for template files kills placeholder noise while real keys still trigger. Deleting the scanner blinds the pipeline; permanent blanket FPs silence future real hits; scanning weekly only delays detection without reducing noise.'
    },
    {
      id: 'qh5', topic: 'Service-account credentials',
      scenario: 'The CI deploy bot currently authenticates with a personal admin password written in a runbook.',
      q: 'Correct fix?',
      options: [
        'Keep the password but rotate it on a weekly schedule',
        'Scoped deploy token with least privilege, in the secret store',
        "Give the bot a developer's personal SSH key to reuse",
        'Move the password into README.md where reviewers can find it'
      ],
      answer: 1,
      explain: 'Automation gets least-privilege, scoped, revocable credentials — never human passwords or personal keys. Weekly rotation keeps a shared admin password (still over-privileged, still written in a runbook); a personal SSH key couples the pipeline to one human and survives offboarding; publishing credentials in README.md is the leak itself.'
    },
    {
      id: 'qh6', topic: 'MITRE mapping of branch protection',
      q: 'Branch protection that blocks direct pushes to main and requires review most directly mitigates which MITRE ATT&CK technique?',
      options: [
        'T1552.001 — Unsecured Credentials: Credentials In Files',
        'T1078 — Valid Accounts: abused logins of trusted users',
        'T1486 — Data Encrypted for Impact: ransomware payload effect',
        'T1195.002 — Compromise Software Supply Chain: poisoned builds'
      ],
      answer: 3,
      explain: 'Protection + review is a supply-chain integrity control: no unreviewed or compromised-account commit lands in the lineage that CI builds and ships (T1195.002, Initial Access). T1552.001 is about secrets lying in files; T1078 (Valid Accounts) is related — protection does blunt abused accounts — but the direct, designed hit is the supply-chain gate; T1486 is ransomware impact, unrelated to repo gates.'
    },
    {
      id: 'qh7', topic: 'CI/CD gate ordering',
      scenario: 'Pipeline stages available: terraform apply, lint, secret scan, unit tests, terraform plan, policy check.',
      q: 'Where does terraform apply belong?',
      options: [
        'Last — after secret scan, tests, plan and policy check pass',
        'First — deploying your changes early catches problems even sooner',
        'Right after lint, but before any tests have actually run',
        'Anywhere in the pipeline — the stage order does not matter'
      ],
      answer: 0,
      explain: 'apply changes real infrastructure — the point of no return. Every verification stage (lint, secret scan, tests, plan, policy) runs before it, so nothing unsafe or unreviewed reaches production. Deploying first inverts the gate; applying before tests ships unverified code; order is exactly what makes a pipeline a control.'
    },
    {
      id: 'qh8', topic: 'What untracking really does',
      q: 'What does "untrack (git rm --cached)" actually do?',
      options: [
        'Deletes the file from disk and from the whole history',
        'Reverts the last commit and restores the previous tree state',
        'Keeps the file on disk; drops it from future commits',
        'Puts the file on the staging area for later commits'
      ],
      answer: 2,
      explain: 'Untracking changes the FUTURE (the next commits no longer carry the file), not the PAST (old commits still hold it — hence rotation) and not the disk (the local copy stays). Deleting from history would be a rewrite; reverting is a different operation; and the file leaves the index rather than joining it.'
    }
  ];

  // ── glossary ─────────────────────────────────────────────────────────────────
  LAB.GLOSSARY = [
    { term: 'Repository', def: 'The tracked project store: files plus their full commit history. Centralized = one server copy; distributed = every clone is a full copy.' },
    { term: 'Commit', def: 'An immutable snapshot of the staged tree with author, time, message and parent pointer(s). The unit of history.' },
    { term: 'Staging area (index)', def: 'The "siding": changes selected to ride in the NEXT commit. Enables atomic, single-purpose commits.' },
    { term: 'Branch', def: 'A movable pointer to a commit — a parallel track of work that isolates changes until they are merged.' },
    { term: 'HEAD', def: 'The locomotive: a pointer to the branch/commit your working tree currently reflects.' },
    { term: 'Merge', def: 'Coupling two tracks: combining divergent lines of history into one commit (or fast-forwarding the pointer).' },
    { term: 'Merge conflict', def: 'A junction clash: both branches changed the same region since the common ancestor; a human must pick the surviving content.' },
    { term: 'Pull request (PR)', def: 'A proposal to merge a branch into main, surfaced as a diff with CI checks and required review before landing.' },
    { term: 'Code review', def: 'Humans inspecting a proposed change for correctness, standards and security before approval — the gate on main.' },
    { term: 'Push / Pull', def: 'Dispatching local commits to the shared remote (push); fetching and integrating remote commits (pull).' },
    { term: 'Tag', def: 'A fixed name pinned to one commit (v1.4.0) marking a release; does not move when new commits land.' },
    { term: 'Revert vs Reset', def: 'Revert = new commit that undoes an old one (history preserved — safe on shared branches). Reset/rewrite = moves the branch pointer, demands force-push — dangerous when shared.' },
    { term: '.gitignore', def: 'Patterns for files Git should NOT track going forward; does not affect files already tracked.' },
    { term: 'Secret scanning', def: 'Pattern-based sweeps of repo content (working tree and history) to flag committed credentials before abuse — tune for precision.' },
    { term: 'Deploy token', def: 'A scoped, revocable credential for automation (CI bots) — least privilege, never a shared human password.' }
  ];

  // ── narrative texts ───────────────────────────────────────────────────────────
  LAB.BRIEFING = {
    headline: '06:40 — TrackLine is throwing 500s.',
    org: LAB.ORG,
    paragraphs: [
      LAB.ORG + ' moves freight across Europe on the TrackLine platform. The platform\'s infrastructure lives where every cloud team\'s truth lives: a Git repository — ' + LAB.REPO_NAME + ' — holding Terraform, Kubernetes manifests and deploy config.',
      'This morning\'s release misfired, and while digging the duty engineer noticed worse: the repo\'s history is not clean. A contractor who left twelve days ago committed things that should never have been committed. The Platform Squad needs a yardmaster who can run the depot properly — branch it, merge it, tag it, and get the hazmat out of it.',
      'This is exactly the craft CompTIA Cloud+ CV0-004 tests in Domain 5 (DevOps Fundamentals, 10% of the exam): source control — commits, branches, merges, pull requests, reviews, pushes, tags — and the operational judgement around them.'
    ],
    label: 'FICTIONAL TRAINING SCENARIO — all names, keys and logs are synthetic.'
  };

  LAB.DEPOT_CARDS = [
    {
      name: 'Depot NORTHGATE', sub: 'runs Subversion-style source control', correct: 'centralized',
      points: ['One central server holds the ONLY full history (the manifest office).', 'Crews check out working copies; commit and update against the office.', 'Offline commits impossible; server down = depot down.', 'Fine-grained per-directory locks are its party trick.']
    },
    {
      name: 'Depot SOUTHSIDE', sub: 'runs Git-style source control', correct: 'distributed',
      points: ['EVERY crew clone carries the complete ledger — all history, all branches.', 'Commit locally anywhere; push/pull to sync with remotes (GitHub, GitLab, Bitbucket).', 'Branching and merging are cheap, daily operations.', 'No single office: remotes are conveniences, not single points of truth.']
    }
  ];

  LAB.INCIDENTS_REAL = [
    { title: 'Ride-hailing giant, 2016 (disclosed 2017)', text: 'Cloud credentials for a data bucket sat in a private code repository. Attackers used them to reach rider and driver records of ~57 million people. Simplified from public breach disclosures and regulatory findings.' },
    { title: 'Automotive manufacturer, 2018', text: 'A hardcoded access key sat in a public repository for roughly five years, exposing data of millions of customers. Simplified from public reports.' },
    { title: 'Carmaker research source code, 2020', text: 'An employee uploaded internal source code WITH an authorization token to a public repository. Simplified from public reports.' },
    { title: 'Electronics giant, 2021', text: 'An employee accidentally published internal source code carrying hardcoded credentials to a public repository. Simplified from public reports.' }
  ];

  LAB.RULEBOOK_SECTIONS = [
    {
      title: 'Why a cloud team runs on source control',
      body: 'Every artifact a cloud platform depends on — Terraform, manifests, Dockerfiles, pipeline definitions — lives in a repository. The commit history is the audit trail: who changed what, when, and why. When a deploy breaks, you do not guess — you read the ledger, find the commit, and revert it. That is why CV0-004 tests version management, commits, branches, merges, pull requests, reviews and pushes as one connected skill.'
    },
    {
      title: 'The anatomy of a change',
      body: 'You edit files in the WORKING TREE. You load chosen changes onto the STAGING AREA (the siding). COMMIT seals the siding into an immutable snapshot on your current BRANCH — a movable pointer into history. TAGS pin releases (v1.4.0). PUSH dispatches your commits to the shared REMOTE (origin/main); PULL brings others\' work in. The commit graph is the yard map: every railcar is one commit, coupled to its parents.'
    },
    {
      title: 'Branches, merges and the junction clash',
      body: 'A branch isolates work: hotfixes, features, experiments — main stays deployable. Merging couples the tracks back. Git auto-merges changes in different regions; when BOTH sides changed the same region since the common ancestor, you get a MERGE CONFLICT (<<<<<<< markers) and a human decides what survives. Collaboration lands through PULL REQUESTS: a diff, CI checks and a required REVIEW before main accepts it.'
    },
    {
      title: 'The hazmat angle: secrets in the depot',
      body: 'A repository is a copying machine: every clone carries every commit — including that credential someone committed "just for the CI job" (MITRE ATT&CK T1552.001, Credentials In Files). Deleting the file in a later commit changes the FUTURE, not the PAST: history still hands the key to anyone with repo access. Real remediation: revoke/rotate immediately, untrack + .gitignore, secret scanning in CI, and only then — coordinated — a history rewrite. A protected main branch (no direct pushes, required review) is also a supply-chain control against MITRE ATT&CK T1195.002, Compromise Software Supply Chain.'
    }
  ];

  LAB.LINKS = [
    { label: 'CompTIA Cloud+ CV0-004 exam objectives', url: 'https://www.comptia.org/en-us/certifications/cloud' },
    { label: 'MITRE ATT&CK T1552.001 — Unsecured Credentials: Credentials In Files', url: 'https://attack.mitre.org/techniques/T1552/001/' },
    { label: 'MITRE ATT&CK T1195.002 — Compromise Software Supply Chain', url: 'https://attack.mitre.org/techniques/T1195/002/' },
    { label: 'Pro Git (free official book)', url: 'https://git-scm.com/book/en/v2' }
  ];

  LAB.DEBRIEF = {
    detections: [
      { src: 'Repository audit stream', use: 'Force-pushes, protection changes, off-hours clones, tokens of offboarded identities. Alert on: push --force on main, protection disabled, clone storms by stale PATs (you triaged exactly this).' },
      { src: 'Secret scanning (pre-commit + CI)', use: 'Format-tuned patterns (e.g. AKIA[A-Z0-9]{16}) sweep every commit AND history; template allowlists kill false positives. Findings route to rotation, not just deletion.' },
      { src: 'Commit history / git log -p', use: 'The introducing commit, its author and date anchor every secret investigation — history forensics is a detection skill (M3/H1).' },
      { src: 'CI pipeline gates', use: 'Ordered stages (lint → secret scan → tests → plan → policy → apply) turn the repo into a control point: nothing unscanned reaches infrastructure.' }
    ],
    mitigations: [
      { id: 'Branch protection', text: 'Block direct pushes to main, require reviews — the supply-chain gate (T1195.002). Practiced in M12/H7.' },
      { id: 'Least privilege + tokens', text: 'RBAC roles per identity; scoped deploy tokens for bots; revoke on offboarding (M12/H9, audit H6).' },
      { id: 'Secret hygiene', text: 'Never commit secrets; .gitignore templates; untrack mistakes; rotate first when exposure happens (M10–M11, H2; T1552.001).' },
      { id: 'Safe history surgery', text: 'Revert — never force-push — shared branches; tags pin releases for clean rollbacks (H8, M7).' }
    ],
    blue: [
      'The history IS the evidence: log, diffs and audit stream answer who/what/when without touching production.',
      'Untracked ≠ gone: rotation beats deletion whenever a secret has been committed.',
      'A quiet main branch (protected, review-gated, tag-per-release) is the cheapest incident insurance a cloud team can buy.'
    ],
    red: [
      'Attackers read public and leaked repos for exactly the hazmat you cleaned — one push is one credential (T1552.001).',
      'An offboarded identity with a live token is an insider door: audit logs are where that door creaks (H6).',
      'Whoever controls the repo lineage controls what gets built and shipped — that is why supply-chain compromise (T1195.002) pays off big.'
    ],
    next: ['Lesson 5.3 — CI/CD pipelines: build the gates you just sequenced into real automation.', 'Lesson 5.4 — DevOps tools: Terraform, Ansible, Jenkins, GitHub Actions in depth.', 'Practice: run a real git init → branch → merge → PR cycle on a scratch repo of your own.']
  };
})(window.LAB = window.LAB || {});
