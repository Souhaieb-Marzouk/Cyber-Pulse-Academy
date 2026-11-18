/* ======================================================================
   GATEHOUSE lab — app shell (boot, mode select, header, circuit rail)
   Vanilla-DOM port of the framework lab's gatehouse-lab.tsx, shell.tsx and
   circuit-rail.tsx. The store (state.js) drives every update through
   subscribe(); widgets inside stations manage themselves, so the shell only
   re-renders what actually changed (rail, chips, tracker, ledger, badges).
   ====================================================================== */

/* ---------- progress ring (shell.tsx ProgressRing) ---------- */
function ProgressRing(value, total) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const frac = total ? value / total : 0;
  const wrap = h("span", { class: "ring-wrap", role: "img", "aria-label": `progress ${value} of ${total} objectives` });
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "40"); svg.setAttribute("height", "40");
  svg.setAttribute("viewBox", "0 0 40 40"); svg.setAttribute("aria-hidden", "true");
  const bg = document.createElementNS(SVG_NS, "circle");
  bg.setAttribute("cx", "20"); bg.setAttribute("cy", "20"); bg.setAttribute("r", String(r));
  bg.setAttribute("fill", "none"); bg.setAttribute("stroke", "#1d2a45"); bg.setAttribute("stroke-width", "4");
  const arc = document.createElementNS(SVG_NS, "circle");
  arc.setAttribute("cx", "20"); arc.setAttribute("cy", "20"); arc.setAttribute("r", String(r));
  arc.setAttribute("fill", "none"); arc.setAttribute("stroke", "#37e0b8"); arc.setAttribute("stroke-width", "4");
  arc.setAttribute("stroke-dasharray", String(c)); arc.setAttribute("stroke-dashoffset", String(c * (1 - frac)));
  arc.setAttribute("stroke-linecap", "round"); arc.setAttribute("transform", "rotate(-90 20 20)");
  svg.append(bg, arc);
  const num = h("span", { class: "ring-num font-display", text: String(value) });
  wrap.append(svg, num);
  return wrap;
}

/* ---------- header button (shell.tsx HeaderButton) ---------- */
function HeaderButton(iconName, label, onClick, mobile) {
  return h("button", {
    type: "button",
    class: `header-btn${mobile ? " header-btn-mobile" : ""}`,
    onclick: onClick,
  }, icon(iconName, "ic-sm"), label);
}

/* ---------- mode select screen (gatehouse-lab.tsx ModeSelect, copy verbatim) ---------- */
function ModeSelect() {
  const root = h("div", { class: "lab-root mode-root" });
  const main = h("main", { class: "mode-main" });

  const identity = h("div", { class: "mode-identity" },
    h("span", { class: "mode-logo" }, icon("heart-pulse", "ic text-mint")),
    h("div", null,
      h("h1", { class: "font-display mode-h1", text: "GATEHOUSE — Logical Security Lab" }),
      h("p", { class: "text-sm text-dim", text: `${BRIEFING.org} · night-shift access-control room` })
    )
  );

  const brief = h("section", { class: "mode-brief panel-box", "aria-label": "Scenario briefing" },
    h("h2", { class: "font-display mode-brief-title", text: "Scenario briefing — read before your shift" }),
    h("p", { class: "text-sm leading-relaxed text-dim", text: BRIEFING.line }),
    h("p", { class: "mt-3 text-sm leading-relaxed text-text", text: BRIEFING.hook }),
    h("p", { class: "mt-3 text-xs leading-relaxed text-dim", text: BRIEFING.cert }),
    h("p", { class: "mt-3 flex items-start gap-2 text-xs leading-relaxed text-dim" },
      icon("shield-check", "ic-sm text-mint mode-shield"), BRIEFING.safety)
  );

  function modeCard(kind) {
    const hard = kind === "hard";
    const card = h("button", {
      type: "button",
      class: `mode-card ${hard ? "mode-card-hard" : "mode-card-day"}`,
      onclick: () => setMode(kind),
    },
      h("div", { class: "mb-3 flex items-center gap-2 " + (hard ? "text-coral" : "text-sky") },
        icon(hard ? "moon-star" : "sun", "ic"),
        h("span", { class: "font-display text-lg font-bold", text: hard ? "Night Shift" : "Day Shift" }),
        h("span", { class: "mode-pill", text: hard ? "Hard · on-call" : "Medium · guided" })
      ),
      h("p", { class: "text-sm leading-relaxed text-dim", text: hard
        ? "All ten stations open at once. Incident 2211 drives discovery: noisy evidence, two red herrings, 9 multi-step challenges, strict validation with near-miss rationale."
        : "12 granular rounds through all ten stations, in order. Every check explains itself, tiered hints are one tap away, and wrong answers teach — they never block." }),
      h("ul", { class: "mt-3 space-y-1 text-xs text-dim" },
        (hard
          ? ["Analyze, evaluate, create — Bloom: Analyze/Evaluate/Create",
             "One optional nudge, visibly costs score",
             "7 scenario items requiring justification"]
          : ["Understand & apply — Bloom: Understand/Apply",
             "3-tier hints available (they cost stars, not progress)",
             "6-question concept quiz after the rounds"]
        ).map((t) => h("li", { class: "flex gap-2" }, icon("sparkles", `ic-xs shrink-0 ${hard ? "text-coral" : "text-sky"}`), t))),
      h("p", { class: `font-display mt-4 text-sm font-semibold ${hard ? "text-coral" : "text-sky"}`, text: hard ? "Take the night shift →" : "Start day shift →" })
    );
    return card;
  }

  const cards = h("div", { class: "mode-cards" }, modeCard("medium"), modeCard("hard"));

  const foot = h("p", { class: "mode-foot" },
    "Progress auto-saves in your browser (localStorage). A clearly-labeled RESET restores the pristine lab. No accounts, no network calls — all evidence is simulated training data.");

  main.append(identity, brief, cards, foot);
  root.append(main);
  return root;
}

/* ---------- circuit rail (circuit-rail.tsx) ---------- */
const STATION_ICONS = {
  vault: "vault", badge: "id-card", federation: "waypoints", directory: "folder-tree",
  radio: "radio-tower", gate: "key-round", roles: "users-round", clock: "clock-4",
  audit: "scan-search", harden: "wrench",
};

function isStationUnlocked(index, mode, obj, modeObjs) {
  if (mode !== "medium") return true;
  if (index === 0) return true;
  const prev = STATIONS[index - 1].id;
  const list = modeObjs.filter((o) => o.station === prev);
  return list.every((o) => obj[o.id] && obj[o.id].done);
}

function stationStatus() {
  const modeObjs = objectivesForMode(state.mode);
  const stationDone = {};
  const stationTotal = {};
  for (const st of STATIONS) {
    const list = modeObjs.filter((o) => o.station === st.id);
    stationTotal[st.id] = list.length;
    stationDone[st.id] = list.length > 0 && list.every((o) => state.obj[o.id] && state.obj[o.id].done);
  }
  return { stationDone, stationTotal };
}

function CircuitRail() {
  const { stationDone, stationTotal } = stationStatus();
  const modeObjs = objectivesForMode(state.mode);
  const nav = h("nav", { class: "circuit-rail", "aria-label": "Checkpoint circuit" });
  const ol = h("ol", { class: "rail-list" });
  STATIONS.forEach((st, i) => {
    const unlocked = isStationUnlocked(i, state.mode, state.obj, modeObjs);
    const isActive = state.active === st.id;
    const done = stationDone[st.id];
    const btn = h("button", {
      type: "button",
      "data-station": st.id,
      "aria-current": isActive ? "step" : null,
      disabled: !unlocked,
      class: `rail-item${isActive ? " rail-active" : ""}${unlocked ? "" : " rail-locked"}`,
      onclick: () => { if (unlocked) setActive(st.id); },
    },
      h("span", { class: `rail-node${done ? " rail-done" : isActive ? " rail-node-active gh-live-dot" : ""}` },
        unlocked ? icon(STATION_ICONS[st.id], "ic-sm") : icon("lock", "ic-xs")),
      h("span", { class: "min-w-0" },
        h("span", { class: "block truncate font-display text-sm font-semibold text-text", text: `${st.no} · ${st.name}` }),
        h("span", { class: "block truncate rail-sub", text: done ? "cleared" : unlocked ? `${stationTotal[st.id]} objective${stationTotal[st.id] === 1 ? "" : "s"}` : "locked" }))
    );
    ol.append(h("li", { class: "relative" }, btn));
  });
  nav.append(ol);
  return nav;
}

function CircuitChips() {
  const { stationDone } = stationStatus();
  const modeObjs = objectivesForMode(state.mode);
  const wrap = h("div", { class: "chips-row gh-scroll", role: "tablist", "aria-label": "Stations" });
  STATIONS.forEach((st, i) => {
    const unlocked = isStationUnlocked(i, state.mode, state.obj, modeObjs);
    const isActive = state.active === st.id;
    wrap.append(h("button", {
      type: "button",
      role: "tab",
      "aria-selected": String(isActive),
      "data-station": st.id,
      disabled: !unlocked,
      class: `chip-station${isActive ? " chip-station-active" : ""}${unlocked ? "" : " chip-station-locked"}`,
      onclick: () => { if (unlocked) setActive(st.id); },
    },
      unlocked ? icon(STATION_ICONS[st.id], "ic-sm") : icon("lock", "ic-xs"),
      st.name,
      stationDone[st.id] ? " ✓" : ""
    ));
  });
  return wrap;
}
/* ======================================================================
   app part 2 — station workspace + objectives tracker + AAA ledger strip
   (ports of shell.tsx workspace/tracker.tsx/ledger.tsx)
   ====================================================================== */

/* ---------- station objectives helper (tracker.tsx stationObjectives) ---------- */
function stationObjectives(stationId, mode) {
  if (mode === "select") return [];
  return OBJECTIVES.filter((o) => o.mode === mode && (o.station === stationId || (stationId === "harden" && o.station === "multi" && mode === "hard")));
}

function stationName(id) {
  if (id === "multi") return "multi-station";
  const st = STATIONS.find((s) => s.id === id);
  return st ? st.name : id;
}

const STATION_COMPONENTS = {
  vault: VaultStation, badge: BadgeStation, federation: FederationStation,
  directory: DirectoryStation, radio: RadioStation, gate: GateStation,
  roles: RoleStation, clock: ClockFenceStation, audit: AuditStation, harden: HardenStation,
};

/* ---------- workspace ---------- */
function reducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Workspace() {
  const box = h("main", { class: "ws-col", "aria-label": "Station workspace" });
  const inner = h("div", { class: "ws-inner" });
  box.append(inner);

  function buildStation(st) {
    const stObjList = stationObjectives(st.id, state.mode);
    const stDone = stObjList.filter((o) => state.obj[o.id] && state.obj[o.id].done).length;
    const stationIdx = STATIONS.findIndex((s) => s.id === st.id);
    const unlocked = isStationUnlocked(stationIdx, state.mode, state.obj, objectivesForMode(state.mode));
    const nextStation = STATIONS[stationIdx + 1];
    const canProceed = state.mode === "medium" && stObjList.length > 0 && stDone === stObjList.length && nextStation;

    const card = h("div", { class: "panel-box ws-card" });
    const head = h("div", { class: "mb-1 flex items-center gap-2-5" },
      h("span", { class: "ws-icon" }, icon(STATION_ICONS[st.id], "ic-sm text-mint")),
      h("div", { class: "min-w-0" },
        h("h2", { class: "font-display truncate text-lg font-bold", text: `${st.no} · ${st.name}` }),
        h("p", { class: "gh-term ws-tag", text: st.tag })),
      stObjList.length > 0
        ? h("span", {
            class: `badge ml-auto shrink-0 text-10 ws-obj-badge${stDone === stObjList.length ? " ws-obj-badge-done" : ""}`,
            "data-role": "st-badge",
            text: `${stDone}/${stObjList.length} objectives`,
          })
        : null);
    card.append(head, h("p", { class: "mb-4 max-w-2xl text-sm leading-relaxed text-dim", text: st.mission }));

    if (unlocked) {
      const body = (STATION_COMPONENTS[st.id] || VaultStation)();
      card.append(body);
    } else {
      card.append(h("p", { class: "ws-locked", text: "This station unlocks when the previous round is cleared — work the circuit in order." }));
    }

    const frag = h("div", null, card);
    if (canProceed && nextStation) {
      frag.append(h("div", { class: "mt-4 banner-cleared" },
        h("p", { class: "text-sm text-mint" },
          h("strong", null, "Round cleared."),
          ` Next checkpoint: ${nextStation.no} · ${nextStation.name} — ${nextStation.tag}.`),
        h("button", {
          type: "button",
          class: "banner-btn",
          onclick: () => { setActive(nextStation.id); log("ACCT", `proceeded to station ${nextStation.no} ${nextStation.name}`); },
        }, "Proceed →")));
    }
    return frag;
  }

  box.renderStation = (animate) => {
    const st = STATIONS.find((s) => s.id === state.active) || STATIONS[0];
    const put = () => {
      inner.textContent = "";
      inner.append(buildStation(st));
      if (animate && !reducedMotion() && inner.animate) {
        inner.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 180, easing: "ease-out" });
      }
    };
    if (animate && !reducedMotion() && inner.animate && inner.childElementCount) {
      const anim = inner.animate(
        [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-6px)" }],
        { duration: 180, easing: "ease-in" });
      anim.onfinish = put;
    } else {
      put();
    }
  };
  box.refreshBadges = () => {
    const st = STATIONS.find((s) => s.id === state.active) || STATIONS[0];
    const stObjList = stationObjectives(st.id, state.mode);
    const stDone = stObjList.filter((o) => state.obj[o.id] && state.obj[o.id].done).length;
    const badge = inner.querySelector('[data-role="st-badge"]');
    if (badge && stObjList.length > 0) {
      badge.textContent = `${stDone}/${stObjList.length} objectives`;
      badge.classList.toggle("ws-obj-badge-done", stDone === stObjList.length);
    }
    /* round-cleared banner: recompute in place without touching station widgets */
    const stationIdx = STATIONS.findIndex((s) => s.id === st.id);
    const nextStation = STATIONS[stationIdx + 1];
    const canProceed = state.mode === "medium" && stObjList.length > 0 && stDone === stObjList.length && nextStation;
    const existing = inner.querySelector(".banner-cleared");
    if (canProceed && nextStation && !existing) {
      inner.append(h("div", { class: "mt-4 banner-cleared" },
        h("p", { class: "text-sm text-mint" },
          h("strong", null, "Round cleared."),
          ` Next checkpoint: ${nextStation.no} · ${nextStation.name} — ${nextStation.tag}.`),
        h("button", {
          type: "button",
          class: "banner-btn",
          onclick: () => { setActive(nextStation.id); log("ACCT", `proceeded to station ${nextStation.no} ${nextStation.name}`); },
        }, "Proceed →")));
    } else if (!canProceed && existing) {
      existing.remove();
    }
  };
  box.renderStation(false);
  return box;
}

/* ---------- objectives tracker (tracker.tsx) ---------- */
function ObjectiveCard(o) {
  const st = state.obj[o.id];
  const mode = state.mode;
  const status = !st || st.attempts === 0 ? "idle" : st.lastPass ? "pass" : "fail";
  const hintLevel = st ? st.hintsUsed : 0;

  const li = h("li", { class: "obj-card" });
  const row = h("div", { class: "flex items-start gap-2" });
  row.append(h("span", { class: "mt-0-5" },
    status === "pass" ? icon("circle-check", "ic obj-ic-pass")
      : status === "fail" ? icon("circle-x", "ic obj-ic-fail")
      : icon("circle", "ic obj-ic-idle")));

  const col = h("div", { class: "min-w-0 flex-1" });
  col.append(h("div", { class: "flex flex-wrap items-center gap-1-5" },
    h("span", { class: "badge obj-id-badge", text: `${o.id.replace("OBJ-", "")} · ${stationName(o.station)}` }),
    PillarBadge(o.pillar)));
  col.append(h("p", { class: "mt-1-5 text-sm leading-snug text-text", text: o.title }));
  col.append(h("p", { class: "mt-1 obj-anchor", text: `covers: ${o.anchor}` }));

  if (status !== "idle" && st.feedback) {
    col.append(h("p", {
      role: "status",
      class: `mt-2 obj-feedback ${status === "pass" ? "obj-feedback-pass" : "obj-feedback-retry"}`,
      text: st.feedback,
    }));
  }

  const actions = h("div", { class: "mt-2 flex flex-wrap items-center gap-2" });
  actions.append(h("button", {
    type: "button",
    class: "obj-check-btn",
    "aria-label": `Check results for ${o.id}`,
    onclick: () => checkObjective(o.id),
  }, icon("check", "ic-sm"), " Check results"));
  if (hintLevel < o.hints.length) {
    const tierNames = mode === "medium" ? ["nudge", "direction", "demonstration"] : ["nudge"];
    actions.append(h("button", {
      type: "button",
      class: "hint-btn",
      "aria-label": `Open hint for ${o.id}${mode === "hard" ? " (costs score)" : ""}`,
      onclick: () => { useHint(o.id, tierNames[hintLevel] ?? "nudge"); },
    }, icon("lightbulb", "ic-sm"), mode === "hard" ? "Nudge (costs ★)" : `Hint ${hintLevel + 1}/3`));
  }
  if (st && st.attempts > 0) {
    actions.append(h("span", { class: "obj-stats text-10 text-dim", text:
      `${st.attempts} check${st.attempts > 1 ? "s" : ""}` +
      (st.hintsUsed > 0 ? ` · ${st.hintsUsed} hint${st.hintsUsed > 1 ? "s" : ""}` : "") +
      (st.firstAttempt ? " · first-try ✓" : "") }));
  }
  col.append(actions);

  if (hintLevel > 0) {
    const hintBox = h("div", { class: "mt-2 space-y-1-5" });
    o.hints.slice(0, hintLevel).forEach((htext, i) => {
      hintBox.append(h("p", { class: "hint-box" },
        h("span", { class: "font-medium" }, mode === "medium" ? `Hint ${i + 1}` : "Nudge"),
        ": " + htext));
    });
    col.append(hintBox);
  }

  row.append(col);
  li.append(row);
  return li;
}

function Tracker() {
  const sec = h("section", { class: "tracker", "aria-label": "Objectives tracker" });
  const list = objectivesForMode(state.mode);
  const done = list.filter((o) => state.obj[o.id] && state.obj[o.id].done).length;

  const toggle = h("button", {
    type: "button",
    class: "tracker-toggle",
    "aria-expanded": "true",
    onclick: () => {
      const open = sec.classList.toggle("tracker-closed");
      toggle.setAttribute("aria-expanded", String(!open));
      chev.classList.toggle("rotate-180", !open);
    },
  },
    h("h2", { class: "font-display tracker-title" }, "Objectives ",
      h("span", { class: "tracker-count text-mint", text: `${done}/${list.length}` })),
    h("span", { class: "tracker-chev", "data-role": "chev" }, icon("chevron-down", "ic text-dim")));
  const chev = toggle.querySelector('[data-role="chev"]');

  sec.append(toggle);

  const noteHolder = h("div");
  sec.append(noteHolder);

  const ol = h("ol", { class: "obj-list gh-scroll" });
  for (const o of list) ol.append(ObjectiveCard(o));
  sec.append(ol);

  if (!state.quizSubmitted && done === list.length && list.length > 0) {
    noteHolder.append(h("p", { class: "tracker-note" },
      "All rounds cleared — open ", h("strong", null, "Final Quiz"),
      " in the header to close your shift and get your grade."));
  }
  return sec;
}

/* ---------- AAA ledger strip (ledger.tsx) ---------- */
function LedgerStrip() {
  const strip = h("div", { class: "ledger-strip" });
  const inner = h("div", { class: "ledger-inner" });
  strip.append(inner);
  inner.append(icon("scroll-text", "ic-sm text-mint shrink-0"));
  inner.append(h("span", { class: "ledger-label", text: "AAA ledger" }));

  const phases = h("div", { class: "ledger-phases" });
  inner.append(phases);

  const lastLine = h("p", { class: "gh-term ledger-last", "aria-live": "polite", "aria-label": "Latest accounting entry" });
  inner.append(lastLine);

  const btn = h("button", {
    type: "button",
    class: "ledger-btn",
    "aria-label": "Open full AAA ledger",
    onclick: openLedgerSheet,
  }, icon("chevron-up", "ic-sm"), h("span", { "data-role": "ledger-count" }));
  inner.append(btn);

  strip.refresh = () => {
    const ledger = state.ledger;
    const last = ledger[ledger.length - 1];
    const counts = { AUTHN: 0, AUTHZ: 0, ACCT: 0 };
    for (const e of ledger) counts[e.phase] = (counts[e.phase] ?? 0) + 1;
    phases.textContent = "";
    for (const p of ["AUTHN", "AUTHZ", "ACCT"]) {
      phases.append(h("span", { class: `badge ledger-phase ledger-${p.toLowerCase()}`, text: `${p} ${counts[p] ?? 0}` }));
    }
    lastLine.textContent = last ? `${last.t} · ${last.phase} · ${last.msg}` : "ledger empty — start your shift";
    btn.querySelector('[data-role="ledger-count"]').textContent = `full log (${ledger.length})`;
  };
  strip.refresh();
  return strip;
}

function openLedgerSheet() {
  const ledger = state.ledger;
  const body = h("div", null);
  const listBox = h("div", { class: "gh-scroll ledger-scroll" });
  if (ledger.length === 0) listBox.append(h("p", { class: "text-sm text-dim", text: "No entries yet." }));
  const ol = h("ol", { class: "space-y-1" });
  [...ledger].reverse().forEach((e) => {
    ol.append(h("li", { class: "gh-term ledger-item" },
      h("span", { class: "text-dim", text: e.t }),
      h("span", { class: `badge ledger-phase ledger-${e.phase.toLowerCase()}`, text: e.phase }),
      h("span", { class: "text-dim", text: e.msg })));
  });
  listBox.append(ol);
  listBox.append(h("p", { class: "ledger-explainer" },
    "Every line here is ", h("strong", null, "accounting"),
    " — the third A of AAA. Authentication proved who you are when the shift started; your permission to act at each station is ",
    h("strong", null, "authorization"),
    "; this log is the ", h("strong", null, "audit trail"),
    " a real SOC would review tomorrow morning."));
  body.append(listBox);
  openSheet({ side: "bottom", title: "AAA ledger — Accounting in action", body, labelId: "ledger-sheet-title" });
}
/* ======================================================================
   app part 3 — content dialogs + completion + shell assembly + boot
   (port of dialogs.tsx + gatehouse-lab.tsx root + shell subscribe loop)
   ====================================================================== */

/* ---------- Knowledge Core (C2) ---------- */
function openKnowledgeCore() {
  const body = h("div", { class: "space-y-6 pb-4" });
  KC_SECTIONS.forEach((sec) => {
    const box = h("section", { class: "kc-sec" });
    box.append(h("h3", { class: "font-display kc-title", text: sec.title }));
    box.append(h("p", { class: "text-sm leading-relaxed text-dim", text: sec.body }));
    if (sec.extra) {
      const scroll = h("div", { class: "gh-scroll mt-3 overflow-x-auto" });
      const table = h("table", { class: "kc-table" });
      const thead = h("thead", null, h("tr", { class: "text-dim" },
        sec.extra.heads.map((hd) => h("th", { class: "kc-th", text: hd }))));
      const tbody = h("tbody");
      sec.extra.rows.forEach((r) => {
        tbody.append(h("tr", { class: "text-dim" },
          r.map((c, ci) => h("td", { class: `kc-td${ci === 0 ? " gh-term text-mint" : ""}`, text: c }))));
      });
      table.append(thead, tbody);
      scroll.append(table);
      box.append(scroll);
    }
    if (sec.mitre) {
      const ul = h("ul", { class: "mt-3 space-y-1-5" });
      sec.mitre.forEach((m) => {
        ul.append(h("li", { class: "text-xs leading-relaxed text-dim" },
          h("a", { href: m.url, target: "_blank", rel: "noopener noreferrer", class: "gh-term kc-link" },
            `${m.id} — ${m.label} `, icon("external-link", "ic-xs")),
          h("span", null, ` — ${m.note}`)));
      });
      box.append(ul);
    }
    body.append(box);
  });
  const notes = h("section", { class: "kc-sec kc-notes" });
  notes.append(h("h3", { class: "font-display kc-title text-lav", text: "Field notes from official MITRE procedure examples" }));
  const ul = h("ul", { class: "space-y-2" });
  MITRE_PROCEDURES.forEach((p) => {
    ul.append(h("li", { class: "text-sm leading-relaxed text-dim" },
      h("a", { href: p.url, target: "_blank", rel: "noopener noreferrer", class: "gh-term kc-link" },
        p.who + " ", icon("external-link", "ic-xs")),
      ` ${p.what}.`));
  });
  notes.append(ul);
  body.append(notes);
  openDialog({
    titleNode: [icon("book-open", "ic text-mint"), "Knowledge Core — logical security end to end"],
    subtitle: BRIEFING.cert, body, width: "dialog-w-lg", labelId: "kc-title",
  });
}

/* ---------- Glossary ---------- */
function openGlossary() {
  const dl = h("dl", { class: "space-y-3 pb-4" });
  GLOSSARY.forEach((g) => {
    dl.append(h("div", { class: "gloss-item" },
      h("dt", { class: "font-display gloss-term", text: g.term }),
      h("dd", { class: "mt-1 text-sm leading-relaxed text-dim", text: g.def })));
  });
  openDialog({ titleNode: [icon("book-marked", "ic text-mint"), "Glossary — 15 terms"], body: dl, width: "dialog-w-md", labelId: "gloss-title" });
}

/* ---------- Final quiz (C5) — self-updating body ---------- */
function openQuiz() {
  const mode = state.mode;
  const qs = mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;

  const body = h("div", null);
  const ol = h("ol", { class: "space-y-4 pb-4" });
  body.append(ol);
  const foot = h("div", { class: "pb-4" });
  body.append(foot);

  function isRight(q, picked) {
    return picked.length === q.correct.length && [...picked].sort().join() === [...q.correct].sort().join();
  }

  function render() {
    const answers = state.quizAnswers;
    const submitted = state.quizSubmitted;
    const correctCount = qs.filter((q) => isRight(q, answers[q.id] ?? [])).length;
    ol.textContent = "";
    qs.forEach((q, qi) => {
      const picked = answers[q.id] ?? [];
      const right = isRight(q, picked);
      const li = h("li", { class: `quiz-item ${submitted ? (right ? "quiz-item-right" : "quiz-item-wrong") : ""}` });
      li.append(h("div", { class: "flex items-start gap-2" },
        h("span", { class: "badge quiz-num", text: `Q${qi + 1}` }),
        h("p", { class: "text-sm font-medium leading-snug text-text", text: q.prompt })));
      const optBox = h("div", { class: "mt-3 grid gap-2" });
      q.options.forEach((o) => {
        const on = picked.includes(o.id);
        /* R3 color contract: only the SELECTED option is highlighted after
           submit — correct never revealed in green on a wrong submission. */
        const showGreen = submitted && on && q.correct.includes(o.id);
        const showRed = submitted && on && !q.correct.includes(o.id);
        const optBtn = h("button", {
          type: "button",
          role: q.multi ? "checkbox" : "radio",
          "aria-checked": String(on),
          disabled: submitted,
          class: `quiz-opt${showGreen ? " quiz-opt-green" : showRed ? " quiz-opt-red" : on ? " quiz-opt-on" : " quiz-opt-off"}`,
          onclick: () => {
            if (state.quizSubmitted) return;
            if (q.multi) {
              const cur = state.quizAnswers[q.id] ?? [];
              answerQuiz(q.id, cur.includes(o.id) ? cur.filter((v) => v !== o.id) : [...cur, o.id]);
            } else {
              answerQuiz(q.id, [o.id]);
            }
            render();
          },
        }, o.text);
        if (showGreen) optBtn.append(h("span", { class: "quiz-tag" }, icon("circle-check", "ic-sm"), " correct"));
        if (showRed) optBtn.append(h("span", { class: "quiz-tag" }, icon("circle-x", "ic-sm"), " incorrect"));
        optBox.append(optBtn);
      });
      li.append(optBox);
      if (submitted) {
        li.append(h("p", { class: "quiz-why" },
          h("strong", { class: "text-sky" }, "Why: "), q.explain));
      }
      ol.append(li);
    });
    foot.textContent = "";
    if (!submitted) {
      const answered = Object.keys(state.quizAnswers).length;
      foot.append(h("button", {
        type: "button",
        class: "quiz-submit",
        disabled: answered < qs.length,
        onclick: () => { submitQuiz(); render(); },
      }, answered < qs.length ? `Submit quiz (${answered}/${qs.length} answered)` : "Submit quiz"));
    } else {
      foot.append(h("p", { class: "quiz-score-line" },
        `${correctCount}/${qs.length} correct — the shift grade in the completion panel now includes this score.`));
    }
  }
  render();

  openDialog({
    titleNode: [icon("graduation-cap", "ic text-mint"),
      state.mode === "hard" ? "Final quiz — scenario triage (7 items)" : "Final quiz — concept check (6 questions)"],
    subtitle: state.quizSubmitted
      ? "Read every explanation — that is the learning."
      : state.mode === "hard"
        ? "Each item needs application, not recall. Justify your pick mentally, then commit."
        : "Answer all six — an explanation follows once you submit.",
    body, width: "dialog-w-lg", labelId: "quiz-title",
  });
}

/* ---------- Debrief (C6) ---------- */
function openDebrief() {
  const body = h("div", { class: "space-y-6 pb-4" });

  const det = h("section", { class: "kc-sec" });
  det.append(h("h3", { class: "font-display kc-title", text: "Detection opportunities" }));
  const scroll = h("div", { class: "gh-scroll overflow-x-auto" });
  const table = h("table", { class: "kc-table debrief-table" });
  const thead = h("thead", null, h("tr", { class: "text-dim" },
    ["Data source", "Look for", "Example logic"].map((hd) => h("th", { class: "kc-th", text: hd }))));
  const tbody = h("tbody");
  DETECTION_ROWS.forEach((r) => {
    tbody.append(h("tr", { class: "text-dim" },
      h("td", { class: "kc-td font-medium text-text", text: r.source }),
      h("td", { class: "kc-td", text: r.look }),
      h("td", { class: "kc-td gh-term text-sky", text: r.logic })));
  });
  table.append(thead, tbody);
  scroll.append(table);
  det.append(scroll);
  body.append(det);

  const mit = h("section", { class: "kc-sec" });
  mit.append(h("h3", { class: "font-display kc-title", text: "Mitigation recommendations (official IDs)" }));
  const mul = h("ul", { class: "space-y-2" });
  MITIGATION_RECS.forEach((m) => {
    mul.append(h("li", { class: "text-sm leading-relaxed text-dim" },
      h("a", { href: m.url, target: "_blank", rel: "noopener noreferrer", class: "gh-term kc-link text-mint" },
        `${m.id} — ${m.name} `, icon("external-link", "ic-xs")),
      h("span", null, ` — ${m.rec}`)));
  });
  mit.append(mul);
  body.append(mit);

  const grid = h("div", { class: "sm-grid-cols-2 gap-4 grid" });
  const blue = h("section", { class: "takeaway takeaway-blue" });
  blue.append(h("h3", { class: "font-display takeaway-title text-sky" }, icon("shield-check", "ic-sm"), " Blue-team takeaways"));
  blue.append(h("ul", { class: "takeaway-list" }, BLUE_TAKEAWAYS.map((t) => h("li", null, t))));
  const red = h("section", { class: "takeaway takeaway-red" });
  red.append(h("h3", { class: "font-display takeaway-title text-coral" }, icon("shield-check", "ic-sm take-red"), " Red-team mindset (defensive)"));
  red.append(h("ul", { class: "takeaway-list" }, RED_TAKEAWAYS.map((t) => h("li", null, t))));
  grid.append(blue, red);
  body.append(grid);

  const refs = h("section", { class: "kc-sec" });
  refs.append(h("h3", { class: "font-display kc-title", text: "Official references" }));
  const rul = h("ul", { class: "space-y-1-5" });
  LINKS.forEach((l) => {
    rul.append(h("li", null,
      h("a", { href: l.url, target: "_blank", rel: "noopener noreferrer", class: "debrief-link" },
        icon("external-link", "ic-sm"), " " + l.label)));
  });
  refs.append(rul);
  body.append(refs);

  openDialog({ titleNode: [icon("radar", "ic text-mint"), "Debrief — field notes for the SOC floor"], body, width: "dialog-w-lg", labelId: "debrief-title" });
}

/* ---------- Completion (C7) ---------- */
const PILLAR_ORDER = ["understand", "recognize", "detect", "mitigate"];
const PILLAR_LABEL = {
  understand: "P1 · Understand", recognize: "P2 · Recognize & analyze",
  detect: "P3 · Detect", mitigate: "P4 · Mitigate",
};

let completionOpen = false;
function maybeOpenCompletion() {
  const stats = computeStats(state.obj, state, state.mode);
  if (stats.allDone && state.quizSubmitted && !state.completionSeen && !state.gradeDismissed) {
    openCompletion();
  }
  if (state.completionSeen && !completionOpen) {
    completionOpen = true;
    openCompletionDialog();
  }
}

function openCompletionDialog() {
  const mode = state.mode;
  const stats = computeStats(state.obj, state, mode);
  const list = objectivesForMode(mode);
  const body = h("div", { class: "space-y-4 pb-4" });

  const grade = h("div", { class: "grade-box" });
  grade.append(h("p", { class: "font-display grade-score", text: stats.score !== null ? `${stats.score}%` : `${stats.doneCount}/${stats.total}` }));
  grade.append(h("div", { class: "mt-2 flex justify-center" }, StarRow(stats.stars)));
  grade.append(h("p", { class: "mt-2 text-xs text-dim", text: "stars = first-attempt accuracy (55%) + quiz score (35%) + hint discipline (10%)" }));
  if (stats.quiz) {
    grade.append(h("p", { class: "mt-1 text-xs text-dim", text:
      `quiz: ${stats.quiz.correct}/${stats.quiz.total} · first-attempt rate: ${Math.round(stats.firstAttemptRatio * 100)}% · hints used: ${stats.hintsUsed}` }));
  }
  body.append(grade);

  const pgrid = h("div", { class: "sm-grid-cols-2 gap-3 grid" });
  PILLAR_ORDER.forEach((p) => {
    const items = list.filter((o) => o.pillar === p);
    const passed = items.filter((o) => state.obj[o.id] && state.obj[o.id].done).length;
    const box = h("div", { class: "pillar-recap" });
    box.append(h("p", { class: "pillar-recap-head" },
      PILLAR_LABEL[p],
      h("span", { class: passed === items.length ? "text-mint" : "text-dim", text: `${passed}/${items.length}` })));
    const ul = h("ul", { class: "mt-1-5 space-y-1" });
    items.forEach((o) => {
      ul.append(h("li", { class: "pillar-recap-item" },
        icon("circle-check", `ic-xs shrink-0 ${state.obj[o.id] && state.obj[o.id].done ? "text-mint" : "text-dim-70"}`),
        o.id.replace("OBJ-", "")));
    });
    box.append(ul);
    pgrid.append(box);
  });
  body.append(pgrid);

  /* R8: focus areas derived from actual performance evidence */
  const quizQs = mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  const quizMisses = state.quizSubmitted
    ? quizQs.filter((q) => {
        const a = state.quizAnswers[q.id] ?? [];
        return !(a.length === q.correct.length && [...a].sort().join() === [...q.correct].sort().join());
      })
    : [];
  const weakObjs = list.filter((o) => {
    const st = state.obj[o.id];
    return !st || !st.done || (st.done && (st.attempts > 1 || st.hintsUsed > 0));
  });
  const weakPillars = PILLAR_ORDER.filter((p) => {
    const items = list.filter((o) => o.pillar === p);
    return items.length > 0 && items.some((o) => !state.obj[o.id] || !state.obj[o.id].done);
  });
  const hasFocus = weakObjs.length > 0 || quizMisses.length > 0;
  const focus = h("div", { class: `focus-box ${hasFocus ? "focus-box-weak" : "focus-box-clean"}` });
  focus.append(h("p", { class: "focus-head" },
    icon("circle-x", `ic-sm ${hasFocus ? "text-coral" : "text-mint"}`),
    " Focus areas — where to push next"));
  if (hasFocus) {
    const ul = h("ul", { class: "mt-2 space-y-2" });
    if (weakPillars.length > 0) {
      ul.append(h("li", { class: "text-xs leading-relaxed text-dim" },
        h("strong", { class: "text-text" }, "Weak pillars: "),
        weakPillars.map((p) => PILLAR_LABEL[p]).join(", ") + " — still has uncleared objectives."));
    }
    weakObjs.slice(0, 6).forEach((o) => {
      const st = state.obj[o.id];
      const why = !st || !st.done
        ? "not yet passed"
        : `passed after ${st.attempts} check${st.attempts > 1 ? "s" : ""}${st.hintsUsed > 0 ? ` + ${st.hintsUsed} hint${st.hintsUsed > 1 ? "s" : ""}` : ""}`;
      ul.append(h("li", { class: "text-xs leading-relaxed text-dim" },
        h("strong", { class: "text-text" }, `${o.id.replace("OBJ-", "")} (${why}): `),
        `${o.anchor} — re-run this station's exercise until the check passes first-try, then re-read its tracker feedback.`));
    });
    quizMisses.forEach((q) => {
      ul.append(h("li", { class: "text-xs leading-relaxed text-dim" },
        h("strong", { class: "text-text" }, `Quiz miss (${q.id}): `),
        QUIZ_FOCUS[q.id] ?? q.prompt));
    });
    focus.append(ul);
  } else {
    focus.append(h("p", { class: "mt-2 text-xs leading-relaxed text-dim", text:
      "Clean run: every objective passed first-try without hints and every quiz item was correct — no weak areas detected. Keep the next-steps list below as your stretch plan." }));
  }
  body.append(focus);

  const nextBox = h("div", { class: "kc-sec" });
  nextBox.append(h("p", { class: "focus-head" }, icon("route", "ic-sm text-mint"), " What to learn next"));
  const nul = h("ul", { class: "mt-2 space-y-1-5" });
  NEXT_STEPS.forEach((n) => {
    nul.append(h("li", { class: "flex gap-2 text-xs leading-relaxed text-dim" },
      icon("star", "ic-xs shrink-0 text-amber"), n));
  });
  nextBox.append(nul);
  body.append(nextBox);

  if (!(stats.allDone && stats.quiz)) {
    body.append(h("p", { class: "remaining-note" },
      `Remaining: ${stats.total - stats.doneCount} objective(s)${state.quizSubmitted ? "" : " + the final quiz"}. You can close this panel and keep working — the CHECK buttons live in the objectives tracker.`));
  }

  body.append(h("div", { "data-role": "completion-close-holder" }));

  const api = openDialog({
    titleNode: [icon("trophy", "ic text-amber"),
      stats.allDone && stats.quiz ? "Shift complete — shift grade" : "Shift progress"],
    subtitle: stats.allDone && stats.quiz
      ? "Every objective cleared and the quiz submitted. Here is what you proved tonight."
      : "Clear every objective and submit the final quiz to compute your shift grade.",
    body, width: "dialog-w-md dialog-mint", labelId: "completion-title",
    onClose: () => {
      completionOpen = false;
      /* ESC / X / overlay-click close must mirror the original's
         onOpenChange(false) → gradeDismissed so it never auto-reopens */
      closeCompletion();
    },
  });
  /* the DOM close button: one path — close the overlay, onClose syncs state */
  const holder = body.querySelector('[data-role="completion-close-holder"]');
  holder.replaceWith(h("button", {
    type: "button", class: "quiz-submit", onclick: () => api.close(),
  }, "Back to the lab"));
  return api;
}

/* ---------- reset confirm (shell.tsx AlertDialog, copy verbatim) ---------- */
function openResetDialog() {
  const body = h("div", null);
  const foot = h("div", { class: "reset-foot" });
  foot.append(h("button", { type: "button", class: "reset-cancel", onclick: () => api.close() }, "Keep my shift"));
  foot.append(h("button", {
    type: "button", class: "reset-confirm",
    onclick: () => { api.close(); resetAll(); },
  }, "Reset everything"));
  body.append(h("p", { class: "text-sm leading-relaxed text-dim", text:
    "This wipes every answer, check, hint and ledger entry and returns the lab to its pristine state. This cannot be undone." }));
  body.append(foot);
  const api = openDialog({ title: "Reset the lab?", body, width: "dialog-w-sm", labelId: "reset-title" });
  return api;
}

/* ---------- mobile menu sheet (shell.tsx Sheet) ---------- */
function openMenuSheet() {
  const body = h("div", { class: "mt-2 grid gap-2" });
  const mk = (iconName, label, fn) => h("button", {
    type: "button", class: "header-btn header-btn-mobile",
    onclick: () => { api.close(); fn(); },
  }, icon(iconName, "ic-sm"), label);
  body.append(
    mk("book-open", "Knowledge Core", openKnowledgeCore),
    mk("book-marked", "Glossary", openGlossary),
    mk("graduation-cap", state.quizSubmitted ? "Quiz (graded)" : "Final Quiz", openQuiz),
    mk("radar", "Debrief", openDebrief),
    mk("graduation-cap", "Shift grade", () => openCompletion()));
  const api = openSheet({ side: "right", title: "Lab panels", body, width: "sheet-w-menu", labelId: "menu-title" });
  return api;
}

/* ======================================================================
   Lab shell assembly + store subscription
   ====================================================================== */
function LabShell() {
  const root = h("div", { class: "lab-root" });

  /* header strip */
  const header = h("header", { class: "site-header" });
  const hWrap = h("div", { class: "header-inner" });
  hWrap.append(h("span", { class: "logo-box" }, icon("heart-pulse", "ic text-mint")));
  const titles = h("div", { class: "min-w-0" },
    h("h1", { class: "font-display header-title" }, "GATEHOUSE ",
      h("span", { class: "header-sub-org", text: "— Meridian Regional Access-Control Room" })),
    h("p", { class: "gh-term header-sub", text:
      `N10-009 · Objective 4.1 · Logical security · ${state.mode === "hard" ? "night shift" : "day shift"}` }));
  hWrap.append(titles);

  const right = h("div", { class: "header-right" });
  const modeBadge = h("span", {
    class: `badge mode-badge ${state.mode === "hard" ? "mode-badge-hard" : "mode-badge-day"}`,
  }, icon(state.mode === "hard" ? "moon-star" : "sun", "ic-xs"), state.mode === "hard" ? "HARD" : "MEDIUM");
  const ringHolder = h("span", { "data-role": "ring" });
  const dialogBtns = h("span", { class: "header-dialog-btns" },
    HeaderButton("book-open", "Knowledge Core", openKnowledgeCore),
    HeaderButton("book-marked", "Glossary", openGlossary),
    HeaderButton("graduation-cap", state.quizSubmitted ? "Quiz (graded)" : "Final Quiz", openQuiz),
    HeaderButton("radar", "Debrief", openDebrief),
    HeaderButton("graduation-cap", "Shift grade", () => openCompletion()));
  const resetBtn = h("button", {
    type: "button", class: "header-btn reset-btn", "aria-label": "Reset lab",
    onclick: openResetDialog,
  }, icon("rotate-ccw", "ic-sm"), h("span", { class: "reset-label", text: "Reset" }));
  const menuBtn = h("button", {
    type: "button", class: "header-btn menu-btn", "aria-label": "Open lab panels menu",
    onclick: openMenuSheet,
  }, icon("menu", "ic"));
  right.append(modeBadge, ringHolder, dialogBtns, resetBtn, menuBtn);
  hWrap.append(right);
  header.append(hWrap);

  /* mobile circuit chips */
  const chipsBar = h("div", { class: "chips-bar" });
  const chipsHolder = h("div", { "data-role": "chips" });
  chipsBar.append(chipsHolder);

  /* body grid */
  const grid = h("div", { class: "body-grid" });
  const railCol = h("aside", { class: "rail-col" });
  const railHolder = h("div", { "data-role": "rail" });
  const railNote = h("p", { class: "rail-note", text:
    state.mode === "medium"
      ? "Guided rounds: stations unlock as you clear the previous round."
      : "Night shift: every station is open — Incident 2211 and the rule bench live at the Audit Desk." });
  railCol.append(h("h2", { class: "rail-heading", text: "Checkpoint circuit" }), railHolder, railNote);
  grid.append(railCol);

  const ws = Workspace();
  grid.append(ws);

  const trackerCol = h("aside", { class: "tracker-col" });
  const trackerHolder = h("div", { class: "tracker-box" });
  trackerHolder.append(Tracker());
  trackerCol.append(trackerHolder);
  grid.append(trackerCol);

  const ledger = LedgerStrip();

  root.append(header, chipsBar, grid, ledger);

  /* initial chrome population (rail, chips, ring, ledger, quiz label) */
  refreshChrome();
  ws.renderStation(false);

  /* ---------- reactive updates ---------- */
  let lastActive = state.active;
  let lastUnlockSig = unlockSignature();
  let lastObjSig = objSignature();

  function unlockSignature() {
    const modeObjs = objectivesForMode(state.mode);
    return STATIONS.map((st, i) => isStationUnlocked(i, state.mode, state.obj, modeObjs) ? 1 : 0).join("");
  }
  function objSignature() {
    return JSON.stringify({ o: state.obj, q: state.quizSubmitted, m: state.mode });
  }

  function refreshChrome() {
    /* rail + chips: rebuild, restoring focus to the same station button */
    const activeEl = document.activeElement;
    const focusedStation = activeEl && activeEl.getAttribute && activeEl.getAttribute("data-station");
    const railHolder = root.querySelector('[data-role="rail"]');
    railHolder.textContent = "";
    railHolder.append(CircuitRail());
    const chipsHolder = root.querySelector('[data-role="chips"]');
    chipsHolder.textContent = "";
    chipsHolder.append(CircuitChips());
    if (focusedStation) {
      const again = root.querySelector(`[data-station="${focusedStation}"]`);
      if (again && !again.disabled) again.focus();
    }
    /* progress ring */
    const stats = computeStats(state.obj, state, state.mode);
    const rh = root.querySelector('[data-role="ring"]');
    rh.textContent = "";
    rh.append(ProgressRing(stats.doneCount, stats.total));
    /* quiz label after submit */
    const quizBtn = [...root.querySelectorAll(".header-dialog-btns .header-btn")].find((b) => b.textContent.includes("Quiz") || b.textContent.includes("quiz"));
    if (quizBtn) {
      const want = state.quizSubmitted ? "Quiz (graded)" : "Final Quiz";
      if (!quizBtn.textContent.includes(want)) {
        quizBtn.textContent = "";
        quizBtn.append(icon("graduation-cap", "ic-sm"), want);
      }
    }
  }

  function refreshFocusAware() {
    refreshChrome();
    /* ledger */
    ledger.refresh();
    /* workspace badges + banner without rebuilding station widgets */
    ws.refreshBadges();
    /* tracker rebuild (buttons only — safe), preserving scroll */
    const ol = root.querySelector(".obj-list");
    const keep = ol ? ol.scrollTop : 0;
    const tb = root.querySelector(".tracker-box");
    tb.textContent = "";
    tb.append(Tracker());
    const ol2 = root.querySelector(".obj-list");
    if (ol2) ol2.scrollTop = keep;
    /* completion auto-open */
    maybeOpenCompletion();
  }

  shellUnsub = subscribe((next, prev) => {
    const uSig = unlockSignature();
    if (next.active !== lastActive || uSig !== lastUnlockSig) {
      const switched = next.active !== lastActive;
      lastActive = next.active;
      lastUnlockSig = uSig;
      ws.renderStation(switched);
    }
    const oSig = objSignature();
    if (oSig !== lastObjSig) {
      lastObjSig = oSig;
      refreshFocusAware();
    } else {
      ledger.refresh();
      maybeOpenCompletion();
    }
  });

  return root;
}

/* ---------- root gate (gatehouse-lab.tsx) ---------- */
let appRoot = null;
let shellUnsub = null;

function renderApp() {
  /* dispose the previous shell's subscription so detached DOM never reacts */
  if (shellUnsub) { shellUnsub(); shellUnsub = null; }
  appRoot.textContent = "";
  if (state.mode === "select") appRoot.append(ModeSelect());
  else appRoot.append(LabShell());
}

function boot() {
  appRoot = document.getElementById("root");
  if (!appRoot) return;
  /* root-level gate: a mode change swaps the whole screen (this is what makes
     the mode-select cards work — they fire before any shell exists) */
  subscribe((next, prev) => {
    if (next.mode !== prev.mode) renderApp();
  });
  renderApp();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
