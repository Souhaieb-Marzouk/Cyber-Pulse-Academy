/* ═══════════════════════════════════════════════════════════════════════════
   ui.js — rendering helpers and reusable lab components.
   Ported from src/components/lab/bits.tsx, widgets.tsx and artifacts.tsx.
   Vanilla DOM replaces React/Radix/Framer: every widget owns its in-place
   updates (the store does not re-render the page on env changes — exactly
   like React only touching the changed subtree).
   ═══════════════════════════════════════════════════════════════════════════ */

window.LAB_UI = (function () {
  "use strict";

  const S = window.LAB_STORE;
  const { listOf, mapOf } = S;

  /* ─── tiny DOM helpers ─── */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* ─── Lucide icons (inline SVG, exact 24×24 stroke paths) ─── */
  const ICON_PATHS = {
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "cloud": '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    "laptop": '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    "network": '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    "server": '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
    "shopping-cart": '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    "wifi": '<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" x2="12.01" y1="20" y2="20"/>',
    "shield": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    "landmark": '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    "book-open": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    "book-open-check": '<path d="M12 21V8"/><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="m9 11 2 2 4-4"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    "clipboard-check": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    "compass": '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    "scale": '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    "lightbulb": '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    "pen-line": '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    "file-check-2": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/>',
    "file-warning": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/>',
    "folder-closed": '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="M2 10h20"/>',
    "folder-open": '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
    "folder-search": '<circle cx="11.5" cy="12.5" r="2.5"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="m13.3 14.3 2.7 2.7"/>',
    "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    "check-circle-2": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    "x-circle": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    "award": '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    "focus": '<circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
    "star": '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    "search": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    "swords": '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="16" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 10"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>',
    "stamp": '<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z"/><path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"/>',
  };

  function icon(name, px, extra) {
    const path = ICON_PATHS[name] || "";
    return '<svg class="ic' + (px ? " ic-" + px : "") + (extra ? " " + extra : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + path + "</svg>";
  }

  /* ─── Rubber stamp (spring pop via CSS) ─── */
  const TONE_COLORS = { green: "#166534", red: "#9f1239", amber: "#b45309", teal: "#115e59" };
  function stamp(text, tone, rotate, extraCls) {
    tone = tone || "green";
    rotate = rotate === undefined ? -8 : rotate;
    const cls = "stamp stamp-" + tone + (extraCls ? " " + extraCls : "");
    return '<span class="' + cls + '" style="--rot:' + rotate + 'deg">' + esc(text) + "</span>";
  }

  /* ─── Paper & evidence components (bits.tsx) ─── */
  const TONE_BARS = { plain: "#a8a29e", teal: "#0f766e", amber: "#d97706", green: "#047857", red: "#be123c" };

  function evidenceCard(opts, bodyHtml) {
    const head = opts.title || opts.kicker
      ? '<div class="evidence-head">' + (opts.title ? '<h4 class="evidence-title">' + esc(opts.title) + "</h4>" : "") + (opts.kicker ? '<span class="evidence-kicker">' + esc(opts.kicker) + "</span>" : "") + "</div>"
      : "";
    const tone = TONE_BARS[opts.tone || "plain"];
    return '<div class="evidence' + (opts.cls ? " " + opts.cls : "") + '">' + head +
      '<div class="evidence-body"><span class="evidence-tone" style="background:' + tone + '" aria-hidden="true"></span>' + bodyHtml + "</div></div>";
  }

  function sectionTitle(title, hint) {
    return '<div class="section-title"><h3>' + esc(title) + "</h3>" +
      (hint ? '<p class="section-hint">' + esc(hint) + "</p>" : "") +
      '<div class="section-rule" aria-hidden="true"></div></div>';
  }

  const PILLARS = {
    P1: { label: "P1 · Understand", cls: "pb-P1" },
    P2: { label: "P2 · Recognize", cls: "pb-P2" },
    P3: { label: "P3 · Detect", cls: "pb-P3" },
    P4: { label: "P4 · Mitigate", cls: "pb-P4" },
  };
  function pillarBadge(pillar) {
    return '<span class="pillar-badge ' + PILLARS[pillar].cls + '">' + PILLARS[pillar].label + "</span>";
  }

  /* ─── Term tooltip (glossary lookup: inline dict → glossary) ─── */
  function lookupDef(k) {
    const D = window.LAB_DATA;
    if (D.TOOLTIP_TERMS[k]) return D.TOOLTIP_TERMS[k];
    const g = D.GLOSSARY.find((t) => t.id === k.toLowerCase() || t.term.toLowerCase() === k.toLowerCase());
    return g ? g.def : undefined;
  }
  function term(k, label) {
    const def = lookupDef(k);
    const text = label || k;
    return '<button type="button" class="term" data-term="' + esc(k) + '" aria-label="' + esc((label || k) + ": " + (def || "see glossary")) + '">' + esc(text) + "</button>";
  }

  function zoneIntro(index, title, blurb, mode) {
    return '<div class="zone-intro"><div class="zone-intro-top">' +
      '<span class="zone-area">AREA ' + esc(index) + "</span>" +
      '<h2 class="zone-title">' + esc(title) + "</h2>" +
      '<span class="mode-pill ' + (mode === "hard" ? "hard" : "medium") + '">' + (mode === "hard" ? "Independent assessment" : "Guided review") + "</span>" +
      '</div><p class="zone-blurb">' + esc(blurb) + "</p></div>";
  }

  function nextArea(target, label) {
    return '<div class="next-area"><button type="button" class="btn btn-next" data-goto="' + esc(target) + '">' + esc(label) + ' <span aria-hidden="true">→</span></button></div>';
  }

  /* ─── ObjectiveCard (bits.tsx) ─── */
  function objectiveCard(obj, widgetHtml, note) {
    const st = S.objState(S.state, obj.id);
    const hard = obj.mode === "hard";
    const hintsShown = obj.hints.slice(0, st.hints);

    let statusLine = "";
    if (st.solved) {
      statusLine = '<span class="ml-auto flex items-center gap-2">' +
        '<span class="obj-stats">' + (st.solvedFirstTry ? "first attempt" : st.wrong + " miss" + (st.wrong === 1 ? "" : "es")) + (st.hints > 0 ? " · " + st.hints + " hint" + (st.hints === 1 ? "" : "s") : "") + "</span>" +
        stamp("Verified", "green", -6) + "</span>";
    }

    let hintsHtml = "";
    if (hintsShown.length > 0) {
      hintsHtml = '<div class="obj-hints" aria-label="Hints revealed">' + hintsShown.map((h, i) =>
        '<p class="obj-hint">' + icon("lightbulb", 14) + "<span><strong>Hint " + (i + 1) + ':</strong> ' + esc(h) + "</span></p>"
      ).join("") + "</div>";
    }
    const canHint = st.hints < obj.hints.length && !st.solved;
    const hintBtn = canHint
      ? '<button type="button" class="btn btn-hint" data-fk="hint-' + obj.id + '" data-hint="' + obj.id + '">' + icon("lightbulb", 14) + " Reveal hint (" + (st.hints + 1) + "/" + obj.hints.length + ")" + (hard ? '<span class="hint-cost">· nudge — costs score</span>' : "") + "</button>"
      : "";

    const feedback =
      st.last === "pass" ? '<p class="obj-fb pass">' + stamp("Compliant", "green", -3, "fb-stamp") + esc(obj.success) + "</p>"
      : st.last === "fail" ? '<p class="obj-fb fail">' + stamp("Finding", "red", -3, "fb-stamp") + esc(obj.fail) + "</p>"
      : "";

    const checkRow = !st.solved
      ? '<button type="button" class="btn btn-check" data-fk="check-' + obj.id + '" data-check="' + obj.id + '">' + icon("stamp", 16) + " Check results</button>"
      : '<p class="obj-verified-line">Verified — logged on your clipboard.</p>';

    return '<section class="objective' + (st.solved ? " solved" : "") + '" aria-labelledby="' + obj.id + '-t">' +
      '<span class="objective-spine" aria-hidden="true"></span>' +
      '<div class="objective-in">' +
        '<div class="obj-head"><span class="obj-id">' + obj.id + "</span>" + pillarBadge(obj.pillar) + statusLine + "</div>" +
        '<h4 class="obj-title" id="' + obj.id + '-t">' + esc(obj.title) + "</h4>" +
        '<p class="obj-task">' + esc(obj.task) + "</p>" +
        '<p class="obj-anchor">Anchor: ' + esc(obj.anchor) + "</p>" +
        (note ? '<p class="obj-note">' + esc(note) + "</p>" : "") +
        hintsHtml + hintBtn +
        '<div class="obj-widget">' + widgetHtml + "</div>" +
        '<div class="obj-foot">' + checkRow +
          '<div role="status" aria-live="polite" class="obj-fb-wrap">' + feedback + "</div>" +
        "</div>" +
      "</div></section>";
  }

  /* ══════════════════════════ WIDGETS (widgets.tsx) ══════════════════════════ */

  // ClassifyBoard — assign each item to one category (toggle chips)
  function classifyBoard(envKey, data, columns) {
    const chosen = mapOf(S.state.env[envKey]);
    const root = el('<ul class="classify" aria-label="Classification board"></ul>');

    function itemLi(it) {
      const li = el('<li class="classify-item"><p class="classify-text">' + esc(it.text) + '</p><div class="classify-cats' + (columns ? " cols2" : "") + '"></div></li>');
      const row = li.querySelector(".classify-cats");
      data.categories.forEach((c) => {
        const on = chosen[it.id] === c.id;
        const b = el('<button type="button" class="cat' + (on ? " on" : "") + '" aria-pressed="' + on + '">' + (on ? icon("check", 14, "cat-check") : "") + esc(c.label) + "</button>");
        b.addEventListener("click", () => {
          S.actions.setEnv(envKey, (old) => { const m = Object.assign({}, mapOf(old)); m[it.id] = c.id; return m; });
          row.querySelectorAll(".cat").forEach((x) => { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); const ic = x.querySelector(".cat-check"); if (ic) ic.remove(); });
          b.classList.add("on"); b.setAttribute("aria-pressed", "true"); b.insertAdjacentHTML("afterbegin", icon("check", 14, "cat-check"));
        });
        row.appendChild(b);
      });
      return li;
    }
    data.items.forEach((it) => root.appendChild(itemLi(it)));
    return root;
  }

  // MatchBoard — assign each item to an option via a select
  function matchBoard(envKey, data, placeholder) {
    const chosen = mapOf(S.state.env[envKey]);
    const root = el('<ul class="match" aria-label="Matching board"></ul>');
    data.items.forEach((it) => {
      const opts = ['<option value="" disabled' + (chosen[it.id] ? "" : " selected") + ">" + esc(placeholder || "— assign a control —") + "</option>"]
        .concat(data.options.map((o) => '<option value="' + esc(o.id) + '"' + (chosen[it.id] === o.id ? " selected" : "") + ">" + esc(o.label) + "</option>"))
        .join("");
      const li = el('<li class="match-item"><p class="classify-text">' + esc(it.text) + '</p><select class="select select-match" aria-label="Control for: ' + esc(it.text) + '">' + opts + "</select></li>");
      li.querySelector("select").addEventListener("change", (ev) => {
        S.actions.setEnv(envKey, (old) => { const m = Object.assign({}, mapOf(old)); m[it.id] = ev.target.value; return m; });
      });
      root.appendChild(li);
    });
    return root;
  }

  // Sequencer — chain steps in order (same stable shuffle as the original)
  function sequencer(envKey, data) {
    const root = el('<div aria-label="Sequence builder"></div>');
    const seed = envKey.length * 31 + envKey.charCodeAt(0);

    function render() {
      const chain = listOf(S.state.env[envKey]);
      const used = new Set(chain);
      const shuffled = S.shuffleStable(data.steps, seed);
      root.innerHTML = "";
      const pool = el('<div class="seq-pool"></div>');
      shuffled.forEach((s) => {
        const on = used.has(s.id);
        const b = el('<button type="button" class="seq-card' + (on ? " used" : "") + '" aria-pressed="' + on + '"' + (on ? " disabled" : "") + ">" + esc(s.text) + "</button>");
        if (!on) b.addEventListener("click", () => { S.actions.setEnv(envKey, (old) => listOf(old).concat([s.id])); render(); });
        pool.appendChild(b);
      });
      root.appendChild(pool);

      const chainEl = el('<ol class="seq-chain" aria-label="Your sequence"></ol>');
      if (chain.length === 0) chainEl.appendChild(el('<li class="seq-empty">Click the cards above in the order they belong…</li>'));
      chain.forEach((id, i) => {
        const s = data.steps.find((x) => x.id === id);
        const li = el('<li class="seq-step"><span class="seq-num">' + (i + 1) + '</span><span class="seq-text">' + esc(s ? s.text : "") + '</span><button type="button" class="seq-remove" aria-label="Remove step ' + (i + 1) + ' from sequence">remove</button></li>');
        li.querySelector(".seq-remove").addEventListener("click", () => { S.actions.setEnv(envKey, (old) => listOf(old).filter((_, j) => j !== i)); render(); });
        chainEl.appendChild(li);
      });
      root.appendChild(chainEl);

      if (chain.length > 0) {
        const clear = el('<button type="button" class="seq-clear">' + icon("rotate-ccw", 14) + " Clear sequence</button>");
        clear.addEventListener("click", () => { S.actions.setEnv(envKey, []); render(); });
        root.appendChild(clear);
      }
    }
    render();
    return root;
  }

  // VerdictRows — two-way verdict + optional reason per row
  function verdictRows(envKey, data) {
    const root = el('<ul class="verdicts" aria-label="Verdict rows"></ul>');
    function render() {
      const val = S.state.env[envKey] || {};
      root.innerHTML = "";
      data.rows.forEach((row) => {
        const cur = val[row.id];
        const li = el('<li class="verdict-row"><div class="vr-top"><div class="vr-text"><p class="vr-main">' + esc(row.text) + "</p>" + (row.sub ? '<p class="vr-sub">' + esc(row.sub) + "</p>" : "") + '</div><div class="seg" role="group" aria-label="Verdict for ' + esc(row.text) + '"></div></div></li>');
        const seg = li.querySelector(".seg");
        data.verdictLabels.forEach((lab, vi) => {
          const on = cur && cur.v === vi;
          const b = el('<button type="button" class="seg-btn ' + (vi === 0 ? "neg" : "pos") + (on ? " on" : "") + '" aria-pressed="' + on + '">' + icon(vi === 0 ? "x" : "check", 14, "cat-check") + esc(lab) + "</button>");
          b.addEventListener("click", () => {
            S.actions.setEnv(envKey, (old) => {
              const v = Object.assign({}, old || {});
              const c = Object.assign({}, v[row.id] || {});
              c.v = vi;
              v[row.id] = c;
              return v;
            });
            render();
          });
          seg.appendChild(b);
        });
        if (data.reasons) {
          const rwrap = el('<div class="vr-reason"></div>');
          const opts = ['<option value="" disabled' + (cur && cur.r ? "" : " selected") + ">— pick the controlling reason —</option>"]
            .concat(data.reasons.map((r) => '<option value="' + esc(r.id) + '"' + (cur && cur.r === r.id ? " selected" : "") + ">" + esc(r.label) + "</option>")).join("");
          const sel = el('<select class="select" aria-label="Reason for verdict on ' + esc(row.text) + '">' + opts + "</select>");
          sel.addEventListener("change", (ev) => {
            S.actions.setEnv(envKey, (old) => {
              const v = Object.assign({}, old || {});
              const c = Object.assign({}, v[row.id] || {});
              c.r = ev.target.value;
              v[row.id] = c;
              return v;
            });
          });
          rwrap.appendChild(sel);
          li.appendChild(rwrap);
        }
        root.appendChild(li);
      });
    }
    render();
    return root;
  }

  // StateConfig — switches + selects (tolerant of untouched = initial values)
  function stateConfig(envKey, spec) {
    const root = el('<div class="cfg" aria-label="Configuration panel"></div>');
    const val = S.state.env[envKey] || {};
    const get = (id, initial) => (val[id] !== undefined ? val[id] : initial);

    spec.toggles.forEach((t) => {
      const on = get(t.id, t.initial) === true;
      const row = el('<div class="cfg-row"><label class="cfg-label" for="' + envKey + "-" + t.id + '">' + esc(t.label) + '</label><button type="button" role="switch" aria-checked="' + on + '" id="' + envKey + "-" + t.id + '" class="switch' + (on ? " checked" : "") + '"><span class="switch-thumb"></span></button></div>');
      const sw = row.querySelector(".switch");
      sw.addEventListener("click", () => {
        const now = sw.getAttribute("aria-checked") !== "true";
        S.actions.setEnv(envKey, (old) => { const m = Object.assign({}, old || {}); m[t.id] = now; return m; });
        sw.setAttribute("aria-checked", String(now));
        sw.classList.toggle("checked", now);
      });
      root.appendChild(row);
    });

    spec.selects.forEach((selSpec) => {
      const v = get(selSpec.id, selSpec.initial);
      const opts = selSpec.options.map((o) => '<option value="' + esc(o.id) + '"' + (v === o.id ? " selected" : "") + ">" + esc(o.label) + "</option>").join("");
      const row = el('<div class="cfg-row cfg-row-select"><label class="cfg-label" for="' + envKey + "-" + selSpec.id + '">' + esc(selSpec.label) + '</label><select class="select" id="' + envKey + "-" + selSpec.id + '">' + opts + "</select></div>");
      row.querySelector("select").addEventListener("change", (ev) => {
        S.actions.setEnv(envKey, (old) => { const m = Object.assign({}, old || {}); m[selSpec.id] = ev.target.value; return m; });
      });
      root.appendChild(row);
    });
    return root;
  }

  // RadioSet — several radio questions
  function radioSet(envKey, questions) {
    const root = el('<div class="radioqs" aria-label="Decision questions"></div>');
    const chosen = mapOf(S.state.env[envKey]);
    questions.forEach((q, qi) => {
      const qEl = el('<div class="radioq"><p class="radioq-prompt">' + (qi + 1) + ". " + esc(q.prompt) + '</p><div class="radio-group"></div></div>');
      const group = qEl.querySelector(".radio-group");
      q.options.forEach((o) => {
        const row = el('<div class="radio-row"><input type="radio" class="radio" id="' + envKey + "-" + q.id + "-" + o.id + '" name="' + envKey + "-" + q.id + '" value="' + esc(o.id) + '"' + (chosen[q.id] === o.id ? " checked" : "") + '><label class="radio-label" for="' + envKey + "-" + q.id + "-" + o.id + '">' + esc(o.label) + "</label></div>");
        row.querySelector("input").addEventListener("change", (ev) => {
          if (!ev.target.checked) return;
          S.actions.setEnv(envKey, (old) => { const m = Object.assign({}, mapOf(old)); m[q.id] = o.id; return m; });
        });
        group.appendChild(row);
      });
      root.appendChild(qEl);
    });
    return root;
  }

  // MultiSelectList — checkbox rows (renderItemHtml receives (it, on))
  function multiSelectList(envKey, data, renderItemHtml) {
    const root = el('<ul class="msl" aria-label="Selection list"></ul>');
    function render() {
      const sel = listOf(S.state.env[envKey]);
      root.innerHTML = "";
      data.items.forEach((it) => {
        const on = sel.includes(it.id);
        const li = el('<li><label class="msl-row' + (on ? " on" : "") + '"><input type="checkbox" class="checkbox" id="' + envKey + "-" + it.id + '"' + (on ? " checked" : "") + '><div class="msl-body">' + renderItemHtml(it, on) + "</div></label></li>");
        li.querySelector("input").addEventListener("change", () => {
          S.actions.setEnv(envKey, (old) => {
            const s = listOf(old);
            return s.includes(it.id) ? s.filter((x) => x !== it.id) : s.concat([it.id]);
          });
          const nowOn = listOf(S.state.env[envKey]).includes(it.id);
          li.querySelector(".msl-row").classList.toggle("on", nowOn);
          li.querySelector(".checkbox").checked = nowOn;
        });
        root.appendChild(li);
      });
    }
    render();
    return root;
  }

  /* ══════════════════════════ ARTIFACTS (artifacts.tsx) ══════════════════════════ */

  const KIND_ICON = { cloud: "cloud", fw: "shield", switch: "network", server: "server", db: "database", pos: "shopping-cart", laptop: "laptop", wifi: "wifi" };

  // CDE diagram — SVG wires + boundary, selectable node buttons
  function cdeDiagram(envKey, interactive) {
    const D = window.LAB_DATA;
    const root = el("<div></div>");
    const sel = listOf(S.state.env[envKey]);

    const box = el('<div class="diagram" role="group" aria-label="Logical network diagram of MRG-DC1"></div>');
    let svg = '<svg class="diagram-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect x="56.5" y="24" width="43" height="66" fill="rgba(47,93,70,0.05)" stroke="#2F5D46" stroke-dasharray="2 1.5" stroke-width="0.35" vector-effect="non-scaling-stroke"/>' +
      '<text x="58" y="27.5" font-size="2.4" fill="#2F5D46" class="diagram-svg-text">payment VLAN — CDE boundary to verify</text>';
    D.DIAGRAM_EDGES.forEach((pair) => {
      const na = D.DIAGRAM_NODES.find((n) => n.id === pair[0]);
      const nb = D.DIAGRAM_NODES.find((n) => n.id === pair[1]);
      if (!na || !nb) return;
      const ca = { cx: na.x + na.w / 2, cy: na.y + 5.2 };
      const cb = { cx: nb.x + nb.w / 2, cy: nb.y + 5.2 };
      svg += '<line x1="' + ca.cx + '" y1="' + ca.cy + '" x2="' + cb.cx + '" y2="' + cb.cy + '" stroke="#9AA08D" stroke-width="0.35" vector-effect="non-scaling-stroke"/>';
    });
    svg += "</svg>";
    box.appendChild(el(svg));

    D.DIAGRAM_NODES.forEach((n) => {
      const on = sel.includes(n.id);
      const wrap = el('<div class="node-wrap" style="left:' + n.x + "%;top:" + n.y + "%;width:" + n.w + '%;height:10.5%"></div>');
      const b = el('<button type="button" class="node' + (on ? " on" : "") + (interactive ? "" : " static") + '"' + (interactive ? ' aria-pressed="' + on + '"' : "") + (interactive ? "" : " disabled") + ">" +
        '<span class="node-top">' + icon(KIND_ICON[n.kind], 12, "ic-s") + '<span class="node-label">' + esc(n.label) + '</span></span>' +
        '<span class="node-sub">' + esc(n.sub) + "</span>" +
        (on ? '<span class="node-stamp">' + stamp("CDE", "green", -10, "mini") + "</span>" : "") +
        "</button>");
      if (interactive) {
        b.addEventListener("click", () => {
          S.actions.setEnv(envKey, (old) => {
            const s = listOf(old);
            return s.includes(n.id) ? s.filter((x) => x !== n.id) : s.concat([n.id]);
          });
          const nowOn = listOf(S.state.env[envKey]).includes(n.id);
          b.classList.toggle("on", nowOn);
          if (nowOn) b.setAttribute("aria-pressed", "true"); else b.setAttribute("aria-pressed", "false");
          const existing = b.querySelector(".node-stamp");
          if (nowOn && !existing) b.insertAdjacentHTML("beforeend", '<span class="node-stamp">' + stamp("CDE", "green", -10, "mini") + "</span>");
          if (!nowOn && existing) existing.remove();
        });
      }
      wrap.appendChild(b);
      box.appendChild(wrap);
    });
    root.appendChild(box);
    root.appendChild(el('<p class="diagram-cap">' + (interactive
      ? "Click assets to include them in / exclude them from the CDE. The dashed boundary is the payment VLAN — scope is yours to draw."
      : "Diagram is read-only in this task — work from the inventory below.") + "</p>"));
    return root;
  }

  // LogViewer — dark syslog with line flagging
  function logViewer(envKey) {
    const D = window.LAB_DATA;
    const root = el('<div class="logview" aria-label="Payment application syslog export"></div>');
    function render() {
      const sel = listOf(S.state.env[envKey]);
      root.innerHTML = "";
      const head = el('<div class="logview-head"><span>pay-app · syslog export · 2025-11-03</span><span class="logview-count">' + sel.length + " flagged</span></div>");
      root.appendChild(head);
      const ul = el('<ul class="logview-list thin-scroll"></ul>');
      D.LOG_LINES.forEach((l) => {
        const on = sel.includes(l.id);
        const b = el('<button type="button" class="logline' + (on ? " on" : "") + '" aria-pressed="' + on + '"><span class="logid">' + l.id + '</span><span class="logtext">' + esc(l.text) + '</span><span class="logwarn"' + (on ? "" : ' hidden') + ">" + icon("file-warning", 14) + "</span></button>");
        b.addEventListener("click", () => {
          S.actions.setEnv(envKey, (old) => {
            const s = listOf(old);
            return s.includes(l.id) ? s.filter((x) => x !== l.id) : s.concat([l.id]);
          });
          const nowOn = listOf(S.state.env[envKey]).includes(l.id);
          b.classList.toggle("on", nowOn);
          b.setAttribute("aria-pressed", String(nowOn));
          const w = b.querySelector(".logwarn");
          if (nowOn) w.removeAttribute("hidden"); else w.setAttribute("hidden", "");
          root.querySelector(".logview-count").textContent = listOf(S.state.env[envKey]).length + " flagged";
        });
        const li = document.createElement("li");
        li.appendChild(b);
        ul.appendChild(li);
      });
      root.appendChild(ul);
    }
    render();
    return root;
  }

  // FirewallVerdicts — per-rule Finding/Compliant segmented buttons
  function firewallVerdicts(envKey) {
    const D = window.LAB_DATA;
    const root = el('<div class="fwbox" aria-label="Firewall ruleset review"></div>');
    function render() {
      const val = S.state.env[envKey] || {};
      root.innerHTML = "";
      root.appendChild(el('<div class="fwbox-head"><span>fw2 · CDE firewall · ruleset export</span><span class="fwbox-meta">8 rules · export 2025-11-03</span></div>'));
      const ul = el("<ul></ul>");
      D.FIREWALL_RULES.forEach((r) => {
        const cur = val[r.id] ? val[r.id].v : undefined;
        const li = el('<li class="fw-row"><p class="fw-rule"><b>' + r.id + '</b> <span class="fw-act ' + r.action + '">' + r.action.toUpperCase() + "</span> " + esc(r.src) + ' <span class="fw-arrow">→</span> ' + esc(r.dst) + ' <span class="fw-port">' + esc(r.port) + '</span></p><div class="seg" role="group" aria-label="Verdict for ' + r.id + '"></div></li>');
        const seg = li.querySelector(".seg");
        ["Finding", "Compliant"].forEach((lab, vi) => {
          const on = cur === vi;
          const b = el('<button type="button" class="fw-btn ' + (on ? (vi === 0 ? "on-neg" : "on-pos") : "") + '" aria-pressed="' + on + '">' + lab + "</button>");
          b.addEventListener("click", () => {
            S.actions.setEnv(envKey, (old) => { const m = Object.assign({}, old || {}); m[r.id] = { v: vi }; return m; });
            render();
          });
          seg.appendChild(b);
        });
        ul.appendChild(li);
      });
      root.appendChild(ul);
    }
    render();
    return root;
  }

  // FirewallFix (H4) — remove-set + replacement rule
  function firewallFix(envKey) {
    const D = window.LAB_DATA;
    const root = el('<div class="fwfix" aria-label="Firewall repair"></div>');
    function render() {
      const val = mapOf(S.state.env[envKey]);
      const rm = listOf(val.remove);
      root.innerHTML = "";
      const p1 = el('<div class="fwfix-part"><p class="fwfix-lead">Part 1 — tick every rule to REMOVE:</p><ul class="fwfix-list"></ul></div>');
      const ul = p1.querySelector("ul");
      D.FIREWALL_RULES.forEach((r) => {
        const on = rm.includes(r.id);
        const b = el('<li><button type="button" class="fwfix-rule' + (on ? " on" : "") + '" aria-pressed="' + on + '"><span class="tickbox" aria-hidden="true">' + (on ? "✕" : "") + '</span><span class="fwfix-id">' + r.id + "</span><span>" + r.action.toUpperCase() + '</span><span class="fwfix-path">' + esc(r.src) + " → " + esc(r.dst) + " " + esc(r.port) + "</span></button></li>");
        b.querySelector("button").addEventListener("click", () => {
          S.actions.setEnv(envKey, (old) => {
            const m = Object.assign({}, mapOf(old));
            const list = listOf(m.remove);
            m.remove = list.includes(r.id) ? list.filter((x) => x !== r.id) : list.concat([r.id]);
            return m;
          });
          render();
        });
        ul.appendChild(b);
      });
      root.appendChild(p1);

      const p2 = el('<div class="fwfix-part"><p class="fwfix-lead">Part 2 — choose the ONE replacement rule for card-DB administration:</p><div class="fwfix-repl" role="radiogroup" aria-label="Replacement rule"></div></div>');
      const repl = p2.querySelector(".fwfix-repl");
      D.FIREWALL_FIX_H4.replacements.forEach((rep) => {
        const on = val.replace === rep.id;
        const b = el('<button type="button" role="radio" aria-checked="' + on + '" class="fwfix-repl-rule' + (on ? " on" : "") + '">' + (on ? "◉" : "○") + " " + esc(rep.label) + "</button>");
        b.addEventListener("click", () => {
          S.actions.setEnv(envKey, (old) => { const m = Object.assign({}, mapOf(old)); m.replace = rep.id; return m; });
          render();
        });
        repl.appendChild(b);
      });
      root.appendChild(p2);
    }
    render();
    return root;
  }

  return {
    esc, el, icon, stamp, evidenceCard, sectionTitle, pillarBadge, term, zoneIntro, nextArea,
    objectiveCard, lookupDef,
    classifyBoard, matchBoard, sequencer, verdictRows, stateConfig, radioSet, multiSelectList,
    cdeDiagram, logViewer, firewallVerdicts, firewallFix,
  };
})();
