// ─── Launch Control lab — CHECK RESULTS ENGINE (js/objectives.js) ───────────
// Compiled 1:1 from the original framework lab's validators.ts + objectives.ts.
// Pure functions over the lab state; no DOM access here.

// ─── helpers ────────────────────────────────────────────────────────────────
const EMPTY_CASE = {
    opened: false,
    lines: [],
    category: null,
    detail: {},
    checks: {},
    orders: {},
    actions: [],
    actionPos: {},
};
function norm(s) {
    return (s ?? "").toLowerCase().trim().replace(/\s+/g, " ");
}
function cs(s, caseId) {
    return s.cases[caseId] ?? EMPTY_CASE;
}
function cat(s, caseId) {
    return cs(s, caseId).category ?? "";
}
function det(s, caseId, field) {
    return cs(s, caseId).detail[field] ?? "";
}
function has(s, caseId, actionId) {
    return cs(s, caseId).actions.includes(actionId);
}
function hasNone(s, caseId, ids) {
    return !ids.some((id) => has(s, caseId, id));
}
function lines(s, caseId) {
    return cs(s, caseId).lines;
}
function orderOf(s, caseId, field) {
    return cs(s, caseId).orders[field] ?? [];
}
function runbookSequence(s, caseId) {
    const c = cs(s, caseId);
    return [...c.actions].sort((a, b) => (c.actionPos[a] ?? 99) - (c.actionPos[b] ?? 99));
}
function seqEq(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}
const PORT_OK = /^(\d{3}\s*\/?\s*udp|udp\s*\/?\s*\d{3}|\d{3})$/;
// ─── validators ───────────────────────────────────────────────────────────
const VALIDATORS = {
    // ── P1 ──
    "OBJ-M1": (s) => {
        const ok = seqEq(s.pipelineOrder, ["s1", "s2", "s3", "s4", "s5", "s6"]);
        return {
            pass: ok,
            title: ok ? "Pipeline order correct" : "Pipeline order incomplete",
            feedback: ok
                ? "The six stages are the mental map for every 6.1 question: validate the request, check capacity/quota, orchestrate dependencies, apply image/template artifacts, customize the guest, then validate and hand off. Failures surface in one stage and root-cause in another — the pipeline is how you keep them apart."
                : "Order the stages the way a deployment actually flows: nothing is created until the request is validated; quota is checked before orchestration; images precede guest customization; validation and handoff come last. Use the up/down controls and watch the launch trajectory line.",
        };
    },
    "OBJ-M2": (s) => {
        const truth = {
            sigA: "resource-limits",
            sigB: "incompatibility",
            sigC: "deprecation",
            sigD: "regional",
            sigE: "outage",
        };
        const allSet = ["sigA", "sigB", "sigC", "sigD", "sigE"].every((k) => s.matchPairs[k]);
        const allRight = allSet && ["sigA", "sigB", "sigC", "sigD", "sigE"].every((k) => s.matchPairs[k] === truth[k]);
        return {
            pass: allRight,
            title: allRight ? "All five signatures classified" : "Signature match incomplete",
            feedback: allRight
                ? "These five log signatures are the exam's fastest discriminators. Quota errors name a limit and a number; incompatibility names drivers/kernels; deprecation names retired families or EOL dates; regional availability is a stock-out with quota explicitly fine; outages come with a provider incident ID. Misconfigurations and outdated definitions — the two remaining bullets — are covered by the case work on the shift floor."
                : "Read each signature for its tell: 'quota … exceeded' = resource limits; 'no virtio driver / kernel panic' = incompatibility; 'retired / EOL' = deprecation; 'InsufficientInstanceCapacity' = regional availability; a provider incident ID = outage. Every dropdown offers the seven official 6.1 bullets.",
        };
    },
    // ── P2 ──
    "OBJ-M3": (s) => {
        const lineOk = lines(s, "dep-2201").includes("L6");
        const catOk = cat(s, "dep-2201") === "resource-limits";
        const resOk = det(s, "dep-2201", "resource") === "vcpu";
        const planOk = (has(s, "dep-2201", "release-idle") || has(s, "dep-2201", "quota-increase")) &&
            has(s, "dep-2201", "rerun") &&
            hasNone(s, "dep-2201", ["downsize", "open-sg", "m4-family"]);
        const pass = lineOk && catOk && resOk && planOk;
        return {
            pass,
            title: pass ? "dep-2201 filed correctly" : "dep-2201 needs work",
            feedback: pass
                ? "Quota math is an exam favorite: limit 48, in use 32, request +48 → 80 needed against 48. Quota is an account ceiling — fix it by freeing headroom (that 16 idle vCPU in the sandbox) or requesting an increase, then re-run. Note the distractors: EIP 14/15 is close to its limit but is not the failing resource, and the retired family would trade one 6.1 bullet for another."
                : [
                    lineOk ? "" : "Select the ERROR line with 'QuotaExceeded' in the deployment log (click the line to tag it as evidence).",
                    catOk ? "" : "Category: this is 'Resource limits' — the account ceiling, not an outage or a stock-out.",
                    resOk ? "" : "The constrained resource is vCPU (the error names the vCPU quota), not Elastic IPs — that one is only a near-limit distractor.",
                    planOk ? "" : "Remediation: free idle capacity OR request an increase, plus re-run. Downsizing production, opening 0.0.0.0/0 or switching to a retired family are all wrong.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-M4": (s) => {
        const catOk = cat(s, "dep-2202") === "misconfig-dependency";
        const issueOk = det(s, "dep-2202", "issue") === "zone-vpc";
        const planOk = has(s, "dep-2202", "associate-zone") && has(s, "dep-2202", "rerun-health") && hasNone(s, "dep-2202", ["expose-db", "recreate-db"]);
        const pass = catOk && issueOk && planOk;
        return {
            pass,
            title: pass ? "dep-2202 filed correctly" : "dep-2202 needs work",
            feedback: pass
                ? "The record exists (db → 10.20.4.10) — so the zone is fine, but its association list is empty, which makes the name unresolvable from vpc-app-eu1. This is why ENOTFOUND beats 'database down' as a hypothesis: check resolution before you touch the data tier. And never 'fix' reachability by opening 0.0.0.0/0 — that converts an ops incident into an attack surface."
                : [
                    catOk ? "" : "Category: 'Misconfiguration — dependency' (a DNS dependency, not the app itself).",
                    issueOk ? "" : "Read the DNS config tab and the 21:06:55 event: the A record exists, the VPC association count is zero.",
                    planOk ? "" : "Remediation: associate the zone with vpc-app-eu1 and re-run health checks. Recreating the DB or exposing 5432 to the world are wrong.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-M5": (s) => {
        const lineOk = norm(det(s, "dep-2203", "line")) === "47";
        const valueOk = det(s, "dep-2203", "value") === "ns-standard.xlarge";
        const catOk = cat(s, "dep-2203") === "misconfig-template";
        const pass = lineOk && valueOk && catOk;
        return {
            pass,
            title: pass ? "dep-2203 filed correctly" : "dep-2203 needs work",
            feedback: pass
                ? "The engine told you the line and the mismatch ('template.yaml:47'), the template told you the legal values — IaC failures are the cheapest failures because the pre-flight gate stops them before any resource exists. Line 52's indent drift is a real but non-fatal warning: triage the ERROR, note the WARN."
                : [
                    catOk ? "" : "Category: 'Misconfiguration — template / IaC error'.",
                    lineOk ? "" : "The validation error names template.yaml:47 — not line 52 (that one is a non-fatal indent warning).",
                    valueOk ? "" : "AllowedValues on line 48 lists the legal sizes; ns-standard.xlarge is the intended one (xlrage is the typo).",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-M6": (s) => {
        const cmdOk = /^(sudo\s+)?apt-get\s+install\s+-y\s+nginx$/.test(norm(det(s, "dep-2205", "command")));
        const catOk = cat(s, "dep-2205") === "misconfig-script";
        const planOk = has(s, "dep-2205", "fix-script") && has(s, "dep-2205", "reprovision") && hasNone(s, "dep-2205", ["reboot", "manual-close"]);
        const pass = cmdOk && catOk && planOk;
        return {
            pass,
            title: pass ? "dep-2205 filed correctly" : "dep-2205 needs work",
            feedback: pass
                ? "'E: Invalid operation instal' plus exit code 1 is a textbook post-configuration scripting error. The fix is the corrected command (apt-get install -y nginx), a re-provision from clean state — and ideally an idempotent script so re-runs are safe. Manual installs would work once and then drift from the template."
                : [
                    catOk ? "" : "Category: 'Misconfiguration — post-deployment script'.",
                    cmdOk ? "" : "Type the corrected command: 'apt-get install -y nginx' (a sudo prefix is fine). 'instal' is the typo the cloud-init output is showing you.",
                    planOk ? "" : "Remediation: fix the script, make it idempotent, re-provision from clean state. Rebooting or manual-installing-and-closing leaves the defect in place.",
                ].filter(Boolean).join(" "),
        };
    },
    // ── P3 ──
    "OBJ-M7": (s) => {
        const truth = { ds1: "heartbeat", ds2: "events", ds3: "activation", ds4: "health5xx" };
        const pass = Object.entries(truth).every(([k, v]) => s.dataSources[k] === v);
        return {
            pass,
            title: pass ? "All four signals matched" : "Signal match incomplete",
            feedback: pass
                ? "Detection for deployment issues means picking the source that actually observes the failure mode: agent heartbeats see an invisible fleet, the event stream sees pre-creation failures, activation logs see licensing, and health-check failure metrics see 'SUCCESS but broken'. CPU charts and billing reports rarely contain the signal you need."
                : "Match the failure mode to the observer: an unobservable fleet → agent heartbeat; failure before creation → deployment event stream; grace period → activation logs; SUCCESS-but-503 → health-check failure metrics.",
        };
    },
    "OBJ-M8": (s) => {
        const catOk = cat(s, "dep-2207") === "misconfig-orchestration";
        const causeOk = det(s, "dep-2207", "cause") === "app-before-db";
        const metricOk = det(s, "dep-2207", "metric") === "health-503";
        const thrOk = det(s, "dep-2207", "threshold") === "gt0-5m";
        const pass = catOk && causeOk && metricOk && thrOk;
        return {
            pass,
            title: pass ? "dep-2207 filed correctly" : "dep-2207 needs work",
            feedback: pass
                ? "The events tab shows the race to the half-second: db-init at 21:31:19.8, app instances at 21:31:20.4 — 0.6 s apart, no depends-on rule. The deploy status is SUCCESS, so the only honest detector is the 503 counter with an any-failure-sustained alert. This is the 'silent failure' pattern: status truth ≠ service truth."
                : [
                    catOk ? "" : "Category: 'Misconfiguration — orchestration ordering' (a race condition).",
                    causeOk ? "" : "Compare the two event timestamps: the app started 0.6 s after db-init began — the schema did not exist yet.",
                    metricOk && thrOk ? "" : "Detection: health-check failure (5xx) count, alerting on > 0 sustained 5 minutes. CPU is flat at ~9% — the fleet is idle, not saturated.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-M9": (s) => {
        const catOk = cat(s, "dep-2208") === "misconfig-dependency";
        const causeOk = det(s, "dep-2208", "cause") === "skew";
        const port = norm(det(s, "dep-2208", "port"));
        const portOk = PORT_OK.test(port) && port.includes("123");
        const planOk = has(s, "dep-2208", "allow-ntp") && hasNone(s, "dep-2208", ["replace-cert", "no-tls"]);
        const pass = catOk && causeOk && portOk && planOk;
        return {
            pass,
            title: pass ? "dep-2208 filed correctly" : "dep-2208 needs work",
            feedback: pass
                ? "'Certificate is not yet valid' on a fresh VM is almost never a certificate problem — it is a clock problem. The log confirms +12m47s skew and the SG table shows no UDP/123 egress. Fix the dependency (allow NTP to the internal server, resync) and leave the perfectly valid certificate alone. Disabling TLS verification is never the answer."
                : [
                    catOk ? "" : "Category: 'Misconfiguration — dependency' (time synchronization).",
                    causeOk ? "" : "L5 shows the certificate chain is valid — the 'not yet valid' error is the guest clock lying, not the certificate expiring.",
                    portOk ? "" : "The blocked dependency is NTP: enter it as 123/udp.",
                    planOk ? "" : "Remediation: add the SG egress rule for UDP/123 → 10.20.0.1, resync the clock, re-test. Replacing the cert or disabling verification are wrong.",
                ].filter(Boolean).join(" "),
        };
    },
    // ── P4 ──
    "OBJ-M10": (s) => {
        const catOk = cat(s, "dep-2206") === "misconfig-dependency";
        const fixOk = det(s, "dep-2206", "fix") === "srv-record";
        const planOk = has(s, "dep-2206", "publish-srv") && has(s, "dep-2206", "activate-retry") && hasNone(s, "dep-2206", ["reinstall-os", "key-manual"]);
        const pass = catOk && fixOk && planOk;
        return {
            pass,
            title: pass ? "dep-2206 filed correctly" : "dep-2206 needs work",
            feedback: pass
                ? "0x8007232A is DNS-speak for 'I cannot find my KMS host': the SRV lookup returns NXDOMAIN and the SRV table confirms the record is missing. KMS activation is a licensing *dependency* — publish the record, retry activation, verify. One insight to carry: categories overlap (licensing failed because of DNS), which is exactly why you diagnose from evidence, not from keywords."
                : [
                    catOk ? "" : "Category: 'Misconfiguration — dependency' (licensing depends on a DNS SRV record here).",
                    fixOk ? "" : "The resolver query and the SRV table show _vlmcs._tcp missing — publish it; do not touch the OS.",
                    planOk ? "" : "Remediation: publish the SRV record, run activation retry. Reinstalling or hand-typing keys on four VMs are wrong.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-M11": (s) => {
        const picked = s.prevention;
        const correctPicked = picked.filter((v) => PREVENTION_CORRECT.includes(v));
        const wrongPicked = picked.filter((v) => !PREVENTION_CORRECT.includes(v));
        const pass = correctPicked.length >= 5 && wrongPicked.length === 0;
        return {
            pass,
            title: pass ? "Prevention gate armed" : "Prevention gate incomplete",
            feedback: pass
                ? "Every control you armed maps to a failure you triaged tonight: lint kills template errors pre-apply, quota alerts catch headroom before the wave, the image pipeline verifies agents, pre-flight checks DNS/NTP/KMS, wait conditions end races, and the deprecation watch sees the next EOL coming. The two rejected 'controls' are anti-patterns: 0.0.0.0/0 trades reliability for attack surface, and disabling health gates manufactures silent failures."
                : [
                    correctPicked.length >= 5 ? "" : "Select at least five of the six genuine preventive controls (the ones that stop failures before or during apply).",
                    wrongPicked.length === 0 ? "" : "Two options are traps: opening 0.0.0.0/0 creates exposure, and disabling health checks hides failures instead of preventing them.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-M12": (s) => {
        const planOk = det(s, "dep-2204", "plan") === "blue-green";
        const actionsOk = has(s, "dep-2204", "rebuild-image") && has(s, "dep-2204", "canary-validate") && has(s, "dep-2204", "shift-traffic") && hasNone(s, "dep-2204", ["terminate-all"]);
        const catOk = cat(s, "dep-2204") === "outdated";
        const pass = planOk && actionsOk && catOk;
        return {
            pass,
            title: pass ? "dep-2204 filed correctly" : "dep-2204 needs work",
            feedback: pass
                ? "A stale golden image is an 'outdated definitions' failure: the 2025.11 image predates the agent build step, so every instance it spawns is born invisible (no telemetry, no EDR — a compliance breach, not just an inconvenience). With 8 live instances the answer is fix-forward with a blue-green replace: rebuild the image, prove the agent on a canary, shift traffic, then retire the old fleet. Big-bang termination is a self-inflicted outage."
                : [
                    catOk ? "" : "Category: 'Outdated definitions' — the pinned 2025.11 image is the defect vehicle.",
                    planOk ? "" : "Choose the fix-forward / blue-green plan — the fleet is live and serving.",
                    actionsOk ? "" : "Plan steps: rebuild the image with the agent step, validate a canary's heartbeat, then shift traffic and replace. Terminating everything at once is wrong.",
                ].filter(Boolean).join(" "),
        };
    },
    // ── HARD objectives ──
    "OBJ-H1": (s) => {
        const wrong = SWEEP_ORDER.filter((id) => cat(s, id) !== (CASE_MAP[id]?.truthCategory ?? ""));
        const pass = wrong.length === 0;
        return {
            pass,
            title: pass ? "Sweep board clean — 13/13 classified" : `Sweep board: ${13 - wrong.length}/13 correct`,
            feedback: pass
                ? "A full 13-deployment sweep with two red herrings handled: legacy-cron's 70% disk WARN is informational, and reporting-batch is stopped under approved change CHG-8842 — expected state, no action. You also separated the classic twins: dep-2201 is a quota failure (limit 48) while dep-2210 is a stock-out with quota explicitly OK, and dep-2211 is a provider outage (INC-4471) where the correct move is verify → freeze → retry."
                : `Missed: ${wrong.join(", ")}. Re-read each missed board row's one-line evidence — quota errors name a limit; stock-outs name an AZ; outages name an incident; healthy rows belong to 'No fault'.`,
        };
    },
    "OBJ-H2": (s) => {
        const chainOk = seqEq(orderOf(s, "dep-2202", "chain"), ["chain-zone", "chain-resolve", "chain-wait", "chain-health"]);
        const seq = runbookSequence(s, "dep-2202");
        const seqOk = seqEq(seq, ["associate-zone", "verify-resolve", "rerun-health"]);
        const pass = chainOk && seqOk;
        return {
            pass,
            title: pass ? "dep-2202 chain + sequence exact" : "dep-2202 chain/sequence not exact",
            feedback: pass
                ? "Root cause first: an orphaned zone (no VPC association) makes the name unresolvable, the wait loop exhausts, health checks fail. The remediation order matters operationally: associate → verify resolution from an instance → re-run health checks. Verifying between fix and re-check is what separates an engineer from a button-pusher."
                : [
                    chainOk ? "" : "Chain order must run root cause → symptom: zone association, resolution, wait-loop exhaustion, failed health checks.",
                    seqOk ? "" : "Remediation sequence: associate the zone, THEN verify resolution from an instance, THEN re-run health checks.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-H3": (s) => {
        const lineOk = norm(det(s, "dep-2203", "line")) === "47";
        const valueOk = det(s, "dep-2203", "value") === "ns-standard.xlarge";
        const ctrlOk = det(s, "dep-2203", "control") === "iac-lint";
        const pass = lineOk && valueOk && ctrlOk;
        return {
            pass,
            title: pass ? "dep-2203 exact — line, value, control" : "dep-2203 rejected",
            feedback: pass
                ? "Exact: line 47, ns-standard.xlarge, and an offline lint/validation gate in CI. Widening AllowedValues to 'accept anything' is the near-miss to refuse — it removes the very check that caught the typo, so tomorrow's typo deploys straight into production."
                : [
                    lineOk ? "" : "The fatal line is 47 (the engine's error says template.yaml:47; line 52 is a non-fatal indent warning).",
                    valueOk ? "" : "The value must be one of AllowedValues — ns-standard.xlarge is the intended size.",
                    ctrlOk ? "" : "Only offline template lint/validation catches this before apply. Widening AllowedValues destroys the control.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-H4": (s) => {
        const cmdOk = /^(sudo\s+)?apt-get\s+install\s+-y\s+nginx$/.test(norm(det(s, "dep-2205", "command")));
        const idemOk = det(s, "dep-2205", "idem") === "check-first";
        const linesOk = lines(s, "dep-2205").includes("C4") && lines(s, "dep-2205").includes("C6");
        const pass = cmdOk && idemOk && linesOk;
        return {
            pass,
            title: pass ? "dep-2205 exact — command, exit line, idempotency" : "dep-2205 rejected",
            feedback: pass
                ? "You fixed the exact line (apt-get install -y nginx), tagged both the failing command (C4) and the exit-code line (C6), and demanded idempotency before re-run — because a script that assumes a virgin instance will break the second instance the same way. Infinite retry loops and ignoring exit codes turn one bad line into a flapping fleet."
                : [
                    cmdOk ? "" : "The corrected command is 'apt-get install -y nginx' (sudo prefix tolerated).",
                    linesOk ? "" : "Tag both evidence lines: C4 (the typo) and C6 (the exit-code-1 marker).",
                    idemOk ? "" : "Idempotency means check-before-install and tolerate re-runs — not retry loops, not ignoring exit codes.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-H5": (s) => {
        const causeOk = det(s, "dep-2207", "cause") === "app-before-db";
        const metricOk = det(s, "dep-2207", "metric") === "health-503" && det(s, "dep-2207", "threshold") === "gt0-5m";
        const gateOk = det(s, "dep-2207", "gate") === "health-gate-traffic";
        const seqOk = seqEq(runbookSequence(s, "dep-2207"), ["wait-condition", "retry-backoff", "redeploy"]);
        const pass = causeOk && metricOk && gateOk && seqOk;
        return {
            pass,
            title: pass ? "dep-2207 detection + sequence exact" : "dep-2207 not exact",
            feedback: pass
                ? "Complete answer: the race is app-before-db (0.6 s apart), the detector is the 5xx counter (>0 sustained 5 min) because engine SUCCESS masks the failure, the fix sequence is wait-condition → retry/backoff → redeploy, and the systemic control is gating the traffic shift on passing health checks. 'Trust the SUCCESS status' is precisely the belief this deployment just falsified."
                : [
                    causeOk ? "" : "The two event timestamps prove the app started before db-init completed.",
                    metricOk ? "" : "Detection = health-check failure (5xx) count, > 0 sustained 5 minutes.",
                    gateOk ? "" : "The systemic answer is a health-check gate before traffic shift — SUCCESS alone is not health.",
                    seqOk ? "" : "Sequence: wait/depends-on first, then startup retry with backoff, then redeploy.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-H6": (s) => {
        const causeOk = det(s, "dep-2208", "cause") === "skew";
        const port = norm(det(s, "dep-2208", "port"));
        const portOk = PORT_OK.test(port) && port.includes("123");
        const ruleOk = det(s, "dep-2208", "rule") === "egress-ntp";
        const checks = s.cases["dep-2208"]?.checks["conseq"] ?? [];
        const conseqOk = checks.includes("kerberos") && checks.includes("tasks") && !checks.includes("replace-cert");
        const pass = causeOk && portOk && ruleOk && conseqOk;
        return {
            pass,
            title: pass ? "dep-2208 exact — cause, port, rule, consequences" : "dep-2208 rejected",
            feedback: pass
                ? "Exact work: cause = clock skew (the cert chain is valid, per L5), blocked dependency = 123/udp, rule = scoped egress to the internal NTP server only — not 0.0.0.0/0. Consequences called correctly: Kerberos breaks past ~5 minutes of skew and drift breeds more TLS failures; the certificate does NOT need replacing. Near-miss note: '443/tcp' is the port that works — the missing one is NTP."
                : [
                    causeOk ? "" : "Cause is clock skew — the 'not yet valid' error plus valid chain (L5) proves it.",
                    portOk ? "" : "Enter the blocked port as 123/udp.",
                    ruleOk ? "" : "Scoped egress (UDP/123 → 10.20.0.1) — never allow-all, never disable verification.",
                    conseqOk ? "" : "Consequences: Kerberos breakage and drift-induced TLS failures are real; 'certificate must be replaced' is not.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-H7": (s) => {
        const fixOk = det(s, "dep-2206", "fix") === "srv-record";
        const modelOk = det(s, "dep-2206", "model") === "hybrid";
        const seqOk = ["publish-srv", "activate-retry", "verify-activated"].every((a) => has(s, "dep-2206", a));
        const pass = fixOk && modelOk && seqOk;
        return {
            pass,
            title: pass ? "dep-2206 exact — fix, model, verification" : "dep-2206 rejected",
            feedback: pass
                ? "Fix = publish the KMS SRV record (0x8007232A is a DNS failure), verify activation on all four VMs, and for Wave 4 the licensing model is hybrid: BYOL where inventory is confirmed (2), license-included for the unconfirmed third. BYOL on an unconfirmed license is how projects discover compliance debt mid-launch."
                : [
                    fixOk ? "" : "The fix is the missing _vlmcs._tcp SRV record — not keys, not reinstalls.",
                    seqOk ? "" : "Select the full plan: publish SRV, run activation retry, verify activation state.",
                    modelOk ? "" : "Licensing model: BYOL only where inventory is confirmed; license-included covers the third VM.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-H8": (s) => {
        const fixOk = det(s, "dep-2209", "fix") === "virtio";
        const eolOk = det(s, "dep-2209", "eol") === "guest-os";
        const bootOk = det(s, "dep-2209", "bootmode") === "secure-off-or-sign";
        const seqOk = seqEq(orderOf(s, "dep-2209", "steps"), ["step-matrix", "step-drivers", "step-boot", "step-sandbox", "step-import"]);
        const pass = fixOk && eolOk && bootOk && seqOk;
        return {
            pass,
            title: pass ? "dep-2209 exact — path, EOL, boot mode, sequence" : "dep-2209 rejected",
            feedback: pass
                ? "Full migration answer: virtio drivers are the incompatibility fix; CentOS 6.9 is the deprecated/EOL element (since 2020-11 — flag it for later replatforming); the unsigned legacy kernel means secure boot must be relaxed for this image or the kernel re-signed; and the sequence runs matrix → drivers → boot mode → sandbox test → production import. 'Bigger host' cannot fix a missing driver, and an in-place EOL upgrade mid-wave multiplies risk."
                : [
                    fixOk ? "" : "The remediation is driver injection (virtio) + retest — hardware size is irrelevant to a missing driver.",
                    eolOk ? "" : "The deprecated element is the guest OS: CentOS 6.9, EOL since 2020-11.",
                    bootOk ? "" : "Secure boot must be disabled for this image or the kernel re-signed — forcing it with an unsigned kernel keeps the boot loop.",
                    seqOk ? "" : "Order: matrix → drivers → boot mode → sandbox → production.",
                ].filter(Boolean).join(" "),
        };
    },
    "OBJ-H9": (s) => {
        const pass = BLUEPRINT_CONTROLS.every((c) => s.blueprint[c.id] === c.stage);
        return {
            pass,
            title: pass ? "Wave 4 pre-flight blueprint complete" : "Blueprint incomplete",
            feedback: pass
                ? "The blueprint places every control at the stage where its failure is cheapest to catch: lint at request validation, quota checks at the capacity gate, dependency pre-flight during orchestration, agent verification inside the image pipeline, idempotent scripts at guest customization, and the health-check gate at handoff. That is objective 6.1's final exam skill: not just fixing tonight's wave, but making the next one immune."
                : "Assign each control to the stage whose failure it prevents: linting belongs before creation, quota at the capacity gate, dependency checks in orchestration, agent verification in the image pipeline, idempotency at guest customization, health gating at handoff.",
        };
    },
};
// caseId -> objectiveId per mode (FILE DIAGNOSIS shortcut)
const CASE_OBJECTIVE = {
    medium: {
        "dep-2201": "OBJ-M3",
        "dep-2202": "OBJ-M4",
        "dep-2203": "OBJ-M5",
        "dep-2205": "OBJ-M6",
        "dep-2207": "OBJ-M8",
        "dep-2208": "OBJ-M9",
        "dep-2206": "OBJ-M10",
        "dep-2204": "OBJ-M12",
    },
    hard: {
        "dep-2202": "OBJ-H2",
        "dep-2203": "OBJ-H3",
        "dep-2205": "OBJ-H4",
        "dep-2207": "OBJ-H5",
        "dep-2208": "OBJ-H6",
        "dep-2206": "OBJ-H7",
        "dep-2209": "OBJ-H8",
    },
};
// ─── progress helpers (pure) ────────────────────────────────────────────────
function objectivesForMode(state, mode) {
    return Object.keys(VALIDATORS).filter((id) => (mode === "medium" ? id.startsWith("OBJ-M") : id.startsWith("OBJ-H")));
}
function doneCount(state, mode) {
    return objectivesForMode(state, mode).filter((id) => state.objectives[id]?.done).length;
}
function starRating(state, mode) {
    const ids = objectivesForMode(state, mode);
    const done = ids.filter((id) => state.objectives[id]?.done);
    if (done.length === 0)
        return 0;
    const firstTry = done.filter((id) => state.objectives[id]?.passedFirstTry).length;
    const hints = done.reduce((acc, id) => acc + (state.objectives[id]?.hintsUsed ?? 0), 0);
    const raw = 5 - 0.5 * (done.length - firstTry) - hints / 3;
    return Math.max(1, Math.min(5, Math.round(raw)));
}


const m = (o) => o;
const OBJECTIVES = [
    // ══ MEDIUM — 12 objectives ════════════════════════════════════════════════
    m({
        id: "OBJ-M1",
        mode: "medium",
        pillar: "P1",
        title: "Order the six stages of the provisioning pipeline.",
        context: "Every deployment failure has a stage: it surfaces where the symptom appears and roots where the cause lives. The pipeline order is the map you will use all night.",
        look: "Field manual → Pipeline anatomy (drag-free: tap the stages in order).",
        anchor: "Diagnostic methodology — pipeline anatomy (Lesson 6.1).",
        hints: [
            "Think about what must be true before resources can be created at all.",
            "Validation and quota both happen before any resource exists; images must exist before guests can be customized.",
            "Correct order: 1 Request & validate → 2 Capacity & quota → 3 Orchestration & dependencies → 4 Image & template → 5 Guest customization → 6 Validation & handoff.",
        ],
        focus: { widget: "manual-pipeline" },
        validate: VALIDATORS["OBJ-M1"],
    }),
    m({
        id: "OBJ-M2",
        mode: "medium",
        pillar: "P1",
        title: "Match five failure signatures to their official 6.1 bullet.",
        context: "The exam gives you log lines, not labels. These five signatures cover five of the seven official bullets; the other two (misconfigurations, outdated definitions) dominate the case work.",
        look: "Field manual → Signature matching drill.",
        anchor: "Official sub-bullets: resource limits, incompatibility, deprecation, regional availability, outages.",
        hints: [
            "Each snippet contains a tell: a limit number, a driver name, a retirement date, an AZ name, or an incident ID.",
            "'Exceeded / quota' → resource limits · 'no virtio driver' → incompatibility · 'retired / EOL' → deprecation · 'InsufficientInstanceCapacity' → regional availability · 'INC-' → outages.",
            "Correct mapping: A resource limits · B incompatibility · C deprecation · D regional availability · E outages.",
        ],
        focus: { widget: "manual-match" },
        validate: VALIDATORS["OBJ-M2"],
    }),
    m({
        id: "OBJ-M3",
        mode: "medium",
        pillar: "P2",
        title: "dep-2201: tag the failing line, classify the cause, and build the remediation plan.",
        context: "Twelve frontend instances were requested at 21:04 and nothing was created. Read the deployment log, then file the diagnosis at the triage desk.",
        look: "dep-2201 on the rail → Deployment log (click the ERROR line) + Service limits config.",
        anchor: "6.1 resource limits — quota vs headroom math (limit 48, in use 32, request +48).",
        hints: [
            "The failing resource is named inside the error text — and it is not the one at 14/15.",
            "Headroom = limit − in use = 16 vCPU; the request needs 48. Category: Resource limits.",
            "Plan: free the idle sandbox capacity OR request an increase, then re-run. Never downsize production or open 0.0.0.0/0.",
        ],
        focus: { caseId: "dep-2201", tab: "log" },
        validate: VALIDATORS["OBJ-M3"],
    }),
    m({
        id: "OBJ-M4",
        mode: "medium",
        pillar: "P2",
        title: "dep-2202: find why the database name will not resolve, and fix it without opening the database to the world.",
        context: "All six tracking-api instances are running and all six fail health checks with ENOTFOUND. The DNS config and the 21:06:55 events disagree with the obvious answer.",
        look: "dep-2202 on the rail → Events + Private DNS zone config.",
        anchor: "6.1 misconfigurations — DNS dependency (zone/VPC association).",
        hints: [
            "The A record exists. Ask instead: who is allowed to *see* this private zone?",
            "The event at 21:06:55 says 'zone association: 0 VPCs attached' — the zone is orphaned.",
            "Remediation: associate internal.cobaltfreight.example with vpc-app-eu1, verify resolution, re-run health checks. Never open 5432 to 0.0.0.0/0.",
        ],
        focus: { caseId: "dep-2202", tab: "events" },
        validate: VALIDATORS["OBJ-M4"],
    }),
    m({
        id: "OBJ-M5",
        mode: "medium",
        pillar: "P2",
        title: "dep-2203: locate the fatal template line and correct the parameter.",
        context: "The pre-flight gate rejected this change set before anything was created — the cheapest failure of the night. The engine's error message hands you most of the answer.",
        look: "dep-2203 on the rail → Template tab.",
        anchor: "6.1 misconfigurations — IaC template parameter vs AllowedValues.",
        hints: [
            "The validation error names the file and line. There is also a cosmetic warning — do not confuse the two.",
            "Fatal: template.yaml:47. The indent drift at line 52 is non-fatal.",
            "AllowedValues on line 48 is the truth list: the default must become ns-standard.xlarge.",
        ],
        focus: { caseId: "dep-2203", tab: "template" },
        validate: VALIDATORS["OBJ-M5"],
    }),
    m({
        id: "OBJ-M6",
        mode: "medium",
        pillar: "P2",
        title: "dep-2205: read the cloud-init output, type the corrected command, and choose the remediation.",
        context: "Both batch-etl instances deployed but post-configuration failed. The guest customization output is preserved for you — exit codes are evidence.",
        look: "dep-2205 on the rail → User data tab.",
        anchor: "6.1 misconfigurations — post-deployment scripting errors.",
        hints: [
            "Find the line where apt-get complains. The complaint names the typo verbatim.",
            "The command should read apt-get install -y nginx (a sudo prefix is fine).",
            "Remediation: fix the script, make it idempotent, re-provision from a clean state — not reboot-until-it-works.",
        ],
        focus: { caseId: "dep-2205", tab: "userdata" },
        validate: VALIDATORS["OBJ-M6"],
    }),
    m({
        id: "OBJ-M7",
        mode: "medium",
        pillar: "P3",
        title: "Match four failure modes to the data source that actually observes them.",
        context: "Detection is choosing the right observer. CPU charts and billing reports feel official but often contain no signal at all.",
        look: "Field manual → Detection drill.",
        anchor: "6.1 detection — data sources: agent heartbeat, event stream, activation logs, health-check metrics.",
        hints: [
            "Ask: what would have to emit a signal for this failure to be visible?",
            "Invisible fleet → the observer that lives inside the guest; pre-creation failure → the observer of the deploy engine; grace period → the observer of licensing; SUCCESS-but-503 → the observer of the service contract.",
            "Invisible fleet → agent heartbeat; pre-creation failure → event stream; grace period → activation logs; SUCCESS-but-503 → health-check failure metrics.",
        ],
        focus: { widget: "manual-detect" },
        validate: VALIDATORS["OBJ-M7"],
    }),
    m({
        id: "OBJ-M8",
        mode: "medium",
        pillar: "P3",
        title: "dep-2207: expose the silent failure — classify the race and define its detection.",
        context: "The deploy engine says SUCCESS. The users say 503. When status truth and service truth disagree, only one signal is honest.",
        look: "dep-2207 on the rail → Events (timestamps!) + Metrics.",
        anchor: "6.1 misconfigurations — orchestration race; detection via health-check failure metrics.",
        hints: [
            "Put the two event timestamps side by side — how many seconds apart are db-init and the app start?",
            "0.6 s apart with no depends-on rule: the app started before the schema existed.",
            "Detection: health-check failure (5xx) count > 0 sustained 5 minutes. CPU is flat — the fleet is idle.",
        ],
        focus: { caseId: "dep-2207", tab: "events" },
        validate: VALIDATORS["OBJ-M8"],
    }),
    m({
        id: "OBJ-M9",
        mode: "medium",
        pillar: "P3",
        title: "dep-2208: diagnose the TLS failure that is not a certificate problem.",
        context: "'Certificate is not yet valid' on three brand-new instances. Before you touch certificates, read what the log says about the clock — and what the SG table says about NTP.",
        look: "dep-2208 on the rail → Deployment log (L5!) + Security group config.",
        anchor: "6.1 misconfigurations — time-sync dependency; distinguishing skew from expiry.",
        hints: [
            "L5 shows the certificate chain is valid. So why would a valid certificate be 'not yet valid'?",
            "Clock skew +12m47s, and sg-app-eu1 has no UDP/123 egress rule. The blocked dependency is 123/udp.",
            "Remediation: scoped NTP egress (UDP/123 → 10.20.0.1), resync, re-test. The certificate stays.",
        ],
        focus: { caseId: "dep-2208", tab: "config" },
        validate: VALIDATORS["OBJ-M9"],
    }),
    m({
        id: "OBJ-M10",
        mode: "medium",
        pillar: "P4",
        title: "dep-2206: repair the licensing failure and recognize its hidden dependency.",
        context: "Four Windows ERP nodes are in a 180-day grace period. The activation error code is DNS-speak — let the resolver line and the SRV table tell you what is actually missing.",
        look: "dep-2206 on the rail → Deployment log + SRV records config.",
        anchor: "6.1 misconfigurations — KMS activation dependency (0x8007232A → SRV record).",
        hints: [
            "0x8007232A means 'DNS name does not exist'. Which DNS query failed, and what did it return?",
            "_vlmcs._tcp.corp.cobaltfreight.example SRV → NXDOMAIN, and the SRV table shows the record MISSING.",
            "Publish the SRV record → kms01, run activation retry. Reinstalls and hand-typed keys are wrong.",
        ],
        focus: { caseId: "dep-2206", tab: "config" },
        validate: VALIDATORS["OBJ-M10"],
    }),
    m({
        id: "OBJ-M11",
        mode: "medium",
        pillar: "P4",
        title: "Arm the prevention gate: choose at least five controls that stop tonight's failures from recurring.",
        context: "Every failure you triaged maps to a preventive control. Two of the eight options are anti-patterns that would make things worse — reject them.",
        look: "Field manual → Prevention gate.",
        anchor: "6.1 prevention — IaC lint, quota alerts, image pipeline, pre-flight deps, wait conditions, deprecation watch.",
        hints: [
            "Good controls act before or during apply — not after users notice.",
            "Reject anything that trades reliability for exposure, or that hides failures instead of preventing them.",
            "The six genuine controls: template lint, quota alerts, verified image pipeline, dependency pre-flight, wait conditions + idempotent scripts, deprecation watch.",
        ],
        focus: { widget: "manual-prevent" },
        validate: VALIDATORS["OBJ-M11"],
    }),
    m({
        id: "OBJ-M12",
        mode: "medium",
        pillar: "P4",
        title: "dep-2204: choose the recovery plan for a fleet that is live, serving, and invisible.",
        context: "Eight storefront instances were born from a stale golden image — no telemetry, no EDR. Traffic is flowing; customers are unaffected. Yet.",
        look: "dep-2204 on the rail → Deployment log + Image recipe (user data tab).",
        anchor: "6.1 outdated definitions — stale golden image; rollback vs fix-forward decision.",
        hints: [
            "The image build log shows step 7 was SKIPPED on the 2025.11 tag — the defect is in the artifact, not the instances.",
            "Category: Outdated definitions. The plan must fix the artifact, not just tonight's instances.",
            "Fix forward: rebuild the image, prove agent heartbeat on a canary, blue-green the traffic, retire the old fleet.",
        ],
        focus: { caseId: "dep-2204", tab: "userdata" },
        validate: VALIDATORS["OBJ-M12"],
    }),
    // ══ HARD — 9 objectives ═══════════════════════════════════════════════════
    m({
        id: "OBJ-H1",
        mode: "hard",
        pillar: "P2",
        title: "Sweep the board: classify all 13 deployments — including the ones that need no action.",
        context: "Eleven deployments misbehave; two are noise. The sweep board is the single place to classify everything; one wrong row fails the check.",
        look: "",
        anchor: "All 7 official sub-bullets + red-herring discipline (resource limits, regional availability, outages, healthy states).",
        hints: [
            "One nudge (costs score): quota errors name a limit; stock-outs name an AZ; outages name an incident; healthy and planned states are 'No fault'.",
        ],
        focus: { widget: "sweep-board" },
        validate: VALIDATORS["OBJ-H1"],
    }),
    m({
        id: "OBJ-H2",
        mode: "hard",
        pillar: "P1",
        title: "dep-2202: build the dependency chain root-cause-first, then sequence the remediation exactly.",
        context: "ENOTFOUND is a symptom. Command of this failure means stating the full causal chain and the exact order of the fix.",
        look: "",
        anchor: "6.1 misconfigurations — DNS dependency chain + remediation sequencing.",
        hints: [
            "One nudge (costs score): chain runs root cause → symptom; the remediation has a verify step between fix and re-check.",
        ],
        focus: { caseId: "dep-2202", tab: "events" },
        validate: VALIDATORS["OBJ-H2"],
    }),
    m({
        id: "OBJ-H3",
        mode: "hard",
        pillar: "P2",
        title: "dep-2203: exact line, exact value, and the control that catches it next time.",
        context: "The change set died in pre-flight. Prove you can name the fatal line, the legal value, and the systemic control — and reject the tempting wrong control.",
        look: "",
        anchor: "6.1 misconfigurations — template parameter; offline IaC validation.",
        hints: [
            "One nudge (costs score): the error message names the line; widening AllowedValues is how the next typo reaches production.",
        ],
        focus: { caseId: "dep-2203", tab: "template" },
        validate: VALIDATORS["OBJ-H3"],
    }),
    m({
        id: "OBJ-H4",
        mode: "hard",
        pillar: "P2",
        title: "dep-2205: exact corrected command, both evidence lines tagged, and the idempotency requirement.",
        context: "One typo, one exit code, two instances. The strict answer includes the command as it should appear in the script.",
        look: "",
        anchor: "6.1 misconfigurations — post-deployment scripts; idempotency.",
        hints: [
            "One nudge (costs score): tag C4 and C6; the command is 'apt-get install -y nginx'; idempotent = checks before installing.",
        ],
        focus: { caseId: "dep-2205", tab: "userdata" },
        validate: VALIDATORS["OBJ-H4"],
    }),
    m({
        id: "OBJ-H5",
        mode: "hard",
        pillar: "P3",
        title: "dep-2207: define the detection, sequence the fix, and name the systemic gate.",
        context: "A SUCCESS status masked a broken service for five minutes. Detection, remediation order, and the traffic gate are all part of one answer.",
        look: "",
        anchor: "6.1 misconfigurations — orchestration race; health-check gating; alert tuning.",
        hints: [
            "One nudge (costs score): 5xx counter > 0 sustained 5 min; wait-condition → retry → redeploy; gate the traffic shift on health.",
        ],
        focus: { caseId: "dep-2207", tab: "events" },
        validate: VALIDATORS["OBJ-H5"],
    }),
    m({
        id: "OBJ-H6",
        mode: "hard",
        pillar: "P3",
        title: "dep-2208: exact blocked port, scoped rule change, and the true consequences of leaving it broken.",
        context: "Three checkboxes, one port, one rule. Two of the consequence options are true; one is the misdiagnosis the log already disproved.",
        look: "",
        anchor: "6.1 misconfigurations — NTP dependency; scoped egress; skew consequences.",
        hints: [
            "One nudge (costs score): port is 123/udp; scoped egress to 10.20.0.1 only; Kerberos and drift break — the certificate does not need replacing.",
        ],
        focus: { caseId: "dep-2208", tab: "config" },
        validate: VALIDATORS["OBJ-H6"],
    }),
    m({
        id: "OBJ-H7",
        mode: "hard",
        pillar: "P4",
        title: "dep-2206: the exact fix, full verification plan, and the Wave 4 licensing-model decision.",
        context: "Activation is failing on four VMs, and Wave 4 adds three more — with only two confirmed BYOL licenses. Both decisions are yours.",
        look: "",
        anchor: "6.1 misconfigurations — KMS activation; BYOL vs license-included planning.",
        hints: [
            "One nudge (costs score): publish the SRV record, retry and verify; BYOL only where inventory is confirmed.",
        ],
        focus: { caseId: "dep-2206", tab: "config" },
        validate: VALIDATORS["OBJ-H7"],
    }),
    m({
        id: "OBJ-H8",
        mode: "hard",
        pillar: "P2",
        title: "dep-2209: complete migration answer — fix path, EOL element, boot mode, exact sequence.",
        context: "A legacy P2V import meets a modern platform. Four sub-answers, one order, no partial credit.",
        look: "",
        anchor: "6.1 incompatibility (+ deprecation) — virtio drivers, secure boot, EOL guest OS.",
        hints: [
            "One nudge (costs score): inject virtio; CentOS 6.9 is the EOL element; disable secure boot or re-sign; matrix → drivers → boot → sandbox → import.",
        ],
        focus: { caseId: "dep-2209", tab: "log" },
        validate: VALIDATORS["OBJ-H8"],
    }),
    m({
        id: "OBJ-H9",
        mode: "hard",
        pillar: "P4",
        title: "Blueprint Wave 4: assign each preventive control to its pipeline stage.",
        context: "Six controls, six stages, one job each. A control placed at the wrong stage catches nothing.",
        look: "",
        anchor: "6.1 prevention — stage-by-stage pre-flight blueprint.",
        hints: [
            "One nudge (costs score): each control prevents the failure class of the stage it guards — lint before creation, health gate at handoff.",
        ],
        focus: { widget: "manual-blueprint" },
        validate: VALIDATORS["OBJ-H9"],
    }),
];
const OBJECTIVES_BY_MODE = (mode) => OBJECTIVES.filter((o) => o.mode === mode);


window.LAB_OBJECTIVES = { VALIDATORS, OBJECTIVES, CASE_OBJECTIVE, objectivesForMode, doneCount, starRating };
