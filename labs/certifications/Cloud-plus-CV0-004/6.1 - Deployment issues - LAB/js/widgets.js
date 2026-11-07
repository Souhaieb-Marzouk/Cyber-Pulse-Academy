// ─── Launch Control lab — sheet widgets (js/widgets.js) ──────────────────────
// Vanilla-DOM ports of: FieldManual (+ drill widgets OBJ-M1/M2/M7/M11/H9),
// ObjectivesTracker, CompletionModal, and the shared reset-confirm dialog.
// Content strings match the original component-for-component.

(function () {
  "use strict";

  const { store } = window.LabStore;
  const engine = window.LAB_OBJECTIVES;
  const U = window.LabUI;
  const esc = U.esc;
  const icon = U.icon;

  // ── inline check (shared by manual widgets) ────────────────────────────────
  function inlineCheck(objectiveId) {
    const objState = store.objectives[objectiveId];
    let result = "";
    if (objState && objState.lastResult) {
      const def = engine.OBJECTIVES.find((o) => o.id === objectiveId);
      const r = def.validate(store);
      result = `
      <div role="status" aria-live="polite" class="feedback ${r.pass ? "feedback-pass" : "feedback-fail"}">
        <p class="feedback-title ${r.pass ? "t-green" : "t-red"}">${r.pass ? "CHECK PASSED" : "CHECK FAILED"} — ${esc(r.title)}</p>
        <p class="feedback-body">${esc(r.feedback)}</p>
      </div>`;
    }
    return `
    <div class="inline-check">
      <button type="button" data-action="inline-check" data-objective="${objectiveId}" class="btn btn-teal btn-sm">
        ${icon("clipboard-check", "ic-16")} CHECK ${objectiveId.replace("OBJ-", "")}
      </button>
      ${result}
    </div>`;
  }

  // ── OBJ-M1 pipeline ordering widget ────────────────────────────────────────
  function pipelineWidget() {
    const { STAGES, STAGES_SHUFFLED } = window.LAB;
    const order = store.pipelineOrder;
    const done = !!(store.objectives["OBJ-M1"] && store.objectives["OBJ-M1"].done);
    const locked = done; // R2 — a passed answer stays locked
    const remaining = STAGES.filter((st) => !order.includes(st.id));
    // B3 fix: fixed shuffled offer order, numbers stripped — no giveaway.
    const offerOrder = STAGES_SHUFFLED.map((id) => STAGES.find((s) => s.id === id)).filter(
      (st) => st && remaining.some((r) => r.id === st.id),
    );
    return `
    <div id="manual-pipeline" class="widget scroll-anchor">
      <h3 class="widget-title">Drill · Assemble the pipeline <span class="badge-outline badge-teal">OBJ-M1</span></h3>
      <p class="widget-sub">Tap the stages in the order a deployment flows through them.</p>
      <ol class="order-list" aria-label="your pipeline order">
        ${order
          .map((id, i) => {
            const st = STAGES.find((s) => s.id === id);
            return `
          <li class="order-item">
            <span class="order-num">${i + 1}</span>
            <span class="order-label order-label-strong">${esc(st.name)}</span>
            <button type="button" aria-label="Remove ${esc(st.name)}" data-action="pipe-remove" data-stage="${st.id}" class="icon-btn" ${locked ? "disabled" : ""}>✕</button>
          </li>`;
          })
          .join("")}
      </ol>
      ${
        remaining.length > 0
          ? `
      <div class="pipe-offers">
        ${offerOrder
          .map(
            (st) => `
          <button type="button" data-action="pipe-add" data-stage="${st.id}" ${locked ? "disabled" : ""} class="pipe-offer">${esc(st.name)}</button>`,
          )
          .join("")}
      </div>`
          : ""
      }
      ${
        order.length === STAGES.length
          ? store.mode === "medium"
            ? inlineCheck("OBJ-M1")
            : '<p class="widget-note">Hard mode: this map is scored through the Wave 4 blueprint (OBJ-H9).</p>'
          : ""
      }
    </div>`;
  }

  // ── OBJ-M2 signature matching widget ───────────────────────────────────────
  function matchWidget() {
    const { MATCH_DRILL, MATCH_DRILL_ORDER, OFFICIAL_BULLETS } = window.LAB;
    const done = !!(store.objectives["OBJ-M2"] && store.objectives["OBJ-M2"].done);
    const locked = done;
    const orderedSigs = MATCH_DRILL_ORDER.map((id) => MATCH_DRILL.find((m) => m.id === id));
    return `
    <div id="manual-match" class="widget scroll-anchor">
      <h3 class="widget-title">Drill · Signature matching <span class="badge-outline badge-teal">OBJ-M2</span></h3>
      <p class="widget-sub">Map each log signature to its official 6.1 bullet.</p>
      <div class="widget-stack">
        ${orderedSigs
          .map((sig) => {
            const letter = sig.id.replace("sig", "");
            const val = store.matchPairs[sig.id] || "";
            return `
          <div class="drill-card">
            <p class="sig-line"><span class="sig-letter">${letter}</span> “${esc(sig.snippet)}”</p>
            <select aria-label="Classify signature ${letter}" data-field-role="match" data-sig="${sig.id}" class="select select-tall" ${locked ? "disabled" : ""}>
              <option value="" ${val === "" ? "selected" : ""} disabled>official bullet…</option>
              ${OFFICIAL_BULLETS.map((b) => `<option value="${b.value}" ${val === b.value ? "selected" : ""}>${esc(b.label)}</option>`).join("")}
            </select>
          </div>`;
          })
          .join("")}
      </div>
      ${store.mode === "medium" ? inlineCheck("OBJ-M2") : ""}
    </div>`;
  }

  // ── OBJ-M7 detection drill widget ──────────────────────────────────────────
  function detectWidget() {
    const { DATASOURCE_DRILL, DATASOURCE_ORDER } = window.LAB;
    const done = !!(store.objectives["OBJ-M7"] && store.objectives["OBJ-M7"].done);
    const locked = done;
    const orderedDrills = DATASOURCE_ORDER.map((id) => DATASOURCE_DRILL.find((d) => d.id === id));
    return `
    <div id="manual-detect" class="widget scroll-anchor">
      <h3 class="widget-title">Drill · Which observer sees it? <span class="badge-outline badge-teal">OBJ-M7</span></h3>
      <p class="widget-sub">Detection starts by choosing the data source that actually observes the failure mode.</p>
      <div class="widget-stack">
        ${orderedDrills
          .map((d) => {
            const val = store.dataSources[d.id] || "";
            return `
          <div class="drill-card">
            <p class="drill-scenario">${esc(d.scenario)}</p>
            <select aria-label="Data source for: ${esc(d.scenario.slice(0, 40))}…" data-field-role="detect" data-drill="${d.id}" class="select select-tall" ${locked ? "disabled" : ""}>
              <option value="" ${val === "" ? "selected" : ""} disabled>data source…</option>
              ${d.options.map((o) => `<option value="${o.value}" ${val === o.value ? "selected" : ""}>${esc(o.label)}</option>`).join("")}
            </select>
          </div>`;
          })
          .join("")}
      </div>
      ${inlineCheck("OBJ-M7")}
    </div>`;
  }

  // ── OBJ-M11 prevention gate widget ─────────────────────────────────────────
  function preventWidget() {
    const { PREVENTION_OPTIONS } = window.LAB;
    const done = !!(store.objectives["OBJ-M11"] && store.objectives["OBJ-M11"].done);
    const locked = done;
    return `
    <div id="manual-prevent" class="widget scroll-anchor">
      <h3 class="widget-title">Gate · Arm the prevention controls <span class="badge-outline badge-teal">OBJ-M11</span></h3>
      <p class="widget-sub">Select every genuine preventive control (at least five). Two options are anti-patterns — reject them.</p>
      <div class="checks">
        ${PREVENTION_OPTIONS.map(
          (o) => `
        <label class="check-row check-row-paper">
          <input type="checkbox" data-action="toggle-prevention" data-value="${o.value}" aria-label="${esc(o.label)}"
            ${store.prevention.includes(o.value) ? "checked" : ""} ${locked ? "disabled" : ""}/>
          <span>${esc(o.label)}</span>
        </label>`,
        ).join("")}
      </div>
      ${inlineCheck("OBJ-M11")}
    </div>`;
  }

  // ── OBJ-H9 blueprint widget (hard) ─────────────────────────────────────────
  function blueprintWidget() {
    const { BLUEPRINT_CONTROLS, STAGES } = window.LAB;
    const done = !!(store.objectives["OBJ-H9"] && store.objectives["OBJ-H9"].done);
    const locked = done;
    return `
    <div id="manual-blueprint" class="widget scroll-anchor">
      <h3 class="widget-title">Blueprint · Wave 4 pre-flight gate <span class="badge-outline badge-teal">OBJ-H9</span></h3>
      <p class="widget-sub">Assign each control to the pipeline stage where it prevents its failure class. Strict mapping.</p>
      <div class="widget-stack">
        ${BLUEPRINT_CONTROLS.map((ctl) => {
          const val = store.blueprint[ctl.id] || "";
          return `
          <div class="drill-card drill-card-row">
            <span class="drill-label">${esc(ctl.label)}</span>
            <select aria-label="Stage for: ${esc(ctl.label)}" data-field-role="blueprint" data-control="${ctl.id}" class="select select-tall bp-select" ${locked ? "disabled" : ""}>
              <option value="" ${val === "" ? "selected" : ""} disabled>pipeline stage…</option>
              ${STAGES.map((st) => `<option value="${st.id}" ${val === st.id ? "selected" : ""}>S${st.num} · ${esc(st.name)}</option>`).join("")}
            </select>
          </div>`;
        }).join("")}
      </div>
      ${inlineCheck("OBJ-H9")}
    </div>`;
  }

  // ── field manual sheet body ────────────────────────────────────────────────
  const METHOD_STEPS = [
    { n: 1, t: "Observe the symptom", d: "What is broken, where does the pipeline report it, and what does the user see?" },
    { n: 2, t: "Read the failure line", d: "Error codes are the exam's love language: QuotaExceeded, ENOTFOUND, 0x8007232A, exit code 1, initramfs panic." },
    { n: 3, t: "Locate the stage", d: "Where it surfaced ≠ where it rooted. A DNS record missing at orchestration shows up as health-check failures at validation." },
    { n: 4, t: "Correlate artifacts", d: "Logs + events + config + metrics. One artifact is an anecdote; four agreeing artifacts are a root cause." },
    { n: 5, t: "Classify, then fix", d: "Name the 6.1 bullet before touching anything. The category often dictates the runbook." },
    { n: 6, t: "Verify and prevent", d: "Re-run the check that failed, then add the control that makes recurrence impossible." },
  ];

  const TAXONOMY = [
    { id: "Incompatibility", d: "Guest drivers, OS version, boot mode or architecture don't match the target platform. Classic: P2V imports meeting virtio-only storage." },
    { id: "Misconfigurations", d: "The largest family: template parameter errors, dependency misconfig (DNS zones, NTP egress, KMS records), script typos, missing wait conditions." },
    { id: "Outdated definitions", d: "Stale artifacts propagate: golden images without current agents/patches, pinned old image versions, out-of-date templates." },
    { id: "Deprecation", d: "Retired instance families, EOL operating systems, sunset API versions — yesterday's valid request is today's rejection." },
    { id: "Outages", d: "Provider-side incidents (control plane, metadata, DNS). Your config is innocent: verify, freeze changes, retry after recovery." },
    { id: "Resource limits", d: "Account/region quotas (vCPU, IPs). The request fails pre-creation with an explicit limit in the error." },
    { id: "Regional availability", d: "Physical capacity stock-outs per AZ/region. Quota is fine; the hardware simply is not there right now." },
  ];

  function renderManualBody() {
    const { STAGES, GLOSSARY, BRIEFING } = window.LAB;
    return `
      <section id="manual-taxonomy" class="scroll-anchor">
        <h2 class="manual-h2">The seven ways deployments fail</h2>
        <div class="manual-grid">
          ${TAXONOMY.map(
            (b, i) => `
          <div class="tax-card">
            <h3 class="tax-title"><span class="tax-num">${i + 1}</span>${esc(b.id)}</h3>
            <p class="tax-def">${esc(b.d)}</p>
          </div>`,
          ).join("")}
          <p class="tax-instinct"><strong>Exam instinct:</strong> when several categories plausibly fit, let the error text decide — quota errors carry numbers, outages carry incident IDs, stock-outs carry AZ names, incompatibility carries driver/kernel names.</p>
        </div>
      </section>

      <section>
        <h2 class="manual-h2">The provisioning pipeline</h2>
        <p class="manual-p">Six stages, in order. Every failure you triage lives at one of them — and the stage where a failure <em>surfaces</em> is often one or two stages downstream of where it <em>roots</em>.</p>
        <div class="manual-stack">
          ${pipelineWidget()}
          <div class="widget">
            <h3 class="stage-ref-title">Stage reference</h3>
            <ol class="stage-ref">
              ${STAGES.map(
                (st) => `
              <li><span class="tax-num">${st.num}</span><span><strong>${esc(st.name)}.</strong> <span class="t-muted">${esc(st.blurb)}</span></span></li>`,
              ).join("")}
            </ol>
          </div>
        </div>
      </section>

      ${matchWidget()}

      <section>
        <h2 class="manual-h2">Diagnose like Cloud+</h2>
        <div class="manual-stack-tight">
          ${METHOD_STEPS.map(
            (s) => `
          <div class="method-card"><span class="method-num">${s.n}</span><p><strong>${esc(s.t)}.</strong> <span class="t-muted">${esc(s.d)}</span></p></div>`,
          ).join("")}
        </div>
      </section>

      ${detectWidget()}
      ${preventWidget()}
      ${store.mode === "hard" ? blueprintWidget() : ""}

      <section id="manual-glossary" class="scroll-anchor">
        <h2 class="manual-h2">Glossary</h2>
        <dl class="glossary">
          ${GLOSSARY.map(
            (g) => `
          <div class="gloss-entry"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`,
          ).join("")}
        </dl>
      </section>

      <section>
        <h2 class="manual-h2">${icon("lightbulb", "ic-16")} Exam tips for 6.1</h2>
        <ul class="tips">
          <li>"Given a scenario" means the answer is <em>in the evidence</em> — read the error line before reading the options.</li>
          <li>Quota vs regional availability is the exam's favorite trap: one is an account limit you can raise; the other is physical capacity you must route around.</li>
          <li>SUCCESS is not health. If a deployment reports SUCCESS but users hurt, look for missing health gates and orchestration races.</li>
          <li>Fix the artifact, not just the instance: image and script defects recur with every deployment until the source is fixed.</li>
          <li>Prefer the least-privilege fix: scoped SG rules, scoped NTP egress — never 0.0.0.0/0 as a "quick fix".</li>
        </ul>
      </section>

      <section>
        <h2 class="manual-h2">Official references</h2>
        <ul class="refs">
          <li><a href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener noreferrer" class="linklike">CompTIA Cloud+ (CV0-004) certification &amp; exam objectives ${icon("external-link", "ic-12")}</a></li>
          <li><a href="https://attack.mitre.org/techniques/T1078/004/" target="_blank" rel="noopener noreferrer" class="linklike">MITRE ATT&amp;CK T1078.004 — Cloud Accounts (deploy-role abuse) ${icon("external-link", "ic-12")}</a></li>
          <li><a href="https://attack.mitre.org/techniques/T1190/" target="_blank" rel="noopener noreferrer" class="linklike">MITRE ATT&amp;CK T1190 — Exploit Public-Facing Application (exposure from bad "fixes") ${icon("external-link", "ic-12")}</a></li>
          <li><a href="https://attack.mitre.org/techniques/T1530/" target="_blank" rel="noopener noreferrer" class="linklike">MITRE ATT&amp;CK T1530 — Data from Cloud Storage (misconfigured storage) ${icon("external-link", "ic-12")}</a></li>
        </ul>
        <p class="refs-note">Objectives covered tonight: ${esc(BRIEFING.org)} · ${esc(BRIEFING.event)}. All data synthetic.</p>
      </section>`;
  }

  // ── objectives tracker sheet body ──────────────────────────────────────────
  function objectiveCard(def, isNext) {
    const st = store.objectives[def.id];
    const hintsUsed = (st && st.hintsUsed) || 0;
    const hard = store.mode === "hard";
    return `
    <article class="obj-card ${st && st.done ? "obj-done" : isNext ? "obj-next" : ""}" aria-label="Objective ${def.id}">
      <header class="obj-head">
        <span class="obj-id">${def.id.replace("OBJ-", "")}</span>
        ${U.pillarBadge(def.pillar)}
        ${
          st && st.done
            ? `<span class="obj-flag flag-done">✓ DONE${st.passedFirstTry ? " · 1ST TRY" : ""}</span>`
            : isNext
              ? '<span class="obj-flag flag-next">NEXT UP</span>'
              : ""
        }
      </header>
      <h3 class="obj-title">${esc(def.title)}</h3>
      ${!hard && def.context ? `<p class="obj-context">${esc(def.context)}</p>` : ""}
      ${
        !hard && def.look
          ? `<p class="obj-look">${icon("crosshair", "ic-12 t-teal")}<span>${esc(def.look)}</span></p>`
          : ""
      }
      <p class="obj-anchor">anchor · ${esc(def.anchor)}</p>
      <div class="obj-actions">
        <button type="button" data-action="check-objective" data-objective="${def.id}" class="btn btn-sm ${st && st.done ? "btn-ghost" : "btn-primary"}">
          ${st && st.done ? "RE-CHECK" : "CHECK RESULTS"}
        </button>
        ${
          !hard
            ? `<button type="button" data-action="use-hint" data-objective="${def.id}" class="btn btn-outline btn-sm btn-hint" ${hintsUsed >= def.hints.length ? "disabled" : ""}>
                ${icon("lightbulb", "ic-14")} Hint ${hintsUsed}/${def.hints.length}
              </button>`
            : hintsUsed < def.hints.length
              ? `<button type="button" data-action="use-hint" data-objective="${def.id}" class="btn btn-outline btn-sm btn-nudge">
                  ${icon("lightbulb", "ic-14")} Nudge (costs score)
                </button>`
              : ""
        }
        <button type="button" data-action="focus" data-objective="${def.id}" class="btn btn-ghost btn-sm t-teal">${icon("crosshair", "ic-14")} Focus</button>
      </div>
      ${
        hintsUsed > 0
          ? `<div class="hints">
              ${def.hints
                .slice(0, hintsUsed)
                .map((h, i) => `<p class="hint-line"><strong class="hint-k">HINT ${i + 1}:</strong> ${esc(h)}</p>`)
                .join("")}
            </div>`
          : ""
      }
      ${
        st && st.lastResult
          ? (() => {
              const result = def.validate(store);
              return `
        <div role="status" aria-live="polite" class="feedback ${st.lastResult === "pass" ? "feedback-pass" : "feedback-fail"}">
          <p class="feedback-title ${st.lastResult === "pass" ? "t-green" : "t-red"}">
            ${st.lastResult === "pass" ? "PASSED" : "FAILED"} · ${esc(result.title)} · attempts ${st.attempts}
          </p>
          <p class="feedback-body">${esc(result.feedback)}</p>
        </div>`;
            })()
          : ""
      }
    </article>`;
  }

  function renderTrackerBody() {
    const defs = engine.OBJECTIVES.filter((o) => o.mode === store.mode);
    const total = engine.objectivesForMode(store, store.mode).length;
    const done = engine.doneCount(store, store.mode);
    const nextId = (defs.find((d) => !(store.objectives[d.id] && store.objectives[d.id].done)) || {}).id;
    const starsN = engine.starRating(store, store.mode);
    return `
      <div class="tracker-summary">
        ${U.progressRing(done, total, 44)}
        <div>
          <p class="tracker-count">${done} of ${total} objectives complete</p>
          <p class="tracker-stars">current rating ${U.stars(starsN, 13)} <span class="t-faint">(first-try accuracy &amp; hints)</span></p>
        </div>
      </div>
      <div class="tracker-cards">
        ${defs.map((d) => objectiveCard(d, d.id === nextId)).join("")}
      </div>`;
  }

  // ── completion modal body ──────────────────────────────────────────────────
  const PILLARS = ["P1", "P2", "P3", "P4"];
  const PILLAR_NAMES = { P1: "Understand", P2: "Recognize / analyze", P3: "Detect", P4: "Mitigate" };

  function deriveFocusAreas(mode, state) {
    const areas = [];
    const objectives = engine.OBJECTIVES.filter((o) => o.mode === mode);

    // 1) objectives that were failed, retried, or are still open
    for (const def of objectives) {
      const st = state.objectives[def.id];
      if (!st || !st.done) {
        areas.push({
          label: def.title,
          action: `Still open — re-run ${def.id.replace("OBJ-", "")} with CHECK RESULTS until it passes.`,
          objectiveId: def.id,
        });
      } else if (st.attempts > 1 || (st.lastResult || "pass") === "fail") {
        areas.push({
          label: def.title,
          action: `Passed on attempt #${st.attempts} — worth one clean re-run to lock the pattern in.`,
          objectiveId: def.id,
        });
      }
    }

    // 2) quiz items answered wrong → their topic + evidence anchor
    const quizItems = mode === "medium" ? window.LAB.QUIZ_MEDIUM : window.LAB.QUIZ_HARD;
    for (const q of quizItems) {
      if (state.quiz.checked[q.id] && state.quiz.answers[q.id] !== q.answer) {
        areas.push({
          label: q.topic,
          action: `Missed quiz item ${quizItems.findIndex((x) => x.id === q.id) + 1} — re-work the evidence in ${q.focus.caseId || "the field manual"}, then re-answer mentally.`,
          quizItemId: q.id,
          objectiveId: undefined,
        });
      }
    }
    return areas;
  }

  function renderCompletionBody() {
    const mode = store.mode;
    const complete = window.LabStore.isComplete(mode, store);
    const total = engine.objectivesForMode(store, mode).length;
    const done = engine.doneCount(store, mode);
    const starsN = engine.starRating(store, mode);
    const quizItems = mode === "medium" ? window.LAB.QUIZ_MEDIUM : window.LAB.QUIZ_HARD;
    const qScore = window.LabStore.quizScore(mode, store.quiz);
    const firstTry = engine.OBJECTIVES.filter(
      (o) => o.mode === mode && store.objectives[o.id] && store.objectives[o.id].passedFirstTry,
    ).length;
    const hintsUsed = Object.values(store.objectives).reduce((a, o) => a + (o.hintsUsed || 0), 0);
    const focusAreas = deriveFocusAreas(mode, store);

    return `
      <div class="comp-head">
        <h2 class="comp-title">${complete ? `${icon("party-popper", "ic-24 t-signal")} Shift complete — Wave 3 secured` : `${icon("graduation-cap", "ic-24 t-faint")} Completion record`}</h2>
        <p class="comp-sub">${complete ? "You diagnosed, detected and prevented the full CV0-004 6.1 spectrum tonight." : "Not everything is closed out yet — here is where you stand."}</p>
      </div>

      <div class="comp-summary">
        ${U.progressRing(done, total, 64)}
        <div>
          ${U.stars(starsN, 22)}
          <p class="comp-stat">${starsN} of 5 stars · ${firstTry}/${total} first-try · ${hintsUsed} hints used</p>
          <p class="comp-stat">Knowledge check: ${qScore}/${quizItems.length}</p>
        </div>
      </div>

      <div class="comp-pillars">
        <h3 class="comp-h3">Recap by mastery pillar</h3>
        ${PILLARS.map((p) => {
          const defs = engine.OBJECTIVES.filter((o) => o.mode === mode && o.pillar === p);
          const d = defs.filter((o) => store.objectives[o.id] && store.objectives[o.id].done).length;
          return `
          <div class="pillar-row">
            ${U.pillarBadge(p)}
            <span class="pillar-name">${PILLAR_NAMES[p]}</span>
            <span class="pillar-count">${d}/${defs.length}</span>
          </div>`;
        }).join("")}
      </div>

      <div class="comp-focus">
        <h3 class="comp-h3 t-alert">${icon("target", "ic-14")} Focus areas — from tonight's evidence</h3>
        ${
          focusAreas.length === 0
            ? '<p class="comp-focus-none">None — every objective passed first-try and the knowledge check was clean. Mastery confirmed; keep the debrief tables as your pre-exam revision sheet.</p>'
            : `<ul class="comp-focus-list">
                ${focusAreas
                  .map(
                    (fa, i) => `
                  <li class="focus-card">
                    <p class="focus-label">${esc(fa.label)}</p>
                    <p class="focus-action">${esc(fa.action)}</p>
                    <button type="button" data-action="focus-area" data-index="${i}" class="linklike focus-jump">
                      ${icon("crosshair", "ic-12")} Jump to the evidence
                    </button>
                  </li>`,
                  )
                  .join("")}
              </ul>`
        }
      </div>

      <div class="comp-next">
        <h3 class="comp-h3 t-tealdeep">What to learn next</h3>
        <ul class="comp-next-list">
          <li>▸ CV0-004 6.2 — troubleshoot <strong>network</strong> issues (DHCP, DNS, NTP, NAT, routing, latency).</li>
          <li>▸ CV0-004 6.3 — troubleshoot <strong>security</strong> issues (ciphers, authN/Z failures, vulnerabilities).</li>
          <li>▸ Re-run this lab in the other mode — Field Technician and Incident Commander exercise different depths of the same objective.</li>
        </ul>
      </div>

      <div class="comp-actions">
        <button type="button" data-action="completion-floor" class="btn btn-outline">Back to the floor</button>
        <button type="button" data-action="confirm-reset" data-variant="modal" class="btn btn-outline btn-reset-text">${icon("rotate-ccw", "ic-16")} Reset lab</button>
        <button type="button" data-action="completion-debrief" class="btn btn-primary">Debrief ${icon("arrow-right", "ic-16")}</button>
      </div>`;
  }

  // ── reset confirm dialog body ──────────────────────────────────────────────
  function confirmDialog(variant) {
    return `
      <h2 class="confirm-title">Reset the launch night?</h2>
      <p class="confirm-copy">${
        variant === "header"
          ? "This clears all saved progress — mode, diagnoses, objectives, quiz results and stars — and returns the lab to its pristine state."
          : "This clears all saved progress — mode, diagnoses, objectives, quiz results and stars."
      }</p>
      <div class="confirm-actions">
        <button type="button" data-action="confirm-reset-cancel" class="btn btn-outline">Keep my progress</button>
        <button type="button" data-action="confirm-reset-accept" class="btn btn-danger">Reset everything</button>
      </div>`;
  }

  window.LabWidgets = {
    renderManualBody,
    renderTrackerBody,
    renderCompletionBody,
    confirmDialog,
    inlineCheck,
    pipelineWidget,
    matchWidget,
    detectWidget,
    preventWidget,
    blueprintWidget,
  };
})();
