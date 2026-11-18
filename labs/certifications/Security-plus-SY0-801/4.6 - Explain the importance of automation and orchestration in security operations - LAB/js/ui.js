/* =====================================================================
 * ui.js — inline SVG icons + render functions (template-string based)
 * Re-renders section containers on state change. Slider updates its own
 * readout directly to avoid drag jank.
 * ===================================================================== */

(function () {
  const D = window.LAB_DATA;
  const S = window.LAB_STORE;

  /* ---------- HTML escape ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ---------- Inline SVG icons (Lucide-style, 24x24 stroke) ---------- */
  const ICONS = {
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    "refresh-cw": '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "building-2": '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>',
    "alert-triangle": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.016-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    workflow: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/><path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/>',
    layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    cog: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    "shield-alert": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    "shield-question": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    sliders: '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',
    ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
    "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>',
    "trending-up": '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
    "check-circle": '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    "x-circle": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "arrow-up": '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    "arrow-down": '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    "trash-2": '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    swords: '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="13" y2="17"/><line x1="7" x2="5" y1="15" y2="17"/><line x1="16" x2="14.5" y1="4.5" y2="6"/>',
    "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.786a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.595a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15M9 3.236v15"/>',
    stethoscope: '<path d="M11 2v2M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
    "circle-alert": '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    "bar-chart-3": '<path d="M3 3v16h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  };
  function icon(name, cls) {
    const inner = ICONS[name] || "";
    return `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>`;
  }

  /* ---------- progress ring (SVG) ---------- */
  function ring(value, size, stroke) {
    size = size || 44; stroke = stroke || 4;
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const v = Math.max(0, Math.min(1, value));
    const off = c * (1 - v);
    return `<svg class="progress-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#1e293b" stroke-width="${stroke}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#fbbf24" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size/2} ${size/2})" style="transition:stroke-dashoffset .5s"/>
      <text class="ring-text" x="50%" y="50%" dy="0.35em" text-anchor="middle">${Math.round(v*100)}</text>
    </svg>`;
  }

  /* ---------- pillar badge ---------- */
  function pillarBadge(p) {
    return `<span class="pillar-badge pillar-${p}"><span class="dot"></span>${D.PILLAR_LABEL[p]}</span>`;
  }

  /* ---------- objective check ---------- */
  function objectiveCheck(objId, compact, jumpTab) {
    const st = S.getState();
    const mode = st.mode;
    const obj = D.objectivesFor(mode).find(o => o.id === objId);
    if (!obj) return "";
    const os = st.objectiveStates[objId] || {};
    const passed = !!os.completed;
    const nearMiss = !!os.lastNearMiss;
    const lastMessage = os.lastMessage || "";
    const hintsRevealed = os.hintsRevealed || 0;
    const isHard = mode === "hard";
    const maxHints = obj.hints.length;

    if (compact) {
      const num = objId.replace("OBJ-M","").replace("OBJ-H","");
      return `<div class="obj-compact ${passed?"passed":""}">
        <div class="obj-compact-row">
          <span class="obj-compact-dot">${passed ? icon("check-circle") : esc(num)}</span>
          <div class="min-w-0" style="flex:1">
            <p class="obj-compact-title">${esc(obj.title)}</p>
            <div class="mt-2" style="margin-top:.25rem">${pillarBadge(obj.pillar)}</div>
          </div>
          ${jumpTab!=null ? `<button class="btn btn-ghost btn-sm" data-action="jump" data-tab="${esc(jumpTab)}" aria-label="Jump to ${esc(obj.title)}">${icon("chevron-right")}</button>` : ""}
        </div>
        ${!passed && lastMessage ? `<p class="obj-compact-msg">${esc(lastMessage)}</p>` : ""}
        ${!passed ? `<button class="btn btn-primary btn-sm" style="margin-top:.5rem;width:100%" data-action="check" data-obj="${esc(objId)}">Check</button>` : ""}
      </div>`;
    }

    const bannerStatus = passed ? "pass" : nearMiss ? "nearmiss" : lastMessage ? "fail" : "idle";
    let hintsHtml = "";
    if (maxHints > 0 && !passed) {
      const revealed = [];
      for (let i = 0; i < hintsRevealed; i++) revealed.push(`<div class="hint-row">${icon("lightbulb")}<span>${esc(obj.hints[i])}</span></div>`);
      hintsHtml = revealed.join("");
      if (hintsRevealed < maxHints) {
        hintsHtml += `<button class="hint-btn" data-action="hint" data-obj="${esc(objId)}">${icon("lightbulb")} ${hintsRevealed===0?"Reveal hint":"Reveal next hint"} (${hintsRevealed}/${maxHints})</button>`;
      }
    }
    return `<div class="objcheck ${passed?"passed":""}">
      <div class="objcheck-meta">
        <span class="objcheck-id">${esc(objId)}</span>
        ${pillarBadge(obj.pillar)}
        ${isHard && maxHints>0 ? `<span class="dim" style="font-size:10px;color:#fda4af">1 nudge · costs score</span>` : ""}
      </div>
      <h4 class="objcheck-title">${esc(obj.title)}</h4>
      <p class="objcheck-instr">${esc(obj.instruction)}</p>
      ${hintsHtml ? `<div style="margin-top:.5rem">${hintsHtml}</div>` : ""}
      <div class="objcheck-actions">
        ${!passed ? `<button class="btn btn-primary btn-sm" data-action="check" data-obj="${esc(objId)}">Check Results</button>` : `<span class="passed-note">${icon("check-circle")} Objective complete</span>`}
        ${passed ? `<p class="why-note"><span style="color:var(--text)">Why it matters: </span>${esc(obj.feedback)}</p>` : ""}
      </div>
      ${lastMessage ? `<div class="objcheck-feedback"><div class="feedback ${bannerStatus}">${esc(lastMessage)}</div></div>` : ""}
    </div>`;
  }

  /* ---------- mode select ---------- */
  function modeSelect() {
    return `<div class="mode-screen">
      <div class="mode-strip"></div>
      <div class="mode-wrap">
        <div style="max-width:48rem;width:100%;text-align:center">
          <span class="mode-pill">${icon("activity","1em")} CompTIA Security+ SY0-801 — Lesson 4.6</span>
          <h1 class="mode-h1">The Automation Operations Floor</h1>
          <p class="mode-lede">Explain the importance of automation and orchestration in security operations — improve efficiency through automation, integrations, and AI-assisted workflows. A single self-contained practice lab. Choose how you want to work the floor.</p>
        </div>
        <div class="mode-grid">
          ${modeCard("medium","amber","Learn the floor","Understand &amp; Apply",icon("zap"),[
            "12 guided objectives across all four pillars","Up to 3 hints per objective (nudge → direction → demo)","Tolerant validation with teaching feedback"])}
          ${modeCard("hard","emerald","Run the floor","Analyze &amp; Evaluate",icon("brain"),[
            "8 deep, multi-step challenges","Minimal guidance — at most one score-costing nudge","Strict validation; near-misses explicitly rejected"])}
        </div>
        <p class="mode-foot">12 Medium objectives · 8 Hard objectives · synthetic training data only · no navigation, no footer — this is the whole world.</p>
      </div>
    </div>`;
  }
  function modeCard(mode, accent, title, tag, ic, points) {
    const pts = points.map(p => `<li>${icon("shield-check", accent==="amber"?"var(--amber-300)":"var(--emerald-300)")}<span>${p}</span></li>`).join("");
    return `<button class="mode-card ${accent}" data-action="set-mode" data-mode="${mode}">
      <div class="row between">
        <span class="mode-tag ${accent}">${ic}${tag}</span>
        <span class="mode-arrow">${icon("arrow-right")}</span>
      </div>
      <h2 class="mode-h2">${mode==="medium"?"Medium":"Hard"} — ${title}</h2>
      <p class="mode-desc">${mode==="medium"?"Guided progression through 12 granular objectives. Tiered hints, tolerant checks, a supportive quiz. Best if you are learning automation & orchestration for the first time.":"Scenario-first, discovery-based. 8 broad multi-step challenges with noisy evidence, red herrings, and strict checks. Best if you already know the material and want to prove mastery."}</p>
      <ul class="mode-points">${pts}</ul>
    </button>`;
  }

  /* ---------- top bar ---------- */
  function topbar() {
    const st = S.getState();
    const objs = D.objectivesFor(st.mode);
    const completed = objs.filter(o => st.objectiveStates[o.id]?.completed).length;
    const total = objs.length;
    const progress = total ? completed/total : 0;
    const hintsUsed = objs.reduce((a,o) => a + (st.objectiveStates[o.id]?.hintsUsed||0), 0);
    const allDone = total>0 && completed===total;
    const ready = allDone && st.quizFinished;
    return `<header class="topbar">
      <div class="topbar-inner">
        <span class="brand-mark">${icon("cpu")}</span>
        <div class="min-w-0">
          <p class="brand-title">Automation Operations Floor</p>
          <p class="brand-sub">Sec+ SY0-801 · 4.6 Automation &amp; Orchestration</p>
        </div>
        <div class="topbar-stats">
          <span class="stat-chip">${icon("activity","var(--emerald-400)")}<span style="color:var(--text);font-weight:500">${st.mode==="hard"?"HARD":"MEDIUM"}</span><span class="dim">·</span><span>${completed}/${total}</span></span>
          <span class="stat-chip">hints <span style="color:var(--amber-300);font-weight:500">${hintsUsed}</span></span>
          ${ready ? `<button class="btn btn-ghost btn-sm" data-action="reopen-report" aria-label="Open completion report">${icon("trophy","var(--amber-300)")}<span class="label">Report</span></button>` : ""}
          <button class="btn btn-ghost btn-sm" data-action="open-glossary" aria-label="Open glossary">${icon("book-open")}<span class="label">Glossary</span></button>
          <button class="btn btn-ghost btn-sm" data-action="open-reset" aria-label="Reset lab" style="color:var(--text-muted)">${icon("refresh-cw")}<span class="label">Reset</span></button>
          <div class="stat-chip" style="padding:.25rem .5rem">${ring(progress, 34, 3)}</div>
        </div>
      </div>
      <div class="telemetry-bar"><div class="telemetry-fill" style="width:${Math.round(progress*100)}%"></div></div>
    </header>`;
  }

  /* ---------- briefing ---------- */
  function briefing() {
    const st = S.getState();
    const open = st.briefingOpen;
    return `<section class="panel">
      <button class="collapse-btn" aria-expanded="${open}" data-action="toggle-briefing">
        <span class="brand-mark" style="background:rgba(245,158,11,.15);color:var(--amber)">${icon("building-2")}</span>
        <span style="flex:1"><span class="brand-title">Scenario Briefing — Northwind Financial SOC</span><br><span class="brand-sub">Fictional organization · synthetic training data</span></span>
        <span class="collapse-icon">${icon("chevron-down")}</span>
      </button>
      <div class="collapse-body" style="${open?"":"max-height:0;opacity:0"}>
        <div style="padding:1rem">
          <p style="font-size:.8125rem;color:var(--text-muted);line-height:1.5;margin:0 0 .75rem">You are the newest analyst on the <span style="color:var(--amber-300);font-weight:500">Northwind Financial</span> Security Operations team. Northwind processes millions of transactions daily and runs a 24/7 SOC that, until recently, triaged alerts by hand. The queue was drowning: <span style="color:var(--text)">2,100 alerts per shift</span>, ransomware near-misses, and a 4-hour partner-domain outage caused by an automation misfire last quarter.</p>
          <p style="font-size:.8125rem;color:var(--text-muted);line-height:1.5;margin:0 0 .75rem">Your CISO has green-lit a <span style="color:var(--emerald-300);font-weight:500">Security Automation &amp; Orchestration</span> initiative built on a SOAR platform. Your job today: work the Automation Operations Floor — wire the integrations, build the playbooks, tune the detections, configure the AI-assisted workflows, route the alert storm, and read the metrics that prove it all works.</p>
          <div class="explain-grid" style="grid-template-columns:1fr 1fr 1fr">
            ${briefCallout("amber","alert-triangle","Why it matters","Manual triage cannot keep up with modern attack speed. Automation shrinks MTTD/MTTR from hours to seconds.")}
            ${briefCallout("emerald","graduation-cap","Cert relevance","Maps to CompTIA Security+ SY0-801 Domain 4.6 — automation, integrations, AI-assisted workflows.")}
            ${briefCallout("cyan","building-2","Real-world","Every artifact here is synthetic and labeled. MITRE IDs referenced are accurate to the official source.")}
          </div>
        </div>
      </div>
    </section>`;
  }
  function briefCallout(tone, ic, title, body) {
    return `<div class="explain-card ${tone}"><p style="display:flex;align-items:center;gap:.375rem;font-weight:600;margin:0;font-size:.75rem">${icon(ic)}${title}</p><p style="margin:.25rem 0 0;color:var(--text-muted);font-size:.6875rem">${body}</p></div>`;
  }

  /* ---------- knowledge core ---------- */
  function knowledgeCore() {
    const st = S.getState();
    const open = st.knowledgeOpen;
    return `<section class="panel" id="knowledge-core">
      <button class="collapse-btn" aria-expanded="${open}" data-action="toggle-knowledge">
        <span class="brand-mark" style="background:rgba(34,211,238,.15);color:var(--cyan-300)">${icon("book-open")}</span>
        <span style="flex:1"><span class="brand-title">Knowledge Core</span><br><span class="brand-sub">What / how / why · scenarios · interactive concept checks</span></span>
        <span class="collapse-icon">${icon("chevron-down")}</span>
      </button>
      <div class="collapse-body" style="${open?"":"max-height:0;opacity:0"}">
        <div style="padding:1rem">
          <div class="explain-grid">
            ${explainCard("amber","workflow","Automation","A single task performed by a machine with reduced or no human intervention — parsing alerts, enriching indicators, isolating a host. The atomic unit.")}
            ${explainCard("cyan","layers","Orchestration","Coordinating many automated tasks and the tools they touch into one coherent end-to-end workflow: detect → enrich → decide → respond.")}
            ${explainCard("emerald","sparkles","SOAR + AI","The platform that hosts playbooks, manages API keys, and reports on execution — increasingly augmented by ML/UEBA detection and generative-AI summaries.")}
          </div>
          <p style="font-size:.8125rem;color:var(--text-muted);line-height:1.5;margin:.75rem 0"><span style="color:var(--text);font-weight:500">Why attackers force this shift:</span> modern attacks move in minutes — ransomware (MITRE <a href="https://attack.mitre.org/techniques/T1486/" target="_blank" rel="noopener">T1486</a>) can encrypt thousands of files before a human reads the first alert. Automation shrinks MTTD/MTTR from hours to seconds; orchestration chains the tools (SIEM, EDR, firewall, IAM, threat intel) so detection becomes response; and AI-assisted workflows catch the novel behavior that static rules miss. The trade-off: automation scales mistakes just as fast, so guardrails (health monitoring, human-in-the-loop, freshness checks) are mandatory.</p>
          <details style="border:1px solid var(--border);background:var(--panel-2);border-radius:var(--r-md);margin-top:.5rem">
            <summary style="cursor:pointer;list-style:none;padding:.5rem .75rem;font-size:.6875rem;font-weight:600;color:var(--text-muted);display:flex;gap:.5rem;align-items:center">${icon("chevron-down")} Real-world procedure examples (synthetic, MITRE-mapped)</summary>
            <div class="scenario-grid" style="padding:.5rem .75rem .75rem">${D.SCENARIOS.map(s => `<div class="scenario-card"><h5>${esc(s.title)}</h5><p class="mitre">${esc(s.mitre)}</p><p>${esc(s.body)}</p></div>`).join("")}</div>
          </details>
          <div class="kc-pair" style="margin-top:1rem">${matchBoard()}${conceptCategorizer()}</div>
          <div style="margin-top:.75rem;display:flex;flex-direction:column;gap:.75rem">
            ${objectiveCheck("OBJ-M1")}${objectiveCheck("OBJ-M2")}
          </div>
        </div>
      </div>
    </section>`;
  }
  function explainCard(tone, ic, title, body) {
    return `<div class="explain-card ${tone}"><p style="display:flex;align-items:center;gap:.375rem;font-weight:600;margin:0;font-size:.875rem">${icon(ic)}${title}</p><p style="margin:.25rem 0 0;color:var(--text-muted);font-size:.75rem">${body}</p></div>`;
  }
  function matchBoard() {
    const st = S.getState();
    const sel = st.selectedTerm;
    const assignedDefs = new Set(Object.values(st.env.matches));
    const terms = D.BENEFIT_TERMS_SHUFFLED.map(t => {
      const a = st.env.matches[t.termId];
      const isSel = sel === t.termId;
      return `<button class="term-btn ${isSel?"sel":""} ${a?"assigned":""}" data-action="select-term" data-term="${esc(t.termId)}">
        <span style="font-weight:500">${esc(t.term)}</span>
        <span class="assigned-def ${a?"":"empty"}">${a ? esc(D.BENEFIT_DEFS_SHUFFLED.find(d=>d.id===a)?.text) : "— pick a definition —"}</span>
      </button>`;
    }).join("");
    const defs = D.BENEFIT_DEFS_SHUFFLED.map(d => {
      const usedBy = Object.entries(st.env.matches).find(([,v]) => v===d.id)?.[0];
      const used = !!usedBy;
      return `<button class="def-btn ${used?"used":""} ${(!used && sel)?"sel":""}" data-action="assign-def" data-def="${esc(d.id)}" ${(!sel||used)?"disabled":""}>${esc(d.text)}</button>`;
    }).join("");
    return `<div class="match-board">
      <p style="font-size:.75rem;font-weight:600;color:var(--text);margin:0">Match each benefit to its definition</p>
      <p style="font-size:.6875rem;color:var(--text-dim);margin:.25rem 0 0">Select a term, then click its definition.</p>
      <div style="margin-top:.75rem;display:flex;flex-direction:column;gap:.5rem">${terms}</div>
      <div style="margin-top:.75rem;display:flex;flex-direction:column;gap:.375rem">${defs}</div>
    </div>`;
  }
  function conceptCategorizer() {
    const st = S.getState();
    const items = D.CONCEPT_ITEMS.map(item => {
      const chips = D.CONCEPT_CATEGORIES.map(c => {
        const active = st.env.categories[item.id] === c.id;
        return `<button class="cat-chip ${active?"active":""} ${c.id}" data-action="set-cat" data-item="${esc(item.id)}" data-cat="${esc(c.id)}">${esc(c.label)}</button>`;
      }).join("");
      return `<div class="cat-item"><p>${esc(item.text)}</p><div class="cat-chips">${chips}</div></div>`;
    }).join("");
    return `<div class="match-board"><p style="font-size:.75rem;font-weight:600;color:var(--text);margin:0">Categorize each statement</p><p style="font-size:.6875rem;color:var(--text-dim);margin:.25rem 0 0">Automation · Orchestration · SOAR</p><div style="margin-top:.75rem;display:flex;flex-direction:column;gap:.5rem">${items}</div></div>`;
  }

  /* ---------- console tabs ---------- */
  const TAB_META = [
    { key:"playbook", label:"Playbook", icon:"workflow" },
    { key:"integrations", label:"Integrations", icon:"network" },
    { key:"triage", label:"Triage", icon:"inbox" },
    { key:"detection", label:"Detection", icon:"sliders" },
    { key:"ai", label:"AI Workflows", icon:"sparkles" },
    { key:"metrics", label:"Metrics", icon:"bar-chart-3" },
    { key:"postmortem", label:"Post-Mortem", icon:"stethoscope" },
    { key:"roadmap", label:"Roadmap", icon:"map", hardOnly:true },
  ];
  function console() {
    const st = S.getState();
    const tabs = TAB_META.filter(t => !t.hardOnly || st.mode==="hard");
    const tablist = tabs.map(t => `<button class="tab" data-active="${st.activeTab===t.key}" data-action="set-tab" data-tab="${t.key}">${icon(t.icon)}<span class="label">${t.label}</span></button>`).join("");
    const panel = renderPanel(st.activeTab);
    return `<div class="section-label"><span class="pulse"></span><h2>Operations Floor — Interactive Environment</h2></div>
      <div class="tablist">${tablist}</div>
      <div style="margin-top:.75rem">${panel}</div>`;
  }
  function renderPanel(tab) {
    switch (tab) {
      case "playbook": return panelPlaybook();
      case "integrations": return panelIntegrations();
      case "triage": return panelTriage();
      case "detection": return panelDetection();
      case "ai": return panelAI();
      case "metrics": return panelMetrics();
      case "postmortem": return panelPostMortem();
      case "roadmap": return panelRoadmap();
      default: return "";
    }
  }

  /* ---------- panel: playbook ---------- */
  function panelPlaybook() {
    const st = S.getState();
    const nodes = st.env.playbook.nodes;
    const mode = st.mode;
    const filter = st.env._pbFilter || "all";
    const pipeline = nodes.length === 0
      ? `<div class="pipeline empty"><span class="pipeline-empty">${icon("workflow")} Click nodes below to build the playbook pipeline</span></div>`
      : `<div class="pipeline"><ol class="pipeline-list">${nodes.map((id, idx) => {
          const n = D.NODE_CATALOG.find(x=>x.id===id);
          return `<li style="display:flex;align-items:center;gap:.375rem">
            <div class="pipe-node ${n.category}"><div class="pn-inner"><span class="pn-dot"></span><span>${esc(n.label)}</span></div>
              <div class="pipe-controls">
                <button class="pipe-ctrl up" data-action="pb-move" data-idx="${idx}" data-dir="-1" ${idx===0?"disabled":""} aria-label="Move up">${icon("arrow-up")}</button>
                <button class="pipe-ctrl down" data-action="pb-move" data-idx="${idx}" data-dir="1" ${idx===nodes.length-1?"disabled":""} aria-label="Move down">${icon("arrow-down")}</button>
                <button class="pipe-ctrl rm" data-action="pb-remove" data-idx="${idx}" aria-label="Remove">${icon("x")}</button>
              </div>
            </div>${idx<nodes.length-1?`<span class="pipe-arrow">→</span>`:""}</li>`;
        }).join("")}</ol></div>`;
    const filters = ["all","trigger","enrich","decide","action"].map(c =>
      `<button class="pb-filter-btn ${filter===c?"active":""}" data-action="pb-filter" data-filter="${c}">${c}</button>`).join("");
    const catalog = (filter==="all"?D.NODE_CATALOG:D.NODE_CATALOG.filter(n=>n.category===filter)).map(n =>
      `<button class="node-btn ${n.category}" data-action="pb-add" data-node="${esc(n.id)}"><span class="nb-icon">${icon("plus")}</span><span><span class="nb-label" style="color:var(--${n.category==="trigger"?"amber-300":n.category==="enrich"?"cyan-300":n.category==="decide"?"fuchsia":"emerald-300"})">${esc(n.label)}</span><br><span class="nb-detail">${esc(n.detail)}</span></span></button>`).join("");
    return `<div style="display:flex;flex-direction:column;gap:1rem">
      <section class="panel">
        <div class="panel-header"><div><h3 class="panel-title">Ransomware Containment Playbook</h3><p class="panel-sub">Assemble the pipeline: trigger → enrich → decide → action. Order matters.</p></div>${nodes.length>0?`<button class="btn btn-ghost btn-sm" data-action="pb-clear" style="color:var(--text-muted)">${icon("trash-2")} Clear</button>`:""}</div>
        <div class="panel-body">${pipeline}<div class="pb-filter">${filters}</div><div class="node-catalog">${catalog}</div></div>
      </section>
      ${objectiveCheck(mode==="medium"?"OBJ-M8":"OBJ-H1")}
    </div>`;
  }

  /* ---------- panel: integrations ---------- */
  function panelIntegrations() {
    const st = S.getState();
    const mode = st.mode;
    const enabled = D.INTEGRATIONS.filter(i => st.env.integrations[i.id]).length;
    const cards = D.INTEGRATIONS.map(it => {
      const on = st.env.integrations[it.id];
      const broken = st.env.brokenIntegration === it.id;
      return `<div class="int-card ${on?(broken?"on broken":"on"):"off"}">
        <div class="int-head">
          <span class="int-name">${icon("network", on?"var(--emerald-400)":"var(--text-faint)")} ${esc(it.name)}</span>
          <label class="switch"><input type="checkbox" data-action="toggle-int" data-int="${esc(it.id)}" ${on?"checked":""} aria-label="Toggle ${esc(it.name)}"><span class="track"><span class="thumb"></span></span></label>
        </div>
        <p class="int-role">${esc(it.role)}</p>
        <div class="int-tags">
          <span class="tag method">${esc(it.method)}</span>
          ${it.providesDetection?`<span class="tag detect">detection source</span>`:""}
          ${it.enablesResponse?`<span class="tag resp">response: ${esc(it.responseAction)}</span>`:""}
          ${on?`<button class="flag-btn ${broken?"active":""}" data-action="flag-int" data-int="${esc(it.id)}">${icon("shield-alert")} ${broken?"flagged unhealthy":"flag unhealthy"}</button>`:""}
        </div>
      </div>`;
    }).join("");
    return `<div style="display:flex;flex-direction:column;gap:1rem">
      <section class="panel">
        <div class="panel-header"><div><h3 class="panel-title">Integration Matrix — SOAR ↔ Security Tools</h3><p class="panel-sub">Wire the SOAR hub to its tools. Detection sources feed telemetry; response tools take action.</p></div><span class="stat-chip">${icon("activity","var(--emerald-400)")} ${enabled}/${D.INTEGRATIONS.length} connected</span></div>
        <div class="panel-body">
          <div class="hub"><div class="hub-node">${icon("cog","var(--amber)")}<span style="font-size:.75rem;font-weight:600;color:var(--amber-300)">SOAR Platform</span></div><div class="dim" style="font-size:.75rem">↕</div><div class="int-grid">${cards}</div></div>
          <p style="margin-top:.5rem;font-size:.6875rem;color:var(--text-dim);line-height:1.4">Toggle a tool ON to connect it to the SOAR hub. <span style="color:var(--cyan-300)">Detection source</span> tools feed telemetry; <span style="color:var(--orange)">response</span> tools take action. Use <span style="color:var(--rose-400)">flag unhealthy</span> to mark an integration returning stale/bad data.</p>
        </div>
      </section>
      ${mode==="medium" ? objectiveCheck("OBJ-M5")+objectiveCheck("OBJ-M9") : objectiveCheck("OBJ-H3")}
    </div>`;
  }

  /* ---------- panel: triage ---------- */
  function panelTriage() {
    const st = S.getState();
    const mode = st.mode;
    const alerts = mode==="hard" ? D.ALERTS : D.ALERTS.filter(a => !a.hardOnly);
    const useCases = D.USE_CASES.map(u => {
      return `<div class="uc-item"><p>${esc(u.text)}</p><div class="uc-chips">
        <button class="uc-chip ${st.env.useCases[u.id]==="automate"?"active automate":""}" data-action="set-uc" data-uc="${esc(u.id)}" data-val="automate">Automate</button>
        <button class="uc-chip ${st.env.useCases[u.id]==="human"?"active human":""}" data-action="set-uc" data-uc="${esc(u.id)}" data-val="human">Human-only</button>
      </div></div>`;
    }).join("");
    const disps = [
      { id:"auto-close", label:"Auto-close" }, { id:"auto-enrich", label:"Auto-enrich" },
      { id:"auto-contain", label:"Auto-contain" }, { id:"escalate", label:"Escalate" },
    ];
    const alertCards = alerts.map(a => {
      const cur = st.env.triage[a.id];
      const opts = disps.map(d => `<button class="disp-btn ${cur===d.id?"active "+d.id.replace("-",""):""}" data-action="set-disp" data-alert="${esc(a.id)}" data-disp="${d.id}">${d.label}</button>`).join("");
      return `<div class="alert-card ${a.redHerring?"redherring":"normal"}">
        <div class="alert-meta">
          <span class="sev ${a.severity}">${a.severity}</span>
          <span class="alert-source">${esc(a.source)}</span>
          ${a.redHerring?`<span class="alert-rh-tag">${icon("flag")} looks critical</span>`:""}
        </div>
        <p class="alert-title">${esc(a.title)}</p>
        <p class="alert-detail">${esc(a.detail)}</p>
        <div class="disp-row">${opts}</div>
      </div>`;
    }).join("");
    return `<div style="display:flex;flex-direction:column;gap:1rem">
      <section class="panel"><div class="panel-header"><div><h3 class="panel-title">Use-Case Classification</h3><p class="panel-sub">Which tasks are good automation candidates? Automate repetitive, well-defined, reversible work.</p></div></div><div class="panel-body" style="display:flex;flex-direction:column;gap:.5rem">${useCases}</div></section>
      <section class="panel"><div class="panel-header"><div><h3 class="panel-title">Alert Triage Feed</h3><p class="panel-sub">Route each alert: auto-close · auto-enrich · auto-contain · escalate.</p></div><span class="stat-chip">${icon("inbox","var(--amber)")} ${alerts.length} alerts</span></div><div class="panel-body" style="display:flex;flex-direction:column;gap:.5rem">${alertCards}</div></section>
      ${mode==="medium" ? objectiveCheck("OBJ-M3")+objectiveCheck("OBJ-M4") : objectiveCheck("OBJ-H2")}
    </div>`;
  }

  /* ---------- panel: detection ---------- */
  function panelDetection() {
    const st = S.getState();
    const mode = st.mode;
    const m = D.detectionMetrics(st.env.threshold);
    const beh = D.DETECTION_BEHAVIORS.map(d => `<div class="uc-item"><p>${esc(d.text)}</p><div class="uc-chips">
      <button class="uc-chip ${st.env.detectionMethods[d.id]==="rule"?"active automate":""}" data-action="set-method" data-d="${esc(d.id)}" data-val="rule">${icon("ruler")} Rule-based</button>
      <button class="uc-chip ${st.env.detectionMethods[d.id]==="ml"?"active human":""}" data-action="set-method" data-d="${esc(d.id)}" data-val="ml">${icon("brain")} ML/UEBA</button>
    </div></div>`).join("");
    const tpPct = Math.max(2, Math.min(100, m.tp/80*100));
    const fpPct = Math.max(2, Math.min(100, m.fp/45*100));
    const f1Tone = m.f1>=0.7 ? "var(--emerald-300)" : "var(--amber-300)";
    const fpTone = m.fp>8 ? "var(--rose-400)" : "var(--text)";
    return `<div style="display:flex;flex-direction:column;gap:1rem">
      <section class="panel"><div class="panel-header"><div><h3 class="panel-title">Detection Method Classifier</h3><p class="panel-sub">Rule-based (static/deterministic) vs ML/behavioral (baselined).</p></div></div><div class="panel-body" style="display:flex;flex-direction:column;gap:.5rem">${beh}</div></section>
      <section class="panel">
        <div class="panel-header"><div><h3 class="panel-title">Threshold Tuner — Unusual Outbound Data Transfer</h3><p class="panel-sub">Balance true positives (caught) vs false positives (noise). Watch F1.</p></div><span class="stat-chip">${icon("sliders","var(--amber)")} threshold <span id="thr-val" style="color:var(--text)">${st.env.threshold}</span></span></div>
        <div class="panel-body">
          <div class="slider-row"><span class="lbl">low</span><input type="range" class="slider" min="0" max="100" step="1" value="${st.env.threshold}" data-action="set-threshold" aria-label="Detection threshold"><span class="lbl">high</span></div>
          <div class="metric-bars" style="margin-top:.75rem">
            <div class="mbar"><div class="mbar-head"><span>True Positives</span><span class="v" id="m-tp">${m.tp}</span></div><div class="mbar-track"><div class="mbar-fill tp" id="m-tp-bar" style="width:${tpPct}%"></div></div></div>
            <div class="mbar"><div class="mbar-head"><span>False Positives</span><span class="v" id="m-fp">${m.fp}</span></div><div class="mbar-track"><div class="mbar-fill fp" id="m-fp-bar" style="width:${fpPct}%"></div></div></div>
          </div>
          <div class="stats-grid" style="margin-top:.75rem">
            <div class="stat-cell"><p class="l">TP</p><p class="v" style="color:var(--emerald-300)" id="s-tp">${m.tp}</p></div>
            <div class="stat-cell"><p class="l">FP</p><p class="v" id="s-fp" style="color:${fpTone}">${m.fp}</p></div>
            <div class="stat-cell"><p class="l">Precision</p><p class="v" style="color:var(--cyan-300)" id="s-prec">${(m.precision*100).toFixed(0)}%</p></div>
            <div class="stat-cell"><p class="l">F1</p><p class="v" id="s-f1" style="color:${f1Tone}">${m.f1.toFixed(2)}</p></div>
          </div>
        </div>
      </section>
      ${mode==="medium" ? objectiveCheck("OBJ-M6")+objectiveCheck("OBJ-M7") : objectiveCheck("OBJ-H4")}
    </div>`;
  }

  /* ---------- panel: AI ---------- */
  function panelAI() {
    const st = S.getState();
    const mode = st.mode;
    const CAPS = [
      { key:"ueba", title:"UEBA — Behavioral detection", icon:"brain", iconColor:"var(--fuchsia)", desc:"ML baselines per user/entity; flags deviations no rule would catch.", value:"Catches novel insider behavior (e.g. dev pulling 50 GB at 03:00) that static rules miss.", risk:"Needs tuning; cold-start baseline can mislabel legitimate new patterns as anomalies." },
      { key:"genSummary", title:"Generative AI — Investigation summary", icon:"file-text", iconColor:"var(--cyan-300)", desc:"Writes a case brief from multi-source evidence so the analyst acts faster.", value:"Cuts investigation write-up time; surfaces cross-tool correlations in plain language.", risk:"Hallucination — confident, false detail an analyst may trust without verifying." },
      { key:"predictiveTriage", title:"Predictive triage — ML ranking", icon:"trending-up", iconColor:"var(--emerald-300)", desc:"Scores and ranks alerts by likely severity to surface what matters.", value:"Auto-closes ~60% benign-pattern alerts; prioritizes the top 10% by likely severity.", risk:"Mis-ranking can bury a real threat; opaque scoring resists audit." },
    ];
    const cards = CAPS.map(c => {
      const on = st.env.ai[c.key];
      return `<div class="cap-card ${on?"on":"off"}">
        <div class="cap-head"><span class="cap-title">${icon(c.icon, c.iconColor)} ${c.title}</span><label class="switch"><input type="checkbox" data-action="toggle-ai" data-key="${c.key}" ${on?"checked":""} aria-label="Toggle ${esc(c.title)}"><span class="track"><span class="thumb"></span></span></label></div>
        <p class="cap-desc">${c.desc}</p>
        <div class="cap-vr"><div class="vr-box value"><p class="h">${icon("check-circle")} Value</p><p>${c.value}</p></div><div class="vr-box risk"><p class="h">${icon("alert-triangle")} Risk</p><p>${c.risk}</p></div></div>
      </div>`;
    }).join("");
    let out = "";
    if (st.env.ai.predictiveTriage) out += `<div class="ai-out pred"><h4>Predictive triage ranking</h4><ul><li><span>1. C2 beacon (a6)</span><span class="score" style="color:var(--emerald-300)">0.96</span></li><li><span>2. Ransomware (a2)</span><span class="score" style="color:var(--emerald-300)">0.93</span></li><li><span>3. Encoded PowerShell (a5)</span><span class="score" style="color:var(--amber-300)">0.41</span></li><li style="color:var(--text-dim)"><span>auto-close candidates</span><span class="score">~60%</span></li></ul></div>`;
    if (st.env.ai.ueba) out += `<div class="ai-out ueba" style="margin-top:.5rem"><h4>UEBA anomalies</h4><ul><li><span>d.hayes — 50 GB download from repo rarely touched, 03:14</span><span class="score" style="color:var(--fuchsia)">0.91</span></li><li><span>m.singh — login 8,140 km from prior session</span><span class="score" style="color:var(--fuchsia)">0.78</span></li></ul></div>`;
    if (st.env.ai.genSummary) out += `<div class="ai-out gen" style="margin-top:.5rem"><h4>Generative AI investigation summary</h4><p><span class="dim">Case #NW-2024-0917 · insider exfil candidate.</span> At 03:14 UTC, developer d.hayes downloaded 50.2 GB from the &quot;legacy-payments&quot; repository (accessed twice in 90 days, never this volume). UEBA score 0.91. No matching threat-intel indicators. Correlated EDR event shows compression prior to transfer (T1048 pattern). <span style="color:var(--amber-300)">Recommend: pause account access, notify manager + SOC, preserve endpoint forensics.</span> <span style="color:var(--rose-400)">Verify this summary against source events before acting — generative output may hallucinate detail.</span></p></div>`;
    return `<div style="display:flex;flex-direction:column;gap:1rem">
      <section class="panel"><div class="panel-header"><div><h3 class="panel-title">AI-Assisted Workflow Console</h3><p class="panel-sub">Enable capabilities and read the value/risk trade-off for each.</p></div><span class="stat-chip ${[st.env.ai.ueba,st.env.ai.genSummary,st.env.ai.predictiveTriage].some(Boolean)?"":"op-fade"}">${icon("sparkles")} ${[st.env.ai.ueba,st.env.ai.genSummary,st.env.ai.predictiveTriage].filter(Boolean).length}/3 enabled</span></div><div class="panel-body" style="display:flex;flex-direction:column;gap:.5rem">${cards}</div></section>
      ${out ? `<section class="panel"><div class="panel-header"><div><h3 class="panel-title">Live AI Output</h3><p class="panel-sub">Synthetic — what the enabled capabilities produce for the insider-exfil case.</p></div></div><div class="panel-body">${out}</div></section>` : ""}
      ${objectiveCheck(mode==="medium"?"OBJ-M11":"OBJ-H6")}
    </div>`;
  }

  /* ---------- panel: metrics ---------- */
  function panelMetrics() {
    const st = S.getState();
    const mode = st.mode;
    const rows = [
      { label:"MTTD (min)", before:D.METRICS_BEFORE.mttd, after:D.METRICS_AFTER.mttd, unit:"min", lower:true, max:100 },
      { label:"MTTR (min)", before:D.METRICS_BEFORE.mttr, after:D.METRICS_AFTER.mttr, unit:"min", lower:true, max:250 },
      { label:"Automation rate (%)", before:D.METRICS_BEFORE.automationRate, after:D.METRICS_AFTER.automationRate, unit:"%", lower:false, max:100 },
      { label:"Alert-to-action (min)", before:D.METRICS_BEFORE.alertToAction, after:D.METRICS_AFTER.alertToAction, unit:"min", lower:true, max:20 },
      { label:"Analyst alerts / shift", before:D.METRICS_BEFORE.analystAlertsPerShift, after:D.METRICS_AFTER.analystAlertsPerShift, unit:"", lower:true, max:2200 },
    ];
    const rowHtml = rows.map(r => {
      const better = r.lower ? r.after<r.before : r.after>r.before;
      const pct = Math.round((r.lower ? (1-r.after/r.before) : (r.after/r.before-1))*100);
      const beforePct = Math.min(100, r.before/r.max*100);
      const afterPct = Math.min(100, r.after/r.max*100);
      return `<div class="metric-row"><div class="mh"><p class="ml">${r.label}</p><span class="metric-pct ${better?"good":"bad"}">${r.lower?icon("arrow-down"):icon("arrow-up")} ${r.lower?"-":"+"}${Math.abs(pct)}%</span></div><div class="metric-bars-pair">
        <div class="mbp"><span class="lbl before">before</span><div class="track"><div class="fill before" style="width:${beforePct}%"></div></div><span class="val before">${r.before}${r.unit}</span></div>
        <div class="mbp"><span class="lbl after">after</span><div class="track"><div class="fill after" style="width:${afterPct}%"></div></div><span class="val after">${r.after}${r.unit}</span></div>
      </div></div>`;
    }).join("");
    const mttrImp = Math.round((1-D.METRICS_AFTER.mttr/D.METRICS_BEFORE.mttr)*100);
    const autoGain = D.METRICS_AFTER.automationRate - D.METRICS_BEFORE.automationRate;
    return `<div style="display:flex;flex-direction:column;gap:1rem">
      <section class="panel"><div class="panel-header"><div><h3 class="panel-title">Efficiency Dashboard — Before vs After Automation</h3><p class="panel-sub">What gets measured gets funded. Compare each metric across the initiative.</p></div><span class="stat-chip">${icon("bar-chart-3","var(--emerald-400)")} synthetic</span></div><div class="panel-body"><div style="display:flex;flex-direction:column;gap:.75rem">${rowHtml}</div><div class="metric-summary"><div class="cell"><p class="l">MTTR improvement</p><p class="v">~${mttrImp}%</p></div><div class="cell"><p class="l">Automation rate gain</p><p class="v">+${autoGain} pts</p></div></div><button class="btn ${st.env.metricsRead?"btn-emerald-soft":"btn-primary"}" data-action="ack-metrics" ${st.env.metricsRead?"disabled":""} style="margin-top:.75rem;width:100%">${st.env.metricsRead?icon("check-circle")+" Readout acknowledged":"Acknowledge readout"}</button></div></section>
      ${objectiveCheck(mode==="medium"?"OBJ-M12":"OBJ-H7")}
    </div>`;
  }

  /* ---------- panel: post-mortem ---------- */
  function panelPostMortem() {
    const st = S.getState();
    const mode = st.mode;
    const pm = st.env.postmortem;
    const rcOpts = D.POSTMORTEM_ROOT_CAUSES.map(rc => `<button class="pm-opt sel root ${pm.rootCause===rc.id?"sel":""}" data-action="set-rc" data-rc="${rc.id}"><span class="box">${pm.rootCause===rc.id?"":""}</span><span>${esc(rc.text)}</span></button>`).join("");
    const riskOpts = D.POSTMORTEM_RISKS.map(r => { const on = pm.residualRisks.includes(r.id); return `<button class="pm-opt ${on?"sel risk":""}" data-action="toggle-risk" data-risk="${r.id}"><span class="box">${on?"✓":""}</span><span>${esc(r.text)}</span></button>`; }).join("");
    const fixOpts = D.POSTMORTEM_FIXES.map(f => { const on = pm.fixes.includes(f.id); return `<button class="pm-opt ${on?"sel fix":""}" data-action="toggle-fix" data-fix="${f.id}"><span class="box">${on?"✓":""}</span><span>${esc(f.text)}</span></button>`; }).join("");
    return `<div style="display:flex;flex-direction:column;gap:1rem">
      <section class="panel"><div class="panel-header"><div><h3 class="panel-title">Automation Post-Mortem</h3><p class="panel-sub">Northwind Financial — Monday 09:00 outage. Synthetic training record.</p></div></div><div class="panel-body">
        <div class="pm-scenario"><p class="h">${icon("circle-alert")} Incident record</p><p>${esc(D.POSTMORTEM_SCENARIO)}</p></div>
        <p class="pm-section-title">${icon("stethoscope","var(--amber)")} 1. Root cause</p><div style="display:flex;flex-direction:column;gap:.375rem">${rcOpts}</div>
        <p class="pm-section-title">${icon("shield-alert","var(--rose-400)")} 2. Residual risks (select all that apply)</p><div style="display:flex;flex-direction:column;gap:.375rem">${riskOpts}</div>
        <p class="pm-section-title">${icon("wrench","var(--emerald-400)")} 3. Correct fixes (select all that apply)</p><div style="display:flex;flex-direction:column;gap:.375rem">${fixOpts}</div>
      </div></section>
      ${objectiveCheck(mode==="medium"?"OBJ-M10":"OBJ-H5")}
    </div>`;
  }

  /* ---------- panel: roadmap ---------- */
  function panelRoadmap() {
    const st = S.getState();
    const order = [...D.ROADMAP_PROCESSES].map(p => ({ p, rank: st.env.roadmap[p.id] })).sort((a,b)=>(a.rank??99)-(b.rank??99));
    // init ranks if empty
    let roadmap = st.env.roadmap;
    if (Object.keys(roadmap).length === 0) { roadmap = {}; D.ROADMAP_PROCESSES.forEach((p,i)=>roadmap[p.id]=i+1); }
    const ordered = D.ROADMAP_PROCESSES.map(p => ({ p, rank: roadmap[p.id] })).sort((a,b)=>a.rank-b.rank);
    const rows = ordered.map(({p,rank},idx) => {
      const score = p.volume+p.repetitiveness+p.riskIfManual+p.integrationReadiness;
      const dots = n => "●".repeat(n);
      return `<div class="road-row"><div class="rr"><span class="road-rank">${rank}</span>
        <div style="flex:1;min-width:0"><p class="road-name">${esc(p.name)}</p><div class="road-stats">
          <span class="mini-stat"><span>vol</span><span class="dots">${dots(p.volume)}</span></span>
          <span class="mini-stat"><span>rep</span><span class="dots">${dots(p.repetitiveness)}</span></span>
          <span class="mini-stat"><span>risk</span><span class="dots">${dots(p.riskIfManual)}</span></span>
          <span class="mini-stat"><span>ready</span><span class="dots">${dots(p.integrationReadiness)}</span></span>
          <span class="mini-stat">${icon("trending-up","var(--text)")} score ${score}</span>
        </div></div>
        <div class="road-controls"><button class="road-ctrl" data-action="road-move" data-idx="${idx}" data-dir="-1" ${idx===0?"disabled":""} aria-label="Move up">${icon("arrow-up")}</button><button class="road-ctrl" data-action="road-move" data-idx="${idx}" data-dir="1" ${idx===ordered.length-1?"disabled":""} aria-label="Move down">${icon("arrow-down")}</button></div>
      </div></div>`;
    }).join("");
    return `<div style="display:flex;flex-direction:column;gap:1rem">
      <section class="panel"><div class="panel-header"><div><h3 class="panel-title">Automation Roadmap — Prioritize What to Automate Next</h3><p class="panel-sub">Rank 1 (do first) → 5 (do last). Weight: volume × repetitiveness × risk-if-manual × integration-readiness.</p></div><span class="stat-chip">${icon("map","var(--amber)")} ${D.ROADMAP_PROCESSES.length} candidates</span></div><div class="panel-body"><div style="display:flex;flex-direction:column;gap:.375rem">${rows}</div><p style="margin-top:.5rem;font-size:.6875rem;color:var(--text-dim);line-height:1.4">Fast, safe wins rank first: high volume, highly repetitive, risky if left manual, AND integration-ready. Judgment-heavy work (executive attribution briefings) ranks last.</p></div></section>
      ${objectiveCheck("OBJ-H8")}
    </div>`;
  }

  /* ---------- objectives tracker (right rail) ---------- */
  function missionBoard() {
    const st = S.getState();
    const objs = D.objectivesFor(st.mode);
    const completed = objs.filter(o => st.objectiveStates[o.id]?.completed).length;
    const groups = D.PILLAR_ORDER.map(p => {
      const group = objs.filter(o => o.pillar === p);
      if (!group.length) return "";
      const done = group.filter(o => st.objectiveStates[o.id]?.completed).length;
      const items = group.map(o => objectiveCheck(o.id, true, o.tab)).join("");
      return `<div class="mission-group"><div class="mission-group-head" style="color:var(--${p==="understand"?"amber-300":p==="recognize"?"cyan-300":p==="detect"?"emerald-300":"orange"})">${D.PILLAR_LABEL[p]}</div><div class="mission-items">${items}</div></div>`;
    }).join("");
    return `<aside class="right-rail"><div class="mission-board">
      <div class="mission-head"><div class="row between"><h3>Mission Board</h3><span class="cnt"><span style="color:var(--emerald-300)">${completed}</span>/${objs.length}</span></div><p class="mission-sub">Complete every objective to earn mastery.</p></div>
      <div class="mission-body">${groups}</div>
    </div></aside>`;
  }

  /* ---------- quiz ---------- */
  function quiz() {
    const st = S.getState();
    const questions = D.QUIZ.filter(q => q.mode === st.mode);
    if (!questions.length) return "";
    if (st.quizFinished) return quizResults(questions);
    const step = Math.min(st.quizStep, questions.length-1);
    const q = questions[step];
    const locked = !!st.quizLocked[q.id];
    const chosen = st.quizAnswers[q.id];
    const isLast = step === questions.length-1;
    const dots = questions.map((qq,i) => {
      const ql = !!st.quizLocked[qq.id];
      const qc = st.quizAnswers[qq.id]===qq.correct;
      return `<span class="qpd ${i===step?"current":""} ${ql?(qc?"correct":"wrong"):""}"></span>`;
    }).join("");
    const opts = q.options.map(o => {
      const selected = chosen===o.id, correct = o.id===q.correct;
      let tone = locked ? (selected ? (correct?"locked-correct":"locked-wrong") : "locked-neutral") : (selected?"sel":"");
      return `<button class="q-opt ${tone}" data-action="quiz-answer" data-q="${q.id}" data-o="${o.id}" ${locked?"disabled":""} aria-pressed="${selected}">
        <span class="letter">${o.id.toUpperCase()}</span><span class="txt">${esc(o.text)}</span>
        ${locked && selected ? (correct?icon("check-circle","var(--emerald-400)"):icon("x-circle","var(--rose-400)")) : ""}
      </button>`;
    }).join("");
    const feedback = locked ? `<div class="q-feedback ${chosen===q.correct?"correct":"wrong"}"><span class="h ${chosen===q.correct?"correct":"wrong"}">${chosen===q.correct?"Correct. ":"Review: "}</span>${esc(q.explanation)}</div>` : "";
    return `<section class="panel" id="quiz">
      <div class="panel-header"><div><h3 class="panel-title">Knowledge Check</h3><p class="panel-sub">${st.mode==="hard"?"Scenario-based — apply, don't recall. One question at a time.":"Concept questions with explanations. One question at a time."}</p></div><span class="stat-chip">${questions.filter(qq=>st.quizLocked[qq.id]).length}/${questions.length} checked</span></div>
      <div class="panel-body">
        <div class="quiz-progress">${dots}</div>
        <p class="q-count" style="margin-top:.5rem">Question ${step+1} of ${questions.length}</p>
        <div class="q-card" style="margin-top:.5rem">
          ${q.scenario?`<p class="q-scenario">${esc(q.scenario)}</p>`:""}
          <p class="q-prompt">${esc(q.prompt)}</p>
          <div class="q-options">${opts}</div>
          ${feedback?`<div style="margin-top:.625rem">${feedback}</div>`:""}
        </div>
        <div class="q-controls">
          ${!locked ? `<button class="btn btn-primary btn-sm" data-action="quiz-check" data-q="${q.id}" ${!chosen?"disabled":""}>${icon("clipboard-list")} Check answer</button>` :
            `<button class="btn btn-primary btn-sm" data-action="quiz-next">${isLast?"Finish":"Next question"}${icon("arrow-right")}</button>`}
          <span class="q-lock-note">${icon("lock")} ${locked?"answer locked":"select, then check"}</span>
        </div>
      </div>
    </section>`;
  }
  function quizResults(questions) {
    const st = S.getState();
    const correct = questions.filter(q => st.quizAnswers[q.id]===q.correct).length;
    const score = Math.round(correct/questions.length*100);
    const recap = questions.map((qq,i) => {
      const ok = st.quizAnswers[qq.id]===qq.correct;
      return `<li><span class="num">${i+1}</span><span class="q">${esc(qq.prompt)}</span>${ok?icon("check-circle","var(--emerald-400) ok"):icon("x-circle","var(--rose-400) bad")}</li>`;
    }).join("");
    return `<section class="panel"><div class="panel-header"><div><h3 class="panel-title">Knowledge Check</h3><p class="panel-sub">Quiz complete.</p></div></div><div class="panel-body">
      <div class="q-results-head"><div><p style="font-size:10px;text-transform:uppercase;color:var(--text-dim);margin:0">Quiz complete</p><p class="q-results-score">${correct}/${questions.length} <span style="font-size:.875rem;font-weight:400;color:var(--text-muted)">(${score}%)</span></p></div><button class="btn btn-outline btn-sm" data-action="quiz-restart">${icon("rotate-ccw")} Restart quiz</button></div>
      <ul class="q-recap">${recap}</ul>
      <p style="margin-top:.75rem;font-size:.6875rem;color:var(--text-dim);line-height:1.5">Restarting clears every answer and lock so you can re-take the whole quiz from scratch — it does not let you edit a single already-checked answer. The completion report (with your focus areas) opens automatically when every objective and this quiz are done.</p>
    </div></section>`;
  }

  /* ---------- debrief ---------- */
  function debrief() {
    const db = D.DEBRIEF;
    const noteCard = (tone, ic, title, items) => `<div class="note-card ${tone}"><h4>${icon(ic)}${title}</h4><ul>${items.map(t=>`<li><span class="mk">▸</span>${esc(t)}</li>`).join("")}</ul></div>`;
    const refs = db.references.map(r => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}${icon("external-link")}</a>`).join("");
    return `<section class="panel"><div class="panel-header"><div><h3 class="panel-title">Debrief — Field Notes</h3><p class="panel-sub">Synthesis: detection opportunities, mitigations, blue/red takeaways, references.</p></div></div><div class="panel-body">
      <div class="debrief-grid">
        ${noteCard("cyan","clipboard-list","Detection opportunities",db.detectionOpportunities)}
        ${noteCard("emerald","shield","Mitigation recommendations",db.mitigationRecommendations)}
        ${noteCard("amber","shield","Blue-team takeaways",db.blueTeam)}
        ${noteCard("rose","swords","Red-team mindset",db.redTeam)}
      </div>
      <div class="refs-box"><h4>${icon("bookmark")} Official references</h4><div class="refs-list">${refs}</div></div>
    </div></section>`;
  }

  /* ---------- completion modal ---------- */
  function completionModal() {
    const st = S.getState();
    const objs = D.objectivesFor(st.mode);
    const allDone = objs.length>0 && objs.every(o => st.objectiveStates[o.id]?.completed);
    const ready = allDone && st.quizFinished;
    if (!ready || st.completionSeen) return "";
    const quizQs = D.QUIZ.filter(q => q.mode===st.mode);
    const quizCorrect = quizQs.filter(q => st.quizAnswers[q.id]===q.correct).length;
    const quizScore = Math.round(quizCorrect/quizQs.length*100);
    const firstAttempt = objs.filter(o => st.objectiveStates[o.id]?.firstAttemptPassed).length;
    const firstRate = firstAttempt/objs.length;
    const hintsUsed = objs.reduce((a,o)=>a+(st.objectiveStates[o.id]?.hintsUsed||0),0);
    let stars = 1;
    if (firstRate>=0.7 && quizScore>=70) stars = 2;
    if (firstRate>=0.9 && hintsUsed<=2 && quizScore>=85) stars = 3;
    const overall = Math.round(0.7*100 + 0.3*quizScore);
    const focus = D.focusAreasFor(st.objectiveStates, st.quizAnswers, st.mode);
    const pillarRows = D.PILLAR_ORDER.map(p => {
      const g = objs.filter(o => o.pillar===p);
      const done = g.filter(o => st.objectiveStates[o.id]?.completed).length;
      const pct = g.length ? done/g.length*100 : 0;
      return `<div class="row"><span class="pl">${D.PILLAR_LABEL[p]}</span><div class="trk"><div class="fl ${p}" style="width:${pct}%"></div></div><span class="ct">${done}/${g.length}</span></div>`;
    }).join("");
    const focusHtml = focus.length===0
      ? `<p class="empty">No weak areas detected — you passed every objective first-try and answered every quiz question correctly. Try the other difficulty mode, or study the linked MITRE ATT&CK detection/mitigation sections in the Debrief.</p>`
      : `<ul class="focus-list">${focus.map(f=>`<li class="focus-item"><p class="t">${esc(f.topic)}</p><p class="g">${esc(f.guidance)}</p><p class="s">from: ${esc(f.source.join(", "))}</p></li>`).join("")}</ul>`;
    const starHtml = [1,2,3].map(i => `<svg class="star ${i<=stars?"earned":"empty"}" viewBox="0 0 24 24" aria-label="${i<=stars?"star earned":"star not earned"}">${ICONS.star}</svg>`).join("");
    return `<div class="overlay" data-overlay="completion" role="dialog" aria-modal="true" aria-labelledby="cm-title">
      <div class="dialog" role="document">
        <button class="dialog-close-x" data-action="close-completion" aria-label="Close report">${icon("x")}</button>
        <div class="dialog-header"><div class="trophy-wrap">${icon("trophy")}</div><h2 class="dialog-title" id="cm-title">Automation Floor Mastered</h2><p class="dialog-desc">You completed every objective and the knowledge check for Security+ SY0-801 Lesson 4.6.</p></div>
        <div class="stars">${starHtml}</div>
        <div class="score-grid"><div class="score-cell"><p class="v">${overall}</p><p class="l">Score</p></div><div class="score-cell ring">${ring(firstRate,40,3)}<p class="l" style="margin-top:.25rem">first-try</p></div><div class="score-cell"><p class="v">${quizScore}%</p><p class="l">Quiz</p></div></div>
        <div class="pillar-recap"><p class="h">Mastery by pillar</p>${pillarRows}</div>
        <div class="focus-box"><p class="h">${icon("target")} Focus areas — where to study more</p>${focusHtml}</div>
        <div class="next-box"><p class="h">What to learn next</p><ul><li>▸ Map these patterns to SY0-801 Domain 4 incident response &amp; monitoring.</li><li>▸ Try the OTHER difficulty mode of this same lab for a different depth.</li><li>▸ Study MITRE ATT&amp;CK detection &amp; mitigation sections for T1486, T1566, T1078.</li><li>▸ Practice writing a SOAR playbook YAML for a phishing containment workflow.</li></ul></div>
        <div class="dialog-actions"><button class="btn btn-outline" data-action="close-completion">${icon("x")} Stay on the floor</button><button class="btn btn-danger-soft" data-action="reset-all">${icon("rotate-ccw")} Restart</button></div>
      </div>
    </div>`;
  }

  /* ---------- glossary drawer ---------- */
  function glossaryDrawer() {
    const st = S.getState();
    if (!st.glossaryOpen) return "";
    return `<div class="overlay side-right" data-overlay="glossary" role="dialog" aria-modal="true" aria-labelledby="gl-title">
      <div class="sheet" role="document">
        <div class="sheet-header"><div style="flex:1"><div class="sheet-title">${icon("book-open")}<span id="gl-title">Glossary</span></div><button class="btn btn-outline btn-sm" data-action="close-glossary" aria-label="Close glossary">${icon("x")} Close</button></div></div>
        <div class="sheet-body">
          <div class="search-wrap">${icon("search")}<input class="search-input" id="gloss-search" placeholder="Filter terms…" aria-label="Filter glossary"></div>
          <dl class="gloss-list" id="gloss-list">${D.GLOSSARY.map(g=>`<div class="gloss-item"><dt>${esc(g.term)}</dt><dd>${esc(g.definition)}</dd></div>`).join("")}</dl>
        </div>
      </div>
    </div>`;
  }

  /* ---------- reset dialog ---------- */
  function resetDialog() {
    const st = S.getState();
    if (!st.resetDialogOpen) return "";
    return `<div class="overlay" data-overlay="reset" role="alertdialog" aria-modal="true" aria-labelledby="rd-title">
      <div class="dialog sm alert-dialog" role="document">
        <div class="dialog-header" style="text-align:left"><h2 class="dialog-title" id="rd-title" style="font-size:1.125rem">Reset the entire lab?</h2><p class="dialog-desc" style="text-align:left">This clears your mode, all objective progress, quiz answers, and environment state. You will return to the mode-selection screen. This cannot be undone.</p></div>
        <div class="ad-actions"><button class="btn btn-outline" data-action="close-reset">Cancel</button><button class="btn btn-danger" data-action="reset-all">Reset everything</button></div>
      </div>
    </div>`;
  }

  /* ---------- foot note ---------- */
  function footNote() {
    return `<div class="foot-note"><p>End of the Automation Operations Floor. Synthetic training data only — fictional organization, fictional actors. MITRE ATT&amp;CK IDs referenced are accurate to the official source. Complete every objective and the knowledge check to see your mastery report.</p></div>`;
  }

  /* ---------- main render ---------- */
  function render() {
    const st = S.getState();
    const app = document.getElementById("app");
    if (!st.mode) {
      app.innerHTML = modeSelect();
      return;
    }
    app.innerHTML = `<div class="app">
      ${topbar()}
      <main class="main">
        <div class="layout-grid">
          <div class="main-col">
            ${briefing()}
            <div id="knowledge-anchor">${knowledgeCore()}</div>
            <div id="console-anchor">${console()}</div>
            ${quiz()}
            ${debrief()}
            ${footNote()}
          </div>
          ${missionBoard()}
        </div>
      </main>
    </div>`;
    // last focused element restoration is best-effort; overlays render below
    document.getElementById("overlay-root").innerHTML = completionModal() + glossaryDrawer() + resetDialog();
  }

  /* ---------- targeted detection readout update (slider drag, no full re-render) ---------- */
  function updateDetectionReadout() {
    const st = S.getState();
    const m = D.detectionMetrics(st.env.threshold);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const setStyle = (id, k, v) => { const el = document.getElementById(id); if (el) el.style[k] = v; };
    set("thr-val", st.env.threshold);
    set("m-tp", m.tp); set("m-fp", m.fp);
    set("s-tp", m.tp); set("s-fp", m.fp);
    set("s-prec", (m.precision*100).toFixed(0)+"%");
    set("s-f1", m.f1.toFixed(2));
    setStyle("m-tp-bar", "width", Math.max(2,Math.min(100,m.tp/80*100))+"%");
    setStyle("m-fp-bar", "width", Math.max(2,Math.min(100,m.fp/45*100))+"%");
    setStyle("s-fp", "color", m.fp>8?"var(--rose-400)":"var(--text)");
    setStyle("s-f1", "color", m.f1>=0.7?"var(--emerald-300)":"var(--amber-300)");
  }

  window.LAB_UI = { render, updateDetectionReadout, icon, esc, objectiveCheck };
})();
