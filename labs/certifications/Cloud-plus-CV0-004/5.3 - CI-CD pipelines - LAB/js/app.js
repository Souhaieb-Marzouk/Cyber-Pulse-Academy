/**
 * The Deployment Factory — static port.
 * app.js — bootstrap, phase views, lab-floor renderers, station inspector
 * panels, completion modal and all event wiring. Vanilla translation of
 * CicdLab.tsx / ModeSelect.tsx / ControlStrip.tsx / ConveyorLine.tsx /
 * WorkOrdersRail.tsx / Inspector.tsx / Binders.tsx / Completion.tsx.
 */
const App = (() => {
  const PILLARS = ["P1", "P2", "P3", "P4"];
  const STAGE_ICONS = {
    source: "git-branch",
    build: "cog",
    test: "flask-conical",
    scan: "scan-search",
    package: "package",
    release: "clipboard-check",
    production: "rocket",
  };
  const BOOLEAN_ENV_KEYS = new Set([
    "triggerEnabled", "unitTests", "integrationTests", "securityScan", "containerScan",
    "signCheckEnabled", "approvalGate", "standbyEnv", "monitoringError", "monitoringLatency",
    "gateBlockHigh", "gateProdApproval", "gateSignRequired",
  ]);
  const NUMBER_ENV_KEYS = new Set(["canaryShare"]);

  let justMounted = false;
  let inspModal = null;
  let compModal = null;

  const $ = (sel) => document.querySelector(sel);

  /* =====================================================================
     Phase 1 — mode selection (ModeSelect.tsx)
     ===================================================================== */

  function modeSelectView() {
    const dayBullets = [
      "11 guided work orders, one learning bite each, in plant order",
      "Up to 3 tiered hints per order — free to use, they only affect stars",
      "Every check explains WHY and what a defender does next",
      "6-question knowledge check with full explanations",
    ];
    const nightBullets = [
      "9 deep work orders: triage noisy evidence, sequence incident response, decide under constraints",
      "Distractors and red herrings planted in the logs and registry",
      "At most ONE nudge per order, and it costs score",
      "7 scenario questions demanding justification",
    ];
    const modeCard = (kind, title, subtitle, iconHtml, accent, bullets) => `
      <button type="button" class="panel mode-card" data-mode="${kind}" aria-label="Select ${title}">
        <div class="mc-top">
          <span class="mc-icon" style="color:${accent}">${iconHtml}</span>
          <span class="mc-stripe" style="background:repeating-linear-gradient(-45deg, ${accent}88 0 8px, transparent 8px 16px)" aria-hidden="true"></span>
        </div>
        <div>
          <p class="mc-subtitle" style="color:${accent}">${subtitle}</p>
          <h3>${title}</h3>
        </div>
        <ul>${bullets.map((b) => `<li><span aria-hidden="true" style="color:${accent}">▸</span><span>${esc(b)}</span></li>`).join("")}</ul>
        <span class="mc-foot">select shift →</span>
      </button>`;
    return `
    <div class="mode-wrap">
      <main class="mode-main">
        <header class="mode-header">
          <p class="mono kicker-lg">CompTIA Cloud+ CV0-004 · Lesson 5.3 · CI/CD pipelines</p>
          <h1>THE DEPLOYMENT FACTORY <span class="amber">· LINE B</span></h1>
          <p class="mode-sub">A hands-on practice floor for building and managing continuous integration / continuous deployment pipelines. Pick your shift.</p>
        </header>
        <div class="mode-grid">
          ${modeCard("medium", "Day Shift", "guided · understand &amp; learn", icon("sun", "i-9"), "#F5A623", dayBullets)}
          ${modeCard("hard", "Night Shift", "discovery · test &amp; stretch", icon("moon", "i-9"), "#F85149", nightBullets)}
        </div>
        ${trainingNote()}
      </main>
    </div>`;
  }

  /* =====================================================================
     Phase 2 — shift briefing (ModeSelect.tsx Briefing)
     ===================================================================== */

  function briefingView() {
    const hard = LabStore.getMode() === "hard";
    const tiles = [
      { i: "hard-hat", t: "Work orders drive you", d: "11 (day) / 9 (night) objectives pinned to stations" },
      { i: "cog", t: "Configure, then RUN", d: "Fix stations and sweep the line — lamps give instant feedback" },
      { i: "shield-check", t: "Defensive focus", d: "Gates, secrets, scanning, rollback — nothing offensive" },
      { i: "line-chart", t: "Everything saves", d: "Progress persists in your browser; a labeled RESET restores day one" },
    ];
    return `
    <div class="brief-wrap">
      <main class="brief-main">
        <section class="panel brief-panel anim-rise-lg" aria-label="Shift briefing">
          ${hazardHeader(`Shift briefing · ${hard ? "Night" : "Day"} shift`, "clipboard-list")}
          <h1 class="brief-title">You inherit a broken line.</h1>
          <div class="brief-copy">
            <p>
              <strong>NimbusPay</strong> — a fictional payments fintech (synthetic training environment) — runs
              ${gtermInline("ledger-api")} on cloud infrastructure. Its releases flow through an automated
              <strong>CI/CD pipeline</strong>: an assembly line of seven stations that takes every commit from the
              source-control system to production customers.
            </p>
            <p>
              Three days ago, the plant's platform engineer <strong>D. Okafor</strong> resigned mid-refactor and left
              the line in pieces: triggers dead, test suites switched off, plaintext credentials in the pipeline YAML,
              an unpinned dependency, no gates, no strategy. Every release since has gone out by hand.
            </p>
            <p>
              You are <strong>the newly hired platform engineer</strong>.${
                hard
                  ? " The night shift gets no tour: read the evidence, find what matters, and bring the line green — the floor is watching your accuracy, not your speed of asking."
                  : " The day shift walks the floor station by station with work orders, hints and full explanations — the goal is understanding, not hazing."
              }
            </p>
            <p>
              By the end of your shift you will have built, secured, versioned, deployed and rolled back a complete
              pipeline — exactly the skills CompTIA Cloud+ CV0-004 objective&nbsp;5.2 (“Explain concepts related to
              CI/CD pipelines”) tests.
            </p>
          </div>
          <div class="brief-tiles">
            ${tiles
              .map(
                (x) => `
            <div class="brief-tile">
              <p class="bt-title">${icon(x.i, "i-4")} ${x.t}</p>
              <p class="bt-desc">${x.d}</p>
            </div>`
              )
              .join("")}
          </div>
          <div style="margin-top:24px">${trainingNote()}</div>
          <div class="brief-foot">
            <button type="button" class="btn btn-amber" data-clock-in>Clock in →</button>
          </div>
        </section>
      </main>
    </div>`;
  }

  /* =====================================================================
     Lab floor skeleton (CicdLab.tsx LabFloor)
     ===================================================================== */

  function labSkeleton() {
    return `
    <header id="hdr" class="control-strip" role="banner" aria-label="Plant control strip"></header>
    <main class="lab-main anim-rise">
      <section id="conveyor" aria-label="The production line"></section>
      <div class="lab-grid">
        <div class="binder-col"><section id="binder" aria-label="Plant binders"></section></div>
        <div class="rail-col"><div id="rail"></div></div>
      </div>
    </main>
    <div id="modal-insp"></div>
    <div id="modal-comp"></div>`;
  }

  /* =====================================================================
     Control strip (ControlStrip.tsx)
     ===================================================================== */

  function renderHeader() {
    const state = LabStore.getState();
    const env = state.env;
    const objectives = LabStore.getObjectives();
    const passed = objectives.filter((o) => state.objectives[o.id]?.passed).length;
    const total = objectives.length;
    const pct = total ? Math.round((passed / total) * 100) : 0;
    const ui = LabStore.getUi();
    const el = $("#hdr");
    if (!el) return;
    rerenderRegion(el, () => `
    <div class="control-inner">
      <div class="plant-id">
        <span class="plant-glyph">${icon("factory", "i-5")}</span>
        <div>
          <p class="plant-title">The Deployment Factory · Line B</p>
          <p class="plant-mode">${
            state.mode === "hard"
              ? `<span style="color:#F85149;display:inline-flex">${icon("moon", "i-3")}</span> Night shift · discovery`
              : `<span style="color:#F5A623;display:inline-flex">${icon("sun", "i-3")}</span> Day shift · guided`
          }</p>
        </div>
      </div>
      <div class="throughput">
        <div style="flex:1">
          <div class="tp-labels">
            <span>Line throughput (work orders)</span>
            <span class="tp-count">${passed}/${total}</span>
          </div>
          <div class="progress" role="progressbar" aria-label="${pct}% of work orders passed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
            <div style="transform:translateX(-${100 - pct}%)"></div>
          </div>
        </div>
      </div>
      <div class="control-actions">
        <button type="button" class="btn btn-amber btn-h11 btn-sm-mono" style="padding:0 20px" data-run data-fk="run-btn" aria-label="Run diagnostic sweep across all stations" ${ui.running ? "disabled" : ""}>
          ${icon("play", "i-4")} ${ui.running ? "Sweeping…" : "Run the line"}
        </button>
        <button type="button" class="btn btn-outline btn-h11 btn-sm-mono" data-finish data-fk="finish-btn" aria-label="Finish shift and see your score">
          ${icon("flag", "i-4")} Finish
        </button>
        <button type="button" class="btn-icon" data-reset data-fk="reset-btn" aria-label="Reset the lab to pristine state">${icon("rotate-ccw", "i-4")}</button>
      </div>
      <span class="sr-only" aria-live="polite">${passed} of ${total} work orders passed. Run count ${env.runCount}.</span>
    </div>`);
    const runBtn = el.querySelector("[data-run]");
    if (runBtn) runBtn.addEventListener("click", () => LabStore.runLine());
    el.querySelector("[data-finish]").addEventListener("click", () => LabStore.setCompletionOpen(true));
    el.querySelector("[data-reset]").addEventListener("click", openResetDialog);
  }

  /* =====================================================================
     Conveyor + run console (ConveyorLine.tsx)
     ===================================================================== */

  function renderConveyor() {
    const env = LabStore.getEnv();
    const ui = LabStore.getUi();
    const mode = LabStore.getMode();
    const el = $("#conveyor");
    if (!el) return;
    const last = env.lastRun;
    rerenderRegion(el, () => `
    <div class="panel conveyor-panel">
      <div class="conveyor-head">
        <p>Conveyor B · ledger-api release line</p>
        <p>${
          last
            ? `<span style="color:${last.allGreen ? "#3FB950" : "#e6eaf0"}">last sweep #${last.runNo}: ${last.greenCount}/7 green</span>`
            : "no sweep yet"
        }</p>
      </div>
      <div class="bg-dotted conveyor-body">
        <div class="station-row ${justMounted ? "is-mount" : ""}">
          ${STAGE_ORDER.map((s, i) => stationCard(s, i, env, ui)).join("")}
        </div>
      </div>
      <div class="console-block">
        <button type="button" class="console-toggle" data-console-toggle aria-expanded="${ui.consoleOpen}" aria-controls="run-console" data-fk="console-toggle">
          <span>Run console${ui.running ? " · sweeping…" : ""}</span>
          ${ui.consoleOpen ? icon("chevron-up", "i-4") : icon("chevron-down", "i-4")}
        </button>
        ${ui.consoleOpen ? consoleBody(ui, mode) : ""}
      </div>
    </div>`);
    el.querySelector("[data-console-toggle]").addEventListener("click", () => LabStore.setConsoleOpen(!ui.consoleOpen));
    el.querySelectorAll("[data-station]").forEach((b) => b.addEventListener("click", () => LabStore.openStation(b.getAttribute("data-station"))));
  }

  function stationCard(s, i, env, ui) {
    const running = ui.running && ui.liveStage === s;
    const lastRunStages = env.lastRun ? env.lastRun.stages : null;
    const status = running ? "running" : !lastRunStages ? "idle" : lastRunStages[s] ? lastRunStages[s].status : "idle";
    const lampStatus = status === "skipped" ? "idle" : status;
    const iconCls = status === "failed" ? "failed" : status === "passed" ? "passed" : status === "running" ? "running" : "";
    return `
    <div class="station-anim" style="animation-delay:${i * 0.05}s">
      <button type="button" class="station-card ${running ? "is-running" : ""}" data-station="${s}"
        aria-label="Open ${STAGE_LABELS[s]} station inspector — ${STAGE_SUBTITLES[s]}. Status: ${lampStatus}">
        <div class="station-top">${lamp(lampStatus)}<span class="st-no">ST-${i + 1}</span></div>
        <span class="station-icon ${iconCls}">${icon(STAGE_ICONS[s], "i-6")}</span>
        <span class="station-name">${STAGE_LABELS[s]}</span>
        <span class="station-sub">${STAGE_SUBTITLES[s]}</span>
        <span class="station-inspect">${icon("wrench", "i-3")} inspect</span>
      </button>
      <div class="conveyor-seg" aria-hidden="true"><div class="conveyor-belt"></div></div>
    </div>`;
  }

  function consoleBody(ui, mode) {
    const lines = ui.consoleLines;
    return `
    <div id="run-console" role="log" aria-live="polite" aria-label="Pipeline run console" class="console-body factory-scroll" data-ks>
      <div class="machine-text">
        ${
          lines.length === 0
            ? `<p class="console-empty">No sweeps this shift yet. Hit <span class="amber">RUN THE LINE</span> — the sweep evaluates every station even if upstream fails (trainee diagnostics mode), so one pass shows every open fault.</p>`
            : ""
        }
        ${
          mode === "hard"
            ? `<div class="console-pinned">${PINNED_1042.map((l) => `<p class="${l.startsWith("──") ? "console-line sep" : ""}">${esc(l)}</p>`).join("")}</div>`
            : ""
        }
        ${lines
          .map(
            (l) =>
              `<p class="console-line ${l.includes("FATAL") ? "fatal" : ""} ${l.includes("WARN") ? "warn" : ""} ${l.startsWith("──") ? "sep" : ""}">${esc(l)}</p>`
          )
          .join("")}
      </div>
    </div>`;
  }

  /* =====================================================================
     Work orders rail + objective body (WorkOrdersRail.tsx)
     ===================================================================== */

  function objectiveBody(obj, inInspector) {
    const state = LabStore.getState();
    const ui = LabStore.getUi();
    const prog = state.objectives[obj.id] ?? { passed: false, attempts: 0, hintsUsed: 0 };
    const feedback = state.lastFeedback[obj.id];
    const answers = state.formAnswers[obj.id] ?? {};
    const hintOpen = !!ui.hintOpen[obj.id];
    const totalHints = obj.hints.filter(Boolean).length;
    const answerLocked = prog.passed;

    const formHtml = obj.form
      ? `<div class="obj-form">${obj.form
          .map((f) => {
            const span2 = obj.form.length === 1 ? "span2" : "";
            const fk = `ans:${obj.id}:${f.key}`;
            const idAttr = `${obj.id}-${f.key}`;
            if (f.kind === "select") {
              return `<div class="obj-field ${span2}">
                <label for="${idAttr}">${esc(f.label)}</label>
                ${selectControl({
                  value: answers[f.key] ?? "",
                  options: f.options,
                  label: f.label,
                  fkey: fk,
                  placeholder: "choose…",
                  disabled: answerLocked,
                  attrs: `id="${idAttr}"${answerLocked ? ' aria-disabled="true"' : ""}`,
                })}
              </div>`;
            }
            return `<div class="obj-field ${span2}">
              <label for="${idAttr}">${esc(f.label)}</label>
              ${inputControl({
                value: answers[f.key] ?? "",
                label: f.label,
                fkey: fk,
                type: f.kind === "number" ? "number" : "text",
                placeholder: f.placeholder || "",
                attrs: `id="${idAttr}" ${answerLocked ? "disabled" : ""}${answerLocked ? ' aria-disabled="true"' : ""}`,
              })}
            </div>`;
          })
          .join("")}</div>`
      : "";

    let hintsHtml = "";
    if (!prog.passed && totalHints > 0) {
      if (!hintOpen) {
        hintsHtml = `<div><button type="button" class="btn btn-ghost-dim hint-btn" data-fk="hint:${obj.id}" data-hint-open="${obj.id}">
          ${icon("lightbulb", "i-35")} Reveal hint (${totalHints} tier${totalHints > 1 ? "s" : ""}${obj.mode === "hard" ? " · costs score" : ""})
        </button></div>`;
      } else {
        hintsHtml = `<div class="hint-list">${obj.hints
          .slice(0, prog.hintsUsed)
          .map(
            (h, i) =>
              `<p class="hint-item"><span class="hint-tag">hint ${i + 1}/${totalHints}: </span>${esc(h)}${
                i === prog.hintsUsed - 1 && i < totalHints - 1
                  ? `<button type="button" class="hint-next" data-hint-reveal="${obj.id}">next tier →</button>`
                  : ""
              }</p>`
          )
          .join("")}</div>`;
      }
    }

    const actionsHtml = `
      <div class="obj-actions">
        ${
          !prog.passed
            ? `<button type="button" class="btn btn-amber obj-check-btn btn-sm-mono" data-fk="check:${obj.id}" data-check="${obj.id}" aria-label="Check results for ${obj.id}">${icon("list-checks", "i-4")} Check results</button>`
            : `<span class="obj-closed">${icon("check-circle-2", "i-4")} work order closed</span>`
        }
      </div>
      ${
        feedback
          ? `<div class="feedback ${feedback.passed ? "ok" : "fail"}" role="status">
              <p class="fb-title">${feedback.passed ? icon("check-circle-2", "i-35") : icon("x-circle", "i-35")}${esc(feedback.title)}</p>
              <p class="fb-body machine-text">${esc(feedback.body)}</p>
            </div>`
          : ""
      }`;

    return `
    <div class="obj-body">
      <div class="obj-badges">
        <span class="obj-id-chip ${prog.passed ? "ok" : ""}">${obj.id}</span>
        ${pillarBadge(obj.pillar)}
        ${obj.stage !== "core" ? `<span class="badge badge-station">${STAGE_LABELS[obj.stage]} STATION</span>` : ""}
        <span class="obj-attempts">${lamp(prog.passed ? "passed" : "idle", "sm")}${
          prog.passed ? "passed" : `${prog.attempts} attempt${prog.attempts === 1 ? "" : "s"}`
        }</span>
      </div>
      <p class="obj-title">${esc(obj.title)}</p>
      <p class="obj-task">${esc(obj.task)}</p>
      <p class="obj-anchor">covers: ${esc(obj.anchor)}</p>
      ${formHtml}
      ${hintsHtml}
      ${actionsHtml}
    </div>`;
  }

  /** Wire the interactive pieces of any injected objective body. */
  function wireObjectiveBody(scope) {
    scope.querySelectorAll("[data-hint-open]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-hint-open");
        LabStore.toggleHintOpen(id);
        const prog = LabStore.getState().objectives[id];
        if (prog && prog.hintsUsed === 0) LabStore.revealHint(id);
      })
    );
    scope.querySelectorAll("[data-hint-reveal]").forEach((b) =>
      b.addEventListener("click", () => LabStore.revealHint(b.getAttribute("data-hint-reveal")))
    );
    scope.querySelectorAll("[data-check]").forEach((b) =>
      b.addEventListener("click", () => LabStore.checkObjective(b.getAttribute("data-check")))
    );
    // form answers (all objective forms are selects in this lab; input kept for parity)
    scope.querySelectorAll("select[data-fk^='ans:']").forEach((sel) =>
      sel.addEventListener("change", () => {
        const [, objId, key] = sel.getAttribute("data-fk").split(":");
        LabStore.setAnswer(objId, key, sel.value);
      })
    );
    scope.querySelectorAll("input[data-fk^='ans:']").forEach((inp) =>
      inp.addEventListener("input", () => {
        const [, objId, key] = inp.getAttribute("data-fk").split(":");
        LabStore.setAnswer(objId, key, inp.value);
      })
    );
  }

  function woCard(o, ui, state) {
    const prog = state.objectives[o.id] ?? { passed: false, attempts: 0, hintsUsed: 0 };
    const open = !!ui.openOrders[o.id];
    return `
    <div class="wo-card ${prog.passed ? "wo-passed" : ""}">
      <button type="button" class="wo-head" data-fk="wo:${o.id}" data-wo-toggle="${o.id}" aria-expanded="${open}">
        ${lamp(prog.passed ? "passed" : "idle", "sm")}
        <span class="wo-id">${o.id}</span>
        <span class="wo-title">${esc(o.title)}</span>
        ${o.stage !== "core" ? `<span class="wo-stage">${STAGE_LABELS[o.stage]}</span>` : ""}
        <span class="wo-chev ${open ? "open" : ""}">${icon("chevron-down", "i-4")}</span>
      </button>
      ${
        open
          ? `<div class="wo-body">
              ${objectiveBody(o, false)}
              ${
                o.stage !== "core" && !prog.passed
                  ? `<button type="button" class="btn btn-outline-amber btn-h11 btn-sm-mono wo-open-station" data-open-station="${o.stage}">Open ${STAGE_LABELS[o.stage]} station →</button>`
                  : ""
              }
            </div>`
          : ""
      }
    </div>`;
  }

  function renderRail() {
    const state = LabStore.getState();
    const ui = LabStore.getUi();
    const objectives = LabStore.getObjectives();
    const passed = objectives.filter((o) => state.objectives[o.id]?.passed).length;
    const el = $("#rail");
    if (!el) return;
    rerenderRegion(el, () => `
    <aside aria-label="Work orders tracker" class="rail">
      <div class="rail-head">
        <h2>Work orders</h2>
        <span>${passed}/${objectives.length} closed</span>
      </div>
      <div class="rail-list factory-scroll" data-ks>
        ${objectives.map((o) => woCard(o, ui, state)).join("")}
      </div>
    </aside>`);
    const railEl = el.querySelector(".rail-list");
    railEl.querySelectorAll("[data-wo-toggle]").forEach((b) =>
      b.addEventListener("click", () => LabStore.toggleOrder(b.getAttribute("data-wo-toggle")))
    );
    railEl.querySelectorAll("[data-open-station]").forEach((b) =>
      b.addEventListener("click", () => LabStore.openStation(b.getAttribute("data-open-station")))
    );
    wireObjectiveBody(railEl);
  }

  /* =====================================================================
     Binders (Binders.tsx)
     ===================================================================== */

  function binderTab(id, label, iconName, active) {
    return `
    <button type="button" role="tab" aria-selected="${active === id}" class="binder-tab ${active === id ? "active" : ""}" data-binder="${id}">
      ${icon(iconName, "i-4")} ${label}
    </button>`;
  }

  function knowledgeCore() {
    const stations = [
      "SOURCE — code integration: webhook hears a push, checks out the shared branch",
      "BUILD — compiles code, resolves pinned dependencies, produces a runnable output",
      "TEST — unit + integration suites act as the first quality gate",
      "SCAN — SAST/SCA, container scan, secret detection: security as a gate, not a report",
      "PACKAGE — publishes the versioned artifact to a registry (container/VM image, RPM/Debian/ZIP/tar, flat files)",
      "RELEASE — approval gate; deploys to staging (continuous delivery ends here)",
      "PRODUCTION — deployment strategy + monitoring feedback loop",
    ];
    return `
    <div class="panel kb-panel">
      ${hazardHeader("Knowledge core · CI/CD pipelines")}
      <div class="kb-grid">
        <section aria-label="What a pipeline is" class="kb-section">
          <h3>What the line does</h3>
          <div class="kb-copy">
            <p>
              A ${gterm("CI/CD pipeline")} is an automated assembly line that carries every code change from commit to
              customers. The developer's ${gterm("Continuous integration (CI)")} discipline — merging small changes often
              into a shared branch — is what feeds it: each push starts an automated ${gterm("Build")}, which is tested,
              scanned, packaged into a versioned ${gterm("Artifact")} and released.
            </p>
            <p>
              The exam's sharpest edge is the delivery/deployment distinction: <strong>continuous delivery</strong> keeps
              every passing change release-ready but holds a human approval before production; <strong>continuous
              deployment</strong> removes that gate and ships automatically. <strong>Automation</strong> is the thread
              through all of it — no step depends on someone remembering to click.
            </p>
          </div>
        </section>
        <section aria-label="Station map" class="kb-section">
          <h3>The seven stations</h3>
          <ol class="station-list">
            ${stations.map((s, i) => `<li><span class="st-tag">ST-${i + 1}</span><span>${esc(s)}</span></li>`).join("")}
          </ol>
        </section>
        <section aria-label="Artifacts and repositories" class="kb-section">
          <h3>Artifacts &amp; repositories</h3>
          <div class="table-scroll" style="margin-top:8px">
            <table class="kb-table min420">
              <thead><tr><th>type</th><th>example</th><th>note</th></tr></thead>
              <tbody>
                ${ARTIFACT_MATRIX.map(
                  (a) => `<tr><td class="type-cell">${esc(a.type)}</td><td class="example-cell">${esc(a.example)}</td><td>${esc(a.note)}</td></tr>`
                ).join("")}
              </tbody>
            </table>
          </div>
          <p class="kb-after">
            Artifacts live in ${gterm("Artifact registry")}s — <strong>public</strong> (shared, convenient, exposes
            proprietary builds) or <strong>private</strong> (your own access control; the default for regulated
            workloads). Versioning follows ${gterm("Semantic versioning")}: MAJOR = breaking, MINOR = feature, PATCH =
            fix.
          </p>
        </section>
        <section aria-label="Deployment strategies" class="kb-section">
          <h3>Deployment strategies</h3>
          <div class="table-scroll" style="margin-top:8px">
            <table class="kb-table min480">
              <thead><tr><th>strategy</th><th>mechanic</th><th>pick it when…</th></tr></thead>
              <tbody>
                ${STRATEGY_MATRIX.map(
                  (s) => `<tr><td class="type-cell">${esc(s.name)}</td><td>${esc(s.mechanic)}</td><td>${esc(s.pick)}</td></tr>`
                ).join("")}
              </tbody>
            </table>
          </div>
          <p class="kb-after">
            Rollback is only as good as your artifacts: reverting means switching traffic to the <em>previous versioned
            artifact</em> — which is why versioning, signing and a quality gate on ${gterm("Rollback")}-able releases
            matter.
          </p>
        </section>
      </div>
      <section aria-label="Source control foundations" class="kb-wide">
        <h3>Source-control foundations (Objective 5.1)</h3>
        <p>
          The pipeline's raw material is source control: <strong>commit</strong> (snapshot with a message) →
          <strong>push</strong> (send commits to the shared remote) → <strong>branch</strong> (independent line of work) →
          <strong>pull request</strong> (request to merge; where code review happens) → <strong>merge</strong> (combine
          after review + green checks). Version management is what keeps every station downstream reproducible.
        </p>
      </section>
      <section aria-label="Security in the pipeline" class="kb-wide">
        <h3>Security in the pipeline</h3>
        <p>
          Code deployment's security sub-bullet means automated gates inside the line: <strong>SAST/SCA</strong> for code
          and dependencies, container-layer scanning for images, secret detection for leaked credentials — plus signed
          artifacts with checksum verification, a quality gate policy (coverage floors, severity blocks, approval), and
          credentials referenced from a vault instead of plaintext. ${esc(REAL_WORLD_TOOLS)}
        </p>
      </section>
      <section aria-label="Glossary" class="kb-wide">
        ${hazardHeader("Glossary · 15 terms")}
        <dl class="glossary-dl">
          ${GLOSSARY.map(
            (g) => `<div class="g-item"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`
          ).join("")}
        </dl>
      </section>
    </div>`;
  }

  function debrief() {
    return `
    <div class="panel kb-panel">
      ${hazardHeader("Debrief · field notes")}
      <section aria-label="Detection opportunities" class="kb-wide">
        <h3>Detection opportunities</h3>
        <div class="table-scroll" style="margin-top:8px">
          <table class="kb-table" style="min-width:520px">
            <thead><tr><th>signal</th><th>data source</th><th>example detection logic</th></tr></thead>
            <tbody>
              ${DETECTION_ROWS.map(
                (r) => `<tr><td class="type-cell">${esc(r.signal)}</td><td>${esc(r.source)}</td><td class="mono" style="font-size:12.5px">${esc(r.logic)}</td></tr>`
              ).join("")}
            </tbody>
          </table>
        </div>
      </section>
      <div class="kb-grid">
        <section aria-label="Blue team takeaways" class="kb-section">
          <h3>Blue-team takeaways</h3>
          <ul class="debrief-list">
            ${BLUE_TEAM_TAKEAWAYS.map((t) => `<li>${icon("check-circle-2", "i-4 ok")}<span>${esc(t)}</span></li>`).join("")}
          </ul>
        </section>
        <section aria-label="Red team mindset takeaways" class="kb-section">
          <h3>Red-team mindset (know the risk, defend)</h3>
          <ul class="debrief-list">
            ${RED_TEAM_TAKEAWAYS.map((t) => `<li>${icon("x-circle", "i-4 bad")}<span>${esc(t)}</span></li>`).join("")}
          </ul>
        </section>
      </div>
      <section aria-label="Official references" class="kb-wide">
        <h3>Official references (open in a new tab)</h3>
        <ul class="ref-list">
          <li>
            <a href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener noreferrer" class="ref-link">
              ${icon("external-link", "i-35")} CompTIA Cloud+ (CV0-004) — official objectives &amp; skills
            </a>
          </li>
          <li>
            <a href="https://attack.mitre.org/techniques/T1195/001/" target="_blank" rel="noopener noreferrer" class="ref-link">
              ${icon("external-link", "i-35")} MITRE ATT&amp;CK T1195.001 — Compromise Software Dependencies and
              Development Tools (the adversarial counterpart of pipeline security)
            </a>
          </li>
        </ul>
      </section>
      <div style="margin-top:24px">${trainingNote()}</div>
    </div>`;
  }

  function renderBinder() {
    const ui = LabStore.getUi();
    const el = $("#binder");
    if (!el) return;
    rerenderRegion(el, () => `
    <section aria-label="Plant binders">
      <div class="binder-tabs" role="tablist" aria-label="Plant binders">
        ${binderTab("knowledge", "Knowledge Core", "book-open-text", ui.binder)}
        ${binderTab("quiz", "Final Quiz", "file-question", ui.binder)}
        ${binderTab("debrief", "Debrief", "map", ui.binder)}
      </div>
      <div class="binder-panel" role="tabpanel">${
        ui.binder === "knowledge" ? knowledgeCore() : ui.binder === "quiz" ? Quiz.render() : debrief()
      }</div>
    </section>`);
    const panel = el.querySelector(".binder-panel");
    el.querySelectorAll("[data-binder]").forEach((b) => b.addEventListener("click", () => LabStore.setBinder(b.getAttribute("data-binder"))));
    if (ui.binder === "quiz") Quiz.wire(panel);
  }

  /* =====================================================================
     Station inspector (Inspector.tsx)
     ===================================================================== */

  function cfgRow(label, hint, controlHtml) {
    return `
    <div class="cfg-row">
      <div class="cr-info">
        <p class="cr-label">${esc(label)}</p>
        ${hint ? `<p class="cr-hint">${esc(hint)}</p>` : ""}
      </div>
      <div class="cr-ctl">${controlHtml}</div>
    </div>`;
  }

  function linkedOrders(stage) {
    const objectives = LabStore.getObjectives();
    const linked = objectives.filter((o) => o.stage === stage);
    if (linked.length === 0) {
      return `<p class="linked-empty">No work order pinned at this station — this panel is here to complete later orders (the line is a chain: what you configure here is consumed downstream).</p>`;
    }
    return `<div style="display:flex;flex-direction:column;gap:16px">${linked
      .map((o) => `<div class="linked-order">${objectiveBody(o, true)}</div>`)
      .join("")}</div>`;
  }

  function panelSource(env) {
    return `
    <div class="cfg-stack">
      <div class="cfg-card">
        <p class="cc-title">Webhook trigger · git.nimbuspay.example</p>
        <div class="cc-body">
          ${cfgRow("Push trigger", "Start the line automatically on every push event", switchControl(env.triggerEnabled, "Push trigger", "env:triggerEnabled"))}
          ${cfgRow(
            "Watch branch",
            "Which branch's pushes fire the webhook",
            selectControl({ value: env.triggerBranch, options: ["feature/*", "main", "release/*"], label: "Watch branch", fkey: "env:triggerBranch" })
          )}
        </div>
      </div>
      <div class="cfg-card">
        <p class="cc-title">Commit stream · last 5 commits</p>
        <div class="cc-body">
          <div class="machine-text">
            ${COMMITS.map(
              (c) =>
                `<p style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><span style="color:#F5C766">${esc(c.hash)}</span> <span style="color:#7d8795">(${esc(c.branch)})</span> ${esc(c.msg)} <span style="color:#5b6470">— ${esc(c.author)}</span></p>`
            ).join("")}
          </div>
          <p class="cfg-note">Notice which branch the team actually merges to — integration happens where the shared branch lives.</p>
        </div>
      </div>
      ${linkedOrders("source")}
    </div>`;
  }

  function panelBuild(env) {
    const pinnedLine =
      env.parserPin === "exact"
        ? `<span style="color:#3FB950">"2.4.1"  // pinned exact</span>`
        : `<span style="color:#F5C766">"^2.4.1"  // floating range — registry may resolve any 2.x</span>`;
    return `
    <div class="cfg-stack">
      <div class="cfg-card">
        <p class="cc-title">Runner configuration · nimbus-runner</p>
        <div class="cc-body">
          ${cfgRow(
            "Runner runtime image",
            "The Node version the build job executes with",
            selectControl({
              value: env.runnerNode,
              options: [
                { value: "14", label: "node:14 (legacy)" },
                { value: "18", label: "node:18" },
                { value: "20", label: "node:20" },
              ],
              label: "Runner runtime image",
              fkey: "env:runnerNode",
            })
          )}
        </div>
      </div>
      <div class="cfg-card">
        <p class="cc-title">Dependency manifest · package.json (excerpt)</p>
        <div class="cc-body">
          <div class="machine-text">
            <p><span style="color:#c4ccd6">"ledger-parser"</span>: ${pinnedLine}</p>
            <p><span style="color:#c4ccd6">"nimbus-vault-client"</span>: <span style="color:#3FB950">"5.1.0" // pinned exact</span></p>
          </div>
          ${
            env.parserPin === "floating"
              ? `<button type="button" class="btn btn-amber btn-h9 btn-sm-mono" style="padding:0 12px" data-env="parserPin:exact">Pin ledger-parser to exact 2.4.1</button>`
              : `<p class="status-ok-line" style="text-transform:none;font-size:12.5px">${icon("shield-check", "i-4")} Exact version pinned — the registry can no longer substitute code.</p>`
          }
        </div>
      </div>
      ${linkedOrders("build")}
    </div>`;
  }

  function panelTest(env) {
    return `
    <div class="cfg-stack">
      <div class="cfg-card">
        <p class="cc-title">Test suites</p>
        <div class="cc-body">
          ${cfgRow("Unit suite", "Fast, isolated checks on code units — the first quality gate", switchControl(env.unitTests, "Unit suite", "env:unitTests"))}
          ${cfgRow("Integration suite", "Checks ledger-api against a staging database end to end", switchControl(env.integrationTests, "Integration suite", "env:integrationTests"))}
          ${cfgRow(
            "DB credential source",
            env.vaultWired
              ? "Integration tests authenticate via vault reference NIMBUS_DB_PASSWORD"
              : "Currently no working credential — plaintext YAML copy is not wired",
            env.vaultWired
              ? `<span class="status-ok-line">${icon("key-round", "i-4")} wired</span>`
              : `<button type="button" class="btn btn-amber btn-h9 btn-sm-mono" style="padding:0 12px" data-env="vaultWired:true">Wire DB credential via Vault</button>`
          )}
        </div>
      </div>
      <div class="cfg-card">
        <p class="cc-title">Coverage note</p>
        <p class="cfg-prose">
          The unit suite reports <span class="mono" style="color:#F5C766">82%</span> statement coverage. If a coverage
          quality gate is configured at the PRODUCTION station, this number is judged against that floor.
        </p>
      </div>
      ${linkedOrders("test")}
    </div>`;
  }

  function panelScan(env) {
    const findings = SECRET_FINDINGS.map((f) => {
      const exposed = f.secretKey === "secretDb" ? env.secretDbInYaml : env.secretApiInYaml;
      return `
      <div class="finding ${exposed ? "exposed" : ""}">
        <div class="f-head"><span class="badge badge-severity">${esc(f.severity)}</span><span class="f-label">${esc(f.id)} · ${esc(f.label)}</span></div>
        <p class="f-snippet machine-text">${esc(f.snippet)}</p>
        <p class="f-where">${esc(f.where)}</p>
        <p class="f-why">${esc(f.why)}</p>
        ${
          exposed
            ? `<div class="f-action"><button type="button" class="btn btn-amber btn-h8 btn-sm-mono" style="padding:0 10px" data-extract="${f.secretKey}">Extract to Vault</button></div>`
            : `<p class="extracted-line">${icon("lock", "i-35")} extracted — plaintext copy removed from YAML</p>`
        }
      </div>`;
    }).join("");
    return `
    <div class="cfg-stack">
      <div class="cfg-card">
        <p class="cc-title">Scanning policy</p>
        <div class="cc-body">
          ${cfgRow("SAST + dependency analysis (SCA)", "Static analysis of first-party code and third-party dependencies", switchControl(env.securityScan, "SAST and SCA", "env:securityScan"))}
          ${cfgRow("Container image scan", "Scan built image layers for CVEs before packaging", switchControl(env.containerScan, "Container image scan", "env:containerScan"))}
        </div>
      </div>
      <div class="cfg-card ${env.secretDbInYaml || env.secretApiInYaml ? "warn" : ""}">
        <p class="cc-title">${env.secretDbInYaml || env.secretApiInYaml ? `${icon("alert-triangle", "i-35")} ` : ""}Secret detection report</p>
        <div class="cc-body">${findings}</div>
      </div>
      <div class="cfg-card">
        <p class="cc-title">Vault · ${esc(ORG.vault)}</p>
        <div class="cc-body">
          ${cfgRow(
            "Rotate exposed keys",
            "Invalidates any value that ever sat in the YAML or git history",
            env.vaultRotated
              ? `<span class="status-ok-line">rotated ✓</span>`
              : `<button type="button" class="btn btn-outline-amber btn-h8 btn-sm-mono" style="padding:0 10px" data-action="rotate-keys">Rotate keys</button>`
          )}
          ${cfgRow(
            "Purge secrets from git history",
            "Rewrites history so old commits no longer carry the plaintext",
            env.historyPurged
              ? `<span class="status-ok-line">purged ✓</span>`
              : `<button type="button" class="btn btn-outline-amber btn-h8 btn-sm-mono" style="padding:0 10px" data-action="purge-history">Purge history</button>`
          )}
        </div>
      </div>
      ${linkedOrders("scan")}
    </div>`;
  }

  function panelPackage(env) {
    const registryRows = REGISTRY_ITEMS.map(
      (r) => `
      <tr>
        <td class="strong">${esc(r.name)}:${esc(r.version)}</td>
        <td class="${r.signed ? "ok" : "bad"}">${r.signed ? "yes" : "NO"}</td>
        <td>${esc(r.digest)}</td>
        <td>${esc(r.pushed)}</td>
        <td>${esc(r.by)}</td>
      </tr>`
    ).join("");
    return `
    <div class="cfg-stack">
      <div class="cfg-card">
        <p class="cc-title">Artifact configuration</p>
        <div class="cc-body">
          ${cfgRow(
            "Artifact type",
            "What the build station produces for deployment",
            selectControl({
              value: env.artifactType ?? "",
              options: [
                { value: "container", label: "Container image (OCI)" },
                { value: "vm", label: "VM image" },
                { value: "rpm", label: "RPM package" },
                { value: "deb", label: "Debian package" },
                { value: "zip", label: "ZIP bundle" },
                { value: "flat", label: "Flat files" },
              ],
              label: "Artifact type",
              fkey: "env:artifactType",
              placeholder: "choose artifact type…",
            })
          )}
          ${cfgRow(
            "Destination registry",
            "Where versioned artifacts are published and pulled from",
            selectControl({
              value: env.registry ?? "",
              options: [
                { value: "public", label: "Public registry (shared hosting)" },
                { value: "private", label: `Private registry (${ORG.registry})` },
              ],
              label: "Destination registry",
              fkey: "env:registry",
              placeholder: "choose registry…",
            })
          )}
          ${cfgRow(
            "Release version",
            "Semantic version: MAJOR.MINOR.PATCH — must be valid before packaging",
            inputControl({ value: env.releaseVersion, label: "Release version", fkey: "env:releaseVersion", placeholder: "e.g. 2.9.3", cls: "w36" })
          )}
          ${cfgRow(
            "Sign artifact",
            "Attach a cryptographic signature so deploy targets can verify origin",
            env.versionSigned
              ? `<span class="status-ok-line">signed ✓</span>`
              : `<button type="button" class="btn btn-outline-amber btn-h8 btn-sm-mono" style="padding:0 10px" data-env="versionSigned:true">Sign artifact</button>`
          )}
          ${cfgRow(
            "Verify checksums & signatures before promotion",
            "Promotion policy: unsigned artifacts can never be deployed",
            switchControl(env.signCheckEnabled, "Verify checksums and signatures before promotion", "env:signCheckEnabled")
          )}
        </div>
      </div>
      <div class="cfg-card">
        <p class="cc-title">Registry listing · ${esc(ORG.registry)}</p>
        <div class="table-scroll">
          <table class="data-table min480">
            <thead><tr><th>artifact</th><th>signed</th><th>digest</th><th>pushed</th><th>by</th></tr></thead>
            <tbody>${registryRows}</tbody>
          </table>
        </div>
      </div>
      ${linkedOrders("package")}
    </div>`;
  }

  function panelRelease(env) {
    return `
    <div class="cfg-stack">
      <div class="cfg-card">
        <p class="cc-title">Release gate</p>
        <div class="cc-body">
          ${cfgRow("Approval gate", "A human sign-off is recorded before anything leaves staging for production", switchControl(env.approvalGate, "Approval gate", "env:approvalGate"))}
          ${cfgRow(
            "Staging status",
            "Deploy target for the approved artifact — production rehearsal",
            `<span class="status-dim-line" style="color:${env.stagingPassed ? "#3FB950" : "#8b95a3"}">${env.stagingPassed ? "staging: green ✓" : "staging: not deployed"}</span>`
          )}
        </div>
      </div>
      <div class="cfg-card">
        <p class="cc-title">How RELEASE differs from PRODUCTION</p>
        <p class="cfg-prose">
          <span class="hl">Continuous delivery</span> ends here: artifacts are always release-ready, but a person
          approves the final push. <span class="hl">Continuous deployment</span> removes this human gate — the line rolls
          straight on when green. NimbusPay keeps the gate: it is a regulated payments platform.
        </p>
      </div>
      ${linkedOrders("release")}
    </div>`;
  }

  function panelProduction(env) {
    const strategyRows = [];
    if (env.strategy === "bluegreen") {
      strategyRows.push(
        cfgRow("Standby (green) environment", "Provision the duplicate stack required for blue-green", switchControl(env.standbyEnv, "Standby green environment", "env:standbyEnv"))
      );
    }
    if (env.strategy === "canary") {
      strategyRows.push(
        cfgRow(
          "Canary traffic share",
          "Percentage of live customers routed to the new version",
          selectControl({
            value: env.canaryShare ? String(env.canaryShare) : "",
            options: [
              { value: "5", label: "5%" },
              { value: "25", label: "25%" },
              { value: "50", label: "50%" },
            ],
            label: "Canary traffic share",
            fkey: "env:canaryShare",
            placeholder: "choose share…",
          })
        )
      );
    }
    const canaryRows = CANARY_METRICS.map(
      (m) => `
      <tr>
        <td class="strong">${esc(m.metric)}</td>
        <td>${esc(m.baseline)}</td>
        <td class="${m.verdict === "fail" ? "fail-cell" : ""}">${esc(m.canary)}</td>
        <td class="${m.verdict === "fail" ? "fail-cell" : "pass-cell"}">${esc(m.verdict)}</td>
      </tr>`
    ).join("");
    const drillDone = ["rollback-switch", "quarantine-artifact", "incident-note"];
    const drill = env.prodPassed
      ? `
      <div class="cfg-card warn">
        <p class="cc-title">${icon("alert-triangle", "i-35")} Live incident drill (labeled training scenario)</p>
        <div class="cc-body">
          <p class="cfg-prose">${esc(ROLLBACK_SCENARIO)}</p>
          <div class="drill-grid">
            ${[
              { key: "rollback-switch", label: "1 · Switch traffic to previous stable" },
              { key: "quarantine-artifact", label: "2 · Quarantine bad artifact" },
              { key: "incident-note", label: "3 · File incident note" },
            ]
              .map((a) => {
                const done = env.actionLog.includes(a.key);
                return `<button type="button" class="btn drill-btn ${done ? "done" : "pending"}" ${done ? "disabled" : ""} data-drill="${a.key}">${done ? "✓ " : ""}${esc(a.label)}</button>`;
              })
              .join("")}
          </div>
          <p class="drill-order">order recorded: ${esc(env.actionLog.filter((a) => drillDone.includes(a)).join(" → ") || "—")}</p>
        </div>
      </div>`
      : "";
    return `
    <div class="cfg-stack">
      <div class="cfg-card">
        <p class="cc-title">Deployment strategy</p>
        <div class="cc-body">
          ${cfgRow(
            "Strategy",
            "How the new version reaches customers",
            selectControl({
              value: env.strategy ?? "",
              options: [
                { value: "bluegreen", label: "Blue-green (atomic switch)" },
                { value: "canary", label: "Canary (gradual exposure)" },
                { value: "rolling", label: "Rolling (batch replacement)" },
                { value: "inplace", label: "In-place (rebuild instance)" },
              ],
              label: "Deployment strategy",
              fkey: "env:strategy",
              placeholder: "choose strategy…",
            })
          )}
          ${strategyRows.join("")}
        </div>
      </div>
      <div class="cfg-card">
        <p class="cc-title">Feedback loop · monitoring</p>
        <div class="cc-body">
          ${cfgRow("Error-rate alert", "5xx + failed transactions, wired back into the pipeline", switchControl(env.monitoringError, "Error rate alert", "env:monitoringError"))}
          ${cfgRow("p95 latency alert", "Tail latency against baseline, wired back into the pipeline", switchControl(env.monitoringLatency, "p95 latency alert", "env:monitoringLatency"))}
        </div>
      </div>
      <div class="cfg-card">
        <p class="cc-title">Quality-gate policy editor (security baseline)</p>
        <div class="cc-body">
          ${cfgRow(
            "Minimum test coverage (%)",
            "0 disables the coverage gate",
            inputControl({ value: env.gateCoverage || "", label: "Minimum test coverage percent", fkey: "env:gateCoverage", type: "number", cls: "w24", attrs: 'min="0" max="100"' })
          )}
          ${cfgRow("Block release on high/critical vulnerabilities", "", switchControl(env.gateBlockHigh, "Block on high or critical vulnerabilities", "env:gateBlockHigh"))}
          ${cfgRow("Require human approval for production", "", switchControl(env.gateProdApproval, "Require human approval for production", "env:gateProdApproval"))}
          ${cfgRow("Signed artifacts only", "", switchControl(env.gateSignRequired, "Signed artifacts only", "env:gateSignRequired"))}
        </div>
      </div>
      <div class="cfg-card">
        <p class="cc-title">Canary case file REL-118</p>
        <div class="cc-body">
          <p class="cfg-prose">${esc(CANARY_CONTEXT)}</p>
          <div class="table-scroll">
            <table class="data-table min420">
              <thead><tr><th>metric</th><th>baseline</th><th>canary</th><th>verdict</th></tr></thead>
              <tbody>${canaryRows}</tbody>
            </table>
          </div>
        </div>
      </div>
      ${drill}
      ${linkedOrders("production")}
    </div>`;
  }

  function buildInspectorContent(stage) {
    const env = LabStore.getEnv();
    const ui = LabStore.getUi();
    const running = ui.running;
    const status = env.lastRun && env.lastRun.stages[stage] ? env.lastRun.stages[stage].status : "idle";
    const lampStatus = running ? "running" : status === "skipped" ? "idle" : status;
    const panel =
      stage === "source"
        ? panelSource(env)
        : stage === "build"
          ? panelBuild(env)
          : stage === "test"
            ? panelTest(env)
            : stage === "scan"
              ? panelScan(env)
              : stage === "package"
                ? panelPackage(env)
                : stage === "release"
                  ? panelRelease(env)
                  : panelProduction(env);
    return `
    <div class="modal-head">
      <h2 class="modal-title" id="insp-title">${lamp(lampStatus)} ${STAGE_LABELS[stage]} station</h2>
      <p class="modal-desc" id="insp-desc">${STAGE_SUBTITLES[stage]} · configure the machine, read its evidence, close the pinned work orders.</p>
    </div>
    <div style="margin-top:4px">${panel}</div>
    <div style="margin-top:8px">${hazardHeader("End of station")}</div>
    <div style="margin-top:8px">${trainingNote()}</div>`;
  }

  function wireInspectorContent(stage) {
    const slot = $("#insp-content");
    if (!slot) return;
    wireEnvControls(slot);
    slot.querySelectorAll("[data-extract]").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.getAttribute("data-extract") === "secretDb") LabStore.setEnv({ secretDbInYaml: false });
        else {
          LabStore.setEnv({ secretApiInYaml: false });
          LabStore.logAction("extract-api-secret");
        }
      })
    );
    slot.querySelectorAll("[data-action]").forEach((b) =>
      b.addEventListener("click", () => {
        const a = b.getAttribute("data-action");
        if (a === "rotate-keys") {
          LabStore.setEnv({ vaultRotated: true });
          LabStore.logAction("rotate-keys");
        } else if (a === "purge-history") {
          LabStore.setEnv({ historyPurged: true });
          LabStore.logAction("purge-history");
        }
      })
    );
    slot.querySelectorAll("[data-drill]").forEach((b) =>
      b.addEventListener("click", () => {
        const key = b.getAttribute("data-drill");
        const env = LabStore.getEnv();
        if (!env.actionLog.includes(key)) LabStore.logAction(key);
      })
    );
    slot.querySelectorAll("[data-env]").forEach((b) =>
      b.addEventListener("click", () => {
        const [k, v] = b.getAttribute("data-env").split(":");
        LabStore.setEnv({ [k]: v === "true" ? true : v === "false" ? false : v });
      })
    );
    wireObjectiveBody(slot);
    void stage;
  }

  /** Generic wiring for station controls (switches, selects, typing inputs). */
  function wireEnvControls(scope) {
    scope.querySelectorAll(".switch[data-fk^='env:']").forEach((sw) =>
      sw.addEventListener("click", () => {
        const key = sw.getAttribute("data-fk").slice(4);
        LabStore.setEnv({ [key]: sw.getAttribute("aria-checked") !== "true" });
      })
    );
    scope.querySelectorAll("select[data-fk^='env:']").forEach((sel) =>
      sel.addEventListener("change", () => {
        const key = sel.getAttribute("data-fk").slice(4);
        const v = sel.value;
        LabStore.setEnv({ [key]: NUMBER_ENV_KEYS.has(key) ? Number(v) : v });
      })
    );
    scope.querySelectorAll("input[data-fk^='env:']").forEach((inp) => {
      const key = inp.getAttribute("data-fk").slice(4);
      inp.addEventListener("input", () => {
        if (key === "gateCoverage") LabStore.setEnvTyping({ gateCoverage: Number(inp.value || 0) });
        else LabStore.setEnvTyping({ [key]: inp.value });
      });
    });
  }

  function renderInspector() {
    const ui = LabStore.getUi();
    const host = $("#modal-insp");
    if (!host) return;
    if (!ui.inspector) {
      if (inspModal) {
        inspModal.close(true); // remove the body-portal overlay, restore focus
        inspModal = null;
      }
      host.innerHTML = "";
      return;
    }
    if (!inspModal || !document.body.contains(inspModal.panel)) {
      host.innerHTML = "";
      inspModal = openModal({
        labelId: "insp-title",
        descId: "insp-desc",
        showClose: true,
        panelClass: "w-inspector",
        onClose: () => LabStore.openStation(null),
      });
      const slot = inspModal.panel.querySelector(".modal-slot");
      slot.id = "insp-content";
    }
    const slot = inspModal.panel.querySelector(".modal-slot");
    rerenderRegion(slot, () => buildInspectorContent(ui.inspector));
    wireInspectorContent(ui.inspector);
  }

  /* =====================================================================
     Completion modal (Completion.tsx)
     ===================================================================== */

  function starsHtml(n) {
    let out = "";
    for (let i = 1; i <= 5; i++) out += `<span class="star ${i <= n ? "lit" : ""}">${icon("star", "")}</span>`;
    return out;
  }

  function buildCompletionContent() {
    const state = LabStore.getState();
    const objectives = LabStore.getObjectives();
    const mode = state.mode;
    const score = scoreLab(state, quizFor(mode));
    const allPassed = score.passed === score.total;
    const perPillar = PILLARS.map((p) => ({
      p,
      total: objectives.filter((o) => o.pillar === p).length,
      done: objectives.filter((o) => o.pillar === p && state.objectives[o.id]?.passed).length,
    }));

    /* ---- R8: focus areas derived from THIS student's actual evidence ---- */
    const focusAreas = [];
    for (const p of PILLARS) {
      const open = objectives.filter((o) => o.pillar === p && !state.objectives[o.id]?.passed);
      if (open.length > 0) {
        focusAreas.push({
          title: `${PILLAR_LABELS[p]} — ${open.length} open work order${open.length > 1 ? "s" : ""}`,
          detail: `Revisit ${open.map((o) => o.id).join(", ")} on the floor: ${open.map((o) => o.title.toLowerCase()).join("; ")}.`,
        });
      }
    }
    const shaky = objectives.filter((o) => {
      const pr = state.objectives[o.id];
      return pr?.passed && (pr.attempts > 1 || pr.hintsUsed > 0);
    });
    if (shaky.length > 0) {
      focusAreas.push({
        title: "Shaky first passes",
        detail: `${shaky.map((o) => o.id).join(", ")} needed retries or hints. Re-run them in the other shift until they land first attempt — the exam rewards recall under pressure.`,
      });
    }
    const questions = quizFor(mode);
    const misses = questions.filter((x) => state.quiz.answers[x.id] !== x.correct);
    for (const m of misses) {
      focusAreas.push({
        title: `Quiz Q${questions.indexOf(m) + 1} — ${m.topic}`,
        detail: `You locked a wrong answer. Review this topic in the Knowledge Core, then re-read the question's explanation in the Final Quiz result sheet.`,
      });
    }
    if (Object.keys(state.quiz.answers).length === 0) {
      focusAreas.push({
        title: "Final quiz not attempted",
        detail: "Open the Final Quiz binder and lock answers — it is worth 30% of the shift score.",
      });
    }
    const perfect = focusAreas.length === 0 || (allPassed && misses.length === 0 && shaky.length === 0);

    return `
    <div class="modal-head">
      <h2 class="modal-title" id="comp-title">${allPassed ? "Shift complete — line handed over green" : "End-of-shift report"}</h2>
      <p class="modal-desc" id="comp-desc">${
        allPassed
          ? "Every work order closed. You built, secured, versioned, deployed and rolled back a full CI/CD pipeline."
          : "Some work orders are still open — you can keep working and reopen this report anytime."
      }</p>
    </div>
    <div class="comp-scorecard">
      <div>
        <p class="comp-score-label">shift score</p>
        <p class="comp-score-value">${score.score}<span class="of">/100</span></p>
        <p class="comp-score-detail">work orders ${score.passed}/${score.total} · first-attempt ${score.firstAttempt}/${score.total} · quiz ${score.quizCorrect}/${score.quizTotal}</p>
      </div>
      <div class="stars" role="img" aria-label="${score.stars} of 5 stars">${starsHtml(score.stars)}</div>
    </div>
    <p class="comp-scoring-note">Stars reward first-attempt accuracy (hint usage costs a little — ${score.hints} tier${score.hints === 1 ? "" : "s"} revealed). Score = work-order mastery (70%) + quiz (30%).</p>
    <div class="comp-section">
      ${hazardHeader("Pillar recap")}
      <div class="pillar-grid">
        ${perPillar
          .map(
            (x) => `
        <div class="pillar-cell">
          <p class="pc-p">${x.p}</p>
          <p class="pc-label">${PILLAR_LABELS[x.p]}</p>
          <p class="pc-count">${x.done}<span class="of">/${x.total}</span></p>
        </div>`
          )
          .join("")}
      </div>
    </div>
    <div class="comp-section">
      ${hazardHeader("Focus areas · study these next")}
      ${
        perfect
          ? `<p class="perfect-box">Clean sheet: every work order closed first attempt, every quiz answer correct. Nothing to patch — consolidate by replaying the other shift, then move on to the next Cloud+ lesson.</p>`
          : `<ul class="focus-list">${focusAreas
              .map(
                (f) => `
            <li class="focus-item">
              <p class="fi-title">${icon("arrow-right", "i-35")} ${esc(f.title)}</p>
              <p class="fi-detail">${esc(f.detail)}</p>
            </li>`
              )
              .join("")}</ul>`
      }
    </div>
    <div class="comp-section">
      ${hazardHeader("Work-order log")}
      <ul class="wo-log">
        ${objectives
          .map((o) => {
            const prog = state.objectives[o.id];
            return `<li>${lamp(prog?.passed ? "passed" : "idle", "sm")}<span class="wl-id">${o.id}</span><span class="wl-title">${esc(o.title)}</span>${
              o.stage !== "core" ? `<span class="wl-stage">${STAGE_LABELS[o.stage]}</span>` : ""
            }</li>`;
          })
          .join("")}
      </ul>
    </div>
    <div class="next-steps">
      <p class="ns-label">what to learn next</p>
      <ul>
        <li>${icon("arrow-right", "i-35")}<span>Revisit the <strong>Debrief</strong> binder's detection table — Cloud+ loves "given a scenario, what signals this?" questions.</span></li>
        <li>${icon("arrow-right", "i-35")}<span>Replay the other shift: the Night Shift re-tests the same knowledge with distractors, sequences and justification demands.</span></li>
        <li>${icon("arrow-right", "i-35")}<span>Next Cloud+ topics: Lesson 5.x infrastructure as code (Terraform/CloudFormation), orchestration runbooks, and drift detection.</span></li>
      </ul>
    </div>
    <div class="comp-foot">
      <button type="button" class="btn btn-amber" data-comp-close>${allPassed ? "Walk the floor once more" : "Back to the floor"}</button>
    </div>`;
  }

  function renderCompletion() {
    const ui = LabStore.getUi();
    const host = $("#modal-comp");
    if (!host) return;
    if (!ui.completionOpen) {
      if (compModal) {
        compModal.close(true); // remove the body-portal overlay, restore focus
        compModal = null;
      }
      host.innerHTML = "";
      return;
    }
    if (!compModal || !document.body.contains(compModal.panel)) {
      host.innerHTML = "";
      compModal = openModal({
        labelId: "comp-title",
        descId: "comp-desc",
        showClose: true,
        panelClass: "w-completion",
        onClose: () => LabStore.setCompletionOpen(false),
      });
      compModal.panel.querySelector(".modal-slot").id = "comp-content";
    }
    const slot = compModal.panel.querySelector(".modal-slot");
    slot.innerHTML = buildCompletionContent();
    slot.querySelector("[data-comp-close]").addEventListener("click", () => LabStore.setCompletionOpen(false));
  }

  /* =====================================================================
     Reset confirmation (AlertDialog in ControlStrip.tsx)
     ===================================================================== */

  function openResetDialog() {
    const modal = openModal({
      labelId: "alert-title",
      descId: "alert-desc",
      showClose: false,
      panelClass: "plain",
    });
    modal.panel.querySelector(".modal-slot").innerHTML = `
      <h2 class="modal-title mono" id="alert-title" style="font-size:15px;letter-spacing:0.1em">Reset the plant?</h2>
      <p class="modal-desc" id="alert-desc" style="color:#aeb7c2">This wipes all progress, configuration and quiz results from this browser and restores the plant to its broken state. The line cannot be un-reset.</p>
      <div class="alert-foot">
        <button type="button" class="btn alert-cancel" data-alert-cancel>Keep working</button>
        <button type="button" class="btn btn-red" data-alert-reset>Reset everything</button>
      </div>`;
    modal.panel.querySelector("[data-alert-cancel]").addEventListener("click", () => modal.close());
    const resetBtn = modal.panel.querySelector("[data-alert-reset]");
    resetBtn.addEventListener("click", () => {
      modal.close();
      LabStore.resetAll();
    });
    requestAnimationFrame(() => modal.panel.querySelector("[data-alert-cancel]").focus());
  }

  /* =====================================================================
     Phase mount + change dispatch
     ===================================================================== */

  function wirePhase() {
    const s = LabStore.getState();
    const root = $("#app");
    if (s.phase === "mode-select") {
      root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => LabStore.chooseMode(b.getAttribute("data-mode"))));
    } else if (s.phase === "briefing") {
      const btn = root.querySelector("[data-clock-in]");
      if (btn) btn.addEventListener("click", () => LabStore.startShift());
    }
  }

  function mountPhase() {
    const s = LabStore.getState();
    const root = $("#app");
    closeGlossaryPopover();
    // tear down any open modals (phase switches always close them, as in the original)
    document.querySelectorAll(".modal-overlay").forEach((m) => m.remove());
    inspModal = null;
    compModal = null;
    if (s.phase === "mode-select") root.innerHTML = modeSelectView();
    else if (s.phase === "briefing") root.innerHTML = briefingView();
    else {
      root.innerHTML = labSkeleton();
      justMounted = true;
      renderHeader();
      renderConveyor();
      renderBinder();
      renderRail();
      justMounted = false;
    }
    wirePhase();
  }

  function renderAllLab() {
    renderHeader();
    renderConveyor();
    renderRail();
    renderInspectorContent();
    renderCompletionContent();
  }

  function renderInspectorContent() {
    const ui = LabStore.getUi();
    if (ui.inspector && inspModal) {
      const slot = inspModal.panel.querySelector(".modal-slot");
      rerenderRegion(slot, () => buildInspectorContent(ui.inspector));
      wireInspectorContent(ui.inspector);
    }
  }

  function renderCompletionContent() {
    const ui = LabStore.getUi();
    if (ui.completionOpen && compModal) {
      const slot = compModal.panel.querySelector(".modal-slot");
      slot.innerHTML = buildCompletionContent();
      slot.querySelector("[data-comp-close]").addEventListener("click", () => LabStore.setCompletionOpen(false));
    }
  }

  function onChange(evt) {
    const phase = LabStore.getState().phase;
    if (evt === "phase" || evt === "restore") {
      mountPhase();
      return;
    }
    if (phase !== "lab") return;
    switch (evt) {
      case "typing":
        // typing only changes persisted state — nothing else re-renders visually
        break;
      case "env":
      case "answer":
      case "check":
      case "hint":
      case "ui-hint":
        renderAllLab();
        break;
      case "run-tick":
        renderHeader();
        renderConveyor();
        break;
      case "run-done":
        renderHeader();
        renderConveyor();
        renderInspectorContent();
        renderCompletionContent();
        break;
      case "console":
      case "ui-console":
        renderConveyor();
        break;
      case "ui-binder":
      case "quiz":
        renderBinder();
        break;
      case "ui-order":
        renderRail();
        break;
      case "ui-modal":
        renderInspector();
        break;
      case "ui-completion":
        renderCompletion();
        break;
      default:
        break;
    }
  }

  /* =====================================================================
     Boot
     ===================================================================== */

  function boot() {
    LabStore.subscribe(onChange);
    LabStore.restore(); // fires "restore" → mountPhase with the persisted session
    // glossary popovers: single delegated handler + outside-click close
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-glossary]");
      if (btn) {
        toggleGlossaryPopover(btn);
        return;
      }
      if (!e.target.closest(`#${GLOSSARY_POPUP_ID}`)) closeGlossaryPopover();
    });
    // a scrolled page would detach the fixed popover — close it (micro-adaptation, see Conversion Notes)
    window.addEventListener(
      "scroll",
      () => {
        closeGlossaryPopover();
      },
      { passive: true }
    );
  }

  return { boot };
})();

App.boot();
