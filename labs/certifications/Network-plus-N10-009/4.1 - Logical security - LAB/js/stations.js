/* ======================================================================
   GATEHOUSE lab — the ten stations
   Vanilla-DOM ports of src/components/lab/stations/*.tsx, behavior 1:1.
   Each station reads the freshest store state through getValue() closures
   at event time (the original's "widgets emit intents, handlers read
   useLab.getState()" burst-safety pattern — original fixes #4/#2 preserved).
   ====================================================================== */

/* ---------- Station 01 — The Vault (encryption: transit vs rest) ---------- */
function VaultStation() {
  const root = h("div", { class: "space-y-6" });

  /* classification board */
  const countLine = h("p", { class: "gh-term mt-2 text-dim" });
  const board = h("div", { class: "grid gap-2" });
  const clsBtns = {};
  for (const i of VAULT_ITEMS) {
    const row = h("div", { class: "flex flex-wrap items-center gap-2 rounded-lg border border-edge bg-raise-40 p-2-5" });
    row.append(h("p", { class: "min-w-220 flex-1 text-sm leading-snug text-text", text: i.label }));
    const group = h("div", { class: "flex gap-1-5" });
    for (const b of ["transit", "rest"]) {
      const btn = h("button", {
        type: "button",
        "aria-pressed": "false",
        "aria-label": `${i.label} — mark as in ${b === "transit" ? "transit" : "at rest"}`,
        text: b === "transit" ? "In transit" : "At rest",
        onclick: () => {
          const cur = state.env.vault;
          patch("vault", { cls: { ...cur.cls, [i.id]: b } }, "ACCT", `data classified: "${i.id}" → ${b}`);
          syncRow(i.id);
          syncCounts();
        },
      });
      clsBtns[`${i.id}:${b}`] = btn;
      group.append(btn);
    }
    row.append(group);
    board.append(row);
  }
  function syncRow(id) {
    for (const b of ["transit", "rest"]) {
      const btn = clsBtns[`${id}:${b}`];
      const on = state.env.vault.cls[id] === b;
      btn.setAttribute("aria-pressed", String(on));
      btn.className = `cls-btn ${on ? (b === "transit" ? "cls-transit-on" : "cls-rest-on") : "cls-off"}`;
    }
  }
  function syncCounts() {
    const env = state.env.vault;
    const transitCount = VAULT_ITEMS.filter((i) => env.cls[i.id] === "transit").length;
    const restCount = VAULT_ITEMS.filter((i) => env.cls[i.id] === "rest").length;
    countLine.textContent = `sorted: ${transitCount} in transit · ${restCount} at rest · ${VAULT_ITEMS.length - transitCount - restCount} unsorted`;
  }
  VAULT_ITEMS.forEach((i) => syncRow(i.id));
  syncCounts();

  const sec1 = h("section", null,
    WidgetTitle(
      [icon("arrow-right-left", "ic text-sky"), " Classification board", " — sort the data by its state"],
      "Click IN TRANSIT if the data is moving across a link, AT REST if it lives on storage. Eight items to sort."
    ),
    board,
    countLine
  );

  /* protection picker */
  const protRows = {};
  const protBox = h("div", { class: "grid gap-2" });
  for (const f of VAULT_FLOWS) {
    const row = h("div", { class: "grid items-center gap-2 rounded-lg border border-edge bg-raise-40 p-2-5 prot-grid" });
    row.append(h("p", { class: "text-sm leading-snug text-text", text: f.label }));
    /* anti-leak: per-flow shuffled protection options */
    const cell = SelectCell({
      options: shuffled(PROT_OPTIONS, `prot-${f.id}`),
      getValue: () => state.env.vault.prot[f.id],
      onChange: (v) => {
        const cur = state.env.vault;
        patch("vault", { prot: { ...cur.prot, [f.id]: v } }, "ACCT", `protection chosen for flow ${f.id}`);
      },
      ariaLabel: `Protection for ${f.label}`,
    });
    protRows[f.id] = cell;
    row.append(cell);
    protBox.append(row);
  }
  const sec2 = h("section", null,
    WidgetTitle(
      [icon("lock", "ic text-mint"), " Protection picker", " — choose the encryption control"],
      "One protection per flow — the right control for the right state (TLS/IPsec guard movement; disk/column encryption guard storage)."
    ),
    protBox,
    h("p", { class: "mt-3 flex items-start gap-2 rounded-md border border-edge bg-panel-60 px-3 py-2 text-xs leading-relaxed text-dim" },
      icon("hard-drive", "ic-sm shrink-0 text-mint mt-0-5"),
      h("span", null, "Defender habit: classify every data flow by state first — an encrypted link into unencrypted storage still leaks.")
    )
  );

  root.append(sec1, sec2);
  return root;
}

/* ---------- Station 02 — The Badge Office (PKI) ---------- */
function BadgeStation() {
  const root = h("div", { class: "space-y-6" });

  if (state.mode === "medium") {
    /* term matching */
    const termBox = h("div", { class: "grid gap-2" });
    PKI_TERMS.forEach((t, i) => {
      /* R6: definition options are per-row shuffled (deterministic seed) */
      const defs = Object.entries(PKI_TERM_DEFS).map(([id, label]) => ({ id, label }));
      const row = h("div", { class: "grid items-center gap-2 rounded-lg border border-edge bg-raise-40 p-2-5 term-grid" });
      row.append(h("p", { class: "gh-term text-xs text-text", text: t.label }));
      row.append(SelectCell({
        options: shuffled(defs, `pki-defs-${t.id}-${i}`),
        getValue: () => state.env.badge.terms[t.id],
        onChange: (v) => {
          const cur = state.env.badge;
          patch("badge", { terms: { ...cur.terms, [t.id]: v } }, "AUTHN", `PKI term matched: ${t.label}`);
        },
        ariaLabel: `Definition for ${t.label}`,
      }));
      termBox.append(row);
    });
    root.append(h("section", null,
      WidgetTitle([icon("badge-check", "ic text-mint"), " Term matching"],
        "Match each PKI term to its definition — these six carry every certificate conversation you will ever have."),
      termBox));

    /* lifecycle sequencer */
    root.append(h("section", null,
      WidgetTitle("Certificate lifecycle", "Tap the steps in lifecycle order — generate, validate, issue, deploy, maintain."),
      OrderList({
        steps: PKI_LIFECYCLE,
        getValue: () => state.env.badge.life,
        onOp: (op) => {
          const cur = state.env.badge.life;
          const next = op.t === "clear" ? [] : op.t === "add" ? [...cur, op.id] : cur.filter((v) => v !== op.id);
          patch("badge", { life: next }, "AUTHN", "certificate lifecycle reordered");
        },
      })
    ));
  }

  if (state.mode === "hard") {
    const hard = h("section", null,
      WidgetTitle([icon("alert-triangle", "ic text-coral"), " Certificate forensics"],
        "Compare both certificates against the service they protect (portal.meridianregional.org) and today's date (2025-11-04). Check exactly the three field-level defects on the broken one — internal-CA issuance and RSA-2048 are perfectly acceptable.")
    );
    hard.append(EvidenceBox("certs.txt", "mb-3"));
    const grid = h("div", { class: "grid gap-3" });
    grid.append(ChoiceRow({
      question: "Which certificate is broken?",
      options: shuffled([
        { id: "cert1", label: "CERT-1 — CN=portal.meridianregional.org" },
        { id: "cert2", label: "CERT-2 — CN=sso.meridianregional.org" },
      ], "h4-pick"),
      getValue: () => state.env.badge.hardPick,
      onChange: (v) => patch("badge", { hardPick: v }, "AUTHN", "forensics pick: cert selected"),
    }));
    const defsCard = h("div", { class: "rounded-lg border border-edge bg-panel-60 p-3" });
    defsCard.append(h("p", { class: "mb-2 text-xs font-medium text-text", text: "Check the three defects on the broken certificate:" }));
    defsCard.append(ChipToggle({
      items: shuffled(H4_DEFS.map((d) => ({ id: d.id, label: d.label })), "h4-defs"),
      getValue: () => state.env.badge.hardDefs,
      onChange: (id) => {
        const cur = state.env.badge.hardDefs;
        patch("badge", { hardDefs: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] }, "AUTHN", "defect flags updated");
      },
      accent: "gh-coral",
      label: "Certificate defects",
    }));
    grid.append(defsCard);
    hard.append(grid);
    root.append(hard);
  }
  return root;
}

/* ---------- Station 03 — The Federation Bridge (SSO & SAML) ---------- */
function FederationStation() {
  const root = h("div", { class: "space-y-6" });
  const h8 = H8_CARDS.find((c) => c.id === "federation");
  /* R6/anti-leak: statement pool order is shuffled */
  const ssoPoolShuffled = shuffled(SSO_POOL, "sso-pool");

  if (state.mode === "medium") {
    root.append(h("section", null,
      WidgetTitle([icon("waypoints", "ic text-mint"), " SAML flow sequencer"],
        "Tap the steps in the order a real SAML login happens — the user always lands on the application first."),
      OrderList({
        steps: SAML_STEPS,
        getValue: () => state.env.federation.flow,
        onOp: (op) => {
          const cur = state.env.federation.flow;
          const next = op.t === "clear" ? [] : op.t === "add" ? [...cur, op.id] : cur.filter((v) => v !== op.id);
          patch("federation", { flow: next }, "AUTHN", "SAML flow reordered");
        },
      })
    ));

    const roles = h("section", { class: "grid gap-3 sm-grid-cols-2" });
    roles.append(ChoiceRow({
      question: "MeridianID (the cloud identity service) is the…",
      options: shuffled([
        { id: "idp", label: "Identity Provider (IdP) — authenticates & issues assertions" },
        { id: "sp", label: "Service Provider (SP) — consumes assertions" },
        { id: "ca", label: "Certificate Authority" },
        { id: "user", label: "The user's browser" },
      ], "fed-role1"),
      getValue: () => state.env.federation.role1,
      onChange: (v) => patch("federation", { role1: v }, "AUTHN", "MeridianID role labeled"),
    }));
    roles.append(ChoiceRow({
      question: "The EHR web application is the…",
      options: shuffled([
        { id: "idp", label: "Identity Provider (IdP)" },
        { id: "sp", label: "Service Provider (SP) — opens the session after validating the assertion" },
        { id: "ca", label: "Certificate Authority" },
        { id: "radius", label: "RADIUS server" },
      ], "fed-role2"),
      getValue: () => state.env.federation.role2,
      onChange: (v) => patch("federation", { role2: v }, "AUTHN", "EHR app role labeled"),
    }));
    root.append(roles);

    /* SSO statement classifier */
    const card = h("section", { class: "rounded-lg border border-edge bg-panel-60 p-3" });
    card.append(WidgetTitle("Classify the SSO statements",
      "Judge each statement: is it a benefit of SSO or a risk of SSO? Exactly two of each are true; the rest are neither."));
    const listBox = h("div", { class: "grid gap-2" });
    const clsBtns = {};
    function syncRow(pid) {
      const ben = state.env.federation.ben.includes(pid);
      const risk = state.env.federation.risk.includes(pid);
      clsBtns[`${pid}:ben`].setAttribute("aria-checked", String(ben));
      clsBtns[`${pid}:ben`].className = `cls-btn ${ben ? "cls-mint-on" : "cls-off"}`;
      clsBtns[`${pid}:risk`].setAttribute("aria-checked", String(risk));
      clsBtns[`${pid}:risk`].className = `cls-btn ${risk ? "cls-coral-on" : "cls-off"}`;
    }
    for (const p of ssoPoolShuffled) {
      const row = h("div", { class: "flex flex-wrap items-center gap-2 rounded-lg border border-edge bg-raise-40 p-2-5" });
      row.append(h("p", { class: "min-w-200 flex-1 text-sm leading-snug text-text", text: p.text }));
      const group = h("div", { class: "flex gap-1-5" });
      const benBtn = h("button", {
        type: "button", role: "checkbox", "aria-checked": "false",
        "aria-label": `${p.text} — classify as benefit`,
        text: "Benefit",
        onclick: () => {
          const cur = state.env.federation;
          patch("federation", {
            ben: cur.ben.includes(p.id) ? cur.ben.filter((v) => v !== p.id) : [...cur.ben, p.id],
            risk: cur.risk.includes(p.id) ? cur.risk.filter((v) => v !== p.id) : cur.risk,
          }, "AUTHN", "SSO statement classified: benefit");
          syncRow(p.id);
          syncCounts();
        },
      });
      const riskBtn = h("button", {
        type: "button", role: "checkbox", "aria-checked": "false",
        "aria-label": `${p.text} — classify as risk`,
        text: "Risk",
        onclick: () => {
          const cur = state.env.federation;
          patch("federation", {
            risk: cur.risk.includes(p.id) ? cur.risk.filter((v) => v !== p.id) : [...cur.risk, p.id],
            ben: cur.ben.includes(p.id) ? cur.ben.filter((v) => v !== p.id) : cur.ben,
          }, "AUTHN", "SSO statement classified: risk");
          syncRow(p.id);
          syncCounts();
        },
      });
      clsBtns[`${p.id}:ben`] = benBtn;
      clsBtns[`${p.id}:risk`] = riskBtn;
      group.append(benBtn, riskBtn);
      row.append(group);
      listBox.append(row);
      syncRow(p.id);
    }
    const countLine = h("p", { class: "gh-term mt-2 text-dim" });
    function syncCounts() {
      countLine.textContent = `benefits picked: ${state.env.federation.ben.length} · risks picked: ${state.env.federation.risk.length} (target: 2 + 2)`;
    }
    syncCounts();
    card.append(listBox, countLine);
    root.append(card);
  }

  if (state.mode === "hard") {
    root.append(TradeOffCard(h8, "federation",
      () => state.env.federation.h8,
      (p) => patch("federation", { h8: { ...state.env.federation.h8, ...p } }, "AUTHZ", p.stance !== undefined ? "SSO trade-off stance taken" : "SSO residual risks marked")));
  }
  return root;
}

/* ---------- shared: hard-mode trade-off card ---------- */
function TradeOffCard(h8, key, getH8, apply) {
  const sec = h("section", { class: "tradeoff-card" });
  sec.append(WidgetTitle(`Trade-off card — ${h8.title}`, h8.context));
  sec.append(ChoiceRow({
    question: "Your stance:",
    options: shuffled(h8.stances, `h8-stance-${key}`),
    getValue: () => getH8().stance,
    onChange: (v) => apply({ stance: v }),
  }));
  const riskWrap = h("div", { class: "mt-3" });
  riskWrap.append(h("p", { class: "mb-2 text-xs font-medium text-text", text: "Residual risks that SURVIVE your stance (pick exactly two):" }));
  riskWrap.append(ChipToggle({
    items: shuffled(h8.riskPool.map((r) => ({ id: r.id, label: r.label })), `h8-risk-${key}`),
    getValue: () => getH8().risk,
    onChange: (id) => {
      const cur = getH8().risk;
      apply({ risk: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] });
    },
    accent: "gh-amber",
    label: `${h8.title} residual risks`,
  }));
  sec.append(riskWrap);
  return sec;
}

/* ---------- Station 04 — The Directory Hall (LDAP) ---------- */
function DirectoryStation() {
  const root = h("div", { class: "space-y-6" });

  const sec1 = h("section", null,
    WidgetTitle([icon("folder-tree", "ic text-mint"), " Distinguished-name builder"],
      "The directory tree is the hospital's phone book. Read it, then build Dr. Chen's address in it — most-specific component first (CN → OU → DC).")
  );
  sec1.append(h("pre", { class: "gh-scroll gh-term ldap-tree", text: LDAP_TREE }));

  const builder = h("div", { class: "mt-3 rounded-lg border border-edge bg-panel-60 p-3" });
  builder.append(h("p", { class: "text-xs text-dim" }, "Target: ",
    h("span", { class: "text-text", text: "Dr. d.chen, physician, in OU=Clinical, directory root meridianregional.org" })));
  const placedBox = h("div", { class: "mt-3 space-y-1-5" });
  const poolBox = h("div", { class: "mt-3 flex flex-wrap gap-2" });
  const clearBtn = h("button", {
    type: "button",
    class: "clear-dn-btn",
    onclick: () => { patch("directory", { dn: [] }, "AUTHN", "DN cleared"); render(); },
  }, icon("rotate-ccw", "ic-sm"), " Clear DN");
  builder.append(placedBox, poolBox);

  function render() {
    const dn = state.env.directory.dn;
    placedBox.textContent = "";
    poolBox.textContent = "";
    if (dn.length > 0) {
      dn.forEach((id, i) => {
        const chip = DN_CHIPS.find((c) => c.id === id);
        placedBox.append(h("div", { class: "flex items-center gap-2 rounded-md border border-mint-50 bg-mint-5 px-3 py-2" },
          h("span", { class: "grid h-6 w-6 place-items-center rounded-full bg-mint-20 font-display text-xs font-bold text-mint", text: String(i + 1) }),
          h("span", { class: "gh-term flex-1 text-text", text: chip ? chip.label : id }),
          h("button", {
            type: "button",
            "aria-label": `Remove component ${i + 1}`,
            onclick: () => {
              const cur = state.env.directory.dn;
              patch("directory", { dn: cur.filter((v) => v !== id) }, "AUTHN", "DN component removed");
              render();
            },
            class: "grid h-8 w-8 place-items-center rounded-md text-dim hover-row",
          }, icon("x", "ic"))
        ));
      });
      const preview = dn.map((id) => (DN_CHIPS.find((c) => c.id === id) || {}).label ?? id).join(",");
      placedBox.append(h("p", { class: "gh-term rounded-md bg-black-40 px-3 py-2 text-sky" }, `DN = ${preview}`));
      placedBox.append(clearBtn);
    }
    const pool = DN_CHIPS.filter((c) => !dn.includes(c.id));
    for (const c of pool) {
      poolBox.append(h("button", {
        type: "button",
        class: "chip-dashed dn-chip",
        onclick: () => {
          const cur = state.env.directory.dn;
          patch("directory", { dn: [...cur, c.id] }, "AUTHN", `DN component added: ${c.label}`);
          render();
        },
      }, "+ " + c.label));
    }
  }
  render();
  builder.append(h("p", { class: "mt-2 text-10 text-dim-70", text: "Correct DNs read most-specific first: CN=…,OU=…,DC=…,DC=…" }));
  sec1.append(builder);

  const sec2 = h("section", null,
    WidgetTitle("Confidential binds",
      "ldap.log shows the billing app binding with tls=NONE on 389 every morning. Choose the port/setting that keeps directory binds confidential."),
    ChoiceRow({
      question: "Which port + setting makes the binds encrypted?",
      options: shuffled(LDAP_PORT_OPTIONS, "ldap-port"),
      getValue: () => state.env.directory.port,
      onChange: (v) => patch("directory", { port: v }, "AUTHN", "LDAP confidentiality option chosen"),
    })
  );
  root.append(sec1, sec2);
  return root;
}

/* ---------- Station 05 — The Radio Room (AAA protocols) ---------- */
function RadioStation() {
  const root = h("div", { class: "space-y-6" });

  if (state.mode === "medium") {
    /* protocol triage */
    const rows = h("div", { class: "grid gap-3" });
    const reasonsShuffled = shuffled(RADIO_REASON_OPTIONS, "radio-reasons");
    RADIO_SCENARIOS.forEach((sc, i) => {
      const card = h("div", { class: "rounded-lg border border-edge bg-raise-40 p-3" });
      card.append(h("p", { class: "mb-2 flex gap-2 text-sm leading-snug text-text" },
        h("span", { class: "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint-15 font-display text-xs font-bold text-mint", text: String(i + 1) }),
        sc.text));
      const picks = h("div", { class: "grid gap-2 sm-grid-cols-2" });
      picks.append(SelectCell({
        options: RADIO_PROTO_OPTIONS,
        getValue: () => state.env.radio.pick[sc.id],
        onChange: (v) => {
          const cur = state.env.radio;
          patch("radio", { pick: { ...cur.pick, [sc.id]: v } }, "AUTHN", `scenario ${i + 1} protocol assigned`);
        },
        placeholder: "protocol…",
        ariaLabel: `Protocol for scenario ${i + 1}`,
      }));
      picks.append(SelectCell({
        options: reasonsShuffled,
        getValue: () => state.env.radio.reason[sc.id],
        onChange: (v) => {
          const cur = state.env.radio;
          patch("radio", { reason: { ...cur.reason, [sc.id]: v } }, "AUTHN", `scenario ${i + 1} reason assigned`);
        },
        placeholder: "why…",
        ariaLabel: `Reason for scenario ${i + 1}`,
      }));
      card.append(picks);
      rows.append(card);
    });
    root.append(h("section", null,
      WidgetTitle([icon("radio-tower", "ic text-mint"), " Protocol triage"],
        "Three live scenarios hit the radio room. Assign the right protocol AND the right reason to each."),
      rows));

    /* facts drill */
    const facts = h("div", { class: "grid gap-2" });
    for (const f of RADIO_FACTS) {
      const row = h("div", { class: "grid items-center gap-2 rounded-lg border border-edge bg-raise-40 p-2-5 fact-grid" });
      row.append(h("p", { class: "text-sm text-text", text: f.q }));
      row.append(SelectCell({
        options: shuffled(f.options, `radio-fact-${f.id}`),
        getValue: () => state.env.radio.facts[f.id],
        onChange: (v) => {
          const cur = state.env.radio;
          patch("radio", { facts: { ...cur.facts, [f.id]: v } }, "AUTHN", `fact answered: ${f.q}`);
        },
        ariaLabel: f.q,
      }));
      facts.append(row);
    }
    root.append(h("section", null, WidgetTitle("Facts drill", "Ports and encryption scope — the facts the exam asks cold."), facts));
  }

  if (state.mode === "hard") {
    const sec = h("section", null,
      WidgetTitle([icon("radio-tower", "ic text-mint"), " Protocol mapping table"],
        "Six requirement rows from the architecture review. Pair each with its protocol and its signature fact — two fact options are decoys with wrong ports or mismatched mechanisms."));
    const scroll = h("div", { class: "gh-scroll overflow-x-auto" });
    const table = h("table", { class: "h5-table" });
    table.append(h("thead", null, h("tr", { class: "h5-headrow" },
      h("th", { class: "h5-th-req", text: "Requirement" }),
      h("th", { class: "h5-th", text: "Protocol / mechanism" }),
      h("th", { class: "h5-th", text: "Key fact" }))));
    const tbody = h("tbody");
    H5_ROWS.forEach((r, i) => {
      const tr = h("tr");
      tr.append(h("td", { class: "h5-req" },
        h("span", { class: "mr-1-5 font-display text-xs text-mint", text: `${i + 1}.` }),
        r.prompt));
      tr.append(h("td", { class: "h5-cell" }, SelectCell({
        options: shuffled(H5_PROTO_OPTIONS, `h5-proto-${r.id}`),
        getValue: () => state.env.radio.h5[`${r.id}:proto`],
        onChange: (v) => {
          const cur = state.env.radio;
          patch("radio", { h5: { ...cur.h5, [`${r.id}:proto`]: v } }, "AUTHN", `row ${i + 1} protocol mapped`);
        },
        ariaLabel: `Protocol for ${r.prompt}`,
      })));
      tr.append(h("td", { class: "h5-cell" }, SelectCell({
        options: shuffled(H5_FACT_OPTIONS, `h5-fact-${r.id}`),
        getValue: () => state.env.radio.h5[`${r.id}:fact`],
        onChange: (v) => {
          const cur = state.env.radio;
          patch("radio", { h5: { ...cur.h5, [`${r.id}:fact`]: v } }, "AUTHN", `row ${i + 1} fact mapped`);
        },
        ariaLabel: `Key fact for ${r.prompt}`,
      })));
      tbody.append(tr);
    });
    table.append(tbody);
    scroll.append(table);
    sec.append(scroll);
    root.append(sec);
  }
  return root;
}

/* ---------- Station 06 — The Gatehouse (MFA) ---------- */
function GateStation() {
  const root = h("div", { class: "space-y-6" });
  const h8 = H8_CARDS.find((c) => c.id === "gate");

  const sec1 = h("section", null,
    WidgetTitle([icon("key-round", "ic text-mint"), " MFA factor tray"],
      "Pick the factors for the remote-VPN login chain. The tray labels each factor's category — a compliant chain needs at least two DIFFERENT categories."));
  sec1.append(ChipToggle({
    items: MFA_FACTORS.map((f) => ({
      id: f.id, label: f.label,
      sub: `something you ${f.cat === "know" ? "know" : f.cat === "have" ? "have" : "are"}`,
    })),
    getValue: () => state.env.gate.factors,
    onChange: (id) => {
      const cur = state.env.gate.factors;
      const next = cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id];
      patch("gate", { factors: next }, "AUTHN", `MFA chain updated (${next.length} factor(s))`);
    },
    accent: "gh-mint",
    label: "MFA factors",
  }));
  const countLine = h("p", { class: "gh-term mt-2 text-dim" });
  function syncCounts() {
    const chosen = MFA_FACTORS.filter((f) => state.env.gate.factors.includes(f.id));
    const cats = new Set(chosen.map((f) => f.cat));
    countLine.textContent = `selected: ${chosen.map((f) => f.label).join(" + ") || "none"} · categories used: ${cats.size}`;
  }
  syncCounts();
  sec1.append(countLine);
  root.append(sec1);

  const reflects = h("section", { class: "grid gap-3 sm-grid-cols-2" });
  reflects.append(ChoiceRow({
    question: MFA_REFLECT.q,
    options: shuffled(MFA_REFLECT.options, "mfa-reflect"),
    getValue: () => state.env.gate.reflect,
    onChange: (v) => patch("gate", { reflect: v }, "AUTHN", "reflection answered"),
  }));
  reflects.append(ChoiceRow({
    question: MFA_REFLECT.whyQ,
    options: shuffled(MFA_REFLECT.whyOptions, "mfa-why"),
    getValue: () => state.env.gate.why,
    onChange: (v) => patch("gate", { why: v }, "AUTHN", "reflection reason chosen"),
  }));
  root.append(reflects);

  root.append(h("p", { class: "rounded-md border border-edge bg-panel-60 px-3 py-2 text-xs leading-relaxed text-dim" },
    h("strong", { class: "text-mint", text: "Time-based authentication note:" }),
    " TOTP codes rotate every ~30 seconds and only validate while the server's clock is NTP-synced. Push approvals add ",
    h("em", null, "somewhere you are"), " context when the login source is shown — Incident 2211 failed exactly there (no number matching)."));

  if (state.mode === "hard") {
    root.append(TradeOffCard(h8, "gate",
      () => state.env.gate.h8,
      (p) => patch("gate", { h8: { ...state.env.gate.h8, ...p } }, "AUTHZ", p.stance !== undefined ? "factor trade-off stance taken" : "factor residual risks marked")));
  }
  return root;
}

/* ---------- Station 07 — The Role Office (authorization · RBAC · least privilege) ---------- */
function RoleStation() {
  const root = h("div", { class: "space-y-6" });
  const h8 = H8_CARDS.find((c) => c.id === "roles");

  const sec1 = h("section", null,
    WidgetTitle([icon("users-round", "ic text-mint"), " RBAC matrix"],
      "Authentication proves who you are; this matrix decides what you may touch. Least privilege: a cell stays on only if the role's job truly requires it. Find and remove the over-grants (medium) or rebuild the whole matrix from the dossiers (hard)."));
  sec1.append(MatrixToggle({
    rows: RBAC_ROLES.map((r) => ({ id: r, label: RBAC_ROLE_LABELS[r] })),
    cols: RBAC_PERMS.map((p) => ({ id: p.id, label: p.label })),
    getValue: () => state.env.roles.matrix,
    onToggle: (key) => {
      const cur = state.env.roles.matrix;
      const next = { ...cur, [key]: !cur[key] };
      patch("roles", { matrix: next }, "AUTHZ", `RBAC cell ${key} ${next[key] ? "granted" : "revoked"}`);
    },
    accent: "grant",
  }));

  if (state.mode === "hard") {
    const details = h("details", { class: "mt-3 rounded-lg border border-edge bg-panel-60 p-3" });
    details.append(h("summary", { class: "dossier-summary", text: "Persona dossiers (read before touching the matrix)" }));
    const ul = h("ul", { class: "mt-2 space-y-2 text-xs leading-relaxed text-dim" });
    const dossiers = [
      ["Nurse", " — charts in the EHR (read + write) and checks lab results for their patients."],
      ["Physician", " — same clinical trio as nurses: EHR read + write + lab results."],
      ["Lab tech", " — uploads and views lab results; reads the EHR for patient context only."],
      ["Billing clerk", " — posts payments in the billing system and reads EHR demographics. Never writes charts."],
      ["IT admin", " — administers device SSH, issues badges, manages guest Wi-Fi. Does NOT read patient data."],
      ["Contractor", " — facilities vendor: no clinical systems at all; internet VLAN only."],
    ];
    for (const [who, what] of dossiers) ul.append(h("li", null, h("strong", { class: "text-text", text: who }), what));
    details.append(ul);
    details.append(h("button", {
      type: "button",
      class: "clear-matrix-btn",
      onclick: () => {
        const cleared = {};
        RBAC_ROLES.forEach((r) => RBAC_PERMS.forEach((p) => { cleared[`${r}:${p.id}`] = false; }));
        patch("roles", { matrix: cleared }, "AUTHZ", "RBAC matrix cleared for full rebuild");
      },
    }, icon("rotate-ccw", "ic-sm"), " Clear matrix — rebuild from scratch (night-shift rebuild)"));
    sec1.append(details);
  }
  root.append(sec1);

  if (state.mode === "medium") {
    const cases = h("div", { class: "grid gap-3" });
    LIFE_CASES.forEach((c, ci) => {
      cases.append(ChoiceRow({
        question: c.text,
        options: shuffled(LIFE_OPTIONS, `life-${c.id}-${ci}`),
        getValue: () => state.env.roles.life[c.id],
        onChange: (v) => patch("roles", { life: { ...state.env.roles.life, [c.id]: v } }, "AUTHZ", `lifecycle case handled: ${c.id}`),
      }));
    });
    root.append(h("section", null,
      WidgetTitle("Joiner / mover / leaver desk",
        "IAM is the lifecycle around identity: provision joiners, re-assign movers, disable leavers — tonight's audit found a leaver who is still logging in."),
      cases));
  }

  if (state.mode === "hard") {
    root.append(TradeOffCard(h8, "roles",
      () => state.env.roles.h8,
      (p) => patch("roles", { h8: { ...state.env.roles.h8, ...p } }, "AUTHZ", p.stance !== undefined ? "RBAC trade-off stance taken" : "RBAC residual risks marked")));
  }
  return root;
}

/* ---------- Station 08 — Clock & Fence Post (time-based auth + geofencing) ---------- */
function ClockFenceStation() {
  const root = h("div", { class: "space-y-6" });
  const h8 = H8_CARDS.find((c) => c.id === "clock");

  /* geofence board */
  root.append(h("section", null,
    WidgetTitle([icon("map-pinned", "ic text-mint"), " Geofence board"],
      "Allow zones per persona. Policy: staff roam campus + metro; the traveling physician adds in-country while on assignment; contractors are campus-only. Abroad denies everyone. Two over-allowing zones are pre-set — fix them (medium)."),
    MatrixToggle({
      rows: FENCE_PERSONAS,
      cols: FENCE_ZONES,
      getValue: () => state.env.clock.fence,
      onToggle: (key) => {
        const cur = state.env.clock;
        patch("clock", { fence: { ...cur.fence, [key]: !cur.fence[key] } }, "AUTHZ", `geofence zone ${key} ${cur.fence[key] ? "denied" : "allowed"}`);
      },
      accent: "allow",
    })));

  /* live events */
  const eventsBox = h("div", { class: "grid gap-3" });
  const evBtns = {};
  for (const e of FENCE_EVENTS) {
    const card = h("div", { class: "rounded-lg border border-edge bg-raise-40 p-3" });
    card.append(h("p", { class: "mb-2 text-sm text-text", text: e.text }));
    const group = h("div", { class: "flex gap-2" });
    for (const v of ["allow", "deny"]) {
      const btn = h("button", {
        type: "button", role: "radio", "aria-checked": "false",
        text: v === "allow" ? "ALLOW" : "DENY",
        onclick: () => {
          const cur = state.env.clock;
          patch("clock", { events: { ...cur.events, [e.id]: v } }, "AUTHZ", `event judged: ${e.id} → ${v}`);
          syncEv(e.id);
        },
      });
      evBtns[`${e.id}:${v}`] = btn;
      group.append(btn);
    }
    card.append(group);
    eventsBox.append(card);
  }
  function syncEv(id) {
    for (const v of ["allow", "deny"]) {
      const btn = evBtns[`${id}:${v}`];
      const on = state.env.clock.events[id] === v;
      btn.setAttribute("aria-checked", String(on));
      btn.className = `event-btn ${on ? (v === "allow" ? "event-allow-on" : "event-deny-on") : "event-off"}`;
    }
  }
  FENCE_EVENTS.forEach((e) => syncEv(e.id));
  root.append(h("section", null, WidgetTitle("Live access events", "Judge each live event against the rules you just set."), eventsBox));

  /* shift windows */
  const winBox = h("div", { class: "grid gap-2" });
  for (const w of WINDOW_ROLES) {
    const card = h("div", { class: "rounded-lg border border-edge bg-raise-40 p-3" });
    card.append(h("p", { class: "mb-2 text-sm font-medium text-text", text: w.label }));
    const grid = h("div", { class: "win-grid" });
    for (const [part, labelText] of [["start", "Start"], ["end", "End"], ["days", "Days"]]) {
      const cellWrap = h("div");
      cellWrap.append(h("p", { class: "mb-1 text-10 uppercase tracking-wider text-dim", text: labelText }));
      cellWrap.append(SelectCell({
        options: part === "days" ? [{ id: "monfri", label: "Mon–Fri" }, { id: "everyday", label: "Every day" }] : TIME_OPTIONS.map((t) => ({ id: t, label: t })),
        getValue: () => (state.env.clock.win[w.id] || {})[part] ?? null,
        onChange: (v) => {
          const cur = state.env.clock;
          const win = cur.win[w.id] ?? { start: "", end: "", days: "monfri" };
          patch("clock", { win: { ...cur.win, [w.id]: { ...win, [part]: v } } }, "AUTHZ", `shift window adjusted: ${w.id}.${part}=${v}`);
        },
        ariaLabel: `${w.label} ${part}`,
      }));
      grid.append(cellWrap);
    }
    card.append(grid);
    winBox.append(card);
  }
  root.append(h("section", null,
    WidgetTitle([icon("clock-4", "ic text-mint"), " Shift window board"],
      "Time-of-day login windows per roster group. End before start = overnight wrap (nights 19:00→07:00)."),
    winBox));

  /* clock health */
  const clockSec = h("section", null,
    WidgetTitle("Clock health — the 14:05 lockouts",
      "At 14:05 three clinicians were locked out: 'TOTP code rejected'. Read the evidence, find the cause, choose the fix."));
  clockSec.append(EvidenceBox("ntp.log", "mb-3"));
  const diag = h("div", { class: "grid gap-3 sm-grid-cols-2" });
  diag.append(ChoiceRow({
    question: "Root cause?",
    options: shuffled(NTP_CAUSE_OPTIONS, "ntp-cause"),
    getValue: () => state.env.clock.ntpCause,
    onChange: (v) => patch("clock", { ntpCause: v }, "ACCT", "NTP cause diagnosed"),
  }));
  diag.append(ChoiceRow({
    question: "The fix?",
    options: shuffled(NTP_FIX_OPTIONS, "ntp-fix"),
    getValue: () => state.env.clock.ntpFix,
    onChange: (v) => patch("clock", { ntpFix: v }, "AUTHZ", "NTP fix selected"),
  }));
  clockSec.append(diag);
  root.append(clockSec);

  if (state.mode === "hard") {
    root.append(TradeOffCard(h8, "clock",
      () => state.env.clock.h8,
      (p) => patch("clock", { h8: { ...state.env.clock.h8, ...p } }, "AUTHZ", p.stance !== undefined ? "geofence trade-off stance taken" : "geofence residual risks marked")));
  }
  return root;
}

/* ---------- Station 09 — The Audit Desk (evidence · flags · TP/FP · rules) ---------- */
function AuditStation() {
  const root = h("div", { class: "space-y-6" });

  /* evidence console */
  const TABS = ["radius.log", "idp.log", "ldap.log", "tacacs.log", "ntp.log", "hr-roster.txt", "vpn-policy.cfg", "core-sw1.cfg", "certs.txt"];
  const sec1 = h("section", null,
    WidgetTitle([icon("scan-search", "ic text-mint"), " Evidence console"],
      "Nine evidence sources from tonight's audit sweep. Read them all before raising flags — the roster and the change ticket are part of the baseline."));
  sec1.append(makeTabs({
    tabs: TABS.map((t) => ({ id: t, label: t, panel: () => EvidenceBox(t) })),
    ariaLabel: "Evidence files",
  }));
  sec1.append(h("p", { class: "mt-2 text-xs italic text-dim-80", text: "Change-ticket note: svc_backup secret rotation is already scheduled (CHG-2041, open)." }));
  root.append(sec1);

  if (state.mode === "medium") {
    /* flag desk */
    root.append(h("section", null,
      WidgetTitle("Flag desk — raise the findings",
        "Eight candidate flags. Raise every REAL misconfiguration and none of the benign events."),
      ChipToggle({
        items: shuffled(AUDIT_FLAGS.map((f) => ({ id: f.id, label: f.short })), "audit-flags"),
        getValue: () => state.env.audit.flags,
        onChange: (id) => {
          const cur = state.env.audit.flags;
          patch("audit",
            { flags: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] },
            "ACCT",
            cur.includes(id) ? `flag lowered: ${id}` : `flag raised: ${id}`);
        },
        accent: "gh-coral",
        label: "Audit findings",
      }),
      flagCountLine()));

    /* TP / FP */
    const tpBox = h("div", { class: "grid gap-2" });
    const tpBtns = {};
    for (const e of TPFP_EVENTS) {
      const card = h("div", { class: "rounded-lg border border-edge bg-raise-40 p-3" });
      card.append(h("p", { class: "gh-term mb-2 text-text", text: e.text }));
      const group = h("div", { class: "flex gap-2" });
      for (const v of ["tp", "fp"]) {
        const btn = h("button", {
          type: "button", role: "radio", "aria-checked": "false",
          text: v === "tp" ? "TRUE positive" : "FALSE positive",
          onclick: () => {
            const cur = state.env.audit;
            patch("audit", { tpfp: { ...cur.tpfp, [e.id]: v } }, "ACCT", `event classified: ${e.id} → ${v === "tp" ? "true positive" : "false positive"}`);
            syncTp(e.id);
          },
        });
        tpBtns[`${e.id}:${v}`] = btn;
        group.append(btn);
      }
      card.append(group);
      tpBox.append(card);
    }
    function syncTp(id) {
      for (const v of ["tp", "fp"]) {
        const btn = tpBtns[`${id}:${v}`];
        const on = state.env.audit.tpfp[id] === v;
        btn.setAttribute("aria-checked", String(on));
        btn.className = `event-btn ${on ? (v === "tp" ? "event-deny-on" : "event-allow-on") : "event-off"}`;
      }
    }
    TPFP_EVENTS.forEach((e) => syncTp(e.id));
    root.append(h("section", null,
      WidgetTitle("TP / FP classification",
        "True positive = real policy violation or attack signal. False positive = explainable by context."),
      tpBox));
  }

  if (state.mode === "hard") {
    /* incident 2211 triage */
    const inc = h("section", null,
      WidgetTitle([icon("scan-search", "ic text-coral"), " Incident 2211 triage"],
        "Reconstruct the attack chain in order, name the four missing controls, and give the exact MITRE technique ID for the push flood."));
    inc.append(h("pre", { class: "gh-scroll gh-term mb-3 incident-pre", text: INCIDENT_2211 }));
    const grid = h("div", { class: "grid gap-3" });

    const partA = h("div", { class: "rounded-lg border border-edge bg-panel-60 p-3" });
    partA.append(h("p", { class: "mb-2 text-xs font-medium text-text", text: "Part A — order the five events:" }));
    partA.append(OrderList({
      steps: H2_SEQ,
      getValue: () => state.env.audit.h2.seq,
      onOp: (op) => {
        const cur = state.env.audit.h2.seq;
        const next = op.t === "clear" ? [] : op.t === "add" ? [...cur, op.id] : cur.filter((v) => v !== op.id);
        patch("audit", { h2: { ...state.env.audit.h2, seq: next } }, "ACCT", "incident chain reordered");
      },
      accent: "gh-amber",
    }));
    grid.append(partA);

    const partB = h("div", { class: "rounded-lg border border-edge bg-panel-60 p-3" });
    partB.append(h("p", { class: "mb-2 text-xs font-medium text-text", text: "Part B — the four missing controls whose presence would have broken this chain:" }));
    partB.append(ChipToggle({
      items: shuffled(H2_CONTROLS.map((c) => ({ id: c.id, label: c.label })), "h2-controls"),
      getValue: () => state.env.audit.h2.controls,
      onChange: (id) => {
        const cur = state.env.audit.h2.controls;
        patch("audit", { h2: { ...state.env.audit.h2, controls: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] } }, "ACCT", "missing controls selected");
      },
      accent: "gh-coral",
      label: "Missing controls",
    }));
    grid.append(partB);

    const partC = h("div", { class: "rounded-lg border border-edge bg-panel-60 p-3" });
    partC.append(h("p", { class: "mb-2 text-xs font-medium text-text", text: "Part C — exact MITRE technique ID for the push flood (type it):" }));
    const mitreInput = h("input", {
      type: "text",
      placeholder: "T####",
      "aria-label": "MITRE technique ID for the push flood",
      class: "gh-term mitre-input",
      value: state.env.audit.h2.mitre,
      oninput: (e) => {
        const cur = state.env.audit.h2;
        patch("audit", { h2: { ...cur, mitre: e.target.value } }, "ACCT", "MITRE ID typed");
      },
    });
    partC.append(mitreInput);
    grid.append(partC);
    inc.append(grid);
    root.append(inc);

    /* rule bench */
    const bench = h("section", null,
      WidgetTitle([icon("flask-conical", "ic text-amber"), " Rule bench"],
        "Detection engineering: three rules, each = the right data source + exact condition set + threshold. A rule on the wrong source can never fire."));
    const benchGrid = h("div", { class: "grid gap-3" });
    H3_RULES.forEach((r, i) => {
      const card = h("div", { class: "rounded-lg border border-edge bg-panel-60 p-3" });
      card.append(h("p", { class: "font-display mb-2 text-sm font-semibold text-text" }, `Rule ${i + 1} — ${r.name}`));
      const picks = h("div", { class: "grid gap-2 sm-grid-cols-2" });
      picks.append(SelectCell({
        options: H3_SOURCES,
        getValue: () => (state.env.audit.h3[r.id] || {}).src ?? null,
        onChange: (v) => {
          const cur = state.env.audit.h3;
          const dFresh = cur[r.id] ?? { src: null, conds: [], thr: null };
          patch("audit", { h3: { ...cur, [r.id]: { ...dFresh, src: v } } }, "ACCT", `rule ${i + 1} source selected`);
        },
        placeholder: "data source…",
        ariaLabel: `Data source for ${r.name}`,
      }));
      picks.append(SelectCell({
        options: H3_THR,
        getValue: () => (state.env.audit.h3[r.id] || {}).thr ?? null,
        onChange: (v) => {
          const cur = state.env.audit.h3;
          const dFresh = cur[r.id] ?? { src: null, conds: [], thr: null };
          patch("audit", { h3: { ...cur, [r.id]: { ...dFresh, thr: v } } }, "ACCT", `rule ${i + 1} threshold selected`);
        },
        placeholder: "threshold…",
        ariaLabel: `Threshold for ${r.name}`,
      }));
      card.append(picks);
      const condsWrap = h("div", { class: "mt-2" });
      condsWrap.append(h("p", { class: "mb-1-5 text-10 uppercase tracking-wider text-dim", text: "Conditions (exact set):" }));
      condsWrap.append(ChipToggle({
        items: shuffled(H3_CONDS.map((c) => ({ id: c.id, label: c.label })), `h3-conds-${r.id}`),
        getValue: () => (state.env.audit.h3[r.id] || {}).conds ?? [],
        onChange: (id) => {
          const cur = state.env.audit.h3;
          const dFresh = cur[r.id] ?? { src: null, conds: [], thr: null };
          const conds = dFresh.conds.includes(id) ? dFresh.conds.filter((v) => v !== id) : [...dFresh.conds, id];
          patch("audit", { h3: { ...cur, [r.id]: { ...dFresh, conds } } }, "ACCT", `rule ${i + 1} conditions updated`);
        },
        accent: "gh-amber",
        label: `Conditions for ${r.name}`,
      }));
      card.append(condsWrap);
      benchGrid.append(card);
    });
    bench.append(benchGrid);
    root.append(bench);
  }
  return root;
}
function flagCountLine() {
  const p = h("p", { class: "gh-term mt-2 text-dim" });
  const sync = () => { p.textContent = `raised: ${state.env.audit.flags.length} of 8 candidates`; };
  sync();
  subscribe((next, prev) => { if (next.audit !== prev.audit) sync(); });
  return p;
}

/* ---------- Station 10 — The Hardening Board (mitigation planning) ---------- */
function HardenStation() {
  const root = h("div", { class: "space-y-6" });

  if (state.mode === "medium") {
    /* gap → control matching */
    const gaps = h("div", { class: "grid gap-2" });
    M12_GAPS.forEach((g, i) => {
      const row = h("div", { class: "grid items-center gap-2 rounded-lg border border-edge bg-raise-40 p-2-5 gap-grid" });
      row.append(h("p", { class: "text-sm text-text" },
        h("span", { class: "mr-1-5 font-display text-xs text-coral", text: `${i + 1}.` }),
        g.label));
      row.append(SelectCell({
        options: shuffled(M12_CONTROLS, `m12-control-${g.id}`),
        getValue: () => state.env.harden.gaps[g.id],
        onChange: (v) => {
          const cur = state.env.harden;
          patch("harden", { gaps: { ...cur.gaps, [g.id]: v } }, "AUTHZ", `control matched to gap ${i + 1}`);
        },
        ariaLabel: `Control for ${g.label}`,
      }));
      gaps.append(row);
    });
    root.append(h("section", null,
      WidgetTitle([icon("wrench", "ic text-mint"), " Gap → control matching"],
        "Every audit finding needs exactly one direct control. The decoys (firewall appliance, more admins, less logging) fix none of these gaps."),
      gaps));

    /* remediation sequence */
    root.append(h("section", null,
      WidgetTitle("Remediation sequence",
        "Sequence the runbook: contain first; the new certificate must exist before LDAPS enforcement can bind to it."),
      OrderList({
        steps: M12_SEQ,
        getValue: () => state.env.harden.seq,
        onOp: (op) => {
          const cur = state.env.harden.seq;
          const next = op.t === "clear" ? [] : op.t === "add" ? [...cur, op.id] : cur.filter((v) => v !== op.id);
          patch("harden", { seq: next }, "AUTHZ", "remediation sequence updated");
        },
      })));
  }

  if (state.mode === "hard") {
    /* blueprint */
    const bp = h("div", { class: "grid gap-2" });
    for (const c of H1_CONTROLS) {
      /* anti-leak: per-control shuffled layer options */
      const layers = shuffled(H1_LAYERS.map((l) => ({ id: l.id, label: `${l.label} — ${l.hint}` })), `h1-${c.id}`);
      const row = h("div", { class: "grid items-center gap-2 rounded-lg border border-edge bg-raise-40 p-2-5 gap-grid" });
      row.append(h("p", { class: "gh-term text-xs text-text", text: c.label }));
      row.append(SelectCell({
        options: layers,
        getValue: () => state.env.harden.h1[c.id],
        onChange: (v) => {
          const cur = state.env.harden;
          patch("harden", { h1: { ...cur.h1, [c.id]: v } }, "AUTHZ", `control placed on blueprint: ${c.label}`);
        },
        ariaLabel: `Layer for ${c.label}`,
      }));
      bp.append(row);
    }
    root.append(h("section", null,
      WidgetTitle([icon("map", "ic text-mint"), " Defense-in-depth blueprint"],
        "CISO briefing: assign every control to the layer it actually gates. Context gates where/when, identity proves who, authorization decides what, data protects the payload, audit records it."),
      bp));

    /* zero-trust access plan */
    const plan = h("div", { class: "space-y-4" });
    for (const p of H7_PATHS) {
      const card = h("div", { class: "rounded-lg border border-edge bg-raise-40 p-3" });
      card.append(h("p", { class: "font-display mb-2 text-sm font-semibold text-text", text: p.label }));
      const slots = h("div", { class: "plan-grid" });
      for (const s of p.slots) {
        const cell = h("div");
        cell.append(h("p", { class: "mb-1 text-10 uppercase tracking-wider text-dim", text: s.label }));
        cell.append(SelectCell({
          options: shuffled(s.options, `h7-${p.id}-${s.id}`),
          getValue: () => state.env.harden.h7[`${p.id}:${s.id}`],
          onChange: (v) => {
            const cur = state.env.harden;
            patch("harden", { h7: { ...cur.h7, [`${p.id}:${s.id}`]: v } }, "AUTHZ", `access plan cell set: ${p.label}/${s.label}`);
          },
          ariaLabel: `${p.label} — ${s.label}`,
        }));
        slots.append(cell);
      }
      card.append(slots);
      plan.append(card);
    }
    root.append(h("section", null,
      WidgetTitle([icon("clipboard-list", "ic text-mint"), " Zero-trust access plan"],
        "Five access paths × three decisions each: strong authentication, encrypted transport, and a context or session control."),
      plan));

    /* runbook */
    root.append(h("section", null,
      WidgetTitle([icon("route", "ic text-mint"), " Night-shift runbook"],
        "Eight actions, dependency-correct order. Containment before rebuilding; the clock before the codes; the certificate before the service that binds it; institutional controls last."),
      OrderList({
        steps: H9_STEPS,
        getValue: () => state.env.harden.h9,
        onOp: (op) => {
          const cur = state.env.harden.h9;
          const next = op.t === "clear" ? [] : op.t === "add" ? [...cur, op.id] : cur.filter((v) => v !== op.id);
          patch("harden", { h9: next }, "AUTHZ", "runbook sequence updated");
        },
      })));
  }
  return root;
}
