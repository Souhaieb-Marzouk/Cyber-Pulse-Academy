/* ═══════════════════════════════════════════════════════════════════════════
   zones.js — the five walk-through areas (Briefing, Library, Card Data
   Center, Cloud Operations, Findings Desk) plus their zone-specific
   components (FrameworkCard, CloudStorageBoard, BreachClock).
   Ported from src/components/lab/zones/*.tsx — same content, same order,
   same Medium/Hard switching.
   ═══════════════════════════════════════════════════════════════════════════ */

window.LAB_ZONES = (function () {
  "use strict";

  const U = window.LAB_UI;
  const S = window.LAB_STORE;
  const D = window.LAB_DATA;
  const OBJ = window.LAB_OBJECTIVES.OBJ_BY_ID;

  // Objective section: card shell + a live widget node appended into it.
  function objSection(obj, widgetNode, note) {
    const sec = U.el(U.objectiveCard(obj, "", note));
    sec.querySelector(".obj-widget").appendChild(widgetNode);
    return sec;
  }

  /* ─── Library: FrameworkCard ─── */
  function frameworkCard(f) {
    const tone = f.name === "PCI DSS" ? "green" : f.name === "GDPR" ? "red" : "teal";
    const body =
      '<p class="fwc-full">' + U.esc(f.full) + "</p>" +
      '<p class="fwc-version">' + U.esc(f.version) + "</p>" +
      '<dl class="fwc-dl">' +
        '<div><dt class="fwc-dt">Applies to: </dt><dd class="fwc-dd">' + U.esc(f.applies) + "</dd></div>" +
        '<div><dt class="fwc-dt">Data in scope: </dt><dd class="fwc-dd">' + U.esc(f.data) + "</dd></div>" +
      "</dl>" +
      '<p class="fwc-duties">Network professional&#39;s duties</p>' +
      '<ul class="fwc-points">' + f.points.map((p) => "<li>" + U.esc(p) + "</li>").join("") + "</ul>" +
      '<p class="fwc-validation"><span class="fwc-dt">Proof: </span>' + U.esc(f.validation) + "</p>" +
      '<p class="fwc-teeth"><span class="fwc-teeth-b">Teeth: </span>' + U.esc(f.teeth) + "</p>";
    return U.el(U.evidenceCard({ title: f.name, kicker: f.kind, tone: tone }, body));
  }

  /* ─── Cloud Ops: storage console (region columns + flag buttons) ─── */
  function cloudStorageBoard(envKey) {
    const root = U.el('<div class="cloud-board" aria-label="StratusCloud storage console"></div>');
    function render() {
      const sel = S.listOf(S.state.env[envKey]);
      root.innerHTML = "";
      const regions = [];
      D.CLOUD_STORES.forEach((s) => { if (!regions.includes(s.region)) regions.push(s.region); });
      regions.forEach((reg) => {
        const rows = D.CLOUD_STORES.filter((s) => s.region === reg);
        const col = U.el('<div class="cloud-col"><div class="cloud-col-head">' + U.icon("map-pin", 14) + '<span>' + U.esc(reg) + '</span></div><ul class="cloud-list"></ul></div>');
        const ul = col.querySelector(".cloud-list");
        rows.forEach((s) => {
          const on = sel.includes(s.id);
          const li = U.el('<li class="cloud-row' + (on ? " flagged" : "") + '"><p class="cloud-name">' + U.esc(s.name) + '</p><p class="cloud-class">' + U.esc(s.classification) + '</p><div class="cloud-flag"></div></li>');
          const flagWrap = li.querySelector(".cloud-flag");
          const b = U.el('<button type="button" class="flag-btn' + (on ? " on" : "") + '" aria-pressed="' + on + '">' + (on ? "VIOLATION ✓" : "Flag violation") + "</button>");
          b.addEventListener("click", () => {
            S.actions.setEnv(envKey, (old) => {
              const arr = S.listOf(old);
              return arr.includes(s.id) ? arr.filter((x) => x !== s.id) : arr.concat([s.id]);
            });
            const nowOn = S.listOf(S.state.env[envKey]).includes(s.id);
            b.classList.toggle("on", nowOn);
            b.setAttribute("aria-pressed", String(nowOn));
            b.textContent = nowOn ? "VIOLATION ✓" : "Flag violation";
            li.classList.toggle("flagged", nowOn);
            const existing = flagWrap.querySelector(".stamp");
            if (nowOn && !existing) flagWrap.insertAdjacentHTML("beforeend", '<span class="flag-stamp">' + U.stamp("Locality", "red", -7, "mini") + "</span>");
            if (!nowOn && existing) existing.parentElement.remove();
          });
          flagWrap.appendChild(b);
          if (on) flagWrap.insertAdjacentHTML("beforeend", '<span class="flag-stamp">' + U.stamp("Locality", "red", -7, "mini") + "</span>");
          ul.appendChild(li);
        });
        root.appendChild(col);
      });
    }
    render();
    return root;
  }

  /* ─── Findings: 72-hour breach clock ─── */
  // Audit R4/R5: correct option is not first and not the longest; Dr. Diallo's
  // coordinating role stays in the objective's success feedback, not the label.
  const WHO_OPTIONS = [
    { id: "customers", label: "The affected customers, before any regulator" },
    { id: "brands", label: "The card brands through our processor, PayBridge" },
    { id: "supervisory", label: "The supervisory authority (data-protection regulator)" },
    { id: "none", label: "Nobody — hashed passwords are not personal data" },
  ];
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function deadlineLabel(h) {
    // Awareness is Monday 09:12; add h hours to the 09:12 base (fixes the
    // 12:12 drift found in audit — at h=0 this must read Mon 09:12).
    const day = DAYS[Math.min(DAYS.length - 1, Math.floor(h / 24))];
    const hh = String((9 + (h % 24)) % 24).padStart(2, "0");
    return day + " " + hh + ":12";
  }

  function breachClock(envKey) {
    const root = U.el('<div class="breach"></div>');
    function render() {
      const raw = S.state.env[envKey] || {};
      const h = typeof raw.h === "number" ? raw.h : 0;
      const who = typeof raw.who === "string" ? raw.who : "";
      root.innerHTML = "";
      root.appendChild(U.el(U.evidenceCard({ title: "Incident ticket INC-8841", kicker: "Leo Tanaka · SOC", tone: "red" },
        '<pre class="memo">' + U.esc(D.BREACH_TICKET) + "</pre>")));

      const sliderCard = U.el('<div class="breach-slider-card">' +
        '<label class="cfg-label breach-label" for="breach-slider">Deadline marker — hours after awareness (Mon 09:12): <span class="breach-val" data-breach-val>' + h + " h ≈ " + deadlineLabel(h) + '</span></label>' +
        '<input type="range" id="breach-slider" class="slider" min="0" max="120" step="1" value="' + h + '" aria-label="Hours after awareness">' +
        '<div class="slider-ticks" aria-hidden="true"><span>0 h</span><span>24</span><span>48</span><span>72</span><span>96</span><span>120</span></div>' +
        "</div>");
      const range = sliderCard.querySelector("input");
      const paint = () => {
        const p = ((range.value - range.min) / (range.max - range.min)) * 100;
        range.style.background = "linear-gradient(to right, var(--ink-strong) " + p + "%, #e5e5e5 " + p + "%)";
        sliderCard.querySelector("[data-breach-val]").textContent = range.value + " h ≈ " + deadlineLabel(Number(range.value));
      };
      range.addEventListener("input", () => {
        paint();
        S.actions.setEnv(envKey, (old) => { const m = Object.assign({}, old || {}); m.h = Number(range.value); return m; });
      });
      paint();
      root.appendChild(sliderCard);

      const whoCard = U.el('<div class="breach-who"><p class="cfg-label">Who does Meridian notify first?</p><div class="radio-group"></div></div>');
      const group = whoCard.querySelector(".radio-group");
      WHO_OPTIONS.forEach((o) => {
        const row = U.el('<div class="radio-row"><input type="radio" class="radio" id="who-' + o.id + '" name="who-breach" value="' + o.id + '"' + (who === o.id ? " checked" : "") + '><label class="radio-label" for="who-' + o.id + '">' + U.esc(o.label) + "</label></div>");
        row.querySelector("input").addEventListener("change", (ev) => {
          if (!ev.target.checked) return;
          S.actions.setEnv(envKey, (old) => { const m = Object.assign({}, old || {}); m.who = o.id; return m; });
        });
        group.appendChild(row);
      });
      root.appendChild(whoCard);
    }
    render();
    return root;
  }

  /* ═══════════════════ ZONE RENDERERS ═══════════════════ */

  function briefingZone(st) {
    const hard = st.mode === "hard";
    const wrap = U.el('<div class="zone-stack"></div>');
    wrap.appendChild(U.el(U.zoneIntro("1", "Briefing Room", hard ? "Your engagement packet. Two of the documents here are noise — a QSA learns to smell it." : "Your assignment memo and the audit correspondence file.", st.mode)));

    wrap.appendChild(U.el(U.evidenceCard({ title: "Assignment memo — case " + D.CASE_ID, kicker: "read me first" }, '<pre class="memo">' + U.esc(D.MEMO) + "</pre>")));

    const tray = U.el("<div></div>");
    tray.appendChild(U.el(U.sectionTitle("Correspondence tray", hard ? "Correspondence tray — who audits whom, and who merely tests?" : "Four documents, four different relationships to Meridian.")));
    const grid = U.el('<div class="letter-grid"></div>');
    D.LETTERS.forEach((l) => {
      const tone = l.tone;
      grid.appendChild(U.el(U.evidenceCard({ title: l.from, kicker: l.subject, tone: tone },
        '<p class="letter-body">' + U.esc(l.body) + '</p><p class="letter-stamp">' + U.stamp(l.tag, tone === "red" ? "red" : tone === "amber" ? "amber" : tone === "teal" ? "teal" : "green", -4, "small") + "</p>")));
    });
    if (hard) {
      grid.appendChild(U.el(U.evidenceCard({ title: "Interoffice (archived 2019)", kicker: "records retention", tone: "amber" }, '<pre class="memo memo-faded">' + U.esc(D.LEGACY_MEMO) + "</pre>")));
    }
    tray.appendChild(grid);
    wrap.appendChild(tray);

    if (!hard) {
      wrap.appendChild(objSection(OBJ["OBJ-M1"], U.classifyBoard("m1", D.AUDIT_PARTIES, true), "Where to look: every letter above names who performs the work."));
      wrap.appendChild(objSection(OBJ["OBJ-M3"], U.radioSet("m3", D.ATTESTATION_QS), null));
    } else {
      wrap.appendChild(objSection(OBJ["OBJ-H7"], U.sequencer("h7", D.LIFECYCLE_H7), "The Lead Auditor wants the engagement calendar before fieldwork begins."));
    }

    wrap.appendChild(U.el('<p class="jargon-line">Jargon check: ' + U.term("QSA") + " · " + U.term("SAQ") + " · " + U.term("AOC") + " · " + U.term("ROC") + " — all in the glossary (top right).</p>"));
    wrap.appendChild(U.el(U.nextArea("library", "Next: the Compliance Library")));
    return wrap;
  }

  function libraryZone(st) {
    const hard = st.mode === "hard";
    const wrap = U.el('<div class="zone-stack"></div>');
    wrap.appendChild(U.el(U.zoneIntro("2", "Compliance Library", "The framework wall: three cards decide most exam questions in this chapter.", st.mode)));

    const grid = U.el('<div class="fw-grid"></div>');
    grid.appendChild(frameworkCard(D.FRAMEWORK_PCI));
    grid.appendChild(frameworkCard(D.FRAMEWORK_GDPR));
    grid.appendChild(frameworkCard(D.FRAMEWORK_LOCALITY));
    wrap.appendChild(grid);

    wrap.appendChild(U.el('<p class="simplify-note">Simplified for this chapter: GDPR restricts <em>transfers</em> of EU personal data outside the EEA (safeguards such as an ' + U.term("SCC") + " replace outright bans), while some countries&#39; <em>localization laws</em> do force in-country storage. Meridian&#39;s own contract can be stricter than either — auditors check all three layers. Also on the wall, for contrast: <strong>HIPAA</strong> (US health data), <strong>SOX</strong> (US financial reporting), <strong>ISO 27001</strong> (certifiable ISMS) and <strong>SOC 2</strong> (an attestation, not a law).</p>"));

    if (!hard) {
      wrap.appendChild(objSection(OBJ["OBJ-M2"], U.classifyBoard("m2", D.FRAMEWORK_SORT, true), "Where to look: each claim above carries exactly one framework's fingerprint."));
    } else {
      const s1 = U.el("<div></div>");
      s1.appendChild(U.el(U.sectionTitle("Consequence plaques", "Private enforcement versus statute versus contract — match the lever to the failure.")));
      s1.appendChild(objSection(OBJ["OBJ-H6"], U.matchBoard("h6", D.CONSEQUENCES_H6, "— assign a control —"), null));
      wrap.appendChild(s1);
      const s2 = U.el("<div></div>");
      s2.appendChild(U.el(U.sectionTitle("Spotlight wall", "Six one-line cases. Two belong to regimes this chapter only name-drops.")));
      s2.appendChild(objSection(OBJ["OBJ-H9"], U.classifyBoard("h9", D.SPOTLIGHT_H9, true), null));
      wrap.appendChild(s2);
    }

    wrap.appendChild(U.el(U.nextArea("datacenter", "Next: the Card Data Center")));
    return wrap;
  }

  function dataCenterZone(st) {
    const hard = st.mode === "hard";
    const wrap = U.el('<div class="zone-stack"></div>');
    wrap.appendChild(U.el(U.zoneIntro("3", "Card Data Center (MRG-DC1)", hard ? "Diagram and inventory disagree about nothing — but the inventory sees more. Trust data, not names." : "Diagram, ruleset, logs and logging controls — the QSA's first stop.", st.mode)));

    if (!hard) {
      wrap.appendChild(objSection(OBJ["OBJ-M4"], U.cdeDiagram("m4", true), null));
      wrap.appendChild(objSection(OBJ["OBJ-M7"], U.firewallVerdicts("m7"), null));
      wrap.appendChild(objSection(OBJ["OBJ-M6"], U.logViewer("m6"), "Where to look: scan for card-number shapes in the export below."));
      wrap.appendChild(objSection(OBJ["OBJ-M8"], U.stateConfig("m8", D.LOG_CONFIG), null));
    } else {
      const h1Widget = U.el("<div></div>");
      h1Widget.appendChild(U.cdeDiagram("__view_only", false));
      const inv = U.el('<div class="inventory"></div>');
      inv.appendChild(U.el(U.sectionTitle("System inventory", "The QSA's pre-work sheet — 15 systems. Select exactly those inside the CDE.")));
      inv.appendChild(U.multiSelectList("h1", { items: D.INVENTORY_H1.map((r) => ({ id: r.id, text: "" })), answer: [] }, (it) => {
        const row = D.INVENTORY_H1.find((r) => r.id === it.id);
        return '<span class="inv-row"><b>' + U.esc(row.host) + '</b> <span class="inv-data">— ' + U.esc(row.data) + "</span></span>";
      }));
      h1Widget.appendChild(inv);
      wrap.appendChild(objSection(OBJ["OBJ-H1"], h1Widget, null));
      wrap.appendChild(objSection(OBJ["OBJ-H4"], U.firewallFix("h4"), null));
    }

    const cheat = U.el("<div></div>");
    cheat.appendChild(U.el(U.sectionTitle("Evidence standards cheat-sheet", hard ? "Reference while you judge the ruleset." : "Log evidence only counts when the pipeline behind it is sound.")));
    cheat.appendChild(U.el('<div class="cheatsheet"><p>' + U.term("NTP") + " synchronization → logs across systems can be correlated (PCI DSS Req 10.6).</p><p>Retention: 12 months of audit-log history, the most recent 3 months immediately available (Req 10.5.1).</p><p>Tamper protection: logs must be proof against alteration (Req 10.5). A " + U.term("PAN") + " in any log makes that log cardholder data.</p></div>"));
    wrap.appendChild(cheat);

    wrap.appendChild(U.el(U.nextArea("cloudops", "Next: Cloud Operations")));
    return wrap;
  }

  function cloudOpsZone(st) {
    const hard = st.mode === "hard";
    const wrap = U.el('<div class="zone-stack"></div>');
    wrap.appendChild(U.el(U.zoneIntro("4", "Cloud Operations", hard ? "Policy P-7 is on the desk. Rule on every transfer — contract, law and geography all bite." : "StratusCloud console: audit what lives where, then configure the new EU launch.", st.mode)));

    if (!hard) {
      wrap.appendChild(objSection(OBJ["OBJ-M5"], cloudStorageBoard("m5"), "Where to look: check each dataset's classification, then its region."));
      wrap.appendChild(objSection(OBJ["OBJ-M11"], U.stateConfig("m11", D.LAUNCH_CONFIG), "Target: a launch that passes a data-locality review on the first pass."));
    } else {
      wrap.appendChild(U.el(U.evidenceCard({ title: "Policy P-7 — data residency (composite)", kicker: "governing document", tone: "teal" }, '<pre class="memo">' + U.esc(D.LOCALITY_H3.policy) + "</pre>")));
      wrap.appendChild(objSection(OBJ["OBJ-H3"], U.verdictRows("h3", D.LOCALITY_H3), null));
    }

    const qr = U.el("<div></div>");
    qr.appendChild(U.el(U.sectionTitle("Locality quick reference", null)));
    qr.appendChild(U.el('<div class="cheatsheet"><p><strong>Data locality</strong> — where the data physically lives · <strong>Data sovereignty</strong> — whose laws reach it.</p><p>Replicas, analytics copies and backups inherit their source&#39;s rules. ' + U.term("Geo-blocking") + " fences access; region selection fences storage.</p></div>"));
    wrap.appendChild(qr);

    wrap.appendChild(U.el(U.nextArea("findings", "Next: the Findings Desk")));
    return wrap;
  }

  function findingsZone(st) {
    const hard = st.mode === "hard";
    const wrap = U.el('<div class="zone-stack"></div>');
    wrap.appendChild(U.el(U.zoneIntro("5", "Findings Desk", hard ? "Everything you collected lands here: triage it, evidence it, and close the engagement." : "The breach clock, your remediation plan, and the audit lifecycle.", st.mode)));

    if (!hard) {
      wrap.appendChild(objSection(OBJ["OBJ-M9"], breachClock("m9"), "Where to look: the ticket's confirmation timestamp starts the clock."));
      wrap.appendChild(objSection(OBJ["OBJ-M10"], U.matchBoard("m10", D.FINDINGS_M10, "— assign a control —"), null));
      wrap.appendChild(objSection(OBJ["OBJ-M12"], U.sequencer("m12", D.LIFECYCLE_M12), null));
    } else {
      const s1 = U.el("<div></div>");
      s1.appendChild(U.el(U.sectionTitle("Triage board", "Eight cards from every area of the walk-through. Two are red herrings.")));
      s1.appendChild(objSection(OBJ["OBJ-H2"], U.classifyBoard("h2", D.TRIAGE_H2, true), null));
      wrap.appendChild(s1);
      const s2 = U.el("<div></div>");
      s2.appendChild(U.el(U.sectionTitle("Evidence pack for the QSA", "Every artifact proves exactly one requirement.")));
      s2.appendChild(objSection(OBJ["OBJ-H5"], U.matchBoard("h5", D.EVIDENCE_H5, "— assign a control —"), null));
      wrap.appendChild(s2);
      const s3 = U.el("<div></div>");
      s3.appendChild(U.el(U.sectionTitle("Attestation decision", "The assessment is over — sign it correctly.")));
      s3.appendChild(objSection(OBJ["OBJ-H8"], U.radioSet("h8", D.ATTESTATION_H8.questions), null));
      wrap.appendChild(s3);
    }

    wrap.appendChild(U.el(U.nextArea("interview", "Next: the Exit Interview")));
    return wrap;
  }

  return { briefingZone, libraryZone, dataCenterZone, cloudOpsZone, findingsZone };
})();
