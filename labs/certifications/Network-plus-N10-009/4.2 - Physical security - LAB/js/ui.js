/* ── ui.js ───────────────────────────────────────────────────────────
   Rendering layer for the static lab: view templates + targeted DOM
   updates. Structure mirrors the original React components 1:1
   (same panels, same wording, same aria contracts, same behaviors).

   Update strategy:
   • Full renders: boot, mode selection, mode change, RESET, layer open.
   • Everything else is a targeted in-place update so keyboard focus is
     preserved exactly like React's in-place reconciliation did.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var D = window.LabData;
  var OBJ = window.LabObjectives;
  var ST = window.LabState;
  var A = ST.actions;
  var SEL = ST.select;
  var ic = window.LabIcons.icon;

  var S = ST.get();
  ST.subscribe(function () {
    S = ST.get();
  });

  /* ── helpers ─────────────────────────────────────────────────────── */

  function esc(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  var PILLAR = {
    U: { label: "Understand", cls: "pill pill-u" },
    R: { label: "Recognize", cls: "pill pill-r" },
    D: { label: "Detect", cls: "pill pill-d" },
    M: { label: "Mitigate", cls: "pill pill-m" },
  };

  function badge(tone, text) {
    return '<span class="badge badge-' + tone + '">' + esc(text) + "</span>";
  }

  function selHtml(path, options, val, placeholder, label) {
    var opts = options.map(function (t) {
      var v = typeof t === "object" ? t.value : t;
      var l = typeof t === "object" ? t.label : t;
      var selected = val !== undefined && val !== null && String(val) === String(v) ? " selected" : "";
      return '<option value="' + esc(v) + '"' + selected + ">" + esc(l) + "</option>";
    }).join("");
    var ph = '<option value="" disabled' + (val ? "" : " selected") + " hidden>" + esc(placeholder) + "</option>";
    return (
      '<select class="sel" data-env="' + esc(path) + '" aria-label="' + esc(label) + '">' + ph + opts + "</select>"
    );
  }

  function switchHtml(path, key, checked, label) {
    return (
      '<button type="button" class="switch' + (checked ? " on" : "") + '" role="switch" aria-checked="' +
      (!!checked) + '" aria-label="' + esc(label) + '" data-switch="' + esc(path + "." + key) + '">' +
      '<span class="switch-thumb"></span></button>'
    );
  }

  /* ── mode select screen (ModeSelect.tsx) ─────────────────────────── */

  var MODES = [
    {
      mode: "medium",
      title: "Guided Shift",
      tag: "MEDIUM — learn & understand",
      desc: "The full night, walked step by step. 12 short objectives, tiered hints, teaching feedback on every check. Perfect your first time on this floor.",
      bullets: [
        "12 guided objectives across all four mastery pillars",
        "3-level hints — free to use, they only cost stars",
        "Tolerant checks: close-enough answers still teach",
      ],
      icon: "UserCheck",
    },
    {
      mode: "hard",
      title: "Incident Solo",
      tag: "HARD — test & stretch",
      desc: "You get the same evidence — plus an alert queue hiding two red herrings, strict validation and no hand-holding. Prove you can run the investigation alone.",
      bullets: [
        "8 broad multi-step challenges (analyze → detect → mitigate)",
        "Alert triage with red herrings; exact-value validation",
        "Hints off except one nudge that costs score",
      ],
      icon: "ShieldCheck",
    },
  ];

  function renderModeSelect(root) {
    var cards = MODES.map(function (m, i) {
      var bullets = m.bullets.map(function (b) {
        return '<li class="mode-bullet">' + ic("Timer", "i-14") + "<span>" + esc(b) + "</span></li>";
      }).join("");
      return (
        '<button type="button" class="mode-card fade-up" data-action="set-mode" data-mode="' + m.mode + '"' +
        ' style="animation-delay:' + (0.1 + i * 0.1).toFixed(1) + 's"' +
        ' aria-label="Select ' + esc(m.title) + ' mode: ' + esc(m.tag) + '">' +
        '<span class="mode-card-head"><span class="mode-card-icon">' + ic(m.icon, "i-24") + "</span>" +
        "<span><h2 class=\"mode-title\">" + esc(m.title) + '</h2><p class="mode-tag">' + esc(m.tag) + "</p></span></span>" +
        '<p class="mode-desc">' + esc(m.desc) + "</p>" +
        '<ul class="mode-bullets">' + bullets + "</ul>" +
        '<span class="mode-start">' + ic("Camera", "i-16") + " Start shift " + ic("KeyRound", "i-16") + "</span>" +
        "</button>"
      );
    }).join("");

    root.innerHTML = "";
    root.appendChild(el(
      '<div class="mode-screen">' +
        '<div class="mode-inner">' +
          '<div class="fade-up">' +
            '<div class="chip-row">' +
              '<span class="chip">Training lab · synthetic data only</span>' +
              '<span class="chip">CompTIA Network+ N10-009 · Domain 4 · Physical security</span>' +
            "</div>" +
            '<h1 class="lab-title">Night Shift<span class="t-phosphor">:</span> Cameras <span class="t-amber">&amp;</span> Locks</h1>' +
            '<p class="lab-sub">06:00 at <strong>' + esc(D.FACILITY.name) + "</strong>. Last night one camera went dark, one keypad gave up, and a stranger left a device in the IDF closet. Your shift: read the evidence, find the chain, and harden the floor — the cameras-and-locks core of the Network+ physical-security lesson, end to end.</p>" +
          "</div>" +
          '<div class="mode-grid">' + cards + "</div>" +
          '<p class="footnote">All organizations, people, logs and events are fictional training data · defensive / educational purpose</p>' +
        "</div>" +
      "</div>"
    ));
  }

  /* ── panel factory (Panel.tsx) ───────────────────────────────────── */

  function panel(id, title, icon, desc, contentHtml) {
    return (
      '<section id="panel-' + id + '" class="panel" aria-label="' + esc(title) + '" data-panel="' + id + '">' +
        '<div class="ring-flash flash-el" hidden></div>' +
        '<header class="panel-head"><span class="panel-icon">' + icon + "</span>" +
          '<h2 class="panel-title">' + esc(title) + "</h2>" +
          '<span class="next-step-badge" hidden>Next step</span></header>' +
        (desc ? '<p class="panel-desc">' + esc(desc) + "</p>" : "") +
        '<div class="panel-body">' + contentHtml + "</div>" +
      "</section>"
    );
  }

  /* ── camera wall (CameraWall.tsx) ────────────────────────────────── */

  function feedHtml(c) {
    var lost = c.status === "SIGNAL LOST";
    var svgScene =
      '<svg viewBox="0 0 160 80" class="feed-svg" aria-hidden="true">' +
      '<rect x="0" y="52" width="160" height="28" fill="#1c2f22"/>' +
      '<rect x="' + (c.id === "SRV-03" ? 60 : 110) + '" y="24" width="14" height="28" rx="2" fill="#233c2b"/>' +
      '<rect x="' + (c.id === "SRV-03" ? 80 : 128) + '" y="30" width="10" height="22" rx="2" fill="#1f3627"/>' +
      '<circle cx="26" cy="18" r="8" fill="none" stroke="#2c9a51" stroke-width="1.5"/>' +
      '<path d="M26 10 v-6 M26 26 v6 M18 18 h-6 M34 18 h6" stroke="#2c9a51" stroke-width="1.2"/>' +
      "</svg>";
    var motion = (c.motion || []).map(function (m) {
      return '<p class="motion-flag">' + esc(m.time) + " — " + esc(m.detail) + "</p>";
    }).join("");
    return (
      '<div class="feed' + (lost ? " feed-lost" : "") + '">' +
        '<div class="feed-view scanlines' + (lost ? " static-noise" : " feed-scene") + '" aria-hidden="true">' +
          (lost
            ? '<div class="sig-pulse feed-nosig">' + ic("VideoOff", "i-20") + '<span>no signal</span></div>'
            : svgScene + '<span class="rec-dot feed-rec">REC</span>') +
        "</div>" +
        '<div class="feed-meta">' +
          '<div class="feed-row"><span class="feed-id">' + esc(c.id) + '</span><span class="feed-zone">' + esc(c.zone) + "</span></div>" +
          '<div class="feed-badges">' + badge("steel", c.type) + badge("steel", c.res) +
            badge(c.ir ? "green" : "red", c.ir ? "IR" : "no IR") +
            (lost ? badge("red", "signal lost " + c.since) : badge("green", "online")) +
          "</div>" +
          '<p class="feed-scene-text">' + esc(c.scene) + "</p>" + motion +
        "</div>" +
      "</div>"
    );
  }

  function cameraWallHtml() {
    var feeds = D.CAMERAS.map(feedHtml).join("");
    var tamper =
      '<div class="tamper-row">' +
        '<span class="tamper-label">Tamper assessment</span>' +
        selHtml("tamper.cam", D.CAMERAS.map(function (c) { return { value: c.id, label: c.id }; }), S.env.tamper.cam, "camera with lost signal…", "Camera that lost signal") +
        selHtml("tamper.cause", [
          { value: "tamper", label: "Camera tampering likely" },
          { value: "power", label: "Power outage (utility)" },
          { value: "network", label: "Network maintenance" },
          { value: "storage", label: "Storage full" },
        ], S.env.tamper.cause, "most likely cause…", "Most likely cause") +
      "</div>";
    return panel("camerawall", "Camera Wall — 8 feeds", ic("Camera", "i-16"),
      "Live wall, 06:00 review. Feed metadata (type, resolution, IR, status) is evidence — read it like a log line. TRAINING DATA: synthetic scenes.",
      '<div class="feed-grid">' + feeds + "</div>" + tamper);
  }

  /* ── schematic (Schematic.tsx) ───────────────────────────────────── */

  var CONES = {
    parking: { from: "PRK-07", d: "M210,44 L120,8 M210,44 L300,8 M210,44 L210,4" },
    reception: { from: "LOB-01", d: "M55,140 L20,105 M55,140 L92,105 M55,140 L20,178" },
    corridor: { from: "COR-02", d: "M160,140 L104,106 M160,140 L216,106 M160,140 L104,176 M160,140 L216,176" },
    server: { from: "SRV-03", d: "M270,88 L234,66 M270,88 L306,66 M270,88 L234,110" },
    electrical: { from: "ELE-08", d: "M365,88 L334,66 M365,88 L396,66 M365,88 L334,110" },
    storage: { from: "STG-05", d: "M75,216 L24,194 M75,216 L126,194 M75,216 L24,238" },
    dock: { from: "DCK-06", d: "M365,216 L334,194 M365,216 L396,194 M365,216 L334,238" },
  };

  function schematicSvg() {
    var idfCovered = !!S.env.zoneCam["idf"];
    var cones = "";
    D.ZONES.forEach(function (z) {
      if (!(z.id !== "idf" || idfCovered)) return;
      var cone = CONES[z.id];
      if (!cone) return;
      var origin = cone.d.split(" ")[0].slice(1).split(",");
      cones +=
        '<g stroke="' + (z.id === "idf" ? "#3ecf6e" : "#2c9a51") + '" stroke-width="1.2" opacity="0.9">' +
        '<path d="' + cone.d + '" fill="none"/>' +
        '<circle cx="' + origin[0] + '" cy="' + origin[1] + '" r="2.5" fill="#3ecf6e" stroke="none"/></g>';
    });
    return (
      '<svg viewBox="0 0 420 260" class="schematic-svg" role="img" aria-label="Facility floor plan with camera fields of view">' +
        '<rect x="10" y="6" width="400" height="38" fill="#101a12" stroke="#24312a"/>' +
        '<text x="14" y="20" class="svg-inkdim" font-size="8">PARKING LOT B (exterior)</text>' +
        '<rect x="10" y="52" width="400" height="200" fill="#0e150f" stroke="#2a382f" stroke-width="2"/>' +
        cones +
        '<g stroke="#2a382f" fill="#121b13">' +
          '<rect x="20" y="100" width="72" height="80"/>' +
          '<rect x="100" y="100" width="120" height="80"/>' +
          '<rect x="100" y="60" width="56" height="32"' +
            (idfCovered ? ' stroke="#2c9a51"' : ' class="dash-idf" stroke="#e8a33d"') + ' stroke-dasharray="4 3" fill="#1a1408"/>' +
          '<rect x="230" y="60" width="82" height="52"/>' +
          '<rect x="330" y="60" width="70" height="52"/>' +
          '<rect x="20" y="190" width="112" height="52"/>' +
          '<rect x="330" y="190" width="70" height="52"/>' +
        "</g>" +
        '<g class="svg-ink" font-size="8">' +
          '<text x="26" y="138">LOBBY</text><text x="128" y="142">CORRIDOR</text>' +
          '<text x="104" y="78" class="' + (idfCovered ? "svg-phosphor" : "svg-amber") + '">IDF CLOSET</text>' +
          '<text x="240" y="88">SERVER RM</text><text x="338" y="88">ELECTRICAL</text>' +
          '<text x="28" y="218">STORAGE CAGE</text><text x="334" y="218">DOCK</text>' +
        "</g>" +
        '<g class="svg-amber" font-size="7">' +
          '<text x="46" y="184">DR-FRONT · card</text><text x="104" y="96">DR-IDF-01 · keypad</text>' +
          '<text x="104" y="184">DR-03 · badge</text><text x="236" y="116">DR-SRV-02 · keypad</text>' +
          '<text x="30" y="238">DR-STG · padlock</text><text x="334" y="238">DR-DCK · keypad</text>' +
        "</g>" +
      "</svg>"
    );
  }

  function schematicControlsHtml() {
    return (
      '<div class="mount-grid">' +
        selHtml("zoneCam.__pick", D.ZONES.map(function (z) { return { value: z.id, label: z.name }; }),
          S.env.zoneCam["__pick"], "1 — select the uncovered zone", "Zone") +
        selHtml("zoneCam.__caml", D.SPARE_CAMERAS.map(function (c) { return { value: c.id, label: c.label }; }),
          S.env.zoneCam["__caml"], "2 — pick a spare camera", "Spare camera") +
        '<button type="button" class="btn btn-primary" data-action="mount" aria-label="Mount camera on zone">' +
          ic("MapPin", "i-16") + " Mount</button>" +
      "</div>" +
      '<p class="mount-note" id="mount-note" role="status"' + (S.env.mountNote ? "" : " hidden") + ">" + esc(S.env.mountNote || "") + "</p>" +
      '<p class="covered-note" id="covered-note" role="status"' + (S.env.zoneCam["idf"] ? "" : " hidden") + ">IDF closet now covered by " + esc(S.env.zoneCam["idf"] || "") + " — wedge added to schematic.</p>"
    );
  }

  function schematicHtml() {
    return panel("schematic", "Facility Schematic — FOV & doors", ic("Radar", "i-16"),
      "Green wedges = camera field of view. One sensitive zone has no wedge — find it, then assign a spare camera from the shelf.",
      '<div id="schematic-svg-wrap">' + schematicSvg() + "</div>" + schematicControlsHtml());
  }

  var lastSchematicSig = null;

  function updateSchematic() {
    var sig = (!!S.env.zoneCam["idf"]) + "|" + (S.env.mountNote || "");
    if (sig === lastSchematicSig) return;
    lastSchematicSig = sig;
    var wrap = document.getElementById("schematic-svg-wrap");
    if (wrap) wrap.innerHTML = schematicSvg();
    var note = document.getElementById("mount-note");
    if (note) {
      note.hidden = !S.env.mountNote;
      note.textContent = S.env.mountNote || "";
    }
    var cov = document.getElementById("covered-note");
    if (cov) {
      if (S.env.zoneCam["idf"]) {
        cov.hidden = false;
        cov.textContent = "IDF closet now covered by " + S.env.zoneCam["idf"] + " — wedge added to schematic.";
      } else {
        cov.hidden = true;
        cov.textContent = "";
      }
    }
  }

  /* ── coverage worksheet, medium (Worksheets.tsx) ─────────────────── */

  function worksheetHtml() {
    var camRoles = [
      { id: "r1", text: "Track a suspicious vehicle across the parking lot from the console" },
      { id: "r2", text: "Discreet, vandal-resistant lobby ceiling unit that hides where it points" },
      { id: "r3", text: "Long, fixed view of the dock fence line — a visible deterrent" },
      { id: "r4", text: "Detect a warm body through total darkness and smoke" },
    ];
    var lockAssets = [
      { id: "l1", text: "Sliding storage-cage gate" },
      { id: "l2", text: "Projector laptop left in a meeting room" },
      { id: "l3", text: "IDF closet door — code-only entry, must resist guessing" },
      { id: "l4", text: "Main entrance for all staff — speed + logs" },
    ];
    var rowsA = camRoles.map(function (r) {
      return '<div class="match-row"><p class="match-text">' + esc(r.text) + "</p>" +
        selHtml("matchCam." + r.id, ["PTZ", "Dome", "Bullet", "Thermal"], S.env.matchCam[r.id], "Camera type…", "Camera type for: " + r.text) + "</div>";
    }).join("");
    var rowsB = lockAssets.map(function (r) {
      return '<div class="match-row"><p class="match-text">' + esc(r.text) + "</p>" +
        selHtml("matchLock." + r.id, D.LOCK_OPTIONS, S.env.matchLock[r.id], "Lock type…", "Lock type for: " + r.text) + "</div>";
    }).join("");
    return panel("worksheet", "Coverage Worksheet", ic("ClipboardList", "i-16"),
      "Patrol homework: bind each role/asset to the right equipment. These matches are the vocabulary the rest of the shift assumes.",
      '<fieldset class="ws-fieldset"><legend class="ws-legend t-steel">A · Camera roles → type</legend>' + rowsA + "</fieldset>" +
      '<fieldset class="ws-fieldset"><legend class="ws-legend t-steel">B · Assets → lock type</legend>' + rowsB + "</fieldset>" +
      '<fieldset class="ws-fieldset"><legend class="ws-legend t-steel">C · The principle</legend>' +
        selHtml("principle", ["defense in depth", "least privilege", "separation of duties", "single point of failure"],
          S.env.principle, "Which principle says: never rely on one control?", "Security principle") +
      "</fieldset>");
  }

  /* ── incident report, medium (ReportPanels.tsx) ──────────────────── */

  function incidentReportHtml() {
    return panel("report", "Incident Report — EV-COR-0214", ic("FileClock", "i-16"),
      "Evidence log entry for the corridor person-detection. Camera ID + timestamp is the anchor every other log correlates against.",
      '<div class="report-grid">' +
        selHtml("report.cam", ["LOB-01", "COR-02", "SRV-03", "IDF-N-04", "STG-05", "DCK-06", "PRK-07", "ELE-08"],
          S.env.report.cam, "Camera ID…", "Camera ID") +
        '<input class="input mono" data-env="report.time" placeholder="Timestamp (e.g., 02:14)" value="' + esc(S.env.report.time) + '" aria-label="Event timestamp"/>' +
      "</div>");
  }

  /* ── incident reconstruction, hard (ReportPanels.tsx) ────────────── */

  function reconFormHtml() {
    return panel("recon", "Incident Reconstruction", ic("Search", "i-16"),
      "Build the full chain from the night's evidence: how they got in, where they got in, and when the device went onto the switch. Exact values required.",
      '<div class="recon-grid">' +
        '<div><label class="micro-label" for="recon-door">Entry door (exact ID)</label>' +
          '<input id="recon-door" class="input mono" data-env="recon.door" placeholder="e.g., DR-03" value="' + esc(S.env.recon.door) + '"/></div>' +
        '<div><span class="micro-label">Entry method</span>' +
          selHtml("recon.method", ["tailgating", "badge cloning", "lock bumping", "forced door"], S.env.recon.method, "Method…", "Entry method") + "</div>" +
        '<div><label class="micro-label" for="recon-target">Door breached into the IDF (exact ID)</label>' +
          '<input id="recon-target" class="input mono" data-env="recon.target" placeholder="e.g., DR-…" value="' + esc(S.env.recon.target) + '"/></div>' +
        '<div><span class="micro-label">Install window</span>' +
          selHtml("recon.window", [
            { value: "01050206", label: "01:05 – 02:06" },
            { value: "02120215", label: "02:12 – 02:15" },
            { value: "02150223", label: "02:15 – 02:23" },
          ], S.env.recon.window, "Window…", "Install window") + "</div>" +
      "</div>" +
      '<p class="recon-correlate">Correlate: PRK-07 motion 01:58 → badge log → keypad log → COR-02 motion 02:14 → held-open 02:15.</p>' +
      '<p class="sr-only">Reference doors: ' + D.DOORS.map(function (d) { return d.id; }).join(", ") + "</p>");
  }

  /* ── camera settings (CameraSettings.tsx) ────────────────────────── */

  function cameraSettingsHtml(mode) {
    var s = S.env.settings;
    var desc = mode === "medium"
      ? "Policy PS-7: retain ≥ 30 days · record ≥ 1080p · motion alerts ON."
      : "Gap-fix targets from the debrief: retention ≥ 90 days · tamper alerts ON (motion alerts already required).";
    return panel("settings", "Camera Settings — recorder config", ic("Settings2", "i-16"), desc,
      '<div class="settings-grid">' +
        "<div>" +
          '<div class="slider-head"><span class="micro-label">Retention</span>' +
          '<span class="slider-value" id="retention-value" aria-live="polite">' + s.retention + ' days</span></div>' +
          '<input type="range" class="slider" min="7" max="120" step="1" value="' + s.retention + '"' +
            ' data-env="settings.retention" aria-label="Retention in days: ' + s.retention + '"/>' +
          '<p class="micro-note">7–120 days · overwritten after window</p>' +
        "</div>" +
        "<div><span class=\"micro-label\">Resolution</span>" +
          selHtml("settings.resolution", ["720p", "1080p", "4K"], s.resolution, "Select…", "Recording resolution") +
        "</div>" +
        '<div class="toggle-card"><span class="toggle-label">Motion alerts<span class="toggle-sub">push notification on movement</span></span>' +
          switchHtml("settings", "motionAlerts", s.motionAlerts, "Motion alerts") + "</div>" +
        '<div class="toggle-card"><span class="toggle-label">Tamper alerts<span class="toggle-sub">page on signal loss / scene change</span></span>' +
          switchHtml("settings", "tamperAlerts", s.tamperAlerts, "Tamper alerts") + "</div>" +
      "</div>");
  }

  /* ── motion queue, medium (MotionAlerts.tsx) ─────────────────────── */

  function motionQueueHtml() {
    var rows = D.MOTION_EVENTS.map(function (e) {
      return '<div class="queue-row"><p class="queue-text mono"><span class="t-phosphor">' + esc(e.id) + "</span> · " +
        esc(e.time) + " · " + esc(e.cam) + '<span class="queue-detail">' + esc(e.detail) + "</span></p>" +
        selHtml("eventClass." + e.id, [{ value: "real", label: "real" }, { value: "false", label: "false" }],
          S.env.eventClass[e.id], "real / false", "Classify " + e.id) + "</div>";
    }).join("");
    var zones = [
      { id: "dock", label: "Sensitivity — Loading dock" },
      { id: "parking", label: "Sensitivity — Parking lot" },
    ].map(function (z) {
      return '<div class="sens-card"><span class="micro-label">' + esc(z.label) + "</span>" +
        selHtml("sensitivity." + z.id, ["low", "medium", "high"], S.env.sensitivity[z.id], "low / medium / high", z.label) + "</div>";
    }).join("");
    return panel("motion", "Motion Queue — overnight events", ic("Radio", "i-16"),
      "Three events tripped the sensors. Classify each (real / false), then tune both exterior zones to medium — untuned detection trains humans to ignore alerts.",
      '<div class="queue-list">' + rows + '<div class="sens-grid">' + zones + "</div></div>");
  }

  /* ── alert triage, hard (MotionAlerts.tsx) ───────────────────────── */

  function alertQueueHtml() {
    var rows = D.ALERTS.map(function (a) {
      return '<div class="queue-row"><p class="queue-text mono"><span class="t-phosphor">' + esc(a.id) + "</span> · " +
        esc(a.time) + " · " + esc(a.title) + '<span class="queue-detail">' + esc(a.detail) + "</span></p>" +
        selHtml("alertClass." + a.id, [
          { value: "real", label: "REAL" }, { value: "false", label: "FALSE" }, { value: "redherring", label: "RED HERRING" },
        ], S.env.alertClass[a.id], "real / false / red herring", "Classify " + a.id + ": " + a.title) + "</div>";
    }).join("");
    return panel("alerts", "Alert Triage — 8 overnight alerts", ic("BellRing", "i-16"),
      "Classify every alert: REAL (attack evidence), FALSE (benign trigger), RED HERRING (legit scheduled activity — verify work orders!). All 8 must be exact.",
      '<div class="queue-list">' + rows + "</div>");
  }

  /* ── coverage redesign, hard (Worksheets.tsx) ────────────────────── */

  function coverageDesignHtml() {
    var rows = [
      { id: "dock", text: "Loading dock — must follow moving vehicles" },
      { id: "parking", text: "Parking fence line — long, fixed, visible view" },
      { id: "corridor", text: "Office corridor — ONE unit must see 360°" },
      { id: "server", text: "Server room — lights stay OFF at night" },
    ].map(function (r) {
      return '<div class="match-row"><p class="match-text">' + esc(r.text) + "</p>" +
        selHtml("zoneCam." + r.id, D.DESIGN_CAMERAS.map(function (c) { return { value: c.id, label: c.label }; }),
          S.env.zoneCam[r.id], "Mount camera…", "Camera for " + r.text) + "</div>";
    }).join("");
    return panel("coverage", "Coverage Redesign — 4-camera budget", ic("LayoutGrid", "i-16"),
      "Budget: exactly 4 units for these 4 zones. Constraints decide; preferences don't. Traps are on the shelf.",
      '<div class="match-list">' + rows + "</div>");
  }

  /* ── doors & locks console (DoorsPanel.tsx) ──────────────────────── */

  function doorsPanelHtml(hard) {
    var zones = [
      { id: "server", label: "Server room" },
      { id: "idf", label: "IDF closet" },
      { id: "storage", label: "Storage cage" },
      { id: "dock", label: "Loading dock interior" },
    ].map(function (z) {
      return '<div class="match-row"><p class="match-text">' + esc(z.label) + "</p>" +
        selHtml("lockAssign." + z.id, D.LOCK_OPTIONS.concat(["Maglock"]), S.env.lockAssign[z.id], "Lock type…", "Lock type for " + z.label) + "</div>";
    }).join("");

    var lockout = S.env.lockout["DR-IDF-01"] || 0;
    var apb = hard
      ? '<div class="toggle-card apb-card"><span class="toggle-label">Anti-passback — DR-03<span class="toggle-sub">same credential must badge out before it badges in</span></span>' +
        switchHtml("antiPassback", "DR-03", S.env.antiPassback["DR-03"], "Anti-passback on DR-03") + "</div>"
      : "";

    var tradeoffs = Object.keys(D.LOCK_TRADEOFFS).map(function (k) {
      return '<li class="tradeoff"><span class="tradeoff-key">' + esc(k) + "</span> — " + esc(D.LOCK_TRADEOFFS[k]) + "</li>";
    }).join("");

    return panel("doors", "Door & Lock Console", ic("DoorClosed", "i-16"),
      "Live door states plus the hardening board: assign lock types per zone, set the keypad lockout, and (hard shift) arm anti-passback.",
      '<div class="lock-board"><span class="board-title t-steel">Lock assignment board</span>' + zones + "</div>" +
      '<div class="lockout-card">' +
        '<div class="lockout-row">' +
          '<div><p class="mono lockout-title">DR-IDF-01 · keypad lockout threshold</p>' +
          '<p class="micro-note">attempts allowed before lock + alert</p></div>' +
          '<div class="stepper">' +
            '<button type="button" class="btn btn-outline btn-icon" data-action="lockout-dec" aria-label="Decrease lockout threshold">' + ic("Minus", "i-16") + "</button>" +
            '<span class="stepper-value" id="lockout-value" aria-live="polite" aria-label="Lockout threshold ' + lockout + '">' + lockout + "</span>" +
            '<button type="button" class="btn btn-outline btn-icon" data-action="lockout-inc" aria-label="Increase lockout threshold">' + ic("Plus", "i-16") + "</button>" +
          "</div>" +
        "</div>" +
      "</div>" + apb +
      '<div class="tradeoff-wrap"><span class="board-title t-steel">' + ic("LockKeyhole", "i-14") + " Lock trade-offs</span>" +
        '<ul class="tradeoff-list">' + tradeoffs + "</ul>" +
        '<p class="micro-note tradeoff-foot">' + ic("KeyRound", "i-12") + " Match strength to sensitivity &amp; traffic</p></div>");
  }

  function updateLockout() {
    var lockout = S.env.lockout["DR-IDF-01"] || 0;
    var v = document.getElementById("lockout-value");
    if (v) {
      v.textContent = lockout;
      v.setAttribute("aria-label", "Lockout threshold " + lockout);
    }
  }

  /* ── access log terminal (AccessLog.tsx) ─────────────────────────── */

  var KIND_COLOR = {
    badge: "t-phosphor", "door-open": "t-amber", denied: "t-danger", forced: "t-danger",
    held: "t-amber", failed: "t-danger", granted: "t-phosphor", lockout: "t-steel",
  };

  function accessLogHtml() {
    var badgeRows = D.BADGE_SUMMARY.map(function (r) {
      return '<tr class="' + (r.opens > r.swipes ? "row-flag-amber" : "") + '"><td>' + esc(r.door) + "</td><td>" +
        r.swipes + "</td><td>" + r.opens + "</td><td>" + r.held + "</td></tr>";
    }).join("");
    var badgeLines = D.BADGE_LOG.map(function (l) {
      return "<li" + ' class="log-line mono"><span class="t-inkdim">' + esc(l.time) + "</span> " +
        '<span class="' + (KIND_COLOR[l.kind] || "") + '">' + esc(l.kind) + "</span> " +
        '<span class="t-ink">' + esc(l.door) + "</span>" +
        (l.who ? '<span class="t-inkdim"> · ' + esc(l.who) + "</span>" : "") + "</li>";
    }).join("");
    var keypadRows = D.KEYPAD_SUMMARY.map(function (r) {
      return '<tr class="' + (r.fails >= 10 ? "row-flag-red" : "") + '"><td>' + esc(r.door) + "</td><td>" +
        r.fails + "</td><td>" + esc(r.granted) + "</td></tr>";
    }).join("");
    var keypadLines = D.KEYPAD_LOG.map(function (l) {
      return '<li class="log-line mono"><span class="t-inkdim">' + esc(l.time) + "</span> " +
        '<span class="' + (KIND_COLOR[l.kind] || "") + '">' + esc(l.kind) + "</span> " +
        '<span class="t-ink">' + esc(l.door) + '</span><span class="t-inkdim"> · ' + esc(l.detail) + "</span></li>";
    }).join("");
    var triage =
      '<div class="triage-card">' +
        '<h3 class="board-title t-steel">Triage intake — file your findings</h3>' +
        '<div class="triage-row"><span class="micro-label">Tailgating</span>' +
          selHtml("tailgate.door", D.DOORS.map(function (d) { return { value: d.id, label: d.id }; }),
            S.env.tailgate.door, "door with extra opens…", "Tailgating door") +
          '<input class="input mono" data-env="tailgate.count" placeholder="door-open count" inputmode="numeric" value="' + esc(S.env.tailgate.count) + '" aria-label="Tailgating door-open event count"/></div>' +
        '<div class="triage-row"><span class="micro-label">Brute force</span>' +
          selHtml("brute.door", D.DOORS.map(function (d) { return { value: d.id, label: d.id }; }),
            S.env.brute.door, "door with failed attempts…", "Brute-forced door") +
          '<input class="input mono" data-env="brute.count" placeholder="failed attempts" inputmode="numeric" value="' + esc(S.env.brute.count) + '" aria-label="Brute force failed attempt count"/></div>' +
      "</div>";
    return panel("accesslog", "Access Log Terminal", ic("Terminal", "i-16"),
      "Badge events vs door contacts, keypad controller events. Correlate the counts — the delta is the story. File your triage answers at the bottom.",
      "<div class='access-log'>" +
        "<div><h3 class='micro-label t-steel'>Badge activity — door contacts 01:00–03:00</h3>" +
          "<div class='table-wrap'><table class='log-table mono'><thead><tr><th>door</th><th>badge</th><th>door-open</th><th>held</th></tr></thead>" +
          "<tbody>" + badgeRows + "</tbody></table></div>" +
          "<ul class='log-list lab-scroll'>" + badgeLines + "</ul></div>" +
        "<div><h3 class='micro-label t-steel'>Keypad controller — attempts</h3>" +
          "<div class='table-wrap'><table class='log-table mono'><thead><tr><th>door</th><th>failed</th><th>granted</th></tr></thead>" +
          "<tbody>" + keypadRows + "</tbody></table></div>" +
          "<ul class='log-list lab-scroll'>" + keypadLines + "</ul></div>" +
        triage +
      "</div>");
  }

  /* ── rule builder, hard (HardPanels.tsx) ─────────────────────────── */

  function ruleBuilderHtml() {
    var r = S.env.rule;
    return panel("rulebuilder", "Rule Builder — escalation logic", ic("Workflow", "i-16"),
      "Write the after-hours rule that kills the next brute force: which door, which window (24h), how many failures before it pages the on-call.",
      '<div class="recon-grid">' +
        '<div><span class="micro-label">Door</span>' +
          selHtml("rule.door", D.DOORS.map(function (d) { return { value: d.id, label: d.id + " — " + d.name }; }), r.door, "Door…", "Rule door") + "</div>" +
        '<div><span class="micro-label">Failure threshold</span>' +
          selHtml("rule.threshold", [{ value: "3", label: "3 attempts" }, { value: "5", label: "5 attempts" }, { value: "10", label: "10 attempts" }], r.threshold, "Failures…", "Failure threshold") + "</div>" +
        '<div><label class="micro-label" for="rule-start">Window start (24h)</label>' +
          '<input id="rule-start" class="input mono" data-env="rule.start" placeholder="20:00" value="' + esc(r.start) + '"/></div>' +
        '<div><label class="micro-label" for="rule-end">Window end (24h)</label>' +
          '<input id="rule-end" class="input mono" data-env="rule.end" placeholder="06:00" value="' + esc(r.end) + '"/></div>' +
      "</div>" +
      '<p class="rule-preview mono" id="rule-preview"></p>');
  }

  function updateRulePreview() {
    var p = document.getElementById("rule-preview");
    if (!p) return;
    var r = S.env.rule;
    p.textContent =
      "IF door = " + (r.door || "…") + " AND time BETWEEN " + (r.start || "…") + " AND " +
      (r.end || "…") + " AND keypad_fails ≥ " + (r.threshold || "…") + " THEN lock + escalate";
  }

  /* ── key ledger, hard (HardPanels.tsx) ───────────────────────────── */

  function keyLedgerHtml() {
    var items = D.KEY_LEDGER.map(function (k) {
      var checked = S.env.keyMarks[k.id] ? " checked" : "";
      return '<li class="key-row"><input type="checkbox" class="checkbox" id="key-' + esc(k.id) + '" data-keymark="' + esc(k.id) + '"' + checked +
        ' aria-label="Mark violation: ' + esc(k.text) + '"/>' +
        '<label for="key-' + esc(k.id) + '" class="key-label mono"><span class="t-phosphor">' + esc(k.id) + "</span> — " + esc(k.text) + "</label></li>";
    }).join("");
    return panel("keys", "Key Ledger — custody audit", ic("NotebookPen", "i-16"),
      "Mark the three entries that break key-custody policy. Marking a healthy entry fails the audit — auditors count false positives too.",
      '<ul class="key-list">' + items + "</ul>");
  }

  /* ── failure chain, hard (HardPanels.tsx) ────────────────────────── */

  var chainDisplayOrder = null;

  function computeChainDisplayOrder() {
    var ids = D.CHAIN_ITEMS.map(function (c) { return c.id; });
    for (var i = ids.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = ids[i]; ids[i] = ids[j]; ids[j] = t;
    }
    var solution = ["B", "A", "C"];
    if (ids.every(function (id, i2) { return id === solution[i2]; })) ids.push(ids.shift());
    return ids;
  }

  function chainListHtml() {
    if (!S.env.chain.length) return '<ol class="chain-list" id="chain-list"></ol>';
    var items = S.env.chain.map(function (id, i) {
      var item = D.CHAIN_ITEMS.filter(function (c) { return c.id === id; })[0];
      return '<li class="chain-item" data-chain="' + esc(id) + '">' +
        '<span class="chain-num">' + (i + 1) + "</span>" +
        '<p class="chain-text mono"><span class="t-phosphor">' + esc(item.time) + "</span> — " + esc(item.text) + "</p>" +
        '<span class="chain-btns">' +
          '<button type="button" class="btn btn-outline btn-icon-sm" data-action="chain-up" data-idx="' + i + '" aria-label="Move up">' + ic("ChevronUp", "i-16") + "</button>" +
          '<button type="button" class="btn btn-outline btn-icon-sm" data-action="chain-down" data-idx="' + i + '" aria-label="Move down">' + ic("ChevronDown", "i-16") + "</button>" +
        "</span></li>";
    }).join("");
    return '<ol class="chain-list" id="chain-list">' + items + "</ol>";
  }

  function chainShelfHtml() {
    if (S.env.chain.length >= D.CHAIN_ITEMS.length) return "";
    var shelf = chainDisplayOrder.filter(function (c) { return S.env.chain.indexOf(c) === -1; }).map(function (id) {
      var c = D.CHAIN_ITEMS.filter(function (x) { return x.id === id; })[0];
      return '<button type="button" class="chain-add" data-action="chain-add" data-id="' + esc(c.id) + '">' +
        '<span class="t-phosphor">+ add</span>&nbsp;' + esc(c.time) + " — " + esc(c.text) + "</button>";
    }).join("");
    return '<div class="chain-shelf" id="chain-shelf">' + shelf + "</div>";
  }

  function failureChainHtml() {
    return panel("chain", "Failure Chain — order & principle", ic("ListOrdered", "i-16"),
      "Order the three control failures by timestamp (first → last), then name the principle the chain proves.",
      '<div id="chain-area">' + chainListHtml() + chainShelfHtml() + "</div>" +
      '<div class="chain-principle"><span class="micro-label">Design principle proven</span>' +
        selHtml("principle", ["defense in depth", "least privilege", "separation of duties", "single point of failure"],
          S.env.principle, "Select principle…", "Design principle") + "</div>");
  }

  function rerenderChainArea() {
    var area = document.getElementById("chain-area");
    if (!area) return;
    var prev = document.activeElement;
    area.innerHTML = chainListHtml() + chainShelfHtml();
    // restore focus onto the same move button (React kept element identity; we restore it)
    if (prev && prev.hasAttribute && prev.hasAttribute("data-action")) {
      var act = prev.getAttribute("data-action");
      if (act === "chain-up" || act === "chain-down") {
        var idx = prev.getAttribute("data-idx");
        var again = area.querySelector('[data-action="' + act + '"][data-idx="' + idx + '"]');
        if (again) again.focus();
      }
    }
  }

  /* ── site audit (SiteAudit.tsx) ──────────────────────────────────── */

  function auditItemsHtml() {
    var items = OBJ.AUDIT_ITEMS[S.mode] || [];
    return items.map(function (it) {
      var ok = it.pass(S.env);
      return '<li class="audit-item' + (ok ? " audit-ok" : "") + '" data-audit="' + esc(it.label) + '">' +
        (ok ? ic("CheckCircle2", "i-14 audit-ic-ok") : ic("XCircle", "i-14 audit-ic-bad")) +
        "<span>" + esc(it.label) + (ok ? "" : '<span class="audit-fix">fix → ' + esc(it.fix) + "</span>") + "</span></li>";
    }).join("");
  }

  function siteAuditHtml(mode) {
    return panel("audit", "Site Audit — verification", ic("ShieldCheck", "i-16"),
      "Verification is the last mile of hardening: the audit reads your actual configuration state and reports pass/fail per control.",
      '<ul class="audit-list" id="audit-list">' + auditItemsHtml() + "</ul>" +
      '<div class="audit-actions">' +
        '<button type="button" class="btn btn-primary" data-action="run-audit">' + ic("Play", "i-16") + " Run audit</button>" +
        '<span class="audit-status" id="audit-status" role="status"' + (S.env.auditRun > 0 ? "" : " hidden") + "></span>" +
      "</div>");
  }

  function updateAudit() {
    var list = document.getElementById("audit-list");
    if (list) list.innerHTML = auditItemsHtml();
    var status = document.getElementById("audit-status");
    if (status) {
      if (S.env.auditRun > 0) {
        status.hidden = false;
        status.className = "audit-status " + (S.env.auditResult ? "audit-pass" : "audit-fail");
        status.textContent = S.env.auditResult ? "Audit PASS" : "Audit FAIL — clear the red lines and re-run";
      } else {
        status.hidden = true;
        status.textContent = "";
      }
    }
  }

  /* ── objectives rail (ObjectivesRail.tsx) ────────────────────────── */

  function railCardHtml(def, i) {
    var st = S.objectives[def.id] || { done: false, attempts: 0, hints: 0, firstTry: false };
    var isCurrent = S.mode === "medium" && def.id === SEL.currentObjectiveId(S.mode, S.objectives);
    var pillar = PILLAR[def.pillar];
    return (
      '<li class="obj-card' + (st.done ? " obj-done" : "") + (isCurrent ? " obj-current" : "") + '" data-obj="' + def.id + '" data-sig="">' +
        '<button type="button" class="obj-head" data-action="toggle-obj" data-id="' + def.id + '" aria-expanded="false">' +
          '<span class="obj-num">' + (st.done ? ic("CheckCircle2", "i-14") : i + 1) + "</span>" +
          '<span class="obj-name-wrap"><span class="obj-name">' + esc(def.title) + "</span>" +
            '<span class="obj-chips"><span class="' + pillar.cls + '">' + pillar.label + "</span>" +
            '<span class="next-chip" hidden>next</span></span></span>' +
          ic("ChevronDown", "i-16 obj-chevron") +
        "</button>" +
        '<div class="obj-body"><div class="obj-body-in">' +
          "<p>" + esc(def.task) + "</p>" +
          '<ul class="obj-hints"></ul>' +
          '<div class="obj-feedback" role="status" hidden></div>' +
          '<div class="obj-actions">' +
            '<button type="button" class="btn btn-primary btn-sm" data-action="check-obj" data-id="' + def.id + '">Check results</button>' +
            '<button type="button" class="btn btn-outline btn-sm" data-action="hint-obj" data-id="' + def.id + '" title="' +
              (S.mode === "hard" ? "One nudge allowed — costs score" : "Reveal next hint") + '">' + ic("Lightbulb", "i-14") +
              '<span class="hint-label"></span></button>' +
            '<button type="button" class="btn btn-outline btn-sm" data-action="where-obj" data-id="' + def.id + '" aria-label="Show where to work on: ' + esc(def.title) + '">' +
              ic("Crosshair", "i-14") + " Where</button>" +
          "</div>" +
        "</div></div>" +
      "</li>"
    );
  }

  function renderRail() {
    var defs = OBJ.OBJECTIVES[S.mode];
    document.getElementById("rail-list").innerHTML = defs.map(railCardHtml).join("");
    document.getElementById("rail-sub").textContent = S.mode === "medium" ? "Guided · hints available" : "Solo · strict validation";
    defs.forEach(function (def) {
      updateRailCard(def.id);
    });
    // the current objective starts expanded (original useState(current) parity)
    var cur = S.mode === "medium" ? SEL.currentObjectiveId(S.mode, S.objectives) : null;
    if (cur) {
      var li = document.querySelector('.obj-card[data-obj="' + cur + '"]');
      if (li) {
        li.classList.add("open");
        var head = li.querySelector(".obj-head");
        if (head) head.setAttribute("aria-expanded", "true");
      }
    }
    updateSpots();
  }

  function updateRailCard(id) {
    var def = OBJ.OBJECTIVES[S.mode].filter(function (d) { return d.id === id; })[0];
    if (!def) return;
    var li = document.querySelector('.obj-card[data-obj="' + id + '"]');
    if (!li) return;
    var st = S.objectives[id] || { done: false, attempts: 0, hints: 0, firstTry: false };
    var sig = [st.done, st.attempts, st.hints, st.lastFeedback || "", st.lastOk === true ? "1" : st.lastOk === false ? "0" : "-"].join("|");
    if (li.getAttribute("data-sig") === sig) return;
    li.setAttribute("data-sig", sig);

    var isCurrent = S.mode === "medium" && id === SEL.currentObjectiveId(S.mode, S.objectives);
    li.classList.toggle("obj-done", !!st.done);
    li.classList.toggle("obj-current", isCurrent);

    var num = li.querySelector(".obj-num");
    num.innerHTML = st.done ? ic("CheckCircle2", "i-14") : String(OBJ.OBJECTIVES[S.mode].indexOf(def) + 1);

    var chip = li.querySelector(".next-chip");
    if (chip) chip.hidden = !isCurrent;

    var hintsUl = li.querySelector(".obj-hints");
    var shown = def.hints.slice(0, st.hints || 0);
    hintsUl.innerHTML = shown.map(function (h) {
      return '<li class="obj-hint">' + ic("Lightbulb", "i-12") + esc(h) + "</li>";
    }).join("");

    var fb = li.querySelector(".obj-feedback");
    if (st.lastFeedback) {
      fb.hidden = false;
      fb.className = "obj-feedback " + (st.lastOk ? "fb-ok" : "fb-bad");
      fb.innerHTML = (st.lastOk ? ic("CheckCircle2", "i-14 fb-ic-ok") : ic("XCircle", "i-14 fb-ic-bad")) + esc(st.lastFeedback);
    } else {
      fb.hidden = true;
      fb.innerHTML = "";
    }

    var hintBtn = li.querySelector(".hint-label");
    if (S.mode === "hard") {
      hintBtn.textContent = (st.hints || 0) === 0 ? "Nudge (−score)" : "Nudged";
      li.querySelector('[data-action="hint-obj"]').disabled = (st.hints || 0) >= 1;
    } else {
      hintBtn.textContent = "Hint " + (st.hints || 0) + "/" + def.hints.length;
      li.querySelector('[data-action="hint-obj"]').disabled = (st.hints || 0) >= def.hints.length;
    }
  }

  function updateRail() {
    if (!S.mode) return;
    OBJ.OBJECTIVES[S.mode].forEach(function (def) {
      updateRailCard(def.id);
    });
  }

  /* ── status bar (StatusBar.tsx) ──────────────────────────────────── */

  function ringHtml() {
    var p = S.mode ? SEL.progressOf(S.mode, S.objectives) : { done: 0, total: 1 };
    var pct = p.total ? p.done / p.total : 0;
    var R = 11;
    var C = 2 * Math.PI * R;
    return (
      '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">' +
        '<circle cx="15" cy="15" r="11" fill="none" stroke="#24312a" stroke-width="3"/>' +
        '<circle cx="15" cy="15" r="11" fill="none" stroke="#3ecf6e" stroke-width="3" stroke-linecap="round"' +
          ' stroke-dasharray="' + (C * pct).toFixed(3) + " " + C.toFixed(3) + '" transform="rotate(-90 15 15)" class="ring-arc"/>' +
        '<text x="15" y="19" text-anchor="middle" class="ring-text" font-size="9">' + p.done + "/" + p.total + "</text>" +
      "</svg>"
    );
  }

  function renderStatusBar(mode) {
    var qdone = S.quiz.completed;
    return (
      '<header class="statusbar" id="statusbar">' +
        '<div class="statusbar-in">' +
          '<div class="sb-brand">' +
            '<div class="sb-title-row"><span class="rec-dot sb-dot" aria-hidden="true"></span>' +
            '<h1 class="sb-title">Night Shift · Meridian Harborview</h1></div>' +
            '<p class="sb-sub">' + esc(D.FACILITY.night) + " · cameras &amp; locks · synthetic data</p>" +
          "</div>" +
          '<div class="sb-actions">' +
            '<span class="sb-clock mono" id="shift-clock" aria-hidden="true">06:04:00</span>' +
            '<button type="button" class="btn btn-outline btn-sm" data-action="open-drawer" data-drawer="knowledge">' + ic("BookOpen", "i-14") + " Briefing</button>" +
            '<button type="button" class="btn btn-outline btn-sm" data-action="open-drawer" data-drawer="glossary">' + ic("ListChecks", "i-14") + " Glossary</button>" +
            '<button type="button" class="btn btn-outline btn-sm" data-action="open-drawer" data-drawer="quiz">' + ic("GraduationCap", "i-14") + ' Quiz <span id="quiz-check"></span></button>' +
            '<button type="button" class="btn btn-outline btn-sm" data-action="open-drawer" data-drawer="debrief">' + ic("ScrollText", "i-14") + " Debrief</button>" +
            '<button type="button" class="btn btn-primary btn-sm" data-action="end-shift" id="end-shift-btn"' +
              ' aria-disabled="true" disabled>' + ic("Flag", "i-14") + " End shift</button>" +
            '<button type="button" class="btn btn-outline btn-sm btn-danger" data-action="open-reset">' + ic("RotateCcw", "i-14") + " Reset</button>" +
            '<div class="sb-progress" role="status" aria-label="Objectives 0 of 0 complete" id="sb-progress">' + ringHtml() + "</div>" +
          "</div>" +
        "</div>" +
      "</header>"
    );
  }

  function updateStatus() {
    if (!S.mode) return;
    var p = SEL.progressOf(S.mode, S.objectives);
    var prog = document.getElementById("sb-progress");
    if (prog) {
      prog.innerHTML = ringHtml();
      prog.setAttribute("aria-label", "Objectives " + p.done + " of " + p.total + " complete");
    }
    var q = SEL.quizScore(S.mode, S.quiz);
    var qc = document.getElementById("quiz-check");
    if (qc) qc.textContent = S.quiz.completed ? "✓" : "";
    var end = document.getElementById("end-shift-btn");
    if (end) {
      var ready = p.done === p.total && S.quiz.completed;
      end.disabled = !ready;
      end.setAttribute("aria-disabled", String(!ready));
    }
  }

  /* ── spotlights (medium "Where"/current objective) ───────────────── */

  function updateSpots() {
    var spot = new Set();
    if (S.mode === "medium") {
      var cur = SEL.currentObjectiveId("medium", S.objectives);
      var def = cur ? OBJ.OBJECTIVES.medium.filter(function (d) { return d.id === cur; })[0] : null;
      (def ? def.panels : []).forEach(function (p) { spot.add(p); });
    }
    document.querySelectorAll(".panel[data-panel]").forEach(function (sec) {
      var on = spot.has(sec.getAttribute("data-panel"));
      sec.classList.toggle("spotlight", on);
      var b = sec.querySelector(".next-step-badge");
      if (b) b.hidden = !on;
    });
  }

  /* ── panels composition (LabRoot.tsx order) ──────────────────────── */

  function renderMain(root) {
    var hard = S.mode === "hard";
    var mainPanels = [];
    mainPanels.push({ html: cameraWallHtml(), key: "camerawall" });
    mainPanels.push({ html: schematicHtml(), key: "schematic" });
    if (!hard) mainPanels.push({ html: worksheetHtml(), key: "worksheet" });
    mainPanels.push(hard ? { html: reconFormHtml(), key: "recon" } : { html: incidentReportHtml(), key: "report" });
    mainPanels.push({ html: cameraSettingsHtml(S.mode), key: "settings" });
    if (!hard) mainPanels.push({ html: motionQueueHtml(), key: "motion" });
    if (hard) mainPanels.push({ html: coverageDesignHtml(), key: "coverage" });
    if (hard) mainPanels.push({ html: alertQueueHtml(), key: "alerts" });
    mainPanels.push({ html: siteAuditHtml(S.mode), key: "audit" });

    var asidePanels = [];
    asidePanels.push(doorsPanelHtml(hard));
    asidePanels.push(accessLogHtml());
    if (hard) {
      asidePanels.push(ruleBuilderHtml());
      asidePanels.push(keyLedgerHtml());
      asidePanels.push(failureChainHtml());
    }

    root.innerHTML = "";
    root.appendChild(el(
      '<div id="lab-root" class="lab-root">' +
        renderStatusBar(S.mode) +
        '<div class="lab-grid">' +
          '<div class="rail-wrap"><nav class="rail" aria-label="Objectives">' +
            '<div class="rail-head"><h2 class="rail-title">Shift checklist</h2>' +
            '<p class="rail-sub" id="rail-sub"></p></div>' +
            '<ol class="rail-list lab-scroll" id="rail-list"></ol>' +
          "</nav></div>" +
          '<main class="watchfloor" aria-label="Watch floor" id="watchfloor">' +
            mainPanels.map(function (p) { return p.html; }).join("") +
          "</main>" +
          '<aside class="console" aria-label="Access and locks console" id="console">' +
            asidePanels.join("") +
          "</aside>" +
        "</div>" +
        drawerShellHtml() +
        modalShellHtml() +
        '<div role="status" aria-live="polite" class="sr-only" id="live-region"></div>' +
        '<button type="button" class="sr-only briefing-shortcut" data-action="open-drawer" data-drawer="knowledge">Open briefing</button>' +
      "</div>"
    ));

    renderRail();
    updateStatus();
    updateRulePreview();
    updateAudit();
    startClock();
  }

  /* ── drawers (Drawers.tsx + QuizDrawer.tsx) ──────────────────────── */

  function drawerShellHtml() {
    return (
      '<div class="layer-overlay" id="drawer-overlay" hidden></div>' +
      '<aside class="sheet" id="drawer" role="dialog" aria-modal="true" hidden>' +
        '<button type="button" class="layer-close" data-action="close-layer" aria-label="Close">' + ic("X", "i-16") + '<span class="sr-only">Close</span></button>' +
        '<div class="sheet-content lab-scroll" id="drawer-content"></div>' +
      "</aside>"
    );
  }

  function modalShellHtml() {
    return (
      '<div class="layer-overlay" id="modal-overlay" hidden></div>' +
      '<div class="modal" id="modal" role="dialog" aria-modal="true" hidden>' +
        '<div class="modal-card lab-scroll" id="modal-content"></div>' +
      "</div>"
    );
  }

  function knowledgeHtml() {
    function ps(list, dim) {
      return list.map(function (p) {
        return '<p class="' + (dim ? "t-inkdim" : "t-ink") + '">' + esc(p) + "</p>";
      }).join("");
    }
    var variants = D.KNOWLEDGE.variants.map(function (v) {
      return '<li class="variant-item mono">' + esc(v) + "</li>";
    }).join("");
    return (
      '<div class="sheet-head"><h2 class="sheet-title" id="layer-title">Shift Briefing · Knowledge Core</h2>' +
      '<p class="sheet-sub">' + esc(D.FACILITY.org) + " — " + esc(D.FACILITY.night) + ". Everything below is synthetic training material.</p></div>" +
      '<div class="sheet-body">' +
        '<section aria-label="Scenario briefing"><h3 class="sec-title t-amber">01 · Scenario</h3>' + ps(D.KNOWLEDGE.briefing, false) + "</section>" +
        '<section aria-label="Cameras explained"><h3 class="sec-title t-phosphor">02 · Cameras = detection</h3>' + ps(D.KNOWLEDGE.cameras, true) + "</section>" +
        '<section aria-label="Locks explained"><h3 class="sec-title t-steel">03 · Locks = prevention</h3>' + ps(D.KNOWLEDGE.locks, true) + "</section>" +
        '<section aria-label="Attack chain"><h3 class="sec-title t-danger">04 · Physical → cyber chain</h3>' + ps(D.KNOWLEDGE.chain, true) + "</section>" +
        '<section aria-label="Variants and pivots"><h3 class="sec-title t-ink">05 · Variants &amp; countermeasures</h3><ul class="variant-list">' + variants + "</ul></section>" +
      "</div>"
    );
  }

  function glossaryHtml() {
    var items = D.GLOSSARY.map(function (g) {
      return '<div class="gloss-item"><dt>' + esc(g.term) + '</dt><dd class="t-inkdim">' + esc(g.def) + "</dd></div>";
    }).join("");
    return (
      '<div class="sheet-head"><h2 class="sheet-title" id="layer-title">Glossary</h2>' +
      '<p class="sheet-sub">20 terms from the cameras-and-locks scope.</p></div>' +
      '<dl class="gloss-list">' + items + "</dl>"
    );
  }

  function debriefHtml() {
    var dets = D.DEBRIEF.detections.map(function (d) {
      return '<div class="det-card"><p class="mono det-title">' + esc(d.title) + '</p><p class="mono det-logic">' + esc(d.logic) + "</p></div>";
    }).join("");
    var mits = D.DEBRIEF.mitigations.map(function (m) {
      return '<li class="mit-card"><span class="mono mit-id">' + esc(m.id) + '</span><span class="t-inkdim">' + esc(m.detail) + "</span></li>";
    }).join("");
    function ul(list) {
      return '<ul class="dot-list t-inkdim">' + list.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>";
    }
    var links = D.DEBRIEF.links.map(function (l) {
      return '<li><a class="ext-link mono" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
        ic("ExternalLink", "i-12") + " " + esc(l.label) + "</a></li>";
    }).join("");
    return (
      '<div class="sheet-head"><h2 class="sheet-title" id="layer-title">' + ic("ScrollText", "i-16 t-phosphor") + " Debrief · field notes</h2>" +
      '<p class="sheet-sub">Detection recipes, mitigation IDs, and both mindsets.</p></div>' +
      '<div class="sheet-body">' +
        '<section aria-label="Detection opportunities"><h3 class="sec-title t-phosphor">Detection opportunities</h3>' + dets + "</section>" +
        '<section aria-label="Mitigation recommendations"><h3 class="sec-title t-steel">Mitigations</h3><ul class="mit-list">' + mits + "</ul></section>" +
        '<section aria-label="Blue team takeaways"><h3 class="sec-title t-phosphor">Blue-team takeaways</h3>' + ul(D.DEBRIEF.blue) + "</section>" +
        '<section aria-label="Red team mindset"><h3 class="sec-title t-amber">Red-team mindset (defensive)</h3>' + ul(D.DEBRIEF.red) + "</section>" +
        '<section aria-label="Official references"><h3 class="sec-title t-ink">Official references</h3><ul class="link-list">' + links + "</ul></section>" +
      "</div>"
    );
  }

  /* quiz drawer */

  function quizOptionHtml(q, oi) {
    var checked = !!S.quiz.checked[q.id];
    var picked = S.quiz.answers[q.id];
    var isPicked = picked === oi;
    var isAnswer = q.answer === oi;
    var showGreen = checked && isPicked && isAnswer;
    var showRed = checked && isPicked && !isAnswer;
    var cls = "quiz-opt";
    if (showGreen) cls += " opt-green";
    if (showRed) cls += " opt-red";
    if (!checked && isPicked && !showGreen) cls += " opt-picked";
    if (!checked && !isPicked) cls += " opt-idle";
    if (checked && !isPicked) cls += " opt-dim";
    var mark;
    if (checked) {
      if (isPicked && isAnswer) mark = ic("CheckCircle2", "i-16 opt-ic-ok");
      else if (isPicked && !isAnswer) mark = ic("XCircle", "i-16 opt-ic-bad");
      else mark = '<span class="opt-spacer" aria-hidden="true"></span>';
    } else {
      mark = '<span class="opt-radio' + (isPicked ? " opt-radio-on" : "") + '" aria-hidden="true"></span>';
    }
    return (
      '<button type="button" role="radio" aria-checked="' + (!!isPicked) + '" data-action="pick-option"' +
      ' data-qid="' + q.id + '" data-idx="' + oi + '" class="' + cls + '"' + (checked ? " disabled" : "") + ">" +
      mark + "<span>" + esc(q.options[oi]) + "</span></button>"
    );
  }

  function quizItemHtml(q, qi) {
    var checked = !!S.quiz.checked[q.id];
    var picked = S.quiz.answers[q.id];
    var correct = checked && picked === q.answer;
    var scenario = q.scenario
      ? '<p class="quiz-scenario">' + esc(q.scenario) + "</p>"
      : "";
    var opts = q.options.map(function (o, oi) { return quizOptionHtml(q, oi); }).join("");
    var checkBtn = checked
      ? ""
      : '<button type="button" class="btn btn-primary btn-sm quiz-check-btn" data-action="check-quiz" data-qid="' + q.id + '"' +
        (picked === undefined ? " disabled" : "") + ">Check answer</button>";
    var explain = checked
      ? '<p class="quiz-explain' + (correct ? " fb-ok" : "") + '" role="status">' + esc(q.explain) + "</p>"
      : "";
    return (
      '<fieldset class="quiz-item" data-quiz="' + q.id + '">' +
        '<legend class="quiz-legend">Q' + (qi + 1) + (checked ? (correct ? " · correct" : " · missed") : "") + "</legend>" +
        scenario +
        '<p class="quiz-prompt">' + esc(q.prompt) + "</p>" +
        '<div role="radiogroup" aria-label="' + esc(q.prompt) + '" class="quiz-opts">' + opts + "</div>" +
        '<div class="quiz-checkwrap">' + checkBtn + "</div>" +
        explain +
      "</fieldset>"
    );
  }

  function quizHtml() {
    var items = S.mode === "hard" ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
    var score = SEL.quizScore(S.mode, S.quiz);
    var body = items.map(function (q, qi) { return quizItemHtml(q, qi); }).join("");
    var done = S.quiz.completed
      ? '<p class="quiz-complete" role="status">Quiz complete — ' + score.correct + "/" + score.total + '. Hit END SHIFT when the checklist is done.</p>'
      : "";
    return (
      '<div class="sheet-head"><h2 class="sheet-title" id="layer-title">' + ic("GraduationCap", "i-16 t-phosphor") + " Knowledge check</h2>" +
      '<p class="sheet-sub" id="quiz-scoreline">' + (S.mode === "hard" ? "7 scenario items — apply, don't recall." : "6 concept items — every answer teaches.") + " " +
      "Score: " + score.correct + " correct · " + score.answered + "/" + score.total + " checked</p></div>" +
      '<div class="sheet-body quiz-body">' + body + done + "</div>"
    );
  }

  function updateQuizScoreline() {
    var elx = document.getElementById("quiz-scoreline");
    if (!elx || !S.mode) return;
    var score = SEL.quizScore(S.mode, S.quiz);
    elx.textContent =
      (S.mode === "hard" ? "7 scenario items — apply, don't recall." : "6 concept items — every answer teaches.") +
      " Score: " + score.correct + " correct · " + score.answered + "/" + score.total + " checked";
  }

  /* ── completion modal (CompletionModal.tsx) ──────────────────────── */

  function completionHtml() {
    var defs = OBJ.OBJECTIVES[S.mode];
    var res = SEL.starsFor(S.mode, S.objectives);
    var qs = SEL.quizScore(S.mode, S.quiz);
    var pillars = ["U", "R", "D", "M"];

    /* R8: focus areas derived from THIS student's actual evidence */
    var retried = defs.filter(function (d) {
      return S.objectives[d.id] && S.objectives[d.id].done && (S.objectives[d.id].attempts || 0) > 1;
    });
    var hinted = defs.filter(function (d) { return (S.objectives[d.id] && (S.objectives[d.id].hints || 0) > 0); });
    var items = S.mode === "hard" ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
    var missedQuiz = items.filter(function (q) {
      return S.quiz.checked[q.id] && S.quiz.answers[q.id] !== undefined && S.quiz.answers[q.id] !== q.answer;
    }).map(function (q) { return D.QUIZ_TOPICS[q.id] || q.prompt.slice(0, 40); });
    var weakestPillar = pillars.map(function (p) {
      var list = defs.filter(function (d) { return d.pillar === p; });
      var ft = list.filter(function (d) {
        return S.objectives[d.id] && S.objectives[d.id].done && S.objectives[d.id].firstTry;
      }).length;
      return { p: p, ratio: list.length ? ft / list.length : 1, misses: list.length - ft };
    }).filter(function (x) { return x.misses > 0; })
      .sort(function (a, b) { return a.ratio - b.ratio; })[0];

    var focusAreas = [];
    if (missedQuiz.length > 0) {
      focusAreas.push(
        "Quiz topics to re-read in the Knowledge Core: " + missedQuiz.join("; ") +
        ". Re-open the Briefing drawer (sections 02–04) and re-answer those items until the reasoning is immediate."
      );
    }
    if (retried.length > 0) {
      focusAreas.push(
        "Objectives that took more than one check: " + retried.map(function (d) { return "“" + d.title + "”"; }).join(", ") +
        ". Re-run the " + (S.mode === "hard" ? "Incident Solo" : "Guided Shift") +
        " and aim to clear " + (retried.length === 1 ? "it" : "them") + " on the first try."
      );
    }
    if (hinted.length > 0) {
      focusAreas.push(
        "Objectives solved with hints: " + hinted.map(function (d) { return "“" + d.title + "”"; }).join(", ") +
        ". Redo " + (hinted.length === 1 ? "it" : "them") + " with zero hints — hints cost stars precisely where recall isn't solid yet."
      );
    }
    if (weakestPillar) {
      focusAreas.push(
        "Weakest pillar: " + PILLAR[weakestPillar.p].label + " (" + weakestPillar.misses +
        " non-first-try " + (weakestPillar.misses === 1 ? "objective" : "objectives") +
        "). Review its checklist items and the matching Debrief section before your next shift."
      );
    }
    var cleanSweep = focusAreas.length === 0;

    var stars = [1, 2, 3, 4, 5].map(function (i) {
      return '<span class="star-star' + (i <= res.stars ? " star-on" : "") + '">' + ic("Star", "i-24", i <= res.stars) + "</span>";
    }).join("");

    var pillarCards = pillars.map(function (p) {
      var list = defs.filter(function (d) { return d.pillar === p; });
      var done = list.filter(function (d) { return S.objectives[d.id] && S.objectives[d.id].done; }).length;
      var blurb = "";
      if (p === "U") blurb = "You can explain what cameras and locks do — and why neither stands alone.";
      if (p === "R") blurb = "You can spot the incident, the blind spot and the tampering in raw evidence.";
      if (p === "D") blurb = "You can read badge/keypad/motion telemetry and tune real detections.";
      if (p === "M") blurb = "You can select, apply and verify the right physical controls per zone.";
      return (
        '<li class="pillar-card"><span class="' + PILLAR[p].cls + '">' + PILLAR[p].label + "</span>" +
        '<p class="mono pillar-count">' + done + "/" + list.length + " objectives</p>" +
        '<p class="pillar-blurb">' + blurb + "</p></li>"
      );
    }).join("");

    var focusHtml = cleanSweep
      ? '<div class="clean-sweep"><p class="t-ink">' + ic("BookOpenCheck", "i-14") +
        " No weak spots in this run: every objective cleared first-try, no hints, quiz perfect.</p>" +
        '<p class="t-inkdim clean-sweep-sub">Stay sharp anyway: re-run the other difficulty mode, or redo this shift tomorrow and compare stars — retention fades, checks don\'t.</p></div>'
      : '<ul class="focus-list">' + focusAreas.map(function (f) {
          return '<li class="focus-item">' + esc(f) + "</li>";
        }).join("") + "</ul>";

    var links = D.DEBRIEF.links.slice(0, 4).map(function (l) {
      return '<li><a class="ext-link mono" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
        ic("ExternalLink", "i-12") + " " + esc(l.label) + "</a></li>";
    }).join("");

    return (
      '<div class="modal-head">' +
        '<h2 class="modal-title" id="layer-title">' + ic("Trophy", "i-24 t-amber") + " Shift complete</h2>" +
        '<p class="modal-sub">Every objective on the checklist is verified. Here is your shift report.</p>' +
      "</div>" +
      '<div class="modal-body">' +
        '<div class="stars-row"><div class="stars" aria-label="' + res.stars + ' of 5 stars">' + stars + "</div>" +
        '<div class="stars-meta mono"><span class="t-ink">' + res.firstTry + "/" + defs.length + ' first-try checks</span>' +
        "<span>" + res.hints + " hints used · quiz " + qs.correct + "/" + qs.total + "</span></div></div>" +
        "<div><h3 class=\"sec-title t-amber\">" + ic("Crosshair", "i-14") + " Focus areas — where to tighten up</h3>" + focusHtml + "</div>" +
        '<div><h3 class="sec-title t-steel">' + ic("Award", "i-14") + ' Mastery recap by pillar</h3><ul class="pillar-grid">' + pillarCards + "</ul></div>" +
        '<div><h3 class="sec-title t-steel">What to learn next</h3><ul class="next-list t-inkdim">' +
          "<li>· The adjacent physical controls: security guards, fencing, bollards, signage, fire suppression.</li>" +
          "<li>· Deception technologies (honeypots/honeynets) — next stop in Domain 4.</li>" +
          "<li>· Map this incident to the MITRE pages below and read the full technique entries.</li></ul></div>" +
        '<ul class="link-list">' + links + "</ul>" +
        '<button type="button" class="btn btn-primary btn-block" data-action="close-layer">Back to the watch floor</button>' +
      "</div>"
    );
  }

  /* ── reset confirm (AlertDialog in StatusBar.tsx) ────────────────── */

  function resetDialogHtml() {
    return (
      '<div class="modal-head"><h2 class="modal-title-sm" id="layer-title">Reset the lab?</h2>' +
      '<p class="modal-sub">This wipes your mode, objectives, environment state and quiz progress, restoring the pristine first-shift state. This cannot be undone.</p></div>' +
      '<div class="reset-actions">' +
        '<button type="button" class="btn btn-outline" data-action="close-layer">Cancel</button>' +
        '<button type="button" class="btn btn-danger-solid" data-action="confirm-reset">Reset everything</button>' +
      "</div>"
    );
  }

  /* ── layer (drawer/modal) machinery ──────────────────────────────── */

  var layerOpen = null; // {kind, opener}

  function focusablesIn(container) {
    return container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function trapTab(e, container) {
    var f = focusablesIn(container);
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openDrawer(kind) {
    closeLayer(true);
    var content = document.getElementById("drawer-content");
    if (kind === "knowledge") content.innerHTML = knowledgeHtml();
    else if (kind === "glossary") content.innerHTML = glossaryHtml();
    else if (kind === "debrief") content.innerHTML = debriefHtml();
    else if (kind === "quiz") content.innerHTML = quizHtml();
    var title = content.querySelector("#layer-title");
    if (title) title.id = "drawer-title";
    var drawer = document.getElementById("drawer");
    drawer.setAttribute("aria-labelledby", "drawer-title");
    var overlay = document.getElementById("drawer-overlay");
    overlay.hidden = false;
    drawer.hidden = false;
    void drawer.offsetWidth;
    overlay.classList.add("open");
    drawer.classList.add("open");
    layerOpen = { kind: kind, opener: document.activeElement, type: "drawer" };
    var closeBtn = drawer.querySelector(".layer-close");
    if (closeBtn) closeBtn.focus();
  }

  function openModal(kind) {
    closeLayer(true);
    var content = document.getElementById("modal-content");
    if (kind === "reset") {
      content.innerHTML = resetDialogHtml();
      content.className = "modal-card lab-scroll modal-card-sm";
    } else if (kind === "completion") {
      content.innerHTML = completionHtml();
      content.className = "modal-card lab-scroll";
    }
    var modal = document.getElementById("modal");
    var modalTitle = document.getElementById("modal-content").querySelector("#layer-title");
    if (modalTitle) modalTitle.id = "modal-title";
    modal.setAttribute("aria-labelledby", "modal-title");
    var overlay = document.getElementById("modal-overlay");
    overlay.hidden = false;
    modal.hidden = false;
    void modal.offsetWidth;
    overlay.classList.add("open");
    modal.classList.add("open");
    layerOpen = { kind: kind, opener: document.activeElement, type: "modal" };
    var fb = focusablesIn(content);
    if (fb.length) fb[0].focus();
  }

  function closeLayer(silent) {
    if (!layerOpen) return;
    var info = layerOpen;
    layerOpen = null;
    var node = info.type === "drawer" ? document.getElementById("drawer") : document.getElementById("modal");
    var overlay = document.getElementById(info.type === "drawer" ? "drawer-overlay" : "modal-overlay");
    node.classList.remove("open");
    overlay.classList.remove("open");
    window.setTimeout(function () {
      node.hidden = true;
      overlay.hidden = true;
    }, info.type === "drawer" ? 300 : 200);
    if (!silent && info.opener && info.opener.focus) {
      try {
        info.opener.focus();
      } catch (e) { /* opener may be gone after re-render */ }
    }
  }

  /* ── announce + clock ────────────────────────────────────────────── */

  var lastAnnounce = "";

  function updateAnnounce() {
    var region = document.getElementById("live-region");
    if (region && S.announce !== lastAnnounce) {
      lastAnnounce = S.announce;
      region.textContent = S.announce;
    }
  }

  var clockTimer = null;

  function startClock() {
    stopClock();
    var t = 4 * 60;
    var node = document.getElementById("shift-clock");
    clockTimer = window.setInterval(function () {
      t += 1;
      var h = 6 + Math.floor(t / 3600);
      var m = Math.floor((t % 3600) / 60);
      var s = t % 60;
      if (node) {
        node.textContent =
          String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      }
    }, 1000);
  }

  function stopClock() {
    if (clockTimer) {
      window.clearInterval(clockTimer);
      clockTimer = null;
    }
  }

  /* ── "Where" scroll + ring flash (Panel.tsx focus effect) ─────────── */

  var lastFocusSeq = null;

  function maybeFlash() {
    if (!S.focus) {
      lastFocusSeq = null;
      return;
    }
    if (S.focus.seq === lastFocusSeq) return;
    lastFocusSeq = S.focus.seq;
    var sec = document.getElementById("panel-" + S.focus.panel);
    if (!sec) return;
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
    var f = sec.querySelector(".flash-el");
    if (f) {
      f.hidden = false;
      f.classList.remove("run");
      void f.offsetWidth;
      f.classList.add("run");
    }
  }

  /* ── sync (called on every store mutation) ───────────────────────── */

  function sync() {
    updateAnnounce();
    if (!S.mode) return; // mode-select screen has no dynamic zones
    updateStatus();
    updateRail();
    updateSpots();
    updateSchematic();
    updateAudit();
    updateRulePreview();
    updateLockout();
    maybeFlash();
    if (layerOpen && layerOpen.kind === "quiz") updateQuizScoreline();
  }

  /* ── app switcher ────────────────────────────────────────────────── */

  function renderApp(root) {
    stopClock();
    closeLayer(true);
    if (!S.booted) {
      root.innerHTML = '<div class="boot-screen" role="status" aria-live="polite">' +
        '<p class="mono boot-text">Booting watch floor<span class="rec-dot">_</span></p></div>';
      return;
    }
    if (!S.mode) {
      renderModeSelect(root);
      return;
    }
    renderMain(root);
  }

  window.LabUI = {
    renderApp: renderApp,
    openDrawer: openDrawer,
    openModal: openModal,
    closeLayer: closeLayer,
    trapTab: trapTab,
    layerOpen: function () {
      return layerOpen;
    },
    sync: sync,
    rerenderChainArea: rerenderChainArea,
    computeChainDisplayOrder: computeChainDisplayOrder,
    setChainDisplayOrder: function (v) {
      chainDisplayOrder = v;
    },
    quizItemHtml: quizItemHtml,
    startClock: startClock,
    stopClock: stopClock,
  };
})();
