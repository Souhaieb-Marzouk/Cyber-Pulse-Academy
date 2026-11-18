// ============================================================================
// The Grand Exchange — js/app.js
// Bootstrap + the operator's console: mode select, nameplate, work-order
// docket, manual/glossary/handover drawers, quiz dialog, completion modal and
// reset dialog. Faithful port of src/components/lab/shell.tsx + board.tsx.
// ============================================================================
"use strict";

// ---------- store + view state ----------
const store = createStore(pristineState());

// Pillar labels — identical to the original shell.tsx map.
const PILLAR_LABEL = {
  P1: "P1 · Understand", P2: "P2 · Recognize", P3: "P3 · Detect", P4: "P4 · Mitigate",
};

// Local UI state — mirrors the useState hooks in the original Shell component.
const view = {
  selectedJack: null,
  currentId: null,
  feedback: null,            // { ok, msg } | null
  hintLevel: 0,
  checked: {},               // R3: frozen check-time snapshot per objective
  ws: {},                    // per-objective widget state (e.g. held sort tag)
  quizIdx: 0,
  tickerIdx: 0,
  tickerNode: null,
};

const appEl = () => document.getElementById("app");

// ---------- action helpers (same semantics as the original handlers) ----------
function startShift(m) {
  store.dispatch({ type: "SET_MODE", mode: m });
  view.currentId = null;
}

function pickJack(id) {
  view.selectedJack = id;
  store.dispatch({ type: "INSPECT", id });
  view.feedback = null;
  updateBoard();
  updateInspector();
  updateWorkOrder();
}

function resolveCurrent() {
  const state = store.getState();
  const objs = state.mode ? objectivesFor(state.mode) : [];
  return (
    objs.find((o) => o.id === view.currentId) ||
    objs.find((o) => !(state.objectives[o.id] && state.objectives[o.id].done)) ||
    objs[0] ||
    null
  );
}

function check() {
  const state = store.getState();
  const current = resolveCurrent();
  if (!current) return;
  const res = validateObjective(current, state.answers[current.id], { fw: state.fw, services: state.services });
  // keep the completed work order on screen so the student reads the feedback (D5/F1)
  if (view.currentId === null) view.currentId = current.id;
  store.dispatch({ type: "CHECK", obj: current, ok: res.ok });
  view.feedback = res;
  // freeze the check-time answer + environment + verdict for the R3 color contract
  view.checked[current.id] = {
    answer: state.answers[current.id],
    fw: Object.assign({}, state.fw),
    services: Object.assign({}, state.services),
    ok: res.ok,
  };
  updateWorkOrder(); // store subscription also refreshes docket + gauge
}

function answerCurrent(a) {
  const state = store.getState();
  const current = resolveCurrent();
  if (!current) return;
  if (state.objectives[current.id] && state.objectives[current.id].done) return; // R2: a filed answer can never be edited
  store.dispatch({ type: "ANSWER", id: current.id, answer: a });
  // any edit invalidates the frozen colors — no stale verdicts can mislead
  delete view.checked[current.id];
}

function onFwAction(port, st) {
  const state = store.getState();
  const current = resolveCurrent();
  if (!current) return;
  if (state.objectives[current.id] && state.objectives[current.id].done) return;
  store.dispatch({ type: "FW", port, state: st });
}
function onServiceAction(key, st) {
  const state = store.getState();
  const current = resolveCurrent();
  if (!current) return;
  if (state.objectives[current.id] && state.objectives[current.id].done) return;
  store.dispatch({ type: "SERVICE", key, state: st });
}

function useHint() {
  const state = store.getState();
  const current = resolveCurrent();
  if (!current) return;
  const max = state.mode === "medium" ? current.hints.length : 1;
  if (view.hintLevel >= max) return;
  store.dispatch({ type: "HINT", id: current.id });
  view.hintLevel += 1;
  updateWorkOrder(); // reveal the hint tier (the original re-renders via setHintLevel)
}

function gotoObjective(id) {
  view.currentId = id;
  view.feedback = null;
  view.hintLevel = 0;
  view.ws = {};
  updateWorkOrder();
  updateDocket();
  window.setTimeout(() => {
    const el = document.getElementById("workorder");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 60);
}

function nextObjective() {
  const state = store.getState();
  const current = resolveCurrent();
  if (!current) return;
  const objs = objectivesFor(state.mode);
  const idx = objs.findIndex((o) => o.id === current.id);
  const isDone = (o) => state.objectives[o.id] && state.objectives[o.id].done;
  const next = objs.slice(idx + 1).find((o) => !isDone(o)) || objs.find((o) => !isDone(o));
  if (next) gotoObjective(next.id);
}

function submitQuiz() {
  const state = store.getState();
  const quiz = state.mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  const correct = quiz.filter((q, i) => state.quizAnswers[String(i)] === q.solution).length;
  const score = correct / quiz.length;
  store.dispatch({ type: "QUIZ_SUBMIT", score });
  store.dispatch({ type: "COMPLETE" });
  LayerManager.closeAll();
  openCompletionModal();
}

function doReset() {
  clearState();
  view.selectedJack = null;
  view.currentId = null;
  view.feedback = null;
  view.hintLevel = 0;
  view.checked = {};
  view.ws = {};
  LayerManager.closeAll();
  store.dispatch({ type: "RESET" });
}

// ---------- nameplate / gauge / ticker ----------
function renderNameplate(mode, done, total) {
  const headerBtn = (label, children, fn) =>
    h("button", { type: "button", "aria-label": label, title: label, class: "header-btn", onclick: fn }, ...children);

  const gauge = mode && total > 0 ? h("div", { id: "gauge", class: "gauge" }) : null;

  const header = h("header", { class: "nameplate" },
    h("div", { class: "nameplate-inner" },
      h("div", { style: "min-width:0" },
        h("div", { style: "display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem" },
          h("h1", { class: "nameplate-title" }, "THE GRAND EXCHANGE"),
          h("span", { class: "nameplate-badge" }, "training sim"),
        ),
        h("p", { class: "nameplate-sub" }, "Harborline Transit Authority · Network+ N10-009 · Obj 1.4 ports & protocols"),
      ),
      h("div", { class: "header-actions" },
        mode && h("span", { class: "mode-chip" }, mode === "medium" ? "☀ day shift" : "☾ night shift"),
        headerBtn("Operator's manual", [icon("book-open", "i16"), h("span", { class: "lbl" }, "Manual")], openManualDrawer),
        // the glossary button carries a text glyph instead of an icon (original uses "Aa")
        headerBtn("Glossary", [
          h("span", { class: "i16", style: "display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:14px;line-height:1" }, "Aa"),
          h("span", { class: "lbl" }, "Glossary"),
        ], openGlossaryDrawer),
        headerBtn("Handover notes", [icon("clipboard-list", "i16"), h("span", { class: "lbl" }, "Handover")], openHandoverDrawer),
        headerBtn("Reset the lab", [icon("rotate-ccw", "i16"), h("span", { class: "lbl" }, "Reset")], openResetDialog),
        gauge,
      ),
    ),
  );
  if (gauge) renderGaugeInto(gauge, done, total);
  return header;
}

function renderGaugeInto(gaugeEl, done, total) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const ratio = total ? done / total : 0;
  gaugeEl.replaceChildren(
    h("div", { role: "status", "aria-label": `Shift progress: ${done} of ${total} work orders`, style: "display:flex;align-items:center;gap:0.625rem" },
      (() => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "44"); svg.setAttribute("height", "44");
        svg.setAttribute("viewBox", "0 0 44 44"); svg.setAttribute("aria-hidden", "true");
        const mk = (attrs) => {
          const el = document.createElementNS("http://www.w3.org/2000/svg", attrs.tag);
          for (const [k, v] of Object.entries(attrs)) if (k !== "tag") el.setAttribute(k, v);
          return el;
        };
        svg.append(
          mk({ tag: "circle", cx: "22", cy: "22", r: "16", fill: "none", stroke: "#4a3a28", "stroke-width": "5" }),
          mk({ tag: "circle", cx: "22", cy: "22", r: "16", fill: "none", stroke: "#d9a441", "stroke-width": "5", "stroke-linecap": "round", "stroke-dasharray": `${c * ratio} ${c}`, transform: "rotate(-90 22 22)" }),
        );
        const text = mk({ tag: "text", x: "22", y: "26", "text-anchor": "middle", "font-size": "12", fill: "#f2e7d0" });
        text.textContent = String(Math.round(ratio * 100));
        text.style.fontFamily = "var(--font-mono)";
        svg.append(text);
        return svg;
      })(),
      h("div", { style: "line-height:1.25" },
        h("div", { class: "gauge-label" }, "Shift gauge"),
        h("div", { class: "gauge-value" }, `${done}/${total} work orders`),
      ),
    ),
  );
}

function updateGauge() {
  const state = store.getState();
  if (!state.mode) return;
  const prog = progressFor(state, state.mode);
  const gaugeEl = document.getElementById("gauge");
  if (gaugeEl) renderGaugeInto(gaugeEl, prog.done, prog.total);
}

function renderTicker() {
  const el = h("div", { class: "ticker", "aria-hidden": "true" },
    h("div", { class: "ticker-inner" },
      h("span", { class: "ticker-prefix" }, "LINE TRAFFIC ›"),
      h("span", { class: "ticker-text" }, TICKER[view.tickerIdx]),
    ),
  );
  view.tickerNode = el.querySelector(".ticker-text");
  return el;
}
setInterval(() => {
  view.tickerIdx = (view.tickerIdx + 1) % TICKER.length;
  if (view.tickerNode) view.tickerNode.textContent = TICKER[view.tickerIdx];
}, 3600);

// ---------- mode select ----------
function renderModeSelect() {
  const root = appEl();
  root.replaceChildren(
    h("div", { class: "app paper-texture" },
      renderNameplate(null, 0, 0),
      h("main", { class: "mode-main" },
        h("div", { class: "fade-rise" },
          h("h2", { class: "mode-title" }, SCENARIO.title),
          h("p", { class: "mode-subtitle" }, SCENARIO.subtitle),
          h("section", { class: "gex-card brief-card", "aria-label": "Scenario briefing" },
            h("h3", { class: "brief-title" }, icon("shield-check", "i16"), `Scenario briefing — ${SCENARIO.org}`),
            SCENARIO.brief.map((para) => h("p", null, para)),
          ),
          h("h2", { class: "choose-title" }, "Choose your shift, operator."),
          h("p", { class: "choose-sub" },
            "Same board, same evidence — two very different tours through N10-009 Objective 1.4 (ports & protocols). You can reset and ride the other shift anytime."),
          h("div", { class: "shift-cards" },
            h("button", { type: "button", class: "gex-card shift-card", onclick: () => startShift("medium") },
              h("span", { class: "shift-card-title" }, icon("sun", "i20"), " DAY SHIFT"),
              h("span", { class: "shift-card-tag" }, "Guided training · 11 work orders"),
              h("ul", { class: "shift-card-list" },
                h("li", null, "· Work orders in order, each with a “where to look” cue"),
                h("li", null, "· Three-tier hints, freely available (they cost star rating, nothing else)"),
                h("li", null, "· Forgiving checks: close counts as close, every miss teaches"),
                h("li", null, "· Supervisor spot-check: 6 concept questions with explanations"),
              ),
              h("span", { class: "shift-card-cta" }, "Start the day shift ", icon("play", "i16")),
            ),
            h("button", { type: "button", class: "gex-card shift-card shift-card--night", onclick: () => startShift("hard") },
              h("span", { class: "shift-card-title" }, icon("moon", "i20"), " NIGHT SHIFT"),
              h("span", { class: "shift-card-tag" }, "Solo audit · 9 broad challenges"),
              h("ul", { class: "shift-card-list" },
                h("li", null, "· Jack labels off — identify services from payloads yourself"),
                h("li", null, "· Noisy evidence with red herrings; some lines are deliberately fine"),
                h("li", null, "· Strict checks: exact strings, exact ports, multi-part answers"),
                h("li", null, "· One optional nudge for the whole shift — it visibly costs score"),
                h("li", null, "· Spot-check: 7 scenario judgments requiring justification"),
              ),
              h("span", { class: "shift-card-cta" }, "Work the night shift ", icon("play", "i16")),
            ),
          ),
        ),
      ),
      renderTicker(),
    ),
  );
}

// ---------- shift screen ----------
function renderShift() {
  const state = store.getState();
  const prog = progressFor(state, state.mode);
  const root = appEl();
  root.replaceChildren(
    h("div", { class: "app paper-texture" },
      renderNameplate(state.mode, prog.done, prog.total),
      renderTicker(),
      h("main", { class: "shift-main" },
        h("div", { class: "workbench" },
          h("section", { id: "workorder", class: "gex-card workorder", "aria-label": "Work order" }),
          h("section", { id: "board" }),
          h("div", { id: "inspector" }),
        ),
        h("aside", { class: "docket-col", "aria-label": "Work-order docket" },
          h("div", { class: "gex-card docket-card" },
            h("div", { class: "docket-head" },
              h("h2", { class: "docket-title" }, "Shift docket"),
              h("span", { id: "docketCount", class: "docket-count" }),
            ),
            h("ol", { id: "docketList", class: "docket-list" }),
            h("div", { class: "docket-foot", id: "docketFoot" }),
          ),
        ),
      ),
    ),
  );
  updateWorkOrder(false);
  updateBoard();
  updateInspector();
  updateDocket();
}

// ---------- board + inspector ----------
function updateBoard() {
  const state = store.getState();
  const boardEl = document.getElementById("board");
  if (!boardEl) return;
  const grid = h("div", { class: "board-grid" });
  for (const id of PROTOCOL_ORDER) {
    const proto = PROTOCOLS[id];
    const seen = state.inspected.includes(id);
    const isSel = view.selectedJack === id;
    grid.append(h("button", {
      type: "button", "aria-pressed": isSel, "data-fkey": `jack-${id}`,
      "aria-label": `Jack ${proto.ports} — ${state.mode === "medium" ? proto.name : seen ? proto.name : "unidentified line"}`,
      class: "jack" + (isSel ? " jack--selected" : "") + (seen ? " jack--seen" : "") + (seen || state.mode === "medium" ? " jack--revealed" : ""),
      onclick: () => pickJack(id),
    },
      h("span", { class: "jack-ring", "aria-hidden": "true" }, h("span", { class: "jack-dot" })),
      h("span", { class: "jack-ports" }, proto.ports),
      h("span", { class: "jack-label" },
        state.mode === "medium" ? proto.name : seen ? proto.name : "· ? ·"),
    ));
  }
  boardEl.replaceChildren(
    h("section", { class: "board", "aria-label": "The patch board — 13 service jacks" },
      h("div", { class: "board-head" },
        h("h2", { class: "board-title" }, "THE BOARD · 13 service jacks"),
        h("span", { class: "board-mode" }, state.mode === "medium" ? "labels ON — day shift" : "labels hidden — identify by tapping"),
      ),
      grid,
    ),
  );
}

function updateInspector() {
  const state = store.getState();
  const box = document.getElementById("inspector");
  if (!box) return;
  if (!view.selectedJack) {
    box.replaceChildren(
      h("section", { class: "gex-card inspector-empty" },
        h("p", null,
          h("span", { class: "lead" }, "Tap any jack on the board"), h("br"),
          "to open its line in the inspector: the payload a tap would capture, the protocol's job, and its security posture. Work orders will point you at specific jacks."),
      ),
    );
    return;
  }
  const proto = PROTOCOLS[view.selectedJack];
  const sec = h("section", { class: "gex-card inspector", "aria-label": `Line inspector — ${proto.name}` });
  const head = h("div", { class: "inspector-head" },
    h("h3", { class: "inspector-name" }, proto.name),
    h("span", { class: "inspector-full" }, proto.full),
  );
  const chips = h("span", { class: "inspector-chips" },
    h("span", { class: "chip" }, proto.ports),
    h("span", { class: "chip" }, proto.transport),
    h("span", { class: "chip " + (proto.range === "well-known" ? "chip--wk" : "chip--rg") }, proto.range),
    SecureChip(proto.secure),
  );
  head.append(chips);
  sec.append(
    head,
    h("p", { class: "inspector-job" }, h("strong", null, "The job:"), ` ${proto.purpose}`),
    PayloadViewer({ label: proto.payload.label, lines: proto.payload.lines, note: proto.payload.note }),
    h("p", { class: "inspector-detail" }, proto.detail),
  );
  if (proto.replacement) {
    sec.append(h("p", { class: "replacement-callout" },
      h("strong", null, `Re-patch to ${proto.replacement.name} (${proto.replacement.port})`), ` — ${proto.replacement.note}`));
  }
  if (state.mode === "hard" && !state.inspected.includes(proto.id)) {
    sec.append(h("p", { class: "night-note" }, "Night-shift note: this jack is now identified on the board."));
  }
  box.replaceChildren(sec);
}

// ---------- work order card ----------
function focusKeyOf() {
  const ae = document.activeElement;
  return ae && ae.getAttribute && ae.getAttribute("data-fkey");
}
function restoreFocusBy(fkey) {
  if (!fkey) return false;
  const el = document.querySelector(`[data-fkey="${CSS.escape(fkey)}"]`);
  if (el) { el.focus(); return true; }
  return false;
}

function updateWorkOrder(preserveFocus = true) {
  const state = store.getState();
  const box = document.getElementById("workorder");
  if (!box) return;
  const current = resolveCurrent();
  if (!current) { box.replaceChildren(); return; }

  const fkey = preserveFocus ? focusKeyOf() : null;
  const mode = state.mode;
  const rec = state.objectives[current.id];
  const done = !!(rec && rec.done);

  const card = h("section", { class: "gex-card workorder", "aria-label": `Work order ${current.id}`, id: "workorder" });

  // chips row
  const chips = h("div", { class: "wo-chips" },
    h("span", { class: "wo-id" }, current.id),
    h("span", { class: "wo-pillar" }, PILLAR_LABEL[current.pillar]),
    done && h("span", { class: "wo-filed" }, icon("circle-check-big", "i14"), " FILED"),
    h("h2", { class: "wo-title" }, current.title),
  );
  card.append(chips);

  for (const line of current.prompt) card.append(h("p", { class: "wo-prompt" }, line));

  if (mode === "medium" && current.whereToLook) {
    card.append(h("button", {
      type: "button", class: "where-pill",
      onclick: () => {
        const b = document.getElementById("board");
        if (b) b.scrollIntoView({ behavior: "smooth", block: "nearest" });
      },
    }, icon("shield-check", "i14"), ` Where to look: ${current.whereToLook}`));
  }
  card.append(h("p", { class: "wo-anchor" }, `Covers: ${current.anchor}`));

  // widget (R2: once filed, the checked answer is locked — no active control may edit it)
  const widgetBox = h("div", null);
  const fieldset = h("fieldset", { disabled: done });
  widgetBox.append(fieldset);
  renderWidget(fieldset, {
    obj: current,
    mode,
    checkedAnswer: view.checked[current.id],
    onAnswer: answerCurrent,
    live: () => store.getState(),
    onFw: (port, st) => { onFwAction(port, st); refreshFirewallRow(fieldset, port, store.getState().fw[port] ?? "allow"); },
    onService: (key, st) => {
      onServiceAction(key, st);
      const cfg = current.config.hardening;
      if (cfg) refreshHardeningRow(fieldset, key, store.getState().services[key], cfg);
    },
    ws: view.ws[current.id] || (view.ws[current.id] = {}),
  });
  card.append(h("div", { class: "wo-widget" }, widgetBox));

  if (done) {
    card.append(h("p", { class: "filed-note" }, icon("circle-check-big", "i14"), " Filed — answers locked"));
  }

  // action row
  const actions = h("div", { class: "wo-actions" });
  if (!done) {
    actions.append(h("button", { type: "button", class: "btn btn-primary", "data-fkey": "check", onclick: check }, "Check results"));
    const maxHints = mode === "medium" ? current.hints.length : 1;
    if (view.hintLevel < maxHints && current.hints.length > 0) {
      actions.append(h("button", {
        type: "button", class: "btn btn-outline", "data-fkey": "hint", onclick: useHint,
      }, mode === "medium" ? `Hint (${view.hintLevel + 1}/${Math.min(3, current.hints.length)})` : "Nudge — costs score"));
    }
  } else {
    actions.append(h("button", { type: "button", class: "btn btn-teal", "data-fkey": "next", onclick: nextObjective },
      "Next work order ", icon("arrow-right", "i16")));
  }
  actions.append(h("span", { class: "attempts" }, rec ? `attempts: ${rec.attempts}` : "not attempted"));
  card.append(actions);

  // hint box
  if (view.hintLevel > 0) {
    card.append(h("div", { class: "hint-box", "aria-live": "polite" },
      h("div", { class: "hint-box-label" }, mode === "medium" ? `Hint ${view.hintLevel}` : "Nudge"),
      h("p", null, current.hints[Math.min(view.hintLevel, current.hints.length) - 1]),
    ));
  }

  // feedback (aria-live assertive, role=status)
  if (view.feedback) {
    card.append(
      h("div", {
        class: "feedback fade-rise-sm " + (view.feedback.ok ? "feedback--ok" : "feedback--bad"),
        "aria-live": "assertive", role: "status",
      },
        h("div", { class: "feedback-label" },
          view.feedback.ok
            ? [icon("circle-check-big", "i16"), " Filed — objective complete"]
            : [icon("x", "i16"), " Not yet — keep going"],
        ),
        h("p", { class: "feedback-msg" }, view.feedback.msg),
      ),
    );
  }

  box.replaceWith(card);
  if (preserveFocus) {
    if (!restoreFocusBy(fkey)) {
      // the Check button became Next (objective just filed) — keep focus nearby
      if (done && (fkey === "check" || fkey === "hint")) restoreFocusBy("next");
    }
  }
}

// ---------- docket ----------
function updateDocket() {
  const state = store.getState();
  const list = document.getElementById("docketList");
  const count = document.getElementById("docketCount");
  const foot = document.getElementById("docketFoot");
  if (!list || !state.mode) return;
  const objs = objectivesFor(state.mode);
  const prog = progressFor(state, state.mode);
  const current = resolveCurrent();
  count.textContent = `${prog.done}/${prog.total} filed`;

  const fkey = focusKeyOf();
  list.replaceChildren(...objs.map((o) => {
    const rec = state.objectives[o.id];
    const isCurrent = current && current.id === o.id;
    const item = h("button", {
      type: "button", "data-fkey": `docket-${o.id}`,
      "aria-current": isCurrent ? "true" : undefined,
      class: "docket-item" + (isCurrent ? " docket-item--current" : rec && rec.done ? " docket-item--done" : ""),
      onclick: () => gotoObjective(o.id),
    },
      h("span", { "aria-hidden": "true", class: "docket-circle" }, rec && rec.done ? "✓" : o.id.replace("OBJ-", "")),
      h("span", { style: "min-width:0" },
        h("span", { class: "docket-name" }, o.title),
        h("span", { class: "docket-pillar" }, PILLAR_LABEL[o.pillar]),
      ),
    );
    return h("li", null, item);
  }));
  if (fkey) restoreFocusBy(fkey);

  foot.replaceChildren(
    (() => {
      const b = h("button", {
        type: "button", class: "btn btn-primary", disabled: !prog.allDone,
        onclick: openQuizDialog,
      }, icon("clipboard-list", "i16"), " Supervisor's spot-check");
      return b;
    })(),
    h("p", { class: "quiz-caption" },
      prog.allDone
        ? "All work orders filed — prove it to the supervisor."
        : `File all ${prog.total} work orders to unlock the spot-check.`),
  );
}

// ---------- drawers ----------
function openManualDrawer() {
  openDrawer({
    title: "Operator's manual",
    desc: MANUAL.intro,
    renderBody: (panel, close) => {
      const body = h("div", { class: "sheet-body" });
      MANUAL.sections.forEach((s) => {
        const sec = h("section", { class: "gex-card manual-section" }, h("h3", null, s.title));
        if (s.body) sec.append(h("p", null, s.body));
        if (s.table) {
          const t = h("table", { class: "mtable" });
          t.append(h("thead", null, h("tr", null,
            ["Protocol", "Port(s)", "Transport", "Job", "Re-patch"].map((c) => h("th", null, c)))));
          const tb = h("tbody");
          s.table.forEach((row) => {
            tb.append(h("tr", null, row.map((cell, ci) => h("td", null, cell))));
          });
          t.append(tb);
          sec.append(h("div", { class: "hscroll" }, t));
        }
        body.append(sec);
      });
      body.append(h("p", { class: "mitre-note" },
        "Technique-level context, deliberately simplified: MITRE ATT&CK frames service discovery as Network Service Scanning (T1046), remote-access lines as Remote Services (T1021 — RDP T1021.001, SSH T1021.004) and cleartext capture as Network Sniffing (T1040). Official pages are linked in the Handover notes."));
      body.append(h("button", { type: "button", class: "btn btn-primary sheet-close", onclick: close }, "Back to the board"));
      panel.append(body);
    },
  });
}

function openGlossaryDrawer() {
  openDrawer({
    title: "Exchange glossary",
    desc: "The shift's vocabulary — 15 terms, one line each.",
    renderBody: (panel, close) => {
      const dl = h("dl", { class: "glossary-dl sheet-body" });
      GLOSSARY.forEach((g) => {
        dl.append(h("div", { class: "gex-card glossary-card" },
          h("dt", null, g.term),
          h("dd", null, g.def),
        ));
      });
      const wrap = h("div", { style: "overflow-y:auto;padding:0 1rem" }, dl);
      panel.append(wrap,
        h("div", { style: "padding:1rem" },
          h("button", { type: "button", class: "btn btn-primary sheet-close sheet-close--mb", onclick: close }, "Back to the board")));
    },
  });
}

function openHandoverDrawer() {
  openDrawer({
    title: "Handover notes — the next operator reads these",
    desc: DEBRIEF.detection.intro,
    renderBody: (panel, close) => {
      const body = h("div", { class: "sheet-body" });

      // detection table
      const det = h("section", { class: "gex-card handover-section" },
        h("h3", null, "Detection opportunities"),
      );
      const t = h("table", { class: "dtable" });
      t.append(h("thead", null, h("tr", null,
        ["Data source", "Example signal", "Alert you'd tune"].map((c) => h("th", null, c)))));
      const tb = h("tbody");
      DEBRIEF.detection.rows.forEach((r) => tb.append(h("tr", null, r.map((cell) => h("td", null, cell)))));
      t.append(tb);
      det.append(h("div", { class: "hscroll" }, t));
      body.append(det);

      // mitigation list
      body.append(h("section", { class: "gex-card pad-card" },
        h("h3", { class: "h3-teal" }, "Mitigation recommendations"),
        h("ul", { class: "mit-list" },
          DEBRIEF.mitigation.map((m, i) => h("li", null,
            h("span", { class: "mit-num" }, String(i + 1).padStart(2, "0")), h("span", null, m)))),
      ));

      // blue / red cards
      const grid = h("div", { class: "blue-red-grid" });
      grid.append(h("section", { class: "gex-card pad-card" },
        h("h3", { class: "h3-teal" }, "Blue-team takeaways"),
        h("ul", { class: "dot-list" }, DEBRIEF.blue.map((b) => h("li", null, "· " + b)))));
      grid.append(h("section", { class: "gex-card pad-card" },
        h("h3", { class: "h3-red" }, "Think like the other side ", h("span", { class: "h3-note" }, "(so you can close it first)")),
        h("ul", { class: "dot-list" }, DEBRIEF.red.map((b) => h("li", null, "· " + b)))));
      body.append(grid);

      // official references
      body.append(h("section", { class: "gex-card pad-card" },
        h("h3", { class: "h3-brass" }, "Official references ", h("span", { class: "h3-note" }, "(open in a new tab)")),
        h("ul", { class: "links-list" },
          LINKS.map((l) => h("li", null,
            h("a", { href: l.url, target: "_blank", rel: "noopener noreferrer" }, l.label),
            h("span", { class: "links-note" }, ` — ${l.note}`)))),
      ));

      body.append(h("button", { type: "button", class: "btn btn-primary sheet-close", onclick: close }, "Back to the board"));
      panel.append(body);
    },
  });
}

// ---------- reset dialog ----------
function openResetDialog() {
  const state = store.getState();
  const hasProgress = state.mode ? progressFor(state, state.mode).done > 0 || state.quizDone : false;
  openDialog({
    md: true,
    title: "Clear the exchange?",
    titleClass: "dialog-title--lg",
    desc: hasProgress
      ? "This resets the whole lab to pristine: shift choice, filed work orders, board state and spot-check results are all wiped. Nothing leaves your browser."
      : "Nothing is saved yet — this just re-opens the shift board.",
    render: (panel, close) => {
      panel.append(h("div", { class: "dialog-actions" },
        h("button", { type: "button", class: "btn btn-outline", onclick: close }, "Keep my shift"),
        h("button", { type: "button", class: "btn btn-danger", onclick: doReset }, "Reset to pristine"),
      ));
    },
  });
}

// ---------- quiz dialog ----------
function openQuizDialog() {
  view.quizIdx = 0;
  const state = store.getState();
  const labelId = "dlg-l-quiz";
  const descId = "dlg-d-quiz";
  LayerManager.open(
    (panel, close) => {
      panel.append(
        h("button", { class: "dialog-close", "aria-label": "Close", onclick: close }, icon("x", "i16"), h("span", { class: "sr-only" }, "Close")),
        h("div", { id: labelId, class: "dialog-title" },
          `Supervisor's spot-check · ${state.mode === "hard" ? "night audit" : "day shift"}`),
      );
      const body = h("div", { class: "dialog-grid" });
      panel.append(body);
      renderQuizBody(body, descId);
    },
    { panelClass: "dialog dialog--lg", labelId, descId }
  );
}

function renderQuizBody(body, descId) {
  const state = store.getState();
  const mode = state.mode;
  const quiz = mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  const idx = view.quizIdx;
  const q = quiz[idx];
  const picked = state.quizAnswers[String(idx)];
  const revealed = picked !== undefined;
  const pickedIsCorrect = picked === q.solution;
  body.replaceChildren();

  body.append(h("div", { id: descId, class: "dialog-desc" },
    `Question ${idx + 1} of ${quiz.length} — answer, read the explanation, move on. ${
      mode === "hard"
        ? "These are scenario judgments: pick what survives review."
        : "Concept checks — every answer explains itself."}`));
  body.append(h("p", { class: "quiz-q" }, q.q));

  const group = h("div", { role: "radiogroup", "aria-label": `Question ${idx + 1} options`, class: "quiz-choices" });
  q.choices.forEach((c, i) => {
    const isPicked = revealed && picked === i;
    const v = isPicked ? (pickedIsCorrect ? "ok" : "bad") : null;
    group.append(h("button", {
      type: "button", role: "radio", "aria-checked": isPicked, disabled: revealed,
      "data-fkey": `quiz-${idx}-${i}`,
      class: "quiz-choice" + (v === "ok" ? " verdict--ok" : v === "bad" ? " verdict--bad" : revealed ? " quiz-choice--muted" : ""),
      onclick: () => {
        if (state.quizAnswers[String(view.quizIdx)] !== undefined) return; // locked (R2)
        store.dispatch({ type: "QUIZ_ANSWER", id: String(view.quizIdx), choice: i });
        renderQuizBody(body, descId);
        restoreFocusBy(`quiz-${view.quizIdx}-${i}`);
      },
    },
      h("span", { class: "quiz-letter" }, `${String.fromCharCode(65 + i)}.`),
      v === "ok" && icon("circle-check-big", "i16"),
      v === "bad" && icon("circle-x", "i16"),
      h("span", null, c),
    ));
  });
  body.append(group);

  if (revealed) {
    body.append(h("div", { class: "quiz-why", "aria-live": "polite" },
      h("strong", null, "Why: "), q.explain));
  }

  const foot = h("div", { class: "quiz-foot" },
    h("span", { class: "quiz-count" }, `answered ${Object.keys(state.quizAnswers).length}/${quiz.length}`),
  );
  if (idx < quiz.length - 1) {
    foot.append(h("button", {
      type: "button", class: "btn btn-primary", disabled: picked === undefined,
      onclick: () => { view.quizIdx += 1; renderQuizBody(body, descId); },
    }, "Next question ", icon("arrow-right", "i16")));
  } else {
    foot.append(h("button", {
      type: "button", class: "btn btn-teal", disabled: picked === undefined,
      onclick: submitQuiz,
    }, "Submit spot-check"));
  }
  body.append(foot);
}

// ---------- completion modal ----------
function focusAreasNode(state, mode) {
  const quiz = mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  const missedTopics = quiz
    .map((q, i) => ({ q, missed: state.quizAnswers[String(i)] !== undefined && state.quizAnswers[String(i)] !== q.solution }))
    .filter((x) => x.missed)
    .map((x) => ({ topic: x.q.topic, review: x.q.review }));
  const objs = objectivesFor(mode);
  const shaky = objs
    .filter((o) => {
      const r = state.objectives[o.id];
      return r && (!r.firstTry || r.hints > 0);
    })
    .map((o) => {
      const r = state.objectives[o.id];
      const reasons = [];
      if (!r.firstTry) reasons.push("it took more than one attempt");
      if (r.hints > 0) reasons.push("you used a hint here");
      return {
        topic: `${o.id} · ${o.title}`,
        review: `${reasons.join(" and ")}. Re-run it from the docket — ${o.whereToLook ?? "the board and the Manual"}.`,
      };
    });
  const clean = missedTopics.length === 0 && shaky.length === 0;
  const card = h("div", { class: "gex-card focus-card" }, h("h3", null, "Focus areas for your next shift"));
  if (clean) {
    card.append(h("p", { class: "focus-p" },
      "Clean run — every work order filed first-try without hints, and the supervisor's spot-check fully correct. " +
      "To keep it sharp, re-run the 13-jack recall work order cold tomorrow (spaced repetition)."));
  } else {
    const ul = h("ul", { class: "focus-body" });
    for (const s of shaky) ul.append(h("li", null, "· ", h("strong", { style: "font-weight:600" }, s.topic), ` — ${s.review}`));
    for (const m of missedTopics) ul.append(h("li", null, "· Spot-check miss: ", h("strong", { style: "font-weight:600" }, m.topic), ` — ${m.review}`));
    card.append(ul);
  }
  return card;
}

function openCompletionModal() {
  const state = store.getState();
  const mode = state.mode;
  const objs = objectivesFor(mode);
  const stars = starRating(state, mode);
  const byPillar = { P1: [], P2: [], P3: [], P4: [] };
  for (const o of objs) byPillar[o.pillar].push(o);
  const quiz = mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  const quizCorrect = quiz.filter((q, i) => state.quizAnswers[String(i)] === q.solution).length;

  openDialog({
    wide: true,
    title: `Operator commendation — ${mode === "hard" ? "Night Shift" : "Day Shift"}`,
    titleClass: "dialog-title--2xl",
    desc: "All work orders filed and the supervisor signed off. You can now explain the 13 lines, read them in raw evidence, detect them, and re-patch them — that is Objective 1.4, mastered.",
    descClass: "dialog-desc--lead",
    render: (panel, close) => {
      const grid = h("div", { class: "dialog-grid" });
      grid.append(h("div", { class: "gex-card stars-card" },
        h("div", { class: "stars-row", role: "img", "aria-label": `${stars.stars} of 5 stars` },
          [1, 2, 3, 4, 5].map((i) => {
            const s = icon("star", "i28");
            s.className = "icon i28 " + (i <= stars.stars ? "star--on" : "star--off");
            return s;
          }),
        ),
        h("dl", { class: "stars-stats" },
          h("div", null, `objectives · ${Math.round(stars.objectiveScore * 100)}% quality`),
          h("div", null, `first-attempt · ${Math.round(stars.firstTryRatio * 100)}%`),
          h("div", null, `spot-check · ${quizCorrect}/${quiz.length} (${Math.round(stars.quizScore * 100)}%)`),
          h("div", null, `hint cost · −${Math.round(stars.hintPenalty * 100)} pts`),
        ),
      ));
      const pillarGrid = h("div", { class: "pillar-grid" });
      for (const p of ["P1", "P2", "P3", "P4"]) {
        pillarGrid.append(h("div", { class: "gex-card pillar-card" },
          h("div", { class: "pillar-head" },
            h("span", { class: "pillar-name" }, PILLAR_LABEL[p]),
            h("span", { class: "pillar-count" }, `${byPillar[p].filter((o) => state.objectives[o.id] && state.objectives[o.id].done).length}/${byPillar[p].length}`),
          ),
          h("ul", { class: "pillar-list" },
            byPillar[p].map((o) => h("li", null, `${state.objectives[o.id] && state.objectives[o.id].done ? "✓" : "○"} ${o.title}`))),
        ));
      }
      grid.append(pillarGrid);
      grid.append(focusAreasNode(state, mode));
      grid.append(h("div", { class: "gex-card next-card" },
        h("strong", null, "Where to go next"),
        h("ul", { class: "next-list" },
          h("li", null, `· Ride the other shift — ${mode === "medium" ? "Night Shift audits the same board with strict, noisy evidence" : "Day Shift rebuilds the same knowledge with guided, tiered hints"}.`),
          h("li", null, "· Re-run the 13-jack recall work order cold tomorrow — spaced repetition is how the table sticks."),
          h("li", null, "· Open the Handover notes for the detection table, mitigation list and official references (CompTIA, IANA, MITRE)."),
          h("li", null, "· Then continue through the rest of Network+ Domain 1 — the port table is the vocabulary every later topic assumes."),
        ),
      ));
      grid.append(h("div", { class: "completion-actions" },
        h("button", { type: "button", class: "btn btn-teal", onclick: close }, "Back on the board")));
      panel.append(grid);
    },
  });
}

// ---------- shell dispatch ----------
function renderShell() {
  const state = store.getState();
  if (!state.mode || !state.hydrated) renderModeSelect();
  else renderShift();
}

// ---------- store subscription ----------
// Mirrors the original effects: save on every post-hydrate change (F3), and
// re-render the regions an action touches.
store.subscribe((state, action) => {
  if (state.hydrated) saveState(state);
  switch (action.type) {
    case "HYDRATE":
    case "SET_MODE":
    case "RESET":
      renderShell();
      break;
    case "CHECK":
      updateDocket();
      updateGauge();
      break;
    case "HINT":
      updateDocket();
      break;
    case "INSPECT":
      // board + inspector updated by pickJack
      break;
    default:
      break;
  }
});

// ---------- boot (F3: restore once on mount) ----------
const savedState = loadState();
store.dispatch({ type: "HYDRATE", state: savedState ?? pristineState() });
