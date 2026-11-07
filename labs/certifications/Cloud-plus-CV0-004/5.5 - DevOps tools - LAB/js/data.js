// ─────────────────────────────────────────────────────────────────────────────
// js/data.js — ALL lab content, carried over 1:1 from the original framework lab
// (src/lib/lab/types.ts, objectives.ts, quiz.ts, evidence.ts of the CV0-004
// Lesson 5.5 "DevOps Tools" release-train lab). Data only — no logic here.
// All scenario content is synthetic training data (fictional org "NimbusCart").
// ─────────────────────────────────────────────────────────────────────────────

window.LAB_DATA = {
  stations: [
    {
      "id": "plan",
      "code": "ST-01",
      "name": "PLAN",
      "tool": "Git · source control",
      "blurb": "The line starts here: every release begins as a commit. Choose the right machines for the train.",
      "color": "#8FA3B8",
      "icon": "git"
    },
    {
      "id": "build",
      "code": "ST-02",
      "name": "BUILD",
      "tool": "Jenkins · CI/CD server",
      "blurb": "Builds, tests and packages every commit. Pipeline-as-code lives here.",
      "color": "#F59E0B",
      "icon": "jenkins"
    },
    {
      "id": "configure",
      "code": "ST-03",
      "name": "CONFIGURE",
      "tool": "Ansible · configuration management",
      "blurb": "Agentless desired-state enforcement over SSH for the host fleet.",
      "color": "#A78BFA",
      "icon": "ansible"
    },
    {
      "id": "orchestrate",
      "code": "ST-04",
      "name": "ORCHESTRATE",
      "tool": "Kubernetes · container orchestration",
      "blurb": "Schedules, scales and self-heals the containerized workloads.",
      "color": "#2DD4BF",
      "icon": "kubernetes"
    },
    {
      "id": "operate",
      "code": "ST-05",
      "name": "OPERATE",
      "tool": "Observability · audit & drift",
      "blurb": "Watch the train run: audit logs, drift scans, incident response.",
      "color": "#4ADE80",
      "icon": "operate"
    }
  ],

  objectives: [
    {
      "id": "OBJ-M1",
      "mode": "medium",
      "station": "plan",
      "pillar": "P1",
      "title": "Assign each machine on the line to its primary automation role.",
      "context": "The train has three machines — Jenkins, Ansible, Kubernetes — and they are NOT interchangeable. Each owns one distinct pillar of automation.",
      "anchor": "Coverage A4 · C1 · B1 · D1 (tool roles)",
      "widgets": [
        {
          "kind": "pair",
          "key": "toolRole",
          "leftLabel": "Tool",
          "rightLabel": "Primary role",
          "left": [
            {
              "id": "jenkins",
              "label": "Jenkins",
              "hint": "the red build server"
            },
            {
              "id": "ansible",
              "label": "Ansible",
              "hint": "the SSH config pusher"
            },
            {
              "id": "kubernetes",
              "label": "Kubernetes",
              "hint": "the container platform"
            }
          ],
          "right": [
            {
              "id": "role-orch",
              "label": "Container orchestration — schedules, scales and self-heals containerized workloads"
            },
            {
              "id": "role-cm",
              "label": "Agentless configuration management — enforces desired state on hosts over SSH"
            },
            {
              "id": "role-ci",
              "label": "CI/CD automation server — builds, tests and delivers releases on every commit"
            }
          ],
          "solution": {
            "jenkins": "role-ci",
            "ansible": "role-cm",
            "kubernetes": "role-orch"
          }
        }
      ],
      "hints": [
        "Each tool answers a different question: “build & ship it”, “make the hosts match the code”, “run & heal the containers”.",
        "Jenkins builds/tests/delivers on commit · Ansible pushes config to hosts over SSH with no agent installed · Kubernetes schedules and heals containers toward a declared state.",
        "Answer: Jenkins → CI/CD server · Ansible → agentless configuration management · Kubernetes → container orchestration."
      ],
      "why": "These three roles are the backbone of the CV0-004 DevOps-tools objective: build automation, configuration management and orchestration are separate disciplines that interlock in one pipeline. Blurring them is the classic exam trap.",
      "next": "On the job: when a task lands, first ask which pillar it belongs to — “build it”, “make hosts match it”, or “run and scale it” — then pick the machine. Open the Field Manual (top right) for the full tool cards."
    },
    {
      "id": "OBJ-M2",
      "mode": "medium",
      "station": "plan",
      "pillar": "P1",
      "title": "Put the six release stages in the order the train runs them.",
      "context": "A release is a sequence, not a pile. Click stages below to build the order (click a chosen stage again to remove it), then check.",
      "anchor": "Coverage A3 · E1 (pipeline order & interlock)",
      "widgets": [
        {
          "kind": "order",
          "key": "stageOrder",
          "label": "Pipeline stages — click in the correct order",
          "items": [
            {
              "id": "commit",
              "label": "Commit & push",
              "hint": "Git — source of truth, fires the webhook"
            },
            {
              "id": "buildTest",
              "label": "Build & test",
              "hint": "Jenkins runs lint + unit tests"
            },
            {
              "id": "publish",
              "label": "Publish artifact/image",
              "hint": "image goes to the container registry"
            },
            {
              "id": "configure",
              "label": "Provision & configure hosts",
              "hint": "Ansible enforces fleet state"
            },
            {
              "id": "deploy",
              "label": "Deploy & orchestrate",
              "hint": "Kubernetes rolls out the workload"
            },
            {
              "id": "operate",
              "label": "Monitor & audit",
              "hint": "logs, events, drift scans"
            }
          ],
          "solution": [
            "commit",
            "buildTest",
            "publish",
            "configure",
            "deploy",
            "operate"
          ]
        }
      ],
      "hints": [
        "Start with what triggers everything (a commit), end with what watches it run.",
        "Commit → Jenkins builds/tests → image to registry → Ansible keeps hosts ready → Kubernetes deploys → observability watches.",
        "Exact order: Commit & push · Build & test · Publish artifact/image · Provision & configure hosts · Deploy & orchestrate · Monitor & audit."
      ],
      "why": "The CV0-004 pipeline objective expects you to sequence CI/CD stages correctly — and to know WHICH tool drives each stage. That mapping (Git→commit, Jenkins→build, Ansible→configure, Kubernetes→deploy) is the “interlock” idea of this whole chapter.",
      "next": "Notice the train only moves because each station hands off to the next. Next time something “randomly” breaks in prod, trace the stage boundary where it actually failed."
    },
    {
      "id": "OBJ-M3",
      "mode": "medium",
      "station": "plan",
      "pillar": "P1",
      "title": "Classify each statement: CI, Continuous Delivery, or Continuous Deployment.",
      "context": "The C-D family is the most-confused vocabulary in the domain. Sort each statement to its correct practice.",
      "anchor": "Coverage A1 · A2 (CI vs delivery vs deployment)",
      "widgets": [
        {
          "kind": "sort",
          "key": "cicdClass",
          "items": [
            {
              "id": "s1",
              "label": "“Every push to main automatically builds the app and runs the test suite.”"
            },
            {
              "id": "s2",
              "label": "“Every change that passes the pipeline ships to production automatically — no human clicks.”"
            },
            {
              "id": "s3",
              "label": "“Passing builds are packaged and staged for release; a release manager approves the final prod deploy.”"
            }
          ],
          "categories": [
            {
              "id": "ci",
              "label": "Continuous Integration"
            },
            {
              "id": "cdd",
              "label": "Continuous Delivery"
            },
            {
              "id": "cddp",
              "label": "Continuous Deployment"
            }
          ],
          "solution": {
            "s1": "ci",
            "s2": "cddp",
            "s3": "cdd"
          }
        }
      ],
      "hints": [
        "CI ends at “tested”. Delivery ends at “ready, awaiting approval”. Deployment ends at “live, nobody clicked”.",
        "The only difference between delivery and deployment is the human gate before production.",
        "Answers: build+test on push = CI · auto-ship, no gate = Continuous Deployment · staged with human approval = Continuous Delivery."
      ],
      "why": "These definitions are guaranteed CV0-004 vocabulary. The exam tests whether you know CI is about fast integration feedback, and that delivery vs deployment differ only by the approval gate.",
      "next": "Real teams usually run CI + Continuous Delivery first and adopt Continuous Deployment per service, once trust in the pipeline is proven."
    },
    {
      "id": "OBJ-M4",
      "mode": "medium",
      "station": "configure",
      "pillar": "P2",
      "title": "Identify Ansible’s two core files in the repo evidence.",
      "context": "Open the CONFIGURE station evidence. One file says WHERE to act, the other says WHAT to do. Match them.",
      "anchor": "Coverage C2 · A5 (inventory vs playbook anatomy)",
      "widgets": [
        {
          "kind": "pair",
          "key": "ansibleFiles",
          "leftLabel": "Job of the file",
          "rightLabel": "Which file?",
          "left": [
            {
              "id": "hosts",
              "label": "Lists the target hosts the tasks run against"
            },
            {
              "id": "tasks",
              "label": "Defines the ordered tasks/modules that enforce state"
            }
          ],
          "right": [
            {
              "id": "inv",
              "label": "inventory.ini"
            },
            {
              "id": "site",
              "label": "site.yml"
            },
            {
              "id": "jf",
              "label": "Jenkinsfile"
            },
            {
              "id": "dep",
              "label": "deployment.yaml"
            }
          ],
          "solution": {
            "hosts": "inv",
            "tasks": "site"
          }
        }
      ],
      "hints": [
        "One is an INI list of servers; the other is a YAML list of tasks.",
        "Ansible calls the host list the inventory; the task list is the playbook.",
        "Answer: hosts → inventory.ini · tasks → site.yml (the playbook)."
      ],
      "why": "Inventory + playbook is the minimum anatomy of any Ansible run — the exam expects you to recognize both by content, not just name. `hosts: web` in the playbook is a reference INTO the inventory group.",
      "next": "Notice site.yml references modules (apt, template, copy, service) — small idempotent units of work. Reading playbacks fluently is the P2 skill here."
    },
    {
      "id": "OBJ-M5",
      "mode": "medium",
      "station": "orchestrate",
      "pillar": "P2",
      "title": "Read the storefront manifest: what does the Deployment declare?",
      "context": "Open deploy/k8s/deployment.yaml at the ORCHESTRATE station. Three facts are hiding in plain sight.",
      "anchor": "Coverage D1 · D2 · A6 (manifest & desired-state reading)",
      "widgets": [
        {
          "kind": "text",
          "key": "k8sReplicas",
          "fields": [
            {
              "key": "replicas",
              "label": "How many replicas are declared?",
              "placeholder": "number",
              "answers": [
                "3",
                "three"
              ]
            }
          ]
        },
        {
          "kind": "pair",
          "key": "k8sRead",
          "leftLabel": "Question",
          "rightLabel": "Answer",
          "left": [
            {
              "id": "kind",
              "label": "What kind of Kubernetes object is this manifest?"
            },
            {
              "id": "field",
              "label": "Which block holds the pod spec Kubernetes enforces (the desired state)?"
            }
          ],
          "right": [
            {
              "id": "k-dep",
              "label": "Deployment"
            },
            {
              "id": "k-pod",
              "label": "Pod"
            },
            {
              "id": "k-svc",
              "label": "Service"
            },
            {
              "id": "k-cm",
              "label": "ConfigMap"
            },
            {
              "id": "f-template",
              "label": "spec.template"
            },
            {
              "id": "f-replicas",
              "label": "spec.replicas"
            },
            {
              "id": "f-meta",
              "label": "metadata.name"
            }
          ],
          "solution": {
            "kind": "k-dep",
            "field": "f-template"
          }
        }
      ],
      "hints": [
        "Look for the line starting with `replicas:` and the top-level `kind:`.",
        "A Deployment is the higher-level object managing pods; `spec.template` is the pod template it reconciles toward.",
        "Answer: replicas = 3 · kind = Deployment · the pod spec lives under spec.template."
      ],
      "why": "Reading a manifest is the P2 skill for Kubernetes: the `kind` tells you the object’s job, `spec.replicas` is desired state, and `spec.template` is the pod spec that controllers keep true. This is the “declaration, not script” mindset the exam tests.",
      "next": "Because the manifest declares 3, a manual `kubectl scale --replicas=5` gets reconciled back to 3 — you can see that happen in kubectl-events.txt. Change the declaration, not the cluster."
    },
    {
      "id": "OBJ-M6",
      "mode": "medium",
      "station": "build",
      "pillar": "P2",
      "title": "Trace the Jenkinsfile: which three actions follow the test stage?",
      "context": "Open the Jenkinsfile at the BUILD station and follow the stages after Lint & Unit Tests.",
      "anchor": "Coverage B1 · E1 (Jenkins pipeline mechanics)",
      "widgets": [
        {
          "kind": "multi",
          "key": "jenkinsFlow",
          "label": "Select the three actions the pipeline performs after tests pass",
          "options": [
            {
              "id": "a-buildimg",
              "label": "Builds a Docker image tagged nimbuscart-web:1.4.2"
            },
            {
              "id": "a-push",
              "label": "Logs into the registry with a stored credential and pushes the image"
            },
            {
              "id": "a-rollout",
              "label": "Rolls the new version out to the cluster (kubectl rollout)"
            },
            {
              "id": "a-email",
              "label": "Emails a release manager for manual approval"
            },
            {
              "id": "a-ssh",
              "label": "SSHes into every web VM to copy files by hand"
            },
            {
              "id": "a-repo",
              "label": "Creates a new GitHub repository for the release"
            }
          ],
          "solution": [
            "a-buildimg",
            "a-push",
            "a-rollout"
          ],
          "selectCount": 3
        }
      ],
      "hints": [
        "Follow the stage names: Build Image → Push → Deploy.",
        "The pipeline is fully automated after tests — no email approval step exists.",
        "Answer: builds the image, pushes it to the registry with the stored ci-bot credential, then kubectl rollout on the cluster."
      ],
      "why": "This is pipeline mechanics: Jenkins packages the tested app as a container image, publishes it to a registry using credentials from its credential store, and triggers deployment. Every hand-off is automated — that is CI/CD in one picture.",
      "next": "Watch WHERE credentials enter: withCredentials pulls registry-ci-token from Jenkins’ credential store at runtime — the “right” pattern. The console and the repo tell a different story about where the token also lives…"
    },
    {
      "id": "OBJ-M7",
      "mode": "medium",
      "station": "configure",
      "pillar": "P3",
      "title": "One playbook task is NOT idempotent. Name it and say why.",
      "context": "Read site.yml, then confirm against ansible-run.txt — the run recap shows the symptom every single run.",
      "anchor": "Coverage C3 · C5 (idempotency detection)",
      "widgets": [
        {
          "kind": "pair",
          "key": "idemTask",
          "leftLabel": "Finding",
          "rightLabel": "The offending task",
          "left": [
            {
              "id": "which",
              "label": "The task that is NOT idempotent"
            }
          ],
          "right": [
            {
              "id": "t-install",
              "label": "Install nginx"
            },
            {
              "id": "t-config",
              "label": "Deploy site config"
            },
            {
              "id": "t-creds",
              "label": "Sync app credentials"
            },
            {
              "id": "t-env",
              "label": "Set app environment"
            },
            {
              "id": "t-svc",
              "label": "Ensure nginx service running"
            }
          ],
          "solution": {
            "which": "t-env"
          }
        },
        {
          "kind": "select",
          "key": "idemReason",
          "label": "Why does it violate idempotency?",
          "options": [
            {
              "id": "r-append",
              "label": "It appends a line to a file on every run — state keeps changing even when the desired state is already met"
            },
            {
              "id": "r-shell",
              "label": "It uses the shell module, and shell tasks are always non-idempotent"
            },
            {
              "id": "r-allhosts",
              "label": "It runs on all hosts in the inventory"
            },
            {
              "id": "r-become",
              "label": "It runs with become: true"
            }
          ],
          "solution": "r-append"
        }
      ],
      "hints": [
        "Which task’s output would be DIFFERENT if you ran the playbook twice in a row?",
        "Check ansible-run.txt: a file grows by one line every run (41 lines already). Find the task doing `>>`.",
        "“Set app environment” uses shell echo >> — an append that changes state on every pass. (Careful: shell is not ALWAYS non-idempotent — the append pattern is the violation.)"
      ],
      "why": "Idempotency is THE config-management invariant: re-running must change nothing when reality already matches the playbook. Non-idempotent tasks churn systems, pollute logs and hide real drift. It is the most-tested Ansible concept on Cloud+.",
      "next": "The fix is a purpose-built idempotent module — ansible.builtin.lineinfile with state=present. You will pick that fix in the Signal Check; note how modules encode “safe re-run” semantics."
    },
    {
      "id": "OBJ-M8",
      "mode": "medium",
      "station": "configure",
      "pillar": "P3",
      "title": "Hunt the plaintext DB credential and choose the correct handling.",
      "context": "A password is sitting in plain sight in the pipeline evidence. Find it, then choose the right response — there is a tempting wrong answer.",
      "anchor": "Coverage C4 · F1 (secrets in code)",
      "widgets": [
        {
          "kind": "pair",
          "key": "secretLoc",
          "leftLabel": "Finding",
          "rightLabel": "Where is the plaintext DB credential exposed?",
          "left": [
            {
              "id": "where",
              "label": "Location of the plaintext DB password"
            }
          ],
          "right": [
            {
              "id": "l-site",
              "label": "site.yml — the “Sync app credentials” task writes db_password into a file"
            },
            {
              "id": "l-git",
              "label": "deploy-credentials.txt — the registry token committed to git"
            },
            {
              "id": "l-jf",
              "label": "Jenkinsfile — the echo line prints the registry token"
            },
            {
              "id": "l-notes",
              "label": "jenkins-notes.txt — authentication disabled on the controller"
            }
          ],
          "solution": {
            "where": "l-site"
          }
        },
        {
          "kind": "select",
          "key": "secretFix",
          "label": "What is the correct handling?",
          "options": [
            {
              "id": "f-vault",
              "label": "Rotate the password, move it to Ansible Vault / a K8s Secret, reference it at runtime — never write values into the playbook"
            },
            {
              "id": "f-perm",
              "label": "Leave it in the playbook but restrict file permissions to 0640"
            },
            {
              "id": "f-comment",
              "label": "Move it into a YAML comment so it is less visible"
            },
            {
              "id": "f-b64",
              "label": "Base64-encode it inside the playbook"
            }
          ],
          "solution": "f-vault"
        }
      ],
      "hints": [
        "Search site.yml for a task whose `content:` contains a password string.",
        "“Sync app credentials” literally writes db_password=Sup3rS3cret! onto every web host — from a version-controlled file.",
        "Answer: it is the “Sync app credentials” task in site.yml; the only real fix is rotate + vault/Secret. Permissions, comments and base64 change nothing about the exposure."
      ],
      "why": "Plaintext secrets in IaC means every reader, clone and mirror of the repo owns your database. Even with 0640 on the deployed file, the SOURCE file stays readable forever — git history never forgets. This crosses directly into CV0-004’s security domain.",
      "next": "Defenders: rotate first (assume read), then vault it (Ansible Vault / K8s Secret + RBAC), and add repo secret-scanning so the next one is caught at push time. The git token and console echo you saw are more exposures — the Hard sweep counts them."
    },
    {
      "id": "OBJ-M9",
      "mode": "medium",
      "station": "operate",
      "pillar": "P3",
      "title": "The train stalled last night — diagnose from the evidence.",
      "context": "Read build-console-112.txt (BUILD station) and kubectl-events.txt (ORCHESTRATE station). One stage failed; the cluster only shows the echo of it.",
      "anchor": "Coverage B4 · D5 (log/evidence triage, symptom vs cause)",
      "widgets": [
        {
          "kind": "select",
          "key": "failStage",
          "label": "Which stage failed first?",
          "options": [
            {
              "id": "st-checkout",
              "label": "Checkout"
            },
            {
              "id": "st-tests",
              "label": "Lint & Unit Tests"
            },
            {
              "id": "st-build",
              "label": "Build Image"
            },
            {
              "id": "st-push",
              "label": "Push"
            },
            {
              "id": "st-deploy",
              "label": "Deploy"
            }
          ],
          "solution": "st-push"
        },
        {
          "kind": "select",
          "key": "failCause",
          "label": "What is the root cause?",
          "options": [
            {
              "id": "c-token",
              "label": "The registry rejected the ci-bot login — the stored credential was expired/revoked"
            },
            {
              "id": "c-tag",
              "label": "The image tag had a typo"
            },
            {
              "id": "c-dockerfile",
              "label": "The Dockerfile failed to build"
            },
            {
              "id": "c-disk",
              "label": "The cluster ran out of disk"
            }
          ],
          "solution": "c-token"
        },
        {
          "kind": "select",
          "key": "failSymptom",
          "label": "What downstream symptom does Kubernetes show?",
          "options": [
            {
              "id": "sy-pull",
              "label": "ImagePullBackOff on web-frontend pods — the image never made it to the registry"
            },
            {
              "id": "sy-crash",
              "label": "CrashLoopBackOff from a failing health probe"
            },
            {
              "id": "sy-oom",
              "label": "OOMKilled payment pods"
            },
            {
              "id": "sy-node",
              "label": "Node NotReady"
            }
          ],
          "solution": "sy-pull"
        }
      ],
      "hints": [
        "The console names the failing stage explicitly — and one earlier line shows tests passing.",
        "“denied: requested access to the resource is denied” right after a docker login is a credential rejection, not a build error.",
        "Stage = Push · cause = rejected/expired ci-bot registry credential · symptom = ImagePullBackOff (pods pulling an image that was never published)."
      ],
      "why": "Triage discipline: separate the FIRST failing stage from downstream echoes. Tests passed, the image built fine — the push was denied by the registry (credential), and Kubernetes’ ImagePullBackOff is just the cluster reporting the missing artifact. Fixing the pods would fix nothing.",
      "next": "Defenders/SREs: fail fast at the earliest failing stage and check credentials when “denied” appears; treat cluster symptoms as clues pointing upstream. Then rotate the credential — which matters double here, since that token also lives in git."
    },
    {
      "id": "OBJ-M10",
      "mode": "medium",
      "station": "build",
      "pillar": "P4",
      "title": "Set the six Jenkins controls to their recommended state.",
      "context": "jenkins-notes.txt describes how the controller is running today. Flip each toggle to what a hardened pipeline should look like.",
      "anchor": "Coverage B5 · F2 (pipeline hardening)",
      "widgets": [
        {
          "kind": "toggles",
          "key": "jenkinsHardening",
          "options": [
            {
              "id": "h-auth",
              "label": "Authentication + MFA on the controller"
            },
            {
              "id": "h-net",
              "label": "Restrict port 8080 to the internal / agent network"
            },
            {
              "id": "h-auto",
              "label": "Auto-install every new plugin version immediately"
            },
            {
              "id": "h-echo",
              "label": "Print full secret values into build logs for easier debugging"
            },
            {
              "id": "h-pin",
              "label": "Pin plugins to reviewed, approved versions"
            },
            {
              "id": "h-admin",
              "label": "Grant every project full admin rights on the controller"
            }
          ],
          "solution": {
            "h-auth": true,
            "h-net": true,
            "h-auto": false,
            "h-echo": false,
            "h-pin": true,
            "h-admin": false
          }
        }
      ],
      "hints": [
        "Two toggles protect access, one reduces supply-chain risk, and two reduce credential exposure.",
        "ON: auth+MFA, network restriction, plugin pinning. OFF: auto-install, secrets in logs, universal admin.",
        "Recommended: auth+MFA ✓ · internal-only 8080 ✓ · pinned plugins ✓ · auto-update ✗ · secrets in logs ✗ · admin for everyone ✗."
      ],
      "why": "A CI server is a privileged robot: it holds credentials and can execute code on your whole estate. Unauthenticated dashboards, auto-installed plugins, echoed secrets and blanket admin are the four horsemen of pipeline breaches — and the audit feed shows someone already walked through the open door (anonymous build #113).",
      "next": "Map it to ATT&CK mitigations in the Handover Notes: M1032 (MFA), M1030/M1035 (network restriction), M1045+review (pinned, verified plugins), M1054 (secure software configuration). Verify after change: attempt an anonymous trigger — it must fail."
    },
    {
      "id": "OBJ-M11",
      "mode": "medium",
      "station": "orchestrate",
      "pillar": "P4",
      "title": "Pick the three correct actions for the Kubernetes DB credential.",
      "context": "secret-config.txt shows how nimbuscart stores the DB password. Choose the three correct practices.",
      "anchor": "Coverage D4 · D6 (K8s secrets & RBAC)",
      "widgets": [
        {
          "kind": "multi",
          "key": "k8sSecret",
          "label": "Select exactly the three correct actions",
          "selectCount": 3,
          "options": [
            {
              "id": "k-obj",
              "label": "Store the credential in a Secret object, not a ConfigMap"
            },
            {
              "id": "k-atrest",
              "label": "Enable encryption at rest (etcd) for Secret data"
            },
            {
              "id": "k-rbac",
              "label": "Restrict which identities can read the Secret with RBAC"
            },
            {
              "id": "k-b64",
              "label": "Base64-encode it and consider the value safely encrypted"
            },
            {
              "id": "k-git",
              "label": "Commit the Secret manifest to git for traceability"
            },
            {
              "id": "k-all",
              "label": "Give every namespace admin read access to all Secrets"
            }
          ],
          "solution": [
            "k-obj",
            "k-atrest",
            "k-rbac"
          ]
        }
      ],
      "hints": [
        "One distractor confuses encoding with encryption; another confuses git traceability with safety.",
        "The three correct ones: right object type, encryption at rest, least-privilege read access.",
        "Correct: Secret object + encryption at rest + RBAC-restricted reads. Base64 ≠ encryption; committing Secrets to git is a leak; broad read access defeats the point."
      ],
      "why": "Secrets are the platform’s designated sensitive-data object, and their safety is a stack: correct object + encryption at rest + RBAC + no git. The base64 trap appears on the exam constantly — decoding is a one-liner, so anyone with read access has the plaintext.",
      "next": "Verify controls like a defender: `kubectl get secrets` with a non-privileged identity must fail; audit reads of sensitive Secrets via the API audit log. Rotate any value that was ever readable too broadly."
    },
    {
      "id": "OBJ-M12",
      "mode": "medium",
      "station": "plan",
      "pillar": "P4",
      "title": "Dispatch three scenarios to the right machine.",
      "context": "Tool selection is the exam’s favorite scenario format. Each scenario has exactly one best tool.",
      "anchor": "Coverage E2 · A4 (tool selection)",
      "widgets": [
        {
          "kind": "pair",
          "key": "toolScenario",
          "leftLabel": "Scenario",
          "rightLabel": "Best tool",
          "left": [
            {
              "id": "sc1",
              "label": "“Run lint, unit tests and build an artifact every time a developer pushes a commit.”"
            },
            {
              "id": "sc2",
              "label": "“Install and enforce one identical nginx config on 40 VMs — safely re-runnable, no agents.”"
            },
            {
              "id": "sc3",
              "label": "“Run 3 replicas of a containerized app, restart crashed instances, scale on load, zero-downtime rollouts.”"
            }
          ],
          "right": [
            {
              "id": "tl-jenkins",
              "label": "Jenkins"
            },
            {
              "id": "tl-ansible",
              "label": "Ansible"
            },
            {
              "id": "tl-k8s",
              "label": "Kubernetes"
            }
          ],
          "solution": {
            "sc1": "tl-jenkins",
            "sc2": "tl-ansible",
            "sc3": "tl-k8s"
          }
        }
      ],
      "hints": [
        "Keywords: “on every push” → CI server · “40 VMs, no agents, re-runnable” → config management · “replicas, self-heal, scale” → orchestration.",
        "Re-run-safe host config at fleet scale is Ansible’s exact pitch; declared-replica workloads are Kubernetes’.",
        "Answers: push-triggered build/test → Jenkins · fleet-wide idempotent config → Ansible · container fleet with self-healing → Kubernetes."
      ],
      "why": "The exam presents overlapping stories (“automate X”) and scores whether you pick by CAPABILITY: event-triggered build/test = CI server; agentless idempotent host config = configuration management; declared-state container operations = orchestration.",
      "next": "Residual-risk thinking: real estates combine all three — Jenkins builds the image, Ansible readies the hosts, Kubernetes runs it. Saying “Kubernetes does it all” is the failure mode the exam punishes."
    },
    {
      "id": "OBJ-H1",
      "mode": "hard",
      "station": "build",
      "pillar": "P2",
      "title": "Reconstruct the release-#112 failure chain — stage, cause, echo, and the exact tag.",
      "anchor": "Coverage B4 · D5 · A1 (cross-station triage)",
      "widgets": [
        {
          "kind": "select",
          "key": "h1Stage",
          "label": "First failing stage",
          "options": [
            {
              "id": "s1-checkout",
              "label": "Checkout"
            },
            {
              "id": "s1-tests",
              "label": "Lint & Unit Tests"
            },
            {
              "id": "s1-build",
              "label": "Build Image"
            },
            {
              "id": "s1-push",
              "label": "Push"
            },
            {
              "id": "s1-deploy",
              "label": "Deploy"
            }
          ],
          "solution": "s1-push"
        },
        {
          "kind": "select",
          "key": "h1Cause",
          "label": "Root cause",
          "options": [
            {
              "id": "c1-token",
              "label": "ci-bot registry credential expired/revoked — login denied"
            },
            {
              "id": "c1-lint",
              "label": "A lint warning failed the build"
            },
            {
              "id": "c1-tag",
              "label": "Wrong image tag in the manifest"
            },
            {
              "id": "c1-node",
              "label": "A node ran out of memory during deploy"
            }
          ],
          "solution": "c1-token"
        },
        {
          "kind": "select",
          "key": "h1Echo",
          "label": "Downstream echo in the cluster",
          "options": [
            {
              "id": "e1-pull",
              "label": "ImagePullBackOff — pods retry a pull of an image that was never pushed"
            },
            {
              "id": "e1-crash",
              "label": "CrashLoopBackOff on the payment service"
            },
            {
              "id": "e1-evict",
              "label": "Pod evictions from node pressure"
            },
            {
              "id": "e1-none",
              "label": "None — the cluster was unaffected"
            }
          ],
          "solution": "e1-pull"
        },
        {
          "kind": "text",
          "key": "h1Tag",
          "fields": [
            {
              "key": "tag",
              "label": "The exact image tag that failed to push/pull",
              "placeholder": "x.y.z",
              "answers": [
                "1.4.2",
                "v1.4.2"
              ]
            }
          ]
        }
      ],
      "hints": [
        "Four sources, one chain: console → registry denial → cluster events → manifest tag."
      ],
      "why": "Senior triage = assembling a chain from multiple sources: tests passed (console), image built (console), push denied by registry (console), pods BackOff pulling 1.4.2 (events), manifest asks for 1.4.2 (deployment.yaml). The credential is the root; everything else is echo. Note the deliberate distractors: lint warnings, a healthy payment-svc, a reconciled manual scale.",
      "next": "Write the incident timeline in that order and hand the credential rotation to the owner of registry-ci-token. Then re-run — and re-check WHERE that token also exists (the git file)."
    },
    {
      "id": "OBJ-H2",
      "mode": "hard",
      "station": "operate",
      "pillar": "P3",
      "title": "Misconfiguration sweep — select EXACTLY the six real findings.",
      "anchor": "Coverage F1–F3 · B2 · D4 (full-line weakness sweep)",
      "widgets": [
        {
          "kind": "multi",
          "key": "h2Sweep",
          "label": "Six of these are real, evidenced findings. The rest are good practice or irrelevant — pick only the six.",
          "selectCount": 6,
          "options": [
            {
              "id": "F-GIT02",
              "label": "GIT-02 · deploy credentials committed to the repo (config/deploy-credentials.txt)"
            },
            {
              "id": "F-JEN03",
              "label": "JEN-03 · pipeline echoes the registry token into build logs (Jenkinsfile, Push stage)"
            },
            {
              "id": "F-JEN05",
              "label": "JEN-05 · controller authentication disabled (jenkins-notes.txt / anonymous build #113)"
            },
            {
              "id": "F-PLA01",
              "label": "PLA-01 · plaintext db_password written by the playbook (site.yml)"
            },
            {
              "id": "F-K8S04",
              "label": "K8S-04 · web container runs with privileged: true (deployment.yaml)"
            },
            {
              "id": "F-K8S06",
              "label": "K8S-06 · pipeline identity previously cluster-admin cluster-wide (rbac.yaml review note)"
            },
            {
              "id": "D-SEC1",
              "label": "OK-A · db credential stored as a Secret object with RBAC + encryption at rest"
            },
            {
              "id": "D-SEC2",
              "label": "OK-B · restartPolicy: Always on pods"
            },
            {
              "id": "D-SEC3",
              "label": "OK-C · inventory uses SSH key authentication, no passwords"
            },
            {
              "id": "D-SEC4",
              "label": "OK-D · Jenkins plugins pinned to approved versions (commit a1f9c2e)"
            },
            {
              "id": "D-SEC5",
              "label": "OK-E · liveness/readiness probes configured on the web container"
            },
            {
              "id": "D-OFF1",
              "label": "OFF-1 · badge-reader maintenance bulletin from Office IT"
            },
            {
              "id": "D-PERF1",
              "label": "OFF-2 · steady CPU/memory on the web tier"
            }
          ],
          "solution": [
            "F-GIT02",
            "F-JEN03",
            "F-JEN05",
            "F-PLA01",
            "F-K8S04",
            "F-K8S06"
          ]
        }
      ],
      "hints": [
        "Open every file across all stations before answering; the OK- decoys are practices this very fleet already does right."
      ],
      "why": "A sweep is a completeness exercise: six genuine weaknesses (committed credentials, token in logs, no auth, plaintext password in IaC, privileged container, over-broad CI identity) vs decoys that are either correct practice (Secret+RBAC, probes, pinned plugins, SSH keys) or irrelevant (office bulletins, healthy metrics). Privileged: true with a “debugging” comment is a classic real-world misconfig.",
      "next": "Triage order for the six: rotate leaked credentials (GIT-02/JEN-03) → restore auth (JEN-05) → remove plaintext secret (PLA-01) → drop privileged (K8S-04) → keep least-privilege RBAC (K8S-06). Each maps to a mitigation ID in the Handover Notes."
    },
    {
      "id": "OBJ-H3",
      "mode": "hard",
      "station": "plan",
      "pillar": "P2",
      "title": "Artifact attribution — map four anonymous snippets to tool AND artifact type.",
      "anchor": "Coverage C2 · B1 · D3 · A1 (artifact recognition)",
      "widgets": [
        {
          "kind": "pair",
          "key": "h3Tool",
          "leftLabel": "Snippet",
          "rightLabel": "Owning tool",
          "left": [
            {
              "id": "snip-a",
              "label": "A · “notify: restart nginx … become: true”"
            },
            {
              "id": "snip-b",
              "label": "B · “Started by webhook from github/nimbuscart-web (push)”"
            },
            {
              "id": "snip-c",
              "label": "C · “strategy: rollingUpdate … maxSurge: 1, maxUnavailable: 0”"
            },
            {
              "id": "snip-d",
              "label": "D · “b7aa901 chore: add deploy credentials for pipeline (r.silva)”"
            }
          ],
          "right": [
            {
              "id": "tool-git",
              "label": "Git"
            },
            {
              "id": "tool-jenkins",
              "label": "Jenkins"
            },
            {
              "id": "tool-ansible",
              "label": "Ansible"
            },
            {
              "id": "tool-k8s",
              "label": "Kubernetes"
            }
          ],
          "solution": {
            "snip-a": "tool-ansible",
            "snip-b": "tool-jenkins",
            "snip-c": "tool-k8s",
            "snip-d": "tool-git"
          }
        },
        {
          "kind": "pair",
          "key": "h3Type",
          "leftLabel": "Snippet",
          "rightLabel": "Artifact type",
          "left": [
            {
              "id": "snip-a2",
              "label": "A"
            },
            {
              "id": "snip-b2",
              "label": "B"
            },
            {
              "id": "snip-c2",
              "label": "C"
            },
            {
              "id": "snip-d2",
              "label": "D"
            }
          ],
          "right": [
            {
              "id": "type-playbook",
              "label": "Playbook (YAML tasks/handlers)"
            },
            {
              "id": "type-console",
              "label": "Build console / trigger line"
            },
            {
              "id": "type-manifest",
              "label": "Cluster manifest (strategy block)"
            },
            {
              "id": "type-commit",
              "label": "Commit history entry"
            }
          ],
          "solution": {
            "snip-a2": "type-playbook",
            "snip-b2": "type-console",
            "snip-c2": "type-manifest",
            "snip-d2": "type-commit"
          }
        }
      ],
      "hints": [
        "Syntax is the fingerprint: notify/become → playbook · “Started by webhook” → CI console · strategy/maxSurge → manifest · hash+author → commit."
      ],
      "why": "This is the recognition skill in its purest form: identifying WHICH tool a fragment belongs to from syntax alone — handlers & become (Ansible), “Started by…” (Jenkins), rollingUpdate strategy (Kubernetes), commit hash + author (Git). Incident responders do this constantly on unknown artifacts.",
      "next": "C is also load-bearing knowledge: maxUnavailable: 0 + maxSurge: 1 = zero-downtime rollout. Commit D is the same one that leaked the credentials — artifacts tell stories."
    },
    {
      "id": "OBJ-H4",
      "mode": "hard",
      "station": "plan",
      "pillar": "P1",
      "title": "Architecture decision — assign each platform requirement to its owning tool, and pick the three valid rationales.",
      "anchor": "Coverage E1 · E2 · C1 (interlock + selection reasoning)",
      "widgets": [
        {
          "kind": "pair",
          "key": "h4Map",
          "leftLabel": "Requirement",
          "rightLabel": "Owning tool",
          "left": [
            {
              "id": "r1",
              "label": "One identical sshd policy across 200 mixed VMs, re-applied safely"
            },
            {
              "id": "r2",
              "label": "Self-healing, horizontally scaled container workloads with rolling releases"
            },
            {
              "id": "r3",
              "label": "Automated test + package of every commit"
            },
            {
              "id": "r4",
              "label": "One versioned, reviewable source of truth for all of the above"
            }
          ],
          "right": [
            {
              "id": "o-git",
              "label": "Git"
            },
            {
              "id": "o-jenkins",
              "label": "Jenkins"
            },
            {
              "id": "o-ansible",
              "label": "Ansible"
            },
            {
              "id": "o-k8s",
              "label": "Kubernetes"
            }
          ],
          "solution": {
            "r1": "o-ansible",
            "r2": "o-k8s",
            "r3": "o-jenkins",
            "r4": "o-git"
          }
        },
        {
          "kind": "multi",
          "key": "h4Why",
          "label": "Select the three correct rationales",
          "selectCount": 3,
          "options": [
            {
              "id": "w1",
              "label": "Ansible needs no agent on targets — SSH reachability and an inventory are enough"
            },
            {
              "id": "w2",
              "label": "Kubernetes reconciles declared desired state continuously — that IS self-healing"
            },
            {
              "id": "w3",
              "label": "Jenkins is built around event-triggered (webhook) build/test automation"
            },
            {
              "id": "w4",
              "label": "Ansible is the best tool for running and scaling containers"
            },
            {
              "id": "w5",
              "label": "Jenkins replaces the need for Kubernetes once pipelines are mature"
            },
            {
              "id": "w6",
              "label": "Git executes the playbooks on schedule"
            }
          ],
          "solution": [
            "w1",
            "w2",
            "w3"
          ]
        }
      ],
      "hints": [
        "Three of the rationales are true capability statements; three are category errors."
      ],
      "why": "Requirements map to capabilities: agentless idempotent fleet config (Ansible), continuous desired-state reconciliation (Kubernetes), webhook-triggered build automation (Jenkins), and versioned truth (Git). The wrong options are classic confusions: Ansible does not orchestrate containers, Jenkins does not replace Kubernetes, Git stores — it does not execute.",
      "next": "Design reviews go smoother when you name the OWNER per requirement — and the interlock: Git holds the Jenkinsfile, the playbook and the manifest that the other tools consume."
    },
    {
      "id": "OBJ-H5",
      "mode": "hard",
      "station": "operate",
      "pillar": "P4",
      "title": "IR-1142 — order the containment steps, name the abused credential, and match the ATT&CK technique.",
      "anchor": "Coverage F7 · F2 · D4 · D5 (incident response)",
      "widgets": [
        {
          "kind": "order",
          "key": "h5Sequence",
          "label": "Click the containment steps in the correct order",
          "items": [
            {
              "id": "c-rotate",
              "label": "Rotate/replace the leaked ci-bot + registry tokens"
            },
            {
              "id": "c-pod",
              "label": "Delete the rogue pod crypto-miner-77"
            },
            {
              "id": "c-auth",
              "label": "Re-enable dashboard authentication (+MFA)"
            },
            {
              "id": "c-git",
              "label": "Purge deploy-credentials.txt from git history; re-clone agents"
            },
            {
              "id": "c-rbac",
              "label": "Verify least-privilege RBAC for ci-bot (no wildcards elsewhere)"
            },
            {
              "id": "c-audit",
              "label": "Review k8s audit logs for every action taken by the ci-bot token"
            }
          ],
          "solution": [
            "c-rotate",
            "c-pod",
            "c-auth",
            "c-git",
            "c-rbac",
            "c-audit"
          ]
        },
        {
          "kind": "select",
          "key": "h5Cred",
          "label": "Which credential did the attacker abuse?",
          "options": [
            {
              "id": "cr-sa",
              "label": "The ci-bot service-account token, leaked in the committed credentials file"
            },
            {
              "id": "cr-admin",
              "label": "An admin user’s password"
            },
            {
              "id": "cr-laptop",
              "label": "A stolen developer laptop"
            },
            {
              "id": "cr-root",
              "label": "The cloud provider root key"
            }
          ],
          "solution": "cr-sa"
        },
        {
          "kind": "select",
          "key": "h5Tech",
          "label": "Which ATT&CK technique best matches “attacker uses the leaked ci-bot cloud/service-account token to create the pod”?",
          "options": [
            {
              "id": "t-valid",
              "label": "T1078.004 — Valid Accounts: Cloud Accounts"
            },
            {
              "id": "t-supply",
              "label": "T1195.001 — Compromise Software Dependencies and Development Tools"
            },
            {
              "id": "t-exec",
              "label": "T1059 — Command and Scripting Interpreter"
            },
            {
              "id": "t-disc",
              "label": "T1613 — Container and Resource Discovery"
            }
          ],
          "solution": "t-valid"
        }
      ],
      "hints": [
        "Stop the bleeding (credentials) before cleanup (pod), then close the door (auth), then remove the source (git), then reduce blast radius, then investigate."
      ],
      "why": "Sequence logic: rotated tokens instantly invalidate everything the attacker holds (and any use lights up the audit log); deleting the pod removes the active threat; auth closes the anonymous door; purging git removes the leak source; RBAC verification limits the next token abuse; the audit review last tells you the full blast radius. The abused credential is a valid CLOUD account — T1078.004; (deploying the miner itself would be T1610 Deploy Container — see Handover).",
      "next": "After containment: keep ci-bot namespaced (done 2026-11-05), add alerting on “SA creates pod outside pipeline” (OBJ-H10 builds that rule), and consider short-lived tokens so a leaked one expires on its own."
    },
    {
      "id": "OBJ-H6",
      "mode": "hard",
      "station": "build",
      "pillar": "P4",
      "title": "Hardening plan — select exactly the six controls that apply to THIS CI/CD + orchestration stack.",
      "anchor": "Coverage B5 · F1 · F3 · F4 (control selection)",
      "widgets": [
        {
          "kind": "multi",
          "key": "h6Plan",
          "label": "Twelve controls; six are in scope for the pipeline + platform, six belong to other worlds. Pick the six.",
          "selectCount": 6,
          "options": [
            {
              "id": "p-rbac",
              "label": "Least-privilege RBAC for the deploy-bot identity (namespaced, no wildcards)"
            },
            {
              "id": "p-scan",
              "label": "Secret-scanning on the repository to catch committed credentials at push time"
            },
            {
              "id": "p-mask",
              "label": "Mask/redact secrets in build logs and forbid echoing credentials"
            },
            {
              "id": "p-etcd",
              "label": "Encryption at rest for Kubernetes Secrets (etcd)"
            },
            {
              "id": "p-mfa",
              "label": "MFA/authentication on every management console (Jenkins, dashboards)"
            },
            {
              "id": "p-pin",
              "label": "Pin and review plugin/image versions; verify provenance before install"
            },
            {
              "id": "p-waf",
              "label": "Deploy a WAF in front of the marketing website"
            },
            {
              "id": "p-badge",
              "label": "Schedule badge-reader maintenance in the lobby"
            },
            {
              "id": "p-spam",
              "label": "Tune the email spam filter thresholds"
            },
            {
              "id": "p-av",
              "label": "Endpoint antivirus on staff laptops"
            },
            {
              "id": "p-vpn",
              "label": "Reconfigure VPN split-tunneling for remote staff"
            },
            {
              "id": "p-hr",
              "label": "Disk encryption for the HR database"
            }
          ],
          "solution": [
            "p-rbac",
            "p-scan",
            "p-mask",
            "p-etcd",
            "p-mfa",
            "p-pin"
          ]
        }
      ],
      "hints": [
        "Every correct control protects one of: pipeline identity, secrets, logs, consoles, or the supply chain."
      ],
      "why": "Control selection is scoping: the six in-scope controls map to this stack’s real surfaces — CI identity (RBAC), repo hygiene (secret scanning), log hygiene (masking), platform secrets (etcd encryption), console access (MFA), supply chain (pinning/verification). The six distractors are legitimate controls for OTHER systems — WAFs and badge readers don’t protect a build server.",
      "next": "Each maps to an ATT&CK mitigation in the Handover Notes (M1018/M1026, M1054, M1041, M1032, M1045/M1051, M1047). A control without verification is a wish — define the test for each."
    },
    {
      "id": "OBJ-H7",
      "mode": "hard",
      "station": "configure",
      "pillar": "P2",
      "title": "Diff review — classify five playbook-v2 changes as safer, riskier, or neutral.",
      "anchor": "Coverage C3–C5 · F1 (change analysis)",
      "widgets": [
        {
          "kind": "sort",
          "key": "h7Diff",
          "items": [
            {
              "id": "d1",
              "label": "D1 · inline password task replaced by `vars_files: vault/db.yml` (Vault reference)"
            },
            {
              "id": "d2",
              "label": "D2 · the append `shell` task replaced by `ansible.builtin.lineinfile` (state=present)"
            },
            {
              "id": "d3",
              "label": "D3 · `no_log: true` removed from the Vault-loading task"
            },
            {
              "id": "d4",
              "label": "D4 · `hosts: web` widened to `hosts: all`"
            },
            {
              "id": "d5",
              "label": "D5 · a task’s `name:` label reworded (no behavior change)"
            }
          ],
          "categories": [
            {
              "id": "safer",
              "label": "Safer"
            },
            {
              "id": "riskier",
              "label": "Riskier"
            },
            {
              "id": "neutral",
              "label": "Neutral"
            }
          ],
          "solution": {
            "d1": "safer",
            "d2": "safer",
            "d3": "riskier",
            "d4": "riskier",
            "d5": "neutral"
          }
        }
      ],
      "hints": [
        "Two changes fix earlier findings; two widen exposure; one is cosmetic."
      ],
      "why": "D1 removes the plaintext secret (PLA-01) — safer. D2 makes re-runs stateless (idempotency) — safer. D3 means task output (potentially sensitive values) can land in logs again — riskier. D4 extends blast radius from the web group to every inventoried host — riskier even if the tasks are “safe”. D5 changes nothing functional — neutral.",
      "next": "Review discipline: label every diff with a risk direction and a reason before merge. `hosts: all` in a fleet playbook is how a “small fix” becomes a fleet-wide incident."
    },
    {
      "id": "OBJ-H8",
      "mode": "hard",
      "station": "configure",
      "pillar": "P3",
      "title": "Drift case — identify the host, the cause, and the correct cure.",
      "anchor": "Coverage F6 · A6 (drift detection & GitOps remediation)",
      "widgets": [
        {
          "kind": "text",
          "key": "h8Host",
          "fields": [
            {
              "key": "host",
              "label": "Which host drifted?",
              "placeholder": "web-0x",
              "answers": [
                "web-03",
                "web-03.nimbuscart.example"
              ]
            }
          ]
        },
        {
          "kind": "select",
          "key": "h8Cause",
          "label": "Root cause of the drift",
          "options": [
            {
              "id": "x-hand",
              "label": "A manual hotfix was applied on the host, bypassing the playbook"
            },
            {
              "id": "x-bug",
              "label": "The playbook contains a syntax error"
            },
            {
              "id": "x-net",
              "label": "A network outage prevented the last run"
            },
            {
              "id": "x-version",
              "label": "nginx upgraded itself overnight"
            }
          ],
          "solution": "x-hand"
        },
        {
          "kind": "select",
          "key": "h8Fix",
          "label": "Correct remediation",
          "options": [
            {
              "id": "f-reapply",
              "label": "Bring the change INTO the pipeline (commit to the playbook) or revert it — then re-apply from Git; never hand-edit production"
            },
            {
              "id": "f-live",
              "label": "Copy the live config from web-03 onto the other hosts"
            },
            {
              "id": "f-ignore",
              "label": "Ignore it — desired-state tools self-correct eventually"
            },
            {
              "id": "f-wipe",
              "label": "Delete web-03 and rebuild it from scratch"
            }
          ],
          "solution": "f-reapply"
        }
      ],
      "hints": [
        "The drift report names the host and quotes a comment left by a human hand."
      ],
      "why": "Drift = reality diverging from declared state. Evidence: hash mismatch on web-03, no matching playbook commit, and a comment “quick perf tweak by hand”. The cure respects the source of truth: absorb the change into the playbook (if wanted) or revert — then re-apply from Git. Copying live state would spread the drift; ignoring it waits for a silent overwrite.",
      "next": "Prevention beats detection: restrict write access to prod hosts, alert on config-hash mismatches (this scan caught it), and make the pipeline the only writer. That is the GitOps mindset."
    },
    {
      "id": "OBJ-H9",
      "mode": "hard",
      "station": "plan",
      "pillar": "P4",
      "title": "Four overlap-heavy scenarios — pick the best tool each time.",
      "anchor": "Coverage E2 · D3 · C1 (selection under ambiguity)",
      "widgets": [
        {
          "kind": "pair",
          "key": "h9Pick",
          "leftLabel": "Scenario",
          "rightLabel": "Best tool",
          "left": [
            {
              "id": "q1",
              "label": "“Ship a new container version with zero downtime and instant rollback.”"
            },
            {
              "id": "q2",
              "label": "“Enforce one approved sshd_config on 200 hosts, including ones no one remembers.”"
            },
            {
              "id": "q3",
              "label": "“On every pull request: lint, unit-test and publish a versioned artifact.”"
            },
            {
              "id": "q4",
              "label": "“Give the storefront a stable internal address that load-balances across its pods.”"
            }
          ],
          "right": [
            {
              "id": "b-jenkins",
              "label": "Jenkins"
            },
            {
              "id": "b-ansible",
              "label": "Ansible"
            },
            {
              "id": "b-k8s",
              "label": "Kubernetes"
            },
            {
              "id": "b-git",
              "label": "Git"
            }
          ],
          "solution": {
            "q1": "b-k8s",
            "q2": "b-ansible",
            "q3": "b-jenkins",
            "q4": "b-k8s"
          }
        }
      ],
      "hints": [
        "“Rollout/rollback across replicas” and “stable address across pods” are platform features, not CI or config pushes."
      ],
      "why": "Q1 is rolling updates (maxSurge/maxUnavailable — the manifest you read in M5) → Kubernetes. Q2 is idempotent fleet config → Ansible. Q3 is commit-triggered build automation → Jenkins. Q4 is a Kubernetes Service — stable VIP + load balancing across pods. Overlaps (Jenkins CAN deploy; Ansible CAN copy configs) are the trap; pick by the capability the exam names.",
      "next": "Justify choices aloud in the capability language — “declared state”, “idempotent modules”, “event-triggered pipeline” — that is exactly how Cloud+ scenario items are worded."
    },
    {
      "id": "OBJ-H10",
      "mode": "hard",
      "station": "orchestrate",
      "pillar": "P3",
      "title": "Detection engineering — build the audit alert that catches the next rogue pod.",
      "anchor": "Coverage F5 · D5 (detection engineering)",
      "widgets": [
        {
          "kind": "multi",
          "key": "h10Parts",
          "label": "Select the three signal components a rogue-pod alert needs",
          "selectCount": 3,
          "options": [
            {
              "id": "a-sa",
              "label": "subject = pipeline service account (ci-bot) performing pod CREATE"
            },
            {
              "id": "a-owner",
              "label": "object pod NOT owned by any Deployment/ReplicaSet (created outside the pipeline)"
            },
            {
              "id": "a-src",
              "label": "source IP outside the known build-agent subnet (198.51.100.77 ∉ 10.20.0.0/24)"
            },
            {
              "id": "a-verb",
              "label": "any `get`/`list` verb in the namespace"
            },
            {
              "id": "a-any",
              "label": "any action by ANY service account in the namespace"
            },
            {
              "id": "a-ua",
              "label": "the kubectl user-agent string being kubectl/v1.30.1"
            }
          ],
          "solution": [
            "a-sa",
            "a-owner",
            "a-src"
          ]
        },
        {
          "kind": "select",
          "key": "h10Source",
          "label": "Which data source carries these signals?",
          "options": [
            {
              "id": "src-audit",
              "label": "Kubernetes API-server audit logs"
            },
            {
              "id": "src-hr",
              "label": "The HR database"
            },
            {
              "id": "src-dns",
              "label": "DNS query logs"
            },
            {
              "id": "src-wifi",
              "label": "WiFi controller logs"
            }
          ],
          "solution": "src-audit"
        }
      ],
      "hints": [
        "A good rule is narrow: WHO (identity), WHAT (unowned object), WHERE (impossible source) — not “everything that moves”."
      ],
      "why": "The 02:14 event had three identifying signals: the pipeline identity acting OUTSIDE a pipeline run, a pod with no Deployment/ReplicaSet owner, and a source IP that is not a build agent. Any one alone can false-positive; correlated, it is a precise, low-noise rule. Generic rules (any get/list, any SA action) bury responders in noise, and the user-agent alone proves nothing.",
      "next": "Wire the rule to the API-server audit log (the source of record for pod.create with subject/srcIP), page on correlation, and test it monthly with a synthetic “rogue pod” drill. ATT&CK documents this pattern as T1610 Deploy Container; discovery chatter would map to T1613."
    }
  ],

  quiz: {
    "medium": [
      {
        "id": "mQ1",
        "prompt": "A teammate asks what Kubernetes is actually for. Best answer?",
        "options": [
          "It is a source-control platform that stores code and review history",
          "It is an agentless tool that pushes configuration to fleets over SSH",
          "It schedules, scales and self-heals containerized workloads toward a declared state",
          "It is a build server that compiles and tests every commit"
        ],
        "correct": 2,
        "explanation": "Kubernetes is container ORCHESTRATION: you declare desired state (e.g., \"3 replicas of this image\"), and it continuously schedules pods, scales them, restarts failed ones and rolls out updates. Build/test automation is Jenkins; host configuration is Ansible; code lives in Git."
      },
      {
        "id": "mQ2",
        "prompt": "Ansible is described as \"agentless\". What does that mean in practice?",
        "options": [
          "Managed hosts need no resident software; modules run temporarily over SSH",
          "Each managed host runs a permanent Ansible daemon that pulls down tasks",
          "Ansible manages cloud hosts only, never on-premises virtual machines",
          "Playbooks require every target host to expose a REST API"
        ],
        "correct": 0,
        "explanation": "Agentless is Ansible’s signature: nothing is permanently installed on the targets. The control node authenticates (typically SSH keys), copies a module over, executes it, and removes it. That is why the inventory + SSH access is all the setup a fleet needs — and why SSH-key hygiene matters."
      },
      {
        "id": "mQ3",
        "prompt": "Your pipeline stages everything for release but a release manager clicks the final production deploy. What is this?",
        "options": [
          "Continuous Deployment",
          "Continuous Delivery",
          "Continuous Integration",
          "GitOps deployment"
        ],
        "correct": 1,
        "explanation": "Continuous DELIVERY automates everything up to a human-approved production release. Continuous DEPLOYMENT removes that last human gate — every passing change ships automatically. CI alone only covers the automated build+test on every push; GitOps is a separate operating model built around git as the source of truth."
      },
      {
        "id": "mQ4",
        "prompt": "What does idempotency guarantee — and why do Cloud+ teams care?",
        "options": [
          "Tasks skip re-running unless a checksum file changes on the host",
          "The second run always reports zero changes even when config drifted",
          "The playbook caches host state and replays it from cache afterward",
          "Re-runs make no changes once hosts already match the declared state"
        ],
        "correct": 3,
        "explanation": "Idempotency is what makes config management safe to re-run: applying the same playbook twice changes nothing the second time (apt state=present, service started) — but tasks that DO change state still report \"changed\", they are not skipped. Non-idempotent tasks (e.g., a shell line that appends to a file every run) mutate state on every pass — exactly the bug pattern in the CONFIGURE station."
      },
      {
        "id": "mQ5",
        "prompt": "What starts the NimbusCart Jenkins pipeline, and where does the pipeline logic live?",
        "options": [
          "A Git push fires a webhook; pipeline logic lives in the Jenkinsfile",
          "A scheduler starts each build; the logic lives in the Jenkins UI",
          "Kubernetes detects new commits and builds the changed services itself",
          "A developer SSHes to the controller and runs the build by hand"
        ],
        "correct": 0,
        "explanation": "The chain is: developer pushes → Git fires a webhook → Jenkins starts the run defined by the Jenkinsfile in that repo. Pipeline-as-code means the pipeline definition is versioned and reviewed with the app it builds — a core DevOps-tools exam idea."
      },
      {
        "id": "mQ6",
        "prompt": "Why is a Kubernetes Secret better than a ConfigMap for the DB password — and what is the catch?",
        "options": [
          "Secrets are encrypted in git once committed through the standard workflow",
          "There is no practical difference; ConfigMaps are fine for passwords too",
          "Secrets support RBAC and encryption at rest; base64 remains only encoding",
          "Secrets rotate their values automatically every day without extra tooling"
        ],
        "correct": 2,
        "explanation": "Secrets exist to hold sensitive values and support RBAC restrictions plus etcd encryption-at-rest. The catch the exam loves: base64 is ENCODING — anyone who can read the Secret gets the plaintext. Rotate leaked values and restrict who can read them."
      }
    ],
    "hard": [
      {
        "id": "hQ1",
        "prompt": "Fix the CONFIGURE station bug: which change makes the \"Set app environment\" task idempotent?",
        "scenario": "ansible.builtin.shell: echo \"export APP_ENV=prod\" >> /etc/profile.d/app-env.sh",
        "options": [
          "Wrap the shell task with no_log: true to hide its output",
          "Add become: true so the task executes with elevated rights",
          "Quote the echo string so the shell cannot expand variables",
          "Replace the append with lineinfile (state=present), writing only when missing"
        ],
        "correct": 3,
        "explanation": "The append (>>) mutates the file on every run — 41 lines and counting in the evidence. lineinfile with state=present is the idempotent primitive: it creates/ensures the line exists and changes nothing otherwise. no_log only hides output; it does not fix behavior."
      },
      {
        "id": "hQ2",
        "prompt": "The Jenkinsfile prints the registry token to the build console. What is the correct combined response?",
        "options": [
          "Nothing — withCredentials masks every value, so the log line is harmless",
          "Remove the echo, keep masking, and rotate the token as compromised",
          "Delete the affected build logs and continue the release as planned",
          "Rename the token variable so scanners cannot find it in logs"
        ],
        "correct": 1,
        "explanation": "withCredentials does mask the variable in console output — the echo line still patterns an unnecessary exposure attempt, and any credential that touched logs or a shared file must be treated as burned: remove the print, keep masking, ROTATE. Credential hygiene beats log cleanup."
      },
      {
        "id": "hQ3",
        "prompt": "Someone ran kubectl scale --replicas=5 on a Deployment whose manifest declares replicas: 3. Shortly after, the set is back to 3. Why?",
        "options": [
          "Controllers reconcile live state toward the manifest’s declared replica count",
          "The API server automatically rolls back every manual scale command",
          "Kubernetes crashed overnight and restored the last saved cluster snapshot",
          "The HPA scaled the set down to save cluster capacity"
        ],
        "correct": 0,
        "explanation": "This is desired-state reconciliation in action: the manifest is the source of truth, controllers notice live state (5) diverging from desired (3) and correct it. The kubectl-events evidence shows exactly this pattern — and it is also why manual prod edits are pointless and the discipline is \"change the manifest, not the cluster\". No HPA exists in this fleet."
      },
      {
        "id": "hQ4",
        "prompt": "Night-shift scan finds Jenkins on jenkins.nimbuscart.example:8080 with authentication disabled. Pick the best control set.",
        "options": [
          "Leave it open until the migration ends; engineers need fast access",
          "Move the dashboard to a different port so scanners miss it",
          "Re-enable auth with MFA, restrict the port, audit anonymous builds",
          "Rename the admin account and rotate its password this week"
        ],
        "correct": 2,
        "explanation": "An unauthenticated build server is an unauthenticated code-and-credentials machine: it can run arbitrary pipeline steps and read secrets. Fix = authentication (MFA) + network restriction + retrospective audit of what the open window allowed (build #113). Port shuffling changes nothing."
      },
      {
        "id": "hQ5",
        "prompt": "The team \"auto-update: ON\" policy for Jenkins plugins is questioned after a malicious plugin release is published upstream. What risk class and fix?",
        "options": [
          "Supply-chain risk: pin reviewed versions and verify provenance before install",
          "Availability risk: add more build agents to absorb plugin failures",
          "Licensing risk: disable the plugin manager and install updates manually",
          "Compliance risk: write an acceptable-use policy covering plugin usage"
        ],
        "correct": 0,
        "explanation": "CI/CD components are a documented supply-chain target (T1195.001: Compromise Software Dependencies and Development Tools — a poisoned plugin/Action can steal runtime credentials or infect every build). Auto-install of unreviewed versions is the anti-pattern; pin, review, verify, then update on your schedule."
      },
      {
        "id": "hQ6",
        "prompt": "A colleague base64-encodes the DB password and commits it to git \"because it is encoded\". Verdict?",
        "options": [
          "Acceptable — base64 output is reversible only with the encryption key",
          "Acceptable while the repository stays private to the platform team",
          "Not acceptable — they should have compressed and encrypted the file",
          "Not acceptable — base64 is encoding, not encryption; rotate and vault"
        ],
        "correct": 3,
        "explanation": "Base64 decodes with a one-liner; it provides zero confidentiality and needs no key. The ORCHESTRATE station makes this point: Secrets are base64-encoded too, which is why encryption at rest + RBAC + rotation discipline matter, and why no secret form belongs in git — encoded or not. Private repos leak, and the value must be rotated because history is forever."
      },
      {
        "id": "hQ7",
        "prompt": "Why does the manifest set rollingUpdate.maxUnavailable: 0 with maxSurge: 1?",
        "options": [
          "It lets the old pod exit first, freeing capacity for the replacement",
          "Capacity never dips: the replacement starts before any old pod exits",
          "It forces the rollout to fail fast for human review",
          "It caps the Deployment at one pod during the whole rollout"
        ],
        "correct": 1,
        "explanation": "maxUnavailable: 0 forbids dropping below the declared replica count while updating; maxSurge: 1 lets one extra pod start first. Net effect: capacity never dips — the zero-downtime rolling-update pattern Cloud+ expects you to recognize. Note the inversion trap in option A: that is what maxUnavailable: 1 / maxSurge: 0 would do."
      }
    ]
  },

  quizTopics: {
    "mQ1": {
      "topic": "Kubernetes’ orchestration role vs the other tools",
      "where": "Field Manual → Tools → Kubernetes"
    },
    "mQ2": {
      "topic": "Ansible’s agentless SSH model",
      "where": "Field Manual → Tools → Ansible"
    },
    "mQ3": {
      "topic": "CI vs Continuous Delivery vs Continuous Deployment",
      "where": "Field Manual → Concepts → The CI/CD family"
    },
    "mQ4": {
      "topic": "Idempotency and safe re-runs",
      "where": "Field Manual → Concepts → IaC, desired state, idempotency"
    },
    "mQ5": {
      "topic": "Pipeline triggers and pipeline-as-code",
      "where": "Field Manual → Tools → Jenkins + PLAN station evidence"
    },
    "mQ6": {
      "topic": "Secrets: object choice, base64 vs encryption",
      "where": "Field Manual → Tools → Kubernetes + secret-config.txt"
    },
    "hQ1": {
      "topic": "Choosing the idempotent fix (lineinfile)",
      "where": "CONFIGURE station: site.yml + ansible-run.txt"
    },
    "hQ2": {
      "topic": "Responding to credential exposure in logs",
      "where": "BUILD station: Jenkinsfile Push stage + Handover → M1054"
    },
    "hQ3": {
      "topic": "Desired-state reconciliation vs manual drift",
      "where": "ORCHESTRATE station: kubectl-events.txt"
    },
    "hQ4": {
      "topic": "Hardening an exposed management console",
      "where": "BUILD station: jenkins-notes.txt + Handover → M1032/M1035"
    },
    "hQ5": {
      "topic": "Software supply-chain risk in tooling (T1195.001)",
      "where": "Field Manual → Threats + Handover → M1045/M1051"
    },
    "hQ6": {
      "topic": "Secrets in git: encoding is not encryption",
      "where": "ORCHESTRATE station: secret-config.txt + Handover → M1041"
    },
    "hQ7": {
      "topic": "Zero-downtime rolling updates (maxSurge/maxUnavailable)",
      "where": "ORCHESTRATE station: deployment.yaml strategy block"
    }
  },

  glossary: [
    {
      "term": "Continuous Integration (CI)",
      "def": "Every push is automatically built and tested, so integration problems surface in minutes instead of release week."
    },
    {
      "term": "Continuous Delivery",
      "def": "Passing changes are automatically packaged and staged for release; a human approves the final production deploy."
    },
    {
      "term": "Continuous Deployment",
      "def": "Every change that passes the pipeline ships to production automatically — no human gate at the end."
    },
    {
      "term": "Pipeline",
      "def": "The ordered, automated path a change takes: commit → build → test → package → configure → deploy → operate."
    },
    {
      "term": "Infrastructure as Code (IaC)",
      "def": "Infrastructure and configuration defined as versioned, reviewable files that tools apply — instead of manual clicks."
    },
    {
      "term": "Orchestration",
      "def": "Coordinating many automated parts into one managed whole — Kubernetes orchestrates containers (scheduling, scaling, healing); automation is one repeated task."
    },
    {
      "term": "Configuration management",
      "def": "Keeping servers’ software and config at a defined state — Ansible’s job, enforced with idempotent tasks."
    },
    {
      "term": "Desired state",
      "def": "The declared end state in code/manifests that a tool continuously reconciles reality toward."
    },
    {
      "term": "Idempotency",
      "def": "Re-running an operation produces the same end state and no side effects when the system is already compliant — safe re-runs, no drift."
    },
    {
      "term": "Playbook",
      "def": "Ansible’s YAML file of ordered tasks/modules applied to a set of hosts."
    },
    {
      "term": "Inventory",
      "def": "The list of hosts a tool manages — for Ansible, usually an INI/YAML file with groups like [web]."
    },
    {
      "term": "Agentless",
      "def": "No resident agent software on managed hosts — Ansible connects over SSH and runs modules temporarily."
    },
    {
      "term": "Pod",
      "def": "The smallest Kubernetes unit: one or more containers sharing network and storage, managed by a higher-level object like a Deployment."
    },
    {
      "term": "Secret",
      "def": "A Kubernetes object for sensitive data. Base64 in a Secret is encoding, not encryption — enable encryption at rest and restrict with RBAC."
    },
    {
      "term": "Drift",
      "def": "Real-world state diverging from declared state because someone changed things outside the pipeline (manual hotfixes)."
    },
    {
      "term": "Webhook",
      "def": "An HTTP push notification between systems — a Git push webhooks the CI server to start the pipeline."
    },
    {
      "term": "Pipeline-as-code",
      "def": "The pipeline itself lives in the repo (e.g., a Jenkinsfile), versioned and reviewed like any other code."
    },
    {
      "term": "RBAC",
      "def": "Role-based access control — permissions bound to identities; least privilege for pipeline identities is essential (no cluster-admin for CI)."
    }
  ],

  evidence: [
    {
      "id": "repo-structure",
      "station": "plan",
      "name": "repo-structure.txt",
      "kind": "note",
      "desc": "Layout of the nimbuscart-web repository",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\nnimbuscart-web/                        ← single source of truth (Git)\n├── Jenkinsfile                        ← pipeline-as-code (BUILD station)\n├── src/                               ← application code (Node.js storefront)\n├── config/\n│   └── deploy-credentials.txt         ← \"handy for troubleshooting\" (?)\n└── deploy/\n    ├── ansible/\n    │   ├── inventory.ini              ← target host list (CONFIGURE station)\n    │   └── site.yml                   ← baseline playbook (CONFIGURE station)\n    └── k8s/\n        ├── deployment.yaml            ← workload manifest (ORCHESTRATE station)\n        ├── rbac.yaml                  ← pipeline identity permissions\n        └── secret-config.txt          ← ConfigMap/Secret notes\n\nTrigger: a push to main opens a webhook that starts the Jenkins pipeline.\nEverything on this line is versioned, reviewable and re-appliable."
    },
    {
      "id": "git-log",
      "station": "plan",
      "name": "git-log.txt",
      "kind": "log",
      "desc": "Recent commit history on origin/main",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n$ git log --oneline --date=short origin/main\n8f4e1a2  2026-11-05 18:12  release: v1.4.2 to prod train (m.okafor)\n7d31b04  2026-11-05 16:20  feat(cart): coupon stacking rules (r.silva)\na1f9c2e  2026-11-04 09:41  ci: pin Jenkins plugins to approved versions (m.okafor)\nc5d2e10  2026-11-02 14:55  fix(nav): mobile menu overflow (r.silva)\nb7aa901  2026-11-01 10:12  chore: add deploy credentials for pipeline (r.silva)\n3e08b77  2026-10-28 11:03  feat(pdp): product gallery lazy-load (r.silva)\n$ # note: commits trigger the pipeline webhook — see BUILD station"
    },
    {
      "id": "deploy-credentials",
      "station": "plan",
      "name": "config/deploy-credentials.txt",
      "kind": "file",
      "desc": "Committed file — added \"for troubleshooting\"",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n# NimbusCart deploy credentials — for the release pipeline\n# (added by r.silva, 2026-11-01 — \"handy when the train breaks at night\")\n\nregistry.nimbuscart.example\n  user:  ci-bot\n  token: nc-cip-9f2e77a1c3b84d0e\n\nk8s context: nimbuscart-prod\n  service account: ci-bot (namespace: nimbuscart)\n  token: eyJhbGciOiJSUzI1NiJ9.TRAINING-FAKE-SERVICEACCOUNT-TOKEN.sign\n\n# scenario note(r.silva): remember to remove this file before we go live"
    },
    {
      "id": "jenkinsfile",
      "station": "build",
      "name": "Jenkinsfile",
      "kind": "config",
      "desc": "Pipeline-as-code for the storefront release train",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n// Jenkinsfile — NimbusCart web release pipeline (TRAINING COPY)\npipeline {\n  agent any\n  environment {\n    REGISTRY = 'registry.nimbuscart.example'\n    IMAGE    = \"${REGISTRY}/nimbuscart-web:1.4.2\"\n  }\n  stages {\n    stage('Checkout') {\n      steps { checkout scm }                        // pulls the commit that triggered us\n    }\n    stage('Lint & Unit Tests') {\n      steps {\n        sh 'npm ci'\n        sh 'npm run lint'\n        sh 'npm test -- --coverage'\n      }\n    }\n    stage('Build Image') {\n      steps { sh \"docker build -t $IMAGE .\" }\n    }\n    stage('Push') {\n      steps {\n        withCredentials([string(credentialsId: 'registry-ci-token', variable: 'REG_TOKEN')]) {\n          sh 'echo Logging in with $REG_TOKEN'      // \"handy for debugging\" — really?\n          sh \"docker login $REGISTRY -u ci-bot -p $REG_TOKEN\"\n          sh \"docker push $IMAGE\"\n        }\n      }\n    }\n    stage('Deploy') {\n      steps { sh 'kubectl -n nimbuscart rollout restart deploy/web-frontend' }\n    }\n  }\n  post { always { junit 'test-results/*.xml' } }\n}"
    },
    {
      "id": "build-console-112",
      "station": "build",
      "name": "build-console-112.txt",
      "kind": "log",
      "desc": "Console output — release train run #112 (FAILED)",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\nBuild #112 · 2026-11-05 21:57 · trigger: webhook from github/nimbuscart-web (push) commit 7d31b04\n[Pipeline] stage (Checkout)\n > git checkout 7d31b04 — OK\n[Pipeline] stage (Lint & Unit Tests)\n npm WARN deprecated request-promise-core@2.1.6          ← noise, harmless\n 214 tests passing · 1 skipped · coverage 81.4%          ← tests PASS\n[Pipeline] stage (Build Image)\n docker build -t registry.nimbuscart.example/nimbuscart-web:1.4.2 .\n → layers written, image sha256:c0ffee…badc0de            ← image builds fine\n[Pipeline] stage (Push)\n + docker login registry.nimbuscart.example -u ci-bot -p ********\n denied: requested access to the resource is denied\n[Pipeline] end\nBuild #112 FAILED — failing stage: Push · duration 4m 51s\n—\n(For contrast: build #111 on 2026-11-02 PASSED end-to-end.)"
    },
    {
      "id": "jenkins-notes",
      "station": "build",
      "name": "jenkins-notes.txt",
      "kind": "note",
      "desc": "Controller configuration notes",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\nController : jenkins.nimbuscart.example:8080 (VM build-ctl-01, Ubuntu 22.04)\nAuth       : \"disabled for speed during the migration — re-enable later\"\n             (ticket OPS-431, open for 34 days)\nPlugins    : git 5.2.1 · kubernetes-cd 1.28.0 · pipeline-stage-view 2.34\n             auto-update: ON  ← installs every new plugin version immediately\nAgents     : build-01, build-02 (static, agent VLAN 10.20.0.0/24)\nCredentials: registry-ci-token (ci-bot) · git-read-token\nWebhook    : github/nimbuscart-web → push → pipeline (see build-console-112)"
    },
    {
      "id": "inventory",
      "station": "configure",
      "name": "deploy/ansible/inventory.ini",
      "kind": "config",
      "desc": "The hosts Ansible manages",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n# Ansible inventory — nimbuscart web fleet (TRAINING)\n# Ansible is agentless: it connects to these hosts over SSH from the control node.\n\n[web]\nweb-01.nimbuscart.example\nweb-02.nimbuscart.example\nweb-03.nimbuscart.example\n\n[control]\nbuild-ctl-01.nimbuscart.example   # Jenkins controller\nk8s-node-01.nimbuscart.example    # Kubernetes node\n\n# Auth: SSH key-based only (no passwords in this inventory)"
    },
    {
      "id": "site-yml",
      "station": "configure",
      "name": "deploy/ansible/site.yml",
      "kind": "config",
      "desc": "Baseline web-fleet playbook",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n# site.yml — baseline web servers (TRAINING PLAYBOOK)\n- name: Baseline web servers\n  hosts: web\n  become: true\n  tasks:\n    - name: Install nginx\n      ansible.builtin.apt:\n        name: nginx\n        state: present\n\n    - name: Deploy site config\n      ansible.builtin.template:\n        src: nginx.conf.j2\n        dest: /etc/nginx/nginx.conf\n      notify: restart nginx\n\n    - name: Sync app credentials\n      ansible.builtin.copy:\n        dest: /etc/nimbuscart/app.conf\n        content: \"db_password=Sup3rS3cret!\"\n        mode: \"0640\"\n\n    - name: Set app environment\n      ansible.builtin.shell: >\n        echo \"export APP_ENV=prod\" >> /etc/profile.d/app-env.sh\n\n    - name: Ensure nginx service running\n      ansible.builtin.service:\n        name: nginx\n        state: started\n        enabled: true\n\n  handlers:\n    - name: restart nginx\n      ansible.builtin.service:\n        name: nginx\n        state: restarted"
    },
    {
      "id": "ansible-run",
      "station": "configure",
      "name": "ansible-run.txt",
      "kind": "log",
      "desc": "Output of the latest playbook run",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n$ ansible-playbook -i inventory.ini site.yml\nPLAY [Baseline web servers] — hosts: 3 (web-01..web-03)\n\nTASK [Install nginx]           ok=3  changed=0      ← nothing to do, already installed\nTASK [Deploy site config]      ok=3  changed=0\nTASK [Sync app credentials]    ok=3  changed=0      ← same content already in place — copy is idempotent\nTASK [Set app environment]     ok=3  changed=3      ← appends ANOTHER line every run (NOT idempotent)\nTASK [Ensure nginx running]    ok=3  changed=0\n\nRECAP: web-01 : ok=5 changed=1\n       web-02 : ok=5 changed=1\n       web-03 : ok=5 changed=1\n$ # same run yesterday: ok=5 changed=1 — identical. Only the shell task never settles.\n$ wc -l /etc/profile.d/app-env.sh   (on web-01) → 41 lines and growing"
    },
    {
      "id": "deployment-yaml",
      "station": "orchestrate",
      "name": "deploy/k8s/deployment.yaml",
      "kind": "config",
      "desc": "Manifest for the storefront workload",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n# deployment.yaml — storefront web frontend (TRAINING MANIFEST)\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-frontend\n  namespace: nimbuscart\nspec:\n  replicas: 3                          # desired state — Kubernetes keeps this true\n  selector:\n    matchLabels: { app: web }\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1                      # start 1 extra pod before killing an old one\n      maxUnavailable: 0                # never drop below 3 serving pods\n  template:                            # ← the pod spec the Deployment enforces\n    metadata:\n      labels: { app: web }\n    spec:\n      containers:\n        - name: web\n          image: registry.nimbuscart.example/nimbuscart-web:1.4.2\n          ports: [{ containerPort: 8080 }]\n          securityContext:\n            privileged: true              # \"needed for debugging\" — remove?\n          resources:\n            requests: { cpu: 250m, memory: 256Mi }\n          livenessProbe:\n            httpGet: { path: /healthz, port: 8080 }\n          readinessProbe:\n            httpGet: { path: /ready, port: 8080 }"
    },
    {
      "id": "kubectl-events",
      "station": "orchestrate",
      "name": "kubectl-events.txt",
      "kind": "log",
      "desc": "Recent cluster events for namespace nimbuscart",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n$ kubectl -n nimbuscart get events --sort-by=.lastTimestamp | tail\n21:59:11  web-frontend-7d9c6-qkv2s   Pulling    image \"registry.nimbuscart.example/nimbuscart-web:1.4.2\"\n21:59:14  web-frontend-7d9c6-qkv2s   BackOff    Back-off pulling image …:1.4.2 (auth/permission)  → ImagePullBackOff\n22:04:31  web-frontend-7d9c6-qkv2s   BackOff    (repeats — pods keep retrying the pull)\n22:07:02  web-frontend-a1b2c-n8w1p   Pulled     image \"…:1.4.1\" (previous version, cached) — still serving\n23:41:09  payment-svc-6f7c4-m2r9q    Started    Started container payment-svc          ← unrelated, healthy\n00:12:45  web-frontend-7d9c6-qkv2s   Killing    ScalingReplicaSet: scaled down 5→3\n                                              (someone ran kubectl scale --replicas=5;\n                                               the Deployment reconciled back to the manifest: 3)"
    },
    {
      "id": "rbac-yaml",
      "station": "orchestrate",
      "name": "deploy/k8s/rbac.yaml",
      "kind": "config",
      "desc": "Permissions of the pipeline identity",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n# rbac.yaml — pipeline identity (TRAINING)\nkind: Role\nmetadata: { name: deploy-editor, namespace: nimbuscart }\nrules:\n  - apiGroups: [\"apps\"]\n    resources: [\"deployments\"]\n    verbs: [\"get\", \"list\", \"watch\", \"create\", \"update\", \"patch\"]\n  - apiGroups: [\"\"]\n    resources: [\"pods\"]\n    verbs: [\"get\", \"list\", \"watch\"]\n---\nkind: RoleBinding\nmetadata: { name: deploy-editor-binding, namespace: nimbuscart }\nsubjects:\n  - kind: ServiceAccount\n    name: ci-bot\n    namespace: nimbuscart\nroleRef: { kind: Role, name: deploy-editor }\n\n# REVIEW NOTE (2026-11-06): until 2026-11-05 the ci-bot account was bound to\n# cluster-admin CLUSTER-WIDE. The binding above replaced it after incident\n# review — least privilege, namespaced only."
    },
    {
      "id": "secret-config",
      "station": "orchestrate",
      "name": "deploy/k8s/secret-config.txt",
      "kind": "note",
      "desc": "ConfigMap vs Secret handling notes",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n# How nimbuscart handles app credentials (TRAINING NOTES)\n\nConfigMap db-config      → non-sensitive settings: DB_HOST, DB_PORT, LOG_LEVEL\nSecret   db-cred         → SENSITIVE: DB_PASSWORD (data value is base64-encoded)\n\n$ kubectl -n nimbuscart get secret db-cred -o jsonpath='{.data.DB_PASSWORD}'\nU3VwM1JTM2NyZXQh                    ← that is base64. ENCODING, not encryption —\n                                      anyone who can read the Secret gets the value.\nControls applied (2026-11-04):\n  · Secret stored as a Secret object, NOT in a ConfigMap\n  · encryption-at-rest enabled for etcd secrets\n  · RBAC: only workloads/user group platform-admins may get/read db-cred\n  · not committed to git (that goes for ConfigMaps of secrets too)"
    },
    {
      "id": "audit-log",
      "station": "operate",
      "name": "audit-log.txt",
      "kind": "log",
      "desc": "Night-shift audit & drift feed",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\nNIMBUSCART OPS FEED — night of 2026-11-05 → 06\n02:14  k8s.audit    pod.create     pod=crypto-miner-77 ns=nimbuscart\n                    subject=system:serviceaccount:nimbuscart:ci-bot\n                    src=198.51.100.77   agent=kubectl/v1.30.1\n                    note: pod not owned by any Deployment/ReplicaSet\n02:41  drift-scan   web-03 /etc/nginx/nginx.conf differs from template (hash mismatch)\n                    no matching playbook commit since 2026-10-28 → manual edit suspected\n03:02  jenkins.audit build.start   build=#113  subject=anonymous\n                    ui=jenkins.nimbuscart.example:8080\n03:30  drift-scan   web-01 /etc/nginx/nginx.conf matches template (OK)\n"
    },
    {
      "id": "drift-report",
      "station": "operate",
      "name": "drift-report.txt",
      "kind": "log",
      "desc": "Desired vs live state — web-03",
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\nDRIFT REPORT · generated 2026-11-06 02:41 · host web-03.nimbuscart.example\nsource of truth : deploy/ansible/site.yml → template nginx.conf.j2 (commit 3e08b77)\n\n-  desired: gzip          on\n+  live:    gzip          off\n-  desired: worker_connections  768\n+  live:    worker_connections  1024\n\nlast pipeline apply on web-03: 2026-10-28 (OK at the time)\ncomment found in live file:   # quick perf tweak by hand — d.k. 2026-11-05\nVERDICT: hand-edited outside the train. The playbook no longer matches reality\non this host; the next pipeline run would silently \"fix\" it back."
    },
    {
      "id": "incident-file",
      "station": "operate",
      "name": "incident-2026-11-06.md",
      "kind": "note",
      "desc": "Night-shift incident notes (night shift only)",
      "modes": [
        "hard"
      ],
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\n# INCIDENT IR-1142 — rogue workload on the prod train (2026-11-06, night shift)\n\nWHAT WE KNOW\n· 02:14 pod crypto-miner-77 created in ns nimbuscart\n· creator: serviceaccount ci-bot — via its token, NOT via the pipeline\n  (no Jenkins build was running; source IP 198.51.100.77 is not an agent)\n· the ci-bot service-account token AND the registry token live in\n  config/deploy-credentials.txt — committed to git on 2026-11-01 (b7aa901)\n  and since mirrored to a public code-mirror site\n· 03:02 build #113 was triggered anonymously on the dashboard\n  (auth disabled — ticket OPS-431)\n· RBAC history: ci-bot held cluster-admin until 2026-11-05\n\nNOT YET EXPLAINED\n· web-03 nginx hand-edit at ~02:00 — intern says it was their \"perf tweak\"\n· CPU graphs on the web tier look normal\n\nDRAFT CONTAINMENT (unordered — sequencing under review):\n  [ ] rotate/replace leaked ci-bot + registry tokens\n  [ ] delete pod crypto-miner-77\n  [ ] re-enable dashboard authentication\n  [ ] purge deploy-credentials.txt from git history & re-clone agents\n  [ ] keep ci-bot namespaced RBAC (done 2026-11-05) — verify no other wildcard binds\n  [ ] review k8s audit logs for every action taken by the ci-bot token"
    },
    {
      "id": "perf-note",
      "station": "operate",
      "name": "perf-note.txt",
      "kind": "note",
      "desc": "Capacity note (night shift only)",
      "modes": [
        "hard"
      ],
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\nCAPACITY NOTE — web tier, last 24h\nCPU: steady 22–35% across web-01..03 · memory flat · no spike at 02:14\np95 latency 118 ms (SLO 250 ms) · error rate 0.02%\nConclusion: nothing here. Business as usual."
    },
    {
      "id": "office-bulletin",
      "station": "operate",
      "name": "office-it-bulletin.txt",
      "kind": "note",
      "desc": "Facilities notice (night shift only)",
      "modes": [
        "hard"
      ],
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\nOFFICE IT BULLETIN — Friday\nBadge-reader maintenance on Saturday 08:00–11:00, lobby entrance only.\nCoffee machine in kitchen 2 is back. Diwali potluck sign-up sheet at reception.\nNo action required for platform teams."
    },
    {
      "id": "hr-memo",
      "station": "operate",
      "name": "hr-memo.txt",
      "kind": "note",
      "desc": "HR memo (night shift only)",
      "modes": [
        "hard"
      ],
      "content": "⸻ TRAINING DATA — synthetic evidence for practice, not a real system ⸻\n\nINTERNAL MEMO — People Team\nReminder: expense reports for Q4 travel are due on the 15th.\nNew starter photos will be taken in the Atrium on Tuesday.\n(Nothing to do with the platform. At all.)"
    }
  ]
};
