// ─────────────────────────────────────────────────────────────────────────────
// js/panels.js — the lab screens and console panels.
// 1:1 ports of the original React components:
//   ModeGate · Briefing · DepartureBoard · FlightPlan · RadarConsole ·
//   ClearancePanel · EvidenceLocker · LearnPanel · DebriefPanel ·
//   ObjectivesPanel · QuizPanel · CompletionModal · GlossarySheet
// Runtime-only UI state (current tab, selections, feedback) lives in `ui`.
// ─────────────────────────────────────────────────────────────────────────────

const PILLAR_NAMES = { P1: "Understand", P2: "Recognize / Analyze", P3: "Validate (detect)", P4: "Plan & control (mitigate)" };

const TAB_DEFS = [
  { key: "flight", label: "Flight Plan" },
  { key: "radar", label: "Radar" },
  { key: "clearance", label: "Clearance" },
  { key: "evidence", label: "Evidence" },
  { key: "learn", label: "Learn" },
  { key: "debrief", label: "Debrief" },
  { key: "objectives", label: "Objectives" },
  { key: "quiz", label: "Quiz" },
];

// ── Boot splash ─────────────────────────────────────────────────────────────

function BootView() {
  return h("div", { class: "boot-screen" },
    h("p", { class: "boot-text" }, "spooling tower systems", h("span", { class: "tower-blink" }, "▍")),
  );
}

// ── Mode gate ───────────────────────────────────────────────────────────────

function ModeGateView({ onSelect, hasSaved, onDiscardSaved }) {
  return h("div", { class: "page mode-gate" },
    h("div", { class: "mode-gate__inner" },
      h("div", { class: "mode-gate__head anim-rise" },
        h("div", { class: "mode-chip" },
          icon(I.RadioTower, 20, "c-runway"),
          h("span", { class: "mode-chip__text" }, "MERIDIAN FREIGHT GROUP · PROGRAMME HELVETICA · TOWER 118.10"),
          h("span", { class: "tower-blink c-runway" }, "▍"),
        ),
        h("h1", { class: "mode-gate__title" }, "Cloud Migration ", h("span", { class: "c-runway-bright" }, "Control Tower")),
        h("p", { class: "mode-gate__sub" },
          "An interactive lab for ", h("span", { class: "mode-gate__cert" }, "CompTIA Cloud+ CV0-004 · Objective 2.3 — Workload migrations"), ": ",
          "plan and execute migrations — strategies, transfer engineering, waves, cutover, validation, rollback. Every byte in this tower is synthetic training data.",
        ),
      ),
      h("div", { class: "mode-cards" },
        h("button", {
          class: "mode-card mode-card--medium anim-rise anim-delay-1",
          onClick: () => onSelect("medium"),
          "aria-label": "Select Medium mode: guided learning",
        },
          h("div", { class: "mode-card__head" },
            h("span", { class: "mode-card__kicker c-radar" }, icon(I.GraduationCap, 16), " MEDIUM · GUIDED"),
            h("span", { class: "mode-card__count" }, "12 OBJECTIVES"),
          ),
          h("h2", { class: "mode-card__title" }, "Line Check Flight"),
          h("p", { class: "mode-card__desc" },
            "Learn by flying a standard route: objectives in order, \"where to look\" on every task, three tiers of hints, forgiving validation that teaches on every miss."),
          h("ul", { class: "mode-card__list" },
            h("li", null, "· guided progression · hints free (cost stars)"),
            h("li", null, "· tolerant checks · explanations everywhere"),
            h("li", null, "· quiz after practice · supportive tone"),
          ),
          h("span", { class: "mode-card__cta c-radar" }, "Begin guided sortie ", icon(I.ArrowRight, 16)),
        ),
        h("button", {
          class: "mode-card mode-card--hard anim-rise anim-delay-2",
          onClick: () => onSelect("hard"),
          "aria-label": "Select Hard mode: challenge",
        },
          h("div", { class: "mode-card__head" },
            h("span", { class: "mode-card__kicker c-signal" }, icon(I.Flame, 16), " HARD · CHALLENGE"),
            h("span", { class: "mode-card__count" }, "9 OBJECTIVES"),
          ),
          h("h2", { class: "mode-card__title" }, "Incident Command"),
          h("p", { class: "mode-card__desc" },
            "A noisy evidence package with planted red herrings, contention math, strict exact-value checks, and an incident at 02:41 that will not wait for you to read the manual."),
          h("ul", { class: "mode-card__list" },
            h("li", null, "· scenario-first discovery · 2 red herrings"),
            h("li", null, "· exact values, exact terms · near-misses rejected"),
            h("li", null, "· one optional nudge, visibly costly"),
          ),
          h("span", { class: "mode-card__cta c-signal" }, "Take the hot seat ", icon(I.ArrowRight, 16)),
        ),
      ),
      hasSaved
        ? h("div", { class: "saved-banner" },
            h("p", { class: "saved-banner__text" },
              "A saved tower session exists. Selecting a mode below starts fresh; discard to free the saved run."),
            TowerButton({ variant: "danger", size: "sm", onClick: onDiscardSaved, ariaLabel: "Discard saved session" },
              icon(I.Gauge, 16), " Discard saved session"),
          )
        : null,
      h("p", { class: "mode-gate__foot" },
        "SYNTHETIC TRAINING DATA · NO REAL SYSTEMS · DEFENSIVE / EDUCATIONAL USE · CV0-004 2.3"),
    ),
  );
}

// ── Briefing screen (pre-flight) ────────────────────────────────────────────

const MODE_TASKS = {
  medium: [
    "12 guided objectives walk the full migration lifecycle: strategies → routes → dependencies → bandwidth math → transfer methods → landing zones → blockers → validation → cutover → rollback → waves → close-out.",
    "Every task points you at the exact console and evidence; three hint tiers per task; checks explain every answer.",
    "Finish with a concept quiz and a debrief you can defend in exam terms.",
  ],
  hard: [
    "9 broad, multi-step challenges: triage a noisy evidence package (2 planted red herrings), map all 12 strategies exactly, engineer transfer schedules under contention, and command a live incident.",
    "No 'where to look'. One optional nudge per objective, visibly costly. Exact values and exact CompTIA terms; near-misses are rejected with reasons.",
    "The cutover simulation will bite. Rollback triggers, RTO/RPO and the policy document are your friends — read them before 02:41.",
  ],
};

function BriefingView({ mode, onBegin }) {
  return h("div", { class: "page" },
    h("article", { class: "briefing-card anim-rise", "aria-labelledby": "briefing-title" },
      h("div", { class: "briefing-badges" },
        h("span", { class: "badge-amber" }, icon(I.PlaneTakeoff, 16), " PRE-FLIGHT BRIEFING"),
        h("span", { class: "briefing-roll" }, "READ-AND-ROLL IN 3 MINUTES"),
      ),
      h("h1", { id: "briefing-title", class: "briefing-title" }, "Programme ", h("span", { class: "c-runway-bright" }, "HELVETICA")),
      h("p", { class: "briefing-org" }, icon(I.Building2, 14), ` ${BRIEFING.org} · ${BRIEFING.tagline}`),
      h("div", { class: "briefing-lines" }, BRIEFING.lines.map((line, i) => h("p", { key: i }, line))),
      h("div", { class: "cert-note" },
        h("p", null, icon(I.Award, 16, "cert-note__icon"), ` ${BRIEFING.certNote}`),
      ),
      h("div", { class: "sortie" },
        h("h2", { class: "section-label__text sortie__title" },
          icon(I.ListChecks, 16, "c-runway"),
          ` Your sortie (${mode === "medium" ? "Medium · guided" : "Hard · challenge"})`),
        h("ul", { class: "sortie__list" },
          MODE_TASKS[mode].map((t, i) => h("li", { key: i, class: "sortie__item" },
            h("span", { class: "sortie__dot", "aria-hidden": "true" }), t)),
        ),
      ),
      h("div", { class: "briefing-footer" },
        h("p", { class: "briefing-foot-note" }, "ALL ORGS · HOSTS · FIGURES: FICTIONAL TRAINING DATA"),
        TowerButton({ variant: "primary", onClick: onBegin, ariaLabel: "Enter the control tower" },
          "Enter the control tower ", h("span", { "aria-hidden": "true" }, "→")),
      ),
    ),
  );
}

// ── Departure board ─────────────────────────────────────────────────────────

const LANES = [
  { key: "hold", label: "HOLD", sub: "no flight plan filed", statuses: ["hold"] },
  { key: "cleared", label: "CLEARED", sub: "plan validated · awaiting transfer", statuses: ["cleared"] },
  { key: "enroute", label: "EN ROUTE", sub: "transfer in progress", statuses: ["enroute"] },
  { key: "arrived", label: "ARRIVED", sub: "landed / planned · validate & close", statuses: ["arrived"] },
];

const TIER_TONE = { PCI: "red", GDPR: "amber", RETENTION: "teal", STANDARD: "dim" };

function DepartureBoardView({ state, onSelectWorkload }) {
  return h("section", { class: "board tower-scroll", "data-scrollkey": "board", "aria-label": "Departure board — workload migration lanes" },
    LANES.map((lane) => {
      const items = WORKLOADS.filter((w) => lane.statuses.includes((state.workloads[w.id] ?? { status: "hold" }).status));
      return h("div", { key: lane.key, class: "lane" },
        h("div", { class: "lane-head" },
          h("h3", { class: `lane-title lane-title--${lane.key}` }, lane.label),
          h("span", { class: "lane-sub" }, lane.sub),
          h("span", { class: "lane-count" }, String(items.length)),
        ),
        h("div", { class: "lane-grid" },
          items.map((w) => {
            const ws = state.workloads[w.id];
            const strategy = ws?.strategy;
            return h("button", {
              key: w.id, "data-flip": w.id,
              onClick: () => onSelectWorkload(w.id),
              "aria-label": `Open flight plan for ${w.id} ${w.name}, status ${STATUS_LABEL[ws?.status ?? "hold"]}`,
              class: `board-card board-card--${ws?.status ?? "hold"}`,
            },
              h("div", { class: "board-card__top" },
                StatusDot(ws?.status ?? "hold"),
                h("span", { class: "board-card__id" }, w.id),
                h("span", { class: "board-card__name" }, w.name),
                h("span", { class: "board-card__chips" },
                  Chip(w.tier, TIER_TONE[w.tier]),
                  Chip(`${w.dataTB} TB`),
                ),
              ),
              h("p", { class: "board-card__kind" }, w.kind),
              h("div", { class: "board-card__chips2" },
                strategy ? Chip(strategy, "amber") : Chip("strategy —"),
                ws?.status === "enroute" ? Chip(`${Math.round(ws.progress ?? 0)} % transferred`, "teal") : null,
                ws?.status === "arrived" && (strategy === "retain" || strategy === "retire") ? Chip("planned — no transfer", "green") : null,
                w.depsOut.some((d) => d.startsWith("WL-")) ? Chip(`deps: ${w.depsOut.filter((d) => d.startsWith("WL-")).join(" ")}`) : null,
              ),
              ws?.status === "enroute"
                ? h("div", { class: "progress-track" },
                    h("div", { class: "progress-fill progress-fill--teal", style: { width: `${ws.progress ?? 0}%` } }))
                : null,
            );
          }),
          items.length === 0 ? h("p", { class: "lane-empty" }, "— empty —") : null,
        ),
      );
    }),
  );
}

// ── Flight Plan panel ───────────────────────────────────────────────────────

const STRATEGY_ORDER = ["rehost", "replatform", "rearchitect", "refactor", "retain", "retire"];

function FlightPlanView({ state, mode, selectedId, onSelect, onPatch, onExecute, onFocusObjective, clearClearance }) {
  const def = selectedId ? WORKLOAD_MAP[selectedId] : null;
  const ws = selectedId ? state.workloads[selectedId] : null;
  const clr = ui.clearanceResult;

  const runClearance = () => {
    if (!selectedId) return;
    const issues = clearanceIssues(state, selectedId);
    const w = state.workloads[selectedId];
    const d = WORKLOAD_MAP[selectedId];
    const swapNote =
      mode === "medium" &&
      w.strategy !== undefined &&
      d.expected.strategy !== w.strategy &&
      ((w.strategy === "rearchitect" && d.expected.strategy === "refactor") ||
        (w.strategy === "refactor" && d.expected.strategy === "rearchitect"));
    ui.clearanceResult = { issues, swapNote };
    if (issues.length === 0 || swapNote) {
      if (w.status === "hold") onPatch(selectedId, { status: "cleared" });
    }
    renderApp();
  };

  return h("div", { class: "panel-scroll tower-scroll", "data-scrollkey": "panel" },
    h("div", { class: "section-label" }, h("h3", { class: "section-label__text" }, "Flight plans · select a workload")),
    h("div", { class: "fp-picker", role: "tablist", "aria-label": "Workload selector" },
      WORKLOADS.map((w) => {
        const st = (state.workloads[w.id] ?? { status: "hold" }).status;
        return h("button", {
          key: w.id, role: "tab", "aria-selected": selectedId === w.id,
          onClick: () => { onSelect(w.id); },
          class: `fp-tab ${selectedId === w.id ? "fp-tab--active" : st === "arrived" ? "fp-tab--arrived" : st === "enroute" ? "fp-tab--enroute" : ""}`,
        }, `${w.id} ${w.name}`);
      }),
    ),
    !def || !ws
      ? h("div", { class: "fp-empty" },
          icon(I.Plane, 32, "fp-empty__icon"),
          h("p", { class: "fp-empty__text" }, "Select a workload above to open its flight plan."),
          h("p", { class: "fp-empty__sub" }, "File route · strategy · transfer · landing config — then request clearance."))
      : h("article", { class: "fp-article", "aria-label": `Flight plan ${def.id} ${def.name}` },
          h("header", { class: "fp-header" },
            h("div", { class: "fp-title-row" },
              h("span", { class: "fp-id" }, def.id),
              h("h2", { class: "fp-name" }, def.name),
              Chip(def.origin === "cloud" ? "runs today: cloud (AtlantCloud)" : "runs today: on-prem (RDM-DC1)", "teal"),
              h("span", { class: "fp-status" }, (ws.status ?? "").toUpperCase()),
            ),
            h("p", { class: "fp-kind" }, def.kind),
            h("div", { class: "fp-chips" },
              Chip(def.os),
              Chip(def.hypervisor),
              Chip(`${def.dataTB} TB`),
              Chip(def.tier, def.tier === "PCI" ? "red" : def.tier === "GDPR" ? "amber" : def.tier === "RETENTION" ? "teal" : "dim"),
              Chip(`downtime: ${def.downtime}`),
              def.depsOut.some((d) => d.startsWith("WL-"))
                ? Chip(`depends on: ${def.depsOut.filter((d) => d.startsWith("WL-")).join(", ")}`, "teal")
                : null,
            ),
            h("p", { class: "fp-story" }, def.story),
            h("p", { class: "fp-opsnote" }, `OPS NOTE: ${def.notes}`),
          ),
          h("section", null,
            SectionLabel("1 · Migration route — where does it run today → where must it run?"),
            h("div", { class: "radio-grid" },
              Object.keys(TYPE_LABELS).map((t) =>
                RadioRow({
                  name: `route-${def.id}`, value: t, current: ws.migrationType,
                  onChange: (v) => { onPatch(def.id, { migrationType: v }); clearClearance(); },
                  label: TYPE_LABELS[t],
                })),
            ),
          ),
          h("section", null,
            SectionLabel("2 · Application migration strategy (CompTIA 2.3)"),
            h("div", { class: "radio-grid" },
              STRATEGY_ORDER.map((st) =>
                RadioRow({
                  name: `strategy-${def.id}`, value: st, current: ws.strategy,
                  onChange: (v) => { onPatch(def.id, { strategy: v }); clearClearance(); },
                  label: STRATEGY_LABELS[st], hint: STRATEGY_DEFS[st],
                })),
            ),
          ),
          h("section", null,
            SectionLabel("3 · Transfer method"),
            h("div", { class: "radio-grid" },
              Object.keys(TRANSFER_LABELS).map((t) =>
                RadioRow({
                  name: `transfer-${def.id}`, value: t, current: ws.transfer,
                  onChange: (v) => { onPatch(def.id, { transfer: v }); clearClearance(); },
                  label: TRANSFER_LABELS[t],
                })),
            ),
          ),
          def.sizing
            ? h("section", null,
                SectionLabel("4 · Resource allocation"),
                h("p", { class: "sizing-current" }, `CURRENT: ${def.sizing.current}`),
                h("p", { class: "sizing-q" }, def.sizing.question),
                h("div", { class: "radio-grid" },
                  def.sizing.options.map((o) =>
                    RadioRow({
                      name: `sizing-${def.id}`, value: o.id, current: ws.sizing,
                      onChange: (v) => { onPatch(def.id, { sizing: v }); clearClearance(); },
                      label: o.label,
                    })),
                ),
              )
            : null,
          h("section", { class: "fp-actions" },
            h("div", { class: "fp-btnrow" },
              TowerButton({ variant: "default", onClick: runClearance, ariaLabel: "Run clearance check" },
                icon(I.ShieldCheck, 16), " Run clearance check"),
              TowerButton({
                variant: "primary",
                disabled: clr === null || (clr.issues.length > 0 && !clr.swapNote) || ws.status !== "cleared",
                onClick: () => { ui.clearanceResult = null; onExecute(def.id); },
                ariaLabel: ws.transfer === "none" ? "File flight plan — no transfer required" : "Execute transfer",
              },
                icon(I.Play, 16),
                ws.transfer === "none" ? " File plan — no transfer required" : " Execute transfer"),
              def.id === "WL-05" || def.id === "WL-06"
                ? TowerButton({
                    size: "sm", variant: "ghost",
                    onClick: () => onFocusObjective(mode === "medium" ? "OBJ-M8" : "OBJ-H6"),
                    ariaLabel: "Jump to the validation objective",
                  }, "validation lives in Radar →")
                : null,
            ),
            clr
              ? h("div", { class: "fp-result", "aria-live": "polite" },
                  clr.issues.length === 0 || clr.swapNote
                    ? h("p", { class: "fp-result--ok" },
                        icon(I.CheckCircle2, 16),
                        clr.swapNote
                          ? " CLEARED — with a nuance: strategy accepted, but CompTIA distinguishes Re-architect (architecture redesign) from Refactor (full in-house rewrite). Check the story wording."
                          : " CLEARED — flight plan consistent with the evidence. You may execute the transfer.")
                    : h("div", { class: "fp-result--hold" },
                        h("p", null, icon(I.XCircle, 16), ` HOLD — inconsistent fields: ${clr.issues.join(", ")}.`),
                        h("p", { class: "fp-result__hint" },
                          "Cross-check the story and the Evidence Locker (DEPMAP, LIC-INV, COMP-REG, BW-TEST, POLICY). The correct values are all derivable — no guessing needed.")),
                  ws.status === "cleared"
                    ? h("p", { class: "fp-cleared-note" },
                        icon(I.AlertTriangle, 14, "c-runway"),
                        " Cleared earlier — re-check before executing if you changed fields.")
                    : null,
                )
              : null,
          ),
        ));
}

// ── Radar console panel ─────────────────────────────────────────────────────

function RadarConsoleView({ state, mode, onRunIntegrity, onRunPerf, onDisposition, onFocusObjective }) {
  const arrived = Object.entries(state.workloads).filter(([, w]) => w.status === "arrived");
  const enroute = Object.entries(state.workloads).filter(([, w]) => w.status === "enroute");
  const anyRan = arrived.some(([, w]) => w.integrityRun);
  const anyPerf = arrived.some(([, w]) => w.perfRun);

  return h("div", { class: "panel-scroll tower-scroll", "data-scrollkey": "panel" },
    h("section", { class: "radar-top" },
      SectionLabel(
        h("span", null, "Transfer radar"),
        h("span", { class: "radar-counts" }, `${enroute.length} en route · ${arrived.length} arrived`),
      ),
      h("div", { class: "radar-flex" },
        h("div", { class: "radar-scope", role: "img", "aria-label": "Radar scope showing transfer telemetry" },
          h("div", { class: "scope-ring scope-ring--3" }),
          h("div", { class: "scope-ring scope-ring--8" }),
          h("div", { class: "scope-h" }),
          h("div", { class: "scope-v" }),
          h("div", { class: "scope-sweep tower-sweep" }),
          enroute.map(([id, w], i) =>
            h("span", {
              key: id, class: "scope-dot scope-dot--teal", "aria-hidden": "true",
              style: { top: `${30 + i * 22}%`, left: `${20 + (w.progress ?? 0) * 0.6}%` },
            })),
          arrived.map(([id], i) =>
            h("span", {
              key: id, class: "scope-dot scope-dot--green", "aria-hidden": "true",
              style: { top: `${18 + i * 13}%`, right: "18%" },
            })),
        ),
        h("div", { class: "radar-readouts", "aria-live": "polite" },
          enroute.length === 0 && arrived.length === 0
            ? h("p", { class: "radar-clear" }, "Scope clear. Execute a transfer in a Flight Plan to populate the scope.")
            : null,
          enroute.map(([id, w]) =>
            h("div", { key: id, class: "radar-line radar-line--teal" },
              `▸ ${id} ${WORKLOAD_MAP[id]?.name} — ${Math.round(w.progress ?? 0)} % · stream active`,
              h("div", { class: "progress-track progress-track--mt" },
                h("div", { class: "progress-fill progress-fill--teal", style: { width: `${w.progress ?? 0}%` } }))),
          ),
          arrived.map(([id]) =>
            h("div", { key: id, class: "radar-line radar-line--green" },
              `✓ ${id} ${WORKLOAD_MAP[id]?.name} — ARRIVED · ${TYPE_LABELS[(WORKLOAD_MAP[id]?.expected.migrationType) ?? "onprem-to-cloud"]}`),
          ),
        ),
      ),
    ),
    h("section", { class: "radar-sweeps" },
      SectionLabel("Validation sweeps — the arrival gate"),
      h("div", { class: "sweeps-row" },
        TowerButton({ onClick: onRunIntegrity, disabled: arrived.length === 0, variant: anyRan ? "success" : "default", ariaLabel: "Run integrity sweep (checksum comparison)" },
          icon(I.ShieldCheck, 16), anyRan ? " Re-run integrity sweep" : " Run integrity sweep"),
        TowerButton({ onClick: onRunPerf, disabled: arrived.length === 0, variant: anyPerf ? "success" : "default", ariaLabel: "Run performance comparison against baselines" },
          icon(I.Gauge, 16), anyPerf ? " Re-run performance comparison" : " Run performance comparison"),
        arrived.length === 0 ? h("p", { class: "sweeps-hint" }, "— enabled once a workload has arrived —") : null,
      ),
      anyRan || anyPerf
        ? h("div", { class: "finding-list", "aria-live": "polite" },
            FINDINGS.map((f) => {
              const ws = state.workloads[f.workload];
              const visible =
                ws?.status === "arrived" &&
                ((f.kind === "integrity" && anyRan) || (f.kind === "performance" && anyPerf) || f.kind === "clean");
              if (!visible) return null;
              const disp = ws?.dispositions[f.id];
              return h("div", { key: f.id, class: `finding ${f.kind === "clean" ? "finding--clean" : "finding--warn"}` },
                h("div", { class: "finding__head" },
                  f.kind === "clean" ? icon(I.CheckCircle2, 16, "c-radar") : icon(I.AlertTriangle, 16, "c-signal"),
                  h("span", { class: `finding__title ${f.kind === "clean" ? "c-radar" : "c-signal"}` }, `${f.workload} · ${f.title}`),
                  Chip(f.kind.toUpperCase(), f.kind === "clean" ? "green" : "red"),
                ),
                h("p", { class: "finding__detail" }, f.detail),
                f.kind !== "clean"
                  ? h("div", { class: "disp" },
                      h("p", { class: "disp__label" }, `Disposition for ${f.id}`),
                      h("div", { class: "disp__grid" },
                        DISPOSITIONS.map((d) =>
                          h("button", {
                            key: d.id,
                            onClick: () => onDisposition(f.id, f.workload, d.id),
                            "aria-pressed": disp === d.id,
                            class: `disp-btn ${disp === d.id ? "disp-btn--active" : ""}`,
                          }, d.label)),
                      ),
                    )
                  : null,
              );
            }),
          )
        : null,
      anyRan || anyPerf
        ? h("div", { class: "radar-check" },
            TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective(mode === "medium" ? "OBJ-M8" : "OBJ-H6"), ariaLabel: "Check the validation objective in the tracker" },
              `→ Check ${mode === "medium" ? "OBJ-M8" : "OBJ-H6"} in the tracker`))
        : null,
    ),
    h("section", { class: "tower-log" },
      h("div", { class: "tower-log__head" },
        icon(I.TowerControl, 16, "c-runway"),
        h("h3", { class: "tower-log__title" }, "Tower log"),
      ),
      h("div", { class: "tower-log__body tower-scroll", "data-scrollkey": "log", "aria-live": "polite", "aria-label": "Tower event log" },
        state.log.length === 0
          ? h("p", { class: "log-line" }, "no entries")
          : h("ol", { class: "log-list" },
              state.log.map((line, i) =>
                h("li", { key: i, class: `log-line ${line.startsWith("!") ? "log-line--signal" : ""}` },
                  line.startsWith("!") ? line.slice(1) : line)),
            ),
      ),
    ),
  );
}

// ── Clearance panel ─────────────────────────────────────────────────────────

function ClearancePanelView({ state, mode, onPatchCutover, onSetWaveOrder, onExecuteCutover, onSetAnswer, onFocusObjective }) {
  const runbookLocked = state.cutover.runbookLocked || state.cutover.executed;
  const seqComplete = state.cutover.seq.length === CUTOVER_STEPS.length;
  const waveLabel = (id) => (WAVE_GROUPS.find((g) => g.id === id) || {}).label ?? id;
  const waveWhy = (id) => (WAVE_GROUPS.find((g) => g.id === id) || {}).why;
  const seqLabel = (id) => (CUTOVER_STEPS.find((s) => s.id === id) || {}).label ?? id;
  const seqDetail = (id) => (CUTOVER_STEPS.find((s) => s.id === id) || {}).detail;

  const moveWave = (index, dir) => {
    const order = [...state.waveOrder];
    const j = index + dir;
    if (j < 0 || j >= order.length) return;
    [order[index], order[j]] = [order[j], order[index]];
    onSetWaveOrder(order);
  };
  const moveSeq = (index, dir) => {
    const seq = [...state.cutover.seq];
    const j = index + dir;
    if (j < 0 || j >= seq.length) return;
    [seq[index], seq[j]] = [seq[j], seq[index]];
    onPatchCutover({ seq });
  };

  return h("div", { class: "panel-scroll tower-scroll clr", "data-scrollkey": "panel" },
    // Wave board
    h("section", { class: "clr-card" },
      SectionLabel(
        h("span", { class: "clr-label" }, icon(I.Layers, 14, "c-runway"), " Wave board — sequence the migration waves"),
        mode === "medium"
          ? TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective("OBJ-M11"), ariaLabel: "Check OBJ-M11" }, "check OBJ-M11")
          : null,
      ),
      OrderList({
        items: WAVE_GROUPS, order: state.waveOrder, onMove: moveWave,
        labelFn: waveLabel, subFn: waveWhy, ariaLabel: "Migration wave order",
      }),
      h("p", { class: "clr-note" }, "Pilot before production · dependents ride with their dependency · the re-architecture lands last."),
    ),

    // Cutover runbook
    h("section", { class: "clr-card" },
      SectionLabel(
        h("span", { class: "clr-label" }, icon(I.ListOrdered, 14, "c-runway"), " Cutover runbook — order 8 steps"),
        TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective(mode === "medium" ? "OBJ-M9" : "OBJ-H5"), ariaLabel: "Check the cutover objective" },
          `check ${mode === "medium" ? "OBJ-M9" : "OBJ-H5"}`),
      ),
      OrderList({
        items: CUTOVER_STEPS, order: state.cutover.seq, onMove: moveSeq,
        labelFn: seqLabel, subFn: seqDetail, ariaLabel: "Cutover step order",
      }),
      h("div", { class: "clr-grid2" },
        h("label", { class: "block" },
          h("span", { class: "field-label" }, "DNS TTL (seconds) — policy: ≤ 300 at T-24h"),
          h("input", {
            type: "number", inputMode: "numeric", min: 0, placeholder: "86400",
            value: state.cutover.ttl ?? "",
            onChange: (e) => onPatchCutover({ ttl: e.target.value === "" ? null : Number(e.target.value) }),
            "aria-label": "DNS TTL in seconds", class: "input",
          }),
        ),
        mode === "hard" ? [
          SelectField({
            label: "Change-freeze window (per POLICY)",
            value: state.cutover.freeze ?? undefined,
            onChange: (v) => onPatchCutover({ freeze: v }),
            options: FREEZE_OPTIONS.map((f) => ({ value: f, label: f })),
          }),
          SelectField({
            label: "Cutover day (freeze ∩ EDI partner slot)",
            value: state.cutover.cutoverDay ?? undefined,
            onChange: (v) => onPatchCutover({ cutoverDay: v }),
            options: CUTOVER_DAY_OPTIONS.map((d) => ({ value: d, label: d })),
          }),
        ] : null,
      ),
      h("div", { class: "clr-btnrow" },
        TowerButton({ variant: "primary", disabled: !seqComplete || runbookLocked, onClick: () => onPatchCutover({ runbookLocked: true }), ariaLabel: "Lock runbook" },
          icon(I.Lock, 16), runbookLocked ? " Runbook locked" : " Lock runbook"),
        TowerButton({ variant: "danger", disabled: !runbookLocked || state.cutover.executed, onClick: onExecuteCutover, ariaLabel: "Begin live cutover simulation" },
          icon(I.RadioTower, 16), state.cutover.executed ? " Cutover executed" : " Begin live cutover (simulation)"),
        !seqComplete ? h("span", { class: "steps-count" }, `${state.cutover.seq.length}/8 steps placed`) : null,
      ),
    ),

    // Rollback
    h("section", { class: "clr-card" },
      SectionLabel(
        h("span", { class: "clr-label" }, icon(I.RotateCcw, 14, "c-runway"), " Rollback — quantified triggers & first action"),
        mode === "medium"
          ? TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective("OBJ-M10"), ariaLabel: "Check OBJ-M10" }, "check OBJ-M10")
          : null,
      ),
      h("fieldset", null,
        h("legend", { class: "legend" }, "Tick the three triggers that justify rollback:"),
        h("div", { class: "trigger-grid" },
          ROLLBACK_TRIGGERS.map((t) => {
            const on = state.cutover.rollbackTriggers.includes(t.id);
            return CheckRow({
              label: h("span", null, h("span", { class: "mono" }, t.id), ` ${t.label}`),
              checked: on, accent: "amber",
              onToggle: () => onPatchCutover({
                rollbackTriggers: on
                  ? state.cutover.rollbackTriggers.filter((x) => x !== t.id)
                  : [...state.cutover.rollbackTriggers, t.id],
              }),
            });
          }),
        ),
      ),
      h("div", { class: "mt-3" },
        h("p", { class: "legend" }, "First rollback action:"),
        h("div", { class: "radio-grid" },
          ROLLBACK_FIRST_OPTIONS.map((o) =>
            RadioRow({
              name: "rollback-first", value: o.id, current: state.cutover.rollbackFirst ?? undefined,
              onChange: (v) => onPatchCutover({ rollbackFirst: v }), label: o.label,
            })),
        ),
      ),
    ),

    // Incident (after cutover)
    state.cutover.executed
      ? h("section", { class: `incident ${mode === "hard" ? "incident--hard" : "incident--medium"}`, "aria-live": "polite" },
          SectionLabel(h("span", { class: "clr-label" }, icon(I.Stethoscope, 14, "c-signal"),
            mode === "hard" ? " INCIDENT — 02:41 · app tier DB connection storms" : " Cutover live run — post-incident review")),
          mode === "hard"
            ? [
                h("p", { class: "incident__text" },
                  "Error rate 8 %, climbing. Trace: the app tier is storming the ",
                  h("span", { class: "mono c-signal" }, "old on-prem DB IP"),
                  " — a cached DNS entry plus a missed connection-config change. Rollback would take ~25 min and re-import divergence risk. Decide, then act. (POLICY: Tier-1 RTO/RPO.)"),
                h("div", { class: "incident__grid" },
                  RadioRow({ name: "incident-decision", value: "fixforward", current: state.cutover.incidentDecision ?? undefined, onChange: (v) => onPatchCutover({ incidentDecision: v }), label: "Fix forward (stay on cloud, patch the path)" }),
                  RadioRow({ name: "incident-decision", value: "rollback", current: state.cutover.incidentDecision ?? undefined, onChange: (v) => onPatchCutover({ incidentDecision: v }), label: "Roll back to on-premises" }),
                  h("label", { class: "block" },
                    h("span", { class: "field-label" }, "Tier-1 RTO (minutes)"),
                    h("input", { type: "number", inputMode: "numeric", "aria-label": "Tier-1 RTO in minutes", value: state.cutover.rto ?? "", onChange: (e) => onPatchCutover({ rto: e.target.value === "" ? null : Number(e.target.value) }), class: "input" }),
                  ),
                  h("label", { class: "block" },
                    h("span", { class: "field-label" }, "Tier-1 RPO (minutes)"),
                    h("input", { type: "number", inputMode: "numeric", "aria-label": "Tier-1 RPO in minutes", value: state.cutover.rpo ?? "", onChange: (e) => onPatchCutover({ rpo: e.target.value === "" ? null : Number(e.target.value) }), class: "input" }),
                  ),
                ),
                h("div", { class: "mt-3" },
                  h("p", { class: "legend" }, "Order the four response actions:"),
                  OrderList({
                    items: INCIDENT_ACTION_OPTIONS,
                    order: state.cutover.incidentActions.length ? state.cutover.incidentActions : INCIDENT_ACTION_OPTIONS.map((a) => a.id),
                    onMove: (index, dir) => {
                      const base = state.cutover.incidentActions.length === 4 ? state.cutover.incidentActions : INCIDENT_ACTION_OPTIONS.map((a) => a.id);
                      const seq = [...base];
                      const j = index + dir;
                      if (j < 0 || j >= seq.length) return;
                      [seq[index], seq[j]] = [seq[j], seq[index]];
                      onPatchCutover({ incidentActions: seq });
                    },
                    labelFn: (id) => (INCIDENT_ACTION_OPTIONS.find((a) => a.id === id) || {}).label ?? id,
                    ariaLabel: "Incident response action order",
                  }),
                ),
                h("div", { class: "mt-3" },
                  TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective("OBJ-H7"), ariaLabel: "Check OBJ-H7" }, "→ Check OBJ-H7 in the tracker")),
              ]
            : h("p", { class: "incident__text" },
                "The run held: DNS switch propagated in ~40 s (TTL 300), smoke tests green, UAT signed off, hypercare started. In Hard mode this same night develops an incident at 02:41 — if you dare."),
        )
      : null,

    // Hard: transfer scheduling
    mode === "hard"
      ? h("section", { class: "clr-card" },
          SectionLabel(
            h("span", { class: "clr-label" }, icon(I.Calculator, 14, "c-runway"), " Transfer scheduling — 250 Mbps, one pipe"),
            TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective("OBJ-H3"), ariaLabel: "Check OBJ-H3" }, "check OBJ-H3"),
          ),
          h("p", { class: "clr-note" }, "WL-05 3.2 TB · WL-12 0.8 TB · WL-06 1.1 TB — one 250 Mbps direct connection. time = size × 8 ÷ bandwidth."),
          h("div", { class: "radio-grid" },
            RadioRow({ name: "plan", value: "serial", current: state.transferPlan.plan ?? undefined, onChange: (v) => onSetAnswer("TP-PLAN", v), label: "Serial dedication — one stream at a time, full 250 Mbps each, business priority first" }),
            RadioRow({ name: "plan", value: "parallel", current: state.transferPlan.plan ?? undefined, onChange: (v) => onSetAnswer("TP-PLAN", v), label: "Parallel-equal — three streams, ~83 Mbps each, all finish together" }),
          ),
          h("div", { class: "clr-grid2" },
            h("label", { class: "block" },
              h("span", { class: "field-label" }, "TOTAL hours to move all three (one decimal)"),
              h("input", { type: "text", inputMode: "decimal", "aria-label": "Total transfer hours", value: state.transferPlan.totalHours, onChange: (e) => onSetAnswer("TP-HOURS", e.target.value), placeholder: "e.g. 45.3", class: "input" }),
            ),
            SelectField({
              label: "First workload on the pipe",
              value: state.transferPlan.first ?? undefined,
              onChange: (v) => onSetAnswer("TP-FIRST", v),
              options: ["WL-05", "WL-12", "WL-06"].map((id) => ({ value: id, label: `${id} ${(WORKLOAD_MAP[id] || {}).name}` })),
            }),
          ),
        )
      : null,

    // Hard: dependency audit
    mode === "hard"
      ? h("section", { class: "clr-card" },
          SectionLabel(
            h("span", { class: "clr-label" }, icon(I.Network, 14, "c-runway"), " Dependency audit — what breaks under lift-and-shift?"),
            TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective("OBJ-H4"), ariaLabel: "Check OBJ-H4" }, "check OBJ-H4"),
          ),
          h("div", { class: "dep-list" },
            AUDIT_DEPS.map((d) => {
              const on = state.audit.deps.includes(d.id);
              return h("div", { key: d.id, class: "dep-item" },
                CheckRow({
                  label: h("span", null, h("span", { class: "mono c-dim" }, d.id), ` — ${d.label}`),
                  checked: on, accent: "amber",
                  onToggle: () => onSetAnswer("AUDIT-DEP", on ? state.audit.deps.filter((x) => x !== d.id).join(",") : [...state.audit.deps, d.id].join(",")),
                }),
                on && AUDIT_FIX_OPTIONS[d.id]
                  ? h("div", { class: "dep-fix" },
                      SelectField({
                        label: `Remediation for ${d.id}`,
                        value: state.audit.fixes[d.id] ?? undefined,
                        onChange: (v) => onSetAnswer("AUDIT-FIX", `${d.id}:${v}`),
                        options: AUDIT_FIX_OPTIONS[d.id].map((o) => ({ value: o.id, label: o.label })),
                      }))
                  : null,
              );
            }),
          ),
        )
      : null,

    // Hard: compliance audit
    mode === "hard"
      ? h("section", { class: "clr-card" },
          SectionLabel(
            h("span", { class: "clr-label" }, icon(I.Scale, 14, "c-runway"), " Compliance audit — tick exactly the 4 violations"),
            TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective("OBJ-H8"), ariaLabel: "Check OBJ-H8" }, "check OBJ-H8"),
          ),
          h("div", { class: "radio-grid" },
            VIOLATION_OPTIONS.map((v) =>
              CheckRow({
                label: h("span", null, h("span", { class: "mono" }, v.id), ` — ${v.label}`),
                checked: state.audit.violations.includes(v.id), accent: "rose",
                onToggle: () => onSetAnswer("VIOLATION", state.audit.violations.includes(v.id)
                  ? state.audit.violations.filter((x) => x !== v.id).join(",")
                  : [...state.audit.violations, v.id].join(",")),
              })),
          ),
        )
      : null,

    // Hard: validation verdict (H6)
    mode === "hard"
      ? h("section", { class: "clr-card" },
          SectionLabel(
            h("span", { class: "clr-label" }, icon(I.Stethoscope, 14, "c-runway"), " Validation verdict — root cause & corrective order"),
            TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective("OBJ-H6"), ariaLabel: "Check OBJ-H6" }, "check OBJ-H6"),
          ),
          h("p", { class: "clr-note" }, "Evidence: WL-05 disk D checksum mismatch + p95 3× baseline. Run the sweeps in Radar first."),
          h("div", { class: "radio-grid" },
            HARD_ANSWER_FIELDS["OBJ-H6"].causes.map((c) =>
              RadioRow({ name: "h6-cause", value: c.id, current: state.triage.changes["H6-CAUSE"], onChange: (v) => onSetAnswer("H6-CAUSE", v), label: c.label })),
          ),
          h("div", { class: "mt-3" },
            h("p", { class: "legend" }, "Order the corrective actions:"),
            OrderList({
              items: HARD_ANSWER_FIELDS["OBJ-H6"].actions,
              order: ((state.triage.changes["H6-ACTIONS"]?.split(",").filter(Boolean).length ?? 0) === 4)
                ? state.triage.changes["H6-ACTIONS"].split(",").filter(Boolean)
                : HARD_ANSWER_FIELDS["OBJ-H6"].actions.map((a) => a.id),
              onMove: (index, dir) => {
                const stored = state.triage.changes["H6-ACTIONS"]?.split(",").filter(Boolean) ?? [];
                const base = stored.length === 4 ? stored : HARD_ANSWER_FIELDS["OBJ-H6"].actions.map((a) => a.id);
                const seq = [...base];
                const j = index + dir;
                if (j < 0 || j >= seq.length) return;
                [seq[index], seq[j]] = [seq[j], seq[index]];
                onSetAnswer("H6-ACTIONS", seq.join(","));
              },
              labelFn: (id) => (HARD_ANSWER_FIELDS["OBJ-H6"].actions.find((a) => a.id === id) || {}).label ?? id,
              ariaLabel: "Corrective action order for the validation failure",
            }),
          ),
        )
      : null,

    // Hard: TCO decision
    mode === "hard"
      ? h("section", { class: "clr-card" },
          SectionLabel(
            h("span", { class: "clr-label" }, icon(I.Euro, 14, "c-runway"), " TCO decision — pick the proposal the facts support"),
            TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective("OBJ-H9"), ariaLabel: "Check OBJ-H9" }, "check OBJ-H9"),
          ),
          h("div", { class: "radio-grid" },
            PROPOSAL_OPTIONS.map((p) =>
              RadioRow({ name: "proposal", value: p.id, current: state.audit.proposal ?? undefined, onChange: (v) => onSetAnswer("PROPOSAL", v), label: p.label })),
          ),
          h("p", { class: "legend mt-3" }, "Tick the two genuine exit-cost (vendor lock-in) elements:"),
          h("div", { class: "radio-grid" },
            EXIT_COST_OPTIONS.map((e) =>
              CheckRow({
                label: h("span", null, h("span", { class: "mono" }, e.id), ` — ${e.label}`),
                checked: state.audit.exitCosts.includes(e.id), accent: "amber",
                onToggle: () => onSetAnswer("EXITCOST", state.audit.exitCosts.includes(e.id)
                  ? state.audit.exitCosts.filter((x) => x !== e.id).join(",")
                  : [...state.audit.exitCosts, e.id].join(",")),
              })),
          ),
        )
      : null,

    mode === "medium"
      ? h("p", { class: "clr-pointer" },
          "Remember: wave order (OBJ-M11) and runbook order (OBJ-M9) are validated from the tracker. Dependency questions (OBJ-M3) are answered inside the Objectives tab after reading DEPMAP.")
      : null,
  );
}

// ── Evidence locker ─────────────────────────────────────────────────────────

function DocBody(doc) {
  return h("div", { class: "doc-body" },
    doc.body.map((line, i) => {
      if (line.startsWith("## ")) {
        return h("h4", { key: i, class: "doc-h4" }, line.slice(3));
      }
      if (line.startsWith("| ")) {
        const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
        return h("div", { key: i, class: "doc-row" },
          cells.map((c, j) => h("span", { key: j, class: j === 0 ? "doc-row__key" : "doc-row__val" }, c)));
      }
      if (line.startsWith("- ")) {
        return h("p", { key: i, class: "doc-bullet" }, h("span", { class: "doc-bullet__dot", "aria-hidden": "true" }), line.slice(2));
      }
      return h("p", { key: i }, line);
    }),
  );
}

function EvidenceLockerView({ state, mode, onSetAnswer, onFocusObjective }) {
  const doc = ui.openDoc ? EVIDENCE_MAP[ui.openDoc] : null;
  const toggleDoc = (id) => {
    const on = state.triage.docs.includes(id);
    onSetAnswer("TRIAGE-DOCS", on ? state.triage.docs.filter((x) => x !== id).join(",") : [...state.triage.docs, id].join(","));
  };
  return h("div", { class: "panel-scroll tower-scroll", "data-scrollkey": "panel" },
    SectionLabel("Evidence locker · 11 items · all synthetic training data"),
    h("div", { class: "ev-grid" },
      EVIDENCE_DOCS.map((d) =>
        h("button", {
          key: d.id, "data-docid": d.id,
          onClick: (e) => openDocViewer(d.id, e.currentTarget),
          "aria-label": `Open document ${d.title}`,
          class: "ev-card",
        },
          h("span", { class: "ev-card__title-row" },
            icon(I.FileText, 16, "c-teal"),
            h("span", { class: "ev-card__title" }, d.title),
            h("span", { class: "ev-card__id" }, d.id),
          ),
          h("span", { class: "ev-card__type" }, d.type),
          h("span", { class: "ev-card__meta" }, d.meta),
        )),
    ),
    mode === "hard"
      ? h("section", { class: "triage-card" },
          SectionLabel(
            h("span", { class: "clr-label" }, icon(I.SearchCheck, 14, "c-runway"), " Triage verdict — 3 docs that change the plan"),
            TowerButton({ size: "sm", variant: "ghost", onClick: () => onFocusObjective("OBJ-H1"), ariaLabel: "Check OBJ-H1" }, "check OBJ-H1"),
          ),
          h("p", { class: "triage-hint" },
            "Tick the three documents that materially change WHAT moves, HOW it transfers, or WHEN it may move — then record the required change per document."),
          h("div", { class: "radio-grid" },
            TRIAGE_DOCS.map((d) =>
              CheckRow({ label: d.label, checked: state.triage.docs.includes(d.id), accent: "amber", onToggle: () => toggleDoc(d.id) })),
          ),
          h("div", { class: "triage-selects" },
            ["BW-TEST", "LIC-INV", "COMP-REG"].map((d) =>
              h("label", { key: d, class: "block" },
                h("span", { class: "field-label" }, `Required plan change from ${d}:`),
                h("select", {
                  value: state.triage.changes[d] ?? "",
                  onChange: (e) => onSetAnswer(`TRIAGE-CHANGE:${d}`, e.target.value),
                  "aria-label": `Required plan change from ${d}`,
                  class: "input select-field",
                },
                  h("option", { value: "", disabled: true }, "— select the change —"),
                  TRIAGE_CHANGE_OPTIONS[d].map((o) => h("option", { value: o.id }, o.label)),
                ))),
          ),
        )
      : null,
    doc ? EvidenceDocViewer(doc) : null,
  );
}

function EvidenceDocViewer(doc) {
  return h("div", {
    class: "viewer-backdrop", role: "dialog", "aria-modal": "true", "aria-label": `Document viewer: ${doc.title}`,
    onClick: () => closeDocViewer(),
  },
    h("div", { class: "viewer tower-scroll", onClick: (e) => e.stopPropagation() },
      h("div", { class: "viewer__head" },
        h("div", null,
          h("div", { class: "viewer__title-row" },
            icon(I.FolderOpen, 20, "c-teal"),
            h("h2", { class: "viewer__title" }, doc.title),
          ),
          h("p", { class: "viewer__meta" }, `${doc.id} · ${doc.type} · ${doc.meta}`),
        ),
        h("button", { ref: (n) => { ui.viewerCloseBtn = n; }, onClick: () => closeDocViewer(), "aria-label": "Close document", class: "overlay-close" },
          icon(I.X, 20)),
      ),
      DocBody(doc),
      h("div", { class: "viewer__footer" }, Chip("SYNTHETIC DOCUMENT · MERIDIAN FREIGHT GROUP (FICTIONAL)")),
    ),
  );
}

// ── Learn panel ─────────────────────────────────────────────────────────────

function LearnPanelView() {
  return h("div", { class: "panel-scroll tower-scroll learn", "data-scrollkey": "panel", "aria-label": "Knowledge core" },
    h("section", null,
      SectionLabel(h("span", { class: "clr-label" }, icon(I.BookOpen, 14, "c-runway"), " What workload migration is")),
      KNOWLEDGE_CORE.intro.map((p, i) => h("p", { key: i, class: "learn-p" }, p)),
    ),
    h("section", null,
      SectionLabel(h("span", { class: "clr-label" }, icon(I.Layers3, 14, "c-runway"), " The six application migration strategies (2.3)")),
      h("div", { class: "learn-grid2" },
        KNOWLEDGE_CORE.strategies.map((s) =>
          h("div", { key: s.name, class: "strategy-card" },
            h("p", { class: "strategy-card__name" }, s.name, " ",
              h("span", { class: "strategy-card__aka" }, `aka ${s.aka}`)),
            h("p", { class: "strategy-card__text" }, s.text))),
      ),
      h("p", { class: "clr-note" },
        "Lab convention: Re-architect = redesign the architecture (WL-01). Refactor = full in-house rip-and-replace rewrite (WL-07). CompTIA's material describes Refactor as \"completely rearchitected to become cloud ready\" — know both readings; the scenario wording decides."),
    ),
    h("section", null,
      SectionLabel("Three migration types (2.3)"),
      h("ul", { class: "type-list" },
        KNOWLEDGE_CORE.types.map((t, i) =>
          h("li", { key: i, class: "type-item" }, h("span", { class: "type-dot", "aria-hidden": "true" }), t)),
      ),
    ),
    h("section", null,
      SectionLabel(h("span", { class: "clr-label" }, icon(I.Lightbulb, 14, "c-runway"), " The 11 considerations — where each bites in this estate")),
      h("div", { class: "kv-table" },
        KNOWLEDGE_CORE.considerations.map(([k, v], i) =>
          h("div", { key: k, class: `kv-row ${i % 2 ? "kv-row--alt" : ""}` },
            h("span", { class: "kv-key" }, k),
            h("span", { class: "kv-val" }, v))),
      ),
    ),
    h("section", null,
      SectionLabel(h("span", { class: "clr-label" }, icon(I.Workflow, 14, "c-runway"), " Planning & execution lifecycle [lesson extension]")),
      h("ol", { class: "lifecycle-list" },
        KNOWLEDGE_CORE.lifecycle.map(([k, v], i) =>
          h("li", { key: k, class: "lifecycle-item" },
            h("span", { class: "lifecycle-num" }, String(i + 1)),
            h("span", { class: "lifecycle-text" }, h("span", { class: "lifecycle-key" }, `${k}: `), v))),
      ),
    ),
    h("section", null,
      SectionLabel(h("span", { class: "clr-label" }, icon(I.Globe2, 14, "c-runway"), " Real-world reference points (public accounts)")),
      h("div", { class: "learn-grid2" },
        KNOWLEDGE_CORE.realWorld.map(([name, text]) =>
          h("div", { key: name, class: "strategy-card" },
            h("p", { class: "realworld-name" }, name),
            h("p", { class: "realworld-text" }, text))),
      ),
    ),
    h("section", { class: "exam-tips" },
      SectionLabel("Exam-pattern tips (CV0-004 2.3)"),
      h("ul", { class: "type-list" },
        KNOWLEDGE_CORE.examTips.map((t, i) =>
          h("li", { key: i, class: "exam-tip" }, h("span", { class: "exam-tip__arrow" }, "▸"), t)),
      ),
    ),
    h("p", { class: "learn-footer" }, `STRATEGY TERMS IN THIS LAB: ${Object.values(STRATEGY_LABELS).join(" · ")}`),
  );
}

// ── Debrief panel ───────────────────────────────────────────────────────────

function DebriefPanelView() {
  return h("div", { class: "panel-scroll tower-scroll learn", "data-scrollkey": "panel", "aria-label": "Debrief and field notes" },
    h("section", null,
      SectionLabel(h("span", { class: "clr-label" }, icon(I.ClipboardCheck, 14, "c-radar"), " Validation opportunities — what a migration engineer measures")),
      h("div", { class: "kv-table" },
        DEBRIEF.validationOps.map(([k, v], i) =>
          h("div", { key: k, class: `kv-row ${i % 2 ? "kv-row--alt" : ""}` },
            h("span", { class: "kv-key kv-key--radar" }, k),
            h("span", { class: "kv-val" }, v))),
      ),
    ),
    h("section", null,
      SectionLabel(h("span", { class: "clr-label" }, icon(I.ShieldCheck, 14, "c-radar"), " Control recommendations (objective 2.3 mapping)")),
      h("div", { class: "kv-table" },
        DEBRIEF.controls.map(([k, v], i) =>
          h("div", { key: k, class: `kv-row ${i % 2 ? "kv-row--alt" : ""}` },
            h("span", { class: "kv-key" }, k),
            h("span", { class: "kv-val" }, v))),
      ),
    ),
    h("div", { class: "bt-grid" },
      h("section", { class: "bt-col bt-col--blue" },
        SectionLabel("Blue-team takeaways — make the migration boring"),
        h("ul", { class: "type-list" },
          DEBRIEF.blueTeam.map((t, i) =>
            h("li", { key: i, class: "bt-item" }, h("span", { class: "bt-mark bt-mark--check" }, "✓"), t)),
        ),
      ),
      h("section", { class: "bt-col bt-col--red" },
        SectionLabel(h("span", { class: "clr-label" }, icon(I.Skull, 14, "c-signal"), " Failure-mindset takeaways — how plans die")),
        h("ul", { class: "type-list" },
          DEBRIEF.redTeam.map((t, i) =>
            h("li", { key: i, class: "bt-item" }, h("span", { class: "bt-mark bt-mark--bang" }, "!"), t)),
        ),
      ),
    ),
    h("section", null,
      SectionLabel(h("span", { class: "clr-label" }, icon(I.Compass, 14, "c-runway"), " What to learn next")),
      h("ul", { class: "type-list" },
        DEBRIEF.nextSteps.map((t, i) =>
          h("li", { key: i, class: "type-item" }, h("span", { class: "type-dot", "aria-hidden": "true" }), t)),
      ),
    ),
    h("section", { class: "clr-card" },
      SectionLabel("Official references (open in a new tab)"),
      h("ul", { class: "links-list" },
        DEBRIEF.links.map((l) =>
          h("li", { key: l.url },
            h("a", { href: l.url, target: "_blank", rel: "noopener noreferrer", class: "link-btn" },
              icon(I.ExternalLink, 16), l.label))),
      ),
      h("p", { class: "links-note" }, "LINKS OPEN THE OFFICIAL COMPTIA PAGES IN A NEW TAB · NO EXTERNAL APIs USED BY THIS LAB"),
    ),
  );
}

// ── Objectives tracker ──────────────────────────────────────────────────────

function parseOptions(options) {
  return options.map((o) => {
    const idx = o.indexOf("|");
    return idx === -1 ? { value: o, label: o } : { value: o.slice(0, idx), label: o.slice(idx + 1) };
  });
}

function AnswerFields(obj, state, onSetAnswer) {
  const fields = MEDIUM_ANSWER_FIELDS[obj.id];
  if (!fields) return null;
  return h("div", { class: "answer-panel" },
    h("p", { class: "answer-panel__head" }, "Answer panel — answers live here, evidence lives in the consoles"),
    fields.map((f) => {
      if (CHECKBOX_FIELDS.has(f.key)) {
        const on = state.triage.changes[f.key] === "1";
        return CheckRow({
          label: f.label, checked: on, accent: "amber",
          onToggle: () => onSetAnswer(f.key, on ? "" : "1"),
        });
      }
      if (f.options.length === 0) {
        return h("label", { key: f.key, class: "block" },
          h("span", { class: "field-label" }, f.label),
          h("input", {
            type: "text", inputMode: "decimal", placeholder: "e.g. 52",
            value: state.triage.changes[f.key] ?? "",
            onChange: (e) => onSetAnswer(f.key, e.target.value),
            "aria-label": f.label, class: "input answer-panel__num",
          }));
      }
      return h("label", { key: f.key, class: "block" },
        h("span", { class: "field-label" }, f.label),
        h("select", {
          value: state.triage.changes[f.key] ?? "",
          onChange: (e) => onSetAnswer(f.key, e.target.value),
          "aria-label": f.label, class: "input select-field",
        },
          h("option", { value: "", disabled: true }, "— select —"),
          parseOptions(f.options).map((o) => h("option", { value: o.value }, o.label)),
        ));
    }),
  );
}

function HintStack(hints, used, solved, onHint) {
  return h("div", { class: "hint-stack" },
    TowerButton({
      size: "sm", variant: "ghost", onClick: onHint,
      disabled: solved || used >= hints.length,
      ariaLabel: `Reveal hint level ${Math.min(used + 1, hints.length)} of ${hints.length}`,
    },
      icon(I.Lightbulb, 14),
      used >= hints.length ? " all hints shown" : solved ? " hints" : ` hint ${used + 1}/${hints.length}`,
      icon(I.ChevronDown, 12)),
    hints.slice(0, used).map((hh) =>
      h("p", { key: hh.level, class: "hint-item" },
        h("span", { class: "hint-item__level" }, `HINT L${hh.level}: `), hh.text)),
  );
}

function ObjectivesPanelView({ state, mode, objectives, onCheck, onHint, onSetAnswer, onGoTo }) {
  const firstUnsolved = objectives.find((o) => !(state.objectives[o.id] ?? {}).solved);
  return h("div", { class: "panel-scroll tower-scroll objs", "data-scrollkey": "panel", "aria-label": "Objectives tracker" },
    mode === "medium" && firstUnsolved
      ? h("div", { class: "next-task" },
          icon(I.Crosshair, 16),
          h("p", null,
            h("span", { class: "next-task__id" }, `NEXT TASK · ${firstUnsolved.id}: `),
            `${firstUnsolved.title}. `,
            `${objectives.filter((o) => (state.objectives[o.id] ?? {}).solved).length} of ${objectives.length} complete.`))
      : null,
    objectives.map((o) => {
      const prog = state.objectives[o.id] ?? { solved: false, attempts: 0, hintsUsed: 0, firstTry: false };
      const fb = ui.feedbacks[o.id];
      const isCurrent = mode === "medium" && firstUnsolved?.id === o.id;
      return h("div", {
        key: o.id, "data-obj": o.id,
        class: `obj-card ${prog.solved ? "obj-card--solved" : isCurrent ? "obj-card--current" : ""}`,
      },
        h("div", { class: "obj-head" },
          h("span", { class: `obj-id ${prog.solved ? "c-radar" : ""}` }, o.id),
          PillarBadge(o.pillar),
          h("span", { class: `obj-state ${prog.solved ? "obj-state--pass" : ""}` },
            prog.solved ? "PASS" : prog.attempts > 0 ? `ATTEMPT ×${prog.attempts}` : "OPEN"),
        ),
        h("h3", { class: "obj-title" }, o.title),
        h("p", { class: "obj-instr" }, o.instruction),
        h("div", { class: "obj-links" },
          h("button", {
            onClick: () => onGoTo(NAV[o.id] ?? { tab: "learn" }),
            class: "where-chip",
            "aria-label": `Where to look: ${o.where}`,
          }, icon(I.Eye, 14), ` ${o.where}`),
          Chip(o.anchor, "dim", "obj-anchor"),
        ),
        AnswerFields(o, state, onSetAnswer),
        h("div", { class: "obj-actions" },
          TowerButton({
            size: "sm", variant: prog.solved ? "success" : "primary",
            onClick: () => onCheck(o.id), ariaLabel: `Check results for ${o.id}`,
          }, icon(I.CheckCircle2, 14), " CHECK RESULTS"),
          mode === "medium"
            ? HintStack(o.hints, prog.hintsUsed, prog.solved, () => onHint(o.id))
            : (!prog.solved
                ? TowerButton({
                    size: "sm", variant: "ghost", onClick: () => onHint(o.id), disabled: prog.hintsUsed >= 1,
                    ariaLabel: `Use the single optional nudge for ${o.id} — costs score`,
                  }, icon(I.Lightbulb, 14), prog.hintsUsed >= 1 ? " nudge used (−stars)" : " use nudge (costs stars)")
                : null),
          mode === "hard" && prog.solved && prog.hintsUsed > 0
            ? h("span", { class: "nudge-note" }, "nudge used")
            : null,
        ),
        fb
          ? h("div", { class: `feedback ${fb.pass ? "feedback--pass" : "feedback--fail"}`, "aria-live": "polite" },
              h("p", { class: "feedback__title" },
                fb.pass ? icon(I.CheckCircle2, 16) : icon(I.XCircle, 16),
                ` ${fb.title}`),
              h("p", { class: "feedback__detail" }, fb.detail),
              fb.pass
                ? h("p", { class: "feedback__why" },
                    h("span", { class: "feedback__why-label" }, "Why it matters: "), o.feedback)
                : null,
            )
          : null,
      );
    }),
    h("div", { class: "pillars-note" },
      h("p", null, icon(I.Lock, 14),
        ` Pillars: ${Object.entries(PILLAR_NAMES).map(([p, n]) => `${p} ${n}`).join(" · ")}. Completing all objectives in your mode is the mastery bar — the quiz then locks in the concepts.`)),
  );
}

// ── Quiz panel ──────────────────────────────────────────────────────────────

function QuizPanelView({ state, mode, solvedCount, totalObjectives, onAnswer, onReveal, onNext, onStart, onRetake }) {
  const revealed = state.quiz.revealed;
  const quiz = mode === "medium" ? MEDIUM_QUIZ : HARD_QUIZ;
  const gate = mode === "medium" ? 8 : 5;
  const q = quiz[state.quiz.index];
  const chosen = state.quiz.answers[state.quiz.index] ?? null;
  const lastAnswer = state.quiz.answers[state.quiz.index - 1];
  const correctCount = state.quiz.answers.filter((a, i) => a !== null && a === quiz[i].answer).length;

  if (solvedCount < gate) {
    return h("div", { class: "quiz-center" },
      h("div", { class: "quiz-card" },
        icon(I.ClipboardList, 32, "c-dim"),
        h("h2", { class: "quiz-card__title" }, "Knowledge check is armed — after practice"),
        h("p", { class: "quiz-card__desc" },
          mode === "medium"
            ? "Solve at least 8 objectives first — the quiz is calibrated to test what the practice teaches. Then come back and lock in the concepts."
            : "Solve at least 5 objectives first — these are scenario-triage items, not recall cards."),
        h("p", { class: "quiz-gate-progress" }, `Progress: ${solvedCount}/${totalObjectives} objectives · gate ${gate}`),
      ));
  }

  if (!state.quiz.started) {
    return h("div", { class: "quiz-center" },
      h("div", { class: "quiz-card" },
        icon(I.ClipboardList, 32, "c-runway"),
        h("h2", { class: "quiz-card__title" }, `Knowledge check · ${quiz.length} ${mode === "medium" ? "concept" : "scenario"} items`),
        h("p", { class: "quiz-card__desc" },
          mode === "medium"
            ? "One question at a time. After each answer you get the explanation — wrong answers teach, they don't punish."
            : "Triage scenarios. Pick the defensible decision; every option comes with the reasoning on reveal."),
        TowerButton({ variant: "primary", className: "mt-4", onClick: onStart, ariaLabel: "Start the knowledge check" },
          "Start the check ", icon(I.ArrowRight, 16)),
      ));
  }

  if (state.quiz.submitted || state.quiz.index >= quiz.length) {
    const score = Math.round((correctCount / quiz.length) * 100);
    return h("div", { class: "panel-scroll tower-scroll", "data-scrollkey": "panel", "aria-label": "Quiz results" },
      h("div", { class: "quiz-results" },
        h("div", { class: "quiz-card" },
          icon(I.Trophy, 32, "c-runway"),
          h("h2", { class: "quiz-score" }, `${correctCount}/${quiz.length} correct · ${score} %`),
          h("p", { class: "quiz-card__desc" },
            score >= 85
              ? "Tower-certified. Your decisions would survive a real cutover night."
              : score >= 60
                ? "Solid — review the misses below, then re-fly the related objectives."
                : "Worth another lap: re-read the Learn tab, re-run the failed checks, then retake."),
          TowerButton({ variant: "default", className: "mt-4", onClick: onRetake, ariaLabel: "Retake the knowledge check" },
            icon(I.RotateCcw, 16), " Retake"),
        ),
        SectionLabel("Review"),
        h("ol", { class: "review-list" },
          quiz.map((qq, i) => {
            const a = state.quiz.answers[i];
            const ok = a === qq.answer;
            return h("li", { key: qq.id, class: "review-item" },
              h("p", { class: "review-item__q" },
                ok ? icon(I.CheckCircle2, 16, "c-radar") : icon(I.XCircle, 16, "c-signal"),
                ` ${qq.question}`),
              h("p", { class: "review-item__correct" }, `correct: ${qq.options[qq.answer]}`),
              h("p", { class: "review-item__expl" }, qq.explanation),
            );
          })),
      ));
  }

  return h("div", { class: "panel-scroll tower-scroll", "data-scrollkey": "panel", "aria-label": "Knowledge check" },
    h("div", { class: "quiz-run" },
      h("div", { class: "quiz-meta" },
        Chip(`Q${state.quiz.index + 1}/${quiz.length}`, "amber"),
        Chip(`${correctCount} correct so far`),
      ),
      q.scenario
        ? h("div", { class: "scenario-box" },
            h("p", { class: "scenario-box__label" }, "Scenario"),
            h("p", { class: "scenario-box__text" }, q.scenario))
        : null,
      h("h2", { class: "quiz-question" }, q.question),
      h("div", { class: "option-list" },
        q.options.map((opt, i) => {
          const isChosen = chosen === i;
          // R3 color contract: only the chosen option is colored; the correct
          // option is NEVER revealed in green on a wrong submission.
          const cls = !revealed
            ? isChosen ? "option-btn--chosen" : ""
            : isChosen && i === q.answer
              ? "option-btn--correct"
              : isChosen && i !== q.answer
                ? "option-btn--wrong"
                : "";
          return h("button", {
            key: i, disabled: revealed, "aria-pressed": isChosen,
            onClick: () => onAnswer(i),
            class: `option-btn ${cls}`,
          },
            h("span", { class: "option-letter" }, String.fromCharCode(65 + i)),
            opt,
          );
        }),
      ),
      revealed && chosen !== null
        ? h("div", { class: `reveal-box ${chosen === q.answer ? "reveal-box--ok" : "reveal-box--no"}`, "aria-live": "polite" },
            h("p", { class: "reveal-box__title" }, chosen === q.answer ? "Correct." : "Not the defensible answer."),
            h("p", { class: "reveal-box__expl" }, q.explanation),
            TowerButton({ variant: "primary", size: "sm", className: "mt-2", onClick: onNext, ariaLabel: "Next question" },
              state.quiz.index + 1 >= quiz.length ? "See results" : "Next", " ", icon(I.ArrowRight, 14)),
          )
        : null,
      !revealed
        ? TowerButton({
            variant: "default", className: "mt-3", disabled: chosen === null,
            onClick: () => { onAnswer(chosen); onReveal(); },
            ariaLabel: "Submit answer",
          }, "Submit answer")
        : null,
      lastAnswer === null && !revealed
        ? h("p", { class: "quiz-pick-hint" }, "pick an option to unlock submit")
        : null,
    ));
}

// ── Completion modal ────────────────────────────────────────────────────────

/** R8: focus areas derived from THIS student's actual evidence. */
function deriveFocusAreas(state, objectives) {
  const quiz = state.mode === "medium" ? MEDIUM_QUIZ : HARD_QUIZ;
  const areas = [];
  const missTopics = new Map();
  let answered = 0;
  quiz.forEach((q, i) => {
    const a = state.quiz.answers[i];
    if (a === null || a === undefined) return;
    answered += 1;
    if (a !== q.answer) missTopics.set(q.topic, (missTopics.get(q.topic) ?? 0) + 1);
  });
  if (answered < quiz.length && !state.quiz.submitted) {
    areas.push({
      area: "Knowledge check still pending",
      why: `${answered} of ${quiz.length} questions answered — the score and its focus signals are not final yet.`,
      where: "Open the Quiz tab, take the full check, then reopen this report for the final focus list.",
    });
  }
  for (const [topic, n] of missTopics) {
    areas.push({
      area: topic,
      why: `${n} knowledge-check ${n === 1 ? "miss" : "misses"} — the concept did not fully lock in.`,
      where: "Re-run the related objectives, then re-read the Learn tab section for it.",
    });
  }
  for (const o of objectives) {
    const p = state.objectives[o.id];
    if (p?.solved && p.attempts > 1) {
      areas.push({
        area: `${o.id} — ${o.title}`,
        why: `took ${p.attempts} attempts before the check passed.`,
        where: `Re-read the check feedback for ${o.id} and re-derive it once more without hints.`,
      });
    }
  }
  for (const o of objectives) {
    const p = state.objectives[o.id];
    if (p?.solved && p.hintsUsed > 0) {
      areas.push({
        area: `${o.id} — ${o.title}`,
        why: `solved with ${p.hintsUsed} ${p.hintsUsed === 1 ? "hint" : "hints"} — try it cold next time.`,
        where: "Re-fly this objective from scratch in a fresh pass.",
      });
    }
  }
  if (areas.length === 0) {
    const otherMode = state.mode === "medium" ? "Hard" : "Medium";
    areas.push({
      area: "No weak spots found in this run",
      why: "every objective on the first attempt, no hints, knowledge check clean.",
      where: `Stretch goal: re-fly the tower in ${otherMode} mode — ${otherMode === "Hard" ? "strict validation and the 02:41 incident" : "guided hints and tolerant checks"} will probe the same concepts differently.`,
    });
  }
  return areas.slice(0, 6);
}

function CompletionModalView({ state, objectives, onClose }) {
  const quiz = state.mode === "medium" ? MEDIUM_QUIZ : HARD_QUIZ;
  const correctCount = state.quiz.answers.filter((a, i) => a !== null && a === quiz[i]?.answer).length;
  const score = computeScore(state, correctCount, quiz.length);
  const byPillar = { P1: [], P2: [], P3: [], P4: [] };
  for (const o of objectives) {
    const p = state.objectives[o.id];
    if (p?.solved) byPillar[o.pillar].push(o);
  }
  const focusAreas = deriveFocusAreas(state, objectives);

  return h("div", {
    class: "overlay-center", role: "dialog", "aria-modal": "true", "aria-label": "Lab completion report",
  },
    h("div", { class: "report-card anim-pop" },
      h("div", { class: "report-head" },
        h("div", null,
          h("p", { class: "report-kicker" }, "FLIGHT REPORT · PROGRAMME HELVETICA"),
          h("h2", { class: "report-title" }, icon(I.Trophy, 28, "c-runway"), " Tower cleared"),
        ),
        h("button", { ref: (n) => { ui.reportCloseBtn = n; }, onClick: onClose, "aria-label": "Close completion report", class: "overlay-close" },
          icon(I.X, 20)),
      ),
      h("div", { class: "stars-row", "aria-label": `Star rating: ${score.stars} of 5` },
        [1, 2, 3, 4, 5].map((s) =>
          h("span", { key: s, class: `star ${s <= score.stars ? "star--filled" : ""}`, "aria-hidden": "true" },
            icon(I.Star, 28))),
        h("span", { class: "stars-note" },
          `${score.stars}/5 — first-attempt rate ${Math.round(score.firstTryRate * 100)} % · hints ${score.hintsUsed}`),
      ),
      h("div", { class: "score-grid" },
        h("div", { class: "score-box" },
          h("p", { class: "score-label" }, "Objectives"),
          h("p", { class: "score-value" }, `${score.objectivePoints}/${score.objectiveMax}`),
        ),
        h("div", { class: "score-box" },
          h("p", { class: "score-label" }, "Knowledge check"),
          h("p", { class: "score-value" }, `${score.quizPoints}/${score.quizMax} `,
            h("span", { class: "score-sub" }, `(${correctCount}/${quiz.length} correct)`)),
        ),
      ),
      h("p", { class: "score-total" }, `TOTAL ${score.total}/${score.max} · MODE ${(state.mode ?? "").toUpperCase()}`),
      h("div", { class: "focus-box" },
        h("p", { class: "focus-box__title" }, icon(I.Crosshair, 14), " Focus areas for your next lap"),
        h("p", { class: "focus-box__sub" },
          "Derived from this run's evidence: knowledge-check misses, multi-attempt objectives and hints taken."),
        h("ul", { class: "focus-list" },
          focusAreas.map((f, i) =>
            h("li", { key: i, class: "focus-item" },
              h("p", { class: "focus-item__area" }, f.area),
              h("p", { class: "focus-item__why" }, f.why),
              h("p", { class: "focus-item__where" }, `→ ${f.where}`))),
        ),
      ),
      h("div", { class: "pillar-recap" },
        h("p", { class: "recap-title" }, icon(I.Target, 14, "c-runway"), " Objective recap by pillar"),
        h("div", { class: "recap-rows" },
          ["P1", "P2", "P3", "P4"].map((p) =>
            h("div", { key: p, class: "recap-row" },
              PillarBadge(p),
              h("p", { class: "recap-text" },
                `${byPillar[p].length} of ${objectives.filter((o) => o.pillar === p).length} mastered — `,
                byPillar[p].map((o) => o.title).join(" · ") || "—"))),
        ),
      ),
      h("div", { class: "can-now" },
        h("p", { class: "can-now__title" }, icon(I.BookOpenCheck, 14, "c-teal"), " You can now"),
        h("ul", { class: "can-now__list" },
          h("li", null, "· explain workload migrations — types, strategies, considerations — in CompTIA 2.3 terms"),
          h("li", null, "· plan transfers, waves, cutover and rollback from realistic evidence"),
          h("li", null, "· validate an arrival (checksums + baselines) and root-cause a failure"),
          h("li", null, "· defend fix-forward vs rollback with RTO/RPO, and price vendor lock-in"),
        ),
      ),
      h("div", { class: "next-flight" },
        h("p", { class: "recap-title" }, icon(I.Compass, 14, "c-runway"), " Next on the flight plan"),
        h("ul", { class: "can-now__list" },
          DEBRIEF.nextSteps.map((s, i) =>
            h("li", { key: i }, h("span", { class: "next-dot", "aria-hidden": "true" }), s))),
        h("div", { class: "extlinks" },
          DEBRIEF.links.map((l) =>
            h("a", { key: l.url, href: l.url, target: "_blank", rel: "noopener noreferrer", class: "extlink-chip" },
              `${l.label} ↗`))),
      ),
      h("div", { class: "report-footer" },
        TowerButton({ variant: "primary", onClick: onClose, ariaLabel: "Return to the tower" }, "Return to the tower"),
        h("p", { class: "star-logic" },
          "STAR LOGIC: 5 = ≥90 % first-attempt + ≤3 hints · 4 = ≥75 % first-attempt · 3 = steady progress · 2 = landed"),
      ),
    ));
}

// ── Glossary dialog ─────────────────────────────────────────────────────────

function GlossarySheetView({ open, onOpenChange }) {
  if (!open) return null;
  const q = ui.glossaryQuery;
  const filtered = GLOSSARY.filter(
    (g) => g.term.toLowerCase().includes(q.toLowerCase()) || g.def.toLowerCase().includes(q.toLowerCase()),
  );
  return h("div", {
    class: "overlay-center", role: "dialog", "aria-modal": "true",
    "aria-label": "Tower glossary", onClick: () => onOpenChange(false),
  },
    h("div", { class: "dialog-card glossary-card anim-pop", onClick: (e) => e.stopPropagation() },
      h("div", { class: "report-head" },
        h("div", null,
          h("h2", { class: "dialog-title" }, icon(I.BookMarked, 20, "c-runway"), " Tower glossary"),
          h("p", { class: "dialog-sub" }, "20 terms you will meet in this lab and on CV0-004 objective 2.3."),
        ),
        h("button", { ref: (n) => { ui.glossaryCloseBtn = n; }, onClick: () => onOpenChange(false), "aria-label": "Close glossary", class: "overlay-close" }, icon(I.X, 20)),
      ),
      h("div", { class: "glossary-search" },
        icon(I.Search, 16, "glossary-search__icon"),
        h("input", {
          value: q, placeholder: "Filter terms…", "aria-label": "Filter glossary terms",
          onChange: (e) => {
            const caret = e.target.selectionStart;
            ui.glossaryQuery = e.target.value;
            renderOverlays();
            refocusGlossary(caret);
          },
          class: "input glossary-input",
        }),
      ),
      h("div", { class: "glossary-list tower-scroll", "aria-live": "polite" },
        filtered.length === 0 ? h("p", { class: "glossary-empty" }, `no terms match " ${q} "`) : null,
        filtered.map((g) =>
          h("div", { key: g.term, class: "glossary-item" },
            h("p", { class: "glossary-term" }, g.term),
            h("p", { class: "glossary-def" }, g.def))),
      ),
    ));
}

