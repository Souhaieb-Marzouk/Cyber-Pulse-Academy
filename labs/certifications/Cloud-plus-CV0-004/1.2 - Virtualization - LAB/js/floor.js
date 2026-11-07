// THE ISOLATION FOUNDRY — js/floor.js
// Stage 2 "Foundry floor": intake deck, mold picker, host stations with
// slot-density grids + ops rails, and the triage bench (all 13 workspaces).
// Component-for-component port of floor.tsx; interaction handlers dispatch
// the same actions as the original.
(function (F) {
  "use strict";

  var h = F.h, cn = F.cn, iconEl = F.iconEl;
  var state = function () { return F.getState(); };

  /* ============ shared floor UI state (React useState equivalents) ============ */
  // NOT persisted (original components remount per stage switch).
  var floorUi = {
    deckSel: null,                    // IntakeDeck selection
    mold: null,                       // MoldPicker selection
    selected: { fl01: null, fl02: null }, // per-station selected workload chip
  };

  F.floorUi = floorUi;

  function setDeckSel(id) {
    if (floorUi.deckSel !== id) floorUi.mold = null; // stale mold reset (fix #9)
    floorUi.deckSel = id;
  }

  var MEDIUM_TABS = [
    { id: "calibration", label: "Calibration", icon: "Layers" },
    { id: "artifacts", label: "Artifacts", icon: "FileCode2" },
    { id: "telemetry", label: "Telemetry", icon: "Gauge" },
    { id: "ops", label: "Floor ops", icon: "Wrench" },
    { id: "concepts", label: "Concepts", icon: "ScrollText" },
  ];
  var HARD_TABS = [
    { id: "rfp", label: "RFP", icon: "ClipboardList" },
    { id: "survey", label: "Site survey", icon: "Server" },
    { id: "evidence", label: "Night evidence", icon: "FileCode2" },
    { id: "runbook", label: "Runbook", icon: "Wrench" },
    { id: "audit-iso", label: "Isolation audit", icon: "ShieldCheck" },
    { id: "scale", label: "Scale call", icon: "Gauge" },
    { id: "faas", label: "FaaS fit", icon: "Zap" },
    { id: "tenancy", label: "Tenancy design", icon: "Boxes" },
  ];

  F.benchTabIds = function (mode) {
    return (mode === "medium" ? MEDIUM_TABS : HARD_TABS).map(function (t) { return t.id; });
  };

  /* ==================== floor root ==================== */

  F.renderFloor = function (benchEl) {
    var mode = state().mode || "medium";
    return h("div", { class: "floor-grid" },
      h("div", { class: "floor-col floor-col-deck" },
        intakeDeck(mode), moldPicker(mode)),
      h("div", { class: "floor-col floor-col-stations" },
        hostStation("fl01", mode), hostStation("fl02", mode)),
      h("div", { class: "floor-col floor-col-bench" }, benchEl));
  };

  // Rebuild only deck + mold + stations (leaves the bench DOM, and any focus
  // inside it, untouched).
  F.rerenderFloorPanels = function () {
    var main = document.getElementById("main");
    var wrap = main.querySelector(".floor-grid");
    if (!wrap) { F.renderMain(true); return; }
    rebuildRegion(wrap.querySelector(".floor-col-deck"), function () {
      var mode = state().mode || "medium";
      return [intakeDeck(mode), moldPicker(mode)];
    });
    var stations = wrap.querySelectorAll(".floor-col-stations");
    if (stations.length) {
      rebuildRegion(stations[0], function () {
        var mode = state().mode || "medium";
        return [hostStation("fl01", mode), hostStation("fl02", mode)];
      });
    }
  };

  F.rerenderBench = function () {
    var main = document.getElementById("main");
    var benchCol = main.querySelector(".floor-col-bench");
    if (!benchCol) { F.renderMain(true); return; }
    rebuildRegion(benchCol, function () { return F.buildBenchPanel(state().mode || "medium"); });
  };

  /* generic region rebuild with focus preservation + scroll restoration */
  function cssEscape(s) { return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/"/g, '\\"'); }
  function rebuildRegion(regionEl, buildFn) {
    if (!regionEl) return;
    var active = document.activeElement;
    var fk = active && active.getAttribute ? active.getAttribute("data-fk") : null;
    var hadFocus = fk && regionEl.contains(active);
    // remember scroll positions of marked scroll containers
    var scrolls = [];
    regionEl.querySelectorAll("[data-scrollkeep]").forEach(function (el) {
      scrolls.push([el.getAttribute("data-scrollkeep"), el.scrollTop]);
    });
    var fresh = buildFn();
    if (Array.isArray(fresh)) regionEl.replaceChildren.apply(regionEl, fresh);
    else regionEl.replaceChildren(fresh);
    scrolls.forEach(function (pair) {
      var el = regionEl.querySelector('[data-scrollkeep="' + pair[0] + '"]');
      if (el) el.scrollTop = pair[1];
    });
    if (hadFocus) {
      var target = regionEl.querySelector('[data-fk="' + cssEscape(fk) + '"]');
      if (target) {
        var f = target.matches("button, input, select, textarea, a[href], [tabindex]:not([tabindex='-1'])")
          ? target
          : target.querySelector("button, input, select, textarea, a[href], [tabindex]:not([tabindex='-1'])");
        if (f) { try { f.focus({ preventScroll: true }); } catch (e) { /* older engines */ } }
      }
    }
  }
  F.rebuildRegion = rebuildRegion;

  /* ==================== intake deck ==================== */

  function intakeDeck(mode) {
    var cards = F.INTAKE[mode];
    var items = cards.map(function (c) {
      var placed = state().env.placements.filter(function (p) { return p.cardId === c.id; }).length;
      var isSel = floorUi.deckSel === c.id;
      return h("li", null,
        h("button", {
          class: cn("deck-card", isSel && "deck-card-selected"),
          onClick: function () { setDeckSel(isSel ? null : c.id); F.rerenderFloorPanels(); },
          "aria-pressed": isSel, fk: "deck-" + c.id,
        },
          h("div", { class: "deck-card-top" },
            h("span", { class: "deck-card-name" }, c.name),
            placed > 0
              ? h("span", { class: "deck-card-placed" }, "×" + placed + " on floor")
              : h("span", { class: "deck-card-queue" }, "in queue")),
          h("div", { class: "deck-card-tenant" }, "tenant · " + c.tenant),
          h("p", { class: "deck-card-brief" }, c.brief),
          h("ul", { class: "deck-card-needs" },
            c.needs.map(function (n) {
              return h("li", null, iconEl("CircleDot", 10, "text-ember"), n);
            }))));
    });

    return F.panel({
      title: "Intake deck",
      sub: "Select a tenant workload, then pick its mold below",
      right: h("span", { class: "panel-count" }, state().env.placements.length + " cast"),
      children: [
        h("ul", { class: "deck-list foundry-scroll", "aria-label": "Intake cards", "data-scrollkeep": "deck" }, items),
        mode === "hard" ? h("p", { class: "deck-hardnote" },
          "NIGHT SHIFT: the exact host & reservation demands live in the RFP bench tab.") : null,
      ],
    });
  }

  /* ==================== mold picker ==================== */

  function moldPicker(mode) {
    var card = F.INTAKE[mode].find(function (c) { return c.id === floorUi.deckSel; }) || null;
    var mold = floorUi.mold;

    var body;
    if (!card) {
      body = h("p", { class: "mold-empty" }, "No workload selected — pick one from the intake deck above.");
    } else {
      var moldBtns = h("div", { class: "mold-list", role: "group", "aria-label": "Isolation mold" });
      Object.keys(F.RUNTIMES).forEach(function (r) {
        var spec = F.RUNTIMES[r];
        var isSel = mold === r;
        moldBtns.appendChild(h("button", {
          class: cn("mold-btn", isSel && "mold-btn-selected"),
          style: "border-color:" + spec.color + "55;background:" + (isSel ? spec.color + "18" : "transparent"),
          "aria-pressed": isSel, fk: "mold-" + r,
          onClick: function () { floorUi.mold = r; F.rerenderFloorPanels(); },
        },
          h("div", { class: "mold-btn-top" },
            h("span", { class: "mold-btn-label", style: "color:" + spec.color }, spec.label),
            F.isoMeter(spec.isolation)),
          h("div", { class: "mold-btn-sub" }, spec.mold + " · " + spec.kernel),
          isSel ? h("div", { class: "mold-btn-blurb" },
            spec.blurb + " ",
            h("span", { class: "mold-btn-footprint" },
              "[" + spec.cpu + " vCPU · " + spec.ram + " GB · " +
              (spec.slots === 0 ? "no slot" : spec.slots + " slot" + (spec.slots > 1 ? "s" : "")) + "]")) : null));
      });

      body = [moldBtns];
      if (mold) {
        var pours = h("div", { class: "pour-grid" });
        F.HOSTS.forEach(function (host) {
          var fits = F.canFit(mold, host.id, state().env);
          pours.appendChild(F.button({
            variant: "outline",
            className: "pour-btn",
            disabled: !fits,
            fk: "pour-" + host.id,
            ariaLabel: fits
              ? "Pour " + card.name + " as " + F.RUNTIMES[mold].label + " onto " + host.name
              : host.name + " has no capacity for this mold",
            onClick: function () {
              F.dispatch({ t: "place", cardId: card.id, runtime: mold, host: host.id, cardName: card.name });
              floorUi.deckSel = null; floorUi.mold = null;
              F.rerenderFloorPanels();
            },
            children: [iconEl("Factory", 12), fits ? "Pour on " + host.name : host.name + " · full"],
          }));
        });
        body.push(pours);
      }
    }

    return F.panel({
      title: "Mold picker",
      sub: card ? "Casting: " + card.name : "Select an intake card first",
      children: body,
    });
  }

  /* ==================== host stations ==================== */

  var OPS_FLAG_LABEL = { snapshot: "SNAP", cpuReserve: "RES·C", memReserve: "RES·M", limit: "LIM", antiAffinity: "ANTI" };
  var OPS_TOGGLES = [
    { k: "snapshot", label: "Snapshot", icon: "Camera", why: "point-in-time rollback" },
    { k: "cpuReserve", label: "CPU reserve", icon: "ShieldCheck", why: "guaranteed CPU" },
    { k: "memReserve", label: "RAM reserve", icon: "ShieldCheck", why: "guaranteed memory" },
    { k: "limit", label: "Limit", icon: "Gauge", why: "cap consumption" },
    { k: "antiAffinity", label: "Anti-affinity", icon: "ArrowRightLeft", why: "spread across hosts" },
  ];

  function hostStation(hostId, mode) {
    var host = F.HOSTS.find(function (x) { return x.id === hostId; });
    var usage = F.hostUsage(state().env, hostId);
    var placed = state().env.placements.filter(function (p) { return p.host === hostId; });
    var selUid = floorUi.selected[hostId];
    var sel = placed.find(function (p) { return p.uid === selUid; }) || null;
    var other = hostId === "fl01" ? "fl02" : "fl01";
    var otherName = other === "fl01" ? "FORGELINE-01" : "FORGELINE-02";

    /* gauges */
    var gauges = h("div", { class: "station-gauges" },
      F.gauge({ label: "vCPU pool", value: usage.cpu, max: usage.cap.cpuCap, unit: "", color: "#F1A33C", digits: 1 }),
      F.gauge({ label: "vRAM pool", value: usage.ram, max: usage.cap.ramCap, unit: "G", color: "#E07B39" }));

    /* slot grid — density made visible */
    var slotCells = placed.filter(function (p) { return p.runtime !== "function"; }).map(function (p) {
      var spec = F.RUNTIMES[p.runtime];
      var spanClass = spec.slots >= 4 ? "slot-slot4" : spec.slots === 2 ? "slot-slot2" : "slot-slot1";
      var isSel = selUid === p.uid;
      var chip = F.runtimeChip({
        runtime: p.runtime, name: p.cardId.replace(/^h_|^w_/, ""),
        selected: isSel,
        opsFlags: Object.keys(OPS_FLAG_LABEL).filter(function (k) { return p.ops[k]; }).map(function (k) { return OPS_FLAG_LABEL[k]; }),
        onClick: function () { floorUi.selected[hostId] = isSel ? null : p.uid; F.rerenderFloorPanels(); },
        fk: "chip-" + p.uid,
        className: "chip-fill",
      });
      return h("div", { class: cn("slot-cell", spanClass, "chip-enter") }, chip);
    });
    var fnChips = placed.filter(function (p) { return p.runtime === "function"; }).map(function (p) {
      var isSel = selUid === p.uid;
      return F.runtimeChip({
        runtime: "function", name: p.cardId.replace(/^h_|^w_/, ""),
        selected: isSel,
        onClick: function () { floorUi.selected[hostId] = isSel ? null : p.uid; F.rerenderFloorPanels(); },
        fk: "chip-" + p.uid,
      });
    });

    var slotGrid = h("div", { class: "slot-block" },
      h("div", { class: "slot-block-head" },
        h("span", null, "Slot grid · VM=4 · microVM/VDI=2 · container=1"),
        h("span", { class: usage.slots >= usage.cap.slots ? "text-destructive" : "" }, usage.slots + "/" + usage.cap.slots)),
      h("div", { class: "slot-grid", role: "list", "aria-label": host.name + " slots" }, slotCells),
      fnChips.length ? h("div", { class: "fn-chips", role: "list", "aria-label": "Function executions" }, fnChips) : null);

    /* ops rail */
    var rail;
    if (sel) {
      var toggles = OPS_TOGGLES.map(function (t) {
        var on = !!sel.ops[t.k];
        return F.button({
          variant: "outline", size: "sm", ariaPressed: on, title: t.why, fk: "op-" + sel.uid + "-" + t.k,
          className: cn("ops-toggle", on ? "ops-toggle-on" : ""),
          onClick: function () { F.dispatch({ t: "toggleOp", uid: sel.uid, key: t.k }); },
          children: [iconEl(t.icon, 11), t.label + (on ? " ✓" : "")],
        });
      });
      toggles.push(F.button({
        variant: "outline", size: "sm", className: "ops-toggle",
        disabled: !F.canFit(sel.runtime, other, state().env), fk: "mig-" + sel.uid,
        ariaLabel: "Live migrate " + sel.cardId + " to " + otherName,
        onClick: function () { F.dispatch({ t: "migrate", uid: sel.uid, to: other, name: sel.cardId }); floorUi.selected[hostId] = null; F.rerenderFloorPanels(); },
        children: [iconEl("ArrowRightLeft", 11), "Migrate → " + (other === "fl01" ? "F-01" : "F-02")],
      }));
      toggles.push(F.button({
        variant: "outline", size: "sm", className: "ops-toggle ops-toggle-danger", fk: "scrap-" + sel.uid,
        ariaLabel: "Remove " + sel.cardId + " from the floor",
        onClick: function () { F.dispatch({ t: "remove", uid: sel.uid, name: sel.cardId }); floorUi.selected[hostId] = null; F.rerenderFloorPanels(); },
        children: [iconEl("Trash2", 11), "Scrap"],
      }));

      rail = h("div", { class: "ops-rail rail-enter" },
        h("div", { class: "ops-rail-head" },
          h("span", { class: "ops-rail-title" }, "Ops rail · " + sel.cardId + " (" + F.RUNTIMES[sel.runtime].label + ")"),
          h("span", { class: "ops-rail-host" }, "on " + (sel.host === "fl01" ? "F-01" : "F-02"))),
        h("div", { class: "ops-rail-controls" }, toggles),
        sel.ops.antiAffinity ? h("p", { class: "ops-rail-note" },
          "anti-affinity on " + sel.cardId + ": validator expects the OTHER matching replica flagged too.") : null);
    } else {
      rail = h("p", { class: "ops-rail-empty" }, "select a workload chip to open its ops rail");
    }

    return F.panel({
      title: host.name, sub: host.note, tone: "#F1A33C",
      right: h("span", { class: "panel-count" }, placed.length + " workload" + (placed.length === 1 ? "" : "s")),
      children: [gauges, slotGrid, rail],
    });
  }

  /* ==================== triage bench ====================
     app.js builds the bench panel shell (tabs driven by ui.benchTab);
     floor.js owns the workspace content builders. */

  F.benchBuilders = {
    calibration: calibrationBench, artifacts: artifactsBench, telemetry: telemetryBench,
    ops: opsBench, concepts: conceptsBench, rfp: rfpBench, survey: surveyBench,
    evidence: evidenceBench, runbook: runbookBench, "audit-iso": auditIsoBench,
    scale: scaleBench, faas: faasBench, tenancy: tenancyBench,
  };

  /* ---------------- medium benches ---------------- */

  function calibrationBench() {
    var s = state();
    var m1 = F.STACK_ITEMS.map(function (i) {
      return h("li", { class: "sort-row" },
        h("span", { class: "sort-chip" }, i.text),
        h("div", { class: "sort-select" },
          F.foundrySelect({
            compact: true, label: "Layer bin", value: s.env.stackSort[i.id] || "",
            onChange: function (v) { F.dispatch({ t: "setSort", group: "stack", itemId: i.id, bin: v }); },
            choices: F.STACK_BINS.map(function (b) { return { id: b.id, text: b.label }; }),
          })));
    });
    var m2 = F.HYPERVISOR_ITEMS.map(function (i) {
      return h("li", { class: "sort-row" },
        h("span", { class: "sort-chip" }, i.text),
        h("div", { class: "sort-select" },
          F.foundrySelect({
            compact: true, label: "Type", value: s.env.hypSort[i.id] || "",
            onChange: function (v) { F.dispatch({ t: "setSort", group: "hyp", itemId: i.id, bin: v }); },
            choices: F.HYPERVISOR_BINS.map(function (b) { return { id: b.id, text: b.label }; }),
          })));
    });
    var m3 = F.ACCEL_ITEMS.map(function (i) {
      return h("div", { class: "bench-card" },
        h("div", { class: "bench-card-term" }, i.term),
        F.foundrySelect({
          compact: true, label: "Definition", value: s.env.accelMatch[i.id] || "",
          onChange: function (v) { F.dispatch({ t: "setAccel", itemId: i.id, opt: v }); },
          choices: F.ACCEL_OPTIONS.map(function (o) { return { id: o.id, text: o.text }; }),
        }));
    });
    return h("div", { class: "bench-stack" },
      h("div", null, F.benchHead("M1", "Stack sort — file every chip"), h("ul", { class: "sort-list" }, m1)),
      h("div", null, F.benchHead("M2", "Hypervisor types — bare-metal or hosted?"), h("ul", { class: "sort-list" }, m2)),
      h("div", null, F.benchHead("M3", "Acceleration modes — match the definitions"), h("div", { class: "bench-stack-sm" }, m3)));
  }

  function artifactsBench() {
    var s = state();
    return h("div", null,
      F.benchHead("M4", "VM manifest — read the virtual hardware"),
      h("pre", { class: "artifact foundry-scroll", "aria-label": "VM manifest (synthetic artifact)", "data-scrollkeep": "manifest" }, F.VM_MANIFEST),
      h("div", { class: "manifest-grid" },
        F.MANIFEST_FIELDS.map(function (f) {
          return F.foundrySelect({
            compact: true, label: f.label, value: s.env.manifest[f.key] || "",
            onChange: function (v) { F.dispatch({ t: "setManifest", key: f.key, val: v }); },
            choices: f.choices.map(function (c) { return { id: c, text: c }; }),
          });
        })));
  }

  function telemetryTable(rows, buildRow) {
    return h("div", { class: "table-scroll foundry-scroll" },
      h("table", { class: "bench-table" }, buildRow()));
  }

  function telemetryBench() {
    var s = state();
    var tel = telemetryTable(null, function () {
      return [
        h("thead", null, h("tr", null,
          h("th", null, "Host"), h("th", null, "CPU ready"), h("th", null, "Balloon"),
          h("th", null, "Swap-in"), h("th", null, "Read"))),
        h("tbody", null, F.TELEMETRY.map(function (t) {
          return h("tr", null,
            h("td", { class: "td-host" }, t.host),
            h("td", { class: t.ready >= 15 ? "text-destructive" : "" }, t.ready + "%"),
            h("td", { class: t.balloonGb > 2 ? "text-destructive" : "" }, t.balloonGb + " GB"),
            h("td", null, t.swapIn),
            h("td", { class: "td-note" }, t.note));
        })),
      ];
    });
    var snaps = telemetryTable(null, function () {
      return [
        h("thead", null, h("tr", null,
          h("th", null, "VM"), h("th", null, "Snapshots"), h("th", null, "Oldest"), h("th", null, "Chain size"))),
        h("tbody", null, F.SNAPSHOTS.map(function (x) {
          return h("tr", { class: x.snaps >= 5 ? "text-destructive" : "" },
            h("td", { class: "td-host" }, x.vm),
            h("td", null, String(x.snaps)),
            h("td", null, x.oldestDays > 0 ? x.oldestDays + " days" : "—"),
            h("td", null, x.size));
        })),
      ];
    });
    return h("div", { class: "bench-stack" },
      h("div", null,
        F.benchHead("M7", "Fleet telemetry — diagnose both hosts"), tel,
        h("div", { class: "select-stack" },
          F.TELEMETRY_QS.map(function (q) {
            return F.foundrySelect({
              compact: true, label: q.label, value: s.env.telemetryQ[q.key] || "",
              onChange: function (v) { F.dispatch({ t: "setTelemetry", key: q.key, val: v }); },
              choices: q.choices,
            });
          }))),
      h("div", null,
        F.benchHead("M8", "Snapshot audit — find the sprawl"), snaps,
        h("div", { class: "select-stack" },
          F.foundrySelect({
            compact: true, label: "Snapshot-sprawl offender", value: s.env.snapVm,
            onChange: function (v) { F.dispatch({ t: "setSnap", part: "vm", val: v }); },
            choices: F.SNAP_VM_CHOICES,
          }),
          F.foundrySelect({
            compact: true, label: "The risk it creates", value: s.env.snapRisk,
            onChange: function (v) { F.dispatch({ t: "setSnap", part: "risk", val: v }); },
            choices: F.SNAP_RISK_CHOICES,
          }))),
      replicaBench());
  }

  function replicaBench() {
    var s = state();
    var card = F.REPLICA_CARD;
    return h("div", null,
      F.benchHead("M9", "Replica health — self-healing & scaling"),
      h("div", { class: "replica-card" },
        h("div", { class: "replica-card-top" },
          h("span", { class: "replica-card-name" }, card.service),
          h("span", { class: card.current < card.desired ? "text-destructive" : "text-container" },
            "desired " + card.desired + " · current " + card.current)),
        h("ul", { class: "replica-events" }, card.events.map(function (e) { return h("li", null, "› " + e); }))),
      h("div", { class: "select-stack" },
        F.REPLICA_QS.map(function (q) {
          return F.foundrySelect({
            compact: true, label: q.label, value: s.env.replicaQ[q.key] || "",
            onChange: function (v) { F.dispatch({ t: "setReplica", key: q.key, val: v }); },
            choices: q.choices,
          });
        })));
  }

  /* sequence drill (M11 / H4): shared mechanics */
  function seqDrill(opts) {
    var s = state();
    var chosen = s.env[opts.stateKey];
    var pills = chosen.length === 0
      ? h("span", { class: "seq-empty" }, opts.emptyText)
      : chosen.map(function (id, i) {
        var step = opts.steps.find(function (x) { return x.id === id; });
        return F.seqPill(i + 1, step.label.split("(")[0].trim());
      });
    var buttons = opts.steps.map(function (st) {
      var used = chosen.indexOf(st.id) !== -1;
      return h("li", null, F.button({
        variant: "outline", disabled: used, fk: opts.fkPrefix + st.id,
        ariaLabel: "Add " + opts.stepNoun + ": " + st.label,
        className: cn("seq-step", used && "seq-step-used"),
        onClick: function () { F.dispatch({ t: opts.action, stepId: st.id }); },
        children: st.label,
      }));
    });
    return [
      h("div", { class: "seq-pillbox", "aria-live": "polite" }, pills),
      h("ul", { class: "seq-steps" }, buttons),
      F.button({
        variant: "outline", size: "sm", className: "seq-reset",
        onClick: function () { F.dispatch({ t: opts.clearAction }); },
        children: [iconEl("RotateCcw", 11), "Reset sequence"],
      }),
    ];
  }

  function opsBench() {
    return h("div", { class: "bench-stack" },
      h("div", null,
        F.benchHead("M11", "Patch-window drill — click the five steps in order"),
        seqDrill({
          stateKey: "seqMed", steps: F.SEQ_MED, action: "seqMed", clearAction: "seqMedClear",
          fkPrefix: "seq-", stepNoun: "step", emptyText: "sequence empty — click steps below in order",
        })),
      h("div", null,
        F.benchHead("M10", "Governance happens on the floor"),
        h("p", { class: "m10-guidance" },
          "Reservations, limits and anti-affinity are floor actions, not bench paperwork: select a placed workload chip on a host station and use its ",
          h("span", { class: "text-foreground" }, "ops rail"),
          ". Re-read the work order — one workload needs a guarantee, one needs a cap, and a replica pair needs separation. The order's hint tiers walk you through it.")));
  }

  function conceptsBench() {
    var s = state();
    var tf = F.TF_ITEMS.map(function (t) {
      var btn = function (v, label, toneClass) {
        var sel2 = s.env.tf[t.id] === v;
        return F.button({
          variant: "outline", size: "sm", ariaPressed: sel2, fk: "tf-" + t.id + "-" + label.toLowerCase(),
          className: cn("tf-btn", sel2 && toneClass),
          onClick: function () { F.dispatch({ t: "setTf", key: t.id, val: v }); },
          children: label,
        });
      };
      return h("li", { class: "bench-card" },
        h("div", { class: "tf-text" }, t.text),
        h("div", { class: "tf-row", role: "group", "aria-label": "True or false: " + t.text },
          btn(true, "True", "tf-true-selected"), btn(false, "False", "tf-false-selected")));
    });
    var m12 = F.ROLE_TRAITS.map(function (r) {
      return h("div", { class: "bench-card" },
        h("div", { class: "bench-card-trait" }, r.trait),
        F.foundrySelect({
          compact: true, label: "Enabled by", value: s.env.roleMap[r.id] || "",
          onChange: function (v) { F.dispatch({ t: "setRole", itemId: r.id, opt: v }); },
          choices: F.ROLE_OPTIONS.map(function (o) { return { id: o.id, text: o.text }; }),
        }));
    });
    return h("div", { class: "bench-stack" },
      h("div", null, F.benchHead("M6", "VM vs container — call each statement"), h("ul", { class: "bench-stack-sm" }, tf)),
      h("div", null, F.benchHead("M12", "Role of virtualization — map trait → enabler"), h("div", { class: "bench-stack-sm" }, m12)));
  }

  /* ---------------- hard benches ---------------- */

  function rfpBench() {
    function line(n, parts) { return h("p", null, n + ". " + parts); }
    return h("div", null,
      F.benchHead("H1", "Intake RFP — exact molds, hosts, controls"),
      h("div", { class: "artifact rfp-doc" },
        h("p", { class: "rfp-title" }, "RFP-2417 · LEDGERLINE PAY ONBOARDING · SYNTHETIC"),
        h("p", { class: "rfp-line" }, "1. pay-core (PCI payment core): VM on ", h("b", null, "FORGELINE-02"), ", CPU AND memory reserved."),
        h("p", { class: "rfp-line" }, "2. fraud-sandbox (untrusted 3rd-party model): VM on ", h("b", null, "FORGELINE-01"), ", away from pay-core."),
        h("p", { class: "rfp-line" }, "3. web-front ×2: containers, replicas on ", h("b", null, "DIFFERENT hosts"), "."),
        h("p", { class: "rfp-line" }, "4. receipt-render: per-checkout webhook renderer — ", h("b", null, "function"), "."),
        h("p", { class: "rfp-line" }, "5. policy-eval: customers run their own scripts — ", h("b", null, "microVM"), "."),
        h("p", { class: "rfp-line" }, "6. auditor-dek: auditors on unmanaged devices — ", h("b", null, "VDI"), "."),
        h("p", { class: "rfp-foot" }, "Cast from the intake deck. Capacity must hold on both hosts.")));
  }

  function surveyBench() {
    var s = state();
    return h("div", { class: "bench-stack-sm" },
      F.benchHead("H2", "Site survey — approach + justification per site"),
      F.SURVEY_CASES.map(function (c) {
        return h("div", { class: "bench-card" },
          h("div", { class: "bench-card-term" }, c.title),
          h("p", { class: "bench-card-body" }, c.body),
          h("div", { class: "select-stack" },
            F.foundrySelect({
              compact: true, label: "Approach", value: (s.env.survey[c.id] && s.env.survey[c.id].tech) || "",
              onChange: function (v) { F.dispatch({ t: "setSurvey", caseId: c.id, part: "tech", val: v }); },
              choices: F.SURVEY_TECH,
            }),
            F.foundrySelect({
              compact: true, label: "Because…", value: (s.env.survey[c.id] && s.env.survey[c.id].why) || "",
              onChange: function (v) { F.dispatch({ t: "setSurvey", caseId: c.id, part: "why", val: v }); },
              choices: F.SURVEY_WHY,
            })));
      }));
  }

  function evidenceBench() {
    var s = state();
    var alerts = h("div", { class: "bench-card", "aria-label": "Alert feed" },
      h("div", { class: "mini-head" }, "Alert feed"),
      h("ul", { class: "feed-list" }, F.NIGHT_ALERTS.map(function (a) { return h("li", null, "▸ " + a); })));
    var metrics = h("div", { class: "table-scroll foundry-scroll" },
      h("table", { class: "bench-table" },
        h("thead", null, h("tr", null,
          h("th", null, "Host"), h("th", null, "Ready"), h("th", null, "Balloon"),
          h("th", null, "Swap-in"), h("th", null, "Top consumer"))),
        h("tbody", null, F.NIGHT_METRICS.map(function (m) {
          return h("tr", null,
            h("td", { class: "td-host" }, m.host),
            h("td", { class: m.ready === "22%" ? "text-destructive" : "" }, m.ready),
            h("td", { class: m.balloon === "5.8 GB" ? "text-destructive" : "" }, m.balloon),
            h("td", null, m.swapIn),
            h("td", { class: "td-note" }, m.top));
        }))));
    var chat = h("div", { class: "bench-card", "aria-label": "Ops chat log" },
      h("div", { class: "mini-head" }, "Ops chat · select the TWO lines that prove the incident"),
      h("ul", { class: "chat-list" },
        F.CHAT_LOG.map(function (l) {
          var sel2 = s.env.triage.lines.indexOf(l.id) !== -1;
          return h("li", null, F.button({
            variant: "outline", ariaPressed: sel2, fk: "chat-" + l.id,
            className: cn("chat-line", sel2 && "chat-line-selected"),
            onClick: function () { F.dispatch({ t: "toggleLine", lineId: l.id }); },
            children: [
              h("span", { class: "chat-meta" }, l.time + " " + l.who + "› "),
              h("span", { class: sel2 ? "chat-text chat-text-selected" : "chat-text" }, l.text),
            ],
          }));
        })));
    return h("div", { class: "bench-stack" },
      h("div", null,
        F.benchHead("H3", "Night-shift evidence — find the real incident"),
        alerts, metrics, chat,
        h("div", { class: "select-stack" },
          F.foundrySelect({
            compact: true, label: "Affected host", value: s.env.triage.host,
            onChange: function (v) { F.dispatch({ t: "setTriage", part: "host", val: v }); },
            choices: [{ id: "fl01", text: "FORGELINE-01" }, { id: "fl02", text: "FORGELINE-02" }],
          }),
          F.foundrySelect({
            compact: true, label: "Root cause", value: s.env.triage.cause,
            onChange: function (v) { F.dispatch({ t: "setTriage", part: "cause", val: v }); },
            choices: F.H3_CAUSE_CHOICES,
          }))),
      h("div", null,
        F.benchHead("H4", "Remediation — order the four actions"),
        seqDrill({
          stateKey: "seqHard", steps: F.SEQ_HARD, action: "seqHard", clearAction: "seqHardClear",
          fkPrefix: "hseq-", stepNoun: "remediation step", emptyText: "sequence empty — order matters",
        })));
  }

  function runbookBench() {
    var s = state();
    var pills = s.env.runbook.length === 0
      ? h("span", { class: "seq-empty" }, "runbook empty — execute in order")
      : s.env.runbook.map(function (id, i) {
        var step = F.RUNBOOK_STEPS.find(function (x) { return x.id === id; });
        return F.seqPill(i + 1, step.label);
      });
    return h("div", null,
      F.benchHead("H5", "Patch runbook — six clean steps, two traps"),
      s.env.runbookTrap ? h("div", { class: "trap-alert", role: "alert" },
        iconEl("AlertTriangle", 14, "text-destructive"),
        h("p", null, "Sequence voided — a trap step went into the runbook. Reset and rebuild. Traps are the moves that cause outages or compliance breaches; professionals never touch them.")) : null,
      h("div", { class: "seq-pillbox", "aria-live": "polite" }, pills),
      h("ul", { class: "seq-steps" },
        F.RUNBOOK_STEPS.map(function (st) {
          var used = s.env.runbook.indexOf(st.id) !== -1;
          return h("li", null, F.button({
            variant: "outline", disabled: used, fk: "rb-" + st.id,
            ariaLabel: "Execute runbook step: " + st.label,
            className: cn("seq-step", st.trap && "seq-step-trap", used && (st.trap ? "seq-step-tripped" : "seq-step-used")),
            onClick: function () { F.dispatch({ t: "runbook", stepId: st.id }); },
            children: st.label,
          }));
        })),
      F.button({
        variant: "outline", size: "sm", className: "seq-reset",
        onClick: function () { F.dispatch({ t: "runbookClear" }); },
        children: [iconEl("RotateCcw", 11), "Reset runbook"],
      }));
  }

  function auditIsoBench() {
    var s = state();
    return h("div", { class: "bench-stack-sm" },
      F.benchHead("H6", "Isolation audit — boundary per workload"),
      F.AUDIT_ROWS.map(function (r) {
        return h("div", { class: "bench-card" },
          h("div", { class: "bench-card-trait" }, r.workload),
          h("div", { class: "bench-card-context" }, r.context),
          h("div", { class: "select-stack" },
            F.foundrySelect({
              compact: true, label: "Boundary", value: s.env.auditIso[r.id] || "",
              onChange: function (v) { F.dispatch({ t: "setIso", rowId: r.id, val: v }); },
              choices: F.AUDIT_CHOICES,
            })));
      }));
  }

  function scaleBench() {
    var s = state();
    return h("div", null,
      F.benchHead("H7", "Scale call — one move, justified"),
      h("ul", { class: "feed-list scale-telemetry" },
        F.SCALE_TELEMETRY.map(function (t) { return h("li", null, "▸ " + t); })),
      h("div", { class: "scale-choices" },
        F.SCALE_CHOICES.map(function (c) {
          var sel2 = s.env.scaleChoice === c.id;
          return F.button({
            variant: "outline", ariaPressed: sel2, fk: "scale-" + c.id,
            className: cn("scale-choice", sel2 && "scale-choice-selected"),
            onClick: function () { F.dispatch({ t: "setScale", part: "choice", val: c.id }); },
            children: c.text,
          });
        })),
      h("div", { class: "select-stack" },
        F.foundrySelect({
          compact: true, label: "Why this move", value: s.env.scaleWhy,
          onChange: function (v) { F.dispatch({ t: "setScale", part: "why", val: v }); },
          choices: F.SCALE_WHY,
        })));
  }

  function faasBench() {
    var s = state();
    return h("div", null,
      F.benchHead("H8", "FaaS fit — tick the two true functions"),
      h("ul", { class: "faas-list" },
        F.FAAS_JOBS.map(function (j) {
          var sel2 = s.env.faasSel.indexOf(j.id) !== -1;
          return h("li", null, F.button({
            variant: "outline", ariaPressed: sel2, fk: "faas-" + j.id,
            className: cn("faas-row", sel2 && "faas-row-selected"),
            onClick: function () { F.dispatch({ t: "toggleFaas", jobId: j.id }); },
            children: [
              h("span", { class: cn("faas-tick", sel2 && "faas-tick-on"), "aria-hidden": "true" },
                sel2 ? iconEl("CheckCircle2", 11) : null),
              h("span", null,
                h("span", { class: "faas-job" }, j.job),
                h("span", { class: "faas-detail" }, j.detail)),
            ],
          }));
        })),
      h("div", { class: "select-stack" },
        F.foundrySelect({
          compact: true, label: "The exile: where does the untrusted code-execution service belong?",
          value: s.env.faasExile,
          onChange: function (v) { F.dispatch({ t: "setExile", val: v }); },
          choices: F.FAAS_EXILE_CHOICES,
        })));
  }

  function tenancyBench() {
    var s = state();
    return h("div", { class: "bench-stack-sm" },
      F.benchHead("H9", "Tenancy design — enablers + residual risk"),
      F.TENANCY_ROWS.map(function (r) {
        return h("div", { class: "bench-card" },
          h("div", { class: "bench-card-trait" }, r.trait),
          F.foundrySelect({
            compact: true, label: "Enabled by", value: s.env.tenancy[r.id] || "",
            onChange: function (v) { F.dispatch({ t: "setTenancy", rowId: r.id, val: v }); },
            choices: F.ROLE_OPTIONS.map(function (o) { return { id: o.id, text: o.text }; }),
          }));
      }),
      h("div", { class: "risk-callout" },
        h("div", { class: "risk-callout-head" },
          iconEl("Lock", 11), "Residual risk — what remains even when the design is perfect?"),
        F.foundrySelect({
          compact: true, label: "Pick the answer a defender signs", value: s.env.riskPick,
          onChange: function (v) { F.dispatch({ t: "setRisk", val: v }); },
          choices: F.TENANCY_RISK_CHOICES,
        })));
  }
})(window.Foundry = window.Foundry || {});
