// THE ISOLATION FOUNDRY — js/objectives.js
// CHECK RESULTS validation engine + objective lookups. Transpiled 1:1 from the
// framework's engine.ts validators — every rule, message and near-miss
// rejection matches the original byte for byte.
(function (F) {
  "use strict";
  var OBJECTIVES = F.OBJECTIVES;
  var QUIZ = F.QUIZ;
  var HOSTS = F.HOSTS;
  var INTAKE = F.INTAKE;
  var RUNTIMES = F.RUNTIMES;
  var STACK_ITEMS = F.STACK_ITEMS;
  var HYPERVISOR_ITEMS = F.HYPERVISOR_ITEMS;
  var ACCEL_ITEMS = F.ACCEL_ITEMS;
  var MANIFEST_FIELDS = F.MANIFEST_FIELDS;
  var TELEMETRY_QS = F.TELEMETRY_QS;
  var REPLICA_QS = F.REPLICA_QS;
  var SEQ_MED_CORRECT = F.SEQ_MED_CORRECT;
  var ROLE_TRAITS = F.ROLE_TRAITS;
  var SURVEY_ANSWERS = F.SURVEY_ANSWERS;
  var SEQ_HARD_CORRECT = F.SEQ_HARD_CORRECT;
  var RUNBOOK_CORRECT = F.RUNBOOK_CORRECT;
  var RUNBOOK_STEPS = F.RUNBOOK_STEPS;
  var AUDIT_ROWS = F.AUDIT_ROWS;
  var SCALE_ANSWERS = F.SCALE_ANSWERS;
  var FAAS_CORRECT = F.FAAS_CORRECT;
  var TENANCY_ROWS = F.TENANCY_ROWS;
  var TENANCY_RISK_CHOICES = F.TENANCY_RISK_CHOICES;

function validate(id, env) {
    const placementsOf = (cardId) => env.placements.filter((p) => p.cardId === cardId);
    switch (id) {
        case "M1": {
            const wrong = STACK_ITEMS.filter((i) => (env.stackSort[i.id] || "") !== i.bin);
            if (wrong.length === 0)
                return { pass: true, msg: "Wall chart calibrated. You can now point at any technology and name its layer — hardware assist lives IN the silicon, hypervisors schedule it, VMs stack on top, containers share the OS. Defenders read this stack top-down when hunting for escape paths." };
            return { pass: false, msg: `${wrong.length} of ${STACK_ITEMS.length} chips are misfiled (e.g., "${wrong[0].text}"). Ask for each: is this silicon, the scheduler, a full guest, or something sharing the host OS?` };
        }
        case "M2": {
            const wrong = HYPERVISOR_ITEMS.filter((i) => (env.hypSort[i.id] || "") !== i.bin);
            if (wrong.length === 0)
                return { pass: true, msg: "All eight classified. Type 1 boots the metal (ESXi, Hyper-V, KVM, Xen) — that is why clouds standardize on them. Type 2 lives inside a host OS (VirtualBox, Workstation, Fusion, Parallels) — perfect for labs, wrong for fleets." };
            return { pass: false, msg: `${wrong.length} product(s) in the wrong type. The test: could this hypervisor boot a server with NO other OS installed? If not, it is Type 2.` };
        }
        case "M3": {
            const wrong = ACCEL_ITEMS.filter((i) => (env.accelMatch[i.id] || "") !== i.correct);
            if (wrong.length === 0)
                return { pass: true, msg: "Four accelerators, four correct stories. VT-x/AMD-V make virtualization fast; para-virtualized guests cooperate; emulation crosses architectures; pass-through trades mobility for raw device speed. Expect at least one of these on exam day." };
            return { pass: false, msg: "One or more terms are matched to the wrong definition. Signature phrases: 'CPU instructions' → VT-x; 'enlightened drivers' → para-virtualization; 'foreign architecture' → emulation; 'physical device to one guest' → pass-through." };
        }
        case "M4": {
            const wrong = MANIFEST_FIELDS.filter((f) => (env.manifest[f.key] || "") !== f.answer);
            if (wrong.length === 0)
                return { pass: true, msg: "Manifest read correctly: 8 vCPUs, 32 GB vRAM, 2 vNICs, qcow2 disk. That is the complete anatomy of a VM — virtual hardware presented by the hypervisor, a guest OS that cannot tell the difference." };
            return { pass: false, msg: `Manifest mismatch on ${wrong.length} field(s). Read the YAML keys — comments are noise, values are evidence.` };
        }
        case "M5": {
            const cards = INTAKE.medium;
            const problems = [];
            for (const c of cards) {
                const ok = placementsOf(c.id).some((p) => p.runtime === c.required);
                if (!ok)
                    problems.push(`${c.name} → ${RUNTIMES[c.required].label}`);
            }
            if (problems.length === 0)
                return { pass: true, msg: "All six tenants cast into fitting molds. Notice the pattern: trust level picks the boundary (VM for untrusted/strict), density picks the shape (containers), event shape picks the stamp (function), endpoint model picks the deck (VDI). That decision tree IS the exam objective." };
            return { pass: false, msg: miss(problems) };
        }
        case "M6": {
            const key = { tf_kernel: true, tf_guestos: true, tf_iso: false, tf_boot: false };
            const wrong = Object.keys(key).filter((k) => env.tf[k] !== key[k]);
            if (wrong.length === 0)
                return { pass: true, msg: "Called correctly: containers share the host kernel and start fast; VMs boot a full guest OS and isolate harder. One shared kernel is the density gain AND the security trade — remember that pairing." };
            return { pass: false, msg: "One or more calls are flipped. Anchor facts: containers = host kernel (no boot), VMs = own kernel (boot + strongest isolation)." };
        }
        case "M7": {
            const wrong = TELEMETRY_QS.filter((q) => (env.telemetryQ[q.key] || "") !== q.answer);
            if (wrong.length === 0)
                return { pass: true, msg: "Diagnosis correct: FORGELINE-02 has the CPU pain (ready 22%), FORGELINE-01 the memory pain (balloon 6.1 GB + swap). Two different resources, two different remedies — and CPU ready time is the earliest tripwire." };
            return { pass: false, msg: "Diagnosis incomplete or swapped. ready% answers 'is CPU oversubscribed?', balloon/swap answer 'is RAM oversubscribed?' — read each host's row separately." };
        }
        case "M8": {
            const vmOk = env.snapVm === "rpt-legacy-03";
            const riskOk = env.snapRisk === "chain";
            if (vmOk && riskOk)
                return { pass: true, msg: "Offender found: rpt-legacy-03 — 5 snapshots, oldest 84 days. Chains of deltas grow on every write: restores crawl, storage fills. Snapshot hygiene: snapshot before a change, prune after it." };
            return { pass: false, msg: !vmOk ? "Look for BOTH a high snapshot count AND an old age — one VM has five deltas stretching back 84 days." : "The risk is about the chain: each snapshot is a growing delta log on top of the disk." };
        }
        case "M9": {
            const wrong = REPLICA_QS.filter((q) => (env.replicaQ[q.key] || "") !== q.answer);
            if (wrong.length === 0)
                return { pass: true, msg: "Correct calls: the orchestrator reconciles to desired state (replace the replica), and a trend that spans BOTH hosts is a pool problem — scale horizontally. Desired-state drift + capacity telemetry = your early-warning radar." };
            return { pass: false, msg: "Rethink the two calls: desired count is a contract (who enforces it?), and a trend visible on both hosts cannot be fixed inside one host." };
        }
        case "M10": {
            const db = placementsOf("w_db").some((p) => p.ops.cpuReserve);
            const batch = placementsOf("w_mktg").some((p) => p.ops.limit);
            const webs = placementsOf("w_web");
            const spreadOk = webs.length >= 2 && new Set(webs.map((p) => p.host)).size >= 2 && webs.every((p) => p.ops.antiAffinity);
            if (db && batch && spreadOk)
                return { pass: true, msg: "Floor governed: the DB is guaranteed CPU, the batch job is capped, and the web replicas are pinned to different hosts. Reservations protect victims, limits stop causes, anti-affinity removes single-host blast radius — the full noisy-neighbor toolkit." };
            const missing = [];
            if (!db)
                missing.push("CPU reservation on orders-db");
            if (!batch)
                missing.push("CPU limit on mktg-batch");
            if (!spreadOk)
                missing.push("anti-affinity on BOTH web replicas, placed on different hosts");
            return { pass: false, msg: `Not yet: ${missing.join(" · ")}. Select a placed chip on the floor to open its ops rail.` };
        }
        case "M11": {
            if (env.seqMed.join("|") === SEQ_MED_CORRECT.join("|"))
                return { pass: true, msg: "Runbook executed in the safe order: protect → drain → patch → verify → prune. This exact shape — snapshot before change, live-migrate the drain, delete snapshots after — is both best practice and a favorite exam scenario." };
            return { pass: false, msg: `Sequence incomplete or out of order (currently ${env.seqMed.length}/5). The snapshot must land before anything risky; the patch before verification; the prune always last.` };
        }
        case "M12": {
            const wrong = ROLE_TRAITS.filter((r) => (env.roleMap[r.id] || "") !== r.enabler);
            if (wrong.length === 0)
                return { pass: true, msg: "Loop closed: every cloud promise reduces to a virtualization capability — isolation enables multitenancy, rapid provisioning enables elasticity, density enables consolidation, disposability enables sandboxing, metering enables billing. Say it in one breath and you own Lesson 1.2." };
            return { pass: false, msg: `${wrong.length} trait(s) unmatched. Work cause→effect: which capability makes each promise physically possible on shared hardware?` };
        }
        case "H1": {
            const problems = [];
            const pay = placementsOf("h_pay")[0];
            if (!pay || pay.runtime !== "vm" || pay.host !== "fl02" || !pay.ops.cpuReserve || !pay.ops.memReserve)
                problems.push("pay-core: VM on FORGELINE-02 with CPU+RAM reserved");
            const fraud = placementsOf("h_fraud")[0];
            if (!fraud || fraud.runtime !== "vm" || fraud.host !== "fl01")
                problems.push("fraud-sandbox: VM on FORGELINE-01");
            const webs = placementsOf("h_web");
            if (webs.length < 2 || !webs.every((p) => p.runtime === "container") || new Set(webs.map((p) => p.host)).size < 2)
                problems.push("web-front: ≥2 containers on DIFFERENT hosts");
            if (!placementsOf("h_api").some((p) => p.runtime === "function"))
                problems.push("receipt-render: function");
            if (!placementsOf("h_eval").some((p) => p.runtime === "microvm"))
                problems.push("policy-eval: microVM");
            if (!placementsOf("h_vdi").some((p) => p.runtime === "vdi"))
                problems.push("auditor-dek: VDI");
            if (problems.length === 0)
                return { pass: true, msg: "RFP satisfied to the letter — exact molds, exact hosts, exact reservations. This is intake engineering: trust level picks the boundary, compliance picks the placement, guarantees pick the controls. Sign-off earned." };
            return { pass: false, msg: `Specification deviations: ${problems.join(" · ")}.` };
        }
        case "H2": {
            const wrong = Object.keys(SURVEY_ANSWERS).filter((c) => !(env.survey[c]?.tech === SURVEY_ANSWERS[c].tech && env.survey[c]?.why === SURVEY_ANSWERS[c].why));
            if (wrong.length === 0)
                return { pass: true, msg: "Site survey signed off: fleet = Type 1 for efficiency and control; laptops = Type 2 because the OS is already there; SPARC binary = emulation, the only software that imitates a foreign CPU. Para-virtualization was the trap — it accelerates I/O, it does not cross architectures." };
            return { pass: false, msg: `${wrong.length} case(s) still wrong. Match the constraint, not the vibe: 'dedicated hardware at scale' → Type 1; 'inside the existing OS' → Type 2; 'different CPU' → emulation.` };
        }
        case "H3": {
            const hostOk = env.triage.host === "fl02";
            const causeOk = env.triage.cause === "mem";
            const linesOk = env.triage.lines.length === 2 && new Set(env.triage.lines).size === 2 && env.triage.lines.every((l) => l === "c3" || l === "c5");
            if (hostOk && causeOk && linesOk)
                return { pass: true, msg: "Incident named: FORGELINE-02, memory overcommitment — mktg-batch grew 2→12 GB, the balloon reclaimed 5.8 GB and swap-in ran at 42 MB/s while orders-db paid the latency bill. The port flap recovered with zero CRC errors and the powered-off VM consumes nothing: textbook red herrings." };
            const bits = [];
            if (!hostOk)
                bits.push("affected host");
            if (!causeOk)
                bits.push("root cause");
            if (!linesOk)
                bits.push("exactly the TWO chat lines that prove the memory story");
            return { pass: false, msg: `Not accepted: ${bits.join(" · ")}. Follow the balloon → swap → tenant-growth chain; ask of every other line: 'did it recover? does it consume anything?'` };
        }
        case "H4": {
            if (env.seqHard.join("|") === SEQ_HARD_CORRECT.join("|"))
                return { pass: true, msg: "Remediation accepted in the only order that works: protect the victim, cap the cause, rebalance, verify. Migrating before capping would have let the next spike hit the DB again — near-miss understood and avoided." };
            return { pass: false, msg: `Rejected (currently ${env.seqHard.length}/4 steps). Why would capping AFTER migrating fail? Because the squeeze returns on the next spike — protect first, then stop the cause.` };
        }
        case "H5": {
            if (env.runbookTrap)
                return { pass: false, msg: "Sequence voided: you pulled a trap step. Powering off every tenant VM turns a patch window into an outage; skipping notification is a compliance breach. Reset the runbook and keep the six clean steps." };
            if (env.runbook.join("|") === RUNBOOK_CORRECT.join("|"))
                return { pass: true, msg: "Runbook clean: notify → snapshot pay-core → drain → patch → verify → prune. Six steps, no outage, no breach, no snapshot litter. That is how professionals touch the highest-value layer on the floor." };
            return { pass: false, msg: `Runbook incomplete or out of order (${env.runbook.length}/6). Notification comes before anything else; the prune is always the last step.` };
        }
        case "H6": {
            const wrong = AUDIT_ROWS.filter((r) => (env.auditIso[r.id] || "") !== r.correct);
            if (wrong.length === 0)
                return { pass: true, msg: "Audit passed: hostile multi-tenant code → microVM; PCI processor → full VM; trusted in-house density → containers; disposable CI runners → containers; unmanaged endpoints → VDI. 'Containerize everything' was the near-miss: one shared kernel is one shared fate." };
            return { pass: false, msg: `${wrong.length} workload(s) mismatched. Rank by trust: strangers' code (microVM) > regulated cores (VM) > trusted in-house (container) > desktops on unmanaged devices (VDI).` };
        }
        case "H7": {
            const ok = env.scaleChoice === SCALE_ANSWERS.choice && env.scaleWhy === SCALE_ANSWERS.why;
            if (ok)
                return { pass: true, msg: "Scale call accepted: horizontal scale-out with anti-affinity. The telemetry killed the alternatives — vertical scale-up has nowhere to take resources from (both hosts saturated, one at 12/12 slots), overcommitment caused the pain, and the third host is next quarter." };
            return { pass: false, msg: env.scaleChoice === "vert" ? "Rejected: a bigger VM needs FREE pooled resources — both hosts are already saturated (ready 18-21%, balloon 4 GB, slots 11-12/12). Where exactly would 16 vCPU come from?" : "Rejected: pick the move the evidence supports AND the reason that shows why the others fail." };
        }
        case "H8": {
            const selOk = env.faasSel.length === FAAS_CORRECT.length && FAAS_CORRECT.every((j) => env.faasSel.includes(j));
            const exileOk = env.faasExile === "microvm";
            if (selOk && exileOk)
                return { pass: true, msg: "Correct: thumbnails and webhooks are short, stateless, event-driven — true FaaS. The untrusted code-execution service goes to a microVM: FaaS runtimes are managed, not yours to harden, and strangers' code wants a VM-grade boundary." };
            const bits = [];
            if (!selOk)
                bits.push("exactly the two genuine function jobs");
            if (!exileOk)
                bits.push("the correct home for the untrusted code-execution service");
            return { pass: false, msg: `Not accepted: ${bits.join(" · ")}. Filter: short? stateless? event-driven? Two jobs pass all three.` };
        }
        case "H9": {
            const wrong = TENANCY_ROWS.filter((r) => (env.tenancy[r.id] || "") !== r.correct);
            const riskOk = env.riskPick === TENANCY_RISK_CHOICES[1].id;
            if (wrong.length === 0 && riskOk)
                return { pass: true, msg: "Design signed: isolation→multitenancy, pooling→allocation, rapid provisioning→elasticity, disposability→sandboxing. And the answer a defender signs: even a perfect design leaves the hypervisor as the high-value target — patch cadence and restricted management access are forever." };
            const bits = [];
            if (wrong.length > 0)
                bits.push(`${wrong.length} enabler mapping(s)`);
            if (!riskOk)
                bits.push("the residual risk a defender would actually sign");
            return { pass: false, msg: `Not accepted: ${bits.join(" · ")}. 'Unbreakable' answers are marketing, not engineering — what layer sits beneath every boundary you drew?` };
        }
        default:
            return { pass: false, msg: "Validator unavailable for this objective." };
    }
}
function objectiveById(id) {
    return OBJECTIVES.find((o) => o.id === id);
}
function objectivesFor(mode) {
    return OBJECTIVES.filter((o) => o.mode === mode);
}

  // Bench-tab label map (was PANEL_LABEL in the work-orders component).
  F.PANEL_LABEL = {
    calibration: "bench › calibration", artifacts: "bench › artifacts", telemetry: "bench › telemetry",
    ops: "bench › floor ops", concepts: "bench › concepts", floor: "foundry floor",
    rfp: "bench › RFP", survey: "bench › site survey", evidence: "bench › night evidence",
    runbook: "bench › runbook", "audit-iso": "bench › isolation audit", scale: "bench › scale call",
    faas: "bench › FaaS fit", tenancy: "bench › tenancy design",
  };
  F.validate = validate;
  F.objectiveById = objectiveById;
  F.objectivesFor = objectivesFor;
})(window.Foundry = window.Foundry || {});
