/* ============================================================
   THE AUTOMATION WORKS — Cloud+ CV0-004 · Lesson 5.1 practice lab
   js/data.js — all lab content (data only, no logic)

   Faithful 1:1 static port of the original single-file lab.
   Code lines are unchanged; they were only regrouped per concern.
   Load order: state.js -> ui.js -> data.js -> objectives.js -> quiz.js -> app.js
   (data.js must come after ui.js: work-order machine hooks call cvHook at load.)
   ============================================================ */
"use strict";
/* ===== GLOSSARY (C2) ===== */
/* ================= GLOSSARY (C2) ================= */
const GLOSSARY = [
  ["Automation","Using tools to execute repetitive cloud operations without a human performing each step — the lesson's core idea."],
  ["Orchestration","Coordinating multiple automated tasks into one end-to-end workflow across systems (e.g., the CI/CD pipeline itself)."],
  ["Source control","Tracking and managing changes to code in a versioned repository such as Git — the system of record."],
  ["Version management","Keeping every change identified, attributable and reversible across the project's history."],
  ["Code commit","Recording a snapshot of changes into the repository history."],
  ["Branch management","Isolating work on separate lines of development and merging them deliberately."],
  ["Pull request","A proposed change submitted for review before it is merged into the main line."],
  ["Code review","Humans inspecting a proposed change before it merges — a quality AND security gate."],
  ["CI/CD","Continuous Integration/Continuous Deployment — continuously building, testing and deploying changes through a repeatable pipeline."],
  ["Build","Turning source code into a runnable, deployable output."],
  ["Artifact","The versioned output of a build: VM image, container image, RPM/Debian package, ZIP/tar archive or flat file."],
  ["Repository","Storage for code or artifacts — public (shared/open) or private (restricted)."],
  ["Workflow","The defined sequence of pipeline stages and approvals a change flows through."],
  ["Event-driven architecture","Components reacting automatically to events (webhooks, messages) instead of polling on a schedule."],
  ["Desired state / drift","The state the code declares vs what a system actually has; drift is the gap, and automation re-converges it."]
];

/* ===== STATION META ===== */
const STATION_ORDER = [
  {sid:"st01", num:"01", name:"Receiving Dock"},
  {sid:"st02", num:"02", name:"Tool Crib"},
  {sid:"st03", num:"03", name:"Conveyor Assembly"},
  {sid:"st04", num:"04", name:"Signal Bus"},
  {sid:"st05", num:"05", name:"QA Gate"},
  {sid:"st06", num:"06", name:"Drift Inspection"},
  {sid:"st07", num:"07", name:"Dispatch Office"},
  {sid:"st08", num:"08", name:"Control Room"},
  {sid:"st09", num:"09", name:"Shipping Bay"}
];

/* ===== MEDIUM WORK ORDERS (12 objectives) ===== */
/* ================= MEDIUM WORK ORDERS (12 objectives) ================= */
const WO_MED = [
{ obj:"M1", no:"WO-01", station:"st01", pillar:"P1 UNDERSTAND", pillarShort:"P1", short:"Automation vs orchestration",
  title:"Manifest check: automation or orchestration?",
  brief:"Before your badge works the dock, sort the manifest. <b>Automation</b> is a tool executing one repetitive task without a human at the controls; <b>orchestration</b> coordinates multiple automated tasks into one end-to-end workflow. Sort each statement.",
  hints:["One word decides it: does the statement describe a SINGLE task executed automatically, or SEVERAL tasks/systems COORDINATED?","A build step compiling an app = one task = automation. The pipeline shepherding build→test→deploy = coordination = orchestration.","If you could point at one machine doing one job, it's automation. If you're pointing at a control room directing many machines, it's orchestration."],
  widgets:[{type:"sort", key:"w_m1", items:[
      {id:"a1", t:"One script patches a single server when it runs."},
      {id:"a2", t:"Chains build → test → deploy → verify into one coordinated run across systems."},
      {id:"a3", t:"Repeatable execution of a single well-defined task without a human at the controls."},
      {id:"a4", t:"Coordinates multiple automated tasks and systems into an end-to-end workflow."},
      {id:"a5", t:"The build step compiling and packaging an app inside the pipeline."},
      {id:"a6", t:"The pipeline itself, scheduling and shepherding every stage and approval."}
    ], b:[{id:"auto", label:"AUTOMATION"},{id:"orch", label:"ORCHESTRATION", alt:true}]}],
  check:(E)=>({pass: sortOK("w_m1",{a1:"auto",a2:"orch",a3:"auto",a4:"orch",a5:"auto",a6:"orch"}),
    msg:"Not yet — remember the deciding question: one task done automatically (automation) vs several tasks coordinated end-to-end (orchestration). Re-sort the ones that mention coordination across systems."}),
  passMsg:"<b>Stamped.</b> Automation = tools executing individual repetitive tasks; orchestration = coordinating those tasks into one workflow (the CI/CD pipeline is orchestration <i>made of</i> automated steps). The exam tests this distinction constantly — and so do job interviews." },

{ obj:"M3", no:"WO-02", station:"st01", pillar:"P2 RECOGNIZE", pillarShort:"P2", short:"Sequence the source-control flow",
  title:"Intake flow: how code arrives at the dock",
  brief:"A feature that fixes the manifest API is ready. Sequence the intake flow so it can never repeat the <b>hotfix-on-main</b> incident — every Domain 5.1 term appears once: branch, commit, push, pull request, code review, merge.",
  hints:["Ask first: where does new work live so it doesn't disturb main? (branch management)","You can't open a pull request until the branch exists AND the changes are recorded and visible to others — commit, then push.","Review happens on the proposal (the pull request) — the merge is what happens AFTER approval."],
  widgets:[{type:"seq", key:"w_m3", items:[
      {id:"b1", t:"Create a feature branch off main (branch management)"},
      {id:"b2", t:"Commit changes to the branch with a clear message"},
      {id:"b3", t:"Push the branch to the shared repository"},
      {id:"b4", t:"Open a pull request proposing the merge"},
      {id:"b5", t:"Peer code review approves the changes"},
      {id:"b6", t:"Merge into main — version management records it"}
    ]}],
  check:(E)=>({pass: seqOK("w_m3",["b1","b2","b3","b4","b5","b6"]),
    msg:"Not the dock's flow. Remember: branch first (isolate the work), commit (record it), push (share it), THEN propose via pull request, get the code review, and only merge after approval."}),
  passMsg:"<b>Stamped.</b> branch → commit → push → pull request → code review → merge. That review step is both a quality and a security gate — it is exactly what was skipped in the hotfix incident. Objective 5.1 complete: every source-control term in its natural order." },

{ obj:"M4", no:"WO-03", station:"st02", pillar:"P2 RECOGNIZE", pillarShort:"P2", short:"Assign the nine DevOps tools",
  title:"Sign-out sheet: nine tools, nine jobs",
  brief:"The crib keeper will not sign out a tool without a reason. Place all nine Domain 5.4 tools on the role cards they belong to. <b>Tap a chip, then tap its socket</b> (tap a placed chip to return it).",
  hints:["Split the wall in two: code-and-infrastructure tools (Git, Terraform, Ansible) vs pipeline-and-runtime tools (Jenkins, GitHub Actions, Docker, Kubernetes).","The observability pair: ELK is for LOGS (search/ingest/visualize), Grafana is for METRICS dashboards and alerting.","Docker builds the portable package; Kubernetes runs and orchestrates many of those packages across a fleet."],
  widgets:[{type:"assign", key:"w_m4",
    chips:[{id:"git",t:"Git"},{id:"terraform",t:"Terraform"},{id:"ansible",t:"Ansible"},{id:"docker",t:"Docker"},{id:"k8s",t:"Kubernetes"},{id:"jenkins",t:"Jenkins"},{id:"gha",t:"GitHub Actions"},{id:"elk",t:"ELK stack"},{id:"grafana",t:"Grafana"}],
    socks:[
      {id:"s1", t:"Version control — system of record for source code"},
      {id:"s2", t:"Provisioning infrastructure from declarative code (IaC)"},
      {id:"s3", t:"Agentless configuration automation with YAML playbooks"},
      {id:"s4", t:"Packages apps + dependencies into portable images"},
      {id:"s5", t:"Runs & orchestrates containers at scale (scheduling, self-healing)"},
      {id:"s6", t:"Self-hosted automation server that executes CI/CD pipelines"},
      {id:"s7", t:"Pipeline workflows defined natively in GitHub repositories"},
      {id:"s8", t:"Ingests, searches & visualizes LOGS (the stack)"},
      {id:"s9", t:"Metrics dashboards & alerting"}
    ]}],
  check:(E)=>({pass: assignOK("w_m4",{s1:"git",s2:"terraform",s3:"ansible",s4:"docker",s5:"k8s",s6:"jenkins",s7:"gha",s8:"elk",s9:"grafana"}),
    msg:"Some tools are in the wrong sockets. Watch the pairs: Git=version control · Terraform=provisioning IaC · Ansible=config automation · Docker=package images · Kubernetes=run them at scale · Jenkins=self-hosted pipeline server · GitHub Actions=pipelines inside GitHub · ELK=logs · Grafana=metrics dashboards."}),
  passMsg:"<b>Stamped.</b> All nine Domain 5.4 tools in their jobs. On the exam, expect scenario sentences ('we need agentless config enforcement…') where you must name the tool — you can now do that for the entire crib wall." },

{ obj:"M5", no:"WO-04", station:"st03", pillar:"P2 RECOGNIZE", pillarShort:"P2", short:"Order the CI/CD stages",
  title:"Assembly line: order the pipeline stages",
  brief:"The conveyor is stopped for training. Assemble the CI/CD workflow in the order a change flows: integration → … → verify. Then notice <b>where the gates sit</b>: testing and security run BEFORE anything is packaged and shipped.",
  hints:["Everything starts when code is integrated (merged and the pipeline triggered).","You cannot test or scan what never compiled — build comes before test, and security scanning before packaging.","The last two stages ship it and watch it: deploy, then verify/monitor the health of what you shipped."],
  widgets:[{type:"seq", key:"w_m5", items:[
      {id:"p1", t:"Code integration — merge changes and trigger the pipeline"},
      {id:"p2", t:"Build — compile source into a runnable output"},
      {id:"p3", t:"Test — automated tests validate the build"},
      {id:"p4", t:"Security — scan dependencies and configuration"},
      {id:"p5", t:"Package — publish the artifact (image or package)"},
      {id:"p6", t:"Deploy — release to the target environment"},
      {id:"p7", t:"Verify — monitor health and converge state"}
    ]}],
  check:(E)=>({pass: seqOK("w_m5",["p1","p2","p3","p4","p5","p6","p7"]),
    msg:"The line won't start. Order: integrate (merge + trigger) → build → test → security → package → deploy → verify. Nothing ships before testing and security — that's the whole point of the gate."}),
  passMsg:"<b>Stamped.</b> That is the Domain 5.2 workflow: automation riding a pipeline from integration to verification. The two gates in the middle (test, security) are why 'the gate saved Friday' — a broken build dies at stage 3, never reaching production." },

{ obj:"M10", no:"WO-05", station:"st03", pillar:"P2 RECOGNIZE", pillarShort:"P2", short:"Artifact types & repositories",
  title:"Shipping pallets: classify the artifacts",
  brief:"Label the pallets — the four artifact shapes from the objectives — then decide where proprietary builds are stored. <b>Tap a chip, then its socket.</b>",
  hints:["'Boots an entire machine' is the giveaway for one image type; 'app + runtime + libraries, portable across hosts' is the other.","RPM goes with Red Hat-family Linux (RHEL, Fedora, CentOS); Debian packages with Debian/Ubuntu.","Proprietary internal builds must not be pullable by strangers — that decides the repository."],
  widgets:[
    {type:"assign", key:"w_m10a",
      chips:[{id:"vm",t:"VM image"},{id:"ctn",t:"Container image"},{id:"rpm",t:"RPM package"},{id:"deb",t:"Debian package"}],
      socks:[
        {id:"s1", t:"Boots an entire machine — a complete disk template"},
        {id:"s2", t:"App + runtime + libraries, portable across hosts"},
        {id:"s3", t:"Installable package for Red Hat-family Linux"},
        {id:"s4", t:"Installable package for Debian-family Linux"}
      ]},
    {type:"pick", key:"w_m10b", opts:[
      {id:"pub", t:"Public repository — anyone may pull"},
      {id:"priv", t:"Private repository — access-controlled"}
    ]}
  ],
  check:(E)=>({pass: assignOK("w_m10a",{s1:"vm",s2:"ctn",s3:"rpm",s4:"deb"}) && pickOK("w_m10b",["priv"]),
    msg:"Re-check the pallets: VM image = boots a whole machine; container image = app + runtime, portable; RPM = Red Hat-family; Debian = Debian-family. And proprietary internal builds belong in a PRIVATE, access-controlled repository."}),
  passMsg:"<b>Stamped.</b> Artifacts are the versioned outputs the pipeline ships — VM images, container images, RPM/Debian packages (also ZIP/tar archives and flat files in the objectives). And artifacts of proprietary code live in private repositories. That's 5.2's artifact & repository vocabulary locked in." },

{ obj:"M6", no:"WO-06", station:"st04", pillar:"P3 DETECT", pillarShort:"P3", short:"Integration styles & triggers",
  title:"Route the bus: five styles, one trigger",
  brief:"Route each signal to its integration style, then choose the trigger that makes bucket remediation instant. Watch the verbs in each scenario — they identify the style.",
  hints:["Predictable URLs + GET/POST verbs = the web's most common style (REST). Strict XML envelopes = the enterprise contract style.","'Calls a single remote procedure' is literal — RPC. 'Exactly the fields it needs in one query' is GraphQL's signature. A persistent two-way push channel is web sockets.","The bucket event happens at an unknown moment — only one trigger reacts the instant the event occurs rather than polling on a schedule."],
  widgets:[
    {type:"assign", key:"w_m6a",
      chips:[{id:"rest",t:"REST"},{id:"soap",t:"SOAP"},{id:"rpc",t:"RPC"},{id:"ws",t:"Web sockets"},{id:"gql",t:"GraphQL"}],
      socks:[
        {id:"s1", t:"Inventory web app exposes resources at predictable URLs with GET/POST verbs"},
        {id:"s2", t:"Legacy payment gateway exchanges strict XML envelopes between systems"},
        {id:"s3", t:"Warehouse scanner invokes a single remote procedure on the logistics server"},
        {id:"s4", t:"Ops dashboard receives live telemetry pushed over a persistent two-way connection"},
        {id:"s5", t:"Mobile app fetches exactly the nested fields it needs in one query"}
      ]},
    {type:"pick", key:"w_m6b", opts:[
      {id:"sched", t:"Scheduled job — nightly at 02:00"},
      {id:"event", t:"Event-driven — a webhook fires the moment the bucket event occurs"},
      {id:"man", t:"Manual runbook executed by the on-call operator"},
      {id:"thr", t:"Threshold alert — when the public-bucket count exceeds 5"}
    ]}
  ],
  check:(E)=>({pass: assignOK("w_m6a",{s1:"rest",s2:"soap",s3:"rpc",s4:"ws",s5:"gql"}) && pickOK("w_m6b",["event"]),
    msg:"Re-route: URLs+verbs = REST · XML envelopes = SOAP · single remote procedure = RPC · persistent two-way push = web sockets · exactly-the-fields query = GraphQL. For the trigger: a nightly job leaves a 24-hour window; only the event-driven webhook reacts in seconds."}),
  passMsg:"<b>Stamped.</b> You just read Domain 5.3 fluently — and you saw why event-driven architectures matter for security: the bucket went public for only 41 seconds because the automation didn't wait for a schedule. Objective 5.3 routed." },

{ obj:"M2", no:"WO-07", station:"st05", pillar:"P1 UNDERSTAND", pillarShort:"P1", short:"Benefits vs risks of automation",
  title:"Weigh the load: benefit or risk?",
  brief:"The QA gate weighs every claim. Eight statements about automation — four are benefits, four are risks. Weigh each (tap the button that classifies it).",
  hints:["Benefits read like promises kept: identical, logged, overnight, validated.","Risks involve SPEED without control (mistakes replicate), POWER concentrated (service accounts), or DRIFT (hand-edits).","'The service account can delete the whole estate' is not a feature — concentrated power is a risk even when nothing has gone wrong yet."],
  widgets:[{type:"sort", key:"w_m2", items:[
      {id:"c1", t:"The same 14-VM provisioning runs identically every Monday."},
      {id:"c2", t:"Every change is versioned, logged and attributable."},
      {id:"c3", t:"Nightly patches deploy fleet-wide while humans sleep."},
      {id:"c4", t:"A validated pipeline performs the same steps every single run."},
      {id:"c5", t:"One buggy script misconfigured 200 instances in four minutes."},
      {id:"c6", t:"A hotfix pushed straight to production shipped without review."},
      {id:"c7", t:"The pipeline's service account can delete the whole estate."},
      {id:"c8", t:"Hand-edits make servers differ from their code of record."}
    ], b:[{id:"ben", label:"BENEFIT"},{id:"risk", label:"RISK", alt:true}]}],
  check:(E)=>({pass: sortOK("w_m2",{c1:"ben",c2:"ben",c3:"ben",c4:"ben",c5:"risk",c6:"risk",c7:"risk",c8:"risk"}),
    msg:"Re-weigh. Benefits: identical runs, versioned/attributable changes, overnight patching, validated repeatable steps. Risks: amplified errors (200 instances), unreviewed changes shipping, over-privileged service accounts, and drift from hand-edits."}),
  passMsg:"<b>Stamped.</b> Automation's ledger in one ticket: speed, consistency, scale, auditability on the credit side; error amplification, credential concentration, unreviewed changes and drift on the debit side. Streamlining requires guarding — that's the next ticket." },

{ obj:"M8", no:"WO-08", station:"st05", pillar:"P4 MITIGATE", pillarShort:"P4", short:"Match risks to guardrails",
  title:"Guardrail fitting: every risk gets a control",
  brief:"Four risks roll toward production. Fit each with the guardrail that actually mitigates it — this is the safe-automation checklist the exam expects you to know.",
  hints:["The fleet-replication risk is about a BAD change reaching everything — where can it be caught first, and in what percentage of the fleet?","'Ships without anyone reading it' is a source-control process gap: protection + review, not more testing.","'Can delete the whole estate' is a permissions problem (least privilege), and 'needs undoing at 3 a.m.' is an artifacts problem (versioning + rollback)."],
  widgets:[{type:"assign", key:"w_m8",
    chips:[{id:"stg",t:"Test in staging + canary rollout before fleet-wide apply"},{id:"rev",t:"Branch protection + pull-request code review"},{id:"lpriv",t:"Least-privilege service account, scoped to one project"},{id:"rback",t:"Versioned artifacts + automated rollback"}],
    socks:[
      {id:"s1", t:"A buggy script can replicate a bad config fleet-wide"},
      {id:"s2", t:"Changes ship without anyone reading them"},
      {id:"s3", t:"The pipeline service account can delete the estate"},
      {id:"s4", t:"A bad deploy needs undoing at 3 a.m."}
    ]}],
  check:(E)=>({pass: assignOK("w_m8",{s1:"stg",s2:"rev",s3:"lpriv",s4:"rback"}),
    msg:"Re-fit: fleet-wide replication → staging tests + canary; unread changes → branch protection + review; over-privileged account → least privilege; unundoable deploy → versioned artifacts + rollback. Match the CONTROL to the FAILURE MODE."}),
  passMsg:"<b>Stamped.</b> Four risks, four fitted guardrails: canary + staging (blast radius), review gates (human judgment), least privilege (credential concentration, ATT&CK M1026 territory), rollback (reversibility). Safe automation is automation with fitted guardrails — not less automation." },

{ obj:"M9", no:"WO-09", station:"st06", pillar:"P4 MITIGATE", pillarShort:"P4", short:"Find drift, re-converge state",
  title:"Inspection bay: flag the drift, then converge",
  brief:"<b>web-prod-03</b> was 'fixed by hand' last month. Compare <b>desired</b> (what the code declares) against <b>live</b> (what's running): <b>FLAG the drifted rows</b>, then press <b>RE-APPLY DESIRED STATE</b> to converge the server back to its code of record.",
  hints:["Drift = live differs from desired. Read row by row; identical rows are healthy.","Focus on the security-relevant one: egress that should be 'tcp/443 only' but reads 'ALL traffic' is both drift AND an exposure.","After flagging all the drifted rows, run the machine: re-applying desired state is how IaC converges reality back to the code."],
  widgets:[{type:"mark", key:"w_m9", cols:["ATTRIBUTE","DESIRED (code)","LIVE (running)"],
    rows:[
      {id:"img",  cells:["Image tag","ami-nrl-2204","ami-nrl-2104"]},
      {id:"size", cells:["Instance size","t3.medium","t3.medium"]},
      {id:"egr",  cells:["Security group egress","0.0.0.0/0 : tcp/443 only","0.0.0.0/0 : ALL traffic"]},
      {id:"bak",  cells:["Backup schedule","02:00 daily","02:00 daily"]},
      {id:"own",  cells:["Ownership tag","team-ops","(missing)"]}
    ], machine:{id:"reapply", label:"RE-APPLY DESIRED STATE"}}],
  check:(E)=>({pass: flagOK("w_m9",["img","egr","own"]) && !!getE("w_m9").converged,
    msg:"Not flagged correctly. Drift exists ONLY where live contradicts desired: image (2104 vs 2204), egress (ALL vs 443-only), and the missing ownership tag. Size and backup match their declarations. Flag all three, then run RE-APPLY DESIRED STATE."}),
  passMsg:"<b>Stamped.</b> Three drifts found (one of them an open security exposure), and the machine converged the server back to its code of record. This is desired-state automation: the code wins, drift is detected by diffing, and re-applying is the remediation. Lesson: fold manual fixes back into the code — or the next apply will overwrite them (by design)." },

{ obj:"M11", no:"WO-10", station:"st07", pillar:"P1 UNDERSTAND", pillarShort:"P1", short:"Automate-or-human judgment",
  title:"Dispatch sheet: automate it, or keep it human?",
  brief:"The toil inventory is on the wall. Dispatch each task: <b>AUTOMATE</b> (repeatable, well-defined, high-volume) or <b>HUMAN</b> (judgment, accountability, first-of-its-kind).",
  hints:["Ask: is the task the SAME every time, with a definition of done a machine could check? Then automate.","Budget approval and decommissioning decisions change direction based on business context — no script holds that context.","'Brand-new, never-seen alert' is the key phrase on one card: automation executes known patterns; humans make sense of the unknown."],
  widgets:[{type:"sort", key:"w_m11", items:[
      {id:"t1", t:"Patch 300 VMs every Tuesday night."},
      {id:"t2", t:"Approve next quarter's cloud budget."},
      {id:"t3", t:"Rotate an API key on the 1st of every month."},
      {id:"t4", t:"Investigate a brand-new alert no one has seen before."},
      {id:"t5", t:"Add web-tier instances when CPU stays above 80% for 5 minutes."},
      {id:"t6", t:"Decide whether to decommission the legacy freight app."}
    ], b:[{id:"auto", label:"AUTOMATE"},{id:"hum", label:"KEEP HUMAN", alt:true}]}],
  check:(E)=>({pass: sortOK("w_m11",{t1:"auto",t2:"hum",t3:"auto",t4:"hum",t5:"auto",t6:"hum"}),
    msg:"Re-dispatch: scheduled patching, scheduled key rotation and threshold scaling are repeatable with machine-checkable conditions → automate. Budget approval, unknown-alert investigation and decommissioning require judgment and accountability → keep human."}),
  passMsg:"<b>Stamped.</b> 'Streamline operations' does not mean automate everything — over-automation of judgment tasks creates brittle, unaccountable processes. The rule: automate the repeatable and well-defined; give humans the judgment calls. That judgment is itself an exam objective behavior." },

{ obj:"M7", no:"WO-11", station:"st08", pillar:"P3 DETECT", pillarShort:"P3", short:"Read a failed pipeline run",
  title:"Telemetry: this morning's failed run",
  brief:"Run <b>#4182</b> (nightly patch window) halted. <b>Click the FIRST line that shows the failure</b>, then identify the <b>failing stage</b> and classify the <b>artifact</b> it preserved.",
  hints:["Build and test both printed OK before anything failed — start reading where the OKs stop.","The error text names its own stage: 'stage=… ERROR'. Which stage was trying to reach 12 targets over SSH?","The preserved artifact ends in .tar — a bundled archive. Which category does 'tar' belong to in the objectives' artifact list?"],
  widgets:[
    {type:"log", key:"w_m7a", lines:[
      {id:"l1", c:"ok",   t:"[02:00:01] pipeline run 4182 started — trigger: schedule (nightly patch window)"},
      {id:"l2",           t:"[02:00:03] stage=build … building patch bundle from inventory (300 targets)"},
      {id:"l3", c:"ok",   t:"[02:00:41] stage=build OK — bundle nrl-patch-2026-11.tar created"},
      {id:"l4",           t:"[02:01:12] stage=test … dry-run on canary ring (3 instances)"},
      {id:"l5", c:"ok",   t:"[02:04:56] stage=test OK — 0 failures"},
      {id:"l6",           t:"[02:05:00] stage=deploy … applying to ring 1 (100 instances)"},
      {id:"l7", c:"err",  t:"[02:11:09] stage=deploy ERROR — ssh timeout on 12 targets (192.0.2.44-55)"},
      {id:"l8", c:"warn", t:"[02:11:10] stage=deploy RETRY 1/2 — same 12 targets"},
      {id:"l9", c:"err",  t:"[02:17:33] stage=deploy ERROR — ssh timeout persists on the same 12 targets"},
      {id:"l10",c:"err",  t:"[02:17:34] pipeline HALT — deploy stage failed; rings 2-3 NOT started"},
      {id:"l11",c:"ok",   t:"[02:17:35] artifact nrl-patch-2026-11.tar preserved for analysis (versioned)"}
    ]},
    {type:"pick", key:"w_m7b", opts:[
      {id:"build", t:"stage = build"},{id:"test", t:"stage = test"},{id:"deploy", t:"stage = deploy"},{id:"pkg", t:"stage = package"}
    ]},
    {type:"pick", key:"w_m7c", opts:[
      {id:"flat", t:"Flat file"},{id:"ctn", t:"Container image"},{id:"rpm", t:"RPM package"},{id:"tar", t:"tar archive (a package type)"}
    ]}
  ],
  check:(E)=>({pass: logOK("w_m7a","l7") && pickOK("w_m7b",["deploy"]) && pickOK("w_m7c",["tar"]),
    msg:"Re-read the run: the first ERROR line is 02:11:09 (ssh timeout, stage=deploy) — build and test printed OK before it. Stage = deploy. The preserved bundle is nrl-patch-2026-11.tar — 'tar' is listed under Packages in the objectives, not a flat file."}),
  passMsg:"<b>Stamped.</b> First failure: 02:11:09, stage=deploy, SSH timeouts to 12 specific targets; the pipeline halted safely and preserved the tar-bundle artifact. Detection reading order: scan for stage + status, anchor on the first ERROR, then reason about scope (12 hosts = network path, not the patch content). That's how defenders read automation telemetry." },

{ obj:"M12", no:"WO-12", station:"st09", pillar:"SYNTHESIS", pillarShort:"SYN", short:"Full pipeline run end-to-end",
  title:"Capstone: run the change end-to-end",
  brief:"A reviewed change to the manifest API is on the dock. Run it through the plant <b>in pipeline order</b> — commit through verified production. Wrong order jams the conveyor and resets the run.",
  hints:["The order is the conveyor you assembled at Station 03: integration happens at commit/merge time, then build.","Testing and packaging precede shipping; verification closes the loop AFTER deploy.","If the conveyor jams, read the stage names left to right: COMMIT → BUILD → TEST → PACKAGE → DEPLOY → VERIFY."],
  widgets:[{type:"machine", key:"w_m12",
    btns:[{id:"c",t:"COMMIT CHANGE"},{id:"b",t:"BUILD"},{id:"t",t:"TEST"},{id:"pk",t:"PACKAGE ARTIFACT"},{id:"d",t:"DEPLOY"},{id:"v",t:"VERIFY & MONITOR"}]}],
  hook: cvHook([["c","COMMIT"],["b","BUILD"],["t","TEST"],["pk","PACKAGE"],["d","DEPLOY"],["v","VERIFY"]], "Conveyor jammed — that stage doesn't run yet."),
  check:(E)=>({pass: machOK("w_m12",["c","b","t","pk","d","v"]),
    msg:"The run isn't complete in pipeline order: COMMIT → BUILD → TEST → PACKAGE ARTIFACT → DEPLOY → VERIFY & MONITOR. Run it clean from the start."}),
  passMsg:"<b>Stamped.</b> Commit → build → test → package → deploy → verify: you just executed the entire automation lifecycle the lesson teaches — source control feeding a CI/CD pipeline that ships and verifies. Twelve of twelve. The floor is yours, operator." }
];

/* ===== HARD WORK ORDERS (9 objectives) ===== */
/* ================= HARD WORK ORDERS (9 objectives) ================= */
const WO_HARD = [
{ obj:"H7", no:"WO-H1", station:"st01", pillar:"P2 RECOGNIZE", pillarShort:"P2", short:"Diagnose skipped source-control control",
  title:"Incident review: the unreviewed hotfix",
  brief:"Night-shift incident: 03:12, a hotfix was committed <b>directly on main</b> and deployed by the pipeline. Billing broke for a morning. Answer both parts <b>exactly</b> — near-misses are rejected.",
  hints:["Ask what SHOULD have stood between the commit and the merge on main."],
  widgets:[
    {type:"pick", key:"w_h7a", opts:[
      {id:"branch", t:"Branch management — the hotfix should have been developed on main"},
      {id:"pr", t:"Pull request + code review — the change never went through one"},
      {id:"push", t:"Code push — pushing should be forbidden entirely"},
      {id:"ver", t:"Version management — the change was not recorded"}
    ]},
    {type:"pick", key:"w_h7b", opts:[
      {id:"a", t:"Commit directly on main, review after deployment"},
      {id:"b", t:"Cut a hotfix branch from main, open a pull request into main, review, then merge"},
      {id:"c", t:"Delete main and recreate it from the hotfix branch"},
      {id:"d", t:"Push to main and request a retroactive review tag"}
    ]}
  ],
  check:(E)=>({pass: pickOK("w_h7a",["pr"]) && pickOK("w_h7b",["b"]),
    msg:"Near-miss rejected. Part 1: the change WAS recorded (version management worked) and pushing isn't the disease — what was skipped is the pull request + code review gate. Part 2: hotfixes still travel through a branch → PR → review → merge, just expedited; retroactive review is not review."}),
  passMsg:"<b>Stamped.</b> Skipped control: pull request + code review. Correct flow: hotfix branch from main → PR → review → merge. Under pressure, the discipline IS the control — the exam expects you to name it and defend it." },

{ obj:"H1", no:"WO-H2", station:"st02", pillar:"P2 RECOGNIZE", pillarShort:"P2", short:"Design the tool chain for a build-out",
  title:"Build-out: pick the exact tool chain",
  brief:"The plant is opening a new depot: 40 VMs, baseline configuration on every host, and fleet health visibility for the rollout lead. Sign out <b>exactly one tool per socket</b> from the full crib — distractors included.",
  hints:["One socket is about CREATING infrastructure repeatably from code, one about ENFORCING configuration on existing hosts, one about DASHBOARDS.","'Agentless' and 'YAML playbooks' belong to one specific tool; 'declarative desired-state provisioning' to another.","Dashboards and alerting over metrics = the Grafana socket; the log stack would be a different (unasked) job."],
  widgets:[{type:"assign", key:"w_h1",
    chips:[{id:"git",t:"Git"},{id:"terraform",t:"Terraform"},{id:"ansible",t:"Ansible"},{id:"docker",t:"Docker"},{id:"k8s",t:"Kubernetes"},{id:"jenkins",t:"Jenkins"},{id:"gha",t:"GitHub Actions"},{id:"elk",t:"ELK stack"},{id:"grafana",t:"Grafana"}],
    socks:[
      {id:"s1", t:"Stand up 40 VMs + networks repeatably from declarative code (reviewable, re-runnable)"},
      {id:"s2", t:"Enforce baseline config (users, packages, firewall) on every host — agentless"},
      {id:"s3", t:"Fleet health dashboards with alerting for the rollout lead"}
    ]}],
  check:(E)=>({pass: assignOK("w_h1",{s1:"terraform",s2:"ansible",s3:"grafana"}),
    msg:"Near-miss rejected. Provisioning from declarative code = Terraform (not Ansible — that enforces config ON hosts; not Jenkins/GitHub Actions — those RUN pipelines). Agentless config automation = Ansible. Metrics dashboards = Grafana (not ELK — that's logs)."}),
  passMsg:"<b>Stamped.</b> Terraform provisions, Ansible configures, Grafana observes. The three-horse chain most estates actually run — and a perfect 5.4 exam answer. The distractors (Docker, Kubernetes, Jenkins, GitHub Actions, Git, ELK) all have real jobs, just not these three." },

{ obj:"H8", no:"WO-H3", station:"st03", pillar:"P1 UNDERSTAND", pillarShort:"P1", short:"Match CI/CD concepts to definitions",
  title:"Concept board: eight terms, eight definitions",
  brief:"The night crew left the concept board scrambled. Match all eight exactly — including the two the day shift never touched: <b>idempotency</b> and <b>desired state</b>.",
  hints:["'Running twice leaves the same result' — that's the re-run-safety property of good automation code.","'What the code declares' vs 'what actually runs' — one of these is a noun-state, and it pairs with drift.","Artifact is the OUTPUT, build is the ACT of producing it, repository is where either is STORED."],
  widgets:[{type:"assign", key:"w_h8",
    chips:[{id:"art",t:"Artifact"},{id:"bld",t:"Build"},{id:"orc",t:"Orchestration"},{id:"idm",t:"Idempotency"},{id:"des",t:"Desired state"},{id:"int",t:"Code integration"},{id:"wfl",t:"Workflow"},{id:"rep",t:"Repository"}],
    socks:[
      {id:"s1", t:"Versioned output of a build: image, package or archive"},
      {id:"s2", t:"Turning source code into a runnable output"},
      {id:"s3", t:"Coordinating multiple automated tasks into one end-to-end workflow"},
      {id:"s4", t:"Running the same code twice yields the same result — safe to re-run"},
      {id:"s5", t:"What the code declares a system should look like"},
      {id:"s6", t:"Merging changes together and triggering validation"},
      {id:"s7", t:"The defined sequence of pipeline stages and approvals"},
      {id:"s8", t:"Versioned storage for code or artifacts (public or private)"}
    ]}],
  check:(E)=>({pass: assignOK("w_h8",{s1:"art",s2:"bld",s3:"orc",s4:"idm",s5:"des",s6:"int",s7:"wfl",s8:"rep"}),
    msg:"Re-match: Artifact=output · Build=the act · Orchestration=coordination · Idempotency=same result on re-run · Desired state=the declared look · Code integration=merge + trigger · Workflow=the stage sequence · Repository=versioned storage."}),
  passMsg:"<b>Stamped.</b> Eight exact matches, including the two properties that make automation trustworthy: idempotent code is safe to re-run, and desired state gives drift something to be measured against. Vocabulary at exam depth." },

{ obj:"H5", no:"WO-H4", station:"st04", pillar:"P3 DETECT", pillarShort:"P3", short:"Map six integrations to exact styles",
  title:"Bus routing table: exact styles and triggers",
  brief:"Six live signals, six exact routes. Use the precise terms — near-misses ('REST API' for a webhook scenario, etc.) are rejected with a reason.",
  hints:["Two signals are about WHO calls WHOM with a contract (one XML, one URL+verbs); two are about LIVE data paths; one is about query efficiency; one is about WHAT FIRES the automation.","'No schedule involved' rules out every polling option for the bucket signal — the automation is invoked BY the event.","A single remote procedure call by name = RPC, even though it runs over a network."],
  widgets:[{type:"assign", key:"w_h5",
    chips:[{id:"rest",t:"REST web service"},{id:"soap",t:"SOAP web service"},{id:"rpc",t:"RPC"},{id:"ws",t:"Web socket stream"},{id:"gql",t:"GraphQL query"},{id:"hook",t:"Event-driven webhook"}],
    socks:[
      {id:"s1", t:"Payment partner calls predictable HTTPS endpoints with GET/POST verbs"},
      {id:"s2", t:"Mainframe exchange uses strict XML envelope contracts"},
      {id:"s3", t:"Badge reader invokes one remote procedure on the access server"},
      {id:"s4", t:"Fleet map updates live as trucks report positions"},
      {id:"s5", t:"Ops console pulls exactly the fields it needs for 40 resources in one request"},
      {id:"s6", t:"Bucket exposure flips remediation automation within seconds — no schedule involved"}
    ]}],
  check:(E)=>({pass: assignOK("w_h5",{s1:"rest",s2:"soap",s3:"rpc",s4:"ws",s5:"gql",s6:"hook"}),
    msg:"Re-route exactly: URL+verbs contract = REST · XML envelope contract = SOAP · named remote procedure = RPC · live persistent push = web socket stream · one-request field selection = GraphQL query · automation invoked BY the event = event-driven webhook."}),
  passMsg:"<b>Stamped.</b> All six routed by their signatures. On the exam, the scenario text always contains the tell — verbs, envelopes, procedures, streams, field selection, or 'the event itself fired the automation'." },

{ obj:"H6", no:"WO-H5", station:"st05", pillar:"P4 MITIGATE", pillarShort:"P4", short:"Sequence pipeline guardrails",
  title:"Hardening order: sequence the guardrails",
  brief:"The foreman approved five guardrails for the pipeline. They must be introduced <b>in the order that makes each next one possible and enforceable</b>. Sequence all five exactly; a wrong order jams the gate.",
  hints:["You cannot require reviews on a branch people can still push to directly — protection comes first.","Tests must exist in the workflow BEFORE you start trusting them as a gate; and you scope the service account BEFORE giving it more to do.","Rollback comes from versioned artifacts — enable that before you need it at 3 a.m."],
  widgets:[{type:"seq", key:"w_h6", items:[
      {id:"g1", t:"Enable branch protection on main — no direct pushes"},
      {id:"g2", t:"Require pull-request code review to merge"},
      {id:"g3", t:"Run pipeline tests against staging before any production apply"},
      {id:"g4", t:"Scope the pipeline service account to the staging project (least privilege)"},
      {id:"g5", t:"Enable versioned artifacts + automated rollback"}
    ]}],
  check:(E)=>({pass: seqOK("w_h6",["g1","g2","g3","g4","g5"]),
    msg:"Sequence rejected. Order that makes each step enforceable: branch protection (stop direct pushes) → require PR review (now meaningful) → staging tests before prod applies → least-privilege service account scoped to staging → versioned artifacts + rollback as the safety net."}),
  passMsg:"<b>Stamped.</b> Protection → review → test-gate → least privilege → rollback. Sequenced control rollouts are the difference between guardrails and decoration — and this list is the M1026/M1054 playbook in the order an auditor would want to see it." },

{ obj:"H2", no:"WO-H6", station:"st06", pillar:"P2 RECOGNIZE", pillarShort:"P2", short:"Drift hunt across the fleet",
  title:"Fleet audit: one true drift, two red herrings",
  brief:"Six resources, one auditor's claim: 'something in this fleet is drifting.' <b>Flag the ONE resource whose live state contradicts its own declared desired state</b> — two rows will look suspicious but are innocent. Then name the drifted attribute and its declared value exactly.",
  hints:["Drift is defined per-resource: compare each row's declared value to ITS OWN live value, not to the rest of the fleet.","One resource is intentionally bigger than its peers, and one lives in an unusual region — check whether their declarations match their reality before judging them.","The true drift breaks a SAFETY property: something that used to happen every night no longer happens at all."],
  widgets:[
    {type:"mark", key:"w_h2a", cols:["RESOURCE","DECLARED DESIRED","ACTUAL LIVE"],
      rows:[
        {id:"r1", cells:["web-prod-01","image: ami-nrl-2204","ami-nrl-2204"]},
        {id:"r2", cells:["web-prod-02","image: ami-nrl-2204","ami-nrl-2204"]},
        {id:"r3", cells:["warehouse-db-02","backup: 02:00 daily","backup: disabled"]},
        {id:"r4", cells:["edge-cache-01","size: t3.large (intentional)","t3.large"]},
        {id:"r5", cells:["logs-archive-01","tag region: eu-west (intentional)","eu-west"]},
        {id:"r6", cells:["api-gw-01","replicas: 3","3"]}
      ]},
    {type:"pick", key:"w_h2b", opts:[
      {id:"img", t:"Image tag"},{id:"bak", t:"Backup schedule"},{id:"size", t:"Instance size"},{id:"rep", t:"Replica count"}
    ]},
    {type:"pick", key:"w_h2c", opts:[
      {id:"ami", t:"image ami-nrl-2204"},{id:"large", t:"size t3.large"},{id:"daily", t:"backup 02:00 daily"},{id:"three", t:"replicas: 3"}
    ]}
  ],
  check:(E)=>({pass: flagOK("w_h2a",["r3"]) && pickOK("w_h2b",["bak"]) && pickOK("w_h2c",["daily"]),
    msg:"Red herrings rejected: edge-cache-01 (t3.large) and logs-archive-01 (eu-west) look unusual but MATCH their own declarations — unusual ≠ drifted. The true contradiction: warehouse-db-02 declares nightly 02:00 backups but its live backup schedule is DISABLED. Flag only that row, attribute = backup schedule, declared value = 02:00 daily."}),
  passMsg:"<b>Stamped.</b> One true drift: warehouse-db-02 lost its nightly backup — a silent resilience failure, exactly the class of drift auditors lose sleep over. You resisted the fleet-comparison trap: drift is declared-vs-live per resource, not outlier detection. That distinction separates operators from spreadsheet watchers." },

{ obj:"H4", no:"WO-H7", station:"st07", pillar:"P4 MITIGATE", pillarShort:"P4", short:"Rebuild the remediation runbook",
  title:"Runbook rebuild: order it, and cut the poison step",
  brief:"A config regression hit six manifest servers. The old runbook is on the bench — <b>rebuild it in the correct order</b> and <b>leave out the step that must never appear in a runbook</b> (it's still in the pile — don't tap it).",
  hints:["First duties: declare the incident and preserve evidence (snapshot = rollback point) BEFORE touching anything.","You rehearse against the versioned artifact in staging BEFORE applying anything anywhere — one of the cards wants you to skip exactly that.","After production is verified, the fix must be folded back into source control, or the next apply re-introduces the fault."],
  widgets:[{type:"seq", key:"w_h4", items:[
      {id:"rb1", t:"Declare the incident: page on-call, open the ticket"},
      {id:"rb2", t:"Snapshot the affected instances (evidence + rollback point)"},
      {id:"rb3", t:"Reproduce the fault in staging against the versioned artifact"},
      {id:"rb4", t:"SKIP STAGING — apply the fix straight to production to save time", hazard:true},
      {id:"rb5", t:"Apply the reviewed fix via the pipeline (canary ring first)"},
      {id:"rb6", t:"Verify convergence: desired-vs-live diff clean, metrics nominal"},
      {id:"rb7", t:"Fold the manual hotfix into source control + post-incident review"}
    ]}],
  check:(E)=>({pass: seqOK("w_h4",["rb1","rb2","rb3","rb5","rb6","rb7"]),
    msg:"Rejected. Correct order: declare → snapshot → reproduce in staging → apply via pipeline (canary first) → verify convergence → fold back into source control. And the poison step ('skip staging, straight to prod') must not be in the sequence at all — that's how one bad night becomes two."}),
  passMsg:"<b>Stamped.</b> A runbook is automation's source code: evidence preserved, fix rehearsed, canary first, convergence verified, knowledge folded back. You also cut the poison step — automation amplifies whatever you feed it, and a runbook that skips rehearsal feeds it luck." },

{ obj:"H3", no:"WO-H8", station:"st08", pillar:"P3 DETECT", pillarShort:"P3", short:"Pipeline forensics on a week of runs",
  title:"Forensics: a week of runs, one root cause",
  brief:"Four days of pipeline history and a Grafana extract. <b>Click the ONE root-cause line</b> (not the halt, not the recovery), then name the <b>failing stage</b> and the <b>correct corrective action</b>.",
  hints:["The halt line and the credential-fix line are consequences and responses, not the cause — find the line where the system first explains WHY it refused.","Read the error text literally: it names a permission ('lacks pull secret') and a repository state ('PRIVATE').","The fix must preserve the security property of that repository state — 'make it public' is a trap."],
  widgets:[
    {type:"log", key:"w_h3a", lines:[
      {id:"h1", c:"ok",  t:"[Mon 02:00] run 4201 — build OK · test OK · package OK · deploy OK (6m12s)"},
      {id:"h2", c:"ok",  t:"[Tue 02:00] run 4202 — build OK · test OK · package OK · deploy OK (6m30s)"},
      {id:"h3", c:"err", t:"[Wed 02:07] run 4203 — stage=package: docker push DENIED — registry.nimbusrail.example/fleet-agent is PRIVATE; pipeline identity lacks pull secret"},
      {id:"h4", c:"err", t:"[Wed 02:09] run 4203 — pipeline HALT at stage=package"},
      {id:"h5", c:"warn",t:"[Wed 02:15] oncall adds registry credential to the pipeline identity (scoped, pull-only)"},
      {id:"h6", c:"ok",  t:"[Thu 02:00] run 4204 — build OK · test OK · package OK · deploy OK (6m18s)"},
      {id:"h7", c:"ok",  t:"[Grafana] deploy-duration p95 stable ~6m; package stage: 0 failures Mon/Tue, 1 failure Wed"}
    ]},
    {type:"pick", key:"w_h3b", opts:[
      {id:"build", t:"stage = build"},{id:"test", t:"stage = test"},{id:"pkg", t:"stage = package"},{id:"deploy", t:"stage = deploy"}
    ]},
    {type:"pick", key:"w_h3c", opts:[
      {id:"pub", t:"Make the registry repository public so pushes always succeed"},
      {id:"cred", t:"Grant the pipeline identity a scoped, pull-only registry credential"},
      {id:"retry", t:"Re-run the pipeline until the push succeeds"},
      {id:"del", t:"Delete the fleet-agent repository"}
    ]}
  ],
  check:(E)=>({pass: logOK("w_h3a","h3") && pickOK("w_h3b",["pkg"]) && pickOK("w_h3c",["cred"]),
    msg:"Near-miss rejected. The HALT (02:09) is a consequence; the credential fix (02:15) is a response. The root cause is 02:07: package-stage push denied because the private registry's identity lacked the pull secret. Stage = package. Correct fix = scoped credential (making the registry public 'fixes' the push by leaking the estate — rejected)."}),
  passMsg:"<b>Stamped.</b> Root cause: 02:07 — private registry, missing pull secret, stage=package. Fix: scoped pull-only credential — least privilege preserved. You traced consequence vs cause vs response across a week of telemetry, which is precisely the Domain 6.0 skill this domain feeds." },

{ obj:"H9", no:"WO-H9", station:"st09", pillar:"SYNTHESIS", pillarShort:"SYN", short:"Blackout drill: full incident shift",
  title:"Blackout drill: save the deploy",
  brief:"02:41, night shift. The pipeline's <b>test stage just failed</b> on a config regression, and the deploy button is glowing. Run the incident response <b>in order</b>: keep the bad build out, fix forward properly, prove it. A wrong action jams the line.",
  hints:["The test stage already told you the build is bad — the very next action gates the deploy.","'Fix forward' means the fix is built and validated like any change — in staging, through the pipeline.","After the re-run is green, close the loop: verify the desired state actually converged."],
  widgets:[{type:"machine", key:"w_h9",
    btns:[{id:"run",t:"RUN PIPELINE"},{id:"block",t:"BLOCK DEPLOY (test failed)", cls:"danger"},{id:"fix",t:"APPLY FIX IN STAGING"},{id:"rerun",t:"RE-RUN PIPELINE"},{id:"verify",t:"VERIFY CONVERGED", cls:"go"}]}],
  hook: cvHook([["run","RUN"],["block","BLOCK"],["fix","FIX"],["rerun","RERUN"],["verify","VERIFY"]], "Line jammed — wrong action for this moment."),
  check:(E)=>({pass: machOK("w_h9",["run","block","fix","rerun","verify"]),
    msg:"The drill isn't complete in order: RUN PIPELINE → BLOCK DEPLOY → APPLY FIX IN STAGING → RE-RUN PIPELINE → VERIFY CONVERGED. Shipping an unverified fix or skipping the gate jams the line."}),
  passMsg:"<b>Stamped.</b> Run → block → fix in staging → re-run → verify: the complete safe-automation reflex under pressure. You gated a bad build, fixed forward through the pipeline instead of around it, and proved convergence. That is Lesson 5.1's promise kept: automation streamlining operations WITHOUT surrendering control." }
];

/* ===== QUIZ DATA (C5) ===== */
/* ================= QUIZ DATA (C5) ================= */
const QUIZ = {
  medium: [
    { q:"Which statement best captures automation vs orchestration?",
      opts:["Automation and orchestration are identical practices","Automation coordinates tasks; orchestration runs single scripts","Orchestration coordinates many automated tasks into workflows","Only orchestration can run without human oversight"],
      correct:2, focus:"automation vs orchestration",
      exp:"Automation = tools running single repetitive tasks; orchestration = coordinating many automated tasks (often across systems) into one workflow — the CI/CD pipeline is orchestration built from automated steps. The first option erases the distinction, the second swaps the two roles, and neither practice is defined by running without humans." },
    { q:"Which of these is a RISK of automation rather than a benefit?",
      opts:["Bad scripts replicate errors at machine speed","Fleets patch overnight while the humans sleep","Identical, repeatable provisioning on every single run","Every change is versioned and fully attributable"],
      correct:0, focus:"automation risks — error replication",
      exp:"Automation amplifies whatever it is fed — a buggy script misconfigured 200 instances in four minutes at NimbusRail. The other three are classic benefits: off-hours throughput, consistency, auditability." },
    { q:"In a healthy source-control workflow, what normally happens before a pull request can merge?",
      opts:["Artifact signing","Direct push to main","Nightly scheduled build","Code review approval"],
      correct:3, focus:"source-control gates — code review",
      exp:"The pull request exists to be reviewed: code review is the quality-and-security gate before merge. Direct pushes to protected main bypass the entire control; artifact signing and nightly builds happen elsewhere in the pipeline." },
    { q:"Which artifact boots an entire machine?",
      opts:["RPM package","VM image","ZIP archive","Container image"],
      correct:1, focus:"artifact types — VM vs container vs package",
      exp:"A VM image is a complete bootable disk template. Container images package an app with its runtime; RPM/ZIP packages install into an existing OS." },
    { q:"A storage bucket suddenly becomes public. Which trigger remediates it soonest?",
      opts:["Event-driven webhook on that event","Nightly scheduled job at 02:00","Monthly threshold report","Weekly manual review"],
      correct:0, focus:"event-driven vs scheduled automation",
      exp:"Only an event-driven trigger reacts the moment the event occurs — that's how NimbusRail's exposure lasted 41 seconds instead of up to 24 hours on a schedule." },
    { q:"Which tool provisions infrastructure from declarative code?",
      opts:["Grafana","Kubernetes","Terraform","ELK stack"],
      correct:2, focus:"IaC tooling — declarative provisioning",
      exp:"Terraform is the declarative IaC provisioning tool. Kubernetes orchestrates containers, Grafana dashboards metrics, ELK handles logs — all important, none of them provisions infrastructure." }
  ],
  hard: [
    { q:"TRIAGE — The 02:00 patch run halts at deploy: SSH timeouts to exactly 12 of 300 targets; build and test were OK. Where do you investigate first?",
      opts:["Correctness of the patch content itself","Grafana dashboard permissions","Registry visibility settings","SSH reachability of those 12 hosts"],
      correct:3, focus:"triage by failure scope",
      exp:"Scope tells the story: 12 specific IPs timing out on SSH with a healthy build/test means the path to those hosts — network, firewall, credentials — not the patch itself, which ran fine on 288 targets. Dashboards and registry visibility would not selectively drop SSH." },
    { q:"A config script ran twice and each user account still appears exactly once. The script is best described as:",
      opts:["Declarative","Idempotent","Orchestrated","Event-driven"],
      correct:1, focus:"idempotency",
      exp:"Idempotency: running the same automation twice leaves the same result — safe re-runs. It's the property that makes desired-state automation trustworthy. Declarative describes how intent is expressed, not the re-run guarantee." },
    { q:"The pipeline builds proprietary, internal-only artifacts. Where do they belong?",
      opts:["A private, access-controlled artifact repository","A public repository for easy access","A public container registry","Email to each developer"],
      correct:0, focus:"artifact repository access control",
      exp:"Proprietary artifacts live in private, access-controlled repositories — public storage would hand the estate's blueprints to strangers, and email leaves no versioned, scannable record." },
    { q:"A teammate proposes automating the quarterly budget approval with a cron job. Your advice:",
      opts:["Automate it — it repeats every quarter","Automate it but skip the approval step","Keep it human; judgment cannot be scripted","Automate it and archive the records"],
      correct:2, focus:"what should stay human",
      exp:"Repetition alone doesn't make a task automatable: budget approval needs business judgment and human accountability. Automate the repeatable and well-defined; keep judgment calls human. Skipping the approval or archiving records doesn't fix the judgment gap." },
    { q:"The pipeline's service account can delete the entire estate. The best fix is:",
      opts:["Scope it least-privilege and rotate credentials","Share it with developers for convenience","Grant it admin so it errors less","Delete the pipeline entirely"],
      correct:0, focus:"least privilege for service accounts",
      exp:"Credential concentration is the risk: least privilege + rotation bounds the blast radius (ATT&CK M1026 Privileged Account Management thinking). More privilege to 'reduce errors' multiplies the risk; sharing credentials spreads it; deleting the pipeline kills the automation instead of the risk." },
    { q:"Where does a pipeline most directly stop a vulnerable dependency from shipping?",
      opts:["In the compile and build stage","In the package stage","In the verify stage","In the security scan stage"],
      correct:3, focus:"pipeline security scanning stage",
      exp:"The security scan stage inspects dependencies and configuration before anything is packaged or shipped — it is the gate that rejects the vulnerable version. Build, package and verify stages move artifacts along but never scan them." },
    { q:"A truck-tracking map must update live as positions stream in. The fitting integration style is:",
      opts:["A weekly GraphQL snapshot","A web socket stream","SOAP exchanged once a day","Nightly FTP drop"],
      correct:1, focus:"integration styles for live data",
      exp:"Live, continuous, two-way push = web sockets. GraphQL would fetch fields efficiently but not stream; scheduled transfers leave the map stale between runs." }
  ]
};
