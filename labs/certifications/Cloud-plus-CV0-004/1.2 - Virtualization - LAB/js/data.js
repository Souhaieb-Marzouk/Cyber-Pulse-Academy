// THE ISOLATION FOUNDRY — js/data.js
// ALL lab content (objectives, quiz bank, world data, glossary, knowledge core,
// debrief) — transpiled 1:1 from the framework's content.ts + data.ts.
// Data only: no DOM, no logic. Every string matches the original lab verbatim.
(function (F) {
  "use strict";

  // ==================== content module (was content.ts) ====================
// THE ISOLATION FOUNDRY — content module
// Cloud+ CV0-004 · Domain 1 · Lesson 1.2 "Virtualization"
// All training data is synthetic and clearly labeled. Educational, defensive framing.
const PILLARS = {
    P1: { label: "Understand", short: "P1", color: "#F1A33C" },
    P2: { label: "Recognize / Analyze", short: "P2", color: "#3ED6C0" },
    P3: { label: "Detect / Triage", short: "P3", color: "#F07E5A" },
    P4: { label: "Mitigate / Govern", short: "P4", color: "#B79CF6" },
};
const OBJECTIVES = [
    // ---------------- MEDIUM ----------------
    {
        id: "M1", mode: "medium", pillar: "P1",
        title: "Sort the stack: place each technology chip in its correct layer bin",
        detail: "Before you cast anything, calibrate the wall chart. Every virtualization technology lives at a specific layer — putting each one in the right bin is the fastest way to see how the stack fits together.",
        anchor: "CI-01/03/06/09/12 — stack taxonomy, hardware assist, VM anatomy, OS-level runtimes",
        panel: "calibration", hints: [
            "Think bottom-up: silicon first, then the software that schedules guests, then what a guest is made of, then what runs inside an existing OS.",
            "VT-x/AMD-V is a CPU feature — it ships inside the hardware bin. ESXi and KVM are hypervisors. A qcow2 disk belongs to a full VM stack.",
            "Docker Engine and namespaces/cgroups do not boot their own kernel — they are OS-level (container) runtimes.",
        ],
    },
    {
        id: "M2", mode: "medium", pillar: "P1",
        title: "Classify hypervisors: Type 1 (bare-metal) vs Type 2 (hosted)",
        detail: "Eight hypervisor products arrive on the calibration bench. Decide for each whether it installs directly on hardware (Type 1) or on top of a host OS (Type 2).",
        anchor: "CI-04/05 — hypervisor types and standard product examples",
        panel: "calibration", hints: [
            "Ask: 'could this hypervisor boot a server with no other OS installed?' If yes, it is Type 1.",
            "ESXi, Hyper-V, KVM and Xen run on bare metal. VirtualBox, Workstation, Fusion and Parallels are desktop apps.",
            "Type 2 products need Windows/macOS/Linux underneath — they are hosted hypervisors used for labs and dev/test.",
        ],
    },
    {
        id: "M3", mode: "medium", pillar: "P1",
        title: "Match each acceleration mode to the sentence that defines it",
        detail: "Four tricks make virtualization fast or flexible. Match hardware-assist, para-virtualization, emulation and pass-through to their definitions — the exam loves these four.",
        anchor: "CI-06/07/08/11 — VT-x/AMD-V, para-virtualization, emulation, device pass-through",
        panel: "calibration", hints: [
            "Only one mode means 'software pretending to be a completely different CPU'.",
            "Virtio-style enlightened drivers are the signature of para-virtualization: the guest knows the hypervisor.",
            "VT-x/AMD-V are CPU instructions; pass-through hands a physical device to exactly one guest.",
        ],
    },
    {
        id: "M4", mode: "medium", pillar: "P2",
        title: "Read the VM manifest: extract its virtual hardware",
        detail: "A tenant VM spec landed on the bench. Identify the vCPU count, RAM, vNIC count and virtual disk format — the anatomy of every virtual machine.",
        anchor: "CI-09 — VM anatomy: vCPU, vRAM, vNIC, virtual disk",
        panel: "artifacts", hints: [
            "Open the Artifacts tab; the manifest is YAML — read the keys, not the comments.",
            "cpus: and memory_gb: give you the first two answers; interfaces: lists the vNICs.",
            "The disk line ends in '.qcow2' — that is the virtual disk format.",
        ],
    },
    {
        id: "M5", mode: "medium", pillar: "P2",
        title: "Cast the intake: deploy all six tenant workloads with the right mold",
        detail: "Six intake cards wait in the deck. For each, pick the isolation mold its requirements demand — VM, container, microVM, function or VDI pool — and pour it onto a host with room.",
        anchor: "CI-09/12/13/15/16/17 — runtime selection, isolation boundaries, VDI, sandboxing",
        panel: "floor", hints: [
            "Isolation first: the untrusted vendor binary must not see other tenants — give it the strongest boundary (a full VM).",
            "Stateless + spiky + per-call billing = function. Twelve contractor desktops on unmanaged devices = VDI.",
            "The database wants guaranteed capacity (a VM), the web replicas are small and many (containers).",
        ],
    },
    {
        id: "M6", mode: "medium", pillar: "P2",
        title: "True or false: call the four VM-vs-container statements",
        detail: "Two juniors are arguing about containers versus VMs. Settle it — mark each statement true or false. Every false call must be correctable with one sentence in the debrief.",
        anchor: "CI-13 — VM vs container trade-offs: kernel, boot time, density, isolation strength",
        panel: "concepts", hints: [
            "Containers do not boot a guest OS — they share the host kernel through namespaces/cgroups.",
            "If a statement claims containers are MORE isolated than VMs, be suspicious.",
            "No guest OS to boot is exactly why containers start in milliseconds.",
        ],
    },
    {
        id: "M7", mode: "medium", pillar: "P3",
        title: "Triage the fleet: name the CPU-contended host and the memory-starved host",
        detail: "The telemetry table shows two hosts with very different pains. Identify which host suffers CPU contention (high CPU ready %) and which suffers memory pressure (ballooning).",
        anchor: "CI-18 — CPU ready time, memory ballooning as contention telemetry",
        panel: "telemetry", hints: [
            "CPU ready time = how long vCPUs waited for a physical CPU. High = CPU contention.",
            "Ballooning reclaims guest memory when the host has overcommitted its RAM.",
            "Compare the ready% column and the balloon column across both hosts — each pain has its own host.",
        ],
    },
    {
        id: "M8", mode: "medium", pillar: "P3",
        title: "Snapshot audit: find the offender and state the risk",
        detail: "Quarterly hygiene audit. One VM has let its snapshots pile up dangerously. Name it and choose the risk that long snapshot chains create.",
        anchor: "CI-10 — snapshots, snapshot sprawl, chain growth",
        panel: "telemetry", hints: [
            "Look for both a high snapshot count AND an old age — the worst offender has both.",
            "Check the 'age of oldest' column; 84 days is not hygiene.",
            "Every snapshot is a delta chain: the longer it grows, the slower restores and writes get.",
        ],
    },
    {
        id: "M9", mode: "medium", pillar: "P3",
        title: "Health check: prescribe the self-healing action and the scaling move",
        detail: "The replica card shows one crashed web replica and a sustained CPU climb on both hosts. Decide what the orchestrator should do about the replica, and which scaling approach fits the trend.",
        anchor: "CI-19 — desired-state self-healing, horizontal vs vertical scaling",
        panel: "telemetry", hints: [
            "Orchestrators reconcile to a desired count: a failed replica is replaced, not mourned.",
            "The trend is on BOTH hosts — one bigger VM cannot fix a pool that is saturated everywhere.",
            "Adding more small instances across hosts is horizontal scale-out.",
        ],
    },
    {
        id: "M10", mode: "medium", pillar: "P4",
        title: "Govern the floor: reserve, limit, and separate",
        detail: "Guarantee the database its capacity, cap the marketing batch job before it starves its neighbors, and pin the two web replicas to different hosts so one host failure cannot take down the tier.",
        anchor: "CI-17/18 — reservations, limits, anti-affinity (noisy-neighbor controls)",
        panel: "floor", hints: [
            "Select a placed workload chip on the floor — the ops rail opens its controls.",
            "Reservations guarantee; limits cap. The DB needs a CPU reservation, the batch job needs a CPU limit.",
            "Anti-affinity is a toggle on BOTH web replicas — the rule must exist on each side of the pair.",
        ],
    },
    {
        id: "M11", mode: "medium", pillar: "P4",
        title: "Maintenance drill: order the five steps of a safe patch window",
        detail: "FORGELINE-01 needs its hypervisor patched tonight. Order the five runbook steps — protecting the database, draining tenants, and leaving no snapshot litter behind.",
        anchor: "CI-10/15 — snapshot before change, live migration drain, snapshot hygiene",
        panel: "ops", hints: [
            "First protect the data you cannot afford to lose, then empty the host.",
            "Snapshot the DB before anything else; drain via live migration second; patch third.",
            "After verifying workloads, delete the snapshot — snapshots are safety nets, not storage.",
        ],
    },
    {
        id: "M12", mode: "medium", pillar: "P1",
        title: "Why clouds are built on this: map each cloud trait to its virtualization enabler",
        detail: "Close the loop: five traits every cloud promises, five virtualization capabilities that deliver them. Match them and you can answer 'why does the cloud run on virtualization?' in one breath.",
        anchor: "CI-01/02 — virtualization's role: pooling, multitenancy, elasticity, sandboxing, metering",
        panel: "concepts", hints: [
            "Multitenancy is only safe because of a specific capability — which one?",
            "Elasticity is about creating and destroying virtual resources quickly, on demand.",
            "Metered billing needs the hypervisor to know exactly how much each tenant consumed.",
        ],
    },
    // ---------------- HARD ----------------
    {
        id: "H1", mode: "hard", pillar: "P2",
        title: "Build the compliance intake: cast six workloads to exact specification",
        detail: "The RFP in the bench is unforgiving: exact molds, exact hosts, exact reservations. pay-core must land on FORGELINE-02 with CPU+RAM reserved, the fraud sandbox must be isolated on FORGELINE-01, and the web replicas must never share a host.",
        anchor: "CI-04/05/09/10/12/13/14/15/16/17/18 — full intake lifecycle to spec",
        panel: "rfp", hints: [
            "Untrusted tenant code execution service = microVM (VM-grade isolation, fast boots).",
            "Bursty per-call API = function. Contractor desktops = VDI pool. Two stateless web replicas = containers on DIFFERENT hosts.",
            "pay-core: VM on FORGELINE-02 with CPU AND memory reservations; fraud-model sandbox: VM on FORGELINE-01.",
        ],
    },
    {
        id: "H2", mode: "hard", pillar: "P1",
        title: "Site survey: prescribe the virtualization approach for three sites",
        detail: "Three very different sites, one decision each: the right virtualization approach AND the reason that justifies it. Near-misses (para-virtualization everywhere, Type 2 in the datacenter) will be rejected with a rationale.",
        anchor: "CI-04/05/08 — Type 1 vs Type 2 vs emulation selection",
        panel: "survey", hints: [
            "A 400-VM regional fleet runs on bare-metal Type 1 — efficiency and central management at scale.",
            "A developer laptop workshop needs a hypervisor that lives inside the existing OS.",
            "Testing a SPARC binary on x86 silicon is not virtualization at all — it is emulation.",
        ],
    },
    {
        id: "H3", mode: "hard", pillar: "P3",
        title: "Night-shift triage: find the real incident inside the noise",
        detail: "Alerts, a chat log, and a metric table — two of the items are red herrings. Name the affected host, the true root cause, and select the TWO evidence lines that prove it. Exact values win arguments.",
        anchor: "CI-18 — ballooning/swap telemetry, noisy neighbor, overcommitment",
        panel: "evidence", hints: [
            "A flapping switch port is a network event; a powered-off playground VM consumes nothing. Neither explains DB latency.",
            "Follow the memory story: balloon climbing + swap-in activity + which tenant grew on that host.",
            "FORGELINE-02: balloon 5.8 GB, swap-in 42 MB/s, and 'mktg-batch' grew from 2 GB to 12 GB there.",
        ],
    },
    {
        id: "H4", mode: "hard", pillar: "P3",
        title: "Remediation sequence: order the four actions that end the incident",
        detail: "Four actions, one order that actually works. The wrong order re-creates the incident — the validator will reject a near-miss sequence and explain why it fails.",
        anchor: "CI-18 — protect victims, cap the cause, rebalance, then verify",
        panel: "evidence", hints: [
            "First protect the victim (reserve memory for the DB), THEN cap the cause.",
            "Capping the batch job before reserving lets the next spike hit the DB again.",
            "Reserve → cap → migrate one web replica away → re-check balloon and ready metrics.",
        ],
    },
    {
        id: "H5", mode: "hard", pillar: "P4",
        title: "Patch runbook: execute the six-step window without the traps",
        detail: "Eight runbook buttons, six belong in the runbook, two are traps that would cause an outage or a compliance breach. Execute the six in the exact order; touching a trap voids the sequence.",
        anchor: "CI-10/15 — notify, snapshot, drain, patch, verify, prune",
        panel: "runbook", hints: [
            "Traps: powering off every tenant VM and patching mid-peak without notice are never correct.",
            "Notify tenants BEFORE you snapshot the payment core.",
            "Drain via live migration, patch + reboot, verify workloads, then delete the snapshot.",
        ],
    },
    {
        id: "H6", mode: "hard", pillar: "P4",
        title: "Isolation audit: assign the boundary each workload deserves",
        detail: "Five workloads from the security review. Choose the isolation boundary for each — containerizing everything is the near-miss this audit exists to catch.",
        anchor: "CI-12/13/14/16/17 — boundary selection: VM, container, microVM, VDI",
        panel: "audit-iso", hints: [
            "Multi-tenant untrusted code execution = microVM; PCI payment processing = full VM.",
            "Internal reporting app and disposable CI runners are classic containers — many, small, trusted-ish.",
            "Contractor desktops on unmanaged devices = VDI.",
        ],
    },
    {
        id: "H7", mode: "hard", pillar: "P3",
        title: "Scale call: pick the move the telemetry actually supports",
        detail: "Both hosts: CPU ready 18-21%, 4 GB ballooned, queue depth rising. Three of the four options are defensible-sounding — only one fits the evidence and the budget line. Justify with the right reason.",
        anchor: "CI-19/18 — horizontal vs vertical under a saturated pool",
        panel: "scale", hints: [
            "Vertical scale-up fails when the HOST itself is already saturated — where would the bigger VM get its resources?",
            "The stateless tier is where elasticity is cheapest: add replicas, not size.",
            "Spread new replicas across hosts with anti-affinity — that is the horizontal move.",
        ],
    },
    {
        id: "H8", mode: "hard", pillar: "P2",
        title: "FaaS fit: select the two true function jobs and place the exile",
        detail: "Six jobs, exactly two are genuine functions-as-a-service. Select both — and name the correct runtime home for the job that everyone mis-files.",
        anchor: "CI-14/15 — FaaS characteristics vs microVM / container / VM homes",
        panel: "faas", hints: [
            "FaaS = short, stateless, event-driven. Six-hour ETL and monthly batches are none of those.",
            "A stateful ledger must own its storage — that is a VM, not a function.",
            "The untrusted code-execution service is the exile: it wants a microVM, not FaaS.",
        ],
    },
    {
        id: "H9", mode: "hard", pillar: "P4",
        title: "Tenancy design: map the four promises and name the residual risk",
        detail: "Four cloud promises, four virtualization enablers — then the question every architect must answer: what risk remains even when the design is perfect? Pick the answer a defender would sign.",
        anchor: "CI-02/17 — enabler mapping + residual risk (hypervisor as high-value target)",
        panel: "tenancy", hints: [
            "Multitenancy is safe because of isolation boundaries; pooling is allocation, not safety.",
            "Elasticity = rapid provision/teardown. Sandboxing = disposable isolated environments.",
            "The residual risk: the hypervisor itself is a high-value target — patch it and restrict who can touch it.",
        ],
    },
];
// Length/meaning discipline (audit R5): every option within ~1-2 words of the others;
// the correct answer is never the longest. Correct positions rotate (audit R4):
// medium → c,d,a,b,d,b · hard → c,a,d,b,d,c,b.
const QUIZ = {
    medium: [
        {
            id: "mq1", obj: "M2",
            prompt: "Which hypervisor type installs directly onto physical hardware with no underlying OS?",
            options: [
                { id: "a", text: "A Type 2 (hosted) hypervisor, e.g., VirtualBox" },
                { id: "b", text: "A software emulator of foreign instruction sets" },
                { id: "c", text: "A Type 1 (bare-metal) hypervisor, e.g., ESXi" },
                { id: "d", text: "A container runtime on the shared host kernel" },
            ],
            answer: "c",
            explain: "Type 1 boots straight onto the metal — ESXi, Hyper-V, KVM and Xen all do, which is why datacenters standardize on them. Type 2 (VirtualBox) is an application on a host OS; emulators imitate hardware; container runtimes are not hypervisors at all.",
        },
        {
            id: "mq2", obj: "M3",
            prompt: "A tester must run an application compiled for a different CPU architecture on an x86 workstation. Which technology fits?",
            options: [
                { id: "a", text: "Hardware-assist via VT-x or AMD-V CPU features" },
                { id: "b", text: "Para-virtualization with enlightened drivers" },
                { id: "c", text: "Memory ballooning on the overloaded host" },
                { id: "d", text: "Full emulation of the foreign architecture" },
            ],
            answer: "d",
            explain: "Emulation is software imitating hardware — including a foreign instruction set — the only option that runs foreign-architecture code at all. VT-x accelerates same-architecture guests; para-virtualization enlightens I/O; ballooning reclaims memory and runs no code.",
        },
        {
            id: "mq3", obj: "M2",
            prompt: "Which of these is a Type 2 (hosted) hypervisor?",
            options: [
                { id: "a", text: "Oracle VirtualBox" },
                { id: "b", text: "VMware ESXi" },
                { id: "c", text: "Microsoft Hyper-V Server" },
                { id: "d", text: "Citrix XenServer / XCP-ng" },
            ],
            answer: "a",
            explain: "VirtualBox installs as an application on Windows, macOS or Linux — the definition of Type 2. ESXi, Hyper-V, XenServer/XCP-ng and KVM boot directly onto hardware as Type 1.",
        },
        {
            id: "mq4", obj: "M12",
            prompt: "What does 'resource pooling' mean in a virtualized cloud?",
            options: [
                { id: "a", text: "Each tenant is pinned to one dedicated physical server" },
                { id: "b", text: "Physical hardware is pooled and allocated on demand" },
                { id: "c", text: "Virtual disks are mirrored to object storage nightly" },
                { id: "d", text: "Every guest reserves a full physical CPU socket" },
            ],
            answer: "b",
            explain: "Pooling aggregates physical CPU, RAM, storage and network so the hypervisor can hand out virtual slices on demand — the mechanic behind consolidation, elasticity and multitenancy. Dedicated pinning and nightly mirroring describe the opposite of a shared pool.",
        },
        {
            id: "mq5", obj: "M7",
            prompt: "A host shows sustained CPU ready time of 20%. What does this indicate?",
            options: [
                { id: "a", text: "The network uplink is fully saturated" },
                { id: "b", text: "vCPUs queue for physical cores — CPU overcommitment" },
                { id: "c", text: "A snapshot chain has grown too long on disk" },
                { id: "d", text: "The host is memory-overcommitted and ballooning" },
            ],
            answer: "d",
            explain: "Ready time measures how long a vCPU sat ready-but-waiting for a physical core; sustained 20% = CPU contention — add reservations/limits, rebalance or scale out. Ballooning is the memory signature; snapshot chains slow disk; a saturated uplink shows in network counters, not ready time.",
        },
        {
            id: "mq6", obj: "M6",
            prompt: "Why do containers start in milliseconds while VMs typically take much longer?",
            options: [
                { id: "a", text: "Containers boot a trimmed guest kernel before init" },
                { id: "b", text: "Containers share the host kernel and skip OS boot" },
                { id: "c", text: "Containers pre-load images into ballooned memory" },
                { id: "d", text: "Containers avoid the emulation overhead VMs pay" },
            ],
            answer: "b",
            explain: "A container is an isolated process tree on the host kernel — no BIOS, no kernel boot, no guest init — while a VM must boot an entire guest OS. The trade: the shared kernel buys milliseconds and density but weakens the isolation boundary.",
        },
    ],
    hard: [
        {
            id: "hq1", obj: "H1",
            prompt: "SCENARIO — A PCI-scoped payment processor must land on the foundry floor. Which mold and which controls?",
            options: [
                { id: "a", text: "Container — namespaces are enough for PCI scope" },
                { id: "b", text: "Function — payment events arrive per transaction" },
                { id: "c", text: "Full VM with CPU and memory reservations set" },
                { id: "d", text: "MicroVM — cheaper than a VM and just as isolated" },
            ],
            answer: "c",
            explain: "Regulated, stateful, latency-sensitive: a full VM gives the strongest boundary and reservations guarantee capacity under contention. Functions fit short stateless events; containers share one kernel; microVMs are close but the exam-grade answer for a compliance core is the reserved VM.",
        },
        {
            id: "hq2", obj: "H3",
            prompt: "SCENARIO — FORGELINE-02 shows 5.8 GB ballooned and 42 MB/s swap-in. Which response is correct?",
            options: [
                { id: "a", text: "Reserve memory for the victim and cap the cause" },
                { id: "b", text: "Add more vCPUs to the orders-db virtual machine" },
                { id: "c", text: "Raise host overcommitment for extra memory headroom" },
                { id: "d", text: "Delete old snapshots to reclaim RAM immediately" },
            ],
            answer: "a",
            explain: "Ballooning plus swap-in is the signature of memory overcommitment: protect the victim with a reservation, stop the cause with a limit, then rebalance. vCPUs treat the wrong resource; more overcommitment deepens the squeeze; snapshots hold no reclaimable RAM.",
        },
        {
            id: "hq3", obj: "H3",
            prompt: "SCENARIO — During the memory incident, which evidence line is a RED HERRING?",
            options: [
                { id: "a", text: "'mktg-batch grew 2 GB → 12 GB on FORGELINE-02'" },
                { id: "b", text: "'orders-db p99 latency crossed 800 ms at 02:14'" },
                { id: "c", text: "'balloon driver reclaimed 5.8 GB on FORGELINE-02'" },
                { id: "d", text: "'TOR-SW-A port 17 flapped twice, auto-recovered'" },
            ],
            answer: "d",
            explain: "A transient port flap that recovered cleanly cannot sustain ballooning and swap-in. The tenant's growth, the DB latency spike and the balloon reclaim all tell one coherent memory-overcommitment story.",
        },
        {
            id: "hq4", obj: "H5",
            prompt: "SCENARIO — Hypervisor patch window on the host running the payment core. What is the correct first protective step after tenant notification?",
            options: [
                { id: "a", text: "Power off every tenant VM to freeze state" },
                { id: "b", text: "Snapshot the payment core VM for rollback" },
                { id: "c", text: "Enable CPU overcommitment to absorb patch load" },
                { id: "d", text: "Delete old snapshots to speed up the host" },
            ],
            answer: "b",
            explain: "Notify → snapshot (a fast rollback point for the riskiest workload) → drain via live migration → patch → verify → prune. Powering off tenants turns a patch window into an outage; deleting snapshots removes your safety nets; overcommitment adds risk during maintenance.",
        },
        {
            id: "hq5", obj: "H8",
            prompt: "SCENARIO — A provider runs untrusted tenant functions at massive scale. Why standardize on Firecracker-style microVMs (simplified)?",
            options: [
                { id: "a", text: "They emulate foreign CPUs faster than ESXi does" },
                { id: "b", text: "They drop the hypervisor from the stack entirely" },
                { id: "c", text: "They share the host kernel but add cgroups" },
                { id: "d", text: "They pair VM-grade isolation with fast boots" },
            ],
            answer: "d",
            explain: "MicroVMs are minimal VMs — hardware-virtualized isolation per tenant, stripped down to boot in ~125 ms (simplified). Containers share one kernel — a weaker boundary for hostile multi-tenant code; emulation and 'no hypervisor' contradict the architecture.",
        },
        {
            id: "hq6", obj: "H1",
            prompt: "SCENARIO — Two replicas of the stateless web tier. Which placement rule must be enforced, and why?",
            options: [
                { id: "a", text: "Affinity — one host gives the best cache locality" },
                { id: "b", text: "Pass-through — share one physical NIC between both" },
                { id: "c", text: "Anti-affinity — spread hosts, one failure survives" },
                { id: "d", text: "Balloon both VMs equally for scheduling fairness" },
            ],
            answer: "c",
            explain: "Anti-affinity spreads replicas across failure domains so one host failure cannot remove the whole tier. Affinity has its place for license or latency pinning, pass-through is a device technique, and ballooning is a memory-reclamation mechanism — none is a placement rule for availability.",
        },
        {
            id: "hq7", obj: "H6",
            prompt: "SCENARIO — 12 contractors work from unmanaged home devices and must never store client data locally. Which technology fits?",
            options: [
                { id: "a", text: "A Type 2 hypervisor on each contractor laptop" },
                { id: "b", text: "VDI — central desktops streamed to endpoints" },
                { id: "c", text: "Emulated legacy desktops per contractor" },
                { id: "d", text: "FaaS — one desktop function invoked per session" },
            ],
            answer: "b",
            explain: "VDI runs the desktop OS centrally on the hypervisor and streams pixels to unmanaged devices — client data never lands locally. Local hypervisors and emulation put the data ON the endpoint; FaaS is a compute model for short events, not desktop delivery.",
        },
    ],
};
const GLOSSARY = [
    { term: "Hypervisor", def: "The software layer that abstracts physical hardware and schedules guest workloads onto it — the foundation every cloud is built on.", ring: "core" },
    { term: "Type 1 (bare-metal)", def: "A hypervisor installed directly on hardware (ESXi, Hyper-V, KVM, Xen). The datacenter and cloud standard: efficient, centrally managed.", ring: "core" },
    { term: "Type 2 (hosted)", def: "A hypervisor that runs as an application on a host OS (VirtualBox, Workstation, Fusion, Parallels). Ideal for labs and dev/test, not for production fleets.", ring: "core" },
    { term: "vCPU / vRAM", def: "Virtual CPU and memory the hypervisor allocates to a guest; drawn from pooled physical resources, often overcommitted with care.", ring: "core" },
    { term: "Virtual disk", def: "A file that behaves like a physical disk for a guest (VMDK, VHD, qcow2). Snapshots create delta chains on top of it.", ring: "core" },
    { term: "Hardware-assisted virtualization", def: "CPU features (Intel VT-x, AMD-V) that let hypervisors run guests near-natively and safely — virtualization's engine since 2006.", ring: "core" },
    { term: "Para-virtualization", def: "Guests 'know' the hypervisor and use enlightened drivers (virtio-style) for near-native I/O without full hardware emulation.", ring: "core" },
    { term: "Emulation", def: "Software imitates entirely different hardware — including foreign CPU architectures. Slowest mode; used for legacy and cross-platform testing.", ring: "core" },
    { term: "Container (OS-level virtualization)", def: "Isolated process trees sharing the host kernel via namespaces (what they see) and cgroups (what they may use). Tiny, fast, weaker boundary than a VM.", ring: "core" },
    { term: "MicroVM", def: "A minimal virtual machine that boots in ~125 ms with VM-grade isolation and container-like density (Firecracker-style — simplified). Powers multi-tenant FaaS.", ring: "core" },
    { term: "Serverless / FaaS", def: "Event-driven function execution on provider-managed runtimes: no server management, per-invocation billing, scale-to-zero.", ring: "core" },
    { term: "VDI", def: "Virtual Desktop Infrastructure: desktop OSes run centrally on hypervisors and streamed to endpoints — data never lands on unmanaged devices.", ring: "core" },
    { term: "Multitenancy", def: "Many isolated tenants sharing the same physical infrastructure — safe only because hypervisor/container boundaries separate them.", ring: "core" },
    { term: "Resource pooling", def: "Aggregating physical CPU/RAM/disk/network into a pool allocated on demand to workloads — the mechanic behind consolidation and elasticity.", ring: "core" },
    { term: "Live migration", def: "Moving a running VM between hosts with no downtime (vMotion-style) — the tool behind drain-and-patch maintenance and load rebalancing.", ring: "core" },
    { term: "Snapshot", def: "A point-in-time capture of a VM's disk/state. Safety net for changes — but chains left running cause sprawl: slow restores, full storage.", ring: "ops" },
    { term: "Affinity / anti-affinity", def: "Placement rules: affinity keeps workloads together, anti-affinity spreads replicas across hosts so one failure cannot remove a whole tier.", ring: "ops" },
    { term: "Pass-through", def: "Assigning a physical device (GPU/NIC/PCI) directly to one guest for near-native performance — at the cost of mobility.", ring: "ops" },
    { term: "CPU ready time", def: "How long a vCPU waits for a physical core. Sustained high ready % = CPU contention: the earliest overcommitment warning.", ring: "ops" },
    { term: "Memory ballooning", def: "The hypervisor inflates a balloon inside the guest to reclaim RAM when the host overcommitted memory — pressure made visible.", ring: "ops" },
    { term: "Noisy neighbor", def: "A tenant consuming unfair shared capacity and degrading others — the reason limits, reservations and shares exist.", ring: "ops" },
];
const CORE = [
    {
        id: "what",
        title: "What virtualization is — and why clouds are made of it",
        body: [
            "Virtualization abstracts compute — CPU, memory, disk, network — away from physical hardware, so many isolated workloads share one machine safely. The layer that does this is the hypervisor: it owns the real resources, presents virtual ones, and schedules everything.",
            "That single idea powers the cloud's core promises: resource pooling (aggregate hardware, allocate virtually), multitenancy (many customers, strong isolation), elasticity (create and destroy virtual resources in seconds), consolidation (higher utilization, lower cost) and metered billing (the hypervisor knows exactly what each tenant consumed).",
            "Chain position: virtualization sits beneath IaaS — an 'instance' IS a virtual machine — and beneath PaaS/FaaS too: platforms and functions are packed onto virtualized or containerized infrastructure. Every Cloud+ domain that follows assumes this layer exists.",
        ],
        tip: "Exam angle: if a question mentions pooling, tenancy, elasticity or sandboxing, the underlying answer is almost always virtualization.",
    },
    {
        id: "hypervisors",
        title: "Hypervisors: Type 1 vs Type 2 (and the three accelerators)",
        body: [
            "Type 1 (bare-metal) hypervisors install directly on hardware: VMware ESXi, Microsoft Hyper-V, KVM, Xen/XenServer. They are the datacenter standard — lower overhead, central management, smaller attack surface.",
            "Type 2 (hosted) hypervisors install on top of a desktop or server OS: Oracle VirtualBox, VMware Workstation/Fusion, Parallels. Perfect for labs, dev/test and workshops — slower, and the host OS is a dependency and a risk surface.",
            "Three accelerators complete the picture: hardware-assist (Intel VT-x / AMD-V — CPU instructions that make virtualization fast and safe), para-virtualization (guests use enlightened drivers, e.g., virtio, instead of emulated hardware), and emulation (software imitates foreign hardware — slow, but runs foreign-architecture code). Device pass-through assigns a physical GPU/NIC directly to one guest for near-native performance.",
        ],
        tip: "Exam angle: 'installs directly on hardware' = Type 1; 'application on a host OS' = Type 2; 'different CPU architecture' = emulation.",
    },
    {
        id: "vm",
        title: "Anatomy and lifecycle of a virtual machine",
        body: [
            "A VM is a full computer in files: guest OS + vCPU + vRAM + vNIC(s) + virtual disk (VMDK/VHD/qcow2). The hypervisor presents virtual hardware; the guest cannot tell the difference.",
            "The lifecycle toolset: provision from templates/golden images for consistency; clone (full or linked) to stamp copies; snapshot for point-in-time rollback before changes — but snapshot chains left running cause sprawl (slow restores, storage bloat); live migration moves a running VM between hosts with no downtime (drain-and-patch!); clusters + affinity/anti-affinity rules place workloads for performance or separation; hot-add resizes without shutdown.",
        ],
        tip: "Exam angle: before any risky change: snapshot. Before host maintenance: live-migrate (drain). After the change: prune snapshots.",
    },
    {
        id: "containers",
        title: "Containers, microVMs and serverless — the lightweight family",
        body: [
            "Containers are OS-level virtualization: isolated processes sharing the host kernel, separated by namespaces (what they see) and limited by cgroups (what they may use). No guest OS means millisecond boots and high density — but a weaker isolation boundary than a VM, because everyone shares one kernel.",
            "VM vs container in one line: VMs bring their own kernel (strong isolation, heavy, seconds to boot); containers borrow the host's (light, fast, shared boundary). Choose by workload trust and density needs — most real clouds run both side by side.",
            "MicroVMs split the difference: minimal VMs that boot in ~125 ms with tiny overhead (Firecracker-style — simplified) while keeping hardware-virtualized isolation. Serverless/FaaS builds on them: event-driven functions on provider-managed runtimes, per-invocation billing, scale-to-zero — ideal for short, stateless, spiky work.",
        ],
        tip: "Exam angle: untrusted multi-tenant code wants a microVM or VM boundary; trusted, dense microservices fit containers; short + stateless + event-driven = FaaS.",
    },
    {
        id: "tenancy",
        title: "VDI, sandboxing and the ops discipline of shared floors",
        body: [
            "VDI runs desktop OSes centrally and streams them to endpoints — contractors on unmanaged devices get full desktops while data never leaves the datacenter. Same VM stack, different consumption model (DaaS delivers it as a service).",
            "Sandboxing is virtualization's gift to security: disposable, isolated environments for untrusted binaries, malware analysis (defensive labs) and risky experiments — burn it down, nothing escaped.",
            "Sharing a floor needs discipline: overcommit resources deliberately, then watch CPU ready time and ballooning for contention; set reservations (guarantees) for critical workloads, limits (caps) for noisy ones; use anti-affinity to spread replicas; patch hypervisors on a drumbeat — they are the highest-value target on the floor.",
        ],
        tip: "Exam angle: noisy neighbor incidents are resolved with limits + reservations + rebalancing, never by hoping.",
    },
];
const INDUSTRY_EXAMPLES = [
    { title: "AWS EC2 on the Nitro system", body: "Public-cloud IaaS at massive scale: dedicated bare-metal hosts running a KVM-based hypervisor (simplified), with networking/storage offloaded to Nitro cards — Type 1 virtualization industrialized.", tag: "simplified" },
    { title: "Microsoft Azure on Hyper-V", body: "Azure's fabric runs guest VMs on Hyper-V, Microsoft's Type 1 hypervisor — the same product family Cloud+ candidates administer on-premises (simplified).", tag: "simplified" },
    { title: "AWS Lambda & Fargate on Firecracker", body: "Multi-tenant functions and containers isolated in Firecracker microVMs — VM-grade boundaries at near-container speed; the model behind serverless economics (simplified).", tag: "simplified" },
    { title: "Netflix on containers", body: "Thousands of stateless microservices pack dense container fleets orchestrated for elasticity — the density/agility side of the VM-vs-container trade.", tag: "simplified" },
];
// ---------------- Debrief ----------------
const DEBRIEF = {
    observability: [
        { signal: "CPU ready time (%)", meaning: "vCPUs waiting for physical cores. Sustained >~10-15% = CPU contention — check overcommitment, add reservations, rebalance or scale out." },
        { signal: "Memory ballooning + swap-in", meaning: "The host gave away more RAM than it has. Balloon reclaim plus swap activity = memory overcommitment pain; protect victims, cap causes." },
        { signal: "Snapshot count & age", meaning: "Chains older than days are sprawl: slow restores, storage bloat. Audit monthly; prune after every change window." },
        { signal: "Replica desired-state drift", meaning: "Current < desired means a crashed replica. Orchestrators replace it — but only if someone watches the drift signal." },
        { signal: "Host capacity headroom", meaning: "CPU/RAM/slot gauges near 100% mean the next pour fails or contends. Capacity planning is detection before the incident." },
    ],
    mitigations: [
        { control: "Reservations & limits", note: "Guarantee capacity for critical workloads (DB), cap best-effort tenants (batch) — the noisy-neighbor toolbox." },
        { control: "Affinity / anti-affinity rules", note: "Spread replicas across hosts (availability) or pin for locality — placement is a control, not an accident." },
        { control: "Snapshot hygiene", note: "Snapshot before changes, verify after, prune promptly. Chains are safety nets, not storage." },
        { control: "Hypervisor patching & access control", note: "The hypervisor is the highest-value target: patch on schedule, restrict management-plane access, monitor its logs." },
        { control: "Isolation-boundary selection", note: "Match the mold to the trust level: VM/microVM for untrusted or regulated, containers for trusted density, functions for stateless events." },
        { control: "Sandboxing", note: "Run untrusted code in disposable isolated environments — strong boundary, zero persistence, burned after use." },
    ],
    blue: [
        "Baseline the fleet: know normal ready%, balloon and slot fill — anomalies are only visible against a baseline.",
        "Treat capacity gauges as early-warning telemetry: incidents announce themselves before users notice.",
        "Governance before growth: reservations and limits are cheaper than 2 a.m. pages.",
        "Change windows have a shape: notify → snapshot → drain → patch → verify → prune. Memorize the shape.",
        "Isolation boundaries are tiered on purpose — document which workloads get which mold and why.",
    ],
    red: [
        "Defenders study the hypervisor because attackers do: management interfaces are crown-jewel targets — isolate and harden them.",
        "Weaker boundaries (shared kernels) concentrate risk: one kernel vulnerability affects every tenant on that host — patch cadence is survival.",
        "Snapshot chains leak history: old deltas hold data someone forgot — inventory them like any other data store.",
        "Overcommitted hosts turn one noisy tenant into a fleet-wide incident — the attacker's cheapest DDoS is becoming your noisy neighbor.",
    ],
    examMap: [
        "Objective area: Domain 1 — Virtualization (understanding virtualization technologies and their role in cloud environments).",
        "Covered here: hypervisor types I/II, hardware assist / para-virtualization / emulation / pass-through, VM anatomy & lifecycle (templates, clones, snapshots, live migration, affinity), containers vs VMs, microVMs, serverless/FaaS, VDI, multitenancy, pooling, contention telemetry, governance controls.",
        "Next lessons in Domain 1: Cloud networking · Containerization (deep dive) · Orchestration (deep dive) · Database fundamentals · Resource optimization · Billing management.",
    ],
    links: [
        { label: "CompTIA Cloud+ (CV0-004) certification page", url: "https://www.comptia.org/en-us/certifications/cloud" },
        { label: "CompTIA Cloud+ CV0-004 exam objectives (official PDF)", url: "https://www.comptia.org/training/resources/exam-objectives" },
        { label: "NIST SP 800-125 — Guide to Security for Full Virtualization Technologies", url: "https://csrc.nist.gov/publications/detail/sp/800-125/final" },
        { label: "Firecracker microVM project (reference)", url: "https://firecracker-microvm.github.io/" },
    ],
};

  // ==================== world & bench data (was data.ts) ====================
// THE ISOLATION FOUNDRY — world & bench data (all synthetic, clearly labeled training data)
const RUNTIMES = {
    vm: {
        id: "vm", label: "Virtual Machine", mold: "Full Enclosure", icon: "Box",
        cpu: 4, ram: 8, slots: 4, isolation: 5, kernel: "own guest kernel",
        color: "#F1A33C",
        blurb: "Guest OS + virtual hardware. Strongest boundary, heaviest footprint.",
    },
    container: {
        id: "container", label: "Container", mold: "Shared Frame", icon: "Container",
        cpu: 1, ram: 2, slots: 1, isolation: 2, kernel: "host kernel (namespaces/cgroups)",
        color: "#3ED6C0",
        blurb: "OS-level isolation. Tiny, millisecond starts, high density.",
    },
    microvm: {
        id: "microvm", label: "MicroVM", mold: "Slim Shell", icon: "Shell",
        cpu: 2, ram: 4, slots: 2, isolation: 4, kernel: "own minimal kernel",
        color: "#F07E5A",
        blurb: "VM-grade isolation, ~125 ms boots (simplified). Built for hostile multi-tenancy.",
    },
    function: {
        id: "function", label: "Function (FaaS)", mold: "Disposable Stamp", icon: "Zap",
        cpu: 0.5, ram: 1, slots: 0, isolation: 3, kernel: "provider runtime (microVM-hosted)",
        color: "#B79CF6",
        blurb: "Event-driven, scale-to-zero, per-call billing. Short + stateless only.",
    },
    vdi: {
        id: "vdi", label: "VDI pool", mold: "Deck Lease", icon: "MonitorSmartphone",
        cpu: 2, ram: 4, slots: 2, isolation: 4, kernel: "own guest kernel (desktop)",
        color: "#9CCC65",
        blurb: "Centralized desktops streamed to endpoints — data never lands locally.",
    },
};
const HOSTS = [
    { id: "fl01", name: "FORGELINE-01", cpuCap: 16, ramCap: 32, slots: 12, note: "Type 1 hypervisor · KVM-based" },
    { id: "fl02", name: "FORGELINE-02", cpuCap: 16, ramCap: 32, slots: 12, note: "Type 1 hypervisor · KVM-based · compliance vault row" },
];
const INTAKE = {
    medium: [
        {
            id: "w_edge", name: "edge-resize", tenant: "Pinehill Retail", required: "function",
            brief: "Stateless image-resize API. Spiky traffic, per-call billing, scale to zero overnight.",
            needs: ["Short, stateless, event-driven", "Per-invocation billing", "No server management"],
        },
        {
            id: "w_web", name: "web-tier", tenant: "Pinehill Retail", required: "container",
            brief: "Stateless storefront web tier. Many small replicas, fast rolling restarts.",
            needs: ["Small & many", "Millisecond starts", "Trusted in-house code"],
        },
        {
            id: "w_db", name: "orders-db", tenant: "Pinehill Retail", required: "vm",
            brief: "ACID order database. Steady load, strict isolation, must own its kernel and disk.",
            needs: ["Strict isolation", "Own kernel & virtual disk", "Guaranteed capacity"],
        },
        {
            id: "w_sandbox", name: "vendor-eval", tenant: "Security team", required: "vm",
            brief: "Untrusted vendor binary evaluation. Must not see any other tenant, disposable after.",
            needs: ["Strongest boundary", "Disposable sandbox", "Untrusted code"],
        },
        {
            id: "w_mktg", name: "mktg-batch", tenant: "Marketing", required: "vm",
            brief: "Monthly campaign batch job. CPU-hungry for hours, best-effort is fine.",
            needs: ["Heavy compute", "Best-effort OK", "Own OS image"],
        },
        {
            id: "w_vdi", name: "contractor-dek", tenant: "QA contractors", required: "vdi",
            brief: "Twelve contractor desktops on unmanaged home devices. Client data must stay central.",
            needs: ["Unmanaged endpoints", "Data never local", "Central patching"],
        },
    ],
    hard: [
        {
            id: "h_pay", name: "pay-core", tenant: "Ledgerline Pay", required: "vm", requiredHost: "fl02",
            reserves: ["cpu", "mem"],
            brief: "PCI-scoped payment processor. Stateful, latency-sensitive, zero tolerance for contention.",
            needs: ["Strongest isolation boundary", "CPU + RAM reserved", "Land on FORGELINE-02 (vault row)"],
        },
        {
            id: "h_fraud", name: "fraud-sandbox", tenant: "Risk team", required: "vm", requiredHost: "fl01",
            brief: "Third-party fraud-model evaluation — untrusted weights and binaries.",
            needs: ["Untrusted code", "Strongest boundary", "Isolated on FORGELINE-01, away from pay-core"],
        },
        {
            id: "h_web", name: "web-front", tenant: "Ledgerline Pay", required: "container",
            brief: "Stateless storefront replicas. Small, fast, many — never both on one host.",
            needs: ["Trusted in-house code", "High density", "Replicas on DIFFERENT hosts"],
        },
        {
            id: "h_api", name: "receipt-render", tenant: "Ledgerline Pay", required: "function",
            brief: "Receipt rendering on every checkout webhook. Bursty, stateless, per-call.",
            needs: ["Event-driven", "Scale to zero", "Per-invocation billing"],
        },
        {
            id: "h_eval", name: "policy-eval", tenant: "Platform (product)", required: "microvm",
            brief: "Customers run their own policy scripts on our floor — hostile multi-tenant execution.",
            needs: ["Untrusted multi-tenant code", "VM-grade boundary", "Fast boots, high density"],
        },
        {
            id: "h_vdi", name: "auditor-dek", tenant: "External auditors", required: "vdi",
            brief: "Auditor desktops on unmanaged devices during audit season.",
            needs: ["Unmanaged endpoints", "Data never local", "Central control"],
        },
    ],
};
const STACK_BINS = [
    { id: "hardware", label: "Physical hardware", hint: "silicon you can touch" },
    { id: "hypervisor", label: "Hypervisor / VMM", hint: "schedules guests on hardware" },
    { id: "vmstack", label: "Full VM stack", hint: "guest OS + its virtual parts" },
    { id: "osruntime", label: "OS-level runtime", hint: "container engine + kernel sharing" },
];
const STACK_ITEMS = [
    { id: "t_xeon", text: "Bare-metal Xeon hosts · 512 GB RAM", bin: "hardware" },
    { id: "t_vtx", text: "Intel VT-x / AMD-V CPU feature", bin: "hardware" },
    { id: "t_esxi", text: "VMware ESXi", bin: "hypervisor" },
    { id: "t_kvm", text: "KVM (Linux kernel module)", bin: "hypervisor" },
    { id: "t_guest", text: "Ubuntu guest OS + app stack on ESXi", bin: "vmstack" },
    { id: "t_qcow", text: "qcow2 virtual disk image", bin: "vmstack" },
    { id: "t_docker", text: "Docker Engine + app containers", bin: "osruntime" },
    { id: "t_cg", text: "Linux namespaces & cgroups", bin: "osruntime" },
];
// ---------- M2: hypervisor type sort ----------
const HYPERVISOR_ITEMS = [
    { id: "h_esxi", text: "VMware ESXi", bin: "t1" },
    { id: "h_hyperv", text: "Microsoft Hyper-V Server", bin: "t1" },
    { id: "h_kvm", text: "KVM", bin: "t1" },
    { id: "h_xen", text: "Citrix XenServer / XCP-ng", bin: "t1" },
    { id: "h_vbox", text: "Oracle VirtualBox", bin: "t2" },
    { id: "h_ws", text: "VMware Workstation Pro", bin: "t2" },
    { id: "h_fusion", text: "VMware Fusion", bin: "t2" },
    { id: "h_par", text: "Parallels Desktop", bin: "t2" },
];
const HYPERVISOR_BINS = [
    { id: "t1", label: "Type 1 · bare-metal", hint: "installs directly on hardware" },
    { id: "t2", label: "Type 2 · hosted", hint: "runs as an app on a host OS" },
];
const ACCEL_ITEMS = [
    { id: "a_vtx", term: "Intel VT-x / AMD-V", correct: "d1" },
    { id: "a_para", term: "Para-virtualization (virtio)", correct: "d2" },
    { id: "a_emul", term: "Emulation", correct: "d3" },
    { id: "a_pass", term: "PCI / GPU pass-through", correct: "d4" },
];
// Display order is deliberately shuffled (audit R6) — it must not mirror ACCEL_ITEMS order.
const ACCEL_OPTIONS = [
    { id: "d3", text: "Software imitates entirely different hardware — even a foreign CPU architecture" },
    { id: "d1", text: "CPU instructions that let hypervisors run guests near-natively and safely" },
    { id: "d4", text: "A physical device is assigned directly to exactly one guest" },
    { id: "d2", text: "The guest knows the hypervisor and uses enlightened drivers for fast I/O" },
];
// ---------- M4: VM manifest artifact ----------
const VM_MANIFEST = `# SYNTHETIC TRAINING ARTIFACT — Cirrusworks Foundry
# vm-spec.yaml · tenant: pinehill-retail
name: orders-db-01
runtime: virtual-machine          # full enclosure mold
hypervisor: kvm @ forgeline-01    # type 1, bare metal
cpus: 8                           # vCPUs
memory_gb: 32                     # vRAM
interfaces:                       # vNICs
  - name: nic0  vlan: 210  role: app
  - name: nic1  vlan: 215  role: repl
disk:
  image: orders-vol.qcow2         # virtual disk
  size_gb: 512
guest_os: ubuntu-24.04-lts`;
const MANIFEST_FIELDS = [
    { key: "vcpu", label: "vCPU count", answer: "8", choices: ["2", "4", "8", "16"] },
    { key: "ram", label: "vRAM (GB)", answer: "32", choices: ["8", "16", "32", "64"] },
    { key: "nics", label: "vNIC count", answer: "2", choices: ["1", "2", "3", "4"] },
    { key: "disk", label: "Virtual disk format", answer: "qcow2", choices: ["qcow2", "vmdk", "vhd", "iso"] },
];
const TELEMETRY = [
    { host: "FORGELINE-01", ready: 3, balloonGb: 6.1, swapIn: "38 MB/s", vms: 9, note: "calm CPU, memory strain" },
    { host: "FORGELINE-02", ready: 22, balloonGb: 0, swapIn: "0", vms: 7, note: "CPU contention, memory fine" },
];
const TELEMETRY_QS = [
    {
        key: "cpu", label: "Which host shows CPU contention?", answer: "fl02",
        choices: [
            { id: "fl01", text: "FORGELINE-01 (ready 3%)" },
            { id: "fl02", text: "FORGELINE-02 (ready 22%)" },
        ],
    },
    {
        key: "mem", label: "Which host shows memory pressure?", answer: "fl01",
        choices: [
            { id: "fl01", text: "FORGELINE-01 (balloon 6.1 GB, swap-in 38 MB/s)" },
            { id: "fl02", text: "FORGELINE-02 (balloon 0)" },
        ],
    },
    {
        key: "early", label: "Which metric is the earliest overcommitment warning?", answer: "ready",
        choices: [
            { id: "ready", text: "CPU ready time — vCPUs wait for physical cores" },
            { id: "vms", text: "VM count per host" },
            { id: "swap", text: "Disk queue depth" },
        ],
    },
];
const SNAPSHOTS = [
    { vm: "web-front-01", snaps: 1, oldestDays: 2, size: "1.2 GB" },
    { vm: "orders-db-01", snaps: 2, oldestDays: 9, size: "3.8 GB" },
    { vm: "rpt-legacy-03", snaps: 5, oldestDays: 84, size: "22 GB" },
    { vm: "zoe-playground", snaps: 0, oldestDays: 0, size: "—" },
];
const SNAP_VM_CHOICES = [
    { id: "web-front-01", text: "web-front-01" },
    { id: "orders-db-01", text: "orders-db-01" },
    { id: "rpt-legacy-03", text: "rpt-legacy-03" },
    { id: "zoe-playground", text: "zoe-playground" },
];
const SNAP_RISK_CHOICES = [
    { id: "chain", text: "Delta chains keep growing — restores and writes slow down and storage fills" },
    { id: "cpu", text: "Snapshots consume ready time on the physical CPU" },
    { id: "net", text: "Snapshots saturate the host NIC" },
];
// ---------- M9: replica health ----------
const REPLICA_CARD = {
    service: "web-front", desired: 3, current: 2,
    events: [
        "02:41 replica web-front-7g crashed — OOM in guest kernel",
        "02:41 supervisor marked replica unhealthy",
        "02:44 CPU trend: both hosts sustained 72-78% for 40 min",
    ],
};
const REPLICA_QS = [
    {
        key: "heal", label: "What should the orchestrator do about the failed replica?", answer: "replace",
        choices: [
            { id: "replace", text: "Replace it — reconcile to the desired count of 3" },
            { id: "wait", text: "Wait for a human to relaunch it tomorrow" },
            { id: "shrink", text: "Lower the desired count to 2 and accept degradation" },
        ],
    },
    {
        key: "scale", label: "Which scaling approach fits the sustained CPU trend?", answer: "horizontal",
        choices: [
            { id: "horizontal", text: "Horizontal scale-out — add replicas across hosts" },
            { id: "vertical", text: "Vertical scale-up — make one VM much larger" },
            { id: "nothing", text: "No action — 78% is healthy headroom" },
        ],
    },
];
const SEQ_MED = [
    { id: "s_snap", label: "Snapshot orders-db (point-in-time rollback point)" },
    { id: "s_drain", label: "Live-migrate workloads off FORGELINE-01 (drain)" },
    { id: "s_patch", label: "Patch + reboot the FORGELINE-01 hypervisor" },
    { id: "s_verify", label: "Verify all workloads healthy on their new homes" },
    { id: "s_prune", label: "Delete the snapshot — no sprawl left behind" },
];
const SEQ_MED_CORRECT = ["s_snap", "s_drain", "s_patch", "s_verify", "s_prune"];
const ROLE_TRAITS = [
    { id: "r_multi", trait: "Multitenancy — many customers, one platform", enabler: "iso" },
    { id: "r_elastic", trait: "Elasticity — grow and shrink with demand", enabler: "rapid" },
    { id: "r_consol", trait: "Consolidation — retire idle physical servers", enabler: "density" },
    { id: "r_sandbox", trait: "Sandboxing — test risky code safely", enabler: "disposable" },
    { id: "r_meter", trait: "Metered billing — pay for what you use", enabler: "metering" },
];
// Display order deliberately shuffled (audit R6) — must not mirror ROLE_TRAITS/TENANCY_ROWS order.
const ROLE_OPTIONS = [
    { id: "rapid", text: "Rapid provisioning & teardown of virtual resources" },
    { id: "metering", text: "Hypervisor metering of allocated virtual resources" },
    { id: "iso", text: "Isolation boundaries on shared hardware" },
    { id: "disposable", text: "Disposable isolated environments" },
    { id: "pool", text: "One pooled capacity layer the hypervisor allocates from" },
    { id: "density", text: "Multiple guests consolidated per host" },
];
const SURVEY_CASES = [
    {
        id: "case_a", title: "Site A · Regional datacenter",
        body: "400 production VMs, dedicated hardware, 24×7 ops team. Needs live migration, HA clustering and central management.",
    },
    {
        id: "case_b", title: "Site B · Developer laptops",
        body: "Workshop prep on existing macOS/Windows laptops. No dedicated hardware; labs must run side-by-side with daily work.",
    },
    {
        id: "case_c", title: "Site C · Legacy compatibility lab",
        body: "A SPARC-architecture binary must be tested on x86 servers. The code cannot be recompiled.",
    },
];
// Display orders deliberately shuffled (audit R6) — must not align with SURVEY_CASES order.
const SURVEY_TECH = [
    { id: "emul", text: "Emulation of the foreign architecture" },
    { id: "t1", text: "Type 1 bare-metal hypervisor (ESXi / Hyper-V / KVM / Xen)" },
    { id: "para", text: "Para-virtualization with virtio drivers" },
    { id: "t2", text: "Type 2 hosted hypervisor (VirtualBox / Workstation / Fusion)" },
];
const SURVEY_WHY = [
    { id: "w_io", text: "Enlightened drivers boost network I/O" },
    { id: "w_foreign", text: "Only software that imitates a foreign CPU can run the unmodified binary" },
    { id: "w_scale", text: "Bare-metal efficiency, HA and central management at fleet scale" },
    { id: "w_hosted", text: "Runs inside the existing desktop OS — no dedicated hardware" },
];
const SURVEY_ANSWERS = {
    case_a: { tech: "t1", why: "w_scale" },
    case_b: { tech: "t2", why: "w_hosted" },
    case_c: { tech: "emul", why: "w_foreign" },
};
// ---------- H3/H4: night-shift evidence ----------
const NIGHT_METRICS = [
    { host: "FORGELINE-01", ready: "4%", balloon: "0.2 GB", swapIn: "0", top: "web-front (containers)" },
    { host: "FORGELINE-02", ready: "22%", balloon: "5.8 GB", swapIn: "42 MB/s", top: "mktg-batch (12 GB RSS)" },
];
const CHAT_LOG = [
    { id: "c1", time: "01:58", who: "netops", text: "Heads-up: TOR-SW-A port 17 flapped twice around 01:40. Recovered, zero CRC errors since.", herring: true },
    { id: "c2", time: "02:07", who: "dbadmin", text: "orders-db p99 just crossed 800 ms. Reads AND writes. Same host as always — FORGELINE-02.", herring: false },
    { id: "c3", time: "02:12", who: "platform", text: "mktg-batch on FORGELINE-02 grew from its usual 2 GB to 12 GB RSS after the new campaign import.", herring: false },
    { id: "c4", time: "02:19", who: "intern", text: "unrelated?: zoe-playground VM has been powered off for 6 days, should I delete it?", herring: true },
    { id: "c5", time: "02:26", who: "platform", text: "balloon driver on FORGELINE-02 reclaimed 5.8 GB and the host is swapping in 42 MB/s. Classic overcommit squeeze.", herring: false },
    { id: "c6", time: "02:31", who: "netops", text: "Network graphs clean since the flap. Zero packet loss at the host gateways.", herring: false },
];
const NIGHT_ALERTS = [
    "ALERT 02:14 · FORGELINE-02 · balloon > 5 GB sustained",
    "ALERT 02:14 · orders-db · p99 latency 812 ms (threshold 400)",
    "ALERT 01:41 · TOR-SW-A port 17 link flap — auto-recovered",
];
const H3_HOST_CHOICES = [
    { id: "fl01", text: "FORGELINE-01" },
    { id: "fl02", text: "FORGELINE-02" },
];
const H3_CAUSE_CHOICES = [
    { id: "net", text: "Network degradation from the TOR-SW-A port flap" },
    { id: "mem", text: "Memory overcommitment — ballooning + swap-in caused by mktg-batch growth" },
    { id: "stale", text: "The powered-off zoe-playground VM corrupted host memory" },
    { id: "cpu", text: "CPU overcommitment — ready time saturating physical cores" },
];
const H3_LINES = CHAT_LOG.map((l) => l.id);
const H3_CORRECT_LINES = ["c3", "c5"];
// H4 remediation steps
const SEQ_HARD = [
    { id: "r_reserve", label: "Reserve memory for orders-db (protect the victim)" },
    { id: "r_cap", label: "Set a memory limit on mktg-batch (stop the cause)" },
    { id: "r_migrate", label: "Live-migrate web-front replica to FORGELINE-01 (rebalance)" },
    { id: "r_verify", label: "Re-check balloon + ready metrics (verify recovery)" },
];
const SEQ_HARD_CORRECT = ["r_reserve", "r_cap", "r_migrate", "r_verify"];
// ---------- H5: patch runbook ----------
const RUNBOOK_STEPS = [
    { id: "n_notify", label: "Notify tenants of the maintenance window" },
    { id: "n_snap", label: "Snapshot pay-core (rollback point)" },
    { id: "n_drain", label: "Drain FORGELINE-01 via live migration" },
    { id: "n_patch", label: "Patch + reboot the FORGELINE-01 hypervisor" },
    { id: "n_verify", label: "Verify all workloads healthy post-patch" },
    { id: "n_prune", label: "Delete the pay-core snapshot" },
    { id: "n_poweroff", label: "Power off every tenant VM on the floor", trap: true },
    { id: "n_peak", label: "Patch mid-peak, skip notification — faster", trap: true },
];
const RUNBOOK_CORRECT = ["n_notify", "n_snap", "n_drain", "n_patch", "n_verify", "n_prune"];
const AUDIT_ROWS = [
    { id: "az1", workload: "Multi-tenant code-execution service", context: "Customers upload and run arbitrary scripts", correct: "microvm" },
    { id: "az2", workload: "Payment processor (PCI scope)", context: "Stateful, regulated, latency-sensitive", correct: "vm" },
    { id: "az3", workload: "Internal reporting app", context: "In-house code, moderate traffic", correct: "container" },
    { id: "az4", workload: "CI build runners ×40", context: "Disposable, parallel, short-lived jobs", correct: "container" },
    { id: "az5", workload: "Contractor desktops ×12", context: "Unmanaged home devices, central data", correct: "vdi" },
];
const AUDIT_CHOICES = [
    { id: "vm", text: "Virtual Machine (full enclosure)" },
    { id: "container", text: "Container (shared frame)" },
    { id: "microvm", text: "MicroVM (slim shell)" },
    { id: "vdi", text: "VDI pool (deck lease)" },
];
// ---------- H7: scale call ----------
const SCALE_TELEMETRY = [
    "FORGELINE-01 · CPU ready 18% sustained 25 min · balloon 4.0 GB · slot fill 11/12",
    "FORGELINE-02 · CPU ready 21% sustained 25 min · balloon 4.0 GB · slot fill 12/12",
    "web-front queue depth: rising (1.4k → 6.2k in 10 min)",
    "budget note: third host approved for NEXT quarter — not tonight",
];
const SCALE_CHOICES = [
    { id: "vert", text: "Vertically scale-up orders-db to 16 vCPU / 64 GB on FORGELINE-02" },
    { id: "horiz", text: "Horizontally scale-out: add web-front replicas spread across both hosts with anti-affinity" },
    { id: "over", text: "Raise host overcommitment so both hosts accept bigger VMs" },
    { id: "host3", text: "Install a third host tonight and move everything" },
];
const SCALE_WHY = [
    { id: "w_pool", text: "The pool is exhausted on BOTH hosts — add instances across hosts, spread by anti-affinity" },
    { id: "w_big", text: "One bigger VM gets more total CPU for the tier" },
    { id: "w_over", text: "Overcommitment creates room instantly and is always safe" },
];
const SCALE_ANSWERS = { choice: "horiz", why: "w_pool" };
const FAAS_JOBS = [
    { id: "j_thumb", job: "Thumbnail on image upload", detail: "200 ms of work, triggered by an event", fit: "faas" },
    { id: "j_hook", job: "Webhook receiver", detail: "Validate + forward, seconds, per-event", fit: "faas" },
    { id: "j_exec", job: "Untrusted code-execution service", detail: "Customer scripts, hostile inputs", fit: "microvm" },
    { id: "j_etl", job: "Streaming ETL", detail: "Runs 6 hours continuously", fit: "container" },
    { id: "j_batch", job: "Monthly billing batch", detail: "Hours of compute, own OS image", fit: "vm" },
    { id: "j_ledger", job: "Stateful ledger writer", detail: "Owns its database volume", fit: "vm" },
];
const FAAS_CORRECT = ["j_thumb", "j_hook"];
const FAAS_EXILE_CHOICES = [
    { id: "microvm", text: "MicroVM — VM-grade isolation for hostile multi-tenant code" },
    { id: "faas", text: "FaaS — functions are always safe for any code" },
    { id: "container", text: "Container — namespaces are enough for strangers' code" },
];
// ---------- H9: tenancy design ----------
const TENANCY_ROWS = [
    { id: "tn1", trait: "Multitenancy — many customers, one platform", correct: "iso" },
    { id: "tn2", trait: "Resource pooling — aggregate, then allocate", correct: "pool" },
    { id: "tn3", trait: "Elasticity — grow and shrink with demand", correct: "rapid" },
    { id: "tn4", trait: "Sandboxing — risky code, disposable environments", correct: "disposable" },
];
const TENANCY_OPTIONS = ROLE_OPTIONS;
const TENANCY_RISK_CHOICES = [
    { id: "none", text: "No residual risk — perfect isolation makes the floor unbreakable" },
    { id: "patch", text: "The hypervisor remains a high-value target — patch it and restrict who can touch it" },
    { id: "containers", text: "Containers are mathematically unbreakable — trust them blindly" },
    { id: "network", text: "Only network firewalls matter — hypervisors never need patching" },
];
const TF_ITEMS = [
    { id: "tf_kernel", text: "Containers share the host operating system kernel.", answer: true },
    { id: "tf_guestos", text: "Each virtual machine boots its own full guest operating system.", answer: true },
    { id: "tf_iso", text: "Containers isolate workloads more strongly than virtual machines.", answer: false },
    { id: "tf_boot", text: "Virtual machines typically start faster than containers.", answer: false },
];
// ---------- misc copy ----------
const LAB_TITLE = "THE ISOLATION FOUNDRY";
const LAB_SUB = "Cloud+ CV0-004 · Domain 1 · Lesson 1.2 — Virtualization";
const SCENARIO = {
    org: "Cirrusworks Foundry",
    lines: [
        "You are the newly badged platform engineer at Cirrusworks Foundry, a fictional regional cloud provider. On the floor: two host machines — FORGELINE-01 and FORGELINE-02 — each a furnace of pooled CPU, memory and slots, watched over by a Type 1 hypervisor.",
        "Tomorrow morning, six tenant workloads arrive for casting. Your shift has three duties: cast every workload into the isolation mold its trust level deserves, keep the floor healthy while tenants grind against each other for shared capacity, and leave behind clean telemetry, clean snapshots and a clean conscience.",
        "Everything here is synthetic training data — fictional tenants, fabricated metrics. The skills are the real thing: this is the exact territory of CompTIA Cloud+ CV0-004, Domain 1, Lesson 1.2 — virtualization technologies and their role in cloud environments.",
    ],
};
const MODE_CARDS = {
    medium: {
        title: "MEDIUM", tagline: "Apprentice shift — understand & apply",
        bullets: [
            "12 guided work orders, introduced in order",
            "3-tier hints on every order (nudge → direction → demo)",
            "Tolerant checks — retry freely, wrong answers teach",
            "6-question concept quiz with explanations",
        ],
        cta: "Start the apprentice shift",
    },
    hard: {
        title: "HARD", tagline: "Night shift — analyze & decide",
        bullets: [
            "9 broad multi-step work orders built on noisy evidence",
            "2 red herrings planted; distractor steps void sequences",
            "Strict validation — exact values, exact order, near-misses rejected",
            "7 scenario quiz items; one optional nudge that costs stars",
        ],
        cta: "Take the night shift",
    },
};
const NEXT_STEPS = [
    "Lesson 1.3 — Cloud networking: VPNs, VPCs, load balancers, CDNs.",
    "Lesson 1.4 — Containerization: images, registries, persistent volumes in depth.",
    "Lesson 1.5 — Orchestration: scheduling, autoscaling, desired state in depth.",
    "Revisit: CPU ready time vs ballooning — the two contention signatures exam questions love.",
];

  // ---- namespace exports (were ES module exports in the framework build) ----
  F.PILLARS = PILLARS;
  F.OBJECTIVES = OBJECTIVES;
  F.QUIZ = QUIZ;
  F.GLOSSARY = GLOSSARY;
  F.CORE = CORE;
  F.INDUSTRY_EXAMPLES = INDUSTRY_EXAMPLES;
  F.DEBRIEF = DEBRIEF;
  F.RUNTIMES = RUNTIMES;
  F.HOSTS = HOSTS;
  F.INTAKE = INTAKE;
  F.STACK_BINS = STACK_BINS;
  F.STACK_ITEMS = STACK_ITEMS;
  F.HYPERVISOR_ITEMS = HYPERVISOR_ITEMS;
  F.HYPERVISOR_BINS = HYPERVISOR_BINS;
  F.ACCEL_ITEMS = ACCEL_ITEMS;
  F.ACCEL_OPTIONS = ACCEL_OPTIONS;
  F.VM_MANIFEST = VM_MANIFEST;
  F.MANIFEST_FIELDS = MANIFEST_FIELDS;
  F.TELEMETRY = TELEMETRY;
  F.TELEMETRY_QS = TELEMETRY_QS;
  F.SNAPSHOTS = SNAPSHOTS;
  F.SNAP_VM_CHOICES = SNAP_VM_CHOICES;
  F.SNAP_RISK_CHOICES = SNAP_RISK_CHOICES;
  F.REPLICA_CARD = REPLICA_CARD;
  F.REPLICA_QS = REPLICA_QS;
  F.SEQ_MED = SEQ_MED;
  F.SEQ_MED_CORRECT = SEQ_MED_CORRECT;
  F.ROLE_TRAITS = ROLE_TRAITS;
  F.ROLE_OPTIONS = ROLE_OPTIONS;
  F.SURVEY_CASES = SURVEY_CASES;
  F.SURVEY_TECH = SURVEY_TECH;
  F.SURVEY_WHY = SURVEY_WHY;
  F.SURVEY_ANSWERS = SURVEY_ANSWERS;
  F.NIGHT_METRICS = NIGHT_METRICS;
  F.CHAT_LOG = CHAT_LOG;
  F.NIGHT_ALERTS = NIGHT_ALERTS;
  F.H3_HOST_CHOICES = H3_HOST_CHOICES;
  F.H3_CAUSE_CHOICES = H3_CAUSE_CHOICES;
  F.H3_LINES = H3_LINES;
  F.H3_CORRECT_LINES = H3_CORRECT_LINES;
  F.SEQ_HARD = SEQ_HARD;
  F.SEQ_HARD_CORRECT = SEQ_HARD_CORRECT;
  F.RUNBOOK_STEPS = RUNBOOK_STEPS;
  F.RUNBOOK_CORRECT = RUNBOOK_CORRECT;
  F.AUDIT_ROWS = AUDIT_ROWS;
  F.AUDIT_CHOICES = AUDIT_CHOICES;
  F.SCALE_TELEMETRY = SCALE_TELEMETRY;
  F.SCALE_CHOICES = SCALE_CHOICES;
  F.SCALE_WHY = SCALE_WHY;
  F.SCALE_ANSWERS = SCALE_ANSWERS;
  F.FAAS_JOBS = FAAS_JOBS;
  F.FAAS_CORRECT = FAAS_CORRECT;
  F.FAAS_EXILE_CHOICES = FAAS_EXILE_CHOICES;
  F.TENANCY_ROWS = TENANCY_ROWS;
  F.TENANCY_OPTIONS = TENANCY_OPTIONS;
  F.TENANCY_RISK_CHOICES = TENANCY_RISK_CHOICES;
  F.TF_ITEMS = TF_ITEMS;
  F.LAB_TITLE = LAB_TITLE;
  F.LAB_SUB = LAB_SUB;
  F.SCENARIO = SCENARIO;
  F.MODE_CARDS = MODE_CARDS;
  F.NEXT_STEPS = NEXT_STEPS;
})(window.Foundry = window.Foundry || {});
