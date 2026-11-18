// ── App bootstrap — mode gate, plant chrome, foreman's board, event hub ────
// Vanilla ports of TheOctetWorks.tsx, ModeGate.tsx, PlantChrome.tsx and
// ForemanBoard.tsx. Rendering is region-scoped (gate / header / nav / stage /
// board / quiz / cards) with focus preservation, mirroring how the original
// React tree re-rendered only the affected components.
"use strict";

var App = (function () {
  const { esc, icon, machineHeader, syntheticTag } = UI;
  const { actions, objectivesForMode, starsOf } = LabStore;
  const S = () => LabStore.state;

  // non-persisted UI state (local component state in the original)
  const ui = {
    activeZone: "dock",
    boardOpen: new Set(), // expanded objective cards
    boardDialogOpen: false,
  };

  const ZONES = [
    { id: "dock", label: "Receiving Dock", icon: "Inbox", blurb: "Work orders & evidence" },
    { id: "floor", label: "Machining Floor", icon: "Cog", blurb: "Presses, rail & solver" },
    { id: "loadout", label: "Dispatch / Loadout", icon: "Package", blurb: "Plans & VLSM bays" },
    { id: "bench", label: "Test Bench", icon: "Terminal", blurb: "Diagnostics terminal" },
    { id: "wall", label: "Training Wall", icon: "BookOpen", blurb: "Knowledge core & glossary" },
    { id: "debrief", label: "Shift Debrief", icon: "ClipboardCheck", blurb: "Quiz & field notes" },
  ];
  const zoneLabel = (id) => (ZONES.find((z) => z.id === id) || { label: id }).label;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // ── counts helper ──────────────────────────────────────────────────────────
  function zoneCounts() {
    const st = S();
    const list = objectivesForMode(st.mode);
    const m = {};
    for (const z of ZONES) m[z.id] = { d: 0, t: 0 };
    for (const o of list) {
      m[o.zone].t += 1;
      if ((st.objectives[o.id] || {}).done) m[o.zone].d += 1;
    }
    return m;
  }

  // ════════════════════════════ MODE GATE ═══════════════════════════════════
  function gateHTML() {
    return `
    <main class="gate">
      <div class="gate-inner">
        <p class="gate-kicker">CompTIA Network+ · N10-009 · Lesson 1.9 — IPv4 addressing</p>
        <h1 class="gate-title">The Octet Works</h1>
        <p class="gate-brief">You have been hired at Meridian Industrial Co.'s IPv4 addressing plant. Addresses arrive as
          raw 32-bit stock; your shift sorts them, machines subnets from them, and troubleshoots the hosts
          that hold them. This week the plant is messy: an overnight DHCP outage left hosts self-assigned
          on 169.254.x, a mis-configured mask is strangling a work order, and a duplicate static IP is
          flapping the file server. Choose your shift — the plant is the same, the supervision is not.</p>

        <div class="gate-modes">
          <section aria-label="Day Shift mode — guided apprenticeship (medium difficulty)" class="gate-card gate-card-day anim-in-left">
            <div class="gate-card-head">
              ${icon("Sun", "icon-20 icon-amber")}
              <h2 class="gate-card-title day">Day Shift</h2>
              <span class="gate-badge day">MEDIUM</span>
            </div>
            <p class="gate-card-desc">Guided apprenticeship. 12 numbered work orders introduced one by one, a foreman who points
              where to look, three hint tiers per job, and tolerant checks that accept equivalent forms.</p>
            <ul class="gate-list">
              <li>${icon("Compass", "icon-16 icon-amber-80")} Every job has a “where to look” pointer</li>
              <li>${icon("Gauge", "icon-16 icon-amber-80")} 10–12 granular jobs, Understand → Apply</li>
              <li>${icon("Target", "icon-16 icon-amber-80")} Wrong answers teach — never punish</li>
            </ul>
            <button type="button" data-action="choose-mode" data-mode="medium"
              class="btn btn-day">Start day shift ${icon("ArrowRight", "icon-16")}</button>
          </section>

          <section aria-label="Night Shift mode — independent incident response (hard difficulty)" class="gate-card gate-card-night anim-in-right">
            <div class="gate-card-head">
              ${icon("Moon", "icon-20 icon-rose")}
              <h2 class="gate-card-title night">Night Shift</h2>
              <span class="gate-badge night">HARD</span>
            </div>
            <p class="gate-card-desc">Independent incident response. The same plant, but the board is noisy: decoys and red
              herrings, no pointers, exact values required, near-misses rejected with a rationale.
              One optional nudge — and it costs a full star.</p>
            <ul class="gate-list">
              <li>${icon("Timer", "icon-16 icon-rose-80")} 9 broad, multi-step incidents</li>
              <li>${icon("Target", "icon-16 icon-rose-80")} Analyze · Evaluate · Create (Bloom)</li>
              <li>${icon("Gauge", "icon-16 icon-rose-80")} Strict validation, planted traps</li>
            </ul>
            <button type="button" data-action="choose-mode" data-mode="hard"
              class="btn btn-night">Start night shift ${icon("ArrowRight", "icon-16")}</button>
          </section>
        </div>

        <div class="gate-foot">
          <p>Progress auto-saves in this browser. A labelled RESET restores the pristine plant at any time.</p>
          ${syntheticTag()}
        </div>
      </div>
    </main>`;
  }

  // ════════════════════════════ HEADER / CHROME ═════════════════════════════
  function ringHTML() {
    const st = S();
    const list = objectivesForMode(st.mode);
    const done = list.filter((o) => (st.objectives[o.id] || {}).done).length;
    const r = (44 - 6) / 2;
    const c = 2 * Math.PI * r;
    const pct = list.length === 0 ? 0 : done / list.length;
    return `
      <svg width="44" height="44" role="img" aria-label="${done} of ${list.length} objectives stamped" class="ring" id="ring-svg">
        <circle cx="22" cy="22" r="${r}" fill="none" stroke="#3f3f46" stroke-width="4"></circle>
        <circle id="ring-progress" cx="22" cy="22" r="${r}" fill="none" stroke="#f5a524" stroke-width="4"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"
          transform="rotate(-90 22 22)"></circle>
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" class="ring-text" id="ring-text">${done}/${list.length}</text>
      </svg>`;
  }

  function headerHTML() {
    const st = S();
    const list = objectivesForMode(st.mode);
    const done = list.filter((o) => (st.objectives[o.id] || {}).done).length;
    const stars = starsOf(st.objectives, st.mode);
    return `
      <div class="header-row">
        <button type="button" data-action="open-board-dialog" aria-label="Open foreman's objective board"
          class="btn btn-outline btn-board-btn">
          ${icon("PanelLeft", "icon-16")}<span class="board-btn-word">Board</span>
          <span class="board-btn-count" id="board-count">${done}/${list.length}</span>
        </button>

        <div class="header-title">
          <h1 class="app-title">The Octet Works</h1>
          <p class="app-subtitle">IPv4 addressing plant · N10-009 1.9 · Meridian Industrial Co. (fictional)</p>
        </div>

        <span class="mode-badge ${st.mode === "medium" ? "mode-medium" : "mode-hard"}">${st.mode === "medium" ? "☀ Day shift" : "☾ Night shift"}</span>

        <span class="star-chip" aria-label="Star rating ${stars} of 5" id="star-chip">
          ${icon("Star", "icon-14 star-fill")} <span id="star-value">${stars.toFixed(2)}</span>
        </span>

        ${ringHTML()}

        <button type="button" data-action="open-reset-dialog" aria-label="Reset the lab to pristine state" class="btn btn-reset">
          ${icon("RotateCcw", "icon-16")}<span class="reset-word">Reset</span>
        </button>
      </div>
      <div class="header-subrow">
        <p>All hosts, addresses and logs in this plant are synthetic</p>
        <span class="hide-sm">${syntheticTag()}</span>
      </div>`;
  }

  function chipHTML() {
    const counts = zoneCounts();
    return ZONES.map((z) => {
      const active = z.id === ui.activeZone;
      const c = counts[z.id];
      return `
      <button type="button" role="tab" aria-selected="${active}" data-action="zone-nav" data-zone="${z.id}" data-zonechip="${z.id}"
        class="zone-chip ${active ? "is-active" : ""}">
        ${icon(z.icon, "icon-14")} ${esc(z.label)}
        ${c.t > 0 ? `<span class="chip-count ${c.d === c.t ? "count-done" : ""}" data-zone-count="${z.id}">${c.d}/${c.t}</span>` : ""}
      </button>`;
    }).join("");
  }

  function railHTML() {
    const counts = zoneCounts();
    return ZONES.map((z) => {
      const active = z.id === ui.activeZone;
      const c = counts[z.id];
      return `
      <button type="button" data-action="zone-nav" data-zone="${z.id}" data-zonerail="${z.id}" ${active ? 'aria-current="page"' : ""}
        class="rail-btn ${active ? "is-active" : ""}">
        ${icon(z.icon, "icon-16")}
        <span class="rail-text">
          <span class="rail-label">${esc(z.label)}</span>
          <span class="rail-blurb">${esc(z.blurb)}</span>
        </span>
        ${c.t > 0 ? `<span class="rail-count ${c.d === c.t ? "count-done" : ""}" data-zone-count="${z.id}">${c.d}/${c.t}</span>` : ""}
      </button>`;
    }).join("");
  }

  function shellHTML() {
    return `
    <div class="plant">
      <header class="plant-header" id="plant-header">${headerHTML()}</header>

      <div class="chipbar"><nav aria-label="Plant zones" role="tablist" class="chip-nav" id="chip-nav">${chipHTML()}</nav></div>

      <div class="plant-grid">
        <nav aria-label="Plant zones" class="rail" id="rail">${railHTML()}</nav>

        <main class="stage" aria-live="polite">
          <div class="zone-enter" id="zone-stage"></div>
        </main>

        <aside class="board-aside" aria-label="Foreman's board sidebar">
          <div class="board-aside-scroll" id="board-aside"></div>
        </aside>
      </div>
    </div>`;
  }

  // ════════════════════════════ FOREMAN'S BOARD ═════════════════════════════
  function objectiveCardHTML(def) {
    const st = S();
    const progress = st.objectives[def.id];
    const done = (progress || {}).done ?? false;
    const hintsUsed = (progress || {}).hintsUsed ?? 0;
    const maxHints = st.mode === "hard" ? 1 : 3;
    const hintCost = st.mode === "hard" ? "−1.00★" : "−0.50★";
    const open = ui.boardOpen.has(def.id);

    let body = "";
    if (open) {
      const hintsBlock = hintsUsed > 0
        ? `<div class="obj-hints" aria-live="polite">
            ${def.hints.slice(0, hintsUsed).map((h, i) => `
              <p><span class="obj-hint-label">Hint ${i + 1}:</span>${esc(h)}</p>`).join("")}
          </div>`
        : "";
      const fb = (progress || {}).lastFeedback;
      const feedbackBlock = fb
        ? `<div role="status" aria-live="polite" class="obj-feedback ${fb.ok ? "fb-ok" : "fb-fail"}">
            <span class="obj-fb-label">${fb.ok ? "Foreman approves" : "Foreman sends it back"}</span>${esc(fb.text)}
          </div>`
        : "";
      body = `
      <div class="obj-body">
        <p class="obj-text">${esc(def.text)}</p>
        ${st.mode === "medium" && !done
          ? `<p class="obj-where">${icon("MapPin", "icon-12")}<span><span class="obj-where-label">Where to look:</span> ${esc(def.where)}</span></p>`
          : ""}
        <p class="obj-anchor">${icon("Crosshair", "icon-12")} covers: ${esc(def.anchor)}</p>
        <div class="obj-actions">
          <button type="button" data-action="check-obj" data-id="${def.id}" ${done ? "disabled" : ""}
            data-fid="check-${def.id}"
            class="btn btn-obj-check ${done ? "btn-stamped" : ""}">
            ${icon("CheckCircle2", "icon-14")} ${done ? "Stamped" : "Check results"}
          </button>
          ${!done && hintsUsed < maxHints
            ? `<button type="button" data-action="use-hint" data-id="${def.id}" data-fid="hint-${def.id}"
                class="btn btn-obj-hint">${icon("Lightbulb", "icon-14 icon-amber")} Foreman hint ${hintsUsed + 1}/${maxHints} <span class="hint-cost">${hintCost}</span></button>`
            : ""}
          <button type="button" data-action="go-zone" data-zone="${def.zone}" class="btn btn-obj-go">
            Go to ${esc(zoneLabel(def.zone))} ${icon("ArrowRight", "icon-12")}
          </button>
        </div>
        ${hintsBlock}
        ${feedbackBlock}
        <p class="obj-meta">${icon("Info", "icon-12")} attempts: ${(progress || {}).attempts ?? 0} · hints: ${hintsUsed}</p>
      </div>`;
    }

    return `
    <article class="obj-card ${done ? "obj-done" : ""}" data-obj-card="${def.id}">
      <button type="button" data-action="toggle-card" data-id="${def.id}" aria-expanded="${open}"
        data-fid="toggle-${def.id}" class="obj-toggle">
        <span class="obj-id">${def.id.replace("OBJ-", "")}</span>
        <span class="obj-head">
          <span class="obj-title ${done ? "title-done" : ""}">${esc(def.title)}</span>
          <span class="obj-badges">${UI.pillarBadge(def.pillar)}${UI.stamped(done)}</span>
        </span>
      </button>
      ${body}
    </article>`;
  }

  function boardHTML() {
    const st = S();
    const list = objectivesForMode(st.mode);
    const done = list.filter((o) => (st.objectives[o.id] || {}).done).length;
    return `
    <section aria-label="Foreman's board — objective tracker" class="board">
      <div class="board-head">
        <h2 class="board-title">Foreman's board</h2>
        <p class="board-sub">${done}/${list.length} work orders stamped · hints &amp; failed checks cost stars</p>
      </div>
      ${list.map((o) => objectiveCardHTML(o)).join("")}
    </section>`;
  }

  function renderBoardCard(id) {
    const def = objectivesForMode(S().mode).find((o) => o.id === id);
    if (!def) return;
    const el = $(`[data-obj-card="${id}"]`);
    if (!el) return;
    const fid = UI.captureFocus(el);
    el.outerHTML = objectiveCardHTML(def);
    if (fid) UI.restoreFocus(document, fid);
  }

  // ════════════════════════════ RENDER ORCHESTRATION ════════════════════════
  function renderZone() {
    const stage = $("#zone-stage");
    if (!stage) return;
    stage.innerHTML = Zones.renderZone(ui.activeZone);
    // re-trigger the 180ms entrance animation, as AnimatePresence did
    stage.classList.remove("zone-anim");
    void stage.offsetWidth;
    stage.classList.add("zone-anim");
  }

  function updateHeader() {
    const st = S();
    const list = objectivesForMode(st.mode);
    const done = list.filter((o) => (st.objectives[o.id] || {}).done).length;
    const stars = starsOf(st.objectives, st.mode);
    const count = $("#board-count");
    if (count) count.textContent = `${done}/${list.length}`;
    const sv = $("#star-value");
    if (sv) sv.textContent = stars.toFixed(2);
    const chip = $("#star-chip");
    if (chip) chip.setAttribute("aria-label", `Star rating ${stars} of 5`);
    const ringText = $("#ring-text");
    if (ringText) ringText.textContent = `${done}/${list.length}`;
    const ringSvg = $("#ring-svg");
    if (ringSvg) {
      ringSvg.setAttribute("aria-label", `${done} of ${list.length} objectives stamped`);
      const c = 2 * Math.PI * ((44 - 6) / 2);
      const pct = list.length === 0 ? 0 : done / list.length;
      const prog = $("#ring-progress");
      if (prog) prog.style.strokeDashoffset = String(c * (1 - pct));
    }
  }

  function patchZoneCounts() {
    const counts = zoneCounts();
    $$("[data-zone-count]").forEach((el) => {
      const z = el.getAttribute("data-zone-count");
      const c = counts[z];
      if (!c || c.t === 0) return;
      el.textContent = `${c.d}/${c.t}`;
      el.classList.toggle("count-done", c.d === c.t);
    });
  }

  function patchNavActive() {
    $$("[data-zonerail]").forEach((b) => {
      const active = b.getAttribute("data-zonerail") === ui.activeZone;
      b.classList.toggle("is-active", active);
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    $$("[data-zonechip]").forEach((b) => {
      const active = b.getAttribute("data-zonechip") === ui.activeZone;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
  }

  function renderAll() {
    UI.closeTip();
    const app = $("#app");
    if (S().mode === "none") {
      app.innerHTML = gateHTML();
      return;
    }
    app.innerHTML = shellHTML();
    $("#board-aside").innerHTML = boardHTML();
    renderZone();
  }

  // ════════════════════════════ DIALOGS ═════════════════════════════════════
  function openBoardDialog() {
    ui.boardDialogOpen = true;
    UI.openDialog({
      labelledBy: "board-dlg-title",
      content: `
        <h2 id="board-dlg-title" class="sr-only">Foreman's board</h2>
        <p class="sr-only">Objective tracker</p>
        <button type="button" data-action="close-dialog" class="dialog-x" aria-label="Close">
          ${icon("X", "icon-16")}<span class="sr-only">Close</span>
        </button>
        <div class="dialog-board-scroll">${boardHTML()}</div>`,
    });
  }

  function openResetDialog() {
    UI.openDialog({
      labelledBy: "reset-title",
      content: `
        <div class="reset-dialog">
          <h2 id="reset-title" class="reset-title">${icon("AlertTriangle", "icon-20")} Reset the plant?</h2>
          <p class="reset-desc">This wipes every stamp, hint, quiz answer and bench state in this browser and returns you
            to the shift-selection gate. There is no undo.</p>
          <div class="reset-actions">
            <button type="button" data-action="close-dialog" data-autofocus class="btn btn-outline">Keep working</button>
            <button type="button" data-action="confirm-reset" class="btn btn-danger">Reset everything</button>
          </div>
        </div>`,
    });
  }

  function openReport() {
    UI.openDialog({
      labelledBy: "eos-title",
      content: `
        <button type="button" data-action="close-report" class="dialog-x" aria-label="Close">
          ${icon("X", "icon-16")}<span class="sr-only">Close</span>
        </button>
        <div class="dialog-report">${Quiz.endOfShiftHTML()}</div>`,
    });
  }

  // ════════════════════════════ EVENT HUB ═══════════════════════════════════
  function switchZone(z) {
    ui.activeZone = z;
    patchNavActive();
    renderZone();
  }

  function handleClick(e) {
    const actionEl = e.target.closest("[data-action]");
    // outside-click close for the glossary tip (clicks inside the popover keep it open)
    if (!e.target.closest(".tip-popover")) {
      if (!actionEl || actionEl.getAttribute("data-action") !== "toggle-tip") UI.closeTip();
    }
    if (!actionEl) return;
    const action = actionEl.getAttribute("data-action");

    switch (action) {
      case "toggle-tip": {
        const wasOpen = actionEl.getAttribute("aria-expanded") === "true";
        UI.closeTip();
        if (!wasOpen) UI.openTip(actionEl);
        break;
      }
      case "choose-mode":
        actions.setMode(actionEl.getAttribute("data-mode"));
        break;
      case "zone-nav":
        switchZone(actionEl.getAttribute("data-zone"));
        break;
      case "open-board-dialog":
        openBoardDialog();
        break;
      case "close-dialog":
        UI.closeDialog();
        break;
      case "open-reset-dialog":
        openResetDialog();
        break;
      case "confirm-reset":
        UI.closeDialog();
        actions.resetAll();
        break;
      case "open-report":
        openReport();
        break;
      case "close-report":
        actions.setCompletionSeen();
        UI.closeDialog();
        break;
      case "open-ticket": {
        const id = actionEl.getAttribute("data-id");
        Zones.openTicketId = id;
        const read = S().env.dock.read;
        if (!read.includes(id)) actions.setEnvPath("dock.read", [...read, id]);
        const stage = $("#zone-stage");
        const fid = UI.captureFocus(stage);
        stage.innerHTML = Zones.renderZone("dock");
        if (fid) UI.restoreFocus(stage, fid);
        break;
      }
      case "dock-tab": {
        Zones.dockTab = actionEl.getAttribute("data-tab");
        const stage = $("#zone-stage");
        stage.innerHTML = Zones.renderZone("dock");
        break;
      }
      case "flag-ticket": {
        const id = actionEl.getAttribute("data-id");
        actions.toggleEnvArr("dock.h1", id);
        const flagged = S().env.dock.h1.includes(id);
        actionEl.classList.toggle("is-flagged", flagged);
        actionEl.setAttribute("aria-pressed", String(flagged));
        actionEl.innerHTML = `${icon("Flag", "icon-12")} ${flagged ? "Flagged as faulty" : "Flag as faulty"}`;
        break;
      }
      case "pick-choice": {
        const group = actionEl.getAttribute("data-group");
        const key = actionEl.getAttribute("data-key");
        actions.setEnvPath(group, key);
        // surgical radio-group update: only the picked option carries the selected state
        $$(`[data-action="pick-choice"][data-group="${CSS.escape(group)}"]`).forEach((b) => {
          const isSel = b === actionEl;
          b.classList.toggle("is-selected", isSel);
          b.setAttribute("aria-pressed", String(isSel));
        });
        break;
      }
      case "toggle-chip": {
        const path = actionEl.getAttribute("data-path");
        const item = actionEl.getAttribute("data-item");
        actions.toggleEnvArr(path, item);
        const arr = path.split(".").reduce((o, k) => o[k], S().env);
        const on = arr.includes(item);
        actionEl.classList.toggle("is-selected", on);
        actionEl.setAttribute("aria-pressed", String(on));
        const suffix = actionEl.querySelector("[data-suffix]");
        if (suffix) {
          suffix.textContent = on ? (path === "press.m2" ? " · private" : " · reject") : "";
        }
        break;
      }
      case "stamp-class": {
        const addr = actionEl.getAttribute("data-addr");
        const cls = actionEl.getAttribute("data-cls");
        actions.setEnvRecord("press", "m1", addr, cls);
        const groupEl = $(`[data-stamp-group="${CSS.escape(addr)}"]`);
        if (groupEl) {
          $$(".stamp-btn", groupEl).forEach((b) => {
            const on = b.getAttribute("data-cls") === S().env.press.m1[addr];
            b.classList.toggle("is-selected", on);
            b.setAttribute("aria-pressed", String(on));
          });
        }
        break;
      }
      case "seq-add": {
        const id = actionEl.getAttribute("data-id");
        actions.setEnvPath("bench.h6", [...S().env.bench.h6, id]);
        $("#h6-sequencer").innerHTML = Zones.sequencerHTML();
        break;
      }
      case "seq-remove": {
        const id = actionEl.getAttribute("data-id");
        actions.setEnvPath("bench.h6", S().env.bench.h6.filter((x) => x !== id));
        $("#h6-sequencer").innerHTML = Zones.sequencerHTML();
        break;
      }
      case "toggle-card": {
        const id = actionEl.getAttribute("data-id");
        if (ui.boardOpen.has(id)) ui.boardOpen.delete(id);
        else ui.boardOpen.add(id);
        renderBoardCard(id);
        break;
      }
      case "check-obj": {
        const id = actionEl.getAttribute("data-id");
        actions.checkObjective(id);
        renderBoardCard(id);
        updateHeader();
        patchZoneCounts();
        const trig = $("#shift-trigger");
        if (trig) trig.innerHTML = Zones.shiftTriggerHTML();
        break;
      }
      case "use-hint": {
        const id = actionEl.getAttribute("data-id");
        actions.useHint(id);
        renderBoardCard(id);
        updateHeader();
        break;
      }
      case "go-zone":
        switchZone(actionEl.getAttribute("data-zone"));
        break;
      case "quiz-pick": {
        const qid = actionEl.getAttribute("data-qid");
        const idx = Number(actionEl.getAttribute("data-idx"));
        const region = $("#quiz-region");
        const fid = UI.captureFocus(region);
        actions.pickQuiz(qid, idx);
        region.innerHTML = Quiz.render();
        if (fid) UI.restoreFocus(region, fid);
        break;
      }
      case "quiz-check": {
        const qid = actionEl.getAttribute("data-qid");
        actions.checkQuiz(qid);
        $("#quiz-region").innerHTML = Quiz.render();
        break;
      }
      case "quiz-next": {
        const total = Number(actionEl.getAttribute("data-total"));
        actions.nextQuiz(total);
        $("#quiz-region").innerHTML = Quiz.render();
        break;
      }
    }
  }

  // silent state writes from text inputs / selects / textareas
  function bindValue(el) {
    const value = el.value;
    const key = el.getAttribute("data-key");
    if (el.hasAttribute("data-record")) {
      const ns = el.getAttribute("data-record");
      const field = el.getAttribute("data-field");
      const sub = el.getAttribute("data-sub");
      if (sub) {
        const cur = S().env[ns][field][key] || { prefix: "", network: "" };
        actions.setEnvRecord(ns, field, key, { ...cur, [sub]: value });
      } else {
        actions.setEnvRecord(ns, field, key, value);
      }
    } else if (el.hasAttribute("data-path")) {
      actions.setEnvPath(el.getAttribute("data-path"), value);
    }
  }

  function handleInput(e) {
    const el = e.target;
    if (el.matches("input[data-path], input[data-record], textarea[data-path]")) bindValue(el);
  }

  function handleChange(e) {
    const el = e.target;
    if (el.matches("select[data-path], select[data-record]")) bindValue(el);
  }

  function handleSubmit(e) {
    const form = e.target;
    if (form.id !== "bench-form") return;
    e.preventDefault();
    const input = $("#bench-input");
    const raw = input.value.trim();
    if (!raw) return;
    const { out, ok } = Zones.runCommand(raw);
    if (out === "__CLEAR__") {
      // clear = wipe visible log only (ran-history is kept for objective validation)
      actions.setEnvPath("bench.log", []);
      $("#bench-log").innerHTML = `<p class="term-empty">Bench console ready. The bench host is cabled to Floor 2 switch port 14.</p>`;
      input.value = "";
      return;
    }
    actions.pushBench(raw, out, ok);
    const log = $("#bench-log");
    if (log) {
      const last = S().env.bench.log[S().env.bench.log.length - 1];
      const div = document.createElement("div");
      div.className = "term-entry";
      div.innerHTML = `<p class="term-cmd">&gt; ${esc(last.cmd)}</p>
        <pre class="term-out ${last.ok ? "term-ok" : "term-fail"}">${esc(last.out)}</pre>`;
      log.appendChild(div);
      requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
    }
    input.value = "";
  }

  // ════════════════════════════ BOOT ════════════════════════════════════════
  function boot() {
    LabStore.load();
    // react only to whole-tree mutations here; the rest is handled at its action site
    LabStore.subscribe((actionName) => {
      if (actionName === "setMode" || actionName === "resetAll") renderAll();
    });
    document.addEventListener("click", handleClick);
    document.addEventListener("input", handleInput);
    document.addEventListener("change", handleChange);
    document.addEventListener("submit", handleSubmit, true);
    renderAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  return { ui, switchZone, renderAll, updateHeader };
})();
