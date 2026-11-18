// ── Zone renderers — Receiving Dock, Machining Floor, Dispatch/Loadout, ────
// Test Bench, Training Wall, Shift Debrief (+ end-of-shift trigger).
// Vanilla ports of src/components/lab/zones/*.tsx; same structure, ids,
// copy, ARIA and conditional rendering per difficulty mode.
"use strict";

var Zones = (function () {
  const { esc, icon, machineHeader, syntheticTag, paper, choiceRow, selectField, bitRail, tip } = UI;
  const { actions } = LabStore;
  const S = () => LabStore.state;

  // ── label maps (FloorZone / LoadoutZone constants) ────────────────────────
  const M4_LABELS = {
    private: "RFC1918 private",
    public: "Public (routable)",
    loopback: "Loopback 127/8",
    apipa: "APIPA 169.254/16",
    multicast: "Multicast (Class D)",
  };
  const H5_LABELS = {
    rfc1918: "RFC1918 private",
    public: "Public (routable)",
    apipa: "APIPA / link-local",
    loopback: "Loopback 127/8",
    multicast: "Multicast (Class D)",
    experimental: "Experimental (Class E)",
    "limited-broadcast": "Limited broadcast",
  };
  const M10_LABELS = {
    public: "Public (internet-routable)",
    "private-static": "Private · static",
    "private-dhcp": "Private · DHCP",
    loopback: "Loopback (127.0.0.1)",
    apipa: "APIPA (169.254.x)",
  };
  const FLOOR_PREFIX_OPTS = ["/23", "/24", "/25", "/26", "/27", "/28", "/29", "/30"];
  const LOADOUT_PREFIX_OPTS = ["/25", "/26", "/27", "/28", "/29", "/30"];

  // ── helpers ───────────────────────────────────────────────────────────────
  const isDone = (id) => !!(S().objectives[id] || {}).done;

  const panel = (id, title, tag, pillar, done, inner) => `
    <section aria-label="${esc(title)}" class="panel">
      <div class="panel-head">
        <div>
          <p class="panel-kicker">${id} · ${esc(tag)}</p>
          <h3 class="panel-title">${esc(title)}</h3>
        </div>
        ${UI.stamped(done)}
      </div>
      ${inner}
    </section>`;

  const inputField = (id, label, value, attrs, placeholder, cls = "") => `
    <div class="${cls}">
      <label for="${id}" class="select-label">${esc(label)}</label>
      <input id="${id}" type="text" value="${esc(value)}" placeholder="${esc(placeholder)}" ${attrs}
        class="text-input" />
    </div>`;

  // ════════════════════════════ RECEIVING DOCK ══════════════════════════════
  let dockTab = "orders";
  let openTicketId = "T-102";

  function dockTicketList() {
    const st = S();
    return TICKETS.map((t) => {
      const flagged = st.env.dock.h1.includes(t.id);
      const read = st.env.dock.read.includes(t.id);
      const open = openTicketId === t.id;
      return `
      <li>
        <div class="ticket ${open ? "ticket-open" : ""}">
          <button type="button" class="ticket-open-btn" data-action="open-ticket" data-id="${t.id}"
            aria-expanded="${open}" data-fid="ticket-${t.id}">
            ${icon("FolderOpen", "icon-16 ticket-icon")}
            <span class="ticket-text">
              <span class="ticket-idrow">
                <span class="ticket-id">${t.id}</span>
                <span class="ticket-host">${esc(t.host)}</span>
                ${read ? `<span class="ticket-read">read</span>` : ""}
              </span>
              <span class="ticket-blurb">${esc(t.role)} — ${esc(t.blurb)}</span>
            </span>
          </button>
          ${st.mode === "hard"
            ? `<button type="button" data-action="flag-ticket" data-id="${t.id}" aria-pressed="${flagged}"
                class="flag-btn ${flagged ? "is-flagged" : ""}">
                ${icon("Flag", "icon-12")} ${flagged ? "Flagged as faulty" : "Flag as faulty"}
              </button>`
            : ""}
        </div>
      </li>`;
    }).join("");
  }

  function dockDetail() {
    const st = S();
    const open = TICKETS.find((t) => t.id === openTicketId) || null;
    if (!open) {
      return `<p class="dock-empty">Select a work order from the queue</p>`;
    }
    const report = paper(`
      <p class="paper-kicker">Meridian Industrial Co. — device report · work order ${open.id}</p>
      <h4 class="paper-title">${esc(open.host)} <span class="paper-role">· ${esc(open.role)}</span></h4>
      <p class="paper-blurb">“${esc(open.blurb)}”</p>
      <pre class="paper-report" aria-label="Device report for ${esc(open.host)}">${esc(open.report.join("\n"))}</pre>
      <p class="paper-foot">synthetic training data — printed report</p>
    `);
    let extra = "";
    if (st.mode === "medium" && open.id === "T-102") {
      extra = `
      <section aria-label="OBJ-M3 diagnosis panel" class="side-panel">
        <p class="side-panel-kicker">OBJ-M3 · diagnosis panel</p>
        ${choiceRow(M3_CAUSES, st.env.dock.m3cause, "dock.m3cause", "Root cause of the 169.254.197.88 address")}
        ${choiceRow(M3_FIXES, st.env.dock.m3fix, "dock.m3fix", "Correct fix")}
        <p class="side-panel-hint">Set both, then hit <span class="amber-mono">CHECK RESULTS</span> on the foreman's board.</p>
      </section>`;
    }
    if (st.mode === "medium" && open.id === "T-104") {
      extra = `
      <section aria-label="OBJ-M6 fault panel" class="side-panel">
        <p class="side-panel-kicker">OBJ-M6 · fault panel</p>
        ${choiceRow(M6_FAULTS, st.env.dock.m6fault, "dock.m6fault", "What is wrong with this configuration?")}
        ${inputField("m6mask", "Corrected subnet mask for this /24 floor", st.env.dock.m6mask,
          'data-path="dock.m6mask"', "e.g. 255.255.255.0")}
        <p class="side-panel-hint">Set both, then hit <span class="amber-mono">CHECK RESULTS</span> on the foreman's board.</p>
      </section>`;
    }
    return report + extra;
  }

  function renderDock() {
    const st = S();
    const ordersTab = `
      <div class="dock-grid">
        <ul class="ticket-queue" aria-label="Work order queue">${dockTicketList()}</ul>
        <div class="dock-detail">${dockDetail()}</div>
      </div>`;
    const logTab = `
      <div class="dhcp-grid">
        ${paper(`
          <p class="paper-kicker">DHCP-SRV-01 · lease log excerpt · 12:01–12:10</p>
          <pre class="paper-report" aria-label="DHCP lease log">${esc(H8_LOG.join("\n"))}</pre>
          <p class="paper-foot">synthetic training data — two servers are answering on this segment</p>
        `, "paper-clip")}
        <section aria-label="OBJ-H8 rogue DHCP panel" class="side-panel">
          <p class="side-panel-kicker">OBJ-H8 · containment panel</p>
          ${inputField("h8ip", "Rogue server's IP", st.env.dock.h8ip, 'data-path="dock.h8ip"', "x.x.x.x")}
          <fieldset class="choice-row">
            <legend class="choice-legend">Clients holding rogue leases</legend>
            ${H8_HOSTS.map((h) => {
              const on = st.env.dock.h8hosts.includes(h);
              return `<button type="button" data-action="toggle-chip" data-path="dock.h8hosts" data-item="${h}"
                aria-pressed="${on}" class="choice-btn mono ${on ? "is-flagged" : ""}">${h}</button>`;
            }).join("")}
          </fieldset>
          ${choiceRow(H8_ACTIONS, st.env.dock.h8action, "dock.h8action", "Containment action")}
          <p class="side-panel-hint">Remember what a rogue ${tip("DHCP")} server really controls: it decides which gateway and DNS your clients trust.</p>
        </section>
      </div>`;
    return `
      <div class="zone-stack">
        ${machineHeader("Receiving Dock", "Work orders in", syntheticTag())}
        <div class="tab-row" role="tablist" aria-label="Dock evidence tabs">
          <button type="button" role="tab" aria-selected="${dockTab === "orders"}" data-action="dock-tab" data-tab="orders"
            class="tab-btn ${dockTab === "orders" ? "is-active" : ""}">${icon("FileText", "icon-14")} Work orders (${TICKETS.length})</button>
          <button type="button" role="tab" aria-selected="${dockTab === "dhcplog"}" data-action="dock-tab" data-tab="dhcplog"
            class="tab-btn ${dockTab === "dhcplog" ? "is-active" : ""}">${icon("ScrollText", "icon-14")} DHCP server log</button>
        </div>
        ${dockTab === "orders" ? ordersTab : logTab}
      </div>`;
  }

  // ═══════════════════════════ MACHINING FLOOR ══════════════════════════════
  function renderFloor() {
    const st = S();
    const parts = [];
    parts.push(machineHeader("Machining Floor", "32-bit stock", syntheticTag()));

    if (st.mode === "medium") {
      parts.push(panel("OBJ-M8", "Subnet solver", "network math", "P4", isDone("OBJ-M8"), `
        <p class="panel-help">Billet <span class="amber-mono">${M8_IP}/${M8_PREFIX}</span> on the rail. Machine its four edges:
          the network address, the broadcast address, and the first/last usable host.</p>
        ${bitRail(M8_IP, M8_PREFIX, "billet on the rail")}
        <div class="field-grid cols-2">
          ${inputField("m8-network", "network address", st.env.solver.m8.network, 'data-path="solver.m8.network"', "x.x.x.x")}
          ${inputField("m8-broadcast", "broadcast address", st.env.solver.m8.broadcast, 'data-path="solver.m8.broadcast"', "x.x.x.x")}
          ${inputField("m8-first", "first usable host", st.env.solver.m8.first, 'data-path="solver.m8.first"', "x.x.x.x")}
          ${inputField("m8-last", "last usable host", st.env.solver.m8.last, 'data-path="solver.m8.last"', "x.x.x.x")}
        </div>
        <p class="panel-note">Block size for /26 is 64 — find the block that holds .117, then read its edges.</p>
      `));
    }

    if (st.mode === "hard") {
      parts.push(panel("OBJ-H4", "Deep machining", "non-boundary prefixes", "P2", isDone("OBJ-H4"), `
        <p class="panel-help">Two raw billets, no foreman. Machine <span class="amber-mono">${H4A_IP}/${H4A_PREFIX}</span> fully,
          then just the network address of <span class="amber-mono">${H4B_IP}/${H4B_PREFIX}</span>.</p>
        ${bitRail(H4A_IP, H4A_PREFIX, "billet A on the rail")}
        <div class="field-grid cols-3">
          ${inputField("h4a-network", "network address", st.env.solver.h4a.network, 'data-path="solver.h4a.network"', "x.x.x.x")}
          ${inputField("h4a-broadcast", "broadcast address", st.env.solver.h4a.broadcast, 'data-path="solver.h4a.broadcast"', "x.x.x.x")}
          ${inputField("h4a-usable", "usable host count", st.env.solver.h4a.usable, 'data-path="solver.h4a.usable"', "count")}
        </div>
        <div class="mt-16">
          ${bitRail(H4B_IP, H4B_PREFIX, "billet B on the rail")}
          <div class="field-max-xs">${inputField("h4b", "billet B — network address", st.env.solver.h4b, 'data-path="solver.h4b"', "x.x.x.x")}</div>
        </div>
      `));
      parts.push(panel("OBJ-H5", "Boundary audit", "10 stamps · 7 categories", "P1", isDone("OBJ-H5"), `
        <p class="panel-help">Every classic trap on one bench. Stamp each address with its true category — verify BOTH ends of
          each private block before you commit.</p>
        <div class="stack-8">
          ${H5_ADDRS.map((a) => `
            <div class="bin-row">
              <span class="bin-addr">${a}</span>
              ${selectField({
                label: "", value: st.env.press.h5[a] ?? "", placeholder: "— stamp —",
                ariaLabel: `Category of ${a}`,
                onChangeAttr: `data-record="press" data-field="h5" data-key="${a}"`,
                options: H5_CATS.map((c) => ({ value: c, label: H5_LABELS[c] })),
              })}
            </div>`).join("")}
        </div>
      `));
    }

    if (st.mode === "medium") {
      parts.push(panel("OBJ-M1", "Class press", "first octet decides", "P1", isDone("OBJ-M1"), `
        <p class="panel-help">Stamp each billet with its ${tip("IPv4 address")} class. Only the first octet speaks.</p>
        <div class="stack-8">
          ${M1_ADDRS.map((a) => `
            <div class="stamp-row">
              <span class="bin-addr">${a}</span>
              <div class="stamp-group" role="group" aria-label="Class of ${a}" data-stamp-group="${esc(a)}">
                ${["A", "B", "C", "D", "E"].map((c) => `
                  <button type="button" data-action="stamp-class" data-addr="${a}" data-cls="${c}"
                    aria-pressed="${st.env.press.m1[a] === c}" aria-label="Stamp ${a} as class ${c}"
                    class="stamp-btn ${st.env.press.m1[a] === c ? "is-selected" : ""}">${c}</button>`).join("")}
              </div>
            </div>`).join("")}
        </div>
      `));

      parts.push(panel("OBJ-M2", "Private press", "RFC1918 estates", "P1", isDone("OBJ-M2"), `
        <p class="panel-help">Mark every address that lives inside one of the three ${tip("RFC 1918")} private blocks.
          Check both ends of each block before stamping.</p>
        <div class="chip-wrap">
          ${M2_ADDRS.map((a) => {
            const on = st.env.press.m2.includes(a);
            return `<button type="button" data-action="toggle-chip" data-path="press.m2" data-item="${a}" aria-pressed="${on}"
              class="chip-btn chip-green ${on ? "is-selected" : ""}">${a}<span class="chip-suffix" data-suffix>${on ? " · private" : ""}</span></button>`;
          }).join("")}
        </div>
      `));

      parts.push(panel("OBJ-M4", "Type press", "evidence sorting", "P2", isDone("OBJ-M4"), `
        <p class="panel-help">Sort each evidence address into its type bin — the reflex order: 127 → loopback, 169.254 → APIPA,
          224–239 → multicast, then RFC 1918, then public.</p>
        <div class="stack-8">
          ${M4_ADDRS.map((a) => `
            <div class="bin-row">
              <span class="bin-addr">${a}</span>
              ${selectField({
                label: "", value: st.env.press.m4[a] ?? "", placeholder: "— bin —",
                ariaLabel: `Type bin for ${a}`,
                onChangeAttr: `data-record="press" data-field="m4" data-key="${a}"`,
                options: M4_TYPES.map((t) => ({ value: t, label: M4_LABELS[t] })),
              })}
            </div>`).join("")}
        </div>
      `));

      parts.push(panel("OBJ-M11", "Reject bin", "never assignable", "P2", isDone("OBJ-M11"), `
        <p class="panel-help">Flag every address that can <strong class="strong-light">never</strong> be assigned to a host
          interface — network and broadcast ends, 0.0.0.0, the limited broadcast, multicast, Class E.</p>
        <div class="chip-wrap">
          ${M11_ADDRS.map((a) => {
            const on = st.env.press.m11.includes(a);
            return `<button type="button" data-action="toggle-chip" data-path="press.m11" data-item="${a}" aria-pressed="${on}"
              class="chip-btn chip-rose ${on ? "is-selected" : ""}">${a}<span class="chip-suffix" data-suffix>${on ? " · reject" : ""}</span></button>`;
          }).join("")}
        </div>
      `));

      parts.push(panel("OBJ-M7", "Conversion press", "CIDR ↔ mask", "P4", isDone("OBJ-M7"), `
        <p class="panel-help">Six machining passes. Prefixes to masks and back — including the three class defaults.</p>
        <div class="field-grid cols-3">
          ${M7_TO_MASK.map((p) => inputField(`m7a-${p.slice(1)}`, `${p} → mask`, st.env.solver.m7a[p] ?? "",
            `data-record="solver" data-field="m7a" data-key="${p}"`, "255.…")).join("")}
          ${M7_TO_PREFIX.map((m) => inputField(`m7b-${m}`, `${m} → /prefix`, st.env.solver.m7b[m] ?? "",
            `data-record="solver" data-field="m7b" data-key="${m}"`, "24")).join("")}
        </div>
        <p class="panel-note">Octet bit values as the prefix grows inside an octet: 128, 192, 224, 240, 248, 252, 254, 255.</p>
      `));

      parts.push(panel("OBJ-M9", "Capacity planner", "2^h − 2", "P4", isDone("OBJ-M9"), `
        <p class="panel-help">Three orders came in. For each, choose the <em>smallest</em> prefix whose usable-host count
          (${tip("Usable host range")} = 2<sup>h</sup> − 2) still fits.</p>
        <div class="field-grid cols-3">
          ${M9_NEEDS.map((n) => selectField({
            label: n.label, value: st.env.solver.m9[n.key] ?? "",
            ariaLabel: `Prefix for: ${n.label}`,
            onChangeAttr: `data-record="solver" data-field="m9" data-key="${n.key}"`,
            options: FLOOR_PREFIX_OPTS.map((p) => ({ value: p, label: p })),
          })).join("")}
        </div>
      `));
    }

    return `<div class="zone-stack">${parts.join("")}</div>`;
  }

  // ═══════════════════════════ DISPATCH / LOADOUT ═══════════════════════════
  function renderLoadout() {
    const st = S();
    const parts = [];
    parts.push(machineHeader("Dispatch / Loadout", "plans & bays", syntheticTag()));

    if (st.mode === "medium") {
      parts.push(`
      <section aria-label="Assignment plan" class="panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">OBJ-M10 · assignment plan</p>
            <h3 class="panel-title">${icon("Factory", "icon-16 icon-amber")} Site plan — who gets which address type?</h3>
          </div>
          ${UI.stamped(isDone("OBJ-M10"))}
        </div>
        <p class="panel-help">Five roles, five address types. Public only where the internet must reach; ${tip("NAT / PAT")} lives at the edge.</p>
        <div class="stack-8">
          ${M10_DEVICES.map((d, i) => `
            <div class="plan-row">
              <p class="plan-label"><span class="plan-num">${String(i + 1).padStart(2, "0")}</span>${esc(d.label)}</p>
              ${selectField({
                id: `m10-${d.key}`, label: "", value: st.env.plan.m10[d.key] ?? "", placeholder: "— type —",
                onChangeAttr: `data-record="plan" data-field="m10" data-key="${d.key}"`,
                options: M10_TYPES.map((t) => ({ value: t, label: M10_LABELS[t] })),
              })}
            </div>`).join("")}
        </div>
      </section>`);
    }

    // VLSM bay (M12 medium / H2 hard)
    const hard = st.mode === "hard";
    const depts = hard ? H2_DEPTS : M12_DEPTS;
    const base = hard ? H2_BASE : M12_BASE;
    const basePrefix = hard ? H2_BASE_PREFIX : M12_BASE_PREFIX;
    const tableKey = hard ? "h2" : "m12";
    parts.push(`
      <section aria-label="VLSM load-out bay" class="panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">${hard ? "OBJ-H2 · full VLSM load-out" : "OBJ-M12 · VLSM load-out"}</p>
            <h3 class="panel-title">${icon("Network", "icon-16 icon-amber")} Load the departments onto ${base}/${basePrefix}</h3>
          </div>
          ${UI.stamped(isDone(hard ? "OBJ-H2" : "OBJ-M12"))}
        </div>
        <p class="panel-help">One bay of stock: <span class="amber-mono">${base}/${basePrefix}</span> (${hard ? "five" : "four"} departments waiting).
          Largest first — each subnet starts at the first free address and lands on its own block boundary.</p>
        <div class="table-scroll">
          <table class="data-table min-560">
            <caption class="sr-only">Department VLSM allocation table</caption>
            <thead>
              <tr>
                <th scope="col">Department</th><th scope="col">Hosts needed</th>
                <th scope="col">Prefix</th><th scope="col">Network address</th>
              </tr>
            </thead>
            <tbody>
              ${depts.map((d) => {
                const cell = st.env.loadout[tableKey][d.key] || { prefix: "", network: "" };
                return `
                <tr>
                  <td class="cell-name">${esc(d.name)}</td>
                  <td class="cell-hosts">${d.hosts}</td>
                  <td class="cell-prefix">
                    ${selectField({
                      id: `vlsm-${tableKey}-${d.key}`, label: "", value: cell.prefix, placeholder: "prefix",
                      onChangeAttr: `data-record="loadout" data-field="${tableKey}" data-key="${d.key}" data-sub="prefix"`,
                      options: LOADOUT_PREFIX_OPTS.map((p) => ({ value: p, label: p })),
                    })}
                  </td>
                  <td class="cell-network">
                    <input type="text" value="${esc(cell.network)}" placeholder="x.x.x.x" class="text-input"
                      aria-label="Network address for ${esc(d.name)}"
                      data-record="loadout" data-field="${tableKey}" data-key="${d.key}" data-sub="network" />
                  </td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
        ${!hard ? `
        <div class="field-max-sm mt-16">
          ${inputField("m12sum", "One summary route for the whole site (CIDR)", st.env.loadout.m12sum,
            'data-path="loadout.m12sum"', "x.x.x.x/nn")}
          <p class="panel-note">If all four subnets came from one bar of stock, what single route replaces them all?</p>
        </div>` : ""}
      </section>`);

    if (hard) {
      parts.push(`
      <section aria-label="Summary manifest" class="panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">OBJ-H3 · summary manifest</p>
            <h3 class="panel-title">${icon("Radio", "icon-16 icon-amber")} Edge router — advertise one route instead of four</h3>
          </div>
          ${UI.stamped(isDone("OBJ-H3"))}
        </div>
        <div class="table-scroll">
          <table class="data-table min-420">
            <caption class="sr-only">Routing table</caption>
            <thead><tr><th scope="col">Destination</th><th scope="col">Next hop</th><th scope="col">Note</th></tr></thead>
            <tbody>
              ${H3_ROUTES.map((r) => `
                <tr>
                  <td class="cell-mono">${r.dest}</td>
                  <td class="cell-dim">via ${r.via}</td>
                  <td class="cell-note">${esc(r.note)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="field-max-sm mt-12">
          ${inputField("h3sum", "Tightest summary covering exactly the four Plant-A routes", st.env.loadout.h3sum,
            'data-path="loadout.h3sum"', "x.x.x.x/nn")}
        </div>
      </section>`);

      parts.push(`
      <section aria-label="Edge plan" class="panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">OBJ-H7 · edge plan</p>
            <h3 class="panel-title">${icon("ShieldCheck", "icon-16 icon-amber")} Public web server — pick the plan, justify it</h3>
          </div>
          ${UI.stamped(isDone("OBJ-H7"))}
        </div>
        <p class="panel-help">The plant is publishing a web service. Exactly one plan below survives contact with
          routing reality — choose it and justify in one line (name the mechanism and the address class).</p>
        <div class="stack-8">
          ${H7_PLANS.map((p) => `
            <button type="button" data-action="pick-choice" data-group="plan.h7plan" data-key="${p.key}"
              aria-pressed="${st.env.plan.h7plan === p.key}"
              class="choice-btn plan-btn ${st.env.plan.h7plan === p.key ? "is-selected" : ""}">
              <span class="plan-key">Plan ${p.key}</span>${esc(p.label)}
            </button>`).join("")}
        </div>
        <div class="mt-12">
          <label for="h7just" class="select-label">Justification (must name the mechanism and the address class you rely on)</label>
          <textarea id="h7just" rows="2" class="textarea" placeholder="e.g. …"
            data-path="plan.h7just">${esc(st.env.plan.h7just)}</textarea>
        </div>
      </section>`);

      parts.push(`
      <section aria-label="Broadcast domain fix" class="panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">OBJ-H9 · warehouse growth</p>
            <h3 class="panel-title">300 devices on one 192.168.60.0/24 — fix congestion AND exhaustion</h3>
          </div>
          ${UI.stamped(isDone("OBJ-H9"))}
        </div>
        <div class="stack-8">
          ${H9_PLANS.map((p) => `
            <button type="button" data-action="pick-choice" data-group="plan.h9plan" data-key="${p.key}"
              aria-pressed="${st.env.plan.h9plan === p.key}"
              class="choice-btn plan-btn ${st.env.plan.h9plan === p.key ? "is-selected" : ""}">
              <span class="plan-key mono">Option ${p.key}</span>${esc(p.label)}
            </button>`).join("")}
        </div>
        <div class="field-max-xs mt-12">
          ${inputField("h9fig", "Math check: usable hosts in a /23", st.env.plan.h9fig,
            'data-path="plan.h9fig"', "count")}
        </div>
      </section>`);
    }

    return `<div class="zone-stack">${parts.join("")}</div>`;
  }

  // ══════════════════════════════ TEST BENCH ════════════════════════════════
  const POOL_ORDER = ["s5", "s2", "s7", "s1", "sT", "s4", "s3", "s6"]; // deliberately scrambled display order

  const BENCH_IPCONFIG = [
    "Windows IP Configuration (bench host WS-TRN-02)",
    "",
    "Ethernet adapter Ethernet0:",
    "   Autoconfiguration IPv4 Address. . : 169.254.44.10",
    "   Subnet Mask . . . . . . . . . . . : 255.255.0.0",
    "   Default Gateway . . . . . . . . . : (none)",
    "   DHCP Enabled. . . . . . . . . . . : Yes  (no lease received)",
  ];

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (cmd === "help") {
      return { out: "Available: ipconfig · ping <address> · help · clear", ok: true };
    }
    if (cmd === "ipconfig") {
      return { out: BENCH_IPCONFIG.join("\n"), ok: true };
    }
    if (cmd.startsWith("ping ")) {
      const target = cmd.slice(5).trim();
      if (target === "127.0.0.1" || target === "localhost") {
        return {
          out: `Pinging 127.0.0.1 with 32 bytes of data:\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\n\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
          ok: true,
        };
      }
      return {
        out: `Pinging ${target} with 32 bytes of data:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)`,
        ok: false,
      };
    }
    if (cmd === "clear") return { out: "__CLEAR__", ok: true };
    return { out: `'${raw.trim()}' is not recognized. Type 'help' for the bench command list.`, ok: false };
  }

  function benchLogHTML() {
    const log = S().env.bench.log;
    if (log.length === 0) {
      return `<p class="term-empty">Bench console ready. The bench host is cabled to Floor 2 switch port 14.</p>`;
    }
    return log.map((l) => `
      <div class="term-entry">
        <p class="term-cmd">&gt; ${esc(l.cmd)}</p>
        <pre class="term-out ${l.ok ? "term-ok" : "term-fail"}">${esc(l.out)}</pre>
      </div>`).join("");
  }

  function sequencerHTML() {
    const st = S();
    const seq = st.env.bench.h6;
    return `
      <p class="seq-col-label">Step pool</p>
      <ul class="seq-pool">
        ${POOL_ORDER.map((id) => {
          const s = H6_STEPS.find((x) => x.id === id);
          const used = seq.includes(id);
          return `
          <li>
            <button type="button" ${used ? "disabled" : ""} data-action="seq-add" data-id="${id}"
              aria-label="Add step: ${esc(s.label)}"
              class="seq-pool-btn ${used ? "is-used" : ""}">
              ${icon("Plus", "icon-12")} <span>${esc(s.label)}</span>
            </button>
          </li>`;
        }).join("")}
      </ul>
      <p class="seq-col-label">Your sequence (${seq.length}/7 good steps)</p>
      ${seq.length === 0
        ? `<p class="seq-empty">click steps to sequence them</p>`
        : `<ol class="seq-list" aria-label="Current repair sequence">
            ${seq.map((id, i) => {
              const s = H6_STEPS.find((x) => x.id === id);
              return `
              <li class="seq-item">
                <span class="seq-num">${i + 1}.</span>
                <span class="seq-label">${esc(s.label)}</span>
                <button type="button" data-action="seq-remove" data-id="${id}"
                  aria-label="Remove step ${i + 1}: ${esc(s.label)}" class="seq-remove">${icon("X", "icon-12")}</button>
              </li>`;
            }).join("")}
          </ol>`}`;
  }

  function renderBench() {
    const st = S();
    const m5 = st.mode === "medium"
      ? `
      <section aria-label="OBJ-M5 interpretation dial" class="panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">OBJ-M5 · interpretation dial</p>
            <h3 class="panel-title">Read the results like an engineer</h3>
          </div>
          ${UI.stamped(isDone("OBJ-M5"))}
        </div>
        <p class="panel-help">Run <span class="amber-mono">ping 127.0.0.1</span> and
          <span class="amber-mono">ping 192.168.10.1</span> above (try <span class="mono">ipconfig</span> too),
          then set the dial to what the evidence proves.</p>
        <fieldset class="choice-row">
          <legend class="sr-only">Interpretation of the ping results</legend>
          ${M5_OPTIONS.map((o) => `
            <button type="button" data-action="pick-choice" data-group="bench.m5interp" data-key="${o.key}"
              aria-pressed="${st.env.bench.m5interp === o.key}"
              class="choice-btn plan-btn ${st.env.bench.m5interp === o.key ? "is-selected" : ""}">${esc(o.label)}</button>`).join("")}
        </fieldset>
      </section>`
      : "";
    const h6 = st.mode === "hard"
      ? `
      <section aria-label="OBJ-H6 repair sequencer" class="panel">
        <div class="panel-head">
          <div>
            <p class="panel-kicker">OBJ-H6 · repair sequencer</p>
            <h3 class="panel-title">${icon("HeartPulse", "icon-16 icon-rose")} Order the repair — one step is a trap</h3>
          </div>
          ${UI.stamped(isDone("OBJ-H6"))}
        </div>
        <p class="panel-help">Gather bench evidence first (the loopback ping and <span class="mono">ipconfig</span> above), then build the repair
          sequence. One listed step must never enter the plan.</p>
        <div id="h6-sequencer" class="seq-grid">${sequencerHTML()}</div>
      </section>`
      : "";
    return `
      <div class="zone-stack">
        ${machineHeader("Test Bench", "WS-TRN-02 diagnostics", syntheticTag())}
        <section aria-label="Bench console" class="panel">
          <div class="term-head">
            ${icon("TerminalSquare", "icon-16 icon-amber")}
            <h3 class="panel-title">Bench console</h3>
            <span class="term-hint">type ‘help’ if stuck</span>
          </div>
          <div id="bench-log" role="log" aria-live="polite" aria-label="Console output" class="term-log">${benchLogHTML()}</div>
          <form id="bench-form" class="term-form">
            <span aria-hidden="true" class="term-prompt">&gt;</span>
            <input id="bench-input" type="text" aria-label="Bench console command" placeholder="ping 127.0.0.1"
              class="text-input term-input" autocomplete="off" spellcheck="false" />
            <button type="submit" class="btn btn-primary btn-run">Run</button>
          </form>
        </section>
        ${m5}
        ${h6}
      </div>`;
  }

  // ════════════════════════════ TRAINING WALL ═══════════════════════════════
  const wallCard = (iconName, title, inner) => `
    <section class="panel">
      <h3 class="panel-title wall-title">${icon(iconName, "icon-16 icon-amber")} ${esc(title)}</h3>
      <div class="wall-body">${inner}</div>
    </section>`;

  function renderWall() {
    return `
    <div class="zone-stack">
      ${machineHeader("Training Wall", "knowledge core", syntheticTag())}

      ${wallCard("Binary", "Anatomy of an IPv4 address", `
        <p>An IPv4 address is 32 bits, written as four dotted ${tip("Octet")}s. The ${tip("Subnet mask")} (or
          ${tip("CIDR prefix")}) splits it: network bits on the left, host bits on the right. Everything the exam
          asks you to compute falls out of that one split.</p>
        ${bitRail("192.168.10.77", 24, "example: a /24 splits at bit 24")}
      `)}

      ${wallCard("Layers", "Address classes A–E (legacy)", `
        <div class="table-scroll">
          <table class="data-table min-430">
            <thead><tr><th scope="col">Class</th><th scope="col">First octet</th><th scope="col">Default mask</th><th scope="col">Purpose</th></tr></thead>
            <tbody class="cell-mono-body">
              <tr><td class="cell-class">A</td><td>1–126</td><td>255.0.0.0 (/8)</td><td>huge unicast networks</td></tr>
              <tr><td class="cell-class">B</td><td>128–191</td><td>255.255.0.0 (/16)</td><td>large unicast networks</td></tr>
              <tr><td class="cell-class">C</td><td>192–223</td><td>255.255.255.0 (/24)</td><td>small unicast networks</td></tr>
              <tr><td class="cell-class">D</td><td>224–239</td><td>—</td><td>multicast groups</td></tr>
              <tr><td class="cell-class">E</td><td>240–255</td><td>—</td><td>experimental / reserved</td></tr>
            </tbody>
          </table>
        </div>
        <p class="wall-dim"><span class="amber-mono-sm">simplified history:</span> classful
          routing wasted space (a /24 min even for two hosts), so it was replaced by classless routing — CIDR — where the
          mask can sit on any bit. Classes survive only as a vocabulary and as trap boundaries.</p>
      `)}

      ${wallCard("Landmark", "Public vs private (RFC 1918) + NAT", `
        <p>${tip("Public address")}s are globally unique and internet-routable. ${tip("RFC 1918")} reserved three
          ${tip("Private address")} blocks for anywhere-use; they are routed freely inside a company but never on the
          internet — a ${tip("NAT / PAT")} gateway translates many inside addresses onto the few public ones at the edge.</p>
        <div class="table-scroll">
          <table class="data-table min-430">
            <thead><tr><th scope="col">Block</th><th scope="col">Range</th><th scope="col">Trap</th></tr></thead>
            <tbody class="cell-mono-body">
              <tr><td>10.0.0.0/8</td><td>10.0.0.0 – 10.255.255.255</td><td>—</td></tr>
              <tr><td>172.16.0.0/12</td><td>172.16.0.0 – 172.31.255.255</td><td>172.15.x &amp; 172.32.x are PUBLIC</td></tr>
              <tr><td>192.168.0.0/16</td><td>192.168.0.0 – 192.168.255.255</td><td>192.169.x is PUBLIC</td></tr>
            </tbody>
          </table>
        </div>
      `)}

      ${wallCard("Skull", "APIPA — the self-assigned address", `
        <p>When a host asks <span class="mono">DHCP</span> and nobody answers, it grudgingly picks its own address from
          ${tip("APIPA")} space <span class="mono">169.254.0.0/16</span> with mask <span class="mono">255.255.0.0</span> and
          no default gateway. It is ${tip("Link-local")}: it can maybe reach the segment, never beyond.</p>
        <p class="wall-dim">Symptoms: sudden “can't reach anything” tickets, addresses starting 169.254, no gateway in ipconfig.
          Fix the cause (DHCP scope/service/path), then renew and verify a real lease.
          <span class="amber-mono-sm">simplified:</span> Windows keeps
          169.254.1.0–169.254.254.255 out of its pick; the /16 view is the exam-level simplification.</p>
      `)}

      ${wallCard("MapPin", "Loopback — the stack test", `
        <p>${tip("Loopback")} space <span class="mono">127.0.0.0/8</span> (home: <span class="mono">127.0.0.1</span>)
          never touches the wire — packets loop back inside the host. If <span class="mono">ping 127.0.0.1</span> works,
          the TCP/IP stack, drivers and winsock are healthy and the fault lives elsewhere: cable, switchport, DHCP, gateway, DNS.
          It is the cheapest, fastest first test in any outage.</p>
      `)}

      ${wallCard("Divide", "Subnetting & CIDR — the math that matters", `
        <p>A ${tip("CIDR prefix")} of <span class="mono">/n</span> lights n network bits. Blocks repeat at powers of two;
          a ${tip("Subnet mask")} just tells the host where the split is. Core numbers:</p>
        <ul class="dot-list mono-sm">
          <li>block size = 2^(32−n) addresses per subnet</li>
          <li>usable hosts = 2^(32−n) − 2 (network + broadcast are taken)</li>
          <li>subnets created = 2^(borrowed bits)</li>
          <li>first usable = network + 1 · last usable = broadcast − 1</li>
        </ul>
        <p>Read a host into its block: divide its relevant octet by the block size, keep the remainder. <span class="mono">192.168.40.117/26</span>
          → 64-wide blocks → <span class="mono">117 ÷ 64</span> sits in 64–127 → network .64, broadcast .127, hosts .65–.126.</p>
      `)}

      ${wallCard("Network", "VLSM — right-size every subnet", `
        <p>${tip("VLSM")} lets one network hold different prefix lengths. Procedure: sort departments largest-first, allocate
          each the smallest fitting prefix, start each at the first free address, verify no overlap. A /25 holds 126, a /26 holds 62,
          a /27 holds 30, a /28 holds 14, a /29 holds 6, a /30 holds exactly 2 (classic point-to-point).</p>
      `)}

      ${wallCard("Route", "Summarization — advertise less", `
        <p>${tip("Route summarization")} replaces several contiguous subnets with one block that covers them all (their shared
          bit prefix). Four /24s from <span class="mono">172.16.8.0</span> to <span class="mono">172.16.11.255</span>
          collapse into <span class="mono">172.16.8.0/22</span> — smaller route tables, but only if the block is contiguous and
          boundary-aligned. Summarizing toward <span class="mono">0.0.0.0/0</span> “works” and blackholes a site.</p>
      `)}

      ${wallCard("Ban", "Special addresses — never for hosts", `
        <ul class="dot-list mono-sm">
          <li><span class="strong-light">x.x.x.0 / x.x.x.255</span> — network &amp; broadcast of a /24; every subnet's first and last address are spoken for</li>
          <li><span class="strong-light">0.0.0.0</span> — unspecified / “this host” (also the default-route target)</li>
          <li><span class="strong-light">255.255.255.255</span> — limited broadcast: everyone on the segment, never routed</li>
          <li><span class="strong-light">127.0.0.0/8</span> — loopback · <span class="strong-light">169.254.0.0/16</span> — APIPA</li>
          <li><span class="strong-light">224.0.0.0/4</span> — multicast · <span class="strong-light">240.0.0.0/4</span> — experimental</li>
        </ul>
      `)}

      ${wallCard("BookOpen", "Glossary — 16 terms, tap any", `
        <div class="chip-wrap">${GLOSSARY.map((g) => tip(g.term)).join("")}</div>
      `)}
    </div>`;
  }

  // ═══════════════════════════ SHIFT DEBRIEF ════════════════════════════════
  function shiftTriggerHTML() {
    const st = S();
    const list = LabStore.objectivesForMode(st.mode);
    const allDone = list.every((o) => (st.objectives[o.id] || {}).done);
    const doneCount = list.filter((o) => (st.objectives[o.id] || {}).done).length;
    return `
      <p class="eos-kicker">end of shift</p>
      <p class="eos-copy">${allDone
        ? "Every work order is stamped. File your end-of-shift report to see your score, stars and mastery recap."
        : `Stamp all ${list.length} work orders on the foreman's board to unlock the end-of-shift report (${doneCount}/${list.length} so far).`}</p>
      <button type="button" data-action="open-report" ${allDone ? "" : "disabled"}
        class="btn btn-primary btn-eos ${allDone ? "" : "btn-disabled"}">${icon("Award", "icon-16")} File end-of-shift report</button>`;
  }

  function renderDebrief() {
    return `
    <div class="zone-stack">
      ${machineHeader("Shift Debrief", "quiz + field notes", syntheticTag())}
      <div id="quiz-region">${Quiz.render()}</div>

      <section aria-label="Field notes" class="panel">
        <h3 class="panel-title wall-title">${icon("Radar", "icon-16 icon-amber")} Detection &amp; troubleshooting opportunities</h3>
        <div class="table-scroll">
          <table class="data-table min-520">
            <thead><tr><th scope="col">Data source</th><th scope="col">What to look for</th></tr></thead>
            <tbody class="cell-body">
              <tr><td class="cell-mono">DHCP server logs</td><td>Leases from unknown servers or outside known scopes (rogue DHCP); scope exhaustion; NAK storms</td></tr>
              <tr><td class="cell-mono">Host configs (ipconfig / ip addr)</td><td>169.254.x with no gateway (APIPA); masks that don't match the design (255.255.0.0 on a /24); statics on wrong subnets</td></tr>
              <tr><td class="cell-mono">Duplicate-address events</td><td>Address-conflict warnings; ARP flapping for one IP between two MACs</td></tr>
              <tr><td class="cell-mono">Routing table</td><td>Missing or over-wide summaries; a /22 that should cover four /24s; default-route blackholes</td></tr>
              <tr><td class="cell-mono">Ping/loopback triage</td><td>127.0.0.1 alive + gateway dead → beyond-host fault; everything dead → stack or link</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Mitigation recommendations" class="panel">
        <h3 class="panel-title wall-title">${icon("Wrench", "icon-16 icon-amber")} Mitigation recommendations</h3>
        <ul class="mit-list">
          <li class="mit-item"><span class="mit-tag">RFC 1918 + NAT/PAT</span> — keep
            internal hosts private and unaddressable from the internet; public space only at the edge. Residual risk: NAT is not a
            firewall — pair it with filtering.</li>
          <li class="mit-item"><span class="mit-tag">DHCP hygiene</span> — single
            authorized server per segment, DHCP snooping on switches, monitored scopes. Residual risk: snooping misconfig can
            block legit leases; test after enabling.</li>
          <li class="mit-item"><span class="mit-tag">Address governance</span> — IP address
            management (IPAM) documentation, static-allocation policy for servers/printers, largest-first VLSM standards. Residual
            risk: undocumented statics are how duplicate-IP outages happen.</li>
          <li class="mit-item"><span class="mit-tag">Right-sized subnets</span> — route
            instead of stretching masks; smaller broadcast domains cap both congestion and blast radius. Residual risk: every new
            subnet needs a gateway, ACL review and a summary plan.</li>
        </ul>
      </section>

      <div class="grid-2">
        <section aria-label="Blue-team takeaways" class="panel">
          <h3 class="panel-title wall-title">${icon("ShieldCheck", "icon-16 icon-emerald")} Blue-team takeaways</h3>
          <ul class="dot-list">
            <li>APIPA addresses are a free outage canary — alert on any 169.254 lease.</li>
            <li>Classify before you escalate: 172.32.x is public, 239.x is multicast, 198.51.100.x is documentation space.</li>
            <li>Loopback-first triage splits “my host” from “the network” in ten seconds.</li>
            <li>Duplicate statics announce themselves in event logs — grep for address-conflict IDs.</li>
          </ul>
        </section>
        <section aria-label="Red-team mindset takeaways" class="panel">
          <h3 class="panel-title wall-title">${icon("Swords", "icon-16 icon-rose")} Red-team mindset (defensive use)</h3>
          <ul class="dot-list">
            <li>A rogue DHCP server decides your clients' gateway and DNS — a man-in-the-middle primitive; defend with snooping + authorization.</li>
            <li>Wrong masks leak topology assumptions: a /16 mask makes hosts trust the whole /16 as “local”.</li>
            <li>Flat over-grown subnets are loud (broadcast) and flat (blast radius) — segmentation limits lateral movement.</li>
            <li class="dim">Beyond-lesson connection: these map to ATT&amp;CK Adversary-in-the-Middle (T1557) and lateral-movement surface (T1021) — pure defensive framing.</li>
          </ul>
        </section>
      </div>

      <section aria-label="Official references" class="panel">
        <h3 class="panel-title wall-title">${icon("Link2", "icon-16 icon-amber")} Official references (new tab)</h3>
        <ul class="ref-list">
          ${REF_LINKS.map((l) => `
            <li><a href="${l.url}" target="_blank" rel="noopener noreferrer" class="ref-link">
              ${icon("ArrowUpRight", "icon-12")} ${esc(l.label)}</a></li>`).join("")}
        </ul>
      </section>

      <section aria-label="File end-of-shift report" class="eos-section">
        <div id="shift-trigger">${shiftTriggerHTML()}</div>
      </section>
    </div>`;
  }

  // ── public API ─────────────────────────────────────────────────────────────
  return {
    renderDock, renderFloor, renderLoadout, renderBench, renderWall, renderDebrief,
    renderZone(zoneId) {
      switch (zoneId) {
        case "dock": return renderDock();
        case "floor": return renderFloor();
        case "loadout": return renderLoadout();
        case "bench": return renderBench();
        case "wall": return renderWall();
        case "debrief": return renderDebrief();
        default: return "";
      }
    },
    sequencerHTML, benchLogHTML, shiftTriggerHTML, runCommand,
    get dockTab() { return dockTab; },
    set dockTab(v) { dockTab = v; },
    get openTicketId() { return openTicketId; },
    set openTicketId(v) { openTicketId = v; },
  };
})();
