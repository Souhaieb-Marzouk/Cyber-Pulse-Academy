// ─── Lab UI: rendering + components (vanilla port of the lab's React components) ───
// Template functions build HTML strings; a tiny Overlay manager replaces Radix
// dialog/sheet; the custom select component replaces Radix Select. State updates
// re-render only the affected region (see update* functions at the bottom).

(function () {
  "use strict";

  const LAB = () => window.LAB;
  const Store = () => window.LabStore;
  const Engine = () => window.LabEngine;

  // ── tiny DOM helpers ─────────────────────────────────────────────────────
  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function scrollToId(id) {
    const n = document.getElementById(id);
    if (n) n.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── icons (exact lucide node data from js/icons.js) ──────────────────────
  const ICON_KEYS = {
    alert: "triangle-alert",
    arrowDown: "arrow-down",
    arrowUp: "arrow-up",
    badgeCheck: "badge-check",
    bookMarked: "book-marked",
    bookOpen: "book-open",
    box: "box",
    check: "check",
    chevronDown: "chevron-down",
    checkCircle: "circle-check-big",
    circle: "circle",
    crosshair: "crosshair",
    externalLink: "external-link",
    arrowRight: "arrow-right",
    flag: "flag",
    gradCap: "graduation-cap",
    key: "key-round",
    layers: "layers",
    lightbulb: "lightbulb",
    listChecks: "list-checks",
    lock: "lock",
    moon: "moon",
    network: "network",
    radio: "radio",
    rotate: "rotate-ccw",
    shield: "shield-check",
    star: "star",
    sun: "sun",
    swords: "swords",
    x: "x",
  };

  function icon(name, cls) {
    const node = window.ICON_NODES[ICON_KEYS[name]];
    if (!node) return "";
    const inner = node
      .map(([tag, attrs]) => {
        const a = Object.entries(attrs)
          .filter(([k]) => k !== "key")
          .map(([k, v]) => `${k}="${esc(v)}"`)
          .join(" ");
        return `<${tag} ${a}/>`;
      })
      .join("");
    return `<svg class="icon${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  }

  // ── shared pieces ────────────────────────────────────────────────────────
  function pillarBadge(pillar) {
    const meta = LAB().PILLAR_META[pillar];
    return `<span class="pillar-badge" style="color:${meta.hue}"><span class="pillar-dot" style="background:${meta.hue}"></span>${pillar} · ${esc(meta.label)}</span>`;
  }

  function progressRing(done, total, size = 72) {
    const r = size / 2 - 6;
    const c = 2 * Math.PI * r;
    const ratio = total === 0 ? 0 : done / total;
    return `<div class="ring" role="img" aria-label="${done} of ${total} work orders closed">
      <svg width="${size}" height="${size}" class="ring-rot">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(148,163,184,0.2)" stroke-width="5"></circle>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#FFB224" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - ratio)}"></circle>
      </svg>
      <span class="ring-label">${done}/${total}</span>
    </div>`;
  }

  function sectionHeading(kicker, title, sub) {
    return `<div class="section-heading">
      <p class="section-kicker">${esc(kicker)}</p>
      <h2 class="section-title">${esc(title)}</h2>
      ${sub ? `<p class="section-sub">${esc(sub)}</p>` : ""}
    </div>`;
  }

  function termButton(term, id) {
    return `<button type="button" class="term" data-action="term" data-term="${esc(id ?? term)}" title="Glossary: ${esc(id ?? term)}">${esc(term)}</button>`;
  }

  // ── Overlay manager (replaces Radix Dialog / AlertDialog / Sheet) ────────
  // kind: "dialog" (Esc + backdrop click close) | "alert" (Esc only, Radix
  // AlertDialog semantics) | "sheet-right" | "sheet-bottom" (Esc + backdrop).
  let activeOverlay = null;
  let lastFocused = null;

  const Overlay = {
    open(kind, panelHTML, onClose) {
      Overlay.close(true);
      lastFocused = document.activeElement;
      const root = el(`<div class="overlay-root"><div class="overlay-backdrop"></div>${panelHTML}</div>`);
      root.querySelector(".overlay-backdrop").addEventListener("click", () => {
        if (kind !== "alert") Overlay.close();
      });
      document.body.classList.add("modal-open");
      document.body.appendChild(root);
      activeOverlay = { kind, root, onClose };
      // focus the first focusable element inside the panel
      const panel = root.querySelector(".overlay-panel");
      const first = panel.querySelector("button, [href], input, select, [tabindex]:not([tabindex='-1'])");
      if (first) first.focus();
      requestAnimationFrame(() => root.classList.add("open"));
      return root;
    },
    close(silent) {
      const o = activeOverlay;
      if (!o) return;
      activeOverlay = null;
      document.body.classList.remove("modal-open");
      o.root.classList.remove("open");
      const done = () => {
        o.root.remove();
        if (!silent && lastFocused && document.contains(lastFocused)) {
          try { lastFocused.focus(); } catch { /* ignore */ }
        }
        if (o.onClose && !silent) o.onClose();
      };
      // let the exit transition play (matches the original 150–200 ms out animations)
      setTimeout(done, 160);
    },
    onKeydown(e) {
      if (!activeOverlay) return false;
      const o = activeOverlay;
      if (e.key === "Escape") {
        e.preventDefault();
        Overlay.close();
        return true;
      }
      if (e.key === "Tab") {
        // focus trap
        const focusables = o.root.querySelectorAll(
          "button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex='-1'])"
        );
        if (!focusables.length) return true;
        const list = Array.from(focusables).filter((n) => n.offsetParent !== null || n === document.activeElement);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        return true;
      }
      return false;
    },
  };

  function dialogPanel(inner, extraClass, labelledBy, describedBy, showClose) {
    return `<div class="overlay-panel dialog ${extraClass || ""}" role="dialog" aria-modal="true" ${labelledBy ? `aria-labelledby="${labelledBy}"` : ""} ${describedBy ? `aria-describedby="${describedBy}"` : ""}>
      ${inner}
      ${showClose === false ? "" : `<button type="button" class="overlay-close" data-action="overlay-close" aria-label="Close">${icon("x")}<span class="sr-only">Close</span></button>`}
    </div>`;
  }

  function sheetPanel(inner, side, title, description) {
    return `<div class="overlay-panel sheet sheet-${side}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sheet-head">
        <div>
          <p class="sheet-title">${esc(title)}</p>
          ${description ? `<p class="sheet-desc">${esc(description)}</p>` : ""}
        </div>
        <button type="button" class="overlay-close" data-action="overlay-close" aria-label="Close">${icon("x")}<span class="sr-only">Close</span></button>
      </div>
      ${inner}
    </div>`;
  }

  // ── Mode gate ────────────────────────────────────────────────────────────
  function renderGate(root) {
    root.innerHTML = `
    <main class="gate" aria-label="Shift selection">
      <div class="gate-hero">
        <div class="gate-sigil floor-lit" style="--floor-glow: rgba(255,178,36,.4)">${icon("network", "gate-sigil-icon")}</div>
        <p class="gate-kicker">OSI Transit Authority</p>
        <h1 class="gate-title">THE PROTOCOL TOWER</h1>
        <p class="gate-sub">CompTIA Network+ (N10-009) · Lesson 1.1 — OSI model layers &amp; encapsulation concepts</p>
        <p class="gate-tag">Seven floors. One wire. Pick your shift.</p>
      </div>
      <div class="gate-cards">
        <button type="button" data-action="pick-mode" data-mode="medium" class="gate-card gate-card-day">
          <div class="gate-card-head">
            <span class="gate-card-sigil gate-card-sigil-day">${icon("sun")}</span>
            <div>
              <p class="gate-card-name">DAY SHIFT</p>
              <p class="gate-card-tier tier-day">Medium · guided dispatch</p>
            </div>
          </div>
          <p class="gate-card-copy">13 work orders in learning order, tiered hints at your elbow, and every check explains itself. Build the tower, run the dispatch line, close your first trouble tickets.</p>
          <p class="gate-card-cta cta-day">Start the day shift ${icon("arrowRight", "cta-arrow")}</p>
        </button>
        <button type="button" data-action="pick-mode" data-mode="hard" class="gate-card gate-card-night">
          <div class="gate-card-head">
            <span class="gate-card-sigil gate-card-sigil-night">${icon("moon")}</span>
            <div>
              <p class="gate-card-name">NIGHT SHIFT</p>
              <p class="gate-card-tier tier-night">Hard · storm watch</p>
            </div>
          </div>
          <p class="gate-card-copy">9 orders on a noisy 02:00 console: red herrings, bogus evidence cards, exact-value reads and near-miss rejection. Hints are off by default and cost score.</p>
          <p class="gate-card-cta cta-night">Take the night shift ${icon("arrowRight", "cta-arrow")}</p>
        </button>
      </div>
      <p class="gate-foot">Progress auto-saves in this browser. All evidence is synthetic training data — fictional campus, RFC 5737/7042 addresses, defensive purpose.</p>
    </main>`;
  }

  // ── Status board ─────────────────────────────────────────────────────────
  function statusBoard(mode) {
    const p = Store().progress(mode);
    const q = Store().quizProgress(mode);
    return `<header class="statusboard">
      <div class="statusbar">
        <div class="status-id">
          <span class="status-sigil">${icon("layers")}</span>
          <div class="status-idtext">
            <p class="status-title">PROTOCOL TOWER</p>
            <p class="status-org">OSI Transit Authority</p>
          </div>
        </div>
        <span class="status-mode status-mode-${mode}">${icon(mode === "medium" ? "sun" : "moon", "status-mode-icon")}${mode === "medium" ? "Day shift" : "Night shift"}</span>
        <div class="status-right">
          <div class="status-count" aria-label="Work orders ${p.done} of ${p.total} closed">${icon("listChecks")}<span><b id="sb-orders-done">${p.done}</b>/${p.total} orders</span></div>
          <div class="status-count" aria-label="Checkpoint ${q.answered} of ${q.total} answered">${icon("bookOpen")}<span><b id="sb-quiz-answered">${q.answered}</b>/${q.total} checkpoint</span></div>
          <button type="button" class="btn btn-ghost btn-sm" data-action="open-glossary">${icon("bookOpen")} <span class="hide-sm">Glossary</span></button>
          <button type="button" class="btn btn-ghost btn-sm status-reset" data-action="reset-open">${icon("rotate")} <span class="hide-sm">Reset</span></button>
        </div>
      </div>
      <nav class="tower-strip scroll-thin" aria-label="Tower progress">${towerStripChips(mode)}</nav>
    </header>`;
  }

  function litState(mode, indexFromTop) {
    const p = Store().progress(mode);
    const threshold = (indexFromTop + 1) / 7; // floor 7 (index 0) lights at ≥1/7
    return p.ratio >= threshold - 0.001;
  }

  function towerStripChips(mode) {
    return LAB()
      .LAYERS.map((l, i) => {
        const lit = litState(mode, i);
        return `<button type="button" data-action="scroll-to" data-target="floor-${l.n}" aria-label="Floor ${l.n} ${esc(l.name)}"
          class="strip-chip${lit ? " strip-chip-lit" : ""}" ${lit ? `style="background:${l.hue}22;border-color:${l.hue}77;color:${l.hue}"` : ""}>${l.n}</button>`;
      })
      .join("") + `<span class="strip-wire">· wire</span>`;
  }

  // ── Tower map (desktop sidebar) ──────────────────────────────────────────
  function towerMap(mode) {
    const plates = LAB()
      .LAYERS.map((l, i) => {
        const lit = litState(mode, i);
        return `<li><button type="button" data-action="scroll-to" data-target="floor-${l.n}"
          aria-label="Floor ${l.n} ${esc(l.name)}${lit ? " — powered" : ""}"
          class="map-plate${lit ? " map-plate-lit" : ""}"
          ${lit ? `style="background:${l.hue}1f;border-color:${l.hue}66;--floor-glow:${l.hue}44"` : ""}>
          <span class="map-plate-num" ${lit ? `style="background:${l.hue};color:#0A1220"` : ""}>${l.n}</span>
          <span class="map-plate-text">
            <span class="map-plate-name">${esc(l.name)}</span>
            <span class="map-plate-sub">${esc(l.dept)} · ${esc(l.pdu)}</span>
          </span>
        </button></li>`;
      })
      .join("");
    const allDone = Store().progress(mode).done === Store().progress(mode).total;
    return `<aside class="tower-map" aria-label="Tower map">
      <p class="rail-label">Tower · floors</p>
      <ul class="map-plates">${plates}</ul>
      <div class="map-wire${allDone ? " map-wire-lit" : ""}" ${allDone ? 'style="--floor-glow: rgba(255,178,36,.5)"' : ""}>
        <p class="map-wire-label${allDone ? " text-primary" : ""}">─ the wire ─</p>
      </div>
      <nav class="map-jump" aria-label="Jump to section">
        <button type="button" data-action="scroll-to" data-target="manual" class="map-jump-btn">→ Tower Manual</button>
        <button type="button" data-action="scroll-to" data-target="quiz" class="map-jump-btn">→ Checkpoint</button>
        <button type="button" data-action="scroll-to" data-target="handover" class="map-jump-btn">→ Shift Handover</button>
      </nav>
    </aside>`;
  }

  // ── Work orders rail + mobile sheet ──────────────────────────────────────
  function ordersList(mode, withLocate) {
    const objs = Engine().objectivesFor(mode);
    return `<ol class="orders-list">${objs
      .map((o) => {
        const st = Store().state.objState[o.id];
        const done = st && st.done;
        return `<li><button type="button" data-action="locate-order" data-target="station-${o.id}" ${withLocate ? 'data-locate="1"' : ""}
          aria-label="Work order ${o.number}: ${esc(o.title)}. ${done ? "Closed." : "Open."}"
          class="orders-item${done ? " orders-item-done" : ""}">
          ${done ? icon("checkCircle", "orders-check") : icon("circle", "orders-circle")}
          <span class="orders-item-text">
            <span class="orders-item-head"><span class="orders-num">${o.number}</span><span class="pillar-dot" style="background:${LAB().PILLAR_META[o.pillar].hue}"></span><span class="orders-station">${esc(o.station)}</span></span>
            <span class="orders-item-title">${esc(o.title)}</span>
          </span>
          ${icon("crosshair", "orders-cross")}
        </button></li>`;
      })
      .join("")}</ol>`;
  }

  function railBody(mode, withLocate) {
    const p = Store().progress(mode);
    return `<div class="rail-body">
      <div class="rail-head">
        ${progressRing(p.done, p.total)}
        <div>
          <p class="rail-head-title">WORK ORDERS</p>
          <p class="rail-head-sub">${p.done === p.total ? "All orders closed — the tower is lit." : "Close every order to light the whole tower."}</p>
        </div>
      </div>
      ${ordersList(mode, withLocate)}
    </div>`;
  }

  // ── C1 Briefing ──────────────────────────────────────────────────────────
  function briefing(mode) {
    const b = LAB().BRIEFING[mode];
    return `<section class="card briefing" aria-labelledby="briefing-h">
      <div class="briefing-meta">
        <span class="briefing-chip">${icon("radio")} Dispatch briefing</span>
        <span class="briefing-time">${esc(b.time)}</span>
        <span class="briefing-data">Training data · fictional campus</span>
      </div>
      <h1 id="briefing-h" class="briefing-title">${esc(b.tag)}</h1>
      <div class="briefing-body">${b.body.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    </section>`;
  }

  // ── C2 Manual ────────────────────────────────────────────────────────────
  let openFloor = null; // single-open accordion state

  function manual() {
    const L = LAB();
    const floors = L.LAYERS.map((l) => {
      const open = openFloor === l.n;
      return `<div class="floor-acc" id="floor-${l.n}">
        <h3 class="floor-acc-h">
          <button type="button" class="floor-acc-trigger" data-action="accordion" data-floor="${l.n}" aria-expanded="${open}" aria-controls="floor-panel-${l.n}" id="floor-trigger-${l.n}">
            <span class="floor-acc-num" style="background:${l.hue}22;color:${l.hue};border:1px solid ${l.hue}55">${l.n}</span>
            <span class="floor-acc-name">
              <span class="floor-acc-name-main">${esc(l.name)}</span>
              <span class="floor-acc-name-sub">${esc(l.dept)} · PDU: ${esc(l.pdu)}</span>
            </span>
            ${icon("arrowDown", "floor-acc-chevron")}
          </button>
        </h3>
        <div class="floor-acc-content${open ? " open" : ""}" id="floor-panel-${l.n}" role="region" aria-labelledby="floor-trigger-${l.n}" ${open ? "" : "hidden"}>
          <div class="floor-acc-inner">
            <p class="floor-fn">${esc(l.fn)}</p>
            <div class="floor-grid">
              <p class="floor-box"><span class="floor-box-label">Protocols</span><span class="floor-box-mono">${esc(l.protocols)}</span></p>
              <p class="floor-box"><span class="floor-box-label">Devices</span><span class="floor-box-mono">${esc(l.devices)}</span></p>
            </div>
            <p class="floor-tip">${icon("gradCap")}<span><b class="floor-tip-lead">Exam tip — </b>${esc(l.tip)}</span></p>
          </div>
        </div>
      </div>`;
    }).join("");

    return `<section id="manual" class="card manual" aria-labelledby="manual-h">
      ${sectionHeading("Knowledge core · read once, reference forever", "The Tower Manual", "Everything the seven departments do — charters, cargo, protocols, hardware. Come back any time a work order stalls.")}
      <p class="manual-intro">The ${termButton("OSI model")} is ISO's vendor-neutral reference model (1984): a common language made of seven floors, not real software. Every message rides it twice — down the sender's tower where each floor wraps the cargo ( ${termButton("encapsulation")}), and up the receiver's tower where each floor unwraps it (${termButton("decapsulation")}). Floors talk down to their neighbor (adjacent-layer interaction) and talk across to the SAME floor on the far end through their headers (same-layer interaction). Each floor names its cargo differently — the ${termButton("PDU")} chain is your fastest diagnostic: data → segment → packet → frame → bits.</p>
      <div class="manual-floors">${floors}</div>
      <div class="manual-extras">
        <div class="manual-extra">
          <p class="manual-extra-title">Encapsulation — the descent</p>
          <ol class="descent">
            <li>1 · Application data is handed down — PDU <span class="mono text-primary">data</span></li>
            <li>2 · Transport adds a TCP/UDP header (ports) — <span class="mono text-primary">segment / datagram</span></li>
            <li>3 · Network adds an IP header (addresses, TTL) — <span class="mono text-primary">packet</span></li>
            <li>4 · Data Link adds MAC header + FCS trailer — <span class="mono text-primary">frame</span></li>
            <li>5 · Physical encodes signals onto the medium — <span class="mono text-primary">bits</span></li>
          </ol>
          <p class="manual-note">The receiver climbs in reverse, stripping one wrapper per floor. Layer 2 is the only floor that adds a trailer (FCS) — and MAC addresses are rewritten at every router hop while the IPs stay end-to-end.</p>
        </div>
        <div class="manual-extra">
          <p class="manual-extra-title">TCP vs UDP — pick the freight</p>
          <table class="tcpudp">
            <thead><tr><th>Property</th><th>TCP</th><th>UDP</th></tr></thead>
            <tbody>
              <tr><td class="td-prop">Connection</td><td>oriented — SYN → SYN-ACK → ACK</td><td>connectionless</td></tr>
              <tr><td class="td-prop">Delivery</td><td>guaranteed, ordered, retransmits</td><td>best effort</td></tr>
              <tr><td class="td-prop">PDU</td><td>segment</td><td>datagram</td></tr>
              <tr><td class="td-prop">Rides</td><td>web, files, mail, SSH</td><td>DNS, DHCP, VoIP, live A/V</td></tr>
            </tbody>
          </table>
        </div>
        <div class="manual-extra">
          <p class="manual-extra-title">The TCP/IP mapping</p>
          <ul class="wings">${LAB().TCP_IP_WINGS.map((w) => `<li class="wing-row"><span class="wing-name">${esc(w.label)}</span><span class="wing-floors">${esc(w.floors)}</span></li>`).join("")}</ul>
          <p class="manual-note2">Exams speak both models: the tower (OSI) diagnoses, the building (TCP/IP) ships.</p>
        </div>
        <div class="manual-col">
          <div class="manual-extra">
            <p class="manual-extra-title">${icon("lightbulb")} Mnemonics</p>
            ${LAB().MNEMONICS.map((m) => `<p class="mnemonic"><span class="mnemonic-dir">${esc(m.dir)}: </span>“${esc(m.line)}”</p>`).join("")}
          </div>
          <div class="manual-extra">
            <p class="manual-extra-title">MTU — the ceiling</p>
            <p class="manual-mtu">Standard Ethernet ${termButton("MTU")} = <span class="mono mtu-value">1500 bytes</span>; jumbo frames reach ≈9000. Oversize packets are fragmented (L3) — or silently dropped when the DF bit is set (the VPN “black hole”: pings pass, transfers stall).</p>
          </div>
        </div>
      </div>
    </section>`;
  }

  // ── C3+C4 Stations ───────────────────────────────────────────────────────
  function station(obj, nextId) {
    const st = Store().state.objState[obj.id];
    const done = st && st.done;
    const hard = obj.mode === "hard";
    const hintsMax = obj.hints.length;
    const used = st ? st.hintsUsed || 0 : 0;
    return `<section id="station-${obj.id}" aria-labelledby="station-${obj.id}-h" class="card station${done ? " station-done" : ""}">
      <div class="station-head">
        <div class="station-head-row">
          <span class="wo-badge">Work order ${obj.number}</span>
          <span class="wo-station">${esc(obj.station)}</span>
          <span class="wo-right">${pillarBadge(obj.pillar)}<span class="wo-id">${obj.id}</span></span>
        </div>
        <h3 id="station-${obj.id}-h" class="station-title">${esc(obj.title)}</h3>
        <p class="station-meta" data-meta="${obj.id}">Covers ${esc(obj.anchor)} · Bloom: ${esc(obj.bloom)}${st ? ` · checks run: ${st.attempts}` : ""}</p>
      </div>
      <div class="station-widget" id="widget-${obj.id}">${widgetHTML(obj)}</div>
      <div class="station-actions">
        <button type="button" class="btn btn-primary" data-action="check" data-obj="${obj.id}">${icon("flag")} Check results</button>
        <button type="button" class="btn btn-outline${hard ? " hint-hard" : ""}" data-action="hint" data-obj="${obj.id}" ${used >= hintsMax ? "disabled" : ""}>
          ${icon(hard ? "lock" : "key")} ${hard ? "Take the nudge (−3 pts)" : `Take a hint (${used}/${hintsMax})`}
        </button>
        ${nextId ? `<button type="button" class="next-order" data-action="scroll-to" data-target="station-${nextId}">Next work order ${icon("arrowDown")}</button>` : ""}
      </div>
      <div class="hint-ladder" data-hints="${obj.id}" aria-live="polite" ${used === 0 ? "hidden" : ""}>${used > 0 ? hintLadderHTML(obj, used) : ""}</div>
      <div data-result="${obj.id}">${resultHTML(obj.id)}</div>
    </section>`;
  }

  function hintLadderHTML(obj, used) {
    return obj.hints.slice(0, used).map((h, i) =>
      `<p class="hint-item"><span class="hint-tag">Hint ${i + 1}</span>${esc(h)}</p>`
    ).join("");
  }

  function resultHTML(objId) {
    const result = Store().state.results[objId];
    if (!result) return "";
    return `<div aria-live="polite" role="status" class="result ${result.pass ? "result-pass" : "result-fail"}">
      <p class="result-head ${result.pass ? "text-emerald" : "text-amber"}">${result.pass ? icon("checkCircle") : icon("alert")}${result.pass ? "Work order closed — why it matters" : "Rejected — teaching note"}</p>
      <p class="result-body">${esc(result.feedback)}</p>
    </div>`;
  }

  // ── Custom select (replaces Radix Select) ────────────────────────────────
  let openSelect = null;

  function selectHTML(obj, opts, value, ariaLabel, attrs) {
    const selected = opts.find((o) => o.id === value);
    const options = opts
      .map(
        (o) => `<button type="button" role="option" class="select-option${o.id === value ? " is-selected" : ""}"
          id="opt-${attrs.uid}-${o.id}" data-action="select-option" data-opt-id="${esc(o.id)}" aria-selected="${o.id === value}">${o.id === value ? icon("check", "select-check") : "<span class=\"select-check-space\"></span>"}${esc(o.label)}</button>`
      )
      .join("");
    return `<div class="select" data-select="1" data-uid="${attrs.uid}" ${attrs.dataAttrs || ""} data-value="${esc(value ?? "")}">
      <button type="button" class="select-trigger" ${attrs.triggerId ? `id="${attrs.triggerId}"` : ""} aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(ariaLabel)}">
        <span class="select-value${selected ? "" : " select-placeholder"}">${selected ? esc(selected.label) : "— select —"}</span>
        ${icon("chevronDown", "select-chevron")}
      </button>
      <div class="select-pop scroll-thin" role="listbox" hidden>${options}</div>
    </div>`;
  }

  function closeOpenSelect() {
    if (!openSelect) return;
    const pop = openSelect.querySelector(".select-pop");
    const trigger = openSelect.querySelector(".select-trigger");
    pop.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    openSelect.classList.remove("select-open");
    openSelect = null;
  }

  function toggleSelect(sel) {
    if (openSelect === sel) {
      closeOpenSelect();
      return;
    }
    closeOpenSelect();
    openSelect = sel;
    sel.querySelector(".select-pop").hidden = false;
    sel.querySelector(".select-trigger").setAttribute("aria-expanded", "true");
    sel.classList.add("select-open");
  }

  function selectOption(sel, optId) {
    const objId = sel.dataset.obj;
    const field = sel.dataset.field;
    const part = sel.dataset.part; // tickets: "layer" | "fix"
    const StoreS = Store();
    if (part) {
      StoreS.setAnswer(objId, (prev) => {
        const cur = Engine().asTickets(prev);
        return { ...cur, [field]: { layer: (cur[field] && cur[field].layer) || "", fix: (cur[field] && cur[field].fix) || "", [part]: optId } };
      });
    } else {
      StoreS.setAnswer(objId, (prev) => ({ ...Engine().asRec(prev), [field]: optId }));
    }
    closeOpenSelect();
    // return focus to the trigger (Radix-like)
    sel.querySelector(".select-trigger").focus();
  }

  // select keyboard support on triggers (Radix-like behavior)
  function selectKeydown(e, sel) {
    const pop = sel.querySelector(".select-pop");
    const isOpen = !pop.hidden;
    if (!isOpen) {
      if (["Enter", " ", "Spacebar", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        toggleSelect(sel);
      }
      return;
    }
    const options = Array.from(pop.querySelectorAll(".select-option"));
    let activeIdx = options.findIndex((o) => o.classList.contains("is-active"));
    if (activeIdx === -1) activeIdx = options.findIndex((o) => o.getAttribute("aria-selected") === "true");
    const move = (dir) => {
      e.preventDefault();
      let next = activeIdx + dir;
      if (next < 0) next = options.length - 1;
      if (next >= options.length) next = 0;
      options.forEach((o, i) => o.classList.toggle("is-active", i === next));
      sel.querySelector(".select-trigger").setAttribute("aria-activedescendant", options[next].id);
      options[next].scrollIntoView({ block: "nearest" });
    };
    switch (e.key) {
      case "ArrowDown": move(1); break;
      case "ArrowUp": move(-1); break;
      case "Home": e.preventDefault(); options.forEach((o, i) => o.classList.toggle("is-active", i === 0)); break;
      case "End": e.preventDefault(); options.forEach((o, i) => o.classList.toggle("is-active", i === options.length - 1)); break;
      case "Enter":
      case " ":
      case "Spacebar": {
        e.preventDefault();
        const target = options[activeIdx];
        if (target) selectOption(sel, target.dataset.optId);
        break;
      }
      case "Escape":
        e.preventDefault();
        closeOpenSelect();
        break;
      case "Tab":
        closeOpenSelect();
        break;
      default: {
        // simple typeahead: cycle options starting with the pressed letter
        if (/^[a-z0-9]$/i.test(e.key)) {
          e.preventDefault();
          const letter = e.key.toLowerCase();
          const matches = options.map((o, i) => ({ o, i })).filter(({ o }) => o.textContent.trim().toLowerCase().startsWith(letter));
          if (!matches.length) break;
          let idx = matches.findIndex(({ i }) => i === activeIdx);
          const pick = matches[(idx + 1) % matches.length];
          options.forEach((o, i) => o.classList.toggle("is-active", i === pick.i));
          sel.querySelector(".select-trigger").setAttribute("aria-activedescendant", options[pick.i].id);
          options[pick.i].scrollIntoView({ block: "nearest" });
        }
      }
    }
  }

  // ── Widgets ──────────────────────────────────────────────────────────────
  function asArr(v) {
    return Array.isArray(v) ? v.slice() : [];
  }

  function orderBoardHTML(obj) {
    const task = obj.task;
    const seq = asArr(Store().state.answers[obj.id]);
    const tray = task.items.filter((it) => !seq.includes(it.id));
    const trayItems = tray.length
      ? tray
          .map(
            (it) => `<li><button type="button" data-action="place-card" data-obj="${obj.id}" data-card="${it.id}"
              class="tray-card${it.bogus ? " tray-card-bogus" : ""}"><span class="font-medium">${esc(it.label)}</span>${it.sub ? `<span class="tray-sub">${esc(it.sub)}</span>` : ""}</button></li>`
          )
          .join("")
      : `<li class="empty-note">Tray empty — every card is placed.</li>`;
    const timeline = seq.length
      ? seq
          .map((id, i) => {
            const it = task.items.find((x) => x.id === id);
            return `<li class="tl-row">
              <span class="tl-num">${i + 1}</span>
              <div class="tl-card"><span class="font-medium">${esc(it ? it.label : id)}</span>${it && it.sub ? `<span class="tray-sub">${esc(it.sub)}</span>` : ""}</div>
              <div class="tl-controls">
                <button type="button" data-action="move-card" data-obj="${obj.id}" data-idx="${i}" data-dir="-1" ${i === 0 ? "disabled" : ""} aria-label="Move step ${i + 1} up" class="tl-btn">${icon("arrowUp")}</button>
                <button type="button" data-action="move-card" data-obj="${obj.id}" data-idx="${i}" data-dir="1" ${i === seq.length - 1 ? "disabled" : ""} aria-label="Move step ${i + 1} down" class="tl-btn">${icon("arrowDown")}</button>
                <button type="button" data-action="remove-card" data-obj="${obj.id}" data-card="${id}" aria-label="Remove step ${i + 1}" class="tl-btn tl-btn-remove">${icon("x")}</button>
              </div>
            </li>`;
          })
          .join("")
      : `<li class="empty-note">Tap cards from the tray to build the sequence in order.</li>`;
    return `<div class="order-board">
      <div aria-label="${esc(task.trayTitle)}">
        <p class="widget-col-title">${esc(task.trayTitle)}</p>
        <ul class="tray-list">${trayItems}</ul>
      </div>
      <div aria-label="${esc(task.timelineTitle)}">
        <div class="tl-head">
          <p class="widget-col-title">${esc(task.timelineTitle)}</p>
          ${seq.length > 0 ? `<button type="button" data-action="clear-timeline" data-obj="${obj.id}" class="tl-clear" aria-label="Clear timeline">${icon("rotate")} reset</button>` : ""}
        </div>
        <ol class="tl-list">${timeline}</ol>
      </div>
    </div>`;
  }

  function selectRowGridHTML(obj, rows) {
    return `<div class="rows-grid">${rows
      .map((r, i) => {
        const rec = Engine().asRec(Store().state.answers[obj.id]);
        const opts = LAB().resolveOptions(r.options);
        return `<div class="row-card">
          <div class="row-prompt"><p>${esc(r.prompt)}</p>${r.note ? `<p class="row-note">${esc(r.note)}</p>` : ""}</div>
          ${selectHTML(obj, opts, rec[r.id] ?? "", `Select for ${r.prompt}`, { uid: `${obj.id}-${r.id}`.replace(/[^a-zA-Z0-9-]/g, "_"), dataAttrs: `data-obj="${obj.id}" data-field="${esc(r.id)}"` })}
        </div>`;
      })
      .join("")}</div>`;
  }

  function sortChuteHTML(obj) {
    const task = obj.task;
    return `<div>
      <p class="widget-caption">${esc(task.caption)}</p>
      <div class="sort-scroll scroll-thin">${selectRowGridHTML(obj, task.items.map((it) => ({ id: it.id, prompt: it.label, options: task.bins })))}</div>
    </div>`;
  }

  function matchBoardHTML(obj) {
    return `<div>
      <p class="widget-caption">${esc(obj.task.caption)}</p>
      ${selectRowGridHTML(obj, obj.task.rows)}
    </div>`;
  }

  function pickBoardHTML(obj) {
    const task = obj.task;
    const rec = Engine().asRec(Store().state.answers[obj.id]);
    return `<div>
      <p class="widget-caption">${esc(task.caption)}</p>
      <div class="pick-rows">${task.rows
        .map((r) => {
          const active = rec[r.id];
          return `<div class="pick-row">
            <div class="pick-prompt"><p>${esc(r.prompt)}</p>${r.note ? `<p class="row-note">${esc(r.note)}</p>` : ""}</div>
            <div role="radiogroup" aria-label="Transport for ${esc(r.prompt)}" class="pick-chips">${task.chips
              .map(
                (c) => `<button type="button" role="radio" aria-checked="${active === c.id}" data-action="pick-chip" data-obj="${obj.id}" data-row="${esc(r.id)}" data-chip="${esc(c.id)}"
                  class="pick-chip${active === c.id ? " pick-chip-active" : ""}">${active === c.id ? icon("check") : ""}${esc(c.label)}</button>`
              )
              .join("")}</div>
          </div>`;
        })
        .join("")}</div>
    </div>`;
  }

  function evidenceFormHTML(obj) {
    const task = obj.task;
    const rec = Engine().asRec(Store().state.answers[obj.id]);
    const uid = task.title.length; // stable per evidence card (parity with original)
    const fields = task.fields
      .map((f) => {
        const control =
          f.kind === "choice"
            ? selectHTML(obj, LAB().resolveOptions(f.options), rec[f.id] ?? "", f.label, { uid: `${uid}-${f.id}`, triggerId: `ev-${uid}-${f.id}`, dataAttrs: `data-obj="${obj.id}" data-field="${esc(f.id)}"` })
            : `<input id="ev-${uid}-${esc(f.id)}" type="text" value="${esc(rec[f.id] ?? "")}" placeholder="exact value…" autocomplete="off" class="evidence-input" data-obj="${obj.id}" data-field="${esc(f.id)}" aria-label="${esc(f.label)}">`;
        return `<div class="row-card">
          <label for="ev-${uid}-${esc(f.id)}" class="row-prompt-label">${esc(f.label)}</label>
          ${control}
        </div>`;
      })
      .join("");
    return `<div class="evidence">
      <figure class="evidence-figure">
        <figcaption class="evidence-caption" title="${esc(task.title)}">${esc(task.title)}</figcaption>
        <pre class="evidence-pre scroll-thin">${esc(task.lines.join("\n"))}</pre>
      </figure>
      <div class="evidence-fields">${fields}</div>
    </div>`;
  }

  function ticketsBoardHTML(obj) {
    const task = obj.task;
    const rec = Engine().asTickets(Store().state.answers[obj.id]);
    return `<div>
      <p class="widget-caption">${esc(task.caption)}</p>
      <div class="ticket-list">${task.rows
        .map((r, i) => {
          const t = rec[r.id] || {};
          return `<fieldset class="ticket">
            <legend class="sr-only">Ticket ${i + 1}</legend>
            <div class="ticket-head">
              ${icon("box")}
              <div><p class="ticket-title">${esc(r.title)}</p>${r.detail ? `<p class="ticket-detail">${esc(r.detail)}</p>` : ""}</div>
            </div>
            <div class="ticket-selects">
              <div>
                <p class="ticket-label">${esc(task.layerLabel)}</p>
                ${selectHTML(obj, LAB().resolveOptions(r.layerOptions), t.layer ?? "", `${task.layerLabel} for ticket ${i + 1}`, { uid: `${obj.id}-${r.id}-layer`.replace(/[^a-zA-Z0-9-]/g, "_"), dataAttrs: `data-obj="${obj.id}" data-field="${esc(r.id)}" data-part="layer"` })}
              </div>
              <div>
                <p class="ticket-label">${esc(task.fixLabel)}</p>
                ${selectHTML(obj, r.fixOptions, t.fix ?? "", `${task.fixLabel} for ticket ${i + 1}`, { uid: `${obj.id}-${r.id}-fix`.replace(/[^a-zA-Z0-9-]/g, "_"), dataAttrs: `data-obj="${obj.id}" data-field="${esc(r.id)}" data-part="fix"` })}
              </div>
            </div>
          </fieldset>`;
        })
        .join("")}</div>
    </div>`;
  }

  function singlePickHTML(obj) {
    const task = obj.task;
    const value = Store().state.answers[obj.id];
    return `<div role="radiogroup" aria-label="${esc(task.prompt)}" class="single-pick">
      <p class="widget-caption">${esc(task.prompt)}</p>
      ${task.options
        .map((o, i) => {
          const active = value === o.id;
          return `<button type="button" role="radio" aria-checked="${active}" data-action="pick-single" data-obj="${obj.id}" data-value="${esc(o.id)}"
            class="single-card${active ? " single-card-active" : ""}">
            <span class="single-letter${active ? " single-letter-active" : ""}" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
            <span>${esc(o.label)}</span>
          </button>`;
        })
        .join("")}
    </div>`;
  }

  function widgetHTML(obj) {
    const t = obj.task;
    switch (t.kind) {
      case "order": return orderBoardHTML(obj);
      case "sort": return sortChuteHTML(obj);
      case "match": return matchBoardHTML(obj);
      case "evidence": return evidenceFormHTML(obj);
      case "pick": return pickBoardHTML(obj);
      case "single": return singlePickHTML(obj);
      case "tickets": return ticketsBoardHTML(obj);
      default: return "";
    }
  }

  // granular widget refresh — never re-renders text inputs (keeps focus while typing)
  function updateWidget(objId) {
    const obj = Engine().objectivesFor(Store().state.mode).find((o) => o.id === objId);
    if (!obj) return;
    const widget = document.getElementById(`widget-${objId}`);
    if (!widget) return;
    const t = obj.task;
    if (t.kind === "order") {
      // re-render tray + timeline lists (no text inputs inside)
      widget.innerHTML = orderBoardHTML(obj);
      return;
    }
    if (t.kind === "pick") {
      const rec = Engine().asRec(Store().state.answers[objId]);
      widget.querySelectorAll("[data-row]").forEach((chip) => {
        const active = rec[chip.dataset.row] === chip.dataset.chip;
        chip.setAttribute("aria-checked", String(active));
        chip.classList.toggle("pick-chip-active", active);
        chip.innerHTML = `${active ? icon("check") : ""}${esc(taskChips(obj).find((c) => c.id === chip.dataset.chip).label)}`;
      });
      return;
    }
    if (t.kind === "single") {
      const value = Store().state.answers[objId];
      widget.querySelectorAll("[data-value]").forEach((card) => {
        const active = value === card.dataset.value;
        card.setAttribute("aria-checked", String(active));
        card.classList.toggle("single-card-active", active);
        const letter = card.querySelector(".single-letter");
        letter.classList.toggle("single-letter-active", active);
      });
      return;
    }
    // sort / match / evidence(choices) / tickets — refresh affected selects only
    const rec = Engine().asRec(Store().state.answers[objId]);
    const tickets = Engine().asTickets(Store().state.answers[objId]);
    widget.querySelectorAll("[data-select]").forEach((sel) => {
      const field = sel.dataset.field;
      const part = sel.dataset.part;
      const value = part ? (tickets[field] ? tickets[field][part] ?? "" : "") : rec[field] ?? "";
      refreshSelectValue(sel, value);
    });
  }

  function taskChips(obj) {
    return obj.task.chips;
  }

  function refreshSelectValue(sel, value) {
    sel.dataset.value = value ?? "";
    // find the option list from the task by walking data attrs
    const objId = sel.dataset.obj;
    const obj = Engine().objectivesFor(Store().state.mode).find((o) => o.id === objId);
    if (!obj) return;
    const field = sel.dataset.field;
    const part = sel.dataset.part;
    let opts = null;
    const t = obj.task;
    if (t.kind === "sort") opts = LAB().resolveOptions(t.bins);
    else if (t.kind === "match") opts = LAB().resolveOptions(t.rows.find((r) => r.id === field)?.options);
    else if (t.kind === "evidence") opts = LAB().resolveOptions(t.fields.find((f) => f.id === field)?.options);
    else if (t.kind === "tickets") opts = LAB().resolveOptions(part === "layer" ? t.rows.find((r) => r.id === field)?.layerOptions : t.rows.find((r) => r.id === field)?.fixOptions);
    const selected = opts && opts.find((o) => o.id === value);
    const valueEl = sel.querySelector(".select-value");
    valueEl.textContent = selected ? selected.label : "— select —";
    valueEl.classList.toggle("select-placeholder", !selected);
    sel.querySelectorAll(".select-option").forEach((o) => {
      const on = o.dataset.optId === value;
      o.setAttribute("aria-selected", String(on));
      o.classList.toggle("is-selected", on);
      o.innerHTML = `${on ? icon("check", "select-check") : "<span class=\"select-check-space\"></span>"}${esc(o.textContent.trim())}`;
    });
  }

  // ── quiz (delegated to js/quiz.js) ───────────────────────────────────────
  function quizSection(mode) {
    return window.LabQuiz.quizSectionHTML(mode);
  }

  // ── C6 Handover ──────────────────────────────────────────────────────────
  function handover() {
    const H = LAB().HANDOVER;
    return `<section id="handover" class="card handover" aria-labelledby="handover-h">
      ${sectionHeading("Debrief · field notes", "Shift Handover", "The board the next shift reads: symptom tells, defender takeaways, attacker mindset, and where to go next.")}
      <div class="handover-grid">
        <div class="table-wrap">
          <table class="tells-table">
            <thead><tr class="tells-head"><th>Log tell-tale</th><th>Floor</th></tr></thead>
            <tbody>${H.tells.map((t) => `<tr class="tells-row"><td class="tells-sig">${esc(t.sig)}</td><td class="tells-floor">${esc(t.floor)}</td></tr>`).join("")}</tbody>
          </table>
        </div>
        <div class="handover-two">
          <div class="handover-box">
            <p class="handover-title text-emerald">${icon("shield")} Blue-team takeaways</p>
            <ul class="handover-list">${H.blue.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          </div>
          <div class="handover-box">
            <p class="handover-title text-destructive">${icon("swords")} Red-team mindset</p>
            <ul class="handover-list">${H.red.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="handover-next">
          <p class="handover-title text-primary">What to learn next</p>
          <ul class="handover-list">${H.next.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        </div>
        <div class="handover-links">
          <span class="handover-links-label">Official references:</span>
          ${H.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" class="handover-link">${esc(l.label)}${icon("externalLink")}</a>`).join("")}
        </div>
        <p class="handover-note">Note: this lab is built from a certification chapter (CompTIA Network+ N10-009 Objective 1.1), so the “official reference” links above replace the MITRE ATT&amp;CK pointers other labs carry. Protocol placements marked “simplified” follow the Network+ teaching convention.</p>
      </div>
    </section>`;
  }

  // ── Completion zone + bell ───────────────────────────────────────────────
  let bellOpened = false; // mirrors the original's useRef(false) guard

  function completionZone(mode) {
    const p = Store().progress(mode);
    const q = Engine().quizScore(mode, Store().state.quizAnswers);
    const complete = Store().isComplete(mode);
    return `<section id="completion-zone" aria-labelledby="finish-h" class="card completion-zone">
      ${sectionHeading("Completion", "End-of-shift report", complete ? "Everything is closed — open your report." : "Close all work orders and answer the checkpoint to file the shift.")}
      <div class="zone-actions">
        <button type="button" class="btn btn-primary btn-lg" data-action="${complete ? "open-completion" : "back-to-orders"}">${icon("flag")}${complete ? "Open completion report" : "Back to work orders"}</button>
        <p class="zone-counter" aria-live="polite">orders <span id="zone-orders">${p.done}</span>/${p.total} · checkpoint <span id="zone-quiz">${q.correct}</span>/${q.total}</p>
      </div>
    </section>`;
  }

  function focusAreasHTML(mode) {
    const objState = Store().state.objState;
    const quizAnswers = Store().state.quizAnswers;
    const objs = Engine().objectivesFor(mode);
    const revisited = objs.filter((o) => {
      const st = objState[o.id];
      return st ? st.firstTry === false || st.hintsUsed > 0 : false;
    });
    const missed = LAB().QUIZ[mode].filter((q) => quizAnswers[q.id] !== undefined && quizAnswers[q.id] !== q.correct);
    const hasFindings = revisited.length > 0 || missed.length > 0;
    const items = [];
    for (const o of revisited) {
      const st = objState[o.id];
      const evidence = [
        st && st.attempts > 1 ? `${st.attempts} checks to close` : null,
        st && st.hintsUsed > 0 ? `${st.hintsUsed} hint${st.hintsUsed > 1 ? "s" : ""} taken` : null,
      ].filter(Boolean).join(" · ");
      items.push(`<li><b class="focus-name">${esc(o.station)}</b> — ${esc(o.title)} <span class="focus-evidence">(${evidence} · ${esc(o.anchor)})</span></li>`);
    }
    for (const q of missed) {
      items.push(`<li><b class="focus-name">Checkpoint miss:</b> ${esc(q.topic)} — re-read that quiz explanation, then the matching manual floor.</li>`);
    }
    return `<div class="focus-areas">
      <p class="focus-title">Focus areas before the exam</p>
      ${hasFindings ? `<ul class="focus-list">${items.join("")}</ul>` : `<p class="focus-clean">Clean shift — every check passed first try with no hints, and the checkpoint was flawless. Keep it warm: run the other shift mode, or drill the “What to learn next” list below.</p>`}
    </div>`;
  }

  function openCompletionBell() {
    const mode = Store().state.mode;
    if (!mode) return;
    const objs = Engine().objectivesFor(mode);
    const objState = Store().state.objState;
    const stars = Engine().computeStars(mode, objState);
    const firstTry = objs.filter((o) => objState[o.id] && objState[o.id].firstTry === true).length;
    const hints = objs.reduce((a, o) => a + ((objState[o.id] && objState[o.id].hintsUsed) || 0), 0);
    const q = Engine().quizScore(mode, Store().state.quizAnswers);
    const pillars = ["P1", "P2", "P3", "P4"];
    const titles = ["Shift complete — keep climbing", "Certified dispatcher", "TOWER MASTER — full lights"];
    const pct = Math.round((firstTry / objs.length) * 100);

    const recap = pillars
      .map((p) => {
        const list = objs.filter((o) => o.pillar === p);
        if (list.length === 0) return "";
        const meta = LAB().PILLAR_META[p];
        return `<div class="pillar-recap">
          <p class="pillar-recap-title" style="color:${meta.hue}">${p} · ${esc(meta.label)} — ${list.filter((o) => objState[o.id] && objState[o.id].done).length}/${list.length} closed</p>
          <p class="pillar-recap-body">${esc(list.map((o) => o.station).join(" · "))}</p>
        </div>`;
      })
      .join("");

    const inner = `
      <div class="bell-head">
        <div class="bell-stars" aria-label="${stars} of 3 stars">
          ${[1, 2, 3].map((s) => icon("star", `bell-star${s <= stars ? " star-filled" : ""}`)).join("")}
        </div>
        <p class="bell-title text-primary" id="bell-title">${titles[stars - 1]}</p>
        <p class="bell-sub">${mode === "medium" ? "Day shift" : "Night shift"} debriefing — every work order closed and the checkpoint answered.</p>
      </div>
      <div class="bell-stats">
        <div class="bell-stat"><p class="bell-stat-num">${pct}%</p><p class="bell-stat-label">first-attempt checks</p></div>
        <div class="bell-stat"><p class="bell-stat-num">${hints}</p><p class="bell-stat-label">hints taken</p></div>
        <div class="bell-stat"><p class="bell-stat-num">${q.correct}/${q.total}</p><p class="bell-stat-label">checkpoint score</p></div>
      </div>
      <div class="bell-recap">
        <p class="rail-label">Mastery recap by pillar</p>
        ${recap}
      </div>
      ${focusAreasHTML(mode)}
      <div class="bell-next">
        <p class="bell-next-title text-primary">What to learn next</p>
        <ul class="handover-list">${["Objective 1.2 — networking appliances (routers, switches, firewalls, load balancers).", "Objective 1.3 — cloud concepts & connectivity.", "Objective 1.4 — IP addressing and subnetting: the tower's Floor 3 gets a deep dive."].map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
      <div class="bell-actions">
        <button type="button" class="btn btn-primary btn-flex" data-action="close-completion">Review the tower</button>
        <button type="button" class="btn btn-outline btn-flex" data-action="switch-shift">Switch shift / restart</button>
      </div>`;

    Overlay.open("dialog", dialogPanel(inner, "bell", "bell-title"), () => {
      // closing the bell mirrors onClose: completedShown = false (may re-open on reload)
      Store().state.completedShown = false;
      Store().persist();
    });
  }

  function maybeAutoBell() {
    const mode = Store().state.mode;
    if (!mode) return;
    if (Store().isComplete(mode) && !Store().state.completedShown && !bellOpened) {
      bellOpened = true;
      Store().markCompletedShown();
      scrollToId("completion-zone");
      openCompletionBell();
    }
  }

  // ── Glossary sheet ───────────────────────────────────────────────────────
  function openGlossary(term) {
    const cards = LAB().GLOSSARY.map((g) => {
      const slug = g.term.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const hot = term === g.term;
      return `<div class="glossary-card${hot ? " glossary-hot" : ""}" id="glossary-${slug}">
        <dt class="glossary-term">${esc(g.term)}</dt>
        <dd class="glossary-def">${esc(g.def)}</dd>
      </div>`;
    }).join("");
    Overlay.open("sheet-right", sheetPanel(`<dl class="glossary-list">${cards}</dl>`, "right", "FIELD GLOSSARY", "Sixteen terms every dispatcher owns by heart."));
  }

  // ── Reset dialog ─────────────────────────────────────────────────────────
  function openResetDialog() {
    const inner = `
      <p class="reset-title" id="reset-title">End the shift and reset the lab?</p>
      <p class="reset-desc">Every work order, answer, hint and checkpoint result saved in this browser will be erased. The tower returns to pristine condition and you will pick a shift again.</p>
      <div class="reset-actions">
        <button type="button" class="btn btn-outline" data-action="reset-cancel">Keep working</button>
        <button type="button" class="btn btn-destructive" data-action="reset-confirm">Reset everything</button>
      </div>`;
    Overlay.open("alert", dialogPanel(inner, "reset-dialog", "reset-title", null, false));
  }

  // ── Work orders sheet (mobile/tablet) ────────────────────────────────────
  function openOrdersSheet() {
    Overlay.open("sheet-bottom", sheetPanel(railBody(Store().state.mode, true), "bottom", "WORK ORDERS", "Track, check and locate every open order."));
  }

  // ── Storage warning banner (graceful degradation, G5) ────────────────────
  function renderStorageWarning() {
    const host = document.getElementById("storage-warning");
    if (!host) return;
    host.innerHTML = Store().storageAvailable()
      ? ""
      : `<div class="storage-warning" role="alert">${icon("alert")} Autosave is unavailable in this browser session — the lab still works, but progress will not survive a reload.</div>`;
  }

  // ── World assembly ───────────────────────────────────────────────────────
  function renderWorld(root, mode) {
    const objs = Engine().objectivesFor(mode);
    const stations = objs.map((o, i) => station(o, objs[i + 1] ? objs[i + 1].id : null)).join("");
    const heading = mode === "medium"
      ? {
          title: "Guided Dispatch — thirteen work orders",
          sub: "Work in order or jump around; every bench checks instantly and explains itself. Hints cost stars, never progress.",
        }
      : {
          title: "Storm Watch — nine work orders",
          sub: "Work the board top to bottom if you can — evidence is noisy, validation is strict, and hints cost score.",
        };

    root.innerHTML = `
    <div class="world">
      ${statusBoard(mode)}
      <div class="world-grid">
        ${towerMap(mode)}
        <main class="world-main" aria-label="Lab floor">
          ${briefing(mode)}
          ${manual()}
          <section aria-labelledby="orders-h">
            <div id="orders">${sectionHeading("Interactive environment · work orders", heading.title, heading.sub)}</div>
            <div class="stations">${stations}</div>
          </section>
          ${quizSection(mode)}
          ${handover()}
          ${completionZone(mode)}
        </main>
        <aside class="orders-rail scroll-thin" aria-label="Work orders tracker">${railBody(mode, false)}</aside>
      </div>
      <button type="button" class="orders-fab" data-action="open-orders" aria-label="Open work orders tracker">
        ${icon("listChecks")}<span class="fab-count">${Store().progress(mode).done}/${Store().progress(mode).total}</span>
      </button>
      <div id="storage-warning"></div>
    </div>`;

    renderStorageWarning();
    maybeAutoBell();
  }

  // ── full app render ──────────────────────────────────────────────────────
  function renderApp() {
    const root = document.getElementById("root");
    const mode = Store().state.mode;
    if (!mode) {
      bellOpened = false;
      openFloor = null;
      renderGate(root);
    } else {
      renderWorld(root, mode);
    }
    document.title = "The Protocol Tower — OSI Transit Authority · N10-009 Lab 1.1";
  }

  // ── granular state-event updates ─────────────────────────────────────────
  function updateCounters() {
    const mode = Store().state.mode;
    if (!mode) return;
    const p = Store().progress(mode);
    const q = Store().quizProgress(mode);
    const qs = window.LAB.QUIZ[mode];
    const qCorrect = qs.filter((x) => Store().state.quizAnswers[x.id] === x.correct).length;
    const set = (id, v) => {
      const n = document.getElementById(id);
      if (n) n.textContent = String(v);
    };
    set("sb-orders-done", p.done);
    set("sb-quiz-answered", q.answered);
    const zoneO = document.getElementById("zone-orders");
    const zoneQ = document.getElementById("zone-quiz");
    if (zoneO) zoneO.textContent = String(p.done);
    if (zoneQ) zoneQ.textContent = String(qCorrect);
    // rail: ring + list
    const rail = document.querySelector(".orders-rail");
    if (rail) rail.innerHTML = railBody(mode, false);
    const fab = document.querySelector(".orders-fab .fab-count");
    if (fab) fab.textContent = `${p.done}/${p.total}`;
    // lighting
    updateLighting(mode);
  }

  function updateLighting(mode) {
    // tower map plates
    document.querySelectorAll(".map-plate").forEach((plate, i) => {
      const lit = litState(mode, i);
      const l = LAB().LAYERS[i];
      plate.classList.toggle("map-plate-lit", lit);
      plate.setAttribute("aria-label", `Floor ${l.n} ${l.name}${lit ? " — powered" : ""}`);
      if (lit) {
        plate.style.background = `${l.hue}1f`;
        plate.style.borderColor = `${l.hue}66`;
        plate.style.setProperty("--floor-glow", `${l.hue}44`);
        plate.querySelector(".map-plate-num").style.background = l.hue;
        plate.querySelector(".map-plate-num").style.color = "#0A1220";
      } else {
        plate.style.background = "";
        plate.style.borderColor = "";
        plate.style.removeProperty("--floor-glow");
        plate.querySelector(".map-plate-num").style.background = "";
        plate.querySelector(".map-plate-num").style.color = "";
      }
    });
    const p = Store().progress(mode);
    const allDone = p.done === p.total;
    const wire = document.querySelector(".map-wire");
    if (wire) {
      wire.classList.toggle("map-wire-lit", allDone);
      if (allDone) wire.style.setProperty("--floor-glow", "rgba(255,178,36,.5)");
      else wire.style.removeProperty("--floor-glow");
      const label = wire.querySelector(".map-wire-label");
      if (label) label.classList.toggle("text-primary", allDone);
    }
    // mobile strip chips
    const strip = document.querySelector(".tower-strip");
    if (strip) strip.innerHTML = towerStripChips(mode);
  }

  function updateStationAfterCheck(objId) {
    const mode = Store().state.mode;
    const obj = Engine().objectivesFor(mode).find((o) => o.id === objId);
    if (!obj) return;
    const st = Store().state.objState[objId];
    const section = document.getElementById(`station-${objId}`);
    if (section) section.classList.toggle("station-done", !!(st && st.done));
    const meta = document.querySelector(`[data-meta="${objId}"]`);
    if (meta && st) meta.textContent = `Covers ${obj.anchor} · Bloom: ${obj.bloom} · checks run: ${st.attempts}`;
    const resultHost = document.querySelector(`[data-result="${objId}"]`);
    if (resultHost) resultHost.innerHTML = resultHTML(objId);
    // rail list done state
    const rail = document.querySelector(".orders-rail");
    if (rail) rail.innerHTML = railBody(mode, false);
    updateCounters();
  }

  function updateHints(objId) {
    const mode = Store().state.mode;
    const obj = Engine().objectivesFor(mode).find((o) => o.id === objId);
    if (!obj) return;
    const st = Store().state.objState[objId];
    const used = st ? st.hintsUsed || 0 : 0;
    const btn = document.querySelector(`[data-action="hint"][data-obj="${objId}"]`);
    if (btn) {
      const hard = obj.mode === "hard";
      btn.disabled = used >= obj.hints.length;
      btn.innerHTML = `${icon(hard ? "lock" : "key")} ${hard ? "Take the nudge (−3 pts)" : `Take a hint (${used}/${obj.hints.length})`}`;
    }
    const ladder = document.querySelector(`[data-hints="${objId}"]`);
    if (ladder) {
      if (used === 0) {
        ladder.hidden = true;
        ladder.innerHTML = "";
      } else {
        ladder.hidden = false;
        ladder.innerHTML = hintLadderHTML(obj, used);
      }
    }
  }

  function updateZoneHeading() {
    const mode = Store().state.mode;
    const zone = document.getElementById("completion-zone");
    if (!zone) return;
    const complete = Store().isComplete(mode);
    const btn = zone.querySelector(".zone-actions .btn");
    if (btn) {
      btn.dataset.action = complete ? "open-completion" : "back-to-orders";
      btn.innerHTML = `${icon("flag")}${complete ? "Open completion report" : "Back to work orders"}`;
    }
    const sub = zone.querySelector(".section-sub");
    if (sub) sub.textContent = complete ? "Everything is closed — open your report." : "Close all work orders and answer the checkpoint to file the shift.";
  }

  // ── exports ──────────────────────────────────────────────────────────────
  window.LabUI = {
    esc,
    el,
    icon,
    scrollToId,
    sectionHeading,
    renderApp,
    renderWorld,
    renderGate,
    updateWidget,
    updateStationAfterCheck,
    updateHints,
    updateCounters,
    updateZoneHeading,
    maybeAutoBell,
    openCompletionBell,
    openGlossary,
    openResetDialog,
    openOrdersSheet,
    renderStorageWarning,
    Overlay,
    closeOpenSelect,
    toggleSelect,
    selectOption,
    selectKeydown,
    quizSection,
  };
})();
