/**
 * The Deployment Factory — static port.
 * Machine-transpiled 1:1 from the framework lab source: src/lib/lab/engine.ts
 * Do not edit content here without mirroring the change upstream.
 */
/**
 * The Deployment Factory — engine: initial environment, pipeline simulator,
 * work-order validation, scoring, and localStorage persistence.
 */


const STORAGE_KEY = "cv0004-l53-deployment-factory-v1";
/* ------------------------------------------------------------------ */
/* Initial environment (the broken line you inherit)                   */
/* ------------------------------------------------------------------ */
function initialEnv() {
    return {
        // SOURCE — misconfigured: watching feature/* with push trigger off
        triggerEnabled: false,
        triggerBranch: "feature/*",
        // BUILD — Node 14 runner, floating dependency range
        runnerNode: "14",
        parserPin: "floating",
        // TEST — suites disabled, vault never wired
        unitTests: false,
        integrationTests: false,
        vaultWired: false,
        // SCAN — SAST off, container scan off, two plaintext secrets
        securityScan: false,
        containerScan: false,
        secretDbInYaml: true,
        secretApiInYaml: true,
        vaultRotated: false,
        historyPurged: false,
        // PACKAGE — nothing configured
        registry: null,
        artifactType: null,
        releaseVersion: "",
        versionSigned: false,
        signCheckEnabled: false,
        // RELEASE
        approvalGate: false,
        // PRODUCTION
        strategy: null,
        standbyEnv: false,
        canaryShare: 0,
        monitoringError: false,
        monitoringLatency: false,
        // Quality-gate policy
        gateCoverage: 0,
        gateBlockHigh: false,
        gateProdApproval: false,
        gateSignRequired: false,
        // Runtime
        runCount: 0,
        lastRun: null,
        stagingPassed: false,
        prodPassed: false,
        canaryAborted: false,
        actionLog: [],
    };
}
function objectivesFor(mode) {
    return mode === "medium" ? OBJECTIVES_MEDIUM : OBJECTIVES_HARD;
}
function initialState(mode, phase = "briefing") {
    const objectives = {};
    for (const o of objectivesFor(mode)) {
        objectives[o.id] = { passed: false, attempts: 0, hintsUsed: 0 };
    }
    return {
        phase,
        mode,
        env: initialEnv(),
        objectives,
        formAnswers: {},
        quiz: { answers: {}, locked: {}, current: 0, submitted: false },
        lastFeedback: {},
        completedSeen: false,
        savedAt: Date.now(),
    };
}
/* ------------------------------------------------------------------ */
/* Pipeline simulator — a diagnostic sweep evaluates EVERY station,    */
/* even if upstream fails (trainee diagnostics mode, clearly labeled). */
/* ------------------------------------------------------------------ */
function simulateRun(env) {
    const runNo = env.runCount + 1;
    const stages = {};
    const v = env.releaseVersion.trim();
    const validSemver = /^\d+\.\d+\.\d+$/.test(v);
    // SOURCE
    const sourceOk = env.triggerEnabled && env.triggerBranch === "main";
    stages.source = {
        status: sourceOk ? "passed" : "failed",
        log: sourceOk
            ? [
                `[source] webhook ok — push event on main`,
                `[source] checkout git.nimbuspay.example/nimbuspay/ledger-api @ main`,
            ]
            : env.triggerEnabled
                ? [`[source] trigger armed, but webhook watches '${env.triggerBranch}'`, `[source] FATAL: no push events will ever reach this line from main`]
                : [`[source] push trigger DISABLED`, `[source] FATAL: line can only be started by hand`],
    };
    // BUILD
    const nodeOk = env.runnerNode === "20";
    const pinOk = env.parserPin === "exact";
    const buildOk = nodeOk && pinOk;
    stages.build = {
        status: buildOk ? "passed" : "failed",
        log: buildOk
            ? [
                `[build] runner image nimbus-runner:node20 — matches required runtime`,
                `[build] npm ci — 214 packages, ledger-parser@2.4.1 (exact)`,
                `[build] tsc --strict ok · docker build → image staged`,
            ]
            : [
                ...(nodeOk ? [] : [`[build] FATAL: runtime mismatch — service requires Node >= 20, runner is Node ${env.runnerNode}`]),
                ...(pinOk
                    ? []
                    : [
                        `[build] WARN: ledger-parser range ^2.4.1 resolved to 2.4.7 (published 2 days ago, maintainer unverified)`,
                        `[build] FATAL: unverified transitive change — supply-chain gate blocks the build`,
                    ]),
            ],
    };
    // TEST
    let testOk = env.unitTests && env.integrationTests && env.vaultWired;
    let testLog = [];
    if (!env.unitTests) {
        testLog.push(`[test] unit suite DISABLED in config — 0 tests executed, gate cannot certify`);
    }
    else {
        testLog.push(`[test] unit: 312 passed · coverage 82%`);
    }
    if (!env.integrationTests) {
        testLog.push(`[test] integration suite DISABLED`);
    }
    else if (!env.vaultWired) {
        testLog.push(`[test] FATAL: integration DB auth failed — credential not wired to Vault`);
    }
    else {
        testLog.push(`[test] integration: 14/14 passed against staging DB (vault ref NIMBUS_DB_PASSWORD)`);
    }
    if (env.gateCoverage > 82) {
        testOk = false;
        testLog.push(`[test] FATAL: coverage 82% below quality-gate floor of ${env.gateCoverage}%`);
    }
    stages.test = { status: testOk ? "passed" : "failed", log: testLog };
    // SCAN
    const plaintext = env.secretDbInYaml || env.secretApiInYaml;
    const scanOk = env.securityScan && env.containerScan && !plaintext;
    let scanLog = [];
    if (!env.securityScan)
        scanLog.push(`[scan] SAST/SCA DISABLED — no code or dependency analysis performed`);
    else
        scanLog.push(`[scan] SAST: 0 high · SCA: base image CVE-2024-20355 MEDIUM (within policy)`);
    if (plaintext)
        scanLog.push(`[scan] FATAL: secret detection — ${env.secretDbInYaml ? "NIMBUS_DB_PASSWORD" : ""}${env.secretDbInYaml && env.secretApiInYaml ? " + " : ""}${env.secretApiInYaml ? "NIMBUS_CARD_API_KEY" : ""} in plaintext (nimbus-pipeline.yaml)`);
    if (!env.containerScan)
        scanLog.push(`[scan] FATAL: container image scan skipped — required before packaging`);
    if (scanOk)
        scanLog.push(`[scan] secret scan clean · container layers scanned · policy satisfied`);
    stages.scan = { status: scanOk ? "passed" : "failed", log: scanLog };
    // PACKAGE
    let pkgOk = env.registry !== null && env.artifactType !== null && validSemver;
    let pkgLog = [];
    if (!env.registry || !env.artifactType)
        pkgLog.push(`[package] FATAL: no artifact type / registry destination configured`);
    else if (!validSemver)
        pkgLog.push(`[package] FATAL: release version '${v || "(empty)"}' is not a valid MAJOR.MINOR.PATCH version`);
    if (env.gateSignRequired && pkgOk && !env.versionSigned) {
        pkgOk = false;
        pkgLog.push(`[package] FATAL: quality gate requires signed artifacts — artifact is unsigned`);
    }
    if (pkgOk)
        pkgLog.push(`[package] artifact ${env.artifactType === "container" ? "oci://ledger-api" : "ledger-api"}:v${v} → ${env.registry} registry${env.versionSigned ? " (signed, sha256 verified)" : ""}`);
    stages.package = { status: pkgOk ? "passed" : "failed", log: pkgLog };
    // RELEASE (staging + approval)
    const relOk = env.approvalGate && pkgOk;
    stages.release = {
        status: relOk ? "passed" : "failed",
        log: !pkgOk
            ? [`[release] skipped artifact — upstream packaging failed`]
            : relOk
                ? [`[release] approval gate: sign-off recorded (release engineer)`, `[release] deployed ledger-api:v${v} to STAGING — smoke tests green`]
                : [`[release] FATAL: production promotion blocked — no approval gate configured`],
    };
    // PRODUCTION
    let prodOk = false;
    let prodLog = [];
    if (!relOk) {
        prodLog = [`[production] not reached — staging gate failed`];
    }
    else if (!env.strategy) {
        prodLog = [`[production] FATAL: no deployment strategy configured`];
    }
    else {
        switch (env.strategy) {
            case "bluegreen":
                prodOk = env.standbyEnv;
                prodLog = prodOk
                    ? [`[production] blue-green: green stack verified identical`, `[production] traffic switch ledger-api:v${v} → 100% (atomic)`, `[production] PRODUCTION LIVE — previous version retained for instant rollback`]
                    : [`[production] FATAL: no standby (green) environment provisioned`];
                break;
            case "canary":
                prodOk = env.canaryShare > 0;
                prodLog = prodOk
                    ? [`[production] canary: exposing ledger-api:v${v} to ${env.canaryShare}% of traffic`, `[production] monitoring metrics — awaiting promotion decision`]
                    : [`[production] FATAL: canary share is 0%`];
                break;
            case "rolling":
                prodOk = true;
                prodLog = [`[production] rolling: replaced 6/6 pods in batches`, `[production] PRODUCTION LIVE — mixed versions possible during rollout`];
                break;
            case "inplace":
                prodOk = true;
                prodLog = [`[production] in-place: rebuilt instance on v${v}`, `[production] PRODUCTION LIVE — WARN: downtime window occurred; rollback requires rebuild`];
                break;
        }
    }
    stages.production = { status: prodOk ? "passed" : "failed", log: prodLog };
    const greenCount = STAGE_ORDER.filter((s) => stages[s].status === "passed").length;
    return { runNo, stages, allGreen: greenCount === 7, greenCount };
}
/** Apply a completed run to the environment. */
function applyRun(env, run) {
    return {
        ...env,
        runCount: run.runNo,
        lastRun: run,
        stagingPassed: run.stages.release.status === "passed",
        prodPassed: run.stages.production.status === "passed",
    };
}
/* ------------------------------------------------------------------ */
/* Work-order validation                                               */
/* ------------------------------------------------------------------ */
const CANARY_CORRECT_DECISION = "abort and roll back";
const CANARY_CORRECT_TARGET = "v2.9.2 (last stable)";
function validateObjective(obj, env, answers) {
    switch (obj.id) {
        /* ---------------- Medium ---------------- */
        case "OBJ-M1": {
            const want = ["source", "build", "test", "scan", "package", "release", "production"];
            const got = [1, 2, 3, 4, 5, 6, 7].map((n) => answers[`s${n}`]);
            const ok = want.every((w, i) => got[i] === w);
            return ok
                ? { passed: true, title: "Line laid out correctly", body: obj.feedbackPass }
                : { passed: false, title: "Layout incomplete", body: obj.feedbackFail };
        }
        case "OBJ-M2": {
            const ok = answers.a === "continuous integration" &&
                answers.b === "continuous delivery" &&
                answers.c === "continuous deployment";
            return ok
                ? { passed: true, title: "Three flows matched", body: obj.feedbackPass }
                : { passed: false, title: "Mismatch somewhere", body: obj.feedbackFail };
        }
        case "OBJ-M3": {
            const ok = env.triggerEnabled && env.triggerBranch === "main";
            return { passed: ok, title: ok ? "SOURCE station armed" : "SOURCE still silent", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-M4": {
            const ok = env.runnerNode === "20" && env.parserPin === "exact";
            return { passed: ok, title: ok ? "BUILD station repaired" : "BUILD still failing", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-M5": {
            const ok = env.unitTests && env.integrationTests && env.vaultWired;
            return { passed: ok, title: ok ? "TEST station re-armed" : "TEST station incomplete", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-M6": {
            const ok = !env.secretDbInYaml && !env.secretApiInYaml;
            return { passed: ok, title: ok ? "Scan report clean" : "Secrets still exposed", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-M7": {
            const ok = env.artifactType === "container" && env.registry === "private";
            return { passed: ok, title: ok ? "Artifact route chosen" : "Wrong artifact route", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-M8": {
            const ok = /^\s*3\.0\.0\s*$/.test(env.releaseVersion.trim());
            return { passed: ok, title: ok ? "v3.0.0 recorded" : "Version incorrect", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-M9": {
            const ok = env.strategy === "bluegreen" && env.standbyEnv;
            return { passed: ok, title: ok ? "Blue-green configured" : "Strategy mismatch", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-M10": {
            const ok = answers.decision === CANARY_CORRECT_DECISION && answers.target === CANARY_CORRECT_TARGET;
            return { passed: ok, title: ok ? "REL-118 ruled correctly" : "Verdict rejected", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-M11": {
            const ok = env.monitoringError && env.monitoringLatency;
            return { passed: ok, title: ok ? "Feedback loop wired" : "Loop incomplete", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        /* ---------------- Hard ---------------- */
        case "OBJ-H1": {
            const ok = answers.stage === "build" && answers.cause === "runner runtime mismatch (Node 14 vs required 20)";
            return { passed: ok, title: ok ? "Root cause isolated" : "Triage rejected", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-H2": {
            const log = env.actionLog;
            const idx = (a) => log.indexOf(a);
            // Safety-critical ordering: rotation and extraction must both precede the
            // history purge (purging first re-leaks or preserves a live credential).
            const ordered = idx("rotate-keys") !== -1 &&
                idx("extract-api-secret") !== -1 &&
                idx("purge-history") !== -1 &&
                idx("rotate-keys") < idx("purge-history") &&
                idx("extract-api-secret") < idx("purge-history");
            const stateOk = env.vaultRotated && !env.secretDbInYaml && !env.secretApiInYaml && env.historyPurged;
            const ok = ordered && stateOk;
            return { passed: ok, title: ok ? "Incident sequence correct" : "Sequence incomplete/out of order", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-H3": {
            const ok = env.gateCoverage === 80 &&
                env.gateBlockHigh &&
                env.gateProdApproval &&
                env.gateSignRequired;
            return { passed: ok, title: ok ? "Policy encoded" : "Policy mismatch", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-H4": {
            const ok = answers.a === "canary" && answers.aWhy === "it exposes a small traffic slice with a fast abort" && answers.b === "blue-green" && answers.bWhy === "it switches traffic atomically between two identical stacks";
            return { passed: ok, title: ok ? "Matrix solved" : "Matrix mismatch", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-H5": {
            const ok = answers.decision === CANARY_CORRECT_DECISION && answers.metric === "error rate" && answers.target === CANARY_CORRECT_TARGET;
            return { passed: ok, title: ok ? "Verdict correct" : "Verdict rejected", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-H6": {
            const ok = answers.unsigned === "ledger-api:v3.0.0 (unsigned)" && env.signCheckEnabled;
            return { passed: ok, title: ok ? "Registry audited" : "Audit incomplete", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-H7": {
            const ok = answers.f1 === "true positive" && answers.f2 === "false positive" && answers.f3 === "true positive" && answers.f4 === "false positive";
            return { passed: ok, title: ok ? "Triage correct" : "Triage rejected", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-H8": {
            const ok = !!env.lastRun && env.lastRun.allGreen;
            return { passed: ok, title: ok ? "Full line green" : "Line not green", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        case "OBJ-H9": {
            const log = env.actionLog;
            const idx = (a) => log.indexOf(a);
            const ok = idx("rollback-switch") !== -1 &&
                idx("quarantine-artifact") !== -1 &&
                idx("incident-note") !== -1 &&
                idx("rollback-switch") < idx("quarantine-artifact") &&
                idx("quarantine-artifact") < idx("incident-note");
            return { passed: ok, title: ok ? "Drill passed" : "Drill failed", body: ok ? obj.feedbackPass : obj.feedbackFail };
        }
        default:
            return { passed: false, title: "Unknown work order", body: "No validator for this objective." };
    }
}
function scoreLab(state, questions) {
    const ids = Object.keys(state.objectives);
    const total = ids.length;
    let passed = 0;
    let firstAttempt = 0;
    let hints = 0;
    for (const id of ids) {
        const p = state.objectives[id];
        if (p.passed) {
            passed++;
            if (p.attempts <= 1)
                firstAttempt++;
        }
        hints += p.hintsUsed;
    }
    const quizTotal = questions.length;
    const quizCorrect = questions.reduce((acc, q) => acc + (state.quiz.answers[q.id] === q.correct ? 1 : 0), 0);
    // objective mastery 70% + quiz 30%
    const objScore = total ? (passed / total) * 70 : 0;
    const quizScore = quizTotal ? (quizCorrect / quizTotal) * 30 : 0;
    const score = Math.round(objScore + quizScore);
    const firstRatio = total ? firstAttempt / total : 0;
    let stars = 1;
    const merit = firstRatio * 100 - hints * 3;
    if (merit >= 90)
        stars = 5;
    else if (merit >= 75)
        stars = 4;
    else if (merit >= 55)
        stars = 3;
    else if (merit >= 30)
        stars = 2;
    return { total, passed, firstAttempt, hints, quizTotal, quizCorrect, stars, score };
}
/* ------------------------------------------------------------------ */
/* Quiz accessor                                                       */
/* ------------------------------------------------------------------ */
function quizFor(mode) {
    return mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD;
}
/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */
function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
    }
    catch {
        /* storage unavailable — degrade gracefully, lab still playable */
    }
}
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.env || !parsed.mode)
            return null;
        // Normalize quiz state for sessions saved before the R2 flow upgrade:
        // previously-answered questions count as locked, and progression resumes
        // at the first question without a locked answer.
        if (!parsed.quiz.locked)
            parsed.quiz.locked = {};
        if (typeof parsed.quiz.current !== "number")
            parsed.quiz.current = 0;
        if (parsed.quiz.submitted) {
            for (const id of Object.keys(parsed.quiz.answers))
                parsed.quiz.locked[id] = true;
        }
        else {
            const ids = (parsed.mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM).map((q) => q.id);
            for (const id of Object.keys(parsed.quiz.answers))
                parsed.quiz.locked[id] = true;
            const firstOpen = ids.findIndex((id) => !parsed.quiz.locked[id]);
            parsed.quiz.current = firstOpen === -1 ? ids.length - 1 : firstOpen;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
function clearState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    }
    catch {
        /* ignore */
    }
}
