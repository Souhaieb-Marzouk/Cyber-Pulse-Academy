// SIGNALPATH lab — app bootstrap, rendering, event wiring.
// Static port of the React component tree (page.tsx + components/lab/*).
// One render pass rebuilds the page from store state; focus, caret and scroll
// positions are captured before and restored after each pass so typing and
// scrolling behave exactly like the original incremental React updates.
window.SP_APP = (function () {
  "use strict";

  var UI = window.SP_UI;
  var DATA = window.SP_DATA;
  var CONTENT = window.SP_CONTENT;
  var store = window.SP_STATE;
  var OBJ = window.SP_OBJECTIVES;
  var QUIZ = window.SP_QUIZ;
  var el = UI.el;
  var icon = UI.icon;
  var cn = UI.cn;
  var dispatch = store.dispatch;

  // ------------------------------------------------------------------
  // transient UI state (component-local state in the original; not persisted)
  // ------------------------------------------------------------------
  var ui = {
    stageFilter: null,
    openModule: "snmp",
    selectedDevice: null,
    selectedFrame: null,
    logSearch: "",
    sevFilter: "all",
    openCard: "snmp",
    objectiveOpen: {},
    objectiveFeedback: {},
    apiResp: null,
    apiLastPath: "",
    prnCommunity: null,
    prnApplied: false,
    lastLocateTarget: null,
    completionModalOpen: false,
  };

  var STAGE_ORDER = OBJ.STAGE_ORDER;
  var STAGE_LABEL = OBJ.STAGE_LABEL;
  var MON1_IP = DATA.MON1_IP;
  var SEV_NAMES = ["", "", "critical", "error", "warning", "notice", "informational", "debug"];

  // objective → panel anchor (ObjectivesBoard LOCATE map)
  var LOCATE = {
    "OBJ-M1": "field-manual",
    "OBJ-M2": "evidence-deck",
    "OBJ-M3": "instrument-rack",
    "OBJ-M4": "instrument-rack",
    "OBJ-M5": "instrument-rack",
    "OBJ-M6": "instrument-rack",
    "OBJ-M7": "evidence-deck",
    "OBJ-M8": "evidence-deck",
    "OBJ-M9": "evidence-deck",
    "OBJ-M10": "evidence-deck",
    "OBJ-M11": "incident-bay",
    "OBJ-M12": "response-panel",
    "OBJ-H1": "instrument-rack",
    "OBJ-H2": "evidence-deck",
    "OBJ-H3": "evidence-deck",
    "OBJ-H4": "evidence-deck",
    "OBJ-H5": "incident-bay",
    "OBJ-H6": "evidence-deck",
    "OBJ-H7": "response-panel",
    "OBJ-H8": "evidence-deck",
    "OBJ-H9": "field-manual",
  };

  // ------------------------------------------------------------------
  // progress engine (LabProvider.tsx)
  // ------------------------------------------------------------------
  function computeProgress(state, objectives) {
    var total = objectives.length;
    var done = 0, firstTry = 0, hints = 0;
    objectives.forEach(function (o) {
      var p = state.objectives[o.id];
      if (p) {
        if (p.done) done++;
        if (p.firstTry) firstTry++;
        hints += p.hintsUsed;
      }
    });
    var quizItems = state.mode === "hard" ? CONTENT.QUIZ_HARD.length : CONTENT.QUIZ_MEDIUM.length;
    var quizCorrect = state.quizSubmitted ? QUIZ.computeQuizCorrect(state.mode || "medium", state.quizAnswers) : 0;
    var objPart = total > 0 ? (firstTry / total) * 60 + (done / total) * 20 : 0;
    var quizPart = state.quizSubmitted ? (quizCorrect / quizItems) * 20 : 0;
    var hintPenalty = Math.min(10, hints * 0.75);
    var score = Math.max(0, Math.min(100, Math.round(objPart + quizPart - hintPenalty)));
    var stars = Math.max(1, Math.min(5, Math.round(1 + (score / 100) * 4)));
    var stageDone = {};
    STAGE_ORDER.forEach(function (st) {
      var list = objectives.filter(function (o) { return o.stage === st; });
      stageDone[st] = {
        done: list.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].done; }).length,
        total: list.length,
      };
    });
    return { total: total, done: done, score: score, stars: stars, stageDone: stageDone, hintsUsed: hints };
  }

  // ------------------------------------------------------------------
  // MODE GATE (ModeGate.tsx)
  // ------------------------------------------------------------------
  function modeCard(opts) {
    var card = el("div", { class: "sp-rack mode-card" });
    var top = el("div", { class: "mode-card-top" },
      el("div", { class: cn("mode-card-icon", opts.accent) }, icon(opts.icon, "ico-20")),
      el("span", { class: cn("badge-pill mode-tag", opts.accent) }, opts.tag)
    );
    card.appendChild(top);
    card.appendChild(el("h2", null, opts.title));
    var ul = el("ul", { class: cn("mode-points", opts.accent) });
    opts.points.forEach(function (p) { ul.appendChild(el("li", null, p)); });
    card.appendChild(ul);
    card.appendChild(el("button", {
      class: cn("mode-cta", opts.accent),
      on: { click: function () { dispatch({ type: "SET_MODE", mode: opts.mode }); } },
    }, opts.cta));
    return card;
  }

  function renderGate() {
    var wrap = el("div", { class: "sp-chassis gate-wrap" });
    var inner = el("div", { class: "gate-inner" });
    var head = el("div", { class: "gate-head" },
      el("div", { class: "gate-pill" }, el("span", { class: "sp-led t-lime animate-pulse", style: { background: "var(--lime)" } }), "TRAINING LAB · 100% SYNTHETIC DATA"),
      el("h1", { class: "gate-title" }, CONTENT.LAB_TITLE),
      el("p", { class: "gate-sub" }, CONTENT.LAB_SUBTITLE),
      el("p", { class: "gate-meta" }, CONTENT.LAB_META)
    );
    inner.appendChild(head);
    var grid = el("div", { class: "gate-grid" });
    grid.appendChild(modeCard({
      icon: "gauge", title: "MEDIUM — Guided shift", tag: "Learn & build", accent: "lime", mode: "medium",
      points: [
        "12 guided objectives, one skill at a time, in working order",
        "Where-to-look locator + up to 3 tiered hints per objective",
        "Tolerant checking: near-forms accepted, every answer teaches",
        "Quiz after practice · 5★ rating for first-attempt accuracy",
      ],
      cta: "Start guided shift",
    }));
    grid.appendChild(modeCard({
      icon: "skull", title: "HARD — Cold start", tag: "Test & stretch", accent: "coral", mode: "hard",
      points: [
        "9 broad multi-step challenges; find what matters yourself",
        "Salted evidence: sanctioned transfers, P2P noise, chatty printers",
        "Strict checking: exact IPs, exact thresholds, exact sequences",
        "One optional nudge max — it costs score, visibly",
      ],
      cta: "Take the cold start",
    }));
    inner.appendChild(grid);
    inner.appendChild(el("p", { class: "gate-note" },
      "Both modes share the same simulated network and evidence deck. Progress auto-saves in your browser."));
    wrap.appendChild(inner);
    return wrap;
  }

  // ------------------------------------------------------------------
  // STATUS STRIP (StatusStrip.tsx)
  // ------------------------------------------------------------------
  function jumpToStage(state, objectives, st) {
    ui.stageFilter = ui.stageFilter === st ? null : st;
    rerenderFromState(state);
    var target = document.getElementById("objectives-board");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderStatusStrip(state, objectives, progress) {
    var pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
    var r = 10;
    var circ = 2 * Math.PI * r;

    var header = el("header", { class: "status-strip", attrs: { role: "banner" } });
    var inner = el("div", { class: "ss-inner" });

    // callsign
    inner.appendChild(el("div", { class: "callsign" },
      el("div", { class: "callsign-badge" }, icon("radio-tower", "ico-20")),
      el("div", { style: { minWidth: "0" } },
        el("div", { class: "callsign-title" }, CONTENT.LAB_TITLE, el("span", { class: "dim" }, " · MERIDIAN-NOC")),
        el("div", { class: "callsign-meta" }, CONTENT.LAB_META)
      )
    ));

    // signal path rail
    var rail = el("nav", { class: "ss-rail", attrs: { "aria-label": "Monitoring signal path" } });
    STAGE_ORDER.forEach(function (st, i) {
      var sd = progress.stageDone[st] || { done: 0, total: 0 };
      var complete = sd.total > 0 && sd.done === sd.total;
      var active = ui.stageFilter === st;
      if (i > 0) rail.appendChild(el("div", { class: cn("ss-connector", complete && "dash"), attrs: { "aria-hidden": "true" } }));
      rail.appendChild(el("button", {
        class: cn("ss-node", complete && "complete", active && "active"),
        attrs: {
          "aria-pressed": String(active),
          title: STAGE_LABEL[st] + ": " + sd.done + "/" + sd.total + " objectives",
        },
        on: { click: function () { jumpToStage(state, objectives, st); } },
      }, STAGE_LABEL[st], el("span", { class: "frac" }, sd.done + "/" + sd.total)));
    });
    inner.appendChild(rail);

    // progress + reset
    var right = el("div", { class: "ss-progress" });
    var ring = UI.svgEl("svg", {
      width: 28, height: 28, viewBox: "0 0 28 28", role: "img",
      "aria-label": "Progress: " + progress.done + " of " + progress.total + " objectives",
    });
    ring.appendChild(UI.svgEl("circle", { cx: 14, cy: 14, r: r, fill: "none", stroke: "#2a3542", "stroke-width": 3 }));
    var dash = UI.svgEl("circle", {
      cx: 14, cy: 14, r: r, fill: "none", stroke: "#a3e635", "stroke-width": 3,
      "stroke-dasharray": (pct / 100) * circ + " " + circ, "stroke-linecap": "round",
    });
    dash.setAttribute("transform", "rotate(-90 14 14)");
    dash.style.transition = "stroke-dasharray 0.4s ease";
    ring.appendChild(dash);
    var ringText = UI.svgEl("text", { x: 14, y: 17, "text-anchor": "middle", "font-size": 8, fill: "#e8eef5", class: "ring-text" });
    ringText.textContent = progress.done + "/" + progress.total;
    ring.appendChild(ringText);
    right.appendChild(ring);
    right.appendChild(el("div", { class: "ss-score" },
      el("div", { class: "num" }, "score " + progress.score),
      el("div", { class: "t10 muted-fg" }, objectives.length + " objectives")
    ));

    var resetBtn = el("button", {
      class: "btn btn-outline-muted",
      attrs: { "aria-label": "Reset lab progress" },
      on: { click: function () { openResetDialog(); } },
    }, icon("rotate-ccw", "ico-16"), el("span", { class: "hide-sm" }, "RESET"));
    right.appendChild(resetBtn);
    inner.appendChild(right);

    header.appendChild(inner);
    return header;
  }

  function openResetDialog() {
    UI.openModal({
      title: "Reset the lab?",
      description:
        "This wipes ALL saved progress — mode, deployed instruments, objective results, quiz and rating — and returns the deck to its pristine state. This cannot be undone.",
      isAlertDialog: true,
      mount: function (body, close) {
        var actions = el("div", { class: "modal-actions" });
        actions.appendChild(el("button", { class: "btn btn-outline", on: { click: close } }, "Keep my shift"));
        actions.appendChild(el("button", {
          class: "btn btn-coral",
          on: {
            click: function () {
              close();
              store.clearState();
              ui.stageFilter = null;
              ui.openModule = "snmp";
              ui.selectedDevice = null;
              ui.selectedFrame = null;
              ui.logSearch = "";
              ui.sevFilter = "all";
              ui.openCard = "snmp";
              ui.objectiveOpen = {};
              ui.objectiveFeedback = {};
              ui.apiResp = null;
              ui.apiLastPath = "";
              ui.prnApplied = false;
              ui.completionModalOpen = false;
              dispatch({ type: "RESET" });
            },
          },
        }, "Reset everything"));
        body.appendChild(actions);
      },
    });
  }

  // ------------------------------------------------------------------
  // NETWORK MAP (NetworkMap.tsx)
  // ------------------------------------------------------------------
  function deviceById() {
    var map = {};
    DATA.DEVICES.forEach(function (d) { map[d.id] = d; });
    return map;
  }

  function ledFill(state, d) {
    if (!d.selectable) return "#2a3542";
    if (state.phase === "incident") {
      if (d.id === "FW1") return "#e8b34b";
      if (d.id === "SW3" && state.containment.portDisabled) return "#f0705a";
      if (d.id === "SW3") return "#e8b34b";
    }
    return "#57c787";
  }

  function renderNetworkMap(state) {
    var byId = deviceById();
    var root = el("div", { class: "sp-rack panel-pad" });

    var head = el("div", { class: "map-head" },
      el("h2", { class: "panel-title" }, "NETWORK STAGE",
        el("span", { class: "hint-inline" }, "click a node for monitoring notes")),
      el("span", { class: "tape-badge" }, "tape: " + (state.phase === "baseline" ? "BASELINE WEEK" : "INCIDENT SHIFT"))
    );
    root.appendChild(head);

    var viewport = el("div", { class: "map-viewport scroll-x", attrs: { "data-scrollkey": "map-viewport" } });
    var svg = UI.svgEl("svg", {
      viewBox: "0 0 100 84", class: "map-svg", role: "img",
      "aria-label": "Meridian Freight network topology map",
    });

    DATA.LINKS.forEach(function (l) {
      var a = byId[l.from], b = byId[l.to];
      var mirrored = state.spanSwitch === l.to && state.spanSource === "vlan20";
      var lineAttrs = {
        x1: a.x + 6, y1: a.y + 3, x2: b.x + 6, y2: b.y + 3,
        stroke: mirrored ? "#a3e635" : l.vpn ? "#4fd1e0" : "#2a3542",
        "stroke-width": mirrored ? 0.7 : 0.5,
      };
      if (l.vpn) lineAttrs["stroke-dasharray"] = "1.5 1.2";
      else if (mirrored) lineAttrs["stroke-dasharray"] = "2 1";
      svg.appendChild(UI.svgEl("line", lineAttrs));
      var lbl = UI.svgEl("text", {
        x: (a.x + b.x) / 2 + 7, y: (a.y + b.y) / 2 + 2.2,
        "font-size": 2.1, fill: "#93a3b5",
      });
      lbl.textContent = l.label;
      svg.appendChild(lbl);
    });

    DATA.DEVICES.forEach(function (d) {
      var w = 13, h = 6.4;
      var dim = !d.selectable;
      var isSel = ui.selectedDevice === d.id;
      var g = UI.svgEl("g", { transform: "translate(" + d.x + " " + d.y + ")" });
      if (d.selectable) {
        g.setAttribute("class", "map-node selectable");
        g.setAttribute("tabindex", "0");
        g.setAttribute("role", "button");
        var handler = function () { ui.selectedDevice = ui.selectedDevice === d.id ? null : d.id; rerenderFromState(state); };
        g.addEventListener("click", handler);
        g.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handler(); }
        });
      } else {
        g.setAttribute("class", "map-node");
      }
      g.setAttribute("aria-label", d.label + " — " + d.role);

      g.appendChild(UI.svgEl("rect", {
        width: w, height: h, rx: 0.9,
        fill: isSel ? "#223041" : "#1b2430",
        stroke: isSel ? "#a3e635" : dim ? "#232d3a" : "#2a3542",
        "stroke-width": isSel ? 0.55 : 0.35,
      }));
      var pulse = state.phase === "incident" && (d.id === "FW1" || d.id === "SW3");
      g.appendChild(UI.svgEl("circle", {
        cx: w - 1.7, cy: 1.7, r: 0.75,
        fill: ledFill(state, d),
        class: pulse ? "animate-pulse" : null,
      }));
      var t1 = UI.svgEl("text", { x: 1.2, y: 2.9, "font-size": 2.6, fill: "#e8eef5", "font-weight": 600, class: "dev-label" });
      t1.textContent = d.label;
      g.appendChild(t1);
      var t2 = UI.svgEl("text", { x: 1.2, y: 5.4, "font-size": 2, fill: "#93a3b5" });
      t2.textContent = d.ip;
      g.appendChild(t2);
      svg.appendChild(g);
    });

    viewport.appendChild(svg);
    root.appendChild(viewport);

    // patch-plane status chips
    var chips = el("div", { class: "map-chips" });
    function chip(on, label, tint) {
      chips.appendChild(el("span", {
        class: cn("chip", on && "on", on && "on-" + tint),
        attrs: { "aria-label": (on ? label + " deployed" : label + " not deployed") },
      }, (on ? "●" : "○") + " " + label));
    }
    chip(state.snmpDevices.length > 0, "SNMP " + (state.snmpVersion || "") + " · " + state.snmpDevices.length + " dev", "lime");
    chip(state.flowDevices.length > 0, "FLOW " + state.flowDevices.length + " exporter", "flow");
    chip(!!state.spanSwitch, "SPAN " + (state.spanSwitch || "—") + (state.spanSource ? "/" + state.spanSource : ""), "lime");
    chip(state.syslogDevices.length > 0, "SYSLOG " + state.syslogDevices.length + " src " + (state.syslogTransport || ""), "amber");
    chip(state.apiEnabled, "API GATEWAY", "api");
    root.appendChild(chips);

    // device info card
    if (ui.selectedDevice && byId[ui.selectedDevice]) {
      var d = byId[ui.selectedDevice];
      root.appendChild(el("div", { class: "map-note" },
        el("div", { class: "note-title" }, d.label + " — " + d.role),
        el("p", { class: "note-body" }, DATA.DEVICE_NOTES[d.id] || "Standard monitored asset.")
      ));
    }
    return root;
  }

  // ------------------------------------------------------------------
  // INSTRUMENT RACK (InstrumentRack.tsx)
  // ------------------------------------------------------------------
  function moduleShell(id, opts, bodyBuilder, state) {
    var open = ui.openModule === id;
    var mod = el("div", { class: cn("module", open ? "open" : "closed") });
    var tintCls = { lime: "lime", flow: "flow", amber: "amber", api: "api" }[opts.tint];
    mod.appendChild(el("button", {
      class: "module-btn",
      attrs: { "aria-expanded": String(open) },
      on: { click: function () { ui.openModule = open ? null : id; rerenderFromState(state); } },
    },
      el("span", { class: cn("module-icon", tintCls) }, icon(opts.icon, "ico-16")),
      el("span", { class: "module-title" }, opts.title),
      el("span", { class: cn("module-status", opts.patched && "patched") }, opts.status),
      el("span", { class: "module-chev" }, open ? "▾" : "▸")
    ));
    if (open) {
      var body = el("div", { class: "module-body" });
      bodyBuilder(body);
      mod.appendChild(body);
    }
    return mod;
  }

  function tileGrid(devices, selected, tint, ariaPrefix, onToggle) {
    var grid = el("div", { class: cn("tile-grid", devices.length > 4 ? "cols-4" : "cols-2") });
    devices.forEach(function (d) {
      var on = selected.indexOf(d) !== -1;
      var input = el("input", {
        attrs: { type: "checkbox", "aria-label": ariaPrefix + " " + d },
        on: { change: function () { onToggle(d); } },
      });
      input.checked = on;
      grid.appendChild(el("label", { class: cn("tile", on && "on-" + tint) }, input, d));
    });
    return grid;
  }

  function renderPrnPanel(state) {
    var panel = el("div", { class: "legacy-panel" });
    panel.appendChild(el("div", { class: "legacy-head" }, icon("plug-zap", "ico-14"),
      el("span", null, 'LEGACY DEVICE PANEL — PRN-HQ1 (v2c only, community "public")')));
    var form = el("div", { class: "legacy-form" });

    var communityValue = ui.prnCommunity !== null ? ui.prnCommunity : (state.deviceSnmp.PRN ? state.deviceSnmp.PRN.community : "public");
    var commWrap = el("div", null,
      el("label", { class: "f-label", attrs: { for: "prn-comm" } }, "NEW COMMUNITY"),
      el("input", {
        class: "input-legacy",
        attrs: { id: "prn-comm", type: "text", placeholder: "strong string", "data-fkey": "prn-community" },
        on: { input: function (e) { ui.prnCommunity = e.target.value; } },
      })
    );
    commWrap.querySelector("input").value = communityValue;
    form.appendChild(commWrap);

    var aclChecked = state.deviceSnmp.PRN ? state.deviceSnmp.PRN.acl : false;
    var acl = el("input", {
      attrs: { type: "checkbox", "aria-label": "Restrict pollers with ACL + management VLAN" },
      on: {
        change: function (e) {
          ui.prnApplied = false;
          dispatch({ type: "SET_PRN_SNMP", community: currentCommunity(), acl: e.target.checked });
        },
      },
    });
    acl.checked = aclChecked;
    form.appendChild(el("label", { class: "acl-label" }, acl, "Poller ACL + mgmt VLAN"));

    function currentCommunity() {
      var inp = form.querySelector("#prn-comm");
      return inp ? inp.value : communityValue;
    }

    form.appendChild(el("button", {
      class: "btn btn-lime minh-36",
      on: {
        click: function () {
          var c = currentCommunity();
          dispatch({ type: "SET_PRN_SNMP", community: c, acl: acl.checked });
          if (c.trim().length >= 8 && c.trim() !== "public" && acl.checked) {
            dispatch({ type: "SET_HARDENING", key: "printerSnmp", value: true });
            ui.prnApplied = true;
          } else {
            dispatch({ type: "SET_HARDENING", key: "printerSnmp", value: false });
            ui.prnApplied = false;
          }
        },
      },
    }, "Apply hardening"));

    if (ui.prnApplied) form.appendChild(el("span", { class: "hardened-ok" }, "✓ hardened (strong string + ACL)"));
    panel.appendChild(form);
    return panel;
  }

  function renderSnmpHealthTable(state) {
    var rows = DATA.SNMP_HEALTH(
      state.phase === "incident" ? 91 : 34,
      state.phase === "incident" ? "77% out" : "38% out"
    );
    var scroll = el("div", { class: "table-scroll scroll-x", attrs: { "data-scrollkey": "snmp-health" } });
    var table = el("table", { class: "data-table" });
    var thead = el("thead", null, el("tr", null,
      ["device", "cpu%", "mem%", "if util", "status"].map(function (h) { return el("th", null, h); })
    ));
    var tbody = el("tbody");
    rows.forEach(function (r) {
      tbody.appendChild(el("tr", null,
        el("td", { class: "t-fg" }, r.device),
        el("td", { class: r.cpu > 80 ? "hot" : "t-fg" }, String(r.cpu)),
        el("td", { class: "t-fg" }, String(r.mem)),
        el("td", { class: "t-fg" }, r.util),
        el("td", { class: "t-ok" }, r.status)
      ));
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    scroll.appendChild(table);
    return scroll;
  }

  function renderInstrumentRack(state) {
    var root = el("div", { class: "sp-rack panel-pad" });
    root.appendChild(el("h2", { class: "panel-title" }, "INSTRUMENT RACK",
      el("span", { class: "hint-inline" }, "patch each instrument to its acquisition point")));
    root.appendChild(el("p", { class: "rack-sub" },
      "Five acquisition families. Each module: pick targets → configure → the signal arrives in the Evidence deck below. MON1 (the monitoring server) is ",
      el("span", { class: "mono t-lime" }, MON1_IP), "."));

    var grid = el("div", { class: "rack-modules" });

    // 1 · SNMP POLLER
    grid.appendChild(moduleShell("snmp", {
      icon: "radio", tint: "lime", title: "1 · SNMP POLLER",
      patched: state.snmpDevices.length > 0,
      status: state.snmpDevices.length > 0
        ? "PATCHED · " + state.snmpDevices.length + " devices · " + (state.snmpVersion || "unversioned") + (state.snmpAuthPriv ? " authPriv" : "")
        : "UNPATCHED",
    }, function (body) {
      var grid2 = el("div", { class: "grid-2" });
      var left = el("div", null,
        el("span", { class: "f-label" }, "POLL TARGETS (device health)"),
        tileGrid(DATA.POLLABLE, state.snmpDevices, "lime", "SNMP poll target", function (d) {
          dispatch({ type: "TOGGLE_SNMP_DEVICE", device: d });
        })
      );
      var right = el("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } });
      right.appendChild(el("div", null,
        el("span", { class: "f-label" }, "SNMP VERSION"),
        UI.select({
          value: state.snmpVersion || "",
          placeholder: "select version",
          ariaLabel: "SNMP version",
          options: [
            { value: "v2c", label: "v2c — community string (cleartext)" },
            { value: "v3", label: "v3 — users + auth + encryption" },
          ],
          onChange: function (v) { dispatch({ type: "SET_SNMP_VERSION", version: v }); },
        })
      ));
      var sw = UI.switchInput({
        id: "authpriv", checked: state.snmpAuthPriv, ariaLabel: "authPriv mode",
        onChange: function (on) { dispatch({ type: "SET_SNMP_AUTHPRIV", on: on }); },
      });
      right.appendChild(el("div", { class: "switch-row" },
        el("label", { class: "sw-text", attrs: { for: "authpriv" } }, "authPriv mode",
          el("span", { class: "sw-sub" }, "auth (SHA) + privacy (AES)")),
        sw
      ));
      grid2.appendChild(left);
      grid2.appendChild(right);
      body.appendChild(grid2);
      body.appendChild(renderPrnPanel(state));
    }, state));

    // 2 · FLOW COLLECTOR
    grid.appendChild(moduleShell("flow", {
      icon: "network", tint: "flow", title: "2 · FLOW COLLECTOR",
      patched: state.flowDevices.length > 0,
      status: state.flowDevices.length > 0
        ? "PATCHED · " + state.flowDevices.length + " exporters · " + (state.flowVersion || "no version")
        : "UNPATCHED",
    }, function (body) {
      var grid2 = el("div", { class: "grid-2" });
      grid2.appendChild(el("div", null,
        el("span", { class: "f-label" }, "EXPORTERS (egress points)"),
        tileGrid(DATA.FLOWABLE, state.flowDevices, "flow", "Flow exporter", function (d) {
          dispatch({ type: "TOGGLE_FLOW_DEVICE", device: d });
        })
      ));
      var right = el("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } });
      right.appendChild(el("div", null,
        el("span", { class: "f-label" }, "EXPORT VERSION"),
        UI.select({
          value: state.flowVersion || "", placeholder: "select version", ariaLabel: "Flow export version",
          options: [
            { value: "netflow-v9", label: "NetFlow v9 (template-based)" },
            { value: "ipfix", label: "IPFIX (IETF standard)" },
          ],
          onChange: function (v) { dispatch({ type: "SET_FLOW_VERSION", version: v }); },
        })
      ));
      right.appendChild(el("div", null,
        el("span", { class: "f-label" }, "COLLECTOR"),
        UI.select({
          value: state.flowCollector || "", placeholder: "send records to…", ariaLabel: "Flow collector",
          options: [
            { value: MON1_IP, label: "MON1 · " + MON1_IP + ":2055" },
            { value: "203.0.113.99", label: "203.0.113.99:2055 (unregistered)" },
          ],
          onChange: function (v) { dispatch({ type: "SET_FLOW_COLLECTOR", ip: v }); },
        })
      ));
      grid2.appendChild(right);
      body.appendChild(grid2);
    }, state));

    // 3 · PACKET SCOPE
    grid.appendChild(moduleShell("span", {
      icon: "activity", tint: "lime", title: "3 · PACKET SCOPE (port mirroring)",
      patched: !!state.spanSwitch,
      status: state.spanSwitch ? "PATCHED · " + state.spanSwitch + " src " + state.spanSource : "UNPATCHED",
    }, function (body) {
      var grid3 = el("div", { class: "grid-3" });
      grid3.appendChild(el("div", null,
        el("span", { class: "f-label" }, "MIRROR ON SWITCH"),
        UI.select({
          value: state.spanSwitch || "", placeholder: "switch", ariaLabel: "Mirror on switch",
          options: ["SW1", "SW2", "SW3", "SW4"].map(function (s) { return { value: s, label: s }; }),
          onChange: function (v) { dispatch({ type: "SET_SPAN", sw: v, source: state.spanSource }); },
        })
      ));
      grid3.appendChild(el("div", null,
        el("span", { class: "f-label" }, "SOURCE"),
        UI.select({
          value: state.spanSource || "", placeholder: "source", ariaLabel: "SPAN source",
          options: [
            { value: "vlan10", label: "VLAN 10 — office" },
            { value: "vlan20", label: "VLAN 20 — fleet ops" },
            { value: "vlan30", label: "VLAN 30 — servers" },
            { value: "vlan10+vlan20+vlan30", label: "VLANs 10+20+30 (everything)" },
          ],
          onChange: function (v) { dispatch({ type: "SET_SPAN", sw: state.spanSwitch, source: v }); },
        })
      ));
      grid3.appendChild(el("div", null,
        el("span", { class: "f-label" }, "SPEED QUESTION — switch CPU already 80%+ on a 1 Gb/s uplink. Best acquisition?"),
        UI.select({
          value: state.acquisitionQ || "", placeholder: "method", ariaLabel: "Acquisition method",
          options: [
            { value: "span", label: "SPAN on the same switch" },
            { value: "tap", label: "Passive TAP on the link" },
            { value: "promisc", label: "Promiscuous port on the same switch" },
          ],
          onChange: function (v) { dispatch({ type: "SET_ACQUISITION", value: v }); },
        })
      ));
      body.appendChild(grid3);
      body.appendChild(el("p", { class: "rack-sub mono", style: { fontSize: "11px", margin: "8px 0 0" } },
        "SPAN costs the switch forwarding effort — scope sources deliberately. A passive TAP is inline hardware: no switch load, fail-safe pass-through."));
    }, state));

    // 4 · SYSLOG SINK
    grid.appendChild(moduleShell("syslog", {
      icon: "scroll-text", tint: "amber", title: "4 · SYSLOG SINK",
      patched: state.syslogDevices.length > 0,
      status: state.syslogDevices.length > 0
        ? "PATCHED · " + state.syslogDevices.length + " sources · " + (state.syslogTransport || "no transport")
        : "UNPATCHED",
    }, function (body) {
      var grid2 = el("div", { class: "grid-2" });
      grid2.appendChild(el("div", null,
        el("span", { class: "f-label" }, "LOG SOURCES → MON1"),
        tileGrid(DATA.SYSLOGABLE, state.syslogDevices, "amber", "Syslog source", function (d) {
          dispatch({ type: "TOGGLE_SYSLOG_DEVICE", device: d });
        })
      ));
      var right = el("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } });
      right.appendChild(el("div", null,
        el("span", { class: "f-label" }, "TRANSPORT"),
        UI.select({
          value: state.syslogTransport || "", placeholder: "transport", ariaLabel: "Syslog transport",
          options: [
            { value: "udp-514", label: "UDP 514 — classic, cleartext" },
            { value: "tls-6514", label: "TCP 6514 — syslog over TLS" },
          ],
          onChange: function (v) { dispatch({ type: "SET_SYSLOG_TRANSPORT", t: v }); },
        })
      ));
      var sevOptions = [2, 3, 4, 5, 6, 7].map(function (n) {
        return { value: String(n), label: n + " and worse (" + SEV_NAMES[n] + ")" };
      });
      right.appendChild(el("div", null,
        el("span", { class: "f-label" }, "MINIMUM SEVERITY (0 = emergency … 7 = debug)"),
        UI.select({
          value: state.syslogMinSeverity !== null ? String(state.syslogMinSeverity) : "",
          placeholder: "collect severity…", ariaLabel: "Minimum severity",
          options: sevOptions,
          onChange: function (v) { dispatch({ type: "SET_SYSLOG_SEVERITY", sev: Number(v) }); },
        })
      ));
      grid2.appendChild(right);
      body.appendChild(grid2);
    }, state));

    // 5 · API GATEWAY
    grid.appendChild(moduleShell("api", {
      icon: "webhook", tint: "api", title: "5 · API GATEWAY",
      patched: state.apiEnabled,
      status: state.apiEnabled ? "PATCHED · REST/JSON" + (state.apiReadOnly ? " · read-only" : "") : "UNPATCHED",
    }, function (body) {
      var row = el("div", { class: "api-module-row" });
      var sw = UI.switchInput({
        id: "api-enabled", checked: state.apiEnabled,
        onChange: function (on) { dispatch({ type: "SET_API_ENABLED", on: on }); },
      });
      row.appendChild(el("label", { class: "api-enable-label", attrs: { for: "api-enabled" } },
        sw,
        el("span", null, "Expose REST API on MON1",
          el("span", { class: "sub" }, "health, ports & config endpoints (JSON)"))
      ));
      row.appendChild(el("button", {
        class: "btn btn-outline minh-36",
        attrs: { disabled: !state.apiEnabled || state.apiTokenRotated || null },
        on: { click: function () { dispatch({ type: "SET_HARDENING", key: "apiToken", value: true }); } },
      }, state.apiTokenRotated ? "Token rotated · read-only" : "Rotate default token + enforce read-only"));
      row.appendChild(el("span", { class: "token-note" }, "default install token: ",
        el("span", { class: state.apiTokenRotated ? "strike t-crit" : "t-crit" }, "active")));
      body.appendChild(row);
    }, state));

    root.appendChild(grid);
    return root;
  }

  // ------------------------------------------------------------------
  // EVIDENCE DECK (EvidenceDeck.tsx)
  // ------------------------------------------------------------------
  function viewHeader(title, tint) {
    var cls = { lime: "t-lime", flow: "t-flow", amber: "t-amber", api: "t-api" }[tint];
    return el("h3", { class: cn("view-head", cls) }, title);
  }

  function renderEvidenceDeck(state) {
    var tape = state.phase;
    var root = el("div", { class: "sp-rack panel-pad" });

    var viewAvailable = {
      snmp: state.snmpDevices.length > 0,
      flow: state.flowDevices.length > 0 && !!state.flowCollector,
      packet: !!state.spanSwitch,
      syslog: state.syslogDevices.length > 0,
      api: state.apiEnabled,
    };
    var viewLabels = { snmp: "SNMP", flow: "FLOW", packet: "PACKETS", syslog: "SYSLOG", api: "API" };

    var head = el("div", { class: "deck-head" },
      el("h2", { class: "panel-title" }, "EVIDENCE DECK"));
    var tapes = el("div", { class: "tape-group", attrs: { role: "tablist", "aria-label": "Timeline tape" } });
    [
      { id: "baseline", label: "TAPE A · BASELINE WEEK" },
      { id: "incident", label: "TAPE B · INCIDENT SHIFT" },
    ].forEach(function (t) {
      var active = tape === t.id;
      tapes.appendChild(el("button", {
        class: cn("tape-btn", active && "active"),
        attrs: {
          "aria-pressed": String(active),
          "aria-label": active ? t.label + " (loaded)" : t.label,
        },
        on: { click: function () { ui.selectedFrame = null; dispatch({ type: "SET_PHASE", phase: t.id }); } },
      }, icon("circle", cn("ico-14", active && "reel-spin")), t.label));
    });
    head.appendChild(tapes);
    root.appendChild(head);

    root.appendChild(el("p", { class: "sim-note", attrs: { role: "note" } }, DATA.SIM_NOTICE));

    if (tape === "baseline" && !state.baselineRecorded) {
      root.appendChild(el("div", { class: "record-banner" },
        icon("disc", "ico-16 t-lime"),
        el("span", null, "No baseline recorded yet — one week of reference data makes every later \"is this weird?\" decidable."),
        el("button", {
          class: "btn btn-lime minh-40",
          on: { click: function () { dispatch({ type: "RECORD_BASELINE" }); } },
        }, "RECORD 7-DAY BASELINE")
      ));
    }

    if (state.phase === "baseline" && state.baselineRecorded) {
      root.appendChild(renderBaselinePanel(state));
    }

    var tabs = el("div", { class: "view-tabs" });
    Object.keys(viewLabels).forEach(function (v) {
      var on = viewAvailable[v];
      var active = state.activeView === v;
      tabs.appendChild(el("button", {
        class: cn("view-tab", active && "active", on ? "enabled" : "disabled"),
        attrs: {
          role: "tab",
          "aria-selected": String(active),
          "aria-label": "Open " + viewLabels[v] + " view",
          disabled: !on || null,
          title: on ? viewLabels[v] : "Patch the corresponding instrument first",
        },
        on: { click: function () { if (on) { ui.selectedFrame = null; dispatch({ type: "SET_VIEW", view: v }); } } },
      }, (on ? "●" : "○") + " " + viewLabels[v]));
    });
    root.appendChild(tabs);

    if (state.activeView === "snmp") root.appendChild(renderSnmpView(state));
    else if (state.activeView === "flow") root.appendChild(renderFlowView(state));
    else if (state.activeView === "packet") root.appendChild(renderPacketView(state));
    else if (state.activeView === "syslog") root.appendChild(renderSyslogView(state));
    else if (state.activeView === "api") root.appendChild(renderApiView(state));
    else {
      root.appendChild(el("div", { class: "deck-empty" },
        "Select a view above — each one is the live output of a patched instrument on the " +
        (tape === "baseline" ? "BASELINE WEEK" : "INCIDENT SHIFT") + " tape."));
    }
    return root;
  }

  function lockNote(objId) {
    return " · locked — press REVISE on " + objId + " to change";
  }

  function renderBaselinePanel(state) {
    var stack = el("div", { class: "baseline-stack" });
    var m7Locked = !!state.lockedAnswers["OBJ-M7"];
    var h2Locked = !!state.lockedAnswers["OBJ-H2"];
    var B = DATA.BASELINE_STATS;

    var stats = el("div", { class: "baseline-stats" },
      el("div", { class: "stamp" }, "BASELINE RECORDED · " + B.window));
    var grid = el("div", { class: "baseline-grid" });
    [
      ["Edge utilization", B.edgeUtilBusiness + " · " + B.edgeUtilNight],
      ["Path quality", B.latency + " · jitter " + B.jitter + " · loss " + B.loss],
      ["Backup job", B.backup],
      ["Patch window", B.patch],
      ["p95 egress / workstation", B.p95EgressWorkstation],
      ["Top talkers", B.topTalkers],
    ].forEach(function (kv) {
      grid.appendChild(el("div", { class: "metric-card" },
        el("div", { class: "k" }, kv[0]),
        el("div", { class: "v" }, kv[1])
      ));
    });
    stats.appendChild(grid);
    stack.appendChild(stats);

    // BASELINE READ QUESTIONS (OBJ-M7)
    var qa = el("div", { class: "qa-box" },
      el("div", { class: "qa-title" }, "BASELINE READ QUESTIONS (OBJ-M7)",
        m7Locked ? el("span", { class: "locknote" }, lockNote("OBJ-M7")) : null));
    var qaGrid = el("div", { class: "check-grid" });
    var util = UI.field("avg business-hours edge utilization", { "data-fkey": "bl-util" });
    util.input.value = state.baselineAnswers.util;
    util.input.disabled = m7Locked;
    util.input.addEventListener("input", function (e) { dispatch({ type: "SET_BASELINE_ANSWER", field: "util", value: e.target.value }); });
    qaGrid.appendChild(util.wrap);
    var backup = UI.field("backup window (e.g. 23:00–01:00)", { "data-fkey": "bl-backup" });
    backup.input.value = state.baselineAnswers.backup;
    backup.input.disabled = m7Locked;
    backup.input.addEventListener("input", function (e) { dispatch({ type: "SET_BASELINE_ANSWER", field: "backup", value: e.target.value }); });
    qaGrid.appendChild(backup.wrap);
    qaGrid.appendChild(el("div", null,
      el("label", { class: "f-label plain" }, "metric pair describing path quality"),
      UI.select({
        value: state.baselineAnswers.pair, placeholder: "pair", ariaLabel: "metric pair describing path quality",
        disabled: m7Locked,
        options: [
          { value: "latency-jitter", label: "Latency + jitter (+ loss)" },
          { value: "cpu-fan", label: "CPU + fan speed" },
          { value: "oid-community", label: "OID + community string" },
        ],
        onChange: function (v) { dispatch({ type: "SET_BASELINE_ANSWER", field: "pair", value: v }); },
      })
    ));
    qa.appendChild(qaGrid);
    stack.appendChild(qa);

    // JUDGMENT DRILL (OBJ-H2)
    var drill = el("div", { class: "drill-box" },
      el("div", { class: "drill-title" }, "JUDGMENT DRILL — normal or deviation? (OBJ-H2)",
        h2Locked ? el("span", { class: "locknote" }, lockNote("OBJ-H2")) : null));
    [
      { id: "b1", text: "Tue 14:00 — edge utilization hits 68% for 20 min (baseline peak: 71%)" },
      { id: "b2", text: "Sat 22:30 — SW1 CPU elevated; heavy workstation↔update-server traffic" },
      { id: "b3", text: "03:00 — a workstation pushes 960 MB/h egress (baseline p95: 410 MB/h)" },
      { id: "b4", text: "23:00 — FS1 → BK1 transfers 40 GB, completes 01:02" },
      { id: "b5", text: "SW2 posts an informational CPU notice at 12%" },
      { id: "b6", text: "03:04 — a fleet workstation contacts external peer 203.0.113.66 for the first time ever" },
    ].forEach(function (d) {
      drill.appendChild(el("div", { class: "drill-row" },
        el("span", { class: "situation" }, d.text),
        UI.select({
          value: state.baselineDiscrim[d.id] || "", placeholder: "judgment",
          ariaLabel: "Judgment for: " + d.text,
          disabled: h2Locked,
          options: [
            { value: "normal", label: "Normal — baseline / scheduled" },
            { value: "egress", label: "Deviation — abnormal egress volume" },
            { value: "peer", label: "Deviation — new external peer (C2)" },
            { value: "device", label: "Deviation — device misbehavior" },
          ],
          onChange: function (v) { dispatch({ type: "SET_DISCRIM", id: d.id, value: v }); },
        })
      ));
    });
    stack.appendChild(drill);
    return stack;
  }

  function renderSnmpView(state) {
    var wrap = el("div", { class: "view-stack" });
    wrap.appendChild(viewHeader("SNMP — device health & traps", "lime"));
    wrap.appendChild(renderSnmpHealthTable(state));

    var traps = DATA.SNMP_TRAPS[state.phase];
    var trapBlock = el("div", null,
      el("div", { class: "f-label", style: { marginBottom: "6px" } }, "TRAP FEED (UDP 162 — agent-initiated)"));
    var feed = el("div", {
      class: "trap-feed scroll-y",
      attrs: { "data-scrollkey": "trap-feed", "aria-live": "polite" },
    });
    traps.forEach(function (t) {
      feed.appendChild(el("div", { class: "trap-row" },
        el("span", { class: "ts" }, t.ts),
        el("span", { class: "src" }, t.source),
        el("span", { class: "txt" }, t.oid + " — " + t.text)
      ));
    });
    trapBlock.appendChild(feed);
    wrap.appendChild(trapBlock);

    var m2Locked = !!state.lockedAnswers["OBJ-M2"];
    var box = el("div", { class: "check-box" },
      el("div", { class: "cb-title" }, "SNMP MECHANICS CHECK (OBJ-M2)",
        m2Locked ? el("span", { class: "locknote" }, lockNote("OBJ-M2")) : null));
    var grid = el("div", { class: "check-grid" });
    grid.appendChild(el("div", null,
      el("label", { class: "f-label plain" }, "Manager receives traps on…"),
      UI.select({
        value: state.snmpQuiz.trapPort, placeholder: "port", ariaLabel: "Manager receives traps on",
        disabled: m2Locked,
        options: [
          { value: "161", label: "UDP 161 (agent listens)" },
          { value: "162", label: "UDP 162" },
          { value: "514", label: "UDP 514" },
        ],
        onChange: function (v) { dispatch({ type: "SET_SNMP_QUIZ", field: "trapPort", value: v }); },
      })
    ));
    grid.appendChild(el("div", null,
      el("label", { class: "f-label plain" }, "An OID is…"),
      UI.select({
        value: state.snmpQuiz.oid, placeholder: "definition", ariaLabel: "An OID is",
        disabled: m2Locked,
        options: [
          { value: "oid", label: "Address of one managed object in the MIB tree" },
          { value: "pw", label: "The agent's password" },
          { value: "proto", label: "A transport protocol" },
        ],
        onChange: function (v) { dispatch({ type: "SET_SNMP_QUIZ", field: "oid", value: v }); },
      })
    ));
    grid.appendChild(el("div", null,
      el("label", { class: "f-label plain" }, "A trap is…"),
      UI.select({
        value: state.snmpQuiz.trigger, placeholder: "definition", ariaLabel: "A trap is",
        disabled: m2Locked,
        options: [
          { value: "trap", label: "Agent-initiated, unsolicited event push" },
          { value: "poll", label: "Manager-initiated counter request" },
          { value: "ack", label: "A switch reboot confirmation" },
        ],
        onChange: function (v) { dispatch({ type: "SET_SNMP_QUIZ", field: "trigger", value: v }); },
      })
    ));
    box.appendChild(grid);
    wrap.appendChild(box);
    return wrap;
  }

  function renderFlowView(state) {
    var wrap = el("div", { class: "view-stack" });
    wrap.appendChild(viewHeader("FLOW — conversation metadata (no payloads)", "flow"));
    var rows = state.phase === "baseline" ? DATA.FLOWS_BASELINE : DATA.FLOWS_INCIDENT;
    var contained = state.containment.portDisabled;
    var hard = state.mode === "hard";
    var flowLocked = !!state.lockedAnswers[hard ? "OBJ-H3" : "OBJ-M9"];

    var scroll = el("div", { class: "table-scroll scroll-x", attrs: { "data-scrollkey": "flow-table" } });
    var table = el("table", { class: "data-table", style: { minWidth: "620px" } });
    table.appendChild(el("thead", null, el("tr", null,
      ["source", "destination", "dport", "sess", "bytes", "window"].map(function (h) { return el("th", null, h); }))));
    var tbody = el("tbody");
    rows.forEach(function (r) {
      // tag is used internally for the CEASED verification display only — it is
      // deliberately NOT rendered, so anomaly answers are not pre-revealed (QA-9).
      var stopped = contained && (r.tag === "beacon" || r.tag === "exfil");
      var tr = el("tr", { class: cn("row-muted", stopped && "ceased") },
        el("td", { class: "t-fg" }, r.src),
        el("td", { class: "t-fg" }, r.dst),
        el("td", { class: "t-fg" }, String(r.dport)),
        el("td", { class: "t-fg" }, String(r.sessions)),
        el("td", { class: "t-fg" }, r.bytes),
        el("td", { class: "win" }, stopped ? r.window + " — CEASED (port admin-down / C2 blocked)" : r.window)
      );
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    wrap.appendChild(scroll);

    wrap.appendChild(el("p", { class: "flow-note", attrs: { role: "note" } },
      rows.some(function (r) { return r.id === "fi3"; })
        ? DATA.CHANGE_CALENDAR_NOTE
        : "Baseline window: all listed jobs are explainable scheduled traffic."));

    var box = el("div", { class: "answer-box" },
      el("div", { class: "ab-title" },
        (hard ? "FLOW FORENSICS — 4 exact fields (OBJ-H3)" : "ANOMALY REPORT (OBJ-M9)"),
        flowLocked ? el("span", { class: "locknote" }, " · locked — press REVISE on the objective to change") : null));
    var grid = el("div", { class: cn("check-grid", hard ? "cols-4" : "cols-2") });
    function addField(key, label, value) {
      var f = UI.field(label, { "data-fkey": key });
      f.input.value = value;
      f.input.disabled = flowLocked;
      f.input.addEventListener("input", function (e) {
        dispatch({ type: "SET_FLOW_ANSWER", field: key.replace("flow-", ""), value: e.target.value });
      });
      grid.appendChild(f.wrap);
    }
    addField("flow-host", "compromised host IP", state.flowAnswers.host);
    addField("flow-c2", "external destination IP", state.flowAnswers.c2);
    if (hard) {
      addField("flow-volume", "exfil volume (e.g. 2.4 GB)", state.flowAnswers.volume);
      addField("flow-port", "exfil dport", state.flowAnswers.port);
    }
    box.appendChild(grid);
    wrap.appendChild(box);
    return wrap;
  }

  function renderPacketView(state) {
    var wrap = el("div", { class: "view-stack" });
    wrap.appendChild(viewHeader("PACKET SCOPE — frame-level capture (from SPAN)", "lime"));
    var rows = state.phase === "baseline" ? DATA.PACKETS_BASELINE : DATA.packetsIncident();
    var packetLocked = !!state.lockedAnswers[state.mode === "hard" ? "OBJ-H4" : "OBJ-M10"];

    if (state.phase === "incident") {
      wrap.appendChild(el("p", { class: "pkt-note" },
        "Capture filter equivalent: ", el("span", { class: "code" }, "host " + DATA.VICTIM.ip + " or net 203.0.113.0/24"),
        " — first 24 frames of interest shown."));
    }

    var scroll = el("div", { class: "table-scroll scroll-x pkt-scroll", attrs: { "data-scrollkey": "pkt-table" } });
    var table = el("table", { class: "data-table pkt-table", style: { minWidth: "640px" } });
    table.appendChild(el("thead", null, el("tr", null,
      ["#", "time", "src", "dst", "proto", "len", "info"].map(function (h) { return el("th", null, h); }))));
    var tbody = el("tbody");
    rows.forEach(function (r) {
      var tr = el("tr", {
        class: ui.selectedFrame === r.no ? "selected" : "",
        attrs: {
          tabindex: "0",
          "aria-selected": String(ui.selectedFrame === r.no),
        },
        on: {
          click: function () { ui.selectedFrame = r.no; rerenderFromState(state); },
          keydown: function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              ui.selectedFrame = r.no;
              rerenderFromState(state);
            }
          },
        },
      },
        el("td", { class: "muted-fg" }, String(r.no)),
        el("td", { class: "t-fg" }, r.time),
        el("td", { class: "t-fg" }, r.src),
        el("td", { class: "t-fg" }, r.dst),
        el("td", { class: "t-fg" }, r.proto),
        el("td", { class: "t-fg" }, String(r.len)),
        el("td", { class: r.len >= 1514 ? "info-hot" : "t-fg" }, r.info)
      );
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    wrap.appendChild(scroll);

    var detailRow = rows.find ? rows.find(function (r) { return r.no === ui.selectedFrame; }) : null;
    for (var i = 0; i < rows.length && !detailRow; i++) {
      if (rows[i].no === ui.selectedFrame) detailRow = rows[i];
    }
    if (detailRow) {
      wrap.appendChild(el("div", { class: "frame-detail" },
        el("div", { class: "fd-title" }, "FRAME " + detailRow.no + " DETAIL"),
        el("p", { class: "fd-body" }, detailRow.detail)
      ));
    } else {
      wrap.appendChild(el("p", { class: "select-hint" }, "Select a frame row (click or Enter) to inspect its teaching detail."));
    }

    var box = el("div", { class: "frame-detail", style: { background: "rgba(163,230,53,0.05)" } },
      el("div", { class: "fd-title" }, "BEACON ANALYSIS (OBJ-" + (state.mode === "hard" ? "H4" : "M10") + ")",
        packetLocked ? el("span", { class: "locknote" }, " · locked — press REVISE on the objective to change") : null));
    var grid = el("div", { class: "check-grid cols-2", style: { marginTop: "8px" } });
    var f = UI.field("beacon inter-arrival (seconds)", { "data-fkey": "pkt-interval" });
    f.input.value = state.packetAnswers.interval;
    f.input.disabled = packetLocked;
    f.input.addEventListener("input", function (e) { dispatch({ type: "SET_PACKET_ANSWER", field: "interval", value: e.target.value }); });
    grid.appendChild(f.wrap);
    grid.appendChild(el("div", null,
      el("label", { class: "f-label plain" }, "frame pattern observed"),
      UI.select({
        value: state.packetAnswers.pattern, placeholder: "pattern", ariaLabel: "frame pattern observed",
        disabled: packetLocked,
        options: [
          { value: "beacon", label: "Small TLS sessions every ~60 s + one-way uploads" },
          { value: "random", label: "Random downloads from many peers" },
          { value: "dns", label: "DNS tunneling with long TXT queries" },
          { value: "arp", label: "ARP storm flooding the segment" },
        ],
        onChange: function (v) { dispatch({ type: "SET_PACKET_ANSWER", field: "pattern", value: v }); },
      })
    ));
    box.appendChild(grid);
    wrap.appendChild(box);
    return wrap;
  }

  function renderSyslogView(state) {
    var wrap = el("div", { class: "view-stack" });
    wrap.appendChild(viewHeader("SYSLOG — aggregated events (SIEM feed)", "amber"));
    var hard = state.mode === "hard";
    var all = state.phase === "baseline" ? DATA.LOGS_BASELINE : DATA.LOGS_INCIDENT;
    var corrLocked = !!state.lockedAnswers[hard ? "OBJ-H6" : "OBJ-M11"];

    var rows = all;
    if (ui.sevFilter !== "all") rows = rows.filter(function (l) { return l.sev <= Number(ui.sevFilter); });
    if (ui.logSearch.trim()) {
      var needle = ui.logSearch.trim().toLowerCase();
      rows = rows.filter(function (l) { return (l.msg + l.host + l.facility).toLowerCase().indexOf(needle) !== -1; });
    }

    var toolbar = el("div", { class: "log-toolbar" });
    var searchWrap = el("div", { class: "search-wrap" },
      el("span", { class: "search-ico" }, icon("search", "ico-14")),
      el("input", {
        class: "search-input",
        attrs: {
          type: "text", placeholder: "search messages, hosts, facilities…",
          "aria-label": "Search log messages", "data-fkey": "log-search",
        },
        on: { input: function (e) { ui.logSearch = e.target.value; rerenderFromState(state); } },
      })
    );
    searchWrap.querySelector("input").value = ui.logSearch;
    toolbar.appendChild(searchWrap);
    toolbar.appendChild(el("div", { class: "sev-filter" }, UI.select({
      value: ui.sevFilter, ariaLabel: "Filter by severity",
      options: [
        { value: "all", label: "all severities" },
        { value: "2", label: "≤ 2 critical+" },
        { value: "4", label: "≤ 4 warning+" },
        { value: "6", label: "≤ 6 informational+" },
      ],
      onChange: function (v) { ui.sevFilter = v; rerenderFromState(state); },
    })));
    toolbar.appendChild(el("span", { class: "lines-count" }, rows.length + "/" + all.length + " lines"));
    wrap.appendChild(toolbar);

    var stream = el("div", {
      class: "log-stream scroll-y",
      attrs: { "data-scrollkey": "log-stream", "aria-live": "polite" },
    });
    rows.forEach(function (l) {
      var row = el("div", { class: "log-row" },
        el("span", { class: "sev sev-" + l.sev, attrs: { title: "severity " + l.sev } }, "sev" + l.sev),
        el("span", { class: "ts" }, l.ts),
        el("span", { class: "host" }, l.host),
        el("span", { class: "msg" }, l.msg),
        l.tag === "suspicious" ? el("span", { class: "flag" }, "!") : null
      );
      if (hard) {
        var inChain = state.logOrder.indexOf(l.id) !== -1;
        var chainIndex = state.logOrder.indexOf(l.id) + 1;
        row.appendChild(el("button", {
          class: cn("chain-btn", inChain && "in-chain"),
          attrs: {
            disabled: (inChain || corrLocked) || null,
            "aria-label": "Add event " + l.ts + " " + l.host + " to correlation chain at position " + (inChain ? chainIndex : "next"),
          },
          on: { click: function () { dispatch({ type: "ADD_LOG_CHAIN", id: l.id }); } },
        }, inChain ? "#" + chainIndex : "chain+"));
      } else {
        var cb = el("input", {
          attrs: {
            type: "checkbox",
            "aria-label": "Select suspicious event " + l.ts + " " + l.host,
          },
          on: { change: function () { dispatch({ type: "TOGGLE_LOG_SELECT", id: l.id }); } },
        });
        cb.checked = state.selectedLogIds.indexOf(l.id) !== -1;
        cb.disabled = corrLocked;
        row.appendChild(cb);
      }
      stream.appendChild(row);
    });
    if (rows.length === 0) {
      stream.appendChild(el("div", { class: "log-empty" }, "No lines match the filter — widen severity or clear the search."));
    }
    wrap.appendChild(stream);

    if (hard) {
      var chainBox = el("div", { class: "chain-box" },
        el("span", { class: "chain-title" }, "CORRELATION CHAIN (OBJ-H6):",
          corrLocked ? el("span", { class: "locknote" }, " locked — press REVISE on OBJ-H6 to change") : null));
      if (state.logOrder.length === 0) {
        chainBox.appendChild(el("span", { class: "chain-empty" }, "empty — press chain+ on events in attack order"));
      } else {
        var list = el("ol", { class: "chain-list" });
        state.logOrder.forEach(function (id, i) {
          var line = null;
          for (var j = 0; j < all.length; j++) if (all[j].id === id) line = all[j];
          list.appendChild(el("li", { class: "chain-chip" }, (i + 1) + ". " + (line ? line.ts + " " + line.host : id)));
        });
        chainBox.appendChild(list);
      }
      chainBox.appendChild(el("button", {
        class: "btn btn-outline minh-32",
        attrs: { disabled: corrLocked || null },
        on: { click: function () { dispatch({ type: "CLEAR_LOG_CHAIN" }); } },
      }, "Clear chain"));
      wrap.appendChild(chainBox);
    }
    return wrap;
  }

  function renderApiView(state) {
    var wrap = el("div", { class: "view-stack" });
    wrap.appendChild(viewHeader("API GATEWAY — REST/JSON (programmatic monitoring)", "api"));

    var grid = el("div", { class: "api-grid" });
    var endpoints = el("div", { class: "api-endpoints" });
    DATA.API_ENDPOINTS.forEach(function (e) {
      endpoints.appendChild(el("div", { class: "endpoint-row" },
        el("span", { class: "method-chip" }, e.method),
        el("code", null, e.path),
        el("span", { class: "ep-desc" }, e.desc),
        el("button", {
          class: "btn btn-outline minh-36",
          on: { click: function () { sendApi(e); } },
        }, "Send")
      ));
    });
    endpoints.appendChild(el("p", { class: "api-base-note" },
      "base: https://mon1.meridian-freight.test · token auth · " +
      (state.apiReadOnly ? "read-only scope" : "default install token (findings!)")));
    grid.appendChild(endpoints);

    var pane = el("div", { class: "json-pane" },
      el("div", { class: "jp-title" }, ui.apiLastPath || "response body (JSON) — send an endpoint"));
    var pre = el("pre", { attrs: { "aria-live": "polite" } });
    pre.textContent = ui.apiResp !== null ? ui.apiResp :
      "// GET responses appear here.\n// Try the health, port and monitoring self-audit endpoints.\n// The port endpoint reflects live containment state.";
    pane.appendChild(pre);
    grid.appendChild(pane);
    wrap.appendChild(grid);

    var m8Locked = !!state.lockedAnswers["OBJ-M8"];
    var box = el("div", { class: "api-read-box" },
      el("div", { class: "ab-title" }, "READ THE RESPONSE (OBJ-M8)",
        m8Locked ? el("span", { class: "locknote" }, lockNote("OBJ-M8")) : null));
    var rgrid = el("div", { class: "check-grid cols-2" });
    function addApiField(key, label) {
      var f = UI.field(label, { "data-fkey": "api-" + key });
      f.input.value = state.apiAnswers[key];
      f.input.disabled = m8Locked;
      f.input.addEventListener("input", function (e) {
        dispatch({ type: "SET_API_ANSWER", field: key, value: e.target.value });
      });
      rgrid.appendChild(f.wrap);
    }
    addApiField("cpu", "FW1 cpuPercent (from /health)");
    addApiField("wan", "WAN ifOperStatus");
    box.appendChild(rgrid);
    box.appendChild(el("p", { class: "snapshot-note" },
      "MON1 returns its most recent stored health snapshot (03:40, incident shift) — the same numbers on either tape."));
    wrap.appendChild(box);

    wrap.appendChild(renderHardeningAudit(state));
    return wrap;

    function sendApi(e) {
      var body = e.response({ portDisabled: state.containment.portDisabled, cpuFw1: 91 });
      ui.apiResp = JSON.stringify(body, null, 2);
      ui.apiLastPath = e.method + " " + e.path;
      dispatch({ type: "LOG_API_QUERY", path: e.path });
    }
  }

  function renderHardeningAudit(state) {
    var h = state.hardening;
    var onAudit = state.apiQueries.some(function (q) { return q.indexOf("monitoring") !== -1; });
    var box = el("div", { class: "hardening" },
      el("div", { class: "h-title" }, "HARDENING AUDIT — monitoring plane (OBJ-H8)"));
    if (!onAudit) {
      box.appendChild(el("p", { class: "h-note" }, "Send the ", el("span", { class: "code" }, "/api/v1/monitoring/config"),
        " self-audit query above to reveal the findings in JSON first."));
    }
    var grid = el("div", { class: "hardening-grid" });
    var items = [
      { key: "printerSnmp", title: "PRN-HQ1: SNMP v2c community 'public'", fix: "Fixed in rack module 1 (Legacy device panel)", done: h.printerSnmp, action: null },
      {
        key: "branchSyslog", title: "Branch R2: syslog over UDP 514 cleartext", fix: "Switch transport to TLS 6514", done: h.branchSyslog,
        action: function () {
          dispatch({ type: "SET_HARDENING", key: "branchSyslog", value: true });
          dispatch({ type: "SET_SYSLOG_TRANSPORT", t: "tls-6514" });
        },
      },
      { key: "apiToken", title: "MON1 API: default install token, read-write scope", fix: "Rotate token + enforce read-only", done: h.apiToken, action: function () { dispatch({ type: "SET_HARDENING", key: "apiToken", value: true }); } },
      { key: "mon1Snmp", title: "MON1 self-audit: own SNMP agent v2c 'public'", fix: "Enforce v3 authPriv on MON1", done: h.mon1Snmp, action: function () { dispatch({ type: "SET_HARDENING", key: "mon1Snmp", value: true }); } },
    ];
    items.forEach(function (it) {
      var row = el("div", { class: cn("finding", it.done && "fixed") },
        el("div", { class: "f-title" }, it.title),
        el("div", { class: "f-row" },
          el("span", { class: "f-fix" }, it.fix),
          it.done
            ? el("span", { class: "f-done" }, "✓ fixed")
            : it.action
              ? el("button", { class: "btn btn-outline minh-32", on: { click: it.action } }, "Fix")
              : el("span", { class: "f-rack" }, "→ rack")
        ));
      grid.appendChild(row);
    });
    box.appendChild(grid);
    return box;
  }

  // ------------------------------------------------------------------
  // INCIDENT PANELS (IncidentPanels.tsx)
  // ------------------------------------------------------------------
  function renderIncidentPanels(state) {
    if (state.phase !== "incident") {
      return el("div", { class: "sp-rack panel-pad" },
        el("h2", { class: "panel-title", style: { marginBottom: "8px" } }, "INCIDENT BAY"),
        el("p", { class: "rack-sub", style: { marginBottom: 0 } },
          "The alert queue, detection tuning and response sequencer go live when the ",
          el("span", { class: "mono t-coral" }, "INCIDENT SHIFT"), " tape is loaded."));
    }
    var stack = el("div", { class: "incident-stack" });
    stack.appendChild(renderAlertQueue(state));
    stack.appendChild(renderDetectionTuning(state));
    stack.appendChild(renderResponseSequencer(state));
    return stack;
  }

  function renderAlertQueue(state) {
    var hard = state.mode === "hard";
    var allClassified = DATA.ALERTS.every(function (a) { return !!state.alertsClassified[a.id]; });
    var submitted = state.alertsSubmitted;
    var root = el("div", { class: "sp-rack panel-pad" });
    root.appendChild(el("div", { class: "alert-head" },
      icon("bell-ring", "ico-16 t-amber"),
      el("h2", { class: "panel-title" }, "ALERT QUEUE — classify true / false positives"),
      el("span", { class: "obj-tag" }, "OBJ-" + (hard ? "H2/H5 context" : "M11"))));
    root.appendChild(el("p", { class: "alert-note", attrs: { role: "note" } }, DATA.CHANGE_CALENDAR_NOTE));
    root.appendChild(el("p", { class: "alert-note" },
      "Pick a verdict per alert, then press ", el("span", { class: "mono t-amber" }, "SUBMIT VERDICTS"),
      " — verdicts and their explanations lock on submit. \"REVISE\" clears them for a fresh pass (a new attempt)."));

    var list = el("div", { class: "alert-list" });
    DATA.ALERTS.forEach(function (a) {
      var verdict = state.alertsClassified[a.id];
      var card = el("div", { class: cn("alert-card", submitted ? (verdict === a.truth ? "pass" : "fail") : "") });
      var main = el("div", { class: "ac-main" },
        el("span", { class: cn("ac-ico", verdict === "tp" && "tp") }, icon("shield-alert", "ico-16")),
        el("div", { class: "ac-body" },
          el("div", { class: "ac-title" }, a.title),
          el("div", { class: "ac-detail" }, a.detail),
          submitted && verdict && verdict !== a.truth ? el("p", { class: "ac-why-fail" }, a.why) : null,
          submitted && verdict && verdict === a.truth ? el("p", { class: "ac-why-pass" }, a.why) : null
        ));
      var verdicts = el("div", { class: "verdicts" });
      verdicts.appendChild(el("button", {
        class: cn("verdict-btn", verdict === "tp" && "tp-on"),
        attrs: { "aria-pressed": String(verdict === "tp"), disabled: submitted || null },
        on: { click: function () { dispatch({ type: "CLASSIFY_ALERT", id: a.id, verdict: "tp" }); } },
      }, "TRUE POS"));
      verdicts.appendChild(el("button", {
        class: cn("verdict-btn", verdict === "fp" && "fp-on"),
        attrs: { "aria-pressed": String(verdict === "fp"), disabled: submitted || null },
        on: { click: function () { dispatch({ type: "CLASSIFY_ALERT", id: a.id, verdict: "fp" }); } },
      }, "FALSE POS"));
      main.appendChild(verdicts);
      card.appendChild(main);
      list.appendChild(card);
    });
    root.appendChild(list);

    var actions = el("div", { class: "alert-actions" });
    if (!submitted) {
      actions.appendChild(el("button", {
        class: allClassified ? "btn btn-amber minh-40 fw-600" : "btn btn-ghost-disabled minh-40",
        attrs: { disabled: !allClassified || null },
        on: { click: function () { dispatch({ type: "SUBMIT_VERDICTS" }); } },
      }, allClassified ? "SUBMIT VERDICTS (locks + reveals explanations)" : "Classify all " + DATA.ALERTS.length + " alerts to submit"));
      actions.appendChild(el("span", { class: "hint" }, "verdicts are editable until submitted"));
    } else {
      actions.appendChild(el("span", { class: "badge-solid-amber" }, "VERDICTS LOCKED"));
      actions.appendChild(el("button", {
        class: "btn btn-outline minh-36",
        on: { click: function () { dispatch({ type: "REVISE_ALERTS" }); } },
      }, "REVISE VERDICTS (fresh attempt)"));
    }
    root.appendChild(actions);
    return root;
  }

  function renderDetectionTuning(state) {
    var tuningLocked = !!state.lockedAnswers["OBJ-H5"];
    var root = el("div", { class: "sp-rack panel-pad" });
    root.appendChild(el("div", { class: "alert-head" },
      icon("sliders-horizontal", "ico-16 t-flow"),
      el("h2", { class: "panel-title" }, "DETECTION TUNING — egress-per-workstation rule")));
    root.appendChild(el("p", { class: "tuning-desc" },
      "Current rule ", el("span", { class: "code-coral" }, "\"any flow > 1 GB/h\""),
      " pages on the sanctioned vendor sync. Baseline p95 for workstations: ",
      el("span", { class: "code-lime" }, "410 MB/h"),
      ". The exfil you found ran at ~", el("span", { class: "code-coral" }, "960 MB/h"),
      ". Set a threshold + scope that catches the attack without paging on normal life. (OBJ-H5)",
      tuningLocked ? el("span", { class: "locknote" }, " · locked — press REVISE on OBJ-H5 to change") : null));
    var grid = el("div", { class: "grid-2" });
    grid.appendChild(el("div", null,
      el("label", { class: "f-label" }, "THRESHOLD"),
      UI.select({
        value: state.detectionTuning.threshold, placeholder: "threshold", ariaLabel: "Threshold",
        disabled: tuningLocked,
        options: [
          { value: "100", label: "100 MB/h" },
          { value: "450", label: "450 MB/h" },
          { value: "800", label: "800 MB/h" },
          { value: "2500", label: "2.5 GB/h" },
        ],
        onChange: function (v) { dispatch({ type: "SET_TUNING", field: "threshold", value: v }); },
      })
    ));
    grid.appendChild(el("div", null,
      el("label", { class: "f-label" }, "SCOPE"),
      UI.select({
        value: state.detectionTuning.scope, placeholder: "scope", ariaLabel: "Scope",
        disabled: tuningLocked,
        options: [
          { value: "all", label: "All subnets" },
          { value: "workstations", label: "Workstation subnets only" },
          { value: "servers", label: "Server VLAN only" },
        ],
        onChange: function (v) { dispatch({ type: "SET_TUNING", field: "scope", value: v }); },
      })
    ));
    root.appendChild(grid);
    return root;
  }

  function renderResponseSequencer(state) {
    var applied = state.responseActions;
    var doneSet = {};
    applied.forEach(function (id) { doneSet[id] = true; });
    function labelFor(id) {
      for (var i = 0; i < DATA.RESPONSE_ACTIONS.length; i++) {
        if (DATA.RESPONSE_ACTIONS[i].id === id) return DATA.RESPONSE_ACTIONS[i].label;
      }
      return id;
    }

    var root = el("div", { class: "sp-rack panel-pad", attrs: { id: "response-panel" } });
    root.appendChild(el("div", { class: "alert-head" },
      icon("shield-alert", "ico-16 t-coral"),
      el("h2", { class: "panel-title" }, "RESPONSE SEQUENCER — order matters"),
      el("span", { class: "badge", style: { borderColor: "rgba(251,122,89,0.5)", color: "var(--coral)", fontFamily: "var(--font-data)" } },
        "OBJ-" + (state.mode === "hard" ? "H7" : "M12"))));
    root.appendChild(el("p", { class: "tuning-desc" },
      "Click actions in the order you would execute them (tap again via Undo if wrong). After applying, open the FLOW view to verify the traffic actually stopped — response without verification is incomplete."));

    var list = el("div", { class: "seq-list" });
    DATA.RESPONSE_ACTIONS.forEach(function (a) {
      var idx = applied.indexOf(a.id);
      var used = !!doneSet[a.id];
      list.appendChild(el("button", {
        class: cn("seq-btn", used && "used"),
        attrs: { disabled: used || null, "aria-label": "Apply action: " + a.label },
        on: { click: function () { if (!used) dispatch({ type: "APPLY_RESPONSE", id: a.id }); } },
      },
        el("span", { class: "seq-num" }, used ? "#" + (idx + 1) : "—"),
        el("span", { style: { flex: "1" } },
          el("span", { class: "seq-label" }, a.label),
          el("span", { class: "seq-note" }, a.note))
      ));
    });
    root.appendChild(list);

    if (applied.length > 0) {
      var summary = el("div", { class: "seq-summary" }, el("span", { class: "lead" }, "sequence:"));
      applied.forEach(function (id, i) {
        summary.appendChild(el("span", { class: "chain-chip" },
          (i + 1) + ". " + labelFor(id).split(" ").slice(0, 3).join(" ") + "…"));
      });
      summary.appendChild(el("button", {
        class: "btn btn-outline minh-32",
        on: { click: function () { dispatch({ type: "UNDO_RESPONSE" }); } },
      }, "Undo last"));
      root.appendChild(summary);
    }

    if (state.verifiedStop) {
      root.appendChild(el("p", { class: "verified-note", attrs: { "aria-live": "polite" } },
        "✓ VERIFIED: flow table shows beacon & exfil sessions ceased after containment — the loop is closed."));
    }
    return root;
  }

  // ------------------------------------------------------------------
  // OBJECTIVE TRACKER (ObjectivesBoard.tsx)
  // ------------------------------------------------------------------
  function renderObjectivesBoard(state, objectives) {
    var progress = computeProgress(state, objectives);
    var root = el("div", { class: "sp-rack panel-pad", attrs: { "aria-label": "Objective tracker" } });
    var head = el("div", { class: "tracker-head" },
      icon("target", "ico-16 t-lime"),
      el("h2", { class: "panel-title" }, "OBJECTIVE TRACKER"),
      el("span", { class: "stats" }, progress.done + "/" + progress.total + " · score " + progress.score + " · ★" + progress.stars + "/5"));
    if (ui.stageFilter) {
      head.appendChild(el("button", {
        class: "filter-chip",
        attrs: { "aria-label": "Clear " + (STAGE_LABEL[ui.stageFilter] || ui.stageFilter) + " filter and show all objectives" },
        on: { click: function () { ui.stageFilter = null; rerenderFromState(state); } },
      }, "filtered: " + (STAGE_LABEL[ui.stageFilter] || ui.stageFilter) + " ✕"));
    }
    root.appendChild(head);

    var nextId = null;
    for (var i = 0; i < objectives.length; i++) {
      var p = state.objectives[objectives[i].id];
      if (!p || !p.done) { nextId = objectives[i].id; break; }
    }
    var visible = ui.stageFilter ? objectives.filter(function (o) { return o.stage === ui.stageFilter; }) : objectives;

    var list = el("div", { class: "obj-list" });
    visible.forEach(function (obj) {
      list.appendChild(renderObjectiveCard(state, obj, obj.id === nextId && state.mode === "medium"));
    });
    root.appendChild(list);
    return root;
  }

  function renderObjectiveCard(state, obj, isNext) {
    var prog = state.objectives[obj.id];
    var open = !!ui.objectiveOpen[obj.id];
    var hard = state.mode === "hard";
    var hintsAllowed = hard ? 1 : 3;
    var hintsShown = prog ? prog.hintsUsed : 0;

    var card = el("div", { class: cn("obj-card", prog && prog.done && "done") });
    card.appendChild(el("button", {
      class: "obj-row",
      attrs: { "aria-expanded": String(open) },
      on: { click: function () { ui.objectiveOpen[obj.id] = !open; rerenderFromState(state); } },
    },
      el("span", { class: "check" },
        prog && prog.done
          ? icon("circle-check", "ico-16")
          : el("span", { class: "empty-circle", attrs: { "aria-label": "not completed" } })),
      el("span", { class: "o-body" },
        el("span", { class: "o-badges" },
          el("span", { class: "o-id" }, obj.id),
          el("span", { class: "badge" }, obj.pillar),
          el("span", { class: "badge" }, STAGE_LABEL[obj.stage]),
          isNext && !(prog && prog.done) ? el("span", { class: "next-badge" }, "NEXT") : null,
          prog && prog.attempts > 0 && !prog.done
            ? el("span", { class: "fail-count" }, "✗ " + prog.attempts + " failed check" + (prog.attempts > 1 ? "s" : ""))
            : null),
        el("span", { class: "o-title" }, obj.title)),
      el("span", { class: "chev" }, icon(open ? "chevron-up" : "chevron-down", "ico-16"))
    ));

    if (open) {
      var body = el("div", { class: "obj-body" });
      body.appendChild(el("p", { class: "obj-detail" }, obj.detail));
      body.appendChild(el("p", { class: "obj-anchor" }, "anchor: " + obj.anchor));

      var feedback = ui.objectiveFeedback[obj.id];
      if (feedback) {
        body.appendChild(el("div", {
          class: cn("feedback", feedback.pass ? "pass" : "fail"),
          attrs: { role: "status", "aria-live": "polite" },
        },
          el("span", { class: "f-flag" }, "CHECK RESULT: " + (feedback.pass ? "PASS ✓" : "RETRY ✗")),
          feedback.feedback,
          state.lockedAnswers[obj.id] && !feedback.pass
            ? el("span", { class: "lock-note" }, "answer inputs for this objective are locked — press REVISE ANSWERS to start a new attempt.")
            : null));
      }

      if (hintsShown > 0) {
        var hbox = el("div", { class: "hints-box" });
        obj.hints.slice(0, hintsShown).forEach(function (h, i) {
          hbox.appendChild(el("p", null,
            el("span", { class: "h-flag" }, "HINT " + (i + 1) + "/" + obj.hints.length + ": "),
            h));
        });
        hbox.appendChild(el("p", { class: "h-cost" }, "hint usage reduces the star rating (never blocks progress)"));
        body.appendChild(hbox);
      }

      var actions = el("div", { class: "obj-actions" });
      actions.appendChild(el("button", {
        class: cn("btn minh-40 fw-600", prog && prog.done ? "recheck" : "btn-lime"),
        on: {
          click: function () {
            var result = obj.validate(state);
            dispatch({ type: "CHECK_OBJECTIVE", id: obj.id, pass: result.pass });
            ui.objectiveFeedback[obj.id] = result;
          },
        },
      }, prog && prog.done ? "RE-CHECK" : "CHECK RESULTS"));

      if (state.lockedAnswers[obj.id]) {
        actions.appendChild(el("button", {
          class: "btn revise minh-40",
          attrs: { "aria-label": "Revise answers for " + obj.id + " — unlocks the linked answer inputs for a new attempt" },
          on: {
            click: function () {
              dispatch({ type: "REVISE_ANSWERS", id: obj.id });
              ui.objectiveFeedback[obj.id] = null;
              rerenderFromState(state);
            },
          },
        }, icon("rotate-ccw", "ico-14"), "REVISE ANSWERS"));
      }

      if (!hard) {
        actions.appendChild(el("button", {
          class: "btn locate minh-40",
          on: {
            click: function () {
              dispatch({ type: "USE_HINT", id: obj.id });
              var target = LOCATE[obj.id];
              if (target) {
                dispatch({ type: "SET_LOCATE", target: target });
                rerenderFromState(store.getState());
                var sectionEl = document.getElementById(target);
                if (sectionEl) sectionEl.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(function () { dispatch({ type: "SET_LOCATE", target: null }); }, 3200);
              }
            },
          },
        }, icon("map-pin", "ico-14 t-lime"), " LOCATE (where to look)"));
      }

      if (hintsShown < Math.min(hintsAllowed, obj.hints.length)) {
        actions.appendChild(el("button", {
          class: "btn hint minh-40",
          on: {
            click: function () {
              dispatch({ type: "USE_HINT", id: obj.id });
              rerenderFromState(store.getState());
            },
          },
        }, icon("lightbulb", "ico-14"), "HINT " + (hintsShown + 1) + (hard ? " (costs score)" : "")));
      }
      body.appendChild(actions);
      card.appendChild(body);
    }
    return card;
  }

  // ------------------------------------------------------------------
  // FIELD MANUAL (FieldManual.tsx)
  // ------------------------------------------------------------------
  function renderFieldManual(state) {
    var hard = state.mode === "hard";
    var root = el("div", { class: "sp-rack panel-pad" });
    var head = el("div", { class: "fm-head" },
      icon("book-open", "ico-16 t-lime"),
      el("h2", { class: "panel-title" }, "FIELD MANUAL — the seven technologies"),
      el("button", {
        class: "glossary-btn",
        on: { click: function () { openGlossaryDialog(); } },
      }, "GLOSSARY (" + CONTENT.GLOSSARY.length + " terms)"));
    root.appendChild(head);

    if (!hard) {
      var m1Locked = !!state.lockedAnswers["OBJ-M1"];
      var match = el("div", { class: "match-box" },
        el("div", { class: "mb-title" }, "TOOL → SIGNAL MATCH (OBJ-M1)",
          m1Locked ? el("span", { class: "locknote" }, lockNote("OBJ-M1")) : null));
      CONTENT.TOOL_MATCH_TOOLS.forEach(function (t) {
        match.appendChild(el("div", { class: "fm-row" },
          el("span", { class: "tool-name" }, t.label),
          UI.select({
            value: state.toolMatch[t.id] || "", placeholder: "what does it deliver?",
            ariaLabel: "What does " + t.label + " deliver?",
            disabled: m1Locked,
            options: CONTENT.TOOL_MATCH_ROLE_ORDER.map(function (rid) {
              var r = CONTENT.TOOL_MATCH_ROLES[rid];
              return { value: r.id, label: r.label };
            }),
            onChange: function (v) { dispatch({ type: "SET_TOOL_MATCH", tool: t.id, role: v }); },
          })
        ));
      });
      root.appendChild(match);
    }

    if (hard) {
      var h9Locked = !!state.lockedAnswers["OBJ-H9"];
      var sbox = el("div", { class: "solutions-box" },
        el("div", { class: "mb-title" }, "MONITORING SOLUTIONS CLASSIFIER (OBJ-H9 — official 3.2 Solutions row)",
          h9Locked ? el("span", { class: "locknote" }, lockNote("OBJ-H9")) : null));
      CONTENT.SOLUTIONS_SCENARIOS.forEach(function (s) {
        var opts = Object.keys(CONTENT.SOLUTIONS_OPTIONS).map(function (k) {
          return { value: k, label: CONTENT.SOLUTIONS_OPTIONS[k] };
        });
        sbox.appendChild(el("div", { class: "sol-row" },
          el("span", { class: "scenario" }, s.text),
          UI.select({
            value: state.solutionsMatch[s.id] || "", placeholder: "solution type",
            ariaLabel: "Solution type for: " + s.text,
            disabled: h9Locked,
            options: opts,
            onChange: function (v) { dispatch({ type: "SET_SOLUTION", id: s.id, value: v }); },
          })
        ));
      });
      root.appendChild(sbox);
    }

    var knowledge = el("div", { class: "knowledge" });
    CONTENT.KNOWLEDGE.forEach(function (k) {
      var open = ui.openCard === k.id;
      var card = el("div", { class: cn("k-card", open && "open") });
      card.appendChild(el("button", {
        class: "k-btn",
        attrs: { "aria-expanded": String(open) },
        on: { click: function () { ui.openCard = open ? null : k.id; rerenderFromState(state); } },
      },
        el("span", { class: "k-ico" }, icon("layers", "ico-14")),
        el("span", { class: "k-title" }, k.title),
        el("span", { class: "chev" }, open ? "▾" : "▸")));
      if (open) {
        var body = el("div", { class: "k-body" });
        var what = el("div", { class: "what" });
        k.what.forEach(function (p) { what.appendChild(el("p", null, p)); });
        body.appendChild(what);
        var vscroll = el("div", { class: "well scroll-x", attrs: { "data-scrollkey": "variants-" + k.id } });
        var vtable = el("table", { class: "variants-table" });
        var vbody = el("tbody");
        k.variants.forEach(function (pair) {
          vbody.appendChild(el("tr", null, el("td", { class: "k" }, pair[0]), el("td", { class: "v" }, pair[1])));
        });
        vtable.appendChild(vbody);
        vscroll.appendChild(vtable);
        body.appendChild(vscroll);
        var watch = el("div", null, el("div", { class: "watch-title" }, "WATCH FOR (detection hooks)"));
        var wlist = el("ul", { class: "watch-list" });
        k.watch.forEach(function (w) { wlist.appendChild(el("li", null, el("span", { class: "arrow" }, "▸"), w)); });
        watch.appendChild(wlist);
        body.appendChild(watch);
        body.appendChild(el("p", { class: "k-examples italic" }, k.examples));
        card.appendChild(body);
      }
      knowledge.appendChild(card);
    });
    root.appendChild(knowledge);
    root.appendChild(el("p", { class: "knowledge-footnote", attrs: { role: "note" } }, CONTENT.KNOWLEDGE_FOOTNOTE));
    root.appendChild(el("span", { class: "sr-only" }, "Field manual knowledge cards"));
    return root;
  }

  function openGlossaryDialog() {
    var query = "";
    UI.openModal({
      title: "Glossary — know these cold for N10-009",
      description: "One-line definitions. Search by term or definition.",
      glossary: true,
      mount: function (body) {
        var input = el("input", {
          class: "glossary-input",
          attrs: { type: "text", placeholder: "search glossary…", "aria-label": "Search glossary" },
        });
        body.appendChild(input);
        var listWrap = el("div", { class: "glossary-list" });
        body.appendChild(listWrap);

        function draw() {
          var n = query.trim().toLowerCase();
          var items = n
            ? CONTENT.GLOSSARY.filter(function (t) {
                return t.term.toLowerCase().indexOf(n) !== -1 || t.def.toLowerCase().indexOf(n) !== -1;
              })
            : CONTENT.GLOSSARY;
          listWrap.textContent = "";
          items.forEach(function (t) {
            listWrap.appendChild(el("div", { class: "g-item" },
              el("dt", null, t.term),
              el("dd", null, t.def)));
          });
          if (items.length === 0) listWrap.appendChild(el("p", { class: "glossary-empty" }, "No terms match."));
        }
        input.addEventListener("input", function (e) { query = e.target.value; draw(); });
        draw();
        input.focus();
      },
    });
  }

  // ------------------------------------------------------------------
  // QUIZ BAY (delegated to quiz.js)
  // ------------------------------------------------------------------
  function renderQuizBay(state) {
    return QUIZ.render(state, dispatch);
  }

  // ------------------------------------------------------------------
  // DEBRIEF BAY (DebriefBay.tsx)
  // ------------------------------------------------------------------
  function renderDebriefBay(state, progress) {
    var allDone = progress.done === progress.total && progress.total > 0;
    var quizDone = state.quizSubmitted;
    var eligible = allDone && quizDone;

    var section = el("section", {
      class: "sp-rack panel-pad",
      attrs: { id: "debrief-bay", "aria-labelledby": "debrief-heading" },
    });
    section.appendChild(el("div", { class: "tracker-head" },
      icon("flag", "ico-16 t-coral"),
      el("h2", { class: "panel-title", attrs: { id: "debrief-heading" } }, "DEBRIEF — field notes")));

    var grid = el("div", { class: "debrief-grid" });

    // detection opportunities
    var det = el("div", null,
      el("h3", { class: "debrief-h3 t-flow" }, "DETECTION OPPORTUNITIES (data source → what to look for)"));
    var detScroll = el("div", { class: "det-table-scroll scroll-x", attrs: { "data-scrollkey": "det-table" } });
    var detTable = el("table", { class: "data-table", style: { minWidth: "480px" } });
    detTable.appendChild(el("thead", null, el("tr", null,
      ["source", "signal", "example logic"].map(function (h) { return el("th", null, h); }))));
    var detBody = el("tbody");
    CONTENT.DETECTION_OPS.forEach(function (d) {
      detBody.appendChild(el("tr", null,
        el("td", { class: "t-lime" }, d.source),
        el("td", { class: "t-fg" }, d.look),
        el("td", { class: "muted-fg" }, d.logic)));
    });
    detTable.appendChild(detBody);
    detScroll.appendChild(detTable);
    det.appendChild(detScroll);
    grid.appendChild(det);

    // mitigations
    var mit = el("div", null, el("h3", { class: "debrief-h3 t-coral" }, "MITIGATION RECOMMENDATIONS"));
    var mlist = el("div", { class: "mit-list" });
    CONTENT.MITIGATION_RECS.forEach(function (m) {
      mlist.appendChild(el("div", { class: "mit-card" },
        el("div", { class: "m-title" }, m.title),
        el("div", { class: "m-detail" }, m.detail)));
    });
    mit.appendChild(mlist);
    grid.appendChild(mit);

    // blue takeaways
    var blue = el("div", null, el("h3", { class: "debrief-h3 t-lime" }, icon("eye", "ico-14"), "BLUE-TEAM TAKEAWAYS"));
    var blist = el("ul", { class: "take-list" });
    CONTENT.BLUE_TAKEAWAYS.forEach(function (t) { blist.appendChild(el("li", null, el("span", { class: "arrow t-lime" }, "▸"), t)); });
    blue.appendChild(blist);
    grid.appendChild(blue);

    // red takeaways
    var red = el("div", null, el("h3", { class: "debrief-h3 t-amber" }, icon("lock", "ico-14"), "RED-TEAM MINDSET (know thy adversary)"));
    var rlist = el("ul", { class: "take-list" });
    CONTENT.RED_TAKEAWAYS.forEach(function (t) { rlist.appendChild(el("li", null, el("span", { class: "arrow t-amber" }, "▸"), t)); });
    red.appendChild(rlist);
    grid.appendChild(red);

    section.appendChild(grid);

    var refs = el("div", { class: "refs-row" },
      el("h3", { class: "refs-row-lead mono muted-fg" }, "OFFICIAL REFERENCES (open in new tab):"));
    CONTENT.REFERENCES.forEach(function (r) {
      refs.appendChild(el("a", {
        class: "ref-link",
        attrs: { href: r.url, target: "_blank", rel: "noopener noreferrer" },
      }, r.label, icon("external-link", "ico-14")));
    });
    section.appendChild(refs);

    var complete = el("div", { class: "complete-box" });
    complete.appendChild(el("button", {
      class: eligible ? "btn btn-lime minh-44 fw-600" : "btn btn-ghost-disabled minh-44",
      attrs: { disabled: !eligible || null },
      on: {
        click: function () {
          if (!eligible) return;
          ui.completionModalOpen = true;
          openCompletionModal(state, progress);
        },
      },
    }, "COMPLETE THE LAB — GET RATING"));
    if (!eligible) {
      complete.appendChild(el("span", { class: "req-note" },
        "Requires: all objectives done (" + progress.done + "/" + progress.total + ") + quiz submitted."));
    }
    section.appendChild(complete);
    return section;
  }

  // ------------------------------------------------------------------
  // COMPLETION MODAL (CompletionContent.tsx)
  // ------------------------------------------------------------------
  function openCompletionModal(state, progress) {
    var objectives = OBJ.objectivesFor(state.mode || "medium");
    var hard = state.mode === "hard";
    var pillars = ["P1", "P2", "P3", "P4"];
    var pillarMeta = {
      P1: { name: "UNDERSTAND", hint: "what it is, why attackers/defenders care" },
      P2: { name: "RECOGNIZE / ANALYZE", hint: "spot it in realistic evidence" },
      P3: { name: "DETECT", hint: "data sources, detection logic, tuning" },
      P4: { name: "MITIGATE", hint: "controls, sequencing, verification" },
    };

    // R8: focus areas derived from THIS student's actual evidence
    var weakObjectives = objectives
      .map(function (o) { return { obj: o, p: state.objectives[o.id] }; })
      .filter(function (x) { return x.p && (x.p.attempts > 1 || x.p.hintsUsed > 0); })
      .sort(function (a, b) { return (b.p.attempts + b.p.hintsUsed) - (a.p.attempts + a.p.hintsUsed); });
    var quizItems = hard ? CONTENT.QUIZ_HARD : CONTENT.QUIZ_MEDIUM;
    var missedQuiz = quizItems.filter(function (q) {
      var a = state.quizAnswers[q.id];
      return a !== undefined && a !== String(q.answer);
    });
    var focusAreas = [];
    weakObjectives.slice(0, 4).forEach(function (x) {
      var why = x.p.attempts > 1
        ? x.p.attempts + " checks needed"
        : x.p.hintsUsed + " hint" + (x.p.hintsUsed > 1 ? "s" : "") + " used";
      focusAreas.push({
        topic: x.obj.id + " — " + x.obj.title,
        action: "re-run it (" + why + ") and re-read the linked Field Manual card until it is one-shot",
      });
    });
    missedQuiz.slice(0, 4).forEach(function (q) {
      focusAreas.push({
        topic: "Quiz: " + q.topic,
        action: "your answer on \"" + q.prompt.slice(0, 58) + "…\" was wrong — re-read its explanation above and the matching Field Manual card",
      });
    });
    var quizCorrect = QUIZ.computeQuizCorrect(state.mode || "medium", state.quizAnswers);
    var quizTotal = quizItems.length;
    if (focusAreas.length === 0 && quizCorrect < quizTotal) {
      focusAreas.push({ topic: "Knowledge check", action: "re-read the quiz explanations above before your next session" });
    }

    UI.openModal({
      wide: true,
      largeTitle: true,
      title: "SHIFT COMPLETE — " + (hard ? "cold start survived" : "guided shift logged"),
      description: "You walked the full signal path: observe → baseline → detect → correlate → respond. That is N10-009 3.2 end to end.",
      onCloseIntent: function () {
        ui.completionModalOpen = false;
        dispatch({ type: "SEEN_COMPLETION" });
      },
      mount: function (body, close) {
        // stars + score
        var top = el("div", { class: "cm-block", style: { display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" } });
        var stars = el("div", { class: "stars-row", attrs: { "aria-label": "Rating: " + progress.stars + " of 5 stars" } });
        for (var i = 1; i <= 5; i++) {
          stars.appendChild(el("span", { class: i <= progress.stars ? "on" : "off", attrs: { "aria-hidden": "true" } }, "★"));
        }
        top.appendChild(stars);
        var firstTryCount = objectives.filter(function (o) {
          return state.objectives[o.id] && state.objectives[o.id].firstTry;
        }).length;
        top.appendChild(el("div", { class: "score-block" },
          el("div", { class: "score-num" }, String(progress.score), el("span", { class: "out-of" }, "/100")),
          el("div", { class: "score-line" },
            progress.done + "/" + progress.total + " objectives · first-attempt " + firstTryCount + "/" + progress.total + " · quiz " + quizCorrect + "/" + quizTotal)
        ));
        body.appendChild(top);

        // pillar recap
        var recap = el("div", { class: "cm-block" }, el("h3", { class: "cm-title" }, "MASTERY RECAP BY PILLAR"));
        pillars.forEach(function (p) {
          var list = objectives.filter(function (o) { return o.pillar === p; });
          var done = list.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].done; }).length;
          recap.appendChild(el("div", { class: "pillar-row" },
            el("div", { class: "p-head" },
              el("span", { class: "badge" }, p),
              el("span", { class: "p-name" }, pillarMeta[p].name),
              el("span", { class: "p-frac" }, done + "/" + list.length)),
            el("p", { class: "p-hint" }, pillarMeta[p].hint)));
        });
        body.appendChild(recap);

        // focus areas
        var focus = el("div", { class: "focus-box" },
          el("h3", { class: "f-title" }, "FOCUS AREAS — where to put your next study hour"));
        if (focusAreas.length === 0) {
          focus.appendChild(el("p", { class: "muted-fg", style: { fontSize: "12px" } },
            "No weak spots detected: every objective fell on the first check, no hints were needed, and the quiz was flawless. Next step: run the other mode — the same deck is a different workout there."));
        } else {
          var ul = el("ul");
          focusAreas.forEach(function (f) {
            ul.appendChild(el("li", null,
              el("span", { class: "topic" }, f.topic),
              el("span", { class: "action" }, " — " + f.action + ".")));
          });
          focus.appendChild(ul);
        }
        focus.appendChild(el("p", { class: "f-src" },
          "derived from your objective attempts, hint usage and missed quiz items — not generic advice"));
        body.appendChild(focus);

        // what to learn next
        var next = el("div", { class: "next-box" }, el("h3", { class: "n-title" }, "WHAT TO LEARN NEXT"));
        var nul = el("ul");
        nul.appendChild(el("li", null, "▸ N10-009 3.3 (RPO/RTO/HA) pairs naturally with the availability monitoring you practiced."));
        nul.appendChild(el("li", null, "▸ Try writing one real detection from the Debrief logic column in your homelab SIEM."));
        nul.appendChild(el("li", null, "▸ Re-run in " + (hard ? "MEDIUM" : "HARD") + " mode — the same deck, a completely different workout."));
        next.appendChild(nul);
        body.appendChild(next);

        body.appendChild(el("button", {
          class: "cm-log-btn",
          on: {
            click: function () {
              close();
              dispatch({ type: "SEEN_COMPLETION" });
            },
          },
        }, "LOG THE SHIFT"));
      },
    });
  }

  // ------------------------------------------------------------------
  // PAGE LAYOUT (page.tsx)
  // ------------------------------------------------------------------
  function sectionBox(id, highlight, child) {
    var cls = "section-anchor";
    if (highlight) {
      // avoid restarting the pulse animation on every unrelated re-render
      cls += ui.lastLocateTarget === id ? " sp-locate-static" : " sp-locate";
    }
    return el("div", {
      class: cls,
      attrs: { id: id, "aria-live": highlight ? "polite" : null },
    }, child);
  }

  function renderLab(state) {
    var objectives = OBJ.objectivesFor(state.mode);
    var progress = computeProgress(state, objectives);
    var brief = state.mode === "hard" ? CONTENT.BRIEFING.hard : CONTENT.BRIEFING.medium;

    var wrap = el("div", { class: "sp-chassis", style: { minHeight: "100vh" } });
    wrap.appendChild(renderStatusStrip(state, objectives, progress));
    wrap.appendChild(el("a", {
      class: "skip-link",
      attrs: { href: "#evidence-deck" },
    }, "Skip to operations deck"));

    var main = el("main", { class: "lab-main", attrs: { role: "main" } });
    var grid = el("div", { class: "lab-grid" });

    // OPERATIONS DECK
    var left = el("div", { class: "lab-col" });
    left.appendChild(sectionBox("network-map", state.locateTarget === "network-map", renderNetworkMap(state)));
    left.appendChild(sectionBox("instrument-rack", state.locateTarget === "instrument-rack", renderInstrumentRack(state)));
    left.appendChild(sectionBox("evidence-deck", state.locateTarget === "evidence-deck", renderEvidenceDeck(state)));
    left.appendChild(sectionBox("incident-bay", state.locateTarget === "incident-bay", renderIncidentPanels(state)));
    grid.appendChild(left);

    // SHIFT BOARD
    var right = el("div", { class: "lab-col" });
    var briefCard = el("section", { class: "sp-rack brief-card", attrs: { "aria-labelledby": "briefing-heading" } });
    briefCard.appendChild(el("div", { class: "brief-head" },
      icon("info", "ico-16 t-lime"),
      el("h2", { class: "", attrs: { id: "briefing-heading" } },
        "SHIFT BRIEFING",
        state.mode === "hard" ? el("span", { class: "cold" }, "COLD START") : null)));
    var briefBody = el("div", { class: "brief-body" });
    brief.forEach(function (p) { briefBody.appendChild(el("p", null, p)); });
    briefCard.appendChild(briefBody);
    briefCard.appendChild(el("p", { class: "brief-note", attrs: { role: "note" } }, DATA.SIM_NOTICE));
    right.appendChild(briefCard);

    right.appendChild(sectionBox("objectives-board", state.locateTarget === "objectives-board", renderObjectivesBoard(state, objectives)));
    right.appendChild(sectionBox("field-manual", state.locateTarget === "field-manual", renderFieldManual(state)));
    grid.appendChild(right);

    main.appendChild(grid);
    main.appendChild(renderQuizBay(state));
    main.appendChild(renderDebriefBay(state, progress));
    wrap.appendChild(main);

    wrap.appendChild(el("footer", { class: "sr-footer" },
      "Synthetic training environment — no real network data. CompTIA Network+ N10-009 objective 3.2 practice lab."));
    return wrap;
  }

  // ------------------------------------------------------------------
  // render pipeline
  // ------------------------------------------------------------------
  var renderQueued = false;

  function rerenderFromState(state) {
    // used by local handlers that mutate transient UI only
    renderAll();
  }

  function renderAll() {
    var state = store.getState();
    if (!state) return;
    var root = document.getElementById("root");
    if (!root) return;
    var focus = UI.captureFocus();
    var scrolls = UI.captureScrolls();
    root.textContent = "";
    if (!state.mode) {
      root.appendChild(renderGate());
    } else {
      root.appendChild(renderLab(state));
    }
    UI.restoreScrolls(scrolls);
    UI.restoreFocus(focus);
    ui.lastLocateTarget = state.locateTarget;
    postRenderEffects(state);
  }

  function postRenderEffects(state) {
    if (!state.mode) return;
    // FlowView effect (QA-19): containment verified whenever the student is LOOKING
    // at the incident flow table with the port down and C2 blocked.
    if (
      state.phase === "incident" &&
      state.activeView === "flow" &&
      state.containment.portDisabled &&
      state.containment.c2Blocked &&
      !state.verifiedStop
    ) {
      dispatch({ type: "VERIFY_STOP" });
      return; // dispatch triggers a fresh render
    }
    // completion modal auto-open (DebriefBay: eligible && !completionSeen)
    var objectives = OBJ.objectivesFor(state.mode);
    var progress = computeProgress(state, objectives);
    var eligible = progress.total > 0 && progress.done === progress.total && state.quizSubmitted;
    if (eligible && !state.completionSeen && !ui.completionModalOpen && !UI.isModalOpen()) {
      ui.completionModalOpen = true;
      openCompletionModal(state, progress);
    }
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    window.setTimeout(function () {
      renderQueued = false;
      renderAll();
    }, 0);
  }

  // ------------------------------------------------------------------
  // boot
  // ------------------------------------------------------------------
  function boot() {
    store.hydrate();
    QUIZ.setRerender(function () { renderAll(); });
    store.subscribe(function () { scheduleRender(); });
    renderAll();
  }

  return { boot: boot, renderAll: renderAll };
})();

window.SP_APP.boot();
