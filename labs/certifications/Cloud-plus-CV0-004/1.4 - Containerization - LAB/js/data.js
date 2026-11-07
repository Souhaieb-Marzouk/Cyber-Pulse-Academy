/**
 * HarborOps Lab — data layer (static port).
 * CompTIA Cloud+ CV0-004 — Lesson 1.4: Containerization
 * 1:1 transcription of the original framework lab's src/lib/lab/data.ts —
 * same constants, same wording, same correct answers, same hint tiers.
 * All data is synthetic training data. Fictional org: Port Meridian Freight Authority.
 * MITRE references are awareness-level and verified against attack.mitre.org.
 */
(function (global) {
  "use strict";

  var PILLAR_META = {
    P1: { label: "Understand", short: "What containerization is and why cloud teams use it" },
    P2: { label: "Recognize / Analyze", short: "Spot container artifacts in realistic evidence and analyze them" },
    P3: { label: "Observe & Verify", short: "Read live cluster signals and catch misconfiguration (adapted Detect pillar)" },
    P4: { label: "Plan & Control", short: "Choose controls, map responsibility, name residual risk (adapted Mitigate pillar)" },
  };

  /* ------------------------------------------------------------------ */
  /* Glossary (CI-11)                                                    */
  /* ------------------------------------------------------------------ */
  var GLOSSARY = [
    { term: "Container", def: "A running, isolated instance of an application packaged with its dependencies, sharing the host OS kernel." },
    { term: "Image", def: "The read-only template a container is started from — like a boxed cargo unit waiting to be lifted." },
    { term: "Layer", def: "One build step of an image, stacked and shared between images to save space and pull time." },
    { term: "Tag", def: "A human-friendly label on an image version, e.g. cargo-portal:1.4.0. Mutable unless pinned." },
    { term: "Digest", def: "An immutable cryptographic hash of an exact image build — the strongest way to pin a version." },
    { term: "Registry", def: "A warehouse for images; push builds there, pull from there to run (public or private)." },
    { term: "Dockerfile", def: "The manifest of build instructions that assembles an image layer by layer." },
    { term: "Container engine", def: "Host software (e.g. Docker, containerd) that runs containers using kernel isolation." },
    { term: "Namespace", def: "Kernel feature that gives a container its own private view of processes, network and mounts. (simplified)" },
    { term: "cgroup", def: "Kernel feature that caps the CPU/memory a container may consume. (simplified)" },
    { term: "Orchestration", def: "Automated scheduling, scaling and healing of containers across a cluster of nodes." },
    { term: "Replica", def: "One copy of a container in a deployment; more replicas = horizontal scale." },
    { term: "Self-healing", def: "The orchestrator replacing failed containers automatically to restore the declared state." },
    { term: "Rolling update", def: "Replacing replicas gradually so the service never goes dark during a version change." },
    { term: "Service discovery", def: "How containers find each other by name (DNS) even as they are rescheduled." },
    { term: "Persistent volume", def: "Storage that outlives any single container — required for stateful workloads." },
    { term: "Stateless / Stateful", def: "Stateless workloads keep no local data and can be replaced freely; stateful ones must not lose it." },
    { term: "Microservices", def: "An architecture of small, loosely coupled services, each independently deployable — often containerized." },
    { term: "Portability", def: "The promise that an image runs the same on any host with a container engine." },
    { term: "Density", def: "How many workloads fit on one host — containers score high because there is no guest OS tax." },
  ];

  /* ------------------------------------------------------------------ */
  /* Berth diagram — VM vs Container stacks (CI-1, CI-2, CI-5)           */
  /* ------------------------------------------------------------------ */
  var BERTH_COMPONENTS = [
    { id: "hardware", label: "Physical hardware", side: "both", note: "Both stacks run on the same physical iron." },
    { id: "hypervisor", label: "Hypervisor", side: "vm", note: "VMs need a hypervisor to slice hardware into virtual machines." },
    { id: "guestos", label: "Guest OS (per workload)", side: "vm", note: "Every VM carries a full, licensed, patchable OS — heavy." },
    { id: "hostos", label: "Host OS", side: "both", note: "One OS on the host; its kernel is what containers share." },
    { id: "engine", label: "Container engine", side: "ct", note: "Runs containers using kernel namespaces + cgroups instead of a hypervisor." },
    { id: "bins", label: "App runtime + libraries", side: "both", note: "Both carry the app's runtime and libs — packaged in the image for containers." },
    { id: "app", label: "Application code", side: "both", note: "The payload is identical; the packaging around it differs." },
  ];
  /** M1 correct answer: components the VM stack needs but a container stack does not carry */
  var M1_ANSWER = ["hypervisor", "guestos"];
  /** M2 options: what every container on the host shares */
  var M2_OPTIONS = [
    { id: "guestos", label: "A private guest OS" },
    { id: "host-kernel", label: "The host OS kernel" },
    { id: "hypervisor", label: "A dedicated hypervisor" },
    { id: "registry", label: "The image registry" },
  ];
  var M2_ANSWER = "host-kernel";
  /** H1 classify chips */
  var H1_CHIPS = [
    { id: "hypervisor", label: "Hypervisor", cls: "vm" },
    { id: "guestos", label: "Guest OS", cls: "vm" },
    { id: "engine", label: "Container engine", cls: "ct" },
    { id: "namespaces", label: "Kernel namespaces + cgroups", cls: "ct" },
    { id: "appcode", label: "Application code + libraries", cls: "both" },
    { id: "hardware", label: "Physical hardware", cls: "both" },
  ];

  /* ------------------------------------------------------------------ */
  /* Build Bay — Dockerfile assembly (CI-3)                              */
  /* ------------------------------------------------------------------ */
  var DF_PALETTE = [
    { id: "from-pinned", text: "FROM node:20.11-alpine3.19" },
    { id: "from-latest", text: "FROM node:latest", trap: "Unpinned base — upstream can silently change it" },
    { id: "workdir", text: "WORKDIR /app" },
    { id: "copy", text: "COPY . ." },
    { id: "run-ci", text: "RUN npm ci --omit=dev" },
    { id: "user", text: "USER node" },
    { id: "expose", text: "EXPOSE 3000" },
    { id: "env-dev", text: "ENV NODE_ENV=development", trap: "Ships development mode to production" },
    { id: "cmd", text: "CMD [\"node\", \"server.js\"]" },
  ];
  var M4_ANSWER = ["from-pinned", "workdir", "copy", "run-ci", "expose", "cmd"];
  var H2_ANSWER = ["from-pinned", "workdir", "copy", "run-ci", "user", "expose", "cmd"];
  var DF_FEEDBACK_LINES = [
    "Step 1/6  FROM node:20.11-alpine3.19    → pinned base layer",
    "Step 2/6  WORKDIR /app                  → working-directory layer",
    "Step 3/6  COPY . .                      → application code layer",
    "Step 4/6  RUN npm ci --omit=dev         → dependency layer (cached while package files unchanged)",
    "Step 5/6  EXPOSE 3000                   → documents the service port",
    "Step 6/6  CMD [\"node\", \"server.js\"]     → default process when the container starts",
    "Successfully built cargo-portal:1.4.0 — 5 layers, 84 MB",
  ];

  /* ------------------------------------------------------------------ */
  /* Registry Yard — images, tags, layers (CI-4)                         */
  /* ------------------------------------------------------------------ */
  var YARD_IMAGES = [
    {
      id: "portal-140", name: "cargo-portal", tag: "1.4.0", digest: "sha256:9f2a41…c81e",
      layers: [
        { sha: "fa3c1b", label: "alpine base 3.19" },
        { sha: "9d21e0", label: "node 20.11 runtime" },
        { sha: "44b7ac", label: "npm dependencies" },
        { sha: "c8a1f2", label: "portal app code" },
        { sha: "e0d399", label: "config layer" },
      ],
      note: "Immutable version tag — this is what production pulls.",
    },
    {
      id: "portal-beta", name: "cargo-portal", tag: "1.4.1-beta", digest: "sha256:77bd02…9a10",
      layers: [
        { sha: "fa3c1b", label: "alpine base 3.19", shared: true },
        { sha: "9d21e0", label: "node 20.11 runtime", shared: true },
        { sha: "44b7ac", label: "npm dependencies", shared: true },
        { sha: "51fe9c", label: "portal app code (beta)" },
        { sha: "aa87d1", label: "config layer (beta)" },
      ],
      note: "Pre-release build. Never deploy me to production.",
    },
    {
      id: "portal-latest", name: "cargo-portal", tag: "latest", digest: "sha256:77bd02…9a10", mutable: true,
      layers: [],
      note: "Mutable pointer — currently aliases 1.4.1-beta and WILL move underneath you.",
    },
    {
      id: "orders-db", name: "orders-db", tag: "16.2", digest: "sha256:0a77c3…4b25",
      layers: [
        { sha: "fa3c1b", label: "alpine base 3.19", shared: true },
        { sha: "2c5e71", label: "database engine 16.2" },
        { sha: "8f0d2a", label: "engine config" },
        { sha: "b49c3d", label: "schema init scripts" },
      ],
      note: "Stateful service image — always pair with a persistent volume.",
    },
  ];
  var M3_ANSWER = 3; // new layers downloaded when pulling orders-db after cargo-portal:1.4.0
  var H10_TAG_ANSWER = "portal-140";
  var H10_REASON_OPTIONS = [
    { id: "immutable", label: "It is a pinned, immutable version" },
    { id: "newest", label: "It is the newest code available" },
    { id: "convention", label: "latest is the safest convention" },
    { id: "small", label: "It has the fewest layers" },
  ];
  var H10_REASON_ANSWER = "immutable";

  /* ------------------------------------------------------------------ */
  /* Crane Deck — orchestration (CI-6, CI-7)                             */
  /* ------------------------------------------------------------------ */
  var NODES = ["node-01", "node-02", "node-03"];
  var M7_REPLICAS = 5;
  var M12_REPLICAS_MIN = 2;
  var M12_TAG = "1.5.0";

  /** Manifest shown in Crane Deck — 8 lines, 5 are misconfigurations (H6) */
  var MANIFEST_LINES = [
    { n: 1, text: "image: cargo-portal:latest", bad: true, why: "Unpinned mutable tag — builds are not reproducible; 'latest' can move at any time." },
    { n: 2, text: "replicas: 1", bad: true, why: "A single replica means one failure = an outage, and rolling updates dip availability." },
    { n: 3, text: "labels:", bad: false, why: "Labels are harmless metadata for organization and selection." },
    { n: 4, text: "  team: freight", bad: false, why: "Label value — metadata only." },
    { n: 5, text: "resources.limits: unset", bad: true, why: "No CPU/memory caps lets one container starve its neighbors (noisy neighbor)." },
    { n: 6, text: "runAsUser: 0 (root)", bad: true, why: "Root inside the container widens the blast radius of any takeover." },
    { n: 7, text: "healthcheck: none", bad: true, why: "Without health checks the orchestrator cannot detect or replace a wedged container." },
    { n: 8, text: "ports: 3000", bad: false, why: "Declaring the service port is normal, expected practice." },
  ];
  var H6_ANSWER = [1, 2, 5, 6, 7];

  var AMENDMENTS = [
    { id: "pin-tag", label: "Pin image tag to cargo-portal:1.4.0", prevents: "Unreproducible builds / silent upstream change" },
    { id: "set-limits", label: "Set CPU & memory limits (250m / 512Mi)", prevents: "Noisy-neighbor starvation" },
    { id: "add-healthcheck", label: "Add /healthz readiness check", prevents: "Wedged containers serving traffic" },
    { id: "raise-replicas", label: "Raise replicas to 3", prevents: "Single-replica outage" },
    { id: "drop-root", label: "Run as non-root user (uid 1000)", prevents: "Privilege escalation blast radius" },
    { id: "bind-pv", label: "Bind persistent volume to orders-db", prevents: "Data loss on restart/replacement" },
  ];
  /** H7: all fixes + this ordering constraint */
  var H7_ORDER_RULE = { before: "bind-pv", after: "raise-replicas" };

  /* ------------------------------------------------------------------ */
  /* Manifest Office — workload placement (CI-5, CI-8)                   */
  /* ------------------------------------------------------------------ */
  var MODEL_META = {
    vm: { label: "Virtual Machine", hint: "Full OS control, legacy stacks, GPU pass-through, long-lived jobs" },
    container: { label: "Containers (orchestrated)", hint: "Portable, dense, fast-scaling services — the cloud-native default" },
    serverless: { label: "Serverless / FaaS", hint: "Short event-driven bursts billed per invocation" },
    saas: { label: "SaaS", hint: "Buy the capability; consume it over the network" },
  };
  var WORKLOADS = [
    {
      id: "w1", name: "Berth Scheduling API", desc: "Stateless REST API. Traffic spikes 10× when storm advisories post. Team is cloud-native-first.",
      answer: "container",
    },
    {
      id: "w2", name: "COBOL Freight Billing (1998)", desc: "Legacy billing engine, vendor license tied to hardware, needs kernel modules and a tuned OS.",
      answer: "vm",
      justify: {
        prompt: "Why not containers for the billing engine?",
        options: [
          { id: "osctl", label: "It needs full OS control and kernel drivers" },
          { id: "cheap", label: "Containers cost more than VMs at this scale" },
          { id: "nogpu", label: "Containers cannot run business software" },
        ],
        answer: "osctl",
      },
    },
    {
      id: "w3", name: "Invoice Thumbnailer", desc: "Runs only when an invoice upload arrives; 400 ms of work, then idle for hours.",
      answer: "serverless",
    },
    {
      id: "w4", name: "Company-wide CRM", desc: "Management wants a ready-made customer platform maintained by a vendor; accessed via browser.",
      answer: "saas",
    },
    {
      id: "w5", name: "Orders Database", desc: "Stateful transactional store. Cloud-native-first mandate: keep it as a containerized service — but data must survive replacement.",
      answer: "container",
    },
    {
      id: "w6", name: "Cargo-Recognition Model Training", desc: "Multi-day GPU jobs on specialized hardware with direct accelerator access.",
      answer: "vm",
      justify: {
        prompt: "Why a VM for model training?",
        options: [
          { id: "gpu", label: "GPU pass-through and multi-day runtimes" },
          { id: "scale", label: "Containers cannot scale horizontally" },
          { id: "bill", label: "VMs are always billed per invocation" },
        ],
        answer: "gpu",
      },
    },
  ];

  /* ------------------------------------------------------------------ */
  /* Customs Desk — shared responsibility (CI-9)                         */
  /* ------------------------------------------------------------------ */
  var SR_STATEMENTS = [
    { id: "s1", text: "Physical security of the provider's datacenter", answer: "provider" },
    { id: "s2", text: "Availability of the managed Kubernetes control plane", answer: "provider" },
    { id: "s3", text: "Patching the application base image (the app's OS layer)", answer: "customer" },
    { id: "s4", text: "Scanning app images for vulnerable libraries before pushing", answer: "customer" },
    { id: "s5", text: "Restricting who can deploy into the cluster (IAM/policy)", answer: "customer" },
    { id: "s6", text: "Underlying networking and power infrastructure", answer: "provider" },
  ];
  var M11_STATEMENTS = ["s1", "s2", "s3", "s4"];
  var RESIDUAL_RISK_OPTIONS = [
    { id: "escape", label: "Shared-kernel escape (T1611) — isolation shrinks, never zeroes" },
    { id: "provider", label: "Provider outages that breach the responsibility model" },
    { id: "tags", label: "Pinned tags, because they freeze vulnerabilities in place" },
    { id: "density", label: "Density: packing containers raises everyone's risk" },
  ];
  var RESIDUAL_RISK_ANSWER = "escape";

  /* ------------------------------------------------------------------ */
  /* Incident File — "works on my machine" (CI-10, CI-3)                 */
  /* ------------------------------------------------------------------ */
  var INCIDENT_EVIDENCE = [
    { id: "e1", label: "Dev laptop sheet", body: "CargoPortal builds & serves fine. Node 20.11 · sharpix-codec v2.3 present (installed manually in March, not in any manifest)." },
    { id: "e2", label: "Staging build log", body: "Step 4/6 RUN npm ci --omit=dev … 214 packages. Container starts, then: Error: Cannot find module 'sharpix-codec' — exit code 1." },
    { id: "e3", label: "Staging runtime sheet", body: "Clean builder host — never touched by hand. Only layers from the image are present. No sharpix-codec anywhere." },
    { id: "e4", label: "DNS incident note", body: "Staging resolver blipped for 90 s yesterday; self-resolved. Unrelated services unaffected.", redHerring: true },
    { id: "e5", label: "Change ticket #2214", body: "VPC firewall rule widened for a printer subnet. Approved & reverted same day.", redHerring: true },
    { id: "e6", label: "Timezone diff note", body: "Dev machine TZ=UTC+8, staging TZ=UTC. Logs show offset shift only.", redHerring: true },
  ];
  /** M5: which two evidence snippets identify the ROOT CAUSE */
  var M5_ANSWER = ["e1", "e2"];
  var H3_MODULE_ANSWER = "sharpix-codec";
  var H3_FIX_OPTIONS = [
    { id: "bake", label: "Declare and pin the module in the image build" },
    { id: "ssh", label: "Install the module on the staging host by hand" },
    { id: "retry", label: "Retry the build until it passes" },
    { id: "rollback", label: "Roll staging back to the laptop image" },
  ];
  var H3_FIX_ANSWER = "bake";

  /* ------------------------------------------------------------------ */
  /* Objectives                                                          */
  /* ------------------------------------------------------------------ */
  var MEDIUM_OBJECTIVES = [
    {
      id: "M1", zone: "berth", pillar: "P1", anchor: "CI-1/CI-5 — VM vs container stacks",
      text: "At the Architecture Berth, tag the TWO components a VM stack needs but a container stack does not carry.",
      hints: [
        "Compare the two stacks row by row — what exists on the VM side only?",
        "One of them slices the hardware; the other is the OS each VM must carry.",
        "Pick Hypervisor and Guest OS (per workload).",
      ],
    },
    {
      id: "M2", zone: "berth", pillar: "P1", anchor: "CI-1 — shared kernel",
      text: "Select the single component EVERY container on the same host shares.",
      hints: [
        "It is the reason containers start in milliseconds instead of minutes.",
        "Containers do not boot their own OS — they borrow one component of the host's.",
        "The host OS kernel.",
      ],
    },
    {
      id: "M3", zone: "registry", pillar: "P1", anchor: "CI-4 — layer reuse",
      text: "In the Registry Yard, pull cargo-portal:1.4.0 and then orders-db:16.2, then record how many NEW layers the second pull had to download.",
      hints: [
        "Watch the pull log for the words ALREADY EXISTS.",
        "Images that share a base re-use its layers — count only the fresh ones.",
        "3 of the 4 orders-db layers are new (1 was already in the yard).",
      ],
    },
    {
      id: "M4", zone: "build", pillar: "P2", anchor: "CI-3 — Dockerfile & pinning",
      text: "In the Build Bay, assemble a production Dockerfile for CargoPortal: correct instruction order AND a pinned base image.",
      hints: [
        "FROM always leads. Pin an exact version — never latest.",
        "Order: base → workdir → code → dependencies → port → default process.",
        "FROM node:20.11-alpine3.19, WORKDIR /app, COPY . ., RUN npm ci --omit=dev, EXPOSE 3000, CMD [\"node\",\"server.js\"].",
      ],
    },
    {
      id: "M5", zone: "incident", pillar: "P2", anchor: "CI-10 — works-on-my-machine drift",
      text: "Open the Incident File and select the TWO evidence snippets that expose the root cause of the staging failure.",
      hints: [
        "One snippet shows what the dev machine has that the image does not.",
        "The other shows the clean build machine proving the module was never baked in.",
        "The Dev laptop sheet and the Staging build log.",
      ],
    },
    {
      id: "M6", zone: "office", pillar: "P2", anchor: "CI-5/CI-8 — workload placement",
      text: "At the Manifest Office, route all six intake workloads to the right compute model.",
      hints: [
        "Cloud-native-first: stateless APIs → containers; buy-not-build → SaaS.",
        "Event-driven 400 ms bursts → serverless; legacy OS/GPU constraints → VMs.",
        "W1 containers · W2 VM · W3 serverless · W4 SaaS · W5 containers · W6 VM.",
      ],
    },
    {
      id: "M7", zone: "crane", pillar: "P3", anchor: "CI-6 — horizontal scaling",
      text: "On the Crane Deck, deploy CargoPortal and scale it to exactly 5 replicas.",
      hints: [
        "Deploy first — the cranes cannot move boxes that are not in the system.",
        "Use the replicas slider; watch the event feed confirm each change.",
        "Slider to 5. The feed should read 'Scaled cargo-portal to 5 replicas'.",
      ],
    },
    {
      id: "M8", zone: "crane", pillar: "P3", anchor: "CI-6 — self-healing",
      text: "Inject a container failure and watch the orchestrator restore the declared state.",
      hints: [
        "There is a fault-injection control on the deck.",
        "Watch the feed: EXITED … then Rescheduled.",
        "Press 'Inject failure' once; self-healing replaces the container automatically.",
      ],
    },
    {
      id: "M9", zone: "crane", pillar: "P3", anchor: "CI-7 — persistent volumes",
      text: "Make the Orders DB survive a restart: bind a persistent volume, then restart it and confirm the data is intact.",
      hints: [
        "Container filesystems are ephemeral — replaced containers lose local data.",
        "Bind the persistent volume on the Orders DB card BEFORE restarting.",
        "Bind PV → Restart → feed reports 'data intact'.",
      ],
    },
    {
      id: "M10", zone: "crane", pillar: "P4", anchor: "CI-10 — manifest hygiene",
      text: "Apply ALL six amendments in the Amendments panel to harden the deployment manifest.",
      hints: [
        "Each amendment names the risk it removes — read the tooltips.",
        "Six switches: pin tag, limits, healthcheck, replicas, non-root, persistent volume.",
        "Flip every amendment switch until the panel reads 6/6.",
      ],
    },
    {
      id: "M11", zone: "customs", pillar: "P4", anchor: "CI-9 — shared responsibility",
      text: "At the Customs Desk, stamp all four statements as the provider's or the customer's duty.",
      hints: [
        "Managed container service: provider runs the platform, you own what you ship.",
        "Datacenter and control plane = provider; images, scanning, access policy = customer.",
        "S1 provider · S2 provider · S3 customer · S4 customer.",
      ],
    },
    {
      id: "M12", zone: "crane", pillar: "P2", anchor: "CI-6 — rolling updates",
      text: "Ship CargoPortal 1.5.0 with a rolling update and keep availability at 100% (make sure more than one replica is running first).",
      hints: [
        "A single replica forces a visible dip during replacement.",
        "Scale to 2+ replicas, then choose 1.5.0 in the release control.",
        "Replicas ≥ 2 → Rolling update to 1.5.0 → availability meter never leaves 100%.",
      ],
    },
  ];

  var HARD_OBJECTIVES = [
    {
      id: "H1", zone: "berth", pillar: "P1", anchor: "CI-1/CI-2 — architecture dissection",
      text: "Dissect the two stacks: classify all six components as VM-only, Container-only, or shared by both.",
      hints: ["Only one nudge available: think about what the kernel gives containers for free."],
    },
    {
      id: "H2", zone: "build", pillar: "P2", anchor: "CI-3 — exact minimal Dockerfile",
      text: "Build the exact minimal production image spec: 7 instructions, pinned base, non-root runtime — and exclude both trap chips.",
      hints: ["Only one nudge available: USER goes after dependencies, before the port."],
    },
    {
      id: "H3", zone: "incident", pillar: "P2", anchor: "CI-10/CI-3 — portability forensics",
      text: "Name the exact missing module from the evidence, then choose the durable fix.",
      hints: ["Only one nudge available: the module name appears twice in the logs — spell it exactly."],
    },
    {
      id: "H4", zone: "office", pillar: "P2", anchor: "CI-5/CI-8 — placement + justification",
      text: "Route all six workloads AND justify the two flagged ones with the correct reason chip.",
      hints: ["Only one nudge available: justification chips only appear for W2 and W6."],
    },
    {
      id: "H5", zone: "crane", pillar: "P3", anchor: "CI-6/CI-7/CI-10 — diagnosis",
      text: "Diagnose both production symptoms: why Orders DB loses data on every replacement, and why portal latency spikes under load.",
      hints: ["Only one nudge available: one symptom is storage, the other is neighbor starvation."],
    },
    {
      id: "H6", zone: "crane", pillar: "P3", anchor: "CI-10 — misconfiguration spotting",
      text: "Audit the 8-line manifest and select exactly the 5 misconfigured lines. Near-misses are rejected.",
      hints: ["Only one nudge available: two lines are perfectly normal metadata/port declarations."],
    },
    {
      id: "H7", zone: "crane", pillar: "P4", anchor: "CI-10/CI-7 — sequenced remediation",
      text: "Apply all six amendments IN THE RIGHT ORDER: storage before scaling the stateful service. Sequence is graded.",
      hints: ["Only one nudge available: a volume must exist before you add replicas that need it."],
    },
    {
      id: "H8", zone: "customs", pillar: "P4", anchor: "CI-9/CI-12 — responsibility + residual risk",
      text: "Stamp all six responsibility statements, then identify the residual risk that remains even after every control.",
      hints: ["Only one nudge available: the correct residual risk is on the MITRE card in the Logbook."],
    },
    {
      id: "H9", zone: "crane", pillar: "P2", anchor: "CI-6 — update under constraint",
      text: "Deliver 1.5.0 with zero availability dip and leave the deployment at 5 replicas on the new version.",
      hints: ["Only one nudge available: scale before you ship, not after."],
    },
    {
      id: "H10", zone: "registry", pillar: "P3", anchor: "CI-4 — registry hygiene",
      text: "Choose the ONLY tag fit for production from the yard and pick the reason that would convince your lead.",
      hints: ["Only one nudge available: one of these tags is a moving pointer to beta code."],
    },
  ];

  /* ------------------------------------------------------------------ */
  /* Quiz (C5)                                                           */
  /* ------------------------------------------------------------------ */
  var MEDIUM_QUIZ = [
    {
      id: "q1", q: "What do ALL containers on the same host share?",
      options: [
        { id: "a", label: "A guest operating system" },
        { id: "b", label: "The host OS kernel" },
        { id: "c", label: "A hypervisor" },
        { id: "d", label: "The same image digest" },
      ],
      answer: "b",
      why: "Containers isolate with kernel namespaces/cgroups but run on the host kernel — no guest OS, which is why they start fast and run dense.",
      wrong: {
        a: "A guest OS is the VM tax containers avoid — no container boots its own OS.",
        c: "A hypervisor belongs to the VM stack; containers isolate with kernel primitives instead.",
        d: "Different containers usually run different images — a shared digest is coincidence, not a requirement.",
      },
      topic: "shared-kernel architecture",
    },
    {
      id: "q2", q: "What is the relationship between an image and a container?",
      options: [
        { id: "a", label: "An image is a running instance of a container" },
        { id: "b", label: "They are the same artifact under two names" },
        { id: "c", label: "A container is a running instance of an image" },
        { id: "d", label: "A container stores the image in a registry" },
      ],
      answer: "c",
      why: "The image is the boxed cargo template in the yard; the container is the box lifted onto a node and running.",
      wrong: {
        a: "That inverts the pair — the image is the static template, the container is what runs.",
        b: "The distinction matters operationally: images are built and stored, containers are started and replaced.",
        d: "Registries store images; containers run FROM images and are not used to store them.",
      },
      topic: "image vs container",
    },
    {
      id: "q3", q: "Why are images built in layers?",
      options: [
        { id: "a", label: "To encrypt each build step for safety" },
        { id: "b", label: "To hide the build instructions from users" },
        { id: "c", label: "To make each image larger and safer" },
        { id: "d", label: "To share and cache base image layers" },
      ],
      answer: "d",
      why: "Layers are stacked build steps; shared base layers cut storage and pull times — you saw 'ALREADY EXISTS' in the yard.",
      wrong: {
        a: "Layers are not an encryption mechanism — images can be scanned and inspected layer by layer.",
        b: "Dockerfiles stay readable; layers are an efficiency feature, not secrecy.",
        c: "Sharing layers makes fleets SMALLER — the opposite of deliberately larger images.",
      },
      topic: "image layers",
    },
    {
      id: "q4", q: "What does an orchestrator add beyond starting containers?",
      options: [
        { id: "a", label: "It heals, scales and schedules replicas" },
        { id: "b", label: "It removes the need for images" },
        { id: "c", label: "It replaces the host kernel" },
        { id: "d", label: "It guarantees applications never crash" },
      ],
      answer: "a",
      why: "The orchestrator (Kubernetes-style) keeps the declared state: schedules replicas, scales on demand, replaces failures — your Crane Deck session.",
      wrong: {
        b: "Images stay the deployment artifact — the orchestrator consumes them, it does not remove them.",
        c: "Containers still run on the host kernel; orchestration happens above that layer.",
        d: "Apps still crash — the orchestrator's promise is REPLACEMENT, not bug-free software.",
      },
      topic: "orchestration",
    },
    {
      id: "q5", q: "A containerized Orders DB keeps losing its data when replaced. The missing piece is:",
      options: [
        { id: "a", label: "A larger node" },
        { id: "b", label: "A healthcheck" },
        { id: "c", label: "A persistent volume" },
        { id: "d", label: "A pinned tag" },
      ],
      answer: "c",
      why: "Container storage is ephemeral; stateful workloads need a persistent volume that outlives any single container.",
      wrong: {
        a: "More capacity does not help — the data dies with the container, not with the node.",
        b: "A healthcheck detects a wedged container; it cannot preserve local data across replacement.",
        d: "Pinning fixes which image runs, not where its data lives.",
      },
      topic: "persistent volumes",
    },
    {
      id: "q6", q: "Why deploy cargo-portal:1.4.0 instead of cargo-portal:latest?",
      options: [
        { id: "a", label: "Versioned tags download faster" },
        { id: "b", label: "Pinned tags are immutable and reproducible" },
        { id: "c", label: "Registry policy forbids the latest tag" },
        { id: "d", label: "latest cannot start in containers" },
      ],
      answer: "b",
      why: "'latest' is a mutable pointer that can silently move (in our yard it aliases a beta). Pinning makes every deploy reproducible.",
      wrong: {
        a: "Pull speed comes from layer caching, not from the tag format.",
        c: "No registry bans latest — it is simply a mutable pointer you should not trust.",
        d: "latest runs fine; the problem is that what it points to can change underneath you.",
      },
      topic: "tag pinning",
    },
    {
      id: "q7", q: "How do microservices and containers reinforce each other?",
      options: [
        { id: "a", label: "Microservices force one large monolith image" },
        { id: "b", label: "Containers block service-to-service networking" },
        { id: "c", label: "Microservices must run on virtual machines" },
        { id: "d", label: "Each service ships in one container" },
      ],
      answer: "d",
      why: "Independently deployable services map naturally onto containers — scale the payment service without touching authentication.",
      wrong: {
        a: "Microservices are the opposite of a monolith — small, loosely coupled units.",
        b: "Service discovery (DNS) exists precisely so containers can talk to each other.",
        c: "VMs are the heavier option — containers are the natural fit for small services.",
      },
      topic: "microservices",
    },
  ];

  var HARD_QUIZ = [
    {
      id: "h1",
      scenario: "Event feed: 'portal-7f9d EXITED (code 1)' → two seconds later 'portal-k2vx Started on node-02'. No human acted.",
      q: "Which capability produced the second line?",
      options: [
        { id: "a", label: "An on-call engineer's manual restart" },
        { id: "b", label: "A cron job running on the node" },
        { id: "c", label: "The registry re-pushing the image" },
        { id: "d", label: "Self-healing reconciliation to the declared state" },
      ],
      answer: "d",
      why: "The controller compares desired vs actual state and replaces failed replicas automatically — that is self-healing.",
      wrong: {
        a: "The scenario says no human acted — a manual restart is excluded by the evidence itself.",
        b: "Node cron jobs do not watch the declared replica count; reconciliation does.",
        c: "Registries store images; they do not start containers when replicas die.",
      },
      topic: "self-healing",
    },
    {
      id: "h2",
      scenario: "A legacy billing app needs custom kernel modules, a tuned OS and a hardware-locked license. Weekly GPU training runs on the same host class.",
      q: "Correct placement?",
      options: [
        { id: "a", label: "Containers for both workloads" },
        { id: "b", label: "Serverless for both workloads" },
        { id: "c", label: "VMs — OS control, GPUs" },
        { id: "d", label: "SaaS for the billing engine" },
      ],
      answer: "c",
      why: "Containers shine for portable services, but full OS control, direct GPU access and multi-day runtimes are classic VM territory (CI-5).",
      wrong: {
        a: "Containers share the host kernel — custom kernel modules are exactly what they cannot provide.",
        b: "Serverless bills short bursts; multi-day GPU jobs and kernel tuning are outside its model.",
        d: "A hardware-locked legacy engine cannot be bought as someone else's SaaS.",
      },
      topic: "compute placement",
    },
    {
      id: "h3",
      scenario: "One container on node-01 saturates its CPU during a marketing push; its 39 node-mates slow down.",
      q: "Root cause and fix?",
      options: [
        { id: "a", label: "No cgroup limits — cap CPU/memory" },
        { id: "b", label: "Too few images — add registry tags" },
        { id: "c", label: "Shared kernel — migrate to VMs" },
        { id: "d", label: "DNS misconfiguration on the node" },
      ],
      answer: "a",
      why: "Without cgroup limits one workload starves its neighbors (noisy neighbor). Resource limits cap the damage; orchestration then schedules fairly.",
      wrong: {
        b: "Registry tags have no effect on runtime CPU consumption.",
        c: "Kernel sharing is not the problem here — missing resource caps are, and limits fix it without VMs.",
        d: "DNS affects name resolution, not CPU saturation.",
      },
      topic: "resource limits",
    },
    {
      id: "h4",
      scenario: "Managed Kubernetes. Audit asks: who patches the application base image, and who guarantees the control plane?",
      q: "Correct split?",
      options: [
        { id: "a", label: "Provider patches base images; customer guarantees the control plane" },
        { id: "b", label: "Customer patches base images; provider runs the control plane" },
        { id: "c", label: "Provider does both" },
        { id: "d", label: "Customer does both" },
      ],
      answer: "b",
      why: "Shared responsibility: the provider runs platform/infrastructure; the customer owns what they ship — images, libraries, config, access policy.",
      wrong: {
        a: "That inverts the split — the provider never patches your application images.",
        c: "The provider runs the platform; your application layers stay your duty.",
        d: "You do not operate the managed control plane — the provider does.",
      },
      topic: "shared responsibility",
    },
    {
      id: "h5",
      scenario: "You must publish orders-db:16.2 and cargo-portal:1.5.0. The yard shows: 1.5.0 (immutable), 1.5.1-beta, latest → 1.5.1-beta.",
      q: "What do you deploy?",
      options: [
        { id: "a", label: "latest for the portal build" },
        { id: "b", label: "1.5.1-beta — newest is best" },
        { id: "c", label: "Rebuild all images with :latest" },
        { id: "d", label: "1.5.0 — pinned, immutable, reproducible" },
      ],
      answer: "d",
      why: "Production pulls pinned, immutable versions. 'latest' aliased a beta in our yard — the classic reproducibility trap.",
      wrong: {
        a: "latest currently points at a beta — you would ship pre-release code.",
        b: "Newest is not a deployment criterion; immutability is.",
        c: "Rebuilding with latest makes every future build non-reproducible.",
      },
      topic: "registry hygiene",
    },
    {
      id: "h6",
      scenario: "cargo-portal runs one replica. During a rolling update the availability meter dips to 96% and pages the on-call.",
      q: "Why the dip, and the fix?",
      options: [
        { id: "a", label: "Registry outage — add replicas there" },
        { id: "b", label: "Kernel upgrade — restart the node first" },
        { id: "c", label: "One replica — run two to overlap" },
        { id: "d", label: "Mutable tag — pin it to 1.4.0" },
      ],
      answer: "c",
      why: "Rolling updates replace pods gradually; with ≥2 replicas new ones start before old ones stop, so capacity never drops to zero.",
      wrong: {
        a: "The registry served both versions fine — the dip is a capacity math problem.",
        b: "No node event occurred; the meter dipped exactly when replicas were swapped.",
        d: "Pinning changes WHICH image runs, not how many replicas absorb the swap.",
      },
      topic: "rolling updates",
    },
    {
      id: "h7",
      scenario: "You hardened everything: pinned tags, limits, healthchecks, non-root, PVs. A pentest report still lists one credible container-platform risk.",
      q: "Which residual risk is legitimate?",
      options: [
        { id: "a", label: "Shared kernel; escape remains possible" },
        { id: "b", label: "Registry outages during rollouts" },
        { id: "c", label: "YAML syntax errors in manifests" },
        { id: "d", label: "None — hardening removes all risk" },
      ],
      answer: "a",
      why: "Kernel sharing is inherent to containerization. Defense-in-depth (seccomp, Pod Security Standards — M1048) shrinks but never zeroes it. Awareness, not fear.",
      wrong: {
        b: "An operational availability concern — not the platform's inherent security boundary.",
        c: "A linting problem, catchable in CI — not a credible pentest finding.",
        d: "No control suite zeroes risk; claiming so is how residual risk goes unmanaged.",
      },
      topic: "residual risk",
    },
  ];

  /* ------------------------------------------------------------------ */
  /* Debrief / Field notes (C6)                                          */
  /* ------------------------------------------------------------------ */
  var DEBRIEF = {
    observe: {
      title: "Observability & verification opportunities",
      items: [
        "Event-feed signatures worth alerting on: EXITED without a matching Rescheduled line; 'Scaled' events outside change windows; availability meters below 100% during releases.",
        "Pull logs repeating 'ALREADY EXISTS' prove healthy layer sharing; a registry that never dedupes is a configuration smell.",
        "Misconfiguration watchlist: unpinned tags · single replica · unset resource limits · runAsUser 0 · missing healthchecks · stateful services without persistent volumes.",
        "Portability test: the same image digest should run on dev, staging and prod. When a module exists only on a laptop, the image — not the host — is the contract.",
      ],
    },
    plan: {
      title: "Control plan (mapped IDs)",
      items: [
        "Pin image versions (tags/digests) — reproducible, auditable deploys.",
        "Resource limits via cgroups — contain the noisy neighbor (CI-6).",
        "Healthchecks + ≥2 replicas — the orchestrator can detect, replace and roll without downtime.",
        "Persistent volumes for stateful services; stateless everywhere else.",
        "Non-root users and minimal images — reduces blast radius (M1038-style Execution Prevention).",
        "Scan images before deployment and block non-compliant ones (M1047 Audit); isolate with seccomp/Pod Security Standards (M1048); restrict API access to managed channels (M1035).",
      ],
    },
    blue: [
      "Inventory is detection's first cousin: know every image, tag and registry in your estate.",
      "Drift between 'what the image declares' and 'what the host has' is where incidents hide — bake dependencies into images.",
      "Stateless-by-default makes recovery boring: replacement is safe when nothing local is precious.",
      "Shared responsibility is a control, not a shrug: stamp every duty provider-side or customer-side and verify your half.",
    ],
    red: [
      "Defenders containerize for density; attackers noticed (T1610 Deploy Container — Execution): malicious or vulnerable images can be deployed to evade defenses.",
      "Kernel sharing is the crown-jewel weakness (T1611 Escape to Host — Privilege Escalation); privileged containers and mounted host paths are the classic routes.",
      "Admin surfaces are high-value (T1609 Container Administration Command — Execution; T1613 discovery of containers/resources).",
      "Actors documented on the official pages: TeamTNT (G0139), Kinsing (S0599), Doki (S0600), Hildegard (S0601) — studied for awareness only; this lab ships no tradecraft.",
    ],
    links: [
      { label: "MITRE ATT&CK — T1610 Deploy Container", url: "https://attack.mitre.org/techniques/T1610/" },
      { label: "MITRE ATT&CK — T1611 Escape to Host", url: "https://attack.mitre.org/techniques/T1611/" },
      { label: "MITRE ATT&CK — T1609 Container Administration Command", url: "https://attack.mitre.org/techniques/T1609/" },
      { label: "CompTIA Cloud+ (CV0-004) certification page", url: "https://www.comptia.org/en-us/certifications/cloud/" },
    ],
    next: [
      "Next in the courseware: cloud storage resources & tiers (CV0-004 Domain 1.0 continues).",
      "Rebuild one of your own scripts as a Dockerfile — pin the base, add a healthcheck.",
      "Read the T1610 ATT&CK page and map each mitigation to a control your team already runs.",
    ],
  };

  global.HarborData = {
    PILLAR_META: PILLAR_META,
    GLOSSARY: GLOSSARY,
    BERTH_COMPONENTS: BERTH_COMPONENTS,
    M1_ANSWER: M1_ANSWER,
    M2_OPTIONS: M2_OPTIONS,
    M2_ANSWER: M2_ANSWER,
    H1_CHIPS: H1_CHIPS,
    DF_PALETTE: DF_PALETTE,
    M4_ANSWER: M4_ANSWER,
    H2_ANSWER: H2_ANSWER,
    DF_FEEDBACK_LINES: DF_FEEDBACK_LINES,
    YARD_IMAGES: YARD_IMAGES,
    M3_ANSWER: M3_ANSWER,
    H10_TAG_ANSWER: H10_TAG_ANSWER,
    H10_REASON_OPTIONS: H10_REASON_OPTIONS,
    H10_REASON_ANSWER: H10_REASON_ANSWER,
    NODES: NODES,
    M7_REPLICAS: M7_REPLICAS,
    M12_REPLICAS_MIN: M12_REPLICAS_MIN,
    M12_TAG: M12_TAG,
    MANIFEST_LINES: MANIFEST_LINES,
    H6_ANSWER: H6_ANSWER,
    AMENDMENTS: AMENDMENTS,
    H7_ORDER_RULE: H7_ORDER_RULE,
    MODEL_META: MODEL_META,
    WORKLOADS: WORKLOADS,
    SR_STATEMENTS: SR_STATEMENTS,
    M11_STATEMENTS: M11_STATEMENTS,
    RESIDUAL_RISK_OPTIONS: RESIDUAL_RISK_OPTIONS,
    RESIDUAL_RISK_ANSWER: RESIDUAL_RISK_ANSWER,
    INCIDENT_EVIDENCE: INCIDENT_EVIDENCE,
    M5_ANSWER: M5_ANSWER,
    H3_MODULE_ANSWER: H3_MODULE_ANSWER,
    H3_FIX_OPTIONS: H3_FIX_OPTIONS,
    H3_FIX_ANSWER: H3_FIX_ANSWER,
    MEDIUM_OBJECTIVES: MEDIUM_OBJECTIVES,
    HARD_OBJECTIVES: HARD_OBJECTIVES,
    MEDIUM_QUIZ: MEDIUM_QUIZ,
    HARD_QUIZ: HARD_QUIZ,
    DEBRIEF: DEBRIEF,
  };
})(window);
