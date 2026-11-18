/* =========================================================================
   Night Dispatch — js/app.js
   Bootstrap, view templates (mode select, desk header, duty rail, briefing,
   binder, dispatch floor, handover), the objectives pad + glossary sheets,
   the completion modal, event delegation and the render loop.

   Rendering strategy: each view writes into stable slots; every slot keeps a
   signature of the state slice it depends on and only re-renders when that
   slice changed. Interactive elements carry data-fk keys so focus and list
   scroll positions survive re-renders (mirrors React reconciliation).
   ========================================================================= */

"use strict";

(function () {
  const root = document.getElementById("root");

  let currentView = "boot";
  let prevDuty = null;
  let completionOpen = false;
  const sigs = Object.create(null);

  /* ---------- render primitives ---------- */

  function sig(...parts) {
    return JSON.stringify(parts);
  }

  /** Replace a slot's content unless its signature is unchanged; keep
      focus (via data-fk) and scroll positions stable across re-renders. */
  function rerenderInto(container, html, sigVal, sigKey) {
    if (sigKey !== undefined) {
      if (sigs[sigKey] === sigVal && container.dataset.rendered === "1") return;
      sigs[sigKey] = sigVal;
    }
    const act = document.activeElement;
    const fk = act instanceof HTMLElement && container.contains(act) ? act.dataset.fk || null : null;
    const scrolls = [...container.querySelectorAll(".keep-scroll")].map((el) => el.scrollTop);
    container.innerHTML = html;
    container.dataset.rendered = "1";
    container.querySelectorAll(".keep-scroll").forEach((el, i) => {
      el.scrollTop = scrolls[i] ?? 0;
    });
    if (fk) {
      const again = container.querySelector(`[data-fk="${CSS.escape(fk)}"]`);
      if (again) again.focus();
    }
  }

  /* ---------- mode select ---------- */

  function modeSelectHTML() {
    const card = (data, mode, iconCls, accent) => `
      <button type="button" class="panel shift-card ${accent ? "shift-card-accent" : ""}" data-action="set-mode" data-mode="${mode}"
        aria-label="Select ${esc(data.title)}: ${esc(data.tag)}">
        <span class="shift-card-top">
          <span class="shift-card-icon ${accent ? "shift-icon-amber" : "shift-icon-teal"}">${icon(iconCls, "size-6")}</span>
          <span class="shift-card-tag mono">${esc(data.tag)}</span>
        </span>
        <span class="shift-card-title">${esc(data.title)}</span>
        <span class="shift-card-blurb">${esc(data.blurb)}</span>
        <span class="shift-card-best">${esc(data.best)}</span>
      </button>`;

    return `
      <main class="desk-bg mode-select">
        <div class="mode-select-inner">
          <header class="mode-select-head">
            <p class="mode-badge-mode">${icon("train-front", "size-4")} MERIDIAN INTERCHANGE · NIGHT DISPATCH</p>
            <h1 class="mode-select-title">Choose your shift</h1>
            <p class="mode-select-intro">
              An interactive practice lab for <strong class="text-foreground">CompTIA Security+ (SY0-801) — Lesson 2.2: Explain common threat vectors and attack surfaces</strong>. You will read evidence, stamp threat vectors and attack surfaces, set mitigations, and sit the review board. Both shifts train the same board — pick how hard you want the night to be.
            </p>
          </header>
          <div class="mode-cards">
            ${card(MODE_CARDS.medium, "medium", "graduation-cap", false)}
            ${card(MODE_CARDS.hard, "hard", "moon-star", true)}
          </div>
          <div class="mode-notices">
            <p class="mode-notice">
              ${icon("shield-alert", "size-4 notice-amber")}
              <span>TRAINING DATA NOTICE — every organization, domain, IP, badge number and log line on this board is synthetic and invented for this lab (fictional operator: Meridian Valley Transit &amp; Freight). Defensive, educational framing only.</span>
            </p>
            <p class="mode-notice">
              ${icon("radio", "size-4 notice-teal")}
              <span>Your shift auto-saves to this browser. A clearly labeled RESET restores the pristine board at any time.</span>
            </p>
          </div>
        </div>
      </main>`;
  }

  /* ---------- desk header + duty rail ---------- */

  function headerHTML(state) {
    const os = state.mode ? objectiveScore(state, state.mode) : { solved: 0, total: 0, pct: 0, hints: 0 };
    const ready = state.mode ? completionReady(state, state.mode) : false;
    return `
      <header class="desk-header">
        <div class="desk-brand">
          <span class="brand-lamp lamp-glow" aria-hidden="true">${icon("star", "size-5")}</span>
          <div class="brand-text">
            <p class="brand-over mono">MERIDIAN INTERCHANGE</p>
            <h1 class="brand-title">NIGHT DISPATCH — Threat vectors &amp; attack surfaces</h1>
          </div>
        </div>
        <span class="mode-chip mono">${state.mode === "medium" ? "TRAINING SHIFT · MEDIUM" : "NIGHT SHIFT SOLO · HARD"}</span>
        <div class="header-actions">
          <div class="progress-pill" aria-label="Objectives cleared: ${os.solved} of ${os.total}">
            <div class="progress-track" aria-hidden="true">
              <div class="progress-fill" style="width:${os.total ? (os.solved / os.total) * 100 : 0}%"></div>
            </div>
            <span class="mono progress-count">${os.solved}/${os.total}</span>
          </div>
          <button type="button" class="btn btn-outline btn-sm btn-header" data-action="open-glossary" data-fk="hdr-glossary">
            ${icon("bookmarked", "size-4")}<span class="sr-only sm-inline">Glossary</span>
          </button>
          <button type="button" class="btn btn-outline btn-sm btn-header" data-action="open-pad" data-fk="hdr-pad">
            ${icon("clipboard-list", "size-4")}<span class="sr-only sm-inline">Objectives pad</span>
          </button>
          ${ready ? `
            <button type="button" class="btn btn-sm btn-clear clear-glow" data-action="open-completion" data-fk="hdr-trophy"
              aria-label="End of shift report is ready — open it">
              ${icon("trophy", "size-4")}<span class="sr-only sm-inline">End of shift report</span>
            </button>` : ""}
        </div>
      </header>`;
  }

  function railHTML(state) {
    const objCount = state.mode ? OBJECTIVES[state.mode].length : 0;
    const solved = state.mode ? OBJECTIVES[state.mode].filter((o) => state.objectives[o.id]?.solved).length : 0;
    const ready = completionReady(state, state.mode ?? "medium");
    return `
      <nav aria-label="Shift duties" class="duty-rail">
        <ul class="duty-list keep-scroll" role="list">
          ${DUTIES.map((d) => {
            const unlocked = state.dutiesUnlocked.includes(d.id);
            const current = state.duty === d.id;
            return `
              <li class="duty-item">
                <button type="button" ${unlocked ? "" : "disabled"} data-action="visit-duty" data-duty="${d.id}" data-fk="duty-${d.id}"
                  aria-current="${current ? "page" : "false"}"
                  class="duty-chip ${current ? "duty-current lamp-glow" : unlocked ? "duty-unlocked" : "duty-locked"}">
                  <span class="duty-icon ${current ? "duty-icon-current" : unlocked ? "duty-icon-on" : ""}">${icon(d.icon, "size-4")}</span>
                  <span>
                    <span class="duty-label">${d.label}</span>
                    <span class="duty-sub">${d.sub}</span>
                  </span>
                </button>
              </li>`;
          }).join("")}
        </ul>
        <p class="duty-note" aria-live="polite">
          ${icon("train-front", "size-3.5 duty-note-icon")}
          Objectives cleared: <strong class="text-foreground">${solved}/${objCount}</strong>
          ${state.mode === "medium" && solved >= 8 ? " · review board unlocked" : ""}
          ${!ready && state.mode === "medium" ? " · finish objectives + quiz to unlock handover" : ""}
        </p>
      </nav>`;
  }

  /* ---------- briefing ---------- */

  function briefingHTML(state) {
    const intro = state.mode === "medium" ? BRIEFING.mediumIntro : BRIEFING.hardIntro;
    return `
      <main class="view view-briefing fade-up">
        <article class="waybill briefing-waybill">
          <div class="briefing-stamp-wrap" aria-hidden="true">
            <span class="waybill-stamp stamp-red">SYNTHETIC · TRAINING DATA</span>
          </div>
          <p class="briefing-org mono">${esc(BRIEFING.org)} · internal memo 26-114</p>
          <h2 class="briefing-heading">${esc(BRIEFING.heading)}</h2>
          ${BRIEFING.body.map((p) => `<p class="briefing-body">${esc(p)}</p>`).join("")}
          <div class="briefing-cert">
            <p><strong>Certification relevance:</strong> ${esc(BRIEFING.cert.replace("Certification relevance: ", ""))}</p>
          </div>
          <p class="briefing-intro">${icon("ticket", "size-4")} <span class="fx">${esc(intro)}</span></p>
          <p class="briefing-safety">${icon("shield-alert", "size-3.5")} ${esc(BRIEFING.safety)}</p>
        </article>
        <div class="briefing-cta-row">
          <button type="button" class="btn btn-lg btn-amber briefing-cta" data-action="visit-duty" data-duty="binder" data-fk="cta-binder">
            ${icon("train-front", "size-5")} <span class="fx">Open the binder — learn the lines &amp; districts</span> ${icon("arrow-right", "size-4")}
          </button>
        </div>
      </main>`;
  }

  /* ---------- binder ---------- */

  function binderHTML(state) {
    const families = VECTORS.filter((v) => v.kind === "vector");
    const apt = VECTORS.find((v) => v.id === "apt");
    const defs = OBJECTIVES.medium.find((o) => o.id === "OBJ-M1");

    return `
      <main class="view view-binder fade-up">
        <section aria-labelledby="defs-bench-h">
          <h2 id="defs-bench-h" class="section-title">1 · The definitions bench</h2>
          <p class="section-sub">Everything tonight hangs on three terms. Set each definition under its term — this bench is objective OBJ-M1.</p>
          <div class="mt-3">
            ${matcherHTML(MATCHERS["defs-bench"], state)}
            ${objectiveCheckHTML(defs, state)}
          </div>
        </section>

        <section class="mt-10" aria-labelledby="gallery-h">
          <h2 id="gallery-h" class="section-title">2 · The line gallery — 14 threat vector families</h2>
          <p class="section-sub">Each family is a route an attack can travel. Example items are quoted from the SY0-801 objectives — learn the family names <em>and</em> their example items; the exam tests both.</p>
          <div class="accordion mt-4">
            ${families.map((v, i) => {
              const open = UIState.binderOpen === v.id;
              return `
                <div class="acc-item ${open ? "acc-open" : ""}">
                  <button type="button" aria-expanded="${open}" data-action="toggle-acc" data-acc="${v.id}" data-fk="acc-${v.id}" class="acc-trigger">
                    <span class="acc-label"><span class="mono acc-code">${v.code}</span><span class="acc-name">${v.name}</span></span>
                    ${icon("chevron-down", `size-4 chev ${open ? "chev-open" : ""}`)}
                  </button>
                  ${open ? `
                    <div class="acc-content">
                      <p class="acc-summary">${esc(v.summary)}</p>
                      <div class="badge-wrap">
                        ${v.items.map((item) => `<span class="badge badge-outline">${esc(item)}</span>`).join("")}
                      </div>
                      <p class="acc-mitre mono">ATT&amp;CK anchor: ${esc(v.mitre)}</p>
                      <p class="acc-line">Line ${i + 1} of 14 — objectives OBJ-M2, M4–M8 induct these on the floor.</p>
                    </div>` : ""}
                </div>`;
            }).join("")}
          </div>
        </section>

        <section class="mt-10" aria-labelledby="apt-h">
          <h2 id="apt-h" class="section-title">3 · The one source: Advanced Persistent Threat</h2>
          <div class="panel apt-panel">
            <p class="apt-headline">${icon("siren", "size-4")} <span class="fx">APT is a threat SOURCE — not a route.</span></p>
            <p class="apt-summary">${esc(apt.summary)}</p>
            <div class="badge-wrap">
              ${apt.items.map((item) => `<span class="badge badge-outline badge-red">${esc(item)}</span>`).join("")}
            </div>
            <p class="apt-note">Tonight's board hides one patient operator working <strong class="text-foreground">three different vector families in sequence</strong> (Hard shift). Medium shift profiles the APT in the intelligence corner. Never stamp a consignment &quot;APT&quot; — stamp the line it arrived on; the APT is the driver.</p>
          </div>
        </section>

        <section class="mt-10" aria-labelledby="districts-h">
          <h2 id="districts-h" class="section-title">4 · The interchange districts — attack surfaces</h2>
          <p class="section-sub">The chapter's official surface list: <strong class="text-foreground">users, systems, applications, networks, cloud resources, supply chains</strong> — plus the specialized estates (IoT, OT, physical frontage) the objectives call out. Each district below is where a line can end.</p>
          <ul class="district-grid mt-4" role="list">
            ${DISTRICTS.map((d) => `
              <li class="panel district-card">
                <p class="district-surface mono">SURFACE · ${esc(d.surface.toUpperCase())}</p>
                <h3 class="district-name">${esc(d.name)}</h3>
                <p class="district-desc">${esc(d.desc)}</p>
                <p class="district-assets">${d.assets.map(esc).join(" · ")}</p>
              </li>`).join("")}
          </ul>
        </section>

        <section class="mt-10" aria-labelledby="case-h">
          <h2 id="case-h" class="section-title">5 · The case file — real vector history</h2>
          <p class="section-sub">Four widely documented incidents, one per major family. Headline level only — no tradecraft recipes here.</p>
          <div class="district-grid mt-4" role="list">
            ${CASE_FILE.map((c) => `
              <article class="panel district-card">
                <p class="case-title">${icon("file-text", "size-4 case-icon")} <span class="fx">${esc(c.title)}</span> <span class="mono case-year">(${esc(c.year)})</span></p>
                <span class="badge badge-outline badge-amber case-vector">${esc(c.vector)}</span>
                <p class="district-desc">${esc(c.detail)}</p>
              </article>`).join("")}
          </div>
          <ul class="quick-cases" role="list">
            ${QUICK_CASES.map((c) => `
              <li class="quick-case"><strong class="text-foreground">${esc(c.title)} (${esc(c.year)})</strong> — ${esc(c.vector)}: ${esc(c.detail)}</li>`).join("")}
          </ul>
        </section>

        <div class="binder-exit">
          <p class="binder-exit-note">${icon("building", "size-4")} <span class="fx">Binder read? The floor is waiting.</span></p>
          <button type="button" class="btn btn-lg btn-amber briefing-cta" data-action="visit-duty" data-duty="floor" data-fk="cta-floor">
            <span class="fx">Enter the dispatch floor</span> ${icon("arrow-right", "size-4")}
          </button>
          <p class="binder-exit-glossary">${icon("bookmarked", "size-3.5")} Glossary lives on the desk header — 15 terms, always available.</p>
        </div>
      </main>`;
  }

  /* ---------- dispatch floor ---------- */

  const EMPTY_STAMP = { vectorId: null, districtId: null, stamped: false, wrongAttempts: 0 };
  const VECTOR_OPTIONS = [
    ...VECTORS.filter((v) => v.kind === "vector").map((v) => ({ id: v.id, code: v.code, name: v.name })),
    { id: BENIGN_ID, code: "AUTH", name: AUTHORISED_LABEL },
  ];
  const MEDIUM_ANNEX = [
    { objId: "OBJ-M2", matchers: ["family-msg"] },
    { objId: "OBJ-M3" },
    { objId: "OBJ-M4" },
    { objId: "OBJ-M5" },
    { objId: "OBJ-M6", matchers: ["family-brw-ep"] },
    { objId: "OBJ-M7", matchers: ["family-net"] },
    { objId: "OBJ-M8", matchers: ["family-hum-phy", "family-iot-ot"] },
    { objId: "OBJ-M9", matchers: ["cloud-vs"] },
    { objId: "OBJ-M10", matchers: ["logmatch-medium"] },
    { objId: "OBJ-M13", matchers: ["apt-attr"] },
    { objId: "OBJ-M12", sequencers: ["rollout-ot"] },
  ];
  const HARD_ANNEX = [
    { objId: "OBJ-H1" },
    { objId: "OBJ-H2", sequencers: ["apt-chain"] },
    { objId: "OBJ-H4", sequencers: ["vendor-update"] },
    { objId: "OBJ-H5", matchers: ["logmatch-hard"] },
    { objId: "OBJ-H6", sequencers: ["ctl-critical"] },
    { objId: "OBJ-H7", matchers: ["estate-id", "estate-expo"] },
    { objId: "OBJ-H8", matchers: ["cloud-actions", "cloud-resp"] },
    { objId: "OBJ-H9", matchers: ["human-id", "byod-bundle"] },
  ];

  function stampIsCorrect(state, c) {
    const st = state.stamps[c.id];
    if (!st?.stamped) return false;
    const vOk = c.benign ? st.vectorId === BENIGN_ID : st.vectorId === c.vectorId;
    const dOk = c.benign ? true : st.districtId === c.districtId;
    return vOk && dOk;
  }

  function stamp_d(state, id) {
    return state.stamps[id]?.districtId ?? null;
  }

  function ledgerHTML(state) {
    const board = boardFor(state.mode);
    const selectedId = UIState.floorSelected;
    return `
      <section aria-labelledby="ledger-h" class="panel floor-ledger">
        <h3 id="ledger-h" class="panel-heading">${icon("scan-line", "size-4")} <span class="fx">ARRIVALS LEDGER · ${board.length} CONSIGNMENTS</span></h3>
        <ul class="ledger-list keep-scroll" role="list" aria-label="Arrivals list">
          ${board.map((c) => {
            const st = state.stamps[c.id] ?? EMPTY_STAMP;
            const ok = stampIsCorrect(state, c);
            const active = c.id === selectedId;
            return `
              <li>
                <button type="button" data-action="select-consignment" data-cid="${c.id}" data-fk="led-${c.id}" aria-pressed="${active}"
                  class="ledger-item ${active ? "ledger-item-active" : ""}">
                  <span aria-hidden="true" class="ledger-status">${
                    st.stamped ? (ok ? icon("circle-check", "size-4 text-emerald") : icon("triangle-alert", "size-4 text-danger")) : icon("circle-dashed", "size-4 text-muted")
                  }</span>
                  <span class="ledger-text">
                    <span><span class="mono ledger-id">${c.id}</span> <span class="mono ledger-time">${c.time}</span></span>
                    <span class="ledger-title">${esc(c.title)}</span>
                  </span>
                </button>
              </li>`;
          }).join("")}
        </ul>
        <p class="ledger-note">Select a consignment, read its waybill, stamp line + district. Green = accepted, red = rejected.</p>
      </section>`;
  }

  function waybillDeskHTML(state) {
    const board = boardFor(state.mode);
    const consignment = board.find((c) => c.id === UIState.floorSelected) ?? null;
    if (!consignment) {
      return `<section class="panel desk-clear">The desk is clear — select a consignment from the ledger.</section>`;
    }

    const stamp = state.stamps[consignment.id] ?? EMPTY_STAMP;
    const vectorChosen = stamp.vectorId;
    const benignSelected = vectorChosen === BENIGN_ID;
    const canStamp = !!vectorChosen && (benignSelected || !!stamp.districtId);
    const correct = stampIsCorrect(state, consignment);
    /* QA-5: once a waybill is stamped ACCEPTED it is filed — the classification
       locks so a stray click cannot corrupt a recorded verdict. Rejected
       waybills stay editable for the re-stamp flow. */
    const filed = stamp.stamped && correct;

    return `
      <section aria-labelledby="desk-h" class="desk-column">
        <div class="waybill waybill-desk">
          <div class="waybill-head">
            <span class="mono waybill-id">${consignment.id}</span>
            <span class="mono waybill-time">${consignment.time} hrs</span>
            <span class="badge badge-outline badge-waybill">${consignment.docType}</span>
            ${stamp.stamped ? `
              <span class="waybill-stamp waybill-verdict ${correct ? "stamp-green" : "stamp-red"}">${correct ? "ACCEPTED" : "REJECTED"}</span>` : ""}
          </div>
          <h3 id="desk-h" class="waybill-title">${esc(consignment.title)}</h3>
          <p class="waybill-intro">${esc(consignment.intro)}</p>
          <dl class="evidence-list">
            ${consignment.evidence.map((e) => `
              <div class="evidence-row">
                <dt class="mono">${esc(e.label)}</dt>
                <dd class="mono">${esc(e.value)}</dd>
              </div>`).join("")}
          </dl>
        </div>

        <div class="panel classify-panel" aria-label="Classification controls">
          <fieldset>
            <legend class="panel-heading">1 · APPROACH LINE (THREAT VECTOR)</legend>
            <div class="classify-grid" role="radiogroup" aria-label="Choose the approach line">
              ${VECTOR_OPTIONS.map((v) => {
                const sel = vectorChosen === v.id;
                return `
                  <button type="button" role="radio" aria-checked="${sel}" ${filed ? "disabled" : ""}
                    data-action="set-vector" data-vid="${v.id}" data-fk="vec-${consignment.id}-${v.id}"
                    class="classify-chip ${sel ? "classify-chip-on lamp-glow" : ""}">
                    <span class="mono classify-code">${v.code}</span>
                    <span class="classify-name">${esc(v.name)}</span>
                  </button>`;
              }).join("")}
            </div>
          </fieldset>

          ${!benignSelected ? `
            <fieldset class="mt-4">
              <legend class="panel-heading">2 · DESTINATION DISTRICT (ATTACK SURFACE)</legend>
              <div class="classify-grid" role="radiogroup" aria-label="Choose the destination district">
                ${DISTRICTS.map((d) => {
                  const sel = stamp.districtId === d.id;
                  return `
                    <button type="button" role="radio" aria-checked="${sel}" ${filed ? "disabled" : ""}
                      data-action="set-district" data-did="${d.id}" data-fk="dis-${consignment.id}-${d.id}"
                      class="classify-chip classify-district ${sel ? "classify-district-on" : ""}">
                      <span class="classify-surface">${esc(d.surface)}</span>
                      <span class="classify-dname">${esc(d.name)}</span>
                    </button>`;
                }).join("")}
              </div>
            </fieldset>` : `
            <p class="benign-note">Authorised stamp selected — no district applies. Verify before you commit: internal domain, passing authentication, expected cadence.</p>`}

          <div class="stamp-row">
            <button type="button" class="btn btn-lg btn-amber stamp-btn" ${!canStamp || filed ? "disabled" : ""}
              data-action="stamp" data-cid="${consignment.id}" data-fk="stamp-${consignment.id}">
              ${icon("stamp", "size-5")}
              <span class="fx">${filed ? "Filed — accepted" : `Stamp consignment ${consignment.id}`}</span>
            </button>
            ${!canStamp && !filed ? `<p class="stamp-hint">Choose ${benignSelected ? "the authorised stamp" : "a line and a district"} to enable the stamp.</p>` : ""}
          </div>

          ${stamp.stamped ? `
            <div role="status" aria-live="polite" class="feedback stamp-verdict ${correct ? "feedback-ok" : "feedback-bad"}">
              ${correct ? `
                <p class="feedback-verdict"><span class="fx">Stamp accepted — ${esc(consignment.vectorItem)}</span></p>
                <p class="mt-1">${esc(consignment.teach)}</p>
                <p class="stamp-filed-note">Waybill filed — classification locked. Select another consignment to continue the board.</p>` : `
                <p><span class="feedback-verdict-inline">Rejected.</span> ${
                  consignment.benign
                    ? "This one is authorised — check what a clean message looks like (internal domain, authentication passing, expected cadence) and restamp as AUTH."
                    : "The line and district disagree with the evidence. Re-read the headers, the device log and the channel — then restamp. (Use the ledger colors: red = wrong stamp.)"
                }</p>`}
            </div>` : ""}
        </div>
      </section>`;
  }

  function rightRailHTML(state) {
    const mode = state.mode;
    const board = boardFor(mode);
    const selected = board.find((c) => c.id === UIState.floorSelected) ?? null;
    const exposureObj = OBJECTIVES.hard.find((o) => o.id === "OBJ-H3");
    const cabinetObj = OBJECTIVES.medium.find((o) => o.id === "OBJ-M11");
    const filed = selected ? !!(state.stamps[selected.id]?.stamped && stampIsCorrect(state, selected)) : false;

    return `
      <div class="floor-rail-col">
        <section aria-labelledby="schematic-h" class="panel">
          <h3 id="schematic-h" class="panel-heading">${icon("map-pin", "size-4")} <span class="fx">INTERCHANGE SCHEMATIC</span></h3>
          <p class="panel-sub">${selected ? `Tap a district to route ${selected.id}. Districts are the chapter's attack surfaces.` : "The interchange's nine districts — the attack surfaces."}</p>
          <ul class="schematic-list" role="list">
            ${DISTRICTS.map((d) => {
              const active = selected && stamp_d(state, selected.id) === d.id;
              return `
                <li>
                  <button type="button" ${!selected || selected.benign || filed ? "disabled" : ""}
                    data-action="set-district" data-did="${d.id}" data-fk="sch-${d.id}"
                    class="schematic-btn ${active ? "schematic-btn-on" : ""}">
                    <span>
                      <span class="schematic-surface">${esc(d.surface)}</span>
                      <span class="schematic-name">${esc(d.name)}</span>
                    </span>
                  </button>
                </li>`;
            }).join("")}
          </ul>
        </section>

        ${mode === "hard" ? `
          <section aria-labelledby="expo-h" class="panel">
            <h3 id="expo-h" class="panel-heading"><span class="fx">EXPOSURE BOARD — H3</span></h3>
            <p class="panel-sub">Mark each district LOW / MED / HIGH and tag the HIGH ones with the weakness that enabled tonight.</p>
            <ul class="expo-list" role="list">
              ${DISTRICTS.map((d) => {
                const ex = state.exposure[d.id] ?? { level: "", tag: "" };
                return `
                  <li class="expo-row">
                    <p class="expo-name">${esc(d.name)}</p>
                    <div class="expo-controls">
                      <div role="radiogroup" aria-label="Exposure level for ${esc(d.name)}" class="expo-levels">
                        ${EXPOSURE_LEVELS.map((lv) => {
                          const on = ex.level === lv;
                          return `
                            <button type="button" role="radio" aria-checked="${on}" data-action="set-exposure-level" data-did="${d.id}" data-lv="${lv}" data-fk="lvl-${d.id}-${lv}"
                              class="expo-level ${on ? `expo-${lv.toLowerCase()}-on` : ""}">${lv}</button>`;
                        }).join("")}
                      </div>
                      <select class="expo-tag" data-action="set-exposure-tag" data-did="${d.id}" data-fk="tag-${d.id}"
                        aria-label="Weakness tag for ${esc(d.name)}">
                        <option value="" ${ex.tag ? "" : "selected"}>weakness tag…</option>
                        ${EXPOSURE_TAGS.map((t) => `<option value="${t.id}" ${ex.tag === t.id ? "selected" : ""}>${esc(t.label)}</option>`).join("")}
                      </select>
                    </div>
                  </li>`;
              }).join("")}
            </ul>
            ${objectiveCheckHTML(exposureObj, state)}
          </section>` : ""}

        <section aria-labelledby="cabinet-h" class="panel">
          <h3 id="cabinet-h" class="panel-heading"><span class="fx">SIGNAL CABINET — MITIGATION LEVERS</span></h3>
          <p class="panel-sub">Ten levers, each mapped to its MITRE mitigation ID. Pull the ones tonight's evidence supports.</p>
          <ul class="cabinet-list" role="list">
            ${CONTROLS.map((c) => {
              const on = !!state.signals[c.id];
              return `
                <li class="cabinet-row">
                  <button type="button" role="switch" aria-checked="${on}" data-action="toggle-signal" data-cid="${c.id}" data-fk="sw-${c.id}"
                    aria-label="${esc(c.name)} — ${on ? "pulled" : "down"}"
                    class="switch ${on ? "switch-on" : ""}">
                    <span class="switch-track"><span class="switch-thumb"></span></span>
                  </button>
                  <div class="cabinet-text">
                    <p class="cabinet-name">${esc(c.name)}</p>
                    <p class="cabinet-desc">${esc(c.desc)}</p>
                    <span class="badge badge-outline badge-teal mono">${esc(c.mitre)}</span>
                  </div>
                </li>`;
            }).join("")}
          </ul>
          ${mode === "medium" ? objectiveCheckHTML(cabinetObj, state) : ""}
        </section>
      </div>`;
  }

  function annexHTML(state) {
    const cards = state.mode === "medium" ? MEDIUM_ANNEX : HARD_ANNEX;
    const objectives = OBJECTIVES[state.mode];
    return `
      <div class="annex">
        <h3 class="annex-heading">${icon("scan-line", "size-4")} <span class="fx">DESK ANNEX — BENCHES, PANELS &amp; ROLLOUTS</span></h3>
        <div class="annex-grid">
          ${cards.map((card) => {
            const obj = objectives.find((o) => o.id === card.objId);
            return `
              <div class="panel annex-card">
                <h4 class="annex-title">${esc(obj.title)}</h4>
                <p class="annex-context">${esc(obj.context)}</p>
                <p class="annex-anchor mono">ANCHOR · ${esc(obj.anchor)}</p>
                <div class="annex-widgets">
                  ${(card.matchers ?? []).map((k) => matcherHTML(MATCHERS[k], state)).join("")}
                  ${(card.sequencers ?? []).map((k) => sequencerHTML(SEQUENCERS[k], state)).join("")}
                </div>
                ${objectiveCheckHTML(obj, state)}
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  function floorSkeleton(state) {
    return `
      <main class="view view-floor fade-up">
        <h2 class="sr-only">Dispatch floor</h2>
        <div class="floor-grid">
          <div id="slot-ledger"></div>
          <div id="slot-desk"></div>
          <div id="slot-siderail"></div>
        </div>
        <div id="slot-annex"></div>
      </main>`;
  }

  /* ---------- handover ---------- */

  function handoverHTML() {
    return `
      <main class="view view-handover fade-up">
        <h2 class="view-title">${esc(DEBRIEF.heading)}</h2>
        <p class="view-sub">The synthesis a defender carries off shift: where each line is visible, which controls close it, and what both sides of the board learned tonight.</p>

        <section class="mt-8" aria-labelledby="det-h">
          <h3 id="det-h" class="panel-heading handover-h">${icon("table-2", "size-4")} <span class="fx">DETECTION OPPORTUNITIES — data sources &amp; example logic</span></h3>
          <div class="table-scroll keep-scroll">
            <table class="det-table">
              <caption class="sr-only">Detection opportunities by threat vector</caption>
              <thead>
                <tr>
                  <th scope="col">Vector</th>
                  <th scope="col">Best data source</th>
                  <th scope="col">Example detection logic (simplified)</th>
                </tr>
              </thead>
              <tbody>
                ${DEBRIEF.detectionRows.map((r) => `
                  <tr>
                    <th scope="row">${esc(r.vector)}</th>
                    <td class="det-source">${esc(r.source)}</td>
                    <td class="det-logic mono">${esc(r.logic)}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
          <p class="table-note">Logic examples are simplified pseudo-rules for learning, not production detections.</p>
        </section>

        <section class="mt-8" aria-labelledby="mit-h">
          <h3 id="mit-h" class="panel-heading handover-h">${icon("shield-check", "size-4")} <span class="fx">MITIGATION RECOMMENDATIONS — with official IDs</span></h3>
          <ul class="mit-grid" role="list">
            ${DEBRIEF.mitigations.map((m) => `<li class="panel mit-card">${esc(m)}</li>`).join("")}
          </ul>
          <p class="table-note">M-IDs refer to MITRE ATT&amp;CK Enterprise mitigations (M1032 Multi-factor Authentication, M1030 Network Segmentation, M1034 Limit Hardware Installation, M1045 Code Signing, M1051 Update Software, M1021 Restrict Web-Based Content, M1049 Antivirus/Antimalware, M1054 Software Configuration, M1027 Password Policies, M1018 User Account Management).</p>
        </section>

        <section class="team-grid mt-8" aria-label="Team takeaways">
          <div class="panel team-card">
            <h3 class="panel-heading handover-h text-teal">${icon("shield-check", "size-4")} <span class="fx">BLUE-TEAM TAKEAWAYS</span></h3>
            <ul class="team-list" role="list">
              ${DEBRIEF.blueTeam.map((t) => `<li class="team-line"><span class="team-dot team-dot-teal" aria-hidden="true"></span><span class="fx">${esc(t)}</span></li>`).join("")}
            </ul>
          </div>
          <div class="panel team-card">
            <h3 class="panel-heading handover-h text-red">${icon("eye", "size-4")} <span class="fx">RED-TEAM MINDSET (DEFENSIVE AWARENESS)</span></h3>
            <ul class="team-list" role="list">
              ${DEBRIEF.redTeam.map((t) => `<li class="team-line"><span class="team-dot team-dot-red" aria-hidden="true"></span><span class="fx">${esc(t)}</span></li>`).join("")}
            </ul>
          </div>
        </section>

        <section class="mt-8" aria-labelledby="next-h">
          <h3 id="next-h" class="panel-heading handover-h"><span class="fx">WHAT TO LEARN NEXT</span></h3>
          <ul class="next-list" role="list">
            ${DEBRIEF.nextSteps.map((t) => `<li>· ${esc(t)}</li>`).join("")}
          </ul>
          <h3 class="panel-heading handover-h mt-6"><span class="fx">OFFICIAL REFERENCES</span></h3>
          <ul class="ref-list" role="list">
            ${DEBRIEF.references.map((r) => `
              <li>
                <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" class="ref-link">
                  <span class="fx">${esc(r.label)}</span> ${icon("external-link", "size-3.5")}<span class="sr-only">(opens in a new tab)</span>
                </a>
              </li>`).join("")}
          </ul>
        </section>
      </main>`;
  }

  /* ---------- glossary sheet + objectives pad ---------- */

  function glossaryOpen() {
    Overlay.open(
      "sheet-left",
      `<div class="overlay-head">
         <h2 id="overlay-title" data-overlay-title class="overlay-title">STATION GLOSSARY — 15 terms</h2>
         <p class="overlay-sub">The vocabulary this chapter (and this board) runs on.</p>
       </div>`,
      `<div class="overlay-scroll keep-scroll">
         <dl class="glossary-list">
           ${GLOSSARY.map((g) => `
             <div class="glossary-item">
               <dt>${esc(g.term)}</dt>
               <dd>${esc(g.def)}</dd>
             </div>`).join("")}
         </dl>
       </div>`
    );
  }

  function padHeadHTML(state) {
    const mode = state.mode;
    const os = objectiveScore(state, mode);
    return `
      <div class="overlay-head">
        <h2 id="overlay-title" data-overlay-title class="overlay-title">OBJECTIVES PAD — ${mode === "medium" ? "training shift" : "night shift"}</h2>
        <p class="overlay-sub">${os.solved}/${os.total} cleared · first-attempt score ${Math.round(os.pct * 100)}% · ${os.hints} hint${os.hints === 1 ? "" : "s"} used</p>
      </div>`;
  }

  function padBodyHTML(state) {
    const list = OBJECTIVES[state.mode];
    return `
      <div class="overlay-scroll keep-scroll">
        <div class="pad-list">
          ${list.map((o) => objectiveCardHTML(o, state)).join("")}
          <p class="pad-footnote">Pillars — P1 understand · P2 recognize/analyze · P3 detect · P4 mitigate. Every check explains why it matters and what a defender does next.</p>
        </div>
      </div>`;
  }

  function padOpenAction() {
    Overlay.open("sheet-right", padHeadHTML(Store.state), padBodyHTML(Store.state));
  }

  /** While the pad is open, keep its score line and check blocks current. */
  function refreshPad() {
    if (Overlay.el?.hidden !== false || Overlay.kind !== "sheet-right") return;
    rerenderInto(Overlay.contentEl, padHeadHTML(Store.state) + padBodyHTML(Store.state));
  }

  /* ---------- completion modal ---------- */

  function completionBodyHTML(state) {
    const mode = state.mode;
    const os = objectiveScore(state, mode);
    const quiz = quizScore(state);
    const stars = starRating(os.pct, os.hints, quiz);
    const firstTry = OBJECTIVES[mode].filter((o) => state.objectives[o.id]?.firstTry).length;
    const pillars = ["P1", "P2", "P3", "P4"];

    /* R8: focus areas derived from THIS student's actual evidence. */
    const modeItems = mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD;
    const quizMisses = modeItems.filter((q) => {
      const a = state.quiz.answers[q.id];
      return a !== undefined && q.options[a]?.id !== q.correct;
    });
    const retried = OBJECTIVES[mode].filter((o) => {
      const st = state.objectives[o.id];
      return st && (!st.firstTry || st.hintsUsed > 0);
    });
    const restamps = Object.values(state.stamps).filter((st) => st.wrongAttempts > 0).length;
    const focusAreas = [
      ...quizMisses.slice(0, 3).map((q) => `Review board: you missed the "${q.topic}" item — re-read that section of the Binder, then re-sit the board in the other shift mode.`),
      ...retried.slice(0, 3).map((o) => `"${o.title}" needed more than one check or a radio call — walk its anchor again (${o.anchor}).`),
      ...(restamps > 0 ? [`Waybill triage: ${restamps} consignment${restamps === 1 ? "" : "s"} needed a restamp — re-read the line-gallery summaries (Binder §2) before your next shift.`] : []),
    ];
    if (focusAreas.length === 0) {
      focusAreas.push("No misses recorded tonight — every objective first-try and a clean board. Keep sharp with the red-team notes in the Handover.");
    }

    const star = (filled) =>
      `<span class="star ${filled ? "star-filled" : "star-empty"}">${icon("star", "size-8")}</span>`;

    return `
      <div class="completion-body">
        <div class="star-row" role="img" aria-label="${stars} of 5 stars">
          ${[0, 1, 2, 3, 4].map((i) => star(i < stars)).join("")}
        </div>

        <dl class="stat-grid">
          <div class="stat-tile">
            <dt>Objectives</dt>
            <dd class="stat-emerald">${os.solved}/${os.total}</dd>
          </div>
          <div class="stat-tile">
            <dt>First-attempt</dt>
            <dd class="stat-amber">${Math.round((firstTry / os.total) * 100)}%</dd>
          </div>
          <div class="stat-tile">
            <dt>Quiz</dt>
            <dd class="stat-teal">${quiz === null ? "—" : `${Math.round(quiz * 100)}%`}</dd>
          </div>
        </dl>
        <p class="hints-line">${os.hints} hint${os.hints === 1 ? "" : "s"} used · hints and retries lower the star rating, never the learning.</p>

        <div data-testid="focus-areas">
          <h3 class="panel-heading">${icon("crosshair", "size-3.5")} <span class="fx">FOCUS AREAS FOR YOUR NEXT SHIFT</span></h3>
          <ul class="focus-list" role="list">
            ${focusAreas.map((t) => `<li class="focus-item">${esc(t)}</li>`).join("")}
          </ul>
        </div>

        <div>
          <h3 class="panel-heading"><span class="fx">MASTERY RECAP BY PILLAR</span></h3>
          <ul class="pillar-recap" role="list">
            ${pillars.map((p) => {
              const all = OBJECTIVES[mode].filter((o) => o.pillar === p);
              const done = all.filter((o) => state.objectives[o.id]?.solved).length;
              return `
                <li class="recap-row">
                  <span class="recap-label">${PILLAR_LABEL[p]}</span>
                  <div class="recap-track" aria-hidden="true"><div class="recap-fill" style="width:${all.length ? (done / all.length) * 100 : 0}%"></div></div>
                  <span class="mono recap-count">${done}/${all.length}</span>
                </li>`;
            }).join("")}
          </ul>
          <p class="recap-note">You can now explain vectors vs surfaces, recognize all 14 families in raw evidence, name the watchpost for each line, and pull the right mitigation levers with justification.</p>
        </div>

        <div>
          <h3 class="panel-heading">${icon("book-open", "size-3.5")} <span class="fx">WHAT TO LEARN NEXT</span></h3>
          <ul class="next-list" role="list">
            ${DEBRIEF.nextSteps.map((t) => `<li>· ${esc(t)}</li>`).join("")}
          </ul>
        </div>

        <div class="completion-actions">
          <button type="button" class="btn btn-outline" data-action="completion-keep">Keep reviewing the board</button>
          <button type="button" class="btn btn-ghost text-red" data-action="completion-reset">
            ${icon("rotate-ccw", "size-4")} Reset lab
          </button>
        </div>
      </div>`;
  }

  function openCompletion() {
    completionOpen = true;
    Overlay.open(
      "dialog",
      `<div class="overlay-head">
         <h2 id="overlay-title" data-overlay-title class="overlay-title dialog-title">${icon("trophy", "size-6 text-amber")} <span class="fx">End of shift — board clear</span></h2>
         <p id="completion-desc" class="overlay-sub">Every objective cleared and the review board recorded. Here is your shift report.</p>
       </div>`,
      completionBodyHTML(Store.state),
      {
        describedBy: "completion-desc",
        fallbackSel: '[aria-label^="End of shift report"]',
        onClose: () => {
          completionOpen = false;
          Store.dispatch({ type: "COMPLETION_SEEN" });
        },
      }
    );
  }

  /* ---------- reset ---------- */

  const RESET_CONFIRM = "Reset the lab? All progress, stamps and quiz results are wiped and the board returns to pristine state.";
  const RESET_CONFIRM_MODAL = "Reset the lab to pristine state? All progress is wiped.";

  function resetAll(confirmText) {
    if (window.confirm(confirmText)) {
      clearPersisted();
      UIState.padOpen = {};
      UIState.binderOpen = null;
      UIState.floorSelected = null;
      completionOpen = false;
      for (const k of Object.keys(sigs)) delete sigs[k];
      Store.dispatch({ type: "RESET" });
    }
  }

  /* ---------- render orchestration ---------- */

  function render() {
    const state = Store.state;

    if (!state.hydrated) {
      currentView = "boot";
      return; // boot screen is already in the markup
    }

    if (!state.mode) {
      if (currentView !== "mode-select") {
        root.innerHTML = modeSelectHTML();
        currentView = "mode-select";
      }
      return;
    }

    /* desk view */
    if (currentView !== "desk") {
      root.innerHTML = `
        <div class="desk-bg desk-root">
          <div id="slot-header"></div>
          <div class="desk-pad-x"><div id="slot-rail"></div></div>
          <div id="slot-duty"></div>
        <div class="reset-wrap">
            <button type="button" class="btn btn-outline btn-sm reset-btn" data-action="reset-lab" data-fk="reset-lab">
              ${icon("rotate-ccw", "size-4")}<span class="sr-only sm-inline">Reset lab</span>
            </button>
          </div>
        </div>`;
      currentView = "desk";
      prevDuty = null;
    }

    rerenderInto(document.getElementById("slot-header"), headerHTML(state), sig(state.mode, state.objectives, state.quiz.done), "header");

    /* scroll to top when the duty changes (same as the original's effect) */
    if (prevDuty !== state.duty) {
      prevDuty = state.duty;
      window.scrollTo({ top: 0 });
    }

    rerenderInto(document.getElementById("slot-rail"), railHTML(state), sig(state.duty, state.dutiesUnlocked, state.mode, state.objectives, state.quiz.done), "rail");

    const dutySlot = document.getElementById("slot-duty");

    if (state.duty === "floor") {
      if (!dutySlot.dataset.floorReady) {
        dutySlot.innerHTML = floorSkeleton(state);
        dutySlot.dataset.floorReady = "1";
        UIState.floorSelected = boardFor(state.mode)[0]?.id ?? null;
      }
      const s = state;
      const selStamp = s.stamps[UIState.floorSelected];
      rerenderInto(document.getElementById("slot-ledger"), ledgerHTML(s), sig(UIState.floorSelected, s.stamps), "ledger");
      rerenderInto(document.getElementById("slot-desk"), waybillDeskHTML(s), sig(UIState.floorSelected, selStamp), "desk");
      rerenderInto(document.getElementById("slot-siderail"), rightRailHTML(s),
        sig(UIState.floorSelected, selStamp, s.signals, s.exposure, s.results["OBJ-H3"], s.objectives["OBJ-H3"], s.results["OBJ-M11"], s.objectives["OBJ-M11"]), "floorrail");
      rerenderInto(document.getElementById("slot-annex"), annexHTML(s),
        sig(s.matchers, s.sequences, s.objectives, s.results), "annex");
    } else {
      delete dutySlot.dataset.floorReady;
      const html =
        state.duty === "briefing" ? briefingHTML(state)
        : state.duty === "binder" ? binderHTML(state)
        : state.duty === "review" ? reviewBoardHTML(state)
        : handoverHTML(state);
      rerenderInto(dutySlot, html, sig(state.duty, state.matchers, state.sequences, state.objectives, state.results, state.quiz.answers, state.quiz.checked, state.quiz.done, state.quiz.score, UIState.binderOpen), "duty");
    }

    /* live overlays */
    refreshPad();

    /* completion modal auto-open (first time ready, or requested via trophy) */
    const ready = completionReady(state, state.mode);
    const shouldShow = ready && (completionOpen || !state.completionSeen);
    const overlayFree = !Overlay.el || (Overlay.el.hidden && !Overlay.panel.classList.contains("overlay-closing"));
    if (shouldShow && overlayFree) {
      openCompletion();
    }
  }

  /* ---------- event delegation ---------- */

  function objectiveById(id) {
    return OBJECTIVES[Store.state.mode]?.find((o) => o.id === id) ?? OBJECTIVES.medium.find((o) => o.id === id) ?? OBJECTIVES.hard.find((o) => o.id === id);
  }

  document.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target.closest("[data-action]") : null;
    if (!el || el.disabled) return;
    const state = Store.state;
    const act = el.dataset.action;

    switch (act) {
      case "set-mode":
        UIState.padOpen = {};
        UIState.binderOpen = null;
        UIState.floorSelected = null;
        completionOpen = false;
        for (const k of Object.keys(sigs)) delete sigs[k];
        Store.dispatch({ type: "SET_MODE", mode: el.dataset.mode });
        break;
      case "visit-duty":
        Store.dispatch({ type: "VISIT_DUTY", duty: el.dataset.duty });
        break;
      case "open-glossary":
        glossaryOpen();
        break;
      case "open-pad":
        padOpenAction();
        break;
      case "open-completion":
        openCompletion();
        break;
      case "completion-keep":
        Overlay.requestClose();
        break;
      case "completion-reset":
        resetAll(RESET_CONFIRM_MODAL);
        break;
      case "reset-lab":
        resetAll(RESET_CONFIRM);
        break;
      case "toggle-acc": {
        const id = el.dataset.acc;
        UIState.binderOpen = UIState.binderOpen === id ? null : id;
        rerenderInto(document.getElementById("slot-duty"), binderHTML(state),
          sig(state.duty, state.matchers, state.sequences, state.objectives, state.results, state.quiz.answers, state.quiz.checked, state.quiz.done, state.quiz.score, UIState.binderOpen), "duty");
        break;
      }
      case "toggle-obj-card": {
        const id = el.dataset.oid;
        UIState.padOpen[id] = !UIState.padOpen[id];
        if (Overlay.kind === "sheet-right" && !Overlay.el.hidden) {
          rerenderInto(Overlay.contentEl, padHeadHTML(state) + padBodyHTML(state));
        }
        break;
      }
      case "check-objective": {
        const obj = objectiveById(el.dataset.oid);
        const result = obj.check(state);
        Store.dispatch({ type: "CHECK_OBJECTIVE", id: obj.id, result });
        break;
      }
      case "use-hint":
        Store.dispatch({ type: "USE_HINT", id: el.dataset.oid });
        break;
      case "set-match":
        Store.dispatch({ type: "SET_MATCH", key: el.dataset.mkey, row: el.dataset.mrow, option: el.dataset.mopt });
        break;
      case "seq-push":
        Store.dispatch({ type: "SEQ_PUSH", key: el.dataset.skey, stepId: el.dataset.spid });
        break;
      case "seq-remove":
        Store.dispatch({ type: "SEQ_REMOVE", key: el.dataset.skey, index: Number(el.dataset.sidx) });
        break;
      case "seq-clear":
        Store.dispatch({ type: "SEQ_CLEAR", key: el.dataset.skey });
        break;
      case "select-consignment":
        UIState.floorSelected = el.dataset.cid;
        render(); // redraw ledger + desk + right rail for the new selection
        break;
      case "set-vector": {
        const cid = UIState.floorSelected;
        Store.dispatch({ type: "SET_STAMP_FIELDS", id: cid, vectorId: el.dataset.vid });
        if (el.dataset.vid === BENIGN_ID) {
          Store.dispatch({ type: "SET_STAMP_FIELDS", id: cid, districtId: "authorised" });
        }
        break;
      }
      case "set-district":
        Store.dispatch({ type: "SET_STAMP_FIELDS", id: UIState.floorSelected, districtId: el.dataset.did });
        break;
      case "stamp": {
        const c = boardFor(state.mode).find((x) => x.id === el.dataset.cid);
        Store.dispatch({ type: "STAMP", id: c.id, correct: stampIsCorrect(state, c) });
        break;
      }
      case "set-exposure-level":
        Store.dispatch({ type: "SET_EXPOSURE", district: el.dataset.did, level: el.dataset.lv });
        break;
      case "toggle-signal":
        Store.dispatch({ type: "TOGGLE_SIGNAL", id: el.dataset.cid });
        break;
      case "quiz-answer":
        Store.dispatch({ type: "QUIZ_ANSWER", id: el.dataset.qid, idx: Number(el.dataset.qidx) });
        break;
      case "quiz-check":
        Store.dispatch({ type: "QUIZ_CHECK", id: el.dataset.qid });
        break;
      case "quiz-finish": {
        const items = quizItemsFor(state.mode);
        const { correctCount } = quizCounts(state, items);
        Store.dispatch({ type: "QUIZ_FINISH", score: correctCount / items.length });
        break;
      }
      default:
        break;
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target instanceof Element ? e.target.closest('select[data-action="set-exposure-tag"]') : null;
    if (!el) return;
    Store.dispatch({ type: "SET_EXPOSURE", district: el.dataset.did, tag: el.value });
  });

  /* ---------- boot ---------- */

  Store.subscribe(render);

  function boot() {
    const saved = loadPersisted();
    Store.dispatch(saved ? { type: "REPLACE", state: saved } : { type: "HYDRATED" });
  }

  // one frame of the lamp-boot screen, mirroring the original's hydration gate
  requestAnimationFrame(() => requestAnimationFrame(boot));
})();
