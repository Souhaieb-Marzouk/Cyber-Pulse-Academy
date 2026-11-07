// HARBOR-7 — all simulated content. Every artifact below is fictional training data.
// MITRE technique IDs / names / tactics referenced here were verified against the
// official MITRE CTI STIX data (enterprise-attack.json) on 2026-11-06.
//
// Static port note: this file is a 1:1 transcription of src/lib/lab/content.ts
// from the original framework lab — same constants, same wording, same answers.

const LAB_ID = "HB-043";
const LAB_ORG = "Northwind Freight Analytics";

/* ---------------------------------- Briefing ---------------------------------- */

const BRIEFING = {
  callsign: "HARBOR CONTROL — SHIFT RADIO, 02:14",
  lines: [
    `Welcome aboard, engineer. ${LAB_ORG} moves freight telemetry for three continents, and since Q3 it all runs on containers: a Docker build farm, the internal registry "Customs", and the Kubernetes cluster we call Harbor-7.`,
    `The platform team moved fast this quarter. Audits passed on paper — but last night the new runtime sensor flagged activity nobody can explain, and the shift lead is asking questions the paper audit can't answer.`,
    `Your task: walk the harbor end to end. Inspect what we BUILD in the dry dock, what we SHIP through the customs gate, and what we RUN at the berths. Find every weakness, separate real threats from noise, and leave the harbor hardened.`,
    `Everything you see here is a training simulation — synthetic images, synthetic logs, a fictional company. The skills are the real cargo.`,
  ],
  sign: "— Harbor Control, out.",
};

/* ---------------------------------- Lifecycle ---------------------------------- */

const LIFECYCLE_STAGES = [
  { id: "build", label: "BUILD", blurb: "Dockerfile assembles the image — base, code, config." },
  { id: "scansign", label: "SCAN & SIGN", blurb: "Static CVE scan + SBOM; cryptographic signature applied." },
  { id: "ship", label: "SHIP", blurb: "Push to registry; admission controller verifies seal at deploy time." },
  { id: "run", label: "RUN", blurb: "Hardened runtime: non-root, capped, isolated, limited." },
  { id: "monitor", label: "MONITOR", blurb: "Runtime sensor + audit logs detect and trigger response." },
];

const ISOLATION_STATEMENTS = [
  { id: "t1", text: "Containers on the same host share the host's Linux kernel.", answer: true },
  { id: "t2", text: "Each container runs its own full OS kernel, like a virtual machine.", answer: false },
  { id: "t3", text: "A privileged container weakens the security boundary between the workload and its host.", answer: true },
  { id: "t4", text: "Namespaces and cgroups are the mechanisms that isolate containers and cap their resources.", answer: true },
];

/* ---------------------------------- Dry dock: Dockerfile ---------------------------------- */

const DOCKER_LINES = [
  { id: "L1", n: 1, text: "FROM node:latest" },
  { id: "L2", n: 2, text: "WORKDIR /app", neutralNote: "Sets the working directory — standard and harmless." },
  { id: "L3", n: 3, text: "ARG DB_PASSWORD", neutralNote: "ARG alone is build-time only and not stored in the final image — the flaw is pairing it with ENV on line 4, which writes the value into a layer forever." },
  { id: "L4", n: 4, text: "ENV DB_PASSWORD=$DB_PASSWORD" },
  { id: "L5", n: 5, text: "RUN curl -sSL https://get.metrics-sense.example/install.sh | bash" },
  { id: "L6", n: 6, text: "COPY . ." },
  { id: "L7", n: 7, text: "RUN npm install --include=dev" },
  { id: "L8", n: 8, text: "COPY build/ ./build", neutralNote: "Scoped copy of the built app — fine, once L6 is fixed." },
  { id: "L9", n: 9, text: "EXPOSE 8080", neutralNote: "Documenting the listening port is standard." },
  { id: "L10", n: 10, text: "USER root" },
  { id: "L11", n: 11, text: "CMD [\"node\", \"build/server.js\"]", neutralNote: "A normal entrypoint." },
];

const FLAG_CATEGORIES = [
  {
    id: "mutable-tag",
    label: "Mutable tag",
    lesson:
      "A tag like :latest can be re-pointed to different bytes at any time — two pulls may give two different images, and your vulnerability scan no longer describes what actually runs.",
    fix: "Pin an exact version AND the digest: node:20.11.1-slim@sha256:… — reproducible builds that admission controllers can verify.",
  },
  {
    id: "baked-secret",
    label: "Baked secret",
    lesson:
      "ENV values are written into image layers and build history. Anyone who can pull the image can read the password — forever, even if a later layer deletes it.",
    fix: "Inject secrets at runtime from a secrets manager (Kubernetes secretKeyRef / vault agent). Never in ARG/ENV/COPY.",
  },
  {
    id: "pipe-shell",
    label: "Pipe-to-shell",
    lesson:
      "curl … | bash executes whatever the remote server returns today, with no pin, no checksum and no review — a supply-chain foot-gun in a layer that ships to production.",
    fix: "Install from verified, versioned packages (apt/apk with pinned versions) or copy a checksum-verified binary in a build stage.",
  },
  {
    id: "broad-copy",
    label: "Broad COPY",
    lesson:
      "COPY . . ships the whole build context: .env files, git history, CI configs. Whatever is in the folder ends up in the image layers — including secrets.",
    fix: "A strict .dockerignore plus explicit COPY of only what the app needs.",
  },
  {
    id: "dev-deps",
    label: "Leftover build tooling",
    lesson:
      "Dev dependencies, compilers and package managers left in the runtime image inflate the attack surface and the CVE count — every extra binary is a potential exploit tool.",
    fix: "Multi-stage build: compile in a builder stage, copy only the artifact into a slim/distroless runtime stage.",
  },
  {
    id: "root-user",
    label: "Root user",
    lesson:
      "A container process running as UID 0 that breaks out hits the host as root. Unprivileged containers are the single cheapest escape brake you can add.",
    fix: "USER 10001 (a dedicated non-root UID) plus runAsNonRoot: true in the pod securityContext.",
  },
];

const DOCKER_CRITICAL = ["L1", "L4", "L5", "L10"];
const DOCKER_ALL_FLAGS = {
  L1: "mutable-tag",
  L4: "baked-secret",
  L5: "pipe-shell",
  L6: "broad-copy",
  L7: "dev-deps",
  L10: "root-user",
};

/* ---------------------------------- Dry dock: layer X-ray ---------------------------------- */

const XRAY_IMAGE = "freight-portal:v2.1";
const XRAY_LAYERS = [
  { idx: 1, title: "node:20-slim", detail: "Base OS libraries + Node.js runtime from the official image.", size: "74 MB" },
  {
    idx: 2,
    title: "COPY .npmrc /app/.npmrc",
    detail: 'Build-config file containing:  //registry.nwfreight.example/\n_authToken=npm_h7K9…c41d',
    size: "0.2 KB",
    sensitive: true,
  },
  { idx: 3, title: "RUN npm ci", detail: "Installed dependencies from the private registry using that token.", size: "112 MB" },
  { idx: 4, title: "COPY build/ ./build", detail: "The compiled application code.", size: "8 MB" },
  { idx: 5, title: "RUN rm /app/.npmrc", detail: 'Deleted the token file from the final filesystem. Build log: "removed .npmrc ✔".', size: "0 KB" },
  { idx: 6, title: "CMD node build/server.js", detail: "Image metadata — the default command.", size: "0 KB" },
];

const XRAY_SECRET_OPTIONS = [
  { id: "npm-token", label: "A registry auth token (.npmrc _authToken)" },
  { id: "db-password", label: "A database password" },
  { id: "signing-key", label: "A code-signing private key" },
  { id: "nothing", label: "Nothing sensitive" },
];
const XRAY_SECRET_ANSWER = "npm-token";

const XRAY_WHY_OPTIONS = [
  { id: "immutable", label: "Layers are immutable — the rm only added a new layer that hides the file; layer 2 still ships inside the image" },
  { id: "cache", label: "The build daemon cached the file and re-injects it at runtime" },
  { id: "failed", label: "The rm command failed silently" },
];
const XRAY_WHY_ANSWER = "immutable";

const XRAY_FIX_OPTIONS = [
  { id: "rotate-rebuild", label: "Rotate the token now, then rebuild with no secret in any layer and inject it at runtime" },
  { id: "rm-again", label: "Add another rm layer on top" },
  { id: "squash", label: "Squash the existing image" },
  { id: "private", label: "Mark the registry private" },
];
const XRAY_FIX_ANSWER = "rotate-rebuild";

/* ---------------------------------- Dry dock: token remediation ---------------------------------- */

const TOKEN_OPTIONS = [
  { id: "rotate", label: "Rotate the npm token immediately", why: "It already shipped inside published image tags — treat it as compromised. Rotation is the only step that actually revokes the value attackers may hold.", correct: true },
  { id: "rebuild", label: "Rebuild from a clean Dockerfile: no secret in ARG/ENV/COPY, multi-stage build", why: "New images must be produced without the token so the leak stops recurring.", correct: true },
  { id: "runtime-inject", label: "Inject the (new) token at runtime from the secrets manager", why: "Runtime injection keeps secrets out of layers, history and the registry entirely.", correct: true },
  { id: "rm-layer", label: "Add a new RUN rm .npmrc layer", why: "Adds a whiteout; layer 2 still contains the token and image history still shows it.", correct: false },
  { id: "squash", label: "Squash the existing image in place", why: "Old tags and cached pulls persist; squashing does not un-leak an already-distributed secret.", correct: false },
  { id: "private", label: "Just make the registry private", why: "Access control helps, but the token remains recoverable by anyone with pull rights — and it was already published.", correct: false },
];
const TOKEN_ANSWERS = ["rotate", "rebuild", "runtime-inject"];

/* ---------------------------------- Customs gate: registry ---------------------------------- */

const REGISTRY_IMAGES = [
  {
    id: "R1",
    reference: "registry.nwfreight.example/freight/order-api@sha256:8f3ac…41d",
    publisher: "Northwind Platform CI (nw-build-bot)",
    seal: "verified",
    pinned: "digest",
    scan: "0 critical · 0 high (scanned 2 h ago)",
    blurb: "Your app, rebuilt this morning. Signature verifies against the org's Cosign key; digest is immutable.",
    verdict: "approve",
  },
  {
    id: "R2",
    reference: "docker.io/tkbuilds/order-api:latest",
    publisher: "tkbuilds (unknown account)",
    seal: "none",
    pinned: "tag",
    scan: "no scan on record",
    blurb: "Same-looking name on a public registry, unknown publisher, unsigned, mutable :latest tag.",
    verdict: "reject",
    rejectWhy: "Untrusted publisher, unsigned, mutable tag, never scanned — classic supply-chain lure.",
  },
  {
    id: "R3",
    reference: "docker.io/library/node:19",
    publisher: "Official Docker library",
    seal: "official",
    pinned: "tag",
    scan: "base-image scan: 1 high (EOL runtime)",
    blurb: "A trusted base image — but it is a runtime, not your application, and Node 19 is end-of-life.",
    verdict: "reject",
    rejectWhy: "Not the cargo you are shipping (a base image, not the app) and the 19.x line is EOL.",
  },
  {
    id: "R4",
    reference: "registry.nwfreight.example/freight/order-api:v2.1",
    publisher: "Northwind Platform CI",
    seal: "verified",
    pinned: "tag",
    scan: "2 CRITICAL in bundled zlib + undici",
    blurb: "The tag currently running in production. Signed and internal — but the scan is red.",
    verdict: "reject",
    rejectWhy: "Signed is not scanned: 2 critical CVEs. Deploy the rebuilt digest (R1) instead.",
  },
  {
    id: "R5",
    reference: "docker.io/library/nginx:latest",
    publisher: "Official Docker library",
    seal: "official",
    pinned: "tag",
    scan: "clean",
    blurb: "A fine web server — for someone else's app. Nothing here serves order-api.",
    verdict: "reject",
    rejectWhy: "Unrelated cargo; also :latest is a mutable tag.",
  },
];

const REGISTRY_JUSTIFY_TAGS = [
  { id: "signed", label: "Signature verifies (tamper seal intact)" },
  { id: "digest", label: "Digest-pinned (immutable cargo ID)" },
  { id: "scanned", label: "Scan clean (0 critical / 0 high)" },
];
const REGISTRY_REJECT_REASON_OPTIONS = [
  { id: "cve", label: "Reject R4 — scan found 2 critical CVEs; ship the rebuilt digest instead" },
  { id: "seal", label: "Reject R4 — its customs seal is missing" },
  { id: "tag", label: "Reject R4 — it uses a tag instead of a digest" },
  { id: "publisher", label: "Reject R4 — the publisher is unknown" },
];
const REGISTRY_REJECT_REASON_ANSWER = "cve";

/* ---------------------------------- Berths: containers ---------------------------------- */

const BERTH_CONTAINERS = [
  {
    id: "payments-svc",
    name: "payments-svc",
    image: "freight/payments:3.4",
    uptime: "6 d",
    status: "critical",
    config: [
      { k: "privileged", v: "true", bad: true },
      { k: "mounts", v: "/var/run/docker.sock (host socket)", bad: true },
      { k: "user", v: "root (UID 0)", bad: true },
      { k: "rootfs", v: "writable" },
    ],
    verdict:
      "Privileged + the host Docker socket inside the container = full host control one command away. docker exec here is effectively root on the node. This is the classic escape springboard.",
  },
  {
    id: "metrics-agent",
    name: "metrics-agent",
    image: "freight/metrics:1.9",
    uptime: "12 d",
    status: "critical",
    config: [
      { k: "hostNetwork", v: "true", bad: true },
      { k: "hostPID", v: "true", bad: true },
      { k: "hostPath", v: "/ (host root filesystem)", bad: true },
      { k: "user", v: "root (UID 0)", bad: true },
    ],
    verdict:
      "The whole host filesystem mounted read-write, host process namespace and host networking. Anyone in this container can read host secrets, inject into host processes, and probe the node network.",
  },
  {
    id: "report-runner",
    name: "report-runner",
    image: "freight/reports:0.8",
    uptime: "2 d",
    status: "atrisk",
    config: [
      { k: "privileged", v: "false" },
      { k: "user", v: "root (no runAsNonRoot)", bad: true },
      { k: "rootfs", v: "writable", bad: true },
      { k: "resources", v: "none set", bad: true },
    ],
    verdict:
      "Not an escape hatch by itself, but root + writable filesystem + no resource limits means tampering, payload drops and noisy-neighbor CPU exhaustion are all possible. Harden with a securityContext and quotas.",
  },
  {
    id: "geo-worker",
    name: "geo-worker",
    image: "freight/geo@sha256:5b21…9e7",
    uptime: "9 d",
    status: "secure",
    config: [
      { k: "privileged", v: "false" },
      { k: "runAsNonRoot", v: "true (UID 10001)" },
      { k: "rootfs", v: "readOnlyRootFilesystem: true" },
      { k: "capabilities", v: "drop: [ALL]" },
      { k: "seccompProfile", v: "RuntimeDefault" },
      { k: "resources", v: "requests + limits set" },
      { k: "DB_PASSWORD", v: "valueFrom: secretKeyRef" },
    ],
    verdict:
      "This is the harbor standard: non-root, read-only rootfs, zero capabilities, seccomp, resource limits, digest-pinned image, secret injected from the store. Every berth should look like this one.",
  },
];

const BERTH_TAG_POOL = [
  { id: "privileged", label: "Privileged container", forIds: ["payments-svc"] },
  { id: "docker-sock", label: "Host Docker socket mounted", forIds: ["payments-svc"] },
  { id: "hostpath", label: "Host filesystem / host namespaces exposed", forIds: ["metrics-agent"] },
  { id: "root", label: "Runs as root", forIds: ["payments-svc", "metrics-agent", "report-runner"] },
];

/* ---------------------------------- Berths: event feed ---------------------------------- */

const FEED_EVENTS = [
  {
    id: "E1",
    time: "01:52:07",
    source: "runtime-sensor · payments-svc",
    text: "process exec: nsenter -t 1 -m -u -i -n -p -- /bin/sh",
    meta: "syscall execve · parent: sh (PID 2214)",
    verdict: "threat",
    why: "nsenter against PID 1 reaches into the host's namespaces — only useful for breaking out of the container. This is a live escape attempt (MITRE T1611, Escape to Host).",
    chainOrder: 6,
  },
  {
    id: "E2",
    time: "01:48:33",
    source: "runtime-sensor · payments-svc",
    text: "read /var/run/secrets/kubernetes.io/serviceaccount/token → /tmp/.t",
    meta: "openat · file copied out of the SA credential path",
    verdict: "threat",
    why: "The pod's service-account token is a bearer credential for the cluster API. Copying it out is credential theft via the container API surface (MITRE T1552.007).",
    chainOrder: 4,
  },
  {
    id: "E3",
    time: "01:41:12",
    source: "k8s-audit · api-server",
    text: 'GET /api/v1/pods · GET /apis/apps/v1/deployments — user "system:anonymous" from 10.24.4.77',
    meta: "200 OK · 214 objects listed · no RBAC identity",
    verdict: "threat",
    why: "Anonymous, non-RBAC enumeration of every workload in the cluster is recon by container API (MITRE T1613, Container and Resource Discovery).",
    chainOrder: 1,
  },
  {
    id: "E4",
    time: "01:44:55",
    source: "k8s-audit · api-server",
    text: 'CronJob "coin-sync" created in namespace freight-prod by user "svc-deploy"',
    meta: "schedule: */30 * * * * · image: docker.io/tkbuilds/xmr-stack:2.9",
    verdict: "threat",
    why: "A scheduled orchestration job created outside the change calendar is persistence: it re-deploys the payload even if you delete the pod (MITRE T1053.007).",
    chainOrder: 3,
  },
  {
    id: "E5",
    time: "01:43:20",
    source: "k8s-audit · api-server",
    text: "Pod whale-miner-77f created · image docker.io/tkbuilds/xmr-stack:2.9 · node worker-3",
    meta: "requests: none · limits: none · no scan record for image",
    verdict: "threat",
    why: "An unscanned public-registry image deployed straight into production is a deployed container (MITRE T1610) — and its name and the CronJob image say cryptojacking.",
    chainOrder: 2,
  },
  {
    id: "E6",
    time: "01:49:40",
    source: "egress-monitor · payments-svc",
    text: "connect 169.254.169.254:80 · GET /latest/meta-data/iam/security-credentials/",
    meta: "denied by policy after 3 attempts · UA: curl/8.5.0",
    verdict: "threat",
    why: "Harvesting the cloud metadata service asks for the node/workload IAM credentials — the same class of abuse as TeamTNT's campaigns. Block egress to metadata and require IMDSv2-style protections.",
    chainOrder: 5,
  },
  {
    id: "E7",
    time: "every 30 s",
    source: "runtime-sensor · geo-worker",
    text: "GET /api/healthz → 200",
    meta: "kubelet probe · fixed interval · expected endpoint",
    verdict: "clear",
    why: "Automated liveness probe from the kubelet: fixed cadence, fixed endpoint, tiny response. Textbook false positive — whitelist probe traffic in detections.",
  },
  {
    id: "E8",
    time: "01:15:00",
    source: "registry-log · ci-runner",
    text: "build freight/order-api:v2.1.3 via registry.nwfreight.example",
    meta: 'service account "ci-runner" · release window 01:00–02:00',
    verdict: "clear",
    why: "A scheduled CI build by the known CI service account, inside the release window, through the internal registry. Matched the change calendar — benign (contrast with a rogue T1612 build from an unknown identity).",
  },
  {
    id: "E9",
    time: "01:30:02",
    source: "runtime-sensor · geo-worker",
    text: "logrotate: app.log rotated 48 MB → 0",
    meta: "logging agent · nightly job",
    verdict: "clear",
    why: "Routine log rotation by the logging agent. Size resets are normal; only rotations paired with tamper indicators (FIM alerts, deleted audit sinks) deserve escalation.",
  },
];

/* ---------------------------------- Berths: MITRE board ---------------------------------- */

const MITRE_TECHNIQUES = [
  { id: "T1610", label: "T1610 — Deploy Container" },
  { id: "T1611", label: "T1611 — Escape to Host" },
  { id: "T1612", label: "T1612 — Build Image on Host" },
  { id: "T1613", label: "T1613 — Container and Resource Discovery" },
  { id: "T1053.007", label: "T1053.007 — Container Orchestration Job" },
  { id: "T1552.007", label: "T1552.007 — Unsecured Credentials: Container API" },
];

const MITRE_SNIPPETS = [
  { id: "S1", text: "An unauthenticated client lists every pod and deployment in the cluster via the API server.", answer: "T1613" },
  { id: "S2", text: "A new pod running a crypto-miner image appears, created by an identity no one owns.", answer: "T1610" },
  { id: "S3", text: "A CronJob is created so the miner is re-deployed every 30 minutes even after cleanup.", answer: "T1053.007" },
  { id: "S4", text: "Inside a compromised container, nsenter targets PID 1 to reach the host namespaces.", answer: "T1611" },
  { id: "S5", text: "The Docker API on a worker node is asked to build an image from an attacker-supplied Dockerfile.", answer: "T1612" },
  { id: "S6", text: "A pod's service-account token is read from disk and replayed against the Kubernetes API.", answer: "T1552.007" },
];
const MITRE_MEDIUM_REQUIRED = ["T1611", "T1610", "T1053.007", "T1613"];
const CHAIN_ANSWER = ["T1610", "T1613", "T1053.007", "T1611"];

const KERNEL_WHY_OPTIONS = [
  { id: "boundary", label: "Escape crosses the one boundary containers share — the host kernel — giving code execution on the node and every container on it", correct: true },
  { id: "logs", label: "Escape deletes the container's logs", correct: false },
  { id: "cpu", label: "Escape provides free CPU for mining", correct: false },
  { id: "scanner", label: "Escape bypasses the image vulnerability scanner", correct: false },
];
const KERNEL_WHY_ANSWER = "boundary";

const DATASOURCE_ROWS = [
  { id: "D1", q: "Who created CronJob coin-sync — and from where?", answer: "audit" },
  { id: "D2", q: "Which critical CVEs ship inside order-api:v2.1?", answer: "scan" },
  { id: "D3", q: "Which syscalls did payments-svc execute at 01:52?", answer: "sensor" },
];

const DATASOURCE_OPTIONS = [
  { id: "audit", label: "Kubernetes audit logs" },
  { id: "scan", label: "Registry vulnerability scan report" },
  { id: "sensor", label: "Runtime sensor (syscall/behavior events)" },
];

/* ---------------------------------- Berths: pod spec ---------------------------------- */

const POD_LINES = [
  { id: "P0", indent: 0, text: "# deployment.yaml — namespace freight-prod" },
  { id: "P1", indent: 0, text: "spec:" },
  { id: "P2", indent: 1, text: "template:" },
  { id: "P3", indent: 2, text: "spec:" },
  {
    id: "P4",
    indent: 3,
    text: "hostNetwork: true",
    flag: {
      category: "Host namespace",
      lesson:
        "hostNetwork binds the pod straight onto the node's network stack — no pod-network isolation, direct reach to node services, and it defeats NetworkPolicy enforcement.",
      fix: "hostNetwork: false (and never set hostPID / hostPath for app workloads).",
    },
  },
  { id: "P5", indent: 3, text: "containers:" },
  { id: "P6", indent: 4, text: "- name: order-api" },
  { id: "P7", indent: 5, text: "image: registry.nwfreight.example/freight/order-api:v2.1" },
  { id: "P8", indent: 5, text: "securityContext:" },
  {
    id: "P9",
    indent: 6,
    text: "privileged: true",
    flag: {
      category: "Privileged",
      lesson:
        "privileged: true gives the container nearly all host capabilities and full /dev access — the single biggest escape enabler in a pod spec.",
      fix: "privileged: false. If a tool truly needs a capability, add exactly that one capability back.",
    },
  },
  {
    id: "P10",
    indent: 6,
    text: "allowPrivilegeEscalation: true",
    flag: {
      category: "Privilege escalation",
      lesson:
        "allowPrivilegeEscalation permits setuid binaries inside the container to gain more privileges than the process started with.",
      fix: "allowPrivilegeEscalation: false.",
    },
  },
  { id: "P11", indent: 5, text: "env:" },
  { id: "P12", indent: 6, text: "- name: DB_PASSWORD" },
  {
    id: "P13",
    indent: 6,
    text: 'value: "Sup3rS3cret-harbor-7"',
    flag: {
      category: "Plaintext secret",
      lesson:
        "A literal secret in the manifest lands in etcd, in everyone's kubectl describe, and in git history. This is the K8s twin of baking secrets into images.",
      fix: "valueFrom: secretKeyRef (backed by a secrets manager) — never value:.",
    },
  },
  {
    id: "P14",
    indent: 6,
    text: "resources: {}",
    flag: {
      category: "No resource controls",
      lesson:
        "Empty resources means no CPU/memory requests or limits — one runaway or cryptojacked pod can starve every neighbor on the node (noisy-neighbor DoS).",
      fix: "Set requests + limits (and enforce a namespace ResourceQuota).",
    },
  },
];

const POD_REQUIRED_FLAGS = ["P4", "P9", "P10", "P13", "P14"];

const POD_PATCH_FIELDS = [
  { id: "hostNetwork", label: "hostNetwork", options: ["true", "false"], answer: "false" },
  { id: "privileged", label: "privileged", options: ["true", "false"], answer: "false" },
  { id: "allowPrivilegeEscalation", label: "allowPrivilegeEscalation", options: ["true", "false"], answer: "false" },
  { id: "runAsNonRoot", label: "runAsNonRoot", options: ["true", "false"], answer: "true" },
  { id: "runAsUser", label: "runAsUser", options: ["0 (root)", "10001 (app UID)", "65534 (nobody)"], answer: "10001 (app UID)" },
  { id: "readOnlyRootFilesystem", label: "readOnlyRootFilesystem", options: ["true", "false"], answer: "true" },
  { id: "capabilities", label: "capabilities", options: ["add: [SYS_ADMIN]", "drop: [ALL]", "default"], answer: "drop: [ALL]" },
  { id: "seccompProfile", label: "seccompProfile", options: ["Unconfined", "RuntimeDefault", "none"], answer: "RuntimeDefault" },
  { id: "secretRef", label: "DB_PASSWORD source", options: ["value: literal string", "valueFrom: secretKeyRef", "valueFrom: configMapKeyRef"], answer: "valueFrom: secretKeyRef" },
  { id: "resources", label: "resources", options: ["{}", "requests + limits set", "limits only, no requests"], answer: "requests + limits set" },
];

/* ---------------------------------- Berths: control board ---------------------------------- */

const BOARD_CONTROLS = [
  {
    id: "ci-scan",
    name: "Image vulnerability scanning in CI",
    kind: "prevent",
    lesson: "Static scan + SBOM on every build; fail the build on critical CVEs before the image ever reaches the registry.",
    defaultOn: false,
    desiredOn: true,
  },
  {
    id: "admission-sign",
    name: "Admission controller: signed-image + scan policy",
    kind: "prevent",
    lesson: "Deploy-time gate that verifies the Cosign signature, scan status and tag/digest policy — unsigned or critical-CVE images never schedule.",
    defaultOn: false,
    desiredOn: true,
  },
  {
    id: "registry-allowlist",
    name: "Registry allow-list",
    kind: "prevent",
    lesson: "Pulls restricted to approved registries only; blocks the docker.io/tkbuilds-style lure images.",
    defaultOn: false,
    desiredOn: true,
  },
  {
    id: "nonroot-caps",
    name: "Non-root + drop ALL capabilities (Restricted PSS)",
    kind: "prevent",
    lesson: "runAsNonRoot, drop ALL caps, no privileged pods — removes the escape springboard (M1026 Privileged Account Management mindset).",
    defaultOn: false,
    desiredOn: true,
  },
  {
    id: "readonly-rootfs",
    name: "Read-only root filesystem + seccomp",
    kind: "prevent",
    lesson: "readOnlyRootFilesystem + RuntimeDefault seccomp stop payload drops and dangerous syscalls even after an RCE.",
    defaultOn: false,
    desiredOn: true,
  },
  {
    id: "network-policies",
    name: "NetworkPolicies (default-deny)",
    kind: "prevent",
    lesson: "Default-deny east-west and egress; stops lateral movement and calls to metadata/mining pools.",
    defaultOn: false,
    desiredOn: true,
  },
  {
    id: "quotas",
    name: "Resource quotas & limits",
    kind: "prevent",
    lesson: "Namespace quotas + per-pod limits contain cryptojacking and noisy-neighbor CPU exhaustion.",
    defaultOn: false,
    desiredOn: true,
  },
  {
    id: "runtime-sensor",
    name: "Runtime sensor + audit-log alerting",
    kind: "detect",
    lesson: "Behavioral detection (nsenter, token reads, anomalous API calls) + audit-log rules on CronJobs/anonymous access.",
    defaultOn: false,
    desiredOn: true,
  },
  {
    id: "secrets-manager",
    name: "Secrets manager integration",
    kind: "prevent",
    lesson: "Secrets injected at runtime from the vault (secretKeyRef/agent); nothing in images, ENV literals or git.",
    defaultOn: false,
    desiredOn: true,
  },
  {
    id: "privileged-debug",
    name: "Standing privileged debug sidecar",
    kind: "prevent",
    lesson: "A permanently privileged debug container re-opens the escape springboard you just closed. Use short-lived, approved ephemeral debug sessions instead.",
    defaultOn: false,
    desiredOn: false,
  },
  {
    id: "public-mirror",
    name: "Public 0.0.0.0 registry mirror",
    kind: "prevent",
    lesson: "Exposing the registry on all interfaces to 'speed up pulls' invites pushes and pulls from anywhere — the exact path T1612/T1552.007 abuse.",
    defaultOn: false,
    desiredOn: false,
  },
];

const BOARD_RISKS = [
  { id: "BR1", label: "Vulnerable or tampered images reach the cluster", answer: "admission-sign" },
  { id: "BR2", label: "Container escape to host (best prevention)", answer: "nonroot-caps" },
  { id: "BR3", label: "Pod-to-pod lateral movement after one pod is owned", answer: "network-policies" },
  { id: "BR4", label: "Cryptojacked pod burns the node's CPU (noisy neighbor)", answer: "quotas" },
  { id: "BR5", label: "DB password visible in env/manifests", answer: "secrets-manager" },
];

/* ---------------------------------- Hard: rollout ---------------------------------- */

const ROLLOUT_STEPS = [
  { id: "contain", label: "Contain: cordon worker-3, quarantine payments-svc & whale-miner", why: "Stop the active escape and the miner before anything else — responders secure the scene first." },
  { id: "rotate", label: "Rotate exposed credentials (npm token, SA tokens, cloud keys)", why: "Everything the attacker touched is compromised; rotation revokes their access even if artifacts remain." },
  { id: "rebuild", label: "Rebuild images: multi-stage, digest-pinned, re-scanned; purge bad tags", why: "Replace every vulnerable/tampered artifact with clean, verifiable cargo." },
  { id: "admission", label: "Enforce admission: signatures, digest pinning, registry allow-list", why: "Lock the customs gate so unsigned or unscanned images can never schedule again." },
  { id: "harden", label: "Apply Restricted PSS + default-deny NetworkPolicies + quotas", why: "Harden every berth: non-root, capped, isolated — shrink the blast radius of the next incident." },
  { id: "verify", label: "Verify & monitor: sensor alerts on nsenter/token reads, audit rules on CronJobs", why: "Close the loop — detect re-entry attempts and prove the controls work in production." },
];
const ROLLOUT_ANSWER = ["contain", "rotate", "rebuild", "admission", "harden", "verify"];

/* ---------------------------------- Quiz ---------------------------------- */
/* QCM authoring rules enforced by the QA audit (R4/R5):
   - correct-answer position rotates across the bank (no fixed/weak pattern),
   - the correct option is never the longest — all options within ±1 word,
   - distractors come from the same concept family (real misconceptions). */

const QUIZ_MEDIUM = [
  {
    id: "QM1",
    prompt: "Why does one compromised container endanger everything else on the same host?",
    options: [
      "Each container virtualizes its own kernel through a micro-hypervisor",
      "Registry replication keeps every image on every node in sync",
      "Containers share the host kernel, so isolation is software-only",
      "Cluster schedulers bin-pack workloads onto the same physical cores",
    ],
    answer: 2,
    explain:
      "Correct: namespaces and cgroups are kernel features, so the shared kernel is the whole boundary — exactly what escape attacks (T1611) target. The hypervisor option describes a VM, not a container; registry replication and scheduler bin-packing are real mechanisms but neither defines the isolation boundary.",
    topic: "Shared-kernel isolation model (Harbor Manual)",
  },
  {
    id: "QM2",
    prompt: "Which image reference is the safest to deploy?",
    options: [
      "internal registry, digest-pinned, signed, scanned clean",
      "public hub, :latest, unknown publisher, never scanned",
      "public hub, official base image, tag :19, EOL runtime",
      "internal registry, :v2.1 tag, signed, two critical CVEs",
    ],
    answer: 0,
    explain:
      "Correct: digest + signature + clean scan is the four-seal standard from the Customs Gate. The :latest lure is mutable and unscanned; the official base image is not your application and Node 19 is EOL; and R4 proved a signature cannot save a red scan — provenance never overrides scan results.",
    topic: "Digest pinning, signing and scan gating (Customs Gate)",
  },
  {
    id: "QM3",
    prompt: "A teammate sets privileged: true “so the agent can read /dev”. What was actually granted?",
    options: [
      "A logging verbosity switch with no security impact",
      "Read-only access to the host kernel version string",
      "A dedicated CPU scheduling class for the agent",
      "An extra DNS entry in the cluster's service registry",
      "Near-host powers: every capability and full /dev",
    ],
    answer: 4,
    explain:
      "Correct: privileged hands the container nearly all host capabilities and all of /dev — with docker.sock or a hostPath it is effectively root on the node. Logging switches, kernel strings, scheduling classes and DNS entries are all real settings, and none of them is what privileged means.",
    topic: "Privileged vs unprivileged containers (The Berths)",
  },
  {
    id: "QM4",
    prompt: "A Dockerfile's last layer runs rm /app/secret.env. The secret is…",
    options: [
      "moved into the registry's encrypted credential store",
      "still recoverable from an earlier layer by anyone",
      "safe as long as the registry requires authentication",
      "renamed and retained until the next scheduled rebuild",
    ],
    answer: 1,
    explain:
      "Correct: layers are immutable — rm writes a whiteout that hides the file, while every earlier layer still ships it (you saw this in the X-ray). Registries do not re-store secrets, auth limits pulls but not the layers, and no rebuild renames anything.",
    topic: "Immutable layers and secret persistence (Dry Dock X-ray)",
  },
  {
    id: "QM5",
    prompt: "Where does the payments database password belong?",
    options: [
      "In an ENV line inside the production Dockerfile",
      "In a ConfigMap mounted beside the application",
      "In the team's git repository next to the code",
      "In a secrets manager, injected at runtime",
    ],
    answer: 3,
    explain:
      "Correct: runtime injection keeps the value out of layers, image history, manifests and etcd literals. ENV and git are effectively public inside the image, and ConfigMaps are for non-sensitive configuration — geo-worker's secretKeyRef is the model to copy.",
    topic: "Secrets management (Dry Dock / control board)",
  },
  {
    id: "QM6",
    prompt: "What does a hardened cluster's admission controller actually do?",
    options: [
      "Re-scans every running pod once per twenty-four hours",
      "Blocks deploys failing signature, scan or tag policy",
      "Rotates the cluster's internal certificates nightly",
      "Autoscales worker nodes whenever pods queue up",
    ],
    answer: 1,
    explain:
      "Correct: admission control intercepts create/update calls before scheduling and rejects cargo that fails policy — the customs officer, not a background scanner. Periodic re-scans, certificate rotation and autoscaling are real platform jobs, none of them admission control.",
    topic: "Admission control and deploy-time gating (Customs Gate)",
  },
];

const QUIZ_HARD = [
  {
    id: "QH1",
    prompt: "SCENARIO — The sensor shows nsenter -t 1 inside payments-svc. First action?",
    options: [
      "Wait for the next scheduled scan cycle to confirm",
      "Restart the container and clear the alert",
      "Quarantine pod, cordon node, preserve audit logs",
      "Delete the event from the feed to cut noise",
    ],
    answer: 2,
    explain:
      "Correct: nsenter against PID 1 has no benign use in an app container — it is the escape move (T1611), so containment comes first and evidence stays intact. Waiting a scan cycle, restarting, or deleting the event all leave the attacker on the node.",
    topic: "Escape response sequencing (Runtime Feed / rollout drill)",
  },
  {
    id: "QH2",
    prompt: "SCENARIO — Critical-CVE images keep reaching production despite scanning. What closes the gap?",
    options: [
      "Admission control failing closed on unscanned cargo",
      "Running the same scanner on a tighter schedule",
      "Emailing scan reports to every team for manual review",
      "Moving the whole estate back onto virtual machines",
    ],
    answer: 0,
    explain:
      "Correct: a report nobody enforces is paperwork — the gate must reject unsigned/unscanned/critical images at deploy time. Faster scanning and emailed reports still depend on a human; VMs change the hypervisor, not the missing gate.",
    topic: "Enforced admission gating (Customs Gate / control board)",
  },
  {
    id: "QH3",
    prompt: "SCENARIO — whale-miner-77f is running on worker-3. Which technique → first-response pair is right?",
    options: [
      "T1613 Discovery → add more RAM to the node",
      "T1612 Build Image → restart the Docker daemon",
      "T1552.007 Container API → patch the kubelet version",
      "T1053.007 CronJob → delete the coin-sync schedule",
      "T1610 Deploy Container → terminate pod, cordon node",
    ],
    answer: 4,
    explain:
      "Correct: a malicious pod is deployed cargo (T1610) — remove the workload and isolate the node it landed on. The decoys pair each remaining technique with an unrelated action; deleting the CronJob (T1053.007) matters too, but the running pod is the active threat.",
    topic: "Technique-to-response pairing (MITRE Board)",
  },
  {
    id: "QH4",
    prompt: "SCENARIO — Leadership asks who created CronJob coin-sync, when, from which IP. Which source answers?",
    options: [
      "The registry's vulnerability scan report",
      "The Kubernetes API server's audit logs",
      "The container's own stdout stream",
      "The image's layer history metadata",
    ],
    answer: 1,
    explain:
      "Correct: audit logs record every API call — who, what, when and from where. Scans see image contents, stdout sees the process, layer history sees build steps; none of them records API identity.",
    topic: "Detection data sources (MITRE Board / data-source drill)",
  },
  {
    id: "QH5",
    prompt: "SCENARIO — A team keeps :latest “to always ship the newest build”. The real consequence?",
    options: [
      "None — latest is just another ordinary name",
      "It only affects image download speed",
      "latest images are automatically FIPS-validated",
      "The bytes under it change without notice",
    ],
    answer: 3,
    explain:
      "Correct: :latest is a mutable pointer — reproducibility, rollbacks and scan guarantees all break, which is why admission policies ban it. The other three options are the three most common ways teams rationalize the tag.",
    topic: "Mutable tags and digest pinning (Customs Gate)",
  },
  {
    id: "QH6",
    prompt: "SCENARIO — An npm token is baked into three published tags. Order the response.",
    options: [
      "Rotate now, rebuild clean, inject at runtime",
      "Squash the images, email the team, close ticket",
      "Rebuild first, rotate whenever convenient later",
      "Make the registry private, wait for expiry",
    ],
    answer: 0,
    explain:
      "Correct: rotation revokes what attackers already hold, the clean rebuild stops the leak shipping again, runtime injection fixes the process. Squashing never un-leaks a distributed secret, and waiting for expiry leaves the window open.",
    topic: "Compromised-secret response order (Dry Dock)",
  },
  {
    id: "QH7",
    prompt: "SCENARIO — A NetworkPolicy YAML was applied, but pods still talk to everything. Most likely cause?",
    options: [
      "Production namespaces ignore NetworkPolicies",
      "The pods need additional CPU requests assigned",
      "The CNI plugin does not enforce NetworkPolicy",
      "The policy only matches newly scheduled pods",
    ],
    answer: 2,
    explain:
      "Correct: the API accepts the manifest regardless — enforcement is the CNI's job, and without an enforcing CNI (Calico/Cilium class) the YAML is a no-op. Namespaces do not ignore policy, CPU is unrelated, and policy applies to existing pods too — verify with a canary deny.",
    topic: "NetworkPolicy enforcement (control board)",
  },
];

/* ---------------------------------- Knowledge core ---------------------------------- */

const KNOWLEDGE = {
  what: [
    "A container image is an immutable, layered package: application code plus every library it needs. A running container is just a normal Linux process, boxed in by namespaces (what it can see) and cgroups (what it can use).",
    "Unlike a virtual machine, a container has no own kernel. Every container on a node shares the host's kernel — which is why containers start in milliseconds and why a single escape can put an attacker on the node itself.",
    "Registries distribute images; Kubernetes (the orchestrator) schedules them as pods. Cloud+ expects you to secure every hop of that supply chain: build, ship, run, monitor.",
  ],
  why: [
    "For an attacker, a container estate is high-value density: one weak image, one exposed Docker API or one privileged pod can yield dozens of workloads — plus the host.",
    "The classic abuse chain: abuse the container admin API or supply chain to get in (T1609/T1610/T1612), discover the estate (T1613), persist via orchestration jobs (T1053.007), steal credentials the container can reach (T1552.007) — then escape to the host (T1611) where monitoring is thinner and the keys to the neighborhood live.",
    "Cryptojacking is the most common payoff (Tesla 2018, TeamTNT/Kinsing 2020–21): free compute spread across every node a flat network can reach.",
  ],
  variants: [
    "Privileged container or mounted /var/run/docker.sock — the escape springboard.",
    "hostPath mounts (especially /), hostPID/hostNetwork — host visibility handed to the workload.",
    "Exposed Docker/Kubernetes API on the network — remote administration by strangers.",
    ":latest and unpinned tags — supply-chain bait-and-switch; unsigned images — tampering you cannot detect.",
    "Plaintext secrets in ENV/manifests/layers — credentials that outlive their containers.",
    "Rogue CronJobs and admin-bound RBAC — persistence that survives pod deletion.",
  ],
};

const GLOSSARY = [
  { term: "Container", def: "A sandboxed Linux process: application + dependencies isolated by the host kernel's namespaces and cgroups." },
  { term: "Image", def: "The immutable template a container runs — built in layers, distributed by a registry." },
  { term: "Layer", def: "One filesystem diff in an image. Layers are immutable and append-only; deleting a file in one layer never removes it from earlier ones." },
  { term: "Registry", def: "The store that distributes images (Docker Hub, ECR, an internal registry). Treat it as a supply-chain chokepoint." },
  { term: "Digest", def: "The content hash of an exact image (sha256:…). Pinning it makes a reference immutable." },
  { term: "Mutable tag", def: "A label like :latest that can be re-pointed to different bytes over time — non-reproducible and risky." },
  { term: "Image signing", def: "A cryptographic 'tamper seal' (e.g., Sigstore/Cosign) proving who built the image and that its bytes were not altered." },
  { term: "Admission controller", def: "Kubernetes' deploy-time gate: verifies policy (signature, scan, registry, tag) before a pod is allowed to schedule." },
  { term: "Namespace / cgroup", def: "The kernel mechanisms that isolate what a container sees and caps what it can consume." },
  { term: "Privileged container", def: "A container granted near-host powers (most capabilities, full /dev) — the top escape enabler." },
  { term: "Container escape", def: "Breaking out of the container boundary to execute on the host (MITRE T1611)." },
  { term: "Pod", def: "The smallest Kubernetes workload unit — one or more containers sharing network/storage." },
  { term: "securityContext", def: "The pod/container hardening block: runAsNonRoot, capabilities, readOnlyRootFilesystem, seccomp, and friends." },
  { term: "NetworkPolicy", def: "Kubernetes' per-pod firewall rules; clusters are flat-by-default without them (and they need an enforcing CNI)." },
  { term: "Secrets manager", def: "The vault that holds credentials and injects them at runtime — keeping secrets out of images, ENV and git." },
  { term: "SBOM", def: "Software Bill of Materials: the machine-readable ingredient list of an image, for zero-day response." },
];

/* ---------------------------------- Debrief ---------------------------------- */

const DEBRIEF = {
  detections: [
    {
      source: "Runtime sensor (syscall/behavior)",
      logic: "process = nsenter OR (mount of host paths) OR read of */serviceaccount/token OR exec from /tmp → alert, page on",
    },
    {
      source: "Kubernetes audit logs",
      logic: 'verb=create object=CronJob and NOT user in {ci-runner, svc-deploy} → alert; user=system:anonymous listing pods/deployments → alert',
    },
    { source: "Registry scan reports", logic: "new critical CVE in any image referenced by a live Deployment → ticket + block rebuild gate" },
    { source: "Signature verification log", logic: "admission denied (unsigned/untrusted digest) spikes → investigate who is shipping unsealed cargo" },
    { source: "Egress / flow logs", logic: "pod → 169.254.169.254 or mining-pool ports → block + alert (cryptojacking / credential harvesting)" },
  ],
  mitigations: [
    { id: "M1026", name: "Privileged Account Management", note: "No standing privileged pods; RBAC least privilege on the cluster API." },
    { id: "M1035", name: "Limit Access to Resource Over Network", note: "Registry/API never internet-exposed; default-deny NetworkPolicies; block metadata egress." },
    { id: "M1030", name: "Network Segmentation", note: "Namespace segmentation, egress allow-lists for workloads." },
    { id: "M1038", name: "Execution Prevention", note: "Seccomp/AppArmor profiles, read-only rootfs, dropped capabilities." },
    { id: "M1047", name: "Audit", note: "Audit-log rules on CronJob creation, anonymous API use, RBAC changes." },
    { id: "M1051", name: "Update Software", note: "Rebuild images on base-image CVEs; EOL runtimes out of the fleet." },
    { id: "M1042", name: "Disable or Remove Feature or Program", note: "Unprivileged containers only; no docker.sock in app pods." },
    { id: "M1048", name: "Application Isolation and Sandboxing", note: "Restricted Pod Security Standard as the cluster floor." },
    { id: "M1018", name: "User Account Management", note: "Short-lived SA tokens, no anonymous API access." },
  ],
  blue: [
    "Pin digests, sign images, fail closed at admission — make the unsafe deploy impossible, not merely visible.",
    "Every berth should look like geo-worker: non-root, read-only rootfs, zero capabilities, seccomp, limits, secrets from the vault.",
    "Alert on behavior, not just CVEs: nsenter, SA-token reads, anonymous API listing, odd CronJobs.",
    "Practice the response: contain → rotate → rebuild → enforce → verify. Published secrets are burned secrets.",
    "Verify control enforcement (CNI policies actually deny), and keep the registry, Docker API and dashboard off the internet.",
  ],
  red: [
    "Escaped-container tradecraft starts where config hygiene ends: privileged pods, mounted sockets, hostPaths.",
    "Flat cluster networks mean one owned pod is a tenant survey: list, discover, move.",
    "CronJobs are persistence that survives cleanup; SA tokens are the keys left in the ignition.",
    "Env/layer secrets are timeless — they keep working long after the pod is gone.",
    "Thinking like the attacker tells you exactly which telemetry your sensor stack must keep — and which alerts would have caught this exercise at 01:41, not 02:14.",
  ],
  refs: [
    { label: "MITRE ATT&CK — Escape to Host (T1611)", url: "https://attack.mitre.org/techniques/T1611/" },
    { label: "MITRE ATT&CK — Deploy Container (T1610)", url: "https://attack.mitre.org/techniques/T1610/" },
    { label: "MITRE ATT&CK — Container Orchestration Job (T1053.007)", url: "https://attack.mitre.org/techniques/T1053/007/" },
    { label: "MITRE ATT&CK — Unsecured Credentials: Container API (T1552.007)", url: "https://attack.mitre.org/techniques/T1552/007/" },
    { label: "NIST SP 800-190 — Application Container Security Guide", url: "https://csrc.nist.gov/pubs/sp/800/190/final" },
    { label: "CompTIA Cloud+ (CV0-004) — official page", url: "https://www.comptia.org/en-us/certifications/cloud" },
  ],
  next: [
    "CV0-004 4.4/4.5 — compliance standards and security controls: map this lab's controls to CIS Docker/Kubernetes benchmarks.",
    "Deep-dive Kubernetes: RBAC, Pod Security Standards and admission policy as code.",
    "Practice reading raw audit logs and syscall traces — the Cloud+ PBQs love them.",
  ],
};

/* ---------------------------------- Mode select ---------------------------------- */

const MODE_CARDS = {
  medium: {
    name: "MEDIUM — Harbormaster's Cadet",
    tag: "Learn & understand",
    bullets: [
      "12 guided objectives, in learning order",
      "3-tier hints available anytime (costs stars, never progress)",
      "Tolerant checks — synonyms accepted, every check teaches",
      "Concept quiz with full explanations",
    ],
  },
  hard: {
    name: "HARD — Night-shift Inspector",
    tag: "Test & stretch",
    bullets: [
      "10 broad, multi-step challenges across the whole harbor",
      "Noisy evidence with red herrings; no where-to-look pointers",
      "One optional nudge, and it visibly costs score",
      "Strict checks: exact values, sequences, and justifications",
    ],
  },
};
