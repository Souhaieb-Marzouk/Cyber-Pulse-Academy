/* ═══════════════════════════════════════════════════════════════════════════
   views.js — the workbench views: SVG schematic, detail sheets, control
   register, tracker widgets/cards/rail, evidence binder, debrief and the
   completion + reset dialogs. 1:1 translations of Schematic.tsx,
   DetailSheet.tsx, ControlRegister.tsx, TrackerRail.tsx, EvidenceBinder.tsx,
   Debrief.tsx and CompletionModal.tsx (same geometry, markup semantics,
   ARIA wiring and copy).
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

// ── Schematic geometry (identical coordinates) ───────────────────────────────
const GEOM = [
  { id: "INT", x: 40, y: 30, w: 200, h: 96, header: "Internet — untrusted" },
  { id: "DMZ", x: 320, y: 30, w: 330, h: 128, header: "DMZ" },
  { id: "CLD", x: 770, y: 30, w: 200, h: 112, header: "Cloud VPC" },
  { id: "RMT", x: 30, y: 262, w: 200, h: 100, header: "Remote users" },
  { id: "CORP", x: 300, y: 226, w: 370, h: 216, header: "Corporate LAN" },
  { id: "QTN", x: 690, y: 388, w: 150, h: 84, header: "Quarantine" },
  { id: "BR", x: 760, y: 262, w: 210, h: 100, header: "Branch depot" },
  { id: "GST", x: 30, y: 520, w: 210, h: 96, header: "Guest Wi-Fi" },
  { id: "MGT", x: 330, y: 520, w: 300, h: 116, header: "Management" },
  { id: "OT", x: 700, y: 520, w: 270, h: 116, header: "Operations (OT)" },
];
const LINK_GEOM = {
  EDGE: [140, 126, 420, 30],
  "DMZ-CORP": [480, 158, 480, 226],
  "CORP-OT": [670, 420, 780, 520],
  "VPN-REMOTE": [230, 312, 300, 312],
  "S2S-BRANCH": [760, 312, 670, 312],
  CLOUD: [600, 226, 830, 142],
  GUEST: [130, 520, 130, 126],
};
const KIND_GLYPH = { server: "▤", workstation: "▣", ot: "◍", network: "◈", laptop: "▭", cloud: "☁", appliance: "◒" };

function linkStatus(id, c) {
  switch (id) {
    case "EDGE":
      return {
        text: `${c.policy === "default-deny-explicit" ? "default-deny" : c.policy === "flat-allow" ? "flat-allow" : "policy: —"}${c.ips ? " · IPS" : ""}`,
        ok: c.policy === "default-deny-explicit" && c.ips,
      };
    case "DMZ-CORP":
      return { text: c.policy === "default-deny-explicit" ? "default-deny" : c.policy === "flat-allow" ? "flat-allow" : "policy: —", ok: c.policy === "default-deny-explicit" };
    case "CORP-OT":
      return { text: `${c.microseg ? "micro-seg" : "flat"}${c.oneway ? " · 1-way" : ""}`, ok: c.microseg && c.oneway };
    case "VPN-REMOTE":
      return {
        text: `${c.vpn === "none" ? "no VPN" : c.vpn === "client" ? "client VPN" : "s2s"} · ${c.tunnel}${c.mfa ? " · MFA" : ""}${c.posture ? " · posture" : ""}`,
        ok: c.vpn === "client" && c.tunnel === "full" && c.mfa && c.posture,
      };
    case "S2S-BRANCH":
      return { text: c.vpn === "site-to-site" ? "site-to-site" : c.vpn === "client" ? "client VPN" : "no tunnel", ok: c.vpn === "site-to-site" };
    case "CLOUD":
      return { text: c.ztna ? "via SSE/ZTNA" : "direct path", ok: c.ztna };
    case "GUEST":
      return { text: c.isolated ? "isolated" : "bridged", ok: c.isolated };
    default:
      return { text: "—", ok: false };
  }
}

// interactive() → shared attribute string for keyboard/mouse selectable nodes
function interactive(kind, id, ariaLabel) {
  return `role="button" tabindex="0" data-action="select-node" data-kind="${kind}" data-id="${id}" aria-label="${esc(ariaLabel)}"`;
}

function schematicHTML(env, selected) {
  const zoneAssets = {};
  for (const z of ZONES) zoneAssets[z.id] = [];
  for (const a of ASSETS) (zoneAssets[env.assets[a.id] ?? a.startZone] ?? zoneAssets[a.startZone]).push(a);

  const isSel = (kind, id) => selected?.kind === kind && selected.id === id;

  const linksSvg = LINKS.map((l) => {
    const [x1, y1, x2, y2] = LINK_GEOM[l.id];
    const st = linkStatus(l.id, env.links[l.id]);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const sel = isSel("link", l.id);
    const w = Math.max(st.text.length * 6.4 + 18, 64);
    return `<g>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${st.ok ? "#4D7C0F" : "#8A8168"}" stroke-width="${st.ok ? 2.5 : 1.6}" ${st.ok ? "" : 'class="draw-dash"'}></line>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="16" class="hit" data-action="select-node" data-kind="link" data-id="${l.id}"></line>
      <g ${interactive("link", l.id, `Link ${l.label}. Current configuration: ${st.text}. Press Enter to open its configuration sheet.`)}>
        <rect x="${mx - w / 2}" y="${my - 11}" width="${w}" height="22" rx="4" fill="#FBF8F0" stroke="${sel ? "#B45309" : st.ok ? "#4D7C0F" : "#A99F87"}" stroke-width="${sel ? 2.5 : 1.2}"></rect>
        <text x="${mx}" y="${my + 4}" text-anchor="middle" font-size="10.5" class="font-mono" fill="${st.ok ? "#3F5C33" : "#57503F"}">${esc(st.text)}</text>
        <circle cx="${mx + w / 2 - 7}" cy="${my - 11}" r="3.2" fill="${st.ok ? "#4D7C0F" : "#C4832F"}"></circle>
      </g>
    </g>`;
  }).join("");

  const zonesSvg = GEOM.map((z) => {
    const zone = ZONES.find((zz) => zz.id === z.id);
    const assets = zoneAssets[z.id] ?? [];
    const rows = Math.max(1, Math.ceil(assets.length / 2));
    const cellH = rows > 2 ? 28 : 34;
    const gap = rows > 2 ? 5 : 8;
    const sel = isSel("zone", z.id);
    const assetsSvg = assets
      .map((a, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const ax = z.x + 12 + col * 160;
        const ay = z.y + 26 + row * (cellH + gap);
        const asel = isSel("asset", a.id);
        const critical = a.criticality === "Critical";
        return `<g ${interactive("asset", a.id, `Asset ${a.id}, ${a.name}, currently in zone ${zone.short}. Press Enter to open its asset sheet.`)} data-stop="1">
          <rect x="${ax}" y="${ay}" width="148" height="${cellH}" rx="4" fill="#FBF8F0" stroke="${asel ? "#B45309" : "#7A7260"}" stroke-width="${asel ? 2.4 : 1.1}"></rect>
          <text x="${ax + 8}" y="${ay + (cellH > 30 ? 15 : 13)}" font-size="10.5" class="font-mono" font-weight="700" fill="#26221B">${esc(a.id)}</text>
          <text x="${ax + 8 + a.id.length * 6.6 + 12}" y="${ay + (cellH > 30 ? 15 : 13)}" font-size="9.5" class="font-mono" fill="#6B6353">${KIND_GLYPH[a.kind]} ${esc(a.kind)}</text>
          ${critical ? `<circle cx="${ax + 138}" cy="${ay + (cellH > 30 ? 11 : 10)}" r="4" fill="#B4553B"></circle>` : ""}
          <title>${esc(`${a.id} — ${a.name} (${zone.short})`)}</title>
        </g>`;
      })
      .join("");
    return `<g>
      <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="8" fill="${z.id === "QTN" ? "url(#hatch)" : zone.tint}" stroke="${sel ? "#B45309" : zone.stroke}" stroke-width="${sel ? 3 : zone.external ? 1.4 : 1.8}" ${zone.external ? 'stroke-dasharray="7 5"' : ""} class="hit"></rect>
      <g ${interactive("zone", z.id, `Zone ${zone.label}. ${zone.purpose} Contains: ${assets.map((a) => a.id).join(", ") || "no assets"}. Press Enter to open zone sheet.`)}>
        <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="8" fill="transparent"></rect>
        <text x="${z.x + 10}" y="${z.y + 17}" font-size="11.5" class="font-mono" font-weight="700" fill="#26221B" letter-spacing="1.5">${esc(zone.short)}</text>
        <text x="${z.x + 10 + zone.short.length * 8.4 + 10}" y="${z.y + 17}" font-size="9.5" class="font-mono" fill="#6B6353">${zone.external ? "external" : "security zone"}</text>
        ${assets.length === 0 ? `<text x="${z.x + 10}" y="${z.y + 42}" font-size="10" class="font-mono" fill="#8A8168" font-style="italic">no assets assigned</text>` : ""}
      </g>
      ${assetsSvg}
    </g>`;
  }).join("");

  return `<div class="schem-wrap scroll-thin">
    <svg viewBox="0 0 1000 660" role="img" aria-label="Northwind Freight network schematic. Zones, assets and inter-zone links are selectable. All data is synthetic training data.">
      <defs>
        <pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#F0E6DA"></rect>
          <line x1="0" y1="0" x2="0" y2="7" stroke="#C79A6B" stroke-width="2.5"></line>
        </pattern>
      </defs>
      <text x="985" y="648" text-anchor="end" class="font-mono" font-size="9" fill="#8A8168" letter-spacing="2">NW-FRT · AS-BUILT · TRAINING DATA (SYNTHETIC)</text>
      ${linksSvg}
      <line x1="670" y1="400" x2="690" y2="410" stroke="#A99F87" stroke-width="1.2" class="draw-dash"></line>
      ${zonesSvg}
      <g ${interactive("register", "register", "Control Register. Press Enter to open facility-wide controls: 802.1X, NAC, administration, identity, resilience and connectivity policies.")}>
        <rect x="60" y="410" width="190" height="54" rx="6" fill="#26221B"></rect>
        <text x="155" y="432" text-anchor="middle" font-size="11" class="font-mono" font-weight="700" fill="#F6F1E4" letter-spacing="2">CONTROL REGISTER</text>
        <text x="155" y="450" text-anchor="middle" font-size="9" class="font-mono" fill="#CDC5AE">802.1X · NAC · ADMIN · IDENTITY</text>
        <title>Open the Control Register — facility-wide policy controls</title>
      </g>
      <line x1="155" y1="410" x2="155" y2="362" stroke="#A99F87" stroke-width="1.2" class="draw-dash"></line>
    </svg>
    <div class="schem-foot">
      ${mono("click / Enter on any zone · asset · link chip · control register")}
      ${mono("<span class=\"schem-legend\">solid green link = meets NW-SEC-STD-7 · dashed amber = non-compliant</span>", "normal-case tracking-normal")}
    </div>
  </div>`;
}

// ── Detail sheet pieces ──────────────────────────────────────────────────────
function switchRow(label, hint, checked, attrs) {
  return `<div class="switch-row">
    <div class="sw-copy">
      <p class="sw-label">${esc(label)}</p>
      <p class="sw-hint">${esc(hint)}</p>
    </div>
    <button type="button" role="switch" aria-checked="${checked}" aria-label="${esc(label)}" class="switch ${checked ? "on" : ""}" ${attrs}>
      <span class="knob"></span>
    </button>
  </div>`;
}

function selectField(id, labelText, value, options, attrs) {
  return `<div>
    <label class="field-label" for="${id}">${labelText}</label>
    <select id="${id}" class="select" ${attrs}>${options}</select>
  </div>`;
}

function linkControlsHTML(linkId, env) {
  const def = LINKS.find((l) => l.id === linkId);
  const cfg = env.links[linkId];
  const d = (field) => `data-field="${field}" data-link="${linkId}"`;
  const parts = [];
  if (def.controls.includes("policy")) {
    parts.push(selectField(`sel-pol-${linkId}`, "Filtering policy", cfg.policy, `
      <option value="unspecified">— unspecified —</option>
      <option value="flat-allow">Flat-allow (traffic passes freely)</option>
      <option value="default-deny-explicit">Default-deny, explicit allows only</option>`, d("link-policy")));
  }
  if (def.controls.includes("ips")) parts.push(switchRow("IPS inspection", "Inline intrusion prevention on traffic entering this link.", cfg.ips, `data-action="link-toggle" data-link="${linkId}" data-key="ips"`));
  if (def.controls.includes("vpn")) {
    parts.push(selectField(`sel-vpn-${linkId}`, "VPN type", cfg.vpn, `
      <option value="none">— none —</option>
      <option value="client">Client (remote-access) VPN</option>
      <option value="site-to-site">Site-to-site VPN (gateway ↔ gateway)</option>`, d("link-vpn")));
  }
  if (def.controls.includes("tunnel")) {
    parts.push(selectField(`sel-tun-${linkId}`, "Tunnel mode", cfg.tunnel, `
      <option value="split">Split tunnel (corporate-bound only)</option>
      <option value="full">Full tunnel (all traffic inspected)</option>`, d("link-tunnel")));
  }
  if (def.controls.includes("mfa")) parts.push(switchRow("MFA required", "Multi-factor verification for every connection on this path.", cfg.mfa, `data-action="link-toggle" data-link="${linkId}" data-key="mfa"`));
  if (def.controls.includes("posture")) parts.push(switchRow("Device posture check", "Verify device health before granting access (Zero Trust device management).", cfg.posture, `data-action="link-toggle" data-link="${linkId}" data-key="posture"`));
  if (def.controls.includes("ztna")) parts.push(switchRow("SSE / ZTNA gateway", "Reach cloud apps per-application through the Security Service Edge — not flat VPN-to-LAN.", cfg.ztna, `data-action="link-toggle" data-link="${linkId}" data-key="ztna"`));
  if (def.controls.includes("isolated")) parts.push(switchRow("Guest isolation", "No route between guest and any internal zone.", cfg.isolated, `data-action="link-toggle" data-link="${linkId}" data-key="isolated"`));
  if (def.controls.includes("otpath")) {
    parts.push(switchRow("Micro-segmentation", "Break the flat path: only the historian relay may talk toward the plant, nothing reaches PLC/HMI directly.", cfg.microseg, `data-action="link-toggle" data-link="${linkId}" data-key="microseg"`));
    parts.push(switchRow("One-way telemetry export", "Plant data leaves OT in one direction only (diode-style); no session may be initiated inward.", cfg.oneway, `data-action="link-toggle" data-link="${linkId}" data-key="oneway"`));
    parts.push(selectField("sel-ot-prop", "Adjudicate proposal for EOL host HMI-01", env.flags.otProposal, `
      <option value="">— choose a proposal —</option>
      <option value="patch">P1: Re-image / patch HMI-01 to a supported OS</option>
      <option value="microseg-oneway">P2: Micro-segment OT + one-way telemetry export</option>
      <option value="flat-monitored">P3: Keep flat, monitor the boundary</option>`, `data-field="flag-select" data-flag="otProposal"`));
  }
  return `<div class="stack-2">${parts.join("")}</div>`;
}

function requiredText(linkId) {
  switch (linkId) {
    case "EDGE": return "default-deny + explicit allows, IPS on";
    case "DMZ-CORP": return "default-deny, explicit allows only";
    case "CORP-OT": return "micro-segmented, telemetry one-way";
    case "VPN-REMOTE": return "client VPN · full tunnel · MFA · posture";
    case "S2S-BRANCH": return "site-to-site IPsec";
    case "CLOUD": return "per-app via SSE/ZTNA";
    case "GUEST": return "internet only, fully isolated";
    default: return "—";
  }
}

function detailSheetHTML(selection, env, mode) {
  if (!selection) return null;

  if (selection.kind === "register") {
    return paper(controlRegisterHTML(env), "p-4");
  }

  if (selection.kind === "asset") {
    const a = ASSETS.find((x) => x.id === selection.id);
    const z = ZONES.find((zz) => zz.id === env.assets[a.id]);
    const zoneOpts = PLACEABLE_ZONE_IDS.map((zid) => {
      const zz = ZONES.find((x) => x.id === zid);
      return `<option value="${zid}">${zz.short} — ${esc(zz.label)}</option>`;
    }).join("");
    return paper(`
      <div class="ds-head">
        <div>
          ${mono("asset sheet")}
          <h3 class="ds-title mono-strong">${esc(a.id)}</h3>
          <p class="ds-name">${esc(a.name)}</p>
        </div>
        <button type="button" aria-label="Close detail sheet" class="btn btn-close" data-action="close-sheet">✕</button>
      </div>
      <dl class="ds-meta">
        <div><dt>Owner: </dt><dd>${esc(a.owner)}</dd></div>
        <div><dt>Crit: </dt><dd>${esc(a.criticality)}</dd></div>
      </dl>
      <p class="ds-notes">${esc(a.notes)}</p>
      ${a.movable
        ? selectField("sel-zone", `Assign zone — current: <span class="amber">${esc(z?.short ?? "—")}</span>`, env.assets[a.id], zoneOpts, `data-field="asset-zone" data-asset="${a.id}"`)
        : `<p class="ds-fixed">${esc(a.fixedNote ?? "Zone fixed for this asset.")}</p>`}
    `, "p-4", "section");
  }

  if (selection.kind === "link") {
    const def = LINKS.find((l) => l.id === selection.id);
    return paper(`
      <div class="ds-head">
        <div>
          ${mono("link sheet")}
          <h3 class="ds-title">${esc(def.label)}</h3>
          <p class="ds-desc">${esc(def.desc)}</p>
        </div>
        <button type="button" aria-label="Close detail sheet" class="btn btn-close" data-action="close-sheet">✕</button>
      </div>
      ${linkControlsHTML(def.id, env)}
      <!-- Audit QA-11: in Hard mode the expected values are NOT restated here —
          discovering and applying E-07 is the exercise. Medium keeps the reminder. -->
      <p class="ds-required">${mode === "hard"
        ? "standard check: verify every value on this sheet against NW-SEC-STD-7 (E-07) yourself"
        : `required here (E-07): ${requiredText(def.id)}`}</p>
    `, "p-4", "section");
  }

  // zone sheet
  const zone = ZONES.find((zz) => zz.id === selection.id);
  const inside = ASSETS.filter((a) => env.assets[a.id] === zone.id);
  return paper(`
    <div class="ds-head">
      <div>
        ${mono("zone sheet")}
        <h3 class="ds-title">${esc(zone.label)}</h3>
      </div>
      <button type="button" aria-label="Close detail sheet" class="btn btn-close" data-action="close-sheet">✕</button>
    </div>
    <p class="ds-notes"><span class="ds-purpose">Standard purpose: </span>${esc(zone.purpose)}</p>
    <p class="ds-listlabel">Assets currently here (${inside.length})</p>
    <ul class="ds-list">
      ${inside.length === 0 ? `<li class="ds-empty">none</li>` : ""}
      ${inside.map((a) => `<li class="ds-row"><span class="ds-id">${esc(a.id)}</span><span>${esc(a.name)}</span></li>`).join("")}
    </ul>
  `, "p-4", "section");
}

function controlRegisterHTML(env) {
  const f = env.flags;
  const s = (label, hint, checked, flag) => switchRow(label, hint, checked, `data-action="flag-toggle" data-flag="${flag}"`);
  const sel = (id, labelText, value, options, flag) => selectField(id, labelText, value, options, `data-field="flag-select" data-flag="${flag}"`);
  return `<div class="stack-4">
    <div class="ds-head">
      <div>
        ${mono("facility-wide policies")}
        <h3 class="ds-title">Control Register</h3>
        <p class="ds-desc">Policies that apply across the whole estate — not to a single link.</p>
      </div>
      <button type="button" aria-label="Close control register" class="btn btn-close" data-action="close-sheet">✕</button>
    </div>
    <div class="register-scroll scroll-thin">
      <fieldset class="cr-section">
        <legend><span class="cr-code">A</span><span class="cr-title">Access control (user ports)</span></legend>
        ${s("802.1X on user ports", "Port-based access control: supplicant (device) → authenticator (switch) → authentication server (RADIUS).", f.dot1x, "dot1x")}
        ${s("NAC quarantine VLAN", "Devices failing posture checks land in the Quarantine zone — cleanable, never connected.", f.quarantineVlan, "quarantineVlan")}
      </fieldset>
      <fieldset class="cr-section">
        <legend><span class="cr-code">B</span><span class="cr-title">Administration path</span></legend>
        ${s("Admin via jump box", "All device administration must traverse the hardened, logged jump box (JMP-01).", f.jumpboxRequired, "jumpboxRequired")}
        ${s("Direct device admin disabled", "Remove the flat RDP/SSH path from the Corporate LAN into network gear.", f.directAdminDisabled, "directAdminDisabled")}
        ${s("OOB management network", "Out-of-band: a separate management wire that neither rides nor dies with production traffic.", f.oob, "oob")}
        ${sel("sel-aaa", "Device-administration protocol", f.adminProtocol, `
          <option value="none">— none —</option>
          <option value="radius">RADIUS (network user access — 802.1X backend)</option>
          <option value="tacacs">TACACS+ (device admin: per-command authorization)</option>`, "adminProtocol")}
      </fieldset>
      <fieldset class="cr-section">
        <legend><span class="cr-code">C</span><span class="cr-title">Identity management</span></legend>
        ${s("gMSA for svc_backup", "Group Managed Service Account: AD rotates the password; no human holds the secret.", f.gmsaBackup, "gmsaBackup")}
        ${s("gMSA for svc_web", "Same for the web service account.", f.gmsaWeb, "gmsaWeb")}
        <div class="grid-2">
          ${sel("sel-creep", "Privilege-creep account (E-05)", f.creepAccount, `
            <option value="">— name the account —</option>
            <option value="m.osei">m.osei</option>
            <option value="svc_backup">svc_backup</option>
            <option value="j.hollis">j.hollis</option>`, "creepAccount")}
          ${sel("sel-creepfix", "Remediation", f.creepFix, `
            <option value="">— choose the fix —</option>
            <option value="ignore">Document and ignore</option>
            <option value="revoke">Revoke &amp; recertify to least privilege</option>
            <option value="promote">Grant the account more rights</option>`, "creepFix")}
          ${sel("sel-orphan", "Orphaned account a.kwan (departed employee)", f.orphanFix, `
            <option value="">— lifecycle action —</option>
            <option value="keep">Keep active (may still be needed)</option>
            <option value="deprovision">Deprovision immediately</option>
            <option value="monitor">Keep, but monitor the logon</option>`, "orphanFix")}
        </div>
      </fieldset>
      <fieldset class="cr-section">
        <legend><span class="cr-code">D</span><span class="cr-title">Resilience &amp; diversity</span></legend>
        ${sel("sel-fail", "Perimeter firewall failure mode", f.fwFailMode, `
          <option value="unspecified">— unspecified —</option>
          <option value="fail-open">Fail-open (traffic passes if the firewall dies)</option>
          <option value="fail-closed">Fail-closed (traffic blocked if the firewall dies)</option>`, "fwFailMode")}
        ${s("Vendor diversity accepted", "Add a second firewall vendor at the perimeter — one vendor's flaw must not be a total loss.", f.vendorDiversity, "vendorDiversity")}
      </fieldset>
      <fieldset class="cr-section">
        <legend><span class="cr-code">E</span><span class="cr-title">Connectivity hygiene</span></legend>
        ${s("Secure file transfer (SFTP / MFT)", "Retire plain FTP; managed, encrypted transfer for shipping documents.", f.sftp, "sftp")}
        ${s("E2EE ops messaging", "End-to-end encrypted messaging for yard and ops coordination.", f.e2ee, "e2ee")}
      </fieldset>
    </div>
  </div>`;
}

// ── Tracker inline answer widgets ────────────────────────────────────────────
const SEL_CLS = "widget-select";

function flowsWidget(env) {
  return `<div class="stack-1">
    ${FLOW_ROWS.map((r) => `
      <div class="flow-row">
        <span class="flow-id">${esc(r.id)}</span>
        <span class="flow-text" title="${esc(r.text)}">${esc(r.text)}</span>
        <select aria-label="Classify flow ${esc(r.id)} as north-south or east-west" class="${SEL_CLS} w-flow" data-field="flow" data-id="${esc(r.id)}">
          <option value="">— pick —</option>
          <option value="NS">N-S</option>
          <option value="EW">E-W</option>
        </select>
      </div>`).join("")}
    <div class="flow-lateral">
      <span class="flow-lateral-label">Lateral-movement flow (IR-2411 step 2):</span>
      <select aria-label="Which flow is the lateral movement hop" class="${SEL_CLS} w-flow" data-field="lateral">
        <option value="">— pick —</option>
        ${FLOW_ROWS.map((r) => `<option value="${esc(r.id)}">${esc(r.id)}</option>`).join("")}
      </select>
    </div>
  </div>`;
}

function zoneMatchWidget(env) {
  const rows = [
    { zone: "DMZ", label: "DMZ" },
    { zone: "MGT", label: "Management" },
    { zone: "OT", label: "Operations (OT)" },
    { zone: "QTN", label: "Quarantine" },
  ];
  return `<div class="stack-1">
    ${rows.map((r) => `
      <div class="widget-row">
        <span class="wm-label">${esc(r.label)}</span>
        <select aria-label="Purpose of the ${esc(r.label)} zone" class="${SEL_CLS}" data-field="zonematch" data-zone="${esc(r.zone)}">
          <option value="">— match purpose —</option>
          ${ZONE_MATCH_OPTIONS.map((o) => `<option value="${esc(o.id)}">${esc(o.text)}</option>`).join("")}
        </select>
      </div>`).join("")}
  </div>`;
}

function identityWidget(env, hard) {
  return `<div class="stack-1">
    <div class="grid-2">
      <select aria-label="Which account shows privilege creep" class="${SEL_CLS}" data-field="flag-select" data-flag="creepAccount">
        <option value="">— creep account —</option>
        <option value="m.osei">m.osei</option>
        <option value="svc_backup">svc_backup</option>
        <option value="j.hollis">j.hollis</option>
      </select>
      <select aria-label="Remediation for the creep account" class="${SEL_CLS}" data-field="flag-select" data-flag="creepFix">
        <option value="">— the fix —</option>
        <option value="ignore">Document &amp; ignore</option>
        <option value="revoke">Revoke &amp; recertify</option>
        <option value="promote">Grant more rights</option>
      </select>
    </div>
    ${hard ? `<select aria-label="Lifecycle action for orphaned account a.kwan" class="${SEL_CLS}" data-field="flag-select" data-flag="orphanFix">
        <option value="">— orphaned account a.kwan —</option>
        <option value="keep">Keep active</option>
        <option value="deprovision">Deprovision immediately</option>
        <option value="monitor">Keep, monitor logon</option>
      </select>` : ""}
    <p class="widget-note">gMSA switches for svc_backup / svc_web live in the Control Register → Identity management.</p>
  </div>`;
}

function matrixWidget(env) {
  return `<div class="stack-1">
    ${MATRIX_ROWS.map((r) => `
      <div class="widget-row">
        <span class="wm-label-wide">${r.id === "branch" ? "Branch depot" : r.id === "field" ? "Field laptops" : "Parts vendor"}</span>
        <select aria-label="Access method for ${esc(r.label)}" class="${SEL_CLS}" data-field="matrix" data-id="${esc(r.id)}">
          <option value="">— method —</option>
          ${MATRIX_OPTIONS.map((o) => `<option value="${esc(o.id)}">${esc(o.text)}</option>`).join("")}
        </select>
      </div>`).join("")}
  </div>`;
}

function breachWidget(env) {
  const b = env.breach;
  return `<div class="stack-1">
    <div class="grid-2">
      <select aria-label="Initial access asset" class="${SEL_CLS}" data-field="breach" data-key="initial">
        <option value="">— initial access —</option>
        ${BREACH_ANSWERS.initial.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
      </select>
      <select aria-label="Lateral movement hop" class="${SEL_CLS}" data-field="breach" data-key="hop">
        <option value="">— lateral hop —</option>
        ${BREACH_ANSWERS.hop.options.map((o) => `<option value="${esc(o.id)}">${esc(o.text)}</option>`).join("")}
      </select>
      <select aria-label="Host with beaconing behavior" class="${SEL_CLS}" data-field="breach" data-key="beacon">
        <option value="">— beaconing host —</option>
        ${BREACH_ANSWERS.beacon.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
      </select>
      <select aria-label="Design weakness one" class="${SEL_CLS}" data-field="breach" data-key="w1">
        <option value="">— weakness 1 —</option>
        ${BREACH_ANSWERS.w1.options.map((o) => `<option value="${esc(o.id)}">${esc(o.text)}</option>`).join("")}
      </select>
      <select aria-label="Design weakness two" class="${SEL_CLS} span-2" data-field="breach" data-key="w2">
        <option value="">— weakness 2 —</option>
        ${BREACH_ANSWERS.w2.options.map((o) => `<option value="${esc(o.id)}">${esc(o.text)}</option>`).join("")}
      </select>
    </div>
  </div>`;
}

function reviewWidget(env) {
  return `<div class="stack-1">
    ${REVIEW_PROPOSALS.map((p) => {
      const val = env.review[p.id];
      const seg = (v, label) => `<button type="button" aria-pressed="${val === v}" data-action="review" data-id="${p.id}" data-verdict="${v}"
        class="seg-btn ${val === v ? (v === "approve" ? "seg-ok" : "seg-no") : ""}">${label}</button>`;
      return `<div class="review-row">
        <span class="review-id">${esc(p.id)})</span>
        <span class="review-text">${esc(p.text)}</span>
        <span class="seg" role="group" aria-label="Verdict on proposal ${esc(p.id)}">${seg("approve", "Approve")}${seg("reject", "Reject")}</span>
      </div>`;
    }).join("")}
  </div>`;
}

function surfaceWidget(env) {
  return `<div class="stack-1">
    ${SURFACE_ITEMS.map((s) => `
      <label class="surface-row">
        <input type="checkbox" ${env.surface[s.id] ? "checked" : ""} class="surface-check" data-field="surface" data-id="${esc(s.id)}" aria-label="Close exposure: ${esc(s.text)}">
        <span>${esc(s.text)}</span>
      </label>`).join("")}
  </div>`;
}

function failctxWidget(env) {
  return `<div class="stack-1">
    ${FAILURE_CTX.map((c) => `
      <div class="widget-row">
        <span class="fc-label">${esc(c.label)}</span>
        <select aria-label="Failure mode for ${esc(c.label)}" class="${SEL_CLS} w-fc" data-field="failctx" data-id="${esc(c.id)}">
          <option value="">— mode —</option>
          <option value="fail-open">Fail-open</option>
          <option value="fail-closed">Fail-closed</option>
        </select>
      </div>`).join("")}
  </div>`;
}

function widgetFor(obj, env) {
  switch (obj.kind) {
    case "flows": return flowsWidget(env);
    case "zonematch": return zoneMatchWidget(env);
    case "identity": return identityWidget(env, obj.mode === "hard");
    case "matrix": return matrixWidget(env);
    case "breach": return breachWidget(env);
    case "review": return reviewWidget(env);
    case "surface": return surfaceWidget(env);
    case "failctx": return failctxWidget(env);
    default:
      return obj.id === "OBJ-H6"
        ? `<p class="widget-note">Set the proposal verdict + both toggles on the CORP ↔ OT link sheet (schematic).</p>`
        : `<p class="widget-note">Configure on the schematic / Control Register — then check.</p>`;
  }
}

// ── Objective card + tracker rail ────────────────────────────────────────────
function objectiveCardHTML(obj, env, progress, mode, animStamp) {
  const revealedHints = progress?.hintsUsed ?? 0;
  const hintBtn = mode === "medium"
    ? `<button type="button" ${revealedHints >= obj.hints.length ? "disabled" : ""} class="btn btn-outline btn-hint" data-action="hint-obj" data-id="${obj.id}">
        Hint ${revealedHints < obj.hints.length ? `(${revealedHints + 1}/${obj.hints.length})` : "used"}
      </button>`
    : `<button type="button" ${revealedHints > 0 ? "disabled" : ""} title="One nudge allowed — it costs a star credit" class="btn btn-nudge" data-action="hint-obj" data-id="${obj.id}">
        ${revealedHints > 0 ? "nudge used" : "nudge (−cost)"}
      </button>`;
  return paper(`
    <div class="obj-topline">
      <span class="obj-id">${obj.id}</span>
      ${pillarBadge(obj.pillar)}
    </div>
    <h3 class="obj-title">${esc(obj.title)}</h3>
    <p class="obj-brief">${esc(obj.brief)}</p>
    ${obj.kind === "env" ? `<button type="button" class="btn btn-mini" data-action="go-schematic">↗ open schematic / register</button>` : ""}
    <div class="mt-2">${widgetFor(obj, env)}</div>
    <div class="obj-actions">
      <button type="button" class="btn btn-solid obj-check" data-action="check-obj" data-id="${obj.id}">Check result</button>
      ${hintBtn}
    </div>
    ${revealedHints > 0
      ? `<ul class="hints-box">${obj.hints.slice(0, revealedHints).map((h, i) => `<li><b class="hint-tag">H${i + 1}·</b> ${esc(h)}</li>`).join("")}</ul>`
      : ""}
    ${progress && progress.attempts > 0
      ? `<div class="${progress.last ? "fb fb-pass" : "fb fb-fail"}">
          <div class="fb-head">
            <span class="fb-stamp">
              ${stamp(progress.passed ? "approved" : "revise", animStamp)}
              ${!progress.last && progress.passed ? `<span class="fb-latest">latest check: revise</span>` : ""}
            </span>
            <span class="fb-attempts">attempts: ${progress.attempts}</span>
          </div>
          <p class="fb-body">${esc(progress.last ? obj.passFeedback : obj.failFeedback)}</p>
        </div>`
      : ""}
    <p class="obj-anchor">anchors: ${esc(obj.anchor)}</p>
  `, progress?.passed ? "p-3 obj-passed" : "p-3");
}

function trackerRailHTML(state, objectives, mode) {
  const env = state.env;
  const pillarStats = {};
  for (const o of objectives) {
    pillarStats[o.pillar] ??= { total: 0, passed: 0 };
    pillarStats[o.pillar].total += 1;
    if (state.obj[o.id]?.passed) pillarStats[o.pillar].passed += 1;
  }
  const passedCount = objectives.filter((o) => state.obj[o.id]?.passed).length;

  const cards = objectives
    .map((o) => {
      const p = state.obj[o.id];
      // stamp animation plays only when a fresh check result arrives (parity with React remount)
      const anim = app.local.stampAnim[o.id] === true;
      return objectiveCardHTML(o, env, p, mode, anim);
    })
    .join("");

  return `<div class="stack-3">
    ${paper(`
      <div class="trk-head">
        ${mono(`review checklist — REV ${mode === "medium" ? "A" : "B"}`)}
        <span class="trk-count">${passedCount}/${objectives.length} approved</span>
      </div>
      <div class="progress" role="progressbar" aria-valuenow="${passedCount}" aria-valuemin="0" aria-valuemax="${objectives.length}" aria-label="Objectives approved">
        <div class="progress-fill" style="width:${(passedCount / objectives.length) * 100}%"></div>
      </div>
      <div class="pillar-chips">
        ${Object.entries(pillarStats).map(([p, s]) =>
          `<span class="pillar-chip ${s.passed === s.total ? "chip-done" : ""}" title="${esc(PILLAR_LABEL[p])}">${p} ${s.passed}/${s.total}</span>`).join("")}
      </div>
    `, "p-3 trk-sticky")}

    ${cards}

    ${paper(`
      <p class="trk-note">When every finding is approved and the board exam is graded, the <strong>commissioning certificate</strong> unlocks.</p>
      <button type="button" ${passedCount < objectives.length ? "disabled" : ""} class="btn btn-cert w-full" data-action="claim-cert">
        ${passedCount < objectives.length ? `Approve all findings to claim (${passedCount}/${objectives.length})` : "Claim commissioning certificate"}
      </button>
    `, "p-3")}
  </div>`;
}

// ── Evidence binder ──────────────────────────────────────────────────────────
function evidenceBinderHTML(binderTab) {
  const TABS = [{ id: "manual", tab: "Field Manual" }, ...EVIDENCE.map((e) => ({ id: e.id, tab: e.tab }))];
  const doc = EVIDENCE.find((e) => e.id === binderTab);
  const tabs = TABS.map((t) =>
    `<button type="button" role="tab" aria-selected="${binderTab === t.id}" class="binder-tab ${binderTab === t.id ? "active" : ""}" data-action="binder-tab" data-tab="${esc(t.id)}">${esc(t.tab)}</button>`).join("");

  const manual = `<div class="stack-4">
    ${sheetHeading("KC-1", "Field Manual — Objective 3.2")}
    <section>
      <h4 class="fm-h">What you are managing</h4>
      <p class="fm-p">${esc(FIELD_MANUAL.what)}</p>
    </section>
    <section>
      <h4 class="fm-h">How it works — the four moves</h4>
      <p class="fm-p">${esc(FIELD_MANUAL.how)}</p>
    </section>
    <section>
      <h4 class="fm-h">Why attackers care</h4>
      <p class="fm-p">${esc(FIELD_MANUAL.why)}</p>
    </section>
    <section>
      <h4 class="fm-h">Defender's chain position</h4>
      <p class="fm-p">${esc(FIELD_MANUAL.chain)}</p>
    </section>
    <section>
      ${sheetHeading("KC-2", "Glossary")}
      <dl class="glossary">
        ${GLOSSARY.map((g) => `<div class="gloss-row"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join("")}
      </dl>
    </section>
  </div>`;

  const docHtml = doc
    ? `<article>
        ${mono(`${doc.id} · evidence`)}
        <h3 class="doc-title">${esc(doc.title)}</h3>
        <pre class="doc-pre ${doc.mono ? "doc-mono" : ""}">${esc(doc.body)}</pre>
      </article>`
    : "";

  return paper(`
    <div class="binder-strip">
      <div role="tablist" aria-label="Evidence binder sections" class="binder-tabs scroll-thin">${tabs}</div>
    </div>
    <div class="binder-panel scroll-thin" role="tabpanel" aria-label="Binder content">${binderTab === "manual" ? manual : docHtml}</div>
  `, "binder");
}

// ── Debrief (as-built package) ───────────────────────────────────────────────
const DETECTIONS = [
  {
    control: "Zones + DMZ boundary policy",
    telemetry: "Perimeter & inter-zone firewall logs, denied-flow records",
    logic: `denied = filter_logs(zone_src="DMZ", zone_dst="CORP", action="deny")
alert if count(unique(src)) spikes OR any allow-rule outside the documented allow-list fires`,
  },
  {
    control: "802.1X / NAC quarantine",
    telemetry: "RADIUS auth logs, NAC posture results, quarantine VLAN dwell",
    logic: `alert if event.type=="nac.quarantine" and dwell_hours > 24
alert if auth.method!="802.1X" and port.role=="user"`,
  },
  {
    control: "VPN / Zero Trust remote access",
    telemetry: "VPN gateway auth logs (MFA result), posture verdicts",
    logic: `alert if vpn.session.mfa == false
alert if vpn.session.posture == "fail" and session.granted == true`,
  },
  {
    control: "East-west movement (IR-2411 pattern)",
    telemetry: "Netflow / Zeek SMB logs between user and server VLANs",
    logic: `alert on flow(src_vlan="USER", dst_vlan="SERVER", proto=445)
        where src not in allowlist(workstation->fileserver)   # T1021.002 pattern`,
  },
  {
    control: "Beaconing to internet (IR-2411 F-01)",
    telemetry: "Proxy/DNS logs, flow regularity analytics",
    logic: `alert if flow.dst in watchlist(external) and
        interval stddev < 5s over >= 20 connections          # T1071 pattern`,
  },
  {
    control: "Identity hygiene",
    telemetry: "AD entitlement changes, service-account interactive logons",
    logic: `alert if account.type=="service" and logon.type=="interactive"
alert if gmsa.password_age > 30d        # gMSA should self-rotate`,
  },
];
const MITIGATIONS = [
  { finding: "Flat internal network / no zones", mitre: "Network Segmentation", id: "M1030", url: "https://attack.mitre.org/mitigations/M1030/" },
  { finding: "Unfiltered DMZ↔internal and perimeter paths", mitre: "Filter Network Traffic", id: "M1037", url: "https://attack.mitre.org/mitigations/M1037/" },
  { finding: "Privilege creep, weak account lifecycle", mitre: "Account Use Policies", id: "M1036", url: "https://attack.mitre.org/mitigations/M1036/" },
  { finding: "Shared/static service credentials, admin sprawl", mitre: "Privileged Account Management", id: "M1026", url: "https://attack.mitre.org/mitigations/M1026/" },
  { finding: "Cleartext FTP and ops chat (data in motion)", mitre: "Encrypt Sensitive Information", id: "M1041", url: "https://attack.mitre.org/mitigations/M1041/" },
  { finding: "Legacy FTP service still exposed on WEB-01", mitre: "Disable or Remove Feature or Program", id: "M1042", url: "https://attack.mitre.org/mitigations/M1042/" },
];
const LATERAL = { name: "Remote Services: SMB/Admin Shares", id: "T1021.002", url: "https://attack.mitre.org/techniques/T1021/002/" };
const BEACON = { name: "Application Layer Protocol (web)", id: "T1071", url: "https://attack.mitre.org/techniques/T1071/" };

function debriefHTML(mode) {
  return `<div class="stack-4">
    ${paper(`
      ${sheetHeading("AB-1", "As-built package — detection opportunities")}
      <p class="debrief-lede">Every control you placed also created telemetry. These are the detection beats this architecture owes you (example logic is simplified).</p>
      <div class="stack-2 mt-3">
        ${DETECTIONS.map((d) => `
          <div class="detect-block">
            <p class="detect-control">${esc(d.control)}</p>
            <p class="detect-telemetry">Telemetry: ${esc(d.telemetry)}</p>
            <pre class="detect-logic">${esc(d.logic)}</pre>
          </div>`).join("")}
      </div>
    `, "p-4")}

    ${paper(`
      ${sheetHeading("AB-2", "Mitigation recommendations (official IDs)")}
      <div class="mit-table-wrap scroll-thin">
        <table class="mit-table">
          <thead>
            <tr><th>Design decision</th><th>MITRE mitigation</th><th>ID</th></tr>
          </thead>
          <tbody>
            ${MITIGATIONS.map((m) => `
              <tr>
                <td>${esc(m.finding)}</td>
                <td>${esc(m.mitre)}</td>
                <td><a href="${m.url}" target="_blank" rel="noopener noreferrer" class="mit-link">${esc(m.id)} ↗</a></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="mit-note">Attack-chain context for the incident you rebuilt: lateral movement over
        <a href="${LATERAL.url}" target="_blank" rel="noopener noreferrer" class="mit-link">${LATERAL.id} · ${LATERAL.name} ↗</a> and outbound
        <a href="${BEACON.url}" target="_blank" rel="noopener noreferrer" class="mit-link">${BEACON.id} · ${BEACON.name} ↗</a>. (IDs verified against official ATT&CK pages.)</p>
    `, "p-4")}

    <div class="grid-2-lg">
      ${paper(`
        ${sheetHeading("AB-3", "Blue-team takeaways")}
        <ul class="takeaways">
          <li>Placement is a control: where an asset lives decides its blast radius before any rule is written.</li>
          <li>Default-deny at every zone boundary, with documented explicit allows — then alert on the denials, not just the allows.</li>
          <li>Verify user (MFA) + device (posture) + application (ZTNA) — never one alone; that trio is Zero Trust in practice.</li>
          <li>Admin paths get their own architecture: jump box, OOB wire, TACACS+ per-command accounting.</li>
          <li>Identity decays: schedule entitlement recertification, adopt gMSAs, deprovision at separation.</li>
          <li>Decide failure modes deliberately and record them — a control without a failure-mode decision is a latent incident.</li>
        </ul>
      `, "p-4")}
      ${paper(`
        ${sheetHeading("AB-4", "Red-team mindset (defensive use)")}
        <ul class="takeaways">
          <li>First recon question: what is internet-facing and where does it sit? A DMZ-less portal is a free first hop.</li>
          <li>Flat east-west traffic is the highway; SMB/445 from a user VLAN is the classic wheel (IR-2411 step 2).</li>
          <li>Implicit trust inside the perimeter means one phish equals many systems — trust must be re-proven per request.</li>
          <li>Static service credentials outlive every incident response; they are the gift that keeps giving.</li>
          <li>Convenience proposals (split-for-all, flat + host firewall) are attacker-friendly even when well-meant.</li>
          <li>Unpatchable OT hosts are not unsolvable — isolation + one-way data flow beat any exploit you can carry inward.</li>
        </ul>
      `, "p-4")}
    </div>

    ${paper(`
      ${sheetHeading("AB-5", "Official references")}
      <ul class="refs">
        <li><a class="ref-link" target="_blank" rel="noopener noreferrer" href="https://www.comptia.org/en-us/certifications/security/v8/">CompTIA Security+ V8 (SY0-801) — official certification page ↗</a></li>
        <li><a class="ref-link" target="_blank" rel="noopener noreferrer" href="https://attack.mitre.org/mitigations/M1030/">MITRE ATT&amp;CK M1030 Network Segmentation ↗</a></li>
        <li><a class="ref-link" target="_blank" rel="noopener noreferrer" href="https://attack.mitre.org/mitigations/M1037/">MITRE ATT&amp;CK M1037 Filter Network Traffic ↗</a></li>
        <li><a class="ref-link" target="_blank" rel="noopener noreferrer" href="https://attack.mitre.org/techniques/T1021/">MITRE ATT&amp;CK T1021 Remote Services ↗</a></li>
      </ul>
      ${mono("exam mapping: SY0-801 domain 3 (19%) · objective 3.2 — infrastructure considerations, zero trust, secure communication/access, identity management, failure modes", "mt-2 block")}
      <p class="refs-mode">Mode played: ${mode === "medium" ? "Revision A — guided design review" : "Revision B — independent design audit"}. All mitigation/technique links open the official MITRE pages in a new tab.</p>
    `, "p-4")}
  </div>`;
}

// ── Completion modal (commissioning certificate) ─────────────────────────────
function starsHTML(n) {
  return `<span role="img" aria-label="${n} of 3 stars" class="stars">${"★".repeat(n)}<span class="stars-off">${"★".repeat(3 - n)}</span></span>`;
}

function completionModalHTML(state, objectives, mode) {
  const score = computeScore(state, objectives);
  const stars = computeStars(state, objectives);

  const pillarRecap = {};
  for (const o of objectives) {
    pillarRecap[o.pillar] ??= { passed: [], missed: [] };
    (state.obj[o.id]?.passed ? pillarRecap[o.pillar].passed : pillarRecap[o.pillar].missed).push(o.id.replace(/^OBJ-[MH]\d+$/, (m) => m.replace("OBJ-", "")));
  }
  const focusAreas = deriveFocusAreas(state, objectives);

  return `<div class="overlay" data-overlay="cert">
    <div class="modal-card cert-card" role="dialog" aria-modal="true" aria-labelledby="cert-title" aria-describedby="cert-desc">
      <div class="cert-inner vellum-grid">
        <div class="modal-head">
          ${mono("design review board · northwind freight & terminal co. (fictional)")}
          <h2 id="cert-title" class="modal-title">Commissioning certificate</h2>
          <p id="cert-desc" class="modal-desc">Security Architecture Review — SY0-801 Objective 3.2 — Revision ${mode === "medium" ? "A (guided)" : "B (audit)"}</p>
        </div>
        <div class="cert-stats">
          ${paper(`<div class="stat-cell">${mono("final score")}<p class="stat-big">${score.score}%</p><p class="stat-sub">${score.passed}/${score.objTotal} findings · ${score.correct}/${score.quizTotal} exam</p></div>`, "p-3 text-center")}
          ${paper(`<div class="stat-cell">${mono("rating")}<div class="mt-1">${starsHTML(stars)}</div><p class="stat-sub">first-attempt accuracy &amp; hint use</p></div>`, "p-3 text-center")}
          ${paper(`<div class="stat-cell">${mono("status")}<p class="stat-status">Commissioned</p><p class="stat-sub">all findings approved · exam graded</p></div>`, "p-3 text-center")}
        </div>
        <!-- R8 — focus areas from actual performance evidence -->
        <div class="focus-box">
          ${mono("focus areas for your next pass", "focus-label")}
          ${focusAreas.length === 0
            ? `<p class="focus-empty">Clean sheet: every finding approved on the first check and every exam item correct — nothing to flag from
              your evidence. For depth, re-run the other revision (A ↔ B) and map each placed control to its MITRE
              mitigation in the As-Built package (AB-2).</p>`
            : `<ul class="focus-list">
                ${focusAreas.map((f, i) => `<li class="focus-item" key="${i}"><p class="focus-title">${esc(f.title)}</p><p class="focus-detail">${esc(f.detail)}</p></li>`).join("")}
              </ul>`}
        </div>
        <div class="cert-recap">
          ${mono("mastery recap by pillar")}
          <div class="recap-grid">
            ${Object.entries(pillarRecap).map(([p, r]) => `
              ${paper(`
                ${pillarBadge(p)}
                <p class="recap-count ${r.missed.length === 0 ? "recap-ok" : "recap-no"}">${r.passed.length}/${r.passed.length + r.missed.length} approved</p>
                <p class="recap-note">${r.missed.length === 0 ? `Solid — ${esc(PILLAR_LABEL[p])} fully demonstrated.` : `Revisit (from the debrief): ${esc(r.missed.join(", "))}.`}</p>
              `, "p-3")}
            `).join("")}
          </div>
        </div>
        <div class="cert-next">
          ${mono("what to learn next")}
          <ul class="next-list">
            <li><strong>3.3</strong> — data protection: classifications, states, methods and data roles.</li>
            <li><strong>3.4</strong> — resilience &amp; recovery: redundancy, backups, DR metrics (RTO/RPO).</li>
            <li>Re-run the other revision (A ↔ B) with a clean sheet — the audit mode plays stricter and broader.</li>
            <li>Walk the official links in the As-Built package (AB-5) and map each control you placed to its MITRE mitigation.</li>
          </ul>
        </div>
        <button type="button" class="btn btn-solid w-full cert-return" data-action="close-cert">Return to the drawing</button>
      </div>
    </div>
  </div>`;
}

// ── Reset confirmation dialog (Radix AlertDialog equivalent) ─────────────────
function resetDialogHTML() {
  return `<div class="overlay" data-overlay="reset">
    <div class="modal-card reset-card" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">
      <h2 id="reset-title" class="reset-title">Reset the lab?</h2>
      <p id="reset-desc" class="reset-desc">
        This stamps the whole sheet blank: mode, placement, every control, objective approvals and the board exam return to pristine state. This cannot be undone.
      </p>
      <div class="reset-actions">
        <button type="button" class="btn btn-outline" data-action="reset-cancel">Keep working</button>
        <button type="button" class="btn btn-danger-solid" data-action="reset-confirm">Reset everything</button>
      </div>
    </div>
  </div>`;
}
