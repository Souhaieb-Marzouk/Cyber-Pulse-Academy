// HARBOR-7 — objectives, hints and the machine-checkable validation engine.
// Static port note: 1:1 port of src/lib/lab/objectives.ts — same objectives,
// same hints, same check rules, same teaching feedback wording.

/* ------------------------------ Initial state shapes ------------------------------ */

function initialEnv() {
  return {
    lifecycle: [],
    isolation: { t1: null, t2: null, t3: null, t4: null },
    chainOrder: [],
    kernelWhy: "",
    dockerFlags: {},
    xrayLayer: null,
    xraySecret: "",
    xrayWhy: "",
    xrayFix: "",
    tokenRemediation: [],
    registryVerdicts: Object.fromEntries(REGISTRY_IMAGES.map((r) => [r.id, null])),
    registryTags: [],
    registryRejectReason: "",
    berthStatus: Object.fromEntries(BERTH_CONTAINERS.map((c) => [c.id, null])),
    berthTags: [],
    eventVerdicts: Object.fromEntries(FEED_EVENTS.map((e) => [e.id, null])),
    attackChain: [],
    mitreMap: {},
    datasourceMatch: {},
    podFlags: [],
    podPatch: {},
    boardState: Object.fromEntries(BOARD_CONTROLS.map((c) => [c.id, false])),
    boardMapping: {},
    rollout: [],
    benignReasons: {},
  };
}

function initialState() {
  return {
    version: 1,
    stage: "intro",
    zone: null,
    berthTab: null,
    mode: null,
    briefingSeen: false,
    env: initialEnv(),
    objectives: {},
    quiz: { medium: { answers: {}, checked: {}, submitted: false, missed: [] }, hard: { answers: {}, checked: {}, submitted: false, missed: [] } },
    completedShown: { medium: false, hard: false },
    startedAt: null,
    completedAt: null,
  };
}

const ok = (title, body, detail) => ({ pass: true, title, body, detail });
const no = (title, body, detail) => ({ pass: false, title, body, detail });

/* ------------------------------ MEDIUM objectives ------------------------------ */

const MEDIUM = [
  {
    id: "OBJ-M1",
    mode: "medium",
    pillar: "P1",
    zone: "manual",
    title: "Order the five stages of container security lifecycle",
    context: "Security controls only make sense in sequence — build the mental timeline first.",
    anchor: "Lesson fundamentals: build → scan/sign → ship → run → monitor supply chain",
    hints: [
      { label: "Nudge", text: "Ask for each stage: does it happen while the image exists only as a Dockerfile, or after it runs?" },
      { label: "Direction", text: "The image is scanned and signed before it is shipped to the registry, and monitored after it runs." },
      { label: "Demonstration", text: "Correct order: BUILD → SCAN & SIGN → SHIP → RUN → MONITOR." },
    ],
    check: (env) =>
      env.lifecycle.join(",") === "build,scansign,ship,run,monitor"
        ? ok(
            "Timeline locked in.",
            "Every control you enable later lives at one of these stages — scanning/signing gates the build and ship stages, hardening governs the run stage, sensors watch the monitor stage. Knowing WHERE a control belongs is half of Cloud+ 4.3.",
          )
        : no(
            "Not the harbor's order yet.",
            "Follow one container's journey: it is first assembled, then verified and sealed, then shipped through the gate, then run at a berth — and only then can anyone watch it. Re-order the stages to match that journey.",
          ),
  },
  {
    id: "OBJ-M2",
    mode: "medium",
    pillar: "P1",
    zone: "manual",
    title: "Set the isolation truths: what a container really shares",
    context: "The escape risk you will hunt later exists because of exactly one of these statements.",
    anchor: "Official objective area: container isolation (namespaces/cgroups, shared kernel, privileged vs unprivileged)",
    hints: [
      { label: "Nudge", text: "Think about what a container is NOT: it is not a virtual machine, and it does not bring its own kernel." },
      { label: "Direction", text: "Exactly one statement here is false — the VM one." },
      { label: "Demonstration", text: "t1 true, t2 false, t3 true, t4 true." },
    ],
    check: (env) => {
      const expect = { t1: true, t2: false, t3: true, t4: true };
      const bad = ["t1", "t2", "t3", "t4"].filter((id) => env.isolation[id] !== expect[id]);
      return bad.length === 0
        ? ok(
            "Isolation model internalized.",
            "Containers are processes boxed in by namespaces and cgroups on a shared kernel. That shared kernel is the prize attackers chase with escape techniques — and the reason privileged containers are so dangerous.",
          )
        : no("One or more statements are off.", "Remember: VMs virtualize hardware and carry their own kernel; containers share the host's. Namespaces/cgroups and privileged mode are real kernel-level facts — re-read each statement and mark it accordingly.", [
            `${4 - bad.length}/4 correct`,
          ]);
    },
  },
  {
    id: "OBJ-M3",
    mode: "medium",
    pillar: "P2",
    zone: "drydock",
    title: "Flag the 4 critical flaws in the freight-portal Dockerfile",
    context: "The build farm ships this Dockerfile to production every night. Four lines are genuinely dangerous.",
    anchor: "Image build security: mutable tags, baked secrets, pipe-to-shell, root user",
    hints: [
      { label: "Nudge", text: "Look at where the tag comes from, where the password lives, how the installer arrives, and as whom the process ends up running." },
      { label: "Direction", text: "Line 1 (tag), line 4 (ENV), line 5 (curl|bash) and line 10 (USER) each carry one of the four critical flaws." },
      { label: "Demonstration", text: "L1 → Mutable tag · L4 → Baked secret · L5 → Pipe-to-shell · L10 → Root user." },
    ],
    check: (env) => {
      const wrong = DOCKER_CRITICAL.filter((id) => (env.dockerFlags[id] ?? null) !== DOCKER_ALL_FLAGS[id]);
      return wrong.length === 0
        ? ok(
            "All four critical build flaws caught.",
            "Unpinned tags, ENV secrets, curl|bash and root users are the four build-time flaws Cloud+ loves — each one becomes a runtime incident later. A defender fixes them in the Dockerfile, before any registry ever sees the image.",
          )
        : no(
            "Not all four are correctly flagged yet.",
            "Re-read the four lines: the tag that can change under you, the value written into the image forever, code fetched and executed from the network, and the user the process will run as.",
            [`${DOCKER_CRITICAL.length - wrong.length}/4 correct`],
          );
    },
  },
  {
    id: "OBJ-M4",
    mode: "medium",
    pillar: "P2",
    zone: "drydock",
    title: "X-ray the image: find the layer that still holds a credential",
    context: "The build log says the secret was deleted. Layers say otherwise.",
    anchor: "Image layers are immutable; secrets persist in layers",
    hints: [
      { label: "Nudge", text: "Deletion in a LATER layer cannot change an EARLIER one. Which layer wrote the file in the first place?" },
      { label: "Direction", text: "Inspect layer 2 closely — the COPY that brought .npmrc in." },
      { label: "Demonstration", text: "Layer 2 · a registry auth token." },
    ],
    check: (env) =>
      env.xrayLayer === 2 && env.xraySecret === XRAY_SECRET_ANSWER
        ? ok(
            "Secret recovered from the 'deleted' layer.",
            "Layers are immutable: RUN rm only adds a new layer that hides the file. Anyone who can pull the image can extract layer 2 and read the token. This is why secrets belong in a runtime-injected store, never in a layer.",
          )
        : no("Wrong layer or wrong secret type.", "Trace where the .npmrc file first entered the image, and look at what that file contains.", [
            "Layer selected: " + (env.xrayLayer ?? "none"),
          ]),
  },
  {
    id: "OBJ-M5",
    mode: "medium",
    pillar: "P2",
    zone: "gate",
    title: "Customs: approve exactly the one safe cargo",
    context: "Five candidates, one seal worth trusting. Stamp each one.",
    anchor: "Trusted registry, verified publisher, digest pinning, scan gating",
    hints: [
      { label: "Nudge", text: "For each candidate check all four seals: publisher, signature, immutability (digest), scan status." },
      { label: "Direction", text: "The only candidate that passes all four checks comes from your own registry with a digest reference and a clean scan." },
      { label: "Demonstration", text: "Approve only R1; reject the rest." },
    ],
    check: (env) => {
      const wrong = REGISTRY_IMAGES.filter((r) => (env.registryVerdicts[r.id] ?? null) !== r.verdict);
      return wrong.length === 0
        ? ok(
            "Clean cargo cleared, lures rejected.",
            "Signed + digest-pinned + scanned + known publisher — that is the four-seal standard. Note R4: a valid signature could not save it because the scan was red. Controls stack; none alone suffices.",
          )
        : no("Some stamps are wrong.", "Judge each candidate independently on the four seals — official-looking names and valid signatures on OTHER cargo are not enough.", [
            `${REGISTRY_IMAGES.length - wrong.length}/5 correct`,
          ]);
    },
  },
  {
    id: "OBJ-M6",
    mode: "medium",
    pillar: "P2",
    zone: "berths",
    title: "Identify the two most dangerous workloads at the berths",
    context: "Four containers are running. Two of them could hand an attacker the node.",
    anchor: "Official objective bullets: privileged vs unprivileged containers; host mounts/docker.sock",
    hints: [
      { label: "Nudge", text: "Which two containers expose things that belong to the HOST (socket, filesystem, namespaces) rather than to themselves?" },
      { label: "Direction", text: "payments-svc and metrics-agent — one holds the Docker socket, the other holds the host's root filesystem." },
      { label: "Demonstration", text: "Mark payments-svc and metrics-agent CRITICAL, tag each (docker socket / host mounts), then tag report-runner AT-RISK and geo-worker SECURE." },
    ],
    check: (env) => {
      const ps = env.berthStatus["payments-svc"];
      const ma = env.berthStatus["metrics-agent"];
      const hasTag = env.berthTags.some((t) => ["privileged", "docker-sock"].includes(t)) && env.berthTags.some((t) => t === "hostpath");
      return ps === "critical" && ma === "critical" && hasTag
        ? ok(
            "The escape springboards are marked.",
            "privileged + docker.sock is effectively root-on-host; hostPath / + hostPID/hostNetwork is the same privilege through another door. report-runner's root-and-limitless config is the at-risk middle ground, and geo-worker is the hardened standard to copy.",
          )
        : no("Not yet — find the two host-exposing workloads.", "Ask of each container: what can it touch beyond itself? A host socket, the host filesystem, host namespaces or full privileges are the tells.", [
            `payments-svc: ${ps ?? "unrated"} · metrics-agent: ${ma ?? "unrated"}`,
          ]);
    },
  },
  {
    id: "OBJ-M7",
    mode: "medium",
    pillar: "P3",
    zone: "berths",
    title: "Runtime feed: stamp every event THREAT or CLEAR",
    context: "Nine events from the new sensor. Six are the incident; three are the harbor breathing.",
    anchor: "Detection data sources + true/false positives",
    hints: [
      { label: "Nudge", text: "Real threats cross a boundary (read credentials, call the API anonymously, deploy cargo, reach for the host). Benign events come from known automation at fixed rhythms." },
      { label: "Direction", text: "The health probe, the CI build in the release window, and the nightly logrotate are the three clears." },
      { label: "Demonstration", text: "E1–E6 THREAT · E7, E8, E9 CLEAR." },
    ],
    check: (env) => {
      const wrong = FEED_EVENTS.filter((e) => (env.eventVerdicts[e.id] ?? null) !== e.verdict);
      return wrong.length === 0
        ? ok(
            "Feed triaged: 6 threats, 3 false positives.",
            "You just did a SOC shift: nsenter escape, SA-token theft, anonymous API recon, rogue CronJob, miner deployment, metadata harvesting — against a probe, a scheduled CI build and log rotation. Rhythm and identity separate noise from signal.",
          )
        : no("Some stamps don't match the evidence.", "For every event ask: who did this (identity), does it cross a boundary, and does it fit a known schedule? Nothing is a threat merely because it looks technical.", [
            `${FEED_EVENTS.length - wrong.length}/9 stamped correctly`,
          ]);
    },
  },
  {
    id: "OBJ-M8",
    mode: "medium",
    pillar: "P3",
    zone: "berths",
    title: "Map four incidents to their MITRE container techniques",
    context: "Cloud+ doesn't test ATT&CK, but analysts who can name techniques write better detections.",
    anchor: "MITRE T1611, T1610, T1053.007, T1613 (verified against official MITRE data)",
    hints: [
      { label: "Nudge", text: "Say each snippet as a verb: listing = discovery, new pod = deploy, scheduled = job, breaking out = escape." },
      { label: "Direction", text: "S1→discovery, S2→deploy, S3→orchestration job, S4→escape." },
      { label: "Demonstration", text: "S1=T1613 · S2=T1610 · S3=T1053.007 · S4=T1611." },
    ],
    check: (env) => {
      const wrong = MITRE_MEDIUM_REQUIRED.filter(
        (t) => !(MITRE_SNIPPETS.find((s) => s.answer === t)?.id && env.mitreMap[MITRE_SNIPPETS.find((s) => s.answer === t).id] === t),
      );
      return wrong.length === 0
        ? ok(
            "Techniques named like an analyst.",
            "Deploy (T1610), Discover (T1613), Persist via orchestration jobs (T1053.007), Escape (T1611) — this is the container kill chain in miniature. Each one has a matching detection in your debrief sheet.",
          )
        : no("Not all four mapped yet.", "Sort the snippets by intent: recon, delivery, persistence, breakout — then match each intent to its technique card.", [`${4 - wrong.length}/4 correct`]);
    },
  },
  {
    id: "OBJ-M9",
    mode: "medium",
    pillar: "P2",
    zone: "berths",
    title: "Flag the five misconfigurations in the order-api pod spec",
    context: "This manifest deploys tonight unless you catch what it asks for.",
    anchor: "securityContext, plaintext secrets in manifests, hostNetwork, empty resources",
    hints: [
      { label: "Nudge", text: "Read it as requests: what network does it want, what powers, how is the secret delivered, what limits?" },
      { label: "Direction", text: "hostNetwork, privileged, allowPrivilegeEscalation, the literal DB password, and empty resources — five flags." },
      { label: "Demonstration", text: "Flag P4, P9, P10, P13, P14." },
    ],
    check: (env) => {
      const missing = POD_REQUIRED_FLAGS.filter((id) => !env.podFlags.includes(id));
      const extra = env.podFlags.filter((id) => !POD_REQUIRED_FLAGS.includes(id));
      return missing.length === 0 && extra.length === 0
        ? ok(
            "Manifest audited — all five traps found.",
            "A privileged pod on the host network with an inline secret and no limits is four incidents waiting to schedule. Your flags are exactly what a Restricted Pod Security Standard would have blocked at the gate.",
          )
        : no("Flag set incomplete.", "Five lines are asking for powers or carrying secrets they should not. Look again at network, privileges, the env block and the empty resources braces.", [
            `${POD_REQUIRED_FLAGS.length - missing.length}/5 flagged`,
          ]);
    },
  },
  {
    id: "OBJ-M10",
    mode: "medium",
    pillar: "P4",
    zone: "berths",
    title: "Switch on the controls that answer three named risks",
    context: "The board is dark. Bring up the controls the harbor actually needs for these risks.",
    anchor: "Mitigations: CI scanning, admission control, non-root/caps, runtime sensor, quotas",
    hints: [
      { label: "Nudge", text: "Vulnerable images are a gate problem, escape a powers problem, exhaustion a limits problem — and one control watches behavior." },
      { label: "Direction", text: "Enable: CI scanning, admission policy, non-root + dropped caps, runtime sensor, quotas/limits." },
      { label: "Demonstration", text: "ci-scan, admission-sign, nonroot-caps, runtime-sensor, quotas → ON." },
    ],
    check: (env) => {
      const need = ["ci-scan", "admission-sign", "nonroot-caps", "runtime-sensor", "quotas"];
      const off = need.filter((id) => !env.boardState[id]);
      return off.length === 0
        ? ok(
            "Board live for the three risks.",
            "Each risk got layered answers: scanning + admission for images, non-root/caps + sensor for escape (prevent AND detect), quotas for exhaustion. That layering — and knowing which control answers which risk — is the mitigation half of this lesson.",
          )
        : no("Some controls are still dark.", "Map each risk to its control type: images need gates, escape needs fewer powers plus eyes, CPU burn needs limits.", [`${5 - off.length}/5 controls on`]);
    },
  },
  {
    id: "OBJ-M11",
    mode: "medium",
    pillar: "P4",
    zone: "drydock",
    title: "Choose the remediation for the leaked npm token",
    context: "The token from the X-ray is already inside published tags. Pick the three actions that actually fix it.",
    anchor: "Secret rotation + rebuild + runtime injection",
    hints: [
      { label: "Nudge", text: "A leaked secret cannot be un-leaked — only replaced. The image cannot be un-published — only rebuilt." },
      { label: "Direction", text: "Rotate the token, rebuild clean, and change WHERE secrets come from at runtime." },
      { label: "Demonstration", text: "Select: Rotate · Rebuild without any secret in layers · Inject at runtime from the secrets manager." },
    ],
    check: (env) => {
      const a = new Set(env.tokenRemediation);
      const good = TOKEN_ANSWERS.every((t) => a.has(t));
      const badPick = env.tokenRemediation.filter((t) => !TOKEN_ANSWERS.includes(t));
      return good && badPick.length === 0
        ? ok(
            "Response plan is sound.",
            "Rotate (revoke what attackers hold) → rebuild (stop shipping the secret) → inject at runtime (fix the process). rm-layers and squashing only hide the file; they never revoke a value already in the wild.",
          )
        : no("That plan leaves a door open.", "Only rotation revokes a compromised value; only a clean rebuild stops the leak from shipping again; only runtime injection stops the next repetition.", [
            `${env.tokenRemediation.length} of 3 selected — they must be the RIGHT 3, not just any 3`,
          ]);
    },
  },
  {
    id: "OBJ-M12",
    mode: "medium",
    pillar: "P3",
    zone: "berths",
    title: "Pick the right data source for each detection question",
    context: "Good detections start from the source that actually records the answer.",
    anchor: "Detection data sources: K8s audit logs, registry scan reports, runtime sensors",
    hints: [
      { label: "Nudge", text: "Identity questions live in API audit logs; content questions in scan reports; behavior questions in syscall sensors." },
      { label: "Direction", text: "CronJob creator → audit logs. CVEs in an image → scan report. Syscalls → runtime sensor." },
      { label: "Demonstration", text: "D1=Kubernetes audit logs · D2=Registry vulnerability scan report · D3=Runtime sensor." },
    ],
    check: (env) => {
      const wrong = DATASOURCE_ROWS.filter((r) => (env.datasourceMatch[r.id] ?? "") !== r.answer);
      return wrong.length === 0
        ? ok(
            "Sources matched to questions.",
            "This trio — audit logs, scan reports, runtime sensors — is your entire observability stack for containers in Cloud+ scope. Every detection in the debrief is built from one of them.",
          )
        : no("Some answers don't live in that source.", "Ask of each question: is it about identity (who), content (what's inside), or behavior (what ran)?", [`${3 - wrong.length}/3 correct`]);
    },
  },
];

/* ------------------------------ HARD objectives ------------------------------ */

const HARD = [
  {
    id: "OBJ-H1",
    mode: "hard",
    pillar: "P1",
    zone: "manual",
    title: "Chain brief: order the techniques and state why the kernel is the prize",
    context: "Brief the shift lead in one move: the attack chain, and the boundary that makes escape king.",
    anchor: "Attack-chain position of T1610/T1613/T1053.007/T1611 + shared-kernel model",
    hints: [{ label: "Nudge", text: "Chain: put cargo in, look around, lock the door open for later, then step outside the box." }],
    check: (env) =>
      env.chainOrder.join(">") === CHAIN_ANSWER.join(">") && env.kernelWhy === KERNEL_WHY_ANSWER
        ? ok(
            "Brief accepted.",
            "Deploy → discover → persist → escape. Every technique below the escape only matters because the shared kernel sits under all of it; that is the boundary privileged pods, caps and seccomp defend. This is the mental model the rest of the shift runs on.",
          )
        : no(
            "The brief has gaps.",
            "The chain reads: deploy cargo, survey the estate, schedule persistence, then break out. And the reason escape is valuable is about what all containers share — not logs, CPU or scanners.",
            [`chain: ${env.chainOrder.join(">") || "—"} · kernel: ${env.kernelWhy || "—"}`],
          ),
  },
  {
    id: "OBJ-H2",
    mode: "hard",
    pillar: "P2",
    zone: "drydock",
    title: "Full build audit: flag ALL six flaws, zero false flags",
    context: "Cadets found four. Inspectors find six — and never cry wolf.",
    anchor: "Complete Dockerfile hardening: tags, secrets, pipe-to-shell, COPY hygiene, leftover tooling, root",
    hints: [{ label: "Nudge", text: "Two extra flaws hide in how the build context enters the image and what stays behind after npm install." }],
    check: (env) => {
      const entries = Object.entries(env.dockerFlags).filter(([, v]) => v);
      const wrongCat = entries.filter(([id, cat]) => cat !== DOCKER_ALL_FLAGS[id]);
      const missing = Object.keys(DOCKER_ALL_FLAGS).filter((id) => !env.dockerFlags[id]);
      return entries.length === 6 && wrongCat.length === 0 && missing.length === 0
        ? ok(
            "Build audit complete — 6/6, no false flags.",
            "COPY . . drags the build context (env files, git metadata) into layers, and --include=dev ships compilers and dev tooling to production. Multi-stage builds with a strict .dockerignore erase both problems at once.",
          )
        : no("Audit rejected.", "Exactly six lines carry a flaw, and each must carry the RIGHT category. A neutral line flagged, or a right line miscategorized, fails an inspector's review.", [
            `flagged ${entries.length}/6 · miscategorized ${wrongCat.length}`,
          ]);
    },
  },
  {
    id: "OBJ-H3",
    mode: "hard",
    pillar: "P2",
    zone: "drydock",
    title: "Layer forensics: layer, secret, mechanism, and the only real fix",
    context: "Full forensic write-up on the X-ray table: all four findings, exact.",
    anchor: "Layer immutability + secret rotation + multi-stage rebuild",
    hints: [{ label: "Nudge", text: "The fix has two halves: deal with the leaked VALUE, and deal with the leaky PROCESS." }],
    check: (env) =>
      env.xrayLayer === 2 &&
      env.xraySecret === XRAY_SECRET_ANSWER &&
      env.xrayWhy === XRAY_WHY_ANSWER &&
      env.xrayFix === XRAY_FIX_ANSWER
        ? ok(
            "Forensics accepted.",
            "Layer 2 holds the npm token; the rm in layer 5 is a whiteout, not a deletion; published tags mean the value is burned — so rotate, rebuild clean, and move secrets to runtime injection. Write that sentence in your runbook.",
          )
        : no("Write-up incomplete or wrong.", "Four findings: which layer first contained the file, what the file holds, WHY it survives the rm, and which response actually revokes the risk.", [
            `layer=${env.xrayLayer ?? "—"} secret=${env.xraySecret || "—"} why=${env.xrayWhy || "—"} fix=${env.xrayFix || "—"}`,
          ]),
  },
  {
    id: "OBJ-H4",
    mode: "hard",
    pillar: "P2",
    zone: "gate",
    title: "Adjudicate the gate: verdicts + full justification for the approval",
    context: "Inspectors justify their stamps. Approve, reject, and paper the file.",
    anchor: "Trusted registry + signature + digest + scan; reject-with-reason for the vulnerable internal tag",
    hints: [{ label: "Nudge", text: "The approval file takes three tags; the nearest distractor fails on content, not provenance." }],
    check: (env) => {
      const wrong = REGISTRY_IMAGES.filter((r) => (env.registryVerdicts[r.id] ?? null) !== r.verdict);
      const tags = new Set(env.registryTags);
      const allTags = ["signed", "digest", "scanned"].every((t) => tags.has(t));
      return wrong.length === 0 && allTags && env.registryRejectReason === REGISTRY_REJECT_REASON_ANSWER
        ? ok(
            "Adjudication filed.",
            "R1 approved on all three seals (signed, digest-pinned, scanned clean); R4 rejected on CONTENT — two critical CVEs — proving that provenance never overrides scan results. This is exactly how admission policy reasons.",
          )
        : no("File incomplete.", "All five verdicts must be correct, the approval must carry all three justification tags, and the R4 rejection needs the reason an inspector would write.", [
            `verdicts ${5 - wrong.length}/5 · tags ${env.registryTags.length}/3 · reason ${env.registryRejectReason ? "set" : "unset"}`,
          ]);
    },
  },
  {
    id: "OBJ-H5",
    mode: "hard",
    pillar: "P2",
    zone: "berths",
    title: "Berth classification: rate all four workloads, tag the escape paths",
    context: "Every container gets a class, and every escape path gets named.",
    anchor: "Privileged/docker.sock, hostPath/hostPID/hostNetwork, root-with-no-limits, hardened baseline",
    hints: [{ label: "Nudge", text: "Two criticals, one at-risk, one secure. The tags: socket, privilege, host exposure — and plain root." }],
    check: (env) => {
      const expect = { "payments-svc": "critical", "metrics-agent": "critical", "report-runner": "atrisk", "geo-worker": "secure" };
      const wrong = Object.keys(expect).filter((id) => env.berthStatus[id] !== expect[id]);
      const tags = new Set(env.berthTags);
      const needTags = ["privileged", "docker-sock", "hostpath"];
      const tagsOk = needTags.every((t) => tags.has(t));
      return wrong.length === 0 && tagsOk
        ? ok(
            "Berth survey complete.",
            "payments-svc (privileged + docker.sock) and metrics-agent (hostPath / + host namespaces) are critical; report-runner is the at-risk middle; geo-worker is the standard. Three named escape paths — that is the cluster's true attack surface, in one table.",
          )
        : no("Survey rejected.", "Class all four correctly and tag every distinct escape path on the two criticals.", [
            `status wrong: ${wrong.length} · escape tags: ${needTags.filter((t) => tags.has(t)).length}/3`,
          ]);
    },
  },
  {
    id: "OBJ-H6",
    mode: "hard",
    pillar: "P3",
    zone: "berths",
    title: "Incident workup: perfect triage + the attacker's timeline",
    context: "Stamp all nine events, then reconstruct the six hostile moves in the order they happened.",
    anchor: "Runtime + audit detection; sequence-based analysis of the incident",
    hints: [{ label: "Nudge", text: "Timeline: they looked, they shipped, they scheduled, they took tokens (twice), they broke out." }],
    check: (env) => {
      const wrong = FEED_EVENTS.filter((e) => (env.eventVerdicts[e.id] ?? null) !== e.verdict);
      const chain = FEED_EVENTS.filter((e) => e.verdict === "threat").sort((a, b) => (a.chainOrder ?? 0) - (b.chainOrder ?? 0));
      const answer = chain.map((e) => e.id);
      const chainOk = env.attackChain.join(">") === answer.join(">");
      return wrong.length === 0 && chainOk
        ? ok(
            "Incident workup accepted.",
            "Timeline reconstructed: anonymous API recon (01:41) → miner deployed (01:43) → CronJob persistence (01:44) → SA token copied (01:48) → metadata credential harvest (01:49) → nsenter escape (01:52). Six minutes, six stages — and every stage had a detection opportunity you have now named.",
          )
        : no("Workup incomplete.", "All nine stamps must be right, and the six hostile events must be ordered as the attacker experienced them.", [
            `stamps ${9 - wrong.length}/9 · chain ${chainOk ? "correct" : "misordered"}`,
          ]);
    },
  },
  {
    id: "OBJ-H7",
    mode: "hard",
    pillar: "P3",
    zone: "berths",
    title: "Analyst sheet: all six MITRE mappings + all three data sources",
    context: "Name every technique in play, and the source that would catch each question.",
    anchor: "T1610/T1611/T1612/T1613/T1053.007/T1552.007 + audit/scan/sensor sources",
    hints: [{ label: "Nudge", text: "One snippet is about BUILDING on the host, one about CREDENTIALS via the API — the pair cadets usually swap." }],
    check: (env) => {
      const wrongM = MITRE_SNIPPETS.filter((s) => (env.mitreMap[s.id] ?? "") !== s.answer);
      const wrongD = DATASOURCE_ROWS.filter((r) => (env.datasourceMatch[r.id] ?? "") !== r.answer);
      return wrongM.length === 0 && wrongD.length === 0
        ? ok(
            "Analyst sheet complete.",
            "Six techniques named — including the supply-chain pair T1612 (build on host) and T1552.007 (credentials via container API) — and the three data sources that answer identity, content and behavior questions. Your debrief detections are pre-matched to these.",
          )
        : no("Sheet has errors.", "Six snippet mappings and three source matches must all be exact.", [
            `mitre ${6 - wrongM.length}/6 · sources ${3 - wrongD.length}/3`,
          ]);
    },
  },
  {
    id: "OBJ-H8",
    mode: "hard",
    pillar: "P4",
    zone: "berths",
    title: "Harden order-api: flags + the exact Restricted-PSS securityContext",
    context: "From audit to patch: rebuild the pod spec to the cluster standard, field by field.",
    anchor: "securityContext hardening: runAsNonRoot/10001, caps drop ALL, readonly rootfs, seccomp, secretKeyRef, resources",
    hints: [{ label: "Nudge", text: "Ten fields. The UID is not root and not nobody; caps are dropped, not added; the secret moves FROM value TO valueFrom." }],
    check: (env) => {
      const wrongF = POD_REQUIRED_FLAGS.filter((f) => !env.podFlags.includes(f));
      const extraF = env.podFlags.filter((f) => !POD_REQUIRED_FLAGS.includes(f));
      const wrongP = POD_PATCH_FIELDS.filter((f) => (env.podPatch[f.id] ?? "") !== f.answer);
      return wrongF.length === 0 && extraF.length === 0 && wrongP.length === 0
        ? ok(
            "Patch accepted — order-api is Restricted-grade.",
            "Non-root UID 10001, no escalation, no privilege, read-only rootfs, ALL capabilities dropped, RuntimeDefault seccomp, secret via secretKeyRef, resources bounded, hostNetwork off. Ship this spec and the berths start looking like geo-worker.",
          )
        : no("Patch rejected.", "All five flags plus every one of the ten hardening fields must be exact — near-misses fail a Restricted review.", [
            `flags ${POD_REQUIRED_FLAGS.length - wrongF.length}/5 · fields ${POD_PATCH_FIELDS.length - wrongP.length}/10`,
          ]);
    },
  },
  {
    id: "OBJ-H9",
    mode: "hard",
    pillar: "P4",
    zone: "berths",
    title: "Rollout order + final control-board state + risk mapping",
    context: "Command the hardening rollout: sequence it, set the board, and map each risk to its primary control.",
    anchor: "Response sequencing (contain→rotate→rebuild→enforce→harden→verify) + control selection & trade-offs",
    hints: [{ label: "Nudge", text: "You cannot rotate what you have not contained, and you cannot verify what you have not enforced. Two controls on the board must stay OFF." }],
    check: (env) => {
      const rollOk = env.rollout.join(">") === ROLLOUT_ANSWER.join(">");
      const wrongBoard = BOARD_CONTROLS.filter((c) => env.boardState[c.id] !== (c.desiredOn ?? true));
      const expectedMap = { BR1: "admission-sign", BR2: "nonroot-caps", BR3: "network-policies", BR4: "quotas", BR5: "secrets-manager" };
      const mapOk = ["BR1", "BR2", "BR3", "BR4", "BR5"].every((r) => env.boardMapping[r] === expectedMap[r]);
      return rollOk && wrongBoard.length === 0 && mapOk
        ? ok(
            "Rollout commanded.",
            "Contain → rotate → rebuild → enforce at the gate → harden the berths → verify and watch. Board state: nine controls on, and the standing privileged sidecar and public mirror stay OFF — convenience is how yesterday's incident becomes tomorrow's repeat.",
          )
        : no("Order or board rejected.", "The six rollout steps must be in response order, the board must end in its exact safe state (two controls OFF), and each risk needs its primary control.", [
            `rollout ${rollOk ? "ok" : "wrong"} · board ${BOARD_CONTROLS.length - wrongBoard.length}/${BOARD_CONTROLS.length} · mapping ${mapOk ? "ok" : "wrong"}`,
          ]);
    },
  },
  {
    id: "OBJ-H10",
    mode: "hard",
    pillar: "P3",
    zone: "berths",
    title: "Close the false positives: justify each CLEAR with the right rationale",
    context: "An inspector who cannot say WHY it's benign will clear the wrong thing eventually.",
    anchor: "True vs false positive reasoning: probes, scheduled CI, log rotation",
    hints: [{ label: "Nudge", text: "Identity + schedule + expected endpoint = noise. Match each clear to its alibi." }],
    check: (env) => {
      const expect = { E7: "probe", E8: "ci", E9: "rotation" };
      const wrong = Object.keys(expect).filter((id) => (env.benignReasons[id] ?? "") !== expect[id]);
      return wrong.length === 0
        ? ok(
            "All clears justified.",
            "Probe (kubelet, fixed cadence), CI build (known SA, release window, internal registry), rotation (logging agent, nightly). Tuning = encoding exactly these alibis into your detection logic so the pager only fires for the other six.",
          )
        : no("Rationales don't match the evidence.", "Each clear has exactly one alibi in the list — tie it to identity, schedule and expected behavior.", [`${3 - wrong.length}/3 justified`]);
    },
  },
];

const OBJECTIVES = [...MEDIUM, ...HARD];

function objectivesFor(mode) {
  return OBJECTIVES.filter((o) => o.mode === mode);
}

/* Which Berths console section each objective lives in */
function berthTabForObjective(id) {
  if (id === "OBJ-M6" || id === "OBJ-H5") return "berths";
  if (id === "OBJ-M7" || id === "OBJ-H6") return "feed";
  if (id === "OBJ-M8" || id === "OBJ-M12" || id === "OBJ-H7") return "mitre";
  if (id === "OBJ-M9" || id === "OBJ-H8") return "podspec";
  if (id === "OBJ-M10" || id === "OBJ-H9") return "board";
  if (id === "OBJ-H10") return "feed";
  return "berths";
}

/* Benign-rationale options for the hard-mode widget */
const BENIGN_REASON_OPTIONS = [
  { id: "probe", label: "Kubelet liveness probe — fixed 30 s cadence, expected endpoint, expected 200", forId: "E7" },
  { id: "ci", label: "Scheduled release build by ci-runner SA via the internal registry inside the release window", forId: "E8" },
  { id: "rotation", label: "Nightly logrotate by the logging agent — size reset with no tamper indicators", forId: "E9" },
];
